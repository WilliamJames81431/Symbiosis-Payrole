'use strict';

const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { tenantGuard } = require('../middleware/tenantGuard');
const { calculatePayrollForEmployee } = require('../services/payrollEngine');

const router = express.Router();

router.use(authenticate, requireRole('HR', 'ERP'), tenantGuard);

// ----------------------------------------------------------------
// GET /api/v1/compliance/epf-ecr/:month_year
// Returns EPF ECR Challan text file
// ----------------------------------------------------------------
router.get('/epf-ecr/:month_year', async (req, res, next) => {
  try {
    const { month_year } = req.params;
    const orgId = req.user.org_id;

    // Fetch org settings
    const { rows: orgRows } = await db.query(
      `SELECT org_id, name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt
       FROM organizations WHERE org_id = $1`,
      [orgId]
    );
    if (!orgRows[0]) return res.status(404).json({ error: 'Organisation not found' });
    const org = orgRows[0];

    // Fetch employees
    const { rows: employees } = await db.query(
      `SELECT emp_id, name, doj, exit_date, ctc, epf_eligible, esi_eligible, status, tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
              pgp_sym_decrypt(pan_encrypted::bytea, $2) AS pan,
              pgp_sym_decrypt(aadhaar_encrypted::bytea, $2) AS aadhaar
       FROM employees WHERE org_id = $1 AND status != 'Deleted'`,
      [orgId, process.env.FIELD_ENCRYPTION_KEY]
    );

    // Fetch attendance
    const { rows: dailyRecords } = await db.query(
      `SELECT emp_id, day_index, status_code FROM attendance_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    const { rows: otRecords } = await db.query(
      `SELECT emp_id, ot_hours FROM overtime_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    const otMap = {};
    for (const r of otRecords) otMap[r.emp_id] = parseFloat(r.ot_hours || 0);

    const attendanceMap = {};
    for (const r of dailyRecords) {
      if (!attendanceMap[r.emp_id]) attendanceMap[r.emp_id] = [];
      attendanceMap[r.emp_id][r.day_index - 1] = r.status_code;
    }

    let fileContent = '';
    let count = 0;

    for (const emp of employees) {
      if (!emp.epf_eligible) continue;

      const days = attendanceMap[emp.emp_id] || [];
      const calc = calculatePayrollForEmployee(emp, org, month_year, { days, ot_hours: otMap[emp.emp_id] || 0 });

      // Mock UAN matching frontend logic
      const idNum = emp.emp_id.replace(/\D/g, '') || '101';
      const uan = `1009${idNum.padStart(8, '0')}`;

      const gross = Math.round(calc.gross);
      const pfCeiling = 15000;
      const pfWages = Math.round(Math.min(calc.basic_earned, pfCeiling));
      const epsWages = pfWages;
      const edliWages = pfWages;

      const epfShare = Math.round(calc.pf); // Employee Share (12%)
      const epsShare = Math.round(epsWages * 0.0833); // Employer EPS Share (8.33%)
      const diffShare = Math.round(calc.pf - epsShare); // Employer EPF Share (3.67%)
      const ncpDays = Math.round(calc.absent_days);
      const refund = 0;

      fileContent += `${uan}#~#${emp.name}#~#${gross}#~#${pfWages}#~#${epsWages}#~#${edliWages}#~#${epfShare}#~#${epsShare}#~#${diffShare}#~#${ncpDays}#~#${refund}\r\n`;
      count++;
    }

    if (count === 0) {
      return res.status(400).json({ error: 'No EPF enrolled employees found to generate ECR.' });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="EPF_ECR_${orgId}_${month_year}.txt"`);
    return res.send(fileContent);
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// GET /api/v1/compliance/bank-csv/:month_year
// Returns Bulk Bank Payout CSV
// ----------------------------------------------------------------
router.get('/bank-csv/:month_year', async (req, res, next) => {
  try {
    const { month_year } = req.params;
    const orgId = req.user.org_id;

    // Fetch org settings
    const { rows: orgRows } = await db.query(
      `SELECT org_id, name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt
       FROM organizations WHERE org_id = $1`,
      [orgId]
    );
    if (!orgRows[0]) return res.status(404).json({ error: 'Organisation not found' });
    const org = orgRows[0];

    // Fetch employees
    const { rows: employees } = await db.query(
      `SELECT emp_id, name, doj, exit_date, ctc, epf_eligible, esi_eligible, status, tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan, bank_account
       FROM employees WHERE org_id = $1 AND status != 'Deleted'`,
      [orgId]
    );

    // Fetch attendance
    const { rows: dailyRecords } = await db.query(
      `SELECT emp_id, day_index, status_code FROM attendance_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    const { rows: otRecords } = await db.query(
      `SELECT emp_id, ot_hours FROM overtime_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    const otMap = {};
    for (const r of otRecords) otMap[r.emp_id] = parseFloat(r.ot_hours || 0);

    const attendanceMap = {};
    for (const r of dailyRecords) {
      if (!attendanceMap[r.emp_id]) attendanceMap[r.emp_id] = [];
      attendanceMap[r.emp_id][r.day_index - 1] = r.status_code;
    }

    let csvContent = 'BeneficiaryAccountNumber,BeneficiaryName,Amount,PaymentMode,IFSCCode,Description,Email\n';
    let count = 0;

    for (const emp of employees) {
      const days = attendanceMap[emp.emp_id] || [];
      const calc = calculatePayrollForEmployee(emp, org, month_year, { days, ot_hours: otMap[emp.emp_id] || 0 });

      if (calc.net <= 0) continue;

      let bankDetails = emp.bank_account || 'SBI 12345678901';
      const bankParts = bankDetails.split(' ');
      let bankAcc = bankParts.length > 1 ? bankParts.slice(1).join('') : bankParts[0] || '12345678901';
      let bankName = bankParts.length > 1 ? bankParts[0].toUpperCase() : 'SBI';
      
      let ifsc = `${bankName}0123456`;
      if (ifsc.length < 11) ifsc = ifsc.padEnd(11, '0');
      ifsc = ifsc.slice(0, 11);

      const email = `${emp.name.split(' ')[0].toLowerCase()}@${orgId.replace('org_', '')}.in`;
      const amount = Math.round(calc.net);
      const mode = amount > 200000 ? 'NEFT' : 'IMPS';
      const desc = `Salary Payout ${month_year}`;

      csvContent += `"${bankAcc}","${emp.name}",${amount},"${mode}","${ifsc}","${desc}","${email}"\r\n`;
      count++;
    }

    if (count === 0) {
      return res.status(400).json({ error: 'No positive salary payouts found to generate bank upload file.' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Bulk_Bank_Payout_${orgId}_${month_year}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// GET /api/v1/compliance/esi-report/:month_year
// Returns ESI Contribution Report CSV
// ----------------------------------------------------------------
router.get('/esi-report/:month_year', async (req, res, next) => {
  try {
    const { month_year } = req.params;
    const orgId = req.user.org_id;

    // Fetch org settings
    const { rows: orgRows } = await db.query(
      `SELECT org_id, name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt
       FROM organizations WHERE org_id = $1`,
      [orgId]
    );
    if (!orgRows[0]) return res.status(404).json({ error: 'Organisation not found' });
    const org = orgRows[0];

    // Fetch employees
    const { rows: employees } = await db.query(
      `SELECT emp_id, name, doj, exit_date, ctc, epf_eligible, esi_eligible, status, tds_rate, rent_paid, tax_80c, tax_80d, other_income, landlord_pan, bank_account
       FROM employees WHERE org_id = $1 AND status != 'Deleted'`,
      [orgId]
    );

    // Fetch attendance
    const { rows: dailyRecords } = await db.query(
      `SELECT emp_id, day_index, status_code FROM attendance_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    const { rows: otRecords } = await db.query(
      `SELECT emp_id, ot_hours FROM overtime_records
       WHERE org_id = $1 AND month_year = $2`,
      [orgId, month_year]
    );

    const otMap = {};
    for (const r of otRecords) otMap[r.emp_id] = parseFloat(r.ot_hours || 0);

    const attendanceMap = {};
    for (const r of dailyRecords) {
      if (!attendanceMap[r.emp_id]) attendanceMap[r.emp_id] = [];
      attendanceMap[r.emp_id][r.day_index - 1] = r.status_code;
    }

    let csvContent = 'IP_Number,IP_Name,No_of_Days,Total_Monthly_Wages,Employee_Contribution,Employer_Contribution,Reason_Code\n';
    let count = 0;

    for (const emp of employees) {
      if (!emp.esi_eligible) continue;

      const days = attendanceMap[emp.emp_id] || [];
      const calc = calculatePayrollForEmployee(emp, org, month_year, { days, ot_hours: otMap[emp.emp_id] || 0 });

      // Mock ESI IP Number
      const idNum = emp.emp_id.replace(/\D/g, '') || '101';
      const ipNumber = `3100${idNum.padStart(13, '0')}`;

      const wages = Math.round(calc.gross);
      const eeContrib = Math.round(calc.esi);
      const erContrib = Math.round(calc.esi_employer);
      const noOfDays = Math.round(calc.payable_days);
      const reasonCode = calc.absent_days > 15 ? '1' : '0'; // mock reason code

      csvContent += `"${ipNumber}","${emp.name}",${noOfDays},${wages},${eeContrib},${erContrib},"${reasonCode}"\r\n`;
      count++;
    }

    if (count === 0) {
      return res.status(400).json({ error: 'No ESI registered employees found for this month.' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ESI_Report_${orgId}_${month_year}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
