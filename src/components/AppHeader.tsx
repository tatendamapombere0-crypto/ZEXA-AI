import React from 'react';
import { Sparkles, Crown, Settings, Plus, Layers } from 'lucide-react';
import { EducationLevel, SubscriptionStatus } from '../types';

interface AppHeaderProps {
  educationLevel: EducationLevel;
  contentLevel: string;
  subscriptionStatus: SubscriptionStatus;
  queriesUsedToday: number;
  dailyLimit: number;
  onOpenLevelSelect: () => void;
  onOpenPremium: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  educationLevel,
  contentLevel,
  subscriptionStatus,
  queriesUsedToday,
  dailyLimit,
  onOpenLevelSelect,
  onOpenPremium,
  onOpenSettings,
  onNewChat
}) => {
  const getSubtitle = () => {
    if (subscriptionStatus === 'PREMIUM') {
      return { text: 'Unlimited Access', color: 'text-cyan-400' };
    }
    if (subscriptionStatus === 'HOLIDAY_FREE') {
      return { text: 'Holiday Free Access', color: 'text-cyan-400' };
    }
    const remaining = Math.max(0, dailyLimit - queriesUsedToday);
    return {
      text: `Free User (${queriesUsedToday}/${dailyLimit} used • ${remaining} left)`,
      color: 'text-slate-400'
    };
  };

  const subtitle = getSubtitle();

  return (
    <header className="sticky top-0 z-30 bg-[#0c1326]/90 backdrop-blur-md border-b border-cyan-900/30 px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan-sm shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-wider text-white flex items-center gap-1.5">
                ZEXA <span className="text-cyan-400">AI</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold">
                v2.7
              </span>
            </div>
            <p className={`text-xs font-medium ${subtitle.color}`}>
              {subtitle.text}
            </p>
          </div>
        </div>

        {/* Level Badge & Actions */}
        <div className="flex items-center gap-2">
          {/* Level Switcher Button */}
          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-all hover:border-cyan-500/50"
            title="Change Education Level"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{contentLevel}</span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded ml-0.5">Edit</span>
          </button>

          {/* Premium / Upgrade Button */}
          {subscriptionStatus === 'FREE' && (
            <button
              onClick={onOpenPremium}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all active:scale-95"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-all active:scale-95"
            title="Settings & Tools"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
