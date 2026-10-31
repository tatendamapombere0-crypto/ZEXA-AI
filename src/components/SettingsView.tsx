import React, { useState } from 'react';
import { 
  LogOut, 
  Brain, 
  Languages, 
  Calendar, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  Crown, 
  Check, 
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  Info
} from 'lucide-react';
import { EducationLevel, SubscriptionStatus } from '../types';
import { StorageManager } from '../lib/storage';
import { TermCalendarManager } from '../lib/termCalendar';

interface SettingsViewProps {
  educationLevel: EducationLevel;
  contentLevel: string;
  subscriptionStatus: SubscriptionStatus;
  queriesUsedToday: number;
  dailyLimit: number;
  onOpenLevelSelect: () => void;
  onOpenPremium: () => void;
  onClearChat: () => void;
  onLogout: () => void;
  onQuickQuery?: (query: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  educationLevel,
  contentLevel,
  subscriptionStatus,
  queriesUsedToday,
  dailyLimit,
  onOpenLevelSelect,
  onOpenPremium,
  onClearChat,
  onLogout,
  onQuickQuery
}) => {
  const [clearConfirming, setClearConfirming] = useState(false);
  const [logoutConfirming, setLogoutConfirming] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);
  const [preferredLang, setPreferredLang] = useState<'en' | 'sn'>(() =>
    StorageManager.getPreferredLanguage()
  );

  const currentPeriod = TermCalendarManager.getCurrentPeriod();
  const daysLeft = TermCalendarManager.getDaysRemainingInCurrentTerm();
  const userEmail = StorageManager.getSessionUserEmail();

  const handleLanguageChange = (lang: 'en' | 'sn') => {
    setPreferredLang(lang);
    StorageManager.setPreferredLanguage(lang);
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

  const handleConfirmLogout = () => {
    setLogoutConfirming(false);
    onLogout();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl w-full mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* Top Header Card */}
      <div className="p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/30 glow-cyan-sm shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/zexa_logo_icon.png"
            alt="ZEXA AI"
            className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/40 glow-cyan-sm shadow-md bg-[#0a0f1d]"
          />
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              System Settings &amp; Diagnostics
            </h2>
            <p className="text-xs text-slate-400">
              Account: <span className="text-cyan-300 font-semibold">{userEmail}</span>
            </p>
          </div>
        </div>

        {/* Top Logout Trigger */}
        {!logoutConfirming ? (
          <button
            type="button"
            onClick={() => setLogoutConfirming(true)}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow"
            title="Log out of ZEXA AI"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setLogoutConfirming(false)}
              className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Account & Education Level */}
      <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" /> Current Curriculum Level
          </div>
          <button
            onClick={onOpenLevelSelect}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-all"
          >
            Switch Level
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60">
          <div>
            <div className="text-sm font-bold text-white">{educationLevel}</div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active Content: <span className="text-cyan-300 font-mono font-semibold">{contentLevel}</span>
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
            ✓ ZIMSEC Synced
          </span>
        </div>
      </div>

      {/* AI Brain & Model Specifications */}
      <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Brain className="w-4 h-4" /> AI Model &amp; Neural Brain
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold">
            100% OFFLINE
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white">ZEXA 3.8-27B Offline Brain</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Specialized offline neural model trained on the ZIMSEC syllabus and Zimbabwean heritage archives.
              </p>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div>• Execution: Local Device RAM</div>
            <div>• Quantization: 4-bit GGUF</div>
            <div>• Context Window: 32,768 tokens</div>
            <div>• Knowledge Store: 1,251+ topics</div>
          </div>
        </div>
      </div>

      {/* Language Preferences & Shona Support */}
      <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Languages className="w-4 h-4" /> Language &amp; ChiShona AI Support
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-bold">
            Bilingual Active
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          ZEXA AI understands and responds in both <strong>English</strong> and <strong>ChiShona</strong>. If you ask or type in Shona, ZEXA AI automatically provides accurate answers in authentic ChiShona.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              preferredLang === 'en'
                ? 'bg-cyan-950/60 border-cyan-400 text-white glow-cyan-sm'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            🇬🇧 English (Default)
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('sn')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              preferredLang === 'sn'
                ? 'bg-cyan-950/60 border-cyan-400 text-white glow-cyan-sm'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            🇿🇼 ChiShona (Zimbabwe)
          </button>
        </div>

        {/* Quick Shona test chips */}
        {onQuickQuery && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-cyan-300">Try asking in ChiShona:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Mugabe ndiani?',
                'Chii chinonzi photosynthesis?',
                'Chiredzi iri mudunhu ripi rekurima?',
                'Tsanangura tsumo: Chara chimwe hachitswanyi inda'
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => onQuickQuery(q)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Limit & Subscription (Automated Reset) */}
      <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Daily Query Limit &amp; Automated Reset
          </div>
          {subscriptionStatus === 'PREMIUM' ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 fill-amber-300" /> PREMIUM UNLIMITED
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold">
              FREE USER
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Queries Used Today:</span>
            <span className="font-mono font-bold text-white">
              {subscriptionStatus === 'PREMIUM' ? 'Unlimited' : `${queriesUsedToday} / ${dailyLimit}`}
            </span>
          </div>

          {/* Automated Reset Info Box (Replaces manual button) */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-cyan-300">Automated Daily Reset Active</p>
              <p className="text-[11px] text-slate-400">
                Your daily free queries reset automatically every midnight (00:00). No manual reset is required.
              </p>
            </div>
          </div>

          {subscriptionStatus !== 'PREMIUM' && (
            <button
              type="button"
              onClick={onOpenPremium}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Upgrade to Unlimited Term Pass ($4 / $5)</span>
            </button>
          )}
        </div>
      </div>

      {/* Academic Term Calendar */}
      <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Calendar className="w-4 h-4" /> Academic Calendar Status
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-xs space-y-1">
          <p className="font-bold text-white text-sm">{currentPeriod.name}</p>
          <p className="text-slate-400">
            Dates: {currentPeriod.startDate} to {currentPeriod.endDate}{' '}
            {daysLeft >= 0 ? `(${daysLeft} days remaining in term)` : '(Holiday Break)'}
          </p>
        </div>
      </div>

      {/* Clear Chat Conversation History */}
      <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
          <Trash2 className="w-4 h-4" /> Conversation Management
        </div>

        {!clearConfirming ? (
          <button
            type="button"
            onClick={() => setClearConfirming(true)}
            className="w-full p-3 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/40 text-slate-300 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2 text-red-300">
              <Trash2 className="w-4 h-4 text-red-400" /> Clear Current Chat Messages
            </span>
            <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">
              Clear
            </span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/60 text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-red-200 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Confirm clearing all chat history?</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setClearConfirming(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Yes, Clear Now
              </button>
            </div>
          </div>
        )}

        {clearMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{clearMessage}</span>
          </div>
        )}
      </div>

      {/* About & Branding Footer */}
      <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
        <img
          src="/assets/zexa_logo_full.png"
          alt="ZEXA AI"
          className="w-40 mx-auto object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        />
        <p className="font-semibold text-slate-400">
          ZEXA AI Zimbabwe • First Zimbabwe OFFLINE AI Engine
        </p>
        <p className="text-[11px] max-w-md mx-auto">
          Empowering Zimbabwean students with offline curriculum revision, past papers, and bilingual tutoring.
        </p>
      </div>
    </div>
  );
};
