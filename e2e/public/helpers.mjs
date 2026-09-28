import { test as base, expect } from '@playwright/test'

const MOCK = `http://127.0.0.1:${Number(process.env.MOCK_ADMIN_PORT || 4799)}`
let ipCounter = 10

export const test = base.extend({
  // Unique visitor IP per test so per-IP rate limits never couple tests.
  // Third-party requests (analytics, fonts, partner links) are blocked so runs
  // are deterministic and nothing leaves the machine.
  context: async ({ context }, use) => {
    ipCounter += 1
    await context.setExtraHTTPHeaders({ 'x-forwarded-for': `10.20.0.${ipCounter}` })
    await context.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => route.abort())
    await fetch(`${MOCK}/__mock/reset`, { method: 'POST' })
    await use(context)
  },
})

export { expect }

export async function mockRequests(path) {
  const res = await fetch(`${MOCK}/__mock/requests?path=${encodeURIComponent(path)}`)
  return (await res.json()).data
}

/** Fill the invisible honeypot the way a naive bot would. */
export async function tripHoneypot(form) {
  await form.locator('input[name="hp_ref_code"]').evaluate((el) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(el, 'bot-filled')
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
