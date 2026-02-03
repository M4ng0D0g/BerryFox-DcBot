import { ensurePgvectorTable } from '../src/services/pgvector.js';

async function main() {
  try {
    await ensurePgvectorTable();
    console.log('pgvector initialized');
  } catch (e) {
    console.error('pgvector init failed', e);
    process.exit(1);
  }
}

main();
