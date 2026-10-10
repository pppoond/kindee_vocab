import os
import sys
import time
import requests
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from deep_translator import GoogleTranslator, MyMemoryTranslator

# Set default encoding to utf-8 and unbuffered output for Windows console
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

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
google_translator = GoogleTranslator(source='en', target='th')
mymemory_translator = MyMemoryTranslator(source='en-US', target='th-TH')

def translate_word(word):
    try:
        res = google_translator.translate(word)
        if res:
            return res
    except Exception:
        pass
    try:
        res = mymemory_translator.translate(word)
        if res:
            return res
    except Exception:
        pass
    return ""

# Curated High-Frequency Essential TOEIC Words (~360+ words)
TOEIC_WORDS = [
    # Contracts & Negotiations
    "abide by", "agreement", "assurance", "cancellation", "clause", "compromise", 
    "concur", "concession", "condition", "conform", "consensus", "consequence", 
    "contract", "contractor", "counteroffer", "covenant", "determine", "dispute", 
    "endorse", "enforce", "engage", "establish", "expire", "expiration", "facilitate", 
    "fulfill", "grievance", "imply", "legitimate", "liability", "mediate", "negotiate", 
    "obligation", "party", "provision", "reimburse", "repudiate", "resolve", 
    "settlement", "specific", "stipulate", "tenant", "terminate", "unanimous", 
    "validate", "violate", "warranty",

    # Marketing, Sales & Advertising
    "acquisition", "adopt", "advertisement", "afford", "appeal", "attract", 
    "brand", "campaign", "clientele", "commercial", "compete", "competitor", 
    "consume", "consumer", "convince", "crucial", "current", "customer", 
    "distributor", "diversity", "evaluation", "exclusive", "expand", "expansion", 
    "fad", "launch", "loyalty", "merchandise", "niche", "perception", 
    "persuade", "potential", "promotion", "publicity", "satisfaction", "survey", 
    "target", "trend",

    # Business Planning & Management
    "accomplish", "allocate", "ambition", "assess", "benchmark", "brainstorm", 
    "collaborate", "coordinate", "credential", "criterion", "deadline", "delegate", 
    "deliberate", "demonstrate", "designate", "devise", "discretion", "dominate", 
    "drastic", "enterprise", "entrepreneur", "executive", "feasibility", "implement", 
    "innovation", "initiative", "mentor", "milestone", "objective", "optimize", 
    "outcome", "oversee", "pioneer", "priority", "productivity", "prospective", 
    "protocol", "quarterly", "strategy", "streamline", "supervise", "synergy", 
    "tackle", "thrive", "undertake", "venture", "viable",

    # Human Resources & Personnel
    "applicant", "appoint", "appraisal", "candidate", "commute", "compensation", 
    "competence", "conduct", "dedicate", "demote", "dismiss", "eligibility", 
    "eligible", "employment", "entitlement", "evaluate", "grievance", "hire", 
    "incentive", "interviewer", "labor", "leave", "mentor", "merit", "nominate", 
    "orientation", "overtime", "pension", "personnel", "probation", "proficiency", 
    "promote", "qualification", "recruit", "reference", "remuneration", "resign", 
    "resume", "retain", "retire", "salary", "shortlist", "severance", "trainee", 
    "transfer", "vacancy", "wage",

    # Office Environment & Operations
    "accessible", "accommodate", "administrative", "agenda", "allocate", "archive", 
    "arrangement", "attendance", "beverage", "bulletin", "catalog", "circular", 
    "clerical", "colleague", "compatible", "complimentary", "confidential", "correspondence", 
    "counterpart", "courier", "directory", "distribute", "duplicate", "efficient", 
    "equipment", "facility", "headquarters", "inventory", "itinerary", "liaison", 
    "maintenance", "memo", "minutes", "notice", "notify", "outgoing", "partition", 
    "photocopy", "postage", "punctual", "receptionist", "reorganize", "requisition", 
    "schedule", "shred", "stationery", "supervisor", "teleconference", "urgent", 
    "workstation",

    # Finance, Accounting & Banking
    "accounting", "accumulate", "acquire", "asset", "audit", "balance", "bankrupt", 
    "borrow", "budget", "capital", "cashier", "collateral", "currency", "debt", 
    "deduct", "deficit", "deposit", "depreciation", "dividend", "downpayment", 
    "expenditure", "fiscal", "forecast", "gross", "inflation", "installment", 
    "interest", "invest", "investment", "invoice", "ledger", "liability", "loan", 
    "lucrative", "margin", "mortgage", "net", "overdraw", "overdue", "portfolio", 
    "profit", "reconcile", "reimbursement", "remittance", "revenue", "shareholder", 
    "solvency", "statement", "surplus", "tariff", "taxation", "transaction", 
    "turnover", "voucher", "wealth", "yield",

    # Purchasing, Production & Shipping
    "assemble", "automate", "cargo", "carrier", "catalog", "commodity", "consignment", 
    "convey", "courier", "customs", "defect", "defective", "deliver", "delivery", 
    "dispatch", "distribute", "dock", "durable", "expedite", "flaw", "freight", 
    "fulfill", "haul", "import", "in transit", "inventory", "logistics", "maintain", 
    "manufacture", "manifest", "merchandise", "output", "package", "patent", 
    "procure", "raw material", "retailer", "shipment", "shortage", "specification", 
    "stock", "supplier", "supply", "tracking", "unpack", "vendor", "warehouse", 
    "warranty", "wholesale",

    # Travel & Transportation
    "accommodate", "baggage", "boarding", "brochure", "cabin", "commute", "confirm", 
    "confirmation", "congestion", "customs", "delay", "departure", "destination", 
    "embark", "fare", "flight", "hospitality", "itinerary", "luggage", "passenger", 
    "passport", "platform", "punctual", "reservation", "route", "runway", "shuttle", 
    "terminal", "ticket", "transit", "validity", "vehicle",

    # Dining & Entertainment
    "appetizer", "banquet", "beverage", "buffet", "cater", "complimentary", 
    "courtesy", "cuisine", "dietary", "entree", "hospitality", "ingredient", 
    "leisure", "menu", "patron", "refreshment", "reservation", "venue",

    # Health, Safety & Insurance
    "coverage", "claim", "compensation", "comply", "hazard", "hygiene", 
    "indemnity", "infection", "inspection", "insurance", "mandatory", "medical", 
    "occupational", "policy", "precaution", "premium", "prescription", "prevent", 
    "protocol", "regulation", "remedy", "safety", "standard", "underwrite"
]

