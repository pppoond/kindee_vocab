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

def get_word_list():
    print("Fetching Oxford 3000 word list...")
    url = "https://raw.githubusercontent.com/gokhanyavas/Oxford-3000-Word-List/master/Oxford%203000%20Word%20List.txt"
    r = requests.get(url)
    if r.status_code == 200:
        words = [line.strip() for line in r.text.split('\n') if line.strip()]
        print(f"Fetched {len(words)} words.")
        return words
    else:
        print("Failed to fetch words.")
        return []

def get_word_details(word):
    # Call free dictionary API to get part of speech and example
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()[0]
            meanings = data.get("meanings", [])
            if meanings:
                first_meaning = meanings[0]
                pos = first_meaning.get("partOfSpeech", "")
                definitions = first_meaning.get("definitions", [])
                example = ""
                for df in definitions:
                    if "example" in df:
                        example = df["example"]
                        break
                return pos, example
    except Exception as e:
        pass
    return "", ""

def main():
    words = get_word_list()
    if not words:
        return

    # Ensure "oxford3000" tag exists
    tag_name = "oxford3000"
    tag_res = supabase.table("public_tags").select("id").eq("name", tag_name).execute()
    if not tag_res.data:
        tag_insert = supabase.table("public_tags").insert({"name": tag_name}).execute()
        tag_id = tag_insert.data[0]["id"]
    else:
        tag_id = tag_res.data[0]["id"]

    # To avoid rate limits and taking forever, let's allow batching or limits
    # You can change the limit to process all (e.g., words[:100] for test)
    limit = len(words) 
    print(f"Starting import for {limit} words...")

    for i, word in enumerate(words[:limit]):
        try:
            # 0. Check if word already exists
            existing = supabase.table("public_word_bank").select("id").eq("word", word).execute()
            if existing.data:
                print(f"[{i+1}/{limit}] Skipped: {word} (Already exists)")
                continue

            # 1. Translate meaning
            meaning_th = translator.translate(word)
            
            # 2. Get details (Part of Speech, Example)
            pos, example = get_word_details(word)
            
            # 3. Insert into Supabase
            data = {
                "word": word,
                "meaning": meaning_th,
                "type": pos,
                "example": example,
                "category": "oxford3000"
            }
            
            word_res = supabase.table("public_word_bank").insert(data).execute()
            word_id = word_res.data[0]["id"]
            
            # 4. Insert into junction table
            supabase.table("public_word_tags").insert({
                "word_id": word_id,
                "tag_id": tag_id
            }).execute()
            
            print(f"[{i+1}/{limit}] Inserted: {word} -> {meaning_th} ({pos})")
            
            # Sleep slightly to avoid API rate limits
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()
