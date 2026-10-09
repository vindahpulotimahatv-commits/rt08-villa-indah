/* ============================================================
   INFO HARIAN — jadwal sholat, perkiraan cuaca, peringatan banjir
   Dipakai oleh info-harian.html dan widget di index.html.
   Sumber data (gratis, tanpa kunci API):
   - Jadwal sholat : Aladhan API, metode 20 (Kemenag RI)
   - Cuaca & hujan : Open-Meteo
   Lokasi diatur di config.js -> RT_CONFIG.lokasi
   ============================================================ */
(function (root) {
  "use strict";

  var TZ = "Asia/Jakarta";
  var CFG = (typeof RT_CONFIG !== "undefined" && RT_CONFIG) ? RT_CONFIG : {};
  var LOK = CFG.lokasi || {};
  var LAT = typeof LOK.lat === "number" ? LOK.lat : -6.19;
  var LON = typeof LOK.lon === "number" ? LOK.lon : 107.04;
  var NAMA = LOK.nama || "Villa Indah Pulo Timaha, Babelan";
  var KOREKSI = Number(CFG.koreksiSholatMenit) || 0;

  /* ---------- util ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* "sekarang" menurut jam Jakarta, sebagai objek Date lokal semu */
  function nowJkt() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
  }
  function tglKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function jamKey(d) { return tglKey(d) + "T" + pad(d.getHours()) + ":00"; }

  function simpan(k, v) { try { localStorage.setItem(k, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {} }
  function baca(k, maxMs) {
    try {
      var o = JSON.parse(localStorage.getItem(k) || "null");
      if (o && (maxMs == null || Date.now() - o.t < maxMs)) return o.v;
    } catch (e) {}
    return null;
  }

  function ambilJson(url) {
    var ctl = ("AbortController" in root) ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }, function (e) { clearTimeout(t); throw e; });
  }

  /* ---------- jadwal sholat ---------- */
  var NAMA_SHOLAT = [
    ["Imsak", "Imsak"], ["Fajr", "Subuh"], ["Sunrise", "Terbit"],
    ["Dhuhr", "Dzuhur"], ["Asr", "Ashar"], ["Maghrib", "Maghrib"], ["Isha", "Isya"]
  ];

  function menitDari(hhmm) {
    var m = /(\d{1,2}):(\d{2})/.exec(String(hhmm || ""));
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }
  function jamDariMenit(mnt) {
    mnt = ((mnt % 1440) + 1440) % 1440;
    return pad(Math.floor(mnt / 60)) + ":" + pad(mnt % 60);
  }

  /* Mengubah respons Aladhan menjadi [{kunci,nama,menit,jam}] */
  function olahSholat(data) {
    var t = data && data.data && data.data.timings;
    if (!t) throw new Error("data sholat kosong");
    return NAMA_SHOLAT.map(function (p) {
      var m = menitDari(t[p[0]]);
      if (m == null) throw new Error("waktu " + p[0] + " tidak valid");
      /* koreksi (ihtiyat) tidak diterapkan ke Imsak/Terbit supaya aman */
      var wajib = p[0] !== "Imsak" && p[0] !== "Sunrise";
      if (wajib) m += KOREKSI;
      return { kunci: p[0], nama: p[1], menit: m, jam: jamDariMenit(m), wajib: wajib };
    });
  }

  function ambilSholat() {
    var d = nowJkt(), key = "pandu.sholat." + tglKey(d) + "." + LAT + "," + LON;
    var cache = baca(key);
    if (cache) return Promise.resolve({ daftar: cache, dariCache: true });
    var url = "https://api.aladhan.com/v1/timings/" + pad(d.getDate()) + "-" + pad(d.getMonth() + 1) + "-" + d.getFullYear() +
      "?latitude=" + LAT + "&longitude=" + LON + "&method=20&timezonestring=" + encodeURIComponent(TZ);
    return ambilJson(url).then(function (j) {
      var daftar = olahSholat(j);
      simpan(key, daftar);
      return { daftar: daftar, dariCache: false };
    });
  }

  /* Waktu sholat berikutnya (hanya 5 waktu wajib + Imsak/Terbit diabaikan) */
  function sholatBerikut(daftar, now) {
    now = now || nowJkt();
    var skrg = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    var wajib = daftar.filter(function (x) { return x.wajib; });
    for (var i = 0; i < wajib.length; i++) {
      if (wajib[i].menit > skrg) return { item: wajib[i], sisaMenit: wajib[i].menit - skrg, besok: false, sebelumnya: i ? wajib[i - 1] : null };
    }
    /* sudah lewat Isya -> Subuh besok (perkiraan memakai jam Subuh hari ini) */
    return { item: wajib[0], sisaMenit: wajib[0].menit + 1440 - skrg, besok: true, sebelumnya: wajib[wajib.length - 1] };
  }

  function formatSisa(menit) {
    var m = Math.max(0, Math.round(menit));
    var j = Math.floor(m / 60), s = m % 60;
    if (j && s) return j + " jam " + s + " menit";
    if (j) return j + " jam";
    return s + " menit";
  }

  /* ---------- cuaca ---------- */
  var KODE = {
    0: ["Cerah", "☀️"], 1: ["Cerah berawan", "🌤️"], 2: ["Berawan sebagian", "⛅"], 3: ["Berawan", "☁️"],
    45: ["Berkabut", "🌫️"], 48: ["Berkabut", "🌫️"],
    51: ["Gerimis ringan", "🌦️"], 53: ["Gerimis", "🌦️"], 55: ["Gerimis lebat", "🌧️"],
    56: ["Gerimis dingin", "🌧️"], 57: ["Gerimis dingin", "🌧️"],
    61: ["Hujan ringan", "🌦️"], 63: ["Hujan sedang", "🌧️"], 65: ["Hujan lebat", "🌧️"],
    66: ["Hujan dingin", "🌧️"], 67: ["Hujan dingin", "🌧️"],
    80: ["Hujan lokal ringan", "🌦️"], 81: ["Hujan lokal sedang", "🌧️"], 82: ["Hujan lokal lebat", "⛈️"],
    95: ["Badai petir", "⛈️"], 96: ["Badai petir & es", "⛈️"], 99: ["Badai petir & es", "⛈️"]
  };
  function kodeCuaca(c) { return KODE[c] || ["Tidak diketahui", "🌡️"]; }

  function ambilCuaca() {
    var key = "pandu.cuaca." + LAT + "," + LON;
    var cache = baca(key, 20 * 60 * 1000);
    if (cache) return Promise.resolve({ data: cache, dariCache: true });
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + LAT + "&longitude=" + LON +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
      "&hourly=temperature_2m,precipitation,precipitation_probability,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max" +
      "&timezone=" + encodeURIComponent(TZ) + "&past_days=1&forecast_days=4";
    return ambilJson(url).then(function (j) {
      if (!j || !j.hourly || !j.hourly.time || !j.current || !j.daily) throw new Error("data cuaca tidak lengkap");
      simpan(key, j);
      return { data: j, dariCache: false };
    }).catch(function (e) {
      var lama = baca(key); /* pakai cache lama bila jaringan gagal */
      if (lama) return { data: lama, dariCache: true, basi: true };
      throw e;
    });
  }

  /* ---------- peringatan banjir (perkiraan dari curah hujan) ---------- */
  /* Ambang mengacu pada kelas intensitas hujan BMKG:
     per jam : sedang 5-10, lebat 10-20, sangat lebat >20 mm
     per hari: sedang 20-50, lebat 50-100, sangat lebat 100-150, ekstrem >150 mm */
  var LEVEL = [
    { id: 0, nama: "Aman", warna: "#1f8a4c", ikon: "✅", saran: "Tidak ada indikasi hujan ekstrem. Tetap pantau info resmi dari pengurus." },
    { id: 1, nama: "Waspada", warna: "#b7791f", ikon: "⚠️", saran: "Hujan cukup deras diperkirakan. Bersihkan saluran di depan rumah dan siapkan barang penting di tempat tinggi." },
    { id: 2, nama: "Siaga", warna: "#d9480f", ikon: "🟠", saran: "Risiko genangan tinggi. Pindahkan kendaraan & dokumen ke tempat aman, cek saluran, dan siaga hubungi pengurus." },
    { id: 3, nama: "Bahaya", warna: "#c92a2a", ikon: "🚨", saran: "Risiko banjir tinggi. Ikuti arahan pengurus & petugas, siapkan evakuasi keluarga rentan. Darurat: 112." }
  ];

  function jumlah(arr, a, b) {
    var s = 0;
    for (var i = Math.max(0, a); i < Math.min(arr.length, b); i++) s += (+arr[i] || 0);
    return s;
  }
  function maks(arr, a, b) {
    var m = 0;
    for (var i = Math.max(0, a); i < Math.min(arr.length, b); i++) m = Math.max(m, +arr[i] || 0);
    return m;
  }

  /* cuaca = respons Open-Meteo; now = Date jam Jakarta. Mengembalikan ringkasan & level. */
  function hitungBanjir(cuaca, now) {
    now = now || nowJkt();
    var h = cuaca.hourly, p = h.precipitation;
    var idx = h.time.indexOf(jamKey(now));
    if (idx < 0) idx = h.time.findIndex(function (t) { return t >= jamKey(now); });
    if (idx < 0) idx = 0;

    var lalu24 = jumlah(p, idx - 24, idx);
    var depan6 = jumlah(p, idx, idx + 6);
    var depan24 = jumlah(p, idx, idx + 24);
    var depan72 = jumlah(p, idx, idx + 72);
    var jamMaks = maks(p, idx, idx + 24);

    var lv = 0;
    if (depan24 >= 50 || jamMaks >= 10 || depan72 >= 100 || lalu24 >= 50) lv = 1;
    if (depan24 >= 100 || jamMaks >= 20 || depan72 >= 200 || (lalu24 >= 50 && depan24 >= 50)) lv = 2;
    if (depan24 >= 150 || jamMaks >= 30 || (lalu24 >= 100 && depan24 >= 75)) lv = 3;

    /* jam pertama hujan >= 1 mm dalam 24 jam ke depan */
    var mulai = null;
    for (var i = idx; i < Math.min(p.length, idx + 24); i++) {
      if ((+p[i] || 0) >= 1) { mulai = h.time[i]; break; }
    }
    return {
      level: LEVEL[lv], idx: idx,
      lalu24: lalu24, depan6: depan6, depan24: depan24, depan72: depan72, jamMaks: jamMaks, mulaiHujan: mulai
    };
  }

  root.PanduInfoHarian = {
    lokasi: { lat: LAT, lon: LON, nama: NAMA },
    nowJkt: nowJkt, jamKey: jamKey, pad: pad,
    ambilSholat: ambilSholat, olahSholat: olahSholat, sholatBerikut: sholatBerikut, formatSisa: formatSisa,
    ambilCuaca: ambilCuaca, kodeCuaca: kodeCuaca,
    hitungBanjir: hitungBanjir, LEVEL: LEVEL
  };
})(typeof window !== "undefined" ? window : globalThis);
