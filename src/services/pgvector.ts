import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function ensurePgvectorTable() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS embeddings_pg (
        id SERIAL PRIMARY KEY,
        ref_type TEXT,
        ref_id INTEGER,
        vector VECTOR(1536)
      );
    `);
  } finally {
    client.release();
  }
}

export async function indexVector(refType: string, refId: number, vector: number[]) {
  const client = await pool.connect();
  try {
    const { Vector } = await import('pgvector/pg');
    const v = Vector.fromArray(vector);
    await client.query('INSERT INTO embeddings_pg (ref_type, ref_id, vector) VALUES ($1,$2,$3)', [refType, refId, v]);
  } finally {
    client.release();
  }
}

export async function queryNearest(refType: string, vector: number[], topK = 5) {
  const client = await pool.connect();
  try {
    const { Vector } = await import('pgvector/pg');
    const v = Vector.fromArray(vector);
    const res = await client.query(
      `SELECT ref_id, vector <-> $2 AS distance FROM embeddings_pg WHERE ref_type = $1 ORDER BY vector <-> $2 LIMIT $3`,
      [refType, v, topK]
    );
    return res.rows.map((r: any) => ({ refId: r.ref_id, distance: r.distance }));
  } finally {
    client.release();
  }
}
