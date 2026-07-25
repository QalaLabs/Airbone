const pages = [
  '/',
  '/courses',
  '/courses/gd-pi',
  '/courses/airline-preparation',
  '/courses/a320-simulator',
  '/courses/commercial-pilot-license-cpl',
  '/courses/atpl',
  '/about',
  '/blog',
  '/privacy',
  '/sitemap.xml',
]

async function main() {
  const out = []
  for (const p of pages) {
    const r = await fetch('http://127.0.0.1:3001' + p)
    const h = await r.text()
    const ev = []
    if (p === '/courses/gd-pi') {
      ev.push(['Coursearation', h.includes('Coursearation')])
      ev.push(['fee30', h.includes('30,000')])
      ev.push(['prepTitle', h.includes('Preparation Matters')])
    }
    if (p === '/courses/airline-preparation') {
      ev.push(['oldGDh1', /GD &amp; PI Course \| Personality|GD & PI Course \| Personality/.test(h)])
      ev.push(['airlineH1', h.includes('Airline Interview Preparation')])
      ev.push(['fee150', h.includes('1,50,000')])
    }
    if (p === '/courses') {
      ev.push(['schemaGdPi', h.includes('/courses/gd-pi')])
      ev.push(['schemaAirline', h.includes('/courses/airline-preparation')])
    }
    if (p === '/courses/a320-simulator') {
      ev.push(['perHr', h.includes('12,000/hr')])
      ev.push(['flat12', h.includes('12,000')])
    }
    if (p === '/') {
      ev.push(['gdHref', h.includes('/courses/gd-pi')])
      ev.push(['airHref', h.includes('/courses/airline-preparation')])
    }
    if (p.includes('cpl')) {
      ev.push(['complied', h.includes('Complied')])
      ev.push(['compliant', h.includes('Compliant')])
      ev.push(['sim12', h.includes('12,000')])
    }
    if (p === '/sitemap.xml') {
      ev.push(['hasBlog', h.includes('/blog')])
      ev.push(['gdpi', h.includes('/courses/gd-pi')])
    }
    out.push({ status: r.status, path: p, checks: Object.fromEntries(ev), bytes: h.length })
  }
  console.log(JSON.stringify(out, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
