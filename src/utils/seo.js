/**
 * SEO / Schema helpers — thin compatibility layer over the knowledge graph module.
 * New code should import from `@/lib/schema` directly.
 */

import {
  buildOrganization,
  buildWebsite,
  buildLogoImage,
  buildFounderPerson,
  buildPlace,
  buildBreadcrumbList,
  buildFaqPage,
  buildCourseEntity,
  asGraph,
  sanitizeSchemaText,
  absUrl,
  ORG,
  ADDRESS,
  GEO,
  OPENING_HOURS,
} from '@/lib/schema'

/** @deprecated Prefer buildHomeGraph / buildContactGraph — kept for gradual migration */
export function getLocalBusinessSchema() {
  return asGraph([
    buildLogoImage(),
    buildOrganization(),
    buildWebsite(),
    buildPlace(),
    buildFounderPerson(),
  ])
}

/** @deprecated Prefer buildHomeGraph — single org entity with @id */
export function getEducationalOrgSchema() {
  return asGraph([
    buildLogoImage(),
    buildOrganization(),
    buildFounderPerson(),
  ])
}

export function getCourseSchema(course) {
  const slug = course.slug || 'course'
  const { course: courseNode, courseInstance, offer } = buildCourseEntity({
    slug,
    name: course.title || course.name,
    description: sanitizeSchemaText(course.overview || course.tagline || course.description || ''),
    path: `/courses/${slug}`,
    price: course.price,
    duration: course.duration,
    courseMode: 'blended',
  })
  return asGraph([
    buildLogoImage(),
    buildOrganization(),
    buildPlace(),
    buildFounderPerson({ includeFull: false }),
    courseNode,
    courseInstance,
    offer,
  ])
}

export function getBreadcrumbSchema(links) {
  const path = links[links.length - 1]?.path || '/'
  return {
    '@context': 'https://schema.org',
    ...buildBreadcrumbList(links, path),
  }
}

/**
 * Resources FAQ — factual answers only (no unverifiable 100% pass-rate claim).
 * Must stay aligned with visible FAQ content on /resources.
 */
export const RESOURCES_FAQS = [
  {
    q: 'How many students are allowed per batch?',
    a: 'To ensure individual focus, each batch is capped at a maximum of 25 students.',
  },
  {
    q: 'Do you offer simulator training in Delhi?',
    a: 'Yes. Airborne has an in-house Airbus A320 FTD Level 5 flight trainer at the Dwarka centre in New Delhi.',
  },
  {
    q: 'Where is Airborne Aviation Academy located?',
    a: 'E-549, 2nd Floor, Ramphal Chowk Road, Sector 7 Dwarka, New Delhi 110075. Contact: +91 9953 777 320.',
  },
]

export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    ...buildFaqPage(RESOURCES_FAQS, '/resources'),
  }
}

export {
  asGraph,
  sanitizeSchemaText,
  absUrl,
  ORG,
  ADDRESS,
  GEO,
  OPENING_HOURS,
}
