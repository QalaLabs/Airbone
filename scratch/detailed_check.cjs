const fs = require('fs');

console.log("================ DETAILED CODEBASE AUDIT ================");

// 1. Homepage Audit
const homeContent = fs.readFileSync('./src/app/page.jsx', 'utf8');
console.log("\n--- HOMEPAGE (src/app/page.jsx) ---");
console.log("Has 'use client':", homeContent.includes("'use client'"));
console.log("Has metadata export:", homeContent.includes('export const metadata') || homeContent.includes('export async function generateMetadata'));
console.log("Has Airborne Advantage section:", homeContent.includes("The Airborne Advantage") || homeContent.includes("Airborne Advantage"));
console.log("Has Why NOW section:", homeContent.includes("Why NOW Is the Best Time") || homeContent.includes("Why NOW"));
console.log("Has Pilot Salary & Lifestyle section:", homeContent.includes("Pilot Salary & Lifestyle") || homeContent.includes("Pilot Salary"));
console.log("Has For Parents section:", homeContent.includes("For Parents") || homeContent.includes("for-parents"));
console.log("Has Hero Stat 2500+ SSR state:", homeContent.includes("useState(2500)") || homeContent.includes("count = 2500"));
console.log("Hero CTA Button text:", homeContent.match(/Reserve Free Demo|Enrol Now|Explore Programs|Book a class/gi));
console.log("RTR vs RT&C in Homepage:", homeContent.includes("RTR") ? "Has RTR" : "No RTR", homeContent.includes("RT&C") ? "Has RT&C" : "No RT&C");

// 2. Layout SEO Audit
const layoutContent = fs.readFileSync('./src/app/layout.jsx', 'utf8');
console.log("\n--- LAYOUT (src/app/layout.jsx) ---");
console.log("Default title in layout:", layoutContent.match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1]);

// 3. Jobs Page Audit
const jobsContent = fs.readFileSync('./src/app/jobs/page.jsx', 'utf8');
console.log("\n--- JOBS PAGE (src/app/jobs/page.jsx) ---");
console.log("Jobs page content size:", jobsContent.length);
console.log("Has generateMetadata or metadata export:", jobsContent.includes('generateMetadata') || jobsContent.includes('metadata'));

// 4. Resources Page Audit
const resContent = fs.readFileSync('./src/app/resources/page.jsx', 'utf8');
console.log("\n--- RESOURCES PAGE (src/app/resources/page.jsx) ---");
console.log("Resources page size:", resContent.length);
console.log("Has metadata export:", resContent.includes('generateMetadata') || resContent.includes('metadata'));

// 5. CPL Page & Form Audit
const cplContent = fs.readFileSync('./src/app/courses/commercial-pilot-license-cpl/page.jsx', 'utf8');
console.log("\n--- CPL PAGE (src/app/courses/commercial-pilot-license-cpl/page.jsx) ---");
console.log("Thank-you text mentions 'cadet':", cplContent.includes("cadet registration") || cplContent.includes("cadet"));
console.log("Subjects list contains RTR:", cplContent.includes("RTR"));
console.log("Subjects list contains RT&C:", cplContent.includes("RT&C"));

// 6. MultiStepLeadForm Audit
const formContent = fs.readFileSync('./src/components/MultiStepLeadForm.jsx', 'utf8');
console.log("\n--- MULTI-STEP LEAD FORM (src/components/MultiStepLeadForm.jsx) ---");
console.log("Form thank you text:", formContent.match(/thank\s*you[^.]*\./i)?.[0]);
console.log("Has OTP verification:", formContent.includes("OTP") || formContent.includes("otp"));
console.log("Has CPL 2-step Q1 (80 Lakh):", formContent.includes("80 Lakh") || formContent.includes("afford"));

// 7. About Page Audit
const aboutContent = fs.readFileSync('./src/app/about/page.jsx', 'utf8');
console.log("\n--- ABOUT PAGE (src/app/about/page.jsx) ---");
console.log("Mentions Deepak Aggarwal:", aboutContent.includes("Deepak Aggarwal"));
console.log("Mentions Piyush Chandra:", aboutContent.includes("Piyush Chandra"));
console.log("Mentions Capt. Mukul Mitra Barua:", aboutContent.includes("Mukul Mitra Barua") || aboutContent.includes("Mukul Barua"));
console.log("Mentions Rajeet Khalsa:", aboutContent.includes("Rajeet Khalsa"));
console.log("Mentions Capt. Vishal Chechi:", aboutContent.includes("Vishal Chechi"));
console.log("Mentions 2009 timeline:", aboutContent.includes("2009"));

// 8. Cabin Crew Page Audit
const cabinContent = fs.readFileSync('./src/app/courses/cabin-crew-training/page.jsx', 'utf8');
console.log("\n--- CABIN CREW PAGE (src/app/courses/cabin-crew-training/page.jsx) ---");
console.log("Mentions Mukul Barua:", cabinContent.includes("Mukul"));
console.log("Mentions Rajeet Khalsa:", cabinContent.includes("Rajeet"));
console.log("Has Batch 1 Scholarship pricing:", cabinContent.includes("Scholarship") || cabinContent.includes("scholarship"));
console.log("Has 11 screening questions form:", cabinContent.includes("tattoo") || cabinContent.includes("knock knees"));

// 9. Contact Page Audit
const contactContent = fs.readFileSync('./src/app/contact/page.jsx', 'utf8');
console.log("\n--- CONTACT PAGE (src/app/contact/page.jsx) ---");
console.log("Has Phone 9953 777 320:", contactContent.includes("9953 777 320") || contactContent.includes("9953777320"));
console.log("Has Phone 98182 82209:", contactContent.includes("98182 82209") || contactContent.includes("9818282209"));
console.log("Has Office Hours (Mon-Sat 9:30-6:00):", contactContent.includes("9:30 AM") || contactContent.includes("9:30"));

// 10. Sticky Mobile CTA & Header Audit
const headerContent = fs.readFileSync('./src/components/Header.jsx', 'utf8');
console.log("\n--- HEADER (src/components/Header.jsx) ---");
console.log("Header has Phone number:", headerContent.includes("9953") || headerContent.includes("phone"));
console.log("Header dropdown has CPL pin:", headerContent.includes("CPL Ground School"));

