import test from 'node:test'
import assert from 'node:assert/strict'
import { extractTableOfContents } from './toc.js'

test('extractTableOfContents extracts H2 and H3 headings with unique anchor IDs', () => {
  const html = `
    <h2>Eligibility Requirements</h2>
    <p>Physics & Maths in 10+2.</p>
    <h3>Medical Examination</h3>
    <p>Class 2 and Class 1 medicals.</p>
    <h2>Flying Training Overview</h2>
    <p>200 flying hours.</p>
  `
  const toc = extractTableOfContents(html)
  assert.equal(toc.length, 3)
  assert.deepEqual(toc[0], { id: 'eligibility-requirements', text: 'Eligibility Requirements', level: 2 })
  assert.deepEqual(toc[1], { id: 'medical-examination', text: 'Medical Examination', level: 3 })
  assert.deepEqual(toc[2], { id: 'flying-training-overview', text: 'Flying Training Overview', level: 2 })
})

test('extractTableOfContents handles duplicate headings disambiguating IDs', () => {
  const html = `
    <h2>Overview</h2>
    <p>Section 1</p>
    <h2>Overview</h2>
    <p>Section 2</p>
    <h2>Overview</h2>
  `
  const toc = extractTableOfContents(html)
  assert.equal(toc.length, 3)
  assert.equal(toc[0].id, 'overview')
  assert.equal(toc[1].id, 'overview-1')
  assert.equal(toc[2].id, 'overview-2')
})

test('extractTableOfContents returns empty array when fewer than 2 headings are present', () => {
  assert.deepEqual(extractTableOfContents(''), [])
  assert.deepEqual(extractTableOfContents('<h2>Single Heading</h2><p>Content</p>'), [])
  assert.deepEqual(extractTableOfContents('<p>Only paragraphs here</p>'), [])
})
