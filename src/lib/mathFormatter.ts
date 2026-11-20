/**
 * Universal Textbook Math & Formula Formatter
 * Converts raw LaTeX commands (\text{}, \frac{}{}, \quad, \sqrt{}, Greek letters,
 * display delimiters ((...)), $$...$$, \[...\], \(...\)) into clean Unicode
 * textbook notation with zero raw backslashes, while preserving currency amounts ($5, $120).
 */

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  'n': 'ⁿ',
  'i': 'ⁱ'
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  'a': 'ₐ',
  'e': 'ₑ',
  'i': 'ᵢ',
  'k': 'ₖ',
  'n': 'ₙ',
  'x': 'ₓ'
};

const GREEK_AND_SYMBOLS: Array<[RegExp, string]> = [
  [/\\rightleftharpoons(?![a-zA-Z])/g, '⇌'],
  [/\\leftrightarrow(?![a-zA-Z])/g, '↔'],
  [/\\Longleftrightarrow(?![a-zA-Z])/g, '⟺'],
  [/\\Leftrightarrow(?![a-zA-Z])/g, '⇔'],
  [/\\iff(?![a-zA-Z])/g, '⇔'],
  [/\\implies(?![a-zA-Z])/g, '⇒'],
  [/\\Rightarrow(?![a-zA-Z])/g, '⇒'],
  [/\\rightarrow(?![a-zA-Z])/g, '→'],
  [/\\leftarrow(?![a-zA-Z])/g, '←'],
  [/\\to(?![a-zA-Z])/g, '→'],
  [/\\times(?![a-zA-Z])/g, '×'],
  [/\\div(?![a-zA-Z])/g, '÷'],
  [/\\cdot(?![a-zA-Z])/g, '·'],
  [/\\pm(?![a-zA-Z])/g, '±'],
  [/\\mp(?![a-zA-Z])/g, '∓'],
  [/\\approx(?![a-zA-Z])/g, '≈'],
  [/\\equiv(?![a-zA-Z])/g, '≡'],
  [/\\neq(?![a-zA-Z])/g, '≠'],
  [/\\leq(?![a-zA-Z])/g, '≤'],
  [/\\geq(?![a-zA-Z])/g, '≥'],
  [/\\propto(?![a-zA-Z])/g, '∝'],
  [/\\infty(?![a-zA-Z])/g, '∞'],
  [/\\perp(?![a-zA-Z])/g, '⊥'],
  [/\\parallel(?![a-zA-Z])/g, '∥'],
  [/\\angle(?![a-zA-Z])/g, '∠'],
  [/\\triangle(?![a-zA-Z])/g, '△'],
  [/\\circ(?![a-zA-Z])/g, '°'],
  [/\\degree(?![a-zA-Z])/g, '°'],
  [/\\Delta(?![a-zA-Z])/g, 'Δ'],
  [/\\delta(?![a-zA-Z])/g, 'δ'],
  [/\\Sigma(?![a-zA-Z])/g, 'Σ'],
  [/\\sum(?![a-zA-Z])/g, '∑'],
  [/\\int(?![a-zA-Z])/g, '∫'],
  [/\\prod(?![a-zA-Z])/g, '∏'],
  [/\\Psi(?![a-zA-Z])/g, 'Ψ'],
  [/\\Omega(?![a-zA-Z])/g, 'Ω'],
  [/\\omega(?![a-zA-Z])/g, 'ω'],
  [/\\theta(?![a-zA-Z])/g, 'θ'],
  [/\\Theta(?![a-zA-Z])/g, 'Θ'],
  [/\\pi(?![a-zA-Z])/g, 'π'],
  [/\\mu(?![a-zA-Z])/g, 'μ'],
  [/\\alpha(?![a-zA-Z])/g, 'α'],
  [/\\beta(?![a-zA-Z])/g, 'β'],
  [/\\gamma(?![a-zA-Z])/g, 'γ'],
  [/\\lambda(?![a-zA-Z])/g, 'λ'],
  [/\\rho(?![a-zA-Z])/g, 'ρ'],
  [/\\sigma(?![a-zA-Z])/g, 'σ'],
  [/\\phi(?![a-zA-Z])/g, 'φ'],
  [/\\varepsilon(?![a-zA-Z])/g, 'ε'],
  [/\\ell(?![a-zA-Z])/g, 'ℓ'],
  [/\\lim(?![a-zA-Z])/g, 'lim'],
  [/\\sin(?![a-zA-Z])/g, 'sin'],
  [/\\cos(?![a-zA-Z])/g, 'cos'],
  [/\\tan(?![a-zA-Z])/g, 'tan'],
  [/\\log(?![a-zA-Z])/g, 'log'],
  [/\\ln(?![a-zA-Z])/g, 'ln'],
  [/\\qquad/g, '   '],
  [/\\quad/g, '  '],
  [/\\[,;:!]/g, ' '],
  [/\\%/g, '%'],
  [/\\\$/g, '$'],
  [/\\left\s*([(\[|])/g, '$1'],
  [/\\right\s*([)\]|])/g, '$1'],
  [/\\left\./g, ''],
  [/\\right\./g, '']
];

