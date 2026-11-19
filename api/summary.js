// สรุปแคลอรี่วันนี้ สำหรับ iOS Shortcuts (แจ้งเตือนมื้ออาหาร) และวิดเจ็ต
// GET /api/summary          -> JSON
// GET /api/summary?plain=1  -> ข้อความล้วน (ใส่ใน Notification ได้ตรง ๆ)
import { denyAccess } from './_guard.js';
import { storeConfig, getRow, computeSummary } from './_store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!process.env.ACCESS_TOKEN) return res.status(500).json({ error: 'ACCESS_TOKEN is not configured on the server' });
  if (denyAccess(req, res)) return;

  const cfg = storeConfig();
  if (!cfg) return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured' });

  try {
    const [main, inbox] = await Promise.all([getRow(cfg, 'main'), getRow(cfg, 'inbox')]);
    const summary = computeSummary(main && main.data, (inbox && inbox.data && inbox.data.meals) || []);
    if (req.query && req.query.plain) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(summary.text);
    }
    return res.status(200).json(summary);
  } catch (err) {
    return res.status(502).json({ error: err.message, status: err.status, detail: err.detail });
  }
}
