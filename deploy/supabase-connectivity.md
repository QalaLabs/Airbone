# Supabase Connectivity (Database Stays in Place)

This phase does **NOT** migrate the database. Existing Supabase PostgreSQL
remains the source of truth for `airborne-admin`, and Supabase Storage remains
the media bucket. These notes cover what must be verified when the apps move to
Cloud Run.

## 1. Database reachability from Cloud Run

- `DATABASE_URL` = pooler URL (`...pooler.supabase.com:6543` with
  `pgbouncer=true&sslmode=require`).
- `DIRECT_URL` = non-pooled URL (`...db.<ref>.supabase.co:5432`) used only by
  `prisma migrate deploy`.
- Supabase PostgreSQL accepts connections from any IP; Cloud Run egress (default
  public) works out of the box. **No VPC/static-IP setup is required** unless
  Supabase's network restrictions change.
- Verify with the readiness probe: `/health/ready` runs `SELECT 1` through
  Prisma.

## 2. Storage reachability

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` on `airborne-admin` drive media
  uploads/list/delete (bucket `media`, auto-created public on first use).
- Missing credentials → `503 STORAGE_UNAVAILABLE`; deletes degrade to DB-only
  soft delete. Confirm the service account-less default (public egress) can
  reach `https://<ref>.supabase.co/storage/...`.

## 3. Supabase features actually used

| Feature | Used? | Where |
|---|---|---|
| PostgreSQL (Prisma) | **Yes** | all admin data |
| Storage | **Yes** | media library |
| fallback_leads table | **Yes** | durability fallback for lead intake |
| Auth | No | NextAuth v5 is self-contained in the admin app |
| Realtime/PostgREST | No | — |

## 4. Fallback lead storage (marketing side)

- Marketing writes failed/intake-stuck leads to `fallback_leads` using
  `SUPABASE_URL` + `SUPABASE_ANON_KEY` via the PostgREST REST API
  (`src/utils/fallback-storage.js`).
- Admin auto-recovery: `lead-fallback-sync` Inngest cron every 5 min
  (`LeadService.syncFallbackLeadsCron`). Works only with real
  `INNGEST_EVENT_KEY`/`SIGNING_KEY`; until then, lazy recovery happens when a
  staff user opens the leads list, plus `scripts/replay-fallback-leads.ts`.
- RLS note: `fallback_leads` accepts anonymous inserts for the web form only —
  do not weaken; the recovery path uses the service role.

## 5. Actions on cutover

1. Confirm the two services reach the pooler and direct DB URLs (readiness 200).
2. Confirm media upload/list/delete works through the deployed admin (QA plan).
3. Confirm a forced-fallback lead is auto-recovered (QA plan).
4. Do **not** run any Cloud SQL provisioning — out of scope.
