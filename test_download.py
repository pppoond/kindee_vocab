import requests
import json

url = "https://raw.githubusercontent.com/gokhanyavas/Oxford-3000-Word-List/master/Oxford%203000%20Word%20List.txt"
try:
    r = requests.get(url)
    if r.status_code == 200:
        lines = [line.strip() for line in r.text.split('\n') if line.strip()]
        print(f"Total words: {len(lines)}")
        print("First 10 words:", lines[:10])
    else:
        print(f"Failed: {r.status_code}")
except Exception as e:
    print("error:", e)
