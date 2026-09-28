import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HONEYPOT_FIELD, isHoneypotTripped, readHoneypot } from './honeypot.js'

test('legitimate submissions (absent/empty/whitespace honeypot) are not flagged', () => {
  assert.equal(isHoneypotTripped({ name: 'A' }), false)
  assert.equal(isHoneypotTripped({ [HONEYPOT_FIELD]: '' }), false)
  assert.equal(isHoneypotTripped({ [HONEYPOT_FIELD]: '   ' }), false)
  assert.equal(isHoneypotTripped({ [HONEYPOT_FIELD]: null }), false)
  assert.equal(isHoneypotTripped(null), false)
})

test('any filled honeypot value is flagged', () => {
  assert.equal(isHoneypotTripped({ [HONEYPOT_FIELD]: 'http://spam' }), true)
  assert.equal(isHoneypotTripped({ [HONEYPOT_FIELD]: 123 }), true)
  assert.equal(isHoneypotTripped({ [HONEYPOT_FIELD]: ['x'] }), true)
})

test('field name does not collide with common autofill names', () => {
  assert.doesNotMatch(HONEYPOT_FIELD, /^(website|url|company|email|name|phone|address)$/i)
})

test('readHoneypot reads from a form element collection', () => {
  const form = { elements: { namedItem: (n) => (n === HONEYPOT_FIELD ? { value: 'bot' } : null) } }
  assert.equal(readHoneypot(form), 'bot')
  assert.equal(readHoneypot({ elements: { namedItem: () => null } }), '')
  assert.equal(readHoneypot(undefined), '')
})
