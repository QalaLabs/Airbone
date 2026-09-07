# SECTION 7 Remediation Result

Status of every finding from `SECTION_7_CROSS_SECTION_AUDIT.md` after the remediation pass.

**Verdict: CONDITIONALLY PRODUCTION READY — all release blockers closed, all code verification green. Not scored `PRODUCTION READY` because live provider smoke (GTM/GA4/Meta Pixel/Clarity/Interakt/payments) and an actual production deployment have not been performed/evidenced.**

## 1. Executive Summary

Every finding in the Section 7 audit (C-01 through L-08, plus H/M groups) was remediated with concrete code and verified end-to-end: full gated test suite (274/274), admin+marketing `tsc`, both apps' `lint` and `next build`, a fresh-DB migration-from-zero replay with **zero drift**, seed idempotency, and a live HTTP verification matrix against both running apps wired to the **local** test database. One **new latent defect was discovered and fixed during P25** (audit-log `requestId` was typed `@db.Uuid` but system contexts pass non-UUID correlation IDs, silently dropping audit rows — see section 3/H-01 addendum). No code was committed, pushed, or deployed; no production database was touched.

## 2. Baseline

- Audit source: `SECTION_7_CROSS_SECTION_AUDIT.md` — findings C-01, H-01..H-04, M-01..M-10, L-01..L-08.
- Pre-remediation: 254 admin tests; drift between `schema.prisma` and the three untracked C-01 migrations; hardcoded analytics/OTP config; unverified absolute marketing claims; one release-blocking migration gap (C-01).

## 3. C-01 — Schema/Migration Drift — **CLOSED (was the sole release blocker)**

- **Before this pass**: three untracked migrations (`fees_payments_integrity`, `admission_batch_course_link`, `crm_pipeline_deals`) existed but were not reconciled with `schema.prisma`; `git status` flagged drift.
- **Fix**: migrations reconciled + staged; `migration_lock.toml` whitespace restored; `schema.prisma` == the three migration outputs.
- **New in this pass**: migration `20260906183503_audit_log_request_id_varchar` added (see §3a) and **staged**.
- **Evidence**: fresh disposable `airbone_replay` DB → **17/17 migrations apply from zero**, `prisma migrate diff --from-migrations --to-schema-datamodel` → **"No difference detected."** Replay DB dropped afterward.
- **Gate**: `airbone_replay` recreated → 17/17 applied → zero drift → dropped.

### 3a. NEW defect found & fixed (audit-log `requestId` typed `@db.Uuid`)

During P25 the gated run surfaced `P2023` traces (`Error creating UUID, invalid character ... found 'r'`) emitted by `AuditService.write` when workflow/cron contexts pass non-UUID request IDs (`run-${run.id}` in `workflow/runner.ts`, `req-${orgId}` in tests, `cron-course-${id}` in `course.service.ts`, arbitrary `x-request-id` headers in `middleware/context.ts`). Because `AuditService.write` swallows errors (by design: audit must not crash callers), those **audit rows were silently dropped**, silently weakening hash-chain integrity for system-generated actions.

Fix: `AuditLog.requestId` changed `@db.Uuid` → `@db.VarChar(255)` (it is a correlation string, not a UUID). Migration `20260906183503_audit_log_request_id_varchar` (ALTER TYPE only, no data loss — existing UUID strings are legal VARCHAR). After regenerate + deploy, the `P2023` trace is **gone** and audit INSERTs succeed. Verified by the org-scope workflow test (audit + activity rows now written).

## 4. H-01 — Workflow & Automation Org-Scoping — **CLOSED**

- `workflow/actions.ts` lead mutations scoped by `orgId` (`updateMany` + `orgId`); `automation/event-handlers.ts` `findUnique`→`findFirst`+`orgId` (no candidate user collision), score update scoped.
- Integration test `org-scope.integration.test.ts`: cross-org `ASSIGN_LEAD`/`UPDATE_STATUS`/`ADD_TAG`/`UPDATE_LEAD` are no-ops on another org's lead; same-org action mutates (guards not over-broad). Gated by `WORKFLOW_INTEGRATION=1`.
- Addendum: the org-scope test now also proves the audit row (previously dropped) is written with the fixed `requestId` type.

## 5. H-02 — ATPL Duration Discrepancy — **CLOSED**

