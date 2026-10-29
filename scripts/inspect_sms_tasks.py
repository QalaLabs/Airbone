import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/extracted_feedback_sheet_full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

sms_tasks = [t for t in data if (t.get('Task ID') or '').startswith('SMS-')]
for t in sms_tasks:
    print(f"[{t.get('Task ID')}] ({t.get('Priority')}) {t.get('Task Title')}")
    print(f"  Status in sheet: {t.get('Status')}")
    print(f"  Category: {t.get('Category')}")
    print(f"  Technical Spec: {t.get('Detailed Technical Specification & Target Files')}")
    print(f"  Acceptance Criteria: {t.get('Acceptance Criteria')}")
    print(f"  Client Ref: {t.get('Client Ref')}")
    print("-" * 50)
