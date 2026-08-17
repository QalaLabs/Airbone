# P1 Event Side-Effect Reconciliation — Jobs, Testimonials, Users (Final Sprint)

**Status:** PASS
**Date:** 2026-08-14
**Scope:** Jobs, testimonials, and user invite events. Synchronous audit/activity ownership vs Inngest handler side-effects.

---

## Objective

Reconcile audit/activity coverage between synchronous service methods and the Inngest event-handler layer for:
1. **Job events** — create/update/delete/publish/status changes, application-related events if present
2. **Testimonial events** — create/submit/review/delete
3. **User events** — invite

Rule: durable audit/activity must be owned **synchronously** by the service mutation; event handlers may only own genuinely **asynchronous** responsibilities (emails, notifications). Where an event handler is purely duplicative, it becomes a no-op; where an event handler owns the *only* write (missing sync side-effect), that write moves into the sync service method.

## Actual events discovered

| Event | Emitter (service) | Handler |
|---|---|---|
| `job/published` | `job.service.ts:146` (`publish`) | `business.functions.ts` `onJobPublished` |
| `job/status.changed` | `job.service.ts:162` (`publish`) | `business.functions.ts` `onJobStatusChanged` |
| `job_application/submitted` | `job.service.ts:235` (`submit`) | `business.functions.ts` `onJobApplicationSubmitted` |
| `job_application/status.changed` | `job.service.ts:289` (`updateStatus`) | `business.functions.ts` `onJobApplicationStatusChanged` |
| `testimonial/submitted` | `testimonial.service.ts:55` (`create`) | `business.functions.ts` `onTestimonialSubmitted` |
| `testimonial/reviewed` | `testimonial.service.ts:135` (`review`) | `business.functions.ts` `onTestimonialReviewed` |
| `user/invited` | `user.service.ts:70` (`invite`) | `user.functions.ts` `onUserInvited` |

No `job/delete`, `job/update`, `testimonial/delete`, or `testimonial/update` events exist. Those mutations are already audit-owned synchronously and are out of event scope.

## Ownership analysis

| Event | Sync audit | Sync activity | Handler audit/activity | Handler async | Verdict |
|---|---|---|---|---|---|
| `job/published` | ✔ `job.published` (service) | ✔ `published` (service) | audit + activity | none | **Duplicate → no-op** |
| `job/status.changed` | — (covered by publish audit) | ✔ (service) | activity `status_changed` | none | **Duplicate → no-op** |
| `job_application/submitted` | ✔ (service) | ✔ `submitted` (service) | audit + activity | none | **Duplicate → no-op** |
| `job_application/status.changed` | ✔ (service) | ✔ (service) | audit | none | **Duplicate → no-op** |
| `testimonial/submitted` | ✔ (service) | ✔ (service) | audit | none | **Duplicate → no-op** |
| `testimonial/reviewed` | ✔ (service) | ✔ `approved`/`rejected` (service) | audit + activity | none | **Duplicate → no-op** |
| `user/invited` | ✔ `user.invited` (service) | ✘ **MISSING** (activity only existed in handler) | audit + activity | `send-invite-email` | **Add sync activity; handler keeps only email** |

## Changes applied

### 1. `admin/src/lib/events/functions/business.functions.ts`
- `onJobPublished` → no-op (was writing duplicate audit `job.published` + activity `published`).
- `onJobStatusChanged` → no-op (was writing duplicate activity `status_changed`).
- `onJobApplicationSubmitted` → no-op (was writing duplicate audit `job_application.submitted` + activity `submitted`).
- `onJobApplicationStatusChanged` → no-op (was writing duplicate audit `job_application.status_changed`).
- `onTestimonialSubmitted` → no-op (was writing duplicate audit `testimonial.submitted`).
- `onTestimonialReviewed` → no-op (was writing duplicate audit `testimonial.<status>` + activity `approved`/`rejected`).
- Removed now-unused `AuditService`, `ActivityFeedService` imports and the `Base` helper type.
- `onBusinessScheduledCheck` cron and `ResourceService.publishScheduledResources()` call **unchanged**.

### 2. `admin/src/lib/services/user.service.ts`
- `invite()` now writes sync activity `invited` (actor = inviting user, object = invited user) immediately after the existing sync audit `user.invited` and before `emitEvent` — closing the **missing sync side-effect**. No auth/password/RBAC semantics touched.

### 3. `admin/src/lib/events/functions/user.functions.ts`
- `onUserInvited` no longer writes audit `user.invited` or activity `invited` (now owned synchronously by `UserService.invite`).
- **`send-invite-email` step KEPT** — legitimate asynchronous responsibility (invitation email via `NotificationService.dispatch` for `USER_INVITED`/`EMAIL` when a template exists).
- Removed now-unused `AuditService`, `ActivityFeedService` imports.

## Verification

- `npm run typecheck` (admin) — PASS.
- `npx eslint` on the three changed files — PASS (no unused imports/vars).
- **Dedup proof:** `name: "(user|job|job_application|testimonial)/"` matches = 7, all in services (emitters). `event: "(user|job|job_application|testimonial)/"` matches = 7, all in function files (registrations). Each event has exactly one emitter and one handler; no handler still performs audit/activity writes.

## Protected / untouched
- User authentication, password hashing, session, RBAC/permissions, user lifecycle semantics — untouched.
- `JobService` and `TestimonialService` sync writes — untouched (already correct).
- Inngest remains **disabled** (`INNGEST_EVENT_KEY` unset); handler code stays registered/dormant.
- Prior completed reconciliation families (leads, media, admission, payment, placements, documents, page, course, resource, scheduled publishing) — not reopened.
- No outbox, idempotency key, or ledger architecture introduced.

## Remaining architecture work (out of scope, documented)
- Minor consistency gap observed: non-event mutations `job` update/delete and `testimonial` update/delete write audit but no activity-feed row. These are not event paths; adding them is deferred as architecture/consistency work, not a side-effect duplication.
