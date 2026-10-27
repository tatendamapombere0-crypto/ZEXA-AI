import React from 'react';
import { MessageSquare, BookOpen, GraduationCap } from 'lucide-react';
import { EducationLevel } from '../types';

export type NavTab = 'chat' | 'studypack' | 'exam';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  educationLevel: EducationLevel;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  educationLevel
}) => {
  // Tertiary education hides bottom nav (matching Android behavior)
  if (educationLevel === 'Tertiary Education') {
    return null;
  }

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'chat',
      label: 'ZEXA Chat',
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      id: 'studypack',
      label: 'Study Pack',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'exam',
      label: 'Exam Mode',
      icon: <GraduationCap className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0f1d]/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 glow-cyan-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span className="text-[11px] font-semibold mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
