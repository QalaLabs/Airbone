import { proxyPublicGet } from '@/lib/publicProxy'

export async function GET(req) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug') ?? ''
  const path = slug ? `/api/public/pages?slug=${encodeURIComponent(slug)}` : '/api/public/pages'
  return proxyPublicGet('/pages', path)
}
