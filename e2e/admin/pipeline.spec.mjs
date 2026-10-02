import { test, expect, json } from './helpers.mjs'

test.describe.configure({ mode: 'serial' })

const state = {}
const phone = `9${String(Date.now()).slice(-9)}`

test('Lead → Prospect opens exactly one deal', async ({ page }) => {
  const created = await json(await page.request.post('/api/v1/leads', { data: { name: 'E2E Pipeline Lead', phone, email: 'pipeline@example.test' } }))
  expect(created.status).toBe(201)
  state.leadId = created.body.data.id

  const toProspect = await json(await page.request.patch(`/api/v1/leads/${state.leadId}`, { data: { status: 'PROSPECT' } }))
  expect(toProspect.status).toBe(200)
  expect(toProspect.body.data.status).toBe('PROSPECT')

  // Re-applying PROSPECT must not open a second deal.
  await page.request.patch(`/api/v1/leads/${state.leadId}`, { data: { status: 'PROSPECT' } })
  const deals = (await json(await page.request.get(`/api/v1/deals?search=${encodeURIComponent('E2E Pipeline Lead')}&limit=100`))).body.data
  const mine = deals.filter((d) => d.leadId === state.leadId)
  expect(mine).toHaveLength(1)
  state.dealId = mine[0].id
})

test('Prospect → Deal shows on the deals board', async ({ page }) => {
  await page.goto('/crm/lead-pipeline')
  await expect(page.getByRole('heading', { name: 'Lead Pipeline', level: 1 })).toBeVisible()
  await expect(page).toHaveTitle(/Lead Pipeline/)
  await expect(page.getByText('E2E Pipeline Lead').first()).toBeVisible()
})

test('C1: old Deals URLs redirect to the Lead Pipeline and no UI says "Deals"', async ({ page }) => {
  for (const old of ['/crm/deals', '/crm/pipeline']) {
    await page.goto(old)
    await expect(page).toHaveURL(/\/crm\/lead-pipeline$/)
  }
  const nav = page.getByRole('link', { name: 'Lead Pipeline' }).first()
  await expect(nav).toHaveAttribute('href', '/crm/lead-pipeline')
  await expect(page.getByRole('link', { name: /^Deals$/ })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: /^Deals$/ })).toHaveCount(0)

  await page.goto('/crm/dashboard')
  await expect(page.getByText('Lead Pipeline Stages')).toBeVisible()
  await expect(page.getByText(/\bDeals\b/)).toHaveCount(0)
})

test('WON → admission dossier is created once', async ({ page }) => {
  const conv = await json(await page.request.post(`/api/v1/deals/${state.dealId}/convert-to-admission`, { data: { feeAmount: 60000, courseName: 'E2E Fee Course' } }))
  expect(conv.status).toBe(200)
  const admissionId = conv.body.data.admission?.id ?? conv.body.data.admissionId
  expect(admissionId).toBeTruthy()
  state.admissionId = admissionId

  const again = await json(await page.request.post(`/api/v1/deals/${state.dealId}/convert-to-admission`, { data: { feeAmount: 60000, courseName: 'E2E Fee Course' } }))
  expect(again.status).toBe(200)
  expect(again.body.data.admission?.id ?? again.body.data.admissionId).toBe(admissionId)

  const deal = (await json(await page.request.get(`/api/v1/deals/${state.dealId}`))).body.data
  expect(deal.admissionId).toBe(admissionId)
  const lead = (await json(await page.request.get(`/api/v1/leads/${state.leadId}`))).body.data
  expect(['WON', 'CONVERTED']).toContain(lead.status)
})

test('admission dossier opens with the payments panel', async ({ page }) => {
  await page.goto(`/admissions?id=${state.admissionId}`)
  await expect(page.getByText('Payments & Fee Breakdown')).toBeVisible()
  await expect(page.getByTestId('payment-form')).toBeVisible()
})

test('payment double submit and network retry record one payment', async ({ page }) => {
  await page.goto(`/admissions?id=${state.admissionId}`)
  const form = page.getByTestId('payment-form')
  await form.getByTestId('payment-amount').fill('5000')

  // Two submits in the same tick (double click / Enter spam).
  await form.evaluate((f) => { f.requestSubmit(); f.requestSubmit() })
  await expect(page.getByText('Payment recorded').first()).toBeVisible()
  let payments = (await json(await page.request.get(`/api/v1/admissions/${state.admissionId}/payments?limit=100`))).body.data
  expect(payments).toHaveLength(1)
  const firstReceipt = payments[0].receiptNo

  // Response lost after the server committed: the retry must replay, not duplicate.
  await form.getByTestId('payment-amount').fill('7000')
  let dropped = false
  await page.route(`**/api/v1/admissions/${state.admissionId}/payments`, async (route) => {
    if (route.request().method() === 'POST' && !dropped) {
      dropped = true
      await route.fetch()
      return route.fulfill({ status: 503, json: { success: false, error: { code: 'UNAVAILABLE', message: 'Gateway timeout' } } })
    }
    return route.continue()
  })
  await form.getByRole('button', { name: 'Record payment' }).click()
  await expect(page.getByText('Payment failed').first()).toBeVisible()
  await form.getByRole('button', { name: 'Record payment' }).click()
  await expect(page.getByText('Payment recorded').first()).toBeVisible()

  payments = (await json(await page.request.get(`/api/v1/admissions/${state.admissionId}/payments?limit=100`))).body.data
  expect(payments).toHaveLength(2)
  const receipts = payments.map((p) => p.receiptNo)
  expect(new Set(receipts).size).toBe(2)
  expect(receipts).toContain(firstReceipt)

  const summary = (await json(await page.request.get(`/api/v1/admissions/${state.admissionId}/payments?summary=true`))).body.data
  expect(Number(summary.feePaid)).toBe(12000)
  expect(Number(summary.feeBalance)).toBe(48000)
})

test('Deal revert → Prospect keeps the admission and restores the lead', async ({ page }) => {
  const reverted = await json(await page.request.post(`/api/v1/deals/${state.dealId}/revert-to-prospect`, { data: { notes: 'E2E revert' } }))
  expect(reverted.status).toBe(200)
  expect(reverted.body.data.stage).toBe('ENQUIRY')
  expect(reverted.body.data.admissionId).toBeNull()

  const lead = (await json(await page.request.get(`/api/v1/leads/${state.leadId}`))).body.data
  expect(lead.status).toBe('PROSPECT')
  expect((await page.request.get(`/api/v1/admissions/${state.admissionId}`)).status()).toBe(200)
})
