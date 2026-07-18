const BASE = process.env.ADMIN_API_URL ?? 'http://localhost:4000'

// Returns { data, status } — status 0 means network error, non-zero is HTTP status
export async function fetchPublicWithStatus(path, params = {}) {
  const url = new URL(`${BASE}/api/public${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (res.ok) {
      const json = await res.json()
      return { data: json.data ?? null, status: res.status }
    }
    return { data: null, status: res.status }
  } catch {
    return { data: null, status: 0 }
  }
}

export async function fetchPublic(path, params = {}) {
  const url = new URL(`${BASE}/api/public${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

// Format ₹ from DB fee (number) → display string
export function formatFee(fee) {
  if (!fee) return null
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(fee)
}

// Authoritative course fee display map based on Airborne_Page_Content_v6.md
export function getCourseFeeDisplay(slug, fee) {
  const norm = (slug || '').toLowerCase().replace(/^\/courses\//, '').trim()

  if (norm.includes('atpl')) return '₹1,50,000'
  if (norm.includes('cadet')) return '₹50,000'
  if (norm.includes('a320') || norm.includes('simulator')) return '₹10,000/hr'
  if (norm.includes('cas') || norm.includes('compass') || norm.includes('adapt')) return '₹30,000'
  if (norm.includes('airline-prep') || norm.includes('airline-interview')) return '₹30,000'
  if (norm.includes('cabin-crew') || norm === 'cabin-crew') return '₹30K–₹54K'
  if (norm.includes('cpl') || norm.includes('ground-classes') || norm.includes('ground-school')) return '₹2,70,000'
  if (norm.includes('flying-training')) return '₹52–62 Lakh'
  if (norm.includes('private-pilot') || norm.includes('ppl')) return '₹22–25 Lakh'
  if (norm.includes('instrument-rating')) return '₹3–5 Lakh'
  if (norm.includes('multi-engine')) return '₹3–5 Lakh'
  if (norm.includes('flight-dispatcher')) return '₹1.5–2.5 Lakh'
  if (norm.includes('aviation-english')) return '₹25,000'

  if (fee) {
    return formatFee(fee)
  }
  return 'Contact us'
}

// Format salary range from job
export function formatSalary(min, max, currency = 'INR') {
  if (!min && !max) return null
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)} / Month`
  if (min) return `From ${fmt(min)} / Month`
  return `Up to ${fmt(max)} / Month`
}
