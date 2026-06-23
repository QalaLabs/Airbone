import fs from 'fs'
import path from 'path'

// Save fallback leads to .data/fallback_leads.jsonl in the project root
const DATA_DIR = path.join(process.cwd(), '.data')
const FALLBACK_FILE = path.join(DATA_DIR, 'fallback_leads.jsonl')

export async function storeFallbackLead(leadData) {
  try {
    // Ensure .data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    const entry = JSON.stringify({
      ...leadData,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    }) + '\n'

    // Append to fallback file
    fs.appendFileSync(FALLBACK_FILE, entry, 'utf8')
    console.log('[Lead Durability] Lead saved to local fallback file.')
    return true
  } catch (err) {
    console.error('[Lead Durability Error] Failed to write fallback lead:', err.message)
    return false
  }
}
