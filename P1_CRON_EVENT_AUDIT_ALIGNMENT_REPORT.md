# P1 CRON / EVENT AUDIT ALIGNMENT REPORT

- **Sprint:** P1 Cron / Event Audit Alignment (smallest safe implementation step)
- **Scope lock:** Only the cron `publishScheduled*` paths. No Inngest enablement, no Resend, no schema changes, no migrations, no outbox/idempotency work, no commit/push.
- **Branch/HEAD:** `main` @ `106b5eec1f451d1d4742cddfc168aa2ea5f8b027` (== origin/main)
- **Date:** 2026-08-14
- **Result:** ✅ COMPLETE — 3 service files changed (+68 lines), typecheck PASS, eslint PASS, no runtime/DB risk introduced. No commit made (as mandated).

---

## 1. CRON INVENTORY (scheduled publish)

| Scope | Cron function | Service entrypoint | Gate |
|---|---|---|---|
| Pages + Courses | `onCmsScheduledCheck` (every 60s) | `PageService.publishScheduledPages()`, `CourseService.publishScheduledCourses()` | `findScheduledDue()` |
| Resources | `onBusinessScheduledCheck` | `ResourceService.publishScheduledResources()` | `findScheduledDue()` |

`findScheduledDue()` filter (verified in all three repositories): `status: "SCHEDULED"` AND `scheduledAt <= now()`.
- `page.repository.ts:378`, `course.repository.ts:210`, `resource.repository.ts:138`.

Each cron iteration, per item:
1. `updateStatus(... "PUBLISHED", ...)` — flips status, clears `scheduledAt`, bumps `version`.
2. Page/Course: `createVersion(...)` snapshot record.
3. Emit `{resource|page|course}/published` then `{resource|page|course}/status.changed` (from `SCHEDULED` to `PUBLISHED`).

## 2. MANUAL vs SCHEDULED PUBLISH (asymmetry fixed)

Manual publish (admin UI):
- Page: `page.service.ts:151-170` — sync `AuditService.write(page.published)` + sync `ActivityFeedService.write(published)` + `emitEvent(page/published)` + `emitEvent(page/status.changed)`.
- Course: `course.service.ts:234-253` — same pattern (`course.published`, verb `published`).
- Resource: `resource.service.ts:131-150` — same pattern (`resource.published`, verb `published`).

Scheduled publish (BEFORE this change):
- **Only** `updateStatus` + `createVersion` + `emitEvent` ×2. **Zero** audit rows, **zero** activity feed items. Fully invisible in audit history.

Scheduled publish (AFTER this change): identical parity with manual — sync `AuditService.write` + sync `ActivityFeedService.write` added between the two emits, using the same actions/verbs/snapshot shapes as manual publish.

## 3. ACTOR MODEL

The cron events historically carry `actorId: "system"`, `actorName: "System (Scheduled)"`, `requestId: "cron-<entity>-<id>"`.

Schema constraints (verified `schema.prisma`):
- `AuditLog.userId` `String? @db.Uuid` FK→User (`schema.prisma:520-545`); `requestId` `String? @db.Uuid`.
- `ActivityFeedItem.actorId` `String? @db.Uuid` FK→User `onDelete: SetNull`; `actorName` lives in the `context` Json (`schema.prisma:570-590`).
- No system user exists in any seed (`seed.ts`, `seed-lms.ts`, `seed_courses.ts`, `seed-blocks.ts`); no system-actor convention anywhere in the codebase.
- `AuditService.write({ orgId, action, entityType, entityId, userId?, requestId?, oldValue?, newValue? })` — `userId`/`requestId` are optional pass-through (`audit.service.ts:7,9,40-42`). Omitting them writes NULL.

**Decision:** cron scheduled-publish audit/activity uses **NULL actor** (no `userId`, no `actorId`, no `requestId`) with display identity carried in `context.actorName = "System (Scheduled)"`. This is the schema-correct representation of a non-human action:
- Valid UUID FK / `@db.Uuid` columns accept NULL unconditionally.
- Does not require fabricating a system user or any schema change.
- Matches the established handler pattern `context: { actorName }` used by every Inngest handler.

## 4. CHANGES MADE

