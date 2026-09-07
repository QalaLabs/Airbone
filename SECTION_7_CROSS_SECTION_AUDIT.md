# SECTION 7 — FULL CROSS-SECTION PRODUCTION AUDIT

> Audit of the complete Airborne system after Sections 1–6 (admin app, marketing site, database layer, automation, security, SEO). **Audit-first: no code, DB, env, or config was modified during this audit.** Verification DB was always the disposable Docker PostgreSQL at `localhost:5433/airbone_test`; the production Cloud SQL instance was never touched.

---

## 1. Purpose

Produce a single source of truth on production readiness of the entire Airborne codebase after the Section 1–6 fixes, covering cross-section concerns: security/RBAC, multi-tenant isolation, financial-core correctness, CRM/deals lifecycle, automation safety, marketing data integrity, SEO/structured data, schema/migration reproducibility, secrets & environment safety, tests, and deployment hygiene.

## 2. Scope

- **Admin app** — `admin/` (Next.js 15 App Router, NextAuth v5 beta, Prisma/Postgres). ~140 API routes, 33 Prisma models, 16 migrations.
- **Marketing site** — `src/` (Next.js 15 App Router, React 19 full-SPA pages, App pages, CMS public-proxy routes).
- **Database** — `admin/prisma/schema.prisma` + `admin/prisma/migrations/`.
- **Docs/CI/tooling** — README, `SECTION_*.md`, package scripts, eslint/tsconfig, git state.
- **Out of scope** — third-party provider accounts (Meta, Google Ads, Interakt, Resend, WhatsApp), Vercel/Cloud Run console config, and live production data.

## 3. Verification Principles & Compliance

1. **Read-only audit.** No source files modified; no commits created; no push/deploy.
2. **Production DB never touched.** Every DB-touching command was run with `DATABASE_URL`/`DIRECT_URL` explicitly inline-pinned to `postgresql://postgres:postgres@localhost:5433/airbone_test?schema=public` and asserted to contain `localhost:5433` before execution. The documented hazard (`admin/.env` auto-loading production Cloud SQL) was never exercised.
3. No "silent fixes." Findings are recorded with evidence, impact, reproduction, and recommended fix. No remediation was applied.
4. Admin production build (`npm run build` in `admin/`, which runs `prisma migrate deploy`) was deliberately **not** executed; admin compile quality was verified via `tsc`, the 254-test suite, and a live dev server against the Docker DB.

## 4. Environment & Baseline

- OS: Windows 11, PowerShell 5.1. Node v24.15.0. Docker running.
- Verification DB: Docker container `airbone-fees-test` (postgres:16-alpine, `0.0.0.0:5433→5432`), DB `airbone_test`.
- `admin/.env` (inspection only) points `DATABASE_URL`/`DIRECT_URL`/`CLOUD_SQL_DATABASE_URL` at **production Cloud SQL** `34.93.180.179:5432/airbornedb` (user `airborne_app_user`). `admin/.env.local` targets Supabase pooler `postgres.lzbnnlpgxlzlkfirkkdz`.
- Git state: the Section 1–6 change-set is **entirely uncommitted** (157 entries in `git status --porcelain`). Three migrations are untracked (see C-01).
- No CI (`.github/workflows` absent). Deployment is manual via Vercel (marketing) and Cloud Run (admin).

## 5. Methodology & Verification Checks Performed

| # | Check | Result |
|---|-------|--------|
| 01 | Route inventory — all `route.ts` under `admin/src/app/api` enumerated | Done (public/v1/webhooks/cron) |
| 02 | Static-permission matrix vs every guard call (resource/action validity, dead resources) | Dead resources found (M-07) |
| 03 | Middleware auth coverage & public-path allow-list | Verified (V-02) |
| 04 | Error mapping: P2023/non-UUID → 400 | Verified (V-01) |
| 05 | Payment tx + row lock + idempotency uniques + receipt sequence | Verified (V-04) |
| 06 | `feeFinal == feePaid + feeBalance` single-authority reconcile | Verified (V-04) |
| 07 | Deal/lead concurrency guards (`@@unique`), conversion race | Verified (V-05) |
| 08 | Org-scoping (IDOR) audit across repositories and routes | Verified (V-03) + findings H-01, M-02, M-03, M-04 |
| 09 | Refund concurrency (row-lock discipline) | **FINDING M-01** |
| 10 | Webhook/cron signature verification (constant-time, malformed input) | Verified (V-02) |
| 11 | Public route PII & gating (allow-lists, PUBLISHED filters, download tokens) | Verified (V-06) |
| 12 | BigInt serialization safety | Verified (V-10) |
| 13 | Media presign MIME/size allow-listing | **FINDING M-05** |
| 14 | Marketing CMS consumption vs hardcoded business data sweep (Audit-19) | Verified (V-09) + H-02, L-07 |
| 15 | Caching/ISR posture of the public site | Verified (V-08) |
| 16 | Sitemap/robots/canonical/JSON-LD consistency | **FINDINGS H-03, H-02, L-04** |
| 17 | Schema vs migrations reproducibility (fresh-clone replay, drift) | **FINDING C-01** |
| 18 | Env inventory: used vs declared, secrets on disk, prod pointers | **FINDING H-04, L-03** |
| 19 | Dead code / artifacts / worktrees / `.backup` files | **FINDING L-08** |
| 20 | Gated full test suite vs Docker DB (all 6 flags) | **254/254 pass** (V-07) |
| 21 | `tsc` (admin strict + root), `next build` (root) | Clean |
| 22 | Lint (root, admin) | Root warnings-only; **admin FAILS** (L-01) |
| 23 | HTTP round-trip: admin :4000 + marketing :3000 vs Docker DB (public contract, 401s, redirects, lead intake) | Green (V-08) + findings |
| 24 | Repo untouched after audit (git status, no `_tmp*`, no prod writes) | Verified |

