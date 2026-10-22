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
1. หากเป็น "สินค้าสำเร็จรูป / ขนม / เครื่องดื่ม / อาหารกล่องที่มีขายในร้านสะดวกซื้อ" (เช่น 7-Eleven, Lawson, Big C mini, Lotus's go fresh, ตรา CP, Betagro, Meiji, ดัชมิลล์, เลย์, มาม่า, อิชิตัน ฯลฯ):
   - หากเห็น "ตารางโภชนาการ (Nutrition Facts)" หรือ "ฉลากหวานมันเค็ม (GDA)" ให้ดึงตัวเลขแคลอรี่และ Macro สารอาหารตามฉลากทางการของสินค้านั้นแบบ 100% ตรงตามจริง
   - หากเห็นหน้าซอง/แพ็กเกจชัดเจนแต่ไม่เห็นตารางด้านหลัง ให้ระบุชื่อสินค้าพร้อมแบรนด์อย่างเป็นทางการ (เช่น "อกไก่นุ่มกระเทียมพริกไทย ตรา ซีพี", "แซนวิชครัวซองต์แฮมชีส 7-Eleven", "นมเมจิไฮโปรตีน กลิ่นกล้วย") และดึงตัวเลขโภชนาการตามฐานข้อมูลทางการของผู้ผลิต
   - กำหนดค่า is_official: true และระบุ source: เช่น "ข้อมูลทางการ 7-Eleven / CP" หรือ "ฉลากโภชนาการทางการ"
2. หากเป็น "อาหารปรุงสด / อาหารตามสั่ง / สตรีทฟู้ด":
   - ประเมินปริมาณและคำนวณแคลอรี่ตามสูตรอาหารไทยมาตรฐาน
   - กำหนดค่า is_official: false และระบุ source: "ประมาณการโดย AI"

ตอบกลับเป็นรูปแบบ JSON เดียวนี้เท่านั้น:
{
  "name": "ชื่ออาหารหรือชื่อสินค้าทางการพร้อมแบรนด์",
  "meal_type": "lunch",
  "portion": "1 ซอง (90g) หรือ 1 จาน",
  "calories": 550,
  "protein_g": 25.0,
  "carbs_g": 60.0,
  "fat_g": 18.0,
  "is_official": true,
  "source": "ข้อมูลทางการ 7-Eleven / CP"
}`;

    // ลำดับโมเดล: เริ่มจากโมเดลที่เร็วและเสถียรที่สุดก่อน (3.5-flash 2-3s)
    const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    const modelsToTry = [...new Set(candidateModels)];

    let lastError = null;

    for (const currentModel of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      // ตั้ง Timeout 3.8 วินาทีต่อโมเดล หากโมเดลไหนค้าง ให้ตัดไปโมเดลถัดไปทันที
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
          const parsed = JSON.parse(textContent);
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
