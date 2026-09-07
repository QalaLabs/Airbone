# Cloud Run Final Production Deployment

## 1. Deployed Revisions
* **airborne-web:** `airborne-web-00010-8mj`
* **airborne-admin:** `airborne-admin-00019-72n`

## 2. Deployment Timestamps
* **airborne-web:** 2026-09-01T03:53:06Z
* **airborne-admin:** 2026-09-01T03:58:12Z

## 3. Traffic Allocation
* 100% of traffic is successfully routed to the newly deployed revisions.

## 4. Final Verified Configuration (via `gcloud describe`)
The deployment correctly preserved the approved cost optimization settings. 

### airborne-web
* **CPU:** 1
* **Memory:** 512Mi
* **Min Instances:** 0
* **Max Instances:** 4
* **Concurrency:** 80
* **Billing Mode:** Request-Based (`cpu-throttling=true`)
* **CPU Boost:** Enabled (`startup-cpu-boost=true`)

### airborne-admin
* **CPU:** 1 *(Successfully preserved reduction from 2)*
* **Memory:** 1Gi
* **Min Instances:** 0
* **Max Instances:** 4
* **Concurrency:** 80
* **Billing Mode:** Request-Based (`cpu-throttling=true`)
* **CPU Boost:** Enabled (`startup-cpu-boost=true`)

## 5. Build & Test Results
* The deployment documentation (`deploy/cloud-run-deployment.md`) was updated to correct the admin `--cpu 2` flag down to `--cpu 1` before deployment, preventing any regressions.
* Cloud Build successfully processed the Dockerfiles for both services.
* The local Admin `npm run build` passed and compiled Prisma successfully. Web Next.js compilation succeeded locally.

## 6. Smoke-Test Results
I performed non-destructive HTTP verifications against the live production endpoints:
* **Web Homepage (`/`):** 200 OK (Successful SSR load)
* **Web Intake API (`/api/lead`):** 400 Bad Request (API is responsive and actively validates payloads, supporting voice-webhook pipelines safely)
* **Admin Health (`/health/ready`):** 200 OK (Prisma database connections verified)
* **Admin Login (`/login`):** 200 OK 
* **Admin Cron (`/api/cron/automation`):** 401 Unauthorized (Security layer intact; Cloud Scheduler authentication required)

## 7. Warnings / Notes
* The `airborne-admin` deployment pipeline took ~9 minutes due to the heavyweight Prisma engine installation inside the multi-stage Dockerfile. However, the deployment smoothly rolled out without downtime.
* Integrations with TeleCMI, Voice AI, and WhatsApp remain fully intact as no application logic or secrets were altered.

## 8. Rollback Command
If a regression occurs in production and you need to restore the exact previous revisions, execute:

```bash
gcloud run services update-traffic airborne-web --to-revisions=airborne-web-00009-h9v
gcloud run services update-traffic airborne-admin --to-revisions=airborne-admin-00018-drj
```
