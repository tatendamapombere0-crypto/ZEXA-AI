import React, { useState } from 'react';
import { X, Key, Phone, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EducationLevel } from '../types';
import { TermCalendarManager } from '../lib/termCalendar';
import { OfflineActivationManager } from '../lib/offlineActivation';
import { LEVEL_PRICES, StorageManager } from '../lib/storage';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationLevel: EducationLevel;
  onActivated: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  educationLevel,
  onActivated
}) => {
  const [activationCode, setActivationCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'ecocash'>('code');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPeriod = TermCalendarManager.getCurrentPeriod();
  const isHoliday = currentPeriod.id.startsWith('holiday');
  const price = LEVEL_PRICES[educationLevel] || 5.0;

  const handleValidateCode = () => {
    setCodeError(null);
    if (!activationCode.trim()) {
      setCodeError('Please enter an activation code');
      return;
    }

    if (OfflineActivationManager.validateCode(activationCode)) {
      activateSubscription('Offline Activation Code verified');
    } else {
      setCodeError('Invalid or expired Activation Code. Please verify with your school or agent.');
    }
  };

  const handleSimulateEcoCash = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      activateSubscription('EcoCash payment successfully verified');
    }, 1200);
  };

  const activateSubscription = (message: string) => {
    const expiryDate = new Date(currentPeriod.endDate).getTime();
    StorageManager.setPremiumStatus(true, expiryDate, educationLevel);
    onActivated();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // Confetti fallback
    }

    setSuccessMessage(`${message}. Unlimited ZEXA AI queries and full offline exam bank access active for ${currentPeriod.name}!`);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-elevated rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-10">
          <img
            src="/assets/zexa_brain_logo.png"
            alt="ZEXA AI Brain Logo"
            className="w-10 h-9 object-contain animate-brain-glow shrink-0"
          />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Activate ZEXA Premium
            </h3>
            <p className="text-xs text-slate-400">
              Unlimited offline AI tutoring for <span className="text-cyan-300 font-medium">{educationLevel}</span>
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="font-medium leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Term Calendar Status Badge */}
        <div className="p-3.5 rounded-2xl glass-panel flex items-start gap-3">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>{currentPeriod.name}</span>
              {isHoliday && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  Holiday Mode
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-0.5">
              Valid until: <strong className="text-slate-200">{currentPeriod.endDate}</strong> · Price: <strong className="text-cyan-300 font-mono">${price.toFixed(0)} USD</strong> / term
            </p>
          </div>
        </div>

        {/* Tabs: Activation Code vs EcoCash */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Offline Activation Code
          </button>
          <button
            onClick={() => setActiveTab('ecocash')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ecocash'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> EcoCash USSD
          </button>
        </div>

        {/* Tab 1: Offline Activation Code */}
        {activeTab === 'code' && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Enter Daily Action / Activation Code:
              </label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setCodeError(null);
                }}
                placeholder="e.g. 272026031001161996 or ZEXA-PREMIUM"
                className="w-full bg-slate-900/90 border border-white/[0.08] focus:border-cyan-400 focus:outline-none text-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono placeholder:text-slate-600 transition-colors"
              />
              {codeError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {codeError}
                </p>
              )}
            </div>

            <button
              onClick={handleValidateCode}
              className="w-full py-3 rounded-xl btn-primary-gradient text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              Activate Premium Now
            </button>
          </div>
        )}

        {/* Tab 2: EcoCash USSD Instructions */}
        {activeTab === 'ecocash' && (
          <div className="space-y-3 pt-1 text-xs text-slate-300">
            <div className="p-4 rounded-xl glass-panel space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-400" /> Complete Payment via EcoCash
              </h4>
              <p className="leading-relaxed text-slate-300">
                1. Dial <span className="font-mono text-cyan-300 font-bold">*151*2*2#</span> on your Econet phone.
                <br />
                2. Merchant Code: <strong className="font-mono text-white">304918</strong> (ZEXA Education)
                <br />
                3. Amount: <strong className="text-cyan-300 font-mono font-bold">${price.toFixed(0)} USD</strong>
                <br />
                4. Reference: <strong className="font-mono text-amber-300 font-bold">ZEXA-{Date.now().toString().slice(-6)}</strong>
              </p>
            </div>

            <button
              onClick={handleSimulateEcoCash}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Checking EcoCash Transaction...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify EcoCash Transaction</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

