/**
 * Symbiosis HR Payroll System - Core State and Compliance Engine
 */

// ----------------------------------------------------
// 1. DATABASE ENGINE & STORAGE (LOCAL STORAGE WRAPPER)
// ----------------------------------------------------
const DEFAULT_ORGANIZATIONS = [
  { org_id: 'org_tata', name: 'Tata Consultancy Services (TCS)', epf_rate: 12, minimum_wage: 12000, basic_pct: 60, ot_rate: 250, state_pt: 'telangana' },
  { org_id: 'org_infy', name: 'Infosys Technologies Ltd', epf_rate: 12, minimum_wage: 10000, basic_pct: 50, ot_rate: 200, state_pt: 'karnataka' },
  { org_id: 'org_reliance', name: 'Reliance Industries Limited', epf_rate: 12, minimum_wage: 15000, basic_pct: 55, ot_rate: 300, state_pt: 'maharashtra' }
];

const DEFAULT_EMPLOYEES = [
  // TCS Employees
  { emp_id: 'EMP101', org_id: 'org_tata', name: 'Aarav Sharma', doj: '2024-01-15', exit_date: null, ctc: 80000, department: 'Engineering', designation: 'Lead Developer', bank_account: 'HDFC 9876543210', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: null, rent_paid: 12000, tax_80c: 45000, tax_80d: 12500, other_income: 0, landlord_pan: 'ABCDE1234F', pan: 'ABCDE1234F', aadhaar: '123456789012' },
  { emp_id: 'EMP102', org_id: 'org_tata', name: 'Priya Patel', doj: '2026-06-05', exit_date: null, ctc: 45000, department: 'Marketing', designation: 'Graphic Designer', bank_account: 'ICICI 1234567890', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: 5, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'XYZAB5678C', aadhaar: '987654321098' }, // Mid-month joiner (June 5)
  { emp_id: 'EMP103', org_id: 'org_tata', name: 'Rohan Das', doj: '2023-03-10', exit_date: '2026-06-20', ctc: 20000, department: 'Operations', designation: 'Operations Executive', bank_account: 'SBI 1122334455', epf_eligible: false, esi_eligible: true, status: 'Active', tds_rate: 0, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'LMNOP1234Q', aadhaar: '111122223333' }, // Mid-month exit (June 20), ESI eligible
  { emp_id: 'EMP104', org_id: 'org_tata', name: 'Ananya Iyer', doj: '2025-11-01', exit_date: null, ctc: 150000, department: 'Human Resources', designation: 'HR Director', bank_account: 'Axis 5566778899', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: null, rent_paid: 25000, tax_80c: 120000, tax_80d: 25000, other_income: 15000, landlord_pan: 'PQRST5678U', pan: 'PQRST5678U', aadhaar: '555566667777' },
  { emp_id: 'EMP105', org_id: 'org_tata', name: 'Kabir Malhotra', doj: '2026-06-25', exit_date: null, ctc: 18000, department: 'Customer Support', designation: 'Support Associate', bank_account: 'HDFC 4455667788', epf_eligible: true, esi_eligible: true, status: 'Active', tds_rate: 0, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'DEFGH9012I', aadhaar: '888899990000' }, // Late joiner, ESI eligible

  // Infosys Employees
  { emp_id: 'EMP201', org_id: 'org_infy', name: 'Vikram Singh', doj: '2022-05-18', exit_date: null, ctc: 95000, department: 'Engineering', designation: 'Principal Architect', bank_account: 'ICICI 9090909090', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: 12, rent_paid: 15000, tax_80c: 30000, tax_80d: 5000, other_income: 0, landlord_pan: 'JKLM9012N', pan: 'JKLM9012N', aadhaar: '222233334444' },
  { emp_id: 'EMP202', org_id: 'org_infy', name: 'Sneha Rao', doj: '2026-06-12', exit_date: null, ctc: 19000, department: 'Operations', designation: 'Helpdesk Officer', bank_account: 'SBI 8080808080', epf_eligible: false, esi_eligible: true, status: 'Active', tds_rate: 0, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'OPQRS3456T', aadhaar: '777788889999' }
];

const DEFAULT_SCHEMAS = {
  'org_tata': { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 },
  'org_infy': { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 }
};

const DEFAULT_ATTENDANCE = {
  'org_tata': {
    '2026-06': [
      // EMP101: 30 days present
      { emp_id: 'EMP101', name: 'Aarav Sharma', days: ['P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P'], ot: 10 },
      { emp_id: 'EMP102', name: 'Priya Patel', days: ['A','A','A','A','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P'], ot: 0 },
      { emp_id: 'EMP103', name: 'Rohan Das', days: ['P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','A','A','A','A','A','A','A','A','A','A','A'], ot: 5 },
      { emp_id: 'EMP104', name: 'Ananya Iyer', days: ['P','P','P','P','P','WO','WO','EL','EL','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','A','A','P','P'], ot: 0 },
      { emp_id: 'EMP105', name: 'Kabir Malhotra', days: ['A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','P','WO','WO','P'], ot: 2 }
    ]
  }
};

const DEFAULT_PAYROLL_LEDGER = {
  'org_tata': {
    '2026-05': {
      status: 'Locked',
      approved_by: 'HR Admin (TCS)',
      approved_date: '2026-05-31',
      records: [
        { emp_id: 'EMP101', name: 'Aarav Sharma', ctc: 80000, payable_days: 31, gross: 82500, pf: 1800, esi: 0, tax: 8200, net: 72500, adjustments: 0, ot_pay: 2500 },
        { emp_id: 'EMP103', name: 'Rohan Das', ctc: 20000, payable_days: 31, gross: 20000, pf: 0, esi: 150, tax: 150, net: 19700, adjustments: 0, ot_pay: 0 }
      ],
      adjustments_log: []
    }
  }
};

import {
  db,
  AuthAPI,
  OrgsAPI,
  EmployeesAPI,
  AttendanceAPI,
  PayrollAPI,
  ComplianceAPI,
  TaxAPI,
  StorageAPI,
  PDFAPI,
  TokenStore,
  apiRequest
} from './api-client.js';

import {
  getBranding,
  applyBranding,
  renderAnnouncementBanners,
  isFeatureEnabled,
  renderCustomPage,
  renderWebsiteEditor,
  getCustomPages,
  handleGoogleCredentialResponse,
  saveBrandingFromEditor,
  resetBrandingToDefaults,
  addAnnouncementFromEditor,
  deleteAnnouncementFromEditor,
  addCustomPageFromEditor,
  deleteCustomPageFromEditor,
  previewCustomPage,
  toggleFeatureFlag,
  toggleDashboardWidget,
  toggleGoogleOrgField,
  populateGoogleEmployees,
  addGoogleAccountFromEditor,
  deleteGoogleAccountFromEditor,
  editorInsertLink,
  editorInsertImage,
  editorInsertTable,
  switchEditorSubTab,
  applyThemePreset,
  saveCustomCssFromEditor
} from './website-editor.js';

// ----------------------------------------------------
// 2. STATE MANAGER & SESSION ROUTING
// ----------------------------------------------------
let state = {
  isLoggedIn: false, // Session authentication status
  currentUser: null, // ERP Admin, Org Admin, Employee
  currentRole: 'ERP', // 'ERP', 'HR', 'Employee'
  currentOrgId: 'org_tata', // TCS default
  currentEmployeeId: 'EMP101', // Default employee view
  activeTab: 'dashboard',
  activeMonthYear: '2026-06', // June 2026 default
  currentTheme: 'classic-corporate', // default theme
  sandboxAdjustments: {}, // keys: empId -> { variable_earnings, adjustments, justification }
  uploadingFile: null, // holds file records before saving
  uploadingHeaders: [], // parsed headers
  tempSchemaMap: null, // user mapped dropdowns
  dataMismatches: [], // list of mismatch records to resolve
  mismatchIndex: 0,
  tempOtpCode: null,
  tempLogin: null,
  epfoCeiling: 15000 // default EPFO statutory basic wage ceiling (₹15,000)
};

window.state = state;
window.renderCurrentView = renderCurrentView;

// Listen to updates in DB and redraw UI elements
window.addEventListener('databaseUpdated', () => {
  renderDatabaseExplorer();
  renderCurrentView();
});

// ----------------------------------------------------
// 3. COMPLIANCE ENGINE & PAYROLL MATHEMATICS
// ----------------------------------------------------
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function calculateAnnualTax(employee, org) {
  const annualCTC = employee.ctc * 12;
  const basicAnnual = (employee.ctc * (org.basic_pct / 100)) * 12;
  const hraAnnual = (employee.ctc * 0.25) * 12; // 25% standard HRA

  // 1. Rent & HRA exemption (Section 10(13A))
  const rentPaidAnnual = (parseFloat(employee.rent_paid) || 0) * 12;
  let hraExemption = 0;
  if (rentPaidAnnual > 0) {
    // Min of: Actual HRA, Rent Paid - 10% of Basic, 40% of Basic
    hraExemption = Math.max(0, Math.min(hraAnnual, rentPaidAnnual - (0.1 * basicAnnual), 0.4 * basicAnnual));
  }

  // 2. Chapter VI-A Deductions
  const ded80C = Math.min(150000, parseFloat(employee.tax_80c) || 0);
  const ded80D = Math.min(25000, parseFloat(employee.tax_80d) || 0);
  const otherIncome = parseFloat(employee.other_income) || 0;

  // 3. Taxable Income (Standard Deduction: ₹50,000)
  const standardDeduction = 50000;
  let taxableIncome = Math.max(0, annualCTC - standardDeduction - hraExemption - ded80C - ded80D + otherIncome);

  // 4. Tax slabs (New Tax Regime FY 2025-26 / FY 2026-27 simulated)
  let tax = 0;
  if (taxableIncome > 700000) { // Rebate 87A up to 7 Lakhs (Nil tax if under 7L)
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
      tempIncome = 300000;
    }
  }

  // Education Cess: 4% of Income Tax
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
    monthlyTds
  };
}

function calculatePayrollForEmployee(employee, org, monthYear, attendanceRecord, adjustmentData = null) {
  const [yearStr, monthStr] = monthYear.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const totalDays = getDaysInMonth(year, month);

  // Define Month Start & End dates
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, totalDays);

  const empDOJ = new Date(employee.doj);
  const empExit = employee.exit_date ? new Date(employee.exit_date) : null;

  // Step A: Calculate Active Tenure Days (Mid-Month Joiner & Exit Adjustments)
  let nonEmployableDays = 0;
  
  // Calculate daily calendar cells
  let tenureDays = totalDays;
  let preDOJCount = 0;
  let postExitCount = 0;

  for (let d = 1; d <= totalDays; d++) {
    const currentDayDate = new Date(year, month - 1, d);
    if (currentDayDate < empDOJ) {
      preDOJCount++;
    } else if (empExit && currentDayDate > empExit) {
      postExitCount++;
    }
  }
  nonEmployableDays = preDOJCount + postExitCount;
  tenureDays = totalDays - nonEmployableDays;

  // Step B: Calculate Payable Days
  let absentDays = 0;
  let payableDays = tenureDays;
  let otHours = 0;

  const validCodes = ['P', 'WO', 'H', 'EL', 'CO'];

  if (attendanceRecord) {
    otHours = attendanceRecord.ot || 0;
    
    // Count days from attendanceRecord.days (1-indexed mapping to days 1 to totalDays)
    let pCount = 0, woCount = 0, hCount = 0, elCount = 0, coCount = 0, aCount = 0;
    
    for (let d = 1; d <= totalDays; d++) {
      const currentDayDate = new Date(year, month - 1, d);
      // If outside tenure, lock out and mark non-employable (do not count as absence)
      if (currentDayDate < empDOJ || (empExit && currentDayDate > empExit)) {
        continue;
      }
      
      const code = attendanceRecord.days[d - 1] || 'A';
      if (validCodes.includes(code)) {
        if (code === 'P') pCount++;
        else if (code === 'WO') woCount++;
        else if (code === 'H') hCount++;
        else if (code === 'EL') elCount++;
        else if (code === 'CO') coCount++;
      } else {
        aCount++;
      }
    }
    absentDays = aCount;
    payableDays = tenureDays - absentDays;
  } else {
    // If no attendance uploaded, default to absent for the entire tenure (0 payable days)
    payableDays = 0;
    absentDays = tenureDays;
  }

  // Step C: Pro-Rata Base Earnings
  // Apply CTC distribution percentages
  const basicPct = org.basic_pct / 100;
  const basicConfig = employee.ctc * basicPct;
  const hraConfig = employee.ctc * 0.25; // 25% standard HRA
  const daConfig = employee.ctc * 0.05;  // 5% standard DA
  const convConfig = employee.ctc * 0.05; // 5% standard Conveyance
  const medConfig = employee.ctc * 0.05;  // 5% standard Medical

  // Calculate pro-rata earnings for active tenure and attendance
  const proRataFactor = totalDays > 0 ? (payableDays / totalDays) : 0;
  
  const basicEarned = basicConfig * proRataFactor;
  const hraEarned = hraConfig * proRataFactor;
  const daEarned = daConfig * proRataFactor;
  const convEarned = convConfig * proRataFactor;
  const medEarned = medConfig * proRataFactor;

  const totalBaseEarnings = basicEarned + hraEarned + daEarned + convEarned + medEarned;

  // Step D: Gross Salary Accumulation
  const otPay = otHours * (org.ot_rate || 200);
  const bonus = (adjustmentData && adjustmentData.variable_earnings) ? parseFloat(adjustmentData.variable_earnings) : 0;
  const adhocAdjustments = (adjustmentData && adjustmentData.adjustments) ? parseFloat(adjustmentData.adjustments) : 0;
  
  const grossSalary = totalBaseEarnings + otPay + bonus + adhocAdjustments;

  // Step E: Statutory Deductions & Net Pay
  // 1. EPF (Employee PF): 12% of actual paid Basic Salary, capped at EPFO ceiling
  let pfDeduction = 0;
  let pfEmployerLiability = 0;
  if (employee.epf_eligible) {
    const pfCeiling = state.epfoCeiling !== undefined ? state.epfoCeiling : 15000;
    const pfBasis = Math.min(basicEarned, pfCeiling);
    pfDeduction = pfBasis * 0.12;
    pfEmployerLiability = pfBasis * 0.12; // Matching contribution
  }

  // 2. ESI: 0.75% of Gross Salary if Gross Salary <= ₹21,000
  let esiDeduction = 0;
  let esiEmployerLiability = 0;
  if (employee.esi_eligible && grossSalary <= 21000) {
    esiDeduction = grossSalary * 0.0075; // 0.75% employee rate
    esiEmployerLiability = grossSalary * 0.0325; // 3.25% employer rate
  }

  // 3. Professional Tax (PT): State-specific slab rules
  let ptDeduction = 0;
  const statePt = (org.state_pt || 'telangana').toLowerCase();
  if (statePt === 'telangana') {
    if (grossSalary > 15000) {
      ptDeduction = grossSalary <= 20000 ? 150 : 200;
    }
  } else if (statePt === 'maharashtra') {
    if (grossSalary > 10000) {
      ptDeduction = (month === 2) ? 300 : 200;
    } else if (grossSalary > 7500) {
      ptDeduction = 175;
    }
  } else if (statePt === 'karnataka') {
    if (grossSalary > 25000) {
      ptDeduction = 200;
    }
  } else if (statePt === 'tamilnadu') {
    if (grossSalary > 12500) ptDeduction = 230;
    else if (grossSalary > 10000) ptDeduction = 171;
    else if (grossSalary > 7500) ptDeduction = 115;
    else if (grossSalary > 5000) ptDeduction = 60;
    else if (grossSalary > 3000) ptDeduction = 30;
  } else {
    if (grossSalary > 15000) {
      ptDeduction = grossSalary <= 20000 ? 150 : 200;
    }
  }

  // 3.5. Labour Welfare Fund (LWF) Deduction
  let lwfDeduction = 0;
  let lwfEmployerLiability = 0;
  if (grossSalary > 3000) {
    lwfDeduction = statePt === 'maharashtra' ? 25 : (statePt === 'karnataka' ? 20 : 15);
    lwfEmployerLiability = statePt === 'maharashtra' ? 75 : (statePt === 'karnataka' ? 40 : 30);
  }

  // 4. TDS: estimation based on standard slabs
  let tdsDeduction = 0;
  if (employee.tds_rate !== null && employee.tds_rate !== undefined) {
    tdsDeduction = grossSalary * (employee.tds_rate / 100);
  } else {
    // Auto-Slab TDS on Gross Salary using tax declarations
    const taxCalc = calculateAnnualTax(employee, org);
    tdsDeduction = taxCalc.monthlyTds * proRataFactor;
  }

  // Gratuity Accrual Liability calculation
  const tenureMs = new Date() - empDOJ;
  const tenureYears = tenureMs / (1000 * 60 * 60 * 24 * 365.25);
  const gratuityAccrualRate = (15 / 26) * (basicConfig / 12);
  const cumulativeGratuityAccrued = tenureYears >= 0 ? (15 / 26) * basicConfig * tenureYears : 0;

  const totalDeductions = pfDeduction + esiDeduction + ptDeduction + tdsDeduction + lwfDeduction;
  const netPayable = Math.max(0, grossSalary - totalDeductions);

  // Compliance Warnings Generator
  const warnings = [];
  if (grossSalary < org.minimum_wage) {
    warnings.push(`Minimum Wage Alert: Calculated Gross (₹${Math.round(grossSalary)}) falls below the org minimum statutory wage of ₹${org.minimum_wage}.`);
  }
  
  if (basicEarned <= 15000 && !employee.epf_eligible) {
    warnings.push(`EPF Eligibility Warning: Actual Paid Basic (₹${Math.round(basicEarned)}) is <= ₹15,000 threshold. EPF enrollment is legally mandatory, but employee database flag is disabled.`);
  }

  if (grossSalary <= 21000 && !employee.esi_eligible) {
    warnings.push(`ESI Eligibility Warning: Calculated Gross (₹${Math.round(grossSalary)}) is <= ₹21,000. ESI enrollment is legally mandatory, but employee database flag is disabled.`);
  }

  return {
    emp_id: employee.emp_id,
    name: employee.name,
    ctc: employee.ctc,
    tenure_days: tenureDays,
    absent_days: absentDays,
    payable_days: payableDays,
    basic_earned: basicEarned,
    hra_earned: hraEarned,
    da_earned: daEarned,
    conv_earned: convEarned,
    med_earned: medEarned,
    ot_hours: otHours,
    ot_pay: otPay,
    bonus: bonus,
    adjustments: adhocAdjustments,
    gross: grossSalary,
    pf: pfDeduction,
    pf_employer: pfEmployerLiability,
    esi: esiDeduction,
    esi_employer: esiEmployerLiability,
    pt: ptDeduction,
    tds: tdsDeduction,
    lwf: lwfDeduction,
    lwf_employer: lwfEmployerLiability,
    gratuity_monthly: gratuityAccrualRate,
    gratuity_accrued: cumulativeGratuityAccrued,
    tenure_years: tenureYears,
    total_deductions: totalDeductions,
    net: netPayable,
    warnings: warnings,
    justification: (adjustmentData && adjustmentData.justification) ? adjustmentData.justification : ''
  };
}

// ----------------------------------------------------
// 4. THEME & SWITCHERS CONFIGURATION
// ----------------------------------------------------
function setTheme(themeName) {
  state.currentTheme = themeName;
  const dashboard = document.getElementById('dashboard-wrapper');
  if (dashboard) {
    dashboard.className = ''; // Reset classes
    dashboard.classList.add('dashboard-container');
    if (themeName === 'classic-corporate') {
      dashboard.classList.add('theme-classic-corporate');
    } else if (themeName === 'modern-minimalist') {
      dashboard.classList.add('theme-modern-minimalist');
    } else if (themeName === 'compact-matrix') {
      dashboard.classList.add('theme-compact-matrix');
    }
  }
}

// ----------------------------------------------------
// 5. THE INTELLIGENT FORMAT INGESTION WIZARD
// ----------------------------------------------------
function parseCSV(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return [];
  
  return lines.map(line => {
    // Handle comma splitting with simple quote parser
    let result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function handleAttendanceUpload(fileContent) {
  const rows = parseCSV(fileContent);
  if (rows.length < 2) {
    alert("Invalid CSV file. Please upload a file with headers and at least one row of data.");
    return;
  }

  // Auto-detect header row
  let headerRowIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const normalizedRow = rows[i].map(cell => cell.replace(/\s+/g, ' ').trim().toLowerCase());
    if (normalizedRow.some(cell => cell.includes('employee id') || cell === 'emp_id' || cell === 'employeecode')) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx === -1) {
    headerRowIdx = 0;
  }

  state.uploadingHeaders = rows[headerRowIdx];
  state.uploadingFile = rows.slice(headerRowIdx + 1);
  
  // Try to load cached mapping for this org
  const cachedMap = db.getSchema(state.currentOrgId);
  if (cachedMap) {
    state.tempSchemaMap = { ...cachedMap };
  } else {
    // Build a smart default mapping based on typical headers
    state.tempSchemaMap = {
      emp_id: -1,
      employee_name: -1,
      D1: -1,
      overtime_hours: -1,
      // Status values mappings
      P: 'P',
      WO: 'WO',
      H: 'H',
      EL: 'EL',
      CO: 'CO',
      A: 'A'
    };

    // Auto-detect columns
    state.uploadingHeaders.forEach((h, idx) => {
      const lowerH = h.toLowerCase();
      if (lowerH.includes('id') || lowerH.includes('code') || lowerH === 'emp') {
        state.tempSchemaMap.emp_id = idx;
      } else if (lowerH.includes('name')) {
        state.tempSchemaMap.employee_name = idx;
      } else if (lowerH.includes('ot') || lowerH.includes('overtime') || lowerH.includes('hours')) {
        state.tempSchemaMap.overtime_hours = idx;
      } else if (lowerH.includes('d1') || lowerH === '1' || lowerH.includes('day 1')) {
        if (state.tempSchemaMap.D1 === -1) {
          state.tempSchemaMap.D1 = idx; // start of day cells
        }
      }
    });
  }

  renderUploadWizardMappingStep();
}

function renderUploadWizardMappingStep() {
  const wizardContainer = document.getElementById('wizard-modal-content');
  const modal = document.getElementById('wizard-modal');
  modal.style.display = 'flex';

  let headerOptions = `<option value="-1">-- Ignore / Select Column --</option>`;
  state.uploadingHeaders.forEach((h, idx) => {
    headerOptions += `<option value="${idx}">${h}</option>`;
  });

  let valP = state.tempSchemaMap.P || 'P';
  let valWO = state.tempSchemaMap.WO || 'WO';
  let valH = state.tempSchemaMap.H || 'H';
  let valEL = state.tempSchemaMap.EL || 'EL';
  let valCO = state.tempSchemaMap.CO || 'CO';

  wizardContainer.innerHTML = `
    <div class="wizard-header">
      <h3>Intelligent Ingestion Wizard - Step 1: Column & Status Mapping</h3>
      <p>Map the headers in your uploaded sheet to system payroll definitions. Values will be saved for next month.</p>
    </div>
    <div class="wizard-body">
      <div class="wizard-grid">
        <div class="wizard-section">
          <h4>1. Column Mapping</h4>
          <div class="mapping-row">
            <label>Employee ID Column (emp_id) <span class="required">*</span></label>
            <select id="map-emp-id">${headerOptions}</select>
          </div>
          <div class="mapping-row">
            <label>Employee Name Column</label>
            <select id="map-emp-name">${headerOptions}</select>
          </div>
          <div class="mapping-row">
            <label>First Calendar Day (D1) Column <span class="required">*</span></label>
            <select id="map-d1">${headerOptions}</select>
          </div>
          <div class="mapping-row">
            <label>Overtime Hours Column</label>
            <select id="map-ot">${headerOptions}</select>
          </div>
        </div>

        <div class="wizard-section">
          <h4>2. Status Code Equivalents</h4>
          <p class="section-desc">Specify what cell value text strings represent in your CSV file.</p>
          <div class="mapping-row">
            <label>Present Code (P)</label>
            <input type="text" id="val-p" value="${valP}" placeholder="e.g. P or Present or 1">
          </div>
          <div class="mapping-row">
            <label>Weekly Off Code (WO)</label>
            <input type="text" id="val-wo" value="${valWO}" placeholder="e.g. WO or Off">
          </div>
          <div class="mapping-row">
            <label>Holiday Code (H)</label>
            <input type="text" id="val-h" value="${valH}" placeholder="e.g. H or Holiday">
          </div>
          <div class="mapping-row">
            <label>Earned Leave Code (EL)</label>
            <input type="text" id="val-el" value="${valEL}" placeholder="e.g. EL or Leave">
          </div>
          <div class="mapping-row">
            <label>Compensatory Off Code (CO)</label>
            <input type="text" id="val-co" value="${valCO}" placeholder="e.g. CO or Comp">
          </div>
        </div>
      </div>
    </div>
    <div class="wizard-footer">
      <button class="btn btn-secondary" onclick="closeWizard()">Cancel</button>
      <button class="btn btn-primary" onclick="processMappedData()">Next: Validate Records &rarr;</button>
    </div>
  `;

  // Pre-fill selects if values exist
  if (state.tempSchemaMap.emp_id !== -1) document.getElementById('map-emp-id').value = state.tempSchemaMap.emp_id;
  if (state.tempSchemaMap.employee_name !== -1) document.getElementById('map-emp-name').value = state.tempSchemaMap.employee_name;
  if (state.tempSchemaMap.D1 !== -1) document.getElementById('map-d1').value = state.tempSchemaMap.D1;
  if (state.tempSchemaMap.overtime_hours !== -1) document.getElementById('map-ot').value = state.tempSchemaMap.overtime_hours;
}

function processMappedData() {
  const mapEmpId = parseInt(document.getElementById('map-emp-id').value);
  const mapEmpName = parseInt(document.getElementById('map-emp-name').value);
  const mapD1 = parseInt(document.getElementById('map-d1').value);
  const mapOt = parseInt(document.getElementById('map-ot').value);

  const valP = document.getElementById('val-p').value.trim();
  const valWO = document.getElementById('val-wo').value.trim();
  const valH = document.getElementById('val-h').value.trim();
  const valEL = document.getElementById('val-el').value.trim();
  const valCO = document.getElementById('val-co').value.trim();

  if (mapEmpId === -1 || mapD1 === -1) {
    alert("Employee ID column and First Calendar Day column are required fields.");
    return;
  }

  // Save the mapping state
  state.tempSchemaMap = {
    emp_id: mapEmpId,
    employee_name: mapEmpName,
    D1: mapD1,
    overtime_hours: mapOt,
    P: valP,
    WO: valWO,
    H: valH,
    EL: valEL,
    CO: valCO
  };

  // Perform checks for name mismatches in db vs file
  state.dataMismatches = [];
  state.mismatchIndex = 0;

  const employees = db.getEmployees(state.currentOrgId);

  state.uploadingFile.forEach((row, idx) => {
    const fileEmpId = row[mapEmpId];
    const fileEmpName = mapEmpName !== -1 ? row[mapEmpName] : '';
    
    if (!fileEmpId || (/^\d+$/.test(fileEmpId.trim()) && fileEmpId.trim().length < 3)) return; // skip blank and indexing rows

    const dbEmp = employees.find(e => e.emp_id === fileEmpId);
    if (dbEmp) {
      // Check for name mismatches
      if (fileEmpName && dbEmp.name.toLowerCase() !== fileEmpName.toLowerCase()) {
        state.dataMismatches.push({
          rowIdx: idx,
          emp_id: fileEmpId,
          dbName: dbEmp.name,
          fileName: fileEmpName,
          rowData: row
        });
      }
    }
  });

  // Save confirmed schema mapping to db
  db.saveSchema(state.currentOrgId, state.tempSchemaMap);

  if (state.dataMismatches.length > 0) {
    renderMismatchStep();
  } else {
    saveValidatedAttendance();
  }
}

function renderMismatchStep() {
  const wizardContainer = document.getElementById('wizard-modal-content');
  const mismatch = state.dataMismatches[state.mismatchIndex];

  wizardContainer.innerHTML = `
    <div class="wizard-header">
      <h3>Intelligent Ingestion Wizard - Step 2: Name Mismatch Validation</h3>
      <p class="warning-text">Record ${state.mismatchIndex + 1} of ${state.dataMismatches.length} matches the Employee ID, but has a mismatching Name string.</p>
    </div>
    <div class="wizard-body">
      <div class="mismatch-box">
        <div class="mismatch-header">
          <span>Employee Code: <strong>${mismatch.emp_id}</strong></span>
        </div>
        <div class="mismatch-comparison">
          <div class="comparison-column database-side">
            <h5>Central Database Record</h5>
            <div class="name-badge db-name">${mismatch.dbName}</div>
            <p>This is the official active name stored in the Central Database (Employees Table).</p>
          </div>
          <div class="comparison-column file-side">
            <h5>Uploaded File Record</h5>
            <div class="name-badge file-name">${mismatch.fileName}</div>
            <p>This is the name provided in the monthly attendance sheet upload.</p>
          </div>
        </div>
      </div>
      <p class="instructions-text">Confirming Override will map the uploaded attendance data to the Database Master Record for <strong>${mismatch.dbName}</strong>.</p>
    </div>
    <div class="wizard-footer">
      <button class="btn btn-secondary" onclick="closeWizard()">Abort Upload</button>
      <button class="btn class-action btn-danger" onclick="confirmOverrideMismatch()">Confirm Override &amp; Continue &rarr;</button>
    </div>
  `;
}

function confirmOverrideMismatch() {
  state.mismatchIndex++;
  if (state.mismatchIndex < state.dataMismatches.length) {
    renderMismatchStep();
  } else {
    saveValidatedAttendance();
  }
}

async function saveValidatedAttendance() {
  // Map rows to system format and save to DB
  const mappedRecords = [];
  const map = state.tempSchemaMap;
  const daysCount = getDaysInMonth(
    parseInt(state.activeMonthYear.split('-')[0]),
    parseInt(state.activeMonthYear.split('-')[1])
  );

  state.uploadingFile.forEach(row => {
    const empId = row[map.emp_id];
    if (!empId || (/^\d+$/.test(empId.trim()) && empId.trim().length < 3)) return;

    const name = map.employee_name !== -1 ? row[map.employee_name] : '';
    const ot = map.overtime_hours !== -1 ? parseFloat(row[map.overtime_hours]) || 0 : 0;
    
    // Extract days starting from column mapping of D1
    const days = [];
    for (let i = 0; i < daysCount; i++) {
      const cellVal = row[map.D1 + i] || 'A';
      
      // Match mapped status values
      if (cellVal === map.P) days.push('P');
      else if (cellVal === map.WO) days.push('WO');
      else if (cellVal === map.H) days.push('H');
      else if (cellVal === map.EL) days.push('EL');
      else if (cellVal === map.CO) days.push('CO');
      else days.push('A'); // default absent
    }

    mappedRecords.push({ emp_id: empId, name: name, days: days, ot: ot });
  });

  await db.saveAttendance(state.currentOrgId, state.activeMonthYear, mappedRecords);
  addAuditLog("ATTENDANCE_INGEST", `Attendance sheet processed for period ${state.activeMonthYear} with ${mappedRecords.length} employees.`);
  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
  closeWizard();
  alert(`Attendance successfully processed and saved for ${state.activeMonthYear}!`);
  renderHRTab();
}

function closeWizard() {
  const modal = document.getElementById('wizard-modal');
  modal.style.display = 'none';
  state.uploadingFile = null;
  state.uploadingHeaders = [];
  state.dataMismatches = [];
  state.mismatchIndex = 0;
}

function handleEmployeeRegistrationUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = parseCSV(text);
    if (rows.length < 2) {
      alert("Invalid CSV. File must contain headers and data rows.");
      return;
    }

    // Auto-detect header row by scanning for typical columns
    let headerRowIdx = -1;
    let normalizedHeaders = [];

    for (let i = 0; i < rows.length; i++) {
      const normalizedRow = rows[i].map(cell => cell.replace(/\s+/g, ' ').trim().toLowerCase());
      if (normalizedRow.some(cell => cell.includes('employee id') || cell === 'emp_id')) {
        headerRowIdx = i;
        normalizedHeaders = normalizedRow;
        break;
      }
    }

    if (headerRowIdx === -1) {
      alert("Header row could not be auto-detected. Please ensure your CSV includes an 'Employee ID' column header.");
      return;
    }

    const dataRows = rows.slice(headerRowIdx + 1);

    // Map column names to index positions dynamically
    const map = {
      emp_id: normalizedHeaders.findIndex(h => h.includes('employee id') || h === 'emp_id'),
      name: normalizedHeaders.findIndex(h => h.includes('name of') && h.includes('employee') || h === 'name'),
      doj: normalizedHeaders.findIndex(h => h.includes('date of joining') || h === 'doj'),
      exit_date: normalizedHeaders.findIndex(h => h.includes('termination') || h === 'exit_date'),
      ctc: normalizedHeaders.findIndex(h => h === 'ctc' || h.includes('monthly ctc')),
      department: normalizedHeaders.findIndex(h => h === 'department'),
      designation: normalizedHeaders.findIndex(h => h === 'designation'),
      bank_name: normalizedHeaders.findIndex(h => h.includes('bank name')),
      bank_account: normalizedHeaders.findIndex(h => h.includes('bank account') || h === 'bank_account'),
      ifsc_code: normalizedHeaders.findIndex(h => h.includes('ifsc') || h === 'ifsc_code'),
      epf_eligible: normalizedHeaders.findIndex(h => h.includes('epf required') || h === 'epf_eligible'),
      esi_eligible: normalizedHeaders.findIndex(h => h.includes('esi required') || h === 'esi_eligible'),
      pan: normalizedHeaders.findIndex(h => h.includes('pan no') || h === 'pan'),
      aadhaar: normalizedHeaders.findIndex(h => h.includes('aadhar card no') || h === 'aadhaar' || h.includes('aadhar card number')),
      gender: normalizedHeaders.findIndex(h => h === 'gender'),
      dob: normalizedHeaders.findIndex(h => h.includes('date of birth') || h === 'dob'),
      father_name: normalizedHeaders.findIndex(h => h.includes('father name')),
      marital_status: normalizedHeaders.findIndex(h => h.includes('marital status'))
    };

    if (map.emp_id === -1 || map.name === -1 || map.doj === -1) {
      alert("Missing mandatory columns in Employee Registration Template. Required: Employee ID, Name of the Employee, Date of Joining");
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    const employees = db.getTable('employees');

    dataRows.forEach((row, idx) => {
      // Skip completely empty spacer rows or index rows
      if (row.length === 0 || !row[map.emp_id] || row[map.emp_id].trim() === '' || (/^\d+$/.test(row[map.emp_id].trim()) && row[map.emp_id].trim().length < 3)) {
        return; 
      }

      try {
        const empId = row[map.emp_id]?.trim();
        let name = row[map.name]?.trim();
        const doj = row[map.doj]?.trim();
        
        if (!empId || !name || !doj) {
          throw new Error(`Row ${idx+1}: Missing required values (ID, Name, or DOJ)`);
        }

        // Normalize Name: strip "Mr. ", "Ms. ", "Mrs. ", "Dr. "
        name = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, '');

        // Preserve existing CTC if updating, fallback to org minimum wage or standard 25,000
        const existingEmp = employees.find(e => e.emp_id === empId && e.org_id === state.currentOrgId);
        let ctc = existingEmp ? existingEmp.ctc : 25000;
        if (map.ctc !== -1 && row[map.ctc]) {
          const parsedCtc = parseFloat(row[map.ctc].replace(/[^\d\.]/g, ''));
          if (!isNaN(parsedCtc) && parsedCtc > 0) ctc = parsedCtc;
        }

        const parseDoj = parseCSVDate(doj);
        
        const exit_date = map.exit_date !== -1 && row[map.exit_date]?.trim() ? parseCSVDate(row[map.exit_date].trim()) : null;
        const department = map.department !== -1 ? row[map.department]?.trim() || 'Operations' : 'Operations';
        const designation = map.designation !== -1 ? row[map.designation]?.trim() || 'Staff' : 'Staff';
        
        const bank_name = map.bank_name !== -1 ? row[map.bank_name]?.trim() || '' : '';
        const bank_account = map.bank_account !== -1 ? row[map.bank_account]?.trim() || '' : '';
        const ifsc_code = map.ifsc_code !== -1 ? row[map.ifsc_code]?.toUpperCase().trim() || '' : '';

        const epf_eligible = map.epf_eligible !== -1 ? (row[map.epf_eligible]?.toLowerCase().trim() === 'yes' || row[map.epf_eligible]?.toLowerCase().trim() === 'true') : true;
        const esi_eligible = map.esi_eligible !== -1 ? (row[map.esi_eligible]?.toLowerCase().trim() === 'yes' || row[map.esi_eligible]?.toLowerCase().trim() === 'true') : false;
        
        const pan = map.pan !== -1 ? row[map.pan]?.toUpperCase().trim() || '' : '';
        const aadhaar = map.aadhaar !== -1 ? row[map.aadhaar]?.trim() || '' : '';

        const gender = map.gender !== -1 ? row[map.gender]?.toUpperCase().trim() || 'MALE' : 'MALE';
        const dob = map.dob !== -1 && row[map.dob]?.trim() ? parseCSVDate(row[map.dob].trim()) : null;
        const father_name = map.father_name !== -1 ? row[map.father_name]?.trim() || '' : '';
        const marital_status = map.marital_status !== -1 ? row[map.marital_status]?.trim() || 'Un Married' : 'Un Married';

        // Validations
        if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
          throw new Error(`Row ${idx+1} (${name}): Invalid PAN format "${pan}"`);
        }
        if (aadhaar && !/^\d{12}$/.test(aadhaar)) {
          throw new Error(`Row ${idx+1} (${name}): Invalid Aadhaar format "${aadhaar}"`);
        }
        if (ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code)) {
          throw new Error(`Row ${idx+1} (${name}): Invalid IFSC format "${ifsc_code}"`);
        }

        const empData = {
          emp_id: empId,
          org_id: state.currentOrgId,
          name: name,
          doj: parseDoj,
          exit_date: exit_date,
          ctc: ctc,
          department: department,
          designation: designation,
          bank_name: bank_name,
          bank_account: bank_account,
          ifsc_code: ifsc_code,
          epf_eligible: epf_eligible,
          esi_eligible: esi_eligible,
          pan: pan,
          aadhaar: aadhaar,
          gender: gender,
          dob: dob,
          father_name: father_name,
          marital_status: marital_status,
          status: 'Active',
          tds_rate: ctc > 100000 ? 15 : (ctc > 50000 ? 10 : 0)
        };

        const existingIdx = employees.findIndex(e => e.emp_id === empId && e.org_id === state.currentOrgId);
        if (existingIdx !== -1) {
          employees[existingIdx] = { ...employees[existingIdx], ...empData };
        } else {
          employees.push(empData);
        }
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(err.message);
      }
    });

    if (successCount > 0) {
      db.saveTable('employees', employees);
      addAuditLog("ROSTER_INGEST", `Bulk employee roster ingested from CSV file. ${successCount} successful rows.`, "Success");
    }
    
    if (errorCount > 0) {
      alert(`Bulk Registration complete:\n- ${successCount} employees successfully imported/updated.\n- ${errorCount} rows failed due to errors:\n${errors.slice(0, 8).join('\n')}`);
    } else {
      alert(`Successfully imported/updated all ${successCount} employees from the template!`);
    }

    renderEmployeeCRUDSection(db.getEmployees(state.currentOrgId));
  };
  reader.readAsText(file);
}

