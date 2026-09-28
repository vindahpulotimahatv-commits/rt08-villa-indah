/* Nomor WhatsApp warga per rumah - RT 08 / RW 021 Villa Indah Pulo Timaha.
   Dipakai halaman Humas (humas.html) supaya kwitansi pembayaran & reminder
   otomatis terkirim ke WhatsApp PEMILIK RUMAH (bukan ke petugas/pengurus).
   ------------------------------------------------------------
   CARA ISI: tulis nomor WA di antara tanda kutip, format 62 + nomor tanpa
   angka 0 di depan (contoh 0812-3456-7890 ditulis "6281234567890").
   Baris yang masih kosong ("") berarti nomor WA rumah itu belum diketahui;
   Humas masih bisa isi manual sekali langsung di HP saat menarik iuran,
   dan itu otomatis tersimpan untuk bulan-bulan berikutnya.
   Kunci ("e246", dst) JANGAN diubah — dibuat otomatis dari Blok/No. rumah
   di warga-data.js. Simpan file ini lalu upload ulang ke GitHub Pages. */
const WARGA_KONTAK = {
  "e21": "",  // Blok E2 No.1 - BIMBA
  "e22": "",  // Blok E2 No.2 - AGUS ARIYANTO
  "e23": "",  // Blok E2 No.3 - RANTAWINATA
  "e23a": "",  // Blok E2 No.3A - HERMAN FAUZI
  "e25": "",  // Blok E2 No.5 - DIDIK SETIJADI
  "e26": "",  // Blok E2 No.6 - ALIF SETIAWAN
  "e27": "",  // Blok E2 No.7 - BASUKI WIDODO
  "e28": "",  // Blok E2 No.8 - JOKO SUSILO
  "e29": "",  // Blok E2 No.9 - MUSLIKIN
  "e210": "",  // Blok E2 No.10 - SOFIAN KZ
  "e211": "",  // Blok E2 No.11 - ARNOLD ARIFIN
  "e212": "",  // Blok E2 No.12 - BUDI PURNOMO
  "e212a": "",  // Blok E2 No.12A - KARTO
  "e214": "",  // Blok E2 No.14 - RIO ISKANDAR
  "e215": "",  // Blok E2 No.15 - AHMAD NGUDI
  "e216": "",  // Blok E2 No.16 - NURHAYATI
  "e217": "",  // Blok E2 No.17 - DALIH KUSUMA WARDANA
  "e218": "",  // Blok E2 No.18 - IDHAR TAUFIK MAULAMA
  "e219": "",  // Blok E2 No.19 - GITA RIFAIDA
  "e220": "",  // Blok E2 No.20 - SETYA BUDIYONO
  "e221": "",  // Blok E2 No.21 - ZULHAM
  "e222": "",  // Blok E2 No.22 - DIHANTORO
  "e224": "",  // Blok E2 No.24 - DJITRO LAGA RAE
  "e225": "",  // Blok E2 No.25 - ALFONSUS ROLI EKOATMOJO
  "e226": "",  // Blok E2 No.26 - KAMIDI
  "e227": "",  // Blok E2 No.27 - ARI MARGO PRASETYO
  "e228": "",  // Blok E2 No.28 - SUPRAPTO
  "e229": "",  // Blok E2 No.29 - ANDI SETIANDI
  "e230": "",  // Blok E2 No.30 - MUHAMMAD ANSHORI
  "e231": "",  // Blok E2 No.31 - DADI PURMANTO
  "e232": "",  // Blok E2 No.32 - DALIH KUSUMA WARDANA
  "e233": "",  // Blok E2 No.33 - DRAJAT
  "e233a": "",  // Blok E2 No.33A - MUZIAH PUTRI PERDANA
  "e235": "",  // Blok E2 No.35 - RIVAN YULIANTO
  "e236": "",  // Blok E2 No.36 - ABD HAFIZ
  "e237": "",  // Blok E2 No.37 - AGUS SUSANTO
  "e238": "",  // Blok E2 No.38 - WAHYU SUPRIYONO
  "e239": "",  // Blok E2 No.39 - MUHAMMAD IQBAL FADLI
  "e240": "",  // Blok E2 No.40 - MUHAMAD AJRUL KAMSIN
  "e241": "",  // Blok E2 No.41 - WISNU PRIAMBODO
  "e242": "",  // Blok E2 No.42 - BAGOES RIYADI KURNIAWAN
  "e243": "",  // Blok E2 No.43 - LILIK
  "e244": "",  // Blok E2 No.44 - ADIH KURNIAWAN
  "e245": "",  // Blok E2 No.45 - SUPRIYATNO
  "e246": "",  // Blok E2 No.46 - ABDURRACHMAN ABDULLAH
  "e247": "6282111447554",  // Blok E2 No.47 - RAYNAL IHSANUL AZHAR
  "e248": "",  // Blok E2 No.48 - ARIO WIJAYA
  "e51": "",  // Blok E5 No.1 - IKSAN
  "e52": "",  // Blok E5 No.2 - BAYU RAMADHANI
  "e53": "",  // Blok E5 No.3 - HERMAN
  "e53a": "",  // Blok E5 No.3A - LUKMAN ZAKY ADI NUGROHO
  "e55": "",  // Blok E5 No.5 - YUSUF HIDAYAT
  "e56": "",  // Blok E5 No.6 - ARDIANSYAH ZUNAIDI
  "e57": "",  // Blok E5 No.7 - KURNIA SUBHAN
  "e58": "",  // Blok E5 No.8 - HENDYANTO
  "e59": "",  // Blok E5 No.9 - MARSUDI
  "e510": "",  // Blok E5 No.10 - MOHAMMAD JAUHARI
  "e511": "",  // Blok E5 No.11 - DARMAN SUSILO
  "e512": "",  // Blok E5 No.12 - BAHREISY ARI MURFA
  "e512a": "",  // Blok E5 No.12A - HANIYASIH
  "e514": "",  // Blok E5 No.14 - M KHASAN BASRI
  "e515": "",  // Blok E5 No.15 - JOKO PRIYONO
  "e516": "",  // Blok E5 No.16 - MOCH FAOZI
  "e517": "",  // Blok E5 No.17 - DANANG ISDIANTO
  "e518": "",  // Blok E5 No.18 - RATIH NURKUMALASARI
  "e519": "",  // Blok E5 No.19 - RONAL TAMPUBOLON
  "e520": "",  // Blok E5 No.20 - INDAH WINDYA FURRI, SS
  "e61": "",  // Blok E6 No.1 - TAKDIM SAEFUDIN
  "e62": "",  // Blok E6 No.2 - MESLA MANALU
  "e63": "",  // Blok E6 No.3 - MUHAMMAD ANDRE
  "e63a": "",  // Blok E6 No.3A - MIFTAHUL ULUM
  "e65": "",  // Blok E6 No.5 - YOSICO LOUPATTY
  "e66": "",  // Blok E6 No.6 - MUHAMMAD DENIS YUSNANDAR
  "e67": "",  // Blok E6 No.7 - RIYAN WIBIKSONO
  "e68": "",  // Blok E6 No.8 - ANDI SETIANDI
  "e69": "",  // Blok E6 No.9 - AGUNG PRASETIYO WIBOWO
  "e610": "",  // Blok E6 No.10 - DEDI SANJAYA
  "e611": "",  // Blok E6 No.11 - ROKHIMAN
  "e612": "",  // Blok E6 No.12 - SYARIEF H. M.
  "e612a": "",  // Blok E6 No.12A - ANDI MAPPAPOLEONRO
  "e614": "",  // Blok E6 No.14 - SUDARMAWAN
  "e615": "",  // Blok E6 No.15 - ADITYA GUMELAR EKAPUTRA
  "e616": "",  // Blok E6 No.16 - PONIDIN
  "e617": "",  // Blok E6 No.17 - DENI IRLANTO
  "e618": "",  // Blok E6 No.18 - MUKHALIM
  "e619": "",  // Blok E6 No.19 - UNIK LESTIYATI
  "e620": "",  // Blok E6 No.20 - AGUS SUKANDA
  "e621": "",  // Blok E6 No.21 - PONIJO
  "e622": "",  // Blok E6 No.22 - MUHAMMAD EQUE FAJARULLAH
  "e623": "",  // Blok E6 No.23 - HASIHOLAN HASUGIAN
  "e624": "",  // Blok E6 No.24 - SYAHRIL HOLIDY
  "e71": "",  // Blok E7 No.1 - JEFRI
  "e72": "",  // Blok E7 No.2 - IRFANI
  "e73": "",  // Blok E7 No.3 - RIZKI ARIJANSYAH
  "e73a": "",  // Blok E7 No.3A - FIRMAN MAULANA ANGGREAWAN
  "e75": "",  // Blok E7 No.5 - MURDIYANTO
  "e76": "",  // Blok E7 No.6 - RIZKY KUSUMA PUTRA
  "e77": "",  // Blok E7 No.7 - MARKUS EKO TRI WIDAGDO
  "e78": "",  // Blok E7 No.8 - GRACELINA RIBKAH PUIDE
  "e79": "",  // Blok E7 No.9 - AGUNG GRIYADI
  "e710": "",  // Blok E7 No.10 - FIQI MAULANA
  "e711": "",  // Blok E7 No.11 - MUHIDIN ZAELANI
  "e712": "",  // Blok E7 No.12 - M.SOLIKHUDIN
  "e712a": "",  // Blok E7 No.12A - EKO AGUS SISWANTO
  "e714": "",  // Blok E7 No.14 - GUDANG M. ULUM
  "e715": "",  // Blok E7 No.15 - DIPO PURNOMO
  "e716": "",  // Blok E7 No.16 - SIM YENNI
  "e717": "",  // Blok E7 No.17 - KUSENO
  "e718": "",  // Blok E7 No.18 - SUPANGAT
  "e719": "",  // Blok E7 No.19 - SILVESTER PETRUS HARTO
  "e720": "",  // Blok E7 No.20 - TOGU HASIHOLAN SINAGA
  "e721": "",  // Blok E7 No.21 - DANIEL JANUARTO
  "e722": "",  // Blok E7 No.22 - MIFTAHUL KHOERI
  "e723": "",  // Blok E7 No.23 - MUHLISIN
  "e724": "",  // Blok E7 No.24 - AGUS FIRMANSYAH
  "e81": "",  // Blok E8 No.1 - SUGENG RIYADI
  "e82": "",  // Blok E8 No.2 - SLAMET RIYADI
  "e83": "",  // Blok E8 No.3 - IRFAN MAULANA
  "e83a": "",  // Blok E8 No.3A - YULMARIZON
  "e85": "",  // Blok E8 No.5 - WASITO
  "e86": "",  // Blok E8 No.6 - SUPRIYATONO
  "e87": "",  // Blok E8 No.7 - MITRIYANI
  "e88": "",  // Blok E8 No.8 - AZRAN ARDIANSYAH
  "e89": "",  // Blok E8 No.9 - ABDULLAH
  "e810": "",  // Blok E8 No.10 - JONSON SIALLAGAN
  "e811": "",  // Blok E8 No.11 - KRISTINA MARNI MANURUNG
  "e812": "",  // Blok E8 No.12 - HENDRIX MOCHAMMAD MIRZA
  "e812a": "",  // Blok E8 No.12A - YURIANA MARUHAWA
  "e814": "",  // Blok E8 No.14 - JOKO ARIANTO
  "e815": "",  // Blok E8 No.15 - KIKI NOVIAR
  "e816": "",  // Blok E8 No.16 - WINDU IMAN SANTOSO
  "e817": "",  // Blok E8 No.17 - DANIS PUTRA KARUNIAWAN
  "e818": "",  // Blok E8 No.18 - ACHMAD MAULANA
  "e819": "",  // Blok E8 No.19 - BRANGGA
  "e820": "",  // Blok E8 No.20 - AZIZ BAEHAKI
  "e821": "",  // Blok E8 No.21 - TEGUH JUMADI
  "e822": "",  // Blok E8 No.22 - MUHAIMIN NUR ROSYID
  "e823": "",  // Blok E8 No.23 - KOSONG
  "e824": ""  // Blok E8 No.24 - JOHARI PERNANDO RIO NABABAN
};