| File | Change |
|---|---|
| `admin/src/lib/services/page.service.ts` | +22: sync `AuditService.write(page.published)` + `ActivityFeedService.write(published, context.actorName="System (Scheduled)")` in `publishScheduledPages()`. |
| `admin/src/lib/services/course.service.ts` | +22: sync `AuditService.write(course.published)` + `ActivityFeedService.write(published)` in `publishScheduledCourses()`. |
| `admin/src/lib/services/resource.service.ts` | +24: `updateStatus` result now captured (`updated`) and sync `AuditService.write(resource.published)` + `ActivityFeedService.write(published)` added in `publishScheduledResources()`. |

New audit rows carry `newValue: { status: "PUBLISHED", version, publishedAt }`; new feed items carry snapshot `{ title, slug, status }` (resource: `{ title, status }`) — mirroring manual publish.

No schema changes, no migrations, no new architecture, no event payload changes, no other files touched.

## 5. REPEAT SAFETY

- **Status gate:** `findScheduledDue()` only selects `SCHEDULED` + due items. `updateStatus` flips to `PUBLISHED` and clears `scheduledAt`. A re-run of the cron (or back-to-back manual invocations) finds nothing due → **no re-audit, no duplicates.**
- **Single-writer under current config:** with Inngest disabled (see §7), emitted events are no-ops, so the sync write is the ONLY audit writer for cron publishes. No dual-write duplication exists today.
- **Versioning:** `version` increments on publish; snapshots reference the exact published version. Idempotent across retries because the selection predicate can never match twice.
- Concurrency: Inngest crons run serially; even a concurrent manual publish of the same item is prevented by the status gate.

## 6. VERIFICATION

- `npm run typecheck` (tsc --noEmit): **PASS** after all three edits.
- `npx eslint` on the three edited files: **PASS** (no output).
- `next lint` cannot run in this repo (workspace-root lockfile inference bug: two lockfiles present) — eslint invoked directly instead.
- No test framework exists in `admin/package.json` (no test script, no jest/vitest). A live DB test was **not** run: the only delta vs the already-production-executed write path is omitted (NULL) `userId`/`requestId`/`actorId`, and nullable `String? @db.Uuid` columns with `onDelete: SetNull` accept NULL unconditionally in Postgres — no runtime risk.

## 7. INNGEST STATUS

- **DISABLED.** `INNGEST_EVENT_KEY` is unset everywhere; `isInngestEnabled()` is `false`; `emitEvent()` no-ops after an internal check (`inngest.ts:25-47`). Resend API key also unset.
- **Important latent finding:** if Inngest WERE enabled, the cron event handlers `onPagePublished` / `onCoursePublished` / `onResourcePublished` would crash on their audit writes — they pass `userId: d.actorId` (`"system"`) and `requestId: d.requestId` (`"cron-*"`) into `@db.Uuid` columns. The event-handler layer cannot represent cron actors. This is the root reason the reconciliation sprint judged the event architecture NOT READY. Keeping Inngest disabled is correct and mandatory until §8 is resolved.

## 8. ARCHITECTURE STILL REQUIRED (before Inngest can be enabled)

1. **Handler-level audit/activity reconciliation** — remove or rework the audit/activity writes inside `onPagePublished`/`onCoursePublished`/`onResourcePublished` (and the other ~22 event-handler audit writes). Today they would duplicate the now-sync service writes AND crash on non-UUID cron actors.
2. **Dedup rule** — define single-writer ownership per domain action (service-sync write wins; handlers should only fan out notifications, not re-audit). This resolves the 17 duplicate paths catalogued in `P1_EVENT_SIDE_EFFECT_RECONCILIATION_REPORT.md`.
3. **System actor** — optional schema-level improvement (a seeded `system` user or nullable-actor convention documentation) so future system actions are queryable. Not required by this change (null actor is already correct).
4. **Outbox/idempotency** — before enabling events in production.

## 9. NEXT STEP

Cron scheduled publishes now have full audit + activity parity with manual publishes, schema-safely, with no new architecture and no Inngest dependency. The smallest correct follow-up sprints, in order:

1. **P1 Lead/Media audit-gap alignment** — close the remaining audit gaps (lead acquisition, media publish/replace) using the same service-sync pattern.
2. **Event handler de-duplication** — reconcile the handler-level audit writes (§8.1-8.2) so the system becomes safe to enable Inngest later.

**Verdict:** ✅ SAFE / COMPLETE for this sprint. No commit made — three service files are staged in the working tree pending the project's review/commit process.
