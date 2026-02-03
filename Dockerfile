# 使用 Node.js 官方 LTS 版本作為基底
FROM node:20-slim

# 設定容器內的資料夾
WORKDIR /app

# Install system dependencies needed by Prisma (OpenSSL)
RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends openssl libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 先複製 package 檔案以利用快取優化 (提升之後構建的速度)
COPY package*.json ./

# 安裝必要的套件（包含 devDeps，確保 build 時能執行 tsc）
RUN npm install

# 複製其餘程式碼和環境變數
COPY .env* ./
COPY . .

# 生成 Prisma client（確保 @prisma/client 在容器內可正常使用）
# 這會在 node_modules/.prisma 下建立需要的檔案
RUN npx prisma generate || npm run prisma:generate || true

# 套用 migrations（非互動式）並嘗試執行 dev migration 作為備援
RUN npx prisma migrate deploy || npm run prisma:migrate || true

# (開發用) 啟動 seed，失敗也不會導致 build 掛掉
RUN npm run db:seed || true

# 將 TS 編譯為 JS (如果你的啟動指令是跑 JS 的話，這步很重要)
RUN npm run build

# 啟動機器人
CMD ["npm", "start"]