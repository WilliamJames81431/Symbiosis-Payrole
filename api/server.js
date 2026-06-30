'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { limiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const complianceRoutes = require('./routes/compliance');
const storageRoutes = require('./routes/storage');
const pdfRoutes = require('./routes/pdf');
const organizationRoutes = require('./routes/organizations');

const app = express();

// ----------------------------------------------------------------
// Security: Helmet (sets various HTTP headers)
// ----------------------------------------------------------------
app.use(helmet());

// ----------------------------------------------------------------
// CORS — allow origins from env var (comma-separated list)
// ----------------------------------------------------------------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server calls (no origin) and explicitly listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ----------------------------------------------------------------
// Body parser
// ----------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----------------------------------------------------------------
// Rate limiting (global: 100 req / 15 min / IP)
// ----------------------------------------------------------------
app.use(limiter);

// ----------------------------------------------------------------
// Health check (no auth required)
// ----------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'symbiosis-api' });
});

// ----------------------------------------------------------------
// API Routes
// ----------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/pdf', pdfRoutes);
app.use('/api/v1/organizations', organizationRoutes);

// ----------------------------------------------------------------
// 404 handler
// ----------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ----------------------------------------------------------------
// Global error handler
// ----------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.expose !== false && err.message ? err.message : 'Internal Server Error';

  if (status >= 500) {
    console.error('[ERROR]', {
      method: req.method,
      url: req.originalUrl,
      status,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ----------------------------------------------------------------
// Start server
// ----------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`[symbiosis-api] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app; // for testing
