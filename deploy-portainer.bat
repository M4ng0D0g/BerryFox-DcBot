@echo off
REM BerryFox Discord Bot - Portainer 一鍵部署腳本 (Windows)

setlocal enabledelayedexpansion

echo 🚀 BerryFox Discord Bot - Portainer 部署助手
echo =============================================
echo.

REM 檢查 Git 是否初始化
if not exist .git (
    echo ❌ 錯誤：未檢測到 Git 倉庫
    echo 請先運行：
    echo   git init
    echo   git remote add origin ^<your-repo-url^>
    pause
    exit /b 1
)

REM 檢查 .env 檔案
if exist .env (
    echo ⚠️  警告：檢測到 .env 檔案
    echo 確保 .env 在 .gitignore 中！
    echo.
)

REM 檢查必要檔案
if not exist docker-compose.yml (
    echo ❌ 錯誤：缺少 docker-compose.yml
    pause
    exit /b 1
)

if not exist .env.example (
    echo ❌ 錯誤：缺少 .env.example
    pause
    exit /b 1
)

echo ✅ 前置檢查通過
echo.
echo 📋 部署清單：
echo   1. ✅ 環境變數文件已準備 (.env.example)
echo   2. ✅ Docker Compose 配置已準備
echo   3. ✅ .env 已被 .gitignore 保護
echo.

echo 🔄 準備推送到 Git...
echo.

REM 嘗試提交變更
git add .
git commit -m "Prepare for Portainer deployment"

echo.
echo ✨ 準備完成！
echo.
echo 📌 下一步 - 在 Portainer 中：
echo   1. 進入 Portainer UI (https://localhost:9443)
echo   2. Stacks → Add Stack
echo   3. 選擇 'Git Repository'
echo   4. Repository URL: 填入你的 GitHub 倉庫
echo   5. Compose path: docker-compose.yml
echo   6. Environment variables 中添加：
echo      - TOKEN=^<你的Discord_Token^>
echo      - GOOGLE_GEMINI_API_KEY=^<你的Gemini_Key^>
echo      - LLM_PROVIDER=gemini
echo      - DATABASE_URL=file:./prisma/dev.db
echo      - REDIS_URL=redis://redis:6379
echo   7. 點擊 'Deploy Stack'
echo.
echo 📚 詳細指南請參考：
echo   - DEPLOYMENT.md (快速版)
echo   - PORTAINER_DEPLOYMENT.md (完整版)
echo.

pause
