/* Pencarian status iuran warga — HANYA untuk halaman login (admin.html & bendahara.html).
   Cari lewat blok/nomor rumah, nama, atau nomor invoice, tanpa harus menggulir daftar panjang.
   Pemakaian:
     RTIuranCari.pasang(document.getElementById("wadah"), { getData: function(){ return penarikan; }, getKontak: function(){ return {}; } });
     (getKontak opsional: { kunciRumah: {telepon} } — dipakai untuk nomor WA warga dari Firebase)
     RTIuranCari.render();   // panggil lagi tiap data penarikan berubah
   penarikan = { "YYYY-MM": { kunciRumah: {status, jumlah, metode, kodeKwitansi, ...} } }
   Bergantung pada: WARGA_DATA (warga-data.js), RT_CONFIG (config.js). */
(function (root) {
  var STATUS_LUNAS = { lunas_cash: 1, lunas_transfer: 1 };
  var BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  /* WARGA_DATA & RT_CONFIG dideklarasi dengan "const" di script lain, sehingga TIDAK menjadi window.WARGA_DATA / window.RT_CONFIG.
     Harus dibaca lewat nama global langsung (bukan root.xxx). */
  function dataWarga() { return (typeof WARGA_DATA !== "undefined" && WARGA_DATA) ? WARGA_DATA : []; }
  function konfig() { return (typeof RT_CONFIG !== "undefined" && RT_CONFIG) ? RT_CONFIG : {}; }
  var st = { wadah: null, opsi: null, filter: "semua", dibuat: false };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function rp(n) { return "Rp " + Math.round(n || 0).toLocaleString("id-ID"); }
  function kunci(blok, no) { return String(blok + " " + no).toLowerCase().replace(/[\s\/\-\.]+/g, ""); }
  function norm(v) { return String(v || "").toLowerCase().replace(/nomor|blok|no\.?/g, "").replace(/[^a-z0-9]/g, ""); }
  function wib() {
    var o = {}; new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit" }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return o.year + "-" + o.month;
  }
  function tambah(k, n) {
    var y = parseInt(k.slice(0, 4), 10), m = parseInt(k.slice(5, 7), 10) - 1 + n;
    y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    return y + "-" + ("0" + (m + 1)).slice(-2);
  }
  function pendek(k) { return BLN[parseInt(k.slice(5, 7), 10) - 1] + " " + k.slice(2, 4); }
  function uang(e) { return (e && e.uangMasuk != null) ? (parseFloat(e.uangMasuk) || 0) : (parseFloat(e && e.jumlah) || 0); }

  function daftarBulan(data) {
    var now = wib(), kunciData = Object.keys(data || {}).filter(function (k) { return /^\d{4}-\d{2}$/.test(k); }).sort();
    var cfg = konfig().bulanMulaiIuran;
    var mulai = (cfg && /^\d{4}-\d{2}$/.test(cfg)) ? cfg : (kunciData[0] || now);
    var batas = tambah(now, -11);
    if (mulai < batas) mulai = batas;
    var out = [];
    for (var m = mulai; m <= now; m = tambah(m, 1)) out.push(m);
    return { bulan: out, now: now };
  }

  /* Bangun ringkasan status tiap rumah. */
  function bangun(data) {
    var db = daftarBulan(data), iuran = konfig().iuranBulanan || 60000, kk = konfig().iuranTambahanKK || 7500;
    var list = dataWarga().map(function (w) {
      var key = kunci(w.blok, w.no), per = [], tunggak = [], tambahan = false, kodeAkhir = "", menunggu = 0;
      db.bulan.forEach(function (b) {
        var e = ((data || {})[b] || {})[key];
        if (e && e.tambahanKK) tambahan = true;
        var s = "belum";
        if (e && STATUS_LUNAS[e.status]) s = e.status === "lunas_cash" ? "cash" : "transfer";
        else if (e && e.status === "transfer_pending") { s = "pending"; menunggu++; }
        if (e && e.kodeKwitansi) kodeAkhir = e.kodeKwitansi;
        if (s === "belum" && b <= db.now) tunggak.push(b);   // menunggak terhitung tanggal 1 bulan iuran
        per.push({ b: b, s: s, e: e || null });
      });
      return {
        key: key, rumah: "Blok " + w.blok + " No." + w.no, nama: w.nama || "", per: per, tunggak: tunggak, menunggu: menunggu, kodeAkhir: kodeAkhir,
        jmlTunggak: tunggak.length * (iuran + (tambahan ? kk : 0)),
        bulanIni: per.length ? per[per.length - 1].s : "belum"
      };
    });
    return { list: list, now: db.now, bulan: db.bulan };
  }


  /* ---------- TEGURAN / REMINDER OTOMATIS (WhatsApp) ----------
     Aturan: iuran bulan X dianggap MENUNGGAK mulai tanggal 1 bulan berikutnya (X sudah lewat & belum lunas).
     Satu klik membuka WhatsApp ke nomor warga dengan pesan yang disusun sistem. */
  var BLN_PANJANG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  function panjang(k) { return BLN_PANJANG[parseInt(k.slice(5, 7), 10) - 1] + " " + k.slice(0, 4); }
  function nomorWA(n) {
    var d = String(n || "").replace(/[^0-9]/g, "");
    if (!d) return "";
    if (d.indexOf("620") === 0) return "62" + d.slice(3);
    if (d.indexOf("62") === 0) return d;
    if (d.charAt(0) === "0") return "62" + d.slice(1);
    return "62" + d;
  }
  function salam() {
    var j = parseInt(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", hour12: false }).format(new Date()), 10) % 24;
    return j >= 4 && j < 11 ? "Selamat pagi" : (j >= 11 && j < 15) ? "Selamat siang" : (j >= 15 && j < 18) ? "Selamat sore" : "Selamat malam";
  }
  /* Nomor WA warga: data resmi (warga-kontak.js) -> nomor dari Firebase (bila halaman memberi getKontak)
     -> nomor yang pernah tercatat di data penarikan. Kosong = belum ada. */
  function cariNomor(r) {
    var resmi = (typeof WARGA_KONTAK !== "undefined" && WARGA_KONTAK[r.key]) ? WARGA_KONTAK[r.key] : "";
    if (nomorWA(resmi)) return nomorWA(resmi);
    try {
      var k = st.opsi && st.opsi.getKontak ? (st.opsi.getKontak() || {}) : {};
      if (k[r.key] && nomorWA(k[r.key].telepon)) return nomorWA(k[r.key].telepon);
    } catch (e) {}
    for (var i = r.per.length - 1; i >= 0; i--) { var e2 = r.per[i].e; if (e2 && nomorWA(e2.teleponWarga)) return nomorWA(e2.teleponWarga); }
    return "";
  }
  function tglHariIni() {
    var o = {}; new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { tgl: parseInt(o.day, 10), bln: o.year + "-" + o.month, iso: o.year + "-" + o.month + "-" + o.day };
  }
  function pesanTeguran(r) {
    var cfg = konfig(), n = r.tunggak.length, rek = cfg.rekeningBendahara || {}, h = tglHariIni();
    var judul = n >= 2 ? "TEGURAN IURAN BULANAN" : "PENGINGAT IURAN BULANAN";
    var t = "*" + judul + "*\nRT 08 / RW 021 Villa Indah Pulo Timaha\n\n" +
      salam() + " Bpk/Ibu " + (r.nama || "") + " (" + r.rumah + ").\n\n" +
      "Berdasarkan catatan Pengurus RT, iuran bulanan Bapak/Ibu *belum tercatat lunas* untuk:\n" +
      r.tunggak.map(function (b, i) { return (i + 1) + ". " + panjang(b); }).join("\n") +
      "\n\nTotal tunggakan: *" + rp(r.jmlTunggak) + "* (" + n + " bulan)\n\n" +
      "Tunggakan tersebut dihitung sejak tanggal 1 " + panjang(r.tunggak[0]) + " sampai dengan " + h.tgl + " " + panjang(h.bln) + " (hari pesan ini dikirim)." +
      (n >= 3 ? " Mohon tunggakan segera diselesaikan." : "") +
      "\n\nPembayaran dapat dilakukan secara cash ke petugas Humas RT" +
      (rek.nomor ? ", atau transfer ke:\n*" + rek.bank + " " + rek.nomor + " a.n. " + rek.nama + " (Bendahara RT)*\n(mohon kirim bukti transfer di chat ini)" : ".") +
      "\n\nJika sudah membayar, mohon abaikan pesan ini dan kirimkan buktinya agar kami perbarui catatan.\n\nTerima kasih 🙏\nPengurus RT 08 / RW 021";
    return t;
  }
  function toast(m) { if (typeof showToast === "function") showToast(m); else alert(m); }
  function kirimTeguran(key) {
    if (!st.opsi) return;
    var info = bangun(st.opsi.getData() || {});
    var r = info.list.filter(function (x) { return x.key === key; })[0];
    if (!r) return;
    if (!r.tunggak.length) { toast("Rumah ini tidak punya tunggakan."); return; }
    var pesan = pesanTeguran(r), nomor = cariNomor(r);
    var link = "https://wa.me/" + (nomor ? nomor : "") + "?text=" + encodeURIComponent(pesan);
    if (!nomor) toast("Nomor WA warga belum ada di data — pilih kontaknya sendiri di WhatsApp (pesan sudah terisi).");
    window.open(link, "_blank", "noopener");
  }

  function cocok(r, q, data) {
    if (!q) return true;
    var nq = norm(q), uq = q.toUpperCase().replace(/\s+/g, "");
    if (nq && norm(r.rumah).indexOf(nq) >= 0) return true;
    if (r.nama && r.nama.toLowerCase().indexOf(q.toLowerCase()) >= 0) return true;
    if (uq.length >= 4) for (var i = 0; i < r.per.length; i++) { var e = r.per[i].e; if (e && e.kodeKwitansi && String(e.kodeKwitansi).toUpperCase().indexOf(uq) >= 0) return true; }
    return false;
  }
  function lolosFilter(r) {
    var f = st.filter;
    if (f === "belum") return r.bulanIni === "belum";
    if (f === "tunggak") return r.tunggak.length > 0;
    if (f === "pending") return r.menunggu > 0;
    if (f === "lunas") return r.bulanIni === "cash" || r.bulanIni === "transfer";
    return true;
  }

  var WARNA = { cash: ["#e8f6ee", "#14532d", "Lunas (Cash)"], transfer: ["#e6f0ff", "#1b3a73", "Lunas (Transfer)"], pending: ["#fff4d6", "#7a5a08", "Menunggu konfirmasi"], belum: ["#fdeaea", "#b42318", "Belum bayar"] };

  function chipBulan(p, now) {
    var w = WARNA[p.s], pudar = false;
    var bg = pudar ? "#eef0f4" : w[0], fg = pudar ? "#59657f" : w[1];
    var ikon = p.s === "belum" ? (pudar ? "•" : "✕") : p.s === "pending" ? "⏳" : "✓";
    return '<span class="ic-chip" style="background:' + bg + ";color:" + fg + '" title="' + esc(pendek(p.b) + ": " + (pudar ? "Belum bayar (bulan berjalan)" : w[2])) + '">' + esc(pendek(p.b)) + " " + ikon + "</span>";
  }

  function barisDetail(r) {
    var rows = r.per.slice().reverse().map(function (p) {
      var e = p.e, ket = WARNA[p.s][2];
      var extra = e ? (e.metode === "cash" ? "Cash" : e.metode === "transfer" ? "Transfer" : "") : "";
      var inv = e && e.kodeKwitansi ? ' • <b>' + esc(e.kodeKwitansi) + "</b>" : "";
      return "<div class=\"ic-d\"><span>" + esc(pendek(p.b)) + '</span><span>' + esc(ket) + (extra && p.s !== "belum" ? " · " + extra : "") + (e && p.s !== "belum" ? " · " + rp(uang(e)) : "") + inv + "</span></div>";
    }).join("");
    return '<details class="ic-det"><summary>Rincian per bulan</summary>' + rows + "</details>";
  }

  function render() {
    if (!st.wadah || !st.opsi) return;
    var data = st.opsi.getData() || {}, hasil = st.wadah.querySelector(".ic-hasil"), q = st.wadah.querySelector(".ic-q").value.trim();
    var info = bangun(data);
    if (!info.list.length) { hasil.innerHTML = '<div class="ic-kosong">Data warga belum termuat.</div>'; return; }
    var sudah = info.list.filter(function (r) { return r.bulanIni === "cash" || r.bulanIni === "transfer"; }).length;
    var pend = info.list.filter(function (r) { return r.bulanIni === "pending"; }).length;
    var blm = info.list.filter(function (r) { return r.bulanIni === "belum"; }).length;
    st.wadah.querySelector(".ic-ringkas").innerHTML = "Bulan " + esc(pendek(info.now)) + ": <b>" + sudah + "</b> lunas · <b>" + pend + "</b> menunggu konfirmasi · <b>" + blm + "</b> belum bayar (dari " + info.list.length + " rumah)";
    var cocokSemua = info.list.filter(function (r) { return cocok(r, q, data) && lolosFilter(r); });
    if (!q && st.filter === "semua") { hasil.innerHTML = '<div class="ic-kosong">Ketik blok/nomor rumah (contoh <b>E2 46</b>), nama, atau nomor invoice. Atau pilih filter di atas.</div>'; return; }
    if (!cocokSemua.length) { hasil.innerHTML = '<div class="ic-kosong">Tidak ada rumah yang cocok.</div>'; return; }
    var maks = 30, tampil = cocokSemua.slice(0, maks);
    hasil.innerHTML = '<div class="ic-jml">' + cocokSemua.length + " rumah ditemukan" + (cocokSemua.length > maks ? " (menampilkan " + maks + " pertama — persempit pencarian)" : "") + "</div>" + tampil.map(function (r) {
      var w = WARNA[r.bulanIni];
      var tg = r.tunggak.length ? '<span class="ic-tg">Tunggakan ' + r.tunggak.length + " bln · " + rp(r.jmlTunggak) + "</span>" : '<span class="ic-ok">Tidak ada tunggakan</span>';
      return '<div class="ic-row"><div class="ic-top"><div><b>' + esc(r.rumah) + "</b><div class=\"ic-nama\">" + esc(r.nama || "-") + '</div></div><span class="ic-badge" style="background:' + w[0] + ";color:" + w[1] + '">' + esc(w[2]) + "</span></div>" +
        '<div class="ic-chips">' + r.per.map(function (p) { return chipBulan(p, info.now); }).join("") + "</div>" +
        '<div class="ic-foot">' + tg + (r.kodeAkhir ? ' <span class="ic-inv">Invoice terakhir: ' + esc(r.kodeAkhir) + "</span>" : "") + "</div>" +
        (r.tunggak.length ? '<button type="button" class="ic-wa" data-teguran="' + esc(r.key) + '">💬 Kirim ' + (r.tunggak.length >= 2 ? "Teguran" : "Pengingat") + ' via WhatsApp</button>' : "") + barisDetail(r) + "</div>";
    }).join("");
  }

  function css() {
    if (document.getElementById("ic-css")) return;
    var s = document.createElement("style"); s.id = "ic-css";
    s.textContent = ".ic-q{width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid var(--line,#dbe2f0);border-radius:12px;font:inherit;font-size:15px}" +
      ".ic-q:focus{outline:none;border-color:var(--green,#123a6b)}" +
      ".ic-filter{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}" +
      ".ic-f{border:1.5px solid var(--line,#dbe2f0);background:#fff;color:var(--muted,#59657f);border-radius:999px;padding:6px 12px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}" +
      ".ic-f.on{background:var(--green,#123a6b);border-color:var(--green,#123a6b);color:#fff}" +
      ".ic-ringkas{font-size:12px;color:var(--muted,#59657f);margin:2px 0 8px}" +
      ".ic-jml{font-size:12px;color:var(--muted,#59657f);margin:4px 0 8px;font-weight:700}" +
      ".ic-row{border:1px solid var(--line,#dbe2f0);border-radius:14px;padding:11px 12px;margin-bottom:8px;background:#fff}" +
      ".ic-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}" +
      ".ic-nama{font-size:12px;color:var(--muted,#59657f);margin-top:1px}" +
      ".ic-badge{font-size:11px;font-weight:900;border-radius:999px;padding:4px 10px;white-space:nowrap}" +
      ".ic-chips{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 6px}" +
      ".ic-chip{font-size:11px;font-weight:800;border-radius:8px;padding:3px 7px;white-space:nowrap}" +
      ".ic-foot{font-size:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}" +
      ".ic-tg{color:#b42318;font-weight:900}.ic-ok{color:#14532d;font-weight:800}.ic-inv{color:var(--muted,#59657f)}" +
      ".ic-det{margin-top:6px;font-size:12px}.ic-det summary{cursor:pointer;color:var(--green,#123a6b);font-weight:800}" +
      ".ic-d{display:flex;gap:10px;padding:4px 0;border-bottom:1px dashed var(--line,#dbe2f0)}.ic-d span:first-child{min-width:48px;font-weight:800}" +
      ".ic-wa{margin-top:8px;width:100%;border:0;border-radius:10px;background:#16a34a;color:#fff;font:inherit;font-size:13px;font-weight:800;padding:10px 12px;cursor:pointer}" +
      ".ic-wa:active{background:#15803d}" +
      ".ic-kosong{padding:14px;text-align:center;color:var(--muted,#59657f);font-size:13px}";
    document.head.appendChild(s);
  }

  function pasang(wadah, opsi) {
    if (!wadah) return;
    css();
    st.wadah = wadah; st.opsi = opsi;
    wadah.innerHTML = '<input type="search" class="ic-q" placeholder="Cari rumah, nama, atau nomor invoice… contoh: E2 46" autocomplete="off" spellcheck="false" aria-label="Cari status iuran">' +
      '<div class="ic-filter" role="group" aria-label="Filter">' +
      '<button type="button" class="ic-f on" data-f="semua">Semua</button>' +
      '<button type="button" class="ic-f" data-f="belum">Belum bayar bulan ini</button>' +
      '<button type="button" class="ic-f" data-f="tunggak">Menunggak</button>' +
      '<button type="button" class="ic-f" data-f="pending">Menunggu konfirmasi</button>' +
      '<button type="button" class="ic-f" data-f="lunas">Sudah lunas</button></div>' +
      '<div class="ic-ringkas"></div><div class="ic-hasil"></div>';
    wadah.querySelector(".ic-q").addEventListener("input", render);
    wadah.querySelector(".ic-hasil").addEventListener("click", function (e) {
      var b = e.target.closest(".ic-wa"); if (b) kirimTeguran(b.getAttribute("data-teguran"));
    });
    wadah.querySelector(".ic-filter").addEventListener("click", function (e) {
      var b = e.target.closest(".ic-f"); if (!b) return;
      st.filter = b.getAttribute("data-f");
      wadah.querySelectorAll(".ic-f").forEach(function (x) { x.classList.toggle("on", x === b); });
      render();
    });
    render();
  }

  root.RTIuranCari = { pasang: pasang, render: render, kirimTeguran: kirimTeguran, pesanTeguran: pesanTeguran, _bangun: bangun };
  if (typeof module !== "undefined" && module.exports) module.exports = root.RTIuranCari;
})(typeof window !== "undefined" ? window : globalThis);
