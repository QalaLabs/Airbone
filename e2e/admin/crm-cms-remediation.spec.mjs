import { test, expect, json, newSession, superAdminSession, USERS } from './helpers.mjs'

// Fixtures: admin/scripts/e2e-seed.ts (E2E_LMS). The public website runs from
// e2e/scripts/start-web-live.mjs against this same E2E admin.
const WEBSITE = `http://127.0.0.1:${Number(process.env.E2E_LIVE_WEB_PORT || 4101)}`
const RUN = Date.now().toString(36)

async function certificateByNo(api, certificateNo) {
  const res = await json(await api.get('/api/v1/lms/certificates'))
  expect(res.status).toBe(200)
  const cert = res.body.data.find((c) => c.certificateNo === certificateNo)
  expect(cert, `seeded certificate ${certificateNo}`).toBeTruthy()
  return cert
}

async function attendanceCourses(api) {
  const res = await json(await api.get('/api/v1/lms/attendance/courses'))
  expect(res.status).toBe(200)
  return res.body.data
}

// The live website runs with CMS_REVALIDATE_SECONDS=3600 (start-web-live.mjs), so
// content can only change within this window through the admin's revalidation call.
const INSTANT_SYNC_MS = 15_000
const NO_SESSION = { cookies: [], origins: [] }

/** Poll a public page until `check(html)` passes (revalidation is async). */
async function expectWebsite(request, path, check, message) {
  await expect
    .poll(async () => check(await (await request.get(`${WEBSITE}${path}`, { headers: { 'cache-control': 'no-cache' } })).text()), {
      message,
      timeout: INSTANT_SYNC_MS,
      intervals: [500, 1_000, 2_000],
    })
    .toBe(true)
}

test.describe.configure({ mode: 'serial' })

const cleanup = { testimonials: [], resources: [], navMenuId: null, navOriginal: null }
test.afterAll(async ({ browser }) => {
  const admin = await superAdminSession(browser)
  try {
    for (const id of cleanup.testimonials) await admin.api.delete(`/api/v1/testimonials/${id}`)
    for (const id of cleanup.resources) await admin.api.delete(`/api/v1/resources/${id}`)
    if (cleanup.navMenuId && cleanup.navOriginal) {
      await admin.api.put(`/api/v1/nav/${cleanup.navMenuId}`, { data: { items: cleanup.navOriginal } })
    } else if (cleanup.navMenuId) {
      await admin.api.delete(`/api/v1/nav/${cleanup.navMenuId}`)
    }
  } finally {
    await admin.context.close()
  }
})

// 1 ─ Analytics date filter reaches the API and changes the report; Reset restores it.
test('analytics: date range is applied server-side and cleared', async ({ page }) => {
  const initial = page.waitForResponse((r) => /\/api\/v1\/crm\/analytics(\?|$)/.test(r.url()) && r.request().method() === 'GET')
  await page.goto('/crm/analytics')
  await initial
  const allTime = Number(await page.getByTestId('metric-total-leads').textContent())

  await page.getByLabel('Start date and time').fill('2020-01-01T00:00')
  await page.getByLabel('End date and time').fill('2020-01-01T23:59')
  const ranged = page.waitForResponse((r) => r.url().includes('/api/v1/crm/analytics?') && r.url().includes('from='))
  await page.getByRole('button', { name: 'Apply' }).click()
  const res = await ranged
  const url = new URL(res.url())
  expect(url.searchParams.get('from')).toBe('2020-01-01T00:00')
  expect(url.searchParams.get('to')).toBe('2020-01-01T23:59')
  expect(res.status()).toBe(200)
  await expect(page.getByTestId('metric-total-leads')).toHaveText('0')

  // Invalid range (start after end) is rejected in the UI and by the API.
  await page.getByLabel('Start date and time').fill('2026-02-02T00:00')
  await page.getByLabel('End date and time').fill('2026-02-01T00:00')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Start must be on or before the end.')).toBeVisible()
  expect((await page.request.get('/api/v1/crm/analytics?from=2026-02-02T00:00&to=2026-02-01T00:00')).status()).toBe(400)

  const cleared = page.waitForResponse((r) => /\/api\/v1\/crm\/analytics$/.test(r.url()))
  await page.getByRole('button', { name: 'Reset' }).click()
  await cleared
  await expect(page.getByTestId('metric-total-leads')).toHaveText(String(allTime))
})

