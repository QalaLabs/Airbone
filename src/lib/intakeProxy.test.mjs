import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { forwardIntake, visitorResponse, upstreamErrorMessage } from './intakeProxy.js'

const env = { url: process.env.ADMIN_API_URL, key: process.env.PUBLIC_INTAKE_KEY }
const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
  for (const [k, v] of [['ADMIN_API_URL', env.url], ['PUBLIC_INTAKE_KEY', env.key]]) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
})

test('forwards with intake key and visitor IP', async () => {
  process.env.ADMIN_API_URL = 'https://admin.example.com'
  process.env.PUBLIC_INTAKE_KEY = 'k-123'
  let seen
  globalThis.fetch = async (url, init) => { seen = { url, init }; return new Response(JSON.stringify({ data: { id: 'a' } }), { status: 201 }) }
  const out = await forwardIntake('/api/public/job-applications', { a: 1 }, '203.0.113.9')
  assert.equal(seen.url, 'https://admin.example.com/api/public/job-applications')
  assert.equal(seen.init.headers['x-intake-key'], 'k-123')
  assert.equal(seen.init.headers['x-intake-client-ip'], '203.0.113.9')
  assert.equal(out.status, 201)
  assert.equal(out.ok, true)
})

test('missing config throws instead of calling a relative/localhost URL', async () => {
  delete process.env.ADMIN_API_URL
  process.env.PUBLIC_INTAKE_KEY = 'k'
  let called = false
  globalThis.fetch = async () => { called = true; return new Response('{}') }
  await assert.rejects(forwardIntake('/x', {}, '1.1.1.1'), /ADMIN_API_URL/)
  assert.equal(called, false)
})

test('visitor sees truthful 400/404/409 messages from both admin error shapes', () => {
  assert.equal(upstreamErrorMessage({ error: 'x' }), 'x')
  assert.equal(upstreamErrorMessage({ error: { message: 'y' } }), 'y')
  assert.deepEqual(visitorResponse({ status: 409, ok: false, json: { error: { message: 'You have already applied for this job.' } } }).body,
    { error: 'You have already applied for this job.' })
  assert.equal(visitorResponse({ status: 404, ok: false, json: {} }, { 404: 'gone' }).body.error, 'gone')
  assert.equal(visitorResponse({ status: 400, ok: false, json: { error: 'applicantEmail: Invalid email' } }).status, 400)
})

test('auth / 5xx upstream failures become a generic 502', () => {
  for (const status of [401, 500, 503]) {
    const out = visitorResponse({ status, ok: false, json: { error: 'Unauthorized' } })
    assert.equal(out.status, 502)
    assert.doesNotMatch(out.body.error, /Unauthorized/)
  }
})

test('success passes data through', () => {
  assert.deepEqual(visitorResponse({ status: 201, ok: true, json: { data: { id: '1' } } }), { status: 201, body: { success: true, data: { id: '1' } } })
})
