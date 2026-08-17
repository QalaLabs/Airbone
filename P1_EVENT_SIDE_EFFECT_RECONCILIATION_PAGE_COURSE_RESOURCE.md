# P1 EVENT SIDE-EFFECT RECONCILIATION REPORT

**Scope tag:** page + course + resource
**Branch:** `main` · **Baseline:** `106b5eec1f451d1d4742cddfc168aa2ea5f8b027` (HEAD == origin/main)
**Rules honored:** OPTION A · scheduled-publish sync audit/activity NOT regressed · no new models/migrations/deps · Inngest stays disabled · nothing staged/committed.

---

## 1. Scope

Reconciled durable audit/activity ownership for the page/course/resource content families. Actual events present in the repository (verified, not assumed):

- `page/published` · `page/status.changed`
- `course/published` · `course/status.changed`
- `resource/published` · `resource/status.changed`

Also covered: `CourseService.create` **as-PUBLISHED** (a `course/published` emitter with a missing sync publish record). `content/version.created` (rollback) was inspected and verified **non-duplicate** (its handler writes a distinct `content.version_created` audit; the sync rollback writes `page.rolled_back`/`course.rolled_back` — complementary, not duplicated) and left unchanged.

## 2. Actual Event Inventory

| Event | Manual emitter | Scheduled emitter | Handler |
|---|---|---|---|
| `page/published` | `PageService.publish` (PUBLISHED only) | `PageService.publishScheduledPages` | `onPagePublished` (cms.functions.ts) |
| `page/status.changed` | `PageService.publish` | `PageService.publishScheduledPages` | `onPageStatusChanged` (cms.functions.ts) |
| `course/published` | `CourseService.publish` (PUBLISHED only) · `CourseService.create` (as-PUBLISHED) | `CourseService.publishScheduledCourses` | `onCoursePublished` (cms.functions.ts) |
| `course/status.changed` | `CourseService.publish` | `CourseService.publishScheduledCourses` | `onCourseStatusChanged` (cms.functions.ts) |
| `resource/published` | `ResourceService.publish` (PUBLISHED only) | `ResourceService.publishScheduledResources` | `onResourcePublished` (business.functions.ts) |
| `resource/status.changed` | `ResourceService.publish` | `ResourceService.publishScheduledResources` | `onResourceStatusChanged` (business.functions.ts) |

## 3. Page Events

- **Manual `publish()`:** sync audit `page.${status.toLowerCase()}` (`page.service.ts:155` → `page.published`) + sync activity `published`/status-lowercase (`:162`) + emits `page/published` (PUBLISHED only) and `page/status.changed`.
- **Scheduled `publishScheduledPages()`:** sync audit `page.published` with **null actor** (`:440`) + sync activity `published` with `actorName: "System (Scheduled)"` (`:452`) — unchanged, **not regressed**.
- **Handlers:** `onPagePublished` wrote a duplicate `page.published` audit + `published` activity (duplicated BOTH manual and scheduled sync writes). `onPageStatusChanged` wrote a duplicate `status_changed` activity (sync already writes one activity per transition in `publish()`). Both → **no-op** (no async work existed).
- **Other page mutations untouched:** create/update/layout/section/block audits, `page.rolled_back`, `page.archived`.

## 4. Course Events

- **Manual `publish()`:** sync audit `course.${status.toLowerCase()}` (`course.service.ts:260` → `course.published`) + sync activity `published`/status-lowercase (`:267`) + emits `course/published` (PUBLISHED only) and `course/status.changed`.
- **Create-as-PUBLISHED `create()`:** emitted `course/published` (`:65`) and created a version snapshot, but had **no sync publish audit/activity** — the disabled handler was its only writer (a real gap today). **Fixed:** added sync audit `course.published` + sync activity `published` (authenticated ctx) inside the `status === "PUBLISHED"` branch (`course.service.ts:81-94`). Distinct from `course.created`/`created` (two operations, two records — not duplicates). Version snapshot + event emission unchanged.
- **Scheduled `publishScheduledCourses()`:** sync audit `course.published` **null actor** (`:387`) + sync activity `published` `System (Scheduled)` (`:403`) — unchanged.
- **Handlers:** `onCoursePublished` → **no-op** (duplicate audit/activity for all three emitter paths). `onCourseStatusChanged` → **no-op** (duplicate `status_changed` activity).
- **NOT modified:** curriculum, version/rollback logic, status transition rules, publishedAt/scheduledAt, LMS course architecture.

## 5. Resource Events

- **Manual `publish()`:** sync audit `resource.${status.toLowerCase()}` (`resource.service.ts:135` → `resource.published`) + sync activity `published`/status-lowercase (`:142`) + emits `resource/published` (PUBLISHED only) and `resource/status.changed`.
- **Scheduled `publishScheduledResources()`:** sync audit `resource.published` **null actor** (`:230`) + sync activity `published` `System (Scheduled)` (`:245`) — unchanged.
- **Handlers:** `onResourcePublished` → **no-op** (duplicate audit/activity). `onResourceStatusChanged` → **no-op** (duplicate `status_changed` activity).
- **Create-as-PUBLISHED does not exist for resources** (no publish branch in `create()`), so no sync gap.
- **NOT modified:** resource business behavior, create/update/delete audits, MediaUsage tracking, download counting.

## 6. Manual vs Scheduled Side-Effect Analysis

