import express from 'express';
import { getRateMetrics } from '../cache/redis.js';

const app = express();
app.use(express.json());

app.get('/health', (req: any, res: any) => res.json({ ok: true }));

app.get('/rate/:key', async (req: any, res: any) => {
  const key = req.params.key;
  const data = await getRateMetrics(key);
  res.json(data);
});

app.get('/metrics', async (req: any, res: any) => {
  try {
    const m = await (await import('./metrics.js')).metricsEndpoint();
    res.set('Content-Type', 'text/plain');
    res.send(m);
  } catch (e: any) {
    console.error('metrics error', e?.message ?? e);
    res.status(500).send('metrics error');
  }
});

export function startMonitor(port = 3001) {
  const p = Number(process.env.MONITOR_PORT || port);
  app.listen(p, () => console.log(`Monitor listening on http://localhost:${p}`));
}
