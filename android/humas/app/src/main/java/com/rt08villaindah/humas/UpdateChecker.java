package com.rt08villaindah.humas;

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
import java.util.Calendar;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;

/**
 * Logika "ada data baru?" untuk peran humas. Dipakai bersama oleh RealtimeService (real-time)
 * dan CheckUpdateWorker (cadangan tiap 15 menit). Disinkronkan agar tidak ada notifikasi ganda.
 */
final class UpdateChecker {
    private static final String TAG = "UpdateChecker";
    static final String DB_URL = "https://rt08-villa-indah-default-rtdb.asia-southeast1.firebasedatabase.app";
    static final String ROLE = "humas";
    private static final String PREFS = "rt08_humas_update_prefs";
    private static final String HALAMAN = "humas.html";

    private UpdateChecker() {}

    /* ---------------- cadangan (WorkManager) ---------------- */
    static void checkAll(Context ctx) {
        checkPenarikan(ctx);
        checkKeys(ctx, "informasi", false);
        checkKeys(ctx, "agenda", false);
    }

    /* ---------------- data berupa kumpulan item baru (laporan, setoran, info, agenda) ---------------- */
    static synchronized void checkKeys(Context ctx, String path, boolean auth) {
        try {
            String q = "?shallow=true";
            if (auth) { String t = FirebaseSession.idToken(ctx); if (t == null) return; q += "&auth=" + t; }
            JSONObject keysObj = fetchJson(DB_URL + "/" + path + ".json" + q);
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
            if (firstRun) return;

            Collections.sort(newKeys);
            int shown = 0;
            for (String key : newKeys) {
                if (shown >= 5) break;
                JSONObject item = fetchJson(DB_URL + "/" + path + "/" + key + ".json" + (auth ? "?auth=" + FirebaseSession.idToken(ctx) : ""));
                if (item == null || item.length() == 0) continue;
                notifyItem(ctx, path, key, item);
                shown++;
            }
            int sisa = newKeys.size() - shown;
            if (sisa > 0) NotificationHelper.show(ctx, "RT 08 Villa Indah", "Ada " + sisa + " " + label(path) + " baru lainnya.", HALAMAN, ("summary_" + path).hashCode());
        } catch (Exception e) {
            Log.w(TAG, "Gagal cek " + path, e);
        }
    }

    private static String label(String path) {
        switch (path) {
            case "laporan": return "laporan warga";
            case "humasSetoran": return "setoran Humas";
            case "informasi": return "pengumuman";
            case "agenda": return "agenda";
            default: return "data";
        }
    }

    private static void notifyItem(Context ctx, String path, String key, JSONObject item) {
        String judul, body;
        switch (path) {
            case "laporan":
                judul = "🚨 Laporan warga: " + item.optString("kategori", "Baru");
                body = item.optString("nama", "Warga") + " (" + item.optString("blok", "-") + ")\n" + item.optString("keterangan", "");
                break;
            case "humasSetoran":
                judul = "💵 Setoran Humas baru";
                body = "Petugas " + item.optString("petugas", "-") + " mengajukan setoran iuran " + rp((long) item.optDouble("jumlah", 0)) + ".\nBulan: " + item.optString("bulanKey", "-") + "\n\nBuka aplikasi untuk menerima setoran.";
                break;
            case "agenda": {
                judul = "📅 " + item.optString("judul", "Agenda baru");
                StringBuilder sb = new StringBuilder();
                String tgl = item.optString("tanggal", ""), waktu = item.optString("waktu", ""), lokasi = item.optString("lokasi", ""), ket = item.optString("keterangan", "");
                if (!tgl.isEmpty()) sb.append("Tanggal: ").append(tgl);
                if (!waktu.isEmpty()) sb.append("\nWaktu: ").append(waktu);
                if (!lokasi.isEmpty()) sb.append("\nTempat: ").append(lokasi);
                if (!ket.isEmpty()) sb.append("\n\n").append(ket);
                body = sb.length() == 0 ? "Ada agenda baru dari pengurus RT." : sb.toString();
                break;
            }
            default: {
                judul = "📢 " + item.optString("judul", "Pengumuman baru");
                body = item.optString("isi", "");
                if (body.isEmpty()) body = item.optString("kategori", "Ada info baru dari pengurus RT.");
            }
        }
        NotificationHelper.show(ctx, judul, body, HALAMAN, key.hashCode());
    }

