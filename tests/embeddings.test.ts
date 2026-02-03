import { indexText, nearestNeighbors, initEmbeddings } from '../src/services/embeddings.js';
import { prisma } from '../src/db.js';

describe('embeddings nearest neighbor (in-memory)', () => {
  beforeAll(async () => {
    await prisma.embedding.deleteMany({});
  });

  test('index and find', async () => {
    // index two similar texts and one different text
    const v1 = await indexText('test', 1, 'hello world');
    const v2 = await indexText('test', 2, 'hello there');
    const v3 = await indexText('test', 3, 'completely different stuff');
    expect(v1).toBeTruthy();
    const neighbors = await nearestNeighbors('test', v1 as number[], 3);
    expect(neighbors.length).toBeGreaterThanOrEqual(2);
    // top neighbor should be either refId 1 or 2
    expect([1,2]).toContain(neighbors[0].refId);
  }, 20000);
});