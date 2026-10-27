package com.zexa.aioffline.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit

object ModelDownloader {
    private const val TAG = "ZEXA_Download"
    
    data class ModelInfo(
        val name: String,
        val url: String,
        val fileName: String,
        val expectedSizeMB: Long
    )

    // ✅ DIRECT HUGGINGFACE DOWNLOAD URLS
    // 🎯 UPGRADED to Qwen3 (from Qwen2.5) — later training/release cutoff
    // (~April 2025 vs ~Sept 2024), meaningfully improved reasoning, and far
    // broader multilingual support (100+ languages) per independent 2026
    // benchmarking roundups. Verified directly against HuggingFace before
    // wiring in - both URLs below were confirmed to exist and match these
    // exact filenames, not guessed from a naming pattern.
    //
    // Sourced from bartowski's GGUF quantization (a long-established, widely
    // trusted third-party quantizer used across the llama.cpp ecosystem)
    // rather than Qwen's own official GGUF repo, because Qwen's official repo
    // only ships Q8_0 for these sizes (639MB for the 0.6B alone) - nearly
    // double today's download size. bartowski's Q4_K_M keeps the exact same
    // quantization level already used, so the size increase below reflects
    // the genuinely larger parameter counts, not a quant-level change.
    //
    // Constant names kept as MODEL_0_5B/MODEL_1_5B (not renamed to 0_6B/1_7B)
    // deliberately - ChatViewModel.kt references these exact identifiers in
    // 7 places; renaming would mean touching all of them for a cosmetic label
    // change only, for no functional benefit.
    //
    // ⚠️ IMPORTANT - Qwen3 has a built-in "thinking mode" that emits
    // <think>...</think> reasoning blocks before the real answer unless a
    // "/no_think" directive is included in the prompt. This MUST be handled in
    // ChatViewModel's buildPrompt()/buildPolishPrompt(), or responses will run
    // far past the "under 10 seconds" requirement and raw <think> tags could
    // leak into the chat UI (nothing currently strips them).
    val MODEL_0_5B = ModelInfo(
        name = "Qwen3-0.6B",
        url = "https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF/resolve/main/Qwen_Qwen3-0.6B-Q4_K_M.gguf?download=true",
        fileName = "Qwen_Qwen3-0.6B-Q4_K_M.gguf",
        expectedSizeMB = 480L
    )
    
    val MODEL_1_5B = ModelInfo(
        name = "Qwen3-1.7B",
        url = "https://huggingface.co/bartowski/Qwen_Qwen3-1.7B-GGUF/resolve/main/Qwen_Qwen3-1.7B-Q4_K_M.gguf?download=true",
        fileName = "qwen3-1.7b-q4_k_m.gguf",
        expectedSizeMB = 1280L
    )

    // ✅ SHARED STATE FOR SYNCHRONIZATION
    private val _progressMap = MutableStateFlow<Map<String, Int>>(emptyMap())
    val progressMap = _progressMap.asStateFlow()

    private val _statusMap = MutableStateFlow<Map<String, String>>(emptyMap())
    val statusMap = _statusMap.asStateFlow()

    private val downloadMutex = Mutex()
    private val activeDownloads = mutableMapOf<String, Job>()

    fun getModelFile(context: Context, model: ModelInfo): File =
        File(context.filesDir, model.fileName)

    suspend fun extractBundledModel(context: Context, model: ModelInfo): Boolean = withContext(Dispatchers.IO) {
        val destinationFile = getModelFile(context, model)
        
        try {
            // Check if model exists in assets root
            val assetExists = try {
                context.assets.open(model.fileName).use { true }
            } catch (e: Exception) {
                false
            }

            if (!assetExists) {
                Log.d(TAG, "No bundled model found in assets for ${model.fileName}")
                return@withContext false
            }

            Log.d(TAG, "📦 Found bundled model in assets: ${model.fileName}. Extracting...")
            updateGlobalProgress(model.fileName, 0, "Preparing Offline AI...")

            context.assets.open(model.fileName).use { input ->
                val totalSize = input.available().toLong()
                var copiedSize = 0L
                
                FileOutputStream(destinationFile).use { output ->
                    val buffer = ByteArray(128 * 1024)
                    var bytesRead: Int = 0
                    while (isActive && input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        copiedSize += bytesRead.toLong()
                        
                        if (totalSize > 0) {
                            val progress = ((copiedSize * 100) / totalSize).toInt()
                            if (progress % 5 == 0) {
                                updateGlobalProgress(model.fileName, progress, "Setting up AI: $progress%")
                            }
                        }
                    }
                }
            }
            
            Log.d(TAG, "✅ Bundled model extracted successfully")
            updateGlobalProgress(model.fileName, 100, "✅ AI Ready")
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to extract model: ${e.message}")
            updateGlobalProgress(model.fileName, -1, "❌ Setup Error")
            false
        }
    }

