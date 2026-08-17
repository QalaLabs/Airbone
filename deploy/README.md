# Airborne — Cloud Run Deployment

Status: **PLANNED** (prepared for the Vercel → Cloud Run migration). No production
cutover has happened. This directory contains everything needed to deploy both
Next.js apps to Google Cloud Run.

- [cloud-run-deployment.md](cloud-run-deployment.md) — step-by-step service deployment.
- [secret-manager-mapping.md](secret-manager-mapping.md) — env vars → Secret Manager.
- [multi-instance.md](multi-instance.md) — constraints when scaling beyond 1 instance.
- [supabase-connectivity.md](supabase-connectivity.md) — Supabase stays as the database.
- [vercel-migration-runbook.md](vercel-migration-runbook.md) — cutover + rollback.
- [production-qa-plan.md](production-qa-plan.md) — QA plan to run before/after cutover.

## Services

| Service | Dir | Image | Port | Target |
|---|---|---|---|---|
| `airborne-web` (marketing) | repo root (`airbone/`) | `gcr.io/<project>/airborne-web` | 8080 | `https://www.airborneaviation.in` |
| `airborne-admin` (admin + API) | `admin/` | `gcr.io/<project>/airborne-admin` | 8080 | `https://admin.airborneacademy.in` |

## Non-negotiables

1. **No cutover without sign-off.** Docs here are the plan; deployment is a
   human, dashboard-level action.
2. **Supabase PostgreSQL stays the source of truth.** No Cloud SQL migration.
3. **Both apps start at `min-instances=1`** — see [multi-instance.md](multi-instance.md)
   for why (in-memory OTP/rate-limit state, per-container `prisma migrate deploy`).
4. **Inngest stays disabled until real keys are set.** The fallback-lead
   recovery cron (`lead-fallback-sync`) only fires with real
   `INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY`.
