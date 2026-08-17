# P1 Event / Inngest Integrity Report

**Project:** Airborne Admin OS (Next.js admin + Inngest event architecture)
**Sprint type:** Audit + minimal hardening ONLY — **no Inngest enablement, no schema changes, no migrations, no commits**
**Branch:** `main` @ `106b5ee` (HEAD == origin/main)
**Date:** 2026-08-14

---

## 1. Scope & Ground Rules

- Audit-only review of the full event architecture with **minimal hardening**.
- Explicitly **NOT** done: setting `INNGEST_EVENT_KEY`, enabling Inngest serving, external integrations, Razorpay/Resend/storage/CMS/auth/frontend/P2 work, schema/migration changes, `prisma generate`, `npm run build`, commit/push.
- Verification permitted: `npm run typecheck`, targeted ESLint, static event-matrix checks.
- One code change was permitted and made (publisher integrity fix, §6).

## 2. Baseline State

- `emitEvent()` (`admin/src/lib/events/inngest.ts`) is a **silent no-op** when `INNGEST_EVENT_KEY` is absent or `"local"`. It never throws and always flattens BaseEvent fields + `event.data` into handler `event.data`.
- `isInngestEnabled()` = configured && key !== `"local"` → distinguishes absent vs local vs real key.
- Serve route `admin/src/app/api/inngest/route.ts` wires **27 functions + 2 crons** (`CmsScheduledCheck`, `BusinessScheduledCheck`).
- Types: `BaseEvent` + ~27 event interfaces; `AppEvent` union ends at `admin/src/types/index.ts:260`.
- 43 `emitEvent(` matches repo-wide (1 definition + comment). After this sprint: 42 call sites + definition.

## 3. Event Architecture Inventory

| Domain | Event names (emitted in) | Handlers |
|---|---|---|
| Admission | `admission/created`, `admission/updated`, `admission/stage.changed` | `admission.functions.ts` |
| Business | `payment/received`, `payment/updated`, `placement/created`, `placement/updated`, `job/created`, `job/updated`, `job/application.changed`, `testimonial/created` | `business.functions.ts` |
| CMS | `page/published`, `page/status.changed`, `course/published`, `course/status.changed`, `resource/published`, `resource/status.changed` | `cms.functions.ts` |
| User | `user/created`, `user/updated` | `user.functions.ts` |
| Lead | `lead/created`, `lead/status.changed`, `lead/assigned`, `lead/scored`, `lead/activity.created` | `lead.functions.ts` |
| Documents/Media | `document/uploaded`, `media/uploaded` | (covers upload flows) |

Publisher services (14): `admission, payment, placement, job, testimonial, document, media, page, course, resource, user, lead, student(removed), lms`.

## 4. Publisher Integrity — BUG FOUND & FIXED

### `admission/created` publisher bug (confirmed)
- **Correct publisher:** `AdmissionService.create` (`admission.service.ts:85-99`) emits `admission/created` with the exact `AdmissionCreatedEvent` contract (`admissionId`, `applicationNo`, `leadId`, `leadName`, `campusId?`).
- **Bogus duplicate publisher:** `StudentService.create` (`student.service.ts:69-83`) ALSO emitted `admission/created` with **mis-filled payload**: `admissionId: student.id`, `applicationNo: studentCode`.
  - In the enroll flow (`admission.service.ts:190` → `changeStage` ENROLLED), this duplicated the correct event already emitted at admission creation → duplicate audit/activity/notification for the same admission.
  - In the standalone path (`POST /api/v1/students` → `StudentService.create`), it emitted `admission/created` for a **non-existent admission** → an `admission.created` audit row carrying a student entity id + a notification targeting a missing admission.
- **Fix applied:** removed the `emitEvent("admission/created")` block and the now-unused import from `student.service.ts` (−17 lines). Sync `student.created` audit + activity feed writes are preserved.
- **Safety:** `AdmissionService.create` is the single legitimate publisher and always runs before student creation in every flow (`api/v1/admissions`, `lead.service.ts:553` convert, `changeStage`). No handler or contract changed. **Zero runtime impact today** since events are no-ops.

## 5. Idempotency Audit (Phase 3)

### At-least-once semantics (framework-level)
Inngest retries **only failed steps**; a run whose steps commit but whose final ack is lost is **re-executed whole**. No `idempotencyKey` is used anywhere in the codebase.

### Duplicate-execution classification
- **Append-only, NOT idempotent on replay:** `AuditService.write` (no dedup, appends + hash-chains), `ActivityFeedService.write` (no dedup), `leadScoreHistory.create`, `NotificationService.dispatch` (appends NotificationLog + **actually sends** WhatsApp/email via provider). A replayed event duplicates every one of these, including real customer-facing sends.
- **Value-idempotent (safe on replay):** `lead.status → CONVERTED`, `lead.convertedAt`, `lead.lastActivityAt`, `lead.score`, scheduled-publish status flips, `payment/updated` fee-balance recalculation.
- **Direct mutation, idempotent by design:** `onAdmissionStageChanged` enroll step sets lead `CONVERTED` (already also set synchronously in `changeStage` — same value, harmless).

