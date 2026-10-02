import { test, expect, json, SUPERADMIN_STATE } from './helpers.mjs'

// Final CRM + website feedback: sidebar order, course-specific eligibility
// (website form → admin persistence), WhatsApp link, route map, pilot chart.
// Website runs against this admin + loopback DB (e2e/scripts/start-web-live.mjs).

const WEBSITE = `http://127.0.0.1:${Number(process.env.E2E_LIVE_WEB_PORT || 4101)}`
const NO_SESSION = { cookies: [], origins: [] }
const RUN = Date.now().toString(36)
const WA_DEFAULT = '919953777320'

test.describe.configure({ mode: 'serial' })

const cleanup = { leadIds: [] }
test.afterAll(async ({ browser }) => {
  const context = await browser.newContext({ storageState: SUPERADMIN_STATE })
  try {
    for (const id of cleanup.leadIds) await context.request.delete(`http://127.0.0.1:${Number(process.env.E2E_ADMIN_PORT || 4100)}/api/v1/leads/${id}`)
  } finally {
    await context.close()
  }
})

test('sidebar: Integrations sits directly above System & Config at the bottom on every viewport', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/leads')
    const groups = page.getByTestId('sidebar-group')
    await expect(groups.first()).toBeVisible()
    const labels = await groups.evaluateAll((els) => els.map((e) => e.dataset.group))
    expect(labels.slice(-2), `${viewport.width}px`).toEqual(['Integrations', 'System & Config'])
    expect(labels.filter((l) => l === 'Integrations')).toHaveLength(1)

    const integrations = page.locator('[data-testid="sidebar-group"][data-group="Integrations"]')
    const system = page.locator('[data-testid="sidebar-group"][data-group="System & Config"]')
    await integrations.scrollIntoViewIfNeeded()
    await expect(integrations.getByRole('link', { name: 'CRM Integrations' })).toBeVisible()
    await expect(integrations.getByTestId('whatsapp-interakt-link')).toBeVisible()
    await expect(system.getByRole('link', { name: 'Settings' })).toBeAttached()

    const a = await integrations.boundingBox()
    const b = await system.boundingBox()
    expect(a.y + a.height, 'Integrations ends before System & Config starts').toBeLessThanOrEqual(b.y + 1)
    expect(Math.abs(a.x - b.x), 'same left edge').toBeLessThan(1)
    expect(Math.abs(a.width - b.width), 'same width').toBeLessThan(1)
    const overflowX = await page.locator('aside nav').evaluate((nav) => nav.scrollWidth - nav.clientWidth)
    expect(overflowX, 'no horizontal overflow in the sidebar').toBeLessThanOrEqual(1)
  }
})

test('eligibility: questions follow the selected course, answers persist on the lead', async ({ page, browser }) => {
  const site = await browser.newContext({ storageState: NO_SESSION, viewport: { width: 1280, height: 900 } })
  const pub = await site.newPage()
  const keys = (loc) => loc.getByTestId('eligibility-question').evaluateAll((els) => els.map((e) => e.dataset.key))
  try {
    await pub.goto(`${WEBSITE}/contact`)
    const course = pub.locator('#lead-course')
    const form = pub.getByTestId('eligibility-form')

    await expect(form).toHaveAttribute('data-course', 'ground-school')
    expect(await keys(form)).toEqual(['age17', 'class12PhysicsMaths', 'eyesight'])

    await course.selectOption('Cabin Crew Training (₹54,000)')
    await expect(form).toHaveAttribute('data-course', 'cabin-crew-training')
    expect(await keys(form)).toEqual(['age18to27', 'height', 'class12'])

    await course.selectOption('GD & PI Course (₹30,000)')
    await expect(form).toHaveCount(0)

    await course.selectOption('ATPL Ground School (₹1,50,000)')
    await expect(form).toHaveAttribute('data-course', 'atpl')
    expect(await keys(form)).toEqual(['age21', 'cplTheory'])
    await form.locator('[data-key="age21"]').getByRole('radio', { name: 'Yes' }).click()
    await expect(form.locator('[data-key="age21"]').getByRole('radio', { name: 'Yes' })).toHaveAttribute('aria-checked', 'true')

    // Switching course clears answers from the previous course.
    await course.selectOption('Cabin Crew Training (₹54,000)')
    await expect(form).toHaveAttribute('data-course', 'cabin-crew-training')
    await expect(form.getByRole('radio', { checked: true })).toHaveCount(0)
    for (const key of ['age18to27', 'height', 'class12']) {
      await form.locator(`[data-key="${key}"]`).getByRole('radio', { name: 'Yes' }).click()
    }

    const name = `E2E Eligibility ${RUN}`
    const phone = `9${String(Date.now()).slice(-9)}`
    await pub.locator('#lead-name').fill(name)
    await pub.locator('#lead-phone').fill(phone)
    await pub.locator('#lead-email').fill(`elig-${RUN}@example.test`)
    await pub.locator('#lead-pincode').fill('110075')
    await pub.locator('#lead-submit-btn').click()

    const result = pub.getByTestId('eligibility-result')
    await expect(result).toHaveAttribute('data-result', 'eligible')
    await expect(result).toHaveAttribute('data-course', 'cabin-crew-training')

    const found = await json(await page.request.get(`/api/v1/leads?search=${encodeURIComponent(name)}`))
    expect(found.status).toBe(200)
    expect(found.body.data).toHaveLength(1)
    const id = found.body.data[0].id
    cleanup.leadIds.push(id)
    const lead = await json(await page.request.get(`/api/v1/leads/${id}`))
    const stored = lead.body.data.customFields.eligibility
    expect(stored).toMatchObject({ course: 'cabin-crew-training', result: 'eligible', answers: { age18to27: 'yes', height: 'yes', class12: 'yes' } })
    expect(lead.body.data.courseInterest).toBe('Cabin Crew Training (₹54,000)')

    await page.goto(`/leads/${id}`)
    await expect(page.getByTestId('lead-eligibility')).toHaveAttribute('data-result', 'eligible')
    await expect(page.getByTestId('lead-eligibility')).toContainText('Meets course criteria')
  } finally {
    await site.close()
  }

  // The public API validates answers per course.
  const anon = await browser.newContext({ storageState: NO_SESSION })
  try {
    const q = await json(await anon.request.get(`${WEBSITE}/api/public-proxy/eligibility?course=${encodeURIComponent('Private Pilot License (PPL)')}`))
    expect(q.status).toBe(200)
    expect(q.body.data.courseSlug).toBe('private-pilot-license')
    const bad = await anon.request.post(`${WEBSITE}/api/lead`, {
      data: { name: `E2E Bad ${RUN}`, phone: `8${String(Date.now()).slice(-9)}`, email: `bad-${RUN}@example.test`, pincode: '110075', course: 'Cabin Crew Training', source: 'Contact Page', eligibility: { age17: 'yes' } },
    })
    expect(bad.status(), 'pilot question rejected for cabin crew').toBe(400)
  } finally {
    await anon.close()
  }
})

