// ============================================================================
// Symbiosis HR Payroll - Type Definitions
// ============================================================================

// --- Core Enums ---
export enum UserRole {
  ERP = 'ERP',
  HR = 'HR',
  Employee = 'Employee'
}

export enum PayrollStatus {
  Draft = 'Draft',
  Locked = 'Locked'
}

export enum AttendanceCode {
  Present = 'P',
  Absent = 'A',
  WeeklyOff = 'WO',
  Holiday = 'H',
  EarnedLeave = 'EL',
  CompensatoryOff = 'CO',
  PreJoin = 'X',
  PostExit = 'X'
}

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark'
}

export enum PTState {
  Telangana = 'telangana',
  Maharashtra = 'maharashtra',
  Karnataka = 'karnataka',
  TamilNadu = 'tamilnadu',
  WestBengal = 'westbengal'
}

// --- Database Entities ---
export interface Organization {
  org_id: string;
  name: string;
  epf_rate: number;
  minimum_wage: number;
  basic_pct: number;
  ot_rate: number;
  state_pt: PTState;
}

export interface Employee {
  emp_id: string;
  org_id: string;
  name: string;
  doj: string;
  exit_date: string | null;
  ctc: number;
  department: string;
  designation: string;
  bank_account: string;
  epf_eligible: boolean;
  esi_eligible: boolean;
  status: 'Active' | 'Inactive';
  tds_rate: number | null;
  rent_paid: number;
  tax_80c: number;
  tax_80d: number;
  other_income: number;
  landlord_pan: string;
  pan: string;
  aadhaar: string;
}

export interface AttendanceRecord {
  emp_id: string;
  name: string;
  days: AttendanceCode[];
  ot: number;
}

export interface PayrollRecord {
  emp_id: string;
  name: string;
  ctc: number;
  tenure_days: number;
  absent_days: number;
  payable_days: number;
  basic_earned: number;
  hra_earned: number;
  da_earned: number;
  conv_earned: number;
  med_earned: number;
  ot_hours: number;
  ot_pay: number;
  bonus: number;
  adjustments: number;
  gross: number;
  pf: number;
  pf_employer: number;
  esi: number;
  esi_employer: number;
  pt: number;
  tds: number;
  lwf: number;
  lwf_employer: number;
  gratuity_monthly: number;
  gratuity_accrued: number;
  tenure_years: number;
  total_deductions: number;
  net: number;
  warnings: string[];
  justification: string;
}

export interface PayrollRun {
  status: PayrollStatus;
  approved_by: string;
  approved_date: string;
  records: PayrollRecord[];
  adjustments_log: AdjustmentLog[];
}

export interface AdjustmentLog {
  emp_id: string;
  amount: number;
  justification: string;
  timestamp: string;
}

export interface SandboxAdjustment {
  variable_earnings: number;
  adjustments: number;
  justification: string;
}

export interface SchemaMapping {
  emp_id: number;
  employee_name: number;
  D1: number;
  overtime_hours: number;
  P: string;
  WO: string;
  H: string;
  EL: string;
  CO: string;
}

export interface TaxCalculation {
  annualCTC: number;
  basicAnnual: number;
  hraAnnual: number;
  rentPaidAnnual: number;
  hraExemption: number;
  ded80C: number;
  ded80D: number;
  otherIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  totalTax: number;
  monthlyTds: number;
}

// --- Session & State ---
export interface SessionState {
  isLoggedIn: boolean;
  role: UserRole;
  org_id: string;
  emp_id: string;
}

export interface AppState {
  isLoggedIn: boolean;
  currentRole: UserRole;
  currentOrgId: string;
  currentEmployeeId: string;
  activeTab: string;
  activeMonthYear: string;
  currentTheme: string;
  sandboxAdjustments: Record<string, SandboxAdjustment>;
  epfoCeiling: number;
  uiTheme: ThemeMode;
}

// --- UI Types ---
export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

export interface SpotlightResult {
  title: string;
  sub: string;
  icon: string;
  action: () => void;
}

export interface ChartTooltipData {
  label: string;
  value: string | number;
  color: string;
}

// --- Validation Types ---
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FieldValidation {
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

// --- API/Export Types ---
export interface DatabaseBackup {
  organizations: Organization[];
  employees: Employee[];
  schemas: Record<string, SchemaMapping>;
  attendance: Record<string, Record<string, AttendanceRecord[]>>;
  payroll_ledger: Record<string, Record<string, PayrollRun>>;
  db_version: string;
  exported_at: string;
}

export interface CSVTemplate {
  headers: string[];
  sampleRows: string[][];
}

// --- Constants ---
export const VALID_ATTENDANCE_CODES = [
  AttendanceCode.Present,
  AttendanceCode.WeeklyOff,
  AttendanceCode.Holiday,
  AttendanceCode.EarnedLeave,
  AttendanceCode.CompensatoryOff
] as const;

export const PT_SLABS: Record<PTState, Array<{ min: number; max: number; amount: number }>> = {
  [PTState.Telangana]: [
    { min: 0, max: 15000, amount: 0 },
    { min: 15001, max: 20000, amount: 150 },
    { min: 20001, max: Infinity, amount: 200 }
  ],
  [PTState.Maharashtra]: [
    { min: 0, max: 7500, amount: 0 },
    { min: 7501, max: 10000, amount: 175 },
    { min: 10001, max: Infinity, amount: 200 }
  ],
  [PTState.Karnataka]: [
    { min: 0, max: 25000, amount: 0 },
    { min: 25001, max: Infinity, amount: 200 }
  ],
  [PTState.TamilNadu]: [
    { min: 0, max: 3000, amount: 0 },
    { min: 3001, max: 5000, amount: 30 },
    { min: 5001, max: 7500, amount: 60 },
    { min: 7501, max: 10000, amount: 115 },
    { min: 10001, max: 12500, amount: 171 },
    { min: 12501, max: Infinity, amount: 230 }
  ],
  [PTState.WestBengal]: [
    { min: 0, max: 10000, amount: 0 },
    { min: 10001, max: 15000, amount: 110 },
    { min: 15001, max: 25000, amount: 130 },
    { min: 25001, max: 40000, amount: 150 },
    { min: 40001, max: Infinity, amount: 200 }
  ]
};

export const TAX_SLABS_NEW_REGIME = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 600000, rate: 0.05 },
  { min: 600001, max: 900000, rate: 0.10 },
  { min: 900001, max: 1200000, rate: 0.15 },
  { min: 1200001, max: 1500000, rate: 0.20 },
  { min: 1500001, max: Infinity, rate: 0.30 }
];

export const EPFO_CEILING = 15000;
export const ESI_CEILING = 21000;
export const STANDARD_DEDUCTION = 50000;
export const MAX_80C = 150000;
export const MAX_80D = 25000;