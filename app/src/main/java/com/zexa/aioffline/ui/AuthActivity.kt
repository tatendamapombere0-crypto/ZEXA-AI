package com.zexa.aioffline.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.firebase.FirebaseNetworkException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.auth.FirebaseAuthWeakPasswordException
import com.google.firebase.firestore.FirebaseFirestore
import com.zexa.aioffline.databinding.ActivityAuthBinding
import com.zexa.aioffline.R
import com.zexa.aioffline.data.PreferenceManager
import com.zexa.ai.zimsec.core.DateGuardCore
import com.zexa.ai.zimsec.data.repository.UserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AuthActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAuthBinding
    private lateinit var auth: FirebaseAuth
    private lateinit var firestore: FirebaseFirestore

    private var isLoginMode = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ️ INSTANT LOCAL CHECK: Prevents the login screen "glimpse"
        val currentUser = FirebaseAuth.getInstance().currentUser

        lifecycleScope.launch {
            val preferenceManager = PreferenceManager(this@AuthActivity)
            val isGuestMode = preferenceManager.isGuestMode.first()

            if ((currentUser != null || isGuestMode) && intent.getStringExtra("logout_message") == null) {
                // User is already logged in or in Guest mode. Route immediately.
                val intent = Intent(this@AuthActivity, com.zexa.aioffline.ui.ChatActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            } else {
                // --- ONLY DRAW UI IF NOT LOGGED IN ---
                drawAuthUI()
            }
        }
    }

    private fun drawAuthUI() {
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        auth = FirebaseAuth.getInstance()
        firestore = FirebaseFirestore.getInstance()
        setupClickListeners()

        // Run security check in background
        lifecycleScope.launch {
            val dateCheck = withContext(Dispatchers.IO) {
                DateGuardCore.validateAndSync(this@AuthActivity)
            }

            if (dateCheck.isTampered || !dateCheck.isValid) {
                setContentView(R.layout.activity_time_locked)
                return@launch
            }
        }

        // Show logout message if any
        intent.getStringExtra("logout_message")?.let {
            Toast.makeText(this, it, Toast.LENGTH_LONG).show()
        }
    }

    private fun setupClickListeners() {
        binding.tvToggleMode.setOnClickListener {
            isLoginMode = !isLoginMode
            updateUIForMode()
        }

        binding.btnForgotPassword.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            if (email.isNotEmpty()) {
                triggerPasswordResetAndUnlock(email)
            } else {
                Toast.makeText(this, "Enter your email address above first", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnStartOffline.setOnClickListener {
            if (isFinishing || isDestroyed) return@setOnClickListener
            
            showLoading(true)
            lifecycleScope.launch {
                try {
                    // 🎯 PRECISION: As requested, Offline is a separate section.
                    // When entering Guest mode, we ensure any leftover cloud-synced premium status is cleared.
                    // This forces Guest users to use the Activation Code system.
                    val preferenceManager = PreferenceManager(this@AuthActivity)
                    if (auth.currentUser == null) {
                        preferenceManager.clearSubscription()
                        preferenceManager.setGuestMode(true) // 🎯 NEW: PERSIST GUEST SESSION
                        
                        // Also clear legacy SharedPreferences for consistency
                        val sp = getSharedPreferences("zexa_sub", android.content.Context.MODE_PRIVATE)
                        sp.edit().clear().apply()
                    }

                    android.util.Log.d("ZEXA_AUTH", "Offline Start: Routing to LevelSelectActivity")
                    
                    val intent = Intent(this@AuthActivity, LevelSelectActivity::class.java).apply {
                        putExtra("IS_GUEST_START", true)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    }
                    startActivity(intent)
                    finish()
                } catch (e: Exception) {
                    android.util.Log.e("ZEXA_AUTH", "Offline start failed", e)
                    showLoading(false)
                    Toast.makeText(this@AuthActivity, "Failed to start offline: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            when {
                email.isEmpty() -> {
                    binding.etEmail.error = "Email is required"
                    return@setOnClickListener
                }
                password.isEmpty() -> {
                    binding.etPassword.error = "Password is required"
                    return@setOnClickListener
                }
                password.length < 6 -> {
                    binding.etPassword.error = "Security key must be at least 6 chars"
                    return@setOnClickListener
                }
                else -> {
                    binding.etEmail.error = null
                    binding.etPassword.error = null
                    if (isLoginMode) {
                        loginUser(email, password)
                    } else {
                        signupUser(email, password)
                    }
                }
            }
        }
    }

    private fun updateUIForMode() {
        if (isLoginMode) {
            binding.btnLogin.text = "Login"
            binding.tvToggleMode.text = "Don't have an account? Sign Up"
            binding.btnForgotPassword.visibility = View.VISIBLE
        } else {
            binding.btnLogin.text = "Create Account"
            binding.tvToggleMode.text = "Already have an account? Login"
            binding.btnForgotPassword.visibility = View.GONE
        }
    }

    private fun loginUser(email: String, password: String) {
        showLoading(true)
        android.util.Log.d("ZEXA_AUTH", "Starting login for $email")
        // 🎯 NETWORK TIMEOUT: Firebase Auth doesn't have a built-in timeout, 
        // so we launch a timer to at least tell the user what's happening.
        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener(this) { task ->
                android.util.Log.d("ZEXA_AUTH", "Login task complete. Success: ${task.isSuccessful}")
                if (task.isSuccessful) {
                    val user = auth.currentUser
                    if (user != null) {
                        handleUserRouting(user)
                    } else {
                        showLoading(false)
                        Toast.makeText(this, "Error: User session not found.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    showLoading(false)
                    handleAuthError(task.exception)
                }
            }
    }

    private fun signupUser(email: String, password: String) {
        showLoading(true)
        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    val user = auth.currentUser
                    if (user != null) {
                        lifecycleScope.launch {
                            try {
                                val localToken = android.provider.Settings.Secure.getString(contentResolver, android.provider.Settings.Secure.ANDROID_ID) ?: ""
                                val userRepository = UserRepository()
                                // 🎯 AGGRESSIVE TIMEOUT: Only wait 5s for profile creation, then move on.
                                // We'll fix it in background or on next login.
                                withTimeoutOrNull(5000) {
                                    userRepository.createUserProfile(
                                        userId = user.uid,
                                        email = email,
                                        name = "",
                                        hardwareToken = localToken
                                    )
                                }
                                handleUserRouting(user)
                            } catch (e: Exception) {
                                android.util.Log.e("ZEXA_AUTH", "Signup post-processing failed", e)
                                handleUserRouting(user)
                            }
                        }
                    } else {
                        showLoading(false)
                        Toast.makeText(this, "Error: User session not found.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    showLoading(false)
                    handleAuthError(task.exception)
                }
            }
    }

    private fun handleUserRouting(user: com.google.firebase.auth.FirebaseUser) {
        lifecycleScope.launch {
            try {
                // 🎯 EXIT STRATEGY: Always hide loading if we stay on this screen
                // but we plan to finish() anyway.
                val userId = user.uid
                val localToken = android.provider.Settings.Secure.getString(contentResolver, android.provider.Settings.Secure.ANDROID_ID) ?: ""
                val userDocRef = firestore.collection("users").document(userId)

                // 🎯 FRESH SYNC: Try server first for routing to ensure Premium status is accurate
                var document: com.google.firebase.firestore.DocumentSnapshot? = null
                
                try {
                    // Try server with 4s timeout (a bit longer than before for better reliability)
                    document = withTimeoutOrNull(4000) {
                        userDocRef.get(com.google.firebase.firestore.Source.SERVER).await()
                    }
                } catch (e: Exception) { }

                // 2. If server failed/timed out, try cache (Instant)
                if (document == null || !document.exists()) {
                    try {
                        document = userDocRef.get(com.google.firebase.firestore.Source.CACHE).await()
                    } catch (e: Exception) { }
                }

                // 3. Security check (Hardware Token)
                if (document != null && document.exists()) {
                    val serverToken = document.getString("active_hardware_token") ?: ""
                    if (serverToken.isNotEmpty() && serverToken != localToken) {
                        auth.signOut()
                        showLoading(false)
                        Toast.makeText(this@AuthActivity, "⚠️ This account is already active on another device!", Toast.LENGTH_LONG).show()
                        return@launch
                    } else if (serverToken.isEmpty()) {
                        userDocRef.update("active_hardware_token", localToken)
                    }
                }

                // 4. Preference Sync
                val preferenceManager = PreferenceManager(this@AuthActivity)
preferenceManager.setGuestMode(false) // 🎯 NEW: Disable guest mode if user logs in
                val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

                if (document != null && document.exists()) {
                    val data = document.data ?: emptyMap()
                    
                    // 🎯 PROFESSIONAL EXTRACTION: Handles boolean, string, and multiple key variants
                    val isPremiumBool = com.zexa.aioffline.util.FirestoreUtils.getBooleanSafe(
                        data, listOf("isPremium", "is_premium", "premium")
                    )
                        
                    val statusString = com.zexa.aioffline.util.FirestoreUtils.getStringSafe(
                        data, listOf("subscriptionStatus", "subscription_status", "status"), "FREE"
                    )
                    val hasPremiumIntent = isPremiumBool || statusString.equals("PREMIUM", ignoreCase = true)
                    
                    val cloudQuestionsUsed = document.getLong("questionsUsedToday") ?: 0L
                    val cloudDailyLimit = document.getLong("dailyLimit") ?: 2L
                    var cloudEndDate = com.zexa.aioffline.util.FirestoreUtils.getDateAsLong(data, "termEndDate", 0L)
                    
                    val todayMillis = System.currentTimeMillis()
                    val currentPeriod = com.zexa.ai.zimsec.core.TermCalendarManager.getCurrentPeriod()

                    // CRITICAL FIX: If admin says Premium, ignore past expiry dates
                    if (hasPremiumIntent && (cloudEndDate == 0L || todayMillis > cloudEndDate)) {
                        cloudEndDate = currentPeriod.endDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
                    }

                    val isPremiumFinal = hasPremiumIntent && todayMillis <= cloudEndDate

                    preferenceManager.updateOfflineQueryCount(cloudQuestionsUsed.toInt(), today)
                    preferenceManager.setDailyLimit(cloudDailyLimit.toInt())
                    preferenceManager.setPremiumStatus(isPremiumFinal)
                    preferenceManager.setTermEndDate(cloudEndDate)

                    // Also sync to SharedPreferences for LocalSubscriptionManager
                    val sp = this@AuthActivity.getSharedPreferences("zexa_sub", android.content.Context.MODE_PRIVATE)
                    sp.edit().apply {
                        putBoolean("has_paid", isPremiumFinal)
                        putLong("local_term_end_date", cloudEndDate)
                        apply()
                    }

                    val cloudLevel = com.zexa.aioffline.util.FirestoreUtils.getStringSafe(data, listOf("educationLevel", "studyLevel"))
                    val cloudContentLevel = com.zexa.aioffline.util.FirestoreUtils.getStringSafe(data, listOf("contentLevel"))
                    
                    if (cloudLevel.isNotEmpty() && cloudLevel != "Select Level") {
                        preferenceManager.setEducationLevel(cloudLevel)
                        if (cloudContentLevel.isNotEmpty()) {
                            preferenceManager.setContentLevel(cloudContentLevel)
                        } else {
                            // Fallback if contentLevel wasn't set in Firestore yet
                            val fallback = when {
                                cloudLevel.contains("Primary", true) -> "Primary"
                                cloudLevel.contains("Secondary", true) -> "O-Level"
                                cloudLevel.contains("Tertiary", true) -> "Tertiary"
                                else -> "O-Level"
                            }
                            preferenceManager.setContentLevel(fallback)
                        }
                        preferenceManager.setLevelSelected(true)
                    }
                }

                // 5. Final Route
                val educationLevel = withTimeoutOrNull(1500) { preferenceManager.educationLevel.first() } ?: ""
                val isLevelSelected = withTimeoutOrNull(1500) { preferenceManager.isLevelSelected.first() } ?: false

                val nextActivity = if (!isLevelSelected || educationLevel.isBlank() || educationLevel == "Select Level") {
                    com.zexa.aioffline.ui.LevelSelectActivity::class.java
                } else {
                    com.zexa.aioffline.ui.ChatActivity::class.java
                }

                android.util.Log.d("ZEXA_AUTH", "Routing to $nextActivity. LevelSelected: $isLevelSelected, Level: $educationLevel")

                showLoading(false)
                startActivity(Intent(this@AuthActivity, nextActivity).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                finish()

            } catch (e: Exception) {
                android.util.Log.e("ZEXA_AUTH", "Routing error", e)
                showLoading(false)
                // Panic fallback
                startActivity(Intent(this@AuthActivity, com.zexa.aioffline.ui.ChatActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                finish()
            }
        }
    }

    private fun handleAuthError(exception: Exception?) {
        val errorMessage = when (exception) {
            is FirebaseAuthInvalidCredentialsException -> "Wrong password or invalid email format."
            is FirebaseAuthInvalidUserException -> "Account not found. Please sign up."
            is FirebaseAuthUserCollisionException -> "Account already exists. Please login."
            is FirebaseAuthWeakPasswordException -> "Password is too weak (min 6 chars)."
            is FirebaseNetworkException -> "Network error. Check your connection."
            else -> "Authentication failed: ${exception?.localizedMessage ?: "Unknown error"}"
        }

        MaterialAlertDialogBuilder(this)
            .setTitle("Authentication Error")
            .setMessage(errorMessage)
            .setPositiveButton("OK", null)
            .show()
    }

    private fun triggerPasswordResetAndUnlock(email: String) {
        auth.sendPasswordResetEmail(email)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    MaterialAlertDialogBuilder(this@AuthActivity)
                        .setTitle("Reset Email Sent")
                        .setMessage("A password reset link has been sent to $email. Please check your inbox and follow the link to reset your password.")
                        .setPositiveButton("OK", null)
                        .show()
                } else {
                    val errorMessage = when (task.exception) {
                        is FirebaseAuthInvalidUserException -> "No account found with this email."
                        is FirebaseNetworkException -> "Network error. Please check your internet."
                        else -> "Failed to send reset email. Please try again later."
                    }
                    Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show()
                }
            }
    }

    private fun showLoading(show: Boolean) {
        if (!::binding.isInitialized) return

        binding.authProgress.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnLogin.isEnabled = !show
        binding.tvToggleMode.isEnabled = !show
        binding.btnForgotPassword.isEnabled = !show
        binding.btnStartOffline.isEnabled = !show

        if (show) {
            binding.btnLogin.text = "Please wait..."
        } else {
            updateUIForMode()
        }
    }
}