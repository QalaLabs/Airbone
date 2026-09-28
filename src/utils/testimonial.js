const MARKUP = /[<>]/

export function validateTestimonial(v) {
  const errors = {}
  const name = (v.authorName || '').trim()
  const content = (v.content || '').trim()
  if (name.length < 2 || MARKUP.test(name)) errors.authorName = 'Enter your name.'
  if (content.length < 20) errors.content = 'Please write at least 20 characters.'
  else if (content.length > 2000) errors.content = 'Please keep it under 2000 characters.'
  else if (MARKUP.test(content)) errors.content = 'Please remove < and > characters.'
  if (v.authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.authorEmail.trim())) errors.authorEmail = 'Enter a valid email or leave it blank.'
  if (v.rating !== undefined && v.rating !== null && v.rating !== '' && !(Number(v.rating) >= 1 && Number(v.rating) <= 5)) errors.rating = 'Choose 1–5 stars.'
  if (!v.consent) errors.consent = 'Please allow us to publish your testimonial.'
  return errors
}

/** Only the fields the public API accepts; status/featured are never sent. */
export function buildTestimonialPayload(v) {
  return {
    authorName: (v.authorName || '').trim(),
    authorTitle: (v.authorTitle || '').trim() || undefined,
    authorEmail: (v.authorEmail || '').trim() || undefined,
    content: (v.content || '').trim(),
    rating: v.rating ? Number(v.rating) : undefined,
    consent: v.consent === true,
  }
}
