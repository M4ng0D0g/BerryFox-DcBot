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

# 安裝所有依賴（包括 devDependencies 用於編譯）
RUN npm ci

# 複製編譯好的源代碼（假設在本地已編譯）
# 或在此複製 src 和編譯
COPY tsconfig.json ./
COPY src ./src/
COPY prisma ./prisma/
COPY scripts ./scripts/

# 編譯 TypeScript 為 JavaScript
RUN npm run build && \
    npx prisma generate || true

# 清理：只保留 production 依賴
RUN npm ci --only=production && \
    npm cache clean --force

# 啟動機器人
CMD ["node", "dist/src/index.js"]