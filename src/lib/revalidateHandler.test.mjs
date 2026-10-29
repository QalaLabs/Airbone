import test from 'node:test'
import assert from 'node:assert/strict'
import { handleRevalidateRequest } from './revalidateHandler.js'

const SECRET = 'unit-test-revalidate-secret'

function call(body, { header = SECRET, secret = SECRET, raw } = {}) {
  const purged = []
  const purgedPaths = []
  const req = new Request('http://site.test/api/revalidate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(header === null ? {} : { 'x-revalidate-secret': header }) },
    body: raw ?? JSON.stringify(body),
  })
  return handleRevalidateRequest(req, {
    secret,
    revalidate: (t) => purged.push(t),
    revalidatePath: (p) => purgedPaths.push(p),
  }).then(async (res) => ({
    status: res.status,
    body: await res.json(),
    purged,
    purgedPaths,
  }))
}

test('correct secret + allowed tag purges exactly that tag', async () => {
  const r = await call({ resources: ['testimonials'] })
  assert.equal(r.status, 200)
  assert.deepEqual(r.purged, ['cms:testimonials'])
})

test('blogs resource purges cms:blogs tag and relevant paths /blog and /sitemap.xml', async () => {
  const r = await call({ resources: ['blogs'], slug: 'pilot-training-india-flying-hours' })
  assert.equal(r.status, 200)
  assert.deepEqual(r.purged, ['cms:blogs'])
  assert.ok(r.purgedPaths.includes('/blog'))
  assert.ok(r.purgedPaths.includes('/sitemap.xml'))
  assert.ok(r.purgedPaths.includes('/blog/pilot-training-india-flying-hours'))
})

test('explicit paths are purged when authorized', async () => {
  const r = await call({ paths: ['/blog', '/courses'] })
  assert.equal(r.status, 200)
  assert.ok(r.purgedPaths.includes('/blog'))
  assert.ok(r.purgedPaths.includes('/courses'))
})

test('pages and settings tags are allow-listed for CMS pages and navigation', async () => {
  const r = await call({ resources: ['pages', 'settings'] })
  assert.deepEqual([r.status, r.purged], [200, ['cms:pages', 'cms:settings']])
})

test('wrong secret is 401 and purges nothing', async () => {
  const r = await call({ resources: ['testimonials'] }, { header: 'wrong-secret-value-of-same-len' })
  assert.deepEqual([r.status, r.purged], [401, []])
})

test('missing secret header is 401', async () => {
  const r = await call({ resources: ['testimonials'] }, { header: null })
  assert.deepEqual([r.status, r.purged], [401, []])
})

test('unconfigured website secret is 503 even with a header', async () => {
  const r = await call({ resources: ['testimonials'] }, { secret: '  ' })
  assert.deepEqual([r.status, r.purged], [503, []])
})

test('disallowed tags are rejected, arbitrary paths never purged', async () => {
  const r = await call({ resources: ['/admin', 'cms', '../x', 'cms:testimonials'] })
  assert.deepEqual([r.status, r.purged], [400, []])
})

test('invalid JSON is 400', async () => {
  const r = await call(null, { raw: '{nope' })
  assert.deepEqual([r.status, r.purged], [400, []])
})
