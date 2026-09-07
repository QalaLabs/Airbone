# AIRBORNE ADMIN OS — TEST GAP REPORT

## 1. Inventory (what exists today)

Script: `admin` → `"test": "node --import tsx --test \"src/**/*.test.ts\""`.

| Test file | Area | Result | DB-dependent? |
|---|---|---|---|
| `src/lib/automation/lead-interakt.test.ts` | Lead score recalc + Interakt lead_created mapping | pass | no |
| `src/lib/automation/cron-auth.test.ts` | Cron secret / path authorization | pass | ⚠ reads `utils/auth.ts` org by id → touches DB |
| `src/lib/automation/automation.test.ts` | Workflow evaluation / run logic | pass | no |
| `src/lib/automation/hardening.test.ts` | Idempotency/retry hardening of dispatcher | pass | no |
| `src/lib/messaging/interakt.test.ts` | Interakt API client arg/URL shaping | pass | no |
| `src/lib/webhooks/signature.test.ts` | HMAC webhook signature bytes | pass | no |
| `src/lib/messaging/inbox-template.test.ts` | Inbox transcript template building | pass | no |
| `src/lib/leads/lead-status.test.ts` | Status hierarchy / classification | pass | no |
| `admin/scripts/(various .mjs QA)` | Ad-hoc manual QA (fee fixes, replay) | N/A | — manual |

**Total: 9 automated tests, all pass locally. Zero tests in the marketing site (`src/`) or any end-to-end/component suite.**
`test_webapp.py` (Playwright) exists on disk but is **not wired** to any script/CI.

## 2. Coverage by module

| Module | Tests | Gap severity |
|---|---|---|
| Lead status/scoring | ✔ (2 files) | Low — consider scoring-cascade cases |
| Automation/Interakt | ✔ (4 files) | Medium — no `cron/automation` route-level test |
| Webhook signatures | ✔ (1) | Low |
| Messaging client | ✔ (2) | Medium — no real provider contract test |
| Payments / fee ledger | ✖ | **CRITICAL** (non-transactional write logic is the class of bug this would catch) |
| Admissions (shape-transition, ENROLL side-effects) | ✖ | High |
| Students / student-edit | ✖ | Medium |
| Refunds / partial refunds | ✖ | High (B-03) |
| Deals/pipeline (derived funnel correctness) | ✖ | Medium |
| CRM analytics aggregations | ✖ | High — reports drive billing decisions |
| Outreach template/audience selection | ✖ | Medium |
| Users/auth/RBAC/permission | ✖ | High — permission logic entirely untested |
| Audit hash-chain verification | ✖ | Medium |
| Unified timeline composition | ✖ | Medium |
| WhatsApp domain (templates/campaigns/sequences) | ✖ | High — big surface, provider-gated |
| Workflow engine (node eval, branches, retries) | ✖ | High |
| CMS (publish/version/rollback) | ✖ | Medium |
| Media/storage providers | ✖ | Medium |
| Public API contracts (intake, settings) | ✖ | **CRITICAL** — settings leak regression would be caught |
| Marketing site (lead form, error paths) | ✖ | High — 0 coverage |
| E2E (login → lead → admission → payment → record) | ✖ | High — no smoke path exists |

## 3. What to add (priority order)

P0 (regression catchers for CRITICAL findings)
1. `payment.service.recordPayment` — transactional insert + rebalance, refund, duplicate referenceNo rejection.
2. `admission.repository.patchAdmission` — feeDiscount/feeAmount interplay (B-05).
3. `org.service.sanitizeOrgSettings` — assert `googleAdsWebhookSecret` + all settings secrets stripped, only public fields remain; plus `GET api/public/settings` route test asserting redaction (would have caught the leak).
4. Public intake contract: valid/invalid key, rate limit, idempotent same-leadUuid, phone-duplicate 409.

P1
5. `changeStage([ENQUIRY→ENROLLED])` — creates student + sets CONVERTED + (future) LMS enrollment, all atomic.
6. Conver→Admission status mapping (`APPLICATION_SUBMITTED` → desired terminal value after fix).
7. CRM analytics: WON counts, opportunitySales after lifecycle fix.
8. Workflow engine: branches, retries, skipped-when-seen event dedup in `automationWorkflows`.
9. WhatsApp domain: template validation vs provider, campaign row creation failures.

P2
10. RBAC permission resolver (should read `Permission` rows; assert role fallbacks).
11. Audit chain integrity (hash of n-th record = f(prev hash, payload)).
12. Timeline composition (sources cap, sentinel-UUID replacement after fix).
13. CMS publish→version snapshot→rollback.
14. Media storage provider fallback (SUPABASE → R2, 503 path).
15. Marketing site: `/api/lead` success + 5xx fallback to fallback_leads + truthy 4xx passthrough.

P3 (infra)
16. Wire `test_webapp.py` (or a fresh Playwright suite) as the E2E smoke: login → create lead → convert → add admission → record payment → open ledger.
17. CI wiring: run `node --import tsx --test` on every PR; enforce `find` glob portability (Windows glob concerns noted) — prefer running on the runner workstation / pin pattern to `src/**/*.test.ts`.
18. Add a dedicated fee-ledger consistency test asserting `feePaid == SUM(COMPLETED+partial math)` after every write path (guards B-01/B-04).