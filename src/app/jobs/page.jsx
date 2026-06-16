import JobsClient from './JobsClient'

export const metadata = {
  title: 'Aviation Jobs India 2026 — Pilot & Cabin Crew | Airborne Aviation',
  description: 'Aviation job listings in India 2026. Pilot, First Officer, Cabin Crew & dispatcher roles. Airborne graduates placed at IndiGo, Air India, Akasa Air.',
  alternates: {
    canonical: 'https://airborneaviation.in/jobs/',
  },
  openGraph: {
    title: 'Aviation Jobs India 2026 — Pilot & Cabin Crew | Airborne Aviation',
    description: 'Aviation job listings in India 2026. Pilot, First Officer, Cabin Crew & dispatcher roles. Airborne graduates placed at IndiGo, Air India, Akasa Air.',
    url: 'https://airborneaviation.in/jobs/',
    type: 'website',
  },
}

const jobPostingsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Aviation Jobs India 2026',
  description: 'Pilot and cabin crew job listings in India. Positions at IndiGo, Air India, Akasa Air, SpiceJet.',
  numberOfItems: 5,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'JobPosting',
        title: 'Junior First Officer — IndiGo Airlines',
        hiringOrganization: { '@type': 'Organization', name: 'IndiGo', sameAs: 'https://www.goindigo.in' },
        jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
        employmentType: 'FULL_TIME',
        qualifications: 'DGCA CPL with 250 flying hours minimum',
        datePosted: '2026-06-01',
        validThrough: '2026-12-31',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'JobPosting',
        title: 'First Officer — Air India',
        hiringOrganization: { '@type': 'Organization', name: 'Air India', sameAs: 'https://www.airindia.com' },
        jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
        employmentType: 'FULL_TIME',
        qualifications: 'DGCA CPL, A320 type rating preferred',
        datePosted: '2026-06-01',
        validThrough: '2026-12-31',
      },
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which airlines are hiring pilots in India in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In 2026, major Indian airlines actively hiring pilots include IndiGo, Air India, Akasa Air, SpiceJet, and Star Air. IndiGo is the largest recruiter, hiring Junior First Officers (JFOs) with a minimum of 250 flying hours and a valid DGCA CPL.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the salary of a First Officer in India in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Junior First Officer (JFO) at IndiGo earns approximately ₹1.5 to ₹2 lakh per month. First Officer salary increases with hours, seniority, and aircraft type. On wide-body aircraft at Air India, First Officers earn ₹2.5 to ₹4 lakh per month.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a fresh CPL holder get a pilot job in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. IndiGo and Akasa Air hire fresh CPL holders as Junior First Officers, provided they have 250+ hours and a clean DGCA record. Airborne Aviation Academy provides placement support and interview preparation for graduates.',
      },
    },
  ],
}

export default function JobsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <JobsClient />
    </>
  )
}
