# ----------------------------------------------------
# 易燈星科 網站一鍵安裝與部署腳本 (PowerShell 版本)
# ----------------------------------------------------

# 確保腳本使用 UTF-8 編碼 (PowerShell 預設支援，比 CMD 穩定)
$OutputEncoding = [System.Text.Encoding]::UTF8

# --- 變數定義 ---
$ProjectRoot = "D:\易燈星科"
$WebRoot = "C:\xampp\htdocs\yidengxingke"
$ZipFile = "$ProjectRoot\易燈星科.zip"
$SqlFile = "$WebRoot\database\yidengxingke.sql"
$SevenZExe = "$ProjectRoot\install\7z.exe"
$DbName = "yidengxingke"
$MysqlExe = "C:\xampp\mysql\bin\mysql.exe"

# 進入專案根目錄
Set-Location $ProjectRoot

Write-Host "`n🚀 易燈星科 網站部署開始..." -ForegroundColor Yellow

# --- 步驟 1: 取得 MySQL 密碼 ---
$rootPass = Read-Host "請輸入您的 MySQL root 密碼"
if (-not $rootPass) {
    Write-Error "密碼不能為空。部署中止。"
    exit 1
}

# --- 步驟 2: 檢查 7z 執行檔 ---
if (-not (Test-Path $SevenZExe)) {
    Write-Error "錯誤：未找到解壓縮程式 ($SevenZExe)。請將 7z.exe 放入 install 資料夾。"
    exit 1
}

# --- 步驟 3: 建立網站部署資料夾 ---
Write-Host "1. 建立網站部署資料夾 ($WebRoot)..." -ForegroundColor Cyan
if (-not (Test-Path $WebRoot)) {
    New-Item -Path $WebRoot -ItemType Directory | Out-Null
}
Write-Host "建立資料夾完成。"

# --- 步驟 4: 解壓縮網站檔案 ---
Write-Host "2. 解壓縮網站檔案..." -ForegroundColor Cyan
try {
    # 執行 7z 解壓縮
    & "$SevenZExe" x -y "$ZipFile" "-o$WebRoot" | Out-Null
} catch {
    Write-Error "錯誤：解壓縮失敗! 請檢查 zip 檔案是否存在且完整。"
    exit 1
}
Write-Host "解壓縮完成。"

# --- 步驟 5: 建立資料庫 ---
Write-Host "3. 建立資料庫 ($DbName)..." -ForegroundColor Cyan
try {
    # 執行 MySQL 指令建立資料庫
    & "$MysqlExe" -u root -p"$rootPass" -e "CREATE DATABASE IF NOT EXISTS $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
} catch {
    Write-Error "錯誤：建立資料庫失敗! 請確認 MySQL 已啟動且密碼正確。"
    exit 1
}
Write-Host "資料庫建立完成。"

# --- 步驟 6: 匯入資料庫結構 ---
Write-Host "4. 匯入資料庫結構..." -ForegroundColor Cyan
try {
    # 執行 MySQL 指令匯入 SQL 檔案
    & "$MysqlExe" -u root -p"$rootPass" $DbName < "$SqlFile" 2>$null
} catch {
    Write-Error "錯誤：匯入資料庫結構失敗! 請檢查 SQL 檔案路徑和密碼。"
    exit 1
}
Write-Host "匯入完成。"

# --- 步驟 7: 設定資料庫連線 (替換密碼) ---
Write-Host "5. 設定資料庫連線 (配置 config.php)..." -ForegroundColor Cyan
$ConfigFile = "$WebRoot\backend\config.php"

if (Test-Path $ConfigFile) {
    # 讀取檔案內容
    $content = Get-Content $ConfigFile -Encoding UTF8
    
    # 使用正規表達式替換密碼佔位符
    $newContent = $content -replace "<YOUR_ROOT_PASSWORD>", $rootPass
    
    # 寫回檔案
    $newContent | Set-Content $ConfigFile -Encoding UTF8
    
    Write-Host "config.php 密碼替換完成。"
} else {
    Write-Warning "警告：未找到 $ConfigFile 檔案，請手動替換密碼！"
}


# --- 完成訊息 ---
Write-Host "`n----------------------------------------------------" -ForegroundColor Green
Write-Host "✅ 恭喜！網站安裝與部署已成功完成！" -ForegroundColor Green
Write-Host "請在瀏覽器中輸入: http://localhost/yidengxingke/frontend/index.html" -ForegroundColor Green
Write-Host "----------------------------------------------------" -ForegroundColor Green
pause