import { NextResponse } from 'next/server'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:4000'

// POST /api/public-proxy/resource-download
// Body: { token: string, resourceId: string }
// Validates gate token via admin and returns the gated resource's download URL.
export async function POST(req) {
  try {
    const { token, resourceId } = await req.json()

    if (!token || !resourceId) {
      return NextResponse.json({ error: 'token and resourceId are required' }, { status: 400 })
    }

    const adminUrl = new URL(`${ADMIN_API_URL}/api/public/resource-download`)
    adminUrl.searchParams.set('token', token)
    adminUrl.searchParams.set('id', resourceId)

    const res = await fetch(adminUrl.toString(), { cache: 'no-store' })

    if (!res.ok) {
      return NextResponse.json({ error: 'Access denied or resource not found' }, { status: res.status })
    }

    const { url } = await res.json()
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[Resource Download Proxy Error]:', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
