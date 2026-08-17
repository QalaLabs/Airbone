import { NextResponse } from 'next/server'
import { resolveAdminApiUrl } from '@/lib/upstream'

const ADMIN_API_URL = resolveAdminApiUrl()

// POST /api/public-proxy/resource-download
// Body: { token: string, resourceId: string }
// Validates gate token via admin and returns the gated resource's download URL.
export async function POST(req) {
  let token
  let resourceId

  try {
    const body = await req.json()
    token = body?.token
    resourceId = body?.resourceId
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!token || !resourceId) {
    return NextResponse.json({ error: 'token and resourceId are required' }, { status: 400 })
  }

  if (!ADMIN_API_URL) {
    return NextResponse.json({ error: 'Upstream Error' }, { status: 502 })
  }

  const adminUrl = new URL(`${ADMIN_API_URL}/api/public/resource-download`)
  adminUrl.searchParams.set('token', token)
  adminUrl.searchParams.set('id', resourceId)

  try {
    const res = await fetch(adminUrl.toString(), { cache: 'no-store' })

    if (!res.ok) {
      return NextResponse.json({ error: 'Access denied or resource not found' }, { status: res.status })
    }

    const { url } = await res.json()
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[Resource Download Proxy Error]:', err.message)
    return NextResponse.json({ error: 'Upstream Error' }, { status: 502 })
  }
}
