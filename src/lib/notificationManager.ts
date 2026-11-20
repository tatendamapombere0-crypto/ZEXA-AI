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

const BOTSWANA_STUDY_HINTS = [
  {
    subject: 'BEC History · Social Studies',
    question: 'Why did the Three Dikgosi (Khama III, Sebele I, Bathoen I) travel to London in 1895?'
  },
  {
    subject: 'BGCSE Development Studies',
    question: 'Explain Botswana’s Vision 2036 strategies for economic diversification away from diamonds'
  },
  {
    subject: 'BGCSE Geography',
    question: 'Why does the Okavango Delta reach peak flooding during Botswana’s dry winter months?'
  },
  {
    subject: 'Setswana',
    question: 'Tlhalosa seane se se reng: Motho ke motho ka batho'
  },
  {
    subject: 'JCE Moral Education',
    question: 'Explain the philosophy of Botho and how the Kgotla promotes democratic participation in Botswana'
  },
  {
    subject: 'Agriculture',
    question: 'How do veterinary cordon fences and the BMC protect Botswana’s beef export market?'
  }
];

const SOUTH_AFRICA_STUDY_HINTS = [
  {
    subject: 'NSC Physical Sciences',
    question: 'Calculate the frequency heard using the Doppler Effect when a siren approaches a stationary listener'
  },
  {
    subject: 'CAPS History · Heritage',
    question: 'What were the main turning points of the 1960 Sharpeville Massacre and 1976 Soweto Uprising?'
  },
  {
    subject: 'NSC Life Sciences',
    question: 'Which hominid fossils from the Cradle of Humankind support the Out of Africa hypothesis?'
  },
  {
    subject: 'CAPS Social Sciences',
    question: 'List all 9 provinces of South Africa, their capitals, and explain Mapungubwe Kingdom'
  },
  {
    subject: 'NSC Accounting · EMS',
    question: 'Explain the Accounting Equation (A = OE + L) and how share buy-backs affect Retained Income'
  },
  {
    subject: 'CAPS Life Orientation',
    question: 'What are the pass requirements for a Bachelor’s Degree pass vs Diploma pass in NSC Matric?'
  }
];

