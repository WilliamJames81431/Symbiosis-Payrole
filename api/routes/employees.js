'use strict';

const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { tenantGuard } = require('../middleware/tenantGuard');

const router = express.Router();

// All employee routes require authentication + HR or ERP role + tenant isolation
router.use(authenticate, requireRole('HR', 'ERP'), tenantGuard);

// ----------------------------------------------------------------
// GET /api/v1/employees
// Returns all employees for the caller's org using the masked view
// (PAN/Aadhaar shown masked unless role is ERP)
// ----------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const orgId = req.user.role === 'ERP' && req.query.org_id
      ? req.query.org_id
      : req.user.org_id;

    // Use masked view to prevent PAN/Aadhaar leakage via SELECT *
    // ERP role gets unmasked data for compliance purposes
    let query, params;
    if (req.user.role === 'ERP') {
      query = `
        SELECT
          emp_id, org_id, name, doj, exit_date, ctc, department, designation,
          bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
          tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
          pgp_sym_decrypt(pan_encrypted::bytea, $2) AS pan,
          pgp_sym_decrypt(aadhaar_encrypted::bytea, $2) AS aadhaar,
          profile_picture_url, created_at, updated_at
        FROM employees
        WHERE org_id = $1 AND status != 'Deleted'
        ORDER BY name ASC`;
      params = [orgId, process.env.FIELD_ENCRYPTION_KEY];
    } else {
      query = `
        SELECT
          emp_id, org_id, name, doj, exit_date, ctc, department, designation,
          bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
          tds_rate, rent_paid, tax_80c, tax_80d, other_income,
          pan_masked AS pan, aadhaar_masked AS aadhaar,
          profile_picture_url, created_at, updated_at
        FROM employee_masked_view
        WHERE org_id = $1 AND status != 'Deleted'
        ORDER BY name ASC`;
      params = [orgId];
    }

    const { rows } = await db.query(query, params);

    return res.json({ data: rows, total: rows.length });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// GET /api/v1/employees/:emp_id
