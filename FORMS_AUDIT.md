# FORMS_AUDIT.md

One shared component drives every form on the site: `LeadForm.jsx` (fields) + `FormField.jsx` (inputs) + `/api/lead` (submit endpoint). Contact page, all course pages, homepage modal, footer, and course-page CTA all reuse this same pair — audit one, audit all.

## Where LeadForm is used
Contact page, homepage modal, course detail pages (flagship banner + sidebar), `CoursePageFooter.jsx`. Sticky mobile CTA (`StickyMobileCTA.jsx`) and `WhatsAppFloat.jsx` are **not forms** — they're `tel:`/`wa.me` links, no validation applicable. No separate "callback request" or "newsletter" form found anywhere in the codebase.

## Client-side (`LeadForm.jsx` / `FormField.jsx` / `useFormValidation` hook / `validation.js`)
| Check | Status | Detail |
|---|---|---|
| Required field validation | ✅ | `validateName/Phone/Email/Pincode/Required` wired per field via `useFormValidation` |
| Email validation | ✅ | Regex-based in `validation.js`, re-validated server-side too |
| Phone validation | ✅ | Digits-only enforced live in `FormField.jsx` (`handleChange` strips non-digits for `type="tel"`), max 10 |
| Empty state | ✅ | `SubmitButton` disabled while `!isValid` |
| Loading state | ✅ | `status === 'loading'` passed to `SubmitButton` |
| Success state | ✅ | Dedicated success panel with Call/WhatsApp/Explore-Courses follow-ups |
| Error state shown to user | 🔴 **Bug** | `handleSubmit` catches both non-OK responses *and* network errors and shows the **same generic "Lead Captured" toast regardless of actual failure** ([LeadForm.jsx:49-56](src/components/LeadForm.jsx:49)). A real validation failure or rate-limit (429) from the API is invisible to the user — they're told it worked when it didn't. Not auto-fixed — needs a product decision on what error copy to show |
| Duplicate submission prevention | 🟡 Partial | Button disables during `loading`, but nothing blocks rapid resubmission after a completed success (form doesn't unmount/reset guard) |
| Accessible labels | ✅ Fixed this session | `FormField.jsx` had **zero** `<label>`/`aria-label` anywhere — placeholder-only fields fail WCAG 1.3.1/4.1.2. Added `aria-label` to both `<input>` and `<select>` this session — [FormField.jsx](src/components/FormField.jsx) |
| Mobile usability | ✅ | `type="tel"` triggers numeric keypad; inputs sized via existing responsive CSS classes |
| `autoComplete="off"` on all fields | 🟡 Flag | Blocks browser autofill for name/phone/email — hurts conversion on mobile, no functional reason found for disabling it. Product call, not auto-changed |

## Server-side (`/api/lead/route.js`)
| Check | Status | Detail |
|---|---|---|
| Required-field validation | ✅ | Name (non-empty, ≤100 chars), phone (regex `^\+?[0-9]{7,15}$`), email (RFC-ish regex if provided) |
| Sanitization / injection guard | ✅ | `hasScriptInjection()` blocks `<script>`, `<iframe>`, `on*=`, `javascript:`, raw `<`/`>` across all fields |
| Rate limiting | ✅ | `rateLimit(req)` → 429 on abuse |
| CRM/upstream integration | ✅ | POSTs to `${ADMIN_API_URL}/api/public/leads` with `x-intake-key` auth header |
| Timeout protection | ✅ | `AbortController`, 10s default (`UPSTREAM_FETCH_TIMEOUT`) |
| Failure handling | ✅ | On upstream failure/timeout, falls back to `storeFallbackLead()` (local durability) instead of silently dropping the lead, then returns real `500` only if *that* also fails |
| Duplicate-submission guard server-side | ⚪ None found | No idempotency key / dedup check on payload — a client-side double-click during the network round-trip could create two upstream leads |
| Webhooks (n8n WhatsApp, Voice AI) | ✅ | Fire-and-forget, failure logged with correlationId, doesn't block the response |
| Structured logging | ✅ | Every branch logs a JSON line with `correlationId` — real diagnosability, unlike what `backend_audit_report.md` describes |

## Important correction to prior audit
`backend_audit_report.md` (dated Jun 23) calls lead handling a "launch blocker" — **silent lead loss, error swallowing, no rate limiting, no sanitization.** Current `/api/lead/route.js` has none of those problems: rate limiting, sanitization, and fallback-storage durability were added in commit `35987f5` ("implement rate limiting, fallback lead durability, and robust proxy error handling") the same day. **That audit file is now stale for the lead-capture path specifically** — its findings on the `/api/public-proxy/*` content routes (courses/jobs/blogs) still hold, but the lead form conclusion should not be repeated as current.

## Fixed this session
- ✅ `FormField.jsx` — added `aria-label` to input and select (accessibility gap, sitewide impact since one component)

## Needs your decision (not auto-changed)
- Error toast currently lies to the user on failure — what should it say instead?
- Whether to enable `autoComplete` on name/phone/email fields
- Whether a client + server dedup guard is worth adding for double-submit protection
