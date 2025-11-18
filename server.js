// server.js - 程式夥伴 V6.0：加入命理運算路由 (Numerology API)

// 導入核心模組
const path = require('path');
const express = require('express');
const helmet = require('helmet'); 
// 導入資料庫實例
const sequelize = require('./db'); 
// 導入核心模型
const User = require('./models/User'); 
const Order = require('./models/Order'); 
// 導入路由
const paymentRoutes = require('./routes/payment'); 
const numerologyRoutes = require('./routes/numerology'); // <--- NEW

require('dotenv').config(); 

const app = express();
// 使用 3001 端口
const port = process.env.PORT || 3001; 

// --- 資料庫連接與同步 ---
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });


async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false }); 
        
        console.log('-----------------------------------------------------');
        console.log('⭐ 資料庫連接成功: SQLite 檔案資料庫已連接!');
        console.log('⭐ 核心表格已創建 (User, Order)!');
        console.log('-----------------------------------------------------');
        return true;
    } catch (err) {
        console.error('❌ 資料庫連接失敗或模型同步錯誤！');
        console.error(err);
        process.exit(1); 
    }
}


// --- 伺服器啟動邏輯 ---
initializeDatabase().then(isReady => {
    if (!isReady) return;

    // --- 安全機制與中介軟體 ---
    app.use(helmet()); 
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());


    // --- 核心 API 路由 (營利功能) ---
    app.use('/api/payment', paymentRoutes);
    app.use('/api/numerology', numerologyRoutes); // <--- NEW


    // --- 前後台路由 ---
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.get('/admin', (req, res) => {
        res.send(`<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>易燈星科 - 後台登入</title></head><body><h1>易燈星科後台管理系統</h1><h2>交接驗證成功!</h2><p>這是一個簡單的登入介面佔位符，表示路由已配置。</p><form action="/login" method="POST"><input type="text" name="username" placeholder="帳號" required><br><br><input type="password" name="password" placeholder="密碼" required><br><br><button type="submit">登入</button></form></body></html>`);
    });


    // --- 啟動伺服器並處理錯誤 ---
    try {
        const server = app.listen(port, () => {
            console.log('-----------------------------------------------------');
            console.log(`✅ 易燈星科 伺服器已啟動! (安全機制已啟用)`);
            console.log(`前台網址：http://localhost:${port}`);
            console.log(`後台網址：http://localhost:${port}/admin`);
            console.log(`(按 Ctrl+C 停止伺服器)`);
            console.log('-----------------------------------------------------');
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ 致命錯誤：端口 ${port} 已經被其他程式佔用！`);
                console.error('請關閉佔用端口的程式後重試。');
            } else {
                console.error('\n❌ 伺服器啟動時發生未預期的錯誤：', err.message);
            }
            process.exit(1); 
        });
    } catch (e) {
        console.error(`\n❌ 程式啟動時發生致命的同步錯誤：`, e.message);
        process.exit(1);
    }
});