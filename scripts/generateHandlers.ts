import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { validateFunctionSpec } from '../src/services/specValidator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function renderRuntimeChecks(spec: any) {
  const props = spec.parameters?.properties ?? {};
  const required = new Set(spec.parameters?.required ?? []);
  const checks: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    const t = (v as any).type ?? 'string';
    const cond = `if (args['${k}'] == null) { ${required.has(k) ? `throw new Error('missing param ${k}');` : ''} } else { if (typeof args['${k}'] !== '${t}') throw new Error('param ${k} must be ${t}'); }`;
    checks.push(cond);
  }
  return checks.join('\n  ');
}

export async function main() {
  const endpoints = await prisma.apiEndpoint.findMany();
  const handlersDir = path.resolve(__dirname, '../src/handlers');
  if (!fs.existsSync(handlersDir)) fs.mkdirSync(handlersDir, { recursive: true });

  for (const ep of endpoints) {
    const file = path.join(handlersDir, `${ep.name}.ts`);
    if (fs.existsSync(file)) continue;

    try {
      validateFunctionSpec(ep.spec);
    } catch (e: any) {
      console.warn('Skipping invalid spec for', ep.name, e?.message ?? e);
      continue;
    }

    const checks = renderRuntimeChecks(ep.spec);

    const tpl = `import { /* import dependencies as needed */ } from '../services/db.js';
import { autoMap } from '../src/services/autoMapper.js';

export default async function handle(args: any) {
  // runtime parameter checks
  try {
    ${checks}
  } catch (e) {
    return { error: 'invalid_arguments', message: (e as Error).message };
  }

  // Try automatic mapping for simple cases
  try {
    const auto = await autoMap('${ep.name}', args);
    if (auto) return auto;
  } catch (e) { /* ignore auto mapping errors */ }

  // TODO: implement handler for ${ep.name}
  return { error: 'unimplemented', name: '${ep.name}' };
}
`;
    fs.writeFileSync(file, tpl);

    // generate a basic test template
    const testsDir = path.resolve(__dirname, '../tests/handlers');
    if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });
    const testFile = path.join(testsDir, `${ep.name}.test.ts`);
    const testTpl = `import handler from '../../src/handlers/${ep.name}.js';

describe('handler ${ep.name}', () => {
  test('returns unimplemented by default', async () => {
    const res = await (handler as any)({});
    expect(res).toHaveProperty('error');
  });
});
`;
    fs.writeFileSync(testFile, testTpl);

    console.log('Scaffolded handler and test:', file, testFile);
  }
}

// Export default for tests to call directly; keep CLI behavior for direct execution
if (process.argv[1] && process.argv[1].endsWith('generateHandlers.ts')) {
  main().catch((e: any) => { console.error(e?.message ?? e); process.exit(1); });
}

export default main;
