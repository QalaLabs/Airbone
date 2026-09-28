import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { proxyPublicGet, clampLimit } from './publicProxy.js'

const realFetch = globalThis.fetch
const realUrl = process.env.ADMIN_API_URL
const realError = console.error

afterEach(() => {
  globalThis.fetch = realFetch
  if (realUrl === undefined) delete process.env.ADMIN_API_URL
  else process.env.ADMIN_API_URL = realUrl
  console.error = realError
})

function quiet() { console.error = () => {} }

test('missing ADMIN_API_URL returns 502 and never falls back to localhost', async () => {
  quiet()
  delete process.env.ADMIN_API_URL
  let called = false
  globalThis.fetch = async () => { called = true; return new Response('{}') }
  const res = await proxyPublicGet('/resources', '/api/public/resources')
  assert.equal(res.status, 502)
  assert.equal(called, false)
})

test('upstream 200 passes JSON through', async () => {
  process.env.ADMIN_API_URL = 'https://admin.example.com'
  let seen
  globalThis.fetch = async (url) => { seen = url; return new Response(JSON.stringify({ data: [1] }), { status: 200 }) }
  const res = await proxyPublicGet('/resources', '/api/public/resources?limit=50')
  assert.equal(seen, 'https://admin.example.com/api/public/resources?limit=50')
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { data: [1] })
})

test('upstream 500 becomes 502 with upstreamStatus', async () => {
  quiet()
  process.env.ADMIN_API_URL = 'https://admin.example.com'
  globalThis.fetch = async () => new Response('boom', { status: 500 })
  const res = await proxyPublicGet('/jobs', '/api/public/jobs')
  assert.equal(res.status, 502)
  assert.equal((await res.json()).upstreamStatus, 500)
})

test('non-JSON upstream body becomes 502', async () => {
  quiet()
  process.env.ADMIN_API_URL = 'https://admin.example.com'
  globalThis.fetch = async () => new Response('<html>', { status: 200 })
  const res = await proxyPublicGet('/jobs', '/api/public/jobs')
  assert.equal(res.status, 502)
})

test('network failure becomes 502', async () => {
  quiet()
  process.env.ADMIN_API_URL = 'https://admin.example.com'
  globalThis.fetch = async () => { throw new Error('ECONNREFUSED') }
  const res = await proxyPublicGet('/jobs', '/api/public/jobs')
  assert.equal(res.status, 502)
})

test('clampLimit bounds query values', () => {
  assert.equal(clampLimit('abc', 20, 50), 20)
  assert.equal(clampLimit('500', 20, 50), 50)
  assert.equal(clampLimit('-1', 20, 50), 20)
  assert.equal(clampLimit('7', 20, 50), 7)
})
