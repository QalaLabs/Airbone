/**
 * Canonical entity constants for Airborne Aviation Academy knowledge graph.
 * Only verified, publicly stated site facts — no fabricated claims.
 */

export const SITE_ORIGIN = 'https://www.airborneaviation.in'

export const ORG = {
  name: 'Airborne Aviation Academy',
  alternateName: ['Airborne Aviation', 'Airborne Aviation Academy Dwarka'],
  legalName: 'Airborne Aviation Academy',
  url: SITE_ORIGIN,
  email: 'info@airborneaviation.in',
  telephone: ['+91-9953-777-320', '+91-9818-282-209'],
  foundingDate: '2009',
  priceRange: '₹₹₹',
  description:
    'DGCA-aligned aviation training academy in Dwarka, New Delhi. Offers CPL and ATPL ground school, cadet preparation, cabin crew training, and A320 simulator familiarisation. Founded in 2009; led by Capt. Navrang Singh.',
  logoPath: '/logo-primary.png',
  imagePath: '/campus/og_image.jpg',
  knowsAbout: [
    'DGCA Ground School',
    'CPL Ground Classes',
    'ATPL Ground School',
    'Cadet Pilot Preparation',
    'Commercial Pilot Training',
    'Pilot Career Guidance',
    'Aviation Training',
    'Ground Classes',
    'Cabin Crew Training',
    'A320 Simulator Training',
  ],
  keywords: [
    'DGCA ground school Delhi',
    'CPL ground classes Dwarka',
    'ATPL ground school India',
    'cadet pilot preparation',
    'pilot training academy Delhi',
    'cabin crew training Delhi',
  ],
  sameAs: [
    'https://facebook.com/airborneaviationacademy',
    'https://instagram.com/airborneaviationacademy',
    'https://youtube.com/@airborneaviationacademy',
    'https://www.linkedin.com/company/airborne-aviation-academy',
    'https://maps.app.goo.gl/1CrvhRumCLtog8VL8',
  ],
  areaServed: [
    { '@type': 'City', name: 'New Delhi' },
    { '@type': 'AdministrativeArea', name: 'Delhi NCR' },
    { '@type': 'Country', name: 'India' },
  ],
}

export const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'E-549, 2nd Floor, Ramphal Chowk Road, Sector 7 Dwarka',
  addressLocality: 'New Delhi',
  addressRegion: 'Delhi',
  postalCode: '110075',
  addressCountry: 'IN',
}

/** Coordinates from Google Maps place used on /contact */
export const GEO = {
  '@type': 'GeoCoordinates',
  latitude: 28.5845678,
  longitude: 77.0716207,
}

export const OPENING_HOURS = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: '09:30',
  closes: '18:00',
}

export const FOUNDER = {
  name: 'Capt. Navrang Singh',
  alternateName: ['Captain Navrang Singh', 'Navrang Singh'],
  jobTitle: 'Co-founder & Head Mentor',
  description:
    'Co-founder and Head Mentor at Airborne Aviation Academy. Over 15 years of aviation training experience. Known for concept-focused DGCA ground school instruction and personal mentoring of aspiring commercial pilots.',
  imagePath: '/team/navrang_portrait.jpg',
  knowsAbout: [
    'DGCA CPL Ground School',
    'ATPL Theory',
    'Air Navigation',
    'Aviation Meteorology',
    'Air Regulations',
    'Technical General',
    'Pilot Mentorship',
  ],
  worksForName: ORG.name,
}

/** Co-founders / mentors listed on /about — verified page content only */
export const LEADERSHIP = [
  {
    id: 'capt-navrang-singh',
    name: 'Capt. Navrang Singh',
    jobTitle: 'Co-founder & Head Mentor',
    imagePath: '/team/navrang_portrait.jpg',
    description: FOUNDER.description,
  },
  {
    id: 'deepak-aggarwal',
    name: 'Deepak Aggarwal',
    jobTitle: 'Co-founder & Business Head',
    imagePath: '/team/deepak_portrait.jpg',
    description:
      'Co-founder and Business Head at Airborne Aviation Academy. Leads commercial growth, parent counselling frameworks, and institutional partnerships.',
  },
]

export const SERVICES = [
  {
    id: 'pilot-career-counselling',
    name: 'Pilot Career Counselling',
    description:
      'Free counselling sessions for aspiring pilots covering DGCA pathways, course selection, timelines, and career planning at Airborne Aviation Academy, Dwarka.',
    urlPath: '/contact',
  },
  {
    id: 'admission-guidance',
    name: 'Admission Guidance',
    description:
      'Guidance on eligibility, batch enrolment, documentation, and joining DGCA ground school and related aviation programs.',
    urlPath: '/contact',
  },
  {
    id: 'dgca-guidance',
    name: 'DGCA Exam Guidance',
    description:
      'Structured guidance for DGCA written examinations including subject planning, mock papers, and viva readiness.',
    urlPath: '/courses/ground-school',
  },
  {
    id: 'flying-school-consultation',
    name: 'Flying School Consultation',
    description:
      'Counselling to compare flying training options in India and abroad, including cost and DGCA conversion considerations.',
    urlPath: '/courses/flying-training-india-abroad',
  },
  {
    id: 'interview-preparation',
    name: 'Airline Interview Preparation',
    description:
      'GD/PI and airline interview preparation for cadet and airline selection processes.',
    urlPath: '/courses/airline-preparation',
  },
  {
    id: 'career-mentorship',
    name: 'Career Mentorship',
    description:
      'Ongoing mentorship from Capt. Navrang Singh and the Airborne training team for CPL and airline pathways.',
    urlPath: '/about',
  },
]

/** Absolute URL helper */
export function absUrl(path = '/') {
  if (!path) return SITE_ORIGIN
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path.replace(/^http:\/\//i, 'https://')
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${normalized}`
}
