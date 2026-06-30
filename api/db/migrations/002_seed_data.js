/**
 * Symbiosis HR Payroll System
 * Migration 002: Seed Data
 * Run: node db/migrations/002_seed_data.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const SALT_ROUNDS = 12;
const ENC_KEY = process.env.FIELD_ENCRYPTION_KEY || process.env.DB_ENCRYPTION_KEY;

// ── Source data from prototype ────────────────────────────────────
const ORGS = [
  { legacy_id: 'org_tata',     name: 'Tata Consultancy Services (TCS)',   epf_rate: 12, minimum_wage: 12000, basic_pct: 60, ot_rate: 250, state_pt: 'telangana' },
  { legacy_id: 'org_infy',     name: 'Infosys Technologies Ltd',          epf_rate: 12, minimum_wage: 10000, basic_pct: 50, ot_rate: 200, state_pt: 'karnataka' },
  { legacy_id: 'org_reliance', name: 'Reliance Industries Limited',       epf_rate: 12, minimum_wage: 15000, basic_pct: 55, ot_rate: 300, state_pt: 'maharashtra' }
];

const EMPLOYEES = [
  { emp_id:'EMP101', org:'org_tata',     name:'Aarav Sharma',    doj:'2024-01-15', exit_date:null,       ctc:80000,  dept:'Engineering',     desig:'Lead Developer',       bank:'HDFC 9876543210',    epf:true,  esi:false, status:'Active', tds:null,  rent:12000, c80:45000,  d80:12500, other:0,     lpan:'ABCDE1234F', pan:'ABCDE1234F', aadhaar:'123456789012' },
  { emp_id:'EMP102', org:'org_tata',     name:'Priya Patel',     doj:'2026-06-05', exit_date:null,       ctc:45000,  dept:'Marketing',       desig:'Graphic Designer',     bank:'ICICI 1234567890',   epf:true,  esi:false, status:'Active', tds:5,     rent:0,     c80:0,      d80:0,     other:0,     lpan:'',           pan:'XYZAB5678C', aadhaar:'987654321098' },
  { emp_id:'EMP103', org:'org_tata',     name:'Rohan Das',       doj:'2023-03-10', exit_date:'2026-06-20', ctc:20000, dept:'Operations',    desig:'Operations Executive', bank:'SBI 1122334455',     epf:false, esi:true,  status:'Active', tds:0,     rent:0,     c80:0,      d80:0,     other:0,     lpan:'',           pan:'LMNOP1234Q', aadhaar:'111122223333' },
  { emp_id:'EMP104', org:'org_tata',     name:'Ananya Iyer',     doj:'2025-11-01', exit_date:null,       ctc:150000, dept:'Human Resources', desig:'HR Director',         bank:'Axis 5566778899',    epf:true,  esi:false, status:'Active', tds:null,  rent:25000, c80:120000, d80:25000, other:15000, lpan:'PQRST5678U', pan:'PQRST5678U', aadhaar:'555566667777' },
  { emp_id:'EMP105', org:'org_tata',     name:'Kabir Malhotra',  doj:'2026-06-25', exit_date:null,       ctc:18000,  dept:'Customer Support', desig:'Support Associate',   bank:'HDFC 4455667788',    epf:true,  esi:true,  status:'Active', tds:0,     rent:0,     c80:0,      d80:0,     other:0,     lpan:'',           pan:'DEFGH9012I', aadhaar:'888899990000' },
  { emp_id:'EMP201', org:'org_infy',     name:'Vikram Singh',    doj:'2022-05-18', exit_date:null,       ctc:95000,  dept:'Engineering',     desig:'Principal Architect',  bank:'ICICI 9090909090',   epf:true,  esi:false, status:'Active', tds:12,    rent:15000, c80:30000,  d80:5000,  other:0,     lpan:'JKLM9012N',  pan:'JKLM9012N',  aadhaar:'222233334444' },
  { emp_id:'EMP202', org:'org_infy',     name:'Sneha Rao',       doj:'2026-06-12', exit_date:null,       ctc:19000,  dept:'Operations',      desig:'Helpdesk Officer',     bank:'SBI 8080808080',     epf:false, esi:true,  status:'Active', tds:0,     rent:0,     c80:0,      d80:0,     other:0,     lpan:'',           pan:'OPQRS3456T', aadhaar:'777788889999' }
];

const USERS = [
  { username:'admin',   email:'admin@symbiosishr.in',   password:'admin123', role:'ERP',      org:null,         emp:null      },
  { username:'hr_tata', email:'hr@tcs.symbiosishr.in',  password:'hr123',    role:'HR',       org:'org_tata',   emp:null      },
  { username:'hr_infy', email:'hr@infy.symbiosishr.in', password:'hr123',    role:'HR',       org:'org_infy',   emp:null      },
  { username:'EMP101',  email:'aarav@tcs.symbiosishr.in',  password:'emp123', role:'Employee', org:'org_tata',  emp:'EMP101'  },
  { username:'EMP102',  email:'priya@tcs.symbiosishr.in',  password:'emp123', role:'Employee', org:'org_tata',  emp:'EMP102'  },
  { username:'EMP104',  email:'ananya@tcs.symbiosishr.in', password:'emp123', role:'Employee', org:'org_tata',  emp:'EMP104'  },
  { username:'EMP201',  email:'vikram@infy.symbiosishr.in',password:'emp123', role:'Employee', org:'org_infy',  emp:'EMP201'  },
];

// June 2026 attendance for TCS
const ATTENDANCE_JUNE = {
  'org_tata': {
    '2026-06': [
      { emp_id:'EMP101', days:['P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P'], ot:10 },
      { emp_id:'EMP102', days:['A','A','A','A','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P'], ot:0  },
      { emp_id:'EMP103', days:['P','P','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','A','A','A','A','A','A','A','A','A','A','A'],   ot:5  },
      { emp_id:'EMP104', days:['P','P','P','P','P','WO','WO','EL','EL','P','P','P','WO','WO','P','P','P','P','P','WO','WO','P','P','P','P','P','A','A','P','P'], ot:0 },
      { emp_id:'EMP105', days:['A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','P','WO','WO','P'],   ot:2  },
    ]
  }
};

async function migrate() {
  const client = await pool.connect();
  console.log('🚀 Starting seed migration...\n');

  try {
    await client.query('BEGIN');

    // ── Step 1: Organizations ───────────────────────────────────────
    console.log('📦 Inserting organizations...');
    const orgIdMap = {};
    for (const org of ORGS) {
      const { rows } = await client.query(
        `INSERT INTO organizations (legacy_id, name, epf_rate, minimum_wage, basic_pct, ot_rate, state_pt)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (legacy_id) DO UPDATE SET name = EXCLUDED.name
         RETURNING org_id`,
        [org.legacy_id, org.name, org.epf_rate, org.minimum_wage, org.basic_pct, org.ot_rate, org.state_pt]
      );
      orgIdMap[org.legacy_id] = rows[0].org_id;
      console.log(`  ✅ ${org.name} → ${rows[0].org_id}`);
    }

    // ── Step 2: Employees (with encrypted PAN/Aadhaar) ─────────────
    console.log('\n👤 Inserting employees with encrypted PAN/Aadhaar...');
    for (const emp of EMPLOYEES) {
      const org_id = orgIdMap[emp.org];
      await client.query(
        `INSERT INTO employees (
           emp_id, org_id, name, doj, exit_date, ctc, department, designation,
           bank_account, epf_eligible, esi_eligible, status, tds_rate,
           rent_paid, tax_80c, tax_80d, other_income, landlord_pan,
           pan_encrypted, aadhaar_encrypted
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
           pgp_sym_encrypt($19, $21),
           pgp_sym_encrypt($20, $21)
         )
         ON CONFLICT (emp_id, org_id) DO UPDATE SET
           name = EXCLUDED.name, ctc = EXCLUDED.ctc, status = EXCLUDED.status`,
        [
          emp.emp_id, org_id, emp.name, emp.doj, emp.exit_date,
          emp.ctc, emp.dept, emp.desig, emp.bank,
          emp.epf, emp.esi, emp.status, emp.tds,
          emp.rent, emp.c80, emp.d80, emp.other, emp.lpan,
          emp.pan || '', emp.aadhaar || '', ENC_KEY
        ]
      );
      console.log(`  ✅ ${emp.name} (${emp.emp_id}) → org ${emp.org}`);
    }

    // ── Step 3: Users (with bcrypt-hashed passwords) ───────────────
    console.log('\n🔐 Inserting users with bcrypt hashes...');
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      const org_id = u.org ? orgIdMap[u.org] : null;
      await client.query(
        `INSERT INTO users (username, email, password_hash, role, org_id, emp_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (username) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           org_id = EXCLUDED.org_id`,
        [u.username, u.email, hash, u.role, org_id, u.emp]
      );
      console.log(`  ✅ ${u.username} (${u.role}) → hash created`);
    }

    // ── Step 4: Attendance Records ─────────────────────────────────
    console.log('\n📅 Inserting June 2026 attendance...');
    for (const [orgLegacyId, months] of Object.entries(ATTENDANCE_JUNE)) {
      const org_id = orgIdMap[orgLegacyId];
      for (const [monthYear, records] of Object.entries(months)) {
        for (const rec of records) {
          // Insert each day as a row
          for (let i = 0; i < rec.days.length; i++) {
            await client.query(
              `INSERT INTO attendance_records (org_id, emp_id, month_year, day_index, status_code)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (org_id, emp_id, month_year, day_index) DO UPDATE SET status_code = EXCLUDED.status_code`,
              [org_id, rec.emp_id, monthYear, i + 1, rec.days[i]]
            );
          }
          // Insert OT record
          if (rec.ot > 0) {
            await client.query(
              `INSERT INTO overtime_records (org_id, emp_id, month_year, ot_hours)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (org_id, emp_id, month_year) DO UPDATE SET ot_hours = EXCLUDED.ot_hours`,
              [org_id, rec.emp_id, monthYear, rec.ot]
            );
          }
        }
        console.log(`  ✅ ${orgLegacyId} / ${monthYear} → ${records.length} employee attendance records`);
      }
    }

    // ── Step 5: Locked May 2026 Payroll for TCS ───────────────────
    console.log('\n💰 Inserting locked May 2026 payroll for TCS...');
    const tcsOrgId = orgIdMap['org_tata'];
    const hrUser = await client.query(
      `SELECT user_id FROM users WHERE username = 'hr_tata' LIMIT 1`
    );
    const hrUserId = hrUser.rows[0]?.user_id;

    const { rows: [run] } = await client.query(
      `INSERT INTO payroll_runs (org_id, month_year, status, approved_by, approved_at)
       VALUES ($1, '2026-05', 'Locked', $2, '2026-05-31T18:00:00Z')
       ON CONFLICT (org_id, month_year) DO UPDATE SET status = 'Locked'
       RETURNING id`,
      [tcsOrgId, hrUserId]
    );

    const MAY_RECORDS = [
      { emp_id:'EMP101', name:'Aarav Sharma',  ctc:80000,  pd:31, td:31, gross:82500, basic:48000, hra:20000, da:4000, conv:4000, med:4000, pf_e:1800, pf_er:1800, esi_e:0, esi_er:0, pt:200, lwf:15, tds:8200, ot:2500, bonus:0, adj:0, net:72285 },
      { emp_id:'EMP103', name:'Rohan Das',     ctc:20000,  pd:31, td:31, gross:20000, basic:11000, hra:5000,  da:1000, conv:1000, med:1000, pf_e:0,    pf_er:0,    esi_e:150, esi_er:650, pt:150, lwf:15, tds:0, ot:1250, bonus:0, adj:0, net:19685 },
    ];

    for (const r of MAY_RECORDS) {
      await client.query(
        `INSERT INTO payroll_records
         (run_id, org_id, emp_id, name, ctc, payable_days, total_days, gross,
          basic, hra, da, conveyance, medical,
          pf_employee, pf_employer, esi_employee, esi_employer,
          pt, lwf, tds, ot_pay, bonus, adjustments, net)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
         ON CONFLICT DO NOTHING`,
        [run.id, tcsOrgId, r.emp_id, r.name, r.ctc, r.pd, r.td, r.gross,
         r.basic, r.hra, r.da, r.conv, r.med,
         r.pf_e, r.pf_er, r.esi_e, r.esi_er,
         r.pt, r.lwf, r.tds, r.ot, r.bonus, r.adj, r.net]
      );
    }
    console.log(`  ✅ May 2026 TCS payroll locked (run_id: ${run.id})`);

    // ── Step 6: CSV Column Schemas ─────────────────────────────────
    console.log('\n🗂️  Inserting default CSV column schemas...');
    const defaultSchema = { emp_id: 0, employee_name: 1, D1: 2, overtime_hours: 33 };
    for (const legacyId of ['org_tata', 'org_infy']) {
      const org_id = orgIdMap[legacyId];
      await client.query(
        `INSERT INTO csv_column_schemas (org_id, schema_json)
         VALUES ($1, $2)
         ON CONFLICT (org_id) DO UPDATE SET schema_json = EXCLUDED.schema_json`,
        [org_id, JSON.stringify(defaultSchema)]
      );
    }
    console.log('  ✅ Column schemas inserted');

    await client.query('COMMIT');
    console.log('\n✨ Seed migration completed successfully!\n');
    console.log('Default credentials:');
    console.log('  ERP Admin : admin / admin123');
    console.log('  HR (TCS)  : hr_tata / hr123');
    console.log('  HR (Infy) : hr_infy / hr123');
    console.log('  Employee  : EMP101 / emp123');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
