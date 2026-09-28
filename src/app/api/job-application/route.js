import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rate-limit'
import { isHoneypotTripped } from '@/utils/honeypot'
import { LeadConfigError } from '@/lib/upstream'
import { forwardIntake, visitorResponse } from '@/lib/intakeProxy'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST /api/job-application — public job portal application.
export async function POST(req) {
  const limited = rateLimit(req, 5, 10 * 60 * 1000, 'job-application')
  if (!limited.success) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a moment and try again.' }, { status: 429 })
  }

  let payload
  try {
    payload = await req.json()
    if (!payload || typeof payload !== 'object') throw new Error('bad body')
  } catch {
    return NextResponse.json({ error: 'Malformed payload.' }, { status: 400 })
  }

  if (isHoneypotTripped(payload)) {
    console.warn(JSON.stringify({ event: 'job_application_honeypot_triggered', timestamp: new Date().toISOString() }))
    return NextResponse.json({ success: true }, { status: 200 })
  }

  if (typeof payload.jobId !== 'string' || !UUID_RE.test(payload.jobId)) {
    return NextResponse.json({ error: 'Please choose a valid job.' }, { status: 400 })
  }
  if (payload.consent !== true) {
    return NextResponse.json({ error: 'Please accept the privacy notice to apply.' }, { status: 400 })
  }

  const body = {
    jobId: payload.jobId,
    applicantName: typeof payload.applicantName === 'string' ? payload.applicantName : '',
    applicantEmail: typeof payload.applicantEmail === 'string' ? payload.applicantEmail : '',
    applicantPhone: typeof payload.applicantPhone === 'string' ? payload.applicantPhone : '',
    resumeUrl: typeof payload.resumeUrl === 'string' && payload.resumeUrl.trim() ? payload.resumeUrl.trim() : undefined,
    coverLetter: typeof payload.coverLetter === 'string' && payload.coverLetter.trim() ? payload.coverLetter.trim() : undefined,
    consent: true,
  }

  try {
    const upstream = await forwardIntake('/api/public/job-applications', body, limited.ip)
    const out = visitorResponse(upstream, { 404: 'This job is no longer available.' })
    if (!upstream.ok) {
      console.error(JSON.stringify({ event: 'job_application_rejected', upstreamStatus: upstream.status, timestamp: new Date().toISOString() }))
    }
    return NextResponse.json(out.body, { status: out.status })
  } catch (err) {
    console.error(JSON.stringify({
      event: err instanceof LeadConfigError ? 'job_application_config_error' : 'job_application_upstream_error',
      reason: err?.name === 'AbortError' ? 'timeout' : err?.message,
      timestamp: new Date().toISOString(),
    }))
    return NextResponse.json({ error: 'We could not submit your application right now. Please try again later.' }, { status: 502 })
  }
}
