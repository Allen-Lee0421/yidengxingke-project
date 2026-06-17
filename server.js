require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全設定
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// PostgreSQL 連線池 (Railway 相容)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// WAF 中介層 - 阻擋常見攻擊
const wafMiddleware = (req, res, next) => {
  const suspiciousPatterns = [/union\s+select/i, /sqlmap/i, /nmap/i, /--/, /drop table/i, /exec\s*\(/i];
  const input = JSON.stringify({ ...req.body, ...req.query, ...req.params });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      pool.query(`INSERT INTO security_alerts (ip, path, payload, created_at) VALUES ($1, $2, $3, NOW())`, 
        [req.ip, req.path, input]);
      return res.status(403).json({ error: 'Forbidden: Suspicious activity detected.' });
    }
  }
  next();
};
app.use(wafMiddleware);

// 流量存證
app.post('/api/log-traffic', async (req, res) => {
  try {
    const { subdomain, path: reqPath, referrer } = req.body;
    await pool.query(
      `INSERT INTO traffic_logs (ip, subdomain, path, referrer, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      [req.ip, subdomain || 'unknown', reqPath || req.path, referrer || 'direct']
    );
    res.status(200).json({ status: 'logged' });
  } catch (e) {
    res.status(500).json({ error: 'Log failed' });
  }
});

// 特權驗證
const PRIVILEGE_CODES = {
  'MASTER555': { level: 9, name: '最高管理員' },
  'WING999': { level: 7, name: '行銷之翼' },
  'STAR777': { level: 6, name: '星算核心' },
  'FORTUNE111': { level: 5, name: '財運特權' },
  'ALLEEN790': { level: 8, name: '系統創建者' }
};

app.post('/api/verify-privilege', async (req, res) => {
  const { code } = req.body;
  if (PRIVILEGE_CODES[code]) {
    res.json({ success: true, data: PRIVILEGE_CODES[code] });
  } else {
    res.status(403).json({ success: false, message: '無效特權碼' });
  }
});

// 初始化資料庫
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS traffic_logs (
        id SERIAL PRIMARY KEY,
        ip TEXT,
        subdomain TEXT,
        path TEXT,
        referrer TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crypto_payments (
        id SERIAL PRIMARY KEY,
        txid TEXT UNIQUE,
        amount NUMERIC,
        currency TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_tracker (
        id SERIAL PRIMARY KEY,
        project_name TEXT,
        status TEXT,
        progress INTEGER,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS system_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        privilege_level INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS security_alerts (
        id SERIAL PRIMARY KEY,
        ip TEXT,
        path TEXT,
        payload TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_pricing (
        id SERIAL PRIMARY KEY,
        product_key TEXT UNIQUE,
        name TEXT,
        single_price INTEGER,
        monthly_price INTEGER,
        quarterly_price INTEGER,
        yearly_price INTEGER,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 預載定價
    await pool.query(`
      INSERT INTO product_pricing (product_key, name, single_price, monthly_price, quarterly_price, yearly_price)
      VALUES 
        ('yijian_bigdata', '易鑒星科·大數據古法算法公測', 888, 3300, 9900, 36000),
        ('marketing_wing', '行銷之翼·推播矩陣沙盒工具', 1280, 4200, 11800, 45000)
      ON CONFLICT (product_key) DO NOTHING;
    `);

    console.log('✅ 資料庫初始化完成');
  } catch (err) {
    console.error('❌ 資料庫初始化失敗:', err);
  }
}

// 靜態檔案
app.use(express.static(path.join(__dirname, 'www')));

// 萬用路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'fortune_main', 'index.html'));
});

// 啟動
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 星算帝國母艦已啟動於端口 ${PORT}`);
  });
});