// 2 ─ Page Performance is a separate section/endpoint and follows the same range.
test('analytics: page performance is separate and date-filtered', async ({ page }) => {
  const perf = page.waitForResponse((r) => r.url().includes('/api/v1/crm/analytics/page-performance'))
  await page.goto('/crm/analytics')
  expect((await perf).status()).toBe(200)
  const section = page.getByTestId('page-performance')
  await expect(section).toBeVisible()
  await expect(section.getByRole('heading', { name: 'Page Performance' }).or(section.getByText('Page Performance').first())).toBeVisible()

  await page.getByLabel('Start date and time').fill('2026-09-01T00:00')
  await page.getByLabel('End date and time').fill('2026-09-30T23:59')
  const sales = page.waitForResponse((r) => /\/api\/v1\/crm\/analytics\?/.test(r.url()) && r.url().includes('from=2026-09-01'))
  const ranged = page.waitForResponse((r) => r.url().includes('/page-performance?') && r.url().includes('from=2026-09-01'))
  await page.getByRole('button', { name: 'Apply' }).click()
  await sales
  expect((await ranged).status()).toBe(200)
  const row = section.getByTestId('page-perf-row').filter({ hasText: '/e2e-landing-page' })
  await expect(row).toHaveCount(1)
  await expect(row.locator('td').nth(1)).toHaveText('2')
  await expect(section.getByTestId('page-perf-utm-campaigns')).toContainText('e2e-september')

  await page.getByLabel('Start date and time').fill('2020-01-01T00:00')
  await page.getByLabel('End date and time').fill('2020-01-01T23:59')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(section.getByTestId('page-perf-empty')).toBeVisible()
  await expect(section.getByTestId('page-perf-total-leads')).toHaveText('0')
  await expect(page.getByTestId('metric-total-leads')).toHaveText('0')
})

// 2b ─ GA4 website traffic: server-side Data API (deterministic mock), same IST range, separate from leads.
test('analytics: GA4 website traffic follows the date filter and shows unavailable states', async ({ page, browser }) => {
  const applyRange = async (from, to) => {
    const traffic = page.waitForResponse((r) => r.url().includes('/api/v1/crm/analytics/traffic?') && r.url().includes(`from=${from.slice(0, 10)}`))
    await page.getByLabel('Start date and time').fill(from)
    await page.getByLabel('End date and time').fill(to)
    await page.getByRole('button', { name: 'Apply' }).click()
    const res = await traffic
    expect(res.status()).toBe(200)
    return res.json()
  }

  await page.goto('/crm/analytics')
  const ga4 = page.getByTestId('ga4-traffic')
  await expect(ga4).toBeVisible()
  await expect(page.getByTestId('lead-attribution')).toBeVisible()

  const sept = await applyRange('2026-09-01T00:00', '2026-09-30T23:59')
  expect(sept.data.dateRange).toEqual({ startDate: '2026-09-01', endDate: '2026-09-30' })
  await expect(ga4.getByTestId('ga4-total-views')).toHaveText('70')
  await expect(ga4.getByTestId('ga4-total-users')).toHaveText('26')
  await expect(ga4.getByTestId('ga4-total-sessions')).toHaveText('35')
  const landing = ga4.getByTestId('ga4-page-row').filter({ hasText: '/e2e-landing-page' })
  await expect(landing.locator('td').nth(1)).toHaveText('42')
  await expect(ga4.getByTestId('ga4-sources')).toContainText('google / organic')
  await expect(ga4.getByTestId('ga4-whole-days')).toHaveCount(0)
  // Lead-based figures stay in their own block (2 leads), never mixed with the 70 page views.
  await expect(page.getByTestId('page-performance').getByTestId('page-perf-row').filter({ hasText: '/e2e-landing-page' }).locator('td').nth(1)).toHaveText('2')

  const sameDay = await applyRange('2026-09-12T00:00', '2026-09-12T23:59')
  expect(sameDay.data.dateRange).toEqual({ startDate: '2026-09-12', endDate: '2026-09-12' })
  await expect(ga4.getByTestId('ga4-total-views')).toHaveText('20')

  // 23:30 IST on the 11th to 00:30 IST on the 12th crosses midnight: both IST days, flagged as widened.
  const midnight = await applyRange('2026-09-11T23:30', '2026-09-12T00:30')
  expect(midnight.data.dateRange).toEqual({ startDate: '2026-09-11', endDate: '2026-09-12' })
  await expect(ga4.getByTestId('ga4-whole-days')).toBeVisible()

  await applyRange('2020-01-01T00:00', '2020-01-01T23:59')
  await expect(ga4.getByTestId('ga4-empty')).toBeVisible()
  await expect(ga4.getByTestId('ga4-total-views')).toHaveText('0')

  // Mock GA4 answers 503 for this start date: a clear unavailable state, no zeros, leads unaffected.
  const outage = await applyRange('2021-03-03T00:00', '2021-03-03T23:59')
  expect(outage.data).toMatchObject({ status: 'error', reason: 'unavailable' })
  await expect(ga4.getByTestId('ga4-status')).toHaveAttribute('data-ga4-status', 'unavailable')
  await expect(ga4.getByTestId('ga4-total-views')).toHaveCount(0)
  await expect(page.getByTestId('page-perf-total-leads')).toHaveText('0')

  // Invalid / future ranges are rejected before GA4 is called.
  expect((await page.request.get('/api/v1/crm/analytics/traffic?from=2026-09-30&to=2026-09-01')).status()).toBe(400)
  expect((await page.request.get('/api/v1/crm/analytics/traffic?from=2099-01-01&to=2099-01-02')).status()).toBe(400)

  // The response never carries credentials or the property id.
  const raw = await (await page.request.get('/api/v1/crm/analytics/traffic?from=2026-09-01&to=2026-09-30')).text()
  for (const secret of ['PRIVATE KEY', 'private_key', '424242', 'e2e-ga4-reader']) expect(raw).not.toContain(secret)

  // RBAC: counselors (lead-scoped analytics) and anonymous callers are refused.
  const counselor = await newSession(browser, USERS.counselor)
  try {
    expect((await counselor.api.get('/api/v1/crm/analytics/traffic')).status()).toBe(403)
  } finally {
    await counselor.context.close()
  }
  const anon = await browser.newContext({ storageState: NO_SESSION })
  try {
    expect((await anon.request.get(`${new URL(page.url()).origin}/api/v1/crm/analytics/traffic`, { maxRedirects: 0 })).status()).toBeGreaterThanOrEqual(300)
  } finally {
    await anon.close()
  }
})

