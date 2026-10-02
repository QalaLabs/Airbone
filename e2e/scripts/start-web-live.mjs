// Starts the marketing website for the admin E2E suite, wired to the REAL
// isolated E2E admin (loopback test DB) instead of the mock admin, so content
// published in the admin can be asserted on the public site. Isolated copy,
// no `.env*`, test-only secrets.
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startIsolatedApp, baseEnv } from './isolated-app.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const ADMIN_PORT = Number(process.env.E2E_ADMIN_PORT || 4100)
const WEB_PORT = Number(process.env.E2E_LIVE_WEB_PORT || 4101)
export const E2E_REVALIDATE_SECRET = 'e2e-revalidate-secret-not-a-secret'

async function waitForAdmin() {
  const url = `http://127.0.0.1:${ADMIN_PORT}/login`
  const deadline = Date.now() + 25 * 60_000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error(`admin did not come up at ${url}`)
}

await waitForAdmin()

startIsolatedApp({
  source: ROOT,
  workdir: join(tmpdir(), 'airbone-e2e-web-live'),
  port: WEB_PORT,
  env: {
    ...baseEnv(),
    ADMIN_API_URL: `http://127.0.0.1:${ADMIN_PORT}`,
    PUBLIC_INTAKE_KEY: 'e2e-intake-key-not-a-secret',
    OTP_HASH_SECRET: 'e2e-otp-secret-not-a-secret',
    NEXT_PUBLIC_ADMIN_URL: `http://127.0.0.1:${ADMIN_PORT}`,
    REVALIDATE_SECRET: E2E_REVALIDATE_SECRET,
    // A long fallback window: content can only change quickly via the admin's purge.
    CMS_REVALIDATE_SECONDS: '3600',
  },
})
