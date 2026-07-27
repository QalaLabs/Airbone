/**
 * Fix broken metadata braces + missing imports from migrate-course-schema.mjs
 */
import fs from 'fs'
import path from 'path'

const courseDir = path.join(process.cwd(), 'src/app/courses')
const dirs = fs.readdirSync(courseDir, { withFileTypes: true }).filter((d) => d.isDirectory())

const IMPORT_BLOCK = `import JsonLd from '@/components/JsonLd'
import { buildCoursePageGraph } from '@/lib/schema'
import { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'
`

for (const d of dirs) {
  if (d.name === '[slug]') continue
  const file = path.join(courseDir, d.name, 'page.jsx')
  if (!fs.existsSync(file)) continue
  let src = fs.readFileSync(file, 'utf8')
  if (!src.includes('coursePageGraph')) continue

  // Fix: metadata object was not closed before coursePageGraph
  // Pattern: last property of metadata then blank line then const coursePageGraph
  // and an extra `}` after the graph that was meant to close metadata
  src = src.replace(
    /(export const metadata = \{[\s\S]*?)(\n\nconst coursePageGraph = )/m,
    (match, metaStart, graphStart) => {
      // If metadata already closed, leave alone
      if (metaStart.trimEnd().endsWith('}')) return match
      return `${metaStart}\n}${graphStart}`
    }
  )

  // Remove erroneous closing brace that sat after coursePageGraph })
  // Typical broken form: })\n}\n\nconst SUBJECTS
  src = src.replace(/\}\)(\r?\n)\}(\r?\n\r?\nconst )/g, '})$2')
  src = src.replace(/\}\)(\r?\n)\}(\r?\n\r?\nexport )/g, '})$2')

  // Ensure imports
  if (!src.includes("from '@/components/JsonLd'")) {
    if (src.includes("from '@/components/CourseReviews'")) {
      src = src.replace(
        /(import CourseReviews from '@\/components\/CourseReviews'\r?\n)/,
        `$1${IMPORT_BLOCK}`
      )
    } else if (src.includes("from '@/components/CoursePageFooter'")) {
      src = src.replace(
        /(import CoursePageFooter from '@\/components\/CoursePageFooter'\r?\n)/,
        `$1${IMPORT_BLOCK}`
      )
    } else {
      src = src.replace(
        /(import LeadForm from '@\/components\/LeadForm'\r?\n)/,
        `$1${IMPORT_BLOCK}`
      )
    }
  }

  fs.writeFileSync(file, src)
  console.log('fixed', d.name)
}

console.log('done')
