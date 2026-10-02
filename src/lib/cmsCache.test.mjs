import test from 'node:test'
import assert from 'node:assert/strict'
import { cmsTagForPath, cmsFetchOptions, cmsRevalidateSeconds, tagsToRevalidate, secretMatches } from './cmsCache.js'

test('cmsTagForPath maps adminApi and proxy paths to the same content tag', () => {
  assert.equal(cmsTagForPath('/testimonials'), 'cms:testimonials')
  assert.equal(cmsTagForPath('/api/public/testimonials?limit=6'), 'cms:testimonials')
  assert.equal(cmsTagForPath('/api/public/courses?slug=a320-simulator&limit=1'), 'cms:courses')
  assert.equal(cmsTagForPath('/blogs'), 'cms:blogs')
  assert.equal(cmsTagForPath('/api/public/unknown'), null)
  assert.equal(cmsTagForPath(''), null)
})

test('cmsFetchOptions always carries the global tag and keeps the revalidate window', () => {
  assert.deepEqual(cmsFetchOptions('/jobs'), { next: { revalidate: 60, tags: ['cms', 'cms:jobs'] } })
  assert.deepEqual(cmsFetchOptions('/api/public/google-reviews', 3600), {
    next: { revalidate: 3600, tags: ['cms', 'cms:google-reviews'] },
  })
  assert.deepEqual(cmsFetchOptions('/nope'), { next: { revalidate: 60, tags: ['cms'] } })
})

test('cmsRevalidateSeconds honours a positive CMS_REVALIDATE_SECONDS and defaults to 60', () => {
  assert.equal(cmsRevalidateSeconds({}), 60)
  assert.equal(cmsRevalidateSeconds({ CMS_REVALIDATE_SECONDS: '3600' }), 3600)
  assert.equal(cmsRevalidateSeconds({ CMS_REVALIDATE_SECONDS: '0' }), 60)
  assert.equal(cmsRevalidateSeconds({ CMS_REVALIDATE_SECONDS: 'abc' }), 60)
})

test('tagsToRevalidate rejects disallowed tags and arbitrary paths', () => {
  assert.deepEqual(tagsToRevalidate({ resources: ['pages', '/admin', 'cms:pages', '*', 'PAGES'] }), ['cms:pages'])
  assert.deepEqual(tagsToRevalidate({ resources: 'testimonials' }), [])
  assert.deepEqual(tagsToRevalidate({ tags: ['cms:testimonials'] }), [])
})

test('tagsToRevalidate only accepts allow-listed resources and dedupes', () => {
  assert.deepEqual(tagsToRevalidate({ resources: ['testimonials', 'testimonials', 'courses'] }), [
    'cms:testimonials',
    'cms:courses',
  ])
  assert.deepEqual(tagsToRevalidate({ resources: ['../etc', 42, null, 'cms'] }), [])
  assert.deepEqual(tagsToRevalidate({}), [])
  assert.deepEqual(tagsToRevalidate(null), [])
})

test('secretMatches requires an exact, configured secret', () => {
  assert.equal(secretMatches('s3cret-value', 's3cret-value'), true)
  assert.equal(secretMatches('s3cret-valuX', 's3cret-value'), false)
  assert.equal(secretMatches('short', 's3cret-value'), false)
  assert.equal(secretMatches('', ''), false)
  assert.equal(secretMatches(undefined, 's3cret-value'), false)
})
