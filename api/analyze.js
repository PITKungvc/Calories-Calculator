// ฐานข้อมูลสินค้าทางการร้านสะดวกซื้อ (7-Eleven, Lawson, Supermarket ในประเทศไทย)
import { matchOfficialProduct } from '../data/products.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const { model = 'gemini-3.5-flash' } = req.body;

    // รองรับทั้งภาพเดี่ยว (image, mimeType) และหลายภาพต่อสินค้า (images: [{ data, mimeType }]) เช่น ภาพหน้าซอง + ฉลากโภชนาการ
    let inputImages = [];
    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      inputImages = req.body.images;
    } else if (req.body.image) {
      inputImages = [{ data: req.body.image, mimeType: req.body.mimeType || 'image/jpeg' }];
    }

    if (inputImages.length === 0) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const prompt = `คุณคือ AI ผู้เชี่ยวชาญด้านโภชนาการและฐานข้อมูลสินค้าอาหารไทย/สากล
วิเคราะห์ภาพอาหารหรือสินค้าในชุดภาพนี้อย่างละเอียด:
(ผู้ใช้อาจส่งภาพของสินค้าเดียวกันหลายมุม เช่น ภาพที่ 1 เป็นหน้าซอง/ขวด และภาพที่ 2+ เป็นตารางโภชนาการ Nutrition Facts หรือฉลาก GDA หวานมันเค็ม ด้านหลังหรือด้านข้าง)

กฎสำคัญในการประมวลผล:
1. หากมีภาพ "ตารางโภชนาการ (Nutrition Facts)" หรือ "ฉลากหวานมันเค็ม (GDA)" ให้ดึงตัวเลข แคลอรี่, โปรตีน, คาร์บ, ไขมัน, น้ำตาล (sugar_g), โซเดียม (sodium_mg) ตามที่พิมพ์อยู่บนตารางจริง 100%
2. ใช้ภาพหน้าซอง/ขวดประกอบเพื่อระบุชื่อสินค้าพร้อมแบรนด์ทางการ (เช่น เครื่องดื่ม Cielo สปาร์คกลิ้ง, อกไก่นุ่ม CP, แซนวิช 7-Eleven) และระบุ portion ตามขนาดบรรจุจริง
3. ระวังเป็นพิเศษกับกลุ่ม "เครื่องดื่ม 0 แคลอรี / 0% น้ำตาล / ไม่มีน้ำตาล (Zero Sugar / 0 Calorie)" เช่น Cielo (เซียโล่ สปาร์คกลิ้งโซดา 0 แคล), Singha Lemon Soda 0 Cal, Coke Zero, Pepsi No Sugar, Mansome 0% Sugar:
   - เครื่องดื่มกลุ่มนี้ แคลอรี่ต้องเป็น 0, โปรตีน 0, ไขมัน 0, คาร์บ 0, น้ำตาล (sugar_g) 0 (โซเดียมอิงตามที่อ่านได้จากตารางฉลากหลังขวด เช่น 160 mg สำหรับ Cielo แอปเปิ้ล)
   - ห้ามประเมินเป็นเครื่องดื่มหวานหรือน้ำอัดลมปกติเด็ดขาด
4. หากเป็น "อาหารปรุงสด / อาหารตามสั่ง / สตรีทฟู้ด":
   - ประเมินปริมาณ แคลอรี่ Macro พร้อมประเมิน น้ำตาล (sugar_g) และ โซเดียม (sodium_mg) ตามสูตรมาตรฐาน
   - กำหนดค่า is_official: false และระบุ source: "ประมาณการโดย AI"

ตอบกลับเป็นรูปแบบ JSON เดียวนี้เท่านั้น:
{
  "name": "ชื่ออาหารหรือชื่อสินค้าทางการพร้อมแบรนด์",
  "meal_type": "lunch",
  "portion": "1 ซอง (90g) หรือ 1 จาน หรือ 1 ขวด (600ml)",
  "calories": 0,
  "protein_g": 0.0,
  "carbs_g": 0.0,
  "fat_g": 0.0,
  "sugar_g": 0.0,
  "sodium_mg": 160,
  "is_official": true,
  "source": "ฉลากทางการ 7-Eleven / AJE Thai"
}`;

    const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    const modelsToTry = [...new Set(candidateModels)];

    let lastError = null;

    for (const currentModel of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      // สร้าง content parts รวมข้อความและรูปภาพทั้งหมดในชุด
      const contentParts = [{ text: prompt }];
      for (const img of inputImages) {
        contentParts.push({
          inline_data: {
            mime_type: img.mimeType || 'image/jpeg',
            data: img.data
          }
        });
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: contentParts
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json'
            }
          })
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        if (!response.ok) {
          lastError = data.error?.message || `HTTP ${response.status}`;
          if (response.status === 503 || response.status === 429) {
            continue;
          }
          return res.status(response.status).json({ error: lastError });
        }

        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textContent) {
          let parsed = JSON.parse(textContent);

          // ตรวจสอบกับฐานข้อมูลสินค้าทางการในระบบเพื่อความแม่นยำ 100%
          const matchedOfficial = matchOfficialProduct(parsed.name);
          if (matchedOfficial) {
            const scannedSodium = Number(parsed.sodium_mg) || 0;
            const scannedSugar = Number(parsed.sugar_g) || 0;

            parsed.name = matchedOfficial.name;
            parsed.calories = matchedOfficial.calories;
            parsed.protein_g = matchedOfficial.protein_g;
            parsed.carbs_g = matchedOfficial.carbs_g;
            parsed.fat_g = matchedOfficial.fat_g;
            // หากสแกนเห็นตัวเลขจากตารางฉลากชัดเจน ให้ใช้ค่าจากฉลากจริง ถ้าไม่เห็นให้ใช้ฐานข้อมูลทางการ
            parsed.sugar_g = matchedOfficial.sugar_g !== undefined ? matchedOfficial.sugar_g : scannedSugar;
            parsed.sodium_mg = scannedSodium > 0 ? scannedSodium : matchedOfficial.sodium_mg;
            parsed.portion = matchedOfficial.portion;
            parsed.is_official = true;
            parsed.source = matchedOfficial.source;
          }

          // ตรวจสอบค่าเริ่มต้นให้เป็นตัวเลขเสมอ
          parsed.sugar_g = Number(parsed.sugar_g) || 0;
          parsed.sodium_mg = Number(parsed.sodium_mg) || 0;

          // Auto-Save Crowdsource Database (ถ้าตั้งค่า Supabase ไว้จะบันทึกอัตโนมัติในพื้นหลัง)
          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_ANON_KEY;
          if (supabaseUrl && supabaseKey && parsed.is_official && parsed.name) {
            fetch(`${supabaseUrl}/rest/v1/verified_products`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify({
                name: parsed.name,
                calories: parsed.calories,
                protein_g: parsed.protein_g,
                carbs_g: parsed.carbs_g,
                fat_g: parsed.fat_g,
                sugar_g: parsed.sugar_g,
                sodium_mg: parsed.sodium_mg,
                portion: parsed.portion,
                source: parsed.source || 'Auto-Verified by AI Scan',
                verified_at: new Date().toISOString()
              })
            }).catch(err => console.warn('Supabase auto-save background error:', err.message));
          }

          return res.status(200).json(parsed);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err.name === 'AbortError' ? `${currentModel} timed out after 3.8s` : err.message;
      }
    }

    return res.status(503).json({ error: lastError || 'Server busy, please retry in a moment.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
