import sys
import psycopg2
import os

sys.stdout.reconfigure(encoding='utf-8')

db_url = os.environ.get("DATABASE_URL")
if not db_url and os.path.exists("admin/.env"):
    with open("admin/.env", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                db_url = line.strip().split("=", 1)[1].strip('"').strip("'")
                break

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute('SELECT id, slug, title, status FROM courses ORDER BY "order" ASC;')
    rows = cur.fetchall()
    print(f"Total courses in courses table: {len(rows)}")
    for r in rows:
        print(f"  {r[0]} | {r[1]} | {r[2]} | {r[3]}")
    conn.close()
except Exception as e:
    print("DB error:", e)