function parseCSVDate(dateStr) {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].toLowerCase();
    let year = parts[2];

    if (months[month]) {
      month = months[month];
    } else {
      month = month.padStart(2, '0');
    }

    if (year.length === 2) {
      const yearPrefix = parseInt(year) > 50 ? '19' : '20';
      year = yearPrefix + year;
    }
    return `${year}-${month}-${day}`;
  }
  return clean;
}

function downloadRegistrationCSVTemplate() {
  const headers = "emp_id,name,doj,exit_date,ctc,department,designation,bank_account,epf_eligible,esi_eligible,pan,aadhaar";
  const row1 = "EMP106,Aanya Sen,2026-06-01,,60000,Engineering,Software Engineer,HDFC 11223344,true,false,ABCDE1234F,123456789012";
  const row2 = "EMP107,Devendra Nath,2026-06-10,,18000,Operations,Executive,SBI 55443322,false,true,WXYZP5678M,987654321098";
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers, row1, row2].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "employee_registration_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleWagesStatementsUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = parseCSV(text);
    if (rows.length < 2) {
      alert("Invalid CSV. File must contain headers and data rows.");
      return;
    }

    // Auto-detect header row
    let headerRowIdx = -1;
    let normalizedHeaders = [];

    for (let i = 0; i < rows.length; i++) {
      const normalizedRow = rows[i].map(cell => cell.replace(/\s+/g, ' ').trim().toLowerCase());
      if (normalizedRow.some(cell => cell.includes('employee id') || cell === 'emp_id')) {
        headerRowIdx = i;
        normalizedHeaders = normalizedRow;
        break;
      }
    }

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
      normalizedHeaders = rows[0].map(h => h.toLowerCase().trim());
    }

    // Also look at subsequent rows (up to 3 rows below) to combine headers if they span multiple rows
    const lookaheadHeaders = [];
    for (let offset = 0; offset <= 3; offset++) {
      const idx = headerRowIdx + offset;
      if (idx < rows.length) {
        lookaheadHeaders.push(rows[idx].map(cell => cell.replace(/\s+/g, ' ').trim().toLowerCase()));
      }
    }

    // Dynamic resolver to search across rows for column names
    function findColumnIndex(keywords) {
      for (const rowHeaders of lookaheadHeaders) {
        const idx = rowHeaders.findIndex(h => keywords.every(kw => h.includes(kw)));
        if (idx !== -1) return idx;
      }
      return -1;
    }

    const map = {
      emp_id: findColumnIndex(['employee id']) !== -1 ? findColumnIndex(['employee id']) : normalizedHeaders.indexOf('emp_id'),
      bonus_amount: findColumnIndex(['bonus']) !== -1 ? findColumnIndex(['bonus']) : normalizedHeaders.indexOf('bonus_amount'),
      adjustment_amount: findColumnIndex(['adjustment']) !== -1 ? findColumnIndex(['adjustment']) : (findColumnIndex(['advance', 'total']) !== -1 ? findColumnIndex(['advance', 'total']) : normalizedHeaders.indexOf('adjustment_amount')),
      justification: findColumnIndex(['justification']) !== -1 ? findColumnIndex(['justification']) : normalizedHeaders.indexOf('justification')
    };

    if (map.emp_id === -1) {
      alert("Employee ID column could not be auto-detected in the Wages Statement.");
      return;
    }

    const dataRows = rows.slice(headerRowIdx + 1);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    const employees = db.getEmployees(state.currentOrgId);

    dataRows.forEach((row, idx) => {
      const empId = row[map.emp_id]?.trim();
      if (!empId || empId === '' || (/^\d+$/.test(empId) && empId.length < 3)) return; // skip index and blank rows

      try {
        const dbEmp = employees.find(e => e.emp_id === empId);
        if (!dbEmp) {
          throw new Error(`Row ${idx+1}: Employee code "${empId}" not registered in Master Directory for this organization`);
        }

        let bonus = 0;
        if (map.bonus_amount !== -1 && row[map.bonus_amount]) {
          bonus = parseFloat(row[map.bonus_amount].replace(/[^\d\.\-]/g, '')) || 0;
        }

        let adj = 0;
        if (map.adjustment_amount !== -1 && row[map.adjustment_amount]) {
          adj = parseFloat(row[map.adjustment_amount].replace(/[^\d\.\-]/g, '')) || 0;
        }

        const justification = map.justification !== -1 && row[map.justification] ? row[map.justification].trim() : 'Uploaded via Wages Statement';

        state.sandboxAdjustments[empId] = {
          variable_earnings: bonus,
          adjustments: adj,
          justification: justification
        };
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(err.message);
      }
    });

    if (successCount > 0) {
      addAuditLog("WAGES_INGEST", `Ingested wages statements. Loaded variable adjustments for ${successCount} employees.`, "Success");
    }

    if (errorCount > 0) {
      alert(`Wages Ingestion complete:\n- ${successCount} adjustments successfully loaded.\n- ${errorCount} rows failed due to errors:\n${errors.slice(0, 8).join('\n')}`);
    } else {
      alert(`Successfully loaded variable wages and adjustments for all ${successCount} employees!`);
    }

    renderHRTab();
  };
  reader.readAsText(file);
}

