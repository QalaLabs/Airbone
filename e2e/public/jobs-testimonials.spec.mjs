import { test, expect, mockRequests, tripHoneypot } from './helpers.mjs'
import { JOB_ID } from '../mock-admin/fixtures.mjs'

async function openApplyForm(page) {
  await page.goto('/jobs')
  await expect(page.getByText('E2E First Officer').first()).toBeVisible()
  await page.getByText('E2E First Officer').first().click()
  const apply = page.getByTestId('job-apply-button')
  if (!(await apply.isVisible())) {
    await page.getByRole('button', { name: /view|details|apply/i }).first().click()
  }
  await page.getByTestId('job-apply-button').click()
  const form = page.getByTestId('job-application-form')
  await expect(form).toBeVisible()
  return form
}

async function fillApplication(form, email = 'applicant@example.test') {
  await form.locator('#ja-name').fill('E2E Applicant')
  await form.locator('#ja-email').fill(email)
  await form.locator('#ja-phone').fill('9876501234')
  await form.locator('#ja-resume').fill('https://drive.example.test/cv.pdf')
  await form.locator('#ja-consent').check()
}

test('jobs page lists published jobs', async ({ page }) => {
  await page.goto('/jobs')
  await expect(page.getByText('E2E First Officer').first()).toBeVisible()
})

test('job application submits to the admin API and shows success', async ({ page }) => {
  const form = await openApplyForm(page)
  await fillApplication(form)
  await form.getByRole('button', { name: /Submit Application/ }).click()
  await expect(page.getByTestId('job-application-success')).toBeVisible()

  const apps = await mockRequests('/api/public/job-applications')
  expect(apps).toHaveLength(1)
  expect(apps[0].body).toMatchObject({ jobId: JOB_ID, applicantEmail: 'applicant@example.test', consent: true })
})

test('duplicate job application is reported truthfully', async ({ page }) => {
  let form = await openApplyForm(page)
  await fillApplication(form, 'dup@example.test')
  await form.getByRole('button', { name: /Submit Application/ }).click()
  await expect(page.getByTestId('job-application-success')).toBeVisible()

  form = await openApplyForm(page)
  await fillApplication(form, 'DUP@example.test')
  await form.getByRole('button', { name: /Submit Application/ }).click()
  await expect(page.getByTestId('job-application-error')).toContainText('already applied')
})

test('job application requires consent and valid fields client-side', async ({ page }) => {
  const form = await openApplyForm(page)
  await form.getByRole('button', { name: /Submit Application/ }).click()
  await expect(page.getByTestId('job-application-success')).toHaveCount(0)
  expect(await mockRequests('/api/public/job-applications')).toHaveLength(0)
})

test('job application honeypot is silently dropped', async ({ page }) => {
  const form = await openApplyForm(page)
  await fillApplication(form, 'bot@example.test')
  await tripHoneypot(form)
  await form.getByRole('button', { name: /Submit Application/ }).click()
  await expect(page.getByTestId('job-application-success')).toBeVisible()
  expect(await mockRequests('/api/public/job-applications')).toHaveLength(0)
})

test('testimonial submission is forwarded without status/featured fields', async ({ page }) => {
  await page.goto('/share-your-story')
  const form = page.getByTestId('testimonial-form')
  await form.locator('#t-name').fill('E2E Alumnus')
  await form.locator('#t-title').fill('CPL Ground School, 2025')
  await form.locator('#t-content').fill('The ground classes were structured, practical and the instructors always made time for doubts.')
  await form.locator('#t-rating').selectOption('5')
  await form.locator('#t-consent').check()
  await form.getByRole('button', { name: /Submit Testimonial/ }).click()
  await expect(page.getByTestId('testimonial-success')).toBeVisible()

  const posts = await mockRequests('/api/public/testimonials')
  expect(posts).toHaveLength(1)
  expect(posts[0].body).toMatchObject({ authorName: 'E2E Alumnus', rating: 5, consent: true })
  expect(posts[0].body).not.toHaveProperty('status')
  expect(posts[0].body).not.toHaveProperty('isFeatured')
})

test('testimonial honeypot is silently dropped', async ({ page }) => {
  await page.goto('/share-your-story')
  const form = page.getByTestId('testimonial-form')
  await form.locator('#t-name').fill('Bot Name')
  await form.locator('#t-content').fill('This is an automated submission long enough to pass validation rules.')
  await form.locator('#t-consent').check()
  await tripHoneypot(form)
  await form.getByRole('button', { name: /Submit Testimonial/ }).click()
  await expect(page.getByTestId('testimonial-success')).toBeVisible()
  expect(await mockRequests('/api/public/testimonials')).toHaveLength(0)
})
