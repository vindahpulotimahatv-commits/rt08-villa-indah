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

  // Nama pengurus (ditampilkan di halaman Kontak)
  namaKetua: "Abdul Avies",
  namaSekretaris: "Syarif",
  namaBendahara: "Hendyanto",
  namaKeamanan: "Jati",

  // Link undangan Grup WhatsApp warga (opsional, kosongkan jika belum ada)
  linkGrupWA: "",

  // ---------- Kop & tempat surat PDF (halaman Layanan) ----------
  // tempatSurat  : tulisan sebelum tanggal di tanda tangan, mis. "Bekasi" → "Bekasi, 20 September 2026"
  // alamatKopSurat : baris alamat kecil di bawah nama RT pada kop surat (opsional, kosongkan jika tidak perlu)
  //                  contoh: "Kel. ..., Kec. ..., Kota/Kab. ..."
  tempatSurat: "Villa Indah Pulo Timaha",
  alamatKopSurat: "",

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
