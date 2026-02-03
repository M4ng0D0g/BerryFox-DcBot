# ✅ Portainer 部署檢查清單

## 📋 部署前準備

- [ ] 確認 `.env` 檔案已正確配置本地開發
  - [ ] `TOKEN` = Discord Bot Token
  - [ ] `GOOGLE_GEMINI_API_KEY` = Gemini API Key
  - [ ] `LLM_PROVIDER` = `gemini`
  
- [ ] 確認 `.gitignore` 包含 `.env`
  ```bash
  grep ".env" .gitignore
  ```

- [ ] 建立 `.env.example` 作為模板
  - [ ] 包含所有必要的環境變數（無敏感值）

- [ ] 確認 `docker-compose.yml` 正確配置
  - [ ] 包含 `env_file: - .env`
  - [ ] 包含 Redis 服務（可選但推薦）

---

## 🚀 Git 推送步驟

- [ ] **初始化 Git（如果尚未）**
  ```bash
  git init
  git remote add origin https://github.com/你的用戶名/BerryFox.git
  ```

- [ ] **檢查敏感檔案**
  ```bash
  # 確保 .env 不在 Git 中
  git status | grep .env
  ```

- [ ] **添加並提交**
  ```bash
  git add .
  git commit -m "Prepare for Portainer deployment"
  git push origin main
  ```

- [ ] **驗證 GitHub/GitLab**
  - [ ] 訪問倉庫頁面
  - [ ] 確認 `.env` 未被上傳
  - [ ] 確認 `.env.example` 已上傳
  - [ ] 確認 `docker-compose.yml` 已上傳

---

## 🛠️ Portainer 配置

### 安裝 Portainer（如果未安裝）

- [ ] **運行 Portainer**
  ```bash
  docker run -d -p 8000:8000 -p 9443:9443 \
    --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:latest
  ```

- [ ] **訪問 UI**
  - [ ] 開啟 https://localhost:9443
  - [ ] 完成初始設定（建立帳號）

### 新增 Stack

- [ ] **進入 Stack 管理**
  - [ ] Portainer 左側選單 → **Stacks**
  - [ ] 點擊 **Add Stack**

- [ ] **選擇 Git Repository 方式**
  - [ ] 選項：Repository
  - [ ] Repository URL: `https://github.com/你的用戶名/BerryFox.git`
  - [ ] Compose path: `docker-compose.yml`
  - [ ] Git credentials: (如果是公開倉庫，留空)

### 設定環境變數

- [ ] **在 Stack 編輯頁面添加環境變數**

| 變數名 | 值 | 說明 |
|--------|-----|------|
| `TOKEN` | `你的Discord_Bot_Token` | Discord 應用 Developer Portal 取得 |
| `GOOGLE_GEMINI_API_KEY` | `你的_Google_Gemini_API_Key` | https://ai.google.dev/ 取得 |
| `LLM_PROVIDER` | `gemini` | 使用的 AI 提供商 |
| `DATABASE_URL` | `file:./prisma/dev.db` | 資料庫路徑 |
| `REDIS_URL` | `redis://redis:6379` | Redis 服務（需要 Redis 容器） |

- [ ] **驗證環境變數正確**
  - [ ] 無多餘空格
  - [ ] API Key 完整（無截斷）
  - [ ] 沒有引號

### 部署

- [ ] **點擊 "Deploy Stack"**
  - [ ] 等待 2-5 分鐘
  - [ ] 監控部署進度

---

## ✔️ 驗證部署成功

### 檢查容器狀態

- [ ] **在 Portainer 中查看容器**
  - [ ] Containers → 尋找 `berry-fox-bot` 容器
  - [ ] 狀態應為 **Running** ✅

### 檢查日誌

- [ ] **查看啟動日誌**
  - [ ] Containers → `berry-fox-bot` → **Logs**
  - [ ] 確認出現以下訊息：
    ```
    機器人已上線！登入帳號為 莓狐#8931
    ```

- [ ] **確認無錯誤**
  - [ ] [ ] 無 "GOOGLE_GEMINI_API_KEY missing" 錯誤
  - [ ] [ ] 無 "DATABASE_URL not set" 錯誤
  - [ ] [ ] 無 "TOKEN invalid" 錯誤

### 測試 Bot 功能

- [ ] **邀請 Bot 到 Discord 伺服器**
  - [ ] 進入 Discord Developer Portal
  - [ ] Applications → 你的 Bot → OAuth2 → URL Generator
  - [ ] 選擇 `bot` 和所需權限
  - [ ] 複製生成的 URL 並訪問

- [ ] **在 Discord 中測試**
  - [ ] 發送 mention：`@莓狐 Hello!`
  - [ ] 檢查 Bot 是否回應
  - [ ] 發送 DM 給 Bot
  - [ ] 檢查 Bot 是否回應

---

## 🔄 日常維護

### 更新程式碼

- [ ] **本地修改並推送**
  ```bash
  git add .
  git commit -m "Description of changes"
  git push origin main
  ```

- [ ] **在 Portainer 更新 Stack**
  - [ ] Stacks → `berryfox-bot` → **Edit**
  - [ ] 點擊 **Pull and redeploy**
  - [ ] 等待容器重啟

### 更新環境變數

- [ ] **在 Portainer UI 更新**
  - [ ] Stacks → `berryfox-bot` → **Edit**
  - [ ] 修改 Environment variables
  - [ ] 點擊 **Update the Stack**

### 監控

- [ ] **定期檢查日誌**
  - [ ] Containers → `berry-fox-bot` → Logs
  - [ ] 確認無異常錯誤

- [ ] **檢查資源使用**
  - [ ] Containers → `berry-fox-bot` → Stats
  - [ ] CPU 和記憶體使用正常

---

## 🆘 故障排除

### Bot 無回應

1. [ ] **檢查 API Key**
   - [ ] Token 是否正確？
   - [ ] Gemini Key 是否有效？
   - [ ] 點擊 test_gemini_key.mjs 驗證

2. [ ] **檢查日誌中的錯誤**
   - [ ] 缺少環境變數？
   - [ ] API 配額已滿？

3. [ ] **重啟容器**
   - [ ] Containers → `berry-fox-bot` → **Restart**

### 環境變數未生效

1. [ ] **確認已設定**
   - [ ] Stacks → Edit → Environment variables
   - [ ] 無多餘空格

2. [ ] **重啟容器**
   - [ ] Restart Stack 或容器

3. [ ] **檢查日誌**
   - [ ] 查看是否有環境變數缺失的錯誤

### 資料庫錯誤

1. [ ] **檢查 DATABASE_URL**
   - [ ] 路徑是否正確？
   - [ ] 檔案是否存在？

2. [ ] **運行遷移**
   - [ ] 進入容器終端
   - [ ] 運行 `npx prisma migrate deploy`

---

## 📚 參考文件

- [ ] 閱讀 `DEPLOYMENT.md` 快速指南
- [ ] 閱讀 `PORTAINER_DEPLOYMENT.md` 詳細指南
- [ ] 查看 `.env.example` 環境變數範本

---

## ✨ 完成標記

部署流程完成時，勾選此項：

- [ ] ✅ 所有步驟已完成
- [ ] ✅ Bot 已上線並能正常回應
- [ ] ✅ 環境變數已安全配置
- [ ] ✅ 日誌監控已設定

**🎉 恭喜！BerryFox 已成功部署到 Portainer！**
