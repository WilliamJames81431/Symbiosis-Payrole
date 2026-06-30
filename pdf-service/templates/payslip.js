'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Number-to-Indian-Words Converter
// Handles values up to 99,99,99,999 (≈ 99 Crore)
// ─────────────────────────────────────────────────────────────────────────────

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

/**
 * Converts an integer in the range [0, 999] to English words.
 * @param {number} n
 * @returns {string}
 */
function hundredsToWords(n) {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`;
  return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' + hundredsToWords(n % 100) : ''}`;
}

/**
 * Converts a non-negative integer to Indian number-system words.
 * e.g. 52000 → "Fifty Two Thousand"
 * @param {number} n  – must be a non-negative integer
 * @returns {string}
 */
function integerToIndianWords(n) {
  if (n === 0) return 'Zero';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const rest = n;

  const parts = [];
  if (crore)   parts.push(`${hundredsToWords(crore)} Crore`);
  if (lakh)    parts.push(`${hundredsToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${hundredsToWords(thousand)} Thousand`);
  if (rest)    parts.push(hundredsToWords(rest));

  return parts.join(' ');
}

/**
 * Converts a monetary amount (may have decimals) to Indian-currency words.
 * e.g. 52000    → "Rupees Fifty Two Thousand Only"
 *      52000.50 → "Rupees Fifty Two Thousand and Fifty Paise Only"
 * @param {number|string} amount
 * @returns {string}
 */
