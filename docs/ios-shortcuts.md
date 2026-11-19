# CalSnap บน iPhone: แจ้งเตือนมื้ออาหาร และบันทึกมื้อด้วย Action Button

ใช้แอป Shortcuts (คำสั่งลัด) ของ iOS ไม่ต้องติดตั้งอะไรเพิ่ม

ค่าที่ต้องใช้ในทุกขั้นตอน:

- URL หลัก: `https://kalguroo-ai.vercel.app`
- Header ที่ต้องส่งทุกครั้ง: `x-calsnap-token` ค่าเท่ากับ `ACCESS_TOKEN` ที่ตั้งไว้ใน Vercel

## 1. แจ้งเตือนมื้ออาหาร (พร้อมแคลอรี่ที่เหลือ)

ทำเป็น Automation ตามเวลา เช่น 07:30, 12:00, 18:30 (สร้าง 1 อันต่อเวลา)

1. Shortcuts → แท็บ **Automation** → **+** → **Time of Day**
2. ตั้งเวลา และเลือกทำซ้ำ **Daily**
3. เลือก **Run Immediately** (ไม่ต้องกดยืนยันทุกครั้ง) แล้วกด Next
4. เพิ่ม action **Get Contents of URL**
   - URL: `https://kalguroo-ai.vercel.app/api/summary?plain=1`
   - กด Show More → Method: **GET**
   - Headers: เพิ่ม `x-calsnap-token` ค่าเท่า token
5. เพิ่ม action **Show Notification**
   - Title: `CalSnap`
   - Body: เลือกตัวแปร **Contents of URL**
6. กด Done

ผลลัพธ์ตัวอย่าง: `วันนี้กินไป 850/1,800 kcal เหลือ 950 • โปรตีน 40/135g (ขาดอีก 95g)`

หมายเหตุ: ตัวเลขมาจากข้อมูลที่ sync ไว้ใน Supabase ถ้ามื้อล่าสุดยังไม่ถูก sync (เช่น เพิ่งบันทึกและยังไม่ได้เปิดแอปค้างไว้ 3 วินาที) ตัวเลขอาจช้ากว่าจริงเล็กน้อย

## 2. บันทึกมื้อด้วยรูป (ผูกกับ Action Button)

สร้าง Shortcut ชื่อ `CalSnap` ประกอบ action ตามลำดับนี้

1. **Take Photo** (ปิด Show Camera Preview ถ้าอยากให้เร็วขึ้น)
2. **Convert Image** → JPEG (กัน HEIC)
3. **Resize Image** → Width `1280` (ลดขนาดไฟล์ ไม่งั้นเกินขีดจำกัดของเซิร์ฟเวอร์)
4. **Base64 Encode** → Line Breaks: **None**
5. **Get Contents of URL**
   - URL: `https://kalguroo-ai.vercel.app/api/quicklog`
   - Method: **POST**
   - Headers: `x-calsnap-token` = token, `Content-Type` = `application/json`
   - Request Body: **JSON** เพิ่ม 2 ช่อง
     - `image` (Text) = ตัวแปร **Base64 Encoded**
     - `mimeType` (Text) = `image/jpeg`
6. **Get Dictionary Value** → Key `text` (จาก Contents of URL)
7. **Show Notification** หรือ **Show Result** ด้วยค่าที่ได้

ตัวอย่างผลลัพธ์:

```
บันทึกแล้ว: ข้าวกะเพราไก่ไข่ดาว 620 kcal
วันนี้กินไป 1,470/1,800 kcal เหลือ 330 • โปรตีน 62/135g (ขาดอีก 73g)
```

### ผูกกับปุ่ม

- **Action Button** (iPhone 15 Pro ขึ้นไป): Settings → Action Button → **Shortcut** → เลือก `CalSnap`
- **Back Tap** (ทุกรุ่นที่รองรับ): Settings → Accessibility → Touch → Back Tap → เลือก `CalSnap`
- **Control Center / Lock Screen** (iOS 18): เพิ่มปุ่ม Shortcut แล้วเลือก `CalSnap`

### แบบพิมพ์ข้อความ (ไม่ถ่ายรูป)

ทำสำเนา Shortcut แล้วแทน 4 ขั้นแรกด้วย **Ask for Input** (Text) จากนั้นส่ง body เป็น `text` = คำตอบที่พิมพ์ (เช่น `ข้าวมันไก่ ไม่หนัง`) แทน `image`

## มื้อที่บันทึกจาก Shortcut ไปอยู่ที่ไหน

มื้อจะเข้าไปพักใน inbox บนเซิร์ฟเวอร์ก่อน แล้วแอป CalSnap จะรวมเข้าประวัติเองทุกครั้งที่เปิดแอป (หรือสลับกลับมาที่แอป) ไม่ต้องทำอะไรเพิ่ม

## แก้ปัญหา

- ได้ข้อความ `Access token ไม่ถูกต้อง`: token ใน Header ไม่ตรงกับ Vercel
- ได้ `Supabase ... failed`: เช็กว่าตั้ง `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ใน Vercel แล้ว และรัน `supabase/calsnap_backup.sql` แล้ว
- Shortcut ค้างหรือหมดเวลา: รูปใหญ่เกินไป ตรวจว่าใส่ขั้น Resize Image แล้ว
