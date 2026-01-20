const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 模擬數據庫：5% 公益金與成交單數
let stats = {
    charity_fund: 0,
    total_orders: 0
};

app.use(express.static(path.join(__dirname, 'public')));

// 產品定價 API
app.get('/api/pricing', (req, res) => {
    res.json({
        "quick_detect": 3300,   // 六壬速斷
        "name_fix": 9900,      // 姓名定格
        "strategic": 19100,    // 奇門佈局
        "macro_outlook": 36000 // 易經大略
    });
});

// 公益透明盒數據接口
app.get('/api/charity', (req, res) => {
    res.json(stats);
});

// 健康檢查接口
app.get('/health', (req, res) => {
    res.status(200).send('Edison Star System: Active');
});

app.listen(PORT, () => {
    console.log(`易鑒星科伺服器已啟動：http://localhost:${PORT}`);
});