function amountToWords(amount) {
  const num = parseFloat(amount) || 0;
  const rupees = Math.floor(num);
  const paise  = Math.round((num - rupees) * 100);

  let result = `Rupees ${integerToIndianWords(rupees)}`;
  if (paise > 0) {
    result += ` and ${integerToIndianWords(paise)} Paise`;
  }
  result += ' Only';
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a number as Indian currency string, e.g. 52000 → "52,000.00"
 * @param {number|string} val
 * @returns {string}
 */
function fmt(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Returns a table row HTML string for an earnings / deductions line item.
 * @param {string} label
 * @param {number|string} value
 * @param {boolean} [bold=false]
 * @returns {string}
 */
function row(label, value, bold = false) {
  const style = bold ? ' style="font-weight:700;"' : '';
  return `
    <tr${style}>
      <td class="item-label"${bold ? ' style="font-weight:700;"' : ''}>${label}</td>
      <td class="item-value"${bold ? ' style="font-weight:700;"' : ''}>${fmt(value)}</td>
    </tr>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a complete, self-contained HTML payslip document.
 *
 * @param {Object} record
 * @param {string|number} record.emp_id          – Employee ID
 * @param {string}        record.name            – Employee full name
 * @param {string}        record.designation     – Job title
 * @param {string}        record.department      – Department name
 * @param {string}        record.org_name        – Organisation / company name
 * @param {string}        record.month_year      – e.g. "May 2025"
 * @param {number}        record.ctc             – Cost to Company (annual)
 * @param {number}        record.payable_days    – Actual days worked/payable
 * @param {number}        record.total_days      – Total days in the month
 * @param {number}        record.gross           – Gross earnings for the month
 * @param {number}        record.basic           – Basic pay
 * @param {number}        record.hra             – House Rent Allowance
 * @param {number}        record.da              – Dearness Allowance
 * @param {number}        record.pf_employee     – PF deducted from employee
 * @param {number}        record.pf_employer     – PF contributed by employer
 * @param {number}        record.esi_employee    – ESI deducted from employee
 * @param {number}        record.esi_employer    – ESI contributed by employer
 * @param {number}        record.pt              – Professional Tax
 * @param {number}        record.lwf             – Labour Welfare Fund
 * @param {number}        record.tds             – Tax Deducted at Source
 * @param {number}        record.ot_pay          – Overtime pay
 * @param {number}        record.bonus           – Bonus / incentive
 * @param {number}        record.adjustments     – Any other adjustments (positive = earning)
 * @param {number}        record.net             – Net take-home pay
 * @returns {string}  Complete HTML document string
 */
function generatePayslipHTML(record) {
  const {
    emp_id        = '',
    name          = '',
    designation   = '',
    department    = '',
    org_name      = 'Organisation',
    month_year    = '',
    ctc           = 0,
    payable_days  = 0,
    total_days    = 0,
    gross         = 0,
    basic         = 0,
    hra           = 0,
    da            = 0,
    pf_employee   = 0,
    pf_employer   = 0,
    esi_employee  = 0,
    esi_employer  = 0,
    pt            = 0,
    lwf           = 0,
    tds           = 0,
    ot_pay        = 0,
    bonus         = 0,
    adjustments   = 0,
    net           = 0,
  } = record;

  // ── Computed Totals ──────────────────────────────────────────────────────
  const grossTotal = parseFloat(gross) || (
    parseFloat(basic) + parseFloat(hra) + parseFloat(da) +
    parseFloat(ot_pay) + parseFloat(bonus) + parseFloat(adjustments)
  );

  const totalDeductions =
    parseFloat(pf_employee) +
    parseFloat(pf_employer) +
    parseFloat(esi_employee) +
    parseFloat(esi_employer) +
    parseFloat(pt) +
    parseFloat(lwf) +
    parseFloat(tds);

  const netPay = parseFloat(net) || (grossTotal - totalDeductions);

  const netInWords = amountToWords(netPay);

  // ── HTML ─────────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payslip – ${escapeHtml(String(name))} – ${escapeHtml(String(month_year))}</title>
  <style>
    /* ── Reset & Base ────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 12px;
      color: #1d1d1f;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Page Wrapper ────────────────────────────────────────────────── */
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 10mm 12mm;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* ── Header ──────────────────────────────────────────────────────── */
    .header {
      background: #1d1d1f;
      color: #ffffff;
      border-radius: 6px 6px 0 0;
      padding: 14px 20px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header .org-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #ffffff;
    }

    .header .payslip-title {
      font-size: 13px;
      font-weight: 600;
      color: #0071e3;
      text-align: right;
      line-height: 1.5;
    }

    .header .payslip-period {
      font-size: 11px;
      color: #a1a1a6;
      text-align: right;
      margin-top: 2px;
    }

    /* ── Subheader bar ───────────────────────────────────────────────── */
    .subheader {
      background: #0071e3;
      height: 4px;
    }

    /* ── Employee Info Grid ──────────────────────────────────────────── */
    .info-section {
      border: 1px solid #d2d2d7;
      border-top: none;
      padding: 14px 20px;
    }

    .info-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6e6e73;
      margin-bottom: 10px;
      border-bottom: 1px solid #e5e5ea;
      padding-bottom: 6px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-item .label {
      font-size: 9.5px;
      font-weight: 600;
      color: #6e6e73;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item .value {
      font-size: 12px;
      font-weight: 600;
      color: #1d1d1f;
    }

    /* ── Days Summary Bar ────────────────────────────────────────────── */
    .days-bar {
      background: #f5f5f7;
      border: 1px solid #d2d2d7;
      border-top: none;
      padding: 8px 20px;
      display: flex;
      gap: 32px;
      align-items: center;
    }

    .days-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .days-item .d-label {
      font-size: 10px;
      color: #6e6e73;
      font-weight: 500;
    }

    .days-item .d-value {
      font-size: 12px;
      font-weight: 700;
      color: #1d1d1f;
    }

    .days-item .d-sep {
      color: #0071e3;
      font-weight: 700;
      font-size: 14px;
    }

    /* ── Earnings / Deductions Table ─────────────────────────────────── */
    .pay-section {
      border: 1px solid #d2d2d7;
      border-top: none;
    }

    .pay-tables-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .pay-col {
      padding: 0;
    }

    .pay-col:first-child {
      border-right: 1px solid #d2d2d7;
    }

    .pay-col-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 8px 14px;
      background: #f5f5f7;
      border-bottom: 1px solid #d2d2d7;
    }

    .pay-col-title.earnings-title  { color: #1b8a3e; }
    .pay-col-title.deductions-title { color: #c0392b; }

    table.pay-table {
      width: 100%;
      border-collapse: collapse;
    }

    table.pay-table tr {
      border-bottom: 1px solid #e5e5ea;
    }

    table.pay-table tr:last-child {
      border-bottom: none;
    }

    table.pay-table td {
      padding: 6px 14px;
      font-size: 11.5px;
      vertical-align: middle;
    }

    td.item-label {
      color: #3a3a3c;
      width: 65%;
    }

    td.item-value {
      color: #1d1d1f;
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 500;
      white-space: nowrap;
    }

    /* ── Totals Row ──────────────────────────────────────────────────── */
    .totals-row td {
      background: #f5f5f7;
      font-weight: 700 !important;
      font-size: 12px !important;
      padding: 8px 14px !important;
      border-top: 2px solid #d2d2d7 !important;
    }

    .totals-row.earnings-total td { color: #1b8a3e; }
    .totals-row.deductions-total td { color: #c0392b; }

    /* ── Net Pay Box ─────────────────────────────────────────────────── */
    .net-pay-section {
      border: 1px solid #d2d2d7;
      border-top: none;
      background: #1d1d1f;
      border-radius: 0 0 6px 6px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .net-pay-left .net-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #a1a1a6;
      font-weight: 600;
      margin-bottom: 3px;
    }

    .net-pay-left .net-in-words {
      font-size: 12px;
      color: #f5f5f7;
      font-style: italic;
    }

    .net-pay-right .net-amount {
      font-size: 26px;
      font-weight: 700;
      color: #0071e3;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.5px;
    }

    .net-pay-right .net-currency {
      font-size: 13px;
      color: #a1a1a6;
      margin-right: 4px;
      vertical-align: super;
    }

    /* ── CTC Row ─────────────────────────────────────────────────────── */
    .ctc-row {
      border: 1px solid #d2d2d7;
      border-top: none;
      border-bottom: none;
      padding: 7px 20px;
      background: #f5f5f7;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .ctc-row .ctc-label {
      font-size: 10px;
      color: #6e6e73;
      font-weight: 500;
    }
    .ctc-row .ctc-value {
      font-size: 12px;
      color: #1d1d1f;
      font-weight: 700;
    }

    /* ── Footer ──────────────────────────────────────────────────────── */
    .footer {
      margin-top: 14px;
      text-align: center;
      font-size: 9.5px;
      color: #8e8e93;
      letter-spacing: 0.2px;
      padding: 8px 0;
      border-top: 1px dashed #d2d2d7;
    }

    /* ── Print Directives ────────────────────────────────────────────── */
    @media print {
      body { background: #fff; }
      .page { margin: 0; padding: 8mm 10mm; }
      .pay-tables-wrapper,
      .net-pay-section,
      .info-section,
      .pay-section { page-break-inside: avoid; }
    }

    @page {
      size: A4;
      margin: 15mm;
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <div class="header">
    <div class="org-name">${escapeHtml(String(org_name))}</div>
    <div>
      <div class="payslip-title">PAYSLIP</div>
      <div class="payslip-period">${escapeHtml(String(month_year))}</div>
    </div>
  </div>
  <div class="subheader"></div>

  <!-- ── Employee Information ────────────────────────────────────────────── -->
  <div class="info-section">
    <div class="info-title">Employee Information</div>
    <div class="info-grid">

      <div class="info-item">
        <span class="label">Employee Name</span>
        <span class="value">${escapeHtml(String(name))}</span>
      </div>

      <div class="info-item">
        <span class="label">Employee ID</span>
        <span class="value">${escapeHtml(String(emp_id))}</span>
      </div>

      <div class="info-item">
        <span class="label">Pay Period</span>
        <span class="value">${escapeHtml(String(month_year))}</span>
      </div>

      <div class="info-item">
        <span class="label">Designation</span>
        <span class="value">${escapeHtml(String(designation))}</span>
      </div>

      <div class="info-item">
        <span class="label">Department</span>
        <span class="value">${escapeHtml(String(department))}</span>
      </div>

      <div class="info-item">
        <span class="label">Organisation</span>
        <span class="value">${escapeHtml(String(org_name))}</span>
      </div>

    </div>
  </div>

  <!-- ── Days Summary ─────────────────────────────────────────────────────── -->
  <div class="days-bar">
    <div class="days-item">
      <span class="d-label">Total Days in Month</span>
      <span class="d-sep">:</span>
      <span class="d-value">${escapeHtml(String(total_days))}</span>
    </div>
    <div class="days-item">
      <span class="d-label">Payable Days</span>
      <span class="d-sep">:</span>
      <span class="d-value">${escapeHtml(String(payable_days))}</span>
    </div>
  </div>

  <!-- ── CTC ──────────────────────────────────────────────────────────────── -->
  <div class="ctc-row">
    <span class="ctc-label">Annual CTC (Cost to Company)</span>
    <span class="ctc-value">&#8377; ${fmt(ctc)}</span>
  </div>

  <!-- ── Earnings & Deductions ────────────────────────────────────────────── -->
  <div class="pay-section">
    <div class="pay-tables-wrapper">

      <!-- Earnings -->
      <div class="pay-col">
        <div class="pay-col-title earnings-title">&#9650; Earnings</div>
        <table class="pay-table">
          <tbody>
            ${row('Basic Pay', basic)}
            ${row('House Rent Allowance (HRA)', hra)}
            ${row('Dearness Allowance (DA)', da)}
            ${parseFloat(ot_pay) > 0 ? row('Overtime Pay', ot_pay) : ''}
            ${parseFloat(bonus) > 0 ? row('Bonus / Incentive', bonus) : ''}
            ${parseFloat(adjustments) !== 0 ? row('Other Adjustments', adjustments) : ''}
            <!-- spacer rows for vertical alignment -->
            ${buildSpacerRows(6, [
              parseFloat(ot_pay) > 0,
              parseFloat(bonus) > 0,
              parseFloat(adjustments) !== 0,
            ])}
            <tr class="totals-row earnings-total">
              <td class="item-label">GROSS TOTAL</td>
              <td class="item-value">&#8377; ${fmt(grossTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Deductions -->
      <div class="pay-col">
        <div class="pay-col-title deductions-title">&#9660; Deductions</div>
        <table class="pay-table">
          <tbody>
            ${row('PF – Employee Contribution', pf_employee)}
            ${row('PF – Employer Contribution', pf_employer)}
            ${row('ESI – Employee Share', esi_employee)}
            ${row('ESI – Employer Share', esi_employer)}
            ${row('Professional Tax (PT)', pt)}
            ${row('Labour Welfare Fund (LWF)', lwf)}
            ${row('Tax Deducted at Source (TDS)', tds)}
            <tr class="totals-row deductions-total">
              <td class="item-label">TOTAL DEDUCTIONS</td>
              <td class="item-value">&#8377; ${fmt(totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div><!-- /.pay-tables-wrapper -->
  </div><!-- /.pay-section -->

  <!-- ── Net Pay ──────────────────────────────────────────────────────────── -->
  <div class="net-pay-section">
    <div class="net-pay-left">
      <div class="net-label">Net Take-Home Pay</div>
      <div class="net-in-words">${escapeHtml(netInWords)}</div>
    </div>
    <div class="net-pay-right">
      <span class="net-currency">&#8377;</span>
      <span class="net-amount">${fmt(netPay)}</span>
    </div>
  </div>

  <!-- ── Footer ───────────────────────────────────────────────────────────── -->
  <div class="footer">
    This is a computer generated payslip and does not require a signature.
    &nbsp;|&nbsp; Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
    &nbsp;|&nbsp; ${escapeHtml(String(org_name))}
  </div>

</div><!-- /.page -->
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escapes HTML special characters to prevent XSS inside the template.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates empty spacer rows so that the deductions column always starts
 * its "TOTAL DEDUCTIONS" row aligned with the earnings "GROSS TOTAL" row.
 *
 * maxOptionalRows: the maximum number of optional rows that could be shown.
 * activeFlags: array of booleans indicating which optional rows are currently shown.
 *
 * Returns HTML <tr> spacer elements for the EARNINGS column only.
 * (Deductions always has 7 fixed rows + 1 total = 8, so no spacers needed there.)
 *
 * @param {number}    maxOptionalRows
 * @param {boolean[]} activeFlags
 * @returns {string}
 */
function buildSpacerRows(maxOptionalRows, activeFlags) {
  // Fixed earnings rows: Basic, HRA, DA = 3 fixed
  // Deductions has 7 fixed rows
  // We add spacers to earnings to match deduction row count (7 fixed rows)
  const DEDUCTION_FIXED_ROWS = 7; // PF-E, PF-ER, ESI-E, ESI-ER, PT, LWF, TDS
  const EARNINGS_FIXED_ROWS  = 3; // Basic, HRA, DA

  const activeOptional = activeFlags.filter(Boolean).length;
  const earningsTotalRows = EARNINGS_FIXED_ROWS + activeOptional;
  const spacersNeeded = Math.max(0, DEDUCTION_FIXED_ROWS - earningsTotalRows);

  return Array.from({ length: spacersNeeded }, () =>
    `<tr><td class="item-label">&nbsp;</td><td class="item-value">&nbsp;</td></tr>`
  ).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = { generatePayslipHTML, amountToWords, fmt };
