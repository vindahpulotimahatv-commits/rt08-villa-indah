# Panduan Menghubungkan Daftar Hadir & Doorprize ke Firebase

Fitur **Daftar Hadir** dan **Roda Doorprize** butuh satu tempat penyimpanan data
bersama supaya semua HP warga & panitia melihat data yang sama. Portal ini
memakai **Firebase Firestore** (gratis untuk skala RT/RW) untuk itu.

## 1. Buat project Firebase

1. Buka https://console.firebase.google.com, login dengan akun Google.
2. Klik **Add project** (Tambah project), beri nama misalnya `rt08-villa-indah`.
3. Google Analytics boleh dimatikan (tidak dibutuhkan) — klik **Create project**.

## 2. Aktifkan Firestore Database

1. Di sidebar kiri project, klik **Build > Firestore Database**.
2. Klik **Create database**.
3. Pilih lokasi server terdekat (misalnya `asia-southeast2 (Jakarta)`).
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
     projectId: "rt08-villa-indah",
     storageBucket: "rt08-villa-indah.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```
4. Salin nilai-nilai di dalamnya (bukan variabelnya, cukup isinya) ke bagian
   `firebaseConfig` di `config.js` proyek ini. Simpan, lalu upload ulang
   `config.js` ke GitHub Pages.

Setelah ini, form Daftar Hadir & halaman Roda Doorprize akan langsung aktif.

## 4. Perketat aturan keamanan (WAJIB, jangan dilewati)

Karena test mode di langkah 2 mengizinkan siapa saja membaca **dan menulis**
tanpa batas sampai 30 hari lalu terkunci total, aturan ini perlu diganti supaya
akses tetap terbuka untuk warga (tanpa login) tapi terbatas hanya ke data
daftar hadir:

1. Di Firestore Database, buka tab **Rules**.
2. Ganti isinya dengan:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /daftarHadir/{docId} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasAll(['nama','rumah','status'])
                       && request.resource.data.nama is string
                       && request.resource.data.rumah is string;
         allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['status']);
         allow delete: if false;
       }
     }
   }
   ```
3. Klik **Publish**.

Aturan di atas mengizinkan siapa pun mendaftar (create) dan panitia
menandai menang (update status saja), tapi tidak bisa menghapus data atau
mengubah field lain sembarangan.

> Catatan: karena tidak ada login, aturan ini tidak bisa mencegah 100% orang
> iseng mengisi data asal-asalan — sama seperti keterbatasan versi Google
> Apps Script sebelumnya. Untuk acara RT skala kecil ini biasanya cukup aman.

## 5. Uji coba

1. Buka `daftar-hadir.html`, isi nama & nomor rumah, kirim.
2. Buka Firestore Database > tab **Data** di Firebase Console — akan muncul
   koleksi `daftarHadir` dengan satu dokumen baru.
3. Buka `doorprize.html`, klik **Muat Ulang Data** — nama tadi harus muncul di
   roda undian.

## Reset data setelah acara selesai

Buka Firestore Database > tab **Data** > koleksi `daftarHadir` > klik ikon
tiga titik di sebelah nama koleksi > **Delete collection**. Data akan bersih
untuk acara berikutnya.
