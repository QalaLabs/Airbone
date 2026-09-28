// Admin E2E. Runs the admin app from an isolated copy (no admin/.env) against
// the disposable loopback Postgres (E2E_DATABASE_URL, default :5433/airbone_test)
// seeded by admin/scripts/e2e-seed.ts. Never production data or credentials.
//   npm run e2e:admin      (set PW_CHANNEL=chrome to use an installed Chrome)
import { defineConfig } from '@playwright/test'

const PORT = Number(process.env.E2E_ADMIN_PORT || 4100)

export default defineConfig({
  testDir: './e2e/admin',
  globalSetup: './e2e/admin/global-setup.mjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/admin' }]],
  outputDir: 'test-results/admin',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    channel: process.env.PW_CHANNEL || undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node e2e/scripts/start-admin.mjs',
    url: `http://127.0.0.1:${PORT}/login`,
    reuseExistingServer: process.env.E2E_REUSE === '1',
    timeout: 20 * 60_000,
  },
})
