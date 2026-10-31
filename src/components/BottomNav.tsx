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
  const isTertiary = educationLevel === 'Tertiary Education';

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = isTertiary
    ? [
        {
          id: 'chat',
          label: 'ZEXA Chat',
          icon: <MessageSquare className="w-4 h-4" />
        }
      ]
    : [
        {
          id: 'chat',
          label: 'ZEXA Chat',
          icon: <MessageSquare className="w-4 h-4" />
        },
        {
          id: 'studypack',
          label: 'Study Pack',
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          id: 'exam',
          label: 'Exam Mode',
          icon: <GraduationCap className="w-4 h-4" />
        }
      ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-30 pointer-events-none flex justify-center px-4">
      <nav 
        aria-label="Application navigation"
        className="pointer-events-auto max-w-md w-full sm:w-auto px-2 py-1.5 rounded-2xl bg-[#0e1628]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-around sm:justify-center gap-1.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
              <span className="tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
