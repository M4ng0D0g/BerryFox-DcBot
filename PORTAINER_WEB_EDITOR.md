# Portainer Web Editor 部署指南

## 🚀 快速部署步驟

### 步驟 1：在本地構建 Docker 映像

```bash
cd C:\Discord_Bot\BerryFox
docker build -t berryfox:latest .
```

### 步驟 2：在 Portainer 中建立 Stack

1. **開啟 Portainer UI**
   - 訪問：https://localhost:9443
   - 登入你的帳號

2. **進入 Stacks 管理**
   - 左側選單 → **Stacks**
   - 點擊 **Add Stack**

3. **設定 Stack 名稱**
   - Name: `berryfox-bot`

4. **選擇 Web Editor**
   - 選擇 **Web editor** 選項（預設）

### 步驟 3：貼上 Docker Compose 配置

複製以下內容到 Web Editor：

```yaml
version: '3.8'

services:
  discord-bot:
    image: berryfox:latest
    container_name: berry-fox-bot
    restart: unless-stopped
    environment:
      - TOKEN=${TOKEN}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - LLM_PROVIDER=${LLM_PROVIDER}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
    networks:
      - berryfox-network

  redis:
    image: redis:7-alpine
    container_name: berry-fox-redis
    restart: unless-stopped
    networks:
      - berryfox-network

networks:
  berryfox-network:
    driver: bridge
```

### 步驟 4：設定環境變數

⚠️ **關鍵步驟！** 在 Web Editor 下方找到 **"Environment variables"** 區段

點擊 **"Add variable"** 逐個添加（注意：變數名要與 docker-compose.yml 中的一致）：

| 變數名 | 值 | 範例 |
|--------|-----|------|
| `TOKEN` | 你的 Discord Bot Token | `MTQ2NzkxNjc4MTkwODkyMjYwOQ.Gr2SdP...` |
| `GOOGLE_GEMINI_API_KEY` | 你的 Google Gemini API Key | `AIzaSyAsQRL6HDq12APfw0KSzOY...` |
| `LLM_PROVIDER` | `gemini` | `gemini` |
| `DATABASE_URL` | `file:./prisma/dev.db` | `file:./prisma/dev.db` |
| `REDIS_URL` | `redis://redis:6379` | `redis://redis:6379` |

**重要提示：**
- ❌ 不要在變數值兩邊加引號（如 `"value"` 或 `'value'`）
- ✅ 直接輸入值，例如：變數名 `TOKEN`，值 `MTQ2Nz...`
- ✅ 變數名必須與 docker-compose.yml 中的 `${變數名}` 一致
- ✅ 確保無多餘空格

### 步驟 5：部署

點擊 **"Deploy the stack"** 並等待容器啟動（1-2 分鐘）

### 步驟 6：驗證

**Containers → berry-fox-bot → Logs**

應該看到：
```
✅ 機器人已上線！登入帳號為 莓狐#8931
✅ Handlers loaded: [ 'getUser', 'test_dynamic' ]
```

---

## 📝 Web Editor 內容（完整版）

如果需要完整的 docker-compose.yml（包含所有選項）：

```yaml
version: '3.8'

services:
  discord-bot:
    image: berryfox:latest
    container_name: berry-fox-bot
    restart: unless-stopped
    environment:
      - TOKEN=${TOKEN}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - LLM_PROVIDER=${LLM_PROVIDER}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    networks:
      - berryfox-network

  redis:
    image: redis:7-alpine
    container_name: berry-fox-redis
    restart: unless-stopped
    networks:
      - berryfox-network
    # 可選：持久化 Redis 數據
    # volumes:
    #   - redis_data:/data

networks:
  berryfox-network:
    driver: bridge

# 可選：Redis 數據持久化
# volumes:
#   redis_data:
```

---

## 🔄 更新部署

當代碼更新時：

### 1. 重新構建映像
```bash
cd C:\Discord_Bot\BerryFox
docker build -t berryfox:latest .
```

### 2. 在 Portainer 中重啟
- Stacks → `berryfox-bot` → **Restart**

或者重新部署：
- Stacks → `berryfox-bot` → **Remove**
- 重複上述部署步驟

---

## 🆘 常見問題

### Q: 找不到映像 `berryfox:latest`？
**A:** 確保映像已在本地構建：
```bash
docker images | grep berryfox
```

如果沒有，運行：
```bash
docker build -t berryfox:latest .
```

### Q: Portainer 無法訪問本地映像？
**A:** Portainer 需要與 Docker Desktop 在同一主機。確保：
1. Portainer 連接到正確的 Docker endpoint
2. 映像存在於 Portainer 所連接的 Docker 中

### Q: 環境變數未生效？
**A:** 檢查：
1. 在 Portainer UI 中正確設定
2. 變數名無拼寫錯誤
3. 重啟容器使變數生效

### Q: 想使用 Docker Hub？
**A:** 推送映像到 Docker Hub：
```bash
docker tag berryfox:latest 你的用戶名/berryfox:latest
docker push 你的用戶名/berryfox:latest
```

然後在 docker-compose.yml 中改為：
```yaml
image: 你的用戶名/berryfox:latest
```

---

## ✨ 優點

使用 Web Editor 的優勢：
- ✅ 避免 Git 構建上下文過大問題
- ✅ 更快的部署速度（使用預構建映像）
- ✅ 更容易調試和修改配置
- ✅ 環境變數管理更安全

---

## 🎯 快速檢查清單

- [ ] 在本地構建映像：`docker build -t berryfox:latest .`
- [ ] 驗證映像存在：`docker images | grep berryfox`
- [ ] 在 Portainer 中建立 Stack（Web Editor）
- [ ] 貼上 docker-compose.yml
- [ ] 設定所有環境變數（TOKEN, GOOGLE_GEMINI_API_KEY 等）
- [ ] 部署 Stack
- [ ] 查看日誌確認成功

完成！🎉
