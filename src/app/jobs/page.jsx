import JobsClient from './JobsClient'

export async function generateMetadata() {
  return {
    title: 'Aviation Jobs in India 2026 Pilot, Cabin Crew & Ground Staff | Airborne',
    description: 'Browse aviation job opportunities in India. Pilots, cabin crew, ground staff. Updated weekly.',
  }
}

export default function JobsPage() {
  return <JobsClient />
}
