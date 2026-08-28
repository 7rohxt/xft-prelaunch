/**
 * Xing Fu Tang — pre-launch signup endpoint (Google Apps Script)
 * -------------------------------------------------------------
 * Appends each signup to the bound Google Sheet, de-duplicated by phone.
 * See README.md for step-by-step setup + deploy instructions.
 *
 * Sheet columns (row 1 headers, created automatically if missing):
 *   Timestamp | Name | Phone | Source
 */

var SHEET_NAME = 'Signups';
var HEADERS = ['Timestamp', 'Name', 'Phone', 'Email', 'Source'];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function last10_(v) {
  return ('' + (v || '')).replace(/\D/g, '').slice(-10);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000); // avoid two rows racing in at once
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }
  try {
    var sh = getSheet_();
    var data = JSON.parse(e.postData.contents);
    var phone = last10_(data.phone);
    if (phone.length !== 10) {
      return json_({ ok: false, error: 'invalid phone' });
    }

    // de-dupe by phone — already registered? do nothing, still report success
    var values = sh.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (last10_(values[i][2]) === phone) {
        return json_({ ok: true, dup: true });
      }
    }

    sh.appendRow([
      new Date(),
      ('' + (data.name || '')).trim(),
      "'" + phone,                       // leading quote keeps the number as text
      ('' + (data.email || '')).trim(),
      ('' + (data.source || 'qr')).trim()
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// open the /exec URL in a browser to confirm which version is live.
// If "columns" below does NOT include "Email", your deployment is running
// OLD code — attach a NEW VERSION to the deployment (see README / chat).
function doGet() {
  return json_({ ok: true, version: 'v2-email', columns: HEADERS });
}
