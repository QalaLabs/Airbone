import sys
import psycopg2
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

db_url = os.environ.get("DATABASE_URL")
if not db_url and os.path.exists("admin/.env"):
    with open("admin/.env", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                db_url = line.strip().split("=", 1)[1].strip('"').strip("'")
                break

CANONICAL_COURSES = [
    "Commercial Pilot License (CPL)",
    "Cadet Pilot Program Preparation",
    "Cabin Crew & Aviation Hospitality Training",
    "CAS / COMPASS / ADAPT Cadet Assessment",
    "ATPL Ground School",
    "A320 Simulator Training",
    "Airline Interview Preparation",
    "Flying Training (India & Abroad)",
    "Private Pilot License (PPL)",
    "Flight Dispatcher",
    "Multi-Engine Rating",
    "Instrument Rating",
    "Aviation English (ICAO)",
]

def map_to_canonical(raw):
    if not raw:
        return None
    r = raw.strip()
    if not r or r.lower() in ["not sure yet", "general inquiry", "unknown", ""]:
        return "General Inquiry"
    
    # Cabin crew
    if re.search(r'cabin|hostess|steward', r, re.IGNORECASE):
        return "Cabin Crew & Aviation Hospitality Training"
    
    # Cadet
    if re.search(r'cadet|إعداد الطيارين', r, re.IGNORECASE):
        return "Cadet Pilot Program Preparation"
    
    # Compass / Adapt / CAS
    if re.search(r'compass|adapt|cass', r, re.IGNORECASE):
        return "CAS / COMPASS / ADAPT Cadet Assessment"
        
    # Simulator
    if re.search(r'simulator|sim\b', r, re.IGNORECASE):
        return "A320 Simulator Training"
        
    # ATPL
    if re.search(r'\batpl\b', r, re.IGNORECASE):
        return "ATPL Ground School"
        
    # Airline Prep / GD PI / Type rating
    if re.search(r'airline prep|gd\s*&\s*pi|type rating', r, re.IGNORECASE):
        return "Airline Interview Preparation"
        
    # PPL
    if re.search(r'\bppl\b|private pilot', r, re.IGNORECASE):
        return "Private Pilot License (PPL)"
        
    # Flying training
    if re.search(r'flying training|abroad', r, re.IGNORECASE):
        return "Flying Training (India & Abroad)"
        
    # Flight dispatcher
    if re.search(r'dispatcher', r, re.IGNORECASE):
        return "Flight Dispatcher"
        
    # CPL / Ground school / Pilot
    if re.search(r'\bcpl\b|commercial pilot|ground school|ground classes|pilot course|pilot training|nav class|270000', r, re.IGNORECASE):
        return "Commercial Pilot License (CPL)"
        
    if r == "30000":
        return "CAS / COMPASS / ADAPT Cadet Assessment"
        
    return r

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute('SELECT "courseInterest", COUNT(*) FROM leads GROUP BY "courseInterest" ORDER BY COUNT(*) DESC;')
rows = cur.fetchall()

print("MAPPING SIMULATION:")
mapped_counts = {}
for raw, count in rows:
    canonical = map_to_canonical(raw)
    mapped_counts[canonical] = mapped_counts.get(canonical, 0) + count
    print(f"  {raw!r} ({count}) -> {canonical!r}")

print("\nAGGREGATED CANONICAL COUNTS:")
for can, count in sorted(mapped_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  {can!r}: {count}")

conn.close()
