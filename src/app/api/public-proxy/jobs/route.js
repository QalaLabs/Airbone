import { NextResponse } from 'next/server'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/public/jobs?limit=50`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 })
  }
}