test('whatsapp: every website WhatsApp button uses the configured wa.me number', async ({ browser }) => {
  const site = await browser.newContext({ storageState: NO_SESSION, viewport: { width: 1280, height: 900 } })
  await site.route('https://wa.me/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa.me stub</title>' }))
  const pub = await site.newPage()
  try {
    for (const path of ['/', '/contact', '/about', '/courses/atpl']) {
      await pub.goto(`${WEBSITE}${path}`)
      const hrefs = await pub.locator('a[href*="wa.me"], a[href*="whatsapp.com"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
      expect(hrefs.length, `${path} has WhatsApp links`).toBeGreaterThan(0)
      for (const href of hrefs) expect(href, path).toMatch(new RegExp(`^https://wa\\.me/${WA_DEFAULT}(\\?text=[^\\s]+)?$`))
    }

    await pub.goto(`${WEBSITE}/about`)
    const float = pub.getByTestId('whatsapp-float')
    await expect(float).toBeVisible()
    await expect(float).toHaveAttribute('target', '_blank')
    await expect(float).toHaveAttribute('rel', /noopener/)
    const [popup] = await Promise.all([site.waitForEvent('page'), float.click()])
    await popup.waitForLoadState()
    expect(popup.url()).toBe(`https://wa.me/${WA_DEFAULT}`)
  } finally {
    await site.close()
  }
})

const project = (lat, lon) => ({ x: ((lon + 180) / 360) * 1000, y: ((90 - lat) / 180) * 500 })