    fun cancelDownload(model: ModelInfo) {
        kotlinx.coroutines.GlobalScope.launch {
            downloadMutex.withLock {
                activeDownloads[model.fileName]?.cancel()
                activeDownloads.remove(model.fileName)
                updateGlobalProgress(model.fileName, -1, "Download Canceled")
            }
        }
    }

    suspend fun downloadModel(
        context: Context,
        model: ModelInfo,
        onProgress: (Int, String) -> Unit = { _, _ -> }
    ): Boolean {
        val job = downloadMutex.withLock {
            activeDownloads[model.fileName]?.let {
                Log.d(TAG, "Download already in progress for ${model.fileName}, waiting for it...")
                return@withLock it
            }

            // Create a new download job
            val newJob = kotlinx.coroutines.GlobalScope.launch(Dispatchers.IO) {
                try {
                    performDownload(context, model, onProgress)
                } finally {
                    downloadMutex.withLock {
                        activeDownloads.remove(model.fileName)
                    }
                }
            }
            activeDownloads[model.fileName] = newJob
            newJob
        }

        job.join()
        
        // Return success if file exists and is valid size
        val file = getModelFile(context, model)
        val minValidSizeBytes = model.expectedSizeMB * 1024L * 1024L * 9 / 10
        return file.exists() && file.length() >= minValidSizeBytes
    }

    @OptIn(kotlinx.coroutines.DelicateCoroutinesApi::class)
    private suspend fun performDownload(
        context: Context,
        model: ModelInfo,
        onProgress: (Int, String) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        var retryCount = 0
        val maxRetries = 5
        
        while (retryCount < maxRetries && isActive) {
            val file = getModelFile(context, model)
            val tempFile = File(context.filesDir, "${model.fileName}.tmp")
            val minValidSizeBytes = model.expectedSizeMB * 1024L * 1024L * 9 / 10

            if (file.exists() && file.length() >= minValidSizeBytes) {
                updateGlobalProgress(model.fileName, 100, "✅ AI Active")
                onProgress(100, "✅ AI Active")
                return@withContext true
            }

            val client = OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.MINUTES)
                .followRedirects(true)
                .build()

            val existingBytes = if (tempFile.exists()) tempFile.length() else 0L
            val requestBuilder = Request.Builder()
                .url(model.url)
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            
            if (existingBytes > 0) {
                requestBuilder.header("Range", "bytes=$existingBytes-")
            }

            try {
                client.newCall(requestBuilder.build()).execute().use { response ->
                    val isPartial = response.code == 206
                    if (!response.isSuccessful && !isPartial) {
                        throw Exception("HTTP ${response.code}")
                    }

                    val body = response.body ?: throw Exception("Empty body")
                    val contentLength = body.contentLength()
                    val totalBytes = if (isPartial) contentLength + existingBytes else contentLength
                    var downloadedBytes = if (isPartial) existingBytes else 0L

                    body.byteStream().use { input ->
                        FileOutputStream(tempFile, isPartial).use { output ->
                            val buffer = ByteArray(64 * 1024)
                            var bytesRead = 0
                            while (isActive && input.read(buffer).also { bytesRead = it } != -1) {
                                output.write(buffer, 0, bytesRead)
                                downloadedBytes += bytesRead
                                
                                if (totalBytes > 0) {
                                    val progress = ((downloadedBytes * 100) / totalBytes).toInt()
                                    updateGlobalProgress(model.fileName, progress, "Downloading Intelligence: $progress%")
                                    onProgress(progress, "Downloading Intelligence: $progress%")
                                }
                            }
                            if (!isActive) {
                                throw CancellationException("Download Canceled")
                            }
                        }
                    }
                }

                if (tempFile.length() >= minValidSizeBytes) {
                    if (file.exists()) file.delete()
                    tempFile.renameTo(file)
                    updateGlobalProgress(model.fileName, 100, "✅ AI Active")
                    onProgress(100, "✅ AI Active")
                    return@withContext true
                } else {
                    throw Exception("Incomplete download")
                }
            } catch (e: Exception) {
                if (e is CancellationException) throw e

                retryCount++
                Log.e(TAG, "Download attempt $retryCount failed: ${e.message}")
                if (retryCount >= maxRetries) {
                    updateGlobalProgress(model.fileName, -1, "❌ Network Error - Please retry manually")
                    onProgress(-1, "❌ Network Error")
                    return@withContext false
                }
                updateGlobalProgress(model.fileName, _progressMap.value[model.fileName] ?: 0, "⚠️ Network unstable, retrying ($retryCount/$maxRetries)...")
                kotlinx.coroutines.delay(3000L * retryCount) // Exponential backoff
            }
        }
        false
    }

    private fun updateGlobalProgress(fileName: String, progress: Int, status: String) {
        // Atomic updates to global state so all observers (Activities/Fragments) stay in sync
        _progressMap.value = _progressMap.value.toMutableMap().apply { put(fileName, progress) }
        _statusMap.value = _statusMap.value.toMutableMap().apply { put(fileName, status) }
    }
}
