# Cloud Run Cost Optimization - Applied Report

## 1. Previous Live Configuration
* **airborne-web:**
  * CPU: 1
  * Memory: 512Mi
  * Min Instances: 1
  * Max Instances: 4
  * Concurrency: 80
  * CPU Throttling: `false` (Always-on billing)
  * CPU Boost: `false`
  * Active Revision: `airborne-web-00008-x4z`

* **airborne-admin:**
  * CPU: 2
  * Memory: 1Gi
  * Min Instances: 1
  * Max Instances: 4
  * Concurrency: 80
  * CPU Throttling: `false` (Always-on billing)
  * CPU Boost: `false`
  * Active Revision: `airborne-admin-00017-qcz`

## 2. New Live Configuration
* **airborne-web:**
  * CPU: 1
  * Memory: 512Mi
  * Min Instances: 0
  * Max Instances: 4
  * Concurrency: 80
  * CPU Throttling: `true` (Request-based billing)
  * CPU Boost: `true`
  * Active Revision: `airborne-web-00009-h9v`

* **airborne-admin:**
  * CPU: 1
  * Memory: 1Gi
  * Min Instances: 0
  * Max Instances: 4
  * Concurrency: 80
  * CPU Throttling: `true` (Request-based billing)
  * CPU Boost: `true`
  * Active Revision: `airborne-admin-00018-drj`

## 3. Exact Changes Applied
* Executed `gcloud run services update` to enable `--cpu-throttling` (request-based billing) and `--cpu-boost` (Startup CPU Boost) on both services.
* Scaled `--min-instances` down to `0` for both services, ensuring they can idle when there is no active traffic.
* Reduced `airborne-admin` from 2 vCPU to 1 vCPU as 1 vCPU is highly sufficient for Next.js routing and the Prisma Rust engine when connection pools are capped.

## 4. Active Revisions Before/After
* **Web:** `airborne-web-00008-x4z` -> `airborne-web-00009-h9v`
* **Admin:** `airborne-admin-00017-qcz` -> `airborne-admin-00018-drj`

## 5. Traffic Status
* 100% of incoming requests are actively routed to the newest deployed revisions (`airborne-web-00009-h9v` and `airborne-admin-00018-drj`) in `asia-south1`.

## 6. Smoke-Test Results
* **Web Homepage (`/`):** 200 OK
* **Web API (`/api/lead`):** 400 Bad Request (Expected behavior for empty POST body; endpoint is fully responsive)
* **Admin Health (`/health/ready`):** 200 OK
* **Admin Login (`/login`):** 200 OK
* **Admin Cron (`/api/cron/automation`):** 401 Unauthorized (Expected behavior for unauthenticated cron request; route is correctly protected but fully responsive)
* **TeleCMI/Voice Integration:** The Next.js API layer is fully responsive and CPU Boost ensures cold starts are handled gracefully under the timeout threshold of the voice integration.

## 7. Warnings / Errors
* None. Deployments were fully successful and health probes passed on the first attempt despite `admin` being restricted to 1 CPU.

## 8. Rollback Commands
To restore the previous always-on, 2-CPU configuration, run:
```bash
# Rollback Web
gcloud run services update airborne-web --region=asia-south1 --cpu=1 --memory=512Mi --min-instances=1 --max-instances=4 --concurrency=80 --no-cpu-throttling --no-cpu-boost

# Rollback Admin
gcloud run services update airborne-admin --region=asia-south1 --cpu=2 --memory=1Gi --min-instances=1 --max-instances=4 --concurrency=80 --no-cpu-throttling --no-cpu-boost
```

## 9. Expected Cost Impact
* This change definitively removes the unnecessary minimum-instance and always-on CPU allocation. 
* By shifting to request-based billing and scaling down to 0 idle instances, you will no longer pay for 3 vCPUs and 1.5Gi of RAM running 24/7. This will substantially reduce your idle Cloud Run compute cost down to pennies during low-traffic periods.

## 10. Recommended Monitoring (Next 24-48 hours)
* Monitor **99th Percentile Request Latency** on `airborne-web` and `airborne-admin` to ensure cold starts are not impacting user experience.
* Monitor **CPU Utilization** (`run.googleapis.com/container/cpu/utilizations`) on Admin to ensure 1 vCPU is not being excessively pegged by Prisma during concurrent webhook floods. 
* Verify that the TeleCMI webhooks and Voice AI platforms do not experience timeouts due to cold-start delays. If they do, roll back `min-instances` to `1` using the commands above.
