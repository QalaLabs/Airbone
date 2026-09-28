import { proxyPublicGet, clampLimit } from '@/lib/publicProxy'

export async function GET(req) {
  const url = new URL(req.url)
  // Catalog pages request everything published; upstream caps at 50.
  const limit = clampLimit(url.searchParams.get('limit'), 100, 100)
  const slug = url.searchParams.get('slug')
  let path = `/api/public/courses?limit=${limit}`
  if (slug) path += `&slug=${encodeURIComponent(slug)}`
  return proxyPublicGet('/courses', path)
}
