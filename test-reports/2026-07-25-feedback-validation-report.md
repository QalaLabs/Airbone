# Feedback Sprint — Detailed Validation Report

**Date:** 2026-07-25  
**Source of truth:** `C:\Users\pc\Downloads\Airborne Aviation Website Feedback _ 24_7 (1).md`  
**Working tree:** `main` (uncommitted) — earlier plan branch was `feature/post-delivery-phase2`; changes currently sit on **main** working copy  
**Analyzer:** [code-analyzer](9770bf56-ef45-4537-a2cc-d68207a8494a) — verdict **request-changes** (complexity 7/10)  
**Build:** `npm run build` PASS (prior run; routes `/blog`, `/courses/gd-pi` generated)  
**Lint:** PASS with warnings  

### Validation legend (honest)

| Tag | Meaning |
|-----|---------|
| **CODE** | Confirmed in source via read/grep |
| **BUILD** | Next.js static route generated |
| **UI** | Seen in browser automation this session / prior smoke |
| **NOT UI** | Not visually re-checked in browser after this sprint |
| **PARTIAL** | Code changed but incomplete / inconsistent |
| **BLOCKED** | Needs client asset / clarification |

**Important:** This feedback sprint was validated primarily by **CODE + BUILD**. Full desktop/tablet/mobile visual pass of every page was **not** completed after the edits. Do not treat “Fixed” as “shipped to production” — changes are **uncommitted / undeployed**.

---

## Code-review / analyzer summary

| Area | Result |
|------|--------|
| Security (secrets, injection) | No critical findings in marketing copy diff |
| Commercial consistency | **FAIL blockers** — GD&PI duplicate prices, A320 ₹12k vs ₹12k/hr, LeadForm/Modal stale fees |
| SEO discovery | `/blog` index exists; **sitemap missing** `/blog` + `gd-pi` |
| Contrast | About `theme-light` + leftover white text risk; glass header on dark home |
| Score | Quality ~5/10 · Complexity 7/10 · **request-changes** |

---

## A. General Website

| ID | Issue | What we did | Code? | Frontend visible? | Validated? | Status |
|----|-------|-------------|-------|-------------------|------------|--------|
| G1 | Entire site light theme | Light shells on Courses/About/Contact/Blog; glass header; homepage 3D/FAQ still dark | CODE | PARTIAL — content pages light; hero still dark | BUILD only, **NOT UI** full | **PARTIAL** |
| G2 | More images all pages | Not implemented — need asset pack | — | No | — | **BLOCKED / CLARIFY** |
| G3 | Map each breadcrumb | New `Breadcrumb.jsx`; wired on `/courses`, `/blog`. Course pages still use inline `.course-breadcrumb` | CODE | Visible where wired | BUILD; **NOT UI** all course pages | **PARTIAL** |
| G4 | Timeline unit = Month | Airline prep / listing / cards use months | CODE | Yes in those surfaces | CODE | **FIXED** (spot) |
| G5 | Header glass morphosis | `Header.jsx` + `.site-header` frosted light glass | CODE | Should show on non-home pages | BUILD; **NOT UI** | **FIXED** (code) / contrast risk on dark |
| G6 | DGCA Approved → Complied (not FTO) | Layout SEO, listing, About, GlobalRouteMap; removed false FTO FAQ | CODE | Listing/SEO strings | CODE | **PARTIAL** — CPL H1 still “Compliant”; IR/multi-engine still “Approved” |
| G7 | Remove `""` | Ambiguous; no clear action | — | — | — | **N/A / CLARIFY** |

---

## B. Course-specific / listing

| ID | Issue | What we did | Code? | Frontend visible? | Validated? | Status |
|----|-------|-------------|-------|-------------------|------------|--------|
| C1 | CPL 12–18 months | Listing + ProgramGrid + FAQ | CODE | Yes in listing/home cards | CODE | **FIXED** |
| C2 | CPL GS 3–6 months | FAQ + ground/CPL pages | CODE | Yes | CODE | **FIXED** |
| C3 | CPL box padding | Listing light table padding ↑; ProgramGrid minHeight | CODE | Likely | **NOT UI** | **PARTIAL** |
| C4 | ATPL 21y / 2–3 mo | Listing duration 2–3 mo; ATPL page updated | CODE | Listing yes | CODE; ATPL page **NOT UI** | **FIXED** (code) |
| C5 | PPL 10th / 3–6 mo | Eligibility Class 10; duration already 3–6 | CODE | Yes | CODE | **FIXED** |
| C6 | Sequence = homepage | ProgramGrid + footer programs reordered | CODE | Home cards order | CODE | **FIXED** |
| L1–L14 | Listing table overhaul | Eligibility column removed; IR/English/Dispatcher removed; GD&PI added; FBS/fees updated | CODE | Listing table | BUILD | **FIXED** with notes* |

