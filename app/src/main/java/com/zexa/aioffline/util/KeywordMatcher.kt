package com.zexa.aioffline.util

import com.zexa.aioffline.data.KnowledgeChunk

object KeywordMatcher {
    fun findRelevantChunks(query: String, chunks: List<KnowledgeChunk>, limit: Int = 4): List<KnowledgeChunk> {
        val queryWords = query.lowercase().split(" ", ",", ".", "?").filter { it.length > 3 }
        if (queryWords.isEmpty()) return emptyList()

        return chunks.map { chunk ->
            val score = queryWords.count { word ->
                chunk.topic.lowercase().contains(word) ||
                chunk.content.lowercase().contains(word) ||
                chunk.keywords.any { it.lowercase().contains(word) }
            }
            chunk to score
        }
        .filter { it.second > 0 }
        .sortedByDescending { it.second }
        .take(limit)
        .map { it.first }
    }
}
