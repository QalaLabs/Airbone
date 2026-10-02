import { test, expect } from './helpers.mjs'

test('homepage shows Google reviews with rating and attribution', async ({ page }) => {
  await page.goto('/')
  const section = page.getByTestId('google-reviews')
  await section.scrollIntoViewIfNeeded()
  await expect(section).toBeVisible()
  await expect(section.getByText('Synthetic Google review for end-to-end tests.')).toBeVisible()
  await expect(section.getByRole('link', { name: 'E2E Reviewer' })).toHaveAttribute('href', 'https://www.google.com/maps/contrib/e2e')
  await expect(section.getByText('42 reviews')).toBeVisible()
  await expect(section.getByRole('link', { name: /See all reviews on Google/ })).toHaveAttribute('href', 'https://maps.google.com/?cid=e2e')
})
