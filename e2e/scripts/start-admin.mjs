// Starts the admin app for E2E against the disposable loopback Postgres only.
// admin/.env (production Cloud SQL + provider credentials) is never copied or
// loaded; the safe-db interlock refuses any non-loopback database.
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { startIsolatedApp, baseEnv } from './isolated-app.mjs'
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
