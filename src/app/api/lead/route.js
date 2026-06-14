import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client dynamically so it doesn't fail compilation if keys are missing
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

let supabase = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export async function POST(req) {
  try {
    const payload = await req.json()
    const { name, phone, email, course, source } = payload

    // 1. Basic validation
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: 'Name, Phone, and Email are required parameters.' },
        { status: 400 }
      )
    }

    const leadData = {
      name,
      phone,
      email,
      course: course || 'DGCA CPL Ground School',
      source: source || 'Web ecosystem lead capture',
      status: 'New Lead',
      created_at: new Date().toISOString()
    }

    console.log('[CRM Lead Event Recieved]:', leadData)

    // 2. Insert into Supabase (if configured)
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])

      if (error) {
        console.error('[CRM Supabase Error]:', error.message)
      } else {
        console.log('[CRM Supabase Success]: Saved lead successfully.')
      }
    } else {
      console.warn('[CRM Warning]: Supabase credentials missing from .env.local. Operating in Mock mode.')
    }

    // 3. Webhook triggers for n8n (WhatsApp Business Profile API)
    const n8nWebhook = process.env.N8N_WHATSAPP_WEBHOOK
    if (n8nWebhook) {
      fetch(n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(err => console.error('[n8n Webhook Error]:', err.message))
    }

    // 4. Webhook triggers for Bland.ai / Vapi voice telephony automation
    const voiceWebhook = process.env.VOICE_AI_WEBHOOK
    if (voiceWebhook) {
      fetch(voiceWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(err => console.error('[Voice AI Webhook Error]:', err.message))
    }

    return NextResponse.json({ success: true, message: 'Lead successfully logged in CRM ecosystem.' }, { status: 200 })

  } catch (err) {
    console.error('[API Route Handler Error]:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
