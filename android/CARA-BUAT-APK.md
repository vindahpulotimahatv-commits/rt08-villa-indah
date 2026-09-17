# Cara Tambahkan Build APK ke Repo Website yang Sudah Ada

Folder ini dirancang supaya bisa **langsung digabung** ke repo GitHub
`rt08-villa-indah` yang sudah kamu pakai untuk situs — tidak menimpa satu
pun file website kamu (`index.html`, `admin.html`, `config.js`, dll),
cuma menambahkan folder baru.

## Kenapa aman digabung?
APK cuma "jendela" (WebView) yang selalu memuat langsung dari link situs
GitHub Pages kamu yang online. Jadi walaupun source code APK-nya disimpan
di repo yang sama, **APK tidak menyimpan salinan situs** — dia tetap
mengambil versi terbaru tiap dibuka. Digabung 1 repo atau dipisah 2 repo,
hasilnya sama saja: setiap kamu update file web, APK otomatis ikut
menampilkan versi terbaru.

## Cara upload ke repo yang sudah ada

1. Buka isi zip ini, kamu akan lihat 2 folder:
   - `.github/` (isinya workflow build APK)
   - `android/` (isinya source code project APK Warga & Admin)

2. Upload/salin **kedua folder itu** ke root repo `rt08-villa-indah` kamu,
   sejajar dengan `index.html`, `config.js`, dll yang sudah ada.
   - Kalau repo kamu **sudah punya folder `.github/workflows/`** (untuk
     GitHub Pages misalnya), jangan timpa isinya — cukup **tambahkan**
     file `build-apk.yml` dari zip ini ke folder `.github/workflows/`
     yang sudah ada.

3. Commit & push seperti biasa.

4. Buka tab **Actions** di repo tersebut. Workflow **"Build APK RT 08
   (Warga & Admin)"** akan otomatis jalan (workflow ini sengaja diatur
   supaya **hanya jalan kalau ada perubahan di folder `android/`** —
   jadi tidak akan ikut ke-trigger tiap kamu update `index.html` dll,
   biar hemat kuota Actions).

5. Tunggu ± 3–6 menit sampai centang hijau ✅ di kedua job
   (`build-warga` dan `build-admin`) → buka run tersebut → scroll ke
   **Artifacts** → download `RT08-Warga-APK` dan `RT08-Admin-APK`.

6. Install `.apk` di HP seperti biasa.

## Kalau mau ganti nama/ikon aplikasi
- Nama app: `android/warga/app/src/main/res/values/strings.xml` dan
  `android/admin/app/src/main/res/values/strings.xml` → `app_name`
- Ikon: `android/warga/app/src/main/res/mipmap-*/ic_launcher.png`
  (dan folder `android/admin/...` yang sama)

## Catatan
- APK ini **debug** (belum untuk Play Store), cukup untuk dibagikan
  langsung lewat file `.apk` ke warga/pengurus.
- Notifikasi pengumuman & agenda baru sudah aktif otomatis di app Warga
  (cek berkala tiap ±15 menit), tanpa setup tambahan apa pun.
