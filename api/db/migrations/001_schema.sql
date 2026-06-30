-- ═══════════════════════════════════════════════════════════════════
-- Symbiosis HR Payroll System — PostgreSQL Schema
-- Migration 001: Full Schema Setup
-- Run in Supabase SQL Editor or via psql
-- ═══════════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Helper: auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: organizations
-- Top-level tenant boundary. Every other table references org_id.
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS organizations (
  org_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id       TEXT UNIQUE,            -- migration: 'org_tata', 'org_infy'
  name            TEXT NOT NULL,
  epf_rate        NUMERIC(5,2) DEFAULT 12,
  epf_ceiling     INTEGER DEFAULT 15000,  -- EPFO statutory wage ceiling
  minimum_wage    INTEGER DEFAULT 12000,
  basic_pct       INTEGER DEFAULT 60,     -- Basic as % of CTC
  ot_rate         INTEGER DEFAULT 250,    -- OT rate per hour (INR)
  state_pt        TEXT DEFAULT 'telangana' CHECK (
                    state_pt IN ('telangana','karnataka','maharashtra','tamilnadu','westbengal')
                  ),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: users
-- All login identities: ERP admins, HR admins, employees
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID REFERENCES organizations(org_id) ON DELETE SET NULL,
  email           TEXT UNIQUE NOT NULL,
  username        TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,          -- bcrypt, NEVER stored plain
  role            TEXT NOT NULL CHECK (role IN ('ERP', 'HR', 'Employee')),
  emp_id          TEXT,                   -- links to employees.emp_id when role=Employee
  is_active       BOOLEAN DEFAULT TRUE,
  last_login      TIMESTAMPTZ,
  failed_attempts INTEGER DEFAULT 0,
  locked_until    TIMESTAMPTZ,            -- account lockout after 5 failed attempts
  refresh_token_hash TEXT,                -- Support for token rotation hash
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_org_id ON users(org_id);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: employees
-- Core employee master data.
-- SECURITY: pan and aadhaar are AES-256 encrypted using pgcrypto.
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS employees (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emp_id                TEXT NOT NULL,
  org_id                UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  doj                   DATE NOT NULL,
  exit_date             DATE,
  ctc                   NUMERIC(12,2) NOT NULL,
  department            TEXT,
  designation           TEXT,
  bank_account          TEXT,             -- mask on display, encrypt in production
  ifsc_code             TEXT,
  bank_name             TEXT,
  epf_eligible          BOOLEAN DEFAULT TRUE,
  esi_eligible          BOOLEAN DEFAULT FALSE,
  status                TEXT DEFAULT 'Active' CHECK (status IN ('Active','Inactive','Resigned','Terminated')),
  tds_rate              NUMERIC(5,2),     -- if NULL, auto-compute from slabs
  rent_paid             NUMERIC(10,2) DEFAULT 0,
  tax_80c               NUMERIC(10,2) DEFAULT 0,
  tax_80d               NUMERIC(10,2) DEFAULT 0,
  other_income          NUMERIC(10,2) DEFAULT 0,
  landlord_pan          TEXT,
  is_metro              BOOLEAN DEFAULT FALSE,

  -- 🔐 AES-256 ENCRYPTED via pgcrypto
  -- Write: pgp_sym_encrypt(value, current_setting('app.encryption_key'))
  -- Read:  pgp_sym_decrypt(column, current_setting('app.encryption_key'))
  pan_encrypted         BYTEA,
  aadhaar_encrypted     BYTEA,

  -- Media
  profile_picture_url   TEXT,            -- Supabase Storage path (not signed URL)

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(emp_id, org_id)
);

CREATE INDEX idx_employees_org_id     ON employees(org_id);
CREATE INDEX idx_employees_emp_id     ON employees(emp_id);
CREATE INDEX idx_employees_org_status ON employees(org_id, status);

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Masked view — returned to frontend (never exposes raw PAN/Aadhaar)
CREATE OR REPLACE VIEW employee_masked_view AS
SELECT
  id, emp_id, org_id, name, doj, exit_date, ctc,
  department, designation, bank_account, ifsc_code, bank_name,
  epf_eligible, esi_eligible, status, tds_rate,
  rent_paid, tax_80c, tax_80d, other_income, landlord_pan, is_metro,
  profile_picture_url, created_at, updated_at,
  CASE
    WHEN pan_encrypted IS NULL THEN ''
    ELSE SUBSTRING(
      pgp_sym_decrypt(pan_encrypted, current_setting('app.encryption_key', TRUE)),
      1, 5
    ) || 'XXXXX'
  END AS pan_masked,
  CASE
    WHEN aadhaar_encrypted IS NULL THEN ''
    ELSE 'XXXX-XXXX-' || RIGHT(
      pgp_sym_decrypt(aadhaar_encrypted, current_setting('app.encryption_key', TRUE)),
      4
    )
  END AS aadhaar_masked
FROM employees;

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: attendance_records
-- One row per employee per day per org
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS attendance_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  emp_id          TEXT NOT NULL,
  month_year      TEXT NOT NULL,          -- 'YYYY-MM'
  day_index       INTEGER NOT NULL CHECK (day_index BETWEEN 1 AND 31),
  status_code     TEXT NOT NULL CHECK (status_code IN ('P','A','WO','H','EL','CO','X')),
  uploaded_by     UUID REFERENCES users(user_id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, emp_id, month_year, day_index)
);

