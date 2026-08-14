export function validateName(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return { valid: false, error: 'Please enter your full name.' }
  if (trimmed.length < 2) return { valid: false, error: 'Name must be at least 2 characters.' }
  if (trimmed.length > 60) return { valid: false, error: 'Name must be 60 characters or less.' }
  return { valid: true, error: null }
}

export function validatePhone(phone) {
  let cleaned = (phone || '').trim()
  cleaned = cleaned.replace(/[\s()-]/g, '')
  // Handle leading +91, 91 (when longer than 10 digits), or leading 0
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3)
  } else if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2)
  } else if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.substring(1)
  }
  
  const digits = cleaned.replace(/\D/g, '')
  if (!digits) return { valid: false, error: 'Please enter your contact number.' }
  if (digits.length !== 10) return { valid: false, error: 'Please enter a valid 10-digit contact number.' }
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
