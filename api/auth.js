const crypto = require('crypto');
const { Pool } = require('pg');

let pool;
const attempts = new Map();
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function getClientKey(req, username) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return `${forwarded || req.socket?.remoteAddress || 'unknown'}:${username}`;
}

function allowAttempt(key) {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now - record.startedAt > ATTEMPT_WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) return false;
  record.count += 1;
  return true;
}

function clearExpiredAttempts() {
  const cutoff = Date.now() - ATTEMPT_WINDOW_MS;
  for (const [key, record] of attempts) if (record.startedAt < cutoff) attempts.delete(key);
}
setInterval(clearExpiredAttempts, ATTEMPT_WINDOW_MS).unref();

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }, max: 3, connectionTimeoutMillis: 5000 });
  return pool;
}

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = String(stored || '').split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function issueSession(userId, username) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET is not configured securely');
  const payload = Buffer.from(JSON.stringify({ userId, username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function setSession(res, token) {
  res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
}

function validUsername(value) { return /^[A-Za-z0-9]{6,12}$/.test(value); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { success: false, message: '只接受 POST 請求' });
  const { action, username = '', email = '', password = '' } = req.body || {};
  if (!['register', 'login'].includes(action)) return json(res, 400, { success: false, message: '不支援的操作' });
  if (!validUsername(username)) return json(res, 400, { success: false, message: '會員 ID 必須是 6–12 位英數字' });
  if (password.length < 8 || password.length > 128) return json(res, 400, { success: false, message: '密碼長度需為 8–128 位' });
  if (action === 'register' && !validEmail(email)) return json(res, 400, { success: false, message: '請輸入有效 Email' });
  if (!allowAttempt(getClientKey(req, username))) return json(res, 429, { success: false, message: '嘗試次數過多，請 15 分鐘後再試' });

  try {
    const db = getPool();
    await db.query(`CREATE TABLE IF NOT EXISTS members (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(12) UNIQUE NOT NULL,
      email VARCHAR(320) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    )`);

    if (action === 'register') {
      const passwordHash = hashPassword(password);
      const result = await db.query(
        'INSERT INTO members (username, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id, username',
        [username, email.toLowerCase(), passwordHash]
      );
      if (!result.rowCount) return json(res, 409, { success: false, message: '會員 ID 或 Email 已存在' });
      return json(res, 201, { success: true, message: '註冊成功，請登入' });
    }

    if (action === 'login') {
      const result = await db.query('SELECT id, username, password_hash FROM members WHERE username = $1', [username]);
      const member = result.rows[0];
      if (!member || !verifyPassword(password, member.password_hash)) return json(res, 401, { success: false, message: '會員 ID 或密碼錯誤' });
      await db.query('UPDATE members SET last_login_at = NOW() WHERE id = $1', [member.id]);
      setSession(res, issueSession(member.id, member.username));
      return json(res, 200, { success: true, message: '登入成功', username: member.username });
    }

    return json(res, 400, { success: false, message: '不支援的操作' });
  } catch (error) {
    console.error('auth_error', error.message);
    return json(res, 503, { success: false, message: '會員服務暫時無法使用，請稍後再試' });
  }
};
