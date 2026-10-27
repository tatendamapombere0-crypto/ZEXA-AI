package com.zexa.aioffline.util

import android.app.ActivityManager
import android.content.Context

object DeviceUtils {
    fun getTotalRAM(context: Context): Long {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)
        return memoryInfo.totalMem // In bytes
    }

    fun isHighRamDevice(context: Context): Boolean {
        val totalRam = getTotalRAM(context)
        val threeGb = 3L * 1024 * 1024 * 1024
        return totalRam >= threeGb
    }
}
