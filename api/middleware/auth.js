'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * authenticate
 * Verifies a Bearer JWT from the Authorization header.
 * On success, attaches the decoded payload to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'symbiosis-api',
    });

    req.user = decoded; // { user_id, email, role, org_id, emp_id, iat, exp }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired — please refresh' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return next(err);
  }
}

/**
 * requireRole
 * Factory that returns a middleware checking req.user.role against the allowed list.
 * Usage: requireRole('HR', 'ERP')
 */
function requireRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied — required roles: ${allowed.join(', ')}`,
      });
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
