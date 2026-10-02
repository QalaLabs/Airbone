import { test, expect, json, newSession, USERS } from './helpers.mjs'

// Student Management / Admissions remediation: bulk CSV import (A1), airline partner
// edit (A2), placement section actions (A3), counselor document upload (B1) and
// offer / fee-update letters (B2/B3). Synthetic data on the loopback test DB only.

test.describe.configure({ mode: 'serial' })

const RUN = Date.now().toString(36)
const HEADER = 'first_name,last_name,email,phone'
const studentRows = (n, tag) =>
  Array.from({ length: n }, (_, i) => `Bulk${i},Cadet,bulk-${tag}-${i}@example.test,98${String(10000000 + i).slice(-8)}`).join('\n')
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
const state = {}

// ─── A1 ─────────────────────────────────────────────────────────────────────

test('A1: valid CSV → preview → import → students persist', async ({ page }) => {
  await page.goto('/students')
  await page.getByTestId('student-import-open').click()
  const dialog = page.getByTestId('student-import-dialog')
  await expect(dialog).toBeVisible()

  const csv = `${HEADER}\n${studentRows(3, RUN)}`
  await page.getByTestId('student-import-file').setInputFiles({ name: 'students.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
  await expect(page.getByTestId('student-import-filename')).toHaveText('students.csv')
  await dialog.getByRole('button', { name: 'Check File' }).click()
  await expect(page.getByTestId('student-import-preview')).toBeVisible()
  await expect(page.getByTestId('student-import-total')).toHaveText('3')
  await expect(page.getByTestId('student-import-valid')).toHaveText('3')
  await expect(page.getByTestId('student-import-invalid')).toHaveText('0')

  await dialog.getByRole('button', { name: 'Import 3 Students' }).click()
  await expect(page.getByTestId('student-import-done')).toContainText('3 students imported')
  await page.getByTestId('student-import-close').click()

  await page.reload()
  await page.getByPlaceholder('Search students by name, email, code...').fill(`bulk-${RUN}-1@`)
  await expect(page.getByRole('row').filter({ hasText: 'Bulk1 Cadet' })).toHaveCount(1)
  await expect(page.getByRole('row').filter({ hasText: 'Bulk0 Cadet' })).toHaveCount(0)

  const list = (await json(await page.request.get(`/api/v1/students?search=${encodeURIComponent(`bulk-${RUN}-`)}&limit=50`))).body.data
  expect(list).toHaveLength(3)
  state.studentId = list[0].id
})

test('A1: 151-row file is rejected and nothing can be imported', async ({ page }) => {
  await page.goto('/students')
  await page.getByTestId('student-import-open').click()
  const dialog = page.getByTestId('student-import-dialog')
  const csv = `${HEADER}\n${studentRows(151, `${RUN}x`)}`
  await page.getByTestId('student-import-file').setInputFiles({ name: 'too-many.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
  await dialog.getByRole('button', { name: 'Check File' }).click()
  await expect(page.getByTestId('student-import-total')).toHaveText('151')
  await expect(page.getByTestId('student-import-errors')).toContainText('151 student rows; the limit is 150')
  await expect(dialog.getByRole('button', { name: /^Import/ })).toBeDisabled()

  // The server enforces the same rule regardless of the UI.
  const res = await page.request.post('/api/v1/students/import', {
    multipart: { dryRun: 'false', file: { name: 'too-many.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) } },
  })
  expect(res.status()).toBe(422)
  const after = (await json(await page.request.get(`/api/v1/students?search=${encodeURIComponent(`bulk-${RUN}x-`)}&limit=5`))).body.data
  expect(after).toHaveLength(0)
})

test('A1: invalid rows and wrong file type are reported; no partial import', async ({ page }) => {
  const mixed = `${HEADER}\nGood,Row,mixed-${RUN}@example.test,9876543210\nBad,Row,not-an-email,12`
  const preview = await json(await page.request.post('/api/v1/students/import', {
    multipart: { dryRun: 'true', file: { name: 'mixed.csv', mimeType: 'text/csv', buffer: Buffer.from(mixed) } },
  }))
  expect(preview.status).toBe(200)
  expect(preview.body.data.validRows).toBe(1)
  expect(preview.body.data.invalidRows).toBe(1)
  expect(preview.body.data.errors.every((e) => e.rowNumber === 3)).toBe(true)

  const commit = await page.request.post('/api/v1/students/import', {
    multipart: { dryRun: 'false', file: { name: 'mixed.csv', mimeType: 'text/csv', buffer: Buffer.from(mixed) } },
  })
  expect(commit.status()).toBe(422)
  expect((await json(await page.request.get(`/api/v1/students?search=mixed-${RUN}&limit=5`))).body.data).toHaveLength(0)

  const exe = await page.request.post('/api/v1/students/import', {
    multipart: { dryRun: 'true', file: { name: 'payload.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ') } },
  })
  expect(exe.status()).toBe(415)
})

// ─── A2 / A3 ────────────────────────────────────────────────────────────────

test('A3: placement section buttons lead to real destinations', async ({ page }) => {
  await page.goto('/placements')
  const nav = page.getByRole('navigation', { name: 'Placement sections' })
  await expect(nav).toBeVisible()
  await expect(page.getByText('Schedule Recruitment Drive')).toHaveCount(0)

  await page.getByTestId('placement-nav-recruitment').click()
  await expect(page).toHaveURL(/\/placements\?tab=recruitment/)
  await expect(page.getByTestId('placement-section-recruitment')).toBeVisible()

  await page.getByTestId('placement-nav-partners').click()
  await expect(page).toHaveURL(/\/placements\?tab=partners/)
  await expect(page.getByTestId('placement-section-partners')).toBeVisible()

  await page.getByTestId('placement-nav-placements').click()
  await expect(page.getByTestId('placement-section-placements')).toBeVisible()

  await page.getByTestId('add-placement').click()
  await expect(page.getByTestId('placement-dialog')).toBeVisible()
  await expect(page.getByTestId('placement-dialog')).toContainText('Add Placement')
  await page.keyboard.press('Escape')

  await page.getByTestId('add-partner').click()
  await expect(page.getByTestId('partner-dialog')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByTestId('add-recruitment-drive').click()
  await expect(page).toHaveURL(/\/jobs$/)
  await expect(page.getByRole('dialog').getByText('Create Job').first()).toBeVisible()
})

test('A2: add partner, edit it, and the change survives reload', async ({ page }) => {
  await page.goto('/placements?tab=partners')
  await page.getByTestId('add-partner').click()
  const dialog = page.getByTestId('partner-dialog')
  await dialog.locator('#partner-name').fill(`E2E Air ${RUN}`)
  await dialog.locator('#partner-code').fill(`e2e-air-${RUN}`)
  await dialog.getByRole('button', { name: 'Add Partner' }).click()
  await expect(dialog).toBeHidden()
  const card = page.getByTestId('partner-card').filter({ hasText: `E2E Air ${RUN}` })
  await expect(card).toBeVisible()

  await card.getByRole('button', { name: `Edit E2E Air ${RUN}` }).click()
  await expect(dialog.locator('#partner-name')).toHaveValue(`E2E Air ${RUN}`)
  await expect(dialog.locator('#partner-code')).toHaveValue(`e2e-air-${RUN}`)
  await dialog.locator('#partner-name').fill(`E2E Airways ${RUN}`)
  await dialog.locator('#partner-code').fill(`e2e-aw-${RUN}`)
  await dialog.locator('#partner-industry').fill('Low-cost carrier')
  await dialog.getByRole('button', { name: 'Save Changes' }).click()
  await expect(dialog).toBeHidden()

  await page.reload()
  const edited = page.getByTestId('partner-card').filter({ hasText: `E2E Airways ${RUN}` })
  await expect(edited).toBeVisible()
  await expect(edited.getByTestId('partner-code')).toHaveText(`Code: E2E-AW-${RUN}`.toUpperCase().replace('CODE:', 'Code:'))
  await expect(edited).toContainText('Low-cost carrier')
  await expect(page.getByTestId('partner-card').filter({ hasText: `E2E Air ${RUN}` }).filter({ hasNotText: 'Airways' })).toHaveCount(0)

  const listed = (await json(await page.request.get(`/api/v1/hiring-partners?search=${encodeURIComponent(`E2E Airways ${RUN}`)}&limit=10`))).body.data
  const partners = Array.isArray(listed) ? listed : listed.data
  state.partnerId = partners.find((p) => p.slug === `e2e-aw-${RUN}`).id
})

test('A2: invalid and duplicate codes are refused with a visible error', async ({ page }) => {
  const other = await json(await page.request.post('/api/v1/hiring-partners', { data: { name: `E2E Other ${RUN}`, slug: `e2e-other-${RUN}` } }))
  expect(other.status).toBe(201)

  await page.goto('/placements?tab=partners')
  const card = page.getByTestId('partner-card').filter({ hasText: `E2E Other ${RUN}` })
  await card.getByRole('button', { name: `Edit E2E Other ${RUN}` }).click()
  const dialog = page.getByTestId('partner-dialog')

  await dialog.locator('#partner-code').fill('Bad Code!')
  await dialog.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByTestId('partner-error')).toBeVisible()

  await dialog.locator('#partner-code').fill(`e2e-aw-${RUN}`)
  await dialog.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByTestId('partner-error')).toContainText('already used')

  const res = await page.request.patch(`/api/v1/hiring-partners/${other.body.data.id}`, { data: { slug: `e2e-aw-${RUN}` } })
  expect(res.status()).toBe(409)
})

test('A3: Add Placement still creates a placement', async ({ page }) => {
  await page.goto('/placements')
  await page.getByTestId('add-placement').click()
  const dialog = page.getByTestId('placement-dialog')
  await dialog.locator('#placement-student').selectOption(state.studentId)
  await dialog.locator('#placement-partner').selectOption(state.partnerId)
  await dialog.locator('#placement-title').fill(`E2E Cadet Pilot ${RUN}`)
  await dialog.getByRole('button', { name: 'Save Placement' }).click()
  await expect(page.getByText('Placement added').first()).toBeVisible()
  await expect(page.getByTestId('placement-row').filter({ hasText: `E2E Cadet Pilot ${RUN}` })).toBeVisible()
})

test('A1/A2 RBAC: content role cannot import students or edit partners', async ({ browser }) => {
  const content = await newSession(browser, USERS.content)
  try {
    const imp = await content.api.post('/api/v1/students/import', {
      multipart: { dryRun: 'true', file: { name: 's.csv', mimeType: 'text/csv', buffer: Buffer.from(`${HEADER}\nA,B,c@example.test,9876543210`) } },
    })
    expect(imp.status()).toBe(403)
    const edit = await content.api.patch(`/api/v1/hiring-partners/${state.partnerId}`, { data: { name: 'Hijack' } })
    expect(edit.status()).toBe(403)
  } finally {
    await content.context.close()
  }
})

// ─── B1 / B2 / B3 ───────────────────────────────────────────────────────────

test('B1: assigned counselor uploads a document; it persists and downloads', async ({ page, browser }) => {
  const users = (await json(await page.request.get(`/api/v1/users?search=${encodeURIComponent(USERS.counselor)}`))).body.data
  const counselorId = users.find((u) => u.email === USERS.counselor).id
  const phone = `8${String(Date.now()).slice(-9)}`

  // Dossier owned by the counselor (lead assignee) and one owned by nobody.
  const mk = async (name, assignedTo) => {
    const lead = await json(await page.request.post('/api/v1/leads', { data: { name, phone: `${phone.slice(0, 9)}${assignedTo ? 1 : 2}`, email: `${name.replace(/\W/g, '').toLowerCase()}@example.test`, ...(assignedTo && { assignedTo }) } }))
    expect(lead.status).toBe(201)
    await page.request.patch(`/api/v1/leads/${lead.body.data.id}`, { data: { status: 'PROSPECT' } })
    const deals = (await json(await page.request.get(`/api/v1/deals?search=${encodeURIComponent(name)}&limit=10`))).body.data
    const deal = deals.find((d) => d.leadId === lead.body.data.id)
    const conv = await json(await page.request.post(`/api/v1/deals/${deal.id}/convert-to-admission`, { data: { feeAmount: 80000, courseName: 'E2E Fee Course' } }))
    expect(conv.status).toBe(200)
    return conv.body.data.admission?.id ?? conv.body.data.admissionId
  }
  state.ownAdmission = await mk(`E2E Doc Own ${RUN}`, counselorId)
  state.otherAdmission = await mk(`E2E Doc Other ${RUN}`, null)

  const counselor = await newSession(browser, USERS.counselor)
  try {
    const cp = counselor.page
    await cp.goto(`/admissions?id=${state.ownAdmission}`)
    const form = cp.getByTestId('document-upload-form')
    await expect(form).toBeVisible()
    await form.getByTestId('document-upload-type').selectOption('CLASS_12_MARKSHEET')
    await form.getByTestId('document-upload-file').setInputFiles({ name: 'class12 marksheet.pdf', mimeType: 'application/pdf', buffer: PDF })
    await form.getByTestId('document-upload-submit').click()
    await expect(cp.getByText('Document uploaded').first()).toBeVisible()
    await expect(cp.getByTestId('document-row').filter({ hasText: 'class12 marksheet.pdf' })).toBeVisible()

    await cp.reload()
    const row = cp.getByTestId('document-row').filter({ hasText: 'class12 marksheet.pdf' })
    await expect(row).toBeVisible()
    await expect(row).toContainText('CLASS 12 MARKSHEET')

    const docs = (await json(await counselor.api.get(`/api/v1/admissions/${state.ownAdmission}/documents?limit=10`))).body.data
    const doc = docs.find((d) => d.name === 'class12 marksheet.pdf')
    expect(doc.fileUrl).toBe(`/api/v1/documents/${doc.id}/download`)
    expect(doc.uploader?.name).toBeTruthy()
    const dl = await counselor.api.get(doc.fileUrl)
    expect(dl.status()).toBe(200)
    expect(dl.headers()['content-type']).toBe('application/pdf')
    expect(Buffer.from(await dl.body()).equals(PDF)).toBe(true)

    // Disguised executable is refused in the UI and nothing is added.
    await form.getByTestId('document-upload-file').setInputFiles({ name: 'invoice.pdf', mimeType: 'application/pdf', buffer: Buffer.from('MZ\x90\x00 not a pdf') })
    await form.getByTestId('document-upload-submit').click()
    await expect(cp.getByTestId('document-upload-error')).toContainText('not a valid PDF')
    await expect(cp.getByTestId('document-row')).toHaveCount(1)

    // Not the counselor's dossier → 403, nothing stored.
    const foreign = await counselor.api.post(`/api/v1/admissions/${state.otherAdmission}/documents`, {
      multipart: { documentType: 'OTHER', file: { name: 'x.pdf', mimeType: 'application/pdf', buffer: PDF } },
    })
    expect(foreign.status()).toBe(403)
  } finally {
    await counselor.context.close()
  }
  const otherDocs = (await json(await page.request.get(`/api/v1/admissions/${state.otherAdmission}/documents?limit=10`))).body.data
  expect(otherDocs).toHaveLength(0)
})

test('B2/B3: offer letter and fee update render real dossier data (draft until approved copy exists)', async ({ page }) => {
  await page.goto(`/admissions?id=${state.ownAdmission}`)
  await expect(page.getByTestId('letter-offer')).toHaveAttribute('href', `/api/v1/admissions/${state.ownAdmission}/letters/offer`)
  await expect(page.getByTestId('letter-fee-update')).toHaveAttribute('href', `/api/v1/admissions/${state.ownAdmission}/letters/fee-update`)

  const admission = (await json(await page.request.get(`/api/v1/admissions/${state.ownAdmission}`))).body.data
  for (const kind of ['offer', 'fee-update']) {
    const res = await page.request.get(`/api/v1/admissions/${state.ownAdmission}/letters/${kind}`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/html')
    expect(res.headers()['content-security-policy']).toContain("default-src 'none'")
    expect(res.headers()['x-letter-approved']).toBe('false')
    const html = await res.text()
    expect(html).toContain(admission.applicationNo)
    expect(html).toContain(`E2E Doc Own ${RUN}`)
    expect(html).toContain('DRAFT — NOT FOR ISSUE')
    expect(html).toContain('₹80,000.00')
    expect(html.split('</style>')[1]).not.toMatch(/\{\{|\}\}|undefined|NaN/)
  }

  const letterPage = await page.context().newPage()
  await letterPage.goto(`/api/v1/admissions/${state.ownAdmission}/letters/fee-update`)
  await expect(letterPage.getByRole('heading', { name: 'Fee Update' })).toBeVisible()
  await expect(letterPage.getByText('Balance Due')).toBeVisible()
  await letterPage.close()

  expect((await page.request.get(`/api/v1/admissions/${state.ownAdmission}/letters/unknown`)).status()).toBe(404)
})
