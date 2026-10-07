package com.rt08villaindah.admin;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Layanan latar depan: menjaga koneksi streaming (Server-Sent Events) ke Firebase Realtime Database
 * sehingga kejadian penting untuk peran PENGURUS muncul DETIK ITU JUGA. Data yang dilindungi dibaca
 * memakai token login yang diserahkan halaman web (FirebaseSession).
 */
public class RealtimeService extends Service {

    private static final String TAG = "RealtimeService";
    private static final int NOTIF_ID = 8001;
    /** {jenis, path, perluLogin}  jenis: KEYS = item baru, PEN = iuran bulan berjalan, CHAT = live chat */
    private static final String[][] STREAMS = { {"CHAT", "obrolan", "0"}, {"KEYS", "laporan", "1"}, {"KEYS", "humasSetoran", "1"} };

    private volatile boolean running = false;
    private Thread[] threads;
    private final HttpURLConnection[] conns = new HttpURLConnection[STREAMS.length];

    public static void start(Context ctx) {
        try {
            Intent i = new Intent(ctx, RealtimeService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(i);
            else ctx.startService(i);
        } catch (RuntimeException e) {
            Log.w(TAG, "Tidak bisa memulai layanan real-time", e);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        NotificationHelper.createChannel(this);

        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int pf = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? PendingIntent.FLAG_IMMUTABLE : 0);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open, pf);
        Notification n = new NotificationCompat.Builder(this, NotificationHelper.CHANNEL_SERVICE)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("PENGURUS RT 08 aktif")
                .setContentText("Siap menerima live chat, laporan & setoran secara langsung")
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setOngoing(true)
                .setShowWhen(false)
                .setContentIntent(pi)
                .build();
        try {
            if (Build.VERSION.SDK_INT >= 34) startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            else startForeground(NOTIF_ID, n);
        } catch (RuntimeException e) {
            Log.w(TAG, "startForeground gagal", e);
            stopSelf();
            return START_NOT_STICKY;
        }

        if (!running) {
            running = true;
            threads = new Thread[STREAMS.length];
            for (int i = 0; i < STREAMS.length; i++) {
                final int idx = i;
                threads[i] = new Thread(new Runnable() { @Override public void run() { loop(idx); } }, "rt08-stream-" + STREAMS[i][1]);
                threads[i].setDaemon(true);
                threads[i].start();
            }
        }
        return START_STICKY;
    }

    private void loop(int idx) {
        long backoff = 3000;
        while (running) {
            try {
                boolean tersambung = stream(idx);
                backoff = tersambung ? 3000 : 6000; // belum login: coba lagi tiap 6 dtk
            } catch (Exception e) {
                if (!running) break;
                Log.w(TAG, "Stream " + STREAMS[idx][1] + " putus: " + e.getMessage());
            }
            if (!running) break;
            try { Thread.sleep(backoff); } catch (InterruptedException ie) { break; }
            backoff = Math.min(backoff * 2, 30000);
        }
    }

    /** @return false bila tidak bisa tersambung karena belum ada sesi login */
    private boolean stream(int idx) throws Exception {
        final String jenis = STREAMS[idx][0], path = STREAMS[idx][1];
        final boolean auth = "1".equals(STREAMS[idx][2]);
        String token = null;
        if (auth) { token = FirebaseSession.idToken(getApplicationContext()); if (token == null) return false; }

        String full = "PEN".equals(jenis) ? "penarikan/" + UpdateChecker.bulanWIB(0) : path;
        final String bulanAwal = UpdateChecker.bulanWIB(0);
        StringBuilder q = new StringBuilder();
        if ("KEYS".equals(jenis)) q.append("orderBy=%22%24key%22&limitToLast=10");
        if (auth) { if (q.length() > 0) q.append("&"); q.append("auth=").append(token); }
        String url = UpdateChecker.DB_URL + "/" + full + ".json" + (q.length() > 0 ? "?" + q : "");

        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conns[idx] = conn;
        long mulai = System.currentTimeMillis();
        try {
            conn.setRequestProperty("Accept", "text/event-stream");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(120000); // Firebase kirim keep-alive tiap ~30 dtk
            if (conn.getResponseCode() != 200) throw new Exception("HTTP " + conn.getResponseCode());
            try (BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String event = "", line;
                while (running && (line = r.readLine()) != null) {
                    // sambung ulang bila token hampir habis atau bulan berganti
                    if (auth && System.currentTimeMillis() - mulai > 50 * 60 * 1000L) return true;
                    if ("PEN".equals(jenis) && !bulanAwal.equals(UpdateChecker.bulanWIB(0))) return true;

                    if (line.startsWith("event:")) {
                        event = line.substring(6).trim();
                    } else if (line.startsWith("data:")) {
                        if ("cancel".equals(event) || "auth_revoked".equals(event)) return true;
                        if (!"put".equals(event) && !"patch".equals(event)) continue;
                        tangani(jenis, path, auth, line.substring(5).trim());
                    }
                }
            }
        } finally {
            conn.disconnect();
            conns[idx] = null;
        }
        return true;
    }

    private void tangani(String jenis, String path, boolean auth, String data) {
        Context c = getApplicationContext();
        if ("KEYS".equals(jenis)) {
            UpdateChecker.checkKeys(c, path, auth);
        } else if ("PEN".equals(jenis)) {
            UpdateChecker.checkPenarikan(c);
        } else if ("CHAT".equals(jenis)) {
            try {
                JSONObject d = new JSONObject(data);
                String p = d.optString("path", "/");
                if ("/".equals(p)) {
                    UpdateChecker.checkChatSemua(c, d.optJSONObject("data"));
                } else if (p.endsWith("/unreadAdmin") || p.endsWith("/info")) {
                    String[] bagian = p.split("/");
                    if (bagian.length > 1) UpdateChecker.checkChatVid(c, bagian[1]);
                }
            } catch (Exception e) {
                Log.w(TAG, "Event chat tidak terbaca", e);
            }
        }
    }

    @Override
    public void onDestroy() {
        running = false;
        for (HttpURLConnection c : conns) { try { if (c != null) c.disconnect(); } catch (Exception ignore) {} }
        if (threads != null) for (Thread t : threads) { if (t != null) t.interrupt(); }
        super.onDestroy();
    }

    @Nullable @Override
    public IBinder onBind(Intent intent) { return null; }
}