/**
 * Extracts one {...} argument starting at `openBraceIdx`, supporting arbitrary nesting.
 */
function readBraceGroup(str: string, openBraceIdx: number): { content: string; endIdx: number } | null {
  if (openBraceIdx >= str.length || str[openBraceIdx] !== '{') return null;
  let depth = 0;
  for (let i = openBraceIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(openBraceIdx + 1, i),
          endIdx: i + 1
        };
      }
    }
  }
  return null;
}

function readOptionalBracketGroup(str: string, openIdx: number): { content: string; endIdx: number } | null {
  if (openIdx >= str.length || str[openIdx] !== '[') return null;
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '[') depth++;
    else if (str[i] === ']') {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(openIdx + 1, i),
          endIdx: i + 1
        };
      }
    }
  }
  return null;
}

function skipSpaces(str: string, idx: number): number {
  let i = idx;
  while (i < str.length && (str[i] === ' ' || str[i] === '\t')) i++;
  return i;
}

function toSuperscript(raw: string): string | null {
  if (raw === '\\circ' || raw === '°') return '°';
  if (!raw) return null;
  let out = '';
  for (const ch of raw) {
    if (SUPERSCRIPT_MAP[ch]) out += SUPERSCRIPT_MAP[ch];
    else return null;
  }
  return out;
}

function toSubscript(raw: string): string | null {
  if (!raw) return null;
  let out = '';
  for (const ch of raw) {
    if (SUBSCRIPT_MAP[ch]) out += SUBSCRIPT_MAP[ch];
    else return null;
  }
  return out;
}

