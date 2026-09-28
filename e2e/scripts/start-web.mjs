import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startIsolatedApp, baseEnv } from './isolated-app.mjs'
import { INTAKE_KEY } from '../mock-admin/fixtures.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const MOCK_PORT = Number(process.env.MOCK_ADMIN_PORT || 4799)
const WEB_PORT = Number(process.env.E2E_WEB_PORT || 3100)

startIsolatedApp({
  source: ROOT,
  workdir: join(tmpdir(), 'airbone-e2e-web'),
  port: WEB_PORT,
  env: {
    ...baseEnv(),
    ADMIN_API_URL: `http://127.0.0.1:${MOCK_PORT}`,
    PUBLIC_INTAKE_KEY: INTAKE_KEY,
    OTP_HASH_SECRET: 'e2e-otp-secret-not-a-secret',
    NEXT_PUBLIC_ADMIN_URL: 'http://127.0.0.1:4100',
  },
})
