import React from 'react';
import { X, Check, BookOpen, GraduationCap, School } from 'lucide-react';
import { EducationLevel } from '../types';
import { LEVEL_PRICES } from '../lib/storage';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: EducationLevel;
  contentLevel?: string;
  onSelectLevel: (level: EducationLevel) => void;
  onOpenUpgrade: (level: EducationLevel, price: number) => void;
  isPremium: boolean;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  contentLevel,
  onSelectLevel,
  onOpenUpgrade,
  isPremium
}) => {
  if (!isOpen) return null;

  const handlePickLevel = (level: EducationLevel) => {
    if (level === currentLevel) {
      onClose();
      return;
    }

    if (!isPremium && level !== 'Primary Education' && currentLevel === 'Primary Education') {
      const price = LEVEL_PRICES[level] || 5.0;
      onOpenUpgrade(level, price);
      return;
    }

    onSelectLevel(level);
    onClose();
  };

  const isPrimaryActive = currentLevel === 'Primary Education' || contentLevel === 'Primary';
  const isOLevelActive =
    currentLevel === 'O-Level (Form 1 to 4)' ||
    currentLevel === 'Secondary: O-Level (Forms 1 - 4)' ||
    (!currentLevel.includes('A-Level') && (currentLevel === 'Secondary Education' || contentLevel === 'O-Level'));
  const isALevelActive =
    currentLevel === 'A-Level (Form 5 to 6)' ||
    currentLevel === 'Secondary: A-Level (Forms 5 - 6)' ||
    contentLevel === 'A-Level';
  const isTertiaryActive = currentLevel === 'Tertiary Education' || contentLevel === 'Tertiary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-elevated rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-4">
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
            <h3 className="text-base sm:text-lg font-bold text-white">Select Education Level</h3>
            <p className="text-xs text-slate-400">
              Tailors syllabus knowledge and exam banks to your curriculum tier
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Primary Education Card */}
          <div
            onClick={() => handlePickLevel('Primary Education')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isPrimaryActive
                ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'glass-panel hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">
                      Primary Education
                    </h4>
                    {isPrimaryActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">
                    Grade 1 to Grade 7 (Heritage-Based Curriculum)
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Official 6-Subject Format: English, Mathematics, Agric, Science &amp; Tech, Shona, Social Science, Physical Edu &amp; Arts.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/[0.08] text-slate-300 shrink-0">
                $4/term
              </span>
            </div>
          </div>

          {/* Secondary Education Section (O-Level & A-Level Choice) */}
          <div className="p-4 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                  Secondary Education
                </span>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">
                Forms 1 to 6
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* O-Level Option */}
              <div
                onClick={() => handlePickLevel('O-Level (Form 1 to 4)')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isOLevelActive
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-white/[0.08] hover:border-cyan-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      FORMS 1 – 4
                    </span>
                    {isOLevelActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-white mt-1">
                    O-Level (Form 1 to 4)
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Combined Science, Mathematics, Commerce, Accounts, Geography, History, English, Shona.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ZIMSEC O-Level</span>
                  <span className="text-cyan-400 font-mono font-bold">$5/term</span>
                </div>
              </div>

              {/* A-Level Option */}
              <div
                onClick={() => handlePickLevel('A-Level (Form 5 to 6)')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isALevelActive
                    ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.15)]'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-white/[0.08] hover:border-purple-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/30">
                      FORMS 5 – 6
                    </span>
                    {isALevelActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-purple-300">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-white mt-1">
                    A-Level (Form 5 to 6)
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Pure Mathematics, Biology, History 9155, Geography, Economics, Physics, Accounting.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ZIMSEC Advanced Level</span>
                  <span className="text-purple-400 font-mono font-bold">$5/term</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tertiary Education Card */}
          <div
            onClick={() => handlePickLevel('Tertiary Education')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isTertiaryActive
                ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'glass-panel hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">
                      Tertiary &amp; Higher Education
                    </h4>
                    {isTertiaryActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">
                    Colleges, Polytechnics &amp; Universities
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Higher education research dissertations, polytechnic subjects, engineering, economics, and advanced coursework.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/[0.08] text-slate-300 shrink-0">
                $5/term
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center pt-1">
          Selecting your exact level ensures syllabus notes, exam questions, and AI explanations match your curriculum.
        </p>
      </div>
    </div>
  );
};

