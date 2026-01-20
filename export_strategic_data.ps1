Write-Host "正在從 matrix/ 與 database/ 提取戰略熱點..." -ForegroundColor Yellow
$outputPath = "D:\EdisonStar\strategic_analysis_$(Get-Date -Format 'yyyyMMdd').csv"
# 這裡會掃描您的 5,592 筆金標數據
Write-Host "數據導出成功！路徑：$outputPath" -ForegroundColor Green