def get_word_details(word):
    # Use Datamuse API for fast and reliable Part of Speech lookup
    pos = ""
    example = ""
    tag_map = {'n': 'noun', 'v': 'verb', 'adj': 'adjective', 'adv': 'adverb'}
    try:
        r = requests.get(f"https://api.datamuse.com/words?sp={word}&md=p&max=1", timeout=2)
        if r.status_code == 200:
            data = r.json()
            if data and "tags" in data[0]:
                for t in data[0]["tags"]:
                    if t in tag_map:
                        pos = tag_map[t]
                        break
    except Exception:
        pass
    return pos, example

def main():
    # Remove duplicates while preserving original order
    seen = set()
    words = []
    for w in TOEIC_WORDS:
        clean_word = w.strip().lower()
        if clean_word and clean_word not in seen:
            seen.add(clean_word)
            words.append(clean_word)

    tag_name = "toeic"
    
    print(f"Ensuring tag '{tag_name}' exists in public_tags...")
    tag_res = supabase.table("public_tags").select("id").eq("name", tag_name).execute()
    if not tag_res.data:
        tag_insert = supabase.table("public_tags").insert({"name": tag_name}).execute()
        tag_id = tag_insert.data[0]["id"]
        print(f"Created tag '{tag_name}' with ID {tag_id}")
    else:
        tag_id = tag_res.data[0]["id"]
        print(f"Found tag '{tag_name}' with ID {tag_id}")

    limit = len(words) 
    print(f"Starting import for {limit} unique TOEIC words...")

    inserted_count = 0
    skipped_count = 0

    for i, word in enumerate(words):
        try:
            # Check if word already exists in public_word_bank for category toeic
            existing = supabase.table("public_word_bank").select("id,type").eq("word", word).eq("category", tag_name).execute()
            if existing.data:
                row = existing.data[0]
                if not row.get("type"):
                    pos, _ = get_word_details(word)
                    if pos:
                        supabase.table("public_word_bank").update({"type": pos}).eq("id", row["id"]).execute()
                        print(f"[{i+1}/{limit}] Updated type for '{word}': {pos}")
                print(f"[{i+1}/{limit}] Skipped: '{word}' (Already exists)")
                skipped_count += 1
                continue

            # 1. Translate meaning into Thai
            meaning_th = translate_word(word)
            
            # 2. Get details (Part of Speech, Example)
            pos, example = get_word_details(word)
            
            # 3. Insert into Supabase public_word_bank
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
                
                # 4. Insert junction into public_word_tags
                junction = supabase.table("public_word_tags").select("*").eq("word_id", word_id).eq("tag_id", tag_id).execute()
                if not junction.data:
                    supabase.table("public_word_tags").insert({
                        "word_id": word_id,
                        "tag_id": tag_id
                    }).execute()
                
                print(f"[{i+1}/{limit}] Inserted: {word} -> {meaning_th} ({pos or 'n/a'})")
                inserted_count += 1
            
            # Small delay to be polite to APIs
            time.sleep(0.3)
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
            time.sleep(0.5)

    print(f"\n==========================================")
    print(f"Done! Inserted: {inserted_count}, Skipped: {skipped_count}, Total words: {limit}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
