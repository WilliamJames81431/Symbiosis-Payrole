# Symbiosis HR Payroll System — Production SaaS Prototype

This repository contains the multi-tenant prototype for the **Symbiosis HR Payroll System**, fully migrated from its legacy client-side local storage architecture to a production-grade relational SaaS model.

The system supports strict India-based labor compliance (EPF, ESI, Professional Tax, LWF), secure AES-256 KYC data encryption, tenant isolation via Row-Level Security (RLS) policies, and server-rendered PDF payslip downloads.

---

## 🏗️ Architecture Overview

The system consists of three primary components:

1. **Frontend Client (Vite + Vanilla JS):** 
   - A highly interactive Apple-style dashboard utilizing canvas charts, micro-animations, and a unified Spotlight search engine.
   - Refactored to communicate with the REST API using secure, in-memory access tokens and HTTP-only refresh cookies.
   - Integrates a synchronous preloading cache layer to support seamless, zero-latency rendering.

2. **Backend API Server (Node.js + Express):**
   - Implements JWT-based sessions, rate limiting, and RBAC (Role-Based Access Control).
   - Translates frontend roster, compliance, and attendance commands into secure PostgreSQL queries.
   - Performs all payroll calculation mathematics on the server.

3. **PDF Microservice (Node.js + Puppeteer):**
   - A separate service that takes HTML templates and renders them into high-fidelity A4 PDF documents.
   - Communicates with the API server via a secure shared secret header.

---

## 📋 System Requirements

To run this application locally, you will need:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL Database** (v15.0 or higher, or a free cloud-hosted database on [Supabase](https://supabase.com))

---

## 🚀 Local Setup Instructions

### Step 1: Database Provisioning

If using a local PostgreSQL database:
1. Ensure your database server is running.
2. Create a new database named `symbiosis_payroll`.
3. Verify that the `uuid-ossp` and `pgcrypto` extensions are enabled (the migration script will attempt to create them automatically).

If using Supabase:
1. Create a new project in Supabase.
2. Locate your database connection string in **Project Settings → Database**.

---

### Step 2: Environment Variables Configuration

Create a `.env` file in the `api` folder and the `pdf-service` folder.

#### 1. Backend API (`api/.env`):
Create `api/.env` and copy the following configuration (adjust details if using a remote database):
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/symbiosis_payroll
DB_SSL=false

# Field Encryption Key (Must be 32 bytes/characters)
FIELD_ENCRYPTION_KEY=supersecretencryptionkey123456789

# Auth Configuration
JWT_SECRET=supersecretjwtkey9876543210123456789
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS Configuration (Vite dev server runs on port 5173)
ALLOWED_ORIGINS=http://localhost:5173

# Server Configuration
PORT=3000
NODE_ENV=development

# PDF Microservice Configuration
PDF_SERVICE_URL=http://localhost:3001
PDF_SERVICE_SECRET=pdfservicesharedsecretkey123456
```

#### 2. PDF Service (`pdf-service/.env`):
Create `pdf-service/.env` and copy:
```env
PORT=3001
PDF_SERVICE_SECRET=pdfservicesharedsecretkey123456
```

---

### Step 3: Run Database Migrations & Seeds

In your terminal, navigate to the `api` folder and run the migration script to set up tables, views, triggers, and populate default seed data:

```bash
cd api
npm run migrate
```

---

### Step 4: Run the Services

Start all three components in separate terminal instances:

#### 1. Start the PDF Microservice:
```bash
cd pdf-service
npm install
npm start
```

#### 2. Start the Backend API Server:
```bash
cd api
npm install
npm run dev
```

#### 3. Start the Frontend Client:
In the project root folder:
```bash
npm install
npm run dev
```

The frontend application will be running at **`http://localhost:5173`**.

---

## 🔑 Default Credentials

The migration seed populates the database with the following demo credentials:

| Username | Password | Role | Organization Scope |
|----------|----------|------|--------------------|
| **`admin`** | `admin123` | **ERP Admin** | Cross-tenant (System-wide) |
| **`hr_tata`** | `hr123` | **HR Admin** | Tata Consultancy Services (TCS) |
| **`hr_infy`** | `hr123` | **HR Admin** | Infosys Technologies Ltd |
| **`EMP101`** | `emp123` | **Employee** | TCS (Aarav Sharma) |
| **`EMP201`** | `emp123` | **Employee** | Infosys (Vikram Singh) |

---

## 🧪 Testing Key Workflows

### 1. Multi-Tenant Session & Simulated MFA
1. Open `http://localhost:5173` in your browser.
2. Select a role (e.g. **HR**). Select **TCS** as the organization.
3. Login using `hr_tata` / `hr123`.
4. Enter the simulated OTP code (**`123456`**) to complete the MFA verification.

### 2. CSV Attendance Ingestion
1. As HR Admin, navigate to the **Attendance Ingestion** tab.
2. Click **Upload CSV** and select `sample_attendance.csv` from the root folder.
3. Map the column headers in the wizard.
4. Click **Ingest & Validate**. Any data mismatches will be flagged. Resolve them and click **Confirm**.
5. The attendance matrix will show the updated monthly attendance grid.

### 3. Payroll Calculations & Sandbox
1. Go to the **Run Payroll** tab.
2. The sandbox calculation engine will show active employees' gross salary, deductions (EPF, ESI, Professional Tax, LWF, TDS), and net salary.
3. Try adjusting an employee's variable earnings or ad-hoc adjustments in the text inputs. Ensure the charts and values update dynamically with zero latency.
4. Click **Lock Payroll Batch**. This writes immutable records to the PostgreSQL database and triggers audit logs.

### 4. PDF Payslip Download
1. Log out, then select **Employee** role.
2. Login using `EMP101` / `emp123` (Aarav Sharma).
3. In the Employee portal, navigate to the **Salary Statements & Payslips** section.
4. Find the payslip for **May 2026** (or any month you locked as HR).
5. Click **Download PDF**. The main API server will render the HTML template, send it securely to the Puppeteer service, and stream the resulting PDF document directly to your downloads.
