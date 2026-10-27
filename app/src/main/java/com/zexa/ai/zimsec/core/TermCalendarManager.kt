package com.zexa.ai.zimsec.core

import java.time.LocalDate
import java.time.temporal.ChronoUnit

object TermCalendarManager {

    data class AcademicTerm(
        val id: String,
        val name: String,
        val startDate: LocalDate,
        val endDate: LocalDate,
        val requiresPayment: Boolean,
        val price: Double = 5.00
    )

    /**
     * Dynamically generates terms for ANY given year with UNIQUE IDs
     */
    fun getTermsForYear(year: Int): Map<String, AcademicTerm> {
        return mapOf(
            "term1_$year" to AcademicTerm("term1_$year", "First Term $year", LocalDate.of(year, 1, 11), LocalDate.of(year, 4, 12), true),
            "term2_$year" to AcademicTerm("term2_$year", "Second Term $year", LocalDate.of(year, 5, 10), LocalDate.of(year, 8, 8), true),
            "term3_$year" to AcademicTerm("term3_$year", "Third Term $year", LocalDate.of(year, 9, 7), LocalDate.of(year, 12, 3), true)
        )
    }

    /**
     * Main function: Detects current period based on ANY date (Perpetual)
     */
    fun getCurrentPeriod(today: LocalDate = LocalDate.now()): AcademicTerm {
        val year = today.year
        val termsMap = getTermsForYear(year)
        val sortedTerms = termsMap.values.sortedBy { it.startDate }
        
        // 1. Check if we are in an active term for THIS year
        for (term in sortedTerms) {
            if (!today.isBefore(term.startDate) && !today.isAfter(term.endDate)) {
                return term
            }
        }

        // 2. Identify WHICH holiday we are in
        
        // Before first term of the year
        if (today.isBefore(sortedTerms[0].startDate)) {
            val prevYear = year - 1
            val prevYearTerms = getTermsForYear(prevYear).values.sortedBy { it.startDate }
            val lastTermPrevYear = prevYearTerms.last()
            return AcademicTerm(
                id = "holiday_${prevYear}_to_$year",
                name = "Holiday Break",
                startDate = lastTermPrevYear.endDate.plusDays(1),
                endDate = sortedTerms[0].startDate.minusDays(1),
                requiresPayment = false,
                price = 0.0
            )
        }
        
        // Between terms
        for (i in 0 until sortedTerms.size - 1) {
            val currentTerm = sortedTerms[i]
            val nextTerm = sortedTerms[i+1]
            if (today.isAfter(currentTerm.endDate) && today.isBefore(nextTerm.startDate)) {
                return AcademicTerm(
                    id = "holiday_${currentTerm.id}",
                    name = "Holiday Break",
                    startDate = currentTerm.endDate.plusDays(1),
                    endDate = nextTerm.startDate.minusDays(1),
                    requiresPayment = false,
                    price = 0.0
                )
            }
        }
        
        // After last term of the year (Leading into next year's Term 1)
        val lastTerm = sortedTerms.last()
        val nextYear = year + 1
        val nextYearTerms = getTermsForYear(nextYear).values.sortedBy { it.startDate }
        return AcademicTerm(
            id = "holiday_${lastTerm.id}",
            name = "Holiday Break",
            startDate = lastTerm.endDate.plusDays(1),
            endDate = nextYearTerms[0].startDate.minusDays(1),
            requiresPayment = false,
            price = 0.0
        )
    }

    fun getNextTermStart(today: LocalDate = LocalDate.now()): LocalDate? {
        val current = getCurrentPeriod(today)
        if (!current.id.startsWith("holiday")) {
            // If in a term, next term is the next one in the sequence, or Term 1 of next year
            val year = today.year
            val terms = getTermsForYear(year).values.sortedBy { it.startDate }
            val currentIndex = terms.indexOfFirst { it.id == current.id }
            
            return if (currentIndex != -1 && currentIndex < terms.size - 1) {
                terms[currentIndex + 1].startDate
            } else {
                getTermsForYear(year + 1).values.sortedBy { it.startDate }[0].startDate
            }
        }
        return current.endDate.plusDays(1) // If in holiday, next term starts when holiday ends
    }

    fun isHolidayPeriod(today: LocalDate = LocalDate.now()): Boolean {
        return getCurrentPeriod(today).id.startsWith("holiday")
    }

    fun getDaysRemainingInCurrentTerm(today: LocalDate = LocalDate.now()): Long {
        val current = getCurrentPeriod(today)
        if (current.id.startsWith("holiday")) return -1
        return ChronoUnit.DAYS.between(today, current.endDate)
    }

    fun getAllTerms(): Map<String, AcademicTerm> {
        return getTermsForYear(LocalDate.now().year)
    }
}
