const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const runAudit = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  const outputDir = path.join('C:', 'Users', 'pc', '.gemini', 'antigravity', 'brain', '64848318-9c88-41bf-b33f-0b01c969e301', 'scratch');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const viewports = [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 430, height: 932 }
  ];

  for (const vp of viewports) {
    const page = await context.newPage();
    await page.setViewportSize(vp);
    
    // Go to homepage
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    
    // Take a full page screenshot
    const shotPathFull = path.join(outputDir, `footer_audit_full_${vp.width}px.png`);
    await page.screenshot({ path: shotPathFull, fullPage: true });
    
    // Scroll to the footer bottom and capture viewport for sticky CTA check
    await page.locator('footer').evaluate(node => node.scrollIntoView({ block: 'end' }));
    await page.waitForTimeout(1000);
    const shotPathViewport = path.join(outputDir, `footer_audit_viewport_${vp.width}px.png`);
    await page.screenshot({ path: shotPathViewport });
    
    console.log(`Saved screenshots for ${vp.width}px`);
    
    await page.close();
  }

  await browser.close();
};

runAudit().catch(console.error);
