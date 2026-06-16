import ResourcesClient from './ResourcesClient'
import { getFAQSchema } from '@/utils/seo'

export const metadata = {
  title: 'Free DGCA CPL Study Guides & Pilot Training Resources | Airborne',
  description: 'Free downloadable DGCA CPL prep handbooks, cabin crew interview guides & pilot career FAQs from Airborne Aviation Academy, Dwarka, New Delhi.',
  alternates: {
    canonical: 'https://airborneaviation.in/resources/',
  },
  openGraph: {
    title: 'Free DGCA CPL Study Guides & Pilot Training Resources | Airborne',
    description: 'Free downloadable DGCA CPL prep handbooks, cabin crew interview guides & pilot career FAQs from Airborne Aviation Academy, Dwarka, New Delhi.',
    url: 'https://airborneaviation.in/resources/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free DGCA CPL Study Guides & Pilot Training Resources | Airborne',
    description: 'Free downloadable DGCA CPL prep handbooks, cabin crew interview guides & pilot career FAQs.',
  },
}

const faqSchema = getFAQSchema()

export default function ResourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ResourcesClient />
    </>
  )
}
