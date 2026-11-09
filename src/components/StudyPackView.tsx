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
  BookMarked,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  Filter
} from 'lucide-react';
import { KnowledgeChunk } from '../types';
import { KnowledgeStore } from '../lib/knowledgeStore';
import { StudyDiagram, DiagramId } from './StudyDiagrams';
import { MarkdownArticle } from './MarkdownArticle';

interface StudyPackViewProps {
  contentLevel: string;
  onAskZexa: (question: string) => void;
}

export const StudyPackView: React.FC<StudyPackViewProps> = ({
  contentLevel,
  onAskZexa
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'modules' | 'diagrams'>('modules');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [topics, setTopics] = useState<KnowledgeChunk[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeChunk | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visualOnlyFilter, setVisualOnlyFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gallery of visual diagrams per level
  const [allVisualTopics, setAllVisualTopics] = useState<KnowledgeChunk[]>([]);

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

      // Collect all visual topics across subjects for the diagrams gallery
      const allVisuals: KnowledgeChunk[] = [];
      for (const s of subList) {
        const chunkList = await KnowledgeStore.getTopics(contentLevel, s);
        for (const t of chunkList) {
          if (t.hasVisual && t.diagramId) {
            allVisuals.push(t);
          }
        }
      }
      setAllVisualTopics(allVisuals);
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
    if (visualOnlyFilter && !t.hasVisual) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.topic.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  // Navigation for previous/next topic
  const currentTopicIndex = selectedTopic ? filteredTopics.findIndex(t => t.id === selectedTopic.id) : -1;
  const prevTopic = currentTopicIndex > 0 ? filteredTopics[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex >= 0 && currentTopicIndex < filteredTopics.length - 1 ? filteredTopics[currentTopicIndex + 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 animate-fadeIn">
      
      {/* Top Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold mb-1">
            <BookMarked className="w-4 h-4" />
            <span>Curriculum Vault · {contentLevel}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>ZIMSEC &amp; Cambridge Study Pack</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-normal">
              Textbook Depth + Visuals
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Rich structured textbook lessons, formulas, step-by-step mechanisms &amp; interactive vector diagrams.
          </p>
        </div>

        {/* View Switcher: Modules vs Diagrams Gallery */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/[0.08] self-start sm:self-auto shadow-inner">
          <button
            onClick={() => { setActiveViewMode('modules'); setSelectedTopic(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeViewMode === 'modules'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syllabus Modules</span>
          </button>
          <button
            onClick={() => { setActiveViewMode('diagrams'); setSelectedTopic(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeViewMode === 'diagrams'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Visual Diagrams ({allVisualTopics.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: DIAGRAMS GALLERY */}
      {activeViewMode === 'diagrams' && !selectedTopic && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Visual Diagram &amp; Infographics Gallery</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Vector illustrations for biology anatomy, physics circuits, chemistry bonding, geography cycles &amp; math theorems.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-cyan-400 font-bold">{allVisualTopics.length} Diagrams</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allVisualTopics.map((item, idx) => (
              <div
                key={`gallery_${item.id}_${idx}`}
                onClick={() => { setSelectedTopic(item); setActiveViewMode('modules'); }}
                className="glass-panel glass-card-hover rounded-2xl p-4.5 cursor-pointer flex flex-col justify-between group border border-cyan-500/20 hover:border-cyan-400/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wide bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>Vector Graphic</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base group-hover:text-cyan-200 transition-colors mb-1.5">
                    {item.topic}
                  </h4>

                  {item.visualCaption && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {item.visualCaption}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">{item.source}</span>
                  <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold flex items-center gap-1">
                    <span>View Diagram &amp; Notes</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: TOPIC READER (When a topic is selected) */}
      {selectedTopic ? (
        <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/[0.08] animate-fadeIn">
          {/* Breadcrumb Navigation & Top Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedTopic(null)}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.06]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {selectedTopic.subject} modules</span>
            </button>

            <button
              onClick={() => onAskZexa(`Can you tutor me on ${selectedTopic.topic} in ZIMSEC ${contentLevel}? Please explain step-by-step and give exam tips.`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary-gradient text-xs font-bold transition-all shrink-0 active:scale-95 shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask ZEXA About This</span>
            </button>
          </div>

          {/* Module Header */}
          <div className="border-b border-white/[0.08] pb-4 mb-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mb-1.5">
              <span className="text-cyan-400 font-bold uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {selectedTopic.subject}
              </span>
              <span>·</span>
              <span className="text-slate-300">{selectedTopic.source}</span>
              {selectedTopic.hasVisual && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Includes Visual Diagram</span>
                  </span>
                </>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {selectedTopic.topic}
            </h3>
          </div>

          {/* If the topic has an associated visual diagram, display it prominently */}
          {selectedTopic.hasVisual && selectedTopic.diagramId && (
            <div className="mb-6">
              <StudyDiagram
                diagramId={selectedTopic.diagramId as DiagramId}
                caption={selectedTopic.visualCaption || selectedTopic.summary}
              />
            </div>
          )}

          {/* Rich Formatted Markdown Content */}
          <div className="mt-4">
            <MarkdownArticle content={selectedTopic.content} />
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

          {/* Prev / Next Topic Navigation Bar */}
          <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
            {prevTopic ? (
              <button
                onClick={() => setSelectedTopic(prevTopic)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all text-left"
              >
                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                <div className="max-w-[180px] sm:max-w-xs truncate">
                  <div className="text-[10px] text-slate-500 font-mono">PREVIOUS MODULE</div>
                  <div className="truncate">{prevTopic.topic}</div>
                </div>
              </button>
            ) : <div />}

            {nextTopic && (
              <button
                onClick={() => setSelectedTopic(nextTopic)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all text-right ml-auto"
              >
                <div className="max-w-[180px] sm:max-w-xs truncate">
                  <div className="text-[10px] text-slate-500 font-mono">NEXT MODULE</div>
                  <div className="truncate">{nextTopic.topic}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            )}
          </div>
        </div>
      ) : activeViewMode === 'modules' && (
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

          {/* Search Bar & Visual Filter Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search syllabus topics in ${selectedSubject || 'all subjects'}...`}
                className="w-full glass-panel border border-white/[0.08] focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400 text-slate-100 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setVisualOnlyFilter(!visualOnlyFilter)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                visualOnlyFilter
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>With Visuals Only</span>
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTopics.map((topic, index) => (
                <div
                  key={`${topic.id}_${index}`}
                  onClick={() => setSelectedTopic(topic)}
                  className="glass-panel glass-card-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between group border border-white/[0.06] hover:border-cyan-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wide bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                        {topic.subject}
                      </span>
                      {topic.hasVisual ? (
                        <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Visual Diagram</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          Textbook Module
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-white text-base group-hover:text-cyan-200 transition-colors line-clamp-1 mb-2">
                      {topic.topic}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                      {topic.summary || topic.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="truncate max-w-[200px]">{topic.source}</span>
                    <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold flex items-center gap-1">
                      <span>Open Lesson</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
