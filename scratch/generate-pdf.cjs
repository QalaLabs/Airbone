const fs = require('fs');

function buildPdf() {
  const pages = [
    [
      'AIRBORNE AVIATION ACADEMY',
      'CABIN CREW STARTER KIT (FREE PREVIEW)',
      '--------------------------------------------------------------------------------',
      '',
      'Welcome to the official Cabin Crew Starter Kit preview from Airborne Aviation Academy.',
      'This starter guide gives you a sneak peek into the exact manual our cabin crew trainees',
      'study from Day 1 at our Dwarka, New Delhi campus.',
      '',
      'WHAT THIS PREVIEW COVERS:',
      '  1. Essential Aviation Terminology & In-Flight Glossary',
      '  2. The ICAO Aviation Phonetic Alphabet & Communication Codes',
      '  3. Milestones in Indian Aviation History (1932 to Present)',
      '  4. Complete Curriculum Breakdown of the 3-6 Month Program',
      '',
      'Taught by seasoned airline veterans:',
      '  * Capt. Mukul Mitra Barua (Ex-Alliance Air Cabin & Cockpit Crew)',
      '  * Rajeet Khalsa (Retired AGM Training, Air India - 37+ Years Experience)',
      '',
      'Visit: airborneaviation.in | Contact: +91 9953 777 320 | Dwarka, New Delhi'
    ],
    [
      'SECTION 1: ESSENTIAL AVIATION TERMINOLOGY',
      '--------------------------------------------------------------------------------',
      '',
      '* AFT: The rear or tail section of the aircraft cabin.',
      '* FORWARD (FWD): The front portion of the aircraft, near the flight deck.',
      '* GALLEY: The kitchen area of an aircraft where meals and beverages are prepared.',
      '* BULKHEAD: A dividing wall separating different sections or cabins (e.g., Business & Economy).',
      '* CROSSCHECK: Verification by cabin crew that doors are armed or disarmed properly.',
      '* DEPLANING: The process of passengers exiting the aircraft after landing.',
      '* STERILE COCKPIT: Regulatory period below 10,000 feet where no non-essential communication',
      '  between cabin crew and flight deck is permitted.',
      '* TURBULENCE: Irregular atmospheric air motion categorized as Light, Moderate, or Severe.',
      '* ZULU TIME (UTC): Universal Coordinated Time standard used across global aviation.',
      '* AVSEC: Aviation Security protocols governed by the Bureau of Civil Aviation Security (BCAS).',
      '* DGR: Dangerous Goods Regulations defining hazardous cargo and carriage rules.',
      '* PAX: Universal airline abbreviation for passengers.'
    ],
    [
      'SECTION 2: THE ICAO PHONETIC ALPHABET & COMMUNICATION',
      '--------------------------------------------------------------------------------',
      '',
      'Aviation relies on the International Civil Aviation Organization (ICAO) phonetic',
      'alphabet to eliminate misunderstandings over radios and interphones.',
      '',
      '  A - ALPHA        H - HOTEL        O - OSCAR        V - VICTOR',
      '  B - BRAVO        I - INDIA        P - PAPA         W - WHISKEY',
      '  C - CHARLIE      J - JULIETT      Q - QUEBEC       X - X-RAY',
      '  D - DELTA        K - KILO         R - ROMEO        Y - YANKEE',
      '  E - ECHO         L - LIMA         S - SIERRA       Z - ZULU',
      '  F - FOXTROT      M - MIKE         T - TANGO',
      '  G - GOLF         N - NOVEMBER     U - UNIFORM',
      '',
      'CABIN CREW PUBLIC ANNOUNCEMENT (PA) PRACTICE PROTOCOL:',
      '  - Speak at an even tempo of 120-140 words per minute.',
      '  - Pitch voice slightly lower than conversational tone to avoid microphone distortion.',
      '  - Maintain warm, authoritative clarity during safety and welcome briefings.'
    ],
    [
      'SECTION 3: INDIAN AVIATION & FULL MANUAL OVERVIEW',
      '--------------------------------------------------------------------------------',
      '',
      'MILESTONES IN INDIAN AVIATION:',
      '  * 1932: J.R.D. Tata pilots the first historic commercial flight from Karachi to Bombay.',
      '  * 1953: Air Corporations Act nationalizes domestic airlines into Indian Airlines & Air India.',
      '  * 1994: Air Corporation Repeal Act opens skies to scheduled private carriers.',
      '  * Today: India is the 3rd largest and fastest growing domestic civil aviation market.',
      '',
      'WHAT THE FULL AIRBORNE USER MANUAL & COURSE COVERS:',
      '  [Module 1] Aviation Fundamentals & Aircraft Familiarisation (A320 / B737 layouts)',
      '  [Module 2] Personal Grooming, Skin/Hair Care & Airline Uniform Etiquette',
      '  [Module 3] Public Speaking, Voice Modulation & In-Flight PA Briefings',
      '  [Module 4] Safety Equipment, Fire-fighting & Mock Evacuation Drills',
      '  [Module 5] First Aid, CPR, Choking & In-Flight Medical Emergencies',
      '  [Module 6] World-class Hospitality, VIP Handling & Conflict De-escalation',
      '  [Module 7] Group Discussion (GD), Personal Interview (PI) & Airline Mock Selection',
      '',
      'Enrollment / Scholarship queries: admissions@airborneaviation.in | +91 9953 777 320'
    ]
  ];

  const contentObjStreams = [];
  for (let i = 0; i < pages.length; i++) {
    const lines = pages[i];
    let streamLines = ['BT', '/F1 10 Tf', '15 TL', '50 740 Td'];
    for (let l = 0; l < lines.length; l++) {
      let line = lines[l].replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      if (l === 0) {
        streamLines.push('/F2 13 Tf');
        streamLines.push('(' + line + ') Tj');
        streamLines.push('T*');
        streamLines.push('/F1 10 Tf');
      } else {
        streamLines.push('(' + line + ') Tj');
        streamLines.push('T*');
      }
    }
    streamLines.push('ET');
    contentObjStreams.push(streamLines.join('\n'));
  }

  let objIndex = 1;
  const catalogId = objIndex++;
  const pagesId = objIndex++;
  const fontF1Id = objIndex++;
  const fontF2Id = objIndex++;

  const pageIds = [];
  const contentIds = [];

  for (let i = 0; i < pages.length; i++) {
    pageIds.push(objIndex++);
    contentIds.push(objIndex++);
  }

  const pdfParts = [];
  pdfParts.push('%PDF-1.4\n');

  const offsets = {};
  let currentOffset = Buffer.byteLength(pdfParts[0], 'utf8');

  function recordObj(id, str) {
    offsets[id] = currentOffset;
    const chunk = id + ' 0 obj\n' + str + '\nendobj\n';
    currentOffset += Buffer.byteLength(chunk, 'utf8');
    return chunk;
  }

  pdfParts.push(recordObj(catalogId, '<< /Type /Catalog /Pages ' + pagesId + ' 0 R >>'));
  pdfParts.push(recordObj(pagesId, '<< /Type /Pages /Kids [' + pageIds.map(id => id + ' 0 R').join(' ') + '] /Count ' + pageIds.length + ' >>'));
  pdfParts.push(recordObj(fontF1Id, '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'));
  pdfParts.push(recordObj(fontF2Id, '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>'));

  for (let i = 0; i < pages.length; i++) {
    const pId = pageIds[i];
    const cId = contentIds[i];
    const stream = contentObjStreams[i];
    const streamLen = Buffer.byteLength(stream, 'utf8');
    pdfParts.push(recordObj(pId, '<< /Type /Page /Parent ' + pagesId + ' 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ' + fontF1Id + ' 0 R /F2 ' + fontF2Id + ' 0 R >> >> /Contents ' + cId + ' 0 R >>'));
    pdfParts.push(recordObj(cId, '<< /Length ' + streamLen + ' >>\nstream\n' + stream + '\nendstream'));
  }

  const xrefOffset = currentOffset;
  let xref = 'xref\n0 ' + (objIndex) + '\n0000000000 65535 f \n';
  for (let i = 1; i < objIndex; i++) {
    const off = String(offsets[i]).padStart(10, '0');
    xref += off + ' 00000 n \n';
  }
  xref += 'trailer\n<< /Size ' + objIndex + ' /Root ' + catalogId + ' 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n';
  pdfParts.push(xref);

  return pdfParts.join('');
}

const path = require('path');
const outputPath = path.resolve(__dirname, '../public/documents/cabin-crew-starter-kit.pdf');
fs.writeFileSync(outputPath, buildPdf(), 'utf8');
console.log('PDF written successfully. Size:', fs.statSync(outputPath).size);
