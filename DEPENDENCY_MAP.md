# AIRBORNE ADMIN OS — DEPENDENCY MAP

## 1. Data & service flow (module → service → repository → DB)

```
Public web intake (src/) ──HTTP──> api/public/leads ──> lead.service.ingestPublicLead
                                          │                 └─ LeadRepository.createWithActivity (txn, leadUuid dedup)
                                          └─ 5xx fallback ──> supabase fallback_leads ──> api/cron/sync-fallback-leads ──> lead.service
  
Lead Management (UI) <──> api/v1/leads ──> lead.service (filter/assign/activity/score/convert)
                                        ├─ lead.service.convertToAdmission ──> AdmissionRepository.create ─> Admission
                                        ├─ lead.service.assign ──> LeadActivity(ASSIGNMENT) + enqueue/dispatch
                                        └─ lead.service.recordActivity ──> LeadActivity

Admissions UI <──> api/v1/admissions ──> admission.service.changeStage ──> AdmissionStageLog + Student(on ENROLLED) + lead CONVERTED
              <──> api/v1/admissions/[id]/payments ──> payment.service.recordPayment
                                        ├─ PaymentRepository.create (COMPLETED)        <─┐
                                        └─ AdmissionRepository.updateFeeBalance (SUM) ─┘  (NOT transactional)

Fee logic <──> admission.repository (feePaid/feeBalance snapshots) ──no FeeLedger entity──> PaymentTransaction

Deals/Pipeline UI <──> api/v1/crm/deals ──> admission.stage groupBy (DERIVED, capability=not_implemented)
                                             └─ no Deal/Opportunity model exists in schema.prisma

CRM Analytics <──> api/v1/crm/analytics ──> ~14 aggregations (leads, admissions, revenue, funnel, emissary…)
                                             └─ opportunitySales always 0 (no WON/convertedAt set)

Unified Timeline <──> api/v1/timeline ──> timeline.service (LeadActivity[leadId=uuid hack] + ActivityFeed + PaymentTransaction, capped 300/source)
                    <──> api/v1/audit ──> audit.service (hash chain)

LMS UI <──> api/v1/lms/* ──> lms.service / lms-ops.service ──> Lms* tables
        <──> api/v1/students ──> student.service ──> Student (created by changeStage ENROLLED; NOT linked to LmsEnrollment)

WhatsApp/Automation
  InternalEvent ──> dispatch.ts ──> (INSERT InternalEvent) ──> api/cron/automation ──> workflow-dispatcher
                                                                   ├─ InteraktAutomation (lead_created ...) ──> interakt.service
                                                                   └─ WorkflowRun executions ──> audit log
  Inngest: REMOVED. isInngestEnabled()===false. enqueueWorkflowRun() = no-op stub.
  Real sends require INTERAKT_API_KEY + approved template; otherwise provider = mock ("connected" only in mock mode).

Media Library <──> api/v1/media ──> media.service ──> SUPABASE_URL/storage OR R2 fallback
Docs        <──> api/v1/documents ──> R2 (legacy, documents only)

CMS/Public:
  api/v1/cms/* ──> cms.service ──> Course/Page/PageSection/ContentBlock/PageVersion (publish → PublishStatus)
  api/v1/resources, /testimonials, /jobs, /placements ──> services ──> tables
  api/public/* ──> org only → ⚠ settings leak (returns raw org.settings, googleAdsWebhookSecret exposed)
```

## 2. Cron / scheduled jobs

| Cron path | What it does | Production wiring | Status |
|---|---|---|---|
| `/api/cron/automation?job=syncFallbackLeadsCron` | recover fallback leads to admin | Cloud Scheduler not configured | 🔴 |
| `/api/cron/automation?job=processInternalEvents` | drive workflow runs | Cloud Scheduler not configured | 🔴 |
| `/api/cron/automation?job=automationWorkflows` | Interakt + workflow dispatcher | Cloud Scheduler not configured | 🔴 |
| `/api/cron/automation?job=scheduledPublishes` | CMS scheduled content publish | behind same job | 🔴 |
| `/api/webhooks/interakt/broadcast` | delivery/webhook idempotent upgrades | requires INTERAKT_PARENT_ID + key | 🟠 |
| `/api/cron/payments-ledger-reconcile` | one-off ledger repair backfill | helper only | 🔴 |

