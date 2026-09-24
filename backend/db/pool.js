const { Pool, types } = require('pg');
const config = require('../config');

// DATE columns (OID 1082) stay 'YYYY-MM-DD' strings. The default parser turns
// them into a JS Date at local midnight, which shifts the day across time zones.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  ...config.db,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// An idle client losing its connection (e.g. Postgres restart) must not crash
// the process; the pool discards it and the next query reconnects.
pool.on('error', (err) => {
  console.error('Idle PostgreSQL client error:', err.message);
});

function query(text, params) {
  return pool.query(text, params);
}

/**
 * Runs `work(client)` inside BEGIN/COMMIT on one checked-out client and rolls
 * back on any error. Deferred constraint triggers (export profile columns) fire
 * at COMMIT, so their errors surface from here too.
 */
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
