'use strict';

const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { tenantGuard } = require('../middleware/tenantGuard');

const router = express.Router();

// All attendance routes require authentication + HR or ERP role + tenant guard
router.use(authenticate, requireRole('HR', 'ERP'), tenantGuard);

// ----------------------------------------------------------------
// GET /api/v1/attendance/:month_year
// Returns all attendance records for the caller's org for a given month.
// month_year format: YYYY-MM (e.g. 2026-06)
// ----------------------------------------------------------------
router.get('/:month_year', async (req, res, next) => {
  try {
    const { month_year } = req.params;

    if (!/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ error: 'month_year must be in YYYY-MM format' });
    }

    const orgId = req.user.role === 'ERP' && req.query.org_id
      ? req.query.org_id
      : req.user.org_id;

    // 1. Fetch active employees
    const { rows: employees } = await db.query(
      `SELECT emp_id, name FROM employees WHERE org_id = $1 AND status != 'Deleted' ORDER BY name ASC`,
      [orgId]
    );

    if (employees.length === 0) {
      return res.json({ data: [], total: 0, month_year });
    }

    // 2. Fetch daily attendance records
    const { rows: dailyRecords } = await db.query(
      `SELECT emp_id, day_index, status_code FROM attendance_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    // 3. Fetch overtime records
    const { rows: otRecords } = await db.query(
      `SELECT emp_id, ot_hours FROM overtime_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    // Map data
    const otMap = {};
    for (const r of otRecords) {
      otMap[r.emp_id] = parseFloat(r.ot_hours || 0);
    }

    const attendanceMap = {};
    for (const emp of employees) {
      attendanceMap[emp.emp_id] = {
        daysMap: {},
      };
    }

    for (const r of dailyRecords) {
      if (attendanceMap[r.emp_id]) {
        attendanceMap[r.emp_id].daysMap[r.day_index] = r.status_code;
      }
    }

    const [yearStr, monthStr] = month_year.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const totalDays = new Date(year, month, 0).getDate();

    const formattedRecords = employees.map((emp) => {
      const entry = attendanceMap[emp.emp_id];
      const days = [];
      let presentDays = 0;
      let absentDays = 0;

      for (let i = 1; i <= totalDays; i++) {
        const code = entry.daysMap[i] || 'A';
        days.push(code);
        if (['P', 'WO', 'H', 'EL', 'CO'].includes(code)) {
          presentDays++;
        } else {
          absentDays++;
        }
      }

      const ot_hours = otMap[emp.emp_id] || 0;

      return {
        record_id: emp.emp_id + '_' + month_year,
        org_id: orgId,
        emp_id: emp.emp_id,
        employee_name: emp.name,
        month_year,
        days,
        ot_hours,
        present_days: presentDays,
        absent_days: absentDays,
      };
    });

    return res.json({ data: formattedRecords, total: formattedRecords.length, month_year });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/attendance/upload
// Bulk upsert attendance records.
// Expects body: { month_year: 'YYYY-MM', records: [...] }
// Each record: { emp_id, days: string[], ot: number }
// ----------------------------------------------------------------
router.post('/upload', async (req, res, next) => {
  const client = await db.connect();
  try {
    const { month_year, records } = req.body;

    if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ error: 'month_year must be in YYYY-MM format' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records must be a non-empty array' });
    }

    const orgId = req.user.org_id;
    const [yearStr, monthStr] = month_year.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const totalDays = new Date(year, month, 0).getDate();

    await client.query('BEGIN');

    const upserted = [];
    const errors = [];

    for (const record of records) {
      const { emp_id, days, ot = 0 } = record;

      if (!emp_id) {
        errors.push({ emp_id: null, error: 'emp_id is required' });
        continue;
      }

      if (!Array.isArray(days) || days.length !== totalDays) {
        errors.push({
          emp_id,
          error: `days array must have exactly ${totalDays} entries for ${month_year}`,
        });
        continue;
      }

      // Validate day codes
      const validCodes = ['P', 'A', 'WO', 'H', 'EL', 'CO', 'X'];
      const invalidCodes = days.filter((d) => !validCodes.includes(d.toUpperCase()));
      if (invalidCodes.length > 0) {
        errors.push({ emp_id, error: `Invalid attendance codes: ${invalidCodes.join(', ')}` });
        continue;
      }

      // Insert daily records
      for (let i = 0; i < days.length; i++) {
        await client.query(
          `INSERT INTO attendance_records (org_id, emp_id, month_year, day_index, status_code)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (org_id, emp_id, month_year, day_index)
           DO UPDATE SET status_code = EXCLUDED.status_code`,
          [orgId, emp_id, month_year, i + 1, days[i].toUpperCase()]
        );
      }

      // Insert/update overtime record
      await client.query(
        `INSERT INTO overtime_records (org_id, emp_id, month_year, ot_hours)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (org_id, emp_id, month_year)
         DO UPDATE SET ot_hours = EXCLUDED.ot_hours`,
        [orgId, emp_id, month_year, ot]
      );

      const presentDays = days.filter((d) =>
        ['P', 'WO', 'H', 'EL', 'CO'].includes(d.toUpperCase())
      ).length;
      const absentDays = totalDays - presentDays;

      upserted.push({
        emp_id,
        month_year,
        present_days: presentDays,
        absent_days: absentDays,
      });
    }

    if (errors.length > 0 && upserted.length === 0) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        error: 'All records failed validation',
        validation_errors: errors,
      });
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: `Attendance uploaded: ${upserted.length} records saved`,
      upserted,
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
