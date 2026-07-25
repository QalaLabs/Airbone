const fs = require('fs')
const src = fs.readFileSync(
  'C:/Users/pc/Desktop/Airbone/src/app/courses/airline-preparation/page.jsx',
  'utf8'
)
let out = src
  .replaceAll('airline-preparation', 'gd-pi')
  .replaceAll('Airline Interview Prep', 'GD & PI Course')
  .replace(/₹1,50,000/g, '₹30,000')
  .replace(/1,50,000/g, '30,000')
out = out.replace(
  "title: 'GD & PI Course Delhi | GD & PI Course | Airborne'",
  "title: 'GD & PI Course Delhi | Airborne Aviation'"
)
fs.writeFileSync(
  'C:/Users/pc/Desktop/Airbone/src/app/courses/gd-pi/page.jsx',
  out,
  'utf8'
)
console.log('ok', out.includes('₹30,000'), !out.includes('â'))
