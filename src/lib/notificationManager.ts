// src/lib/notificationManager.ts
// Handles automated study reminder notifications at 6:00 AM, 12:00 PM, and 6:00 PM Harare Time (CAT / UTC+2)
// In addition to device notifications, manages the offline access promo for unpaid/unused users.

import { StorageManager } from './storage';

export interface StudyReminderPayload {
  title: string;
  body: string;
  type: 'ACTIVATE_PREMIUM' | 'STUDY_REMINDER';
  question?: string;
  slot?: '6:00 AM' | '12:00 PM' | '6:00 PM';
  timestamp: number;
}

export interface HarareClockInfo {
  harareTimeString: string;
  harareDateString: string;
  nextSlotName: '6:00 AM' | '12:00 PM' | '6:00 PM';
  msUntilNextSlot: number;
  hoursUntilNext: number;
  minutesUntilNext: number;
}

// Curated high-yield dashboard and syllabus questions for study hints
const DASHBOARD_STUDY_HINTS = [
  {
    subject: 'Heritage & Social Studies',
    question: 'Describe ways of preserving heritage sites of Zimbabwe'
  },
  {
    subject: 'Agric, Science & Tech',
    question: 'What is respiration and how does it release energy in living cells?'
  },
  {
    subject: 'Social Science',
    question: 'Identify characteristics of ideal marital relationships'
  },
  {
    subject: 'Agriculture',
    question: 'Name the 3 main soil types (Sand, Clay, Loam) and their farming properties'
  },
  {
    subject: 'Social Science',
    question: 'What do the national symbols of Zimbabwe (Flag, Bird, Anthem) mean?'
  },
  {
    subject: 'Combined Science',
    question: 'Explain the light and dark reactions of photosynthesis with word equation'
  },
  {
    subject: 'History 2167',
    question: 'Analyze the domestic and international factors leading to the 1979 Lancaster House Conference'
  },
  {
    subject: 'Curriculum Studies',
    question: 'What are the 6 official ZIMSEC Grade 7 examinable subjects and grading scale?'
  },
  {
    subject: 'ChiShona',
    question: 'Chii chinonzi Chiito nemienzaniso yacho mumutsara?'
  },
  {
    subject: 'ICT & Technology',
    question: 'Explain what personal information is and how to protect privacy online'
  }
];

export class NotificationManager {
  private static timerId: any = null;
  private static onNotificationCallbacks: Array<(payload: StudyReminderPayload) => void> = [];

  /**
   * Calculates the exact Harare Time (CAT - Central Africa Time, UTC+2)
   * and time remaining until the next scheduled notification slot:
   * 6:00 AM, 12:00 PM, or 6:00 PM Harare Time.
   */
  static getHarareClockInfo(): HarareClockInfo {
    const now = new Date();
    // Harare is UTC+2 with no daylight saving time (DST)
    const harareTimeMs = now.getTime() + (2 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000);
    const harareNow = new Date(harareTimeMs);

    const h = harareNow.getHours();
    const m = harareNow.getMinutes();
    const s = harareNow.getSeconds();

    // Target slots in Harare time (hours in 24h):
    // Slot 1: 06:00 (6:00 AM) -> 04:00 UTC
    // Slot 2: 12:00 (12:00 PM) -> 10:00 UTC
    // Slot 3: 18:00 (6:00 PM) -> 16:00 UTC

    let nextSlotName: '6:00 AM' | '12:00 PM' | '6:00 PM' = '6:00 AM';
    let targetHour = 6;
    let daysToAdd = 0;

    const currentMinuteOfDay = h * 60 + m;

    if (currentMinuteOfDay < 6 * 60) {
      // Before 6 AM today
      targetHour = 6;
      nextSlotName = '6:00 AM';
      daysToAdd = 0;
    } else if (currentMinuteOfDay < 12 * 60) {
      // Between 6 AM and 12 PM today
      targetHour = 12;
      nextSlotName = '12:00 PM';
      daysToAdd = 0;
    } else if (currentMinuteOfDay < 18 * 60) {
      // Between 12 PM and 6 PM today
      targetHour = 18;
      nextSlotName = '6:00 PM';
      daysToAdd = 0;
    } else {
      // After 6 PM today -> Tomorrow at 6:00 AM
      targetHour = 6;
      nextSlotName = '6:00 AM';
      daysToAdd = 1;
    }

    const targetDate = new Date(harareNow);
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    targetDate.setHours(targetHour, 0, 0, 0);

    const msUntilNextSlot = Math.max(1000, targetDate.getTime() - harareNow.getTime());
    const hoursUntilNext = Math.floor(msUntilNextSlot / (1000 * 60 * 60));
    const minutesUntilNext = Math.floor((msUntilNextSlot % (1000 * 60 * 60)) / (1000 * 60));

    const timeString = harareNow.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateString = harareNow.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    return {
      harareTimeString: `${timeString} CAT (Harare)`,
      harareDateString: dateString,
      nextSlotName,
      msUntilNextSlot,
      hoursUntilNext,
      minutesUntilNext
    };
  }

