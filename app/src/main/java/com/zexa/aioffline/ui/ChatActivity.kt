package com.zexa.aioffline.ui

import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.zexa.ai.ZexaQueryManager
import com.zexa.aioffline.R
import com.zexa.aioffline.databinding.ActivityChatBinding
import com.zexa.aioffline.ui.fragments.PremiumSettingsFragment
import com.zexa.aioffline.ui.fragments.SettingsFragment
import com.zexa.aioffline.ui.fragments.StudyPackFragment
import com.zexa.aioffline.ui.fragments.ExamModeFragment
import com.zexa.aioffline.viewmodel.AIStatus
import com.zexa.aioffline.viewmodel.ChatViewModel
import com.zexa.ai.zimsec.core.DateGuardCore
import com.zexa.ai.zimsec.ui.access.AccessControlViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ChatActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChatBinding
    private val viewModel: ChatViewModel by viewModels()
    private val accessViewModel: AccessControlViewModel by viewModels()
    private lateinit var adapter: ChatAdapter

    private var autoScrollEnabled = true
    private lateinit var auth: FirebaseAuth
    private lateinit var queryManager: ZexaQueryManager

    // ✅ NEW: Professional banner container
    private var offlineBannerContainer: LinearLayout? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ✅ INSTANTLY show UI - NO DELAY, NO BLACK SCREEN
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // ✅ Run security check in background WITHOUT blocking UI
        lifecycleScope.launch {
            val dateCheck = withContext(Dispatchers.IO) {
                DateGuardCore.validateAndSync(this@ChatActivity)
            }

            // Check result on main thread
            if (dateCheck.isTampered || !dateCheck.isValid) {
                // Show lock screen
                setContentView(R.layout.activity_time_locked)
                return@launch
            }

            // Security passed - initialize app
            initializeApp()
        }
    }

    private fun initializeApp() {
        // Ensure hardware acceleration is enabled for the window
        window.addFlags(android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED)

        auth = FirebaseAuth.getInstance()
        queryManager = ZexaQueryManager(this)

        // ✅ MANDATORY ONBOARDING CHECK: Redirect if level not selected
        lifecycleScope.launch {
            val educationLevel = viewModel.preferenceManager.educationLevel.first()
            if (educationLevel.isNullOrBlank()) {
                val intent = Intent(this@ChatActivity, LevelSelectActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
        }

        // ✅ PRIORITY 1: IMMEDIATE AI INITIALIZATION
        viewModel.initModel()

        adapter = ChatAdapter()
        binding.rvChat.adapter = adapter

        // [3] RECYCLERVIEW CONFIG (Stable Layout)
        val layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }
        binding.rvChat.layoutManager = layoutManager
        binding.rvChat.itemAnimator = null
        binding.rvChat.setHasFixedSize(true)

        setupAutoScroll()
        setupMenu()
        setupBottomNav()

        // ✅ SHOW PROFESSIONAL OFFLINE BANNER ON FIRST LOAD
        showOfflineBanner()

        binding.btnSend.setOnClickListener {
            val text = binding.inputField.text.toString().trim()
            if (text.isNotEmpty()) {
                interceptQuery(text)
            }
        }

        binding.btnStop.setOnClickListener { viewModel.cancelGeneration() }
        binding.btnNewChatTop.setOnClickListener { startNewChat() }

        // ✅ DEEP WIPE
        binding.btnNewChatTop.setOnLongClickListener {
            com.google.android.material.dialog.MaterialAlertDialogBuilder(this)
                .setTitle("Developer Tools")
                .setMessage("Advanced system actions for testing.")
                .setPositiveButton("WIPE MODEL") { _, _ ->
                    viewModel.wipeEverythingAndRestart()
                }
                .setNeutralButton("RESET LIMIT") { _, _ ->
                    lifecycleScope.launch {
                        viewModel.preferenceManager.updateOfflineQueryCount(0, SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()))
                        queryManager.resetDailyLimit { Toast.makeText(this@ChatActivity, "Limit Reset Successfully", Toast.LENGTH_SHORT).show() }
                    }
                }
                .setNegativeButton("Cancel", null)
                .show()
            true
        }

        // ✅ OBSERVE AI STATUS
        lifecycleScope.launch {
            viewModel.aiStatus.collectLatest { status ->
                when (status) {
                    AIStatus.INITIALIZING -> {
                        binding.inputField.isEnabled = false
                        binding.btnSend.isEnabled = false
                    }
                    AIStatus.READY -> {
                        binding.inputField.isEnabled = true
                        binding.btnSend.isEnabled = true
                        updateAccessSubtitle()
                    }
                    AIStatus.ERROR -> {
                        binding.inputField.isEnabled = false
                        binding.btnSend.isEnabled = false
                        binding.tvToolbarSubtitle.text = "AI System Error"
                        binding.tvToolbarSubtitle.setTextColor(ContextCompat.getColor(this@ChatActivity, R.color.error))
                        Toast.makeText(this@ChatActivity, "AI System failed to start. Please check your storage or redownload the model.", Toast.LENGTH_LONG).show()
                    }
                    else -> {
                        binding.inputField.isEnabled = true
                        binding.btnSend.isEnabled = true
                    }
                }
            }
        }

        lifecycleScope.launch {
            viewModel.modelStatus.collectLatest { status ->
                if (viewModel.aiStatus.value != AIStatus.READY) {
                    binding.tvToolbarSubtitle.text = status
                }
            }
        }

        lifecycleScope.launch {
            viewModel.messages.collect { messages ->
                adapter.submitList(messages) {
                    if (messages.isNotEmpty() && viewModel.isGenerating.value) {
                        scrollToBottomIfNeeded()
                    }
                }
                updateEmptyState(messages.isEmpty())
            }
        }

        lifecycleScope.launch {
            viewModel.isGenerating.collectLatest { isGenerating ->
                binding.btnSend.visibility = if (isGenerating) View.GONE else View.VISIBLE
                binding.btnStop.visibility = if (isGenerating) View.VISIBLE else View.GONE
            }
        }

        lifecycleScope.launch {
            viewModel.questionsUsedToday.collectLatest { count ->
                updateAccessSubtitle()
            }
        }

        lifecycleScope.launch {
            viewModel.dailyLimit.collectLatest { limit ->
                updateAccessSubtitle()
            }
        }

        lifecycleScope.launch {
            viewModel.subscriptionState.collectLatest { state ->
                if (state is com.zexa.aioffline.data.SubscriptionState.Success) {
                    updateAccessSubtitle()
                }
            }
        }

        lifecycleScope.launch {
            viewModel.isSessionValid.collectLatest { isValid ->
                if (!isValid) {
                    handleSessionExpired()
                }
            }
        }
    }

    // ✅ PROFESSIONAL BANNER WITH CIRCULAR DESIGN
    private fun showOfflineBanner() {
        if (binding.fragmentContainer.visibility == View.VISIBLE) return
        
        // ✅ ONLY SHOW ON EMPTY CHAT: Prevents overlapping with existing messages
        if (adapter.itemCount > 0) {
            offlineBannerContainer?.visibility = View.GONE
            return
        }

        if (offlineBannerContainer != null) {
            offlineBannerContainer?.visibility = View.VISIBLE
            return
        }

        // Main container with high-tech Silicon Valley style (Classic View)
        offlineBannerContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(40, 32, 40, 32)

            // Sleek Dark Background with Cyan Border
            val background = GradientDrawable()
            background.setColor(ContextCompat.getColor(this@ChatActivity, R.color.primary_dark))
            background.cornerRadius = 24f
            background.setStroke(2, ContextCompat.getColor(this@ChatActivity, R.color.accent_cyan))
            this.background = background

            this.elevation = 8f
        }

        // Professional Modern Typography (Classic Scale)
        val titleText = TextView(this).apply {
            text = "AM ZEXA AI your OFFLINE EXPERT AI. Ask me anything you study. Be Specific in the area you want to research, some words are Universal. LETS BEGIN 🎓"
            textSize = 15f
            setTextColor(ContextCompat.getColor(this@ChatActivity, android.R.color.white))
            gravity = Gravity.CENTER
            typeface = android.graphics.Typeface.create("sans-serif", android.graphics.Typeface.NORMAL)
            setLineSpacing(0f, 1.2f)
            
            // Subtle neon glow
            setShadowLayer(6f, 0f, 0f, ContextCompat.getColor(this@ChatActivity, R.color.accent_cyan))
        }

        offlineBannerContainer?.addView(titleText)

        // Add to root layout
        val rootLayout = binding.root
        if (rootLayout is ConstraintLayout) {
            val layoutParams = ConstraintLayout.LayoutParams(
                ConstraintLayout.LayoutParams.MATCH_PARENT,
                ConstraintLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topToTop = ConstraintLayout.LayoutParams.PARENT_ID
                bottomToBottom = ConstraintLayout.LayoutParams.PARENT_ID
                startToStart = ConstraintLayout.LayoutParams.PARENT_ID
                endToEnd = ConstraintLayout.LayoutParams.PARENT_ID
                marginStart = 64
                marginEnd = 64
            }
            offlineBannerContainer?.layoutParams = layoutParams
            rootLayout.addView(offlineBannerContainer)
        }
    }

    private fun handleSessionExpired() {
        auth.signOut()
        val intent = Intent(this, AuthActivity::class.java)
        intent.putExtra("logout_message", "Account active on another device. Logged out.")
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    override fun onStart() {
        super.onStart()

        // ✅ SYNC LOCAL SUBSCRIPTION FLAGS
        lifecycleScope.launch {
            try {
                if (viewModel.preferenceManager.isPremium.first()) {
                    val sp = this@ChatActivity.getSharedPreferences("zexa_sub", android.content.Context.MODE_PRIVATE)
                    val expiry = viewModel.preferenceManager.termEndDate.first()
                    sp.edit().apply {
                        putBoolean("has_paid", true)
                        if (expiry > 0) putLong("local_term_end_date", expiry)
                        apply()
                    }
                }
            } catch (e: Exception) {}
        }

        updateAccessSubtitle()
    }

    override fun onResume() {
        super.onResume()
        updateHeaderFromLocalStatus()
        // Background sync
        viewModel.syncSubscriptionFromServer()
        viewModel.checkUserStatus()

        // ✅ Only show if we are in chat mode (not in settings) and chat is empty
        // ✅ Check if adapter is initialized to avoid UninitializedPropertyAccessException
        if (binding.fragmentContainer.visibility != View.VISIBLE && 
            ::adapter.isInitialized && adapter.itemCount == 0) {
            showOfflineBanner()
        } else {
            offlineBannerContainer?.visibility = View.GONE
        }
    }

    private fun updateHeaderFromLocalStatus() {
        // Only update subtitle with subscription info if AI is READY
        // Otherwise, we want to see "Starting AI..." or "Error" status
        if (viewModel.aiStatus.value != AIStatus.READY) return

        val status = com.zexa.ai.zimsec.ui.access.LocalSubscriptionManager.getCurrentStatus(this)

        when (status) {
            com.zexa.ai.zimsec.ui.access.SubscriptionStatus.PREMIUM -> {
                binding.tvToolbarTitle.text = "ZEXA AI"
                binding.tvToolbarSubtitle.text = "Unlimited Access"
                binding.tvToolbarSubtitle.setTextColor(ContextCompat.getColor(this, R.color.accent_cyan))
            }
            com.zexa.ai.zimsec.ui.access.SubscriptionStatus.HOLIDAY_FREE -> {
                binding.tvToolbarTitle.text = "ZEXA AI"
                binding.tvToolbarSubtitle.text = "Holiday Free Access"
                binding.tvToolbarSubtitle.setTextColor(ContextCompat.getColor(this, R.color.accent_cyan))
            }
            com.zexa.ai.zimsec.ui.access.SubscriptionStatus.FREE -> {
                binding.tvToolbarTitle.text = "ZEXA AI"
                val count = viewModel.questionsUsedToday.value
                val limit = viewModel.dailyLimit.value
                
                if (com.zexa.ai.zimsec.core.TermCalendarManager.isHolidayPeriod()) {
                    binding.tvToolbarSubtitle.text = "Holiday Basic ($count/$limit)"
                    binding.tvToolbarSubtitle.setTextColor(ContextCompat.getColor(this, R.color.primary_light))
                } else {
                    binding.tvToolbarSubtitle.text = "Free User ($count/$limit)"
                    binding.tvToolbarSubtitle.setTextColor(ContextCompat.getColor(this@ChatActivity, R.color.primary_light))
                }
            }
        }
    }

    private fun updateAccessSubtitle() {
        updateHeaderFromLocalStatus()
    }

    private fun interceptQuery(question: String) {
        // ✅ HIDE BANNER WHEN USER SENDS MESSAGE
        offlineBannerContainer?.visibility = View.GONE

        if (viewModel.aiStatus.value != AIStatus.READY) {
            Toast.makeText(this, "AI ENGINE IS INITIALIZING", Toast.LENGTH_SHORT).show()
            return
        }

        if (!viewModel.isSessionValid.value) {
            handleSessionExpired()
            return
        }

        lifecycleScope.launch(Dispatchers.Main) {
            binding.inputField.isEnabled = false
            binding.btnSend.isEnabled = false

            val result = withContext(Dispatchers.IO) {
                queryManager.verifyZexaAccessRulesAsync()
            }

            binding.inputField.isEnabled = true
            binding.btnSend.isEnabled = true

            when (result) {
                is ZexaQueryManager.ZexaAccessResult.Granted -> {
                    viewModel.sendMessage(question, result.remainingFreeQuestions == 0 && !result.isPremium)
                    binding.inputField.text.clear()
                    viewModel.checkUserStatus()
                }
                is ZexaQueryManager.ZexaAccessResult.Denied -> {
                    showUpgradeDialog(result.title, result.reason, result.showEcoCashButton)
                    binding.inputField.setText(question)
                }
            }
        }
    }

    private fun showUpgradeDialog(title: String, reason: String, showEcoCashButton: Boolean) {
        val builder = AlertDialog.Builder(this)
        builder.setTitle(title)
        builder.setMessage(reason)
        if (showEcoCashButton) {
            builder.setPositiveButton("PAY NOW") { _, _ -> showFragment(PremiumSettingsFragment()) }
            builder.setNegativeButton("Dismiss", null)
        } else {
            builder.setPositiveButton("OK", null)
        }
        builder.show()
    }

    private fun setupAutoScroll() {
        binding.rvChat.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                super.onScrolled(recyclerView, dx, dy)
                val canScrollDown = recyclerView.canScrollVertically(1)
                if (!canScrollDown) {
                    autoScrollEnabled = true
                } else if (dy < 0) {
                    autoScrollEnabled = false
                }
            }
        })
    }

    private fun scrollToBottomIfNeeded() {
        if (autoScrollEnabled) {
            binding.rvChat.post {
                binding.rvChat.scrollToPosition(adapter.itemCount - 1)
            }
        }
    }

    private fun updateEmptyState(isEmpty: Boolean) {
        // Function simplified
    }

    private fun startNewChat() {
        hideFragmentHost()
        viewModel.clearChat()
        // ✅ SHOW BANNER WHEN REFRESHING CHAT
        showOfflineBanner()
    }

    private fun setupMenu() {
        binding.btnMenu.setOnClickListener {
            showFragment(SettingsFragment())
        }
    }

    // 🎯 NEW: Study Pack / Exam Mode used to live behind one toolbar icon that
    // opened a MaterialAlertDialogBuilder chooser. That's gone now - the three
    // main sections (Chat / Study Pack / Exam Mode) are each a direct tap on
    // the persistent bottom nav instead, which is faster to navigate and keeps
    // the current section visible/selected at all times.
    private fun setupBottomNav() {
        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_chat -> {
                    hideFragmentHost()
                    true
                }
                R.id.nav_study_pack -> {
                    showFragment(StudyPackFragment())
                    true
                }
                R.id.nav_exam_mode -> {
                    showFragment(ExamModeFragment())
                    true
                }
                else -> false
            }
        }

        // 🎯 NEW: Study Pack and Exam Mode only have content for Primary/O-Level/
        // A-Level (per LocalKnowledgeStore/ExamBankStore's level tags) - nothing
        // exists yet for Tertiary. Rather than showing two tabs that always come
        // up empty, Tertiary users get the whole bottom nav hidden and a
        // full-screen chat, per what was asked for. If a Tertiary user is
        // somehow already sitting on Study Pack/Exam Mode when their level
        // resolves (or changes), bounce them back to chat so they're not
        // stranded on a screen they can no longer navigate away from via the nav.
        lifecycleScope.launch {
            viewModel.preferenceManager.educationLevel.collect { tier ->
                val isTertiary = tier == "Tertiary Education"
                binding.bottomNav.visibility = if (isTertiary) View.GONE else View.VISIBLE
                if (isTertiary && binding.fragmentContainer.visibility == View.VISIBLE) {
                    hideFragmentHost()
                }
            }
        }
    }

    /** Called by fragments hosted in fragmentContainer (Study Pack, Exam Mode, Settings)
     *  to return to the normal chat view - e.g. after tapping an exam question. */
    fun returnToChat() {
        hideFragmentHost()
    }

    private fun showFragment(fragment: Fragment) {
        binding.rvChat.visibility = View.GONE
        binding.inputContainer.visibility = View.GONE
        binding.fragmentContainer.visibility = View.VISIBLE
        
        // Ensure banner is hidden in settings
        offlineBannerContainer?.visibility = View.GONE

        binding.tvToolbarTitle.text = "System"
        binding.tvToolbarSubtitle.visibility = View.GONE

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    private var isNavigating = false
    private fun hideFragmentHost() {
        if (isNavigating) return
        isNavigating = true
        try {
            binding.fragmentContainer.visibility = View.GONE
            binding.rvChat.visibility = View.VISIBLE
            binding.inputContainer.visibility = View.VISIBLE
            binding.tvToolbarTitle.text = "ZEXA AI"
            binding.tvToolbarSubtitle.visibility = View.VISIBLE
            // 🎯 FIX: Prevent infinite recursion. Only set selectedItemId if it's not already correct.
            if (binding.bottomNav.selectedItemId != R.id.nav_chat) {
                binding.bottomNav.selectedItemId = R.id.nav_chat
            }
        } finally {
            isNavigating = false
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (binding.fragmentContainer.visibility == View.VISIBLE) {
            val fragment = supportFragmentManager.findFragmentById(R.id.fragmentContainer)
            
            // 🚀 SILICON VALLEY NAV FIX: Let fragments handle internal back navigation
            if (fragment is StudyPackFragment) {
                if (fragment.canHandleBack()) {
                    fragment.handleBackInternal()
                    return
                }
            } else if (fragment is ExamModeFragment) {
                if (fragment.canHandleBack()) {
                    fragment.handleBackInternal()
                    return
                }
            }

            hideFragmentHost()
        } else {
            super.onBackPressed()
        }
    }

    fun highlightNewChatButton() {
        runOnUiThread {
            val snackbar = com.google.android.material.snackbar.Snackbar.make(
                binding.root,
                "Premium Active! Tap + to refresh your session",
                com.google.android.material.snackbar.Snackbar.LENGTH_INDEFINITE
            )

            // Center the Snackbar in the middle of the screen
            val snackbarView = snackbar.view
            val params = snackbarView.layoutParams
            if (params is CoordinatorLayout.LayoutParams) {
                params.gravity = Gravity.CENTER
                snackbarView.layoutParams = params
            }

            // Optional: Add some styling
            snackbarView.setBackgroundResource(R.color.primary_dark)

            snackbar.setAction("REFRESH") {
                startNewChat()
            }.show()
        }
    }

    private fun setupSuggestions() {
        // Removed for performance
    }
}