-- เพิ่ม Policy ให้สามารถ Insert ข้อมูลได้ (สำหรับใช้รัน Python Script)
CREATE POLICY "Anyone can insert public_tags" ON public_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert public_word_bank" ON public_word_bank FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert public_word_tags" ON public_word_tags FOR INSERT WITH CHECK (true);
