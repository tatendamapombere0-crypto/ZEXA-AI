package com.zexa.aioffline.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.zexa.aioffline.data.PreferenceManager
import com.zexa.aioffline.databinding.FragmentPremiumSettingsBinding
import com.zexa.aioffline.viewmodel.PremiumViewModel
import com.zexa.aioffline.viewmodel.PremiumUiState
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

import android.graphics.Color
import android.content.Intent
import com.zexa.aioffline.data.SubscriptionState
import com.zexa.aioffline.ui.ChatActivity

class PremiumSettingsFragment : Fragment() {
    
    private var _binding: FragmentPremiumSettingsBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: PremiumViewModel by viewModels()
    private lateinit var preferenceManager: PreferenceManager
    private var calculatedAmount: Double = 5.00
    private var educationLevel: String = "O-Level"
    
    private val currentUserId: String
        get() = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.uid ?: "user_default"
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPremiumSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        preferenceManager = com.zexa.aioffline.data.PreferenceManager(requireContext())
        
        setupObservers()
        setupClickListeners()
        
        // BUG 3 FIX: Check for Intent extras from StudyLevelManager first
        val intent = activity?.intent
        val extraLevel = intent?.getStringExtra("STUDY_LEVEL")
        val extraAmount = intent?.getDoubleExtra("AMOUNT", -1.0) ?: -1.0

