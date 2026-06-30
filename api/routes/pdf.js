'use strict';

const express = require('express');
const fetch = require('node-fetch');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { generatePayslipHTML } = require('../templates/payslip');

const router = express.Router();

// GET /api/v1/pdf/payslip
// Query params: emp_id, month_year
router.get('/payslip', authenticate, async (req, res, next) => {
  try {
    const { emp_id, month_year } = req.query;
    const orgId = req.user.org_id;

    if (!emp_id || !month_year) {
      return res.status(400).json({ error: 'emp_id and month_year query parameters are required' });
    }

    // Security: Employee role can only download their own payslip
    if (req.user.role === 'Employee' && req.user.emp_id !== emp_id) {
      return res.status(403).json({ error: 'Access denied: Cannot fetch another employee\'s payslip' });
    }

    // Fetch payroll record
    const { rows: [record] } = await db.query(
      `SELECT
         pr.id AS record_id, pr.emp_id, pr.name, pr.ctc, pr.payable_days, pr.total_days, pr.tenure_days, pr.gross,
         pr.basic, pr.hra, pr.da, pr.conveyance, pr.medical,
         pr.pf_employee, pr.pf_employer, pr.esi_employee, pr.esi_employer, pr.pt, pr.lwf, pr.tds, pr.ot_pay, pr.bonus, pr.adjustments,
         pr.adjustment_note, pr.net, pr.pro_rata_factor, pr.gratuity_accrual,
         e.designation, e.department, o.name AS org_name
       FROM payroll_records pr
       JOIN payroll_runs run ON run.id = pr.run_id
       JOIN employees e ON e.emp_id = pr.emp_id AND e.org_id = pr.org_id
       JOIN organizations o ON o.org_id = pr.org_id
       WHERE pr.emp_id = $1 AND pr.org_id = $2 AND run.month_year = $3 AND run.status = 'Locked'
       LIMIT 1`,
      [emp_id, orgId, month_year]
    );

    if (!record) {
      return res.status(404).json({ error: `Payslip not found for employee ${emp_id} in month ${month_year}` });
    }

    // Generate HTML using server-side template (matches database columns to payslip template keys)
    const templateRecord = {
      emp_id: record.emp_id,
      name: record.name,
      designation: record.designation,
      department: record.department,
      org_name: record.org_name,
      month_year: record.month_year || month_year,
      ctc: parseFloat(record.ctc || 0),
      payable_days: parseInt(record.payable_days || 0, 10),
      total_days: parseInt(record.total_days || 0, 10),
      gross: parseFloat(record.gross || 0),
      basic: parseFloat(record.basic || 0),
      hra: parseFloat(record.hra || 0),
      da: parseFloat(record.da || 0),
      pf_employee: parseFloat(record.pf_employee || 0),
      pf_employer: parseFloat(record.pf_employer || 0),
      esi_employee: parseFloat(record.esi_employee || 0),
      esi_employer: parseFloat(record.esi_employer || 0),
      pt: parseFloat(record.pt || 0),
      lwf: parseFloat(record.lwf || 0),
      tds: parseFloat(record.tds || 0),
      ot_pay: parseFloat(record.ot_pay || 0),
      bonus: parseFloat(record.bonus || 0),
      adjustments: parseFloat(record.adjustments || 0),
      net: parseFloat(record.net || 0),
    };

    const html = generatePayslipHTML(templateRecord);

    const pdfServiceUrl = process.env.PDF_SERVICE_URL || 'http://localhost:3001';
    const pdfServiceSecret = process.env.PDF_SERVICE_SECRET;

    if (!pdfServiceSecret) {
      // Return HTML for review if PDF service secret is not set (useful in local dev mode)
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    // Call standalone Puppeteer PDF service
    const pdfResponse = await fetch(`${pdfServiceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pdf-secret': pdfServiceSecret
      },
      body: JSON.stringify({
        html,
        filename: `Payslip-${record.name.replace(/\s+/g, '_')}-${month_year}.pdf`
      })
    });

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text();
      console.error('[PDF-SERVICE] Error response:', errText);
      return res.status(502).json({ error: 'Failed to generate PDF from PDF microservice', detail: errText });
    }

    // Stream PDF buffer back to client
    const pdfBuffer = await pdfResponse.buffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Payslip_${emp_id}_${month_year}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);

  } catch (err) {
    return next(err);
  }
});

module.exports = router;
