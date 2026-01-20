@echo off
title 啟動易燈星科專案
echo 🔧 啟動中，請稍候...

REM 啟用 Python 虛擬環境
call .venv\Scripts\activate.bat

REM 啟動 Django server
start cmd /k "cd /d D:\易燈星科 && python manage.py runserver"

REM 啟動 Node.js server
start cmd /k "cd /d D:\易燈星科 && node server.js"

echo ✅ 所有服務已啟動，可於瀏覽器輸入 http://127.0.0.1:8000 查看 Django
echo ✅ Node.js 控制台已啟動，請查看 MP3 播放或前端模組是否正常
pause