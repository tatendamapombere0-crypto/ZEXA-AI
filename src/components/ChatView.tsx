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
  Zap,
  Lightbulb,
  Award,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { EducationLevel, SubscriptionStatus, ChatMessage, StudyTutorMode } from '../types';
import { AIEngine } from '../lib/aiEngine';
import { StorageManager } from '../lib/storage';
import { ZexaNeuralEngine, ZexaProgressState } from '../lib/zexaNeuralEngine';
import {
  getExamBoardProfile,
  getUniversalStarterPrompts,
  TUTOR_MODE_OPTIONS,
  MATH_SCIENCE_SYMBOLS,
  buildQuickFollowUps
} from '../data/africanExamBoards';
import { getTierForContentLevel } from '../data/countryEducationLevels';

interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  educationLevel: EducationLevel;
  contentLevel: string;
  country?: string;
  subscriptionStatus: SubscriptionStatus;
  queriesUsedToday: number;
  dailyLimit: number;
  onQueriesUpdated: () => void;
  onRevisionUpdated?: () => void;
  onOpenPremium: () => void;
  onOpenNotifications?: () => void;
  activeExamPrompt?: { question: string; hint?: string } | null;
  onClearActiveExamPrompt?: () => void;
}

interface AnswerRendererProps {
  text: string;
  isUser?: boolean;
  isZim?: boolean;
}

