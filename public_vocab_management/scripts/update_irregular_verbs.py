import os
import sys
import time
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

def get_better_translation(word: str) -> str:
    # Trick to force Google Translate to translate it as a verb
    translated = translator.translate('to ' + word)
    # Clean up common Thai prefixes that represent "to do something"
    prefixes = ['ที่จะ', 'เพื่อ', 'การ']
    for prefix in prefixes:
        translated = translated.replace(prefix, '')
    return translated.strip()

def main():
    print("Fetching irregular verbs from database...")
    # Fetch all irregular verbs
    # Note: If there are many words, we might need pagination, but supabase limit is 1000 by default.
    response = supabase.table("public_word_bank").select("id, word, meaning").eq("category", "irregular-verbs").execute()
    
    words = response.data
    if not words:
        print("No irregular verbs found in database.")
        return

    total = len(words)
    print(f"Found {total} verbs to update.")

    for i, item in enumerate(words):
        word_id = item["id"]
        word = item["word"]
        old_meaning = item.get("meaning", "")
        
        try:
            # 1. Get new translation
            new_meaning = get_better_translation(word)
            
            # If the translation is the same, skip updating
            if old_meaning == new_meaning:
                print(f"[{i+1}/{total}] Skipped: {word} (Already up to date: {new_meaning})")
                continue
                
            # 2. Update the row by id
            supabase.table("public_word_bank").update({"meaning": new_meaning}).eq("id", word_id).execute()
            
            print(f"[{i+1}/{total}] Updated: {word} | '{old_meaning}' -> '{new_meaning}'")
            
            # Sleep slightly to avoid API rate limits
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
            time.sleep(1)

    print("Update complete!")

if __name__ == "__main__":
    main()
