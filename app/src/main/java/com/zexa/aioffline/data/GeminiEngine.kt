package com.zexa.aioffline.data

import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.BlockThreshold
import com.google.ai.client.generativeai.type.HarmCategory
import com.google.ai.client.generativeai.type.SafetySetting
import com.google.ai.client.generativeai.type.content
import com.google.ai.client.generativeai.type.generationConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

object GeminiEngine {
    // Note: In a real app, this should be moved to local.properties or a secure backend
    private const val API_KEY = "YOUR_GEMINI_API_KEY_HERE" 

    fun isEnabled() = API_KEY.isNotBlank() && !API_KEY.contains("YOUR_GEMINI_API_KEY")

    private val config = generationConfig {
        temperature = 0.1f
        topK = 40
        topP = 0.95f
        maxOutputTokens = 1024
    }

    private val safetySettings = listOf(
        SafetySetting(HarmCategory.HARASSMENT, BlockThreshold.MEDIUM_AND_ABOVE),
        SafetySetting(HarmCategory.HATE_SPEECH, BlockThreshold.MEDIUM_AND_ABOVE),
        SafetySetting(HarmCategory.SEXUALLY_EXPLICIT, BlockThreshold.MEDIUM_AND_ABOVE),
        SafetySetting(HarmCategory.DANGEROUS_CONTENT, BlockThreshold.MEDIUM_AND_ABOVE),
    )

    private val generativeModel = GenerativeModel(
        modelName = "gemini-1.5-flash",
        apiKey = API_KEY,
        generationConfig = config,
        safetySettings = safetySettings
    )

    fun streamResponse(prompt: String): Flow<String> {
        return generativeModel.generateContentStream(prompt).map { response ->
            response.text ?: ""
        }
    }
}
