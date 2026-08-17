# P1 EVENT SIDE-EFFECT RECONCILIATION REPORT

**Scope tag:** placements + documents
**Branch:** `main` · **Baseline:** `106b5eec1f451d1d4742cddfc168aa2ea5f8b027` (HEAD == origin/main)
**Rules honored:** OPTION A · no new models/migrations/deps · Inngest stays disabled · nothing staged/committed.

---

## 1. Scope

The proposed names in the task were NOT assumed. Actual event names discovered in the repository:

| Task proposal | Actual event(s) in repo | Notes |
|---|---|---|
| `placement/created` | ✅ `placement/created` | types:212, emitted `placement.service.ts:164` |
| `placement/updated` | ✅ `placement/updated` | types:217, emitted `placement.service.ts:208` |
| `placement/deleted` | ❌ **no event** | delete path has sync audit only (no emit, no handler) |
| `document/uploaded` OR `document/created` | ✅ `document/uploaded` | types:123, emitted `document.service.ts:98` |
| `document/approved` / `document/rejected` | ✅ **`document/reviewed`** (status field) | types:128, emitted `document.service.ts:160`; approve/reject are statuses |
| `document/deleted` | ❌ **no event, no delete path** | `DocumentService` has no delete; repository has no delete |

Emitters (verified by grep, single emitter each): `placement.service.ts`, `document.service.ts`. Handlers: `onPlacementCreated`/`onPlacementUpdated` (`business.functions.ts`), `onDocumentUploaded`/`onDocumentReviewed` (`admission.functions.ts`). No public-route emitters; protected `admin/src/app/api/public/placements/route.ts` untouched (GET-only, no emit).

## 2. Event Ownership Matrix

| Event | Sync audit | Sync activity | Handler audit | Handler activity | Legit async | Final owner |
|---|---|---|---|---|---|---|
| `placement/created` | ✅ `PlacementService.create` (:139 "placement.created") | ✅ (:153 "created") | ❌ removed | ❌ removed | none | **SYNC** |
| `placement/updated` | ✅ `PlacementService.update` (:185 "placement.updated") | ✅ (:196 "updated") | ❌ removed (`placement.status_changed` dup) | none existed | none | **SYNC** |
| `placement/deleted` | ✅ `PlacementService.delete` (:225 "placement.deleted") | ✅ **added** (:238 "deleted") | n/a (no event) | n/a | n/a | **SYNC** |
| `document/uploaded` | ✅ `DocumentService.upload` (:79) | ✅ (:85 "uploaded") | ❌ removed | ❌ removed | none | **SYNC** |
| `document/reviewed` (approve/reject) | ✅ `DocumentService.review` (:142 `document.${status}`) | ✅ (:149 approved/rejected) | ❌ removed | ❌ removed | none | **SYNC** |

## 3. Placement Events

- **Canonical DB paths:** `PlacementRepository.create/update/delete` via `PlacementService`.
- **create:** sync audit `placement.created` + sync activity `created` + emit `placement/created`. Handler `onPlacementCreated` wrote the identical audit+activity → **removed**; no async work existed → handler is a no-op.
- **update:** sync audit `placement.updated` + sync activity `updated` + emit `placement/updated` (only when status changes). Handler `onPlacementUpdated` wrote `placement.status_changed` — a duplicate durable record of the same status change already captured by the sync audit's `newValue.status` → **removed**; no async work → no-op.
- **delete:** no event exists. Sync audit `placement.deleted` was already present; sync activity was **missing** → added `verb: "deleted"` (consistent with create/update, per OPTION A: sync owns audit + activity for every durable mutation).
- **NOT modified:** placement status logic, public visibility, hiring-partner behavior, org scoping, student association, public API PII protections, `HiringPartnerService` audit/activity (already sync-owned, untouched).
- **Actor safety:** all writes use authenticated `ctx.user.id`/`ctx.requestId` (real UUIDs); no `validUuid` needed on these paths.

## 4. Document Events

- **Canonical DB paths:** `DocumentRepository.create` / `DocumentRepository.review` via `DocumentService`.
- **upload:** sync audit `document.uploaded` + sync activity `uploaded` + emit `document/uploaded`. Handler `onDocumentUploaded` wrote the identical audit+activity → **removed**; no async work → no-op.
- **review (approve/reject/under-review):** sync audit `document.${status}` + sync activity `approved`/`rejected`/`marked_under_review` + emit `document/reviewed`. Handler `onDocumentReviewed` wrote the identical audit+activity → **removed**; no async work → no-op.
- **delete:** no delete method exists in `DocumentService`/`DocumentRepository` → nothing to reconcile.
- **NOT modified:** file storage, R2 presigned URLs, `getPresignedUrl`, document permissions, approval rules (ADMIN/ORG_ADMIN check), rejection-reason requirement, URLs, upload behavior. `ReviewDocumentInput` contract unchanged.
- **Actor safety:** authenticated paths; handler writes removed so no actor propagation needed.

