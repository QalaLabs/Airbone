import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

const DEPLOYED_HTML = join(process.cwd(), 'public/webinar/page.html')
const LOCAL_SOURCE_HTML = join(process.cwd(), 'src/app/webinar/index-v2.html')

/** Map campaign asset paths to files already on the Airborne site. */
function transformWebinarHtml(html) {
  return html
    .replaceAll('https://www.airborneaviation.in/parents-webinar', 'https://www.airborneaviation.in/webinar')
    .replaceAll('assets/logo-white.webp', '/logo-white.webp')
    .replaceAll('assets/a320-simulator.jpg', '/images/media/a320-simulator.webp')
    .replaceAll('assets/capt-navrang-singh.jpg', '/team/navrang_portrait.jpg')
    .replaceAll('assets/classroom.jpg', '/footage/classroom.jpg')
    .replaceAll('assets/favicon-32x32.png', '/favicon-32x32.png')
    .replace('endpoint: "",', 'endpoint: "/api/lead",')
    .replace(
      'courseInterest: form.courseInterest.value,',
      'course: form.courseInterest.value,',
    )
    .replace(
      `      utmSource: attrib.utm_source || null, utmMedium: attrib.utm_medium || null, utmCampaign: attrib.utm_campaign || null,
      utmTerm: attrib.utm_term || null, utmContent: attrib.utm_content || null,
      referrerUrl: document.referrer || null, landingPage: location.href, leadUuid: uuid,
      webinar: {                                                  // needs backend support to be stored
        form: CONFIG.formName, date: CONFIG.webinarDate, role: form.role.value || "",
        consentContact: true, consentAt: new Date().toISOString(),
        utmId: attrib.utm_id || null, gclid: attrib.gclid || null, fbclid: attrib.fbclid || null
      },`,
      `      utm_source: attrib.utm_source || undefined,
      utm_medium: attrib.utm_medium || undefined,
      utm_campaign: attrib.utm_campaign || undefined,
      utm_term: attrib.utm_term || undefined,
      utm_content: attrib.utm_content || undefined,
      referrer: document.referrer || undefined,
      landing_page: location.href,
      pathname: "/webinar",
      lead_uuid: uuid,
      gclid: attrib.gclid || undefined,
      fbclid: attrib.fbclid || undefined,
      message: "[Parents Webinar " + CONFIG.webinarDate + "] Role: " + (form.role.value || "") + "; Form: " + CONFIG.formName,`,
    )
    .replace('var lead = {uuid:null, first:""};', 'var lead = {uuid:null, first:"", name:"", phone:""};')
    .replace(
      'lead.uuid = uuid; lead.first = payload.name.split(" ")[0];',
      'lead.uuid = uuid; lead.first = payload.name.split(" ")[0]; lead.name = payload.name; lead.phone = payload.phone;',
    )
    .replace(
      'push({event:"webinar_lead_saved", form: CONFIG.formName, course: payload.courseInterest, role: payload.webinar.role});',
      'push({event:"webinar_lead_saved", form: CONFIG.formName, course: payload.course, role: form.role.value || ""});',
    )
    .replace(
      'var body = {leadUuid: lead.uuid, question: q, form: CONFIG.formName};',
      `var body = {
      lead_uuid: lead.uuid,
      name: lead.name,
      phone: lead.phone,
      source: CONFIG.source,
      pathname: "/webinar",
      message: "[Webinar question - " + CONFIG.formName + "] " + q
    };`,
    )
}

function resolveHtmlPath() {
  if (existsSync(DEPLOYED_HTML)) return DEPLOYED_HTML
  if (existsSync(LOCAL_SOURCE_HTML)) return LOCAL_SOURCE_HTML
  throw new Error(
    `Missing webinar HTML. Copy index-v2.html to public/webinar/page.html or src/app/webinar/index-v2.html`,
  )
}

function loadHtml() {
  const raw = readFileSync(resolveHtmlPath(), 'utf8')
  return transformWebinarHtml(raw)
}

export async function GET() {
  const html = loadHtml()
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
