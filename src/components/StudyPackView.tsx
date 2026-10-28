import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, MessageSquare, ArrowLeft, Bookmark, ExternalLink } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24">
      {/* Top Header */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            ZIMSEC Study Pack &amp; Syllabus Vault
          </h2>
          {contentLevel === 'Primary' && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              Official 6-Subject Results Format
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Official curriculum notes and study modules for{' '}
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

      {/* Selected Topic Reader View */}
      {selectedTopic ? (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {selectedSubject} topics
          </button>

          <div className="border-b border-slate-800 pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-semibold mr-2">
                {selectedTopic.subject}
              </span>
              <span className="text-xs text-slate-400">{selectedTopic.source}</span>
              <h3 className="text-lg font-bold text-white mt-1">
                {selectedTopic.topic}
              </h3>
            </div>

            <button
              onClick={() => onAskZexa(`Can you tutor me on ${selectedTopic.topic} in ZIMSEC ${contentLevel}?`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all glow-cyan-sm active:scale-95"
            >
              <MessageSquare className="w-4 h-4" /> Ask ZEXA about this topic
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {selectedTopic.content}
          </div>

          {selectedTopic.keywords.length > 0 && (
            <div className="mt-6 pt-3 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 mr-2">Keywords:</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1">
                {selectedTopic.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Topic & Subject Browser */
        <div className="space-y-4">
          {/* Horizontal Subjects Scroll Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => {
                  setSelectedSubject(subj);
                  setSearchQuery('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSubject === subj
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 glow-cyan-sm shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Search bar inside selected subject */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search topics in ${selectedSubject || 'syllabus'}...`}
              className="w-full bg-[#111827] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm placeholder:text-slate-500 outline-none transition-all"
            />
          </div>

          {/* Topics List Grid */}
          {loading ? (
            <div className="py-12 text-center text-cyan-400 animate-pulse text-sm">
              Loading syllabus modules...
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
              No topics found matching &quot;{searchQuery}&quot; in {selectedSubject}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTopics.map((topic, index) => (
                <div
                  key={`${topic.id}_${index}`}
                  onClick={() => setSelectedTopic(topic)}
                  className="group p-4 rounded-xl bg-[#111827] hover:bg-[#162033] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                        {topic.subject}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm group-hover:text-cyan-200 transition-colors line-clamp-1">
                      {topic.topic}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {topic.content}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{topic.source}</span>
                    <span className="text-cyan-400/80 group-hover:text-cyan-300 font-semibold flex items-center gap-1">
                      Read notes <ChevronRight className="w-3 h-3" />
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