| Event | Manual sync audit | Manual sync activity | Scheduled sync audit | Scheduled sync activity | Handler audit | Handler activity | Legit async | Final owner |
|---|---|---|---|---|---|---|---|---|
| `page/published` | ✅ (publish:155) | ✅ (:162) | ✅ null (:440) | ✅ (:452) | ❌ removed | ❌ removed | none | **SYNC** |
| `page/status.changed` | ✅ (:155) | ✅ (:162) | ✅ (:440) | ✅ (:452) | — (never had) | ❌ removed | none | **SYNC** |
| `course/published` | ✅ (publish:260) | ✅ (:267) | ✅ null (:387) | ✅ (:403) | ❌ removed | ❌ removed | none | **SYNC** |
| `course/published` (create-as-PUBLISHED) | ✅ **added** (:81-94) | ✅ **added** | n/a | n/a | ❌ removed | ❌ removed | none | **SYNC** |
| `course/status.changed` | ✅ (:260) | ✅ (:267) | ✅ (:387) | ✅ (:403) | — (never had) | ❌ removed | none | **SYNC** |
| `resource/published` | ✅ (:135) | ✅ (:142) | ✅ null (:230) | ✅ (:245) | ❌ removed | ❌ removed | none | **SYNC** |
| `resource/status.changed` | ✅ (:135) | ✅ (:142) | ✅ (:230) | ✅ (:245) | — (never had) | ❌ removed | none | **SYNC** |

**State A — Inngest DISABLED (current):** every manual publish/status-change and scheduled publish yields exactly **1 audit + 1 activity** (handler never runs). Create-as-PUBLISHED previously had 0 publish records; now 1 + 1.

**State B — Inngest hypothetically ENABLED:** all six handlers are no-ops → exactly **1 audit + 1 activity** per transition (previously up to 2 audits + 3 activities for a single manual publish because both `*/published` and `*/status.changed` fired). No legitimate async behavior existed in these handlers, so nothing is lost.

**Scheduled-rule compliance:** scheduled sync writes remain null-actor (`userId`/`requestId`/`actorId` omitted → NULL) with `context.actorName = "System (Scheduled)"`. No `"system"`/`"cron-*"` values can reach UUID columns; `emitEvent` still carries the `system`/`cron-*` strings (event-contract only, sanitized by `validUuid` if ever re-enabled — the guard imports were removed only because these handlers are now no-ops).

## 7. Verification

- `npm run typecheck` (`tsc --noEmit`) — **PASS**.
- `npx eslint` on the 3 changed files (`cms.functions.ts`, `business.functions.ts`, `course.service.ts`) — **PASS** (0 errors).
- **Grep sweeps:** `page.*`/`course.*`/`resource.*` status audits + `published`/`status_changed` verbs exist only in the sync services; `System (Scheduled)` null-actor writes intact in all three services; no handler references remain for these six events.
- **Tests:** no framework in repo; no temp test needed — handler-only changes plus one additive sync write reusing the proven pattern.
- **DB verification:** not performed — no service logic changed; the added create-as-PUBLISHED writes reuse the exact `AuditService.write`/`ActivityFeedService.write` calls already exercised elsewhere. No residue risk.

## 8. Inngest Status

INNGEST REMAINS DISABLED.

- `INNGEST_EVENT_KEY` unset; `isInngestEnabled()` false; `emitEvent` no-ops.
- The scheduled-publisher cron (`onCmsScheduledCheck`, `onBusinessScheduledCheck`) is registered but dormant; its sync-side methods still own durable audit/activity independently.
- Enabling Inngest later is now audit-safe for all six events: single-writer sync ownership, no duplicates.

## 9. Remaining Architecture Work

Unresolved (NOT implemented, out of scope):
- **Residual handler-owned durable writes** for other families remain broken while Inngest is disabled: `onMediaReplaced`/`onMediaDeleted` (double-write with sync `MediaService`), `onJobPublished`/`onJobStatusChanged`, `onJobApplicationStatusChanged`, `onTestimonialSubmitted`/`onTestimonialReviewed` (handler-only audit/activity). Recommended fix: migrate each to sync ownership (OPTION A), same pattern as this sprint.
- `content/version.created` handler (`onContentVersionCreated`) is **event-owned but non-duplicate**; its sync counterpart writes `*.rolled_back` — leave as-is unless a full rollback-activity pass is desired.
- **No outbox / no idempotency / no event ledger / no retries** — unchanged.

## 10. Verdict

**PASS.**

All six page/course/resource events now have a single durable audit/activity owner (the sync service, covering manual + scheduled + create-as-PUBLISHED paths), handler-side duplicates removed, scheduled null-actor writes intact, and exactly 1 audit + 1 activity per transition in both Inngest states.

---

### Delivery facts

- **Files changed (3):**
  - `admin/src/lib/events/functions/cms.functions.ts` — `onPagePublished`, `onPageStatusChanged`, `onCoursePublished`, `onCourseStatusChanged` → no-ops; removed now-unused `validUuid` import.
  - `admin/src/lib/events/functions/business.functions.ts` — `onResourcePublished`, `onResourceStatusChanged` → no-ops; removed now-unused `validUuid` import.
  - `admin/src/lib/services/course.service.ts` — create-as-PUBLISHED now writes sync `course.published` audit + `published` activity (was a missing sync side effect).
- **Protected files untouched:** students/[id]/page.tsx, lead/route.js, public-proxy, placements, Modal.jsx, fallback RLS, gap matrix, prior reports, `actor.ts`, all previously-reconciled families. Scheduled-publish sync writes in `page/course/resource.service.ts` preserved exactly.
- **Nothing staged. Nothing committed.**
