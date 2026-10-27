package com.zexa.aioffline.data

import android.content.Context
import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import com.zexa.ai.zimsec.core.TermCalendarManager
import com.zexa.aioffline.util.FirestoreUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.time.LocalDate
import java.time.ZoneId
import java.util.*

class SubscriptionManager(
    private val firestore: FirebaseFirestore,
    private val context: Context
) {
    private val preferenceManager = PreferenceManager(context)

    // EXACT PRICES FOR DIFFERENT LEVELS
    val REQUIRED_AMOUNTS = mapOf(
        "Primary Education" to 4.00,
        "Secondary Education" to 5.00,
        "Tertiary Education" to 5.00
    )

    /**
     * Checks if the current term has ended and downgrades user if necessary.
     * Uses a short timeout and checks network to prevent hanging.
     */
    suspend fun checkAndEnforceTermExpiry(userId: String) = withContext(Dispatchers.IO) {
        if (!com.zexa.aioffline.util.NetworkUtils.isNetworkAvailable(context)) {
            Log.d("ZEXA_SUB", "Offline: Skipping server subscription check.")
            return@withContext
        }

        try {
            // CRITICAL: Short 3-second timeout to prevent 2-minute hanging on bad networks
            val userDoc = withTimeout(3000L) {
                firestore.collection("users").document(userId).get(Source.SERVER).await()
            }
            
            if (!userDoc.exists()) return@withContext
            val data = userDoc.data ?: emptyMap()

            val isPremiumFlag = data["isPremium"] as? Boolean 
                ?: (data["is_premium"] as? Boolean)
                ?: (data["premium"] as? Boolean)
                ?: (data["isPremium"].toString().equals("true", ignoreCase = true))
                ?: (data["is_premium"].toString().equals("true", ignoreCase = true))
                ?: (data["premium"].toString().equals("true", ignoreCase = true))
                ?: false
                
            val statusString = (data["subscriptionStatus"] as? String) 
                ?: (data["subscription_status"] as? String) 
                ?: (data["status"] as? String)
                ?: "FREE"
                
            val paidForTerm = (data["paidForTerm"] as? String) 
                ?: (data["paid_for_term"] as? String) 
                ?: ""
            
            val serverLevel = (data["studyLevel"] as? String) 
                ?: (data["educationLevel"] as? String) 
                ?: ""
                
            var expiryMillis = FirestoreUtils.getDateAsLong(data, "termEndDate", 
                               FirestoreUtils.getDateAsLong(data, "term_expiry", 0L))
            
            val currentTerm = TermCalendarManager.getCurrentPeriod()
            val currentTermId = currentTerm.id
            val isHoliday = TermCalendarManager.isHolidayPeriod()
            
            val hasPremiumIntent = isPremiumFlag || statusString.equals("PREMIUM", ignoreCase = true)
            
            // ✅ MANUAL OVERRIDE FIX: If admin says Premium, ignore past expiry dates
            if (hasPremiumIntent && (expiryMillis == 0L || System.currentTimeMillis() > expiryMillis)) {
                expiryMillis = currentTerm.endDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
            }

            // Improved term consistency for holiday breaks + manual override support
            val isCorrectTerm = paidForTerm == currentTermId || 
                               (isHoliday && (currentTermId == "holiday_$paidForTerm" || currentTermId.contains(paidForTerm))) ||
                               (isHoliday && paidForTerm.isNotEmpty()) ||
                               hasPremiumIntent
            
            val todayMillis = System.currentTimeMillis()
            val isExpiredLocally = expiryMillis != 0L && todayMillis > expiryMillis

            // BUG FIX: ENFORCE TERM CONSISTENCY
            val actualIsPremium = (hasPremiumIntent && isCorrectTerm && !isExpiredLocally) || 
                                 (isHoliday && context.getSharedPreferences("zexa_sub", Context.MODE_PRIVATE).getBoolean("has_paid", false))
            
            // Sync local storage with latest calculated state
            preferenceManager.setPremiumStatus(actualIsPremium)
            preferenceManager.setTermEndDate(expiryMillis)
            if (serverLevel.isNotEmpty()) {
                preferenceManager.setEducationLevel(serverLevel)
            }

            // Sync to SharedPreferences for LocalSubscriptionManager (CRITICAL FIX)
            val sp = context.getSharedPreferences("zexa_sub", Context.MODE_PRIVATE)
            sp.edit().apply {
                if (actualIsPremium) {
                    putBoolean("has_paid", true)
                    putLong("local_term_end_date", expiryMillis)
                } else if (!isHoliday) {
                    putLong("local_term_end_date", 0L)
                }
                apply()
            }

            if (!hasPremiumIntent) return@withContext

            // Downgrade ONLY if not in holiday (Holiday gives free extension to previous paid users)
            if (!isHoliday) {
                if ((todayMillis > expiryMillis && expiryMillis != 0L) || !isCorrectTerm) {
                    if (!hasPremiumIntent) { // Double check intent before forced downgrade
                        Log.d("ZEXA_SUB", "SUBSCRIPTION INVALID (Term/Date): Downgrading user $userId")
                        downgradeUserToFree(userId)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("ZEXA_SUB", "Error enforcing expiry or server fetch failed, trying cache", e)
            // If server fails, fallback to local check but don't force downgrade unless sure
            try {
                val cachedDoc = firestore.collection("users").document(userId).get(Source.CACHE).await()
                val isPremium = cachedDoc.getBoolean("isPremium") ?: cachedDoc.getBoolean("is_premium") ?: false
                preferenceManager.setPremiumStatus(isPremium)
            } catch (e2: Exception) {}
        }
    }

    /**
     * Resets user to Free status in both Firestore and local preferences.
     */
    suspend fun downgradeUserToFree(userId: String) = withContext(Dispatchers.IO) {
        val updates = hashMapOf<String, Any>(
            "subscriptionStatus" to "EXPIRED",
            "isPremium" to false,
            "termStatus" to "EXPIRED",
            "paidForTerm" to "",
            "lastDowngradeDate" to Timestamp(Date())
        )
        
        try {
            withTimeout(3000) {
                firestore.collection("users").document(userId).update(updates).await()
            }
            preferenceManager.setPremiumStatus(false)
            preferenceManager.setTermEndDate(0L)
            Log.d("ZEXA_SUB", "User $userId successfully downgraded to Free")
        } catch (e: Exception) {
            Log.e("ZEXA_SUB", "Failed to downgrade Firestore, but updating local status", e)
            preferenceManager.setPremiumStatus(false)
            preferenceManager.setTermEndDate(0L)
        }
    }

    /**
     * Transitions user to PENDING_PAYMENT mode before EcoCash payment.
     */
    suspend fun setPendingPayment(userId: String, pollUrl: String = "", reference: String = "") = withContext(Dispatchers.IO) {
        val updates = hashMapOf<String, Any>(
            "subscriptionStatus" to "PENDING_PAYMENT",
            "termStatus" to "RENEWAL_STARTED",
            "lastPollUrl" to pollUrl,
            "lastReference" to reference,
            "lastPaymentAttempt" to Timestamp(Date())
        )
        try {
            withTimeout(15000) {
                firestore.collection("users").document(userId).update(updates).await()
            }
        } catch (e: Exception) {
            Log.e("ZEXA_SUB", "Failed to set pending payment status", e)
        }
    }

    /**
     * Validates transaction amount and activates premium if correct.
     */
    suspend fun processEcoCashTransaction(
        userId: String,
        transactionMessage: String,
        expectedAmount: Double,
        termId: String,
        educationLevel: String
    ): Boolean = withContext(Dispatchers.IO) {
        
        val isSuccessful = transactionMessage.contains("confirmed", ignoreCase = true) || 
                           transactionMessage.contains("successful", ignoreCase = true) ||
                           transactionMessage.contains("completed", ignoreCase = true)

        if (!isSuccessful) return@withContext false

        val paidAmount = extractAmountFromMessage(transactionMessage)
        
        if (paidAmount == null || Math.abs(paidAmount - expectedAmount) > 0.01) {
            return@withContext false
        }

        return@withContext activatePremiumSubscription(userId, termId, paidAmount, educationLevel)
    }

    suspend fun handleSuccessfulPayment(userId: String, amount: Double, studyLevel: String, purpose: String) {
        val updates = hashMapOf<String, Any>(
            "subscriptionStatus" to "PREMIUM",
            "isPremium" to true,
            "paidForLevel" to studyLevel,
            "lastPaymentAmount" to amount,
            "lastPaymentDate" to Timestamp(Date()),
            "termEndDate" to Timestamp(Date(System.currentTimeMillis() + 90L * 24 * 60 * 60 * 1000)) // 90 days
        )
        
        // If this is a level upgrade, also update studyLevel
        if (purpose == "LEVEL_UPGRADE") {
            updates["studyLevel"] = studyLevel
        }
        
        firestore.collection("users").document(userId).update(updates).await()
    }

    fun extractAmountFromMessage(message: String): Double? {
        val regex = Regex("""(?:Amount|Value|Paid|ZWG|USD)[:\s]*([0-9]+\.?[0-9]*)""", RegexOption.IGNORE_CASE)
        val match = regex.find(message)
        return match?.groupValues?.get(1)?.toDoubleOrNull()
    }

    suspend fun activatePremiumSubscription(userId: String, termId: String, amount: Double, educationLevel: String): Boolean {
        // Robust year detection from termId (e.g., term1_2025)
        val yearMatch = Regex("""\d{4}""").find(termId)?.value?.toInt() ?: LocalDate.now().year
        
        val term = TermCalendarManager.getTermsForYear(yearMatch)[termId]
                  ?: TermCalendarManager.getCurrentPeriod()
                  
        val expiryMillis = term.endDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()

        val updates = hashMapOf<String, Any>(
            "subscriptionStatus" to "PREMIUM",
            "isPremium" to true,
            "termStatus" to "ACTIVE",
            "paidForTerm" to termId,
            "termEndDate" to Timestamp(Date(expiryMillis)),
            "lastPaymentDate" to Timestamp(Date()),
            "lastPaymentAmount" to amount,
            "studyLevel" to educationLevel,
            "paidForLevel" to educationLevel
        )

        return try {
            withTimeout(15000) {
                firestore.collection("users").document(userId).update(updates).await()
            }
            preferenceManager.setPremiumStatus(true)
            preferenceManager.setTermEndDate(expiryMillis)
            true
        } catch (e: Exception) {
            Log.e("ZEXA_SUB", "Activation failed for user $userId: ${e.message}")
            false
        }
    }
}
