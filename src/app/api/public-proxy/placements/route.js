import { NextResponse } from 'next/server'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:4000'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const limit = url.searchParams.get('limit') ?? '50'
    const res = await fetch(`${ADMIN_API_URL}/api/public/placements?limit=${limit}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('Upstream failed')
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[Proxy Error /placements]:', err.message)
    return NextResponse.json({ error: 'Upstream Error' }, { status: 502 })
  }
}