// 3 ─ Certificates: profile -> Certificates -> View -> reload; other student is refused.
test('certificates: staff views a student certificate; another student cannot', async ({ page, browser }) => {
  const cert = await certificateByNo(page.request, 'E2E-CERT-0001')
  await page.goto(`/students/${cert.student.id}`)
  const card = page.getByTestId('student-certificates')
  await expect(card).toContainText('E2E-CERT-0001')
  const [viewer] = await Promise.all([page.waitForEvent('popup'), card.getByTestId('certificate-view-link').first().click()])
  await viewer.waitForLoadState()
  expect(new URL(viewer.url()).pathname).toBe(`/certificates/${cert.id}`)
  await expect(viewer.getByTestId('certificate-document')).toContainText('Student One E2E')
  await expect(viewer.getByTestId('certificate-document')).toContainText('E2E-CERT-0001')
  await viewer.reload()
  await expect(viewer.getByTestId('certificate-document')).toContainText('E2E Assigned Class')
  await viewer.close()

  const other = await newSession(browser, USERS.student2)
  try {
    expect((await other.api.get(`/api/v1/lms/certificates/${cert.id}`)).status()).toBe(404)
    const page2 = await other.page.goto(`/certificates/${cert.id}`)
    expect(page2?.status()).toBe(404)
    await expect(other.page.getByTestId('certificate-document')).toHaveCount(0)
    const own = await certificateByNo(other.api, 'E2E-CERT-0002')
    expect((await other.api.get(`/api/v1/lms/certificates/${own.id}`)).status()).toBe(200)
  } finally {
    await other.context.close()
  }
})

