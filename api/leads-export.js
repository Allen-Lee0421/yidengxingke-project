const { Pool } = require('pg');

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 2 });
  return pool;
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function send(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async function leadsExportHandler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { success: false, message: '只接受 GET 請求' });
  const expected = String(process.env.ADMIN_EXPORT_TOKEN || '');
  const authorization = String(req.headers.authorization || '');
  const provided = authorization.startsWith('Bearer ') ? authorization.slice(7) : String(req.headers['x-admin-token'] || '');
  if (!expected || !provided || provided !== expected) return send(res, 401, { success: false, message: '未授權' });

  try {
    const db = getPool();
    const result = await db.query(`
      SELECT id, name, email, contact_preference, source, utm_source, utm_medium,
             utm_campaign, utm_content, result_id, referral_code, privacy_consent,
             consent_version, consented_at, created_at, updated_at
      FROM leads
      ORDER BY created_at DESC
    `);
    const columns = ['id', 'name', 'email', 'contact_preference', 'source', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'result_id', 'referral_code', 'privacy_consent', 'consent_version', 'consented_at', 'created_at', 'updated_at'];
    const csv = [columns.map(csvCell).join(','), ...result.rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\n');
    res.status(200).setHeader('Content-Type', 'text/csv; charset=utf-8').setHeader('Content-Disposition', 'attachment; filename="leads-export.csv"');
    return res.end(`\uFEFF${csv}\n`);
  } catch (error) {
    console.error('lead_export_error', error.message);
    return send(res, 503, { success: false, message: '名單匯出服務暫時無法使用' });
  }
};
