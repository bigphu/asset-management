const test = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');
const { buildAssetWorkbook } = require('../services/assetExport');

const rows = [
  {
    tag: 'LAP-1001',
    name: 'Dell Latitude',
    type_name: 'Laptop',
    status_name: 'Available',
    location_name: 'HQ',
    purchase_date: '2024-02-14',
  },
  {
    tag: '=1+1', // must stay text, never become a formula
    name: 'Odd tag',
    type_name: 'Monitor',
    status_name: 'Retired',
    location_name: 'Warehouse',
    purchase_date: '2023-12-31',
  },
];

async function readBack(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook.getWorksheet('Assets');
}

test('writes the chosen columns, in order, under the chosen labels', async () => {
  const buffer = await buildAssetWorkbook(rows, {
    columns: [
      { key: 'purchaseDate', label: 'Bought on' },
      { key: 'tag', label: 'Asset tag' },
    ],
    dateFormat: 'YYYY-MM-DD',
  });
  const sheet = await readBack(buffer);

  assert.deepEqual(sheet.getRow(1).values.slice(1), ['Bought on', 'Asset tag']);
  assert.equal(sheet.getRow(1).font.bold, true);
  assert.equal(sheet.rowCount, 3);
  assert.equal(sheet.getCell('B3').value, '=1+1');
});

test('dates are real date cells with the requested format, on the right day', async () => {
  for (const [dateFormat, numFmt] of [
    ['DD/MM/YYYY', 'dd/mm/yyyy'],
    ['MM/DD/YYYY', 'mm/dd/yyyy'],
    ['YYYY-MM-DD', 'yyyy-mm-dd'],
  ]) {
    const buffer = await buildAssetWorkbook(rows, {
      columns: [{ key: 'purchaseDate', label: 'Purchase Date' }],
      dateFormat,
    });
    const cell = (await readBack(buffer)).getCell('A2');
    assert.ok(cell.value instanceof Date, 'date cell holds a Date, not text');
    assert.equal(cell.value.toISOString().slice(0, 10), '2024-02-14');
    assert.equal(cell.numFmt, numFmt);
  }
});

test('an empty result still has its header row', async () => {
  const buffer = await buildAssetWorkbook([], {
    columns: [{ key: 'name', label: 'Name' }],
    dateFormat: 'DD/MM/YYYY',
  });
  const sheet = await readBack(buffer);
  assert.equal(sheet.rowCount, 1);
  assert.equal(sheet.getCell('A1').value, 'Name');
});
