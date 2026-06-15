const BASE = process.env.ADMIN_API_URL ?? 'http://localhost:3001'

export async function fetchPublic(path, params = {}) {
  const url = new URL(`${BASE}/api/public${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString(), { next: { revalidate: 60 } })
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
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
