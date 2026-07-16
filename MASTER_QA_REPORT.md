# MASTER_QA_REPORT.md

Two-session production QA audit of airborneaviation.in. Full detail in the 13 linked reports below — this is the roll-up.

## Totals
| Metric | Count |
|---|---|
| Total issues found (this + prior session) | 18 |
| ✅ Fixed in code, this session | 9 |
| 🟡 Already fixed in `main`, waiting on redeploy | 2 |
| 🔴 Infrastructure/backend, cannot fix from repo | 3 |
| ⚪ Needs your confirmation/decision | 4 |

## Fixed in code (uncommitted, per "do not commit" instruction)
1. Student count `5000+` → `2,500+`
2. Mobile text-overlap on route-map section (real root-cause fix; prior attempt was insufficient)
3. `width:100vw` horizontal-scroll trap
4. Sitemap: 2 broken/redirect-hop slugs corrected, 6 missing course routes added
5. Stale internal link (blog → old course slug)
6. Fake placeholder phone number live on `?mode=3d` page
7. Zero accessible form labels sitewide (WCAG 1.3.1/4.1.2) — fixed in shared component

## Fixed in `main`, not yet live (deployment gap — see DEPLOYMENT_REPORT.md)
1. Contact page address/metro-distance wording
2. Prior route-map overlap fix attempt (superseded by this session's real fix, also needs deploy)

## Infrastructure — needs Vercel/admin-backend access, not code
1. Courses/jobs/blogs pages showing empty fallback content in production — root cause: `ADMIN_API_URL` misconfig or admin backend down, live-confirmed via direct fetch of the production courses page
2. Whether production is even running current `main` — 3+ merged fixes never reached the live site
3. Silent-failure proxy pattern (catches errors, returns 200 + empty data) — makes the above hard to diagnose from the outside; not modified per instruction

## Needs your confirmation
1. Logo recolor (airplane shoosh + "O" → red) — asset edit prepared, not executed, needs go-ahead (LOGO_AUDIT.md)
2. LinkedIn URL — confirmed dead link, correct replacement unknown, need it from you
3. FAQ "50% PCM" / "disease-approved academy" wording — not found anywhere in repo; either a deeper stale-deploy artifact or lives in the admin CMS — need a live screenshot to trace it
4. `LeadForm.jsx` shows fake "success" on real failures — flagged, needs a decision on error copy, not silently changed

## Risk assessment
| Area | Risk | Why |
|---|---|---|
| Content freshness (courses/jobs/blogs) | **High** | Live-confirmed broken right now, visible to every visitor, directly affects lead generation (empty course catalog = no CTA to convert on) |
| Deployment gap | **High** | Multiple fixes sitting unreleased for weeks; any further code work is wasted until this closes |
| Business info accuracy | **Medium** | Wrong phone number and stale address text are the kind of error that erodes trust fast; now fixed/tracked |
| Broken external link (LinkedIn) | **Low-Medium** | Cosmetic/trust issue, not conversion-blocking |
| Accessibility (forms) | **Medium** | Real WCAG failure, now fixed; contrast ratios still unverified (needs live tooling) |
| Performance | **Unmeasured** | No Lighthouse pass possible from here — flagged as a genuine gap in this audit's confidence, not swept under the rug |

## Production Readiness Score: 58 / 100

Reasoning: code quality and correctness for the surfaces actually auditable from source is solid — forms, SEO plumbing, redirects, and business-info consistency are in good shape after this round's fixes. The score is dragged down hard by two things entirely outside code review's reach: (1) production is running a stale build, so even "done" fixes aren't real to a visitor yet, and (2) the live courses/jobs/content pipeline is actively broken right now. **This is not a code-quality score — it's a "would I let a visitor hit this site today" score**, and today they'd see missing courses and a handful of stale-text bugs that are already solved in the repo. Closing the deployment gap and the `ADMIN_API_URL`/backend issue would likely move this to 80+ without any further code changes.

## What actually moves the score
1. Redeploy `main` → production (biggest single lever, zero new code needed)
2. Fix `ADMIN_API_URL`/admin backend → unblocks all dynamic content
3. Your 4 decisions above (logo, LinkedIn, FAQ trace, error-toast copy)
4. A real Lighthouse + live-device screenshot pass once 1-2 are done, to close PERFORMANCE_AUDIT.md and RESPONSIVE_MATRIX.md's remaining unknowns

## All reports
1. [CODE_FIX_REPORT.md](CODE_FIX_REPORT.md)
2. [FORMS_AUDIT.md](FORMS_AUDIT.md)
3. [RESPONSIVE_MATRIX.md](RESPONSIVE_MATRIX.md)
4. [LINK_AUDIT.md](LINK_AUDIT.md)
5. [SEO_AUDIT.md](SEO_AUDIT.md)
6. [ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md)
7. [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md)
8. [BUSINESS_CONSISTENCY.md](BUSINESS_CONSISTENCY.md)
9. [LOGO_AUDIT.md](LOGO_AUDIT.md)
10. [DEPLOYMENT_REPORT.md](DEPLOYMENT_REPORT.md)
11. [INFRASTRUCTURE_REPORT.md](INFRASTRUCTURE_REPORT.md)
12. [DEPLOYMENT_READINESS.md](DEPLOYMENT_READINESS.md)
13. [FINAL_CLIENT_REPORT.md](FINAL_CLIENT_REPORT.md)

No code committed, no deploy triggered — per instruction.
