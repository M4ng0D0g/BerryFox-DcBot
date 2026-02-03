import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('generate handlers script', () => {
  const handlersDir = path.resolve(process.cwd(), 'src/handlers');
  const testName = `gen_test_${Date.now()}`;

  beforeAll(() => {
    if (!fs.existsSync(handlersDir)) fs.mkdirSync(handlersDir, { recursive: true });
  });

  afterAll(() => {
    const file = path.join(handlersDir, `${testName}.ts`);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    const tfile = path.resolve(process.cwd(), `tests/handlers/${testName}.test.ts`);
    if (fs.existsSync(tfile)) fs.unlinkSync(tfile);
  });

  test('scaffolds handler & test for a created ApiEndpoint', async () => {
    // insert a fake endpoint in DB using prisma
    const { prisma } = await import('../src/db.js');
    await prisma.apiEndpoint.create({ data: { name: testName, description: 'desc', spec: { name: testName, parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } } } });
    try {
      const { main } = await import('../scripts/generateHandlers.js');
      await main();
      const file = path.join(handlersDir, `${testName}.ts`);
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, 'utf8');
      expect(content).toContain('autoMap');
    } finally {
      await prisma.apiEndpoint.delete({ where: { name: testName } }).catch(() => {});
    }
  }, 20000);
});
