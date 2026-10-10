/* ============================================================
   rekap-laporan.js — Rekap & Berita Acara LAPORAN WARGA (halaman Admin)
   ------------------------------------------------------------
   - Membaca laporan warga yang masuk lewat aplikasi (Firebase "laporan"),
     lalu menyediakan:
       1) Unduh Excel (.xlsx asli, tanpa library luar) — daftar lengkap + ringkasan
       2) Berita Acara (PDF) — nomor & tanggal terisi otomatis
   - Bisa disaring per periode (bulan), kategori, dan status.
   - Dipakai oleh admin.html:  RTRekapUI.set(daftarLaporan)  dipanggil
     setiap data laporan berubah (real-time).
   ============================================================ */
(function (root) {
  "use strict";

  var BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var STATUS = ["Baru","Diproses","Selesai","Ditolak"];
  function p2(v) { return (v < 10 ? "0" : "") + v; }
  function fmtTgl(ms) { var d = new Date(ms); return p2(d.getDate()) + "/" + p2(d.getMonth() + 1) + "/" + d.getFullYear() + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()); }

  /* ---------- ZIP (tanpa kompresi) + CRC32 ---------- */
  var CRC_T = null;
  function crc32(u8) {
    if (!CRC_T) { CRC_T = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC_T[n] = c >>> 0; } }
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) crc = CRC_T[(crc ^ u8[i]) & 255] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function utf8(s) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s);
    return new Uint8Array(Buffer.from(s, "utf8"));
  }
  function zip(files) {                       // files: [{name, data(string)}]
    var parts = [], central = [], offset = 0;
    function w16(a, v) { a.push(v & 255, (v >>> 8) & 255); }
    function w32(a, v) { a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255); }
    files.forEach(function (f) {
      var name = utf8(f.name), data = utf8(f.data), crc = crc32(data), h = [], c = [];
      w32(h, 0x04034b50); w16(h, 20); w16(h, 0x0800); w16(h, 0); w16(h, 0); w16(h, 0x21);
      w32(h, crc); w32(h, data.length); w32(h, data.length); w16(h, name.length); w16(h, 0);
      parts.push(new Uint8Array(h), name, data);
      w32(c, 0x02014b50); w16(c, 20); w16(c, 20); w16(c, 0x0800); w16(c, 0); w16(c, 0); w16(c, 0x21);
      w32(c, crc); w32(c, data.length); w32(c, data.length); w16(c, name.length); w16(c, 0); w16(c, 0);
      w16(c, 0); w16(c, 0); w32(c, 0); w32(c, offset);
      central.push(new Uint8Array(c), name);
      offset += h.length + name.length + data.length;
    });
    var csize = 0; central.forEach(function (x) { csize += x.length; });
    var e = []; w32(e, 0x06054b50); w16(e, 0); w16(e, 0); w16(e, files.length); w16(e, files.length); w32(e, csize); w32(e, offset); w16(e, 0);
    var all = parts.concat(central, [new Uint8Array(e)]), total = 0;
    all.forEach(function (x) { total += x.length; });
    var out = new Uint8Array(total), pos = 0;
    all.forEach(function (x) { out.set(x, pos); pos += x.length; });
    return out;
  }

  /* ---------- XLSX ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function kol(i) { var s = ""; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function cs(r, c, v, st) { return '<c r="' + kol(c) + r + '" s="' + (st || 0) + '" t="inlineStr"><is><t xml:space="preserve">' + esc(v) + "</t></is></c>"; }
  function cn(r, c, v, st) { return '<c r="' + kol(c) + r + '" s="' + (st || 0) + '"><v>' + v + "</v></c>"; }
  function serial(ms) { var d = new Date(ms); return (ms - d.getTimezoneOffset() * 60000) / 86400000 + 25569; }

  var STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy\\ hh:mm"/></numFmts>' +
    '<fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font>' +
    '<font><b/><sz val="14"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF0B2144"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>' +
    '<border><left style="thin"><color rgb="FFB0B7C3"/></left><right style="thin"><color rgb="FFB0B7C3"/></right><top style="thin"><color rgb="FFB0B7C3"/></top><bottom style="thin"><color rgb="FFB0B7C3"/></bottom><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="7">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>' +
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>' +
    '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  function sheetXml(rows, widths, opt) {
    opt = opt || {};
    var x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
    x += '<sheetViews><sheetView workbookViewId="0"' + (opt.freeze ? ">" + '<pane ySplit="' + opt.freeze + '" topLeftCell="A' + (opt.freeze + 1) + '" activePane="bottomLeft" state="frozen"/></sheetView>' : "/>") + "</sheetViews>";
    x += '<sheetFormatPr defaultRowHeight="15"/><cols>';
    widths.forEach(function (w, i) { x += '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; });
    x += "</cols><sheetData>" + rows.join("") + "</sheetData>";
    if (opt.filter) x += '<autoFilter ref="' + opt.filter + '"/>';
    return x + '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>' +
      '<pageSetup paperSize="9" orientation="landscape" fitToHeight="0"/></worksheet>';
  }

  /* items: array laporan; meta: {periode, kategori, status, dicetak(ms)} */
  function buatXlsx(items, meta) {
    meta = meta || {};
    items = (items || []).slice().sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
    var head = ["No", "Tanggal Masuk", "Kode Laporan", "Nama Pelapor", "Blok / No. Rumah", "No. WhatsApp", "Kategori", "Isi Laporan", "Status", "Catatan Pengurus", "Foto Bukti", "Terakhir Diperbarui"];
    var r = 1, rows = [];
    rows.push('<row r="1" ht="22" customHeight="1">' + cs(1, 0, "REKAP LAPORAN WARGA — PANDU RT 08 / RW 021 Villa Indah Pulo Timaha", 1) + "</row>");
    rows.push('<row r="2">' + cs(2, 0, "Periode", 5) + cs(2, 1, meta.periode || "Seluruh periode") + "</row>");
    rows.push('<row r="3">' + cs(3, 0, "Filter", 5) + cs(3, 1, "Kategori: " + (meta.kategori || "Semua") + "  |  Status: " + (meta.status || "Semua")) + "</row>");
    rows.push('<row r="4">' + cs(4, 0, "Dicetak", 5) + cs(4, 1, fmtTgl(meta.dicetak || Date.now())) + cs(4, 3, "Jumlah laporan: " + items.length, 5) + "</row>");
    var hr = 6; rows.push('<row r="' + hr + '" ht="30" customHeight="1">' + head.map(function (h, i) { return cs(hr, i, h, 2); }).join("") + "</row>");
    items.forEach(function (it, i) {
      r = hr + 1 + i;
      rows.push('<row r="' + r + '">' +
        cn(r, 0, i + 1, 6) +
        (it.createdAt ? cn(r, 1, serial(it.createdAt).toFixed(6), 4) : cs(r, 1, "-", 6)) +
        cs(r, 2, it.kode || "(laporan lama, tanpa kode)", 3) + cs(r, 3, it.nama || "", 3) + cs(r, 4, it.blok || "", 3) + cs(r, 5, it.wa || "", 3) +
        cs(r, 6, it.kategori || "", 3) + cs(r, 7, it.keterangan || "", 3) + cs(r, 8, it.status || "Baru", 3) + cs(r, 9, it.catatan || "", 3) +
        cs(r, 10, it.foto ? "Ada" : "Tidak ada", 6) +
        (it.updatedAt ? cn(r, 11, serial(it.updatedAt).toFixed(6), 4) : cs(r, 11, "-", 6)) + "</row>");
    });
    var lastRow = Math.max(hr + items.length, hr + 1);
    var s1 = sheetXml(rows, [5, 17, 16, 24, 16, 16, 15, 60, 11, 34, 11, 17], { freeze: hr, filter: "A" + hr + ":L" + lastRow });

    /* Lembar ringkasan */
    var rr = [], n = 1;
    rr.push('<row r="1" ht="22" customHeight="1">' + cs(1, 0, "RINGKASAN LAPORAN WARGA", 1) + "</row>");
    rr.push('<row r="2">' + cs(2, 0, "Periode", 5) + cs(2, 1, meta.periode || "Seluruh periode") + "</row>");
    rr.push('<row r="4">' + cs(4, 0, "Status", 2) + cs(4, 1, "Jumlah", 2) + "</row>");
    n = 5;
    STATUS.forEach(function (s) {
      var jml = items.filter(function (it) { return (it.status || "Baru") === s; }).length;
      rr.push('<row r="' + n + '">' + cs(n, 0, s === "Baru" ? "Baru (diterima)" : s, 3) + cn(n, 1, jml, 6) + "</row>"); n++;
    });
    rr.push('<row r="' + n + '">' + cs(n, 0, "Total", 5) + cn(n, 1, items.length, 6) + "</row>"); n += 2;
    rr.push('<row r="' + n + '">' + cs(n, 0, "Kategori", 2) + cs(n, 1, "Jumlah", 2) + "</row>"); n++;
    var kat = {}, ord = [];
    items.forEach(function (it) { var k = it.kategori || "Lainnya"; if (!(k in kat)) { kat[k] = 0; ord.push(k); } kat[k]++; });
    ord.sort(function (a, b) { return kat[b] - kat[a]; }).forEach(function (k) { rr.push('<row r="' + n + '">' + cs(n, 0, k, 3) + cn(n, 1, kat[k], 6) + "</row>"); n++; });
    var s2 = sheetXml(rr, [28, 12], {});

    var NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    var HDR = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    return zip([
      { name: "[Content_Types].xml", data: HDR + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: "_rels/.rels", data: HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: "xl/workbook.xml", data: HDR + "<workbook " + NS + '><sheets><sheet name="Rekap Laporan" sheetId="1" r:id="rId1"/><sheet name="Ringkasan" sheetId="2" r:id="rId2"/></sheets>' +
        '<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'Rekap Laporan\'!$A$' + hr + ":$L$" + lastRow + "</definedName></definedNames></workbook>" },
      { name: "xl/_rels/workbook.xml.rels", data: HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' +
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: "xl/styles.xml", data: STYLES },
      { name: "xl/worksheets/sheet1.xml", data: s1 },
      { name: "xl/worksheets/sheet2.xml", data: s2 }
    ]);
  }

  /* ---------- Penyaringan ---------- */
  function rentang(mode, bulanVal, now) {              // -> {dari, sampai, label} (ms)
    var y = now.getFullYear(), m = now.getMonth();
    if (mode === "bulanIni") return { dari: new Date(y, m, 1).getTime(), sampai: new Date(y, m + 1, 1).getTime(), label: BULAN[m] + " " + y };
    if (mode === "bulanLalu") { var d = new Date(y, m - 1, 1); return { dari: d.getTime(), sampai: new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(), label: BULAN[d.getMonth()] + " " + d.getFullYear() }; }
    if (mode === "pilih" && /^\d{4}-\d{2}$/.test(bulanVal || "")) {
      var yy = +bulanVal.slice(0, 4), mm = +bulanVal.slice(5, 7) - 1;
      return { dari: new Date(yy, mm, 1).getTime(), sampai: new Date(yy, mm + 1, 1).getTime(), label: BULAN[mm] + " " + yy };
    }
    return { dari: 0, sampai: Infinity, label: "Seluruh periode" };
  }
  function saring(items, f, now) {
    var r = rentang(f.mode, f.bulan, now || new Date());
    var out = items.filter(function (it) {
      var t = it.createdAt || 0;
      if (r.dari || r.sampai !== Infinity) { if (!(t >= r.dari && t < r.sampai)) return false; }
      if (f.kategori && f.kategori !== "Semua" && (it.kategori || "Lainnya") !== f.kategori) return false;
      if (f.status && f.status !== "Semua" && (it.status || "Baru") !== f.status) return false;
      return true;
    });
    return { items: out, periode: r.label };
  }

  /* ---------- UI (kartu di panel Laporan admin) ---------- */
  var UI = { items: [], ready: false };
  var CSS = ".rkp{margin-bottom:16px}.rkp .rkp-row{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}" +
    ".rkp label{display:flex;flex-direction:column;gap:3px;font-size:11.5px;font-weight:800;color:var(--muted,#5b6577);flex:1;min-width:140px}" +
    ".rkp select,.rkp input[type=month]{padding:9px;border-radius:10px;border:1.5px solid var(--line,#dbe2ee);font:inherit;font-weight:700;background:#fff;color:inherit}" +
    ".rkp-sum{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:12px 0}" +
    ".rkp-sum div{border:1.5px solid var(--line,#dbe2ee);border-radius:12px;padding:8px 6px;text-align:center;background:#f8faff}" +
    ".rkp-sum b{display:block;font-size:20px;line-height:1.1}.rkp-sum span{font-size:11px;font-weight:700;color:var(--muted,#5b6577)}" +
    ".rkp-act{display:flex;gap:8px;flex-wrap:wrap}.rkp-act button{border:0;border-radius:12px;padding:11px 16px;font-weight:900;cursor:pointer;font:inherit;font-weight:900}" +
    ".rkp-xl{background:#1d7a46;color:#fff}.rkp-pdf{background:#e8c05a;color:#0b2144}.rkp-act button:disabled{opacity:.45;cursor:not-allowed}" +
    ".rkp-kat{font-size:12.5px;color:var(--muted,#5b6577);margin:4px 0 10px;line-height:1.5}" +
    "@media(max-width:560px){.rkp-sum{grid-template-columns:repeat(3,1fr)}}";

  function el(id) { return document.getElementById(id); }
  function toast(m) { if (typeof root.showToast === "function") root.showToast(m); else alert(m); }
  function b64(bytes) {
    var u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), s = "";
    for (var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function unduhBlob(bytes, nama, tipe) {
    var url = URL.createObjectURL(new Blob([bytes], { type: tipe }));
    var a = document.createElement("a"); a.href = url; a.download = nama;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
  }
  /* Di aplikasi Android (WebView) unduhan blob tidak jalan -> pakai jembatan RTAndroid.shareFile (menu Simpan/Bagikan).
     Di browser: lembar bagikan bila ada, kalau tidak unduh biasa. */
  function unduh(bytes, nama, tipe) {
    if (root.RTAndroid && typeof root.RTAndroid.shareFile === "function") {
      try { if (root.RTAndroid.shareFile(b64(bytes), nama, tipe, "", "", false)) { toast("Pilih tujuan: simpan ke File/Drive atau kirim lewat WhatsApp."); return; } } catch (e) { console.warn(e); }
    }
    try {
      var f = new File([bytes], nama, { type: tipe });
      if (navigator.canShare && navigator.canShare({ files: [f] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        navigator.share({ files: [f], title: nama }).catch(function (e) { if (!e || e.name !== "AbortError") unduhBlob(bytes, nama, tipe); });
        return;
      }
    } catch (e2) { console.warn(e2); }
    unduhBlob(bytes, nama, tipe);
  }
  function filterSaatIni() {
    return { mode: el("rkpPeriode").value, bulan: el("rkpBulan").value, kategori: el("rkpKategori").value, status: el("rkpStatus").value };
  }
  function bangun() {
    var box = el("rekapLaporanBox"); if (!box || UI.ready) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    box.innerHTML = '<div class="list-card rkp"><div class="list-title">📋 Rekap &amp; Berita Acara Laporan Warga</div>' +
      '<p class="sub">Daftar semua laporan yang masuk lewat aplikasi. Pilih periode lalu unduh sebagai Excel atau Berita Acara (PDF). Nomor &amp; tanggal berita acara terisi otomatis.</p>' +
      '<div class="rkp-row">' +
      '<label>Periode<select id="rkpPeriode"><option value="semua">Semua waktu</option><option value="bulanIni">Bulan ini</option><option value="bulanLalu">Bulan lalu</option><option value="pilih">Pilih bulan…</option></select></label>' +
      '<label id="rkpBulanWrap" style="display:none">Bulan<input type="month" id="rkpBulan"></label>' +
      '<label>Kategori<select id="rkpKategori"><option>Semua</option></select></label>' +
      '<label>Status<select id="rkpStatus"><option>Semua</option><option>Baru</option><option>Diproses</option><option>Selesai</option><option>Ditolak</option></select></label></div>' +
      '<div class="rkp-sum" id="rkpSum"></div><div class="rkp-kat" id="rkpKat"></div>' +
      '<div class="rkp-act"><button type="button" class="rkp-xl" id="rkpXls">⬇ Download Excel (.xlsx)</button><button type="button" class="rkp-pdf" id="rkpPdf">📄 Berita Acara (PDF)</button></div></div>';
    var rerender = function () { el("rkpBulanWrap").style.display = el("rkpPeriode").value === "pilih" ? "" : "none"; tampil(); };
    ["rkpPeriode", "rkpBulan", "rkpKategori", "rkpStatus"].forEach(function (id) { el(id).addEventListener("change", rerender); });
    el("rkpXls").addEventListener("click", function () {
      var s = saring(UI.items, filterSaatIni()), f = filterSaatIni();
      var bytes = buatXlsx(s.items, { periode: s.periode, kategori: f.kategori, status: f.status, dicetak: Date.now() });
      var n = new Date();
      unduh(bytes, "Rekap-Laporan-Warga_" + n.getFullYear() + p2(n.getMonth() + 1) + p2(n.getDate()) + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      toast("Excel siap (" + s.items.length + " laporan).");
    });
    el("rkpPdf").addEventListener("click", function () {
      if (typeof root.RTSurat === "undefined" || !root.RTSurat.buatBeritaAcara) { toast("surat-pdf.js belum termuat / versi lama."); return; }
      var s = saring(UI.items, filterSaatIni()), f = filterSaatIni();
      try {
        var r = root.RTSurat.buatBeritaAcara(s.items, { periode: s.periode, kategori: f.kategori === "Semua" ? "Semua kategori" : f.kategori }, (typeof RT_CONFIG !== "undefined" ? RT_CONFIG : {}), null, new Date());
        unduh(r.bytes, r.namaFile, "application/pdf");
        toast("Berita acara siap: " + r.nomor);
      } catch (e) { console.error(e); toast("Gagal membuat berita acara."); }
    });
    UI.ready = true;
  }
  function tampil() {
    if (!UI.ready) return;
    var selK = el("rkpKategori"), cur = selK.value, kats = {};
    UI.items.forEach(function (it) { kats[it.kategori || "Lainnya"] = 1; });
    var daftar = ["Semua"].concat(Object.keys(kats).sort());
    if (selK.options.length !== daftar.length || daftar.some(function (k, i) { return selK.options[i].text !== k; })) {
      selK.innerHTML = daftar.map(function (k) { return "<option>" + esc(k) + "</option>"; }).join("");
      selK.value = daftar.indexOf(cur) >= 0 ? cur : "Semua";
    }
    var s = saring(UI.items, filterSaatIni());
    var hit = {}; STATUS.forEach(function (x) { hit[x] = 0; });
    s.items.forEach(function (it) { var k = it.status || "Baru"; hit[k] = (hit[k] || 0) + 1; });
    el("rkpSum").innerHTML = '<div><b>' + s.items.length + '</b><span>Total</span></div>' +
      STATUS.map(function (x) { return '<div><b>' + hit[x] + '</b><span>' + (x === "Baru" ? "Baru" : x) + '</span></div>'; }).join("");
    var kt = {}; s.items.forEach(function (it) { var k = it.kategori || "Lainnya"; kt[k] = (kt[k] || 0) + 1; });
    var ktTxt = Object.keys(kt).sort(function (a, b) { return kt[b] - kt[a]; }).map(function (k) { return esc(k) + " <b>" + kt[k] + "</b>"; }).join(" • ");
    el("rkpKat").innerHTML = "Periode: <b>" + esc(s.periode) + "</b>" + (ktTxt ? " — " + ktTxt : " — belum ada laporan");
    el("rkpXls").disabled = el("rkpPdf").disabled = false;
  }
  UI.set = function (items) { UI.items = items || []; bangun(); tampil(); };

  var API = { buatXlsx: buatXlsx, saring: saring, rentang: rentang, UI: UI };
  root.RTRekap = API; root.RTRekapUI = UI;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
