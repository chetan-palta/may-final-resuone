import puppeteer from "puppeteer";
import { renderHtml } from "../utils/template";
import { ResumeData } from "../types/resume";

const getExecutablePath = (): string | undefined => {
  // Allow an explicit override via env in dev only. Do NOT hardcode OS-specific paths.
  // In production, undefined lets puppeteer use its bundled Chromium.
  return process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || process.env.PUPPETEER_CHROME_PATH || undefined;
};

export const generatePdf = async (data: ResumeData): Promise<Buffer> => {
  let browser;

  try {
    // Launch with environment-aware config. Do not ship hardcoded Windows paths.
    const execPath = getExecutablePath();
    const launchArgs = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
    browser = await puppeteer.launch({
      headless: true,
      ...(execPath ? { executablePath: execPath } : {}),
      args: launchArgs,
    });

    const page = await browser.newPage();
    // Ensure Puppeteer viewport matches preview dimensions (A4 pixel equivalent)
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    const html = renderHtml(data);

    await page.setContent(html, {
      waitUntil: "load",
    });

    // CRITICAL: Wait for ALL fonts to be loaded and ready before PDF generation
    await page.evaluateHandle("document.fonts.ready");
    
    // Additional wait to ensure fonts are fully rendered in the DOM
    await page.waitForFunction(() => {
      return (document as any).fonts?.status === 'loaded';
    }, { timeout: 5000 }).catch(() => {
      // Font loading didn't complete, but continue anyway
      console.warn('Font loading timeout, continuing with PDF generation');
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (browser) await browser.close();
    throw error;
  }
};

export const generatePdfFromUrl = async (url: string): Promise<Buffer> => {
  let browser;
  try {
    const execPath2 = getExecutablePath();
    const launchArgs2 = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
    browser = await puppeteer.launch({
      headless: true,
      ...(execPath2 ? { executablePath: execPath2 } : {}),
      args: launchArgs2,
    });

    const page = await browser.newPage();
    // Match preview viewport exactly
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for the preview container to be present (SPA hydration)
    await page.waitForSelector('#resume-preview, .a4-container', { timeout: 15000 }).catch(() => {
      console.warn('Preview container not found within timeout; continuing');
    });

    // Force screen media so preview (screen) CSS is used instead of print CSS
    await page.emulateMediaType('screen').catch(() => {});

    // CRITICAL: Wait for ALL fonts to be loaded and ready before PDF generation
    // This ensures the PDF uses the exact same typography as the preview
    await page.evaluateHandle('document.fonts.ready');
    
    // Additional wait to ensure fonts are fully rendered in the DOM
    await page.waitForFunction(() => {
      return (document as any).fonts?.status === 'loaded';
    }, { timeout: 5000 }).catch(() => {
      // Font loading didn't complete, but continue anyway
      console.warn('Font loading timeout, continuing with PDF generation');
    });

    // Ensure the resume container is present and measure its size so we render
    // the PDF using the exact same content box as the live preview.
    const container = await page.$('.a4-container') || await page.$('#resume-preview');
    if (container) {
      const box = await container.boundingBox();
      if (box) {
        // Set viewport to the container size so layout matches the preview
        await page.setViewport({ width: Math.ceil(box.width), height: Math.ceil(box.height), deviceScaleFactor: 1 });

        // Generate PDF sized to the container box to match preview layout
        const pdfBuffer = await page.pdf({
          printBackground: true,
          preferCSSPageSize: false,
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
          width: `${Math.ceil(box.width)}px`,
          height: `${Math.ceil(box.height)}px`
        });

        await browser.close();
        return Buffer.from(pdfBuffer);
      }
    }

    // Fallback: default A4 PDF generation
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('PDF from URL failed:', error);
    if (browser) await browser.close();
    throw error;
  }
};