// 4 ─ Testimonial: create -> publish -> website shows -> update -> unpublish -> gone.
test('testimonials: admin changes are reflected on the public website', async ({ page }) => {
  const quote = `E2E live sync testimonial ${RUN} - the DGCA ground classes were excellent.`
  const created = await json(await page.request.post('/api/v1/testimonials', {
    data: { authorName: `E2E Live ${RUN}`, content: quote, rating: 5 },
  }))
  expect(created.status).toBe(201)
  // Every mutation reports the awaited, post-commit website refresh.
  expect(created.body.data.websiteSync.status).toBe('ok')
  const id = created.body.data.id
  cleanup.testimonials.push(id)
  const featured = await json(await page.request.patch(`/api/v1/testimonials/${id}`, { data: { isFeatured: true, order: 0 } }))
  expect(featured.status).toBe(200)
  expect(featured.body.data.websiteSync.status).toBe('ok')
  const approved = await json(await page.request.post(`/api/v1/testimonials/${id}/review`, { data: { status: 'APPROVED' } }))
  expect(approved.status).toBe(200)
  expect(approved.body.data.websiteSync).toEqual({ status: 'ok', message: 'The public website was refreshed.' })

  const site = page.context().request
  await expectWebsite(site, '/api/public-proxy/testimonials?limit=6', (body) => body.includes(quote), 'published testimonial reaches the website')
  const home = await page.context().newPage()
  await home.goto(WEBSITE + '/')
  await expect(home.getByTestId('home-testimonials')).toContainText(quote, { timeout: INSTANT_SYNC_MS })

  const updatedQuote = `${quote} Updated after review.`
  const updated = await json(await page.request.patch(`/api/v1/testimonials/${id}`, { data: { content: updatedQuote } }))
  expect(updated.status).toBe(200)
  expect(updated.body.data.websiteSync.status).toBe('ok')
  await expectWebsite(site, '/api/public-proxy/testimonials?limit=6', (body) => body.includes(updatedQuote), 'update reaches the website')

  await page.goto('/testimonials')
  await page.getByPlaceholder('Search testimonials...').fill(`E2E Live ${RUN}`)
  await expect(page.getByRole('button', { name: /^Actions for / })).toHaveCount(1)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: `Actions for E2E Live ${RUN}` }).click()
  await page.getByRole('menuitem', { name: 'Unpublish' }).click()
  const unpublished = page.waitForResponse((r) => r.url().endsWith('/review') && r.request().method() === 'POST')
  await page.getByRole('dialog').getByRole('button', { name: 'Reject' }).click()
  const unpublishRes = await unpublished
  expect(unpublishRes.status()).toBe(200)
  expect((await unpublishRes.json()).data.websiteSync.status).toBe('ok')
  await expect(page.getByText('The public website was refreshed.').first()).toBeVisible()

  await expectWebsite(site, '/api/public-proxy/testimonials?limit=6', (body) => !body.includes(updatedQuote), 'unpublished testimonial leaves the website')
  await home.reload()
  await expect(home.getByText(updatedQuote)).toHaveCount(0)
  await home.close()
})

// 5 ─ CMS: publish a blog resource -> website lists + renders it -> update -> unpublish -> 404.
test('cms: blog resource publish, update and unpublish are reflected on the website', async ({ page }) => {
  const slug = `e2e-cms-post-${RUN}`
  const created = await json(await page.request.post('/api/v1/resources', {
    data: { title: `E2E CMS Post ${RUN}`, slug, type: 'DOCUMENT', category: 'blog', description: 'First paragraph of the E2E post.' },
  }))
  expect(created.status, JSON.stringify(created.body)).toBe(201)
  const id = created.body.data.id
  cleanup.resources.push(id)
  const site = page.context().request

  expect((await page.request.post(`/api/v1/resources/${id}/publish`, { data: { status: 'PUBLISHED' } })).status()).toBe(200)
  await expectWebsite(site, '/blog', (html) => html.includes(`E2E CMS Post ${RUN}`), 'published post is listed on /blog')
  await expectWebsite(site, `/blog/${slug}`, (html) => html.includes('First paragraph of the E2E post.'), 'post page renders')

  expect((await page.request.patch(`/api/v1/resources/${id}`, { data: { description: 'Edited paragraph from the admin CMS.' } })).status()).toBe(200)
  await expectWebsite(site, `/blog/${slug}`, (html) => html.includes('Edited paragraph from the admin CMS.'), 'update is reflected')

  expect((await page.request.post(`/api/v1/resources/${id}/publish`, { data: { status: 'ARCHIVED' } })).status()).toBe(200)
  await expect
    .poll(async () => (await site.get(`${WEBSITE}/blog/${slug}`)).status(), { timeout: 75_000, intervals: [1_000, 2_000, 5_000] })
    .toBe(404)
  await expectWebsite(site, '/blog', (html) => !html.includes(`E2E CMS Post ${RUN}`), 'unpublished post leaves /blog')

  // Unauthenticated / unauthorized CMS writes are refused. New contexts inherit the
  // project's superadmin storageState unless it is explicitly cleared.
  const anon = await page.context().browser().newContext({ storageState: { cookies: [], origins: [] } })
  try {
    expect((await anon.request.post('/api/v1/resources', { data: { title: 'x', type: 'DOCUMENT' }, maxRedirects: 0 })).status()).toBeGreaterThanOrEqual(300)
    expect((await anon.request.post(`${WEBSITE}/api/revalidate`, { data: { resources: ['blogs'] } })).status()).toBe(401)
  } finally {
    await anon.close()
  }
})

