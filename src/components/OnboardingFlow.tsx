import React, { useState } from 'react';
import { Sparkles, Brain, Download, CheckCircle2, ChevronRight, Lock, Mail, ArrowRight, ShieldCheck, BookOpen, Layers, Cpu } from 'lucide-react';
import { EducationLevel } from '../types';
import { StorageManager } from '../lib/storage';

interface OnboardingFlowProps {
  onComplete: (level: EducationLevel, email?: string) => void;
}

type OnboardingStep = 'login' | 'education-category' | 'ai-brain';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('login');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Education level state
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>('O-Level (Form 1 to 4)');
  const [secondarySubLevel, setSecondarySubLevel] = useState<'olevel' | 'alevel'>('olevel');

  // AI Brain state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStage, setDownloadStage] = useState('Standby');
  const [isBrainReady, setIsBrainReady] = useState(false);

  // Step 1 handlers
  const handleOnlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password to sign in online.');
      return;
    }
    if (password.length < 6) {
      setLoginError('Password should be at least 6 characters.');
      return;
    }
    setLoginError(null);
    StorageManager.initNewSession(email);
    setCurrentStep('education-category');
  };

  const handleStartOffline = () => {
    StorageManager.initNewSession('Offline Student');
    setCurrentStep('education-category');
  };

  // Step 2 handlers
  const handleSelectCategory = (category: 'primary' | 'secondary' | 'tertiary') => {
    if (category === 'primary') {
      setSelectedLevel('Primary Education');
      StorageManager.setEducationLevel('Primary Education');
      setCurrentStep('ai-brain');
    } else if (category === 'tertiary') {
      setSelectedLevel('Tertiary Education');
      StorageManager.setEducationLevel('Tertiary Education');
      setCurrentStep('ai-brain');
    } else {
      const levelToSet: EducationLevel = secondarySubLevel === 'alevel' ? 'A-Level (Form 5 to 6)' : 'O-Level (Form 1 to 4)';
      setSelectedLevel(levelToSet);
      StorageManager.setEducationLevel(levelToSet);
      setCurrentStep('ai-brain');
    }
  };

  const handleConfirmSecondary = (sub: 'olevel' | 'alevel') => {
    setSecondarySubLevel(sub);
    const levelToSet: EducationLevel = sub === 'alevel' ? 'A-Level (Form 5 to 6)' : 'O-Level (Form 1 to 4)';
    setSelectedLevel(levelToSet);
    StorageManager.setEducationLevel(levelToSet);
    setCurrentStep('ai-brain');
  };

  // Step 3 handlers: AI Brain download/load
  const handleLoadBrain = () => {
    if (isDownloading || isBrainReady) return;
    setIsDownloading(true);
    setDownloadProgress(12);
    setDownloadStage('Verifying local ZEXA 3.8-27B neural weights...');

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev < 38) {
          setDownloadStage('Allocating offline neural cache & 32K context...');
          return prev + 16;
        } else if (prev < 72) {
          setDownloadStage('Mounting ZIMSEC syllabus knowledge pack (1,250+ topics)...');
          return prev + 18;
        } else if (prev < 95) {
          setDownloadStage('Activating bilingual ChiShona & English tutor engine...');
          return prev + 14;
        } else {
          clearInterval(interval);
          setDownloadStage('ZEXA AI Brain Loaded & Ready (100% Offline Mode Active)!');
          setIsDownloading(false);
          setIsBrainReady(true);
          StorageManager.setBrainInitialized(true);
          return 100;
        }
      });
    }, 260);
  };

  const handleStartChat = () => {
    onComplete(selectedLevel, email || 'Offline Student');
  };

  return (
    <div className="min-h-screen bg-[#080d1a] bg-mesh text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[540px] h-[540px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main container */}
      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* App Logo Header - Pure HD Brain Logo Only, No Box Corners */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img
              src="/assets/zexa_brain_logo.png"
              alt="ZEXA AI Brain Logo"
              className="w-24 h-22 sm:w-28 sm:h-26 object-contain animate-brain-glow"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ZEXA <span className="text-cyan-400">AI</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                First Zimbabwe OFFLINE AI Engine
              </span>
              <span>·</span>
              <span className="font-mono text-slate-400">ZEXA 2.5/3.8</span>
            </div>
          </div>
        </div>

        {/* STEP 1: LOGIN & OFFLINE ENTRY */}
        {currentStep === 'login' && (
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Welcome to ZEXA AI</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Study 100% offline with zero data or sign in with your student account.
              </p>
            </div>

            {/* Offline Button (Primary Option) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0e1729] to-blue-950/30 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-cyan-400" /> 100% Offline Study Mode
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/20">
                  0 MB DATA REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full ZIMSEC Grade 7, O-Level, and A-Level syllabus notes, past exam papers, and bilingual tutoring running directly on your device.
              </p>
              <button
                type="button"
                onClick={handleStartOffline}
                className="w-full py-3.5 px-5 rounded-xl btn-primary-gradient text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                <span>Start Study Offline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#0e1628] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                Or Online Student Account
              </span>
              <div className="border-t border-white/[0.08] w-full" />
            </div>

            {/* Online Login Form */}
            <form onSubmit={handleOnlineLogin} className="space-y-3.5">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" /> Student Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.co.zw"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] focus:border-cyan-400 focus:outline-none text-white text-xs placeholder:text-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] focus:border-cyan-400 focus:outline-none text-white text-xs placeholder:text-slate-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.08] hover:border-cyan-500/40 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>{isRegisterMode ? 'Create Online Account' : 'Sign In Online'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {isRegisterMode ? 'Already have an account? Sign In' : 'New student? Register Online'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: EDUCATION SELECTION CATEGORY */}
        {currentStep === 'education-category' && (
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Window of Education Category</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Select your education level to configure the ZIMSEC syllabus topics and AI context.
              </p>
            </div>

            <div className="space-y-3">
              {/* Primary Education Card */}
              <button
                type="button"
                onClick={() => handleSelectCategory('primary')}
                className="w-full p-4 rounded-2xl glass-panel glass-card-hover text-left group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      Primary Education (Grade 1 - 7)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Official 6-subject ZIMSEC curriculum: English, Mathematics, Agric Science &amp; Tech, Shona, Social Science, Physical Edu &amp; Arts.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
              </button>

              {/* Secondary Education Card (with O-Level & A-Level Choice) */}
              <div className="p-4 rounded-2xl glass-panel space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Layers className="w-4 h-4 text-cyan-400" /> Secondary Education (Forms 1 to 6)
                </div>
                <p className="text-xs text-slate-400">
                  Select your exact academic tier for tailored syllabus notes and past exam papers:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirmSecondary('olevel')}
                    className="p-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400/60 text-left transition-all active:scale-[0.98] group"
                  >
                    <div className="font-bold text-xs text-cyan-300 group-hover:text-white flex items-center justify-between">
                      <span>O-Level (Forms 1 - 4)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Combined Science, Maths, Commerce, Geography, History, Accounts, etc.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmSecondary('alevel')}
                    className="p-3 rounded-xl bg-purple-950/30 hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-400/60 text-left transition-all active:scale-[0.98] group"
                  >
                    <div className="font-bold text-xs text-purple-300 group-hover:text-white flex items-center justify-between">
                      <span>A-Level (Forms 5 - 6)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pure Maths, Biology, History 9155, Geography, Economics, Physics, etc.
                    </p>
                  </button>
                </div>
              </div>

              {/* Tertiary Education Card */}
              <button
                type="button"
                onClick={() => handleSelectCategory('tertiary')}
                className="w-full p-4 rounded-2xl glass-panel glass-card-hover text-left group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      Tertiary &amp; Higher Education
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Universities, Polytechnics, Teachers Colleges &amp; advanced research modules.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE YOUR AI BRAIN */}
        {currentStep === 'ai-brain' && (
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Choose Your AI Brain</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Initialize the local offline ZEXA Neural Brain for {selectedLevel}.
              </p>
            </div>

            {/* Model Card */}
            <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/zexa_brain_logo.png"
                    alt="ZEXA AI Brain Logo"
                    className="w-10 h-9 object-contain animate-brain-glow shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">ZEXA 3.8-27B Offline Brain</h3>
                    <p className="text-xs text-slate-400">Zimbabwe Curriculum Edition (GGUF)</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30">
                  Pre-Installed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/[0.05]">
                <div>• Architecture: ZEXA 2.5/3.8</div>
                <div>• Inference: 100% Offline</div>
                <div>• Languages: English &amp; ChiShona</div>
                <div>• Context: 32K tokens</div>
              </div>

              {/* Download / Progress Bar */}
              {isDownloading && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-cyan-400">{downloadStage}</span>
                    <span className="text-white font-mono">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/[0.08]">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ready Badge */}
              {isBrainReady && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ZEXA AI Brain loaded and ready in offline memory!</span>
                </div>
              )}

              {/* Action Button */}
              {!isBrainReady ? (
                <button
                  type="button"
                  onClick={handleLoadBrain}
                  disabled={isDownloading}
                  className="w-full py-3.5 px-4 rounded-xl btn-primary-gradient disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Initializing AI Brain...' : 'Download & Load ZEXA AI Brain'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] animate-pulse"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Start ZEXA Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

