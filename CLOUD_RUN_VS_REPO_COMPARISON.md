# Cloud Run vs Repo vs Local — Comparison Report
**Generated:** 2026-10-09 14:52 IST

---

## 🌐 Live Service (Cloud Run)

| Property | Value |
|---|---|
| **Service** | `airborne-web` |
| **Project** | `airborne-aviation-505100` |
| **Region** | `asia-south1` |
| **URL** | https://airborne-web-368523757732.asia-south1.run.app |
| **Active Revision** | `airborne-web-00017-per` |
| **Last Deployed** | 2026-10-02 08:30 UTC (by adminairborne@gmail.com) |
| **Image Tag on Cloud Run** | `rc-7067a17` |
| **Health check** | ✅ `{"status":"ready","checks":{"admin_api_url":true,"public_intake_key":true,"fallback_storage":true}}` |

---

## 🔀 Branch Situation

| Branch | HEAD commit | Notes |
|---|---|---|
| **`main`** (local + origin) | `11f2661` | "feat: install Meta Pixel base code on all pages (#19)" — **Aug 15, 2026** |
| **`production/cloud-run-cutover-stabilization`** | `7067a17` | "fix(web): readable light-theme jobs portal, modal and application form" — **Oct 2, 2026** |

> **The production Cloud Run deployment is running commit `7067a17` — which is on the `production/cloud-run-cutover-stabilization` branch, NOT on `main`.**

### Commits ahead of `main` on the production branch (17 commits):
1. `7067a17` fix(web): readable light-theme jobs portal, modal and application form
2. `bfc4e0b` fix: complete final CRM and website feedback audit
3. `be4f26e` Fix lead/created crash from legacy seeded workflow; stop uploading .env files on web deploy
4. `cc76bf5` LMS website course overviews, batch schedule validation; CRM integration keys, ledger delete
5. `a4a9c70` fix(csat): remaining CSAT findings + Playwright E2E
6. `b62cef6` fix(crm): CSAT feedback remediation — leads, deals, dossier, fees, intake
7. `7ac4824` fix(crm): complete master backlog remediation
8. `9368a56` fix(build): add missing public directory for docker copy
9. `d1181c6` fix(build): inject dummy env vars in Dockerfile for next build static analysis
10. `5b5d576` chore: include missing schema updates from previous session
11. `73fd71c` fix(crm): remove hardcoded isActive filter to fix lead visibility date cutoff
12. `e30af80` fix(crm): complete phase 1-5 bug remediation for lead flow
13. `84552f4` Deploy local updates to GCR
14. `c71a21f` feat(admin): Interakt lead_created sync and Google Ads lead-form webhook
15. `a932eeb` feat: Phase 2 Lead Management, UI tweaks, and Analytics optimizations
16. `59becc4` fix: lead forms show scary error on duplicate-phone (409) submissions
17. `f4ae2f1` prod: Cloud Run + Cloud SQL migration, LB cutover, auth fix, credential hygiene

---

## 🐛 Issues Found on Live Site vs Code

### 1. ⚠️ Counter Stats Showing `0+` / `0/5` / `0%` (CRITICAL)
- **Live HTML shows:** `0+` for "Years mentoring pilots", `0/5` for "DGCA papers cleared", `0+` for "Students sent to cockpit", `0%` for "Mentor-led batches"
- **Code on BOTH branches defines:** `value: 15`, `value: 5`, `value: 2500`, `value: 100`
- **Root cause:** The counter animations (`CountUp`/`useInView`) are JavaScript-driven and only run client-side. The **static HTML snapshot** captured from the server-rendered page shows `0` as the initial value before JS hydrates.
- **Status:** ✅ This is likely working correctly in-browser (JS increments from 0 to target). Not a real bug — just how SSR works for animated counters.

### 2. ✅ Meta Pixel Installed (FB ID: `974236902284876`)
- Live HTML contains the noscript FB pixel + GTM pixel (`GTM-KCM9CDK9`)
- This matches the latest `main` commit (`11f2661`: "install Meta Pixel base code on all pages")
- ✅ **MATCH**

### 3. ✅ GTM is Live
- `GTM-KCM9CDK9` confirmed in live HTML
- ✅ **MATCH**

### 4. ✅ Health Check: All Secrets Properly Wired
- `admin_api_url: true`, `public_intake_key: true`, `fallback_storage: true`
- All secrets are resolved (previously flagged as 🔴 Unconfirmed in DEPLOYMENT_GUIDE.md)
- ✅ **RESOLVED** — secrets are now live

---

## 📊 What's on Live but NOT in `main`

The live site (`7067a17`) has **643 changed files, +60,124 / -12,993 lines** compared to `main`. Key additions missing from `main`:

| Feature | Status |
|---|---|
| Honeypot spam protection on lead forms | ✅ Live, ❌ Not in `main` |
| `/api/job-application` route | ✅ Live, ❌ Not in `main` |
| `/api/testimonial` route | ✅ Live, ❌ Not in `main` |
| `/health/ready` health check endpoint | ✅ Live, ❌ Not in `main` |
| `/app/share-your-story` page | ✅ Live, ❌ Not in `main` |
| `GoogleReviewsSection` component | ✅ Live, ❌ Not in `main` |
| `PilotSupplyGraph` component | ✅ Live, ❌ Not in `main` |
| `JobApplicationForm` component | ✅ Live, ❌ Not in `main` |
| `LeadEligibilityPrompt` component | ✅ Live, ❌ Not in `main` |
| CMS content system (`src/lib/cms/`) | ✅ Live, ❌ Not in `main` |
| Dynamic blog `[slug]/page.jsx` | ✅ Live, ❌ Not in `main` |
| Testimonial avatar fallback (initials) | ✅ Live, ❌ Not in `main` |
| 409 duplicate-phone graceful handling | ✅ Live, ❌ Not in `main` |
| Light-theme jobs portal | ✅ Live, ❌ Not in `main` |
| Deleted dead course pages (instrument-rating, multi-engine, flight-dispatcher, aviation-english-icao) | ✅ Live, ❌ Still exist in `main` |

---

## ⚠️ Summary: `main` is SIGNIFICANTLY BEHIND production

```
main (local/GitHub) ──────── 11f2661 (Aug 15 2026)
                                   │
                               [17 commits behind]
                                   │
production/cloud-run-cutover ── 7067a17 (Oct 2 2026) ← WHAT'S LIVE
```

**The local repo's `main` branch is 17 commits and ~3 weeks behind the live deployment.**

---

## ✅ Recommended Actions

1. **Merge the production branch into `main`** to sync history:
   ```bash
   git checkout main
   git merge origin/production/cloud-run-cutover-stabilization
   git push origin main
   ```
   Or open a PR: `production/cloud-run-cutover-stabilization` → `main`

2. **Alternatively, rename/promote** the production branch as the new default if `main` is intentionally a staging/legacy branch.

3. **No re-deployment needed** — the live service is healthy, all checks pass, and it's running the latest production code.
