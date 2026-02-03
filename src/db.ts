let prisma: any;
// Ensure DATABASE_URL has a sensible default for local development so Prisma won't fail when .env isn't provided to the container
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
  console.warn('DATABASE_URL not set. Falling back to local SQLite at prisma/dev.db');
}
try {
  const mod = await import('@prisma/client');
  const PrismaClient = mod?.PrismaClient;
  prisma = new PrismaClient();
} catch (e: any) {
  console.warn('@prisma/client is not available or not generated. Falling back to a stubbed prisma that will throw on use. Error:', e?.message ?? e);
  const makeThrowingModel = () => new Proxy({}, {
    get(_t, _p) {
      return async () => { throw new Error('@prisma/client not initialized. Run `npx prisma generate` or provide a working database.'); };
    }
  });
  prisma = new Proxy({}, {
    get() {
      return makeThrowingModel();
    }
  });
}

export { prisma };
