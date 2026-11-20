import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  History,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  Bookmark,
  Search
} from 'lucide-react';
import { StorageManager } from '../lib/storage';
import { getExamBoardProfile } from '../data/africanExamBoards';
import { getTierForContentLevel } from '../data/countryEducationLevels';
import type {
  SavedSearchQA,
  SavedExamQA,
  BookmarkedExamQuestion
} from '../types';
import { MarkdownArticle } from './MarkdownArticle';
import { formatMathNotation } from '../lib/mathFormatter';

interface RevisionHubViewProps {
  country: string;
  contentLevel: string;
  onAskZexa: (question: string) => void;
  onDataUpdated?: () => void;
}

type HubSection = 'search' | 'exam-qa';

export const RevisionHubView: React.FC<RevisionHubViewProps> = ({
  country,
  contentLevel,
  onAskZexa,
  onDataUpdated
}) => {
  const board = getExamBoardProfile(country, contentLevel);
  const activeTier = getTierForContentLevel(country, contentLevel);
  const hasPack = StorageManager.hasCountryCurriculumPack(country);

  const [section, setSection] = useState<HubSection>('search');

  // Persistent archives (never cleared automatically — manual clear only)
  const [searchHistory, setSearchHistory] = useState<SavedSearchQA[]>(() =>
    StorageManager.getSearchHistory(country)
  );
  const [examQA, setExamQA] = useState<SavedExamQA[]>(() =>
    StorageManager.getExamQAArchive(country)
  );
  const [bookmarks, setBookmarks] = useState<BookmarkedExamQuestion[]>(() =>
    StorageManager.getBookmarkedQuestions(country)
  );

  // Search Q&A state
  const [searchQueryFilter, setSearchQueryFilter] = useState('');
  const [expandedSearchId, setExpandedSearchId] = useState<string | null>(null);
  const [confirmClearSearch, setConfirmClearSearch] = useState(false);

  // Exam Q&A state
  const [examSearchFilter, setExamSearchFilter] = useState('');
  const [examOutcomeFilter, setExamOutcomeFilter] = useState<'all' | 'incorrect' | 'correct' | 'theory' | 'bookmarked'>('all');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [confirmClearExamQA, setConfirmClearExamQA] = useState(false);

  const reloadAll = () => {
    setSearchHistory(StorageManager.getSearchHistory(country));
    setExamQA(StorageManager.getExamQAArchive(country));
    setBookmarks(StorageManager.getBookmarkedQuestions(country));
    if (onDataUpdated) onDataUpdated();
  };

  useEffect(() => {
    reloadAll();
    setConfirmClearSearch(false);
    setConfirmClearExamQA(false);
  }, [country]);

  const filteredSearchHistory = searchHistory.filter((item) => {
    if (!searchQueryFilter.trim()) return true;
    const q = searchQueryFilter.toLowerCase();
    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q)
    );
  });

  const filteredExamQA = examQA.filter((item) => {
    if (examOutcomeFilter === 'incorrect' && item.isCorrect !== false) return false;
    if (examOutcomeFilter === 'correct' && item.isCorrect !== true) return false;
    if (examOutcomeFilter === 'theory' && item.options && item.options.length > 0) return false;
    if (!examSearchFilter.trim()) return true;
    const q = examSearchFilter.toLowerCase();
    return (
      item.questionText.toLowerCase().includes(q) ||
      item.explanation.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.paperCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-4 pt-3 pb-24 animate-fadeIn space-y-3">
      {/* Compact Header & Section Switcher so saved Q&As start right near the top */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Revision
            </h2>
            <span className="text-xs text-slate-400 truncate">
              · {country} · {board.boardShort} · {activeTier.shortLabel}
            </span>
          </div>
        </div>

        {/* Sub-tab Segmented Bar */}
        <div className="grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/[0.08] w-full sm:w-auto shrink-0">
          <button
            onClick={() => setSection('search')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 sm:px-3.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              section === 'search'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span className="tabular-nums">Searched Q&amp;As ({searchHistory.length})</span>
          </button>

          <button
            onClick={() => setSection('exam-qa')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 sm:px-3.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              section === 'exam-qa'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="tabular-nums">Exam Q&amp;As ({examQA.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PAST SEARCHED QUESTIONS & ANSWERS */}
      {section === 'search' && (
        <div className="space-y-3" data-testid="revision-search-section">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQueryFilter}
                onChange={(e) => setSearchQueryFilter(e.target.value)}
                placeholder="Search saved questions & answers..."
                className="w-full glass-panel border border-white/[0.08] focus:border-cyan-400/80 text-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm placeholder:text-slate-500 outline-none"
              />
            </div>

            {searchHistory.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                {!confirmClearSearch ? (
                  <button
                    onClick={() => setConfirmClearSearch(true)}
                    className="flex items-center justify-center gap-1.5 px-3 min-h-[36px] rounded-xl bg-white/[0.04] hover:bg-rose-950/60 border border-white/[0.08] hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-200 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        StorageManager.clearSearchHistory(country);
                        setConfirmClearSearch(false);
                        setExpandedSearchId(null);
                        reloadAll();
                      }}
                      className="px-3 min-h-[36px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      Clear All ({searchHistory.length})
                    </button>
                    <button
                      onClick={() => setConfirmClearSearch(false)}
                      className="px-2.5 min-h-[36px] rounded-xl bg-white/[0.06] text-slate-300 hover:text-white text-xs font-semibold whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {filteredSearchHistory.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-2.5 border border-white/[0.06]">
              <History className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {searchHistory.length === 0 ? 'No past searched questions stored yet' : 'No matching search history'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                {searchHistory.length === 0
                  ? `Every question you ask ZEXA AI in Chat is automatically stored here with its full answer until you clear it manually.`
                  : 'Try another keyword or clear your filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSearchHistory.map((item, idx) => {
                const isExpanded = expandedSearchId === item.id || (expandedSearchId === null && idx === 0 && filteredSearchHistory.length <= 3);
                return (
                  <div
                    key={item.id}
                    data-testid={idx === 0 ? 'first-searched-qa' : undefined}
                    className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-cyan-400 mb-1">
                          <span>{item.subject}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                          {formatMathNotation(item.question)}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setExpandedSearchId(isExpanded ? '__none__' : item.id)}
                          className="px-3 min-h-[34px] rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200"
                        >
                          {isExpanded ? 'Hide Answer' : 'View Answer'}
                        </button>
                        <button
                          onClick={() => onAskZexa(item.question)}
                          className="px-3 min-h-[34px] rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask Again</span>
                        </button>
                        <button
                          onClick={() => {
                            StorageManager.deleteSearchQA(item.id);
                            reloadAll();
                          }}
                          className="min-w-[34px] min-h-[34px] rounded-xl bg-white/[0.04] hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 flex items-center justify-center"
                          title="Delete this question & answer"
                          aria-label={`Delete ${item.question}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="pt-3 border-t border-white/[0.08]">
                        <MarkdownArticle content={item.answer} />
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {formatMathNotation(item.answer.replace(/^#+\s*/gm, '').replace(/\*\*/g, ''))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: EXAM MODE QUESTIONS & ANSWERS */}
      {section === 'exam-qa' && (
        <div className="space-y-3">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={examSearchFilter}
                onChange={(e) => setExamSearchFilter(e.target.value)}
                placeholder="Search solved exam questions or codes..."
                className="w-full glass-panel border border-white/[0.08] focus:border-cyan-400/80 text-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm placeholder:text-slate-500 outline-none"
              />
            </div>

            {examQA.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                {!confirmClearExamQA ? (
                  <button
                    onClick={() => setConfirmClearExamQA(true)}
                    className="flex items-center gap-1.5 px-3 min-h-[36px] rounded-xl bg-white/[0.04] hover:bg-rose-950/60 border border-white/[0.08] hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-200 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        StorageManager.clearExamQAArchive(country);
                        setConfirmClearExamQA(false);
                        setExpandedExamId(null);
                        reloadAll();
                      }}
                      className="px-3 min-h-[36px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      Clear All ({examQA.length})
                    </button>
                    <button
                      onClick={() => setConfirmClearExamQA(false)}
                      className="px-2.5 min-h-[36px] rounded-xl bg-white/[0.06] text-slate-300 hover:text-white text-xs font-semibold whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Outcome Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: `All Solved (${examQA.length})` },
                { id: 'incorrect', label: `Needs Review (${examQA.filter((q) => q.isCorrect === false).length})` },
                { id: 'correct', label: `Correct (${examQA.filter((q) => q.isCorrect === true).length})` },
                { id: 'theory', label: `Paper 2 Theory (${examQA.filter((q) => !q.options || q.options.length === 0).length})` },
                { id: 'bookmarked', label: `Bookmarked (${bookmarks.length})` }
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setExamOutcomeFilter(f.id)}
                className={`px-3 min-h-[36px] rounded-xl text-xs font-semibold transition-all tabular-nums ${
                  examOutcomeFilter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {examOutcomeFilter === 'bookmarked' ? (
            bookmarks.length === 0 ? (
              <div className="glass-panel rounded-3xl p-8 text-center space-y-2 border border-white/[0.06]">
                <Bookmark className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs sm:text-sm text-slate-400">
                  Bookmark any question in Exam Mode to highlight it right here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="glass-panel rounded-2xl p-4 border border-white/[0.08] flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                        <span>{bm.paperCode} · Q{bm.questionNumber}</span>
                        <span className="text-slate-400">{bm.subject}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                        {formatMathNotation(bm.questionText)}
                      </p>
                      {bm.explanation && (
                        <p className="text-xs text-slate-400 line-clamp-3 pt-1">
                          {formatMathNotation(bm.explanation)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() =>
                          onAskZexa(
                            `Explain how to answer this question:\n\n${bm.questionText}${
                              bm.explanation ? `\n\nMarking Reference:\n${bm.explanation}` : ''
                            }`
                          )
                        }
                        className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Practice with ZEXA AI</span>
                      </button>
                      <button
                        onClick={() => {
                          StorageManager.toggleBookmarkQuestion(bm);
                          reloadAll();
                        }}
                        className="text-xs text-slate-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredExamQA.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-2.5 border border-white/[0.06]">
              <GraduationCap className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {examQA.length === 0 ? 'No Exam Mode questions answered yet' : 'No matching Exam Q&As'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                {hasPack
                  ? 'Every question you answer or reveal in Exam Mode is automatically saved here with its answer and marking scheme until you clear it manually.'
                  : `Switch to a curriculum-loaded region or practice exam-style questions in Chat using Exam Points mode.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExamQA.map((item, idx) => {
                const isExpanded = expandedExamId === item.id || (expandedExamId === null && idx === 0 && filteredExamQA.length <= 3);
                return (
                  <div
                    key={item.id}
                    className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                          <span className="text-cyan-400 font-bold">
                            {item.paperCode} · Q{item.questionNumber}
                          </span>
                          <span className="text-slate-400">{item.subject}</span>
                          {item.isCorrect === true && (
                            <span className="text-emerald-300 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Your Answer: {item.userAnswer} (Correct)</span>
                            </span>
                          )}
                          {item.isCorrect === false && (
                            <span className="text-rose-300 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Your Answer: {item.userAnswer} · Correct: {item.correctAnswer}</span>
                            </span>
                          )}
                          {item.isCorrect === undefined && (
                            <span className="text-purple-300 font-semibold">
                              Theory · {item.correctAnswer || 'Model Marking Scheme'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                          {formatMathNotation(item.questionText)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setExpandedExamId(isExpanded ? '__none__' : item.id)}
                          className="px-3 min-h-[34px] rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200"
                        >
                          {isExpanded ? 'Hide Answer' : 'View Answer & Scheme'}
                        </button>
                        <button
                          onClick={() =>
                            onAskZexa(
                              `Explain this ${item.subject} exam question (${item.paperCode} Q${item.questionNumber}):\n\n${item.questionText}${
                                item.explanation ? `\n\nOfficial Reference:\n${item.explanation}` : ''
                              }`
                            )
                          }
                          className="px-3 min-h-[34px] rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Tutor Me</span>
                        </button>
                        <button
                          onClick={() => {
                            StorageManager.deleteExamQA(item.id);
                            reloadAll();
                          }}
                          className="min-w-[34px] min-h-[34px] rounded-xl bg-white/[0.04] hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 flex items-center justify-center"
                          title="Delete saved exam question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-white/[0.08] space-y-3">
                        {item.options && item.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.options.map((opt) => {
                              const isCorrectOpt = item.correctAnswer === opt.letter;
                              const isUserOpt = item.userAnswer === opt.letter;
                              return (
                                <div
                                  key={opt.letter}
                                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                                    isCorrectOpt
                                      ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100'
                                      : isUserOpt
                                      ? 'bg-rose-950/50 border-rose-500/60 text-rose-100'
                                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300'
                                  }`}
                                >
                                  <span className="font-mono font-bold shrink-0">{opt.letter})</span>
                                  <span className="flex-1">{formatMathNotation(opt.text)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(!item.options || item.options.length === 0) && item.userAnswer && (
                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300">
                            <strong className="text-cyan-300">Your Draft Note:</strong> {item.userAnswer}
                          </div>
                        )}

                        {item.explanation && (
                          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/20">
                            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase mb-2">
                              Official Answer &amp; Marking Scheme
                            </div>
                            <MarkdownArticle content={item.explanation} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
