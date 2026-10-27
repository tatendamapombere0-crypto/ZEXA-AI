import React from 'react';
import { X, Settings, RotateCcw, Trash2, Calendar, ShieldCheck, Key } from 'lucide-react';
import { StorageManager } from '../lib/storage';
import { TermCalendarManager } from '../lib/termCalendar';
import { OfflineActivationManager } from '../lib/offlineActivation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetQueries: () => void;
  onClearChat: () => void;
  dailyLimit: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetQueries,
  onClearChat,
  dailyLimit
}) => {
  if (!isOpen) return null;

  const currentPeriod = TermCalendarManager.getCurrentPeriod();
  const daysLeft = TermCalendarManager.getDaysRemainingInCurrentTerm();
  const todayCode = OfflineActivationManager.generateDailyCode();

  const handleResetLimit = () => {
    StorageManager.resetDailyLimitForTesting();
    onResetQueries();
    alert('Daily query limit has been reset to 0! You have full free queries available.');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your current conversation history?')) {
      onClearChat();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">System Settings &amp; Diagnostics</h3>
            <p className="text-xs text-slate-400">
              ZEXA AI Zimbabwe v2.7 Offline Engine
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Term Status */}
          <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Calendar className="w-4 h-4" /> Academic Calendar Status
            </div>
            <p className="text-sm font-semibold text-white">
              {currentPeriod.name}
            </p>
            <p className="text-xs text-slate-400">
              Period: {currentPeriod.startDate} to {currentPeriod.endDate}{' '}
              {daysLeft >= 0 ? `(${daysLeft} days remaining in term)` : '(Holiday Break)'}
            </p>
          </div>

          {/* Offline Activation Inspection */}
          <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Key className="w-4 h-4" /> Daily Offline Activation Hash
            </div>
            <p className="text-xs font-mono text-cyan-300 break-all bg-slate-900 p-2 rounded-lg border border-slate-800">
              {todayCode}
            </p>
            <p className="text-[11px] text-slate-500">
              Calculated via Day|Year|Term|Month|SecretKey protocol.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleResetLimit}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold transition-all active:scale-98"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" /> Reset Daily Query Limit ({dailyLimit} free queries)
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                Reset
              </span>
            </button>

            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-red-950/40 border border-slate-700/70 hover:border-red-500/40 text-slate-200 text-xs font-semibold transition-all active:scale-98"
            >
              <span className="flex items-center gap-2 text-red-300">
                <Trash2 className="w-4 h-4" /> Clear Current Chat Messages
              </span>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                Clear
              </span>
            </button>
          </div>

          {/* About Footer */}
          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">
              ZEXA AI - Zimbabwe Education &amp; Examination Assistant
            </p>
            <p className="text-[11px]">
              Empowering Zimbabwean students with offline curriculum revision, Grade 7, O-Level, and A-Level past papers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
