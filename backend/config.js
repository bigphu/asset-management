/**
 * Environment-derived settings, read once. Defaults match `.env.example` and
 * docker-compose.yml so a fresh checkout runs against the compose database.
 */

function int(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

module.exports = {
  port: process.env.PORT || '3000',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: int(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME || 'asset_management',
    user: process.env.DB_USER || 'asset_app',
    password: process.env.DB_PASSWORD || 'asset_app_dev',
    max: int(process.env.DB_POOL_MAX, 10),
  },
  // Stand-in identity until a story introduces authentication; see
  // api/middleware/currentUser.js.
  defaultUser: {
    email: process.env.DEFAULT_USER_EMAIL || 'asset.manager@asset-management.local',
    displayName: process.env.DEFAULT_USER_NAME || 'Asset Manager',
  },
};
