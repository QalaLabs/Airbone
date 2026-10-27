import test from 'node:test'
import assert from 'node:assert/strict'
import { getUpcomingBatchDate } from './batchDate.js'

test('CMS-08: formats a verified batch date in IST', () => {
  assert.equal(getUpcomingBatchDate('2026-11-05T06:30:00.000Z'), '5th Nov 2026')
})

test('CMS-08: a UTC-midnight timestamp does not roll back a day in IST', () => {
  // 2026-10-31T19:30Z is already 1 Nov 2026 01:00 IST.
  assert.equal(getUpcomingBatchDate('2026-10-31T19:30:00.000Z'), '1st Nov 2026')
  // 2026-01-31T18:30Z is 1 Feb 2026 00:00 IST.
  assert.equal(getUpcomingBatchDate('2026-01-31T18:30:00.000Z'), '1st Feb 2026')
})

test('CMS-08: no heuristic date is invented when a batch is unknown', () => {
  assert.equal(getUpcomingBatchDate(undefined), null)
  assert.equal(getUpcomingBatchDate(null), null)
  assert.equal(getUpcomingBatchDate(''), null)
  assert.equal(getUpcomingBatchDate('not-a-date'), null)
})
