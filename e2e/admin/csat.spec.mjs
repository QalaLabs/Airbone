import { readFile } from 'node:fs/promises'
import { test, expect, json, newSession, USERS } from './helpers.mjs'

// CSAT feedback: WhatsApp -> Interakt button, analytics range + CSV export,
// bulk job CSV import, provider-agnostic job ingestion. Loopback test DB only.

const BASE_URL = `http://127.0.0.1:${Number(process.env.E2E_ADMIN_PORT || 4100)}`
// playwright.request.newContext inherits the project's superadmin storageState unless overridden.
const NO_SESSION = { cookies: [], origins: [] }
const istToday = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10)
const stamp = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`

test.describe('WhatsApp -> Interakt', () => {
  test('sidebar has exactly one WhatsApp button and it opens Interakt in a new tab', async ({ page }) => {
    await page.goto('/')
    const link = page.getByTestId('whatsapp-interakt-link')
    await expect(link).toHaveCount(1)
    await expect(link).toContainText('WhatsApp (Interakt)')
    await expect(link).toHaveAttribute('href', /^https:\/\/app\.interakt\.ai\//)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
    await expect(link).toHaveAttribute('rel', /noreferrer/)
    await expect(page.locator('aside a[href^="/whatsapp"]')).toHaveCount(0)
    await expect(page.getByText('WhatsApp Business')).toHaveCount(0)
    // External navigation to interakt.ai is not followed (third-party site, no
    // network dependency in E2E); href/target/rel are the verifiable contract.
  })

  test('legacy /whatsapp pages redirect to Interakt; automation backend + master switch remain', async ({ page }) => {
    for (const path of ['/whatsapp', '/whatsapp/inbox', '/whatsapp/settings']) {
      const res = await page.request.get(path, { maxRedirects: 0 })
      expect(res.status(), path).toBe(307)
      expect(res.headers()['location'], path).toMatch(/^https:\/\/app\.interakt\.ai\//)
    }
    const settings = await json(await page.request.get('/api/v1/whatsapp/settings'))
    expect(settings.status).toBe(200)
    expect(typeof settings.body.data.whatsappNotifications).toBe('boolean')
    const templates = await page.request.get('/api/v1/whatsapp/templates')
    expect(templates.status()).toBe(200)

    await page.goto('/settings')
    await page.getByRole('button', { name: 'WhatsApp Automation' }).click()
    await expect(page.getByTestId('whatsapp-automation-card')).toBeVisible()
    await expect(page.getByRole('switch', { name: 'WhatsApp notifications' })).toBeVisible()
  })
})

test.describe('Analytics date/time range + CSV export', () => {
  test('choosing a range calls the API with from/to and updates the report; Reset restores all-time', async ({ page }) => {
    const phone = `9${stamp().slice(-9)}`
    const lead = await json(await page.request.post('/api/v1/leads', { data: { name: 'E2E Analytics Lead', phone } }))
    expect(lead.status).toBe(201)

    const allTime = (await json(await page.request.get('/api/v1/crm/analytics'))).body.data
    expect(allTime.range).toBeNull()
    expect(allTime.totals.leads).toBeGreaterThan(0)

    await page.goto('/crm/analytics')
    await expect(page.getByTestId('metric-total-leads')).toHaveText(String(allTime.totals.leads))

    await page.getByLabel('Start date and time').fill('2020-01-01T00:00')
    await page.getByLabel('End date and time').fill('2020-01-02T23:59')
    const [req] = await Promise.all([
      page.waitForRequest((r) => r.url().includes('/api/v1/crm/analytics?')),
      page.getByRole('button', { name: 'Apply' }).click(),
    ])
    const url = new URL(req.url())
    expect(url.searchParams.get('from')).toBe('2020-01-01T00:00')
    expect(url.searchParams.get('to')).toBe('2020-01-02T23:59')
    await expect(page.getByTestId('metric-total-leads')).toHaveText('0')
    await expect(page.getByTestId('analytics-range-label')).toContainText('2020-01-01 00:00')
    await expect(page.getByText('New Leads (Period)')).toBeVisible()

    const today = istToday()
    await page.getByLabel('Start date and time').fill(`${today}T00:00`)
    await page.getByLabel('End date and time').fill(`${today}T23:59`)
    await page.getByRole('button', { name: 'Apply' }).click()
    const todayApi = (await json(await page.request.get(`/api/v1/crm/analytics?from=${today}T00:00&to=${today}T23:59`))).body.data
    expect(todayApi.totals.leads).toBeGreaterThan(0)
    await expect(page.getByTestId('metric-total-leads')).toHaveText(String(todayApi.totals.leads))

    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(page.getByTestId('metric-total-leads')).toHaveText(String(allTime.totals.leads))
  })

  test('invalid ranges are rejected in the UI and by the API', async ({ page }) => {
    await page.goto('/crm/analytics')
    await page.getByLabel('Start date and time').fill('2026-01-10T10:00')
    await page.getByLabel('End date and time').fill('2026-01-09T10:00')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('Start must be on or before the end.')).toBeVisible()

    for (const qs of ['from=2026-01-10&to=2026-01-09', 'from=2026-01-10', 'from=2099-01-01&to=2099-01-02', 'from=2026-02-30&to=2026-03-01', 'from=2015-01-01&to=2026-01-01']) {
      const res = await page.request.get(`/api/v1/crm/analytics?${qs}`)
      expect(res.status(), qs).toBe(400)
    }
    const same = await page.request.get('/api/v1/crm/analytics?from=2026-01-10T10:00&to=2026-01-10T10:00')
    expect(same.status()).toBe(200)
  })

  test('Export CSV downloads the server-generated report for the applied range', async ({ page }) => {
    await page.goto('/crm/analytics')
    await page.getByLabel('Start date and time').fill('2020-01-01T00:00')
    await page.getByLabel('End date and time').fill('2020-01-31T23:59')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByTestId('metric-total-leads')).toHaveText('0')

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export CSV' }).click(),
    ])
    expect(download.suggestedFilename()).toBe('airborne-analytics_2020-01-01T0000_to_2020-01-31T2359.csv')
    const text = await readFile(await download.path(), 'utf8')
    expect(text.charCodeAt(0)).toBe(0xfeff)
    const lines = text.slice(1).trimEnd().split('\r\n')
    expect(lines[0]).toBe('Section,Dimension,Metric,Value')
    expect(lines).toContain('Report,,Range From (IST),2020-01-01T00:00')
    expect(lines).toContain('Report,,Range To (IST),2020-01-31T23:59')
    expect(lines).toContain('Totals,,Total Leads,0')

    const res = await page.request.get('/api/v1/crm/analytics/export?from=2020-01-01&to=2020-01-31')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/csv')
    expect(res.headers()['content-disposition']).toContain('attachment; filename="airborne-analytics_2020-01-01_to_2020-01-31.csv"')
  })

  test('export enforces the same auth and scope as the report', async ({ browser, playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: BASE_URL, storageState: NO_SESSION })
    expect((await anon.get('/api/v1/crm/analytics/export')).status()).toBe(401)
    await anon.dispose()

    const content = await newSession(browser, USERS.content)
    expect((await content.api.get('/api/v1/crm/analytics/export')).status()).toBe(403)
    expect((await content.api.get('/api/v1/crm/analytics')).status()).toBe(403)
    await content.context.close()

    const counselor = await newSession(browser, USERS.counselor)
    const res = await counselor.api.get('/api/v1/crm/analytics/export')
    expect(res.status()).toBe(200)
    const csv = await res.text()
    expect(csv).toContain('Report,,Scope,Counselor (own records)')
    const counselorRows = csv.split('\r\n').filter((l) => l.startsWith('By Counselor,'))
    expect(counselorRows.every((l) => l.startsWith('By Counselor,E2E Counselor,'))).toBe(true)
    await counselor.context.close()
  })
})

test.describe('Jobs: bulk CSV upload', () => {
  test('preview shows validation errors, blocks import, then a valid file imports and appears in the list', async ({ page }) => {
    const id = stamp()
    await page.goto('/jobs')
    await page.getByRole('button', { name: 'Bulk Upload CSV' }).click()

    const bad = `title,location,job_type,apply_url\nE2E Bulk Good ${id},Delhi,full_time,https://example.com/a\nE2E Bulk Bad ${id},Delhi,freelance,javascript:alert(1)\n`
    await page.getByTestId('job-import-file').setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from(bad) })
    await page.getByRole('button', { name: 'Check File' }).click()
    await expect(page.getByTestId('job-import-total')).toHaveText('2')
    await expect(page.getByTestId('job-import-valid')).toHaveText('1')
    await expect(page.getByTestId('job-import-invalid')).toHaveText('1')
    await expect(page.getByTestId('job-import-errors')).toContainText('Row 3')
    await expect(page.getByRole('button', { name: /^Import \d+ Jobs$/ })).toBeDisabled()

    const commitBad = await page.request.post('/api/v1/jobs/import', { data: { csv: bad, dryRun: false } })
    expect(commitBad.status()).toBe(422)

    const good = `\uFEFFtitle,location,airline,job_type,salary_min,salary_max,tags,description\n` +
      `E2E Bulk Pilot ${id},Mumbai,"Air, India",full_time,"1,50,000",250000,pilot;a320,"Line one\nLine two"\n` +
      `E2E Bulk Crew ${id},Delhi,IndiGo,internship,,,cabin crew,\n`
    await page.getByTestId('job-import-file').setInputFiles({ name: 'good.csv', mimeType: 'text/csv', buffer: Buffer.from(good) })
    await page.getByRole('button', { name: 'Check File' }).click()
    await expect(page.getByTestId('job-import-valid')).toHaveText('2')
    await expect(page.getByTestId('job-import-invalid')).toHaveText('0')
    await page.getByRole('button', { name: 'Import 2 Jobs' }).click()
    await expect(page.getByTestId('job-import-done')).toContainText('2 draft jobs imported')
    await page.getByTestId('job-import-close').click()
    await expect(page.getByTestId('job-import-done')).toHaveCount(0)

    await page.getByPlaceholder('Search jobs...').fill(`E2E Bulk Pilot ${id}`)
    await expect(page.getByText(`E2E Bulk Pilot ${id}`)).toBeVisible()

    const list = (await json(await page.request.get(`/api/v1/jobs?search=${encodeURIComponent(`E2E Bulk Pilot ${id}`)}`))).body.data
    const job = list.data.find((j) => j.title === `E2E Bulk Pilot ${id}`)
    expect(job.status).toBe('DRAFT')
    expect(Number(job.salaryMin)).toBe(150000)
    expect(job.metadata.airline).toBe('Air, India')

    const again = (await json(await page.request.post('/api/v1/jobs/import', { data: { csv: good, dryRun: true } }))).body.data
    expect(again.validRows).toBe(0)
    expect(again.invalidRows).toBe(2)
    expect(again.errors[0].message).toContain('already exists')
  })

  test('import endpoint requires jobs write permission', async ({ browser }) => {
    const content = await newSession(browser, USERS.content)
    const res = await content.api.post('/api/v1/jobs/import', { data: { csv: 'title\nX\n', dryRun: true } })
    expect(res.status()).toBe(403)
    await content.context.close()
  })
})