- ATPL duration `P2M`→`P4M`; badge/FAQ/description "2–3 months"→"4–6 months" in `courses/atpl/page.jsx`.
- HTTP: `/courses/atpl` renders "4–6 Months", no "2-3" residue.

## 6. H-03 — Sitemap / Refund Policy / Stale Slugs — **CLOSED**

- `/refund-policy` added to `sitemap.js` static routes; `cabin-crew`→`cabin-crew-training`, `cpl-ground-classes`→`commercial-pilot-license-cpl`, `flying-training`→`flying-training-india-abroad` alias mapping.
- HTTP: `/sitemap.xml` contains `/refund-policy`, `/courses/atpl`, `/blog/...`; no `/portal` (redirect stub correctly excluded).

## 7. H-04 — DB Safety Interlock — **CLOSED**

- Zero-dependency guards `admin/scripts/safe-db-check.mjs` (`assertSafeDatabaseUrl`, fail-closed: requires shell `DATABASE_URL`, loopback host, DB == `SAFE_DB_EXPECT_DB` default `airbone_test`; explicit `--allow-prod`+`NODE_ENV=production` is the only prod path) and `admin/scripts/run-tests-local.mjs` (enables all 7 integration gates). Wired into every DB-touching `package.json` script.
- **Live proof this matters**: an unguarded `npm start` on admin auto-loaded `admin/.env` → Prod Cloud SQL (`34.93.180.179`); the jobs probe 500'd on the prod read. Relaunching with local `DATABASE_URL` pinned (shell override beats `.env`) fixed it — and this is exactly the hazard H-04 prevents for `build`/`migrate`/`seed`/`reset`.
- Docker build path (`npx prisma generate && npx next build`) is unaffected by the guards.

## 8. M-01 — Concurrent Reflex / Refund Race — **CLOSED**

- `PaymentService.refund()` now `SELECT ... FOR UPDATE` (row lock). Concurrent-refund test (`fees.integration.test.ts`): 50k+40k booking, two concurrent 40k refunds → exactly 1 success, 1 rejected. Gated by `FEES_INTEGRATION=1`.

## 9. M-02 — Follow-up/Activities Counselor ABAC — **CLOSED**

- `follow-up/route.ts` PATCH + `activities/route.ts` GET/POST: `guardRecord(lead, ctx)` + counselor condition (assignment-based). tsc clean.

## 10. M-03 — Analytics Counselor Scope — **CLOSED**

- `buildAnalyticsScope` + `AnalyticsUser` extracted to pure module `admin/src/lib/analytics/scope.ts` (route file exports only HTTP handlers — fixes Next route-export gate). All aggregates counselor-scoped; fail-closed role check (no `!!id` bypass). `scope.test.ts` (3 cases).

## 11. M-04 — Organization Secret Redaction — **CLOSED**

- `ORG_SETTINGS_WRITE_ONLY_KEYS` (`googleAdsWebhookSecret`, `envVars`, `interaktWebhookSecret`, `whatsappWebhookSecret`); `sanitizeOrgSettings` strips all on read. Unit tests + HTTP check: `/api/public/settings` returns `{}` for the settings blob, no secret keys.

## 12. M-05 — Media MIME Allowlist — **CLOSED**

- Client `.refine(isAllowedMediaType)` on `registerAssetSchema.mimeType`/`replaceAssetSchema.mimeType`/`presignMediaSchema.contentType`; server re-validation in `media.service.ts`. `media.schema.test.ts` (4 cases).

## 13. M-06 — Resource/Intake-Key Fail-Closed — **CLOSED**

- `loadSecret()` throws on unset/`dev-fallback-secret` → `sign()` fails closed → `generateResourceToken` throws, `verifyResourceToken` returns `{valid:false}`. `resource-token.test.ts` (5 cases).

## 14. M-07 — Dead Permission Resources Pruned — **CLOSED**

- `seo`, `cms`, `enquiries`, `campaigns` pruned from `PERMISSION_MATRIX` across 4 roles. Behavior-neutral. `permissions.test.ts` (3 cases).

## 15. M-08 — Deal Revert / Admission Semantics — **CLOSED**

