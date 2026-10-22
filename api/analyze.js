export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const { image, mimeType = 'image/jpeg', model = 'gemini-3.8-flash' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const prompt = `คุณคือ AI ผู้เชี่ยวชาญด้านโภชนาการ วิเคราะห์อาหารในภาพนี้อย่างแม่นยำ (เน้นอาหารไทย/เอเชีย)
ระบุชื่ออาหาร, ปริมาณ, ประเภทมื้อที่น่าจะเป็น (breakfast, lunch, dinner, snack), แคลอรี่ และ Macro
ตอบกลับเป็นรูปแบบ JSON เดียวนี้เท่านั้น:
{
  "name": "ชื่ออาหาร",
  "meal_type": "lunch",
  "calories": 550,
  "protein_g": 25.0,
  "carbs_g": 60.0,
  "fat_g": 18.0
}`;

    // รายการโมเดลสำรองอัตโนมัติหากโมเดลหลักติด 503 High Demand
    const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview'];
    const modelsToTry = [...new Set(candidateModels)];

    let lastError = null;

    for (const currentModel of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
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

        const data = await response.json();
        if (!response.ok) {
          lastError = data.error?.message || `HTTP ${response.status}`;
          // หากติด 503 High Demand หรือ 429 Quota ให้สลับไปลองโมเดลตัวถัดไปทันที
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
        lastError = err.message;
      }
    }

    return res.status(503).json({ error: lastError || 'Server busy, please retry in a moment.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
