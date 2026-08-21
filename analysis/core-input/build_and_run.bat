@echo off
:: -----------------------------------------------------
:: 程式夥伴最終修正版：「易燈星科」一鍵啟動腳本
:: 目的：確保路徑正確，穩定啟動伺服器及音樂播放器。
:: -----------------------------------------------------

:: === 關鍵路徑修正：確保腳本在它所在的目錄下執行 ===
cd /d "%~dp0"
set PROJECT_NAME=易燈星科

echo.
echo -----------------------------------------------------
echo  %PROJECT_NAME% 網站伺服器與音樂播放器啟動
echo -----------------------------------------------------
echo.

echo [1/3] 檢查專案依賴...

:: 清理舊的鎖定文件，並檢查 node_modules 是否存在
del package-lock.json > nul 2>&1

if not exist node_modules (
    echo 偵測到 node_modules 不存在，正在執行 npm install...
    npm install
) else (
    echo node_modules 已存在，跳過 npm install。
)

:: 檢查 npm install 是否成功
if %errorlevel% neq 0 (
    echo.
    echo ? 致命錯誤：Node.js 依賴安裝失敗！請檢查網路連線。
    echo.
    pause
    exit /b 1
)

echo [2/3] 依賴檢查完成。
echo [3/3] 啟動網站伺服器與音樂播放器...
echo.
echo 網站已準備就緒，伺服器啟動後請勿關閉此視窗。
echo -----------------------------------------------------
echo.

:: === 執行檔案存在性檢查與啟動 ===

:: 檢查 musicPlayer.js
if not exist musicPlayer.js (
    echo ? 警告：找不到 musicPlayer.js！音樂播放器將不會啟動。
) else (
    :: 在新的 CMD 視窗中啟動音樂播放器 (後台執行)
    start "%PROJECT_NAME% - 音樂播放器" cmd /c node musicPlayer.js
)

:: 檢查 server.js (網站主程式)
if not exist server.js (
    echo ? 致命錯誤：找不到 server.js！網站伺服器無法啟動。
    pause
    exit /b 1
) else (
    :: 在當前 CMD 視窗中運行網站伺服器 (前台執行，確保啟動日誌可見)
    echo 正在啟動伺服器 (node server.js)...
    :: 使用 CALL 確保即使 node server.js 崩潰，也能返回到這個批次檔腳本
    CALL node server.js
)

:: 伺服器停止後 (通常按 Ctrl+C)，腳本會繼續執行
echo.
echo -----------------------------------------------------
echo 伺服器已停止。
echo -----------------------------------------------------
pause