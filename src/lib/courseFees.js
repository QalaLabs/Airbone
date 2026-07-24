/**
 * Canonical course fees from Airborne_Page_Content_v6 (Qala Labs, June 2026).
 *
 * IMPORTANT: Any surface that shows a course fee MUST call displayCourseFee().
 * Never render Admin DB `fee` alone — prod DB has drifted before and hid PDF prices.
 */

import { formatFee } from '@/lib/adminApi'

/** slug → display string shown on cards, sidebars, schemas */
export const COURSE_FEE_DISPLAY = {
  'cpl-ground-classes': '₹2,70,000',
  'commercial-pilot-license-cpl': '₹2,70,000',
  'ground-school': '₹2,70,000',
  atpl: '₹1,50,000',
  'cadet-preparation': '₹50,000',
  'cas-compass-adapt': '₹30,000',
  'screening-prep': '₹30,000',
  'airline-preparation': '₹1,00,000',
  'gd-pi-mastery': '₹1,00,000',
  'a320-simulator': '₹10,000/hr',
  'airbus-a320-sim-training': '₹10,000/hr',
  'cabin-crew': '₹30K–₹54K',
  'cabin-crew-training': '₹30K–₹54K',
  'flying-training': '₹55L+ onwards',
  'flying-training-india-abroad': '₹55L+ onwards',
  'private-pilot-license': '₹25,00,000',
  'instrument-rating': '₹3–5L',
  'multi-engine-rating': '₹3–5L',
  'aviation-english-icao': '₹50K–1L',
}

/** Numeric seed / Admin values for courses that have a single list price */
export const COURSE_FEE_NUMERIC = {
  'cpl-ground-classes': 270000,
  'ground-school': 270000,
  atpl: 150000,
  'cadet-preparation': 50000,
  'cas-compass-adapt': 30000,
  'airline-preparation': 100000,
  'a320-simulator': 10000,
  'cabin-crew': 54000,
  /** Minimum band for complete CPL flying — display uses ₹55L+ onwards */
  'flying-training': 5500000,
  'private-pilot-license': 2500000,
}

/** PDF eligibility overrides (Cabin Crew CHANGE: 18–27 yrs) */
export const COURSE_ELIGIBILITY_DISPLAY = {
  'cabin-crew': '12th pass, 18–27 yrs',
  'cabin-crew-training': '12th pass, 18–27 yrs',
}

/**
 * Resolve fee label for UI. Locked PDF string wins over DB every time.
 * @param {string} slug
 * @param {number|string|null|undefined} dbFee
 * @returns {string|null}
 */
export function displayCourseFee(slug, dbFee) {
  if (slug && COURSE_FEE_DISPLAY[slug]) return COURSE_FEE_DISPLAY[slug]
  return formatFee(dbFee) ?? null
}

/**
 * @param {string} slug
 * @param {string|null|undefined} dbEligibility
 */
export function displayCourseEligibility(slug, dbEligibility) {
  if (slug && COURSE_ELIGIBILITY_DISPLAY[slug]) return COURSE_ELIGIBILITY_DISPLAY[slug]
  return dbEligibility || 'Class 12 or above'
}
