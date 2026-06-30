'use strict';

require('dotenv').config();

const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3001;
const PDF_SERVICE_SECRET = process.env.PDF_SERVICE_SECRET;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));

// ─── Auth Middleware ──────────────────────────────────────────────────────────

/**
 * Validates the shared-secret header on every request to /generate.
 * Header: x-pdf-secret: <PDF_SERVICE_SECRET>
 */
function authenticate(req, res, next) {
  if (!PDF_SERVICE_SECRET) {
    console.error('[AUTH] PDF_SERVICE_SECRET is not set in environment. Refusing all requests.');
    return res.status(500).json({ error: 'Server misconfiguration: secret not set.' });
  }

  const provided = req.headers['x-pdf-secret'];

  if (!provided || provided !== PDF_SERVICE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing x-pdf-secret header.' });
  }

  next();
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'symbiosis-pdf-service', timestamp: new Date().toISOString() });
});

// ─── PDF Generation Endpoint ──────────────────────────────────────────────────

/**
 * POST /generate
 *
 * Request body (JSON):
 *   {
 *     html:     string  – Full HTML document to render
 *     filename: string  – Suggested filename (sent back in Content-Disposition)
 *   }
 *
 * Response:
 *   Binary PDF buffer with Content-Type: application/pdf
 */
app.post('/generate', authenticate, async (req, res) => {
  const { html, filename } = req.body;

  // ── Validate inputs ──────────────────────────────────────────────────────
  if (!html || typeof html !== 'string' || html.trim() === '') {
    return res.status(400).json({ error: 'Request body must contain a non-empty "html" string.' });
  }

  const safeFilename = (filename && typeof filename === 'string')
    ? filename.replace(/[^a-zA-Z0-9_\-. ]/g, '_')
    : 'payslip.pdf';

  let browser = null;

  try {
    // ── Launch Puppeteer ─────────────────────────────────────────────────
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',     // Prevents /dev/shm OOM crashes in Docker
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',            // Required in some containerised environments
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Disable navigation timeout; we control timing via waitUntil
    page.setDefaultNavigationTimeout(0);

    // ── Load HTML content ────────────────────────────────────────────────
    await page.setContent(html, {
      waitUntil: 'networkidle0',  // Wait until no network requests for 500 ms
    });

    // ── Generate PDF ─────────────────────────────────────────────────────
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      displayHeaderFooter: false,
      preferCSSPageSize: false,
    });

    // ── Send response ────────────────────────────────────────────────────
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store',
    });

    return res.end(pdfBuffer);

  } catch (err) {
    console.error('[/generate] PDF generation failed:', err);
    return res.status(500).json({ error: 'PDF generation failed.', detail: err.message });

  } finally {
    // Always close the browser, even if an error occurred
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('[/generate] Failed to close browser:', closeErr.message);
      }
    }
  }
});

// ─── 404 Catch-all ────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[GLOBAL ERROR]', err);
  res.status(500).json({ error: 'Internal server error.', detail: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[symbiosis-pdf-service] Listening on port ${PORT}`);
  if (!PDF_SERVICE_SECRET) {
    console.warn('[symbiosis-pdf-service] WARNING: PDF_SERVICE_SECRET is not set. All /generate requests will be rejected.');
  }
});

module.exports = app; // Export for testing
