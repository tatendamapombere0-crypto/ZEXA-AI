import {
  EducationLevel,
  ContentLevel,
  SubscriptionStatus,
  ChatMessage,
  SavedStudyNote,
  FlashcardItem,
  BookmarkedExamQuestion,
  SavedExamScore,
  SavedSearchQA,
  SavedExamQA,
  StudyActivityStats
} from '../types';
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
  SAVED_NOTES: 'zexa_saved_notes',
  FLASHCARDS: 'zexa_flashcards',
  COMPLETED_TOPICS: 'zexa_completed_topics',
  STUDY_LOG_DATES: 'zexa_study_log_dates',
  REVISION_SEARCH_HISTORY: 'zexa_revision_search_history',
  REVISION_EXAM_QA: 'zexa_revision_exam_qa',
  SESSION_LOGGED_IN: 'zexa_session_logged_in',
  SESSION_USER_EMAIL: 'zexa_session_user_email',
  BRAIN_INITIALIZED: 'zexa_brain_initialized',
  PREFERRED_LANGUAGE: 'zexa_preferred_language',
  HAS_USED_AI_EVER: 'zexa_has_used_ai_ever',
  NOTIFICATIONS_ENABLED: 'zexa_notifications_enabled',
  LAST_NOTIFICATION_SLOT: 'zexa_last_notification_slot',
  USER_COUNTRY: 'zexa_user_country',
  ACCOUNT_COUNTRIES: 'zexa_account_countries'
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
    localStorage.setItem(STORAGE_KEYS.HAS_USED_AI_EVER, 'true');
    const status = this.getSubscriptionStatus();
    if (status === 'PREMIUM' || status === 'HOLIDAY_FREE') return;

    const used = this.getDailyQueriesUsed();
    const today = this.getTodayString();
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUERY_COUNT, String(used + 1));
    localStorage.setItem(STORAGE_KEYS.LAST_QUERY_DATE, today);
  }

  static hasUsedAiEver(): boolean {
    if (localStorage.getItem(STORAGE_KEYS.HAS_USED_AI_EVER) === 'true') return true;
    if (this.getDailyQueriesUsed() > 0) return true;
    const messages = this.getChatMessages();
    return messages.length > 0;
  }

  static areNotificationsEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return val === null ? true : val === 'true';
  }

  static setNotificationsEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled ? 'true' : 'false');
  }

  static getLastNotificationSlot(): string {
    return localStorage.getItem(STORAGE_KEYS.LAST_NOTIFICATION_SLOT) || '';
  }

  static setLastNotificationSlot(slot: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_NOTIFICATION_SLOT, slot);
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

  static hasSelectedCountry(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.USER_COUNTRY);
    return Boolean(val && val.trim());
  }

  static getUserCountry(): string {
    return localStorage.getItem(STORAGE_KEYS.USER_COUNTRY) || 'Zimbabwe';
  }

  static isZimbabweAccount(countryOverride?: string): boolean {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return active === 'zimbabwe';
  }

  static isBotswanaAccount(countryOverride?: string): boolean {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return active === 'botswana';
  }

  static isSouthAfricaAccount(countryOverride?: string): boolean {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return active === 'south africa';
  }

  /**
   * Returns true for countries with full local offline curriculum packs,
   * national encyclopedias, and examination banks loaded (Zimbabwe, Botswana, South Africa).
   * All other countries run using ZEXA AI directly with zero regional leakage.
   */
  static hasCountryCurriculumPack(countryOverride?: string): boolean {
    return (
      this.isZimbabweAccount(countryOverride) ||
      this.isBotswanaAccount(countryOverride) ||
      this.isSouthAfricaAccount(countryOverride)
    );
  }

  static getSavedCountryForEmail(email: string): string | null {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || cleanEmail === 'offline student') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT_COUNTRIES);
      if (!raw) return null;
      const map = JSON.parse(raw) as Record<string, string>;
      return map[cleanEmail] || null;
    } catch {
      return null;
    }
  }

  static setUserCountry(country: string, email?: string): void {
    const cleanCountry = (country || 'Zimbabwe').trim() || 'Zimbabwe';
    localStorage.setItem(STORAGE_KEYS.USER_COUNTRY, cleanCountry);
    const activeEmail = (email || this.getSessionUserEmail() || '').trim().toLowerCase();
    if (activeEmail && activeEmail !== 'offline student') {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT_COUNTRIES);
        const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
        map[activeEmail] = cleanCountry;
        localStorage.setItem(STORAGE_KEYS.ACCOUNT_COUNTRIES, JSON.stringify(map));
      } catch {
        // Ignore storage quota errors
      }
    }
  }

  static initNewSession(email?: string, country?: string): void {
    const cleanEmail = email || 'Offline Student';
    this.setSessionLoggedIn(true, cleanEmail);
    const resolvedCountry =
      country ||
      this.getSavedCountryForEmail(cleanEmail) ||
      'Zimbabwe';
    this.setUserCountry(resolvedCountry, cleanEmail);
    // Reset active chat & residual paper cache from previous account session
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    localStorage.removeItem('zexa_active_paper');
    localStorage.removeItem('zexa_active_paper_item');
    localStorage.removeItem('zexa_active_paper_qindex');
    localStorage.removeItem('zexa_active_paper_answers');
    localStorage.removeItem('zexa_active_paper_revealed');
    if (!this.isZimbabweAccount(resolvedCountry)) {
      localStorage.setItem(STORAGE_KEYS.PREFERRED_LANGUAGE, 'en');
    }
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
    localStorage.removeItem(STORAGE_KEYS.USER_COUNTRY);
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

  private static readJsonList<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private static writeJsonList<T>(key: string, items: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }

  static getSavedNotes(countryOverride?: string): SavedStudyNote[] {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return this.readJsonList<SavedStudyNote>(STORAGE_KEYS.SAVED_NOTES)
      .filter((n) => (n.country || '').trim().toLowerCase() === active)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  static saveNote(note: Omit<SavedStudyNote, 'id' | 'createdAt' | 'country'> & { country?: string }): SavedStudyNote {
    const activeCountry = (note.country || this.getUserCountry()).trim() || 'Zimbabwe';
    const all = this.readJsonList<SavedStudyNote>(STORAGE_KEYS.SAVED_NOTES);
    const created: SavedStudyNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: note.title.trim() || 'Saved Study Note',
      content: note.content,
      subject: note.subject || 'General Study',
      source: note.source,
      country: activeCountry,
      createdAt: Date.now()
    };
    this.writeJsonList(STORAGE_KEYS.SAVED_NOTES, [created, ...all].slice(0, 200));
    this.markStudyActivity(0);
    return created;
  }

  static deleteSavedNote(noteId: string): void {
    const all = this.readJsonList<SavedStudyNote>(STORAGE_KEYS.SAVED_NOTES);
    this.writeJsonList(
      STORAGE_KEYS.SAVED_NOTES,
      all.filter((n) => n.id !== noteId)
    );
  }

  static getFlashcards(countryOverride?: string): FlashcardItem[] {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return this.readJsonList<FlashcardItem>(STORAGE_KEYS.FLASHCARDS)
      .filter((f) => (f.country || '').trim().toLowerCase() === active)
      .sort((a, b) => Number(a.mastered) - Number(b.mastered) || b.createdAt - a.createdAt);
  }

  static saveFlashcard(card: {
    front: string;
    back: string;
    subject?: string;
    country?: string;
  }): FlashcardItem {
    const activeCountry = (card.country || this.getUserCountry()).trim() || 'Zimbabwe';
    const all = this.readJsonList<FlashcardItem>(STORAGE_KEYS.FLASHCARDS);
    const created: FlashcardItem = {
      id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      front: card.front.trim(),
      back: card.back.trim(),
      subject: (card.subject || 'Revision').trim(),
      country: activeCountry,
      mastered: false,
      reviewCount: 0,
      createdAt: Date.now()
    };
    this.writeJsonList(STORAGE_KEYS.FLASHCARDS, [created, ...all].slice(0, 300));
    this.markStudyActivity(0);
    return created;
  }

  static updateFlashcardMastery(cardId: string, mastered: boolean): void {
    const all = this.readJsonList<FlashcardItem>(STORAGE_KEYS.FLASHCARDS);
    const updated = all.map((c) =>
      c.id === cardId
        ? {
            ...c,
            mastered,
            reviewCount: (c.reviewCount || 0) + 1,
            lastReviewedAt: Date.now()
          }
        : c
    );
    this.writeJsonList(STORAGE_KEYS.FLASHCARDS, updated);
    this.markStudyActivity(1);
  }

  static deleteFlashcard(cardId: string): void {
    const all = this.readJsonList<FlashcardItem>(STORAGE_KEYS.FLASHCARDS);
    this.writeJsonList(
      STORAGE_KEYS.FLASHCARDS,
      all.filter((c) => c.id !== cardId)
    );
  }

  static getBookmarkedQuestions(countryOverride?: string): BookmarkedExamQuestion[] {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return this.readJsonList<BookmarkedExamQuestion>(STORAGE_KEYS.BOOKMARKED_QUESTIONS)
      .filter((b) => (b.country || '').trim().toLowerCase() === active)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  static isQuestionBookmarked(bookmarkId: string, countryOverride?: string): boolean {
    return this.getBookmarkedQuestions(countryOverride).some((b) => b.id === bookmarkId);
  }

  static toggleBookmarkQuestion(
    item: Omit<BookmarkedExamQuestion, 'createdAt' | 'country'> & { country?: string }
  ): boolean {
    const activeCountry = (item.country || this.getUserCountry()).trim() || 'Zimbabwe';
    const all = this.readJsonList<BookmarkedExamQuestion>(STORAGE_KEYS.BOOKMARKED_QUESTIONS);
    const exists = all.some(
      (b) => b.id === item.id && (b.country || '').trim().toLowerCase() === activeCountry.toLowerCase()
    );
    if (exists) {
      this.writeJsonList(
        STORAGE_KEYS.BOOKMARKED_QUESTIONS,
        all.filter(
          (b) => !(b.id === item.id && (b.country || '').trim().toLowerCase() === activeCountry.toLowerCase())
        )
      );
      return false;
    }
    const created: BookmarkedExamQuestion = {
      ...item,
      country: activeCountry,
      createdAt: Date.now()
    };
    this.writeJsonList(STORAGE_KEYS.BOOKMARKED_QUESTIONS, [created, ...all].slice(0, 200));
    this.markStudyActivity(0);
    return true;
  }

  static getExamScores(countryOverride?: string): SavedExamScore[] {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return this.readJsonList<SavedExamScore>(STORAGE_KEYS.EXAM_SCORES)
      .filter((s) => (s.country || '').trim().toLowerCase() === active)
      .sort((a, b) => b.completedAt - a.completedAt);
  }

  static getBestScoreForPaper(paperId: string, countryOverride?: string): SavedExamScore | null {
    const matching = this.getExamScores(countryOverride).filter((s) => s.paperId === paperId);
    if (matching.length === 0) return null;
    return matching.reduce((best, cur) => (cur.percent > best.percent ? cur : best), matching[0]);
  }

  static saveExamScore(
    score: Omit<SavedExamScore, 'id' | 'completedAt' | 'country'> & { country?: string }
  ): SavedExamScore {
    const activeCountry = (score.country || this.getUserCountry()).trim() || 'Zimbabwe';
    const all = this.readJsonList<SavedExamScore>(STORAGE_KEYS.EXAM_SCORES);
    const created: SavedExamScore = {
      ...score,
      id: `score_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      country: activeCountry,
      completedAt: Date.now()
    };
    this.writeJsonList(STORAGE_KEYS.EXAM_SCORES, [created, ...all].slice(0, 150));
    const bonusMin = Math.max(1, Math.round((score.durationSeconds || 60) / 60));
    this.markStudyActivity(bonusMin);
    return created;
  }

  static getCompletedTopics(countryOverride?: string): string[] {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_TOPICS);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Record<string, string[]>;
      const list = parsed?.[active];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  static isTopicCompleted(topicId: string, countryOverride?: string): boolean {
    return this.getCompletedTopics(countryOverride).includes(topicId);
  }

  static toggleTopicCompleted(topicId: string, countryOverride?: string): boolean {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    let map: Record<string, string[]> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_TOPICS);
      if (raw) map = JSON.parse(raw) || {};
    } catch {
      map = {};
    }
    const current = Array.isArray(map[active]) ? map[active] : [];
    const exists = current.includes(topicId);
    const next = exists ? current.filter((id) => id !== topicId) : [...current, topicId];
    map[active] = next;
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_TOPICS, JSON.stringify(map));
    } catch {
      // ignore quota error
    }
    if (!exists) {
      this.markStudyActivity(1);
    }
    return !exists;
  }

  static getStudyLogMap(): Record<string, number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDY_LOG_DATES);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  static markStudyActivity(minutesToAdd = 0, dateOverride?: string): void {
    const dateKey = dateOverride || this.getTodayString();
    const map = this.getStudyLogMap();
    const existing = typeof map[dateKey] === 'number' ? map[dateKey] : 0;
    map[dateKey] = Math.max(0, existing + Math.max(0, Math.round(minutesToAdd)));
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_LOG_DATES, JSON.stringify(map));
    } catch {
      // ignore quota
    }
  }

  static computeStreakDays(logMap: Record<string, number>, referenceDateStr?: string): number {
    const activeDates = Object.keys(logMap).sort();
    if (activeDates.length === 0) return 0;

    const todayStr = referenceDateStr || this.getTodayString();
    const shiftDate = (isoDate: string, deltaDays: number): string => {
      const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
      const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
      return dt.toISOString().slice(0, 10);
    };

    const yesterdayStr = shiftDate(todayStr, -1);
    let cursor: string | null = null;
    if (Object.prototype.hasOwnProperty.call(logMap, todayStr)) {
      cursor = todayStr;
    } else if (Object.prototype.hasOwnProperty.call(logMap, yesterdayStr)) {
      cursor = yesterdayStr;
    } else {
      return 0;
    }

    let streak = 0;
    while (cursor && Object.prototype.hasOwnProperty.call(logMap, cursor)) {
      streak++;
      cursor = shiftDate(cursor, -1);
    }
    return streak;
  }

  static getStudyStats(countryOverride?: string): StudyActivityStats {
    const activeCountry = countryOverride || this.getUserCountry();
    const logMap = this.getStudyLogMap();
    const today = this.getTodayString();
    const todayMinutes = typeof logMap[today] === 'number' ? logMap[today] : 0;
    const totalMinutes = Object.values(logMap).reduce(
      (sum, v) => sum + (typeof v === 'number' ? v : 0),
      0
    );
    const notes = this.getSavedNotes(activeCountry);
    const flashcards = this.getFlashcards(activeCountry);
    const bookmarks = this.getBookmarkedQuestions(activeCountry);
    const scores = this.getExamScores(activeCountry);
    const completedTopics = this.getCompletedTopics(activeCountry);
    const searchHistory = this.getSearchHistory(activeCountry);
    const examQA = this.getExamQAArchive(activeCountry);

    return {
      streakDays: this.computeStreakDays(logMap, today),
      todayMinutes,
      totalMinutes,
      completedTopicsCount: completedTopics.length,
      savedNotesCount: notes.length,
      flashcardsTotal: flashcards.length,
      flashcardsMastered: flashcards.filter((c) => c.mastered).length,
      bookmarksCount: bookmarks.length,
      examsCompleted: scores.length,
      searchHistoryCount: searchHistory.length,
      examQACount: examQA.length
    };
  }

  static getSearchHistory(countryOverride?: string): SavedSearchQA[] {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return this.readJsonList<SavedSearchQA>(STORAGE_KEYS.REVISION_SEARCH_HISTORY)
      .filter((item) => (item.country || '').trim().toLowerCase() === active)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  static recordSearchQA(entry: {
    question: string;
    answer: string;
    subject?: string;
    source?: string;
    tutorMode?: SavedSearchQA['tutorMode'];
    level: string;
    country?: string;
  }): SavedSearchQA | null {
    const cleanQ = (entry.question || '').trim();
    const cleanA = (entry.answer || '').trim();
    if (!cleanQ || !cleanA) return null;

    const activeCountry = (entry.country || this.getUserCountry()).trim() || 'Zimbabwe';
    const activeLower = activeCountry.toLowerCase();
    const all = this.readJsonList<SavedSearchQA>(STORAGE_KEYS.REVISION_SEARCH_HISTORY);

    // Avoid duplicating identical question in the same country — refresh timestamp & latest answer instead
    const existingIdx = all.findIndex(
      (item) =>
        (item.country || '').trim().toLowerCase() === activeLower &&
        item.question.trim().toLowerCase() === cleanQ.toLowerCase()
    );

    const record: SavedSearchQA = {
      id: existingIdx >= 0 ? all[existingIdx].id : `sqa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      question: cleanQ,
      answer: cleanA,
      subject: (entry.subject || `${entry.level} Study`).trim(),
      source: entry.source,
      tutorMode: entry.tutorMode,
      level: entry.level,
      country: activeCountry,
      createdAt: Date.now()
    };

    const remaining = existingIdx >= 0 ? all.filter((_, i) => i !== existingIdx) : all;
    this.writeJsonList(STORAGE_KEYS.REVISION_SEARCH_HISTORY, [record, ...remaining].slice(0, 300));
    this.markStudyActivity(0);
    return record;
  }

  static deleteSearchQA(id: string): void {
    const all = this.readJsonList<SavedSearchQA>(STORAGE_KEYS.REVISION_SEARCH_HISTORY);
    this.writeJsonList(
      STORAGE_KEYS.REVISION_SEARCH_HISTORY,
      all.filter((item) => item.id !== id)
    );
  }

  static clearSearchHistory(countryOverride?: string): void {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    const all = this.readJsonList<SavedSearchQA>(STORAGE_KEYS.REVISION_SEARCH_HISTORY);
    this.writeJsonList(
      STORAGE_KEYS.REVISION_SEARCH_HISTORY,
      all.filter((item) => (item.country || '').trim().toLowerCase() !== active)
    );
  }

  static getExamQAArchive(countryOverride?: string): SavedExamQA[] {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    return this.readJsonList<SavedExamQA>(STORAGE_KEYS.REVISION_EXAM_QA)
      .filter((item) => (item.country || '').trim().toLowerCase() === active)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  static recordExamQA(entry: Omit<SavedExamQA, 'id' | 'updatedAt' | 'country'> & { country?: string }): SavedExamQA {
    const activeCountry = (entry.country || this.getUserCountry()).trim() || 'Zimbabwe';
    const activeLower = activeCountry.toLowerCase();
    const uniqueKey = `${activeLower}_${entry.paperId}_q${entry.questionNumber}`;
    const all = this.readJsonList<SavedExamQA>(STORAGE_KEYS.REVISION_EXAM_QA);

    const record: SavedExamQA = {
      ...entry,
      id: uniqueKey,
      country: activeCountry,
      updatedAt: Date.now()
    };

    const remaining = all.filter((item) => item.id !== uniqueKey);
    this.writeJsonList(STORAGE_KEYS.REVISION_EXAM_QA, [record, ...remaining].slice(0, 400));
    this.markStudyActivity(0);
    return record;
  }

  static deleteExamQA(id: string): void {
    const all = this.readJsonList<SavedExamQA>(STORAGE_KEYS.REVISION_EXAM_QA);
    this.writeJsonList(
      STORAGE_KEYS.REVISION_EXAM_QA,
      all.filter((item) => item.id !== id)
    );
  }

  static clearExamQAArchive(countryOverride?: string): void {
    const active = (countryOverride || this.getUserCountry()).trim().toLowerCase();
    const all = this.readJsonList<SavedExamQA>(STORAGE_KEYS.REVISION_EXAM_QA);
    this.writeJsonList(
      STORAGE_KEYS.REVISION_EXAM_QA,
      all.filter((item) => (item.country || '').trim().toLowerCase() !== active)
    );
  }
}

