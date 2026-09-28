import { test, expect } from './helpers.mjs'

// Record navigation side effects instead of letting the browser leave the site.
async function recordNavigations(page) {
  await page.addInitScript(() => {
    window.__opened = []
    window.__downloads = []
    window.open = (url, target, features) => {
      window.__opened.push({ url: String(url), target, features })
      return null
    }
    const click = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function () {
      if (this.hasAttribute('download')) {
        window.__downloads.push({ href: this.href, download: this.download })
        return
      }
      return click.call(this)
    }
  })
}

test('resources load from the admin API', async ({ page }) => {
  await page.goto('/resources')
  await expect(page.getByText('E2E Gated Brochure')).toBeVisible()
  await expect(page.getByText('E2E Open PDF')).toBeVisible()
  await expect(page.getByText('E2E External Article')).toBeVisible()
  await expect(page.getByTestId('resources-error')).toHaveCount(0)
})

test('non-gated external resource opens its URL in a new tab safely', async ({ page }) => {
  await recordNavigations(page)
  await page.goto('/resources')
  const btn = page.getByTestId('resource-action-res-external')
  await expect(btn).toContainText('Open Resource')
  await btn.click()
  const opened = await page.evaluate(() => window.__opened)
  expect(opened).toEqual([{ url: 'https://partner.example.test/article', target: '_blank', features: 'noopener,noreferrer' }])
  await expect(page.getByTestId('resource-download-error')).toHaveCount(0)
})

test('non-gated file resource keeps the download path', async ({ page }) => {
  await recordNavigations(page)
  await page.goto('/resources')
  await page.getByTestId('resource-action-res-file').click()
  const downloads = await page.evaluate(() => window.__downloads)
  expect(downloads).toEqual([{ href: 'https://files.example.test/open-guide.pdf', download: 'open-guide.pdf' }])
  expect(await page.evaluate(() => window.__opened)).toEqual([])
})

test('javascript: URL is never opened or downloaded', async ({ page }) => {
  await recordNavigations(page)
  await page.goto('/resources')
  await page.getByTestId('resource-action-res-malicious').click()
  expect(await page.evaluate(() => window.__opened)).toEqual([])
  expect(await page.evaluate(() => window.__downloads)).toEqual([])
  await expect(page.getByTestId('resource-download-error')).toBeVisible()
})

test('gated resource opens the lead gate instead of a URL', async ({ page }) => {
  await recordNavigations(page)
  await page.goto('/resources')
  await page.getByTestId('resource-action-res-gated').click()
  await expect(page.getByText('Unlock & Download →')).toBeVisible()
  expect(await page.evaluate(() => window.__opened)).toEqual([])
})

test('empty success shows the empty state, not an error', async ({ page }) => {
  await page.route('**/api/public-proxy/resources', (route) => route.fulfill({ status: 200, json: { success: true, data: [] } }))
  await page.goto('/resources')
  await expect(page.getByTestId('resources-empty')).toBeVisible()
  await expect(page.getByTestId('resources-error')).toHaveCount(0)
})

for (const status of [401, 403, 500, 502]) {
  test(`HTTP ${status} shows an error with retry`, async ({ page }) => {
    let calls = 0
    await page.route('**/api/public-proxy/resources', (route) => {
      calls += 1
      return calls === 1
        ? route.fulfill({ status, json: { error: 'Upstream Error' } })
        : route.fulfill({ status: 200, json: { success: true, data: [{ id: 'r-ok', title: 'Recovered Resource', isGated: false, fileUrl: 'https://files.example.test/x.pdf' }] } })
    })
    await page.goto('/resources')
    await expect(page.getByTestId('resources-error')).toBeVisible()
    await expect(page.getByTestId('resources-empty')).toHaveCount(0)
    await page.getByTestId('resources-error').getByRole('button', { name: 'Retry' }).click()
    await expect(page.getByText('Recovered Resource')).toBeVisible()
    await expect(page.getByTestId('resources-error')).toHaveCount(0)
  })
}

test('malformed success body shows an error', async ({ page }) => {
  await page.route('**/api/public-proxy/resources', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"data": "not-an-array"' }))
  await page.goto('/resources')
  await expect(page.getByTestId('resources-error')).toBeVisible()
})
