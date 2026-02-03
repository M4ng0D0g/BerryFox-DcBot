import { createEmbedding } from '../llm/client.js';
import { saveEmbedding, getEmbeddingsByType } from './db.js';
import { indexVector, queryNearest, ensurePgvectorTable } from './pgvector.js';

const usePgvector = !!process.env.USE_PGVECTOR;

export async function initEmbeddings() {
  if (usePgvector) {
    await ensurePgvectorTable();
  }
}

export async function indexText(refType: string, refId: number, text: string) {
  const vector = await createEmbedding(text);
  if (!vector) return null;
  // vector is array of numbers
  if (usePgvector) {
    await indexVector(refType, refId, vector as number[]);
  } else {
    await saveEmbedding(refType, refId, vector as number[]);
  }
  return vector;
}

function cosine(a: number[], b: number[]) {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { const ai = a[i] ?? 0; const bi = b[i] ?? 0; dot += ai * bi; na += ai * ai; nb += bi * bi; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export async function nearestNeighbors(refType: string, vector: number[], topK = 5) {
  if (usePgvector) {
    return queryNearest(refType, vector as number[], topK);
  }

  const rows = await getEmbeddingsByType(refType);
  const scored = rows.map((r: any) => {
    const v = JSON.parse(r.vector || '[]');
    const vec = Array.isArray(v) ? (v as number[]) : [];
    return { id: r.id, refId: r.refId, score: cosine(vector, vec), vector: vec };
  });
  scored.sort((a: {score:number}, b: {score:number}) => b.score - a.score);
  return scored.slice(0, topK);
}
