const { Pool } = require('pg');

let pool;
const rateBuckets = new Map();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREFERENCES = new Set(['line', 'email']);
const MAX_REQUESTS_PER_HOUR = 12;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
  return pool;
}

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function clientKey(req, email) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || req.socket?.remoteAddress || 'unknown';
  return `${ip}|${email}`;
}

function checkRateLimit(req, email) {
  const now = Date.now();
  const key = clientKey(req, email);
  const previous = rateBuckets.get(key) || [];
  const active = previous.filter((timestamp) => now - timestamp < 60 * 60 * 1000);
  if (active.length >= MAX_REQUESTS_PER_HOUR) return false;
  active.push(now);
  rateBuckets.set(key, active);
  if (rateBuckets.size > 5000) {
    for (const [bucketKey, timestamps] of rateBuckets) {
      if (!timestamps.some((timestamp) => now - timestamp < 60 * 60 * 1000)) rateBuckets.delete(bucketKey);
    }
  }
  return true;
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

async function ensureLeadsTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(80),
      email VARCHAR(320) UNIQUE NOT NULL,
      contact_preference VARCHAR(10) NOT NULL,
      source VARCHAR(120) NOT NULL DEFAULT 'direct',
      utm_source VARCHAR(120),
      utm_medium VARCHAR(120),
      utm_campaign VARCHAR(160),
      utm_content VARCHAR(160),
      result_id VARCHAR(80),
      referral_code VARCHAR(80),
      privacy_consent BOOLEAN NOT NULL,
      consent_version VARCHAR(40) NOT NULL,
      consented_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS referral_code VARCHAR(80)');
}

module.exports = async function leadsHandler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { success: false, message: '只接受 POST 請求' });
  const body = req.body || {};
  const email = clean(body.email, 320).toLowerCase();
  const name = clean(body.name, 80);
  const contactPreference = clean(body.contactPreference, 10).toLowerCase();
  const source = clean(body.source, 120) || 'direct';
  const utm = body.utm && typeof body.utm === 'object' ? body.utm : {};
  const honeypot = clean(body.honeypot, 120);

  // 隱藏欄位被填寫時，視為機器人；不回傳可供探測的錯誤細節。
  if (honeypot) return json(res, 204, {});
  if (!EMAIL_PATTERN.test(email) || email.length > 320) return json(res, 400, { success: false, message: '請輸入有效的 Email' });
  if (!PREFERENCES.has(contactPreference)) return json(res, 400, { success: false, message: '請選擇有效的聯繫偏好' });
  if (body.privacyConsent !== true) return json(res, 400, { success: false, message: '請先同意隱私政策與資料收集' });
  if (name.length > 80 || source.length > 120) return json(res, 400, { success: false, message: '提交資料格式不正確' });
  if (!checkRateLimit(req, email)) return json(res, 429, { success: false, message: '提交次數過於頻繁，請稍後再試' });

  const consentVersion = clean(body.consentVersion, 40) || '2026-08-24';
  const resultId = clean(body.resultId, 80);
  const referralCode = clean(body.referralCode, 80);
  const utmSource = clean(utm.source, 120);
  const utmMedium = clean(utm.medium, 120);
  const utmCampaign = clean(utm.campaign, 160);
  const utmContent = clean(utm.content, 160);

  try {
    const db = getPool();
    await ensureLeadsTable(db);
    const result = await db.query(`
      INSERT INTO leads (
        name, email, contact_preference, source, utm_source, utm_medium,
        utm_campaign, utm_content, result_id, referral_code, privacy_consent, consent_version,
        consented_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,$11,NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(NULLIF(EXCLUDED.name, ''), leads.name),
        contact_preference = EXCLUDED.contact_preference,
        source = EXCLUDED.source,
        utm_source = EXCLUDED.utm_source,
        utm_medium = EXCLUDED.utm_medium,
        utm_campaign = EXCLUDED.utm_campaign,
        utm_content = EXCLUDED.utm_content,
        result_id = EXCLUDED.result_id,
        referral_code = COALESCE(NULLIF(EXCLUDED.referral_code, ''), leads.referral_code),
        privacy_consent = TRUE,
        consent_version = EXCLUDED.consent_version,
        consented_at = EXCLUDED.consented_at,
        updated_at = NOW()
      RETURNING id
    `, [name, email, contactPreference, source, utmSource, utmMedium, utmCampaign, utmContent, resultId, referralCode, consentVersion]);
    return json(res, 200, { success: true, leadId: result.rows[0].id, message: '提交成功' });
  } catch (error) {
    console.error('lead_capture_error', error.message);
    return json(res, 503, { success: false, message: '名單服務暫時無法使用，請稍後再試' });
  }
};
