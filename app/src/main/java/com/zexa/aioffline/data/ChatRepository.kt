package com.zexa.aioffline.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/**
 * 🎯 CHAT HISTORY PERSISTENCE: previously this repository was purely
 * in-memory (a MutableStateFlow that reset to empty on every process death),
 * so a student's whole conversation vanished if the app was closed, backgrounded
 * long enough to be killed by the OS, or the phone restarted mid-session. For a
 * study app that's a real usability problem - a student re-opening the app to
 * review an earlier explanation would just find an empty chat.
 *
 * This now persists messages to a small JSON file in the app's private storage
 * (not a database - the message volume for a single-device study app doesn't
 * need one, and this avoids pulling in Room for a small model class). History
 * is loaded once on repository creation and saved after every change, debounced
 * onto a background thread so writes never block the UI.
 */
class ChatRepository(private val context: Context? = null) {
    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages

    private val repoScope = CoroutineScope(Dispatchers.IO)
    private val historyFile: File? = context?.let { File(it.filesDir, "chat_history.json") }

    // Cap how much history is kept on disk - unbounded history is both a
    // storage-growth and a startup-load-time problem over months of daily use.
    private val MAX_PERSISTED_MESSAGES = 300

    init {
        // 🎯 MAIN-THREAD I/O FIX: ChatRepository is constructed synchronously on
        // the main thread (ChatViewModel is created via `by viewModels()` on
        // first access, before onCreate's collectors even start). Calling
        // loadFromDisk() directly here would mean blocking file I/O on the main
        // thread during app startup - a StrictMode violation risk and a real
        // (if usually small) ANR risk on slow storage or a large history file.
        // Loading in the background and letting the StateFlow update once ready
        // means ChatActivity's collector (which replays the current value on
        // collection) picks up the restored messages a moment later instead of
        // the constructor blocking to have them ready instantly - a few
        // milliseconds delay is a much safer trade than blocking the main thread.
        if (historyFile != null) {
            repoScope.launch { loadFromDisk() }
        }
    }

    private fun loadFromDisk() {
        val file = historyFile ?: return
        if (!file.exists()) return
        try {
            val jsonText = file.readText()
            val arr = JSONArray(jsonText)
            val restored = mutableListOf<ChatMessage>()
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                restored.add(
                    ChatMessage(
                        id = obj.optString("id"),
                        text = obj.optString("text"),
                        isUser = obj.optBoolean("isUser"),
                        timestamp = obj.optLong("timestamp"),
                        metrics = if (obj.has("metrics") && !obj.isNull("metrics")) obj.optString("metrics") else null
                    )
                )
            }
            _messages.value = restored
            Log.d("ChatRepository", "✅ Restored ${restored.size} messages from disk")
        } catch (e: Exception) {
            // Corrupt or unreadable history file: don't crash the app over old
            // chat history - just start fresh, same as first launch.
            Log.e("ChatRepository", "Failed to load chat history, starting fresh", e)
        }
    }

    private fun saveToDisk(messagesToSave: List<ChatMessage>) {
        val file = historyFile ?: return
        repoScope.launch {
            try {
                val trimmed = if (messagesToSave.size > MAX_PERSISTED_MESSAGES) {
                    messagesToSave.takeLast(MAX_PERSISTED_MESSAGES)
                } else {
                    messagesToSave
                }
                val arr = JSONArray()
                for (msg in trimmed) {
                    val obj = JSONObject()
                    obj.put("id", msg.id)
                    obj.put("text", msg.text)
                    obj.put("isUser", msg.isUser)
                    obj.put("timestamp", msg.timestamp)
                    obj.put("metrics", msg.metrics)
                    arr.put(obj)
                }
                // Write to a temp file first and rename, so a crash mid-write
                // never leaves a half-written, corrupt history file behind.
                val tempFile = File(file.parentFile, "${file.name}.tmp")
                tempFile.writeText(arr.toString())
                tempFile.renameTo(file)
            } catch (e: Exception) {
                Log.e("ChatRepository", "Failed to save chat history", e)
            }
        }
    }

    fun addMessage(message: ChatMessage) {
        val currentList = _messages.value.toMutableList()
        currentList.add(message)
        _messages.value = currentList
        saveToDisk(currentList)
    }

    fun updateLastMessage(newText: String, metrics: String? = null) {
        val currentList = _messages.value.toMutableList()
        if (currentList.isNotEmpty()) {
            val lastIndex = currentList.size - 1
            val lastMsg = currentList[lastIndex]
            currentList[lastIndex] = lastMsg.copy(text = newText, metrics = metrics ?: lastMsg.metrics)
            _messages.value = currentList
            // Note: NOT saved to disk on every streaming token update (that would
            // be excessive disk I/O during generation) - only the final saved
            // state after generation completes matters for persistence. See
            // ChatViewModel.finishGeneration(), which should call
            // persistFinalState() once generation is done.
        }
    }

    /** Call once after a message has finished streaming/updating, to persist the final text. */
    fun persistFinalState() {
        saveToDisk(_messages.value)
    }

    fun clearHistory() {
        _messages.value = emptyList()
        historyFile?.let { file ->
            repoScope.launch {
                try {
                    if (file.exists()) file.delete()
                } catch (e: Exception) {
                    Log.e("ChatRepository", "Failed to delete chat history file", e)
                }
            }
        }
    }
}
