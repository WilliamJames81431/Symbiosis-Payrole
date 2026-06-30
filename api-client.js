/**
 * Symbiosis HR Payroll System
 * API Client — Hybrid Mode: Real backend OR localStorage fallback
 *
 * Architecture:
 * - When backend (localhost:3000) is reachable, uses real API calls
 * - When backend is unavailable, falls back to localStorage for ALL operations
 * - Access token stored in MEMORY only
 * - All db.* calls work identically regardless of backend availability
 */

const API_BASE = window.__ENV__?.API_BASE_URL || 'http://localhost:3000';

// ─────────────────────────────────────────────────────────────────
// BACKEND HEALTH CHECK — detect if backend is available
// ─────────────────────────────────────────────────────────────────
let _backendAvailable = false;
let _backendChecked = false;

async function checkBackendAvailability() {
  if (_backendChecked) return _backendAvailable;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`${API_BASE}/api/v1/organizations/public`, {
      signal: ctrl.signal, credentials: 'include'
    });
    clearTimeout(timer);
    _backendAvailable = res.ok;
  } catch {
    _backendAvailable = false;
  }
  _backendChecked = true;
  return _backendAvailable;
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT SEED DATA — used when localStorage is empty
// ─────────────────────────────────────────────────────────────────
const SEED_ORGS = [
  { org_id: 'org_tata', name: 'Tata Consultancy Services (TCS)', epf_rate: 12, minimum_wage: 12000, basic_pct: 60, ot_rate: 250, state_pt: 'telangana' },
  { org_id: 'org_infy', name: 'Infosys Technologies Ltd', epf_rate: 12, minimum_wage: 10000, basic_pct: 50, ot_rate: 200, state_pt: 'karnataka' },
  { org_id: 'org_reliance', name: 'Reliance Industries Limited', epf_rate: 12, minimum_wage: 15000, basic_pct: 55, ot_rate: 300, state_pt: 'maharashtra' }
];

const SEED_EMPLOYEES = [
  { emp_id: 'EMP101', org_id: 'org_tata', name: 'Aarav Sharma', doj: '2024-01-15', exit_date: null, ctc: 80000, department: 'Engineering', designation: 'Lead Developer', bank_account: 'HDFC 9876543210', bank_name: 'HDFC Bank', ifsc_code: 'HDFC0001234', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: null, rent_paid: 12000, tax_80c: 45000, tax_80d: 12500, other_income: 0, landlord_pan: 'ABCDE1234F', pan: 'ABCDE1234F', aadhaar: '123456789012' },
  { emp_id: 'EMP102', org_id: 'org_tata', name: 'Priya Patel', doj: '2026-06-05', exit_date: null, ctc: 45000, department: 'Marketing', designation: 'Graphic Designer', bank_account: 'ICICI 1234567890', bank_name: 'ICICI Bank', ifsc_code: 'ICIC0002345', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: 5, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'XYZAB5678C', aadhaar: '987654321098' },
  { emp_id: 'EMP103', org_id: 'org_tata', name: 'Rohan Das', doj: '2023-03-10', exit_date: '2026-06-20', ctc: 20000, department: 'Operations', designation: 'Operations Executive', bank_account: 'SBI 1122334455', bank_name: 'State Bank of India', ifsc_code: 'SBIN0003456', epf_eligible: false, esi_eligible: true, status: 'Active', tds_rate: 0, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'LMNOP1234Q', aadhaar: '111122223333' },
  { emp_id: 'EMP104', org_id: 'org_tata', name: 'Ananya Iyer', doj: '2025-11-01', exit_date: null, ctc: 150000, department: 'Human Resources', designation: 'HR Director', bank_account: 'Axis 5566778899', bank_name: 'Axis Bank', ifsc_code: 'UTIB0004567', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: null, rent_paid: 25000, tax_80c: 120000, tax_80d: 25000, other_income: 15000, landlord_pan: 'PQRST5678U', pan: 'PQRST5678U', aadhaar: '555566667777' },
  { emp_id: 'EMP105', org_id: 'org_tata', name: 'Kabir Malhotra', doj: '2026-06-25', exit_date: null, ctc: 18000, department: 'Customer Support', designation: 'Support Associate', bank_account: 'HDFC 4455667788', bank_name: 'HDFC Bank', ifsc_code: 'HDFC0005678', epf_eligible: true, esi_eligible: true, status: 'Active', tds_rate: 0, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'DEFGH9012I', aadhaar: '888899990000' },
  { emp_id: 'EMP201', org_id: 'org_infy', name: 'Vikram Singh', doj: '2022-05-18', exit_date: null, ctc: 95000, department: 'Engineering', designation: 'Principal Architect', bank_account: 'ICICI 9090909090', bank_name: 'ICICI Bank', ifsc_code: 'ICIC0006789', epf_eligible: true, esi_eligible: false, status: 'Active', tds_rate: 12, rent_paid: 15000, tax_80c: 30000, tax_80d: 5000, other_income: 0, landlord_pan: 'JKLM9012N', pan: 'JKLM9012N', aadhaar: '222233334444' },
  { emp_id: 'EMP202', org_id: 'org_infy', name: 'Sneha Rao', doj: '2026-06-12', exit_date: null, ctc: 19000, department: 'Operations', designation: 'Helpdesk Officer', bank_account: 'SBI 8080808080', bank_name: 'State Bank of India', ifsc_code: 'SBIN0007890', epf_eligible: false, esi_eligible: true, status: 'Active', tds_rate: 0, rent_paid: 0, tax_80c: 0, tax_80d: 0, other_income: 0, landlord_pan: '', pan: 'OPQRS3456T', aadhaar: '777788889999' }
];

