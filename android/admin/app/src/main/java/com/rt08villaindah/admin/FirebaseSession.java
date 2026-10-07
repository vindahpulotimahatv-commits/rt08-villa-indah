package com.rt08villaindah.admin;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Menyimpan sesi login Firebase yang diserahkan halaman web (lewat RTAndroid.simpanSesi) dan
 * menukarnya menjadi ID token (Firebase Auth REST) agar layanan latar belakang boleh membaca data
 * yang dilindungi (laporan, setoran, penarikan) dengan aturan keamanan yang SAMA seperti di web.
 * Tidak ada password yang disimpan - hanya refresh token, di penyimpanan privat aplikasi.
 */
final class FirebaseSession {
    private static final String TAG = "FirebaseSession";
    private static final String PREFS = "rt08_session";
    private static String cachedToken = null;
    private static long cachedExpMs = 0;

    private FirebaseSession() {}

    static synchronized void simpan(Context c, String refreshToken, String apiKey, String email) {
        if (refreshToken == null || refreshToken.isEmpty() || apiKey == null || apiKey.isEmpty()) return;
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString("refresh", refreshToken).putString("apiKey", apiKey).putString("email", email == null ? "" : email).apply();
        cachedToken = null;
    }

    static synchronized void hapus(Context c) {
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply();
        cachedToken = null;
    }

    static boolean adaSesi(Context c) {
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return !sp.getString("refresh", "").isEmpty();
    }

    /** ID token yang masih berlaku, atau null bila belum login / gagal. */
    static synchronized String idToken(Context c) {
        long now = System.currentTimeMillis();
        if (cachedToken != null && now < cachedExpMs - 120000) return cachedToken;
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String refresh = sp.getString("refresh", ""), key = sp.getString("apiKey", "");
        if (refresh.isEmpty() || key.isEmpty()) return null;
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL("https://securetoken.googleapis.com/v1/token?key=" + URLEncoder.encode(key, "UTF-8")).openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(20000);
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            byte[] body = ("grant_type=refresh_token&refresh_token=" + URLEncoder.encode(refresh, "UTF-8")).getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = conn.getOutputStream()) { os.write(body); }
            if (conn.getResponseCode() != 200) { Log.w(TAG, "Refresh token ditolak: HTTP " + conn.getResponseCode()); return null; }
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line; while ((line = r.readLine()) != null) sb.append(line);
            }
            JSONObject j = new JSONObject(sb.toString());
            cachedToken = j.optString("id_token", null);
            long detik = Long.parseLong(j.optString("expires_in", "3600"));
            cachedExpMs = now + detik * 1000L;
            String baru = j.optString("refresh_token", "");
            if (!baru.isEmpty() && !baru.equals(refresh)) sp.edit().putString("refresh", baru).apply();
            return cachedToken;
        } catch (Exception e) {
            Log.w(TAG, "Gagal menukar token", e);
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }
}
