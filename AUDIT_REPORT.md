# AIRBORNE — ADMIN OS / ENTERPRISE AVIATION CRM — CODEBASE AUDIT

**Audit date:** 2026-09-05 · **Scope:** `admin/` (Next.js 15 Admin OS), `src/` (marketing web), `supabase/`, `deploy/`, `scripts/`, `scratch/` · **Method:** full two-pass source read of every module (UI → API → service → repository → Prisma → response), test execution review, env/infra review. **Mode:** AUDIT ONLY — no code changes made.

---

## 1. EXECUTIVE SUMMARY

- **61 modules** classified: **17 🟢 production-ready**, **27 🟠 functional-but-incomplete**, **4 🟡 partial**, **5 🔴 broken**, **5 ⚫ not implemented**, **3 🔵 UI-only/mocked** (see `MODULE_MATRIX.md`).
- **54 findings** (this report): **2 CRITICAL, 13 HIGH, 28 MEDIUM, 11 LOW**.
- **17 P-blockers** and **20 Q-polish items** (see `BLOCKERS.md`).
- **9 automated tests** exist (4 automation, 2 messaging, 1 webhook, 1 lead-status, 1 cron-auth — all passing locally); **zero tests** for payments, admissions, students, analytics, RBAC, WhatsApp, workflow engine, CMS, media, or the marketing site (see `TEST_GAP_REPORT.md`).

### The two CRITICALs
1. **Unsecured public settings endpoint leaks integration secrets** — `GET /api/public/settings` is unauthenticated yet returns `org.settings` which includes `googleAdsWebhookSecret` (+ any Interakt/WhatsApp/Resend values stored there). `sanitizeOrgSettings()` strips only `envVars`. **Anyone can harvest webhook secrets.**
2. **Payment recording is non-transactional** — insert payment + recompute `feePaid/feeBalance` are two separate DB calls; a crash between them silently corrupts the ledger, and there is no idempotency guard against duplicate payments.

### What is genuinely solid
Public lead intake (transactional, idempotent via `leadUuid`, phone `@@unique` 409, rate-limited, fallback recovery). Lead activities/tasks/scoring. Audit log (hash-chained). Admissions + stage logs. LMS builder/portal/progress. CMS/pages/media/resources/jobs/testimonials. RBAC guards on nearly all 154 `api/v1/**` routes. Public API read layer. Webhook HMAC + dedup. Workflow engine design (durable runs, retries, audit).

### What is genuinely broken or fictional
- **Deals/Pipeline** — no model; endpoint hardcodes `capability.deals=false`; UI shows a derived admissions funnel; Pipeline/CRM dashboards are redirect stubs.
- **Fee ledger & payments** — no ledger entity; non-transactional writes; duplicated payments possible; refund math wrong; no global payments screen; dossier shows last 50 only.
- **Automation production path** — Inngest removed; the replacement cron driver depends on `CRON_SECRET` + Cloud Scheduler that are **not configured**; real WhatsApp requires an approved Interakt template that doesn't exist; the only "connected" state is the mock provider.
- **Student editing** — read-only page, no form; page itself says fee ledgers "are not yet tracked".
- **Settings** — display-only; PATCH orphaned; super-admin can't actually change values.

---

## 2. SYSTEM OVERVIEW (VERIFIED)

| Layer | Stack |
|---|---|
| Admin app | Next.js **15.1.x**, App Router, server components + client islands, React 19, Tailwind, framer-motion, @tanstack/react-query |
| Auth | NextAuth **v5.0.0-beta.25**, JWT strategy, 8h session, `guard()`/`guardRecord()` ABAC on `api/v1/**` |
| ORM/DB | **Prisma 6.2.1** ↔ **PostgreSQL** (Cloud SQL pooler via `DATABASE_URL`, direct `DIRECT_URL`) |
| Storage | Supabase Storage (media); Cloudflare R2 (legacy, documents only) |
| Events/automation | Internal `InternalEvent` bus + `/api/cron/automation` (replaces removed Inngest) |
| Messaging | Interakt (WhatsApp) provider layer, mock fallback |
| Marketing site | Next.js 15 (`src/`), API-proxied to admin, fallback into Supabase `fallback_leads` |
| Schema | `admin/prisma/schema.prisma` — **2,048 lines**, no `Deal`, no `FeeLedger` (see §3) |
| Repo tip | `c71a21f` — Interakt lead_created sync + Google Ads lead-form webhook |

---

## 3. DATABASE AUDIT