All cron endpoints require `x-cron-secret` header == `process.env.CRON_SECRET`. Missing `CRON_SECRET`/Cloud Scheduler → automation "NOT production-ready" (per `INTERAKT_NO_INNGEST_MIGRATION_REPORT.md`, `AUTOMATION_PRODUCTION_HARDENING_REPORT.md`).

## 3. Environment / infra dependencies (admin)

| Secret | Consumed by | Provisioned? |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Prisma (all modules) | ✔ |
| `AUTH_SECRET` / `AUTH_URL` | NextAuth v5 sessions | ✔ |
| `PUBLIC_INTAKE_KEY`, `PUBLIC_ORG_SLUG` | public intake + settings | ✔ |
| `SUPABASE_URL`/`SERVICE_ROLE_KEY`/`STORAGE_BUCKET` | media storage (fail → 503) | ~ |
| `R2_*` | documents (legacy) | ~ |
| `CRON_SECRET` | every cron route | ❌ |
| `INTERAKT_API_KEY`, `PARENT_ID`, `DEFAULT_TEMPLATE` | WhatsApp/automation real sends | ❌ |
| `GOOGLE_ADS_WEBHOOK_SECRET` / `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED` | Ads lead-form webhook (inbound) | ❌ (reported unconfigured) |
| `RESEND_*` | transactional email | ❌ |
| Twilio/WATI/Upstash/Inngest | reserved/dead (env.example stale) | n/a |

## 4. Module dependency graph — required build order

Fix order (prereqs before dependents):

```
P0-1 → P0-2 → P0-4 → P0-5   (Org settings sanitization, JSON secret stripping, rate-limit hardening can run in parallel)
P0-3 (fee payment tx + ledger) unblocks P1-1 (payments UI fixes) → P1-2 (fee plans editor → P1-3 due dates / GST)
P1-1..3 unblock P2-2 (Fee Ledger entity + global screen)
P2-1 (Deal model) ⇄ depends on P2-4 (Lifecycle: convert→PROSPECT/WON + convertedAt) + P2-6 (statuses + lost reason)
P2 lifecycle changes unblock: P2-3 (Deal-agnostic pipeline kanban for leads), P2-5 (funnel analytics), P2-7 (auto student + LMS enrollment), P2-8 (meetings workflow)
P3 automation (cron wiring) ⇄ P5 integrations (Interakt real config) — sequences depend on both
P6 student/LMS gaps (assignments GET, cert print, batch capacity, attendance SMS) mostly independent — any-order
P7 admin refinements (search/ESC, settings editor, student edit, verifier page) — independent
P8 outreach/metrics — depends on P2-4 (WON) + P3 (real sends)
P9 marketing (fee constants, pixel Lead, JSON-LD) — independent
P10 hardening line-items — depends on no one; do opportunistically
```

## 5. Known data inconsistencies that block downstream consumers

1. Legacy LeadStatus values (`CONTACTED`, `FOLLOW_UP`, `COUNSELED`, `APPLICATION_SUBMITTED`, `CONVERTED`) still in DB + detail page, but **filterable status list omits them** → filters can silently exclude real leads.
2. `Admission.feeBalance/feePaid` snapshots can drift from `PaymentTransaction` reality (non-transactional writes, duplicate payment risk).
3. `metadata.lmsBatchId` in Admission JSON vs `batchName/batchStartDate` strings (no FK to `LmsBatch`).
4. ₹54,000 (admin seed) vs ₹59,000 (admin repair script/marketing courseFees) course fee constants.
5. `WON`/`convertedAt` never written → CRM funnel + emitted/revenue analytics are understated.