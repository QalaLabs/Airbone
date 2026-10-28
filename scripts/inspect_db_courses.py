import sys
import psycopg2
import os

sys.stdout.reconfigure(encoding='utf-8')

# Cloud SQL credentials from project memory:
# Host: 34.93.180.179, Port: 5432, Db: airbornedb, User: airborne_app_user
# Password is in admin/.env or .env
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    # check admin/.env
    if os.path.exists("admin/.env"):
        with open("admin/.env", "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    db_url = line.strip().split("=", 1)[1].strip('"').strip("'")
                    break

print("Connecting to DB...")
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute('SELECT "courseInterest", COUNT(*) FROM leads GROUP BY "courseInterest" ORDER BY COUNT(*) DESC;')
    rows = cur.fetchall()
    print("Distinct courseInterest in leads table:")
    for r in rows:
        print(f"  {r[0]!r}: {r[1]}")
    conn.close()
except Exception as e:
    print("DB error:", e)
