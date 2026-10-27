package com.zexa.aioffline.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.zexa.ai.zimsec.core.TermCalendarManager
import com.zexa.ai.zimsec.data.repository.AccessControlRepository
import com.zexa.ai.zimsec.data.repository.UserRepository
import com.zexa.aioffline.data.SubscriptionManager
import com.zexa.aioffline.data.SubscriptionRepository
import com.zexa.aioffline.data.SubscriptionState
import com.zexa.aioffline.data.paynow.PaynowRepository
import com.zexa.aioffline.data.paynow.PaymentResult
import com.zexa.aioffline.data.paynow.PaymentStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.time.LocalDate

sealed class PremiumUiState {
    object Idle : PremiumUiState()
    object Loading : PremiumUiState()
    object AlreadyPremium : PremiumUiState()
    
    data class ShowInstructions(
        val instructions: String,
        val phoneNumber: String,
        val amount: Double,
        val reference: String
    ) : PremiumUiState()
    
    data class PaymentSuccess(val message: String) : PremiumUiState()
    data class Error(val message: String) : PremiumUiState()
}

class PremiumViewModel(application: Application) : AndroidViewModel(application) {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val subscriptionRepository = SubscriptionRepository(context = application)
    private val paynowRepository = PaynowRepository()
    private val subscriptionManager = SubscriptionManager(firestore, application)
    private val preferenceManager = com.zexa.aioffline.data.PreferenceManager(application)
    
    private val _uiState = MutableStateFlow<PremiumUiState>(PremiumUiState.Idle)
    val uiState: StateFlow<PremiumUiState> = _uiState.asStateFlow()

    private val _subscriptionState = MutableStateFlow<SubscriptionState>(SubscriptionState.Loading)
    val subscriptionState: StateFlow<SubscriptionState> = _subscriptionState.asStateFlow()

    init {
        observeSubscription()
    }

    private fun observeSubscription() {
        viewModelScope.launch {
            subscriptionRepository.observeSubscriptionStatus().collect { state ->
                _subscriptionState.value = state
                if (state is SubscriptionState.Success) {
                    preferenceManager.setPremiumStatus(state.isPremium)
                    // Sync the study level to local preferences immediately
                    state.intelLevel.takeIf { it.isNotEmpty() }?.let {
                        preferenceManager.setEducationLevel(it)
                    }
                }
            }
        }
    }

    fun initiatePayment(
        userId: String,
        phoneNumber: String,
        educationLevel: String
    ) {
        viewModelScope.launch {
            _uiState.value = PremiumUiState.Loading
            
            // 1. Get exact amount for level
            val amount = subscriptionManager.REQUIRED_AMOUNTS[educationLevel] ?: 15.00
            
            // 2. Initiate EcoCash via Paynow
            when (val result = paynowRepository.initiateEcoCashPayment(
                userId, phoneNumber, amount, "ZEXA $educationLevel Premium"
            )) {
                is PaymentResult.Success -> {
                    // ✅ UPDATE FIRESTORE WITH POLL URL AND REFERENCE
                    subscriptionManager.setPendingPayment(userId, result.pollUrl, result.reference)

                    _uiState.value = PremiumUiState.ShowInstructions(
                        instructions = result.instructions,
                        phoneNumber = phoneNumber,
                        amount = amount,
                        reference = result.reference
                    )
                    // Start polling automatically
                    startPolling(result.pollUrl, userId, amount, educationLevel)
                }
                is PaymentResult.Error -> {
                    _uiState.value = PremiumUiState.Error(result.message)
                }
                PaymentResult.NetworkError -> {
                    _uiState.value = PremiumUiState.Error("Network error. Please check your connection to start renewal.")
                }
            }
        }
    }
    
    private fun startPolling(pollUrl: String, userId: String, expectedAmount: Double, educationLevel: String) {
        viewModelScope.launch {
            val status = paynowRepository.pollUntilComplete(pollUrl)
            handlePaymentStatus(status, userId, expectedAmount, educationLevel)
        }
    }
    
    private fun handlePaymentStatus(status: PaymentStatus, userId: String, expectedAmount: Double, educationLevel: String) {
        viewModelScope.launch {
            when (status) {
                is PaymentStatus.Paid -> {
                    // ✅ DIRECT ACTIVATION: Trust Paynow status and activate immediately
                    val today = LocalDate.now()
                    val currentPeriod = TermCalendarManager.getCurrentPeriod(today)
                    val targetTermId = if (currentPeriod.id.startsWith("holiday")) {
                        val nextStart = TermCalendarManager.getNextTermStart(today)
                        if (nextStart != null) {
                            TermCalendarManager.getTermsForYear(nextStart.year).values.find { it.startDate == nextStart }?.id ?: "term1_${nextStart.year}"
                        } else {
                            "term1_${today.year + 1}"
                        }
                    } else {
                        currentPeriod.id
                    }

                    // CRITICAL: Call activation directly without redundant message parsing
                    val success = subscriptionManager.activatePremiumSubscription(
                        userId, targetTermId, expectedAmount, educationLevel
                    )

                    if (success) {
                        _uiState.value = PremiumUiState.PaymentSuccess("Upgrade successful! Premium features unlocked.")
                        // Locally sync immediately
                        preferenceManager.setPremiumStatus(true)
                        preferenceManager.setEducationLevel(educationLevel)
                    } else {
                        _uiState.value = PremiumUiState.Error("Firestore Update Failed. Please check your internet and try again.")
                    }
                }
                is PaymentStatus.Failed -> {
                    _uiState.value = PremiumUiState.Error("Payment failed. Please try again.")
                }
                is PaymentStatus.Pending -> {
                    _uiState.value = PremiumUiState.Error("Timed out waiting for EcoCash confirmation.")
                }
                is PaymentStatus.Unknown -> {
                    _uiState.value = PremiumUiState.Error(status.message ?: "Status Sync Interrupted")
                }
            }
        }
    }
    
    fun refreshStatus() {
        viewModelScope.launch {
            _subscriptionState.value = SubscriptionState.Loading
            _subscriptionState.value = subscriptionRepository.refreshStatus()
        }
    }

    fun resetState() {
        _uiState.value = PremiumUiState.Idle
    }

    fun checkStatus(pollUrl: String, educationLevel: String) {
        val userId = FirebaseAuth.getInstance().currentUser?.uid ?: return
        val amount = subscriptionManager.REQUIRED_AMOUNTS[educationLevel] ?: 5.00
        _uiState.value = PremiumUiState.Loading
        startPolling(pollUrl, userId, amount, educationLevel)
    }
}