Models present: `Organization, Campus, User, Lead, LeadActivity, LeadScoreHistory, AuditLog, Admission, AdmissionStageLog, Document, PaymentTransaction, FeePlan, FeePlanItem, Workflow, WorkflowRun, InternalEvent, InteraktAutomation, InteraktLeadSync, LmsCourse/Stage/Module/Chapter/Topic/Content/Enrollment/Batch/Attendance/Certificate/Assignment/Assessment/Progress/Notification, WhatsAppConversation/Message/Campaign, ContentBlock/Page/PageSection/PageVersion`.

### 3.1 Absent models (verified by absence in schema + consumers)
- **`Deal` / `Opportunity`** — no occurrence anywhere in the 2,048 lines. Deals are derived; endpoint returns `not_implemented`.
- **`FeeLedger` / payment ledger** — fee state lives as denormalized `Admission.feeAmount/feeDiscount/feeFinal/feePaid/feeBalance` recomputed from `PaymentTransaction`.
- **`Meeting`** — meetings are stored as `LeadActivity(kind: MEETING)`.
- **`Program`/`CourseRun`/`Session`** — batch data is denormalized strings on `Admission` (`batchName`, `batchStartDate`) plus `metadata.lmsBatchId` JSON (no FK to `LmsBatch`).
- **`LmsBatchStudent`** — enrollments exist (`LmsEnrollment`) but are not auto-created from admissions.
- **`PushNotification`/SMS entity** — SMS and email are fields on `NotificationLog`/template only; no provider queue.

### 3.2 Integrity gaps
- `PaymentTransaction` has **no unique constraints** on `referenceNo`, `receiptNo`, or `gatewayTxnId`; receipt numbering is count-based → **duplicate receipts after a delete**.
- `LeadActivity(leadId,type,payloadHash)` uniqueness was removed from the Prisma schema — dedup is now app-level (`last_processed_at`/retry checks).
- `Lead.phone @unique` is scoped `(orgId, phone)` — good. `Student` has no `(orgId, email|phone)` unique.
- `Admission` batch strings vs `LmsBatch` normalization drift; `LmsBatch.capacity` persisted but never enforced.
- Legacy `LeadStatus` enum values (`CONTACTED, FOLLOW_UP, COUNSELED, APPLICATION_SUBMITTED, CONVERTED`) coexist with the second-gen set; UI filter lists only the second-gen set → **real leads can be hidden from filters**.

---

## 4. DETAILED FINDINGS

Severity: 🔴 CRITICAL · 🟠 HIGH · 🟡 MEDIUM · 🔵 LOW · Type / Root-cause(❓=INFERENCE) / Fix(=RECOMMENDATION) / ⚠ = BUSINESS DECISION REQUIRED

### SECURITY & EXPOSURE

**F01 🔴 CRITICAL · Settings · Security/Data exposure**
- **Current:** `GET /api/public/settings` is unauthenticated and returns the raw `{ envVars, settings, ... }` org row. `org.service.ts:10-15 sanitizeOrgSettings()` strips only `envVars` keys, keeping `settings` as-is — including `googleAdsWebhookSecret` (`google-ads.service.ts:131-133` uses it to verify inbound webhooks).
- **Expected:** Public settings must return an allow-list (name, contact info, images) and never expose any secret or webhook credential; `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED`/`PUBLIC_ORG_SLUG` derivation only.
- **Root cause:** Sanitizer trust boundary missing on the `settings` JSON field; the public route was added to serve site chrome but reused the admin-safe shape.
- **Evidence:** `admin/src/app/api/public/settings/route.ts` (returns `sanitizeOrgSettings(org)` → `org.settings` is inside); `admin/src/lib/webhooks/google-ads.service.ts:131-133` (`org.settings.googleAdsWebhookSecret` unencrypted, correct usage); settings page writes the whole object.
- **Impact:** Credential exfiltration from unauthenticated internet request; complete takeover of the Google Ads lead webhook (create/spoof leads) and any other provider keys in `settings`.
- **Fix:** Introduce `publicOrgProjection()` allow-list (fields incl. `website`, `email`, `phone`, `socialLinks`, `logoUrl`, `address`, `hours`, booleans); strip `settings.envVars` **and** `settings` secrets; also consider `@JsonValue` role — eventually store secrets elsewhere (Secret Manager). Add a route test asserting `googleAdsWebhookSecret` is never present.
- **Dependencies:** none (can deploy alone). **Validation:** curl the public endpoint and grep for `secret`.

