import { chatCompletion, createEmbedding } from '../llm/client.js';
import { getRecentMessages, findPersonaByName, addMessage, listApiEndpoints, logApiCall, findApiEndpointByName } from './db.js';
import { getFunctionsForModel, executeFunctionByName } from './apiRouter.js';

// Allow tests to override the chat behavior
export const testHelpers: { chatOverride: ((conversationId: number, userMessage: string) => Promise<string | null>) | null } = { chatOverride: null };

// Build messages for the model from persona + recent messages
async function buildMessages(conversationId: number, personaName = 'default') {
  const persona = await findPersonaByName(personaName);
  const messages: any[] = [];
  if (persona?.systemPrompt) {
    messages.push({ role: 'system', content: persona.systemPrompt });
  }

  const recent = await getRecentMessages(conversationId, 20);
  // recent is in desc order; reverse to chronological
  recent.reverse().forEach((m: any) => messages.push({ role: m.role as any, content: m.content }));
  return messages;
}

export async function chatWithModel(conversationId: number, userMessage: string) {
  if (testHelpers.chatOverride) return testHelpers.chatOverride(conversationId, userMessage);

  const messages = await buildMessages(conversationId);
  messages.push({ role: 'user', content: userMessage });

  // dynamically fetch function schemas from DB
  const functions = await getFunctionsForModel();

  // instrument LLM call
  const metrics = await import('../monitor/metrics.js').catch(() => null);
  const start = process.hrtime();
  if (metrics?.llmCalls) metrics.llmCalls.inc();

  // first request: allow function calling
  const assistant = await chatCompletion({ messages, functions });

  // record latency
  if (metrics?.llmLatency) {
    const diff = process.hrtime(start);
    const secs = diff[0] + diff[1] / 1e9;
    metrics.llmLatency.observe(secs);
  }

  // if model requested a function call, execute it and give the result back
  if (assistant.function_call) {
    const { name, arguments: argsStr } = assistant.function_call as any;
    let args = {};
    try { args = JSON.parse(argsStr || '{}'); } catch (e) { /* ignore */ }

    const t0 = process.hrtime();
    const result = await executeFunctionByName(name, args);
    if (metrics?.apiCalls) metrics.apiCalls.inc();

    if (metrics?.apiLatency) {
      const d = process.hrtime(t0);
      metrics.apiLatency.observe(d[0] + d[1] / 1e9);
    }

    // log function call if endpoint known
    try {
      const ep = await findApiEndpointByName(name);
      if (ep) {
        await logApiCall(ep.id, args, result);
      }
    } catch (e) { /* ignore logging errors */ }

    // send function result back to the model to get a final assistant reply
    const followUp = await chatCompletion({
      messages: [
        ...messages,
        { role: 'assistant', content: null, name },
        { role: 'function', name, content: JSON.stringify(result) },
      ],
    });

    return followUp.content ?? (followUp as any).message?.content ?? JSON.stringify(result);
  }

  return assistant.content ?? (assistant as any).message?.content ?? null;
}

export async function createTextEmbedding(text: string) {
  return createEmbedding(text);
}