CREATE INDEX idx_attendance_org_month   ON attendance_records(org_id, month_year);
CREATE INDEX idx_attendance_emp_month   ON attendance_records(emp_id, month_year);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: overtime_records
-- Separate table: OT hours per employee per month
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS overtime_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  emp_id          TEXT NOT NULL,
  month_year      TEXT NOT NULL,
  ot_hours        NUMERIC(6,2) DEFAULT 0,
  uploaded_at     TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, emp_id, month_year)
);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: csv_column_schemas
-- Saved column-mapping config per org for CSV uploads
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS csv_column_schemas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  schema_json     JSONB NOT NULL,         -- { "emp_id": 0, "employee_name": 1, "D1": 2, ... }
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id)
);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: payroll_runs
-- One record per org per month — tracks Draft vs Locked status
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payroll_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  month_year      TEXT NOT NULL,          -- 'YYYY-MM'
  status          TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Locked')),
  approved_by     UUID REFERENCES users(user_id),
  approved_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, month_year)
);

CREATE INDEX idx_payroll_runs_org_month ON payroll_runs(org_id, month_year);

CREATE TRIGGER trg_payroll_runs_updated_at
  BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: payroll_records
-- Individual employee lines within a payroll run.
-- IMMUTABLE after run.status = 'Locked' (enforced by trigger below).
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payroll_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id                UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  org_id                UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  emp_id                TEXT NOT NULL,
  name                  TEXT NOT NULL,
  ctc                   NUMERIC(12,2),
  payable_days          INTEGER,
  total_days            INTEGER,
  tenure_days           INTEGER,
  gross                 NUMERIC(12,2),
  basic                 NUMERIC(12,2),
  hra                   NUMERIC(12,2),
  da                    NUMERIC(12,2),
  conveyance            NUMERIC(12,2),
  medical               NUMERIC(12,2),
  pf_employee           NUMERIC(10,2) DEFAULT 0,
  pf_employer           NUMERIC(10,2) DEFAULT 0,
  esi_employee          NUMERIC(10,2) DEFAULT 0,
  esi_employer          NUMERIC(10,2) DEFAULT 0,
  pt                    NUMERIC(10,2) DEFAULT 0,
  lwf                   NUMERIC(10,2) DEFAULT 0,
  tds                   NUMERIC(12,2) DEFAULT 0,
  ot_pay                NUMERIC(10,2) DEFAULT 0,
  bonus                 NUMERIC(10,2) DEFAULT 0,
  adjustments           NUMERIC(10,2) DEFAULT 0,
  adjustment_note       TEXT,
  net                   NUMERIC(12,2),
  pro_rata_factor       NUMERIC(6,4),
  gratuity_accrual      NUMERIC(12,2) DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payroll_records_run    ON payroll_records(run_id);
CREATE INDEX idx_payroll_records_org    ON payroll_records(org_id);
CREATE INDEX idx_payroll_records_emp    ON payroll_records(emp_id);

-- ─── Immutability guard ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION prevent_locked_payroll_modification()
RETURNS TRIGGER AS $$
DECLARE
  run_status TEXT;
BEGIN
  SELECT status INTO run_status FROM payroll_runs WHERE id = COALESCE(OLD.run_id, NEW.run_id);
  IF run_status = 'Locked' THEN
    RAISE EXCEPTION 'Cannot modify records in a Locked payroll run (run_id: %). Contact ERP admin.', COALESCE(OLD.run_id, NEW.run_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_payroll_records
BEFORE UPDATE OR DELETE ON payroll_records
FOR EACH ROW EXECUTE FUNCTION prevent_locked_payroll_modification();

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: tax_declarations
-- Form 12BB data submitted by employees
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tax_declarations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  emp_id                TEXT NOT NULL,
  financial_year        TEXT NOT NULL,      -- '2026-27'
  rent_paid             NUMERIC(10,2) DEFAULT 0,
  landlord_pan          TEXT,
  tax_80c               NUMERIC(10,2) DEFAULT 0,
  tax_80d               NUMERIC(10,2) DEFAULT 0,
  other_income          NUMERIC(10,2) DEFAULT 0,
  is_metro              BOOLEAN DEFAULT FALSE,
  submitted_by          UUID REFERENCES users(user_id),
  declaration_date      TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, emp_id, financial_year)
);

