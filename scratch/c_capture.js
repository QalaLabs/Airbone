const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/pc/.gemini/antigravity/brain/167bb108-34db-4e97-bfe0-7209682f0d60';
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('Starting screenshot captures...');
  const browser = await chromium.launch({ headless: true });

  // 1. Full Homepage Desktop (1920x1080)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(3000); // Wait for load and potential animations
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'homepage_desktop.png'), fullPage: true });
    console.log('Captured homepage_desktop.png');
    await context.close();
  }

  // 2. Full Homepage Mobile (390x844)
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'homepage_mobile.png'), fullPage: true });
    console.log('Captured homepage_mobile.png');
    await context.close();
  }

  // 3. About Page Desktop
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/about`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'about_desktop.png'), fullPage: true });
    console.log('Captured about_desktop.png');
    await context.close();
  }

  // 4. Courses Page Desktop
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/courses`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'courses_desktop.png'), fullPage: true });
    console.log('Captured courses_desktop.png');
    await context.close();
  }

  // 5. DGCA CPL detail page Desktop
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/courses/cpl-ground-classes`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cpl_detail_desktop.png'), fullPage: true });
    console.log('Captured cpl_detail_desktop.png');
    await context.close();
  }

  // 6. Jobs page Desktop
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/jobs`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'jobs_desktop.png'), fullPage: true });
    console.log('Captured jobs_desktop.png');
    await context.close();
  }

  // 7. Resources page Desktop
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/resources`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'resources_desktop.png'), fullPage: true });
    console.log('Captured resources_desktop.png');
    await context.close();
  }

  // 8. Contact page Desktop
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'contact_desktop.png'), fullPage: true });
    console.log('Captured contact_desktop.png');
    await context.close();
  }

  // WALKTHROUGH VIDEO
  console.log('Starting walkthrough video recording...');
  const videoTempDir = path.join(__dirname, 'video_temp');
  if (!fs.existsSync(videoTempDir)) {
    fs.mkdirSync(videoTempDir, { recursive: true });
  }

  const videoContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: videoTempDir,
      size: { width: 1280, height: 800 }
    }
  });

  const page = await videoContext.newPage();

  // Walkthrough steps:
  // 1. Navigate to homepage
  console.log('Step 1: Homepage');
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(3000);

  // 2. Go to Courses
  console.log('Step 2: Courses');
  await page.click('header .nav-link[href="/courses"]');
  await page.waitForURL(`${BASE_URL}/courses`);
  await page.waitForTimeout(3000);

  // 3. Go to DGCA CPL Page
  console.log('Step 3: DGCA CPL Page');
  await page.click('.cpl-hero-banner a[href="/courses/cpl-ground-classes"]');
  await page.waitForURL(`${BASE_URL}/courses/cpl-ground-classes`);
  await page.waitForTimeout(3000);

  // 4. Download Syllabus / Lead Form Submission / Success Toast
  console.log('Step 4: Scroll to form');
  await page.evaluate(() => {
    document.querySelector('.modal-form')?.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);

  console.log('Step 5: Fill Lead Form');
  await page.fill('#lead-name', 'Test Cadet Pilot');
  await page.fill('#lead-phone', '+91 9999999999');
  await page.fill('#lead-email', 'cadet.test@airborne.aero');
  await page.waitForTimeout(2000);

  console.log('Step 6: Submit form');
  await page.click('#lead-submit-btn');
  
  // Wait for submission response and success toast
  await page.waitForTimeout(4000); 

  // 5. Navigate to Contact Page
  console.log('Step 7: Contact Page');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);
  await page.click('header .nav-cta[href="/contact"]');
  await page.waitForURL(`${BASE_URL}/contact`);
  await page.waitForTimeout(3000);

  console.log('Closing browser and finalizing video...');
  await videoContext.close();
  await browser.close();

  // Find the generated video file and move it to artifacts
  const files = fs.readdirSync(videoTempDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
    const srcPath = path.join(videoTempDir, videoFile);
    const destPath = path.join(ARTIFACT_DIR, 'walkthrough_video.webm');
    fs.copyFileSync(srcPath, destPath);
    console.log(`Video saved to: ${destPath}`);
    fs.unlinkSync(srcPath);
    fs.rmdirSync(videoTempDir);
  } else {
    console.error('No video file recorded!');
  }
}

run().catch(err => {
  console.error('Error during execution:', err);
  process.exit(1);
});
