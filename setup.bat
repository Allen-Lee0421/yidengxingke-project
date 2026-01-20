@echo off
title 易鑑星科 - 一鍵啟動與安裝腳本

echo.
echo -----------------------------------------------------
echo   🚀 歡迎使用 易鑑星科 網站一鍵啟動腳本
echo -----------------------------------------------------
echo.

:: 步驟 1: 檢查 Node.js 環境
echo [1/3] 檢查 Node.js 與 NPM 環境...
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ 錯誤：未檢測到 Node.js 環境！
    echo ❌ 請先安裝 Node.js (建議 LTS 版) 再重新執行此腳本。
    echo ❌ 安裝網址: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js 環境檢查通過。
)

:: 步驟 2: 安裝專案依賴 (Express.js)
echo.
echo [2/3] 安裝 Node.js 專案依賴 (Express 框架)...
npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ 錯誤：依賴安裝失敗！請檢查網路連線或 package.json 文件。
    echo.
    pause
    exit /b 1
) else (
    echo ✅ 專案依賴安裝成功！
)

:: 步驟 3: 啟動網站伺服器
echo.
echo [3/3] 正在啟動 易鑑星科 網站伺服器...
echo.
echo 網站啟動中，請注意上方顯示的網址。
echo 伺服器啟動後，本視窗請勿關閉。
echo 若要停止伺服器，請在本視窗內按 Ctrl+C。
echo -----------------------------------------------------
echo.

node server.js

:: 伺服器停止後 (按 Ctrl+C)，腳本會繼續執行
echo.
echo -----------------------------------------------------
echo 伺服器已停止。感謝使用 易鑑星科 啟動腳本。
echo -----------------------------------------------------
pause