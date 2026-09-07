# CLIENT FEEDBACK REMEDIATION RESULT

Status of every client-feedback item (`A1` … `N1`) from the master remediation map after the remediation pass.

**Verdict: CONDITIONALLY PRODUCTION READY — all code-verifiable items closed, all verification green. Not scored `PRODUCTION READY` because live provider smoke (Interakt WhatsApp, OTP delivery webhook, telephony/payment gateways) and an actual production deployment have not been performed/evidenced.**

Per-item classification tags: **(A)** verified already-correct during remediation · **(B)** implemented in this pass · **(C)** N/A / out of scope · **(D)** deferred — needs live/prod · **(E)** found + fixed incidentally.

## 1. Executive Summary

Every client-feedback item (A1/O, C1/C2/C3/C5, D, F1/F2/F3, G1/G2, H1/H2, I3–I8, L1/L2, M1, N1) was either verified correct or remediated with concrete code and validated end-to-end: the full admin gated test suite (**280/280**), fee/deals/admission integration suites (**33/33** on the fee+admission group, deals lifecycle green), marketing OTP unit tests (**5/5**), `tsc` clean on both apps, `next lint` clean (marketing only pre-existing warnings), production builds of both apps, a fresh-DB **18/18 migration-from-zero replay with zero drift**, seed idempotency (run twice), and a live HTTP matrix against both running apps wired to the **local** test database (including a G1 latency datum). One **new defect was confirmed and closed during this pass** (I7 — follow-up timestamps serialized as UTC wall-clock into a local-time input, causing a 5.5h IST shift). No code was committed, pushed, or deployed; no production database was touched.

## 2. Baseline

- Scope: the client-feedback master map `A1…N1` (27 sections aggregated), derived from prior exploration of the product surfaces (admin CRM/dossiers/payments/fee-plans/jobs; marketing site). The admin item codes are an internal map, not a repo document.
- Pre-conditions: most back-end remediation (D, I2/L2, L1, N1, M1 code, I6) and its verification was already in the working tree; this pass completed the remaining UI items (G2 hand-off, C5 filter, H/I batch, A1/O jobs logo) and ran the full verification suite.

## 3. A1/O — Hiring-Partner / Job logo & image handling — **CLOSED (B, with one (A) verify)**
- **O (marketing)**: `src/app/jobs/JobsClient.jsx:407-437` already renders `job.airlineLogo` as a circular avatar with a ✈ fallback when absent. Verified (A).
- **A1 (admin)**: `admin/src/app/(dashboard)/jobs/[id]/page.tsx` rendered no logo. Added an `IMG` resolution flow: reads `hiringPartner.logoId` (already returned by `job.repository.ts`), fetches the asset URL via the existing `GET /api/v1/media/[id]`, renders it in the job header with an initial-letter avatar fallback. `tsc` + lint clean.

## 4. C1 — Fee-plan percent-of-fee items — **CLOSED (A)**
- Editor (`admin/src/app/(dashboard)/fee-plans/page.tsx`) fully supports fixed-₹ and `% of fee` items (25/50/75/100 presets, per-item ≤100% validation, live total preview against a course-fee input).
- Server: `fee-plan.service.ts` `planComputation`/`hasPercentItems` → `fee-calculation.service.ts` `computePlanTotal`/`computePlanItemAmount` (percent-offers resolve against the base course fee; fixed items ignore it); `admission.service.ts` resolves percent items into the fee snapshot (`buildFeePlanSnapshot`) and requires a base fee when a plan has percent items. Unit tests for percent computation pass.

## 5. C2 — Fee ledger full trace — **CLOSED (A)**
- Admission dossier (`admissions/page.tsx`) shows course/discount/final/paid/balance, credit-on-account, refunds, receipt count and per-installment breakdown with percent resolution and due dates (`planItemDueDate`) — the complete ledger trace. Payments page renders the global ledger with refund entry. Verified correct.

## 6. C3 — 2026 fee & fee-update workflow — **CLOSED (A)**
- Fee editing (`feeAmount`/`feeDiscount` PATCH) re-runs `planComputation` and snapshot re-resolution server-side; covered by `admission-lifecycle.integration.test.ts` (snapshot stability + re-resolution after fee/item mutation). 2026 cabin-crew fee = **₹54,000** via the D decision (section 9).