## 6. Executive Summary

The Section 1–6 hardening holds up under independent verification: error-mapping, middleware auth, webhook/cron signatures, org-scoped repositories, transactional payments with idempotency, reconciled fee invariants, race-safe deal conversion, allow-listed public settings, and the public marketing contract all check out — 254/254 tests, clean typecheck, clean marketing build, and live HTTP contracts verified against the Docker DB.

However, this audit reports **1 CRITICAL, 4 HIGH, 10 MEDIUM, 8 LOW** findings. The critical item is **release-blocking**: the schema edits shipped during Sections 5–6 (Deal model, `FeePlanItem.percentOfFee`, `Admission.courseId/batchId`, new LeadStatus/trigger enums) exist **only in uncommitted migrations** — a fresh clone or CI cannot rebuild the database, and `prisma migrate deploy` outcomes depend entirely on the local working tree. The high items are dominated by (a) the auto-loaded production `admin/.env` that makes any unpinned local DB command target Cloud SQL (the exact class of incident documented in Section 2 §6), (b) automation lead mutations that are defense-in-depth missing org scoping, and (c) two real marketing/SEO data-integrity defects (ATPL duration three-way mismatch; sitemap emitting redirect/alias URLs and omitting `/refund-policy`).

**Overall: CONDITIONALLY PRODUCTION READY** — the running system is functional and the buyer-facing contract is correct, but production release must clear the C-01 blocker, the H-02/H-03 content defects, the H-04 env hardening, and the money-path M-01 concurrency gap.

## 7. Overall Assessment & Production Verdict

| | |
|---|---|
| **Overall** | **CONDITIONAL** |
| **Production verdict** | **CONDITIONALLY PRODUCTION READY** |
| Rationale | No runtime CRITICAL in the deployed application surface; the Section 1–6 invariants verified. BUT the untracked-migrations blocker breaks reproducible deployment, and release blockers (H-02, H-03, H-04, M-01) must be closed first. |

## 8. Severity Distribution

| Severity | Count | IDs |
|----------|-------|-----|
| CRITICAL | 1 | C-01 |
| HIGH | 4 | H-01, H-02, H-03, H-04 |
| MEDIUM | 10 | M-01 … M-10 |
| LOW | 8 | L-01 … L-08 |
| INFO / VERIFIED | 10 | V-01 … V-10 |

## 9. API Surface Inventory

- **Public (unauthenticated):** `api/public/courses`, `blogs`, `testimonials`, `jobs`, `pages`, `settings`, `resource-download`, `lead-intake` (via `leads`), `v1/public/lms/certificates`, `api/auth/*`.
- **v1 (session-authenticated, RBAC per route):** admissions, audit, auth, blocks, courses(+publish/versions/rollback), crm (analytics/deals/integrations/meetings/outreach), dashboard/stats, deals(+assign/convert/revert), documents, fee-plans, hiring-partners, job-applications(+status), jobs(+publish), leads(+bulk-assign/activities/assign/convert/follow-up/interakt), lms (*), media, nav, notifications, organizations(+campuses), pages(+layout/publish/sections/versions), payments(+refunds), placements, resources(+download/publish), students(+admissions), testimonials(+review), timeline, users(+invite/me), webhooks/google-ads, whatsapp (*), workflows(+runs).
- **External/webhook:** `api/webhooks/{facebook,google-ads,whatsapp}` (self-authenticated; excluded from middleware — raw body preserved for HMAC).
- **Cron:** `api/cron/automation` (CRON_SECRET-authenticated; middleware-excluded).
- **Middleware matrix:** public allow-list includes `/api/webhooks`, `/api/cron/automation`, `/api/auth`, `/api/v1/auth`, invite-accept, `/api/v1/public/*`, `/api/public/*`. `/dev` is blocked when `NODE_ENV=production`.

## 10. Data Layer & DB Safety Posture

- Prisma client is the only ORM; repositories universally scope `where: { id, orgId }` for org-owned records (V-03).
- `onDelete: Cascade` on org→child relations; payment→admission is `Restrict` (protects against deleting admissions with payments).
- **Safety posture:** every DB command in this audit ran with the inline-pinned `localhost:5433` URL and a pre-flight assertion. No production database connection or write occurred. The residual risk is operational (H-04): a plain `node/npx/npm` invocation from `admin/` loads `admin/.env` (production) by default — e.g. `npm run db:reset`, an env-gated test without override, or `npm run build` would target Cloud SQL.

## 11. Tests & Tooling Results

- Admin test suite (Node built-in runner + `tsx`), all gates on → **254/254 pass, 0 fail** (duration ~5.4 s) against `localhost:5433/airbone_test`. Gates: `SECTION5_INTEGRATION`, `SECTION6_INTEGRATION`, `FEES_INTEGRATION`, `DEALS_INTEGRATION`, `ADMISSION_INTEGRATION`, `LMS_OPS_INTEGRATION`.
- `admin: tsc --noEmit` → clean (`strict: true`, `noUncheckedIndexedAccess`).
- Root (marketing): `tsc --noEmit` → clean; `next build` → clean (all routes compiled; sitemap/robots static).
- Lint: root = warnings only (pre-existing react-hooks/refresh); **admin = FAILS** with 1 error: `meta.service.test.ts:170` `@typescript-eslint/no-require-imports` (`require("node:crypto")`).
- Marketing app has **zero tests** and no test script (all 29 `*.test.ts` files live under `admin/src`).

## 12. HTTP Round-Trip Results (admin :4000 + marketing :3000 vs Docker DB)

