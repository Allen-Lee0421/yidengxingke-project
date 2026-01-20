Write-Host "🔧 安裝環境開始…" -ForegroundColor Cyan

# 虛擬環境路徑
$venvPath = "D:\鬥魚夏科\venv"

# 檢查 Python 是否安裝
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "✅ Python 已安裝。" -ForegroundColor Green

    if (-not (Test-Path $venvPath)) {
        Write-Host "📦 建立虛擬環境…" -ForegroundColor Yellow
        python -m venv $venvPath
    } else {
        Write-Host "📦 虛擬環境已存在。" -ForegroundColor Yellow
    }

    Write-Host "📦 啟用虛擬環境…" -ForegroundColor Yellow
    & "$venvPath\Scripts\Activate.ps1"

    Write-Host "📦 安裝 Python 套件…" -ForegroundColor Yellow
    pip install paypal-checkout-sdk requests
} else {
    Write-Host "❌ 未偵測到 Python，請先安裝 Python。" -ForegroundColor Red
    exit
}

# 檢查 Node.js 是否安裝
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js 已安裝。" -ForegroundColor Green

    if (Test-Path "D:\鬥魚夏科\package.json") {
        Write-Host "📦 安裝 Node.js 套件…" -ForegroundColor Yellow
        cd "D:\鬥魚夏科"
        npm install
    } else {
        Write-Host "⚠️ 未找到 package.json，跳過 npm install。" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "❌ 未偵測到 Node.js，請先安裝 Node.js。" -ForegroundColor Red
    exit
}

Write-Host "✅ 安裝流程完成。" -ForegroundColor Green
Write-Host "📌 可執行 run.bat 或 python manage.py runserver 啟動服務。" -ForegroundColor Cyan