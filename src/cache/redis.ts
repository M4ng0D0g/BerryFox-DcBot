import IORedis from 'ioredis';
const RedisClient: any = IORedis as any;

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// In-memory fallback for when Redis is not available in the environment (e.g., local docker without a redis service)
class InMemoryRedis {
  private strings = new Map<string, { value: string; expiresAt?: number }>();
  private zsets = new Map<string, Array<{ score: number; member: string }>>();

  async incr(key: string) {
    const now = Date.now();
    const entry = this.strings.get(key);
    if (!entry || (entry.expiresAt && entry.expiresAt <= now)) {
      this.strings.set(key, { value: '1' });
      return 1;
    }
    const n = Number(entry.value || '0') + 1;
    entry.value = String(n);
    return n;
  }
  async expire(key: string, seconds: number) {
    const entry = this.strings.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }
  async ttl(key: string) {
    const entry = this.strings.get(key);
    if (!entry || !entry.expiresAt) return -1;
    const rem = Math.max(-1, Math.floor((entry.expiresAt - Date.now()) / 1000));
    return rem;
  }

  async zremrangebyscore(key: string, min: number, max: number) {
    const arr = this.zsets.get(key) || [];
    const filtered = arr.filter((x) => x.score < min || x.score > max);
    this.zsets.set(key, filtered);
    return;
  }
  async zadd(key: string, score: number, member: string) {
    const arr = this.zsets.get(key) || [];
    arr.push({ score, member });
    arr.sort((a, b) => a.score - b.score);
    this.zsets.set(key, arr);
    return arr.length;
  }
  async zcard(key: string) {
    const arr = this.zsets.get(key) || [];
    return arr.length;
  }
  async zrange(key: string, start: number, end: number) {
    const arr = this.zsets.get(key) || [];
    const slice = arr.slice(start, end === -1 ? undefined : end + 1);
    return slice.map((x) => x.member);
  }

  async set(key: string, value: string, mode?: string, ttl?: number) {
    const entry: any = { value };
    if (mode === 'EX' && ttl) {
      entry.expiresAt = Date.now() + ttl * 1000;
    }
    this.strings.set(key, entry);
    return 'OK';
  }
  async get(key: string) {
    const entry = this.strings.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.strings.delete(key);
      return null;
    }
    return entry.value;
  }
}

let redis: any;
let usingFallback = false;
try {
  redis = new RedisClient(redisUrl);
  // Capture errors to avoid an unhandled error event which crashes the process
  redis.on('error', (err: any) => {
    if (!usingFallback) {
      console.warn('[ioredis] connection error, switching to in-memory fallback', err && err.message ? err.message : err);
      usingFallback = true;
      redis = new InMemoryRedis();
    }
    // otherwise suppress repeating logs to avoid flooding stdout
  });
} catch (e: any) {
  console.warn('Redis client initialization failed, using in-memory fallback', e && e.message ? e.message : e);
  redis = new InMemoryRedis();
  usingFallback = true;
}

export { redis };

export async function rateLimit(key: string, limit = 20, windowSeconds = 60) {
  const k = `rate:${key}`;
  const val = await redis.incr(k);
  if (val === 1) {
    await redis.expire(k, windowSeconds);
  }
  const remaining = Math.max(0, limit - val);
  return { ok: val <= limit, remaining, ttl: await redis.ttl(k) };
}

// Sliding window rate limiter: records timestamps in a sorted set
export async function slidingWindowRateLimit(key: string, limit = 20, windowSeconds = 60) {
  const k = `rate:sliding:${key}`;
  const now = Date.now();
  const min = now - windowSeconds * 1000;
  await redis.zremrangebyscore(k, 0, min);
  await redis.zadd(k, now, String(now));
  await redis.expire(k, windowSeconds + 5);
  const count = await redis.zcard(k);
  const ok = count <= limit;
  if (!ok) {
    // metrics
    try { (await import('../monitor/metrics.js')).rateLimitHits.inc(); } catch (e: any) { }
  }
  return { ok, count, remaining: Math.max(0, limit - count) };
}

export async function getRateMetrics(key: string) {
  const k = `rate:sliding:${key}`;
  const count = await redis.zcard(k);
  const range = await redis.zrange(k, 0, -1);
  return { count, samples: range.slice(-10) };
}

export async function setRecentMessages(conversationId: number, messages: any[], ttl = 60) {
  const k = `conv:${conversationId}:recent`;
  await redis.set(k, JSON.stringify(messages), 'EX', ttl);
}

export async function getRecentMessagesCache(conversationId: number) {
  const k = `conv:${conversationId}:recent`;
  const str = await redis.get(k);
  if (!str) return null;
  try { return JSON.parse(str); } catch (e) { return null; }
}
