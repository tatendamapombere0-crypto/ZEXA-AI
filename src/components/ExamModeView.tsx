import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  RotateCcw,
  Trophy,
  Filter,
  Check,
  Zap,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamManifestItem, ExamPaper, ExamQuestion } from '../types';
import { ExamStore } from '../lib/examStore';

interface ExamModeViewProps {
  contentLevel: string;
  onAskZexaQuestion: (prompt: string, hint?: string) => void;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({
  contentLevel,
  onAskZexaQuestion
}) => {
  const [papers, setPapers] = useState<ExamManifestItem[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activePaperItem, setActivePaperItem] = useState<ExamManifestItem | null>(null);
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(null);
  const [loading, setLoading] = useState(true);

  // Exam session state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  const [examFinished, setExamFinished] = useState(false);

  useEffect(() => {
    async function loadPapers() {
      setLoading(true);
      setSelectedSubject('All');
      setActivePaper(null);
      const subList = await ExamStore.getSubjects(contentLevel);
      setSubjects(['All', ...subList]);

      const paperList = await ExamStore.getPapers(contentLevel);
      setPapers(paperList);
      setLoading(false);
    }
    loadPapers();
  }, [contentLevel]);

  const handleSelectPaper = async (item: ExamManifestItem) => {
    setLoading(true);
    setActivePaperItem(item);
    const paper = await ExamStore.loadPaperDetails(item);
    setActivePaper(paper);
    setCurrentQIndex(0);
    setUserAnswers({});
    setRevealedQuestions({});
    setExamFinished(false);
    setLoading(false);
  };

  const handleSelectOption = (letter: string) => {
    if (examFinished) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQIndex]: letter
    }));
    setRevealedQuestions((prev) => ({
      ...prev,
      [currentQIndex]: true
    }));
  };

  const calculateScore = () => {
    if (!activePaper) return { correct: 0, total: 0, percent: 0, grade: 'U' };
    let correct = 0;
    activePaper.questions.forEach((q, idx) => {
      if (userAnswers[idx] && userAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const total = activePaper.questions.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    let grade = 'U';
    if (percent >= 75) grade = 'A (Distinction)';
    else if (percent >= 65) grade = 'B (Merit)';
    else if (percent >= 50) grade = 'C (Credit - Pass)';
    else if (percent >= 40) grade = 'D (Pass)';
    else grade = 'E / U (Supplementary)';

    return { correct, total, percent, grade };
  };

  const handleFinishExam = () => {
    if (!activePaper) return;
    setExamFinished(true);

    const score = calculateScore();
    if (score.percent >= 50) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    }
  };

  const filteredPapers = papers.filter((p) => {
    if (selectedSubject === 'All') return true;
    return p.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 animate-fadeIn">
      
      {/* Top Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Official Examination Cockpit · {contentLevel}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ZIMSEC Past Papers &amp; Timed Mocks
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real past examination papers with instant marking, answer guides, and AI coaching.
          </p>
        </div>
      </div>

      {activePaper ? (
        /* Active Paper Exam View */
        <div className="space-y-4">
          
          {/* Top Paper Header Bar */}
          <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePaper(null)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all"
                title="Back to Papers List"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-0.5">
                  <span className="text-cyan-400 font-bold">{activePaper.paperCode}</span>
                  <span>·</span>
                  <span>{activePaper.subject}</span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {activePaper.paperName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.08]">
                Question {currentQIndex + 1} / {activePaper.questions.length}
              </span>

              {!examFinished ? (
                <button
                  onClick={handleFinishExam}
                  className="px-3.5 py-1.5 rounded-xl btn-primary-gradient text-xs font-bold shadow-md active:scale-95"
                >
                  Submit Paper
                </button>
              ) : (
                <button
                  onClick={() => {
                    setExamFinished(false);
                    setUserAnswers({});
                    setCurrentQIndex(0);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake
                </button>
              )}
            </div>
          </div>

          {/* Exam Finished Score Banner */}
          {examFinished && (
            <div className="glass-panel-elevated p-6 rounded-3xl border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center glow-cyan-sm shrink-0">
                  <Trophy className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">
                    Paper Completed! Result: <span className="text-cyan-400">{calculateScore().grade}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    Score: <strong className="text-white font-mono">{calculateScore().correct}</strong> / {calculateScore().total} ({calculateScore().percent}%)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePaper(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/[0.1]"
              >
                Choose Another Paper
              </button>
            </div>
          )}

          {/* Question Card */}
          {activePaper.questions.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              
              {/* Question Header & Ask ZEXA */}
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  QUESTION {activePaper.questions[currentQIndex].questionNumber || currentQIndex + 1}
                </span>

                <button
                  onClick={() => {
                    const q = activePaper.questions[currentQIndex];
                    const prompt = `Help me solve this ZIMSEC ${activePaper.subject} examination question:\n\n${q.questionText}\n\nOptions:\n${q.options
                      .map((o) => `${o.letter}) ${o.text}`)
                      .join('\n')}`;
                    const hint = q.explanation
                      ? `Correct Answer: ${q.correctAnswer}\nExplanation: ${q.explanation}`
                      : undefined;
                    onAskZexaQuestion(prompt, hint);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all active:scale-95 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask ZEXA To Explain</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-wrap">
                {activePaper.questions[currentQIndex].questionText}
              </div>

              {/* Multiple Choice Options Grid */}
              <div className="space-y-2.5">
                {activePaper.questions[currentQIndex].options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQIndex] === option.letter;
                  const isCorrect = activePaper.questions[currentQIndex].correctAnswer === option.letter;
                  const isRevealed = revealedQuestions[currentQIndex] || examFinished;

                  let optionStyle = 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] text-slate-200';

                  if (isSelected && !isRevealed) {
                    optionStyle = 'bg-cyan-500/15 border-cyan-400/80 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
                  } else if (isRevealed) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-100';
                    }
                  }

                  return (
                    <button
                      key={`${option.letter}_${optIdx}`}
                      onClick={() => handleSelectOption(option.letter)}
                      className={`w-full text-left p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-150 ${optionStyle}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-white/[0.06] text-slate-300'
                        }`}
                      >
                        {option.letter}
                      </span>
                      <span className="text-sm mt-0.5 flex-1 leading-relaxed">
                        {option.text}
                      </span>

                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isRevealed && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Marking Scheme Reveal */}
              {(revealedQuestions[currentQIndex] || examFinished) && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300 font-mono text-[11px] uppercase">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>ZIMSEC Marking Scheme &amp; Solution Notes:</span>
                  </div>
                  <p className="leading-relaxed text-slate-200">
                    {activePaper.questions[currentQIndex].explanation ||
                      (activePaper.questions[currentQIndex].correctAnswer
                        ? `The correct option is (${activePaper.questions[currentQIndex].correctAnswer}).`
                        : 'Review this question with your notes or ask ZEXA AI for a step-by-step breakdown.')}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                {/* Question Mini-Map */}
                <div className="hidden sm:flex items-center gap-1 max-w-sm overflow-x-auto py-1 scrollbar-none">
                  {activePaper.questions.slice(0, 18).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-6.5 h-6.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        currentQIndex === idx
                          ? 'bg-cyan-400 text-slate-950 shadow-sm'
                          : userAnswers[idx]
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  {activePaper.questions.length > 18 && (
                    <span className="text-[10px] text-slate-500 px-1 font-mono">...</span>
                  )}
                </div>

                <button
                  disabled={currentQIndex >= activePaper.questions.length - 1}
                  onClick={() =>
                    setCurrentQIndex((prev) =>
                      Math.min(activePaper.questions.length - 1, prev + 1)
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold transition-all"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}
        </div>
      ) : (
        /* Paper Selector List */
        <div className="space-y-4">
          
          {/* Subject Filter Bar */}
          <div className="p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-sm">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedSubject === subj
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-cyan-400 font-mono text-xs animate-pulse">
              LOADING EXAMINATION ARCHIVES...
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel text-slate-400 text-sm">
              No examination papers found for {selectedSubject} in {contentLevel}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPapers.map((paper, idx) => (
                <div
                  key={`${paper.id}_${idx}`}
                  onClick={() => handleSelectPaper(paper)}
                  className="glass-panel glass-card-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wide">
                        {paper.paperCode}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {paper.questionCount} Questions
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base group-hover:text-cyan-200 transition-colors line-clamp-1 mb-1">
                      {paper.paperName}
                    </h4>

                    <p className="text-xs text-slate-400 font-sans">
                      {paper.subject} · {paper.paperType}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      {paper.level}
                    </span>
                    <span className="text-cyan-400 group-hover:text-cyan-300 font-bold flex items-center gap-1">
                      Start Test <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
