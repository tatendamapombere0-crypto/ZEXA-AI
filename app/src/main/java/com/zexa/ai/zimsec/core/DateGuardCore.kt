package com.zexa.ai.zimsec.core

import android.content.Context
import android.os.SystemClock
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import kotlin.math.abs

object DateGuardCore {
    // Written from a background thread in init(), read from other threads in validateAndSync().
    // @Volatile ensures the assignment is visible across threads instead of relying on incidental
    // memory-barrier timing.
    @Volatile
    private var securePrefs: android.content.SharedPreferences? = null

    // We use v3 to force a fresh start for the new ultra-secure keys
    private const val KEY_FIRST_LAUNCH = "first_launch_millis"
    private const val KEY_LAST_KNOWN_WALL = "last_known_wall_millis"
    private const val KEY_LAST_KNOWN_ELAPSED = "last_known_elapsed_millis"
    private const val KEY_TAMPER_COUNT = "tamper_detected_count"
    private const val KEY_BOOT_GRACE_UNTIL_ELAPSED = "boot_grace_until_elapsed_millis"

    // The difference between wall clock advance and elapsed time advance should be minimal.
    // We increase this to 24 hours to avoid false positives on budget phones with unreliable clocks,
    // while still catching significant deliberate time jumps (e.g. changing the day).
    private const val MAX_ALLOWED_DRIFT = 86_400_000L // 24 hours in milliseconds

    // Many budget phones lack a battery-backed RTC. After a reboot they briefly report a bogus
    // wall-clock time (e.g. the OS build date or epoch) until the network reconnects and NTP
    // corrects it. That correction can look identical to a malicious forward jump, so we give a
    // short grace window right after a detected reboot before we start punishing forward jumps.
    private const val BOOT_GRACE_PERIOD_MS = 3 * 60 * 1000L // 3 minutes

    // A single ambiguous reading (clock glitch, NTP smoothing, brief carrier NITZ hiccup) should
    // not be enough to hard-lock the app. Require the drift to show up on this many consecutive
    // checks before we treat it as confirmed tampering.
    private const val TAMPER_CONFIRMATION_THRESHOLD = 2

    fun init(context: Context) {
        Thread {
            try {
                Log.d("DateGuardCore", "Initializing secure preferences...")
                val masterKey = MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build()

                securePrefs = EncryptedSharedPreferences.create(
                    context,
                    "zexa_date_guard_v3",
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                )
                Log.d("DateGuardCore", "Secure preferences initialized successfully.")
            } catch (e: Exception) {
                Log.e("DateGuardCore", "Failed to initialize secure prefs, falling back to standard prefs", e)
                securePrefs = context.getSharedPreferences("zexa_date_guard_fallback_v3", Context.MODE_PRIVATE)
            }
        }.start()
    }

