import { NextResponse } from 'next/server'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:3001'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const limit = url.searchParams.get('limit') ?? '9'
    const res = await fetch(`${ADMIN_API_URL}/api/public/courses?limit=${limit}`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 })
  }
}
