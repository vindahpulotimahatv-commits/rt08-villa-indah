/* ============================================================
   KONFIGURASI PORTAL WARGA — RT 08 / RW 021 VILLA INDAH PULO TIMAHA
   ------------------------------------------------------------
   Admin RT cukup mengedit nilai-nilai di bawah ini.
   File ini dipakai oleh SEMUA halaman (index, layanan, kontak,
   transparansi, umkm, dst) sehingga cukup diedit SATU KALI di sini,
   tidak perlu edit satu-satu di tiap file HTML.
   Setelah diedit, upload ulang file config.js ini ke GitHub Pages.
   ============================================================ */
const RT_CONFIG = {
  // ---------- Identitas ----------
  namaRT: "RT 08",
  namaRW: "RW 021",
  namaKompleks: "Villa Indah Pulo Timaha",
  jumlahKK: "—", // contoh: "142"

  // ---------- Password Halaman Admin (admin.html) ----------
  // Dipakai untuk mengunci halaman kelola Agenda & Informasi.
  // GANTI password ini secara berkala. Catatan: ini hanya kunci tampilan
  // (bukan keamanan tingkat server), jadi tetap jangan bagikan sembarangan.
  adminPassword: "rt08admin2026",

  // ---------- Nomor WhatsApp pengurus (WAJIB diisi agar tombol berfungsi) ----------
  // Format: kode negara 62 + nomor tanpa angka 0 di depan.
  // Contoh nomor 0812-3456-7890 ditulis: "6281234567890"
  waKetua: "6287788676667",
  waSekretaris: "6285643013072",
  waBendahara: "6285770053707",
  waKeamanan: "6285811522118",

  // Nomor WhatsApp yang menerima pesan "Pendaftaran UMKM" dari halaman UMKM.
  // Kosongkan ("") untuk memakai nomor Ketua RT (waKetua).
  waUMKM: "",

  // Nama pengurus (ditampilkan di halaman Kontak)
  namaKetua: "Abd Hafiz",
  namaSekretaris: "Syarif",
  namaBendahara: "Hendyanto",
  namaKeamanan: "Jati",

  // Link undangan Grup WhatsApp warga (opsional, kosongkan jika belum ada)
  linkGrupWA: "",

  // ---------- Kop & tempat surat PDF (halaman Layanan) ----------
  // Kop surat: logo RW (kiri) + logo RT (kanan) di assets/logo-rw.png & assets/logo-rt.png.
  // Semua baris di bawah boleh dikosongkan ("") untuk memakai isian bawaan / menyembunyikan baris.
  // tempatSurat    : tulisan sebelum tanggal di tanda tangan, contoh hasil: "Bekasi, 20 September 2026"
  tempatSurat: "Bekasi",
  kopPemerintah: "PEMERINTAH KABUPATEN BEKASI",
  kopKecamatan: "KECAMATAN BABELAN",
  kopRTRW: "RUKUN TETANGGA 008, RUKUN WARGA 021",
  alamatKopSurat: "Perumahan Villa Indah Pulo Timaha, Desa Babelan Kota",
  emailKopSurat: "rt008rw021vipt@gmail.com",

  // ---------- Nomor telepon untuk ditampilkan di halaman Kontak ----------
  teleponKetua: "0877-8867-6667",
  teleponSekretaris: "0856-4301-3072",
  teleponBendahara: "0857-7005-3707",
  teleponKeamanan: "0858-1152-2118",
  teleponPemadam: "113",
  teleponAmbulans: "119",
  teleponPolisi: "110",

  // ---------- Ringkasan Kas RT ----------
  // Sudah TIDAK dipakai lagi — Saldo Kas, Pemasukan, dan Pengeluaran sekarang
  // dihitung otomatis dari catatan transaksi yang diinput di admin.html (tab
  // 💰 Keuangan), tersimpan di Firebase. Field di bawah ini dibiarkan saja,
  // aman untuk dihapus.

  // Link folder dokumen RT (Google Drive, dsb). Kosongkan jika belum tersedia.
  linkDokumen: "",

  // ---------- Acara & Doorprize (Pentas Seni / Malam Apresiasi) ----------
  namaAcaraDoorprize: "Pentas Seni & Malam Apresiasi",
  tanggalAcaraDoorprize: "Sabtu, 19 September 2026 · 19.00 WIB",
  lokasiAcaraDoorprize: "Lapangan RT 08 / Area E6 & E7",
  // Konfigurasi Firebase (lihat PANDUAN-FIREBASE.md untuk cara membuatnya).
  // Selama objek ini kosong, form Daftar Hadir & Roda Doorprize akan menampilkan pesan "belum dikonfigurasi".
  // Cara isi: buat project di https://console.firebase.google.com, aktifkan Realtime Database,
  // lalu buka Project settings > General > scroll ke "Your apps" > tambah app Web (</>) > salin
  // objek firebaseConfig yang muncul ke sini apa adanya (termasuk databaseURL).
  firebaseConfig: {
    apiKey: "AIzaSyC-ZBaxoY8ojcpjcdSp8QDeY46oUgyUkvU",
    authDomain: "rt08-villa-indah.firebaseapp.com",
    databaseURL: "https://rt08-villa-indah-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "rt08-villa-indah",
    storageBucket: "rt08-villa-indah.firebasestorage.app",
    messagingSenderId: "586495278440",
    appId: "1:586495278440:web:38ed8bdf63a68915d32add"
  },

  // Daftar nomor rumah resmi (diambil dari Data Induk RT), dipakai sebagai
  // sumber pencarian di form Daftar Hadir supaya warga tinggal cari nomor
  // rumahnya, bukan ketik bebas. Tambah/hapus baris di sini kalau ada
  // rumah baru / data induk berubah.
  daftarRumah: [
    "E2 No.1", "E2 No.2", "E2 No.3", "E2 No.3A", "E2 No.5", "E2 No.6", "E2 No.7", "E2 No.8",
    "E2 No.9", "E2 No.10", "E2 No.11", "E2 No.12", "E2 No.12A", "E2 No.14", "E2 No.15", "E2 No.16",
    "E2 No.17", "E2 No.18", "E2 No.19", "E2 No.20", "E2 No.21", "E2 No.22", "E2 No.23", "E2 No.24",
    "E2 No.25", "E2 No.26", "E2 No.27", "E2 No.28", "E2 No.29", "E2 No.30", "E2 No.31", "E2 No.32",
    "E2 No.33", "E2 No.33A", "E2 No.35", "E2 No.36", "E2 No.37", "E2 No.38", "E2 No.39", "E2 No.40",
    "E2 No.41", "E2 No.42", "E2 No.43", "E2 No.44", "E2 No.45", "E2 No.46", "E2 No.47", "E2 No.48",
    "E5 No.1", "E5 No.2", "E5 No.3", "E5 No.3A", "E5 No.5", "E5 No.6", "E5 No.7", "E5 No.8",
    "E5 No.9", "E5 No.10", "E5 No.11", "E5 No.12", "E5 No.12A", "E5 No.14", "E5 No.15", "E5 No.16",
    "E5 No.17", "E5 No.18", "E5 No.19", "E5 No.20", "E6 No.1", "E6 No.2", "E6 No.3", "E6 No.3A",
    "E6 No.5", "E6 No.6", "E6 No.7", "E6 No.8", "E6 No.9", "E6 No.10", "E6 No.11", "E6 No.12",
    "E6 No.12A", "E6 No.14", "E6 No.15", "E6 No.16", "E6 No.17", "E6 No.18", "E6 No.19", "E6 No.20",
    "E6 No.21", "E6 No.22", "E6 No.23", "E6 No.24", "E7 No.1", "E7 No.2", "E7 No.3", "E7 No.3A",
    "E7 No.5", "E7 No.6", "E7 No.7", "E7 No.8", "E7 No.9", "E7 No.10", "E7 No.11", "E7 No.12",
    "E7 No.12A", "E7 No.14", "E7 No.15", "E7 No.16", "E7 No.17", "E7 No.18", "E7 No.19", "E7 No.20",
    "E7 No.21", "E7 No.22", "E7 No.23", "E7 No.24", "E8 No.1", "E8 No.2", "E8 No.3", "E8 No.3A",
    "E8 No.5", "E8 No.6", "E8 No.7", "E8 No.8", "E8 No.9", "E8 No.10", "E8 No.11", "E8 No.12",
    "E8 No.12A", "E8 No.14", "E8 No.15", "E8 No.16", "E8 No.17", "E8 No.18", "E8 No.19", "E8 No.20",
    "E8 No.21", "E8 No.22", "E8 No.23", "E8 No.24"
  ],

  // ---------- Direktori UMKM warga ----------
  // Sudah TIDAK dipakai lagi — direktori UMKM sekarang diisi lewat admin.html
  // (tab 🛍️ UMKM, termasuk upload foto usaha), tersimpan di Firebase.
  // Array di bawah ini dibiarkan saja, aman untuk dihapus.
  umkm: [
    { nama: "Dapur Warga", kategori: "Kuliner", deskripsi: "Catering, nasi box, dan snack untuk kegiatan.", wa: "" },
    { nama: "Jasa Service", kategori: "Jasa", deskripsi: "Servis dan perbaikan oleh warga.", wa: "" },
    { nama: "Kue & Snack", kategori: "Kue", deskripsi: "Pesanan kue rumahan dan snack.", wa: "" }
  ]
};

