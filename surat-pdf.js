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

  /* ---------- Logo kop tertanam (RW kiri, RT kanan) ----------
     Ditanam langsung di file ini supaya logo SELALU muncul di PDF,
     walau folder assets/ belum di-upload atau gagal dimuat. */
  var LOGO_TANAM = {
    rw: { w: 300, h: 259, b64: "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" },
    rt: { w: 300, h: 300, b64: "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" }
  };
  function logoTanam(k) {
    var e = LOGO_TANAM[k];
    if (!e) return null;
    if (!e.bytes) {
      var bin = (typeof atob === "function") ? atob(e.b64) : Buffer.from(e.b64, "base64").toString("binary");
      var u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      e.bytes = u;
    }
    return { bytes: e.bytes, w: e.w, h: e.h };
  }

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
    lg = { rw: lg.rw || logoTanam("rw"), rt: lg.rt || logoTanam("rt") };   // pakai logo tertanam jika kosong
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
