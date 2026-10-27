'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getUpcomingBatchDate } from '@/lib/batchDate'

/**
 * CMS-08 — format a real batch date. There is NO heuristic fallback: an unknown
 * date returns null so callers can hide the badge instead of advertising an
 * invented "1st / 15th of the month" batch.
 */
export { getUpcomingBatchDate } from '@/lib/batchDate'

export default function NextBatchBadge({ customDate, courseSlug, style = {} }) {
  const pathname = usePathname()
  const [liveDate, setLiveDate] = useState(null)

  const slug = useMemo(() => {
    if (courseSlug) return courseSlug
    const parts = (pathname ?? '').split('/').filter(Boolean)
    return parts[0] === 'courses' && parts[1] ? parts[1] : null
  }, [courseSlug, pathname])

  useEffect(() => {
    if (customDate || !slug) return
    let cancelled = false
    fetch(`/api/next-batch?courseSlug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setLiveDate(json?.data?.startDate ?? null)
      })
      .catch(() => {
        if (!cancelled) setLiveDate(null)
      })
    return () => {
      cancelled = true
    }
  }, [customDate, slug])

  const batchDate = getUpcomingBatchDate(customDate ?? liveDate)
  // Honest rendering: no verified batch date → no badge.
  if (!batchDate) return null

  return (
    <span
      className="badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        borderColor: '#10b981',
        background: 'rgba(16, 185, 129, 0.08)',
        color: '#065f46',
        fontWeight: 700,
        boxShadow: 'none',
        ...style,
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          boxShadow: '0 0 6px #10b981',
          display: 'inline-block',
        }}
      />
      Next Batch: {batchDate}
    </span>
  )
}