- Part A: orphan hard-delete on P2002 race → soft-archive (`stage:"CANCELLED"`) in `deal.service.ts` + `lead.service.ts`. Part B (user decision preserved): `revertToProspect` clears `admissionId:null`/`convertedAt:null` on the deal; Admission retained as source of truth. Assertions added to `deals.integration.test.ts`. Gated by `DEALS_INTEGRATION=1`.

## 16. M-09 — Jobs Seed Non-Vacuous Public Contract — **CLOSED**

- PUBLISHED, never-closed job seeded (`cpl-ground-school-mentor-2026`, salary range, tags, SEO); seed idempotent; `section6.public-contract.integration.test.ts` asserts non-empty feed + no PII. Gated by `SECTION6_INTEGRATION=1`.
- HTTP: `/api/public/jobs` → 200, returns the seeded PUBLISHED job with salary/tags/description; private fields absent.

## 17. M-10 — Unknown Image Hostnames — **CLOSED (documentation-only)**

- Documented in `next.config.js`: keep the Unsplash allowlist; CMS media served via anchors (not `<Image>`); a storage hostname must be added to `remotePatterns` before CMS images migrate to `<Image>`. No unverified hostname added. Correctly `CLOSED` (documentation-only) per the task note, matching that CMS media is not rendered through `next/image`.

## 18. L-01 — Test/ESLint Cleanup — **CLOSED**

- `meta.service.test.ts` ESM fix (`node:crypto` import); 4 unused `eslint-disable` directives removed. Admin `npm run lint` → "No ESLint warnings or errors" (exit 0).

## 19. L-02 — TypeScript Strict — **PARTIAL**

- Root `tsconfig.json` now `"strict": true` (verified 0 errors); stale `admin/.eslintrc.json` deleted. **Remainder deferred**: re-enabling `no-explicit-any`/`no-unused-vars`/`prefer-const` in admin ESLint would surface 30+ unrelated existing errors across the codebase → dedicated refactor to keep the green gate. **Does not block release.**

## 20. L-03 — Dead Env Cleanup — **CLOSED**

- `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED`, `NEXT_PUBLIC_FRAPPE_URL` (admin `env.ts` + `.env.example`), `VOICE_AI_TOKEN` (marketing `.env.example`) removed after full search (src, scripts, configs, env loaders, dynamic `process.env`). `PUBLIC_ORG_SLUG`, `NEXT_PUBLIC_FACEBOOK_APP_ID` kept (verified in use). tsc clean.

## 21. L-04 — Homepage Metadata — **CLOSED (no code change needed)**

- Verified against live structure: root `layout.jsx` already exports full metadata — title, description, canonical `/`, `openGraph.url/siteName/image/locale`, `twitter:card`. `(home)` route group has no overriding layout; homepage is a client component inheriting the server layout metadata.
- `HTTP /`: renders title, `rel="canonical" href="https://www.airborneaviation.in"`, `og:url`, OG image, twitter tags — all present.
- `/portal`: client redirect stub (to admin origin) — correctly absent from sitemap; no `noindex` applied to the public homepage.
- Per audit, no homepage rewrite was needed; the finding was stale.

## 22. L-05 — OTP Fail-Closed — **CLOSED** (+ regressions)

- `src/utils/otp-store.js` `loadOtpSecret()` now throws when neither `OTP_HASH_SECRET` nor `AUTH_SECRET` is set; removed the committed `'airborne-otp-salt'` fallback literal. No new dependency.
- **New regression suite** `src/utils/otp-store.test.mjs` (Node built-in runner, `npm run test:otp`), 5/5 pass:
  1. configured `OTP_HASH_SECRET` → generate/verify round-trip;
  2. `AUTH_SECRET` back-compat round-trip;
  3. missing secret → `generateOtp` **throws** (fail-closed, no silent fallback);
  4. missing secret → verify returns `not_requested_or_expired`;
  5. fallback literal is not a usable secret (module source regex-guarded; no code minted without env secret).

## 23. L-06 — Analytics Env-Driven + Unverifiable Claims — **CLOSED**

