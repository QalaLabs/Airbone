import { proxyPublicGet } from '@/lib/publicProxy'

export async function GET() {
  return proxyPublicGet('/jobs', '/api/public/jobs?limit=50')
}
