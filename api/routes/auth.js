'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';
const COOKIE_NAME = 'symbiosis_refresh';
const BCRYPT_SALT_ROUNDS = 12;

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_ACCESS_EXPIRES,
    issuer: 'symbiosis-api',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_REFRESH_EXPIRES,
    issuer: 'symbiosis-api',
  });
}

function setRefreshCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/v1/auth',
  });
}

async function writeAuditLog(client, { user_id, org_id, action, meta }) {
  try {
    await client.query(
      `INSERT INTO audit_log (user_id, org_id, action, metadata, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [user_id, org_id, action, JSON.stringify(meta || {})]
    );
  } catch (err) {
    // Non-fatal: log but don't throw
    console.error('[audit_log] Write failed:', err.message);
  }
}

// ----------------------------------------------------------------
// POST /api/v1/auth/login
// ----------------------------------------------------------------
router.post('/login', strictLimiter, async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'email/username and password are required' });
    }

    // Fetch user with their profile
    const { rows } = await db.query(
      `SELECT u.user_id, u.email, u.password_hash, u.role, u.org_id, u.emp_id,
              u.is_active, o.name AS org_name
       FROM users u
       LEFT JOIN organizations o ON o.org_id = u.org_id
       WHERE u.email = $1 OR u.username = $1
       LIMIT 1`,
      [identifier]
    );

    const user = rows[0];

    if (!user) {
      // Constant-time fake compare to prevent user enumeration
      await bcrypt.compare(password, '$2b$12$invalidhashforenumeration....');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated — contact your administrator' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await writeAuditLog(db, {
        user_id: user.user_id,
        org_id: user.org_id,
        action: 'LOGIN_FAILED',
        meta: { email, ip: req.ip },
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      emp_id: user.emp_id || null,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ user_id: user.user_id, org_id: user.org_id });

    // Persist refresh token hash in DB for rotation invalidation
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await db.query(
      `UPDATE users SET refresh_token_hash = $1, last_login = NOW() WHERE user_id = $2`,
      [refreshHash, user.user_id]
    );

    setRefreshCookie(res, refreshToken);

    await writeAuditLog(db, {
      user_id: user.user_id,
      org_id: user.org_id,
      action: 'LOGIN_SUCCESS',
      meta: { email, ip: req.ip },
    });

    return res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: JWT_ACCESS_EXPIRES,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        org_id: user.org_id,
        org_name: user.org_name,
        emp_id: user.emp_id,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/auth/refresh
// ----------------------------------------------------------------
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'symbiosis-api',
      });
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Validate against stored hash
    const { rows } = await db.query(
      `SELECT user_id, email, role, org_id, emp_id, refresh_token_hash, is_active
       FROM users WHERE user_id = $1 LIMIT 1`,
      [decoded.user_id]
    );

    const user = rows[0];
    if (!user || !user.is_active || !user.refresh_token_hash) {
      return res.status(401).json({ error: 'Session invalidated — please log in again' });
    }

    const valid = await bcrypt.compare(token, user.refresh_token_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Refresh token reuse detected — session invalidated' });
    }

    const newAccessToken = signAccessToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      emp_id: user.emp_id || null,
    });

    // Rotate refresh token
    const newRefreshToken = signRefreshToken({ user_id: user.user_id, org_id: user.org_id });
    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    await db.query(
      `UPDATE users SET refresh_token_hash = $1 WHERE user_id = $2`,
      [newRefreshHash, user.user_id]
    );

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: JWT_ACCESS_EXPIRES,
    });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/auth/logout
// ----------------------------------------------------------------
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // Invalidate refresh token in DB
    await db.query(
      `UPDATE users SET refresh_token_hash = NULL WHERE user_id = $1`,
      [req.user.user_id]
    );

    res.clearCookie(COOKIE_NAME, { path: '/api/v1/auth' });

    await writeAuditLog(db, {
      user_id: req.user.user_id,
      org_id: req.user.org_id,
      action: 'LOGOUT',
      meta: { ip: req.ip },
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/auth/change-password
// ----------------------------------------------------------------
router.post('/change-password', authenticate, strictLimiter, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }

    if (new_password.length < 8) {
      return res.status(422).json({ error: 'new_password must be at least 8 characters' });
    }

    const { rows } = await db.query(
      `SELECT password_hash FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (current_password === new_password) {
      return res.status(422).json({ error: 'New password must differ from current password' });
    }

    const newHash = await bcrypt.hash(new_password, BCRYPT_SALT_ROUNDS);

    await db.query(
      `UPDATE users SET password_hash = $1, refresh_token_hash = NULL, updated_at = NOW()
       WHERE user_id = $2`,
      [newHash, req.user.user_id]
    );

    // Clear refresh cookie — force re-login with new password
    res.clearCookie(COOKIE_NAME, { path: '/api/v1/auth' });

    await writeAuditLog(db, {
      user_id: req.user.user_id,
      org_id: req.user.org_id,
      action: 'CHANGE_PASSWORD',
      meta: { ip: req.ip },
    });

    return res.json({ message: 'Password changed successfully — please log in again' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