    fun validateAndSync(context: Context): DateCheckResult {
        val prefs = securePrefs ?: context.getSharedPreferences("zexa_date_guard_fallback_v3", Context.MODE_PRIVATE)

        // 1. Get the current times
        val currentWall = System.currentTimeMillis() // Can be changed by user
        val currentElapsed = SystemClock.elapsedRealtime() // CANNOT be changed by user

        val firstLaunch = prefs.getLong(KEY_FIRST_LAUNCH, 0L)
        val lastWall = prefs.getLong(KEY_LAST_KNOWN_WALL, 0L)
        val lastElapsed = prefs.getLong(KEY_LAST_KNOWN_ELAPSED, 0L)

        val today = Instant.ofEpochMilli(currentWall).atZone(ZoneId.systemDefault()).toLocalDate()

        // 2️⃣ First launch initialization
        if (firstLaunch == 0L) {
            prefs.edit()
                .putLong(KEY_FIRST_LAUNCH, currentWall)
                .putLong(KEY_LAST_KNOWN_WALL, currentWall)
                .putLong(KEY_LAST_KNOWN_ELAPSED, currentElapsed)
                .putInt(KEY_TAMPER_COUNT, 0)
                .apply()

            return getNormalResult(today)
        }

        // 3️⃣ REBOOT CHECK: If elapsed time is less than last saved, the phone rebooted.
        // We update the saved times and trust the system clock, but we also open a short grace
        // window: on phones without a battery-backed RTC, the clock read here may still be
        // bogus and about to be corrected by NTP once the network connects.
        if (currentElapsed < lastElapsed) {
            Log.d("DateGuardCore", "Device reboot detected. Updating baseline and granting NTP resync grace period.")
            prefs.edit()
                .putLong(KEY_LAST_KNOWN_WALL, currentWall)
                .putLong(KEY_LAST_KNOWN_ELAPSED, currentElapsed)
                .putLong(KEY_BOOT_GRACE_UNTIL_ELAPSED, currentElapsed + BOOT_GRACE_PERIOD_MS)
                .putInt(KEY_TAMPER_COUNT, 0)
                .apply()
            return getNormalResult(today)
        }

        // 4️⃣ ULTRA-SECURE FORWARD & BACKWARD TAMPER CHECK
        val deltaWall = currentWall - lastWall
        val deltaElapsed = currentElapsed - lastElapsed
        val drift = abs(deltaWall - deltaElapsed)

        if (drift > MAX_ALLOWED_DRIFT) {
            val bootGraceUntil = prefs.getLong(KEY_BOOT_GRACE_UNTIL_ELAPSED, 0L)
            val withinBootGrace = currentElapsed < bootGraceUntil

            // Forward jump shortly after a reboot is very likely a legitimate NTP correction of
            // a bogus post-boot clock, not tampering. Accept it and re-baseline instead of locking.
            if (withinBootGrace && deltaWall > 0) {
                Log.d("DateGuardCore", "Large forward jump within post-boot grace window ($drift ms) - treating as NTP resync, not tampering.")
                prefs.edit()
                    .putLong(KEY_LAST_KNOWN_WALL, currentWall)
                    .putLong(KEY_LAST_KNOWN_ELAPSED, currentElapsed)
                    .apply()
                return getNormalResult(today)
            }

            // Require confirmation across consecutive checks before hard-locking, so a single
            // transient/glitchy reading can't lock out a user who never touched their clock.
            val tamperCount = prefs.getInt(KEY_TAMPER_COUNT, 0) + 1
            Log.w("DateGuardCore", "Possible time tamper. Drift: ${drift}ms. Wall delta: ${deltaWall}ms, Elapsed delta: ${deltaElapsed}ms. Consecutive count: $tamperCount")

            if (tamperCount < TAMPER_CONFIRMATION_THRESHOLD) {
                // Deliberately don't update the baseline: a genuine tamper attempt will trip this
                // same check again (and increment further) on the very next call. A one-off
                // glitch will instead look normal next time and the counter gets cleared below.
                prefs.edit().putInt(KEY_TAMPER_COUNT, tamperCount).apply()
                return getNormalResult(today)
            }

            return DateCheckResult(false, true, null, false,
                "🔒 Time tampering detected (Clock changed forward or backward). Please restore correct time to unlock.")
        }

        // 5️⃣ Normal operation: drift within tolerance. Update saved times and clear any
        // pending (unconfirmed) tamper count.
        prefs.edit()
            .putLong(KEY_LAST_KNOWN_WALL, currentWall)
            .putLong(KEY_LAST_KNOWN_ELAPSED, currentElapsed)
            .putInt(KEY_TAMPER_COUNT, 0)
            .apply()

        return getNormalResult(today)
    }

    private fun getNormalResult(today: LocalDate): DateCheckResult {
        val currentPeriod = TermCalendarManager.getCurrentPeriod(today)
        val isHoliday = currentPeriod.id.startsWith("holiday")

        Log.d("DateGuardCore", "validateAndSync: today=$today, isHoliday=$isHoliday, period=${currentPeriod.id}")

        return DateCheckResult(
            isValid = true,
            isTampered = false,
            currentPeriod = currentPeriod,
            isHoliday = isHoliday,
            message = getCountdownMessage(today)
        )
    }

    fun resetTamperState(context: Context) {
        val prefs = securePrefs ?: context.getSharedPreferences("zexa_date_guard_fallback_v3", Context.MODE_PRIVATE)
        val currentWall = System.currentTimeMillis()
        val currentElapsed = SystemClock.elapsedRealtime()
        prefs.edit()
            .putLong(KEY_LAST_KNOWN_WALL, currentWall)
            .putLong(KEY_LAST_KNOWN_ELAPSED, currentElapsed)
            .putInt(KEY_TAMPER_COUNT, 0)
            .remove(KEY_BOOT_GRACE_UNTIL_ELAPSED)
            .apply()
    }

    fun getCountdownMessage(today: LocalDate): String {
        val activePeriod = TermCalendarManager.getCurrentPeriod(today)

        return if (!activePeriod.id.startsWith("holiday")) {
            val days = java.time.temporal.ChronoUnit.DAYS.between(today, activePeriod.endDate)
            if (days <= 0L) "${activePeriod.name} ends today!"
            else "$days days left to ${activePeriod.name} close"
        } else {
            val nextStart = TermCalendarManager.getNextTermStart(today)
            if (nextStart != null) {
                val days = java.time.temporal.ChronoUnit.DAYS.between(today, nextStart)
                "$days days to school opening"
            } else {
                "Academic cycle continues..."
            }
        }
    }

    fun getDaysUntilNextTerm(): Long {
        val today = LocalDate.now()
        val nextStart = TermCalendarManager.getNextTermStart(today) ?: return -1
        return java.time.temporal.ChronoUnit.DAYS.between(today, nextStart)
    }

    fun getLocalActiveTermName(context: Context): String {
        val today = LocalDate.now()
        val currentPeriod = TermCalendarManager.getCurrentPeriod(today)
        return currentPeriod.id
    }
}

data class DateCheckResult(
    val isValid: Boolean,
    val isTampered: Boolean,
    val currentPeriod: TermCalendarManager.AcademicTerm?,
    val isHoliday: Boolean,
    val message: String
)
