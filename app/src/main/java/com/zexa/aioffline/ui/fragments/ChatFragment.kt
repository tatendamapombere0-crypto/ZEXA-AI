package com.zexa.aioffline.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.zexa.ai.ZexaQueryManager
import com.zexa.aioffline.R
import com.zexa.aioffline.databinding.FragmentChatBinding
import com.zexa.aioffline.ui.ChatAdapter
import com.zexa.aioffline.viewmodel.ChatViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.flow.first
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import android.util.Log

class ChatFragment : Fragment() {
    private var _binding: FragmentChatBinding? = null
    private val binding get() = _binding
    
    // Use activityViewModels to share state with SettingsFragment
    private val viewModel: ChatViewModel by activityViewModels()
    private lateinit var chatAdapter: ChatAdapter
    private var isModelReady = false
    
    private lateinit var queryManager: ZexaQueryManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentChatBinding.inflate(inflater, container, false)
        queryManager = ZexaQueryManager(requireContext())
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
        setupClickListeners()
        observeViewModel()

        // ✅ AUTO-START DOWNLOAD on first visit (only once)
        if (!isModelReady && !viewModel.modelStatus.value.contains("Downloading")) {
            viewModel.initModel()
        }
    }

    private fun setupRecyclerView() {
        chatAdapter = ChatAdapter()
        binding?.rvChat?.apply {
            adapter = chatAdapter
            layoutManager = LinearLayoutManager(context).apply {
                stackFromEnd = true
            }
        }
    }

    private fun setupClickListeners() {
        binding?.sendBtn?.setOnClickListener {
            val question = binding?.inputField?.text?.toString()?.trim()
            if (!question.isNullOrEmpty()) {
                interceptQuery(question)
            }
        }
    }

    private fun interceptQuery(question: String) {
        if (!isModelReady) {
            Toast.makeText(context, "AI IS INITIALIZING WAIT TO PROCEED", Toast.LENGTH_SHORT).show()
            return
        }

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            // 1. FAST LOCAL CHECK
            val todayDateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val localIsPremium = viewModel.preferenceManager.isPremium.first()
            val localCount = viewModel.preferenceManager.offlineQueryCount.first()
            val localDate = viewModel.preferenceManager.lastQueryDate.first()
            val actualLocalCount = if (localDate == todayDateStr) localCount else 0
            
            val dailyLimit = viewModel.dailyLimit.value.toInt()

            if (localIsPremium || actualLocalCount < dailyLimit) {
                // START AI IMMEDIATELY
                withContext(Dispatchers.Main) {
                    sendQuestion(question)
                }

                // Sync in background
                launch {
                    try {
                        withTimeout(2000) {
                            queryManager.verifyZexaAccessRulesAsync()
                        }
                    } catch (e: Exception) {
                        Log.w("ZEXA_AI", "Background sync timed out.")
                    }
                }
                return@launch
            }

            // 2. REMOTE CHECK IF LOCAL FAILED
            withContext(Dispatchers.Main) {
                queryManager.verifyZexaAccessRules(object : ZexaQueryManager.QueryAccessCallback {
                    override fun onAccessGranted(isPremium: Boolean, remainingFreeQuestions: Int, isHolidayMode: Boolean) {
                        sendQuestion(question)
                    }

                    override fun onAccessDenied(title: String, reason: String, showEcoCashButton: Boolean) {
                        val builder = AlertDialog.Builder(requireContext())
                        builder.setTitle(title)
                        builder.setMessage(reason)
                        builder.setCancelable(false)

                        if (showEcoCashButton) {
                            builder.setPositiveButton("PAY WITH ECOCASH") { _, _ ->
                                findNavController().navigate(R.id.premiumSettingsFragment)
                            }
                            builder.setNegativeButton("Dismiss", null)
                        } else {
                            builder.setPositiveButton("OK", null)
                        }
                        builder.show()
                    }
                })
            }
        }
    }

    private fun sendQuestion(question: String) {
        if (!isModelReady) {
            Toast.makeText(context, "AI IS INITIALIZING WAIT TO PROCEED", Toast.LENGTH_SHORT).show()
            return
        }
        viewModel.sendMessage(question)
        binding?.inputField?.text?.clear()
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                // Observe messages
                launch {
                    viewModel.messages.collect { messages ->
                        chatAdapter.submitList(messages)
                        if (messages.isNotEmpty()) {
                            binding?.rvChat?.scrollToPosition(messages.size - 1)
                        }
                    }
                }

                // Observe model status
                launch {
                    viewModel.modelStatus.collect { status ->
                        binding?.aiStatus?.text = if (status.contains("Ready") || status.contains("✅")) "AI Engine Ready" else status
                        binding?.aiStatus?.setTextColor(androidx.core.content.ContextCompat.getColor(requireContext(), 
                            if (status.contains("Ready") || status.contains("✅")) R.color.accent_cyan else R.color.primary_light
                        ))
                        isModelReady = status.contains("✅") || status.contains("Ready") || status.contains("Demo Mode")
                    }
                }
                
                // Observe download progress
                launch {
                    viewModel.downloadProgress.collect { progress ->
                        binding?.progressBar?.apply {
                            visibility = if (progress > 0 && progress < 100) View.VISIBLE else View.GONE
                            // Static indicator, progress value not applicable
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
