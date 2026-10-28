import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  RotateCcw,
  Trophy,
  Filter
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
    // Auto-reveal explanation on choice
    setRevealedQuestions((prev) => ({
      ...prev,
      [currentQIndex]: true
    }));
  };

  const handleFinishExam = () => {
    if (!activePaper) return;
    setExamFinished(true);

    // Calculate score
    let correctCount = 0;
    activePaper.questions.forEach((q, idx) => {
      if (userAnswers[idx] && userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / activePaper.questions.length) * 100);
    if (percent >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
    }
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
    if (percent >= 75) grade = 'A';
    else if (percent >= 65) grade = 'B';
    else if (percent >= 50) grade = 'C';
    else if (percent >= 45) grade = 'D';

    return { correct, total, percent, grade };
  };

  const filteredPapers = papers.filter((p) => {
    if (selectedSubject === 'All') return true;
    return p.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            ZIMSEC Past Exam Paper Bank
          </h2>
          {contentLevel === 'Primary' && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              Official 6-Subject Results Format
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Real questions, official specimen papers, and revision tests for{' '}
          <span className="text-cyan-300 font-semibold">
            {contentLevel === 'O-Level'
              ? 'O-Level (Forms 1 – 4)'
              : contentLevel === 'A-Level'
              ? 'A-Level (Forms 5 – 6)'
              : contentLevel === 'Primary'
              ? 'Primary (Official 6-Subject ZIMSEC Curriculum)'
              : contentLevel}
          </span>
        </p>
      </div>

      {activePaper ? (
        /* Active Paper Exam View */
        <div className="space-y-4">
          {/* Top Paper Bar */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePaper(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Back to Papers List"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold mr-2">
                  {activePaper.paperCode}
                </span>
                <span className="text-xs text-slate-400">{activePaper.subject}</span>
                <h3 className="font-bold text-sm md:text-base text-white">
                  {activePaper.paperName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                Q {currentQIndex + 1} of {activePaper.questions.length}
              </span>
              {!examFinished ? (
                <button
                  onClick={handleFinishExam}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake
                </button>
              )}
            </div>
          </div>

          {/* Exam Finished Score Banner */}
          {examFinished && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#121c33] to-[#1a2948] border-2 border-cyan-400/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center glow-cyan-sm">
                  <Trophy className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    Exam Completed! ZIMSEC Grade: <span className="text-cyan-400 text-xl">{calculateScore().grade}</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    You scored <strong className="text-white">{calculateScore().correct}</strong> out of{' '}
                    <strong className="text-white">{calculateScore().total}</strong> ({calculateScore().percent}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePaper(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  Choose Another Paper
                </button>
              </div>
            </div>
          )}

          {/* Question Card */}
          {activePaper.questions.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Question Number & Ask Zexa Button */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Question {activePaper.questions[currentQIndex].questionNumber}
                </span>

                <button
                  onClick={() => {
                    const q = activePaper.questions[currentQIndex];
                    const prompt = `Help me solve this ZIMSEC ${activePaper.subject} question:\n\n${q.questionText}\n\nOptions:\n${q.options
                      .map((o) => `${o.letter}) ${o.text}`)
                      .join('\n')}`;
                    const hint = q.explanation
                      ? `Correct Answer: ${q.correctAnswer}\nExplanation: ${q.explanation}`
                      : undefined;
                    onAskZexaQuestion(prompt, hint);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all active:scale-95 glow-cyan-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Ask ZEXA to explain
                </button>
              </div>

              {/* Question Text */}
              <div className="text-sm md:text-base font-semibold text-white leading-relaxed whitespace-pre-wrap">
                {activePaper.questions[currentQIndex].questionText}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {activePaper.questions[currentQIndex].options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQIndex] === option.letter;
                  const isCorrect = activePaper.questions[currentQIndex].correctAnswer === option.letter;
                  const isRevealed = revealedQuestions[currentQIndex] || examFinished;

                  let optionStyle =
                    'bg-[#0e1628] hover:bg-slate-800/80 border-slate-800 text-slate-200';

                  if (isSelected && !isRevealed) {
                    optionStyle = 'bg-cyan-950/50 border-cyan-500 text-cyan-200';
                  } else if (isRevealed) {
                    if (isCorrect) {
                      optionStyle =
                        'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-red-950/50 border-red-500/80 text-red-200';
                    }
                  }

                  return (
                    <button
                      key={`${option.letter}_${optIdx}`}
                      onClick={() => handleSelectOption(option.letter)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${optionStyle}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {option.letter}
                      </span>
                      <span className="text-xs md:text-sm mt-0.5 flex-1">
                        {option.text}
                      </span>

                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isRevealed && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation section */}
              {(revealedQuestions[currentQIndex] || examFinished) && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <HelpCircle className="w-4 h-4" />
                    <span>ZIMSEC Official Guide / Marking Notes:</span>
                  </div>
                  <p className="leading-relaxed">
                    {activePaper.questions[currentQIndex].explanation ||
                      (activePaper.questions[currentQIndex].correctAnswer
                        ? `The correct option is (${activePaper.questions[currentQIndex].correctAnswer}).`
                        : 'Review this question with your teacher or ask ZEXA AI for a step-by-step breakdown.')}
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                {/* Question dots / mini map */}
                <div className="hidden sm:flex items-center gap-1 max-w-xs overflow-x-auto py-1">
                  {activePaper.questions.slice(0, 20).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-all ${
                        currentQIndex === idx
                          ? 'bg-cyan-400 text-slate-950 font-extrabold'
                          : userAnswers[idx]
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  {activePaper.questions.length > 20 && (
                    <span className="text-[10px] text-slate-500 px-1">...</span>
                  )}
                </div>

                <button
                  disabled={currentQIndex >= activePaper.questions.length - 1}
                  onClick={() =>
                    setCurrentQIndex((prev) =>
                      Math.min(activePaper.questions.length - 1, prev + 1)
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
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
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === subj
                    ? 'bg-cyan-500 text-slate-950 font-bold glow-cyan-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-cyan-400 animate-pulse text-sm">
              Loading ZIMSEC examination papers...
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
              No examination papers found for {selectedSubject} in {contentLevel}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPapers.map((paper, idx) => (
                <div
                  key={`${paper.id}_${idx}`}
                  onClick={() => handleSelectPaper(paper)}
                  className="group p-4 rounded-xl bg-[#111827] hover:bg-[#162033] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                        {paper.paperCode}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {paper.questionCount} Questions
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                      {paper.paperName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {paper.subject} • {paper.paperType}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {paper.level}
                    </span>
                    <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
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
