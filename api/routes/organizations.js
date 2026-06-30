'use strict';

const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { tenantGuard } = require('../middleware/tenantGuard');

const router = express.Router();

// ----------------------------------------------------------------
// GET /api/v1/organizations/public
// Returns a list of organizations with only public fields (id, name, legacy_id)
// No authentication required. Used for the login dropdown select.
// ----------------------------------------------------------------
router.get('/public', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT org_id, legacy_id, name FROM organizations WHERE is_active = TRUE ORDER BY name ASC'
    );
    return res.json({ data: rows, total: rows.length });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// GET /api/v1/organizations
// ERP: lists all orgs. HR: lists caller's own org.
// ----------------------------------------------------------------
router.get('/', authenticate, async (req, res, next) => {
  try {
    let query, params;
    if (req.user.role === 'ERP') {
      query = 'SELECT * FROM organizations ORDER BY name ASC';
      params = [];
    } else {
      query = 'SELECT * FROM organizations WHERE org_id = $1';
      params = [req.user.org_id];
    }
    const { rows } = await db.query(query, params);
    return res.json({ data: rows, total: rows.length });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// GET /api/v1/organizations/:orgId
// ----------------------------------------------------------------
router.get('/:orgId', authenticate, tenantGuard, async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { rows } = await db.query('SELECT * FROM organizations WHERE org_id = $1', [orgId]);
    if (!rows[0]) {
      return res.status(404).json({ error: `Organisation ${orgId} not found` });
    }
    return res.json({ data: rows[0] });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/organizations
// Requires ERP Admin role to create new tenant organizations
// ----------------------------------------------------------------
router.post('/', authenticate, requireRole('ERP'), async (req, res, next) => {
  try {
    const { name, epf_rate = 12, minimum_wage = 12000, basic_pct = 60, ot_rate = 250, state_pt = 'telangana', legacy_id = null } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organisation name is required' });
    }

    const { rows } = await db.query(
      `INSERT INTO organizations (name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt, legacy_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt, legacy_id]
    );

    return res.status(201).json({ data: rows[0], message: 'Organisation created successfully' });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// PUT /api/v1/organizations/:orgId
// ----------------------------------------------------------------
router.put('/:orgId', authenticate, requireRole('HR', 'ERP'), tenantGuard, async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt, is_active } = req.body;

    const setClauses = [];
    const values = [];
    let idx = 1;

    const addField = (col, val) => {
      if (val !== undefined) {
        setClauses.push(`${col} = $${idx++}`);
        values.push(val);
      }
    };

    addField('name', name);
    addField('epf_rate', epf_rate);
    addField('minimum_wage', minimum_wage);
    addField('basic_pct', basic_pct);
    addField('ot_rate', ot_rate);
    addField('state_pt', state_pt);
    addField('is_active', is_active);

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    setClauses.push('updated_at = NOW()');
    values.push(orgId);
    const orgIdIdx = idx;

    const { rows } = await db.query(
      `UPDATE organizations
       SET ${setClauses.join(', ')}
       WHERE org_id = $${orgIdIdx}
       RETURNING *`,
      values
    );

    if (!rows[0]) {
      return res.status(404).json({ error: `Organisation ${orgId} not found` });
    }

    return res.json({ data: rows[0], message: 'Organisation updated successfully' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
