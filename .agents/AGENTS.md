# Airborne Aviation Project Memory & Rules

## Project Structure Overview
- **Frontend Presentation Web App** (Root directory: `c:\Users\pc\Desktop\Airbone`): Next.js 15, React 19, Tailwind CSS v4, Three.js (React Three Fiber), GSAP, Framer Motion.
- **Admin OS App** (Subdirectory: `admin/`): Next.js 15, Prisma ORM, NextAuth, Inngest, Tailwind CSS + Shadcn components.
- **Branding & Marketing Assets Workspace**: Contains brand manuals, copywriting guidelines, competitor CSV analyses, and campaign assets.

## Production Infrastructure (Migrated: 2026-08-17)

All services have been migrated from Vercel + Supabase to Google Cloud.

| Component | Old | New |
|---|---|---|
| Web hosting | Vercel | Cloud Run (`airborne-web`) |
| Admin hosting | Vercel | Cloud Run (`airborne-admin`) |
| Database | Supabase PostgreSQL | Cloud SQL PostgreSQL (`airborne-db`) |
| Storage | Supabase Storage | Google Cloud Storage (`airborne-aviation-media-prod`) |

### Cloud Run Services
- **Web**: `https://airborne-web-368523757732.asia-south1.run.app`
- **Admin**: `https://airborne-admin-368523757732.asia-south1.run.app`
- **GCP Project**: `airborne-aviation-505100`
- **Region**: `asia-south1`

### Cloud SQL
- **Instance**: `airborne-db` (region: `asia-south1`)
- **Database**: `airbornedb`
- **User**: `airborne_app_user`
- **Public IP**: `34.93.180.179` (also reachable via Cloud SQL Auth Proxy socket)
- **70 production tables migrated, 0 row mismatches**

### Google Cloud Storage
- **Bucket**: `gs://airborne-aviation-media-prod`
- Supabase Storage assets migrated; media DB URLs updated

### Secret Manager
- All secrets stored in `airborne-aviation-505100` Secret Manager
- Cloud Run services pull secrets at runtime (mounted as env vars)

### Artifact Registry
- **Registry**: `asia-south1-docker.pkg.dev/airborne-aviation-505100/airborne-images/`
- Images: `airborne-web` and `airborne-admin`

## Key Operational Workflows

### 1. Ingestion Flow (Lead Durability & Fallbacks)
- Forms on the frontend submit requests to `/api/lead` (route.js).
- `/api/lead` checks rate limits and filters script injections.
- It attempts to POST to the Admin API: `${ADMIN_API_URL}/api/public/leads` with a timeout of 10s.
- **Fail-safe Catch:** If the Admin API is offline or times out, the lead is stored in a **Supabase** table `fallback_leads` via `fallback-storage.js`.
- **Leads Replay Script (Supabase):** `scripts/replay-fallback-leads.ts` reads pending records in Supabase `fallback_leads` and pushes them to the Admin API.
- **NOTE:** The Admin schema (`admin/prisma/schema.prisma`) also has a `FallbackLead` model (`@@map("fallback_leads")`) in Cloud SQL — this stores pre-migration fallback records. A one-time replay was executed on 2026-08-17 via `scripts/replay-cloudsql-fallback.ts` — all 5 pending entries recovered (status = `recovered`).

### 2. Admin OS Endpoints & Workflows (Inngest)
- Public lead ingestion is processed at `admin/src/app/api/public/leads/route.ts`, which creates a Prisma `Lead` record, checks for duplicates, and creates a resource token.
- Background tasks are handled via Inngest. Core handlers are in `admin/src/lib/events/functions/lead.functions.ts`:
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
- Generated `logo-white.png` and `logo-white.webp` via `scripts/generate-logo-white.py` - navy elements turned white, red elements preserved. Assets saved to `public/images/`.

### Mobile / Responsive CSS (`src/app/index.css`)
- Added strict `max-width` + `overflow-x: hidden` constraints to `.container-md`, `.container-lg`, `.container-xl`, `.container-fluid`.
- Added `overflow-x: auto` and `width: 100%` to `.course-table-wrap` for horizontal table scrolling on small screens.

### Course Page Layout Fix (all 15 static course pages)
- Added `minWidth: 0; width: 100%` to the main flex column inside `.course-details-layout` on all course detail pages to prevent content overflow on mobile.
- Affected pages: `aviation-english-icao`, `cabin-crew-training`, `cadet-preparation`, `cas-compass-adapt`, `commercial-pilot-license-cpl`, `flight-dispatcher`, `flying-training-india-abroad`, `ground-school`, `instrument-rating`, `multi-engine-rating`, `private-pilot-license` (and any shared dynamic `[slug]` template).

### Build Status (Session: 2026-08-17 — Cloud Run)
- Both Cloud Run services deployed and healthy:
  - Admin: `GET /health` → `200 {"status":"ok","service":"airborne-admin"}`
  - Admin: `GET /health/ready` → `200 {"status":"ready","checks":{"database":true}}`
  - Web: homepage loads correctly (GTM, GA, Meta Pixel all present)
- 5 pre-migration fallback leads replayed and recovered into Cloud SQL CRM.
- `testimonials` proxy returns `502` in dev when Admin OS is offline — expected behaviour.
- Inngest is currently **not connected** in Cloud Run (`inngest_enabled: false`) — Cloud Run services are stateless, Inngest requires a persistent Event Key and Signing Key configured via Secret Manager if needed.
