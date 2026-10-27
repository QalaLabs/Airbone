import test from 'node:test'
import assert from 'node:assert/strict'
import { CABIN_CREW_PATHWAYS, scholarshipFee, scholarshipLabel } from './cabinCrewPricing.js'

test('FE-28: every advertised scholarship price is within its own regular fee', () => {
  for (const pathway of CABIN_CREW_PATHWAYS) {
    const fee = scholarshipFee(pathway)
    assert.ok(fee >= 0, `Pathway ${pathway.num} scholarship fee must not be negative`)
    assert.ok(
      fee <= pathway.regularFee,
      `Pathway ${pathway.num} scholarship fee (${fee}) must not exceed regular fee (${pathway.regularFee})`,
    )
  }
})

test('FE-28: 100% scholarship derives a zero fee for all current pathways', () => {
  for (const pathway of CABIN_CREW_PATHWAYS) {
    assert.equal(pathway.scholarshipPercent, 100)
    assert.equal(scholarshipFee(pathway), 0)
    assert.match(scholarshipLabel(pathway), /^100%\*/)
  }
})

test('FE-28: partial scholarships use the advertised percentage, clamped to 0-100', () => {
  assert.equal(scholarshipFee({ regularFee: 30000, scholarshipPercent: 50 }), 15000)
  assert.equal(scholarshipFee({ regularFee: 54000, scholarshipPercent: 25 }), 40500)
  assert.equal(scholarshipFee({ regularFee: 30000, scholarshipPercent: 150 }), 0)
  assert.equal(scholarshipFee({ regularFee: 30000, scholarshipPercent: -20 }), 30000)
  assert.equal(scholarshipFee({ regularFee: 30000, scholarshipPercent: 'nonsense' }), 30000)
})
