import OpenAI from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const openaiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
const provider = process.env.LLM_PROVIDER || 'openai';

if (!openaiKey && !geminiKey) {
  console.warn('No LLM API key found (OPENAI_API_KEY or GOOGLE_GEMINI_API_KEY). Using deterministic fallback for embeddings.');
}

let openaiClient: any = null;
let geminiClient: any = null;

function getOpenAIClient() {
  if (!openaiClient && openaiKey) {
    openaiClient = new OpenAI({ apiKey: openaiKey });
  }
  return openaiClient;
}

function getGeminiClient() {
  if (!geminiClient && geminiKey) {
    geminiClient = new GoogleGenerativeAI(geminiKey);
  }
  return geminiClient;
}

export async function chatCompletion(payload: any) {
  const messages = payload.messages || [];
  
  // Use Gemini if configured
  if (provider === 'gemini') {
    const client = getGeminiClient();
    if (!client) throw new Error('GOOGLE_GEMINI_API_KEY missing for Gemini');
    
    // Find system message and user/assistant messages separately
    const systemMsg = messages.find((m: any) => m.role === 'system')?.content || '';
    const chatMessages = messages.filter((m: any) => m.role !== 'system');
    
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemMsg || undefined,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    
    const history = chatMessages
      .slice(0, -1)
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    
    const lastMsg = chatMessages[chatMessages.length - 1];
    const userContent = lastMsg?.content || 'Continue conversation';
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userContent);
    const responseText = result.response.text();
    
    return { content: responseText };
  }
  
  // Fall back to OpenAI
  const client = getOpenAIClient();
  if (!client) throw new Error('OPENAI_API_KEY missing for chatCompletion');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const resp = await client.chat.completions.create({ model, ...payload });
  return resp.choices?.[0]?.message ?? resp;
}

// deterministic fallback embedding generator for tests without API key
function deterministicEmbedding(input: string, dim = 64) {
  const out: number[] = new Array(dim).fill(0);
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    out[i % dim] = (out[i % dim] ?? 0) + (c % 100) / 100;
  }
  // normalize
  const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) + 1e-8;
  return out.map((v) => v / norm);
}

export async function createEmbedding(input: string) {
  // Use Gemini embeddings if configured
  if (provider === 'gemini') {
    const client = getGeminiClient();
    if (!client) return deterministicEmbedding(input);
    
    const model = client.getGenerativeModel({ model: 'embedding-001' });
    try {
      const result = await model.embedContent(input);
      const embedding = result.embedding?.values;
      if (!embedding) return deterministicEmbedding(input);
      return embedding;
    } catch (e) {
      console.warn('Gemini embedding failed, using fallback:', (e as any).message);
      return deterministicEmbedding(input);
    }
  }
  
  // Fall back to OpenAI embeddings
  const client = getOpenAIClient();
  if (!client) return deterministicEmbedding(input);
  
  const resp = await client.embeddings.create({ model: 'text-embedding-3-large', input });
  return resp.data?.[0]?.embedding ?? deterministicEmbedding(input);
}
