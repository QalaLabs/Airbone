# Multi-instance Constraints (Cloud Run)

Both apps currently hold **in-memory state**. Scaling beyond 1 instance changes
behavior. The current design is intentionally single-instance.

## Hard constraints

### 1. OTP store (marketing) — breaks above 1 instance

`src/utils/otp-store.js` keeps OTP codes in a module-level `Map`. A request
that stores a code on instance A and verifies it on instance B will fail
verification. Rate limiting for OTP requests also lives in-memory
(`src/utils/rate-limit.js`).

**Current posture:** `min-instances=1` — one warm instance serves all traffic,
so the Map is consistent. Cloud Run routes a single request to a single
instance; a cold-start instance could still race, so OTP verification has an
explicit in-memory check and will simply fail (no security hole, just UX).

**When you scale to N>1:** OTP flow breaks for split requests. Fixes (pick one):
- Redis (Upstash) OTP store + rate-limit store — the "correct" long-term fix,
  explicitly out of scope for the current phase.
- Disable OTP for a window and rely on phone call + email verification.
- Pin OTP requests to the same instance (not possible with plain Cloud Run LB).

### 2. Rate limiters (both apps) — per-instance, not global

- marketing `src/utils/rate-limit.js`
- admin `src/lib/utils/rate-limit.ts`

Each instance counts its own hits. With N instances, the effective global limit
is N× the per-instance limit. Acceptable for burst protection, not for
enforcement-style limits.

### 3. `prisma migrate deploy` in the admin CMD — 1 instance only

`admin/Dockerfile` runs `npx prisma migrate deploy && node server.js` at
container start. Two instances starting simultaneously can race on migrations
(Postgres advisory-lock handled by Prisma, but startup contention is messy).
With `min-instances=1` this is safe. For N>1: run migrations as a separate
one-off `gcloud run jobs` execution and remove them from the CMD.

## Also note

- **Inngest worker** polls from every warm instance. With 1 instance there is
  exactly one worker → cron + event processing run once. With N instances each
  polls; Inngest dedupes event delivery, but the **cron** (`lead-fallback-sync`)
  may fire from more than one instance. It is written to be idempotent (leads
  converge, never duplicated, `retry_count` bumps are harmless), but monitor it
  after any scale-up.
- **Build-time inlined secrets** (`NEXT_PUBLIC_*`) are identical across
  instances — no issue.

## Baseline recommendation

`min-instances=1`, `max-instances` 3–4 for burst. Accept the documented
limits until the Redis-backed state refactor (out of scope this phase).