### Systemic dual-write duplication (the headline finding)
Most publisher services **also write audit + activity synchronously** AND their event handlers write the **same** audit + activity again:
`admission` (64+85), `payment` (38+66), `placement` (50+163), `document` (74+97), `media`, `page`, `course`, `resource`, `job`, `testimonial`, `user`.
When Inngest is enabled, every such action would produce **duplicate audit-log rows (tamper-evident chain polluted) and duplicate activity-feed items**, plus duplicate notifications.
- **Exception (clean single-writer):** `lead/created` handler is the sole writer (no sync audit/activity in `LeadService.create`).
- **Fix requires a decision:** events become the single owner of audit/activity (with a no-inngest fallback) OR handlers are suppressed, PLUS an idempotency-key/dedup mechanism (unique constraint or find-or-create on `(orgId, action, entityId, requestId)`).
- **Per sprint rule:** new schema/architecture required → **`ARCHITECTURE REQUIRED — NO CODE CHANGE MADE`** on this item.

## 6. Silent No-Op Gate (Phase 4)

- With no `INNGEST_EVENT_KEY`, every `emitEvent` is silently skipped. That is the current intended behavior; **`NOT CONFIGURED`** is accurate today.
- `isInngestEnabled()` distinguishes absent vs `"local"` vs real key — so activation is fully guarded by config, never by a hardcoded path.
- **Undetectable failures:** when events are skipped, handler-side logic (score calc, notifications, publishes) never runs and there is **no log/metric on the skip path**; `emitEvent` returns nothing, so callers cannot distinguish "emitted" from "skipped". Static detection (grep) is the only mechanism today.
- **Instrumentation deferred** (requires adding a metric/log to the emit path — out of minimal-hardening scope). Note: this is a **feature-completeness** item, not an enablement blocker.

## 7. Cron Safety (Phase 5)

- 2 registered crons (`CmsScheduledCheck`, `BusinessScheduledCheck`) drive `publishScheduledPages()` (`page.service.ts:413`), `publishScheduledCourses()` (`course.service.ts:333`), `publishScheduledResources()` (`resource.service.ts:213`).
- Each uses `findScheduledDue()` (status `SCHEDULED` + `scheduledAt <= now`), then flips status to `PUBLISHED` and emits `*/published` + `*/status.changed`.
- **Repeat-run safety: PASS.** After publishing, items are no longer `SCHEDULED`, so subsequent cron runs select nothing → idempotent across runs.
- Concurrent same-function overlap is mitigated by Inngest's default per-function concurrency of 1. Low residual risk; no change needed.

## 8. Changes Made (complete list)

| File | Change |
|---|---|
| `admin/src/lib/services/student.service.ts` | Removed duplicate, mis-payload `admission/created` emission (+ unused `emitEvent` import). No contract change. |

No other code changed in this sprint.

## 9. Verification

- `admin` → `npm run typecheck` (`tsc --noEmit`): **PASS**
- Targeted ESLint on touched/analyzed files (`--max-warnings 0`): **PASS**
- Static event-matrix checks: 42 emit call sites post-fix; single legitimate `admission/created` publisher confirmed via grep of all 4 call sites of `StudentService.create`/`AdmissionService.create`.
- Protected files (`students/[id]/page.tsx`, `resource-download/route.js`, gap-matrix files, `FINAL_ADMIN_OS_QA_REPORT.md`, RLS migration) untouched — verified via `git status`.
- Prior P0 hardening changes remain intact (uncommitted, preserved).

## 10. Verdict & Next Steps

### Verdict: **`NOT READY TO ENABLE`** — one publisher integrity bug fixed; systemic duplicate-write + at-least-once idempotency gaps remain.

**Layer-by-layer:**
- `admission/created` payload integrity: **FIXED**
- Cron scheduled-publish repeat safety: **SAFE**
- Silent no-op gate: **`NOT CONFIGURED`** (intended today; instrumentation deferred)
- Systemic sync+async dual-write (audit/activity/notification duplication) and replay idempotency: **`ARCHITECTURE REQUIRED`** — no code change made

**Required before any future enablement (architecture decision needed):**
1. Choose a single owner of audit + activity per event (handlers) with a no-Inngest fallback that still records synchronously.
2. Add replay dedup: idempotency keys / unique `(orgId, action, entityId, requestId)` enforcement for audit/activity/score-history; make `NotificationService.dispatch` dedup-aware.
3. Add skip-path instrumentation so silent no-op is observable.

**STOP.** No Inngest enablement performed. All changes remain uncommitted.
