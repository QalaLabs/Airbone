import test from 'node:test'
import assert from 'node:assert/strict'
import { boundEligibilityAnswers, eligibilitySummary } from './eligibility.js'

test('boundEligibilityAnswers keeps a small string map and drops junk', () => {
  assert.deepEqual(boundEligibilityAnswers({ age17: 'yes', eyesight: 'no' }), { age17: 'yes', eyesight: 'no' })
  assert.equal(boundEligibilityAnswers(undefined), undefined)
  assert.equal(boundEligibilityAnswers(['yes']), undefined)
  assert.equal(boundEligibilityAnswers({}), undefined)
  assert.deepEqual(boundEligibilityAnswers({ a: 'yes', b: { nested: 1 }, c: 'x'.repeat(50) }), { a: 'yes' })
  const many = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`q${i}`, 'yes']))
  assert.equal(Object.keys(boundEligibilityAnswers(many)).length, 10)
})

test('eligibilitySummary passes through only known results', () => {
  assert.deepEqual(eligibilitySummary({ eligibility: { course: 'atpl', result: 'eligible' } }), { course: 'atpl', result: 'eligible' })
  assert.deepEqual(eligibilitySummary({ eligibility: { course: null, result: 'not_applicable' } }), { course: null, result: 'not_applicable' })
  assert.equal(eligibilitySummary({ eligibility: { result: 'hacked' } }), null)
  assert.equal(eligibilitySummary({}), null)
  assert.equal(eligibilitySummary(null), null)
})
