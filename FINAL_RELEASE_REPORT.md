# FINAL RELEASE REPORT — Airborne Aviation RC 1.0

**Branch:** `release/rc-1.0` @ `f7e5f9c` (+ merge `6b4dcd5`)  
**Date:** 2026-07-25  
**Decision:** see §12

Preview (RC):
- Admin: `https://airbone-admin-jv0dpgt8t-qala-labs-projects.vercel.app`
- Marketing: `https://airbone-mqr6iezhj-qala-labs-projects.vercel.app`

---

## 1. Release Branch Summary

| Item | Value |
|---|---|
| Branch | `release/rc-1.0` |
| Includes | Phase A (via `main` PR #5) + B + C + D + RC stabilization |
| Tip commit | `f7e5f9c` — lead bypass, R2/Inngest graceful, TEACHER demo |
| Remote | `origin/release/rc-1.0` pushed |
| PR link | https://github.com/QalaLabs/Airbone/pull/new/release/rc-1.0 |

Phases already linear on branch history — no duplicate migrations/models/routes introduced in merge.

---

## 2. Merge Summary

| Step | Result |
|---|---|
| Base | `feature/phase-d-portal-ux` (A→D history) |
| `git merge main` | Clean ort merge — absorbed Phase A PR #5 (`29a3f4e`) |
| Conflicts | None |
| Migrations | Still **4** files — no duplicates |
| Prisma models | No schema change this RC |

---

## 3. Environment Matrix

Presence only — never print secret values.  
App uses `AUTH_SECRET` / `AUTH_URL` (Auth.js v5), not legacy `NEXTAUTH_*` names.

### Admin

| Variable | Required? | Dev | Preview | Production |
|---|---|---|---|---|
| DATABASE_URL | Required | Configured | Configured | Configured |
| DIRECT_URL | Required (migrate) | Configured | Configured | Configured |
| AUTH_SECRET | Required | Configured | Configured | Configured |
| AUTH_URL | Required* | localhost | Configured (per Preview URL) | Configured |
| AUTH_TRUST_HOST | Recommended | — | Configured | — |
| PUBLIC_INTAKE_KEY | Required | Configured | Configured | Configured |
| PUBLIC_ORG_SLUG | Optional | Configured | Configured | Configured |
| NEXT_PUBLIC_APP_URL | Optional | Configured | Configured | Configured |
| R2_* | Optional | Missing | Missing | Missing |
| INNGEST_* | Optional | local/missing | Missing | Missing |
| GEMINI_API_KEY | Optional | Missing | Missing | Missing |

\*With `AUTH_TRUST_HOST=true`, host can be derived; keep `AUTH_URL` aligned to stable Production domain.

### Marketing

| Variable | Required? | Dev | Preview | Production |
|---|---|---|---|---|
| ADMIN_API_URL | Required | localhost | Configured → Admin Preview | Configured |
| PUBLIC_INTAKE_KEY | Required | Configured | Configured | Configured |
| SUPABASE_URL | Required (fallback) | Configured | Configured | Configured |
| SUPABASE_ANON_KEY | Required (fallback) | Configured | Configured | Configured |
| SUPABASE_SERVICE_ROLE_KEY | Optional | Missing | Missing | Missing |
| ADMIN_PROTECTION_BYPASS | Preview-only | — | Configured | Not needed (no SSO on prod API host) |
| N8N / Voice webhooks | Optional | Empty | Empty | Empty |

### Graceful optional behaviour

| Service | Absent behaviour |
|---|---|
| R2 | API **503** `STORAGE_UNAVAILABLE`; UI toast “Media storage is not configured” |
| Inngest | `emitEvent` no-ops if key missing/`local`; never throws to request path |
| Gemini | Existing stub path (unchanged) |

---

## 4. Migration Verification

```
4 migrations found
Database schema is up to date!
```

All APPLIED. No `migrate reset`. No `db push`.

---

## 5. Role Verification

| Role | Email | Password | Login | Routes |
|---|---|---|---|---|
| ADMIN | `admin@airborneaviation.in` | `Admin@1234!` | PASS | `/` `/lms` `/faculty` 200 |
| TEACHER | `demo.teacher@airborneaviation.in` | `DemoTeacher1!` | PASS | `/faculty` `/lms` 200 |
| STUDENT | `demo.student@airborneaviation.in` | `DemoStudent1!` | PASS | `/portal` + `/api/v1/lms/me` 200 |

Provision: `cd admin && node scripts/ensure-demo-roles.mjs` (idempotent; TEACHER **created** on live DB this session).

**Product note:** TEACHER is a first-class role — not substituted with ADMIN.

---

## 6. Preview Smoke Matrix

| Check | Result |
|---|---|
| Marketing `/` `/courses` `/contact` | PASS 200 |
| Marketing `/dev` | PASS 404 |
| Admin `/login` | PASS 200 |
| Admin `/dev/auto-login` | PASS 404 |
| Cert `/verify/VERIFY-NAV-0001` | PASS 200 |
| Lead `POST /api/lead` | PASS **Lead captured successfully** + gateToken |
| Unauth LMS me | PASS 401 |
| Authed Admin LMS/Faculty | PASS 200 |
| Authed Student portal | PASS 200 |
| Cookies / sessions / RBAC | PASS (3 roles) |
| SSR HTML | PASS (large HTML payloads) |
| Full browser hydration / Lighthouse / tablet visual | Not automated — residual risk §11 |

---

## 7. Regression Matrix

| Area | Status |
|---|---|
| Website / Marketing | PASS (build + Preview) |
| CRM / Lead forms | PASS (CRM path, not fallback) |
| CMS public courses | PASS (prior + Preview courses page) |
| LMS / Admin / Faculty / Student | PASS role smoke |
| Certificates | PASS |
| Auth | PASS |
| Resources / Jobs / Blogs | Build OK; deep CRUD not re-run |
| Attendance / Assessments / Bookmarks / Announcements / AI Tutor | Routes build; student APIs respond for me |
| R2 media upload | Graceful fail (R2 unset) |

---

## 8. Production Deployment Checklist

1. Open PR: `release/rc-1.0` → `main` — review + merge  
2. Confirm Production env (Admin + Marketing) per §3 — set `AUTH_URL` / `ADMIN_API_URL` to **Production hostnames**  
3. Do **not** set `ADMIN_PROTECTION_BYPASS` on Production unless SSO blocks server-to-server  
4. Optional: add R2 + Inngest before demoing uploads/background jobs  
5. `cd admin && npx prisma migrate status` (expect up to date)  
6. Promote / `vercel deploy --prod` **Admin first**, then **Marketing**  
7. Run `cd admin && node scripts/ensure-demo-roles.mjs` against Production DB if demo users missing  
8. Execute §9

---

## 9. Post Deployment Checklist

- [ ] Marketing home + contact 200  
- [ ] `POST /api/lead` → success (not fallback) + lead in Admin CRM  
- [ ] ADMIN / TEACHER / STUDENT login + logout  
- [ ] Student `/portal` populated  
- [ ] `/verify/VERIFY-NAV-0001`  
- [ ] `/dev/*` 404  
- [ ] Upload without R2 shows toast / 503 (or works if R2 configured)  
- [ ] Rotate demo passwords after client demo  

---

## 10. Rollback Plan

1. Vercel → Promote previous Production deployment (Admin + Marketing)  
2. Do **not** run migrate down / reset  
3. If bad Marketing-only release: redeploy prior Marketing; Admin DB unchanged  
4. Hotfix: revert merge commit on `main`, redeploy  

---

## 11. Remaining Risks

| Risk | Severity | Mitigation |
|---|---|---|
| R2 / Inngest unset | Medium (demo polish) | Graceful; configure before media/jobs demo |
| AUTH_URL drifts on ephemeral Preview URLs | Low (Preview ops) | Production uses stable domain |
| Browser visual / Lighthouse not automated | Low | Manual spot-check on Production |
| Soft debt: SMS/WhatsApp, Assignments UI, mock Settings | Low | Documented; not launch-crashers |
| One TODO: Resend invite email Sprint 5 | Low | Non-blocking |

---

## 12. Final Decision

# READY FOR PRODUCTION

### Exact sequence

```bash
# 1. Merge RC
gh pr create --base main --head release/rc-1.0 --title "release: RC 1.0 Airborne Aviation"
# review → merge

# 2. Production env sanity (names only)
# Admin: DATABASE_URL DIRECT_URL AUTH_SECRET AUTH_URL PUBLIC_INTAKE_KEY
# Marketing: ADMIN_API_URL PUBLIC_INTAKE_KEY SUPABASE_URL SUPABASE_ANON_KEY

# 3. Deploy
cd admin && npx vercel deploy --prod --scope qala-labs-projects
cd .. && npx vercel deploy --prod --scope qala-labs-projects

# 4. Demo users on prod DB if needed
cd admin && node scripts/ensure-demo-roles.mjs

# 5. Post-deploy checklist §9
```

### Demo credentials (rotate after client demo)

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@airborneaviation.in | Admin@1234! |
| TEACHER | demo.teacher@airborneaviation.in | DemoTeacher1! |
| STUDENT | demo.student@airborneaviation.in | DemoStudent1! |

Org slug: `airborne-aviation`  
Cert sample: `VERIFY-NAV-0001`

### RC commit included in git (no Preview-only critical fixes)

`f7e5f9c` — lead optional bypass header, adminApi bypass header, STORAGE_UNAVAILABLE, Inngest safe emit, ensure-demo-roles, TEACHER seed.
