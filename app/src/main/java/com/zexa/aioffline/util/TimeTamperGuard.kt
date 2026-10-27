package com.zexa.aioffline.util

import android.content.Context
import android.content.SharedPreferences

object TimeTamperGuard {
    private const val PREF_NAME = "time_guard_prefs"
    private const val KEY_LAST_KNOWN_TIME = "last_known_time"
    private const val TWENTY_FOUR_HOURS_MS = 86400000L

    /**
     * Checks if the device time has been tampered with.
     * @return true if tampering is detected, false otherwise.
     */
    fun checkTimeTampering(context: Context): Boolean {
        val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val currentTime = System.currentTimeMillis()
        val lastKnownTime = prefs.getLong(KEY_LAST_KNOWN_TIME, 0L)

        // If it's the first time running, initialize and return false
        if (lastKnownTime == 0L) {
            prefs.edit().putLong(KEY_LAST_KNOWN_TIME, currentTime).apply()
            return false
        }

        // Check for backwards tampering
        if (currentTime < lastKnownTime) {
            return true
        }

        // Check for forwards tampering (more than 24 hours jump)
        if (currentTime > lastKnownTime + TWENTY_FOUR_HOURS_MS) {
            return true
        }

        // Normal: update last known time
        prefs.edit().putLong(KEY_LAST_KNOWN_TIME, currentTime).apply()
        return false
    }
}
