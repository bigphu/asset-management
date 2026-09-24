const express = require('express');
const db = require('../../db/pool');

const router = express.Router();

/**
 * Readiness probe for the nginx gateway, docker-compose and the frontend.
 * 200 when the API can reach PostgreSQL, 503 when it cannot.
 */
router.get('/', async function (req, res) {
  let database = 'up';
  try {
    await db.query('SELECT 1');
  } catch {
    database = 'down';
  }

  res.status(database === 'up' ? 200 : 503).json({
    status: database === 'up' ? 'ok' : 'degraded',
    service: 'asset-management-api',
    database,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
