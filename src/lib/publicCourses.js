/**
 * Public course catalog resolution (SECTION 6 — Phase 2 BD-1).
 *
 * PRIMARY: Admin `Course` records via /api/public/courses (PUBLISHED only).
 * Every card field (title, tag, duration, description, fee) is canonical from
 * Admin. Legacy hardcoded marketing copy below is a DOCUMENTED OFFLINE-ONLY
 * fallback (mirrors pre-Section-6 copy; prices for DB-backed courses use the
 * canonical Admin seed values). It is never rendered when Admin is reachable —
 * resolveCatalogItems() always prefers Admin items and suppresses legacy
 * duplicates of DB-backed courses.
 */

import { displayCourseFee } from '@/lib/courseFees'

/** Admin slug → marketing URL slug (existing marketing convention) */
export function apiToMarketingSlug(apiSlug) {
  return apiSlug === 'cpl-ground-classes'
    ? 'commercial-pilot-license-cpl'
    : apiSlug === 'flying-training'
      ? 'flying-training-india-abroad'
      : apiSlug
}

/** Marketing URL slug → Admin slug */
export function marketingToApiSlug(slug) {
  return slug === 'commercial-pilot-license-cpl'
    ? 'cpl-ground-classes'
    : slug === 'flying-training-india-abroad'
      ? 'flying-training'
      : slug
}

const ACCENT_BY_API_SLUG = {
  'cpl-ground-classes': 'var(--gold)',
  'flying-training': 'var(--red)',
  'cadet-preparation': 'var(--red)',
  'airline-preparation': 'var(--red)',
  'cas-compass-adapt': 'var(--gold)',
  atpl: 'var(--gold)',
  'a320-simulator': 'var(--gold)',
  'cabin-crew': 'var(--gold)',
}

/** ProgramCard shape produced from a canonical Admin course record. */
export function mapApiCourseToProgram(course) {
  const apiSlug = course.slug
  const marketingSlug = apiToMarketingSlug(apiSlug)
  return {
    id: `api-${apiSlug}`,
    title: course.title,
    tag: course.category ?? 'Program',
    duration: course.duration ?? null,
    desc: course.description ?? course.subtitle ?? '',
    price: displayCourseFee(apiSlug, course.fee) ?? 'Contact us',
    href: `/courses/${marketingSlug}`,
    accent: ACCENT_BY_API_SLUG[apiSlug] ?? 'var(--gold)',
  }
}

/**
 * Legacy marketing copy — OFFLINE-ONLY fallback. Mirrors the pre-Section-6
 * catalog exactly so the page never silently loses content while Admin is
 * unreachable. Keys are marketing slugs used for duplicate suppression.
 */
