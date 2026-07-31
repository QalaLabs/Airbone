import { absUrl, ADDRESS, ORG } from './constants.js'
import { id } from './ids.js'

/**
 * Sanitize free-text for schema: strip unverifiable superlatives / absolute stats
 * while keeping factual course descriptions.
 */
export function sanitizeSchemaText(text = '') {
  if (!text) return ''
  return String(text)
    .replace(/\b100%\s*(first[- ]attempt\s+)?(DGCA\s+)?(exam\s+)?pass\s*rate\b/gi, 'strong DGCA exam preparation focus')
    .replace(/\bIndia'?s?\s+most\s+trusted\b/gi, 'DGCA-aligned')
    .replace(/\b(No\.?\s*1|number\s+one|#1)\b/gi, '')
    .replace(/\b(highest|largest|best)\s+in\s+Delhi\s*NCR\b/gi, 'in Delhi NCR')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Extract a single reliable INR list price for Offer schema.
 * Rejects ranges, Lakh/K shorthand, scholarship copy, and multi-number strings
 * that would fabricate false Google Offer prices (e.g. "₹50K–1L" → 501).
 */
export function parseInrPrice(price) {
  if (price == null || price === '') return null
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
    return String(Math.round(price))
  }

  const raw = String(price).trim()
  if (!raw) return null

  // Reject ambiguous marketing / band strings
  if (
    /scholarship|lakh|lacs|\bK\b|onwards|\+|–|-|to\s+\d|\/\s*₹/i.test(raw) &&
    !/^₹?[\d,]+$/.test(raw)
  ) {
    return null
  }

  // Accept only a single clean amount: 270000 | ₹2,70,000 | 2,70,000
  const single = raw.match(/^₹?\s*([\d,]+)\s*$/)
  if (!single) return null

  const digits = single[1].replace(/,/g, '')
  if (!/^\d{3,8}$/.test(digits)) return null
  const n = Number(digits)
  if (!Number.isFinite(n) || n < 100) return null
  return String(n)
}

/**
 * ISO-8601 duration helper — accepts "P3M", "3 months", "3–6 months", "12 weeks"
 */
export function toIsoDuration(duration) {
  if (!duration) return undefined
  const s = String(duration).trim()
  if (/^P[\dYMDWTHMS.]+$/i.test(s)) return s.toUpperCase()

  const range = s.match(/(\d+)\s*[–-]\s*(\d+)\s*(month|week|day|hour)/i)
  if (range) {
    const n = range[1]
    const unit = range[3].toLowerCase()
    if (unit.startsWith('month')) return `P${n}M`
    if (unit.startsWith('week')) return `P${n}W`
    if (unit.startsWith('day')) return `P${n}D`
    if (unit.startsWith('hour')) return `PT${n}H`
  }

  const single = s.match(/(\d+)\s*(month|week|day|hour)/i)
  if (single) {
    const n = single[1]
    const unit = single[2].toLowerCase()
    if (unit.startsWith('month')) return `P${n}M`
    if (unit.startsWith('week')) return `P${n}W`
    if (unit.startsWith('day')) return `P${n}D`
    if (unit.startsWith('hour')) return `PT${n}H`
  }

  return undefined
}

export function buildBreadcrumbList(links, pagePath) {
  const path = pagePath || (links[links.length - 1]?.path ?? '/')
  return {
    '@type': 'BreadcrumbList',
    '@id': id.breadcrumb(path),
    itemListElement: links.map((link, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: link.name,
      item: absUrl(link.path || '/'),
    })),
  }
}

export function buildFaqPage(faqs, pagePath) {
  if (!faqs?.length) return null
  return {
    '@type': 'FAQPage',
    '@id': id.faq(pagePath),
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q || f.name || f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: sanitizeSchemaText(f.a || f.text || f.answer || ''),
      },
    })),
  }
}

export function buildWebPage({
  path,
  name,
  description,
  primaryImagePath,
  isPartOfWebsite = true,
  about,
  mainEntity,
}) {
  const page = {
    '@type': 'WebPage',
    '@id': id.webpage(path),
    url: absUrl(path),
    name,
    description: sanitizeSchemaText(description),
    isPartOf: isPartOfWebsite ? { '@id': id.website() } : undefined,
    about: about || { '@id': id.org() },
    inLanguage: 'en-IN',
    publisher: { '@id': id.org() },
  }

  if (primaryImagePath) {
    page.primaryImageOfPage = { '@id': id.image(primaryImagePath) }
  }
  if (mainEntity) {
    page.mainEntity = typeof mainEntity === 'string' ? { '@id': mainEntity } : mainEntity
  }

  return page
}

