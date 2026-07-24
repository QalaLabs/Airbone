# DEPLOYMENT_READINESS.md

## Git state
- Local `main` HEAD: `c40fbe4` ("Merge branch 'main' of https://github.com/QalaLabs/Airbone")
- **Cannot fetch from GitHub in this environment** — `git fetch` failed with "Invalid username or token" (no push/fetch credentials configured here). The `origin/main` ref on disk is a locally-cached snapshot from a previous fetch, not a live read of GitHub right now — treat any "ahead/behind origin" comparison as **unverified**, not authoritative. Confirm actual GitHub state from a machine with real repo access.
- Uncommitted changes in working tree (this session, not yet committed per your "do not commit" instruction):
  - Code: `src/app/blog/dgca-ground-school-guide/page.jsx`, `src/app/page.jsx`, `src/app/sitemap.js`, `src/components/FormField.jsx`, `src/components/GlobalRouteMap.jsx`, `src/components/Home3DSection.jsx`
  - New report files: this document + 12 others listed in MASTER_QA_REPORT.md
- No `.vercel` directory or `vercel.json` in the repo — deployment/project linking lives entirely in the Vercel dashboard, not in version control. Cannot inspect from here.

## Environment variables — presence only, values not read
| Var | Root `.env.local` | Purpose |
|---|---|---|
| `ADMIN_API_URL` | Present locally per earlier grep of `next.config.js` build warning logic | Required in **Production** Vercel env — root cause candidate for empty courses/jobs/blog pages if unset/wrong there (Category C, see INFRASTRUCTURE_REPORT.md) |
| `PUBLIC_INTAKE_KEY` | Referenced, same warning pattern | Auth header for lead submissions to admin backend |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | In `.env.example` | **Unused dead config** — `@supabase/supabase-js` confirmed unused in code, safe to ignore/remove from env checklist |
| `N8N_WHATSAPP_WEBHOOK`, `VOICE_AI_WEBHOOK`, `VOICE_AI_TOKEN` | In `.env.example` | Optional — lead route checks `if (process.env.X)` before firing, degrades gracefully if unset |

**Cannot confirm what's actually set in Vercel Production** from this environment — only that the code correctly reads these var names and warns at build time if `ADMIN_API_URL`/`PUBLIC_INTAKE_KEY` are missing.

## API health
- `/api/lead` — code-reviewed, solid: rate-limited, sanitized, validated, timeout-protected, has fallback storage on upstream failure (see FORMS_AUDIT.md). **Cannot confirm live 200 response without hitting the deployed endpoint.**
- `/api/public-proxy/courses` (and siblings: jobs, blogs, resources, testimonials, placements, pages, settings) — code-reviewed, confirmed structurally sound but with a known silent-failure pattern (catches upstream errors, returns `200` + empty data). **Live-verified this session**: `airborneaviation.in/courses` currently shows the empty-catalog fallback state — confirms this failure mode is actively happening in production right now, not theoretical.

## ISR / caching
`revalidate: 60` across all proxy routes — standard, reasonable. Interacts badly with the silent-failure pattern above: a single upstream hiccup can get cached and compound. See INFRASTRUCTURE_REPORT.md.

## Readiness checklist
| Item | Status |
|---|---|
| Code fixes for this round complete | ✅ Yes — see CODE_FIX_REPORT.md |
| Fixes committed | ⚪ **Not committed** — per your instruction, holding for your go-ahead |
| Fixes pushed | ⚪ Not pushed — no credentials in this environment even if committed |
| Production redeploy needed regardless of new fixes | ✅ Yes — 3+ commits already on `main` (address text, prior overlap attempt, others) never reached production, independent of this session's work |
| `ADMIN_API_URL` verified correct in Vercel Production | 🔴 Unconfirmed — needs Vercel dashboard access |
| Admin backend confirmed healthy | 🔴 Unconfirmed — needs direct access to that service |
| Logo asset swap | ⚪ Prepared, not executed — needs your go-ahead |
| LinkedIn URL | 🔴 Needs correct URL from you — see LINK_AUDIT.md |

## Bottom line
Code is in good shape for this round. **The blocking risk to a "client-ready build" is entirely outside this repo**: (1) production is running stale code from before at least 3 merged fixes, (2) the admin backend / its env var is broken or misconfigured, causing real empty-content pages live right now. Neither can be resolved by more code auditing — both need direct Vercel + admin-backend access.

---

## Phase A — Production Readiness (branch: `chore/phase-a-production-ready`)

### Gate results (run 2026-07-24)
| Gate | Result |
|---|---|
| `prisma validate` | ✅ Schema valid |
| `prisma migrate status` | ✅ 3 migrations applied, database up to date |
| `tsc --noEmit` (admin) | ✅ 0 errors |
| `tsc --noEmit` (root) | ✅ 0 errors |
| `next lint` (admin) | ✅ 0 errors (2 minor unused-var warnings, pre-existing) |
| `next build` (admin) | ✅ 91 routes — 0 errors |
| `next build` (root) | ✅ 46 routes — 0 errors (ECONNREFUSED during SSG is expected when admin not running locally) |

