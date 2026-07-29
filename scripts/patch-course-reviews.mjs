import fs from 'fs'

const files = [
  'src/app/courses/gd-pi/page.jsx',
  'src/app/courses/airline-preparation/page.jsx',
  'src/app/courses/a320-simulator/page.jsx',
  'src/app/courses/cadet-preparation/page.jsx',
  'src/app/courses/ground-school/page.jsx',
  'src/app/courses/flying-training-india-abroad/page.jsx',
  'src/app/courses/private-pilot-license/page.jsx',
  'src/app/courses/cas-compass-adapt/page.jsx',
  'src/app/courses/cabin-crew-training/page.jsx',
]

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8')
  let changed = false
  if (!s.includes("from '@/components/CourseReviews'")) {
    if (s.includes("from '@/components/CoursePageFooter'")) {
      s = s.replace(
        "import CoursePageFooter from '@/components/CoursePageFooter'",
        "import CoursePageFooter from '@/components/CoursePageFooter'\nimport CourseReviews from '@/components/CourseReviews'",
      )
      changed = true
    }
  }
  if (!s.includes('<CourseReviews')) {
    s = s.replace(/(\n\s*)<CoursePageFooter/, '$1<CourseReviews />$1<CoursePageFooter')
    changed = true
  }
  if (changed) {
    fs.writeFileSync(f, s)
    console.log('patched', f)
  } else {
    console.log('skip', f)
  }
}
