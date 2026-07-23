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

BUSINESS_WORDS = [
    "accountability", "acquisition", "agenda", "agreement", "allocation", "amortization", "analysis", 
    "applicant", "appraisal", "asset", "audit", "authorization", "balance sheet", "benchmark", 
    "beneficiary", "brainstorm", "brand", "budget", "business model", "capital", "cash flow", 
    "collateral", "commission", "commodity", "compliance", "compromise", "conglomerate", "consensus", 
    "consultant", "consumer", "contingency", "contract", "corporation", "cost-effective", "currency", 
    "customer service", "deadline", "debt", "deficit", "deliverable", "demand", "depreciation", 
    "development", "distribution", "diversification", "dividend", "downsizing", "efficiency", 
    "endorsement", "enterprise", "entrepreneur", "equity", "evaluation", "executive", "expenditure", 
    "export", "feasibility", "feedback", "finance", "forecast", "franchise", "gross profit", 
    "growth", "headquarters", "human resources", "import", "incentive", "income", "inflation", 
    "infrastructure", "innovation", "insolvency", "insurance", "interest rate", "inventory", 
    "investment", "investor", "invoice", "joint venture", "key performance indicator", "leadership", 
    "liability", "liquidity", "logistics", "management", "margin", "market share", "marketing", 
    "merger", "milestone", "monopoly", "mortgage", "negotiation", "net profit", "networking", 
    "objective", "outsourcing", "overhead", "partnership", "patent", "payroll", "penetration", 
    "portfolio", "presentation", "productivity", "profit", "project", "proposal", "prospective", 
    "prototype", "qualification", "quarter", "quota", "receipt", "recession", "recruitment", 
    "refund", "reimbursement", "resolution", "resource", "restructuring", "retail", "retention", 
    "revenue", "risk management", "sales", "shareholder", "solvency", "speculation", "sponsor", 
    "stakeholder", "statistic", "stock", "strategy", "subsidiary", "supplier", "supply chain", 
    "surplus", "synergy", "target", "tariff", "tax", "telecommute", "terms", "transaction", 
    "turnover", "underwrite", "valuation", "vendor", "venture capital", "viability", "wholesale", 
    "yield"
]

def get_word_details(word):
    # Call free dictionary API to get part of speech and example
    formatted_word = word.replace(" ", "%20")
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{formatted_word}"
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
    words = BUSINESS_WORDS
    tag_name = "business"
    
    print(f"Ensuring tag '{tag_name}' exists...")
    tag_res = supabase.table("public_tags").select("id").eq("name", tag_name).execute()
    if not tag_res.data:
        tag_insert = supabase.table("public_tags").insert({"name": tag_name}).execute()
        tag_id = tag_insert.data[0]["id"]
        print(f"Created tag '{tag_name}' with ID {tag_id}")
    else:
        tag_id = tag_res.data[0]["id"]
        print(f"Found tag '{tag_name}' with ID {tag_id}")

    limit = len(words) 
    print(f"Starting import for {limit} business words...")

    inserted_count = 0
    skipped_count = 0

    for i, word in enumerate(words):
        try:
            # 0. Check if word already exists in public_word_bank for category business
            existing = supabase.table("public_word_bank").select("id").eq("word", word).eq("category", tag_name).execute()
            if existing.data:
                print(f"[{i+1}/{limit}] Skipped: {word} (Already exists)")
                skipped_count += 1
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
                "category": tag_name
            }
            
            word_res = supabase.table("public_word_bank").insert(data).execute()
            if word_res.data:
                word_id = word_res.data[0]["id"]
                
                # 4. Insert into junction table if not exists
                junction = supabase.table("public_word_tags").select("*").eq("word_id", word_id).eq("tag_id", tag_id).execute()
                if not junction.data:
                    supabase.table("public_word_tags").insert({
                        "word_id": word_id,
                        "tag_id": tag_id
                    }).execute()
                
                print(f"[{i+1}/{limit}] Inserted: {word} -> {meaning_th} ({pos})")
                inserted_count += 1
            
            time.sleep(0.3)
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
            time.sleep(0.5)

    print(f"\nDone! Inserted: {inserted_count}, Skipped: {skipped_count}")

if __name__ == "__main__":
    main()