const INTERNATIONAL_STUDY_HINTS = [
  {
    subject: 'Biology',
    question: 'Explain the light and dark reactions of photosynthesis with word equation'
  },
  {
    subject: 'Biology',
    question: 'What is respiration and how does it release energy in living cells?'
  },
  {
    subject: 'Mathematics',
    question: 'Solve 2x² - 5x - 3 = 0 step by step using the quadratic formula'
  },
  {
    subject: 'Physics',
    question: 'Explain Newton’s three laws of motion with real-life examples'
  },
  {
    subject: 'Chemistry',
    question: 'Compare ionic, covalent, and metallic bonding with examples'
  },
  {
    subject: 'Geography',
    question: 'How do river erosion features like waterfalls and gorges form upstream?'
  },
  {
    subject: 'Economics',
    question: 'Compare Perfect Competition and Monopoly market structures'
  },
  {
    subject: 'Computer Science',
    question: 'Explain the fetch-decode-execute cycle in a computer CPU'
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
  static getHarareClockInfo(countryOverride?: string): HarareClockInfo {
    const isZim = StorageManager.isZimbabweAccount(countryOverride);
    const isBw = StorageManager.isBotswanaAccount(countryOverride);
    const isZa = StorageManager.isSouthAfricaAccount(countryOverride);
    const usesCatOrSast = isZim || isBw || isZa;
    const now = new Date();
    // Zimbabwe (CAT), Botswana (CAT), and South Africa (SAST) all run on UTC+2
    const effectiveNow = usesCatOrSast
      ? new Date(now.getTime() + (2 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000))
      : now;

    const h = effectiveNow.getHours();
    const m = effectiveNow.getMinutes();

    let nextSlotName: '6:00 AM' | '12:00 PM' | '6:00 PM' = '6:00 AM';
    let targetHour = 6;
    let daysToAdd = 0;

    const currentMinuteOfDay = h * 60 + m;

    if (currentMinuteOfDay < 6 * 60) {
      targetHour = 6;
      nextSlotName = '6:00 AM';
      daysToAdd = 0;
    } else if (currentMinuteOfDay < 12 * 60) {
      targetHour = 12;
      nextSlotName = '12:00 PM';
      daysToAdd = 0;
    } else if (currentMinuteOfDay < 18 * 60) {
      targetHour = 18;
      nextSlotName = '6:00 PM';
      daysToAdd = 0;
    } else {
      targetHour = 6;
      nextSlotName = '6:00 AM';
      daysToAdd = 1;
    }

    const targetDate = new Date(effectiveNow);
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    targetDate.setHours(targetHour, 0, 0, 0);

    const msUntilNextSlot = Math.max(1000, targetDate.getTime() - effectiveNow.getTime());
    const hoursUntilNext = Math.floor(msUntilNextSlot / (1000 * 60 * 60));
    const minutesUntilNext = Math.floor((msUntilNextSlot % (1000 * 60 * 60)) / (1000 * 60));

    const timeString = effectiveNow.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateString = effectiveNow.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    return {
      harareTimeString: isZim
        ? `${timeString} CAT (Harare)`
        : isBw
        ? `${timeString} CAT (Gaborone)`
        : isZa
        ? `${timeString} SAST (Johannesburg)`
        : `${timeString} Local Time`,
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
  static buildNotificationPayload(
    slotName?: '6:00 AM' | '12:00 PM' | '6:00 PM',
    countryOverride?: string
  ): StudyReminderPayload {
    const isPremium = StorageManager.isPremium();
    const hasUsedAi = StorageManager.hasUsedAiEver();
    const isZim = StorageManager.isZimbabweAccount(countryOverride);
    const isBw = StorageManager.isBotswanaAccount(countryOverride);
    const isZa = StorageManager.isSouthAfricaAccount(countryOverride);
    const activeCountry = countryOverride || StorageManager.getUserCountry();
    const clock = this.getHarareClockInfo(countryOverride);
    const slot = slotName || clock.nextSlotName;

    const hasPack = StorageManager.hasCountryCurriculumPack(countryOverride);
    // Condition A: User has installed the app, but has not used the AI or not paid the premium
    if (!isPremium || !hasUsedAi) {
      return {
        title: '⚡ Activate Premium for 100% Offline Access',
        body: isZim
          ? 'Activate premium for offline access. Start now to unlock all ZIMSEC syllabuses, past papers, and offline AI answers!'
          : isBw
          ? 'Activate premium for offline access. Start now to unlock all BEC (PSLE, JCE & BGCSE) syllabuses, Setswana, practice papers, and offline AI answers!'
          : isZa
          ? 'Activate premium for offline access. Start now to unlock all South Africa DBE CAPS & NSC Matric syllabuses, practice papers, and offline AI answers!'
          : hasPack
          ? `Activate premium for offline access. Start now to unlock all ${activeCountry} syllabuses, practice papers, and offline AI answers!`
          : `Activate premium for unlimited offline ZEXA AI chat tutoring in ${activeCountry}!`,
        type: 'ACTIVATE_PREMIUM',
        slot,
        timestamp: Date.now()
      };
    }

    // Condition B: Active student studying with ZEXA AI
    // Rotate through high-yield dashboard questions scoped to country
    const hints = isZim
      ? DASHBOARD_STUDY_HINTS
      : isBw
      ? BOTSWANA_STUDY_HINTS
      : isZa
      ? SOUTH_AFRICA_STUDY_HINTS
      : INTERNATIONAL_STUDY_HINTS;
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const slotOffset = slot === '6:00 AM' ? 0 : slot === '12:00 PM' ? 1 : 2;
    const selectedItem = hints[(dayIndex + slotOffset) % hints.length];

    const slotTitlePrefix = isZim
      ? slot === '6:00 AM'
        ? '🌅 Morning ZIMSEC Kickoff (6:00 AM Harare)'
        : slot === '12:00 PM'
        ? '☀️ Midday ZIMSEC Revision (12:00 PM Harare)'
        : '🌙 Evening ZIMSEC Mastery (6:00 PM Harare)'
      : isBw
      ? slot === '6:00 AM'
        ? '🌅 Morning BEC Study Kickoff (6:00 AM Gaborone)'
        : slot === '12:00 PM'
        ? '☀️ Midday BEC Revision (12:00 PM Gaborone)'
        : '🌙 Evening BGCSE & JCE Mastery (6:00 PM Gaborone)'
      : isZa
      ? slot === '6:00 AM'
        ? '🌅 Morning CAPS Study Kickoff (6:00 AM SAST)'
        : slot === '12:00 PM'
        ? '☀️ Midday NSC Matric Revision (12:00 PM SAST)'
        : '🌙 Evening CAPS & Matric Mastery (6:00 PM SAST)'
      : slot === '6:00 AM'
      ? `🌅 Morning ${activeCountry} Study Kickoff (6:00 AM)`
      : slot === '12:00 PM'
      ? `☀️ Midday ${activeCountry} Revision (12:00 PM)`
      : `🌙 Evening ${activeCountry} Mastery (6:00 PM)`;

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

  private static swUpdateListenerBound = false;

  /**
   * Registers public/sw.js to handle notifications on installed devices
   */
  private static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const hadController = Boolean(navigator.serviceWorker.controller);
        if (!this.swUpdateListenerBound) {
          this.swUpdateListenerBound = true;
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (hadController && !refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        }
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none'
        });
        registration.update().catch(() => {});
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
  static async sendTestNotification(
    overrideType?: 'ACTIVATE_PREMIUM' | 'STUDY_REMINDER',
    countryOverride?: string
  ): Promise<boolean> {
    const isZim = StorageManager.isZimbabweAccount(countryOverride);
    const isBw = StorageManager.isBotswanaAccount(countryOverride);
    const isZa = StorageManager.isSouthAfricaAccount(countryOverride);
    const activeCountry = countryOverride || StorageManager.getUserCountry();
    const payload = this.buildNotificationPayload(undefined, countryOverride);
    if (overrideType) {
      payload.type = overrideType;
      if (overrideType === 'ACTIVATE_PREMIUM') {
        payload.title = '⚡ Activate Premium for 100% Offline Access (Test)';
        payload.body = isZim
          ? 'Activate premium for offline access. Start now to unlock all ZIMSEC syllabuses, past papers, and offline AI answers!'
          : isBw
          ? 'Activate premium for offline access. Start now to unlock all BEC (PSLE, JCE & BGCSE) syllabuses, Setswana, practice papers, and offline AI answers!'
          : isZa
          ? 'Activate premium for offline access. Start now to unlock all South Africa DBE CAPS & NSC Matric syllabuses, practice papers, and offline AI answers!'
          : `Activate premium for offline access. Start now to unlock all ${activeCountry} syllabuses, practice papers, and offline AI answers!`;
        payload.question = undefined;
      } else {
        const sampleQuestion = isZim
          ? 'Describe ways of preserving heritage sites of Zimbabwe'
          : isBw
          ? BOTSWANA_STUDY_HINTS[0].question
          : isZa
          ? SOUTH_AFRICA_STUDY_HINTS[0].question
          : INTERNATIONAL_STUDY_HINTS[0].question;
        payload.title = '📚 ZEXA Study Reminder (Test)';
        payload.body = `Have you done your study today? Let's begin! 💡 Study Question: "${sampleQuestion}". Tap to explore answer offline.`;
        payload.question = sampleQuestion;
      }
    }
    return await this.dispatchDeviceNotification(payload);
  }
}
