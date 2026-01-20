// database.js
const { Sequelize } = require('sequelize');

// 建立 SQLite 連線
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'yidengxingke.db', // 資料庫檔案名稱
  logging: false              // 關閉 SQL log
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