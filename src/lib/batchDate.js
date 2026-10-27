/**
 * CMS-08 — format a real batch start date in IST.
 *
 * There is deliberately NO heuristic fallback. An unknown/invalid date returns
 * null so the UI hides the badge instead of advertising an invented
 * "1st / 15th of the month" batch. Formatting is pinned to Asia/Kolkata so a
 * midnight-UTC timestamp never renders as the previous day for visitors in a
 * western timezone.
 */
const IST = 'Asia/Kolkata'

export function getUpcomingBatchDate(customDate) {
  if (!customDate) return null
  const date = new Date(customDate)
  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date)

  const value = (type) => parts.find((part) => part.type === type)?.value ?? ''
  const day = Number(value('day'))
  const month = value('month')
  const year = value('year')
  if (!Number.isFinite(day) || !month || !year) return null

  const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
  return `${day}${suffix} ${month} ${year}`
}
