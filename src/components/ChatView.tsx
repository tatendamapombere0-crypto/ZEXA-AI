import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Copy, 
  Check, 
  User, 
  Sparkles, 
  BookCheck, 
  AlertCircle, 
  ArrowUpRight,
  Languages,
  Zap,
  HelpCircle,
  Lightbulb,
  Bell
} from 'lucide-react';
import { EducationLevel, SubscriptionStatus, ChatMessage } from '../types';
import { AIEngine } from '../lib/aiEngine';
import { StorageManager } from '../lib/storage';

interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  educationLevel: EducationLevel;
  contentLevel: string;
  subscriptionStatus: SubscriptionStatus;
  queriesUsedToday: number;
  dailyLimit: number;
  onQueriesUpdated: () => void;
  onOpenPremium: () => void;
  onOpenNotifications?: () => void;
  activeExamPrompt?: { question: string; hint?: string } | null;
  onClearActiveExamPrompt?: () => void;
}

interface AnswerRendererProps {
  text: string;
  isUser?: boolean;
}

const ProfessionalAnswerRenderer: React.FC<AnswerRendererProps> = ({ text, isUser }) => {
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap select-text leading-relaxed font-sans text-[13.5px] sm:text-sm text-white">
        {text}
      </div>
    );
  }

  // Render inline formatting without raw markdown symbols
  const renderInline = (str: string) => {
    // Strip stray LaTeX and backslashes
    const cleaned = str
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/\$\$?/g, '')
      .replace(/\\/g, '');

    // Check if line starts with a bold key/label like "Site:" or "Process:" or "Mutungamiri weZimbabwe:"
    const colonMatch = cleaned.match(/^([A-Za-z0-9\s—–()]+:)\s*(.*)$/);
    if (colonMatch) {
      const label = colonMatch[1];
      const rest = colonMatch[2];
      return (
        <span>
          <strong className="text-white font-semibold">{label}</strong>{' '}
          <span className="text-slate-300">{renderInlineFormatting(rest)}</span>
        </span>
      );
    }

    return renderInlineFormatting(cleaned);
  };

  const renderInlineFormatting = (content: string) => {
    // Split by bold (**text**) or italic (*text*)
    const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className="text-white font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={i} className="text-cyan-200/90 italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  // Parse lines into clean structured blocks
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      elements.push(<div key={`blank_${index}`} className="h-2" />);
      return;
    }

    // Horizontal divider
    if (line === '---' || line === '***' || line === '___') {
      elements.push(<hr key={`hr_${index}`} className="border-t border-slate-700/60 my-2.5" />);
      return;
    }

    // 1. Heading (### Title or ## Title vs #### Subheading)
    if (line.startsWith('#')) {
      const headingLevel = (line.match(/^#+/) || ['#'])[0].length;
      let headingText = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();

      // Clean retrieval/syllabus prefixes (e.g. "Primary Science & Technology (ZIMSEC 7030): Osmosis" -> "Osmosis")
      if (headingText.includes(':') && !headingText.toLowerCase().startsWith('note:')) {
        const colonIdx = headingText.indexOf(':');
        const prefix = headingText.slice(0, colonIdx).toLowerCase();
        if (
          prefix.includes('zimsec') ||
          prefix.includes('science') ||
          prefix.includes('biology') ||
          prefix.includes('physics') ||
          prefix.includes('chemistry') ||
          prefix.includes('primary') ||
          prefix.includes('secondary') ||
          prefix.includes('math') ||
          prefix.includes('english') ||
          prefix.includes('heritage') ||
          prefix.includes('geography') ||
          prefix.includes('commerce') ||
          prefix.includes('syllabus') ||
          prefix.includes('curriculum')
        ) {
          headingText = headingText.slice(colonIdx + 1).trim();
        }
      }

      if (headingLevel >= 4) {
        // Sub-heading (e.g. #### 1. What is Osmosis?)
        elements.push(
          <div
            key={`subhead_${index}`}
            className="font-bold text-cyan-300 text-xs sm:text-[14px] tracking-tight pt-2 pb-1 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0" />
            <span>{headingText}</span>
          </div>
        );
      } else {
        // Main topic header (### Title)
        elements.push(
          <div
            key={`head_${index}`}
            className="font-bold text-white text-sm sm:text-base tracking-tight pt-1 pb-1.5 mb-2 border-b border-white/[0.08] flex items-center gap-2"
          >
            <span className="w-1.5 h-3.5 bg-cyan-400 rounded-full shrink-0" />
            <span>{headingText}</span>
          </div>
        );
      }
      return;
    }

    // 2. Numbered step with title (e.g. "1. Light-Dependent Stage:" or "1. Identify coefficients:")
    const stepMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (stepMatch) {
      const num = stepMatch[1];
      const content = stepMatch[2];
      elements.push(
        <div key={`step_${index}`} className="flex items-start gap-2.5 pt-2 pb-0.5">
          <span className="w-5 h-5 rounded-md bg-cyan-950/90 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {num}
          </span>
          <div className="font-semibold text-white text-xs sm:text-[13.5px]">
            {renderInline(content)}
          </div>
        </div>
      );
      return;
    }

    // 3. Bullet list item (- or *)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const isIndented = rawLine.startsWith('   ') || rawLine.startsWith('\t');
      const content = line.slice(2);
      elements.push(
        <div
          key={`bullet_${index}`}
          className={`flex items-start gap-2 my-1 text-xs sm:text-[13.5px] leading-relaxed text-slate-200 ${isIndented ? 'pl-6 text-slate-300' : 'pl-1.5'}`}
        >
          <span className={`rounded-full shrink-0 ${isIndented ? 'w-1 h-1 bg-cyan-300/70 mt-2.5' : 'w-1.5 h-1.5 bg-cyan-400 mt-2'}`} />
          <div className="flex-1">{renderInline(content)}</div>
        </div>
      );
      return;
    }

    // 4. Standalone Equation or Formula Card
    const isFormula =
      (line.includes('→') || line.includes('±') || line.startsWith('x =') || line.includes('2H₂O') || line.startsWith('Assets =') || line.startsWith('Force =') || line.includes('√(b²')) &&
      !line.startsWith('Chemical Word Equation') &&
      !line.startsWith('Equation yePhotosynthesis');

    if (isFormula) {
      elements.push(
        <div
          key={`eq_${index}`}
          className="p-2.5 my-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/25 font-mono text-cyan-300 text-xs sm:text-[13px] tracking-wide shadow-inner overflow-x-auto"
        >
          {line.replace(/\*\*/g, '')}
        </div>
      );
      return;
    }

    // 5. Normal paragraph
    elements.push(
      <p key={`p_${index}`} className="my-1 text-xs sm:text-[13.5px] leading-relaxed text-slate-200">
        {renderInline(line)}
      </p>
    );
  });

  return <div className="space-y-0.5 select-text">{elements}</div>;
};

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  setMessages,
  educationLevel,
  contentLevel,
  subscriptionStatus,
  queriesUsedToday,
  dailyLimit,
  onQueriesUpdated,
  onOpenPremium,
  onOpenNotifications,
  activeExamPrompt,
  onClearActiveExamPrompt
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle cross-screen prompt from Study Pack or Exam Mode
  useEffect(() => {
    if (activeExamPrompt && activeExamPrompt.question) {
      handleSendMessage(activeExamPrompt.question, activeExamPrompt.hint);
      if (onClearActiveExamPrompt) {
        onClearActiveExamPrompt();
      }
    }
  }, [activeExamPrompt]);

  const handleSendMessage = async (textToSend?: string, hint?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    // Check query limit
    const check = StorageManager.checkCanQuery();
    if (!check.allowed) {
      onOpenPremium();
      return;
    }

    setInputText('');

    // Record user message
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      text,
      isUser: true,
      timestamp: Date.now()
    };

    const aiMsgId = `ai_${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      text: '',
      isUser: false,
      timestamp: Date.now()
    };

    const nextMessages = [...messages, userMsg, aiPlaceholder];
    setMessages(nextMessages);
    StorageManager.recordQueryUsed();
    onQueriesUpdated();

    // Build multi-turn conversation history for context continuity
    const conversationHistory = messages
      .filter((m) => m.text && m.text.trim().length > 0)
      .slice(-6)
      .reduce<Array<{ question: string; answer: string }>>((acc, m, idx, arr) => {
        if (m.isUser && arr[idx + 1] && !arr[idx + 1].isUser && arr[idx + 1].text) {
          acc.push({ question: m.text, answer: arr[idx + 1].text });
        }
        return acc;
      }, []);

    setIsGenerating(true);

    await AIEngine.generate(text, {
      level: contentLevel,
      hint,
      history: conversationHistory,
      engineType: 'zexa-instant',
      onToken: (token) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: m.text + token } : m))
        );
      },
      onComplete: (metrics, source, suggestions) => {
        setIsGenerating(false);
        setMessages((prev) => {
          const finalMessages = prev.map((m) =>
            m.id === aiMsgId ? { ...m, metrics, source, suggestions } : m
          );
          StorageManager.saveChatMessages(finalMessages);
          return finalMessages;
        });
      },
      onError: (err) => {
        setIsGenerating(false);
        setMessages((prev) => {
          const finalMessages = prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text: `An error occurred: ${err}. Please check your question or retry.`
                }
              : m
          );
          StorageManager.saveChatMessages(finalMessages);
          return finalMessages;
        });
      }
    });
  };

  const handleStop = () => {
    AIEngine.stopGeneration();
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelInfo = () => {
    const isPrimary = educationLevel.includes('Primary') || contentLevel === 'Primary';
    const isTertiary = educationLevel.includes('Tertiary') || contentLevel === 'Tertiary';
    const isALevel =
      educationLevel.includes('A-Level') ||
      educationLevel.includes('Form 5') ||
      educationLevel.includes('Forms 5') ||
      contentLevel === 'A-Level';

    if (isPrimary) {
      return {
        badge: 'GRADE 1 - 7 PRIMARY',
        title: 'Primary Curriculum Revision',
        desc: 'Explore all 6 official ZIMSEC subjects: English, Mathematics, Agric Science & Tech, Shona, Social Science, and Physical Edu & Arts.',
        placeholder: 'Ask ZEXA AI about any Primary subject or type in ChiShona...',
        suggestions: [
          {
            subject: 'Agric, Science & Tech',
            text: 'Name the 3 main soil types (Sand, Clay, Loam) and their farming properties'
          },
          {
            subject: 'Agric, Science & Tech',
            text: 'How do green leaves make food through photosynthesis?'
          },
          {
            subject: 'Social Science',
            text: 'What do the national symbols of Zimbabwe (Flag, Bird, Anthem) mean?'
          },
          {
            subject: 'ChiShona',
            text: 'Tsanangura tsumo yekuti: Chara chimwe hachitswanyi inda'
          }
        ]
      };
    }

    if (isTertiary) {
      return {
        badge: 'TERTIARY & HIGHER EDUCATION',
        title: 'Research & Advanced Academics',
        desc: 'Advanced technical revision, research methodology, macroeconomics, and higher engineering modules.',
        placeholder: 'Ask ZEXA AI for advanced academic research and analysis...',
        suggestions: [
          {
            subject: 'Macroeconomics',
            text: 'Analyze the mechanics of a structured currency with physical gold backing'
          },
          {
            subject: 'Computer Science',
            text: 'Explain neural network quantization (GGUF 4-bit) for offline edge AI'
          },
          {
            subject: 'Research Methodology',
            text: 'What are the distinctions between qualitative vs quantitative methodologies?'
          },
          {
            subject: 'Commerce & Law',
            text: 'Outline the essential elements of a legally binding contract in Zimbabwean law'
          }
        ]
      };
    }

    if (isALevel) {
      return {
        badge: 'SECONDARY · A-LEVEL (FORMS 5 - 6)',
        title: 'A-Level Examination Mastery',
        desc: 'In-depth coverage for Pure Math, Physics, Chemistry, Biology, History (9155), Literature, Accounting & Geography.',
        placeholder: 'Ask ZEXA AI about A-Level syllabus, past papers, or marking schemes...',
        suggestions: [
          {
            subject: 'History 9155',
            text: 'Analyze the domestic and international factors leading to the 1979 Lancaster House Conference'
          },
          {
            subject: 'Pure Mathematics 6042',
            text: 'Explain integration by parts formula and demonstrate with integral of x*e^x dx'
          },
          {
            subject: 'Biology',
            text: 'Explain the light-dependent and Calvin cycle stages of photosynthesis in detail'
          },
          {
            subject: 'History & Heritage',
            text: 'Evaluate the economic foundation and reasons for decline of Great Zimbabwe'
          }
        ]
      };
    }

    // Default: O-Level
    return {
      badge: 'SECONDARY · O-LEVEL (FORMS 1 - 4)',
      title: 'O-Level Syllabus & Exam Prep',
      desc: 'Master Combined Science, Mathematics 4004, Geography 4022, History 2167, English 4005, and Commerce.',
      placeholder: 'Ask ZEXA AI any O-Level syllabus question or past exam paper doubt...',
      suggestions: [
        {
          subject: 'Combined Science 4003',
          text: 'Explain the light and dark reactions of photosynthesis with word equation'
        },
        {
          subject: 'Geography 4022',
          text: 'How do river erosion features like waterfalls and gorges form upstream?'
        },
        {
          subject: 'History 2167',
          text: 'Discuss the causes and results of the 1896 First Chimurenga'
        },
        {
          subject: 'ChiShona 4007',
          text: 'Chiredzi iri mudunhu ripi rekurima uye inozivikanwa nekuriwei?'
        }
      ]
    };
  };

  const levelInfo = getLevelInfo();

  return (
    <div className="flex flex-col h-[calc(100vh-62px)] pb-18 bg-mesh">
      
      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 max-w-4xl w-full mx-auto">
        
        {/* Modern Silicon Valley Empty State */}
        {messages.length === 0 && (
          <div className="my-4 sm:my-8 glass-panel rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden animate-fadeIn">
            {/* Ambient Radial Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing HD Brain Icon */}
            <div className="flex justify-center mb-4 relative">
              <img
                src="/assets/zexa_brain_logo.png"
                alt="ZEXA AI Brain Logo"
                className="w-20 h-18 sm:w-24 sm:h-20 object-contain animate-brain-glow"
              />
            </div>

            {/* Title & Level Kicker */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-semibold mb-3">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{levelInfo.badge}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
              {levelInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl mx-auto mb-5">
              {levelInfo.desc}
            </p>

            {/* Daily Harare Study Notification Card */}
            <div className="max-w-2xl mx-auto mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-blue-950/60 border border-cyan-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-cyan-950/20">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5 border border-cyan-500/20">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Have you done your study today? Let's begin!</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Daily revision hints sent to your device at <strong className="text-cyan-300">6:00 AM</strong>, <strong className="text-cyan-300">12:00 PM</strong>, and <strong className="text-cyan-300">6:00 PM</strong> Harare Time (CAT).
                  </p>
                </div>
              </div>
              {onOpenNotifications && (
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-semibold text-xs whitespace-nowrap transition-all active:scale-95 flex items-center justify-center gap-1 self-start sm:self-center"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alert Settings</span>
                </button>
              )}
            </div>

            {/* Categorized Question Starter Cards (Silicon Valley Grid) */}
            <div className="text-left max-w-2xl mx-auto space-y-2.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recommended Exam Questions:</span>
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {levelInfo.suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.text)}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-sm hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)] active:scale-98"
                  >
                    <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wide">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-200 group-hover:text-white font-medium line-clamp-2 leading-relaxed">
                      {item.text}
                    </span>
                    <div className="flex items-center justify-end text-slate-500 group-hover:text-cyan-400 text-[11px] mt-1 font-mono">
                      <span>Ask ZEXA</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Message Items Stream */}
        {messages.map((msg, idx) => (
          <div
            key={`${msg.id}_${idx}`}
            className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            {/* Bot Avatar */}
            {!msg.isUser && (
              <div className="shrink-0 mt-1 flex items-center justify-center">
                <img
                  src="/assets/zexa_brain_logo.png"
                  alt="ZEXA AI Brain"
                  className="w-8 h-7.5 object-contain animate-brain-glow-subtle"
                />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`relative max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-md ${
                msg.isUser
                  ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/40 text-white rounded-tr-sm'
                  : 'glass-panel text-slate-100 rounded-tl-sm border border-white/[0.08]'
              }`}
            >
              {/* Message Content */}
              {msg.text ? (
                <ProfessionalAnswerRenderer text={msg.text} isUser={msg.isUser} />
              ) : (
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs py-1">
                  <span>SYNTHESIZING ANSWER</span>
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              )}

              {/* Clean Action Footer: Copy Button Only */}
              {!msg.isUser && msg.text && (
                <div className="mt-2 pt-1 flex items-center justify-end">
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="p-1 rounded-md hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy Answer to Clipboard"
                  >
                    {copiedId === msg.id ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.isUser && (
              <div className="w-7.5 h-7.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Daily Limit Banner if reached */}
      {subscriptionStatus === 'FREE' && queriesUsedToday >= dailyLimit && (
        <div className="max-w-4xl w-full mx-auto px-3 sm:px-6 mb-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You have used your 2 free offline queries for today.</span>
            </div>
            <button
              onClick={onOpenPremium}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95"
            >
              Enter Code / Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Command Bar / Input Dock */}
      <div className="px-3 sm:px-6 pb-2 max-w-4xl w-full mx-auto">
        <div className="glass-panel-elevated rounded-2xl p-1.5 sm:p-2 border border-white/[0.1] shadow-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              placeholder={levelInfo.placeholder}
              className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-sans"
            />

            {isGenerating ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-3.5 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 shrink-0"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl btn-primary-gradient disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1.5 shrink-0 active:scale-95"
                title="Send Question"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>


    </div>
  );
};