    /* ---------------- iuran (penarikan): transfer menunggu / transfer lunas ---------------- */
    static String bulanWIB(int geser) {
        Calendar c = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"));
        c.set(Calendar.DAY_OF_MONTH, 1);
        c.add(Calendar.MONTH, geser);
        return String.format(Locale.US, "%04d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1);
    }

    static synchronized void checkPenarikan(Context ctx) {
        try {
            String t = FirebaseSession.idToken(ctx);
            if (t == null) return;
            // key grup -> [judul, isi, jumlahBulan]
            Map<String, String[]> sekarang = new LinkedHashMap<>();
            Map<String, Integer> jmlBulan = new LinkedHashMap<>();
            for (int g = -1; g <= 1; g++) {
                String bk = bulanWIB(g);
                JSONObject bln = fetchJson(DB_URL + "/penarikan/" + bk + ".json?auth=" + t);
                if (bln == null) continue;
                Iterator<String> it = bln.keys();
                while (it.hasNext()) {
                    String rk = it.next();
                    JSONObject e = bln.optJSONObject(rk);
                    if (e == null || e.optInt("paketKe", 1) > 1) continue;
                    String status = e.optString("status", "");
                    boolean langsung = e.optBoolean("langsungBendahara", false);
                    if (!"lunas_transfer".equals(status)) continue;
                    long ts = (long) e.optDouble("confirmedAt", e.optDouble("updatedAt", e.optDouble("createdAt", 0)));
                    String grup = rk + "|" + status + "|" + ts;
                    long uang = (long) e.optDouble("paketTotal", e.optDouble("uangMasuk", e.optDouble("jumlah", 0)));
                    String periode = e.optString("periodeLabel", bk);
                    String rumah = e.optString("rumah", rk) + " — " + e.optString("nama", "-");
                    if (sekarang.containsKey(grup)) { jmlBulan.put(grup, jmlBulan.get(grup) + 1); continue; }
                    jmlBulan.put(grup, 1);
                    sekarang.put(grup, new String[]{ judulPenarikan(status, langsung), rumah + "\n" + rp(uang) + "\n" + periode + (langsung ? "\nTransfer langsung ke rekening Bendahara" : "") + "" });
                }
            }
            SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String before = prefs.getString("pen_seen", null);
            boolean firstRun = (before == null);
            Set<String> prev = new HashSet<>();
            if (before != null && !before.isEmpty()) prev.addAll(Arrays.asList(before.split("\n")));
            StringBuilder cur = new StringBuilder();
            int shown = 0;
            for (Map.Entry<String, String[]> en : sekarang.entrySet()) {
                if (cur.length() > 0) cur.append("\n");
                cur.append(en.getKey());
                if (!firstRun && !prev.contains(en.getKey()) && shown < 5) {
                    int n = jmlBulan.get(en.getKey());
                    NotificationHelper.show(ctx, en.getValue()[0], en.getValue()[1] + (n > 1 ? "\n(" + n + " bulan)" : ""), HALAMAN, en.getKey().hashCode());
                    shown++;
                }
            }
            prefs.edit().putString("pen_seen", cur.toString()).apply();
        } catch (Exception e) {
            Log.w(TAG, "Gagal cek penarikan", e);
        }
    }

    private static String judulPenarikan(String status, boolean langsung) {
        if ("transfer_pending".equals(status)) return "📤 Transfer masuk dari Humas";
        if (langsung) return "💳 Warga transfer langsung ke Bendahara";
        return "✅ Transfer warga sudah dikonfirmasi";
    }

    /* ---------------- live chat warga -> admin ---------------- */
    /** Bandingkan jumlah pesan belum dibaca admin (unreadAdmin) dengan yang terakhir diketahui. */
    static synchronized void checkChatVid(Context ctx, String vid) {
        try {
            if (!ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).contains("chat_seen")) { checkChatSemua(ctx, null); return; }
            JSONObject info = fetchJson(DB_URL + "/obrolan/" + vid + "/info.json");
            if (info == null) return;
            prosesChat(ctx, vid, info, false);
        } catch (Exception e) {
            Log.w(TAG, "Gagal cek chat " + vid, e);
        }
    }