/* ============ Fungsi bantu — tidak perlu diubah ============ */

// Membuat link chat WhatsApp berisi pesan otomatis. Mengembalikan null jika nomor kosong.
function rtWaLink(nomor, pesan) {
  const n = String(nomor || "").replace(/[^0-9]/g, "");
  if (!n) return null;
  return "https://wa.me/" + n + "?text=" + encodeURIComponent(pesan || "");
}

// Membuka WhatsApp ke nomor tertentu. Jika nomor belum diisi admin, tampilkan notifikasi (butuh fungsi showToast di halaman).
function rtOpenWa(nomor, pesan, fallbackMsg) {
  const link = rtWaLink(nomor, pesan);
  if (link) {
    window.open(link, "_blank", "noopener");
  } else if (typeof showToast === "function") {
    showToast(fallbackMsg || "Nomor WhatsApp belum diatur admin di config.js");
  }
}

/* ============================================================
   DATA RUMAH RESMI — dasar SEMUA form (surat, lapor, aspirasi, daftar UMKM, dst)
   ------------------------------------------------------------
   Sumber data: daftarRumah (di atas). Warga TIDAK mengetik bebas: harus memilih
   Blok lalu Nomor rumah dari daftar. Nomor rumah yang tidak ada di daftar
   = tidak bisa mengajukan apa pun. Rumah baru/berubah? Edit daftarRumah.
   ============================================================ */
