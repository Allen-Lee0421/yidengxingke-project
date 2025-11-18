// models/User.js - 使用者資料庫模型 (Schema)

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // 從 db.js 導入連接實例

const User = sequelize.define('User', {
    // 使用者 ID (主鍵, 自動遞增)
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // 帳號 (Email 或名稱，必須是唯一的)
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    // 密碼 (未來會儲存加密後的 HASH)
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // 命理運算次數 (用於限制免費或計費)
    calculation_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, 
    }
}, {
    // 啟用時間戳 (自動添加 createdAt 和 updatedAt 欄位)
    timestamps: true 
});

module.exports = User;