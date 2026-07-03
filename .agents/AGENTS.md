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
