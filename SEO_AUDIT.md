# SEO_AUDIT.md

## Coverage
24-26 of ~28 routes carry per-page `metadata`/`generateMetadata` (title, description, canonical). Home inherits root [layout.jsx](src/app/layout.jsx) defaults (fine — it's the primary landing page and root metadata is written for it specifically). `jobs/page.jsx` uses `generateMetadata()` (async, correctly missed by a naive grep for `export const metadata` earlier — verified present, not a gap).

## Structured data (schema.org)
20 files carry JSON-LD schema — `Organization`, `Course`-shaped data, and question/answer blocks. Spot-checked:
- [utils/seo.js](src/utils/seo.js) — central `Organization` schema with logo, telephone, address — correct and reused site-wide.
- Course pages — each carries `PostalAddress` schema matching the real head-office address.
- FAQ-style `acceptedAnswer`/Q&A blocks present on course + blog pages (e.g. [dgca-ground-school-guide/page.jsx:42](src/app/blog/dgca-ground-school-guide/page.jsx:42)) — worth validating these are wrapped in a proper `FAQPage` schema type (not just Q&A shaped objects) with Google's Rich Results Test once live; not something static grep can confirm is spec-valid JSON-LD.

## Sitemap / robots
- `robots.js` and `sitemap.js` both exist and are wired correctly (Next.js file-convention routes, auto-served at `/robots.txt` and `/sitemap.xml`).
- 🔴 **Bug found and fixed this session**: sitemap referenced `cpl-ground-classes` (redirect-only slug, wastes crawl budget) and `cabin-crew` (**no matching route or redirect — was a hard 404 entry in your own sitemap**), and was missing 6 real course pages entirely (`ground-school`, `instrument-rating`, `multi-engine-rating`, `private-pilot-license`, `aviation-english-icao`, `flight-dispatcher` never appeared in the sitemap at all despite having live pages + metadata). All fixed — [sitemap.js](src/app/sitemap.js).

## Redirects
`next.config.js` redirect table: 9 legacy-slug → current-slug 301s, plus 3 domain-consolidation redirects (`.academy` variants → `.in`). All single-hop, no loops, no chains found.

## Internal linking
- Fixed one stale internal link (blog → old course slug) this session — see CODE_FIX_REPORT.md.
- Course comparison table, supporting-course cards, and blog CTAs all link to canonical current slugs after these fixes.

## Heading hierarchy
Spot-checked several pages (courses/page.jsx, contact, about) — consistent `h1` → `h2` → `h3` pattern, no skipped levels found in the pages read this session. Not exhaustively checked across all 28 routes.

## Image ALT
Spot-checked logo and content `<img>` tags — `alt` present with descriptive text ("Airborne Aviation Academy", course titles). No missing-alt pattern found in the files reviewed.

## Not verifiable without live tooling
- Actual Rich Results / schema validation (needs Google's live validator against the deployed site)
- Live title/description rendering in SERPs (cosmetic truncation, pixel width) — needs a live crawl tool
- Whether the courses-page metadata (`title`/`description` mentioning specific courses) matches content that's actually rendering, given the empty-flagship-banner issue in production right now (Category C, see INFRASTRUCTURE_REPORT.md) — SEO metadata is fine, but a search engine crawling the live broken state would index a page whose visible content doesn't match its own `<title>`/description as well as it should. This resolves itself once the courses API issue is fixed.
