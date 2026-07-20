const fs = require('fs');

console.log("================ DEEP DIVE AUDIT ================");

const homeContent = fs.readFileSync('./src/app/page.jsx', 'utf8');

// 1. Logo check
console.log("\n--- LOGO ASSETS AUDIT ---");
const publicFiles = fs.readdirSync('./public');
console.log("Public root files:", publicFiles.filter(f => f.includes('logo')));

// 2. Testimonial Photos Check
console.log("\n--- TESTIMONIAL AUDIT ---");
const globalRouteMap = fs.readFileSync('./src/components/GlobalRouteMap.jsx', 'utf8');
console.log("GlobalRouteMap mentions pilot-portrait.jpg:", globalRouteMap.includes('pilot-portrait.jpg'));
console.log("GlobalRouteMap pilot portrait count:", (globalRouteMap.match(/pilot-portrait\.jpg/g) || []).length);

// 3. Form screening questions on Cabin Crew page
const cabinPage = fs.readFileSync('./src/app/courses/cabin-crew-training/page.jsx', 'utf8');
console.log("\n--- CABIN CREW PAGE AUDIT ---");
console.log("Cabin crew has screening form component:", cabinPage.includes('MultiStepLeadForm') || cabinPage.includes('LeadForm') || cabinPage.includes('screening'));

// 4. Schema Audit across all pages
console.log("\n--- SCHEMA (JSON-LD) CHECK ---");
const schemaPages = [
  './src/app/page.jsx',
  './src/app/courses/page.jsx',
  './src/app/courses/commercial-pilot-license-cpl/page.jsx',
  './src/app/courses/ground-school/page.jsx',
  './src/app/courses/cabin-crew-training/page.jsx',
  './src/app/about/page.jsx',
  './src/app/contact/page.jsx',
  './src/app/jobs/page.jsx',
  './src/app/resources/page.jsx',
  './src/app/courses/atpl/page.jsx',
  './src/app/courses/cadet-preparation/page.jsx',
  './src/app/courses/a320-simulator/page.jsx',
  './src/app/courses/cas-compass-adapt/page.jsx',
  './src/app/courses/airline-preparation/page.jsx',
  './src/app/courses/flying-training-india-abroad/page.jsx',
  './src/app/blog/how-to-become-pilot-india/page.jsx'
];

for (const sp of schemaPages) {
  if (fs.existsSync(sp)) {
    const c = fs.readFileSync(sp, 'utf8');
    const hasLdJson = c.includes('application/ld+json');
    const hasSeoHelper = c.includes('getLocalBusinessSchema') || c.includes('getEducationalOrgSchema') || c.includes('getCourseSchema');
    console.log(`${sp}: JSON-LD=${hasLdJson}, SEO-Helper=${hasSeoHelper}`);
  } else {
    console.log(`${sp}: FILE NOT FOUND`);
  }
}

// 5. UX & CONVERSION FEATURES AUDIT
console.log("\n--- UX & CONVERSION FEATURES AUDIT ---");
const stickyCTA = fs.existsSync('./src/components/StickyMobileCTA.jsx') ? fs.readFileSync('./src/components/StickyMobileCTA.jsx', 'utf8') : '';
console.log("StickyMobileCTA exists:", Boolean(stickyCTA));
console.log("StickyMobileCTA phone:", stickyCTA.includes("9953777320"));
console.log("StickyMobileCTA WhatsApp:", stickyCTA.includes("wa.me"));

console.log("Hero micro-form on homepage:", homeContent.includes("hero_micro_form") || homeContent.includes("15 minutes"));
console.log("Exit-intent lead magnet modal:", homeContent.includes("exit-intent") || homeContent.includes("Free CPL Starter Guide") || homeContent.includes("ouibounce"));
console.log("WhatsApp quick reply strip in hero:", homeContent.includes("Message us on WhatsApp") || homeContent.includes("15 minutes"));

// 6. Check CPL price consistency across site
console.log("\n--- PRICE CONSISTENCY AUDIT ---");
const allFiles = ['./src/app/page.jsx', './src/app/courses/page.jsx', './src/app/courses/commercial-pilot-license-cpl/page.jsx', './src/app/blog/how-to-become-pilot-india/page.jsx'];
for (const f of allFiles) {
  const c = fs.readFileSync(f, 'utf8');
  const prices = c.match(/₹?\s*\d+[\d,]*\s*(lakh|L|k|K|000)/gi) || [];
  console.log(`Prices in ${f}:`, Array.from(new Set(prices)).slice(0, 10));
}
