# P1 EVENT SIDE-EFFECT RECONCILIATION REPORT

**Branch:** `main` @ `106b5ee` (HEAD == origin/main)
**Date:** 2026-08-14
**Sprint rule:** audit + minimal hardening ONLY — Inngest NOT enabled, no schema/migration, no commit/push, no external config.

---

## 1. Scope

- **Publishers inspected:** all 15 files that call `emitEvent(...)` — 14 services (`user`, `testimonial`, `resource`, `placement`, `payment`, `page`, `document`, `media`, `course`, `admission`, `job`, `lead`, `student`, `lms`) + the public intake route `admin/src/app/api/public/leads/route.ts` (newly surfaced in this sprint).
- **39 actual `emitEvent()` call sites** (43 grep matches minus 1 definition, 1 internal `inngest.send`, 2 comments).
- **No `inngest.send(...)` calls** outside the `emitEvent` wrapper; **no publishers exist outside `admin/src`** (whole-repo grep of `src/` returned zero).
- **Handlers inspected:** all 5 function files → **28 event handlers + 2 crons** = 30 functions served at `admin/src/app/api/inngest/route.ts`.
- All 28 emitted event names are typed in the `AppEvent` union (`admin/src/types/index.ts:231-260`).

---

## 2. Side-Effect Ownership Matrix

Legend: **A**=audit, **F**=activity feed, **N**=notification, **M**=business-state mutation.
`Sync` = written synchronously in the service; `Event` = written by the Inngest handler.

