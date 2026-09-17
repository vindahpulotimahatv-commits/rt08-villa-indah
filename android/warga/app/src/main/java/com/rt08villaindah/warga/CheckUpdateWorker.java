package com.rt08villaindah.warga;

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
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * Worker yang berjalan berkala (dijadwalkan tiap 15 menit lewat WorkManager,
 * lihat MainActivity) untuk mengecek data /informasi dan /agenda di Firebase
 * Realtime Database. Kalau ada item baru yang belum pernah "dilihat"
 * sebelumnya, tampilkan notifikasi lokal.
 *
 * Tidak butuh Firebase SDK / Cloud Function / paket Blaze — cukup baca
 * lewat REST API publik Firebase (format tambahkan ".json" di akhir URL).
 */
public class CheckUpdateWorker extends Worker {

    private static final String TAG = "CheckUpdateWorker";
    private static final String DB_URL = "https://rt08-villa-indah-default-rtdb.asia-southeast1.firebasedatabase.app";
    private static final String PREFS = "rt08_update_prefs";

    public CheckUpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        checkSection("informasi", "informasi");
        checkSection("agenda", "agenda");
        return Result.success();
    }

    private void checkSection(String path, String type) {
        try {
            JSONObject data = fetchJson(DB_URL + "/" + path + ".json");
            if (data == null) return;

            SharedPreferences prefs = getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String seenKey = "seen_" + path;
            String seenBefore = prefs.getString(seenKey, null);
            boolean firstRun = (seenBefore == null);

            Set<String> previousKeys = new HashSet<>();
            if (seenBefore != null && !seenBefore.isEmpty()) {
                previousKeys.addAll(java.util.Arrays.asList(seenBefore.split(",")));
            }

            List<String> newKeys = new ArrayList<>();
            Iterator<String> it = data.keys();
            StringBuilder currentKeys = new StringBuilder();
            while (it.hasNext()) {
                String key = it.next();
                if (currentKeys.length() > 0) currentKeys.append(",");
                currentKeys.append(key);
                if (!previousKeys.contains(key)) {
                    newKeys.add(key);
                }
            }

            // Simpan daftar key terbaru untuk perbandingan berikutnya
            prefs.edit().putString(seenKey, currentKeys.toString()).apply();

            if (firstRun) {
                // Baseline pertama kali install: jangan notifikasi semua data lama
                return;
            }

            int shown = 0;
            for (String key : newKeys) {
                if (shown >= 5) break; // batasi biar tidak membanjiri notifikasi
                JSONObject item = data.optJSONObject(key);
                if (item == null) continue;
                notifyNewItem(type, key, item);
                shown++;
            }
            int sisa = newKeys.size() - shown;
            if (sisa > 0) {
                String judulRingkas = "informasi".equals(type) ? "pengumuman" : "agenda";
                NotificationHelper.show(
                        getApplicationContext(),
                        "RT 08 Villa Indah",
                        "Ada " + sisa + " " + judulRingkas + " baru lainnya.",
                        path + ".html",
                        ("summary_" + type).hashCode()
                );
            }
        } catch (Exception e) {
            Log.w(TAG, "Gagal cek pembaruan " + path, e);
        }
    }

    private void notifyNewItem(String type, String key, JSONObject item) {
        String judul;
        String body;
        String targetPage;

        if ("informasi".equals(type)) {
            judul = "📢 " + item.optString("judul", "Pengumuman baru");
            body = item.optString("isi", item.optString("kategori", "Ada info baru dari pengurus RT."));
            targetPage = "informasi.html";
        } else {
            judul = "📅 " + item.optString("judul", "Agenda baru");
            String tanggal = item.optString("tanggal", "");
            body = tanggal.isEmpty() ? "Ada agenda baru dari pengurus RT." : "Dijadwalkan " + tanggal;
            targetPage = "agenda.html";
        }

        NotificationHelper.show(getApplicationContext(), judul, body, targetPage, key.hashCode());
    }

    private JSONObject fetchJson(String urlString) throws Exception {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlString);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);

            int code = conn.getResponseCode();
            if (code != 200) return null;

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
