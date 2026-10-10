# PANDU — Portal Administrasi Nyata Delapan Dua Satu

RT 08 / RW 021 Villa Indah Pulo Timaha

Setiap file HTML bisa dibuka langsung tanpa folder CSS/JS terpisah — semua stylesheet dan ilustrasi hero sudah ditanam langsung ke file HTML. Satu-satunya file pendukung adalah `config.js`, tempat semua nomor WhatsApp/telepon dan data kas diatur.

## Langkah wajib sebelum dipakai warga

Buka `config.js` dengan text editor apa pun (Notepad, TextEdit, atau langsung "Edit file" di GitHub), lalu isi:

1. **Nomor WhatsApp pengurus** (`waKetua`, `waSekretaris`, `waBendahara`, `waKeamanan`) — format `62` + nomor tanpa `0` di depan, contoh `6281234567890`. Tanpa ini, tombol Ajukan/Lapor/Hubungi di halaman Layanan, Kontak, Transparansi, dan UMKM tidak akan berfungsi.
2. **Nomor telepon** untuk halaman Kontak (`teleponKetua`, dst).
3. (Opsional) `linkGrupWA` untuk tombol "Grup WhatsApp Warga" di footer, dan `linkDokumen` untuk folder dokumen RT (Google Drive dll).
4. **`adminPassword`** — password untuk masuk ke halaman `admin.html`. Ganti secara berkala.

Simpan `config.js`, lalu upload ulang bersama file HTML lainnya. Semua halaman otomatis memakai data terbaru — tidak perlu edit satu-satu di tiap file HTML.

## Halaman Admin (`admin.html`) — kelola konten tanpa edit kode

Pengurus RT bisa login ke `admin.html` (pakai `adminPassword` di atas) untuk
mengelola 5 hal, tanpa perlu sentuh kode sama sekali — otomatis tampil di
halaman publik begitu disimpan:

| Tab di Admin | Otomatis tampil di halaman |
|---|---|
| 📅 Agenda | `agenda.html`, Beranda |
| 📢 Informasi | `informasi.html`, Beranda |
| 🖼️ Galeri | `galeri.html` — admin tinggal upload foto, otomatis dikompres |
| 🛍️ UMKM | `umkm.html` — admin tinggal upload foto usaha & data usaha |
| 💰 Keuangan | `transparansi.html` — catat 1 transaksi (masuk/keluar), saldo & rekap bulanan otomatis terhitung |

Fitur ini butuh **Firebase Realtime Database** sebagai tempat penyimpanan
bersama (gratis) supaya semua HP melihat data yang sama secara real-time.
Selama `firebaseConfig` di `config.js` masih kosong, halaman-halaman di atas
akan menampilkan pesan "belum dikonfigurasi" — fitur lain di situs tetap
normal.

Lihat **`PANDUAN-FIREBASE.md`** untuk langkah lengkap membuat project Firebase,
mengisi `firebaseConfig`, dan memasang security rules-nya (wajib, ada di
panduan tersebut).

## Layanan → Surat PDF (siap tanda tangan & stempel)

Layanan surat di `layanan.html` — **Surat Pengantar, Surat Keterangan Domisili, Warga Baru, Warga Pindah, Pinjam Fasilitas** (dan surat pernyataan lainnya) —
sekarang membuat **surat PDF** (lengkap kop RT, nomor, tabel data, ruang tanda tangan & stempel Ketua RT),
bukan lagi sekadar pesan teks WhatsApp. Aspirasi, Dokumen RT, dan Lapor Lingkungan tetap lewat WhatsApp teks.

Alur warga: isi form → **Buat Surat PDF** → **Kirim ke WhatsApp** pengurus → pengurus cetak/tanda tangan/stempel.

- File baru: **`surat-pdf.js`** (pembuat PDF tanpa library luar; wajib ikut di-upload bersama `layanan.html`).
  Kolom form dan redaksi tiap surat ada di objek `JENIS` di file itu — boleh diedit.
- **Kop surat resmi**: Pemerintah Kabupaten Bekasi → Kecamatan Babelan → RT 008 / RW 021 → alamat perumahan → email,
  dengan **logo RW (kiri)** dan **logo RT (kanan)** serta garis ganda. Teks kop diatur di `config.js`
  (`kopPemerintah`, `kopKecamatan`, `kopRTRW`, `alamatKopSurat`, `emailKopSurat`, plus `tempatSurat`).
  Logo ada di `assets/logo-rw.png` dan `assets/logo-rt.png` — ganti file itu (nama sama) kalau logo berubah.
  Nama Ketua diambil dari isian `namaKetua`.
- Nomor surat dibiarkan titik-titik (`........ / RT.08 / RW.021 / IX / 2026`) untuk diisi pengurus.
- PDF dibuat di HP warga; **tidak disimpan di server/Firebase**.

