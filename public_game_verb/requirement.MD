ต้องการให้เพิ่ม หน้า game verb writing
โดยจะเป็ดเป็น public ซึ่งจะแยกจากของเดิม ที่เป็น private
แต่ถ้า user login ก็จะเก็บ คะแนน เหมือนเดิม

ซึ่ง Data ที่ใช้ จะดึงจาก table public_word_bank

ซึ่ง เดี๋ยวก่อนจะ Deploy เราจะ insert ข้อมูลลงไปก่อน โดยที่ เราจะไปหา verb 3 ช่องจาก api หรือ ไดๆ ไม่แน่ใจ นายเขียน script ไปหามาเลย แล้ว batch insert ให้หน่อย ทีละ 50 row

และเช็ค src\app\learn\[category] หน่อย ว่า support ของใหม่ ที่เรากำลังทำไหม