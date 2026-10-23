'use client'

import { useMemo } from 'react'

export function getUpcomingBatchDate(customDate) {
  if (customDate) {
    const d = new Date(customDate)
    if (!Number.isNaN(d.getTime())) {
      const day = d.getDate()
      const s = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
      return `${day}${s} ${d.toLocaleDateString('en-IN', { month: 'short' })} ${d.getFullYear()}`
    }
  }
  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth()
  const year = now.getFullYear()

  let targetDate
  if (day < 15) {
    targetDate = new Date(year, month, 15)
  } else {
    targetDate = new Date(year, month + 1, 1)
  }

  const d = targetDate.getDate()
  const suffix = d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'
  const monthName = targetDate.toLocaleDateString('en-IN', { month: 'short' })
  const yr = targetDate.getFullYear()
  return `${d}${suffix} ${monthName} ${yr}`
}

export default function NextBatchBadge({ customDate, style = {} }) {
  const batchDate = useMemo(() => getUpcomingBatchDate(customDate), [customDate])

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
