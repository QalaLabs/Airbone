# LINK_AUDIT.md

Internal links verified by cross-referencing every `href="/courses/..."` against actual route folders + `next.config.js` redirect table. External/social links spot-verified live via fetch where possible.

## Social / external — live-checked
| Link | Location | Status | Detail |
|---|---|---|---|
| LinkedIn — `linkedin.com/company/airborneaviationacademy` | [PremiumFooter.jsx:33](src/components/PremiumFooter.jsx:33) | 🔴 **Confirmed 404** | Live-fetched, server returned real HTTP 404. Client's original complaint is correct. Searched web for the correct company page — no verified official "Airborne Aviation Academy, Dwarka" LinkedIn company page found (one similarly-named result is a *different* academy in Gondia; Capt. Navrang Singh's personal profile exists but that's not a company page). **Not fixed — need the correct URL from you, or confirmation to remove the broken link until one exists** |
| Facebook — `facebook.com/airborneaviationacademy` | [PremiumFooter.jsx:31](src/components/PremiumFooter.jsx:31) | ✅ Loads | Live-fetched, page title resolves to "Airborne Aviation Academy \| Delhi" — real, correct page |
| Instagram — `instagram.com/airborneaviationacademy` | [PremiumFooter.jsx:32](src/components/PremiumFooter.jsx:32) | ⚪ Inconclusive | Instagram blocks unauthenticated automated fetches (shows placeholder icons only, no profile data) — could not confirm live from here either way. Recommend a manual check in a normal browser |
| YouTube — `youtube.com/@airborneaviationacademy` | [PremiumFooter.jsx:34](src/components/PremiumFooter.jsx:34) | ⚪ Not checked | Not fetched this pass — low risk, same pattern as above if you want it verified |
| Google Maps embed + directions links | [contact/page.jsx](src/app/contact/page.jsx), [GlobalRouteMap.jsx](src/components/GlobalRouteMap.jsx) | ✅ | Standard `google.com/maps` embed/query URLs, well-formed |
| `tel:`/`wa.me` links | 30+ occurrences across the site | ✅ Consistent | All resolve to the same real number `+919953777320` except the one bug below |
| `mailto:info@airborneaviation.in` | Contact, footer, terms, privacy, refund pages | ✅ Consistent | Same address everywhere |

## Internal — course routes
- Every `/courses/[slug]` href checked against the 14 actual route folders — all current hrefs resolve correctly **after** this session's fixes:
  - `blog/dgca-ground-school-guide/page.jsx` was linking `/courses/cpl-ground-classes` (old slug, worked only via redirect) → ✅ fixed to `/courses/commercial-pilot-license-cpl`
  - `sitemap.js` was listing `cpl-ground-classes` (redirect-only) and `cabin-crew` (**no redirect exists for this one — was a hard 404 in the sitemap**) → ✅ both fixed
- `next.config.js` redirect table covers 9 legacy slugs → all map to real current routes, no redirect chains (single hop each), no redirect loops found.

## Static/legal pages
`/privacy`, `/terms`, `/refund-policy`, `/dgca-compliance` — all exist as real routes, all cross-link correctly from footer.

## Not verifiable from here
- Full 200-status crawl of every page (would need the site actually redeployed first — see DEPLOYMENT_REPORT.md, several pages currently render empty/fallback content in production even though the route itself returns 200)
- Custom 404 page — **none found in the codebase** (no `not-found.jsx`), site falls back to Next.js's default 404. Low-priority polish item, not a broken-link bug, but worth a branded 404 before final launch.
