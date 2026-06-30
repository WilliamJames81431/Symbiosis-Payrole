'use strict';

const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { tenantGuard } = require('../middleware/tenantGuard');
const { calculatePayrollForEmployee } = require('../services/payrollEngine');

const router = express.Router();

// All payroll routes require authentication + HR or ERP role + tenant guard
router.use(authenticate, requireRole('HR', 'ERP'), tenantGuard);

// ----------------------------------------------------------------
// POST /api/v1/payroll/calculate
// Draft mode: compute payroll for all active employees in the org.
// Does NOT write to the database. Returns calculated array.
// Body: { month_year: 'YYYY-MM', adjustments?: { [emp_id]: { variable_earnings, adjustments, justification } } }
// ----------------------------------------------------------------
router.post('/calculate', async (req, res, next) => {
  try {
    const { month_year, adjustments = {} } = req.body;

    if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ error: 'month_year must be in YYYY-MM format' });
    }

    const orgId = req.user.org_id;

    // Fetch org settings
    const { rows: orgRows } = await db.query(
      `SELECT org_id, name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt
       FROM organizations WHERE org_id = $1`,
      [orgId]
    );

    if (!orgRows[0]) {
      return res.status(404).json({ error: `Organisation ${orgId} not found` });
    }
    const org = orgRows[0];

    // Fetch all active employees
    const { rows: employees } = await db.query(
      `SELECT emp_id, org_id, name, doj, exit_date, ctc, department, designation,
              bank_account, bank_ifsc, epf_eligible, esi_eligible, status,
              tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan
       FROM employees
       WHERE org_id = $1 AND status NOT IN ('Inactive', 'Deleted')`,
      [orgId]
    );

    if (employees.length === 0) {
      return res.json({ data: [], message: 'No active employees found', month_year });
    }

    // Fetch attendance records for the given month
    const { rows: attendanceRows } = await db.query(
      `SELECT emp_id, days, ot_hours
       FROM attendance_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    // Index attendance by emp_id for O(1) lookup
    const attendanceMap = {};
    for (const row of attendanceRows) {
      attendanceMap[row.emp_id] = row;
    }

    // Compute payroll for each employee
    const results = employees.map((emp) => {
      const attendance = attendanceMap[emp.emp_id] || null;
      const empAdjustments = adjustments[emp.emp_id] || null;
      return calculatePayrollForEmployee(emp, org, month_year, attendance, empAdjustments);
    });

    const totalGross = results.reduce((sum, r) => sum + r.gross, 0);
    const totalNet = results.reduce((sum, r) => sum + r.net, 0);
    const totalPF = results.reduce((sum, r) => sum + r.pf, 0);
    const totalESI = results.reduce((sum, r) => sum + r.esi, 0);
    const totalTDS = results.reduce((sum, r) => sum + r.tds, 0);

    return res.json({
      data: results,
      summary: {
        total_employees: results.length,
        total_gross: totalGross,
        total_net: totalNet,
        total_pf_employee: totalPF,
        total_esi_employee: totalESI,
        total_tds: totalTDS,
      },
      month_year,
      status: 'DRAFT',
      message: 'Draft calculation — not saved to database. Call /lock to persist.',
    });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/payroll/lock
// Locks the payroll run: writes payroll_run + payroll_records in a DB
// transaction. Immutability guard prevents double-locking a month.
// Body: { month_year: 'YYYY-MM', records: [...calculated array], adjustments?: {} }
// ----------------------------------------------------------------
router.post('/lock', async (req, res, next) => {
  const client = await db.connect();
  try {
    const { month_year, records } = req.body;

    if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ error: 'month_year must be in YYYY-MM format' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records must be a non-empty array — run /calculate first' });
    }

    const orgId = req.user.org_id;

    await client.query('BEGIN');

    // Immutability guard — prevent re-locking an already locked month
    const { rows: existing } = await client.query(
      `SELECT id AS run_id FROM payroll_runs
       WHERE org_id = $1 AND month_year = $2 AND status = 'Locked'
       FOR UPDATE`,
      [orgId, month_year]
    );

    if (existing.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: `Payroll for ${month_year} is already locked (run_id: ${existing[0].run_id}). Locked payrolls are immutable.`,
      });
    }

    // Create payroll run
    const { rows: runRows } = await client.query(
      `INSERT INTO payroll_runs (org_id, month_year, status, approved_by, approved_at, created_at, updated_at)
       VALUES ($1, $2, 'Locked', $3, NOW(), NOW(), NOW())
       RETURNING id AS run_id, month_year, status, approved_at AS locked_at`,
      [orgId, month_year, req.user.user_id]
    );

    const run = runRows[0];

    // Insert individual payroll records
    const insertedRecords = [];
    for (const rec of records) {
      const { rows: recRows } = await client.query(
        `INSERT INTO payroll_records (
           run_id, org_id, emp_id, name, ctc, payable_days, total_days, tenure_days, gross,
           basic, hra, da, conveyance, medical,
           pf_employee, pf_employer, esi_employee, esi_employer, pt, lwf, tds, ot_pay, bonus, adjustments,
           adjustment_note, net, pro_rata_factor, gratuity_accrual, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9,
           $10, $11, $12, $13, $14,
           $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
           $25, $26, $27, $28, NOW()
         )
         RETURNING id AS record_id, emp_id, gross, net`,
        [
          run.run_id, orgId, rec.emp_id, rec.name, rec.ctc, rec.payable_days, rec.total_days, rec.tenure_days, rec.gross,
          rec.basic_earned, rec.hra_earned, rec.da_earned, rec.conv_earned, rec.med_earned,
          rec.pf, rec.pf_employer, rec.esi, rec.esi_employer, rec.pt, rec.lwf, rec.tds, rec.ot_pay, rec.bonus, rec.adjustments,
          rec.justification || '', rec.net, rec.pro_rata_factor, rec.gratuity_accrued || 0
        ]
      );
      insertedRecords.push(recRows[0]);
    }

    // Write audit log
    await client.query(
      `INSERT INTO audit_log (user_id, org_id, action, metadata, created_at)
       VALUES ($1, $2, 'PAYROLL_LOCKED', $3, NOW())`,
      [
        req.user.user_id,
        orgId,
        JSON.stringify({
          run_id: run.run_id,
          month_year,
          employee_count: records.length,
          total_gross: records.reduce((s, r) => s + (r.gross || 0), 0),
          total_net: records.reduce((s, r) => s + (r.net || 0), 0),
        }),
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: `Payroll for ${month_year} locked successfully`,
      run_id: run.run_id,
      month_year: run.month_year,
      status: run.status,
      locked_at: run.locked_at,
      records_saved: insertedRecords.length,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
});

// ----------------------------------------------------------------
// GET /api/v1/payroll/ledger
// Returns all locked payroll runs with summary for the org
// ----------------------------------------------------------------
router.get('/ledger', async (req, res, next) => {
  try {
    const orgId = req.user.org_id;

    const { rows } = await db.query(
      `SELECT
         r.id AS run_id, r.org_id, r.month_year, r.status, r.approved_at AS locked_at,
         r.approved_by, 'HR'::text AS approved_by_role,
         COUNT(p.id) AS employee_count,
         COALESCE(ROUND(SUM(p.gross)::numeric, 2), 0) AS total_gross,
         COALESCE(ROUND(SUM(p.net)::numeric, 2), 0) AS total_net,
         COALESCE(ROUND(SUM(p.pf_employee)::numeric, 2), 0) AS total_pf,
         COALESCE(ROUND(SUM(p.esi_employee)::numeric, 2), 0) AS total_esi,
         COALESCE(ROUND(SUM(p.tds)::numeric, 2), 0) AS total_tds
       FROM payroll_runs r
       LEFT JOIN payroll_records p ON p.run_id = r.id
       WHERE r.org_id = $1 AND r.status = 'Locked'
       GROUP BY r.id, r.org_id, r.month_year, r.status, r.approved_at, r.approved_by
       ORDER BY r.month_year DESC`,
      [orgId]
    );

    return res.json({ data: rows, total: rows.length });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// GET /api/v1/payroll/ledger/:month_year
// Returns a specific locked run with all employee records
// ----------------------------------------------------------------
router.get('/ledger/:month_year', async (req, res, next) => {
  try {
    const { month_year } = req.params;

    if (!/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ error: 'month_year must be in YYYY-MM format' });
    }

    const orgId = req.user.org_id;

    // Fetch run header
    const { rows: runRows } = await db.query(
      `SELECT id AS run_id, org_id, month_year, status, approved_at AS locked_at, approved_by, 'HR'::text AS approved_by_role
       FROM payroll_runs
       WHERE org_id = $1 AND month_year = $2 AND status = 'Locked'
       LIMIT 1`,
      [orgId, month_year]
    );

    if (!runRows[0]) {
      return res.status(404).json({ error: `No locked payroll run found for ${month_year}` });
    }

    const run = runRows[0];

    // Fetch all employee records for this run
    const { rows: records } = await db.query(
      `SELECT
         p.id AS record_id, p.emp_id, p.name AS employee_name, e.designation,
         e.department, e.bank_account, e.bank_ifsc,
         p.total_days, p.tenure_days, (p.total_days - p.payable_days) AS absent_days, p.payable_days,
         p.basic AS basic_earned, p.hra AS hra_earned, p.da AS da_earned, p.conveyance AS conv_earned, p.medical AS med_earned,
         (p.ot_pay / 250.0) AS ot_hours, p.ot_pay, p.bonus, p.adjustments, p.gross,
         p.pf_employee AS pf, p.pf_employer, p.esi_employee AS esi, p.esi_employer, p.pt, p.tds,
         p.lwf, (p.lwf * 2.0) AS lwf_employer, (p.pf_employee + p.esi_employee + p.pt + p.tds + p.lwf) AS total_deductions, p.net,
         p.gratuity_accrual AS gratuity_monthly, p.gratuity_accrual AS gratuity_accrued,
         '[]'::text AS warnings, p.adjustment_note AS justification
       FROM payroll_records p
       JOIN employees e ON e.emp_id = p.emp_id AND e.org_id = p.org_id
       WHERE p.run_id = $1
       ORDER BY p.name ASC`,
      [run.run_id]
    );

    const summary = {
      total_employees: records.length,
      total_gross: records.reduce((s, r) => s + parseFloat(r.gross || 0), 0),
      total_net: records.reduce((s, r) => s + parseFloat(r.net || 0), 0),
      total_pf: records.reduce((s, r) => s + parseFloat(r.pf || 0), 0),
      total_esi: records.reduce((s, r) => s + parseFloat(r.esi || 0), 0),
      total_tds: records.reduce((s, r) => s + parseFloat(r.tds || 0), 0),
    };

    return res.json({
      run,
      records,
      summary,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
