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

# 複製必要的程式碼檔案（不複製 .env）
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/
COPY scripts ./scripts/

# 編譯 TypeScript 為 JavaScript
RUN npm run build

# 生成 Prisma client（在運行時使用）
RUN npx prisma generate || true

# 啟動機器人
CMD ["npm", "start"]