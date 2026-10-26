import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = process.argv[2] || join(process.env.USERPROFILE || '', 'Downloads', 'index-v2.html')
const targets = [
  join(root, 'public/webinar/page.html'),
  join(root, 'src/app/webinar/index-v2.html'),
]

if (!existsSync(source)) {
  console.error(`Source HTML not found: ${source}`)
  process.exit(1)
}

for (const dest of targets) {
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(source, dest)
  console.log(`Copied to ${dest}`)
}