const SEED_ATTENDANCE = {
  'org_tata_2026-06': [
    { emp_id: 'EMP101', name: 'Aarav Sharma', days: ['P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P'], ot: 10 },
    { emp_id: 'EMP102', name: 'Priya Patel', days: ['A','A','A','A','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P'], ot: 0 },
    { emp_id: 'EMP103', name: 'Rohan Das', days: ['P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','A','A','A','A','A','A','A','A','A','A','A'], ot: 5 },
    { emp_id: 'EMP104', name: 'Ananya Iyer', days: ['P','P','P','P','P','WO','WO','EL','EL','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','A','A','P','P'], ot: 0 },
    { emp_id: 'EMP105', name: 'Kabir Malhotra', days: ['A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','P','WO','WO','P'], ot: 2 }
  ]
};

const SEED_LEDGER = {
  'org_tata': {
    '2026-05': {
      status: 'Locked',
      approved_by: 'HR Admin (TCS)',
      approved_date: '2026-05-31',
      records: [
        { emp_id: 'EMP101', name: 'Aarav Sharma', ctc: 80000, payable_days: 31, gross: 82500, basic_earned: 48000, pf: 1800, esi: 0, tax: 8200, total_deductions: 10000, net: 72500, adjustments: 0, ot_pay: 2500 },
        { emp_id: 'EMP103', name: 'Rohan Das', ctc: 20000, payable_days: 31, gross: 20000, basic_earned: 0, pf: 0, esi: 150, tax: 0, total_deductions: 150, net: 19850, adjustments: 0, ot_pay: 0 }
      ],
      adjustments_log: []
    }
  }
};

// ─────────────────────────────────────────────────────────────────
// CREDENTIALS for offline mode
// ─────────────────────────────────────────────────────────────────
const LOCAL_CREDENTIALS = {
  'system': { password: 'admin', role: 'ERP', org_id: 'org_tata', emp_id: null, email: 'system@symbiosis.in' },
  'hr@tata': { password: 'admin', role: 'HR', org_id: 'org_tata', emp_id: null, email: 'hr@tata.in' },
  'hr@infy': { password: 'admin', role: 'HR', org_id: 'org_infy', emp_id: null, email: 'hr@infy.in' },
  'aarav': { password: 'pass', role: 'Employee', org_id: 'org_tata', emp_id: 'EMP101', email: 'aarav@tata.in' },
  'priya': { password: 'pass', role: 'Employee', org_id: 'org_tata', emp_id: 'EMP102', email: 'priya@tata.in' },
  'rohan': { password: 'pass', role: 'Employee', org_id: 'org_tata', emp_id: 'EMP103', email: 'rohan@tata.in' },
  'ananya': { password: 'pass', role: 'Employee', org_id: 'org_tata', emp_id: 'EMP104', email: 'ananya@tata.in' },
  'kabir': { password: 'pass', role: 'Employee', org_id: 'org_tata', emp_id: 'EMP105', email: 'kabir@tata.in' },
  'vikram': { password: 'pass', role: 'Employee', org_id: 'org_infy', emp_id: 'EMP201', email: 'vikram@infy.in' },
  'sneha': { password: 'pass', role: 'Employee', org_id: 'org_infy', emp_id: 'EMP202', email: 'sneha@infy.in' },
};

// ─────────────────────────────────────────────────────────────────
// LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────
const LS = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

function lsOrgs() {
  let orgs = LS.get('symbiosis_orgs');
  if (!orgs || orgs.length === 0) {
    orgs = JSON.parse(JSON.stringify(SEED_ORGS));
    LS.set('symbiosis_orgs', orgs);
  }
  return orgs;
}
function lsEmployees() {
  let emps = LS.get('symbiosis_employees');
  if (!emps || emps.length === 0) {
    emps = JSON.parse(JSON.stringify(SEED_EMPLOYEES));
    LS.set('symbiosis_employees', emps);
  }
  return emps;
}
function lsAttendance(orgId, monthYear) {
  const key = `symbiosis_att_${orgId}_${monthYear}`;
  let att = LS.get(key);
  if (!att) {
    const seedKey = `${orgId}_${monthYear}`;
    att = SEED_ATTENDANCE[seedKey] || [];
    if (att.length > 0) LS.set(key, att);
  }
  return att;
}
function lsLedger(orgId) {
  const key = `symbiosis_ledger_${orgId}`;
  let ledger = LS.get(key);
  if (!ledger) {
    ledger = SEED_LEDGER[orgId] || {};
    if (Object.keys(ledger).length > 0) LS.set(key, ledger);
  }
  return ledger || {};
}
function lsSchemas() {
  return LS.get('symbiosis_schemas') || {
    'org_tata': { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 },
    'org_infy': { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 }
  };
}

