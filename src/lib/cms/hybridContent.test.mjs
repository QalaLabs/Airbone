import test from 'node:test'
import assert from 'node:assert/strict'
import { parseFrontmatter, loadHybridPage, blendPageWithOperationalData } from './hybridContent.js'

test('parseFrontmatter extracts YAML frontmatter and markdown body', () => {
  const sample = `---
title: "Pilot Ground School"
slug: pilot-ground-school
sections:
  - _template: hero
    heading: Become an Airline Pilot
  - _template: faq
    items:
      - question: "What is DGCA?"
        answer: "Directorate General of Civil Aviation"
---
# Pilot Training in Delhi
Comprehensive CPL ground classes.
`

  const { data, body } = parseFrontmatter(sample)
  assert.equal(data.title, 'Pilot Ground School')
  assert.equal(data.slug, 'pilot-ground-school')
  assert.equal(data.sections?.length, 2)
  assert.equal(data.sections[0]._template, 'hero')
  assert.equal(data.sections[0].heading, 'Become an Airline Pilot')
  assert.ok(body.includes('Comprehensive CPL ground classes.'))
})

test('blendPageWithOperationalData hydrates canonical fees into sections', () => {
  const page = {
    title: 'Cabin Crew',
    sections: [
      {
        _template: 'hero',
        courseSlug: 'cabin-crew',
      },
    ],
  }

  const feeResolver = (slug) => {
    if (slug === 'cabin-crew') {
      return { displayFee: '₹54,000', numericFee: 54000 }
    }
    return null
  }

  const blended = blendPageWithOperationalData(page, { feeResolver })
  assert.equal(blended.sections[0].canonicalFee, '₹54,000')
  assert.equal(blended.sections[0].priceNumeric, 54000)
})

test('loadHybridPage loads local cabin-crew-overview from Git content directory', async () => {
  const page = await loadHybridPage('cabin-crew-overview')
  assert.ok(page, 'Page should be loaded from Git content/pages')
  assert.equal(page.source, 'git')
  assert.equal(page.title, 'Cabin Crew Academy Overview')
  assert.ok(page.sections.length > 0, 'Sections should be parsed from frontmatter')
})
