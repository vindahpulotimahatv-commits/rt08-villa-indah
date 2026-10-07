package com.rt08villaindah.warga;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

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
 * Logika "ada data baru?" yang dipakai bersama oleh RealtimeService (real-time)
 * dan CheckUpdateWorker (cadangan tiap 15 menit). Hanya DAFTAR KUNCI yang diunduh
 * (?shallow=true), item lengkap hanya diunduh bila benar-benar baru.
 * Disinkronkan (synchronized) agar service & worker tidak membunyikan notifikasi ganda.
 */
final class UpdateChecker {
    private static final String TAG = "UpdateChecker";
    static final String DB_URL = "https://rt08-villa-indah-default-rtdb.asia-southeast1.firebasedatabase.app";
    private static final String PREFS = "rt08_update_prefs";

    private UpdateChecker() {}

    static synchronized void check(Context ctx, String path) {
        try {
            JSONObject keysObj = fetchJson(DB_URL + "/" + path + ".json?shallow=true");
            if (keysObj == null) return;

            SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String seenKey = "seen_" + path;
            String seenBefore = prefs.getString(seenKey, null);
            boolean firstRun = (seenBefore == null);

            Set<String> previous = new HashSet<>();
            if (seenBefore != null && !seenBefore.isEmpty()) previous.addAll(Arrays.asList(seenBefore.split(",")));

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

            if (firstRun) return; // baseline pertama: jangan bunyikan data lama

            // Urutkan kunci Firebase (push-id) agar yang terlama tampil dulu
            java.util.Collections.sort(newKeys);
            int shown = 0;
            for (String key : newKeys) {
                if (shown >= 5) break;
                JSONObject item = fetchJson(DB_URL + "/" + path + "/" + key + ".json");
                if (item == null || item.length() == 0) continue;
                notifyItem(ctx, path, key, item);
                shown++;
            }
            int sisa = newKeys.size() - shown;
            if (sisa > 0) {
                boolean info = "informasi".equals(path);
                NotificationHelper.show(ctx, "RT 08 Villa Indah",
                        "Ada " + sisa + " " + (info ? "pengumuman" : "agenda") + " baru lainnya.",
                        path + ".html", ("summary_" + path).hashCode());
            }
        } catch (Exception e) {
            Log.w(TAG, "Gagal cek pembaruan " + path, e);
        }
    }

    private static void notifyItem(Context ctx, String path, String key, JSONObject item) {
        String judul, body, page;
        if ("informasi".equals(path)) {
            judul = "📢 " + item.optString("judul", "Pengumuman baru");
            body = item.optString("isi", "");
            if (body.isEmpty()) body = item.optString("kategori", "Ada info baru dari pengurus RT.");
            page = "informasi.html";
        } else {
            judul = "📅 " + item.optString("judul", "Agenda baru");
            StringBuilder sb = new StringBuilder();
            String tgl = item.optString("tanggal", ""), waktu = item.optString("waktu", ""), lokasi = item.optString("lokasi", ""), ket = item.optString("keterangan", "");
            if (!tgl.isEmpty()) sb.append("Tanggal: ").append(tgl);
            if (!waktu.isEmpty()) sb.append("\nWaktu: ").append(waktu);
            if (!lokasi.isEmpty()) sb.append("\nTempat: ").append(lokasi);
            if (!ket.isEmpty()) sb.append("\n\n").append(ket);
            body = sb.length() == 0 ? "Ada agenda baru dari pengurus RT." : sb.toString();
            page = "agenda.html";
        }
        NotificationHelper.show(ctx, judul, body, page, key.hashCode());
    }

    private static JSONObject fetchJson(String urlString) throws Exception {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(urlString).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(20000);
            if (conn.getResponseCode() != 200) return null;
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = r.readLine()) != null) sb.append(line);
            }
            String body = sb.toString().trim();
            if (body.isEmpty() || "null".equals(body)) return new JSONObject();
            return new JSONObject(body);
        } finally {
            if (conn != null) conn.disconnect();
        }
    }
}
