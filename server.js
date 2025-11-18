// server.js - 程式夥伴 V6.0：加入命理運算路由 (Numerology API)

// 導入核心模組
const path = require('path');
const express = require('express');
const helmet = require('helmet'); 
// 導入資料庫實例
// ... (保持第 1 行到第 5 行不變)
const express = require('express');
const helmet = require('helmet'); 
// // 導入資料庫實例 (舊的 SQLite 邏輯已註釋或刪除)
// const sequelize = require('./db');  

// 導入 Sequelize 核心模組
const { Sequelize } = require('sequelize');

// 使用 Render 提供的 DATABASE_URL (PostgreSQL 連接字串)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    // 必須啟用 SSL 以確保 Render 的連接安全性
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

// 導入核心模型
const User = require('./models/User'); 
const Order = require('./models/Order'); 
// ... (保持其他程式碼不變)

// --- 資料庫連接與同步 ---
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false }); 
         
        console.log('-----------------------------------------------------');
        console.log('✅ 資料庫連接成功: PostgreSQL 雲端資料庫已連接!'); // <-- 修正輸出訊息
        console.log('⭐ 核心表格已創建 (User, Order)!');
        console.log('-----------------------------------------------------');
        return true;
    } catch (err) {
        console.error('❌ 資料庫連接失敗或模型同步錯誤！');
        console.error(err);
        process.exit(1); 
    }
}
// ... (保持伺服器啟動邏輯不變)