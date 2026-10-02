import { test, expect, json } from './helpers.mjs'

// The 11 website courses are created in the disposable test DB by
// admin/scripts/lms-course-sync.mjs --apply (see e2e/scripts/start-admin.mjs).
const WEBSITE_COURSES = [
  ['ground-school', 'DGCA Complied Ground School'],
  ['commercial-pilot-license-cpl', 'DGCA Complied CPL Ground School'],
  ['atpl', 'ATPL Ground School'],
  ['cabin-crew-training', 'Cabin Crew Training'],
  ['cadet-preparation', 'Cadet Pilot Program Preparation'],
  ['a320-simulator', 'Airbus A320 Simulator FBS'],
  ['cas-compass-adapt', 'CASS / Compass / ADAPT Prep'],
  ['airline-preparation', 'Comprehensive Airline Preparation Program'],
  ['gd-pi', 'GD & PI Course'],
  ['private-pilot-license', 'Private Pilot License (PPL) Guidance'],
  ['securing-your-childs-future-in-aviation', "Securing Your Child's Future in Aviation"],
]

const FREQUENCIES = [
  ['DAILY', 'Daily'],
  ['WEEKLY', 'Weekly'],
  ['CONSECUTIVE', 'Consecutive days'],
  ['ALTERNATE', 'Alternate days'],
  ['BI_WEEKLY', 'Bi-weekly'],
  ['MONTHLY', 'Monthly'],
  ['BI_MONTHLY', 'Bi-monthly'],
]

const PREFIX = 'E2E LMS'

async function lmsCourses(request) {
  const res = await json(await request.get('/api/v1/lms/courses'))
  expect(res.status).toBe(200)
  return res.body.data
}

test.afterAll(async ({ browser }) => {
  const context = await browser.newContext({ storageState: 'test-results/admin/.auth/superadmin.json' })
  try {
    const batches = (await json(await context.request.get('/api/v1/lms/batches'))).body?.data ?? []
    for (const b of batches) {
      if (b.name.startsWith(PREFIX)) await context.request.delete(`/api/v1/lms/batches/${b.id}`)
    }
  } finally {
    await context.close()
  }
})

test('all 11 website courses exist once each as overview-only LMS courses', async ({ page }) => {
  const courses = await lmsCourses(page.request)
  for (const [slug, title] of WEBSITE_COURSES) {
    const matches = courses.filter((c) => c.slug === slug)
    expect(matches, slug).toHaveLength(1)
    expect(matches[0].title).toBe(title)
    expect(matches[0].metadata.overviewOnly).toBe(true)
    expect(matches[0]._count.stages).toBe(0)
  }

  await page.goto('/lms')
  const cards = page.getByTestId('lms-course-overview')
  for (const [, title] of WEBSITE_COURSES) {
    const card = cards.filter({ has: page.getByTestId('lms-overview-title').getByText(title, { exact: true }) })
    await expect(card, title).toHaveCount(1)
    await expect(card.getByText('Overview', { exact: true })).toBeVisible()
    await expect(card.getByTestId('lms-overview-facts')).toContainText('Duration:')
    await expect(card.getByTestId('lms-overview-facts')).toContainText('Mode:')
    await expect(card.getByTestId('lms-overview-facts')).toContainText('Fee:')
    await expect(card.getByTestId('lms-overview-note')).toContainText('no LMS curriculum')
  }
  const gdpi = cards.filter({ has: page.getByText('GD & PI Course', { exact: true }) })
  await expect(gdpi.getByTestId('lms-overview-facts')).toContainText('Fee:₹30,000')
  await expect(gdpi.getByTestId('lms-overview-website')).toHaveAttribute('href', 'https://www.airborneaviation.in/courses/gd-pi')
  await expect(cards.locator('a[href^="/lms/courses/"]')).toHaveCount(0)
})

