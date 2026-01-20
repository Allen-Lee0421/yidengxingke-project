# 易鑒星科 · 總監專屬財務監控腳本
$ErrorActionPreference = "SilentlyContinue"
Clear-Host
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "   易鑒星科 · EDISON STAR 2026 財務總表" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

# 此處數值未來可自動串接資料庫
$Rakuten = 0
$LineBank = 0
$PayPalUSD = 0
$Exchange = 32.5

$TotalTWD = $Rakuten + $LineBank + ($PayPalUSD * $Exchange)
$Charity = $TotalTWD * 0.05

Write-Host "【國內帳戶】"
Write-Host "826 樂天帳戶淨利: NT$ $Rakuten"
Write-Host "824 Line Bank淨利: NT$ $LineBank"
Write-Host "------------------------------------------------"
Write-Host "【國際帳戶】"
Write-Host "PayPal 餘額: USD $PayPalUSD (約 NT$ $($PayPalUSD * $Exchange))"
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "當前平台總營收: NT$ $TotalTWD" -ForegroundColor Green
Write-Host "應撥付公益金額 (5%): NT$ $Charity" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Cyan

Read-Host "按 Enter 返回主控台..."