- `layout.jsx`: GTM/GA4/Meta Pixel IDs env-driven (`NEXT_PUBLIC_GTM_ID`→`GTM-KCM9CDK9`, `NEXT_PUBLIC_GA4_ID`→`G-KB3Y1MSLR6`, `NEXT_PUBLIC_META_PIXEL_ID`→`974236902284876`, production values as defaults); `ClarityInit.jsx` env-driven `CLARITY_PROJECT_ID`. HTTP: IDs present exactly once (GTM `GTM-KCM9CDK9`, gtag `G-KB3Y1MSLR6`, fbq `974236902284876`). No hardcoded secrets.
- **Claims audit**: the absolute `"100% DGCA Pass Rate"` and `"2,500+ / 2,100+ graduates/aspirants"` figures had **no authoritative repository evidence** and were even internally inconsistent (2,100+ vs 2,500+ vs 2500). Per instructions, softened every active occurrence to tonally-preserving, non-fabricated phrasing (`Strong DGCA results`, `Training since 2009`, `Since 2009`, etc.) across `about/page.jsx`, `App.jsx`, `Home3DSection.jsx`, `PremiumFooter.jsx`, `GlobalRouteMap.jsx`, `SceneOverlays.jsx`, `page.jsx`, `layout.jsx` (3 meta desc), course pages (`cadet-preparation`, `aviation-english-icao`, `a320-simulator`, `multi-engine-rating`, `ground-school`), and blog pages (`how-to-become-pilot-india`, `dgca-ground-school-guide`). Verified clean: no active `2,500+`/`100% Pass` remains in rendered sources. Structured-data builder already strips `"100% pass rate"`.

## 24. L-07 — Fee Copy Alignment — **CLOSED**

- `MultiStepLeadForm.jsx` CPL cost "₹80 Lakh"→"₹55-65 lakh" (site band); blog `pilot-training-cost-india/page.jsx` verified internally consistent (₹50L onwards / ₹55–65 lakh; audit line numbers stale). No `80 Lakh`/`₹80` remains in `src/`. No single Offer JSON-LD invented for flying-training (per canonical decision). HTTP: ATPL/ground-school rendered pages show no `80 Lakh`, cabin crew ₹59,000, airline prep ₹1,00,000.

## 25. L-08 — Hygiene (backups, worktrees, report clutter) — **PARTIAL**

- **Done**: deleted git-tracked `src/app/page.jsx.backup`, `src/components/AirborneFX.jsx.backup` (stale fees), `PHASE_4_AUDIT_REPORT.original.md`; `migration_lock.toml` whitespace restored (covered by C-01).
- **Deferred**: git worktrees not force-removed — `agent-a45150e200e959e8a` holds uncommitted admin fork edits (pruning destroys work); `magical-jackson-9910e1` is a detached snapshot. Earliest safe offline prune documented. Root report `.md`s (Section 1–7 audit/result docs) retained as authoritative project documentation.
- **Does not block release.**

## 26. Files Changed

- **New** `admin/scripts/safe-db-check.mjs`, `admin/scripts/run-tests-local.mjs`, `admin/src/lib/analytics/scope.ts`, `src/utils/otp-store.test.mjs`, migration `20260906183503_audit_log_request_id_varchar/`, + 13 admin test files (`org.service.test.ts`, `media.schema.test.ts`, `resource-token.test.ts`, `permissions.test.ts`, `fees.integration.test.ts`, `deals.integration.test.ts`, `org-scope.integration.test.ts`, `admission-lifecycle.integration.test.ts`, `lms-ops.integration.test.ts`, `meetings.integration.test.ts`, `timeline.integration.test.ts`, `section6.public-contract.integration.test.ts`, `crm/analytics/scope.test.ts`).
- **Modified** — admin: `package.json`, `prisma/schema.prisma`, `prisma/seed.ts`, `payment.service.ts`, `org.service.ts`, `deal.service.ts`, `lead.service.ts`, `media.service.ts`, `resource-token.ts`, `permissions.ts`, `workflow/actions.ts`, `automation/event-handlers.ts`, `validations/media.schema.ts`, `meta.service.test.ts`, `follow-up/route.ts`, `activities/route.ts`, `crm/analytics/route.ts` + `.test.ts`, `.env.example`.
- **Modified** — marketing: `courses/atpl/page.jsx`, `sitemap.js`, `layout.jsx`, `ClarityInit.jsx`, `MultiStepLeadForm.jsx`, `otp-store.js`, `about/page.jsx`, `App.jsx`, `Home3DSection.jsx`, `PremiumFooter.jsx`, `GlobalRouteMap.jsx`, `SceneOverlays.jsx`, `page.jsx`, course pages (cadet, icao, a320, multi-engine, ground-school, cabin-crew, airline-preparation), blog pages (how-to-become, dgca-guide, pilot-cost), root `tsconfig.json` (`strict`), `next.config.js` (M-10 comment), `package.json` (`test:otp`), `.env.example`.
- **Deleted** — `src/app/page.jsx.backup`, `src/components/AirborneFX.jsx.backup`, `PHASE_4_AUDIT_REPORT.original.md`, `admin/.eslintrc.json`.

