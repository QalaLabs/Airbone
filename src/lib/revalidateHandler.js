import { secretMatches, tagsToRevalidate } from './cmsCache.js'

/**
 * POST /api/revalidate logic: shared-secret auth (constant-time), allow-listed
 * cache tags only. `revalidate` purges one tag (next/cache revalidateTag).
 */
export async function handleRevalidateRequest(req, { secret, revalidate }) {
  const expected = (secret ?? '').trim()
  if (!expected) {
    return Response.json({ error: 'Revalidation is not configured' }, { status: 503 })
  }
  if (!secretMatches(req.headers.get('x-revalidate-secret') ?? '', expected)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const tags = tagsToRevalidate(body)
  if (tags.length === 0) {
    return Response.json({ error: 'No known resources to revalidate' }, { status: 400 })
  }
  for (const tag of tags) revalidate(tag)
  return Response.json({ revalidated: tags })
}
