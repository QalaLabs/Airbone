import { proxyPublicGet } from '@/lib/publicProxy'

export async function GET() {
  return proxyPublicGet('/resources', '/api/public/resources?limit=50')
}
