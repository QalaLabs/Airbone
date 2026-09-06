# PENDING CHANGES REPORT

Based on the audit of the backend APIs, permission errors, and user journey functionality, the following list details the issues that need to be addressed. As requested, no code changes have been made in this phase.

## 1. Backend API Errors
* **Hardcoded Fallbacks:** The `src/app/api/public-proxy/*` routes rely on hardcoded fallback URLs (e.g., `http://localhost:4000`) for the `ADMIN_API_URL` environment variable. If the variable is missing or the external server is down, this degrades the site silently, causing proxy requests to fail while returning potentially empty data to clients. This should be explicitly caught and handled properly.
* **Lack of Dead-Letter Queue / Robust Retries:** While `/api/lead` currently uses a `storeFallbackLead` functionality on failure, the mechanism lacks robust retry queues (like SQS, Redis, etc.) ensuring that a failed lead is guaranteed to reach the CRM once connection restores.
* **Error Swallowing:** Although the proxy routes catch exceptions and return `502 Upstream Error`, relying only on `console.error` provides no operational visibility. When the upstream API errors, it should log to a monitoring service (like Datadog/Sentry) for observability.

## 2. Permission and Security Errors
* **Open Endpoints:** The proxy endpoints in `/api/public-proxy/*` and the form submission route (`/api/lead`) are open to the public without stringent origin restrictions. This could be abused via raw cURL requests bypassing the frontend.
* **No Spam Protection on `/api/lead`:** The endpoint `/api/lead` has basic rate limiting but completely lacks CAPTCHA, Cloudflare Turnstile, or honeypot fields. Malicious actors can script thousands of submissions, effectively DDoSing the upstream API, CRM, n8n, and Voice AI webhooks.
* **Lack of Deep Validation / Sanitization Vectors:** Input fields in the lead capture API are only validated for maximum length and simple regex for email/phone. There's no deep structural validation or structural sanitization on fields (like `course`, `pincode`, `message`) before being forwarded to the upstream `ADMIN_API_URL`.

## 3. User Journey and Functional Issues
* **False Positive Feedback for Failed Leads:** If a user submits a lead and the upstream CRM/Database fails, they might see a "Success" message if the fallback queue also somehow masks or fails to accurately record the problem (or if webhooks fail entirely without notifying the user journey).
* **Dead Dependency:** `@supabase/supabase-js` remains in `package.json` but is unused across the codebase. It needlessly inflates the application weight and should be removed.
* **Proxy Timeout & ISR Cache Poisoning:** For the proxy endpoints, a 500 error or a timeout from the upstream admin database could lead to cached empty states (`[]`) if Next.js caching layers misinterpret fallback responses. This could make course pages appear empty to users for up to 60 seconds (due to `next: { revalidate: 60 }`).

## Proposed Plan of Action (Future Fixes)
1. Implement a proper spam protection mechanism (e.g., Turnstile) in the frontend and validate the token in `/api/lead`.
2. Add structured logging/alerting (e.g., Sentry) across all catch blocks.
3. Remove the dead `@supabase/supabase-js` dependency.
4. Improve origin checking / CORS for API routes.
5. Enhance input validation using a schema validator (like Zod) in `/api/lead`.
6. Enforce that `ADMIN_API_URL` is set during application boot rather than falling back to localhost silently.
