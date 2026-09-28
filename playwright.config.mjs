// Public-site E2E. Runs the marketing app from an isolated copy (no `.env*`)
// against a deterministic mock admin API — never production data or keys.
//   npm run e2e            (set PW_CHANNEL=chrome to use an installed Chrome)
import { defineConfig } from '@playwright/test'

const WEB_PORT = Number(process.env.E2E_WEB_PORT || 3100)
const MOCK_PORT = Number(process.env.MOCK_ADMIN_PORT || 4799)

export default defineConfig({
  testDir: './e2e/public',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/public' }]],
  outputDir: 'test-results/public',
  use: {
    baseURL: `http://127.0.0.1:${WEB_PORT}`,
    channel: process.env.PW_CHANNEL || undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node e2e/mock-admin/server.mjs',
      url: `http://127.0.0.1:${MOCK_PORT}/__mock/health`,
      reuseExistingServer: process.env.E2E_REUSE === '1',
      timeout: 30_000,
    },
    {
      command: 'node e2e/scripts/start-web.mjs',
      url: `http://127.0.0.1:${WEB_PORT}/`,
      reuseExistingServer: process.env.E2E_REUSE === '1',
      timeout: 15 * 60_000,
    },
  ],
})