test('opening an overview-only course never shows the curriculum builder', async ({ page }) => {
  const course = (await lmsCourses(page.request)).find((c) => c.slug === 'atpl')
  await page.goto(`/lms/courses/${course.id}`)
  await expect(page.getByTestId('lms-course-overview-detail')).toBeVisible()
  await expect(page.getByTestId('lms-overview-note')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add stage' })).toHaveCount(0)
  await expect(page.getByText(/\d+ stages · \d+ topics/)).toHaveCount(0)
})

test('create batch in the UI: frequency, time and date fields with validation, then the card summary', async ({ page }) => {
  await page.goto('/lms/batches')
  await page.getByRole('button', { name: 'New batch' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('select').first().selectOption({ label: 'DGCA Complied CPL Ground School' })
  const name = `${PREFIX} CPL Morning ${Date.now()}`
  await dialog.getByPlaceholder('Batch name').fill(name)

  const options = await dialog.locator('#batch-frequency option').evaluateAll((els) => els.map((e) => [e.value, e.textContent]))
  expect(options.slice(1)).toEqual(FREQUENCIES)
  await dialog.locator('#batch-frequency').selectOption('DAILY')

  const create = dialog.getByRole('button', { name: 'Create' })
  const error = dialog.getByTestId('batch-schedule-error')

  await dialog.locator('#batch-start-time').fill('11:30')
  await expect(error).toHaveText('Set both a start time and an end time.')
  await dialog.locator('#batch-end-time').fill('09:00')
  await expect(error).toContainText('End time must be after start time')
  await expect(create).toBeDisabled()
  await dialog.locator('#batch-end-time').fill('11:30')
  await expect(error).toContainText('End time must be after start time')
  await dialog.locator('#batch-start-time').fill('09:00')
  await expect(error).toHaveCount(0)

  await dialog.locator('#batch-start-date').fill('2027-01-31')
  await dialog.locator('#batch-end-date').fill('2026-11-01')
  await expect(error).toHaveText('End date must be on or after start date.')
  await expect(create).toBeDisabled()
  await dialog.locator('#batch-start-date').fill('2026-11-01')
  await dialog.locator('#batch-end-date').fill('2027-01-31')
  await expect(error).toHaveCount(0)

  const posted = page.waitForResponse((r) => r.url().endsWith('/api/v1/lms/batches') && r.request().method() === 'POST')
  await create.click()
  const res = await posted
  expect(res.status(), await res.text()).toBe(201)
  const body = await res.json()
  expect(body.data.metadata.schedule).toEqual({ frequency: 'DAILY', startTime: '09:00', endTime: '11:30' })
  expect(body.data.startDate).toBe('2026-11-01T00:00:00.000Z')
  expect(body.data.endDate).toBe('2027-01-31T00:00:00.000Z')

  const card = page.getByRole('button').filter({ hasText: name })
  await expect(card.getByTestId('batch-schedule')).toHaveText('Daily · 9:00 AM – 11:30 AM · 1 Nov 2026 → 31 Jan 2027')

  await page.reload()
  await expect(page.getByRole('button').filter({ hasText: name }).getByTestId('batch-schedule')).toHaveText(
    'Daily · 9:00 AM – 11:30 AM · 1 Nov 2026 → 31 Jan 2027',
  )
})

test('every frequency persists verbatim and renders on its batch card', async ({ page }) => {
  const course = (await lmsCourses(page.request)).find((c) => c.slug === 'cabin-crew-training')
  const stamp = Date.now()
  for (const [value] of FREQUENCIES) {
    const res = await page.request.post('/api/v1/lms/batches', {
      data: {
        courseId: course.id,
        name: `${PREFIX} ${value} ${stamp}`,
        startDate: '2026-11-01T00:00:00.000Z',
        schedule: { frequency: value, startTime: '18:00', endTime: '20:00' },
      },
    })
    expect(res.status(), await res.text()).toBe(201)
    expect((await res.json()).data.metadata.schedule.frequency).toBe(value)
  }
  await page.goto('/lms/batches')
  for (const [value, label] of FREQUENCIES) {
    const card = page.getByRole('button').filter({ hasText: `${PREFIX} ${value} ${stamp}` })
    await expect(card.getByTestId('batch-schedule')).toHaveText(`${label} · 6:00 PM – 8:00 PM · from 1 Nov 2026`)
  }
})

test('the API rejects invalid schedules even without the UI', async ({ page }) => {
  const course = (await lmsCourses(page.request)).find((c) => c.slug === 'gd-pi')
  const post = (extra) => page.request.post('/api/v1/lms/batches', { data: { courseId: course.id, name: `${PREFIX} invalid`, ...extra } })
  expect((await post({ schedule: { startTime: '11:00', endTime: '10:00' } })).status()).toBe(400)
  expect((await post({ schedule: { startTime: '10:00', endTime: '10:00' } })).status()).toBe(400)
  expect((await post({ schedule: { startTime: '09:00' } })).status()).toBe(400)
  expect((await post({ schedule: { frequency: 'HOURLY' } })).status()).toBe(400)
  expect((await post({ startDate: '2027-01-31T00:00:00.000Z', endDate: '2026-11-01T00:00:00.000Z' })).status()).toBe(400)
  expect((await post({ endDate: '2026-11-01T00:00:00.000Z' })).status()).toBe(400)
})

test('a legacy batch without schedule metadata still renders', async ({ page }) => {
  const course = (await lmsCourses(page.request)).find((c) => c.slug === 'atpl')
  const name = `${PREFIX} legacy ${Date.now()}`
  const res = await page.request.post('/api/v1/lms/batches', { data: { courseId: course.id, name } })
  expect(res.status()).toBe(201)
  await page.goto('/lms/batches')
  const card = page.getByRole('button').filter({ hasText: name })
  await expect(card).toBeVisible()
  await expect(card.getByTestId('batch-schedule')).toHaveCount(0)
})