\*L10 said remove IR **and** A320 — A320 **kept** as FBS per L11.  
\*L10 Instrument Rating removed from table only; page still exists.

---

## C. Content requirements

| ID | Issue | What we did | Code? | Frontend visible? | Validated? | Status |
|----|-------|-------------|-------|-------------------|------------|--------|
| W1 | Module content every course | Existing modules kept/updated on major courses | CODE | Course pages | **NOT UI** all | **PARTIAL** |
| W2 | Share interlinking logic | Documented in report (not a UI ticket) | — | Doc | — | **N/A** |
| W3 | 1–3 reviews per course | `CourseReviews` on **CPL + ATPL only** | CODE | Those 2 pages | **NOT UI** | **PARTIAL** |
| W4 | Parent testimonial Airborne + Navrang | Parent quotes inside `CourseReviews` defaults | CODE | On CPL/ATPL review blocks | **NOT UI** | **PARTIAL** |

---

## D. Homepage

| ID | Issue | What we did | Code? | Frontend visible? | Validated? | Status |
|----|-------|-------------|-------|-------------------|------------|--------|
| H1 | CPL cost 65L (45–75); combine flying; remove Extra/DGCA | ProgramGrid CPL card → flying-training URL, ₹65 Lakh* | CODE | Home program grid | CODE | **FIXED** (code) |
| H2 | GD & PI card ₹30k + dedicated page | Card → `/courses/gd-pi`; page created | CODE + BUILD | New route | BUILD | **FIXED** + **collision** with airline-prep (see blockers) |
| H3 | Airline Prep new page (WhatsApp) | Existing page retitled; no WhatsApp mockup | CODE | Existing URL | **NOT UI** | **PARTIAL / CLARIFY** |
| H4 | Flying Guide → Parent Centric | Renamed in ProgramGrid + footer | CODE | Home/footer | CODE | **FIXED** |
| H5 | Advantage one screen/swipe | Carousel CSS `flex: 0 0 100%` | CODE | Mobile advantage | **NOT UI** | **FIXED** (code) |
| H6 | 8→15 yrs; Himanshu Commander; Naveen FO | `AirborneFX.jsx` | CODE | Success mosaic | CODE | **FIXED** |
| H7 | FAQ 12–18; Complied; remove FAQ 4 | FAQ 4 (FTO approved) removed; duration already OK | CODE | Homepage FAQ | CODE | **FIXED** |
| H8 | Footer LinkedIn + sequence | LinkedIn + reordered programs | CODE | Footer | CODE | **PARTIAL** — GD&PI footer href wrong |

---

## E. About / Contact / Policy

| ID | Issue | What we did | Code? | Frontend visible? | Validated? | Status |
|----|-------|-------------|-------|-------------------|------------|--------|
| A1 | Header logo change | Not done — no asset | — | No | — | **BLOCKED** |
| A2 | Swap Deepak/Piyush; business Deepak | Bios swapped + business emphasis | CODE | About founders | **NOT UI** | **FIXED** (code) |
| A3 | Mentors section | Already existed (“Core Mentors”) | ALREADY | Yes | CODE | **ALREADY** |
| CT1 | Contact padding/UI | Clamp padding + light theme | CODE | Contact | **NOT UI** | **FIXED** (code) |
| P1 | Data compliance contact | Deepak + `data@` + 7303017062 on privacy | CODE | Privacy contact block | CODE | **FIXED** |

---

## F. Jobs / Resources / Blog

