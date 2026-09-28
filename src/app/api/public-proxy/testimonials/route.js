import { proxyPublicGet, clampLimit } from '@/lib/publicProxy'

export async function GET(req) {
  const url = new URL(req.url)
  const limit = clampLimit(url.searchParams.get('limit'), 6, 20)
  return proxyPublicGet('/testimonials', `/api/public/testimonials?limit=${limit}`)
}
