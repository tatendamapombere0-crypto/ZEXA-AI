import React from 'react';
import { X, Layers, Check, Sparkles } from 'lucide-react';
import { EducationLevel } from '../types';
import { LEVEL_PRICES } from '../lib/storage';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: EducationLevel;
  onSelectLevel: (level: EducationLevel) => void;
  onOpenUpgrade: (level: EducationLevel, price: number) => void;
  isPremium: boolean;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
  onOpenUpgrade,
  isPremium
}) => {
  if (!isOpen) return null;

  const levels: Array<{
    id: EducationLevel;
    title: string;
    subtitle: string;
    details: string;
    target: string;
  }> = [
    {
      id: 'Primary Education',
      title: 'Primary Education',
      subtitle: 'Grade 1 to Grade 7',
      details: 'ZIMSEC Grade 7 Exam Bank, Agriculture, Science & Technology, English, Chishona, Social Sciences.',
      target: 'Primary & Grade 7 Exam Revision'
    },
    {
      id: 'Secondary Education',
      title: 'Secondary Education',
      subtitle: 'Form 1 to Form 6 (O-Level & A-Level)',
      details: 'Full ZIMSEC O-Level & A-Level Syllabus, Past Exam Banks, Mathematics, Combined Science, Commercials, Sciences.',
      target: 'O-Level & A-Level Candidates'
    },
    {
      id: 'Tertiary Education',
      title: 'Tertiary Education',
      subtitle: 'Colleges & Universities',
      details: 'Advanced academic tutoring, polytechnic subjects, engineering, business, and higher research.',
      target: 'Higher Education & Research'
    }
  ];

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 glow-cyan-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Select Education Level</h3>
            <p className="text-xs text-slate-400">
              Customize your ZEXA AI syllabus and exam banks
            </p>
          </div>
        </div>

        {/* Level Cards */}
        <div className="space-y-3">
          {levels.map((lvl) => {
            const isSelected = currentLevel === lvl.id;
            const price = LEVEL_PRICES[lvl.id];

            return (
              <div
                key={lvl.id}
                onClick={() => handlePickLevel(lvl.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400/80 glow-cyan-sm shadow-md'
                    : 'bg-[#0d1424] hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-sm md:text-base">
                        {lvl.title}
                      </h4>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-900/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-300 font-medium mt-0.5">
                      {lvl.subtitle}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
                    ${price.toFixed(0)}/term
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {lvl.details}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-5">
          Level selection filters notes, exam papers, and AI explanations according to official ZIMSEC curricula.
        </p>
      </div>
    </div>
  );
};