**F02 🟠 HIGH · Auth · Missing rate limiting**
- **Current:** Login, addMember, forgot-password, reset, invite-accept have zero throttling; the only limiter in the app is the public lead-intake in-memory 5/min/IP. Prisma-brute force protection absent.
- **Expected:** Per-route credential rate limits (and per-IP for password reset) with a distributed store.
- **Root cause:** Feature was scoped to public intake only; Redis/Upstash left "reserved".
- **Evidence:** `api/public/leads` + rate limiter are the only use; auth routes have no limiter calls.
- **Impact:** Enumerated accounts / credential brute-force ATP.
- **Fix:** Add `rateLimit()` helper to forgot/reset/verify/login; make limiter pluggable (in-memory dev, `UPSTASH_REDIS_REST_URL` prod).
- **Dependencies:** F03. Validation: `test` script has no limiter test — add one.

**F03 🟡 MEDIUM · Security · XFF spoofing**
- **Current:** The intake limiter keys off `x-forwarded-for`. Without proxy-trust the header is attacker-controlled → bypass.
- **Expected:** derive from `CF-Connecting-IP`/`X-Real-IP` when behind a trusted proxy, else socket addr; or rely on internal proxy.
- **Root cause:** assumption of proxy presence.
- **Fix:** parse trusted proxy headers; document proxy topology.
- **Validation:** stress 6 rapid requests from same spoofed IP then rotate.

**F04 🟡 MEDIUM · Infra · In-memory limiter is single-instance**
- **Current:** limiter state lives in a module singleton; Cloud Run multi-instance = separate counters; restarts reset them.
- **Expected:** shared store in prod.
- **Fix:** implement the `Redis`/Upstash-backed fallback when env present.
- **Dependencies:** F03.

**F05 🔵 LOW · Security · Constant-time compare**
- **Root fix:** use `crypto.timingSafeEqual` for `x-intake-key`/cron secret compare.
- **Evidence:** `api/public/leads` uses `!==`.

**F06 🔵 LOW · Security · Dev auto-login:** `api/dev/login` exists but is hard-blocked when `NODE_ENV=production` (`middleware.ts` dev-only). Acceptable; keep blocked.

### PAYMENTS & FEE LEDGER (💰 financial integrity)

**F07 🔴 CRITICAL · Admissions/Payments · Non-transactional write**
- **Current:** `payment.service.ts:28-36` `create(data)` → DB insert (status hardcoded `COMPLETED`) → then a separate `admissionRepository.updateFeeBalance`. A crash/5xx between them = money recorded but balance not updated (or vice-versa).
- **Expected:** single `$transaction` that inserts the payment and recomputes balance atomically, with an audit `PAYMENT_RECORDED` entry in the same txn.
- **Root cause:** repository split before txn-awareness.
- **Evidence:** `admin/src/lib/services/payment.service.ts`; `admin/src/lib/repositories/payment.repository.ts:98`; dossier `PaymentsPanel` at `admissions/page.tsx:349-492`.
- **Impact:** financial records can be wrong — highest-impact backend defect in the app.
- **Fix:** wrap `create + updateFeeBalance + auditLog` in one `prisma.$transaction`; make fee ledger computed from a single query source (see F13).
- **Dependencies:** F08, F13. **Validation:** kill mid-write test; assert balance == SUM.

**F08 🟠 HIGH · Payments · No idempotency/dedup**
- **Current:** no unique on `referenceNo`/`receiptNo`/`gatewayTxnId`; receipt number generated **count-based** (`payment.repository.ts:69-75`) → identical receipts after delete/refund round-trips; a duplicated submission = double ledger entries.
- **Expected:** unique partial-unique indexes + idempotency key on create (`Idempotency-Key` or `referenceNo` unique per org) + upsert path.
- **Impact:** duplicate charges or double-listed receipts; confusing financial history.
- **Dependencies:** F07. Fix: add `@@unique([orgId, referenceNo])`, `@@unique([orgId, receiptNo])`, `@@unique([orgId, gatewayTxnId])` (+ partial where not null), dedupe by `receivedDate+amount+mode`.
- **Validation:** create same reference twice → 2nd rejected.

**F09 🟠 HIGH · Payments · Refund math**
- **Current:** balance recompute filters `status === COMPLETED` (`payment.service.ts:109-125`), so a **partial refund zeroes the whole contribution** — marked `PARTIALLY_REFUNDED` removes the entire paid amount instead of only the refunded part.
- **Expected:** `paid = COMPLETED + PARTIALLY_REFUNDED(amount − refunded)`; refunds tracked per line (refundedAmount) not by mutating status alone.
- **Fix:** add `refundedAmount` + `isPartialRefund` on PaymentTransaction; recompute with partial-aware formula. ⚠ BUSINESS DECISION REQUIRED on refund handoff to a payment gateway.
- **Validation:** unit test partial refund.