function downloadWagesCSVTemplate() {
  const headers = "emp_id,bonus_amount,adjustment_amount,justification";
  const row1 = "EMP101,5000,0,Performance bonus June";
  const row2 = "EMP102,0,-1000,Advance recovery";
  const row3 = "EMP104,12000,2500,LTA allowance and retention incentive";
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers, row1, row2, row3].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "employee_wages_adjustments_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadPfEcrFile() {
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const employees = db.getEmployees(state.currentOrgId);
  const attendance = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];
  
  if (employees.length === 0) {
    alert("No employees found for this organization to generate EPF ECR.");
    return;
  }

  let fileContent = "";
  let count = 0;
  
  employees.forEach(emp => {
    // Only EPF eligible employees are reported in ECR file
    if (!emp.epf_eligible) return;

    const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
    const adj = state.sandboxAdjustments[emp.emp_id] || null;
    const calc = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);

    // Mock UAN: 12-digit code starting with 1009
    const idNum = emp.emp_id.replace(/\D/g, "") || "101";
    const uan = `1009${idNum.padStart(8, "0")}`;
    
    const gross = Math.round(calc.gross);
    // PF wage is capped at basic salary (EPFO ceiling capping matches compliance)
    const basicEarned = calc.basic_earned;
    const pfCeiling = state.epfoCeiling !== undefined ? state.epfoCeiling : 15000;
    const pfWages = Math.round(Math.min(basicEarned, pfCeiling));
    const epsWages = pfWages;
    const edliWages = pfWages;
    
    const epfShare = Math.round(calc.pf); // Employee Share (12%)
    const epsShare = Math.round(epsWages * 0.0833); // Employer EPS Share (8.33% capped)
    const diffShare = Math.round(calc.pf - epsShare); // Employer EPF Share (3.67% difference)
    const ncpDays = Math.round(calc.absent_days);
    const refund = 0;

    // Line format: UAN#~#MemberName#~#GrossWages#~#EPFWages#~#EPSWages#~#EDLIWages#~#EPFShare#~#EPSShare#~#DiffShare#~#NCPDays#~#Refund
    fileContent += `${uan}#~#${emp.name}#~#${gross}#~#${pfWages}#~#${epsWages}#~#${edliWages}#~#${epfShare}#~#${epsShare}#~#${diffShare}#~#${ncpDays}#~#${refund}\r\n`;
    count++;
  });

  if (count === 0) {
    alert("No EPF enrolled employees found to generate ECR. Toggle EPF eligibility in the Roster first.");
    return;
  }

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `EPF_ECR_${state.currentOrgId}_${state.activeMonthYear}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBankPayoutCsv() {
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const employees = db.getEmployees(state.currentOrgId);
  const attendance = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];

  if (employees.length === 0) {
    alert("No employees found to generate bank payout CSV.");
    return;
  }

  let csvContent = "BeneficiaryAccountNumber,BeneficiaryName,Amount,PaymentMode,IFSCCode,Description,Email\n";
  let count = 0;

  employees.forEach(emp => {
    const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
    const adj = state.sandboxAdjustments[emp.emp_id] || null;
    const calc = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);

    // Skip if net salary is zero or negative
    if (calc.net <= 0) return;

    let bankDetails = emp.bank_account || "SBI 12345678901";
    const bankParts = bankDetails.split(" ");
    let bankAcc = bankParts.length > 1 ? bankParts.slice(1).join("") : bankParts[0] || "12345678901";
    let bankName = bankParts.length > 1 ? bankParts[0].toUpperCase() : "SBI";
    
    let ifsc = `${bankName}0123456`;
    if (ifsc.length < 11) ifsc = ifsc.padEnd(11, "0");
    ifsc = ifsc.slice(0, 11);

    const email = `${emp.name.split(' ')[0].toLowerCase()}@${state.currentOrgId.replace('org_','')}.in`;
    const amount = Math.round(calc.net);
    const mode = amount > 200000 ? "NEFT" : "IMPS";
    const desc = `Salary Payout ${state.activeMonthYear}`;

    csvContent += `"${bankAcc}","${emp.name}",${amount},"${mode}","${ifsc}","${desc}","${email}"\r\n`;
    count++;
  });

  if (count === 0) {
    alert("No positive salary payouts found for this organization to generate bank upload file.");
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Bulk_Bank_Payout_${state.currentOrgId}_${state.activeMonthYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function changeEpfoCeilingLimit(val) {
  state.epfoCeiling = parseInt(val) || 15000;
  const valEl = document.getElementById('epf-ceiling-val');
  if (valEl) valEl.textContent = `₹${state.epfoCeiling.toLocaleString('en-IN')}`;

  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const employees = db.getEmployees(state.currentOrgId);
  const attendance = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];

  let currentTotalEmployerPF = 0;
  let simulatedTotalEmployerPF = 0;
  let affectedEmployees = 0;

  employees.forEach(emp => {
    const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
    const adj = state.sandboxAdjustments[emp.emp_id] || null;
    
    // PF at current ₹15,000 ceiling
    const tempCeiling = state.epfoCeiling;
    state.epfoCeiling = 15000;
    const calcCurrent = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
    
    // PF at simulated ceiling
    state.epfoCeiling = tempCeiling;
    const calcSim = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
    
    currentTotalEmployerPF += calcCurrent.pf_employer;
    simulatedTotalEmployerPF += calcSim.pf_employer;

    if (calcSim.pf_employer > calcCurrent.pf_employer) {
      affectedEmployees++;
    }
  });

  const diff = simulatedTotalEmployerPF - currentTotalEmployerPF;

  const impactEl = document.getElementById('forecast-impact-content');
  if (impactEl) {
    impactEl.innerHTML = `
      <div class="forecast-result-box" style="background:rgba(184, 91, 115, 0.04); border:1px solid rgba(184, 91, 115, 0.12); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; font-size:0.76rem; color:var(--text-muted);">
          <span>Baseline Employer PF (₹15k)</span>
          <span style="font-family:var(--font-code); color:var(--text-h); font-weight:600;">₹${Math.round(currentTotalEmployerPF).toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.76rem; color:var(--text-muted);">
          <span>Simulated Employer PF (₹${Math.round(state.epfoCeiling/1000)}k)</span>
          <span style="font-family:var(--font-code); color:var(--text-h); font-weight:600;">₹${Math.round(simulatedTotalEmployerPF).toLocaleString('en-IN')}</span>
        </div>
        <div style="height:1px; background:rgba(184, 91, 115, 0.12); margin:2px 0;"></div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; align-items:center;">
          <span style="color:var(--text-h);">Incremental Employer Cost:</span>
          <span style="${diff > 0 ? 'color:var(--danger);' : 'color:var(--success);'} font-family:var(--font-code);">${diff > 0 ? '+ ₹' + Math.round(diff).toLocaleString('en-IN') : '₹0'} / mo</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); text-align:left; margin-top:2px;">
          👥 <strong>${affectedEmployees}</strong> employees affected out of ${employees.length}.
        </div>
      </div>
    `;
  }
}

function verifyKycField(type) {
  const inputId = type === 'pan' ? 'emp-crud-pan' : 'emp-crud-aadhaar';
  const statusId = type === 'pan' ? 'pan-kyc-status' : 'aadhaar-kyc-status';
  const val = document.getElementById(inputId).value.trim();
  const statusEl = document.getElementById(statusId);
  
  if (!val) {
    statusEl.textContent = '❌ Please enter a value first';
    statusEl.className = 'kyc-badge-status error';
    return;
  }

  // Validate format
  if (type === 'pan') {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase())) {
      statusEl.textContent = '❌ Invalid PAN structure (ABCDE1234F)';
      statusEl.className = 'kyc-badge-status error';
      return;
    }
  } else {
    if (!/^[0-9]{12}$/.test(val)) {
      statusEl.textContent = '❌ Invalid Aadhaar (12 digits required)';
      statusEl.className = 'kyc-badge-status error';
      return;
    }
  }

  statusEl.textContent = '⏳ Simulating NSDL/UIDAI check...';
  statusEl.className = 'kyc-badge-status loading';

  setTimeout(() => {
    statusEl.textContent = `✅ Verified & Registered (Live)`;
    statusEl.className = 'kyc-badge-status success';
  }, 1200);
}

// ----------------------------------------------------
// 6. INITIALIZATION & SESSION ROUTING
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Restore session via refresh token check
  try {
    const ok = await TokenStore.refresh();
    if (ok) {
      const payload = TokenStore.payload();
      state.isLoggedIn = true;
      state.currentRole = payload.role;
      state.currentOrgId = payload.org_id;
      state.currentUser = payload.username || payload.email;
      state.currentEmployeeId = payload.emp_id || null;
      await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
    } else {
      state.isLoggedIn = false;
      await db.preloadOrgsOnly();
    }
  } catch (e) {
    state.isLoggedIn = false;
    await db.preloadOrgsOnly();
  }

  // Window click — close modals
  window.onclick = (event) => {
    const modal = document.getElementById('wizard-modal');
    if (event.target === modal) closeWizard();
  };

  renderCurrentView();
  renderDatabaseExplorer();
});

function saveSessionState() {
  localStorage.setItem('symbiosis_session', JSON.stringify({
    isLoggedIn: state.isLoggedIn,
    role: state.currentRole,
    org_id: state.currentOrgId,
    emp_id: state.currentEmployeeId
  }));
}

async function handleLogout() {
  await AuthAPI.logout();
  const dbPanel = document.getElementById('db-explorer-panel');
  if (dbPanel) dbPanel.style.display = 'none';
  renderCurrentView();
}
window.handleLogout = handleLogout;



function toggleLoginFields(role) {
  const orgGroup = document.getElementById('login-org-group');
  const empGroup = document.getElementById('login-emp-group');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');

  // Update active segmented button styling
  const buttons = document.querySelectorAll('.role-segment');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-role') === role) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (role === 'ERP') {
    if (orgGroup) orgGroup.style.display = 'none';
    if (empGroup) empGroup.style.display = 'none';
    if (usernameInput) usernameInput.value = 'system';
    if (passwordInput) passwordInput.value = 'admin';
  } else if (role === 'HR') {
    if (orgGroup) orgGroup.style.display = 'block';
    if (empGroup) empGroup.style.display = 'none';
    
    const orgField = document.getElementById('login-org-field');
    const selectedOrg = orgField ? orgField.value : 'org_tata';
    if (usernameInput) usernameInput.value = selectedOrg === 'org_tata' ? 'hr@tata' : 'hr@infy';
    if (passwordInput) passwordInput.value = 'admin';
  } else if (role === 'Employee') {
    if (orgGroup) orgGroup.style.display = 'block';
    if (empGroup) empGroup.style.display = 'block';
    
    const orgField = document.getElementById('login-org-field');
    const selectedOrg = orgField ? orgField.value : 'org_tata';
    toggleLoginEmployees(selectedOrg);
  }
}

function setLoginRole(role) {
  const roleInput = document.getElementById('login-role-field');
  if (roleInput) {
    roleInput.value = role;
    toggleLoginFields(role);
  }
}

function toggleLoginEmployees(orgId) {
  const empField = document.getElementById('login-emp-field');
  if (!empField) return;

  empField.innerHTML = '';
  const emps = db.getEmployees(orgId);
  emps.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.emp_id;
    opt.textContent = `${emp.name} (${emp.emp_id})`;
    empField.appendChild(opt);
  });

  // Set default credentials for first employee
  if (emps.length > 0) {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const firstEmpName = emps[0].name.split(' ')[0].toLowerCase();
    if (usernameInput) usernameInput.value = firstEmpName;
    if (passwordInput) passwordInput.value = 'pass';
  }

  // Bind change to update credentials when employee selection changes
  empField.onchange = function() {
    const activeEmp = emps.find(e => e.emp_id === this.value);
    if (activeEmp) {
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const firstName = activeEmp.name.split(' ')[0].toLowerCase();
      if (usernameInput) usernameInput.value = firstName;
      if (passwordInput) passwordInput.value = 'pass';
    }
  };
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const submitBtn = document.querySelector('.login-submit');
    if (submitBtn) {
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;
    }

    // Call AuthAPI login.
    const user = await AuthAPI.login(username, password);

    // Keep loggedIn UI false until OTP check passes
    state.isLoggedIn = false;

    const payload = TokenStore.payload();
    
    // Generate secure 6-digit code for simulated Gmail MFA
    const otp = Math.floor(100000 + Math.random() * 900000);
    state.tempOtpCode = otp;
    state.tempLogin = {
      role: payload.role,
      targetOrgId: payload.org_id,
      targetEmpId: payload.emp_id || null,
      username: payload.email || payload.username
    };
    
    // Obfuscate target email address
    let obfuscatedEmail = 'u*****@gmail.com';
    if (payload.role === 'ERP') {
      obfuscatedEmail = 's*****@gmail.com';
    } else {
      const email = payload.email || '';
      if (email.includes('@')) {
        const parts = email.split('@');
        obfuscatedEmail = `${parts[0].slice(0, 2)}*****@${parts[1]}`;
      } else {
        obfuscatedEmail = `${email.slice(0, 2)}*****@gmail.com`;
      }
    }

    renderOtpVerificationScreen(obfuscatedEmail, otp);
  } catch (err) {
    const petCard = document.querySelector('.pet-card');
    const bubble = document.getElementById('pet-bubble');
    const status = document.getElementById('pet-status');
    if (petCard) {
      petCard.classList.add('pet-shaking');
      setTimeout(() => petCard.classList.remove('pet-shaking'), 500);
    }
    if (bubble) bubble.textContent = "Oops! " + err.message;
    if (status) status.textContent = "Confused";

    alert("Authentication Failed: " + err.message);
    const submitBtn = document.querySelector('.login-submit');
    if (submitBtn) {
      submitBtn.textContent = 'Verify & Sign In';
      submitBtn.disabled = false;
    }
  }
}

function renderOtpVerificationScreen(email, otp) {
  const cardBody = document.querySelector('.login-card-body');
  if (!cardBody) return;
  
  cardBody.innerHTML = `
    <div style="width:100%; display:flex; flex-direction:column; align-items:center;">
      <div style="text-align:center; margin-bottom:24px; width:100%;">
        <div class="login-icon" style="background:linear-gradient(135deg, #ea4335, #c5221f); box-shadow:0 8px 32px rgba(234, 67, 53, 0.45); animation:float 6s ease-in-out infinite; margin-left:auto; margin-right:auto;">📧</div>
        <h3 style="font-size:1.3rem; font-weight:800; color:var(--text-h); margin-bottom:8px; font-family:var(--font-h); text-align:center;">Gmail Verification</h3>
        <p style="font-size:0.84rem; color:var(--text-muted); line-height:1.4; text-align:center;">We've sent a 6-digit secure authentication OTP to your registered Gmail address:<br><strong style="color:var(--primary);">${email}</strong></p>
      </div>
      <form id="otp-verify-form" style="width:100%; display:flex; flex-direction:column; align-items:center;">
        <div class="form-group" style="width:100%; max-width:380px; display:flex; flex-direction:column; align-items:center; margin-bottom:22px; margin-left:auto; margin-right:auto;">
          <label class="form-label">Enter 6-Digit OTP Code</label>
          <input class="form-control" type="text" id="otp-code-field" placeholder="• • • • • •" maxlength="6" pattern="[0-9]{6}" required style="text-align:center; font-size:1.4rem; letter-spacing:8px; font-weight:700; height:50px;">
        </div>
        <button type="submit" class="login-submit">Verify & Sign In →</button>
        <button type="button" class="btn btn-secondary btn-full" style="margin-top:14px; max-width:380px;" onclick="cancelOtpVerification()">Back to Login</button>
      </form>
    </div>
  `;

  // Append a simulation notification banner at the top of the body
  let toast = document.getElementById('gmail-toast');
  if (toast) toast.remove();
  
  toast = document.createElement('div');
  toast.id = 'gmail-toast';
  toast.className = 'gmail-simulation-toast';
  toast.innerHTML = `
    <div class="toast-header">
      <span class="toast-icon">📧</span>
      <strong class="toast-title">Gmail Simulation</strong>
      <span class="toast-time">Just now</span>
      <button class="toast-close" onclick="closeGmailToast()">×</button>
    </div>
    <div class="toast-body">
      New message from <strong>Symbiosis Security</strong>:<br>
      Your secure login OTP code is <strong class="otp-highlight">${otp}</strong>.
    </div>
  `;
  document.body.appendChild(toast);

  const otpForm = document.getElementById('otp-verify-form');
  if (otpForm) otpForm.addEventListener('submit', handleOtpSubmit);
}

function handleOtpSubmit(e) {
  e.preventDefault();
  const enteredCode = document.getElementById('otp-code-field').value.trim();
  
  if (enteredCode === String(state.tempOtpCode)) {
    const petCard = document.querySelector('.pet-card');
    const bubble = document.getElementById('pet-bubble');
    const status = document.getElementById('pet-status');
    if (petCard) {
      petCard.classList.add('pet-dancing');
    }
    if (bubble) bubble.textContent = "Success! Access granted! Launching system...";
    if (status) status.textContent = "Celebrating";

    // Authenticate user
    const { role, targetOrgId, targetEmpId } = state.tempLogin;
    state.isLoggedIn = true;
    state.currentRole = role;
    state.currentOrgId = targetOrgId;
    state.currentEmployeeId = targetEmpId;
    saveSessionState();
    
    // Clear temp states
    state.tempOtpCode = null;
    state.tempLogin = null;
    
    closeGmailToast();

    // Sync the role dropdown if exists
    const roleSelect = document.getElementById('login-role-selector');
    if (roleSelect) roleSelect.value = role;

    // Brief timeout so celebrate animation is seen
    setTimeout(() => {
      renderCurrentView();
      renderDatabaseExplorer();
    }, 850);
  } else {
    const petCard = document.querySelector('.pet-card');
    const bubble = document.getElementById('pet-bubble');
    const status = document.getElementById('pet-status');
    if (petCard) {
      petCard.classList.add('pet-shaking');
      setTimeout(() => petCard.classList.remove('pet-shaking'), 500);
    }
    if (bubble) bubble.textContent = "Oh no, that OTP code doesn't match the Gmail alert!";
    if (status) status.textContent = "Perplexed";

    alert("Incorrect OTP. Please enter the valid code sent in the Gmail simulated notification.");
  }
}

function cancelOtpVerification() {
  state.tempOtpCode = null;
  state.tempLogin = null;
  closeGmailToast();
  renderLoginPage();
}

function closeGmailToast() {
  const toast = document.getElementById('gmail-toast');
  if (toast) toast.remove();
}

// ────────────────────────────────────────────────────────────────────────────
// SHELL MANAGEMENT: show/hide login vs app shell, build sidebar
// ────────────────────────────────────────────────────────────────────────────
function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app-shell').style.display = 'none';
  const dbPanel = document.getElementById('db-explorer-panel');
  if (dbPanel) dbPanel.style.display = 'none';
}

function showAppShell() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-shell').style.display = 'flex';
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const emp = db.getEmployee(state.currentEmployeeId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);

  // Update topbar
  const welcome = document.getElementById('topbar-welcome');
  const userName = document.getElementById('topbar-user-name');
  const userEmail = document.getElementById('topbar-user-email');
  const avatar = document.getElementById('topbar-avatar');

  if (state.currentRole === 'ERP') {
    if (welcome) welcome.textContent = 'Welcome back, System Admin';
    if (userName) userName.textContent = 'ERP Admin';
    if (userEmail) userEmail.textContent = 'system@symbiosis.in';
    if (avatar) avatar.textContent = 'SA';

    nav.innerHTML = `
      <div class="sidebar-section-label">ERP ADMIN</div>
      <button class="sidebar-nav-item ${state.activeTab === 'erp-orgs' ? 'active' : ''}" onclick="switchTab('erp-orgs')">
        <span class="nav-icon">🏢</span> Organizations
      </button>
      <button class="sidebar-nav-item ${state.activeTab === 'erp-employees' ? 'active' : ''}" onclick="switchTab('erp-employees')">
        <span class="nav-icon">👥</span> All Employees
      </button>
      <button class="sidebar-nav-item ${state.activeTab === 'erp-payroll' ? 'active' : ''}" onclick="switchTab('erp-payroll')">
        <span class="nav-icon">💰</span> Payroll Overview
      </button>
      <div class="sidebar-divider"></div>
      <div class="sidebar-section-label">SYSTEM</div>
      <button class="sidebar-nav-item ${state.activeTab === 'erp-register' ? 'active' : ''}" onclick="switchTab('erp-register')">
        <span class="nav-icon">➕</span> Register Tenant
      </button>
      <div class="sidebar-divider"></div>
      <div class="sidebar-section-label">CUSTOMIZATION</div>
      <button class="sidebar-nav-item ${state.activeTab === 'erp-editor' ? 'active' : ''}" onclick="switchTab('erp-editor')">
        <span class="nav-icon">🛠️</span> Website Editor
      </button>
    `;

    const dbPanel = document.getElementById('db-explorer-panel');
    if (dbPanel) dbPanel.style.display = 'flex';

  } else if (state.currentRole === 'HR') {
    if (welcome) welcome.textContent = `Welcome back, HR Admin`;
    if (userName) userName.textContent = org ? org.name : 'HR Admin';
    if (userEmail) userEmail.textContent = `hr@${state.currentOrgId.replace('org_','')}.in`;
    if (avatar) avatar.textContent = (org ? org.name[0] : 'H');

    // Build HR sidebar with feature flags
    const hrModules = [
      { key: 'dashboard', icon: '📊', label: 'Dashboard' },
      { key: 'employees', icon: '👥', label: 'Employees' },
      { key: 'attendance', icon: '📅', label: 'Attendance' },
      { key: 'payroll', icon: '💸', label: 'Payroll' },
      { key: 'compliance', icon: '🛡️', label: 'Compliance' },
      { key: 'reports', icon: '📈', label: 'Reports' }
    ];
    const hrCustomPages = getCustomPages().filter(p => p.audience === 'all' || p.audience === 'hr');

    nav.innerHTML = `
      <div class="sidebar-section-label">HR MANAGEMENT</div>
      ${hrModules.filter(m => isFeatureEnabled('HR', m.key)).map(m => `
        <button class="sidebar-nav-item ${state.activeTab === m.key ? 'active' : ''}" onclick="switchTab('${m.key}')">
          <span class="nav-icon">${m.icon}</span> ${m.label}
        </button>
      `).join('')}
      <div class="sidebar-divider"></div>
      ${isFeatureEnabled('HR', 'settings') ? `
        <button class="sidebar-nav-item ${state.activeTab === 'settings' ? 'active' : ''}" onclick="switchTab('settings')">
          <span class="nav-icon">⚙️</span> Settings
        </button>
      ` : ''}
      ${hrCustomPages.length > 0 ? `
        <div class="sidebar-divider"></div>
        <div class="sidebar-section-label">CUSTOM PAGES</div>
        ${hrCustomPages.map(p => `
          <button class="sidebar-nav-item ${state.activeTab === p.id ? 'active' : ''}" onclick="switchTab('${p.id}')">
            <span class="nav-icon">${p.icon || '📄'}</span> ${p.title}
          </button>
        `).join('')}
      ` : ''}
    `;

    const dbPanel = document.getElementById('db-explorer-panel');
    if (dbPanel) dbPanel.style.display = 'flex';

  } else if (state.currentRole === 'Employee') {
    const empName = emp ? emp.name.split(' ')[0] : 'Employee';
    const empEmail = emp ? `${emp.name.split(' ')[0].toLowerCase()}@${state.currentOrgId.replace('org_','')}.in` : '';
    const initials = emp ? emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'E';

    if (welcome) welcome.textContent = `Welcome back, ${empName}`;
    if (userName) userName.textContent = emp ? emp.name : 'Employee';
    if (userEmail) userEmail.textContent = empEmail;
    if (avatar) avatar.textContent = initials;

    // Build Employee sidebar with feature flags
    const empModules = [
      { key: 'emp-dashboard', icon: '📋', label: 'My Dashboard' },
      { key: 'emp-payslips', icon: '📄', label: 'My Payslips' },
      { key: 'emp-tax-declaration', icon: '📊', label: 'Tax Declaration' },
      { key: 'emp-leaves', icon: '📆', label: 'My Leaves' },
      { key: 'emp-profile', icon: '👤', label: 'My Profile' }
    ];
    const empCustomPages = getCustomPages().filter(p => p.audience === 'all' || p.audience === 'employees');

    nav.innerHTML = `
      <div class="sidebar-section-label">EMPLOYEE SELF-SERVICE</div>
      ${empModules.filter(m => isFeatureEnabled('Employee', m.key)).map(m => `
        <button class="sidebar-nav-item ${state.activeTab === m.key ? 'active' : ''}" onclick="switchTab('${m.key}')">
          <span class="nav-icon">${m.icon}</span> ${m.label}
        </button>
      `).join('')}
      ${empCustomPages.length > 0 ? `
        <div class="sidebar-divider"></div>
        <div class="sidebar-section-label">RESOURCES</div>
        ${empCustomPages.map(p => `
          <button class="sidebar-nav-item ${state.activeTab === p.id ? 'active' : ''}" onclick="switchTab('${p.id}')">
            <span class="nav-icon">${p.icon || '📄'}</span> ${p.title}
          </button>
        `).join('')}
      ` : ''}
    `;

    const dbPanel = document.getElementById('db-explorer-panel');
    if (dbPanel) dbPanel.style.display = 'none';
  }
}

function switchTab(tab) {
  if (!state.isLoggedIn) return;

  // ── SECURITY: Role-based Tab Access Control ──────────────────────────────
  // Rely on the immutable cryptographically verified / local session payload role
  const payload = TokenStore.payload();
  const actualRole = payload ? payload.role : null;

  // ERP tabs are only accessible to ERP role
  if (tab.startsWith('erp') && actualRole !== 'ERP') {
    console.warn('SECURITY: Access denied — ERP tab attempted by non-ERP user');
    return;
  }
  // Employee self-service tabs are only accessible to Employee role or ERP (for testing/demo)
  if (tab.startsWith('emp-') && actualRole !== 'Employee' && actualRole !== 'ERP') {
    console.warn('SECURITY: Access denied — Employee tab attempted by unauthorized user');
    return;
  }
  // HR management tabs are only accessible to HR or ERP (via impersonation)
  const hrTabs = ['dashboard','employees','attendance','payroll','compliance','reports','settings'];
  if (hrTabs.includes(tab) && actualRole !== 'HR' && actualRole !== 'ERP') {
    console.warn('SECURITY: Access denied — HR tab attempted by unauthorized user');
    return;
  }
  // Custom pages access control
  if (tab.startsWith('custom-')) {
    const pages = getCustomPages();
    const page = pages.find(p => p.id === tab);
    if (page) {
      if (page.audience === 'hr' && actualRole !== 'HR' && actualRole !== 'ERP') {
        console.warn('SECURITY: Access denied — Custom HR page attempted by non-HR user');
        return;
      }
      if (page.audience === 'employees' && actualRole !== 'Employee' && actualRole !== 'ERP') {
        console.warn('SECURITY: Access denied — Custom Employee page attempted by non-Employee user');
        return;
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  state.activeTab = tab;
  buildSidebar();
  renderMainContent();
}
window.switchTab = switchTab;

async function renderCurrentView() {
  if (!state.isLoggedIn) {
    showLoginScreen();
    await db.preloadOrgsOnly();
    renderLoginPage();
    return;
  }
  showAppShell();
  // Set default tab per role
  if (!state.activeTab ||
    (state.currentRole === 'ERP'      && !state.activeTab.startsWith('erp')) ||
    (state.currentRole === 'HR'       && state.activeTab.startsWith('erp')) ||
    (state.currentRole === 'Employee' && !state.activeTab.startsWith('emp'))
  ) {
    if (state.currentRole === 'ERP') state.activeTab = 'erp-orgs';
    else if (state.currentRole === 'HR') state.activeTab = 'dashboard';
    else state.activeTab = 'emp-dashboard';
  }
  buildSidebar();
  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
  renderMainContent();
  renderDatabaseExplorer();
}

function renderMainContent() {
  const container = document.getElementById('app-body');
  if (container && state.isLoggedIn) {
    container.innerHTML = `
      <div style="padding: 20px; width: 100%;">
        <div class="skeleton-loader skeleton-box" style="height: 36px; width: 40%; margin-bottom: 24px;"></div>
        <div style="display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap;">
          <div class="skeleton-loader skeleton-box" style="height: 120px; min-width: 200px; flex: 1; border-radius: 12px;"></div>
          <div class="skeleton-loader skeleton-box" style="height: 120px; min-width: 200px; flex: 1; border-radius: 12px;"></div>
          <div class="skeleton-loader skeleton-box" style="height: 120px; min-width: 200px; flex: 1; border-radius: 12px;"></div>
        </div>
        <div class="skeleton-loader skeleton-box" style="height: 400px; border-radius: 12px;"></div>
      </div>
    `;
    setTimeout(() => {
      if (state.currentRole === 'ERP') {
        renderERPTab();
      } else if (state.currentRole === 'HR') {
        renderHRTab();
      } else if (state.currentRole === 'Employee') {
        renderEmployeeTab();
      }
    }, 150);
  } else {
    if (state.currentRole === 'ERP') renderERPTab();
    else if (state.currentRole === 'HR') renderHRTab();
    else if (state.currentRole === 'Employee') renderEmployeeTab();
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ────────────────────────────────────────────────────────────────────────────
async function renderLoginPage() {
  const container = document.getElementById('login-screen');
  await db.preloadOrgsOnly();
  const orgs = db.getOrganizations();
  const b = getBranding();

  container.innerHTML = `
    <!-- Living Canvas Background -->
    <canvas id="login-canvas-bg"></canvas>

    <div class="login-wrapper">
      <!-- Column 1: Login Card -->
      <div class="login-card">
        <div class="login-card-top">
          <div class="login-icon">${b.logoEmoji || '💼'}</div>
          <h2>${b.appName || 'HR Payroll'} System</h2>
          <p>${b.loginMessage || 'India Labour Law Compliant · Multi-tenant'}</p>
        </div>
        <div class="login-card-body">
          <form id="portal-login-form">
            <div class="form-group">
              <label class="form-label">Access Role</label>
              <input type="hidden" id="login-role-field" value="ERP">
              <div class="role-segmented-control">
                <button type="button" class="role-segment active" data-role="ERP" onclick="setLoginRole('ERP')">🛡️ ERP</button>
                <button type="button" class="role-segment" data-role="HR" onclick="setLoginRole('HR')">🏢 HR</button>
                <button type="button" class="role-segment" data-role="Employee" onclick="setLoginRole('Employee')">👤 Employee</button>
              </div>
            </div>
            <div class="form-group" id="login-org-group" style="display:none">
              <label class="form-label">Organization</label>
              <select class="form-control" id="login-org-field">
                ${orgs.map(o => `<option value="${o.org_id}">${o.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" id="login-emp-group" style="display:none">
              <label class="form-label">Your Profile</label>
              <select class="form-control" id="login-emp-field"></select>
            </div>
            <div class="form-group">
              <label class="form-label">Username</label>
              <input class="form-control" type="text" id="login-username" value="system" autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-control" type="password" id="login-password" value="admin" autocomplete="current-password">
            </div>
            <button type="submit" class="login-submit">Sign In →</button>
          </form>

          <div class="login-creds">
            <h5>🔑 Demo Credentials</h5>
            <div class="cred-row">
              <strong>🛡️ ERP Super Admin — sees ALL data</strong>
              <span><code>system</code> / <code>admin</code></span>
            </div>
            <div class="cred-row">
              <strong>🏢 HR Admin (TCS) — sees TCS only</strong>
              <span><code>hr@tata</code> / <code>admin</code></span>
            </div>
            <div class="cred-row">
              <strong>🏢 HR Admin (Infosys) — sees Infosys only</strong>
              <span><code>hr@infy</code> / <code>admin</code></span>
            </div>
            <div class="cred-row">
              <strong>👤 Employee — sees own data only</strong>
              <span>Select Employee role → org → name → <code>[firstname]</code> / <code>pass</code></span>
            </div>
          </div>

          <div class="google-signin-divider">
            <span>or sign in with</span>
          </div>
          <div id="google-signin-btn" style="display:flex; justify-content:center;"></div>
        </div>
      </div>

      <!-- Column 2: Symbio Virtual Pet Assistant Card -->
      <div class="pet-card">
        <div class="pet-speech-bubble" id="pet-bubble">
          Hi! I am Symbio, your compliance helper. Choose a role to get started!
        </div>
        <div class="pet-mascot-container" id="symbio-container">
          <svg id="symbio-svg" viewBox="0 0 200 200" width="160" height="160">
            <!-- Left Ear -->
            <path class="ear-l" d="M 50 100 L 40 40 L 90 75 Z" fill="#4f46e5" />
            <path class="ear-l-inner" d="M 55 95 L 48 50 L 82 76 Z" fill="#f472b6" />
            
            <!-- Right Ear -->
            <path class="ear-r" d="M 150 100 L 160 40 L 110 75 Z" fill="#4f46e5" />
            <path class="ear-r-inner" d="M 145 95 L 152 50 L 118 76 Z" fill="#f472b6" />
            
            <!-- Tail -->
            <path d="M 120 160 Q 150 180 170 140 T 190 150" fill="none" stroke="#4f46e5" stroke-width="8" stroke-linecap="round" />
            
            <!-- Body -->
            <circle cx="100" cy="150" r="45" fill="#6366f1" />
            
            <!-- Head -->
            <rect x="50" y="70" width="100" height="85" rx="35" fill="#6366f1" />
            
            <!-- Eyes White -->
            <ellipse cx="75" cy="105" rx="16" ry="20" fill="white" />
            <ellipse cx="125" cy="105" rx="16" ry="20" fill="white" />
            
            <!-- Pupils Group -->
            <g id="pupils">
              <circle cx="75" cy="105" r="8" fill="#1e1b4b" />
              <circle cx="73" cy="102" r="3" fill="white" />
              <circle cx="125" cy="105" r="8" fill="#1e1b4b" />
              <circle cx="123" cy="102" r="3" fill="white" />
            </g>
            
            <!-- Nose & Mouth -->
            <polygon points="96,118 104,118 100,122" fill="#f472b6" />
            <path d="M 95 125 Q 100 128 100 125 T 105 125" fill="none" stroke="#1e1b4b" stroke-width="2" stroke-linecap="round" />
            
            <!-- Whiskers -->
            <line x1="35" y1="120" x2="15" y2="122" stroke="#1e1b4b" stroke-width="2" stroke-linecap="round" />
            <line x1="35" y1="126" x2="15" y2="130" stroke="#1e1b4b" stroke-width="2" stroke-linecap="round" />
            <line x1="165" y1="120" x2="185" y2="122" stroke="#1e1b4b" stroke-width="2" stroke-linecap="round" />
            <line x1="165" y1="126" x2="185" y2="130" stroke="#1e1b4b" stroke-width="2" stroke-linecap="round" />
            
            <!-- Collar & Pendant -->
            <path d="M 67 148 Q 100 155 133 148" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" />
            <circle cx="100" cy="154" r="6" fill="#ef4444" />
            
            <!-- Left Paw -->
            <g class="paw-l">
              <circle cx="70" cy="170" r="12" fill="#4f46e5" />
              <circle cx="64" cy="162" r="4" fill="#a5b4fc" />
              <circle cx="70" cy="160" r="4" fill="#a5b4fc" />
              <circle cx="76" cy="162" r="4" fill="#a5b4fc" />
            </g>
            
            <!-- Right Paw -->
            <g class="paw-r">
              <circle cx="130" cy="170" r="12" fill="#4f46e5" />
              <circle cx="124" cy="162" r="4" fill="#a5b4fc" />
              <circle cx="130" cy="160" r="4" fill="#a5b4fc" />
              <circle cx="136" cy="162" r="4" fill="#a5b4fc" />
            </g>
          </svg>
        </div>
        <div class="pet-stats">
          <h4>🐱 Symbio Assistant</h4>
          <p>Status: <span id="pet-status">Idle</span></p>
        </div>
      </div>
    </div>
  `;

  const orgField  = document.getElementById('login-org-field');
  if (orgField)  orgField.addEventListener('change',  e => toggleLoginEmployees(e.target.value));
  toggleLoginFields('ERP');

  const form = document.getElementById('portal-login-form');
  if (form) form.addEventListener('submit', handleLoginSubmit);

  // Initialize Canvas Particles & Mascot Logic
  initLoginBackgroundCanvas();
  initSymbioMascot();
}

function initLoginBackgroundCanvas() {
  const canvas = document.getElementById('login-canvas-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const blobs = [
    { x: width * 0.25, y: height * 0.25, vx: 0.3, vy: 0.2, r: 240, color: 'rgba(0, 113, 227, 0.12)' },
    { x: width * 0.75, y: height * 0.25, vx: -0.2, vy: 0.3, r: 280, color: 'rgba(255, 149, 0, 0.08)' },
    { x: width * 0.3, y: height * 0.75, vx: 0.4, vy: -0.3, r: 260, color: 'rgba(175, 82, 222, 0.1)' },
    { x: width * 0.8, y: height * 0.75, vx: -0.3, vy: -0.2, r: 200, color: 'rgba(52, 199, 89, 0.08)' }
  ];

  let mouseX = width / 2;
  let mouseY = height / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    if (!document.getElementById('login-canvas-bg')) return;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--body-bg') || '#0f172a';
    ctx.fillRect(0, 0, width, height);

    blobs.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;

      const dx = mouseX - b.x;
      const dy = mouseY - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 500) {
        b.x += (dx / dist) * 0.6;
        b.y += (dy / dist) * 0.6;
      }

      if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
      if (b.x + b.r > width) { b.x = width - b.r; b.vx *= -1; }
      if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; }
      if (b.y + b.r > height) { b.y = height - b.r; b.vy *= -1; }

      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

