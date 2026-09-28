// Basic In-Memory Rate Limiter for Next.js API Routes
// Note: This works best on a single-node deployment (VPS).
// If deployed to Vercel/serverless, this map resets per function container.

const rateLimitMap = new Map()

// Cloud Run's front end APPENDS the real peer IP as the rightmost
// X-Forwarded-For entry; anything to its left is client-supplied.
export function clientIpFromRequest(req) {
  const parts = (req.headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  return parts.length ? parts[parts.length - 1] : '127.0.0.1'
}

export function rateLimit(req, limit = 5, windowMs = 5 * 60 * 1000, bucket = 'lead') {
  const ip = clientIpFromRequest(req)
  const key = `${bucket}:${ip}`

  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  const currentEntry = rateLimitMap.get(key) || []
  const activeRequests = currentEntry.filter(timestamp => timestamp > windowStart)

  if (activeRequests.length >= limit) {
    return { success: false, ip }
  }

  activeRequests.push(now)
  rateLimitMap.set(key, activeRequests)

  // Periodic cleanup to prevent memory leaks in the Map
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear()
  }

  return { success: true, ip }
}
