// บันทึกมื้อแบบเร็วจาก iOS Shortcuts / Action Button
// POST /api/quicklog  body: { image?: base64, mimeType?, text?, meal_type? }
// วิเคราะห์ด้วย /api/analyze แล้วเก็บมื้อไว้ใน inbox; แอปจะดึง inbox เข้าประวัติเองเมื่อเปิด
import { denyAccess } from './_guard.js';
import { storeConfig, getRow, putRow, bangkokNow, mealTypeForHour, computeSummary } from './_store.js';

export const config = {
  maxDuration: 60
};

const MAX_INBOX = 100;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!process.env.ACCESS_TOKEN) return res.status(500).json({ error: 'ACCESS_TOKEN is not configured on the server' });
  if (denyAccess(req, res)) return;

  const cfg = storeConfig();
  if (!cfg) return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured' });

  const body = req.body || {};
  const hasImage = typeof body.image === 'string' && body.image.length > 0;
  const hasText = typeof body.text === 'string' && body.text.trim().length > 0;
  if (!hasImage && !hasText) return res.status(400).json({ error: 'image or text is required' });

  const now = bangkokNow();
  const mealType = ['breakfast', 'lunch', 'dinner', 'snack'].includes(body.meal_type) ? body.meal_type : mealTypeForHour(now.hour);

  try {
    // เรียก /api/analyze ของแอปเอง ด้วย token เดียวกัน
    const origin = `https://${req.headers.host}`;
    const ar = await fetch(`${origin}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-calsnap-token': req.headers['x-calsnap-token'] || '' },
      body: JSON.stringify({
        image: hasImage ? body.image : undefined,
        mimeType: body.mimeType || 'image/jpeg',
        text: hasText ? body.text : '',
        meal_type: mealType
      })
    });
    const result = await ar.json();
    if (!ar.ok) return res.status(502).json({ error: result.error || 'analyze failed', status: ar.status });

    const meal = {
      id: 'meal_' + Date.now(),
      date: now.date,
      time: now.time,
      name: String(result.name || 'อาหาร').slice(0, 120),
      meal_type: mealType,
      calories: Math.round(Number(result.calories) || 0),
      protein_g: Number(result.protein_g) || 0,
      carbs_g: Number(result.carbs_g) || 0,
      fat_g: Number(result.fat_g) || 0,
      sugar_g: Number(result.sugar_g) || 0,
      sodium_mg: Number(result.sodium_mg) || 0,
      is_official: !!result.is_official,
      source: result.source || 'Shortcut'
    };

    const [main, inbox] = await Promise.all([getRow(cfg, 'main'), getRow(cfg, 'inbox')]);
    const pending = ((inbox && inbox.data && inbox.data.meals) || []).slice(0, MAX_INBOX - 1);
    await putRow(cfg, 'inbox', { meals: [meal, ...pending] });

    const summary = computeSummary(main && main.data, [meal, ...pending]);
    return res.status(200).json({
      ok: true,
      meal,
      summary,
      text: `บันทึกแล้ว: ${meal.name} ${meal.calories} kcal\n${summary.text}`
    });
  } catch (err) {
    return res.status(502).json({ error: err.message, status: err.status, detail: err.detail });
  }
}