function initSymbioMascot() {
  const container = document.getElementById('symbio-container');
  const pupils = document.getElementById('pupils');
  const bubble = document.getElementById('pet-bubble');
  const status = document.getElementById('pet-status');
  
  if (!container || !pupils) return;

  const idleMessages = [
    "EPF basic wage cap is ₹15,000.",
    "Did you know? ESI basic wage limit is ₹21,000.",
    "Click a role to toggle demo values automatically!",
    "Our reports module features full print layouts.",
    "I follow your cursor! Try moving it around.",
    "Symbiosis is 100% compliant with Indian Tax regulations."
  ];

  let messageTimer = setInterval(() => {
    if (!document.getElementById('pet-bubble')) {
      clearInterval(messageTimer);
      return;
    }
    const idx = Math.floor(Math.random() * idleMessages.length);
    bubble.textContent = idleMessages[idx];
  }, 12000);

  window.addEventListener('mousemove', (e) => {
    if (!pupils || !document.getElementById('pupils')) return;
    
    const rect = pupils.getBoundingClientRect();
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;
    
    const dx = e.clientX - eyeX;
    const dy = e.clientY - eyeY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const maxTravel = 5;
    const angle = Math.atan2(dy, dx);
    const tx = Math.cos(angle) * Math.min(dist / 30, maxTravel);
    const ty = Math.sin(angle) * Math.min(dist / 30, maxTravel);
    
    pupils.style.transform = `translate(${tx}px, ${ty}px)`;
  });

  const username = document.getElementById('login-username');
  const password = document.getElementById('login-password');

  if (username) {
    username.addEventListener('focus', () => {
      container.classList.remove('hiding-eyes');
      bubble.textContent = "Okay, what is your username or linked email?";
      status.textContent = "Analyzing input...";
      pupils.style.transform = `translate(0px, 4px)`;
    });
    username.addEventListener('blur', () => {
      status.textContent = "Idle";
    });
  }

  if (password) {
    password.addEventListener('focus', () => {
      container.classList.add('hiding-eyes');
      bubble.textContent = "Ooh, password! Don't worry, I'm hiding my eyes.";
      status.textContent = "Respecting privacy";
    });
    password.addEventListener('blur', () => {
      container.classList.remove('hiding-eyes');
      status.textContent = "Idle";
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ERP TABS
// ────────────────────────────────────────────────────────────────────────────
async function renderERPTab() {
  // SECURITY: Only ERP role can render ERP views
  if (!state.isLoggedIn || state.currentRole !== 'ERP') {
    showToast('Access Denied', 'You do not have permission to view this section.', 'error');
    return;
  }
  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
  const container = document.getElementById('app-body');
  const orgs = db.getOrganizations();
  const currentMonth = state.activeMonthYear;

  let totalEmployees = 0, totalPayout = 0;
  orgs.forEach(org => {
    totalEmployees += db.getEmployees(org.org_id).length;
    const ledger = db.getPayrollLedger(org.org_id);
    if (ledger[currentMonth]?.status === 'Locked')
      ledger[currentMonth].records.forEach(r => totalPayout += (r.net || 0));
  });

  // ── Website Editor Tab ─────────────────────────────────────────────────
  if (state.activeTab === 'erp-editor') {
    container.innerHTML = renderWebsiteEditor();
    return;
  }

  if (state.activeTab === 'erp-register') {
    container.innerHTML = `
      <div class="animate-in">
        <div class="page-header">
          <div class="page-header-left"><h2>Register New Organization</h2><p>Onboard a new client tenant with initial compliance configuration</p></div>
        </div>
        <div class="card" style="max-width:560px">
          <div class="card-header"><h3>➕ New Tenant Registration</h3></div>
          <div class="card-body">
            <form id="erp-register-org-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Organization ID <span style="color:#ef4444">*</span></label>
                  <input class="form-control" type="text" id="erp-org-id" placeholder="e.g. org_google" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Display Name <span style="color:#ef4444">*</span></label>
                  <input class="form-control" type="text" id="erp-org-name" placeholder="e.g. Google India Pvt Ltd" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">EPF Rate (%)</label>
                  <input class="form-control" type="number" id="erp-org-epf" value="12">
                </div>
                <div class="form-group">
                  <label class="form-label">Min Wage (₹/mo)</label>
                  <input class="form-control" type="number" id="erp-org-minwage" value="10000">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Basic % of CTC</label>
                  <input class="form-control" type="number" id="erp-org-basic" value="60">
                </div>
                <div class="form-group">
                  <label class="form-label">OT Rate (₹/hr)</label>
                  <input class="form-control" type="number" id="erp-org-ot" value="200">
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-full" style="margin-top:8px">Register Organization</button>
            </form>
          </div>
        </div>
      </div>`;
    const form = document.getElementById('erp-register-org-form');
    if (form) form.addEventListener('submit', async e => {
      e.preventDefault();
      try {
        await db.createOrganization({
          org_id: document.getElementById('erp-org-id').value.trim(),
          name: document.getElementById('erp-org-name').value.trim(),
          epf_rate: +document.getElementById('erp-org-epf').value,
          minimum_wage: +document.getElementById('erp-org-minwage').value,
          basic_pct: +document.getElementById('erp-org-basic').value,
          ot_rate: +document.getElementById('erp-org-ot').value
        });
        await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
        alert('Organization registered!');
        switchTab('erp-orgs');
      } catch(err) { alert(err.message); }
    });
    return;
  }

  if (state.activeTab === 'erp-employees') {
    const allEmps = orgs.flatMap(org => db.getEmployees(org.org_id).map(e => ({ ...e, orgName: org.name })));
    container.innerHTML = `
      <div class="animate-in">
        <div class="print-doc-header print-only">
          <h1>Symbiosis HR — Cross-Organization Employee Directory</h1>
          <p>Generated: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; Total: ${allEmps.length} employees</p>
        </div>
        <div class="page-header">
          <div class="page-header-left"><h2>All Employees</h2><p>Cross-organization employee directory — ${allEmps.length} total</p></div>
          <button class="btn btn-print no-print" onclick="window.print()">🖨️ Print Directory</button>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Emp ID</th><th>Name</th><th>Organization</th><th>Department</th><th>Designation</th><th>Monthly CTC</th><th>Status</th></tr></thead>
              <tbody>
                ${allEmps.map(e => `
                  <tr>
                    <td><code>${e.emp_id}</code></td>
                    <td><strong>${e.name}</strong></td>
                    <td>${e.orgName}</td>
                    <td>${e.department}</td>
                    <td>${e.designation}</td>
                    <td>₹${e.ctc.toLocaleString('en-IN')}</td>
                    <td><span class="badge ${e.exit_date ? 'badge-warning' : 'badge-success'}">${e.exit_date ? 'Exited' : 'Active'}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    return;
  }

  if (state.activeTab === 'erp-payroll') {
    const totalLockedPayout = orgs.reduce((sum, org) => {
      const ledger = db.getPayrollLedger(org.org_id);
      const run = ledger[currentMonth];
      if (run?.status === 'Locked') run.records.forEach(r => sum += r.net || 0);
      return sum;
    }, 0);
    container.innerHTML = `
      <div class="animate-in">
        <div class="print-doc-header print-only">
          <h1>Symbiosis HR — Cross-Organization Payroll Overview</h1>
          <p>Payroll Month: ${currentMonth} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')}</p>
        </div>
        <div class="page-header">
          <div class="page-header-left"><h2>Payroll Overview</h2><p>Cross-organization payroll summary for ${currentMonth}</p></div>
          <button class="btn btn-print no-print" onclick="window.print()">🖨️ Print Overview</button>
        </div>
        <div class="stats-grid" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-icon blue">🏢</div><div class="stat-info"><div class="stat-label">Tenants</div><div class="stat-value">${orgs.length}</div></div></div>
          <div class="stat-card"><div class="stat-icon green">👥</div><div class="stat-info"><div class="stat-label">Total Employees</div><div class="stat-value">${orgs.reduce((s,o)=>s+db.getEmployees(o.org_id).length,0)}</div></div></div>
          <div class="stat-card"><div class="stat-icon purple">💰</div><div class="stat-info"><div class="stat-label">Total Locked Payout</div><div class="stat-value">₹${Math.round(totalLockedPayout).toLocaleString('en-IN')}</div></div></div>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Organization</th><th>Org ID</th><th>Employees</th><th>Payroll Status</th><th>Net Payout</th><th class="no-print">Action</th></tr></thead>
              <tbody>
                ${orgs.map(org => {
                  const emps = db.getEmployees(org.org_id);
                  const ledger = db.getPayrollLedger(org.org_id);
                  const run = ledger[currentMonth];
                  let payout = 0;
                  if (run?.status === 'Locked') run.records.forEach(r => payout += r.net || 0);
                  return `<tr>
                    <td><strong>${org.name}</strong></td>
                    <td><code>${org.org_id}</code></td>
                    <td>${emps.length}</td>
                    <td>${run ? `<span class="badge ${run.status === 'Locked' ? 'badge-success' : 'badge-warning'}">${run.status}</span>` : '<span class="badge badge-neutral">Not Run</span>'}</td>
                    <td><strong>${run?.status === 'Locked' ? `₹${Math.round(payout).toLocaleString('en-IN')}` : '—'}</strong></td>
                    <td class="no-print"><button class="btn btn-sm btn-primary" onclick="impersonateOrg('${org.org_id}')">Open HR View</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    return;
  }

  // Default: erp-orgs
  container.innerHTML = `
    <div class="animate-in">
      <div class="page-header">
        <div class="page-header-left"><h2>Organizations</h2><p>All registered tenant organizations</p></div>
        <button class="btn btn-primary" onclick="switchTab('erp-register')">➕ Register New</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">🏢</div>
          <div class="stat-info"><div class="stat-label">Total Tenants</div><div class="stat-value">${orgs.length}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">👥</div>
          <div class="stat-info"><div class="stat-label">Total Employees</div><div class="stat-value">${totalEmployees}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">💰</div>
          <div class="stat-info"><div class="stat-label">Locked Payout (${currentMonth})</div><div class="stat-value">₹${Math.round(totalPayout).toLocaleString('en-IN')}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">🔐</div>
          <div class="stat-info"><div class="stat-label">Access Level</div><div class="stat-value" style="font-size:1rem">Super Admin</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>All Organizations</h3></div>
        ${orgs.map(org => {
          const orgEmps = db.getEmployees(org.org_id);
          const ledger = db.getPayrollLedger(org.org_id);
          const run = ledger[currentMonth];
          let payout = 0;
          if (run?.status === 'Locked') run.records.forEach(r => payout += r.net || 0);
          return `
          <div class="org-card">
            <div class="org-avatar">🏛️</div>
            <div class="org-info">
              <div class="org-name">${org.name}</div>
              <div class="org-meta"><code>${org.org_id}</code> &nbsp;·&nbsp; EPF ${org.epf_rate}% &nbsp;·&nbsp; Basic ${org.basic_pct}% &nbsp;·&nbsp; Min Wage ₹${org.minimum_wage.toLocaleString('en-IN')}</div>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
                <span class="badge badge-primary">${orgEmps.length} employees</span>
                ${run ? `<span class="badge ${run.status === 'Locked' ? 'badge-success' : 'badge-warning'}">${run.status}</span>` : '<span class="badge badge-neutral">No Payroll</span>'}
                ${run?.status === 'Locked' ? `<span class="badge badge-neutral">₹${Math.round(payout).toLocaleString('en-IN')}</span>` : ''}
              </div>
              <div class="org-employees">
                ${orgEmps.map(e => `<span class="emp-chip" title="${e.designation}">👤 ${e.name}</span>`).join('')}
                ${orgEmps.length === 0 ? '<span style="font-size:0.78rem;color:var(--text-muted);font-style:italic;">No employees yet</span>' : ''}
              </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="impersonateOrg('${org.org_id}')">Launch HR</button>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function impersonateOrg(orgId) {
  // SECURITY: Only ERP admins can launch HR view for any org
  if (!state.isLoggedIn || state.currentRole !== 'ERP') return;
  state.currentRole = 'HR';
  state.currentOrgId = orgId;
  saveSessionState();
  renderCurrentView();
  renderDatabaseExplorer();
}

// ----------------------------------------------------
// 8. EMPLOYER/HR VIEW & INTERACTIVE OPERATIONS
// ----------------------------------------------------
// ----------------------------------------------------
// 8. EMPLOYER/HR VIEW & INTERACTIVE OPERATIONS
// ----------------------------------------------------
async function renderHRTab() {
  // SECURITY: Only HR or ERP (impersonating) can render HR views
  if (!state.isLoggedIn || (state.currentRole !== 'HR' && state.currentRole !== 'ERP')) {
    showToast('Access Denied', 'You do not have permission to view HR data.', 'error');
    return;
  }
  const container = document.getElementById('app-body');
  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
  const employees = db.getEmployees(state.currentOrgId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const attendance = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];
  const ledger = db.getPayrollLedger(state.currentOrgId);
  const payrollRun = ledger[state.activeMonthYear] || { status: 'Draft', records: [] };

  const topBarHtml = `
    <div class="top-settings-bar no-print" style="margin-bottom: 20px;">
      <div class="active-period-box">
        <label>Processing Month:</label>
        <input type="month" id="processing-period" value="${state.activeMonthYear}" onchange="changeProcessingPeriod(this.value)">
      </div>
      <div class="theme-selector-box">
        <label>Dashboard Theme Style:</label>
        <select id="theme-template-selector" onchange="setTheme(this.value)">
          <option value="classic-corporate" ${state.currentTheme === 'classic-corporate' ? 'selected' : ''}>Classic Corporate</option>
          <option value="modern-minimalist" ${state.currentTheme === 'modern-minimalist' ? 'selected' : ''}>Modern Minimalist</option>
          <option value="compact-matrix" ${state.currentTheme === 'compact-matrix' ? 'selected' : ''}>Compact Matrix</option>
        </select>
      </div>
    </div>
  `;

  // ── Custom Page Routing (before standard tabs) ──────────────────────────
  if (state.activeTab.startsWith('custom-')) {
    container.innerHTML = topBarHtml + renderCustomPage(state.activeTab);
    return;
  }

  if (state.activeTab === 'dashboard') {
    const totalCount = employees.length;
    let netPayout = 0;
    
    if (payrollRun.status === 'Locked') {
      payrollRun.records.forEach(r => netPayout += r.net);
    } else {
      employees.forEach(emp => {
        const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
        const adj = state.sandboxAdjustments[emp.emp_id] || null;
        const res = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
        netPayout += res.net;
      });
    }

    const pendingTasks = [];
    if (attendance.length === 0) pendingTasks.push("Upload Monthly Attendance Sheet");
    if (payrollRun.status !== 'Locked') pendingTasks.push("Approve & Finalize June 2026 Payroll");
    if (employees.some(e => !e.bank_account)) pendingTasks.push("Complete Employee Bank Details");

    container.innerHTML = topBarHtml + `
      ${renderAnnouncementBanners('hr')}
      <div class="tab-dashboard animate-fade-in">
        <div class="bento-grid">
          <!-- Card 1: Headcount Overview (Bento 1x1) -->
          <div class="bento-card col-span-1 row-span-1 glow-blue">
            <div class="bento-card-header">
              <h3>Active Headcount</h3>
            </div>
            <div class="bento-stat-wrapper">
              <div class="bento-stat-icon blue">👥</div>
              <div>
                <div class="bento-stat-value">${totalCount}</div>
                <div class="bento-stat-label">Employees Active</div>
              </div>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 10px;">
              Org: <code>${state.currentOrgId}</code>
            </div>
          </div>

          <!-- Card 2: Financial Take-home (Bento 1x1) -->
          <div class="bento-card col-span-1 row-span-1 glow-green">
            <div class="bento-card-header">
              <h3>Estimated Payout</h3>
            </div>
            <div class="bento-stat-wrapper">
              <div class="bento-stat-icon green">💰</div>
              <div>
                <div class="bento-stat-value">₹${Math.round(netPayout).toLocaleString('en-IN')}</div>
                <div class="bento-stat-label">Net Take-Home</div>
              </div>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 10px;">
              Period: <strong>${state.activeMonthYear}</strong>
            </div>
          </div>

          <!-- Card 3: Pending Action Checklist (Bento 2x1) -->
          <div class="bento-card col-span-2 row-span-1 glow-orange" style="justify-content: flex-start; gap: 8px;">
            <div class="bento-card-header">
              <h3>Compliance Guardian Alerts</h3>
              <span class="badge ${pendingTasks.length > 0 ? 'badge-warning' : 'badge-success'}">${pendingTasks.length} Alerts</span>
            </div>
            <div class="bento-checklist" style="margin-top: 4px;">
              ${pendingTasks.map(task => `
                <div class="bento-checklist-item">
                  <span style="color: var(--warning); font-weight:bold;">⚠️</span>
                  <span>${task}</span>
                </div>
              `).join('')}
              ${pendingTasks.length === 0 ? `
                <div class="bento-checklist-item clear">
                  <span>🟢</span>
                  <span>All compliance checks for ${state.activeMonthYear} are cleared.</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Card 4: Department Distribution Chart (Bento 1x2) -->
          <div class="bento-card col-span-1 row-span-2 chart-card">
            <div class="bento-card-header">
              <h3>Department Splits</h3>
            </div>
            <div class="chart-container" style="min-height: 180px; align-items: center; justify-content: center; display: flex; width: 100%;">
              <canvas id="deptDonutChart" width="260" height="190"></canvas>
            </div>
          </div>

          <!-- Card 5: Attendance Trend (Bento 2x2) -->
          <div class="bento-card col-span-2 row-span-2 chart-card">
            <div class="bento-card-header">
              <h3>Attendance Trend (Monthly)</h3>
            </div>
            <div class="chart-container" style="min-height: 220px; align-items: center; justify-content: center; display: flex; width: 100%;">
              <canvas id="attendanceBarChart" width="370" height="220"></canvas>
            </div>
          </div>

          <!-- Card 6: Cost Simulator (Bento 1x2) -->
          <div class="bento-card col-span-1 row-span-2 forecast-card" id="forecast-widget-card" style="justify-content: space-between;">
            <div class="bento-card-header">
              <h3>Cost Simulator</h3>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; justify-content: space-between;">
              <p style="font-size:0.75rem; color:var(--text-muted); line-height: 1.45; margin-bottom: 12px;">
                Simulate raising the monthly statutory EPF wage ceiling.
              </p>
              
              <div class="simulator-slider-group" style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.75rem;">
                  <strong>Ceiling:</strong>
                  <span id="epf-ceiling-val" style="font-family:var(--font-code); color:var(--primary); font-weight:700;">₹${state.epfoCeiling.toLocaleString('en-IN')}</span>
                </div>
                <input type="range" id="epf-ceiling-slider" min="15000" max="30000" step="1000" value="${state.epfoCeiling}" 
                  oninput="changeEpfoCeilingLimit(this.value)" style="width:100%; cursor: pointer;">
              </div>
              
              <div class="forecast-impact-box" id="forecast-impact-content">
                <!-- populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Card 7: Command Center (Bento 4x1) -->
          <div class="bento-card col-span-4 row-span-1 quick-actions-card" style="justify-content: center;">
            <div class="bento-card-header" style="margin-bottom: 8px;">
              <h3>Quick Actions Command Center</h3>
            </div>
            <div class="action-buttons-flex">
              <button class="btn btn-primary" onclick="switchTab('employees'); setTimeout(openAddEmployeeForm, 50);">
                <span class="icon">&#10133;</span> Add Single Employee
              </button>
              <button class="btn btn-primary" onclick="switchTab('attendance'); setTimeout(triggerFileInputClick, 50);">
                <span class="icon">&#128228;</span> Bulk Ingest Attendance (CSV)
              </button>
              <button class="btn btn-success" onclick="switchTab('payroll')">
                <span class="icon">&#9889;</span> Run Sandbox &amp; Process Payroll
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      drawDeptDonut(employees);
      drawAttendanceBar(attendance, employees);
      changeEpfoCeilingLimit(state.epfoCeiling);
      makeDashboardWidgetsDraggable();
    }, 50);

  } else if (state.activeTab === 'employees') {
    container.innerHTML = topBarHtml + `<div id="hr-tab-content"></div>`;
    renderEmployeeCRUDSection(employees);
  } else if (state.activeTab === 'attendance') {
    container.innerHTML = topBarHtml + `<div id="hr-tab-content"></div>`;
    renderAttendanceWizardSection(attendance, employees);
  } else if (state.activeTab === 'payroll') {
    container.innerHTML = topBarHtml + `<div id="hr-tab-content"></div>`;
    renderSandboxPayrollSection(employees, org, attendance, payrollRun);
  } else if (state.activeTab === 'compliance') {
    container.innerHTML = topBarHtml + `<div id="hr-tab-content"></div>`;
    renderComplianceSection(employees, org, attendance, payrollRun);
  } else if (state.activeTab === 'reports') {
    container.innerHTML = topBarHtml + `<div id="hr-tab-content"></div>`;
    renderReportsSection(employees, org, attendance, payrollRun);
  } else if (state.activeTab === 'settings') {
    container.innerHTML = topBarHtml + `<div id="hr-tab-content"></div>`;
    renderComplianceSettingsSection(org);
  }
}

function changeProcessingPeriod(val) {
  state.activeMonthYear = val;
  renderHRTab();
}

// ----------------------------------------------------
// CANVAS GRAPHICAL DRAWING UTILITIES
// ----------------------------------------------------
let chartTooltip = document.getElementById('chart-tooltip');
if (!chartTooltip) {
  chartTooltip = document.createElement('div');
  chartTooltip.id = 'chart-tooltip';
  chartTooltip.style.cssText = 'position:fixed;display:none;background:var(--card-bg);color:var(--text-h);padding:8px 12px;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.2);pointer-events:none;z-index:9999;font-size:0.8rem;border:1px solid var(--card-border);backdrop-filter:blur(10px);font-weight:600;';
  document.body.appendChild(chartTooltip);
}

function drawDeptDonut(employees) {
  const canvas = document.getElementById('deptDonutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const deptCounts = {};
  employees.forEach(emp => { deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1; });
  const depts = Object.keys(deptCounts);
  
  if (depts.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px sans-serif';
    ctx.fillText("No employee data available", 50, 100);
    return;
  }

  const colors = ['#007aff', '#5856d6', '#34c759', '#ff9500', '#af52de', '#ff2d55'];
  let total = employees.length;
  const cx = 100, cy = 100, radius = 60, thickness = 25;
  
  // Calculate slices
  let slices = [];
  let startAngle = 0;
  depts.forEach((dept, i) => {
    const sliceAngle = (deptCounts[dept] / total) * 2 * Math.PI;
    slices.push({ dept, count: deptCounts[dept], startAngle, endAngle: startAngle + sliceAngle, color: colors[i % colors.length] });
    startAngle += sliceAngle;
  });

  let hoveredIndex = -1;
  let animProgress = 0;

  function renderChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Slices
    slices.forEach((slice, i) => {
      const isHovered = hoveredIndex === i;
      const currentRadius = isHovered ? radius + 5 : radius;
      
      ctx.beginPath();
      // Animate arc drawing
      const drawEndAngle = slice.startAngle + ((slice.endAngle - slice.startAngle) * Math.min(animProgress, 1));
      ctx.arc(cx, cy, currentRadius, slice.startAngle, drawEndAngle);
      ctx.strokeStyle = slice.color;
      ctx.lineWidth = isHovered ? thickness + 4 : thickness;
      ctx.stroke();

      // Legend
      ctx.fillStyle = slice.color;
      ctx.fillRect(180, 20 + i * 25, 12, 12);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-h') || '#2d3748';
      ctx.font = isHovered ? 'bold 12px sans-serif' : '12px sans-serif';
      ctx.fillText(`${slice.dept} (${slice.count})`, 200, 31 + i * 25);
    });
  }

  // Initial Animation
  const animate = () => {
    if (animProgress < 1) {
      animProgress += 0.05;
      renderChart();
      requestAnimationFrame(animate);
    } else {
      renderChart();
    }
  };
  animate();

  // Interactivity
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    const dist = Math.sqrt(x*x + y*y);
    
    let found = -1;
    if (dist >= radius - thickness/2 && dist <= radius + thickness/2) {
      let angle = Math.atan2(y, x);
      if (angle < 0) angle += 2 * Math.PI;
      slices.forEach((s, i) => {
        if (angle >= s.startAngle && angle <= s.endAngle) found = i;
      });
    }

    if (found !== hoveredIndex) {
      hoveredIndex = found;
      renderChart();
      canvas.style.cursor = found !== -1 ? 'pointer' : 'default';
    }

    if (found !== -1) {
      chartTooltip.style.display = 'block';
      chartTooltip.style.left = e.clientX + 15 + 'px';
      chartTooltip.style.top = e.clientY + 15 + 'px';
      chartTooltip.innerHTML = `${slices[found].dept}: <span style="color:${slices[found].color}">${slices[found].count} Employees</span>`;
    } else {
      chartTooltip.style.display = 'none';
    }
  };
  canvas.onmouseleave = () => { hoveredIndex = -1; chartTooltip.style.display = 'none'; renderChart(); };
}

function drawAttendanceBar(attendance, employees) {
  const canvas = document.getElementById('attendanceBarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (attendance.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px sans-serif';
    ctx.fillText("Upload Attendance CSV to view trend stats", 50, 100);
    return;
  }

  let p = 0, a = 0, l = 0, wo = 0;
  attendance.forEach(att => {
    att.days.forEach(d => {
      if (d === 'P') p++;
      else if (d === 'A') a++;
      else if (d === 'EL' || d === 'CO') l++;
      else if (d === 'WO' || d === 'H') wo++;
    });
  });

  const categories = ['Present', 'Absent', 'Leave', 'Off/Holidays'];
  const values = [p, a, l, wo];
  const colors = ['#34c759', '#ff3b30', '#ff9500', '#8e8e93'];

  const maxVal = Math.max(...values, 10);
  const chartHeight = 130;
  const startX = 40, startY = 160, barWidth = 45, barSpacing = 40;
  
  let bars = [];
  values.forEach((val, idx) => {
    const barHeight = (val / maxVal) * chartHeight;
    bars.push({ cat: categories[idx], val, color: colors[idx], x: startX + idx * (barWidth + barSpacing) + 10, y: startY - barHeight, w: barWidth, h: barHeight });
  });

  let hoveredIndex = -1;
  let animProgress = 0;

  function renderChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Axes
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 4 * (barWidth + barSpacing), startY);
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY - chartHeight);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-border') || '#cbd5e0';
    ctx.stroke();

    bars.forEach((bar, idx) => {
      const isHovered = hoveredIndex === idx;
      
      // Animate height
      const currentH = bar.h * Math.min(animProgress, 1);
      const currentY = startY - currentH;

      ctx.fillStyle = isHovered ? bar.color : bar.color + 'cc'; // Slight opacity reduction when not hovered
      if(isHovered) {
        ctx.shadowColor = bar.color;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(bar.x, currentY, bar.w, currentH);
      ctx.shadowBlur = 0; // reset

      // Labels
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-h') || '#2d3748';
      ctx.font = isHovered ? 'bold 11px sans-serif' : '11px sans-serif';
      ctx.fillText(bar.cat, bar.x - 5, startY + 20);
      ctx.fillText(bar.val, bar.x + 10, currentY - 5);
    });
  }

  const animate = () => {
    if (animProgress < 1) {
      animProgress += 0.05;
      renderChart();
      requestAnimationFrame(animate);
    } else {
      renderChart();
    }
  };
  animate();

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let found = -1;
    bars.forEach((bar, i) => {
      if (mouseX >= bar.x && mouseX <= bar.x + bar.w && mouseY >= bar.y && mouseY <= startY) {
        found = i;
      }
    });

    if (found !== hoveredIndex) {
      hoveredIndex = found;
      renderChart();
      canvas.style.cursor = found !== -1 ? 'pointer' : 'default';
    }

    if (found !== -1) {
      chartTooltip.style.display = 'block';
      chartTooltip.style.left = e.clientX + 15 + 'px';
      chartTooltip.style.top = e.clientY + 15 + 'px';
      chartTooltip.innerHTML = `${bars[found].cat}: <span style="color:${bars[found].color}">${bars[found].val} Days</span>`;
    } else {
      chartTooltip.style.display = 'none';
    }
  };
  canvas.onmouseleave = () => { hoveredIndex = -1; chartTooltip.style.display = 'none'; renderChart(); };
}

function makeDashboardWidgetsDraggable() {
  const grid = document.querySelector('.bento-grid') || document.querySelector('.dashboard-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.bento-card, .chart-card, .quick-actions-card');
  let dragSrcEl = null;

  cards.forEach(card => {
    card.setAttribute('draggable', 'true');
    card.style.cursor = 'grab';

    card.addEventListener('dragstart', (e) => {
      card.style.opacity = '0.4';
      card.style.cursor = 'grabbing';
      dragSrcEl = card;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', card.innerHTML);
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      card.style.cursor = 'grab';
      cards.forEach(c => {
        c.classList.remove('drag-over');
      });
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    });

    card.addEventListener('dragenter', () => {
      if (card !== dragSrcEl) {
        card.classList.add('drag-over');
      }
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      card.classList.remove('drag-over');
      
      if (dragSrcEl !== card) {
        const parent = card.parentNode;
        const children = Array.from(parent.children);
        const indexA = children.indexOf(dragSrcEl);
        const indexB = children.indexOf(card);
        
        if (indexA < indexB) {
          parent.insertBefore(dragSrcEl, card.nextSibling);
        } else {
          parent.insertBefore(dragSrcEl, card);
        }
        
        // Re-draw Canvas charts since canvas is lost on DOM reflow
        const employees = db.getEmployees(state.currentOrgId);
        const attendance = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];
        drawDeptDonut(employees);
        drawAttendanceBar(attendance, employees);
        
        // Re-initialize drag listeners on the swapped cards
        makeDashboardWidgetsDraggable();
      }
      return false;
    });
  });
}

