import React, { useState } from 'react';
import { X, Settings, RotateCcw, Trash2, Calendar, Check, AlertTriangle } from 'lucide-react';
import { StorageManager } from '../lib/storage';
import { TermCalendarManager } from '../lib/termCalendar';

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
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [clearConfirming, setClearConfirming] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPeriod = TermCalendarManager.getCurrentPeriod();
  const daysLeft = TermCalendarManager.getDaysRemainingInCurrentTerm();

  const handleResetLimit = () => {
    StorageManager.resetDailyLimitForTesting();
    onResetQueries();
    setResetMessage(`✓ Daily query count reset to 0! You have ${dailyLimit} free queries available.`);
    setTimeout(() => {
      setResetMessage(null);
    }, 4000);
  };

  const handleClearHistory = () => {
    StorageManager.clearChat();
    onClearChat();
    setClearConfirming(false);
    setClearMessage('✓ All conversation history has been cleared.');
    setTimeout(() => {
      setClearMessage(null);
    }, 3000);
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
              ZEXA AI Zimbabwe  Offline Engine
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

          {/* Action Buttons & Feedback */}
          <div className="space-y-3 pt-2">
            {/* Reset Button */}
            <div>
              <button
                type="button"
                onClick={handleResetLimit}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-all active:scale-98"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-cyan-400" /> Reset Daily Query Limit ({dailyLimit} free queries)
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-md font-mono font-bold">
                  Reset Limit
                </span>
              </button>
              {resetMessage && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resetMessage}</span>
                </div>
              )}
            </div>

            {/* Clear Chat Button */}
            <div>
              {!clearConfirming ? (
                <button
                  type="button"
                  onClick={() => setClearConfirming(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-red-950/40 border border-slate-700/70 hover:border-red-500/40 text-slate-200 text-xs font-semibold transition-all active:scale-98"
                >
                  <span className="flex items-center gap-2 text-red-300">
                    <Trash2 className="w-4 h-4 text-red-400" /> Clear Current Chat Messages
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-md font-mono font-bold">
                    Clear Chat
                  </span>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/60 text-xs space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-red-200 font-medium">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Confirm clearing all chat history? This cannot be undone.</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setClearConfirming(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow"
                    >
                      Yes, Clear Now
                    </button>
                  </div>
                </div>
              )}

              {clearMessage && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{clearMessage}</span>
                </div>
              )}
            </div>
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
