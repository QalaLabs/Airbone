# Schema Validation Checklist

**Site:** Airborne Aviation Academy  
**Date:** 2026-07-27  
**Target:** Zero JSON-LD syntax errors; zero avoidable Google rich-result errors; no fabricated claims

---

## Automated / build

| Check | Status | Notes |
|-------|--------|-------|
| `npm run build` | ✅ | Passed (Next.js 15.5.19) |
| Duplicate `@id` in home/about graphs | ✅ | Fixed (founder vs leadership) |
| JSON-LD XSS escape (`<` → `\u003c`) | ✅ | `JsonLd.jsx` |
| No SearchAction dead endpoint | ✅ | Intentionally omitted |
| FAQ only when visible | ✅ | Resources FAQ schema removed |

---

## Entity coverage

| Entity | Status | Notes |
|--------|--------|-------|
| Organization (EducationalOrganization + LocalBusiness) | ✅ | `#organization` |
| Person (Capt. Navrang Singh) | ✅ | `#person-capt-navrang-singh` |
| Course | ✅ | Registry + page graphs |
| FAQPage | ✅ | Visible FAQs only |
| Article / BlogPosting | ✅ | Article with author/publisher `@id` |
| BreadcrumbList | ✅ | |
| ImageObject | ✅ | Logo + primary images |
| VideoObject | ⏭️ | Skipped - no embeds |
| Service | ✅ | Counselling / guidance services |
| Review | ⏭️ | Skipped - no star ratings |
| AggregateRating | ⏭️ | Skipped - do not fabricate |
| Event | ⏭️ | Skipped - no dated events |
| LearningResource | ⏭️ | Deferred - Course covers primary need |
| EducationalOccupationalCredential | ✅ | Select courses |
| WebSite | ✅ | No SearchAction |
| Offer / OfferCatalog | ✅ | |

---

## Google Rich Results readiness

| Feature | Status | Action if validating live |
|---------|--------|---------------------------|
| Organization | ✅ | Test URL in Rich Results Test |
| Course | ✅ | Sample CPL + Ground School URLs |
| FAQ | ✅ | Home + course URLs with visible FAQs |
| Article | ✅ | Blog post URLs |
| Breadcrumb | ✅ | Any inner page |
| Local business | ✅ | Via multi-type Org on contact/home |

**Manual QA (recommended before deploy):**

1. [Google Rich Results Test](https://search.google.com/test/rich-results) - `/`, `/about`, `/contact`, `/courses/commercial-pilot-license-cpl`, `/blog/how-to-become-pilot-india`  
2. [Schema.org Validator](https://validator.schema.org/) - paste View Source JSON-LD  
3. Confirm View Source contains `application/ld+json` (SSR)  
4. Confirm no duplicate Organization names as separate unrelated entities  
5. Confirm FAQ questions in DOM match FAQ schema text exactly  

---

## Claim safety

| Check | Status |
|-------|--------|
| No 100% pass rate in schema | ✅ |
| No “most trusted” in Org description | ✅ |
| No fabricated AggregateRating | ✅ |
| Prices match on-page fees where Offered | ✅ |
| `sameAs` uses real social/maps URLs from footer | ✅ |

---

## Sign-off

| Role | Verdict |
|------|---------|
| Schema / SEO | Ready for production deploy after live Rich Results spot-check |
| Engineering | Build green; centralized maintainable graph |
| Compliance | Schema claims sanitized; UI marketing may still need separate pass |
