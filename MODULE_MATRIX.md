# AIRBORNE ADMIN OS — MODULE MATRIX

Date of audit: 2026-09-05 · Evidence: full source read of `admin/` (Next.js 15 + Prisma 6 + PostgreSQL) and `src/` marketing app.

Legend:
- `✔` = complete/real · `~` = partial · `✖` = absent/missing · `n/a` = not applicable
- Status: 🟢 PRODUCTION READY · 🟡 PARTIALLY IMPLEMENTED · 🟠 FUNCTIONAL BUT INCOMPLETE · 🔴 BROKEN · ⚫ NOT IMPLEMENTED · 🔵 UI ONLY / MOCKED

| # | Module | UI | Backend | DB | CRUD | Business Logic | Auth/RLS | Integration | Tests | Status | Evidence note |
|---|--------|----|---------|----|------|-----------------|----------|-------------|-------|--------|--------------|
| 1 | Public lead intake (web form → admin) | ✔ | ✔ | ✔ | create | ✔ | ✔ (intake key + rate limit) | ✔ | ✔ | 🟢 | `api/public/leads/route.ts` transactional, `leadUuid` idempotent, `@@unique(orgId,phone)` 409; marketing `/api/lead` + fallback_leads |
| 2 | Lead Management list | ✔ | ✔ | ✔ | list/search/filter | ~ | ✔ (counselor ABAC self-scope) | ~ | ~ | 🟠 | Priority filter client-side only (`leads/page.tsx:452-455`); legacy statuses missing from filter (`:60-66`); UI create requires email (`:48`) while API allows empty (`lead.schema.ts:6`); bulk assign bypasses `/assign` trail (`:142-151`) |
| 3 | Lead Detail view | ✔ | ✔ | ✔ | read + PATCH status | ~ | ✔ | ~ | ~ | 🟠 | Real; stepper uses stale legacy statuses (`leads/[id]/page.tsx:359-360,592`); status PATCH unguarded (`lead.schema.ts:31`); no lost-reason capture |
| 4 | Lead assignment | ✔ | ✔ | ✔ | yes | ✔ | ✔ | ✔ | ~ | 🟠 | Dedicated `/assign` audited + events; bulk path uses plain PATCH (no ASSIGNMENT activity/event/score recalc); no round-robin auto-assign |
| 5 | Lead activities / follow-ups / tasks | ✔ | ✔ | ✔ | yes | ✔ | ✔ | ✔ | ~ | 🟢 | `LeadActivity` persisted; complete/task/follow-up all wired (`lead.service.ts:495-616`) |
| 6 | Lead scoring | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✔ | 🟢 | Score + `LeadScoreHistory`; idempotent per event; tests in `lead-interakt.test.ts` |
| 7 | Meetings | ✔ | ✔ | ✔ | create/list | ~ | ✔ | n/a | ✖ | 🟠 | Stored as `LeadActivity` MEETING; no Meeting entity; **no "mark completed" action on page** (`crm/meetings/page.tsx:92-97`); "conversion rate" = completed/total proxy |
| 8 | Deals / Pipeline / Funnel | ✔ | ✖ | ✖ | ✖ | ✖ | ~ | n/a | ✖ | 🔴 | **No Deal model in schema**; `api/v1/crm/deals/route.ts:78-83` hardcodes `capability.deals=false/not_implemented`; derived from admissions only; `/crm/pipeline` = redirect stub |
| 9 | Prospect → Deal lifecycle | ✖ | ✖ | ✖ | ✖ | ✖ | n/a | n/a | ✖ | ⚫ | PROSPECT/WON are inert enums; convert writes legacy `APPLICATION_SUBMITTED` (`lead.service.ts:814-820`); never sets `convertedAt` |
| 10 | CRM dashboard / pipeline / leads sub-pages | ✖ | ✖ | n/a | n/a | n/a | n/a | n/a | ✖ | 🔵 | All three are `redirect()` stubs |
| 11 | CRM Analytics | ✔ | ✔ | ✔ | read | ~ | ✔ | n/a | ✖ | 🟡 | 14 real queries; `opportunitySales`/`opportunityCollections` always ≈0 (`analytics/route.ts:256-265,271-277`) because WON/convertedAt never set |
| 12 | Outreach (templates + delivery log) | ✔ | ✔ | ✔ | create/toggle | ~ | ✔ | ~ | ✖ | 🟠 | Real NotificationTemplate/Log reads (`crm/outreach/route.ts:17-109`); open/reply rate literally `"—"` (`outreach/page.tsx:126-127`); no manual send button |
| 13 | Unified Timeline | ✔ | ✔ | ✔ | read | ~ | ✔ | n/a | ✖ | 🟠 | Per-entity, 3 sources only (`timeline.service.ts:47-152`); LEAD-only activity via sentinel UUID hack (`:55-57`); excludes ActivityFeed, AdmissionStageLog, payments; caps 300/source |
| 14 | Ctrl+K global search | ✔ | ✖ | ✖ | ✖ | ✖ | n/a | n/a | ✖ | 🔵 | Hardcoded 18-entry `MODULES` nav list (`command-palette.tsx:8-27`); no record search; **ESC advertised but not handled** → palette won't close on ESC (`:43-68`) |
| 15 | Admissions kanban | ✔ | ✔ | ✔ | stage change | ~ | ✔ | n/a | ✖ | 🟠 | Real `@dnd-kit` + `changeStage` + `AdmissionStageLog`; no paid-in-full gate before ENROLL (`admissions/page.tsx:748-757`); ENROLL side effects not atomic (`admission.service.ts:177-233`) |
| 16 | Admission Dossier | ✔ | ✔ | ✔ | read/update | ~ | ✔ | n/a | ✖ | 🟠 | Real; batch stored denormalized (`batchName`/`batchStartDate` strings + `metadata.lmsBatchId`, `admissions/page.tsx:503-505,560-571`); `ONLINE` in payment dropdown (`:141`); displays mixed balance |
| 17 | Admission stage logs | ✔ | ✔ | ✔ | create | ✔ | ✔ | n/a | ✖ | 🟢 | `admission_stage_logs` write in `$transaction` (`admission.repository.ts:205-226`) |
| 18 | Admission → Student (ENROLLED) | ✔ | ✔ | ✔ | create | ~ | ✔ | n/a | ✖ | 🟠 | Auto-creates Student + lead CONVERTED at ENROLL (`admission.service.ts:177-233`); **no LmsEnrollment/LmsBatchStudent created**; not in same transaction |
| 19 | Fee Plans / Fee Plan Items | ✔ (apply only) | ✔ | ✔ | API CRUD only | ~ | ✔ | n/a | ✖ | 🟠 | POST/PATCH `/fee-plans` exist but **no editor UI**; no percentage field (ticket unmet); `dueOffsetDays` stored but no due-date math |
| 20 | Fee Ledger | ~ | ~ | ~ | view per admission | ✖ | ✔ | n/a | ✖ | 🔴 | No ledger table; derived/snapshot (`PaymentTransaction` + `Admission.feePaid/feeBalance`); no global list endpoint; consistency bugs (see AUDIT_REPORT F20-F26) |
| 21 | Record payment | ✔ | ~ | ✔ | create | ~ | ✔ | n/a | ✖ | 🔴 | Insert + fee rebalance not transactional (`payment.service.ts:28-36`); status hardcoded COMPLETED (`payment.repository.ts:98`); no idempotency/dedup; receipt count-based; partial-refund logic wrong |
| 22 | Convert Lead → Admission | ✔ | ✔ | ✔ | create | ~ | ✔ | n/a | ✖ | 🟠 | Works + duplicate guard (`lead.service.ts:796-802`) but read-then-write race; writes legacy status; doesn't create Student |
| 23 | Documents | ~ | ✔ | ✔ | review | ~ | ✔ | n/a | ✖ | 🟡 | Review panel in dossier (`admissions/page.tsx:266-280`); **no upload UI** in dashboard (upload only server routes) |
| 24 | Student list | ✔ | ✔ | ✔ | read | ✔ | ✔ | n/a | ✖ | 🟢 | Real list + modal |
| 25 | Student detail / edit | ✖ | ✔ | ✔ | PATCH/DELETE API only | ✖ | ✔ | n/a | ✖ | 🔴 | `students/[id]/page.tsx` read-only; no form, no edit/delete buttons anywhere; page states "fee ledgers are not yet tracked" |
| 26 | LMS Course builder (stages→topics→contents) | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟢 | Full CRUD + reorder (stages/modules) + duplicate + import; chapter/topic/content reorder routes unwired to UI |
| 27 | LMS Batches | ✔ | ✔ | ✔ | yes | ~ | ✔ | n/a | ✖ | 🟠 | CRUD real (`lms-ops.service.ts:64-101`); capacity persisted but **never enforced**; UI can't set capacity/dates (`lms/batches/page.tsx:86`) |
| 28 | LMS Enrollments | ✔ | ✔ | ✔ | yes | ~ | ✔ | n/a | ✖ | 🟠 | Manual only (`lms.service.ts:912-931`); not automated from admission ENROLLED |
| 29 | LMS Attendance | ✔ | ✔ | ✔ | yes | ~ | ✔ | ✖ | ✖ | 🟠 | Real persist + dedup; **no SMS on absence** (`smsSentAt` never written); `LmsAttendanceRecord.smsSentAt` unused |
| 30 | LMS Certificates | ✔ | ✔ | ✔ | issue/revoke/verify | ✔ | ✔ | n/a | ✖ | 🟠 | Solid + public verify + rate limit; **admin "View" links to STUDENT-only print page → 404** (`certificates/page.tsx:173` + `print/page.tsx:27-29`) |
| 31 | LMS Timetable | ✔ | ✔ | ✔ | create/delete | ✔ | ✔ | n/a | ✖ | 🟠 | PATCH edit route orphaned; no edit UI |
| 32 | LMS Assignments | ~ | ✔ | ✔ | yes | ~ | ✔ | n/a | ✖ | 🟠 | **Assignments page fetches `/lms/modules?courseId` which has no GET** (`assignments/page.tsx:103`; `modules/route.ts` POST/PATCH only) → module dropdown 404 |
| 33 | LMS Assessments / Quiz engine | ✔ | ✔ | ✔ | attempt/grade | ✔ | ✔ | n/a | ✖ | 🟠 | Server-graded, no answer leak, attempt cap, module unlock on pass; no dedicated tests |
| 34 | LMS Announcements | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟢 | Real CRUD |
| 35 | Student Portal | ✔ | ✔ | ✔ | read/submit | ~ | ✔ | n/a | ✖ | 🟠 | Functional; login admin-provisioned (no self signup/magic link) |
| 36 | Faculty Portal | ✔ | ✔ | ✔ | read | ✔ | ✔ | n/a | ✖ | 🟢 | Real, TEACHER self-scoped (`lms-ops.service.ts:497-557`) |
| 37 | LMS progress tracking | ✔ | ✔ | ✔ | upsert | ✔ | ✔ | n/a | ✖ | 🟢 | `markProgress` gated on ACTIVE enrollment (`lms.service.ts:963-1010`) |
| 38 | Marketing Courses manager | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟢 | CRUD + versions/rollback + publish |
| 39 | Pages CMS + Content Blocks | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟢 | Sections/blocks/versions/publish all real |
| 40 | Resources (gated) | ✔ | ✔ | ✔ | yes | ✔ | ✔ | ✔ (gate token) | ✖ | 🟢 | Real incl. download gate token |
| 41 | Jobs + applications | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟢 | CRUD + status review; public `/jobs` SSR metadata exists but no JSON-LD |
| 42 | Placements | ✔ | ✔ | ✔ | create | ~ | ✔ | n/a | ✖ | 🟠 | Create-only on page; hiring-partner management missing from this screen |
| 43 | Testimonials | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟢 | Real CRUD + review/reject |
| 44 | Media Library | ✔ | ✔ | ✔ | yes | ✔ | ✔ | ✔ (storage) | ✖ | 🟢 | Full CRUD folders/assets; SUPABASE storage or R2 |
| 45 | Notifications feed + dispatch | ✔ | ✔ | ✔ | read + log | ~ | ✔ | ~ | ✖ | 🟠 | Feed real; **dispatch gated** by `featureFlags.whatsappNotifications`; WhatsApp "connected" only true in mock mode (`whatsapp.service.ts:785-821`) |
| 46 | Settings | ✔ | ✖ | ~ | ✖ | ✖ | ~ | n/a | ✖ | 🔴 | Display-only; `PATCH /organizations` **never called by UI**; values badged "STORED ONLY" (`settings/page.tsx:13-14,150,181-183`) |
| 47 | Audit log | ✔ | ✔ | ✔ | read | ✔ | ✔ | n/a | ✖ | 🟢 | Hash-chained, filters, raw fetch for pagination |
| 48 | Users / RBAC | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟠 | Strong (last-super-admin guard, token hashing); `Permission` rows (campusScope) never read; no permission tests |
| 49 | Profile + password | ✔ | ✔ | ✔ | yes | ✔ | ✔ | n/a | ✖ | 🟢 | Real |
| 50 | Errors / Vapi pages | ✔ | ✖ | ✖ | ✖ | ✖ | n/a | n/a | ✖ | 🔵 | Static "Not Connected" placeholder cards, zero API calls |
| 51 | WhatsApp module (templates/campaigns/sequences/automations/inbox/analytics/settings/contacts) | ✔ | ✔ | ✔ | mixed | ~ | ✔ | ~ | ~ | 🟠 | Real provider-gated; templates create/delete only (no body edit); sequences read-only (seeded via `db:seed:workflows`); campaigns can't send real messages without approved Interakt template; "connected" = mock only |
| 52 | Workflow engine (Automation) | ✔ | ✔ | ✔ | run/monitor | ✔ | ✔ | ~ | ~ | 🟠 | Real engine + durable runs + retries; **Cloud Scheduler/CRON_SECRET not configured**; `enqueueWorkflowRun` is a no-op stub (`workflow-dispatcher.ts:106-108`) |
| 53 | Google Ads lead-form webhook | ✔ | ✔ | ✔ | create | ✔ | ✔ (key/secret) | ~ (inbound only) | ✔ | 🟠 | Implemented + tested + dedup; reported `NOT_CONFIGURED` (`env.ts:58`); no outbound API |
| 54 | Facebook / Meta Leads | ✖ | ✖ | ✖ | ✖ | ✖ | n/a | ✖ | ✖ | ⚫ | No Leads API receiver, no `/api/webhooks/facebook*`, no graph calls; callback = redirect stub; app id placeholder |
| 55 | SMS / Twilio | ✖ | ✖ | ✖ | n/a | ✖ | n/a | ✖ | ✖ | ⚫ | Env "reserved"; no provider wired; UI outreach cards stale |
| 56 | WATI | ✖ | ✖ | ✖ | n/a | ✖ | n/a | ✖ | ✖ | ⚫ | Env "reserved"; unused; stale UI cards |
| 57 | Email / Resend | ✖ | ~ | ~ | log | ✖ | ~ | ✖ | ✖ | 🟡 | Provider code exists; unconfigured; **no invite/reset email sent** — raw tokens returned via API (`user.service.ts:76,79`) |
| 58 | Online payment gateway (Razorpay etc.) | ✖ | ✖ | ✖ | n/a | ✖ | n/a | ✖ | ✖ | ⚫ | No gateway SDK/webhook; `ONLINE` is a label only |
| 59 | Public APIs (courses/jobs/pages/placements/resources/blogs/testimonials/settings) | n/a | ✔ | ✔ | read | ~ | ~ | n/a | ✖ | 🟡 | All real; **`/api/public/settings` leaks `org.settings` incl. webhook secret** (CRITICAL); no NoStore/Auth |
| 60 | Marketing site (homepage/courses/jobs/blog/resources) | ✔ | ✔ | ✔ | read | ~ | n/a | ~ | ✖ | 🟠 | Real via public-proxy; Meta Pixel fires **PageView only**; no `Lead` event; no gclid client capture; **fee constants conflict ₹54,000 vs ₹59,000** |
| 61 | Fallback leads (Supabase) | ✔ | ✔ | ✔ | insert | ~ | ✔ RLS (anon insert-only) | ✔ | ✖ | 🟠 | `src/app/api/lead/route.js:378` only on 5xx/network error; cron recovery via admin `syncFallbackLeadsCron` |

---

## Status tally

| Status | Count | Modules |
|--------|-------|---------|
| 🟢 PRODUCTION READY | 17 | 1, 5, 6, 17, 24, 26, 34, 36, 37, 38, 39, 40, 41, 43, 44, 47, 49 |
| 🟡 PARTIALLY IMPLEMENTED | 4 | 11, 23, 57, 59 |
| 🟠 FUNCTIONAL BUT INCOMPLETE | 27 | 2, 3, 4, 7, 12, 13, 15, 16, 18, 19, 22, 27, 28, 29, 30, 31, 32, 33, 35, 42, 45, 48, 51, 52, 53, 60, 61 |
| 🔴 BROKEN | 5 | 8 (Deals), 20 (Fee Ledger), 21 (Record payment), 25 (Student edit), 46 (Settings) |
| ⚫ NOT IMPLEMENTED | 5 | 9, 54, 55, 56, 58 |
| 🔵 UI ONLY / MOCKED | 3 | 10, 14, 50 |

> Rows 1-61; every row counted exactly once → 17+4+27+5+5+3 = 61.