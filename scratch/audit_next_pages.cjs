const fs = require('fs');
const path = require('path');

console.log("=============== AUDITING NEXT 10 PAGES / MODULES ===============");

const routesToAudit = [
  { name: 'Blog: DGCA Ground School Guide', path: './src/app/blog/dgca-ground-school-guide/page.jsx', url: '/blog/dgca-ground-school-guide' },
  { name: 'Blog: Pilot Salary India 2026', path: './src/app/blog/pilot-salary-india/page.jsx', url: '/blog/pilot-salary-india' },
  { name: 'Blog: Pilot Training Cost India', path: './src/app/blog/pilot-training-cost-india/page.jsx', url: '/blog/pilot-training-cost-india' },
  { name: 'Privacy Policy', path: './src/app/privacy/page.jsx', url: '/privacy' },
  { name: 'Refund Policy', path: './src/app/refund-policy/page.jsx', url: '/refund-policy' },
  { name: 'Terms & Conditions', path: './src/app/terms/page.jsx', url: '/terms' },
  { name: 'DGCA Compliance', path: './src/app/dgca-compliance/page.jsx', url: '/dgca-compliance' },
  { name: 'Aviation English ICAO', path: './src/app/courses/aviation-english-icao/page.jsx', url: '/courses/aviation-english-icao' },
  { name: 'Flight Dispatcher', path: './src/app/courses/flight-dispatcher/page.jsx', url: '/courses/flight-dispatcher' },
  { name: 'Instrument Rating', path: './src/app/courses/instrument-rating/page.jsx', url: '/courses/instrument-rating' },
  { name: 'Multi-Engine Rating', path: './src/app/courses/multi-engine-rating/page.jsx', url: '/courses/multi-engine-rating' },
  { name: 'Private Pilot License (PPL)', path: './src/app/courses/private-pilot-license/page.jsx', url: '/courses/private-pilot-license' },
  { name: 'Lead Ingestion & Durability API', path: './src/app/api/lead/route.js', url: '/api/lead' },
  { name: 'Admin OS Ingestion Route', path: './admin/src/app/api/public/leads/route.ts', url: '/api/public/leads' }
];

routesToAudit.forEach(item => {
  if (fs.existsSync(item.path)) {
    const content = fs.readFileSync(item.path, 'utf8');
    const size = fs.statSync(item.path).size;
    const hasMetadata = content.includes('metadata') || content.includes('generateMetadata');
    const hasSchema = content.includes('application/ld+json') || content.includes('Schema');
    console.log(JSON.stringify({
      name: item.name,
      url: item.url,
      exists: true,
      sizeBytes: size,
      hasMetadata,
      hasSchema
    }));
  } else {
    console.log(JSON.stringify({ name: item.name, url: item.url, exists: false }));
  }
});
