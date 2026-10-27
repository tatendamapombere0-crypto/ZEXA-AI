import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Bot, User, Copy, Check, Sparkles, BookCheck, AlertCircle } from 'lucide-react';
import { ChatMessage, EducationLevel, SubscriptionStatus } from '../types';
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
  activeExamPrompt?: { question: string; hint?: string } | null;
  onClearActiveExamPrompt?: () => void;
}

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
  activeExamPrompt,
  onClearActiveExamPrompt
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle passed exam prompt from Exam Mode or Study Pack
  useEffect(() => {
    if (activeExamPrompt) {
      setInputText(activeExamPrompt.question);
      if (onClearActiveExamPrompt) onClearActiveExamPrompt();
    }
  }, [activeExamPrompt, onClearActiveExamPrompt]);

  const handleSendMessage = (textToSend?: string, examHint?: string) => {
    const question = (textToSend || inputText).trim();
    if (!question || isGenerating) return;

    // Check access rules
    const check = StorageManager.checkCanQuery();
    if (!check.allowed) {
      onOpenPremium();
      return;
    }

    // Record query use
    StorageManager.recordQueryUsed();
    onQueriesUpdated();

    const userMsgId = `user_${Date.now()}`;
    const aiMsgId = `ai_${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      text: question,
      isUser: true,
      timestamp: Date.now()
    };

    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      text: '',
      isUser: false,
      timestamp: Date.now()
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage, aiPlaceholder];
      StorageManager.saveChatMessages(updated);
      return updated;
    });

    setInputText('');
    setIsGenerating(true);

    let accumulatedText = '';

    AIEngine.generate(question, {
      level: contentLevel,
      hint: examHint,
      onToken: (token) => {
        accumulatedText += token;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: accumulatedText } : m))
        );
      },
      onComplete: (metrics, source) => {
        setIsGenerating(false);
        setMessages((prev) => {
          const finalMessages = prev.map((m) =>
            m.id === aiMsgId ? { ...m, metrics, source } : m
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

  const suggestions = [
    'In which natural farming region of Zimbabwe is Chiredzi located?',
    'Explain the light and dark reactions of photosynthesis.',
    'What were the economic activities of Great Zimbabwe?',
    'Solve 2x² - 5x - 3 = 0 using the quadratic formula.',
    'State Newton’s three laws of motion with examples.',
    'Explain the principle of double entry bookkeeping.'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] pb-18">
      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-3xl w-full mx-auto">
        {/* Android Silicon Valley Welcome Banner */}
        {messages.length === 0 && (
          <div className="my-6 p-5 rounded-2xl bg-[#0e1628] border-2 border-cyan-400/40 glow-cyan-sm text-center shadow-xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center glow-cyan-sm">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-sm md:text-base font-bold text-white tracking-wide uppercase mb-1">
              AM ZEXA AI your OFFLINE EXPERT AI
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed max-w-lg mx-auto">
              Ask me anything you study in ZIMSEC <span className="text-cyan-300 font-bold">{contentLevel}</span>. Be specific in the area you want to research, some words are Universal. <br />
              <span className="text-cyan-400 font-semibold">LETS BEGIN 🎓</span>
            </p>

            {/* Quick Suggestions */}
            <div className="mt-5 text-left">
              <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookCheck className="w-3.5 h-3.5" /> Recommended ZIMSEC Research Topics:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/60 text-slate-200 transition-all hover:text-cyan-300 active:scale-98"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message items */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!msg.isUser && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shrink-0 glow-cyan-sm shadow-md mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                msg.isUser
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                  : 'bg-[#111827] border border-slate-800 text-slate-100 rounded-tl-none'
              }`}
            >
              {/* Message text */}
              {msg.text ? (
                <div className="whitespace-pre-wrap select-text">
                  {msg.text}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-cyan-400 font-medium py-1 animate-pulse">
                  <span>ZEXA IS THINKING</span>
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              )}

              {/* Bot footer: source pill, metrics, and copy button */}
              {!msg.isUser && msg.text && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                  <div className="flex flex-wrap items-center gap-2">
                    {msg.source && (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-sans font-medium text-[10px]">
                        📚 {msg.source}
                      </span>
                    )}
                    {msg.metrics && (
                      <span className="text-slate-400">
                        ⚡ {msg.metrics}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-auto"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {msg.isUser && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 shadow-md mt-0.5">
                <User className="w-4 h-4 text-slate-200" />
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Free limit notice if nearing limit */}
      {subscriptionStatus === 'FREE' && queriesUsedToday >= dailyLimit && (
        <div className="max-w-3xl w-full mx-auto px-4 mb-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You reached your daily limit of {dailyLimit} free questions.</span>
            </div>
            <button
              onClick={onOpenPremium}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Input container */}
      <div className="border-t border-slate-800/80 bg-[#0c1326]/90 backdrop-blur-md px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-3xl w-full mx-auto flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              placeholder={`Ask ZEXA AI about ZIMSEC ${contentLevel} topics...`}
              className="w-full bg-[#111827] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 outline-none transition-all disabled:opacity-60"
            />
          </div>

          {isGenerating ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-1.5 glow-cyan-sm shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
