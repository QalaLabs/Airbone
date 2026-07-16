# CLIENT_HANDOFF.md

## Completed work
9 code fixes made across 2 audit sessions, all verified against source (not guessed):
1. Student count corrected (`5000+` → `2,500+`)
2. Mobile text-overlap on route-map section — real root-cause fix (a prior attempted fix in `main` was incomplete)
3. Horizontal-scroll trap (`100vw`) removed
4. Sitemap corrected — 2 broken entries fixed, 6 real course pages that were missing from it added
5. Stale internal link fixed
6. Fake placeholder phone number found live and corrected
7. Every form on the site — zero accessible labels found, fixed in the one shared component (covers all forms at once)
8. Form UX — was showing fake "success" on real failures; now shows honest success/error states with your exact requested copy, plus a duplicate-submission guard
9. Full audit trail across 17 report documents (SEO, accessibility, links, business-info consistency, performance risk factors, deployment/infra investigation)

## Pending client decisions
| # | Decision needed | Detail |
|---|---|---|
| 1 | Logo recolor go-ahead | Airplane shoosh + "O" → red. Raster-only source, no SVG — workflow prepared in LOGO_AUDIT.md, not executed pending your confirmation |
| 2 | Correct LinkedIn URL | Current link is a confirmed dead 404. No verifiable official company page found by search. Provide the correct URL, or say the word to remove the link until one exists |
| 3 | FAQ content trace | "50% PCM" / "disease-approved academy" wording not found anywhere in this repository after two full-repo searches. **CLIENT SCREENSHOT REQUIRED** — if this still shows live, a screenshot will let us find the actual source (likely the admin CMS, not this codebase) |
| 4 | Instagram / YouTube link verification | Instagram is inconclusive from an automated check (platform blocks bots) — worth a quick manual click-through; YouTube not checked at all |

## Infrastructure dependencies (outside this codebase)
- **`ADMIN_API_URL` / `PUBLIC_INTAKE_KEY`** — need confirmation these are set correctly in Vercel Production. This is the most likely cause of the courses/jobs/blog pages showing empty content live right now.
- **Admin backend health** — the separate backend service (Prisma/Postgres) that powers all dynamic content and lead capture needs a direct health check; can't be done from this repo.
- **Vercel deployment status** — production has been running stale code for weeks (confirmed: at least 3 merged fixes never went live). Needs someone with Vercel access to confirm auto-deploy is working or manually promote the latest build.

## Deployment dependencies
See DEPLOYMENT_GUIDE.md for the full environment-variable table, commit message, and deployment order. Short version: this session's fixes need to be committed, pushed, and deployed — and separately, the stale-production-deploy issue needs resolving regardless of these new fixes, since it's been blocking earlier work too.

## Post-launch verification
See RELEASE_CHECKLIST.md and the "Post-deployment checklist" section of DEPLOYMENT_GUIDE.md — six concrete manual checks to run against the live site right after deploy (student count, mobile overlap, courses page, lead form success/error, sitemap content, keyboard-only form navigation).

## Known limitations of this audit
- No live browser/Lighthouse/axe tooling was used for the majority of this work — findings are grounded in source-code analysis plus a handful of direct live-URL fetches (courses page, LinkedIn, Facebook, Instagram) where verification mattered most. Performance metrics (LCP/CLS/INP/TTFB), color contrast ratios, and a full 12-breakpoint visual sweep all still need a real device/Lighthouse pass — flagged, not fabricated.
- Analytics/tracking setup was not audited — no GA/GTM/Pixel code was found or specifically searched for; worth confirming whether that's expected to exist before launch.
- This environment has no GitHub push/fetch credentials — all git-state claims about "origin/main" are based on a locally cached ref, not a live read of GitHub.

## Recommended next phase
1. Close the two infrastructure blockers (env vars + admin backend) — highest-leverage single action, unblocks courses/jobs/blog content sitewide with zero code changes.
2. Commit + deploy this session's fixes.
3. Resolve the 4 pending decisions above.
4. Run a real Lighthouse pass + a 5-breakpoint live screenshot QA pass once the above are live — closes the last "unverifiable from here" gaps in PERFORMANCE_AUDIT.md and RESPONSIVE_MATRIX.md.
5. Consider the flagged-but-not-fixed items from FORMS_AUDIT.md (autocomplete disabled on form fields, no server-side dedup on lead submission) as a follow-up polish pass — not blockers, but worth a deliberate look.
