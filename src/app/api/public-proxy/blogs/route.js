import { NextResponse } from 'next/server'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:4000'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const limit = url.searchParams.get('limit') ?? '20'
    const slug = url.searchParams.get('slug') ?? ''
    const targetUrl = slug 
      ? `${ADMIN_API_URL}/api/public/blogs?slug=${slug}`
      : `${ADMIN_API_URL}/api/public/blogs?limit=${limit}`

    const res = await fetch(targetUrl, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('Upstream failed')
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[Proxy Error /blogs]:', err.message)
    return NextResponse.json({ error: 'Upstream Error' }, { status: 502 })
  }
}