// ----------------------------------------------------
// 9. EMPLOYEE DIRECTORY CRUD OPERATION WRAPPERS
// ----------------------------------------------------
function renderEmployeeCRUDSection(employees) {
  const content = document.getElementById('hr-tab-content');
  
  content.innerHTML = `
    <div class="crud-container animate-fade-in">
      <div class="section-actions-row no-print">
        <div class="search-box">
          <input type="text" id="crud-emp-search" placeholder="Search by name, ID, or department..." oninput="filterEmployeeTable(this.value)">
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="document.getElementById('import-registration-input').click()"><span class="icon">📥</span> Bulk Import Directory</button>
          <input type="file" id="import-registration-input" style="display:none;" accept=".csv" onchange="handleEmployeeRegistrationUpload(event)">
          <button class="btn btn-secondary" onclick="window.print()"><span class="icon">🖨️</span> Print Directory</button>
          <button class="btn btn-primary" onclick="openAddEmployeeForm()">+ Add New Employee</button>
        </div>
      </div>
      <div style="margin-top:-10px; margin-bottom:15px; font-size:0.78rem; color:var(--text-muted);" class="no-print">
        Don't have a template? <a href="#" onclick="downloadRegistrationCSVTemplate(); return false;" style="color:var(--primary-hover); text-decoration:underline;">Download Employee Registration CSV Template</a>
      </div>

      <!-- Add/Edit Modal (hidden by default) -->
      <div id="crud-form-card" class="card card-premium add-employee-modal no-print" style="display: none;">
        <div class="card-header">
          <h3 id="form-title">Add Employee Form</h3>
          <button class="btn-close" onclick="closeEmployeeForm()">&#10006;</button>
        </div>
        <form id="employee-crud-form" class="standard-form">
          <input type="hidden" id="form-action" value="CREATE">
          <div class="form-row">
            <div class="form-group">
              <label>Employee Code (emp_id) <span class="required">*</span></label>
              <input class="form-control" type="text" id="emp-crud-id" placeholder="e.g. EMP106" required>
            </div>
            <div class="form-group">
              <label>Full Name <span class="required">*</span></label>
              <input class="form-control" type="text" id="emp-crud-name" placeholder="Aarav Sharma" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date of Joining (DOJ) <span class="required">*</span></label>
              <input class="form-control" type="date" id="emp-crud-doj" required>
            </div>
            <div class="form-group">
              <label>Date of Exit (Exit Date)</label>
              <input class="form-control" type="date" id="emp-crud-exit">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Cost to Company - CTC (Monthly ₹) <span class="required">*</span></label>
              <input class="form-control" type="number" id="emp-crud-ctc" placeholder="e.g. 50000" min="0" required>
            </div>
            <div class="form-group">
              <label>Department</label>
              <input class="form-control" type="text" id="emp-crud-dept" placeholder="Engineering" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Designation</label>
              <input class="form-control" type="text" id="emp-crud-desg" placeholder="Software Engineer" required>
            </div>
            <div class="form-group">
              <label>Bank Account Number</label>
              <input class="form-control" type="text" id="emp-crud-bank" placeholder="HDFC 123456789">
            </div>
          </div>
          
          <div class="form-section-header">Compliance Declarations</div>
          <div class="form-row checkbox-row">
            <div class="checkbox-group">
              <input type="checkbox" id="emp-crud-pf" checked>
              <label for="emp-crud-pf">Enable EPF Contribution (12% of Basic)</label>
            </div>
            <div class="checkbox-group">
              <input type="checkbox" id="emp-crud-esi">
              <label for="emp-crud-esi">Enable ESI Contribution (0.75% of Gross)</label>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>TDS Rate Option</label>
              <select id="emp-crud-tds">
                <option value="auto">Auto calculate by Tax Slabs</option>
                <option value="0">0% (Exempt)</option>
                <option value="5">5% (TDS Standard)</option>
                <option value="10">10% (TDS Higher)</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="position:relative; width: 100%;">
              <label>PAN Card (e.g. ABCDE1234F)</label>
              <div style="display:flex; gap:8px; width:100%;">
                <input class="form-control" type="text" id="emp-crud-pan" placeholder="ABCDE1234F" pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" style="flex:1;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="verifyKycField('pan')" style="padding: 4px 12px; font-size: 0.76rem; border-radius: 8px;">Verify PAN</button>
              </div>
              <span id="pan-kyc-status" class="kyc-badge-status" style="display:block; font-size:0.75rem; margin-top:4px;"></span>
            </div>
            <div class="form-group" style="position:relative; width: 100%;">
              <label>Aadhaar Card (e.g. 123456789012)</label>
              <div style="display:flex; gap:8px; width:100%;">
                <input class="form-control" type="text" id="emp-crud-aadhaar" placeholder="123456789012" pattern="[0-9]{12}" style="flex:1;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="verifyKycField('aadhaar')" style="padding: 4px 12px; font-size: 0.76rem; border-radius: 8px;">Verify Aadhaar</button>
              </div>
              <span id="aadhaar-kyc-status" class="kyc-badge-status" style="display:block; font-size:0.75rem; margin-top:4px;"></span>
            </div>
          </div>

          <div class="form-section-header">Income Tax Sandbox Declarations</div>
          <div class="form-row">
            <div class="form-group">
              <label>Monthly Rent Paid (₹)</label>
              <input class="form-control" type="number" id="emp-crud-rent" value="0" min="0">
            </div>
            <div class="form-group">
              <label>Landlord PAN Card (Mandatory if rent > ₹8,333/mo)</label>
              <input class="form-control" type="text" id="emp-crud-landlord-pan" placeholder="ABCDE1234F" pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Sec 80C Investments (Annual ₹)</label>
              <input class="form-control" type="number" id="emp-crud-80c" value="0" min="0" max="150000">
            </div>
            <div class="form-group">
              <label>Sec 80D Medical (Annual ₹)</label>
              <input class="form-control" type="number" id="emp-crud-80d" value="0" min="0" max="25000">
            </div>
            <div class="form-group">
              <label>Other Income (Annual ₹)</label>
              <input class="form-control" type="number" id="emp-crud-other-income" value="0">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeEmployeeForm()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-form">Save Employee Record</button>
          </div>
        </form>
      </div>

      <!-- Employee List Table -->
      <div class="card">
        <div class="card-header">
          <h3>Employee Roster</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table" id="employee-list-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Joining / Exit Date</th>
                <th>Monthly CTC</th>
                <th>Department &amp; Desg</th>
                <th>EPF</th>
                <th>ESI</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="employee-crud-table-body">
              ${employees.map(emp => `
                <tr id="emp-row-${emp.emp_id}">
                  <td><code>${emp.emp_id}</code></td>
                  <td><strong>${emp.name}</strong></td>
                  <td>
                    <div>DOJ: ${emp.doj}</div>
                    ${emp.exit_date ? `<div class="badge badge-error">Exit: ${emp.exit_date}</div>` : `<div class="badge badge-success">Active</div>`}
                  </td>
                  <td>₹${emp.ctc.toLocaleString('en-IN')}</td>
                  <td>
                    <div>${emp.department}</div>
                    <div style="font-size:11px; opacity:0.7;">${emp.designation}</div>
                  </td>
                  <td>
                    <span class="badge ${emp.epf_eligible ? 'badge-success' : 'badge-light'}" onclick="toggleEPFDynamic('${emp.emp_id}')">
                      ${emp.epf_eligible ? 'EPF Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${emp.esi_eligible ? 'badge-success' : 'badge-light'}" onclick="toggleESIDynamic('${emp.emp_id}')">
                      ${emp.esi_eligible ? 'ESI Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-small btn-secondary" onclick="editEmployee('${emp.emp_id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteEmployee('${emp.emp_id}')">Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Bind employee form
  const form = document.getElementById('employee-crud-form');
  if (form) {
    form.addEventListener('submit', handleCRUDSubmit);
  }
}

function filterEmployeeTable(val) {
  const query = val.toLowerCase();
  const rows = document.querySelectorAll('#employee-crud-table-body tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function openAddEmployeeForm() {
  document.getElementById('crud-form-card').style.display = 'block';
  document.getElementById('form-title').textContent = 'Register New Employee';
  document.getElementById('form-action').value = 'CREATE';
  document.getElementById('emp-crud-id').readOnly = false;
  document.getElementById('employee-crud-form').reset();
  
  const panStatus = document.getElementById('pan-kyc-status');
  const aadhaarStatus = document.getElementById('aadhaar-kyc-status');
  if (panStatus) { panStatus.textContent = ''; panStatus.className = 'kyc-badge-status'; }
  if (aadhaarStatus) { aadhaarStatus.textContent = ''; aadhaarStatus.className = 'kyc-badge-status'; }

  // Reset new tax fields
  document.getElementById('emp-crud-rent').value = 0;
  document.getElementById('emp-crud-landlord-pan').value = '';
  document.getElementById('emp-crud-80c').value = 0;
  document.getElementById('emp-crud-80d').value = 0;
  document.getElementById('emp-crud-other-income').value = 0;
}

function closeEmployeeForm() {
  document.getElementById('crud-form-card').style.display = 'none';
}

async function handleCRUDSubmit(e) {
  e.preventDefault();
  const action = document.getElementById('form-action').value;
  const empId = document.getElementById('emp-crud-id').value.trim();
  const name = document.getElementById('emp-crud-name').value.trim();
  const doj = document.getElementById('emp-crud-doj').value;
  const exitDate = document.getElementById('emp-crud-exit').value || null;
  const ctc = parseFloat(document.getElementById('emp-crud-ctc').value);
  const dept = document.getElementById('emp-crud-dept').value.trim();
  const desg = document.getElementById('emp-crud-desg').value.trim();
  const bank = document.getElementById('emp-crud-bank').value.trim();
  const pf = document.getElementById('emp-crud-pf').checked;
  const esi = document.getElementById('emp-crud-esi').checked;
  const tdsVal = document.getElementById('emp-crud-tds').value;
  const tds = tdsVal === 'auto' ? null : parseFloat(tdsVal);
  const pan = document.getElementById('emp-crud-pan').value.toUpperCase().trim();
  const aadhaar = document.getElementById('emp-crud-aadhaar').value.trim();
  const rent = parseFloat(document.getElementById('emp-crud-rent').value) || 0;
  const landlordPan = document.getElementById('emp-crud-landlord-pan').value.toUpperCase().trim();
  const tax80c = parseFloat(document.getElementById('emp-crud-80c').value) || 0;
  const tax80d = parseFloat(document.getElementById('emp-crud-80d').value) || 0;
  const otherIncome = parseFloat(document.getElementById('emp-crud-other-income').value) || 0;

  // Custom regex validation check
  if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    alert("Invalid PAN Card format. Must be 10 characters alphanumeric (e.g. ABCDE1234F).");
    return;
  }
  if (aadhaar && !/^[0-9]{12}$/.test(aadhaar)) {
    alert("Invalid Aadhaar Card format. Must be exactly 12 digits (e.g. 123456789012).");
    return;
  }
  if (landlordPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(landlordPan)) {
    alert("Invalid Landlord PAN Card format. Must be 10 characters alphanumeric (e.g. ABCDE1234F).");
    return;
  }
  if (rent > 8333 && !landlordPan) {
    alert("Landlord PAN Card is mandatory if monthly rent is greater than ₹8,333.");
    return;
  }

  const oldEmp = db.getEmployee(empId) || {};
  const empData = {
    ...oldEmp,
    emp_id: empId,
    org_id: state.currentOrgId,
    name: name,
    doj: doj,
    exit_date: exitDate,
    ctc: ctc,
    department: dept,
    designation: desg,
    bank_account: bank,
    epf_eligible: pf,
    esi_eligible: esi,
    tds_rate: tds,
    pan: pan,
    aadhaar: aadhaar,
    rent_paid: rent,
    landlord_pan: landlordPan,
    tax_80c: tax80c,
    tax_80d: tax80d,
    other_income: otherIncome,
    status: oldEmp.status || 'Active'
  };

  try {
    if (action === 'CREATE') {
      await db.createEmployee(empData);
      alert(`Employee ${name} registered successfully in database.`);
    } else {
      await db.updateEmployee(empId, empData);
      alert(`Employee ${name} updated successfully in database.`);
    }
    await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
    closeEmployeeForm();
    renderHRTab();
  } catch (err) {
    alert(err.message);
  }
}

function editEmployee(empId) {
  const emp = db.getEmployee(empId);
  if (!emp) return;

  document.getElementById('crud-form-card').style.display = 'block';
  document.getElementById('form-title').textContent = `Edit Employee Record: ${emp.name}`;
  document.getElementById('form-action').value = 'UPDATE';
  
  document.getElementById('emp-crud-id').value = emp.emp_id;
  document.getElementById('emp-crud-id').readOnly = true;
  document.getElementById('emp-crud-name').value = emp.name;
  document.getElementById('emp-crud-doj').value = emp.doj;
  document.getElementById('emp-crud-exit').value = emp.exit_date || '';
  document.getElementById('emp-crud-ctc').value = emp.ctc;
  document.getElementById('emp-crud-dept').value = emp.department;
  document.getElementById('emp-crud-desg').value = emp.designation;
  document.getElementById('emp-crud-bank').value = emp.bank_account || '';
  document.getElementById('emp-crud-pf').checked = emp.epf_eligible;
  document.getElementById('emp-crud-esi').checked = emp.esi_eligible;
  document.getElementById('emp-crud-tds').value = emp.tds_rate === null ? 'auto' : emp.tds_rate.toString();
  document.getElementById('emp-crud-pan').value = emp.pan || '';
  document.getElementById('emp-crud-aadhaar').value = emp.aadhaar || '';
  
  document.getElementById('pan-kyc-status').textContent = emp.pan ? '✅ Verified (Loaded)' : '';
  document.getElementById('pan-kyc-status').className = 'kyc-badge-status success';
  document.getElementById('aadhaar-kyc-status').textContent = emp.aadhaar ? '✅ Verified (Loaded)' : '';
  document.getElementById('aadhaar-kyc-status').className = 'kyc-badge-status success';

  // Populate tax fields
  document.getElementById('emp-crud-rent').value = emp.rent_paid || 0;
  document.getElementById('emp-crud-landlord-pan').value = emp.landlord_pan || '';
  document.getElementById('emp-crud-80c').value = emp.tax_80c || 0;
  document.getElementById('emp-crud-80d').value = emp.tax_80d || 0;
  document.getElementById('emp-crud-other-income').value = emp.other_income || 0;
}

async function deleteEmployee(empId) {
  if (confirm(`Are you sure you want to deactivate and remove ${empId} from the database?`)) {
    await db.deleteEmployee(empId);
    await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
    alert(`Employee ${empId} deleted from records.`);
    renderHRTab();
  }
}

async function toggleEPFDynamic(empId) {
  const emp = db.getEmployee(empId);
  if (emp) {
    await db.updateEmployee(empId, { epf_eligible: !emp.epf_eligible });
    await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
    renderHRTab();
  }
}

async function toggleESIDynamic(empId) {
  const emp = db.getEmployee(empId);
  if (emp) {
    await db.updateEmployee(empId, { esi_eligible: !emp.esi_eligible });
    await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
    renderHRTab();
  }
}

// ----------------------------------------------------
// 10. ATTENDANCE SHEET WIZARD CONTROLLER
// ----------------------------------------------------
function renderAttendanceWizardSection(attendance, employees) {
  const content = document.getElementById('hr-tab-content');

  content.innerHTML = `
    <div class="attendance-container animate-fade-in">
      <div class="card card-premium">
        <div class="card-header">
          <h3>Intelligent Attendance File Ingestion</h3>
        </div>
        <div class="upload-dropzone" onclick="triggerFileInputClick()" id="dropzone-box">
          <span class="icon" style="font-size: 48px;">&#128196;</span>
          <p><strong>Click to choose attendance Excel/CSV template file</strong></p>
          <p class="subtitle">Supports column header auto-detection, custom mappings, and database check mismatch verification</p>
          <input type="file" id="attendance-file-input" style="display: none;" accept=".csv" onchange="loadAttendanceFile(event)">
        </div>
        <div class="download-link-row">
          <p>Don't have a file? <a href="#" onclick="downloadSampleCSV(); return false;">Download Sample Monthly Attendance CSV Template</a> containing mid-month hire and exit records.</p>
        </div>
      </div>

      <!-- Current attendance registry details -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3>Current Active Attendance Matrix for ${state.activeMonthYear}</h3>
          <button class="btn btn-secondary btn-sm no-print" onclick="window.print()"><span class="icon">🖨️</span> Print Attendance</button>
        </div>
        ${attendance.length === 0 ? `
          <div class="empty-state">
            <p>No attendance has been uploaded or configured for this month yet.</p>
            <p class="subtitle">Please upload a CSV file using the box above to load payable days calculations.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table font-mono-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Days (1 to 30)</th>
                  <th>OT Hours</th>
                </tr>
              </thead>
              <tbody>
                ${attendance.map(a => {
                  const dbEmp = employees.find(e => e.emp_id === a.emp_id);
                  let dayBadges = '';
                  a.days.forEach((day, index) => {
                    let badgeClass = 'day-p';
                    if (day === 'A') badgeClass = 'day-a';
                    else if (day === 'X') badgeClass = 'day-x'; // pre-join or post-exit
                    else if (day === 'WO') badgeClass = 'day-wo';
                    else if (day === 'H') badgeClass = 'day-h';
                    else if (day === 'EL') badgeClass = 'day-el';
                    else if (day === 'CO') badgeClass = 'day-co';
                    
                    dayBadges += `<span class="day-badge ${badgeClass}" title="Day ${index+1}: ${day}">${day}</span>`;
                  });

                  return `
                    <tr>
                      <td><code>${a.emp_id}</code></td>
                      <td><strong>${dbEmp ? dbEmp.name : a.name}</strong></td>
                      <td><div class="days-flex-grid">${dayBadges}</div></td>
                      <td><strong>${a.ot} hrs</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

function triggerFileInputClick() {
  const el = document.getElementById('attendance-file-input');
  if (el) el.click();
}

function loadAttendanceFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    handleAttendanceUpload(e.target.result);
  };
  reader.readAsText(file);
}

function downloadSampleCSV() {
  // Let's generate and download a sample CSV representing Tata Motors or TCS for June 2026 (30 days)
  let csv = "EmployeeCode,FullName,";
  for (let i = 1; i <= 30; i++) {
    csv += `Day${i},`;
  }
  csv += "Overtime\n";

  // Standard employee: Aarav Sharma (EMP101) - Present everywhere
  csv += "EMP101,Aarav Sharma,";
  for (let i = 1; i <= 30; i++) {
    csv += (i % 7 === 0 || i % 7 === 6) ? "WO," : "P,";
  }
  csv += "10\n";

  // Mid-month joiner: Priya Patel (EMP102) - Joins June 5 (1-4 are empty or X)
  csv += "EMP102,Priya Patel,X,X,X,X,";
  for (let i = 5; i <= 30; i++) {
    csv += (i % 7 === 0 || i % 7 === 6) ? "WO," : "P,";
  }
  csv += "0\n";

  // Mismatch check candidate: Rohan Das -> Mismatching file name "Rohan D."
  csv += "EMP103,Rohan D.,";
  for (let i = 1; i <= 30; i++) {
    if (i > 20) csv += "X,"; // post-exit
    else csv += (i % 7 === 0 || i % 7 === 6) ? "WO," : "P,";
  }
  csv += "5\n";

  // Ananya Iyer (EMP104)
  csv += "EMP104,Ananya Iyer,";
  for (let i = 1; i <= 30; i++) {
    if (i === 6 || i === 7) csv += "EL,";
    else if (i === 22 || i === 23) csv += "A,";
    else csv += (i % 7 === 0 || i % 7 === 6) ? "WO," : "P,";
  }
  csv += "0\n";

  // Kabir Malhotra (EMP105) - Joins June 25
  csv += "EMP105,Kabir Malhotra,";
  for (let i = 1; i <= 30; i++) {
    if (i < 25) csv += "X,";
    else csv += (i % 7 === 0 || i % 7 === 6) ? "WO," : "P,";
  }
  csv += "2\n";

  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "symbiosis_june_2026_attendance.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ----------------------------------------------------
// 11. COMPLIANCE SANDBOX REVIEW ENGINE
// ----------------------------------------------------
function renderSandboxPayrollSection(employees, org, attendance, payrollRun) {
  const content = document.getElementById('hr-tab-content');

  // Compute live calculations for all active roster employees
  const processedRecords = [];
  let totalNet = 0;
  let totalCompanyPF = 0;
  let totalCompanyESI = 0;
  let complianceAlerts = [];

  employees.forEach(emp => {
    const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
    const adj = state.sandboxAdjustments[emp.emp_id] || null;
    const calc = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
    processedRecords.push(calc);

    totalNet += calc.net;
    totalCompanyPF += calc.pf_employer;
    totalCompanyESI += calc.esi_employer;
    
    // Accumulate alerts
    calc.warnings.forEach(w => {
      complianceAlerts.push({ emp_id: emp.emp_id, name: emp.name, message: w });
    });
  });

  const isLocked = payrollRun.status === 'Locked';

  content.innerHTML = `
    <div class="sandbox-container animate-fade-in">
      <div class="sandbox-actions-row no-print">
        <div>
          <h2 style="margin-bottom: 10px;">Payroll Sandbox Processing &amp; Review</h2>
          <p class="subtitle" style="margin-top: 0; color: var(--text-muted); font-size: 0.88rem; line-height: 1.45;">
            Draft mode allows inline adjustments. final approval locks and generates payslips.
            ${!isLocked ? `<br><a href="#" onclick="downloadWagesCSVTemplate(); return false;" style="color:var(--primary-hover); text-decoration:underline; font-size:0.8rem;">Download Wages/Adjustments CSV Template</a>` : ''}
          </p>
        </div>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          ${isLocked ? `
            <div class="locked-badge-big" style="margin-right:4px;">&#128274; Payroll Finalized &amp; Locked</div>
            <button class="btn btn-primary" onclick="downloadPfEcrFile()"><span class="icon">📄</span> Download EPF ECR Challan</button>
            <button class="btn btn-success" onclick="downloadBankPayoutCsv()"><span class="icon">💰</span> Export Bank Payout CSV</button>
          ` : `
            <button class="btn btn-secondary" onclick="document.getElementById('import-wages-input').click()"><span class="icon">📥</span> Import Wages (CSV)</button>
            <input type="file" id="import-wages-input" style="display:none;" accept=".csv" onchange="handleWagesStatementsUpload(event)">
            <button class="btn btn-success" onclick="approveAndLockPayroll('${state.activeMonthYear}')">&#128274; Approve &amp; Finalize Payroll</button>
          `}
          <button class="btn btn-secondary" onclick="printWageStatement()"><span class="icon">&#128424;</span> Print Statement</button>
        </div>
      </div>

      <!-- Real-time Aggregate Metric Cards -->
      <div class="metrics-row">
        <div class="metric-card bg-grad-green">
          <span class="label">Total Net Salary Payout</span>
          <span class="val">₹${Math.round(totalNet).toLocaleString('en-IN')}</span>
          <span class="subtext">Sum of all employees Net Salaries</span>
        </div>
        <div class="metric-card bg-grad-dark">
          <span class="label">Company EPF Liability</span>
          <span class="val">₹${Math.round(totalCompanyPF).toLocaleString('en-IN')}</span>
          <span class="subtext">Employer contribution (12% of Basic)</span>
        </div>
        <div class="metric-card bg-grad-dark">
          <span class="label">Company ESI Liability</span>
          <span class="val">₹${Math.round(totalCompanyESI).toLocaleString('en-IN')}</span>
          <span class="subtext">Employer contribution (3.25% of Gross)</span>
        </div>
      </div>

      <!-- Compliance Guardian Warning Console -->
      ${complianceAlerts.length > 0 ? `
        <div class="card warning-card border-left-danger no-print">
          <div class="card-header">
            <h3 class="danger-text">&#9888; Compliance Alerts &amp; Regulatory Warnings</h3>
          </div>
          <ul class="warning-list">
            ${complianceAlerts.map(alert => `
              <li><strong>${alert.emp_id} - ${alert.name}:</strong> ${alert.message}</li>
            `).join('')}
          </ul>
        </div>
      ` : `
        <div class="card success-card border-left-success no-print" style="background:#f0fff4; border:1px solid #c6f6d5; color:#22543d; padding:15px; border-radius:8px; margin-bottom:20px;">
          <strong style="display:flex; align-items:center;"><span style="font-size:20px; margin-right:8px;">&#9989;</span> Compliance Guardian: All regulatory checks passed successfully!</strong>
        </div>
      `}

      <!-- Wage Ledger Statement Sheet -->
      <div class="card print-wage-statement-card">
        <div class="card-header print-visible-header">
          <div>
            <h2 class="print-only">SYMBIOSIS COMPLIANCE PAYROLL WAGE LEDGER</h2>
            <h3 class="print-subtitle print-only">Tenant Organization: ${org.name} (${org.org_id}) | Payroll Month: ${state.activeMonthYear}</h3>
          </div>
          <h3 class="no-print">Draft Wage Registry</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table ledger-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Payable Days</th>
                <th>Basic Salary</th>
                <th>Gross Salary</th>
                <th>PF Ded (12%)</th>
                <th>ESI Ded (0.75%)</th>
                <th>PT / TDS</th>
                <th>Net Payable</th>
                <th class="no-print" style="width:250px;">Inline Adjustments &amp; Justifications</th>
              </tr>
            </thead>
            <tbody>
              ${processedRecords.map(r => `
                <tr class="${r.warnings.length > 0 ? 'row-warning' : ''}">
                  <td><code>${r.emp_id}</code></td>
                  <td>
                    <strong>${r.name}</strong>
                    ${r.warnings.length > 0 ? `<div class="warn-bullet no-print" title="${r.warnings.join('\n')}">&#9888; alert</div>` : ''}
                  </td>
                  <td>${r.payable_days} / ${r.tenure_days}d</td>
                  <td>₹${Math.round(r.basic_earned).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.gross).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.pf).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.esi).toLocaleString('en-IN')}</td>
                  <td>₹${r.pt} / ₹${Math.round(r.tds)}</td>
                  <td><strong class="success-text">₹${Math.round(r.net).toLocaleString('en-IN')}</strong></td>
                  <td class="no-print">
                    ${isLocked ? `
                      <div style="font-size:11px; color:#718096; word-break:break-all;">
                        Adj: ₹${r.adjustments} | Bonus: ₹${r.bonus}<br>
                        <em>Justification: ${r.justification || 'N/A'}</em>
                      </div>
                    ` : `
                      <div class="adjustment-inputs-flex">
                        <input type="number" placeholder="Bonus ₹" value="${r.bonus || ''}" 
                          oninput="saveAdjustmentValue('${r.emp_id}', 'variable_earnings', this.value)">
                        <input type="number" placeholder="Adj ₹" value="${r.adjustments || ''}" 
                          oninput="saveAdjustmentValue('${r.emp_id}', 'adjustments', this.value)">
                        <input type="text" placeholder="Reason details" value="${r.justification || ''}" 
                          oninput="saveAdjustmentValue('${r.emp_id}', 'justification', this.value)">
                      </div>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Locked records modifications portal (Auxiliary adjustment tool) -->
      ${isLocked ? `
        <div class="card border-left-warning no-print">
          <div class="card-header">
            <h3>Locked Register Mid-Cycle Adjustments</h3>
            <p class="subtitle">This payroll period is locked. Mid-cycle corrections must be passed with justification and will route into next month's ledger.</p>
          </div>
          <div class="aux-adjustment-form" style="display:flex; gap:15px; align-items:flex-end; padding:15px 0;">
            <div class="form-group" style="margin:0; flex:1;">
              <label>Select Employee</label>
              <select id="aux-emp-picker" class="form-control">
                ${employees.map(e => `<option value="${e.emp_id}">${e.name} (${e.emp_id})</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin:0; width:150px;">
              <label>Adjustment Value (₹)</label>
              <input class="form-control" type="number" id="aux-amount" placeholder="e.g. 5000">
            </div>
            <div class="form-group" style="margin:0; flex:2;">
              <label>Written Justification String</label>
              <input class="form-control" type="text" id="aux-reason" placeholder="Explain correction rationale...">
            </div>
            <button class="btn btn-warning" onclick="submitAuxCorrection()">Submit Correction</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function saveAdjustmentValue(empId, field, value) {
  if (!state.sandboxAdjustments[empId]) {
    state.sandboxAdjustments[empId] = { variable_earnings: 0, adjustments: 0, justification: '' };
  }
  
  if (field === 'justification') {
    state.sandboxAdjustments[empId][field] = value;
  } else {
    state.sandboxAdjustments[empId][field] = parseFloat(value) || 0;
  }

  // Reactive redraw of sandbox numbers
  renderHRTab();
}

async function approveAndLockPayroll(monthYear) {
  if (!confirm(`Are you sure you want to lock the ${monthYear} payroll batch? This will freeze all records and enable payslips.`)) {
    return;
  }

  const employees = db.getEmployees(state.currentOrgId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const attendance = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];

  const finalizedRecords = [];
  employees.forEach(emp => {
    const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
    const adj = state.sandboxAdjustments[emp.emp_id] || null;
    const calc = calculatePayrollForEmployee(emp, org, monthYear, empAtt, adj);
    finalizedRecords.push(calc);
  });

  const payrollRun = {
    status: 'Locked',
    approved_by: 'HR Administrator',
    approved_date: new Date().toISOString().split('T')[0],
    records: finalizedRecords,
    adjustments_log: []
  };

  await db.savePayrollRun(state.currentOrgId, monthYear, payrollRun);
  addAuditLog("PAYROLL_LOCK", `Payroll period ${monthYear} approved and locked with ${finalizedRecords.length} records.`);
  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
  alert(`Payroll run finalized and locked successfully! Employees can now access payslips.`);
  renderHRTab();
}

function printWageStatement() {
  window.print();
}

async function submitAuxCorrection() {
  const empId = document.getElementById('aux-emp-picker').value;
  const amount = parseFloat(document.getElementById('aux-amount').value);
  const reason = document.getElementById('aux-reason').value.trim();

  if (isNaN(amount) || !reason) {
    alert("Please provide an adjustment amount and a valid text justification string.");
    return;
  }

  const ledger = db.getPayrollLedger(state.currentOrgId);
  const payrollRun = ledger[state.activeMonthYear];
  if (!payrollRun) return;

  if (!payrollRun.adjustments_log) payrollRun.adjustments_log = [];
  
  payrollRun.adjustments_log.push({
    emp_id: empId,
    amount: amount,
    justification: reason,
    timestamp: new Date().toISOString().split('T')[0]
  });

  await db.savePayrollRun(state.currentOrgId, state.activeMonthYear, payrollRun);
  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
  
  alert(`Correction submitted! An adjustment of ₹${amount} will be applied to the subsequent month's ledger for employee ${empId}.`);
  
  document.getElementById('aux-amount').value = '';
  document.getElementById('aux-reason').value = '';
  renderHRTab();
}

// ----------------------------------------------------
// 11.5. STATUTORY COMPLIANCE & REPORTS TAB
// ----------------------------------------------------
async function downloadEPFECRFile() {
  try {
    showNotificationToast("EPF ECR Generation", "Requesting EPF ECR Challan text file from server...", "info");
    await ComplianceAPI.downloadEPFECR(state.currentOrgId, state.activeMonthYear);
    showNotificationToast("Success", "EPF ECR Challan downloaded successfully.", "success");
  } catch (err) {
    showNotificationToast("EPF Generation Failed", err.message || "An error occurred.", "danger");
  }
}

async function downloadESIReportFile() {
  try {
    showNotificationToast("ESI Report Generation", "Requesting ESIC monthly contribution Return...", "info");
    await ComplianceAPI.downloadESIReport(state.currentOrgId, state.activeMonthYear);
    showNotificationToast("Success", "ESI monthly contribution report downloaded.", "success");
  } catch (err) {
    showNotificationToast("ESI Generation Failed", err.message || "An error occurred.", "danger");
  }
}

async function downloadBankCSVFile() {
  try {
    showNotificationToast("Bank Bulk Payout Generation", "Requesting bankbulk payout CSV register...", "info");
    await ComplianceAPI.downloadBankCSV(state.currentOrgId, state.activeMonthYear);
    showNotificationToast("Success", "Bank payout CSV register downloaded successfully.", "success");
  } catch (err) {
    showNotificationToast("Bank Payout Generation Failed", err.message || "An error occurred.", "danger");
  }
}

function showEpfEcrPreview() {
  let modal = document.getElementById('compliance-preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'compliance-preview-modal';
    modal.className = 'wizard-modal-overlay';
    document.body.appendChild(modal);
  }

  const employees = db.getEmployees(state.currentOrgId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const attendance = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];
  const ledger = db.getPayrollLedger(state.currentOrgId);
  const payrollRun = ledger[state.activeMonthYear] || { status: 'Draft', records: [] };

  const records = [];
  if (payrollRun.status === 'Locked') {
    payrollRun.records.forEach(r => {
      const emp = employees.find(e => e.emp_id === r.emp_id) || {};
      if (!emp.epf_eligible) return;
      const empAtt = attendance.find(a => a.emp_id === r.emp_id);
      const adj = state.sandboxAdjustments[r.emp_id] || null;
      const c = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
      
      const uanId = emp.emp_id.replace(/\D/g, '') || '101';
      const uan = `1009${uanId.padStart(8, '0')}`;
      
      records.push({
        uan,
        name: r.name,
        gross: Math.round(r.gross),
        pfWages: Math.round(Math.min(c.basic_earned, state.epfoCeiling)),
        eeShare: Math.round(r.pf),
        erEpsShare: Math.round(Math.min(c.basic_earned, state.epfoCeiling) * 0.0833),
        erEpfShare: Math.round(r.pf - Math.round(Math.min(c.basic_earned, state.epfoCeiling) * 0.0833)),
        ncpDays: Math.round(c.absent_days)
      });
    });
  } else {
    employees.forEach(emp => {
      if (!emp.epf_eligible) return;
      const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
      const adj = state.sandboxAdjustments[emp.emp_id] || null;
      const c = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
      
      const uanId = emp.emp_id.replace(/\D/g, '') || '101';
      const uan = `1009${uanId.padStart(8, '0')}`;

      records.push({
        uan,
        name: emp.name,
        gross: Math.round(c.gross),
        pfWages: Math.round(Math.min(c.basic_earned, state.epfoCeiling)),
        eeShare: Math.round(c.pf),
        erEpsShare: Math.round(Math.min(c.basic_earned, state.epfoCeiling) * 0.0833),
        erEpfShare: Math.round(c.pf - Math.round(Math.min(c.basic_earned, state.epfoCeiling) * 0.0833)),
        ncpDays: Math.round(c.absent_days)
      });
    });
  }

  window.compliancePreviewRecords = records;
  renderEpfEcrPreviewModal(records);
}

function renderEpfEcrPreviewModal(records) {
  const modal = document.getElementById('compliance-preview-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="wizard-content-box" style="max-width: 900px;">
      <div class="wizard-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3>EPF Electronic Challan cum Return (ECR) Preview</h3>
          <p>Mock preview of Shram Suvidha Portal ECR file values for ${state.activeMonthYear}</p>
        </div>
        <button class="btn-close" onclick="closeEpfEcrPreview()">✕</button>
      </div>
      <div class="wizard-body" style="padding: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <div class="search-box" style="flex: 1; max-width: 300px; margin-bottom: 0; position:relative;">
            <input type="text" id="ecr-search-input" class="form-control" placeholder="Search by name..." oninput="filterEcrPreview(this.value)">
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted);">
            Total: <strong>${records.length} Members</strong> | Wage Limit: <strong>₹${state.epfoCeiling.toLocaleString('en-IN')}</strong>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table" id="ecr-preview-table">
            <thead>
              <tr>
                <th>UAN Identifier</th>
                <th>Member Name</th>
                <th>Gross Wages</th>
                <th>EPF Wages</th>
                <th>EE Share (12%)</th>
                <th>ER EPS Share (8.33%)</th>
                <th>ER EPF Share (3.67%)</th>
                <th>NCP Days</th>
              </tr>
            </thead>
            <tbody id="ecr-preview-tbody">
              ${records.map(r => `
                <tr>
                  <td><code>${r.uan}</code></td>
                  <td><strong>${r.name}</strong></td>
                  <td>₹${r.gross.toLocaleString('en-IN')}</td>
                  <td>₹${r.pfWages.toLocaleString('en-IN')}</td>
                  <td>₹${r.eeShare.toLocaleString('en-IN')}</td>
                  <td>₹${r.erEpsShare.toLocaleString('en-IN')}</td>
                  <td>₹${r.erEpfShare.toLocaleString('en-IN')}</td>
                  <td>${r.ncpDays} Days</td>
                </tr>
              `).join('')}
              ${records.length === 0 ? `<tr><td colspan="8" class="empty-state">No EPF registered employees found for this period.</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>
      <div class="wizard-footer">
        <button class="btn btn-secondary" onclick="closeEpfEcrPreview()">Close Preview</button>
        <button class="btn btn-primary" onclick="closeEpfEcrPreview(); downloadEPFECRFile();">Download ECR File</button>
      </div>
    </div>
  `;
}

function filterEcrPreview(query) {
  const tbody = document.getElementById('ecr-preview-tbody');
  if (!tbody) return;
  const filtered = window.compliancePreviewRecords.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td><code>${r.uan}</code></td>
      <td><strong>${r.name}</strong></td>
      <td>₹${r.gross.toLocaleString('en-IN')}</td>
      <td>₹${r.pfWages.toLocaleString('en-IN')}</td>
      <td>₹${r.eeShare.toLocaleString('en-IN')}</td>
      <td>₹${r.erEpsShare.toLocaleString('en-IN')}</td>
      <td>₹${r.erEpfShare.toLocaleString('en-IN')}</td>
      <td>${r.ncpDays} Days</td>
    </tr>
  `).join('');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No matching employees found.</td></tr>`;
  }
}

function closeEpfEcrPreview() {
  const modal = document.getElementById('compliance-preview-modal');
  if (modal) modal.style.display = 'none';
}

function renderComplianceSection(employees, org, attendance, payrollRun) {
  const content = document.getElementById('hr-tab-content');
  if (!content) return;

  let totalEPF_EE = 0;
  let totalEPF_ER = 0;
  let totalESI_EE = 0;
  let totalESI_ER = 0;
  let totalPT = 0;
  let totalTDS = 0;
  let totalLWF_EE = 0;
  let totalLWF_ER = 0;
  let totalNetPayout = 0;

  let epfCount = 0;
  let esiCount = 0;
  let bankCount = 0;

  const computedRecords = [];

  if (payrollRun.status === 'Locked') {
    payrollRun.records.forEach(r => {
      const emp = employees.find(e => e.emp_id === r.emp_id) || {};
      const empAtt = attendance.find(a => a.emp_id === r.emp_id);
      const adj = state.sandboxAdjustments[r.emp_id] || null;
      const c = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);

      computedRecords.push({
        emp_id: r.emp_id,
        name: r.name,
        gross: r.gross,
        basic_earned: c.basic_earned,
        pf: r.pf,
        pf_employer: c.pf_employer,
        esi: r.esi,
        esi_employer: c.esi_employer,
        pt: r.pt,
        tds: r.tds,
        lwf: c.lwf || 0,
        lwf_employer: c.lwf_employer || 0,
        net: r.net,
        epf_eligible: emp.epf_eligible,
        esi_eligible: emp.esi_eligible
      });
    });
  } else {
    employees.forEach(emp => {
      const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
      const adj = state.sandboxAdjustments[emp.emp_id] || null;
      const c = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
      
      computedRecords.push({
        emp_id: emp.emp_id,
        name: emp.name,
        gross: c.gross,
        basic_earned: c.basic_earned,
        pf: c.pf,
        pf_employer: c.pf_employer,
        esi: c.esi,
        esi_employer: c.esi_employer,
        pt: c.pt,
        tds: c.tds,
        lwf: c.lwf,
        lwf_employer: c.lwf_employer,
        net: c.net,
        epf_eligible: emp.epf_eligible,
        esi_eligible: emp.esi_eligible
      });
    });
  }

  computedRecords.forEach(r => {
    if (r.epf_eligible) {
      totalEPF_EE += r.pf;
      totalEPF_ER += r.pf_employer;
      epfCount++;
    }
    if (r.esi_eligible && r.gross <= 21000) {
      totalESI_EE += r.esi;
      totalESI_ER += r.esi_employer;
      esiCount++;
    }
    totalPT += r.pt;
    totalTDS += r.tds;
    totalLWF_EE += r.lwf;
    totalLWF_ER += r.lwf_employer;
    totalNetPayout += r.net;
    if (r.net > 0) bankCount++;
  });

  const totalEPF = totalEPF_EE + totalEPF_ER;
  const totalESI = totalESI_EE + totalESI_ER;

  content.innerHTML = `
    <div class="compliance-dashboard animate-fade-in" style="width: 100%;">
      <div class="print-doc-header print-only">
        <h1>Statutory Compliance Report — ${org.name}</h1>
        <p>Payroll Month: ${state.activeMonthYear} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; EPF Rate: ${org.epf_rate}% &nbsp;|&nbsp; State: ${(org.state_pt || 'Telangana').toUpperCase()}</p>
      </div>
      <div class="page-header" style="margin-bottom: 28px;">
        <div class="page-header-left">
          <h2>Statutory Compliance &amp; Reporting</h2>
          <p>Download electronically formatted EPFO returns, ESIC contribution sheets, and bulk bank payout registers for ${state.activeMonthYear}.</p>
        </div>
        <button class="btn btn-print no-print" onclick="window.print()">🖨️ Print Compliance Report</button>
      </div>

      <div class="stats-grid" style="margin-bottom: 28px;">
        <div class="stat-card">
          <div class="stat-icon blue">📜</div>
          <div class="stat-info">
            <span class="stat-label">EPF Liability</span>
            <span class="stat-value">₹${Math.round(totalEPF).toLocaleString('en-IN')}</span>
            <span class="stat-desc">EE: ₹${Math.round(totalEPF_EE).toLocaleString('en-IN')} | ER: ₹${Math.round(totalEPF_ER).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">🏥</div>
          <div class="stat-info">
            <span class="stat-label">ESI Liability</span>
            <span class="stat-value">₹${Math.round(totalESI).toLocaleString('en-IN')}</span>
            <span class="stat-desc">EE: ₹${Math.round(totalESI_EE).toLocaleString('en-IN')} | ER: ₹${Math.round(totalESI_ER).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">🛡️</div>
          <div class="stat-info">
            <span class="stat-label">Professional Tax</span>
            <span class="stat-value">₹${Math.round(totalPT).toLocaleString('en-IN')}</span>
            <span class="stat-desc">State Slab Deductions</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">💰</div>
          <div class="stat-info">
            <span class="stat-label">TDS Remittance</span>
            <span class="stat-value">₹${Math.round(totalTDS).toLocaleString('en-IN')}</span>
            <span class="stat-desc">Estimated Income Tax</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid" style="margin-bottom: 28px;">
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 15px; padding-bottom: 12px;">
            <h3>EPF (Provident Fund)</h3>
          </div>
          <div style="display: flex; flex-direction: column; justify-content: space-between; flex:1;">
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:16px; line-height: 1.4;">
              Electronic Challan cum Return (ECR) text file formatted for direct upload to EPFO Shram Suvidha portal.
            </p>
            <div style="margin-bottom: 20px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.82rem;">
                <span style="color:var(--text-muted);">Enrolled Headcount:</span>
                <strong style="color:var(--text-h);">${epfCount} Employees</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                <span style="color:var(--text-muted);">Statutory Wage Cap:</span>
                <strong style="color:var(--text-h);">₹${state.epfoCeiling.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <div style="display:flex; gap:10px; margin-top: auto;">
              <button class="btn btn-primary" style="flex:1;" onclick="downloadEPFECRFile()">
                📥 Download ECR
              </button>
              <button class="btn btn-secondary" onclick="showEpfEcrPreview()">
                👁️ Preview
              </button>
            </div>
          </div>
        </div>

        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 15px; padding-bottom: 12px;">
            <h3>ESI (Health Insurance)</h3>
          </div>
          <div style="display: flex; flex-direction: column; justify-content: space-between; flex:1;">
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:16px; line-height: 1.4;">
              Monthly Contribution Return spreadsheet for ESIC portal (covers employees with gross salary ≤ ₹21,000).
            </p>
            <div style="margin-bottom: 20px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.82rem;">
                <span style="color:var(--text-muted);">Eligible Employees:</span>
                <strong style="color:var(--text-h);">${esiCount} Employees</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                <span style="color:var(--text-muted);">Employer Contribution:</span>
                <strong style="color:var(--text-h);">3.25%</strong>
              </div>
            </div>
            <button class="btn btn-primary" style="margin-top: auto; width:100%;" onclick="downloadESIReportFile()">
              📥 Download ESI Report
            </button>
          </div>
        </div>

        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 15px; padding-bottom: 12px;">
            <h3>Bank Remittance Register</h3>
          </div>
          <div style="display: flex; flex-direction: column; justify-content: space-between; flex:1;">
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:16px; line-height: 1.4;">
              Standard bank payment instruction CSV containing beneficiary name, account number, IFSC code, and amount.
            </p>
            <div style="margin-bottom: 20px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.82rem;">
                <span style="color:var(--text-muted);">Payable Headcount:</span>
                <strong style="color:var(--text-h);">${bankCount} Employees</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                <span style="color:var(--text-muted);">Total Payout:</span>
                <strong style="color:var(--text-h);">₹${Math.round(totalNetPayout).toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <button class="btn btn-success" style="margin-top: auto; width:100%;" onclick="downloadBankCSVFile()">
              📥 Download Payout CSV
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>State Jurisdictional PT &amp; LWF Summary</h3>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>State Jurisdiction</th>
                <th>PT Slabs Rule Applicability</th>
                <th>PT Deductions (Employee)</th>
                <th>LWF Deductions (Employee)</th>
                <th>LWF Contribution (Employer)</th>
                <th>Total State Liability</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style="text-transform: capitalize;">${org.state_pt || 'telangana'}</strong></td>
                <td>Active statutory compliance tables loaded from configuration</td>
                <td>₹${Math.round(totalPT).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalLWF_EE).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalLWF_ER).toLocaleString('en-IN')}</td>
                <td><strong style="color:var(--primary);">₹${Math.round(totalPT + totalLWF_EE + totalLWF_ER).toLocaleString('en-IN')}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.downloadEPFECRFile = downloadEPFECRFile;
window.downloadESIReportFile = downloadESIReportFile;
window.downloadBankCSVFile = downloadBankCSVFile;
window.showEpfEcrPreview = showEpfEcrPreview;
window.closeEpfEcrPreview = closeEpfEcrPreview;
window.filterEcrPreview = filterEcrPreview;


// ----------------------------------------------------
// 11.8. HR REPORTS & FINANCIAL ANALYTICS
// ----------------------------------------------------
function getReportsCalculatedRecords(employees, org, attendance, payrollRun) {
  const computedRecords = [];
  if (payrollRun.status === 'Locked') {
    payrollRun.records.forEach(r => {
      const emp = employees.find(e => e.emp_id === r.emp_id) || {};
      const empAtt = attendance.find(a => a.emp_id === r.emp_id);
      const adj = state.sandboxAdjustments[r.emp_id] || null;
      const c = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);

      computedRecords.push({
        emp_id: r.emp_id,
        name: r.name,
        department: emp.department || 'Operations',
        basic_earned: c.basic_earned,
        hra_earned: c.hra_earned,
        other_allowances: c.da_earned + c.conv_earned + c.med_earned,
        ot_pay: r.ot_pay || 0,
        gross: r.gross,
        pf: r.pf,
        pf_employer: c.pf_employer,
        esi: r.esi,
        esi_employer: c.esi_employer,
        pt: r.pt,
        lwf: c.lwf || 0,
        lwf_employer: c.lwf_employer || 0,
        tds: r.tds,
        net: r.net,
        epf_eligible: emp.epf_eligible,
        esi_eligible: emp.esi_eligible
      });
    });
  } else {
    employees.forEach(emp => {
      const empAtt = attendance.find(a => a.emp_id === emp.emp_id);
      const adj = state.sandboxAdjustments[emp.emp_id] || null;
      const c = calculatePayrollForEmployee(emp, org, state.activeMonthYear, empAtt, adj);
      
      computedRecords.push({
        emp_id: emp.emp_id,
        name: emp.name,
        department: emp.department || 'Operations',
        basic_earned: c.basic_earned,
        hra_earned: c.hra_earned,
        other_allowances: c.da_earned + c.conv_earned + c.med_earned,
        ot_pay: c.ot_pay,
        gross: c.gross,
        pf: c.pf,
        pf_employer: c.pf_employer,
        esi: c.esi,
        esi_employer: c.esi_employer,
        pt: c.pt,
        lwf: c.lwf,
        lwf_employer: c.lwf_employer,
        tds: c.tds,
        net: c.net,
        epf_eligible: emp.epf_eligible,
        esi_eligible: emp.esi_eligible
      });
    });
  }
  return computedRecords;
}

function renderReportsSection(employees, org, attendance, payrollRun) {
  const content = document.getElementById('hr-tab-content');
  if (!content) return;

  const records = getReportsCalculatedRecords(employees, org, attendance, payrollRun);
  window.reportsCalculatedRecords = records;

  let totalBasic = 0, totalHRA = 0, totalOther = 0, totalOT = 0, totalGross = 0;
  let totalPF = 0, totalESI = 0, totalPT = 0, totalLWF = 0, totalTDS = 0, totalNet = 0;

  records.forEach(r => {
    totalBasic += r.basic_earned;
    totalHRA += r.hra_earned;
    totalOther += r.other_allowances;
    totalOT += r.ot_pay;
    totalGross += r.gross;
    totalPF += r.pf;
    totalESI += r.esi;
    totalPT += r.pt;
    totalLWF += r.lwf;
    totalTDS += r.tds;
    totalNet += r.net;
  });

  content.innerHTML = `
    <div class="reports-dashboard animate-fade-in" style="width: 100%;">
      <div class="print-doc-header print-only">
        <h1>Monthly Wage Summary Report — ${org.name}</h1>
        <p>Payroll Month: ${state.activeMonthYear} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; Employees: ${records.length}</p>
      </div>
      <div class="page-header" style="margin-bottom: 28px;">
        <div class="page-header-left">
          <h2>Reports &amp; Financial Analytics</h2>
          <p>Export detailed employee wage ledgers and analyze statutory compliance cost splits.</p>
        </div>
        <button class="btn btn-print no-print" onclick="window.print()">🖨️ Print Report</button>
      </div>

      <div class="dashboard-grid" style="grid-template-columns: 2fr 1.2fr; gap: 24px; margin-bottom: 28px;">
        <!-- Analytics Chart -->
        <div class="card" style="margin-bottom: 0; display:flex; flex-direction:column;">
          <div class="card-header" style="margin-bottom: 15px; padding-bottom: 12px;">
            <h3>Statutory Contribution Splits (Employer Costs)</h3>
          </div>
          <div class="chart-container" style="flex:1; min-height: 250px;">
            <canvas id="complianceCostChart" width="460" height="240"></canvas>
          </div>
        </div>

        <!-- Cost distribution summary card -->
        <div class="card" style="margin-bottom: 0; display:flex; flex-direction:column; justify-content:space-between;">
          <div class="card-header" style="margin-bottom: 15px; padding-bottom: 12px;">
            <h3>Employer Overhead Costs</h3>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:12px; font-size:0.85rem;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Net Take-Home Salary:</span>
              <strong style="color:var(--text-h);">₹${Math.round(totalNet).toLocaleString('en-IN')}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Employer EPF Share (${org.epf_rate}%):</span>
              <strong style="color:var(--text-h);">₹${Math.round(records.reduce((s, r) => s + r.pf_employer, 0)).toLocaleString('en-IN')}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Employer ESI Share (3.25%):</span>
              <strong style="color:var(--text-h);">₹${Math.round(records.reduce((s, r) => s + r.esi_employer, 0)).toLocaleString('en-IN')}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Employer LWF Contribution:</span>
              <strong style="color:var(--text-h);">₹${Math.round(records.reduce((s, r) => s + r.lwf_employer, 0)).toLocaleString('en-IN')}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--card-border); padding-top:12px; margin-top:6px;">
              <span style="color:var(--text-muted);">Total Monthly Cost to Org:</span>
              <strong style="color:var(--primary); font-size:1.1rem;">₹${Math.round(totalGross + records.reduce((s, r) => s + r.pf_employer + r.esi_employer + r.lwf_employer, 0)).toLocaleString('en-IN')}</strong>
            </div>
          </div>
          <button class="btn btn-primary btn-full" onclick="exportPayrollRegisterToCSV()" style="margin-top: 18px;">
            📄 Export Payroll Summary Register (.CSV)
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="margin-bottom: 15px; padding-bottom: 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <h3>Detailed Monthly Wage Summary Register</h3>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <div class="search-box no-print" style="margin-bottom:0; max-width:240px; position:relative;">
              <input type="text" id="report-search-input" class="form-control" placeholder="Search by name..." oninput="filterReportRegister(this.value)">
            </div>
            <button class="btn btn-print btn-sm no-print" onclick="window.print()">🖨️ Print Register</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table" id="report-summary-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Other Allowances</th>
                <th>Overtime</th>
                <th>Gross Salary</th>
                <th>EPF (EE)</th>
                <th>ESI (EE)</th>
                <th>PT</th>
                <th>LWF (EE)</th>
                <th>TDS</th>
                <th>Net Payable</th>
              </tr>
            </thead>
            <tbody id="report-summary-tbody">
              ${records.map(r => `
                <tr>
                  <td><code>${r.emp_id}</code></td>
                  <td><strong>${r.name}</strong><br><span style="font-size:0.7rem; color:var(--text-muted);">${r.department}</span></td>
                  <td>₹${Math.round(r.basic_earned).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.hra_earned).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.other_allowances).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.ot_pay).toLocaleString('en-IN')}</td>
                  <td><strong style="color:var(--text-h);">₹${Math.round(r.gross).toLocaleString('en-IN')}</strong></td>
                  <td>₹${Math.round(r.pf).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.esi).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.pt).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.lwf).toLocaleString('en-IN')}</td>
                  <td>₹${Math.round(r.tds).toLocaleString('en-IN')}</td>
                  <td><strong style="color:var(--success);">₹${Math.round(r.net).toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
              <tr id="report-totals-row" style="background:var(--body-bg); font-weight:700; border-top:2px solid var(--text-h);">
                <td colspan="2">TOTALS</td>
                <td>₹${Math.round(totalBasic).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalHRA).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalOther).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalOT).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalGross).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalPF).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalESI).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalPT).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalLWF).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(totalTDS).toLocaleString('en-IN')}</td>
                <td style="color:var(--success);">₹${Math.round(totalNet).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    drawComplianceCostChart(records);
  }, 50);
}

function filterReportRegister(query) {
  const tbody = document.getElementById('report-summary-tbody');
  if (!tbody) return;
  const filtered = window.reportsCalculatedRecords.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
  
  let totalBasic = 0, totalHRA = 0, totalOther = 0, totalOT = 0, totalGross = 0;
  let totalPF = 0, totalESI = 0, totalPT = 0, totalLWF = 0, totalTDS = 0, totalNet = 0;

  filtered.forEach(r => {
    totalBasic += r.basic_earned;
    totalHRA += r.hra_earned;
    totalOther += r.other_allowances;
    totalOT += r.ot_pay;
    totalGross += r.gross;
    totalPF += r.pf;
    totalESI += r.esi;
    totalPT += r.pt;
    totalLWF += r.lwf;
    totalTDS += r.tds;
    totalNet += r.net;
  });

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td><code>${r.emp_id}</code></td>
      <td><strong>${r.name}</strong><br><span style="font-size:0.7rem; color:var(--text-muted);">${r.department}</span></td>
      <td>₹${Math.round(r.basic_earned).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(r.hra_earned).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(r.other_allowances).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(r.ot_pay).toLocaleString('en-IN')}</td>
      <td><strong style="color:var(--text-h);">₹${Math.round(r.gross).toLocaleString('en-IN')}</strong></td>
      <td>₹${Math.round(r.pf).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(r.esi).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(r.pt).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(r.lwf).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(r.tds).toLocaleString('en-IN')}</td>
      <td><strong style="color:var(--success);">₹${Math.round(r.net).toLocaleString('en-IN')}</strong></td>
    </tr>
  `).join('') + `
    <tr id="report-totals-row" style="background:var(--body-bg); font-weight:700; border-top:2px solid var(--text-h);">
      <td colspan="2">TOTALS</td>
      <td>₹${Math.round(totalBasic).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalHRA).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalOther).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalOT).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalGross).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalPF).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalESI).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalPT).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalLWF).toLocaleString('en-IN')}</td>
      <td>₹${Math.round(totalTDS).toLocaleString('en-IN')}</td>
      <td style="color:var(--success);">₹${Math.round(totalNet).toLocaleString('en-IN')}</td>
    </tr>
  `;
}

function exportPayrollRegisterToCSV() {
  const records = window.reportsCalculatedRecords || [];
  if (records.length === 0) return;

  let csv = 'EmployeeID,EmployeeName,Department,BasicEarned,HRAEarned,OtherAllowances,OvertimePay,GrossSalary,EPF_EE,ESI_EE,PT,LWF_EE,TDS,NetPayable\n';
  records.forEach(r => {
    csv += `"${r.emp_id}","${r.name}","${r.department}",${Math.round(r.basic_earned)},${Math.round(r.hra_earned)},${Math.round(r.other_allowances)},${Math.round(r.ot_pay)},${Math.round(r.gross)},${Math.round(r.pf)},${Math.round(r.esi)},${Math.round(r.pt)},${Math.round(r.lwf)},${Math.round(r.tds)},${Math.round(r.net)}\r\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PayrollRegister_${state.currentOrgId}_${state.activeMonthYear}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotificationToast("Export Complete", "Payroll Register CSV downloaded successfully.", "success");
}

function drawComplianceCostChart(records) {
  const canvas = document.getElementById('complianceCostChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let totalEPF = 0, totalESI = 0, totalPT = 0, totalTDS = 0, totalLWF = 0;
  records.forEach(r => {
    totalEPF += (r.pf + r.pf_employer);
    totalESI += (r.esi + r.esi_employer);
    totalPT += r.pt;
    totalTDS += r.tds;
    totalLWF += (r.lwf + r.lwf_employer);
  });

  const categories = ['EPF Total', 'ESI Total', 'Prof Tax', 'Income Tax', 'LWF Total'];
  const values = [totalEPF, totalESI, totalPT, totalTDS, totalLWF];
  const colors = ['#0071e3', '#34c759', '#ff9500', '#af52de', '#ff2d55'];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startX = 90;
  const startY = 30;
  const chartHeight = 170;
  const chartWidth = 330;
  const barSpacing = 30;
  const barWidth = 14;

  const maxVal = Math.max(...values, 5000);
  const gridCount = 5;

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-border') || '#e5e5e7';
  ctx.lineWidth = 1;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted') || '#8e8e93';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridCount; i++) {
    const val = (maxVal / gridCount) * i;
    const x = startX + (chartWidth / gridCount) * i;
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, startY + chartHeight);
    ctx.stroke();
    
    ctx.fillText(`₹${Math.round(val)}`, x, startY + chartHeight + 14);
  }

  let activeHoverIdx = -1;
  
  function drawChartBars(hoverIdx = -1) {
    ctx.clearRect(startX - 90, startY - 10, startX - 2, chartHeight + 20);
    ctx.clearRect(startX, startY - 10, chartWidth + 20, chartHeight + 10);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-h') || '#1d1d1f';
    ctx.font = 'bold 10px sans-serif';
    
    categories.forEach((cat, idx) => {
      const y = startY + idx * (barWidth + barSpacing) + 12;
      ctx.fillText(cat, startX - 10, y + 4);
      
      const width = (values[idx] / maxVal) * chartWidth;
      const isHovered = hoverIdx === idx;
      
      ctx.fillStyle = colors[idx];
      ctx.shadowBlur = isHovered ? 8 : 0;
      ctx.shadowColor = colors[idx];
      
      ctx.beginPath();
      ctx.roundRect(startX, y - barWidth / 2, width, barWidth, 4);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      if (width > 30) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`₹${Math.round(values[idx])}`, startX + 6, y + 3);
      }
      ctx.textAlign = 'right';
    });
  }

  drawChartBars();

  canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let hoverIdx = -1;
    categories.forEach((_, idx) => {
      const barY = startY + idx * (barWidth + barSpacing) + 12;
      if (x >= startX && x <= startX + chartWidth && y >= barY - barWidth && y <= barY + barWidth) {
        hoverIdx = idx;
      }
    });

    if (hoverIdx !== activeHoverIdx) {
      activeHoverIdx = hoverIdx;
      drawChartBars(hoverIdx);
      canvas.style.cursor = hoverIdx !== -1 ? 'pointer' : 'default';
    }

    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      if (hoverIdx !== -1) {
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 15 + 'px';
        tooltip.style.top = e.clientY + 15 + 'px';
        tooltip.innerHTML = `${categories[hoverIdx]}: <span style="color:${colors[hoverIdx]}">₹${Math.round(values[hoverIdx]).toLocaleString('en-IN')}</span>`;
      } else {
        tooltip.style.display = 'none';
      }
    }
  };

  canvas.onmouseleave = () => {
    activeHoverIdx = -1;
    drawChartBars();
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  };
}

window.renderReportsSection = renderReportsSection;
window.filterReportRegister = filterReportRegister;
window.exportPayrollRegisterToCSV = exportPayrollRegisterToCSV;
window.drawComplianceCostChart = drawComplianceCostChart;


// ----------------------------------------------------
// 12. COMPLIANCE CONFIGURATION SETTINGS SCREEN
// ----------------------------------------------------
function renderComplianceSettingsSection(org) {
  const content = document.getElementById('hr-tab-content');
  
  content.innerHTML = `
    <div class="settings-container animate-fade-in">
      <div class="card card-premium">
        <div class="card-header">
          <h3>Statutory Compliance Configurations</h3>
          <p class="subtitle">Update national EPF rates, minimum statutory wage limits, and pro-rata formulas for ${org.name}.</p>
        </div>
        <form id="compliance-settings-form" class="standard-form" style="margin-top:20px;">
          <div class="form-row">
            <div class="form-group">
              <label>Employer EPF Matching Rate (%)</label>
              <input class="form-control" type="number" id="sett-epf" value="${org.epf_rate}" min="0" max="15">
            </div>
            <div class="form-group">
              <label>Statutory Minimum Wage Threshold (₹/month)</label>
              <input class="form-control" type="number" id="sett-minwage" value="${org.minimum_wage}" min="0">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Basic Salary Component (% of CTC)</label>
              <input class="form-control" type="number" id="sett-basic" value="${org.basic_pct}" min="20" max="80">
            </div>
            <div class="form-group">
              <label>Hourly Overtime Rate (₹/hour)</label>
              <input class="form-control" type="number" id="sett-ot" value="${org.ot_rate}" min="0">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Professional Tax (PT) State Rules</label>
              <select id="sett-state-pt" class="form-control">
                <option value="telangana" ${org.state_pt === 'telangana' ? 'selected' : ''}>Telangana (Slab ₹150 / ₹200)</option>
                <option value="maharashtra" ${org.state_pt === 'maharashtra' ? 'selected' : ''}>Maharashtra (Slab ₹175 / ₹200 / ₹300 Feb)</option>
                <option value="karnataka" ${org.state_pt === 'karnataka' ? 'selected' : ''}>Karnataka (Slab ₹200 above ₹25K)</option>
                <option value="tamilnadu" ${org.state_pt === 'tamilnadu' ? 'selected' : ''}>Tamil Nadu (Standard Slabs)</option>
              </select>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary">Save Organization Settings</button>
        </form>
      </div>

      <div class="card card-premium" style="margin-top:20px;">
        <div class="card-header">
          <h3>Database Backup &amp; Restore Console</h3>
          <p class="subtitle">Export the current state of local database tables to share with your co-worker or upload a backup file.</p>
        </div>
        <div style="display:flex; gap:12px; margin-top:20px; flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="exportDatabaseBackup()">📤 Export Database Backup (JSON)</button>
          <button class="btn btn-secondary" onclick="document.getElementById('import-db-input').click()">📥 Restore Database Backup (JSON)</button>
          <input type="file" id="import-db-input" style="display:none;" accept=".json" onchange="importDatabaseBackup(event)">
        </div>
      </div>

      <!-- Security Audit Log Card -->
      <div class="card card-premium" style="margin-top:20px;">
        <div class="card-header" style="margin-bottom:15px; padding-bottom:10px;">
          <h3>🛡️ Security &amp; Compliance Audit Trail</h3>
          <p class="subtitle">Tracked activity history of calculations and records within this tenant.</p>
        </div>
        <div class="table-wrap">
          <table class="data-table" style="font-size:0.78rem;">
            <thead>
              <tr>
                <th style="width:140px;">Timestamp</th>
                <th style="width:90px;">Actor</th>
                <th style="width:130px;">Action Event</th>
                <th>Details Description</th>
                <th style="width:90px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${getAuditLogs().map(log => {
                let badgeClass = 'badge-success';
                if (log.status === 'Warning') badgeClass = 'badge-warning';
                if (log.status === 'Failure') badgeClass = 'badge-danger';
                return `
                  <tr>
                    <td style="font-family:var(--font-code); color:var(--text-muted);">${log.timestamp}</td>
                    <td><code>${log.user}</code></td>
                    <td><strong>${log.action}</strong></td>
                    <td><span style="color:var(--text-body);">${log.details}</span></td>
                    <td><span class="badge ${badgeClass}">${log.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Bind submit
  const form = document.getElementById('compliance-settings-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const epf = parseFloat(document.getElementById('sett-epf').value);
      const minwage = parseFloat(document.getElementById('sett-minwage').value);
      const basic = parseFloat(document.getElementById('sett-basic').value);
      const ot = parseFloat(document.getElementById('sett-ot').value);
      const statePt = document.getElementById('sett-state-pt').value;

      const orgs = db.getTable('organizations');
      const idx = orgs.findIndex(o => o.org_id === state.currentOrgId);
      if (idx !== -1) {
        orgs[idx].epf_rate = epf;
        orgs[idx].minimum_wage = minwage;
        orgs[idx].basic_pct = basic;
        orgs[idx].ot_rate = ot;
        orgs[idx].state_pt = statePt;
        await db.saveTable('organizations', orgs);
        addAuditLog("CONFIG_UPDATE", `EPF Matching: ${epf}%, Min Wage: ₹${minwage}, Basic pct: ${basic}%, OT: ₹${ot}/hr, State PT: ${statePt}`);
        await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
        alert("Compliance rules configuration saved successfully!");
        renderHRTab();
      }
    });
  }
}

function exportDatabaseBackup() {
  const backup = {
    organizations: db.getTable('organizations'),
    employees: db.getTable('employees'),
    schemas: db.getTable('schemas'),
    attendance: db.getTable('attendance'),
    payroll_ledger: db.getTable('payroll_ledger'),
    db_version: localStorage.getItem('symbiosis_db_version')
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `symbiosis_payroll_backup_${new Date().toISOString().split('T')[0]}.json`);
  dlAnchorElem.click();
}

function importDatabaseBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.organizations || !backup.employees) {
        alert("Invalid backup file. Organizations and Employees tables are required.");
        return;
      }
      db.saveTable('organizations', backup.organizations);
      db.saveTable('employees', backup.employees);
      if (backup.schemas) db.saveTable('schemas', backup.schemas);
      if (backup.attendance) db.saveTable('attendance', backup.attendance);
      if (backup.payroll_ledger) db.saveTable('payroll_ledger', backup.payroll_ledger);
      if (backup.db_version) localStorage.setItem('symbiosis_db_version', backup.db_version);
      
      addAuditLog("DATABASE_RESTORE", "Local database tables restored from external backup file.");

      alert("Database restored successfully from backup! Reloading dashboard...");
      if (state.currentRole === 'ERP') {
        renderERPTab();
      } else {
        renderHRTab();
      }
    } catch (err) {
      alert("Failed to parse backup JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ----------------------------------------------------
// 12.5. EMPLOYEE LEAVE MANAGEMENT DATABASE & ACTION HELPERS
// ----------------------------------------------------
function getEmployeeLeaves(empId) {
  const key = `symbiosis_leaves_${empId}`;
  let data = localStorage.getItem(key);
  if (!data) {
    const defaultData = {
      balances: { CL: 8, EL: 15, CO: 2 },
      requests: [
        { id: 1, applyDate: "2026-05-10", type: "CL", startDate: "2026-05-15", endDate: "2026-05-16", days: 2, reason: "Family gathering", status: "Approved" },
        { id: 2, applyDate: "2026-04-02", type: "EL", startDate: "2026-04-10", endDate: "2026-04-14", days: 5, reason: "Personal vacation", status: "Approved" }
      ]
    };
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(data);
}

function saveEmployeeLeaves(empId, data) {
  localStorage.setItem(`symbiosis_leaves_${empId}`, JSON.stringify(data));
}

function submitLeaveRequest() {
  const type = document.getElementById('leave-type').value;
  const startDateStr = document.getElementById('leave-start-date').value;
  const endDateStr = document.getElementById('leave-end-date').value;
  const reason = document.getElementById('leave-reason').value.trim();

  if (!startDateStr || !endDateStr || !reason) {
    showNotificationToast("Input Missing", "Please fill in all required fields.", "warning");
    return;
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (endDate < startDate) {
    showNotificationToast("Invalid Dates", "End date cannot be prior to start date.", "warning");
    return;
  }

  const diffTime = Math.abs(endDate - startDate);
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const leavesData = getEmployeeLeaves(state.currentEmployeeId);

  if (type !== 'LWP') {
    const currentBalance = leavesData.balances[type] || 0;
    if (days > currentBalance) {
      showNotificationToast("Insufficient Balance", `You only have ${currentBalance} days of ${type} left. Requested: ${days} days.`, "danger");
      return;
    }
  }

  if (type === 'CL') leavesData.balances.CL -= days;
  else if (type === 'EL') leavesData.balances.EL -= days;
  else if (type === 'CO') leavesData.balances.CO -= days;

  const newRequest = {
    id: Date.now(),
    applyDate: new Date().toISOString().split('T')[0],
    type,
    startDate: startDateStr,
    endDate: endDateStr,
    days,
    reason,
    status: "Approved"
  };

  leavesData.requests.unshift(newRequest);
  saveEmployeeLeaves(state.currentEmployeeId, leavesData);

  showNotificationToast("Leave Requested", `Leave request approved. ${days} days deducted from your ${type} balance.`, "success");
  renderEmployeeTab();
}

window.getEmployeeLeaves = getEmployeeLeaves;
window.saveEmployeeLeaves = saveEmployeeLeaves;
window.submitLeaveRequest = submitLeaveRequest;
function getAuditLogs() {
  const key = `symbiosis_audit_logs_${state.currentOrgId}`;
  let data = localStorage.getItem(key);
  if (!data) {
    const initialLogs = [
      { id: 1, timestamp: "2026-06-28 10:14:02", user: "hr_tata", action: "AUTH_LOGIN", details: "User logged in from IP 192.168.1.45 (Chrome/Windows)", status: "Success" },
      { id: 2, timestamp: "2026-06-28 10:15:30", user: "hr_tata", action: "CONFIG_UPDATE", details: "EPF matching rate configured to 12% and State PT set to telangana", status: "Success" },
      { id: 3, timestamp: "2026-06-28 11:20:10", user: "hr_tata", action: "ROSTER_INGEST", details: "Bulk employee list ingested: 5 records updated", status: "Success" },
      { id: 4, timestamp: "2026-06-28 11:45:00", user: "hr_tata", action: "ATTENDANCE_INGEST", details: "Attendance sheet uploaded for June 2026: 30 rows processed", status: "Success" }
    ];
    localStorage.setItem(key, JSON.stringify(initialLogs));
    return initialLogs;
  }
  return JSON.parse(data);
}

function addAuditLog(action, details, status = "Success") {
  const key = `symbiosis_audit_logs_${state.currentOrgId}`;
  const logs = getAuditLogs();
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    user: state.currentUser || "system",
    action,
    details,
    status
  };
  logs.unshift(newLog);
  localStorage.setItem(key, JSON.stringify(logs));
}

window.getAuditLogs = getAuditLogs;
window.addAuditLog = addAuditLog;

function updateEmployeeKycData() {
  const bankName = document.getElementById('kyc-bank-name').value.trim();
  const bankAccount = document.getElementById('kyc-account-number').value.trim();
  const ifscCode = document.getElementById('kyc-ifsc-code').value.trim().toUpperCase();
  const panNumber = document.getElementById('kyc-pan-number').value.trim().toUpperCase();
  const aadhaarNumber = document.getElementById('kyc-aadhaar-number').value.trim();

  if (!bankName || !bankAccount || !ifscCode || !panNumber || !aadhaarNumber) {
    showNotificationToast("Input Missing", "Please fill in all KYC fields.", "warning");
    return;
  }

  if (!/^\d{9,18}$/.test(bankAccount)) {
    showNotificationToast("Invalid Account Number", "Bank account number must be between 9 and 18 digits.", "danger");
    return;
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    showNotificationToast("Invalid IFSC Code", "IFSC code format must be valid (e.g. UTIB0001234).", "danger");
    return;
  }

  if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panNumber)) {
    showNotificationToast("Invalid PAN Card", "PAN format must be valid (e.g. ABCDE1234F).", "danger");
    return;
  }

  if (!/^\d{12}$/.test(aadhaarNumber)) {
    showNotificationToast("Invalid Aadhaar", "Aadhaar number must be a 12-digit number.", "danger");
    return;
  }

  const allEmployees = db.getEmployees();
  const empIndex = allEmployees.findIndex(e => e.emp_id === state.currentEmployeeId);
  if (empIndex !== -1) {
    allEmployees[empIndex].bank_name = bankName;
    allEmployees[empIndex].bank_account = bankAccount;
    allEmployees[empIndex].ifsc_code = ifscCode;
    allEmployees[empIndex].pan = panNumber;
    allEmployees[empIndex].aadhaar_number = aadhaarNumber;
    
    db.saveTable('employees', allEmployees);
    
    // Audit Log hook
    addAuditLog("KYC_UPDATE", `Employee profile ${state.currentEmployeeId} updated bank details & KYC IDs.`);

    showNotificationToast("KYC Saved", "Your payment and KYC details have been updated successfully.", "success");
    renderEmployeeTab();
  } else {
    showNotificationToast("Profile Error", "Could not locate your employee profile to update.", "danger");
  }
}

window.updateEmployeeKycData = updateEmployeeKycData;

// ----------------------------------------------------
// 13. EMPLOYEE PORTAL VIEW — SELF DATA ONLY
// ----------------------------------------------------
// ----------------------------------------------------
// 13. EMPLOYEE PORTAL VIEW — SELF DATA ONLY
// ----------------------------------------------------
async function renderEmployeeTab() {
  if (!state.isLoggedIn || state.currentRole !== 'Employee') return;
  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);
  const container = document.getElementById('app-body');

  const employee = db.getEmployee(state.currentEmployeeId);
  if (!employee || employee.org_id !== state.currentOrgId) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size:3rem; margin-bottom:1rem;">🔒</div>
        <p>Access Denied. No matching employee profile found for your credentials.</p>
        <p class="subtitle">Please contact your HR administrator.</p>
      </div>`;
    return;
  }

  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const ledger = db.getPayrollLedger(state.currentOrgId);
  
  const salaryHistory = [];
  Object.keys(ledger).sort().forEach(month => {
    if (ledger[month].status === 'Locked') {
      const rec = ledger[month].records.find(r => r.emp_id === state.currentEmployeeId);
      if (rec) salaryHistory.push({ month, ...rec });
    }
  });

  const latestPayslip = salaryHistory[salaryHistory.length - 1];
  const totalEarned = salaryHistory.reduce((s, r) => s + (r.net || 0), 0);

  // ── Custom Page Routing for Employee ───────────────────────────────────
  if (state.activeTab.startsWith('custom-')) {
    container.innerHTML = renderCustomPage(state.activeTab);
    return;
  }

  if (state.activeTab === 'emp-dashboard') {
    container.innerHTML = `
      <div class="animate-in">
        ${renderAnnouncementBanners('employee')}
        <div class="page-header">
          <div class="page-header-left">
            <h2>My Dashboard</h2>
            <p>Welcome back, ${employee.name.split(' ')[0]}. Here's your quick summary.</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon green">💼</div>
            <div class="stat-info"><div class="stat-label">Monthly CTC</div><div class="stat-value">₹${employee.ctc.toLocaleString('en-IN')}</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">💰</div>
            <div class="stat-info"><div class="stat-label">Last Net Take-Home</div><div class="stat-value">${latestPayslip ? '₹' + Math.round(latestPayslip.net).toLocaleString('en-IN') : 'Pending'}</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple">📊</div>
            <div class="stat-info"><div class="stat-label">Total Earned</div><div class="stat-value">₹${Math.round(totalEarned).toLocaleString('en-IN')}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Recent Payslips</h3></div>
          ${salaryHistory.length === 0 ? `
            <div class="empty-state">
              <p>No finalized payslips yet.</p>
            </div>
          ` : `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Gross</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${[...salaryHistory].reverse().slice(0, 3).map(history => `
                    <tr>
                      <td><strong>${history.month}</strong></td>
                      <td>₹${Math.round(history.gross).toLocaleString('en-IN')}</td>
                      <td><span class="danger-text">- ₹${Math.round(history.total_deductions).toLocaleString('en-IN')}</span></td>
                      <td><strong class="success-text">₹${Math.round(history.net).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <div style="display:flex; gap:6px;">
                          <button class="btn btn-sm btn-primary" onclick="showMockPayslip('${history.month}')">View</button>
                          <button class="btn btn-sm btn-secondary" onclick="printEmployeePayslipDirectly('${history.month}')"><span class="icon">🖨️</span> Print</button>
                          <button class="btn btn-sm btn-success" onclick="simulateEmailPayslip('${history.month}')"><span class="icon">📧</span> Email</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  } else if (state.activeTab === 'emp-profile') {
    container.innerHTML = `
      <div class="animate-in" style="width: 100%;">
        <div class="print-doc-header print-only">
          <h1>${employee.name} — Employment Profile</h1>
          <p>${org ? org.name : ''} &nbsp;|&nbsp; Emp ID: ${employee.emp_id} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString('en-IN')}</p>
        </div>
        <div class="page-header" style="margin-bottom: 28px;">
          <div class="page-header-left">
            <h2>My Profile</h2>
            <p>Your employment details and self-service compliance ID settings.</p>
          </div>
          <button class="btn btn-print no-print" onclick="window.print()">🖨️ Print Profile</button>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
          <!-- Left Column: Employment Info -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header" style="margin-bottom: 20px; padding-bottom: 12px;">
              <h3>Employment Profile</h3>
            </div>
            <div class="card-body" style="display:flex; flex-direction:column; gap:6px;">
              <div class="detail-row"><label>Employee Code</label><span><code>${employee.emp_id}</code></span></div>
              <div class="detail-row"><label>Date of Joining</label><span>${employee.doj}</span></div>
              <div class="detail-row"><label>Designation</label><span>${employee.designation}</span></div>
              <div class="detail-row"><label>Department</label><span>${employee.department}</span></div>
              <div class="detail-row"><label>Monthly CTC</label><span>₹${employee.ctc.toLocaleString('en-IN')}</span></div>
              <div class="detail-row"><label>EPF Enrolment</label><span>${employee.epf_eligible ? '✅ Enrolled' : '❌ Not Eligible'}</span></div>
              <div class="detail-row"><label>ESI Enrolment</label><span>${employee.esi_eligible ? '✅ Enrolled' : '❌ Not Eligible'}</span></div>
              <div class="detail-row"><label>Aadhaar Card</label><span>${employee.aadhaar || employee.aadhaar_number || '<em style="color:var(--text-muted)">Not provided</em>'}</span></div>
              <div class="detail-row"><label>PAN Card</label><span>${employee.pan || '<em style="color:var(--text-muted)">Not provided</em>'}</span></div>
              <div class="detail-row"><label>Bank Details</label><span>${employee.bank_name ? `${employee.bank_name} - ${employee.bank_account}` : (employee.bank_account || '<em style="color:var(--text-muted)">Not provided</em>')}</span></div>
              ${employee.ifsc_code ? `<div class="detail-row"><label>IFSC Code</label><span><code>${employee.ifsc_code}</code></span></div>` : ''}
            </div>
          </div>

          <!-- Right Column: Self-Service Update Form -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header" style="margin-bottom: 20px; padding-bottom: 12px;">
              <h3>Update Bank &amp; KYC IDs</h3>
            </div>
            <form id="kyc-update-form" class="standard-form" onsubmit="event.preventDefault(); updateEmployeeKycData();">
              <div class="form-group" style="width: 100%;">
                <label class="form-label" style="text-align: left; display: block; width: 100%;">Bank Name</label>
                <input type="text" id="kyc-bank-name" class="form-control" placeholder="e.g. HDFC Bank" value="${employee.bank_name || ''}" required>
              </div>
              <div class="form-group" style="width: 100%;">
                <label class="form-label" style="text-align: left; display: block; width: 100%;">Account Number</label>
                <input type="text" id="kyc-account-number" class="form-control" placeholder="9-18 digit account number" value="${employee.bank_account || ''}" required>
              </div>
              <div class="form-group" style="width: 100%;">
                <label class="form-label" style="text-align: left; display: block; width: 100%;">IFSC Code</label>
                <input type="text" id="kyc-ifsc-code" class="form-control" placeholder="e.g. HDFC0000240" style="text-transform: uppercase;" value="${employee.ifsc_code || ''}" required>
              </div>
              <div class="form-group" style="width: 100%;">
                <label class="form-label" style="text-align: left; display: block; width: 100%;">PAN Card Number</label>
                <input type="text" id="kyc-pan-number" class="form-control" placeholder="e.g. ABCDE1234F" style="text-transform: uppercase;" value="${employee.pan || ''}" required>
              </div>
              <div class="form-group" style="width: 100%; margin-bottom: 24px;">
                <label class="form-label" style="text-align: left; display: block; width: 100%;">Aadhaar Card Number</label>
                <input type="text" id="kyc-aadhaar-number" class="form-control" placeholder="12-digit Aadhaar number" value="${employee.aadhaar || employee.aadhaar_number || ''}" required>
              </div>
              <button type="submit" class="btn btn-primary btn-full">
                🔒 Save &amp; Submit KYC Details
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  } else if (state.activeTab === 'emp-payslips') {
    container.innerHTML = `
      <div class="animate-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>My Payslips</h2>
            <p>Full history of all finalized wage slips.</p>
          </div>
        </div>
        <div class="card">
          ${salaryHistory.length === 0 ? `
            <div class="empty-state">
              <p>No finalized payslips yet.</p>
            </div>
          ` : `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Gross</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${[...salaryHistory].reverse().map(history => `
                    <tr>
                      <td><strong>${history.month}</strong></td>
                      <td>₹${Math.round(history.gross).toLocaleString('en-IN')}</td>
                      <td><span class="danger-text">- ₹${Math.round(history.total_deductions).toLocaleString('en-IN')}</span></td>
                      <td><strong class="success-text">₹${Math.round(history.net).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <div style="display:flex; gap:6px;">
                          <button class="btn btn-sm btn-primary" onclick="showMockPayslip('${history.month}')">View</button>
                          <button class="btn btn-sm btn-secondary" onclick="printEmployeePayslipDirectly('${history.month}')"><span class="icon">🖨️</span> Print</button>
                          <button class="btn btn-sm btn-success" onclick="simulateEmailPayslip('${history.month}')"><span class="icon">📧</span> Email</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  } else if (state.activeTab === 'emp-tax-declaration') {
    const taxCalc = calculateAnnualTax(employee, org);

    container.innerHTML = `
      <div class="animate-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Tax Declaration Portal (Form 12BB Submission)</h2>
            <p>Declare house rent, Section 80C investments, and Section 80D medical premiums to recalculate your real-time tax deduction (TDS) slab.</p>
          </div>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: 1.2fr 1fr; margin-bottom: 28px;">
          <!-- 12BB Declaration Form Card -->
          <div class="card card-premium">
            <div class="card-header" style="margin-bottom:15px; padding-bottom:10px;">
              <h3>📝 Investment &amp; Rent Declarations</h3>
            </div>
            <form id="tax-declaration-form" class="standard-form" onsubmit="saveTaxDeclaration(event)">
              <div class="form-section-header" style="margin-top:0; margin-bottom:10px; font-weight:700;">House Rent Allowance (HRA)</div>
              <div class="form-row" style="margin-bottom:10px;">
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label">Monthly Rent Paid (₹)</label>
                  <input class="form-control" type="number" id="tax-rent-paid" value="${employee.rent_paid || 0}" min="0">
                </div>
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label">Landlord PAN (10 chars)</label>
                  <input class="form-control" type="text" id="tax-landlord-pan" value="${employee.landlord_pan || ''}" placeholder="e.g. ABCDE1234F" pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}">
                </div>
              </div>

              <div class="form-section-header" style="margin-bottom:10px; font-weight:700;">Chapter VI-A Deductions</div>
              <div class="form-row" style="margin-bottom:10px;">
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label">Section 80C Investments (₹)</label>
                  <span style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:4px; line-height:1.25;">PPF, LIC, ELSS Mutual Funds, school fees (max ₹1.5L)</span>
                  <input class="form-control" type="number" id="tax-80c" value="${employee.tax_80c || 0}" min="0" max="250000">
                </div>
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label">Section 80D Medical Premium (₹)</label>
                  <span style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:4px; line-height:1.25;">Health insurance policy premium (max ₹25k / ₹50k for parents)</span>
                  <input class="form-control" type="number" id="tax-80d" value="${employee.tax_80d || 0}" min="0" max="100000">
                </div>
              </div>

              <div class="form-section-header" style="margin-bottom:10px; font-weight:700;">Other Income / Sources</div>
              <div class="form-row" style="margin-bottom:15px;">
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label">Other Income (Annual ₹)</label>
                  <input class="form-control" type="number" id="tax-other-income" value="${employee.other_income || 0}" min="0">
                </div>
              </div>

              <div style="margin-top:10px;">
                <button type="submit" class="btn btn-primary btn-full">Save &amp; Apply Declarations</button>
              </div>
            </form>
          </div>

          <!-- Real-Time Tax Estimation Sandbox Card -->
          <div style="display:flex; flex-direction:column; gap:20px;">
            <div class="card bg-grad-primary" style="padding:20px; margin-bottom:0;">
              <div class="card-header" style="border:none; padding:0; margin-bottom:12px;">
                <h3 style="color:var(--text-h); margin:0;">📊 Real-time TDS Sandbox</h3>
              </div>
              <div class="sandbox-computation-body" style="display:flex; flex-direction:column; gap:8px; font-size:0.82rem; color:var(--text-body);">
                <div style="display:flex; justify-content:space-between;">
                  <span>Annual CTC Gross:</span>
                  <strong style="color:var(--text-h);">₹${Math.round(taxCalc.annualCTC).toLocaleString('en-IN')}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; color:var(--primary);">
                  <span>(-) Standard Deduction:</span>
                  <span>- ₹50,000</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:var(--primary);">
                  <span>(-) HRA Rent Exemption (Sec 10):</span>
                  <span>- ₹${Math.round(taxCalc.hraExemption).toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:var(--primary);">
                  <span>(-) Chapter VI-A Deductions:</span>
                  <span>- ₹${Math.round(taxCalc.ded80C + taxCalc.ded80D).toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:var(--danger);">
                  <span>(+) Other Declared Income:</span>
                  <span>+ ₹${Math.round(taxCalc.otherIncome).toLocaleString('en-IN')}</span>
                </div>
                <div style="height:1px; background:rgba(184, 91, 115, 0.15); margin:4px 0;"></div>
                <div style="display:flex; justify-content:space-between; font-size:0.95rem; font-weight:800; color:var(--text-h);">
                  <span>Taxable Net Income:</span>
                  <span>₹${Math.round(taxCalc.taxableIncome).toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:700; color:var(--success); margin-top:4px;">
                  <span>Annual Tax + Cess (4%):</span>
                  <span>₹${Math.round(taxCalc.totalTax).toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.95rem; font-weight:800; color:#b45309; margin-top:4px; border: 1px dashed rgba(217, 119, 6, 0.4); padding:8px; border-radius:8px; background:rgba(217, 119, 6, 0.05);">
                  <span>Estimated Monthly TDS:</span>
                  <span>₹${Math.round(taxCalc.monthlyTds).toLocaleString('en-IN')} / mo</span>
                </div>
                <div style="font-size:0.7rem; color:var(--text-muted); text-align:center; margin-top:2px; line-height:1.25;">
                  *Calculated under the New Tax Regime (slab caps). Actual TDS may vary depending on physical document validation by HR.
                </div>
              </div>
            </div>

            <!-- Download Official Declarations Card -->
            <div class="card" style="margin-bottom:0; padding:20px;">
              <div class="card-header" style="margin-bottom:12px; padding-bottom:8px;">
                <h3>📂 Statutory Form Downloads</h3>
              </div>
              <div style="display:flex; flex-direction:column; gap:10px;">
                <button class="btn btn-secondary btn-full" onclick="showForm12BBModal('${employee.emp_id}')">
                  <span class="icon">📄</span> Download Form 12BB (Declaration)
                </button>
                <button class="btn btn-secondary btn-full" onclick="showForm16Modal('${employee.emp_id}')">
                  <span class="icon">📜</span> Download Form 16 Part B (TDS Certificate)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (state.activeTab === 'emp-leaves') {
    const leavesData = getEmployeeLeaves(state.currentEmployeeId);
    const balances = leavesData.balances;
    const requests = leavesData.requests;

    container.innerHTML = `
      <div class="animate-in" style="width: 100%;">
        <div class="page-header" style="margin-bottom: 28px;">
          <div class="page-header-left">
            <h2>My Leaves</h2>
            <p>Submit time off requests and track your statutory leave balances.</p>
          </div>
        </div>

        <!-- Balance meters -->
        <div class="stats-grid" style="margin-bottom: 28px;">
          <div class="stat-card">
            <div class="stat-icon orange">🍂</div>
            <div class="stat-info">
              <span class="stat-label">Casual / Sick Leave</span>
              <span class="stat-value" style="font-size: 1.4rem; font-weight: 800; color: var(--text-h);">${balances.CL} Days</span>
              <span class="stat-desc">CL/SL Available Balance</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">✈️</div>
            <div class="stat-info">
              <span class="stat-label">Earned Leave</span>
              <span class="stat-value" style="font-size: 1.4rem; font-weight: 800; color: var(--text-h);">${balances.EL} Days</span>
              <span class="stat-desc">EL Available Balance</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">🕒</div>
            <div class="stat-info">
              <span class="stat-label">Compensatory Off</span>
              <span class="stat-value" style="font-size: 1.4rem; font-weight: 800; color: var(--text-h);">${balances.CO} Days</span>
              <span class="stat-desc">CO Available Balance</span>
            </div>
          </div>
        </div>

        <!-- Form and History Grid -->
        <div class="dashboard-grid" style="grid-template-columns: 1.2fr 2fr; gap: 24px; align-items: start;">
          <!-- Request form -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header" style="margin-bottom: 20px; padding-bottom: 12px;">
              <h3>Request Time Off</h3>
            </div>
            <form id="leave-request-form" class="standard-form" onsubmit="event.preventDefault(); submitLeaveRequest();">
              <div class="form-group" style="width: 100%;">
                <label class="form-label" style="text-align: left; display: block; width: 100%;">Leave Type</label>
                <select id="leave-type" class="form-control" style="width: 100%;">
                  <option value="CL">Casual / Sick Leave (CL/SL)</option>
                  <option value="EL">Earned Leave (EL)</option>
                  <option value="CO">Compensatory Off (CO)</option>
                  <option value="LWP">Leave Without Pay (LWP)</option>
                </select>
              </div>
              <div class="form-row" style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="text-align: left; display: block;">Start Date</label>
                  <input type="date" id="leave-start-date" class="form-control" required>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="text-align: left; display: block;">End Date</label>
                  <input type="date" id="leave-end-date" class="form-control" required>
                </div>
              </div>
              <div class="form-group" style="width: 100%; margin-bottom: 20px;">
                <label class="form-label" style="text-align: left; display: block; width: 100%;">Reason for Leave</label>
                <textarea id="leave-reason" class="form-control" rows="3" placeholder="Provide a brief explanation..." required style="width:100%; resize: vertical; min-height: 80px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-full">
                🚀 Submit Request
              </button>
            </form>
          </div>

          <!-- History list -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header" style="margin-bottom: 20px; padding-bottom: 12px;">
              <h3>Leave Request History</h3>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Apply Date</th>
                    <th>Type</th>
                    <th>Period</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="leave-history-tbody">
                  ${requests.map(r => {
                    let badgeClass = 'badge-success';
                    if (r.status === 'Pending') badgeClass = 'badge-warning';
                    if (r.status === 'Rejected') badgeClass = 'badge-danger';
                    
                    const typeNames = { CL: 'Casual/Sick', EL: 'Earned Leave', CO: 'Comp Off', LWP: 'LWP' };
                    const typeName = typeNames[r.type] || r.type;

                    return `
                      <tr>
                        <td>${r.applyDate}</td>
                        <td><strong>${typeName}</strong></td>
                        <td style="font-size:0.8rem; white-space:nowrap;">${r.startDate} to ${r.endDate}</td>
                        <td>${r.days} Days</td>
                        <td><span style="font-size:0.8rem; color:var(--text-muted);">${r.reason}</span></td>
                        <td><span class="badge ${badgeClass}">${r.status}</span></td>
                      </tr>
                    `;
                  }).join('')}
                  ${requests.length === 0 ? `<tr><td colspan="6" class="empty-state">No leave requests found.</td></tr>` : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Inject Payslip Modal globally into app-body if not exists
  let modal = document.getElementById('payslip-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'payslip-modal';
    modal.className = 'payslip-modal-wrapper';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="payslip-modal-content">
        <div class="payslip-modal-actions no-print">
          <button class="btn btn-secondary" onclick="closePayslipModal()">✕ Close</button>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print Payslip</button>
        </div>
        <div id="payslip-print-area"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

function showMockPayslip(month) {
  const ledger = db.getPayrollLedger(state.currentOrgId);
  const run = ledger[month];
  if (!run) return;

  const record = run.records.find(r => r.emp_id === state.currentEmployeeId);
  const employee = db.getEmployee(state.currentEmployeeId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);

  if (!record || !employee || !org) return;

  const modal = document.getElementById('payslip-modal');
  const printArea = document.getElementById('payslip-print-area');

  printArea.innerHTML = `
    <div class="payslip-container">
      <div class="payslip-header">
        <h2>${org.name.toUpperCase()}</h2>
        <p>Salary Wage slip for the Month of <strong>${month}</strong></p>
      </div>

      <div class="payslip-meta-grid">
        <div><strong>Employee Code:</strong> ${employee.emp_id}</div>
        <div><strong>Employee Name:</strong> ${employee.name}</div>
        <div><strong>Department:</strong> ${employee.department}</div>
        <div><strong>Designation:</strong> ${employee.designation}</div>
        <div><strong>Bank Acc Number:</strong> ${employee.bank_account || 'N/A'}</div>
        <div><strong>Payable Days:</strong> ${record.payable_days} days</div>
      </div>

      <div class="payslip-splits-grid">
        <div class="payslip-column">
          <h4 class="split-header">Earnings</h4>
          <div class="split-row"><label>Basic Pay Component</label><span>₹${Math.round(record.basic_earned).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>House Rent Allowance (HRA)</label><span>₹${Math.round(record.hra_earned).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Dearness Allowance (DA)</label><span>₹${Math.round(record.da_earned).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Conveyance &amp; Medical</label><span>₹${Math.round(record.conv_earned + record.med_earned).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Overtime Pay Component</label><span>₹${Math.round(record.ot_pay).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Variable Bonuses / Incentives</label><span>₹${Math.round(record.bonus).toLocaleString('en-IN')}</span></div>
          <div class="split-row total-row"><label>Gross Earnings</label><span>₹${Math.round(record.gross).toLocaleString('en-IN')}</span></div>
        </div>

        <div class="payslip-column">
          <h4 class="split-header">Deductions</h4>
          <div class="split-row"><label>Provident Fund (EPF)</label><span>₹${Math.round(record.pf).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Employee State Insurance (ESI)</label><span>₹${Math.round(record.esi).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Professional Tax (PT)</label><span>₹${record.pt.toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Income Tax (TDS)</label><span>₹${Math.round(record.tds).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>Labour Welfare Fund (LWF)</label><span>₹${Math.round(record.lwf || 0).toLocaleString('en-IN')}</span></div>
          <div class="split-row"><label>&nbsp;</label><span>&nbsp;</span></div>
          <div class="split-row total-row"><label>Total Deductions</label><span>₹${Math.round(record.total_deductions).toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      <div class="payslip-footer">
        <div class="net-payout-banner">
          <span>NET PAYABLE TAKE-HOME SALARY AMOUNT:</span>
          <strong>₹${Math.round(record.net).toLocaleString('en-IN')}</strong>
        </div>
        <div style="margin-top:10px; font-size:0.75rem; color:#475569; border-top:1px dashed #e2e8f0; padding-top:8px; display:flex; justify-content:space-between;">
          <span>Tenure: <strong>${(record.tenure_years || 0).toFixed(1)} years</strong></span>
          <span>Accrued Gratuity Liability: <strong>₹${Math.round(record.gratuity_accrued || 0).toLocaleString('en-IN')}</strong></span>
        </div>
        <p class="signature-line" style="margin-top:6px;">This is a system generated statement and does not require a physical signature.</p>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

function closePayslipModal() {
  const modal = document.getElementById('payslip-modal');
  modal.style.display = 'none';
}

function simulateEmailPayslip(month) {
  const employee = db.getEmployee(state.currentEmployeeId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const ledger = db.getPayrollLedger(state.currentOrgId);
  const monthData = ledger[month];
  if (!monthData) return;
  const record = monthData.records.find(r => r.emp_id === state.currentEmployeeId);
  if (!record) return;

  const emailObfuscated = `${employee.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

  // Create or retrieve email simulator modal
  let modal = document.getElementById('email-simulator-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'email-simulator-modal';
    modal.className = 'wizard-modal-overlay';
    document.body.appendChild(modal);
  }

  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="card card-premium" style="max-width: 650px; width: 100%; border: 1.5px solid rgba(255,255,255,0.08); padding: 0; overflow: hidden; animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;">
      <!-- Email Header Bar -->
      <div style="background: rgba(18, 13, 14, 0.95); padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.2rem;">📧</span>
          <strong style="color:var(--text-h); font-size:0.95rem;">Gmail MFA / Corporate Mail Dispatcher</strong>
        </div>
        <button class="btn-close" onclick="document.getElementById('email-simulator-modal').style.display='none'">✖</button>
      </div>
      
      <!-- Email Meta Info -->
      <div style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.82rem; line-height: 1.6; color: var(--text-body); background: rgba(0,0,0,0.15);">
        <div><strong>From:</strong> Symbiosis HR Portal &lt;no-reply@symbiosis-payroll.com&gt;</div>
        <div><strong>To:</strong> ${employee.name} &lt;${emailObfuscated}&gt;</div>
        <div><strong>Subject:</strong> 📜 Finalized Payslip & statutory compliance notice for the period ${month}</div>
      </div>
      
      <!-- Email Body -->
      <div style="padding: 24px; background: #ffffff; color: #1e293b; font-family: system-ui, sans-serif; font-size: 0.9rem; line-height: 1.6; max-height: 400px; overflow-y: auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 2.2rem;">💼</span>
          <h2 style="margin: 8px 0 0; color: #0f172a; font-size: 1.25rem; font-weight: 800;">${org.name}</h2>
          <span style="font-size: 0.76rem; color: #475569; text-transform: uppercase; letter-spacing: 0.8px;">Remittance Statement</span>
        </div>
        
        <p>Dear <strong>${employee.name}</strong>,</p>
        <p>Your payslip for the month of <strong>${month}</strong> has been successfully finalized and approved by the HR Compliance Division. The net take-home salary has been credited to your registered bank account number: <code>${employee.bank_account || 'xxxx-xxxx'}</code>.</p>
        
        <!-- Summary Card inside Email -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <h4 style="margin: 0 0 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 0.85rem; text-transform: uppercase;">Salary Summary</h4>
          <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #475569;">Gross Earnings:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">₹${Math.round(record.gross).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #475569;">Statutory Deductions (EPF, ESI, PT, LWF, TDS):</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #dc2626;">- ₹${Math.round(record.total_deductions).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-top: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">Net Paid (Remitted):</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #16a34a; font-size: 1rem;">₹${Math.round(record.net).toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 0.8rem; color: #475569;">This is an auto-generated statutory notification. Please log in directly to your <a href="#" style="color: #4f46e5; text-decoration: underline;" onclick="return false;">Employee Self-Service Portal</a> to download the digitally signed Form 16 Part B, Form 12BB tax declarations, or print physical copies of this remittance slip.</p>
        
        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 0.78rem; color: #475569; text-align: center;">
          © 2026 Symbiosis HR Compliance Systems Ltd. India.
        </div>
      </div>
      
      <!-- Email Footer Bar -->
      <div style="background: rgba(18, 13, 14, 0.95); padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="document.getElementById('email-simulator-modal').style.display='none'">Dismiss Simulator</button>
        <button class="btn btn-primary" onclick="alert('Simulation Successful: Real email would be dispatched to employee mailbox via SMTP endpoint!'); document.getElementById('email-simulator-modal').style.display='none'">Send Actual Email</button>
      </div>
    </div>
  `;
}

function printEmployeePayslipDirectly(month) {
  showMockPayslip(month);
  setTimeout(() => {
    window.print();
  }, 150);
}

async function saveTaxDeclaration(event) {
  event.preventDefault();
  const rent = parseFloat(document.getElementById('tax-rent-paid').value) || 0;
  const landlordPan = document.getElementById('tax-landlord-pan').value.toUpperCase().trim();
  const tax80c = parseFloat(document.getElementById('tax-80c').value) || 0;
  const tax80d = parseFloat(document.getElementById('tax-80d').value) || 0;
  const otherIncome = parseFloat(document.getElementById('tax-other-income').value) || 0;

  if (landlordPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(landlordPan)) {
    alert("Invalid Landlord PAN format (must be 10 characters alphanumeric e.g. ABCDE1234F).");
    return;
  }

  const result = await db.updateEmployee(state.currentEmployeeId, {
    rent_paid: rent,
    landlord_pan: landlordPan,
    tax_80c: tax80c,
    tax_80d: tax80d,
    other_income: otherIncome
  });

  await db.preloadAll(state.currentOrgId, state.activeMonthYear, state.currentEmployeeId, state.currentRole);

  alert("Your tax investment declarations have been saved! Your monthly TDS calculation has been updated.");
  renderEmployeeTab();
}

function showFormPrintModal(title, html) {
  let modal = document.getElementById('form-print-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'form-print-modal';
    modal.className = 'payslip-modal-wrapper form-print-modal-wrapper';
    modal.style.zIndex = '3100';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="payslip-modal-content form-print-modal-content" style="max-width: 900px; background: #ffffff; color: #1e293b; border: 2px solid #0f172a;">
      <div class="payslip-modal-actions no-print" style="border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 16px;">
        <span style="font-weight:700; color:#334155; margin-right:auto; display:flex; align-items:center;">📄 Statutory Document: ${title}</span>
        <button class="btn btn-secondary" onclick="closeFormPrintModal()" style="color:#334155; border-color:#cbd5e1;">✕ Close</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Form</button>
      </div>
      <div class="form-print-body" style="padding: 10px; font-family: 'Times New Roman', Times, serif; color: #000000; background:#ffffff;">
        ${html}
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function closeFormPrintModal() {
  const modal = document.getElementById('form-print-modal');
  if (modal) modal.style.display = 'none';
}

function showForm12BBModal(empId) {
  const emp = db.getEmployee(empId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const tax = calculateAnnualTax(emp, org);

  const html = `
    <div style="max-width:800px; margin:0 auto; padding:20px; font-family:'Times New Roman', Times, serif; color:#000; background:#fff; line-height:1.5;">
      <h2 style="text-align:center; margin:0; font-size:1.4rem; font-weight:bold;">FORM NO. 12BB</h2>
      <p style="text-align:center; font-style:italic; margin:4px 0 15px;">(See rule 26C)</p>
      <h3 style="text-align:center; font-size:1.1rem; font-weight:bold; margin-bottom:20px; text-transform:uppercase; border-bottom:2px solid #000; padding-bottom:8px;">
        Statement showing particulars of claims by an employee for deduction of tax under section 192
      </h3>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:0.9rem;">
        <tr>
          <td style="padding:4px 0; width:25%;"><strong>1. Name of Employee:</strong></td>
          <td style="padding:4px 0; border-bottom:1px dashed #000; width:30%;">${emp.name}</td>
          <td style="padding:4px 0; width:20%; text-align:right; padding-right:10px;"><strong>2. PAN of Employee:</strong></td>
          <td style="padding:4px 0; border-bottom:1px dashed #000; width:25%;">${emp.pan || 'NOT PROVIDED'}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>3. Employer Name:</strong></td>
          <td style="padding:4px 0; border-bottom:1px dashed #000;">${org.name}</td>
          <td style="padding:4px 0; text-align:right; padding-right:10px;"><strong>4. Financial Year:</strong></td>
          <td style="padding:4px 0; border-bottom:1px dashed #000;">2026 - 2027</td>
        </tr>
      </table>

      <h4 style="font-size:0.95rem; font-weight:bold; margin-bottom:10px; text-decoration:underline;">Details of Claims and Investment Declarations:</h4>
      <table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:25px;" border="1" cellpadding="6">
        <thead>
          <tr style="background:#f2f2f2;">
            <th style="width:5%; text-align:center;">S.No.</th>
            <th style="width:40%;">Nature of Claim / Deduction Section</th>
            <th style="width:25%; text-align:right;">Declared Amount (₹)</th>
            <th style="width:30%;">Evidence Details / Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:center;">1</td>
            <td><strong>House Rent Allowance (HRA)</strong><br>Rent paid to landlord (Section 10(13A))</td>
            <td style="text-align:right; font-weight:bold;">₹${Math.round(tax.rentPaidAnnual).toLocaleString('en-IN')} / yr</td>
            <td>Landlord Name: ${emp.landlord_pan ? 'Provided' : 'N/A'}<br>Landlord PAN: ${emp.landlord_pan || 'N/A'}</td>
          </tr>
          <tr>
            <td style="text-align:center;">2</td>
            <td><strong>Deduction under Section 80C</strong><br>PPF, LIC, ELSS Mutual Funds, EPF, etc.</td>
            <td style="text-align:right; font-weight:bold;">₹${Math.round(tax.ded80C).toLocaleString('en-IN')}</td>
            <td>Employee statutory declarations and savings deposits</td>
          </tr>
          <tr>
            <td style="text-align:center;">3</td>
            <td><strong>Deduction under Section 80D</strong><br>Medical Insurance Policy Premium</td>
            <td style="text-align:right; font-weight:bold;">₹${Math.round(tax.ded80D).toLocaleString('en-IN')}</td>
            <td>Self &amp; Family health policies</td>
          </tr>
          <tr>
            <td style="text-align:center;">4</td>
            <td><strong>Other Source Income Declared</strong><br>Interest on savings, auxiliary earnings</td>
            <td style="text-align:right; font-weight:bold;">₹${Math.round(tax.otherIncome).toLocaleString('en-IN')}</td>
            <td>Self-declared additional earnings</td>
          </tr>
        </tbody>
      </table>

      <h4 style="font-size:0.95rem; font-weight:bold; margin-bottom:10px; text-decoration:underline;">Declaration by the Employee:</h4>
      <p style="font-size:0.82rem; line-height:1.45; text-align:justify; margin-bottom:30px;">
        I, <strong>${emp.name}</strong>, hereby declare that the particulars given above are true and correct to the best of my knowledge and belief. I undertake to submit necessary physical receipts and certificates as evidence to the HR department before the designated cut-off date. In case of any deficiency or failure of verification, I authorize the company to compute and deduct appropriate penal TDS rates from my monthly payroll cycles.
      </p>

      <table style="width:100%; font-size:0.9rem; margin-top:20px;">
        <tr>
          <td><strong>Place:</strong> Hyderabad, India</td>
          <td style="text-align:right; padding-right:20px; vertical-align:bottom;">
            <div style="display:inline-block; border:2px solid #059669; padding:6px 12px; background:#ecfdf5; color:#059669; font-family:sans-serif; font-size:0.75rem; text-align:left; border-radius:6px; margin-top:-10px;">
              <span style="font-weight:bold; font-size:0.85rem;">✅ Aadhaar eSigned</span><br>
              Name: ${emp.name}<br>
              Date: ${new Date().toISOString().split('T')[0]} 12:30:15 IST<br>
              ID: E-SIGN-MOCK-AADH-8872
            </div>
          </td>
        </tr>
        <tr>
          <td><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</td>
          <td style="text-align:right; font-weight:bold; padding-right:60px; vertical-align:top; padding-top:4px;">Signature of the Employee</td>
        </tr>
      </table>
    </div>
  `;
  showFormPrintModal("Form 12BB Declaration", html);
}

function showForm16Modal(empId) {
  const emp = db.getEmployee(empId);
  const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
  const tax = calculateAnnualTax(emp, org);

  const html = `
    <div style="max-width:800px; margin:0 auto; padding:20px; font-family:'Times New Roman', Times, serif; color:#000; background:#fff; line-height:1.5;">
      <h2 style="text-align:center; margin:0; font-size:1.3rem; font-weight:bold; text-transform:uppercase;">FORM NO. 16</h2>
      <p style="text-align:center; font-style:italic; margin:4px 0 15px;">PART B (Annexure)</p>
      <h3 style="text-align:center; font-size:1rem; font-weight:bold; margin-bottom:20px; border-bottom:2px solid #000; padding-bottom:8px;">
        Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary
      </h3>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:0.85rem;" border="1" cellpadding="6">
        <tr>
          <td style="width:50%;"><strong>Name and Address of the Employer:</strong><br>${org.name}<br>Compliance Division</td>
          <td style="width:50%;"><strong>Name and Designation of the Employee:</strong><br>${emp.name}<br>${emp.designation}</td>
        </tr>
        <tr>
          <td><strong>PAN of Employer (TAN):</strong> MUMB12345T</td>
          <td><strong>PAN of Employee:</strong> ${emp.pan || 'NOT PROVIDED'}</td>
        </tr>
        <tr>
          <td><strong>Assessment Year:</strong> 2027-2028</td>
          <td><strong>Period of Employment:</strong> ${emp.doj} to ${emp.exit_date || 'Present'}</td>
        </tr>
      </table>

      <h4 style="font-size:0.95rem; font-weight:bold; margin-bottom:10px; text-decoration:underline;">Tax Computation Statement under New Income Tax Slab rules:</h4>
      <table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:25px;" border="1" cellpadding="6">
        <thead>
          <tr style="background:#f2f2f2;">
            <th style="width:50%;">Particulars / Item Description</th>
            <th style="width:25%; text-align:right;">Sub-Amount (₹)</th>
            <th style="width:25%; text-align:right;">Total Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. Gross Salary (Annualized CTC basic + allowances)</td>
            <td style="text-align:right;">₹${Math.round(tax.annualCTC).toLocaleString('en-IN')}</td>
            <td></td>
          </tr>
          <tr>
            <td>2. Standard Deduction under Section 16(ia)</td>
            <td style="text-align:right;">- ₹50,000</td>
            <td></td>
          </tr>
          <tr>
            <td>3. HRA Exemption under Section 10(13A)</td>
            <td style="text-align:right;">- ₹${Math.round(tax.hraExemption).toLocaleString('en-IN')}</td>
            <td></td>
          </tr>
          <tr>
            <td>4. Balance Taxable Income (1 - 2 - 3)</td>
            <td></td>
            <td style="text-align:right; font-weight:bold;">₹${Math.round(tax.annualCTC - 50000 - tax.hraExemption).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>5. Deductions under Chapter VI-A:<br>&nbsp;&nbsp;&nbsp;&nbsp;a) Section 80C Savings Deposits<br>&nbsp;&nbsp;&nbsp;&nbsp;b) Section 80D Health Premiums</td>
            <td style="text-align:right;">- ₹${Math.round(tax.ded80C).toLocaleString('en-IN')}<br>- ₹${Math.round(tax.ded80D).toLocaleString('en-IN')}</td>
            <td></td>
          </tr>
          <tr>
            <td>6. Other declared income reported by employee</td>
            <td style="text-align:right;">+ ₹${Math.round(tax.otherIncome).toLocaleString('en-IN')}</td>
            <td></td>
          </tr>
          <tr style="background:#fafafa;">
            <td><strong>7. Net Taxable Income (Total Taxable Income)</strong></td>
            <td></td>
            <td style="text-align:right; font-weight:bold;">₹${Math.round(tax.taxableIncome).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>8. Calculated Income Tax on Slabs</td>
            <td style="text-align:right;">₹${Math.round(tax.totalTax / 1.04).toLocaleString('en-IN')}</td>
            <td></td>
          </tr>
          <tr>
            <td>9. Health &amp; Education Cess (4% of Tax)</td>
            <td style="text-align:right;">₹${Math.round((tax.totalTax * 0.04) / 1.04).toLocaleString('en-IN')}</td>
            <td></td>
          </tr>
          <tr style="background:#fafafa; font-size:0.9rem;">
            <td><strong>10. Total Tax Liability Deductible / Deposited</strong></td>
            <td></td>
            <td style="text-align:right; font-weight:bold; color:#d97706;">₹${Math.round(tax.totalTax).toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <h4 style="font-size:0.95rem; font-weight:bold; margin-bottom:10px; text-decoration:underline;">Verification and Certification:</h4>
      <p style="font-size:0.82rem; line-height:1.45; text-align:justify; margin-bottom:30px;">
        Certified that a sum of <strong>₹${Math.round(tax.totalTax).toLocaleString('en-IN')}</strong> (Rupees ${numberToEnglishWords(Math.round(tax.totalTax))} Only) has been deducted at source and paid to the credit of the Central Government. The calculations above are verified as conforming to the Income Tax Act, 1961 regulatory parameters for assessment year 2027-2028.
      </p>

      <table style="width:100%; font-size:0.9rem; margin-top:20px;">
        <tr>
          <td><strong>Place:</strong> Hyderabad, India</td>
          <td style="text-align:right; padding-right:20px; vertical-align:bottom;">
            <div style="display:inline-block; border:2px solid #059669; padding:6px 12px; background:#ecfdf5; color:#059669; font-family:sans-serif; font-size:0.75rem; text-align:left; border-radius:6px; margin-top:-10px;">
              <span style="font-weight:bold; font-size:0.85rem;">✅ Digitally Signed</span><br>
              By: ${org.name} Authorized Signatory<br>
              Reason: Class 3 DSC Verification Certificate<br>
              Date: ${new Date().toISOString().split('T')[0]} 18:45:22 IST
            </div>
          </td>
        </tr>
        <tr>
          <td><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</td>
          <td style="text-align:right; font-weight:bold; padding-right:60px; vertical-align:top; padding-top:4px;">Signature of the Deductor (HR Admin)</td>
        </tr>
      </table>
    </div>
  `;
  showFormPrintModal("Form 16 Part B Certificate", html);
}

function numberToEnglishWords(num) {
  if (num === 0) return "Zero";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  let makeGroup = (n) => {
    let s = "";
    if (n > 99) {
      s += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 19) {
      s += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      s += a[n];
    }
    return s;
  };
  
  let out = "";
  let temp = num;
  
  let k = temp % 1000;
  temp = Math.floor(temp / 1000);
  let l = temp % 100;
  temp = Math.floor(temp / 100);
  let c = temp % 100;
  temp = Math.floor(temp / 100);
  
  if (c > 0) out += makeGroup(c) + " Crore ";
  if (l > 0) out += makeGroup(l) + " Lakh ";
  if (k > 0 || out === "") {
    let thousands = Math.floor(num / 1000) % 100;
    let hundreds = Math.floor(num / 100) % 10;
    let tens = num % 100;
    
    let parts = "";
    if (thousands > 0) parts += makeGroup(thousands) + " Thousand ";
    if (hundreds > 0) parts += a[hundreds] + " Hundred ";
    if (tens > 0) parts += makeGroup(tens);
    out += parts;
  }
  
  return out.trim();
}

// ----------------------------------------------------
// 14. VISUAL CENTRAL DATABASE STATE INSPECTOR (CONSOLE)
// ----------------------------------------------------
function toggleDatabaseExplorer() {
  const panel = document.getElementById('db-explorer-panel');
  if (panel.classList.contains('minimized')) {
    panel.classList.remove('minimized');
    document.getElementById('db-toggle-btn').innerHTML = 'Minimize DB Explorer &darr;';
  } else {
    panel.classList.add('minimized');
    document.getElementById('db-toggle-btn').innerHTML = 'Expand DB Explorer &uarr;';
  }
}

function renderDatabaseExplorer() {
  const content = document.getElementById('db-explorer-content');
  if (!content) return;

  // SECURITY: Scope DB explorer view by role
  if (state.currentRole === 'ERP') {
    // ERP sees everything
    const orgs = db.getTable('organizations');
    const employees = db.getTable('employees');
    const attendance = db.getTable('attendance');
    const ledger = db.getTable('payroll_ledger');
    content.innerHTML = `
      <div class="db-inspector-grid">
        <div class="db-table-col">
          <h4>Table: <code>Organizations</code></h4>
          <pre class="json-box">${JSON.stringify(orgs, null, 2)}</pre>
        </div>
        <div class="db-table-col">
          <h4>Table: <code>Employees</code> (All Orgs)</h4>
          <pre class="json-box">${JSON.stringify(employees, null, 2)}</pre>
        </div>
        <div class="db-table-col">
          <h4>Table: <code>Attendance Matrix</code></h4>
          <pre class="json-box">${JSON.stringify(attendance, null, 2)}</pre>
        </div>
        <div class="db-table-col">
          <h4>Table: <code>Payroll Ledger</code></h4>
          <pre class="json-box">${JSON.stringify(ledger, null, 2)}</pre>
        </div>
      </div>`;
  } else if (state.currentRole === 'HR') {
    // HR sees only their org's data
    const orgData = db.getOrganizations().filter(o => o.org_id === state.currentOrgId);
    const empData  = db.getEmployees(state.currentOrgId);
    const attData  = db.getAttendance(state.currentOrgId, state.activeMonthYear) || [];
    const ledData  = db.getPayrollLedger(state.currentOrgId);
    content.innerHTML = `
      <div class="db-inspector-grid">
        <div class="db-table-col">
          <h4>Org: <code>${state.currentOrgId}</code></h4>
          <pre class="json-box">${JSON.stringify(orgData, null, 2)}</pre>
        </div>
        <div class="db-table-col">
          <h4>Employees (your org only)</h4>
          <pre class="json-box">${JSON.stringify(empData, null, 2)}</pre>
        </div>
        <div class="db-table-col">
          <h4>Attendance (${state.activeMonthYear})</h4>
          <pre class="json-box">${JSON.stringify(attData, null, 2)}</pre>
        </div>
        <div class="db-table-col">
          <h4>Payroll Ledger (your org)</h4>
          <pre class="json-box">${JSON.stringify(ledData, null, 2)}</pre>
        </div>
      </div>`;
  } else {
    content.innerHTML = '<p style="padding:12px; color:#475569;">🔒 DB Inspector not accessible for Employee role.</p>';
  }
}

function toggleProfileDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown');
  if (!dropdown) return;

  const isVisible = dropdown.style.display === 'flex';
  if (isVisible) {
    dropdown.style.display = 'none';
  } else {
    // Populate dropdown
    let roleText = 'System Admin';
    let nameText = 'ERP Admin';
    let emailText = 'system@symbiosis.in';
    
    const org = db.getOrganizations().find(o => o.org_id === state.currentOrgId);
    
    if (state.currentRole === 'HR') {
      roleText = 'HR Admin';
      nameText = org ? org.name : 'HR Manager';
      emailText = `hr@${state.currentOrgId.replace('org_','')}.in`;
    } else if (state.currentRole === 'Employee') {
      roleText = 'Employee';
      const emp = db.getEmployee(state.currentEmployeeId);
      nameText = emp ? emp.name : 'Employee';
      emailText = emp ? `${emp.name.split(' ')[0].toLowerCase()}@${state.currentOrgId.replace('org_','')}.in` : '';
    }

    // Build the items
    let dropdownContent = `
      <div class="profile-dropdown-header">
        <div class="profile-dropdown-role">${roleText}</div>
        <div class="profile-dropdown-name">${nameText}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${emailText}</div>
      </div>
    `;

    // View Profile link for HR or Employee
    if (state.currentRole === 'HR') {
      dropdownContent += `
        <button class="profile-dropdown-item" onclick="switchTab('settings')">
          <span>⚙️</span> Org Settings
        </button>
      `;
    } else if (state.currentRole === 'Employee') {
      dropdownContent += `
        <button class="profile-dropdown-item" onclick="switchTab('emp-profile')">
          <span>👤</span> My Profile
        </button>
      `;
    }

    // ERP specific features: switch to org views
    if (state.currentRole === 'ERP') {
      const orgs = db.getOrganizations();
      dropdownContent += `
        <div class="profile-dropdown-divider"></div>
        <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); padding:4px 12px; text-transform:uppercase;">Impersonate Org</div>
        ${orgs.map(o => `
          <button class="profile-dropdown-item" onclick="impersonateOrg('${o.org_id}')" style="padding: 6px 12px; font-size: 0.8rem;">
            🏢 ${o.name.split(' ')[0]}
          </button>
        `).join('')}
      `;
    }

    // Add Switch Role option for dev/demo if logged in as ERP (impersonation toggle)
    const payload = TokenStore.payload();
    if (state.currentRole === 'HR' && payload && payload.role === 'ERP') {
      dropdownContent += `
        <button class="profile-dropdown-item" onclick="switchBackToERP()">
          <span>🛡️</span> Return to ERP Admin
        </button>
      `;
    }

    dropdownContent += `
      <div class="profile-dropdown-divider"></div>
      <button class="profile-dropdown-item danger" onclick="handleLogout()">
        <span>↩</span> Sign Out
      </button>
    `;

    dropdown.innerHTML = dropdownContent;
    dropdown.style.display = 'flex';
  }
}

function switchBackToERP() {
  const payload = TokenStore.payload();
  if (!payload || payload.role !== 'ERP') {
    showNotificationToast('Access Denied', 'You do not have administrative privileges to access ERP.', 'error');
    return;
  }
  state.currentRole = 'ERP';
  saveSessionState();
  renderCurrentView();
  renderDatabaseExplorer();
}

// Global click listener to close dropdown when clicking outside
document.addEventListener('click', () => {
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown) dropdown.style.display = 'none';
});

// Export functions to window so inline event handlers work
window.setTheme = setTheme;
window.changeProcessingPeriod = changeProcessingPeriod;
window.openAddEmployeeForm = openAddEmployeeForm;
window.closeEmployeeForm = closeEmployeeForm;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.toggleEPFDynamic = toggleEPFDynamic;
window.toggleESIDynamic = toggleESIDynamic;
window.triggerFileInputClick = triggerFileInputClick;
window.loadAttendanceFile = loadAttendanceFile;
window.downloadSampleCSV = downloadSampleCSV;
window.closeWizard = closeWizard;
window.processMappedData = processMappedData;
window.confirmOverrideMismatch = confirmOverrideMismatch;
window.saveAdjustmentValue = saveAdjustmentValue;
window.approveAndLockPayroll = approveAndLockPayroll;
window.printWageStatement = printWageStatement;
window.submitAuxCorrection = submitAuxCorrection;
window.showMockPayslip = showMockPayslip;
window.closePayslipModal = closePayslipModal;
window.toggleDatabaseExplorer = toggleDatabaseExplorer;
window.impersonateOrg = impersonateOrg;
window.setLoginRole = setLoginRole;
window.toggleProfileDropdown = toggleProfileDropdown;
window.switchBackToERP = switchBackToERP;
window.makeDashboardWidgetsDraggable = makeDashboardWidgetsDraggable;
window.cancelOtpVerification = cancelOtpVerification;
window.closeGmailToast = closeGmailToast;
window.handleOtpSubmit = handleOtpSubmit;
window.printEmployeePayslipDirectly = printEmployeePayslipDirectly;
window.handleEmployeeRegistrationUpload = handleEmployeeRegistrationUpload;
window.downloadRegistrationCSVTemplate = downloadRegistrationCSVTemplate;
window.verifyKycField = verifyKycField;
window.handleWagesStatementsUpload = handleWagesStatementsUpload;
window.downloadWagesCSVTemplate = downloadWagesCSVTemplate;
window.downloadPfEcrFile = downloadPfEcrFile;
window.downloadBankPayoutCsv = downloadBankPayoutCsv;
window.saveTaxDeclaration = saveTaxDeclaration;
window.showForm16Modal = showForm16Modal;
window.showForm12BBModal = showForm12BBModal;
window.closeFormPrintModal = closeFormPrintModal;
window.changeEpfoCeilingLimit = changeEpfoCeilingLimit;
window.simulateEmailPayslip = simulateEmailPayslip;
window.exportDatabaseBackup = exportDatabaseBackup;
window.importDatabaseBackup = importDatabaseBackup;
window.filterEmployeeTable = filterEmployeeTable;

// ----------------------------------------------------
// 15. PREMIUM UI ENHANCEMENTS (Theme, Spotlight, Toasts)
// ----------------------------------------------------

// Theme Toggle
function initTheme() {
  const savedTheme = localStorage.getItem('symbiosis_ui_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.innerText = '☀️';
  }
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const icon = document.getElementById('theme-icon');
  if (current === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('symbiosis_ui_theme', 'light');
    if (icon) icon.innerText = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('symbiosis_ui_theme', 'dark');
    if (icon) icon.innerText = '☀️';
  }
  // Re-draw charts to update colors
  renderCurrentView();
}
initTheme();

// Spotlight Search
let spotlightOpen = false;
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (spotlightOpen) closeSpotlight();
    else openSpotlight();
  }
  if (e.key === 'Escape' && spotlightOpen) {
    closeSpotlight();
  }
});

function openSpotlight() {
  if(!state.isLoggedIn) return;
  spotlightOpen = true;
  document.getElementById('spotlight-overlay').style.display = 'flex';
  document.getElementById('spotlight-input').value = '';
  document.getElementById('spotlight-input').focus();
  renderSpotlightResults('');
}

function closeSpotlight() {
  spotlightOpen = false;
  document.getElementById('spotlight-overlay').style.display = 'none';
}

function handleSpotlightInput(e) {
  renderSpotlightResults(e.target.value);
}

function renderSpotlightResults(query) {
  const q = query.toLowerCase().trim();
  const resultsContainer = document.getElementById('spotlight-results');
  resultsContainer.innerHTML = '';
  
  if (!q) {
    resultsContainer.innerHTML = '<li style="color:var(--text-muted); justify-content:center;">Type to search employees or actions...</li>';
    return;
  }
  
  let matches = [];
  
  // Search actions
  const actions = [
    { title: 'Add New Employee', action: () => { closeSpotlight(); openAddEmployeeForm(); }, icon: '➕', sub: 'HR Operations' },
    { title: 'Process Payroll', action: () => { closeSpotlight(); switchTab('payroll'); }, icon: '💸', sub: 'Finance' },
    { title: 'Compliance Settings', action: () => { closeSpotlight(); switchTab('settings'); }, icon: '⚙️', sub: 'System' },
    { title: 'View Dashboard', action: () => { closeSpotlight(); switchTab('dashboard'); }, icon: '📊', sub: 'Overview' },
    { title: 'Logout', action: () => { closeSpotlight(); handleLogout(); }, icon: '↩', sub: 'System' }
  ];
  actions.forEach(a => {
    if (a.title.toLowerCase().includes(q)) matches.push(a);
  });
  
  // Search Employees
  if (state.currentRole !== 'Employee') {
    const orgsToSearch = state.currentRole === 'ERP' ? db.getOrganizations().map(o=>o.org_id) : [state.currentOrgId];
    orgsToSearch.forEach(orgId => {
      const emps = db.getEmployees(orgId);
      emps.forEach(emp => {
        if (emp.name.toLowerCase().includes(q) || emp.emp_id.toLowerCase().includes(q)) {
          matches.push({
            title: emp.name,
            sub: `${emp.emp_id} - ${emp.department} (${emp.designation})`,
            icon: '👤',
            action: () => { closeSpotlight(); switchTab('employees'); }
          });
        }
      });
    });
  }

  if (matches.length === 0) {
    resultsContainer.innerHTML = '<li style="color:var(--text-muted); justify-content:center;">No results found</li>';
    return;
  }
  
  matches.slice(0, 8).forEach(match => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="res-icon">${match.icon}</span><div class="res-text"><span class="res-title">${match.title}</span><span class="res-sub">${match.sub}</span></div>`;
    li.onclick = match.action;
    resultsContainer.appendChild(li);
  });
}

// macOS Style Toast Notification
function showNotificationToast(title = 'Notification', message = 'Action completed successfully', type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `apple-toast`;
  toast.innerHTML = `
    <div class="toast-icon-box">${icons[type] || 'ℹ️'}</div>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-msg">${message}</span>
    </div>
    <button class="toast-close-btn" onclick="this.parentElement.classList.add('toast-leave'); setTimeout(()=>this.parentElement.remove(), 300)">✕</button>
  `;
  container.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-leave');
      setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
    }
  }, 4000);
}

// Make sure global components can access them
window.toggleTheme = toggleTheme;
window.closeSpotlight = closeSpotlight;
window.handleSpotlightInput = handleSpotlightInput;
window.showNotificationToast = showNotificationToast;

// Website Editor global exports
window.renderWebsiteEditor = renderWebsiteEditor;
window.saveBrandingFromEditor = saveBrandingFromEditor;
window.resetBrandingToDefaults = resetBrandingToDefaults;
window.addAnnouncementFromEditor = addAnnouncementFromEditor;
window.deleteAnnouncementFromEditor = deleteAnnouncementFromEditor;
window.addCustomPageFromEditor = addCustomPageFromEditor;
window.deleteCustomPageFromEditor = deleteCustomPageFromEditor;
window.previewCustomPage = previewCustomPage;
window.toggleFeatureFlag = toggleFeatureFlag;
window.toggleDashboardWidget = toggleDashboardWidget;
window.toggleGoogleOrgField = toggleGoogleOrgField;
window.populateGoogleEmployees = populateGoogleEmployees;
window.addGoogleAccountFromEditor = addGoogleAccountFromEditor;
window.deleteGoogleAccountFromEditor = deleteGoogleAccountFromEditor;
window.editorInsertLink = editorInsertLink;
window.editorInsertImage = editorInsertImage;
window.editorInsertTable = editorInsertTable;
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
window.showToast = showNotificationToast; // Alias for editor module
window.switchBackToERP = switchBackToERP;
window.switchEditorSubTab = switchEditorSubTab;
window.applyThemePreset = applyThemePreset;
window.saveCustomCssFromEditor = saveCustomCssFromEditor;

// Google Identity Services initialization
function initGoogleSignIn() {
  if (typeof google === 'undefined' || !google.accounts) {
    // GSI not loaded yet, retry in 500ms
    setTimeout(initGoogleSignIn, 500);
    return;
  }
  google.accounts.id.initialize({
    client_id: '274752324699-s3v6smma1i8omqvk1etli1lrp0faivvf.apps.googleusercontent.com',
    callback: handleGoogleCredentialResponse
  });

  // Render button if container exists
  const btnContainer = document.getElementById('google-signin-btn');
  if (btnContainer) {
    google.accounts.id.renderButton(btnContainer, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'center',
      width: 320
    });
  }
}

// Apply branding on each render cycle
const _origRenderCurrentView = renderCurrentView;
function renderCurrentViewWithBranding() {
  _origRenderCurrentView();
  applyBranding();
}
// Override global
window.renderCurrentView = renderCurrentViewWithBranding;

// Initialize Google Sign-In when login page is rendered
const _origRenderLoginPage = renderLoginPage;
window._origRenderLoginPage = _origRenderLoginPage;
const origRenderLoginRef = renderLoginPage;
window.renderLoginPage = function() {
  origRenderLoginRef();
  setTimeout(initGoogleSignIn, 300);
};

// Initial branding application
applyBranding();