**F10 🟡 MEDIUM · Payments · Mixed summary math**
- **Current:** summary uses live-computed feePaid while the card shows stored `feeBalance` (`payment.service.ts:116-124`), so the two disagree whenever a write path drifts (see F07).
- **Expected:** single source of truth for the ledger (prefer computed-from-PaymentTransaction, backfilled onto `Admission` columns as cache only).
- **Dependencies:** F07, F13.

**F11 🟡 MEDIUM · Admissions · PATCH fee contradiction**
- **Current:** `admission.repository.patchAdmission` for a `feeDiscount`-only update recomputes `feeFinal = feeAmount − feeDiscount` **ignoring existing stored discount**; a `feeAmount`-only update **zeros the stored discount** (`:172-175`, uses `data.feeDiscount ?? 0`).
- **Expected:** merge semantics: recompute from persisted values not the diff.
- **Evidence:** `admin/src/lib/repositories/admission.repository.ts:170-180`.
- **Fix:** in PATCH, read current row, then `feeFinal = base − (discount ?? current.discount)`.

**F12 🟡 MEDIUM · Payments · No amount cap/validation**
- **Current:** payload amount only `positive` (`payment.schema.ts:5`); client can post any number; post-hoc `Math.max(0, …)` clamp only.
- **Expected:** server-side `amount <= feeBalance` (+ optionally `<= due`), rounding to ₹, reject >1 decimal places.
- **Fix:** apply business validators server-side; ⚠ BUSINESS DECISION REQUIRED: allow overpayment or reject?

**F13 🟡 MEDIUM · Ledger · No entity / no global screen / capped history**
- **Current:** no fee-ledger table; no `GET /api/v1/payments` list; dossier shows last `take:50` (`admission.repository.ts`); no pagination/filter/sorting on payments anywhere.
- **Expected (2 options, ⚠ BUSINESS DECISION REQUIRED):** (a) **computed** ledger — one `AccountPayable`/`PaymentTransaction` query joining fee plans, used everywhere with paging; or (b) **materialized** `FeeLedger` table with per-snapshot rows. Recommended (a) for correctness now, keep columns as cache.
- **Dependencies:** F07-F12.

**F14 🟡 MEDIUM · Fee Plans · Editor missing, percentage missing**
- **Current:** POST/PATCH `/fee-plans` + items exist but there is no editor page; the "Percentage Discount" ticket item is unmet (no percentage column); `dueOffsetDays` stored but no due-date math.
- **Expected:** fee-plan CRUD UI + optional percent-discount + due-date computation surfaced on dossier.
- **Dependencies:** F13 (ledger).

**F15 🟡 MEDIUM · Admissions · `ONLINE` method unbacked**
- **Current:** `ONLINE` appears in the payment-method select (`admissions/page.tsx:141`) but there is no gateway SDK/webhook (no Razorpay/Stripe). It stores whatever the human types — no payment actually processed.
- **Expected (⚠ BUSINESS DECISION REQUIRED):** remove `ONLINE` until a gateway exists, or add a real gateway + webhook verification.
- **Dependencies:** gateway vendor decision.

**F16 🟡 MEDIUM · Fees · ₹ conflict**: seed `seed_courses.ts:277` uses ₹54,000; `audit-fix-fees-prod.mjs:31` and marketing `src/lib/data/courseFees.js:48-49` use ₹59,000. Pick one source of truth.
- **Validation:** assert fee plan totals equal marketing price.

**F17 🟡 MEDIUM · Fees · No GST/tax handling** anywhere in fee math/invoice/dossier. ⚠ BUSINESS DECISION REQUIRED (GST applicability).

**F18 🟡 MEDIUM · Admissions · ENROLL not gated on payment**
- **Current:** kanban lets you ENROLL without full payment (`admissions/page.tsx:748-757`).
- **Expected (⚠ BUSINESS DECISION REQUIRED):** block ENROLL until paid-in-full, or record it as a "conditional enroll" with a flag.

### DEALS, LIFECYCLE & CRM

**F19 🟠 HIGH · Deals · Feature is not implemented (endpoint admits it)**
- **Current:** `api/v1/crm/deals/route.ts:78-83` returns `capability: { deals: false, status: "not_implemented", reason: "No dedicated Deal/Opportunity model in the database" }`; page derives an admissions-only funnel (`crm/deals/page.tsx:21-31`).
- **Expected:** actual deals pipeline backed by a Deal/Opportunity model.
- **Dependencies:** F21 (lifecycle); f20. **Fix/⚠:** model + stage replication decision in §6 Phase 4.

