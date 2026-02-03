import { executeApi } from '../src/services/apiExecutor.js';
import { loadHandlers } from '../src/services/handlerLoader.js';
import fs from 'fs';
import path from 'path';

describe('api executor', () => {
  test('loads dynamic handler if exists', async () => {
    const handlersDir = path.resolve(process.cwd(), 'src/handlers');
    if (!fs.existsSync(handlersDir)) fs.mkdirSync(handlersDir, { recursive: true });
    const file = path.join(handlersDir, 'test_dynamic.js');
    fs.writeFileSync(file, `export default async function handle(args){ return { ok: true, args }; }`);
    // ensure the loader picks up new handler
    await loadHandlers();
    const res = await executeApi('test_dynamic', { x: 1 });
    expect(res).toHaveProperty('ok', true);
    fs.unlinkSync(file);
  });
});