# P1 AUDIT / ACTIVITY COVERAGE RECONCILIATION REPORT

**Branch:** `main` · **Baseline:** `106b5eec1f451d1d4742cddfc168aa2ea5f8b027` (HEAD == origin/main)
**Scope guard:** minimal changes only · no new abstractions/models/migrations/deps · Inngest stays disabled · nothing staged/committed.

---

## §1 Scope

Closed sync audit/activity coverage gaps for three event flows that previously relied on the DISABLED Inngest handlers for durable auditing:

| Flow | Event | Previously owned by | Gap |
|---|---|---|---|
| Public form lead (public route) | `lead/created` | handler (disabled) | ❌ no sync audit/activity |
| Admin-created lead (`LeadService.create`) | `lead/created` | handler (disabled) | ❌ no sync audit/activity |
| Recovered fallback lead | (no event) | handler (n/a) | ❌ no audit/activity on conversion |
| Media upload (`MediaService.upload`) | `media/uploaded` | handler (disabled) | ❌ no sync audit/activity |
| Media register / presign (`MediaService.register`) | `media/uploaded` | handler (disabled) | ❌ no sync audit/activity |

Model applied: **OPTION A** — sync application services own the durable audit/activity row (written transactionally at request time); Inngest handlers own only async automation/notifications (score recalculation, WhatsApp). Handler-side audit/activity for these two events was **removed**, making the ownership single-writer in every state (Inngest enabled or not).

## §2 Ownership Matrix (target state)

| Event | Sync writer (service) | Handler writer (Inngest) | Status |
|---|---|---|---|
| `lead/created` (public route) | `AuditService` + `ActivityFeedService` | — (removed) | **VERIFIED** |
| `lead/created` (`LeadService.create`) | `AuditService` + `ActivityFeedService` | — (removed) | **VERIFIED** |
| `media/uploaded` (`upload`) | `AuditService` + `ActivityFeedService` | — (removed) | **VERIFIED** |
| `media/uploaded` (`register`) | `AuditService` + `ActivityFeedService` | — (removed) | **VERIFIED** |
| Recovered fallback lead | `AuditService` + `ActivityFeedService` (sync) | n/a (no event emitted) | **VERIFIED** |
| `media/replaced`, `media/deleted`, `media.updated` | `AuditService` (replace/delete/update) | handler still writes for replaced/deleted | **PARTIAL** (unchanged, out of scope) |
| `page.*`, `course.*`, `resource.*` published/status | sync services | handler writes | **PARTIAL** (17-dup architecture — see §8) |
| `lead/status.changed`, `lead/assigned`, `lead/activity.created`, `admission.*`, `testimonial.*`, etc. | — | handler only | **BROKEN when Inngest disabled** (unchanged, out of scope) |
| `media/uploaded` when Inngest later enabled | sync service (1×) | no-op handler | **VERIFIED** (no duplication) |
| `lead/created` when Inngest later enabled | sync service (1×) | no-op for audit/activity | **VERIFIED** (no duplication) |

## §3 Changes (all uncommitted)

1. **`admin/src/app/api/public/leads/route.ts`** — added `AuditService.write(lead.created)` + `ActivityFeedService.write(created)` with **null** actor (`actorName: "Public form"`, `ipAddress: ip`) immediately before `emitEvent`. (Lead timeline `Web form submission` note unchanged.)
2. **`admin/src/lib/services/lead.service.ts`**
   - `create()`: added sync `AuditService.write(lead.created)` + `ActivityFeedService.write(created)` (ctx user/requestId/ip) before `emitEvent`.
   - `syncFallbackLeads()`: on successful conversion, added sync audit (`action: "lead.created"`, `newValue: { recoveredFromFallback: true }`) + activity (`verb: "created"`, `actorName: "Public form (recovered)"`, `recoveredFromFallback: true`) **before** `fallbackLead.update({ status: "recovered" })`. No event emitted.
3. **`admin/src/lib/events/functions/lead.functions.ts`** — `onLeadCreated`: removed `write-audit` + `write-activity-feed` steps (kept score recalculation + WhatsApp notification); removed now-unused `validUuid` import and `source`/`courseInterest` destructure. Payload type unchanged.
4. **`admin/src/lib/services/media.service.ts`**
   - `upload()`: added sync audit (`media.uploaded`) + activity (`uploaded`) after `MediaRepository.create`, before `emitEvent`.
   - `register()`: same sync audit + activity added.
