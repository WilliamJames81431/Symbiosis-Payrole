'use strict';

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 20,                       // maximum number of clients in the pool
  idleTimeoutMillis: 30000,      // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection cannot be acquired
  allowExitOnIdle: false,
});

// Log pool errors to prevent crashes on unexpected client failures
db.on('error', (err) => {
  console.error('[pg-pool] Unexpected error on idle client', err);
});

// Verify connectivity on startup (non-fatal: only warns)
db.connect()
  .then((client) => {
    console.log('[pg-pool] Connected to PostgreSQL successfully');
    client.release();
  })
  .catch((err) => {
    console.error('[pg-pool] Initial connection check failed:', err.message);
  });

module.exports = db;
