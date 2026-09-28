import { test, expect, mockRequests, tripHoneypot } from './helpers.mjs'

async function fillCta(page) {
  const form = page.getByTestId('homepage-cta-form')
  await form.scrollIntoViewIfNeeded()
  await form.locator('#cta-name').fill('E2E Visitor')
  await form.locator('#cta-phone').fill('9876543210')
  await form.locator('#cta-email').fill('e2e.visitor@example.test')
  await form.locator('#cta-pincode').fill('110075')
  return form
}

test('homepage lead form reaches the admin intake API', async ({ page }) => {
  await page.goto('/')
  const form = await fillCta(page)
  await form.locator('button[type="submit"]').click()
  await expect(page.getByText('Application Received')).toBeVisible()

  const leads = await mockRequests('/api/public/leads')
  expect(leads).toHaveLength(1)
  expect(leads[0].body).toMatchObject({ name: 'E2E Visitor', phone: '9876543210', source: 'homepage_cta' })
  expect(leads[0].body).not.toHaveProperty('hp_ref_code')
})

test('honeypot submission looks successful but is never forwarded', async ({ page }) => {
  await page.goto('/')
  const form = await fillCta(page)
  await tripHoneypot(form)
  await form.locator('button[type="submit"]').click()
  await expect(page.getByText('Application Received')).toBeVisible()
  expect(await mockRequests('/api/public/leads')).toHaveLength(0)
})

test('honeypot field is hidden from people and assistive tech', async ({ page }) => {
  await page.goto('/')
  const hp = page.getByTestId('homepage-cta-form').locator('input[name="hp_ref_code"]')
  await expect(hp).toHaveAttribute('tabindex', '-1')
  await expect(hp).toHaveAttribute('autocomplete', 'off')
  const hidden = await hp.evaluate((el) => {
    const wrapper = el.closest('[aria-hidden="true"]')
    const r = el.getBoundingClientRect()
    return Boolean(wrapper) && (r.right < 0 || r.bottom < 0 || r.width <= 1 || r.height <= 1)
  })
  expect(hidden).toBe(true)
})
