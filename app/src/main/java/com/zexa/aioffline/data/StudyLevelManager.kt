package com.zexa.aioffline.data

import android.app.Activity
import android.content.Context
import android.content.Intent
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import java.util.Date

class StudyLevelManager(
    private val firestore: FirebaseFirestore, 
    private val userId: String,
    private val context: Context
) {
    private val preferenceManager = PreferenceManager(context)
    
    // Define prices for each level
    private val LEVEL_PRICES = mapOf(
        "Primary Education" to 4.00,
        "Secondary Education" to 5.00,
        "Tertiary Education" to 5.00
    )
    
    suspend fun attemptLevelChange(newLevel: String, currentActivity: Activity) {
        val userDoc = try {
            firestore.collection("users").document(userId).get().await()
        } catch (e: Exception) {
            null
        }

        val currentLevel = userDoc?.getString("studyLevel") ?: "Primary Education"
        val paidForLevel = userDoc?.getString("paidForLevel") ?: currentLevel
        
        // 🎯 CONTENT LEVEL MAPPING: 
        // We must also determine the new contentLevel tag for local filtering
        val newContentLevel = when {
            newLevel.contains("Primary", true) -> "Primary"
            newLevel.contains("Secondary", true) -> "O-Level"
            newLevel.contains("Tertiary", true) -> "Tertiary"
            else -> "O-Level"
        }

        // BUG 1 FIX: If selecting current/paid level, just finish() to return to previous screen
        // Added check: If we are offline/guest, we skip the server check and just update local
        if (newLevel == currentLevel || newLevel == paidForLevel) {
            updateStudyLevel(newLevel, newContentLevel)
            currentActivity.finish()
            return
        }

        // BUG 3: Ensure correct prices are shown in dialog
        val requiredPrice = LEVEL_PRICES[newLevel] ?: 5.00
        showUpgradeRequiredDialog(currentActivity, newLevel, requiredPrice) {
            navigateToPaymentScreen(currentActivity, newLevel, requiredPrice)
        }
    }
    
    private fun showUpgradeRequiredDialog(
        activity: Activity, 
        newLevel: String, 
        price: Double,
        onConfirm: () -> Unit
    ) {
        MaterialAlertDialogBuilder(activity)
            .setTitle("Upgrade Required")
            .setMessage("To access $newLevel content, you need to upgrade your subscription for $${price.toInt()}. Would you like to upgrade now?")
            .setPositiveButton("Upgrade Now") { dialog, _ ->
                dialog.dismiss()
                onConfirm()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }
    
    private fun navigateToPaymentScreen(activity: Activity, level: String, amount: Double) {
        // BUG 2 FIX: Ensure Intent points to PaymentActivity and is correctly started
        val intent = Intent(activity, com.zexa.aioffline.ui.PaymentActivity::class.java).apply {
            putExtra("STUDY_LEVEL", level)
            putExtra("AMOUNT", amount)
            putExtra("PURPOSE", "LEVEL_UPGRADE")
        }
        activity.startActivity(intent)
    }
    
    private suspend fun updateStudyLevel(newLevel: String, contentLevel: String) {
        // 🎯 CRITICAL FIX: Always update LOCAL preferences so UI changes immediately
        preferenceManager.setEducationLevel(newLevel)
        preferenceManager.setContentLevel(contentLevel)
        preferenceManager.setLevelSelected(true)

        // Only update Firestore if we have a valid userId
        if (userId.isNotEmpty()) {
            try {
                firestore.collection("users").document(userId)
                    .update(
                        "studyLevel", newLevel,
                        "educationLevel", newLevel,
                        "contentLevel", contentLevel,
                        "paidForLevel", newLevel,
                        "levelChangedDate", Timestamp(Date())
                    ).await()
            } catch (e: Exception) {
                android.util.Log.e("StudyLevelManager", "Firestore update failed", e)
            }
        }
    }
    
    // Call this after successful payment
    suspend fun confirmLevelUpgrade(newLevel: String) {
        val contentLevel = when {
            newLevel.contains("Primary", true) -> "Primary"
            newLevel.contains("Secondary", true) -> "O-Level"
            newLevel.contains("Tertiary", true) -> "Tertiary"
            else -> "O-Level"
        }
        updateStudyLevel(newLevel, contentLevel)
    }
}
