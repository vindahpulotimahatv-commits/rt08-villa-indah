/* ============================================================
   BACKEND DAFTAR HADIR & DOORPRIZE — RT 08 / RW 021 VILLA INDAH
   ------------------------------------------------------------
   Script ini dipasang di Google Apps Script (terhubung ke satu
   Google Sheet) supaya daftar-hadir.html dan doorprize.html bisa
   membaca & menulis data yang SAMA dari HP siapa pun.

   Cara pasang: lihat PANDUAN-DOORPRIZE.md.
   ============================================================ */

var SHEET_NAME = "DaftarHadir";

function doGet(e) {
  var sheet = getSheet_();
  var rows = readRows_(sheet);
  return jsonOutput_({ ok: true, data: rows });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var sheet = getSheet_();

    if (action === "daftar") {
      return handleDaftar_(sheet, body);
    }
    if (action === "menang") {
      return handleMenang_(sheet, body);
    }
    if (action === "batal_menang") {
      return handleBatalMenang_(sheet, body);
    }
    return jsonOutput_({ ok: false, reason: "unknown_action" });
  } catch (err) {
    return jsonOutput_({ ok: false, reason: "server_error", message: String(err) });
  }
}

/* ---------- Handlers ---------- */

function handleDaftar_(sheet, body) {
  var nama = String(body.nama || "").trim();
  var rumah = String(body.rumah || "").trim();
  if (!nama || !rumah) {
    return jsonOutput_({ ok: false, reason: "invalid" });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = sheet.getDataRange().getValues();
    var key = normalizeRumah_(rumah);
    for (var i = 1; i < data.length; i++) {
      if (normalizeRumah_(data[i][1]) === key) {
        return jsonOutput_({ ok: false, reason: "duplicate" });
      }
    }
    sheet.appendRow([nama, rumah, new Date(), "belum"]);
    return jsonOutput_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function handleMenang_(sheet, body) {
  return setStatus_(sheet, body.rumah, "menang");
}

function handleBatalMenang_(sheet, body) {
  return setStatus_(sheet, body.rumah, "belum");
}

function setStatus_(sheet, rumah, status) {
  var key = normalizeRumah_(rumah);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (normalizeRumah_(data[i][1]) === key) {
        sheet.getRange(i + 1, 4).setValue(status);
        return jsonOutput_({ ok: true });
      }
    }
    return jsonOutput_({ ok: false, reason: "not_found" });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Helpers ---------- */

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Nama", "Rumah", "Waktu Daftar", "Status"]);
  }
  return sheet;
}

function readRows_(sheet) {
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][1]) continue; // lewati baris kosong
    rows.push({
      nama: String(data[i][0] || ""),
      rumah: String(data[i][1] || ""),
      waktu: data[i][2] ? new Date(data[i][2]).toISOString() : "",
      status: String(data[i][3] || "belum")
    });
  }
  return rows;
}

function normalizeRumah_(v) {
  return String(v || "").trim().toLowerCase().replace(/\s+/g, "");
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
