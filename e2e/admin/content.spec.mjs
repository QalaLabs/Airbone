import { test, expect, json, superAdminSession } from './helpers.mjs'

// Reviewed fixtures would otherwise leak into the shared disposable DB (the
// section6 integration contract requires every APPROVED row to be rated 5).
test.afterAll(async ({ browser }) => {
  const admin = await superAdminSession(browser)
  try {
    const rows = (await json(await admin.api.get('/api/v1/testimonials?search=E2E%20Pending&limit=100'))).body?.data?.data
    expect(Array.isArray(rows)).toBe(true)
    for (const t of rows) {
      if (t.authorName.startsWith('E2E Pending') && t.status !== 'PENDING') {
        expect((await admin.api.delete(`/api/v1/testimonials/${t.id}`)).ok()).toBe(true)
      }
    }
  } finally {
    await admin.context.close()
  }
})

test('testimonial pending count uses the canonical server count, not the page', async ({ page }) => {
  const canonical = (await json(await page.request.get('/api/v1/testimonials/pending-count'))).body.data.count
  expect(canonical).toBeGreaterThan(20)

  await page.goto('/testimonials')
  await expect(page.getByTestId('testimonials-pending-count')).toHaveText(`${canonical} pending review`)
})

test('approve and reject a testimonial; public API shows only approved', async ({ page }) => {
  const before = (await json(await page.request.get('/api/v1/testimonials/pending-count'))).body.data.count
  await page.goto('/testimonials')
  const rowActions = page.getByRole('button', { name: /^Actions for / })
  // The search is debounced; opening a menu before the filtered refetch lands gets it unmounted.
  await page.getByPlaceholder('Search testimonials...').fill('E2E Pending 01')
  await expect(rowActions).toHaveCount(1)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Actions for E2E Pending 01' }).click()
  await page.getByRole('menuitem', { name: 'Approve' }).click()
  const approved = page.waitForResponse((r) => r.url().endsWith('/review') && r.request().method() === 'POST')
  await page.getByRole('dialog').getByRole('button', { name: 'Approve' }).click()
  const approveRes = await approved
  expect(approveRes.status(), await approveRes.text()).toBe(200)
  await expect(page.getByText('Testimonial approved').first()).toBeVisible()

  await page.getByPlaceholder('Search testimonials...').fill('E2E Pending 02')
  await expect(rowActions).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Actions for E2E Pending 02' })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Actions for E2E Pending 02' }).click()
  await page.getByRole('menuitem', { name: 'Reject' }).click()
  const rejected = page.waitForResponse((r) => r.url().endsWith('/review') && r.request().method() === 'POST')
  await page.getByRole('dialog').getByRole('button', { name: 'Reject' }).click()
  const rejectRes = await rejected
  expect(rejectRes.status(), await rejectRes.text()).toBe(200)
  await expect(page.getByText('Testimonial rejected').first()).toBeVisible()

  await expect(page.getByTestId('testimonials-pending-count')).toHaveText(`${before - 2} pending review`)

  const pub = await page.request.get('/api/public/testimonials?limit=100', { headers: { 'x-intake-key': 'e2e-intake-key-not-a-secret' } })
  const names = ((await pub.json()).data ?? []).map((t) => t.authorName)
  expect(names).toContain('E2E Pending 01')
  expect(names).not.toContain('E2E Pending 02')
  expect(names.some((n) => /^E2E Pending (0[3-9]|1\d|2\d)$/.test(n))).toBe(false)
})

test('resources: unsafe URLs are rejected, valid resource is created and listed', async ({ page }) => {
  const bad = await page.request.post('/api/v1/resources', { data: { title: 'E2E Bad Link', type: 'LINK', externalUrl: 'javascript:alert(1)' } })
  expect(bad.status()).toBe(400)

  const title = `E2E Link ${Date.now()}`
  const ok = await page.request.post('/api/v1/resources', { data: { title, type: 'LINK', externalUrl: 'https://partner.example.test/guide', isGated: false } })
  expect(ok.status()).toBe(201)

  await page.goto('/resources')
  await expect(page.getByText(title)).toBeVisible()
})

test('fee plan linked to a course: select, display, filter, percent rule', async ({ page }) => {
  await page.goto('/fee-plans')
  await page.getByRole('button', { name: 'New fee plan' }).click()
  const name = `E2E Plan ${Date.now()}`
  await page.getByPlaceholder('e.g. 3 Installments with down payment').fill(name)
  await page.getByTestId('fee-plan-course-select').selectOption({ label: 'E2E Fee Course · ₹60,000' })

  await page.getByPlaceholder('e.g. Tuition install 1').first().fill('Instalment 1')
  const typeSelect = page.locator('select').filter({ hasText: 'Fixed ₹' }).first()
  await typeSelect.selectOption('percent')
  await page.getByRole('button', { name: '50%' }).first().click()
  await expect(page.getByTestId('fee-plan-percent-sum')).toContainText('must be 100%')
  await page.getByRole('button', { name: 'Create plan' }).click()
  await expect(page.getByText(/Percentage items must add up to 100%/).first()).toBeVisible()

  await page.getByRole('button', { name: '100%' }).first().click()
  await expect(page.getByTestId('fee-plan-percent-sum')).toHaveText('% items sum 100%')
  await page.getByRole('button', { name: 'Create plan' }).click()
  await expect(page.getByText('Fee plan created').first()).toBeVisible()

  const card = page.locator('[data-testid^="fee-plan-card-"]').filter({ hasText: name })
  await expect(card.getByTestId('fee-plan-course')).toHaveText('E2E Fee Course')
  await expect(card).toContainText('₹60,000')

  await page.getByTestId('fee-plan-course-filter').selectOption({ label: 'E2E Fee Course' })
  await expect(card).toBeVisible()
  const cards = page.locator('[data-testid^="fee-plan-card-"]')
  for (const c of await cards.all()) await expect(c.getByTestId('fee-plan-course')).toHaveText('E2E Fee Course')
})
