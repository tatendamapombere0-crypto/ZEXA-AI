package com.zexa.aioffline.data

import java.util.UUID

data class KnowledgeChunk(
    val id: String,
    val level: String,
    val subject: String,
    val topic: String,
    val content: String,
    val source: String,
    val keywords: List<String>
) {
    val topicLower by lazy { topic.lowercase() }
    val contentLower by lazy { content.lowercase() }
    val subjectLower by lazy { subject.lowercase() }
    val keywordsLower by lazy { keywords.map { it.lowercase() } }
}

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    var text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    var metrics: String? = null
)
