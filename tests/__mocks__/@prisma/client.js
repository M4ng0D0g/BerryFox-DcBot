const GLOBAL_KEY = '__PRISMA_MOCK_DATA__';

if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = { apiEndpoint: [], persona: [], embedding: [] };
}

export class PrismaClient {
  constructor() {
    this._data = globalThis[GLOBAL_KEY];
    this.apiEndpoint = this._makeModel('apiEndpoint');
    this.persona = this._makeModel('persona');
    this.embedding = this._makeModel('embedding');
  }
  _makeModel(name) {
    return {
      create: async ({ data }) => {
        const item = Object.assign({ id: Date.now() }, data);
        this._data[name].push(item);
        return item;
      },
      deleteMany: async () => { this._data[name] = []; return { count: 0 }; },
      delete: async ({ where }) => {
        const key = Object.keys(where)[0];
        const val = where[key];
        this._data[name] = this._data[name].filter((i) => i[key] !== val && i.name !== val);
        return { count: 1 };
      },
      findMany: async () => {
        return this._data[name];
      }
    };
  }
}

