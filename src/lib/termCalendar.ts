import { AcademicTerm } from '../types';

export class TermCalendarManager {
  /**
   * Dynamically generates terms for ANY given year with UNIQUE IDs
   */
  static getTermsForYear(year: number): Record<string, AcademicTerm> {
    return {
      [`term1_${year}`]: {
        id: `term1_${year}`,
        name: `First Term ${year}`,
        startDate: `${year}-01-11`,
        endDate: `${year}-04-12`,
        requiresPayment: true,
        price: 5.0
      },
      [`term2_${year}`]: {
        id: `term2_${year}`,
        name: `Second Term ${year}`,
        startDate: `${year}-05-10`,
        endDate: `${year}-08-08`,
        requiresPayment: true,
        price: 5.0
      },
      [`term3_${year}`]: {
        id: `term3_${year}`,
        name: `Third Term ${year}`,
        startDate: `${year}-09-07`,
        endDate: `${year}-12-03`,
        requiresPayment: true,
        price: 5.0
      }
    };
  }

  /**
   * Detects current period based on date
   */
  static getCurrentPeriod(date: Date = new Date()): AcademicTerm {
    const year = date.getFullYear();
    const todayStr = date.toISOString().slice(0, 10);
    const terms = Object.values(this.getTermsForYear(year)).sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );

    // 1. Check if we are in an active term for THIS year
    for (const term of terms) {
      if (todayStr >= term.startDate && todayStr <= term.endDate) {
        return term;
      }
    }

    // 2. Identify which holiday we are in
    if (todayStr < terms[0].startDate) {
      const prevYear = year - 1;
      const prevTerms = Object.values(this.getTermsForYear(prevYear)).sort((a, b) =>
        a.startDate.localeCompare(b.startDate)
      );
      const lastTermPrevYear = prevTerms[prevTerms.length - 1];
      return {
        id: `holiday_${prevYear}_to_${year}`,
        name: 'Holiday Break (Summer/New Year)',
        startDate: lastTermPrevYear.endDate,
        endDate: terms[0].startDate,
        requiresPayment: false,
        price: 0.0
      };
    }

    // Between terms
    for (let i = 0; i < terms.length - 1; i++) {
      const currentTerm = terms[i];
      const nextTerm = terms[i + 1];
      if (todayStr > currentTerm.endDate && todayStr < nextTerm.startDate) {
        return {
          id: `holiday_${currentTerm.id}`,
          name: `Holiday Break (after ${currentTerm.name})`,
          startDate: currentTerm.endDate,
          endDate: nextTerm.startDate,
          requiresPayment: false,
          price: 0.0
        };
      }
    }

    // After last term of the year (Third Term)
    const lastTerm = terms[terms.length - 1];
    const nextYearTerms = Object.values(this.getTermsForYear(year + 1)).sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );
    return {
      id: `holiday_${lastTerm.id}`,
      name: 'Holiday Break (End of Year)',
      startDate: lastTerm.endDate,
      endDate: nextYearTerms[0].startDate,
      requiresPayment: false,
      price: 0.0
    };
  }

  static isHolidayPeriod(date: Date = new Date()): boolean {
    return this.getCurrentPeriod(date).id.startsWith('holiday');
  }

  static getNextTermStart(date: Date = new Date()): string | null {
    const current = this.getCurrentPeriod(date);
    const year = date.getFullYear();
    const terms = Object.values(this.getTermsForYear(year)).sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );

    if (!current.id.startsWith('holiday')) {
      const idx = terms.findIndex((t) => t.id === current.id);
      if (idx !== -1 && idx < terms.length - 1) {
        return terms[idx + 1].startDate;
      } else {
        const nextYearTerms = Object.values(this.getTermsForYear(year + 1)).sort((a, b) =>
          a.startDate.localeCompare(b.startDate)
        );
        return nextYearTerms[0].startDate;
      }
    }
    return current.endDate;
  }

  static getDaysRemainingInCurrentTerm(date: Date = new Date()): number {
    const current = this.getCurrentPeriod(date);
    if (current.id.startsWith('holiday')) return -1;
    const endDate = new Date(current.endDate);
    const diffTime = endDate.getTime() - date.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
}
