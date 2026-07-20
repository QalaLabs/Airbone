const fs = require('fs');

console.log("=============== INSPECTING HOMEPAGE & COMPONENTS ===============");

const homeContent = fs.readFileSync('./src/app/page.jsx', 'utf8');

// Find all H1, H2, H3 tags in page.jsx
const h1s = homeContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
const h2s = homeContent.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
console.log("\n--- H1 Headings on Homepage ---");
console.log(h1s.map(h => h.replace(/<[^>]+>/g, '').trim()));

console.log("\n--- H2 Headings on Homepage (Sample 10) ---");
console.log(h2s.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 10));

// Check Instructor Bio in page.jsx or GlobalRouteMap or other components
const filesToCheck = [
  './src/app/page.jsx',
  './src/components/GlobalRouteMap.jsx',
  './src/components/ProgramGrid.jsx',
  './src/components/JourneyFlightPath.jsx',
  './src/components/Home3DSection.jsx'
];

filesToCheck.forEach(f => {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes("Navrang") || c.includes("Navrang Singh")) {
      console.log(`\nNavrang Singh mentions in ${f}:`);
      const lines = c.split('\n').filter(l => l.includes("Navrang"));
      lines.forEach(l => console.log("  ", l.trim().slice(0, 120)));
    }
  }
});
