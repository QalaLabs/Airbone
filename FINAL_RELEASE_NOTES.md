# FINAL_RELEASE_NOTES.md

## Recommended PR title
`fix: mobile overlap, sitemap routes, form accessibility & honest error states`

## Recommended PR description
```
Fixes 7 confirmed bugs found during a full production QA audit
(see MASTER_QA_REPORT.md for the complete audit trail).

## What's fixed
- GlobalRouteMap: student count typo (5000+ -> 2,500+) and a mobile
  text-overlap bug. The overlap fix in this PR is a full root-cause
  fix — flex-row layout + fixed sidebar width + negative margin had
  no responsive handling at all; a prior attempt (30d05ba) only
  patched padding and didn't address the actual layout structure.
- page.jsx: removed a width:100vw usage that caused horizontal
  scroll (100vw includes scrollbar-gutter width).
- sitemap.js: two course slugs pointed at a 404/redirect instead of
  the canonical route; six real course pages were entirely missing
  from the sitemap despite having live pages and metadata.
- One stale internal link fixed (old redirecting slug -> canonical).
- Home3DSection: a placeholder phone number was live on the
  ?mode=3d page instead of the real business number.
- FormField: every form on the site had zero accessible field names
  (placeholder-only inputs, no label/aria-label) — WCAG 1.3.1/4.1.2
  failure. Fixed once in the shared component, applies everywhere.
- LeadForm: was showing a fake "success" toast even when submission
  actually failed (network error, validation rejection, rate limit).
  Now shows honest, distinct loading/success/error states with a
  duplicate-submission guard.

## What's NOT in this PR
- Logo recolor — needs image asset editing, not a code change, and
  needs a go-ahead (see LOGO_AUDIT.md)
- LinkedIn link fix — correct URL not yet identified, needs client
  input
- Empty courses/jobs/blog content in production — this is an
  infrastructure issue (ADMIN_API_URL / admin backend), not
  something this diff can fix
- Production being on a stale build — this PR doesn't change that;
  someone needs to confirm the Vercel deployment is actually
  tracking main after this merges

## Testing completed
- Full-repo static analysis: overflow/negative-margin/fixed-width
  sweep, business-info consistency grep across all phone/email/
  address/social references, per-page SEO metadata check
- Live verification (not just code-reading) via direct fetch of the
  production courses page and the three footer social links
- No live browser/Lighthouse pass — flagged as a known gap in
  MASTER_QA_REPORT.md, not something this PR claims to cover

Full detail: see the 17 audit reports at repo root
(MASTER_QA_REPORT.md is the index).
```

## Files changed
`src/components/GlobalRouteMap.jsx`, `src/app/page.jsx`, `src/app/sitemap.js`, `src/app/blog/dgca-ground-school-guide/page.jsx`, `src/components/Home3DSection.jsx`, `src/components/FormField.jsx`, `src/components/LeadForm.jsx` — 7 files, no new dependencies, no schema/API contract changes.

## Breaking changes
None. Every change is additive or a targeted bug fix within existing components — no prop signatures changed, no routes removed, no API contracts altered. `LeadForm.jsx`'s internal `status` state gained a new `'error'` value, but that's internal to the component, not a breaking change to any consumer (it's used the same way — `<LeadForm courseName source />` — everywhere).

## Risk level: **Low**
- All 7 changes are surgical, single-purpose, and independently revertible.
- No backend, database, or third-party integration touched.
- No dependency version changes.
- Highest-touch file is `GlobalRouteMap.jsx` (layout logic change) — recommend that one gets an actual mobile-viewport look before merge, since it's the only change with real visual-layout risk; the rest are low-risk by nature (text values, a CSS unit, sitemap data, an `aria-label`).

## Testing completed
Source-level verification for all 7 fixes (traced root cause, confirmed fix addresses it, checked for regressions in surrounding code). Live-fetch verification for 2 infra-adjacent findings (courses page, social links) that informed but aren't part of this diff. **Not completed**: rendered visual QA, Lighthouse, cross-browser check — none of these were available in this environment. Recommend the manual smoke test in RELEASE_CHECKLIST.md before/after merge.

---

## Executive summary

| Status | Item |
|---|---|
| ✅ Ready for Commit | All 7 code fixes — stable, low-risk, independently testable |
| 🟡 Waiting for Client | Logo recolor go-ahead · correct LinkedIn URL · FAQ screenshot · error-toast copy (now implemented per your spec, just needs your sign-off on the final wording) |
| 🔴 Waiting for Infrastructure | `ADMIN_API_URL`/admin backend health (empty courses/jobs/blog in production) · confirm production is tracking `main` at all |
| ⚪ Ready for Deploy | **Conditional** — the code itself is ready, but deploying it doesn't fix the site's biggest visible problem (empty course catalog) since that's infra, not this PR. Recommend deploying this PR *and* resolving the infra items together, not deploying this alone and calling it done. |
