const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = 'http://localhost:5173/preview-test';
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  // Match html2canvas scale=2 by using deviceScaleFactor 2 for screenshots
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
  console.log('Opening page', url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for preview element (use class in case id isn't present immediately)
  await page.waitForSelector('.a4-container, #resume-preview', { timeout: 30000 });
  const el = await page.$('#resume-preview') || await page.$('.a4-container');
  if (!el) {
    console.error('Preview element not found');
    await browser.close();
    process.exit(2);
  }

  // Take element screenshot
  const previewPath = 'backend/tests/out/preview.png';
  fs.mkdirSync('backend/tests/out', { recursive: true });
  await el.screenshot({ path: previewPath });
  console.log('Saved preview screenshot to', previewPath);

  // Call captureExportCanvas helper
  const dataUrl = await page.evaluate(async () => {
    // @ts-ignore
    if (window.__captureExportCanvas) return await window.__captureExportCanvas();
    return null;
  });

  if (!dataUrl) {
    console.error('Could not capture export canvas (helper missing)');
    await browser.close();
    process.exit(3);
  }

  const canvasPath = 'backend/tests/out/export_canvas.png';
  const base64 = dataUrl.split(',')[1];
  fs.writeFileSync(canvasPath, Buffer.from(base64, 'base64'));
  console.log('Saved export canvas image to', canvasPath);

  // Compare raw bytes quickly
  const a = fs.readFileSync(previewPath);
  const b = fs.readFileSync(canvasPath);
  const equal = a.equals(b);
  console.log('Byte-equality of preview vs export canvas:', equal);

  if (!equal) {
    console.error('Mismatch detected: Preview PNG and export canvas PNG differ.');
    console.error('You should visually inspect backend/tests/out/preview.png and export_canvas.png');
    await browser.close();
    process.exit(4);
  }

  console.log('Preview and export canvas are byte-identical.');
  await browser.close();
  process.exit(0);
})();
