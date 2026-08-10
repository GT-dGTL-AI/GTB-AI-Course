/**
 * GT BHARAT — Google Apps Script backend
 * Receives registration form submissions via POST (fetch, no-cors)
 * and appends each one as a new row in a Google Sheet.
 *
 * The connected Google Sheet IS your live "CSV" — Google Sheets can be
 * downloaded/exported as .csv at any time via File > Download > CSV,
 * or read programmatically. No separate database is required.
 *
 * SETUP:
 * 1. Create a new Google Sheet, name the first tab exactly: Registrations
 * 2. Extensions > Apps Script, paste this file in as Code.gs
 * 3. Run `setupSheetHeaders` once from the Apps Script editor (see below)
 *    to write the header row automatically.
 * 4. Deploy > New deployment > type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the deployment /exec URL into js/main.js -> APPS_SCRIPT_URL
 */

const SHEET_NAME = 'Registrations';

const COLUMNS = [
  'Timestamp',
  'Full Name',
  'Email',
  'Phone',
  'College / University',
  'Degree / Course Pursuing',
  'Selected Course',
  'Base Price (INR)',
  'Coupon Code',
  'Coupon Applied',
  'Final Price (INR)',
  'Submitted At (Client ISO)'
];

/**
 * Run this ONCE manually from the Apps Script editor
 * (select this function in the dropdown, click Run) to create
 * the sheet tab (if missing) and write the header row.
 */
function setupSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, COLUMNS.length);
}

/**
 * Handles POST requests sent from the GT Bharat registration form.
 * The front-end sends JSON as a plain-text body (mode: 'no-cors'),
 * so we parse e.postData.contents manually.
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
      sheet.setFrozenRows(1);
    }

    const data = JSON.parse(e.postData.contents);

    const row = [
      new Date(),
      data.fullName || '',
      data.email || '',
      data.phone || '',
      data.college || '',
      data.degree || '',
      data.selectedPlan || '',
      data.basePrice || '',
      data.couponCode || '',
      data.couponApplied || 'No',
      data.finalPrice || '',
      data.submittedAt || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional: simple GET handler so visiting the deployed /exec URL
 * in a browser confirms the Web App is alive.
 */
function doGet(e) {
  return ContentService
    .createTextOutput('GT Bharat registration endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * OPTIONAL: Export the Registrations sheet as a downloadable CSV file
 * into a Google Drive folder. Useful if you want an actual .csv file
 * (not just the live Sheet) refreshed on a schedule.
 *
 * To use: set FOLDER_ID below to a Drive folder ID, then run this
 * function manually or attach a time-driven trigger
 * (Triggers > Add Trigger > exportRegistrationsAsCsv > Time-driven).
 */
function exportRegistrationsAsCsv() {
  const FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  const rows = sheet.getDataRange().getValues();
  const csvContent = rows
    .map(row => row.map(cell => csvEscape(cell)).join(','))
    .join('\n');

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const fileName = `gt-bharat-registrations-${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmm')}.csv`;
  folder.createFile(fileName, csvContent, MimeType.CSV);
}

function csvEscape(value) {
  const str = String(value === null || value === undefined ? '' : value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
