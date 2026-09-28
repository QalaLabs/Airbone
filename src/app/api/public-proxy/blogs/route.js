import { proxyPublicGet, clampLimit } from '@/lib/publicProxy'

export async function GET(req) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug') ?? ''
  const path = slug
    ? `/api/public/blogs?slug=${encodeURIComponent(slug)}`
    : `/api/public/blogs?limit=${clampLimit(url.searchParams.get('limit'), 20, 50)}`
  return proxyPublicGet('/blogs', path)
}
