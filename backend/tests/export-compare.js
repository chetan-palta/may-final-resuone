const puppeteer = require('puppeteer');
const fs = require('fs');

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  || process.env.CHROME_PATH
  || process.env.PUPPETEER_CHROME_PATH
  || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  // Auto-detect frontend port by probing common Vite ports
  let frontendUrl = null;
  for (const port of [5173, 5174, 5175]) {
    try {
      const testRes = await fetch(`http://localhost:${port}/preview-test`, { method: 'HEAD', timeout: 1000 });
      frontendUrl = `http://localhost:${port}`;
      console.log(`Detected frontend on port ${port}`);
      break;
    } catch (e) {
      // Try next port
    }
  }
  if (!frontendUrl) {
    console.error('Frontend not found on any expected port (5173-5175)');
    process.exit(1);
  }
  const url = frontendUrl + '/preview-test';
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  // Match html2canvas scale=2 by using deviceScaleFactor 2 for screenshots
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
  console.log('Opening page', url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Debug: check what's on the page
  const bodyContent = await page.content();
  const hasPreview = bodyContent.includes('resume-preview') || bodyContent.includes('a4-container');
  console.log(`[DEBUG] Page has preview element: ${hasPreview}`);
  
  // Wait for preview element with increased timeout
  await page.waitForSelector('#resume-preview', { timeout: 60000 }).catch(async () => {
    console.log('[DEBUG] #resume-preview not found, trying .a4-container');
    await page.waitForSelector('.a4-container', { timeout: 30000 });
  });
  
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
  // Request server-side export endpoint in debug mode so it leaves a temporary renderable resume
  console.log('Posting to backend export-direct (debug)');
  const sampleData = {
    personalDetails: { fullName: 'Test User', email: 'test@example.com', phone: '1234567890', location: 'Remote' },
    summary: 'This is a test summary to validate PDF export rendering and layout consistency across multiple sections.',
    education: [{ id: 'e1', degree: 'B.Sc Computer Science', institution: 'Test University', startDate: '2019', endDate: '2023', location: 'Test City', score: '8.5', scoreType: 'CGPA' }],
    skills: [{ id: 's1', name: 'Languages', items: 'Python, JavaScript, C++' }, { id: 's2', name: 'Tools', items: 'Docker, Git, AWS' }],
    projects: [{ id: 'p1', title: 'Project Alpha', technologies: 'React, Node', link: '', github: '', date: 'Dec 2025', description: 'An example long project description intended to test wrapping behavior in both preview and export. '.repeat(6) }],
    experience: [{ id: 'x1', company: 'ACME Corp', role: 'Software Engineer', startDate: 'May 2023', endDate: 'Present', location: 'Remote', type: 'Full-time', bulletPoints: ['Implemented feature X with performance improvements', 'Led migration to new infra', 'Wrote comprehensive tests and documentation'] }],
    extraCurricular: ['Volunteer contributor to open source projects', 'Organizer of local meetup group'],
    certifications: [{ id: 'c1', title: 'ML for Data Science Projects', issuer: 'IBM SkillsBuild', date: '2024' }]
  };
  sampleData.debug = true;

  const backendApi = 'http://localhost:5000';
  const resp = await page.evaluate(async (data, backendApi) => {
    try {
      const res = await fetch(backendApi + '/api/resumes/export-direct?debug=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        return { ok: res.ok, status: res.status, renderUrl: json.renderUrl, body: JSON.stringify(json) };
      }
      const text = await res.text();
      return { ok: res.ok, status: res.status, renderUrl: res.headers.get('X-Render-Url'), body: text };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }, sampleData, backendApi);

  if (!resp || !resp.ok || !resp.renderUrl) {
    console.error('Export-direct debug request failed or did not return render URL');
    console.error('Response:', resp);
    await browser.close();
    process.exit(5);
  }

  console.log('Render URL provided by backend:', resp.renderUrl);
  // If backend returned a remote/production URL, rewrite to local dev frontend (using detected port)
  let renderUrl = resp.renderUrl;
  try {
    const parsed = new URL(renderUrl);
    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      const localFrontend = process.env.FRONTEND_URL || frontendUrl;
      const local = new URL(localFrontend);
      local.pathname = parsed.pathname;
      local.search = parsed.search;
      renderUrl = local.toString();
      console.log('Rewrote renderUrl to local dev:', renderUrl);
    }
  } catch (e) {
    console.warn('Could not parse renderUrl, using as-is:', renderUrl);
  }

  // Open the render URL and take a screenshot of the same element
  const renderPage = await browser.newPage();
  await renderPage.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
      // Verify backend has the temp resume available
      try {
        const parsedLocal = new URL(renderUrl);
        const tempId = parsedLocal.pathname.split('/').pop();
        const checkRes = await fetch(backendApi + '/api/resumes/' + tempId);
        const checkText = await checkRes.text();
        console.log('Backend resume fetch status:', checkRes.status, 'body:', checkText.slice(0, 200));
      } catch (e) {
        console.warn('Backend resume check failed', e);
      }

      await renderPage.goto(renderUrl, { waitUntil: 'networkidle2' });
  try {
    await renderPage.waitForSelector('#resume-preview, .a4-container', { timeout: 15000 });
  } catch (waitErr) {
    console.error('Preview element selector not found on render page — capturing debug artifacts');
    const debugHtml = await renderPage.content();
    fs.writeFileSync('backend/tests/out/render_page.html', debugHtml);
    await renderPage.screenshot({ path: 'backend/tests/out/render_full.png', fullPage: true });
    console.log('Wrote backend/tests/out/render_page.html and render_full.png for inspection');
    await browser.close();
    process.exit(6);
  }
  const renderEl = await renderPage.$('#resume-preview') || await renderPage.$('.a4-container');
  const exportPath = 'backend/tests/out/export_canvas.png';
  if (renderEl) {
    await renderEl.screenshot({ path: exportPath });
    console.log('Saved server-rendered export screenshot to', exportPath);
  } else {
    await renderPage.screenshot({ path: exportPath, fullPage: true });
    console.log('Saved full-page server-rendered export screenshot to', exportPath);
  }

  // Compare raw bytes quickly
  const a = fs.readFileSync(previewPath);
  const b = fs.readFileSync(exportPath);
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
