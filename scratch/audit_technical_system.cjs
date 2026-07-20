const fs = require('fs');

console.log("=============== AUDITING TECHNICAL SYSTEM & COMPONENT MODULES ===============");

const techModules = [
  { name: 'Rate Limiter Utility', path: './src/utils/rate-limit.js' },
  { name: 'Fallback Storage Utility', path: './src/utils/fallback-storage.js' },
  { name: 'Validation Utility', path: './src/utils/validation.js' },
  { name: 'SEO Helpers', path: './src/utils/seo.js' },
  { name: 'Form Validation Hook', path: './src/hooks/useFormValidation.js' },
  { name: 'AirborneFX Component Library', path: './src/components/AirborneFX.jsx' },
  { name: 'Global Route Map', path: './src/components/GlobalRouteMap.jsx' },
  { name: '3D Cockpit Section', path: './src/components/Home3DSection.jsx' },
  { name: 'Journey Flight Path', path: './src/components/JourneyFlightPath.jsx' },
  { name: 'Single-Step Lead Form', path: './src/components/LeadForm.jsx' },
  { name: 'Multi-Step Lead Form (OTP)', path: './src/components/MultiStepLeadForm.jsx' },
  { name: 'Sticky Mobile CTA', path: './src/components/StickyMobileCTA.jsx' },
  { name: 'WhatsApp Float', path: './src/components/WhatsAppFloat.jsx' },
  { name: 'Frontend Lead Ingestion API', path: './src/app/api/lead/route.js' },
  { name: 'Replay Fallback Leads Script', path: './scripts/replay-fallback-leads.ts' },
  { name: 'Admin OS Lead Route', path: './admin/src/app/api/public/leads/route.ts' },
  { name: 'Admin OS Inngest Route', path: './admin/src/app/api/inngest/route.ts' },
  { name: 'Admin OS Lead Functions', path: './admin/src/lib/events/functions/lead.functions.ts' },
  { name: 'Web App Pytest Suite', path: './test_webapp.py' }
];

techModules.forEach(m => {
  if (fs.existsSync(m.path)) {
    const stat = fs.statSync(m.path);
    console.log(JSON.stringify({ name: m.name, path: m.path, exists: true, sizeBytes: stat.size }));
  } else {
    console.log(JSON.stringify({ name: m.name, path: m.path, exists: false }));
  }
});
