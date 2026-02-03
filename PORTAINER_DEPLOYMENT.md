# Portainer 部署指南 - BerryFox Discord Bot

## 前置準備

### 1. 安裝 Portainer（如果還未安裝）

```bash
# Docker 環境下運行
docker run -d -p 8000:8000 -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

訪問：https://localhost:9443 (初次設定)

---

## 方案一：透過 Git 和環境變數（推薦）

### 步驟 1：推送程式碼到 Git（不含 .env）

```bash
# 確保 .env 在 .gitignore 中
echo ".env" >> .gitignore

# 推送到 GitHub/GitLab 等
git add .
git commit -m "Deploy to Portainer"
git push origin main
```

### 步驟 2：在 Portainer 中建立 Stack

1. **進入 Portainer → Environments → Select Your Environment**
2. **左側選單 → Stacks → Add Stack**
3. **選擇 "Git Repository"**
   - Repository URL: `https://github.com/你的用戶名/BerryFox.git`
   - Compose path: `docker-compose.yml`
   - Git credentials: 如果是私有倉庫，輸入帳密

### 步驟 3：設定環境變數

在 Stack 編輯頁面，找到 **"Environment variables"** 區段，添加：

```
TOKEN=你的Discord_Token
GOOGLE_GEMINI_API_KEY=你的Gemini_API金鑰
LLM_PROVIDER=gemini
DATABASE_URL=file:./prisma/dev.db
REDIS_URL=redis://redis:6379
```

**關鍵：** 
- 不要將敏感資訊放在 docker-compose.yml
- 敏感資訊只在 Portainer 的環境變數中設定

### 步驟 4：部署

1. 點擊 **"Deploy Stack"**
2. 等待容器啟動（通常 2-5 分鐘）
3. 進入 **Containers** 查看日誌確認成功

---

## 方案二：透過 docker-compose.yml 上傳（簡單方式）

### 步驟 1：在 Portainer 上傳檔案

1. **Portainer → Stacks → Add Stack**
2. **選擇 "Editor" → 貼上或上傳 docker-compose.yml**
3. **環境變數設定同上**

### 步驟 2：建立 .env.example（推薦做法）

在 Git 倉庫中建立 `.env.example`（不含實際金鑰）：

```env
TOKEN=your_discord_bot_token_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
LLM_PROVIDER=gemini
DATABASE_URL=file:./prisma/dev.db
REDIS_URL=redis://redis:6379
```

---

## 安全最佳實踐

### ❌ 不要做的事：

```dockerfile
# ❌ 不要硬編碼金鑰到 Dockerfile
ENV GOOGLE_GEMINI_API_KEY=sk-xxx

# ❌ 不要上傳 .env 到 Git
git add .env  # 絕對禁止！
```

### ✅ 正確做法：

```dockerfile
# ✅ 透過環境變數注入
ENV GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
```

在 Portainer 中設定：
- Stack → Environment variables → 添加金鑰

---

## Docker Compose 最佳化配置

我們已經將 `docker-compose.yml` 最佳化，支持以下方式設定環境變數：

### 1. 方式 A：`.env` 檔案（本地開發）
```bash
# .env 檔案（本地）
TOKEN=your_token
GOOGLE_GEMINI_API_KEY=your_key
```

### 2. 方式 B：Portainer 環境變數（推薦上線）
在 Portainer UI 中直接設定，優先級最高

### 3. 方式 C：docker-compose.yml 直接設定
```yaml
environment:
  TOKEN: ${TOKEN}
  GOOGLE_GEMINI_API_KEY: ${GOOGLE_GEMINI_API_KEY}
```

---

## 分步驟部署流程

### 完整例子：

```bash
# 1. 在本地測試
docker-compose up -d

# 2. 驗證容器運行
docker-compose logs discord-bot

# 3. 推送至 Git（不含 .env）
git push origin main

# 4. 在 Portainer 中：
# - 新增 Stack（Git Repository）
# - 設定環境變數
# - Deploy

# 5. 監控日誌
# Portainer UI → Containers → berry-fox-bot → Logs
```

---

## 常見問題

### Q: 環境變數沒有被讀取？
**A:** 檢查優先級：
1. 確認 `process.env.VARIABLE_NAME` 在程式碼中正確引用
2. 在 Portainer 中重新設定環境變數
3. 重啟容器（Stack → Restart）

### Q: .env 檔案在 Docker 中看不到？
**A:** Dockerfile 已配置 `COPY .env* ./`，確保：
1. `.env` 在本地根目錄存在（如使用 Git 方式則不需要）
2. 使用 `env_file:` 在 docker-compose.yml 中引用

### Q: 如何更新環境變數？
**A:** 在 Portainer 中：
1. Stacks → 選擇 Stack → Edit
2. 修改 Environment variables
3. 點擊 "Update the Stack"
4. 容器會自動重啟

### Q: Discord Bot 無法連接？
**A:** 檢查：
1. `TOKEN` 是否正確設定
2. Discord 應用程式權限
3. 容器日誌：`docker logs berry-fox-bot`

---

## 推薦部署架構

```
GitHub Repository
    ↓
    ├─ docker-compose.yml (公開)
    ├─ Dockerfile (公開)
    ├─ src/ (公開)
    └─ .env.example (公開範例)
    
         ↓
    
Portainer Web UI
    ├─ Git Pull
    ├─ 環境變數注入 (私密)
    └─ Deploy Container
         ↓
    Docker Container (生產環境)
```

---

## 下一步

1. **推送到 Git**（不含 .env）
2. **在 Portainer 中建立 Stack**
3. **設定敏感環境變數**
4. **監控容器日誌確認運作**

有問題時檢查容器日誌：
```bash
docker logs -f berry-fox-bot
```
