export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const { messages = [], model = 'gemini-3-flash-preview', context = {} } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // สร้างบริบทข้อมูลโภชนาการและอาหารที่กินในวันนี้ของผู้ใช้
    const { todayMeals = [], todayTotals = {}, targets = {}, userProfile = {} } = context;

    let mealSummaryText = 'ยังไม่มีการบันทึกอาหารสำหรับวันนี้';
    if (Array.isArray(todayMeals) && todayMeals.length > 0) {
      mealSummaryText = todayMeals.map((m, idx) => {
        return `${idx + 1}. [${m.meal_type || 'มื้ออาหาร'}] ${m.name}: ${m.calories} kcal (P: ${m.protein_g}g, C: ${m.carbs_g}g, F: ${m.fat_g}g, น้ำตาล: ${m.sugar_g || 0}g, โซเดียม: ${m.sodium_mg || 0}mg)`;
      }).join('\n');
    }

    const systemPrompt = `คุณคือ "CalSnap AI Nutritionist & Food Coach" ที่ปรึกษาและโค้ชโภชนาการส่วนบุคคลประจำตัวผู้ใช้
คุณมีความเชี่ยวชาญด้านอาหารไทย ร้านสะดวกซื้อ (7-Eleven) อาหารสุขภาพ และการนับ Macro/Calorie
บุคลิกของคุณ: ฉลาด ทันสมัย เป็นมิตร สุภาพ กระชับ ตรงประเด็นแบบผู้เชี่ยวชาญสาย Tech & Fitness

[ข้อมูลเป้าหมายของผู้ใช้]:
- เป้าหมายแคลอรี่: ${targets.goal || 2000} kcal/วัน
- เป้าหมายสารอาหาร: โปรตีน ${targets.protein || 150}g, คาร์บ ${targets.carbs || 225}g, ไขมัน ${targets.fat || 56}g, น้ำตาลไม่เกิน ${targets.sugar || 24}g, โซเดียมไม่เกิน ${targets.sodium || 2000}mg
- โหมดเป้าหมาย: ${userProfile.goalMode === 'cut' ? 'ลดน้ำหนัก/ลดไขมัน' : userProfile.goalMode === 'bulk' ? 'เพิ่มกล้ามเนื้อ' : 'รักษาสุขภาพ/รักษาน้ำหนัก'}
${userProfile.weight ? `- น้ำหนัก: ${userProfile.weight} kg, ส่วนสูง: ${userProfile.height || '-'} cm` : ''}

[รายการอาหารที่ผู้ใช้กินไปแล้ววันนี้]:
- รวมแคลอรี่วันนี้: ${todayTotals.calories || 0} / ${targets.goal || 2000} kcal (เหลืออีก ${(targets.goal || 2000) - (todayTotals.calories || 0)} kcal)
- สารอาหารสะสม: โปรตีน ${todayTotals.protein || 0}g, คาร์บ ${todayTotals.carbs || 0}g, ไขมัน ${todayTotals.fat || 0}g, น้ำตาล ${todayTotals.sugar || 0}g, โซเดียม ${todayTotals.sodium || 0}mg
- รายการอาหารแต่ละมื้อ:
${mealSummaryText}

[ข้อแนะนำในการตอบ]:
1. นำข้อมูลรายการอาหารที่ผู้ใช้กินจริงข้างต้นมาประกอบการตอบเสมอ เช่น ถ้าถามมื้อต่อไป ให้คำนวณจากแคลอรี่และสารอาหารที่ยังขาดหรือโซเดียมที่เริ่มสะสมเยอะ
2. แนะนำเมนูที่หาทานง่ายในชีวิตประจำวัน (เช่น อาหารตามสั่ง เมนู 7-Eleven) พร้อมระบุเหตุผลและสารอาหารโดยประมาณ
3. ใช้การจัดรูปแบบ Markdown (เช่น ตัวหนา **คำสำคัญ** หรือ Bullet point) ให้อ่านง่ายบนจอมือถือ ห้ามตอบน้ำท่วมทุ่ง
4. ให้กำลังใจและคำแนะนำที่เป็นมิตร`;

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

    // จัดโครงสร้างให้สลับ role: 'user' และ 'model' ตามข้อกำหนดของ Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\n(โปรดยืนยันว่ารับทราบข้อมูลอาหารของผู้ใช้แล้ว)' }]
      },
      {
        role: 'model',
        parts: [{ text: 'เข้าใจข้อมูลและสถิติอาหารของผู้ใช้ทั้งหมดแล้วครับ พร้อมให้คำปรึกษาและคำแนะนำเมนูอาหารครับ!' }]
      }
    ];

    // นำประวัติการคุยมาต่อท้าย (คัดเลือกเฉพาะข้อความที่มี content)
    let expectedRole = 'user';
    for (const msg of messages) {
      const currentRole = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
      if (currentRole === expectedRole) {
        contents.push({
          role: currentRole,
          parts: [{ text: msg.content || '' }]
        });
        expectedRole = currentRole === 'user' ? 'model' : 'user';
      } else if (contents.length > 2) {
        // รวมข้อความกรณีบทบาทซ้ำซ้อน
        const lastContent = contents[contents.length - 1];
        lastContent.parts[0].text += `\n\n${msg.content || ''}`;
      }
    }

    // ตรวจสอบให้ข้อความสุดท้ายเป็นของ user เพื่อให้ model ตอบกลับ
    if (contents.length > 2 && contents[contents.length - 1].role === 'model') {
      contents.pop();
    }

    let lastError = null;

    for (const currentModel of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024
            }
          })
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
          lastError = data.error?.message || `HTTP ${response.status}`;
          console.warn(`[Gemini Chat] ${currentModel} error (${response.status}): ${lastError}`);
          continue;
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ reply: reply.trim() });
        }
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err.name === 'AbortError' ? `${currentModel} timed out after 15s` : err.message;
        console.warn(`[Gemini Chat] ${currentModel} exception: ${lastError}`);
      }
    }

    return res.status(503).json({ error: lastError || 'Server busy, please retry in a moment.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
