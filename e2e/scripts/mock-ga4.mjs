// Deterministic stand-in for Google OAuth + the GA4 Data API, used only by the
// admin E2E run. It verifies the RS256 service-account JWT the admin signs with a
// throwaway key generated at startup, then answers batchRunReports from fixed
// per-day test data. A request whose range starts on OUTAGE_DATE gets a 503 so the
// "GA4 unavailable" state can be exercised end to end.
import http from 'node:http'
import { createVerify, generateKeyPairSync } from 'node:crypto'

export const MOCK_GA4_PROPERTY = '424242'
export const OUTAGE_DATE = '2021-03-03'
const TOKEN = 'e2e-ga4-access-token'

const DAYS = {
  '2026-09-11': {
    totals: { views: 50, users: 18, sessions: 25 },
    pages: [
      { path: '/e2e-landing-page', title: 'E2E Landing', views: 30, users: 12, sessions: 14 },
      { path: '/', title: 'Home', views: 20, users: 10, sessions: 11 },
    ],
    sources: [
      { source: 'google', medium: 'organic', sessions: 15, users: 12 },
      { source: '(direct)', medium: '(none)', sessions: 10, users: 8 },
    ],
  },
  '2026-09-12': {
    totals: { views: 20, users: 8, sessions: 10 },
    pages: [
      { path: '/e2e-landing-page', title: 'E2E Landing', views: 12, users: 5, sessions: 6 },
      { path: '/courses/cpl', title: 'CPL', views: 8, users: 4, sessions: 4 },
    ],
    sources: [
      { source: 'google', medium: 'organic', sessions: 6, users: 5 },
      { source: 'newsletter', medium: 'email', sessions: 4, users: 3 },
    ],
  },
}

function inRange(day, { startDate, endDate }) {
  const end = endDate === 'today' ? '9999-12-31' : endDate
  return day >= startDate && day <= end
}

function aggregate(items, key, fields) {
  const map = new Map()
  for (const item of items) {
    const k = key(item)
    const row = map.get(k) ?? { ...item, ...Object.fromEntries(fields.map((f) => [f, 0])) }
    for (const f of fields) row[f] += item[f]
    map.set(k, row)
  }
  return [...map.values()]
}

function report(request) {
  const days = Object.entries(DAYS).filter(([day]) => inRange(day, request.dateRanges[0])).map(([, d]) => d)
  const dims = (request.dimensions ?? []).map((d) => d.name).join(',')
  const metadata = { timeZone: 'Asia/Kolkata', currencyCode: 'INR' }
  const metric = (v) => ({ value: String(v) })
  if (!dims) {
    if (days.length === 0) return { rowCount: 0, metadata }
    const t = days.reduce((a, d) => ({ views: a.views + d.totals.views, users: a.users + d.totals.users, sessions: a.sessions + d.totals.sessions }), { views: 0, users: 0, sessions: 0 })
    return { rows: [{ metricValues: [metric(t.views), metric(t.users), metric(t.sessions)] }], rowCount: 1, metadata }
  }
  if (dims === 'pagePath,pageTitle') {
    const rows = aggregate(days.flatMap((d) => d.pages), (p) => `${p.path}|${p.title}`, ['views', 'users', 'sessions'])
      .sort((a, b) => b.views - a.views)
      .slice(0, request.limit ?? 25)
      .map((p) => ({ dimensionValues: [{ value: p.path }, { value: p.title }], metricValues: [metric(p.views), metric(p.users), metric(p.sessions)] }))
    return { rows, rowCount: rows.length, metadata }
  }
  const rows = aggregate(days.flatMap((d) => d.sources), (s) => `${s.source}|${s.medium}`, ['sessions', 'users'])
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, request.limit ?? 15)
    .map((s) => ({ dimensionValues: [{ value: s.source }, { value: s.medium }], metricValues: [metric(s.sessions), metric(s.users)] }))
  return { rows, rowCount: rows.length, metadata }
}

async function readBody(req) {
  let data = ''
  for await (const chunk of req) data += chunk
  return data
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

/** Starts the mock and returns the env the admin needs to talk to it. */
export function startMockGa4(port) {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const base = `http://127.0.0.1:${port}`

  const server = http.createServer(async (req, res) => {
    try {
      const body = await readBody(req)
      if (req.method === 'POST' && req.url === '/token') {
        const assertion = new URLSearchParams(body).get('assertion') ?? ''
        const [h, p, s] = assertion.split('.')
        const valid = Boolean(h && p && s) && createVerify('RSA-SHA256').update(`${h}.${p}`).verify(publicKey, Buffer.from(s, 'base64url'))
        if (!valid) return send(res, 400, { error: 'invalid_grant' })
        return send(res, 200, { access_token: TOKEN, expires_in: 3600, token_type: 'Bearer' })
      }
      const match = /^\/v1beta\/properties\/(\d+):batchRunReports$/.exec(req.url ?? '')
      if (req.method === 'POST' && match) {
        if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(res, 401, { error: { status: 'UNAUTHENTICATED' } })
        if (match[1] !== MOCK_GA4_PROPERTY) return send(res, 403, { error: { status: 'PERMISSION_DENIED' } })
        const { requests } = JSON.parse(body)
        if (requests?.[0]?.dateRanges?.[0]?.startDate === OUTAGE_DATE) return send(res, 503, { error: { status: 'UNAVAILABLE' } })
        return send(res, 200, { reports: requests.map(report), kind: 'analyticsData#batchRunReports' })
      }
      send(res, 404, { error: 'not found' })
    } catch {
      send(res, 500, { error: 'mock failure' })
    }
  })
  server.listen(port, '127.0.0.1')

  return {
    GA4_PROPERTY_ID: MOCK_GA4_PROPERTY,
    GA4_DATA_API_URL: base,
    GA4_SERVICE_ACCOUNT_JSON: JSON.stringify({
      type: 'service_account',
      client_email: 'e2e-ga4-reader@test.invalid',
      private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
      token_uri: `${base}/token`,
    }),
  }
}
