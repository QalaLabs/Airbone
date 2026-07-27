/**
 * One-shot migrator: replace per-page Course/FAQ/Breadcrumb JSON-LD
 * with centralized buildCoursePageGraph + JsonLd.
 */
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const courseDir = path.join(ROOT, 'src/app/courses')

const SLUG_TO_REGISTRY = {
  'ground-school': 'ground-school',
  'commercial-pilot-license-cpl': 'commercial-pilot-license-cpl',
  atpl: 'atpl',
  'cabin-crew-training': 'cabin-crew-training',
  'cadet-preparation': 'cadet-preparation',
  'a320-simulator': 'a320-simulator',
  'cas-compass-adapt': 'cas-compass-adapt',
  'airline-preparation': 'airline-preparation',
  'gd-pi': 'gd-pi',
  'private-pilot-license': 'private-pilot-license',
  'instrument-rating': 'instrument-rating',
  'multi-engine-rating': 'multi-engine-rating',
  'aviation-english-icao': 'aviation-english-icao',
  'flight-dispatcher': 'flight-dispatcher',
}

function extractFaqs(src) {
  const faqs = []
  const re =
    /\{\s*['"]?@type['"]?\s*:\s*['"]Question['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*,\s*acceptedAnswer:\s*\{\s*['"]?@type['"]?\s*:\s*['"]Answer['"]\s*,\s*text:\s*['"]([^'"]+)['"]\s*\}\s*\}/g
  let m
  while ((m = re.exec(src))) {
    faqs.push({ q: m[1], a: m[2] })
  }
  // fallback for template with nested differently
  if (!faqs.length) {
    const nameRe = /name:\s*'((?:\\'|[^'])*)'\s*,\s*acceptedAnswer:\s*\{\s*@type:\s*'Answer',\s*text:\s*'((?:\\'|[^'])*)'/g
    while ((m = nameRe.exec(src))) {
      faqs.push({
        q: m[1].replace(/\\'/g, "'"),
        a: m[2].replace(/\\'/g, "'"),
      })
    }
  }
  return faqs
}

function stripOldSchemaBlocks(src) {
  let out = src
  // Remove breadcrumbSchema const
  out = out.replace(
    /const breadcrumbSchema = getBreadcrumbSchema\(\[[\s\S]*?\]\)\s*\n*/,
    ''
  )
  // Remove courseSchema / pageSchema / articleSchema object consts (until next const or export)
  out = out.replace(
    /const (courseSchema|pageSchema|articleSchema|faqSchema) = \{[\s\S]*?\n\}\s*\n*/g,
    ''
  )
  return out
}

function ensureImports(src, registryKey) {
  let out = src
  // Remove getBreadcrumbSchema import usage
  out = out.replace(
    /import \{ getBreadcrumbSchema \} from '@\/utils\/seo'\n?/,
    ''
  )
  out = out.replace(
    /import \{ getBreadcrumbSchema, getLocalBusinessSchema \} from '@\/utils\/seo'\n?/,
    ''
  )

  if (!out.includes("from '@/components/JsonLd'")) {
    out = out.replace(
      /(import CourseReviews from '@\/components\/CourseReviews'\n)/,
      `$1import JsonLd from '@/components/JsonLd'\nimport { buildCoursePageGraph } from '@/lib/schema'\nimport { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'\n`
    )
  }

  if (!out.includes("from '@/components/JsonLd'")) {
    // fallback after LeadForm import
    out = out.replace(
      /(import LeadForm from '@\/components\/LeadForm'\n)/,
      `$1import JsonLd from '@/components/JsonLd'\nimport { buildCoursePageGraph } from '@/lib/schema'\nimport { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'\n`
    )
  }

  if (!out.includes('buildCoursePageGraph')) {
    out = out.replace(
      /(import Footer from '@\/components\/Footer'\n)/,
      `$1import JsonLd from '@/components/JsonLd'\nimport { buildCoursePageGraph } from '@/lib/schema'\nimport { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'\n`
    )
  }

  return out
}

function injectGraphConst(src, registryKey, faqs) {
  const faqLiteral = JSON.stringify(faqs, null, 2)
    .replace(/"q":/g, 'q:')
    .replace(/"a":/g, 'a:')
    .replace(/"/g, "'")

  const block = `
const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['${registryKey}'],
  faqs: ${faqs.length ? faqLiteral : `COURSE_SCHEMA['${registryKey}'].faqs || []`},
})
`

  // Insert before first export default or first const SUBJECTS / FEE / etc after metadata
  if (src.includes('const coursePageGraph')) return src

  const metadataEnd = src.indexOf('export const metadata')
  if (metadataEnd === -1) {
    // insert after imports
    const lastImport = src.lastIndexOf('import ')
    const endLine = src.indexOf('\n', lastImport)
    return src.slice(0, endLine + 1) + block + src.slice(endLine + 1)
  }

  // Find end of metadata object
  const afterMeta = src.indexOf('\n}', metadataEnd)
  const insertAt = src.indexOf('\n', afterMeta) + 1
  return src.slice(0, insertAt) + block + src.slice(insertAt)
}

function replaceScriptTags(src) {
  // Replace consecutive application/ld+json scripts at top of return with JsonLd
  return src.replace(
    /(\s*)<script type="application\/ld\+json"[\s\S]*?\/>\s*(?:<script type="application\/ld\+json"[\s\S]*?\/>\s*)*/m,
    `$1<JsonLd data={coursePageGraph} />\n$1`
  )
}

let updated = 0
for (const [slug, registryKey] of Object.entries(SLUG_TO_REGISTRY)) {
  const file = path.join(courseDir, slug, 'page.jsx')
  if (!fs.existsSync(file)) {
    console.log('skip missing', slug)
    continue
  }
  let src = fs.readFileSync(file, 'utf8')
  if (src.includes('buildCoursePageGraph')) {
    console.log('already migrated', slug)
    continue
  }
  if (!src.includes('application/ld+json') && !src.includes('courseSchema')) {
    console.log('no schema', slug)
    continue
  }

  const faqs = extractFaqs(src)
  src = ensureImports(src, registryKey)
  src = stripOldSchemaBlocks(src)
  src = injectGraphConst(src, registryKey, faqs)
  src = replaceScriptTags(src)

  fs.writeFileSync(file, src)
  updated++
  console.log('updated', slug, 'faqs', faqs.length)
}

console.log('done', updated)