- `GET /api/public/courses` → 200, **8 PUBLISHED courses**, canonical fees: cpl-ground-classes 270000, atpl 150000, cadet-preparation 50000, a320-simulator 10000, cas-compass-adapt 30000, airline-preparation 100000, flying-training 5500000, cabin-crew 59000.
- `GET /api/public/blogs` → 200, **4 Resources** with populated `seoTitle`/`seoDesc`.
- `GET /api/public/testimonials` → 200, 3 APPROVED featured.
- `GET /api/public/settings` → 200, allow-listed `{}` projection.
- `GET /api/public/jobs` → 200 but **0 rows** (jobs table empty in the Docker DB — see M-09).
- Unauthenticated `/api/v1/**` (incl. non-UUID id) → **401** (middleware). P2023 never reaches the DB layer unauthenticated.
- Marketing public-proxy: courses 8, blogs 4, testimonials 3 — canonical values relayed.
- `/courses/airline-preparation` → price text `₹1,00,000` + JSON-LD `offers.price 100000` ✓.
- `/courses/cabin-crew-training` → `₹59,000` + JSON-LD `59000` ✓.
- `/courses/atpl` → JSON-LD `timeRequired: "P2M"` (bug, H-02).
- Sitemap → blog slugs present; `/contact` present; `/refund-policy` and `/portal` absent; **3 URLs are 308 redirects** (H-03).
- Lead intake `POST /api/lead` with wrong `x-intake-key` → 400 (constant-time compare; no info leak).
- `/dev/auto-login` → 200 in dev (NODE_ENV=development); production middleware returns 404 for `/dev*`.

---

## 13. Findings: CRITICAL

### C-01 — Schema/Migrations drift: 3 migrations + schema.prisma are untracked/uncommitted (release-blocking)
- **Severity:** CRITICAL | **Module:** schema / migrations | **Blocks production:** YES
- **Evidence:** `git status --porcelain admin/prisma/migrations` → `?? 20260905000000_fees_payments_integrity/`, `?? 20260905151336_admission_batch_course_link/`, `?? 20260906000000_crm_pipeline_deals/`; `M admin/prisma/schema.prisma`, `M admin/prisma/seed.ts`, `M admin/prisma/seed_courses.ts`. Only migrations up through `20260902000000_interakt_lead_sync` are committed. The `Deal` model, `FeePlanItem.percentOfFee`, `Admission.courseId/batchId`, `LeadStatus.NOT_INTERESTED/REASON_NOT_SHARED`, and `WorkflowTrigger.DEAL_*` exist only in the 3 untracked migrations.
- **Root cause:** Sections 5–6 schema work was never committed; migration files were generated locally.
- **Impact:** A fresh clone/CI cannot replay to the current `schema.prisma`; `prisma migrate deploy` behavior depends on whatever happens to be in the local working tree; DB state and code state are not reproducible from the repository. `migration_lock.toml` is also tracked-but-modified (whitespace/comment only).
- **Reproduction:** `git clean -nd admin/prisma/migrations` lists the 3 folders as removable; `git ls-files admin/prisma/migrations` stops at `20260902000000_interakt_lead_sync`.
- **Recommended fix:** Commit the 3 migrations, `schema.prisma`, seeds, and (as a separate reviewable unit) the Sections 1–6 change-set; verify a fresh-clone replay via `prisma migrate deploy` against a scratch DB; then confirm production migration state matches the committed set.

## 14. Findings: HIGH

### H-01 — Automation lead mutations lack `orgId` in `where` (defense-in-depth IDOR gap)
- **Severity:** HIGH | **Module:** workflows / events | **Blocks:** NO
- **Evidence:** `admin/src/lib/workflow/actions.ts:175` (ASSIGN_LEAD), `:202` (UPDATE_STATUS), `:243` (ADD/REMOVE_TAG), `:265` (UPDATE_LEAD) — `prisma.lead.update({ where: { id: leadId }, ... })` with no orgId; `admin/src/lib/automation/event-handlers.ts:18` (`lead.findUnique({where:{id}})`), `:32` (`lead.update({where:{id}})` — score write), `:53-54` (user/lead findUnique).
- **Root cause:** the IDs originate from org-scoped snapshots, so the writers relied on trustworthy input and skipped an org predicate.
- **Impact:** A compromised operator with `workflows: write` (or a tampered workflow definition) who knows a foreign lead UUID could mutate another org's leads; score writes share the same gap. Currently mitigated by data flow (org-scoped snapshots), not by the query.
- **Reproduction:** Craft a workflow step whose `entityId`/`leadId` is a foreign org lead UUID and trigger the run; the update executes.
- **Recommended fix:** Scope every mutation and read with `orgId: ctx.orgId` (mirror the existing repositories), and assert the lead belongs to the run's org before writing.

### H-02 — ATPL duration: three-way mismatch (page hardcode overrides the canonical registry)
- **Severity:** HIGH | **Module:** marketing / SEO structured data | **Blocks:** YES (data-integrity for the flagship course)
- **Evidence:** `src/app/courses/atpl/page.jsx:31` `duration: 'P2M'` overrides `COURSE_SCHEMA.atpl`; `courseRegistry.js:96` canonical `duration: 'P4M'`; page copy `:47` ("2–3 months"), `:96` badge ("2–3 Months"), `:102` ("Duration: 2–3 months"); Docker DB `GET /api/public/courses → atpl duration "4–6 Months"`. Rendered HTML confirms JSON-LD `"timeRequired":"P2M"`.
- **Root cause:** Section 6 Phase 8 updated the registry (`P2M→P4M`) but missed the per-page graph override and the page prose.
- **Impact:** Structured data, page copy, and the DB disagree; search engines/LLMs surface conflicting duration, degrading rich results and trust on the site's highest-value course.
- **Reproduction:** `curl /courses/atpl | grep timeRequired` shows `P2M`; registry says `P4M`; DB says `4–6 Months`.
- **Recommended fix:** Remove the hardcoded `P2M` override (let `buildCoursePageGraph` inherit registry `P4M`) and align prose ("4–6 months", or elif the marketing intent is 4 months).

