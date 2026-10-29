import { secretMatches, tagsToRevalidate, pathsToRevalidate } from './cmsCache.js'

/**
 * POST /api/revalidate logic: shared-secret auth (constant-time), allow-listed
 * cache tags and page paths. `revalidate` purges tags (revalidateTag);
 * `revalidatePath` purges Next.js page caches.
 */
export async function handleRevalidateRequest(req, { secret, revalidate, revalidatePath }) {
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
  const paths = pathsToRevalidate(body)
  if (tags.length === 0 && paths.length === 0) {
    return Response.json({ error: 'No known resources to revalidate' }, { status: 400 })
  }
  if (typeof revalidate === 'function') {
    for (const tag of tags) revalidate(tag)
  }
  if (typeof revalidatePath === 'function') {
    for (const p of paths) revalidatePath(p)
  }
  return Response.json({ revalidated: tags, paths: [...paths] })
}
