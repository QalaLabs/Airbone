# Feedback Sprint Final Report — 24 Jul MD

**Source:** `Airborne Aviation Website Feedback _ 24_7 (1).md`  
**Branch:** `feature/post-delivery-phase2`  
**Build:** `npm run build` ✅ (includes `/blog`, `/courses/gd-pi`)  
**Lint:** pass (warnings only, pre-existing + CourseReviews export note)

---

## 1. Total Issues Found

**78** discrete checklist items extracted from MD (General, Course, Content, Home, About, Contact, Policy, Jobs, Resources, Blog, /courses listing, ATPL, CPL, Cabin, Cadet, A320, GD/PI).

## 2. Already Fixed (before this sprint)

| Item | Evidence |
|------|----------|
| Capt. Navrang “15+ years” on About | `about/page.jsx` STATS / founder bio |
| Mentors section exists | About “Core Mentors” |
| CPL ground FAQ already 3–6 / 12–18 months | `HOME_FAQS` duration answer |
| Class 2 medical / no 50% PM (prior session) | CPL issuance + FAQ |

## 3. Implemented Now

### General / Chrome
- Glass morphosis header (light frosted) — `Header.jsx` + `.site-header`
- Light theme shells for Courses / About / Contact / Blog
- Breadcrumb component — `Breadcrumb.jsx` (+ used on `/courses`, `/blog`)
- DGCA Approved → **DGCA Complied** (layout SEO, courses listing, GlobalRouteMap, course copy; FTO FAQ removed)
- Timeline unit: weeks → months on airline prep / listing / cards
- Footer LinkedIn + pilot-sequence program links + Blog link

### Homepage
- ProgramGrid reordered + CPL ₹65L*, GD&PI ₹30k → `/courses/gd-pi`, Airline Prep ₹1.5L / 3 mo, Parent Centric Guide, A320 FBS ₹12k, Cabin ₹59k
- FAQ #4 (false FTO “DGCA approved”) **removed**
- Advantage carousel: **one full screen per swipe**
- Alumni: Eight→**Fifteen** years; Himansh→**Commander**; Naveen→**First Officer**

### Courses listing
- Light table, removed Eligibility column (L5)
- Removed IR, Aviation English, Flight Dispatcher from compare table
- Added GD&PI, Airline Interview Prep, Parent Centric, Cadet; ATPL 2–3 mo; CPL 12–18; A320 FBS ₹12k; Cabin 0* scholarship copy
- Header column **DGCA Complied**

### Course pages (coder + local)
- ATPL, CPL, Cabin, Cadet, A320 FBS, Airline Prep, PPL, Ground School — content/fees/FAQs per MD
- New route **`/courses/gd-pi`** (₹30,000)
- `courseFees.js` updated
- `CourseReviews` on CPL + ATPL
- CPL related links no longer push IR / Aviation English

### About / Contact / Policy / Blog
- Deepak ↔ Piyush bio interchange; Deepak business emphasis
- About light theme
- Contact padding/spacing + light theme
- Privacy: Data Compliance Manager Deepak Aggarwal, `data@airborneaviation.in`, +91 73030 17062
- **Blog index** `/blog` (was 404)

## 4. Not Applicable

| Item | Why |
|------|-----|
| W2 Share interlinking logic | Documentation ask — logic: homepage ProgramGrid order = listing priority; CPL GS links flying guide / ATPL / GD-PI; remove IR & dispatcher from primary nav surfaces |
| G7 Remove `""` | Ambiguous artifact; no actionable empty-quote pattern found beyond encoding cleanup |

## 5. Needs Client Clarification

| Item | Blocker |
|------|---------|
| G2 More images all pages | Need approved asset pack / which pages |
| A1 About header logo change | Which file/logo variant? |
| H3 Airline Prep “as discussed on WhatsApp” | Exact copy/layout missing |
| J2 Scrape 100 jobs weekly | Ops/infra + legal; not a UI-only change |
| R1 Resources e-books/videos | Waiting assets from Deepak |
| CD1 Exact institute lists per airline | Placeholders used |
| CPL URL rename | Target slug not specified (“Change URL to”) |
| Dedicated Airline Prep page vs GD&PI | Both routes exist; confirm if content should diverge further |
| Full site light theme incl. homepage 3D hero | Hero kept cinematic dark; chrome + content pages lightened — confirm if hero must go light |

## 6. Files Modified (primary)

- `src/components/Header.jsx`, `PremiumFooter.jsx`, `ProgramGrid.jsx`, `AirborneFX.jsx`, `GlobalRouteMap.jsx`, `Breadcrumb.jsx` (new), `CourseReviews.jsx` (new)
- `src/index.css`, `src/app/layout.jsx`, `src/app/page.jsx`
- `src/app/courses/page.jsx`, `gd-pi/page.jsx` (new), ATPL/CPL/Cabin/Cadet/A320/Airline/PPL/Ground pages
- `src/lib/courseFees.js`
- `src/app/about/page.jsx`, `contact/page.jsx`, `privacy/page.jsx`, `blog/page.jsx` (new)
- `FEEDBACK_SPRINT_CHECKLIST.md`, `FEEDBACK_SPRINT_EXTRACTED.md`

## 7. Screens Verified (build + code)

Static routes generated: `/`, `/courses`, `/courses/gd-pi`, `/blog`, `/about`, `/contact`, `/privacy`, key course slugs.  
Manual browser pass recommended on local `npm run dev` for glass header + light listing + GD&PI.

## 8. Regression Status

- Marketing `npm run build` ✅  
- Lint ✅ (warnings only)  
- Admin / CRM / LMS not in this marketing-only change set — untouched this sprint  
- Lead forms still present on course/contact pages

## 9. Build Status

**PASS** — Next.js static generation succeeded including `/blog` and `/courses/gd-pi`.

## 10. Remaining Technical Debt

- Homepage still partially dark (3D / FAQ / Advantage) — intentional cinematic sections
- Course pages still need reviews injected on remaining slugs
- Instrument Rating / Aviation English / Flight Dispatcher pages still exist (removed from listing only)
- Jobs weekly scrape + Resources lead magnets blocked on client assets
- LinkedIn URL is placeholder company URL — confirm real profile
- About page body may still have dark-section leftovers beyond hero/stats (spot-check)
- Prefer visual QA on tablet/mobile for contact + courses table padding
