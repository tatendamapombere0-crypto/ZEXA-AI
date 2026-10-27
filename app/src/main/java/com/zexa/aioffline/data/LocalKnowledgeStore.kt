package com.zexa.aioffline.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONArray
import org.json.JSONObject

object LocalKnowledgeStore {
    private const val TAG = "ZEXA_Knowledge"
    private var allChunks: List<KnowledgeChunk> = emptyList()
    private var keywordIndex: Map<String, List<KnowledgeChunk>> = emptyMap()

    private const val SEARCH_CACHE_MAX_SIZE = 200
    private const val MAX_CHUNK_CONTENT_LENGTH = 3000

    data class ScoredChunk(val chunk: KnowledgeChunk, val score: Int, val matchedWords: Set<String>)
    data class ScoredSearchResult(val results: List<ScoredChunk>, val queryWords: List<String>)

    private val searchCache = object : LinkedHashMap<String, ScoredSearchResult>(16, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, ScoredSearchResult>?): Boolean {
            return size > SEARCH_CACHE_MAX_SIZE
        }
    }
    private val searchCacheLock = Any()
    private val loadMutex = Mutex()

    private fun normalizeLevel(level: String): String {
        return level.replace("-", "").replace(" ", "").lowercase()
    }

    suspend fun load(context: Context): Boolean {
        if (allChunks.isNotEmpty()) return true
        return loadMutex.withLock {
            if (allChunks.isNotEmpty()) return@withLock true
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📂 Starting optimized knowledge base load...")
                    val startTime = System.currentTimeMillis()
                    val assetFiles = context.assets.list("") ?: emptyArray()
                    val zimsecFiles = assetFiles.filter {
                        it.endsWith(".json") && (it.startsWith("zimsec_", ignoreCase = true) || it.startsWith("zimsec ", ignoreCase = true))
                    }
                    
                    allChunks = coroutineScope {
                        zimsecFiles.map { fileName ->
                            async {
                                val fileChunks = mutableListOf<KnowledgeChunk>()
                                try {
                                    val jsonString = context.assets.open(fileName).bufferedReader().use { it.readText() }
                                    val trimmed = jsonString.trim()
                                    val defaultLevel = if (fileName.contains("primary", ignoreCase = true)) "Primary" else "O-Level"
                                    
                                    if (trimmed.startsWith("[")) {
                                        val jsonArray = JSONArray(jsonString)
                                        for (i in 0 until jsonArray.length()) {
                                            val obj = jsonArray.getJSONObject(i)
                                            val chunk = parseFlatChunk(obj, defaultLevel)
                                            if (chunk.content.isNotBlank()) fileChunks.add(chunk)
                                        }
                                    } else if (trimmed.startsWith("{")) {
                                        val jsonObj = JSONObject(jsonString)
                                        val metadata = jsonObj.optJSONObject("metadata") ?: jsonObj.optJSONObject("meta")
                                        val fileLevel = metadata?.optString("level") ?: jsonObj.optString("level", defaultLevel)
                                        val fileSubject = metadata?.optString("subject") ?: jsonObj.optString("subject", "General")
                                        
                                        if (jsonObj.has("structure")) {
                                            flattenHierarchicalJson(jsonObj, fileChunks)
                                        } else {
                                            deepFlattenJson(jsonObj, fileChunks, fileLevel, fileSubject)
                                        }
                                        
                                        if (fileChunks.isEmpty()) {
                                            val chunk = parseFlatChunk(jsonObj, fileLevel)
                                            if (chunk.content.isNotBlank()) fileChunks.add(chunk)
                                        }
                                    }
                                } catch (e: Exception) {
                                    Log.e(TAG, "Error loading $fileName", e)
                                }
                                fileChunks
                            }
                        }.awaitAll().flatten()
                    }

                    buildKeywordIndex()
                    Log.d(TAG, "✅ Loaded ${allChunks.size} chunks in ${System.currentTimeMillis() - startTime}ms")
                    true
                } catch (e: Exception) {
                    Log.e(TAG, "Critical error loading knowledge base", e)
                    false
                }
            }
        }
    }

    private fun parseFlatChunk(obj: JSONObject, defaultLevel: String): KnowledgeChunk {
        val content = obj.optString("content", "")
        return KnowledgeChunk(
            id = obj.optString("id", java.util.UUID.randomUUID().toString()),
            level = obj.optString("level", defaultLevel),
            subject = obj.optString("subject", "General"),
            topic = obj.optString("topic", obj.optString("title", "General Information")),
            content = content,
            source = obj.optString("source", "ZIMSEC"),
            keywords = extractKeywords(obj)
        )
    }

    private fun flattenHierarchicalJson(obj: JSONObject, out: MutableList<KnowledgeChunk>) {
        val level = obj.optString("level", "O-Level")
        val subject = obj.optString("subject", "General")
        val structure = obj.optJSONArray("structure") ?: return
        for (i in 0 until structure.length()) {
            val item = structure.getJSONObject(i)
            // Handle possible nested terms/forms
            if (item.has("terms")) {
                val terms = item.getJSONArray("terms")
                for (j in 0 until terms.length()) {
                    val termObj = terms.getJSONObject(j)
                    if (termObj.has("topics")) {
                        val topics = termObj.getJSONArray("topics")
                        for (k in 0 until topics.length()) {
                            processTopicNode(topics.getJSONObject(k), out, level, subject)
                        }
                    }
                }
            } else {
                processTopicNode(item, out, level, subject)
            }
        }
    }
    
    private fun processTopicNode(topicObj: JSONObject, out: MutableList<KnowledgeChunk>, level: String, subject: String) {
        val topicName = topicObj.optString("topic", topicObj.optString("title", "General"))
        val content = topicObj.optString("content", "")
        
        if (content.isNotBlank()) {
            if (content.length > MAX_CHUNK_CONTENT_LENGTH) {
                chunkLongText(content, 2500, 250).forEachIndexed { index, subContent ->
                    out.add(KnowledgeChunk(
                        id = "${topicName.hashCode()}_$index",
                        level = level,
                        subject = subject,
                        topic = if (index == 0) topicName else "$topicName (part ${index + 1})",
                        content = subContent,
                        source = "ZIMSEC",
                        keywords = listOf(topicName, subject)
                    ))
                }
            } else {
                out.add(KnowledgeChunk(
                    id = topicName.hashCode().toString(),
                    level = level,
                    subject = subject,
                    topic = topicName,
                    content = content,
                    source = "ZIMSEC",
                    keywords = listOf(topicName, subject)
                ))
            }
        }
        
        // Handle subtopics recursively
        if (topicObj.has("subtopics")) {
            val subs = topicObj.getJSONArray("subtopics")
            for (i in 0 until subs.length()) {
                processTopicNode(subs.getJSONObject(i), out, level, subject)
            }
        }
    }

    private fun deepFlattenJson(obj: JSONObject, out: MutableList<KnowledgeChunk>, level: String, subject: String, parentKey: String = "", depth: Int = 0) {
        if (depth > 10) return
        val keys = obj.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            if (key == "meta" || key == "paperInfo" || key == "structure") continue
            val value = obj.opt(key) ?: continue
            val currentPath = if (parentKey.isEmpty()) key else "$parentKey > $key"
            when (value) {
                is String -> {
                    if (value.length > 40) {
                        out.add(KnowledgeChunk(
                            id = currentPath.hashCode().toString(),
                            level = level,
                            subject = subject,
                            topic = currentPath,
                            content = value,
                            source = "ZIMSEC",
                            keywords = currentPath.split(">").map { it.trim().lowercase() } + subject.lowercase()
                        ))
                    }
                }
                is JSONArray -> {
                    val sb = StringBuilder()
                    var hasObjects = false
                    for (i in 0 until value.length()) {
                        val item = value.opt(i)
                        if (item is String) sb.append(item).append("\n")
                        else if (item is JSONObject) {
                            hasObjects = true
                            deepFlattenJson(item, out, level, subject, "$currentPath [${i+1}]", depth + 1)
                        }
                    }
                    if (!hasObjects && sb.length > 40) {
                        out.add(KnowledgeChunk(
                            id = currentPath.hashCode().toString(),
                            level = level,
                            subject = subject,
                            topic = currentPath,
                            content = sb.toString().trim(),
                            source = "ZIMSEC",
                            keywords = currentPath.split(">").map { it.trim().lowercase() } + subject.lowercase()
                        ))
                    }
                }
                is JSONObject -> deepFlattenJson(value, out, level, subject, currentPath, depth + 1)
            }
        }
    }

    private fun chunkLongText(text: String, size: Int, overlap: Int): List<String> {
        val chunks = mutableListOf<String>()
        var start = 0
        while (start < text.length) {
            val end = minOf(start + size, text.length)
            chunks.add(text.substring(start, end))
            if (end == text.length) break
            start = end - overlap
        }
        return chunks
    }

    private fun extractKeywords(obj: JSONObject): List<String> {
        val kws = mutableSetOf<String>()
        obj.optJSONArray("keywords")?.let {
            for (i in 0 until it.length()) kws.add(it.getString(i).lowercase())
        }
        if (kws.isEmpty()) {
            kws.addAll(obj.optString("topic").lowercase().split(" ").filter { it.length > 3 })
            kws.addAll(obj.optString("subject").lowercase().split(" ").filter { it.length > 3 })
        }
        return kws.toList()
    }

    private fun buildKeywordIndex() {
        val index = mutableMapOf<String, MutableList<KnowledgeChunk>>()
        allChunks.forEach { chunk ->
            chunk.keywords.forEach { kw ->
                index.getOrPut(kw.lowercase()) { mutableListOf() }.add(chunk)
            }
        }
        keywordIndex = index
    }

    private fun stem(word: String): String {
        return word.lowercase()
            .replace(Regex("ies$"), "y")
            .replace(Regex("es$"), "")
            .replace(Regex("s$"), "")
            .replace(Regex("ing$"), "")
            .replace(Regex("ed$"), "")
    }

    private fun scoreCandidates(query: String, level: String): ScoredSearchResult {
        val stopWords = setOf("what", "when", "where", "which", "who", "whom", "whose", "why", "how", "the", "and", "for", "with", "from", "that", "this", "these", "those")
        val queryWords = query.lowercase().split(Regex("[^a-zA-Z0-9]+"))
            .filter { it.length > 2 && !stopWords.contains(it) }
        val effectiveQueryWords = queryWords.ifEmpty {
            query.lowercase().split(Regex("[^a-zA-Z0-9]+")).filter { it.length > 2 }
        }
        if (effectiveQueryWords.isEmpty()) return ScoredSearchResult(emptyList(), emptyList())

        val normLevel = normalizeLevel(level)
        val candidates = allChunks.filter { normalizeLevel(it.level) == normLevel || normalizeLevel(it.level) == "general" }

        val scored = candidates.map { chunk ->
            var score = 0
            val matchedWords = mutableSetOf<String>()
            for (word in effectiveQueryWords) {
                val stemmed = stem(word)
                var wordMatched = false
                if (chunk.topicLower.contains(word) || chunk.topicLower.contains(stemmed)) { score += 50; wordMatched = true }
                if (chunk.subjectLower.contains(word)) { score += 15; wordMatched = true }
                if (chunk.keywordsLower.any { it == word || (word.length >= 4 && it.contains(word)) }) { score += 45; wordMatched = true }
                if (chunk.contentLower.contains(word)) { score += 25; wordMatched = true }
                if (wordMatched) matchedWords.add(word)
            }
            ScoredChunk(chunk, score, matchedWords)
        }.filter {
            val threshold = if (effectiveQueryWords.size <= 2) 1 else (effectiveQueryWords.size * 0.4).toInt().coerceAtLeast(1)
            it.score >= 20 && it.matchedWords.size >= threshold
        }.sortedByDescending { it.score }.take(5)

        return ScoredSearchResult(scored, effectiveQueryWords)
    }

    suspend fun searchScored(context: Context, query: String, level: String): ScoredSearchResult {
        load(context)
        val cacheKey = "$query|$level"
        synchronized(searchCacheLock) { searchCache[cacheKey]?.let { return it } }
        val result = scoreCandidates(query, level)
        synchronized(searchCacheLock) { searchCache[cacheKey] = result }
        return result
    }

    suspend fun getSubjects(level: String, context: Context): List<String> {
        load(context)
        val normLevel = normalizeLevel(level)
        return allChunks.filter { normalizeLevel(it.level) == normLevel || normalizeLevel(it.level) == "general" }.map { it.subject }.distinct().sorted()
    }

    suspend fun getTopics(level: String, subject: String, context: Context): List<KnowledgeChunk> {
        load(context)
        val normLevel = normalizeLevel(level)
        return allChunks.filter { it.subject.equals(subject, ignoreCase = true) && (normalizeLevel(it.level) == normLevel || normalizeLevel(it.level) == "general") }
    }
}
