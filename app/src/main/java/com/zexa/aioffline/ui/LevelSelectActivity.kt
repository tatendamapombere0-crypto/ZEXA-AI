package com.zexa.aioffline.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.zexa.ai.zimsec.core.DateGuardCore
import com.zexa.aioffline.data.PreferenceManager
import com.zexa.aioffline.data.SubscriptionManager
import com.zexa.aioffline.data.StudyLevelManager
import com.zexa.aioffline.databinding.ActivityLevelSelectBinding
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class LevelSelectActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLevelSelectBinding
    private lateinit var preferenceManager: PreferenceManager
    private lateinit var auth: FirebaseAuth
    private lateinit var subscriptionManager: SubscriptionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // BUG FIX: Set content view immediately to avoid blank screen during network check
        binding = ActivityLevelSelectBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        auth = FirebaseAuth.getInstance()
        preferenceManager = PreferenceManager(this)
        subscriptionManager = SubscriptionManager(FirebaseFirestore.getInstance(), this)

        // 📅 Date Guard Sync
        try {
            val status = DateGuardCore.validateAndSync(this)
            if (status.isTampered) {
                Toast.makeText(this, status.message, Toast.LENGTH_LONG).show()
                finishAffinity()
                return
            }
        } catch (e: Exception) {
            android.util.Log.e("LevelSelect", "DateGuard check failed", e)
        }

        // ✅ AUTO-ROUTING & SUBSCRIPTION ENFORCEMENT
        lifecycleScope.launch {
            val userId = auth.currentUser?.uid
            if (userId != null) {
                // ENFORCE TERM EXPIRY ON STARTUP
                subscriptionManager.checkAndEnforceTermExpiry(userId)
            }

            val isUpgradeMode = intent.getBooleanExtra("IS_UPGRADE_MODE", false)
            val isGuestStart = intent.getBooleanExtra("IS_GUEST_START", false)
            
            // 🎯 PRECISION FIX: If we are in Guest Start, we MUST stay here to let user pick level.
            // Only auto-route if we are NOT in upgrade mode and NOT in guest start mode.
            if (!isUpgradeMode && !isGuestStart) {
                val isLevelSelected = preferenceManager.isLevelSelected.first()
                val isModelDownloaded = preferenceManager.isModelDownloaded.first()
                
                if (isLevelSelected && isModelDownloaded) {
                    startActivity(Intent(this@LevelSelectActivity, ChatActivity::class.java))
                    finish()
                    return@launch
                } else if (isLevelSelected && !isModelDownloaded) {
                    startActivity(Intent(this@LevelSelectActivity, ModelSelectionActivity::class.java))
                    finish()
                    return@launch
                }
            }
            setupUIListeners()
        }
    }

    private fun setupUIListeners() {
        binding.btnPrimary.setOnClickListener { selectLevel("Primary Education", "Primary") }
        binding.btnSecondary.setOnClickListener {
            binding.layoutMainSelection.visibility = View.GONE
            binding.layoutSecondarySelection.visibility = View.VISIBLE
        }
        binding.btnTertiary.setOnClickListener { selectLevel("Tertiary Education", "Tertiary") }
        binding.btnOLevel.setOnClickListener { selectLevel("Secondary Education", "O-Level") }
        binding.btnALevel.setOnClickListener { selectLevel("Secondary Education", "A-Level") }
        binding.btnBack.setOnClickListener {
            if (binding.layoutSecondarySelection.visibility == View.VISIBLE) {
                binding.layoutSecondarySelection.visibility = View.GONE
                binding.layoutMainSelection.visibility = View.VISIBLE
            } else {
                finish()
            }
        }
    }

    private fun selectLevel(level: String, contentLevel: String) {
        val userId = auth.currentUser?.uid ?: "" // 🎯 PRECISION: Allow empty for Guests
        val isUpgradeMode = intent.getBooleanExtra("IS_UPGRADE_MODE", false)

        lifecycleScope.launch {
            if (isUpgradeMode && userId.isNotEmpty()) {
                // FROM SETTINGS: ENFORCE UPGRADE LOCK (Logged In)
                val studyLevelManager = StudyLevelManager(FirebaseFirestore.getInstance(), userId, this@LevelSelectActivity)
                studyLevelManager.attemptLevelChange(level, this@LevelSelectActivity)
            } else {
                // GUEST MODE or FIRST TIME REGISTRATION
                preferenceManager.setEducationLevel(level)
                preferenceManager.setContentLevel(contentLevel)
                preferenceManager.setLevelSelected(true)
                
                // Save to Firestore ONLY if logged in
                if (userId.isNotEmpty()) {
                    try {
                        FirebaseFirestore.getInstance().collection("users").document(userId)
                            .update("studyLevel", level, "educationLevel", level, "contentLevel", contentLevel)
                    } catch (e: Exception) {}
                }
                
                // Navigate to next screen
                val isModelDownloaded = preferenceManager.isModelDownloaded.first()
                if (isModelDownloaded) {
                    startActivity(Intent(this@LevelSelectActivity, ChatActivity::class.java))
                } else {
                    startActivity(Intent(this@LevelSelectActivity, ModelSelectionActivity::class.java))
                }
                finish()
            }
        }
    }
}
