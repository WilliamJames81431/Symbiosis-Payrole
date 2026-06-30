-- PostgreSQL initialization script
-- Run automatically when Docker container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- Create application user with limited privileges
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'symbiosis_app') THEN
    CREATE ROLE symbiosis_app WITH LOGIN PASSWORD 'symbiosis_app_pass';
  END IF;
END $$;

GRANT CONNECT ON DATABASE symbiosis_hrms TO symbiosis_app;

-- Set default timezone
SET timezone = 'Asia/Kolkata';
ALTER DATABASE symbiosis_hrms SET timezone TO 'Asia/Kolkata';

-- Platform configuration
COMMENT ON DATABASE symbiosis_hrms IS 'Symbiosis Enterprise HRMS & Payroll Platform v2.0';
