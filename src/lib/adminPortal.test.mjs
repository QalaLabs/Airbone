import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adminPortalUrl, PRODUCTION_ADMIN_URL, LOCAL_ADMIN_URL } from './adminPortal.js'

test('regression: a production build without NEXT_PUBLIC_ADMIN_URL never links to localhost', () => {
  for (const configured of [undefined, '', '   ', 'localhost:4000', 'not a url']) {
    const url = adminPortalUrl(configured, 'production')
    assert.equal(url, PRODUCTION_ADMIN_URL, String(configured))
    assert.doesNotMatch(url, /localhost/)
  }
})

test('a configured URL wins and loses its trailing slash', () => {
  assert.equal(adminPortalUrl('https://admin.example.test/', 'production'), 'https://admin.example.test')
  assert.equal(adminPortalUrl(' http://127.0.0.1:4100// ', 'test'), 'http://127.0.0.1:4100')
})

test('development falls back to the local Admin app', () => {
  assert.equal(adminPortalUrl(undefined, 'development'), LOCAL_ADMIN_URL)
  assert.equal(adminPortalUrl(undefined, undefined), LOCAL_ADMIN_URL)
})
