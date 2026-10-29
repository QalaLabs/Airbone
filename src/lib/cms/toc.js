import { decodeEntities } from './safeContent.js'

export function slugifyHeading(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * Extracts H2 and H3 headings from HTML content to build an accessible Table of Contents.
 * Returns an array of items: [{ id, text, level }]
 * Returns empty array if fewer than 2 headings are present.
 */
export function extractTableOfContents(html) {
  if (!html || typeof html !== 'string') return []

  const headings = []
  const counts = new Map()
  const headingRegex = /<(h[23])\b([^>]*)>([\s\S]*?)<\/\1>/gi
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const rawAttrs = match[2]
    const inner = match[3]

    // Strip nested tags to get plain text
    const plainText = decodeEntities(inner.replace(/<[^>]*>/g, '').trim())
    if (!plainText) continue

    // Check if an existing ID was authored in attributes
    let existingId = null
    const idMatch = rawAttrs.match(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    if (idMatch) existingId = idMatch[1] || idMatch[2] || idMatch[3]

    let slug = existingId || slugifyHeading(plainText) || `section-${headings.length + 1}`
    const count = counts.get(slug) || 0
    counts.set(slug, count + 1)
    if (count > 0 && !existingId) {
      slug = `${slug}-${count}`
    }

    headings.push({
      id: slug,
      text: plainText,
      level: tag === 'h2' ? 2 : 3,
    })
  }

  // Only return TOC if there are at least 2 headings
  return headings.length >= 2 ? headings : []
}
