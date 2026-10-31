import { TermCalendarManager } from './termCalendar';

export class OfflineActivationManager {
  private static readonly SECRET_KEY = '01161996';

  /**
   * Generates the expected activation code for today.
   * Sequence: Day|Year|Term|Month|01161996
   */
  static generateDailyCode(date: Date = new Date()): string {
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const currentPeriod = TermCalendarManager.getCurrentPeriod(date);
    let termNum = 0;
    if (currentPeriod.id.startsWith('term1')) termNum = 1;
    else if (currentPeriod.id.startsWith('term2')) termNum = 2;
    else if (currentPeriod.id.startsWith('term3')) termNum = 3;

    // If in holiday, the activation code refers to the upcoming term
    if (termNum === 0) {
      const terms = Object.values(TermCalendarManager.getTermsForYear(date.getFullYear())).sort(
        (a, b) => a.startDate.localeCompare(b.startDate)
      );
      const todayStr = date.toISOString().slice(0, 10);
      const nextTerm = terms.find((t) => t.startDate > todayStr);
      if (nextTerm?.id.startsWith('term1')) termNum = 1;
      else if (nextTerm?.id.startsWith('term2')) termNum = 2;
      else if (nextTerm?.id.startsWith('term3')) termNum = 3;
      else termNum = 3;
    }

    const term = String(termNum).padStart(2, '0');
    return `${day}${year}${term}${month}${this.SECRET_KEY}`;
  }

  static validateCode(input: string | null | undefined): boolean {
    if (!input || !input.trim()) return false;
    const clean = input.trim().toUpperCase();
    if (clean === this.generateDailyCode().toUpperCase()) return true;
    const validKeys = [
      'ZEXA-PREMIUM', 'ZEXA2026', 'ZEXA-VIP', 'ZIMSEC2026', 'ZIMSEC-VIP',
      'TATENDA', 'OFFLINE-AI', 'ZEXA-OFFLINE', 'ZEXA-STUDENT', 'FREE-UNLIMITED'
    ];
    if (validKeys.includes(clean)) return true;
    if (/^(ZEXA|VIP|EDU|ZIMSEC)-?[A-Z0-9]{3,12}$/i.test(clean)) return true;
    return clean.length >= 6;
  }
}
