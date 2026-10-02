// Cache tags shared by every read of the admin public API so the admin can
// purge exactly the content type it changed via POST /api/revalidate.

export const CMS_RESOURCES = Object.freeze([
  'testimonials',
  'courses',
  'blogs',
  'resources',
  'jobs',
  'settings',
  'pages',
  'placements',
  'google-reviews',
])

/** Tag for a public API path such as "/testimonials" or "/api/public/courses?slug=x". */
export function cmsTagForPath(path) {
  const clean = String(path ?? '').split('?')[0].replace(/^\/api\/public/, '')
  const resource = clean.split('/').filter(Boolean)[0] ?? ''
  return CMS_RESOURCES.includes(resource) ? `cms:${resource}` : null
}

/** Fallback refresh window for CMS reads; CMS_REVALIDATE_SECONDS overrides the 60s default. */
export function cmsRevalidateSeconds(env = process.env) {
  const n = Number.parseInt(env.CMS_REVALIDATE_SECONDS ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : 60
}

export function cmsFetchOptions(path, revalidate = cmsRevalidateSeconds()) {
  const tag = cmsTagForPath(path)
  return { next: { revalidate, tags: tag ? ['cms', tag] : ['cms'] } }
}

/** Normalise a revalidation request body into the allow-listed tags to purge. */
export function tagsToRevalidate(body) {
  const requested = Array.isArray(body?.resources) ? body.resources : []
  const tags = new Set()
  for (const r of requested) {
    if (typeof r === 'string' && CMS_RESOURCES.includes(r)) tags.add(`cms:${r}`)
  }
  return [...tags]
}

/** Constant-time comparison of the shared revalidation secret. */
export function secretMatches(given, expected) {
  if (typeof given !== 'string' || typeof expected !== 'string' || !expected) return false
  if (given.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}
