package com.rt08villaindah.bendahara;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/** Pengecekan CADANGAN tiap 15 menit. Pemberitahuan utama real-time lewat RealtimeService. */
public class CheckUpdateWorker extends Worker {
    public CheckUpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        UpdateChecker.checkAll(getApplicationContext());
        return Result.success();
    }
}
