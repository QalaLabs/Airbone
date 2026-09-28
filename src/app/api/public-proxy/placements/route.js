import { proxyPublicGet, clampLimit } from '@/lib/publicProxy'

export async function GET(req) {
  const url = new URL(req.url)
  const limit = clampLimit(url.searchParams.get('limit'), 50, 100)
  return proxyPublicGet('/placements', `/api/public/placements?limit=${limit}`)
}