test('route map: markers at projected real coordinates, routes drawn, mobile framed', async ({ browser }) => {
  const desktop = await browser.newContext({ storageState: NO_SESSION, viewport: { width: 1440, height: 900 } })
  const pub = await desktop.newPage()
  try {
    await pub.goto(`${WEBSITE}/`)
    const map = pub.getByTestId('route-map')
    await map.scrollIntoViewIfNeeded()
    await expect(map).toBeVisible()
    await expect(map).toHaveAttribute('viewBox', '0 0 1000 500')
    await expect(pub.getByTestId('route-map-land')).toHaveAttribute('d', /^M[\d.,L]+Z/)
    await expect(pub.getByTestId('route-marker')).toHaveCount(18)
    await expect(pub.getByTestId('route-line')).toHaveCount(18)

    const hub = pub.getByTestId('route-hub')
    const h = project(Number(await hub.getAttribute('data-lat')), Number(await hub.getAttribute('data-lon')))
    expect(Number(await hub.getAttribute('cx'))).toBeCloseTo(h.x, 3)
    expect(Number(await hub.getAttribute('cy'))).toBeCloseTo(h.y, 3)

    const markers = await pub.getByTestId('route-marker').evaluateAll((els) =>
      els.map((e) => ({ iata: e.dataset.iata, lat: +e.dataset.lat, lon: +e.dataset.lon, cx: +e.getAttribute('cx'), cy: +e.getAttribute('cy') })),
    )
    for (const m of markers) {
      const p = project(m.lat, m.lon)
      expect(m.cx, `${m.iata} x`).toBeCloseTo(p.x, 3)
      expect(m.cy, `${m.iata} y`).toBeCloseTo(p.y, 3)
    }
    const at = Object.fromEntries(markers.map((m) => [m.iata, m]))
    expect(at.LHR.lat).toBeCloseTo(51.47, 1)
    expect(at.SIN.lon).toBeCloseTo(103.99, 1)
    expect(at.DXB, 'Emirates panel entry has a marker').toBeTruthy()

    // Each route line starts at the hub and ends on its airport.
    const lines = await pub.getByTestId('route-line').evaluateAll((els) => els.map((e) => ({ iata: e.dataset.iata, d: e.getAttribute('d') })))
    for (const l of lines) {
      const n = l.d.match(/-?[\d.]+/g).map(Number)
      expect(n[0]).toBeCloseTo(h.x, 0)
      expect(n[1]).toBeCloseTo(h.y, 0)
      expect(n.at(-2)).toBeCloseTo(at[l.iata].cx, 0)
      expect(n.at(-1)).toBeCloseTo(at[l.iata].cy, 0)
    }
  } finally {
    await desktop.close()
  }

  const mobile = await browser.newContext({ storageState: NO_SESSION, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const m = await mobile.newPage()
  try {
    await m.goto(`${WEBSITE}/`)
    const map = m.getByTestId('route-map')
    await map.scrollIntoViewIfNeeded()
    await expect(map).toHaveAttribute('viewBox', '455 62 380 220')
    await expect(m.getByTestId('route-marker')).toHaveCount(18)
    await expect(m.getByTestId('route-map-offframe')).toContainText('YVR')
    await expect(m.getByTestId('route-map-offframe')).toContainText('JFK')
    const box = await map.boundingBox()
    expect(box.width).toBeGreaterThan(300)
    expect(box.x + box.width).toBeLessThanOrEqual(391)
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, 'no horizontal page overflow').toBeLessThanOrEqual(1)
  } finally {
    await mobile.close()
  }
})

test('pilot supply chart: every year on both count series and the share axis', async ({ browser }) => {
  const site = await browser.newContext({ storageState: NO_SESSION, viewport: { width: 1440, height: 900 } })
  const pub = await site.newPage()
  try {
    await pub.goto(`${WEBSITE}/`)
    const chart = pub.getByTestId('pilot-supply-chart')
    await chart.scrollIntoViewIfNeeded()
    await expect(chart).toBeVisible()
    const years = Array.from({ length: 11 }, (_, i) => String(2015 + i))
    expect(await chart.locator('[data-testid="supply-axis-years"] text').allTextContents()).toEqual(years)
    await expect(chart.getByTestId('supply-point')).toHaveCount(33)

    const points = await chart.getByTestId('supply-point').evaluateAll((els) =>
      els.map((e) => ({ s: e.dataset.series, year: +e.dataset.year, v: +e.dataset.value, ind: e.dataset.indicative, cx: +e.getAttribute('cx'), cy: +e.getAttribute('cy'), title: e.querySelector('title')?.textContent })),
    )
    for (const series of ['total', 'alumni', 'share']) {
      const rows = points.filter((p) => p.s === series)
      expect(rows.map((p) => String(p.year))).toEqual(years)
      for (let i = 1; i < rows.length; i++) expect(rows[i].cx).toBeGreaterThan(rows[i - 1].cx)
    }
    const at = (s, y) => points.find((p) => p.s === s && p.year === y)
    expect(at('total', 2025).v).toBe(15000)
    expect(at('alumni', 2025).v).toBe(1500)
    expect(at('share', 2025).v).toBe(10)
    expect(at('total', 2025).ind).toBe('false')
    expect(at('total', 2019).ind).toBe('true')
    // Same year → same x across series (no shifted index).
    for (const y of [2015, 2020, 2025]) {
      expect(at('alumni', y).cx).toBe(at('total', y).cx)
      expect(at('share', y).cx).toBe(at('total', y).cx)
    }
    // 15,000 sits on the top gridline; the 10% share is on the % axis, not near the count line.
    expect(at('total', 2025).cy).toBe(50)
    expect(at('share', 2025).cy).toBe(170)
    expect(at('total', 2019).title).toContain('(indicative)')
    expect(at('alumni', 2025).title).toBe('2025 · Airborne Aviation Alumni (1,500 Pilots): 1,500')

    await expect(chart.getByTestId('supply-legend')).toContainText('Active Airline Pilots (India)')
    await expect(chart.getByTestId('supply-legend')).toContainText('Airborne Aviation Alumni')
    await expect(chart.getByTestId('supply-legend')).toContainText('Airborne Supply Share (10%)')
    expect(await chart.locator('[data-testid="supply-axis-share"] text').allTextContents()).toContain('10%')
    await expect(chart.getByTestId('supply-note')).toContainText('indicative')
  } finally {
    await site.close()
  }
})
