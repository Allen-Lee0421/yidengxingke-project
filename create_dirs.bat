@echo off
REM ----------------------------------------------------
REM 易燈星科 專案資料夾結構建立腳本
REM 執行前請確保您位於 D: 槽，或將腳本放在 D:\易燈星科\
REM ----------------------------------------------------

set "PROJECT_ROOT=D:\易燈星科"

echo.
echo 🚀 正在建立 [易燈星科] 專案資料夾結構於 %PROJECT_ROOT%...
echo ----------------------------------------------------

REM --- 根目錄下的資料夾 ---
if not exist "%PROJECT_ROOT%\frontend" mkdir "%PROJECT_ROOT%\frontend"
if not exist "%PROJECT_ROOT%\backend" mkdir "%PROJECT_ROOT%\backend"
if not exist "%PROJECT_ROOT%\database" mkdir "%PROJECT_ROOT%\database"
if not exist "%PROJECT_ROOT%\assets" mkdir "%PROJECT_ROOT%\assets"
if not exist "%PROJECT_ROOT%\install" mkdir "%PROJECT_ROOT%\install"
echo 根目錄結構建立完成。

REM --- assets/ 靜態資源資料夾 ---
if not exist "%PROJECT_ROOT%\assets\css" mkdir "%PROJECT_ROOT%\assets\css"
if not exist "%PROJECT_ROOT%\assets\js" mkdir "%PROJECT_ROOT%\assets\js"
if not exist "%PROJECT_ROOT%\assets\images" mkdir "%PROJECT_ROOT%\assets\images"
if not exist "%PROJECT_ROOT%\assets\music" mkdir "%PROJECT_ROOT%\assets\music"
echo assets/ 靜態資源結構建立完成。

REM --- 範例頁面骨架 (方便後續編寫) ---
if not exist "%PROJECT_ROOT%\frontend\yijing.html" echo 易經卦象生成頁 > "%PROJECT_ROOT%\frontend\yijing.html"
if not exist "%PROJECT_ROOT%\frontend\qimen.html" echo 奇門遁甲盤生成頁 > "%PROJECT_ROOT%\frontend\qimen.html"
if not exist "%PROJECT_ROOT%\frontend\name.html" echo 姓名學分析頁 > "%PROJECT_ROOT%\frontend\name.html"
if not exist "%PROJECT_ROOT%\frontend\product.html" echo 商品頁面 > "%PROJECT_ROOT%\frontend\product.html"
if not exist "%PROJECT_ROOT%\frontend\member.html" echo 會員中心 > "%PROJECT_ROOT%\frontend\member.html"
echo 範例前端頁面骨架建立完成。

echo ----------------------------------------------------
echo ✅ 專案資料夾結構已完整建立。
echo 請將程式碼檔案填入對應資料夾。
pause