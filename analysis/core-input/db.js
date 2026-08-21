// db.js - 資料庫連接實例
const { Sequelize } = require('sequelize');

// 建立 SQLite 連線，與 server.js 設定一致
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'yidengxingke.db',
  logging: false
});

// 測試連線
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite 連線成功');
  } catch (error) {
    console.error('❌ SQLite 連線失敗:', error);
  }
})();

module.exports = sequelize;