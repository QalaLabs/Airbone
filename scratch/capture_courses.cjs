const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const prefix = process.argv[2] || 'after';
const port = process.argv[3] || '3001';
const outputDir = "C:\\Users\\pc\\.gemini\\antigravity\\brain\\64848318-9c88-41bf-b33f-0b01c969e301\\screenshots";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function capture() {
  console.log(`Capturing courses section (prefix: ${prefix}, port: ${port})`);
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(3000);
  const desktopEl = await desktopPage.$('#courses');
  if (desktopEl) {
    const outPath = path.join(outputDir, `courses_desktop_${prefix}.png`);
    await desktopEl.screenshot({ path: outPath });
    console.log(`Saved: ${outPath}`);
  } else {
    console.error('Desktop: #courses section not found!');
  }
  await desktopCtx.close();

  // Mobile
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(3000);
  const mobileEl = await mobilePage.$('#courses');
  if (mobileEl) {
    const outPath = path.join(outputDir, `courses_mobile_${prefix}.png`);
    await mobileEl.screenshot({ path: outPath });
    console.log(`Saved: ${outPath}`);
  } else {
    console.error('Mobile: #courses section not found!');
  }
  await mobileCtx.close();

  await browser.close();
  console.log('Done!');
}

capture().catch(err => { console.error(err); process.exit(1); });
