import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

export async function storeFallbackLead(leadData) {
  try {
    if (!supabase) {
      console.error('[Lead Durability Error] Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY.')
      return false
    }

    const { error } = await supabase
      .from('fallback_leads')
      .insert([
        {
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email || null,
          pincode: leadData.pincode || null,
          course: leadData.course || null,
          source: leadData.source || null,
          retry_count: 0,
          status: 'pending',
        }
      ])

    if (error) {
      console.error('[Lead Durability Error] Supabase insert failed:', error.message)
      return false
    }

    console.log('[Lead Durability] Lead successfully saved to durable Supabase fallback_leads table.')
    return true
  } catch (err) {
    console.error('[Lead Durability Error] Unexpected failure writing fallback lead:', err.message)
    return false
  }
}

