import { ensureHandlersFromSpec } from '../src/services/handlerLoader.js';
import fs from 'fs';
import path from 'path';

describe('handler loader scaffold', () => {
  const handlersDir = path.resolve(process.cwd(), 'src/handlers');
  const testSpec = [{ name: 'test_handler' }];

  afterAll(() => {
    const file = path.join(handlersDir, 'test_handler.ts');
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });

  test('scaffolds missing handler', async () => {
    await ensureHandlersFromSpec(testSpec as any);
    const file = path.join(handlersDir, 'test_handler.ts');
    expect(fs.existsSync(file)).toBe(true);
    const content = fs.readFileSync(file, 'utf8');
    expect(content).toContain('TODO: implement handler');
  });
});
