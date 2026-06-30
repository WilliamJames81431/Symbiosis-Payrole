'use strict';

// ============================================================
// Symbiosis Payroll Engine — Pure Node.js (no DOM, no state)
// ============================================================

// ------------------------------------------------------------------
// Professional Tax slabs by state
// ------------------------------------------------------------------
const PT_TABLES = {
  telangana: (grossSalary, _month) => {
    if (grossSalary > 20000) return 200;
    if (grossSalary > 15000) return 150;
    return 0;
  },

  maharashtra: (grossSalary, month) => {
    // February is 300 for the highest slab (annual recovery month)
    if (grossSalary > 10000) return month === 2 ? 300 : 200;
    if (grossSalary > 7500) return 175;
    return 0;
  },

  karnataka: (grossSalary, _month) => {
    if (grossSalary > 25000) return 200;
    return 0;
  },

  tamilnadu: (grossSalary, _month) => {
    if (grossSalary > 12500) return 230;
    if (grossSalary > 10000) return 171;
    if (grossSalary > 7500) return 115;
    if (grossSalary > 5000) return 60;
    if (grossSalary > 3000) return 30;
    return 0;
  },

  // West Bengal
  westbengal: (grossSalary, _month) => {
    if (grossSalary > 40000) return 200;
    if (grossSalary > 25000) return 150;
    if (grossSalary > 15000) return 110;
    if (grossSalary > 10000) return 80;
    if (grossSalary > 7500) return 30;
    return 0;
  },

  // Default / fallback — mirrors Telangana slabs
  default: (grossSalary, _month) => {
    if (grossSalary > 20000) return 200;
    if (grossSalary > 15000) return 150;
    return 0;
  },
};

// ------------------------------------------------------------------
// LWF (Labour Welfare Fund) contribution tables
// ------------------------------------------------------------------
const LWF_TABLES = {
  maharashtra: { employee: 25, employer: 75 },
  karnataka:   { employee: 20, employer: 40 },
  // Telangana / TN / WB / others — common estimate
  default:     { employee: 15, employer: 30 },
};

// ------------------------------------------------------------------
// getDaysInMonth(year, month)
// month is 1-indexed (1 = January, 12 = December)
// ------------------------------------------------------------------
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// ------------------------------------------------------------------
// calculateAnnualTax(employee, org)
// Computes annual income tax under the New Tax Regime (FY 2026-27).
// Returns detailed breakdown including monthlyTds.
// ------------------------------------------------------------------
function calculateAnnualTax(employee, org) {
  const annualCTC = employee.ctc * 12;
  const basicAnnual = (employee.ctc * (org.basic_pct / 100)) * 12;
  const hraAnnual = (employee.ctc * 0.25) * 12;

  // 1. HRA Exemption — Section 10(13A)
  const rentPaidAnnual = (parseFloat(employee.rent_paid) || 0) * 12;
  let hraExemption = 0;
  if (rentPaidAnnual > 0) {
    hraExemption = Math.max(
      0,
      Math.min(
        hraAnnual,
        rentPaidAnnual - 0.1 * basicAnnual,
        0.4 * basicAnnual
      )
    );
  }

  // 2. Chapter VI-A Deductions
  const ded80C = Math.min(150000, parseFloat(employee.tax_80c) || 0);
  const ded80D = Math.min(25000, parseFloat(employee.tax_80d) || 0);
  const otherIncome = parseFloat(employee.other_income) || 0;

  // 3. Taxable Income (Standard Deduction ₹50,000)
  const standardDeduction = 50000;
  const taxableIncome = Math.max(
    0,
    annualCTC - standardDeduction - hraExemption - ded80C - ded80D + otherIncome
  );

  // 4. New Tax Regime Slabs (FY 2026-27 simulated)
  // Rebate u/s 87A: No tax if taxable income <= ₹7,00,000
  let tax = 0;
  if (taxableIncome > 700000) {
    let tempIncome = taxableIncome;

    if (tempIncome > 1500000) {
      tax += (tempIncome - 1500000) * 0.30;
      tempIncome = 1500000;
    }
    if (tempIncome > 1200000) {
      tax += (tempIncome - 1200000) * 0.20;
      tempIncome = 1200000;
    }
    if (tempIncome > 900000) {
      tax += (tempIncome - 900000) * 0.15;
      tempIncome = 900000;
    }
    if (tempIncome > 600000) {
      tax += (tempIncome - 600000) * 0.10;
      tempIncome = 600000;
    }
    if (tempIncome > 300000) {
      tax += (tempIncome - 300000) * 0.05;
      // tempIncome = 300000; // no further slab
    }
  }

  // 5. Education Cess @ 4%
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const monthlyTds = totalTax / 12;

  return {
    annualCTC,
    basicAnnual,
    hraAnnual,
    rentPaidAnnual,
    hraExemption,
    ded80C,
    ded80D,
    otherIncome,
    standardDeduction,
    taxableIncome,
    totalTax,
    monthlyTds,
  };
}

