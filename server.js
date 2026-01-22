const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 模擬數據庫：5% 公益金與成交單數
let stats = {
    charity_fund: 0,
    total_orders: 0
};

// 1. 全球階梯定價 API (依總監 10:30 指令)
app.get('/api/pricing', (req, res) => {
    res.json({
        "trial": 888,          // 基礎鑑定
        "spark": 1280,         // 星火計畫 (需誠信誓約)
        "quick_detect": 3300,  // 六壬速斷
        "name_fix": 9900,      // 姓名定格
        "strategic": 19100,    // 奇門佈局
        "macro_outlook": 36000 // 易經大略
    });
});

// 2. 核心鑑定接口：連動 Block 7 (科學對沖)
app.post('/api/calculate', (req, res) => {
    const { name, birthtime, mode } = req.body;
    // 執行 D:\EdisonStar\block7_service.py
    const cmd = `python D:\\EdisonStar\\block7_service.py "${birthtime}" "${name}" "${mode}"`;
    
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            return res.json({ status: "error", message: "演算引擎對沖中..." });
        }
        const data = JSON.parse(stdout);
        // 成交後自動累算 5% 公益金
        const price = 1280; // 範例以星火計畫為主
        stats.charity_fund += price * 0.05;
        stats.total_orders += 1;
        res.json(data);
    });
});

// 3. 公益透明盒數據
app.get('/api/charity', (req, res) => {
    res.json(stats);
});

app.get('/health', (req, res) => {
    res.status(200).send('Edison Star System: Active [Block 7 Online]');
});

app.listen(PORT, () => {
    console.log(`易鑒星科伺服器已啟動：http://localhost:${PORT}`);
    console.log(`數據基準：1979/4/21 戊土日主對沖模式`);
});