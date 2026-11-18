/**
 * GK Wedding — RSVP receiver (Google Apps Script, bound to the RSVP Google Sheet).
 *
 * The invitation site (GitHub Pages) POSTs JSON:
 *   { name, side: 'bride'|'groom', attend: 'yes'|'no', guests, message, submittedAt }
 * Each reply becomes one row in the "RSVP" tab. The "สรุป" tab totals it up.
 *
 * Setup (once): run setup() from the editor, then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone) and put the /exec URL in CONFIG.rsvpEndpoint.
 * Full click-by-click steps: apps-script/README.md
 */

const SHEET_RSVP = 'RSVP';
const SHEET_SUMMARY = 'สรุป';
const HEADERS = ['เวลาที่ส่ง', 'ชื่อ - นามสกุล', 'ฝ่าย', 'มาร่วมงาน', 'จำนวนคน', 'คำอวยพร'];
const SIDE = { bride: 'เจ้าสาว', groom: 'เจ้าบ่าว' };
const ATTEND = { yes: 'มา', no: 'ไม่มา' };
const MAX_GUESTS = 10;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    const name = clean(data.name, 120);
    const side = SIDE[data.side];
    const attend = ATTEND[data.attend];
    if (!name || !side || !attend) return json({ ok: false, error: 'missing fields' });

    let guests = Math.round(Number(data.guests));
    if (data.attend === 'no') guests = 0;
    else guests = Math.min(MAX_GUESTS, Math.max(1, isFinite(guests) ? guests : 1));

    const row = [new Date(), name, side, attend, guests, clean(data.message, 1000)];

    lock.waitLock(10000); // two guests sending at the same moment must not overwrite each other
    const sheet = rsvpSheet_();
    sheet.appendRow(row);
    lock.releaseLock();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// Opening the /exec URL in a browser shows this, so you can check the deployment is live.
function doGet() {
  return json({ ok: true, service: 'GK Wedding RSVP' });
}

/** Run once from the editor: creates the RSVP and สรุป tabs with headers and formulas. */
function setup() {
  rsvpSheet_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sum = ss.getSheetByName(SHEET_SUMMARY) || ss.insertSheet(SHEET_SUMMARY);
  sum.clear();
  const r = `${SHEET_RSVP}!`;
  sum.getRange('A1:D1').setValues([['', 'ฝ่ายเจ้าสาว', 'ฝ่ายเจ้าบ่าว', 'รวม']]).setFontWeight('bold');
  sum.getRange('A2:A5').setValues([['ตอบรับว่ามา (คำตอบ)'], ['จำนวนคนที่มา'], ['ไม่สะดวกมา (คำตอบ)'], ['ตอบกลับทั้งหมด']]);
  const f = side => [
    `=COUNTIFS(${r}C2:C,"${side}",${r}D2:D,"มา")`,
    `=SUMIFS(${r}E2:E,${r}C2:C,"${side}",${r}D2:D,"มา")`,
    `=COUNTIFS(${r}C2:C,"${side}",${r}D2:D,"ไม่มา")`,
    `=COUNTIF(${r}C2:C,"${side}")`,
  ];
  const b = f('เจ้าสาว'), g = f('เจ้าบ่าว');
  sum.getRange('B2:D5').setFormulas(b.map((x, i) => [x, g[i], `=B${i + 2}+C${i + 2}`]));
  sum.getRange('A3:D3').setFontWeight('bold').setBackground('#EEF2F8');
  sum.setColumnWidth(1, 190);
  sum.setFrozenRows(1);
}

function rsvpSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_RSVP);
  if (!sh) sh = ss.insertSheet(SHEET_RSVP, 0);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0B2E6B').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    sh.setColumnWidth(2, 200);
    sh.setColumnWidth(6, 320);
  }
  return sh;
}

// Trim, cap length, and stop text that starts with = + - @ from running as a spreadsheet formula.
function clean(v, max) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
