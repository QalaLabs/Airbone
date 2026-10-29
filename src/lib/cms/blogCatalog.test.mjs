import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEGACY_POSTS,
  mergeBlogPosts,
  normalizeCategory,
  calculateReadingTime,
  getRelatedPosts,
  CATEGORIES,
} from './blogCatalog.js'

test('LEGACY_POSTS contains exactly 4 canonical articles with valid metadata', () => {
  assert.equal(LEGACY_POSTS.length, 4)
  const slugs = LEGACY_POSTS.map((p) => p.slug)
  assert.deepEqual(slugs, [
    'how-to-become-pilot-india',
    'pilot-training-cost-india',
    'dgca-ground-school-guide',
    'pilot-salary-india',
  ])
  for (const p of LEGACY_POSTS) {
    assert.ok(p.title && p.title.length > 5, `Post ${p.slug} has title`)
    assert.ok(p.excerpt && p.excerpt.length > 10, `Post ${p.slug} has excerpt`)
    assert.ok(p.author, `Post ${p.slug} has author`)
    assert.ok(p.publishedAt, `Post ${p.slug} has publishedAt`)
    assert.ok(p.category, `Post ${p.slug} has category`)
    assert.ok(Array.isArray(p.tags) && p.tags.length > 0, `Post ${p.slug} has tags`)
  }
})

test('mergeBlogPosts merges CMS articles with legacy articles and orders newest first', () => {
  const newCmsBlog = {
    slug: 'pilot-training-india-flying-hours',
    title: 'Pilot Training in India: Flying Hours & Requirements',
    description: 'Detailed analysis of DGCA 200 flying hours breakdown.',
    category: 'Pilot Training',
    tags: ['flying-hours', 'cpl', 'dgca'],
    publishedAt: '2026-07-01T00:00:00.000Z',
    createdAt: '2026-07-01T00:00:00.000Z',
    metadata: {
      author: 'Capt. Navrang Singh',
      bodyHtml: '<p>' + 'word '.repeat(400) + '</p>',
    },
  }

  const merged = mergeBlogPosts([newCmsBlog])
  assert.equal(merged.length, 5, 'Must contain all 5 articles')
  // Newest article published in July 2026 should be first
  assert.equal(merged[0].slug, 'pilot-training-india-flying-hours')
  // Legacy articles follow in descending order of publishedAt
  assert.equal(merged[1].slug, 'pilot-salary-india')
  assert.equal(merged[2].slug, 'dgca-ground-school-guide')
  assert.equal(merged[3].slug, 'pilot-training-cost-india')
  assert.equal(merged[4].slug, 'how-to-become-pilot-india')
})

test('mergeBlogPosts lets CMS version override legacy article cleanly without duplication', () => {
  const updatedLegacy = {
    slug: 'how-to-become-pilot-india',
    title: 'How to Become a Pilot in India - CMS Updated Edition',
    description: 'Updated copy directly from Airborne OS CMS.',
    category: 'Pilot Training',
    publishedAt: '2026-08-01T00:00:00.000Z',
    metadata: { author: 'Deepak Aggarwal' },
  }

  const merged = mergeBlogPosts([updatedLegacy])
  assert.equal(merged.length, 4, 'Total count remains 4 (no duplicate cards)')
  const found = merged.find((p) => p.slug === 'how-to-become-pilot-india')
  assert.equal(found.title, 'How to Become a Pilot in India - CMS Updated Edition')
  assert.equal(found.author, 'Deepak Aggarwal')
  assert.equal(found.isCms, true)
})

test('calculateReadingTime calculates realistic reading times and handles empty body', () => {
  assert.equal(calculateReadingTime(''), null)
  assert.equal(calculateReadingTime(null), null)
  assert.equal(calculateReadingTime('   '), null)
  const shortText = 'word '.repeat(100)
  assert.equal(calculateReadingTime(shortText), '1 min read')
  const mediumText = 'word '.repeat(1100)
  assert.equal(calculateReadingTime(mediumText), '6 min read')
  const htmlText = '<p>' + 'word '.repeat(2000) + '</p>'
  assert.equal(calculateReadingTime(htmlText), '10 min read')
})

test('normalizeCategory maps categories accurately to requested taxonomy', () => {
  assert.equal(normalizeCategory('dgca-exams'), 'DGCA Exams')
  assert.equal(normalizeCategory('DGCA Exam Prep'), 'DGCA Exams')
  assert.equal(normalizeCategory('parents-guide'), "Parents' Guide")
  assert.equal(normalizeCategory('cabin-crew'), 'Cabin Crew')
  assert.equal(normalizeCategory('pilot-training'), 'Pilot Training')
  assert.equal(normalizeCategory('unknown'), 'Pilot Training')
})

test('getRelatedPosts finds 2-3 relevant articles excluding current article', () => {
  const all = mergeBlogPosts([])
  const related = getRelatedPosts('how-to-become-pilot-india', 'Pilot Training', ['cpl', 'pilot-training'], all)
  assert.ok(related.length >= 2 && related.length <= 3)
  assert.ok(!related.some((r) => r.slug === 'how-to-become-pilot-india'), 'Never includes self')
  const uniqueSlugs = new Set(related.map((r) => r.slug))
  assert.equal(uniqueSlugs.size, related.length, 'No duplicate related cards')
})