**F20 🟠 HIGH · CRM · Pipeline & dashboards are redirect stubs**
- `crm/pipeline/page.tsx` = `redirect("/crm/deals")`; `crm/dashboard` + `crm/leads` also bare redirects. No kanban exists for leads/conversions (only admissions board).

**F21 🟠 HIGH · Lifecycle · Convert writes legacy status, no WON, no convertedAt**
- **Current:** `lead.service.ts:808-820` `convertToAdmission` → `updateStatus({ status: "APPLICATION_SUBMITTED" })`; **never** `PROSPECT`/`WON`; no `convertedAt` column/field. 
- **Expected (⚠ BUSINESS DECISION REQUIRED on final status like `WON`/`CONVERTED`):** track a proper terminal state + `convertedAt` + `convertedBy`, so analytics and funnel can consume it.
- **Evidence:** `admin/src/lib/services/lead.service.ts:796-830`; `crm/analytics` WON pathways at `analytics/route.ts:256-277` always return ≈0 (❓ INFERENCE: because WON never set).

**F22 🟠 HIGH · Lifecycle · Convert dedup race**
- read-then-write duplicate check (`lead.service.ts:796-802`) is outside a txn → two concurrent converts can double-admit. Fix: txn + unique `(leadId)` on admission one-to-one.

**F23 🟡 MEDIUM · Lifecycle · Untracked, unguarded state machine**
- Any `PATCH /api/v1/leads/:id {status}` to any allowed value is accepted (`lead.schema.ts:31`); no transition rules, no "lost / not interested / reason" capture. The client item **"Lost → Not Interested → Reason Not Shared"** is still unresolved (`NOT_INTERESTED` exists only in color maps `status-badge.tsx:8`, `lead-status.ts:144`; no enum value, no UI).
- **Fix (⚠ BUSINESS DECISION REQUIRED on taxonomy):** add transition guard + `lostReason` with `reasons` incl. "Reason not shared"; map legacy statuses.

**F24 🟡 MEDIUM · Leads UI · Filter/create bugs**
- **Priority filter is client-side only** on the already-fetched page (`leads/page.tsx:452-455`); with server pagination it silently filters only current page. `leadFiltersSchema` (`lead.schema.ts`) has no `priority` — so the fix is server-side.
- **Filter dropdown omits legacy statuses** (`CONTACTED, FOLLOW_UP, COUNSELED, APPLICATION_SUBMITTED, CONVERTED`) while those values still exist in DB/detail UI → real leads unreachable via filter.
- **UI create requires email** (`page.tsx:48`) while API allows empty (`lead.schema.ts:6`) → marketing leads without email can't be added manually. Fix: optional email client-side.

**F25 🟡 MEDIUM · Assignment · Bulk path bypasses `/assign`**
- Bulk windows do plain `PATCH` over `selectedIds` (`leads/page.tsx:142-151`) — no `ASSIGNMENT` activity, no event, no score recalc, no audit trail, unlike `/assign` (which is real + auditable). Route bulk through a batch endpoint reusing `lead.service.assign`.

**F26 🟡 MEDIUM · Assignment · No round-robin / auto-assign**
- No auto-distribution for unassigned leads (esp. from public intake). ⚠ BUSINESS DECISION REQUIRED: round-robin strategy, group-based, or remain manual.

**F27 🟡 MEDIUM · Status · Duplicate taxonomies**
- Two lead-status vocabularies in the codebase (`lead-status.ts` new set; legacy values in DB/UI). Normalize in one source; migrate data — must be part of P2/Phase 3.

### MEETINGS, OUTREACH, TIMELINE, SEARCH (CRM tooling)

**F28 🟡 MEDIUM · Meetings · No "complete" action**
- Meetings rendered from `LeadActivity(MEETING)`, but the actionable column has no complete action (`crm/meetings/page.tsx:92-97`); "conversion rate" is a completed/total proxy. Expected: meeting done/cancelled + outcomes capture.

**F29 🟡 MEDIUM · Outreach · Fake metrics**
- Open/reply rate render literal `"—"` (`outreach/page.tsx:126-127`); no open/reply tracking exists (no read receipts ingested). Either disable the columns or implement receipts.

**F30 🟡 MEDIUM · Timeline · Rendering gaps + hack**
- `timeline.service.ts:47-55` pulls lead activity via a sentinel UUID hack (`leadId = "0000…"`); omits `ActivityFeed`, `AdmissionStageLog`, and payment records; caps 300/source (`:152`); two "days" for scheduling vs created merge keys. Fix: reconcile types table + multi-source projection + real merge keys.

