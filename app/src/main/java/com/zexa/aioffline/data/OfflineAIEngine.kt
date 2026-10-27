package com.zexa.aioffline.data

import android.content.Context
import android.os.Process
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.withContext
import java.io.File

object OfflineAIEngine {
    private const val TAG = "ZEXA_LiveAI"

    @Volatile var isInitialized = false
        private set
    @Volatile var isDemoMode = false
        private set
    @Volatile var isGenerationStopped = false
        private set
    @Volatile var nativeLibraryLoaded = false
    private var initFailureCount = 0

    external fun initLlamaModel(modelPath: String): Boolean
    external fun llamaStream(prompt: String, maxTokens: Int, callback: TokenCallback)
    external fun setCancelled(cancelled: Boolean)
    external fun clearKVCache()
    external fun freeLlamaModel()

    interface TokenCallback {
        fun onToken(token: String)
    }

    init {
        try {
            System.loadLibrary("llama_wrapper")
            nativeLibraryLoaded = true
            Log.d(TAG, "✅ Native library loaded successfully")
        } catch (e: Throwable) {
            nativeLibraryLoaded = false
            Log.e(TAG, "❌ Failed to load native library: ${e.message}")
        }
    }

    fun stopGeneration() {
        try {
            if (nativeLibraryLoaded) {
                isGenerationStopped = true
                setCancelled(true)
            }
        } catch (e: Throwable) { /* Safety */ }
    }

    suspend fun freeModel() = withContext(Dispatchers.IO) {
        try {
            if (nativeLibraryLoaded && isInitialized) {
                freeLlamaModel()
                isInitialized = false
            }
        } catch (e: Throwable) {
            Log.e(TAG, "Error freeing model: ${e.message}")
        }
    }

    suspend fun init(context: Context, modelFilePath: String): Boolean = withContext(Dispatchers.Default) {
        if (!nativeLibraryLoaded) {
            Log.e(TAG, "❌ Native library not loaded, cannot initialize")
            isDemoMode = true
            return@withContext false
        }
        val file = File(modelFilePath)
        if (!file.exists() || !file.canRead() || file.length() < 50_000_000L) {
            Log.e(TAG, "❌ Model file invalid: ${file.absolutePath}")
            isInitialized = false
            return@withContext false
        }
        try {
            if (isInitialized) freeModel()
            val result = try {
                initLlamaModel(modelFilePath)
            } catch (e: Throwable) {
                Log.e("ZEXA_DEBUG", "Native execution failed on Android 8/Legacy device", e)
                handleInitFailure()
                false
            }
            isInitialized = result
            if (result) {
                initFailureCount = 0
                isDemoMode = false
                Log.d(TAG, "✅ Native AI Engine Initialized")
            } else {
                handleInitFailure()
            }
            result
        } catch (e: Throwable) {
            Log.e("ZEXA_DEBUG", "Strict fallback trapped a fatal init error", e)
            handleInitFailure()
            false
        }
    }

    private fun handleInitFailure() {
        initFailureCount++
        isInitialized = false
        if (initFailureCount >= 2) {
            isDemoMode = true
            Log.e(TAG, "⚠️ Graceful Fallback: Demo Mode Enabled")
        }
    }

    /**
     * 🚀 FIX 3: INSTANT STREAMING PIPELINE
     * Removed the 60ms/4-character buffering delay.
     * Tokens are now sent to the UI the exact millisecond the C++ engine generates them.
     */
    suspend fun generateStream(
        prompt: String,
        onChunk: (String) -> Unit,
        maxTokens: Int = 512
    ) = withContext(Dispatchers.IO) {
        if (!isInitialized || isDemoMode || !nativeLibraryLoaded) {
            withContext(Dispatchers.Main) {
                onChunk(if (isDemoMode) "Demo Mode: AI capability disabled on this hardware." else "Error: AI not initialized.")
            }
            return@withContext
        }

        try {
            isGenerationStopped = false
            setCancelled(false)
            clearKVCache()

            val tokenChannel = Channel<String>(Channel.UNLIMITED)

            // 🚀 FIX: Send tokens instantly, no artificial buffering
            val callback = object : TokenCallback {
                override fun onToken(token: String) {
                    if (isGenerationStopped) return
                    tokenChannel.trySend(token)
                }
            }

            val thread = Thread {
                try {
                    // 🚀 FIX: Set thread priority to prevent UI freezing during heavy generation
                    Process.setThreadPriority(Process.THREAD_PRIORITY_FOREGROUND)
                    llamaStream(prompt, maxTokens, callback)
                } catch (e: Throwable) {
                    Log.e(TAG, "Native streaming error: ${e.message}")
                } finally {
                    tokenChannel.close()
                }
            }
            thread.start()

            // Consume tokens and pass directly to UI callback
            for (token in tokenChannel) {
                onChunk(token)
            }

        } catch (e: Throwable) {
            Log.e(TAG, "Streaming pipeline error: ${e.message}")
            withContext(Dispatchers.Main) {
                onChunk("An error occurred during generation.")
            }
        }
    }
}