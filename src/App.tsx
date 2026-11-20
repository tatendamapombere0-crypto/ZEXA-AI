import React, { useState, useEffect } from 'react';
import { EducationLevel, SubscriptionStatus, ChatMessage } from './types';
import { StorageManager, mapEducationToContentLevel } from './lib/storage';
import { KnowledgeStore } from './lib/knowledgeStore';
import { ZexaNeuralEngine } from './lib/zexaNeuralEngine';
import { AppHeader } from './components/AppHeader';
import { BottomNav, NavTab } from './components/BottomNav';
import { ChatView } from './components/ChatView';
import { StudyPackView } from './components/StudyPackView';
import { ExamModeView } from './components/ExamModeView';
import { RevisionHubView } from './components/RevisionHubView';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PremiumModal } from './components/PremiumModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { StudyNotificationModal } from './components/StudyNotificationModal';
import { NotificationManager } from './lib/notificationManager';

export const App: React.FC = () => {
  // Warm up offline knowledge store, auto-connect bundled ZEXA AI weights if present, & initialize reminders
  useEffect(() => {
    KnowledgeStore.load();
    ZexaNeuralEngine.autoConnectLocalGGUF();
    NotificationManager.initScheduler();

    // Check URL parameters for notification click actions
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'premium') {
        setIsPremiumModalOpen(true);
      } else if (params.get('question')) {
        const q = decodeURIComponent(params.get('question') || '');
        if (q) {
          setActiveExamPrompt({ question: q });
          setActiveTab('chat');
        }
      }

      // Listen for Service Worker notification click messages
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'ZEXA_NOTIFICATION_CLICK') {
          if (event.data.action === 'ACTIVATE_PREMIUM') {
            setIsPremiumModalOpen(true);
          } else if (event.data.question) {
            setActiveExamPrompt({ question: event.data.question });
            setActiveTab('chat');
          }
        }
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleSwMessage);
      }

      return () => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleSwMessage);
        }
      };
    }
  }, []);

  // Session authentication state (Login -> Education Level -> AI Brain -> Dashboard)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() =>
    StorageManager.isSessionLoggedIn() &&
    StorageManager.isBrainInitialized() &&
    StorageManager.hasSelectedCountry()
  );

  const [educationLevel, setEducationLevel] = useState<EducationLevel>(() =>
    StorageManager.getEducationLevel()
  );
  const [contentLevel, setContentLevel] = useState<string>(() =>
    StorageManager.getContentLevel()
  );
  const [country, setCountry] = useState<string>(() =>
    StorageManager.getUserCountry()
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(() =>
    StorageManager.getSubscriptionStatus()
  );
  const [queriesUsedToday, setQueriesUsedToday] = useState<number>(() =>
    StorageManager.getDailyQueriesUsed()
  );
  const [dailyLimit, setDailyLimit] = useState<number>(() =>
    StorageManager.getDailyLimit()
  );

  const [activeTab, setActiveTab] = useState<NavTab>('chat');

  // Requirement 2: Start fresh without auto-loading previous question on app reopen
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Modals
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Cross-screen interaction: Asking ZEXA about an exam question or topic
  const [activeExamPrompt, setActiveExamPrompt] = useState<{
    question: string;
    hint?: string;
  } | null>(null);

  const computeRevisionTotal = (c: string) => {
    const stats = StorageManager.getStudyStats(c);
    return stats.searchHistoryCount + stats.examQACount + stats.bookmarksCount;
  };

  const [revisionCount, setRevisionCount] = useState<number>(() =>
    computeRevisionTotal(StorageManager.getUserCountry())
  );

  const refreshRevisionCount = (countryOverride?: string) => {
    const activeCountry = countryOverride || country;
    setRevisionCount(computeRevisionTotal(activeCountry));
  };

  const refreshQueries = () => {
    setQueriesUsedToday(StorageManager.getDailyQueriesUsed());
    setSubscriptionStatus(StorageManager.getSubscriptionStatus());
    refreshRevisionCount();
  };

  const handleLevelSelect = (newLevel: EducationLevel) => {
    StorageManager.setEducationLevel(newLevel);
    setEducationLevel(newLevel);
    setContentLevel(mapEducationToContentLevel(newLevel));
    // If Tertiary, switch back to chat if currently in studypack/exam
    if (newLevel === 'Tertiary Education' && (activeTab === 'studypack' || activeTab === 'exam')) {
      setActiveTab('chat');
    }
  };

  const handleOpenUpgrade = (_level: EducationLevel, _price: number) => {
    setIsLevelModalOpen(false);
    setIsPremiumModalOpen(true);
  };

  const handleAskZexaFromStudyPack = (question: string) => {
    setActiveExamPrompt({ question });
    setActiveTab('chat');
  };

  const handleAskZexaFromExam = (prompt: string, hint?: string) => {
    setActiveExamPrompt({ question: prompt, hint });
    setActiveTab('chat');
  };

  const handleNewChat = () => {
    StorageManager.clearChat();
    setMessages([]);
  };

  const handleCountryChange = (newCountry: string) => {
    StorageManager.setUserCountry(newCountry);
    setCountry(newCountry);
    try {
      localStorage.removeItem('zexa_active_paper');
      localStorage.removeItem('zexa_active_paper_item');
      localStorage.removeItem('zexa_active_paper_qindex');
      localStorage.removeItem('zexa_active_paper_answers');
      localStorage.removeItem('zexa_active_paper_revealed');
    } catch {}
    refreshRevisionCount(newCountry);
  };

  const handleOnboardingComplete = (level: EducationLevel, email?: string, selectedCountry?: string) => {
    const resolvedCountry = selectedCountry || StorageManager.getUserCountry();
    StorageManager.initNewSession(email || 'Offline Student', resolvedCountry);
    StorageManager.setBrainInitialized(true);
    setCountry(resolvedCountry);
    handleLevelSelect(level);
    setIsSessionActive(true);
    setMessages([]);
    setActiveTab('chat');
    refreshQueries();
    refreshRevisionCount(resolvedCountry);
  };

  const handleLogout = () => {
    StorageManager.logout();
    try {
      localStorage.removeItem('zexa_active_paper');
      localStorage.removeItem('zexa_active_paper_item');
      localStorage.removeItem('zexa_active_paper_qindex');
      localStorage.removeItem('zexa_active_paper_answers');
      localStorage.removeItem('zexa_active_paper_revealed');
    } catch {}
    setCountry('Zimbabwe');
    setIsSessionActive(false);
    setMessages([]);
    setActiveTab('chat');
    refreshQueries();
    refreshRevisionCount('Zimbabwe');
  };

  // If not logged in or AI brain not initialized, present the complete login & onboarding sequence
  if (!isSessionActive) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const isChatTab = activeTab === 'chat';

  return (
    <div
      className={`${
        isChatTab ? 'h-dvh overflow-hidden' : 'min-h-screen'
      } bg-[#080d1a] bg-mesh text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200`}
    >
      {/* App Header */}
      <AppHeader
        educationLevel={educationLevel}
        contentLevel={contentLevel}
        country={country}
        subscriptionStatus={subscriptionStatus}
        queriesUsedToday={queriesUsedToday}
        dailyLimit={dailyLimit}
        onOpenLevelSelect={() => setIsLevelModalOpen(true)}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onNewChat={handleNewChat}
      />

      {/* Main View Area */}
      <main className={isChatTab ? 'flex-1 min-h-0 flex flex-col w-full' : 'flex-1 w-full'}>
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            educationLevel={educationLevel}
            contentLevel={contentLevel}
            country={country}
            subscriptionStatus={subscriptionStatus}
            queriesUsedToday={queriesUsedToday}
            dailyLimit={dailyLimit}
            onQueriesUpdated={refreshQueries}
            onRevisionUpdated={() => refreshRevisionCount()}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
            activeExamPrompt={activeExamPrompt}
            onClearActiveExamPrompt={() => setActiveExamPrompt(null)}
          />
        )}

        {activeTab === 'studypack' && (
          <StudyPackView
            contentLevel={contentLevel}
            country={country}
            onAskZexa={handleAskZexaFromStudyPack}
            onRevisionUpdated={() => refreshRevisionCount()}
          />
        )}

        {activeTab === 'exam' && (
          <ExamModeView
            contentLevel={contentLevel}
            country={country}
            onAskZexaQuestion={handleAskZexaFromExam}
            onRevisionUpdated={() => refreshRevisionCount()}
          />
        )}

        {activeTab === 'revision' && (
          <RevisionHubView
            country={country}
            contentLevel={contentLevel}
            onAskZexa={handleAskZexaFromStudyPack}
            onDataUpdated={() => refreshRevisionCount()}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        educationLevel={educationLevel}
        revisionCount={revisionCount}
      />

      {/* Modals */}
      <LevelSelectModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentLevel={educationLevel}
        contentLevel={contentLevel}
        country={country}
        onSelectLevel={handleLevelSelect}
        onOpenUpgrade={handleOpenUpgrade}
        isPremium={subscriptionStatus === 'PREMIUM'}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        educationLevel={educationLevel}
        country={country}
        onActivated={refreshQueries}
      />

      <StudyNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        country={country}
        onOpenPremium={() => {
          setIsNotificationModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
        onAskQuestion={(q) => {
          setIsNotificationModalOpen(false);
          setActiveExamPrompt({ question: q });
          setActiveTab('chat');
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        educationLevel={educationLevel}
        contentLevel={contentLevel}
        country={country}
        onCountryChange={handleCountryChange}
        subscriptionStatus={subscriptionStatus}
        queriesUsedToday={queriesUsedToday}
        dailyLimit={dailyLimit}
        onOpenLevelSelect={() => {
          setIsSettingsModalOpen(false);
          setIsLevelModalOpen(true);
        }}
        onOpenPremium={() => {
          setIsSettingsModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
        onOpenNotifications={() => {
          setIsSettingsModalOpen(false);
          setIsNotificationModalOpen(true);
        }}
        onResetQueries={refreshQueries}
        onClearChat={() => {
          StorageManager.clearChat();
          setMessages([]);
        }}
        onLogout={() => {
          setIsSettingsModalOpen(false);
          handleLogout();
        }}
      />
    </div>
  );
};

export default App;
