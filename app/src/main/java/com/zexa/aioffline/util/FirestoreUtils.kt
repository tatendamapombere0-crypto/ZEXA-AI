package com.zexa.aioffline.util

import com.google.firebase.Timestamp
import java.util.Date

object FirestoreUtils {
    /**
     * Safely reads a date field as Long, handling both Timestamp and Long types.
     */
    fun getDateAsLong(data: Map<String, Any?>, key: String, defaultValue: Long = 0L): Long {
        return when (val value = data[key]) {
            is com.google.firebase.Timestamp -> value.toDate().time
            is Long -> value
            is Number -> value.toLong()
            else -> defaultValue
        }
    }

    /**
     * Safely reads a boolean field, handling Boolean and String variants.
     */
    fun getBooleanSafe(data: Map<String, Any?>, keys: List<String>, defaultValue: Boolean = false): Boolean {
        for (key in keys) {
            val value = data[key]
            if (value is Boolean) return value
            if (value is String) {
                if (value.equals("true", ignoreCase = true)) return true
                if (value.equals("false", ignoreCase = true)) return false
            }
        }
        return defaultValue
    }

    /**
     * Safely reads a string field from multiple possible keys.
     */
    fun getStringSafe(data: Map<String, Any?>, keys: List<String>, defaultValue: String = ""): String {
        for (key in keys) {
            val value = data[key]
            if (value is String && value.isNotBlank()) return value
        }
        return defaultValue
    }

    /**
     * Converts a Long timestamp to a Firestore Timestamp.
     */
    fun toTimestamp(millis: Long): Timestamp {
        return Timestamp(Date(millis))
    }
    
    /**
     * Returns a Timestamp for the current time.
     */
    fun now(): Timestamp {
        return Timestamp(Date())
    }
}
