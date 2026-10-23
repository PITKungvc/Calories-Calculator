import fs from 'fs';

const TMP_FILE = '/tmp/calsnap_widget.json';

function getThaiDateShort(d = new Date()) {
  try {
    return d.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' });
  } catch(e) {
    const bkk = new Date(d.getTime() + 7 * 3600 * 1000);
    return `${bkk.getUTCDate()}/${bkk.getUTCMonth() + 1}`;
  }
}

let widgetCache = {
  totalCal: 0,
  goalCal: 2000,
  remainingCal: 2000,
  percent: 0,
  date: getThaiDateShort(),
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

  // ดึงข้อมูลล่าสุดจาก /tmp ถ้ามี
  try {
    if (fs.existsSync(TMP_FILE)) {
      widgetCache = JSON.parse(fs.readFileSync(TMP_FILE, 'utf8'));
    }
  } catch (e) {}

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const goal = Number(body.goalCal) || 2000;
      const total = Number(body.totalCal) || 0;
      widgetCache = {
        totalCal: total,
        goalCal: goal,
        remainingCal: body.remainingCal !== undefined ? Number(body.remainingCal) : (goal - total),
        percent: Number(body.percent) || (goal > 0 ? Math.round((total / goal) * 100) : 0),
        date: body.date || getThaiDateShort(),
        nextMeal: body.nextMeal || 'มื้อถัดไป',
        advice: body.advice || 'ควบคุมสารอาหารให้พอดี',
        protein: Number(body.protein) || 0,
        carbs: Number(body.carbs) || 0,
        fat: Number(body.fat) || 0,
        updatedAt: new Date().toISOString()
      };

      try {
        fs.writeFileSync(TMP_FILE, JSON.stringify(widgetCache));
      } catch (e) {}

      return res.status(200).json({ success: true, data: widgetCache });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // GET Request: รองรับ query parameters และตรวจสอบการเปลี่ยนวันใหม่ตามเวลาไทย
  const todayBkk = getThaiDateShort();
  if (widgetCache.date && widgetCache.date !== todayBkk && !req.query.date) {
    widgetCache.totalCal = 0;
    widgetCache.remainingCal = widgetCache.goalCal;
    widgetCache.percent = 0;
    widgetCache.protein = 0;
    widgetCache.carbs = 0;
    widgetCache.fat = 0;
    widgetCache.date = todayBkk;
    widgetCache.advice = "พร้อมบันทึกอาหารมื้อแรกของวัน";
    widgetCache.nextMeal = "มื้อเช้า (Breakfast)";
  } else if (!widgetCache.date) {
    widgetCache.date = todayBkk;
  }

  if (req.query.goal) {
    const qGoal = Number(req.query.goal);
    if (qGoal > 0) {
      widgetCache.goalCal = qGoal;
      widgetCache.remainingCal = qGoal - widgetCache.totalCal;
      widgetCache.percent = Math.round((widgetCache.totalCal / qGoal) * 100);
    }
  }
  if (req.query.date) {
    widgetCache.date = req.query.date;
  }

  return res.status(200).json(widgetCache);
}
