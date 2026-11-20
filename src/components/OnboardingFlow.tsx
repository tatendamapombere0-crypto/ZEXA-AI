import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Brain,
  Download,
  CheckCircle2,
  ChevronRight,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Layers,
  Cpu,
  Globe,
  AlertCircle,
  ArrowLeft,
  Search
} from 'lucide-react';
import { EducationLevel } from '../types';
import { WORLD_COUNTRIES, findCountryConfig } from '../data/worldCountries';
import { getCountryEducationSystem } from '../data/countryEducationLevels';
import { StorageManager, mapEducationToContentLevel } from '../lib/storage';
import { KnowledgeStore } from '../lib/knowledgeStore';
import { ZexaNeuralEngine } from '../lib/zexaNeuralEngine';

interface OnboardingFlowProps {
  onComplete: (level: EducationLevel, email?: string, country?: string) => void;
}

type OnboardingStep = 'login' | 'country-select' | 'education-category' | 'ai-brain';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('login');

  // Step 1: Entry / auth mode state
  const [authMode, setAuthMode] = useState<'offline' | 'online'>('offline');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Step 2: Whole-world country selection state (required after Start Offline or Online login)
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [countryError, setCountryError] = useState<string | null>(null);

  // Step 3: Education level state
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>('O-Level (Form 1 to 4)');
  const [secondarySubLevel, setSecondarySubLevel] = useState<'olevel' | 'alevel'>('olevel');

  // Step 4: AI Brain state (auto-loads on install/entry)
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStage, setDownloadStage] = useState('Initializing ZEXA AI...');
  const [isBrainReady, setIsBrainReady] = useState(false);
  const autoLoadTriggeredRef = useRef(false);

  const activeCountryConfig = selectedCountry ? findCountryConfig(selectedCountry) : null;
  const isZimbabweSelected = selectedCountry.trim().toLowerCase() === 'zimbabwe';
  const isBotswanaSelected = selectedCountry.trim().toLowerCase() === 'botswana';
  const hasPack = Boolean(activeCountryConfig?.hasCurriculumPack);
  const eduSystem = getCountryEducationSystem(selectedCountry || 'Zimbabwe');
  const activeTier = eduSystem.tiers[mapEducationToContentLevel(selectedLevel)];

  const filteredCountries = WORLD_COUNTRIES.filter((c) => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.region || '').toLowerCase().includes(q)
    );
  });

  // Step 1 handlers: Pressing Start Study Offline or Sign In Online advances to Choose Country
  const handleStartOffline = () => {
    setAuthMode('offline');
    setLoginError(null);
    setCountryError(null);
    setCountrySearch('');
    setSelectedCountry('');
    setCurrentStep('country-select');
  };

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
    setAuthMode('online');
    setCountryError(null);
    setCountrySearch('');
    const savedCountry = StorageManager.getSavedCountryForEmail(email);
    setSelectedCountry(savedCountry || '');
    setCurrentStep('country-select');
  };

  // Step 2 handler: Must pick a country from the world list before proceeding
  const handleConfirmCountry = () => {
    if (!selectedCountry || !activeCountryConfig) {
      setCountryError('Please select a country from the list to continue.');
      return;
    }
    setCountryError(null);
    const activeEmail = authMode === 'online' && email.trim() ? email.trim() : 'Offline Student';
    StorageManager.initNewSession(activeEmail, selectedCountry);
    setCurrentStep('education-category');
  };

  // Step 3 handlers
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
      const levelToSet: EducationLevel =
        secondarySubLevel === 'alevel' ? 'A-Level (Form 5 to 6)' : 'O-Level (Form 1 to 4)';
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

  // Step 4 handler: Curriculum (only if country pack exists) + automatic ZEXA AI asset initialization
  const handleLoadBrain = async () => {
    if (isDownloading || isBrainReady) return;
    setIsDownloading(true);
    setDownloadProgress(15);

    if (hasPack) {
      setDownloadStage(`Mounting ${selectedCountry} syllabus topics & verified exam questions...`);
      await KnowledgeStore.load();
    } else {
      setDownloadStage(`Preparing ZEXA AI workspace for ${selectedCountry}...`);
    }

    setDownloadProgress(35);
    setDownloadStage('Initializing ZEXA AI...');

    const neuralLoaded = await ZexaNeuralEngine.autoConnectLocalGGUF((state) => {
      if (state.status === 'loading') {
        setDownloadProgress(Math.max(40, state.progress));
        setDownloadStage(state.statusText);
      } else if (state.status === 'ready') {
        setDownloadProgress(100);
        setDownloadStage('ZEXA AI Connected!');
      }
    });

    if (!neuralLoaded) {
      setDownloadProgress(100);
      setDownloadStage('ZEXA AI Workspace Ready!');
    }

    setIsDownloading(false);
    setIsBrainReady(true);
    StorageManager.setBrainInitialized(true);
  };

  useEffect(() => {
    if (currentStep !== 'ai-brain') {
      autoLoadTriggeredRef.current = false;
      return;
    }

    const unsubscribe = ZexaNeuralEngine.subscribe((state) => {
      if (state.status === 'loading') {
        setDownloadProgress((prev) => Math.max(prev, Math.max(40, state.progress)));
        setDownloadStage(state.statusText);
      } else if (state.status === 'ready') {
        setDownloadProgress(100);
        setDownloadStage('ZEXA AI Connected!');
      }
    });

    if (!autoLoadTriggeredRef.current) {
      autoLoadTriggeredRef.current = true;
      void handleLoadBrain();
    }

    return unsubscribe;
  }, [currentStep]);

  const handleStartChat = () => {
    const activeEmail = authMode === 'online' && email.trim() ? email.trim() : 'Offline Student';
    onComplete(selectedLevel, activeEmail, selectedCountry);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] bg-mesh text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[540px] h-[540px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main container */}
      <div className="w-full max-w-lg z-10 space-y-6">
        {/* App Logo Header */}
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
                {!selectedCountry
                  ? '100% Offline AI Learning Engine'
                  : isZimbabweSelected
                  ? 'First Zimbabwe OFFLINE AI Engine'
                  : `Offline AI Learning Engine · ${selectedCountry}`}
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: WELCOME — START OFFLINE OR ONLINE LOGIN */}
        {currentStep === 'login' && (
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Welcome to ZEXA AI</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Start studying 100% offline or sign in with your student account, then choose your country from around the world.
              </p>
            </div>

            {/* Offline Button (Primary Option) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0e1729] to-blue-950/30 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-cyan-400" /> 100% Offline Study Mode
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/20">
                  0 MB DATA REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tap below to start studying offline and pick your country &amp; curriculum workspace on your device.
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
                  placeholder="student@school.edu"
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
                <ArrowRight className="w-3.5 h-3.5" />
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

        {/* STEP 2: WHOLE-WORLD COUNTRY SELECTION (Shown after Start Study Offline or Sign In) */}
        {currentStep === 'country-select' && (
          <div className="glass-panel-elevated p-5 sm:p-7 rounded-3xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep('login')}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                {WORLD_COUNTRIES.length} Countries
              </span>
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Choose Your Country</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Select Country from the World</h2>
              <p className="text-xs text-slate-400">
                Choose your country below to personalize your ZEXA AI study workspace.
              </p>
            </div>

            {/* Search bar across all world countries */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="onboarding-country-search"
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search any country (e.g. Zimbabwe, South Africa, Kenya, UK...)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0b1222] border border-cyan-500/35 focus:border-cyan-400 focus:outline-none text-white text-xs sm:text-sm placeholder:text-slate-500"
              />
            </div>

            {/* Scrollable full world countries list */}
            <div
              id="onboarding-country-list"
              role="listbox"
              aria-label="World countries list"
              className="max-h-64 overflow-y-auto space-y-1.5 pr-1"
            >
              {filteredCountries.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                  No countries matching &quot;{countrySearch}&quot;.
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = selectedCountry === c.name;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedCountry(c.name);
                        setCountryError(null);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                        isSelected
                          ? 'bg-cyan-950/75 border-cyan-400 text-white shadow shadow-cyan-500/15'
                          : 'bg-[#0b1222]/90 border-white/[0.07] hover:border-cyan-500/40 text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{c.flag}</span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {c.region} · {c.code}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {countryError && (
              <div
                role="alert"
                className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{countryError}</span>
              </div>
            )}

            {/* Selected country confirmation pill */}
            {activeCountryConfig && (
              <div className="p-3 rounded-xl border bg-cyan-950/35 border-cyan-500/30 text-xs text-slate-200 flex items-center justify-between gap-2">
                <span>
                  Selected country: <strong className="text-cyan-300">{activeCountryConfig.flag} {selectedCountry}</strong>
                </span>
                <span className="text-[11px] font-mono text-slate-400">{activeCountryConfig.region}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmCountry}
              className="w-full py-3.5 px-5 rounded-xl btn-primary-gradient text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
            >
              <span>
                {selectedCountry && activeCountryConfig
                  ? `Continue with ${activeCountryConfig.flag} ${selectedCountry}`
                  : 'Continue'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: EDUCATION SELECTION CATEGORY */}
        {currentStep === 'education-category' && (
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                  <span>{activeCountryConfig?.flag} {selectedCountry}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('country-select')}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change Country</span>
                </button>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {selectedCountry} Education Levels
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {isZimbabweSelected
                  ? 'Select your education level to configure the ZIMSEC syllabus topics and AI context.'
                  : isBotswanaSelected
                  ? 'Select your education level to configure the BEC Botswana syllabus topics (PSLE, JCE, BGCSE) and AI context.'
                  : `Select your ${selectedCountry} education level (${eduSystem.curriculumName}).`}
              </p>
            </div>

            <div className="space-y-3">
              {/* Primary Tier Card */}
              <button
                type="button"
                onClick={() => handleSelectCategory('primary')}
                className="w-full p-4 rounded-2xl glass-panel glass-card-hover text-left group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {eduSystem.tiers.Primary.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {eduSystem.tiers.Primary.subjects}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
              </button>

              {/* Secondary Tier Section */}
              <div className="p-4 rounded-2xl glass-panel space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Layers className="w-4 h-4 text-cyan-400" /> {eduSystem.secondaryGroupTitle}
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300">{eduSystem.secondaryGroupRange}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {eduSystem.secondaryGroupPrompt}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirmSecondary('olevel')}
                    className="p-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400/60 text-left transition-all active:scale-[0.98] group"
                  >
                    <div className="font-bold text-xs text-cyan-300 group-hover:text-white flex items-center justify-between gap-1">
                      <span>{eduSystem.tiers['O-Level'].label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {eduSystem.tiers['O-Level'].subjects}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmSecondary('alevel')}
                    className="p-3 rounded-xl bg-purple-950/30 hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-400/60 text-left transition-all active:scale-[0.98] group"
                  >
                    <div className="font-bold text-xs text-purple-300 group-hover:text-white flex items-center justify-between gap-1">
                      <span>{eduSystem.tiers['A-Level'].label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {eduSystem.tiers['A-Level'].subjects}
                    </p>
                  </button>
                </div>
              </div>

              {/* Tertiary Tier Card */}
              <button
                type="button"
                onClick={() => handleSelectCategory('tertiary')}
                className="w-full p-4 rounded-2xl glass-panel glass-card-hover text-left group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {eduSystem.tiers.Tertiary.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {eduSystem.tiers.Tertiary.sublabel}. {eduSystem.tiers.Tertiary.subjects}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: INITIALIZE AI BRAIN */}
        {currentStep === 'ai-brain' && (
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Initialize ZEXA AI</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Prepare ZEXA AI offline mode for {activeTier.label}.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/zexa_brain_logo.png"
                    alt="ZEXA AI"
                    className="w-10 h-9 object-contain animate-brain-glow shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">ZEXA AI</h3>
                    <p className="text-xs text-slate-400">
                      {isZimbabweSelected
                        ? 'Offline ZIMSEC Curriculum Tutor'
                        : isBotswanaSelected
                        ? 'Offline BEC Botswana Curriculum Tutor'
                        : `${selectedCountry} Study Tutor`}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30">
                  100% Offline
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/[0.05]">
                <div>• Engine: ZEXA AI</div>
                <div>• Runtime: 100% Offline Local</div>
                <div>• Country: {activeCountryConfig?.flag} {selectedCountry}</div>
                <div>• Level: {activeTier.shortLabel}</div>
              </div>

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

              {isBrainReady && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {ZexaNeuralEngine.isReady()
                      ? 'ZEXA AI neural engine is connected and ready offline!'
                      : 'ZEXA AI workspace is ready! You can ask study questions now or connect a local brain file anytime in Settings.'}
                  </span>
                </div>
              )}

              {!isBrainReady ? (
                <button
                  type="button"
                  onClick={handleLoadBrain}
                  disabled={isDownloading}
                  className="w-full py-3.5 px-4 rounded-xl btn-primary-gradient disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Initializing ZEXA AI...' : 'Initialize ZEXA AI'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] animate-pulse"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Start ZEXA AI</span>
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
