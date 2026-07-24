/** Deterministic 0–1 unit value for stable particle layouts (avoids Math.random in render). */
export function seededUnit(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/** Deterministic value in [min, max). */
export function seededRange(seed, min, max) {
  return min + seededUnit(seed) * (max - min)
}
