import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('admin/src/lib/analytics/report.service.ts', 'r', encoding='utf-8') as f:
    report_service = f.read()

print('=== report.service.ts functions ===')
for m in re.finditer(r'(export\s+(?:async\s+)?function\s+\w+|class\s+\w+)', report_service):
    print(m.group(0))

with open('admin/src/app/(dashboard)/page.tsx', 'r', encoding='utf-8') as f:
    dashboard_page = f.read()

print('\n=== dashboard/page.tsx queries / metrics ===')
for line in dashboard_page.splitlines():
    if any(k in line for k in ['followUp', 'monthlyLeads', 'admissionsCount', 'pendingFollowUps', 'todaysFollowUps', 'apiFetch', 'useQuery']):
        print(line.strip())
