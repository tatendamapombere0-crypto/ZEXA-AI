package com.zexa.aioffline.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.zexa.aioffline.R
import com.zexa.aioffline.data.ModelDownloader
import com.zexa.aioffline.data.PreferenceManager
import com.zexa.aioffline.databinding.ActivityModelSelectionBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class ModelCard(
    val name: String,
    val params: String,
    val sizeGB: String,
    val sizeMB: Long,
    val speed: String,
    val modelInfo: ModelDownloader.ModelInfo,
    var status: ModelStatus = ModelStatus.AVAILABLE,
    var progress: Int = 0
)

enum class ModelStatus {
    AVAILABLE, DOWNLOADING, DOWNLOADED, INCOMPATIBLE
}

class ModelSelectionActivity : AppCompatActivity() {
    private lateinit var binding: ActivityModelSelectionBinding
    private lateinit var adapter: ModelAdapter
    private lateinit var preferenceManager: PreferenceManager
    private val models = mutableListOf<ModelCard>()
    private var downloadedModel: ModelDownloader.ModelInfo? = null

    private var isPremium = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        preferenceManager = PreferenceManager(this)
        binding = ActivityModelSelectionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        checkPremiumStatus()
        setupModels()
        setupRecyclerView()
        setupButtons()
        observeGlobalDownload()
    }

    private fun checkPremiumStatus() {
        lifecycleScope.launch {
            isPremium = preferenceManager.isPremium.first()
            if (::adapter.isInitialized) {
                adapter.notifyDataSetChanged()
            }
        }
    }

    private fun observeGlobalDownload() {
        lifecycleScope.launch {
            ModelDownloader.progressMap.collect { progressMap ->
                models.forEachIndexed { index, modelCard ->
                    val progress = progressMap[modelCard.modelInfo.fileName]
                    if (progress != null) {
                        when {
                            progress in 0..99 -> {
                                modelCard.status = ModelStatus.DOWNLOADING
                                modelCard.progress = progress
                            }
                            progress == 100 -> {
                                modelCard.status = ModelStatus.DOWNLOADED
                                modelCard.progress = 100
                                downloadedModel = modelCard.modelInfo
                                binding.btnStartChatting.isEnabled = true
                            }
                            progress == -1 -> {
                                // Only reset to available if it was downloading (not if it's already downloaded)
                                if (modelCard.status == ModelStatus.DOWNLOADING) {
                                    modelCard.status = ModelStatus.AVAILABLE
                                }
                            }
                        }
                        adapter.notifyItemChanged(index)
                    }
                }
            }
        }
    }

    private fun setupModels() {
        models.clear()
        models.add(ModelCard("ZEXA 3 - 0.6B", "0.6B", "480MB", 480L, "Fast", ModelDownloader.MODEL_0_5B))
        models.add(ModelCard("ZEXA 3 - 1.7B", "1.7B", "1.3GB", 1280L, "Balanced", ModelDownloader.MODEL_1_5B))
        
        models.forEach { card ->
            val file = ModelDownloader.getModelFile(this, card.modelInfo)
            val existsInFiles = file.exists() && file.length() >= card.modelInfo.expectedSizeMB * 1024L * 1024L * 9 / 10
            
            // 🎯 NEW: Also check if model is bundled in assets
            val existsInAssets = try {
                assets.open(card.modelInfo.fileName).use { true }
            } catch (e: Exception) { false }

            if (existsInFiles) {
                card.status = ModelStatus.DOWNLOADED
                downloadedModel = card.modelInfo
                binding.btnStartChatting.isEnabled = true
            } else if (existsInAssets) {
                // Bundled but not yet extracted to filesDir
                card.status = ModelStatus.AVAILABLE
            }
        }
    }

    private fun setupRecyclerView() {
        adapter = ModelAdapter(models) { handleModelAction(it) }
        binding.recyclerModels.apply {
            layoutManager = LinearLayoutManager(this@ModelSelectionActivity)
            adapter = this@ModelSelectionActivity.adapter
        }
    }

    private fun handleModelAction(model: ModelCard) {
        when (model.status) {
            ModelStatus.AVAILABLE -> startDownload(model)
            ModelStatus.DOWNLOADING -> {
                // Fix: Properly cancel active download
                ModelDownloader.cancelDownload(model.modelInfo)
                model.status = ModelStatus.AVAILABLE
                model.progress = 0
                adapter.notifyItemChanged(models.indexOf(model))
                Toast.makeText(this, "Download Canceled", Toast.LENGTH_SHORT).show()
            }
            ModelStatus.DOWNLOADED -> {
                // Fix: Properly delete the model file
                val file = ModelDownloader.getModelFile(this, model.modelInfo)
                if (file.exists()) {
                    file.delete()
                }
                val tempFile = java.io.File(filesDir, "${model.modelInfo.fileName}.tmp")
                if (tempFile.exists()) {
                    tempFile.delete()
                }
                
                model.status = ModelStatus.AVAILABLE
                model.progress = 0
                
                // Update the state of the "Start Chatting" button and the selected model
                val remainingDownloaded = models.find { it.status == ModelStatus.DOWNLOADED }
                if (remainingDownloaded != null) {
                    downloadedModel = remainingDownloaded.modelInfo
                    binding.btnStartChatting.isEnabled = true
                } else {
                    downloadedModel = null
                    binding.btnStartChatting.isEnabled = false
                }
                
                adapter.notifyItemChanged(models.indexOf(model))
                Toast.makeText(this, "Model Deleted", Toast.LENGTH_SHORT).show()
            }
            else -> {}
        }
    }

    private fun startDownload(model: ModelCard) {
        lifecycleScope.launch(Dispatchers.IO) {
            // 🎯 NEW: Check if bundled in assets first
            val existsInAssets = try {
                assets.open(model.modelInfo.fileName).use { true }
            } catch (e: Exception) { false }

            if (existsInAssets) {
                // We have it locally! Extract it without needing internet.
                preferenceManager.setSelectedModel(model.modelInfo.fileName)
                ModelDownloader.extractBundledModel(this@ModelSelectionActivity, model.modelInfo)
                return@launch
            }

            // Otherwise, require internet for download
            if (!com.zexa.aioffline.util.NetworkUtils.isNetworkAvailable(this@ModelSelectionActivity)) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@ModelSelectionActivity, "No internet connection!", Toast.LENGTH_LONG).show()
                }
                return@launch
            }
            
            // Update preference immediately so background sync works correctly
            preferenceManager.setSelectedModel(model.modelInfo.fileName)
            ModelDownloader.downloadModel(this@ModelSelectionActivity, model.modelInfo)
        }
    }

    private fun setupButtons() {
        binding.btnStartChatting.setOnClickListener {
            completeSetup()
        }
        binding.btnSkip.setOnClickListener {
            completeSetup()
        }
    }

    private fun completeSetup() {
        lifecycleScope.launch {
            downloadedModel?.let { 
                preferenceManager.setSelectedModel(it.fileName)
                preferenceManager.setModelDownloaded(true)
            }
            preferenceManager.setSetupCompleted(true)
            preferenceManager.setModelReady(true)
            startActivity(Intent(this@ModelSelectionActivity, ChatActivity::class.java))
            finish()
        }
    }

    inner class ModelAdapter(private val models: List<ModelCard>, private val onAction: (ModelCard) -> Unit) : RecyclerView.Adapter<ModelAdapter.ViewHolder>() {
        inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvName: TextView = view.findViewById(R.id.tvModelName)
            val btnAction: android.widget.Button = view.findViewById(R.id.btnAction)
            val progress: View = view.findViewById(R.id.progressDownload)
            val tvPercent: TextView = view.findViewById(R.id.tvProgressPercent)
            val badgeParams: TextView = view.findViewById(R.id.badgeParams)
            val badgeSize: TextView = view.findViewById(R.id.badgeSize)
            val badgeSpeed: TextView = view.findViewById(R.id.badgeSpeed)
        }
        override fun onCreateViewHolder(p: ViewGroup, v: Int) = ViewHolder(LayoutInflater.from(p.context).inflate(R.layout.item_model_card, p, false))
        override fun onBindViewHolder(h: ViewHolder, pos: Int) {
            val m = models[pos]
            val isPremiumModel = m.name.contains("1.7B")
            
            if (isPremiumModel && !isPremium) {
                // 🔒 FREE: Lock ZEXA 3-1.7B
                h.tvName.text = "${m.name} (Premium Only)"
                h.tvName.setTextColor(android.graphics.Color.parseColor("#94A3B8"))
                h.btnAction.isEnabled = false
                h.btnAction.alpha = 0.5f
                h.btnAction.setBackgroundResource(android.R.drawable.ic_lock_lock)
                h.btnAction.setOnClickListener { 
                    Toast.makeText(this@ModelSelectionActivity, "Please upgrade to PREMIUM to unlock this model!", Toast.LENGTH_LONG).show()
                }
            } else {
                // ✅ PREMIUM: Unlock ZEXA 3-1.7B
                h.tvName.text = if (isPremiumModel) "${m.name} (Premium)" else m.name
                
                // Dark Bold Sky Blue matching the app's aesthetic
                val boldSkyBlue = android.graphics.Color.parseColor("#0369A1")
                h.tvName.setTextColor(boldSkyBlue)

                h.tvName.alpha = 1.0f
                h.btnAction.isEnabled = true
                h.btnAction.alpha = 1.0f
                h.btnAction.setBackgroundResource(when(m.status) {
                    ModelStatus.AVAILABLE -> android.R.drawable.stat_sys_download
                    ModelStatus.DOWNLOADED -> android.R.drawable.ic_menu_delete
                    else -> android.R.drawable.ic_menu_close_clear_cancel
                })
                h.btnAction.setOnClickListener { onAction(m) }
            }
            
            h.progress.visibility = if(m.status == ModelStatus.DOWNLOADING) View.VISIBLE else View.GONE
            h.tvPercent.visibility = if(m.status == ModelStatus.DOWNLOADING) View.VISIBLE else View.GONE
            
            if (m.status == ModelStatus.DOWNLOADING) {
                (h.progress as? com.google.android.material.progressindicator.LinearProgressIndicator)?.progress = m.progress
            }

            h.tvPercent.text = "${m.progress}%"

            h.badgeParams.text = m.params
            h.badgeSize.text = m.sizeGB
            h.badgeSpeed.text = m.speed
        }
        override fun getItemCount() = models.size
    }
}
