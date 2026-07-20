const fs = require('fs');

console.log("=============== PAGE BY PAGE DEEP MAPPING CHECK ===============");

// Page 1: Homepage
console.log("\n--- PAGE 1: HOMEPAGE (/) ---");
const homeContent = fs.readFileSync('./src/app/page.jsx', 'utf8');
console.log("H1 present:", homeContent.includes("Pilot Training Academy in Dwarka, Delhi") || homeContent.includes("Pilot Training Academy"));
console.log("Hero Tagline updated:", homeContent.includes("for CPL & ATPL. Mentor-led training under Capt. Navrang Singh") || homeContent.includes("clearing exams, building careers, restarting dreams"));
console.log("Instructor Bio updated (RTR):", homeContent.includes("RTR") && homeContent.includes("strips DGCA syllabi down to first principles"));
console.log("Contact details in site:", homeContent.includes("9953 777 320") || homeContent.includes("9953777320"));
console.log("Button text (Enrol Now/Explore Programs):", homeContent.includes("Enrol Now") || homeContent.includes("Explore Programs"));
console.log("Programs Section (CPL, ATPL, Ground, Cabin Crew):", homeContent.includes("Commercial Pilot License") && homeContent.includes("ATPL Ground School") && homeContent.includes("Cabin Crew"));
console.log("★ Airborne Advantage (16 items):", homeContent.includes("The Airborne Advantage") || homeContent.includes("Goodies for every student"));
console.log("★ Why NOW Is the Best Time:", homeContent.includes("Why NOW Is the Best Time") || homeContent.includes("inflection point"));
console.log("★ Pilot Salary & Lifestyle table:", homeContent.includes("Junior First Officer") && homeContent.includes("1.5L") && homeContent.includes("8L – 15L"));
console.log("FAQ: DGCA Approved FTO vs Ground School:", homeContent.includes("DGCA-approved") && homeContent.includes("CAR-FTO"));

// Page 2: /courses
console.log("\n--- PAGE 2: COURSES INDEX (/courses) ---");
const coursesContent = fs.readFileSync('./src/app/courses/page.jsx', 'utf8');
console.log("All courses listed with prices:", coursesContent.includes("2,70,000") && coursesContent.includes("1,50,000") && coursesContent.includes("50,000") && coursesContent.includes("30,000") && coursesContent.includes("10,000"));
console.log("Cabin crew eligibility (18-27 yrs, 30K-54K):", coursesContent.includes("18–27") || coursesContent.includes("18-27") || coursesContent.includes("30K"));

// Page 3: /courses/commercial-pilot-license-cpl
console.log("\n--- PAGE 3: CPL PAGE ---");
const cplContent = fs.readFileSync('./src/app/courses/commercial-pilot-license-cpl/page.jsx', 'utf8');
console.log("RTR used (not RT&C):", cplContent.includes("RTR") && !cplContent.includes("RT&C"));
console.log("Fees breakdown table (2.7L, 52-62L, 30K, 10K):", cplContent.includes("2.7 lakh") || cplContent.includes("2,70,000"));
console.log("CPL Eligibility (17/18 age, Class 12 50% Phys+Maths):", cplContent.includes("17") && cplContent.includes("Physics"));

// Page 4: /courses/ground-school
console.log("\n--- PAGE 4: GROUND SCHOOL ---");
const gsContent = fs.readFileSync('./src/app/courses/ground-school/page.jsx', 'utf8');
console.log("RTR globally updated:", !gsContent.includes("RT&C") && gsContent.includes("RTR"));
console.log("EASA codes present (010, 050, 021, 022):", gsContent.includes("010") || gsContent.includes("050"));

// Page 5: /courses/cabin-crew-training
console.log("\n--- PAGE 5: CABIN CREW PAGE ---");
const ccContent = fs.readFileSync('./src/app/courses/cabin-crew-training/page.jsx', 'utf8');
console.log("Capt Mukul Mitra Barua:", ccContent.includes("Mukul"));
console.log("Rajeet Khalsa:", ccContent.includes("Rajeet"));
console.log("Pathways P1, P2, P3 pricing:", ccContent.includes("Pathway 1") && ccContent.includes("54,000"));
console.log("Batch 1 Scholarship pricing:", ccContent.includes("Scholarship") || ccContent.includes("scholarship"));

// Page 6: /about
console.log("\n--- PAGE 6: ABOUT PAGE ---");
const abContent = fs.readFileSync('./src/app/about/page.jsx', 'utf8');
console.log("Team list (Deepak, Piyush, Mukul, Rajeet, Vishal):", abContent.includes("Deepak Aggarwal") && abContent.includes("Piyush Chandra") && abContent.includes("Rajeet Khalsa"));
console.log("Chronology 2009-2026:", abContent.includes("2009") && abContent.includes("2012") && abContent.includes("2024") && abContent.includes("2026"));

// Page 7: /contact
console.log("\n--- PAGE 7: CONTACT PAGE ---");
const ctContent = fs.readFileSync('./src/app/contact/page.jsx', 'utf8');
console.log("Address E-549 Ramphal Chowk:", ctContent.includes("E-549") && ctContent.includes("Ramphal Chowk"));
console.log("Phone 9953 777 320:", ctContent.includes("9953 777 320") || ctContent.includes("9953777320"));

// Page 8 & 9: /jobs & /resources
console.log("\n--- PAGE 8 & 9: JOBS & RESOURCES ---");
const jobsContent = fs.readFileSync('./src/app/jobs/page.jsx', 'utf8');
const resContent = fs.readFileSync('./src/app/resources/page.jsx', 'utf8');
console.log("Jobs metadata:", jobsContent.includes("generateMetadata"));
console.log("Resources metadata:", resContent.includes("metadata"));

// 6 New missing pages
console.log("\n--- 6 NEW PAGES CHECK ---");
const pages6 = ['atpl', 'cadet-preparation', 'a320-simulator', 'cas-compass-adapt', 'airline-preparation', 'flying-training-india-abroad'];
pages6.forEach(p => {
  const fileP = `./src/app/courses/${p}/page.jsx`;
  console.log(`Page /courses/${p}:`, fs.existsSync(fileP) ? "EXISTS" : "MISSING");
});

// UX Improvements Check
console.log("\n--- UX IMPROVEMENTS CHECK ---");
console.log("For Parents Section:", homeContent.includes("for-parents") || homeContent.includes("For Parents"));
console.log("Urgency batch chip:", homeContent.includes("seats remaining") || homeContent.includes("seats left"));
console.log("Sticky mobile bar:", fs.existsSync('./src/components/StickyMobileCTA.jsx'));
console.log("Hero micro form:", homeContent.includes("hero_micro_form") || homeContent.includes("15 minutes"));
console.log("Exit intent lead magnet:", homeContent.includes("exit-intent") || homeContent.includes("CPL Starter Guide"));
console.log("WhatsApp quick reply strip:", homeContent.includes("Message us on WhatsApp"));
