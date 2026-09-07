/**
 * Canonical course fees (SECTION 6 — Phase 1, BD-1).
 *
 * The Admin DB `Course.fee` field is the SINGLE source of truth for public fees.
 * Any surface that shows a course fee MUST resolve it through displayCourseFee()
 * (or courseFeeNumeric() for schema prices) and pass the Admin fee as `dbFee`.
 *
 * The hardcoded display map was removed because it drifted from the DB:
 *   - a320-simulator: stale ₹12,000, Admin DB = ₹10,000
 *   - airline-preparation: stale ₹1,25,000, Admin DB = ₹1,00,000
 *
 * A small set of NON-AUTHORITATIVE exceptions remains ONLY for values that have
 * no single canonical answer in the Admin DB today:
 *   - Courses with NO DB record yet (legacy static marketing pages) — flagged
 *     as CONFIGURATION REQUIRED in SECTION_6_RESULT.md until migrated into Admin.
 *   - Programs quoted as a band (no single price exists).
 * Each exception carries an explicit `reason`. Do not add entries casually.
 */

import { formatFee } from '@/lib/adminApi'

/**
 * Documented, non-authoritative fee labels.
 * key: marketing slug (canonical DB slug takes precedence for DB-backed courses).
 */
const COURSE_FEE_EXCEPTIONS = {
  /* Band / variable-cost programs — no single price exists; documented deliberately. */
  'flying-training': {
    label: '₹65 Lakh* (45–75 Lacs)',
    numeric: null,
    overrideDb: true,
    reason: 'Variable-cost CPL flying training — no single canonical price; Admin fee 55L is a placeholder, never displayed (BD-1 exception).',
  },
  'flying-training-india-abroad': {
    label: '₹65 Lakh* (45–75 Lacs)',
    numeric: null,
    overrideDb: true,
    reason: 'Variable-cost CPL flying training — no single canonical price; Admin fee 55L is a placeholder, never displayed (BD-1 exception).',
  },
  'private-pilot-license': {
    label: '₹25,00,000',
    numeric: 2500000,
    reason: 'Legacy static-only course (no Admin record); documented pending migration.',
  },
  'multi-engine-rating': {
    label: '₹3–5L',
    numeric: null,
    reason: 'Band quote, no single price; legacy static-only course.',
  },
  'aviation-english-icao': {
    label: '₹50K–1L',
    numeric: null,
    reason: 'Band quote, no single price; legacy static-only course.',
  },
  /* Legacy static-only courses awaiting Admin migration (CONFIGURATION REQUIRED). */
  'ground-school': {
    label: '₹2,70,000',
    numeric: 270000,
    reason: 'Legacy static-only course (no Admin record); documented pending migration.',
  },
  'gd-pi': {
    label: '₹30,000',
    numeric: 30000,
    reason: 'Legacy static-only course (no Admin record); documented pending migration.',
  },
  'gd-pi-mastery': {
    label: '₹30,000',
    numeric: 30000,
    reason: 'Legacy static-only course (no Admin record); documented pending migration.',
  },
  'screening-prep': {
    label: '₹30,000',
    numeric: 30000,
    reason: 'Legacy static-only course (no Admin record); documented pending migration.',
  },
  'securing-your-childs-future-in-aviation': {
    label: 'Free',
    numeric: null,
    reason: 'Free parent-guidance resource (no fee), not a sold program.',
  },
}

/**
 * Resolve the fee label shown on cards, sidebars and schemas.
 * Admin DB fee is authoritative; exceptions apply only where no DB fee exists.
 * @param {string|null|undefined} slug
 * @param {number|string|null|undefined} dbFee
 * @returns {string|null}
 */
export function displayCourseFee(slug, dbFee) {
  // Band-quoted programs keep their documented label even when a placeholder
  // Admin fee exists (never digit-strip a deliberately quoted range).
  if (slug && COURSE_FEE_EXCEPTIONS[slug]?.overrideDb) return COURSE_FEE_EXCEPTIONS[slug].label
  const parsed = typeof dbFee === 'string' ? Number(dbFee) : dbFee
  if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0) {
    return formatFee(parsed)
  }
  if (slug && COURSE_FEE_EXCEPTIONS[slug]) return COURSE_FEE_EXCEPTIONS[slug].label
  return null
}

/**
 * Resolve the numeric fee for structured data (Course/Offer JSON-LD).
 * Admin DB fee is authoritative. Returns null when only a band/exception exists
 * (never fabricate a single number for a quoted range).
 * @param {string|null|undefined} slug
 * @param {number|string|null|undefined} dbFee
 * @returns {number|null}
 */
export function courseFeeNumeric(slug, dbFee) {
  // Never emit a single number for a band-quoted program (schema Offer absent).
  if (slug && COURSE_FEE_EXCEPTIONS[slug]?.overrideDb) return COURSE_FEE_EXCEPTIONS[slug].numeric ?? null
  const parsed = typeof dbFee === 'string' ? Number(dbFee) : dbFee
  if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }
  if (slug && COURSE_FEE_EXCEPTIONS[slug]) return COURSE_FEE_EXCEPTIONS[slug].numeric ?? null
  return null
}

/**
 * Resolve eligibility text. Admin DB `Course.eligibility` is authoritative.
 * @param {string|null|undefined} slug
 * @param {string|null|undefined} dbEligibility
 * @returns {string}
 */
export function displayCourseEligibility(slug, dbEligibility) {
  return dbEligibility || 'Class 12 or above'
}

export { COURSE_FEE_EXCEPTIONS }