/**
 * Course + CourseInstance + Offer linked to canonical Org / Founder
 */
export function buildCourseEntity({
  slug,
  name,
  description,
  path,
  price,
  priceCurrency = 'INR',
  duration,
  courseMode = 'onsite',
  startDate,
  teaches,
  category,
  coursePrerequisites,
  imagePath,
  maximumAttendeeCapacity,
  availableLanguage = ['en', 'hi'],
  includeInstructor = true,
}) {
  const coursePath = path || `/courses/${slug}`
  const courseId = id.course(slug)
  const instanceId = id.courseInstance(slug)
  const offerId = id.offer(slug)
  const numericPrice = parseInrPrice(price)
  const isoDuration = toIsoDuration(duration)

  const course = {
    '@type': 'Course',
    '@id': courseId,
    name,
    description: sanitizeSchemaText(description),
    url: absUrl(coursePath),
    provider: { '@id': id.org() },
    inLanguage: availableLanguage,
    availableLanguage,
    isAccessibleForFree: false,
    courseMode,
  }

  if (isoDuration) course.timeRequired = isoDuration
  if (teaches?.length) course.teaches = teaches
  if (category) course.about = category
  if (coursePrerequisites) course.coursePrerequisites = coursePrerequisites
  if (imagePath) {
    course.image = absUrl(imagePath)
  }

  const courseInstance = {
    '@type': 'CourseInstance',
    '@id': instanceId,
    name: startDate ? `${name} - Upcoming Batch` : name,
    courseMode,
    location: { '@id': id.place() },
    courseWorkload: isoDuration || duration || undefined,
  }

  if (startDate) courseInstance.startDate = startDate
  if (maximumAttendeeCapacity != null && maximumAttendeeCapacity !== '') {
    courseInstance.maximumAttendeeCapacity = maximumAttendeeCapacity
  }
  if (includeInstructor) {
    courseInstance.instructor = { '@id': id.founder() }
  }

  if (numericPrice) {
    const offer = {
      '@type': 'Offer',
      '@id': offerId,
      url: absUrl(coursePath),
      price: numericPrice,
      priceCurrency,
      availability: 'https://schema.org/InStock',
      category: 'Tuition',
      seller: { '@id': id.org() },
    }
    course.offers = { '@id': offerId }
    courseInstance.offers = { '@id': offerId }
    course.hasCourseInstance = { '@id': instanceId }
    return { course, courseInstance, offer }
  }

  course.hasCourseInstance = { '@id': instanceId }
  return { course, courseInstance, offer: null }
}

export function buildArticleEntity({
  path,
  headline,
  description,
  datePublished,
  dateModified,
  imagePath,
}) {
  const article = {
    '@type': 'Article',
    '@id': id.article(path),
    headline,
    description: sanitizeSchemaText(description),
    url: absUrl(path),
    mainEntityOfPage: { '@id': id.webpage(path) },
    author: { '@id': id.founder() },
    publisher: { '@id': id.org() },
    datePublished,
    dateModified: dateModified || datePublished,
    inLanguage: 'en-IN',
    isPartOf: { '@id': id.website() },
  }
  if (imagePath) article.image = absUrl(imagePath)
  return article
}

export function buildItemList({ name, description, path, items }) {
  return {
    '@type': 'ItemList',
    '@id': `${absUrl(path)}#itemlist`,
    name,
    description: sanitizeSchemaText(description),
    url: absUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absUrl(item.path || item.url),
      item: item.courseSlug ? { '@id': id.course(item.courseSlug) } : absUrl(item.path || item.url),
    })),
  }
}

/** Reference stubs used when course is listed in catalog but not fully defined on homepage */
export function buildCourseStub(slug, name, path) {
  return {
    '@type': 'Course',
    '@id': id.course(slug),
    name,
    url: absUrl(path || `/courses/${slug}`),
    provider: { '@id': id.org() },
  }
}

export { ADDRESS, ORG }
