# RT 08 / RW 021 Villa Indah Pulo Timaha — Portal Warga

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

## Cara kerja fitur (tanpa server/backend)

Karena situs ini murni statis (cocok untuk GitHub Pages), semua form dan tombol aksi (Lapor Lingkungan, Ajukan Surat, Hubungi UMKM, dll) bekerja dengan cara membuka chat WhatsApp berisi pesan otomatis ke nomor pengurus terkait — bukan mengirim ke database. Ini yang membuat portal bisa langsung dipakai warga tanpa perlu membangun server sendiri.

Data yang butuh diperbarui berkala (Agenda, Informasi, Galeri, UMKM, dan
Laporan Keuangan) dikelola lewat `admin.html` + Firebase seperti dijelaskan
di atas, bukan diedit langsung di kode HTML.

## Deploy ke GitHub Pages

1. Upload seluruh file (HTML + `config.js`) ke repository, sejajar (satu folder).
2. Pastikan `index.html` berada di root.
3. Aktifkan Settings > Pages > Deploy from branch > main / root.
