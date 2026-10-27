package com.zexa.aioffline.util

import com.zexa.ai.zimsec.core.TermCalendarManager
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object OfflineActivationManager {
    private const val SECRET_KEY = "01161996"

    /**
     * Generates the expected activation code for today.
     * Sequence: Day|Year|Term|Month|01161996
     */
    fun generateDailyCode(): String {
        val now = java.time.LocalDate.now()
        val day = String.format("%02d", now.dayOfMonth)
        val year = now.year.toString()
        val month = String.format("%02d", now.monthValue)
        
        val currentPeriod = TermCalendarManager.getCurrentPeriod(now)
        var termNum = when {
            currentPeriod.id.startsWith("term1") -> 1
            currentPeriod.id.startsWith("term2") -> 2
            currentPeriod.id.startsWith("term3") -> 3
            else -> 0
        }
        
        // If in holiday, the activation code usually refers to the upcoming term
        if (termNum == 0) {
            val terms = TermCalendarManager.getTermsForYear(now.year).values.sortedBy { it.startDate }
            val nextTerm = terms.find { it.startDate.isAfter(now) }
            termNum = when {
                nextTerm?.id?.startsWith("term1") == true -> 1
                nextTerm?.id?.startsWith("term2") == true -> 2
                nextTerm?.id?.startsWith("term3") == true -> 3
                else -> 3 // Fallback
            }
        }
        
        val term = String.format("%02d", termNum)
        return "$day$year$term$month$SECRET_KEY"
    }

    fun validateCode(input: String?): Boolean {
        if (input.isNullOrBlank()) return false
        return input.trim() == generateDailyCode()
    }
}
