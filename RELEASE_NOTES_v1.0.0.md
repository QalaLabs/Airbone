# Release Notes - v1.0.0 Client Delivery

**Date:** 2026-07-25  
**Commit on main:** `cee8c11`  
**Branch for next work:** `feature/post-delivery-phase2` (do not develop on `main`)

## Highlights

- Native CRM (leads, timeline, tasks/notes/comms logs, scoring, convert)
- Admissions workflow (docs, payments/receipts, FeePlan, enroll, batch)
- Student LMS portal (courses, progress, attendance, certificates)
- Faculty portal surfaces
- Website CMS (pages/courses/resources/testimonials/media)
- Operations dashboard (live Prisma metrics only)
- Production hardening (R2 / AI / media graceful fallback)
- Mock data removed from admin surfaces
- Dead UI / unfinished nav hidden

## Deferred (Phase 2+)

- Live Email / SMS / WhatsApp **send**
- Razorpay live checkout
- Visual website builder
- Legacy Frappe CRM parity
- Advanced analytics enhancements
- Advanced CRM / analytics enhancements

## Validation (pre-merge)

- Prisma validate / generate / migrate status
- `npm run typecheck` / `lint` / `build` (admin)

## Production smoke report (2026-07-25)

**URLs:** `https://www.airborneaviation.in` · `https://airbone-admin.vercel.app`

### Blocker - Admin prod lag

- `main` HEAD = `cee8c11` (delivery gate @ 15:51 IST)
- Live admin deploy created **06:51 IST (~9h earlier)** - still serving **pre-gate** UI
- Evidence on live admin: Sales CRM nav, fake “Live Notifications” / Vapi copy, `/api/v1/leads/:id/convert` → **404**, `/api/dashboard/stats` → **404**
- **Action required:** redeploy `airbone-admin` production from `main` (`cee8c11`), then re-smoke convert → enroll

### Public website - PASS

| Check | Result |
|-------|--------|
| Homepage | 200 |
| Courses | 200 |
| Resources | 200 |
| Jobs | 200 |
| Contact | 200 |
| Lead form `POST /api/lead` | success (`Lead captured successfully`) |

### Admin (live build, pre-gate) - PARTIAL

| Check | Result |
|-------|--------|
| Login (`admin@airborneaviation.in`) | PASS → dashboard |
| Dashboard metrics / recent leads | PASS (live leads visible; **fake notification cards still present**) |
| Create Lead (UI) | PASS - `Smoke E2E Admin Lead` |
| Create Lead (public API) | PASS - `Smoke E2E API Lead` |
| Convert Lead → Admission | **BLOCKED** - convert route 404 on live deploy |
| Enroll Student | **BLOCKED** - needs convert / Phase-1 admissions path on live |
| LMS course open/edit | PASS - `/lms` + course `DGCA Ground School - Navigation Fundamentals` |

### Faculty - PASS (empty data OK)

| Check | Result |
|-------|--------|
| Login (`demo.teacher@…` / `DemoTeacher1!`) | PASS role=TEACHER |
| Timetable `/lms/timetable` | PASS |
| Faculty dashboard `/faculty` | PASS (0 students / 0 batches) |
| Assigned students `/faculty/students` | PASS (empty list) |
| Mark attendance | SKIPPED (no assigned sessions in release data) |

### Student portal - PASS

| Check | Result |
|-------|--------|
| Login (`demo.student@…` / `DemoStudent1!`) | PASS → `/portal` |
| Dashboard / courses | PASS - course IN PROGRESS 33% |
| Course player | PASS - PDF iframe loads |
| Progress | PASS - `/portal/progress` shows 4 topics, 33%, streak |
| Certificates page | opened (1 certificate earned on progress report) |

### Logs / runtime (spot check)

- Public routes: all **200**, no probe **500**s
- `vercel logs --environment production --level error --since 2h`: **no error lines returned**
- `vercel logs --status-code 500 --since 2h`: **empty**
- Auth: admin / teacher / student sessions OK (no login failures observed)
- Unauthenticated `/api/dashboard/stats` → **401** (expected)
- Client: no hard runtime crash observed during smoke; admin still shows **legacy mock dashboard copy** until redeploy

## Suggested next steps

1. Redeploy admin production from `main` (`cee8c11`)
2. Re-run: Convert Lead → Admission → Enroll → confirm Sales CRM / fake notifications gone
3. Continue Phase 2 on `feature/post-delivery-phase2` only:
   - Notifications (Email/SMS/WhatsApp)
   - Payments (Razorpay)
   - Website Builder
   - Advanced CRM
   - Analytics enhancements