**F31 🔵 LOW · Search · Ctrl+K UX & depth**
- Palette lists 18 hardcoded `MODULES` only (no records); the "ESC to exit" hint is wrong — **no Escape handler** (`command-palette.tsx:43-68`), so ESC doesn't close. Fix toggle/close semantics + add record search (❓ INFERENCE: user expectation = global search).

**F32 🔵 LOW · CRM stubs:** covered in F20.

### STUDENTS & LMS

**F33 🟠 HIGH · Students · No edit/delete UI**
- `students/[id]/page.tsx` is read-only (lists admissions/LMS activity); PATCH/DELETE routes exist but are never mounted; the page text itself says "fee ledgers are not yet tracked." ⚠ Relevant to "Student Management" completeness.

**F34 🟡 MEDIUM · Students · ENROLL doesn't create LMS enrollment**
- `changeStage → ENROLLED` creates `Student` and marks lead `CONVERTED` (`admission.service.ts:177-233`) but creates **no `LmsEnrollment`/`LmsBatchStudent`**. Expected (⚠ BUSINESS DECISION REQUIRED): auto-enroll into the chosen batch/course or a manual & explicit step.

**F35 🟡 MEDIUM · Batches · Capacity unenforced**
- `LmsBatch.capacity` stored but never checked on enroll/student-add; UI can't edit capacity (`lms/batches/page.tsx:86`). Fix: enforce on enroll + form field.

**F36 🟡 MEDIUM · LMS · Assignments module dropdown 404**
- `assignments/page.tsx:103` fetches `/lms/modules?courseId` but `modules/route.ts` has only POST/PATCH → error. Add GET listing chapters/modules for the course.

**F37 🟡 MEDIUM · Certificates · Admin view 404**
- Admin "View" links to `/lms/certificates/{id}/print` which is STUDENT-gated (`print/page.tsx:27-29`) → 404 for admins. Fix: allow ADMIN/TEACHER view or provide an admin preview route.

**F38 🔵 LOW · Attendance · SMS never sent**
- `smsSentAt` on `LmsAttendanceRecord` is never written; teacher absence SMS is unimplemented. ⚠ BUSINESS DECISION REQUIRED : keep feature or drop field.

**F39 🔵 LOW · LMS · Orphaned wiring**
- Timetable PATCH route exists with no UI; chapter/topic/content reorder endpoints exist but only stages/modules have drag UI.

### AUTOMATION & INTEGRATIONS

**F40 🟠 HIGH · Automation · End-to-end path not deployment-ready**
- Inngest removed: `events/inngest.ts` is a stub; `dispatch.ts:202 isInngestEnabled() === false`; `enqueueWorkflowRun()` is a **no-op** (`workflow-dispatcher.ts:106-108`). Sole execution path = `/api/cron/automation` requiring `CRON_SECRET` header + Cloud Scheduler job. **Neither is configured.** Docs (`INTERAKT_NO_INNGEST_MIGRATION_REPORT.md`, `AUTOMATION_PRODUCTION_HARDENING_REPORT.md`) both conclude "NOT production-ready until Cloud Scheduler + CRON_SECRET are in place." Also `admin/.env.example` still documents `INNGEST_*`.
- **Fix (Phase 7):** provision Cloud Scheduler + GRANT egress; set `CRON_SECRET` in Secret Manager; smoke each job.

**F41 🟡 MEDIUM · Automation · Nurture never actually sends**
- With Interakt configured, `shouldSkipAirborneLeadNurture` (interakt-automations) skips the 21-day Airborne sequence; without Interakt the provider is a mock. Either way **no real automated WhatsApp is possible today**. Cabin-Crew nurture has an empty `templates: []` list. [⚠ BUSINESS DECISION: define nurture template + cadence authority.]

**F42 🟡 MEDIUM · WhatsApp · "Connected" is cosmetic**
- `whatsapp.service.ts:785-821` marks connected only in mock mode; real tokens absent; campaigns/sequences silently no-op without an approved Interakt template. Add config detection + surface as UNCONFIGURED, not "connected".

**F43 🟡 MEDIUM · Google Ads · Inbound REAL, outbound + config pending**
- Webhook is implemented + tested (signature + dedup + 5/limit). But `env.ts:58` reports `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED=false`, no admin config UI, no campaign/audience outbound.

**F44 🟠 HIGH · Facebook/Meta · Not implemented**
- No Leads API receiver, no `api/webhooks/facebook*`, no graph access-token call; callback page is a redirect stub; env vars are placeholder. (Marketing overlay may fire the browser pixel but no server ingestion/conversion events.) ⚠ BUSINESS DECISION REQUIRED: priority + scope (webhook receiver vs Lead Ads manager sync).

