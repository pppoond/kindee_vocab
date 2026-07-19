import sys
sys.stdout.reconfigure(encoding='utf-8')
from deep_translator import GoogleTranslator

t = GoogleTranslator(source='en', target='th')
words = ['bear', 'book', 'go', 'see', 'arise', 'awake']
for w in words:
    res = t.translate('to ' + w)
    res = res.replace('ที่จะ', '').replace('เพื่อ', '').replace('การ', '').strip()
    print(f"{w} -> {res}")
