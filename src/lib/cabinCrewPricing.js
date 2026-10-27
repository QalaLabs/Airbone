/**
 * FE-28 — Cabin Crew pathway pricing (single source of truth).
 *
 * The website previously hardcoded three scholarship "prices" that contradicted
 * the regular fee (Pathway 2 showed the same ₹30,000 under "100% scholarship";
 * Pathway 3 showed ₹54,000 — more than its ₹30,000 regular fee). Amounts are now
 * numeric and the scholarship figure is DERIVED from the advertised percentage,
 * so a card can never show a scholarship price above its own regular fee.
 *
 * The pathway percentages below mirror the wording already published on the
 * page ("100%* (score >=70%)"). The client must confirm whether Pathways 2 and 3
 * are genuinely fully-funded; if not, only `scholarshipPercent` needs to change.
 */
export const CABIN_CREW_PATHWAYS = [
  {
    num: '1',
    title: 'Elite Cabin Crew Finishing Batch',
    duration: '3 Months',
    classTime: '90 Minutes',
    best: 'Near-selection candidates needing final polish',
    regularFee: 54000,
    scholarshipPercent: 100,
    focus: ['Final grooming polish', 'Professional presence', 'Service behaviour refinement', 'GD and PI readiness', 'Interview finishing support'],
  },
  {
    num: '2',
    title: 'Advanced Communication, GD/PI & Personality',
    duration: '3 Months',
    classTime: '90 Minutes',
    best: 'Candidates with communication or confidence gaps',
    regularFee: 30000,
    scholarshipPercent: 100,
    focus: ['Spoken communication improvement', 'GD practice', 'PI preparation', 'Personality development', 'Confidence building'],
  },
  {
    num: '3',
    title: 'Basic Communication & Global Hospitality',
    duration: '6 Months',
    classTime: '90 Minutes',
    best: 'Beginners needing complete foundation',
    regularFee: 30000,
    scholarshipPercent: 100,
    focus: ['Communication foundation', 'Hospitality standards', 'Grooming basics', 'Professional readiness', 'Zero-to-selection journey'],
  },
]

export function inr(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

/**
 * Scholarship fee is the regular fee minus the advertised discount. It is
 * clamped at zero and can never exceed the regular fee.
 */
export function scholarshipFee(pathway) {
  const percent = Math.min(100, Math.max(0, Number(pathway.scholarshipPercent) || 0))
  const fee = Number(pathway.regularFee) || 0
  return Math.max(0, Math.round(fee * ((100 - percent) / 100)))
}

export function scholarshipLabel(pathway) {
  return `${pathway.scholarshipPercent}%* (score ≥70%)`
}

export function scholarshipPriceLabel(pathway) {
  return `${inr(scholarshipFee(pathway))} (for scholarship winners)`
}
