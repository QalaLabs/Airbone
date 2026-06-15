// In-memory sliding window rate limiter.
// Persists across requests within a warm serverless container instance.
// For multi-region distributed rate limiting, replace with @upstash/ratelimit.

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()

  // Periodic cleanup to avoid unbounded growth
  if (store.size > 5_000) {
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k)
    }
  }

  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  entry.count++

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  }
}
