// Basic In-Memory Rate Limiter for Next.js API Routes
// Note: This works best on a single-node deployment (VPS).
// If deployed to Vercel/serverless, this map resets per function container.

const rateLimitMap = new Map()

export function rateLimit(req, limit = 5, windowMs = 5 * 60 * 1000) {
  // Extract IP from headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
  
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  const currentEntry = rateLimitMap.get(ip) || []
  const activeRequests = currentEntry.filter(timestamp => timestamp > windowStart)

  if (activeRequests.length >= limit) {
    return { success: false, ip }
  }

  activeRequests.push(now)
  rateLimitMap.set(ip, activeRequests)

  // Periodic cleanup to prevent memory leaks in the Map
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear()
  }

  return { success: true, ip }
}
