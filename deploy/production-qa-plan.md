# Production QA Plan (Vercel → Cloud Run)

Run against the Cloud Run staging copies **before** DNS cutover, then smoke
against production after.

## P0 — Lead intake (must pass first)

| # | Test | Expect |
|---|---|---|
| 1 | Submit lead form (marketing Cloud Run URL) | Admin lead appears in `airborne-admin` |
| 2 | Submit same lead again (same phone) | 409 / duplicate flagged, no second lead |
| 3 | Submit with `leadUuid` replay | Same lead returned, `meta.replayed: true` |
| 4 | Kill admin service → submit lead | Marketing shows success after fallback store; row in `fallback_leads` (anon RLS insert works) |
| 5 | Restore admin → wait ≤5 min (or open leads list) | Fallback row is `recovered`, lead exists once, audit + activity + feed entries present |
| 6 | Check audit trail on recovered lead | `lead.created` entry, no duplicates |
| 7 | Lead events (`lead_received`, `lead_saved`, `lead_response_failure`, `lead_config_error`) | Logged to stdout (Cloud Run logs), no crash |

## P1 — API / integrations

| # | Test | Expect |
|---|---|---|
| 8 | Admin login (NextAuth v5) | Works, session persists |
| 9 | Leads list triggers lazy fallback sync | No crash, no dupes |
| 10 | Resource download gate (marketing) | Downloads work through public-proxy |
| 11 | Public placements API | 200 |
| 12 | Media upload/list/delete (admin) | Supabase Storage works from Cloud Run egress |
| 13 | CRM integration status endpoint | 200, flags match env |
| 14 | Rate limits still trip (rapid requests) | 429 as before |

## P2 — Runtime / infra

| # | Test | Expect |
|---|---|---|
| 15 | `/health` | 200 `{status:"ok"}` |
| 16 | `/health/ready` (both) | 200 after DB is up |
| 17 | Cold start with `min-instances=1` | Startup ≤ ~10 s; readiness probe green |
| 18 | Kill instance / force restart | No lead loss (fallback durability) |
| 19 | Admin container start runs migrations | `prisma migrate deploy` succeeds, schema current |
| 20 | Logs | Structured JSON events visible in Cloud Logging |

## P3 — Regression on marketing site

| # | Test | Expect |
|---|---|---|
| 21 | All canonical domains 301 → `https://www.airborneaviation.in` | |
| 22 | Course/resource pages render, images load | |
| 23 | OTP request → verify flow | Works on single instance |
| 24 | Homepage 3D scenes (three.js, transpilePackages) | No hydration error |

## Sign-off gate

All P0 green → proceed. Any P0 failure → rollback via DNS (runbook §Rollback).

## Inngest activation (separate, human step — NOT part of this cutover)

When ready to turn on real event streaming:
1. Create app at app.inngest.com → set `INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY`
   on `airborne-admin` (Secret Manager).
2. Verify `lead-fallback-sync` cron fires every 5 min (`inngest_enabled: true`
   on `/health/ready`).
3. Monitor event delivery; rotate keys if any were ever committed.
