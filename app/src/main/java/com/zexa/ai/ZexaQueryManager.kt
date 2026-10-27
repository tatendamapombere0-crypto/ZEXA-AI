package com.zexa.ai

import android.content.Context
import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import com.zexa.ai.zimsec.core.TermCalendarManager
import com.zexa.aioffline.data.SubscriptionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.util.Date
import java.util.Locale

class ZexaQueryManager(private val context: Context) {

    private val db = FirebaseFirestore.getInstance()
    private val mAuth = FirebaseAuth.getInstance()
    private val preferenceManager = com.zexa.aioffline.data.PreferenceManager(context)
    private val subscriptionManager = SubscriptionManager(db, context)

    interface QueryAccessCallback {
        fun onAccessGranted(isPremium: Boolean, remainingFreeQuestions: Int, isHolidayMode: Boolean)
        fun onAccessDenied(title: String, reason: String, showEcoCashButton: Boolean)
    }

    private fun checkLocalHolidayState(): Boolean {
        return TermCalendarManager.isHolidayPeriod(LocalDate.now())
    }

    suspend fun checkAccessStatusAsync(): ZexaAccessResult = withContext(Dispatchers.IO) {
        val user = mAuth.currentUser
        val userId = user?.uid ?: "guest_user"
        val todayDateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        
        // 1. ALWAYS USE LOCAL COUNT AS SOURCE OF TRUTH
        val localCount = try { preferenceManager.offlineQueryCount.first() } catch (e: Exception) { 0 }
        val localDate = try { preferenceManager.lastQueryDate.first() } catch (e: Exception) { "" }
        val localDailyLimit = try { preferenceManager.dailyLimit.first() } catch (e: Exception) { 2 }
        
        // Reset count if it's a new day
        val actualLocalCount = if (localDate == todayDateStr) localCount else 0
        if (localDate != todayDateStr) {
            preferenceManager.updateOfflineQueryCount(0, todayDateStr)
        }

        val status = com.zexa.ai.zimsec.ui.access.LocalSubscriptionManager.getCurrentStatus(context)
        if (status == com.zexa.ai.zimsec.ui.access.SubscriptionStatus.PREMIUM || 
            status == com.zexa.ai.zimsec.ui.access.SubscriptionStatus.HOLIDAY_FREE) {
            return@withContext ZexaAccessResult.Granted(true, -1, status == com.zexa.ai.zimsec.ui.access.SubscriptionStatus.HOLIDAY_FREE)
        }

        // 2. OPTIONAL: Sync to Firestore if online (only for logged-in users)
        if (user != null) {
            // 🎯 OPTIMIZATION: Try cache first for instant response
            try {
                val cachedDoc = withTimeout(500) {
                    db.collection("users").document(userId).get(Source.CACHE).await()
                }
                if (cachedDoc.exists()) {
                    processUserDocument(cachedDoc)
                }
            } catch (e: Exception) {}

            // Background server sync - don't wait for it
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val serverDoc = withTimeout(3000) {
                        db.collection("users").document(userId).get(Source.SERVER).await()
                    }
                    if (serverDoc.exists()) {
                        processUserDocument(serverDoc)
                    }
                } catch (e: Exception) {}
            }
        }

        return@withContext ZexaAccessResult.Granted(false, (localDailyLimit - actualLocalCount).coerceAtLeast(0), false)
    }

    private suspend fun processUserDocument(document: com.google.firebase.firestore.DocumentSnapshot) {
        val isPremium = document.getBoolean("isPremium") ?: document.getBoolean("is_premium") ?: false
        val subscriptionStatus = document.getString("subscriptionStatus") ?: document.getString("subscription_status") ?: "FREE"
        val paidForTerm = document.getString("paidForTerm") ?: document.getString("paid_for_term") ?: ""
        
        val currentPeriod = TermCalendarManager.getCurrentPeriod(LocalDate.now())
        val currentTermId = currentPeriod.id
        val hasPremiumFlag = isPremium || subscriptionStatus.equals("PREMIUM", ignoreCase = true)
        
        var isCorrectTerm = paidForTerm == currentTermId

        // 🚨 FIX: Handle Holiday Period Mismatch
        if (!isCorrectTerm && currentPeriod.id.startsWith("holiday_")) {
            val nextTermStart = TermCalendarManager.getNextTermStart(LocalDate.now())
            if (nextTermStart != null) {
                val nextTermId = TermCalendarManager.getTermsForYear(nextTermStart.year).values.find { it.startDate == nextTermStart }?.id
                if (paidForTerm == nextTermId) {
                    isCorrectTerm = true
                }
            }
        }
        
        if (hasPremiumFlag && (isCorrectTerm || paidForTerm.isNotBlank())) {
            preferenceManager.setPremiumStatus(true)
        } else {
            preferenceManager.setPremiumStatus(false)
        }
        
        val limit = document.getLong("dailyLimit") ?: 2L
        preferenceManager.setDailyLimit(limit.toInt())
    }

    suspend fun verifyZexaAccessRulesAsync(): ZexaAccessResult = withContext(Dispatchers.IO) {
        val user = mAuth.currentUser
        val userId = user?.uid ?: "guest_user"
        val todayDateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        val isHoliday = checkLocalHolidayState()
        
        // Check if user has paid before (recorded in shared preferences)
        val hasPaidBeforeLocally = context.getSharedPreferences("zexa_sub", Context.MODE_PRIVATE).getBoolean("has_paid", false)

        // 0. ENFORCE EXPIRY
        if (user != null) {
            // Run in background to avoid delay
            CoroutineScope(Dispatchers.IO).launch {
                subscriptionManager.checkAndEnforceTermExpiry(userId)
            }
        }

        // 1. ALWAYS USE LOCAL COUNT AS SOURCE OF TRUTH
        val localIsPremium = try { preferenceManager.isPremium.first() } catch (e: Exception) { false }
        val localCount = try { preferenceManager.offlineQueryCount.first() } catch (e: Exception) { 0 }
        val localDate = try { preferenceManager.lastQueryDate.first() } catch (e: Exception) { "" }
        val localDailyLimit = try { preferenceManager.dailyLimit.first() } catch (e: Exception) { 2 }
        
        // Reset count if it's a new day
        val actualLocalCount = if (localDate == todayDateStr) localCount else 0
        if (localDate != todayDateStr) {
            preferenceManager.updateOfflineQueryCount(0, todayDateStr)
        }

        if (localIsPremium) {
            return@withContext ZexaAccessResult.Granted(true, -1, isHoliday)
        }

        // 2. Background Sync
        if (user != null && com.zexa.aioffline.util.NetworkUtils.isNetworkAvailable(context)) {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val document = withTimeout(2000) {
                        db.collection("users").document(userId).get(Source.SERVER).await()
                    }
                    if (document.exists()) {
                        processUserDocument(document)
                    }
                } catch (e: Throwable) {}
            }
        }

        // 3. HOLIDAY LOGIC
        if (isHoliday && hasPaidBeforeLocally) {
            // Premium/Returning users get unlimited access during holiday
            return@withContext ZexaAccessResult.Granted(true, -1, true)
        }

        // 4. CHECK LOCAL COUNT (SOURCE OF TRUTH)
        if (actualLocalCount < localDailyLimit) {
            val newCount = actualLocalCount + 1
            
            // ALWAYS increment local count
            incrementLocalCount(newCount, todayDateStr)
            
            // OPTIONAL: Sync to Firestore if online
            if (user != null) {
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        withTimeout(2000) {
                            db.collection("users").document(userId).update(mapOf(
                                "questionsUsedToday" to newCount.toLong(),
                                "lastQuestionDate" to System.currentTimeMillis()
                            )).await()
                        }
                    } catch (e: Exception) {
                        Log.w("ZEXA_AI", "Background Firestore sync failed: ${e.message}")
                    }
                }
            }
            
            val remaining = (localDailyLimit - newCount).coerceAtLeast(0)
            return@withContext ZexaAccessResult.Granted(false, remaining, false)
        } else {
            return@withContext ZexaAccessResult.Denied("Limit Reached", "You have used your $localDailyLimit free offline queries. Upgrade to Premium!", true)
        }
    }

    private suspend fun incrementLocalCount(count: Int, date: String) {
        preferenceManager.updateOfflineQueryCount(count, date)
    }

    sealed class ZexaAccessResult {
        data class Granted(val isPremium: Boolean, val remainingFreeQuestions: Int, val isHolidayMode: Boolean) : ZexaAccessResult()
        data class Denied(val title: String, val reason: String, val showEcoCashButton: Boolean) : ZexaAccessResult()
    }

    fun checkAccessStatus(callback: QueryAccessCallback) {
        CoroutineScope(Dispatchers.Main).launch {
            val result = checkAccessStatusAsync()
            when (result) {
                is ZexaAccessResult.Granted -> callback.onAccessGranted(result.isPremium, result.remainingFreeQuestions, result.isHolidayMode)
                is ZexaAccessResult.Denied -> callback.onAccessDenied(result.title, result.reason, result.showEcoCashButton)
            }
        }
    }

    fun verifyZexaAccessRules(callback: QueryAccessCallback) {
        CoroutineScope(Dispatchers.Main).launch {
            val result = verifyZexaAccessRulesAsync()
            when (result) {
                is ZexaAccessResult.Granted -> callback.onAccessGranted(result.isPremium, result.remainingFreeQuestions, result.isHolidayMode)
                is ZexaAccessResult.Denied -> callback.onAccessDenied(result.title, result.reason, result.showEcoCashButton)
            }
        }
    }

    fun resetDailyLimit(listener: com.google.android.gms.tasks.OnSuccessListener<Void>) {
        val userId = mAuth.currentUser?.uid ?: return
        val userDocRef = db.collection("users").document(userId)
        val resetData = mapOf(
            "questionsUsedToday" to 0L,
            "lastQuestionDate" to System.currentTimeMillis()
        )
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                withTimeout(2000) {
                    userDocRef.update(resetData).await()
                    withContext(Dispatchers.Main) {
                        listener.onSuccess(null)
                    }
                }
            } catch (e: Exception) {}
        }
    }

    companion object {
        fun isSameDay(t1: Long, t2: Long): Boolean {
            if (t1 == 0L || t2 == 0L) return false
            val cal1 = java.util.Calendar.getInstance().apply { timeInMillis = t1 }
            val cal2 = java.util.Calendar.getInstance().apply { timeInMillis = t2 }
            return cal1.get(java.util.Calendar.YEAR) == cal2.get(java.util.Calendar.YEAR) &&
                   cal1.get(java.util.Calendar.DAY_OF_YEAR) == cal2.get(java.util.Calendar.DAY_OF_YEAR)
        }
    }
}