| Domain | Event | Sync writer (audit/activity/notify/mutation) | Event writer (audit/activity/notify/mutation) | Duplicate? | Recommended owner | Status |
|---|---|---|---|---|---|---|
| Admission | `admission/created` | A+F (admission.service:64-83) | A+F+N (admission.functions:24-75) | YES (A+F) | Sync (A+F), Event (N) | **DUPLICATE** |
| Admission | `admission/stage.changed` | A+F+M(lead CONVERTED) (admission.service:236-256,220) | A+F+M(lead CONVERTED) (admission.functions:95-134) | YES (A+F); M idempotent | Sync (A+F), Event (M redundant) | **DUPLICATE** |
| Payment | `payment/received` | A(`payment.recorded`)+F(`recorded_payment`) (payment.service:38-64) | A(`payment.received`)+F(`payment_received`)+N (admission.functions:155-213) | YES (A+F, different labels) | Sync (A+F), Event (N) | **DUPLICATE** |
| Placement | `placement/created` | A+F (placement.service:139-161) | A+F (business.functions:214-236) | YES (A+F) | Sync | **DUPLICATE** |
| Placement | `placement/updated` | A(`placement.updated`)+F (placement.service:185-204) | A(`placement.status_changed`) (business.functions:250-260) | YES (A) | Sync | **DUPLICATE** |
| Document | `document/uploaded` | A+F (document.service:74-95) | A+F (admission.functions:233-257) | YES (A+F) | Sync | **DUPLICATE** |
| Document | `document/reviewed` | A+F (document.service:137-157) | A+F (admission.functions:277-299) | YES (A+F) | Sync | **DUPLICATE** |
| Media | `media/uploaded` | none (media.service:114,141) | A+F (cms.functions:17-39) | no | Event (handler is sole writer) | **EVENT-ONLY** |
| Media | `media/replaced` | A only (media.service:187-196) | A+F (cms.functions:53-76) | YES (A) | Sync (A), Event (F) | **DUPLICATE** |
| Media | `media/deleted` | A+F (media.service:231-249) | A only (cms.functions:90-100) | YES (A) | Sync | **DUPLICATE** |
| CMS | `page/published` (manual) | A+F (page.service:151-170) | A+F (cms.functions:114-136) | YES (A+F) | Sync (A+F) | **DUPLICATE** |
| CMS | `page/published` (cron) | none (page.service:429) | A+F (cms.functions) | no | Event | **EVENT-ONLY** |
| CMS | `page/status.changed` | F (page.service:162-170) | F (cms.functions:157-167) | YES (F, different verbs) | — (see dual publisher) | **ARCHITECTURE REQUIRED** |
| CMS | `course/published` (manual) | A+F (course.service:234-253) | A+F (cms.functions:187-209) | YES (A+F) | Sync | **DUPLICATE** |
| CMS | `course/published` (cron) | none (course.service:346) | A+F | no | Event | **EVENT-ONLY** |
| CMS | `course/status.changed` | F (course.service:245-253) | F (cms.functions:230-240) | YES (F) | — (see dual publisher) | **ARCHITECTURE REQUIRED** |
| CMS | `content/version.created` | A(`page.rolled_back`/`course.rolled_back`) (page.service:381, course.service:302) | A(`content.version_created`) (cms.functions:260-270) | no (different action) | — | SAFE |
| Resource | `resource/published` (manual) | A+F (resource.service:131-150) | A+F (business.functions:16-38) | YES (A+F) | Sync | **DUPLICATE** |
| Resource | `resource/published` (cron) | none (resource.service:217) | A+F | no | Event | **EVENT-ONLY** |
| Resource | `resource/status.changed` | F (resource.service:142-150) | F (business.functions:52-62) | YES (F) | — (see dual publisher) | **ARCHITECTURE REQUIRED** |
| Job | `job/published` | A+F (job.service:123-142) | A+F (business.functions:76-98) | YES (A+F) | Sync | **DUPLICATE** |
| Job | `job/status.changed` | A(`job.<status>`)+F (job.service:123-142) | F(`status_changed`) (business.functions:112-122) | YES (F) | Sync | **DUPLICATE** |
| Job | `job_application/submitted` | A+F (job.service:214-232) | A+F (business.functions:142-164) | YES (A+F) | Sync | **DUPLICATE** |
| Job | `job_application/status.changed` | A+F (job.service:267-286) | A only (business.functions:184-195) | YES (A) | Sync | **DUPLICATE** |
| Testimonial | `testimonial/submitted` | A+F (testimonial.service:34-52) | A only (business.functions:274-284) | YES (A) | Sync | **DUPLICATE** |
| Testimonial | `testimonial/reviewed` | A+F (testimonial.service:113-132) | A+F (business.functions:298-320) | YES (A+F) | Sync | **DUPLICATE** |
| User | `user/invited` | A only (user.service:48-57) | A+F+N (user.functions:24-59) | YES (A) | Sync (A), Event (F+N) | **DUPLICATE** |
| Lead | `lead/created` | none (lead.service:168) | A+F+M(score)+N (lead.functions:19-81) | no | Event (handler is sole writer) | **EVENT-ONLY** |
| Lead | `lead/status.changed` | M(leadActivity)+M(score) (lead.service:195-225) | A+F+M(score if CONVERTED) (lead.functions:99-132) | no (different tables) | Event (A+F), Sync (M) | SAFE |
| Lead | `lead/assigned` | M(leadActivity)+M(score) (lead.service:258-286) | A+F+N (lead.functions:150-201) | no (different tables) | Event (A+F+N), Sync (M) | SAFE |
| Lead | `lead/activity.created` | M(leadActivity)+M(lastActivityAt+score) (lead.service:317-365) | A+M(lastActivityAt)+F (lead.functions:218-247) | no (lastActivityAt value-idempotent) | — | SAFE |
| (removed) | `admission/created` (from StudentService.create) | — | — | was duplicate/mis-payload | removed prior sprint | FIXED |

