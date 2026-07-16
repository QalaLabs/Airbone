# RELEASE_CHECKLIST.md

☑ = verified this audit · ☐ = pending action outside this repo · ⚠ = known issue, tracked elsewhere

## Code
- ☑ Commit — prepared, not executed (see DEPLOYMENT_GUIDE.md for message)
- ☐ Push — needs real GitHub credentials, unavailable in this environment
- ☐ Production build — run `npm run build` before push to catch anything static analysis can't

## Environment / Infra
- ☐ Environment variables — `ADMIN_API_URL`, `PUBLIC_INTAKE_KEY` unconfirmed in Vercel Production (see DEPLOYMENT_GUIDE.md)
- ☐ Admin backend — health/reachability unconfirmed from this environment
- ⚠ API health — `/api/lead` code-verified solid; `/api/public-proxy/courses` (and siblings) live-confirmed returning empty in production right now

## SEO
- ☑ Sitemap — fixed this session (2 broken slugs, 6 missing routes)
- ☑ Robots.txt — verified present and correctly wired
- ☑ Metadata/canonical — 24-26 of ~28 routes verified
- ⚠ Structured data — JSON-LD present and spot-checked, not run through Google's live Rich Results validator (needs live URL)

## Analytics
- ☐ Not audited this pass — no analytics/tracking code (GA, GTM, Meta Pixel) was found or searched for in either audit session. **Flag: confirm whether analytics is expected to exist at all before launch** — if it's meant to be there and isn't, that's a gap this checklist hasn't covered.

## Forms
- ☑ Validation, sanitization, rate limiting — verified server-side
- ☑ Loading/success/error states — implemented this session with your exact copy
- ☑ Duplicate-submission guard — added client-side this session
- ☑ Accessible labels — added this session

## CRM
- ☑ Lead payload structure and upstream POST verified in code
- ☐ End-to-end confirmation that leads actually land in the CRM — needs live admin backend access to check

## WhatsApp / Phone / Email
- ☑ All `wa.me`/`tel:`/`mailto:` links verified consistent across the site (one wrong phone number found and fixed)

## Maps
- ☑ Google Maps embed + directions links verified well-formed

## Social Links
- ☑ Facebook — live-verified working
- ⚠ Instagram — inconclusive (bot-blocked from this environment), needs a manual browser check
- ☐ YouTube — not checked
- 🔴 LinkedIn — confirmed dead, correct URL unresolved, **CLIENT INPUT REQUIRED**

## Accessibility
- ☑ Form labels — fixed
- ☑ Nav aria-labels — verified present
- ⚠ Color contrast — cannot verify without live tooling (axe/Lighthouse against the deployed site)

## Mobile / Desktop / Tablet QA
- ☑ Static-code overflow sweep complete (negative margins, fixed widths, 100vw) — one real bug found and fixed
- ☐ Live device/browser screenshot pass at 320/375/768/1024/1440px — recommended once redeployed, not done this session (no live browser tooling used for full breakpoint sweep)

## Lighthouse
- ☐ Not run — no live browser access this session. Recommend running immediately after redeploy against the real production URL; static analysis flagged `next/image` under-use and a 136KB monolithic homepage file as risk factors worth a real measurement.

## Smoke test (do this manually right after deploy)
- ☐ Load home, courses, contact, about, one blog post, one course detail page — confirm no console errors, no visibly broken layout
- ☐ Submit one real test lead end-to-end, confirm it appears in the CRM
- ☐ Click every footer social icon
- ☐ Resize browser through the breakpoints listed above

## Bottom line
Everything marked ☑ is genuinely done and verified from source. Everything marked ☐ or 🔴 needs either live access (Vercel/admin backend/browser) or your input — none of it can be closed by further code review alone.
