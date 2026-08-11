/**
 * GT BHARAT — Google Apps Script backend
 * UPDATED: removed City field to match the current registration form.
 */

const SHEET_NAME = 'Registrations';

const COLUMNS = [
  'Timestamp',
  'Full Name',
  'Email',
  'Phone',
  'College Name',
  'Degree',
  'Selected Course',
  'Coupon Code',
  'Coupon Applied',
  'Submitted At (Client ISO)'
];

function setupSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, COLUMNS.length);
}

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
      data.couponCode || '',
      data.couponApplied || 'No',
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

function doGet() {
  return ContentService
    .createTextOutput('GT Bharat registration endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
