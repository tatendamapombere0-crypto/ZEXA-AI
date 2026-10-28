import React from 'react';
import { X, Layers, Check, BookOpen, GraduationCap, School } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 glow-cyan-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Select Education Level</h3>
            <p className="text-xs text-slate-400">
              Choose your exact academic tier for tailored syllabus notes and past exam papers
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Primary Education Card */}
          <div
            onClick={() => handlePickLevel('Primary Education')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isPrimaryActive
                ? 'bg-cyan-950/40 border-cyan-400/80 glow-cyan-sm shadow-md'
                : 'bg-[#0d1424] hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm md:text-base">
                      Primary Education
                    </h4>
                    {isPrimaryActive && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-900/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">
                    Grade 1 to Grade 7 (Heritage-Based Curriculum)
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Official 6-Subject Format: English, Mathematics, Agric, Science &amp; Tech, Shona, Social Science, Physical Edu &amp; Arts.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 shrink-0">
                $4/term
              </span>
            </div>
          </div>

          {/* Secondary Education Section (O-Level & A-Level Choice) */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-cyan-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                  Secondary Education — Choose Your Level:
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                Form 1 to Form 6
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* O-Level Option */}
              <div
                onClick={() => handlePickLevel('O-Level (Form 1 to 4)')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isOLevelActive
                    ? 'bg-cyan-950/60 border-cyan-400 glow-cyan-sm shadow-md'
                    : 'bg-[#111827] hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
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
                    Combined Science, Mathematics, Commerce, Accounts, Geography, History, English Language, and O-Level past paper banks.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ZIMSEC O-Level</span>
                  <span className="text-cyan-400 font-mono font-bold">$5/term</span>
                </div>
              </div>

              {/* A-Level Option */}
              <div
                onClick={() => handlePickLevel('A-Level (Form 5 to 6)')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isALevelActive
                    ? 'bg-cyan-950/60 border-cyan-400 glow-cyan-sm shadow-md'
                    : 'bg-[#111827] hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                      FORMS 5 – 6
                    </span>
                    {isALevelActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-white mt-1">
                    A-Level (Form 5 to 6)
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Pure Mathematics, Statistics, Accounting, Business Studies, Economics, Biology, Chemistry, Physics, Literature, and Divinity.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ZIMSEC Advanced Level</span>
                  <span className="text-cyan-400 font-mono font-bold">$5/term</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tertiary Education Card */}
          <div
            onClick={() => handlePickLevel('Tertiary Education')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isTertiaryActive
                ? 'bg-cyan-950/40 border-cyan-400/80 glow-cyan-sm shadow-md'
                : 'bg-[#0d1424] hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm md:text-base">
                      Tertiary &amp; Higher Education
                    </h4>
                    {isTertiaryActive && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-900/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">
                    Colleges, Polytechnics &amp; Universities
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Higher education research dissertations, polytechnic subjects, engineering, economics, jurisprudence, and advanced coursework.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 shrink-0">
                $5/term
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-5">
          Selecting your exact level ensures syllabus notes, exam questions, and AI explanations match your syllabus.
        </p>
      </div>
    </div>
  );
};