    static synchronized void checkChatSemua(Context ctx, JSONObject semua) {
        try {
            if (semua == null) semua = fetchJson(DB_URL + "/obrolan.json");
            if (semua == null) return;
            SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            boolean firstRun = !prefs.contains("chat_seen");
            Iterator<String> it = semua.keys();
            JSONObject seen = firstRun ? new JSONObject() : new JSONObject(prefs.getString("chat_seen", "{}"));
            while (it.hasNext()) {
                String vid = it.next();
                JSONObject v = semua.optJSONObject(vid);
                JSONObject info = v == null ? null : v.optJSONObject("info");
                if (info == null) continue;
                if (firstRun) { seen.put(vid, info.optInt("unreadAdmin", 0)); continue; }
                prosesChat(ctx, vid, info, false);
            }
            if (firstRun) prefs.edit().putString("chat_seen", seen.toString()).apply();
        } catch (Exception e) {
            Log.w(TAG, "Gagal cek semua chat", e);
        }
    }

    private static void prosesChat(Context ctx, String vid, JSONObject info, boolean unused) throws Exception {
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean firstRun = !prefs.contains("chat_seen");
        JSONObject seen = firstRun ? new JSONObject() : new JSONObject(prefs.getString("chat_seen", "{}"));
        int unread = info.optInt("unreadAdmin", 0);
        int lama = seen.optInt(vid, 0);
        seen.put(vid, unread);
        prefs.edit().putString("chat_seen", seen.toString()).apply();
        if (firstRun || unread <= lama || unread <= 0) return;

        String teks = info.optString("lastMsg", "");
        try { // ambil pesan warga terakhir (lastMsg bisa tertimpa balasan AI)
            JSONObject pesan = fetchJson(DB_URL + "/obrolan/" + vid + "/pesan.json?orderBy=%22%24key%22&limitToLast=6");
            if (pesan != null) {
                List<String> ks = new ArrayList<>();
                Iterator<String> it = pesan.keys();
                while (it.hasNext()) ks.add(it.next());
                Collections.sort(ks);
                for (int i = ks.size() - 1; i >= 0; i--) {
                    JSONObject m = pesan.optJSONObject(ks.get(i));
                    if (m != null && "warga".equals(m.optString("sender", ""))) { teks = m.optString("teks", teks); break; }
                }
            }
        } catch (Exception ignore) {}
        String nama = info.optString("nama", "Warga"), rumah = info.optString("rumah", "");
        String judul = "💬 Live chat: " + nama + (rumah.isEmpty() ? "" : " (" + rumah + ")");
        String body = teks + (unread > 1 ? "\n\n" + unread + " pesan belum dibalas" : "");
        NotificationHelper.show(ctx, judul, body, HALAMAN, ("chat_" + vid).hashCode());
    }

    static String rp(long n) {
        return "Rp " + String.format(Locale.forLanguageTag("id-ID"), "%,d", n);
    }

    static JSONObject fetchJson(String urlString) throws Exception {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(urlString).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(25000);
            int code = conn.getResponseCode();
            if (code != 200) { Log.w(TAG, "HTTP " + code + " untuk " + urlString.replaceAll("auth=[^&]+", "auth=***")); return null; }
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line; while ((line = r.readLine()) != null) sb.append(line);
            }
            String body = sb.toString().trim();
            if (body.isEmpty() || "null".equals(body)) return new JSONObject();
            return new JSONObject(body);
        } finally {
            if (conn != null) conn.disconnect();
        }
    }
}
