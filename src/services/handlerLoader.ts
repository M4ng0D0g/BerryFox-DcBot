import fs from 'fs';
import path from 'path';

const handlersDir = path.resolve(process.cwd(), 'src/handlers');
const handlers = new Map<string, Function>();

export async function loadHandlers() {
  if (!fs.existsSync(handlersDir)) return;
  const files = fs.readdirSync(handlersDir).filter((f) => f.endsWith('.js') || f.endsWith('.ts'));
  for (const f of files) {
    const name = path.basename(f, path.extname(f));
    try {
      const mod = await import(`../handlers/${name}.js`).catch(() => import(`../handlers/${name}.ts`).catch(() => null));
      const fn = mod?.default ?? mod?.handle ?? null;
      if (typeof fn === 'function') handlers.set(name, fn);
    } catch (e) {
      console.warn('Failed loading handler', name, e);
    }
  }
  console.log('Handlers loaded:', Array.from(handlers.keys()));
}

export function getHandler(name: string) {
  return handlers.get(name) ?? null;
}

export async function ensureHandlersFromSpec(specs: Array<any>) {
  // Create simple scaffolds for missing handlers (dev convenience)
  for (const s of specs) {
    const name = s.name;
    const fileTs = path.join(handlersDir, `${name}.ts`);
    if (!fs.existsSync(fileTs)) {
      const tpl = `import { /* add imports */ } from '../services/db.js';

export default async function handle(args: any) {
  // TODO: implement handler for ${name}
  return { error: 'unimplemented', name: '${name}' };
}
`; 
      fs.mkdirSync(handlersDir, { recursive: true });
      fs.writeFileSync(fileTs, tpl);
      console.log('Scaffolded handler:', fileTs);
    }
  }
}
