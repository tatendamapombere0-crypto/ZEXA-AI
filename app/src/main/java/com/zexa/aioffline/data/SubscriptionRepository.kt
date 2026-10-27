package com.zexa.aioffline.data

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import com.zexa.ai.zimsec.core.TermCalendarManager
import com.zexa.aioffline.util.FirestoreUtils
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

sealed class SubscriptionState {
    object Loading : SubscriptionState()
    data class Success(
        val isPremium: Boolean,
        val isHoliday: Boolean = false,
        val termExpiry: Long = 0L,
        val intelLevel: String = "Primary Education",
        val status: String = "FREE",
        val paidForLevel: String = "",
        val lastPollUrl: String = "",
        val lastReference: String = ""
    ) : SubscriptionState()
    data class Error(val message: String) : SubscriptionState()
}

class SubscriptionRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val context: android.content.Context? = null
) {
    private val preferenceManager = context?.let { PreferenceManager(it) }

    fun observeSubscriptionStatus(): Flow<SubscriptionState> = callbackFlow {
        val currentUser = auth.currentUser
        
        if (currentUser == null) {
            trySend(SubscriptionState.Success(
                isPremium = isLocalPremiumActive(),
                isHoliday = TermCalendarManager.isHolidayPeriod(),
                status = "OFFLINE"
            ))
            close()
        }

        val listener = if (currentUser != null) {
            val userId = currentUser.uid
            firestore.collection("users")
                .document(userId)
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        trySend(SubscriptionState.Error(error.message ?: "Failed to load"))
                        return@addSnapshotListener
                    }

                    if (snapshot != null && snapshot.exists()) {
                        val data = snapshot.data ?: emptyMap()
                        
                        val isPremiumBool = data["isPremium"] as? Boolean ?: false
                        val statusString = (data["subscriptionStatus"] as? String) ?: "FREE"
                        
                        val currentPeriod = TermCalendarManager.getCurrentPeriod()
                        val isHoliday = TermCalendarManager.isHolidayPeriod()
                        val todayMillis = System.currentTimeMillis()
                        
                        var expiry = FirestoreUtils.getDateAsLong(data, "termEndDate", 0L)
                        val hasPremiumIntent = isPremiumBool || statusString.equals("PREMIUM", ignoreCase = true)
                        
                        if (hasPremiumIntent && (expiry == 0L || todayMillis > expiry)) {
                            expiry = currentPeriod.endDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
                        }

                        val isExpiredLocally = expiry != 0L && todayMillis > expiry
                        
                        // 🚀 SILICON VALLEY SYNC: Local code activation is the ULTIMATE source of truth
                        val isPremium = (hasPremiumIntent && !isExpiredLocally) || isLocalPremiumActive() || (isHoliday && hasPaidRecord())
                        
                        if (isPremium && expiry > 0) syncToLocalPrefs(expiry)
                        
                        trySend(SubscriptionState.Success(
                            isPremium = isPremium,
                            isHoliday = isHoliday,
                            termExpiry = expiry,
                            intelLevel = (data["studyLevel"] as? String) ?: "Primary Education",
                            status = if (isExpiredLocally && !isPremium) "EXPIRED" else if (isPremium) "PREMIUM" else statusString,
                            paidForLevel = (data["paidForLevel"] as? String) ?: "",
                            lastPollUrl = snapshot.getString("lastPollUrl") ?: "",
                            lastReference = snapshot.getString("lastReference") ?: ""
                        ))
                    } else {
                        trySend(SubscriptionState.Success(isPremium = isLocalPremiumActive(), isHoliday = TermCalendarManager.isHolidayPeriod()))
                    }
                }
        } else null

        awaitClose { listener?.remove() }
    }

    private fun isLocalPremiumActive(): Boolean {
        val ctx = context ?: return false
        val localStatus = com.zexa.ai.zimsec.ui.access.LocalSubscriptionManager.getCurrentStatus(ctx)
        return localStatus == com.zexa.ai.zimsec.ui.access.SubscriptionStatus.PREMIUM
    }
    
    private fun hasPaidRecord(): Boolean {
        return context?.getSharedPreferences("zexa_sub", android.content.Context.MODE_PRIVATE)?.getBoolean("has_paid", false) ?: false
    }
    
    private fun syncToLocalPrefs(expiry: Long) {
        context?.getSharedPreferences("zexa_sub", android.content.Context.MODE_PRIVATE)?.edit()?.apply {
            putBoolean("has_paid", true)
            putLong("local_term_end_date", expiry)
            apply()
        }
    }

    suspend fun refreshStatusFromServer(): SubscriptionState = withContext(Dispatchers.IO) {
        val userId = auth.currentUser?.uid ?: return@withContext SubscriptionState.Error("No user")
        if (context != null && !com.zexa.aioffline.util.NetworkUtils.isNetworkAvailable(context)) return@withContext refreshStatus()

        try {
            val doc = withTimeout(3000L) { firestore.collection("users").document(userId).get(Source.SERVER).await() }
            val data = doc.data ?: emptyMap()
            val isPremiumBool = data["isPremium"] as? Boolean ?: false
            val statusString = (data["subscriptionStatus"] as? String) ?: "FREE"
            val expiry = FirestoreUtils.getDateAsLong(data, "termEndDate", 0L)
            
            val isPremium = (isPremiumBool || statusString.equals("PREMIUM", ignoreCase = true)) || isLocalPremiumActive()

            SubscriptionState.Success(
                isPremium = isPremium,
                isHoliday = TermCalendarManager.isHolidayPeriod(),
                termExpiry = expiry,
                intelLevel = (data["studyLevel"] as? String) ?: "Primary Education",
                status = if (isPremium) "PREMIUM" else statusString,
                paidForLevel = (data["paidForLevel"] as? String) ?: "",
                lastPollUrl = doc.getString("lastPollUrl") ?: "",
                lastReference = doc.getString("lastReference") ?: ""
            )
        } catch (e: Throwable) {
            refreshStatus()
        }
    }

    suspend fun refreshStatus(): SubscriptionState = withContext(Dispatchers.IO) {
        val userId = auth.currentUser?.uid ?: return@withContext SubscriptionState.Error("No user")
        try {
            val doc = withTimeout(5000) { firestore.collection("users").document(userId).get().await() }
            val data = doc.data ?: emptyMap()
            val isPremium = (data["isPremium"] as? Boolean ?: false) || isLocalPremiumActive()
            
            SubscriptionState.Success(
                isPremium = isPremium,
                isHoliday = TermCalendarManager.isHolidayPeriod(),
                termExpiry = FirestoreUtils.getDateAsLong(data, "termEndDate", 0L),
                intelLevel = (data["studyLevel"] as? String) ?: "Primary Education",
                status = if (isPremium) "PREMIUM" else "FREE",
                paidForLevel = (data["paidForLevel"] as? String) ?: ""
            )
        } catch (e: Throwable) {
            SubscriptionState.Success(
                isPremium = isLocalPremiumActive(),
                isHoliday = TermCalendarManager.isHolidayPeriod(),
                status = "OFFLINE"
            )
        }
    }
}
