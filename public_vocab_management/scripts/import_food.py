import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Set default encoding to utf-8 for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables from project root (.env or .env.local)
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=ROOT_DIR / '.env')
load_dotenv(dotenv_path=ROOT_DIR / '.env.local')

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"Error: Missing Supabase URL or Key in {ROOT_DIR / '.env'}")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Curated High-Frequency Food & Dining Vocabulary with Natural Examples & Translations
FOOD_VOCAB = [
    # --- In the Restaurant & Ordering (การสั่งอาหารและในร้านอาหาร) ---
    {
        "word": "appetizer",
        "type": "noun",
        "meaning": "อาหารเรียกน้ำย่อย / ของทานเล่น",
        "example": "Could we order some appetizers while we look at the main menu? (ขอสั่งของทานเล่นก่อนระหว่างดูเมนูจานหลักได้ไหมครับ)"
    },
    {
        "word": "main course",
        "type": "noun",
        "meaning": "อาหารจานหลัก",
        "example": "For the main course, I'd like the grilled salmon with asparagus. (สำหรับจานหลัก ขอเป็นแซลมอนย่างกับหน่อไม้ฝรั่งครับ)"
    },
    {
        "word": "dessert",
        "type": "noun",
        "meaning": "ของหวาน",
        "example": "Make sure you save some room for dessert; their chocolate lava cake is amazing! (อย่าลืมเผื่อท้องไว้กินของหวานด้วยนะ ช็อกโกแลตลาวาของเขาเด็ดมาก)"
    },
    {
        "word": "side dish",
        "type": "noun",
        "meaning": "เครื่องเคียง",
        "example": "Does the steak come with any side dishes like mashed potatoes or salad? (สเต๊กจานนี้มีเครื่องเคียงอย่างมันบดหรือสลัดมาด้วยไหมครับ)"
    },
    {
        "word": "beverage",
        "type": "noun",
        "meaning": "เครื่องดื่ม",
        "example": "Can I get you started with any cold beverages? (รับเครื่องดื่มเย็นๆ ก่อนสักแก้วไหมครับ)"
    },
    {
        "word": "cutlery",
        "type": "noun",
        "meaning": "ชุดช้อน ส้อม มีด บนโต๊ะอาหาร",
        "example": "Excuse me, could we get an extra set of cutlery? (ขอโทษนะคะ ขอชุดช้อนส้อมเพิ่มอีกสักชุดได้ไหมคะ)"
    },
    {
        "word": "napkin",
        "type": "noun",
        "meaning": "กระดาษเช็ดปาก / ผ้าเช็ดปาก",
        "example": "Could you pass me a napkin, please? I spilled some sauce. (ช่วยส่งกระดาษเช็ดปากให้หน่อยได้ไหม ทำซอสหกนิดหน่อย)"
    },
    {
        "word": "reservation",
        "type": "noun",
        "meaning": "การจองโต๊ะล่วงหน้า",
        "example": "We have a dinner reservation for four under the name Alex at 7 PM. (พวกเราจองโต๊ะสำหรับ 4 คนไว้ในชื่ออเล็กซ์ตอนหนึ่งทุ่มครับ)"
    },
    {
        "word": "recommendation",
        "type": "noun",
        "meaning": "เมนูแนะนำ",
        "example": "What's the chef's recommendation for tonight? (เมนูแนะนำของเชฟสำหรับค่ำคืนนี้คืออะไรเหรอครับ)"
    },
    {
        "word": "bill",
        "type": "noun",
        "meaning": "ใบเสร็จ / เช็คบิล",
        "example": "Could we get the bill, please? We're running a bit late. (ขอเช็คบิลหน่อยครับ พอดีรีบไปต่อหน่อย)"
    },
    {
        "word": "tip",
        "type": "noun",
        "meaning": "เงินทิป",
        "example": "In many countries, it's customary to leave a 10-15% tip for good service. (ในหลายประเทศ มีธรรมเนียมให้ทิป 10-15% หากได้รับการบริการที่ดี)"
    },
    {
        "word": "refill",
        "type": "noun",
        "meaning": "การเติมเครื่องดื่มเพิ่ม",
        "example": "Is this iced tea bottomless, or do refills cost extra? (ชาเย็นแก้วนี้เติมฟรีตลอดไหม หรือคิดเงินเพิ่มตอนเติมครับ)"
    },
    {
        "word": "takeout",
        "type": "noun",
        "meaning": "อาหารสั่งกลับบ้าน",
        "example": "I'm too tired to cook tonight, let's just grab some takeout. (คืนนี้เหนื่อยเกินกว่าจะทำกับข้าวแล้ว สั่งอะไรกลับไปกินที่บ้านกันเถอะ)"
    },
    {
        "word": "leftovers",
        "type": "noun",
        "meaning": "อาหารที่เหลือจากมื้อก่อน",
        "example": "Don't throw away the pizza; we can heat up the leftovers tomorrow. (อย่าเพิ่งทิ้งพิซซ่านะ เอาไว้กินของเหลือพรุ่งนี้ได้)"
    },
    {
        "word": "split the bill",
        "type": "phrase",
        "meaning": "หารค่าอาหารกัน / แชร์จ่ายเท่ากัน",
        "example": "Let's split the bill evenly so it's fair for everyone. (มาหารเท่ากันเถอะ จะได้แฟร์ๆ กับทุกคน)"
    },
    {
        "word": "on the side",
        "type": "phrase",
        "meaning": "แยกใส่ถ้วยมาต่างหาก ไม่ราดมา",
        "example": "Could I have the salad dressing on the side, please? (ขอแยกน้ำสลัดต่างหากได้ไหมครับ)"
    },
    {
        "word": "dietary restriction",
        "type": "noun",
        "meaning": "ข้อจำกัดด้านอาหาร (เช่น แพ้/ไม่ทานเนื้อ)",
        "example": "Do you have any dietary restrictions we should know about before ordering? (มีข้อจำกัดเรื่องอาหารอะไรที่ควรบอกก่อนสั่งไหม เช่น ไม่ทานเนื้อหรือแพ้อาหาร)"
    },
    {
        "word": "allergy",
        "type": "noun",
        "meaning": "การแพ้อาหาร",
        "example": "Please let the waiter know that I have a severe peanut allergy. (ช่วยบอกพนักงานด้วยนะว่าฉันแพ้ถั่วลิสงรุนแรงมาก)"
    },
    {
        "word": "portion",
        "type": "noun",
        "meaning": "ปริมาณอาหารต่อจาน",
        "example": "The portions at this restaurant are huge, so we might want to share. (ปริมาณอาหารร้านนี้จานใหญ่มาก เราอาจจะต้องแชร์กันกิน)"
    },

    # --- Taste, Flavor & Texture (รสชาติและเนื้อสัมผัส) ---
    {
        "word": "savory",
        "type": "adjective",
        "meaning": "รสเค็มมันกลมกล่อม / อาหารคาว",
        "example": "I usually prefer savory snacks like roasted nuts over sweet candy. (ปกติฉันชอบของว่างรสเค็มมันอย่างถั่วอบ มากกว่าลูกอมหวานๆ)"
    },
    {
        "word": "spicy",
        "type": "adjective",
        "meaning": "เผ็ดร้อน",
        "example": "Thai papaya salad can be really spicy if you don't ask for less chili. (ส้มตำไทยจะเผ็ดมากเลยนะถ้าไม่สั่งเผ็ดน้อย)"
    },
    {
        "word": "mild",
        "type": "adjective",
        "meaning": "เผ็ดน้อย / รสไม่จัด",
        "example": "Could you make my curry mild? I can't handle spicy food well. (ช่วยทำแกงแบบเผ็ดน้อยให้หน่อยได้ไหม ฉันกินเผ็ดไม่ค่อยเก่ง)"
    },
    {
        "word": "tangy",
        "type": "adjective",
        "meaning": "เปรี้ยวอมหวานสดชื่น / เปรี้ยวจี๊ด",
        "example": "The homemade lemonade has a wonderful tangy flavor. (น้ำมะนาวทำเองมีรสเปรี้ยวอมหวานสดชื่นมาก)"
    },
    {
        "word": "crispy",
        "type": "adjective",
        "meaning": "กรอบบาง กรอบอร่อย",
        "example": "The fried chicken skin was perfectly crispy and not too oily. (หนังไก่ทอดกรอบกำลังดีและไม่อมน้ำมันเลย)"
    },
    {
        "word": "crunchy",
        "type": "adjective",
        "meaning": "กรุบกรอบ เคี้ยวเพลิน",
        "example": "I love adding crunchy fresh cucumber slices to my sandwiches. (ฉันชอบใส่แตงกวาสดกรุบกรอบลงในแซนด์วิชมาก)"
    },
    {
        "word": "tender",
        "type": "adjective",
        "meaning": "เนื้อนุ่มเคี้ยวง่าย ละมุนลิ้น",
        "example": "The braised beef was so tender that it melted in my mouth. (เนื้อตุ๋นนุ่มมากจนแทบจะละลายในปาก)"
    },
    {
        "word": "chewy",
        "type": "adjective",
        "meaning": "เหนียวนุ่ม เคี้ยวหนึบ",
        "example": "Fresh boba pearls should be soft and pleasantly chewy. (ไข่มุกสดต้องนุ่มและเคี้ยวหนึบกำลังดี)"
    },
    {
        "word": "juicy",
        "type": "adjective",
        "meaning": "ฉ่ำน้ำ ชุ่มฉ่ำ",
        "example": "A good burger should have a juicy patty that isn't dried out. (เบอร์เกอร์ที่ดี ตัวเนื้อต้องชุ่มฉ่ำไม่แห้งกระด้าง)"
    },
    {
        "word": "greasy",
        "type": "adjective",
        "meaning": "มันเยิ้ม เลี่ยน",
        "example": "The fries were too greasy because the oil wasn't hot enough. (เฟรนช์ฟรายส์มันเยิ้มเกินไปเพราะน้ำมันไม่ร้อนพอ)"
    },
    {
        "word": "creamy",
        "type": "adjective",
        "meaning": "หอมมัน เนื้อเนียนนุ่ม",
        "example": "This mushroom soup has a delightfully rich and creamy texture. (ซุปเห็ดชามนี้เนื้อเนียนนุ่มหอมมันละมุนลิ้นมาก)"
    },
    {
        "word": "bland",
        "type": "adjective",
        "meaning": "จืดชืด ไร้รสชาติ",
        "example": "Without any salt or garlic, the steamed vegetables tasted bland. (พอไม่ใส่เกลือหรือกระเทียม ผักนึ่งก็เลยรสชาติจืดชืดไปหมด)"
    },
    {
        "word": "rich",
        "type": "adjective",
        "meaning": "รสชาติเข้มข้นจัดเต็ม",
        "example": "The dark chocolate mousse was incredibly rich and decadent. (มูสดาร์กช็อกโกแลตเข้มข้นถึงใจและรสชาติหรูหรามาก)"
    },
    {
        "word": "refreshing",
        "type": "adjective",
        "meaning": "สดชื่น คลายร้อน",
        "example": "A glass of iced watermelon juice is so refreshing on a hot day. (น้ำแตงโมปั่นเย็นๆ สักแก้วชื่นใจมากในวันที่อากาศร้อน)"
    },
    {
        "word": "bitter",
        "type": "adjective",
        "meaning": "ขม",
        "example": "Dark roast coffee has a strong, bitter kick that wakes me right up. (กาแฟคั่วเข้มมีรสขมเข้มสะใจที่ช่วยให้ฉันตื่นเต็มตา)"
    },
    {
        "word": "sweet",
        "type": "adjective",
        "meaning": "หวาน",
        "example": "Thai iced tea is delicious, but it's often a bit too sweet by default. (ชาเย็นไทยอร่อยมาก แต่ปกติมักจะหวานเกินไปนิดนึง)"
    },
    {
        "word": "sour",
        "type": "adjective",
        "meaning": "เปรี้ยว",
        "example": "Green mango with sweet fish sauce is famous for its sour taste. (มะม่วงเปรี้ยวจิ้มน้ำปลาหวานขึ้นชื่อเรื่องความเปรี้ยวจี๊ด)"
    },
    {
        "word": "salty",
        "type": "adjective",
        "meaning": "เค็ม",
        "example": "Potato chips are too salty to eat every single day. (มันฝรั่งทอดกรอบรสเค็มเกินไปที่จะกินทุกวัน)"
    },
    {
        "word": "smoky",
        "type": "adjective",
        "meaning": "หอมกลิ่นควัน / กลิ่นเตาย่าง",
        "example": "The grilled pork skewers have an irresistible smoky aroma. (หมูปิ้งมีกลิ่นหอมควันเตาย่างจนแทบอดใจไม่ไหว)"
    },
    {
        "word": "piping hot",
        "type": "adjective",
        "meaning": "ร้อนฉ่า ร้อนควันฉุย",
        "example": "Be careful, the bowl of noodle soup is piping hot! (ระวังด้วยนะ ชามก๋วยเตี๋ยวยังร้อนควันฉุยอยู่เลย)"
    },

    # --- Cooking Methods & Actions (วิธีการปรุงอาหาร) ---
    {
        "word": "boil",
        "type": "verb",
        "meaning": "ต้มในน้ำเดือด",
        "example": "Boil the eggs for exactly six minutes if you want runny yolks. (ต้มไข่เป็นเวลา 6 นาทีพอดี ถ้าอยากได้ไข่แดงเยิ้มๆ)"
    },
    {
        "word": "simmer",
        "type": "verb",
        "meaning": "เคี่ยวไฟอ่อน",
        "example": "Let the soup simmer gently for an hour to develop rich flavors. (เคี่ยวซุปด้วยไฟอ่อนสักหนึ่งชั่วโมงเพื่อให้รสชาติเข้าเนื้อ)"
    },
    {
        "word": "steam",
        "type": "verb",
        "meaning": "นึ่งด้วยไอน้ำ",
        "example": "Steaming fish with ginger and soy sauce keeps it moist and healthy. (การนึ่งปลากับขิงและซีอิ๊วช่วยให้เนื้อปลายังฉ่ำและดีต่อสุขภาพ)"
    },
    {
        "word": "stir-fry",
        "type": "verb",
        "meaning": "ผัดไฟแรงอย่างรวดเร็ว",
        "example": "Stir-fry the vegetables quickly on high heat to keep them crunchy. (ผัดผักด้วยไฟแรงอย่างรวดเร็วเพื่อให้ผักยังกรอบอยู่)"
    },
    {
        "word": "deep-fry",
        "type": "verb",
        "meaning": "ทอดในน้ำมันท่วม",
        "example": "Deep-fry the chicken wings until golden brown and crispy. (ทอดปีกไก่ในน้ำมันท่วมจนเหลืองทองกรอบน่ากิน)"
    },
    {
        "word": "sauté",
        "type": "verb",
        "meaning": "ผัดในน้ำมันหรือเนยเล็กน้อย",
        "example": "Sauté the minced garlic in olive oil until fragrant. (ผัดกระเทียมสับในน้ำมันมะกอกจนส่งกลิ่นหอม)"
    },
    {
        "word": "grill",
        "type": "verb",
        "meaning": "ย่างบนเตาไฟหรือตะแกรง",
        "example": "We love to grill beef steaks in the backyard every weekend. (พวกเราชอบย่างสเต๊กเนื้อที่สนามหลังบ้านทุกวันหยุด)"
    },
    {
        "word": "roast",
        "type": "verb",
        "meaning": "อบเนื้อสัตว์หรือผักในเตาอบ",
        "example": "Roast the whole chicken at 200°C until the skin is golden. (อบไก่ทั้งตัวที่อุณหภูมิ 200 องศาจนหนังกลายเป็นสีเหลืองทอง)"
    },
    {
        "word": "bake",
        "type": "verb",
        "meaning": "อบขนมหรือเบเกอรี่",
        "example": "My mom bakes fresh sourdough bread every Sunday morning. (คุณแม่อบขนมปังซาวโดว์สดใหม่ทุกเช้าวันอาทิตย์)"
    },
    {
        "word": "braise",
        "type": "verb",
        "meaning": "ตุ๋นในน้ำขลุกขลิกจนเปื่อย",
        "example": "Braise the pork belly slowly until it falls apart with a fork. (ตุ๋นหมูสามชั้นอย่างช้าๆ จนเนื้อเปื่อยนุ่มใช้ส้อมตัดได้ง่ายๆ)"
    },
    {
        "word": "marinate",
        "type": "verb",
        "meaning": "หมักในเครื่องปรุง",
        "example": "Marinate the chicken in soy sauce and black pepper for at least thirty minutes. (หมักไก่ด้วยซีอิ๊วและพริกไทยดำอย่างน้อย 30 นาที)"
    },
    {
        "word": "season",
        "type": "verb",
        "meaning": "ปรุงรสชาติ",
        "example": "Don't forget to season the soup with a pinch of sea salt and pepper. (อย่าลืมปรุงรสซุปด้วยเกลือทะเลและพริกไทยสักหยิบมือนะ)"
    },
    {
        "word": "garnish",
        "type": "verb",
        "meaning": "ตกแต่งจานอาหาร",
        "example": "Garnish the curry with fresh basil leaves before serving. (ตกแต่งแกงด้วยใบโหระพาสดก่อนยกเสิร์ฟ)"
    },
    {
        "word": "chop",
        "type": "verb",
        "meaning": "สับหรือหั่นเป็นชิ้น",
        "example": "Chop the onions finely so they blend smoothly into the sauce. (หั่นหัวหอมให้ละเอียดเพื่อจะได้กลมกลืนไปกับซอส)"
    },
    {
        "word": "dice",
        "type": "verb",
        "meaning": "หั่นเต๋าชิ้นเล็กๆ",
        "example": "Dice the ripe tomatoes and mix them into the salsa. (หั่นมะเขือเทศสุกเป็นลูกเต๋าแล้วคลุกเคล้าลงในซัลซา)"
    },
    {
        "word": "mince",
        "type": "verb",
        "meaning": "สับละเอียด",
        "example": "Mince two cloves of garlic before heating the pan. (สับกระเทียม 2 กลีบให้ละเอียดก่อนตั้งกระทะ)"
    },
    {
        "word": "slice",
        "type": "verb",
        "meaning": "หั่นเป็นแผ่นบาง",
        "example": "Slice the avocado thinly and arrange it over the toast. (หั่นอะโวคาโดเป็นแผ่นบางๆ แล้ววางเรียงบนขนมปังปิ้ง)"
    },
    {
        "word": "whisk",
        "type": "verb",
        "meaning": "ตี (ไข่/ครีม) ให้ขึ้นฟู",
        "example": "Whisk the eggs vigorously with a fork before pouring them into the pan. (ตีไข่ด้วยส้อมแรงๆ ก่อนเทลงในกระทะ)"
    },
    {
        "word": "reheat",
        "type": "verb",
        "meaning": "อุ่นอาหารซ้ำ",
        "example": "You can reheat the leftovers in the microwave for two minutes. (เธอสามารถอุ่นอาหารที่เหลือในไมโครเวฟสักสองนาทีได้นะ)"
    },

    # --- Essential Ingredients & Food Items (วัตถุดิบและอาหารทั่วไป) ---
    {
        "word": "broth",
        "type": "noun",
        "meaning": "น้ำซุปเคี่ยวเข้มข้น",
        "example": "The ramen soup has a rich pork bone broth that simmered for twelve hours. (น้ำซุปราเมนทำจากซุปกระดูกหมูเข้มข้นที่เคี่ยวมานานถึง 12 ชั่วโมง)"
    },
    {
        "word": "ingredient",
        "type": "noun",
        "meaning": "วัตถุดิบ / ส่วนผสม",
        "example": "Fresh local ingredients are the secret behind this delicious pasta. (วัตถุดิบท้องถิ่นสดใหม่คือเคล็ดลับความอร่อยของพาสต้าจานนี้)"
    },
    {
        "word": "recipe",
        "type": "noun",
        "meaning": "สูตรอาหาร / วิธีทำ",
        "example": "Could you share the secret recipe for your signature chocolate cookies? (ช่วยแชร์สูตรลับคุกกี้ช็อกโกแลตซิกเนเจอร์ของคุณหน่อยได้ไหมครับ)"
    },
    {
        "word": "seasoning",
        "type": "noun",
        "meaning": "เครื่องเทศปรุงรส",
        "example": "Check the seasoning of the stew before adding any more salt. (ชิมรสชาติเครื่องปรุงของสตูว์ก่อนที่จะเติมเกลือเพิ่มนะ)"
    },
    {
        "word": "condiment",
        "type": "noun",
        "meaning": "เครื่องปรุงบนโต๊ะ (ซอส พริก มัสตาร์ด)",
        "example": "Ketchup and mustard are the most common condiments for hot dogs. (ซอสมะเขือเทศและมัสตาร์ดคือเครื่องปรุงยอดนิยมสำหรับฮอตด็อก)"
    },
    {
        "word": "dressing",
        "type": "noun",
        "meaning": "น้ำสลัด",
        "example": "I love homemade Caesar dressing with extra parmesan cheese. (ฉันชอบน้ำสลัดซีซาร์ทำเองที่โรยพาร์เมซานชีสเยอะๆ)"
    },
    {
        "word": "garlic",
        "type": "noun",
        "meaning": "กระเทียม",
        "example": "Crush the garlic cloves to release their natural oils and aroma. (บุบกลีบกระเทียมเพื่อให้ปล่อยน้ำมันหอมระเหยและกลิ่นหอมออกมา)"
    },
    {
        "word": "cilantro",
        "type": "noun",
        "meaning": "ผักชี",
        "example": "Some people love cilantro, while others think it tastes like soap. (บางคนชอบผักชีมาก ในขณะที่บางคนรู้สึกว่ารสชาติเหมือนสบู่)"
    },
    {
        "word": "basil",
        "type": "noun",
        "meaning": "ใบโหระพา / กะเพรา",
        "example": "Stir-fried minced pork with holy basil is Thailand's ultimate street food. (ผัดกะเพราหมูสับคือสุดยอดสตรีทฟู้ดอันดับหนึ่งของเมืองไทย)"
    },
    {
        "word": "ginger",
        "type": "noun",
        "meaning": "ขิง",
        "example": "Hot ginger tea helps soothe an upset stomach. (น้ำขิงร้อนช่วยบรรเทาอาการไม่สบายท้องได้ดี)"
    },
    {
        "word": "poultry",
        "type": "noun",
        "meaning": "สัตว์ปีก (ไก่, เป็ด)",
        "example": "Always cook poultry thoroughly to ensure it is safe to eat. (ปรุงเนื้อสัตว์ปีกให้สุกทั่วถึงเสมอเพื่อความปลอดภัยในการรับประทาน)"
    },
    {
        "word": "seafood",
        "type": "noun",
        "meaning": "อาหารทะเล",
        "example": "This coastal town is famous for its ultra-fresh seafood market. (เมืองชายทะเลแห่งนี้ขึ้นชื่อเรื่องตลาดอาหารทะเลที่สดใหม่สุดๆ)"
    },
    {
        "word": "dairy",
        "type": "noun",
        "meaning": "ผลิตภัณฑ์จากนมวัว",
        "example": "If you can't digest dairy, oat milk is a great alternative. (ถ้าคุณย่อยนมวัวไม่ได้ นมข้าวโอ๊ตเป็นทางเลือกที่ดีมาก)"
    },
    {
        "word": "grain",
        "type": "noun",
        "meaning": "ธัญพืช / ข้าวเมล็ดเต็ม",
        "example": "Whole grains like brown rice and quinoa are packed with fiber. (ธัญพืชเต็มเมล็ดอย่างข้าวกล้องและควินัวอุดมไปด้วยไฟเบอร์)"
    },
    {
        "word": "pastry",
        "type": "noun",
        "meaning": "ขนมอบ / เพสตรี้",
        "example": "French bakeries are world-famous for their buttery pastries. (ร้านเบเกอรี่ฝรั่งเศสมีชื่อเสียงระดับโลกเรื่องขนมอบหอมเนย)"
    },
    {
        "word": "staple food",
        "type": "noun",
        "meaning": "อาหารหลักประจำวัน",
        "example": "Rice is the primary staple food for billions of people across Asia. (ข้าวคืออาหารหลักที่สำคัญที่สุดของผู้คนนับพันล้านคนทั่วเอเชีย)"
    },

    # --- Dining Styles & Specialties (สไตล์การทานอาหารและศัพท์เฉพาะ) ---
    {
        "word": "street food",
        "type": "noun",
        "meaning": "อาหารริมทาง / สตรีทฟู้ด",
        "example": "Bangkok's night markets offer some of the best street food in the world. (ตลาดกลางคืนในกรุงเทพฯ มีอาหารสตรีทฟู้ดที่ยอดเยี่ยมที่สุดแห่งหนึ่งของโลก)"
    },
    {
        "word": "comfort food",
        "type": "noun",
        "meaning": "อาหารจานโปรดที่กินแล้วฮีลใจ",
        "example": "A warm bowl of chicken noodle soup is my ultimate comfort food when I'm sick. (ซุปไก่ใส่เส้นร้อนๆ คืออาหารฮีลใจที่ดีที่สุดเวลาที่ฉันป่วย)"
    },
    {
        "word": "homemade",
        "type": "adjective",
        "meaning": "ทำเองที่บ้าน",
        "example": "Nothing beats the taste of warm, homemade apple pie. (ไม่มีอะไรเทียบกับรสชาติของพายแอปเปิ้ลอุ่นๆ ฝีมือทำเองที่บ้านได้เลย)"
    },
    {
        "word": "gourmet",
        "type": "adjective",
        "meaning": "อาหารเกรดพรีเมียม / รสเลิศ",
        "example": "They serve gourmet burgers topped with truffle mayo and aged cheddar. (พวกเขาเสิร์ฟเบอร์เกอร์ระดับกูร์เมต์ที่ท็อปด้วยมายองเนสทรัฟเฟิลและเชดดาร์ชีสบ่ม)"
    },
    {
        "word": "signature dish",
        "type": "noun",
        "meaning": "เมนูเด็ดประจำร้าน",
        "example": "The slow-cooked ribs are definitely the restaurant's signature dish. (ซี่โครงหมูอบรมควันคือเมนูซิกเนเจอร์เด็ดประจำร้านนี้เลย)"
    },
    {
        "word": "brunch",
        "type": "noun",
        "meaning": "มื้อสาย (ควบเช้าและเที่ยง)",
        "example": "Let's meet up for brunch this Sunday and grab some avocado toast. (วันอาทิตย์นี้ไปกินมื้อสายด้วยกันไหม หาโทสต์อะโวคาโดกินกัน)"
    },
    {
        "word": "buffet",
        "type": "noun",
        "meaning": "บุฟเฟต์",
        "example": "The seafood buffet includes all-you-can-eat oysters and crab legs. (บุฟเฟต์อาหารทะเลมีทั้งหอยนางรมและขาปูให้กินได้ไม่อั้น)"
    },
    {
        "word": "vegan",
        "type": "adjective",
        "meaning": "มังสวิรัติแบบวีแกน / อาหารเจ",
        "example": "This cafe offers a completely vegan menu made entirely from plants. (คาเฟ่แห่งนี้มีเมนูวีแกนล้วนที่ทำจากพืชทั้งหมด)"
    },
    {
        "word": "vegetarian",
        "type": "adjective",
        "meaning": "มังสวิรัติ (ไม่ทานเนื้อสัตว์)",
        "example": "Are there any vegetarian options available without meat or fish sauce? (มีเมนูมังสวิรัติที่ไม่ใส่เนื้อสัตว์และน้ำปลาบ้างไหมครับ)"
    },
    {
        "word": "gluten-free",
        "type": "adjective",
        "meaning": "ปลอดกลูเตน",
        "example": "Do you have gluten-free bread for customers with celiac disease? (มีขนมปังแบบปลอดกลูเตนสำหรับลูกค้าที่แพ้กลูเตนไหมครับ)"
    },
    {
        "word": "rare",
        "type": "adjective",
        "meaning": "เนื้อสุกระดับแรร์ (แดงฉ่ำ)",
        "example": "He prefers his steak rare, seared quickly on high heat. (เขาชอบสเต๊กแบบแรร์ที่จี่ไฟแรงอย่างรวดเร็วให้ด้านในยังฉ่ำแดง)"
    },
    {
        "word": "medium-rare",
        "type": "adjective",
        "meaning": "เนื้อสุกระดับมีเดียมแรร์ (สีชมพูฉ่ำ)",
        "example": "I'd like my ribeye steak cooked medium-rare, please. (ขอสเต๊กริบอายความสุกระดับมีเดียมแรร์ครับ)"
    },
    {
        "word": "medium",
        "type": "adjective",
        "meaning": "เนื้อสุกปานกลาง",
        "example": "If you don't like too much red meat, medium is the perfect choice. (ถ้าไม่ชอบเนื้อที่แดงเกินไป ระดับมีเดียมคือตัวเลือกที่กำลังพอดี)"
    },
    {
        "word": "well-done",
        "type": "adjective",
        "meaning": "เนื้อสุกทั่วทั้งชิ้น",
        "example": "Cooking a steak well-done can make it tough if you aren't careful. (การย่างสเต๊กให้สุกทั่วทั้งชิ้นอาจทำให้เนื้อเหนียวได้ถ้าไม่ระวัง)"
    },
    {
        "word": "decaf",
        "type": "noun",
        "meaning": "กาแฟไร้คาเฟอีน",
        "example": "Can I get an iced decaf latte with almond milk, please? (ขอดื่มลาเต้เย็นแบบดีแคฟใส่นมอัลมอนด์แก้วหนึ่งครับ)"
    },
    {
        "word": "sparkling water",
        "type": "noun",
        "meaning": "น้ำเปล่าอัดก๊าซ / โซดา",
        "example": "Would you prefer still water or sparkling water with your meal? (รับเป็นน้ำเปล่าธรรมดาหรือน้ำเปล่าอัดก๊าซคู่กับมื้ออาหารดีครับ)"
    },
    {
        "word": "food court",
        "type": "noun",
        "meaning": "ศูนย์อาหาร",
        "example": "Let's head to the shopping mall food court where everyone can pick what they like. (ไปกินที่ศูนย์อาหารในห้างกันเถอะ ทุกคนจะได้เลือกของที่ตัวเองชอบได้)"
    },
    {
        "word": "culinary",
        "type": "adjective",
        "meaning": "เกี่ยวกับการทำอาหาร",
        "example": "She traveled to Italy to explore its rich culinary traditions. (เธอเดินทางไปอิตาลีเพื่อสำรวจวัฒนธรรมการทำอาหารอันเลื่องชื่อของที่นั่น)"
    },
    {
        "word": "craving",
        "type": "noun",
        "meaning": "ความอยากกินอย่างมาก",
        "example": "I have a sudden craving for spicy ramen late at night. (อยู่ดีๆ ตอนดึกก็นึกอยากกินราเมนเผ็ดๆ ขึ้นมาเฉยเลย)"
    },
    {
        "word": "mouthwatering",
        "type": "adjective",
        "meaning": "น่ากินจนน้ำลายสอ",
        "example": "The bakery window was filled with mouthwatering chocolate croissants. (ตู้โชว์หน้าร้านเบเกอรี่เต็มไปด้วยครัวซองต์ช็อกโกแลตน่ากินจนน้ำลายสอ)"
    },
    {
        "word": "sweet tooth",
        "type": "noun",
        "meaning": "คนชอบกินของหวานเป็นชีวิตจิตใจ",
        "example": "I have a terrible sweet tooth, so I can never say no to ice cream. (ฉันเป็นคนติดกินของหวานมาก ชวนกินไอติมทีไรปฏิเสธไม่ลงทุกที)"
    },
    {
        "word": "aroma",
        "type": "noun",
        "meaning": "กลิ่นหอมของอาหารหรือเครื่องดื่ม",
        "example": "The rich aroma of freshly brewed coffee filled the whole room. (กลิ่นหอมกรุ่นของกาแฟดริปสดใหม่ฟุ้งกระจายไปทั่วทั้งห้อง)"
    },
    {
        "word": "appetite",
        "type": "noun",
        "meaning": "ความอยากอาหาร / ความเจริญอาหาร",
        "example": "Walking around the night market really worked up my appetite. (การเดินเล่นรอบตลาดกลางคืนช่วยกระตุ้นความอยากอาหารได้ดีจริงๆ)"
    },
    {
        "word": "bite-sized",
        "type": "adjective",
        "meaning": "ขนาดพอดีคำ",
        "example": "These bite-sized chicken nuggets are perfect for parties. (นักเก็ตไก่ขนาดพอดีคำพวกนี้เหมาะมากสำหรับงานปาร์ตี้)"
    },
    {
        "word": "aftertaste",
        "type": "noun",
        "meaning": "รสสัมผัสที่ติดค้างในคอหลังจากกลืน",
        "example": "The wine leaves a smooth and pleasant fruity aftertaste. (ไวน์ตัวนี้ทิ้งรสสัมผัสหอมกลิ่นผลไม้ละมุนติดคอหลังจากดื่ม)"
    }
]

