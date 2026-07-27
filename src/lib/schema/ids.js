import { SITE_ORIGIN, absUrl } from './constants.js'

/** Stable @id builders — single canonical entity per concept */
export const id = {
  org: () => `${SITE_ORIGIN}/#organization`,
  website: () => `${SITE_ORIGIN}/#website`,
  logo: () => `${SITE_ORIGIN}/#logo`,
  place: () => `${SITE_ORIGIN}/#place-dwarka`,
  founder: () => `${SITE_ORIGIN}/#person-capt-navrang-singh`,
  person: (slug) => `${SITE_ORIGIN}/#person-${slug}`,
  course: (slug) => `${SITE_ORIGIN}/#course-${slug}`,
  courseInstance: (slug) => `${SITE_ORIGIN}/#courseinstance-${slug}`,
  offer: (slug) => `${SITE_ORIGIN}/#offer-${slug}`,
  service: (slug) => `${SITE_ORIGIN}/#service-${slug}`,
  webpage: (path) => `${absUrl(path)}#webpage`,
  breadcrumb: (path) => `${absUrl(path)}#breadcrumb`,
  faq: (path) => `${absUrl(path)}#faq`,
  article: (path) => `${absUrl(path)}#article`,
  image: (path) => `${absUrl(path)}#primaryimage`,
  offerCatalog: () => `${SITE_ORIGIN}/#offer-catalog`,
  credential: (slug) => `${SITE_ORIGIN}/#credential-${slug}`,
}
