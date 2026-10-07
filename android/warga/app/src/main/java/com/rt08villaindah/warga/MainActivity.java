package com.rt08villaindah.warga;

import android.Manifest;
import java.io.OutputStream;
import android.provider.MediaStore;
import android.os.Environment;
import android.content.ContentValues;
import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.os.PowerManager;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayDeque;
import java.util.concurrent.TimeUnit;

public class MainActivity extends AppCompatActivity {

    private ValueCallback<Uri[]> filePathCallback;
    /* Pemilih file/foto untuk <input type="file"> di situs (bukti transfer, foto laporan, dll). */
    private final ActivityResultLauncher<Intent> fileChooserLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                @Override public void onActivityResult(ActivityResult result) {
                    if (filePathCallback == null) return;
                    Uri[] hasil = WebChromeClient.FileChooserParams.parseResult(result.getResultCode(), result.getData());
                    filePathCallback.onReceiveValue(hasil);
                    filePathCallback = null;
                }
            });

    private WebView webView;
    private ProgressBar progressBar;
    private static final int REQ_NOTIF_PERMISSION = 101;
    private static final String WORK_NAME = "check_rt08_updates";

    // Domain resmi situs RT 08. Link ke domain lain (WA, telepon, dll) dibuka di aplikasi luar.
    private static final String ALLOWED_HOST = "vindahpulotimahatv-commits.github.io";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Bila dibuka dari notifikasi saat layar mati/terkunci: nyalakan layar & tampil di atas kunci layar
        if (getIntent() != null && getIntent().hasExtra("popup_judul")) {
            if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
            else getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }

        NotificationHelper.createChannel(this);
        askNotificationPermission();
        schedulePeriodicCheck();     // cadangan tiap 15 menit
        RealtimeService.start(this); // utama: real-time lewat koneksi streaming
        mintaIzinHemat_();

        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progress);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.addJavascriptInterface(new RTAndroidBridge(), "RTAndroid");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? android.view.View.GONE : android.view.View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) { filePathCallback.onReceiveValue(null); filePathCallback = null; }
                filePathCallback = callback;
                try {
                    fileChooserLauncher.launch(params.createIntent());
                } catch (Exception e) {
                    filePathCallback = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "Tidak bisa membuka pemilih foto.", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                String scheme = uri.getScheme();

                boolean isHttp = "http".equals(scheme) || "https".equals(scheme);

                if (isHttp && ALLOWED_HOST.equals(host)) {
                    // Tetap di dalam WebView untuk halaman situs RT 08 sendiri
                    return false;
                }

                // Link WhatsApp, telepon, email, maps, dan domain lain dibuka lewat aplikasi luar
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Tidak ada aplikasi untuk membuka tautan ini.", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    Toast.makeText(MainActivity.this, "Gagal memuat. Periksa koneksi internet Anda.", Toast.LENGTH_LONG).show();
                }
            }
        });

        webView.loadUrl(resolveStartUrl(getIntent()));
        tampilkanPopupDariIntent_(getIntent());
    }

    /* Jembatan JavaScript -> Android: dipanggil situs (humas.html, layanan.html) sebagai
       window.RTAndroid.sharePdf(base64, namaFile, nomorWA, pesan).
       Membuka chat WhatsApp ke nomor itu dengan PDF sudah TERLAMPIR & pesan terisi;
       pengguna tinggal menekan tombol Kirim. Mengembalikan false bila gagal (situs lalu
       memakai cara cadangan). */
    private class RTAndroidBridge {
        @JavascriptInterface
        public boolean sharePdf(String base64, String namaFile, String nomor, String pesan) {
            try {
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                if (data == null || data.length == 0) return false;
                String aman = (namaFile == null ? "dokumen.pdf" : namaFile).replaceAll("[^A-Za-z0-9._-]", "-");
                if (!aman.toLowerCase().endsWith(".pdf")) aman = aman + ".pdf";
                File dir = new File(getCacheDir(), "share");
                if (!dir.exists() && !dir.mkdirs()) return false;
                File[] lama = dir.listFiles();
                if (lama != null) for (File f : lama) f.delete();
                final File file = new File(dir, aman);
                FileOutputStream out = new FileOutputStream(file);
                try { out.write(data); } finally { out.close(); }

                final Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", file);
                final String digit = nomor == null ? "" : nomor.replaceAll("[^0-9]", "");
                final String teks = pesan == null ? "" : pesan;
                final String pkg = paketWhatsApp();
                if (pkg == null) return false;

                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        try {
                            Intent i = new Intent(Intent.ACTION_SEND);
                            i.setType("application/pdf");
                            i.putExtra(Intent.EXTRA_STREAM, uri);
                            i.putExtra(Intent.EXTRA_TEXT, teks);
                            i.setPackage(pkg);
                            if (digit.length() > 0) i.putExtra("jid", digit + "@s.whatsapp.net");
                            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            startActivity(i);
                        } catch (Exception e) {
                            Toast.makeText(MainActivity.this, "Gagal membuka WhatsApp.", Toast.LENGTH_SHORT).show();
                        }
                    }
                });
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        /* Cara BARU & pasti langsung: simpan PDF ke folder Download, lalu buka chat WhatsApp
           ke NOMOR pengurus (wa.me) dengan pesan terisi. Pengguna tinggal menekan 📎 → Dokumen
           → pilih PDF, lalu Kirim. (Trik "jid" pada sharePdf sering diabaikan WhatsApp
           sehingga malah muncul daftar kontak.) */
        @JavascriptInterface
        public boolean bukaChatDenganPdf(String base64, String namaFile, String nomor, String pesan) {
            try {
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                if (data == null || data.length == 0) return false;
                String aman = (namaFile == null ? "dokumen.pdf" : namaFile).replaceAll("[^A-Za-z0-9._-]", "-");
                if (!aman.toLowerCase().endsWith(".pdf")) aman = aman + ".pdf";
                boolean tersimpan = false;
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.Downloads.DISPLAY_NAME, aman);
                        cv.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
                        cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                        Uri tujuan = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                        if (tujuan != null) {
                            OutputStream os = getContentResolver().openOutputStream(tujuan);
                            try { os.write(data); } finally { os.close(); }
                            tersimpan = true;
                        }
                    }
                } catch (Exception ignore) { }
                if (!tersimpan) {
                    // Android 7–9 / gagal: simpan di folder aplikasi lalu bagikan lewat cara lama
                    return sharePdf(base64, namaFile, nomor, pesan);
                }
                final String digit = nomor == null ? "" : nomor.replaceAll("[^0-9]", "");
                final String teks = (pesan == null ? "" : pesan)
                        + "\n\n(PDF sudah tersimpan di folder Download — tekan 📎 lalu pilih Dokumen untuk melampirkannya.)";
                final String pkg = paketWhatsApp();
                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        try {
                            Uri u = Uri.parse("https://wa.me/" + digit + "?text=" + Uri.encode(teks));
                            Intent i = new Intent(Intent.ACTION_VIEW, u);
                            if (pkg != null) i.setPackage(pkg);
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(i);
                            Toast.makeText(MainActivity.this, "PDF tersimpan di Download. Lampirkan lewat 📎 di chat.", Toast.LENGTH_LONG).show();
                        } catch (Exception e) {
                            Toast.makeText(MainActivity.this, "Gagal membuka WhatsApp.", Toast.LENGTH_SHORT).show();
                        }
                    }
                });
                return true;
            } catch (Exception e) {
                return false;
            }
        }
    }

    private String paketWhatsApp() {
        String[] kandidat = { "com.whatsapp", "com.whatsapp.w4b" };
        for (String p : kandidat) {
            try { getPackageManager().getPackageInfo(p, 0); return p; } catch (PackageManager.NameNotFoundException ignore) {}
        }
        return null;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        webView.loadUrl(resolveStartUrl(intent));
        tampilkanPopupDariIntent_(intent);
    }


    /* =================== POPUP BESAR PEMBERITAHUAN =================== */
    private static MainActivity aktif = null;
    private final ArrayDeque<String[]> antrianPopup = new ArrayDeque<>();
    private Dialog popupAktif = null;

    @Override
    protected void onResume() {
        super.onResume();
        aktif = this;
        RealtimeService.start(this); // pastikan layanan real-time hidup
    }

    @Override
    protected void onPause() {
        if (aktif == this) aktif = null;
        super.onPause();
    }

    /** Dipanggil NotificationHelper: true bila aplikasi sedang terbuka (popup tampil di layar). */
    static boolean tampilkanPopupJikaAktif(final String judul, final String isi, final String page) {
        final MainActivity a = aktif;
        if (a == null || a.isFinishing()) return false;
        a.runOnUiThread(new Runnable() { @Override public void run() { a.tampilPopupBesar(judul, isi, page); } });
        return true;
    }

    private void tampilkanPopupDariIntent_(Intent intent) {
        if (intent == null || !intent.hasExtra("popup_judul")) return;
        String j = intent.getStringExtra("popup_judul"), i = intent.getStringExtra("popup_isi");
        intent.removeExtra("popup_judul"); intent.removeExtra("popup_isi");
        tampilPopupBesar(j, i, null);
    }

    private int dp_(int v) { return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()); }

    private void tampilPopupBesar(String judul, String isi, String page) {
        antrianPopup.add(new String[]{ judul == null ? "" : judul, isi == null ? "" : isi, page });
        if (popupAktif == null) tampilPopupBerikut_();
    }

    private void tampilPopupBerikut_() {
        final String[] p = antrianPopup.poll();
        if (p == null || isFinishing()) { popupAktif = null; return; }

        try {
            Ringtone r = RingtoneManager.getRingtone(this, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION));
            if (r != null) r.play();
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null) v.vibrate(new long[]{0, 350, 150, 350, 150, 500}, -1);
        } catch (Exception ignore) {}

        final Dialog d = new Dialog(this);
        d.requestWindowFeature(Window.FEATURE_NO_TITLE);
        d.setCancelable(false);

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp_(22), dp_(26), dp_(22), dp_(20));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.WHITE); bg.setCornerRadius(dp_(28)); bg.setStroke(dp_(3), 0xFFD5A62B);
        card.setBackground(bg);

        TextView ikon = new TextView(this);
        ikon.setText("🔔"); ikon.setTextSize(TypedValue.COMPLEX_UNIT_SP, 56); ikon.setGravity(Gravity.CENTER);
        card.addView(ikon, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView tj = new TextView(this);
        tj.setText(p[0]); tj.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24); tj.setTextColor(0xFF12213F);
        tj.setTypeface(null, android.graphics.Typeface.BOLD); tj.setGravity(Gravity.CENTER);
        tj.setPadding(0, dp_(8), 0, dp_(10));
        card.addView(tj);

        if (!p[1].isEmpty()) {
            ScrollView sv = new ScrollView(this);
            TextView ti = new TextView(this);
            String isi = p[1].length() > 1500 ? p[1].substring(0, 1500) + "…" : p[1];
            ti.setText(isi); ti.setTextSize(TypedValue.COMPLEX_UNIT_SP, 19); ti.setTextColor(0xFF33405C);
            ti.setLineSpacing(0, 1.2f); ti.setGravity(Gravity.CENTER_HORIZONTAL);
            sv.addView(ti);
            if (isi.length() > 450) card.addView(sv, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)); // teks panjang: area gulir
            else card.addView(sv, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        }

        if (p[2] != null) {
            Button buka = new Button(this);
            buka.setText("BUKA SEKARANG"); buka.setTextSize(TypedValue.COMPLEX_UNIT_SP, 19); buka.setTextColor(0xFF231E11);
            buka.setTypeface(null, android.graphics.Typeface.BOLD); buka.setAllCaps(false);
            GradientDrawable gb = new GradientDrawable(); gb.setColor(0xFFD5A62B); gb.setCornerRadius(dp_(18)); buka.setBackground(gb);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp_(60));
            lp.topMargin = dp_(18);
            card.addView(buka, lp);
            buka.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    d.dismiss();
                    webView.loadUrl("https://vindahpulotimahatv-commits.github.io/rt08-villa-indah/" + p[2]);
                }
            });
        }

        Button tutup = new Button(this);
        tutup.setText(p[2] != null ? "TUTUP" : "OK, MENGERTI"); tutup.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        tutup.setTextColor(p[2] != null ? 0xFF59657F : 0xFF231E11); tutup.setAllCaps(false);
        tutup.setTypeface(null, android.graphics.Typeface.BOLD);
        GradientDrawable gt = new GradientDrawable(); gt.setColor(p[2] != null ? 0xFFEEF1F9 : 0xFFD5A62B); gt.setCornerRadius(dp_(18)); tutup.setBackground(gt);
        LinearLayout.LayoutParams lp2 = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp_(p[2] != null ? 52 : 60));
        lp2.topMargin = dp_(p[2] != null ? 10 : 18);
        card.addView(tutup, lp2);
        tutup.setOnClickListener(new View.OnClickListener() { @Override public void onClick(View v) { d.dismiss(); } });

        if (!antrianPopup.isEmpty()) {
            TextView sisa = new TextView(this);
            sisa.setText("Masih ada " + antrianPopup.size() + " pemberitahuan lagi"); sisa.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            sisa.setTextColor(0xFF8A6A10); sisa.setGravity(Gravity.CENTER); sisa.setPadding(0, dp_(10), 0, 0);
            card.addView(sisa);
        }

        d.setContentView(card);
        d.setOnDismissListener(new android.content.DialogInterface.OnDismissListener() {
            @Override public void onDismiss(android.content.DialogInterface di) { popupAktif = null; tampilPopupBerikut_(); }
        });
        popupAktif = d;
        d.show();
        Window w = d.getWindow();
        if (w != null) {
            w.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.TRANSPARENT));
            int lebar = (int) (getResources().getDisplayMetrics().widthPixels * 0.94f);
            int tinggi = (int) (getResources().getDisplayMetrics().heightPixels * 0.80f);
            boolean panjang = p[1].length() > 450;
            w.setLayout(lebar, panjang ? tinggi : WindowManager.LayoutParams.WRAP_CONTENT);
            w.setDimAmount(0.75f);
        }
    }

    /* Minta sekali: izinkan aplikasi berjalan tanpa dihemat baterai agar pemberitahuan tetap seketika saat layar mati. */
    private void mintaIzinHemat_() {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
            SharedPreferences sp = getSharedPreferences("rt08_ui", MODE_PRIVATE);
            if (sp.getBoolean("hemat_ditanya", false)) return;
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                sp.edit().putBoolean("hemat_ditanya", true).apply();
                Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName()));
                startActivity(i);
            }
        } catch (Exception ignore) {}
    }

    private String resolveStartUrl(Intent intent) {
        String base = "https://vindahpulotimahatv-commits.github.io/rt08-villa-indah/";
        String targetPage = (intent != null) ? intent.getStringExtra("target_page") : null;
        if (targetPage != null) return base + targetPage;
        return getString(R.string.start_url);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }

    private void askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF_PERMISSION);
            }
        }
    }

    private void schedulePeriodicCheck() {
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(
                CheckUpdateWorker.class, 15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build();

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
                WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request);
    }
}
