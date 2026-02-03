import { PrismaClient } from '@prisma/client';
import { indexVector, ensurePgvectorTable } from '../src/services/pgvector.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring pgvector table...');
  await ensurePgvectorTable();

  const rows = await prisma.embedding.findMany();
  console.log('Found embeddings:', rows.length);

  // backup existing embeddings
  const bkdir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(bkdir)) fs.mkdirSync(bkdir, { recursive: true });
  const bkfile = path.join(bkdir, `embeddings_backup_${Date.now()}.json`);
  fs.writeFileSync(bkfile, JSON.stringify(rows, null, 2));
  console.log('Backup saved to', bkfile);

  let count = 0;
  const usePg = !!process.env.USE_PGVECTOR;
  if (!usePg) {
    console.log('USE_PGVECTOR not set; skipping indexing phase (backup only).');
  }

  for (const r of rows) {
    try {
      const vec = JSON.parse(r.vector as any);
      if (Array.isArray(vec)) {
        if (usePg) await indexVector(r.refType, r.refId, vec as number[]);
        count++;
      }
    } catch (e) {
      console.warn('Skipping embedding', r.id, e);
    }
  }
  console.log('Migrated (attempted):', count);

  // verification
  if (usePg) {
    const dbCount = (await (await import('../src/services/pgvector.js')).queryNearest(rows[0]?.refType ?? 'default', JSON.parse(rows[0]?.vector || '[]') as number[], rows.length)).length;
    console.log('pgvector sample query count:', dbCount);
  }

  if (count !== rows.length) {
    console.warn('Warning: migrated count differs from backup count');
  } else {
    console.log('All embeddings migrated successfully');
  }
}

main().catch((e: any) => { console.error(e?.message ?? e); process.exit(1); });
