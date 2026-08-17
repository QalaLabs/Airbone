# Vercel → Cloud Run Migration Runbook

Planned migration. No cutover has happened. Two independent Next.js apps:
`airbone/` (marketing) and `admin/` (admin + API).

## Pre-flight checklist

- [ ] Both images build (`gcloud builds submit`, see cloud-run-deployment.md)
- [ ] Both services run locally from their images and pass `/health/ready`
- [ ] Secret Manager secrets created (secret-manager-mapping.md)
- [ ] Admin env sanitized: marketing Vercel project no longer has
      `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`,
      `SUPABASE_SERVICE_ROLE_KEY` (they leaked into `.env.vercel.marketing.production`)
- [ ] `ADMIN_API_URL` on the marketing service points at the admin Cloud Run URL
- [ ] `PUBLIC_INTAKE_KEY` identical on both services
- [ ] Canonical domain stays `https://www.airborneaviation.in`

## Cutover order (lowest risk first)

1. **Deploy `airborne-admin` to Cloud Run** but keep serving from Vercel too.
   Run the API-level QA (production-qa-plan.md §Admin) against the Cloud Run URL.
2. **Point marketing's `ADMIN_API_URL` at the admin Cloud Run URL** (still on
   Vercel marketing). This is the big internal change: the marketing site now
   talks to the containerized API. Verify lead intake + resource downloads
   through the Vercel-hosted marketing app.
3. **Deploy `airborne-web` to Cloud Run** and map
   `www.airborneaviation.in` + apex. Leave Vercel serving too (same code, same
   env) — no DNS switch yet.
4. **QA the marketing service** (production-qa-plan.md §Marketing) directly on
   the Cloud Run URL.
5. **Cut DNS** — the canonical CNAME/ALIAS for `www.airborneaviation.in` moves
   from Vercel to the `airborne-web` Cloud Run URL. Keep the old Vercel project
   alive (see rollback).
6. **Post-cutover smoke** for 24 h: lead form, gate downloads, OTP, admin login.

## Rollback

- **DNS is the rollback lever**: point `www.airborneaviation.in` back at Vercel.
  Both platforms run the same code, so a DNS revert is a full rollback for the
  marketing app.
- **Admin**: keep the Vercel admin project deployable. Reverting marketing's
  `ADMIN_API_URL` to the Vercel admin URL restores the old topology.
- **Data**: no schema or data migration happened; Supabase remains source of
  truth on both paths, so rollback loses nothing.
- **Secret rotation after rollback (if ever needed)**: rotate `PUBLIC_INTAKE_KEY`
  on both sides together.

## Gotchas

- `prisma migrate deploy` runs at admin container start → **1 instance only**.
- Inngest stays `local` until real keys are added; activation is a separate,
  human step (with secret rotation).
- Marketing host-based redirects (`next.config.js`) fire after DNS lands — map
  `airborneaviation.academy` / `www.airborneaviation.academy` to `airborne-web`
  too, otherwise they bypass the 301.
- Do not expose `/health/ready` details to the public internet beyond 200/503 —
  it only reports booleans, never values.
