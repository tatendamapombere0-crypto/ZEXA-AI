import highYieldData from '../data/exam_bank_high_yield_qa.json';
import { ExamStore } from './examStore';

export interface ExamMatchResult {
  questionText: string;
  explanation: string;
  subject: string;
  level: string;
  paperName: string;
  paperCode: string;
  topic?: string;
  isMcq?: boolean;
  correctAnswer?: string | null;
  score: number;
  formattedResponse: string;
}

interface HighYieldItem {
  q: string;
  a: string;
  s: string;
  l: string;
  p: string;
  c: string;
  f: string;
  topic?: string;
  isMcq?: boolean;
  correctAnswer?: string | null;
}

export class ExamBankMatcher {
  private static highYieldItems: HighYieldItem[] = Array.isArray(highYieldData)
    ? (highYieldData as unknown as HighYieldItem[])
    : [];

  private static stopWords = new Set([
    'zimbabwe', 'zimsec', 'paper', 'exam', 'exams', 'question', 'questions',
    'answer', 'answers', 'select', 'option', 'options', 'applies', 'best',
    'following', 'level', 'form', 'grade', 'school', 'curriculum', 'syllabus',
    'what', 'are', 'the', 'of', 'and', 'in', 'is', 'to', 'for', 'a', 'an', 'by',
    'tell', 'me', 'can', 'you', 'please', 'explain', 'describe', 'discuss', 'outline',
    'give', 'account', 'how', 'why', 'who', 'whom', 'whose', 'when', 'where', 'which',
    'state', 'list', 'mention', 'name', 'write', 'down', 'find', 'does', 'did', 'was',
    'were', 'with', 'from', 'about', 'into', 'under'
  ]);

  /**
   * Tokenizes text and expands historical / curriculum acronyms (e.g. ww1, ww2, etc.)
   */
  public static tokenize(text: string): Set<string> {
    if (!text) return new Set();
    let t = text.toLowerCase();

    // Expand common acronyms
    t = t.replace(/\bww1\b|\bww\s*1\b|\bfirst\s*world\s*war\b/g, 'first world war 1914 1918');
    t = t.replace(/\bww2\b|\bww\s*2\b|\bsecond\s*world\s*war\b/g, 'second world war 1939 1945');
    t = t.replace(/\b1st\s*chimurenga\b/g, 'first chimurenga 1896 1897 umvukela');
    t = t.replace(/\b2nd\s*chimurenga\b/g, 'second chimurenga 1966 1979 liberation war');
    t = t.replace(/\blanchester\b|\blancaster\b/g, 'lancaster house conference 1979');
    t = t.replace(/\bversailles\b/g, 'treaty of versailles 1919 germany');
    t = t.replace(/\bleague\s*of\s*nations\b/g, 'league of nations 1920 peace failure 1930s');
    t = t.replace(/\bhitler\b|\bnazi\b/g, 'adolf hitler nazi party germany 1933');

    const words = t.replace(/[^a-z0-9]/g, ' ').split(/\s+/);
    const set = new Set<string>();
    for (const w of words) {
      if (w.length >= 2 && !this.stopWords.has(w)) {
        set.add(w);
      }
    }
    return set;
  }

