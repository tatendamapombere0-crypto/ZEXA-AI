import { EducationLevel, ContentLevel, SubscriptionStatus, ChatMessage } from '../types';
import { TermCalendarManager } from './termCalendar';

const STORAGE_KEYS = {
  EDUCATION_LEVEL: 'zexa_education_level',
  CONTENT_LEVEL: 'zexa_content_level',
  LEVEL_SELECTED: 'zexa_level_selected',
  IS_PREMIUM: 'zexa_is_premium',
  HAS_PAID_BEFORE: 'zexa_has_paid',
  TERM_END_DATE: 'zexa_term_end_date',
  PAID_FOR_LEVEL: 'zexa_paid_for_level',
  OFFLINE_QUERY_COUNT: 'zexa_offline_query_count',
  LAST_QUERY_DATE: 'zexa_last_query_date',
  DAILY_LIMIT: 'zexa_daily_limit',
  CHAT_MESSAGES: 'zexa_chat_messages',
  BOOKMARKED_QUESTIONS: 'zexa_bookmarked_questions',
  EXAM_SCORES: 'zexa_exam_scores'
};

export const LEVEL_PRICES: Record<EducationLevel, number> = {
  'Primary Education': 4.0,
  'Secondary Education': 5.0,
  'Tertiary Education': 5.0
};

export function mapEducationToContentLevel(level: EducationLevel): ContentLevel {
  if (level.includes('Primary')) return 'Primary';
  if (level.includes('Tertiary')) return 'Tertiary';
  return 'O-Level';
}

export class StorageManager {
  static getEducationLevel(): EducationLevel {
    const saved = localStorage.getItem(STORAGE_KEYS.EDUCATION_LEVEL) as EducationLevel;
    return saved || 'Secondary Education';
  }

  static hasSelectedLevel(): boolean {
    return localStorage.getItem(STORAGE_KEYS.LEVEL_SELECTED) === 'true';
  }

  static setEducationLevel(level: EducationLevel): void {
    localStorage.setItem(STORAGE_KEYS.EDUCATION_LEVEL, level);
    localStorage.setItem(STORAGE_KEYS.CONTENT_LEVEL, mapEducationToContentLevel(level));
    localStorage.setItem(STORAGE_KEYS.LEVEL_SELECTED, 'true');
  }

  static getContentLevel(): ContentLevel {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT_LEVEL) as ContentLevel;
    if (saved) return saved;
    return mapEducationToContentLevel(this.getEducationLevel());
  }

  static isPremium(): boolean {
    const premiumFlag = localStorage.getItem(STORAGE_KEYS.IS_PREMIUM) === 'true';
    const termEnd = parseInt(localStorage.getItem(STORAGE_KEYS.TERM_END_DATE) || '0', 10);
    if (premiumFlag && termEnd > 0) {
      if (Date.now() > termEnd) {
        // Expired
        this.setPremiumStatus(false, 0);
        return false;
      }
      return true;
    }
    return premiumFlag;
  }

  static hasPaidBefore(): boolean {
    return localStorage.getItem(STORAGE_KEYS.HAS_PAID_BEFORE) === 'true';
  }

  static getSubscriptionStatus(): SubscriptionStatus {
    if (this.isPremium()) {
      return 'PREMIUM';
    }
    // Holiday check: Returning users get free unlimited access during holiday
    const isHoliday = TermCalendarManager.isHolidayPeriod();
    if (isHoliday && this.hasPaidBefore()) {
      return 'HOLIDAY_FREE';
    }
    return 'FREE';
  }

  static setPremiumStatus(isPremium: boolean, termEndDate: number, paidForLevel?: EducationLevel): void {
    localStorage.setItem(STORAGE_KEYS.IS_PREMIUM, isPremium ? 'true' : 'false');
    if (isPremium) {
      localStorage.setItem(STORAGE_KEYS.HAS_PAID_BEFORE, 'true');
      localStorage.setItem(STORAGE_KEYS.TERM_END_DATE, String(termEndDate));
      if (paidForLevel) {
        localStorage.setItem(STORAGE_KEYS.PAID_FOR_LEVEL, paidForLevel);
      }
    }
  }

  static getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  static getDailyLimit(): number {
    const limit = localStorage.getItem(STORAGE_KEYS.DAILY_LIMIT);
    return limit ? parseInt(limit, 10) : 2;
  }

  static setDailyLimit(limit: number): void {
    localStorage.setItem(STORAGE_KEYS.DAILY_LIMIT, String(limit));
  }

  static getDailyQueriesUsed(): number {
    const today = this.getTodayString();
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_QUERY_DATE);
    if (lastDate !== today) {
      localStorage.setItem(STORAGE_KEYS.LAST_QUERY_DATE, today);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUERY_COUNT, '0');
      return 0;
    }
    const count = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUERY_COUNT);
    return count ? parseInt(count, 10) : 0;
  }

  static checkCanQuery(): { allowed: boolean; remaining: number; reason?: string } {
    const status = this.getSubscriptionStatus();
    if (status === 'PREMIUM' || status === 'HOLIDAY_FREE') {
      return { allowed: true, remaining: -1 };
    }

    const used = this.getDailyQueriesUsed();
    const limit = this.getDailyLimit();
    const remaining = Math.max(0, limit - used);

    if (remaining > 0) {
      return { allowed: true, remaining: remaining - 1 };
    }

    return {
      allowed: false,
      remaining: 0,
      reason: `You have used your ${limit} free offline queries for today. Upgrade to Unlimited Premium or enter an offline activation code!`
    };
  }

  static recordQueryUsed(): void {
    const status = this.getSubscriptionStatus();
    if (status === 'PREMIUM' || status === 'HOLIDAY_FREE') return;

    const used = this.getDailyQueriesUsed();
    const today = this.getTodayString();
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUERY_COUNT, String(used + 1));
    localStorage.setItem(STORAGE_KEYS.LAST_QUERY_DATE, today);
  }

  static resetDailyLimitForTesting(): void {
    const today = this.getTodayString();
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUERY_COUNT, '0');
    localStorage.setItem(STORAGE_KEYS.LAST_QUERY_DATE, today);
  }

  static getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages.slice(-50)));
    } catch {
      // Ignore quota errors
    }
  }

  static clearChat(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  }
}
