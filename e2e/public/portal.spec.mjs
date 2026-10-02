import { test, expect } from './helpers.mjs'

// start-web.mjs builds the site with NEXT_PUBLIC_ADMIN_URL=http://127.0.0.1:4100.
test('student portal sign-in points at the configured Admin app, never localhost:4000', async ({ page }) => {
  await page.goto('/portal')
  const signIn = page.getByRole('link', { name: 'Student sign in' })
  await expect(signIn).toHaveAttribute('href', 'http://127.0.0.1:4100/login?callbackUrl=/portal')
})