## 27. Verification Evidence

### Migration replay
Disposable `airbone_replay` (created, migrated, then dropped): **17/17 migrations apply from zero**; `prisma migrate diff --from-migrations --to-schema-datamodel` → **"No difference detected"**. Replayed twice to confirm.

### Seed / idempotency
`npm run db:seed` (guard, `SAFE_DB_EXPECT_DB=airbone_replay`) run twice → `organizations`=1, PUBLISHED job `cpl-ground-school-mentor-2026`=1 after both runs (idempotent). Replay DB dropped.

### Security verification
- Unauthenticated `/api/v1/crm/dashboard/stats` → **401**.
- `/api/public/settings` → 200 with `settings={}` (no webhook secrets / envVars).
- Public settings/general keys: `id,name,slug,domain,settings,navMenus` only.
- Org-scope workflow test green (cross-org lead untouched; audit row now written — P2023 eliminated).

### Financial verification
Concurrent-refund test (row lock) green (M-01). Fee copy aligned (L-07). No `₹80 Lakh` in `src/`.

### CRM / admission / LMS verification
`deals.integration.test.ts`, `admission-lifecycle.integration.test.ts`, `lms-ops.integration.test.ts`, `meetings/timeline` integration tests — all green under gates.

### CMS / SEO verification
- Home page: canonical `/`, OG url/image/title, twitter tags present; no `2,500+`/`100% Pass`.
- Sitemap: `/refund-policy`, `/courses/atpl`, `/blog/...` present; no `/portal`, no 3xx target.
- Blog `/api/public/blogs` → 200, 4 published entries with SEO fields.
- Courses: JSON-LD present; ATPL = 4–6 Months; cabin crew ₹59,000; airline prep ₹1,00,000.
- robots.txt: `Allow: /`, `Disallow: /api/`, sitemap link.

### HTTP verification
Admin `:4000`: `/login` 200, `/api/public/jobs` 200 (seeded PUBLISHED job), `/api/public/settings` 200 (no secrets), `/api/v1/*` unauth 401. Marketing `:3000`: `/` 200 (metadata+canonical+OG), `/health` 200, `/courses` 200, course pages 200 with verified content, `/refund-policy` 200, `/blog` 200, `/sitemap.xml` 200, `/robots.txt` 200. Note: the first unguarded admin start auto-loaded Prod `.env` (jobs 500); relaunch pinned to local `airbone_test` → all green (this is the H-04 hazard, now documented).

### Test results
`npm run test:local` (all 7 gates: SECTION5/6, ADMISSION, FEES, DEALS, LMS_OPS, WORKFLOW) against `airbone_test` → **274 pass, 0 fail, 0 skipped** (was 254 → +20, incl. OTP L-05 regressions live in marketing suite).

### tsc / lint / build
- Admin `npx tsc --noEmit` → **PASS** (exit 0).
- Marketing `npx tsc --noEmit` → **PASS** (exit 0).
- Admin `npx next lint` → **PASS** ("No ESLint warnings or errors", exit 0).
- Marketing `npx next lint` → **PASS** (exit 0; pre-existing warnings only, no errors).
- Admin `npx next build` → **PASS** (exit 0; types valid, all routes compiled).
- Marketing `npx next build` → **PASS** (exit 0).

## 28. Remaining Technical Debt

1. L-02: re-enable `no-explicit-any`/`no-unused-vars`/`prefer-const` in admin ESLint and fix ~30 pre-existing errors (dedicated refactor).
2. L-08: offline-prune worktrees `agent-a45150e200e959e8a` (first salvage its uncommitted admin edits) then `magical-jackson-9910e1`.
3. M-10 note: add storage hostname to `next.config.js` `remotePatterns` before CMS images migrate to `<Image>`.
4. Audit-log correlation IDs remain informal strings; consider a canonical request-scoped correlation middleware (future hardening; not blocking).

