/**
 * replay-cloudsql-fallback.ts
 * One-time script to replay pending fallback_leads from Cloud SQL into the Admin API.
 * Run after confirming Admin API is reachable.
 */
import { Client } from 'pg'

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'https://airborne-admin-368523757732.asia-south1.run.app'
const INTAKE_KEY = process.env.PUBLIC_INTAKE_KEY || ''
const DATABASE_URL = process.env.DATABASE_URL || ''

const SOURCE_SLUG: Record<string, string> = {
  'homepage modal': 'homepage_cta',
  'homepage final cta': 'homepage_cta',
  'contact form': 'contact_form',
  'contact page': 'contact_form',
  'flagship featured banner': 'course_page',
}

function resolveSource(raw = ''): string {
  const key = raw.toLowerCase()
  if (key.startsWith('resource gate')) return 'brochure_download'
  if (key.startsWith('course')) return 'course_page'
  return SOURCE_SLUG[key] ?? 'homepage_cta'
}

async function main() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set.')
    process.exit(1)
  }

  const db = new Client({ connectionString: DATABASE_URL })
  await db.connect()
  console.log('Connected to Cloud SQL.')

  const { rows: leads } = await db.query(
    `SELECT id, name, phone, email, pincode, course, source, retry_count, created_at
     FROM fallback_leads
     WHERE status = 'pending'
     ORDER BY created_at ASC`
  )

  console.log(`Found ${leads.length} pending fallback leads.`)

  let success = 0
  let failed = 0

  for (const lead of leads) {
    try {
      const res = await fetch(`${ADMIN_API_URL}/api/public/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-intake-key': INTAKE_KEY,
        },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email || undefined,
          pincode: lead.pincode || undefined,
          courseInterest: lead.course || undefined,
          source: resolveSource(lead.source || ''),
        }),
      })

      // 201 = new lead created, 200/409 = idempotent (already exists) — all OK
      if (res.ok || res.status === 409) {
        await db.query(
          `UPDATE fallback_leads SET status = 'recovered' WHERE id = $1`,
          [lead.id]
        )
        console.log(`  ✓ [${res.status}] ${lead.phone} (${lead.id})`)
        success++
      } else {
        const body = await res.text()
        throw new Error(`HTTP ${res.status}: ${body}`)
      }
    } catch (err) {
      await db.query(
        `UPDATE fallback_leads SET retry_count = retry_count + 1 WHERE id = $1`,
        [lead.id]
      )
      console.error(`  ✗ ${lead.phone} (${lead.id}): ${(err as Error).message}`)
      failed++
    }
  }

  await db.end()
  console.log(`\nReplay complete — Success: ${success}, Failed: ${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

main()
