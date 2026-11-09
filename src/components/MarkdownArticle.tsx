import React from 'react';
import { AlertCircle, Lightbulb, BookOpen, CheckCircle, ChevronRight, Hash } from 'lucide-react';

interface MarkdownArticleProps {
  content: string;
}

export const MarkdownArticle: React.FC<MarkdownArticleProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = (key: string) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(1).filter((r) => !r.includes('---'));

    const parseCells = (row: string) =>
      row
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1 || c.length > 0);

    const headers = parseCells(headerRow);

    elements.push(
      <div key={key} className="my-5 overflow-x-auto rounded-2xl border border-white/[0.08] bg-slate-950/60 shadow-lg">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-cyan-950/40 border-b border-cyan-500/20 text-cyan-300 font-mono">
              {headers.map((h, i) => (
                <th key={i} className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px]">
                  {formatInlineText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {dataRows.map((dr, rIdx) => {
              const cells = parseCells(dr);
              return (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                  {cells.map((c, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2.5 text-slate-200">
                      {formatInlineText(c)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const formatInlineText = (text: string) => {
    // Process bold, italics, inline code, and inline math
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-white tracking-wide">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-cyan-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return (
          <span key={index} className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/20 text-emerald-300 font-semibold">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if table line
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable(`table_${i}`);
    }

    if (!trimmed) {
      elements.push(<div key={`spacer_${i}`} className="h-3" />);
      continue;
    }

    // Horizontal Divider
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <hr key={`hr_${i}`} className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1_${i}`} className="text-xl sm:text-2xl font-black text-white mt-6 mb-3 tracking-tight flex items-center gap-2 border-b border-white/[0.08] pb-2">
          <BookOpen className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{formatInlineText(trimmed.replace(/^#\s+/, ''))}</span>
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2_${i}`} className="text-lg sm:text-xl font-extrabold text-cyan-300 mt-5 mb-2.5 tracking-tight flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-cyan-400" />
          <span>{formatInlineText(trimmed.replace(/^##\s+/, ''))}</span>
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3_${i}`} className="text-base sm:text-lg font-bold text-slate-100 mt-4 mb-2 flex items-center gap-1.5">
          <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{formatInlineText(trimmed.replace(/^###\s+/, ''))}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4_${i}`} className="text-sm sm:text-base font-semibold text-slate-200 mt-3 mb-1.5">
          {formatInlineText(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      continue;
    }

    // Callout / Examiner Warning
    if (trimmed.startsWith('⚠️') || trimmed.toLowerCase().includes('examiner warning') || trimmed.toLowerCase().includes('common mistake') || trimmed.toLowerCase().includes('pitfall')) {
      elements.push(
        <div key={`warn_${i}`} className="my-3.5 p-3.5 sm:p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{formatInlineText(trimmed.replace(/^⚠️\s*/, ''))}</div>
        </div>
      );
      continue;
    }

    // Callout / Tip
    if (trimmed.startsWith('💡') || trimmed.toLowerCase().includes('exam tip') || trimmed.toLowerCase().includes('key rule')) {
      elements.push(
        <div key={`tip_${i}`} className="my-3.5 p-3.5 sm:p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
          <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{formatInlineText(trimmed.replace(/^💡\s*/, ''))}</div>
        </div>
      );
      continue;
    }

    // Math Equation Block ($$...$$)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      const eq = trimmed.slice(2, -2).trim();
      elements.push(
        <div key={`eq_${i}`} className="my-3 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center font-mono text-xs sm:text-sm text-cyan-200 font-semibold shadow-inner">
          {eq}
        </div>
      );
      continue;
    }

    // List Items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`li_${i}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1 sm:pl-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
          <div>{formatInlineText(trimmed.replace(/^[-*]\s+/, ''))}</div>
        </div>
      );
      continue;
    }

    // Numbered List Items
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      const num = match ? match[1] : '';
      const text = match ? match[2] : trimmed;
      elements.push(
        <div key={`ol_${i}`} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1 sm:pl-2">
          <span className="font-mono text-xs font-bold text-cyan-400 shrink-0 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/20">
            {num}
          </span>
          <div>{formatInlineText(text)}</div>
        </div>
      );
      continue;
    }

    // Standard Paragraph
    elements.push(
      <p key={`p_${i}`} className="my-1.5 text-xs sm:text-[14.5px] text-slate-300 leading-relaxed font-sans">
        {formatInlineText(trimmed)}
      </p>
    );
  }

  if (inTable) {
    flushTable('table_end');
  }

  return <div className="space-y-1">{elements}</div>;
};
