// In-memory cache สำหรับ Widget API (รองรับการดึงข้อมูลจาก Scriptable บน iOS)
let widgetCache = {
  totalCal: 0,
  goalCal: 2000,
  remainingCal: 2000,
  percent: 0,
  nextMeal: "มื้อถัดไป",
  advice: "พร้อมบันทึกอาหารมื้อแรกของวัน",
  protein: 0,
  carbs: 0,
  fat: 0,
  updatedAt: new Date().toISOString()
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      widgetCache = {
        totalCal: Number(body.totalCal) || 0,
        goalCal: Number(body.goalCal) || 2000,
        remainingCal: Number(body.remainingCal) || 0,
        percent: Number(body.percent) || 0,
        nextMeal: body.nextMeal || 'มื้อถัดไป',
        advice: body.advice || 'ควบคุมสารอาหารให้พอดี',
        protein: Number(body.protein) || 0,
        carbs: Number(body.carbs) || 0,
        fat: Number(body.fat) || 0,
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json({ success: true, data: widgetCache });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  return res.status(200).json(widgetCache);
}
