import JobsClient from './JobsClient'

export async function generateMetadata() {
  return {
    title: 'Pilot Jobs India 2026 | Aviation Career Portal | Airborne',
    description: "Browse CPL, ATPL & cadet pilot job listings curated for aviation graduates. Airborne Aviation's free job portal, updated regularly. Find your airline career today.",
  }
}

export default function JobsPage() {
  return <JobsClient />
}
