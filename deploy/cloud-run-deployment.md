# Cloud Run Deployment Spec

Prepared for the Vercel → Cloud Run migration. Both apps already:

- output `standalone` (`next.config.js`, `admin/next.config.ts`)
- ship a multi-stage `Dockerfile`
- expose `/health` (liveness) and `/health/ready` (readiness)

## 1. Build & push images

From the repo root (marketing) and `admin/`:

```bash
# marketing (build context = repo root, since Dockerfile is at repo root)
gcloud builds submit . \
  --tag gcr.io/<project>/airborne-web \
  --region=asia-south1

# admin (build context = admin/, since admin/Dockerfile lives there)
gcloud builds submit ./admin \
  --tag gcr.io/<project>/airborne-admin \
  --region=asia-south1
```

## 2. Create the services

### airborne-web (marketing)

```bash
gcloud run deploy airborne-web \
  --image gcr.io/<project>/airborne-web \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 4 \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --concurrency 80 \
  --timeout 60 \
  --no-cpu-throttling
```

### airborne-admin (admin + API)

```bash
gcloud run deploy airborne-admin \
  --image gcr.io/<project>/airborne-admin \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 4 \
  --port 8080 \
  --cpu 2 \
  --memory 1Gi \
  --concurrency 80 \
  --timeout 120 \
  --no-cpu-throttling
```

> `--no-cpu-throttling`: keeps CPU allocated while idle so Inngest's
> poll-based worker stays warm at `min-instances=1`.

## 3. Health checks

Cloud Run start-up / readiness probes:

- **Liveness** `/health` — plain 200, no deps.
- **Readiness** `/health/ready`:
  - marketing: verifies `ADMIN_API_URL`, `PUBLIC_INTAKE_KEY`,
    `SUPABASE_URL`/`SUPABASE_ANON_KEY` are configured (503 until ready).
  - admin: `SELECT 1` against Supabase via Prisma (503 until the DB is reachable).
  - admin also reports `inngest_enabled`.

```bash
gcloud run services update airborne-web   --region asia-south1 \
  --set-startup-probe=/health/ready
gcloud run services update airborne-admin --region asia-south1 \
  --set-startup-probe=/health/ready
```

## 4. Custom domains

Point the canonical domains at the services. Airborne Aviation uses
`www.airborneaviation.in` — keep it canonical:

- `www.airborneaviation.in` → `airborne-web`
- `airborneaviation.in` (apex) → 301 to `www` (Cloud Run does this when mapped)
- `airborneaviation.academy`, `www.airborneaviation.academy` → 301 to
  `https://www.airborneaviation.in` (the `next.config.js` host redirects only
  apply once a request reaches the app; map these hosts to `airborne-web` too
  so the redirects fire)
- `admin.airborneacademy.in` → `airborne-admin`

## 5. Rebuild on deploy

Pin a tag to the deployed digest and redeploy images with:

```bash
gcloud run services update-traffic airborne-web --to-latest
gcloud run services update-traffic airborne-admin --to-latest
```

## 6. Reference steps

1. `gcloud builds submit` per app.
2. `gcloud run deploy` per app with the flags above.
3. Map domains, wait for cert issuance, switch DNS.
4. Set env vars (see secret-manager-mapping.md).
5. Run the QA plan (production-qa-plan.md) before and after cutover.
6. Keep Vercel live until QA passes; cut DNS when ready.

## Notes

- **Port**: Next standalone serves on `0.0.0.0:${PORT}`; Cloud Run passes
  `PORT=8080`.
- **Auth**: NextAuth v5 runs inside `airborne-admin` — no separate IdP change.
- **Storage**: Supabase Storage stays for media (see supabase-connectivity.md).
