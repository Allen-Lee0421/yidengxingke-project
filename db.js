// db.js - 資料庫連接實例

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'yidengxingke.db', // 與 server.js 中的設置一致
    logging: false 
});

module.exports = sequelize; // 將連接實例導出，供所有模型使用