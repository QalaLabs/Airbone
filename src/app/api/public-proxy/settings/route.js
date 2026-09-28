import { proxyPublicGet } from '@/lib/publicProxy'

export async function GET() {
  return proxyPublicGet('/settings', '/api/public/settings')
}
