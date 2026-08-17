# P1 INNGEST SYSTEM ACTOR SAFETY REPORT

- **Sprint:** P1 Inngest System Actor / UUID Safety Fix (strictly limited)
- **Branch/HEAD:** `main` @ `106b5eec1f451d1d4742cddfc168aa2ea5f8b027` (== origin/main)
- **Date:** 2026-08-14
- **Scope discipline:** No event names/payloads/schedules, no publish logic, no DB mutations, no audit/activity schema, no notification logic, no Inngest enablement, no env vars changed. No commit made.

---

## 1. Affected Handlers

### Inspected (entire Inngest implementation — 3 function files + client + types)

- `admin/src/lib/events/functions/cms.functions.ts` — onMediaUploaded, onMediaReplaced, onMediaDeleted, onPagePublished, onPageStatusChanged, onCoursePublished, onCourseStatusChanged, onContentVersionCreated, onCmsScheduledCheck
- `admin/src/lib/events/functions/business.functions.ts` — onResourcePublished, onResourceStatusChanged, onJobPublished, onJobStatusChanged, onJobApplicationSubmitted, onJobApplicationStatusChanged, onPlacementCreated, onPlacementUpdated, onTestimonialSubmitted, onTestimonialReviewed, onBusinessScheduledCheck
- `admin/src/lib/events/functions/lead.functions.ts` — onLeadCreated, onLeadStatusChanged, onLeadAssigned, onLeadActivityCreated
- `admin/src/lib/events/functions/admission.functions.ts` (5 handlers), `user.functions.ts` (1 handler), `admin/src/lib/events/inngest.ts` (client/emitter)
- **All 29 event emitters** traced to their sources to determine which events can carry a non-UUID `actorId`/`requestId`.

### Changed (7 handlers — every handler that can receive a non-UUID actor/requestId)

| Handler | Event | Source of invalid values | Guarded writes |
|---|---|---|---|
| `onPagePublished` | `page/published` | cron (`"system"`, `cron-page-*`) | audit + activity |
| `onPageStatusChanged` | `page/status.changed` | cron | activity |
| `onCoursePublished` | `course/published` | cron (`cron-course-*`) | audit + activity |
| `onCourseStatusChanged` | `course/status.changed` | cron | activity |
| `onResourcePublished` | `resource/published` | cron (`cron-resource-*`) | audit + activity |
| `onResourceStatusChanged` | `resource/status.changed` | cron | activity |
| `onLeadCreated` | `lead/created` | public form (`"system"`, IP address as requestId) | audit + activity |

### Verified NOT affected (safe, unchanged)

Every other handler consumes events emitted exclusively from authenticated admin contexts (`actorId: ctx.user.id`, `requestId: ctx.requestId` — real UUIDs). Verified emitters: media.service, page/course rollback (`content/version.created`), job.service, placement.service, testimonial.service, payment.service, document.service, admission.service, user.service, lead.service. The public `admin/src/app/api/public/leads/route.ts` is the **only** non-authenticated emitter, and it only fires `lead/created` (now guarded).

---

## 2. Root Cause

The service-level publish paths emit events whose payloads carry non-UUID actor markers, because a scheduled/system action has no real `User` row:

- `page.service.ts:432,464` / `course.service.ts:349,387` / `resource.service.ts:220,251` emit `actorId: "system"`, `requestId: "cron-<entity>-<id>"`.
- `public/leads/route.ts:154-156` emits `actorId: "system"`, `requestId: <ip>`.

The handlers forwarded these verbatim into the write services:

- `AuditService.write({ userId: d.actorId, requestId: d.requestId, … })`
- `ActivityFeedService.write({ actorId: d.actorId, … })`

Those params flow directly into Prisma `create` calls targeting UUID-typed columns:

- `AuditLog.userId` `String? @db.Uuid` (FK → User, SetNull) — `schema.prisma:520-545`
- `AuditLog.requestId` `String? @db.Uuid` — same model
- `ActivityFeedItem.actorId` `String? @db.Uuid` (FK → User, SetNull) — `schema.prisma:570-590`

Postgres rejects `"system"` / `"cron-page-…"` / `"203.0.113.7"` as `uuid` values (`invalid input syntax for type uuid`). If Inngest were enabled, every cron/public-form event would have crashed the handler's audit/activity step.

---

## 3. Fix

**New file:** `admin/src/lib/events/actor.ts` — one helper using the already-installed `uuid` package's `validate()`:

```ts
export function validUuid(value?: string | null): string | undefined {
  return value ? (isValidUuid(value) ? value : undefined) : undefined;
}
```

