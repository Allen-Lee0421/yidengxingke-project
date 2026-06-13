const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const sequelize = require('./database/database'); // 引入 SQLite 設定
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 模擬數據庫：5% 公益金與成交單數
let stats = {
    charity_fund: 0,
    total_orders: 0
};

// 1. 全球階梯定價 API
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

// 2. 核心鑑定接口
app.post('/api/calculate', (req, res) => {
    const { name, birthtime, mode } = req.body;
    // 實地執行環境下，若無 block7_service.py，則回傳模擬數據
    const pythonPath = 'python3'; // Linux 環境使用 python3
    const scriptPath = path.join(__dirname, 'block7_service.py');
    
    if (fs.existsSync(scriptPath)) {
        const cmd = `${pythonPath} "${scriptPath}" "${birthtime}" "${name}" "${mode}"`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                return res.json({ status: "error", message: "演算引擎對沖中..." });
            }
            try {
                const data = JSON.parse(stdout);
                const price = 1280; 
                stats.charity_fund += price * 0.05;
                stats.total_orders += 1;
                res.json(data);
            } catch (e) {
                res.json({ status: "error", message: "解析演算結果失敗" });
            }
        });
    } else {
        // 模擬回傳
        const price = 1280;
        stats.charity_fund += price * 0.05;
        stats.total_orders += 1;
        res.json({
            status: "success",
            result: `易鑒星科：${name} 的命理分析已完成 [XDLS 模擬模式]`,
            timestamp: new Date().toISOString()
        });
    }
});

// 3. 公益透明盒數據
app.get('/api/charity', (req, res) => {
    res.json(stats);
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "active",
        system: "Edison Star System (易鑒星科)",
        engine: "XDLS 2.0",
        database: "SQLite Online",
        timestamp: new Date().toISOString()
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 易鑒星科新版伺服器已啟動`);
    console.log(`📍 網址：http://localhost:${PORT}`);
    console.log(`💾 資料庫：SQLite (yidengxingke.db) 已掛載`);
    console.log(`🎨 品牌標誌：XDLS Logo 已就緒`);
    console.log(`========================================`);
});
