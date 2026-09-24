const express = require('express');
const { notFound, errorHandler } = require('./errors');

const router = express.Router();

// JSON API mounted at /api. The nginx gateway forwards /api/* here unchanged,
// so these paths are the public ones.
const ROUTES = [
  ['/health', require('./routes/health')],
  ['/reference-data', require('./routes/referenceData')],
  ['/assets', require('./routes/assets')],
  ['/export-profiles', require('./routes/exportProfiles')],
  ['/exports', require('./routes/exports')],
];

// Parsed here rather than app-wide so a malformed body reaches this router's
// JSON error handler instead of the scaffold's HTML error page.
router.use(express.json({ limit: '1mb' }));

for (const [path, handler] of ROUTES) router.use(path, handler);

// Anything else under /api answers in JSON, never with the HTML error page.
router.use(notFound);
router.use(errorHandler);

module.exports = router;
module.exports.ROUTES = ROUTES;
