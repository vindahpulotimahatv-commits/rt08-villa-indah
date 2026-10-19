/* ============================================================
   laporan-keuangan-pdf.js — Pembuat PDF LAPORAN KEUANGAN RT 08 (halaman Bendahara)
   ------------------------------------------------------------
   - Tanpa library luar dan tanpa server: PDF dibuat langsung di HP/laptop.
   - Isi PDF sama dengan Excel: Ringkasan, Iuran per Rumah, Detail Iuran,
     Rekap Petugas Humas, dan Transaksi (saldo berjalan). Kertas A4 mendatar.
   - Dipanggil dari bendahara.html:  RTLaporanPDF.buat(data, logo)
     -> { bytes: Uint8Array, namaFile: "....pdf" }
   ============================================================ */
(function (root) {
  "use strict";

  var PW = 841.89, PH = 595.28;            // A4 mendatar (laporan lengkap); A4 tegak untuk PDF warga
  var MX = 30, TOP = 34, BOT = PH - 36;    // margin kiri-kanan, atas, batas bawah isi
  var CW = PW - 2 * MX;                    // lebar isi
  function ukuran(tegak) {
    PW = tegak ? 595.28 : 841.89; PH = tegak ? 841.89 : 595.28;
    BOT = PH - 36; CW = PW - 2 * MX;
  }

  /* Lebar huruf Helvetica (per 1000 unit, kode WinAnsi 32..255) */
  var WD = { R: [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761, 556, 556, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 556, 611, 556, 556, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 556, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, 667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500], B: [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761, 556, 611, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 611, 611, 611, 611, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 611, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556] };
  var FID = { R: "F1", B: "F2" };

  var NAVY = [0.12, 0.23, 0.37], PUTIH = [1, 1, 1], HIJAU = [0.85, 0.95, 0.88], KUNING = [1, 0.95, 0.8],
      MERAH = [0.98, 0.84, 0.84], ABU = [0.95, 0.95, 0.95], BIRU = [0.91, 0.93, 0.97];

  var CP1252 = { 0x20AC:128,0x201A:130,0x0192:131,0x201E:132,0x2026:133,0x2020:134,0x2021:135,0x02C6:136,0x2030:137,0x0160:138,
    0x2039:139,0x0152:140,0x017D:142,0x2018:145,0x2019:146,0x201C:147,0x201D:148,0x2022:149,0x2013:150,0x2014:151,0x02DC:152,
    0x2122:153,0x0161:154,0x203A:155,0x0153:156,0x017E:158,0x0178:159 };

  /* Ubah teks bebas menjadi "string byte" WinAnsi yang aman untuk PDF. */
  function norm(s) {
    s = String(s == null ? "" : s);
    var o = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 10 || c === 9) o += " ";
      else if (c < 32 || c === 127) { /* buang karakter kontrol */ }
      else if (c < 127 || (c >= 160 && c <= 255)) o += s.charAt(i);
      else if (CP1252[c]) o += String.fromCharCode(CP1252[c]);
      else o += "?";
    }
    return o;
  }
  function tw(s, f, z) {
    var t = WD[f] || WD.R, w = 0;
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); if (c >= 32 && c <= 255) w += t[c - 32]; }
    return w * z / 1000;
  }
  function n2(v) { return String(Math.round(v * 100) / 100); }
  function esc(s) { return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
  function latin1(s) { var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; }
  function rp(n) { n = Math.round(Number(n) || 0); var neg = n < 0; n = Math.abs(n); return (neg ? "-" : "") + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function rpR(n) { return "Rp " + rp(n); }

  /* Bungkus teks ke beberapa baris sesuai lebar */
  function wrap(str, f, z, maxW) {
    str = norm(str);
    var words = str.split(/ +/), out = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var w = words[i]; if (!w) continue;
      while (tw(w, f, z) > maxW) {
        if (line) { out.push(line); line = ""; }
        var k = 1; while (k < w.length && tw(w.slice(0, k + 1), f, z) <= maxW) k++;
        out.push(w.slice(0, k)); w = w.slice(k);
      }
      if (!w) continue;
      var test = line ? line + " " + w : w;
      if (tw(test, f, z) <= maxW) line = test; else { out.push(line); line = w; }
    }
    out.push(line);
    return out;
  }

  /* ---------- Penulis PDF tingkat rendah ---------- */
  function Doc() { this.pages = []; this.images = []; this.newPage(); }
  Doc.prototype.newPage = function () { this.page = { ops: [], imgs: {} }; this.pages.push(this.page); };
  Doc.prototype.rect = function (x, y, w, h, o) {
    o = o || {};
    var op = "q ";
    if (o.fill) op += o.fill.map(n2).join(" ") + " rg ";
    if (o.stroke) op += o.stroke.map(n2).join(" ") + " RG " + n2(o.lw || 0.5) + " w ";
    op += n2(x) + " " + n2(PH - y - h) + " " + n2(w) + " " + n2(h) + " re " + (o.fill && o.stroke ? "B" : o.fill ? "f" : "S") + " Q";
    this.page.ops.push(op);
  };
  Doc.prototype.text = function (x, y, s, f, z, rgb) {
    this.page.ops.push("BT " + (rgb ? rgb.map(n2).join(" ") + " rg " : "") + "/" + FID[f] + " " + n2(z) + " Tf " +
      n2(x) + " " + n2(PH - y) + " Td (" + esc(s) + ") Tj ET" + (rgb ? " 0 g" : ""));
  };
  Doc.prototype.line = function (x1, y1, x2, y2, w, gray) {
    this.page.ops.push((gray != null ? n2(gray) + " G " : "") + n2(w) + " w " + n2(x1) + " " + n2(PH - y1) + " m " + n2(x2) + " " + n2(PH - y2) + " l S" + (gray != null ? " 0 G" : ""));
  };
  Doc.prototype.addImage = function (bytes, w, h) { this.images.push({ bytes: bytes, w: w, h: h }); return this.images.length; };
  Doc.prototype.drawImage = function (id, x, y, w, h) {
    this.page.imgs[id] = true;
    this.page.ops.push("q " + n2(w) + " 0 0 " + n2(h) + " " + n2(x) + " " + n2(PH - y - h) + " cm /Im" + id + " Do Q");
  };
  Doc.prototype.build = function (title) {
    var chunks = [], offset = 0, xref = [];
    function put(x) { var b = (typeof x === "string") ? latin1(x) : x; chunks.push(b); offset += b.length; }
    function begin(id) { xref[id] = offset; put(id + " 0 obj\n"); }
    function end() { put("\nendobj\n"); }
    var nImg = this.images.length, nPg = this.pages.length, firstImg = 6, firstPage = firstImg + nImg, i, kids = [];
    for (i = 0; i < nPg; i++) kids.push((firstPage + i * 2) + " 0 R");
    put("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    begin(1); put("<< /Type /Catalog /Pages 2 0 R >>"); end();
    begin(2); put("<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + nPg + " >>"); end();
    begin(3); put("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"); end();
    begin(4); put("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"); end();
    var d = new Date(), p2 = function (v) { return (v < 10 ? "0" : "") + v; };
    var stamp = "D:" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds());
    begin(5); put("<< /Title (" + esc(norm(title || "Laporan").replace(/[\x80-\x9f]/g, "'")) + ") /Producer (Portal Warga RT 08) /Creator (Portal Warga RT 08) /CreationDate (" + stamp + ") >>"); end();
    for (i = 0; i < nImg; i++) {
      var im = this.images[i]; begin(firstImg + i);
      put("<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + im.bytes.length + " >>\nstream\n");
      put(im.bytes); put("\nendstream"); end();
    }
    for (i = 0; i < nPg; i++) {
      var pg = this.pages[i], pid = firstPage + i * 2, cid = pid + 1, xo = "";
      for (var k in pg.imgs) xo += "/Im" + k + " " + (firstImg + Number(k) - 1) + " 0 R ";
      begin(pid);
      put("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + n2(PW) + " " + n2(PH) + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>" + (xo ? " /XObject << " + xo + ">>" : "") + " >> /Contents " + cid + " 0 R >>");
      end();
      var content = latin1(pg.ops.join("\n"));
      begin(cid); put("<< /Length " + content.length + " >>\nstream\n"); put(content); put("\nendstream"); end();
    }
    var total = firstPage + nPg * 2, xrefPos = offset;
    put("xref\n0 " + total + "\n0000000000 65535 f \n");
    for (i = 1; i < total; i++) put(("0000000000" + xref[i]).slice(-10) + " 00000 n \n");
    put("trailer\n<< /Size " + total + " /Root 1 0 R /Info 5 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF\n");
    var out = new Uint8Array(offset), pos = 0;
    for (i = 0; i < chunks.length; i++) { out.set(chunks[i], pos); pos += chunks[i].length; }
    return out;
  };

  /* ---------- Tata letak ---------- */
  function Layout(doc) { this.doc = doc; this.y = TOP; }
  Layout.prototype.ensure = function (h) { if (this.y + h > BOT) { this.doc.newPage(); this.y = TOP; return true; } return false; };

  /* Judul bagian (pita biru muda) */
  Layout.prototype.seksi = function (teks) {
    this.ensure(18 + 40);
    this.doc.rect(MX, this.y, CW, 16, { fill: BIRU });
    this.doc.text(MX + 6, this.y + 11.5, norm(teks), "B", 9.5, NAVY);
    this.y += 20;
  };
  Layout.prototype.judulHalaman = function (teks, sub) {
    this.ensure(40);
    this.doc.text(MX, this.y + 13, norm(teks), "B", 13, NAVY);
    if (sub) this.doc.text(MX, this.y + 25, norm(sub), "R", 8.5, [0.4, 0.4, 0.4]);
    this.y += sub ? 32 : 22;
  };

  /* Tabel: cols = [{t, w, a:"l|c|r"}], rows = [[sel,...]], sel = string | {t, fill, b, a}
     opt: fs (ukuran huruf), headRep (ulang header tiap halaman), fillRow(rowIndex)->warna, boldRow(rowIndex) */
  Layout.prototype.tabel = function (cols, rows, opt) {
    opt = opt || {};
    var self = this, d = this.doc, fs = opt.fs || 8, lh = fs + 2.4, pad = opt.pad != null ? opt.pad : 3;
    var total = cols.reduce(function (a, c) { return a + c.w; }, 0), X = [MX];
    cols.forEach(function (c) { X.push(X[X.length - 1] + c.w); });
    var x0 = opt.center ? MX + (CW - total) / 2 : MX;
    if (opt.center) { X = [x0]; cols.forEach(function (c) { X.push(X[X.length - 1] + c.w); }); }
    var hHead = (function () {
      var m = 1; cols.forEach(function (c) { m = Math.max(m, wrap(c.t, "B", fs, c.w - 2 * pad).length); });
      return m * lh + 2 * pad;
    })();
    function kepala() {
      d.rect(x0, self.y, total, hHead, { fill: NAVY, stroke: [0.75, 0.75, 0.75], lw: 0.4 });
      cols.forEach(function (c, i) {
        var ls = wrap(c.t, "B", fs, c.w - 2 * pad), y0 = self.y + (hHead - ls.length * lh) / 2;
        ls.forEach(function (l, j) { d.text(X[i] + (c.w - tw(l, "B", fs)) / 2, y0 + fs + j * lh - 0.5, l, "B", fs, PUTIH); });
      });
      self.y += hHead;
    }
    this.ensure(hHead + 3 * lh + 2 * pad);
    kepala();
    rows.forEach(function (row, ri) {
      var cells = row.map(function (v, i) {
        var o = (v && typeof v === "object") ? v : { t: v };
        var txt = o.t == null ? "" : String(o.t);
        var bold = o.b != null ? o.b : (opt.boldRow ? opt.boldRow(ri) : false);
        return { ls: txt === "" ? [""] : wrap(txt, bold ? "B" : "R", fs, cols[i].w - 2 * pad), fill: o.fill || (opt.fillRow ? opt.fillRow(ri) : null), b: bold, a: o.a || cols[i].a || "l" };
      });
      var m = 1; cells.forEach(function (c) { m = Math.max(m, c.ls.length); });
      var rh = m * lh + 2 * pad;
      if (self.y + rh > BOT) { d.newPage(); self.y = TOP; kepala(); }
      cells.forEach(function (c, i) {
        d.rect(X[i], self.y, cols[i].w, rh, c.fill ? { fill: c.fill, stroke: [0.75, 0.75, 0.75], lw: 0.4 } : { stroke: [0.75, 0.75, 0.75], lw: 0.4 });
        c.ls.forEach(function (l, j) {
          var w = tw(l, c.b ? "B" : "R", fs), x = c.a === "r" ? X[i] + cols[i].w - pad - w : c.a === "c" ? X[i] + (cols[i].w - w) / 2 : X[i] + pad;
          if (l) d.text(x, self.y + pad + fs + j * lh - 0.5, l, c.b ? "B" : "R", fs);
        });
      });
      self.y += rh;
    });
    this.y += 8;
  };

  /* ---------- Isi laporan ---------- */
  function buat(D, logo) {
    D = D || {};
    ukuran(false);
    var doc = new Doc(), L = new Layout(doc);
    var label = D.label || "-", kop = "LAPORAN KEUANGAN " + (D.rtRw || "RT 08 / RW 021") + " " + (D.kompleks || "VILLA INDAH PULO TIMAHA");

    /* ===== Halaman 1: kop + ringkasan ===== */
    var yTop = L.y, xt = MX;
    if (logo && logo.bytes) { doc.drawImage(doc.addImage(logo.bytes, logo.w, logo.h), MX, yTop, 40, 40 * logo.h / logo.w); xt = MX + 50; }
    doc.text(xt, yTop + 16, norm(kop), "B", 15, NAVY);
    doc.text(xt, yTop + 30, "Periode: " + norm(label) + "   |   Dicetak: " + norm(D.dicetak || ""), "R", 9, [0.3, 0.3, 0.3]);
    L.y = yTop + 46;
    doc.line(MX, L.y, MX + CW, L.y, 1.2, 0.3); L.y += 12;

    L.seksi("RINGKASAN KAS");
    var kotak = [["Saldo Awal Periode", D.saldoAwal, null], ["Total Pemasukan", D.totMasuk, [0.1, 0.5, 0.25]], ["Total Pengeluaran", D.totKeluar, [0.7, 0.15, 0.15]], ["Saldo Akhir Periode", D.saldoAkhir, NAVY]];
    var bw = (CW - 3 * 8) / 4, by = L.y;
    kotak.forEach(function (k, i) {
      var x = MX + i * (bw + 8);
      doc.rect(x, by, bw, 44, { fill: i === 3 ? BIRU : ABU, stroke: [0.8, 0.8, 0.8], lw: 0.5 });
      doc.text(x + 8, by + 15, norm(k[0]), "R", 8.5, [0.35, 0.35, 0.35]);
      doc.text(x + 8, by + 34, norm(rpR(k[1])), "B", 14, k[2] || [0, 0, 0]);
    });
    L.y = by + 44 + 12;

    var kat = D.perKat || [];
    if (kat.length) {
      L.seksi("REKAP PER KATEGORI");
      L.tabel([{ t: "Kategori", w: 260 }, { t: "Pemasukan (Rp)", w: 130, a: "r" }, { t: "Pengeluaran (Rp)", w: 130, a: "r" }],
        kat.map(function (k) { return [k.nama, rp(k.m), rp(k.k)]; }), { fs: 8.5, center: false });
    }
    var bln = D.perBulan || [];
    if (bln.length) {
      L.seksi("REKAP PER BULAN");
      L.tabel([{ t: "Bulan", w: 200 }, { t: "Pemasukan (Rp)", w: 130, a: "r" }, { t: "Pengeluaran (Rp)", w: 130, a: "r" }, { t: "Selisih (Rp)", w: 130, a: "r" }],
        bln.map(function (b) { return [b.label, rp(b.m), rp(b.k), rp(b.m - b.k)]; }), { fs: 8.5 });
    }
    var ri = D.rekapIuran || [];
    if (ri.length) {
      L.seksi("REKAP IURAN BULANAN (dari " + (D.totalRumah || 0) + " rumah)");
      L.tabel([{ t: "Bulan", w: 150 }, { t: "Rumah Lunas (Terkonfirmasi)", w: 130, a: "r" }, { t: "Total Terkonfirmasi (Rp)", w: 140, a: "r" }, { t: "Menunggu Konfirmasi", w: 110, a: "r" }, { t: "Belum Bayar", w: 90, a: "r" }, { t: "Belum Ditarik", w: 90, a: "r" }],
        ri.map(function (o) { return [o.label, rp(o.lunas), rp(o.jml), rp(o.tunggu), rp(o.belum), rp(o.kosong)]; }), { fs: 8.5 });
    }

    /* Tanda tangan */
    L.ensure(120);
    var sy = L.y + 6, kx = MX + 90, kx2 = PW - MX - 90 - 180;
    function ttd(x, jab, nama) {
      var cx = x + 90;
      doc.text(cx - tw(jab, "R", 9.5) / 2, sy + 10, jab, "R", 9.5);
      var nm = "( " + norm(nama) + " )";
      doc.text(cx - tw(nm, "B", 9.5) / 2, sy + 80, nm, "B", 9.5);
    }
    ttd(kx, "Bendahara RT", D.namaBendahara || "Bendahara");
    ttd(kx2, "Mengetahui, Ketua RT", D.namaKetua || "Ketua RT");
    L.y = sy + 96;

    /* ===== Iuran per Rumah (rumah x bulan) ===== */
    var M = D.matriks;
    if (M && M.rows && M.rows.length && M.bulan && M.bulan.length) {
      doc.newPage(); L.y = TOP;
      L.judulHalaman("IURAN BULANAN PER RUMAH — " + label, "Tarif Rp " + rp(D.tarif || 0) + " per rumah (+ RUKEM per KK tambahan).  Hijau = lunas terkonfirmasi  |  Kuning = menunggu konfirmasi/setoran  |  Merah = belum bayar  |  Abu = belum ditarik");
      var CHUNK = 9, awal;
      for (awal = 0; awal < M.bulan.length; awal += CHUNK) {
        var akhir = Math.min(M.bulan.length, awal + CHUNK), terakhir = akhir >= M.bulan.length;
        var fixW = 24 + 66 + 150, tot = terakhir ? 62 : 0, mw = Math.min(70, Math.floor((CW - fixW - tot) / (akhir - awal)));
        var cols = [{ t: "No", w: 24, a: "c" }, { t: "Blok / No. Rumah", w: 66 }, { t: "Nama Kepala Keluarga", w: 150 }];
        for (var j = awal; j < akhir; j++) cols.push({ t: M.bulan[j], w: mw, a: "c" });
        if (terakhir) cols.push({ t: "Total Lunas (Rp)", w: tot, a: "r" });
        var warna = { ok: HIJAU, tunggu: KUNING, belum: MERAH, kosong: ABU }, teks = { tunggu: "Menunggu", belum: "Belum bayar", kosong: "-" };
        var rows = M.rows.map(function (r, i) {
          var row = [String(i + 1), r.rumah, r.nama];
          for (var j2 = awal; j2 < akhir; j2++) {
            var s = r.sel[j2] || { k: "kosong" };
            row.push({ t: s.k === "ok" ? rp(s.jml) : (teks[s.k] || "-"), fill: warna[s.k] || ABU, a: "c" });
          }
          if (terakhir) row.push({ t: rp(r.total), b: true, a: "r" });
          return row;
        });
        if (terakhir) {
          var tb = ["", "", { t: "TOTAL LUNAS (Rp)", b: true }];
          for (var j3 = awal; j3 < akhir; j3++) tb.push({ t: rp(M.totBulan[j3]), b: true, a: "c", fill: BIRU });
          tb.push({ t: rp(M.totSemua), b: true, a: "r", fill: BIRU });
          tb[0] = { t: "", fill: BIRU }; tb[1] = { t: "", fill: BIRU }; tb[2] = { t: "TOTAL LUNAS (Rp)", b: true, fill: BIRU };
          rows.push(tb);
          [["Rumah lunas", "lunas"], ["Menunggu konfirmasi", "tunggu"], ["Belum bayar", "belum"], ["Belum ditarik", "kosong"]].forEach(function (p) {
            var rr = [{ t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: p[0], b: true, fill: BIRU }];
            for (var j4 = awal; j4 < akhir; j4++) rr.push({ t: rp((D.rekapIuran[j4] || {})[p[1]] || 0), a: "c", fill: BIRU });
            rr.push({ t: "", fill: BIRU });
            rows.push(rr);
          });
        }
        if (awal > 0) { L.ensure(60); }
        L.tabel(cols, rows, { fs: 7.5 });
      }
    }

    /* ===== Detail Iuran ===== */
    var DT = D.detail || [];
    if (DT.length) {
      doc.newPage(); L.y = TOP;
      L.judulHalaman("DETAIL IURAN BULANAN — " + label, "Iuran dasar dan RUKEM (tambahan KK) dipisah. Total dihitung hanya dari yang lunas terkonfirmasi.");
      var wr = { ok: HIJAU, tunggu: KUNING, belum: MERAH };
      var rowsD = DT.map(function (e, i) {
        return [String(i + 1), e.bulan, e.rumah, e.nama, e.petugas, e.metode, { t: e.status, fill: wr[e.k] || null }, rp(e.dasar), rp(e.rukem), rp(e.jumlah), e.tgl];
      });
      rowsD.push([{ t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "TOTAL LUNAS TERKONFIRMASI", b: true, fill: BIRU }, { t: rp(D.detailTot.dasar), b: true, a: "r", fill: BIRU }, { t: rp(D.detailTot.rukem), b: true, a: "r", fill: BIRU }, { t: rp(D.detailTot.jml), b: true, a: "r", fill: BIRU }, { t: "", fill: BIRU }]);
      L.tabel([{ t: "No", w: 24, a: "c" }, { t: "Bulan", w: 62 }, { t: "Blok / No. Rumah", w: 62 }, { t: "Nama Warga", w: 120 }, { t: "Petugas Humas", w: 88 }, { t: "Metode", w: 44, a: "c" }, { t: "Status", w: 138 }, { t: "Iuran Dasar (Rp)", w: 58, a: "r" }, { t: "RUKEM (Rp)", w: 52, a: "r" }, { t: "Total (Rp)", w: 58, a: "r" }, { t: "Tgl Konfirmasi", w: 56, a: "c" }], rowsD, { fs: 7 });
    }

    /* ===== Rekap Petugas Humas ===== */
    var PT = D.petugas || [];
    if (PT.length) {
      L.ensure(120);
      if (L.y > TOP + 5 && DT.length === 0) { /* tetap di halaman yang sama */ }
      L.seksi("REKAP PER PETUGAS HUMAS — " + label);
      var tp = { rumah: 0, cash: 0, transfer: 0, belum: 0, jml: 0 };
      var rowsP = PT.map(function (p) { Object.keys(tp).forEach(function (k) { tp[k] += p[k]; }); return [p.nama, rp(p.rumah), rp(p.cash), rp(p.transfer), rp(p.belum), rp(p.jml)]; });
      rowsP.push([{ t: "TOTAL", b: true, fill: BIRU }, { t: rp(tp.rumah), b: true, a: "r", fill: BIRU }, { t: rp(tp.cash), b: true, a: "r", fill: BIRU }, { t: rp(tp.transfer), b: true, a: "r", fill: BIRU }, { t: rp(tp.belum), b: true, a: "r", fill: BIRU }, { t: rp(tp.jml), b: true, a: "r", fill: BIRU }]);
      L.tabel([{ t: "Petugas Humas", w: 200 }, { t: "Rumah Tercatat", w: 90, a: "r" }, { t: "Bayar Cash", w: 80, a: "r" }, { t: "Bayar Transfer", w: 90, a: "r" }, { t: "Belum Bayar", w: 80, a: "r" }, { t: "Total Lunas Terkonfirmasi (Rp)", w: 140, a: "r" }], rowsP, { fs: 8.5 });
    }

    /* ===== Transaksi (saldo berjalan) ===== */
    var TR = D.transaksi || [];
    if (TR.length || D.mulaiPeriode) {
      doc.newPage(); L.y = TOP;
      L.judulHalaman("SEMUA TRANSAKSI KAS — " + label);
      var rowsT = [];
      if (D.mulaiPeriode) rowsT.push([{ t: "", fill: ABU }, { t: "", fill: ABU }, { t: "", fill: ABU }, { t: "", fill: ABU }, { t: "Saldo awal periode", b: true, fill: ABU }, { t: "", fill: ABU }, { t: "", fill: ABU }, { t: rp(D.saldoAwal), b: true, a: "r", fill: ABU }]);
      TR.forEach(function (t, i) {
        rowsT.push([String(i + 1), t.tgl, t.jenis, t.kategori, t.ket, t.masuk ? rp(t.masuk) : "", t.keluar ? rp(t.keluar) : "", rp(t.saldo)]);
      });
      rowsT.push([{ t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "TOTAL", b: true, fill: BIRU }, { t: rp(D.totMasuk), b: true, a: "r", fill: BIRU }, { t: rp(D.totKeluar), b: true, a: "r", fill: BIRU }, { t: rp(D.saldoAkhir), b: true, a: "r", fill: BIRU }]);
      L.tabel([{ t: "No", w: 28, a: "c" }, { t: "Tanggal", w: 60, a: "c" }, { t: "Jenis", w: 68, a: "c" }, { t: "Kategori", w: 110 }, { t: "Keterangan", w: 276 }, { t: "Pemasukan (Rp)", w: 78, a: "r" }, { t: "Pengeluaran (Rp)", w: 78, a: "r" }, { t: "Saldo (Rp)", w: 84, a: "r" }], rowsT, { fs: 7.5 });
    }

    /* ===== Footer tiap halaman ===== */
    var n = doc.pages.length, cur = doc.page;
    for (var p = 0; p < n; p++) {
      doc.page = doc.pages[p];
      doc.line(MX, PH - 28, PW - MX, PH - 28, 0.4, 0.6);
      doc.text(MX, PH - 18, "Dibuat lewat Portal Warga RT 08 (PANDU) - Laporan Keuangan " + norm(label) + " - dicetak " + norm(D.dicetak || ""), "R", 7.5, [0.4, 0.4, 0.4]);
      var h = "Hal. " + (p + 1) + " / " + n;
      doc.text(PW - MX - tw(h, "R", 7.5), PH - 18, h, "R", 7.5, [0.4, 0.4, 0.4]);
    }
    doc.page = cur;

    var namaFile = "Laporan-Keuangan_RT08_" + String(label).replace(/[^A-Za-z0-9]+/g, "-") + ".pdf";
    return { bytes: doc.build("Laporan Keuangan RT 08 - " + label), namaFile: namaFile };
  }

  /* ===== PDF RINGKAS UNTUK WARGA: tepat 1 halaman (A4 tegak) =====
     Isi: ringkasan kas, rekap pemasukan, detail pengeluaran. Tanpa nama/nomor rumah. */
  function tinggiTabel(cols, rows, fs, pad) {
    var lh = fs + 2.4, h = 0, m = 1;
    cols.forEach(function (c) { m = Math.max(m, wrap(c.t, "B", fs, c.w - 2 * pad).length); });
    h = m * lh + 2 * pad;
    rows.forEach(function (row) {
      var mm = 1;
      row.forEach(function (v, i) { var o = (v && typeof v === "object") ? v : { t: v }, t = o.t == null ? "" : String(o.t); if (t !== "") mm = Math.max(mm, wrap(t, o.b ? "B" : "R", fs, cols[i].w - 2 * pad).length); });
      h += mm * lh + 2 * pad;
    });
    return h;
  }
  function buatWarga(D, logo) {
    D = D || {};
    ukuran(true);
    var doc = new Doc(), L = new Layout(doc), label = D.label || "-";
    var kop = "LAPORAN KEUANGAN " + (D.rtRw || "RT 08 / RW 021");
    var yTop = L.y, xt = MX;
    if (logo && logo.bytes) { doc.drawImage(doc.addImage(logo.bytes, logo.w, logo.h), MX, yTop, 40, 40 * logo.h / logo.w); xt = MX + 50; }
    doc.text(xt, yTop + 15, norm(kop), "B", 15, NAVY);
    doc.text(xt, yTop + 28, norm(D.kompleks || "VILLA INDAH PULO TIMAHA"), "B", 10, NAVY);
    doc.text(xt, yTop + 40, "Periode: " + norm(label) + "   |   Dicetak: " + norm(D.dicetak || ""), "R", 8.5, [0.3, 0.3, 0.3]);
    L.y = yTop + 52;
    doc.line(MX, L.y, MX + CW, L.y, 1.2, 0.3); L.y += 10;

    /* ringkasan kas */
    L.seksi("RINGKASAN KAS");
    var kotak = [["Saldo Awal", D.saldoAwal, null], ["Pemasukan", D.totMasuk, [0.1, 0.5, 0.25]], ["Pengeluaran", D.totKeluar, [0.7, 0.15, 0.15]], ["Saldo Akhir", D.saldoAkhir, NAVY]];
    var bw = (CW - 3 * 6) / 4, by = L.y;
    kotak.forEach(function (k, i) {
      var x = MX + i * (bw + 6);
      doc.rect(x, by, bw, 40, { fill: i === 3 ? BIRU : ABU, stroke: [0.8, 0.8, 0.8], lw: 0.5 });
      doc.text(x + 7, by + 14, norm(k[0]), "R", 8, [0.35, 0.35, 0.35]);
      doc.text(x + 7, by + 31, norm(rpR(k[1])), "B", 12, k[2] || [0, 0, 0]);
    });
    L.y = by + 40 + 10;

    /* rekap pemasukan */
    var pk = D.pemasukanKat || [], totN = 0, totM = 0;
    L.seksi("REKAP PEMASUKAN");
    var rowsM = pk.map(function (k) { totN += k.n; totM += k.total; return [k.nama, rp(k.n), rp(k.total)]; });
    if (!rowsM.length) rowsM.push([{ t: "Belum ada pemasukan pada periode ini", a: "l" }, "", ""]);
    else rowsM.push([{ t: "TOTAL PEMASUKAN", b: true, fill: BIRU }, { t: rp(totN), b: true, a: "r", fill: BIRU }, { t: rp(totM), b: true, a: "r", fill: BIRU }]);
    L.tabel([{ t: "Kategori", w: CW - 100 - 150 }, { t: "Jumlah Transaksi", w: 100, a: "r" }, { t: "Total (Rp)", w: 150, a: "r" }], rowsM, { fs: 8.5, pad: 2.6 });

    /* detail pengeluaran — dipadatkan otomatis agar tetap 1 halaman */
    var NOTE = 44;
    L.seksi("DETAIL PENGELUARAN");
    var kolP = [{ t: "No", w: 22, a: "c" }, { t: "Tanggal", w: 56, a: "c" }, { t: "Kategori", w: 100 }, { t: "Keterangan", w: CW - 22 - 56 - 100 - 90 }, { t: "Jumlah (Rp)", w: 90, a: "r" }];
    var px = (D.pengeluaran || []).slice(), totK = 0;
    px.forEach(function (e) { totK += e.jumlah; });
    function barisP(list, lain) {
      var rows = list.map(function (e, i) { return [String(i + 1), e.tgl, e.kategori, e.ket, rp(e.jumlah)]; });
      if (lain) rows.push(["", "", "", { t: "Lain-lain (" + lain.n + " transaksi kecil)", b: false }, rp(lain.total)]);
      rows.push([{ t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "", fill: BIRU }, { t: "TOTAL PENGELUARAN", b: true, fill: BIRU }, { t: rp(totK), b: true, a: "r", fill: BIRU }]);
      return rows;
    }
    var sisa = BOT - L.y - NOTE, fsPilih = 0, fsList = [8.5, 8, 7.5, 7, 6.5, 6], rows = null, padP = 2.6, lainInfo = null, i;
    if (!px.length) { rows = [[{ t: "Belum ada pengeluaran pada periode ini", a: "l" }, "", "", "", ""]]; fsPilih = 8.5; }
    else {
      for (i = 0; i < fsList.length && !fsPilih; i++) {
        padP = fsList[i] >= 8 ? 2.6 : 1.8;
        if (tinggiTabel(kolP, barisP(px, null), fsList[i], padP) <= sisa) { fsPilih = fsList[i]; rows = barisP(px, null); }
      }
      if (!fsPilih) {
        /* tetap kepanjangan: tampilkan yang terbesar, sisanya digabung "Lain-lain" */
        fsPilih = 6; padP = 1.8;
        var urut = px.map(function (e, k) { return { e: e, k: k }; }).sort(function (a, b) { return b.e.jumlah - a.e.jumlah; });
        var simpan = urut.length;
        while (simpan > 1) {
          var pilih = urut.slice(0, simpan), sisaList = urut.slice(simpan), lain = sisaList.length ? { n: sisaList.length, total: sisaList.reduce(function (a, o) { return a + o.e.jumlah; }, 0) } : null;
          var tampil = pilih.sort(function (a, b) { return a.k - b.k; }).map(function (o) { return o.e; });
          var rr = barisP(tampil, lain);
          if (tinggiTabel(kolP, rr, fsPilih, padP) <= sisa) { rows = rr; break; }
          simpan--; urut = urut.sort(function (a, b) { return b.e.jumlah - a.e.jumlah; });
        }
        if (!rows) rows = barisP([], { n: px.length, total: totK });
      }
    }
    L.tabel(kolP, rows, { fs: fsPilih, pad: padP });

    /* catatan + pengurus */
    var ny = Math.min(L.y + 4, BOT - NOTE + 6);
    doc.text(MX, ny + 8, "Laporan ini dibagikan untuk keterbukaan kepada warga. Pertanyaan atau koreksi, silakan hubungi Bendahara / Pengurus RT.", "R", 7.5, [0.35, 0.35, 0.35]);
    doc.text(MX, ny + 20, "Bendahara RT: " + norm(D.namaBendahara || "-") + "   |   Ketua RT: " + norm(D.namaKetua || "-"), "B", 8, [0.2, 0.2, 0.2]);

    /* footer */
    doc.line(MX, PH - 28, PW - MX, PH - 28, 0.4, 0.6);
    doc.text(MX, PH - 18, "Dibuat lewat Portal Warga RT 08 (PANDU) - Laporan untuk warga " + norm(label), "R", 7.5, [0.4, 0.4, 0.4]);

    var namaFile = "Laporan-Keuangan-Warga_RT08_" + String(label).replace(/[^A-Za-z0-9]+/g, "-") + ".pdf";
    return { bytes: doc.build("Laporan Keuangan Warga RT 08 - " + label), namaFile: namaFile, halaman: doc.pages.length };
  }

  var API = { buat: buat, buatWarga: buatWarga };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.RTLaporanPDF = API;
})(typeof window !== "undefined" ? window : this);