export const LEGACY_COURSE_ITEMS = [
  {
    id: 'legacy-dgca-ground-school',
    title: 'DGCA CPL Ground Classes',
    tag: 'Ground School',
    duration: '3–6 Months',
    desc: 'Intensive ground school covering DGCA CPL subjects. Eligibility: 10+2 Physics & Maths. Duration: 3–6 months. Taught by Capt. Navrang Singh.',
    price: '₹2,70,000',
    href: '/courses/commercial-pilot-license-cpl',
    accent: 'var(--gold)',
    marketingSlug: 'commercial-pilot-license-cpl',
  },
  {
    id: 'legacy-cpl',
    title: 'Commercial Pilot License (CPL)',
    tag: 'Flying Training',
    duration: '12–18 Months',
    desc: 'Complete CPL path with flying training guidance and Indian CPL conversion support. Cost may vary ₹45–75 Lakh (typical ~₹65 Lakh). Duration: 12–18 months.',
    price: '₹65 Lakh*',
    href: '/courses/flying-training-india-abroad',
    accent: 'var(--red)',
    marketingSlug: 'flying-training-india-abroad',
  },
  {
    id: 'legacy-cadet',
    title: 'Cadet Preparation',
    tag: 'Cadet Selection',
    duration: 'Flexible',
    desc: 'The quickest entry into aviation. IndiGo, Air India, and Akasa cadet pilot program preparation.',
    price: '₹50,000',
    href: '/courses/cadet-preparation',
    accent: 'var(--red)',
    marketingSlug: 'cadet-preparation',
  },
  {
    id: 'legacy-airline-prep',
    title: 'Airline Preparation',
    tag: 'Airline Prep',
    duration: '3 Months',
    desc: 'Structured airline interview preparation - GD, PI, and soft skills for IndiGo, Air India, Akasa and more. Duration: 3 months.',
    price: '₹1,00,000',
    href: '/courses/airline-preparation',
    accent: 'var(--red)',
    marketingSlug: 'airline-preparation',
  },
  {
    id: 'legacy-gd-pi',
    title: 'GD & PI Course',
    tag: 'GD / PI',
    duration: '3 Months',
    desc: 'Group discussions, panel interviews, and personal development masterclasses led by retired Air India AGM Rajeet Khalsa. Duration: 3 months.',
    price: '₹30,000',
    href: '/courses/gd-pi',
    accent: 'var(--gold)',
    marketingSlug: 'gd-pi',
  },
  {
    id: 'legacy-cas-compass',
    title: 'CASS Compass Adapt',
    tag: 'Aptitude Test',
    duration: '1 Month',
    desc: 'Structured preparation for airline pilot aptitude test batteries - numerical, spatial, psychomotor, and multi-tasking.',
    price: '₹30,000',
    href: '/courses/cas-compass-adapt',
    accent: 'var(--gold)',
    marketingSlug: 'cas-compass-adapt',
  },
  {
    id: 'legacy-atpl',
    title: 'ATPL Ground School',
    tag: 'Ground School',
    duration: '2–3 Months',
    desc: 'DGCA ATPL written and viva preparation for commercial pilots upgrading toward command. Eligibility: 21 years. Duration: 2–3 months.',
    price: '₹1,50,000',
    href: '/courses/atpl',
    accent: 'var(--gold)',
    marketingSlug: 'atpl',
  },
  {
    id: 'legacy-simulator',
    title: 'Airbus A320 Simulator FBS',
    tag: 'Simulator',
    duration: 'Flexible',
    desc: 'In-house Airbus A320 FBS simulator. Eligibility: CPL. Type rating familiarisation and airline SIM prep.',
    price: '₹10,000',
    href: '/courses/a320-simulator',
    accent: 'var(--gold)',
    marketingSlug: 'a320-simulator',
  },
  {
    id: 'legacy-flying-guide',
    title: "Securing Your Child's Future in Aviation",
    tag: 'Parents',
    duration: 'Flexible',
    desc: 'Comprehensive CPL flight training guidance and Indian CPL conversion support - built for parents and aspirants.',
    price: 'Free',
    href: '/courses/securing-your-childs-future-in-aviation',
    accent: 'var(--red)',
    marketingSlug: 'securing-your-childs-future-in-aviation',
  },
  {
    id: 'legacy-cabin-crew',
    title: 'Cabin Crew Training',
    tag: 'Hospitality',
    duration: '3–6 Months',
    desc: 'Cabin crew & aviation hospitality training with 100%* scholarship offer upon scoring ≥70%.',
    price: '₹54,000',
    href: '/courses/cabin-crew-training',
    accent: 'var(--gold)',
    marketingSlug: 'cabin-crew-training',
  },
  {
    id: 'legacy-ppl',
    title: 'Private Pilot License (PPL)',
    tag: 'Flying Training',
    duration: '3–6 Months',
    desc: 'Initial pilot license program. Complete flight training hours and ground school preparation for private pilot license certification.',
    price: '₹25,00,000',
    href: '/courses/private-pilot-license',
    accent: 'var(--red)',
    marketingSlug: 'private-pilot-license',
  },
]

/**
 * Build the final catalog: Admin PUBLISHED courses first (their order), then
 * legacy static-only courses whose marketing slug has no Admin record. Returns
 * null-safe array. `apiCourses` is the raw /api/public/courses payload.
 */
export function resolveCatalogItems(apiCourses) {
  const items = (Array.isArray(apiCourses) ? apiCourses : []).map(mapApiCourseToProgram)
  const presentMarketingSlugs = new Set(
    (Array.isArray(apiCourses) ? apiCourses : []).map((c) => apiToMarketingSlug(c.slug)),
  )
  const legacy = LEGACY_COURSE_ITEMS.filter((l) => !presentMarketingSlugs.has(l.marketingSlug))
  return [...items, ...legacy]
}