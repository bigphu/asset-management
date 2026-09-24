/**
 * Saved export profiles (S-04): per-user database records (ADR-0013). Every
 * query is scoped by `owner_user_id`, so a profile owned by someone else
 * behaves exactly like one that does not exist (404).
 */

const db = require('../db/pool');
const { ApiError } = require('../api/errors');

// API field keys <-> export_profile_columns.field_key (CHECK-constrained).
const FIELD_TO_COLUMN = {
  tag: 'asset_tag',
  name: 'name',
  type: 'asset_type',
  status: 'asset_status',
  location: 'location',
  purchaseDate: 'purchase_date',
};
const COLUMN_TO_FIELD = Object.fromEntries(Object.entries(FIELD_TO_COLUMN).map(([k, v]) => [v, k]));

// API date formats <-> export_date_format enum.
const FORMAT_TO_ENUM = {
  'YYYY-MM-DD': 'iso',
  'DD/MM/YYYY': 'day_month_year',
  'MM/DD/YYYY': 'month_day_year',
};
const ENUM_TO_FORMAT = Object.fromEntries(Object.entries(FORMAT_TO_ENUM).map(([k, v]) => [v, k]));

const SELECT_PROFILE = `
  SELECT p.id,
         p.name::text AS name,
         p.date_format,
         p.created_at,
         p.updated_at,
         COALESCE(
           json_agg(json_build_object('key', c.field_key, 'label', c.header_label) ORDER BY c.ordinal)
             FILTER (WHERE c.field_key IS NOT NULL),
           '[]'
         ) AS columns
    FROM export_profiles p
    LEFT JOIN export_profile_columns c ON c.profile_id = p.id`;

function fromRow(row) {
  return {
    ...row,
    date_format: ENUM_TO_FORMAT[row.date_format],
    columns: row.columns.map((col) => ({ key: COLUMN_TO_FIELD[col.key], label: col.label })),
  };
}

function profileNotFound() {
  return new ApiError(404, 'NOT_FOUND', 'Export profile not found');
}

async function listProfiles(ownerId) {
  const { rows } = await db.query(
    `${SELECT_PROFILE} WHERE p.owner_user_id = $1 GROUP BY p.id ORDER BY p.name, p.id`,
    [ownerId],
  );
  return rows.map(fromRow);
}

async function findProfile(id, ownerId, client = db) {
  const { rows } = await client.query(
    `${SELECT_PROFILE} WHERE p.id = $1 AND p.owner_user_id = $2 GROUP BY p.id`,
    [id, ownerId],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}

/** Writes the included columns as ordinals 1..N — the contiguity the deferred trigger checks at COMMIT. */
async function insertColumns(client, profileId, columns) {
  for (const [index, col] of columns.entries()) {
    await client.query(
      `INSERT INTO export_profile_columns (profile_id, field_key, ordinal, header_label)
       VALUES ($1, $2, $3, $4)`,
      [profileId, FIELD_TO_COLUMN[col.key], index + 1, col.label],
    );
  }
}

// Profile names are unique per owner, case-insensitively (citext).
function translateDuplicateName(err, name) {
  if (err.code === '23505' && err.constraint === 'uq_export_profiles_owner_name') {
    const message = `You already have a profile named "${name}".`;
    return new ApiError(409, 'DUPLICATE_NAME', message, { name: message });
  }
  return err;
}

async function createProfile(ownerId, input) {
  try {
    return await db.withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO export_profiles (owner_user_id, name, date_format)
         VALUES ($1, $2, $3) RETURNING id`,
        [ownerId, input.name, FORMAT_TO_ENUM[input.dateFormat]],
      );
      await insertColumns(client, rows[0].id, input.columns);
      return findProfile(rows[0].id, ownerId, client);
    });
  } catch (err) {
    throw translateDuplicateName(err, input.name);
  }
}

/** Full replacement of name, date format and columns. */
async function updateProfile(id, ownerId, input) {
  try {
    return await db.withTransaction(async (client) => {
      const { rowCount } = await client.query(
        `UPDATE export_profiles SET name = $3, date_format = $4
          WHERE id = $1 AND owner_user_id = $2`,
        [id, ownerId, input.name, FORMAT_TO_ENUM[input.dateFormat]],
      );
      if (!rowCount) throw profileNotFound();
      await client.query('DELETE FROM export_profile_columns WHERE profile_id = $1', [id]);
      await insertColumns(client, id, input.columns);
      return findProfile(id, ownerId, client);
    });
  } catch (err) {
    throw translateDuplicateName(err, input.name);
  }
}

/** Hard delete — the schema frees the name for reuse; columns cascade. */
async function deleteProfile(id, ownerId) {
  const { rowCount } = await db.query(
    'DELETE FROM export_profiles WHERE id = $1 AND owner_user_id = $2',
    [id, ownerId],
  );
  if (!rowCount) throw profileNotFound();
}

module.exports = { listProfiles, findProfile, createProfile, updateProfile, deleteProfile, profileNotFound };
