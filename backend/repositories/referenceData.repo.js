const db = require('../db/pool');

const TABLES = {
  types: 'asset_types',
  statuses: 'asset_statuses',
  locations: 'locations',
};

/** Active reference rows for form pickers and filters: `{ types, statuses, locations }`, each `[{ code, name }]`. */
async function listReferenceData() {
  const entries = await Promise.all(
    Object.entries(TABLES).map(async ([key, table]) => {
      const { rows } = await db.query(
        `SELECT code, name FROM ${table} WHERE is_active ORDER BY name, code`,
      );
      return [key, rows];
    }),
  );
  return Object.fromEntries(entries);
}

/**
 * Resolves the codes on an asset input to row ids. Returns `{ ids, errors }`;
 * `errors` is keyed by input field, for a 422. Only active rows can be newly
 * assigned — except `keep`, the asset's current ids, so an edit does not fail
 * merely because a value it already had was retired.
 */
async function resolveAssetCodes(client, { type, status, location }, keep = {}) {
  const { rows } = await client.query(
    `SELECT
       (SELECT id FROM asset_types    WHERE code = $1 AND (is_active OR id = $4)) AS type_id,
       (SELECT id FROM asset_statuses WHERE code = $2 AND (is_active OR id = $5)) AS status_id,
       (SELECT id FROM locations      WHERE code = $3 AND (is_active OR id = $6)) AS location_id`,
    [type, status, location, keep.typeId || null, keep.statusId || null, keep.locationId || null],
  );
  const ids = rows[0];
  const errors = {};
  if (!ids.type_id) errors.type = `Unknown asset type "${type}"`;
  if (!ids.status_id) errors.status = `Unknown asset status "${status}"`;
  if (!ids.location_id) errors.location = `Unknown location "${location}"`;
  return {
    ids: { typeId: ids.type_id, statusId: ids.status_id, locationId: ids.location_id },
    errors,
  };
}

module.exports = { listReferenceData, resolveAssetCodes };
