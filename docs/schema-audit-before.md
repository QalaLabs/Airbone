# Schema.org Audit - Before Implementation

**Site:** Airborne Aviation Academy (`https://www.airborneaviation.in`)  
**Audit date:** 2026-07-27  
**Scope:** Public Next.js App Router site (`src/app/**`)

---

## Executive summary

| Metric | Before |
|--------|--------|
| Central schema utility | `src/utils/seo.js` (5 helpers only) |
| `@id` entity linking | **None** |
| Duplicate Organization graphs | **Yes** (LocalBusiness + EducationalOrganization on homepage) |
| SearchAction | Absent (correct - no site search) |
| AggregateRating / Review JSON-LD | Absent (correct - no verified star ratings) |
| VideoObject | Absent (no page embeds) |
| Knowledge graph completeness | **Low** |
| AI discoverability score | **4/10** |

---

## Existing schemas (inventory)

### Central helpers (`src/utils/seo.js`)

| Helper | Type | Issues |
|--------|------|--------|
| `getLocalBusinessSchema` | LocalBusiness | No `@id`; `priceRange: ₹₹₹`; geo slightly inconsistent with contact map |
| `getEducationalOrgSchema` | EducationalOrganization | Duplicate of LocalBusiness entity; description used “India's most trusted”; nested Person without `@id` |
| `getCourseSchema` | Course + CourseInstance + Offer | Hardcoded `startDate: 2026-07-01`; weak provider (`sameAs` misused as site URL) |
| `getBreadcrumbSchema` | BreadcrumbList | OK structurally; no `@id` |
| `getFAQSchema` | FAQPage | Contained **100% DGCA exam pass rate** claim; used on `/resources` without matching visible FAQ UI |

### Per-page inline schemas

Nearly every static course page and blog post defined its own Course/FAQ/Article objects with duplicated org address strings and no shared `@id`.

---

## Page-by-page status (before)

| Page | Types | Status | Errors / Warnings | Rich Results |
|------|-------|--------|-------------------|--------------|
| `/` | LocalBusiness, EducationalOrganization, FAQPage | Partial | Duplicate org entities; no WebSite; no Breadcrumb | LocalBusiness + FAQ possible |
| `/about` | - | Missing | No Org/Person schema | None |
| `/contact` | LocalBusiness, BreadcrumbList | Partial | Duplicate org vs home | LocalBusiness |
| `/courses` | BreadcrumbList, ItemList | OK-ish | ItemList URLs not `@id`-linked | ItemList |
| `/courses/*` (static) | Course, FAQPage, BreadcrumbList | Partial | Provider not canonical; some descriptions had 100% claims; inconsistent CourseInstance | Course + FAQ |
| `/courses/[slug]` | Course, BreadcrumbList | Partial | Hardcoded startDate via helper | Course |
| `/blog` | BreadcrumbList | Thin | No Collection/WebPage | Breadcrumb |
| `/blog/*` | Article, FAQPage, BreadcrumbList | Partial | Author/publisher not `@id`-linked | Article + FAQ |
| `/resources` | FAQPage | **Invalid pattern** | FAQ not visible on page | Risk of FAQ rich-result mismatch |

---

## Checklist findings

| Issue | Found? | Notes |
|-------|--------|-------|
| Duplicate Organization schemas | ✔ | Home LocalBusiness + EducationalOrganization |
| Duplicate Person schemas | ✔ | Nested founder repeated per page without `@id` |
| Duplicate Breadcrumbs | ✔ | Multiple independent BreadcrumbList docs (no shared `@id`) |
| Invalid URLs | Partial | Absolute HTTPS mostly OK |
| Invalid `@id` usage | ✔ | No `@id` at all |
| Inconsistent entity references | ✔ | Address string variants; provider inline copies |
| Orphaned entities | ✔ | Course/FAQ disconnected from Org |
| Hardcoded dates | ✔ | `startDate: 2026-07-01` in helper |
| Fake reviews | ✖ in schema | UI testimonials exist; **no** AggregateRating fabricated (good) |
| Invalid ratings | ✖ | N/A |
| Invalid prices | Partial | Cabin crew `price: 0` scholarship Offer risk |
| Missing images | ✔ | Few ImageObject nodes |
| Missing videos | ✔ | No VideoObject (no embeds - skip) |
| Missing publisher | Partial | Articles had publisher but not `@id` |
| Missing author | Partial | Person name only |
| Missing logo | Partial | URL string; not ImageObject `@id` |
| Missing sameAs | ✔ | Social profiles not in Org schema |
| Broken SearchAction | ✖ | Not present |
| Broken Offer | Partial | Some offers incomplete |

---

## Knowledge graph completeness (before)

```
Organization ──✕── Founder
     │
     ✕── Courses (inline copies)
     ✕── Services
     ✕── Articles
     ✕── Website
```

**Score: 2/10** - isolated blobs, not a graph.

---

## AI discoverability score (before): **4/10**

Strengths: Course + FAQ presence; consistent brand name.  
Gaps: no `@id` graph, weak Person authority, no Service nodes, risky absolute marketing claims in schema text, no WebSite hub.
