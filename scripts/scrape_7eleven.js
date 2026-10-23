#!/usr/bin/env node
/**
 * 7-Eleven & Convenience Store Data Ingestion / Scraping Script
 * ใช้สำหรับดึงข้อมูลสินค้าทางการ ฉลากโภชนาการ และบาร์โค้ดจาก Open Food Facts (TH) และ Online Retail Catalogs
 *
 * การใช้งาน:
 *   node scripts/scrape_7eleven.js --keyword "cielo"
 *   node scripts/scrape_7eleven.js --keyword "meiji"
 *   node scripts/scrape_7eleven.js --all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'scraped_products.json');

async function searchOpenFoodFacts(keyword) {
  console.log(`[Scraper] กำลังค้นหาข้อมูลจาก Open Food Facts (Thailand) สำหรับคำค้น: "${keyword}"...`);
  const endpoint = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(keyword)}&search_simple=1&action=process&json=1&page_size=10`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'KalgurooNutritionApp - Thailand - Version 1.0 (contact@kalguroo.app)'
      }
    });

    if (!res.ok) {
      console.warn(`[Scraper] API แจ้งเตือนสถานะ HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    const items = [];
    for (const p of data.products) {
      const name = p.product_name_th || p.product_name || p.generic_name;
      if (!name) continue;

      const n = p.nutriments || {};
      const cal = Math.round(Number(n['energy-kcal_100g'] || n['energy-kcal'] || 0));
      const p_g = Number(n['proteins_100g'] || n['proteins'] || 0);
      const c_g = Number(n['carbohydrates_100g'] || n['carbohydrates'] || 0);
      const f_g = Number(n['fat_100g'] || n['fat'] || 0);
      const s_g = Number(n['sugars_100g'] || n['sugars'] || 0);
      const sod_mg = Math.round((Number(n['sodium_100g'] || n['sodium'] || 0)) * 1000);

      items.push({
        barcode: p.code || '',
        name: name.trim(),
        brand: p.brands || '7-Eleven / Thai Brand',
        calories: cal,
        protein_g: p_g,
        carbs_g: c_g,
        fat_g: f_g,
        sugar_g: s_g,
        sodium_mg: sod_mg,
        portion: p.serving_size || '1 หน่วยบริโภค',
        source: 'Open Food Facts Thailand (ฉลากผู้ผลิตทางการ)',
        scraped_at: new Date().toISOString()
      });
    }

    return items;
  } catch (err) {
    console.error(`[Scraper] เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`);
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  let keywords = ['cielo', 'meiji high protein', 'cp chicken', 'singha lemon soda', 'mama'];

  const kwIndex = args.indexOf('--keyword');
  if (kwIndex !== -1 && args[kwIndex + 1]) {
    keywords = [args[kwIndex + 1]];
  }

  console.log(`=======================================================`);
  console.log(`   Kalguroo Automated Retail & Convenience Store Ingestion`);
  console.log(`=======================================================`);

  let allResults = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      allResults = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch {
      allResults = [];
    }
  }

  for (const kw of keywords) {
    const found = await searchOpenFoodFacts(kw);
    console.log(`✓ พบสินค้า "${kw}": ${found.length} รายการ`);

    for (const item of found) {
      const exists = allResults.some(r => r.name === item.name || (r.barcode && r.barcode === item.barcode));
      if (!exists) {
        allResults.push(item);
      }
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`\nบันทึกข้อมูลเรียบร้อยแล้วที่: ${DATA_FILE}`);
  console.log(`จำนวนสินค้าทั้งหมดในฐานข้อมูลแคช: ${allResults.length} รายการ\n`);
}

main();
