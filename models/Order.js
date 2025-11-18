// models/Order.js - 交易紀錄/訂單資料庫模型 (Schema)

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // 從 db.js 導入連接實例

const Order = sequelize.define('Order', {
    // 訂單 ID (主鍵, 自動遞增)
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // 交易編號 (金流服務商返回的唯一 ID)
    transaction_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true, // 初始創建時可能為空
    },
    // 訂單金額
    amount: {
        type: DataTypes.DECIMAL(10, 2), // 儲存十進制數字 (例: 1288.00)
        allowNull: false,
    },
    // 服務名稱 (例: '紫微斗數進階詳批', '流年運勢')
    service_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // 交易狀態 (Pending, Success, Failed)
    status: {
        type: DataTypes.ENUM('Pending', 'Success', 'Failed'),
        defaultValue: 'Pending',
        allowNull: false,
    },
    // 交易日期
    transaction_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true
});

module.exports = Order;