  /**
   * Builds the appropriate notification payload based on user installation & usage status:
   * - If installed but has NOT used the AI or has NOT paid premium:
   *   "Activate premium for offline access. Start now"
   * - If user is active / studying:
   *   "Have you done your study today? Let's begin!" with a hint of a dashboard question.
   */
  static buildNotificationPayload(slotName?: '6:00 AM' | '12:00 PM' | '6:00 PM'): StudyReminderPayload {
    const isPremium = StorageManager.isPremium();
    const hasUsedAi = StorageManager.hasUsedAiEver();
    const clock = this.getHarareClockInfo();
    const slot = slotName || clock.nextSlotName;

    // Condition A: User has installed the app, but has not used the AI or not paid the premium
    if (!isPremium || !hasUsedAi) {
      return {
        title: '⚡ Activate Premium for 100% Offline Access',
        body: 'Activate premium for offline access. Start now to unlock all ZIMSEC syllabuses, past papers, and offline AI answers!',
        type: 'ACTIVATE_PREMIUM',
        slot,
        timestamp: Date.now()
      };
    }

    // Condition B: Active student studying with ZEXA AI
    // Rotate through high-yield dashboard questions
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const slotOffset = slot === '6:00 AM' ? 0 : slot === '12:00 PM' ? 1 : 2;
    const selectedItem = DASHBOARD_STUDY_HINTS[(dayIndex + slotOffset) % DASHBOARD_STUDY_HINTS.length];

    const slotTitlePrefix =
      slot === '6:00 AM'
        ? '🌅 Morning ZIMSEC Kickoff (6:00 AM Harare)'
        : slot === '12:00 PM'
        ? '☀️ Midday ZIMSEC Revision (12:00 PM Harare)'
        : '🌙 Evening ZIMSEC Mastery (6:00 PM Harare)';

    return {
      title: slotTitlePrefix,
      body: `Have you done your study today? Let's begin! 💡 Study Hint [${selectedItem.subject}]: "${selectedItem.question}". Tap to explore answer offline.`,
      type: 'STUDY_REMINDER',
      question: selectedItem.question,
      slot,
      timestamp: Date.now()
    };
  }

  /**
   * Initializes the automated scheduler that triggers at 6:00 AM, 12:00 PM, and 6:00 PM Harare Time
   */
  static initScheduler(): void {
    if (typeof window === 'undefined') return;

    // Clear existing timer if any
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (!StorageManager.areNotificationsEnabled()) {
      return;
    }

    const clock = this.getHarareClockInfo();

    // Schedule next trigger
    this.timerId = setTimeout(() => {
      this.triggerScheduledNotification(clock.nextSlotName);
      // Recursively schedule next slot
      this.initScheduler();
    }, clock.msUntilNextSlot);

    // Register Service Worker if supported
    this.registerServiceWorker();
  }

  /**
   * Registers public/sw.js to handle notifications on installed devices
   */
  private static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (err) {
        console.warn('Service worker registration note:', err);
      }
    }
  }

  /**
   * Triggers the notification for the given slot (6am, 12pm, 6pm)
   * Sends directly to the phone/device notification bar (no in-app dashboard alert)
   */
  static async triggerScheduledNotification(slotName?: '6:00 AM' | '12:00 PM' | '6:00 PM'): Promise<void> {
    const payload = this.buildNotificationPayload(slotName);
    StorageManager.setLastNotificationSlot(`${payload.slot} on ${new Date().toISOString().slice(0, 10)}`);

    // Route directly to phone/device status bar as incoming notification
    await this.dispatchDeviceNotification(payload);
  }

  /**
   * Sends an actual operating system notification to the device status bar / notification drawer
   */
  static async dispatchDeviceNotification(payload: StudyReminderPayload): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    // Auto-request permission if in default state
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;
      } catch {
        return false;
      }
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    const options: any = {
      body: payload.body,
      icon: '/assets/zexa_logo_icon.png',
      badge: '/assets/zexa_favicon.png',
      tag: `zexa-study-${payload.slot || 'alert'}`,
      renotify: true,
      requireInteraction: false,
      data: {
        type: payload.type,
        question: payload.question,
        url: payload.type === 'ACTIVATE_PREMIUM' ? '/?action=premium' : `/?question=${encodeURIComponent(payload.question || '')}`
      }
    };

    // Try through active service worker first (supports background/installed PWA on phones)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(payload.title, options);
          return true;
        }
      } catch (err) {
        console.warn('SW notification fallback to window Notification:', err);
      }
    }

    // Direct Window Notification fallback
    try {
      new Notification(payload.title, options);
      return true;
    } catch (err) {
      console.warn('Direct notification error:', err);
      return false;
    }
  }

  /**
   * Subscribes a React component to in-app study notifications
   */
  static onNotification(callback: (payload: StudyReminderPayload) => void): () => void {
    this.onNotificationCallbacks.push(callback);
    return () => {
      this.onNotificationCallbacks = this.onNotificationCallbacks.filter(c => c !== callback);
    };
  }

  /**
   * Requests system notification permission from the user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      StorageManager.setNotificationsEnabled(true);
      this.initScheduler();
    }
    return perm;
  }

  /**
   * Checks current permission status
   */
  static getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Sends an immediate test notification so users can verify device notifications instantly
   */
  static async sendTestNotification(overrideType?: 'ACTIVATE_PREMIUM' | 'STUDY_REMINDER'): Promise<boolean> {
    const payload = this.buildNotificationPayload();
    if (overrideType) {
      payload.type = overrideType;
      if (overrideType === 'ACTIVATE_PREMIUM') {
        payload.title = '⚡ Activate Premium for 100% Offline Access (Test)';
        payload.body = 'Activate premium for offline access. Start now to unlock all ZIMSEC syllabuses, past papers, and offline AI answers!';
        payload.question = undefined;
      } else {
        payload.title = '📚 ZEXA Study Reminder (Test)';
        payload.body = 'Have you done your study today? Let\'s begin! 💡 Study Question: "Describe ways of preserving heritage sites of Zimbabwe". Tap to explore answer offline.';
        payload.question = 'Describe ways of preserving heritage sites of Zimbabwe';
      }
    }
    return await this.dispatchDeviceNotification(payload);
  }
}