function rtKunciRumah(v) {   // "Blok E2 No. 47" / "e2-47" / "E2 No.47" -> "e247"
  return String(v || "").toLowerCase().replace(/nomor/g, "").replace(/blok/g, "").replace(/no/g, "").replace(/[^a-z0-9]/g, "");
}
function rtCocokRumah(v) {   // kembalikan tulisan resmi (mis. "E2 No.47") atau "" jika tidak terdaftar
  const k = rtKunciRumah(v);
  if (!k) return "";
  const list = RT_CONFIG.daftarRumah || [];
  for (let i = 0; i < list.length; i++) if (rtKunciRumah(list[i]) === k) return list[i];
  return "";
}
function rtRumahTerpisah(r) { // "E2 No.3A" -> { blok:"E2", no:"3A" }
  const m = /^(\S+)\s+No\.(.+)$/.exec(String(r || ""));
  return m ? { blok: m[1], no: m[2] } : null;
}
function rtDaftarBlok() {
  const out = [];
  (RT_CONFIG.daftarRumah || []).forEach(function (r) {
    const t = rtRumahTerpisah(r);
    if (t && out.indexOf(t.blok) < 0) out.push(t.blok);
  });
  return out;
}
function rtDaftarNomor(blok) {
  const out = [];
  (RT_CONFIG.daftarRumah || []).forEach(function (r) {
    const t = rtRumahTerpisah(r);
    if (t && t.blok === blok) out.push(t.no);
  });
  return out;
}
/* Pemilih rumah: dua pilihan (Blok, lalu Nomor). Pakai:
     <div id="xRumah"></div>  →  rtRumahPasang("xRumah", nilaiAwalOpsional)
     rtRumahNilai("xRumah")   →  "E2 No.47" atau "" bila belum dipilih
     rtRumahReset("xRumah")   →  kosongkan pilihan                                  */