`undefined` → NULL in the Prisma writes; valid UUIDs pass through unchanged.

**Changed files (3):**
- `admin/src/lib/events/functions/cms.functions.ts` — `userId/requestId/actorId` in the 4 cron-sourced handlers wrapped with `validUuid(...)`.
- `admin/src/lib/events/functions/business.functions.ts` — same in the 2 resource cron-sourced handlers.
- `admin/src/lib/events/functions/lead.functions.ts` — same in `onLeadCreated`.

Behavior: for a cron/public-form event, `userId`/`actorId`/`requestId` now resolve to **null** in the DB; for an authenticated event they are unchanged. `actorName` is untouched and still flows into `context.actorName` ("System (Scheduled)" / "Public form").

---

## 4. Actor Semantics

| Field | Column type | Cron / system action (final) | Authenticated action (final) |
|---|---|---|---|
| `userId` (AuditService → `AuditLog.userId`) | `String? @db.Uuid` FK | **null** | user UUID |
| `actorId` (ActivityFeed → `ActivityFeedItem.actorId`) | `String? @db.Uuid` FK SetNull | **null** | user UUID |
| `actorName` (`context.actorName`) | Json (`context`) | `"System (Scheduled)"` (lead: `"Public form"`) | user name |
| `requestId` (AuditService → `AuditLog.requestId`) | `String? @db.Uuid` | **null** (`cron-*`/IP not storable) | request UUID |

No fabricated UUIDs, no `"system"` string, no fake/system user, no schema change. This is the established null-actor model from the previous sprint.

---

## 5. Runtime Safety

- No handler constructs or writes an invalid UUID: every `userId`/`actorId`/`requestId` written from an event path is either a validated UUID or `undefined` (→ NULL).
- All remaining raw `d.actorId`/`d.requestId` passes in admission/user/cms/business/lead handlers were verified to receive events only from authenticated emitters (`ctx.user.id`, `ctx.requestId`).
- The only `"system"` / `"cron-*"` / IP literals left in the codebase are in service-level **event payloads** (page/course/resource cron, public lead route) — untouched per scope, and now neutralized at the handler boundary.
- `AuditService.write` and `ActivityFeedService.write` both already swallow errors (`console.error` only), but the fix removes the failure mode entirely.

---

## 6. Verification

- `npm run typecheck` (tsc --noEmit): **PASS**
- `npx eslint` on all 4 touched files (`actor.ts`, `cms.functions.ts`, `business.functions.ts`, `lead.functions.ts`): **PASS**
- **Targeted module test** (standalone tsx script, run then removed — repo has no test framework): **19/19 PASS**, covering:
  - rejection of `"system"`, `cron-page-*`, `cron-course-*`, `cron-resource-*`, IP, empty/null/undefined
  - real UUID passthrough
  - simulated cron `page/published` and public `lead/created` write params → `userId`/`actorId`/`requestId` resolve to null, `actorName` preserved
  - simulated authenticated event → values preserved
- Not run (per scope): `npm run build`, `prisma generate`, migrations, any DB mutation.

---

## 7. Inngest Status

**INNGEST REMAINS DISABLED.**

`INNGEST_EVENT_KEY` is unset; `isInngestEnabled()` is `false`; `emitEvent()` no-ops. No environment, config, or route was touched.

---

## 8. Remaining Architecture Work

Do not solve now; tracked only:

1. **Duplicate side-effect ownership** — 17 paths where a service writes audit/activity synchronously AND the Inngest handler writes the same again (e.g. the new sync cron audits in page/course/resource services vs `onPagePublished`/`onCoursePublished`/`onResourcePublished`). A single-writer rule is required before Inngest can be enabled.
2. **Idempotency / outbox requirement** — no outbox or idempotent-event handling exists; without it, enabling Inngest risks duplicate or dropped side effects on retries/failures.

---

## 9. Next Recommended Sprint

**P1 Event Handler De-Duplication (single-writer ownership).** The smallest safe step: remove the audit/activity writes from the event handlers that now duplicate synchronous service writes (the 6 publish/status-changed handlers and the remaining handler-side audit writes), leaving handlers to own only notifications. This resolves the 17 duplicate paths and is the mandatory precondition for ever enabling Inngest. Outbox/idempotency remains a later, separate sprint.

**Verdict:** ✅ SAFE / COMPLETE — 7 handlers hardened, invalid-UUID writes eliminated, no architecture introduced, Inngest still disabled. Nothing committed.
