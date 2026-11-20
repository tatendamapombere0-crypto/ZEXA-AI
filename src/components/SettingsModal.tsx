import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  KeyRound, 
  Check, 
  AlertTriangle, 
  LogOut, 
  Layers, 
  Languages, 
  Calendar, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  RotateCcw,
  CheckCircle2,
  Crown,
  Bell,
  Upload,
  Globe
} from 'lucide-react';
import { EducationLevel, SubscriptionStatus } from '../types';
import { WORLD_COUNTRIES, findCountryConfig } from '../data/worldCountries';
import { getTierForContentLevel } from '../data/countryEducationLevels';
import { StorageManager } from '../lib/storage';
import { TermCalendarManager } from '../lib/termCalendar';
import { ZexaNeuralEngine, ZexaProgressState } from '../lib/zexaNeuralEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationLevel: EducationLevel;
  contentLevel: string;
  subscriptionStatus: SubscriptionStatus;
  queriesUsedToday: number;
  dailyLimit: number;
  onOpenLevelSelect: () => void;
  onOpenPremium: () => void;
  onOpenNotifications?: () => void;
  onResetQueries: () => void;
  onClearChat: () => void;
  onLogout: () => void;
  country?: string;
  onCountryChange?: (newCountry: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  educationLevel,
  contentLevel,
  subscriptionStatus,
  queriesUsedToday,
  dailyLimit,
  onOpenLevelSelect,
  onOpenPremium,
  onOpenNotifications,
  onResetQueries,
  onClearChat,
  onLogout,
  country = 'Zimbabwe',
  onCountryChange
}) => {
  const [activationCode, setActivationCode] = useState('');
  const [activationFeedback, setActivationFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [clearConfirming, setClearConfirming] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const [logoutConfirming, setLogoutConfirming] = useState(false);
  const [preferredLang, setPreferredLang] = useState<'en' | 'sn'>(() =>
    StorageManager.getPreferredLanguage()
  );
  const [neuralState, setNeuralState] = useState<ZexaProgressState>(() => ZexaNeuralEngine.getStatus());
  const ggufFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNeuralState(ZexaNeuralEngine.getStatus());
    return ZexaNeuralEngine.subscribe(setNeuralState);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPeriod = TermCalendarManager.getCurrentPeriod();
  const daysLeft = TermCalendarManager.getDaysRemainingInCurrentTerm();
  const userEmail = StorageManager.getSessionUserEmail();
  const isPremium = subscriptionStatus === 'PREMIUM';
  const remainingQueries = Math.max(0, dailyLimit - queriesUsedToday);
  const isZim = StorageManager.isZimbabweAccount(country);
  const isBw = StorageManager.isBotswanaAccount(country);
  const isZa = StorageManager.isSouthAfricaAccount(country);
  const hasPack = StorageManager.hasCountryCurriculumPack(country);
  const countryConfig = findCountryConfig(country);
  const activeTier = getTierForContentLevel(country, contentLevel);

  const handleApplyActivationCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      setActivationFeedback({
        type: 'error',
        message: 'Please enter an activation code.'
      });
      return;
    }

    const result = StorageManager.activateWithCode(activationCode);
    if (result.success) {
      setActivationFeedback({
        type: 'success',
        message: result.message
      });
      setActivationCode('');
      onResetQueries();
    } else {
      setActivationFeedback({
        type: 'error',
        message: result.message
      });
    }
  };

  const handleLanguageChange = (lang: 'en' | 'sn') => {
    setPreferredLang(lang);
    StorageManager.setPreferredLanguage(lang);
  };

  const handleClearHistory = () => {
    StorageManager.clearChat();
    onClearChat();
    setClearConfirming(false);
    setClearMessage('All conversation history cleared.');
    setTimeout(() => {
      setClearMessage(null);
    }, 3000);
  };

  const handleConfirmLogout = () => {
    setLogoutConfirming(false);
    onClose();
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-elevated rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center">
              <img
                src="/assets/zexa_brain_logo.png"
                alt="ZEXA AI Brain Logo"
                className="w-10 h-9 object-contain animate-brain-glow"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                Settings &amp; License
              </h2>
              <p className="text-xs text-slate-400">
                User: <span className="text-cyan-300 font-mono font-medium">{userEmail}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. ZEXA AI ENGINE — TOP FOR INSTANT ACCESS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0e1b33]/90 via-[#0e1628]/95 to-[#080d1a] border border-cyan-500/40 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4" /> ZEXA AI Engine
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                neuralState.status === 'ready'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                  : neuralState.status === 'loading' || neuralState.status === 'checking'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30'
                  : neuralState.status === 'error'
                  ? 'bg-red-950/80 text-red-300 border-red-500/30'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
              }`}
            >
              {neuralState.status === 'ready'
                ? 'ZEXA AI Connected'
                : neuralState.status === 'loading'
                ? `Loading ${neuralState.progress}%`
                : neuralState.status === 'checking'
                ? 'Checking...'
                : neuralState.status === 'error'
                ? 'Connection Error'
                : 'Brain File Not Loaded'}
            </span>
          </div>
          <div className="text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white text-sm">ZEXA AI</p>
            <p className="text-[11px] text-slate-400">{neuralState.statusText}</p>
            {neuralState.error && (
              <p className="text-[11px] text-amber-300">{neuralState.error}</p>
            )}

            {neuralState.status === 'loading' && (
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5 border border-white/[0.08]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${neuralState.progress}%` }}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <input
                ref={ggufFileInputRef}
                type="file"
                accept=".gguf,application/octet-stream,*/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) ZexaNeuralEngine.loadModelFromFile(file);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => ggufFileInputRef.current?.click()}
                disabled={neuralState.status === 'loading'}
                className="px-3.5 py-2 rounded-xl btn-primary-gradient text-slate-950 disabled:opacity-50 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Load Local Brain File</span>
              </button>

              <button
                type="button"
                onClick={() => ZexaNeuralEngine.autoConnectLocalGGUF()}
                disabled={neuralState.status === 'loading' || neuralState.status === 'checking'}
                className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/70 disabled:opacity-50 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Offline Brain</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Operates 100% offline on your device with zero mobile data required.
            </p>
          </div>
        </div>

        {/* 2. ACTIVATION CODE & SUBSCRIPTION STATUS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#121c32]/80 via-[#0e1628]/90 to-[#080d1a] border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-cyan-400" /> License &amp; Activation Code
            </div>
            {isPremium ? (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 fill-emerald-300" /> Unlimited Premium
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 font-bold border border-amber-500/30">
                Free Tier: {queriesUsedToday}/{dailyLimit} Used ({remainingQueries} Left)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isPremium
              ? isZim
                ? 'Your device is fully activated with unlimited offline access to all subjects, exam questions, and ChiShona tutoring.'
                : isBw
                ? 'Your device is fully activated with unlimited offline access to BEC PSLE, JCE, BGCSE, Setswana, and Botswana exam papers.'
                : isZa
                ? 'Your device is fully activated with unlimited offline access to DBE CAPS (GET, Senior Phase, FET & NSC Matric), isiZulu, Afrikaans, and SA exam papers.'
                : `Your device is activated with unlimited offline ZEXA AI tutoring for ${country}.`
              : 'Enter your school activation code or scratch card key below to unlock unlimited offline queries.'}
          </p>

          <form onSubmit={handleApplyActivationCode} className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setActivationFeedback(null);
                }}
                placeholder="Enter Activation Code (e.g. ZEXA-PREMIUM)"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/[0.08] focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder-slate-500 font-mono tracking-wider transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl btn-primary-gradient text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 shrink-0"
              >
                Activate Code
              </button>
            </div>

            {activationFeedback && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${
                  activationFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border border-red-500/40 text-red-300'
                }`}
              >
                {activationFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{activationFeedback.message}</span>
              </div>
            )}
          </form>

          {/* Automated Daily Reset Indicator */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Unactivated accounts get 2 free queries that reset automatically every midnight (00:00).
            </span>
          </div>
        </div>

        {/* 3. ACCOUNT COUNTRY & CURRICULUM LEVEL SWITCHER */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Globe className="w-4 h-4" /> Account Country &amp; Curriculum
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
              {countryConfig.flag} {country}
            </span>
          </div>

          {onCountryChange && (
            <div className="space-y-1.5">
              <select
                value={country}
                onChange={(e) => onCountryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-xs font-medium"
              >
                {WORLD_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                {isZim
                  ? 'Zimbabwe Heritage, ChiShona, Social Science, and ZIMSEC curriculum data are enabled for this account.'
                  : isBw
                  ? 'Botswana National Encyclopedia, Setswana, Development Studies, and BEC (PSLE, JCE, BGCSE) data are enabled for this account.'
                  : isZa
                  ? 'South Africa National Encyclopedia, isiZulu/Afrikaans, Physical & Life Sciences, EMS, and DBE CAPS / NSC Matric data are enabled for this account.'
                  : `${countryConfig.flag} Account country: ${country}.`}
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" /> Curriculum Level
              </div>
              <p className="text-sm font-semibold text-white">
                {activeTier.label}
              </p>
              <p className="text-xs text-slate-400">
                Active focus: <span className="text-cyan-300">{activeTier.shortLabel}</span> · {activeTier.boardTag}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenLevelSelect}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-all shrink-0"
            >
              Change Level
            </button>
          </div>
        </div>

        {/* 4. LANGUAGE SELECTOR (Zimbabwe accounts include bilingual ChiShona) */}
        {isZim && (
          <div className="p-4 rounded-2xl glass-panel space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Languages className="w-4 h-4" /> Language Preference
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  preferredLang === 'en'
                    ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 shadow'
                    : 'bg-slate-900/60 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                English (Primary)
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('sn')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  preferredLang === 'sn'
                    ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 shadow'
                    : 'bg-slate-900/60 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                ChiShona (Bilingual)
              </button>
            </div>
          </div>
        )}

        {/* 5. DAILY STUDY REMINDERS */}
        <div className="p-4 rounded-2xl glass-panel space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Bell className="w-4 h-4" /> Daily Study Reminders
            </div>
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-all flex items-center gap-1"
              >
                <span>Manage Alerts</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-300">
            ZEXA AI sends revision prompts directly to your device daily at <strong className="text-white">6:00 AM</strong>, <strong className="text-white">12:00 PM</strong>, and <strong className="text-white">6:00 PM</strong> {isZim ? 'Harare Time (CAT)' : isBw ? 'Gaborone Time (CAT)' : isZa ? 'Johannesburg Time (SAST)' : 'Local Time'}.
          </p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-cyan-300">
              🌅 06:00 {isZim || isBw ? 'CAT' : isZa ? 'SAST' : ''}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-cyan-300">
              ☀️ 12:00 {isZim || isBw ? 'CAT' : isZa ? 'SAST' : ''}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-cyan-300">
              🌙 18:00 {isZim || isBw ? 'CAT' : isZa ? 'SAST' : ''}
            </span>
          </div>
        </div>

        {/* 6. ACADEMIC CALENDAR */}
        <div className="p-4 rounded-2xl glass-panel space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4" /> Academic Calendar Status
          </div>
          <p className="text-sm font-semibold text-white">{currentPeriod.name}</p>
          <p className="text-xs text-slate-400">
            Dates: {currentPeriod.startDate} to {currentPeriod.endDate}{' '}
            {daysLeft >= 0 ? `(${daysLeft} days remaining in term)` : '(Holiday Break)'}
          </p>
        </div>

        {/* 6. CONVERSATION MANAGEMENT */}
        <div className="p-4 rounded-2xl glass-panel space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <Trash2 className="w-4 h-4" /> Conversation Management
          </div>

          {!clearConfirming ? (
            <button
              type="button"
              onClick={() => setClearConfirming(true)}
              className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-red-950/30 border border-white/[0.08] hover:border-red-500/30 text-slate-300 text-xs font-semibold flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2 text-red-300">
                <Trash2 className="w-4 h-4 text-red-400" /> Clear Chat History
              </span>
              <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                Clear
              </span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Confirm clearing all conversation messages?</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClearConfirming(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
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

        {/* 7. ACCOUNT LOGOUT SECTION */}
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-300">Account Session</p>
              <p className="text-[11px] text-slate-400">
                Logging out resets your session. Signing in again creates a new session on the Free tier with 2 free queries.
              </p>
            </div>
            {!logoutConfirming ? (
              <button
                type="button"
                onClick={() => setLogoutConfirming(true)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setLogoutConfirming(false)}
                  className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 8. FOOTER (NO LOGO ON BELOW SECTION) */}
        <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-400">
            {isZim
              ? 'ZEXA AI Zimbabwe · First Zimbabwe OFFLINE AI Engine'
              : `ZEXA AI · ${country}`}
          </p>
          <p className="text-[10px] text-slate-500">
            {isZim
              ? 'Empowering Zimbabwean students with offline curriculum revision and bilingual tutoring.'
              : `Empowering students in ${country} with 100% offline AI tutoring.`}
          </p>
        </div>

      </div>
    </div>
  );
};