function rtRumahPasang(id, awal) {
  const box = document.getElementById(id);
  if (!box) return;
  if (!document.getElementById("rt-rumah-css")) {
    const st = document.createElement("style"); st.id = "rt-rumah-css";
    st.textContent = ".rumah-pick{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rumah-pick select:disabled{opacity:.55}";
    document.head.appendChild(st);
  }
  const bloks = rtDaftarBlok();
  box.className = (box.className ? box.className + " " : "") + "rumah-pick";
  box.innerHTML = '<select id="' + id + '_blok" aria-label="Blok"><option value="">Pilih Blok…</option>' +
    bloks.map(function (b) { return '<option value="' + b + '">Blok ' + b + '</option>'; }).join("") + '</select>' +
    '<select id="' + id + '_no" aria-label="Nomor rumah" disabled><option value="">Nomor rumah…</option></select>';
  const sb = document.getElementById(id + "_blok"), sn = document.getElementById(id + "_no");
  function isiNomor(blok, pilih) {
    sn.innerHTML = '<option value="">Nomor rumah…</option>' +
      rtDaftarNomor(blok).map(function (n) { return '<option value="' + n + '"' + (n === pilih ? " selected" : "") + '>No. ' + n + '</option>'; }).join("");
    sn.disabled = !blok;
  }
  sb.addEventListener("change", function () { isiNomor(sb.value, ""); });
  const t = rtRumahTerpisah(rtCocokRumah(awal));
  if (t) { sb.value = t.blok; isiNomor(t.blok, t.no); }
}
function rtRumahNilai(id) {
  const sb = document.getElementById(id + "_blok"), sn = document.getElementById(id + "_no");
  if (!sb || !sn || !sb.value || !sn.value) return "";
  return rtCocokRumah(sb.value + " No." + sn.value);
}
function rtRumahReset(id) { rtRumahPasang(id, ""); }
const RT_PESAN_RUMAH = "Pilih Blok & Nomor Rumah dulu. Tanpa nomor rumah yang terdaftar, pengajuan tidak bisa dikirim.";

/* ============================================================
   MENU BAWAH (HP) — navigasi bawah: tombol "Kontak Penting" tersendiri +
   tombol "Menu" yang bisa dibuka/ditutup berisi Galeri, UMKM Warga, Kas RT.
   Kode ini ada di config.js karena semua halaman sudah memuat file ini,
   jadi tidak perlu mengubah 8 halaman satu per satu.
   Mau ubah isi menu? Edit daftar MENU_BAWAH_ITEM di bawah.
   ============================================================ */
