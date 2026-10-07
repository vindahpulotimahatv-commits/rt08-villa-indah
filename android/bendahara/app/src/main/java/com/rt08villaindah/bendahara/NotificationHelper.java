package com.rt08villaindah.bendahara;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class NotificationHelper {

    /** ID baru (v2): channel Android tidak bisa diubah setelah dibuat, jadi dibuat ulang agar bunyi/getar/prioritas MAX berlaku. */
    public static final String CHANNEL_ID = "rt08_updates_v2";
    public static final String CHANNEL_SERVICE = "rt08_realtime";

    public static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager == null) return;

            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Pengumuman & Agenda RT 08", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("Pemberitahuan langsung (real-time) dari admin & pengurus RT 08.");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 400, 200, 400, 200, 600});
            channel.enableLights(true);
            channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            channel.setSound(sound, new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            manager.createNotificationChannel(channel);

            NotificationChannel svc = new NotificationChannel(CHANNEL_SERVICE, "Penerima pemberitahuan", NotificationManager.IMPORTANCE_MIN);
            svc.setDescription("Menjaga koneksi agar pengumuman masuk seketika.");
            svc.setShowBadge(false);
            manager.createNotificationChannel(svc);
        }
    }

    public static void show(Context context, String title, String body, String targetPage, int notifId) {
        // Aplikasi sedang dibuka -> tampilkan POPUP BESAR langsung di layar.
        if (MainActivity.tampilkanPopupJikaAktif(title, body, targetPage)) return;

        // Aplikasi di latar belakang / layar mati -> notifikasi heads-up besar + membangunkan layar.
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        if (targetPage != null) intent.putExtra("target_page", targetPage);
        intent.putExtra("popup_judul", title);
        intent.putExtra("popup_isi", body);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pendingIntent = PendingIntent.getActivity(context, notifId, intent, flags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body).setBigContentTitle(title))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setColor(0xFF123A6B)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setFullScreenIntent(pendingIntent, true);

        try {
            NotificationManagerCompat.from(context).notify(notifId, builder.build());
        } catch (SecurityException ignore) { /* izin notifikasi belum diberikan */ }
    }
}
