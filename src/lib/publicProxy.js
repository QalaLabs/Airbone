import { resolveAdminApiUrl } from './upstream.js'
import { cmsFetchOptions } from './cmsCache.js'

/**
 * Forward a read-only GET to the admin public API.
 * A missing/invalid ADMIN_API_URL, an upstream non-2xx, or a non-JSON body all
 * surface as 502 so the client can show an error instead of an empty list.
 */
export async function proxyPublicGet(label, pathAndQuery, { revalidate } = {}) {
  const base = resolveAdminApiUrl()
  if (!base) {
    console.error(`[Proxy Error ${label}]: ADMIN_API_URL is missing or invalid`)
    return Response.json({ error: 'Upstream Error' }, { status: 502 })
  }
  try {
    const res = await fetch(`${base}${pathAndQuery}`, cmsFetchOptions(pathAndQuery, revalidate))
    if (!res.ok) {
      console.error(`[Proxy Error ${label}]: upstream responded ${res.status}`)
      return Response.json({ error: 'Upstream Error', upstreamStatus: res.status }, { status: 502 })
    }
    let data
    try {
      data = await res.json()
    } catch {
      console.error(`[Proxy Error ${label}]: upstream returned a non-JSON body`)
      return Response.json({ error: 'Upstream Error' }, { status: 502 })
    }
    return Response.json(data)
  } catch (err) {
    console.error(`[Proxy Error ${label}]:`, err?.message ?? err)
    return Response.json({ error: 'Upstream Error' }, { status: 502 })
  }
}

export function clampLimit(raw, fallback, max) {
  const n = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(n, max)
}
