package com.zexa.aioffline.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class PreferenceManager(private val context: Context) {

    companion object {
        val SETUP_COMPLETED = booleanPreferencesKey("setup_completed")
        val LEVEL_SELECTED = booleanPreferencesKey("is_level_selected")
        val MODEL_DOWNLOADED = booleanPreferencesKey("is_model_downloaded")
        val EDUCATION_LEVEL = stringPreferencesKey("education_level")
        // 🎯 NEW: EDUCATION_LEVEL stores the billing tier ("Primary Education" /
        // "Secondary Education" / "Tertiary Education") and is left untouched —
        // StudyLevelManager's pricing map and existing Firestore user docs both
        // key off those exact strings. CONTENT_LEVEL is a separate, additive
        // field for the granular level LocalKnowledgeStore/ExamBankStore actually
        // filter content by ("Primary" / "O-Level" / "A-Level" / "Tertiary") —
        // previously nothing ever set this correctly, which meant RAG retrieval,
        // Study Pack, and Exam Mode silently matched zero content for everyone.
        val CONTENT_LEVEL = stringPreferencesKey("content_level")
        val SELECTED_MODEL = stringPreferencesKey("selected_model")
        val MODEL_READY = booleanPreferencesKey("model_ready")
        val IS_PREMIUM = booleanPreferencesKey("is_premium")
        val OFFLINE_QUERY_COUNT = intPreferencesKey("offline_query_count")
        val LAST_QUERY_DATE = stringPreferencesKey("last_query_date")
        val DAILY_LIMIT = intPreferencesKey("daily_limit")
        val TERM_END_DATE = longPreferencesKey("term_end_date")
        val IS_GUEST_MODE = booleanPreferencesKey("is_guest_mode")
    }

    val isSetupCompleted: Flow<Boolean> = context.dataStore.data.map { it[SETUP_COMPLETED] ?: false }
    val isLevelSelected: Flow<Boolean> = context.dataStore.data.map { it[LEVEL_SELECTED] ?: false }
    val isModelDownloaded: Flow<Boolean> = context.dataStore.data.map { it[MODEL_DOWNLOADED] ?: false }
    val educationLevel: Flow<String?> = context.dataStore.data.map { it[EDUCATION_LEVEL] }
    val contentLevel: Flow<String?> = context.dataStore.data.map { it[CONTENT_LEVEL] }
    val selectedModel: Flow<String?> = context.dataStore.data.map { it[SELECTED_MODEL] }
    val isModelReady: Flow<Boolean> = context.dataStore.data.map { it[MODEL_READY] ?: false }
    val isPremium: Flow<Boolean> = context.dataStore.data.map { it[IS_PREMIUM] ?: false }
    val offlineQueryCount: Flow<Int> = context.dataStore.data.map { it[OFFLINE_QUERY_COUNT] ?: 0 }
    val lastQueryDate: Flow<String> = context.dataStore.data.map { it[LAST_QUERY_DATE] ?: "" }
    val dailyLimit: Flow<Int> = context.dataStore.data.map { it[DAILY_LIMIT] ?: 2 }
    val termEndDate: Flow<Long> = context.dataStore.data.map { it[TERM_END_DATE] ?: 0L }
    val isGuestMode: Flow<Boolean> = context.dataStore.data.map { it[IS_GUEST_MODE] ?: false }

    suspend fun setSetupCompleted(completed: Boolean) {
        context.dataStore.edit { it[SETUP_COMPLETED] = completed }
    }

    suspend fun setGuestMode(isGuest: Boolean) {
        context.dataStore.edit { it[IS_GUEST_MODE] = isGuest }
    }

    suspend fun setLevelSelected(selected: Boolean) {
        context.dataStore.edit { it[LEVEL_SELECTED] = selected }
    }

    suspend fun setModelDownloaded(downloaded: Boolean) {
        context.dataStore.edit { it[MODEL_DOWNLOADED] = downloaded }
    }

    suspend fun setEducationLevel(level: String) {
        context.dataStore.edit { it[EDUCATION_LEVEL] = level }
    }

    suspend fun setContentLevel(level: String) {
        context.dataStore.edit { it[CONTENT_LEVEL] = level }
    }

    suspend fun setSelectedModel(modelPath: String) {
        context.dataStore.edit { it[SELECTED_MODEL] = modelPath }
    }

    suspend fun setModelReady(ready: Boolean) {
        context.dataStore.edit { it[MODEL_READY] = ready }
    }

    suspend fun setPremiumStatus(isPremium: Boolean) {
        context.dataStore.edit { it[IS_PREMIUM] = isPremium }
    }

    suspend fun setDailyLimit(limit: Int) {
        context.dataStore.edit { it[DAILY_LIMIT] = limit }
    }

    suspend fun setTermEndDate(expiry: Long) {
        context.dataStore.edit { it[TERM_END_DATE] = expiry }
    }

    suspend fun clearSubscription() {
        context.dataStore.edit { preferences ->
            preferences[IS_PREMIUM] = false
            preferences[TERM_END_DATE] = 0L
        }
    }

    suspend fun updateOfflineQueryCount(count: Int, date: String) {
        context.dataStore.edit { preferences ->
            val currentCount = preferences[OFFLINE_QUERY_COUNT] ?: 0
            val currentDate = preferences[LAST_QUERY_DATE] ?: ""
            
            if (date == currentDate) {
                // Only update if the new count is higher (prevents stale server syncs from resetting local progress)
                if (count > currentCount) {
                    preferences[OFFLINE_QUERY_COUNT] = count
                }
            } else {
                // New day: reset counter and update date
                preferences[OFFLINE_QUERY_COUNT] = count
                preferences[LAST_QUERY_DATE] = date
            }
        }
    }
}