CREATE TRIGGER trg_tax_declarations_updated_at
  BEFORE UPDATE ON tax_declarations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: refresh_tokens
-- Server-side token invalidation support
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL UNIQUE,   -- sha256 of the refresh token
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: audit_log
-- Immutable append-only ledger of all significant actions
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID REFERENCES organizations(org_id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action          TEXT NOT NULL,          -- 'LOGIN', 'PAYROLL_LOCKED', 'EMPLOYEE_ADDED', etc.
  entity_type     TEXT,                   -- 'employee', 'payroll_run', 'attendance', etc.
  entity_id       TEXT,
  metadata        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_org       ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_user      ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_action    ON audit_log(action, created_at DESC);

-- Prevent deletes from audit log (immutable)
CREATE RULE no_delete_audit_log AS ON DELETE TO audit_log DO INSTEAD NOTHING;
CREATE RULE no_update_audit_log AS ON UPDATE TO audit_log DO INSTEAD NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE employees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_column_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_declarations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens     ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's org_id from JWT claim
CREATE OR REPLACE FUNCTION auth_org_id() RETURNS UUID AS $$
  SELECT (current_setting('app.current_org_id', TRUE))::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$
  SELECT current_setting('app.current_role', TRUE);
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth_emp_id() RETURNS TEXT AS $$
  SELECT current_setting('app.current_emp_id', TRUE);
$$ LANGUAGE SQL STABLE;

-- ─── employees RLS ───────────────────────────────
-- HR/ERP: see all employees in their org
CREATE POLICY hr_read_employees ON employees FOR SELECT
  USING (
    org_id = auth_org_id()
    OR auth_user_role() = 'ERP'
  );

CREATE POLICY hr_write_employees ON employees FOR ALL
  USING (
    (org_id = auth_org_id() AND auth_user_role() IN ('HR', 'ERP'))
    OR auth_user_role() = 'ERP'
  );

-- Employee: can only see their own record
CREATE POLICY employee_self_read ON employees FOR SELECT
  USING (
    emp_id = auth_emp_id()
    AND org_id = auth_org_id()
    AND auth_user_role() = 'Employee'
  );

-- ─── attendance_records RLS ──────────────────────
CREATE POLICY tenant_attendance ON attendance_records FOR ALL
  USING (
    org_id = auth_org_id()
    OR auth_user_role() = 'ERP'
  );

-- ─── payroll_runs RLS ────────────────────────────
CREATE POLICY tenant_payroll_runs ON payroll_runs FOR ALL
  USING (
    org_id = auth_org_id()
    OR auth_user_role() = 'ERP'
  );

-- ─── payroll_records RLS ─────────────────────────
-- HR/ERP: all records in their org
CREATE POLICY hr_payroll_records ON payroll_records FOR ALL
  USING (
    (org_id = auth_org_id() AND auth_user_role() IN ('HR', 'ERP'))
    OR auth_user_role() = 'ERP'
  );

-- Employee: only their own payslip
CREATE POLICY employee_own_payslip ON payroll_records FOR SELECT
  USING (
    emp_id = auth_emp_id()
    AND org_id = auth_org_id()
    AND auth_user_role() = 'Employee'
  );

-- ─── csv_column_schemas RLS ──────────────────────
CREATE POLICY tenant_schemas ON csv_column_schemas FOR ALL
  USING (
    org_id = auth_org_id()
    OR auth_user_role() = 'ERP'
  );

-- ─── tax_declarations RLS ────────────────────────
CREATE POLICY hr_tax_declarations ON tax_declarations FOR ALL
  USING (
    (org_id = auth_org_id() AND auth_user_role() IN ('HR', 'ERP'))
    OR auth_user_role() = 'ERP'
  );

CREATE POLICY employee_own_declaration ON tax_declarations FOR ALL
  USING (
    emp_id = auth_emp_id()
    AND org_id = auth_org_id()
    AND auth_user_role() = 'Employee'
  );

-- ─── refresh_tokens RLS ──────────────────────────
CREATE POLICY user_own_tokens ON refresh_tokens FOR ALL
  USING (user_id = (current_setting('app.current_user_id', TRUE))::UUID);

-- ═══════════════════════════════════════════════════════════════════
-- SUPABASE STORAGE BUCKETS (run in Supabase Dashboard or via API)
-- ═══════════════════════════════════════════════════════════════════
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES
--   ('employee-documents', 'employee-documents', FALSE),
--   ('payslips',           'payslips',           FALSE),
--   ('org-assets',         'org-assets',          TRUE);
--
-- Folder structure: /{org_id}/{emp_id}/{filename}
-- Access: only via 5-minute signed URLs generated server-side
