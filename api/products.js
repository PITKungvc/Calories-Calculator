// API endpoint สำหรับจัดการฐานข้อมูลสินค้าทางการและระบบ Auto-Save (Crowdsourcing Cache)
import { OFFICIAL_PRODUCTS, matchOfficialProduct } from '../data/products.js';

export default async function handler(req, res) {
  // รองรับ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  // ==========================================
  // GET: ค้นหาข้อมูลสินค้าทางการ
  // ==========================================
  if (req.method === 'GET') {
    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.status(200).json({ count: OFFICIAL_PRODUCTS.length, products: OFFICIAL_PRODUCTS.slice(0, 50) });
    }

    // 1. ค้นหาจากฐานข้อมูลในระบบ (In-Memory Master Catalog)
    const localMatches = OFFICIAL_PRODUCTS.filter(p => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchKeywords = p.keywords?.some(k => k.toLowerCase().includes(query));
      return matchName || matchKeywords;
    });

    // 2. ถ้ามี Supabase ให้ค้นหาจาก Cloud Database เพิ่มเติม
    let cloudMatches = [];
    if (supabaseUrl && supabaseKey) {
      try {
        const cloudRes = await fetch(`${supabaseUrl}/rest/v1/verified_products?name=ilike.*${encodeURIComponent(query)}*&limit=10`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (cloudRes.ok) {
          cloudMatches = await cloudRes.json();
        }
      } catch (err) {
        console.warn('Supabase query failed:', err.message);
      }
    }

    const combined = [...localMatches, ...cloudMatches];
    return res.status(200).json({ count: combined.length, products: combined });
  }

  // ==========================================
  // POST: Auto-Save / บันทึกข้อมูลสินค้าใหม่ที่ยืนยันจากฉลากจริง (Crowdsourcing)
  // ==========================================
  if (req.method === 'POST') {
    try {
      const { name, calories, protein_g = 0, carbs_g = 0, fat_g = 0, sugar_g = 0, sodium_mg = 0, portion = '1 ชิ้น', source = 'ผู้ใช้ยืนยันจากฉลากจริง' } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Product name is required' });
      }

      const verifiedItem = {
        name: name.trim(),
        calories: Number(calories) || 0,
        protein_g: Number(protein_g) || 0,
        carbs_g: Number(carbs_g) || 0,
        fat_g: Number(fat_g) || 0,
        sugar_g: Number(sugar_g) || 0,
        sodium_mg: Number(sodium_mg) || 0,
        portion: portion,
        source: source,
        verified_at: new Date().toISOString()
      };

      // บันทึกลง Supabase หากมีการตั้งค่า Environment Variables ไว้
      let cloudSaved = false;
      if (supabaseUrl && supabaseKey) {
        try {
          const saveRes = await fetch(`${supabaseUrl}/rest/v1/verified_products`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(verifiedItem)
          });
          cloudSaved = saveRes.ok;
        } catch (err) {
          console.warn('Supabase auto-save error:', err.message);
        }
      }

      return res.status(200).json({
        success: true,
        cloud_saved: cloudSaved,
        product: verifiedItem
      });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
