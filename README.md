# RT 08 / RW 021 Villa Indah Pulo Timaha — Portal Warga

Setiap file HTML bisa dibuka langsung tanpa folder CSS/JS terpisah — semua stylesheet dan ilustrasi hero sudah ditanam langsung ke file HTML. Satu-satunya file pendukung adalah `config.js`, tempat semua nomor WhatsApp/telepon dan data kas diatur.

## Langkah wajib sebelum dipakai warga

Buka `config.js` dengan text editor apa pun (Notepad, TextEdit, atau langsung "Edit file" di GitHub), lalu isi:

1. **Nomor WhatsApp pengurus** (`waKetua`, `waSekretaris`, `waBendahara`, `waKeamanan`) — format `62` + nomor tanpa `0` di depan, contoh `6281234567890`. Tanpa ini, tombol Ajukan/Lapor/Hubungi di halaman Layanan, Kontak, Transparansi, dan UMKM tidak akan berfungsi.
2. **Nomor telepon** untuk halaman Kontak (`teleponKetua`, dst).
3. **Jumlah KK** dan **ringkasan kas** (`saldoKas`, `pemasukanBulanIni`, `pengeluaranBulanIni`).
4. **Direktori UMKM** — tambah/hapus baris pada `umkm: [...]` sesuai usaha warga yang terdaftar, termasuk nomor WA masing-masing.
5. (Opsional) `linkGrupWA` untuk tombol "Grup WhatsApp Warga" di footer, dan `linkDokumen` untuk folder dokumen RT (Google Drive dll).

Simpan `config.js`, lalu upload ulang bersama file HTML lainnya. Semua halaman otomatis memakai data terbaru — tidak perlu edit satu-satu di tiap file HTML.

## Cara kerja fitur (tanpa server/backend)

Karena situs ini murni statis (cocok untuk GitHub Pages), semua form dan tombol aksi (Lapor Lingkungan, Ajukan Surat, Hubungi UMKM, dll) bekerja dengan cara membuka chat WhatsApp berisi pesan otomatis ke nomor pengurus terkait — bukan mengirim ke database. Ini yang membuat portal bisa langsung dipakai warga tanpa perlu membangun server sendiri.

Tabel transaksi kas di `transparansi.html` diedit langsung di HTML (baris `<tr>...</tr>`) oleh bendahara setiap ada transaksi baru, karena datanya berubah per tanggal.

## Deploy ke GitHub Pages

1. Upload seluruh file (HTML + `config.js`) ke repository, sejajar (satu folder).
2. Pastikan `index.html` berada di root.
3. Aktifkan Settings > Pages > Deploy from branch > main / root.
