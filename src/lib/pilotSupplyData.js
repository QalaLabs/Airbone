// Data + scales for "Indian Airline Pilot Supply & Airborne Share (2015-2025)".
//
// Only two figures are stated on the page: 15,000 active airline pilots in India
// and 1,500 Airborne alumni flying (≈10% share) as of 2025. The 2015 start values
// are the ones the chart has always plotted (3,750 and 375). Every year in between
// is a straight-line interpolation and is flagged `indicative` — these are not
// published statistics. Replace with sourced yearly figures when available.

export const FIRST_YEAR = 2015
export const LAST_YEAR = 2025

const START = { total: 3750, alumni: 375 }
const END = { total: 15000, alumni: 1500 }

export const PILOT_SUPPLY = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => {
  const year = FIRST_YEAR + i
  const t = i / (LAST_YEAR - FIRST_YEAR)
  const total = Math.round(START.total + t * (END.total - START.total))
  const alumni = Math.round(START.alumni + t * (END.alumni - START.alumni))
  return {
    year,
    total,
    alumni,
    share: Math.round((alumni / total) * 1000) / 10,
    indicative: year !== LAST_YEAR,
  }
})

export const SERIES = [
  { key: 'total', label: 'Active Airline Pilots (India)', color: 'var(--red)', axis: 'count' },
  { key: 'alumni', label: 'Airborne Aviation Alumni (1,500 Pilots)', color: 'var(--navy)', axis: 'count' },
  { key: 'share', label: 'Airborne Supply Share (10%)', color: 'var(--gold)', axis: 'share', dashed: true },
]

/** Plot frame inside the 800×360 viewBox. */
export const FRAME = { width: 800, height: 360, left: 80, right: 720, top: 50, bottom: 290 }
export const COUNT_MAX = 15000
export const SHARE_MAX = 20
export const COUNT_TICKS = [0, 3750, 7500, 11250, 15000]
export const SHARE_TICKS = [0, 5, 10, 15, 20]

export function xForYear(year) {
  return FRAME.left + ((year - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR)) * (FRAME.right - FRAME.left)
}

export function yForCount(value) {
  return FRAME.bottom - (value / COUNT_MAX) * (FRAME.bottom - FRAME.top)
}

export function yForShare(percent) {
  return FRAME.bottom - (percent / SHARE_MAX) * (FRAME.bottom - FRAME.top)
}

export function pointFor(series, row) {
  const value = row[series.key]
  return { x: xForYear(row.year), y: series.axis === 'share' ? yForShare(value) : yForCount(value), value }
}

/** Straight segments between yearly points (no smoothing that would misstate values). */
export function seriesPath(series, rows = PILOT_SUPPLY) {
  return rows
    .map((row, i) => {
      const { x, y } = pointFor(series, row)
      return `${i === 0 ? 'M' : 'L'} ${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`
    })
    .join(' ')
}

export function formatValue(series, value) {
  return series.axis === 'share' ? `${value}%` : value.toLocaleString('en-IN')
}
