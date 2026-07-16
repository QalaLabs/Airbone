# DEPLOYMENT_GUIDE.md

## Git branch
`main`. Local HEAD `c40fbe4`. Note: this environment has no push/fetch credentials to GitHub (confirmed via failed `git fetch` last session) — verify actual GitHub `main` state from a machine with real access before assuming this matches origin.

## Files modified (uncommitted — held per instruction)
| File | Change |
|---|---|
| `src/components/GlobalRouteMap.jsx` | Student count fix + mobile-overlap layout fix |
| `src/app/page.jsx` | `100vw` → `100%` overflow fix |
| `src/app/sitemap.js` | Corrected 2 broken slugs, added 6 missing course routes |
| `src/app/blog/dgca-ground-school-guide/page.jsx` | Fixed stale internal link |
| `src/components/Home3DSection.jsx` | Fixed placeholder phone number |
| `src/components/FormField.jsx` | Added `aria-label` accessibility fix |
| `src/components/LeadForm.jsx` | Honest success/error/loading states, duplicate-submit guard |

New files (reports, not code): 17 markdown files at repo root — CODE_FIX_REPORT.md through this document.

## Recommended commit message
```
fix: mobile overlap, sitemap routes, form accessibility & error states

- GlobalRouteMap: fix student count (5000+ -> 2,500+), fix mobile
  overlap by stacking layout and removing negative margin on small
  screens (prior fix in 30d05ba was incomplete)
- page.jsx: replace width:100vw with 100% to remove scrollbar-gutter
  overflow on the 3D mode wrapper
- sitemap.js: fix two course slugs that pointed at a 404/redirect,
  add six course routes that existed as real pages but were missing
  from the sitemap entirely
- blog/dgca-ground-school-guide: fix internal link using an old
  redirecting slug
- Home3DSection: fix placeholder phone number that was live on the
  ?mode=3d page
- FormField: add aria-label to inputs/select (every form on the site
  had zero accessible field names)
- LeadForm: stop showing a fake success toast on failed submissions;
  add distinct loading/success/error states and a duplicate-submit
  guard
```

## Deployment order
1. Review the diff on the 7 modified files above (all are surgical, single-purpose changes — no refactors).
2. Commit (not done in this session, per instruction).
3. Push to `main` — or open a PR first if your workflow requires review; nothing here is urgent-hotfix-only, a normal PR review is appropriate.
4. **Before merging**, separately resolve the two Category-C infra items — they're independent of this code and don't need to block the merge, but do need resolving before the site is actually "done":
   - Confirm `ADMIN_API_URL` is correct in Vercel Production env
   - Confirm the admin backend itself is reachable/healthy
5. Once merged, confirm Vercel auto-deploys `main` to production, or manually trigger + promote the deployment if auto-deploy isn't wired up (this is the suspected reason several earlier fixes never went live — see DEPLOYMENT_REPORT.md from the prior session).

## Required environment variables (Vercel Production)
| Var | Required | Purpose | Verification status |
|---|---|---|---|
| `ADMIN_API_URL` | Yes | Points to the external admin backend for all dynamic content + lead capture | 🔴 Unconfirmed in Production — root suspect for empty courses/jobs/blog pages |
| `PUBLIC_INTAKE_KEY` | Yes | Auth header for `/api/lead` → admin backend | 🔴 Unconfirmed in Production |
| `N8N_WHATSAPP_WEBHOOK` | Optional | Fires WhatsApp nurture sequence on lead capture | Code degrades gracefully if unset |
| `VOICE_AI_WEBHOOK` / `VOICE_AI_TOKEN` | Optional | Fires outbound voice qualification call | Code degrades gracefully if unset |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | No | **Dead — unused in code**, safe to ignore | n/a |

## Build verification
- Run `npm run build` locally before pushing — `next.config.js` will `console.warn` at build time if `ADMIN_API_URL`/`PUBLIC_INTAKE_KEY` are missing (doesn't fail the build, so don't rely on this alone — check Vercel env directly too).
- `npm run lint` — note `eslint.ignoreDuringBuilds: true` is set in `next.config.js`, so lint errors won't block a Vercel build. Run it manually to catch anything real.

## Post-deployment checklist
1. Load `/` — confirm student count shows `2,500+`, no console errors.
2. Load `/` on a mobile viewport (or resize devtools to ~390px) — scroll to the route-map section, confirm no text overlap.
3. Load `/courses` — check whether the flagship banner + course cards now render (this depends on the infra fix, not this deploy, but worth checking together).
4. Submit a test lead through `/contact` — confirm the new success message appears, then deliberately break connectivity (devtools offline mode) and resubmit to confirm the new error message and retry-ability work.
5. View source or check `/sitemap.xml` — confirm it lists `commercial-pilot-license-cpl` and `cabin-crew-training`, not the old slugs.
6. Tab through a form with keyboard only — confirm fields are announced (screen reader or browser accessibility inspector).

## Rollback strategy
- Standard Vercel rollback: promote the previous production deployment from the Vercel dashboard — instant, no git operations needed.
- If rolled back at the git level instead: `git revert` the merge commit rather than `git reset --hard`, to preserve history and avoid disrupting anyone who's pulled since.
- None of these 7 changes touch data, schema, or external services — rollback is purely a frontend code revert, no data-migration or backend coordination needed either direction.
