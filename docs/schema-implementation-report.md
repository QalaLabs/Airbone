# Schema.org Knowledge Graph — Implementation Report

**Date:** 2026-07-27  
**Project:** Airborne Aviation Academy  
**Status:** Production-ready (build passing)

---

## Before → After

| Area | Before | After |
|------|--------|-------|
| Architecture | Scattered inline JSON-LD | Central `@graph` builders in `src/lib/schema/` |
| Entity IDs | None | Stable `@id` for Org, Person, Website, Place, Courses, Services, FAQ, Articles |
| Homepage | Duplicate LocalBusiness + EducationalOrganization | Single `EducationalOrganization` + `LocalBusiness` multi-type node |
| About | No schema | Full Org + Founder Person + leadership + Services |
| SearchAction | N/A | Explicitly **not** added (no internal search) |
| Reviews | UI quotes only | **No** AggregateRating / Review (no verified stars) |
| VideoObject | None | Skipped (no YouTube embeds on pages) |
| Risky claims in schema | 100% pass rate, “most trusted” | Removed / sanitized |

---

## Schemas implemented

| Type | Where | Notes |
|------|-------|-------|
| EducationalOrganization + LocalBusiness | Sitewide via `@id` | Canonical org |
| Person (Capt. Navrang Singh) | Sitewide `@id` | Founder / instructor |
| Person (Deepak Aggarwal) | Home / About | Co-founder |
| WebSite | Sitewide | No SearchAction |
| WebPage | Most pages | Links to Website + mainEntity |
| BreadcrumbList | Most pages | Stable `@id` |
| Course + CourseInstance + Offer | Course pages | Linked provider/instructor |
| FAQPage | Pages with visible FAQs | Matches UI |
| Article | Blog + flying guide | Author/publisher `@id` |
| ItemList | `/courses` | Course stubs via `@id` |
| ImageObject | Logo + primary images | Production assets only |
| Service | Home / About / Contact | Counselling & guidance services |
| Place | Dwarka centre | Shared location node |
| OfferCatalog | Home / courses index | Program groupings |
| EducationalOccupationalCredential | Select courses | Where credential wording is factual |
| Occupation | Founder | `hasOccupation` |

**Not implemented (with reason):**

| Type | Reason |
|------|--------|
| SearchAction | No internal search endpoint |
| AggregateRating / Review | Testimonials lack verified star ratings |
| VideoObject | No embedded videos with metadata |
| Event | No dated public events found |
| Speakable | Not appropriate for most pages |

---

## Knowledge graph entity map

```
WebSite (#website)
  └── publisher → Organization (#organization)
        ├── founder → Person (#person-capt-navrang-singh)
        ├── employee → Person (#person-deepak-aggarwal)
        ├── logo → ImageObject (#logo)
        ├── location → Place (#place-dwarka)
        ├── makesOffer → Service (#service-*)
        ├── hasOfferCatalog → OfferCatalog
        └── provides → Course (#course-*)
              ├── hasCourseInstance → CourseInstance
              ├── offers → Offer
              └── instructor → Person (founder)

WebPage (#webpage)
  ├── isPartOf → WebSite
  ├── about → Organization
  ├── mainEntity → Course | Article | Organization | Person
  └── breadcrumb → BreadcrumbList

FAQPage / Article → author/publisher → Person / Organization
```

---

## Files modified (primary)

### New

- `src/lib/schema/constants.js` — verified org/founder facts
- `src/lib/schema/ids.js` — `@id` builders
- `src/lib/schema/organization.js` — Org, Person, Place, Services, Logo
- `src/lib/schema/builders.js` — Course, FAQ, Article, Breadcrumb, sanitize
- `src/lib/schema/graph.js` — page-level `@graph` composers
- `src/lib/schema/courseRegistry.js` — course schema registry
- `src/lib/schema/index.js` — public API
- `src/components/JsonLd.jsx` — XSS-safe JSON-LD renderer
- `docs/schema-audit-before.md`
- `docs/schema-claim-verification.md`
- `docs/schema-implementation-report.md`
- `docs/schema-validation-checklist.md`

### Updated

- `src/utils/seo.js` — compatibility layer; FAQ claims cleaned
- `src/app/page.jsx` — unified home graph; FAQ claim softened
- `src/app/about/page.jsx` — about graph
- `src/app/contact/page.jsx` — contact graph
- `src/app/courses/page.jsx` — courses index graph
- `src/app/courses/**/page.jsx` — course graphs (all static courses)
- `src/app/courses/[slug]/page.jsx` — dynamic course graph
- `src/app/blog/**` — article graphs
- `src/app/resources/ResourcesClient.jsx` — resources graph (no invisible FAQ)

---

## Google / AI impact

| Signal | Impact |
|--------|--------|
| Entity resolution | Stronger — stable `@id` + `sameAs` social/maps |
| Course rich results | Improved — Offer + CourseInstance + provider link |
| FAQ rich results | Safer — visible FAQs only; claims cleaned |
| Knowledge Graph readiness | Improved — Org↔Founder↔Course↔Service mesh |
| AI Search / answer engines | Better topical binding via `knowsAbout` + linked courses |
| Risk reduction | High — removed absolute pass-rate claims from schema |

---

## Performance impact

| Concern | Result |
|---------|--------|
| Bundle size | Negligible — plain objects, no client schema libraries |
| Hydration | Home is client; graph built at module scope (SSR HTML includes JSON-LD) |
| Duplicate rendering | Single `<JsonLd>` per page replaces 2–3 script tags |
| CLS / blocking JS | None — static JSON-LD scripts |

`npm run build` completed successfully (exit 0).

---

## Future recommendations

1. Content pass: align About/Home UI “100%” / “2,500+” stats with verifiable evidence or softer wording.  
2. When real star ratings exist (Google Business / verified CMS), add Review + AggregateRating carefully.  
3. When YouTube embeds ship with uploadDate/duration, add VideoObject.  
4. Publish dated seminars → Event schema.  
5. Optional: expose a `/schema` debug route for QA (non-indexed).  
6. Wire CI check: parse all prerendered HTML for JSON-LD syntax + duplicate `@id`.
