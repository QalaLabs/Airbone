export function validateName(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return { valid: false, error: 'Please enter your full name.' }
  if (trimmed.length < 2) return { valid: false, error: 'Name must be at least 2 characters.' }
  if (trimmed.length > 60) return { valid: false, error: 'Name must be 60 characters or less.' }
  return { valid: true, error: null }
}

export function validatePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return { valid: false, error: 'Please enter your contact number.' }
  if (digits.length !== 10) return { valid: false, error: 'Please enter a valid contact number.' }
  return { valid: true, error: null }
}

export function validateEmail(email) {
  const trimmed = (email || '').trim()
  if (!trimmed) return { valid: true, error: null }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(trimmed)) return { valid: false, error: 'Please enter a valid email address.' }
  return { valid: true, error: null }
}

export function validateEmailRequired(email) {
  const trimmed = (email || '').trim()
  if (!trimmed) return { valid: false, error: 'Please enter your email address.' }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(trimmed)) return { valid: false, error: 'Please enter a valid email address.' }
  return { valid: true, error: null }
}

export function validatePincode(pincode) {
  const digits = (pincode || '').replace(/\D/g, '')
  if (!digits) return { valid: false, error: 'Please enter your PIN code.' }
  if (digits.length > 6) return { valid: false, error: 'PIN code must be 6 digits or less.' }
  return { valid: true, error: null }
}

export function validateRequired(value) {
  if (!value || !value.toString().trim()) return { valid: false, error: 'Please fill in this field.' }
  return { valid: true, error: null }
}