// 5b ─ CMS Pages: create -> publish (UI) -> public /pages/<slug> -> update -> unpublish (UI) -> 404;
//      rich text is sanitized; header nav honours target + submenus on desktop and mobile.
test('cms pages: publish, update, unpublish and header navigation reach the website', async ({ page, browser }) => {
  const slug = `e2e-cms-page-${RUN}`
  const site = page.context().request
  const publicPath = `/pages/${slug}`
  const status = async (path) => (await site.get(`${WEBSITE}${path}`)).status()

  const types = await json(await page.request.get('/api/v1/blocks?limit=100'))
  expect(types.status).toBe(200)
  const typeId = (type) => {
    const found = types.body.data.find((b) => b.type === type)
    expect(found, `block type ${type}`).toBeTruthy()
    return found.id
  }

  const created = await json(await page.request.post('/api/v1/pages', {
    data: { title: `E2E CMS Page ${RUN}`, slug, seoTitle: `E2E SEO Title ${RUN}`, seoDesc: 'E2E SEO description for the CMS page.' },
  }))
  expect(created.status, JSON.stringify(created.body)).toBe(201)
  const pageId = created.body.data.id
  const section = await json(await page.request.post(`/api/v1/pages/${pageId}/sections`, { data: { name: 'Main' } }))
  expect(section.status, JSON.stringify(section.body)).toBe(201)
  const sid = section.body.data.id
  const addBlock = async (type, props) => {
    const res = await json(await page.request.post(`/api/v1/pages/${pageId}/sections/${sid}/blocks`, { data: { blockTypeId: typeId(type), props } }))
    expect(res.status, JSON.stringify(res.body)).toBe(201)
    return res.body.data.id
  }
  const headingId = await addBlock('heading', { content: `E2E Heading ${RUN}`, level: 2 })
  await addBlock('rich_text', {
    content:
      '<p><strong>Bold CMS text</strong> and <a href="/courses">safe course link</a>.</p>' +
      '<script>window.__cmsXss = 1</script><img src="x" onerror="window.__cmsXss = 1">' +
      '<a href="javascript:window.__cmsXss = 1">unsafe cms link</a><iframe src="https://evil.example"></iframe>',
  })
  await addBlock('button', { label: 'E2E External CTA', href: 'https://example.com/apply', target: '_blank' })

  // Draft and unknown slugs are not public.
  expect(await status(publicPath)).toBe(404)
  expect(await status(`/pages/e2e-cms-page-missing-${RUN}`)).toBe(404)

  // Publish from the admin page editor.
  await page.goto(`/cms/pages/${pageId}`)
  const published = page.waitForResponse((r) => r.url().endsWith(`/api/v1/pages/${pageId}/publish`) && r.request().method() === 'POST')
  await page.getByRole('button', { name: 'Publish', exact: true }).click()
  const publishRes = await published
  expect(publishRes.status()).toBe(200)
  expect((await publishRes.json()).data.websiteSync.status).toBe('ok')
  await expect(page.getByText('The public website was refreshed.').first()).toBeVisible()

  await expect.poll(() => status(publicPath), { timeout: INSTANT_SYNC_MS, intervals: [500, 1_000, 2_000] }).toBe(200)
  const pub = await page.context().newPage()
  const dialogs = []
  pub.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss() })
  await pub.goto(WEBSITE + publicPath)
  const article = pub.getByTestId('cms-page')
  await expect(article.getByRole('heading', { name: `E2E Heading ${RUN}` })).toBeVisible()
  await expect(article.locator('strong', { hasText: 'Bold CMS text' })).toBeVisible()
  await expect(article.getByRole('link', { name: 'safe course link' })).toHaveAttribute('href', '/courses')
  await expect(article.getByText('unsafe cms link')).toBeVisible()
  await expect(article.locator('a', { hasText: 'unsafe cms link' })).toHaveCount(0)
  await expect(article.locator('script, iframe, img[onerror], [onerror]')).toHaveCount(0)
  const cta = article.getByRole('link', { name: 'E2E External CTA' })
  await expect(cta).toHaveAttribute('target', '_blank')
  await expect(cta).toHaveAttribute('rel', /noopener/)
  expect(await pub.evaluate(() => window.__cmsXss)).toBeUndefined()
  expect(dialogs).toEqual([])
  await expect(pub).toHaveTitle(new RegExp(`E2E SEO Title ${RUN}`))
  await expect(pub.locator('meta[name="description"]')).toHaveAttribute('content', 'E2E SEO description for the CMS page.')

  // Admin preview renders the same content without executing it.
  await page.goto(`/cms/pages/${pageId}/preview`)
  await expect(page.locator('strong', { hasText: 'Bold CMS text' }).first()).toBeVisible()
  expect(await page.evaluate(() => window.__cmsXss)).toBeUndefined()

  // Update a block of the live page.
  const edited = await page.request.patch(`/api/v1/pages/${pageId}/sections/${sid}/blocks/${headingId}`, { data: { props: { content: `E2E Heading Updated ${RUN}`, level: 2 } } })
  expect(edited.status()).toBe(200)
  await expectWebsite(site, publicPath, (html) => html.includes(`E2E Heading Updated ${RUN}`), 'updated page content reaches the website')

  // Header navigation from the CMS: _blank target, submenu, internal link to the page.
  const navList = await json(await page.request.get('/api/v1/nav'))
  expect(navList.status).toBe(200)
  const menus = Array.isArray(navList.body.data) ? navList.body.data : navList.body.data.items
  const header = menus.find((m) => m.location === 'header')
  const uuid = () => crypto.randomUUID()
  const items = [
    {
      id: uuid(), label: 'E2E Programs', url: '/courses', target: '_self',
      children: [
        { id: uuid(), label: 'E2E CMS Page', url: publicPath, target: '_self' },
        { id: uuid(), label: 'E2E Partner', url: 'https://example.com/partner', target: '_blank' },
      ],
    },
    { id: uuid(), label: 'E2E Jobs', url: '/jobs', target: '_blank' },
    { id: uuid(), label: 'E2E Hidden', url: '/about', target: '_self', isVisible: false },
  ]
  const unsafe = [{ id: uuid(), label: 'Bad', url: 'javascript:alert(1)', target: '_self' }]
  if (header) {
    cleanup.navMenuId = header.id
    cleanup.navOriginal = header.items
    expect((await page.request.put(`/api/v1/nav/${header.id}`, { data: { items: unsafe } })).status()).toBe(400)
    expect((await page.request.put(`/api/v1/nav/${header.id}`, { data: { items } })).status()).toBe(200)
  } else {
    expect((await page.request.post('/api/v1/nav', { data: { name: 'E2E Header', location: 'header', items: unsafe } })).status()).toBe(400)
    const made = await json(await page.request.post('/api/v1/nav', { data: { name: 'E2E Header', location: 'header', items } }))
    expect(made.status, JSON.stringify(made.body)).toBe(201)
    cleanup.navMenuId = made.body.data.id
  }
  await expectWebsite(site, '/api/public-proxy/settings', (body) => body.includes('E2E Programs'), 'header menu reaches the website')

  // The homepage has its own hero navigation; content pages use the shared Header.
  await pub.goto(WEBSITE + '/about')
  const nav = pub.getByTestId('header-nav')
  await expect(nav.getByTestId('header-nav-link').filter({ hasText: 'E2E Programs' })).toBeVisible()
  await expect(nav.getByText('E2E Hidden')).toHaveCount(0)
  const jobs = nav.getByTestId('header-nav-link').filter({ hasText: 'E2E Jobs' })
  await expect(jobs).toHaveAttribute('target', '_blank')
  await expect(jobs).toHaveAttribute('rel', 'noopener noreferrer')

  const toggle = nav.getByRole('button', { name: 'E2E Programs submenu' })
  const submenu = nav.getByTestId('header-submenu')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(submenu).toBeHidden()
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(submenu).toBeVisible()
  const partner = submenu.getByRole('link', { name: 'E2E Partner' })
  await expect(partner).toHaveAttribute('target', '_blank')
  await expect(partner).toHaveAttribute('rel', 'noopener noreferrer')
  await pub.keyboard.press('Escape')
  await pub.mouse.move(0, 400)
  await expect(submenu).toBeHidden()
  await toggle.focus()
  await pub.keyboard.press('Enter')
  await expect(submenu).toBeVisible()
  const internal = submenu.getByRole('link', { name: 'E2E CMS Page' })
  await expect(internal).not.toHaveAttribute('target', /.+/)
  await internal.click()
  await pub.waitForURL(`**${publicPath}`)
  await expect(pub.getByTestId('cms-page')).toContainText(`E2E Heading Updated ${RUN}`)

  // Mobile drawer shows the same menu with nested sublinks.
  await pub.setViewportSize({ width: 390, height: 844 })
  await pub.getByRole('button', { name: 'Open navigation menu' }).click()
  const drawer = pub.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(drawer.getByText('E2E Programs')).toBeVisible()
  await expect(drawer.getByRole('link', { name: 'E2E CMS Page' })).toBeVisible()
  await expect(drawer.getByRole('link', { name: 'E2E Partner' })).toHaveAttribute('target', '_blank')
  await pub.close()

  // Unpublish from the editor: the public page disappears (404).
  await page.goto(`/cms/pages/${pageId}`)
  const unpublished = page.waitForResponse((r) => r.url().endsWith(`/api/v1/pages/${pageId}/publish`) && r.request().method() === 'POST')
  await page.getByRole('button', { name: 'Unpublish (to Draft)' }).click()
  const unpublishRes = await unpublished
  expect(unpublishRes.status()).toBe(200)
  expect((await unpublishRes.json()).data.websiteSync.status).toBe('ok')
  await expect.poll(() => status(publicPath), { timeout: INSTANT_SYNC_MS, intervals: [500, 1_000, 2_000] }).toBe(404)

  // Anonymous callers cannot write pages or menus.
  const anon = await browser.newContext({ storageState: NO_SESSION })
  try {
    const base = new URL(page.url()).origin
    expect((await anon.request.post(`${base}/api/v1/pages`, { data: { title: 'x' }, maxRedirects: 0 })).status()).toBeGreaterThanOrEqual(300)
    expect((await anon.request.put(`${base}/api/v1/nav/${cleanup.navMenuId}`, { data: { items: [] }, maxRedirects: 0 })).status()).toBeGreaterThanOrEqual(300)
  } finally {
    await anon.close()
  }
})