**Classification summary:**
- **DUPLICATE:** 16 events (admission/created, admission/stage.changed, payment/received, placement/created, placement/updated, document/uploaded, document/reviewed, media/replaced, media/deleted, page/published, course/published, resource/published, job/published, job/status.changed, job_application/submitted, job_application/status.changed, testimonial/submitted, testimonial/reviewed, user/invited — 19 rows above marked DUPLICATE across 17 unique events).
- **EVENT-ONLY:** `lead/created`, `media/uploaded`, and the cron path of `page|course|resource/published`.
- **SYNC-ONLY (no event, safe):** hiring-partner CRUD, job create/update/delete, page create/update/section/block/rollback, course create/update/delete/rollback, resource create/update/delete, placement delete, testimonial update/delete, document presign, media update/folder, user create/update/deactivate/password/reset, fee-plan, org, nav, block, lms.
- **SAFE (complementary, no row duplication):** `lead/status.changed`, `lead/assigned`, `lead/activity.created`, `content/version.created`.

---

## 3. Duplicate Audit/Activity Findings (every genuine duplicate)

For each of these, **both** the service (synchronous) and the handler write an audit-log row **and/or** an activity-feed item describing the same state change on the same entity. Enabling Inngest would double the audit log (a tamper-evident hash-chained table) and double the activity feed:

1. `admission/created` — `admission.service.ts:64-83` (sync) + `admission.functions.ts:24-46` (event). Same action `admission.created`.
2. `admission/stage.changed` — `admission.service.ts:236-256` + `admission.functions.ts:95-118`. Same action `admission.stage_changed`.
3. `payment/received` — `payment.service.ts:38-64` + `admission.functions.ts:155-179`. Different labels (`payment.recorded`/`recorded_payment` vs `payment.received`/`payment_received`) but both describe the same payment create.
4. `placement/created` — `placement.service.ts:139-161` + `business.functions.ts:214-236`. Same action.
5. `placement/updated` — `placement.service.ts:185-204` + `business.functions.ts:250-260`. Same status change, different action labels.
6. `document/uploaded` — `document.service.ts:74-95` + `admission.functions.ts:233-257`. Same action.
7. `document/reviewed` — `document.service.ts:137-157` + `admission.functions.ts:277-299`. Same action.
8. `media/replaced` — `media.service.ts:187-196` (audit) + `cms.functions.ts:53-76` (audit).
9. `media/deleted` — `media.service.ts:231-249` + `cms.functions.ts:90-100`. Same action.
10. `page/published` (manual path) — `page.service.ts:151-170` + `cms.functions.ts:114-136`. Same action.
11. `course/published` (manual path) — `course.service.ts:234-253` + `cms.functions.ts:187-209`.
12. `resource/published` (manual path) — `resource.service.ts:131-150` + `business.functions.ts:16-38`.
13. `job/published` — `job.service.ts:123-142` + `business.functions.ts:76-98`.
14. `job_application/submitted` — `job.service.ts:214-232` + `business.functions.ts:142-164`.
15. `job_application/status.changed` — `job.service.ts:267-286` + `business.functions.ts:184-195`.
16. `testimonial/submitted` — `testimonial.service.ts:34-52` + `business.functions.ts:274-284`.
17. `testimonial/reviewed` — `testimonial.service.ts:113-132` + `business.functions.ts:298-320`.
18. `user/invited` — `user.service.ts:48-57` (audit) + `user.functions.ts:24-34` (audit).

Partial duplicates (activity verb mismatch, same transition logged twice in the feed): `page|course|resource/status.changed`, `job/status.changed`.

**Already fixed (prior sprint):** the `admission/created` duplicate emitted by `StudentService.create` (mis-payload `admissionId: student.id`) was removed — this would otherwise have caused duplicate audit + activity + a duplicate counselor email for the same admission.

---

## 4. Notification Duplication

- `NotificationService.dispatch(...)` is called **only from 5 handlers** (grep-verified, zero sync call sites):
  - `user.functions.ts:50` → `USER_INVITED` (email invite)
  - `lead.functions.ts:72` → `NEW_LEAD` (WhatsApp welcome)
  - `lead.functions.ts:187` → `LEAD_ASSIGNED` (email counselor)
  - `admission.functions.ts:62` → `ADMISSION_STAGE_CHANGED` (email counselor) — **mislabeled** (fired on `admission/created`, not stage change; cosmetic)
  - `admission.functions.ts:200` → `PAYMENT_RECEIVED` (email receipt)
