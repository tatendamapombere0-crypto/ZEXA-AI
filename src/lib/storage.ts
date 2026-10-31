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
  EXAM_SCORES: 'zexa_exam_scores',
  SESSION_LOGGED_IN: 'zexa_session_logged_in',
  SESSION_USER_EMAIL: 'zexa_session_user_email',
  BRAIN_INITIALIZED: 'zexa_brain_initialized',
  PREFERRED_LANGUAGE: 'zexa_preferred_language'
};

export const LEVEL_PRICES: Record<EducationLevel, number> = {
  'Primary Education': 4.0,
  'O-Level (Form 1 to 4)': 5.0,
  'A-Level (Form 5 to 6)': 5.0,
  'Secondary: O-Level (Forms 1 - 4)': 5.0,
  'Secondary: A-Level (Forms 5 - 6)': 5.0,
  'Secondary Education': 5.0,
  'Tertiary Education': 5.0
};

export function mapEducationToContentLevel(level: EducationLevel | string): ContentLevel {
  const l = (level || '').toLowerCase();
  if (l.includes('primary') || l.includes('grade')) return 'Primary';
  if (l.includes('a-level') || l.includes('form 5') || l.includes('form 6') || l.includes('alevel') || l.includes('a level') || l.includes('form5') || l.includes('form6')) return 'A-Level';
  if (l.includes('tertiary') || l.includes('higher') || l.includes('university') || l.includes('college')) return 'Tertiary';
  return 'O-Level';
}

export class StorageManager {
  static getEducationLevel(): EducationLevel {
    const saved = localStorage.getItem(STORAGE_KEYS.EDUCATION_LEVEL) as EducationLevel;
    if (!saved || saved === 'Secondary Education') {
      return 'O-Level (Form 1 to 4)';
    }
    return saved;
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

  static isSessionLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SESSION_LOGGED_IN) === 'true';
  }

  static setSessionLoggedIn(loggedIn: boolean, email?: string): void {
    localStorage.setItem(STORAGE_KEYS.SESSION_LOGGED_IN, loggedIn ? 'true' : 'false');
    if (email) {
      localStorage.setItem(STORAGE_KEYS.SESSION_USER_EMAIL, email);
    } else if (!loggedIn) {
      localStorage.removeItem(STORAGE_KEYS.SESSION_USER_EMAIL);
    }
  }

  static getSessionUserEmail(): string {
    return localStorage.getItem(STORAGE_KEYS.SESSION_USER_EMAIL) || 'Offline Student';
  }

  static isBrainInitialized(): boolean {
    return localStorage.getItem(STORAGE_KEYS.BRAIN_INITIALIZED) === 'true';
  }

  static setBrainInitialized(initialized: boolean): void {
    localStorage.setItem(STORAGE_KEYS.BRAIN_INITIALIZED, initialized ? 'true' : 'false');
  }

  static getPreferredLanguage(): 'en' | 'sn' {
    return (localStorage.getItem(STORAGE_KEYS.PREFERRED_LANGUAGE) as 'en' | 'sn') || 'en';
  }

  static setPreferredLanguage(lang: 'en' | 'sn'): void {
    localStorage.setItem(STORAGE_KEYS.PREFERRED_LANGUAGE, lang);
  }

  static initNewSession(email?: string): void {
    this.setSessionLoggedIn(true, email || 'Offline Student');
    // Ensure fresh account starts on Free tier with 2 free questions
    localStorage.removeItem(STORAGE_KEYS.IS_PREMIUM);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUERY_COUNT, '0');
    localStorage.setItem(STORAGE_KEYS.DAILY_LIMIT, '2');
    localStorage.setItem(STORAGE_KEYS.LAST_QUERY_DATE, this.getTodayString());
  }

  static activateWithCode(code: string): { success: boolean; message: string } {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Please enter an activation code.' };
    }
    const validKeys = [
      'ZEXA-PREMIUM', 'ZEXA2026', 'ZEXA-VIP', 'ZIMSEC2026', 'ZIMSEC-VIP',
      'TATENDA', 'OFFLINE-AI', 'ZEXA-OFFLINE', 'ZEXA-STUDENT', 'FREE-UNLIMITED'
    ];
    // Accepts any valid key from list, or key pattern ZEXA-XXXX, or any 6+ alphanumeric code
    const isPattern = /^(ZEXA|VIP|EDU|ZIMSEC)-?[A-Z0-9]{3,12}$/i.test(clean);
    const isLengthValid = clean.length >= 6;

    if (validKeys.includes(clean) || isPattern || isLengthValid) {
      // 1-year unlimited access
      const oneYearExpiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
      this.setPremiumStatus(true, oneYearExpiry);
      return {
        success: true,
        message: 'Activation successful! Your account is now upgraded to Unlimited Offline Access.'
      };
    }

    return {
      success: false,
      message: 'Invalid activation code. Please check and try again.'
    };
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_USER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.BRAIN_INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.LEVEL_SELECTED);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    // Fresh account reset: Reset to Free user tier with 2 free questions
    localStorage.removeItem(STORAGE_KEYS.IS_PREMIUM);
    localStorage.removeItem(STORAGE_KEYS.HAS_PAID_BEFORE);
    localStorage.removeItem(STORAGE_KEYS.TERM_END_DATE);
    localStorage.removeItem(STORAGE_KEYS.PAID_FOR_LEVEL);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUERY_COUNT, '0');
    localStorage.setItem(STORAGE_KEYS.DAILY_LIMIT, '2');
    localStorage.setItem(STORAGE_KEYS.LAST_QUERY_DATE, this.getTodayString());
  }

  static clearChat(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  }
}
