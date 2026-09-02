# Secret Manager Mapping

Map every runtime env var to a Secret Manager secret. Secrets referenced from a
Cloud Run service must exist in the **same project**; bind at deploy time with
`--set-secrets=VAR=secret:version` (or set all at once from a list).

> Version `1` on `:latest` — Cloud Run supports `:latest` for auto-updating
> secrets; prefer an explicit version if you want pinning. These tables use
> `:latest` for simplicity. Every value should be a real secret, not a
> placeholder, at cutover time.

## airborne-web (marketing)

| Env var | Secret | Notes |
|---|---|---|
| `ADMIN_API_URL` | `airborne-web/ADMIN_API_URL` | `https://<admin-run-url>` |
| `PUBLIC_INTAKE_KEY` | `airborne-web/PUBLIC_INTAKE_KEY` | Must equal admin's `PUBLIC_INTAKE_KEY` |
| `SUPABASE_URL` | `airborne-web/SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `airborne-web/SUPABASE_ANON_KEY` | anon key (public-safe, still secret-managed) |
| `OTP_HASH_SECRET` | `airborne-web/OTP_HASH_SECRET` | `openssl rand -base64 32` |
| `UPSTREAM_FETCH_TIMEOUT` | plain env (non-secret) | `10000` |
| `N8N_WHATSAPP_WEBHOOK` | `airborne-web/N8N_WHATSAPP_WEBHOOK` | optional |
| `VOICE_AI_WEBHOOK` | `airborne-web/VOICE_AI_WEBHOOK` | optional |
| `VOICE_AI_TOKEN` | `airborne-web/VOICE_AI_TOKEN` | optional |
| `CRM_ENDPOINT` | `airborne-web/CRM_ENDPOINT` | optional |
| `CRM_COMPANY`, `CRM_SOURCE` | plain env (non-secret) | optional |
| `PUBLIC_ORG_SLUG` | plain env (non-secret) | `airborne-aviation` |

## airborne-admin (admin + API)

| Env var | Secret | Notes |
|---|---|---|
| `DATABASE_URL` | `airborne-admin/DATABASE_URL` | Supabase pooler URL (`pgbouncer=true`) |
| `DIRECT_URL` | `airborne-admin/DIRECT_URL` | non-pooled URL for `prisma migrate deploy` |
| `AUTH_SECRET` | `airborne-admin/AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `airborne-admin/AUTH_URL` | `https://admin.airborneacademy.in` |
| `PUBLIC_INTAKE_KEY` | `airborne-admin/PUBLIC_INTAKE_KEY` | must equal marketing's |
| `PUBLIC_ORG_SLUG` | plain env (non-secret) | `airborne-aviation` |
| `SUPABASE_URL` | `airborne-admin/SUPABASE_URL` | storage |
| `SUPABASE_SERVICE_ROLE_KEY` | `airborne-admin/SUPABASE_SERVICE_ROLE_KEY` | server-only |
| `SUPABASE_STORAGE_BUCKET` | plain env (non-secret) | `media` |
| `CRON_SECRET` | `airborne-admin/CRON_SECRET` | Bearer token for Cloud Scheduler → `/api/cron/automation` |
| `WHATSAPP_PROVIDER` | plain env (non-secret) | `mock` locally, `interakt` in prod |
| `INTERAKT_API_KEY` | `airborne-admin/INTERAKT_API_KEY` | server-side only, never `NEXT_PUBLIC_*` |
| `INTERAKT_WEBHOOK_SECRET` | `airborne-admin/INTERAKT_WEBHOOK_SECRET` | HMAC key for `Interakt-Signature` |
| `WHATSAPP_WEBHOOK_SECRET` | `airborne-admin/WHATSAPP_WEBHOOK_SECRET` | fallback HMAC / shared secret |
| `INTERAKT_DEFAULT_TEMPLATE` | plain env (non-secret) | optional approved template code name |
| `FACEBOOK_APP_SECRET` | `airborne-admin/FACEBOOK_APP_SECRET` | optional CRM integration |
| `R2_*` | `airborne-admin/R2_*` | documents feature only |
| `GEMINI_API_KEY` | `airborne-admin/GEMINI_API_KEY` | optional |
| `NEXT_PUBLIC_APP_URL` | plain env (non-secret, build-time) | |
| `NEXT_PUBLIC_APP_NAME` | plain env (non-secret, build-time) | |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | plain env (non-secret, build-time) | |
| `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED` | plain env (non-secret, build-time) | |

## Build-time vs runtime

- `NEXT_PUBLIC_*` are inlined at build time in `airborne-admin`
  (`NEXT_PUBLIC_FACEBOOK_APP_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED` in
  `src/app/api/v1/crm/integrations/route.ts`, `NEXT_PUBLIC_APP_URL`,
  `NEXT_PUBLIC_APP_NAME`).
- The marketing app inlines `NEXT_PUBLIC_ADMIN_URL` (portal link fallback in
  `src/app/portal/page.jsx`).
- Cloud Run builds must receive these as build args / build-time env vars.
  Secret Manager values are runtime-only; do not rely on them for `NEXT_PUBLIC_`.

## Boundary enforcement

The marketing service must never receive `DATABASE_URL`, `DIRECT_URL`,
`AUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, or `INTERAKT_*`. This was the exact
leak fixed in `.env.vercel.marketing.production` — keep it that way in Secret
Manager: secrets are per-service, so just don't reference admin secrets on
`airborne-web`.
