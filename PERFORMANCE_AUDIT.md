# PERFORMANCE_AUDIT.md

**Honesty note:** No Lighthouse/PageSpeed/WebPageTest run this session (no live browser access). CLS, LCP, INP, TTFB are runtime metrics that cannot be produced from source code alone — anything below is a *code-level risk factor*, not a measured score. Do not treat this as a Lighthouse report.

## Confirmed via code
| Area | Finding | Risk |
|---|---|---|
| Fonts | `next/font` used in [layout.jsx](src/app/layout.jsx) | ✅ Good — self-hosted/optimized font loading avoids FOUT/FOIT-driven CLS |
| Image optimization | `next/image` used in only 2 places (`page.jsx`, one `.tsx` component); every logo, course-card, and content image found elsewhere uses plain `<img>` | 🟡 Real gap — plain `<img>` skips Next's automatic responsive `srcset`, format conversion (AVIF/WebP), and lazy-loading defaults. Course-card images ([courses/page.jsx:153](src/app/courses/page.jsx:153)) are a good candidate — they're below the fold and currently unoptimized |
| Homepage bundle | `src/app/page.jsx` is **136KB** in a single file | 🟡 Real gap — a monolithic client-heavy homepage file this large is a bundle-size and maintainability risk; `Home3DSection` is at least already `dynamic()`-imported, which is the right pattern — the rest of the page isn't split the same way |
| ISR / caching | `revalidate: 60` on all `public-proxy` fetches | ✅ Reasonable — shields upstream admin API, but see INFRASTRUCTURE_REPORT.md for the failure-mode risk (empty result gets cached too) |
| Static assets | Logo files are small (12-16KB each `.webp`/`.png`), favicons appropriately sized (1-16KB), largest asset is `android-chrome-512x512.png` at 60KB | ✅ No oversized static assets found |
| Redirects | Domain-consolidation + legacy-slug redirects in `next.config.js` are single-hop, no chains | ✅ Good — redirect chains cost TTFB, none found |
| CSS | Multiple `!important`-heavy inline `<style dangerouslySetInnerHTML>` blocks found (e.g. [courses/page.jsx:222-244](src/app/courses/page.jsx:222)) alongside a large `index.css` | 🟡 Minor — inline injected `<style>` per-page is a mild anti-pattern for CSS dedup/caching, low impact given the site is already mostly inline-style-driven by design |

## Cannot verify without live tooling
- LCP / CLS / INP / TTFB actual measurements
- Unused JS/CSS (needs a coverage tool against the running bundle)
- Real bundle size after tree-shaking (136KB source ≠ 136KB shipped JS)
- Whether `next/font` + font-display strategy actually prevents layout shift in practice

## Recommendation
Once production is redeployed and caught up to `main` (see DEPLOYMENT_REPORT.md), run an actual Lighthouse/PageSpeed Insights pass against the live URL — that's the only way to get real LCP/CLS/INP numbers. The two structural risk factors worth fixing before then are: (1) switch course-card and logo `<img>` tags to `next/image`, (2) consider splitting `page.jsx` into smaller server/client component chunks. Neither was auto-fixed this session — both are larger refactors than the surgical bug fixes done so far and deserve a deliberate pass rather than being bundled into this audit.
