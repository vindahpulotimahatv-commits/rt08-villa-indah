package com.rt08villaindah.admin;

import android.Manifest;
import android.content.ClipData;
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
    private static final String WORK_NAME = "check_rt08_admin_updates";

    // Domain resmi situs RT 08. Link ke domain lain (WA, telepon, dll) dibuka di aplikasi luar.
    private static final String ALLOWED_HOST = "vindahpulotimahatv-commits.github.io";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        NotificationHelper.createChannel(this);
        askNotificationPermission();
        schedulePeriodicCheck();

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

        /* Bagikan file APA SAJA (Excel, PDF, dll). langsungWA=true -> buka WhatsApp dengan file terlampir
           (nomor kosong = pilih kontak/grup sendiri); langsungWA=false -> menu Bagikan (bisa Simpan ke Drive/File, WhatsApp, dll). */
        @JavascriptInterface
        public boolean shareFile(String base64, String namaFile, String mime, String nomor, String pesan, boolean langsungWA) {
            try {
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                if (data == null || data.length == 0) return false;
                String aman = (namaFile == null ? "berkas" : namaFile).replaceAll("[^A-Za-z0-9._-]", "-");
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
                final String tipe = (mime == null || mime.length() == 0) ? "application/octet-stream" : mime;
                final String pkg = langsungWA ? paketWhatsApp() : null;

                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        try {
                            Intent i = new Intent(Intent.ACTION_SEND);
                            i.setType(tipe);
                            i.putExtra(Intent.EXTRA_STREAM, uri);
                            i.putExtra(Intent.EXTRA_TEXT, teks);
                            i.setClipData(ClipData.newRawUri("", uri));
                            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            if (pkg != null) {
                                i.setPackage(pkg);
                                if (digit.length() > 0) i.putExtra("jid", digit + "@s.whatsapp.net");
                                startActivity(i);
                            } else {
                                Intent pilih = Intent.createChooser(i, "Bagikan / simpan file");
                                pilih.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                startActivity(pilih);
                            }
                        } catch (Exception e) {
                            Toast.makeText(MainActivity.this, "Gagal membuka menu bagikan.", Toast.LENGTH_SHORT).show();
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
