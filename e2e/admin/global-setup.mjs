import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { SUPERADMIN_STATE, USERS, login } from './helpers.mjs'

// The admin enforces 5 sign-ins per account per 5 minutes (successful ones
// included), so the superadmin signs in once and every test reuses the session.
export default async function globalSetup(config) {
  const { baseURL, channel } = config.projects[0].use
  mkdirSync(dirname(SUPERADMIN_STATE), { recursive: true })
  const browser = await chromium.launch({ channel })
  try {
    const context = await browser.newContext({ baseURL })
    const page = await context.newPage()
    await login(page, USERS.superAdmin)
    await context.storageState({ path: SUPERADMIN_STATE })
  } finally {
    await browser.close()
  }
}
