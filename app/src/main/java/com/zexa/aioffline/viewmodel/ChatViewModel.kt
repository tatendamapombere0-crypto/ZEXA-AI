package com.zexa.aioffline.viewmodel

import android.app.Application
import android.content.Context
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.zexa.aioffline.data.*
import com.zexa.ai.zimsec.AIManager
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.tasks.await

enum class AIStatus {
    IDLE, DOWNLOADING, INITIALIZING, READY, ERROR
}

class ChatViewModel(application: Application) : AndroidViewModel(application) {
    private val context: Context = application.applicationContext
    private val repository = ChatRepository(context = application)
    private val subscriptionRepository = SubscriptionRepository(context = application)
    private val subscriptionManager = SubscriptionManager(com.google.firebase.firestore.FirebaseFirestore.getInstance(), context)
    val preferenceManager = PreferenceManager(context)

    val messages: StateFlow<List<ChatMessage>> = repository.messages
    private val _isGenerating = MutableStateFlow(false)
    val isGenerating = _isGenerating.asStateFlow()

    private val _isLastQuestion = MutableStateFlow(false)
    val isLastQuestion = _isLastQuestion.asStateFlow()

    private val _modelStatus = MutableStateFlow("Initializing...")
    val modelStatus: StateFlow<String> = _modelStatus.asStateFlow()

    private val _aiStatus = MutableStateFlow(AIStatus.IDLE)
    val aiStatus: StateFlow<AIStatus> = _aiStatus.asStateFlow()

    private val _downloadProgress = MutableStateFlow(0)
    val downloadProgress: StateFlow<Int> = _downloadProgress.asStateFlow()

    private val _subscriptionState = MutableStateFlow<SubscriptionState>(SubscriptionState.Loading)
    val subscriptionState: StateFlow<SubscriptionState> = _subscriptionState.asStateFlow()

    private val _isSessionValid = MutableStateFlow(true)
    val isSessionValid = _isSessionValid.asStateFlow()

    private var sessionListener: com.google.firebase.firestore.ListenerRegistration? = null
    private var generationJob: Job? = null
    private var initJob: Job? = null
    private var thinkingAnimationJob: Job? = null
    private val conversationHistory = java.util.ArrayDeque<Pair<String, String>>(4)

    private val _userBalance = MutableStateFlow(0L)
    val userBalance = _userBalance.asStateFlow()

    private val _questionsUsedToday = MutableStateFlow(0L)
    val questionsUsedToday = _questionsUsedToday.asStateFlow()

    private val _dailyLimit = MutableStateFlow(2L)
    val dailyLimit = _dailyLimit.asStateFlow()

    private var currentLevel: String = "O-Level"

    init {
        viewModelScope.launch {
            preferenceManager.contentLevel.collect { currentLevel = it ?: "O-Level" }
        }
        observeSubscription()
        syncSubscriptionFromServer()

        viewModelScope.launch {
            combine(preferenceManager.offlineQueryCount, preferenceManager.lastQueryDate) { localCount, lastDate ->
                val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                if (lastDate == today) localCount else 0
            }.collect { count -> _questionsUsedToday.value = count.toLong() }
        }

        viewModelScope.launch {
            preferenceManager.dailyLimit.collect { limit -> _dailyLimit.value = limit.toLong() }
        }

        viewModelScope.launch {
            ModelDownloader.progressMap.collect { progressMap ->
                val selectedModelName = preferenceManager.selectedModel.first() ?: ModelDownloader.MODEL_0_5B.fileName
                val activeModelName = progressMap.entries.find { it.value in 0..99 }?.key ?: selectedModelName
                progressMap[activeModelName]?.let { progress ->
                    _downloadProgress.value = progress
                    if (progress in 0..99 && _aiStatus.value != AIStatus.DOWNLOADING) _aiStatus.value = AIStatus.DOWNLOADING
                }
            }
        }
        viewModelScope.launch {
            ModelDownloader.statusMap.collect { statusMap ->
                val selectedModelName = preferenceManager.selectedModel.first() ?: ModelDownloader.MODEL_0_5B.fileName
                val activeModelName = ModelDownloader.progressMap.value.entries.find { it.value in 0..99 }?.key ?: selectedModelName
                statusMap[activeModelName]?.let { status -> _modelStatus.value = status }
            }
        }

        startSessionListener()
    }

