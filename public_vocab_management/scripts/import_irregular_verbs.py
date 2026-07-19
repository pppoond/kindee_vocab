import os
import sys
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from deep_translator import GoogleTranslator

# Set default encoding to utf-8 for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables from .env.local in the root directory
load_dotenv(dotenv_path='../../.env.local')

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase URL or Key in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
translator = GoogleTranslator(source='en', target='th')

def get_irregular_verbs():
    print("Fetching Irregular Verbs JSON...")
    url = "https://raw.githubusercontent.com/WithEnglishWeCan/generated-english-irregular-verbs/master/irregular.verbs.build.json"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            verbs = []
            for v1, details in data.items():
                if not details:
                    continue
                detail = details[0]
                v2_list = detail.get("2", [])
                v3_list = detail.get("3", [])
                
                if v2_list and v3_list:
                    verbs.append({
                        "v1": v1,
                        "v2": v2_list[0], # taking the first option
                        "v3": v3_list[0],
                        "desc": detail.get("description", [""])[0]
                    })
            print(f"Fetched {len(verbs)} irregular verbs.")
            return verbs
        else:
            print(f"Failed to fetch verbs. Status code: {r.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching verbs: {e}")
        return []

def main():
    verbs = get_irregular_verbs()
    if not verbs:
        return

    # Ensure "irregular-verbs" tag exists
    tag_name = "irregular-verbs"
    tag_res = supabase.table("public_tags").select("id").eq("name", tag_name).execute()
    if not tag_res.data:
        tag_insert = supabase.table("public_tags").insert({"name": tag_name}).execute()
        tag_id = tag_insert.data[0]["id"]
    else:
        tag_id = tag_res.data[0]["id"]

    limit = len(verbs)
    print(f"Starting import for {limit} verbs...")

    for i, verb_obj in enumerate(verbs[:limit]):
        word = verb_obj["v1"]
        v2 = verb_obj["v2"]
        v3 = verb_obj["v3"]
        desc = verb_obj["desc"]
        
        try:
            # 0. Check if word already exists
            existing = supabase.table("public_word_bank").select("id").eq("word", word).execute()
            if existing.data:
                print(f"[{i+1}/{limit}] Skipped: {word} (Already exists)")
                continue

            # 1. Translate meaning with trick to force verb translation
            translated = translator.translate('to ' + word)
            prefixes = ['ที่จะ', 'เพื่อ', 'การ']
            for prefix in prefixes:
                translated = translated.replace(prefix, '')
            meaning_th = translated.strip()
            
            # 2. Insert into Supabase
            data = {
                "word": word,
                "meaning": meaning_th,
                "type": "Verb",
                "v2": v2,
                "v3": v3,
                "example": desc,
                "category": "irregular-verbs"
            }
            
            word_res = supabase.table("public_word_bank").insert(data).execute()
            word_id = word_res.data[0]["id"]
            
            # 3. Insert into junction table
            supabase.table("public_word_tags").insert({
                "word_id": word_id,
                "tag_id": tag_id
            }).execute()
            
            print(f"[{i+1}/{limit}] Inserted: {word} (v2: {v2}, v3: {v3}) -> {meaning_th}")
            
            # Sleep slightly to avoid API rate limits
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()