def main():
    tag_name = "food"
    
    print(f"Ensuring tag '{tag_name}' exists...")
    tag_res = supabase.table("public_tags").select("id").eq("name", tag_name).execute()
    if not tag_res.data:
        tag_insert = supabase.table("public_tags").insert({"name": tag_name}).execute()
        tag_id = tag_insert.data[0]["id"]
        print(f"Created tag '{tag_name}' with ID: {tag_id}")
    else:
        tag_id = tag_res.data[0]["id"]
        print(f"Found tag '{tag_name}' with ID: {tag_id}")

    limit = len(FOOD_VOCAB)
    print(f"\nStarting import for {limit} food & dining words...")

    inserted_count = 0
    updated_count = 0
    skipped_count = 0

    # Optional force update mode via command-line arg '--update'
    force_update = "--update" in sys.argv

    for i, item in enumerate(FOOD_VOCAB):
        word = item["word"]
        try:
            # 0. Check if word already exists in public_word_bank for category food
            existing = supabase.table("public_word_bank").select("id").eq("word", word).eq("category", tag_name).execute()
            
            if existing.data:
                word_id = existing.data[0]["id"]
                if force_update:
                    update_data = {
                        "meaning": item["meaning"],
                        "type": item.get("type", "noun"),
                        "example": item.get("example", ""),
                    }
                    supabase.table("public_word_bank").update(update_data).eq("id", word_id).execute()
                    print(f"[{i+1}/{limit}] Updated: {word} -> {item['meaning']} ({item.get('type', '')})")
                    updated_count += 1
                else:
                    print(f"[{i+1}/{limit}] Skipped: {word} (Already exists)")
                    skipped_count += 1
                continue

            # 1. Insert into Supabase
            data = {
                "word": word,
                "meaning": item["meaning"],
                "type": item.get("type", "noun"),
                "example": item.get("example", ""),
                "category": tag_name
            }
            
            word_res = supabase.table("public_word_bank").insert(data).execute()
            if word_res.data:
                word_id = word_res.data[0]["id"]
                
                # 2. Insert into junction table if not exists
                junction = supabase.table("public_word_tags").select("*").eq("word_id", word_id).eq("tag_id", tag_id).execute()
                if not junction.data:
                    supabase.table("public_word_tags").insert({
                        "word_id": word_id,
                        "tag_id": tag_id
                    }).execute()
                
                print(f"[{i+1}/{limit}] Inserted: {word} -> {item['meaning']} ({item.get('type', '')})")
                inserted_count += 1
            
            time.sleep(0.05)
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
            time.sleep(0.5)

    print(f"\n==========================================")
    print(f"Done! Inserted: {inserted_count}, Updated: {updated_count}, Skipped: {skipped_count}")
    print(f"Total words in vocabulary set: {limit}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
