/* ============================================================
   KONFIGURASI PORTAL WARGA — RT 10 / RW 021 VILLA INDAH PULO TIMAHA
   ------------------------------------------------------------
   Admin RT cukup mengedit nilai-nilai di bawah ini.
   File ini dipakai oleh SEMUA halaman (index, layanan, kontak,
   transparansi, umkm, dst) sehingga cukup diedit SATU KALI di sini,
   tidak perlu edit satu-satu di tiap file HTML.
   Setelah diedit, upload ulang file config.js ini ke GitHub Pages.
   ============================================================ */
const RT_CONFIG = {
  // ---------- Identitas ----------
  namaRT: "RT 10",
  namaRW: "RW 021",
  namaKompleks: "Villa Indah Pulo Timaha",
  // Penanda untuk penyambungan ke tingkat RW 021 (belum dipakai, disiapkan agar RT 08 & RT 10 bisa digabung nanti).
  // Jangan diubah setelah ada data, karena akan jadi kunci data tiap RT di RW.
  idRT: "rt10",
  idRW: "rw021",
  jumlahKK: "90", // jumlah KK aktif RT 10 (sesuai daftar rumah)

  // ---------- Keamanan ----------
  // Login admin/humas menggunakan Firebase Authentication.
  // JANGAN simpan password atau secret di file ini karena file ini dikirim ke browser.
  firebaseAuthRequired: true,
  // UID akun Firebase yang berhak mengakses panel masing-masing.
  adminUid: "tEJkvCi0MsQ4wN9DcuRLM0Tb2Rk2",
  bendaharaUid: "9iBKxbPsQYdKfCzjkGTbWRuqFvn1",
  humasUid: "ODoO4wTFRlh0z11NKSedGoWeRAO2",

  // Mode uji coba. Nilai ini hanya dipakai sebagai default saat Firebase belum punya appConfig/testMode.
  // ON = transaksi keuangan boleh dihapus oleh Admin untuk simulasi. OFF = hapus transaksi keuangan ditolak server.
  testModeDefault: true,

  // Rekening Bendahara untuk pembayaran TRANSFER (tampil di halaman Humas & pesan reminder WhatsApp).
  rekeningBendahara: { bank: "", nomor: "", nama: "" },

  // ---------- Nomor WhatsApp pengurus (WAJIB diisi agar tombol berfungsi) ----------
  // Format: kode negara 62 + nomor tanpa angka 0 di depan.
  // Contoh nomor 0812-3456-7890 ditulis: "6281234567890"
  waKetua: "",
  waSekretaris: "",
  waBendahara: "",
  waKeamanan: "",

  // Nomor WhatsApp yang menerima pesan "Pendaftaran UMKM" dari halaman UMKM.
  // Kosongkan ("") untuk memakai nomor Ketua RT (waKetua).
  waUMKM: "",

  // Nama pengurus (ditampilkan di halaman Kontak)
  namaKetua: "",
  namaSekretaris: "",
  namaBendahara: "",
  namaKeamanan: "",

  // Link undangan Grup WhatsApp warga (opsional, kosongkan jika belum ada)
  linkGrupWA: "",

  // ---------- Kop & tempat surat PDF (halaman Layanan) ----------
  // Kop surat: logo RW (kiri) + logo RT (kanan) di assets/logo-rw.png & assets/logo-rt.png.
  // Semua baris di bawah boleh dikosongkan ("") untuk memakai isian bawaan / menyembunyikan baris.
  // tempatSurat    : tulisan sebelum tanggal di tanda tangan, contoh hasil: "Bekasi, 20 September 2026"
  tempatSurat: "Bekasi",
  kopPemerintah: "PEMERINTAH KABUPATEN BEKASI",
  kopKecamatan: "KECAMATAN BABELAN",
  kopRTRW: "RUKUN TETANGGA 010, RUKUN WARGA 021",
  alamatKopSurat: "Perumahan Villa Indah Pulo Timaha, Desa Babelan Kota",
  emailKopSurat: "",

  // ---------- Nomor telepon untuk ditampilkan di halaman Kontak ----------
  teleponKetua: "",
  teleponSekretaris: "",
  teleponBendahara: "",
  teleponKeamanan: "",
  teleponPemadam: "113",
  teleponAmbulans: "119",
  teleponPolisi: "110",

  // ---------- Iuran Bulanan (Halaman Humas — humas.html) ----------
  // iuranBulanan   : tarif iuran bulanan per rumah/KK (Rp).
  // iuranTambahanKK: tambahan iuran RUKEM kalau di 1 rumah ada saudara/keluarga
  //                  dengan KK (Kartu Keluarga) terpisah (Rp).
  // CATATAN: 60000 & 7500 masih angka bawaan RT 08 — SESUAIKAN dengan tarif iuran RT 10.
  iuranBulanan: 60000,
  iuranTambahanKK: 7500,
  // bulanMulaiIuran: bulan pertama iuran dipakai sungguhan (format "TAHUN-BULAN").
  //                  Bulan sebelumnya (masa simulasi) TIDAK dihitung sebagai tunggakan.
  bulanMulaiIuran: "", // contoh "2026-11"; kosong = dihitung dari transaksi pertama

  // ---------- Ringkasan Kas RT ----------
  // Sudah TIDAK dipakai lagi — Saldo Kas, Pemasukan, dan Pengeluaran sekarang
  // dihitung otomatis dari catatan transaksi yang diinput di admin.html (tab
  // 💰 Keuangan), tersimpan di Firebase. Field di bawah ini dibiarkan saja,
  // aman untuk dihapus.

  // Link folder dokumen RT (Google Drive, dsb). Kosongkan jika belum tersedia.
  linkDokumen: "",

  // ---------- Acara & Doorprize (Pentas Seni / Malam Apresiasi) ----------
  namaAcaraDoorprize: "Acara RT 10",
  tanggalAcaraDoorprize: "",
  lokasiAcaraDoorprize: "",
  // Konfigurasi Firebase (lihat PANDUAN-FIREBASE.md untuk cara membuatnya).
  // Selama objek ini kosong, form Daftar Hadir & Roda Doorprize akan menampilkan pesan "belum dikonfigurasi".
  // Cara isi: buat project di https://console.firebase.google.com, aktifkan Realtime Database,
  // lalu buka Project settings > General > scroll ke "Your apps" > tambah app Web (</>) > salin
  // objek firebaseConfig yang muncul ke sini apa adanya (termasuk databaseURL).
  firebaseConfig: {
    // ISI dari Firebase RT 10 yang baru (lihat PANDUAN-FIREBASE.md)
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  // Daftar nomor rumah resmi (diambil dari Data Induk RT), dipakai sebagai
  // sumber pencarian di form Daftar Hadir supaya warga tinggal cari nomor
  // rumahnya, bukan ketik bebas. Tambah/hapus baris di sini kalau ada
  // rumah baru / data induk berubah.
  daftarRumah: [
    "D3A No.1",
    "D3A No.2",
    "D3A No.3",
    "D3A No.3A",
    "D3A No.8",
    "D3A No.9",
    "D3A No.10",
    "D3A No.11",
    "D3B No.3",
    "D3B No.3A",
    "D3B No.5",
    "D3B No.6",
    "D4A No.3",
    "D4A No.3A",
    "D4A No.6",
    "D4A No.7",
    "D4A No.8",
    "D4A No.9",
    "D4A No.10",
    "D4A No.12",
    "D4B No.1",
    "D4B No.2",
    "D4B No.3",
    "D4B No.3A",
    "D4B No.7",
    "D4B No.9",
    "D5A No.2",
    "D5A No.3",
    "D5A No.3A",
    "D5A No.5",
    "D5A No.6",
    "D5A No.7",
    "D5A No.9",
    "D5A No.10",
    "D5A No.12",
    "D5A No.14",
    "D5A No.16",
    "D5A No.18",
    "D5A No.20",
    "D5A No.21",
    "D5A No.22",
    "D5A No.23",
    "D5B No.2",
    "D5B No.3A",
    "D5B No.5",
    "D5B No.6",
    "D5B No.8",
    "D5B No.9",
    "D5B No.10",
    "D5B No.12",
    "D5B No.14",
    "D5B No.15",
    "D5B No.16",
    "D5B No.17",
    "D5B No.18",
    "D5B No.19",
    "D5B No.20",
    "D5B No.21",
    "D5B No.22",
    "D5B No.23",
    "D5C No.1",
    "D5C No.2",
    "D5C No.3",
    "D5C No.3A",
    "D5C No.5",
    "D5C No.6",
    "D5C No.7",
    "D5C No.8",
    "D5C No.9",
    "D5C No.11",
    "D5C No.12",
    "D5C No.14",
    "D5C No.15",
    "D5C No.16",
    "D5C No.17",
    "D5C No.18",
    "D5C No.19",
    "D5C No.20",
    "D5C No.21",
    "D5C No.22",
    "D5C No.23",
    "D6 No.3",
    "D6 No.3A",
    "D6 No.5",
    "D6 No.7",
    "D6 No.9",
    "D6 No.12",
    "D6 No.12A",
    "D6 No.14",
    "D6 No.15"
  ],

  // ---------- Direktori UMKM warga ----------
  // Sudah TIDAK dipakai lagi — direktori UMKM sekarang diisi lewat admin.html
  // (tab 🛍️ UMKM, termasuk upload foto usaha), tersimpan di Firebase.
  // Array di bawah ini dibiarkan saja, aman untuk dihapus.
  umkm: []
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
   NAVIGASI BAWAH (HP) — 6 tombol tetap, urutan:
   Beranda - Info - Agenda - Layanan - Kontak - Live Chat
   Kode ini ada di config.js karena semua halaman memuat file ini,
   jadi urutan & tombol aktif selalu seragam di semua halaman.
   ============================================================ */
(function () {
  if (typeof document === "undefined") return;

  var NAV_BAWAH = [
    { ikon: "🏠", teks: "Beranda",   href: "index.html" },
    { ikon: "📢", teks: "Info",      href: "informasi.html" },
    { ikon: "📅", teks: "Agenda",    href: "agenda.html" },
    { ikon: "📝", teks: "Layanan",   href: "layanan.html" },
    { ikon: "📞", teks: "Kontak",    href: "kontak.html" },
    { ikon: "💬", teks: "Live Chat", href: "livechat.html" }
  ];

  function pasang() {
    /* Berita tidak ada di menu atas maupun bawah */
    Array.prototype.forEach.call(document.querySelectorAll('nav.desktop-nav a[href="berita.html"]'), function (a) { a.parentNode.removeChild(a); });

    var nav = document.querySelector("nav.mobile-nav");
    if (!nav) return;

    var halaman = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    nav.innerHTML = NAV_BAWAH.map(function (m) {
      return '<a class="' + (m.href === halaman ? "active" : "") + '" href="' + m.href + '"><b>' + m.ikon + "</b>" + m.teks + "</a>";
    }).join("");
    nav.style.gridTemplateColumns = "repeat(6,minmax(0,1fr))";

    if (!document.getElementById("navBawahGaya")) {
      var st = document.createElement("style");
      st.id = "navBawahGaya";
      st.textContent = ".mobile-nav a{min-width:0;white-space:nowrap}";
      document.head.appendChild(st);
    }
    /* bersihkan sisa panel "Menu" versi lama bila ada */
    Array.prototype.forEach.call(document.querySelectorAll(".mn-panel,.mn-scrim"), function (e) { e.parentNode.removeChild(e); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pasang);
  else pasang();
})();
