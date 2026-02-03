
### Use this cmd to compile

```powershell
npm run build
docker compose build
```

then Recreate container on Portainer

> docker compose up -d --build

---

## Database (Prisma + SQLite) 🔧

Development uses SQLite. After pulling changes, run:

1. Install the new deps:

```powershell
npm install
```

2. Generate Prisma Client:

```powershell
npm run prisma:generate
```

3. Run migration (creates `prisma/dev.db`):

```powershell
npm run prisma:migrate
```

4. Seed sample data:

```powershell
npm run db:seed
```

5. Open Prisma Studio:

```powershell
npm run prisma:studio
```

Database file is `.gitignore`d as `prisma/dev.db`.

---

## LLM（OpenAI）設定 🔑

在 `.env` 中新增：

```
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

請備註：根據你使用的模型（是否支援 function-calling）調整 `OPENAI_MODEL`。
---

## Redis (short-term cache & rate-limiting) 🔁

Set in `.env`:

```
REDIS_URL=redis://localhost:6379
ENABLE_MONITOR=true
MONITOR_PORT=3001
```

We use Redis to cache recent messages per conversation and perform simple per-user rate limiting. A small monitoring HTTP endpoint is available at `/rate/:key` when `ENABLE_MONITOR=true`.

## RAG / Embeddings (prototype)

Embeddings are stored locally in the `Embedding` model (JSON vector). For production-grade retrieval you can enable Postgres + `pgvector`:

1. Switch `DATABASE_URL` to a Postgres DB and set `USE_PGVECTOR=true` in `.env`.
2. Ensure the `vector` extension is available on your Postgres server.
3. On startup, the app will create `embeddings_pg` table (if needed) and use it for similarity search.

To generate handler scaffolds for `ApiEndpoint` rows, run:

```powershell
npm run generate:handlers
```

To deploy slash commands to a guild (for dev):

```powershell
# set CLIENT_ID (your bot application id) and GUILD_ID (dev guild id) in .env
npm run deploy:commands
```

**Additional commands**

- `/persona-delete name` — delete a persona
- `/endpoint-update name spec` — update an endpoint spec (JSON)
- `/embeddings-batch-index ref_type ref_id texts` — index multiple texts separated by `||`
To initialize pgvector in Postgres (if using `USE_PGVECTOR=true`):

```powershell
npm run pgvector:init
```

To run tests locally:

```powershell
npm test
```