    private fun startSessionListener() {
        val userId = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.uid ?: return
        val localToken = android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID) ?: ""

        sessionListener?.remove()
        sessionListener = com.google.firebase.firestore.FirebaseFirestore.getInstance()
            .collection("users").document(userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                if (snapshot != null && snapshot.exists()) {
                    val serverToken = snapshot.getString("active_hardware_token") ?: ""
                    if (serverToken.isNotEmpty() && localToken != serverToken) {
                        Log.w("ChatViewModel", "Session conflict detected. Token mismatch.")
                        _isSessionValid.value = false
                    }
                }
            }
    }

    override fun onCleared() {
        super.onCleared()
        sessionListener?.remove()
    }

    fun syncSubscriptionFromServer() {
        if (!com.zexa.aioffline.util.NetworkUtils.isNetworkAvailable(context)) {
            Log.d("ChatViewModel", "Sync skipped: Offline")
            return
        }
        viewModelScope.launch {
            try {
                _subscriptionState.value = subscriptionRepository.refreshStatusFromServer()
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Background sync failed", e)
            }
        }
    }

    fun checkUserStatus() {
        val userId = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.uid ?: return
        viewModelScope.launch(Dispatchers.IO) {
            try {
                if (com.zexa.aioffline.util.NetworkUtils.isNetworkAvailable(context)) {
                    withTimeoutOrNull(3000L) {
                        subscriptionManager.checkAndEnforceTermExpiry(userId)

                        val document = com.google.firebase.firestore.FirebaseFirestore.getInstance()
                            .collection("users").document(userId).get(com.google.firebase.firestore.Source.SERVER).await()

                        val balance = document.getLong("balance") ?: 0L
                        _userBalance.value = balance

                        val serverToken = document.getString("active_hardware_token") ?: ""
                        val localToken = android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID) ?: ""

                        if (serverToken.isNotEmpty() && localToken != serverToken) {
                            Log.w("ChatViewModel", "checkUserStatus: Session conflict detected.")
                            _isSessionValid.value = false
                            return@withTimeoutOrNull
                        }

                        val limit = document.getLong("dailyLimit") ?: 2L
                        
                        _dailyLimit.value = limit
                        preferenceManager.setDailyLimit(limit.toInt())
                    }
                }
            } catch (e: Throwable) {
                Log.e("ChatViewModel", "Status check failed or timed out", e)
            }
        }
    }

    private fun observeSubscription() {
        viewModelScope.launch {
            subscriptionRepository.observeSubscriptionStatus().collect { state ->
                _subscriptionState.value = state
                if (state is SubscriptionState.Success) preferenceManager.setPremiumStatus(state.isPremium)
            }
        }
    }

    fun resetBrain() {
        viewModelScope.launch {
            _aiStatus.value = AIStatus.INITIALIZING
            _modelStatus.value = "🔄 Resetting AI..."
            val selectedModelName = preferenceManager.selectedModel.first() ?: ModelDownloader.MODEL_0_5B.fileName
            val modelToLoad = if (selectedModelName == ModelDownloader.MODEL_1_5B.fileName) ModelDownloader.MODEL_1_5B else ModelDownloader.MODEL_0_5B
            val modelFile = ModelDownloader.getModelFile(context, modelToLoad)
            if (modelFile.exists()) {
                AIManager.wipeAndRestartBrain(context, modelFile.absolutePath)
                if (AIManager.isEngineReady) {
                    _aiStatus.value = AIStatus.READY
                    _modelStatus.value = "✅ Ready"
                } else {
                    _aiStatus.value = AIStatus.ERROR
                    _modelStatus.value = "❌ Reset Failed"
                }
            } else { initModel(modelToLoad) }
        }
    }

    fun wipeEverythingAndRestart() {
        viewModelScope.launch {
            _aiStatus.value = AIStatus.INITIALIZING
            _modelStatus.value = "🧹 Wiping..."
            cancelGeneration()
            AIManager.freeLlamaModel()
            AIManager.isEngineReady = false
            val selectedModelName = preferenceManager.selectedModel.first() ?: ModelDownloader.MODEL_0_5B.fileName
            val modelToLoad = if (selectedModelName == ModelDownloader.MODEL_1_5B.fileName) ModelDownloader.MODEL_1_5B else ModelDownloader.MODEL_0_5B
            val modelFile = ModelDownloader.getModelFile(context, modelToLoad)
            if (modelFile.exists()) modelFile.delete()
            initModel(modelToLoad)
        }
    }

    fun initModel(preferredModel: ModelDownloader.ModelInfo = ModelDownloader.MODEL_0_5B) {
        if (_aiStatus.value == AIStatus.READY || _aiStatus.value == AIStatus.INITIALIZING) return
        
        initJob?.cancel()
        initJob = viewModelScope.launch {
            try {
                _aiStatus.value = AIStatus.INITIALIZING
                _modelStatus.value = "🧠 Starting AI..."
                
                // 🚀 SILICON VALLEY PRE-WARMUP: Parallel load with 500ms staggered delay to prevent ANR
                launch { 
                    delay(500)
                    LocalKnowledgeStore.load(context)
                    ExamBankStore.load(context)
                }

                val selectedModelName = preferenceManager.selectedModel.first() ?: preferredModel.fileName
                val modelToLoad = if (selectedModelName == ModelDownloader.MODEL_1_5B.fileName) ModelDownloader.MODEL_1_5B else ModelDownloader.MODEL_0_5B
                val modelFile = ModelDownloader.getModelFile(context, modelToLoad)

                if (modelFile.exists() && modelFile.length() > 50_000_000L) {
                    AIManager.initializeBrain(context, modelFile.absolutePath)
                    if (AIManager.isEngineReady) {
                        _aiStatus.value = AIStatus.READY
                        _modelStatus.value = "✅ Ready"
                    } else {
                        _aiStatus.value = AIStatus.ERROR
                        _modelStatus.value = if (!AIManager.isNativeLibraryLoaded()) "❌ Library Error" else "❌ Start Failed"
                    }
                    return@launch
                }
                
                _aiStatus.value = AIStatus.DOWNLOADING
                if (ModelDownloader.extractBundledModel(context, modelToLoad)) {
                    _aiStatus.value = AIStatus.IDLE
                    initModel(modelToLoad)
                    return@launch
                }

                _modelStatus.value = "📥 Downloading..."
                if (ModelDownloader.downloadModel(context, modelToLoad)) {
                    _aiStatus.value = AIStatus.IDLE 
                    initModel(modelToLoad)
                } else {
                    _aiStatus.value = AIStatus.ERROR
                    _modelStatus.value = "❌ Download Failed"
                }
            } catch (e: Exception) {
                if (e is CancellationException) throw e
                _aiStatus.value = AIStatus.ERROR
                _modelStatus.value = "❌ Error"
            }
        }
    }

    private val _streamBuffer = StringBuilder()

    fun sendMessage(question: String, isLast: Boolean = false, hint: String = "") {
        if (question.isBlank() || _isGenerating.value) return

        AIManager.stopGeneration()
        generationJob?.cancel()
        thinkingAnimationJob?.cancel()

        _isGenerating.value = true
        _isLastQuestion.value = isLast
        synchronized(_streamBuffer) { _streamBuffer.setLength(0) }
        repository.addMessage(ChatMessage(text = question, isUser = true))
        repository.addMessage(ChatMessage(text = "ZEXA IS THINKING", isUser = false))

        startThinkingAnimation()
        startAIGeneration(question, isLast, hint)

        viewModelScope.launch(Dispatchers.IO) {
            delay(5000)
            if (com.zexa.aioffline.util.NetworkUtils.isNetworkAvailable(context)) {
                checkUserStatus()
            }
        }
    }

    private fun startThinkingAnimation() {
        thinkingAnimationJob?.cancel()
        thinkingAnimationJob = viewModelScope.launch(Dispatchers.Main) {
            var dots = 0
            while (_isGenerating.value && _streamBuffer.isEmpty()) {
                val text = "ZEXA IS THINKING" + ".".repeat(dots)
                repository.updateLastMessage(text)
                dots = (dots + 1) % 4
                delay(300)
            }
        }
    }

    private fun stopThinkingAnimation() {
        thinkingAnimationJob?.cancel()
        thinkingAnimationJob = null
    }

    private fun startAIGeneration(question: String, isLast: Boolean, hint: String = "") {
        generationJob = viewModelScope.launch {
            if (_aiStatus.value != AIStatus.READY) {
                _modelStatus.value = "❌ AI not ready"
                _isGenerating.value = false
                return@launch
            }

            try {
                _modelStatus.value = "🧠 Thinking... "

                // 🚀 SILICON VALLEY BYPASS: If we have an exam hint, skip the database search
                val (scoredResult, contextText) = if (hint.isNotBlank()) {
                    Log.d("ChatViewModel", "⚡ Exam Mode detected: Bypassing RAG search for instant reply")
                    null to "[EXAM CONTEXT]: $hint"
                } else {
                    val result = withContext(Dispatchers.Default) {
                        LocalKnowledgeStore.searchScored(context, question, currentLevel)
                    }
                    val sb = StringBuilder()
                    val totalLimit = 800
                    for (item in result.results) {
                        val chunk = item.chunk
                        val header = "[${chunk.topic}] "
                        val spaceLeft = totalLimit - sb.length - header.length
                        if (spaceLeft < 50) break
                        val snippet = if (chunk.content.length > spaceLeft) chunk.content.substring(0, spaceLeft) + "..." else chunk.content
                        sb.append(header).append(snippet).append("\n\n")
                    }
                    result to sb.toString().trim()
                }

                val topMatch = scoredResult?.results?.firstOrNull()
                val secondMatch = scoredResult?.results?.getOrNull(1)
                val queryWordCount = scoredResult?.queryWords?.size ?: 0

                val isHighConfidence = scoredResult != null && topMatch != null &&
                    queryWordCount > 0 &&
                    topMatch.matchedWords.size == queryWordCount &&
                    topMatch.score >= 35 &&
                    (secondMatch == null || topMatch.score - secondMatch.score >= 10)

                if (isHighConfidence && topMatch != null) {
                    finishWithDirectAnswer(question, topMatch.chunk)
                    return@launch
                }

                val historyText = conversationHistory.joinToString("\n") { (q, a) -> "Student: $q\nZEXA: ${a.take(200)}" }
                val finalPrompt = buildPrompt(question, contextText, currentLevel, historyText, hint)
                
                var firstTokenTime = 0L
                val startTime = System.currentTimeMillis()

                AIManager.streamZexaResponse(
                    prompt = finalPrompt,
                    maxTokens = 2000,
                    onTokenReceived = { token ->
                        if (firstTokenTime == 0L) firstTokenTime = System.currentTimeMillis()
                        handleNewToken(token)
                    },
                    onGenerationComplete = {
                        val totalTime = (System.currentTimeMillis() - startTime) / 1000.0
                        val ttft = if (firstTokenTime > 0) (firstTokenTime - startTime) / 1000.0 else 0.0
                        var metrics = String.format("Prefill: %.1fs | Total: %.1fs", ttft, totalTime)
                        if (contextText.isBlank() && !currentLevel.equals("Tertiary", ignoreCase = true)) {
                            metrics += " • General knowledge - verify with textbook"
                        }
                        finishGeneration(question, metrics)
                    }
                )
            } catch (e: Exception) {
                _isGenerating.value = false
                _modelStatus.value = "❌ Error"
            }
        }
    }

    private val uiUpdateHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private var lastUiUpdateTime = 0L
    private val updateRunnable = Runnable { updateUiWithBuffer() }
    private val UI_BATCH_INTERVAL = 50L // 🚀 SILICON VALLEY SPEED: human-eye limit

    private fun handleNewToken(token: String) {
        synchronized(_streamBuffer) { _streamBuffer.append(token) }
        
        // 🎯 FIX: Only stop animation if we have ACTUAL answer text to show.
        // This hides the gap while the model is "thinking" inside <think> blocks.
        val currentCleaned = stripThinkBlock(synchronized(_streamBuffer) { _streamBuffer.toString() })
        if (currentCleaned.isNotBlank()) {
            stopThinkingAnimation()
        }
        
        val now = System.currentTimeMillis()
        if (_streamBuffer.length < 20 || now - lastUiUpdateTime > UI_BATCH_INTERVAL) {
            uiUpdateHandler.removeCallbacks(updateRunnable)
            updateUiWithBuffer()
            lastUiUpdateTime = now
        } else {
            uiUpdateHandler.removeCallbacks(updateRunnable)
            uiUpdateHandler.postDelayed(updateRunnable, UI_BATCH_INTERVAL)
        }
    }

    private fun stripThinkBlock(text: String): String {
        val closed = text.replace(Regex("(?s)<think>.*?</think>"), "")
        val openIndex = closed.indexOf("<think>")
        return if (openIndex >= 0) closed.substring(0, openIndex) else closed
    }

    private fun updateUiWithBuffer(metrics: String? = null) {
        val rawText = synchronized(_streamBuffer) { _streamBuffer.toString() }
        val cleaned = rawText.replace("<|im_end|>", "").replace("<|im_start|>", "").replace("<|end|>", "").replace("<|endoftext|>", "").replace("</s>", "")
        
        // 🚀 SILICON VALLEY POLISH: Aggressively strip leading colons and newlines
        var fastCleanedText = stripThinkBlock(cleaned).trimStart()
        while (fastCleanedText.startsWith(":") || fastCleanedText.startsWith("\n")) {
            fastCleanedText = fastCleanedText.substring(1).trimStart()
        }
        
        // If we're still thinking, don't clear the "Thinking" state yet
        if (fastCleanedText.isBlank() && _isGenerating.value) return

        viewModelScope.launch(Dispatchers.Main) { 
            repository.updateLastMessage(fastCleanedText, metrics) 
        }
    }

    private fun finishGeneration(question: String, metrics: String? = null) {
        uiUpdateHandler.removeCallbacks(updateRunnable)
        stopThinkingAnimation()
        
        viewModelScope.launch(Dispatchers.Main) {
            val rawText = synchronized(_streamBuffer) { _streamBuffer.toString() }
            val cleaned = rawText.replace("<|im_end|>", "").replace("<|im_start|>", "").replace("<|end|>", "").replace("<|endoftext|>", "").replace("</s>", "")
            
            // Final aggressive trim for the Silicon Valley look
            var finalText = cleanLatexFormatting(stripThinkBlock(cleaned)).trim()
            while (finalText.startsWith(":") || finalText.startsWith("\n")) {
                finalText = finalText.substring(1).trim()
            }
            
            if (finalText.isEmpty() || finalText.startsWith("ZEXA IS ")) {
                repository.updateLastMessage("I'm sorry, I couldn't process that. Please rephrase.", metrics)
            } else {
                repository.updateLastMessage(finalText, metrics)
            }
            conversationHistory.addLast(question to finalText)
            if (conversationHistory.size > 4) conversationHistory.removeFirst()
            _isGenerating.value = false
            _modelStatus.value = "✅ Ready"
            _streamBuffer.setLength(0)
        }
    }

    private fun finishWithDirectAnswer(question: String, chunk: KnowledgeChunk) {
        stopThinkingAnimation()
        generationJob = viewModelScope.launch {
            val sourceContent = chunk.content.take(900)
            repository.updateLastMessage("⚡ Found it in the syllabus — polishing your answer...")
            val polishedText = withTimeoutOrNull(9000L) { runPolishPass(question, sourceContent) }
            if (polishedText == null) AIManager.stopGeneration()
            val finalText = polishedText?.takeIf { it.isNotBlank() } ?: sourceContent
            withContext(Dispatchers.Main) {
                val answerText = "$finalText\n\n— Source: ${chunk.topic} (${chunk.source})"
                repository.updateLastMessage(answerText, "⚡ Instant • Syllabus Match")
                conversationHistory.addLast(question to finalText)
                if (conversationHistory.size > 4) conversationHistory.removeFirst()
                _isGenerating.value = false
                _modelStatus.value = "✅ Ready"
                _streamBuffer.setLength(0)
            }
        }
    }

    private suspend fun runPolishPass(question: String, sourceContent: String): String {
        val prompt = buildPolishPrompt(question, sourceContent, currentLevel)
        val sb = StringBuilder()
        AIManager.streamZexaResponse(prompt = prompt, maxTokens = 180, onTokenReceived = { sb.append(it) }, onGenerationComplete = { })
        val cleaned = sb.toString().replace("<|im_end|>", "").replace("<|im_start|>", "").replace("<|end|>", "").replace("<|endoftext|>", "").replace("</s>", "")
        return stripThinkBlock(cleaned).trim()
    }

    private fun buildPolishPrompt(userQuestion: String, sourceContent: String, level: String): String {
        return "<|im_start|>system\nYou are a ZIMSEC $level tutor. Rephrase the SOURCE TEXT below to answer the student's question directly and naturally. Use ONLY facts from the SOURCE TEXT.\n[SOURCE TEXT]: $sourceContent<|im_end|>\n<|im_start|>user\n$userQuestion<|im_end|>\n<|im_start|>assistant\n"
    }

    fun clearChat() { repository.clearHistory(); conversationHistory.clear() }
    fun cancelGeneration() { AIManager.stopGeneration(); generationJob?.cancel(); thinkingAnimationJob?.cancel(); _isGenerating.value = false }

    private fun buildPrompt(userQuestion: String, retrievedContext: String, level: String, history: String = "", hint: String = ""): String {
        val isTertiary = level.equals("Tertiary", ignoreCase = true)
        val persona = if (isTertiary) "Expert Tertiary Tutor" else "ZIMSEC $level Tutor"
        
        // 🚀 ULTRA-THIN PROTOCOL: Zero-Latency Prefill
        val contextBlock = if (retrievedContext.isNotBlank()) "\n[CONTEXT]: $retrievedContext" else ""
        val historyBlock = if (history.isNotBlank()) "\n[CHAT]: $history" else ""
        val hintBlock = if (hint.isNotBlank()) "\n[EXAM]: $hint" else ""

        val instruction = if (retrievedContext.isBlank() && !isTertiary) {
            "Answer from general knowledge but mention it."
        } else {
            "Answer accurately based on context."
        }

        return "<|im_start|>system\nYou are $persona. $instruction No rambling. /no_think$hintBlock$contextBlock$historyBlock<|im_end|>\n<|im_start|>user\n$userQuestion<|im_end|>\n<|im_start|>assistant\n"
    }

    private fun cleanLatexFormatting(text: String): String {
        var cleaned = text
        cleaned = cleaned.replace(Regex("\\\\text\\{([^}]*)\\}")) { it.groupValues[1] }
        cleaned = cleaned.replace(Regex("([_^])\\{([^}]*)\\}")) { it.groupValues[1] + it.groupValues[2] }
        cleaned = cleaned.replace("{", "").replace("}", "")
        cleaned = cleaned.replace("\\\\rightarrow", "->")
        cleaned = cleaned.replace("\\\\leftarrow", "<-")
        cleaned = cleaned.replace("\\\\times", "x")
        cleaned = cleaned.replace("\\\\cdot", "·")
        cleaned = cleaned.replace("\\\\geq", ">=")
        cleaned = cleaned.replace("\\\\leq", "<=")
        cleaned = cleaned.replace("\\\\neq", "!=")
        cleaned = cleaned.replace(Regex("\\\\[a-zA-Z]+\\\\s?"), "")
        return cleaned
    }
}
