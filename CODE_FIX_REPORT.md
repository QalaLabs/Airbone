# CODE_FIX_REPORT.md

All fixes below applied direct to `main` working tree this session. Category A only — pure code, no deploy/infra dependency.

| # | Issue | File | Fix |
|---|---|---|---|
| 1 | Student count wrong (`5000+` vs branding `2,500+`) | [src/components/GlobalRouteMap.jsx:98](src/components/GlobalRouteMap.jsx:98) | Value → `2,500+` |
| 2 | Mobile text-overlap on route-map section (header text vs alumni sidebar) | [src/components/GlobalRouteMap.jsx:463-464,766](src/components/GlobalRouteMap.jsx:463) | Root cause: `.grm-map-outer` hardcoded `flex-row` + fixed `290px` sidebar + `-2rem` negative top margin, zero media-query/responsive handling anywhere in component. Prior fix (commit `30d05ba`) bumped padding but never changed layout direction — bug persisted. Now: `flexDirection` switches to `column` and negative margin drops to `1rem` when `isMobile` (existing state, <769px) |
| 3 | `width: 100vw` horizontal-scroll trap (3D mode wrapper) | [src/app/page.jsx:2757](src/app/page.jsx:2757) | `100vw` → `100%` (100vw includes scrollbar gutter width, classic overflow-x cause) |
| 4 | Sitemap listing 404/redirect-hop slugs | [src/app/sitemap.js](src/app/sitemap.js) | `cpl-ground-classes` → `commercial-pilot-license-cpl`, `cabin-crew` → `cabin-crew-training` (was pointing at a slug with no matching route AND no redirect rule — hard 404 for crawlers). Also added 6 course routes that existed as real page folders but were entirely absent from sitemap: `ground-school`, `instrument-rating`, `multi-engine-rating`, `private-pilot-license`, `aviation-english-icao`, `flight-dispatcher` |
| 5 | Internal link using old redirecting slug | [src/app/blog/dgca-ground-school-guide/page.jsx:163](src/app/blog/dgca-ground-school-guide/page.jsx:163) | `/courses/cpl-ground-classes` → `/courses/commercial-pilot-license-cpl` (was working via 301 redirect, wastes crawl budget + link equity) |
| 6 | Fake placeholder phone number live on `?mode=3d` page | [src/components/Home3DSection.jsx:414](src/components/Home3DSection.jsx:414) | `+91 98765 43210` → real number `+91 9953 777 320` (found via full business-info consistency sweep, see BUSINESS_CONSISTENCY.md) |
| 7 | Form fields had zero accessible name (WCAG 1.3.1/4.1.2) | [src/components/FormField.jsx](src/components/FormField.jsx) | Added `aria-label` to `<input>` and `<select>` — single shared component, fixes every form sitewide. See FORMS_AUDIT.md / ACCESSIBILITY_AUDIT.md |

## Swept, no code issue found
- Negative margins repo-wide: only other hit was a framer-motion `useInView` viewport margin (not layout-affecting).
- `100vw` usage: only the one instance above; the other two matches were Next `<Image sizes>` hints (correct usage, not a bug).
- `<img>` alt text: spot-checked, all logo/content images carry `alt`.
- Per-page `metadata`/`generateMetadata` + canonical: present on 24-26 of ~28 routes (home inherits root layout default, jobs uses `generateMetadata`, dgca-compliance/refund-policy checked individually — all present).
- `overflow-x` handling: `body { overflow-x: clip }` set globally in [index.css:70](src/index.css:70), reinforced at breakpoint 1328. Prevents scroll but can visually clip — worth a live-device check once production catches up to main (see DEPLOYMENT_REPORT).
- Nav/header: `aria-label`/`role` attributes present on both `Header.jsx` and `Navigation.jsx`.
- `robots.js` and `sitemap.js` both exist and are wired correctly.
- No orphaned imports of the dead `page.jsx.backup` file — confirmed unused, left untouched (not deleting without your say-so).

## Not fixable as pure code (see other reports)
- Courses/jobs/blog data emptiness → Category C (infra)
- Address text, prior overlap fix not reflecting live → Category B (deploy)
- Logo recolor → asset edit, prepared not executed, see LOGO section in FINAL_CLIENT_REPORT
- FAQ PCM/disease wording → not found in repo; may be stale-deploy or infra-driven, unconfirmed
