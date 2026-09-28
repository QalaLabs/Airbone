import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapResource, resolveResourceAction, parseResourcesResponse, safeHttpUrl } from './resources.js'

const jsonRes = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => (typeof body === 'function' ? body() : body),
})

test('external non-gated resource opens its URL', () => {
  const r = mapResource({ id: '1', title: 'Guide', isGated: false, fileUrl: null, externalUrl: 'https://example.com/g' })
  assert.deepEqual(resolveResourceAction(r), { kind: 'external', url: 'https://example.com/g' })
})

test('file resource keeps download behaviour even when externalUrl also set', () => {
  const r = mapResource({ id: '1', title: 'Guide', isGated: false, fileUrl: 'https://cdn/x.pdf', externalUrl: 'https://example.com' })
  assert.deepEqual(resolveResourceAction(r), { kind: 'download', url: 'https://cdn/x.pdf' })
})

test('gated resource always goes through the gate', () => {
  const r = mapResource({ id: '1', title: 'Guide', isGated: true, fileUrl: null, externalUrl: null })
  assert.deepEqual(resolveResourceAction(r), { kind: 'gate' })
})

test('malicious URLs are never actionable', () => {
  const r = mapResource({ id: '1', title: 'x', isGated: false, fileUrl: 'javascript:alert(1)', externalUrl: 'data:text/html,hi' })
  assert.equal(r.fileUrl, null)
  assert.equal(r.externalUrl, null)
  assert.deepEqual(resolveResourceAction(r), { kind: 'none' })
  assert.equal(safeHttpUrl('http://ok.example/a'), 'http://ok.example/a')
})

test('200 with resources is success', async () => {
  const out = await parseResourcesResponse(jsonRes(200, { data: [{ id: 'a', title: 'A', isGated: false }] }))
  assert.equal(out.ok, true)
  assert.equal(out.resources.length, 1)
})

test('200 with empty data is success with zero resources', async () => {
  const out = await parseResourcesResponse(jsonRes(200, { data: [] }))
  assert.deepEqual(out, { ok: true, resources: [] })
})

for (const status of [401, 403, 500, 502]) {
  test(`${status} is an error, not an empty list`, async () => {
    const out = await parseResourcesResponse(jsonRes(status, { error: 'Upstream Error' }))
    assert.equal(out.ok, false)
    assert.equal(out.status, status)
  })
}

test('malformed body is an error', async () => {
  assert.equal((await parseResourcesResponse(jsonRes(200, { items: [] }))).ok, false)
  const bad = await parseResourcesResponse(jsonRes(200, () => { throw new SyntaxError('bad json') }))
  assert.equal(bad.ok, false)
  assert.equal(bad.malformed, true)
})
