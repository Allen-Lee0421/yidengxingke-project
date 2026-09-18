require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// 安全設定：拒絕不必要的跨來源與超大請求，避免常見 DoS／注入入口。
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; connect-src 'self' https:; upgrade-insecure-requests");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean));
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.has(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed'));
}, credentials: true, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'] }));
app.use(express.json({ limit: '100kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);
const sensitiveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: '操作過於頻繁，請稍後再試' } });

// PostgreSQL 連線池 (Railway 相容)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

// WAF 中介層 - 阻擋常見攻擊
const wafMiddleware = (req, res, next) => {
  const suspiciousPatterns = [/union\s+select/i, /sqlmap/i, /nmap/i, /--/, /drop table/i, /exec\s*\(/i];
  const input = JSON.stringify({ ...req.body, ...req.query, ...req.params }).slice(0, 4096);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      pool.query(`INSERT INTO security_alerts (ip, path, payload, created_at) VALUES ($1, $2, $3, NOW())`,
        [req.ip, req.path, input]).catch((error) => console.error('security_alert_log_error', error.message));
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
function getPrivilegeCodes() {
  try {
    const parsed = JSON.parse(process.env.PRIVILEGE_CODES_JSON || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

app.post('/api/verify-privilege', sensitiveLimiter, async (req, res) => {
  const { code } = req.body;
  const codes = getPrivilegeCodes();
  const configuredCode = Object.keys(codes).find((candidate) => typeof code === 'string' && candidate.length === code.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(code)));
  if (configuredCode) {
    res.json({ success: true, data: codes[configuredCode] });
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

// 名單收集與管理員匯出 API：與 Vercel /api/* 共用同一套處理器
const leadsHandler = require('./api/leads');
const leadsExportHandler = require('./api/leads-export');
const block7Handler = require('./api/block7');
const paymentHandler = require('./api/payment');
const alignHandler = require('./api/align');
const reportHandler = require('./api/report');
const healthHandler = require('./api/health');
app.get('/api/leads/export', leadsExportHandler);
app.all('/api/leads', leadsHandler);
app.all('/api/block7', block7Handler);
app.all('/api/payment', paymentHandler);
app.all('/api/align', alignHandler);
app.all('/api/report', reportHandler);
app.get('/api/health', healthHandler);

// 靜態檔案
app.use(express.static(path.join(__dirname, 'www')));

// SEO 檔案：必須在萬用路由之前處理，避免 sitemap.xml 被首頁 fallback 吃掉
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').sendFile(path.join(__dirname, 'www', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\\nAllow: /\\nSitemap: https://xingdeng.tw/sitemap.xml\\n');
});

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
