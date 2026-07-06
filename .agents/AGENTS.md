# Airborne Aviation Project Memory & Rules

## Project Structure Overview
- **Frontend Presentation Web App** (Root directory: [e:/Airborne Aviation/Airbone](file:///e:/Airborne%20Aviation/Airbone/)): Next.js 15, React 19, Tailwind CSS v4, Three.js (React Three Fiber), GSAP, Framer Motion.
- **Admin OS App** (Subdirectory: [admin](file:///e:/Airborne%20Aviation/Airbone/admin/)): Next.js 15, Prisma ORM, NextAuth, Inngest, Tailwind CSS + Shadcn components.
- **Branding & Marketing Assets Workspace** (Subdirectories: [e:\Airborne Aviation\Airborne Aviation](file:///e:/Airborne%20Aviation/Airborne%20Aviation) and [c:\Users\aashi\OneDrive\Documents\Claude\Projects\Airborne Aviation](file:///c:/Users/aashi/OneDrive/Documents/Claude/Projects/Airborne%20Aviation)): Contains brand manuals, copywriting guidelines, competitor CSV analyses, and campaign assets.

## Key Operational Workflows

### 1. Ingestion Flow (Lead Durability & Fallbacks)
- Forms on the frontend submit requests to [/api/lead](file:///e:/Airborne%20Aviation/Airbone/src/app/api/lead/route.js).
- [/api/lead](file:///e:/Airborne%20Aviation/Airbone/src/app/api/lead/route.js) checks rate limits using [rate-limit.js](file:///e:/Airborne%20Aviation/Airbone/src/utils/rate-limit.js) and filters script injections.
- It attempts to POST to the Admin API: `${ADMIN_API_URL}/api/public/leads` with a timeout of 10s.
- **Fail-safe Catch:** If the Admin API is offline or times out, the lead is stored in a Supabase table `fallback_leads` via [fallback-storage.js](file:///e:/Airborne%20Aviation/Airbone/src/utils/fallback-storage.js).
- **Leads Replay Script:** A cron/background script [replay-fallback-leads.ts](file:///e:/Airborne%20Aviation/Airbone/scripts/replay-fallback-leads.ts) reads pending records in Supabase `fallback_leads` and attempts to push them to the Admin API once it is back online.

### 2. Admin OS Endpoints & Workflows (Inngest)
- Public lead ingestion is processed at [admin/src/app/api/public/leads/route.ts](file:///e:/Airborne%20Aviation/Airbone/admin/src/app/api/public/leads/route.ts), which creates a Prisma `Lead` record, check for duplicates, and creates a resource token.
- Background tasks are handled via [Inngest route.ts](file:///e:/Airborne%20Aviation/Airbone/admin/src/app/api/inngest/route.ts). Core handlers are in [lead.functions.ts](file:///e:/Airborne%20Aviation/Airbone/admin/src/lib/events/functions/lead.functions.ts):
  - Recalculates quality score (max 100).
  - Logs audits and activity items.
  - Queues WhatsApp notifications (`NEW_LEAD`).

## Completed Fixes & Known State (Session: 2026-07-04)

### Frontend Content Corrections
- **Stats counter** in `GlobalRouteMap.jsx`: `5000+` → `2500+` students.
- **Homepage FAQ** (`src/app/page.jsx`):
  - Removed `"minimum 50% in PM"` eligibility requirement.
  - Changed `"DGCA Class 1 Medical"` → `"DGCA Class 2 Medical"`.
  - Updated DGCA approval FAQ to clarify Airborne is a specialist ground school, not an FTO.
- **Contact page** (`src/app/contact/page.jsx`): Updated location blurb to state *"approximately 10 metres from Ramphal Chowk, or less than 1 km from Palam Metro Station and Dwarka Sector 9 Metro Station."*

### Footer Fixes (`src/components/PremiumFooter.jsx`)
- Replaced bad Unicode en-dash character with a standard dash in the address line.
- Set LinkedIn href placeholder to `#` (no URL was provided).

### Logo Assets
- Generated `logo-white.png` and `logo-white.webp` via `scripts/generate-logo-white.py` — navy elements turned white, red elements preserved. Assets saved to `public/images/`.

### Mobile / Responsive CSS (`src/app/index.css`)
- Added strict `max-width` + `overflow-x: hidden` constraints to `.container-md`, `.container-lg`, `.container-xl`, `.container-fluid`.
- Added `overflow-x: auto` and `width: 100%` to `.course-table-wrap` for horizontal table scrolling on small screens.

### Course Page Layout Fix (all 15 static course pages)
- Added `minWidth: 0; width: 100%` to the main flex column inside `.course-details-layout` on all course detail pages to prevent content overflow on mobile.
- Affected pages: `aviation-english-icao`, `cabin-crew-training`, `cadet-preparation`, `cas-compass-adapt`, `commercial-pilot-license-cpl`, `flight-dispatcher`, `flying-training-india-abroad`, `ground-school`, `instrument-rating`, `multi-engine-rating`, `private-pilot-license` (and any shared dynamic `[slug]` template).

### Build Status
- `npm run build` passed cleanly: 42 static pages generated, 0 errors.
- `testimonials` proxy returns `502` in dev when Admin OS is offline — this is expected behaviour (the fail-safe Supabase fallback handles leads; testimonials simply won't render).

