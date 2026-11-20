import React from 'react';
import { MessageSquare, BookOpen, GraduationCap, BookmarkCheck } from 'lucide-react';
import { EducationLevel } from '../types';

export type NavTab = 'chat' | 'studypack' | 'exam' | 'revision';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  educationLevel: EducationLevel;
  revisionCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  educationLevel,
  revisionCount = 0
}) => {
  const isTertiary = educationLevel === 'Tertiary Education';

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode; count?: number }> = isTertiary
    ? [
        {
          id: 'chat',
          label: 'ZEXA AI',
          icon: <MessageSquare className="w-4 h-4" />
        },
        {
          id: 'revision',
          label: 'Revision',
          icon: <BookmarkCheck className="w-4 h-4" />,
          count: revisionCount
        }
      ]
    : [
        {
          id: 'chat',
          label: 'ZEXA AI',
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
        },
        {
          id: 'revision',
          label: 'Revision',
          icon: <BookmarkCheck className="w-4 h-4" />,
          count: revisionCount
        }
      ];

  return (
    <div className="fixed bottom-2 left-0 right-0 z-30 pointer-events-none flex justify-center px-2 sm:px-3">
      <nav
        aria-label="Application navigation"
        className="pointer-events-auto max-w-lg w-full sm:w-auto px-1 sm:px-1.5 py-1 rounded-2xl bg-[#0e1628]/92 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.55)] flex items-center justify-between sm:justify-center gap-0.5 sm:gap-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3.5 min-h-[40px] sm:min-h-[42px] rounded-xl text-[10.5px] sm:text-xs font-semibold transition-all duration-200 select-none whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_12px_rgba(6,182,212,0.18)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={`shrink-0 transition-transform duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
              <span className="tracking-tight sm:tracking-wide">{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="font-mono text-[9.5px] sm:text-[10px] font-bold text-cyan-300 tabular-nums">
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
