package com.zexa.aioffline.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.zexa.aioffline.R
import com.zexa.aioffline.databinding.FragmentAiLoadingBinding
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class AILoadingFragment : Fragment() {
    
    private var _binding: FragmentAiLoadingBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiLoadingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Start initialization
        initializeAIWithProgress()
    }

    private fun initializeAIWithProgress() {
        viewLifecycleOwner.lifecycleScope.launch {
            // Show progress updates
            updateProgress(10, "Loading neural engine...")
            delay(500)
            
            updateProgress(30, "Initializing offline brain...")
            delay(500)
            
            updateProgress(60, "Syncing knowledge base...")
            delay(500)
            
            updateProgress(90, "Finalizing setup...")
            delay(300)
            
            updateProgress(100, "Ready!")
            delay(200)
            
            // Navigate to main chat
            navigateToChat()
        }
    }

    private fun updateProgress(percent: Int, message: String) {
        if (_binding == null) return
        binding.apply {
            tvLoadingSubtitle.text = message
            tvProgressPercent.text = "$percent%"
            tvProgressPercent.visibility = View.VISIBLE
            
            // Animation removed for performance
        }
    }

    private fun navigateToChat() {
        findNavController().navigate(R.id.action_aiLoading_to_chat)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
