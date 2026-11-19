// Sync ข้อมูลทั้งก้อนของผู้ใช้คนเดียวไปเก็บบน Supabase (ตาราง calsnap_backup, แถว id = 'main')
// ต้องตั้ง env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ACCESS_TOKEN
import { denyAccess } from './_guard.js';

const ROW_ID = 'main';
const MAX_BYTES = 3 * 1024 * 1024;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // sync เขียนด้วย service role จึงต้องมี ACCESS_TOKEN เสมอ
  if (!process.env.ACCESS_TOKEN) {
    return res.status(500).json({ error: 'ACCESS_TOKEN is not configured on the server' });
  }
  if (denyAccess(req, res)) return;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured' });
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const table = `${url.replace(/\/$/, '')}/rest/v1/calsnap_backup`;

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${table}?id=eq.${ROW_ID}&select=data,updated_at`, { headers });
      if (!r.ok) return res.status(502).json({ error: 'Supabase read failed', status: r.status });
      const rows = await r.json();
      if (!rows.length) return res.status(200).json({ exists: false });
      return res.status(200).json({ exists: true, data: rows[0].data, updatedAt: rows[0].updated_at });
    }

    if (req.method === 'POST') {
      const data = req.body && req.body.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return res.status(400).json({ error: 'data object is required' });
      }
      if (JSON.stringify(data).length > MAX_BYTES) {
        return res.status(413).json({ error: 'data too large' });
      }
      const updatedAt = new Date().toISOString();
      const r = await fetch(`${table}?on_conflict=id`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ id: ROW_ID, data, updated_at: updatedAt })
      });
      if (!r.ok) return res.status(502).json({ error: 'Supabase write failed', status: r.status });
      return res.status(200).json({ ok: true, updatedAt });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
