# Airborne Aviation — Architecture & Database Error Report

**Date:** 2026-08-02
**Scope:** Next.js public site (`Airbone/src`) + admin app (`Airbone/admin`) + Supabase project `lzbnnlpgxlzlkfirkkdz`
**Method:** Static code audit (Backend Architect agent) + live Supabase schema/advisor audit (Database Optimizer agent)

> **Coverage note:** This report covers **architecture/backend** and **database** only. No `webapp-testing` (runtime/browser QA) pass was executed in this session — there is no third transcript to draw from. Findings below are from static/schema analysis, not live UI/E2E testing. Treat anything not listed here as unverified, not "clean."

---

## Executive Summary

The public site and the admin/database layer have **drifted apart** in two connected ways:

1. The site's `.env.example` tells deployers Supabase is "unused, safe to omit" — but a silent fallback path (`fallback-storage.js`) actively depends on it as the last line of defense for lead data. Omit Supabase per the docs, and any admin-API outage **permanently loses leads** with no alert.
2. Supabase's own migration tracking only knows about 1 of 60+ tables. The real schema is owned by **Prisma**, migrated through the admin app, completely outside Supabase's visibility — a governance gap, not just a cosmetic one.

Everything else below is secondary to fixing that root mismatch.

---

## Findings — Architecture & Backend

| # | Severity | Location | Issue | Impact |
|---|----------|----------|-------|--------|
| 1 | High | `src/utils/rate-limit.js:5`, `src/utils/otp-store.js:12-13` | Rate limiting and OTP codes are stored in module-level in-memory `Map()`s. On serverless (Vercel), each request can land on a different container. | Rate limits on `/api/lead`, `/api/otp/request`, `/api/otp/verify` are trivially bypassable; OTP codes generated in one container may fail to verify in another, causing real users to see false "expired" errors. Upstash Redis is listed in `admin/.env.example:56-57` but never wired in. |
| 2 | High | `src/app/api/lead/route.js:289-311`, `src/utils/fallback-storage.js:9-13` | Fallback lead storage silently returns `false` if `SUPABASE_URL`/`SUPABASE_ANON_KEY` are unset. Root `.env.example:27-29` explicitly (and incorrectly) tells deployers Supabase is "safe to omit." | If deployed per the documented guidance, any admin-API outage causes **permanent, silent loss of sales leads** — only a server log, no alerting. |
| 3 | Medium | `src/app/api/lead/route.js:27-31` | `hasScriptInjection()` rejects any string containing a bare `<`/`>`. Not real sanitization — data is never rendered as HTML in this flow. | False positives reject legitimate input (e.g. `<` as punctuation); doesn't block real injection vectors like CRLF/header injection into the CRM's form-encoded body. |
| 4 | Medium | All `src/app/api/**/route.js` | No schema validation library (zod, etc.) anywhere. Every field is hand-checked with inline `typeof`/regex. `screening` field (`lead/route.js:157`) is passed through with **zero shape/size validation**. | Fragile validation that silently degrades as fields are added; no body-size limit anywhere, so this is a payload-size DoS vector via the unbounded `screening` object. |
| 5 | Low | `src/app/api/public-proxy/{courses,jobs,resources,settings,blogs,placements,testimonials,pages}/route.js` | `ADMIN_API_URL` default/fetch/error-handling boilerplate copy-pasted across 8 files, each with its own `revalidate` window. | Any future change (timeout, auth header, retry) must be hand-applied 8 times; already-visible drift in `revalidate` values. |
| 6 | Low | `next.config.js:12-14` | `eslint.ignoreDuringBuilds: true`. | Lint/type issues don't fail `next build`, so CI can pass with real problems in the tree. |
| 7 | Low | `src/app/page.jsx.backup`, `src/components/AirborneFX.jsx.backup` | Full duplicate component backups committed to `src/`, not gitignored. The backup file duplicates the raw-HTML JSON-LD injection logic that's supposed to live only in `JsonLd.jsx`. | Repo bloat, confusion for anyone grepping for the "real" implementation. |
| 8 | Verified safe | `layout.jsxx:75`, `page.jsx:1191,1520`, `GlobalRouteMap.jsx:927`, `JsonLd.jsx:23`, `spotlight-card.jsx:156` | All 6 non-backup uses of React's raw-HTML injection API inject static `<style>` blocks or `JSON.stringify()`'d schema — not user input. | No XSS risk found in this flow. Documented for completeness, not a defect. |

**No hardcoded secrets or credentials were found in source.** All sensitive values are `process.env.*` reads; `.env.example` files contain placeholders only.

**Positive engineering notes:** `/api/lead` has correlation IDs on every log line, `AbortController` timeouts on upstream fetches, fire-and-forget CRM/webhook calls that never block the response, PII masking (`maskEmail`/`maskPhone`, `src/lib/crm.js:41-49`) before logging, retry with exponential backoff, and idempotent dedupe via `leadUuid`/content hash.

---

