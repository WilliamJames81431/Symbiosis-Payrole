'use strict';

const rateLimit = require('express-rate-limit');

/**
 * limiter — default rate limiter
 * 100 requests per 15 minutes per IP
 * Applied globally in server.js
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers (RFC 6585)
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    error: 'Too many requests — please try again after 15 minutes',
  },
  keyGenerator: (req) => req.ip,
  skip: (req) => req.path === '/health', // skip health check
});

/**
 * strictLimiter — for authentication endpoints
 * 5 requests per minute per IP
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts — please try again in a minute',
  },
  keyGenerator: (req) => req.ip,
});

module.exports = { limiter, strictLimiter };
