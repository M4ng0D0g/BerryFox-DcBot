// In-memory mock prisma for tests
const db = {
  personas: [],
  conversations: [],
  messages: [],
  apiEndpoints: [],
  embeddings: [],
};

let id = 1;
function nextId() { return id++; }

export const prisma = {
  persona: {
    create: async ({ data }) => {
      const obj = { id: nextId(), ...data };
      db.personas.push(obj);
      return obj;
    },
    findUnique: async ({ where }) => db.personas.find(p => p.name === where?.name) ?? null,
    findMany: async () => db.personas.slice(),
    delete: async ({ where }) => {
      const i = db.personas.findIndex(p => p.name === where?.name);
      if (i === -1) throw new Error('not found');
      const [r] = db.personas.splice(i, 1);
      return r;
    }
  },
  conversation: {
    create: async ({ data }) => {
      const obj = { id: nextId(), ...data };
      db.conversations.push(obj);
      return obj;
    }
  },
  message: {
    create: async ({ data }) => {
      const obj = { id: nextId(), ...data, createdAt: new Date() };
      db.messages.push(obj);
      return obj;
    },
    findMany: async ({ where, orderBy, take } = {}) => {
      let res = db.messages.filter(m => m.conversationId === where?.conversationId);
      // default sort desc by createdAt
      res = res.sort((a,b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
      if (take) res = res.slice(0, take);
      return res;
    }
  },
  apiEndpoint: {
    create: async ({ data }) => { const obj = { id: nextId(), ...data }; db.apiEndpoints.push(obj); return obj; },
    findMany: async () => db.apiEndpoints.slice(),
    findUnique: async ({ where }) => db.apiEndpoints.find(e => e.name === where?.name) ?? null,
    delete: async ({ where }) => { const i = db.apiEndpoints.findIndex(e => e.name === where?.name); if (i===-1) throw new Error('not found'); return db.apiEndpoints.splice(i,1)[0]; },
    // helper for tests
    _reset: async () => { db.apiEndpoints.length = 0; }
  },
  embedding: {
    create: async ({ data }) => { const obj = { id: nextId(), ...data }; db.embeddings.push(obj); return obj; },
    findMany: async ({ where }) => db.embeddings.filter(e => e.refType === where?.refType),
    _reset: async () => { db.embeddings.length = 0; }
  },
  user: {
    findUnique: async ({ where }) => null
  }
};

export function __resetMockDB() { db.personas.length = 0; db.conversations.length = 0; db.messages.length = 0; db.apiEndpoints.length = 0; db.embeddings.length = 0; id = 1; }
