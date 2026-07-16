# LOGO_AUDIT.md

No images edited — report only, per instruction.

## Master assets
| File | Dimensions | Size | Format |
|---|---|---|---|
| `public/logo-primary.png` | 298×144 | 15.4 KB | PNG (navy/color mark, for light backgrounds) |
| `public/logo-primary.webp` | 298×144 | 11.7 KB | WebP (same mark, modern-format version) |
| `public/logo-white.png` | 298×144 | 15.3 KB | PNG (white mark, for dark backgrounds) |
| `public/logo-white.webp` | 298×144 | 11.2 KB | WebP (same, modern-format version) |

**No SVG source exists anywhere in the repo.** Both marks are flat raster only — the airplane "shoosh" line and the "O" in "AIRBORNE" are baked into pixel data, not vector paths or separate layers/elements. This is why the color-change request can't be done as a code edit.

## Every component/page referencing these files
| File | Logo used | Context |
|---|---|---|
| [Header.jsx:29](src/components/Header.jsx:29) | `logo-primary.webp` | Desktop nav bar |
| [Header.jsx:92](src/components/Header.jsx:92) | `logo-white.webp` | Mobile drawer header |
| [App.jsx:87](src/App.jsx:87) | `logo-white.webp` | Dead file — not part of Next build, see Deployment Readiness |
| [Home3DSection.jsx:102](src/components/Home3DSection.jsx:102) | `logo-white.webp` | `?mode=3d` easter-egg page |
| [Navigation.jsx:57](src/components/Navigation.jsx:57) | `logo-white.webp` | Alt nav component |
| [page.jsx:94](src/app/page.jsx:94) | `logo-primary.webp` | Homepage header |
| [page.jsx:181](src/app/page.jsx:181) | `logo-white.webp` | Homepage mobile drawer |
| [page.jsx:1966](src/app/page.jsx:1966) | `logo-white.webp` | Homepage footer area |
| [PremiumFooter.jsx:120,234](src/components/PremiumFooter.jsx:120) | `logo-white.webp` | Site-wide footer (×2 — main + a secondary spot) |
| [seo.js:47](src/utils/seo.js:47) | `logo-primary.png` | Organization JSON-LD schema `logo` field |
| [blog/dgca-ground-school-guide/page.jsx:28](src/app/blog/dgca-ground-school-guide/page.jsx:28), [how-to-become-pilot-india/page.jsx:28](src/app/blog/how-to-become-pilot-india/page.jsx:28), [pilot-salary-india/page.jsx:28](src/app/blog/pilot-salary-india/page.jsx:28) | `logo-primary.png` | Article `ImageObject` schema |

**13 total references, but only 4 physical files.** Every usage is one of the two master marks — edit each file once, every placement updates automatically on next build. No per-component logo duplication to worry about.

## Impact of replacement
- Low blast radius: since every reference points to the same 4 files by URL path, replacing the file contents in place (same filenames, same dimensions) requires **zero code changes** — just swap the pixel data.
- Schema.org `logo` fields (`seo.js`, 3 blog pages) point at the `.png` — make sure both `.png` and `.webp` variants get the color edit, not just one, or the site and its structured-data logo will visually diverge.
- 298×144 is a fairly low-res source for a logo mark (roughly 2.7x pixel density at typical 108px display height) — fine for current display sizes seen in the code (36-42px tall), but worth knowing if any future placement needs to render larger.

## Recommended replacement workflow
1. Get (or recreate) a vector/high-res source with the airplane shoosh and the "O" as isolated, editable elements — ideally an SVG or layered file, not a repeat of flat-raster-only.
2. Recolor only those two elements to the brand red, keep everything else (wordmark, other strokes) unchanged, matching the color-on-dark logo already used sitewide (`--red` CSS variable, `#DB241E` per [GlobalRouteMap.jsx](src/components/GlobalRouteMap.jsx) usage — recommend matching this exact hex for consistency with the rest of the site's red accents).
3. Export both a light-background version (→ `logo-primary.png`/`.webp`) and dark-background version (→ `logo-white.png`/`.webp`) at the same 298×144 canvas, same filenames.
4. Replace in place — no code/PR needed beyond the asset swap itself.
5. Spot-check the 13 usage sites above (particularly the JSON-LD schema ones — Google caches these, may take time to refresh in search results after the swap).

Holding for your go-ahead before touching the actual pixels.
