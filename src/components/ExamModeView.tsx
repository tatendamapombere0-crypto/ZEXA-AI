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
  Copy,
  PenTool,
  Sparkles,
  BookOpen,
  FileText,
  Lightbulb,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamManifestItem, ExamPaper, ExamQuestion } from '../types';
import { ExamStore } from '../lib/examStore';

interface ExamModeViewProps {
  contentLevel: string;
  onAskZexaQuestion: (prompt: string, hint?: string) => void;
}

/**
 * Professional Markdown & Marking Scheme Renderer for Paper 2 Structured Theory
 * Formats headings, numbered steps, bullet points, and official mark badges [X marks].
 */
const Paper2AnswerRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  const renderInlineMarksAndBold = (str: string) => {
    // Detect mark allocations like [1 mark], [2 marks], [Total: 10 marks]
    const markRegex = /(\[(?:Total:?\s*)?\d+\s*marks?\])/gi;
    const parts = str.split(markRegex);

    return parts.map((part, pIdx) => {
      if (part.match(markRegex)) {
        return (
          <span
            key={`mk_${pIdx}`}
            className="inline-flex items-center gap-1 mx-1.5 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] font-bold shadow-sm"
          >
            <Award className="w-3 h-3 text-emerald-400" />
            <span>{part.replace(/[\[\]]/g, '')}</span>
          </span>
        );
      }

      // Handle bold **text**
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`b_${bIdx}`} className="font-bold text-white">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  };

  let inGuidanceCard = false;
  let guidanceLines: string[] = [];
  let guidanceTitle = '';

  const flushGuidanceCard = () => {
    if (inGuidanceCard) {
      elements.push(
        <div
          key={`guidance_${elements.length}`}
          className="my-3.5 rounded-xl p-4 sm:p-5 bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/35 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-[15px] mb-2 pb-2 border-b border-emerald-500/20">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{guidanceTitle || 'ZIMSEC Examiner Mark Scheme Guidance'}</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
            {guidanceLines.map((gl, gIdx) => (
              <div key={gIdx} className="flex items-start gap-2">
                {gl.startsWith('- ') || gl.startsWith('* ') ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <span className="flex-1">{renderInlineMarksAndBold(gl.slice(2))}</span>
                  </>
                ) : (
                  <p className="flex-1">{renderInlineMarksAndBold(gl)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
      inGuidanceCard = false;
      guidanceLines = [];
      guidanceTitle = '';
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushGuidanceCard();
      elements.push(<div key={`sp_${index}`} className="h-1.5" />);
      return;
    }

    // Check if line is examiner guidance section header
    const lowerLine = trimmed.toLowerCase();
    const isGuidanceHeader =
      lowerLine.includes('examiner mark scheme guidance') ||
      lowerLine.includes('mark scheme guidance') ||
      lowerLine.includes('marking scheme guidance') ||
      lowerLine.includes('key points expected in a full answer');

    if (isGuidanceHeader) {
      flushGuidanceCard();
      inGuidanceCard = true;
      guidanceTitle = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      return;
    }

    if (inGuidanceCard) {
      if (trimmed.startsWith('#')) {
        flushGuidanceCard();
      } else {
        guidanceLines.push(trimmed);
        return;
      }
    }

    // 1. Heading 3 or 4 (e.g. ### Section A: Comprehension, #### Step 1)
    if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      const headingText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <div
          key={`head_${index}`}
          className="font-bold text-white text-sm sm:text-base tracking-tight pt-3 pb-1.5 border-b border-cyan-500/20 flex items-center gap-2 mb-2"
        >
          <span className="w-1.5 h-4 bg-cyan-400 rounded-full shrink-0" />
          <span className="text-cyan-200">{headingText}</span>
        </div>
      );
      return;
    }

    // 2. Numbered steps (e.g. "1. State fundamental definition [2 marks]")
    const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (stepMatch) {
      const num = stepMatch[1];
      const content = stepMatch[2];
      elements.push(
        <div key={`step_${index}`} className="flex items-start gap-3 py-1.5">
          <span className="w-6 h-6 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            {num}
          </span>
          <div className="flex-1 text-[13.5px] sm:text-sm text-slate-200 leading-relaxed pt-0.5">
            {renderInlineMarksAndBold(content)}
          </div>
        </div>
      );
      return;
    }

    // 3. Bullet points (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2);
      elements.push(
        <div key={`bullet_${index}`} className="flex items-start gap-2.5 py-1 pl-1.5 text-[13.5px] sm:text-sm text-slate-200 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
          <div className="flex-1">{renderInlineMarksAndBold(content)}</div>
        </div>
      );
      return;
    }

    // 4. Formula or Equation line
    if (
      (trimmed.includes('→') ||
        trimmed.includes('±') ||
        trimmed.startsWith('Perimeter =') ||
        trimmed.startsWith('Area =') ||
        trimmed.startsWith('Total Cost =') ||
        trimmed.includes('m²') ||
        trimmed.includes('2H₂O') ||
        trimmed.startsWith('x =')) &&
      !trimmed.startsWith('Question')
    ) {
      elements.push(
        <div
          key={`eq_${index}`}
          className="p-3 my-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 font-mono text-cyan-300 text-xs sm:text-sm tracking-wide shadow-inner overflow-x-auto"
        >
          {trimmed.replace(/\*\*/g, '')}
        </div>
      );
      return;
    }

    // 5. Standard paragraph
    elements.push(
      <p key={`p_${index}`} className="my-1.5 text-[13.5px] sm:text-sm leading-relaxed text-slate-200">
        {renderInlineMarksAndBold(trimmed)}
      </p>
    );
  });

  flushGuidanceCard();

  return <div className="space-y-2.5 select-text">{elements}</div>;
};

export const ExamModeView: React.FC<ExamModeViewProps> = ({
  contentLevel,
  onAskZexaQuestion
}) => {
  const [papers, setPapers] = useState<ExamManifestItem[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activePaperItem, setActivePaperItem] = useState<ExamManifestItem | null>(() => {
    try {
      const saved = localStorage.getItem('zexa_active_paper_item');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(() => {
    try {
      const saved = localStorage.getItem('zexa_active_paper');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Exam session state with offline persistence
  const [currentQIndex, setCurrentQIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zexa_active_paper_qindex');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('zexa_active_paper_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('zexa_active_paper_revealed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [examFinished, setExamFinished] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Student Draft Workspace (Paper 2 scratchpad)
  const [draftWorkspace, setDraftWorkspace] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('zexa_paper2_drafts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  // Purge legacy v3 caches and refresh active paper if cached count mismatches verified manifest
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('zexa_exam_paper_v3_')) {
            localStorage.removeItem(k);
          }
        }
      }
    } catch {}

    if (activePaper && activePaperItem && activePaper.questions.length !== activePaperItem.questionCount) {
      ExamStore.loadPaperDetails(activePaperItem).then((refreshed) => {
        if (refreshed && refreshed.questions.length > 0) {
          setActivePaper(refreshed);
          setCurrentQIndex((prev) => Math.min(prev, Math.max(0, refreshed.questions.length - 1)));
          try {
            localStorage.setItem('zexa_active_paper', JSON.stringify(refreshed));
          } catch {}
        }
      });
    }
  }, [activePaper, activePaperItem]);

  // Sync session state to localStorage
  useEffect(() => {
    try {
      if (activePaper) {
        localStorage.setItem('zexa_active_paper', JSON.stringify(activePaper));
        localStorage.setItem('zexa_active_paper_qindex', String(currentQIndex));
        localStorage.setItem('zexa_active_paper_answers', JSON.stringify(userAnswers));
        localStorage.setItem('zexa_active_paper_revealed', JSON.stringify(revealedQuestions));
        localStorage.setItem('zexa_paper2_drafts', JSON.stringify(draftWorkspace));
      } else {
        localStorage.removeItem('zexa_active_paper');
        localStorage.removeItem('zexa_active_paper_item');
        localStorage.removeItem('zexa_active_paper_qindex');
        localStorage.removeItem('zexa_active_paper_answers');
        localStorage.removeItem('zexa_active_paper_revealed');
      }
    } catch {
      // Storage fallback
    }
  }, [activePaper, currentQIndex, userAnswers, revealedQuestions, draftWorkspace]);

  // Keyboard navigation shortcuts (ArrowRight for Next, ArrowLeft for Previous)
  useEffect(() => {
    if (!activePaper) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'n') {
        setCurrentQIndex((prev) => Math.min(activePaper.questions.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        setCurrentQIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePaper]);

  useEffect(() => {
    async function loadPapers() {
      setLoading(true);
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
    try {
      localStorage.setItem('zexa_active_paper_item', JSON.stringify(item));
    } catch {}
    const paper = await ExamStore.loadPaperDetails(item);
    setActivePaper(paper);
    setCurrentQIndex(0);
    setUserAnswers({});
    setRevealedQuestions({});
    setExamFinished(false);
    setLoading(false);
  };

  const handleExitPaper = () => {
    setActivePaper(null);
    setActivePaperItem(null);
    setCurrentQIndex(0);
    setUserAnswers({});
    setRevealedQuestions({});
    setExamFinished(false);
    try {
      localStorage.removeItem('zexa_active_paper');
      localStorage.removeItem('zexa_active_paper_item');
      localStorage.removeItem('zexa_active_paper_qindex');
      localStorage.removeItem('zexa_active_paper_answers');
      localStorage.removeItem('zexa_active_paper_revealed');
    } catch {}
  };

  /**
   * Requirement: Paper 1 stays on the question after answering so the user can
   * read the explanation and marking scheme without automatic switching.
   * User manually presses "Next Question" when ready.
   */
  const handleSelectOption = (letter: string) => {
    if (examFinished || !activePaper) return;
    const answeredIdx = currentQIndex;
    setUserAnswers((prev) => ({
      ...prev,
      [answeredIdx]: letter
    }));
    setRevealedQuestions((prev) => ({
      ...prev,
      [answeredIdx]: true
    }));
  };

  const handleNextQuestion = () => {
    if (!activePaper) return;
    setCurrentQIndex((prev) => Math.min(activePaper.questions.length - 1, prev + 1));
  };

  const handlePrevQuestion = () => {
    setCurrentQIndex((prev) => Math.max(0, prev - 1));
  };

  const handleCopyModelAnswer = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
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
      } catch {}
    }
  };

  const filteredPapers = papers.filter((p) => {
    if (selectedSubject === 'All') return true;
    return p.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  const isCurrentPaper1 = activePaper && activePaper.questions[currentQIndex]?.options && activePaper.questions[currentQIndex].options.length > 0;
  const currentDraft = draftWorkspace[currentQIndex] || '';
  const draftWords = currentDraft.trim() ? currentDraft.trim().split(/\s+/).length : 0;

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
          <div className="glass-panel rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExitPaper}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all active:scale-95"
                title="Back to Papers List"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-0.5">
                  <span className="text-cyan-400 font-bold">{activePaper.paperCode}</span>
                  <span>·</span>
                  <span>{activePaper.subject}</span>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                    ⚡ {activePaper.questions.length} Questions (100% Offline)
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                  {activePaper.paperName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Question Palette Trigger */}
              <button
                onClick={() => setIsPaletteOpen(true)}
                className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 transition-all active:scale-95"
                title="View All Questions"
              >
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Q {currentQIndex + 1} / {activePaper.questions.length}</span>
              </button>

              {!examFinished ? (
                <button
                  onClick={handleFinishExam}
                  className="px-3.5 py-1.5 rounded-xl btn-primary-gradient text-xs font-bold shadow-md active:scale-95"
                >
                  Submit
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

          {/* Question Palette Drawer Modal */}
          {isPaletteOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Question Selector Grid (1 to {activePaper.questions.length})</h4>
                    <p className="text-xs text-slate-400">Jump directly to any question</p>
                  </div>
                  <button
                    onClick={() => setIsPaletteOpen(false)}
                    className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-bold"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-300 mb-3 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-cyan-400"></span> Current
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-cyan-950 border border-cyan-500/40"></span> Answered
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-white/[0.06]"></span> Unanswered
                  </span>
                </div>

                <div className="overflow-y-auto flex-1 grid grid-cols-5 sm:grid-cols-8 gap-2 py-2 pr-1">
                  {activePaper.questions.map((_, idx) => (
                    <button
                      key={`pal_${idx}`}
                      onClick={() => {
                        setCurrentQIndex(idx);
                        setIsPaletteOpen(false);
                      }}
                      className={`h-9 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center ${
                        currentQIndex === idx
                          ? 'bg-cyan-400 text-slate-950 shadow-md ring-2 ring-cyan-300'
                          : userAnswers[idx] || revealedQuestions[idx]
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                          : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.1]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
                  <span>Answered: {Object.keys(userAnswers).length} / {activePaper.questions.length}</span>
                  <button
                    onClick={() => setIsPaletteOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

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
                onClick={handleExitPaper}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/[0.1]"
              >
                Choose Another Paper
              </button>
            </div>
          )}

          {/* Main Question Card */}
          {activePaper.questions.length > 0 && activePaper.questions[currentQIndex] && (
            <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
              {/* Question Header & Ask ZEXA */}
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                    QUESTION {activePaper.questions[currentQIndex].questionNumber || currentQIndex + 1}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    of {activePaper.questions.length}
                  </span>
                  {!isCurrentPaper1 && (
                    <span className="ml-1 text-[10px] font-mono bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                      Structured Theory (Paper 2)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const q = activePaper.questions[currentQIndex];
                      const prompt = isCurrentPaper1
                        ? `Help me solve this ZIMSEC ${activePaper.subject} examination question:\n\n${q.questionText}\n\nOptions:\n${(q.options || [])
                            .map((o) => `${o.letter}) ${o.text}`)
                            .join('\n')}`
                        : `Help me structure a full-mark model answer for this ZIMSEC ${activePaper.subject} Paper 2 structured question:\n\n${q.questionText}`;
                      const hint = q.explanation
                        ? `Official Marking Scheme Reference:\n${q.explanation}`
                        : undefined;
                      onAskZexaQuestion(prompt, hint);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all active:scale-95 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask ZEXA AI</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-wrap">
                {activePaper.questions[currentQIndex].questionText}
              </div>

              {/* Paper 1: Multiple Choice Options Grid */}
              {isCurrentPaper1 ? (
                <div className="space-y-2.5">
                  <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                    <span>Select your answer:</span>
                    <span className="text-[11px] text-cyan-400/80 font-mono">
                      Click to highlight &amp; read answer • Next on your own
                    </span>
                  </div>

                  {(activePaper.questions[currentQIndex].options || []).map((option, optIdx) => {
                    const isSelected = userAnswers[currentQIndex] === option.letter;
                    const isCorrect = activePaper.questions[currentQIndex].correctAnswer === option.letter;
                    const isRevealed = revealedQuestions[currentQIndex] || examFinished;

                    let optionStyle = 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] text-slate-200';

                    if (isSelected && !isRevealed) {
                      optionStyle = 'bg-cyan-500/15 border-cyan-400/80 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
                    } else if (isRevealed) {
                      if (isCorrect) {
                        optionStyle = 'bg-emerald-950/70 border-emerald-500/90 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.2)]';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-rose-950/70 border-rose-500/90 text-rose-100';
                      }
                    }

                    return (
                      <button
                        key={`${option.letter}_${optIdx}`}
                        onClick={() => handleSelectOption(option.letter)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-150 cursor-pointer active:scale-[0.99] ${optionStyle}`}
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
              ) : (
                /* Paper 2: Professional Structured Theory & Essay Cockpit */
                <div className="space-y-4 pt-1">
                  {/* Official Examination Cockpit Header */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-cyan-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wide">
                            Official Theory Paper 2
                          </span>
                          <span className="text-slate-400 text-xs">·</span>
                          <span className="text-emerald-400 font-mono text-xs font-semibold">
                            Full Marking Scheme Included
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          Structured Question &amp; Extended Essay Workspace
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Formulate your response below in your rough notes, then verify with the official ZIMSEC criteria.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setRevealedQuestions((prev) => ({
                          ...prev,
                          [currentQIndex]: !prev[currentQIndex]
                        }))
                      }
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-center ${
                        revealedQuestions[currentQIndex]
                          ? 'bg-purple-900/60 border-purple-400 text-purple-200'
                          : 'btn-primary-gradient text-white shadow-cyan-950/30'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{revealedQuestions[currentQIndex] ? 'Hide Solution Scheme' : 'Reveal Model Answer & Scheme'}</span>
                    </button>
                  </div>

                  {/* Student Answer Draft Workspace (Interactive Notepad) */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
                      >
                        <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                        <span>✍️ Student Answer Workspace (Working Scratchpad)</span>
                        {isWorkspaceOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>{draftWords} words</span>
                        {currentDraft && (
                          <button
                            onClick={() => {
                              setDraftWorkspace((prev) => ({ ...prev, [currentQIndex]: '' }));
                            }}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {isWorkspaceOpen && (
                      <textarea
                        value={currentDraft}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftWorkspace((prev) => ({ ...prev, [currentQIndex]: val }));
                        }}
                        rows={4}
                        placeholder="Draft your step-by-step working, formula outline, or paragraph answers here before checking the official criteria..."
                        className="w-full bg-slate-950/60 border border-white/[0.08] focus:border-cyan-500/50 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-y font-sans leading-relaxed transition-all"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Explanation & Marking Scheme Reveal */}
              {(revealedQuestions[currentQIndex] || examFinished) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-cyan-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5">
                    <div className="flex items-center gap-2 font-bold text-cyan-300 font-mono text-xs uppercase tracking-wide">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>🏛️ Official ZIMSEC Marking Scheme &amp; Solution Notes</span>
                    </div>

                    <button
                      onClick={() => handleCopyModelAnswer(activePaper.questions[currentQIndex].explanation)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-[11px] font-mono transition-colors"
                      title="Copy Model Answer"
                    >
                      {copiedAnswer ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Render using the rich structured Paper 2 / MCQ solution renderer */}
                  <div className="text-slate-200">
                    <Paper2AnswerRenderer text={activePaper.questions[currentQIndex].explanation} />
                  </div>

                  {/* Examiner Insight Note */}
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-slate-300">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-semibold">ZIMSEC Examiner Strategy:</strong>{' '}
                      Review every mark allocation breakdown. Full marks require precise academic terminology, step-by-step methods, and adherence to official syllabus key points.
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls: Manual Next on User's Own */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/[0.08] gap-3">
                <button
                  disabled={currentQIndex === 0}
                  onClick={handlePrevQuestion}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold transition-all active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous Question
                </button>

                {/* Question Mini-Map with Scroll */}
                <div className="flex items-center gap-1 max-w-[260px] sm:max-w-md overflow-x-auto py-1 scrollbar-none">
                  {activePaper.questions.map((_, idx) => (
                    <button
                      key={`strip_${idx}`}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`min-w-[28px] h-7 px-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 ${
                        currentQIndex === idx
                          ? 'bg-cyan-400 text-slate-950 shadow-sm ring-1 ring-cyan-300'
                          : userAnswers[idx] || revealedQuestions[idx]
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Manual Next Question Button */}
                <button
                  disabled={currentQIndex >= activePaper.questions.length - 1}
                  onClick={handleNextQuestion}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                    revealedQuestions[currentQIndex] || userAnswers[currentQIndex]
                      ? 'btn-primary-gradient text-white shadow-cyan-900/30 ring-1 ring-cyan-400/50'
                      : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1]'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
              LOADING VERIFIED EXAMINATION ARCHIVES...
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
                  className="glass-panel glass-card-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between group border border-white/[0.06] hover:border-cyan-500/40 transition-all shadow-md hover:shadow-cyan-950/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wide">
                        {paper.paperCode}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
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
