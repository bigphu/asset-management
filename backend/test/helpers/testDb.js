/**
 * Recreates a throwaway database from backend/db/init/*.sql, so integration
 * tests run against the real schema (triggers, deferred constraints, seed
 * reference data) without touching the development database.
 *
 * Connection settings come from the same DB_* variables as the app; only the
 * database name is replaced. The DB user must be allowed to create databases
 * (the compose `asset_app` user is the container's superuser).
 */

const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const TEST_DB_NAME = process.env.TEST_DB_NAME || 'asset_management_test';

function connectionFor(database) {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'asset_app',
    password: process.env.DB_PASSWORD || 'asset_app_dev',
    database,
    connectionTimeoutMillis: 3000,
  };
}

/** Returns null when ready, or a reason string when the database server is unreachable. */
async function recreateTestDatabase() {
  const admin = new Client(connectionFor('postgres'));
  try {
    await admin.connect();
  } catch (err) {
    return `PostgreSQL not reachable (${err.code || err.message}); start it with \`docker compose up -d db\``;
  }
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME} WITH (FORCE)`);
    await admin.query(`CREATE DATABASE ${TEST_DB_NAME}`);
  } finally {
    await admin.end();
  }

  const client = new Client(connectionFor(TEST_DB_NAME));
  await client.connect();
  try {
    const initDir = path.join(__dirname, '..', '..', 'db', 'init');
    for (const file of fs.readdirSync(initDir).filter((f) => f.endsWith('.sql')).sort()) {
      await client.query(fs.readFileSync(path.join(initDir, file), 'utf8'));
    }
  } finally {
    await client.end();
  }

  // Point the app's pool (db/pool.js reads config at require time) at the test DB.
  process.env.DB_NAME = TEST_DB_NAME;
  return null;
}

module.exports = { recreateTestDatabase };
