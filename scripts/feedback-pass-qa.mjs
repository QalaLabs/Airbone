const checks = [
  ['/courses/atpl', [['2–3', true], ['4–6', false], ['Age 21', true], ['Parents on Airborne', true]]],
  ['/courses/cabin-crew-training', [['₹59,000', true], ['₹5,000', false], ['100%*', true], ['Parents on Airborne', true]]],
  ['/courses/flying-training-india-abroad', [['Parent Centric', true], ['Comprehensive CPL Flight Training', true]]],
  ['/courses/gd-pi', [['Parents on Airborne', true], ['₹30,000', true]]],
  ['/courses/commercial-pilot-license-cpl', [['Issuance Requirements', true], ['Parents on Airborne', true]]],
  ['/jobs', [['Weekly airline vacancy', true]]],
  ['/courses', [['Eligibility:', false], ['Age 21+', true]]],
]

for (const [path, pairs] of checks) {
  const r = await fetch('http://127.0.0.1:3001' + path)
  const h = await r.text()
  const results = pairs.map(([needle, expect]) => {
    const hit = h.includes(needle)
    return `${needle}=${hit}${hit === expect ? ' OK' : ' FAIL'}`
  })
  console.log(r.status, path, '|', results.join(' | '))
}
