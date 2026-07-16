# INFRASTRUCTURE_REPORT.md

Category C — needs Vercel dashboard / Admin backend access. No backend code touched, per instruction.

## Architecture
```
User → Next.js site (this repo) → /api/public-proxy/* → ADMIN_API_URL (external Next.js admin app, own Prisma+Postgres) → response
```
- This repo has **no database**. Confirmed via existing [backend_audit_report.md](backend_audit_report.md) (Phase 1-2) and grep — `@supabase/supabase-js` is an installed but **100% unused, dead dependency**. Supabase is not the CMS for this site; ignore it as a lead for any content investigation.
- Every dynamic section (courses, jobs, blogs, resources, testimonials, placements, settings, pages) is fetched by a thin proxy route in `src/app/api/public-proxy/*`, each with its own hardcoded fallback (`http://localhost:3001` or `:4000`) for local dev.

## ADMIN_API_URL
- Required in production; `next.config.js` already warns at build time if missing (`console.warn`), but a missing/wrong value doesn't fail the build — it silently degrades every dynamic section.
- **Required Vercel check:** confirm `ADMIN_API_URL` is set in Production environment (not just Preview/Development) and points at the live admin backend's real URL, not `localhost`.
- **Required backend check:** confirm the admin backend (`/admin` app, separate deploy) is actually running and its `/api/public/*` routes respond. If `ADMIN_API_URL` is correct but the admin app itself is down/crashed/misconfigured DB, symptom is identical (empty courses page).

## ISR / cache behaviour
- Proxy routes use `fetch(..., { next: { revalidate: 60 } })` — standard Next ISR, ok in principle.
- **Risk:** per existing audit report Phase 7 — if the admin backend times out or errors even once, the proxy catches it and returns `{ data: [] }` with a real `200 OK`. That empty result gets cached by ISR for up to 60s (and can persist longer if subsequent fetches keep hitting the same failure state), so a single upstream hiccup can make the courses page look permanently blank to every visitor until a request happens to land during a working window.

## Silent 200 / failure handling
- Every `public-proxy` route (`courses`, `jobs`, `blogs`, `resources`, `placements`, `pages`, `settings`, `testimonials`) follows the same pattern: `try { fetch } catch { return empty-but-200 }`. This is the single biggest infra risk on the site — no code error is ever surfaced. From the outside (Vercel logs, uptime monitors, Lighthouse) the site always looks "healthy" even when every dynamic section is dead.
- `/api/lead` (form submissions) has the same problem at higher stakes: per `backend_audit_report.md` Phase 3, a failed lead submission is told to the user as `200 Success` — **leads can be silently lost**. Already flagged as a launch-blocker in that report; repeating here because it's the same failure-swallowing pattern as the content proxies.

## Required Vercel checks
1. `ADMIN_API_URL` value in Production env — is it set, and is it correct?
2. `PUBLIC_INTAKE_KEY` (used to auth lead POSTs to admin) — also flagged by `next.config.js` warning.
3. Which deployment is currently promoted to `www.airborneaviation.in` — confirm it matches latest `main` commit `d0bffc7` (per DEPLOYMENT_REPORT, evidence says it doesn't).
4. Build logs on the last several deploys — check for silent failures that would explain the stale production alias.

## Required backend checks
1. Is the admin backend (`/admin`, Prisma + Postgres via `DATABASE_URL`/`DIRECT_URL`) up and reachable from Vercel's network?
2. Does `/api/public/courses` on that backend actually return rows? (Confirms whether it's an empty-table problem vs. a connectivity problem.)
3. Any FAQ content (the "50% PCM" / "disease-approved academy" wording client flagged) — does it live in this admin backend's DB rather than in this repo? Worth a direct DB query if you have admin access.

## Potential improvements (not implemented — flagging only, per "do not modify backend")
- Stop catching-and-200ing upstream failures; return real 5xx so monitoring/Sentry/Datadog can see it.
- Add a dead-letter/retry queue for `/api/lead` so a failed submission isn't silently dropped.
- Add rate limiting + basic spam protection (honeypot or Turnstile) on `/api/lead` — currently open to scripted abuse.
- Replace hardcoded `localhost` fallback URLs in proxy routes with a required-env assertion that fails the build/request loudly instead of degrading silently.
