# ACCESSIBILITY_AUDIT.md

**Honesty note:** No axe-core/Lighthouse/screen-reader pass was run (no live browser access this session). This is a static-code review — real findings where the code itself proves a gap, explicit "unverifiable" flags for anything needing a running page (contrast ratio, actual tab order, live screen-reader behavior).

## Fixed this session
- 🔴→✅ **Form fields had zero accessible names.** `FormField.jsx` (the single component behind every form on the site) had no `<label>`, `htmlFor`, or `aria-label` anywhere — inputs relied purely on `placeholder`, which most screen readers drop once a value is entered and which fails WCAG 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value). Added `aria-label` to both the `<input>` and `<select>` branches — [FormField.jsx](src/components/FormField.jsx). Fixes every form sitewide in one place.

## Checked, looks correct
- `Header.jsx` / `Navigation.jsx` — `aria-label` present on nav/phone/menu elements (4 and 7 occurrences respectively).
- Social icons in `PremiumFooter.jsx` — `aria-label="Call Airborne Aviation"` / `"WhatsApp Airborne Aviation"` present on the outbound action buttons.
- Semantic landmarks — `<header>`/`<main>`/`<footer>` used consistently across page templates (seen in every page read this session, e.g. `courses/page.jsx`, `contact/page.jsx`).
- Focus-visible styling — `.compare-course-link:focus-visible` custom outline found in [courses/page.jsx:239-243](src/app/courses/page.jsx:239), shows deliberate focus-state design intent, not an oversight elsewhere.

## Flagged, not fixed (needs product/design input, not a mechanical fix)
- `LeadForm.jsx` error toast on failed submission shows generic success-shaped copy regardless of real outcome — an accessibility *and* honesty problem (screen-reader users get an announced "success" state that's false). See FORMS_AUDIT.md.
- `autoComplete="off"` hardcoded on every form input — actively fights browser/assistive-tech autofill, which is itself an accessibility aid for users with motor or cognitive impairments. No functional reason found for disabling it.
- No custom `not-found.jsx` (404 page) — default Next 404 is minimally accessible but unbranded and low-context for a lost user.

## Cannot verify without live tooling
- **Color contrast ratios** — the site uses a dark navy/gold/red palette extensively (`rgba(255,255,255,0.4-0.7)` text on dark backgrounds appears very frequently in the inline styles reviewed, e.g. `rgba(255,255,255,0.4)` labels, `rgba(255,255,255,0.55)` copyright text). Several of these translucent-white-on-navy combinations are visually plausible risks for WCAG AA (4.5:1 body text / 3:1 large text) failure but **cannot be confirmed without a live contrast checker against actual rendered colors**. Recommend running the deployed site through axe DevTools or Lighthouse's contrast check once production is caught up.
- **Real tab order** — needs a live keyboard walkthrough; static JSX order is a reasonable proxy but doesn't account for CSS `order`/flex-reverse tricks (none found in the files reviewed, but not exhaustively checked).
- **Screen reader announcement behavior** (toast messages, dynamic error states, loading spinners) — needs VoiceOver/NVDA, not obtainable from source review alone.
