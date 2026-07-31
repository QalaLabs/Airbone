# Claim Verification Report - Schema Safety

**Date:** 2026-07-27  
**Rule:** Marketing claims must not be fabricated. Unverified absolute claims must not appear in Schema.org JSON-LD.

---

## Claims inventory

| Claim | Where found | Evidence | Supported? | Publicly visible? | Safe for Schema? | Recommendation |
|-------|-------------|----------|------------|-------------------|------------------|----------------|
| **100% DGCA exam pass rate** | `seo.js` FAQ; About stats; Home3D; Scene overlays; CPL course body/schema | Self-asserted marketing only; no third-party audit artifact in repo/CMS | Unverified | Yes (UI) | **No** | Removed from schema FAQ helper; softened CPL schema description via `sanitizeSchemaText`; revised CPL hero copy |
| **100% first-attempt pass rate** | CPL course schema + body | Same as above | Unverified | Yes | **No** | Removed from Course `description` in registry; body revised |
| **India's most trusted DGCA CPL ground school** | `seo.js` Org description; Home3D overlays | Superlative; no ranking evidence | Unverified | Yes | **No** | Org schema description rewritten to factual DGCA-aligned academy copy |
| **2,500+ / 2500+ students / pilots trained** | Meta descriptions, About, homepage stats, FAQ, course copy | Consistently used on site since 2009 narrative; no independent verification file | Self-claimed | Yes | **Caution** | Kept in some UI marketing; **removed from homepage FAQ answer feeding schema**; avoided as sole Org description proof point |
| **Highest / largest / best / No.1 in Delhi NCR** | Not found as primary schema claims | - | - | - | - | No schema use |
| **Batch capped at 25** | FAQ + course pages | Stated operational policy on site | Operational claim | Yes | **Yes** | Keep |
| **Founded 2009 / brand 2012** | About timeline | On-page timeline | Site-stated | Yes | **Yes** | `foundingDate: 2009` used |
| **Capt. Navrang Singh - 15+ years training** | About bio | On-page bio | Site-stated | Yes | **Yes** | Used in Person description |
| **Fee ₹2,70,000 CPL ground school** | Course pages, FAQ | On-page pricing | Site-stated | Yes | **Yes** | Used in Offer |
| **A320 FTD Level 5 in Dwarka** | FAQ / simulator page | On-page | Site-stated | Yes | **Yes** | Used in Course/Service copy |
| **Alumni at IndiGo, Air India, etc.** | Homepage FAQ | On-page alumni narrative | Site-stated (not quantified) | Yes | **Yes** (qualitative) | Kept qualitative airline names; dropped “Over 2,500 pilots…” from FAQ answer |
| **Star ratings / reviewCount** | CourseReviews UI (quotes only) | No numeric ratings in UI | N/A | Quotes only | **No AggregateRating** | Intentionally **not** implemented |

---

## Schema policy applied

1. **Never invent** awards, publications, ratings, or pass rates.  
2. FAQ JSON-LD **must match** visible FAQ text.  
3. Prefer factual org copy: location, programs, founder role, founding year.  
4. `sanitizeSchemaText()` strips residual “100% pass rate” / “most trusted” / “No.1” patterns if they leak into descriptions.

---

## Residual UI claims (out of schema scope)

Absolute marketing claims may still appear in non-schema UI (About stats strip, 3D overlays). Those are **content decisions**, not structured-data claims. Recommend a separate content compliance pass to align UI stats with verifiable evidence.