// ─────────────────────────────────────────────────────────────────
// TOKEN STORE (in-memory only)
// ─────────────────────────────────────────────────────────────────
const TokenStore = (() => {
  let _token = null;
  let _localPayload = null;  // for offline mode
  let _refreshInFlight = null;

  return {
    get: () => _token,
    set: (t) => { _token = t; },
    clear: () => { _token = null; _localPayload = null; },

    setLocalPayload: (p) => { _localPayload = p; },
    getLocalPayload: () => _localPayload,

    /** Decode JWT payload without verification */
    payload: () => {
      if (_localPayload) return _localPayload;
      if (!_token) return null;
      try {
        return JSON.parse(atob(_token.split('.')[1]));
      } catch {
        return null;
      }
    },

    isExpiringSoon: () => {
      if (_localPayload) return false;  // local sessions don't expire
      const p = TokenStore.payload();
      if (!p?.exp) return true;
      return (p.exp * 1000) - Date.now() < 60_000;
    },

    refresh: async () => {
      if (_localPayload) return true;  // local sessions don't need refresh
      if (_refreshInFlight) return _refreshInFlight;

      _refreshInFlight = fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST', credentials: 'include',
      })
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(data => { _token = data.token; return true; })
        .catch(() => { _token = null; return false; })
        .finally(() => { _refreshInFlight = null; });

      return _refreshInFlight;
    }
  };
})();

