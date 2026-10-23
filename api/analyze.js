// ฐานข้อมูลสินค้าทางการร้านสะดวกซื้อ (7-Eleven, Lawson, Supermarket ในประเทศไทย)
import { matchOfficialProduct } from '../data/products.js';

export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const { model = 'gemini-3-flash-preview', text = '', meal_type = 'lunch' } = req.body;

    // รองรับทั้งภาพเดี่ยว (image, mimeType), หลายภาพต่อสินค้า (images) และโหมดข้อความ (text)
    let inputImages = [];
    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      inputImages = req.body.images;
    } else if (req.body.image) {
      inputImages = [{ data: req.body.image, mimeType: req.body.mimeType || 'image/jpeg' }];
    }

    const trimmedText = text.trim();
    if (inputImages.length === 0 && !trimmedText) {
      return res.status(400).json({ error: 'Image data or text description is required' });
    }

    const isTextMode = inputImages.length === 0 && trimmedText.length > 0;

    const prompt = isTextMode 
      ? `คุณคือ AI ผู้เชี่ยวชาญด้านโภชนาการและฐานข้อมูลสินค้าอาหารไทย/สากล
ผู้ใช้พิมพ์ระบุรายการอาหารหรือเครื่องดื่มที่ทาน (เนื่องจากทานหมดแล้วหรือไม่ได้ถ่ายรูปไว้):
"${trimmedText}"

กฎสำคัญในการประมวลผล:
1. หากตรงกับสินค้าในร้านสะดวกซื้อ / แบรนด์ทางการ (เช่น Cielo, เซียโล่, อกไก่นุ่ม CP, นมเมจิ ไฮโปรตีน, โค้กซีโร่, เลย์, มาม่า ฯลฯ):
   - ดึงตัวเลขแคลอรี่, โปรตีน, คาร์บ, ไขมัน, น้ำตาล (sugar_g) และโซเดียม (sodium_mg) ตามฐานข้อมูลทางการของผู้ผลิต 100%
   - กำหนดค่า is_official: true และระบุ source เช่น "ฐานข้อมูลทางการ 7-Eleven / ผู้ผลิต"
2. ระวังเป็นพิเศษกับกลุ่ม "เครื่องดื่ม 0 แคลอรี / 0% น้ำตาล / ไม่มีน้ำตาล (Zero Sugar / 0 Calorie)" เช่น Cielo (เซียโล่ สปาร์คกลิ้งโซดา 0 แคล), Singha Lemon Soda 0 Cal, Coke Zero, Pepsi No Sugar, Mansome 0% Sugar:
   - เครื่องดื่มกลุ่มนี้ แคลอรี่ต้องเป็น 0, โปรตีน 0, ไขมัน 0, คาร์บ 0, น้ำตาล (sugar_g) 0 (โซเดียมอิงตามฉลากขวด เช่น Cielo แอปเปิ้ล 600ml = 160 mg)
   - ห้ามประเมินเป็นเครื่องดื่มหวานหรือน้ำอัดลมปกติเด็ดขาด
3. หากเป็นอาหารปรุงสด / อาหารตามสั่ง / สตรีทฟู้ด (เช่น ข้าวกะเพราไก่ไข่ดาว, ข้าวมันไก่, ส้มตำไทย, สเต๊ก):
   - คำนวณปริมาณแคลอรี่ Macro (โปรตีน คาร์บ ไขมัน น้ำตาล โซเดียม) ตามสูตรมาตรฐานอาหารไทย
   - กำหนดค่า is_official: false และระบุ source: "ประมาณการโดย AI จากข้อความ"

ตอบกลับเป็นรูปแบบ JSON เดียวนี้เท่านั้น:
{
  "name": "ชื่ออาหารหรือชื่อสินค้าทางการพร้อมแบรนด์",
  "meal_type": "${meal_type}",
  "portion": "1 จาน หรือ 1 ซอง (90g) หรือ 1 ขวด (600ml)",
  "calories": 450,
  "protein_g": 20.0,
  "carbs_g": 55.0,
  "fat_g": 15.0,
  "sugar_g": 4.0,
  "sodium_mg": 780,
  "is_official": false,
  "source": "ประมาณการโดย AI จากข้อความ"
}`
      : `คุณคือ AI ผู้เชี่ยวชาญด้านโภชนาการและฐานข้อมูลสินค้าอาหารไทย/สากล
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
  "meal_type": "${meal_type}",
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

    let cleanModel = (model || '').trim();
    if (!cleanModel || cleanModel.includes('2.5') || cleanModel.includes('3.0')) {
      cleanModel = 'gemini-3-flash-preview';
    }

    const candidateModels = [
      cleanModel,
      'gemini-3-flash-preview',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest'
    ].filter(Boolean);
    const modelsToTry = [...new Set(candidateModels)];

    let lastError = null;

    for (const currentModel of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

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
          console.warn(`[Gemini API] ${currentModel} error (${response.status}): ${lastError}. Trying fallback model...`);
          continue;
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
        lastError = err.name === 'AbortError' ? `${currentModel} timed out after 12s` : err.message;
        console.warn(`[Gemini API] ${currentModel} exception: ${lastError}. Trying fallback model...`);
      }
    }

    return res.status(503).json({ error: lastError || 'Server busy, please retry in a moment.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
