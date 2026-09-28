import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateJobApplication } from './jobApplication.js'

const good = { applicantName: 'Riya Sharma', applicantEmail: 'riya@example.com', applicantPhone: '+91 99537 77320', resumeUrl: '', consent: true }

test('valid application has no errors', () => {
  assert.deepEqual(validateJobApplication(good), {})
})

test('missing consent / bad email / bad phone / non-http resume are flagged', () => {
  const e = validateJobApplication({ ...good, consent: false, applicantEmail: 'x', applicantPhone: '12', resumeUrl: 'javascript:alert(1)' })
  assert.ok(e.consent)
  assert.ok(e.applicantEmail)
  assert.ok(e.applicantPhone)
  assert.ok(e.resumeUrl)
})
