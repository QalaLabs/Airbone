import { NextResponse } from 'next/server'
import { fetchPublic } from '@/lib/adminApi'

export const revalidate = 300

/**
 * CMS-08 — server-side proxy to the CRM/LMS next-batch endpoint.
 * Returning `{ data: null }` is meaningful: no batch is scheduled, so the
 * website hides the badge rather than fabricating a date.
 */
export async function GET(request) {
  const slug = new URL(request.url).searchParams.get('courseSlug')
  if (!slug) return NextResponse.json({ data: null }, { status: 400 })

  const batch = await fetchPublic('/batches', { courseSlug: slug })
  return NextResponse.json({
    data: batch && batch.startDate ? { startDate: batch.startDate, name: batch.name ?? null } : null,
  })
}
