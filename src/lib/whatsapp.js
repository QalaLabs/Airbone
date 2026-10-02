// Single source for the website's WhatsApp number. Override at build time with
// NEXT_PUBLIC_WHATSAPP_NUMBER (digits, country code first, e.g. 91XXXXXXXXXX);
// it is inlined into client bundles, so changing it needs a rebuild.

export const DEFAULT_WHATSAPP_NUMBER = '919953777320'

/** wa.me number (country code + subscriber digits) or null when the input is not usable. */
export function normalizeWhatsAppNumber(raw) {
  if (typeof raw !== 'string') return null
  let digits = raw.replace(/[\s()+-]/g, '')
  if (!/^\d+$/.test(digits)) return null
  digits = digits.replace(/^00/, '')
  if (/^[6-9]\d{9}$/.test(digits)) digits = `91${digits}`
  return /^[1-9]\d{10,14}$/.test(digits) ? digits : null
}

export const WHATSAPP_NUMBER =
  normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ?? DEFAULT_WHATSAPP_NUMBER

export function whatsappHref(text, number = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** "+91 9953 777 320" style label for Indian numbers, "+<digits>" otherwise. */
export function formatWhatsAppDisplay(number = WHATSAPP_NUMBER) {
  const m = /^91(\d{4})(\d{3})(\d{3})$/.exec(number)
  return m ? `+91 ${m[1]} ${m[2]} ${m[3]}` : `+${number}`
}

export const WHATSAPP_HREF = whatsappHref()
export const WHATSAPP_DISPLAY = formatWhatsAppDisplay()
