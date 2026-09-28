const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9]{7,15}$/

export function validateJobApplication(v) {
  const errors = {}
  if (!v.applicantName || v.applicantName.trim().length < 2) errors.applicantName = 'Enter your full name.'
  if (!EMAIL_RE.test((v.applicantEmail || '').trim())) errors.applicantEmail = 'Enter a valid email address.'
  if (!PHONE_RE.test((v.applicantPhone || '').replace(/[\s-]/g, ''))) errors.applicantPhone = 'Enter a valid phone number.'
  if (v.resumeUrl && !/^https?:\/\//i.test(v.resumeUrl.trim())) errors.resumeUrl = 'Resume link must start with http:// or https://'
  if (!v.consent) errors.consent = 'Please accept the privacy notice.'
  return errors
}
