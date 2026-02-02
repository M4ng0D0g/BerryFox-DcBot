# 使用 Node.js 官方 LTS 版本作為基底
FROM node:20-slim

# 設定容器內的資料夾
WORKDIR /app

# 先複製 package 檔案以利用快取優化 (提升之後構建的速度)
COPY package*.json ./

# 安裝必要的生產環境套件
RUN npm install

# 複製其餘程式碼
COPY . .

# 將 TS 編譯為 JS (如果你的啟動指令是跑 JS 的話，這步很重要)
RUN npm run build

# 啟動機器人
CMD ["npm", "start"]