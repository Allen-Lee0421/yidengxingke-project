# P0 功能驗收紀錄

## 驗收日期
2026-08-24

## 本地服務
以 `PORT=4123 node server.js` 啟動。資料庫未在 sandbox 運行，因此啟動日誌顯示 PostgreSQL ECONNREFUSED；HTTP 靜態頁與路由仍可正常啟動。

## 已驗證

| 測試 | 結果 |
|---|---|
| `/sitemap.xml` | HTTP 200 |
| `/robots.txt` | HTTP 200，包含 Sitemap URL |
| `/input.html` | HTTP 200 |
| `/share.html` | HTTP 200 |
| `GET /api/leads` | HTTP 405，符合只接受 POST |
| API 無效 Email | HTTP 400，正確回傳 Email 驗證訊息 |
| API 未同意隱私 | HTTP 400，正確回傳同意要求 |
| 免費體驗 submit | 在全新頁面中可阻止預設跳轉，結果卡立即顯示 |
| 動態結果卡 | 有標題、摘要、分數、標籤、xingdeng.tw 品牌字樣 |
| 專屬分享連結 | 包含 `rid`、`score`、`theme` 與 `utm_source/result_card`、`utm_medium/social`、`utm_campaign/referral` |
| 分享頁 | 能解析分數與標籤，並提供再次體驗與 2026 戰略矩陣導流 |
| CSP | 初版 inline script 在 Express Helmet 下未執行；已改為 `input.js`、`share.js` 外部腳本並重新驗證通過 |
| 響應式 | CSS 已加入 640px 斷點，結果卡、分享按鈕與名單表單在窄螢幕改為單欄 |

## 尚待正式環境驗證

由於 sandbox 沒有可用的 `DATABASE_URL` PostgreSQL 服務，尚未進行真實名單寫入與冪等更新測試。正式部署必須確認 `DATABASE_URL`、資料庫連線、`leads` table 建立權限，以及 Vercel/Node 的環境變數設定。

## 追加互動測試

| 測試 | 結果 |
|---|---|
| 複製分享連結 | 點擊後按鈕即時顯示「已複製，快去分享」 |
| 下載分享卡 | 點擊後未出現前端錯誤，已觸發 Canvas 下載流程 |

## 分享碼追加驗收

最新版本已驗證：結果卡在全新載入頁面正常出現；分享網址使用 `r` 壓縮結果參數、`ref=ES...` 推薦碼，以及 `utm_source=result_card`、`utm_medium=social`、`utm_campaign=referral` 來源追蹤參數。分享頁可解析壓縮參數並呈現對應分數、標題與標籤。

## 分享頁追加驗收

以壓縮參數 `r=eyJpIjowLCJzIjo3NH0` 與 `ref=ES...` 開啟分享頁後，頁面標題、核心標題、摘要、分數 74、`ACTION FIRST` 標籤均正確還原；載入期間主控台沒有錯誤輸出。
