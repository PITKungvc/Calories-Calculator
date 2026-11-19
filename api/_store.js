// ตัวช่วยอ่าน/เขียนตาราง calsnap_backup บน Supabase (ใช้ร่วมกันใน sync, summary, quicklog)
// ต้องตั้ง env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

export function storeConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // key แบบใหม่ (sb_secret_...) ไม่ใช่ JWT จึงส่งผ่าน apikey อย่างเดียว; key แบบ legacy (JWT) ส่ง Bearer ด้วย
  const headers = { apikey: key, 'Content-Type': 'application/json' };
  if (!key.startsWith('sb_')) headers.Authorization = `Bearer ${key}`;
  return { table: `${url.replace(/\/$/, '')}/rest/v1/calsnap_backup`, headers };
}

// คืน { data, updatedAt } หรือ null ถ้าไม่มีแถว; throw ถ้า Supabase ตอบ error
export async function getRow(cfg, id) {
  const r = await fetch(`${cfg.table}?id=eq.${encodeURIComponent(id)}&select=data,updated_at`, { headers: cfg.headers });
  if (!r.ok) {
    const err = new Error('Supabase read failed');
    err.status = r.status;
    err.detail = (await r.text()).slice(0, 300);
    throw err;
  }
  const rows = await r.json();
  return rows.length ? { data: rows[0].data, updatedAt: rows[0].updated_at } : null;
}

export async function putRow(cfg, id, data) {
  const updatedAt = new Date().toISOString();
  const r = await fetch(`${cfg.table}?on_conflict=id`, {
    method: 'POST',
    headers: { ...cfg.headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id, data, updated_at: updatedAt })
  });
  if (!r.ok) {
    const err = new Error('Supabase write failed');
    err.status = r.status;
    err.detail = (await r.text()).slice(0, 300);
    throw err;
  }
  return updatedAt;
}

// วันที่/เวลาตามเขตเวลาไทย (รูปแบบเดียวกับที่แอปเก็บ: YYYY-MM-DD และ HH:MM)
export function bangkokNow(d = new Date()) {
  const bkk = new Date(d.getTime() + 7 * 3600 * 1000);
  const iso = bkk.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16), hour: bkk.getUTCHours() + bkk.getUTCMinutes() / 60 };
}

export function mealTypeForHour(h) {
  if (h >= 4 && h < 10.5) return 'breakfast';
  if (h >= 10.5 && h < 14.5) return 'lunch';
  if (h >= 14.5 && h < 17.5) return 'snack';
  if (h >= 17.5 && h < 21.5) return 'dinner';
  return 'snack';
}

function safeParse(s, fallback) {
  try { return JSON.parse(s); } catch (e) { return fallback; }
}

// สรุปวันนี้จากข้อมูลที่ sync ไว้ + มื้อที่ยังค้างใน inbox
export function computeSummary(mainData, inboxMeals = []) {
  const data = mainData || {};
  const meals = safeParse(data.calsnap_v1_meals, []);
  const config = safeParse(data.calsnap_v1_config, {});
  const profile = safeParse(data.calsnap_user_profile, {});
  const now = bangkokNow();

  const ids = new Set(meals.map(m => m.id));
  const all = [...inboxMeals.filter(m => !ids.has(m.id)), ...meals];
  const today = all.filter(m => m.date === now.date);

  const sum = k => Math.round(today.reduce((s, m) => s + (Number(m[k]) || 0), 0));
  const eaten = sum('calories');
  const goal = Number(config.goal) || Number(profile.targetDailyCalories) || 2000;
  const protein = sum('protein_g');
  const proteinGoal = Math.round((goal * 0.30) / 4);
  const remaining = goal - eaten;
  const proteinLeft = Math.max(0, proteinGoal - protein);

  let text = `วันนี้กินไป ${eaten.toLocaleString('en-US')}/${goal.toLocaleString('en-US')} kcal`;
  text += remaining >= 0 ? ` เหลือ ${remaining.toLocaleString('en-US')}` : ` เกินเป้า ${(-remaining).toLocaleString('en-US')}`;
  text += ` • โปรตีน ${protein}/${proteinGoal}g`;
  if (proteinLeft > 0 && remaining > 0) text += ` (ขาดอีก ${proteinLeft}g)`;
  if (today.length === 0) text = `ยังไม่มีบันทึกวันนี้ เป้าหมาย ${goal.toLocaleString('en-US')} kcal`;

  return {
    date: now.date,
    eaten, goal, remaining,
    protein, proteinGoal, proteinLeft,
    carbs: sum('carbs_g'), fat: sum('fat_g'),
    mealCount: today.length,
    text
  };
}