// ----------------------------------------------------------------
router.get('/:emp_id', async (req, res, next) => {
  try {
    const { emp_id } = req.params;
    const orgId = req.user.org_id;

    // Employees can only view their own record
    if (req.user.role === 'Employee' && req.user.emp_id !== emp_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await db.query(
      `SELECT
         emp_id, org_id, name, doj, exit_date, ctc, department, designation,
         bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
         tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
         pan_masked AS pan, aadhaar_masked AS aadhaar,
         profile_picture_url, created_at, updated_at
       FROM employee_masked_view
       WHERE emp_id = $1 AND org_id = $2 AND status != 'Deleted'
       LIMIT 1`,
      [emp_id, orgId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: `Employee ${emp_id} not found` });
    }

    return res.json({ data: rows[0] });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/employees
// Creates a new employee; PAN and Aadhaar are encrypted at rest
// ----------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const {
      emp_id, name, doj, exit_date = null, ctc, department, designation,
      bank_account, bank_ifsc = null, epf_eligible = true, esi_eligible = false,
      tds_rate = null, rent_paid = 0, tax_80c = 0, tax_80d = 0,
      other_income = 0, landlord_pan = null, pan = null, aadhaar = null,
      status = 'Active',
    } = req.body;

    if (!emp_id || !name || !doj || !ctc || !department || !designation || !bank_account) {
      return res.status(400).json({
        error: 'Required fields: emp_id, name, doj, ctc, department, designation, bank_account',
      });
    }

    const orgId = req.user.org_id;
    const encKey = process.env.FIELD_ENCRYPTION_KEY;

    const { rows } = await db.query(
      `INSERT INTO employees (
         emp_id, org_id, name, doj, exit_date, ctc, department, designation,
         bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
         tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
         pan_encrypted, aadhaar_encrypted, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8,
         $9, $10, $11, $12, $13,
         $14, $15, $16, $17, $18, $19,
         CASE WHEN $20::text IS NOT NULL THEN pgp_sym_encrypt($20::text, $21) ELSE NULL END,
         CASE WHEN $22::text IS NOT NULL THEN pgp_sym_encrypt($22::text, $21) ELSE NULL END,
         NOW(), NOW()
       )
       RETURNING emp_id, org_id, name, doj, exit_date, ctc, department,
                 designation, bank_account, bank_ifsc, epf_eligible, esi_eligible,
                 status, tds_rate, rent_paid, tax_80c, tax_80d, other_income,
                 landlord_pan, created_at`,
      [
        emp_id, orgId, name, doj, exit_date, ctc, department, designation,
        bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
        tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
        pan, encKey, aadhaar,
      ]
    );

    return res.status(201).json({ data: rows[0], message: 'Employee created successfully' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Employee ID '${req.body.emp_id}' already exists in this organisation` });
    }
    return next(err);
  }
});

// ----------------------------------------------------------------
// PUT /api/v1/employees/:emp_id
// ----------------------------------------------------------------
router.put('/:emp_id', async (req, res, next) => {
  try {
    const { emp_id } = req.params;
    const orgId = req.user.org_id;
    const encKey = process.env.FIELD_ENCRYPTION_KEY;

    const {
      name, doj, exit_date, ctc, department, designation,
      bank_account, bank_ifsc, epf_eligible, esi_eligible,
      tds_rate, rent_paid, tax_80c, tax_80d, other_income,
      landlord_pan, pan, aadhaar, status,
    } = req.body;

    // Build dynamic SET clause
    const setClauses = [];
    const values = [];
    let idx = 1;

    const addField = (col, val) => {
      setClauses.push(`${col} = $${idx++}`);
      values.push(val);
    };

    if (name !== undefined) addField('name', name);
    if (doj !== undefined) addField('doj', doj);
    if (exit_date !== undefined) addField('exit_date', exit_date);
    if (ctc !== undefined) addField('ctc', ctc);
    if (department !== undefined) addField('department', department);
    if (designation !== undefined) addField('designation', designation);
    if (bank_account !== undefined) addField('bank_account', bank_account);
    if (bank_ifsc !== undefined) addField('bank_ifsc', bank_ifsc);
    if (epf_eligible !== undefined) addField('epf_eligible', epf_eligible);
    if (esi_eligible !== undefined) addField('esi_eligible', esi_eligible);
    if (tds_rate !== undefined) addField('tds_rate', tds_rate);
    if (rent_paid !== undefined) addField('rent_paid', rent_paid);
    if (tax_80c !== undefined) addField('tax_80c', tax_80c);
    if (tax_80d !== undefined) addField('tax_80d', tax_80d);
    if (other_income !== undefined) addField('other_income', other_income);
    if (landlord_pan !== undefined) addField('landlord_pan', landlord_pan);
    if (status !== undefined) addField('status', status);

    // Encrypted fields
    if (pan !== undefined) {
      setClauses.push(`pan_encrypted = pgp_sym_encrypt($${idx++}::text, $${idx++})`);
      values.push(pan, encKey);
    }
    if (aadhaar !== undefined) {
      setClauses.push(`aadhaar_encrypted = pgp_sym_encrypt($${idx++}::text, $${idx++})`);
      values.push(aadhaar, encKey);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    setClauses.push(`updated_at = NOW()`);

    values.push(emp_id, orgId);
    const empIdIdx = idx++;
    const orgIdIdx = idx;

    const { rows } = await db.query(
      `UPDATE employees
       SET ${setClauses.join(', ')}
       WHERE emp_id = $${empIdIdx} AND org_id = $${orgIdIdx} AND status != 'Deleted'
       RETURNING emp_id, org_id, name, doj, exit_date, ctc, department,
                 designation, bank_account, epf_eligible, esi_eligible, status, updated_at`,
      values
    );

    if (!rows[0]) {
      return res.status(404).json({ error: `Employee ${emp_id} not found` });
    }

    return res.json({ data: rows[0], message: 'Employee updated successfully' });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// DELETE /api/v1/employees/:emp_id
// Soft delete — sets status = 'Inactive' (immutability for payroll history)
// ----------------------------------------------------------------
router.delete('/:emp_id', async (req, res, next) => {
  try {
    const { emp_id } = req.params;
    const orgId = req.user.org_id;

    const { rows } = await db.query(
      `UPDATE employees
       SET status = 'Inactive', updated_at = NOW()
       WHERE emp_id = $1 AND org_id = $2 AND status != 'Deleted'
       RETURNING emp_id, status`,
      [emp_id, orgId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: `Employee ${emp_id} not found or already inactive` });
    }

    return res.json({ data: rows[0], message: 'Employee deactivated successfully' });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/employees/bulk
// Bulk upsert employees
// ----------------------------------------------------------------
router.post('/bulk', async (req, res, next) => {
  const client = await db.connect();
  try {
    const { employees } = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: 'employees must be a non-empty array' });
    }

    const orgId = req.user.org_id;
    const encKey = process.env.FIELD_ENCRYPTION_KEY;

    await client.query('BEGIN');
    const upserted = [];

    for (const emp of employees) {
      const {
        emp_id, name, doj, exit_date = null, ctc, department, designation,
        bank_account, bank_ifsc = null, epf_eligible = true, esi_eligible = false,
        status = 'Active', tds_rate = null, rent_paid = 0, tax_80c = 0, tax_80d = 0,
        other_income = 0, landlord_pan = null, pan = null, aadhaar = null
      } = emp;

      const { rows } = await client.query(
        `INSERT INTO employees (
           emp_id, org_id, name, doj, exit_date, ctc, department, designation,
           bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
           tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
           pan_encrypted, aadhaar_encrypted, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12, $13,
           $14, $15, $16, $17, $18, $19,
           CASE WHEN $20::text IS NOT NULL THEN pgp_sym_encrypt($20::text, $21) ELSE NULL END,
           CASE WHEN $22::text IS NOT NULL THEN pgp_sym_encrypt($22::text, $21) ELSE NULL END,
           NOW(), NOW()
         )
         ON CONFLICT (emp_id, org_id) DO UPDATE SET
           name = EXCLUDED.name,
           doj = EXCLUDED.doj,
           exit_date = EXCLUDED.exit_date,
           ctc = EXCLUDED.ctc,
           department = EXCLUDED.department,
           designation = EXCLUDED.designation,
           bank_account = EXCLUDED.bank_account,
           bank_ifsc = EXCLUDED.bank_ifsc,
           epf_eligible = EXCLUDED.epf_eligible,
           esi_eligible = EXCLUDED.esi_eligible,
           status = EXCLUDED.status,
           tds_rate = EXCLUDED.tds_rate,
           rent_paid = EXCLUDED.rent_paid,
           tax_80c = EXCLUDED.tax_80c,
           tax_80d = EXCLUDED.tax_80d,
           other_income = EXCLUDED.other_income,
           landlord_pan = EXCLUDED.landlord_pan,
           pan_encrypted = EXCLUDED.pan_encrypted,
           aadhaar_encrypted = EXCLUDED.aadhaar_encrypted,
           updated_at = NOW()
         RETURNING emp_id, name`,
        [
          emp_id, orgId, name, doj, exit_date, ctc, department, designation,
          bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
          tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
          pan, encKey, aadhaar
        ]
      );
      upserted.push(rows[0]);
    }

    await client.query('COMMIT');
    return res.status(201).json({ message: `Bulk import successful: ${upserted.length} records saved`, data: upserted });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
