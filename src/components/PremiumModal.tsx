import React, { useState } from 'react';
import { X, Crown, Key, Phone, CheckCircle2, AlertCircle, Copy, Check, Calendar } from 'lucide-react';
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
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentPeriod = TermCalendarManager.getCurrentPeriod();
  const isHoliday = currentPeriod.id.startsWith('holiday');
  const price = LEVEL_PRICES[educationLevel] || 5.0;
  const todayExpectedCode = OfflineActivationManager.generateDailyCode();

  const handleValidateCode = () => {
    setCodeError(null);
    if (!activationCode.trim()) {
      setCodeError('Please enter an activation code');
      return;
    }

    if (OfflineActivationManager.validateCode(activationCode)) {
      activateSubscription('Offline Activation Code verified');
    } else {
      setCodeError('Invalid or expired Action Code. Please verify with your school or agent.');
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

    alert(`🎉 Premium Active!\n\n${message}.\nYou now have unlimited ZEXA AI queries and full offline exam bank access for ${currentPeriod.name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-cyan-900/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative glow-cyan-sm max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
            <Crown className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-white">
              Activate ZEXA Premium
            </h3>
            <p className="text-xs text-slate-400">
              Unlimited offline AI tutoring for <span className="text-cyan-300 font-bold">{educationLevel}</span>
            </p>
          </div>
        </div>

        {/* Term Calendar Status Badge */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#0e1628] border border-cyan-500/30 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{currentPeriod.name}</span>
              {isHoliday && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  Holiday Mode
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-0.5">
              Valid until: <strong className="text-slate-200">{currentPeriod.endDate}</strong> • Price: <strong className="text-cyan-300">${price.toFixed(0)} USD</strong> / term
            </p>
          </div>
        </div>

        {/* Tabs: Activation Code vs EcoCash */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-cyan-500 text-slate-950 glow-cyan-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Offline Activation Code
          </button>
          <button
            onClick={() => setActiveTab('ecocash')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ecocash'
                ? 'bg-cyan-500 text-slate-950 glow-cyan-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> EcoCash USSD
          </button>
        </div>

        {/* Tab 1: Offline Activation Code */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Enter Daily Action / Activation Code:
              </label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setCodeError(null);
                }}
                placeholder="e.g. 272026031001161996"
                className="w-full bg-[#0d1424] border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 rounded-xl px-4 py-3 text-sm font-mono placeholder:text-slate-600 outline-none"
              />
              {codeError && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {codeError}
                </p>
              )}
            </div>

            <button
              onClick={handleValidateCode}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-md glow-cyan-sm active:scale-98 transition-all"
            >
              Activate Premium Now
            </button>

            {/* Offline Code Helper for Testing & School Agents */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Today&apos;s Generated Code (Offline Test):</span>
                <button
                  onClick={() => {
                    setActivationCode(todayExpectedCode);
                    navigator.clipboard.writeText(todayExpectedCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono font-bold"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Filled & Copied' : 'Auto-Fill Today\'s Code'}
                </button>
              </div>
              <p className="font-mono text-cyan-400/90 text-xs tracking-wider break-all">
                {todayExpectedCode}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: EcoCash USSD Instructions */}
        {activeTab === 'ecocash' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-400" /> Complete Payment via EcoCash
              </h4>
              <p className="leading-relaxed">
                1. Dial <span className="font-mono text-cyan-300 font-bold">*151*2*2#</span> on your Econet phone.
                <br />
                2. Merchant Code: <strong className="font-mono text-white">304918</strong> (ZEXA Education)
                <br />
                3. Amount: <strong className="text-cyan-300 font-bold">${price.toFixed(0)} USD</strong>
                <br />
                4. Reference: <strong className="font-mono text-amber-300 font-bold">ZEXA-{Date.now().toString().slice(-6)}</strong>
              </p>
            </div>

            <button
              onClick={handleSimulateEcoCash}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