Cara PDF sampai ke WhatsApp (WhatsApp tidak mengizinkan situs mengirim file otomatis, jadi warga tetap menekan Kirim):
1. **Aplikasi Android Warga versi 1.1+** — membuka chat pengurus dengan PDF sudah terlampir (perlu build ulang APK, lihat `android/`).
2. **Browser HP (Chrome/Safari)** — muncul lembar bagikan dengan PDF terlampir → pilih WhatsApp → pilih kontak pengurus.
3. **Cadangan (laptop/aplikasi lama)** — PDF terunduh dan chat WhatsApp pengurus terbuka; PDF dilampirkan manual.

## Nomor Invoice, Transparansi & Pencarian Iuran

- **Nomor invoice** (mis. `KW-2610-AB3CD`) dibuat acak dan **tidak memuat nomor rumah**. Nomor yang sama muncul di PDF kwitansi yang diterima warga lewat WhatsApp. Kirim ulang kwitansi memakai nomor yang sama; paket bayar di muka memakai satu nomor untuk semua bulannya.
- **Halaman Transparansi (publik)** hanya menampilkan nomor invoice, tanpa nomor rumah atau nama. Warga bisa mengetik nomor invoice di kotak *Cek Nomor Invoice Iuran* untuk memastikan iuran mereka tercatat. Nomor invoice muncul setelah Bendahara menekan **Publikasikan ke Transparansi**.
- **Yang bisa melihat nomor rumah**: Ketua/Admin, Bendahara, dan Humas (setelah login). Pasang aturan terbaru di `firebase-rules.json` (node `keuangan` dan `ringkasanKeuangan`).
- **Cari Status Iuran Warga** (`iuran-cari.js`) ada di tab **Iuran** halaman Bendahara, tab **Pembukuan** halaman Admin, dan kartu **Cek Status Iuran Warga** di halaman Humas: cari lewat blok/nomor rumah, nama, atau nomor invoice, plus filter Belum bayar / Menunggak / Menunggu konfirmasi / Sudah lunas. File `iuran-cari.js` wajib ikut di-upload.
- Nomor invoice lama (format `KW-YYMM-BLOK-NO`) disamarkan di halaman publik menjadi `KW-YYMM-•••`.

## Cara kerja fitur (tanpa server/backend)

Karena situs ini murni statis (cocok untuk GitHub Pages), semua form dan tombol aksi (Lapor Lingkungan, Ajukan Surat, Hubungi UMKM, dll) bekerja dengan cara membuka chat WhatsApp berisi pesan otomatis ke nomor pengurus terkait — bukan mengirim ke database. Ini yang membuat portal bisa langsung dipakai warga tanpa perlu membangun server sendiri.

Data yang butuh diperbarui berkala (Agenda, Informasi, Galeri, UMKM, dan
Laporan Keuangan) dikelola lewat `admin.html` + Firebase seperti dijelaskan
di atas, bukan diedit langsung di kode HTML.

## Deploy ke GitHub Pages

1. Upload seluruh file (HTML + `config.js`) ke repository, sejajar (satu folder).
2. Pastikan `index.html` berada di root.
3. Aktifkan Settings > Pages > Deploy from branch > main / root.

## Nomor & tanggal surat otomatis

- **Tanggal** surat (baris "Bekasi, 10 Oktober 2026") selalu terisi otomatis dari tanggal surat dibuat.
- **Nomor urut** surat bernomor (Pengantar, Domisili, Banjir, Warga Baru) terisi otomatis dari penghitung per tahun
  di Firebase (`nomorSurat/TAHUN`), contoh `Nomor : 012 /RT 008/021/ X /2026`. Bulan (angka Romawi) dan tahun juga otomatis.
  Agar penghitung berjalan, **salin ulang `firebase-rules.json` ke Firebase Console → Realtime Database → Rules → Publish**
  (ada tambahan node `nomorSurat`). Bila belum, nomor urut dikosongkan (titik-titik) untuk diisi pengurus — surat tetap jadi.
- Surat **Tinggal Menetap** dan **Tinggal Mengontrak** tidak memuat tanda tangan Ketua RT (hanya "Yang menyatakan").
  Surat Pindah dan Tamu Menginap tetap memuat blok "Mengetahui, Ketua RT".

## Rekap & Berita Acara Laporan Warga (Admin → tab Laporan)

Kartu **📋 Rekap & Berita Acara Laporan Warga** di atas daftar laporan (`admin.html`, file pendukung `rekap-laporan.js`):

- Saring per **periode** (semua / bulan ini / bulan lalu / pilih bulan), **kategori**, dan **status**. Ringkasan jumlah tampil langsung.
- **⬇ Download Excel (.xlsx)** — lembar *Rekap Laporan* (tanggal, kode, pelapor, blok, WA, kategori, isi, status, catatan, ada-tidaknya foto;
  ada filter & baris judul beku) dan lembar *Ringkasan* (jumlah per status & kategori).
- **📄 Berita Acara (PDF)** — kop RT/RW, nomor otomatis `BA-LAP/TANGGAL-JAM/RT.008.021`, tanggal otomatis, ringkasan,
  tabel daftar laporan, dan tanda tangan Sekretaris & Ketua RT (nama dari `config.js`).
- Data diambil real-time dari laporan yang masuk lewat halaman Layanan; hanya admin yang bisa melihatnya.