(function () {
  if (typeof document === "undefined") return;

  var MENU_BAWAH_ITEM = [
    { ikon: "🖼️", teks: "Galeri",       href: "galeri.html" },
    { ikon: "🛍️", teks: "UMKM Warga",   href: "umkm.html" },
    { ikon: "💰", teks: "Kas RT",       href: "transparansi.html" }
  ];

  function pasang() {
    var nav = document.querySelector("nav.mobile-nav");
    if (!nav || nav.getAttribute("data-menu-siap")) return;
    var lama = nav.querySelector('a[href="kontak.html"]');   // tombol "Menu" lama (link biasa ke kontak.html)
    if (!lama) return;
    nav.setAttribute("data-menu-siap", "1");

    var halaman = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var diMenu = MENU_BAWAH_ITEM.some(function (m) { return m.href === halaman; });

    /* gaya */
    var st = document.createElement("style");
    st.textContent =
      ".mobile-nav .mn-btn{text-align:center;padding:7px 3px;border-radius:13px;font-size:9px;font-weight:900;color:rgba(255,255,255,.65);background:none;border:0;font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
      ".mobile-nav .mn-btn.active,.mobile-nav .mn-btn[aria-expanded=true]{background:rgba(213,166,43,.18);color:#f3cf6a}" +
      ".mn-scrim{position:fixed;inset:0;z-index:118;display:none;background:transparent}" +
      ".mn-scrim.open{display:block}" +
      ".mn-panel{position:fixed;right:10px;width:min(300px,calc(100vw - 20px));z-index:119;padding:8px;border-radius:21px;" +
        "background:rgba(8,20,44,.98);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(213,166,43,.28);box-shadow:0 16px 45px rgba(0,0,0,.45);" +
        "visibility:hidden;opacity:0;transform:translateY(12px) scale(.98);transform-origin:bottom right;transition:opacity .18s,transform .18s,visibility .18s}" +
      ".mn-panel.open{visibility:visible;opacity:1;transform:none}" +
      ".mn-panel a{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:14px;color:#fff;font-size:14px;font-weight:800}" +
      ".mn-panel a:active,.mn-panel a.cur{background:rgba(213,166,43,.18);color:#f3cf6a}" +
      ".mn-panel a span{font-size:19px;width:26px;text-align:center}" +
      ".mn-panel a i{margin-left:auto;font-style:normal;opacity:.45}" +
      ".mn-panel hr{border:0;border-top:1px solid rgba(255,255,255,.14);margin:6px 8px}" +
      "@media(min-width:981px){.mn-panel,.mn-scrim{display:none!important}}";
    document.head.appendChild(st);

    /* tombol Menu (menggantikan link ke kontak.html; tetap link biasa bila JS gagal) */
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "mn-btn" + (diMenu ? " active" : "");
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "mnPanel");
    btn.innerHTML = "<b>☰</b>Menu";
    lama.parentNode.replaceChild(btn, lama);

    /* tombol Kontak Penting tersendiri, tepat sebelum Menu */
    var kontak = document.createElement("a");
    kontak.href = "kontak.html"; kontak.title = "Kontak Penting";
    kontak.className = halaman === "kontak.html" ? "active" : "";
    kontak.innerHTML = "<b>📞</b>Kontak";
    nav.insertBefore(kontak, btn);
    nav.style.gridTemplateColumns = "repeat(6,1fr)";   // sekarang 6 tombol

    /* panel isi menu */
    var panel = document.createElement("div");
    panel.id = "mnPanel"; panel.className = "mn-panel"; panel.setAttribute("role", "menu");
    panel.innerHTML = MENU_BAWAH_ITEM.map(function (m) {
      if (m.garis) return "<hr>";
      return '<a role="menuitem" href="' + m.href + '"' + (m.href === halaman ? ' class="cur"' : "") + "><span>" + m.ikon + "</span>" + m.teks + "<i>›</i></a>";
    }).join("");
    var scrim = document.createElement("div"); scrim.className = "mn-scrim";
    document.body.appendChild(scrim); document.body.appendChild(panel);

    function tampil(buka) {
      if (buka) {  // letakkan tepat di atas navigasi bawah
        var top = nav.getBoundingClientRect().top;
        panel.style.bottom = Math.max(8, window.innerHeight - top + 8) + "px";
      }
      panel.classList.toggle("open", buka); scrim.classList.toggle("open", buka);
      btn.setAttribute("aria-expanded", buka ? "true" : "false");
      btn.firstChild.textContent = buka ? "✕" : "☰";
    }
    btn.addEventListener("click", function () { tampil(!panel.classList.contains("open")); });
    scrim.addEventListener("click", function () { tampil(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") tampil(false); });
    window.addEventListener("resize", function () { tampil(false); });
    window.addEventListener("pageshow", function () { tampil(false); });   // tombol "kembali" di browser
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pasang);
  else pasang();
})();