// 6 ─ Teacher: assigned classes only; marking works; unrelated class refused.
test('attendance: teacher sees and marks only assigned classes', async ({ browser }) => {
  const admin = await superAdminSession(browser)
  const all = await attendanceCourses(admin.api)
  const assigned = all.find((c) => c.slug === 'e2e-att-assigned')
  const unrelated = all.find((c) => c.slug === 'e2e-att-unrelated')
  await admin.context.close()
  expect(assigned && unrelated).toBeTruthy()

  const t = await newSession(browser, USERS.teacher)
  try {
    const mine = await attendanceCourses(t.api)
    expect(mine.map((c) => c.slug)).toEqual(['e2e-att-assigned'])

    await t.page.goto('/lms/attendance')
    const select = t.page.getByLabel('Course')
    await expect(select.locator('option', { hasText: 'E2E Assigned Class' })).toHaveCount(1)
    await expect(select.locator('option', { hasText: 'E2E Unrelated Class' })).toHaveCount(0)

    const history = await json(await t.api.get(`/api/v1/lms/attendance?courseId=${assigned.id}`))
    expect(history.status).toBe(200)
    expect(history.body.data.map((s) => s.title)).toContain('E2E Navigation Class')
    expect((await t.api.get(`/api/v1/lms/attendance?courseId=${unrelated.id}`)).status()).toBe(403)

    const enrolled = await json(await t.api.get(`/api/v1/lms/enrollments?courseId=${assigned.id}`))
    expect(enrolled.status).toBe(200)
    const studentId = enrolled.body.data[0].student.id
    const marked = await t.api.post('/api/v1/lms/attendance', {
      data: { courseId: assigned.id, title: `E2E Teacher Session ${RUN}`, records: [{ studentId, status: 'PRESENT' }] },
    })
    expect(marked.status()).toBe(201)
    expect((await t.api.post('/api/v1/lms/attendance', {
      data: { courseId: unrelated.id, title: 'not mine', records: [{ studentId, status: 'PRESENT' }] },
    })).status()).toBe(403)
    expect((await t.api.get(`/api/v1/lms/enrollments?courseId=${unrelated.id}`)).status()).toBe(403)
  } finally {
    await t.context.close()
  }
})