### H-03 — Sitemap correctness: redirect URLs, alias/duplicate course URLs, and a missing legal page
- **Severity:** HIGH | **Module:** marketing / SEO sitemap | **Blocks:** YES (SEO hygiene on launch)
- **Evidence:** `src/app/sitemap.js:32-35` staticRoutes omit `/refund-policy` (route exists and is linked in the footer). The sitemap now also emits DB-derived course slugs alongside static folder routes, producing three live **308 redirect** URLs: `/courses/cabin-crew → /courses/cabin-crew-training`, `/courses/flying-training → /courses/flying-training-india-abroad`, `/courses/cpl-ground-classes → /courses/commercial-pilot-license-cpl` (verified over HTTP). No finishing route for `commercial-pilot-license-cpl`/`cabin-crew-training` duplicates.
- **Root cause:** Section 6 Phase 9 added DB-fed blog URLs but the course half of the sitemap mixes `STATIC_COURSE_SLUGS` (route folders) with DB slugs (`/api/public/courses`), and `/refund-policy` was never added.
- **Impact:** 3 sitemap URLs are perma-redirects (wasted crawl budget, split canonical signaling); two URL schemes coexist for the same courses; a legal/compliance page is uncrawled.
- **Reproduction:** `curl /sitemap.xml` contains the 3 redirect URLs and lacks `/refund-policy`; `curl -I /courses/cabin-crew` returns `308`.
- **Recommended fix:** Emit only canonical static course routes (report DB slug→route mapping via the [slug]→static redirect table), add `/refund-policy`, keep blog URLs DB-fed.

### H-04 — Production-Credential `admin/.env` auto-loads Cloud SQL on every unpinned local command; gated tests are not wired to the Docker DB
- **Severity:** HIGH | **Module:** ops / secrets | **Blocks:** YES
- **Evidence:** `admin/.env` (git-ignored, but auto-loaded by Prisma CLI, `tsx`, and Next) carries `DATABASE_URL`/`DIRECT_URL`/`CLOUD_SQL_DATABASE_URL` → production host `34.93.180.179:5432/airbornedb` with embedded password, plus `AUTH_SECRET="airborne-dev-secret-change-in-production-32chars"`, `PROD_AUTH_SECRET`, `PROD_OTP_HASH_SECRET`; `admin/.env.local` holds Supabase pooler creds + `SUPABASE_SERVICE_ROLE_KEY`. `admin/package.json` test/build scripts run without the `localhost:5433` override documented in the integration-test headers; the Docker DB is documented but not wired (no compose, no `npm test` shortcut). This is the exact hazard class of the Section 2 §6 incident (`.env` precedence directing `prisma migrate deploy` at a hosted DB).
- **Root cause:** dev convenience (`admin/.env`) with production values, plus no safety interlock for CLI/script DB commands.
- **Impact:** One un-pinned `npm test` with a gate flag, `npm run db:migrate`, `npm run db:reset`, or `npm run build` from `admin/` executes against **production** Cloud SQL; the known dev `AUTH_SECRET` would be used for JWT signing unless overridden at deploy.
- **Reproduction:** `Get-Content admin/.env` (values redacted) confirms 34.93.180.179 and the known dev AUTH_SECRET; `Get-ChildItem` confirms zero docker-compose files.
- **Recommended fix:** (a) make env-gated tests self-pinning (script or `readConfigFile` default to `localhost:5433`), (b) require `DATABASE_URL`/`DIRECT_URL` to be exported or refuse to run a `prisma migrate deploy`/reset script launched from a terminal whose effective URL is not local (guard in package scripts), (c) remove the dev AUTH_SECRET from `admin/.env` (inject at deploy; verify Cloud Run Secret Manager / Vercel env), (d) rotate the production DB password + service-role key that now live on this machine.

## 15. Findings: MEDIUM

### M-01 — Refund path: read-modify-write without a row lock (concurrent refund lost-update)
- **Severity:** MEDIUM | **Module:** payments | **Blocks:** YES
- **Evidence:** `admin/src/lib/services/payment.service.ts:243` reads `existing` via `getById` (unlocked, outside the transaction); `:263-273` computes cumulative `refundedAmount` from that read and unconditionally applies it inside the transaction with **no `SELECT ... FOR UPDATE`** (contrast with the payment-create path which locks the admission row, `:71-73`).
- **Impact:** Two concurrent refunds on the same payment can both read the original `refundedSoFar` and overwrite each other's cumulative total — one refund is lost from the stored trail (admission reconcile updates feeBalance to the surviving final value). A money-path concurrency defect.
- **Reproduction:** Fire two refund requests concurrently against the same payment (integration harness); the final `refundedAmount` reflects only the last writer's input.
- **Recommended fix:** Lock the payment row (or admission, in the same transaction) `FOR UPDATE` before computing the cumulative refunded amount; re-check `REFUNDED`/remaining after the lock.

### M-02 — Counselor ABAC gap on lead follow-up and activities routes
- **Severity:** MEDIUM | **Module:** RBAC / leads | **Blocks:** NO
- **Evidence:** `admin/src/app/api/v1/leads/[id]/follow-up/route.ts:14` uses `guard(ctx.user,"write","leads")` only (no `guardRecord`/`getCounselorCondition`); `admin/src/app/api/v1/leads/[id]/activities/route.ts:14` (GET) and `:33` (POST) same. Sibling routes enforce ABAC: `leads/[id]/route.ts:18-19,37-38,54-55`, `deals/[id]/assign`, `crm/meetings/[id]`.
- **Impact:** An `ADMISSIONS_COUNSELOR` can set follow-up dates, add/list activity on another counselor's leads — inconsistent with the org's stated own-records-only posture.
- **Recommended fix:** Apply `getCounselorCondition`/`guardRecord` on these routes (and inside `LeadService.updateFollowUp`/`createActivity`).