test.describe('Jobs: external sources / ingestion API', () => {
  test('fixture provider sync from the UI is reported and idempotent', async ({ page }) => {
    await page.goto('/jobs')
    await page.getByRole('button', { name: 'External Sources' }).click()
    await expect(page.getByTestId('job-sources-config-required')).toHaveText('Provider configuration required for live external scraping.')
    await page.getByRole('button', { name: 'Sync now' }).click()
    const report = page.getByTestId('job-sources-report')
    await expect(report).toContainText('4 received')
    await expect(report).toContainText('1 invalid')

    const rerun = (await json(await page.request.post('/api/v1/jobs/sources/sync', { data: { providerId: 'fixture' } }))).body.data
    expect(rerun.created).toHaveLength(0)
    expect(rerun.duplicates).toHaveLength(3)

    const list = (await json(await page.request.get('/api/v1/jobs?search=Fixture&limit=50'))).body.data.data
    expect(list.filter((j) => j.metadata?.externalSource === 'fixture')).toHaveLength(3)
    expect(list.filter((j) => j.metadata?.externalSource === 'fixture').every((j) => j.status === 'DRAFT')).toBe(true)
  })

  test('sync accepts only registered provider ids (no URLs / SSRF) and requires auth', async ({ page, playwright }) => {
    for (const data of [{ providerId: 'fixture', url: 'http://169.254.169.254/latest' }, { providerId: 'http://127.0.0.1:5433' }, { providerId: 'unknown' }]) {
      const res = await page.request.post('/api/v1/jobs/sources/sync', { data })
      expect([400, 404], JSON.stringify(data)).toContain(res.status())
    }
    const anon = await playwright.request.newContext({ baseURL: BASE_URL, storageState: NO_SESSION })
    expect((await anon.post('/api/v1/jobs/sources/sync', { data: { providerId: 'fixture' } })).status()).toBe(401)
    await anon.dispose()
  })

  test('push endpoint: key required, valid jobs created as drafts, re-send is a no-op, revoked key rejected', async ({ page, playwright }) => {
    const created = await json(await page.request.post('/api/v1/jobs/feed-keys', { data: { name: `E2E feed ${stamp()}`, validity: '1' } }))
    expect(created.status).toBe(201)
    const key = created.body.data.key
    const id = stamp()
    const payload = {
      source: 'e2e-scraper',
      jobs: [
        { externalId: `e2e-${id}-1`, title: `E2E Pushed Pilot ${id}`, company: 'Push Air', location: 'Pune', employmentType: 'full-time' },
        { externalId: `e2e-${id}-2`, title: '' },
      ],
    }
    const api = await playwright.request.newContext({ baseURL: BASE_URL, storageState: NO_SESSION })
    try {
      expect((await api.post('/api/webhooks/jobs-ingest', { data: payload })).status()).toBe(401)
      expect((await api.post('/api/webhooks/jobs-ingest', { data: payload, headers: { authorization: 'Bearer wrong-key' } })).status()).toBe(401)

      const first = await api.post('/api/webhooks/jobs-ingest', { data: payload, headers: { authorization: `Bearer ${key}` } })
      expect(first.status()).toBe(200)
      const r1 = await first.json()
      expect(r1.created).toHaveLength(1)
      expect(r1.invalid).toHaveLength(1)

      const second = await (await api.post('/api/webhooks/jobs-ingest', { data: payload, headers: { 'x-api-key': key } })).json()
      expect(second.created).toHaveLength(0)
      expect(second.duplicates).toHaveLength(1)

      const malformed = await api.post('/api/webhooks/jobs-ingest', { data: { source: 'e2e-scraper', jobs: 'nope' }, headers: { authorization: `Bearer ${key}` } })
      expect(malformed.status()).toBe(400)

      expect((await page.request.delete(`/api/v1/jobs/feed-keys/${created.body.data.id}`)).status()).toBe(200)
      expect((await api.post('/api/webhooks/jobs-ingest', { data: payload, headers: { authorization: `Bearer ${key}` } })).status()).toBe(401)
    } finally {
      await api.dispose()
    }

    const list = (await json(await page.request.get(`/api/v1/jobs?search=${encodeURIComponent(`E2E Pushed Pilot ${id}`)}`))).body.data.data
    expect(list).toHaveLength(1)
    expect(list[0].status).toBe('DRAFT')
    expect(list[0].metadata).toMatchObject({ externalSource: 'e2e-scraper', externalId: `e2e-${id}-1`, airline: 'Push Air' })
  })
})
