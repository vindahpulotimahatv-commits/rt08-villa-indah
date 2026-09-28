package com.rt08villaindah.humas;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * Cek berkala (WorkManager, tiap 15 menit) ke Firebase Realtime Database lewat REST.
 * Untuk tiap bagian data, ambil DAFTAR KUNCI saja (?shallow=true) supaya hemat kuota
 * (laporan warga bisa berisi foto base64 yang besar). Hanya item baru yang diunduh
 * lengkap untuk dijadikan isi notifikasi.
 */
public class CheckUpdateWorker extends Worker {

    private static final String TAG = "CheckUpdateWorker";
    private static final String DB_URL = "https://rt08-villa-indah-default-rtdb.asia-southeast1.firebasedatabase.app";
    private static final String PREFS = "rt08_humas_update_prefs";
    private static final String TARGET_PAGE = "humas.html";

    public CheckUpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        checkSection("laporan");
        checkSection("informasi");
        checkSection("agenda");
        return Result.success();
    }

    private void checkSection(String path) {
        try {
            JSONObject keysObj = fetchJson(DB_URL + "/" + path + ".json?shallow=true");
            if (keysObj == null) return;

            SharedPreferences prefs = getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String seenKey = "seen_" + path;
            String seenBefore = prefs.getString(seenKey, null);
            boolean firstRun = (seenBefore == null);

            Set<String> previous = new HashSet<>();
            if (seenBefore != null && !seenBefore.isEmpty()) {
                previous.addAll(Arrays.asList(seenBefore.split(",")));
            }

            List<String> newKeys = new ArrayList<>();
            StringBuilder current = new StringBuilder();
            Iterator<String> it = keysObj.keys();
            while (it.hasNext()) {
                String key = it.next();
                if (current.length() > 0) current.append(",");
                current.append(key);
                if (!previous.contains(key)) newKeys.add(key);
            }

            prefs.edit().putString(seenKey, current.toString()).apply();

            // Baseline pertama kali: jangan bunyikan notifikasi untuk data lama.
            if (firstRun) return;

            int shown = 0;
            for (String key : newKeys) {
                if (shown >= 5) break;
                JSONObject item = fetchJson(DB_URL + "/" + path + "/" + key + ".json");
                if (item == null || item.length() == 0) continue;
                notifyItem(path, key, item);
                shown++;
            }
            int sisa = newKeys.size() - shown;
            if (sisa > 0) {
                NotificationHelper.show(getApplicationContext(), "RT 08 Villa Indah",
                        "Ada " + sisa + " " + label(path) + " baru lainnya.",
                        TARGET_PAGE, ("summary_" + path).hashCode());
            }
        } catch (Exception e) {
            Log.w(TAG, "Gagal cek pembaruan " + path, e);
        }
    }

    private String label(String path) {
        switch (path) {
            case "laporan": return "laporan warga";
            case "humasSetoran": return "setoran Humas";
            case "informasi": return "pengumuman";
            case "agenda": return "agenda";
            default: return "data";
        }
    }

    private void notifyItem(String path, String key, JSONObject item) {
        String judul;
        String body;
        switch (path) {
            case "laporan":
                judul = "🚨 Laporan warga: " + item.optString("kategori", "Baru");
                body = item.optString("nama", "Warga") + " (" + item.optString("blok", "-") + ")\n"
                        + item.optString("keterangan", "");
                break;
            case "humasSetoran":
                judul = "💵 Setoran Humas baru";
                body = "Petugas " + item.optString("petugas", "-") + " mengajukan setoran iuran "
                        + "Rp " + String.format(java.util.Locale.forLanguageTag("id-ID"), "%,d", (long) item.optDouble("jumlah", 0)) + ".";
                break;
            case "agenda":
                judul = "📅 " + item.optString("judul", "Agenda baru");
                String tgl = item.optString("tanggal", "");
                body = tgl.isEmpty() ? "Ada agenda baru dari pengurus RT." : "Dijadwalkan " + tgl;
                break;
            default: // informasi
                String dari = item.optString("dari", "");
                judul = "📢 " + item.optString("judul", "Pengumuman baru");
                body = item.optString("isi", "");
                if (body.isEmpty()) body = item.optString("kategori", "Ada info baru dari pengurus RT.");
                if (!dari.isEmpty()) body = body + "\n— " + dari;
                break;
        }
        NotificationHelper.show(getApplicationContext(), judul, body, TARGET_PAGE, key.hashCode());
    }

    private JSONObject fetchJson(String urlString) throws Exception {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(urlString).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(20000);

            int code = conn.getResponseCode();
            if (code != 200) {
                Log.w(TAG, "HTTP " + code + " untuk " + urlString);
                return null;
            }

            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
            }

            String body = sb.toString().trim();
            if (body.isEmpty() || "null".equals(body)) return new JSONObject();
            return new JSONObject(body);
        } finally {
            if (conn != null) conn.disconnect();
        }
    }
}