## Findings — Database (Supabase project: Airbone)

**Architecture context:** The public site never queries Supabase directly. Supabase's `fallback_leads` table is a write-only safety net for failed CRM sends. The actual application database is consumed by the **admin app**, via **Prisma** over a direct Postgres connection — not `supabase-js`/PostgREST.

| # | Severity | Location | Issue | Impact |
|---|----------|----------|-------|--------|
| 1 | Critical | Supabase migration history vs. `public` schema | `list_migrations` shows exactly **1** entry (`20260716235035_create_fallback_leads_table`) against 60+ live tables. The full application schema was applied via Prisma migrations Supabase has no record of. | Anyone using Supabase's dashboard/MCP/advisors for schema history gets a wildly incomplete picture. Supabase-native migration/branching workflows will conflict with the Prisma-owned source of truth. |
| 2 | High | `verification_tokens` table | No primary key (Supabase advisor: `no_primary_key`). Columns: `identifier`, `token`, `expires` — a NextAuth token table for email verification/password reset. | Can't reliably target a single row for delete/update; risk of stale or duplicate tokens lingering. |
| 3 | High | 60 foreign keys across `leads`, `students`, `payment_transactions`, `job_applications`, `placements`, all `lms_*` tables | No covering indexes on the referencing columns (advisor: `unindexed_foreign_keys`, 60 findings). Confirmed these columns are actively joined/filtered in `lead.service.ts`, `student.service.ts`, `payment.service.ts`. | Every such join/filter does a sequential scan today; will degrade further as data grows. **Single highest-leverage performance fix available.** |
| 4 | Medium | `fallback_leads` RLS policy | Fully permissive anon INSERT (`WITH CHECK (true)`, advisor: `rls_policy_always_true`). Intentional (public lead capture), no matching SELECT policy. | Open to any caller with the anon key, not just the site's frontend — no rate limiting or payload validation at the DB level. |
| 5 | Medium | `rls_auto_enable()` function | `SECURITY DEFINER`, executable by both `anon` and `authenticated` via `/rest/v1/rpc/rls_auto_enable` (2 advisor warnings). | If this function does anything beyond schema bootstrapping, it's callable by unauthenticated clients today. |
| 6 | Medium | ~65 non-`fallback_leads` tables (`users`, `students`, `payment_transactions`, `leads`, etc.) | RLS enabled with **zero policies** (advisor: `rls_enabled_no_policy`, INFO level). Default-deny for Supabase's REST API — but the admin app bypasses this entirely via a direct Prisma/Postgres connection (presumed service-role/superuser). | All real access control lives in admin app code, not the database. If the connection string or an admin API route is ever misconfigured, there is **no RLS backstop**. |
| 7 | Low | 91 indexes across the schema | Flagged `unused_index` by advisor. | Expected/noisy given current low row counts (`users`=11, `leads`=15, `students`=1). Re-evaluate after real production traffic — don't drop yet. |
| 8 | Verified safe | PII handling | Emails/phones masked before logging (`maskEmail`/`maskPhone`); passwords and MFA secrets stored hashed (`passwordHash`, `mfaSecret`), not plaintext. | No issue found. |
| 9 | Verified safe | Dead schema check | All inspected tables map to active repository/service files in `admin/src/lib/repositories` and `services`. | No unused/orphaned schema found. |

---

## Prioritized Remediation Order

1. **Fix the Supabase-optional documentation lie.** Update `.env.example` — Supabase is *not* safe to omit while `fallback-storage.js` depends on it. Add real alerting (not just `console.error`) on fallback-lead write failures.
2. **Add covering indexes for the 60 unindexed foreign keys** — via a Prisma migration (not Supabase's tooling, to stay consistent with the real schema owner).
3. **Move rate limiting and OTP storage to Redis** (Upstash is already scaffolded in `admin/.env.example`) — closes both the bypassable rate limit and the intermittent OTP failure.
4. **Add a primary key to `verification_tokens`.**
5. **Audit and lock down `rls_auto_enable()`** — revoke public execute privileges unless deliberately public.
6. **Pick one schema source of truth (Prisma vs. Supabase) and stop the drift** — document it so future changes don't silently diverge again.
7. Add schema validation (zod) and a body-size limit to API routes; replace the blunt `<`/`>` filter with real output-context-aware handling.
8. Housekeeping: delete `.backup` files from `src/`, extract the 8x-duplicated proxy-fetch boilerplate into a shared helper, re-enable ESLint in `next build`.

---

## Explicitly Out of Scope / Not Verified

- No live browser/E2E testing was performed (no `webapp-testing` transcript exists for this delivery).
- No load testing of the rate-limit/OTP bypass was performed — the bypassability is a code-level finding, not empirically demonstrated.
- No verification of what connection role/privileges the admin app's Prisma connection actually uses (assumed service-role/superuser based on the fact RLS provides no restriction).

*Report compiled from two independent agent audits (architecture/backend, database) run against this repository and its connected Supabase project on 2026-08-02.*
