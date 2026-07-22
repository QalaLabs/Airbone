import ResourcesClient from './ResourcesClient'

export const metadata = {
  title: 'Free DGCA Study Material CPL Exam Guides & Aviation Career Resources',
  description: 'Download free DGCA CPL study guides, exam practice papers, and career planning tools from Airborne Aviation Academy, Dwarka Delhi.',
  alternates: { canonical: '/resources' },
}

export default function ResourcesPage() {
  return <ResourcesClient />
}
