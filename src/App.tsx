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

export const App: React.FC = () => {
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
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    StorageManager.getChatMessages()
  );

  // Modals
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Cross-screen interaction: Asking ZEXA about an exam question or topic
  const [activeExamPrompt, setActiveExamPrompt] = useState<{
    question: string;
    hint?: string;
  } | null>(null);

  // First-turn onboarding check (redirect to Level Select if first time)
  useEffect(() => {
    if (!StorageManager.hasSelectedLevel()) {
      setIsLevelModalOpen(true);
    }
  }, []);

  const refreshQueries = () => {
    setQueriesUsedToday(StorageManager.getDailyQueriesUsed());
    setSubscriptionStatus(StorageManager.getSubscriptionStatus());
  };

  const handleLevelSelect = (newLevel: EducationLevel) => {
    StorageManager.setEducationLevel(newLevel);
    setEducationLevel(newLevel);
    setContentLevel(mapEducationToContentLevel(newLevel));
    // If Tertiary, switch back to chat if currently in studypack/exam
    if (newLevel === 'Tertiary Education' && activeTab !== 'chat') {
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
    if (messages.length > 0) {
      if (confirm('Start a new session? This will clear current chat messages.')) {
        StorageManager.clearChat();
        setMessages([]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
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
        onResetQueries={refreshQueries}
        onClearChat={() => {
          StorageManager.clearChat();
          setMessages([]);
          setIsSettingsModalOpen(false);
        }}
        dailyLimit={dailyLimit}
      />
    </div>
  );
};
export default App;
