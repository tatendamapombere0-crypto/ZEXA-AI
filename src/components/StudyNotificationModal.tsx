// src/components/StudyNotificationModal.tsx
// Modal interface allowing students to configure and test daily Harare study reminders (6 AM, 12 PM, 6 PM)

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Send, 
  Crown,
  Smartphone,
  Calendar
} from 'lucide-react';
import { NotificationManager, HarareClockInfo } from '../lib/notificationManager';
import { StorageManager } from '../lib/storage';

interface StudyNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPremium: () => void;
  onAskQuestion: (question: string) => void;
}

export const StudyNotificationModal: React.FC<StudyNotificationModalProps> = ({
  isOpen,
  onClose,
  onOpenPremium,
  onAskQuestion
}) => {
  const [clock, setClock] = useState<HarareClockInfo>(() => NotificationManager.getHarareClockInfo());
  const [permission, setPermission] = useState<NotificationPermission>(() => NotificationManager.getPermissionStatus());
  const [isEnabled, setIsEnabled] = useState<boolean>(() => StorageManager.areNotificationsEnabled());
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setClock(NotificationManager.getHarareClockInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isPremium = StorageManager.isPremium();
  const hasUsedAi = StorageManager.hasUsedAiEver();
  const previewPayload = NotificationManager.buildNotificationPayload();

  const handleRequestPermission = async () => {
    const res = await NotificationManager.requestPermission();
    setPermission(res);
    setIsEnabled(StorageManager.areNotificationsEnabled());
    if (res === 'granted') {
      setTestStatus('✅ Notifications enabled! Testing your device now...');
      await NotificationManager.sendTestNotification();
      setTimeout(() => setTestStatus(null), 4000);
    }
  };

  const handleToggle = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    StorageManager.setNotificationsEnabled(next);
    if (next) {
      NotificationManager.initScheduler();
    }
  };

  const handleSendTest = async (type?: 'ACTIVATE_PREMIUM' | 'STUDY_REMINDER') => {
    setTestStatus('🚀 Sending test notification to this device...');
    const delivered = await NotificationManager.sendTestNotification(type);
    if (delivered) {
      setTestStatus('✅ Notification delivered to your system tray & screen!');
    } else {
      setTestStatus('💡 Displayed as in-app notification banner (Enable system permissions for lock-screen alerts)');
    }
    setTimeout(() => setTestStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/[0.12] p-5 sm:p-7 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Daily ZIMSEC Study Reminders
              </h3>
              <p className="text-xs text-slate-400">
                6:00 AM • 12:00 PM • 6:00 PM Harare Time (CAT)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Harare Clock & Schedule Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Current Harare Time (CAT)
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-cyan-300">
                {clock.harareTimeString}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            Next Reminder: <span className="font-bold text-white">{clock.nextSlotName}</span> ({clock.hoursUntilNext}h {clock.minutesUntilNext}m)
          </div>
        </div>

        {/* The 3 Daily Slots Breakdown */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scheduled Daily Study Notification Slots:</span>
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border transition ${clock.nextSlotName === '6:00 AM' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-semibold' : 'bg-white/[0.02] border-white/[0.06] text-slate-400'}`}>
              <div className="font-mono text-sm font-bold text-white">6:00 AM</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Morning Kickoff</div>
            </div>

            <div className={`p-2.5 rounded-xl border transition ${clock.nextSlotName === '12:00 PM' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-semibold' : 'bg-white/[0.02] border-white/[0.06] text-slate-400'}`}>
              <div className="font-mono text-sm font-bold text-white">12:00 PM</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Midday Revision</div>
            </div>

            <div className={`p-2.5 rounded-xl border transition ${clock.nextSlotName === '6:00 PM' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-semibold' : 'bg-white/[0.02] border-white/[0.06] text-slate-400'}`}>
              <div className="font-mono text-sm font-bold text-white">6:00 PM</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Evening Mastery</div>
            </div>
          </div>
        </div>

        {/* Live Notification Preview Box */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-cyan-950/40 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Live Device Preview (Your Next Alert)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 font-mono">
              {!isPremium || !hasUsedAi ? 'Promo Mode' : 'Study Mode'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.08] shadow-inner">
            <div className="flex items-start gap-2.5">
              <img
                src="/assets/zexa_logo_icon.png"
                alt="ZEXA"
                className="w-8 h-8 rounded-lg shrink-0 object-contain"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {previewPayload.title}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {previewPayload.body}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {testStatus && (
          <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-xs text-cyan-300 text-center font-medium animate-fadeIn">
            {testStatus}
          </div>
        )}

        {/* System Permission Button */}
        {permission !== 'granted' && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-amber-200">
                Enable lock-screen & desktop alerts for this device.
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
            >
              Allow Alerts
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => handleSendTest('STUDY_REMINDER')}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Study Hint Alert</span>
          </button>

          <button
            onClick={() => handleSendTest('ACTIVATE_PREMIUM')}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>Test Offline Promo Alert</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-3 font-mono">
          Automated alerts are powered 100% offline via ZEXA Local Brain & device service workers.
        </p>
      </div>
    </div>
  );
};
