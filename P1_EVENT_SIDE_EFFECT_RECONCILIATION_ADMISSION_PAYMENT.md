# P1 EVENT SIDE-EFFECT RECONCILIATION REPORT

**Scope tag:** admission/created · admission/stage.changed · payment/received
**Branch:** `main` · **Baseline:** `106b5eec1f451d1d4742cddfc168aa2ea5f8b027` (HEAD == origin/main)
**Rules honored:** OPTION A · no new models/migrations/deps · Inngest stays disabled · nothing staged/committed.

---

## 1. Scope

Reconciled durable audit/activity ownership for exactly three event families:

1. `admission/created`
2. `admission/stage.changed`
3. `payment/received`

Each has exactly **one emitter** (verified by grep across `admin/src`):
- `admission/created` → `AdmissionService.create` (`admission.service.ts:86`)
- `admission/stage.changed` → `AdmissionService.changeStage` (`admission.service.ts:259`)
- `payment/received` → `PaymentService.create` (`payment.service.ts:67`)

Each has exactly **one handler** (verified): `onAdmissionCreated`, `onAdmissionStageChanged`, `onPaymentReceived` — all in `admission.functions.ts`. The previously-removed phantom `student.service.ts` `admission/created` emit remains removed (confirmed: zero matches in `student.service.ts`).

**All three sync services ALREADY owned durable audit + activity** for these events. This sprint removed the duplicate handler-side writes only; no service logic, payment calculations, fee-balance logic, status transitions, receipt generation, or gateway behavior were touched.

## 2. Event Ownership Matrix

| Event | Sync audit | Sync activity | Handler audit | Handler activity | Async handler work | Result |
|---|---|---|---|---|---|---|
| `admission/created` | ✅ `AdmissionService.create` (`admission.service.ts:64` "admission.created") | ✅ (`:75` verb "created") | ❌ removed | ❌ removed | ✅ `notify-admission-team` (counselor email) — **preserved** | **VERIFIED** |
| `admission/stage.changed` | ✅ `changeStage` (`:236` "admission.stage_changed") | ✅ (`:248` verb "stage_changed") | ❌ removed | ❌ removed | ❌ none remaining (enrollment lead-convert was duplicate) | **VERIFIED** |
| `payment/received` | ✅ `PaymentService.create` (`payment.service.ts:38` "payment.recorded") | ✅ (`:54` verb "recorded_payment") | ❌ removed | ❌ removed | ✅ `send-payment-receipt` (receipt email) — **preserved** | **VERIFIED** |

## 3. admission/created

- **DB mutation:** `AdmissionRepository.create` via `AdmissionService.create`.
- **Sync audit (1):** `action: "admission.created"` with `newValue { applicationNo, leadId, stage: "ENQUIRY" }`.
- **Sync activity (1):** `verb: "created"` with `actorName: ctx.user.name`.
- **Emit:** `admission/created` (authenticated ctx: `actorId/requestId` = real UUIDs).
- **Handler `onAdmissionCreated`:** removed `write-audit` + `write-activity-feed` (duplicates). **Preserved** `notify-admission-team` — legitimate async work (email the assigned counselor). Handler is NOT a no-op.
- **Stage history:** unaffected — stage-change audit lives in `changeStage` (§4).

## 4. admission/stage.changed

- **DB mutation:** `AdmissionRepository.advanceStage` via `AdmissionService.changeStage` (records stage history row with `performedBy: ctx.user.id`).
- **Sync audit (1):** `action: "admission.stage_changed"` with `oldValue {stage}` / `newValue {stage, studentId}`.
- **Sync activity (1):** `verb: "stage_changed"` with `context { from, to, actorName }`.
- **Sync enrollment side effects (owned by service):** on `ENROLLED`, `changeStage` already updates lead → `CONVERTED/convertedAt/score:100` (`admission.service.ts:219-223`) and student → `ACTIVE/enrolledAt` (`:225-233`).
- **Handler `onAdmissionStageChanged`:** removed `write-audit`, `write-activity-feed`, **and** `handle-enrollment` — the lead-conversion step was a byte-for-byte duplicate of the synchronous service write (same `status/score/convertedAt` update on the same `(leadId, orgId)` row). The sync service is the single owner. Handler is now a no-op returning `{ok:true}` because **no legitimate async responsibility remains** — this is the honest classification, not a forced no-op.
- **Ownership is uniform** for all stage changes: manual, enrollment, and any future system/scheduled path all route through the single emitter `changeStage`, so there is exactly one audit+activity regardless of trigger. Stage audit history is preserved (advanceStage row + sync audit).
- **Actor safety:** all writes use authenticated `ctx.user.id`/`ctx.requestId` (real UUIDs); no `validUuid` needed.

## 5. payment/received

