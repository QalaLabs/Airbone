import { revalidateTag, revalidatePath } from 'next/cache'
import { handleRevalidateRequest } from '@/lib/revalidateHandler'

export const dynamic = 'force-dynamic'

/**
 * Called by the admin app after CMS content changes. Requires the shared
 * REVALIDATE_SECRET; purges allow-listed cache tags and paths.
 */
export async function POST(req) {
  return handleRevalidateRequest(req, {
    secret: process.env.REVALIDATE_SECRET,
    revalidate: revalidateTag,
    revalidatePath: (path) => revalidatePath(path),
  })
}