### M-03 — Counselor over-exposure in CRM analytics (org-wide aggregates)
- **Severity:** MEDIUM | **Module:** RBAC / analytics | **Blocks:** NO
- **Evidence:** `admin/src/app/api/v1/crm/analytics/route.ts:50-53` scopes only the lead pipeline to `assignedTo`; admissions count (`:85`), revenue `_sum` (`:91,96`), activity breakdown (`:101`), counselor rosters/names (`:110`), student totals (`:114`) are org-wide for every `analytics: read` holder.
- **Impact:** A counselor can infer org-wide admissions volume, revenue, and per-counselor performance.
- **Recommended fix:** Scope non-lead analytics to the counselor's own records when role is `ADMISSIONS_COUNSELOR`.

### M-04 — Google Ads webhook secret readable via the organizations API
- **Severity:** MEDIUM | **Module:** secrets / org API | **Blocks:** NO
- **Evidence:** `admin/src/lib/webhooks/google-ads/route.ts:58-64` persists `googleAdsWebhookSecret` into `organization.settings`; `admin/src/lib/services/org.service.ts:14-16` `sanitizeOrgSettings` deletes only `envVars`; `admin/src/app/api/v1/organizations/route.ts` GET (guard `read organizations`) returns the full settings blob to any ADMIN/SUPER_ADMIN.
- **Impact:** A webhook authenticator is readable through a generic settings endpoint (authenticated only). Not attacker-exploitable without admin access, but a stored credential should not be echoed.
- **Recommended fix:** Strip webhook/provider secret keys in `sanitizeOrgSettings` (write-only keys), covering `googleAdsWebhookSecret` and Interakt/WhatsApp secrets.

### M-05 — Media presign/register accept arbitrary content types (no MIME allowlist)
- **Severity:** MEDIUM | **Module:** media | **Blocks:** NO
- **Evidence:** `admin/src/lib/validations/media.schema.ts:85-89` `presignMediaSchema.contentType` is `z.string().min(1).max(100)`; `registerAssetSchema`/`replaceAssetSchema` `mimeType` likewise free-form (`:52,77`); `media.service.ts:65-73` `getPresignedUrl` forwards any `contentType` to the signed upload (no `isAllowedMediaType`/size check, unlike `upload()` at `:77-88`).
- **Impact:** An authenticated `media: write` user can upload `text/html`/SVG payloads into the public `media/{orgId}/` bucket keyed by the presign URL — stored-XSS vector if such assets are rendered on the public site.
- **Recommended fix:** Apply the same allowlist + size cap used by `upload()` at presign/register time.

### M-06 — Resource-token fallback secret literal + guessable default intake key
- **Severity:** MEDIUM | **Module:** public gating | **Blocks:** NO
- **Evidence:** `admin/src/lib/utils/resource-token.ts:6` `process.env.PUBLIC_INTAKE_KEY ?? "dev-fallback-secret"`; `admin/.env` currently sets `PUBLIC_INTAKE_KEY=airborne-pub-intake-2026` (guessable scheme) which also gates `POST /api/public/leads` and public GET endpoints.
- **Impact:** If `PUBLIC_INTAKE_KEY` is ever unset in an env that bypasses `env.ts` validation, gated resource tokens are forgeable with the public literal; the current default is low-entropy.
- **Recommended fix:** Make the intake key required in `env.ts` (no fallback) and rotate to a high-entropy value.

### M-07 — Dead permission resources + role gaps in the static matrix
- **Severity:** MEDIUM | **Module:** RBAC | **Blocks:** NO
- **Evidence:** `admin/src/lib/utils/permissions.ts` grants `seo` (ADMIN/MARKETING/CONTENT), `cms` (CONTENT_MANAGER), `enquiries` (ADMISSIONS_COUNSELOR/SUPPORT_STAFF), `campaigns` (MARKETING_MANAGER) — but **no route guards with any of these resources exist**. `ADMIN` is also missing `enquiries`/`campaigns` that its subordinate roles have.
- **Impact:** Dead entitlements suggest intended-but-unwired features; it is impossible to action-guard future routes against these resources consistently, and ADMIN's implied capability set is incomplete vs the matrix narrative.
- **Recommended fix:** Either wire the resources to real routes or prune them; give ADMIN the same `enquiries`/`campaigns` set if they are to remain.

