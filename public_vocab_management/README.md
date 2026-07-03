# Public Vocabulary Management

โฟลเดอร์นี้ใช้สำหรับเก็บสคริปต์และ schema ที่ใช้จัดการกับข้อมูลคำศัพท์สาธารณะ เช่น การนำเข้าข้อมูล Oxford 3000 เข้าสู่ฐานข้อมูล

## 1. Database Schema
คุณสามารถรันสคริปต์ในไฟล์ `schema.sql` ผ่าน Supabase SQL Editor เพื่อสร้างตาราง `public_word_bank` ได้เลย

## 2. Python Import Script
ในโฟลเดอร์ `scripts/` มีสคริปต์ `import_oxford_3000.py` สำหรับดึงข้อมูลคำศัพท์จากอินเทอร์เน็ต, แปลเป็นภาษาไทยอัตโนมัติด้วย Google Translate, หาชนิดของคำ (Part of Speech), และบันทึกลงฐานข้อมูล Supabase

### วิธีการรัน

1. เปิด Terminal และเข้าไปที่โฟลเดอร์ `scripts`
   ```bash
   cd public_vocab_management/scripts
   ```

2. ติดตั้ง Python Library ที่จำเป็น
   ```bash
   pip install -r requirements.txt
   ```

3. สร้างไฟล์ `.env.local` ไว้ที่โฟลเดอร์หลักของโปรเจกต์ (ถ้ายังไม่มี) หรือให้แน่ใจว่าใน `.env.local` มีตัวแปรเหล่านี้:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. รันสคริปต์
   ```bash
   python import_oxford_3000.py
   ```

**หมายเหตุ:** สคริปต์จะใช้เวลาพักใหญ่ๆ ในการดึงข้อมูล 3,000 กว่าคำ หากคุณต้องการทดสอบก่อนสามารถแก้โค้ดจาก `words[:limit]` เป็น `words[:10]` ในไฟล์ `import_oxford_3000.py` เพื่อรันแค่ 10 คำแรกได้ครับ
