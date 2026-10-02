import { proxyPublicGet } from '@/lib/publicProxy'

export async function GET(req) {
  const course = (new URL(req.url).searchParams.get('course') ?? '').slice(0, 255)
  return proxyPublicGet('/courses/eligibility', `/api/public/courses/eligibility?course=${encodeURIComponent(course)}`)
}
