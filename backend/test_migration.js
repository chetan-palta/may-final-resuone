const http = require('http');

async function runTests() {
  console.log('--- ResuOne Backend Verification Suite ---');

  // Set environment variables for production simulation
  process.env.PORT = '5999';
  process.env.BASE_URL = 'https://may-final-resuone.onrender.com';
  process.env.FRONTEND_URL = 'https://resuone.vercel.app';
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'test_jwt_secret_12345';
  process.env.GOOGLE_CLIENT_ID = '67693100136-4guqlhu2dodr82gngrueus53sii1cvod.apps.googleusercontent.com';

  // Import compiled server
  const server = require('./dist/server.js');

  // Wait for server to start listening
  await new Promise(resolve => setTimeout(resolve, 1500));

  let passed = 0;
  let total = 0;

  function assert(condition, name, details) {
    total++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - Details:`, details);
    }
  }

  // Helper for HTTP requests
  function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }

  try {
    // 1. Health check test: GET /api/health
    const healthRes = await makeRequest({
      hostname: 'localhost',
      port: 5999,
      path: '/api/health',
      method: 'GET'
    });
    assert(healthRes.statusCode === 200, 'GET /api/health returns 200 OK', healthRes.body);
    const healthJson = JSON.parse(healthRes.body);
    assert(healthJson.status === 'ok', 'Health status is ok', healthJson);

    // 2. Health check test: GET /health
    const rootHealthRes = await makeRequest({
      hostname: 'localhost',
      port: 5999,
      path: '/health',
      method: 'GET'
    });
    assert(rootHealthRes.statusCode === 200, 'GET /health returns 200 OK', rootHealthRes.body);

    // 3. CORS check for https://resuone.vercel.app
    const corsRes = await makeRequest({
      hostname: 'localhost',
      port: 5999,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Origin': 'https://resuone.vercel.app'
      }
    });
    assert(
      corsRes.headers['access-control-allow-origin'] === 'https://resuone.vercel.app',
      'CORS allows https://resuone.vercel.app origin',
      corsRes.headers
    );
    assert(
      corsRes.headers['access-control-allow-credentials'] === 'true',
      'CORS credentials enabled',
      corsRes.headers
    );

    // 4. Critical Google OAuth URL generation test
    const googleRes = await makeRequest({
      hostname: 'localhost',
      port: 5999,
      path: '/api/auth/google?returnTo=https://resuone.vercel.app',
      method: 'GET'
    });
    assert(googleRes.statusCode === 302, 'Google OAuth initiation redirects (302)', googleRes.statusCode);
    const redirectLocation = googleRes.headers['location'];
    assert(!!redirectLocation, 'Location header is present', redirectLocation);

    const redirectUrl = new URL(redirectLocation);
    const clientIdParam = redirectUrl.searchParams.get('client_id');
    const redirectUriParam = redirectUrl.searchParams.get('redirect_uri');
    const stateParam = redirectUrl.searchParams.get('state');

    assert(
      clientIdParam === '67693100136-4guqlhu2dodr82gngrueus53sii1cvod.apps.googleusercontent.com',
      'OAuth client_id matches existing client',
      clientIdParam
    );
    assert(
      redirectUriParam === 'https://may-final-resuone.onrender.com/api/auth/google/callback',
      'OAuth redirect_uri matches EXACT Google Cloud Console authorized redirect URI: https://may-final-resuone.onrender.com/api/auth/google/callback',
      redirectUriParam
    );
    assert(
      stateParam === 'https://resuone.vercel.app',
      'OAuth state retains sanitized frontend return origin',
      stateParam
    );

    // 5. Open redirect prevention test: arbitrary evil returnTo
    const evilGoogleRes = await makeRequest({
      hostname: 'localhost',
      port: 5999,
      path: '/api/auth/google?returnTo=https://evil-attacker.com',
      method: 'GET'
    });
    const evilLocation = new URL(evilGoogleRes.headers['location']);
    assert(
      evilLocation.searchParams.get('state') === 'https://resuone.vercel.app',
      'Open redirect rejected: evil origin falls back to authorized frontend origin',
      evilLocation.searchParams.get('state')
    );

    // 6. AI Analysis endpoint test: POST /api/ai/analyze
    const sampleResumeData = {
      projects: [
        { title: 'Portfolio Website', description: 'Built responsive web application using React and Tailwind CSS' }
      ],
      experience: [
        { role: 'Software Intern', company: 'Tech Corp', bulletPoints: ['Developed REST APIs using Node.js and Express'] }
      ],
      skills: [{ name: 'Languages', items: 'JavaScript, TypeScript, Python' }],
      summary: 'Passionate full-stack developer with experience in modern web technologies.',
      targetRole: 'Full Stack Developer'
    };
    const aiRes = await makeRequest({
      hostname: 'localhost',
      port: 5999,
      path: '/api/ai/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(sampleResumeData));
    assert(aiRes.statusCode === 200, 'POST /api/ai/analyze returns 200 OK', aiRes.statusCode);
    const aiJson = JSON.parse(aiRes.body);
    assert(typeof aiJson.resumeScore === 'number', 'AI resume score computed', aiJson.resumeScore);
    assert(Array.isArray(aiJson.suggestions), 'AI suggestions array returned', aiJson.suggestions);

    // 7. Direct Export Debug endpoint test: POST /api/resumes/export-direct?debug=true
    const exportDebugRes = await makeRequest({
      hostname: 'localhost',
      port: 5999,
      path: '/api/resumes/export-direct?debug=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(sampleResumeData));
    assert(exportDebugRes.statusCode === 200, 'POST /api/resumes/export-direct?debug=true returns 200', exportDebugRes.statusCode);
    const exportJson = JSON.parse(exportDebugRes.body);
    assert(
      exportJson.renderUrl && exportJson.renderUrl.includes('https://resuone.vercel.app/render/temp-'),
      'Direct export returns valid render URL pointing to Vercel frontend',
      exportJson.renderUrl
    );

    console.log(`\nVerification Complete: ${passed}/${total} checks passed.`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