5. **`admin/src/lib/events/functions/cms.functions.ts`** — `onMediaUploaded`: removed `write-audit` + `write-activity-feed` steps; handler is now a no-op `{ ok: true }` preserving the event contract. Imports retained (`AuditService`/`ActivityFeedService`/`validUuid` still used by `onMediaReplaced`, `onMediaDeleted`, `onPagePublished`, `onCoursePublished`, etc.).

## §4 Duplicate / side-effect analysis

Per flow, in **every** state (Inngest disabled today, or enabled later):

| Flow | Audit rows | Activity rows | Duplicates | Notes |
|---|---|---|---|---|
| Public lead | 1 | 1 | None | handler no longer writes |
| `LeadService.create` | 1 | 1 | None | handler no longer writes |
| Recovery conversion | 1 | 1 | None | no event → handler never fires |
| Recovery duplicate (lead already exists) | 0 | 0 | None | only existing leadActivity NOTE; correct |
| `MediaService.upload` | 1 | 1 | None | handler no-op |
| `MediaService.register` | 1 | 1 | None | handler no-op |

Idempotency: sync writes are unconditional single calls (no outbox, no retry loop at this layer — unchanged architecture). Re-running `scripts/replay-fallback-leads.ts` re-pushes through the public route, so each **successful** replay conversion produces exactly one audit/activity (owned by the public route). No event payload or name contract changed; no schema change; no new dependency.

## §5 Recovery status

Recovery **exists** (not intentionally deferred), so it was audited rather than built:
- `src/utils/fallback-storage.js` → Supabase `fallback_leads` (pending rows, `retry_count`).
- `LeadService.syncFallbackLeads(ctx)` (admin DB, org-slug gated) converts pending rows → leads + leadActivity note + status `recovered`.
- `scripts/replay-fallback-leads.ts` re-pushes retained fallbacks to the Admin public API.
- RLS migration (preserved, uncommitted): `ENABLE RLS`, anon insert-only, service_role FOR ALL.
- **Gap closed:** conversion now writes sync audit (`recoveredFromFallback: true`) + activity. Previous behavior had zero audit trail for recovered leads.

## §6 Verification

- `npm run typecheck` (`tsc --noEmit`) — **PASS**.
- `npx eslint` on all 5 changed files — **PASS** (0 errors).
- Duplication sweep via grep: `lead.functions.ts` has **no** audit/activity write in `onLeadCreated` (only 3 other handlers remain); `cms.functions.ts` `onMediaUploaded` is a no-op; `media.service.ts` has exactly 1 audit + 1 activity per `upload`/`register`.
- Live DB write test: **skipped by design** — the write services (`AuditService.write` / `ActivityFeedService.write`) and the null-actor/`validUuid` path were already exercised and proven in prior sprints (19/19 standalone test); this sprint changes no schema and reuses the identical write calls with authenticated UUID actors (lead/media) or null actors (public/recovery). No credentials consumed, no residue risk.

## §7 Inngest status: DISABLED

- `INNGEST_EVENT_KEY` unset; `isInngestEnabled()` false; `emitEvent` no-ops (no network call).
- This sprint does not enable Inngest, does not add an outbox, and does not change event names or payload shapes. Enabling Inngest later is now audit-safe for `lead/created` and `media/uploaded` by construction.

## §8 Remaining architecture (out of scope, documented)

- The broader 17-event duplicate ownership problem persists for other events (e.g. `media/replaced`/`media/deleted` double-write, handler-only events like `lead/status.changed`, `admission.*`) — recommended resolution remains **OPTION A**: migrate each handler-owned audit/activity into its sync service, leaving handlers for automation only (tracked in `P1_EVENT_SIDE_EFFECT_RECONCILIATION_REPORT.md` and `P1_EVENT_INNGEST_INTEGRITY_REPORT.md`).
- No outbox / exactly-once delivery; idempotency not addressed at the event layer.
- Score recalculation + WhatsApp notification on lead creation remain handler-only and will fire only when Inngest is enabled (accepted).

## §9 Working tree

All prior uncommitted work preserved and untouched; only the 5 files above changed this sprint. **Nothing staged, nothing committed.** Protected files (lead proxy, intake gate, fallback RLS, media/storage/presign, student page, placements, gap matrix, prior reports) unchanged.

## §10 Verdict

**PASS.** Sync audit/activity coverage for `lead/created`, `media/uploaded`, and recovered fallback leads is now single-writer, Inngest-independent, and duplicate-free in every state. Scope constraints honored; no new models, migrations, dependencies, or schema changes.
