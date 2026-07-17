# ADMIN_PANEL_HANDOFF.md

Summary of everything done to deploy and connect the admin panel, for continuity with another agent/developer. No secret values are embedded here — see "Where to find real values" at the bottom.

## Architecture
Two independent Vercel projects, connected by one env var:
```
Main website (airbone)  ──POST /api/lead──▶  Admin backend (airbone-admin)  ──▶  Postgres (Supabase-hosted)
Main website (airbone)  ◀──GET /api/public/*──  Admin backend (airbone-admin)
```
- **Main site**: this repo's root (`/src`), Next.js, no database of its own — everything dynamic is proxied through `/api/public-proxy/*` and `/api/lead`.
- **Admin backend**: `/admin` subfolder, separate Next.js app, Prisma ORM, NextAuth v5 (Auth.js) for login, its own `package.json`/deploy.
- **Database**: single shared Postgres instance, hosted on Supabase project **"Airbone"** (project ref `lzbnnlpgxlzlkfirkkdz`, region `ap-southeast-2`). The admin backend is the only thing that talks to it directly (via Prisma); the main site never touches the DB directly.

## What was deployed this session

### 1. Admin backend — new Vercel project
- Project name: **`airbone-admin`** (under the `qala-labs-projects` Vercel team)
- Linked from `/admin` via `vercel link`
- Deployed via `vercel --prod`
- Live URLs: `https://airbone-admin.vercel.app` and `https://admin.airborneaviation.in` (custom subdomain, DNS confirmed resolving)

### 2. DNS
- `admin.airborneaviation.in` — CNAME record added at the domain's DNS provider (GoDaddy, since this domain's nameservers are NOT delegated to Vercel — confirmed "Third Party" nameservers), pointing to `cname.vercel-dns.com.`
- Verified live via `nslookup` and a direct HTTPS request — resolving and serving correctly

### 3. Environment variables set (names + purpose, not values)

**On `airbone-admin` (Production):**
| Var | Purpose |
|---|---|
| `DATABASE_URL` | Prisma pooled connection to Supabase Postgres |
| `DIRECT_URL` | Prisma direct connection (for migrations) |
| `AUTH_SECRET` | NextAuth session encryption — regenerated fresh for production, not the dev placeholder |
| `AUTH_URL` | Set to the real deployed URL (`https://airbone-admin.vercel.app`) — required, NextAuth breaks silently if left as `localhost` |
| `NEXT_PUBLIC_APP_URL` | Same, public-facing |
| `PUBLIC_INTAKE_KEY` | Shared secret — must match the main site's value exactly (see below) |
| `PUBLIC_ORG_SLUG` | `airborne-aviation` — used at login |
| `NEXT_PUBLIC_APP_NAME` | Display name |
| `NODE_ENV` | `production` |

**On `airbone` (main site, Production) — added/changed this session:**
| Var | Purpose |
|---|---|
| `ADMIN_API_URL` | **The critical missing piece from earlier audits.** Now set to `https://airbone-admin.vercel.app`. This single var is what connects the two apps — without it, courses/jobs/blog pages show empty and leads only reach a local fallback table, never the real admin DB. |
| `PUBLIC_INTAKE_KEY` | Reset to match the admin backend's value exactly — the intake route (`admin/src/app/api/public/leads/route.ts`) rejects requests where this doesn't match |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Previously literal placeholders (`your-project-id.supabase.co`) — replaced with real values pointing at the same "Airbone" Supabase project, used only for the fallback-lead-storage path when the admin backend is unreachable |

⚠️ **Known leftover, not yet cleaned up**: an earlier manual mistake added `AUTH_URL`, `AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL` directly to the **main site's** (`airbone`) Production env too. The main site's code never reads these — they're harmless dead weight, not a functional bug, but worth removing for hygiene. Not done yet.

### 4. Database changes (direct SQL against the Supabase project)
- Created table `public.fallback_leads` — durability backstop for lead submissions when the admin backend is unreachable. RLS enabled, insert-only policy for the `anon` role, no public select policy.
- **Rotated the superadmin password.** The original (`Airborne@123`) was committed in plaintext to git history (`admin/test_login.js`) — treated as compromised regardless of whether it was ever exploited. New password set via a fresh `argon2id` hash written directly to `public.users.passwordHash`.
- **Created a second user account** — `deepak@airborneaviation.in`, role `ADMIN` (not `SUPER_ADMIN` — has leads/courses/students access but not user-management/settings). This is the client's own login, separate from the superadmin account.

### 5. Verified live (not just deployed — actually tested)
- Superadmin login → real session token issued
- Deepak's login → real session token issued, confirmed can pull real leads data with it
- Full lead pipeline: submitted a real POST to `https://www.airborneaviation.in/api/lead` → response changed from `"(fallback)"` to `"Lead captured successfully."` → confirmed the row appeared in the real `leads` table via the admin's authenticated API within seconds → deleted the test row after
- Courses pipeline (same `ADMIN_API_URL` connection, no separate work needed) → confirmed real course data now renders on `/courses` instead of the empty-state message

## Known correction from earlier in this session
The `public.leads` table was reported as "0 rows" by a raw SQL query earlier in this session. That was wrong — it was Row Level Security silently filtering the query, not an actually-empty table. The table already had 7 real leads. Don't trust a raw/service-role SQL count against RLS-protected tables as ground truth — query through the app's own authenticated API when checking user-facing data, or explicitly account for RLS in the query.

## Still open / not done
1. **Remove the leftover dead env vars** (`AUTH_URL`, `AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`) from the main `airbone` project — cosmetic, not breaking anything
2. **Give Deepak his password via a secure channel** — it was shared in chat during this session, not written to any file in this repo. Rotate it once he's confirmed access, same as the superadmin one.
3. **Inngest env vars** (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`) were left as `"local"` placeholders on the admin deploy — background workflow automation (if the admin app uses Inngest for anything beyond core CRUD) may not function until these are set to real values.
4. Consider whether `SUPER_ADMIN` should have MFA enabled (`isMfaEnabled` currently `false` for both accounts) given it now has a public login URL.

## Where to find real values (do not ask for them to be pasted into files/commits)
- All Vercel env var values: Vercel dashboard → `qala-labs-projects` team → `airbone` or `airbone-admin` project → Settings → Environment Variables
- Database credentials/direct access: Supabase dashboard → project **"Airbone"** (`lzbnnlpgxlzlkfirkkdz`) → Project Settings → API / Database
- Login credentials for both accounts: not stored in this repo — request from whoever ran this session, or reset via the database directly (see the argon2 hashing pattern used above, in this session's tool history) if lost