## 5. Duplicate Side-Effect Analysis

**State A — Inngest DISABLED (current):** handlers never execute.
| Event | Audit rows | Activity rows | Duplicates |
|---|---|---|---|
| `placement/created` | 1 | 1 | none |
| `placement/updated` | 1 | 1 | none |
| `placement/deleted` | 1 | 1 | none |
| `document/uploaded` | 1 | 1 | none |
| `document/reviewed` | 1 | 1 | none |

**State B — Inngest hypothetically ENABLED:**
| Event | Audit rows | Activity rows | Duplicates | Async preserved |
|---|---|---|---|---|
| `placement/created` | 1 | 1 | none | n/a (no async existed) |
| `placement/updated` | 1 | 1 | none | n/a (no async existed) |
| `placement/deleted` | 1 | 1 | none | n/a (no event) |
| `document/uploaded` | 1 | 1 | none | n/a (no async existed) |
| `document/reviewed` | 1 | 1 | none | n/a (no async existed) |

Both states provably yield **exactly 1 audit + 1 activity** per event with zero duplication. Grep sweep confirms the actions (`placement.created`, `placement.updated`, `placement.deleted`, `document.uploaded`, `document.${status}`) and verbs exist only in the sync services.

## 6. Legitimate Async Behavior

None of the four reconciled handlers contained legitimate asynchronous work (notifications/scoring/automation) — each was audit+activity only. Making them no-ops is therefore correct, not forced: there were no real responsibilities to preserve. Unrelated preserved async handlers (from prior sprints) remain intact and untouched: `onAdmissionCreated` (counselor email), `onPaymentReceived` (receipt email), `onLeadCreated` (score + WhatsApp).

## 7. Verification

- `npm run typecheck` (`tsc --noEmit`) — **PASS**.
- `npx eslint` on the 3 changed files (`business.functions.ts`, `admission.functions.ts`, `placement.service.ts`) — **PASS** (0 errors).
- **Grep sweeps:** no handler references to `placement.created`/`placement.status_changed`/`document.uploaded`/`document.*` audit actions remain (only comments); every action/verb for these families exists once, in the sync services.
- **Tests:** no framework in repo; sync services were not altered except adding a single `ActivityFeedService.write` on placement delete (identical to the proven update/create pattern).
- **DB verification:** not performed — no service logic changed; the only added write reuses an already-exercised `ActivityFeedService.write` pattern. No residue risk introduced; no existing records touched.

## 8. Inngest Status

INNGEST REMAINS DISABLED.

- `INNGEST_EVENT_KEY` unset; `isInngestEnabled()` false; `emitEvent` no-ops.
- Handlers are registered but never execute.
- Enabling Inngest later is now audit-safe for placements + documents by construction: single-writer sync ownership, no duplicate writes, no lost async behavior (there was none in these handlers).

## 9. Remaining Architecture Work

Unresolved (NOT implemented, out of scope):
- **Handler-only / residual handler-owned writes** for other event families remain broken while Inngest is disabled: `business.functions.ts` (`onResourcePublished`, `onTestimonialSubmitted`, `onTestimonialReviewed`, `onJobApplicationStatusChanged`, etc.) and `cms.functions.ts` (`media/replaced`, `media/deleted` double-write with sync services). Recommended fix: migrate each to sync ownership (OPTION A).
- **No outbox / no idempotency / no event ledger / no retries** — unchanged; exactly-once semantics not addressed at the event layer.
- `placement/deleted` and `document/reviewed` naming conventions are internal to sync audits; no event contract exists for delete — documented, not changed.

## 10. Verdict

**PASS.**

All placements + documents events have a single durable audit/activity owner (the sync service), handler-side duplicates removed, and exactly 1 audit + 1 activity per event in both Inngest states. No business logic touched.

---

### Delivery facts

- **Files changed (3):**
  - `admin/src/lib/events/functions/business.functions.ts` — `onPlacementCreated`, `onPlacementUpdated` → no-ops (duplicate writes removed).
  - `admin/src/lib/events/functions/admission.functions.ts` — `onDocumentUploaded`, `onDocumentReviewed` → no-ops (duplicate writes removed); removed now-unused `AuditService`/`ActivityFeedService` imports.
  - `admin/src/lib/services/placement.service.ts` — `delete()` now writes sync activity `deleted` (was missing).
- **Protected files untouched:** students/[id]/page.tsx, lead/route.js, public-proxy, `public/placements/route.ts`, Modal.jsx, fallback RLS, gap matrix, prior reports, `actor.ts`, all previously-reconciled families.
- **Nothing staged. Nothing committed.**
