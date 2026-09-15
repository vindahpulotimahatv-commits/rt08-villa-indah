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

  // ---------- Nomor WhatsApp pengurus (WAJIB diisi agar tombol berfungsi) ----------
  // Format: kode negara 62 + nomor tanpa angka 0 di depan.
  // Contoh nomor 0812-3456-7890 ditulis: "6281234567890"
  waKetua: "",
  waSekretaris: "",
  waBendahara: "",
  waKeamanan: "",

  // Link undangan Grup WhatsApp warga (opsional, kosongkan jika belum ada)
  linkGrupWA: "",

  // ---------- Nomor telepon untuk ditampilkan di halaman Kontak ----------
  teleponKetua: "08xx-xxxx-xxxx",
  teleponSekretaris: "08xx-xxxx-xxxx",
  teleponBendahara: "08xx-xxxx-xxxx",
  teleponKeamanan: "08xx-xxxx-xxxx",
  teleponPemadam: "113",
  teleponAmbulans: "119",
  teleponPolisi: "110",

  // ---------- Ringkasan Kas RT (halaman Transparansi) ----------
  saldoKas: "Rp —",
  pemasukanBulanIni: "Rp —",
  pengeluaranBulanIni: "Rp —",

  // Link folder dokumen RT (Google Drive, dsb). Kosongkan jika belum tersedia.
  linkDokumen: "",

  // ---------- Direktori UMKM warga ----------
  // Tambah / hapus / edit baris sesuai kebutuhan. Kategori bebas, contoh:
  // "Kuliner", "Jasa", "Kue", "Otomotif"
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