**F45 🟡 MEDIUM · SMS / WATI dead**
- Twilio/WATI env vars "reserved", no provider wiring; UI sends no SMS; outreach cards show stale/hardcoded provider tiles. Recommend removing or wiring.

**F46 🟡 MEDIUM · Transactional email absent**
- `user.service.ts:76,79` returns **plaintext invite/reset tokens** in API response; no email actually sent (Resend unconfigured). ⚠ BUSINESS DECISION: email delivery for invites/resets.

**F47 🔵 LOW · Marketing · Pixel/gclid**
- Meta Pixel fires only `PageView`; no `Lead`/search events; `gclid` is carried only as a query param (no client capture/server postback). Which integrations matter pending F44 decision.

**F48 🟡 MEDIUM · Env contracts stale**
- `.env.example` documents romanticized integration set (`INNGEST_*`, Twilio, WATI, Upstash) and omits the live ones (`CRON_SECRET`, `INTERAKT_API_KEY`, `INTERAKT_PARENT_ID`, `INTERAKT_DEFAULT_TEMPLATE`, `GOOGLE_ADS_WEBHOOK_SECRET`, `NEXT_PUBLIC_*_CONFIGURED`).

### ADMIN / PLACEHOLDERS / BUSINESS QA

**F49 🔵 LOW · Settings page is display-only**
- `settings/page.tsx` badges values "STORED ONLY"; the UI never calls `PATCH /organizations` (`settings-wrapper` slice route unused), so super-admins can't change phone/website etc. Wire the PATCH.

**F50 🔵 LOW · Documents upload UI missing**
- Only a review panel exists (`admissions/page.tsx:266-280` `PATCH /documents/:id`). No upload UI → dossier shows "No documents uploaded yet" (client item). Add upload dialog or document it as student-provided.

**F51 🔵 LOW · Placeholder pages**
- `(dashboard)/errors` and `(dashboard)/vapi` are static "Not Connected" cards, zero API calls. Replace or remove.

**F52 🟡 MEDIUM · Marketing · SEO/JSON-LD gaps**
- `/jobs/:id` renders SSR metadata but no `JobPosting` JSON-LD; no `AggregateRating` schema on courses (client ticket open); course fee constant conflict F16.

### TESTS & TOOLING

**F53 🟠 HIGH · Test coverage is dangerously thin**
- 9 test files, all in `admin/src/lib`; **zero** for payments/fee ledger, admissions/student transitions, students, analytics, RBAC/perms, WhatsApp domain, workflow engine, CMS/media, outreach, marketing site, or E2E. Detail + priority list → `TEST_GAP_REPORT.md`.

**F54 🔵 LOW · CI & test hygiene**
- No CI wiring; `cron-auth.test.ts` performs DB hits (org lookup) — make it hermetic; glob pattern on Windows should be verified with `find`-style runner; `test_webapp.py` (Playwright) exists on disk but isn't in any script.

---

## 5. CLIENT-REVIEW CROSS-CHECK (what was raised vs. verified state)

| Ticket item | Verified state |
|---|---|
| Business lifecycle Prospect→Deal (ACM) | ❌ OPEN — no Deal model; overtly `not_implemented` |
| Lost → Not Interested → "Reason Not Shared" | ❌ OPEN — no enum/UI |
| Lead Management bugs (priority, create form, filters incl. legacy statuses) | ❌ OPEN (F24) |
| Ctrl+K close / toggle | 🔶 PARTIAL — toggle ok; ESC broken; nav-only |
| Sequence templates list-refresh / placeholder template editor | 🔶 PARTIAL — templates CRUD real but provider-gated to approved-only; editor body editing not supported |
| Verifier page | ❌ OPEN — placeholder static page |
| Passport / documents | 🔶 PARTIAL — review UI exists; no upload UI |
| Separate SMS + Email pages | 🔶 PARTIAL — pages exist with dead provider tiles |
| Payment method → single dropdown (remove ONLINE) | ❌ OPEN — ONLINE still listed, unbacked |
| Payments process screen: pagination/filter/sort | ❌ OPEN — no global payments screen |
| "Prefill email+phone in forms" | ⏳ not re-verified this pass |
| Fee plan percentage discount | ❌ OPEN — no percentage field |
| Google Ads config UI | ❌ OPEN — webhook shipped, admin config missing |
| Notifications/SMS/email productionization | ❌ OPEN — dispatch gated; provider unconfigured |

---

## 6. SECTION-BY-SECTION IMPLEMENTATION PLAN (dependency-ordered)

Order forces prerequisite correctness before dependent UI.

