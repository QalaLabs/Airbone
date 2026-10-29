import json

data = json.load(open('scripts/extracted_feedback_sheet_full.json', encoding='utf-8'))
cms = [r for r in data if r.get('Module') == 'CMS']

with open('scripts/cms_tasks_inspected.txt', 'w', encoding='utf-8') as out:
    for r in cms:
        out.write(f"=== {r.get('Task ID')} | Priority: {r.get('Priority')} | Status: {r.get('Status')} ===\n")
        out.write(f"Title: {r.get('Task Title')}\n")
        spec = r.get('Detailed Technical Specification & Target Files') or r.get('cal Specification')
        crit = r.get('Acceptance Criteria') or r.get('cceptance Criter')
        client_ref = r.get('Client Ref')
        out.write(f"Specification:\n{spec}\n\n")
        out.write(f"Acceptance Criteria:\n{crit}\n\n")
        out.write(f"Client Ref: {client_ref}\n\n")
        out.write("-" * 60 + "\n\n")

print(f"Successfully wrote {len(cms)} CMS tasks to scripts/cms_tasks_inspected.txt")