### Files changed in this branch
| File | Change |
|---|---|
| `admin/.env.example` | Comprehensive: all required + optional keys with inline docs |
| `.env.example` | Updated: `ADMIN_API_URL`, `PUBLIC_INTAKE_KEY`, removed dead Supabase vars |
| `admin/src/lib/env.ts` | New: typed env accessor, required-var validation at startup, dev warnings for optional |
| `admin/src/middleware.ts` | `/dev/*` blocked with 404 in `NODE_ENV=production`; moved out of PUBLIC_PATHS |
| `admin/scripts/reset-admin-password.mjs` | New utility script (untracked) |
| `admin/src/app/dev/auto-login/page.tsx` | New dev helper (untracked) — client-side production guard + middleware guard |

### Vercel project split
Two separate Vercel projects are required:

**Project 1 — Marketing Site** (root `/`)
- Root Directory: `` (empty — repo root)
- Framework: Next.js
- Build Command: `next build` (or `npm run build`)
- Output Directory: `.next`

**Project 2 — Admin OS** (`/admin`)
- Root Directory: `admin`
- Framework: Next.js
- Build Command: `prisma generate && prisma migrate deploy && next build`
- Output Directory: `.next`
- Install Command: `npm install` (postinstall runs `prisma generate` automatically)

### Required env vars — set in Vercel Dashboard before first deploy

#### Admin project (Production + Preview)
```
DATABASE_URL          postgresql pooler URL (Neon/Supabase)
DIRECT_URL            postgresql direct URL (for migrate deploy)
AUTH_SECRET           openssl rand -base64 32
AUTH_URL              https://admin.airborneacademy.in
PUBLIC_INTAKE_KEY     shared secret (min 32 chars, same value as marketing site)
INNGEST_EVENT_KEY     from app.inngest.com → Event Keys
INNGEST_SIGNING_KEY   from app.inngest.com → Signing Key
R2_ACCOUNT_ID         Cloudflare R2
R2_ACCESS_KEY_ID      Cloudflare R2
R2_SECRET_ACCESS_KEY  Cloudflare R2
R2_BUCKET_NAME        airborne-media
R2_BUCKET_DOCS        airborne-docs
R2_PUBLIC_URL         https://media.airborneacademy.in
PUBLIC_ORG_SLUG       airborne-aviation
```

Optional (features degrade gracefully if absent):
```
GEMINI_API_KEY        AI study assistant (stub response when missing)
TWILIO_*              SMS — not yet active in code
WATI_*                WhatsApp — Sprint 5
RESEND_*              Email — reserved
UPSTASH_*             Redis — reserved
```

#### Marketing site project (Production + Preview)
```
ADMIN_API_URL         https://admin.airborneacademy.in
PUBLIC_INTAKE_KEY     same value as admin's PUBLIC_INTAKE_KEY
PUBLIC_ORG_SLUG       airborne-aviation  (optional — has default)
```

### Deploy sequence (Preview → Production)
```bash
# 1. Push this branch
git push -u origin chore/phase-a-production-ready

# 2. In Vercel dashboard: create Preview deploy from this branch for BOTH projects
#    (Vercel auto-deploys preview on push if branch deploy is enabled)

# 3. Smoke test the preview URLs (see checklist below)

# 4. After smoke pass: merge PR → main → Vercel auto-deploys Production
```

If Vercel CLI is available and logged in:
```bash
# Admin preview
cd admin && vercel --prod=false

# Marketing site preview
cd .. && vercel --prod=false
```

### Smoke test checklist (run against Preview URLs)
- [ ] **Admin login** — `https://admin-preview.vercel.app/login` → email + password → lands on dashboard
- [ ] **Student portal login** — `/login` with student creds → lands on `/portal`
- [ ] **LMS course view** — `/portal/courses` → at least one course visible
- [ ] **AI assistant** — `/portal/assistant` → sends question → gets response (or stub if GEMINI_API_KEY not set)
- [ ] **Certificate verify** — `/api/v1/public/lms/certificates?certNo=XXX` → JSON with cert data
- [ ] **Lead form** — marketing site contact form → 200 response, no CORS error
- [ ] **Public courses** — marketing site `/courses` → not empty (confirms `ADMIN_API_URL` is correct)
- [ ] **Inngest health** — `https://admin-preview.vercel.app/api/inngest` → 200 (GET returns function list)
- [ ] **Dev auto-login blocked** — `https://admin-preview.vercel.app/dev/auto-login` → 404 in production

### Remaining blockers (human action required in Vercel Dashboard)
1. **Create the two Vercel projects** if not already linked — Root Directory split cannot be done via CLI alone
2. **Set all REQUIRED env vars** listed above in both Vercel projects (Production AND Preview environments)
3. **Set `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`** — get from app.inngest.com after syncing functions
4. **Confirm `ADMIN_API_URL`** in marketing site Vercel project matches the live admin URL
5. **Domain assignment** — assign `airborneacademy.in` to marketing site and `admin.airborneacademy.in` to admin project
6. **`prisma migrate deploy`** runs automatically during admin build — ensure `DIRECT_URL` is the non-pooled Neon/Supabase URL
