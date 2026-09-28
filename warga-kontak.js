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
  "e21": "6281584321165",  // Blok E2 No.1 - BIMBA
  "e22": "6285715884555",  // Blok E2 No.2 - AGUS ARIYANTO
  "e23": "628811966047",  // Blok E2 No.3 - RANTAWINATA
  "e23a": "6281345622700",  // Blok E2 No.3A - HERMAN FAUZI
  "e25": "6287840392933",  // Blok E2 No.5 - DIDIK SETIJADI
  "e26": "6287878810119",  // Blok E2 No.6 - ALIF SETIAWAN
  "e27": "6285929832499",  // Blok E2 No.7 - BASUKI WIDODO
  "e28": "6281388164276",  // Blok E2 No.8 - JOKO SUSILO
  "e29": "",  // Blok E2 No.9 - MUSLIKIN
  "e210": "6282122748193",  // Blok E2 No.10 - SOFIAN KZ
  "e211": "6287880994748",  // Blok E2 No.11 - ARNOLD ARIFIN
  "e212": "6281291821461",  // Blok E2 No.12 - BUDI PURNOMO
  "e212a": "6281994791812",  // Blok E2 No.12A - KARTO
  "e214": "6281585001816",  // Blok E2 No.14 - RIO ISKANDAR
  "e215": "6281316383078",  // Blok E2 No.15 - AHMAD NGUDI
  "e216": "",  // Blok E2 No.16 - NURHAYATI
  "e217": "6281326552278",  // Blok E2 No.17 - DALIH KUSUMA WARDANA
  "e218": "",  // Blok E2 No.18 - IDHAR TAUFIK MAULAMA
  "e219": "6285880404860",  // Blok E2 No.19 - GITA RIFAIDA
  "e220": "6281293174797",  // Blok E2 No.20 - SETYA BUDIYONO
  "e221": "",  // Blok E2 No.21 - ZULHAM
  "e222": "6287820524135",  // Blok E2 No.22 - DIHANTORO
  "e224": "",  // Blok E2 No.24 - DJITRO LAGA RAE
  "e225": "",  // Blok E2 No.25 - ALFONSUS ROLI EKOATMOJO
  "e226": "6285776179903",  // Blok E2 No.26 - KAMIDI
  "e227": "6285893080512",  // Blok E2 No.27 - ARI MARGO PRASETYO
  "e228": "6285777293767",  // Blok E2 No.28 - SUPRAPTO
  "e229": "6282310609880",  // Blok E2 No.29 - ANDI SETIANDI
  "e230": "",  // Blok E2 No.30 - MUHAMMAD ANSHORI
  "e231": "6287887308063",  // Blok E2 No.31 - DADI PURMANTO
  "e232": "6281326552278",  // Blok E2 No.32 - DALIH KUSUMA WARDANA
  "e233": "6287875022951",  // Blok E2 No.33 - DRAJAT
  "e233a": "",  // Blok E2 No.33A - MUZIAH PUTRI PERDANA
  "e235": "",  // Blok E2 No.35 - RIVAN YULIANTO
  "e236": "6287788676667",  // Blok E2 No.36 - ABD HAFIZ
  "e237": "6282311309798",  // Blok E2 No.37 - AGUS SUSANTO
  "e238": "",  // Blok E2 No.38 - WAHYU SUPRIYONO
  "e239": "6281381112532",  // Blok E2 No.39 - MUHAMMAD IQBAL FADLI
  "e240": "6281369013901",  // Blok E2 No.40 - MUHAMAD AJRUL KAMSIN
  "e241": "6285813752900",  // Blok E2 No.41 - WISNU PRIAMBODO
  "e242": "",  // Blok E2 No.42 - BAGOES RIYADI KURNIAWAN
  "e243": "",  // Blok E2 No.43 - LILIK
  "e244": "",  // Blok E2 No.44 - ADIH KURNIAWAN
  "e245": "6285811522118",  // Blok E2 No.45 - SUPRIYATNO
  "e246": "6289636635634",  // Blok E2 No.46 - ABDURRACHMAN ABDULLAH
  "e247": "6282111447554",  // Blok E2 No.47 - RAYNAL IHSANUL AZHAR
  "e248": "6282112465205",  // Blok E2 No.48 - ARIO WIJAYA
  "e51": "",  // Blok E5 No.1 - IKSAN
  "e52": "6289528228949",  // Blok E5 No.2 - BAYU RAMADHANI
  "e53": "",  // Blok E5 No.3 - HERMAN
  "e53a": "6285772674247",  // Blok E5 No.3A - LUKMAN ZAKY ADI NUGROHO
  "e55": "6281210639141",  // Blok E5 No.5 - YUSUF HIDAYAT
  "e56": "6282179120693",  // Blok E5 No.6 - ARDIANSYAH ZUNAIDI
  "e57": "6285777113637",  // Blok E5 No.7 - KURNIA SUBHAN
  "e58": "6285770053707",  // Blok E5 No.8 - HENDYANTO
  "e59": "",  // Blok E5 No.9 - MARSUDI
  "e510": "6281212700221",  // Blok E5 No.10 - MOHAMMAD JAUHARI
  "e511": "6281288740113",  // Blok E5 No.11 - DARMAN SUSILO
  "e512": "6282274333331",  // Blok E5 No.12 - BAHREISY ARI MURFA
  "e512a": "",  // Blok E5 No.12A - HANIYASIH
  "e514": "",  // Blok E5 No.14 - M KHASAN BASRI
  "e515": "6285882051084",  // Blok E5 No.15 - JOKO PRIYONO
  "e516": "6285881809090",  // Blok E5 No.16 - MOCH FAOZI
  "e517": "6289637716060",  // Blok E5 No.17 - DANANG ISDIANTO
  "e518": "",  // Blok E5 No.18 - RATIH NURKUMALASARI
  "e519": "6289528528372",  // Blok E5 No.19 - RONAL TAMPUBOLON
  "e520": "",  // Blok E5 No.20 - INDAH WINDYA FURRI, SS
  "e61": "6283897979509",  // Blok E6 No.1 - TAKDIM SAEFUDIN
  "e62": "",  // Blok E6 No.2 - MESLA MANALU
  "e63": "6281388870451",  // Blok E6 No.3 - MUHAMMAD ANDRE
  "e63a": "6282244304524",  // Blok E6 No.3A - MIFTAHUL ULUM
  "e65": "6281218582552",  // Blok E6 No.5 - YOSICO LOUPATTY
  "e66": "",  // Blok E6 No.6 - MUHAMMAD DENIS YUSNANDAR
  "e67": "",  // Blok E6 No.7 - RIYAN WIBIKSONO
  "e68": "6282310609880",  // Blok E6 No.8 - ANDI SETIANDI
  "e69": "",  // Blok E6 No.9 - AGUNG PRASETIYO WIBOWO
  "e610": "6289524503797",  // Blok E6 No.10 - DEDI SANJAYA
  "e611": "6289601492089",  // Blok E6 No.11 - ROKHIMAN
  "e612": "",  // Blok E6 No.12 - SYARIEF H. M.
  "e612a": "",  // Blok E6 No.12A - ANDI MAPPAPOLEONRO
  "e614": "6281218844904",  // Blok E6 No.14 - SUDARMAWAN
  "e615": "6285697193127",  // Blok E6 No.15 - ADITYA GUMELAR EKAPUTRA
  "e616": "6288290313533",  // Blok E6 No.16 - PONIDIN
  "e617": "6289667442456",  // Blok E6 No.17 - DENI IRLANTO
  "e618": "628176668878",  // Blok E6 No.18 - MUKHALIM
  "e619": "",  // Blok E6 No.19 - UNIK LESTIYATI
  "e620": "6285694067006",  // Blok E6 No.20 - AGUS SUKANDA
  "e621": "6282112918282",  // Blok E6 No.21 - PONIJO
  "e622": "6285775161291",  // Blok E6 No.22 - MUHAMMAD EQUE FAJARULLAH
  "e623": "6281210336606",  // Blok E6 No.23 - HASIHOLAN HASUGIAN
  "e624": "6287821600009",  // Blok E6 No.24 - SYAHRIL HOLIDY
  "e71": "",  // Blok E7 No.1 - JEFRI
  "e72": "",  // Blok E7 No.2 - IRFANI
  "e73": "628988750537",  // Blok E7 No.3 - RIZKI ARIJANSYAH
  "e73a": "",  // Blok E7 No.3A - FIRMAN MAULANA ANGGREAWAN
  "e75": "6289658786537",  // Blok E7 No.5 - MURDIYANTO
  "e76": "6281317665347",  // Blok E7 No.6 - RIZKY KUSUMA PUTRA
  "e77": "",  // Blok E7 No.7 - MARKUS EKO TRI WIDAGDO
  "e78": "",  // Blok E7 No.8 - GRACELINA RIBKAH PUIDE
  "e79": "",  // Blok E7 No.9 - AGUNG GRIYADI
  "e710": "6288213962696",  // Blok E7 No.10 - FIQI MAULANA
  "e711": "6289634921305",  // Blok E7 No.11 - MUHIDIN ZAELANI
  "e712": "6285780010892",  // Blok E7 No.12 - M.SOLIKHUDIN
  "e712a": "6287738405391",  // Blok E7 No.12A - EKO AGUS SISWANTO
  "e714": "",  // Blok E7 No.14 - GUDANG M. ULUM
  "e715": "",  // Blok E7 No.15 - DIPO PURNOMO
  "e716": "",  // Blok E7 No.16 - SIM YENNI
  "e717": "",  // Blok E7 No.17 - KUSENO
  "e718": "",  // Blok E7 No.18 - SUPANGAT
  "e719": "6281351085100",  // Blok E7 No.19 - SILVESTER PETRUS HARTO
  "e720": "",  // Blok E7 No.20 - TOGU HASIHOLAN SINAGA
  "e721": "",  // Blok E7 No.21 - DANIEL JANUARTO
  "e722": "6281213412140",  // Blok E7 No.22 - MIFTAHUL KHOERI
  "e723": "6287886797479",  // Blok E7 No.23 - MUHLISIN
  "e724": "",  // Blok E7 No.24 - AGUS FIRMANSYAH
  "e81": "6281348311901",  // Blok E8 No.1 - SUGENG RIYADI
  "e82": "6281932136575",  // Blok E8 No.2 - SLAMET RIYADI
  "e83": "6281212868178",  // Blok E8 No.3 - IRFAN MAULANA
  "e83a": "6281210119350",  // Blok E8 No.3A - YULMARIZON
  "e85": "6281284634409",  // Blok E8 No.5 - WASITO
  "e86": "6281317631709",  // Blok E8 No.6 - SUPRIYATONO
  "e87": "",  // Blok E8 No.7 - MITRIYANI
  "e88": "6287881784111",  // Blok E8 No.8 - AZRAN ARDIANSYAH
  "e89": "6281382019931",  // Blok E8 No.9 - ABDULLAH
  "e810": "",  // Blok E8 No.10 - JONSON SIALLAGAN
  "e811": "",  // Blok E8 No.11 - KRISTINA MARNI MANURUNG
  "e812": "628568700776",  // Blok E8 No.12 - HENDRIX MOCHAMMAD MIRZA
  "e812a": "",  // Blok E8 No.12A - YURIANA MARUHAWA
  "e814": "6285718666781",  // Blok E8 No.14 - JOKO ARIANTO
  "e815": "6281285052283",  // Blok E8 No.15 - KIKI NOVIAR
  "e816": "6281807229908",  // Blok E8 No.16 - WINDU IMAN SANTOSO
  "e817": "",  // Blok E8 No.17 - DANIS PUTRA KARUNIAWAN
  "e818": "6285217780913",  // Blok E8 No.18 - ACHMAD MAULANA
  "e819": "",  // Blok E8 No.19 - BRANGGA
  "e820": "6281283196310",  // Blok E8 No.20 - AZIZ BAEHAKI
  "e821": "6285310138812",  // Blok E8 No.21 - TEGUH JUMADI
  "e822": "",  // Blok E8 No.22 - MUHAIMIN NUR ROSYID
  "e823": "",  // Blok E8 No.23 - KOSONG
  "e824": ""  // Blok E8 No.24 - JOHARI PERNANDO RIO NABABAN
};
