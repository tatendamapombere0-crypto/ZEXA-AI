// src/components/InAppNotificationToast.tsx
// Interactive in-app study reminder toast that appears when a scheduled notification fires

import React from 'react';
import { Bell, Sparkles, Crown, ArrowRight, X } from 'lucide-react';
import { StudyReminderPayload } from '../lib/notificationManager';

interface InAppNotificationToastProps {
  notification: StudyReminderPayload | null;
  onDismiss: () => void;
  onAction: (payload: StudyReminderPayload) => void;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({
  notification,
  onDismiss,
  onAction
}) => {
  if (!notification) return null;

  const isPromo = notification.type === 'ACTIVATE_PREMIUM';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto animate-slideDown">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
        isPromo
          ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/70 border-amber-500/40 text-white'
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/70 border-cyan-500/40 text-white'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
            isPromo
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
          }`}>
            {isPromo ? <Crown className="w-5 h-5 fill-amber-400" /> : <Bell className="w-5 h-5 animate-bounce" />}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {notification.title}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 shrink-0">
                {notification.slot || 'Harare Time'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {notification.body}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onAction(notification)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 ${
                  isPromo
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                <span>{isPromo ? 'Activate Premium Now' : 'Study This Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onDismiss}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs transition"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
