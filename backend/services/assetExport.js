/**
 * Builds the asset .xlsx (S-03, S-04). Generated on the server (ADR-0006)
 * with ExcelJS (ADR-0010), fully in memory (ADR-0009), and returned in the
 * response body by the route (ADR-0007).
 *
 * Only what ADR-0012 lets the user choose varies: columns, their order,
 * header labels and the date format. Sheet name, widths and header styling
 * are application defaults here.
 */

const ExcelJS = require('exceljs');

const SHEET_NAME = 'Assets';

const COLUMN_WIDTHS = {
  tag: 16,
  name: 36,
  type: 24,
  status: 20,
  location: 24,
  purchaseDate: 16,
};

// API date format -> Excel number format. Dates are written as real date
// cells, so Excel and LibreOffice sort and filter them as dates (S-03).
const EXCEL_DATE_FORMATS = {
  'DD/MM/YYYY': 'dd/mm/yyyy',
  'MM/DD/YYYY': 'mm/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-mm-dd',
};

/** 'YYYY-MM-DD' -> Date at UTC midnight, which ExcelJS writes as that exact day. */
function toExcelDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Exported cells show display names, not codes: the file is for people
// without access to the system (S-03).
const CELL_VALUE = {
  tag: (row) => row.tag,
  name: (row) => row.name,
  type: (row) => row.type_name,
  status: (row) => row.status_name,
  location: (row) => row.location_name,
  purchaseDate: (row) => toExcelDate(row.purchase_date),
};

/**
 * @param rows       asset rows from `listAllAssets`, already filtered and sorted
 * @param columns    included columns in output order: `[{ key, label }]`
 * @param dateFormat one of the API date formats
 * @returns {Promise<Buffer>}
 */
async function buildAssetWorkbook(rows, { columns, dateFormat }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Asset Management';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(SHEET_NAME);
  sheet.columns = columns.map((col) => ({
    header: col.label,
    key: col.key,
    width: COLUMN_WIDTHS[col.key],
    style: col.key === 'purchaseDate' ? { numFmt: EXCEL_DATE_FORMATS[dateFormat] } : undefined,
  }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    const values = {};
    for (const col of columns) values[col.key] = CELL_VALUE[col.key](row);
    sheet.addRow(values);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

module.exports = { buildAssetWorkbook, EXCEL_DATE_FORMATS };
