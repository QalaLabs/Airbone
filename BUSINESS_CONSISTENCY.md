# BUSINESS_CONSISTENCY.md

Grepped every business-identity fact across the entire `src` tree for mismatches.

| Field | Consistent? | Detail |
|---|---|---|
| Academy name | ✅ | "Airborne Aviation Academy" uniform everywhere |
| Phone number | 🔴 **Was inconsistent, fixed this session** | Real number `+91 9953 777 320` used 30+ times correctly. Two components (`App.jsx:400`, `Home3DSection.jsx:414`) had a **fake placeholder number `+91 98765 43210`** hardcoded as displayed contact info. `Home3DSection.jsx` is live (rendered via the `?mode=3d` route) — fixed to the real number. `App.jsx` is dead code (see LOGO_AUDIT.md / not part of the Next.js build, only referenced by an unused `main.jsx` Vite entrypoint) — left as-is, flagged for cleanup |
| Secondary phone | ✅ | `+91 9818 282 209` appears once as a secondary line on Contact page only ([contact/page.jsx:31](src/app/contact/page.jsx:31)) — consistent, not a conflict |
| Email | ✅ | `info@airborneaviation.in` uniform across contact, footer, terms, privacy, refund pages |
| Address | 🟡 See DEPLOYMENT_REPORT.md | Repo is internally consistent (`E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka, New Delhi — 110075` everywhere, including schema.org JSON-LD on every course page). Live-site mismatch is a stale-deploy issue, not a repo inconsistency |
| PIN code | ✅ | `110075` consistent everywhere it appears (head office); registered office correctly shown as a different address/PIN (`110078`) on Contact page only, clearly labeled "Registered Office" vs "Head Office" — not a bug, intentional distinction |
| WhatsApp number | ✅ | Same `919953777320` used in every `wa.me` link |
| LinkedIn | 🔴 | See LINK_AUDIT.md — confirmed dead link, correct URL unknown, needs your input |
| Instagram / Facebook / YouTube | ✅ / ✅ / ⚪ | Facebook verified live. Instagram inconclusive (bot-blocked). YouTube not checked. See LINK_AUDIT.md |
| Copyright | ✅ | `© {new Date().getFullYear()}` — dynamic, always current year, no hardcoded stale year found |
| Student count | 🔴 **Was inconsistent, fixed this session** | `2,500+` used everywhere except [GlobalRouteMap.jsx:98](src/components/GlobalRouteMap.jsx:98) which said `5000+` — fixed |
| Years of legacy | ✅ | "15+ Years" consistent across every occurrence (App.jsx, Home3DSection.jsx, ProgramGrid.jsx, SceneOverlays.jsx) |
| Airline partners count | ✅ | "50+" consistent (only appeared in the one stat card checked, no conflicting figure found elsewhere) |
| Course durations | ✅ | Cross-checked the course comparison table against individual course pages' own duration copy — matching (e.g. CPL "12-18 months" consistent) |
| Course names | ✅ | Canonical names consistent between nav, comparison table, and individual pages after this session's slug fixes |
| Fee references | ✅ | Spot-checked CPL (₹2,70,000), cabin crew tiered pricing (₹5K/₹35K/₹65K) — consistent between FAQ schema, sidebar price, and body copy on the same pages |
| Batch info | ✅ | "Max 25 students," "July 2026 batch" consistent across homepage, course pages, 3D mode panel |

## Summary
2 real inconsistencies found and fixed (phone number in Home3DSection, student count in GlobalRouteMap). Everything else checked is either already consistent or a known deployment/link issue tracked in other reports.
