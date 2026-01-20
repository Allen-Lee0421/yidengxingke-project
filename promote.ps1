Write-Host "--- 啟動全球 9 國語系行銷矩陣 ---" -ForegroundColor Cyan
$baseUrl = "https://xingdeng.tw/2026-outlook"

$prompts = @{
    "TW" = "2026 丙午年國運智謀鑑定：火雷噬嗑，極致熱能下的商戰佈局。 $baseUrl"
    "EN" = "2026 Outlook: Strategic Intelligence for the Year of Bing Wu. $baseUrl"
    "JP" = "2026年国運鑑定：火雷噬嗑、激動の時代を勝ち抜く戦略。 $baseUrl"
}

foreach ($key in $prompts.Keys) {
    Write-Host "[$key] 貼文內容：" -ForegroundColor Gold
    Write-Host $prompts[$key]
    Write-Host "----------------------------------------"
}
Write-Host "提示：請複製內容至 X 發布，或連動 API 自動發送。"