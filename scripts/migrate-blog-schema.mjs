/**
 * Patch blog article pages to use buildArticlePageGraph.
 */
import fs from 'fs'
import path from 'path'

const blogs = [
  {
    dir: 'how-to-become-pilot-india',
    path: '/blog/how-to-become-pilot-india',
    headline: 'How to Become a Pilot in India After 12th — Step-by-Step Guide 2026',
    description:
      'Complete step-by-step guide to becoming a commercial pilot in India after Class 12, written by Capt. Navrang Singh.',
    datePublished: '2026-01-15',
    dateModified: '2026-06-01',
  },
  {
    dir: 'dgca-ground-school-guide',
    path: '/blog/dgca-ground-school-guide',
    headline: 'DGCA Ground School Guide — What to Expect',
    description: 'What DGCA ground school covers, how to prepare, and how Airborne structures CPL/ATPL theory training.',
    datePublished: '2026-02-01',
    dateModified: '2026-06-01',
  },
  {
    dir: 'pilot-salary-india',
    path: '/blog/pilot-salary-india',
    headline: 'Pilot Salary in India — CPL to Airline Captain',
    description: 'Pilot salary ranges in India from CPL holders to airline captains, explained for aspirants and parents.',
    datePublished: '2026-02-15',
    dateModified: '2026-06-01',
  },
  {
    dir: 'pilot-training-cost-india',
    path: '/blog/pilot-training-cost-india',
    headline: 'Pilot Training Cost in India — Complete Breakdown',
    description: 'Complete cost breakdown for becoming a commercial pilot in India, including ground school and flying hours.',
    datePublished: '2026-03-01',
    dateModified: '2026-06-01',
  },
]

function extractFaqs(src) {
  const faqs = []
  const re =
    /\{\s*['"]?@type['"]?\s*:\s*['"]Question['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*,\s*acceptedAnswer:\s*\{\s*['"]?@type['"]?\s*:\s*['"]Answer['"]\s*,\s*text:\s*['"]([^'"]+)['"]\s*\}\s*\}/g
  let m
  while ((m = re.exec(src))) faqs.push({ q: m[1], a: m[2] })
  if (!faqs.length) {
    const nameRe =
      /name:\s*'((?:\\'|[^'])*)'\s*,\s*acceptedAnswer:\s*\{\s*@type:\s*'Answer',\s*text:\s*'((?:\\'|[^'])*)'/g
    while ((m = nameRe.exec(src))) {
      faqs.push({ q: m[1].replace(/\\'/g, "'"), a: m[2].replace(/\\'/g, "'") })
    }
  }
  return faqs
}

for (const blog of blogs) {
  const file = path.join(process.cwd(), 'src/app/blog', blog.dir, 'page.jsx')
  if (!fs.existsSync(file)) {
    console.log('missing', blog.dir)
    continue
  }
  let src = fs.readFileSync(file, 'utf8')
  if (src.includes('buildArticlePageGraph')) {
    console.log('already', blog.dir)
    continue
  }

  const faqs = extractFaqs(src)

  // Read headline/description from existing articleSchema if present
  const headlineMatch = src.match(/headline:\s*'((?:\\'|[^'])*)'/)
  const descMatch = src.match(/description:\s*'((?:\\'|[^'])*)'/)
  const pubMatch = src.match(/datePublished:\s*'([^']+)'/)
  const modMatch = src.match(/dateModified:\s*'([^']+)'/)

  const headline = headlineMatch ? headlineMatch[1].replace(/\\'/g, "'") : blog.headline
  const description = descMatch ? descMatch[1].replace(/\\'/g, "'") : blog.description
  const datePublished = pubMatch?.[1] || blog.datePublished
  const dateModified = modMatch?.[1] || blog.dateModified

  src = src.replace(/import \{ getBreadcrumbSchema \} from '@\/utils\/seo'\n?/, '')

  if (!src.includes("from '@/components/JsonLd'")) {
    src = src.replace(
      /(import LeadForm from '@\/components\/LeadForm'\n)/,
      `$1import JsonLd from '@/components/JsonLd'\nimport { buildArticlePageGraph } from '@/lib/schema'\n`
    )
  }

  src = src.replace(/const breadcrumbSchema = getBreadcrumbSchema\(\[[\s\S]*?\]\)\s*\n*/, '')
  src = src.replace(/const articleSchema = \{[\s\S]*?\n\}\s*\n*/, '')
  src = src.replace(/const faqSchema = \{[\s\S]*?\n\}\s*\n*/, '')

  const faqLiteral = JSON.stringify(faqs, null, 2)
    .replace(/"q":/g, 'q:')
    .replace(/"a":/g, 'a:')
    .replace(/"/g, "'")

  const graphBlock = `
const articlePageGraph = buildArticlePageGraph({
  path: '${blog.path}',
  headline: ${JSON.stringify(headline)},
  description: ${JSON.stringify(description)},
  datePublished: '${datePublished}',
  dateModified: '${dateModified}',
  faqs: ${faqLiteral},
})
`

  // Insert after metadata
  src = src.replace(/(export const metadata = \{[\s\S]*?\n\}\n)/, `$1${graphBlock}\n`)

  src = src.replace(
    /(\s*)<script type="application\/ld\+json"[\s\S]*?\/>\s*(?:<script type="application\/ld\+json"[\s\S]*?\/>\s*)*/m,
    `$1<JsonLd data={articlePageGraph} />\n$1`
  )

  fs.writeFileSync(file, src)
  console.log('updated', blog.dir, 'faqs', faqs.length)
}
