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
