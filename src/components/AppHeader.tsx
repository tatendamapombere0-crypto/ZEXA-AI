import React from 'react';
import { Crown, Settings, Plus, ChevronDown, CheckCircle2, Bell } from 'lucide-react';
import { EducationLevel, SubscriptionStatus } from '../types';
import { findCountryConfig } from '../data/worldCountries';
import { getTierForContentLevel } from '../data/countryEducationLevels';

interface AppHeaderProps {
  educationLevel: EducationLevel;
  contentLevel: string;
  country?: string;
  subscriptionStatus: SubscriptionStatus;
  queriesUsedToday: number;
  dailyLimit: number;
  onOpenLevelSelect: () => void;
  onOpenPremium: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onNewChat: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  educationLevel,
  contentLevel,
  country = 'Zimbabwe',
  subscriptionStatus,
  queriesUsedToday,
  dailyLimit,
  onOpenLevelSelect,
  onOpenPremium,
  onOpenSettings,
  onOpenNotifications,
  onNewChat
}) => {
  const isPremium = subscriptionStatus === 'PREMIUM';
  const remaining = Math.max(0, dailyLimit - queriesUsedToday);
  const countryConfig = findCountryConfig(country);
  const activeTier = getTierForContentLevel(country, contentLevel);

  return (
    <header className="sticky top-0 z-30 bg-[#080d1a]/85 backdrop-blur-xl border-b border-white/[0.08] px-2.5 sm:px-6 py-2.5 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Brand & Engine Telemetry */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 sm:gap-2.5 text-left group focus:outline-none shrink-0"
            title="ZEXA AI - Home"
          >
            <div className="shrink-0 flex items-center justify-center relative">
              <img
                src="/assets/zexa_brain_logo.png"
                alt="ZEXA AI Brain Logo"
                className="w-7 h-7 sm:w-8 sm:h-7.5 object-contain animate-brain-glow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
                  ZEXA <span className="text-cyan-400">AI</span>
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Level Selector & Command Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Active Country / Curriculum Badge */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-medium text-slate-200 transition-all shadow-sm"
            title={`Account Country: ${country} (${countryConfig.curriculum})`}
          >
            <span>{countryConfig.flag}</span>
            <span className="font-mono text-[11px] font-semibold text-cyan-300">{countryConfig.code}</span>
          </button>

          {/* Level Switcher Button (Linear Command Style) */}
          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 min-h-[36px] sm:min-h-[38px] rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/40 text-[11px] sm:text-xs font-medium text-slate-200 transition-all shadow-sm active:scale-98 whitespace-nowrap shrink-0"
            title="Switch Curriculum Level"
          >
            <span className="text-cyan-400 font-mono text-[11px] font-semibold hidden md:inline">
              LEVEL:
            </span>
            <span className="font-semibold text-white sm:hidden truncate max-w-[104px]">
              {activeTier.shortLabel}
            </span>
            <span className="font-semibold text-white hidden sm:inline">
              {activeTier.headerLabel}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Usage Badge / Upgrade Action */}
          {!isPremium ? (
            <button
              onClick={onOpenPremium}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 min-h-[36px] sm:min-h-[38px] rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-[11px] sm:text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap shrink-0 tabular-nums"
              title="Activate Unlimited Premium Access"
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 shrink-0" />
              <span className="hidden sm:inline">
                {remaining > 0 ? `${remaining} Free Left` : 'Upgrade'}
              </span>
              <span className="sm:hidden font-mono font-bold">
                {remaining}/2
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1 px-2.5 min-h-[38px] rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium cursor-pointer whitespace-nowrap shrink-0"
              title="Account active with unlimited access"
            >
              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Unlimited Access</span>
            </button>
          )}

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all active:scale-95 shrink-0"
            title="Start New Chat Session"
            aria-label="Start New Chat Session"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Daily Study Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all active:scale-95 shrink-0"
            title={
              country.trim().toLowerCase() === 'zimbabwe'
                ? 'Daily Study Reminders (6:00 AM • 12:00 PM • 6:00 PM Harare Time)'
                : 'Daily Study Reminders (6:00 AM • 12:00 PM • 6:00 PM Scheduled Alerts)'
            }
            aria-label="Daily Study Reminders"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95 shrink-0"
            title="Settings & System Diagnostics"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
