import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COUNT_MAX,
  FRAME,
  PILOT_SUPPLY,
  SERIES,
  SHARE_MAX,
  pointFor,
  seriesPath,
  xForYear,
  yForCount,
  yForShare,
} from './pilotSupplyData.js'

test('every year 2015–2025 appears exactly once, in order', () => {
  assert.deepEqual(PILOT_SUPPLY.map((r) => r.year), [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025])
})

test('2025 matches the figures stated on the page; other years are flagged indicative', () => {
  const last = PILOT_SUPPLY.at(-1)
  assert.deepEqual({ total: last.total, alumni: last.alumni, share: last.share, indicative: last.indicative }, { total: 15000, alumni: 1500, share: 10, indicative: false })
  assert.ok(PILOT_SUPPLY.slice(0, -1).every((r) => r.indicative))
})

test('series are consistent: share = alumni / total, both counts rising', () => {
  for (const r of PILOT_SUPPLY) {
    assert.ok(Math.abs(r.share - (r.alumni / r.total) * 100) < 0.06, `${r.year} share`)
    assert.ok(r.alumni < r.total)
  }
  for (let i = 1; i < PILOT_SUPPLY.length; i++) {
    assert.ok(PILOT_SUPPLY[i].total > PILOT_SUPPLY[i - 1].total)
    assert.ok(PILOT_SUPPLY[i].alumni > PILOT_SUPPLY[i - 1].alumni)
  }
})

test('year → x is evenly spaced across the frame with no shifted index', () => {
  assert.equal(xForYear(2015), FRAME.left)
  assert.equal(xForYear(2025), FRAME.right)
  const step = (FRAME.right - FRAME.left) / 10
  PILOT_SUPPLY.forEach((r, i) => assert.ok(Math.abs(xForYear(r.year) - (FRAME.left + i * step)) < 1e-9, `${r.year}`))
})

test('values land on the right axis scale', () => {
  assert.equal(yForCount(0), FRAME.bottom)
  assert.equal(yForCount(COUNT_MAX), FRAME.top)
  assert.equal(yForShare(0), FRAME.bottom)
  assert.equal(yForShare(SHARE_MAX), FRAME.top)
  const [total, alumni, share] = SERIES
  const last = PILOT_SUPPLY.at(-1)
  assert.equal(pointFor(total, last).y, FRAME.top, '15,000 sits on the top count gridline')
  assert.equal(pointFor(alumni, last).y, yForCount(1500))
  assert.equal(pointFor(share, last).y, yForShare(10), 'share uses the % axis, not the count axis')
  // Inverse check for every point: decoding y gives back the plotted value.
  for (const s of SERIES) {
    for (const r of PILOT_SUPPLY) {
      const { y, value } = pointFor(s, r)
      const max = s.axis === 'share' ? SHARE_MAX : COUNT_MAX
      const decoded = ((FRAME.bottom - y) / (FRAME.bottom - FRAME.top)) * max
      assert.ok(Math.abs(decoded - value) < 1e-6, `${s.key} ${r.year}`)
    }
  }
})

test('line paths pass through every yearly point', () => {
  for (const s of SERIES) {
    const coords = seriesPath(s).split(/[ML]/).filter((c) => c.trim()).map((c) => c.trim().split(' ').map(Number))
    assert.equal(coords.length, PILOT_SUPPLY.length, s.key)
    coords.forEach(([x, y], i) => {
      const p = pointFor(s, PILOT_SUPPLY[i])
      assert.ok(Math.abs(x - p.x) < 0.06 && Math.abs(y - p.y) < 0.06, `${s.key} ${PILOT_SUPPLY[i].year}`)
    })
  }
})
