/** Returns the URL only when it is an absolute http(s) URL. */
export function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (!parsed.host) return null
    return parsed.toString()
  } catch {
    return null
  }
}

export function mapResource(r) {
  const meta = r.metadata ?? {}
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    fileName: meta.fileName ?? r.slug ?? `${r.id}.pdf`,
    size: meta.size ?? null,
    type: r.type ?? meta.type ?? 'Document',
    fileUrl: safeHttpUrl(r.fileUrl),
    externalUrl: safeHttpUrl(r.externalUrl),
    isGated: r.isGated !== false,
  }
}

/**
 * What clicking a resource does.
 * gate: needs lead capture / token; download: file download; external: open link; none: nothing usable.
 */
export function resolveResourceAction(resource) {
  if (resource.isGated) return { kind: 'gate' }
  if (resource.fileUrl) return { kind: 'download', url: resource.fileUrl }
  if (resource.externalUrl) return { kind: 'external', url: resource.externalUrl }
  return { kind: 'none' }
}

/**
 * Classify a resources list response. Only a 2xx with a `data` array is a success;
 * an empty array is a legitimate "no resources" state, everything else is an error.
 */
export async function parseResourcesResponse(res) {
  if (!res || !res.ok) return { ok: false, status: res?.status ?? 0 }
  let body
  try {
    body = await res.json()
  } catch {
    return { ok: false, status: res.status, malformed: true }
  }
  if (!body || !Array.isArray(body.data)) return { ok: false, status: res.status, malformed: true }
  return { ok: true, resources: body.data.map(mapResource) }
}
