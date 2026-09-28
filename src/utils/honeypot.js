// Spam trap shared by every public form and the server routes behind them.
// The name is deliberately meaningless so browser/password-manager autofill
// heuristics (which key on name/id/label such as "website", "company", "url")
// never populate it for real visitors.
export const HONEYPOT_FIELD = 'hp_ref_code'

/** True when a submission carried a non-empty honeypot value (i.e. a bot filled it). */
export function isHoneypotTripped(payload) {
  if (!payload || typeof payload !== 'object') return false
  const value = payload[HONEYPOT_FIELD]
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

/** Read the honeypot value from a submitted <form> element. */
export function readHoneypot(form) {
  const el = form?.elements?.namedItem?.(HONEYPOT_FIELD)
  return el && typeof el.value === 'string' ? el.value : ''
}