## 7. C5 — Payment-method dropdown: remove `ONLINE` — **CLOSED (B)**
- Backend `payment.schema.ts` already rejects `ONLINE` via the `nonOnlineMethod` refine (A).
- Admission-dossier select (`admissions/page.tsx` line ~151) already excluded `ONLINE` prior to this pass (A; verified via git diff).
- `admin/src/app/(dashboard)/payments/page.tsx` filter still listed `ONLINE` — removed (`PAYMENT_METHODS = ["CASH","CARD","UPI","BANK_TRANSFER","CHEQUE","OTHER"]`).

## 8. D — Cabin-crew course fee — **CLOSED (decision recorded)**
- Executive decision: **₹54,000 across fee plans, ledger, seeds and marketing surfaces** (the P2 fee value). Historical snapshot docs may reference ₹59,000; product data is ₹54,000. Verified in test-DB course fee (standalone course seed = 54000) and D-related ledger rendering. Fee tests 33/33.

## 9. F1 — Prospect-in-deals lifecycle — **CLOSED (B/A)**
- `DealService.ensureDealForLead` links a deal to the source lead (prospect); convert/revert/won/lost all route through the lead link and stay org-scoped. Full lifecycle covered by `deals.integration.test.ts` (idempotent ensure, guarded transitions, pipeline & org isolation).

## 10. F2 — Deal decided-state fields — **CLOSED (A)**
- `markWon`/`markLost` set `wonAt`/`lostAt` (idempotent), `convertToAdmission` sets `wonAt`+`convertedAt`; LOST persists `lostReason` (default reason when unspecified). WON_STAGES=`["ENROLLED"]`, LOST_STAGES=`["DROPPED","CANCELLED"]`. Asserted in the deals integration test.

## 11. F3 — Revert-to-prospect keeps admission — **CLOSED (A)**
- `revertToProspect` clears the deal→admission link (`admissionId=null`, `revertedAt` set) but never deletes the admission; the revert notes are recorded. Tested (deals M-08 Part B: link cleared, admission persists).

## 12. G1 — Leads-list latency — **MEASURED (A, datum recorded)**
- No code defect found; a cold/warm datum was captured on the live local server against the test DB: `GET /api/v1/leads?limit=50&sortBy=updatedAt&sortDir=desc` → **200**, 13.7KB payload, cold 819ms, warm **155–174ms** (5 iterations). No before-remediation baseline exists in this repo, so no "improvement" is claimed; the item is verified acceptable.

## 13. G2 — Won deal → open Admission dossier automatically — **CLOSED (B)**
- `admin/src/app/(dashboard)/crm/deals/page.tsx`: stage-advance to `ENROLLED` calls `convertDealToAdmission(d.id, {})` then `router.push("/admissions?id=...")` and shows a note (created vs linked application).
- `admin/src/app/(dashboard)/leads/[id]/page.tsx`: `convertDealMutation` on the ENROLLED stage button does the same; button disabled while converting. `tsc` + lint clean.

## 14. H1 — Lead: contact under name — **CLOSED (B)**
- Lead detail header now shows phone (+91 format) and email directly under the name line.

## 15. H2 — Lead timeline buttons — **CLOSED (B)**
- Tab row restructured to the requested trio as the primary controls: **Timeline**, **Scoring**, **Manual Addition** (opens the activity logger). Tasks and Calls/Email/WhatsApp remain available as secondary tabs so no functionality is lost.

## 16. I3 — Connected / NotConnected → calendar + note dialog — **CLOSED (B)**
- Selecting any live status opens a status dialog with a **datetime-local calendar (next follow-up)** plus a **note** field; "Apply" chains status update + follow-up schedule + note activity, then closes the panel.

## 17. I4 — Lost → no note popup — **CLOSED (B)**
- Lost-group statuses apply immediately with the existing (required) lost-reason input — no dialog/note popup.

## 18. I5 — Prev/next lead navigation — **CLOSED (B)**
- Detail page fetches the current ordering (`/leads?limit=100&sortBy=updatedAt&sortDir=desc&fields=id,name`), indexes the active lead, and renders **prev/next chevrons** next to the back button.

## 19. I6 — Counselor role mapping + assign permission — **CLOSED (B, prior pass)**
- ADMISSIONS_COUNSELOR is the sales-agent role; `assign` removed for counselor, kept for SUPER_ADMIN/ADMIN/MARKETING_MANAGER; `permissions.ts` SUPER_ADMIN wildcard includes `"assign"`. Verified.

