# BerryFox Discord Bot - 快速部署指南

## 🚀 Portainer 部署（5 分鐘快速版）

### 前置條件
- 已安裝 Portainer（https://localhost:9443）
- GitHub/GitLab 帳號
- Discord Bot Token
- Google Gemini API Key（免費）

---

## 📋 快速步驟

### 1️⃣ 推送代碼到 Git

```bash
# 確保 .env 不被上傳
git add .
git commit -m "Ready for Portainer deployment"
git push origin main
```

### 2️⃣ 在 Portainer 中新增 Stack

**路徑：** Portainer UI → Stacks → Add Stack

| 設定項目 | 值 |
|---------|-----|
| **Stack name** | `berryfox-bot` |
| **Git Repository** | `https://github.com/你的用戶名/BerryFox.git` |
| **Compose path** | `docker-compose.yml` |
| **Auth** | (如果是公開倉庫，留空) |

### 3️⃣ 設定環境變數

**⚠️ 重要！在 Portainer Stack 編輯頁面中設定**

在 Portainer UI 中找到 **"Environment variables"** 區段，點擊 **"Add Variable"** 逐個添加：

```
TOKEN=你的_Discord_Bot_Token
GOOGLE_GEMINI_API_KEY=你的_Gemini_API_Key
LLM_PROVIDER=gemini
DATABASE_URL=file:./prisma/dev.db
REDIS_URL=redis://redis:6379
```

**✅ 正確做法：**
- 所有敏感資訊（Token、API Key）只在 Portainer 環境變數中設定
- docker-compose.yml 和 Dockerfile 中不包含敏感資訊
- .env 檔案不上傳到 Git

### 4️⃣ 部署

點擊 **"Deploy Stack"** 並等待 2-5 分鐘

### 5️⃣ 驗證

**Portainer UI → Containers**
- 尋找 `berry-fox-bot` 容器
- 點擊查看 **Logs** 確認：
  ```
  機器人已上線！登入帳號為 莓狐#8931
  ```

---

## ⚙️ 環境變數說明

| 變數 | 用途 | 範例 |
|-----|------|------|
| **TOKEN** | Discord Bot Token | `MTQ2Nz...` |
| **GOOGLE_GEMINI_API_KEY** | Gemini AI API（免費） | `AIzaSy...` |
| **LLM_PROVIDER** | 使用的 AI 提供商 | `gemini` 或 `openai` |
| **DATABASE_URL** | 資料庫位置 | `file:./prisma/dev.db` |
| **REDIS_URL** | Redis 快取伺服器 | `redis://redis:6379` |

---

## 🔐 安全提示

### ❌ 絕對不要：
- 上傳 `.env` 檔案到 Git
- 在 docker-compose.yml 中寫入 API Key
- 在公開日誌中洩露敏感資訊

### ✅ 正確做法：
- 在 Portainer UI 中設定環境變數
- 使用 `.env.example` 作為模板
- 定期輪換 API Key

---

## 🔄 更新部署

更新程式碼後：

1. **推送到 Git**
   ```bash
   git push origin main
   ```

2. **在 Portainer 中更新**
   - Stacks → 選擇 `berryfox-bot` → Edit
   - 點擊 **"Pull and redeploy"**

---

## 📊 監控

### 查看日誌
**Portainer UI → Containers → berry-fox-bot → Logs**

### 常見日誌信息

✅ **成功啟動**
```
機器人已上線！登入帳號為 莓狐#8931
Handlers loaded: [ 'getUser', 'test_dynamic' ]
```

❌ **缺少環境變數**
```
LLM error Error: GOOGLE_GEMINI_API_KEY missing
```

💥 **連接錯誤**
```
[ioredis] connection error, switching to in-memory fallback
```

---

## 🆘 常見問題

### Q: 環境變數修改後沒有生效？
**A:** 在 Portainer 中重啟容器
- Containers → berry-fox-bot → Restart

### Q: Gemini API 回應錯誤？
**A:** 檢查：
1. API Key 是否正確
2. 額度是否足夠（免費額度：60 req/day）
3. 網路連線正常

### Q: 如何查看容器資源使用情況？
**A:** Portainer → Containers → 選擇容器 → Stats

---

## 📚 更多資訊

- 詳細部署指南：[PORTAINER_DEPLOYMENT.md](./PORTAINER_DEPLOYMENT.md)
- 環境設定範本：[.env.example](./.env.example)
- Discord.js 文檔：https://discord.js.org/
- Gemini API：https://ai.google.dev/

---

## ✨ 下一步

1. ✅ 推送代碼到 Git
2. ✅ 在 Portainer 建立 Stack
3. ✅ 設定環境變數
4. ✅ 監控日誌確認運作
5. ✅ 邀請 Bot 到 Discord 伺服器

**已準備好！🚀**
