import { createClient } from '@supabase/supabase-js'

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3001'
const INTAKE_KEY = process.env.PUBLIC_INTAKE_KEY || ''
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

interface SupabaseFallbackLead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email?: string | null;
  pincode?: string | null;
  course?: string | null;
  source?: string | null;
  retry_count: number;
  status: 'pending' | 'recovered';
}

// Source label → LeadSource enum key expected by admin public API
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

async function replayFallbackLeads(): Promise<void> {
  console.log('Replay Started')

  if (!supabase) {
    console.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY.')
    console.log('Replay Success: 0')
    console.log('Replay Failed: 0')
    return
  }

  // Fetch pending fallback leads
  const { data: leads, error: fetchError } = await supabase
    .from('fallback_leads')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (fetchError || !leads || leads.length === 0) {
    console.log('Replay Success: 0')
    console.log('Replay Failed: 0')
    return
  }

  let successCount = 0
  let failureCount = 0

  for (const lead of leads as SupabaseFallbackLead[]) {
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

      if (res.ok) {
        // Mark lead as recovered in Supabase (never delete)
        const { error: updateError } = await supabase
          .from('fallback_leads')
          .update({ status: 'recovered' })
          .eq('id', lead.id)

        if (updateError) {
          throw new Error(`Upstream succeeded but failed to update status to recovered: ${updateError.message}`)
        }
        successCount++
      } else {
        throw new Error(`Upstream returned ${res.status}`)
      }
    } catch (err) {
      failureCount++
      // Increment retry_count and leave status as pending
      await supabase
        .from('fallback_leads')
        .update({ retry_count: lead.retry_count + 1 })
        .eq('id', lead.id)
    }
  }

  console.log(`Replay Success: ${successCount}`)
  console.log(`Replay Failed: ${failureCount}`)
}

replayFallbackLeads()

