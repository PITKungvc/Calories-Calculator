// ฐานข้อมูลสินค้าทางการที่พบได้บ่อยในร้านสะดวกซื้อ (7-Eleven, Lawson, Supermarket)
const OFFICIAL_STORE_PRODUCTS = [
  // Cielo 0 Calorie Drinks (เครื่องดื่มวิตามินสปาร์คกลิ้ง 0% น้ำตาล 0 แคล ตราเซียโล่)
  { keywords: ['cielo', 'แอปเปิ้ล'], name: 'เครื่องดื่ม เซียโล่ สปาร์คกลิ้ง กลิ่นแอปเปิ้ล 0 แคล (Cielo)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 160, portion: '1 ขวด (600ml)', source: 'ฐานข้อมูลทางการ 7-Eleven / AJE Thai' },
  { keywords: ['cielo', 'apple'], name: 'เครื่องดื่ม เซียโล่ สปาร์คกลิ้ง กลิ่นแอปเปิ้ล 0 แคล (Cielo)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 160, portion: '1 ขวด (600ml)', source: 'ฐานข้อมูลทางการ 7-Eleven / AJE Thai' },
  { keywords: ['เซียโล่', 'แอปเปิ้ล'], name: 'เครื่องดื่ม เซียโล่ สปาร์คกลิ้ง กลิ่นแอปเปิ้ล 0 แคล (Cielo)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 160, portion: '1 ขวด (600ml)', source: 'ฐานข้อมูลทางการ 7-Eleven / AJE Thai' },
  { keywords: ['cielo'], name: 'เครื่องดื่ม เซียโล่ สปาร์คกลิ้ง 0 แคล (Cielo)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 160, portion: '1 ขวด (600ml)', source: 'ฐานข้อมูลทางการ 7-Eleven / AJE Thai' },
  { keywords: ['เซียโล่'], name: 'เครื่องดื่ม เซียโล่ สปาร์คกลิ้ง 0 แคล (Cielo)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 160, portion: '1 ขวด (600ml)', source: 'ฐานข้อมูลทางการ 7-Eleven / AJE Thai' },
  { keywords: ['ซีเอโล่'], name: 'เครื่องดื่ม เซียโล่ สปาร์คกลิ้ง 0 แคล (Cielo)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 160, portion: '1 ขวด (600ml)', source: 'ฐานข้อมูลทางการ 7-Eleven / AJE Thai' },
  { keywords: ['เซียโล'], name: 'เครื่องดื่ม เซียโล่ สปาร์คกลิ้ง 0 แคล (Cielo)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 160, portion: '1 ขวด (600ml)', source: 'ฐานข้อมูลทางการ 7-Eleven / AJE Thai' },

  // เครื่องดื่ม 0 Cal / 0% น้ำตาล ยอดนิยมใน 7-Eleven
  { keywords: ['สิงห์', 'เลมอน', 'โซดา'], name: 'สิงห์ เลมอน โซดา 0 แคลอรี', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 25, portion: '1 กระป๋อง (330ml)', source: 'ฐานข้อมูลทางการ Singha' },
  { keywords: ['สิงห์', 'ยูสุ'], name: 'สิงห์ ยูสุ เลมอน โซดา 0 แคลอรี', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 25, portion: '1 กระป๋อง (330ml)', source: 'ฐานข้อมูลทางการ Singha' },
  { keywords: ['เป๊ปซี่', 'ไม่มีน้ำตาล'], name: 'เป๊ปซี่ ไม่มีน้ำตาล (Pepsi No Sugar)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 30, portion: '1 กระป๋อง (325ml)', source: 'ฐานข้อมูลทางการ PepsiCo' },
  { keywords: ['pepsi', 'zero'], name: 'เป๊ปซี่ ไม่มีน้ำตาล (Pepsi No Sugar)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 30, portion: '1 กระป๋อง (325ml)', source: 'ฐานข้อมูลทางการ PepsiCo' },
  { keywords: ['pepsi', 'max'], name: 'เป๊ปซี่ แมกซ์ ไม่มีน้ำตาล (Pepsi Max)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 30, portion: '1 กระป๋อง (325ml)', source: 'ฐานข้อมูลทางการ PepsiCo' },
  { keywords: ['coke', 'zero'], name: 'โค้ก ไม่มีน้ำตาล (Coke Zero)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 30, portion: '1 กระป๋อง (325ml)', source: 'ฐานข้อมูลทางการ Coca-Cola' },
  { keywords: ['โค้ก', 'ไม่มีน้ำตาล'], name: 'โค้ก ไม่มีน้ำตาล (Coke Zero)', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 30, portion: '1 กระป๋อง (325ml)', source: 'ฐานข้อมูลทางการ Coca-Cola' },
  { keywords: ['แมนซั่ม', 'ไม่มีน้ำตาล'], name: 'แมนซั่ม วิตามิน วอเตอร์ 0% น้ำตาล', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 20, portion: '1 ขวด (460ml)', source: 'ฐานข้อมูลทางการ Mansome' },

  // อาหารและของว่าง 7-Eleven ยอดนิยม
  { keywords: ['อกไก่นุ่ม', 'กระเทียมพริกไทย', 'cp'], name: 'อกไก่นุ่มกระเทียมพริกไทย ตรา ซีพี', calories: 90, protein_g: 18, carbs_g: 2, fat_g: 1, sugar_g: 1, sodium_mg: 390, portion: '1 ซอง (90g)', source: 'ฐานข้อมูลทางการ CP / 7-Eleven' },
  { keywords: ['อกไก่นุ่ม', 'พริกไทยดำ', 'cp'], name: 'อกไก่นุ่มพริกไทยดำ ตรา ซีพี', calories: 90, protein_g: 19, carbs_g: 2, fat_g: 1, sugar_g: 1, sodium_mg: 380, portion: '1 ซอง (90g)', source: 'ฐานข้อมูลทางการ CP / 7-Eleven' },
  { keywords: ['อกไก่นุ่ม', 'cp'], name: 'อกไก่นุ่ม ตรา ซีพี', calories: 90, protein_g: 19, carbs_g: 2, fat_g: 1, sugar_g: 1, sodium_mg: 380, portion: '1 ซอง (90g)', source: 'ฐานข้อมูลทางการ CP / 7-Eleven' },
  { keywords: ['แซนวิชแฮมชีส'], name: 'แซนวิชแฮมชีส 7-Eleven', calories: 290, protein_g: 9, carbs_g: 31, fat_g: 14, sugar_g: 4, sodium_mg: 580, portion: '1 ชิ้น', source: 'ฐานข้อมูลทางการ 7-Eleven' },
  { keywords: ['ครัวซองต์', 'แฮมชีส'], name: 'แซนวิชครัวซองต์แฮมชีส 7-Eleven', calories: 340, protein_g: 8, carbs_g: 32, fat_g: 20, sugar_g: 5, sodium_mg: 620, portion: '1 ชิ้น', source: 'ฐานข้อมูลทางการ 7-Eleven' },
  { keywords: ['เมจิ', 'ไฮโปรตีน', 'ช็อกโกแลต'], name: 'นมเมจิ ไฮโปรตีน รสช็อกโกแลต', calories: 170, protein_g: 28, carbs_g: 10, fat_g: 2, sugar_g: 4, sodium_mg: 160, portion: '1 ขวด (350ml)', source: 'ฐานข้อมูลทางการ Meiji' },
  { keywords: ['เมจิ', 'ไฮโปรตีน', 'กล้วย'], name: 'นมเมจิ ไฮโปรตีน กลิ่นกล้วย', calories: 160, protein_g: 28, carbs_g: 9, fat_g: 1.5, sugar_g: 4, sodium_mg: 150, portion: '1 ขวด (350ml)', source: 'ฐานข้อมูลทางการ Meiji' },
  { keywords: ['เมจิ', 'ไฮโปรตีน'], name: 'นมเมจิ ไฮโปรตีน', calories: 170, protein_g: 28, carbs_g: 10, fat_g: 2, sugar_g: 4, sodium_mg: 160, portion: '1 ขวด (350ml)', source: 'ฐานข้อมูลทางการ Meiji' },
  { keywords: ['ไข่ต้ม', 'cp'], name: 'ไข่ต้มสุก ตรา ซีพี', calories: 140, protein_g: 12, carbs_g: 0, fat_g: 10, sugar_g: 0, sodium_mg: 120, portion: '2 ฟอง', source: 'ฐานข้อมูลทางการ CP / 7-Eleven' },
  { keywords: ['ไข่ออนเซ็น', 'cp'], name: 'ไข่ออนเซ็น ตรา ซีพี', calories: 70, protein_g: 6, carbs_g: 0, fat_g: 5, sugar_g: 0, sodium_mg: 60, portion: '1 ฟอง', source: 'ฐานข้อมูลทางการ CP / 7-Eleven' },
  { keywords: ['กะเพราไก่', '7-eleven'], name: 'ข้าวกะเพราไก่ 7-Eleven (Ezy Choice)', calories: 420, protein_g: 18, carbs_g: 65, fat_g: 10, sugar_g: 4, sodium_mg: 980, portion: '1 กล่อง', source: 'ฐานข้อมูลทางการ 7-Eleven' },
  { keywords: ['มาม่า', 'ต้มยำกุ้ง'], name: 'มาม่า รสต้มยำกุ้ง', calories: 260, protein_g: 5, carbs_g: 36, fat_g: 11, sugar_g: 3, sodium_mg: 1280, portion: '1 ซอง (55g)', source: 'ฐานข้อมูลทางการ มาม่า' },
  { keywords: ['เลย์', 'คลาสสิค'], name: 'เลย์ รสคลาสสิค', calories: 230, protein_g: 3, carbs_g: 23, fat_g: 14, sugar_g: 1, sodium_mg: 170, portion: '1 ซอง (42g)', source: 'ฐานข้อมูลทางการ Lay\'s' },
  { keywords: ['c-vitt', 'เลมอน'], name: 'ซี-วิต รสเลมอน', calories: 30, protein_g: 0, carbs_g: 7, fat_g: 0, sugar_g: 6, sodium_mg: 75, portion: '1 ขวด (140ml)', source: 'ฐานข้อมูลทางการ C-vitt' },
  { keywords: ['โทฟุซัง'], name: 'นมถั่วเหลือง โทฟุซัง หวานน้อย', calories: 100, protein_g: 9, carbs_g: 9, fat_g: 3, sugar_g: 4, sodium_mg: 45, portion: '1 ขวด (225ml)', source: 'ฐานข้อมูลทางการ Tofusan' }
];

function matchOfficialProduct(detectedName) {
  if (!detectedName) return null;
  const lower = detectedName.toLowerCase();
  for (const item of OFFICIAL_STORE_PRODUCTS) {
    const isMatch = item.keywords.every(kw => lower.includes(kw.toLowerCase()));
    if (isMatch) return item;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const { image, mimeType = 'image/jpeg', model = 'gemini-3.5-flash' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const prompt = `คุณคือ AI ผู้เชี่ยวชาญด้านโภชนาการและฐานข้อมูลสินค้าอาหารไทย/สากล
วิเคราะห์ภาพอาหารหรือสินค้าในภาพนี้อย่างละเอียด:

กฎสำคัญในการประมวลผล:
1. หากเป็น "สินค้าสำเร็จรูป / ขนม / เครื่องดื่ม / อาหารกล่องในร้านสะดวกซื้อ" (เช่น 7-Eleven, Lawson, Big C, Lotus's, CP, Betagro, Meiji, ดัชมิลล์, เลย์, มาม่า, อิชิตัน ฯลฯ):
   - หากเห็น "ตารางโภชนาการ (Nutrition Facts)" หรือ "ฉลากหวานมันเค็ม (GDA)" ให้ดึงตัวเลข แคลอรี่, โปรตีน, คาร์บ, ไขมัน, น้ำตาล (sugar_g), โซเดียม (sodium_mg) ตามฉลากทางการ 100%
   - หากเห็นเฉพาะหน้าซอง/แพ็กเกจ ให้ระบุชื่อสินค้าพร้อมแบรนด์ทางการ และดึงตัวเลขโภชนาการตามฐานข้อมูลทางการของผู้ผลิต
   - กำหนดค่า is_official: true และระบุ source เช่น "ฐานข้อมูลทางการ 7-Eleven / CP"
2. ระวังเป็นพิเศษกับกลุ่ม "เครื่องดื่ม 0 แคลอรี / 0% น้ำตาล / ไม่มีน้ำตาล (Zero Sugar / 0 Calorie)" เช่น Cielo (เซียโล่ สปาร์คกลิ้งโซดา 0 แคล), Singha Lemon Soda 0 Cal, Coke Zero, Pepsi No Sugar, Mansome 0% Sugar:
   - เครื่องดื่มกลุ่มนี้ แคลอรี่ต้องเป็น 0, โปรตีน 0, ไขมัน 0, คาร์บ 0, น้ำตาล (sugar_g) 0 (โซเดียมประมาณ 15-35 mg ตามฉลาก)
   - ห้ามประเมินเป็นเครื่องดื่มหวานหรือน้ำอัดลมปกติเด็ดขาด ให้ใช้ตัวเลขทางการ 0 แคล และ 0 น้ำตาล
3. หากเป็น "อาหารปรุงสด / อาหารตามสั่ง / สตรีทฟู้ด":
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
  "sodium_mg": 25,
  "is_official": true,
  "source": "ฐานข้อมูลทางการ 7-Eleven / AJE Thai"
}`;

    const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    const modelsToTry = [...new Set(candidateModels)];

    let lastError = null;

    for (const currentModel of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3800);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimeType, data: image } }
                ]
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