function needsParensForFraction(expr: string): boolean {
  const trimmed = expr.trim();
  if (!trimmed) return false;
  // Don't wrap simple plain words like "Image Size", "Actual Size", "Profit", "1", "2", "I", "A", "Q", "t"
  if (/^[A-Za-z0-9.\s°%]+$/.test(trimmed) && !/[+\-*/=]/.test(trimmed)) {
    return false;
  }
  if (
    (trimmed.startsWith('(') && trimmed.endsWith(')')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return false;
  }
  return /[+\-*/]/.test(trimmed);
}

/**
 * Recursively transforms LaTeX structural commands (with nested braces) into clean textbook text.
 */
function transformLatexCore(input: string, depth: number = 0): string {
  if (!input || depth > 8) return input;
  let s = input;

  // 0. Replace unambiguous Greek/arrow/symbol tokens first (before unwrapping \text{m} beside \mu)
  for (const [pattern, replacement] of GREEK_AND_SYMBOLS) {
    s = s.replace(pattern, replacement);
  }

  // 1. Handle \text{...}, \mathbf{...}, \mathrm{...}, \mathit{...}, \textbf{...}, \vec{...}
  const wrapperCmds = ['\\text', '\\mathbf', '\\mathrm', '\\mathit', '\\textbf', '\\operatorname'];
  let changed = true;
  let guard = 0;
  while (changed && guard < 20) {
    changed = false;
    guard++;

    for (const cmd of wrapperCmds) {
      const idx = s.indexOf(cmd);
      if (idx !== -1) {
        const afterCmd = skipSpaces(s, idx + cmd.length);
        const grp = readBraceGroup(s, afterCmd);
        if (grp) {
          const inner = transformLatexCore(grp.content, depth + 1);
          s = s.slice(0, idx) + inner + s.slice(grp.endIdx);
          changed = true;
          break;
        }
      }
    }
    if (changed) continue;

    // \vec{F} -> F
    const vecIdx = s.indexOf('\\vec');
    if (vecIdx !== -1) {
      const after = skipSpaces(s, vecIdx + 4);
      const grp = readBraceGroup(s, after);
      if (grp) {
        const inner = transformLatexCore(grp.content, depth + 1);
        s = s.slice(0, vecIdx) + inner + s.slice(grp.endIdx);
        changed = true;
        continue;
      }
    }

    // \xrightarrow[below]{above} or \xrightarrow{above}
    const xarrIdx = s.indexOf('\\xrightarrow');
    if (xarrIdx !== -1) {
      let cursor = skipSpaces(s, xarrIdx + '\\xrightarrow'.length);
      const opt = readOptionalBracketGroup(s, cursor);
      if (opt) cursor = skipSpaces(s, opt.endIdx);
      const above = readBraceGroup(s, cursor);
      if (above) {
        const topText = transformLatexCore(above.content, depth + 1).trim();
        const botText = opt ? transformLatexCore(opt.content, depth + 1).trim() : '';
        const label = [topText, botText].filter(Boolean).join(', ');
        const replacement = label ? `→ (${label})` : '→';
        s = s.slice(0, xarrIdx) + replacement + s.slice(above.endIdx);
        changed = true;
        continue;
      }
    }

    // \frac{num}{den}
    const fracIdx = s.indexOf('\\frac');
    if (fracIdx !== -1) {
      const afterFrac = skipSpaces(s, fracIdx + '\\frac'.length);
      const numGrp = readBraceGroup(s, afterFrac);
      if (numGrp) {
        const afterNum = skipSpaces(s, numGrp.endIdx);
        const denGrp = readBraceGroup(s, afterNum);
        if (denGrp) {
          const numClean = transformLatexCore(numGrp.content, depth + 1).trim();
          const denClean = transformLatexCore(denGrp.content, depth + 1).trim();
          const fmtNum = needsParensForFraction(numClean) ? `(${numClean})` : numClean;
          const fmtDen = needsParensForFraction(denClean) ? `(${denClean})` : denClean;
          s = s.slice(0, fracIdx) + `${fmtNum} / ${fmtDen}` + s.slice(denGrp.endIdx);
          changed = true;
          continue;
        }
      }
    }

    // \sqrt[n]{x} or \sqrt{x}
    const sqrtIdx = s.indexOf('\\sqrt');
    if (sqrtIdx !== -1) {
      let cursor = skipSpaces(s, sqrtIdx + '\\sqrt'.length);
      const opt = readOptionalBracketGroup(s, cursor);
      if (opt) cursor = skipSpaces(s, opt.endIdx);
      const arg = readBraceGroup(s, cursor);
      if (arg) {
        const inner = transformLatexCore(arg.content, depth + 1).trim();
        const prefix = opt ? `${transformLatexCore(opt.content, depth + 1)}√` : '√';
        const wrapped = /^[A-Za-z0-9.]+$/.test(inner) ? inner : `(${inner})`;
        s = s.slice(0, sqrtIdx) + `${prefix}${wrapped}` + s.slice(arg.endIdx);
        changed = true;
        continue;
      }
    }

    // \lim_{h\to 0}
    const limIdx = s.indexOf('\\lim_');
    if (limIdx !== -1) {
      const after = skipSpaces(s, limIdx + 5);
      const grp = readBraceGroup(s, after);
      if (grp) {
        const inner = transformLatexCore(grp.content, depth + 1).trim();
        s = s.slice(0, limIdx) + `lim(${inner}) ` + s.slice(grp.endIdx);
        changed = true;
        continue;
      }
    }
  }

  // 2. Run symbol pass once more in case nested expressions revealed new symbols
  for (const [pattern, replacement] of GREEK_AND_SYMBOLS) {
    s = s.replace(pattern, replacement);
  }

  // 3. Handle braced superscripts and subscripts: ^{...} and _{...}
  s = s.replace(/\^\{([^}]+)\}/g, (_, inner: string) => {
    const cleaned = inner.trim();
    const sup = toSuperscript(cleaned);
    if (sup) return sup;
    return `^(${cleaned})`;
  });

  s = s.replace(/_\{([^}]+)\}/g, (_, inner: string) => {
    const cleaned = inner.trim();
    const sub = toSubscript(cleaned);
    if (sub) return sub;
    return `_${cleaned}`;
  });

  // Simple single-token superscripts/subscripts like x^2, y^3, m·s^-1, H_2O, CO_2, T_n
  s = s.replace(/\^([0-9]+|n)\b/g, (_, exp: string) => toSuperscript(exp) || `^${exp}`);
  s = s.replace(/\^(\+|-)/g, (_, sign: string) => (sign === '+' ? '⁺' : '⁻'));
  s = s.replace(/([A-Za-z])_([0-9]+|n|i|k)\b/g, (_, base: string, sub: string) => {
    const uni = toSubscript(sub);
    return uni ? `${base}${uni}` : `${base}_${sub}`;
  });

  // Clean common chemical/physics formulas
  s = s
    .replace(/H₂O\b|H_2O\b/g, 'H₂O')
    .replace(/CO₂\b|CO_2\b/g, 'CO₂')
    .replace(/C₆H₁₂O₆|C_6H_12O_6/g, 'C₆H₁₂O₆');

  // Remove any remaining stray LaTeX backslashes before words
  s = s.replace(/\\([a-zA-Z]+)/g, '$1');

  // Collapse excess internal horizontal spaces (without touching newlines)
  s = s.replace(/[ \t]{3,}/g, '  ');

  return s;
}

