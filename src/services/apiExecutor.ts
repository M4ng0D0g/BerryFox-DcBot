import { getUserById } from './db.js';

export async function executeApi(name: string, args: any) {
  // Try dynamic handler import from src/handlers/<name>.ts
  try {
    // prefer loaded handlers (use canonical, absolute import so instances are identical)
    const path = await import('path');
    const { pathToFileURL } = await import('url');
    const loaderUrl = pathToFileURL(path.resolve(process.cwd(), 'src', 'services', 'handlerLoader.ts')).href;
    const loader = await import(loaderUrl).catch(() => import(pathToFileURL(path.resolve(process.cwd(), 'src', 'services', 'handlerLoader.js')).href).catch(() => null));
    const h = loader?.getHandler(name);
    if (h) return await h(args);

    let mod = null;
    try {
      // Attempt to import handler by absolute file URL (works reliably in tests and runtime)
      const path = await import('path');
      const { pathToFileURL } = await import('url');
      const tsPath = path.resolve(process.cwd(), 'src', 'handlers', `${name}.ts`);
      try { mod = await import(pathToFileURL(tsPath).href); } catch (e: any) { console.debug('import ts failed', tsPath, e?.message); }
      if (!mod) {
        const jsPath = path.resolve(process.cwd(), 'src', 'handlers', `${name}.js`);
        try { mod = await import(pathToFileURL(jsPath).href); } catch (e: any) { console.debug('import js failed', jsPath, e?.message); }
      }
    } catch (e: any) {
      // fallback to relative imports
      try { mod = await import(`../handlers/${name}.ts`); } catch (e: any) { console.debug('relative import ts failed', e?.message);
        try { mod = await import(`../handlers/${name}.js`); } catch (e2: any) { console.debug('relative import js failed', e2?.message); }
      }
    }

    const fn = mod?.default ?? mod?.handle ?? null;
    if (typeof fn === 'function') {
      return await fn(args);
    }
  } catch (e) {
    // not found or failed to import; fall back to built-in handlers
  }

  // built-in handlers as fallback
  if (name === 'getUser') {
    const user = await getUserById(args.userId);
    if (!user) return { error: 'user_not_found' };
    return { id: user.id, username: user.username };
  }

  // fallback: unknown API
  return { error: 'unknown_api', name };
}
