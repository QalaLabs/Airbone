import {
  ORG,
  ADDRESS,
  GEO,
  OPENING_HOURS,
  FOUNDER,
  LEADERSHIP,
  SERVICES,
  absUrl,
} from './constants.js'
import { id } from './ids.js'

export function buildLogoImage() {
  return {
    '@type': 'ImageObject',
    '@id': id.logo(),
    url: absUrl(ORG.logoPath),
    contentUrl: absUrl(ORG.logoPath),
    caption: `${ORG.name} logo`,
    width: 512,
    height: 512,
  }
}

export function buildPrimaryImage(path, caption) {
  if (!path) return null
  const url = absUrl(path)
  return {
    '@type': 'ImageObject',
    '@id': id.image(path),
    url,
    contentUrl: url,
    caption: caption || ORG.name,
  }
}

export function buildPlace() {
  return {
    '@type': 'Place',
    '@id': id.place(),
    name: `${ORG.name} — Dwarka Centre`,
    address: ADDRESS,
    geo: GEO,
    telephone: ORG.telephone[0],
    url: absUrl('/contact'),
  }
}

export function buildFounderPerson({ includeFull = true } = {}) {
  const person = {
    '@type': 'Person',
    '@id': id.founder(),
    name: FOUNDER.name,
    alternateName: FOUNDER.alternateName,
    url: absUrl('/about'),
    image: absUrl(FOUNDER.imagePath),
    jobTitle: FOUNDER.jobTitle,
    worksFor: { '@id': id.org() },
    affiliation: { '@id': id.org() },
    mainEntityOfPage: absUrl('/about'),
  }

  if (includeFull) {
    person.description = FOUNDER.description
    person.knowsAbout = FOUNDER.knowsAbout
    person.hasOccupation = {
      '@type': 'Occupation',
      name: 'Aviation Ground Instructor & Mentor',
      occupationalCategory: '25-1194.00',
      skills: FOUNDER.knowsAbout.join(', '),
    }
  }

  return person
}

export function buildLeadershipPeople() {
  // Founder is emitted separately via buildFounderPerson() to avoid duplicate @id
  return LEADERSHIP.filter((p) => p.id !== 'capt-navrang-singh').map((p) => ({
    '@type': 'Person',
    '@id': id.person(p.id),
    name: p.name,
    jobTitle: p.jobTitle,
    description: p.description,
    image: absUrl(p.imagePath),
    worksFor: { '@id': id.org() },
    url: absUrl('/about'),
  }))
}

export function buildServices() {
  return SERVICES.map((s) => ({
    '@type': 'Service',
    '@id': id.service(s.id),
    name: s.name,
    description: s.description,
    url: absUrl(s.urlPath),
    provider: { '@id': id.org() },
    areaServed: ORG.areaServed,
    serviceType: s.name,
  }))
}

/**
 * Canonical organization node — EducationalOrganization + LocalBusiness
 * in one entity to avoid duplicate org graphs.
 */
export function buildOrganization({ includeCatalog = false, includeServices = false } = {}) {
  const org = {
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': id.org(),
    name: ORG.name,
    alternateName: ORG.alternateName,
    legalName: ORG.legalName,
    description: ORG.description,
    url: ORG.url,
    logo: { '@id': id.logo() },
    image: [absUrl(ORG.imagePath), absUrl(ORG.logoPath)],
    telephone: ORG.telephone,
    email: ORG.email,
    address: ADDRESS,
    geo: GEO,
    openingHoursSpecification: OPENING_HOURS,
    priceRange: ORG.priceRange,
    sameAs: ORG.sameAs,
    foundingDate: ORG.foundingDate,
    founder: { '@id': id.founder() },
    employee: LEADERSHIP.map((p) => ({ '@id': id.person(p.id) })),
    areaServed: ORG.areaServed,
    knowsAbout: ORG.knowsAbout,
    keywords: ORG.keywords.join(', '),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'admissions',
        telephone: ORG.telephone[0],
        email: ORG.email,
        availableLanguage: ['English', 'Hindi'],
        areaServed: 'IN',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: ORG.telephone[0],
        email: ORG.email,
        availableLanguage: ['English', 'Hindi'],
      },
    ],
    brand: {
      '@type': 'Brand',
      name: ORG.name,
      logo: absUrl(ORG.logoPath),
    },
    mainEntityOfPage: absUrl('/'),
  }

  if (includeServices) {
    org.hasOfferCatalog = { '@id': id.offerCatalog() }
    org.makesOffer = SERVICES.map((s) => ({ '@id': id.service(s.id) }))
  }

  if (includeCatalog) {
    org.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      '@id': id.offerCatalog(),
      name: 'Aviation Training Programs',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Pilot Ground School',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@id': id.course('commercial-pilot-license-cpl') } },
            { '@type': 'Offer', itemOffered: { '@id': id.course('ground-school') } },
            { '@type': 'Offer', itemOffered: { '@id': id.course('atpl') } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Airline & Cadet Preparation',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@id': id.course('cadet-preparation') } },
            { '@type': 'Offer', itemOffered: { '@id': id.course('airline-preparation') } },
            { '@type': 'Offer', itemOffered: { '@id': id.course('gd-pi') } },
            { '@type': 'Offer', itemOffered: { '@id': id.course('cas-compass-adapt') } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Simulator & Cabin Crew',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@id': id.course('a320-simulator') } },
            { '@type': 'Offer', itemOffered: { '@id': id.course('cabin-crew-training') } },
          ],
        },
      ],
    }
  }

  return org
}

export function buildWebsite() {
  return {
    '@type': 'WebSite',
    '@id': id.website(),
    url: ORG.url,
    name: ORG.name,
    description: ORG.description,
    publisher: { '@id': id.org() },
    inLanguage: 'en-IN',
    // No SearchAction — site has no internal search endpoint
  }
}