        viewLifecycleOwner.lifecycleScope.launch {
            if (extraLevel != null && extraAmount > 0) {
                educationLevel = extraLevel
                calculatedAmount = extraAmount
            } else {
                educationLevel = preferenceManager.educationLevel.first() ?: "Secondary Education"
                calculatedAmount = if (educationLevel.contains("Primary")) 4.00 else 5.00
            }
            binding.tvPremiumPrice.text = "$${calculatedAmount.toInt()}"
            
            // ✅ HOLIDAY AUTO-DETECTION: Inform user if they are paying for next term
            val currentPeriod = com.zexa.ai.zimsec.core.TermCalendarManager.getCurrentPeriod()
            if (currentPeriod.id.startsWith("holiday")) {
                val nextTermDate = com.zexa.ai.zimsec.core.TermCalendarManager.getNextTermStart()
                val nextTerm = if (nextTermDate != null) {
                    com.zexa.ai.zimsec.core.TermCalendarManager.getTermsForYear(nextTermDate.year).values.find { it.startDate == nextTermDate }
                } else null
                
                binding.tvPremiumTitle.text = "Pay for ${nextTerm?.name ?: "Next Term"}"
            } else {
                binding.tvPremiumTitle.text = "Upgrade $educationLevel to Premium"
            }
        }
    }
    
    private fun setupObservers() {
        // Observe real-time changes
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.subscriptionState.collectLatest { state ->
                updateSubscriptionUI(state)
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.uiState.collectLatest { state ->
                when (state) {
                    is PremiumUiState.Idle -> {} // Handled by subscriptionState
                    is PremiumUiState.Loading -> showLoading()
                    is PremiumUiState.AlreadyPremium -> showAlreadyPremium()
                    is PremiumUiState.ShowInstructions -> showEcoCashInstructions(state)
                    is PremiumUiState.PaymentSuccess -> {
                        showSuccess(state.message)
                    }
                    is PremiumUiState.Error -> showError(state.message)
                }
            }
        }
    }

    private fun updateSubscriptionUI(state: SubscriptionState) {
        when (state) {
            is SubscriptionState.Loading -> {
                binding.progressBar.visibility = View.VISIBLE
            }
            is SubscriptionState.Success -> {
                binding.progressBar.visibility = View.GONE
                
                val isSubscribedToThisLevel = state.isPremium && state.paidForLevel == educationLevel
                
                if (isSubscribedToThisLevel) {
                    showAlreadyPremium()
                    showHintForPlusButton()
                } else if (state.status == "PENDING_PAYMENT" && state.lastPollUrl.isNotEmpty()) {
                    // ✅ SHOW RECOVER OPTION FOR STUCK PAYMENTS
                    showPendingRecovery(state.lastPollUrl, state.lastReference)
                } else {
                    showPremiumOption()
                }

                // Update term countdown if premium
                if (state.isPremium && state.termExpiry > 0) {
                    val daysLeft = maxOf(0L, (state.termExpiry - System.currentTimeMillis()) / (1000 * 60 * 60 * 24))
                }
            }
            is SubscriptionState.Error -> {
                binding.progressBar.visibility = View.GONE
                showError(state.message)
            }
        }
    }

    private fun showPendingRecovery(pollUrl: String, reference: String) {
        binding.containerPremiumContent.visibility = View.VISIBLE
        binding.containerInstructions.visibility = View.GONE
        
        binding.tvPremiumTitle.text = "Payment in Progress"
        binding.tvPremiumPrice.text = "Checking for transaction: $reference"
        binding.btnUpgradePremium.text = "RE-CHECK STATUS"
        binding.btnUpgradePremium.isEnabled = true
        
        binding.btnUpgradePremium.setOnClickListener {
            viewModel.checkStatus(pollUrl, educationLevel)
        }
    }

    private fun showHintForPlusButton() {
        Toast.makeText(requireContext(), "🎉 Premium Active! Tap the + icon at the top to refresh.", Toast.LENGTH_LONG).show()
        (activity as? ChatActivity)?.highlightNewChatButton()
    }
    
    private fun setupClickListeners() {
        binding.btnUpgradePremium.setOnClickListener {
            val code = binding.etActivationCode.text?.toString()?.trim() ?: ""
            
            if (com.zexa.aioffline.util.OfflineActivationManager.validateCode(code)) {
                activatePremiumLocally()
            } else {
                binding.tilActivationCode.error = "Invalid or expired Action Code"
            }
        }
    }

    private fun activatePremiumLocally() {
        viewLifecycleOwner.lifecycleScope.launch {
            val currentPeriod = com.zexa.ai.zimsec.core.TermCalendarManager.getCurrentPeriod()
            val expiryMillis = currentPeriod.endDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
            
            preferenceManager.setPremiumStatus(true)
            preferenceManager.setTermEndDate(expiryMillis)
            
            // Sync to SharedPreferences for other components that use legacy prefs
            val sp = requireContext().getSharedPreferences("zexa_sub", android.content.Context.MODE_PRIVATE)
            sp.edit().apply {
                putBoolean("has_paid", true)
                putLong("local_term_end_date", expiryMillis)
                apply()
            }
            
            // 🚀 SILICON VALLEY FIX: Immediately notify the UI of the change
            viewModel.refreshStatus()
            
            showSuccess("Premium has been activated successfully for ${currentPeriod.name}!")
            
            // Background sync to Firestore if online (Does not block)
            try {
                val userId = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.uid
                if (userId != null) {
                    val firestore = com.google.firebase.firestore.FirebaseFirestore.getInstance()
                    firestore.collection("users").document(userId).update(
                        mapOf(
                            "isPremium" to true,
                            "termEndDate" to expiryMillis,
                            "subscriptionStatus" to "PREMIUM"
                        )
                    )
                }
            } catch (e: Exception) {
                // Ignore silent sync failures if offline
            }
        }
    }
    
    private fun showPremiumOption() {
        binding.containerPremiumContent.visibility = View.VISIBLE
        binding.containerInstructions.visibility = View.GONE
        binding.progressBar.visibility = View.GONE
        
        binding.tvPremiumTitle.text = "ACTIVATE PREMIUM"
        binding.tvPremiumPrice.text = "$${calculatedAmount.toInt()}"
        binding.btnUpgradePremium.isEnabled = true
        binding.btnUpgradePremium.text = "ACTIVATE PREMIUM NOW"
        
        // Reset to original activation code listener
        setupClickListeners()
    }
    
    private fun showLoading() {
        binding.progressBar.visibility = View.VISIBLE
        binding.btnUpgradePremium.isEnabled = false
        binding.btnUpgradePremium.text = "Processing..."
    }
    
    private fun showAlreadyPremium() {
        binding.containerPremiumContent.visibility = View.VISIBLE
        binding.containerInstructions.visibility = View.GONE
        binding.progressBar.visibility = View.GONE
        
        binding.tvPremiumTitle.text = "✓ Premium Active"
        binding.tvPremiumPrice.text = "Thank you for supporting ZEXA AI!"
        binding.btnUpgradePremium.isEnabled = false
        binding.btnUpgradePremium.text = "Already Subscribed"
    }
    
    private fun showEcoCashInstructions(state: PremiumUiState.ShowInstructions) {
        binding.containerPremiumContent.visibility = View.GONE
        binding.containerInstructions.visibility = View.VISIBLE
        binding.progressBar.visibility = View.GONE
        
        binding.tvInstructionTitle.text = "Complete Payment on EcoCash"
        binding.tvInstructionPhone.text = "To: ${state.phoneNumber}"
        binding.tvInstructionAmount.text = "Amount: $${state.amount.toInt()}"
        binding.tvInstructionReference.text = "Ref: ${state.reference}"
        
        binding.tvInstructionSteps.text = state.instructions
            .replace("\\n", "\n")
            .replace("USSD", "📱 USSD")
            .replace("Enter", "➡️ Enter")
            .replace("Confirm", "✅ Confirm")
        
        binding.tvPollingStatus.text = "Waiting for payment confirmation..."
    }
    
    private fun showSuccess(message: String) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("🎉 Payment Successful!")
            .setMessage(message)
            .setPositiveButton("Continue") { _, _ ->
                viewModel.resetState()
                showHintForPlusButton()
                
                // CRITICAL: Navigate to ChatActivity and clear the stack
                val intent = Intent(requireContext(), com.zexa.aioffline.ui.ChatActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                activity?.finish()
            }
            .setCancelable(false)
            .show()
    }
    
    private fun showError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
        viewModel.resetState()
    }

    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
