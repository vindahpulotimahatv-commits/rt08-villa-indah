package com.rt08villaindah.warga;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/**
 * Pengecekan CADANGAN tiap 15 menit (WorkManager). Pemberitahuan utama sekarang real-time
 * lewat RealtimeService; worker ini hanya jaring pengaman bila service sempat dimatikan sistem.
 */
public class CheckUpdateWorker extends Worker {

    public CheckUpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        UpdateChecker.check(getApplicationContext(), "informasi");
        UpdateChecker.check(getApplicationContext(), "agenda");
        return Result.success();
    }
}
