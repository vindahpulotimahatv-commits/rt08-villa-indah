package com.rt08villaindah.warga;

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

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Layanan latar depan yang menjaga koneksi streaming (Server-Sent Events) ke Firebase Realtime
 * Database, sehingga pengumuman / agenda baru dari admin & pengurus muncul DETIK ITU JUGA
 * (bukan menunggu pengecekan 15 menit). Tidak butuh Firebase SDK / Cloud Function / paket Blaze.
 */
public class RealtimeService extends Service {

    private static final String TAG = "RealtimeService";
    private static final int NOTIF_ID = 8001;
    private static final String[] PATHS = { "informasi", "agenda" };

    private volatile boolean running = false;
    private Thread[] threads;
    private final HttpURLConnection[] conns = new HttpURLConnection[PATHS.length];

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
                .setContentTitle("PANDU RT 08 aktif")
                .setContentText("Siap menerima pengumuman & agenda secara langsung")
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
            threads = new Thread[PATHS.length];
            for (int i = 0; i < PATHS.length; i++) {
                final int idx = i;
                threads[i] = new Thread(new Runnable() {
                    @Override public void run() { loop(idx); }
                }, "rt08-stream-" + PATHS[i]);
                threads[i].setDaemon(true);
                threads[i].start();
            }
        }
        return START_STICKY;
    }

    private void loop(int idx) {
        String path = PATHS[idx];
        long backoff = 3000;
        while (running) {
            try {
                stream(idx, path);
                backoff = 3000;
            } catch (Exception e) {
                if (!running) break;
                Log.w(TAG, "Stream " + path + " putus: " + e.getMessage());
            }
            if (!running) break;
            try { Thread.sleep(backoff); } catch (InterruptedException ie) { break; }
            backoff = Math.min(backoff * 2, 30000);
        }
    }

    private void stream(int idx, String path) throws Exception {
        String url = UpdateChecker.DB_URL + "/" + path + ".json?orderBy=%22%24key%22&limitToLast=10";
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conns[idx] = conn;
        try {
            conn.setRequestProperty("Accept", "text/event-stream");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(120000); // Firebase kirim keep-alive tiap ~30 dtk
            if (conn.getResponseCode() != 200) throw new Exception("HTTP " + conn.getResponseCode());
            try (BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String event = "", line;
                while (running && (line = r.readLine()) != null) {
                    if (line.startsWith("event:")) {
                        event = line.substring(6).trim();
                    } else if (line.startsWith("data:")) {
                        if ("put".equals(event) || "patch".equals(event)) {
                            UpdateChecker.check(getApplicationContext(), path);
                        } else if ("cancel".equals(event) || "auth_revoked".equals(event)) {
                            return; // sambung ulang
                        }
                    }
                }
            }
        } finally {
            conn.disconnect();
            conns[idx] = null;
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
