const fs = require('fs');

console.log("================ DETAILED CHECK OF NEXT 10 PAGES ================");

const nextPages = [
  './src/app/blog/pilot-training-cost-india/page.jsx',
  './src/app/blog/dgca-ground-school-guide/page.jsx',
  './src/app/blog/pilot-salary-india/page.jsx',
  './src/app/privacy/page.jsx',
  './src/app/refund-policy/page.jsx',
  './src/app/terms/page.jsx',
  './src/app/dgca-compliance/page.jsx',
  './src/app/courses/aviation-english-icao/page.jsx',
  './src/app/courses/flight-dispatcher/page.jsx',
  './src/app/courses/instrument-rating/page.jsx',
  './src/app/courses/multi-engine-rating/page.jsx',
  './src/app/courses/private-pilot-license/page.jsx'
];

nextPages.forEach(fp => {
  if (fs.existsSync(fp)) {
    const c = fs.readFileSync(fp, 'utf8');
    const hasRtc = c.includes('RT&C');
    const hasRtr = c.includes('RTR');
    const titleMatch = c.match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1];
    const prices = Array.from(new Set(c.match(/₹?\s*\d+[\d,]*\s*(lakh|L|k|K|000|Lakh)/gi) || [])).slice(0, 5);
    console.log({
      file: fp.replace('./src/app/', ''),
      title: titleMatch || 'N/A',
      hasRtc,
      hasRtr,
      pricesSample: prices
    });
  }
});

// Check fallback storage script & ingestion endpoint
console.log("\n--- INGESTION FLOW CHECK ---");
const leadApi = fs.existsSync('./src/utils/fallback-storage.js');
const replayScript = fs.existsSync('./scripts/replay-fallback-leads.ts');
console.log("Fallback storage util exists:", leadApi);
console.log("Replay fallback leads script exists:", replayScript);
