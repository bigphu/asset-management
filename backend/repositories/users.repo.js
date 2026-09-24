const db = require('../db/pool');

/**
 * Returns the id of the user with `email`, creating it on first use.
 *
 * `password_hash` is '!', a value no password hash can take, so this account
 * cannot log in once authentication exists — it only attributes writes.
 */
async function ensureUser({ email, displayName }) {
  const { rows } = await db.query(
    `WITH inserted AS (
       INSERT INTO fw_users (email, password_hash, display_name, role)
       VALUES ($1, '!', $2, 'asset_manager')
       ON CONFLICT (email) DO NOTHING
       RETURNING id, display_name
     )
     SELECT id, display_name FROM inserted
     UNION ALL
     SELECT id, display_name FROM fw_users WHERE email = $1
     LIMIT 1`,
    [email, displayName],
  );
  return { id: rows[0].id, displayName: rows[0].display_name };
}

module.exports = { ensureUser };
