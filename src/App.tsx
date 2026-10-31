import React, { useState, useEffect } from 'react';
import { EducationLevel, SubscriptionStatus, ChatMessage } from './types';
import { StorageManager, mapEducationToContentLevel } from './lib/storage';
import { AppHeader } from './components/AppHeader';
import { BottomNav, NavTab } from './components/BottomNav';
import { ChatView } from './components/ChatView';
import { StudyPackView } from './components/StudyPackView';
import { ExamModeView } from './components/ExamModeView';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PremiumModal } from './components/PremiumModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingFlow } from './components/OnboardingFlow';

export const App: React.FC = () => {
  // Session authentication state (Login -> Education Level -> AI Brain -> Dashboard)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() =>
    StorageManager.isSessionLoggedIn() && StorageManager.isBrainInitialized()
  );

  const [educationLevel, setEducationLevel] = useState<EducationLevel>(() =>
    StorageManager.getEducationLevel()
  );
  const [contentLevel, setContentLevel] = useState<string>(() =>
    StorageManager.getContentLevel()
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

  // Cross-screen interaction: Asking ZEXA about an exam question or topic
  const [activeExamPrompt, setActiveExamPrompt] = useState<{
    question: string;
    hint?: string;
  } | null>(null);

  const refreshQueries = () => {
    setQueriesUsedToday(StorageManager.getDailyQueriesUsed());
    setSubscriptionStatus(StorageManager.getSubscriptionStatus());
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

  const handleOnboardingComplete = (level: EducationLevel, email?: string) => {
    StorageManager.initNewSession(email || 'Offline Student');
    StorageManager.setBrainInitialized(true);
    handleLevelSelect(level);
    setIsSessionActive(true);
    setMessages([]);
    setActiveTab('chat');
    refreshQueries();
  };

  const handleLogout = () => {
    StorageManager.logout();
    setIsSessionActive(false);
    setMessages([]);
    setActiveTab('chat');
    refreshQueries();
  };

  // If not logged in or AI brain not initialized, present the complete login & onboarding sequence
  if (!isSessionActive) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#080d1a] bg-mesh text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* App Header */}
      <AppHeader
        educationLevel={educationLevel}
        contentLevel={contentLevel}
        subscriptionStatus={subscriptionStatus}
        queriesUsedToday={queriesUsedToday}
        dailyLimit={dailyLimit}
        onOpenLevelSelect={() => setIsLevelModalOpen(true)}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onNewChat={handleNewChat}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            educationLevel={educationLevel}
            contentLevel={contentLevel}
            subscriptionStatus={subscriptionStatus}
            queriesUsedToday={queriesUsedToday}
            dailyLimit={dailyLimit}
            onQueriesUpdated={refreshQueries}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            activeExamPrompt={activeExamPrompt}
            onClearActiveExamPrompt={() => setActiveExamPrompt(null)}
          />
        )}

        {activeTab === 'studypack' && (
          <StudyPackView
            contentLevel={contentLevel}
            onAskZexa={handleAskZexaFromStudyPack}
          />
        )}

        {activeTab === 'exam' && (
          <ExamModeView
            contentLevel={contentLevel}
            onAskZexaQuestion={handleAskZexaFromExam}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        educationLevel={educationLevel}
      />

      {/* Modals */}
      <LevelSelectModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentLevel={educationLevel}
        contentLevel={contentLevel}
        onSelectLevel={handleLevelSelect}
        onOpenUpgrade={handleOpenUpgrade}
        isPremium={subscriptionStatus === 'PREMIUM'}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        educationLevel={educationLevel}
        onActivated={refreshQueries}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        educationLevel={educationLevel}
        contentLevel={contentLevel}
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
