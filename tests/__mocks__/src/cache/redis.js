// simple in-memory redis-like mock used in tests
const recent = new Map();

export async function slidingWindowRateLimit(key, limit = 20, windowSeconds = 60) {
  const v = recent.get(key) || [];
  const now = Date.now();
  // drop old
  const cutoff = now - windowSeconds * 1000;
  const filtered = v.filter(t => t > cutoff);
  filtered.push(now);
  recent.set(key, filtered);
  return { ok: filtered.length <= limit, count: filtered.length };
}

export async function getRecentMessagesCache(conversationId) {
  return null;
}

export async function setRecentMessages(conversationId, messages, ttl = 60) {
  // no-op for tests
}
