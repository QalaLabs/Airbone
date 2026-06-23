const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const prefix = process.argv[2] || 'before';
const port = process.argv[3] || '3001';
const outputDir = "C:\\Users\\pc\\.gemini\\antigravity\\brain\\64848318-9c88-41bf-b33f-0b01c969e301\\screenshots";

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function capture() {
  console.log(`Starting screenshot capture for prefix: ${prefix} on port: ${port}`);
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);
  
  const desktopAdvantage = await desktopPage.$('#advantage');
  if (desktopAdvantage) {
    const outputPath = path.join(outputDir, `advantage_desktop_${prefix}.png`);
    await desktopAdvantage.screenshot({ path: outputPath });
    console.log(`Saved desktop screenshot to ${outputPath}`);
  } else {
    console.error('Could not find #advantage section on desktop!');
  }
  await desktopContext.close();

  // 2. Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  
  const mobileAdvantage = await mobilePage.$('#advantage');
  if (mobileAdvantage) {
    const outputPath = path.join(outputDir, `advantage_mobile_${prefix}.png`);
    await mobileAdvantage.screenshot({ path: outputPath });
    console.log(`Saved mobile screenshot to ${outputPath}`);
  } else {
    console.error('Could not find #advantage section on mobile!');
  }
  await mobileContext.close();

  await browser.close();
  console.log('Capture completed!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
