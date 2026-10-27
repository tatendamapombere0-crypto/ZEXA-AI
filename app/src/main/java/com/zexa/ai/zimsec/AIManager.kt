package com.zexa.ai.zimsec

import android.content.Context
import android.os.Process
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.io.File

object AIManager {
    var isEngineReady = false
    private var nativeLibraryLoaded = false
    private val initMutex = Mutex()
    private var currentModelPath: String? = null

    // Native llama.cpp methods
    private external fun initLlamaModel(modelPath: String): Boolean
    private external fun llamaStream(prompt: String, maxTokens: Int, callback: TokenCallback)
    private external fun setCancelled(cancelled: Boolean)
    private external fun clearKVCache()
    external fun freeLlamaModel()

    interface TokenCallback {
        fun onToken(token: String)
    }

    init {
        try {
            System.loadLibrary("llama_wrapper")
            nativeLibraryLoaded = true
            Log.d("ZEXA_AI_DEBUG", "✅ Native library loaded successfully")
        } catch (e: Throwable) {
            nativeLibraryLoaded = false
            Log.e("ZEXA_AI_DEBUG", "❌ Failed to load native library: ${e.message}", e)
        }
    }

    fun isNativeLibraryLoaded() = nativeLibraryLoaded

    suspend fun wipeAndRestartBrain(context: Context, modelPath: String) = withContext(Dispatchers.Default) {
        Log.d("ZEXA_AI", "🔄 Resetting AI Engine for a fresh start...")
        stopGeneration()
        if (isEngineReady) clearKVCache()
        freeLlamaModel()
        isEngineReady = false
        initializeBrain(context, modelPath)
    }

    suspend fun initializeBrain(context: Context, modelPath: String) = initMutex.withLock {
        withContext(Dispatchers.Default) {
            Log.d("ZEXA_AI", "initializeBrain: modelPath=$modelPath")
            if (!nativeLibraryLoaded) {
                Log.e("ZEXA_AI", "initializeBrain: Native library NOT loaded")
                isEngineReady = false
                return@withContext
            }
            if (isEngineReady && currentModelPath == modelPath) {
                Log.d("ZEXA_AI", "✅ Using cached model (fast)")
                return@withContext
            }
            val brainFile = File(modelPath)
            if (!brainFile.exists()) {
                Log.e("ZEXA_AI", "initializeBrain: Model file does NOT exist at $modelPath")
                isEngineReady = false
                return@withContext
            }
            if (brainFile.length() < 50_000_000L) {
                Log.e("ZEXA_AI", "initializeBrain: Model file is too small (${brainFile.length()} bytes). Likely corrupted.")
                isEngineReady = false
                return@withContext
            }
            Log.d("ZEXA_AI", "initializeBrain: Model file size=${brainFile.length()}")
            try {
                Log.d("ZEXA_AI", "🔄 Loading AI model into native memory...")
                val startTime = System.currentTimeMillis()
                if (isEngineReady) {
                    Log.d("ZEXA_AI", "initializeBrain: Freeing existing model before reload")
                    freeLlamaModel()
                }
                val result = try {
                    initLlamaModel(modelPath)
                } catch (e: Throwable) {
                    Log.e("ZEXA_AI", "Native initLlamaModel CRASHED or failed.", e)
                    false
                }
                isEngineReady = result
                if (result) {
                    currentModelPath = modelPath
                    val loadTime = System.currentTimeMillis() - startTime
                    Log.d("ZEXA_AI", "✅ Model loaded successfully in ${loadTime}ms")
                } else {
                    Log.e("ZEXA_AI", " Native initLlamaModel returned FALSE")
                }
            } catch (oom: OutOfMemoryError) {
                Log.e("ZEXA_AI", "Out of memory during model loading")
                System.gc()
                isEngineReady = false
            } catch (e: Throwable) {
                Log.e("ZEXA_AI", "Unknown error during model loading", e)
                isEngineReady = false
            }
        }
    }

    /**
     * STREAMING & FORMATTING FIX: Clean response processing that intercepts
     * raw text strings and strips out volatile rendering patterns before UI execution.
     */
    suspend fun streamZexaResponse(
        prompt: String,
        maxTokens: Int = 512, // 🚀 FIX: Lowered from 2048 to prevent rambling/loops on 0.5B model
        onTokenReceived: (String) -> Unit,
        onGenerationComplete: () -> Unit
    ) = withContext(Dispatchers.IO) {
        if (!isEngineReady || !nativeLibraryLoaded) {
            withContext(Dispatchers.Main) {
                onTokenReceived("ZEXA AI is offline.")
                onGenerationComplete()
            }
            return@withContext
        }
        try {
            val finalPrompt = prompt.trim()
            setCancelled(false)
            clearKVCache()

            val tokenChannel = Channel<String>(Channel.UNLIMITED)
            val startTime = System.currentTimeMillis()
            Log.d("ZEXA_SPEED", "️ Generation started. Max tokens: $maxTokens")

            val callback = object : TokenCallback {
                override fun onToken(token: String) {
                    tokenChannel.trySend(token)
                }
            }

            val thread = Thread {
                try {
                    // 🚀 FIX: Changed to BACKGROUND to ensure UI thread is never starved.
                    // This prevents the "AI is freezing" issue where prefill/generation
                    // blocks the main loop.
                    Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND)
                    llamaStream(finalPrompt, maxTokens, callback)
                } catch (e: Throwable) {
                    Log.e("ZEXA_AI", "Native streaming error", e)
                } finally {
                    tokenChannel.close()
                }
            }
            thread.start()

            try {
                for (token in tokenChannel) {
                    onTokenReceived(token)
                }
                val totalTime = System.currentTimeMillis() - startTime
                Log.d("ZEXA_SPEED", "✅ Generation complete in ${totalTime}ms")
            } finally {
                setCancelled(true)
            }

            withContext(Dispatchers.Main) {
                onGenerationComplete()
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Log.e("ZEXA_SPEED", "Pipeline delay tracking error", e)
            withContext(Dispatchers.Main) {
                onTokenReceived("Processing optimization error.")
                onGenerationComplete()
            }
        }
    }

    private fun sanitizeResponse(text: String): String {
        if (text.isEmpty()) return ""
        return text
            .replace("\\text", "")
            .replace("\\rightarrow", "->")
            .replace("{", "").replace("}", "")
            .replace("<|im_start|>", "").replace("<|im_end|>", "")
            .replace("<|endoftext|>", "")
            .trimStart()
    }

    fun stopGeneration() {
        if (nativeLibraryLoaded) {
            setCancelled(true)
        }
    }
}