- **DB mutation:** `PaymentRepository.create` (with `receiptNo`, `studentId`, `campusId`) → `AdmissionRepository.updateFeeBalance`.
- **Sync audit (1):** `action: "payment.recorded"` with `newValue { amount, method, receiptNo, admissionId }`.
- **Sync activity (1):** `verb: "recorded_payment"` with target admission.
- **Emit:** `payment/received` (authenticated).
- **Handler `onPaymentReceived`:** removed `write-audit` + `write-activity-feed` (duplicates). **Preserved** `send-payment-receipt` — legitimate async work (email receipt to student/lead). Handler is NOT a no-op.
- **NOT modified:** payment calculations, fee-balance logic, status transitions, receipt generation, gateway behavior.
- **Naming note (unchanged intentionally):** the durable action/verb are `payment.recorded` / `recorded_payment`, while the event is `payment/received`. The sync service is the established durable owner; renaming would change existing audit values beyond ownership reconciliation — documented, not changed.

## 6. Duplicate Side-Effect Analysis

**State A — Inngest DISABLED (current):** handlers never execute.
| Event | Audit rows | Activity rows | Duplicates | Async |
|---|---|---|---|---|
| `admission/created` | 1 | 1 | none | n/a (handler off) |
| `admission/stage.changed` | 1 | 1 | none | n/a (handler off) |
| `payment/received` | 1 | 1 | none | n/a (handler off) |

**State B — Inngest hypothetically ENABLED:**
| Event | Audit rows | Activity rows | Duplicates | Async still runs |
|---|---|---|---|---|
| `admission/created` | 1 | 1 | none (handler no longer writes) | ✅ counselor email |
| `admission/stage.changed` | 1 | 1 | none (handler no-op) | n/a (no legit async existed) |
| `payment/received` | 1 | 1 | none (handler no longer writes) | ✅ receipt email |

Both states provably yield exactly **1 audit + 1 activity** per event with zero duplication; all genuine asynchronous side effects survive. No event name/payload changed; no `emitEvent` sites changed.

## 7. Verification

- `npm run typecheck` (`tsc --noEmit`) — **PASS**.
- `npx eslint src/lib/events/functions/admission.functions.ts` — **PASS** (0 errors). Only one file changed this sprint.
- **Grep sweep:** `admission.created` / `admission.stage_changed` / `stage_changed` / `payment.recorded` / `recorded_payment` actions+verbs now exist **only** in the sync services; `admission.functions.ts` contains zero audit/activity writes for the three events; `payment.received`/`payment_received` (handler-only names) appear nowhere.
- **Tests:** no framework in repo; behavior unchanged in sync services, so no test added.
- **DB verification:** not performed — no service logic changed this sprint (handler dedup only, handlers disabled), so exercising the DB would only re-run unchanged production paths; no residue risk introduced. DB writes exercised in prior sprints.

## 8. Inngest Status

INNGEST REMAINS DISABLED.

- `INNGEST_EVENT_KEY` unset; `isInngestEnabled()` false; `emitEvent` no-ops.
- Handlers are registered but never execute.
- Enabling Inngest later is now audit-safe for these three events by construction (single-writer sync ownership, no duplicate writes, async notifications intact).

## 9. Remaining Architecture Work

Unresolved (NOT implemented, out of scope):
- **Handler-only durable writes** for other events remain broken while Inngest is disabled: `onDocumentUploaded`, `onDocumentReviewed` (`admission.functions.ts`), plus residual handler-owned audit/activity in `business.functions.ts` / `cms.functions.ts` (e.g. `media/replaced`, `media/deleted` still double-write with sync services). Recommended fix: migrate each to sync ownership (OPTION A), same pattern as this sprint.
- **Action/verb naming drift** (`payment.recorded` vs event `payment/received`) — cosmetic, unchanged.
- **No outbox / no idempotency / no event ledger / no retries** — unchanged; exactly-once semantics not addressed at the event layer.

## 10. Verdict

**PASS.**

All three events now have a single durable audit/activity owner (the sync service) with handler-side duplicates removed and all legitimate async work preserved. Exactly 1 audit + 1 activity per event in both Inngest states.

---

### Delivery facts

- **Files changed (1):** `admin/src/lib/events/functions/admission.functions.ts` — deduped `onAdmissionCreated`, `onAdmissionStageChanged`, `onPaymentReceived`; preserved `notify-admission-team` + `send-payment-receipt`.
- **Files unchanged (services already owned sync writes):** `admission.service.ts`, `payment.service.ts`, `student.service.ts`, all repositories, routes, `emitEvent` sites.
- **Protected files untouched:** students/[id]/page.tsx, lead/route.js, public-proxy, placements, Modal.jsx, fallback RLS, gap matrix, prior reports, `actor.ts`, all previously-reconciled lead/media files.
- **Nothing staged. Nothing committed.**
