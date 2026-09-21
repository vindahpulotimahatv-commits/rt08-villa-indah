/* ============================================================
   surat-pdf.js — Pembuat SURAT PDF untuk Layanan Warga RT 08
   ------------------------------------------------------------
   - Tanpa library luar (tidak perlu jsPDF dsb) dan tanpa server.
     PDF dibuat langsung di HP/laptop warga, data TIDAK disimpan.
   - Dipakai oleh layanan.html. Isi surat & kolom form tiap layanan
     ada di objek JENIS di bawah — boleh diedit kalau redaksi atau
     kolom formnya ingin diubah.
   - Data instansi (nama RT/RW, ketua, kompleks) diambil dari config.js.
   ============================================================ */
(function (root) {
  "use strict";

  /* ---------- Lebar huruf Times (per 1000 unit, kode 32..255) ---------- */
  var W={
    R:[250,333,408,500,500,833,778,180,333,333,500,564,250,333,250,278,500,500,500,500,500,500,500,500,500,500,278,278,564,564,564,444,921,722,667,667,722,611,556,722,722,333,389,722,611,889,722,722,556,722,667,556,611,722,722,944,722,722,611,333,278,333,469,500,333,444,500,444,500,444,333,500,500,278,278,500,278,778,500,500,500,500,333,389,278,500,500,722,500,500,444,480,200,480,541,761,500,250,333,500,444,1000,500,500,333,1000,556,333,889,250,611,250,250,333,333,444,444,350,500,1000,333,980,389,333,722,250,444,722,250,333,500,500,500,500,200,500,333,760,276,500,564,333,760,333,400,564,300,300,333,500,453,250,333,300,310,500,750,750,750,444,722,722,722,722,722,722,889,667,611,611,611,611,333,333,333,333,722,722,722,722,722,722,722,564,722,722,722,722,722,722,556,500,444,444,444,444,444,444,667,444,444,444,444,444,278,278,278,278,500,500,500,500,500,500,500,564,500,500,500,500,500,500,500,500],
    B:[250,333,555,500,500,1000,833,278,333,333,500,570,250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,570,570,570,500,930,722,667,722,722,667,611,778,778,389,500,778,667,944,722,778,611,778,722,556,667,722,722,1000,722,722,667,333,278,333,581,500,333,500,556,444,556,444,333,500,556,278,333,556,278,833,556,500,556,556,444,389,333,556,500,722,500,500,444,394,220,394,520,761,500,250,333,500,500,1000,500,500,333,1000,556,333,1000,250,667,250,250,333,333,500,500,350,500,1000,333,1000,389,333,722,250,444,722,250,333,500,500,500,500,220,500,333,747,300,500,570,333,747,333,400,570,300,300,333,556,540,250,333,300,330,500,750,750,750,500,722,722,722,722,722,722,1000,722,667,667,667,667,389,389,389,389,722,722,778,778,778,778,778,570,778,722,722,722,722,722,611,556,500,500,500,500,500,500,722,444,444,444,444,444,278,278,278,278,500,556,500,500,500,500,500,570,500,556,556,556,556,500,556,500],
    I:[250,333,420,500,500,833,778,214,333,333,500,675,250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,675,675,675,500,920,611,611,667,722,611,611,722,722,333,444,667,556,833,667,722,611,722,611,500,556,722,611,833,611,556,556,389,278,389,422,500,333,500,500,444,500,444,278,500,500,278,278,444,278,722,500,500,500,500,389,389,278,500,444,667,444,444,389,400,275,400,541,761,500,250,333,500,556,889,500,500,333,1000,500,333,944,250,556,250,250,333,333,556,556,350,500,889,333,980,389,333,667,250,389,556,250,389,500,500,500,500,275,500,333,760,276,500,675,333,760,333,400,675,300,300,333,500,523,250,333,300,310,500,750,750,750,500,611,611,611,611,611,611,889,667,611,611,611,611,333,333,333,333,722,667,722,722,722,722,722,675,722,722,722,722,722,556,611,500,500,500,500,500,500,500,667,444,444,444,444,444,278,278,278,278,500,500,500,500,500,500,500,675,500,500,500,500,500,444,500,444]
  };

  var PAGE_W = 595.28, PAGE_H = 841.89;
  var FONT_ID = { R: "F1", B: "F2", I: "F3" };
  var FONT_NAME = { R: "Times-Roman", B: "Times-Bold", I: "Times-Italic" };

  var CP1252 = {
    0x20AC:128,0x201A:130,0x0192:131,0x201E:132,0x2026:133,0x2020:134,0x2021:135,0x02C6:136,
    0x2030:137,0x0160:138,0x2039:139,0x0152:140,0x017D:142,0x2018:145,0x2019:146,0x201C:147,
    0x201D:148,0x2022:149,0x2013:150,0x2014:151,0x02DC:152,0x2122:153,0x0161:154,0x203A:155,
    0x0153:156,0x017E:158,0x0178:159
  };

  /* Ubah teks bebas menjadi "string byte" WinAnsi (cp1252) yang aman untuk PDF. */
  function norm(s) {
    s = String(s == null ? "" : s);
    var o = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 10) o += "\n";
      else if (c === 9) o += " ";
      else if (c < 32 || c === 127) { /* buang karakter kontrol */ }
      else if (c < 127 || (c >= 160 && c <= 255)) o += s.charAt(i);
      else if (CP1252[c]) o += String.fromCharCode(CP1252[c]);
      else o += "?";
    }
    return o;
  }

  function textWidth(s, font, size) {
    var t = W[font], w = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 32 && c <= 255) w += t[c - 32];
    }
    return w * size / 1000;
  }

  function n2(v) { return String(Math.round(v * 100) / 100); }
  function esc(s) { return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
  function latin1(s) {
    var u = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255;
    return u;
  }

  /* ---------- Penulis PDF tingkat rendah ---------- */
  function Doc() {
    this.pages = [];
    this.images = [];
    this.newPage();
  }
  Doc.prototype.newPage = function () {
    this.page = { ops: [], imgs: {} };
    this.pages.push(this.page);
  };
  Doc.prototype.text = function (x, y, s, font, size, o) {
    o = o || {};
    var op = "BT ";
    if (o.gray != null) op += n2(o.gray) + " g ";
    op += "/" + FONT_ID[font] + " " + n2(size) + " Tf ";
    if (o.ws) op += n2(o.ws) + " Tw ";
    op += n2(x) + " " + n2(PAGE_H - y) + " Td (" + esc(s) + ") Tj ";
    if (o.ws) op += "0 Tw ";
    op += "ET";
    if (o.gray != null) op += " 0 g";
    this.page.ops.push(op);
  };
  Doc.prototype.line = function (x1, y1, x2, y2, w, gray) {
    this.page.ops.push((gray != null ? n2(gray) + " G " : "") + n2(w) + " w " + n2(x1) + " " + n2(PAGE_H - y1) +
      " m " + n2(x2) + " " + n2(PAGE_H - y2) + " l S" + (gray != null ? " 0 G" : ""));
  };
  Doc.prototype.addImage = function (bytes, w, h) {
    this.images.push({ bytes: bytes, w: w, h: h });
    return this.images.length;               // id mulai dari 1
  };
  Doc.prototype.drawImage = function (id, x, y, w, h) {
    this.page.imgs[id] = true;
    this.page.ops.push("q " + n2(w) + " 0 0 " + n2(h) + " " + n2(x) + " " + n2(PAGE_H - y - h) + " cm /Im" + id + " Do Q");
  };

  Doc.prototype.build = function (title) {
    var chunks = [], offset = 0, xref = [];
    function put(x) {
      var b = (typeof x === "string") ? latin1(x) : x;
      chunks.push(b); offset += b.length;
    }
    function begin(id) { xref[id] = offset; put(id + " 0 obj\n"); }
    function end() { put("\nendobj\n"); }

    var nImg = this.images.length, nPg = this.pages.length;
    var firstImg = 7, firstPage = firstImg + nImg;   // tiap halaman: 2 objek (halaman, isi)
    var i, kids = [];
    for (i = 0; i < nPg; i++) kids.push((firstPage + i * 2) + " 0 R");

    put("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    begin(1); put("<< /Type /Catalog /Pages 2 0 R >>"); end();
    begin(2); put("<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + nPg + " >>"); end();
    var fk = ["R", "B", "I"];
    for (i = 0; i < 3; i++) {
      begin(3 + i);
      put("<< /Type /Font /Subtype /Type1 /BaseFont /" + FONT_NAME[fk[i]] + " /Encoding /WinAnsiEncoding >>");
      end();
    }
    var d = new Date(), p2 = function (v) { return (v < 10 ? "0" : "") + v; };
    var stamp = "D:" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds());
    begin(6);
    put("<< /Title (" + esc(norm(title || "Surat").replace(/[\x80-\x9f]/g, "'")) + ") /Producer (Portal Warga RT 08) /Creator (Portal Warga RT 08) /CreationDate (" + stamp + ") >>");
    end();
    for (i = 0; i < nImg; i++) {
      var im = this.images[i];
      begin(firstImg + i);
      put("<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h +
          " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + im.bytes.length + " >>\nstream\n");
      put(im.bytes);
      put("\nendstream");
      end();
    }
    for (i = 0; i < nPg; i++) {
      var pg = this.pages[i], pid = firstPage + i * 2, cid = pid + 1, xo = "";
      for (var k in pg.imgs) xo += "/Im" + k + " " + (firstImg + Number(k) - 1) + " 0 R ";
      begin(pid);
      put("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + n2(PAGE_W) + " " + n2(PAGE_H) + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>" +
          (xo ? " /XObject << " + xo + ">>" : "") + " >> /Contents " + cid + " 0 R >>");
      end();
      var content = latin1(pg.ops.join("\n"));
      begin(cid);
      put("<< /Length " + content.length + " >>\nstream\n");
      put(content);
      put("\nendstream");
      end();
    }
    var total = firstPage + nPg * 2, xrefPos = offset;
    put("xref\n0 " + total + "\n0000000000 65535 f \n");
    for (i = 1; i < total; i++) put(("0000000000" + xref[i]).slice(-10) + " 00000 n \n");
    put("trailer\n<< /Size " + total + " /Root 1 0 R /Info 6 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF\n");

    var out = new Uint8Array(offset), pos = 0;
    for (i = 0; i < chunks.length; i++) { out.set(chunks[i], pos); pos += chunks[i].length; }
    return out;
  };

  /* ---------- Tata letak ---------- */
  function wrap(str, font, size, maxW) {
    var out = [];
    str.split("\n").forEach(function (par) {
      if (par.replace(/ /g, "") === "") { out.push({ t: "", last: true }); return; }
      var words = par.split(/ +/), line = "";
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (!w) continue;
        while (textWidth(w, font, size) > maxW) {          // kata terlalu panjang: potong
          if (line) { out.push({ t: line, last: false }); line = ""; }
          var k = 1;
          while (k < w.length && textWidth(w.slice(0, k + 1), font, size) <= maxW) k++;
          out.push({ t: w.slice(0, k), last: false });
          w = w.slice(k);
        }
        if (!w) continue;
        var test = line ? line + " " + w : w;
        if (textWidth(test, font, size) <= maxW) line = test;
        else { out.push({ t: line, last: false }); line = w; }
      }
      out.push({ t: line, last: true });
    });
    return out;
  }

  function Layout(doc) {
    this.doc = doc;
    this.ml = 68; this.mr = 68;
    this.w = PAGE_W - this.ml - this.mr;
    this.y = 56;
    this.bottom = PAGE_H - 72;
  }
  Layout.prototype.ensure = function (h) {
    if (this.y + h > this.bottom) { this.doc.newPage(); this.y = 56; }
  };
  Layout.prototype.space = function (h) { this.y += h; };
  Layout.prototype.center = function (s, font, size, lead) {
    s = norm(s);
    this.ensure(lead || size * 1.3);
    this.doc.text((PAGE_W - textWidth(s, font, size)) / 2, this.y + size, s, font, size);
    this.y += lead || size * 1.3;
  };
  /* Paragraf berbaris rata kiri-kanan (justify) */
  Layout.prototype.p = function (s, o) {
    o = o || {};
    var font = o.font || "R", size = o.size || 12, lead = o.lead || size * 1.45;
    var x = o.x != null ? o.x : this.ml, w = o.w || this.w;
    var lines = wrap(norm(s), font, size, w);
    for (var i = 0; i < lines.length; i++) {
      this.ensure(lead);
      var ln = lines[i], opt = {};
      if (o.justify && !ln.last && ln.t) {
        var sp = (ln.t.match(/ /g) || []).length, gap = w - textWidth(ln.t, font, size);
        if (sp > 0 && gap < w * 0.3) opt.ws = gap / sp;
      }
      if (ln.t) this.doc.text(x, this.y + size, ln.t, font, size, opt);
      this.y += lead;
    }
    if (o.after) this.y += o.after;
  };
  /* Tabel "Label : Nilai" — baris bernilai kosong dilewati */
  Layout.prototype.rows = function (list, o) {
    o = o || {};
    var size = o.size || 12, lead = size * 1.45, labelW = o.labelW || 128, indent = o.indent != null ? o.indent : 14;
    var x0 = this.ml + indent, vx = x0 + labelW + 12, vw = this.w - indent - labelW - 12;
    for (var i = 0; i < list.length; i++) {
      var label = norm(list[i][0]), val = norm(list[i][1]).replace(/\s+$/, "");
      if (!val) continue;
      var lines = wrap(val, "R", size, vw);
      this.ensure(lead * Math.min(lines.length, 2));
      this.doc.text(x0, this.y + size, label, "R", size);
      this.doc.text(x0 + labelW, this.y + size, ":", "R", size);
      for (var j = 0; j < lines.length; j++) {
        this.ensure(lead);
        if (lines[j].t) this.doc.text(vx, this.y + size, lines[j].t, "R", size);
        this.y += lead;
      }
    }
  };
  /* Blok tanda tangan: kiri (opsional) + kanan. Ruang kosong disediakan untuk TTD & stempel. */
  Layout.prototype.sign = function (left, right, tempatTgl) {
    var size = 12, colW = 200, gapTtd = 78;
    this.ensure(28 + 16 + gapTtd + 30);
    var xl = this.ml + 6, xr = PAGE_W - this.mr - colW;
    var ml = this.ml, mr = this.mr;
    var cx = function (x, s, f) {
      var w = textWidth(s, f, size), px = x + (colW - w) / 2;
      return Math.max(ml, Math.min(px, PAGE_W - mr - w));   // jangan keluar margin
    };
    var d = this.doc, y = this.y;
    var t = norm(tempatTgl);
    d.text(cx(xr, t, "R"), y + size, t, "R", size);
    y += 17;
    var l1 = norm(left.jabatan), r1 = norm(right.jabatan);
    d.text(cx(xl, l1, "R"), y + size, l1, "R", size);
    d.text(cx(xr, r1, "R"), y + size, r1, "R", size);
    y += 17 + gapTtd;
    var ln = norm(left.nama), rn = norm(right.nama);
    var fl = left.bold ? "B" : "R", fr = right.bold ? "B" : "R";
    d.text(cx(xl, ln, fl), y + size, ln, fl, size);
    d.text(cx(xr, rn, fr), y + size, rn, fr, size);
    var uw = textWidth(rn, fr, size), ux = cx(xr, rn, fr);
    d.line(ux, y + size + 1.5, ux + uw, y + size + 1.5, 0.7);
    var lw = textWidth(ln, fl, size), lx = cx(xl, ln, fl);
    d.line(lx, y + size + 1.5, lx + lw, y + size + 1.5, 0.7);
    this.y = y + 30;
  };

  /* ---------- Tanggal Indonesia ---------- */
  var BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  var ROMAWI = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  function tgl(iso, denganHari) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!m) return String(iso || "");
    var y = +m[1], mo = +m[2], d = +m[3];
    var s = d + " " + BULAN[mo - 1] + " " + y;
    if (denganHari) s = HARI[new Date(y, mo - 1, d).getDay()] + ", " + s;
    return s;
  }
  function rapikan(s) { return String(s == null ? "" : s).replace(/[ \t]+/g, " ").replace(/^\s+|\s+$/g, ""); }

  /* ---------- Kop surat & footer ---------- */
  /* Kop resmi: 2 logo (RW di kiri, RT di kanan) mengapit 5 baris teks di tengah,
     lalu garis ganda. Teks otomatis diperkecil kalau terlalu panjang untuk muat. */
  function fitSize(s, font, size, maxW) {
    while (size > 7 && textWidth(s, font, size) > maxW) size -= 0.25;
    return size;
  }
  function kop(L, c, logo) {
    var d = L.doc, top = 36, H = 62, gap = 10;
    var lg = logo || {};
    if (lg.bytes) lg = { rw: lg, rt: null };          // kompatibel dengan 1 logo saja
    var sideW = 72;                                     // lebar sisi yang disisihkan untuk logo
    var textW = PAGE_W - L.ml - L.mr - 2 * (sideW + gap);

    var lines = [
      { s: c.kopPemerintah, f: "B", z: 14 },
      { s: c.kopKecamatan,  f: "B", z: 13 },
      { s: c.kopRTRW,       f: "B", z: 14 },
      { s: c.alamatKop,     f: "B", z: 11 },
      { s: c.emailKop ? "email : " + c.emailKop : "", f: "R", z: 10.5 }
    ].filter(function (t) { return t.s; });
    lines.forEach(function (t) {
      t.s = norm(t.s); t.z = fitSize(t.s, t.f, t.z, textW); t.h = t.z * 1.22;
    });
    var blockH = lines.reduce(function (a, t) { return a + t.h; }, 0);
    var contentH = Math.max(blockH, H);

    var y = top + (contentH - blockH) / 2;
    lines.forEach(function (t) {
      d.text((PAGE_W - textWidth(t.s, t.f, t.z)) / 2, y + t.z * 0.95, t.s, t.f, t.z);
      y += t.h;
    });

    function logoAt(im, side) {
      if (!im) return;
      var h = H, w = H * im.w / im.h;
      if (w > sideW) { w = sideW; h = w * im.h / im.w; }
      var x = side === "L" ? L.ml : PAGE_W - L.mr - w;
      d.drawImage(d.addImage(im.bytes, im.w, im.h), x, top + (contentH - h) / 2, w, h);
    }
    logoAt(lg.rw, "L");
    logoAt(lg.rt, "R");

    var ly = top + contentH + 7;
    d.line(L.ml, ly, PAGE_W - L.mr, ly, 2.2);
    d.line(L.ml, ly + 3.6, PAGE_W - L.mr, ly + 3.6, 0.6);
    L.y = ly + 26;
  }
  function judul(L, s) {
    s = norm(s);
    var size = 14, wd = textWidth(s, "B", size), x = (PAGE_W - wd) / 2;
    L.ensure(24);
    L.doc.text(x, L.y + size, s, "B", size);
    L.doc.line(x, L.y + size + 2.5, x + wd, L.y + size + 2.5, 0.9);
    L.y += 22;
  }
  function nomorSurat(L, c) {
    L.center("Nomor : ........ / RT." + c.rt + " / RW." + c.rw + " / " + c.bulanRomawi + " / " + c.tahun, "R", 12, 24);
  }
  function footer(doc, kode) {
    var n = doc.pages.length, cur = doc.page;
    for (var i = 0; i < n; i++) {
      doc.page = doc.pages[i];
      var s = "Dibuat lewat Portal Warga RT 08 • Kode: " + kode + (n > 1 ? " • Hal. " + (i + 1) + "/" + n : "") +
              " • Surat ini baru sah setelah ditandatangani dan distempel pengurus RT.";
      var lines = wrap(norm(s), "I", 8, PAGE_W - 136);
      doc.line(68, PAGE_H - 62, PAGE_W - 68, PAGE_H - 62, 0.4, 0.6);
      for (var j = 0; j < lines.length; j++) doc.text(68, PAGE_H - 50 + j * 10, lines[j].t, "I", 8, { gray: 0.4 });
    }
    doc.page = cur;
  }

  /* ---------- Definisi layanan: kolom form + isi surat ---------- */
  var JK = ["Laki-laki", "Perempuan"];
  var AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
  var KAWIN = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];

  function alamatRumah(d, c) { return "Blok/No. " + d.blok + ", " + c.kompleks + ", RT " + c.rt + " / RW " + c.rw; }
  function pembuka(L, c) {
    L.p("Yang bertanda tangan di bawah ini, Ketua RT " + c.rt + " RW " + c.rw + " " + c.kompleks + ", menerangkan bahwa:", { justify: true, after: 4 });
  }
  function penutup(L) {
    L.space(4);
    L.p("Demikian surat ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.", { justify: true, after: 14 });
  }
  function ttdRT(L, c, d) {
    L.sign({ jabatan: "Pemohon,", nama: d.nama }, { jabatan: "Ketua RT " + c.rt + " / RW " + c.rw, nama: c.ketua, bold: true }, c.tempat + ", " + c.tglHariIni);
  }

  var JENIS = {
    suratPengantar: {
      kode: "SP", judul: "Surat Pengantar", ikon: "📝", nomorWA: "waSekretaris", pengurus: "namaSekretaris",
      fields: [
        { id: "nama", label: "Nama Lengkap", req: 1, full: 1 },
        { id: "nik", label: "NIK (16 digit)", type: "nik", req: 1 },
        { id: "hp", label: "Nomor WhatsApp", type: "tel", ph: "08xxxxxxxxxx" },
        { id: "tempatLahir", label: "Tempat Lahir", req: 1 },
        { id: "tglLahir", label: "Tanggal Lahir", type: "date", req: 1 },
        { id: "jk", label: "Jenis Kelamin", type: "select", opts: JK, req: 1 },
        { id: "agama", label: "Agama", type: "select", opts: AGAMA },
        { id: "status", label: "Status Perkawinan", type: "select", opts: KAWIN },
        { id: "pekerjaan", label: "Pekerjaan" },
        { id: "blok", label: "Blok / No. Rumah", type: "rumah", req: 1, full: 1 },
        { id: "keperluan", label: "Keperluan Surat", type: "textarea", req: 1, full: 1, ph: "Contoh: Pengurusan KTP / KK / SKCK / surat keterangan domisili..." },
        { id: "tujuan", label: "Ditujukan kepada (opsional)", full: 1, ph: "Contoh: Kelurahan / Kecamatan / nama instansi" }
      ],
      render: function (L, d, c) {
        judul(L, "SURAT PENGANTAR"); nomorSurat(L, c); pembuka(L, c);
        L.rows([
          ["Nama", d.nama], ["NIK", d.nik],
          ["Tempat/Tgl. Lahir", d.tempatLahir + (d.tglLahir ? ", " + tgl(d.tglLahir) : "")],
          ["Jenis Kelamin", d.jk], ["Agama", d.agama], ["Status Perkawinan", d.status],
          ["Pekerjaan", d.pekerjaan], ["Alamat", alamatRumah(d, c)]
        ]);
        L.space(6);
        L.p("Adalah benar yang bersangkutan berdomisili dan tercatat sebagai warga RT " + c.rt + " / RW " + c.rw + " " + c.kompleks +
            ". Surat pengantar ini diberikan untuk keperluan sebagai berikut:", { justify: true, after: 4 });
        L.rows([["Keperluan", d.keperluan], ["Ditujukan kepada", d.tujuan]]);
        penutup(L); ttdRT(L, c, d);
      }
    },

    wargaBaru: {
      kode: "WB", judul: "Lapor Warga Baru", ikon: "🏠", nomorWA: "waSekretaris", pengurus: "namaSekretaris",
      fields: [
        { id: "nama", label: "Nama Lengkap (kepala keluarga/pemohon)", req: 1, full: 1 },
        { id: "nik", label: "NIK (16 digit)", type: "nik", req: 1 },
        { id: "hp", label: "Nomor WhatsApp", type: "tel", ph: "08xxxxxxxxxx" },
        { id: "pekerjaan", label: "Pekerjaan" },
        { id: "jumlah", label: "Jumlah anggota keluarga", type: "number", ph: "Contoh: 4" },
        { id: "blok", label: "Blok / No. Rumah yang ditempati", type: "rumah", req: 1, full: 1 },
        { id: "hunian", label: "Status hunian", type: "select", opts: ["Pemilik", "Sewa / Kontrak", "Menumpang / ikut keluarga"], req: 1 },
        { id: "tglMulai", label: "Mulai menempati sejak", type: "date", req: 1 },
        { id: "asal", label: "Alamat lengkap sebelumnya", type: "textarea", req: 1, full: 1, ph: "Jalan, RT/RW, kelurahan, kota..." }
      ],
      render: function (L, d, c) {
        judul(L, "SURAT PENGANTAR WARGA BARU"); nomorSurat(L, c); pembuka(L, c);
        L.rows([
          ["Nama", d.nama], ["NIK", d.nik], ["Pekerjaan", d.pekerjaan],
          ["Jumlah Anggota Keluarga", d.jumlah ? d.jumlah + " orang" : ""],
          ["Alamat Sekarang", alamatRumah(d, c)], ["Status Hunian", d.hunian],
          ["Menempati Sejak", tgl(d.tglMulai)], ["Alamat Sebelumnya", d.asal]
        ], { labelW: 150 });
        L.space(6);
        L.p("Adalah benar yang bersangkutan merupakan warga baru yang menetap di wilayah RT " + c.rt + " / RW " + c.rw + " " + c.kompleks +
            " dan telah melapor kepada pengurus RT. Surat ini dibuat sebagai pengantar untuk keperluan pelaporan dan pengurusan administrasi kependudukan (domisili).", { justify: true });
        penutup(L); ttdRT(L, c, d);
      }
    },

    wargaPindah: {
      kode: "WP", judul: "Lapor Warga Pindah", ikon: "🚚", nomorWA: "waSekretaris", pengurus: "namaSekretaris",
      fields: [
        { id: "nama", label: "Nama Lengkap (kepala keluarga/pemohon)", req: 1, full: 1 },
        { id: "nik", label: "NIK (16 digit)", type: "nik", req: 1 },
        { id: "hp", label: "Nomor WhatsApp", type: "tel", ph: "08xxxxxxxxxx" },
        { id: "blok", label: "Blok / No. Rumah (alamat asal)", type: "rumah", req: 1, full: 1 },
        { id: "tglPindah", label: "Tanggal pindah", type: "date", req: 1 },
        { id: "jumlah", label: "Jumlah anggota yang pindah", type: "number", ph: "Contoh: 4" },
        { id: "tujuanAlamat", label: "Alamat lengkap tujuan pindah", type: "textarea", req: 1, full: 1, ph: "Jalan, RT/RW, kelurahan, kota..." },
        { id: "alasan", label: "Alasan pindah (opsional)", full: 1 }
      ],
      render: function (L, d, c) {
        judul(L, "SURAT PENGANTAR PINDAH"); nomorSurat(L, c); pembuka(L, c);
        L.rows([
          ["Nama", d.nama], ["NIK", d.nik], ["Alamat Asal", alamatRumah(d, c)],
          ["Alamat Tujuan", d.tujuanAlamat], ["Tanggal Pindah", tgl(d.tglPindah)],
          ["Jumlah yang Pindah", d.jumlah ? d.jumlah + " orang" : ""], ["Alasan Pindah", d.alasan]
        ], { labelW: 140 });
        L.space(6);
        L.p("Adalah benar yang bersangkutan merupakan warga RT " + c.rt + " / RW " + c.rw + " " + c.kompleks +
            " yang bermaksud pindah domisili ke alamat tujuan tersebut di atas. Surat ini dibuat sebagai pengantar untuk keperluan pengurusan surat pindah dan administrasi kependudukan.", { justify: true });
        penutup(L); ttdRT(L, c, d);
      }
    },

    pinjamFasilitas: {
      kode: "PF", judul: "Pinjam Fasilitas", ikon: "🏟️", nomorWA: "waKetua", pengurus: "namaKetua",
      fields: [
        { id: "nama", label: "Nama Pemohon", req: 1, full: 1 },
        { id: "hp", label: "Nomor WhatsApp", type: "tel", req: 1, ph: "08xxxxxxxxxx" },
        { id: "blok", label: "Blok / No. Rumah", type: "rumah", req: 1 },
        { id: "fasilitas", label: "Fasilitas yang dipinjam", type: "text", req: 1, full: 1,
          opts: ["Lapangan RT", "Balai / Pos Warga", "Tenda", "Kursi & meja", "Sound system"], ph: "Pilih dari saran atau ketik sendiri" },
        { id: "tanggal", label: "Tanggal pemakaian", type: "date", req: 1 },
        { id: "jam", label: "Jam", ph: "Contoh: 19.00 - 22.00 WIB" },
        { id: "keperluan", label: "Keperluan / nama acara", type: "textarea", req: 1, full: 1 }
      ],
      render: function (L, d, c) {
        judul(L, "SURAT PERMOHONAN PEMINJAMAN FASILITAS"); L.space(4);
        L.p("Yang bertanda tangan di bawah ini:", { after: 4 });
        L.rows([["Nama", d.nama], ["Alamat", alamatRumah(d, c)], ["No. WhatsApp", d.hp]]);
        L.space(6);
        L.p("Dengan ini mengajukan permohonan untuk menggunakan fasilitas lingkungan RT " + c.rt + " / RW " + c.rw + " " + c.kompleks + " dengan rincian:", { justify: true, after: 4 });
        L.rows([["Fasilitas", d.fasilitas], ["Hari/Tanggal", tgl(d.tanggal, true)], ["Waktu", d.jam], ["Keperluan", d.keperluan]]);
        L.space(6);
        L.p("Kami bersedia menjaga kebersihan, ketertiban, dan keutuhan fasilitas selama digunakan, serta bertanggung jawab atas kerusakan yang mungkin timbul. " +
            "Demikian permohonan ini kami ajukan. Atas persetujuan Bapak/Ibu pengurus RT, kami ucapkan terima kasih.", { justify: true, after: 14 });
        L.sign({ jabatan: "Pemohon,", nama: d.nama }, { jabatan: "Menyetujui, Ketua RT " + c.rt, nama: c.ketua, bold: true }, c.tempat + ", " + c.tglHariIni);
      }
    }
  };

  /* ---------- API ---------- */
  function ctxDari(cfg, now) {
    cfg = cfg || {};
    var rt = String(cfg.namaRT || "").replace(/\D+/g, "") || "08";
    var rw = String(cfg.namaRW || "").replace(/\D+/g, "") || "021";
    var kompleks = cfg.namaKompleks || "Villa Indah Pulo Timaha";
    return {
      rt: rt, rw: rw, kompleks: kompleks,
      ketua: cfg.namaKetua || "Ketua RT",
      tempat: cfg.tempatSurat || kompleks,
      kopPemerintah: cfg.kopPemerintah || "PEMERINTAH KABUPATEN BEKASI",
      kopKecamatan: cfg.kopKecamatan || "KECAMATAN BABELAN",
      kopRTRW: cfg.kopRTRW || ("RUKUN TETANGGA " + ("000" + rt).slice(-3) + ", RUKUN WARGA " + ("000" + rw).slice(-3)),
      alamatKop: cfg.alamatKopSurat || ("Perumahan " + kompleks + ", Desa Babelan Kota"),
      emailKop: cfg.emailKopSurat != null ? cfg.emailKopSurat : "rt008rw021vipt@gmail.com",
      tglHariIni: now.getDate() + " " + BULAN[now.getMonth()] + " " + now.getFullYear(),
      bulanRomawi: ROMAWI[now.getMonth()], tahun: now.getFullYear()
    };
  }

  function bersihkan(J, data) {
    var d = {};
    J.fields.forEach(function (f) {
      var v = data[f.id];
      d[f.id] = f.type === "textarea"
        ? String(v == null ? "" : v).replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").replace(/^\s+|\s+$/g, "")
        : rapikan(v);
    });
    return d;
  }

  function slug(s) {
    return String(s || "").normalize ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) : "warga";
  }

  /* Membuat PDF. Mengembalikan { bytes, namaFile, kode, pesan } */
  function buat(key, data, cfg, logo, now) {
    var J = JENIS[key];
    if (!J) throw new Error("Jenis surat tidak dikenal: " + key);
    now = now || new Date();
    var c = ctxDari(cfg, now), d = bersihkan(J, data || {});
    var p2 = function (v) { return (v < 10 ? "0" : "") + v; };
    var kode = J.kode + "-" + String(now.getFullYear()).slice(2) + p2(now.getMonth() + 1) + p2(now.getDate()) + "-" + (1000 + Math.floor(Math.random() * 9000));
    var doc = new Doc(), L = new Layout(doc);
    kop(L, c, logo);
    J.render(L, d, c);
    footer(doc, kode);
    var bytes = doc.build(J.judul + " - " + d.nama);
    var namaFile = J.judul.replace(/\s+/g, "-") + "_" + (slug(d.nama) || "warga") + "_" + kode + ".pdf";
    var pesan = "Halo Pengurus RT " + c.rt + ", saya " + d.nama + " (Blok/No. " + d.blok + ") mengajukan *" + J.judul +
      "*. Berkas PDF terlampir, mohon ditandatangani dan distempel. Terima kasih. (Kode: " + kode + ")";
    return { bytes: bytes, namaFile: namaFile, kode: kode, pesan: pesan, data: d };
  }

  /* Validasi sederhana. Mengembalikan pesan kesalahan, atau "" jika lolos. */
  function validasi(key, data) {
    var J = JENIS[key], f, v;
    for (var i = 0; i < J.fields.length; i++) {
      f = J.fields[i]; v = rapikan(data[f.id]);
      if (f.req && !v) return "Mohon isi: " + f.label;
      if (f.type === "nik" && v && !/^\d{16}$/.test(v)) return "NIK harus 16 digit angka.";
      if (f.type === "tel" && v && !/^[0-9+\- ]{8,16}$/.test(v)) return "Nomor WhatsApp tidak valid.";
    }
    return "";
  }

  /* Muat logo (PNG/JPG) → JPEG untuk ditanam di PDF. Hanya di browser. */
  function muatLogo(src, lebar) {
    return new Promise(function (resolve) {
      try {
        var img = new Image();
        img.onload = function () {
          try {
            var w = lebar || 220, h = Math.round(w * img.naturalHeight / img.naturalWidth);
            var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
            var g = cv.getContext("2d");
            g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
            var bin = atob(cv.toDataURL("image/jpeg", 0.9).split(",")[1]), u = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
            resolve({ bytes: u, w: w, h: h });
          } catch (e) { resolve(null); }
        };
        img.onerror = function () { resolve(null); };
        img.src = src;
      } catch (e) { resolve(null); }
    });
  }

  var API = { JENIS: JENIS, buat: buat, validasi: validasi, muatLogo: muatLogo, _wrap: wrap, _tw: textWidth };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.RTSurat = API;
})(typeof window !== "undefined" ? window : globalThis);