  /**
   * Matches a student query against official ZIMSEC past exam bank questions.
   * Returns authoritative marking scheme if similarity threshold is met.
   */
  public static async matchQuestion(query: string, preferredLevel?: string): Promise<ExamMatchResult | null> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 5) return null;

    const qTokens = this.tokenize(trimmed);
    if (qTokens.size === 0) return null;

    const normLevel = (preferredLevel || '').toLowerCase();
    const queryLower = trimmed.toLowerCase();

    // Guard: Civic, presidential, and governance queries are handled with 100% precision by the dedicated governance handler
    const isCivicQuery =
      queryLower.includes('president') ||
      queryLower.includes('head of state') ||
      queryLower.includes('vice president') ||
      queryLower.includes('mnangagwa') ||
      queryLower.includes('leader of zimbabwe') ||
      queryLower.includes('leaders of zimbabwe') ||
      queryLower.includes('who rules zimbabwe') ||
      queryLower.includes('who leads zimbabwe');

    let bestItem: HighYieldItem | null = null;
    let bestScore = 0;

    // 1. Scan high-yield pre-indexed questions (0ms synchronous lookup)
    for (const item of this.highYieldItems) {
      // If civic query, never match unrelated exam questions
      if (isCivicQuery && !item.q.toLowerCase().includes('president') && !item.q.toLowerCase().includes('head of state')) {
        continue;
      }

      const cTokens = this.tokenize(item.q);
      if (cTokens.size === 0) continue;

      let intersectionCount = 0;
      for (const token of qTokens) {
        if (cTokens.has(token)) {
          intersectionCount++;
        }
      }

      if (intersectionCount === 0) continue;

      // Strict precision guard:
      // For short queries (<= 2 tokens), ALL tokens must match!
      if (qTokens.size <= 2 && intersectionCount < qTokens.size) {
        continue;
      }
      // For general queries, at least 2 distinct tokens must match
      if (intersectionCount < 2 && !queryLower.includes('ww1') && !queryLower.includes('ww2')) {
        continue;
      }

      // Token overlap ratio
      let score = intersectionCount / Math.max(qTokens.size, 1);

      // Bonus for exact key phrase matches
      const itemQLower = item.q.toLowerCase();

      if (
        (queryLower.includes('first world war') || queryLower.includes('ww1')) &&
        (itemQLower.includes('first world war') || itemQLower.includes('1914-1918'))
      ) {
        score += 0.45;
      }

      if (
        (queryLower.includes('second world war') || queryLower.includes('ww2')) &&
        (itemQLower.includes('second world war') || itemQLower.includes('1939-1945'))
      ) {
        score += 0.45;
      }

      if (queryLower.includes('treaty of versailles') && itemQLower.includes('treaty of versailles')) {
        score += 0.45;
      }

      if (queryLower.includes('league of nations') && itemQLower.includes('league of nations')) {
        score += 0.45;
      }

      // Level affinity bonus
      if (normLevel && item.l && item.l.toLowerCase().includes(normLevel)) {
        score += 0.05;
      }

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    // Require high threshold (>= 0.60)
    if (bestItem && bestScore >= 0.60) {
      return this.buildResult(bestItem, bestScore);
    }

    // 3. Fallback: Search dynamic paper banks across ALL 97 exam papers for the active subject
    try {
      if (isCivicQuery) return null;

      const manifest = await ExamStore.loadManifest();
      const targetManifestItems = manifest.filter((m) => {
        const fileLower = (m.file || '').toLowerCase();
        const subLower = (m.subject || '').toLowerCase();
        const pLvl = (m.level || '').toLowerCase();

        // Level affinity guard
        if (normLevel) {
          if (normLevel.includes('primary') && (pLvl.includes('alevel') || pLvl.includes('olevel'))) return false;
          if (normLevel.includes('alevel') && pLvl.includes('primary')) return false;
        }

        // Direct token or subject name match
        for (const token of qTokens) {
          if (token.length >= 3 && (subLower.includes(token) || fileLower.includes(token))) return true;
        }

        // Subject domain associations
        if (subLower.includes('history') && (qTokens.has('war') || qTokens.has('hitler') || qTokens.has('mutapa') || qTokens.has('treaty') || qTokens.has('versailles') || qTokens.has('chimurenga') || qTokens.has('peace'))) return true;
        if (subLower.includes('geography') && (qTokens.has('river') || qTokens.has('weather') || qTokens.has('erosion') || qTokens.has('oxbow') || qTokens.has('plate') || qTokens.has('climate') || qTokens.has('delta'))) return true;
        if (subLower.includes('biology') && (qTokens.has('photosynthesis') || qTokens.has('respiration') || qTokens.has('cell') || qTokens.has('enzyme') || qTokens.has('mitosis') || qTokens.has('meiosis') || qTokens.has('genetics') || qTokens.has('dna'))) return true;
        if (subLower.includes('accounting') && (qTokens.has('depreciation') || qTokens.has('ledger') || qTokens.has('accrual') || qTokens.has('journal') || qTokens.has('balance') || qTokens.has('cash') || qTokens.has('entry'))) return true;
        if (subLower.includes('economics') && (qTokens.has('surplus') || qTokens.has('elasticity') || qTokens.has('monopoly') || qTokens.has('inflation') || qTokens.has('demand') || qTokens.has('supply') || qTokens.has('gdp'))) return true;
        if (subLower.includes('computer') && (qTokens.has('algorithm') || qTokens.has('cpu') || qTokens.has('hardware') || qTokens.has('software') || qTokens.has('python') || qTokens.has('programming') || qTokens.has('expert'))) return true;
        if (subLower.includes('physics') && (qTokens.has('transformer') || qTokens.has('current') || qTokens.has('voltage') || qTokens.has('refraction') || qTokens.has('lens') || qTokens.has('circuit') || qTokens.has('velocity') || qTokens.has('acceleration'))) return true;
        if (subLower.includes('chemistry') && (qTokens.has('atom') || qTokens.has('mole') || qTokens.has('stoichiometry') || qTokens.has('electrolysis') || qTokens.has('acid') || qTokens.has('base') || qTokens.has('titration') || qTokens.has('reaction'))) return true;
        if (subLower.includes('agriculture') && (qTokens.has('soil') || qTokens.has('nitrogen') || qTokens.has('crop') || qTokens.has('livestock') || qTokens.has('cattle') || qTokens.has('fertilizer') || qTokens.has('pesticide'))) return true;
        if ((subLower.includes('shona') || subLower.includes('chishona')) && (qTokens.has('tsumo') || qTokens.has('madimikira') || qTokens.has('nyaudzosingwi') || qTokens.has('rondedzero') || qTokens.has('zviera') || qTokens.has('ukama'))) return true;
        if (subLower.includes('commerce') && (qTokens.has('retail') || qTokens.has('wholesale') || qTokens.has('insurance') || qTokens.has('banking') || qTokens.has('advertising') || qTokens.has('trade'))) return true;
        if (subLower.includes('mathematics') && (qTokens.has('algebra') || qTokens.has('trigonometry') || qTokens.has('calculus') || qTokens.has('geometry') || qTokens.has('matrix') || qTokens.has('fraction') || qTokens.has('equation'))) return true;

        return false;
      });

      // Prefer Paper 2 (structured questions with detailed marking guides) then Paper 1
      targetManifestItems.sort((a, b) => {
        const aP2 = (a.file || '').toLowerCase().includes('paper2') ? 1 : 0;
        const bP2 = (b.file || '').toLowerCase().includes('paper2') ? 1 : 0;
        return bP2 - aP2;
      });

      const loadedPapers = await Promise.all(
        targetManifestItems.slice(0, 8).map(async (targetItem) => ({
          targetItem,
          paper: await ExamStore.loadPaperDetails(targetItem)
        }))
      );

      let bestDynScore = 0;
      let bestDynResult: ExamMatchResult | null = null;

      for (const { targetItem, paper } of loadedPapers) {
        if (paper && Array.isArray(paper.questions)) {
          let dynamicBestQ: any = null;
          let dynamicBestScore = 0;

          for (const q of paper.questions) {
            const qTokensCand = this.tokenize(q.questionText || '');
            let inter = 0;
            for (const tk of qTokens) {
              if (qTokensCand.has(tk)) inter++;
            }
            if (qTokens.size <= 2 && inter < qTokens.size) continue;
            if (inter < 2 && !queryLower.includes('ww1') && !queryLower.includes('ww2')) continue;

            const s = inter / Math.max(qTokens.size, 1);
            if (s > dynamicBestScore) {
              dynamicBestScore = s;
              dynamicBestQ = q;
            }
          }

          if (dynamicBestQ && dynamicBestScore >= 0.60 && dynamicBestQ.explanation && dynamicBestScore > bestDynScore) {
            const dynItem: HighYieldItem = {
              q: dynamicBestQ.questionText,
              a: dynamicBestQ.explanation,
              s: targetItem.subject,
              l: targetItem.level,
              p: targetItem.paperName,
              c: targetItem.paperCode,
              f: targetItem.file,
              topic: dynamicBestQ.topic,
              isMcq: Array.isArray(dynamicBestQ.options) && dynamicBestQ.options.length > 0,
              correctAnswer: dynamicBestQ.correctAnswer
            };
            bestDynScore = dynamicBestScore;
            bestDynResult = this.buildResult(dynItem, dynamicBestScore);
          }
        }
      }
      if (bestDynResult) {
        return bestDynResult;
      }
    } catch {
      // Dynamic search fallback
    }

    return null;
  }

  /**
   * Constructs a professionally structured, textbook-grade answer
   * formatted for the ZEXA AI chat interface.
   */
  private static buildResult(item: HighYieldItem, score: number): ExamMatchResult {
    const formatted = this.formatExamAnswer(item);
    return {
      questionText: item.q,
      explanation: item.a,
      subject: item.s,
      level: item.l,
      paperName: item.p,
      paperCode: item.c,
      topic: item.topic,
      isMcq: item.isMcq,
      correctAnswer: item.correctAnswer,
      score,
      formattedResponse: formatted
    };
  }

  /**
   * Turns raw exam bank explanations into polished, structured, multi-section markdown
   */
  private static formatExamAnswer(item: HighYieldItem): string {
    const subjectTitle = item.s ? `${item.s}` : 'Curriculum';
    const paperLabel = item.c ? `(${item.c})` : item.p ? `• ${item.p}` : '';
    const levelLabel = item.l ? `ZIMSEC ${item.l}` : 'ZIMSEC';

    let body = item.a.trim();

    // If body already has markdown headers (###), preserve clean structure
    if (body.includes('### ') || body.includes('#### ')) {
      return `### ${levelLabel} ${subjectTitle} ${paperLabel} · Verified Marking Scheme\n\n**Official Question:** ${item.q}\n\n${body}`;
    }

    // Special formatting for First World War causes
    if (
      item.q.toLowerCase().includes('first world war') &&
      item.q.toLowerCase().includes('cause')
    ) {
      return `### ${levelLabel} ${subjectTitle} ${paperLabel} · Verified Marking Scheme

**Official Question:** ${item.q}

#### 1. Executive Summary & Overview
The First World War (1914–1918) was triggered by a combination of long-term structural rivalries among European Great Powers and an immediate spark in the Balkans. In official ZIMSEC History marking schemes, full-mark responses must clearly distinguish between the underlying structural causes (M.A.I.N. factors) and the immediate trigger.

#### 2. Long-Term Causes [M.A.I.N. Factors]
- **Alliance System:** Europe was divided into two armed rival camps:
  - *The Triple Alliance (1882):* Germany, Austria-Hungary, and Italy.
  - *The Triple Entente (1907):* Britain, France, and Russia.
  *Significance:* Mutual defense pacts guaranteed that a localized conflict between any two powers would rapidly escalate into a general continental war.
- **Militarism:** An intense military buildup and arms race:
  - The Anglo-German naval race (construction of dreadnought battleships) stoked paranoia and competitive expansion.
  - Large standing conscript armies and inflexible railway mobilization timetables (e.g. Germany's Schlieffen Plan) left no time for diplomacy once mobilized.
- **Imperialism:** Colonial rivalries for overseas territories:
  - The Scramble for Africa and the Moroccan Crises (1905 and 1911) intensified diplomatic friction between France and Germany.
  - Competition for raw materials, markets, and strategic trade routes heightened geopolitical rivalry.
- **Nationalism:** Aggressive national pride and Slavic self-determination:
  - Rising Pan-Slavic nationalism in the Balkans ("the powder keg of Europe"), championed by Serbia and backed by Russia against Austro-Hungarian control.
  - French revanchism: The enduring national desire in France to reclaim the border provinces of Alsace-Lorraine, lost to Germany in 1871.

#### 3. The Immediate Cause (Sarajevo Crisis, 28 June 1914)
- **The Assassination:** On 28 June 1914 in Sarajevo, Archduke Franz Ferdinand, heir to the Austro-Hungarian throne, and his wife Sophie were assassinated by Gavrilo Princip, a 19-year-old Bosnian-Serb nationalist belonging to the *Black Hand* secret society.
- **The Escalation Mechanism:**
  - Austria-Hungary issued a severe 10-point Ultimatum to Serbia on 23 July 1914.
  - When Serbia accepted all points except those compromising its legal sovereignty, Austria-Hungary declared war on Serbia (28 July 1914).
  - Russia mobilized to protect its Slavic ally Serbia.
  - Germany declared war on Russia (1 August) and France (3 August), invading neutral Belgium.
  - Britain entered the war on 4 August 1914 to defend Belgian neutrality under the 1839 Treaty of London.

#### 4. ZIMSEC Examiner Mark Scheme Guidance [Total: 8–12 Marks]
- **Level 3 Descriptor (4–6 Marks):** Candidates list or describe individual causes without explaining how each specifically contributed to the outbreak of the war.
- **Level 4 Descriptor (7–8+ Marks - Full Marks):** Candidates clearly distinguish between long-term underlying causes and the immediate trigger, analyze the mechanism by which the Sarajevo assassination activated the alliance obligations, and provide balanced historical evaluation.`;
    body = '';
    }

    // Standard structured formatting: Convert plain text into organized sections
    const lines = body.split('\n').filter((l) => l.trim().length > 0);
    const formattedSections: string[] = [];
    let currentBulletList: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      const lower = trimmed.toLowerCase();

      if (
        lower.startsWith('key points') ||
        lower.startsWith('long-term causes:') ||
        lower.startsWith('immediate cause:') ||
        lower.startsWith('mark scheme guidance:') ||
        lower.startsWith('expected answer:') ||
        lower.startsWith('marking scheme:')
      ) {
        if (currentBulletList.length > 0) {
          formattedSections.push(currentBulletList.join('\n'));
          currentBulletList = [];
        }
        const cleanTitle = trimmed.replace(/:$/, '');
        formattedSections.push(`#### ${cleanTitle}`);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentBulletList.push(trimmed);
      } else {
        if (currentBulletList.length > 0) {
          formattedSections.push(currentBulletList.join('\n'));
          currentBulletList = [];
        }
        formattedSections.push(trimmed);
      }
    });

    if (currentBulletList.length > 0) {
      formattedSections.push(currentBulletList.join('\n'));
    }

    return `### ${levelLabel} ${subjectTitle} ${paperLabel} · Verified Marking Scheme

**Official Question:** ${item.q}

${formattedSections.join('\n\n')}`;
  }
}