- **No synchronous service dispatches notifications** → no sync/async notification duplication exists.
- **Duplicate sends could only occur via duplicate events** (at-least-once replay, or the now-removed StudentService duplicate). The one real duplicate-publisher risk is fixed.
- **Resend is NOT configured:** `RESEND_API_KEY` is unset in `.env`, `.env.local`, `.env.vercel.production`, `.env.preview.pulled` (`.env.example` has an empty value; `admin/src/lib/env.ts:41` marks it `"reserved"`). Even if Inngest were enabled, `dispatchToProvider` would record `NOT_CONFIGURED` — no real emails today.
- **No deduplication** in `NotificationService.dispatch`: every call appends a `NotificationLog` row and, once a key exists, issues a real Resend send. At-least-once replay → duplicate NotificationLog rows + duplicate emails.
- **Conclusion:** notification duplication risk is currently zero (events disabled + Resend unset), and the only duplicate-event path (StudentService) is fixed. Real dedup for future enablement requires idempotency → **ARCHITECTURE REQUIRED** (section 7).

---

## 5. Transaction / Event Reliability

- **All 39 `emitEvent()` calls happen AFTER the DB mutation commits, outside any `prisma.$transaction`.** (The only `$transaction` uses — `user.updateSelfProfile`, `lead.recalculateScore` — do not emit events inside them.) No emit occurs before/inside commit.
- **Consequence:** a successful DB write followed by a failed/silent event emission leaves the async side effects permanently lost. `emitEvent` never throws and returns nothing, so callers cannot detect or retry.
- **Silent-loss hot spots today (Inngest disabled → these side effects never run):**
  - `lead/created` — `LeadService.create` writes **no** synchronous audit or activity; the handler is the sole writer. **Every lead create is currently unaudited and missing from the activity feed and score history.**
  - `media/uploaded` and `media/register` — no sync audit/activity; handler is sole writer.
  - Cron scheduled publishes (`page/course/resource`) — no sync audit/activity; handler is sole writer.
  - `LeadService.syncFallbackLeads` — creates leads without any audit row and **without emitting `lead/created`** (lost-event gap: recovered leads get no audit, no score, no NEW_LEAD processing).
- The sync audit writes that DO exist are durable regardless of Inngest (they run in the request path) — this is why **Option A is the safer ownership model** (section 6 decision).

---

## 6. Minimal Fixes

**NO additional code change was made this sprint.**

The prior-sprint fix (`student.service.ts` — removal of the duplicate `admission/created` publisher) is the only event-system code delta in the working tree and remains correct.

**Why no further removal now — the ownership gate fails:**
The "POSSIBLE MINIMAL FIX" (remove duplicate audit/activity from handlers) requires **unambiguous** ownership. The evidence shows the codebase has **two coexisting conventions**:

1. **Sync-owned** (majority — 17+ duplicate events above): the service writes audit/activity and the handler wrongly repeats it.
2. **Event-owned** (`lead/created`, `media/uploaded`, and **all three cron publish paths**): the handler is the legitimate sole writer because the sync path writes nothing.

The blocker is the **cron dual-publisher problem**: `page/published`, `course/published`, `resource/published` (and their `status.changed`) are emitted from BOTH the manual publish flow (sync audit exists) AND the cron `publishScheduled*` flow (no sync audit, `requestId: cron-*`). Removing handler audit/activity would silently delete the audit + activity for every scheduled publish. Removing only the manual-path duplicates is impossible because it is the same handler. Resolving it requires a coordinated change across services + cron paths + handlers — exactly what this sprint forbids doing without a clear convention.

Removing handler writes for the remaining 16 clean duplicates would also leave the 5 notification-only handlers (`user/invited` keeps email, `payment/received` keeps receipt, `admission/created` keeps counselor email) while gutting the pure-duplicate handlers (placement, document, media, job, testimonial) to empty no-ops — that is event-platform pruning, not a minimal fix.