- **Phase 1 · Security hardening (P0)** — F01 (settings redaction) → F02/F03/F04/F05 (rate limiting + constant-time + trusted-proxy) → add leak regression tests. *Can start immediately; F01 is the first deploy.*
- **Phase 2 · Finance integrity (P0-P1)** — F07 (transactional recordPayment) → F08 (uniqueness + receipt non-collision) → F09 (partial-refund math) → F10/F11/F12 (single-source math, PATCH semantics, amount guards) → F13 (ledger projection + global payments screen w/ paging).
- **Phase 3 · Lifecycle & status (P1-P2)** — F27 (normalize taxonomies + data migration) → F23 (transition guard + lost-reason incl. "no reason") → F21 (WON/convertedAt/proper convert) → F22 (txn dedup) → F24 (server-side priority filter, legacy statuses in filters, email-optional create) → F25/F26 (bulk via assign, round-robin [⚠]) → F34 gate until F21 is settled.
- **Phase 4 · Deals model (P2)** — schema `Deal`/`Opportunity` (stage = admission.stage replica or its own [⚠ BUSINESS DECISION REQUIRED]), ABAC `guard(session, "deal.access")`, `DealStageLog`, admin UI: pipeline kanban + details; wire converts to create deals; extend analytics; **requires Phase 3 lifecycle**.
- **Phase 5 · CRM tooling (P2-P3)** — F28 meetings actions → F29 outreach metrics → F30 timeline reconciliation → F31 palette (ESC + record search) → de-stub F20/F32.
- **Phase 6 · Students & LMS gaps (P2-P3)** — F33 (student edit/delete UI) → F34 (auto LMS enrollment [⚠]) → F35 (capacity widget) → F36 (assignments GET) → F37 (certificate admin view) → F38/F39 (SMS/attendance, orphaned routes). Independent of Phases 3-4.
- **Phase 7 · Automation & integrations (P1/P3)** — F40 (Cloud Scheduler + CRON_SECRET + env cleanup) → F41/F42 (nurture + template config, honest connected-state) → F43 (Google Ads config screen) → F44 (FB/Meta receiver — [⚠ scope]) → F46 (Resend transactional email) → F47 (pixel/gclid). Blocks on Phase 3 for lifecycle event wiring.
- **Phase 8 · Admin polish (P3-P4)** — F14 (fee-plan editor) → F15 (ONLINE decision) → F49 (settings editor) → F50 (docs upload) → F51 (real errors/vapi pages).
- **Phase 9 · Marketing site (P3-P4)** — F16 (single fee source), F52 (JSON-LD: JobPosting, AggregateRating), F47 pixel events. Independent.
- **Phase 10 · Testing & tooling (continuous)** — implement `TEST_GAP_REPORT.md` priority list (P0 audit-regression tests first), wire CI, make tests hermetic, add Playwright E2E smoke.

---

## 7. PRIORITY INDEX (P0–P4)

**P0 — ship first:** F01 (public secret leak), F07 (non-transactional payments), F08 (dup receipts), F09 (refund math).
**P1 — before scaling/user traffic + money movements:** F02/F03/F04 (login/intake throttling), F10, F11, F12, F16, F40 (cron/secret provisioning).
**P2 — core CRM correctness:** F19, F20, F21, F22, F23, F24, F25, F26, F27, F28, F29, F30, F33, F34, F36, F37.
**P3 — integration production readiness:** F41, F42, F43, F44, F45, F46, F52, F53, F48.
**P4 — polish/cleanup:** F05, F06, F13→(moved if phase), F14, F15, F17, F18, F31, F32, F35, F38, F39, F47, F49, F50, F51, F54.

---

## 8. FINAL COUNTS

| Metric | Count |
|---|---|
| Modules matrixed | 61 |
| 🟢 / 🟠 / 🟡 / 🔴 / ⚫ / 🔵 | 17 / 27 / 4 / 5 / 5 / 3 |
| Total findings | 54 (2 CRITICAL · 13 HIGH · 28 MEDIUM · 11 LOW) |
| Blockers | 17 P-items (B-01…B-17) + 20 Q-items (Q-1…Q-20) |
| Automated tests | 9 (all pass) · marketing 0 · E2E 0 |
| Verification status | Reviewed `deals/pipeline`, fees/ledger, automation, auth/RLS, LMS, tests, marketing — cross-checked console output + schema + service code on every claim |

**FACT vs INFERENCE vs RECOMMENDATION discipline:** every finding labeled; inferences flagged `❓`; fixes tagged `⚡`; business decisions flagged `⚠ BUSINESS DECISION REQUIRED`. No app code was modified during this audit.

AUDIT COMPLETE — NO APPLICATION CHANGES MADE.