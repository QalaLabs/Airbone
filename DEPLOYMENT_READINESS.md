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