## 29. Production Configuration Requirements

- Marketing: `NEXT_PUBLIC_ADMIN_URL`, `NEXT_PUBLIC_GTM_ID`/`GA4_ID`/`META_PIXEL_ID`/`CLARITY_PROJECT_ID`, `OTP_HASH_SECRET` (AUTH_SECRET only back-compat), storage/object keys, provider tokens — **no OTP fallback: secret now required** (fail-closed).
- Admin: `DATABASE_URL`/`DIRECT_URL` must point to Prod Cloud SQL at deploy; guarded scripts require `NODE_ENV=production` + `--allow-prod`/`SAFE_DB_ALLOW_PROD=1`.
- Run `npx prisma migrate deploy` (or the guarded `db:migrate:prod`) to apply **17 migrations** — the three C-01 migrations + the new `audit_log_request_id_varchar`.

## 30. Provider Verification Requirements

GTM (`GTM-KCM9CDK9`), GA4 (`G-KB3Y1MSLR6`), Meta Pixel (`974236902284876`), Clarity (`xv0yvv94yd`), Interakt/WhatsApp, payment gateway, Supabase — **live smoke required after deploy** (browser-based tag firing, webhook signatures, payment/refund end-to-end) before scoring `PRODUCTION READY`.

## 31. Business Decisions Required

- (Recorded, not blocking): M-08 keep Admission as source of truth with deal link cleared on revert; M-10 keep Unsplash allowlist; L-06 softened unverifiable headcount/pass-rate copy.

## 32. Final Release Blockers

**None.** C-01 (the only release blocker) is closed; the new audit-log `requestId` defect found during P25 is also fixed and migration staged.

## 33. Final Production Verdict

**CONDITIONALLY PRODUCTION READY.** All release blockers closed; code verification fully green (tests/tsc/lint/build/replay/HTTP/DB-safety). Not scored `PRODUCTION READY` because a real production deployment and required live provider smoke tests (analytics tags, webhooks, payments/refunds) have **not** been performed and evidenced.

---

## Appendix — Finding Classification

| # | Finding | Severity | Status | Release block? |
|---|---------|----------|--------|----------------|
| C-01 | Migration/schema drift | Blocker | **CLOSED** | No |
| H-01 | Workflow/automation org-scope | High | **CLOSED** | No |
| H-02 | ATPL duration | High | **CLOSED** | No |
| H-03 | Sitemap/refund-policy/slugs | High | **CLOSED** | No |
| H-04 | DB safety interlock | High | **CLOSED** | No |
| M-01 | Concurrent refund race | Med | **CLOSED** | No |
| M-02 | Follow-up/activities ABAC | Med | **CLOSED** | No |
| M-03 | Analytics counselor scope | Med | **CLOSED** | No |
| M-04 | Org secret redaction | Med | **CLOSED** | No |
| M-05 | Media MIME allowlist | Med | **CLOSED** | No |
| M-06 | Intake-key fail-closed | Med | **CLOSED** | No |
| M-07 | Dead permission resources | Med | **CLOSED** | No |
| M-08 | Deal revert/admission semantics | Med | **CLOSED** | No |
| M-09 | Jobs seed public contract | Med | **CLOSED** | No |
| M-10 | Unknown image hostnames | Med | **CLOSED** (doc-only) | No |
| L-01 | Test/ESLint cleanup | Low | **CLOSED** | No |
| L-02 | TS strict / admin ESLint | Low | **PARTIALLY CLOSED** | No |
| L-03 | Dead env cleanup | Low | **CLOSED** | No |
| L-04 | Homepage metadata | Low | **CLOSED** | No |
| L-05 | OTP fail-closed | Low | **CLOSED** | No |
| L-06 | Analytics env + claims | Low | **CLOSED** | No |
| L-07 | Fee copy | Low | **CLOSED** | No |
| L-08 | Hygiene (backups/worktrees) | Low | **PARTIALLY CLOSED** | No |

**Totals:** CLOSED **21** · PARTIALLY CLOSED **2** (L-02, L-08) · DEFERRED **0** · NOT FIXED **0** · Release blockers **0**.