// ------------------------------------------------------------------
// calculatePayrollForEmployee
//
// @param {object} employee   — row from employees table
// @param {object} org        — row from organizations table
// @param {string} monthYear  — 'YYYY-MM'
// @param {object|null} attendanceRecord — row from attendance_records
//        { days: string[], ot_hours: number }
// @param {object|null} adjustmentData
//        { variable_earnings, adjustments, justification }
// @param {number} epfoCeiling — optional override (default 15000)
//
// @returns {object} full payroll breakdown for this employee+month
// ------------------------------------------------------------------
function calculatePayrollForEmployee(
  employee,
  org,
  monthYear,
  attendanceRecord,
  adjustmentData = null,
  epfoCeiling = 15000
) {
  const [yearStr, monthStr] = monthYear.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const totalDays = getDaysInMonth(year, month);

  // ---- A. Tenure days (handles mid-month joiners & exits) --------
  const empDOJ = new Date(employee.doj);
  const empExit = employee.exit_date ? new Date(employee.exit_date) : null;

  let preDOJCount = 0;
  let postExitCount = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dayDate = new Date(year, month - 1, d);
    if (dayDate < empDOJ) {
      preDOJCount++;
    } else if (empExit && dayDate > empExit) {
      postExitCount++;
    }
  }

  const nonEmployableDays = preDOJCount + postExitCount;
  const tenureDays = totalDays - nonEmployableDays;

  // ---- B. Payable days & OT hours --------------------------------
  const validCodes = ['P', 'WO', 'H', 'EL', 'CO'];
  let absentDays = 0;
  let payableDays;
  let otHours = 0;

  if (attendanceRecord) {
    otHours = Number(attendanceRecord.ot_hours || attendanceRecord.ot || 0);

    const rawDays = Array.isArray(attendanceRecord.days)
      ? attendanceRecord.days
      : JSON.parse(attendanceRecord.days || '[]');

    let aCount = 0;

    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(year, month - 1, d);
      // Skip non-employable days — not counted as absence
      if (dayDate < empDOJ || (empExit && dayDate > empExit)) continue;

      const code = (rawDays[d - 1] || 'A').toUpperCase();
      if (!validCodes.includes(code)) {
        aCount++;
      }
    }

    absentDays = aCount;
    payableDays = tenureDays - absentDays;
  } else {
    // No attendance data → zero payable days (conservative / compliant default)
    payableDays = 0;
    absentDays = tenureDays;
  }

  // Clamp payable days to valid range
  payableDays = Math.max(0, Math.min(payableDays, tenureDays));

  // ---- C. Pro-rata base earnings ---------------------------------
  const basicPct = org.basic_pct / 100;
  const basicConfig = employee.ctc * basicPct;
  const hraConfig   = employee.ctc * 0.25;
  const daConfig    = employee.ctc * 0.05;
  const convConfig  = employee.ctc * 0.05;
  const medConfig   = employee.ctc * 0.05;

  const proRataFactor = totalDays > 0 ? payableDays / totalDays : 0;

  const basicEarned = basicConfig * proRataFactor;
  const hraEarned   = hraConfig   * proRataFactor;
  const daEarned    = daConfig    * proRataFactor;
  const convEarned  = convConfig  * proRataFactor;
  const medEarned   = medConfig   * proRataFactor;

  const totalBaseEarnings = basicEarned + hraEarned + daEarned + convEarned + medEarned;

  // ---- D. Gross Salary -------------------------------------------
  const otPay          = otHours * (Number(org.ot_rate) || 200);
  const bonus          = adjustmentData ? parseFloat(adjustmentData.variable_earnings || 0) : 0;
  const adhocAdjust    = adjustmentData ? parseFloat(adjustmentData.adjustments || 0) : 0;

  const grossSalary = totalBaseEarnings + otPay + bonus + adhocAdjust;

  // ---- E. Statutory Deductions -----------------------------------

  // 1. EPF — 12% of basic (capped at EPFO ceiling of ₹15,000)
  let pfDeduction = 0;
  let pfEmployerLiability = 0;
  if (employee.epf_eligible) {
    const pfBasis = Math.min(basicEarned, epfoCeiling);
    pfDeduction = pfBasis * 0.12;
    pfEmployerLiability = pfBasis * 0.12;
  }

  // 2. ESI — 0.75% employee / 3.25% employer (only if gross <= ₹21,000)
  let esiDeduction = 0;
  let esiEmployerLiability = 0;
  if (employee.esi_eligible && grossSalary <= 21000) {
    esiDeduction = grossSalary * 0.0075;
    esiEmployerLiability = grossSalary * 0.0325;
  }

  // 3. Professional Tax (state-specific slabs)
  const statePt = (org.state_pt || 'default').toLowerCase().replace(/\s+/g, '');
  const ptFn = PT_TABLES[statePt] || PT_TABLES.default;
  const ptDeduction = ptFn(grossSalary, month);

  // 4. LWF (Labour Welfare Fund)
  let lwfDeduction = 0;
  let lwfEmployerLiability = 0;
  if (grossSalary > 3000) {
    const lwfState = statePt === 'maharashtra' ? 'maharashtra'
      : statePt === 'karnataka' ? 'karnataka'
      : 'default';
    const lwf = LWF_TABLES[lwfState];
    lwfDeduction = lwf.employee;
    lwfEmployerLiability = lwf.employer;
  }

  // 5. TDS
  let tdsDeduction = 0;
  const tdsRate = employee.tds_rate !== null && employee.tds_rate !== undefined
    ? parseFloat(employee.tds_rate)
    : null;

  if (tdsRate !== null) {
    // Manual override TDS rate
    tdsDeduction = grossSalary * (tdsRate / 100);
  } else {
    // Auto-computed slab TDS
    const taxCalc = calculateAnnualTax(employee, org);
    tdsDeduction = taxCalc.monthlyTds * proRataFactor;
  }

  // ---- F. Gratuity Accrual (liability only — not deducted from employee) ---
  const today = new Date();
  const tenureMs = Math.max(0, today - empDOJ);
  const tenureYears = tenureMs / (1000 * 60 * 60 * 24 * 365.25);
  const gratuityAccrualRate = (15 / 26) * (basicConfig / 12); // monthly accrual
  const cumulativeGratuityAccrued = tenureYears >= 0
    ? (15 / 26) * basicConfig * tenureYears
    : 0;

  // ---- G. Net Pay ------------------------------------------------
  const totalDeductions = pfDeduction + esiDeduction + ptDeduction + tdsDeduction + lwfDeduction;
  const netPayable = Math.max(0, grossSalary - totalDeductions);

  // ---- H. Compliance Warnings ------------------------------------
  const warnings = [];

  if (grossSalary > 0 && grossSalary < org.minimum_wage) {
    warnings.push(
      `Minimum Wage Alert: Gross ₹${Math.round(grossSalary)} is below statutory minimum ₹${org.minimum_wage}.`
    );
  }

  if (basicEarned <= 15000 && !employee.epf_eligible) {
    warnings.push(
      `EPF Eligibility Warning: Paid Basic ₹${Math.round(basicEarned)} ≤ ₹15,000 — EPF enrollment is legally mandatory.`
    );
  }

  if (grossSalary <= 21000 && !employee.esi_eligible) {
    warnings.push(
      `ESI Eligibility Warning: Gross ₹${Math.round(grossSalary)} ≤ ₹21,000 — ESI enrollment is legally mandatory.`
    );
  }

  return {
    emp_id:              employee.emp_id,
    name:                employee.name,
    ctc:                 employee.ctc,
    month_year:          monthYear,
    total_days:          totalDays,
    tenure_days:         tenureDays,
    absent_days:         absentDays,
    payable_days:        payableDays,
    pro_rata_factor:     proRataFactor,

    // Earnings
    basic_earned:        basicEarned,
    hra_earned:          hraEarned,
    da_earned:           daEarned,
    conv_earned:         convEarned,
    med_earned:          medEarned,
    ot_hours:            otHours,
    ot_pay:              otPay,
    bonus:               bonus,
    adjustments:         adhocAdjust,
    gross:               grossSalary,

    // Deductions
    pf:                  pfDeduction,
    pf_employer:         pfEmployerLiability,
    esi:                 esiDeduction,
    esi_employer:        esiEmployerLiability,
    pt:                  ptDeduction,
    tds:                 tdsDeduction,
    lwf:                 lwfDeduction,
    lwf_employer:        lwfEmployerLiability,
    total_deductions:    totalDeductions,

    // Net
    net:                 netPayable,

    // Gratuity (employer liability only)
    gratuity_monthly:    gratuityAccrualRate,
    gratuity_accrued:    cumulativeGratuityAccrued,
    tenure_years:        tenureYears,

    // Metadata
    warnings,
    justification: adjustmentData?.justification || '',
    state_pt:      statePt,
  };
}

module.exports = {
  getDaysInMonth,
  calculateAnnualTax,
  calculatePayrollForEmployee,
  PT_TABLES,
  LWF_TABLES,
};
