import { test as base, expect } from '@playwright/test'

// Must match admin/scripts/e2e-seed.ts (synthetic, loopback test DB only).
export const PASSWORD = 'E2e-Only-Password-1'
export const USERS = {
  superAdmin: 'e2e-superadmin@example.test',
  staff: 'e2e-staff@example.test',
  inactive: 'e2e-inactive@example.test',
}

export const SUPERADMIN_STATE = 'test-results/admin/.auth/superadmin.json'

export async function login(page, email) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  // A click before React hydrates submits the native form and silently reloads /login.
  await page.waitForFunction(() => {
    const btn = [...document.querySelectorAll('button[type="submit"]')].find((b) => b.textContent?.includes('Sign in'))
    return Boolean(btn && Object.keys(btn).some((k) => k.startsWith('__reactProps')))
  })
  await page.locator('#orgSlug').fill('airborne-aviation')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 })
}

export async function newSession(browser, email) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await login(page, email)
  return { context, page, api: context.request }
}

export async function superAdminSession(browser) {
  const context = await browser.newContext({ storageState: SUPERADMIN_STATE })
  const page = await context.newPage()
  return { context, page, api: context.request }
}

export async function json(res) {
  const body = await res.json().catch(() => null)
  return { status: res.status(), body }
}

export const test = base.extend({
  storageState: SUPERADMIN_STATE,
})
export { expect }