// 7 ─ Student: own attendance only, read-only.
test('attendance: student sees only own attendance and cannot modify it', async ({ browser }) => {
  const s = await newSession(browser, USERS.student)
  try {
    await s.page.goto('/portal/attendance')
    await expect(s.page.getByText('E2E Navigation Class').first()).toBeVisible()
    await expect(s.page.getByText('E2E Unrelated Session')).toHaveCount(0)

    const mine = await json(await s.api.get('/api/v1/lms/me/attendance-breakdown'))
    expect(mine.status).toBe(200)
    const courses = await json(await s.api.get('/api/v1/lms/attendance/courses'))
    expect(courses.status).toBe(403)
    expect((await s.api.post('/api/v1/lms/attendance', { data: { courseId: '00000000-0000-0000-0000-000000000000', title: 'x', records: [] } })).status()).toBe(403)
    expect((await s.api.get('/api/v1/payments')).status()).toBe(403)
  } finally {
    await s.context.close()
  }
})

// 8 ─ Lead source change in the detail view persists and drives list/filter.
test('lead detail: source can be changed, persists and is filterable', async ({ page }) => {
  const name = `E2E Source Lead ${RUN}`
  const created = await json(await page.request.post('/api/v1/leads', {
    data: { name, phone: `97${Date.now().toString().slice(-8)}`, source: 'DIRECT' },
  }))
  expect(created.status).toBe(201)
  const id = created.body.data.id

  await page.goto(`/leads/${id}`)
  await expect(page.getByTestId('lead-source-label')).toHaveText('Direct')
  await page.getByRole('button', { name: 'Edit source' }).click()
  await page.getByLabel('Lead source').selectOption('WALK_IN')
  const saved = page.waitForResponse((r) => r.url().endsWith(`/api/v1/leads/${id}`) && r.request().method() === 'PATCH')
  await page.getByRole('button', { name: 'Save source' }).click()
  expect((await saved).status()).toBe(200)
  await expect(page.getByText('Source updated').first()).toBeVisible()

  await page.reload()
  await expect(page.getByTestId('lead-source-label')).toHaveText('Walk-in')
  const stored = await json(await page.request.get(`/api/v1/leads/${id}`))
  expect(stored.body.data.source).toBe('WALK_IN')
  expect((await page.request.patch(`/api/v1/leads/${id}`, { data: { source: 'CARRIER_PIGEON' } })).status()).toBe(400)

  const filtered = await json(await page.request.get(`/api/v1/leads?source=WALK_IN&search=${encodeURIComponent(name)}`))
  expect(filtered.body.data.map((l) => l.id)).toContain(id)
  const direct = await json(await page.request.get(`/api/v1/leads?source=DIRECT&search=${encodeURIComponent(name)}`))
  expect(direct.body.data.map((l) => l.id)).not.toContain(id)

  await page.goto('/leads')
  await page.getByPlaceholder(/search/i).first().fill(name)
  await expect(page.locator('tbody tr').filter({ hasText: name })).toContainText('Walk-in')
})