const ProfessionalAnswerRenderer: React.FC<AnswerRendererProps> = ({ text, isUser, isZim = true }) => {
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap select-text leading-relaxed font-sans text-[14.5px] sm:text-base text-white">
        {text}
      </div>
    );
  }

  // Render inline formatting with mark badges and bold/italic handling
  const renderInline = (str: string) => {
    // Strip stray LaTeX and raw backslashes
    const cleaned = str
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/\$\$?/g, '')
      .replace(/\\/g, '');

    // Check if line starts with a bold key/label like "Alliance System:", "Militarism:", "Process:", etc.
    const colonMatch = cleaned.match(/^([A-Za-z0-9\s—–()]+:)\s*(.*)$/);
    if (colonMatch) {
      const label = colonMatch[1];
      const rest = colonMatch[2];
      return (
        <span>
          <strong className="text-white font-semibold">{label}</strong>{' '}
          <span className="text-slate-200">{renderInlineWithMarks(rest)}</span>
        </span>
      );
    }

    return renderInlineWithMarks(cleaned);
  };

  const renderInlineWithMarks = (content: string) => {
    // Detect mark allocations like [8–12 Marks], [Total: 8–12 Marks], [4 marks], [M.A.I.N. Factors]
    const markRegex = /(\[(?:Total:?\s*)?[0-9–\-\+]+\s*marks?\]|\[M\.A\.I\.N\.[\sA-Za-z]*\])/gi;
    const parts = content.split(markRegex);

    return (
      <>
        {parts.map((part, pIdx) => {
          if (part.match(markRegex)) {
            return (
              <span
                key={`mk_${pIdx}`}
                className="inline-flex items-center gap-1 mx-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold shadow-sm align-middle"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{part.replace(/[\[\]]/g, '')}</span>
              </span>
            );
          }
          return <span key={`chunk_${pIdx}`}>{renderBoldItalics(part)}</span>;
        })}
      </>
    );
  };

  const renderBoldItalics = (chunk: string) => {
    const subParts = chunk.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <>
        {subParts.map((sub, i) => {
          if (sub.startsWith('**') && sub.endsWith('**')) {
            return (
              <strong key={i} className="text-white font-semibold">
                {sub.slice(2, -2)}
              </strong>
            );
          }
          if (sub.startsWith('*') && sub.endsWith('*')) {
            return (
              <em key={i} className="text-cyan-200/90 italic font-medium">
                {sub.slice(1, -1)}
              </em>
            );
          }
          return <span key={i}>{sub}</span>;
        })}
      </>
    );
  };

  // Parse lines into clean, spacious, structured elements
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inGuidanceCard = false;
  let guidanceLines: string[] = [];
  let guidanceTitle = '';

  const flushGuidanceCard = () => {
    if (inGuidanceCard) {
      elements.push(
        <div
          key={`guidance_${elements.length}`}
          className="my-4 rounded-xl p-4 sm:p-5 bg-gradient-to-br from-emerald-950/50 to-slate-900/80 border border-emerald-500/35 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-[15px] mb-2.5 pb-2 border-b border-emerald-500/20">
            <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{guidanceTitle || (isZim ? 'ZIMSEC Examiner Mark Scheme Guidance' : 'Examiner Mark Scheme Guidance')}</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
            {guidanceLines.map((gl, gIdx) => (
              <div key={gIdx} className="flex items-start gap-2">
                {gl.startsWith('- ') || gl.startsWith('* ') ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <span className="flex-1">{renderInline(gl.slice(2))}</span>
                  </>
                ) : (
                  <p className="flex-1">{renderInline(gl)}</p>
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

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushGuidanceCard();
      elements.push(<div key={`blank_${index}`} className="h-1.5" />);
      return;
    }

    // Horizontal divider
    if (line === '---' || line === '***' || line === '___') {
      flushGuidanceCard();
      elements.push(<hr key={`hr_${index}`} className="border-t border-slate-700/60 my-4" />);
      return;
    }

    // Check if line is examiner guidance section header
    const lowerLine = line.toLowerCase();
    const isGuidanceHeader =
      lowerLine.includes('examiner mark scheme guidance') ||
      lowerLine.includes('mark scheme guidance') ||
      lowerLine.includes('marking scheme guidance') ||
      lowerLine.includes('key points expected in a full answer');

    if (isGuidanceHeader) {
      flushGuidanceCard();
      inGuidanceCard = true;
      guidanceTitle = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      return;
    }

    if (inGuidanceCard) {
      // If another major heading starts, flush guidance card
      if (line.startsWith('#')) {
        flushGuidanceCard();
      } else {
        guidanceLines.push(line);
        return;
      }
    }

    // 1. Heading (### Title or ## Title vs #### Subheading)
    if (line.startsWith('#')) {
      const headingLevel = (line.match(/^#+/) || ['#'])[0].length;
      let headingText = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();

      // Clean retrieval/syllabus prefixes
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
        // Sub-heading (e.g. #### 1. Long-Term Causes [M.A.I.N. Factors])
        elements.push(
          <div
            key={`subhead_${index}`}
            className="font-bold text-cyan-300 text-sm sm:text-base tracking-tight pt-3 pb-1 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full shrink-0" />
            <span>{renderInline(headingText)}</span>
          </div>
        );
      } else {
        // Main topic header (### Title)
        elements.push(
          <div
            key={`head_${index}`}
            className="font-bold text-white text-base sm:text-lg tracking-tight pt-3 pb-2 mb-2 border-b border-slate-700/70 flex items-center gap-2.5"
          >
            <span className="w-2 h-4 bg-cyan-400 rounded-full shrink-0" />
            <span>{headingText}</span>
          </div>
        );
      }
      return;
    }

    // 2. Numbered step with title (e.g. "1. Executive Summary & Overview" or "1. Identify coefficients:")
    const stepMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (stepMatch) {
      const num = stepMatch[1];
      const content = stepMatch[2];
      elements.push(
        <div key={`step_${index}`} className="flex items-start gap-3 py-2">
          <span className="w-6 h-6 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            {num}
          </span>
          <div className="flex-1 font-semibold text-white text-[14.5px] sm:text-[15px] leading-relaxed pt-0.5">
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
          className={`flex items-start gap-2.5 py-1 text-[14px] sm:text-[15px] leading-relaxed text-slate-200 ${
            isIndented ? 'pl-6 text-slate-300 text-[13.5px] sm:text-[14px]' : 'pl-1.5'
          }`}
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
          className="p-3 my-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 font-mono text-cyan-300 text-xs sm:text-sm tracking-wide shadow-inner overflow-x-auto"
        >
          {line.replace(/\*\*/g, '')}
        </div>
      );
      return;
    }

    // 5. Normal paragraph
    elements.push(
      <p key={`p_${index}`} className="my-1.5 text-[14px] sm:text-[15px] leading-relaxed text-slate-200">
        {renderInline(line)}
      </p>
    );
  });

  flushGuidanceCard();

  return <div className="space-y-3.5 select-text">{elements}</div>;
};

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  setMessages,
  educationLevel,
  contentLevel,
  country = 'Zimbabwe',
  subscriptionStatus,
  queriesUsedToday,
  dailyLimit,
  onQueriesUpdated,
  onRevisionUpdated,
  onOpenPremium,
  activeExamPrompt,
  onClearActiveExamPrompt
}) => {
  const isZim = StorageManager.isZimbabweAccount(country);
  const isBw = StorageManager.isBotswanaAccount(country);
  const hasPack = StorageManager.hasCountryCurriculumPack(country);
  const boardProfile = getExamBoardProfile(country, contentLevel);
  const activeTier = getTierForContentLevel(country, contentLevel);

  const [inputText, setInputText] = useState('');
  const [tutorMode, setTutorMode] = useState<StudyTutorMode>('standard');
  const [showSymbolPad, setShowSymbolPad] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [neuralState, setNeuralState] = useState<ZexaProgressState>(() => ZexaNeuralEngine.getStatus());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return ZexaNeuralEngine.subscribe(setNeuralState);
  }, []);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle cross-screen prompt from Study Pack, Exam Mode, or Revision Hub
  useEffect(() => {
    if (activeExamPrompt && activeExamPrompt.question) {
      handleSendMessage(activeExamPrompt.question, activeExamPrompt.hint);
      if (onClearActiveExamPrompt) {
        onClearActiveExamPrompt();
      }
    }
  }, [activeExamPrompt]);

  const handleInsertSymbol = (sym: string) => {
    const el = inputRef.current;
    if (!el) {
      setInputText((prev) => `${prev}${sym}`);
      return;
    }
    const start = el.selectionStart ?? inputText.length;
    const end = el.selectionEnd ?? inputText.length;
    const next = inputText.slice(0, start) + sym + inputText.slice(end);
    setInputText(next);
    setTimeout(() => {
      el.focus();
      const pos = start + sym.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

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
    let streamedText = '';

    try {
      await AIEngine.generate(text, {
        level: contentLevel,
        country,
        tutorMode,
        hint,
        history: conversationHistory,
        engineType:
          neuralState.status === 'ready' || ZexaNeuralEngine.isReady() || ZexaNeuralEngine.isLoading()
            ? 'zexa-neural'
            : 'zexa-instant',
        onToken: (token) => {
          streamedText += token;
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, text: m.text + token } : m))
          );
        },
        onComplete: (metrics, source, suggestions) => {
          setIsGenerating(false);
          const resolvedAnswer = streamedText.trim();
          const fallbackEmptyText =
            resolvedAnswer.length === 0
              ? 'Unable to complete this response. Please try asking your question again.'
              : '';
          const computedSuggestions =
            suggestions && suggestions.length > 0
              ? suggestions
              : buildQuickFollowUps(text, country);

          if (
            resolvedAnswer.length > 0 &&
            !resolvedAnswer.startsWith('Unable to generate a live neural response right now.')
          ) {
            StorageManager.recordSearchQA({
              question: text,
              answer: resolvedAnswer,
              subject: source ? source.split('•')[0].trim() : `${activeTier.shortLabel} Study`,
              source,
              tutorMode,
              level: activeTier.shortLabel,
              country
            });
            if (onRevisionUpdated) onRevisionUpdated();
          }

          setMessages((prev) => {
            const finalMessages = prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text:
                      m.text && m.text.trim().length > 0
                        ? m.text
                        : resolvedAnswer.length > 0
                        ? streamedText
                        : fallbackEmptyText,
                    metrics,
                    source,
                    suggestions: computedSuggestions
                  }
                : m
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
                    text:
                      m.text && m.text.trim().length > 0
                        ? m.text
                        : `An error occurred: ${err}. Please check your question or retry.`
                  }
                : m
            );
            StorageManager.saveChatMessages(finalMessages);
            return finalMessages;
          });
        }
      });
    } catch (err: any) {
      setMessages((prev) => {
        const finalMessages = prev.map((m) =>
          m.id === aiMsgId && (!m.text || m.text.trim().length === 0)
            ? {
                ...m,
                text: `An error occurred: ${err?.message || 'Unable to generate response'}. Please retry.`
              }
            : m
        );
        StorageManager.saveChatMessages(finalMessages);
        return finalMessages;
      });
    } finally {
      setIsGenerating(false);
    }
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

    if (!hasPack) {
      return {
        badge: `${country.toUpperCase()} · ${boardProfile.boardShort} · ${activeTier.shortLabel.toUpperCase()}`,
        title: activeTier.chatTitle,
        desc: `${boardProfile.description} Focus: ${activeTier.label}. Choose a topic below or ask any question.`,
        placeholder: `Ask ZEXA AI any ${activeTier.shortLabel} or ${boardProfile.boardShort} question...`,
        suggestions: getUniversalStarterPrompts(country, contentLevel)
      };
    }

    if (isBw) {
      if (isPrimary) {
        return {
          badge: 'BOTSWANA · BEC PSLE (STANDARDS 1–7)',
          title: 'PSLE Primary Curriculum Revision',
          desc: 'Explore BEC Primary subjects: English, Setswana, Mathematics, Science, Agriculture, Social Studies, and CAPA.',
          placeholder: 'Ask ZEXA AI about any PSLE subject or type in Setswana...',
          suggestions: [
            {
              subject: 'Social Studies',
              text: 'Who were the Three Dikgosi and why did they travel to London in 1895?'
            },
            {
              subject: 'Setswana',
              text: 'Tlhalosa seane: Motho ke motho ka batho'
            },
            {
              subject: 'Science',
              text: 'Why is solar energy important in Botswana and how does photosynthesis work?'
            },
            {
              subject: 'Agriculture',
              text: 'Why are sorghum (mabele) and cowpeas suited to dryland farming in Botswana?'
            }
          ]
        };
      }

      if (isTertiary) {
        return {
          badge: 'BOTSWANA · TERTIARY (UB, BIUST, BUAN, BQA)',
          title: 'Tertiary & Research Mastery',
          desc: 'Advanced study across Sovereign Wealth (Pula Fund), Roman-Dutch & Customary Law, Engineering, Economics, and Computing.',
          placeholder: 'Ask ZEXA AI for Botswana Tertiary & research analysis...',
          suggestions: [
            {
              subject: 'Economics & Commerce',
              text: 'Explain how the Pula Fund and SACU help Botswana avoid Dutch Disease'
            },
            {
              subject: 'Law & Jurisprudence',
              text: 'Compare Roman-Dutch Common Law and Customary Law (Makgotla) in Botswana'
            },
            {
              subject: 'Governance',
              text: 'Who is the current President of Botswana and list all former Presidents?'
            },
            {
              subject: 'Development Studies',
              text: 'Analyze Botswana Vision 2036 diamond beneficiation and economic diversification'
            }
          ]
        };
      }

      if (isALevel) {
        return {
          badge: 'BOTSWANA · BEC BGCSE (FORMS 4–5)',
          title: 'BGCSE Examination Mastery',
          desc: 'Master Development Studies, Setswana, Double Science, Mathematics, Geography, History, Accounting & Economics.',
          placeholder: 'Ask ZEXA AI any BGCSE syllabus question or past paper doubt...',
          suggestions: [
            {
              subject: 'Development Studies',
              text: 'Explain the difference between GNP and HDI and how Vision 2036 diversifies Botswana’s economy'
            },
            {
              subject: 'Geography',
              text: 'Why does the Okavango Delta flood during Botswana’s dry winter months?'
            },
            {
              subject: 'History',
              text: 'Explain the Three Dikgosi mission (1895) and Seretse Khama’s path to 1966 independence'
            },
            {
              subject: 'Social Studies & Civics',
              text: 'Who is the current President of Botswana and how does the Kgotla system work?'
            }
          ]
        };
      }

      // Default Botswana tier: JCE (Forms 1 - 3)
      return {
        badge: 'BOTSWANA · BEC JCE (FORMS 1–3)',
        title: 'JCE Junior Secondary Revision',
        desc: 'Master Setswana, Moral Education, Social Studies, Integrated Science, Mathematics, Agriculture & Design and Technology.',
        placeholder: 'Ask ZEXA AI any JCE syllabus question or Setswana prompt...',
        suggestions: [
          {
            subject: 'Governance & History',
            text: 'Who is the current President of Botswana and list all former Presidents?'
          },
          {
            subject: 'Social Studies',
            text: 'List all 10 districts of Botswana and explain the symbols on Botswana’s flag'
          },
          {
            subject: 'History',
            text: 'Why did the Three Dikgosi (Khama III, Sebele I, Bathoen I) go to London in 1895?'
          },
          {
            subject: 'Setswana & Moral Ed',
            text: 'Tlhalosa seane: Motho ke motho ka batho'
          }
        ]
      };
    }

    if (isPrimary) {
      return {
        badge: 'ZIMBABWE · GRADE 1 - 7 PRIMARY',
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
        badge: 'ZIMBABWE · TERTIARY & HIGHER EDUCATION',
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
            text: 'Explain neural network quantization (4-bit) for offline edge AI'
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
        badge: 'ZIMBABWE · A-LEVEL (FORMS 5 - 6)',
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

    // Default: O-Level (Zimbabwe)
    return {
      badge: 'ZIMBABWE · O-LEVEL (FORMS 1 - 4)',
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
    <div className="flex flex-col flex-1 min-h-0 pb-[68px] bg-mesh">
      {/* Scrollable messages container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 max-w-4xl w-full mx-auto">
        {/* Modern Empty State */}
        {messages.length === 0 && (
          <div className="my-2 sm:my-6 glass-panel rounded-3xl p-5 sm:p-8 text-center relative overflow-hidden animate-fadeIn">
            {/* Ambient Radial Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing HD Brain Icon */}
            <div className="flex justify-center mb-3.5 relative">
              <img
                src="/assets/zexa_brain_logo.png"
                alt="ZEXA AI Brain Logo"
                className="w-18 h-16 sm:w-22 sm:h-18 object-contain animate-brain-glow"
              />
            </div>

            {/* Title & Level Kicker (Clean unboxed typography per minimalist standard) */}
            <div className="inline-flex items-center gap-1.5 text-cyan-300 font-mono text-[11px] font-semibold mb-2 tracking-wide">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{levelInfo.badge}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
              {levelInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl mx-auto mb-5">
              {levelInfo.desc}
            </p>

            {/* Starter Topic Cards (Curriculum-aligned for Zimbabwe, Universal STEM/Humanities worldwide) */}
            {levelInfo.suggestions.length > 0 && (
              <div className="text-left max-w-2xl mx-auto space-y-2.5">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{hasPack ? 'Recommended Exam Questions:' : `Quick Study Topics (${boardProfile.boardShort}):`}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {levelInfo.suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.text)}
                      className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-sm hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)] active:scale-98"
                    >
                      <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wide">
                        {item.subject}
                      </span>
                      <span className="text-xs sm:text-[13px] text-slate-200 group-hover:text-white font-medium line-clamp-2 leading-relaxed">
                        {item.text}
                      </span>
                      <div className="flex items-center justify-end text-slate-400 group-hover:text-cyan-400 text-[11px] mt-0.5 font-mono">
                        <span>Ask ZEXA AI</span>
                        <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Items Stream */}
        {messages.map((msg, idx) => (
          <div key={`${msg.id}_${idx}`} className="w-full animate-fadeIn py-1.5">
            {msg.isUser ? (
              <div className="max-w-2xl ml-auto w-full">
                <div className="flex items-center justify-end gap-2 mb-1.5 px-1 text-xs text-slate-400">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>You</span>
                  </span>
                  <span>·</span>
                  <span>Question</span>
                </div>
                <div className="rounded-2xl px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800/90 to-cyan-950/40 border border-cyan-500/35 text-white shadow-md">
                  <ProfessionalAnswerRenderer text={msg.text} isUser={true} />
                </div>
              </div>
            ) : (
              <div className="max-w-3xl w-full mx-auto">
                <div className="glass-panel text-slate-100 rounded-2xl border border-white/[0.08] shadow-xl p-5 sm:p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-blue-500 opacity-70" />

                  {/* Answer Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/assets/zexa_brain_logo.png"
                        alt="ZEXA AI Brain"
                        className="w-7 h-6 object-contain animate-brain-glow-subtle shrink-0"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm sm:text-[15px] tracking-tight">
                          ZEXA AI
                        </span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-xs text-cyan-400 font-mono font-medium">
                          {activeTier.shortLabel}
                        </span>
                      </div>
                    </div>

                    {!hasPack || (msg.metrics && msg.metrics.includes('• ZEXA AI') && !msg.metrics.includes('Offline Core')) ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ZEXA AI Answer</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isZim ? 'ZIMSEC Verified Answer' : isBw ? 'BEC Verified Answer' : 'Verified Curriculum Answer'}</span>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  {msg.text && msg.text.trim().length > 0 ? (
                    <ProfessionalAnswerRenderer text={msg.text} isUser={false} isZim={isZim} />
                  ) : (
                    <div className="flex items-center gap-2.5 text-cyan-400 font-mono text-xs py-3">
                      <span>
                        {neuralState.status === 'ready' || ZexaNeuralEngine.isReady()
                          ? 'ZEXA AI THINKING'
                          : 'SYNTHESIZING ANSWER'}
                      </span>
                      <span className="inline-flex gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </div>
                  )}

                  {/* Interactive Follow-Up Suggestions */}
                  {!msg.isUser && msg.text && msg.text.trim().length > 0 && msg.suggestions && msg.suggestions.length > 0 && !isGenerating && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Continue Studying:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.slice(0, 3).map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/25 hover:border-cyan-400/50 text-xs text-cyan-200 font-medium text-left transition-all active:scale-98"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Footer: Copy Answer */}
                  {!msg.isUser && msg.text && msg.text.trim().length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex flex-col gap-0.5 text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <BookCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>
                            {msg.source ||
                              (isZim
                                ? `ZIMSEC ${contentLevel} Syllabus Curriculum`
                                : isBw
                                ? `BEC ${activeTier.shortLabel} Syllabus Curriculum`
                                : `ZEXA AI · ${country} (${activeTier.label})`)}
                          </span>
                        </div>
                        {msg.metrics && (
                          <span className="text-[10px] text-slate-500 pl-5">{msg.metrics}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="inline-flex items-center gap-1 px-2.5 min-h-[34px] rounded-lg hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white transition-all text-xs font-medium"
                          title="Copy Answer to Clipboard"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
              <span>You have used your {dailyLimit} free offline queries for today.</span>
            </div>
            <button
              onClick={onOpenPremium}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95 whitespace-nowrap"
            >
              Enter Code / Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Command Bar / Input Dock */}
      <div className="px-3 sm:px-6 pb-2 max-w-4xl w-full mx-auto space-y-1.5 shrink-0">
        {/* Study Mode Selector + Math/Science Symbol Pad Toggle */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none px-0.5">
          <div className="flex items-center gap-1">
            {TUTOR_MODE_OPTIONS.map((mode) => {
              const active = tutorMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTutorMode(mode.id)}
                  title={mode.shortDesc}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowSymbolPad(!showSymbolPad)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all whitespace-nowrap shrink-0 border ${
              showSymbolPad
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/[0.03] text-slate-300 hover:text-white border-white/[0.08]'
            }`}
            title="Toggle Math & Science Symbols Keypad"
          >
            ∑ √ π Symbols
          </button>
        </div>

        {/* Collapsible Math & Science Symbol Keypad */}
        {showSymbolPad && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/25">
            {MATH_SCIENCE_SYMBOLS.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => handleInsertSymbol(sym)}
                className="min-w-[34px] h-8 px-2 rounded-lg bg-white/[0.05] hover:bg-cyan-500/25 border border-white/[0.08] text-xs font-mono font-bold text-cyan-200 transition-colors shrink-0"
              >
                {sym}
              </button>
            ))}
          </div>
        )}

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
              className="flex-1 bg-transparent px-3.5 min-h-[42px] text-sm text-white placeholder-slate-400 outline-none font-sans"
            />

            {isGenerating ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-3.5 min-h-[42px] rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 shrink-0"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 min-h-[42px] rounded-xl btn-primary-gradient disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1.5 shrink-0 active:scale-95"
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