// ─────────────────────────────────────────────────────────────────
// CORE API REQUEST FUNCTION
// ─────────────────────────────────────────────────────────────────
async function apiRequest(method, path, body = null, options = {}) {
  if (TokenStore.isExpiringSoon()) {
    const ok = await TokenStore.refresh();
    if (!ok && !path.includes('/auth/')) {
      handleSessionExpiry();
      return null;
    }
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = TokenStore.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method, headers, credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  if (res.status === 401) {
    const refreshed = await TokenStore.refresh();
    if (!refreshed) { handleSessionExpiry(); return null; }
    return apiRequest(method, path, body, options);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  const contentDisp = res.headers.get('Content-Disposition') || '';
  if (
    contentType.includes('application/pdf') ||
    contentType.includes('text/plain') ||
    contentType.includes('text/csv') ||
    contentDisp.includes('attachment')
  ) {
    return res.blob();
  }

  return res.json();
}

function handleSessionExpiry() {
  TokenStore.clear();
  const wasLoggedIn = window.state?.isLoggedIn;
  if (window.state) {
    window.state.isLoggedIn = false;
    window.state.currentRole = null;
  }
  if (wasLoggedIn) {
    if (window.showNotificationToast) {
      window.showNotificationToast('Session Expired', 'Please sign in again.', 'warning');
    }
    if (window.renderCurrentView) {
      setTimeout(() => window.renderCurrentView(), 1500);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────
const AuthAPI = {
  async login(username, password) {
    // Try real backend first
    const backendUp = await checkBackendAvailability();

    if (backendUp) {
      try {
        const data = await fetch(`${API_BASE}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password }),
        }).then(r => r.json());

        if (data.error) throw new Error(data.error);
        TokenStore.set(data.token);
        const payload = TokenStore.payload();

        if (window.state) {
          window.state.isLoggedIn = true;
          window.state.currentRole = payload.role;
          window.state.currentOrgId = payload.org_id;
          window.state.currentUser = payload.username;
          window.state.currentEmployeeId = payload.emp_id || null;
        }
        return data.user;
      } catch (err) {
        console.warn('[AuthAPI] Backend login failed, trying local auth:', err);
      }
    }

    // Local auth fallback
    const cred = LOCAL_CREDENTIALS[username];
    if (!cred || cred.password !== password) {
      throw new Error('Invalid username or password. Please check the demo credentials below.');
    }

    const payload = {
      role: cred.role,
      org_id: cred.org_id,
      emp_id: cred.emp_id,
      email: cred.email,
      username: username,
      exp: Math.floor(Date.now() / 1000) + 86400  // 24h local session
    };
    TokenStore.setLocalPayload(payload);

    if (window.state) {
      window.state.isLoggedIn = true;
      window.state.currentRole = payload.role;
      window.state.currentOrgId = payload.org_id;
      window.state.currentUser = username;
      window.state.currentEmployeeId = payload.emp_id || null;
    }

    return { username, role: payload.role, org_id: payload.org_id };
  },

  async logout() {
    try {
      if (_backendAvailable) {
        await fetch(`${API_BASE}/api/v1/auth/logout`, {
          method: 'POST', credentials: 'include',
        });
      }
    } finally {
      TokenStore.clear();
      if (window.state) {
        window.state.isLoggedIn = false;
        window.state.currentRole = null;
        window.state.currentOrgId = null;
      }
    }
  },

  async changePassword(currentPassword, newPassword) {
    if (!_backendAvailable) {
      // For local mode, just simulate success
      return { success: true };
    }
    return apiRequest('POST', '/api/v1/auth/change-password', { currentPassword, newPassword });
  }
};

// ─────────────────────────────────────────────────────────────────
// ORGANIZATIONS API
// ─────────────────────────────────────────────────────────────────
const OrgsAPI = {
  async getAll() {
    if (_backendAvailable) {
      try { return await apiRequest('GET', '/api/v1/organizations'); } catch {}
    }
    return lsOrgs();
  },
  async get(orgId) {
    if (_backendAvailable) {
      try { return await apiRequest('GET', `/api/v1/organizations/${orgId}`); } catch {}
    }
    return lsOrgs().find(o => o.org_id === orgId) || null;
  },
  async create(orgData) {
    if (_backendAvailable) {
      try { return await apiRequest('POST', '/api/v1/organizations', orgData); } catch {}
    }
    const orgs = lsOrgs();
    orgs.push(orgData);
    LS.set('symbiosis_orgs', orgs);
    return { data: orgData };
  },
  async update(orgId, data) {
    if (_backendAvailable) {
      try { return await apiRequest('PUT', `/api/v1/organizations/${orgId}`, data); } catch {}
    }
    const orgs = lsOrgs();
    const idx = orgs.findIndex(o => o.org_id === orgId);
    if (idx !== -1) { orgs[idx] = { ...orgs[idx], ...data }; LS.set('symbiosis_orgs', orgs); }
    return { success: true };
  }
};

// ─────────────────────────────────────────────────────────────────
// EMPLOYEES API
// ─────────────────────────────────────────────────────────────────
const EmployeesAPI = {
  async getAll(orgId) {
    if (_backendAvailable) {
      try {
        const q = orgId ? `?org_id=${orgId}` : '';
        return await apiRequest('GET', `/api/v1/employees${q}`);
      } catch {}
    }
    const emps = lsEmployees();
    return orgId ? emps.filter(e => e.org_id === orgId) : emps;
  },
  async get(empId) {
    if (_backendAvailable) {
      try { return await apiRequest('GET', `/api/v1/employees/${empId}`); } catch {}
    }
    return lsEmployees().find(e => e.emp_id === empId) || null;
  },
  async create(employeeData) {
    if (_backendAvailable) {
      try { return await apiRequest('POST', '/api/v1/employees', employeeData); } catch {}
    }
    const emps = lsEmployees();
    emps.push(employeeData);
    LS.set('symbiosis_employees', emps);
    return { data: employeeData };
  },
  async update(empId, data) {
    if (_backendAvailable) {
      try { return await apiRequest('PUT', `/api/v1/employees/${empId}`, data); } catch {}
    }
    const emps = lsEmployees();
    const idx = emps.findIndex(e => e.emp_id === empId);
    if (idx !== -1) { emps[idx] = { ...emps[idx], ...data }; LS.set('symbiosis_employees', emps); }
    return { success: true };
  },
  async deactivate(empId) {
    if (_backendAvailable) {
      try { return await apiRequest('DELETE', `/api/v1/employees/${empId}`); } catch {}
    }
    const emps = lsEmployees();
    const idx = emps.findIndex(e => e.emp_id === empId);
    if (idx !== -1) { emps[idx].status = 'Inactive'; LS.set('symbiosis_employees', emps); }
    return { success: true };
  },
  async bulkUpload(rows) {
    if (_backendAvailable) {
      try { return await apiRequest('POST', '/api/v1/employees/bulk', { employees: rows }); } catch {}
    }
    const emps = lsEmployees();
    rows.forEach(row => {
      const idx = emps.findIndex(e => e.emp_id === row.emp_id);
      if (idx !== -1) emps[idx] = { ...emps[idx], ...row };
      else emps.push(row);
    });
    LS.set('symbiosis_employees', emps);
    return { success: true, count: rows.length };
  }
};

// ─────────────────────────────────────────────────────────────────
// ATTENDANCE API
// ─────────────────────────────────────────────────────────────────
const AttendanceAPI = {
  async get(orgId, monthYear) {
    if (_backendAvailable) {
      try { return await apiRequest('GET', `/api/v1/attendance/${monthYear}?org_id=${orgId}`); } catch {}
    }
    return lsAttendance(orgId, monthYear);
  },
  async upload(orgId, monthYear, records) {
    if (_backendAvailable) {
      try {
        return await apiRequest('POST', '/api/v1/attendance/upload', { org_id: orgId, month_year: monthYear, records });
      } catch {}
    }
    const key = `symbiosis_att_${orgId}_${monthYear}`;
    // Merge with existing attendance
    const existing = LS.get(key) || [];
    records.forEach(rec => {
      const idx = existing.findIndex(e => e.emp_id === rec.emp_id);
      if (idx !== -1) existing[idx] = rec;
      else existing.push(rec);
    });
    LS.set(key, existing);
    return { success: true };
  },
  async getSchema(orgId) {
    if (_backendAvailable) {
      try { return await apiRequest('GET', `/api/v1/attendance/schema?org_id=${orgId}`); } catch {}
    }
    const schemas = lsSchemas();
    return { schema: schemas[orgId] || { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 } };
  },
  async saveSchema(orgId, schema) {
    if (_backendAvailable) {
      try { return await apiRequest('POST', '/api/v1/attendance/schema', { org_id: orgId, schema }); } catch {}
    }
    const schemas = lsSchemas();
    schemas[orgId] = schema;
    LS.set('symbiosis_schemas', schemas);
    return { success: true };
  }
};

// ─────────────────────────────────────────────────────────────────
// PAYROLL API
// ─────────────────────────────────────────────────────────────────
const PayrollAPI = {
  async calculate(orgId, monthYear, adjustments = {}) {
    if (_backendAvailable) {
      try { return await apiRequest('POST', '/api/v1/payroll/calculate', { org_id: orgId, month_year: monthYear, adjustments }); } catch {}
    }
    return { success: true, draft: true };
  },
  async lock(orgId, monthYear, records) {
    if (_backendAvailable) {
      try { return await apiRequest('POST', '/api/v1/payroll/lock', { org_id: orgId, month_year: monthYear, records }); } catch {}
    }
    const ledger = lsLedger(orgId);
    ledger[monthYear] = {
      status: 'Locked',
      approved_by: window.state?.currentUser || 'HR Admin',
      approved_date: new Date().toISOString().split('T')[0],
      records: records,
      adjustments_log: []
    };
    LS.set(`symbiosis_ledger_${orgId}`, ledger);
    return { success: true };
  },
  async getLedger(orgId) {
    if (_backendAvailable) {
      try { return await apiRequest('GET', `/api/v1/payroll/ledger?org_id=${orgId}`); } catch {}
    }
    // Return as array format for compatibility
    const ledger = lsLedger(orgId);
    const data = Object.entries(ledger).map(([month_year, run]) => ({ month_year, ...run }));
    return { data };
  },
  async getLedgerMonth(orgId, monthYear) {
    if (_backendAvailable) {
      try { return await apiRequest('GET', `/api/v1/payroll/ledger/${monthYear}?org_id=${orgId}`); } catch {}
    }
    const ledger = lsLedger(orgId);
    return ledger[monthYear] || null;
  }
};

// ─────────────────────────────────────────────────────────────────
// COMPLIANCE API
// ─────────────────────────────────────────────────────────────────
const ComplianceAPI = {
  async downloadEPFECR(orgId, monthYear) {
    if (_backendAvailable) {
      try {
        const blob = await apiRequest('GET', `/api/v1/compliance/epf-ecr/${monthYear}?org_id=${orgId}`);
        triggerDownload(blob, `EPF_ECR_${monthYear}.txt`, 'text/plain');
        return;
      } catch {}
    }
    // Local fallback: generate ECR from localStorage data
    const employees = lsEmployees().filter(e => e.org_id === orgId && e.epf_eligible);
    const ledger = lsLedger(orgId);
    const run = ledger[monthYear];
    let ecrLines = `#~#UAN#~#MEMBER_NAME#~#GROSS_WAGES#~#EPF_WAGES#~#EPS_WAGES#~#EDLI_WAGES#~#EE_SHARE#~#ER_SHARE#~#NCP_DAYS#~#REFUND_OF_ADVANCES#~#`;
    if (run && run.records) {
      run.records.filter(r => employees.find(e => e.emp_id === r.emp_id)).forEach(r => {
        const uanId = r.emp_id.replace(/\D/g, '') || '101';
        const uan = `1009${uanId.padStart(8, '0')}`;
        const pfWages = Math.min(r.basic_earned || 0, 15000);
        ecrLines += `\n#~#${uan}#~#${r.name}#~#${r.gross}#~#${pfWages}#~#${pfWages}#~#${pfWages}#~#${r.pf}#~#${Math.round(pfWages * 0.0367)}#~#0#~#0#~#`;
      });
    }
    triggerDownload(new Blob([ecrLines], { type: 'text/plain' }), `EPF_ECR_${monthYear}.txt`, 'text/plain');
  },

  async downloadBankCSV(orgId, monthYear) {
    if (_backendAvailable) {
      try {
        const blob = await apiRequest('GET', `/api/v1/compliance/bank-csv/${monthYear}?org_id=${orgId}`);
        triggerDownload(blob, `BankPayout_${monthYear}.csv`, 'text/csv');
        return;
      } catch {}
    }
    const employees = lsEmployees().filter(e => e.org_id === orgId);
    const ledger = lsLedger(orgId);
    const run = ledger[monthYear];
    let csvLines = 'Employee ID,Employee Name,Bank Name,Account Number,IFSC Code,Net Pay Amount\n';
    if (run && run.records) {
      run.records.forEach(r => {
        const emp = employees.find(e => e.emp_id === r.emp_id);
        if (emp) {
          csvLines += `${r.emp_id},${r.name},${emp.bank_name || 'N/A'},${emp.bank_account || 'N/A'},${emp.ifsc_code || 'N/A'},${r.net}\n`;
        }
      });
    }
    triggerDownload(new Blob([csvLines], { type: 'text/csv' }), `BankPayout_${monthYear}.csv`, 'text/csv');
  },

  async downloadESIReport(orgId, monthYear) {
    if (_backendAvailable) {
      try {
        const blob = await apiRequest('GET', `/api/v1/compliance/esi-report/${monthYear}?org_id=${orgId}`);
        triggerDownload(blob, `ESI_Report_${monthYear}.csv`, 'text/csv');
        return;
      } catch {}
    }
    const employees = lsEmployees().filter(e => e.org_id === orgId && e.esi_eligible);
    const ledger = lsLedger(orgId);
    const run = ledger[monthYear];
    let csvLines = 'IP Number,Employee Name,Gross Wages,ESI Contribution (Employee),ESI Contribution (Employer)\n';
    if (run && run.records) {
      run.records.filter(r => employees.find(e => e.emp_id === r.emp_id)).forEach(r => {
        const ipNum = `10${r.emp_id.replace(/\D/g, '').padStart(10, '0')}`;
        csvLines += `${ipNum},${r.name},${r.gross},${Math.round(r.gross * 0.0075)},${Math.round(r.gross * 0.0325)}\n`;
      });
    }
    triggerDownload(new Blob([csvLines], { type: 'text/csv' }), `ESI_Report_${monthYear}.csv`, 'text/csv');
  }
};

// ─────────────────────────────────────────────────────────────────
// TAX DECLARATIONS API
// ─────────────────────────────────────────────────────────────────
const TaxAPI = {
  async getDeclaration(orgId, empId, financialYear) {
    if (_backendAvailable) {
      try { return await apiRequest('GET', `/api/v1/tax/declaration?org_id=${orgId}&emp_id=${empId}&fy=${financialYear}`); } catch {}
    }
    return LS.get(`symbiosis_tax_${empId}_${financialYear}`) || {};
  },
  async saveDeclaration(orgId, empId, financialYear, data) {
    if (_backendAvailable) {
      try { return await apiRequest('POST', '/api/v1/tax/declaration', { org_id: orgId, emp_id: empId, financial_year: financialYear, ...data }); } catch {}
    }
    LS.set(`symbiosis_tax_${empId}_${financialYear}`, data);
    return { success: true };
  }
};

// ─────────────────────────────────────────────────────────────────
// STORAGE API
// ─────────────────────────────────────────────────────────────────
const StorageAPI = {
  async getSignedUrl(path) {
    if (_backendAvailable) {
      try {
        const data = await apiRequest('GET', `/api/v1/storage/signed-url?path=${encodeURIComponent(path)}`);
        return data?.url;
      } catch {}
    }
    return null;
  },
  async uploadProfilePicture(empId, file) {
    if (_backendAvailable) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('emp_id', empId);
        const res = await fetch(`${API_BASE}/api/v1/storage/upload-profile`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${TokenStore.get()}` },
          credentials: 'include',
          body: formData,
        });
        return res.json();
      } catch {}
    }
    return { success: false, message: 'File upload requires backend server.' };
  }
};

// ─────────────────────────────────────────────────────────────────
// PDF API
// ─────────────────────────────────────────────────────────────────
const PDFAPI = {
  async downloadPayslip(empId, monthYear) {
    if (_backendAvailable) {
      try {
        const blob = await apiRequest('GET', `/api/v1/pdf/payslip?emp_id=${empId}&month_year=${monthYear}`);
        if (blob) triggerDownload(blob, `Payslip_${empId}_${monthYear}.pdf`, 'application/pdf');
        return;
      } catch {}
    }
    // Fallback: trigger print dialog
    window.print();
  }
};

// ─────────────────────────────────────────────────────────────────
// UTILITY: Trigger browser file download from Blob
// ─────────────────────────────────────────────────────────────────
function triggerDownload(blob, filename, mimeType) {
  const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob], { type: mimeType }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────
// LOCAL DATABASE SHIM — ApiDatabase
// ─────────────────────────────────────────────────────────────────
class ApiDatabase {
  constructor() {
    this.cache = {
      organizations: [],
      employees: {},       // org_id -> employee array
      attendance: {},      // `org_id_monthYear` -> attendance array
      ledger: {},          // org_id -> { [monthYear]: run }
      schemas: {},         // org_id -> schema
      employeeSelf: null
    };
  }

  async preloadAll(orgId, monthYear, empId, role) {
    try {
      // Check backend availability first
      await checkBackendAvailability();

      // 1. Load organizations
      const orgsRes = await OrgsAPI.getAll();
      this.cache.organizations = Array.isArray(orgsRes) ? orgsRes : (orgsRes?.data || []);
      if (this.cache.organizations.length === 0) {
        this.cache.organizations = lsOrgs();
      }

      if (role === 'ERP') {
        for (const org of this.cache.organizations) {
          const oId = org.org_id;
          const empsRes = await EmployeesAPI.getAll(oId);
          this.cache.employees[oId] = Array.isArray(empsRes) ? empsRes : (empsRes?.data || lsEmployees().filter(e => e.org_id === oId));
          this._loadLedgerForOrg(oId, monthYear);
        }
      } else if (role === 'HR') {
        const oId = orgId || window.state?.currentOrgId;
        if (oId) {
          const empsRes = await EmployeesAPI.getAll(oId);
          this.cache.employees[oId] = Array.isArray(empsRes) ? empsRes : (empsRes?.data || lsEmployees().filter(e => e.org_id === oId));

          const schemaRes = await AttendanceAPI.getSchema(oId);
          this.cache.schemas[oId] = schemaRes?.schema || schemaRes || { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 };

          const my = monthYear || window.state?.activeMonthYear;
          if (my) {
            const attRes = await AttendanceAPI.get(oId, my);
            this.cache.attendance[`${oId}_${my}`] = Array.isArray(attRes) ? attRes : (attRes?.data || lsAttendance(oId, my));
          }
          await this._loadLedgerForOrg(oId, monthYear);
        }
      } else if (role === 'Employee') {
        const oId = orgId || window.state?.currentOrgId;
        const eId = empId || window.state?.currentEmployeeId;
        if (eId) {
          const selfRes = await EmployeesAPI.get(eId);
          this.cache.employeeSelf = selfRes || lsEmployees().find(e => e.emp_id === eId);
        }
        if (oId) {
          await this._loadLedgerForOrg(oId, monthYear);
        }
      }
    } catch (err) {
      console.error('[ApiDatabase] Preload failed, using local fallback:', err);
      this._loadFromLocalStorage(orgId, monthYear, role);
    }
  }

  async _loadLedgerForOrg(orgId, monthYear) {
    try {
      const ledgerListRes = await PayrollAPI.getLedger(orgId);
      const ledgerObj = {};
      const listData = Array.isArray(ledgerListRes) ? ledgerListRes : (ledgerListRes?.data || []);

      if (Array.isArray(listData) && listData.length > 0) {
        for (const run of listData) {
          const myRun = run.month_year;
          try {
            if (run.records) {
              // Data already fully included
              ledgerObj[myRun] = { status: 'Locked', approved_by: run.approved_by || 'HR Admin', approved_date: run.approved_date || run.locked_at, records: run.records, adjustments_log: run.adjustments_log || [] };
            } else {
              const details = await PayrollAPI.getLedgerMonth(orgId, myRun);
              if (details) {
                ledgerObj[myRun] = { status: 'Locked', approved_by: run.approved_by || 'HR Admin', approved_date: run.locked_at, records: details.records || [], adjustments_log: [] };
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch payroll run ${myRun}:`, err);
          }
        }
      }

      // Merge with any local ledger data
      const localLedger = lsLedger(orgId);
      this.cache.ledger[orgId] = { ...localLedger, ...ledgerObj };
    } catch (err) {
      this.cache.ledger[orgId] = lsLedger(orgId);
    }
  }

  _loadFromLocalStorage(orgId, monthYear, role) {
    this.cache.organizations = lsOrgs();
    const orgs = this.cache.organizations;

    if (role === 'ERP') {
      orgs.forEach(org => {
        this.cache.employees[org.org_id] = lsEmployees().filter(e => e.org_id === org.org_id);
        this.cache.ledger[org.org_id] = lsLedger(org.org_id);
      });
    } else if (role === 'HR') {
      const oId = orgId;
      if (oId) {
        this.cache.employees[oId] = lsEmployees().filter(e => e.org_id === oId);
        this.cache.ledger[oId] = lsLedger(oId);
        const schemas = lsSchemas();
        this.cache.schemas[oId] = schemas[oId] || { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 };
        if (monthYear) {
          this.cache.attendance[`${oId}_${monthYear}`] = lsAttendance(oId, monthYear);
        }
      }
    } else if (role === 'Employee') {
      const oId = orgId;
      const empId = window.state?.currentEmployeeId;
      if (empId) this.cache.employeeSelf = lsEmployees().find(e => e.emp_id === empId) || null;
      if (oId) this.cache.ledger[oId] = lsLedger(oId);
    }
  }

  async preloadOrgsOnly() {
    try {
      await checkBackendAvailability();
      const orgsRes = await OrgsAPI.getAll();
      this.cache.organizations = Array.isArray(orgsRes) ? orgsRes : (orgsRes?.data || []);
      if (this.cache.organizations.length === 0) {
        this.cache.organizations = lsOrgs();
      }
    } catch (err) {
      console.warn('[ApiDatabase] preloadOrgsOnly fallback:', err);
      this.cache.organizations = lsOrgs();
    }
  }

  // ── Employees ──────────────────────────────────────────────────
  getEmployees(orgId) {
    const oId = orgId || window.state?.currentOrgId;
    const cached = this.cache.employees[oId];
    if (cached && cached.length > 0) return cached;
    // Direct fallback
    return lsEmployees().filter(e => e.org_id === oId);
  }
  getEmployee(empId) {
    if (window.state?.currentRole === 'Employee') {
      return this.cache.employeeSelf || lsEmployees().find(e => e.emp_id === empId) || null;
    }
    for (const emps of Object.values(this.cache.employees)) {
      const found = emps.find(e => e.emp_id === empId);
      if (found) return found;
    }
    return lsEmployees().find(e => e.emp_id === empId) || null;
  }
  async createEmployee(employee) {
    const res = await EmployeesAPI.create(employee);
    const oId = employee.org_id || window.state?.currentOrgId;
    if (!this.cache.employees[oId]) this.cache.employees[oId] = [];
    this.cache.employees[oId].push(employee);
    return res;
  }
  async updateEmployee(empId, data) {
    const res = await EmployeesAPI.update(empId, data);
    const oId = data.org_id || window.state?.currentOrgId;
    if (this.cache.employees[oId]) {
      const idx = this.cache.employees[oId].findIndex(e => e.emp_id === empId);
      if (idx !== -1) this.cache.employees[oId][idx] = { ...this.cache.employees[oId][idx], ...data };
    }
    if (window.state?.currentRole === 'Employee' && window.state?.currentEmployeeId === empId) {
      this.cache.employeeSelf = { ...this.cache.employeeSelf, ...data };
    }
    return res;
  }
  async deleteEmployee(empId) {
    const res = await EmployeesAPI.deactivate(empId);
    const oId = window.state?.currentOrgId;
    if (this.cache.employees[oId]) {
      const idx = this.cache.employees[oId].findIndex(e => e.emp_id === empId);
      if (idx !== -1) this.cache.employees[oId][idx].status = 'Inactive';
    }
    return res;
  }
  async bulkUpload(rows) {
    return EmployeesAPI.bulkUpload(rows);
  }

  // ── Organizations ──────────────────────────────────────────────
  getOrganizations() {
    if (this.cache.organizations && this.cache.organizations.length > 0) return this.cache.organizations;
    return lsOrgs();
  }
  async createOrganization(org) {
    const res = await OrgsAPI.create(org);
    this.cache.organizations.push(org);
    return res;
  }

  // ── Schemas ────────────────────────────────────────────────────
  getSchema(orgId) {
    const oId = orgId || window.state?.currentOrgId;
    return this.cache.schemas[oId] || { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 };
  }
  async saveSchema(orgId, schema) {
    const res = await AttendanceAPI.saveSchema(orgId, schema);
    this.cache.schemas[orgId] = schema;
    return res;
  }

  // ── Attendance ─────────────────────────────────────────────────
  getAttendance(orgId, monthYear) {
    const oId = orgId || window.state?.currentOrgId;
    const my = monthYear || window.state?.activeMonthYear;
    const cached = this.cache.attendance[`${oId}_${my}`];
    if (cached && cached.length > 0) return cached;
    return lsAttendance(oId, my);
  }
  async saveAttendance(orgId, monthYear, records) {
    const res = await AttendanceAPI.upload(orgId, monthYear, records);
    const formatted = records.map(r => ({
      emp_id: r.emp_id,
      name: r.name || '',
      month_year: monthYear,
      days: r.days,
      ot: r.ot || 0
    }));
    this.cache.attendance[`${orgId}_${monthYear}`] = formatted;
    return res;
  }

  // ── Payroll Ledger ─────────────────────────────────────────────
  getPayrollLedger(orgId) {
    const oId = orgId || window.state?.currentOrgId;
    const cached = this.cache.ledger[oId];
    if (cached && Object.keys(cached).length > 0) return cached;
    return lsLedger(oId);
  }
  async savePayrollRun(orgId, monthYear, runData) {
    if (runData.status === 'Locked') {
      const res = await PayrollAPI.lock(orgId, monthYear, runData.records);
      if (!this.cache.ledger[orgId]) this.cache.ledger[orgId] = {};
      this.cache.ledger[orgId][monthYear] = {
        status: 'Locked',
        approved_by: runData.approved_by || 'HR Admin',
        approved_date: runData.approved_date || new Date().toISOString().split('T')[0],
        records: runData.records,
        adjustments_log: runData.adjustments_log || []
      };
      return res;
    }
    return Promise.resolve({ success: true, draft: true });
  }

  // ── Legacy getTable / saveTable Shims ────────────────────────────
  getTable(tableName) {
    if (tableName === 'organizations') {
      return this.getOrganizations();
    }
    if (tableName === 'employees') {
      const fromCache = Object.values(this.cache.employees).flat();
      return fromCache.length > 0 ? fromCache : lsEmployees();
    }
    if (tableName === 'attendance') {
      const att = {};
      for (const [key, records] of Object.entries(this.cache.attendance)) {
        const parts = key.split('_');
        const my = parts.pop();
        const oId = parts.join('_');
        if (!att[oId]) att[oId] = {};
        att[oId][my] = records;
      }
      return att;
    }
    if (tableName === 'payroll_ledger') {
      return this.cache.ledger || {};
    }
    if (tableName === 'schemas') {
      return this.cache.schemas || {};
    }
    return [];
  }

  async saveTable(tableName, data) {
    if (tableName === 'employees') {
      // Save to localStorage
      LS.set('symbiosis_employees', data);
      // Update cache
      const grouped = {};
      data.forEach(emp => {
        if (!grouped[emp.org_id]) grouped[emp.org_id] = [];
        grouped[emp.org_id].push(emp);
      });
      Object.assign(this.cache.employees, grouped);
      window.dispatchEvent(new Event('databaseUpdated'));
      return { success: true };
    }
    if (tableName === 'organizations') {
      LS.set('symbiosis_orgs', data);
      this.cache.organizations = data;
      const activeOrgId = window.state?.currentOrgId;
      const modifiedOrg = data.find(o => o.org_id === activeOrgId || o.legacy_id === activeOrgId);
      if (modifiedOrg && _backendAvailable) {
        try { await OrgsAPI.update(modifiedOrg.org_id, modifiedOrg); } catch {}
      }
    }
  }
}

// Replace the old db instance — all existing code using db.* will work
const db = new ApiDatabase();

export {
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
};
