// Best-effort rate limit สำหรับการใช้ GEMINI_API_KEY ของเซิร์ฟเวอร์
// หมายเหตุ: เก็บในหน่วยความจำของ instance เดียว (serverless) จึงกันได้เฉพาะการยิงรัว ๆ
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;
const hits = new Map();

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// คืน true ถ้าเกินโควตา
export function isRateLimited(req) {
  const now = Date.now();
  const ip = clientIp(req);
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_REQUESTS;
}

// ตรวจ token ส่วนตัว: ตั้ง ACCESS_TOKEN ใน Vercel แล้วแอปจะส่ง header x-calsnap-token
// ถ้าไม่ได้ตั้ง ACCESS_TOKEN จะไม่บังคับ (กันแอปพังก่อนตั้งค่า) คืน true ถ้าไม่ผ่าน
export function denyAccess(req, res) {
  const expected = process.env.ACCESS_TOKEN;
  if (!expected) return false;
  const got = req.headers['x-calsnap-token'];
  if (typeof got === 'string' && got === expected) return false;
  res.status(401).json({ error: 'Access token ไม่ถูกต้อง ใส่ token ในหน้าตั้งค่า' });
  return true;
}
