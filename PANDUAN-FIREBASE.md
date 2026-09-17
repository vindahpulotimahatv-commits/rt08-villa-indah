# Panduan Menghubungkan Daftar Hadir & Doorprize ke Firebase

Fitur **Daftar Hadir** dan **Roda Doorprize** butuh satu tempat penyimpanan data
bersama supaya semua HP warga & panitia melihat data yang sama. Portal ini
memakai **Firebase Realtime Database** (gratis untuk skala RT/RW) untuk itu.

## 1. Buat project Firebase

1. Buka https://console.firebase.google.com, login dengan akun Google.
2. Klik **Add project** (Tambah project), beri nama misalnya `rt08-villa-indah`.
3. Google Analytics boleh dimatikan (tidak dibutuhkan) — klik **Create project**.

## 2. Aktifkan Realtime Database

1. Di sidebar kiri project, klik **Build > Realtime Database**.
2. Klik **Create Database**.
3. Pilih lokasi server terdekat (misalnya `Singapore (asia-southeast1)`).
4. Pilih **Start in test mode** dulu — nanti diperketat di langkah 4.

## 3. Daftarkan aplikasi Web & salin konfigurasi

1. Di halaman utama project (klik ikon gerigi > **Project settings**), scroll ke
   bagian **Your apps**.
2. Klik ikon **</>** (Web) untuk menambah app baru. Beri nama bebas, misalnya
   `Portal RT 08`. Tidak perlu centang "Firebase Hosting".
3. Setelah didaftarkan, akan muncul kode berisi objek `firebaseConfig` seperti:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "rt08-villa-indah.firebaseapp.com",
     databaseURL: "https://rt08-villa-indah-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "rt08-villa-indah",
     storageBucket: "rt08-villa-indah.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```
4. Salin nilai-nilai di dalamnya (bukan variabelnya, cukup isinya) ke bagian
   `firebaseConfig` di `config.js` proyek ini, termasuk **`databaseURL`**
   (wajib untuk Realtime Database). Simpan, lalu upload ulang `config.js` ke
   GitHub Pages.

Setelah ini, form Daftar Hadir & halaman Roda Doorprize akan langsung aktif.

## 4. Perketat aturan keamanan (WAJIB, jangan dilewati)

Karena test mode di langkah 2 mengizinkan siapa saja membaca **dan menulis**
tanpa batas sampai 30 hari lalu terkunci total, aturan ini perlu diganti supaya
akses tetap terbuka untuk warga (tanpa login) tapi terbatas hanya ke data
daftar hadir. Realtime Database pakai format **JSON**, berbeda dari Firestore:

1. Di halaman Realtime Database, buka tab **Rules**.
2. Ganti isinya dengan:
   ```json
   {
     "rules": {
       "daftarHadir": {
         ".read": true,
         "$rumahKey": {
           ".write": "!data.exists() || (newData.child('nama').val() === data.child('nama').val() && newData.child('rumah').val() === data.child('rumah').val())",
           ".validate": "newData.hasChildren(['nama','rumah','waktu','status'])"
         }
       },
       "agenda": { ".read": true, ".write": true },
       "informasi": { ".read": true, ".write": true },
       "galeri": { ".read": true, ".write": true },
       "umkm": { ".read": true, ".write": true },
       "keuangan": { ".read": true, ".write": true }
     }
   }
   ```
3. Klik **Publish**.

Penjelasan tiap node:
- **daftarHadir** — dipakai halaman Daftar Hadir & Doorprize. 1 rumah = 1 entri
  (anti-duplikat), panitia hanya bisa ubah status menang, tidak bisa hapus.
- **agenda, informasi, galeri, umkm, keuangan** — dikelola lewat halaman
  `admin.html` yang dikunci password (`adminPassword` di `config.js`). Karena
  kuncinya di sisi tampilan (bukan Firebase Auth), siapa pun yang tahu URL
  API bisa menulis langsung tanpa lewat password — risiko yang sama seperti
  sebelumnya, cukup aman untuk skala RT selama URL/config project tidak
  disebar sembarangan.

> Catatan: karena tidak ada login, aturan ini tidak bisa mencegah 100% orang
> iseng mengisi data asal-asalan — sama seperti keterbatasan versi Google
> Apps Script sebelumnya. Untuk acara RT skala kecil ini biasanya cukup aman.

## 4b. Tentang foto di Galeri & UMKM

Foto yang diupload admin di `admin.html` otomatis dikompres di browser (resize
+ diubah ke JPEG kualitas ~75%) sebelum disimpan sebagai teks base64 langsung
di Realtime Database — **bukan** Firebase Storage, supaya tidak perlu upgrade
ke paket berbayar (Blaze). Konsekuensinya:
- Setiap foto biasanya jadi ~50–200 KB setelah dikompres.
- Paket gratis (Spark) punya kuota 1 GB penyimpanan & 10 GB/bulan unduhan —
  cukup untuk ratusan foto pada penggunaan skala RT.
- Kalau ke depannya foto makin banyak dan mendekati batas, admin bisa hapus
  foto lama lewat `admin.html` (tab Galeri/UMKM, tombol ✕ di tiap foto).

## 5. Uji coba

1. Buka `daftar-hadir.html`, isi nama & nomor rumah, kirim.
2. Buka Realtime Database > tab **Data** di Firebase Console — akan muncul
   node `daftarHadir` dengan satu entri baru.
3. Buka `doorprize.html`, klik **Muat Ulang Data** — nama tadi harus muncul di
   roda undian.

## Reset data setelah acara selesai

Buka Realtime Database > tab **Data** > arahkan kursor ke node `daftarHadir`
> klik ikon tiga titik / silang di sebelahnya > pilih hapus (delete node).
Data akan bersih untuk acara berikutnya.