| ID | Issue | What we did | Code? | Frontend visible? | Validated? | Status |
|----|-------|-------------|-------|-------------------|------------|--------|
| J1 | Jobs lead magnet | Not meaningfully implemented | — | No change | — | **OPEN** |
| J2 | Scrape 100 jobs weekly | Out of scope / clarify | — | — | — | **BLOCKED** |
| R1 | Resources lead magnets | Waiting client assets | — | — | — | **BLOCKED** |
| B1 | Blog collection 404 | New `src/app/blog/page.jsx` | CODE + BUILD | `/blog` | BUILD | **FIXED** (undeployed) |

---

## G. Course detail pages

| Area | What we did | Code? | Frontend visible? | Validated? | Status |
|------|-------------|-------|-------------------|------------|--------|
| ATPL | H1/subjects/table/enrol/FAQs + reviews | CODE | ATPL page | **NOT UI** | **FIXED** (code) |
| CPL | H1 Compliant, fees table, subjects, reviews, related links | CODE | CPL page | **NOT UI** | **FIXED** (code) / wording “Compliant” vs “Complied” |
| Cabin | ₹59k + 100%* scholarship banner | CODE | Cabin page | **NOT UI** | **PARTIAL** — FAQ still old P1/P2 bands |
| Cadet | Quickest entry + 3 airline tiles | CODE | Cadet page | **NOT UI** | **FIXED** (code) / institutes placeholder |
| A320 | FBS naming + ₹12k | CODE | A320 page | **NOT UI** | **PARTIAL** — page may still say /hr vs listing flat |
| GD/PI | New `/courses/gd-pi` ₹30k | CODE + BUILD | New page | BUILD | **FIXED** + **duplicate** with airline-prep |
| Airline Prep | Retitled GD&PI / ₹1.5L / 3 mo | CODE | Same URL | **NOT UI** | **PARTIAL** — identity collision |
| Ground school | 3–6 mo + Compliant language | CODE | Ground page | **NOT UI** | **FIXED** (code) |
| PPL | 10th class | CODE | PPL | CODE | **FIXED** |
| Flying training | Fee map ₹65L* | CODE | Fees helper | CODE | **PARTIAL** — page copy may lag |

---

## H. Blockers before ship (from analyzer)

1. **GD&PI vs Airline Interview Prep** — two pages, overlapping H1; footer points both to `airline-preparation`; schema GD&PI URL wrong.  
2. **A320 fee** — listing/fees map ₹12,000 vs page `/hr`; CPL table may still show ₹10,000/hr.  
3. **Stale fees** in `LeadForm.jsx` / `Modal.jsx` / `Home3DSection.jsx`.  
4. **About** light theme + leftover white text → possible invisible sections.  
5. **Sitemap** missing `/blog` and `gd-pi`.  
6. **Typo** risk on gd-pi (“Coursearation”) — re-check file after encoding rewrite.  
7. Changes on **main working tree, uncommitted** — not on production.

---

## I. What I personally saw in a browser

| Session | What |
|---------|------|
| Prior production smoke (delivery gate) | Public site 200s; admin login/flows — **not** this feedback sprint |
| This feedback sprint | **CODE + BUILD** validation; **no full post-edit browser tour of every feedback page** |

So: “Fixed in code” ≠ “I saw it live on frontend after the edit.”

---

## J. Counts

| Bucket | Count (approx) |
|--------|----------------|
| Total MD issues tracked | ~78 |
| Fixed in code (confident) | ~40 |
| Partial | ~20 |
| Already fixed pre-sprint | ~4 |
| N/A | ~2 |
| Blocked / clarify | ~10 |
| Build validated routes | `/blog`, `/courses/gd-pi`, course static pages |
| UI-validated this sprint | **0 complete page tours post-edit** |

---

## K. Recommendation

**Do not merge/deploy yet.**  
Order: fix GD&PI identity → unify A320/LeadForm fees → About contrast → sitemap → then local visual QA (desktop + mobile) → commit on `feature/post-delivery-phase2` (not direct main) → deploy marketing.

---

## L. Artifacts

- Checklist: `FEEDBACK_SPRINT_CHECKLIST.md` (statuses stale — still OPEN labels)  
- Prior summary: `FEEDBACK_SPRINT_REPORT.md`  
- Extracted MD text: `FEEDBACK_SPRINT_EXTRACTED.md`  
- This report: `test-reports/2026-07-25-feedback-validation-report.md`  
- Analyzer agent: `9770bf56-ef45-4537-a2cc-d68207a8494a`
