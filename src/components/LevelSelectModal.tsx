import React from 'react';
import { X, Check, BookOpen, GraduationCap, School } from 'lucide-react';
import { EducationLevel } from '../types';
import { findCountryConfig } from '../data/worldCountries';
import { getCountryEducationSystem } from '../data/countryEducationLevels';
import { LEVEL_PRICES, StorageManager } from '../lib/storage';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: EducationLevel;
  contentLevel?: string;
  country?: string;
  onSelectLevel: (level: EducationLevel) => void;
  onOpenUpgrade: (level: EducationLevel, price: number) => void;
  isPremium: boolean;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  contentLevel,
  country = 'Zimbabwe',
  onSelectLevel,
  onOpenUpgrade,
  isPremium
}) => {
  if (!isOpen) return null;
  const isZim = StorageManager.isZimbabweAccount(country);
  const hasPack = StorageManager.hasCountryCurriculumPack(country);
  const countryConfig = findCountryConfig(country);
  const eduSystem = getCountryEducationSystem(country);

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

  const primaryTier = eduSystem.tiers.Primary;
  const lowerSecTier = eduSystem.tiers['O-Level'];
  const upperSecTier = eduSystem.tiers['A-Level'];
  const tertiaryTier = eduSystem.tiers.Tertiary;

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
            <h3 className="text-base sm:text-lg font-bold text-white">
              Select {country} Education Level
            </h3>
            <p className="text-xs text-slate-400">
              {hasPack
                ? `Tailors ${isZim ? 'ZIMSEC' : countryConfig.curriculum} syllabus knowledge and exam banks to your tier`
                : `Adjusts ZEXA AI explanation depth for ${country} (${eduSystem.curriculumName})`}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Primary Tier Card */}
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
                      {primaryTier.label}
                    </h4>
                    {isPrimaryActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">
                    {primaryTier.sublabel}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {primaryTier.subjects}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/[0.08] text-slate-300 shrink-0">
                {primaryTier.priceLabel}
              </span>
            </div>
          </div>

          {/* Secondary Tiers Section */}
          <div className="p-4 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                  {eduSystem.secondaryGroupTitle}
                </span>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">
                {eduSystem.secondaryGroupRange}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Lower Secondary / Middle Option */}
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
                      {lowerSecTier.badge}
                    </span>
                    {isOLevelActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-white mt-1">
                    {lowerSecTier.label}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lowerSecTier.subjects}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {lowerSecTier.boardTag}
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">{lowerSecTier.priceLabel}</span>
                </div>
              </div>

              {/* Upper Secondary / Matric / Matura Option */}
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
                      {upperSecTier.badge}
                    </span>
                    {isALevelActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-purple-300">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-white mt-1">
                    {upperSecTier.label}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {upperSecTier.subjects}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {upperSecTier.boardTag}
                  </span>
                  <span className="text-purple-400 font-mono font-bold">{upperSecTier.priceLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tertiary Tier Card */}
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
                      {tertiaryTier.label}
                    </h4>
                    {isTertiaryActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">
                    {tertiaryTier.sublabel}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {tertiaryTier.subjects}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/[0.08] text-slate-300 shrink-0">
                {tertiaryTier.priceLabel}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center pt-1">
          Selecting your exact level ensures syllabus notes, exam questions, and AI explanations match {country}&apos;s education system.
        </p>
      </div>
    </div>
  );
};