---

## 7. Architecture Required

Do **not** implement — listed for the enabling decision:

1. **Ownership rule (Option A):** synchronous services own audit + activity (durable, Inngest-independent — matches the existing 95% convention and the fact that audit must survive Inngest outages). Inngest handlers own only async automation: notifications/email, scoring, and (optionally) lead-follow-through.
2. **Cron alignment:** scheduled publishers (`publishScheduledPages/Courses/Resources`) must write sync audit/activity with a system actor (as the manual path already does), so handlers can uniformly drop their audit/activity writes. Touches 3 services + 3 repositories.
3. **Close the event-owned gaps:** add sync audit/activity to `LeadService.create`, `MediaService.upload/register` (or explicitly accept Inngest dependency for these), and audit for `syncFallbackLeads` recovered leads.
4. **Idempotency for at-least-once:** unique `(orgId, action, entityId, requestId)` enforcement or idempotency keys for `AuditService`, `ActivityFeedService`, `leadScoreHistory`, and `NotificationService.dispatch` (to stop duplicate rows and duplicate real emails on replay). This requires schema/unique-constraint or an outbox/inbox mechanism.
5. **Emit-after-commit loss prevention** (transactional outbox or emit-within-transaction) to guarantee "no lost business events" when the DB write commits but the event is dropped.
6. **Event pruning decision:** `placement/*`, `document/*`, `media/replaced|deleted`, `job/*`, `testimonial/*` handlers carry **no async value** beyond the duplicated audit/activity — decide whether to delete the events+handlers or give them real async work.

---

## 8. Verification

- `npm run typecheck` (admin, `tsc --noEmit`): **PASS**
- Target ESLint: not re-run this sprint because **no code was changed**; the only event-system delta (student.service.ts) was lint-clean when verified in the prior sprint.
- Working tree re-verified: identical to the pre-sprint baseline — 6 modified (2 protected pre-existing + 3 P0 fixes + the P1 student.service.ts fix), 5 protected untracked files untouched, RLS migration untouched. No new edits introduced by this sprint.
- Whole-repo scan for `emitEvent`/`inngest.send` outside `admin/src`: **zero matches**.

---

## 9. Inngest Enablement Verdict

**NOT READY — ARCHITECTURE REQUIRED**

- Duplicate audit/activity side effects are genuine and systemic (17 events), but the resolution is not a drop-in handler edit: ownership is ambiguous across the cron dual-publisher and event-owned clusters, and a durable fix requires the Option-A rule, cron sync-audit alignment, gap closure for lead/media/cron audit, and idempotency for at-least-once.
- Notification duplication risk is currently zero (events disabled + Resend unset); the only duplicate-event path is already fixed.
- Audit durability today is partially broken regardless of Inngest (lead creates, media uploads, scheduled publishes, recovered leads are unrecorded) — this is the strongest argument for Option A as the target design.

## 10. Next Recommended Sprint

Smallest safe step, in order:

1. **Option A ownership rule + cron alignment:** make `publishScheduledPages/Courses/Resources` write sync audit/activity (system actor), then remove the duplicate audit/activity steps from the Inngest handlers for the 17 duplicated events, keeping only their async work (notifications for `admission/created`, `payment/received`, `user/invited`). Verify with typecheck + targeted handler tests.
2. **Close audit gaps:** add sync audit/activity to `LeadService.create` and `MediaService.upload/register`; add audit row for fallback-recovered leads.
3. **Decide the pure-duplicate events** (`placement/*`, `document/*`, `media/replaced|deleted`, `job/*`, `testimonial/*`): delete events+handlers or assign real async automation.
4. Only then, as a separate schema-approved sprint: idempotency/outbox for at-least-once safety before any enablement.

**STOP.** No Inngest enablement, no config changes, no commits.
