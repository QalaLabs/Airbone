import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8').split(/\r?\n/).map((l) => l.trim())

// `gcloud run deploy --source .` uploads everything not ignored here; local env
// files hold secrets and must never reach the Cloud Build source bucket.
for (const [name, rel] of [
  ['web', '../../.gcloudignore'],
  ['admin', '../../admin/.gcloudignore'],
]) {
  test(`regression: ${name} .gcloudignore excludes every .env file except the example`, () => {
    const lines = read(rel)
    assert.ok(lines.includes('.env*') || lines.includes('.env'), `${name} must ignore .env files`)
    assert.ok(!lines.some((l) => l.startsWith('!') && l !== '!.env.example' && l.includes('.env')), 'only .env.example may be re-included')
  })
}
