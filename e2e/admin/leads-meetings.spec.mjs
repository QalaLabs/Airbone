import { readFile } from 'node:fs/promises'
import { test, expect, json, newSession, USERS } from './helpers.mjs'

// Lead Management + Meetings feedback: walk-in source (A1), CSV export (A2),
// initial status (A3), meeting mode (B1), created-date filter (C1) and the
// Agent Calling week view (C2). Synthetic data on the loopback test DB only.

test.describe.configure({ mode: 'serial' })

const RUN = Date.now().toString(36)
const TAG = `lm${RUN}`
const IST_MS = 330 * 60_000
const istDate = (offsetDays = 0) => new Date(Date.now() + IST_MS + offsetDays * 86_400_000).toISOString().slice(0, 10)
let phoneSeq = Number(String(Date.now()).slice(-6))
const nextPhone = () => `97${String(phoneSeq++).padStart(8, '0')}`
const state = {}

async function findLead(request, search) {
  const { body } = await json(await request.get(`/api/v1/leads?search=${encodeURIComponent(search)}&limit=10`))
  return body.data
}

async function openAddLead(page) {
  await page.goto('/leads')
  await expect(page.getByRole('heading', { name: 'All Leads' })).toBeVisible()
  await page.getByRole('button', { name: 'Add New Lead' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

async function fillLead(page, { name, email, phone }) {
  await page.locator('#name').fill(name)
  await page.locator('#email').fill(email)
  await page.locator('#phone').fill(phone)
}

// ─── A1: walk-in ─────────────────────────────────────────────────────

test('A1: walk-in lead is created from Add Lead, listed with its source and filterable', async ({ page }) => {
  const phone = nextPhone()
  await openAddLead(page)
  await expect(page.locator('#source option[value="WALK_IN"]')).toHaveText('Walk-in')
  await fillLead(page, { name: `Walkin ${TAG}`, email: `walkin-${TAG}@example.test`, phone })
  await page.locator('#source').selectOption('WALK_IN')
  await page.getByRole('button', { name: 'Save & Route Lead' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()

  await page.getByPlaceholder('Search leads by name, email, phone...').fill(`Walkin ${TAG}`)
  const row = page.getByRole('row').filter({ hasText: `Walkin ${TAG}` })
  await expect(row).toHaveCount(1)
  await expect(row).toContainText('Walk-in')

  const [lead] = await findLead(page.request, phone)
  expect(lead.source).toBe('WALK_IN')
  expect(lead.status).toBe('NEW')
  state.walkInId = lead.id

  const filtered = (await json(await page.request.get(`/api/v1/leads?source=WALK_IN&search=${TAG}&limit=10`))).body.data
  expect(filtered.map((l) => l.id)).toEqual([lead.id])

  // Editing other fields keeps the walk-in source.
  const patched = await page.request.patch(`/api/v1/leads/${lead.id}`, { data: { city: 'Delhi' } })
  expect(patched.status()).toBe(200)
  expect((await json(await page.request.get(`/api/v1/leads/${lead.id}`))).body.data.source).toBe('WALK_IN')

  const bad = await page.request.post('/api/v1/leads', { data: { name: 'Bad Source', phone: nextPhone(), source: 'WALKING' } })
  expect(bad.status()).toBe(400)
})

// ─── A3: initial status ──────────────────────────────────────────────

test('A3: Add Lead offers only valid initial statuses and records the status change', async ({ page }) => {
  const phone = nextPhone()
  await openAddLead(page)
  const options = await page.locator('#status option').evaluateAll((els) => els.map((e) => e.value))
  expect(options).toContain('NEW')
  expect(options).toContain('CALL_BACK')
  for (const restricted of ['WON', 'CONVERTED', 'PROSPECT', 'LOST', 'NOT_INTERESTED']) expect(options).not.toContain(restricted)

  await fillLead(page, { name: `Callback ${TAG}`, email: `callback-${TAG}@example.test`, phone })
  await page.locator('#source').selectOption('REFERRAL')
  await page.locator('#status').selectOption('CALL_BACK')
  await page.getByRole('button', { name: 'Save & Route Lead' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()

  await page.getByPlaceholder('Search leads by name, email, phone...').fill(`Callback ${TAG}`)
  await expect(page.getByRole('row').filter({ hasText: `Callback ${TAG}` })).toContainText(/call back/i)

  const [lead] = await findLead(page.request, phone)
  expect(lead.status).toBe('CALL_BACK')
  state.callbackId = lead.id
  const activities = (await json(await page.request.get(`/api/v1/leads/${lead.id}/activities`))).body.data
  const list = Array.isArray(activities) ? activities : activities.activities ?? activities.items ?? []
  expect(list.some((a) => a.activityType === 'STATUS_CHANGE')).toBe(true)

  for (const status of ['WON', 'CONVERTED', 'PROSPECT']) {
    const res = await page.request.post('/api/v1/leads', { data: { name: `Restricted ${status}`, phone: nextPhone(), status } })
    expect(res.status(), status).toBe(400)
  }
})

// ─── A2: CSV export ──────────────────────────────────────────────────

test('A2: Export CSV downloads every lead matching the active filters', async ({ page }) => {
  const formula = await page.request.post('/api/v1/leads', {
    data: { name: `=HYPERLINK("x") ${TAG}`, phone: nextPhone(), source: 'DIRECT' },
  })
  expect(formula.status()).toBe(201)

  await page.goto('/leads')
  await page.getByPlaceholder('Search leads by name, email, phone...').fill(TAG)
  // Wait for the debounced search to reach the table: export uses the same applied filters.
  await expect(page.locator('tbody tr')).toHaveCount(3)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export CSV' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^leads-\d{4}-\d{2}-\d{2}\.csv$/)
  const csv = await readFile(await download.path(), 'utf8')
  expect(csv.charCodeAt(0)).toBe(0xfeff)
  const lines = csv.trim().split(/\r\n/)
  expect(lines[0]).toContain('Lead ID,Name,Email,Phone')
  expect(lines).toHaveLength(4) // header + walk-in + callback + formula lead
  expect(csv).toContain(`Walkin ${TAG}`)
  expect(csv).toContain('Walk-in')
  expect(csv).toContain(`"'=HYPERLINK(""x"") ${TAG}"`)
  await expect(page.getByText('Export ready').first()).toBeVisible()

  const statusOnly = await page.request.get(`/api/v1/leads/export?search=${TAG}&status=CALL_BACK`)
  expect(statusOnly.status()).toBe(200)
  expect(statusOnly.headers()['content-type']).toContain('text/csv')
  const statusCsv = await statusOnly.text()
  expect(statusCsv.trim().split(/\r\n/)).toHaveLength(2)
  expect(statusCsv).toContain(`Callback ${TAG}`)

  const empty = await page.request.get('/api/v1/leads/export?search=no-such-lead-zzzz')
  expect(empty.status()).toBe(200)
  expect((await empty.text()).trim().split(/\r\n/)).toHaveLength(1)
})

// ─── C1: date filter ─────────────────────────────────────────────────

test('C1: created-date filter applies, validates and clears', async ({ page }) => {
  await page.goto('/leads')
  await page.getByPlaceholder('Search leads by name, email, phone...').fill(TAG)
  const rows = page.getByRole('row').filter({ hasText: TAG })
  await expect(page.locator('tbody tr')).toHaveCount(3)
  await expect(rows).toHaveCount(3)

  await page.locator('#lead-date-from').fill(istDate())
  await page.locator('#lead-date-to').fill(istDate())
  await page.getByRole('button', { name: 'Apply dates' }).click()
  await expect(page.getByTestId('active-date-range')).toContainText(istDate())
  await expect(rows).toHaveCount(3)

  await page.locator('#lead-date-from').fill('2020-01-01')
  await page.locator('#lead-date-to').fill('2020-01-31')
  await page.getByRole('button', { name: 'Apply dates' }).click()
  await expect(page.getByText('No leads found in CRM queue')).toBeVisible()
  await expect(rows).toHaveCount(0)

  await page.locator('#lead-date-from').fill(istDate())
  await page.locator('#lead-date-to').fill(istDate(-1))
  await page.getByRole('button', { name: 'Apply dates' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Start date must be on or before the end date' })).toBeVisible()

  await page.getByRole('button', { name: 'Clear dates' }).click()
  await expect(rows).toHaveCount(3)

  const invalid = await page.request.get(`/api/v1/leads?dateFrom=${istDate()}&dateTo=${istDate(-1)}`)
  expect(invalid.status()).toBe(400)
  const yesterday = (await json(await page.request.get(`/api/v1/leads?search=${TAG}&dateFrom=${istDate(-1)}&dateTo=${istDate(-1)}`))).body
  expect(yesterday.data).toHaveLength(0)
})

// ─── B1: meeting mode ────────────────────────────────────────────────

for (const [mode, label] of [['ONLINE', 'Online'], ['OFFLINE', 'Offline'], ['CAMPUS_VISIT', 'Campus Visit']]) {
  test(`B1: schedule a ${label} meeting and see its mode`, async ({ page }) => {
    const title = `${label} meet ${TAG}`
    await page.goto('/crm/meetings')
    await page.getByRole('button', { name: 'Schedule Meeting' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox').click()
    await page.getByRole('option', { name: new RegExp(`Walkin ${TAG}`) }).click()
    await dialog.getByPlaceholder('Optional').fill(title)
    await dialog.getByLabel('Meeting time').fill(`${istDate(2)}T11:30`)
    await dialog.getByRole('radio', { name: label, exact: true }).click()
    await expect(dialog.getByRole('radio', { name: label, exact: true })).toHaveAttribute('aria-checked', 'true')
    await dialog.getByRole('button', { name: 'Schedule', exact: true }).click()
    await expect(dialog).toBeHidden()

    const card = page.getByTestId('upcoming-meeting').filter({ hasText: title })
    await expect(card).toHaveCount(1)
    await expect(card.getByTestId('meeting-mode')).toHaveText(label)

    const meetings = (await json(await page.request.get(`/api/v1/crm/meetings?scope=upcoming&q=${encodeURIComponent(TAG)}`))).body.data.meetings
    const saved = meetings.find((m) => m.title === title)
    expect(saved.metadata.mode).toBe(mode)
    // 11:30 IST on the chosen day, independent of the browser timezone.
    expect(saved.dueAt).toBe(new Date(`${istDate(2)}T06:00:00.000Z`).toISOString())
  })
}

test('B1: unsupported meeting mode is rejected', async ({ page }) => {
  const dueAt = new Date(Date.now() + 86_400_000).toISOString()
  for (const body of [{ mode: 'PHONE' }, { metadata: { mode: 'PHONE' } }]) {
    const res = await page.request.post('/api/v1/crm/meetings', { data: { leadId: state.walkInId, dueAt, ...body } })
    expect(res.status()).toBe(400)
  }
})

// ─── C2: Agent Calling week view ─────────────────────────────────────

test('C2: Agent Calling shows this week, navigates weeks and lists new leads and follow-ups', async ({ page }) => {
  const followUp = new Date(Date.now() + 60_000).toISOString()
  expect((await page.request.patch(`/api/v1/leads/${state.callbackId}`, { data: { nextFollowUp: followUp } })).status()).toBe(200)

  await page.goto('/crm/agent-calling')
  await expect(page.getByRole('heading', { name: 'Agent Calling' })).toBeVisible()
  const label = page.getByTestId('agent-calling-week-label')
  const current = await json(await page.request.get('/api/v1/leads/agent-calling'))
  expect(current.status).toBe(200)
  await expect(label).toHaveText(current.body.data.week.label)

  await expect(page.getByTestId('agent-calling-new').getByRole('row').filter({ hasText: `Walkin ${TAG}` })).toHaveCount(1)
  await expect(page.getByTestId('agent-calling-followups').getByRole('row').filter({ hasText: `Callback ${TAG}` })).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'This week' })).toBeDisabled()

  await page.getByRole('button', { name: 'Next week' }).click()
  await expect(label).not.toHaveText(current.body.data.week.label)
  await expect(page.getByText('Upcoming week')).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: `Walkin ${TAG}` })).toHaveCount(0)

  await page.getByRole('button', { name: 'Previous week' }).click()
  await page.getByRole('button', { name: 'Previous week' }).click()
  await expect(page.getByText('Past week')).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: `Walkin ${TAG}` })).toHaveCount(0)

  await page.getByRole('button', { name: 'This week' }).click()
  await expect(label).toHaveText(current.body.data.week.label)

  // Newest first inside the week.
  const created = current.body.data.newLeads.map((l) => new Date(l.createdAt).getTime())
  expect([...created].sort((a, b) => b - a)).toEqual(created)
  expect((await page.request.get('/api/v1/leads/agent-calling?week=not-a-date')).status()).toBe(400)

  await page.goto('/leads')
  await expect(page.locator('aside nav').getByRole('link', { name: 'All Leads' })).toBeVisible()
  await expect(page.locator('aside nav').getByRole('link', { name: 'Agent Calling' })).toBeVisible()
})

// ─── RBAC: counselor ─────────────────────────────────────────────────

test('RBAC: counselor cannot export and only sees own leads in Agent Calling', async ({ browser }) => {
  const s = await newSession(browser, USERS.counselor)
  try {
    const ringing = await s.api.post('/api/v1/leads', { data: { name: `Counselor ringing ${TAG}`, phone: nextPhone(), status: 'RINGING' } })
    expect(ringing.status()).toBe(201)
    expect((await json(ringing)).body.data.status).toBe('RINGING')

    const mine = await s.api.post('/api/v1/leads', { data: { name: `Counselor own ${TAG}`, phone: nextPhone(), source: 'WALK_IN' } })
    expect(mine.status()).toBe(201)
    const me = (await json(mine)).body.data
    expect(me.status).toBe('NEW')

    expect((await s.api.get('/api/v1/leads/export')).status()).toBe(403)

    // Asking for someone else's leads is ignored: scope is forced server-side.
    const week = (await json(await s.api.get('/api/v1/leads/agent-calling?assignedTo=00000000-0000-4000-8000-000000000000'))).body.data
    expect(week.newLeads.length).toBeGreaterThan(0)
    expect(week.newLeads.every((l) => l.counselor?.id === me.assignedTo)).toBe(true)
    expect(week.newLeads.some((l) => l.id === state.walkInId)).toBe(false)

    await s.page.goto('/leads')
    await expect(s.page.getByRole('heading', { name: 'All Leads' })).toBeVisible()
    await expect(s.page.getByRole('button', { name: 'Export CSV' })).toHaveCount(0)

    await s.page.goto('/crm/agent-calling')
    await expect(s.page.getByTestId('agent-calling-new').getByRole('row').filter({ hasText: `Counselor own ${TAG}` })).toHaveCount(1)
    await expect(s.page.getByRole('row').filter({ hasText: `Walkin ${TAG}` })).toHaveCount(0)
  } finally {
    await s.context.close()
  }
})