/**
 * Unwraps math delimiters ( (( ... )), \[ ... \], \( ... \), $$ ... $$, and inline $ ... $ )
 * safely without touching real currency ($5, $120, $4 / $5).
 */
export function formatMathNotation(text: string): string {
  if (!text) return '';

  let s = text;

  // 1. Unwrap accidental (( ... )) math blocks when they wrap LaTeX commands (e.g. ((\text{Magnification} = ... )))
  s = s.replace(/\(\(([\s\S]*?)\)\)/g, (full, inner: string) => {
    if (/\\(?:text|frac|quad|sqrt|times|div|rightarrow|xrightarrow|Delta|Psi|theta|pi|Omega|mu|Sigma|lim|int|sum)/.test(inner)) {
      return transformLatexCore(inner.trim());
    }
    return full;
  });

  // 2. Unwrap display \[ ... \] and inline \( ... \)
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner: string) => transformLatexCore(inner.trim()));
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner: string) => transformLatexCore(inner.trim()));

  // 3. Unwrap display $$ ... $$ blocks
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner: string) => transformLatexCore(inner.trim()));

  // 4. Unwrap inline $ ... $ ONLY when it is math notation, NOT currency ($5, $500 + $120)
  s = s.replace(/\$([^$\n]+?)\$/g, (full, inner: string) => {
    const trimmed = inner.trim();
    // If inner starts with digits + optional whitespace + operator, likely "$500 + $120" -> keep $ as currency!
    if (/^\d[\d,.]*\s*[+\-*/=]?/.test(trimmed) && !/[\\^_{}=<>a-zA-Z]{2,}|\\/.test(trimmed)) {
      return full;
    }
    // Check if looks like genuine math/units (has backslash command, ^, _, =, <, >, ≤, ≥, ×, /, %, variable letter)
    const looksLikeMath =
      /\\|\^|_|[=<>≤≥×÷±→⇒⇔]|^[A-Za-z0-9.,\s+\-*/()[\]°%µμΩΔΨπθ]+$/.test(trimmed) &&
      !/^\d[\d,.\s/]*$/.test(trimmed);

    if (looksLikeMath) {
      return transformLatexCore(trimmed);
    }
    return full;
  });

  // 5. Also catch any un-delimited raw LaTeX commands (\text{...}, \frac{...}{...}, \quad, \sqrt{...}, etc.)
  if (/\\(?:text|mathbf|mathrm|mathit|frac|quad|qquad|sqrt|xrightarrow|rightarrow|times|div|pm|neq|leq|geq|approx|circ|Delta|Psi|Omega|pi|theta|mu|alpha|beta|Sigma|lim|int|sum|left|right|vec|to)\b/.test(s)) {
    s = transformLatexCore(s);
  }

  return s;
}
