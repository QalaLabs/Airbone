import { proxyPublicGet } from '@/lib/publicProxy'

export async function GET() {
  return proxyPublicGet('/google-reviews', '/api/public/google-reviews', { revalidate: 3600 })
}