## 20. I7 — IST-safe follow-up serialization — **CLOSED (E — was a real defect)**
- **Defect confirmed**: `lead.nextFollowUp.slice(0,16)` fed a UTC ISO wall-clock into a datetime-local input that interprets values as local time → **5.5h IST shift** on round-trip.
- **Fix**: added `toISTInput(utcISO)` (UTC→IST `YYYY-MM-DDTHH:mm`) and `fromISTInput(value)` (IST wall-clock→UTC ISO) helpers in the lead detail page (IST offset +330min); the init effect and both save paths now use them. Display stays `formatDateTime` (en-IN). `tsc` + lint clean.
- Note: `follow-up/route.ts` PATCH storage stays UTC; the serialization boundary is the UI.

## 21. I8 — Activity popup after status update — **CLOSED (B)**
- The status dialog (I3) doubles as the post-update activity capture for live statuses; status-update success also continues to auto-log the STATUS_CHANGE activity server-side (`lead.service.ts` title `Status → X`, notes = lostReason or `Changed from X to Y`), keeping the timeline authoritative.

## 22. L1 — Lead status filter groups — **CLOSED (A, prior pass)**
- Status groups include `NOT_INTERESTED`, `REASON_NOT_SHARED`, and `JOB_SEEKER` with correct group buckets; exercised by `lead-status.test.ts` and the admin suite.

## 23. L2 — JOB_SEEKER status support — **CLOSED (A, prior pass)**
- `LeadStatus` enum + migration `20260907000000_lead_status_job_seeker` (staged); schema/client validation and pickers accept it.

## 24. M1 — WhatsApp/Interakt `providerTemplateName` — **CLOSED (code+tests) / BLOCKED — PROVIDER CONFIGURATION (live)**
- **Fix**: `notification.service.ts` resolves `providerTemplateName` = `params.templateName ?? getInteraktDefaultTemplate()` (env `INTERAKT_DEFAULT_TEMPLATE`) for Interakt, `params.templateName ?? template.name` for the email provider; the 4 dispatch sites pass it through; without a slug/env default Interakt returns a truthful FAILED ("Set templateName or INTERAKT_DEFAULT_TEMPLATE.") — never a fake SENT.
- **Verified**: full admin suite **280/280** (including notification tests), `tsc` clean.
- **Not verifiable locally**: a live WhatsApp send. Classification **(D)**; final state **BLOCKED — PROVIDER CONFIGURATION** (needs `INTERAKT_DEFAULT_TEMPLATE`/template slug + credentials at deploy).

## 25. N1 — Admin command palette — **CLOSED (A, prior pass)**
- `command-palette.tsx` wired into the sidebar layout with keyboard trigger and navigation; tests + tsc green.

## 26. Verification & Safety
- **Tests**: admin `npm run test:local` **280/280** (7 gates on, pinned to loopback test DB); fee/deals/admission integration **33/33**; marketing `npm run test:otp` **5/5**.
- **Static**: admin `tsc --noEmit` clean; marketing `tsc --noEmit` clean; admin `next lint` clean; marketing `next lint` warnings-only (pre-existing).
- **Builds**: `next build` succeeds on both apps (admin 155 pages; marketing 47 pages).
- **Migrations**: fresh disposable `airbone_replay` DB → **18/18 migrations apply from zero, zero drift**; seed run twice (idempotent, same demo logins). Replay DB dropped.
- **Live HTTP matrix** (local test DB): admin `/health` 200; authed `GET /api/v1/leads` 200 (G1 timings above); marketing `/health` 200, `/health/ready` 200 (admin_api_url/intake key/fallback storage checks pass), `/jobs` 200, `/api/otp/request` → 400 on invalid phone (validation correct). Valid-phone OTP returns 500 **only because `OTP_HASH_SECRET`/`N8N_WHATSAPP_WEBHOOK` are absent in local `.env.local`** — `generateOtp` **fails closed by design** (asserted by the marketing OTP unit tests); delivery is a deploy-time secret, not a code path.
- **Safety**: no commits/pushes/deploys; prod Cloud SQL untouched (`admin/.env` never edited; DB-touching npm scripts fail-closed via `safe-db-check.mjs`; builds used `npx next build`, not `npm run build`, so no migration deploy ran).

## 27. Release Readiness Verdict

**CONDITIONALLY PRODUCTION READY.** All 27 sections are CLOSED or MEASURED except two live-deployment gates that cannot be evidenced from this environment:
1. **M1 — Interakt WhatsApp** live send (needs `INTERAKT_DEFAULT_TEMPLATE` + provider credentials) — **BLOCKED — PROVIDER CONFIGURATION**.
2. **OTP delivery** webhook + `OTP_HASH_SECRET` provisioning at deploy; fails closed otherwise.
Plus the standing requirement of a real production deployment smoke. With those provisioned, release is clear.