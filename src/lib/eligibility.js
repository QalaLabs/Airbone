// Course eligibility pre-check answers travelling from the enquiry form to the
// admin intake API. The admin owns the per-course questions and validates the
// answers; this only bounds the payload shape before forwarding.

const MAX_ANSWERS = 10

/** Plain `{ key: string }` object (≤10 entries) or undefined when there is nothing to send. */
export function boundEligibilityAnswers(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const out = {}
  let count = 0
  for (const [key, value] of Object.entries(raw)) {
    if (count >= MAX_ANSWERS) break
    if (typeof key !== 'string' || key.length > 40 || typeof value !== 'string' || value.length > 8) continue
    out[key] = value
    count++
  }
  return count > 0 ? out : undefined
}

/** Server result summary `{ course, result }` from an admin response body, or null. */
export function eligibilitySummary(body) {
  const e = body && typeof body === 'object' ? body.eligibility : null
  if (!e || typeof e !== 'object') return null
  const result = ['eligible', 'review', 'not_applicable'].includes(e.result) ? e.result : null
  if (!result) return null
  return { course: typeof e.course === 'string' ? e.course : null, result }
}
