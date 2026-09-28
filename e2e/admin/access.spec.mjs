import { test, expect, newSession, superAdminSession, json, USERS, PASSWORD } from './helpers.mjs'

test('login succeeds for an active user and fails for a deactivated one', async ({ browser }) => {
  const active = await newSession(browser, USERS.staff)
  await expect(active.page).not.toHaveURL(/\/login/)
  await active.context.close()

  const other = await browser.newContext()
  const p2 = await other.newPage()
  await p2.goto('/login', { waitUntil: 'networkidle' })
  await p2.waitForFunction(() => Object.keys(document.querySelector('button[type="submit"]') ?? {}).some((k) => k.startsWith('__reactProps')))
  await p2.locator('#orgSlug').fill('airborne-aviation')
  await p2.locator('#email').fill(USERS.inactive)
  await p2.locator('#password').fill(PASSWORD)
  await p2.getByRole('button', { name: 'Sign in' }).click()
  await expect(p2.getByText('Sign in failed').first()).toBeVisible()
  await expect(p2).toHaveURL(/\/login/)
  await other.close()
})

test('users page "Deactivated" filter lists only inactive users', async ({ page }) => {
  await page.goto('/users')
  // Match directory rows by email: the signed-in user's name is also in the header.
  await expect(page.getByText(USERS.superAdmin)).toBeVisible()
  await page.locator('select').filter({ hasText: 'All status' }).selectOption('inactive')
  await expect(page.getByText(USERS.inactive)).toBeVisible()
  await expect(page.getByText(USERS.superAdmin)).toHaveCount(0)
  await expect(page.getByText(USERS.staff)).toHaveCount(0)

  const { status, body } = await json(await page.request.get('/api/v1/users?isActive=false&limit=100'))
  expect(status).toBe(200)
  expect(body.data.length).toBeGreaterThan(0)
  expect(body.data.every((u) => u.isActive === false)).toBe(true)
})

test('role change applies to every open session on the next request', async ({ browser }) => {
  const admin = await superAdminSession(browser)
  const staffA = await newSession(browser, USERS.staff)
  const staffB = await newSession(browser, USERS.staff)
  try {
    const users = (await json(await admin.api.get(`/api/v1/users?search=${encodeURIComponent(USERS.staff)}`))).body.data
    const staffId = users.find((u) => u.email === USERS.staff).id

    expect((await staffA.api.get('/api/v1/users')).status()).toBe(200)
    expect((await staffB.api.get('/api/v1/users')).status()).toBe(200)

    // Demote: no re-login in either staff session.
    expect((await admin.api.patch(`/api/v1/users/${staffId}`, { data: { role: 'CONTENT_MANAGER' } })).status()).toBe(200)
    expect((await staffA.api.get('/api/v1/users')).status()).toBe(403)
    expect((await staffB.api.get('/api/v1/users')).status()).toBe(403)
    expect((await staffA.api.get('/api/v1/courses?limit=1')).status()).toBe(200)
    const session = (await json(await staffA.api.get('/api/auth/session'))).body
    expect(session.user.role).toBe('CONTENT_MANAGER')

    // Elevate back.
    expect((await admin.api.patch(`/api/v1/users/${staffId}`, { data: { role: 'ADMIN' } })).status()).toBe(200)
    expect((await staffA.api.get('/api/v1/users')).status()).toBe(200)
    expect((await staffB.api.get('/api/v1/users')).status()).toBe(200)

    // Deactivation revokes open sessions.
    expect((await admin.api.patch(`/api/v1/users/${staffId}`, { data: { isActive: false } })).status()).toBe(200)
    expect((await staffA.api.get('/api/v1/users')).status()).toBe(401)
    expect((await admin.api.patch(`/api/v1/users/${staffId}`, { data: { isActive: true } })).status()).toBe(200)
  } finally {
    await Promise.all([admin.context.close(), staffA.context.close(), staffB.context.close()])
  }
})
