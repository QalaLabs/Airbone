import { NextResponse } from 'next/server'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/public/resources?limit=50`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('Upstream failed')
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[Proxy Error /resources]:', err.message)
    return NextResponse.json({ error: 'Upstream Error' }, { status: 502 })
  }
}
