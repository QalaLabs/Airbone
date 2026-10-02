// Starts the admin app for E2E against the disposable loopback Postgres only.
// admin/.env (production Cloud SQL + provider credentials) is never copied or
// loaded; the safe-db interlock refuses any non-loopback database.
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { startIsolatedApp, baseEnv } from './isolated-app.mjs'
import { startMockGa4 } from './mock-ga4.mjs'
import { assertSafeDatabaseUrl } from '../../admin/scripts/safe-db-check.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PORT = Number(process.env.E2E_ADMIN_PORT || 4100)
const DATABASE_URL = process.env.E2E_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5433/airbone_test'

const env = {
  ...baseEnv(),
  DATABASE_URL,
  DIRECT_URL: DATABASE_URL,
  AUTH_SECRET: 'e2e-auth-secret-not-a-real-secret-0123456789',
  AUTH_URL: `http://127.0.0.1:${PORT}`,
  NEXTAUTH_URL: `http://127.0.0.1:${PORT}`,
  AUTH_TRUST_HOST: 'true',
  PUBLIC_INTAKE_KEY: 'e2e-intake-key-not-a-secret',
  PUBLIC_ORG_SLUG: 'airborne-aviation',
  // Deterministic fixture job source (test data only) for the ingestion E2E.
  JOB_SOURCE_FIXTURE: '1',
  // Document uploads go to a throwaway local directory instead of the GCS bucket.
  STORAGE_LOCAL_DIR: join(tmpdir(), 'airbone-e2e-storage'),
  // CMS changes purge the live E2E website copy (e2e/scripts/start-web-live.mjs).
  WEBSITE_REVALIDATE_URL: `http://127.0.0.1:${Number(process.env.E2E_LIVE_WEB_PORT || 4101)}/api/revalidate`,
  WEBSITE_REVALIDATE_SECRET: 'e2e-revalidate-secret-not-a-secret',
  // GA4 Data API is a local deterministic mock with a key generated at startup.
  ...startMockGa4(Number(process.env.E2E_MOCK_GA4_PORT || 4102)),
}

console.log(`[start-admin] ${assertSafeDatabaseUrl(env)}`)

startIsolatedApp({
  source: join(ROOT, 'admin'),
  workdir: join(tmpdir(), 'airbone-e2e-admin'),
  port: PORT,
  env,
  beforeBuild: (childEnv) => {
    for (const args of [['prisma', 'migrate', 'deploy'], ['tsx', 'scripts/e2e-seed.ts']]) {
      const r = spawnSync('npx', args, { cwd: join(tmpdir(), 'airbone-e2e-admin'), env: childEnv, stdio: 'inherit', shell: process.platform === 'win32' })
      if (r.status !== 0) throw new Error(`npx ${args.join(' ')} failed`)
    }
    // The course sync reads the website registry from the repo, so it runs from the
    // repo script (cwd = isolated copy, which has no .env), pinned to the test DB host.
    const sync = spawnSync(process.execPath, [join(ROOT, 'admin', 'scripts', 'lms-course-sync.mjs'), '--apply'], {
      cwd: join(tmpdir(), 'airbone-e2e-admin'),
      env: { ...childEnv, LMS_SYNC_EXPECT_HOST: new URL(DATABASE_URL).hostname },
      stdio: 'inherit',
    })
    if (sync.status !== 0) throw new Error('lms-course-sync --apply failed')
  },
})