// 9 ─ Payment ledger: student + application open the canonical records.
test('payment ledger: student and application link to the right profile and dossier', async ({ page }) => {
  await page.goto('/payments')
  await page.getByPlaceholder('Receipt, ref, application, student').fill('E2E-RCPT-0001')
  const row = page.locator('tbody tr').filter({ hasText: 'E2E-RCPT-0001' })
  await expect(row).toHaveCount(1)

  const studentLink = row.getByTestId('ledger-student-link')
  await expect(studentLink).toContainText('Student One E2E')
  const ledger = await json(await page.request.get('/api/v1/payments?search=E2E-RCPT-0001'))
  const payment = ledger.body.data.find((p) => p.receiptNo === 'E2E-RCPT-0001')
  await studentLink.click()
  await page.waitForURL(`**/students/${payment.student.id}`)
  await expect(page.getByText('Student One E2E').first()).toBeVisible()

  await page.goBack()
  await page.getByPlaceholder('Receipt, ref, application, student').fill('E2E-RCPT-0001')
  const appLink = page.locator('tbody tr').filter({ hasText: 'E2E-RCPT-0001' }).getByTestId('ledger-admission-link')
  await expect(appLink).toHaveText('E2E-APP-0001')
  await appLink.click()
  await page.waitForURL((u) => u.pathname === '/admissions' && u.searchParams.get('id') === payment.admission.id)
  await expect(page.getByRole('dialog')).toContainText('E2E-APP-0001')
})
