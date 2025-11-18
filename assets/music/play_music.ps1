# ----------------------------------------------------
# 易燈星科 - CMD/PowerShell MP3 音樂播放系統
# 使用 .NET COM 物件實現循環播放
# ----------------------------------------------------

# 設定音樂檔案路徑 (需確保檔案存在)
$MusicPath = "D:\易燈星科\assets\music\yidengxingke.mp3"

if (-not (Test-Path $MusicPath)) {
    Write-Error "錯誤：未找到音樂檔案 ($MusicPath)。"
    exit 1
}

Write-Host "🎶 正在啟動背景音樂播放器..." -ForegroundColor Yellow

# 創建 Windows Media Player COM 物件
$WMP = New-Object -ComObject WMPlayer.OCX.7

# 設定音樂 URL 和循環播放
$WMP.URL = $MusicPath
$WMP.settings.setMode("loop", $true)

Write-Host "背景音樂已啟動並設定為循環播放。" -ForegroundColor Cyan
Write-Host "按下 CTRL+C 即可停止播放並關閉視窗。"

# 保持 PowerShell 視窗開啟，讓播放器持續運作
while ($true) {
    Start-Sleep -Seconds 1
}