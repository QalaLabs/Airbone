import JobsClient from './JobsClient'

export async function generateMetadata() {
  return {
    title: 'Aviation Jobs in India 2026 | Airborne Aviation',
    description: 'Browse aviation job opportunities in India. Pilots, cabin crew, ground staff. Updated weekly.',
    alternates: { canonical: '/jobs' },
  }
}

export default function JobsPage() {
  return <JobsClient />
}
