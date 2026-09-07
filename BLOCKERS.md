# AIRBORNE ADMIN OS — BLOCKERS

Everything that is currently standing between this system and "production-ready" state, ordered by whether it blocks revenue/trust (P) vs only polish (Q).

## P — Blocking (fix before scaling/payout/going-live)

### P1. Fee / payment integrity (🔴)
- **B-01** Payment creation is **not transactional**: `PaymentRepository.create` then separate `AdmissionRepository.updateFeeBalance` (`admin/src/lib/services/payment.service.ts:28-36`). Crash between the two = paid money with un-updated ledger.
- **B-02** No payment idempotency/dedup (no unique on `referenceNo`/`receiptNo`/`gatewayTxnId`; receipt numbers are **count-based** = duplicates after delete) → duplicate payments possible (`payment.repository.ts:69-75`).
- **B-03** `PARTIALLY_REFUNDED` zeroes the entire contribution (`payment.service.ts:109-125` filter is `status === COMPLETED`);
- **B-04** Summary mixes **live computed** `feePaid` with **stored** `feeBalance` (`payment.service.ts:116-124`) → can contradict the dossier balance.
- **B-05** `PATCH /admissions/:id {feeDiscount}` rewrites `feeFinal` from `feeAmount - feeDiscount` but **ignores existing stored discount** (`admission.repository.ts:172-175`); `feeAmount` updates **wipe stored discount** (`:174` uses `data.feeDiscount ?? 0`).
- **B-06** No payment amount cap/validation beyond positive → client-controlled `amount` could exceed balance (only `Math.max(0, …)` clamp after the fact).
- **B-07** No fee-ledger entity, no global payments list endpoint, dossier shows only last `take:50` (`admission.repository.ts`).

### P2. Secrets & access (security, potentially critical)
- **B-08** `GET /api/public/settings` is unauthenticated and returns `org.settings` **unredacted** — `sanitizeOrgSettings` only strips `envVars`, NOT `googleAdsWebhookSecret`, `INTERAKT_API_KEY`, WhatsApp tokens, `webhook_secret`, `resend` keys etc. (`admin/src/app/api/public/settings/route.ts`; `org.service.ts:10-15`). Anyone can read integration secrets.
- **B-09** Login / forgot-password / reset / invite-accept have **no rate limiting** (brute-force surface); the only limit is the in-memory lead-intake limiter (single-instance, resets on restart, and its key derives from `x-forwarded-for` → spoofable without proxy trust).

### P3. Automation engine not wired to production
- **B-10** Inngest removed; `isInngestEnabled() === false`; `enqueueWorkflowRun()` is a no-op stub (`workflow-dispatcher.ts:106-108`). The only driver is `api/cron/automation`, which requires a configured `CRON_SECRET` + Cloud Scheduler — **neither is configured**. Every doc states automation is NOT production-ready until that exists.
- **B-11** Airborne 21-day sequence never fires when Interakt configured (`shouldSkipAirborneLeadNurture`); when Interakt absent, provider is a mock → **no real WhatsApp auto-lead flows can run today in any config**.
- **B-12** Cabin-Crew nurture automation has an **empty template list** (`interakt-automations.ts:40-49`); whatsapp-send requires an **approved Interakt template**; none exist → automation sends fail at provider without manual template creation.

### P4. "Deals / CRM pipeline" is fictional
- **B-13** No `Deal`/`Opportunity` model anywhere. `api/v1/crm/deals/route.ts:78-83` returns `capability.deals=false`. Pipeline UI reads admissions-only derived funnel. Prospects can't be tracked as deals.
- **B-14** Convert-to-admission writes legacy `APPLICATION_SUBMITTED` status, never `PROSPECT`/`WON`, **never sets `convertedAt`** → CRM funnel/revenue analytics under-report (`crm-analytics` WON/opportunitySales always ≈0).

### P5. WhatsApp "connected" is cosmetic until real provider config
- **B-15** WhatsApp "connected" badge only true in mock mode (`whatsapp.service.ts:785-821`); campaigns/sequences/announcements silently no-op against a real Interakt account; no delivery receipts without webhook.

### P6. Env/orphans
- **B-16** `admin/.env.example` still documents `INNGEST_*`, Twilio, WATI, Upstash as live "reserved" knobs; missing `CRON_SECRET`, `INTERAKT_API_KEY`, `GOOGLE_ADS_WEBHOOK_SECRET`, `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED` (reported `false`), `RESEND_*` → ops can't see what to provision.
- **B-17** Deleted `FeePlan` percentage & missing fee-ledger columns mean `AUTOMATION_*`/`FEE*` scratch scripts and `db:seed:demo` assume a schema that no longer exists.

## Q — Non-blocking but should-not-ship-as-is

- **Q-1** Student detail page: read-only, no edit/delete; page itself says "fee ledgers are not yet tracked." (`admin/src/app/(dashboard)/students/[id]/page.tsx`)
- **Q-2** Settings page: display-only; `PATCH /organizations` never called; super-admin cannot change values. (`settings/page.tsx`)
- **Q-3** Documents: no upload UI — review only. (`admissions/page.tsx:266-280`)
- **Q-4** Assignments module-select dropdown 404 — route GET missing. (`modules/route.ts` POST/PATCH only; `assignments/page.tsx:103`)
- **Q-5** Certificate admin "View" → student-only print route → 404 for admins. (`certificates/page.tsx:173`; `print/page.tsx:27-29`)
- **Q-6** Fee plan editor UI missing (API CRUD orphaned to the screen).
- **Q-7** Batch capacity read but never enforced; cannot be set from UI. (`lms-ops.service.ts:64-101`)
- **Q-8** Attendance SMS-on-absence never sent (`smsSentAt` field never populated).
- **Q-9** Timetable edit (PATCH) orphaned — no UI.
- **Q-10** Lead list: priority filter is client-side only (breaks on paginated fetch), legacy statuses excluded from the filter dropdown; create form forces email while API allows empty; bulk-assign bypasses `/assign` (no assignment trail).
- **Q-11** Meetings have no "complete" action.
- **Q-12** Ctrl+K palette does not close on ESC despite label, and only navigates 18 hardcoded modules (no record search).
- **Q-13** `crm/dashboard`, `crm/pipeline`, `crm/leads` are bare `redirect()` stubs.
- **Q-14** Errors page + Vapi page are static placeholders with zero API wiring.
- **Q-15** Outreach open/reply rates render "—"; no tracking exists.
- **Q-16** Meta Pixel fires only PageView, no Lead conversions; no gclid client capture.
- **Q-17** Marketing course-fee constant conflicts (₹54,000 vs ₹59,000).
- **Q-18** Online-payment (`ONLINE`) appears in a dropdown with no gateway wiring.
- **Q-19** Invite/reset return **plaintext tokens** in API responses; no email is sent (Resend unconfigured).
- **Q-20** No tests at all for payments/fee logic, admissions, students, LMS, outreach, users/auth/perms, timeline/analytics, WhatsApp domain, workflow engine, or the marketing site (see TEST_GAP_REPORT.md).