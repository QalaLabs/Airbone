# RESPONSIVE_MATRIX.md

**Honesty note:** No live browser/device lab was available for this pass — this is a static-code audit (grep for overflow/width/margin anti-patterns across all breakpoints), not a rendered visual check at all 12 widths. Confirmed-live bugs (from your screenshots, verified against code) are marked accordingly; everything else is "swept, nothing found in code" — real confidence, but not a substitute for a device screenshot pass after redeploy.

## Global overflow guards (apply to all breakpoints)
- `body { overflow-x: clip }` set globally ([index.css:70](src/index.css:70)) + reinforced at a breakpoint ([index.css:1328-1333](src/index.css:1328)). This prevents horizontal *scrolling* site-wide as a safety net, but can turn an overflow bug into silent visual *clipping* instead — worth watching for after the fixes below go live.

## Confirmed issues (from your screenshots + code)
| Breakpoint(s) | Page | Issue | Status |
|---|---|---|---|
| ~375-390px (mobile) | Home — route map section | Header text overlapped by alumni sidebar panel | ✅ Fixed this session — [GlobalRouteMap.jsx](src/components/GlobalRouteMap.jsx) |
| All | Home — `?mode=3d` | `width:100vw` overflow trap | ✅ Fixed this session — [page.jsx:2757](src/app/page.jsx:2757) |
| Mobile | Contact — map card | Overlapping annotation on address block | Same negative-margin family of bug as route map; contact page card itself (`contact/page.jsx:100-166`) uses no negative margins or absolute positioning — swept clean. If still visible after redeploy, it may be the same stale-deploy issue as the address text (see DEPLOYMENT_REPORT.md) rather than a new bug |

## Swept, no code issue found (static analysis)
- Negative margins repo-wide: only the route-map bug above; rest are framer-motion `viewport margin` config (not layout-affecting).
- Fixed pixel widths (`\d{3,4}px`): 78 occurrences across 7 files — mostly icon sizes, avatar dimensions, max-width caps on cards inside flex/grid containers (safe pattern, not overflow-causing). None found forcing a fixed width wider than mobile viewport.
- Tables: only one data table in the codebase ([courses/page.jsx:246-289](src/app/courses/page.jsx:246)) — already wrapped in `overflow-x: auto` with `minWidth: 800px` on the table itself, correct pattern for horizontal-scroll-on-mobile rather than clipping.
- Horizontal scroll-snap carousels (course cards on mobile, etc.) — 4 instances found with proper `overflow-x: auto; scroll-snap-type: x mandatory` — intentional, correct pattern, not a bug.
- Sticky mobile CTA (`StickyMobileCTA.jsx`) — fixed-position 3-button bar (Call/WhatsApp/Book Demo), no overlap-causing CSS found against footer or content in a static read; confirm visually once other fixes are live, since it's exactly the kind of element that silently overlaps last-section CTAs on short mobile viewports.
- `safe-area-inset` (notch/home-indicator support): **not found anywhere in the codebase.** Not necessarily a bug (depends on whether the sticky CTA needs it), but worth checking on an actual iPhone with a home indicator — `StickyMobileCTA.jsx` is a fixed-bottom element and a common spot for safe-area padding to matter.

## Cannot verify without live device/browser pass
- Actual pixel-level clipping/cropping at each of the 12 requested widths (320/360/375/390/412/430/768/820/1024/1280/1440/1920)
- Grid reflow correctness at 768/820/1024 (tablet range) — no code smell found, but tablet breakpoints are the least-screenshotted range and hardest to verify statically
- CTA button alignment under real font metrics (system font fallback vs. loaded webfont can shift line lengths)

## Recommendation
Once the deployment gap (DEPLOYMENT_REPORT.md) is closed and these fixes are live, a real screenshot pass at 320/375/768/1024/1440 (5 representative widths, not all 12 — diminishing returns beyond that) would close out this phase properly.
