/**
 * The closed set of export customizations (ADR-0012): which columns, in what
 * order, with what header labels, and a date format — nothing else. A live
 * export request carries these as parameters (ADR-0011) and a saved profile
 * stores the same parameters (ADR-0013), so both validate through here.
 */

const { Checker, isPlainObject } = require('../validation');

/** Exportable fields in the list's on-screen order — the default column order (S-03). */
const EXPORT_FIELDS = ['tag', 'name', 'type', 'status', 'location', 'purchaseDate'];

const DEFAULT_LABELS = {
  tag: 'Tag',
  name: 'Name',
  type: 'Type',
  status: 'Status',
  location: 'Location',
  purchaseDate: 'Purchase Date',
};

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';

function defaultColumns() {
  return EXPORT_FIELDS.map((key) => ({ key, label: DEFAULT_LABELS[key], included: true }));
}

/**
 * Reads `columns`: an array of `{ key, label, included }`, the shape the
 * frontend's column editor holds. Array order is column order. Excluded
 * columns may be listed (so the editor state can be sent as-is) or omitted.
 * Returns the full validated list; callers keep the included ones.
 */
function readColumns(c, name, { required = true } = {}) {
  const raw = c.input[name];
  if (raw === undefined || raw === null) return required ? c.fail(name, 'Required') : defaultColumns();
  if (!Array.isArray(raw)) return c.fail(name, 'Must be an array of columns');
  if (raw.length === 0 || raw.length > EXPORT_FIELDS.length) {
    return c.fail(name, 'Must list between 1 and ' + EXPORT_FIELDS.length + ' columns');
  }

  const seen = new Set();
  const columns = raw.map((item, index) => {
    const path = c.key(name) + '[' + index + ']';
    if (!isPlainObject(item)) {
      c.errors[path] = 'Must be an object';
      return undefined;
    }
    const col = new Checker(item, { path, allowed: ['key', 'label', 'included'] });
    const key = col.oneOf('key', EXPORT_FIELDS);
    if (key !== undefined) {
      if (seen.has(key)) col.fail('key', 'Column "' + key + '" is listed twice');
      seen.add(key);
    }
    const column = {
      key,
      label: col.string('label', { max: 100 }),
      included: item.included === undefined ? true : col.boolean('included'),
    };
    Object.assign(c.errors, col.errors);
    return column;
  });

  if (!c.ok) return undefined;
  if (!columns.some((col) => col.included)) return c.fail(name, 'Include at least one column');
  return columns;
}

function readDateFormat(c, name, { required = true } = {}) {
  return c.oneOf(name, DATE_FORMATS, { required, fallback: DEFAULT_DATE_FORMAT });
}

module.exports = {
  EXPORT_FIELDS,
  DEFAULT_LABELS,
  DATE_FORMATS,
  DEFAULT_DATE_FORMAT,
  defaultColumns,
  readColumns,
  readDateFormat,
};
