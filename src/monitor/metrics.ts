import client from 'prom-client';

const collectDefault = client.collectDefaultMetrics;
collectDefault();

export const llmCalls = new client.Counter({ name: 'llm_calls_total', help: 'Total LLM calls' });
export const llmLatency = new client.Histogram({ name: 'llm_latency_seconds', help: 'LLM call latency', buckets: [0.05,0.1,0.5,1,2,5] });
export const apiCalls = new client.Counter({ name: 'api_calls_total', help: 'Total API calls' });
export const apiLatency = new client.Histogram({ name: 'api_latency_seconds', help: 'API call latency', buckets: [0.01,0.05,0.1,0.5,1,2] });
export const rateLimitHits = new client.Counter({ name: 'rate_limit_hits_total', help: 'Rate limit hit count' });

export async function metricsEndpoint() {
  return await client.register.metrics();
}
