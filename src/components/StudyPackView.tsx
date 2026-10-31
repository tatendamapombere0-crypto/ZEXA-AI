import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  MessageSquare, 
  ArrowLeft, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  BookMarked
} from 'lucide-react';
import { KnowledgeChunk } from '../types';
import { KnowledgeStore } from '../lib/knowledgeStore';

interface StudyPackViewProps {
  contentLevel: string;
  onAskZexa: (question: string) => void;
}

export const StudyPackView: React.FC<StudyPackViewProps> = ({
  contentLevel,
  onAskZexa
}) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [topics, setTopics] = useState<KnowledgeChunk[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeChunk | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setSelectedTopic(null);
      const subList = await KnowledgeStore.getSubjects(contentLevel);
      setSubjects(subList);
      if (subList.length > 0) {
        setSelectedSubject(subList[0]);
      } else {
        setSelectedSubject(null);
      }
      setLoading(false);
    }
    init();
  }, [contentLevel]);

  useEffect(() => {
    async function loadSubjectTopics() {
      if (!selectedSubject) return;
      setLoading(true);
      const chunkList = await KnowledgeStore.getTopics(contentLevel, selectedSubject);
      setTopics(chunkList);
      setLoading(false);
    }
    loadSubjectTopics();
  }, [selectedSubject, contentLevel]);

  const filteredTopics = topics.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.topic.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 animate-fadeIn">
      
      {/* Top Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold mb-1">
            <BookMarked className="w-4 h-4" />
            <span>Curriculum Vault · {contentLevel}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ZIMSEC Syllabus &amp; Study Pack
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Offline structured syllabus modules, past marking standards, and revision concepts.
          </p>
        </div>

        {contentLevel === 'Primary' && (
          <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-semibold">
            Official 6-Subject Format
          </div>
        )}
      </div>

      {/* Selected Topic Reader View */}
      {selectedTopic ? (
        <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/[0.08] animate-fadeIn">
          {/* Breadcrumb Navigation */}
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {selectedSubject} syllabus topics</span>
          </button>

          {/* Header */}
          <div className="border-b border-white/[0.08] pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                <span className="text-cyan-400 font-semibold uppercase">{selectedTopic.subject}</span>
                <span>·</span>
                <span>{selectedTopic.source}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {selectedTopic.topic}
              </h3>
            </div>

            <button
              onClick={() => onAskZexa(`Can you tutor me on ${selectedTopic.topic} in ZIMSEC ${contentLevel}? Please provide clear exam points and definitions.`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary-gradient text-xs font-bold transition-all shrink-0 active:scale-95 shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask ZEXA About This</span>
            </button>
          </div>

          {/* Syllabus Content Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
            {selectedTopic.content}
          </div>

          {/* Keywords / Index Tags */}
          {selectedTopic.keywords.length > 0 && (
            <div className="mt-8 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-mono mr-1">Index Tags:</span>
              {selectedTopic.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono bg-white/[0.04] text-slate-300 px-2.5 py-0.5 rounded-lg border border-white/[0.06]"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Topic & Subject Browser */
        <div className="space-y-4">
          
          {/* Horizontal Subjects Segmented Bar */}
          <div className="p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex gap-1.5 overflow-x-auto scrollbar-none shadow-sm">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => {
                  setSelectedSubject(subj);
                  setSearchQuery('');
                }}
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

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search syllabus topics in ${selectedSubject || 'all subjects'}...`}
              className="w-full glass-panel border border-white/[0.08] focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400 text-slate-100 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-all"
            />
          </div>

          {/* Topics Grid */}
          {loading ? (
            <div className="py-16 text-center text-cyan-400 font-mono text-xs animate-pulse">
              LOADING SYLLABUS VAULT...
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel text-slate-400 text-sm">
              No topics found matching &quot;{searchQuery}&quot; in {selectedSubject}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTopics.map((topic, index) => (
                <div
                  key={`${topic.id}_${index}`}
                  onClick={() => setSelectedTopic(topic)}
                  className="glass-panel glass-card-hover rounded-2xl p-4.5 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wide">
                        {topic.subject}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>

                    <h4 className="font-bold text-white text-sm group-hover:text-cyan-200 transition-colors line-clamp-1 mb-1">
                      {topic.topic}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {topic.content}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="truncate max-w-[200px]">{topic.source}</span>
                    <span className="text-cyan-400/90 group-hover:text-cyan-300 font-medium">
                      Open Module →
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