### M-08 — Deal conversion/revert: orphan hard-delete and dangling link semantics (data-loss surface)
- **Severity:** MEDIUM | **Module:** deals | **Blocks:** NO
- **Evidence:** `admin/src/lib/services/deal.service.ts:266-268` deletes the losing orphan admission on a P2002 race (hard delete that also destroys the orphan's snapshot/audit; blocked by FK Restrict once payments exist); `lead.service.ts:1086-1088` same pattern. `deal.service.ts:329-344` `revertToProspect` restores the lead but does not clear `admissionId`/`convertedAt`; `ensureDealForLead` then blocks re-PROSPECT until manual revert, and reverting a WON deal does not drop the already-created admission.
- **Impact:** On a conversion race the losing row is destroyed outright; revert leaves a live admission behind with a dangling-but-valid deal link. Data/audit integrity ambiguity for an ABAC-heavy pipeline.
- **Recommended fix:** Soft-archive the orphan instead of hard-deleting (or capture it in an audit record before delete); on revert, clear the deal link and define (drop vs keep) the admission lifecycle.

### M-09 — Public jobs feed is empty (no seeded/`PUBLISHED` jobs in the verification DB)
- **Severity:** MEDIUM | **Module:** jobs / test data | **Blocks:** NO
- **Evidence:** `SELECT status,count(*) FROM jobs` in the Docker DB → 0 rows; `GET /api/public/jobs` → 200 `{data: []}`; no `jobs`-specific assertion in `section6.public-contract.integration.test.ts` beyond "PUBLISHED + never closed" (vacuous on an empty table).
- **Impact:** The marketing `/jobs` page renders an empty career feed in this environment; the "PUBLISHED + never closed" contract is not actually exercised.
- **Recommended fix:** Seed ≥1 `PUBLISHED` job in the Docker DB and assert its presence + PII safety in the gate test.

### M-10 — Marketing `next/image` `remotePatterns` whitelists only Unsplash (CMS media latent break)
- **Severity:** MEDIUM | **Module:** marketing config | **Blocks:** NO
- **Evidence:** root `next.config.js:19-26` lists only `images.unsplash.com`. Supabase/R2 storage domains are served to the marketing app (resources `fileUrl`, portal) though currently **not** rendered via `next/image` (resources download via anchor; verified) — so this is latent: any future `<Image>` pointing at a CMS file (e.g. blog hero from CMS) will fail image optimization.
- **Recommended fix:** Add the storage domains (`*.supabase.co`, `*.r2.cloudflarestorage.com` etc.) to `remotePatterns` when CMS media rendering is introduced.

## 16. Findings: LOW

### L-01 — Admin lint gate fails (test file uses CommonJS `require`)
- **Severity:** LOW | **Evidence:** `admin/src/lib/webhooks/meta.service.test.ts:170` `const { createHmac } = require("node:crypto") as typeof import("node:crypto")` → `@typescript-eslint/no-require-imports` error under `npm run lint` (admin). Root lint passes with pre-existing warnings only. **Recommended fix:** `import { createHmac } from "node:crypto"`.

### L-02 — Marketing app not `strict`; admin eslint lax (any/unused allowed)
- **Severity:** LOW | **Evidence:** root `tsconfig.json:11` `"strict": false`; `admin/eslint.config.mjs` disables `no-explicit-any`, `no-unused-vars`, `prefer-const`, `no-img-element`, `no-html-link-for-pages`; a legacy `admin/.eslintrc.json` co-exists. **Recommended fix:** enable `strict` on the marketing app incrementally; tighten admin ESLint; delete the stale `.eslintrc.json`.

### L-03 — Declared-but-unused env vars / dead config keys
- **Severity:** LOW | **Evidence:** `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED`, `NEXT_PUBLIC_FRAPPE_URL`, `NEXT_PUBLIC_FACEBOOK_APP_ID` (declared in `env.ts`/`.env.example`, no consumer); marketing `VOICE_AI_TOKEN`, `PUBLIC_ORG_SLUG` declared, never read. **Recommended fix:** prune or wire.

### L-04 — Homepage is a client component with no `metadata`; root layout `openGraph.url` missing
- **Severity:** LOW | **Evidence:** `src/app/page.jsx:1` `'use client'` (cannot export `metadata`); `src/app/layout.jsx:47-67` `openGraph` without `url`. The site's highest-value page therefore has no canonical/og:url of its own. **Recommended fix:** add a server `layout`/`page` metadata layer with `openGraph.url`; consider `noindex` for `/portal`.

### L-05 — In-memory per-instance rate limiter + OTP hash fallback literal
- **Severity:** LOW | **Evidence:** `src/utils/rate-limit.js` `Map` per container (10k-key flush); `src/utils/otp-store.js` falls back to `process.env.AUTH_SECRET ?? 'airborne-otp-salt'`. **Recommended fix:** external/store-backed limiter for multi-instance Cloud Run; make OTP secret required.

### L-06 — Hardcoded third-party IDs in layout + unverifiable marketing claims in structured copy
- **Severity:** LOW | **Evidence:** `src/app/layout.jsx:80` GTM `GTM-KCM9CDK9`, `:91` GA4 `G-KB3Y1MSLR6`, `:114-115` Meta Pixel `974236902284876`; `src/components/ClarityInit.jsx` `CLARITY_PROJECT_ID` — all hardcoded, no per-env switching. Copy claims "100% DGCA Exam Pass Rate", "2,500+ graduates/aspirants" (`layout.jsx:64`, `about/page.jsx:62-64`) appear in schema/structured copy. **Recommended fix:** env-drive integration IDs; soften absolute claims into verifiable statements.

### L-07 — Copy fee inconsistencies (multi-step form vs course bands; blog internal)
- **Severity:** LOW | **Evidence:** `src/components/MultiStepLeadForm.jsx:341` quotes CPL total "approximately ₹80 Lakh…" vs the site's "₹55–65 lakh" band (`courses/flying-training-india-abroad/page.jsx:48`, `courses/commercial-pilot-license-cpl/page.jsx:39,75`); `blog/pilot-training-cost-india/page.jsx:39` says "₹55–75L in India" vs `:75` "₹55–65 lakh". **Recommended fix:** single sourced band values.

### L-08 — Stale artifacts: `.backup` files, worktrees, root operational clutter
- **Severity:** LOW | **Evidence:** `src/app/page.jsx.backup` (stale fees incl. "₹1,00,000 Airline Prep", "Cabin Crew On Request") and `src/components/AirborneFX.jsx.backup` unreferenced; `.claude/worktrees/agent-a45150e200e959e8a` (divergent admin fork reviving the Inngest event pipeline) and `magical-jackson-9910e1` (detached snapshot) hold dead diverging code + duplicated secrets-bearing files; ~15 root-level `.md`/report artifacts incl. `PHASE_4_AUDIT_REPORT.original.md`; `admin/prisma/migrations/migration_lock.toml` tracked-but-modified (whitespace). **Recommended fix:** delete `.backup`s, prune/archive worktrees, tidy artifacts, commit or revert `migration_lock.toml`.

## 17. Findings: INFO & VERIFIED-CLEAN (positive controls)

- **V-01 — P2023 → 400.** `admin/src/lib/utils/response.ts:58-67` maps Prisma P2023 to `INVALID_IDENTIFIER`/400 (covered by `response.test.ts`). Central `handleError` funnels all routes.
- **V-02 — Auth/webhook/cron.** `admin/src/middleware.ts` guards every `/api/**` except the explicit public allow-list; `/api/webhooks` and `/api/cron/automation` self-authenticate out-of-middleware with constant-time compares (`cron-auth.ts:13-18`, `meta.service.ts:114-139`, `google-ads/…`, whatsapp, `resource-token.ts:27-32`). `/dev*` blocked in production. Middleware injects `x-org-id`/`x-user-id`/`x-user-role` from the validated session (header forgery impossible).
- **V-03 — Org scoping.** Repositories scope `{ id, orgId }` (lead `lead.service.ts:152-155`, deal, student, admission, user, job, document, placement, media). Counselor ABAC enforced on detail/assign routes (see M-02/M-03 for the gaps).
- **V-04 — Payments.** Single `$transaction` with admission `FOR UPDATE`, payment + fee reconcile + audit co-committed (`payment.service.ts:68-133`); idempotency `@@unique([orgId, idempotencyKey])` + `@@unique([orgId, receiptNo])` with P2002 recovery; `RCP-YYYYMM-xxxxx` via DB sequence (`fee-calculation.service.ts:114-118`, `payment.repository.ts:105-112`); net = amount − refundedAmount per line; single-authority `reconcileDerivedFields` (`fee-calculation.service.ts:99-109`) keeps `feeFinal == feePaid + feeBalance` by construction (unclamped balance). M-01 is the lone concurrency gap.
- **V-05 — Deals.** `@@unique([orgId, leadId])` (`schema.prisma:639`) + `Deal.admissionId @unique` (`:611`) make conversion race-safe with P2002 recovery (`deal.service.ts:244-277`); `deals.integration.test.ts:222-238` proves the two-convert convergence. (M-08 covers the orphan/delete semantics.)
- **V-06 — Public surface.** Public routes filter PUBLISHED/APPROVED, gate downloads behind signed 1-hour tokens, allow-list settings to `applicationIntake`/`maintenanceMode` (`org.public.ts:12-27`), rate-limit lead intake (IP, memory/Upstash, `5/60s`), and use constant-time key compare. Public settings/ensure truth where canon.
- **V-07 — Tests/build.** 254/254 (all gates, Docker DB), admin `tsc` clean, root `tsc` clean, root `next build` clean.
- **V-08 — Marketing dynamic/SEO.** Public-proxy routes correct (server-side, no stale caching); `courseFees.js` Admin-first with intentional band/Offer suppression for flying-training; `JsonLd.jsx` escapes; robots disallows `/api/`. HTTP round-trip green (Section 12).
- **V-09 — Stale-value sweep.** Grep of active `src/` for `1,25,000|12,000|54,000|84,000|1,14,000|30K` returns only comments documenting the Section-6 fix; no active stale fee copy outside `.backup` (L-08).
- **V-10 — BigInt safety.** All raw-query BigInts converted via `Number()` before `ok()` (`payment.repository.ts:112`, `whatsapp.service.ts:735-767`).

## 18. Security, Auth & RBAC Verification Detail

Middleware, session (JWT strategy), credentials provider (argon2 verify, hourly session revocation on inactive/deleted user, `signIn` audit), permission matrix, ABAC helper, all v1 routes' `guard()` calls and public-route gating were verified (Section 5 checks 02-13; findings M-02–M-07). Raw `findFirst`/`update` in route handlers that bypass repositories are limited to session-bound (`users/me`) and public-slug queries. No self-service escalation path found.

## 19. Financial/Admission/Core Services Verification Detail

Payment, refund (with M-01), fee reconcile invariant, enrollment snapshot (`metadata.feePlanSnapshot` at `admission.service.ts:93-126`), fee-plan immutability-vs-price-changes (live-plan edits don't reach enrolled `feeFinal`; direct fee edits post-enrollment deliberately rewrite the snapshot), course-freeze semantics (`courseFrozenAt` field does **not** exist — implemented as a `feePaid>0` guard at `admission.service.ts:344-353`; see L-… doc drift), capacity lock via `lms_batches FOR UPDATE`. All re-verified in code + `fees.integration.test.ts:153-155`.

## 20. CRM/Deals/Workflow/Automation Verification Detail

Deal lifecycle, PROSPECT→auto-deal, stage reuse of `AdmissionStage`, conversion/revert (M-08), workflow runner (atomic lease `claim.ts:25-42`, retry/backoff/FAILED semantics, dedup uniques), internal-event delivery, cron whitelist (`cron-paths.ts`), and the automation-origin mutation scoping gap H-01. WhatsApp/Interakt + Meta webhook services constant-time verified (V-02).

## 21. Marketing Frontend Data-Integrity Verification Detail

CMS-vs-hardcoded surface, public-proxy behavior, legacy fallbacks (duplicate suppression), lead intake/OTP honesty semantics, multi-step form (L-07), and the duration/fee sweeps (H-02, V-09). Racing `ADMIN_API_URL` default in public-proxy routes (`?? 'http://localhost:4000'`) noted: in production with the env var unset the whole site silently falls back to legacy content (Flagged as an operating-risk note; the strict resolver exists for lead intake and `[slug]` pages already).

## 22. SEO, Sitemap & Structured-Data Verification Detail

Covered by H-02 (ATPL duration), H-03 (sitemap), L-04 (homepage metadata), L-06 (unverifiable claims), plus the positive contact/OG/canonical results (Section 12). JSON-LD `Course`/`Offer` prices for airline-preparation (100000), cabin-crew (59000), a320 (10000) verified correct; flying-training correctly suppresses a numeric Offer.

## 23. Schema, Migrations & Reproducibility Verification Detail

33 models, cascade/restrict review, unique constraints, and the fresh-clone replay failure C-01. `migration_lock.toml` modified-whitespace (L-08). No `RateLimit` model exists (rate limiting is code-level — correct, per design).

## 24. Env/Secrets/Config Verification Detail

Secrets on disk (H-04), unused env keys (L-03), next-auth beta pin (`next-auth@^5.0.0-beta.25`, `^` caret), `AUTH_URL` (v5) vs `NEXTAUTH_URL` (absent — verified), admin `strict` tsconfig vs marketing non-strict (L-02), `eslint ignoreDuringBuilds: true` in both apps (lint doesn't gate builds), Dockerfiles at root and `admin/`, image `remotePatterns` (M-10).

## 25. Top-10 Findings for Prioritized Action

1. **C-01** Commit the 3 migrations + `schema.prisma` + Section 1–6 change-set; verify fresh-clone replay. *(release-blocker)*
2. **H-04** Env safety interlock: test scripts pin `localhost:5433`; guard `npm run db:*`/`build`; remove dev AUTH_SECRET + harden deploy injection. *(release-blocker)*
3. **H-02** Fix ATPL duration (remove `P2M` override; align copy with P4M/4–6 months).
4. **H-03** Fix sitemap (drop redirect/alias URLs, add `/refund-policy`).
5. **M-01** Add row lock to refund path.
6. **H-01** Scope automation lead mutations by `orgId`.
7. **M-02/M-03** Close counselor ABAC gaps (follow-up/activities; analytics scoping).
8. **M-04/M-05/M-06** Stop echoing webhook secret in org API; allow-list media MIME; remove fallback intake key literal.
9. **M-08/M-09** Deal orphan/revert semantics; seed jobs + assert in gate test.
10. **L-01/L-03/L-04/L-08** Lint gate fix, env-key pruning, homepage metadata, artifact cleanup.

## 26. Release Blockers

| Blocker | Id | Type |
|---------|----|------|
| Migrations + schema + seeds uncommitted (fresh-clone cannot rebuild DB; deploy not reproducible) | C-01 | Procedural / reproducibility |
| ATPL duration three-way mismatch (structured data + copy vs canonical) | H-02 | Data integrity |
| Sitemap serving redirect/duplicate URLs and omitting `/refund-policy` | H-03 | SEO |
| `admin/.env` production creds + unpinned CLI/test DB commands (Section-2-incident class) | H-04 | Ops / secrets |
| Refund concurrent lost-update on the money path | M-01 | Financial correctness |

Note: none of these indicate a live production intrusion; they are release-gating defects in the current working tree.

## 27. Recommended Remediation Order

1. **Repo integrity (C-01):** commit the migrations + schema + the aggregated Section 1–6 change-set as reviewable commits; add a DRY-run `prisma migrate status` to the deploy checklist; then reconcile production migration state with the committed set.
2. **Env safety (H-04):** self-pinning test script (defaults to `localhost:5433`), block destructive DB scripts unless the effective `DATABASE_URL` host equals the expected environment, inject `AUTH_SECRET`/`DATABASE_URL` at deploy (Secret Manager / Vercel env), remove the dev AUTH_SECRET and prod-password-bearing values from local `.env`; rotate the live credentials that were stored on disk.
3. **Marketing content (H-02, H-03, L-04, L-07):** once the mailtouch is out, re-verify JSON-LD + copy + sitemap.
4. **Money path (M-01):** row-lock the refund; add a concurrent-refund integration test.
5. **Defense-in-depth (H-01, M-02, M-03, M-04, M-05, M-06):** org-scope automation writes; close counselor ABAC gaps; redact secrets in org settings; MIME allow-list for presign/register; require high-entropy intake key with no fallback literal.
6. **Data semantics (M-08, M-09):** soft-archive orphan admissions; decide revert semantics; seed jobs and assert the public contract.
7. **Hygiene (L-01…L-08):** lint-gate fix, strict-marketing tsconfig, env pruning, homepage metadata, artifact/worktree cleanup, migration_lock tidy.
8. **Re-audit gate:** full suite + tsc + lint + build + HTTP round-trip; then sign off for release.

## 28. Compliance Statements & Sign-off

- **DB safety:** During this audit the production Cloud SQL instance (34.93.180.179/airbornedb) was **never connected to**. Every DB command was pinned to and asserted against `localhost:5433/airbone_test`. Docker container `airbone-fees-test` remains running, seeded with the canonical Section-6 data (8 courses, fees; 4 blog Resources with SEO; 3 testimonials).
- **Code changes:** **None** made during this audit. The repo is byte-identical to session start except for this deliverable. Temp files used during verification live outside the repo (`%TEMP%\opencode`) and no `_tmp*` files exist in the repo.
- **Git:** No commits, pushes, or deploys were performed. The working tree retains the uncommitted Section 1–6 change-set (157 entries) — committing is the first remediation step (blocker C-01).
- **Tests run:** admin suite 254/254 (all gates, Docker DB); admin + root `tsc` clean; root `next build` clean; admin lint **fails** (L-01). HTTP round-trips for public contract, auth (401), redirects, lead intake, and JSON-LD executed against live dev servers.
- **Obligation:** Verify this report's findings against the production deployment's actual env injection and migration state before release; the verdict assumes the operator remediates C-01, H-04, H-02, H-03, and M-01.

**Auditor statement.** This audit was performed read-only. Metrics above reflect observed evidence at the time of audit (2026-09-06). Findings are actionable and do not constitute a substitute for operator verification of the production console/env configuration.