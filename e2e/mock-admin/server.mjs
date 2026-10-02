// Deterministic stand-in for the admin `/api/public/*` API used by the public
// E2E suite. Holds fixtures in memory, records every intake POST, and exposes
// `/__mock/*` control endpoints. It never talks to a real database or service.
import http from 'node:http'
import { FIXTURES, INTAKE_KEY } from './fixtures.mjs'

const PORT = Number(process.env.MOCK_ADMIN_PORT || 4799)

let received = []
let jobApplications = []

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks).toString('utf8')
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return null
  }
}

function reset() {
  received = []
  jobApplications = []
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  const path = url.pathname

  if (path === '/__mock/health') return send(res, 200, { ok: true })
  if (path === '/__mock/reset' && req.method === 'POST') {
    reset()
    return send(res, 200, { ok: true })
  }
  if (path === '/__mock/requests') {
    const kind = url.searchParams.get('path')
    return send(res, 200, { data: kind ? received.filter((r) => r.path === kind) : received })
  }

  if (req.method === 'GET') {
    switch (path) {
      case '/api/public/resources':
        return send(res, 200, { success: true, data: FIXTURES.resources })
      case '/api/public/jobs':
        return send(res, 200, { success: true, data: FIXTURES.jobs })
      case '/api/public/testimonials':
        return send(res, 200, { success: true, data: FIXTURES.testimonials })
      case '/api/public/settings':
        return send(res, 200, { success: true, data: {} })
      case '/api/public/google-reviews':
        return send(res, 200, { data: FIXTURES.googleReviews })
      case '/api/public/courses':
      case '/api/public/blogs':
      case '/api/public/pages':
      case '/api/public/placements':
        return send(res, 200, { success: true, data: [] })
      default:
        return send(res, 404, { error: 'Not found' })
    }
  }

  if (req.method === 'POST' && path.startsWith('/api/public/')) {
    if (req.headers['x-intake-key'] !== INTAKE_KEY) return send(res, 401, { error: 'Unauthorized' })
    const body = await readJson(req)
    if (body === null) return send(res, 400, { error: 'Invalid JSON body' })
    received.push({ path, body, clientIp: req.headers['x-intake-client-ip'] ?? null, at: Date.now() })

    if (path === '/api/public/leads') return send(res, 201, { success: true, data: { id: `lead-${received.length}` } })

    if (path === '/api/public/job-applications') {
      const job = FIXTURES.jobs.find((j) => j.id === body.jobId)
      if (!job) return send(res, 404, { error: 'Job not found' })
      const email = String(body.applicantEmail || '').toLowerCase()
      if (jobApplications.some((a) => a.jobId === body.jobId && a.email === email)) {
        return send(res, 409, { error: 'You have already applied for this job.' })
      }
      jobApplications.push({ jobId: body.jobId, email })
      return send(res, 201, { success: true, data: { id: `app-${jobApplications.length}`, status: 'APPLIED' } })
    }

    if (path === '/api/public/testimonials') {
      return send(res, 201, { success: true, data: { id: `t-${received.length}`, status: 'PENDING' } })
    }

    if (path === '/api/public/resource-download') {
      return send(res, 200, { success: true, data: { url: 'https://files.example.test/brochure.pdf' } })
    }
    return send(res, 404, { error: 'Not found' })
  }

  return send(res, 405, { error: 'Method not allowed' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-admin] listening on http://127.0.0.1:${PORT}`)
})
