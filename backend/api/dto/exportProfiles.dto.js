/**
 * Export profile DTOs (S-04, ADR-0013). The shape matches the frontend's
 * `ExportProfile`: `{ id, name, dateFormat, columns: [{ key, label, included }] }`.
 *
 * Storage keeps only the included columns, in order (export_profile_columns).
 * On the way out, excluded fields are appended after them with their default
 * labels, so the editor always shows every field.
 */

const { checkBody } = require('../validation');
const { EXPORT_FIELDS, DEFAULT_LABELS, readColumns, readDateFormat } = require('./exportParams.dto');

/** Body for POST and PUT (a PUT replaces the whole profile). */
function parseProfileInput(body) {
  const c = checkBody(body, ['name', 'dateFormat', 'columns']);
  const value = {
    name: c.string('name', { max: 100 }),
    dateFormat: readDateFormat(c, 'dateFormat'),
    columns: readColumns(c, 'columns'),
  };
  c.done();
  return { ...value, columns: value.columns.filter((col) => col.included) };
}

/**
 * @param row `{ id, name, date_format, created_at, updated_at, columns: [{ key, label }] }`
 *            with `columns` already in ordinal order and `date_format` already
 *            mapped to its API spelling by the repository.
 */
function toProfileDto(row) {
  const included = row.columns.map((col) => ({
    key: col.key,
    label: col.label || DEFAULT_LABELS[col.key],
    included: true,
  }));
  const present = new Set(included.map((col) => col.key));
  const excluded = EXPORT_FIELDS.filter((key) => !present.has(key)).map((key) => ({
    key,
    label: DEFAULT_LABELS[key],
    included: false,
  }));

  return {
    id: row.id,
    name: row.name,
    dateFormat: row.date_format,
    columns: [...included, ...excluded],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { parseProfileInput, toProfileDto };
