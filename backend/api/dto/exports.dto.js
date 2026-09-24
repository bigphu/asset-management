/**
 * POST /api/exports/assets body. The request fully describes the file
 * (ADR-0011): the list's filters and sort (ADR-0008 — every matching row, in
 * screen order) plus the customization parameters (ADR-0012). A saved profile
 * is applied by the client copying its columns and dateFormat into this body.
 *
 *   {
 *     "filters":    { search, type, typeNot, status, statusNot,     optional
 *                     location, locationNot } — as the list query
 *     "sort":       { "key", "direction" },                        optional
 *     "columns":    [{ "key", "label", "included" }, ...],         optional, defaults to all
 *     "dateFormat": "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"    optional
 *   }
 */

const { checkBody } = require('../validation');
const { FILTER_PARAMS, readFilters, readSort } = require('./assets.dto');
const { readColumns, readDateFormat } = require('./exportParams.dto');

function parseExportRequest(body) {
  const c = checkBody(body, ['filters', 'sort', 'columns', 'dateFormat']);
  const value = {
    filters: c.object('filters', readFilters, {
      required: false,
      allowed: FILTER_PARAMS,
    }),
    sort: c.object('sort', (s) => readSort(s, 'key', 'direction'), {
      required: false,
      allowed: ['key', 'direction'],
    }),
    columns: readColumns(c, 'columns', { required: false }),
    dateFormat: readDateFormat(c, 'dateFormat', { required: false }),
  };
  c.done();
  return { ...value, columns: value.columns.filter((col) => col.included) };
}

module.exports = { parseExportRequest };
