import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '..', '.data')
const FALLBACK_FILE = path.join(DATA_DIR, 'fallback_leads.jsonl')
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3001'
const INTAKE_KEY = process.env.PUBLIC_INTAKE_KEY || ''

async function retryLeads() {
  if (!fs.existsSync(FALLBACK_FILE)) {
    console.log('No fallback leads found. Everything is synced.')
    return
  }

  const fileContent = fs.readFileSync(FALLBACK_FILE, 'utf8')
  const lines = fileContent.split('\n').filter(Boolean)
  
  if (lines.length === 0) {
    console.log('Fallback file is empty.')
    return
  }

  console.log(`Found ${lines.length} failed leads. Attempting retry...`)
  const remainingLines = []
  let successCount = 0
  let failureCount = 0

  for (const line of lines) {
    try {
      const lead = JSON.parse(line)
      
      const res = await fetch(`${ADMIN_API_URL}/api/public/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-intake-key': INTAKE_KEY,
        },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          courseInterest: lead.course,
          source: lead.source,
        }),
      })

      if (res.ok) {
        successCount++
        console.log(`✅ Successfully synced lead: ${lead.name}`)
      } else {
        throw new Error(`Upstream returned ${res.status}`)
      }
    } catch (err) {
      console.error(`❌ Failed to sync lead:`, err.message)
      failureCount++
      // Push back to remaining lines to try again next time
      remainingLines.push(line)
    }
  }

  if (remainingLines.length > 0) {
    fs.writeFileSync(FALLBACK_FILE, remainingLines.join('\n') + '\n', 'utf8')
  } else {
    // All synced, clear file
    fs.unlinkSync(FALLBACK_FILE)
  }

  console.log(`\nRetry complete. Success: ${successCount}, Failed: ${failureCount}`)
}

retryLeads()
