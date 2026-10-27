package com.zexa.aioffline.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import org.json.JSONObject

data class ExamOption(val letter: String, val text: String)

data class ExamQuestion(
    val id: String,
    val questionNumber: Int,
    val questionText: String,
    val options: List<ExamOption>,
    val correctAnswer: String?,
    val explanation: String,
    val answerConfidence: String
) {
    fun toChatPrompt(): String {
        val sb = StringBuilder()
        sb.append("Question $questionNumber: $questionText\n")
        for (opt in options) sb.append("${opt.letter}) ${opt.text}\n")
        return sb.toString().trim()
    }
}

data class ExamPaper(
    val subject: String,
    val level: String,
    val paperCode: String,
    val paperName: String,
    val paperType: String,
    val questions: List<ExamQuestion>,
    val sourceFile: String
)

object ExamBankStore {
    private const val TAG = "ZEXA_ExamBank"
    private var allPapers: List<ExamPaper> = emptyList()
    private val loadMutex = Mutex()

    private fun normalizeLevel(level: String): String {
        return level.replace("-", "").replace(" ", "").lowercase()
    }

    suspend fun load(context: Context): Boolean {
        if (allPapers.isNotEmpty()) return true
        return loadMutex.withLock {
            if (allPapers.isNotEmpty()) return@withLock true
            withContext(Dispatchers.IO) {
                try {
                    Log.i(TAG, "📂 Starting exam bank load...")
                    val assetFiles = context.assets.list("") ?: emptyArray()
                    val examFiles = assetFiles.filter { it.endsWith(".json") && (it.startsWith("exam_bank_") || it.contains("exam_bank")) }

                    allPapers = coroutineScope {
                        examFiles.map { fileName ->
                            async {
                                val filePapers = mutableListOf<ExamPaper>()
                                try {
                                    val jsonString = context.assets.open(fileName).bufferedReader().use { it.readText() }
                                    val root = JSONObject(jsonString)
                                    val info = root.optJSONObject("paperInfo") ?: return@async filePapers
                                    val questionsArr = root.optJSONArray("questions") ?: return@async filePapers

                                    val questions = mutableListOf<ExamQuestion>()
                                    for (i in 0 until questionsArr.length()) {
                                        val q = questionsArr.optJSONObject(i) ?: continue
                                        val optionsArr = q.optJSONArray("options")
                                        val options = mutableListOf<ExamOption>()
                                        if (optionsArr != null) {
                                            for (j in 0 until optionsArr.length()) {
                                                val o = optionsArr.opt(j)
                                                if (o is JSONObject) options.add(ExamOption(o.optString("letter"), o.optString("text")))
                                                else if (o is String) options.add(ExamOption(('A' + j).toString(), o))
                                            }
                                        }
                                        questions.add(ExamQuestion(q.optString("id", "q_$i"), q.optInt("questionNumber", i + 1), q.optString("questionText"), options, if (q.isNull("correctAnswer")) null else q.optString("correctAnswer"), q.optString("explanation", ""), q.optString("answerConfidence", "medium")))
                                    }
                                    filePapers.add(ExamPaper(info.optString("subject", "General"), info.optString("level", "O-Level"), info.optString("paperCode", fileName), info.optString("paperName", "Exam Paper"), info.optString("paperType", "Past Paper"), questions, fileName))
                                } catch (e: Exception) { Log.e(TAG, "❌ Failed to parse: $fileName", e) }
                                filePapers
                            }
                        }.awaitAll().flatten()
                    }
                    Log.i(TAG, "🎯 Exam bank load complete. Total papers: ${allPapers.size}")
                    true
                } catch (e: Exception) { Log.e(TAG, "❌ Exam bank load critical error", e); false }
            }
        }
    }

    suspend fun getSubjects(context: Context, level: String): List<String> {
        load(context)
        val normLevel = normalizeLevel(level)
        val highLevelSubjects = setOf("Biology", "Chemistry", "Combined Science", "Computer Science", "Economics", "Geography", "History", "Physics")

        return allPapers.filter { 
            val paperLevel = normalizeLevel(it.level)
            val matchesLevel = paperLevel == normLevel || paperLevel == "general"
            if (normLevel == "primary") paperLevel == "primary" || (paperLevel == "general" && !highLevelSubjects.contains(it.subject))
            else matchesLevel
        }.map { it.subject }.distinct().sorted()
    }

    suspend fun getPapers(context: Context, level: String, subject: String): List<ExamPaper> {
        load(context)
        val normLevel = normalizeLevel(level)
        val highLevelSubjects = setOf("Biology", "Chemistry", "Combined Science", "Computer Science", "Economics", "Geography", "History", "Physics")

        return allPapers.filter {
            val paperLevel = normalizeLevel(it.level)
            val isValidForLevel = if (normLevel == "primary") paperLevel == "primary" || (paperLevel == "general" && !highLevelSubjects.contains(it.subject))
            else paperLevel == normLevel || paperLevel == "general"
            it.subject.equals(subject, ignoreCase = true) && isValidForLevel
        }
    }
}
