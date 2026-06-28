const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/pc/.gemini/antigravity/brain/66b24032-06a0-431e-84d4-55628f904fb9';
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('Starting success section screenshot captures...');
  const browser = await chromium.launch({ headless: true });

  // Make sure artifact dir exists
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  // 1. Desktop Viewport (1920x1080)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(2000);
    
    // Find the Success Stories section header and scroll it into view
    const heading = page.locator('h2:has-text("Faces on the")');
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Wait for any hover/animations to settle
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'success_desktop.png') });
    console.log('Captured success_desktop.png');
    await context.close();
  }

  // Mobile Viewports
  const viewports = [
    { name: 'success_mobile_360.png', width: 360, height: 640 },
    { name: 'success_mobile_375.png', width: 375, height: 812 },
    { name: 'success_mobile_390.png', width: 390, height: 844 },
    { name: 'success_mobile_412.png', width: 412, height: 915 },
    { name: 'success_mobile_430.png', width: 430, height: 932 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(2000);
    
    const heading = page.locator('h2:has-text("Faces on the")');
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, vp.name) });
    console.log(`Captured ${vp.name}`);
    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
