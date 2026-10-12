/* ============================================================
   IURAN TAMBAHAN (iuran di luar iuran bulanan) — bagian bersama untuk Admin, Humas, dan Bendahara.
   Data:
     iuranKhusus/{id}   = { judul, jumlah (per rumah, ditetapkan Admin), keterangan?, aktif, createdAt, updatedAt }
     pemasukanLain/{id} = pembayaran warga (iuranId = id iuran tambahan bila ada).
       Alur uang tunai : Humas catat -> Humas "Serahkan" (disetor) -> Bendahara "Terima" (diterima)
       Transfer        : Humas/Bendahara catat -> Bendahara cek & "Terima" (diterima)
   ============================================================ */
(function (g) {
  function nk(s) { return String(s || "").toLowerCase().replace(/[\s\/\-\.]+/g, ""); }
  function rp(n) { return "Rp " + Math.round(n || 0).toLocaleString("id-ID"); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function tglIndo(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : (s || "-"); }

  /* Ringkasan tiap iuran tambahan: berapa rumah sudah bayar, dan posisi uangnya. */
  function rekap(iuran, pemasukan, daftarRumah) {
    var out = [], rumah = daftarRumah || [];
    Object.keys(iuran || {}).forEach(function (id) {
      var ik = iuran[id] || {};
      var r = { id: id, judul: ik.judul || "", jumlah: ik.jumlah || 0, aktif: ik.aktif === true, keterangan: ik.keterangan || "", createdAt: ik.createdAt || 0,
        n: 0, total: 0, tangan: 0, serah: 0, rekening: 0, terima: 0, paid: {} };
      Object.keys(pemasukan || {}).forEach(function (pid) {
        var p = pemasukan[pid];
        if (!p || p.iuranId !== id) return;
        r.n++; r.total += p.jumlah || 0; r.paid[nk(p.rumah)] = true;
        if (p.diterima) r.terima += p.jumlah || 0;
        else if (p.metode === "transfer") r.rekening += p.jumlah || 0;
        else if (p.disetor) r.serah += p.jumlah || 0;
        else r.tangan += p.jumlah || 0;
      });
      r.target = rumah.length;
      r.belum = rumah.filter(function (x) { return !r.paid[nk(x)]; });
      r.sudahRumah = r.target - r.belum.length;
      out.push(r);
    });
    out.sort(function (a, b) { return (b.aktif ? 1 : 0) - (a.aktif ? 1 : 0) || (b.createdAt || 0) - (a.createdAt || 0); });
    return out;
  }

  function kartuHtml(r, o) {
    o = o || {};
    var pct = r.target ? Math.round(r.sudahRumah * 100 / r.target) : 0;
    var h = '<div class="ik-card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><b style="font-size:15px">' + esc(r.judul) + '</b>' +
      '<div style="font-size:12px;color:#59657f">' + rp(r.jumlah) + ' per rumah' + (r.keterangan ? ' · ' + esc(r.keterangan) : '') + '</div></div>' +
      '<span class="ik-badge ' + (r.aktif ? "on" : "off") + '">' + (r.aktif ? "AKTIF" : "NONAKTIF") + '</span></div>' +
      '<div style="margin:10px 0 4px;font-size:12px;font-weight:800">' + r.sudahRumah + ' dari ' + r.target + ' rumah sudah bayar (' + pct + '%)</div>' +
      '<div class="ik-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="ik-stat"><div><b>' + rp(r.total) + '</b><span>Terkumpul</span></div><div><b>' + rp(r.tangan) + '</b><span>Di tangan Humas</span></div>' +
      '<div><b>' + rp(r.serah + r.rekening) + '</b><span>Menunggu Bendahara</span></div><div><b>' + rp(r.terima) + '</b><span>Diterima Bendahara</span></div></div>';
    if (o.belum !== false) h += '<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12.5px;font-weight:800">Belum bayar (' + r.belum.length + ')</summary>' +
      '<div style="font-size:12.5px;line-height:1.7;color:#59657f;margin-top:6px">' + (r.belum.length ? r.belum.map(esc).join(", ") : "Semua rumah sudah bayar.") + '</div></details>';
    if (o.aksi) h += o.aksi;
    return h + '</div>';
  }

  /* Kwitansi PDF pembayaran (memakai tata letak kwitansi iuran). Perlu surat-pdf.js */
  function pdf(rec, kode, tglHariIni) {
    if (typeof RTSurat === "undefined") throw new Error("surat-pdf.js belum termuat");
    var rincian = (rec.keterangan || rec.jenis) + ((rec.tglBayar && rec.tglBayar !== tglHariIni) ? " (dibayar " + tglIndo(rec.tglBayar) + ")" : "");
    return RTSurat.buat("kwitansiLain", {
      nama: rec.nama || "-", blok: rec.rumah, bulan: rec.jenis, untukLabel: "Untuk", judulKw: "KWITANSI PEMBAYARAN",
      rincian: rincian, jumlah: rp(rec.jumlah), metode: rec.metode === "transfer" ? "Transfer" : "Tunai (Cash)", petugas: rec.petugas
    }, g.RT_CONFIG, null, new Date(), kode);
  }
  function kodeBaru(tgl, pemasukan) {
    var pakai = [];
    Object.keys(pemasukan || {}).forEach(function (k) { if (pemasukan[k] && pemasukan[k].kodeKwitansi) pakai.push(pemasukan[k].kodeKwitansi); });
    return g.RTSurat.kodeInvoice(String(tgl || "").slice(0, 7), pakai);
  }

  var CSS = ".ik-card{border:1px solid #dbe2f0;border-radius:16px;padding:12px 14px;margin:8px 14px;background:#fff}" +
    ".ik-badge{border-radius:99px;padding:3px 10px;font-size:10.5px;font-weight:900;letter-spacing:.4px;white-space:nowrap}.ik-badge.on{background:#eefaf2;color:#146c3a}.ik-badge.off{background:#eef1f8;color:#445}" +
    ".ik-bar{height:10px;border-radius:99px;background:#eef1f8;overflow:hidden}.ik-bar i{display:block;height:100%;background:linear-gradient(90deg,#e8c05a,#c49325)}" +
    ".ik-stat{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:10px}.ik-stat div{background:#f5f7fc;border-radius:12px;padding:8px 10px}.ik-stat b{display:block;font-size:14px}.ik-stat span{font-size:10.5px;color:#59657f;font-weight:700}" +
    ".ik-f{display:grid;gap:6px;margin-bottom:12px}.ik-f label{font-size:11px;font-weight:900;color:#445069}.ik-f input,.ik-f select,.ik-f textarea{width:100%;box-sizing:border-box;border:1px solid #dbe2f0;background:#f8f9fc;padding:12px 13px;border-radius:12px;font-size:14px;font-family:inherit}" +
    ".ik-f textarea{min-height:60px;resize:vertical}.ik-f input[readonly]{background:#eef1f8;color:#445}" +
    ".ik-b{width:auto;min-height:0;border:0;border-radius:12px;padding:11px 14px;font-weight:900;font-size:13px;cursor:pointer;background:linear-gradient(135deg,#e8c05a,#c49325);color:#0b2144;margin:4px 6px 4px 0}" +
    ".ik-b.alt{background:#fff;border:1.5px solid #dbe2f0;color:#12213f}.ik-b.red{background:#fff;border:1.5px solid #c74444;color:#c74444}.ik-b:disabled{opacity:.5}" +
    ".ik-ac{border:1px solid #dbe2f0;border-radius:12px;max-height:220px;overflow:auto;background:#fff}.ik-ac div{padding:10px 12px;border-bottom:1px solid #eef1f8;cursor:pointer;font-size:13px}" +
    ".ik-row{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 14px;border-bottom:1px solid #eef1f8;font-size:13px}.ik-row p{margin:2px 0 0;color:#59657f;font-size:12px}";
  function pasangCss() { if (document.getElementById("ikCss")) return; var s = document.createElement("style"); s.id = "ikCss"; s.textContent = CSS; document.head.appendChild(s); }

  g.IK = { nk: nk, rp: rp, esc: esc, tglIndo: tglIndo, rekap: rekap, kartuHtml: kartuHtml, pdf: pdf, kodeBaru: kodeBaru, pasangCss: pasangCss };
})(window);
