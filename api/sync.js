// Sync ข้อมูลทั้งก้อนของผู้ใช้คนเดียวไปเก็บบน Supabase (ตาราง calsnap_backup, แถว id = 'main')
// และส่งมื้อที่ค้างใน inbox (จาก /api/quicklog) กลับไปให้แอปรวมเข้าประวัติ
// ต้องตั้ง env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ACCESS_TOKEN
import { denyAccess } from './_guard.js';
import { storeConfig, getRow, putRow } from './_store.js';

const MAX_BYTES = 3 * 1024 * 1024;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // sync เขียนด้วย service role จึงต้องมี ACCESS_TOKEN เสมอ
  if (!process.env.ACCESS_TOKEN) {
    return res.status(500).json({ error: 'ACCESS_TOKEN is not configured on the server' });
  }
  if (denyAccess(req, res)) return;

  const cfg = storeConfig();
  if (!cfg) {
    return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured' });
  }

  try {
    if (req.method === 'GET') {
      const [main, inbox] = await Promise.all([getRow(cfg, 'main'), getRow(cfg, 'inbox')]);
      const inboxMeals = (inbox && inbox.data && inbox.data.meals) || [];
      if (!main) return res.status(200).json({ exists: false, inbox: inboxMeals });
      return res.status(200).json({ exists: true, data: main.data, updatedAt: main.updatedAt, inbox: inboxMeals });
    }

    if (req.method === 'POST') {
      const data = req.body && req.body.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return res.status(400).json({ error: 'data object is required' });
      }
      if (JSON.stringify(data).length > MAX_BYTES) {
        return res.status(413).json({ error: 'data too large' });
      }
      const updatedAt = await putRow(cfg, 'main', data);

      // ลบเฉพาะมื้อใน inbox ที่แอปรวมเข้าประวัติแล้ว (กันมื้อที่เพิ่งเข้ามาระหว่างนั้นหาย)
      const consumed = Array.isArray(req.body.consumedInboxIds) ? req.body.consumedInboxIds.map(String) : [];
      if (consumed.length) {
        const inbox = await getRow(cfg, 'inbox');
        const left = ((inbox && inbox.data && inbox.data.meals) || []).filter(m => !consumed.includes(String(m.id)));
        await putRow(cfg, 'inbox', { meals: left });
      }
      return res.status(200).json({ ok: true, updatedAt });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(502).json({ error: err.message || 'Supabase error', status: err.status, detail: err.detail });
  }
}
