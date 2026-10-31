import React from 'react';
import { Crown, Settings, Plus, ChevronDown, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const isPremium = subscriptionStatus === 'PREMIUM';
  const remaining = Math.max(0, dailyLimit - queriesUsedToday);

  return (
    <header className="sticky top-0 z-30 bg-[#080d1a]/85 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 py-2.5 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand & Engine Telemetry */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewChat}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="ZEXA AI - Home"
          >
            <div className="shrink-0 flex items-center justify-center relative">
              <img
                src="/assets/zexa_brain_logo.png"
                alt="ZEXA AI Brain Logo"
                className="w-8 h-7.5 object-contain animate-brain-glow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  ZEXA <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-500/30 text-cyan-300 font-semibold tracking-wider">
                  v2.8
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] tracking-wide text-slate-400">
                  ZEXA 2.5/3.8 · 100% Offline
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Level Selector & Command Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Level Switcher Button (Linear Command Style) */}
          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-medium text-slate-200 transition-all shadow-sm active:scale-98"
            title="Switch Curriculum Level"
          >
            <span className="text-cyan-400 font-mono text-[11px] font-semibold hidden md:inline">
              LEVEL:
            </span>
            <span className="font-semibold text-white">
              {contentLevel === 'O-Level'
                ? 'O-Level (Forms 1-4)'
                : contentLevel === 'A-Level'
                ? 'A-Level (Forms 5-6)'
                : contentLevel === 'Primary'
                ? 'Primary (Grade 1-7)'
                : 'Tertiary'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Usage Badge / Upgrade Action */}
          {!isPremium ? (
            <button
              onClick={onOpenPremium}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
              title="Activate Unlimited Premium Access"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
              <span className="hidden sm:inline">
                {remaining > 0 ? `${remaining} Free Left` : 'Upgrade'}
              </span>
              <span className="sm:hidden font-mono font-bold">
                {remaining}/2
              </span>
            </button>
          ) : (
            <div 
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium cursor-pointer"
              title="Account active with unlimited access"
            >
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>Unlimited Access</span>
            </div>
          )}

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            title="Start New Chat Session"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Settings & System Diagnostics"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
