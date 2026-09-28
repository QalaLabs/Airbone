import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateTestimonial, buildTestimonialPayload } from './testimonial.js'

const good = { authorName: 'Aman', content: 'Excellent ground classes and very supportive faculty.', consent: true }

test('valid testimonial passes', () => {
  assert.deepEqual(validateTestimonial(good), {})
})

test('invalid inputs are flagged', () => {
  const e = validateTestimonial({ authorName: '<b>', content: 'short', consent: false, rating: 9, authorEmail: 'x' })
  assert.ok(e.authorName && e.content && e.consent && e.rating && e.authorEmail)
})

test('payload never carries status / isFeatured', () => {
  const p = buildTestimonialPayload({ ...good, status: 'APPROVED', isFeatured: true, rating: '5' })
  assert.equal('status' in p, false)
  assert.equal('isFeatured' in p, false)
  assert.equal(p.rating, 5)
})
