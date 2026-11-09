import { KnowledgeStore } from './knowledgeStore';

export interface GenerationOptions {
  level: string;
  hint?: string;
  history?: Array<{ question: string; answer: string }>;
  engineType?: 'zexa-instant';
  onToken: (token: string) => void;
  onComplete: (metrics: string, source?: string, suggestions?: string[]) => void;
  onError: (error: string) => void;
}

interface SynthesisResult {
  text: string;
  sourceTag: string;
  suggestions: string[];
}

type QuestionIntent =
  | 'GREETING'
  | 'IDENTITY'
  | 'GRATITUDE'
  | 'CAUSES'
  | 'EFFECTS'
  | 'BIOGRAPHY'
  | 'ROLE'
  | 'COMPARISON'
  | 'PROCESS_MECHANISM'
  | 'DEFINITION'
  | 'DATES_TIMELINE'
  | 'EXAM_PRACTICE'
  | 'GENERAL';

export class AIEngine {
  private static isCancelled = false;

  static stopGeneration(): void {
    this.isCancelled = true;
  }

  /**
   * Detects if the prompt is genuinely in ChiShona (distinguishing English questions that mention Shona historical nouns)
   */
  public static isShonaQuery(query: string): boolean {
    const q = query.toLowerCase().trim();

    // 1. English question starters and command verbs - if present at the start, this is an English query!
    const englishStarters = [
      'what', 'why', 'how', 'who', 'whom', 'whose', 'when', 'where', 'which',
      'explain', 'describe', 'define', 'outline', 'discuss', 'summarize', 'state',
      'list', 'mention', 'calculate', 'solve', 'compare', 'contrast', 'evaluate',
      'analyze', 'identify', 'name', 'differentiate', 'distinguish', 'give', 'tell',
      'can you', 'could you', 'would you', 'is', 'are', 'was', 'were', 'do', 'does',
      'did', 'causes', 'cause', 'caused', 'reasons', 'factors', 'effects', 'roles',
      'role', 'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'show me', 'write down', 'find', 'simplify', 'determine', 'prove', 'verify'
    ];
    for (const starter of englishStarters) {
      if (q === starter || q.startsWith(`${starter} `) || q.startsWith(`${starter}'`)) {
        return false;
      }
    }

    // 2. High-frequency English syntax markers (articles, prepositions, connecting words)
    const englishSyntaxMarkers = [
      ' the ', ' of ', ' and ', ' in ', ' on ', ' for ', ' with ', ' from ',
      ' that ', ' this ', ' these ', ' those ', ' between ', ' about ', ' during ',
      ' into ', ' under ', ' against ', ' led to ', ' caused by ', ' caused ',
      ' difference ', ' first ', ' second ', ' third ', ' primary ', ' grade ',
      ' school ', ' exam ', ' paper ', ' questions ', ' answers '
    ];
    let englishMarkerCount = 0;
    for (const marker of englishSyntaxMarkers) {
      if (q.includes(marker)) englishMarkerCount++;
    }
    if (englishMarkerCount >= 1 && (q.startsWith('the ') || q.includes(' the ') || q.includes(' of ') || q.includes(' caused '))) {
      return false;
    }

    // 3. Genuine ChiShona grammatical question stems, pronouns, interrogatives & verbs
    const shonaQuestionStarters = [
      'ndiani', 'vaive ani', 'aive ani', 'chii', 'sei', 'nei', 'kupi', 'kupiko',
      'riini', 'tsanangura', 'nyora', 'taura', 'doma', 'ndipe', 'ndiudze',
      'zvikonzero zve', 'zvakakonzera', 'chikonzero che', 'ndeapi', 'ndeipi',
      'ndechipi', 'zvirevo', 'tsumo', 'madimikira', 'nzwisiso', 'rondedzero',
      'makadii', 'masikati', 'mangwanani', 'unhu hwe', 'chinonzi chii',
      'zvinorevei', 'basa ra', 'mitemo ye', 'marudzi e'
    ];
    if (shonaQuestionStarters.some((sq) => q === sq || q.startsWith(`${sq} `) || q.includes(` ${sq} `))) {
      return true;
    }

    // 4. Standalone authentic ChiShona keywords
    const authenticShonaKeywords = [
      'ndiani', 'vaive ani', 'chii', 'tsanangura', 'zvakakonzera', 'zvikonzero',
      'zvirwere', 'zvirimwa', 'nhoroondo', 'madimikira', 'tsumo', 'bvunzo',
      'kudyidzana', 'rusununguko', 'chirevo', 'zvirevo', 'mhinduro', 'mubvunzo',
      'chinonzi', 'zvinoitika', 'chinoshanda', 'kugadzira', 'zvidzidzo',
      'ndeapi', 'ndeipi', 'ndechipi', 'vakaita', 'vakazvarwa'
    ];

    return authenticShonaKeywords.some((kw) => {
      const reg = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i');
      return reg.test(q);
    });
  }

  /**
   * Resolves conversational follow-ups and pronoun references by analyzing preceding turns in history.
   * e.g., "Who led it?" after "What caused the First Chimurenga?" -> "First Chimurenga leaders"
   */
  public static resolveContextualQuery(
    currentQuery: string,
    history?: Array<{ question: string; answer: string }>
  ): { resolvedQuery: string; previousTopic: string; isFollowUp: boolean } {
    const q = currentQuery.trim().toLowerCase();
    if (!history || history.length === 0) {
      return { resolvedQuery: currentQuery, previousTopic: '', isFollowUp: false };
    }

    const lastTurn = history[history.length - 1];
    const prevQ = (lastTurn.question || '').toLowerCase();
    const prevA = (lastTurn.answer || '').slice(0, 300).toLowerCase();

    // Identify previous subject/topic anchor
    let topicAnchor = '';
    if (prevQ.includes('first chimurenga') || prevQ.includes('1st chimurenga') || prevA.includes('first chimurenga')) {
      topicAnchor = 'First Chimurenga';
    } else if (prevQ.includes('second chimurenga') || prevQ.includes('2nd chimurenga') || prevQ.includes('chinhoyi') || prevA.includes('second chimurenga')) {
      topicAnchor = 'Second Chimurenga';
    } else if (prevQ.includes('photosynthesis') || prevA.includes('photosynthesis')) {
      topicAnchor = 'Photosynthesis';
    } else if (prevQ.includes('mugabe') || prevQ.includes('mufabe')) {
      topicAnchor = 'Robert Mugabe';
    } else if (prevQ.includes('nkomo') || prevQ.includes('father zimbabwe')) {
      topicAnchor = 'Joshua Nkomo';
    } else if (prevQ.includes('great zimbabwe') || prevA.includes('great zimbabwe')) {
      topicAnchor = 'Great Zimbabwe';
    } else if (prevQ.includes('mutapa') || prevA.includes('mutapa')) {
      topicAnchor = 'Mutapa Kingdom';
    } else if (prevQ.includes('rozvi') || prevA.includes('rozvi')) {
      topicAnchor = 'Rozvi Empire';
    } else if (prevQ.includes('lobengula') || prevA.includes('lobengula')) {
      topicAnchor = 'King Lobengula';
    } else if (prevQ.includes('mzilikazi') || prevA.includes('mzilikazi')) {
      topicAnchor = 'King Mzilikazi';
    } else if (prevQ.includes('soil erosion') || prevA.includes('soil erosion')) {
      topicAnchor = 'Soil erosion';
    } else if (prevQ.includes('water cycle') || prevA.includes('water cycle')) {
      topicAnchor = 'Water cycle';
    } else if (prevQ.includes('bodmas') || prevA.includes('bodmas')) {
      topicAnchor = 'BODMAS order of operations';
    } else if (prevQ.includes('ohms law') || prevQ.includes("ohm's law")) {
      topicAnchor = "Ohm's Law";
    } else {
      const words = prevQ.split(/[^a-zA-Z0-9]+/).filter(
        (w) => w.length > 3 && !['what', 'when', 'where', 'which', 'explain', 'describe', 'about', 'cause', 'caused', 'tell'].includes(w)
      );
      if (words.length > 0) {
        topicAnchor = words.slice(0, 3).join(' ');
      }
    }

    if (!topicAnchor) {
      return { resolvedQuery: currentQuery, previousTopic: '', isFollowUp: false };
    }

    // Check if current query is a conversational follow-up
    const isPronounFollowUp = /\b(it|they|them|she|he|her|his|that|this|these|those)\b/i.test(q);
    const isShortQuestion =
      q.length < 55 &&
      (q.startsWith('who') ||
        q.startsWith('why') ||
        q.startsWith('where') ||
        q.startsWith('when') ||
        q.startsWith('what happened') ||
        q.startsWith('tell me more') ||
        q.startsWith('explain') ||
        q.startsWith('how') ||
        q.includes('results') ||
        q.includes('effects') ||
        q.includes('leaders') ||
        q.includes('leader') ||
        q.includes('causes'));

    if (isPronounFollowUp || isShortQuestion) {
      let resolved = `${topicAnchor} ${currentQuery}`;
      if (q.includes('who led') || q.includes('who was the leader') || q.includes('who were the leaders') || q.includes('leaders')) {
        resolved = `${topicAnchor} leaders spirit mediums command`;
      } else if (q.includes('lose') || q.includes('lost') || q.includes('defeat') || q.includes('fail') || q.includes('crush') || q.includes('suppress')) {
        resolved = `${topicAnchor} reasons for defeat failure maxim guns`;
      } else if (q.includes('effect') || q.includes('result') || q.includes('consequence') || q.includes('what happened after')) {
        resolved = `${topicAnchor} effects results outcomes consequences`;
      } else if (q.includes('why') || q.includes('cause')) {
        resolved = `${topicAnchor} causes reasons`;
      } else if (q.includes('when') || q.includes('date') || q.includes('year')) {
        resolved = `${topicAnchor} dates years timeline`;
      } else if (q.includes('where')) {
        resolved = `${topicAnchor} location places battle`;
      }
      return { resolvedQuery: resolved, previousTopic: topicAnchor, isFollowUp: true };
    }

    return { resolvedQuery: currentQuery, previousTopic: topicAnchor, isFollowUp: false };
  }

  /**
  /**
   * Main generation entry point powered exclusively by ZEXA Local Brain
   * Delivers sub-second, 100% offline curriculum answers with multi-turn memory
   */
  static async generate(question: string, options: GenerationOptions): Promise<void> {
    this.isCancelled = false;
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      options.onError('Please enter a question');
      return;
    }

    // Pure ZEXA Local Brain with Multi-Turn Memory & Instant Syllabus Retrieval
    await this.generateLocal(trimmedQuestion, options);
  }

  /**
   * Executes the instant, multi-turn aware ZEXA Local Brain
   */
  private static async generateLocal(
    trimmedQuestion: string,
    options: GenerationOptions,
    metricSuffix?: string
  ): Promise<void> {
    const startTime = performance.now();
    let firstTokenTime = 0;

    try {
      // 1. Multi-turn conversational query resolution
      const contextual = this.resolveContextualQuery(trimmedQuestion, options.history);
      const searchEffectiveQuery = contextual.isFollowUp ? contextual.resolvedQuery : trimmedQuestion;

      // 2. RAG search in syllabus knowledge base (strictly filtered by level)
      let matchedChunk: any = null;
      let matchedScore = 0;

      if (!options.hint) {
        let searchResult = await KnowledgeStore.searchScored(searchEffectiveQuery, options.level);
        if (searchResult.results.length > 0 && searchResult.results[0].score >= 350) {
          matchedChunk = searchResult.results[0].chunk;
          matchedScore = searchResult.results[0].score;
        } else {
          // Cross-level fallback: if top score in current level is low or empty, check all curriculum chunks!
          const fallbackSearch = await KnowledgeStore.searchScored(searchEffectiveQuery, 'all');
          if (fallbackSearch.results.length > 0 && (searchResult.results.length === 0 || fallbackSearch.results[0].score > (searchResult.results[0]?.score || 0))) {
            matchedChunk = fallbackSearch.results[0].chunk;
            matchedScore = fallbackSearch.results[0].score;
          } else if (searchResult.results.length > 0) {
            matchedChunk = searchResult.results[0].chunk;
            matchedScore = searchResult.results[0].score;
          }
        }
      }

      // 3. Synthesize conversational, question-tailored response text
      const rawResult = this.synthesizeResponse(
        searchEffectiveQuery,
        options.level,
        matchedChunk,
        matchedScore,
        options.hint,
        options.history
      );

      const cleanedText = this.cleanSymbols(rawResult.text);

      // 4. Stream tokens to UI with realistic offline speed
      const tokens = this.tokenizeText(cleanedText);
      let currentIndex = 0;

      return new Promise<void>((resolve) => {
        const streamNext = () => {
          if (this.isCancelled) {
            options.onComplete('Cancelled by user');
            resolve();
            return;
          }

          if (currentIndex < tokens.length) {
            if (firstTokenTime === 0) firstTokenTime = performance.now();
            const token = tokens[currentIndex++];
            options.onToken(token);

            // Variable streaming speed for natural offline feel
            const delay = Math.min(20, Math.max(4, token.length * 2));
            setTimeout(streamNext, delay);
          } else {
            const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
            const ttft = firstTokenTime > 0 ? ((firstTokenTime - startTime) / 1000).toFixed(1) : '0.1';
            const label = metricSuffix ? `ZEXA Local Brain • ${metricSuffix}` : 'ZEXA Local Brain';
            const metrics = `Prefill: ${ttft}s | Total: ${totalTime}s • ${label}`;
            // Clean textbook-grade output: no interactive study action command buttons in chat
            options.onComplete(metrics, rawResult.sourceTag, []);
            resolve();
          }
        };

        // Slight initial processing delay (0.04s)
        setTimeout(streamNext, 40);
      });

    } catch (err: any) {
      options.onError(err.message || 'Error processing response');
    }
  }

  /**
   * Cleans any LaTeX commands, raw equation symbols, and clutter into pristine,
   * professionally presentable textbook-grade notation.
   */
  public static cleanSymbols(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove LaTeX text/math commands
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
    cleaned = cleaned.replace(/\\mathbf\{([^}]+)\}/g, '$1');
    cleaned = cleaned.replace(/\\mathit\{([^}]+)\}/g, '$1');

    // Convert LaTeX fractions: \frac{a}{b} -> (a / b)
    cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

    // Convert LaTeX square roots: \sqrt{x} -> √(x)
    cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

    // Convert arrows and symbols
    cleaned = cleaned.replace(/\\xrightarrow\[([^\]]*)\]\{([^}]*)\}/g, '→ (with $2, $1)');
    cleaned = cleaned.replace(/\\xrightarrow\{([^}]*)\}/g, '→ ($1)');
    cleaned = cleaned.replace(/\\rightarrow/g, '→');
    cleaned = cleaned.replace(/\\to/g, '→');
    cleaned = cleaned.replace(/\\pm/g, '±');
    cleaned = cleaned.replace(/\\times/g, '×');
    cleaned = cleaned.replace(/\\cdot/g, '·');
    cleaned = cleaned.replace(/\\quad/g, ' ');
    cleaned = cleaned.replace(/\\qquad/g, '  ');
    cleaned = cleaned.replace(/\\left\(/g, '(');
    cleaned = cleaned.replace(/\\right\)/g, ')');
    cleaned = cleaned.replace(/\\left\[/g, '[');
    cleaned = cleaned.replace(/\\right\]/g, ']');

    // Strip LaTeX math delimiters $$ ... $$ and $ ... $
    cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
    cleaned = cleaned.replace(/\$([^\$\n]+)\$/g, '$1');

    // Convert chemical formulas and sub/superscripts to readable unicode
    cleaned = cleaned.replace(/H_2O/g, 'H₂O');
    cleaned = cleaned.replace(/CO_2/g, 'CO₂');
    cleaned = cleaned.replace(/O_2/g, 'O₂');
    cleaned = cleaned.replace(/C_6H_\{12\}O_6/g, 'C₆H₁₂O₆');
    cleaned = cleaned.replace(/C_6H_12O_6/g, 'C₆H₁₂O₆');
    cleaned = cleaned.replace(/H\^(\+)/g, 'H⁺');
    cleaned = cleaned.replace(/e\^(\-)/g, 'e⁻');
    cleaned = cleaned.replace(/\^2/g, '²');
    cleaned = cleaned.replace(/\^3/g, '³');

    // Remove stray LaTeX backslashes before words
    cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, '$1');

    return cleaned.trim();
  }

  private static tokenizeText(text: string): string[] {
    const parts: string[] = [];
    const lines = text.split('\n');
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (line === '') {
        parts.push('\n');
        continue;
      }
      const words = line.split(/(\s+)/);
      for (const word of words) {
        if (!word) continue;
        if (word.length > 10) {
          parts.push(word.slice(0, 5), word.slice(5));
        } else {
          parts.push(word);
        }
      }
      if (li < lines.length - 1) {
        parts.push('\n');
      }
    }
    return parts;
  }

  /**
   * Decomposes questions into specific structural components
   * e.g. "what is osmosis and Give the process of osmosis" -> asksDefinition: true, asksProcess: true
   */
  public static decomposeQuestion(question: string) {
    const q = question.toLowerCase().trim();

    const hasSubtopicSpecifier =
      q.includes('causes of') ||
      q.includes('cause of') ||
      q.includes('types of') ||
      q.includes('type of') ||
      q.includes('kinds of') ||
      q.includes('classes of') ||
      q.includes('functions of') ||
      q.includes('function of') ||
      q.includes('uses of') ||
      q.includes('use of') ||
      q.includes('importance of') ||
      q.includes('role of') ||
      q.includes('roles of') ||
      q.includes('effects of') ||
      q.includes('effect of') ||
      q.includes('impacts of') ||
      q.includes('impact of') ||
      q.includes('symptoms of') ||
      q.includes('signs of') ||
      q.includes('process of') ||
      q.includes('steps of') ||
      q.includes('stages of') ||
      q.includes('ways of') ||
      q.includes('ways to') ||
      q.includes('sources of') ||
      q.includes('examples of') ||
      q.includes('measures of') ||
      q.includes('measures to') ||
      q.includes('solutions to') ||
      q.includes('methods of') ||
      q.includes('how to');

    const asksExplicitDefinition =
      q.includes('define') ||
      q.includes('definition of') ||
      q.includes('meaning of') ||
      q.includes('what is meant by') ||
      q.includes('concept of') ||
      q.includes('chinonzi chii') ||
      q.includes('zvinorevei');

    const asksPureWhatIs =
      (q.startsWith('what is ') || q.startsWith('what are ') || q.includes('what is ') || q.includes('what are ')) &&
      !hasSubtopicSpecifier;

    const asksProcess =
      q.includes('process') ||
      q.includes('steps') ||
      q.includes('stages') ||
      q.includes('mechanism') ||
      q.includes('how does') ||
      q.includes('how it works') ||
      q.includes('explain how') ||
      q.includes('describe how') ||
      q.includes('how to prepare') ||
      q.includes('give the process') ||
      q.includes('tsanangura maitikiro');

    const asksTypes =
      q.includes('type') ||
      q.includes('types') ||
      q.includes('kinds') ||
      q.includes('classes') ||
      q.includes('categories') ||
      q.includes('forms of') ||
      q.includes('marudzi');

    const asksCauses =
      q.includes('cause') ||
      q.includes('causes') ||
      q.includes('caused by') ||
      q.includes('sources of') ||
      q.includes('source of') ||
      q.includes('reasons') ||
      q.includes('reason for') ||
      q.includes('why does') ||
      q.includes('why is') ||
      q.includes('zvikonzero');

    const asksEffects =
      q.includes('effect') ||
      q.includes('effects') ||
      q.includes('impact') ||
      q.includes('impacts') ||
      q.includes('consequence') ||
      q.includes('consequences') ||
      q.includes('results of') ||
      q.includes('what happens') ||
      q.includes('mhedzisiro');

    const asksSymptoms =
      q.includes('symptom') ||
      q.includes('symptoms') ||
      q.includes('signs') ||
      q.includes('signs and symptoms') ||
      q.includes('zviratidzo');

    const asksPreventionOrManagement =
      q.includes('prevent') ||
      q.includes('prevention') ||
      q.includes('control') ||
      q.includes('manage') ||
      q.includes('management') ||
      q.includes('reduce') ||
      q.includes('reducing') ||
      q.includes('reduction') ||
      q.includes('curb') ||
      q.includes('curbing') ||
      q.includes('solutions to') ||
      q.includes('solution') ||
      q.includes('cure') ||
      q.includes('treatment') ||
      q.includes('rules') ||
      q.includes('safety');

    const asksFunctionsOrUses =
      q.includes('function') ||
      q.includes('functions') ||
      q.includes('use') ||
      q.includes('uses') ||
      q.includes('importance') ||
      q.includes('role') ||
      q.includes('roles') ||
      q.includes('basa ra');

    const asksDifference =
      q.includes('difference') ||
      q.includes('differences') ||
      q.includes('compare') ||
      q.includes('contrast') ||
      q.includes('distinguish') ||
      q.includes('versus') ||
      q.includes(' vs ') ||
      q.includes('kusiyana');

    const asksExamples =
      q.includes('example') ||
      q.includes('examples') ||
      q.includes('instance') ||
      q.includes('mienzaniso');

    const asksEquation =
      q.includes('equation') ||
      q.includes('equations') ||
      q.includes('formula') ||
      q.includes('word equation') ||
      q.includes('chemical equation');

    const hasAnySpecific =
      asksProcess ||
      asksTypes ||
      asksCauses ||
      asksEffects ||
      asksSymptoms ||
      asksPreventionOrManagement ||
      asksFunctionsOrUses ||
      asksDifference ||
      asksExamples ||
      asksEquation;

    const asksDefinition = asksExplicitDefinition || asksPureWhatIs || !hasAnySpecific;

    const asksOnlyDefinition = (asksExplicitDefinition || asksPureWhatIs) && !hasAnySpecific;
    const asksOnlyCauses = asksCauses && !asksExplicitDefinition && !asksPureWhatIs && !asksEffects && !asksPreventionOrManagement && !asksTypes && !asksFunctionsOrUses && !asksProcess;
    const asksOnlyEffects = asksEffects && !asksExplicitDefinition && !asksPureWhatIs && !asksCauses && !asksPreventionOrManagement && !asksTypes && !asksFunctionsOrUses && !asksProcess;
    const asksOnlyTypes = asksTypes && !asksExplicitDefinition && !asksPureWhatIs && !asksCauses && !asksEffects && !asksPreventionOrManagement && !asksFunctionsOrUses && !asksProcess;
    const asksOnlyFunctions = asksFunctionsOrUses && !asksExplicitDefinition && !asksPureWhatIs && !asksCauses && !asksEffects && !asksPreventionOrManagement && !asksTypes && !asksProcess;
    const asksOnlyPrevention = asksPreventionOrManagement && !asksExplicitDefinition && !asksPureWhatIs && !asksCauses && !asksEffects && !asksTypes && !asksFunctionsOrUses && !asksProcess;
    const asksOnlyProcess = asksProcess && !asksExplicitDefinition && !asksPureWhatIs && !asksCauses && !asksEffects && !asksTypes && !asksFunctionsOrUses && !asksPreventionOrManagement;

    return {
      asksDefinition,
      asksExplicitDefinition,
      asksPureWhatIs,
      asksProcess,
      asksTypes,
      asksCauses,
      asksEffects,
      asksSymptoms,
      asksPreventionOrManagement,
      asksFunctionsOrUses,
      asksDifference,
      asksExamples,
      asksEquation,
      asksOnlyDefinition,
      asksOnlyCauses,
      asksOnlyEffects,
      asksOnlyTypes,
      asksOnlyFunctions,
      asksOnlyPrevention,
      asksOnlyProcess,
      hasAnySpecific,
      rawQuestion: question
    };
  }

  /**
   * Identifies the question's grammatical intent to provide a tailored, direct answer
   */
  private static detectIntent(question: string): QuestionIntent {
    const q = question.toLowerCase().trim();

    // 1. Greetings
    const greetingWords = [
      'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
      'good day', 'how are you', 'how are you doing', 'how r u', 'makadii', 'masikati',
      'mangwanani', 'salibonani', 'kunjani', 'uri bhoo', 'bhoo here'
    ];
    if (greetingWords.some((g) => q === g || q.startsWith(`${g} `) || q.endsWith(` ${g}`) || q.includes(` ${g} `))) {
      return 'GREETING';
    }

    // 2. Identity
    const identityWords = [
      'who are you', 'what are you', 'who made you', 'who created you', 'what is zexa',
      'what can you do', 'what do you do', 'tell me about yourself', 'ndiani akakugadzira',
      'uri ani', 'chii chinonzi zexa', 'first zimbabwe offline ai', 'offline ai',
      'about zexa', 'zexa ai', 'what is this app', 'how does zexa work'
    ];
    if (identityWords.some((iw) => q.includes(iw)) || q === 'zexa' || q === 'zexa ai') {
      return 'IDENTITY';
    }

    // 3. Gratitude
    const thanksWords = ['thank you', 'thanks', 'tatenda', 'ndatenda', 'siyabonga', 'much appreciated', 'great job'];
    if (thanksWords.some((tw) => q.includes(tw))) {
      return 'GRATITUDE';
    }

    // 4. Causes / Reasons
    if (
      q.includes('why') ||
      q.includes('cause') ||
      q.includes('reason') ||
      q.includes('led to') ||
      q.includes('factors') ||
      q.includes('zvikonzero') ||
      q.includes('chii chakakonzera')
    ) {
      return 'CAUSES';
    }

    // 5. Effects / Results
    if (
      q.includes('effect') ||
      q.includes('consequence') ||
      q.includes('result') ||
      q.includes('impact') ||
      q.includes('aftermath') ||
      q.includes('outcome') ||
      q.includes('zvakazoguma') ||
      q.includes('mhedzisiro')
    ) {
      return 'EFFECTS';
    }

    // 6. Role / Contribution
    if (
      q.includes('role of') ||
      q.includes('contribution') ||
      q.includes('what did') ||
      q.includes('how did') ||
      q.includes('basa ra') ||
      q.includes('vakaita sei') ||
      q.includes('akaita sei')
    ) {
      return 'ROLE';
    }

    // 7. Comparison
    if (
      q.includes('compare') ||
      q.includes('difference between') ||
      q.includes('versus') ||
      q.includes(' vs ') ||
      q.includes('contrast') ||
      q.includes('kusiyana')
    ) {
      return 'COMPARISON';
    }

    // 8. Biography / Person
    if (
      q.includes('who was') ||
      q.includes('who is') ||
      q.includes('biography') ||
      q.includes('life of') ||
      q.includes('profile') ||
      q.includes('aive ani') ||
      q.includes('ndiani')
    ) {
      return 'BIOGRAPHY';
    }

    // 9. Definition / Concept
    if (
      q.includes('what is') ||
      q.includes('what are') ||
      q.includes('define') ||
      q.includes('meaning of') ||
      q.includes('chinonzi chii') ||
      q.includes('zvinorevei')
    ) {
      return 'DEFINITION';
    }

    // 10. Process / Mechanism
    if (
      q.includes('how does') ||
      q.includes('explain how') ||
      q.includes('describe the process') ||
      q.includes('mechanism') ||
      q.includes('tsanangura')
    ) {
      return 'PROCESS_MECHANISM';
    }

    // 11. Timeline / Dates
    if (
      q.includes('when') ||
      q.includes('date') ||
      q.includes('year') ||
      q.includes('timeline') ||
      q.includes('riini')
    ) {
      return 'DATES_TIMELINE';
    }

    // 12. Exam Practice
    if (
      q.includes('exam') ||
      q.includes('past paper') ||
      q.includes('question') ||
      q.includes('marking scheme') ||
      q.includes('bvunzo')
    ) {
      return 'EXAM_PRACTICE';
    }

    return 'GENERAL';
  }

  /**
   * Main synthesis router: checks exam hints, conversational greetings,
   * language, query intent, and curriculum knowledge
   */
  private static synthesizeResponse(
    question: string,
    level: string,
    matchedChunk: any,
    matchedScore: number,
    hint?: string,
    history?: Array<{ question: string; answer: string }>
  ): SynthesisResult {
    // 1. Exam hint override
    if (hint) {
      return {
        text: `### Exam Question Analysis & Solution\n\n${hint}`,
        sourceTag: `ZIMSEC ${level} Exam Bank`,
        suggestions: [
          'Explain why the other options are incorrect',
          'Give another practice question on this topic',
          'What are the key ZIMSEC marking points for this question?'
        ]
      };
    }

    const intent = this.detectIntent(question);
    const qLower = question.toLowerCase();

    // 2. Conversational greetings & identity layer
    if (intent === 'GREETING') {
      return this.handleGreeting(level);
    }
    if (intent === 'IDENTITY') {
      return this.handleIdentity();
    }
    if (intent === 'GRATITUDE') {
      return this.handleGratitude();
    }

    // 3. ChiShona Query Processing
    if (this.isShonaQuery(question)) {
      return this.generateShonaResponse(question, level, intent, matchedChunk);
    }

    // 4. Targeted Domain Handlers (History, Science, Math, Geography, Accounts, Grade 7 Curriculum)
    // Dedicated Grade 7 Heritage-Based Curriculum (HBC) Line-by-Line Question Resolver
    const hbcLineResult = this.handleGrade7HbcLineByLineQuery(question, level, intent);
    if (hbcLineResult) {
      return hbcLineResult;
    }

    // Dedicated Cambridge & ZIMSEC O-Level Biology Past Paper & Notes Question Resolver
    const bioPastPaperResult = this.handleOLevelBiologyPastPaperQuery(question, level, intent);
    if (bioPastPaperResult) {
      return bioPastPaperResult;
    }

    // ZIMSEC Grade 7 Examination Structure, The 6 Official Subjects, Grading System (Units 1-9) & Results Slips
    const grade7OverviewResult = this.handleZimsecGradeSevenOverviewAndGradingQuery(question, level, intent);
    if (grade7OverviewResult) {
      return grade7OverviewResult;
    }

    // Presidents, Leadership & Governance of Zimbabwe (Emmerson Mnangagwa, Canaan Banana, Robert Mugabe, Head of State, Vice Presidents, Arms of Government)
    const governanceResult = this.handlePresidentsAndGovernanceQuery(question, level, intent);
    if (governanceResult) {
      return governanceResult;
    }

    // Robert Gabriel Mugabe (including handling common typos like "mufabe")
    if (qLower.includes('mugabe') || qLower.includes('mufabe')) {
      return this.handleMugabeQuery(question, level, intent);
    }

    // Dr. Joshua Mqabuko Nkomo
    if (qLower.includes('nkomo') || qLower.includes('father zimbabwe') || qLower.includes('chibwechitedza')) {
      return this.handleNkomoQuery(question, level, intent);
    }

    // King Shaka, Zulu Kingdom, Mfecane / Difaqane, King Mzilikazi
    if (
      qLower.includes('zulu') ||
      qLower.includes('shaka') ||
      qLower.includes('mfecane') ||
      qLower.includes('mufecane') ||
      qLower.includes('difaqane') ||
      qLower.includes('mzilikazi')
    ) {
      return this.handleZuluMfecaneMzilikaziQuery(question, level, intent);
    }

    // King Lobengula & 1893 War / Treaties
    if (
      qLower.includes('lobengula') ||
      qLower.includes('rudd') ||
      qLower.includes('moffat treaty') ||
      qLower.includes('grobler') ||
      qLower.includes('1893')
    ) {
      return this.handleLobengulaQuery(question, level, intent);
    }

    // Second Chimurenga / National Liberation Struggle (1966 – 1979), Chinhoyi Battle, Lancaster House, UDI, ZANLA & ZIPRA
    if (
      qLower.includes('second chimurenga') ||
      qLower.includes('2nd chimurenga') ||
      qLower.includes('chimurenga 2') ||
      qLower.includes('chinhoyi') ||
      qLower.includes('zanla') ||
      qLower.includes('zipra') ||
      qLower.includes('lancaster house') ||
      qLower.includes('land apportionment') ||
      qLower.includes('land tenure act') ||
      qLower.includes('nyadzonia') ||
      qLower.includes('chimoio') ||
      (qLower.includes('chimurenga') && (
        qLower.includes('second') ||
        qLower.includes('2nd') ||
        qLower.includes('1966') ||
        qLower.includes('1979') ||
        qLower.includes('1980') ||
        qLower.includes('smith') ||
        qLower.includes('liberation')
      )) ||
      (qLower.includes('liberation') && (qLower.includes('war') || qLower.includes('struggle') || qLower.includes('cause')))
    ) {
      return this.handleSecondChimurengaQuery(question, level, intent);
    }

    // First Chimurenga / Umvukela (1896 - 1897) & Nehanda
    // STRICT GUARD: Must NOT intercept Second Chimurenga or 1966-1980 liberation queries!
    const isExplicitlySecondChimurenga =
      qLower.includes('second') ||
      qLower.includes('2nd') ||
      qLower.includes('chinhoyi') ||
      qLower.includes('1966') ||
      qLower.includes('1979') ||
      qLower.includes('1980') ||
      qLower.includes('zanla') ||
      qLower.includes('zipra') ||
      qLower.includes('lancaster') ||
      qLower.includes('smith');

    if (!isExplicitlySecondChimurenga && (
      qLower.includes('1896') ||
      qLower.includes('1897') ||
      qLower.includes('first chimurenga') ||
      qLower.includes('1st chimurenga') ||
      qLower.includes('chimurenga 1') ||
      qLower.includes('umvukela') ||
      qLower.includes('nehanda') ||
      qLower.includes('kaguvi') ||
      qLower.includes('mkwati') ||
      qLower.includes('mukwati') ||
      (qLower.includes('chimurenga') && (
        qLower.includes('cause') ||
        qLower.includes('start') ||
        qLower.includes('first') ||
        qLower.includes('why') ||
        qLower.includes('shona') ||
        qLower.includes('ndebele') ||
        qLower.includes('uprising') ||
        qLower.includes('rebellion') ||
        qLower.includes('revolt') ||
        qLower.includes('who')
      ))
    )) {
      return this.handleFirstChimurengaQuery(question, level, intent);
    }

    // Gallant Liberation Struggle Heroes & Heroines (Josiah Tongogara, Herbert Chitepo, J.Z. Moyo, Leopold Takawira, Nikita Mangena, Simon Muzenda)
    const heroesResult = this.handleNationalHeroesQuery(question, level, intent);
    if (heroesResult) {
      return heroesResult;
    }

    // Respiration & Cellular Energetics (Cellular Respiration, Aerobic & Anaerobic, Breathing vs Respiration, Respiratory System)
    if (
      qLower.includes('respiration') ||
      qLower.includes('respiratory') ||
      qLower.includes('aerobic') ||
      qLower.includes('anaerobic') ||
      qLower.includes('fermentation') ||
      (qLower.includes('breathing') && (
        qLower.includes('respiration') ||
        qLower.includes('difference') ||
        qLower.includes('what is') ||
        qLower.includes('mechanism') ||
        qLower.includes('process') ||
        qLower.includes('compare') ||
        qLower.includes('vs')
      ))
    ) {
      return this.handleRespirationQuery(question, level, intent);
    }

    // Human Body Systems, Plant Biology & Diseases (Digestive, Circulatory, Respiratory, Deficiency & Infectious Diseases)
    const bioResult = this.handleHumanBodyAndDiseasesQuery(question, level, intent);
    if (bioResult) {
      return bioResult;
    }

    // Photosynthesis (Light & Dark reactions)
    if (
      qLower.includes('photosynthesis') ||
      (qLower.includes('light') && qLower.includes('dark') && qLower.includes('reaction'))
    ) {
      return this.handlePhotosynthesisQuery(question, level, intent);
    }

    // Osmosis, Diffusion, Active Transport & Cell Biology
    if (
      qLower.includes('osmosis') ||
      qLower.includes('diffusion') ||
      qLower.includes('active transport') ||
      qLower.includes('plasmolysis') ||
      qLower.includes('turgid') ||
      (qLower.includes('cell') && (qLower.includes('transport') || qLower.includes('membrane')))
    ) {
      return this.handleOsmosisAndCellTransportQuery(question, level, intent);
    }

    // Natural Farming Regions & Chiredzi
    if (
      qLower.includes('chiredzi') ||
      qLower.includes('farming region') ||
      qLower.includes('natural region')
    ) {
      return this.handleFarmingRegionsQuery(question, level, intent);
    }

    // Great Zimbabwe, Mutapa, and Rozvi States
    if (
      qLower.includes('great zimbabwe') ||
      qLower.includes('mutapa') ||
      qLower.includes('rozvi') ||
      qLower.includes('nyatsimba mutota') ||
      qLower.includes('changamire dombo')
    ) {
      return this.handlePreColonialStatesQuery(question, level, intent);
    }

    // Quadratic Equations
    if (
      (qLower.includes('2x') || qLower.includes('quadratic') || qLower.includes('parabola')) &&
      (qLower.includes('formula') || qLower.includes('solve') || qLower.includes('root') || qLower.includes('equation'))
    ) {
      return this.handleQuadraticQuery(question, level, intent);
    }

    // Newton's Laws of Motion
    if (qLower.includes('newton') && (qLower.includes('law') || qLower.includes('motion') || qLower.includes('force'))) {
      return this.handleNewtonQuery(question, level, intent);
    }

    // Double Entry Bookkeeping
    if (
      qLower.includes('double entry') ||
      (qLower.includes('debit') && qLower.includes('credit')) ||
      qLower.includes('accounting equation')
    ) {
      return this.handleDoubleEntryQuery(question, level, intent);
    }

    // Zimbabwe Gold (ZiG) Currency
    if (qLower.includes('zig') || qLower.includes('currency') || qLower.includes('zimbabwe gold')) {
      return this.handleZiGQuery(question, level, intent);
    }

    // Universal Curriculum Glossary & Terminology (Across All Education Levels: Primary, O-Level, A-Level)
    // Direct single-intent term resolution from the 2,640+ uploaded syllabus terms. Returns the concise, exact definition without dumping multi-paragraph module chunks.
    const glossaryResult = this.handleUniversalGlossaryQuery(question, level, intent);
    if (glossaryResult) {
      return glossaryResult;
    }

    // Primary & Junior English Language Curriculum (ZIMSEC 7010)
    const englishResult = this.handlePrimaryEnglishQuery(question, level, intent);
    if (englishResult) {
      return englishResult;
    }

    // Primary & Junior Mathematics Curriculum (ZIMSEC 7020)
    const mathResult = this.handlePrimaryMathQuery(question, level, intent);
    if (mathResult) {
      return mathResult;
    }

    // Primary & Junior Agriculture, Science & Technology Curriculum (ZIMSEC 7030)
    const scienceResult = this.handlePrimaryScienceTechQuery(question, level, intent);
    if (scienceResult) {
      return scienceResult;
    }

    // Primary & Junior Indigenous Languages: ChiShona (7040) & IsiNdebele (7041)
    const indigenousResult = this.handlePrimaryIndigenousLanguagesQuery(question, level, intent);
    if (indigenousResult) {
      return indigenousResult;
    }

    // Primary & Junior Social Sciences (ZIMSEC 7050 - Heritage & Social Studies, FAREME)
    const socialResult = this.handlePrimarySocialScienceQuery(question, level, intent);
    if (socialResult) {
      return socialResult;
    }

    // Primary & Junior Physical Education & Arts (ZIMSEC 7130 - PE, VPA, Mass Displays)
    const peaResult = this.handlePrimaryPhysicalEduArtsQuery(question, level, intent);
    if (peaResult) {
      return peaResult;
    }

    // 5. If matched Chunk from RAG is available, synthesize a crisp answer from the chunk
    if (matchedChunk && matchedScore >= 20) {
      return this.restructureSyllabusChunk(question, level, matchedChunk, intent);
    }

    // 6. Intelligent multi-domain curriculum synthesizer for any other syllabus query
    return this.synthesizeGeneralCurriculumResponse(question, level, intent);
  }

  // =========================================================================
  // DEDICATED CONVERSATIONAL & TOPIC HANDLERS
  // =========================================================================

  private static handleGreeting(level: string): SynthesisResult {
    return {
      text: `### Hello and Welcome to ZEXA AI!

I am ZEXA AI, Zimbabwe's premier 100% offline educational assistant and ZIMSEC exam preparation engine.

- Mode: 100% Offline (Operating with 0 MB internet data required).
- Current Level Focus: ${level} syllabus curriculum.
- Languages: Bilingual in English and ChiShona.

How can I assist your study today? You can ask me to:
- Explain specific historical events, leaders, treaties, or wars.
- Break down scientific cycles, biology processes, or chemical reactions.
- Solve mathematics equations step-by-step with formulas and working.
- Test your exam readiness with ZIMSEC past paper questions and marking guides.`,
      sourceTag: 'ZEXA AI • 100% Offline Educational Assistant',
      suggestions: [
        'Who was Cde Robert Gabriel Mugabe?',
        'What were the causes of the Mfecane wars?',
        'Explain the light and dark reactions of photosynthesis',
        'Solve 2x² - 5x - 3 = 0 using the quadratic formula'
      ]
    };
  }

  private static handleIdentity(): SynthesisResult {
    return {
      text: `### About ZEXA AI: First Zimbabwe OFFLINE AI

**Direct Answer:** ZEXA AI is Zimbabwe's first fully offline educational artificial intelligence, engineered specifically for Zimbabwean students from Primary (Grade 1-7) to Secondary (O-Level and A-Level) sitting for ZIMSEC examinations.

Key Capabilities:
- **100% Offline with 0 MB Data:** Operates entirely on your local smartphone or computer without requiring an active internet connection, Wi-Fi, or mobile data bundles.
- **Deep ZIMSEC Syllabus Grounding:** Fact-checked directly against official ZIMSEC syllabus frameworks, past examination trends, and official marking guidelines.
- **Dual-Language Fluency:** Seamlessly answers questions and breaks down complex concepts in both English and ChiShona (as well as IsiNdebele).
- **Exam-Standard Question Solving:** Provides mark-targeted answers structured for Paper 1 (Multiple Choice) and Paper 2 (Structured, Essay & Composition).

Official Curriculum Subjects Covered:
1. **Primary Grade 7 (All 6 Official ZIMSEC Subjects):**
   - English Language (7010)
   - Mathematics (7020)
   - Agriculture, Science & Technology - AST (7030)
   - Indigenous Languages (ChiShona 7040 / IsiNdebele 7041 / Tshivenḓa / Kalanga)
   - Social Science (7050 - Heritage & Social Studies, FAREME, Guidance)
   - Physical Education & Arts - PEA (7130 / 7060 - PE, Visual Arts, Performing Arts, Mass Displays)
2. **O-Level Secondary (Forms 1 to 4):**
   - Combined Science (4003), Mathematics (4004), English Language (1122), History (2167), Geography (2248), Commerce (7103), Principles of Accounts (7110), Agriculture (5038), ChiShona (3159), IsiNdebele (3155), Computer Science (4021).
3. **A-Level Secondary (Forms 5 to 6):**
   - Pure Mathematics (6042), Statistics (6046), Physics (6032), Chemistry (6027), Biology (6030), History (6006), Economics (6073), Business Studies (6025), Geography (6002), Literature in English (6039).`,
      sourceTag: 'ZEXA AI • First Zimbabwe OFFLINE AI',
      suggestions: [
        'What are the Grade 7 subjects?',
        'Explain the Grade 7 grading system',
        'How does Paper 1 and Paper 2 work?'
      ]
    };
  }

  /**
   * Authoritative handler for ZIMSEC Grade 7 Subjects, Examination Format & Units 1 to 9 Grading System
   * Zero hallucination: Fact-checked against official ZIMSEC Grade Seven Provisional Results & Syllabus Guidelines
   */
  private static handleZimsecGradeSevenOverviewAndGradingQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase().trim();

    // 1. Detect inquiries about Grade 7 subjects / What subjects are written / How many subjects / Primary subjects
    const isSubjectListQuery =
      q.includes('what are the subjects') ||
      q.includes('what subjects') ||
      q.includes('how many subjects') ||
      q.includes('list of subjects') ||
      q.includes('list the subjects') ||
      q.includes('name the subjects') ||
      q.includes('tell me the subjects') ||
      q.includes('6 subjects') ||
      q.includes('six subjects') ||
      q.includes('number of subjects') ||
      q.includes('subjects written') ||
      q.includes('subjects examined') ||
      q.includes('subjects do you cover') ||
      q.includes('subjects you cover') ||
      q.includes('subjects covered') ||
      q.includes('which subjects') ||
      q.includes('all subjects') ||
      q === 'grade 7 subjects' ||
      q === 'primary subjects' ||
      q === 'zimsec subjects' ||
      q === 'subjects' ||
      q === 'subjects in grade 7' ||
      q.includes('grade seven subjects') ||
      q.includes('grade 7 subject') ||
      (q.includes('curriculum') && (q.includes('primary') || q.includes('grade 7')));

    // 2. Detect inquiries about Grading System, Units (1 to 9), Aggregate 6, Results slip, Pass mark
    const isGradingQuery =
      q.includes('grading system') ||
      q.includes('grading scale') ||
      q.includes('grade 7 grading') ||
      q.includes('zimsec grading') ||
      q.includes('unit 1') ||
      q.includes('unit 2') ||
      q.includes('unit 3') ||
      q.includes('unit 4') ||
      q.includes('unit 5') ||
      q.includes('unit 6') ||
      q.includes('unit 7') ||
      q.includes('unit 8') ||
      q.includes('unit 9') ||
      q.includes('units in grade 7') ||
      q.includes('units system') ||
      q.includes('aggregate 6') ||
      q.includes('6 units') ||
      q.includes('six units') ||
      q.includes('provisional result') ||
      q.includes('results slip') ||
      q.includes('result slip') ||
      q.includes('grade 7 result') ||
      q.includes('grade seven result') ||
      (q.includes('pass mark') && (q.includes('grade 7') || q.includes('zimsec') || level === 'primary')) ||
      (q.includes('what is a pass') && (q.includes('grade 7') || q.includes('zimsec') || level === 'primary')) ||
      (q.includes('how is') && q.includes('graded')) ||
      (q.includes('how are') && q.includes('graded')) ||
      (q.includes('how does') && q.includes('grading work'));

    if (!isSubjectListQuery && !isGradingQuery) {
      return null;
    }

    // A. Grading System and Results Slip inquiry
    if (isGradingQuery && !isSubjectListQuery) {
      return {
        text: `### ZIMSEC Grade 7 Grading System & Results Slip Guide

**Direct Answer:** ZIMSEC Grade 7 examinations are graded on a **Units scale ranging from 1 to 9** per subject. **Unit 1 is the highest distinction** and **Unit 9 is ungraded/fail**.
The overall candidate result is determined by adding the units obtained across all 6 subjects to get an **Aggregate (Total Units)**. The **lower the aggregate score, the better the performance**, with **6 Units (6 straight ones)** representing the highest possible perfect score.

---

### 1. The Official Units 1 to 9 Grading Scale
On the official ZIMSEC Grade Seven scale:
- **Unit 1 (ONE): Distinction** (Marks ~80% - 100%): Outstanding mastery of subject concepts and exam competencies.
- **Unit 2 (TWO): Distinction** (Marks ~70% - 79%): Excellent performance.
- **Unit 3 (THREE): Merit** (Marks ~65% - 69%): Very good grasp of syllabus material.
- **Unit 4 (FOUR): Credit** (Marks ~60% - 64%): Good, competent understanding.
- **Unit 5 (FIVE): Credit** (Marks ~55% - 59%): Satisfactory performance.
- **Unit 6 (SIX): Pass** (Marks ~50% - 54%): Minimum standard pass mark required for general secondary school progression.
- **Unit 7 (SEVEN): Weak Pass** (Marks ~45% - 49%): Borderline pass.
- **Unit 8 (EIGHT): Weak** (Marks ~40% - 44%): Needs significant remediation.
- **Unit 9 (NINE): Ungraded / Fail** (Marks below 40%): Unsatisfactory; did not meet examination pass benchmarks.

---

### 2. How the Overall Aggregate is Calculated
The overall result is the arithmetic sum of the units across all **6 subjects**:
$$\\text{Total Aggregate} = U_{\\text{English}} + U_{\\text{Math}} + U_{\\text{AST}} + U_{\\text{Indigenous}} + U_{\\text{Social Science}} + U_{\\text{PEA}}$$

- **Best Possible Aggregate:** **6 Units** (Unit 1 in all 6 subjects: $1 + 1 + 1 + 1 + 1 + 1 = 6$).
- **Weakest Possible Aggregate:** **54 Units** (Unit 9 in all 6 subjects: $9 \\times 6 = 54$).
- *Note:* In primary education, a candidate with an aggregate of 6 to 12 is considered in the top tier nationally.

---

### 3. Understanding the ZIMSEC Provisional Results Slip
The official Provisional Results Slip for the November Examinations shows:
1. **Candidate Identification:** Centre Name, Candidate Number, Candidate Name, and Candidate Type (School / Private).
2. **Four-Column Subject Results Table:**
   - **Subject:** Name of the subject (e.g., ENGLISH, MATHEMATICS, AGRIC, SCIENCE & TECH, SHONA, SOCIAL SCIENCE, PHYSICAL EDU & ARTS).
   - **Result:** The numerical unit awarded (e.g., 6, 5, 6, 3, 5, 7).
   - **Status:** Candidate completion status.
   - **Explanation:** The word spelling of the unit inside parentheses, e.g., "(SIX)", "(FIVE)", "(THREE)", "(SEVEN)".
3. **Number of Subjects:** Confirmed at the footer as **Number of subjects: 6**.

---

### 4. Form 1 Secondary School Admission Standards
- **Top Mission & Government Boarding Schools** (e.g., Goromonzi, Kutama College, St Ignatius, Marist Nyanga, St George's, Monte Cassino, Gokomere, Fletcher): Typically shortlist candidates with aggregates between **6 and 10 units**.
- **Day Secondary & Provincial Schools:** Generally require **Unit 6 or better** in the core subjects, especially English Language and Mathematics.`,
        sourceTag: 'ZIMSEC Grade 7 Examination Regulations & Grading System',
        suggestions: [
          'What are the 6 Grade 7 subjects?',
          'How do Paper 1 and Paper 2 work?',
          'What is a good aggregate for boarding schools?'
        ]
      };
    }

    // B. Subject List and Curriculum inquiry (or Combined Query)
    return {
      text: `### Official ZIMSEC Grade 7 Subjects & Examination Structure

**Direct Answer:** Under the official ZIMSEC Competency-Based and Heritage-Based Primary School Curriculum, Grade 7 candidates write exactly **6 examinable subjects**:
1. **ENGLISH LANGUAGE** (Syllabus Code: 7010)
2. **MATHEMATICS** (Syllabus Code: 7020)
3. **AGRICULTURE, SCIENCE & TECHNOLOGY - AST** (Syllabus Code: 7030)
4. **INDIGENOUS LANGUAGE** (ChiShona 7040 / IsiNdebele 7041 / Tshivenḓa / Kalanga / Shangani / Tonga / Nambya)
5. **SOCIAL SCIENCE** (Syllabus Code: 7050 - Heritage & Social Studies, FAREME, Guidance)
6. **PHYSICAL EDUCATION & ARTS - PEA** (Syllabus Code: 7130 / 7060 - PE, Visual Arts, Performing Arts, Mass Displays)

---

### 1. In-Depth Subject Breakdown & Exam Format

#### 1. English Language (7010)
- **Paper 1 (Multiple Choice, 50 questions):** Tests reading comprehension passages, vocabulary in context, grammar (nouns, verbs, adjectives, adverbs), concord rules, prepositions, tenses, question tags, direct/indirect speech, and punctuation.
- **Paper 2 (Free Response):**
  - *Section A (Guided Composition):* Informal/friendly letters, formal letters, incident reports, descriptive speech, or narrative essays.
  - *Section B (Reading Comprehension & Summary):* Passage-based factual retrieval, inference, word contextual meanings, and main idea summary.

#### 2. Mathematics (7020)
- **Paper 1 (Multiple Choice, 50 questions):** Whole numbers up to millions, rounding off, fractions, decimals, percentages, four basic operations, money (profit, loss, simple interest), measurement (length, perimeter, area, volume, mass, time, speed), 2D/3D shapes, and data handling (graphs and averages).
- **Paper 2 (Structured Problem Solving):** Compulsory multi-step mathematical calculations where candidates must write full working steps and units.

#### 3. Agriculture, Science & Technology - AST (7030)
- **Curriculum Integration:** Combines Agricultural Science, Natural Science, and Information & Communication Technology (ICT).
- **Key Focus Areas:** Soil types, crop production, farm implements, animal care; human body systems (digestive, circulatory, respiratory), disease prevention (cholera, malaria, bilharzia, nutritional deficiencies), photosynthesis, water cycle, simple machines, weather instruments, and energy; computer hardware, software, internet safety, and file management.
- **Papers:** Paper 1 (50 Multiple Choice) and Paper 2 (Structured theory, experimental interpretation, and diagrams).

#### 4. Indigenous Languages (ChiShona 7040 / IsiNdebele 7041)
- **Curriculum Integration:** ChiShona, IsiNdebele, or other officially recognized indigenous Zimbabwean languages.
- **Key Focus Areas:** Nzwisiso (reading comprehension), Tsumo (proverbs), Madimikira (idioms), Zviera (taboos), Ukama (kinship terms), Zvirahwe (riddles), and Tsika dzeUnhu/Ubuntu.
- **Papers:** Paper 1 (Multiple Choice) and Paper 2 (Rondedzero / Composition and structured comprehension/summary).

#### 5. Social Science (7050)
- **Curriculum Integration:** Heritage and Social Studies (HSS), Family and Religious Studies (FAREME), and Guidance & Counselling.
- **Key Focus Areas:** Family dynamics, national identity, national symbols (Flag, Bird, Coat of Arms, National Anthem), the 3 arms of government (Executive, Legislature, Judiciary), Constitution of Zimbabwe, Liberation struggle (First and Second Chimurenga), pre-colonial states (Great Zimbabwe, Mutapa, Rozvi, Torwa, Zulu/Ndebele kingdoms under Mzilikazi and Lobengula), transport, communication, and environmental disaster management.
- **Papers:** Paper 1 (50 Multiple Choice) and Paper 2 (Structured short answers and case studies).

#### 6. Physical Education & Arts - PEA (7130 / 7060)
- **Curriculum Integration:** Physical Education, Visual Arts, Performing Arts (Music, Dance, Theatre), and Mass Displays.
- **Key Focus Areas:** Health and fitness, fundamental movement skills, gymnastics, athletics, indigenous games (pada, tsoro, nhodo); drawing, painting, shading, sculpture; music theory, indigenous musical instruments (mbira, hosho, ngoma), traditional dances (mbakumba, jerusarema/mbende, muchongoyo, isitshikitsha); safety and choreography in mass displays.
- **Papers:** Paper 1 (Multiple Choice) and Paper 2 (Structured visual, aesthetic, and performance design questions).

---

### 2. Examination Result Representation
- Exactly **6 subjects** appear on the candidate's official **ZIMSEC Provisional Results Slip**.
- Each subject is assigned a unit from **1 to 9** (Unit 1 being Distinction, Unit 6 being Pass).
- The best possible total result is **6 Units** (aggregating 1 in all 6 subjects).`,
      sourceTag: 'ZIMSEC Official Primary Curriculum Framework • 6 Examinable Subjects',
      suggestions: [
        'Explain the Grade 7 grading system',
        'What does unit 1 to 9 mean?',
        'How is the aggregate calculated?'
      ]
    };
  }

  private static handleGratitude(): SynthesisResult {
    return {
      text: `### You are very welcome!

I am always ready to help you master your ZIMSEC syllabus topics. Keep practicing and asking questions—consistent study brings exam success!

Feel free to ask your next question whenever you are ready.`,
      sourceTag: 'ZEXA AI • Student Support',
      suggestions: [
        'Ask another exam question',
        'Practice past paper questions',
        'Explore Study Pack notes'
      ]
    };
  }

  /**
   * Authoritative handler for Zimbabwe Governance, Presidents, Prime Ministers & Leadership
   * Zero hallucination: Fact-checked against official 2013 Constitution and ZIMSEC Heritage syllabus
   */
  private static handlePresidentsAndGovernanceQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase();

    const isGovQuery =
      q.includes('president') ||
      q.includes('mnangagwa') ||
      q.includes('canaan banana') ||
      q.includes('head of state') ||
      q.includes('leader of zimbabwe') ||
      q.includes('leaders of zimbabwe') ||
      q.includes('vice president') ||
      q.includes('chiwenga') ||
      q.includes('mohadi') ||
      q.includes('arms of government') ||
      q.includes('second republic') ||
      q.includes('capital of zimbabwe') ||
      q.includes('capital city') ||
      q.includes('who rules zimbabwe') ||
      q.includes('who leads zimbabwe');

    if (!isGovQuery) return null;

    // 1. Current President of Zimbabwe / Emmerson Mnangagwa
    if (
      q.includes('current president') ||
      q.includes('president now') ||
      q.includes('president today') ||
      q.includes('who is the president') ||
      q.includes('who is president') ||
      q.includes('mnangagwa') ||
      q.includes('head of state') ||
      (q.includes('leader') && !q.includes('first'))
    ) {
      return {
        text: `### President of the Republic of Zimbabwe

**Direct Answer:** The current President of Zimbabwe is **His Excellency Cde Emmerson Dambudzo Mnangagwa**, who has served as the Head of State, Head of Government, and Commander-in-Chief of the Zimbabwe Defence Forces since **24 November 2017**.

1. Chronology of Zimbabwe's Presidents since 1980:
- **Rev. Canaan Sodindo Banana (1980 – 1987):** First President of Zimbabwe. Under the 1980 Lancaster House Constitution, this was a ceremonial presidency while executive power was held by Prime Minister Robert Mugabe.
- **Cde Robert Gabriel Mugabe (1987 – 2017):** First Executive President of Zimbabwe following the 1987 Unity Accord and constitutional amendments creating an executive presidency. (Previously served as Prime Minister from 18 April 1980 to 22 December 1987). Resigned in November 2017.
- **Cde Emmerson Dambudzo Mnangagwa (24 November 2017 – Present):** President of Zimbabwe and leader of the Second Republic. Re-elected in the 2018 and 2023 harmonized general elections.

2. Current National Leadership of the Second Republic:
- **Head of State & Government:** President Emmerson Dambudzo Mnangagwa.
- **First Vice President:** General (Rtd) Dr. Constantino Guveya Dominic Nyikadzino Chiwenga.
- **Second Vice President:** Col (Rtd) Kembo Dugish Campbell Muleya Mohadi.

3. Guiding National Philosophies (Second Republic):
- *"Nyika inovakwa nevene vayo / Ilizwe lakhiwa ngabanikazi balo"* (A nation is built by its own owners).
- *"Leaving no one and no place behind"*.
- **Vision 2030:** Transforming Zimbabwe into an Empowered and Prosperous Upper-Middle-Income Society by 2030.
- **National Currency:** Zimbabwe Gold (ZiG), backed by mineral and gold reserves.`,
        sourceTag: 'ZIMSEC Heritage & Social Studies • Governance & Modern Zimbabwe',
        suggestions: [
          'Who was the first President of Zimbabwe (Canaan Banana)?',
          'Who was the first Prime Minister of Zimbabwe (Robert Mugabe)?',
          'What are the three arms of government in Zimbabwe?',
          'What are the 16 officially recognized languages of Zimbabwe?'
        ]
      };
    }

    // 2. First President / First Prime Minister / Canaan Banana
    if (
      q.includes('first president') ||
      q.includes('canaan banana') ||
      q.includes('first prime minister') ||
      q.includes('1980 president')
    ) {
      let directAnswer = '';
      if (q.includes('prime minister')) {
        directAnswer = 'The **first Prime Minister of Zimbabwe was Cde Robert Gabriel Mugabe**, who led the government from **18 April 1980 to 22 December 1987**, when the office was abolished under the Executive Presidency amendment.';
      } else {
        directAnswer = 'The **first President of Zimbabwe was Rev. Canaan Sodindo Banana (1980 – 1987)**. He was a ceremonial President under the Westminster parliamentary system, while Cde Robert Mugabe was Prime Minister holding executive powers.';
      }

      return {
        text: `### History & Governance: The First President & Prime Minister of Zimbabwe

**Direct Answer:** ${directAnswer}

1. The Dual Leadership Structure (1980 – 1987):
- **Ceremonial Head of State:** Rev. Canaan Sodindo Banana served as President from 18 April 1980 until 31 December 1987. His duties included opening Parliament, receiving foreign ambassadors, and state ceremonials.
- **Executive Head of Government:** Cde Robert Gabriel Mugabe served as Prime Minister from 18 April 1980 until 22 December 1987, presiding over Cabinet and executing national policy.

2. Constitutional Shift to the Executive Presidency (1987):
- Following the historic **Unity Accord of 22 December 1987** between ZANU and PF-ZAPU, the Constitution of Zimbabwe was amended (Constitutional Amendment No. 7).
- The ceremonial presidency and the office of Prime Minister were merged into a single **Executive Presidency**.
- Cde Robert Gabriel Mugabe was sworn in as Zimbabwe's first **Executive President** on 31 December 1987, with Dr. Joshua Nkomo and Cde Simon Muzenda as Vice Presidents.

3. Subsequent Executive Presidents:
- Cde Robert Gabriel Mugabe: 31 December 1987 – 21 November 2017.
- Cde Emmerson Dambudzo Mnangagwa: 24 November 2017 – Present.`,
        sourceTag: 'ZIMSEC History 2167 & Social Studies 7050 • Post-Independence Leaders',
        suggestions: [
          'Who is the current President of Zimbabwe?',
          'What was the 1987 Unity Accord?',
          'Who was Dr. Joshua Mqabuko Nkomo?',
          'What are the three arms of government in Zimbabwe?'
        ]
      };
    }

    // 3. Three Arms of Government
    if (q.includes('arms of government') || q.includes('three arms') || q.includes('judiciary') || q.includes('legislature') || q.includes('executive')) {
      return {
        text: `### Governance: The Three Arms of Government in Zimbabwe

In the Constitution of Zimbabwe (2013) and ZIMSEC Social Sciences/Civics, state power is divided into three separate arms to ensure good governance, checks and balances, and the rule of law:

1. The Executive:
- **Head:** The President of the Republic of Zimbabwe, supported by the two Vice Presidents and the Cabinet of Ministers.
- **Function:** Formulates national policies, enforces laws passed by Parliament, manages state administration, and defends national sovereignty.

2. The Legislature (Parliament):
- **Composition:** Bicameral parliament consisting of:
  * **The National Assembly:** 270 Members of Parliament (MPs) directly elected by registered voters, plus 60 seats reserved for women under proportional representation and 10 youth quota seats.
  * **The Senate:** 80 Senators, including 18 traditional Chiefs (President and Deputy President of the Council of Chiefs plus 16 provincial Chiefs) and 2 representatives of persons with disabilities.
- **Function:** Debates, drafts, and enacts legislation (laws), scrutinizes government expenditure, and represents citizen interests.

3. The Judiciary (Courts of Law):
- **Head:** The Chief Justice of Zimbabwe, presiding over the Judicial Service Commission (JSC).
- **Court Hierarchy:** Constitutional Court (highest court on constitutional matters), Supreme Court (final court of appeal), High Court, Labour Court, Administrative Court, Magistrates Courts, and Customary/Chiefs Courts.
- **Function:** Interprets the laws independently, resolves disputes, and upholds the Constitution and fundamental human rights.`,
        sourceTag: 'ZIMSEC 7050 & Civics • Separation of Powers & Arms of Government',
        suggestions: [
          'Who is the current President of Zimbabwe?',
          'What is the role of traditional chiefs in the Senate?',
          'What are the 16 official languages recognized by the Constitution?'
        ]
      };
    }

    // 4. Vice Presidents of Zimbabwe
    if (q.includes('vice president') || q.includes('chiwenga') || q.includes('mohadi')) {
      return {
        text: `### Governance: Vice Presidents of the Republic of Zimbabwe

**Direct Answer:** Under Section 99 of the Constitution of Zimbabwe, the President is assisted by two Vice Presidents:
1. **General (Rtd) Dr. Constantino Guveya Dominic Nyikadzino Chiwenga** (First Vice President).
2. **Col (Rtd) Kembo Dugish Campbell Muleya Mohadi** (Second Vice President).

Historical Context of Vice Presidents in Zimbabwe:
- The dual Vice-Presidency was created by the **1987 Unity Accord** to cement national reconciliation and unity between ZANU and PF-ZAPU.
- Former Vice Presidents include:
  * Dr. Joshua Mqabuko Nkomo (1987 – 1999)
  * Cde Simon Vengai Muzenda (1987 – 2003)
  * Cde Joseph Msika (1999 – 2009)
  * Cde Joice Mujuru (2004 – 2014)
  * Cde John Landa Nkomo (2009 – 2013)
  * Cde Emmerson Dambudzo Mnangagwa (2014 – 2017)
  * Cde Phelekezela Mphoko (2014 – 2017)`,
        sourceTag: 'ZIMSEC Social Studies 7050 & History 2167 • Executive Leadership',
        suggestions: [
          'Who is the current President of Zimbabwe?',
          'What was the 1987 Unity Accord?',
          'Who was Dr. Joshua Mqabuko Nkomo?'
        ]
      };
    }

    return null;
  }

  /**
   * Comprehensive handler for Robert Gabriel Mugabe queries tailored to student's exact intent
   */
  private static handleMugabeQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    const q = question.toLowerCase();

    // Specific Intent: Land Reform / Third Chimurenga
    if (q.includes('land') || q.includes('farm') || q.includes('third chimurenga') || q.includes('a1') || q.includes('a2')) {
      return {
        text: `### History: Cde Robert Mugabe and the 2000 Fast-Track Land Reform Programme

In ZIMSEC History (Syllabus 2167 & 9155), the Third Chimurenga launched under President Robert Mugabe in 2000 is examined across its causes, implementation models, and socioeconomic impact:

1. Historical Background & Catalysts:
- Redress of Colonial Injustice: Colonial legislation (such as the 1930 Land Apportionment Act) had expropriated over 50% of the fertile highveld land for less than 5,000 European settler farmers, crowding indigenous Africans into dry reserves.
- Expiration of Lancaster House Clause: The 10-year "willing-buyer, willing-seller" constitutional limitation expired in 1990 without significant land transfer.
- The 1997 Donor Breakdown: The British Blair administration refused to honour financial commitments made at Lancaster House for land compensation.
- Grassroots Spontaneous Occupations: Svosve villagers and liberation war veterans initiated farm occupations in 2000, prompting the government to enact Section 16A of the Constitution to acquire land for redistribution.

2. The Two Resettlement Models:
- A1 Model (Smallholder / Villagized Scheme): Designed to decongest communal areas. Beneficiary families were allocated 5–6 hectares of arable land alongside shared communal grazing. Over 160,000 households were resettled.
- A2 Model (Commercial Small-to-Medium Farming): Self-contained farming units allocated to indigenous farmers with business plans to promote commercial production of tobacco, maize, wheat, and beef.

3. Impact & Historical Evaluation:
- Economic & Diplomatic: Triggered punitive Western sanctions, notably the United States ZDERA (2001) and EU trade restrictions.
- Agricultural Renaissance: While early transitional disruptions occurred, indigenous A1 and A2 farmers subsequently achieved historic production records in tobacco (>290 million kg) and wheat self-sufficiency.`,
        sourceTag: 'History 2167/9155 • The Third Chimurenga & Land Reform',
        suggestions: [
          'What was the difference between the A1 and A2 models?',
          'What was the 1930 Land Apportionment Act?',
          'Who was Dr. Joshua Mqabuko Nkomo?',
          'What was the 1987 Unity Accord?'
        ]
      };
    }

    // Specific Intent: 1987 Unity Accord
    if (q.includes('unity') || q.includes('accord') || q.includes('1987') || q.includes('nkomo') || q.includes('civil') || q.includes('disturbances')) {
      return {
        text: `### History: Cde Robert Mugabe and the 1987 Unity Accord

The signing of the Unity Accord on 22 December 1987 between ZANU (led by Robert Mugabe) and PF-ZAPU (led by Dr. Joshua Nkomo) is one of the most vital milestones in post-independence Zimbabwean history:

1. Historical Catalysts:
- Post-Independence Disturbances: Civil conflict and security operations in Matabeleland and the Midlands provinces threatened national sovereignty and territorial cohesion.
- External Destabilization: Apartheid South Africa was actively funding Super-ZAPU dissidents and destabilizing frontline states.

2. Terms and Provisions of the Accord:
- Political Merger: Total integration of ZANU and PF-ZAPU into one united national party: ZANU-PF.
- Constitutional Restructuring: Created an Executive Presidency with Cde Robert Mugabe as President, supported by two Vice Presidents (Dr. Joshua Nkomo and Cde Simon Muzenda).
- National Healing: Immediate cessation of hostilities and pardon for political combatants.

3. National Legacy:
- Commemorated every 22 December as a public holiday: National Unity Day.
- Established national unity, peace, and development as core pillars of the Zimbabwean state.`,
        sourceTag: 'History 2167 • Post-Independence Zimbabwe & The Unity Accord',
        suggestions: [
          'What were the roles of Joshua Nkomo and Robert Mugabe at Lancaster House?',
          'Why is 22 December celebrated as National Unity Day?',
          'Explain the causes of the Second Chimurenga'
        ]
      };
    }

    // Specific Intent: Liberation Struggle / Second Chimurenga
    if (q.includes('war') || q.includes('liberation') || q.includes('second chimurenga') || q.includes('zanla') || q.includes('detention') || q.includes('mozambique')) {
      return {
        text: `### History: Cde Robert Mugabe's Role in the Liberation Struggle (Second Chimurenga)

Cde Robert Mugabe played a leading political and strategic role in prosecuting the armed struggle against the Rhodesian colonial regime:

1. Nationalist Awakening & Detention (1960 – 1974):
- Joined the National Democratic Party (NDP) in 1960 as Publicity Secretary.
- Co-founded the Zimbabwe African National Union (ZANU) in August 1963 alongside Ndabaningi Sithole, Enos Nkala, and Herbert Chitepo.
- Imprisoned for 10 years (1964–1974) by Ian Smith's Rhodesian regime; while in detention, he earned multiple law and economics degrees and organized study classes for fellow political prisoners.

2. Transition to Armed Leadership in Mozambique (1975 – 1979):
- Following release during the 1974 detente exercise, Mugabe crossed into Mozambique in 1975 with Edgar Tekere.
- Endorsed by ZANLA military commanders at Mgagao Camp (The Mgagao Declaration, 1975) as the legitimate political leader of ZANU.
- Confirmed as President of ZANU at the 1977 Chimoio Conference, coordinating the political-military strategy of ZANLA forces.

3. Lancaster House Conference (1979):
- Co-led the Patriotic Front delegation with PF-ZAPU leader Dr. Joshua Nkomo.
- Tenaciously negotiated the transfer of majority rule and constitutional guarantees, leading to the 1980 democratic elections.`,
        sourceTag: 'History 2167 • Nationalist Leaders & The Second Chimurenga',
        suggestions: [
          'What was the Mgagao Declaration of 1975?',
          'What role did ZANLA play in the Second Chimurenga?',
          'Compare the roles of Robert Mugabe and Joshua Nkomo in the liberation war'
        ]
      };
    }

    // Specific Intent: Independence & 1980 Prime Ministership
    if (q.includes('1980') || q.includes('prime minister') || q.includes('reconciliation') || q.includes('independence') || q.includes('education')) {
      return {
        text: `### History: Cde Robert Mugabe's 1980 Independence Government & Social Policies

Following ZANU's landslide victory in the February 1980 elections, Robert Mugabe took office on 18 April 1980 as the first Prime Minister of independent Zimbabwe:

1. Policy of National Reconciliation:
- On the eve of independence, Mugabe delivered his renowned address urging all races to "turn swords into ploughshares and beat our spears into pruning hooks."
- Formed a government of national unity incorporating members of PF-ZAPU and European ministers (e.g. Dennis Norman as Minister of Agriculture).

2. The Education Revolution:
- Introduced free, universal primary education and established thousands of secondary schools across rural Zimbabwe.
- Rapidly expanded teacher training colleges and higher tertiary institutions, lifting Zimbabwe to the highest adult literacy rate in Africa (>90%).

3. Healthcare & Public Infrastructure:
- Instituted free healthcare for low-income citizens and constructed rural clinics and district referral hospitals nationwide.`,
        sourceTag: 'History 2167 • Zimbabwe Post-Independence Transformation',
        suggestions: [
          'How did the policy of national reconciliation impact post-1980 Zimbabwe?',
          'What was the 1987 Unity Accord?',
          'Explain the Fast-Track Land Reform Programme of 2000'
        ]
      };
    }

    // General Biographical Profile & Career Overview
    return {
      text: `### Cde Robert Gabriel Mugabe (1924 – 2019): Comprehensive Biographical Analysis

In ZIMSEC History (Syllabus 2167 & 9155), Cde Robert Gabriel Mugabe is studied as a founding nationalist leader, liberation commander, first Prime Minister, and first Executive President of Zimbabwe:

1. Early Life, Education & Ideology:
- Born on 21 February 1924 at Kutama Mission in Zvimba.
- Educated at Kutama College and the University of Fort Hare in South Africa (BA 1951).
- Taught in Northern Rhodesia (Zambia) and Ghana (1958–1960), where he married Sally Hayfron and was profoundly influenced by President Kwame Nkrumah's Pan-Africanist vision.

2. Key Political Milestones:
- 1963: Co-founded ZANU in Highfield, Harare, serving as Secretary-General.
- 1964–1974: Detained for a decade without trial by the Rhodesian colonial regime.
- 1975–1979: Led ZANU and Commander-in-Chief of ZANLA forces from Mozambique; formed the Patriotic Front alliance with Joshua Nkomo.
- 1980–1987: First Prime Minister of independent Zimbabwe following the 1980 elections.
- 1987–2017: First Executive President of Zimbabwe following the historic 1987 Unity Accord with PF-ZAPU.
- 2000: Spearheaded the Fast-Track Land Reform Programme (Third Chimurenga) to redistribute commercial farmland under A1 and A2 models.
- November 2017: Resigned under Section 96 of the Constitution of Zimbabwe.
- Passed away on 6 September 2019 and was declared a National Hero.

3. Major Exam Themes & Evaluation:
- Liberation Strategy: Diplomatic negotiation at Lancaster House vs armed mobilization through ZANLA.
- Post-Independence Achievements: Universal education, health expansion, and land redistribution.
- Socioeconomic Challenges: ESAP structural adjustment programs (1991), Western sanctions, and inflation.`,
      sourceTag: 'History 2167 & 9155 • Nationalist Leaders of Zimbabwe',
      suggestions: [
        'What was Mugabe\'s role in the 2000 Land Reform Programme?',
        'Explain the causes and terms of the 1987 Unity Accord',
        'What was the Mgagao Declaration and why was it significant?',
        'Compare the contributions of Robert Mugabe and Joshua Nkomo'
      ]
    };
  }

  /**
   * Comprehensive handler for Dr. Joshua Mqabuko Nkomo
   */
  private static handleNkomoQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### Dr. Joshua Mqabuko Nkomo ("Father Zimbabwe") (1917 – 1999)

In ZIMSEC History, Dr. Joshua Nkomo is honored as "Father Zimbabwe" (Chibwechitedza), the pioneer of mass nationalist consciousness and liberation in Zimbabwe:

1. Mass Nationalism & Party Leadership:
- General Secretary of the Rhodesian Railways African Workers Union (RAWU) in 1951, fighting for fair African working wages.
- President of the Southern Rhodesia African National Congress (SRANC) in 1957, uniting workers and peasants into a mass anti-colonial front.
- President of the National Democratic Party (NDP) in 1960; founded the Zimbabwe African People's Union (ZAPU) in December 1961.
- Established the armed military wing ZIPRA, orchestrating guerrilla incursions from Zambia under General Lookout Masuku.

2. Lancaster House & Patriotic Front (1979):
- Co-led the Patriotic Front delegation alongside Robert Mugabe, presenting a united military-political stance that compelled the British to grant democratic elections.

3. Statesmanship & The 1987 Unity Accord:
- Put national peace and the preservation of innocent lives first by signing the 1987 Unity Accord on 22 December 1987.
- Served as Vice President of Zimbabwe from 1987 until his passing on 1 July 1999; laid to rest at the National Heroes Acre in Harare.`,
      sourceTag: 'History 2167 • Nationalist Leaders of Zimbabwe',
      suggestions: [
        'What role did ZIPRA play in the Second Chimurenga?',
        'Why was Joshua Nkomo called "Father Zimbabwe"?',
        'What were the provisions of the 1987 Unity Accord?'
      ]
    };
  }

  /**
   * Comprehensive handler for King Shaka, Zulu Kingdom, Mfecane, and King Mzilikazi
   */
  private static handleZuluMfecaneMzilikaziQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    const q = question.toLowerCase();

    // Specific Intent: Causes of the Mfecane
    if ((q.includes('mfecane') || q.includes('mufecane') || q.includes('difaqane')) && (q.includes('cause') || q.includes('why') || intent === 'CAUSES')) {
      return {
        text: `### History: Causes of the Mfecane / Difaqane (The Scattering / Crushing)

In ZIMSEC History (Syllabus 2167 & 9155), the Mfecane (c. 1815–1835) was caused by a combination of ecological, economic, and sociopolitical pressures in Nguniland:

1. Severe Drought & Ecological Crisis (The Madlathule Famine):
- A catastrophic drought in the early 1800s caused crop failures and dried up pastures across coastal Natal.
- Tribes were forced to fight fiercely over fertile river valleys and surviving water sources to avoid starvation.

2. Population Explosion & Land Scarcity:
- Introduction of high-yield American maize crops in the 18th century led to a rapid population boom.
- The narrow coastal corridor between the Drakensberg mountains and the Indian Ocean became severely congested, creating acute pasture shortages for cattle herds.

3. Competition to Control the Delagoa Bay Trade:
- Control over lucrative trade routes to Portuguese merchants at Delagoa Bay (Maputo) sparked intense rivalry.
- Chiefs competed to export ivory, cattle, and captives in exchange for brass, cloth, beads, and firearms.

4. Military Ambitions of Powerful Leaders:
- The rise of militarized confederacies under Dingiswayo (Mthethwa), Zwide (Ndwandwe), and later King Shaka (Zulu) transformed regional skirmishes into total territorial warfare.`,
        sourceTag: 'History 2167 • Pre-Colonial Southern Africa: The Mfecane',
        suggestions: [
          'What were the consequences and effects of the Mfecane?',
          'What military reforms did King Shaka introduce?',
          'How did King Mzilikazi migrate and establish the Ndebele State?'
        ]
      };
    }

    // Specific Intent: Effects / Consequences of the Mfecane
    if ((q.includes('mfecane') || q.includes('mufecane') || q.includes('difaqane')) && (q.includes('effect') || q.includes('result') || q.includes('impact') || intent === 'EFFECTS')) {
      return {
        text: `### History: Effects and Consequences of the Mfecane / Difaqane

The Mfecane caused massive demographic, political, and territorial restructuring across Southern and Central Africa:

1. Mass Displacements & Depopulation:
- Thousands of communities were uprooted, creating widespread devastation and famine in the Highveld and Natal.
- Created temporarily depopulated buffer zones that Boer Voortrekkers later exploited to occupy fertile land.

2. Rise of New Centralized African States:
- Ndebele Kingdom: Founded by King Mzilikazi Khumalo after migrating north into modern Zimbabwe.
- Gaza Kingdom: Founded by Soshangana in Mozambique and southeastern Zimbabwe.
- Basotho Kingdom: Consolidated by King Moshoeshoe I using mountain fortresses (Thaba Bosiu) and defensive diplomacy.
- Kololo Kingdom: Established by Sebetwane in the Zambezi floodplain (Barotseland).
- Ngoni Kingdoms: Established by Zwangendaba across Zambia, Malawi, and Tanzania.

3. Diffusion of Zulu Military Tactics:
- Displaced armies adopted the short stabbing spear (*iklwa*), large shields, and cow-horn encirclement formations, permanently modernizing warfare across Central Africa.`,
        sourceTag: 'History 2167 • The Mfecane: Consequences & Migrations',
        suggestions: [
          'What were the causes of the Mfecane?',
          'Describe King Mzilikazi\'s migration to Zimbabwe',
          'Explain the social structure of the Ndebele State'
        ]
      };
    }

    // Specific Intent: King Shaka's Military Reforms
    if (q.includes('shaka') && (q.includes('reform') || q.includes('tactic') || q.includes('weapon') || q.includes('military') || q.includes('iklwa'))) {
      return {
        text: `### History: King Shaka Zulu's Military Tactics and Innovations (1816 – 1828)

King Shaka transformed the Zulu chiefdom into a formidable regional power through revolutionary military and social reorganizations:

1. Weaponry and Physical Discipline:
- The Short Stabbing Spear (*Iklwa*): Replaced the traditional long throwing spear (*assegai*). Warriors closed distance and engaged in lethal hand-to-hand combat; losing one's iklwa was punishable by death.
- Large Cowhide Shield: Stronger and larger, used tactically to hook the opponent's shield aside and expose their left flank for a thrust.
- Discarding Sandals: Required warriors to march barefoot over rough terrain to toughen soles, enabling rapid long-distance marches.

2. The Cow-Horn Formation (*Izimpondo*):
- Chest (*Isifuba*): The main battle contingent that engaged the enemy center directly.
- Horns (*Izimpondo*): Fast, agile youth wings on both flanks that encircled the enemy to prevent retreat.
- Loins (*Umnsalo*): Experienced veteran reserves held behind the chest with their backs turned to the battle to prevent premature panic.

3. The Regimental System (*Amabutho*):
- Grouped young men by age into regiments housed in permanent barracks (*amakhanda*).
- Warriors were forbidden to marry until granted permission by Shaka after proving their valor in battle.`,
        sourceTag: 'History 2167 • The Rise of the Zulu Kingdom',
        suggestions: [
          'What were the causes of the Mfecane?',
          'Why did Mzilikazi break away from King Shaka in 1822?',
          'How was the Zulu army organized into amabutho?'
        ]
      };
    }

    // Specific Intent: King Mzilikazi & The Ndebele State Migration & Structure
    if (q.includes('mzilikazi') || q.includes('ndebele') || q.includes('zansi') || q.includes('enhla') || q.includes('hole')) {
      return {
        text: `### History: King Mzilikazi Khumalo and the Establishment of the Ndebele State

In ZIMSEC History, King Mzilikazi's journey from a Zulu general to the founder of the Ndebele State is a core examination topic:

1. Breakaway from Shaka (1822):
- Mzilikazi was a trusted general of Shaka. Following a victorious raid against the Somnapa clan, Mzilikazi refused to surrender the captured cattle tribute to Shaka.
- Facing Shaka's punitive force at Entumbane, Mzilikazi led approximately 300 warriors and followers across the Drakensberg mountains.

2. The Migration Trail:
- Highveld & Mosega: Absorbed Sotho, Pedi, and Tswana groups, building his army.
- Boer Pressure: After fierce clashes with Boer Voortrekkers (Battle of Vegkop 1836), Mzilikazi crossed the Limpopo River northward (1838–1840).
- Settlement in Zimbabwe: Established the Ndebele capital at Gibixhegu (near modern Bulawayo) in Matabeleland.

3. The 3-Tier Social Structure of the Ndebele State:
- Zansi: The aristocratic ruling class of original Nguni heritage who migrated from Zululand with Mzilikazi. Held top political, military, and spiritual offices.
- Enhla: Middle tier composed of Sotho and Tswana people absorbed during the migration through South Africa.
- Hole: The largest class, consisting of indigenous Kalanga, Rozvi, and Shona communities assimilated in Zimbabwe.

4. State Governance:
- The King (*Inkosi*): Absolute executive, judicial, military, and religious authority.
- Advisory Councils: Advised by the *Izikhulu* (senior elders and hereditary chiefs) and the *Umphakathi* (inner cabinet of trusted indunas).`,
        sourceTag: 'History 2167/9155 • Pre-Colonial States: The Ndebele Kingdom',
        suggestions: [
          'What caused the 1893 Anglo-Ndebele War?',
          'Compare the social positions of Zansi, Enhla, and Hole',
          'What was the role of the Inxwala ceremony in the Ndebele State?'
        ]
      };
    }

    // General Combined Topic: Zulu, Mfecane & Mzilikazi
    return {
      text: `### History: The Zulu Kingdom, King Shaka, the Mfecane, and King Mzilikazi

In ZIMSEC History (Syllabus 2167 & 9155), the transformation of Nguniland under King Shaka and the resulting Mfecane directly led to the birth of the Ndebele nation:

1. Rise of King Shaka & Zulu Military Reforms:
- Introduced the short stabbing spear (*iklwa*), large cowhide shields, discarded sandals for maneuverability, and developed the "cow-horn" (*izimpondo*) encirclement tactic.
- Reorganized youth into age-regiments (*amabutho*) residing in military barracks (*amakhanda*).

2. The Mfecane / Difaqane (c. 1815–1835):
- Catalysts: Severe drought (Madlathule famine), population pressure, competition for grazing lands, and rivalry over Portuguese ivory trade at Delagoa Bay.
- Result: Massive warfare and northward migrations of displaced groups across Southern and Central Africa.

3. King Mzilikazi's Defiance and Migration to Zimbabwe:
- In 1822, Mzilikazi Khumalo refused to hand over raided cattle to King Shaka and fled across the Drakensberg with about 300 followers.
- Moving through the Highveld, he absorbed Sotho and Tswana communities and crossed the Limpopo River into Zimbabwe around 1838–1840, establishing the Ndebele Kingdom with its capital at Gibixhegu (near Bulawayo).

4. Social Structure in Zimbabwe:
- Zansi: Aristocratic original Nguni leaders.
- Enhla: Assimilated Sotho and Tswana.
- Hole: Indigenous Kalanga and Shona communities absorbed in Zimbabwe.`,
      sourceTag: 'History 2167 • The Zulu State, Mfecane, and Ndebele Migration',
      suggestions: [
        'What were the main causes of the Mfecane?',
        'What military tactics did King Shaka invent?',
        'Describe the 3-tier social classes of the Ndebele State (Zansi, Enhla, Hole)',
        'Why did King Mzilikazi break away from King Shaka in 1822?'
      ]
    };
  }

  /**
   * King Lobengula, Rudd Concession, and 1893 War
   */
  private static handleLobengulaQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### History: King Lobengula, Colonial Treaties, and the 1893 Anglo-Ndebele War

In ZIMSEC History (Syllabus 2167), King Lobengula Khumalo\'s reign (1870–1894) was defined by intense diplomatic pressure from concession seekers and imperial conquest:

1. Deceptive Colonial Treaties & Concessions:
- Grobler Treaty (1887): Friendship treaty signed with Transvaal Boers.
- Moffat Treaty (February 1888): John Smith Moffat tricked Lobengula into promising not to sign away land to any other power without British High Commissioner consent.
- Rudd Concession (30 October 1888): Charles Rudd, Rochfort Maguire, and Francis Thompson obtained complete and exclusive mineral rights. Lobengula was deceived into believing only 10 white miners would dig, but Cecil Rhodes used the document to secure a British Royal Charter (1889) establishing the BSAC.

2. The 1893 Anglo-Ndebele War:
- Catalyst (The Victoria Incident, July 1893): Leander Starr Jameson created a pretext after Lobengula sent a punitive expedition to punish Shona subjects who damaged telegraph wires.
- Military Clashes: BSAC forces used devastating Maxim machine guns at the Battles of Shangani (25 October) and Bembesi (1 November).
- The Fall of Bulawayo: Lobengula set fire to his capital at Bulawayo and retreated northward.
- Battle of Pupu (Allan Wilson Patrol): Major Allan Wilson\'s 34-man patrol was completely wiped out by General Mtshane Khumalo\'s warriors at the Shangani River.`,
      sourceTag: 'History 2167 • Pre-Colonial Treaties & The 1893 War',
      suggestions: [
        'What were the verbal vs written terms of the Rudd Concession?',
        'What role did Maxim guns play in the 1893 Anglo-Ndebele War?',
        'Describe the Battle of Pupu and Allan Wilson\'s last stand'
      ]
    };
  }

  /**
   * First Chimurenga / Umvukela (1896 - 1897)
   * Comprehensive coverage for Grade 7 Social Science (7050), O-Level History (2167), and A-Level History (9155)
   */
  private static handleFirstChimurengaQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    const q = question.toLowerCase();
    const isPrimary = level.toLowerCase().includes('primary') || level.toLowerCase().includes('grade');
    const sourceTag = isPrimary
      ? 'Social Science 7050 • First Chimurenga / Umvukela (Topic 4)'
      : 'History 2167/9155 • The First Chimurenga / Umvukela (1896–1897)';

    // Sub-Intent 1: Mbuya Nehanda & Spiritual Mediums (Kaguvi, Mkwati, Gorzi, etc.) / Leaders
    if (
      q.includes('nehanda') ||
      (q.includes('kaguvi') && !q.includes('cause')) ||
      q.includes('spirit medium') ||
      q.includes('svikiro') ||
      q.includes('mkwati') ||
      q.includes('mukwati') ||
      q.includes('leader') ||
      q.includes('leadership') ||
      q.includes('who led') ||
      q.includes('who was the leader') ||
      q.includes('who were the leaders') ||
      q.includes('heroes') ||
      q.includes('organizer')
    ) {
      return {
        text: `### Spiritual Leadership in the First Chimurenga (1896 – 1897)

**Direct Answer:** In both ZIMSEC Primary Social Science (7050) and Secondary History (2167/9155), spirit mediums (*mhondoro* and *svikiro*) were the chief mobilizers and spiritual coordinators of the 1896–1897 uprisings across Mashonaland and Matabeleland.

1. Mbuya Nehanda (Charwe Nyakasikana) (c. 1840 – 1898):
- **Mediumship:** Charwe was the female spirit medium of the ancestral spirit Nehanda, based in the Mazowe Valley (Mashonaland Central).
- **Leadership & Mobilization:** United diverse Shona paramountcies (including chiefs Mashayamombe, Makoni, Chiweshe, and Hwata) to resist British South Africa Company (BSAC) occupation.
- **Intelligence Network:** Relied on runner messengers to coordinate coordinated ambushes against colonial outposts and mining camps.
- **Capture & Martyrdom:** Captured late in 1897 in the Mazowe hills; tried by the colonial High Court and sentenced to death.
- **Hanging (27 April 1898):** Hanged alongside Sekuru Kaguvi in Salisbury (Harare). She refused Christian baptism from Father Richartz and defiantly proclaimed her immortal dying prophecy:
  > *"Mapfupa angu achamuka"* ("My bones shall surely rise again!").
- This prophecy became the spiritual backbone and national inspiration for freedom fighters during the Second Chimurenga (1966–1979).

2. Sekuru Kaguvi (Gumboreshumba):
- Medium of the Kaguvi spirit (*mhondoro*), operating primarily in the Chishawasha, Goromonzi, and Mhondoro districts.
- Instigated and coordinated guerrilla attacks alongside Chief Mashayamombe. Baptized as "Dismas" shortly before his execution on 27 April 1898.

3. Mkwati (Mukwati) and Umlugulu (Matabeleland):
- Senior priests of the **Mwari / Mlimo Cult** headquartered at the sacred Njelele shrine in the Matobo Hills.
- Provided divine legitimacy to the Ndebele uprising (March 1896), assuring warriors that ancestral spirits would turn European bullets into water and restore cattle and land.`,
        sourceTag,
        suggestions: [
          'What were the main causes of the First Chimurenga?',
          'Why were the Africans defeated in the First Chimurenga?',
          'What was the Matobo Hills Indaba between Rhodes and Ndebele Indunas?'
        ]
      };
    }

    // Sub-Intent 2: Reasons for African Defeat / Matobo Hills Indaba
    if (
      q.includes('defeat') ||
      q.includes('lose') ||
      q.includes('lost') ||
      q.includes('fail') ||
      q.includes('crush') ||
      q.includes('indaba') ||
      q.includes('suppress')
    ) {
      return {
        text: `### History: Reasons for African Defeat in the First Chimurenga (1896 – 1897)

**Direct Answer:** Despite overwhelming African courage and terrain advantage, the BSAC forces prevailed due to technological superiority, scorched-earth tactics, and political division between regions.

1. Military & Technological Disparity:
- Settler forces were equipped with rapid-fire **Maxim machine guns**, 7-pounder mountain artillery, and repeating Martini-Henry and Lee-Metford rifles.
- Africans relied primarily on spears (*mapfumo*), axes, bows, and antiquated muzzle-loading muskets with low range and slow reload rates.

2. Settler Scorched-Earth Tactics & Cave Dynamiting:
- When Shona and Ndebele fighters retreated into defensive granite caves and hill fortresses (such as Domboshava, Mazowe, and the Matobo Hills), British imperial reinforcements dynamited the cave entrances, suffocating defenders and their families.
- Settler forces systematically torched standing crops, destroyed granaries, and looted cattle, forcing Africans into starvation and surrender.

3. Regional Division & The Matobo Hills Indabas (October 1896):
- Cecil John Rhodes held four separate peace negotiations (*Indabas*) with Ndebele Indunas (led by Somabhulana and Babiyane) in the Matobo Hills.
- Rhodes promised to remove the abusive Shona native police and recognize certain indunas, successfully halting the war in Matabeleland.
- This isolated the Shona in Mashonaland, allowing imperial forces under General Frederick Carrington to concentrate their full military might against Shona strongholds until late 1897.

4. Lack of Centralized Military Command:
- While spirit mediums coordinated regional sentiment, Shona chiefdoms operated largely as autonomous units rather than a single unified army.`,
        sourceTag,
        suggestions: [
          'What caused the First Chimurenga?',
          'What was the role of Mbuya Nehanda in 1896?',
          'How did the First Chimurenga lead to the Second Chimurenga?'
        ]
      };
    }

    // Sub-Intent 3: Comparison Between First and Second Chimurenga
    if (q.includes('second chimurenga') || q.includes('compare') || q.includes('difference')) {
      return {
        text: `### History: Comparison Between the First and Second Chimurenga

1. The First Chimurenga / Umvukela (1896 – 1897):
- **Opponent:** British South Africa Company (BSAC) chartered rule.
- **Weaponry:** Spears, knobkerries, shields, and obsolete muzzle-loading firearms against Maxim guns.
- **Leadership:** Spirit mediums (Mbuya Nehanda, Sekuru Kaguvi, Mkwati) and traditional chiefs (Mashayamombe, Makoni).
- **Organization:** Localized guerrilla attacks and cave defense; lacked external rear bases or international backing.
- **Outcome:** Military defeat, colonial entrenchment under the 1898 Order in Council, but left the enduring prophecy of liberation.

2. The Second Chimurenga (1966 – 1979):
- **Opponent:** Ian Smith's Rhodesian minority regime (UDI).
- **Weaponry:** Modern automatic weapons (AK-47, SKS, RPG-7 rocket launchers, surface-to-air missiles).
- **Leadership:** Modern nationalist political parties (**ZANU** and **ZAPU**) with organized military high commands (**ZANLA** under Josiah Tongogara and **ZIPRA** under Nikita Mangena / Lookout Masuku).
- **Organization:** Extensive peasant-guerrilla mass mobilization (*pungwes*), external training (China, USSR, Tanzania), and rear bases in Mozambique and Zambia.
- **Outcome:** Decisive political and military victory leading to the 1979 Lancaster House Agreement and genuine national independence on **18 April 1980**.`,
        sourceTag,
        suggestions: [
          'What were the causes of the First Chimurenga?',
          'What was the Battle of Chinhoyi (1966)?',
          'Who was General Josiah Tongogara?'
        ]
      };
    }

    // Default / Core Intent: Causes of the First Chimurenga / Umvukela
    return {
      text: `### History: Causes of the 1896 – 1897 First Chimurenga / Umvukela

**Direct Answer:** The First Chimurenga (Shona) / Umvukela (Ndebele) was the first widespread, armed anti-colonial resistance fought simultaneously by the Shona and Ndebele against British South Africa Company (BSAC) rule between March 1896 and late 1897.

In official ZIMSEC examinations (Primary Social Science 7050 & O/A-Level History 2167/9155), the causes are grouped into four essential categories:

1. Economic Causes (Primary Material Grievances):
- **Land Dispossession & Alienation:** The BSAC and white settler prospectors confiscated the most fertile agricultural lands on the high plateau, evicting indigenous populations into arid, rocky, and tsetse-fly-infested reserves (the **Gwayi and Shangani reserves**, established under the 1894 Land Commission).
- **Cattle Confiscation (Looting of Herds):** Following the 1893 Anglo-Ndebele War, the BSAC and settler volunteer forces illegally looted over **200,000 cattle** from the Ndebele kingdom. Cattle were the bedrock of African wealth, food security (*amasi*), and spiritual inheritance.
- **The Hut Tax (1894):** An annual cash tax of **10 shillings per hut** was imposed on African households. Because indigenous communities had an agrarian barter economy with no European cash, men were forced to leave their homes and work on settler mines and farms for exploitative wages.
- **Forced Labor (*Chibaro*):** Colonial Native Commissioners and police coerced African men into compulsory hard labor in dangerous underground gold mines and commercial farms, enforced through public floggings with the *sjambok*.

2. Political & Administrative Grievances:
- **Loss of Sovereignty & Royal Institutions:** Following King Lobengula's death in 1894, the BSAC abolished the Ndebele monarchy and disbanded the *amabutho* (military regiments). In Mashonaland, traditional paramount chiefs' judicial powers were usurped by colonial magistrates.
- **Brutality of the BSAC "Native Police":** The BSAC created an African auxiliary police force (often deploying Shona recruits in Matabeleland and vice-versa). These police officers abused their authority by extorting grain, confiscating livestock, and molesting African women.
- **Cruelty of Colonial Native Commissioners:** Officers like Campbell in Mwenezi and Brabant in Victoria ruled through arbitrary floggings, summary punishments, and disrespect of African customs.

3. Natural Disasters & Spiritual Catalysts:
- **Severe Drought & Locust Swarms (1895–1896):** Caused widespread crop failure and famine.
- **The 1896 Rinderpest Disease:** A deadly viral cattle epidemic swept through Southern Africa. BSAC authorities ordered the mass shooting and burning of African cattle to contain the outbreak, which Africans perceived as a deliberate colonial plot to destroy their remaining cattle.
- **Spiritual Intervention:** Respected spirit mediums—**Mbuya Nehanda (Charwe)**, **Sekuru Kaguvi (Gumboreshumba)**, and **Mkwati** of the Mwari/Mlimo cult—interpreted these calamities as ancestral (*Mhondoro*) wrath over white occupation, commanding the people to take up arms in holy resistance.

4. The Immediate Tactical Trigger (The Strategic Opening):
- **The Jameson Raid (December 1895):** Dr. Leander Starr Jameson gathered nearly the entire armed BSAC mounted police force on an unauthorized, disastrous raid into the Boer Republic of Transvaal.
- The raid ended in catastrophic failure and left Southern Rhodesia virtually undefended, providing the golden military opportunity for the Ndebele to rise in **March 1896**, followed by the Shona in **June 1896**.`,
      sourceTag,
      suggestions: [
        'What role did Mbuya Nehanda play in the First Chimurenga?',
        'Why were Africans defeated in the First Chimurenga?',
        'What was the Jameson Raid and how did it trigger the uprising?',
        'Compare the First Chimurenga with the Second Chimurenga'
      ]
    };
  }

  /**
   * Second Chimurenga / National Liberation War (1966 – 1979)
   * Fact-checked against official ZIMSEC Grade 7 Social Science (7050) & O-Level History (2167) / A-Level (9155)
   */
  private static handleSecondChimurengaQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    const q = question.toLowerCase();
    const isPrimary = level.toLowerCase().includes('primary') || level.toLowerCase().includes('grade');
    const sourceTag = isPrimary
      ? 'Social Science 7050 • Second Chimurenga & Independence (Topic 4)'
      : 'History 2167/9155 • The Second Chimurenga (1966–1979)';

    // Sub-Intent 1: Battle of Chinhoyi (28 April 1966)
    if (q.includes('chinhoyi') || q.includes('seven heroes') || q.includes('chinhoyi 7')) {
      return {
        text: `### History: The Battle of Chinhoyi (28 April 1966) – The Spark of the Second Chimurenga

**Direct Answer:** The **Battle of Chinhoyi on 28 April 1966** was the historic military clash that officially ignited the **Second Chimurenga** (armed liberation struggle) in Zimbabwe.

1. The Chinhoyi Seven (ZANLA Heroes):
- Seven courageous ZANLA freedom fighters infiltrated Rhodesia from Zambia:
  1. **David Guzuzu**
  2. **Simon Chimbodza (Nyandoro)**
  3. **Christopher Chatambudza**
  4. **Arthur Maramba**
  5. **Godwin Manyerenyere**
  6. **Chubby Savanhu**
  7. **Ephraim Shenjere**

2. The Battle:
- The 7 cadres were surrounded by Rhodesian security forces armed with jet bombers, helicopters, and heavily armed infantry.
- The freedom fighters fought valiantly for an entire day, refusing to surrender and killing scores of settler soldiers before running out of ammunition and making the ultimate sacrifice.

3. Significance in Zimbabwean History:
- Shattered the myth of white settler military invincibility.
- Marked the decisive shift from peaceful political petitions to armed revolutionary struggle.
- Commemorated nationally every year on **National Heroes Day** (in August).`,
        sourceTag,
        suggestions: [
          'What were the causes of the Second Chimurenga?',
          'What was the role of ZANLA and ZIPRA?',
          'Who was General Josiah Magama Tongogara?'
        ]
      };
    }

    // Sub-Intent 2: Lancaster House Conference (1979) & Independence (1980)
    if (q.includes('lancaster') || q.includes('independence') || q.includes('18 april') || q.includes('rufaro')) {
      return {
        text: `### History: The Lancaster House Conference (1979) and Zimbabwe Independence (1980)

**Direct Answer:** The **Lancaster House Conference (September – December 1979)** was held in London to negotiate the ceasefire and the constitution that ended the Second Chimurenga and led to the birth of independent Zimbabwe on **18 April 1980**.

1. Key Delegations & Leaders:
- **The Patriotic Front (PF Alliance):** Co-led by **Cde Robert Gabriel Mugabe** (ZANU) and **Dr. Joshua Mqabuko Nkomo** (ZAPU).
- **Rhodesian / Internal Settlement Delegation:** Bishop Abel Muzorewa and Ian Douglas Smith.
- **British Government (Chair):** Chaired by British Foreign Secretary **Lord Carrington**.

2. Crucial Points of Negotiation:
- **The Land Question:** The Patriotic Front insisted on the unconditional return of ancestral lands to the black majority. A compromise was struck: a 10-year "willing-buyer, willing-seller" clause, with Britain and the US promising financial aid to purchase commercial farms.
- **Democratic Majority Rule:** Universal adult suffrage (one person, one vote) with 20 guaranteed parliamentary seats reserved for the white minority for 7 years.
- **Ceasefire:** Monitored by the Commonwealth Ceasefire Monitoring Force.

3. The 1980 Historic Elections & Independence Day:
- Held in February 1980: ZANU (PF) won a landslide victory with 57 seats; PF-ZAPU won 20 seats.
- **Independence Midnight (17/18 April 1980):** The Union Jack was lowered and the new **Zimbabwe National Flag** was raised at **Rufaro Stadium** in Harare, with Cde Robert Mugabe sworn in as the first Prime Minister.`,
        sourceTag,
        suggestions: [
          'What were the causes of the Second Chimurenga?',
          'What was the 1987 Unity Accord?',
          'What was the role of the Patriotic Front?'
        ]
      };
    }

    // Sub-Intent 3: Land Apportionment Act (1930) & Land Tenure Act (1969)
    if (q.includes('land apportionment') || q.includes('land tenure') || q.includes('land act')) {
      return {
        text: `### History: Colonial Land Laws: The Land Apportionment Act (1930) and Land Tenure Act (1969)

**Direct Answer:** Colonial land laws were the chief structural grievance and primary economic cause of the Second Chimurenga, systematically dispossessing the indigenous African majority of fertile land.

1. The Land Apportionment Act (1930):
- Recommended by the Morris Carter Commission (1925) and enacted in 1930.
- Formally partitioned the country along strict racial lines:
  * **European Area:** ~49 million acres (51% of the country's best fertile land on the high plateau) reserved for ~50,000 white settlers.
  * **Native Reserves (Tribal Trust Lands):** ~21 million acres of poor, rocky, semi-arid land for over 1 million Africans.
  * **Native Purchase Areas:** ~7 million acres where wealthy blacks could purchase small farms.
- Africans were forbidden from owning land in commercial and urban areas.

2. The Land Tenure Act (1969):
- Enacted by Ian Smith's Rhodesian Front to entrench racial segregation.
- Divided Rhodesia into two equal halves: **44.9 million acres for Europeans** and **44.9 million acres for Africans**, despite black Africans outnumbering whites by more than 20 to 1.

3. Consequences:
- Severe overcrowding, erosion, and poverty in the reserves.
- Forced thousands of young Africans to join **ZANLA** and **ZIPRA** to fight for the reclaim of their ancestral heritage (*ivhu revhu*).`,
        sourceTag,
        suggestions: [
          'What were the other causes of the Second Chimurenga?',
          'What was the Fast Track Land Reform of 2000?',
          'Compare the Land Apportionment Act with the Land Tenure Act'
        ]
      };
    }

    // Sub-Intent 4: Causes of the Second Chimurenga (Default & Core Intent)
    return {
      text: `### History: Causes of the Second Chimurenga (1966 – 1979)

**Direct Answer:** The Second Chimurenga was the protracted armed national liberation struggle waged by nationalist forces (**ZANLA** and **ZIPRA**) against Ian Smith's white minority regime to overthrow colonial oppression and establish majority rule.

In official ZIMSEC examinations (Primary Social Science 7050 & O/A-Level History 2167/9155), the causes are grouped into four fundamental pillars:

1. Land Alienation & Dispossession:
- The **Land Apportionment Act (1930)** and **Land Tenure Act (1969)** stripped Africans of their ancestral fertile lands, crowding millions into infertile, drought-prone Native Reserves (Tribal Trust Lands).
- Overcrowding led to severe poverty, soil degradation, and destitution, creating the central revolutionary slogan: *"Tora gidi uzvitonge, ivhu kuvanhu"* (Take the gun and free yourself, return land to the people).

2. Unilateral Declaration of Independence (UDI, 11 November 1965):
- British decolonization policy required "No Independence Before Majority African Rule" (NIBMAR).
- To prevent black majority rule, Prime Minister **Ian Douglas Smith** illegally declared Rhodesia independent from Britain, defiantly declaring: *"No black majority rule in my lifetime, not in a thousand years"*.
- UDI slammed the door on constitutional progress, convincing African leaders that armed warfare was the only remaining option.

3. Banning of Nationalist Parties & Mass Detentions:
- The colonial government banned every peaceful African political organization: the ANC (1959), NDP (1961), ZAPU (1962), and ZANU (1964).
- Nationalist leaders—including **Dr. Joshua Nkomo**, **Cde Robert Mugabe**, **Leopold Takawira**, and **Ndabaningi Sithole**—were arrested and detained in isolated camps (Gonakudzingwa, Sikombela, and Whawha) for over 10 years without trial.

4. Racial Segregation & Economic Exploitation:
- **Denial of the Right to Vote:** High property, income, and educational voting qualifications disenfranchised over 95% of Africans.
- **Discriminatory Labour Laws:** The **Industrial Conciliation Act (1934)** barred black workers from forming recognized trade unions or entering skilled artisan jobs.
- **Pass Laws:** Under the Native Registration Act, Africans were forced to carry passes (*chitupa*) to move in urban centers and white areas.
- **Segregated Education & Healthcare:** Vast disparities in government spending, with white schools receiving up to twenty times more funding per child than black schools.`,
      sourceTag,
      suggestions: [
        'What was the Battle of Chinhoyi (1966)?',
        'What was the role of ZANLA and ZIPRA?',
        'Describe the 1979 Lancaster House Conference',
        'Who was General Josiah Magama Tongogara?'
      ]
    };
  }

  /**
   * Dedicated handler for Gallant Heroes & Heroines of the Second Chimurenga
   * Fact-checked against official ZIMSEC History (2167/9155) and Grade 7 Heritage Studies
   */
  private static handleNationalHeroesQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase();

    // General Josiah Magama Tongogara
    if (q.includes('tongogara') || q.includes('josiah tongogara')) {
      return {
        text: `### Gallant Heroes of Zimbabwe: General Josiah Magama Tongogara (1938 – 1979)

**Direct Answer:** General Josiah Magama Tongogara was the legendary **Commander of the Zimbabwe African National Liberation Army (ZANLA)** and Secretary for Defence in ZANU, recognized as the chief military architect of the Second Chimurenga.

1. Early Life & Military Training:
- Born in Nkabinde, Shurugwi, Midlands Province.
- Traveled to Zambia in 1960 and later underwent advanced military training at the prestigious **Nanjing Military Academy in China (1965–1966)**, mastering guerrilla warfare, mass mobilization, and political education.

2. Military Leadership in the Second Chimurenga:
- Appointed Commander of ZANLA in 1972 following the reorganization of Dare reChimurenga.
- Orchestrated the historic **northeastern offensive (Altenena Farm attack in Centenary on 21 December 1972)**, which shifted the war from isolated skirmishes to integrated peasant-guerrilla warfare.
- Insisted on unity between armed fighters and the masses: *"The people are the water and the guerrillas are the fish"* (Maoist military doctrine).
- Worked tirelessly with ZIPRA Commander Nikita Mangena to establish the **Zimbabwe People's Army (ZIPA)** in 1975 to unify the liberation armies.

3. Lancaster House & Tragic Passing:
- Played an instrumental role in military negotiations at the **1979 Lancaster House Conference** in London, insisting on democratic elections and the return of ancestral land.
- Tragically died in a motor vehicle accident on **26 December 1979** in Mozambique while traveling to brief ZANLA combatants on the ceasefire.
- Reburied at the **National Heroes Acre** in Harare.`,
        sourceTag: 'History 2167/9155 • Gallant Liberation Struggle Commanders',
        suggestions: [
          'What was the Battle of Chinhoyi (1966)?',
          'Who was Herbert Chitepo?',
          'What was the role of ZANLA and ZIPRA in the Second Chimurenga?'
        ]
      };
    }

    // Herbert Wiltshire Chitepo
    if (q.includes('chitepo') || q.includes('herbert chitepo')) {
      return {
        text: `### Gallant Heroes of Zimbabwe: Cde Herbert Wiltshire Chitepo (1923 – 1975)

**Direct Answer:** Cde Herbert Wiltshire Chitepo was Zimbabwe's **first black barrister (advocate)** and the distinguished **National Chairman of ZANU (1964–1975)** who organized and directed the external liberation struggle (*Dare reChimurenga*).

1. Education & Professional Firsts:
- Born in Watsomba, Mutasa district, Manicaland. Educated at St. Augustine's Mission (Penhalonga) and Adams College (South Africa).
- Earned a BA degree from Fort Hare University, studied law in London at King's College, and was called to the Bar at Gray's Inn in 1954, becoming the **first black barrister in Southern Rhodesia**.
- Defended prominent nationalist leaders (such as Joshua Nkomo) in colonial courts and served as Director of Public Prosecutions in newly independent Tanzania.

2. Leadership of Dare reChimurenga:
- When ZANU leaders inside Rhodesia were detained in 1964, Chitepo was tasked with leading the armed struggle from exile in Lusaka, Zambia.
- Formed the revolutionary council (*Dare reChimurenga*) in 1969 to coordinate military recruitment, logistics, and foreign diplomacy.
- Overseen the opening of the decisive northeastern war front in 1972.

3. Assassination & Legacy:
- Tragically assassinated by a Rhodesian intelligence car bomb outside his home in Lusaka on **18 March 1975**.
- His sacrifice inspired thousands of young Zimbabweans to cross into Mozambique and Zambia to join the liberation war. Interred at the National Heroes Acre in Harare.`,
        sourceTag: 'History 2167 • Nationalist Pioneers & Second Chimurenga',
        suggestions: [
          'Who was General Josiah Tongogara?',
          'What was Dare reChimurenga?',
          'What caused the 1896 First Chimurenga?'
        ]
      };
    }

    // Jason Ziyaphapha Moyo (J.Z. Moyo)
    if (q.includes('j.z. moyo') || q.includes('jz moyo') || q.includes('jason moyo')) {
      return {
        text: `### Gallant Heroes of Zimbabwe: Cde Jason Ziyaphapha Moyo (1924 – 1977)

**Direct Answer:** Cde Jason Ziyaphapha Moyo was a founding nationalist leader and the visionary **Commander and Head of the Military Council of ZIPRA**, who built ZAPU's armed wing into a formidable conventional and guerrilla force.

1. Nationalist Awakening:
- Born in Plumtree, Matabeleland South. Joined the trade union movement in Bulawayo and became an executive member of the Southern Rhodesia African National Congress (SRANC), NDP, and ZAPU.

2. Building ZIPRA & Patriotic Front:
- Spearheaded the external administration of ZAPU in Lusaka, mobilizing military supplies from the Soviet Union, Cuba, and frontline states.
- Instrumental in drafting the joint political-military agreement that created the **Patriotic Front (PF)** with ZANU in 1976.

3. Assassination:
- Assassinated by a letter parcel bomb sent by Rhodesian agents to his Lusaka office on **22 January 1977**. Interred at the National Heroes Acre in Harare.`,
        sourceTag: 'History 2167 • ZIPRA & Nationalist Leadership',
        suggestions: [
          'Who was Dr. Joshua Nkomo?',
          'What was the role of ZIPRA in the Second Chimurenga?',
          'Who was General Josiah Tongogara?'
        ]
      };
    }

    // Leopold Takawira ("The Lion of Chirumhanzu")
    if (q.includes('takawira') || q.includes('leopold takawira') || q.includes('lion of chirumhanzu')) {
      return {
        text: `### Gallant Heroes of Zimbabwe: Cde Leopold Takawira ("The Lion of Chirumhanzu") (1916 – 1970)

**Direct Answer:** Cde Leopold Takawira was the fiery founding **Vice President of ZANU** whose uncompromising courage earned him the moniker *"The Lion of Chirumhanzu"*.

1. Nationalist Activism:
- President of the African Teachers Association; later led the National Democratic Party (NDP).
- Famously denounced the 1961 Constitutional proposals negotiated by Joshua Nkomo from London, leading the call for one-man-one-vote without compromise.

2. Detention & Martyrdom:
- Arrested and detained by Ian Smith's regime at Sikombela and Salisbury Central Prison.
- Denied proper medical care while suffering from diabetes and died in detention on **15 June 1970**, becoming one of the first martyrs of the nationalist revolution.`,
        sourceTag: 'History 2167 • Nationalist Pioneers',
        suggestions: [
          'Who was Herbert Chitepo?',
          'Who was Robert Gabriel Mugabe?',
          'What was the Sikombela Declaration?'
        ]
      };
    }

    // Simon Vengai Muzenda ("Soul of the Nation")
    if (q.includes('muzenda') || q.includes('simon muzenda') || q.includes('soul of the nation')) {
      return {
        text: `### Gallant Heroes of Zimbabwe: Cde Simon Vengai Muzenda ("Soul of the Nation") (1922 – 2003)

**Direct Answer:** Cde Simon Vengai Muzenda was an icon of the liberation struggle, Vice President of ZANU, and **Vice President of the Republic of Zimbabwe from 1987 until 2003**, revered as the *"Soul of the Nation"*.

1. Cultural & Nationalist Roots:
- Born in Gutu, Masvingo Province. A master carpenter trained at Marianhill in South Africa.
- Famous for reciting Solomon Mutswairo's patriotic poem *"Nehanda Nyakasikana"* at rallies, rousing nationalist fervor.

2. Liberation Leadership:
- Co-founded ZANU in 1963. Detained at Whawha, Sikombela, and Harare Central Prison.
- Rejoined Robert Mugabe in Mozambique in 1975 to direct the prosecution of the armed struggle.
- Served with distinction as Deputy Prime Minister (1980) and Vice President (1987–2003).`,
        sourceTag: 'History 2167 • Nationalist Leadership of Zimbabwe',
        suggestions: [
          'What was the 1987 Unity Accord?',
          'Who was Cde Robert Mugabe?',
          'Who was Dr. Joshua Nkomo?'
        ]
      };
    }

    return null;
  }

  /**
   * Respiration & Cellular Energetics (ZIMSEC Primary AST 7030 & Secondary 4003 / Biology 4025)
   * High-precision, zero-hallucination answers structured specifically to what was asked.
   */
  private static handleRespirationQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult {
    const q = question.toLowerCase();
    const decomp = this.decomposeQuestion(question);
    const isPrimary = level.toLowerCase().includes('grade') || level.toLowerCase().includes('primary');

    const asksBreathingDiff = (q.includes('breathing') && (q.includes('difference') || q.includes('compare') || q.includes('vs'))) ||
      (q.includes('respiration') && q.includes('breathing'));
    const asksPhotosynthesisDiff = q.includes('photosynthesis') && (q.includes('difference') || q.includes('compare') || q.includes('vs'));
    const asksAnaerobic = q.includes('anaerobic') || q.includes('fermentation') || q.includes('lactic acid') || (q.includes('yeast') && q.includes('respiration'));
    const asksAerobic = q.includes('aerobic') && !q.includes('anaerobic');
    const asksRespiratoryOrgans = (q.includes('respiratory system') || q.includes('breathing mechanism') || q.includes('lungs') || q.includes('alveoli') || q.includes('inhalation') || q.includes('exhalation')) && !q.includes('what is respiration') && !q.includes('process of respiration');
    const asksTypes = (q.includes('types of respiration') || q.includes('two types') || q.includes('forms of respiration') || (q.includes('aerobic') && q.includes('anaerobic'))) && !asksBreathingDiff;
    const asksEquation = q.includes('equation') || q.includes('formula');

    // 1. Respiration vs Breathing
    if (asksBreathingDiff) {
      return {
        text: `### Respiration vs Breathing

#### Key Differences Between Respiration and Breathing
- **Nature of the Process:**
  * **Breathing (Ventilation):** A **physical / mechanical process** involving muscular movements of the diaphragm, ribs, and lungs to move air in and out.
  * **Respiration:** A **chemical / biochemical process** occurring inside living cells where glucose is broken down to release energy (ATP).
- **Site of Occurrence:**
  * **Breathing:** Occurs in the **respiratory organs** (nose, trachea, bronchi, lungs, and alveoli).
  * **Respiration:** Occurs inside **microscopic cells** (specifically the cytoplasm and mitochondria).
- **Energy Release:**
  * **Breathing:** Does **not produce energy**; in fact, it consumes energy for muscle contraction.
  * **Respiration:** **Releases vital energy (ATP)** required by the organism to stay alive.
- **Enzyme Involvement:**
  * **Breathing:** Does not involve enzymes.
  * **Respiration:** Controlled by a series of **respiratory enzymes**.`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Respiration vs Breathing' : 'Combined Science 4003 • Respiration vs Breathing',
        suggestions: [
          'What is the word equation for respiration?',
          'What is the difference between aerobic and anaerobic respiration?',
          'What are the parts of the human respiratory system?'
        ]
      };
    }

    // 2. Respiration vs Photosynthesis
    if (asksPhotosynthesisDiff) {
      return {
        text: `### Respiration vs Photosynthesis

#### Comparison Between Respiration and Photosynthesis
- **Purpose:**
  * **Respiration:** Breaks down food (glucose) to **release energy (ATP)** for life processes.
  * **Photosynthesis:** Uses light energy to **synthesize food (glucose)** from inorganic materials.
- **Where It Occurs:**
  * **Respiration:** In **all living cells** of plants and animals (in mitochondria and cytoplasm).
  * **Photosynthesis:** Only in **green plant cells** containing chlorophyll (in chloroplasts).
- **When It Happens:**
  * **Respiration:** Occurs **continuously day and night (24/7)**.
  * **Photosynthesis:** Occurs **only during the daytime** in the presence of sunlight.
- **Raw Materials (Inputs):**
  * **Respiration:** Glucose and Oxygen.
  * **Photosynthesis:** Carbon dioxide and Water.
- **End Products (Outputs):**
  * **Respiration:** Carbon dioxide, Water, and Energy.
  * **Photosynthesis:** Glucose and Oxygen.`,
        sourceTag: 'Combined Science 4003 • Respiration vs Photosynthesis',
        suggestions: [
          'What is the chemical equation for respiration?',
          'What is aerobic respiration?',
          'What is photosynthesis?'
        ]
      };
    }

    // 3. Anaerobic Respiration Specifically
    if (asksAnaerobic) {
      const sections: string[] = [];
      sections.push(`### Anaerobic Respiration`);

      sections.push(`#### 1. What is Anaerobic Respiration?
**Anaerobic respiration** is the breakdown of glucose to release energy **in the absence of oxygen** (or when oxygen supply is insufficient). It takes place entirely in the **cytoplasm** and yields much less energy than aerobic respiration (only ~2 ATP molecules per glucose).`);

      sections.push(`#### 2. The Two Forms of Anaerobic Respiration
1. **In Human Muscles (Lactic Acid Fermentation):**
   - Occurs during vigorous, strenuous exercise (e.g. sprinting) when blood cannot deliver oxygen fast enough to muscles.
   - **Equation:** Glucose → Lactic Acid + Energy (ATP)
   - **Consequences:** Accumulation of toxic **lactic acid** causes muscle fatigue, pain, and severe muscle cramps.
   - **Oxygen Debt:** The volume of extra oxygen required after exercise to oxidize and clear accumulated lactic acid in the liver back into glucose.
2. **In Yeast and Plant Cells (Alcoholic Fermentation):**
   - Occurs when yeast respires anaerobically without oxygen.
   - **Equation:** Glucose → Ethanol (Alcohol) + Carbon Dioxide + Energy (ATP)
   - **Practical Uses in Zimbabwe:**
     * **Brewing Industry:** Production of alcohol in traditional opaque beer (*chibuku / doro remasese*) and clear lager beers.
     * **Baking Industry:** Carbon dioxide bubbles expand and get trapped in dough, causing bread to rise softly.`);

      return {
        text: sections.join('\n\n'),
        sourceTag: 'ZIMSEC Combined Science 4003 • Anaerobic Respiration',
        suggestions: [
          'What is oxygen debt and how is it repaid?',
          'What is the difference between aerobic and anaerobic respiration?',
          'What is aerobic respiration?'
        ]
      };
    }

    // 4. Respiratory System & Breathing Mechanism (Organs, Inhalation, Exhalation)
    if (asksRespiratoryOrgans) {
      return {
        text: `### The Human Respiratory System

#### 1. Organs of the Respiratory System
- **Nose / Nasal Cavity:** Traps dust using tiny hairs (*cilia*) and mucus, while warming and moistening incoming air.
- **Trachea (Windpipe):** Reinforced with C-shaped rings of cartilage that keep the airway permanently open.
- **Bronchi & Bronchioles:** Subdivisions branching deep into the right and left lungs.
- **Alveoli (Air Sacs):** Microscopic air sacs where gas exchange happens. Adaptations:
  * Huge total surface area.
  * Very thin walls (one cell thick).
  * Dense network of blood capillaries.
  * Moist lining for oxygen to dissolve easily.

#### 2. Mechanism of Breathing (Ventilation)
1. **Inhalation (Breathing In):**
   - External intercostal muscles contract, pulling ribs **up and outward**.
   - Diaphragm contracts and **flattens downwards**.
   - Volume of the chest cavity (thorax) increases, decreasing internal lung pressure below atmospheric pressure.
   - Air rushes into the lungs from the higher outside pressure.
2. **Exhalation (Breathing Out):**
   - Intercostal muscles relax, ribs move **down and inward**.
   - Diaphragm relaxes, curving back into a **dome shape**.
   - Volume of thorax decreases, increasing lung pressure above atmospheric pressure.
   - Air is forced out of the lungs.`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Respiratory System' : 'Combined Science 4003 • Respiratory System',
        suggestions: [
          'What is the difference between respiration and breathing?',
          'How are alveoli adapted for gas exchange?',
          'What is respiration?'
        ]
      };
    }

    // 5. Types of Respiration (Aerobic vs Anaerobic)
    if (asksTypes) {
      return {
        text: `### Types of Respiration

#### The Two Main Types of Respiration
1. **Aerobic Respiration:**
   - **Oxygen:** Requires oxygen ($O_2$).
   - **Site:** Starts in the cytoplasm and is completed inside **mitochondria**.
   - **Breakdown:** Complete breakdown of glucose.
   - **Equation:** Glucose + Oxygen → Carbon Dioxide + Water + Energy (36–38 ATP)
   - **Energy Yield:** Very high energy release (~2880 kJ / 36–38 ATP per glucose molecule).
2. **Anaerobic Respiration:**
   - **Oxygen:** Occurs **without oxygen**.
   - **Site:** Takes place strictly in the **cytoplasm**.
   - **Breakdown:** Incomplete breakdown of glucose.
   - **Products:**
     * In human muscles: **Lactic acid** + small energy (causes muscle cramps).
     * In yeast: **Ethanol (alcohol)** + **Carbon dioxide** + small energy (fermentation).
   - **Energy Yield:** Very low energy release (~150 kJ / only 2 ATP per glucose molecule).`,
        sourceTag: 'ZIMSEC Combined Science 4003 • Types of Respiration',
        suggestions: [
          'What is anaerobic respiration in human muscles?',
          'What is the difference between respiration and breathing?',
          'Give the process of aerobic respiration'
        ]
      };
    }

    // 6. Respiration Query (Laser-focused to user intent)
    // 6A. Only Definition Asked
    if (decomp.asksOnlyDefinition) {
      const def = isPrimary
        ? '**Respiration** is the chemical process by which living cells break down digested food (glucose) using oxygen to **release energy** needed for life processes, producing carbon dioxide and water as waste products.'
        : '**Respiration** is the biochemical process occurring inside living cells whereby organic food substances (primarily glucose) are broken down through enzymatic reactions to **release energy in the form of ATP (adenosine triphosphate)** for cellular work.';

      return {
        text: `### Respiration\n\n${def}`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Respiration' : 'Combined Science 4003 • Cellular Respiration',
        suggestions: [
          'Give the process of respiration',
          'What is the word equation for respiration?',
          'What is the difference between respiration and breathing?'
        ]
      };
    }

    // 6B. Only Process Asked
    if (decomp.asksOnlyProcess) {
      const procText = isPrimary
        ? `1. **Absorption of Glucose:** Digested food (glucose) from the small intestine is absorbed into the bloodstream and delivered to body cells.\n2. **Inhalation of Oxygen:** Oxygen inhaled into the lungs diffuses across the alveoli into red blood cells and is carried to cells.\n3. **Chemical Reaction Inside Cells:** Inside every cell, oxygen reacts with glucose to break it down and unlock stored chemical energy.\n4. **Energy Release:** Energy is released to keep the body warm, build new cells, repair damaged tissues, and power muscle movement.\n5. **Removal of Waste Products:** Carbon dioxide and water vapor produced as by-products are carried by blood back to the lungs and exhaled.`
        : `1. **Glycolysis (Cytoplasm):** Glucose (6-carbon) is split in the cell cytoplasm into two molecules of pyruvate (3-carbon), producing an initial 2 ATP molecules without requiring oxygen.\n2. **Krebs Cycle / Citric Acid Cycle (Mitochondrial Matrix):** Pyruvate enters the mitochondria and is oxidized, releasing carbon dioxide ($CO_2$) and producing high-energy hydrogen carriers (NADH, $FADH_2$).\n3. **Oxidative Phosphorylation / Electron Transport Chain (Inner Mitochondrial Membrane):** Hydrogen electrons pass along the chain to oxygen, producing water ($H_2O$) and yielding approximately 32–34 ATP molecules.\n4. **Energy Utilization:** ATP powers cellular work including active transport, muscle contraction, and synthesis.`;

      return {
        text: `### Process of Respiration\n\n${procText}`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Respiration' : 'Combined Science 4003 • Cellular Respiration',
        suggestions: [
          'What is respiration?',
          'What is the word equation for respiration?',
          'What is the difference between aerobic and anaerobic respiration?'
        ]
      };
    }

    // 6C. Only Equation Asked
    if (asksEquation && !decomp.asksDefinition && !decomp.asksProcess) {
      const eqText = isPrimary
        ? `**Glucose + Oxygen → Carbon Dioxide + Water + Energy**\n\n- **Raw Materials (Reactants):** Glucose (from food) and Oxygen (from air).\n- **Products (Outputs):** Energy (used by the body), Carbon dioxide (waste gas exhaled), and Water.`
        : `* **Word Equation:**\n  Glucose + Oxygen → Carbon Dioxide + Water + Energy (ATP)\n* **Balanced Chemical Equation:**\n  $$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 2880\\text{ kJ (36-38 ATP)}$$`;

      return {
        text: `### Equation for Respiration\n\n${eqText}`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Respiration' : 'Combined Science 4003 • Cellular Respiration',
        suggestions: [
          'What is respiration?',
          'Give the process of respiration',
          'What is the difference between aerobic and anaerobic respiration?'
        ]
      };
    }

    // 6D. Compound or Explicit Multi-part Query (Include ONLY requested sections)
    const sections: string[] = [`### Respiration`];

    if (decomp.asksDefinition) {
      const def = isPrimary
        ? '**Respiration** is the chemical process by which living cells break down digested food (glucose) using oxygen to **release energy** needed for life processes, producing carbon dioxide and water as waste products.'
        : '**Respiration** is the biochemical process occurring inside living cells whereby organic food substances (primarily glucose) are broken down through enzymatic reactions to **release energy in the form of ATP (adenosine triphosphate)** for cellular work.';
      sections.push(`#### 1. What is Respiration?\n${def}`);
    }

    if (decomp.asksProcess) {
      const headingNum = sections.length;
      if (isPrimary) {
        sections.push(`#### ${headingNum}. The Process of Respiration\n1. **Absorption of Glucose:** Digested food (glucose) from the small intestine is absorbed into the bloodstream and delivered to body cells.\n2. **Inhalation of Oxygen:** Oxygen inhaled into the lungs diffuses across the alveoli into red blood cells and is carried to cells.\n3. **Chemical Reaction Inside Cells:** Inside every cell, oxygen reacts with glucose to break it down and unlock stored chemical energy.\n4. **Energy Release:** Energy is released to keep the body warm, build new cells, repair damaged tissues, and power muscle movement.\n5. **Removal of Waste Products:** Carbon dioxide and water vapor produced as by-products are carried by blood back to the lungs and exhaled.`);
      } else {
        sections.push(`#### ${headingNum}. The Process of Cellular Respiration\n1. **Glycolysis (Cytoplasm):** Glucose is split into pyruvate, yielding 2 ATP without oxygen.\n2. **Krebs Cycle (Mitochondria):** Pyruvate is oxidized, releasing $CO_2$ and generating NADH/$FADH_2$.\n3. **Electron Transport Chain:** Hydrogen electrons produce $H_2O$ and ~32-34 ATP.\n4. **Energy Utilization:** ATP powers cellular work.`);
      }
    }

    if (asksEquation) {
      const headingNum = sections.length;
      if (isPrimary) {
        sections.push(`#### ${headingNum}. Word Equation for Respiration\n**Glucose + Oxygen → Carbon Dioxide + Water + Energy**\n\n- **Reactants:** Glucose and Oxygen.\n- **Products:** Energy, Carbon dioxide, and Water.`);
      } else {
        sections.push(`#### ${headingNum}. Equations for Aerobic Respiration\n* **Word Equation:** Glucose + Oxygen → Carbon Dioxide + Water + Energy (ATP)\n* **Balanced Chemical Equation:** $$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 2880\\text{ kJ}$$`);
      }
    }

    return {
      text: sections.join('\n\n'),
      sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Respiration' : 'Combined Science 4003 • Cellular Respiration',
      suggestions: [
        'What is the difference between respiration and breathing?',
        'Compare aerobic and anaerobic respiration',
        'What happens during anaerobic respiration in muscles?'
      ]
    };
  }

  /**
   * Authoritative handler for Human Body Systems, Plant Biology, and Diseases
   * Eliminates hallucinations for primary and junior secondary science questions
   */
  private static handleHumanBodyAndDiseasesQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase();

    // 1. Digestive System
    if (
      q.includes('digestive system') ||
      q.includes('digestion') ||
      (q.includes('stomach') && q.includes('food')) ||
      q.includes('small intestine') ||
      q.includes('peristalsis') ||
      q.includes('alimentary canal')
    ) {
      return {
        text: `### The Human Digestive System

**Direct Answer:** The human digestive system breaks down large, insoluble food molecules into small, soluble nutrients that can be absorbed into the bloodstream.

1. Step-by-Step Path of Food (Alimentary Canal):
- **1. Mouth (Oral Cavity):**
  * Teeth perform mechanical breakdown (chewing/mastication).
  * Salivary glands produce saliva containing **salivary amylase (ptyalin)**, which digests cooked starch into maltose.
- **2. Esophagus (Gullet):**
  * Pushes the food bolus down to the stomach via rhythmic muscular contractions called **peristalsis**.
- **3. Stomach:**
  * Muscular churning mixes food with gastric juice.
  * **Hydrochloric acid (HCl):** Kills harmful bacteria and provides an acidic pH (~2) for enzyme activation.
  * **Pepsin enzyme:** Breaks down proteins into peptides.
- **4. Duodenum & Small Intestine (Ileum):**
  * **Liver & Gallbladder:** Produces **bile** (stored in gallbladder) which emulsifies fats into small droplets and neutralizes stomach acid.
  * **Pancreatic Juice:** Contains amylase, trypsin (protein digestion), and lipase (fat digestion into fatty acids + glycerol).
  * **Absorption:** The inner walls of the ileum are covered with millions of microscopic finger-like projections called **villi**, which maximize surface area for nutrient absorption into blood capillaries.
- **5. Large Intestine (Colon):**
  * Absorbs remaining water and mineral salts from undigested food matter.
- **6. Rectum & Anus:**
  * Stores feces and expels them through the anus (egestion/defecation).`,
        sourceTag: 'ZIMSEC Combined Science 4003 / Primary Science 7030 • Digestive System',
        suggestions: [
          'Explain the human circulatory system and heart structure',
          'What are the 3 main soil types in agriculture?',
          'What is the word equation for photosynthesis?'
        ]
      };
    }

    // 2. Circulatory System & Blood
    if (
      q.includes('circulatory system') ||
      q.includes('heart') ||
      q.includes('blood vessels') ||
      q.includes('arteries and veins') ||
      q.includes('components of blood') ||
      q.includes('red blood cells')
    ) {
      return {
        text: `### The Human Circulatory System & Blood

**Direct Answer:** The circulatory system transports oxygen, nutrients, hormones, and waste products (like carbon dioxide and urea) throughout the human body using the heart, blood vessels, and blood.

1. The Human Heart (4 Chambers):
- **Right Atrium:** Receives deoxygenated blood from the body via the **vena cava**.
- **Right Ventricle:** Pumps deoxygenated blood to the lungs via the **pulmonary artery**.
- **Left Atrium:** Receives freshly oxygenated blood from the lungs via the **pulmonary vein**.
- **Left Ventricle:** Pumps oxygenated blood to the rest of the body through the **aorta**. (Has the thickest, most muscular wall because it pumps blood at high pressure throughout the entire body).

2. Blood Vessels (Arteries, Veins, Capillaries):
- **Arteries:** Carry blood **away** from the heart under high pressure; thick muscular elastic walls; no valves (except at the heart base).
- **Veins:** Carry blood **towards** the heart under low pressure; thinner walls; contain **semi-lunar valves** to prevent the backflow of blood.
- **Capillaries:** Microscopic vessels, one-cell thick, that connect arteries and veins to allow rapid diffusion of oxygen, glucose, and waste.

3. Four Main Components of Blood:
- **Red Blood Cells (Erythrocytes):** Biconcave discs with no nucleus; contain **hemoglobin** to transport oxygen.
- **White Blood Cells (Leukocytes):** Phagocytes (engulf bacteria) and Lymphocytes (produce antibodies to fight infections).
- **Platelets (Thrombocytes):** Cell fragments that trigger blood clotting at wound sites to prevent excessive blood loss.
- **Plasma:** Pale yellow liquid (90% water) carrying dissolved nutrients, urea, carbon dioxide, hormones, and blood proteins.`,
        sourceTag: 'ZIMSEC Combined Science 4003 / Primary 7030 • Circulatory System',
        suggestions: [
          'What is the difference between arteries and veins?',
          'Explain the stages of the respiratory system',
          'What are the symptoms and causes of deficiency diseases?'
        ]
      };
    }

    // 3. Respiratory System & Respiration
    if (
      q.includes('respiration') ||
      q.includes('respiratory') ||
      q.includes('breathing') ||
      q.includes('lungs') ||
      q.includes('alveoli') ||
      q.includes('gas exchange') ||
      q.includes('inhalation')
    ) {
      return this.handleRespirationQuery(question, level, intent);
    }

    // 4. Deficiency Diseases (Nutrition)
    if (
      q.includes('deficiency disease') ||
      q.includes('kwashiorkor') ||
      q.includes('marasmus') ||
      q.includes('scurvy') ||
      q.includes('rickets') ||
      q.includes('goitre') ||
      q.includes('malnutrition')
    ) {
      if (q.includes('kwashiorkor')) {
        return {
          text: `### Kwashiorkor

#### 1. What is Kwashiorkor?
**Kwashiorkor** is a severe nutritional deficiency disease in young children caused by a **lack of protein** in their diet.

#### 2. Causes
- Diet predominantly composed of carbohydrates (like plain maize porridge) with little or no protein.
- Common during early childhood weaning when breast milk is replaced with low-protein starchy foods.

#### 3. Signs and Symptoms
- **Oedema (Swollen Potbelly and Puffy Feet):** Fluid buildup causing a distended belly and swollen feet/face.
- **Hair Changes:** Thin, dry, brittle reddish-brown or yellowish hair that easily plucks out.
- **Skin Changes:** Dark, peeling or flaky skin patches (*flaky paint dermatitis*).
- **Behavioural Symptoms:** Apathy, constant misery, irritability, and loss of appetite.

#### 4. Treatment and Prevention
- Feeding the child protein-rich foods: beans, fresh cow milk, eggs, groundnuts (*nzungu*), roundnuts (*nyimo*), kapenta (*matemba*), fish, and meat.
- Traditional high-protein porridges (*nhopi* or *bota rine dovi*).`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Health & Nutrition',
          suggestions: [
            'What is the difference between kwashiorkor and marasmus?',
            'What are the symptoms and causes of scurvy?',
            'What foods belong to the body-building food group?'
          ]
        };
      }

      if (q.includes('marasmus')) {
        return {
          text: `### Marasmus

#### 1. What is Marasmus?
**Marasmus** is a severe deficiency disease caused by a **total deficiency of all food nutrients and energy (starvation)**.

#### 2. Causes
- Severe shortage of food energy (calories, carbohydrates, fats, and proteins).
- Chronic starvation, early cessation of breastfeeding, or severe recurrent diarrhea.

#### 3. Signs and Symptoms
- **Extreme Muscle Wasting:** Severe loss of muscle and body fat; ribs are prominent ("skin and bone").
- **Old Person's Face:** Wrinkled, hollow facial appearance like an elderly person.
- **Alert and Ravenously Hungry:** Unlike kwashiorkor children, marasmic children are eager to eat.

#### 4. Treatment and Prevention
- Gradual feeding of a balanced, energy-dense diet with carbohydrates, fats, and proteins, combined with oral rehydration.`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Health & Nutrition',
          suggestions: [
            'What is the difference between kwashiorkor and marasmus?',
            'What causes rickets in children?',
            'What are the three main food groups?'
          ]
        };
      }

      if (q.includes('scurvy')) {
        return {
          text: `### Scurvy

#### 1. What is Scurvy?
**Scurvy** is a deficiency disease caused by a severe lack of **Vitamin C (Ascorbic Acid)** in the diet.

#### 2. Symptoms
- Swollen, bleeding gums and loosened teeth.
- Slow healing of wounds and cuts.
- Painful swollen joints and bleeding under the skin.

#### 3. Prevention and Cure
- Consuming fresh citrus fruits (oranges, lemons, tangerines), guavas, mangoes, tomatoes, and fresh leafy greens.`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Health & Nutrition',
          suggestions: [
            'What are the symptoms of rickets?',
            'What causes kwashiorkor?',
            'What is a balanced diet?'
          ]
        };
      }

      if (q.includes('rickets')) {
        return {
          text: `### Rickets

#### 1. What is Rickets?
**Rickets** is a deficiency disease in children caused by a lack of **Vitamin D or Calcium**, leading to soft, weak bones.

#### 2. Symptoms
- Soft, pliable bones that bend outward under body weight resulting in **bow legs** or **knock-knees**.
- Swollen wrists and ankles; delayed tooth formation.

#### 3. Prevention and Cure
- Regular exposure to morning sunlight (which activates Vitamin D synthesis in the skin).
- Consuming milk, dairy products, eggs, and fish liver oil.`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Health & Nutrition',
          suggestions: [
            'How is Vitamin D synthesized in human skin?',
            'What causes kwashiorkor and marasmus?',
            'What are the protective foods in nutrition?'
          ]
        };
      }

      if (q.includes('goitre')) {
        return {
          text: `### Goitre

#### 1. What is Goitre?
**Goitre** is a deficiency condition caused by a lack of the mineral **Iodine** in the diet.

#### 2. Symptoms
- Abnormal enlargement or swelling of the **thyroid gland** located at the front base of the neck.
- Difficulty swallowing or breathing in advanced cases.

#### 3. Prevention
- Consuming **iodised kitchen salt** and saltwater fish/seafood.`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Health & Nutrition',
          suggestions: [
            'Why is iodised salt important in cooking?',
            'What causes anaemia in children?',
            'What are deficiency diseases?'
          ]
        };
      }

      // General Deficiency Diseases Overview
      return {
        text: `### Nutritional Deficiency Diseases

#### 1. What are Deficiency Diseases?
**Deficiency diseases** are illnesses caused by a long-term lack of specific essential nutrients (proteins, vitamins, or minerals) in a person's diet.

#### 2. Common Deficiency Diseases Tested in ZIMSEC
1. **Kwashiorkor:** Lack of **protein**; causes swollen belly (oedema), peeling skin, and reddish-yellow hair.
2. **Marasmus:** Shortage of **total food energy/calories**; causes severe muscle wasting ("skin and bone").
3. **Scurvy:** Lack of **Vitamin C**; causes bleeding gums and loose teeth.
4. **Rickets:** Lack of **Vitamin D / Calcium**; causes soft bones resulting in bow legs.
5. **Goitre:** Lack of **Iodine**; causes swelling of the thyroid gland in the neck.
6. **Anaemia:** Lack of **Iron**; causes extreme tiredness, dizziness, and pale skin.
7. **Night Blindness:** Lack of **Vitamin A**; causes poor vision in dim light.`,
        sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Health & Nutrition',
        suggestions: [
          'What is the difference between kwashiorkor and marasmus?',
          'What are the symptoms and causes of scurvy?',
          'What is a balanced diet?'
        ]
      };
    }

    // 5. Infectious Diseases in Zimbabwe (Malaria, Cholera, Bilharzia, Typhoid)
    if (
      q.includes('malaria') ||
      q.includes('cholera') ||
      q.includes('bilharzia') ||
      q.includes('schistosomiasis') ||
      q.includes('typhoid') ||
      q.includes('waterborne disease')
    ) {
      if (q.includes('malaria')) {
        return {
          text: `### Health & Science: Malaria

#### 1. What is Malaria?
**Malaria** is a life-threatening infectious disease caused by the protozoan parasite **Plasmodium**, transmitted to humans through the bites of infected female mosquitoes.

#### 2. Transmission Vector
- **Vector:** Female **Anopheles mosquito**, which feeds on human blood primarily between dusk and dawn.

#### 3. Signs and Symptoms
- Recurring high fevers accompanied by intense shivering and chills.
- Profuse sweating as the fever breaks.
- Severe headaches, muscle aches, nausea, vomiting, and anaemia.

#### 4. Prevention and Control
- **Sleeping under Insecticide-Treated Nets (ITNs)** every night.
- **Indoor Residual Spraying (IRS):** Spraying interior walls with approved insecticides.
- **Environmental Management:** Clearing tall grass and draining stagnant water puddles near homes to destroy mosquito breeding grounds.
- Seeking immediate medical testing and treatment with artemisinin-based combination therapies (ACTs).`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Malaria',
          suggestions: [
            'What is the life cycle of a mosquito?',
            'How is cholera spread and prevented?',
            'What are the symptoms of bilharzia?'
          ]
        };
      }

      if (q.includes('cholera')) {
        return {
          text: `### Health & Science: Cholera

#### 1. What is Cholera?
**Cholera** is an acute, highly contagious waterborne bacterial disease caused by infection of the intestine with **Vibrio cholerae**.

#### 2. Transmission
- Ingesting water or food contaminated with human feces containing cholera bacteria.
- Poor sanitation, broken sewage pipes, and drinking from untreated shallow wells.

#### 3. Signs and Symptoms
- Sudden onset of profuse, painless watery diarrhea resembling **"rice-water"**.
- Severe vomiting and rapid loss of body fluids.
- Extreme dehydration, sunken eyes, muscle cramps, and rapid collapse if untreated.

#### 4. Prevention and Control
- **Safe Water:** Boiling all drinking water vigorously or treating with chlorine tablets (WaterGuard).
- **Hand Hygiene:** Washing hands thoroughly with soap and running water before handling food and after using the toilet.
- **Safe Sanitation:** Disposing of human excreta safely in Ventilated Improved Pit (Blair VIP) latrines.
- **Immediate First Aid:** Administering Oral Rehydration Solution (ORS) immediately while seeking urgent clinic care.`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Cholera',
          suggestions: [
            'What is Oral Rehydration Solution (ORS) and how is it made?',
            'How does a Blair VIP latrine prevent flies and smell?',
            'What are the causes and symptoms of malaria?'
          ]
        };
      }

      if (q.includes('bilharzia') || q.includes('schistosomiasis')) {
        return {
          text: `### Health & Science: Bilharzia (Schistosomiasis)

#### 1. What is Bilharzia?
**Bilharzia** is a parasitic disease caused by blood flukes (parasitic flatworms called **Schistosoma**).

#### 2. Transmission & Intermediate Host
- **Intermediate Host:** **Freshwater snails** living in slow-moving rivers, dams, and irrigation canals.
- Cercariae larvae leave the snails, swim in water, and burrow through human skin when people bathe, swim, or wade in contaminated water.

#### 3. Signs and Symptoms
- **Urinary Bilharzia:** Blood in urine (*haematuria*) and painful urination.
- **Intestinal Bilharzia:** Blood in stool, abdominal pain, diarrhea, and fatigue.
- Stunted physical growth and learning difficulties in children.

#### 4. Prevention and Control
- Avoiding swimming, bathing, or washing in slow-moving rivers, dams, or canals.
- Wearing gumboots and protective clothing when working in marshy irrigation schemes.
- Community mass drug administration using **praziquantel** tablets.`,
          sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Bilharzia',
          suggestions: [
            'What role do freshwater snails play in spreading bilharzia?',
            'What are waterborne diseases?',
            'How is cholera prevented in communities?'
          ]
        };
      }

      // General Infectious Diseases
      return {
        text: `### Health & Science: Infectious Diseases in Zimbabwe

#### 1. What are Infectious Diseases?
**Infectious diseases** are illnesses caused by pathogenic microorganisms (such as bacteria, viruses, protozoa, or parasites) that spread from person to person, through contaminated water and food, or via insect vectors.

#### 2. Major Infectious Diseases in Zimbabwe
1. **Malaria:** Caused by *Plasmodium* parasites transmitted by female *Anopheles* mosquitoes.
2. **Cholera:** Waterborne bacterial infection (*Vibrio cholerae*) causing rice-water diarrhea and severe dehydration.
3. **Bilharzia:** Parasitic worm disease transmitted in freshwater through snail hosts; causes blood in urine.
4. **Typhoid:** Bacterial infection (*Salmonella typhi*) spread through contaminated food and water.
5. **Tuberculosis (TB):** Airborne bacterial infection (*Mycobacterium tuberculosis*) affecting lungs; spread by coughing.`,
        sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Infectious Diseases',
        suggestions: [
          'What are the symptoms and prevention of malaria?',
          'How is cholera spread and prevented?',
          'What are the symptoms of bilharzia?'
        ]
      };
    }

    return null;
  }

  /**
   * Photosynthesis: Light & Dark Reactions
   */
  private static handlePhotosynthesisQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    const q = question.toLowerCase();
    const decomp = this.decomposeQuestion(question);
    const isPrimary = level.toLowerCase().includes('grade') || level.toLowerCase().includes('primary');

    if (isPrimary) {
      const sections: string[] = [];
      sections.push(`### Photosynthesis`);

      sections.push(`#### 1. What is Photosynthesis?
**Photosynthesis** is the process by which green plants manufacture their own food (glucose) from carbon dioxide and water using sunlight trapped by chlorophyll in their leaves.`);

      sections.push(`#### 2. Requirements and Products of Photosynthesis
* **Raw Materials (Inputs):**
  - **Water (H₂O):** Absorbed from the soil by root hair cells through osmosis.
  - **Carbon Dioxide (CO₂):** Taken in from the atmosphere through tiny leaf pores called **stomata**.
* **Energy Source & Trap:**
  - **Sunlight:** Trapped by the green pigment **chlorophyll** found inside chloroplasts.
* **End Products (Outputs):**
  - **Glucose (Sugar):** Used for plant energy or converted into stored starch.
  - **Oxygen (O₂):** Released into the atmosphere through stomata for living organisms to breathe.`);

      sections.push(`#### 3. Word Equation for Photosynthesis
Carbon Dioxide + Water → Glucose + Oxygen (in the presence of sunlight and chlorophyll)`);

      return {
        text: sections.join('\n\n'),
        sourceTag: 'ZIMSEC Grade 7 Science and Technology 7030 • Photosynthesis',
        suggestions: [
          'What is the word equation for photosynthesis?',
          'What is the role of chlorophyll in plants?',
          'How do you test a green leaf for starch using iodine?'
        ]
      };
    }

    // Secondary / O-Level & A-Level
    const asksStages = q.includes('light') || q.includes('dark') || q.includes('calvin') || q.includes('thylakoid') || q.includes('photolysis');

    const sections: string[] = [];
    sections.push(`### Photosynthesis`);

    sections.push(`#### 1. What is Photosynthesis?
**Photosynthesis** is the biochemical process by which green plants synthesize organic nutrients (glucose) from inorganic raw materials (carbon dioxide and water) using light energy trapped by chlorophyll.`);

    if (asksStages) {
      sections.push(`#### 2. The Two Stages of Photosynthesis
1. **Light-Dependent Stage (Light Reactions):**
   - **Site:** Thylakoid membranes (grana) inside chloroplasts.
   - **Photolysis of Water:** Solar energy splits water molecules into hydrogen ions, electrons, and oxygen gas:
     2H₂O → 4H⁺ + 4e⁻ + O₂
   - **Products:** Oxygen gas (O₂) released as a byproduct; energy carriers ATP and reduced NADP (NADPH) are synthesized.
2. **Light-Independent Stage (Dark Reactions / Calvin Cycle):**
   - **Site:** Stroma (liquid matrix) of the chloroplast.
   - **Carbon Fixation:** Carbon dioxide (CO₂) combines with ribulose bisphosphate (RuBP), catalyzed by RuBisCO.
   - **Reduction & Glucose Synthesis:** Hydrogen from NADPH, powered by ATP, reduces fixed carbon to form glucose.`);
    } else {
      sections.push(`#### 2. Chemical Equation & Process
6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in the presence of light and chlorophyll)

- **Inputs:** Carbon dioxide (from air via stomata) and water (from soil via xylem).
- **Energy Source:** Absorbed by chlorophyll in chloroplasts.
- **Outputs:** Glucose (stored as starch or used in respiration) and oxygen.`);
    }

    return {
      text: sections.join('\n\n'),
      sourceTag: 'Combined Science 4003 • Biology: Photosynthesis',
      suggestions: [
        'How do you test a green leaf for starch using iodine?',
        'What are the limiting factors of photosynthesis?',
        'Compare the light-dependent and light-independent stages'
      ]
    };
  }

  /**
   * Cell Biology & Transport Mechanisms: Osmosis, Diffusion & Active Transport
   */
  private static handleOsmosisAndCellTransportQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult {
    const q = question.toLowerCase();
    const decomp = this.decomposeQuestion(question);
    const isPrimary = level.toLowerCase().includes('grade') || level.toLowerCase().includes('primary');

    const asksDiffusion = q.includes('diffusion') && !q.includes('osmosis');
    const asksActiveTransport = q.includes('active transport');

    // 1. Diffusion
    if (asksDiffusion) {
      const sections: string[] = [];
      sections.push(`### Diffusion`);

      if (decomp.asksDefinition) {
        sections.push(`#### 1. What is Diffusion?
**Diffusion** is the net movement of particles from a region of higher concentration to a region of lower concentration down a concentration gradient as a result of their random kinetic motion.`);
      }

      if (decomp.asksProcess || (!decomp.asksDefinition && !decomp.asksExamples)) {
        const h = decomp.asksDefinition ? '#### 2. Factors Affecting the Rate of Diffusion' : '#### Factors Affecting the Rate of Diffusion';
        sections.push(`${h}
- **Concentration Gradient:** A steeper difference in concentration increases the rate of diffusion.
- **Temperature:** Higher temperature gives particles more kinetic energy, making them move faster.
- **Surface Area:** A larger membrane surface area allows more particles to diffuse at the same time.
- **Diffusion Distance:** A thinner membrane or shorter distance speeds up diffusion.`);
      }

      if (decomp.asksExamples) {
        const h = sections.length > 1 ? `#### ${sections.length}. Key Biological Examples` : '#### Key Biological Examples';
        sections.push(`${h}
- **In Human Lungs:** Oxygen diffuses from alveoli into blood capillaries; carbon dioxide diffuses from blood into alveoli.
- **In Plant Leaves:** Carbon dioxide diffuses into leaf cells through open stomata; oxygen diffuses out.`);
      }

      return {
        text: sections.join('\n\n'),
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Diffusion' : 'Combined Science 4003 • Diffusion',
        suggestions: [
          'What is osmosis and give the process of osmosis?',
          'What are the factors affecting diffusion rate?',
          'Compare diffusion and active transport'
        ]
      };
    }

    // 2. Active Transport
    if (asksActiveTransport) {
      const sections: string[] = [];
      sections.push(`### Active Transport`);

      if (decomp.asksDefinition) {
        sections.push(`#### 1. What is Active Transport?
**Active Transport** is the movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration (against a concentration gradient) using energy from cellular respiration (ATP) and carrier proteins.`);
      }

      if (decomp.asksProcess || (!decomp.asksDefinition && !decomp.asksExamples)) {
        const h = decomp.asksDefinition ? '#### 2. Key Features of Active Transport' : '#### Key Features of Active Transport';
        sections.push(`${h}
- **Direction:** Moves particles **against** the concentration gradient (from low to high concentration).
- **Energy Requirement:** Requires **cellular energy (ATP)** produced by mitochondria during respiration.
- **Carrier Proteins:** Membrane proteins bind to specific particles and actively pump them across.`);
      }

      if (decomp.asksExamples) {
        const h = sections.length > 1 ? `#### ${sections.length}. Biological Examples` : '#### Biological Examples';
        sections.push(`${h}
- **In Plants:** Root hair cells absorb mineral ions (nitrates, potassium) from low soil concentrations.
- **In Humans:** Small intestine epithelial cells absorb glucose against a concentration gradient.`);
      }

      return {
        text: sections.join('\n\n'),
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Active Transport' : 'Combined Science 4003 • Active Transport',
        suggestions: [
          'Why do active transport cells contain many mitochondria?',
          'What is the difference between osmosis and active transport?',
          'What is osmosis and give the process of osmosis?'
        ]
      };
    }

    // 3. Difference Between Osmosis and Diffusion
    if (decomp.asksDifference) {
      return {
        text: `### Comparison of Osmosis and Diffusion

#### Key Differences Between Osmosis and Diffusion
- **Substance Moving:**
  * **Diffusion:** Any gas, liquid, or dissolved solute particles (e.g. oxygen, carbon dioxide, glucose).
  * **Osmosis:** **Water molecules only** (solvent).
- **Membrane Requirement:**
  * **Diffusion:** Does not require a membrane (occurs freely in air or liquids).
  * **Osmosis:** **Must pass through a partially permeable (semi-permeable) membrane**.
- **Direction of Movement:**
  * **Diffusion:** Down a concentration gradient (from higher solute concentration to lower solute concentration).
  * **Osmosis:** Down a water potential gradient (from higher water potential / dilute solution to lower water potential / concentrated solution).
- **Energy (ATP) Requirement:**
  * Both are **passive processes** requiring no cellular energy (ATP).`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science 7030 • Osmosis vs Diffusion' : 'Combined Science 4003 • Osmosis vs Diffusion',
        suggestions: [
          'What is osmosis and give the process of osmosis?',
          'What are the effects of osmosis on plant cells?',
          'What is active transport?'
        ]
      };
    }

    // 4. Osmosis (Strictly tailored to user intent)
    // 4A. Only Definition Asked
    if (decomp.asksOnlyDefinition) {
      const def = isPrimary
        ? '**Osmosis** is the movement of water molecules from a region where there is more water (a dilute solution) to a region where there is less water (a concentrated solution) through a **partially permeable (semi-permeable) membrane**.'
        : '**Osmosis** is the net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution) through a **partially permeable membrane** down a water potential gradient.';

      return {
        text: `### Osmosis\n\n${def}`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science and Technology 7030 • Osmosis' : 'ZIMSEC Combined Science 4003 • Osmosis',
        suggestions: [
          'Give the process of osmosis',
          'What is the difference between osmosis and diffusion?',
          'What are the effects of osmosis on plant cells?'
        ]
      };
    }

    // 4B. Only Process Asked
    if (decomp.asksOnlyProcess) {
      return {
        text: `### Process of Osmosis\n\n1. **Membrane Barrier:** Two solutions of different solute concentrations are separated by a partially permeable cell membrane containing microscopic pores.\n2. **Water Molecule Distribution:** The dilute solution (or pure water) has a higher concentration of free water molecules, while the concentrated solution has fewer free water molecules clustered around solute particles.\n3. **Random Molecular Movement:** Water molecules on both sides constantly move with kinetic energy and pass through the membrane pores in both directions.\n4. **Net Flow of Water:** Because there are more free water molecules on the dilute side, more water molecules pass into the concentrated solution than in reverse.\n5. **Dynamic Equilibrium:** Water continues to move until concentrations balance or until cell wall turgor pressure halts further net movement.`,
        sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science and Technology 7030 • Osmosis' : 'ZIMSEC Combined Science 4003 • Osmosis',
        suggestions: [
          'What is osmosis?',
          'What is the difference between osmosis and diffusion?',
          'What are the effects of osmosis on plant cells?'
        ]
      };
    }

    // 4C. Compound or Multi-part Query (Include ONLY requested sections)
    const sections: string[] = [`### Osmosis`];

    if (decomp.asksDefinition) {
      const def = isPrimary
        ? '**Osmosis** is the movement of water molecules from a region where there is more water (a dilute solution) to a region where there is less water (a concentrated solution) through a **partially permeable (semi-permeable) membrane**.'
        : '**Osmosis** is the net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution) through a **partially permeable membrane** down a water potential gradient.';
      sections.push(`#### 1. What is Osmosis?\n${def}`);
    }

    if (decomp.asksProcess) {
      const headingNum = sections.length;
      sections.push(`#### ${headingNum}. The Process of Osmosis\n1. **Membrane Barrier:** Two solutions of different solute concentrations are separated by a partially permeable cell membrane containing microscopic pores.\n2. **Water Molecule Distribution:** The dilute solution (or pure water) has a higher concentration of free water molecules, while the concentrated solution has fewer free water molecules clustered around solute particles.\n3. **Random Molecular Movement:** Water molecules on both sides constantly move with kinetic energy and pass through the membrane pores in both directions.\n4. **Net Flow of Water:** Because there are more free water molecules on the dilute side, more water molecules pass into the concentrated solution than in reverse.\n5. **Dynamic Equilibrium:** Water continues to move until concentrations balance or until cell wall turgor pressure halts further net movement.`);
    }

    if (decomp.asksEffects) {
      const headingNum = sections.length;
      sections.push(`#### ${headingNum}. Effects of Osmosis on Living Cells\n* **In Plant Cells:**\n  - *In Dilute Water (Hypotonic):* Water enters the central vacuole. The cell becomes **turgid**, which supports soft stems and leaves. The strong cellulose cell wall prevents bursting.\n  - *In Concentrated Solution (Hypertonic):* Water leaves the vacuole. The cytoplasm pulls away from the cell wall (**plasmolysis**), causing the plant to **wilt**.\n* **In Animal Cells (e.g. Red Blood Cells):**\n  - *In Pure Water:* Water enters by osmosis. Lacking a cell wall, the cell swells and bursts (**haemolysis / lysis**).\n  - *In Concentrated Solution:* Water leaves the cell; red blood cells shrink and wrinkle (**crenation**).`);
    }

    if (decomp.asksExamples && !decomp.asksProcess) {
      const headingNum = sections.length;
      sections.push(`#### ${headingNum}. Everyday Examples in Zimbabwe\n- **Plant Root Absorption:** Root hair cells absorb soil water down a water potential gradient via osmosis.\n- **Traditional Food Preservation:** Coarse salt on meat strips (*mukonde / biltong*) draws water out of bacterial cells by osmosis, killing bacteria and preventing spoilage.`);
    }

    return {
      text: sections.join('\n\n'),
      sourceTag: isPrimary ? 'ZIMSEC Grade 7 Science and Technology 7030 • Osmosis' : 'ZIMSEC Combined Science 4003 • Osmosis',
      suggestions: [
        'What is the difference between osmosis and diffusion?',
        'What are the effects of osmosis on plant cells?',
        'Why do plant cells not burst in pure water while animal cells do?'
      ]
    };
  }

  /**
   * Natural Farming Regions of Zimbabwe
   */
  private static handleFarmingRegionsQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### Natural Farming Regions of Zimbabwe

Zimbabwe is divided into five Natural Agro-Ecological Farming Regions based on rainfall, temperature, altitude, and agricultural suitability:

- Region I (Specialized & Diversified Farming): High altitude (>1200m) in the Eastern Highlands (Nyanga, Chimanimani). High rainfall (>1000 mm/year). Tea, coffee, macadamia nuts, forestry (pine, wattle, eucalyptus), and deciduous fruits.
- Region II (Intensive Farming): Highveld (Harare, Mazowe, Marondera). Reliable rainfall (750–1000 mm/year). Intensive crop production: maize, tobacco, soybeans, wheat, and dairy farming.
- Region III (Semi-Intensive Farming): Midveld (Midlands, Kadoma, Gweru). Moderate rainfall (500–750 mm/year) with frequent mid-season dry spells. Drought-resistant maize, sunflowers, cotton, sorghum, and beef cattle.
- Region IV (Semi-Extensive Farming): Low-lying areas (Matabeleland North/South). Low, erratic rainfall (450–650 mm/year). Livestock ranching (drought-hardy beef cattle) and drought-tolerant grains (pearl millet, sorghum).
- Region V (Extensive Farming / Lowveld - Chiredzi, Mwenezi, Beitbridge): Very low altitude (<500m), hot temperatures, and scarce rainfall (<450 mm/year). Agriculture relies entirely on commercial irrigation (sugarcane at Hippo Valley and Triangle Estates using Lake Mutirikwi and Tugwi-Mukosi dams) and extensive wildlife conservancies (Gonarezhou National Park).`,
      sourceTag: 'Geography & Agriculture • Natural Farming Regions',
      suggestions: [
        'What makes Natural Farming Region 5 suitable for sugarcane in Chiredzi?',
        'Compare agricultural activities in Region 1 and Region 5',
        'Which dams supply irrigation water to Chiredzi?'
      ]
    };
  }

  /**
   * Great Zimbabwe, Mutapa, and Rozvi States
   */
  private static handlePreColonialStatesQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### History: Pre-Colonial States: Great Zimbabwe, Mutapa, and Rozvi

1. Great Zimbabwe (1200 – 1450 AD):
- Architecture: Dry-stone walling constructed without mortar using exfoliated granite blocks (Hill Complex, Great Enclosure, and Valley Enclosure).
- Economy: Cattle pastoralism (source of wealth, milk, meat, and lobola), crop cultivation (sorghum, millet), and international trade exporting gold and ivory via Sofala to Arab and Persian merchants.
- Decline: Exhaustion of arable soil, firewood depletion, salt shortages, and population pressure.

2. The Mutapa State (c. 1450 – 1890):
- Founder: Prince Nyatsimba Mutota migrated north from Great Zimbabwe seeking salt deposits and fertile valleys in the Dande area.
- Portuguese Contact: Portuguese traders and Dominican friars infiltrated the state, establishing *prazos* (feudal land estates) and manipulating puppet kings (e.g. Mavhura Mhande).

3. The Rozvi State (c. 1684 – 1830s):
- Founder: Changamire Dombo, a brilliant military strategist who used the famous cow-horn formation and poisoned arrows to decisively drive out Portuguese conquerors at the Battle of Maungwe (1684).
- Decline: Shattered in the 1830s by migrating Nguni armies during the Mfecane (Zwangendaba, Nyamazana, and Mzilikazi).`,
      sourceTag: 'History 2167 • Pre-Colonial Zimbabwean Dynasties',
      suggestions: [
        'Why did Great Zimbabwe decline in the 15th century?',
        'Who was Changamire Dombo and how did he defeat the Portuguese?',
        'What was the role of the Portuguese prazos in the decline of Mutapa?'
      ]
    };
  }

  /**
   * Quadratic Equations
   */
  private static handleQuadraticQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### Mathematics: Solving Quadratic Equations: 2x² - 5x - 3 = 0

1. Identify coefficients from the standard form ax² + bx + c = 0:
   a = 2,  b = -5,  c = -3

2. The Quadratic Formula:
   x = (-b ± √(b² - 4ac)) / (2a)

3. Substitute values systematically:
   x = (-(-5) ± √((-5)² - 4(2)(-3))) / (2 × 2)
   x = (5 ± √(25 + 24)) / 4
   x = (5 ± √49) / 4
   x = (5 ± 7) / 4

4. Evaluate both roots:
   Root 1: x = (5 + 7) / 4 = 12 / 4 = 3
   Root 2: x = (5 - 7) / 4 = -2 / 4 = -0.5  (-1/2)

Final Solution:
x = 3  or  x = -0.5`,
      sourceTag: 'Mathematics 4004 • Algebra & Quadratic Equations',
      suggestions: [
        'How do you solve this equation by factorisation?',
        'What is the discriminant Δ = b² - 4ac and what does it tell you?',
        'Solve 3x² + 5x - 2 = 0 using the quadratic formula'
      ]
    };
  }

  /**
   * Newton's Three Laws of Motion
   */
  private static handleNewtonQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### Newton's Three Laws of Motion

1. Newton's First Law of Motion (The Law of Inertia):
- Statement: An object will remain at rest or continue to move at a constant velocity in a straight line unless acted upon by a resultant external force.
- Practical Example: When a commuter kombi suddenly brakes, passengers lurch forward because inertia keeps their bodies moving at the vehicle\'s original speed.

2. Newton's Second Law of Motion (Force and Acceleration):
- Statement: The rate of change of momentum of a body is directly proportional to the applied resultant force and takes place in the direction of that force (Resultant Force = mass × acceleration: F = m × a).
- Practical Example: Pushing an empty wheelbarrow produces greater acceleration than pushing a wheelbarrow loaded with heavy cement bags using the same amount of force.

3. Newton's Third Law of Motion (Action and Reaction):
- Statement: If body A exerts a force on body B, body B exerts an equal and opposite force on body A (For every action, there is an equal and opposite reaction).
- Practical Example: When swimming, your arms push water backward (action), and the water pushes your body forward (reaction).`,
      sourceTag: 'Physics 4023 & Combined Science • Mechanics & Forces',
      suggestions: [
        'What is the difference between mass and weight?',
        'Calculate force when mass is 12 kg and acceleration is 4 m/s²',
        'Define momentum and state its SI unit'
      ]
    };
  }

  /**
   * Double Entry Bookkeeping
   */
  private static handleDoubleEntryQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### Principles of Accounts: The Double Entry System

1. The Golden Rule of Double Entry:
"For every debit entry, there must be an equal and corresponding credit entry."

2. The Accounting Equation:
Assets = Capital + Liabilities

3. Rules of Debit and Credit (DEAD / CLIC):
- DEBIT (to Increase): Drawings, Expenses, Assets (DEAD).
- CREDIT (to Increase): Capital, Liabilities, Income/Revenue (CLIC).

4. Practical Transaction Example:
- Transaction: Bought business stationery for $60 cash:
  - Debit: Stationery Account (Expense increased) $60
  - Credit: Cash Account (Asset decreased) $60`,
      sourceTag: 'Principles of Accounts 4051 • Double Entry Bookkeeping',
      suggestions: [
        'What is a Trial Balance and why is it prepared?',
        'How do you balance an account ledger at month-end?',
        'Explain the difference between cash discount and trade discount'
      ]
    };
  }

  /**
   * Zimbabwe Gold (ZiG) Currency
   */
  private static handleZiGQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### The Zimbabwe Gold (ZiG) Currency

1. Overview and Introduction:
- The Reserve Bank of Zimbabwe (RBZ) officially launched Zimbabwe Gold (ZiG) on 5 April 2024 as the new legal tender currency of Zimbabwe.

2. Gold and Foreign Asset Backing:
- ZiG is a structured currency anchored by a composite basket of foreign currency reserves and certified physical gold held in the central bank vault.
- Designed to anchor exchange rate predictability, curb speculative price volatility, and re-establish domestic store of value.

3. Denominations:
- Banknotes: 10, 20, 50, 100, and 200 ZiG.
- Coins: 1, 2, and 5 ZiG, alongside fractional cents.`,
      sourceTag: 'Commerce & Heritage Studies • Modern Zimbabwean Economy',
      suggestions: [
        'What is a structured currency?',
        'How does gold backing stabilize purchasing power?',
        'What are the primary functions of money in commerce?'
      ]
    };
  }

  /**
   * Comprehensive ZIMSEC Primary / Grade 7 English Language (Syllabus 7010) Handler
   */
  private static handlePrimaryEnglishQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase().trim();

    // 1. Collective Nouns
    if (
      q.includes('collective noun') ||
      q.includes('group of') ||
      q.includes('pride of') ||
      q.includes('swarm of') ||
      q.includes('troop of') ||
      q.includes('herd of') ||
      q.includes('flock of') ||
      q.includes('pack of') ||
      q.includes('litter of') ||
      q.includes('choir of') ||
      q.includes('fleet of') ||
      q.includes('bale of') ||
      q.includes('school of') ||
      q.includes('gaggle of')
    ) {
      let directAnswer = '';
      if (q.includes('lion')) directAnswer = 'A group of lions is called a **pride** (a pride of lions).';
      else if (q.includes('baboon') || q.includes('monkey')) directAnswer = 'A group of baboons or monkeys is called a **troop** (a troop of baboons/monkeys).';
      else if (q.includes('bee') || q.includes('locust')) directAnswer = 'A group of bees or locusts is called a **swarm** (a swarm of bees/locusts).';
      else if (q.includes('cattle') || q.includes('elephant') || q.includes('buffalo')) directAnswer = 'A group of cattle, elephants, or buffaloes is called a **herd** (a herd of cattle).';
      else if (q.includes('sheep') || q.includes('bird')) directAnswer = 'A group of sheep or birds is called a **flock** (a flock of sheep / a flock of birds).';
      else if (q.includes('wolf') || q.includes('wild dog')) directAnswer = 'A group of wolves or wild dogs is called a **pack** (a pack of wolves).';
      else if (q.includes('whale') || q.includes('dolphin') || q.includes('fish')) directAnswer = 'A group of whales or dolphins is called a **pod** or **school** (a pod of whales / a school of fish).';
      else if (q.includes('goose') || q.includes('geese')) directAnswer = 'A group of geese on the ground is called a **gaggle** (a gaggle of geese); in flight they are called a **skein**.';
      else if (q.includes('puppy') || q.includes('kitten') || q.includes('piglet')) directAnswer = 'A group of newborn puppies or kittens is called a **litter** (a litter of puppies).';
      else if (q.includes('singer')) directAnswer = 'A group of singers is called a **choir** (a choir of singers).';
      else if (q.includes('worshipper') || q.includes('church')) directAnswer = 'A group of worshippers in church is called a **congregation**.';
      else if (q.includes('judge') || q.includes('doctor') || q.includes('expert')) directAnswer = 'A group of judges or experts is called a **panel** or **bench** (a panel of judges).';
      else if (q.includes('sailor')) directAnswer = 'A group of sailors operating a ship is called a **crew** (a crew of sailors).';
      else if (q.includes('ship') || q.includes('car') || q.includes('bus')) directAnswer = 'A group of ships, motor cars, or buses is called a **fleet** (a fleet of ships).';
      else if (q.includes('cotton') || q.includes('tobacco') || q.includes('hay')) directAnswer = 'A compressed bundle of cotton or tobacco is called a **bale** (a bale of cotton / tobacco).';
      else if (q.includes('flower')) directAnswer = 'An arranged group of flowers is called a **bouquet** (a bouquet of flowers).';
      else if (q.includes('key') || q.includes('banana') || q.includes('grape')) directAnswer = 'A collection of keys or bananas is called a **bunch** (a bunch of keys).';

      return {
        text: `### Collective Nouns
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
In ZIMSEC English, collective nouns refer to a group of persons, animals, or objects spoken of as a single whole:

1. Animals:
- Lions: A **pride** of lions
- Baboons / Monkeys: A **troop** of baboons
- Bees / Locusts / Ants: A **swarm** of bees
- Cattle / Elephants / Buffaloes: A **herd** of cattle
- Sheep / Birds: A **flock** of sheep / birds
- Wolves / Wild dogs: A **pack** of wolves
- Whales / Dolphins / Fish: A **pod** of whales / a **school** of fish
- Geese: A **gaggle** of geese
- Puppies / Kittens / Piglets: A **litter** of puppies
- Doves / Swallows: A **flight** of doves
- Ants / Caterpillars: An **army** of ants

2. People:
- Singers: A **choir** of singers
- Worshippers: A **congregation** of worshippers
- Spectators / Onlookers: A **crowd** of spectators
- Judges / Experts / Doctors: A **panel** of judges
- Sailors: A **crew** of sailors
- Musicians: A **band** of musicians
- Teachers / Employees: A **staff** of teachers
- Actors: A **cast** of actors
- Thieves / Robbers: A **gang** of thieves
- Soldiers / Dancers: A **troop** of soldiers

3. Objects & Things:
- Ships / Cars / Buses: A **fleet** of ships
- Cotton / Tobacco / Hay: A **bale** of cotton
- Flowers: A **bouquet** of flowers
- Keys / Bananas / Grapes: A **bunch** of keys
- Firewood: A **bundle** of firewood
- Furniture / Rooms: A **suite** of furniture
- Drawers: A **chest** of drawers
- Stars: A **constellation** or **cluster** of stars
- Mountains / Hills: A **range** of mountains

*ZIMSEC Exam Concord Rule:* When a collective noun acts as a single unified body, it takes a SINGULAR verb (e.g. 'The choir **is** singing sweetly', 'The herd of cattle **was** grazing').`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Collective Nouns',
        suggestions: [
          'What preposition goes with congratulate?',
          'What is the plural of ox and child?',
          'What is the rule of subject-verb agreement for neither nor?',
          'How do you layout an informal friendly letter?'
        ]
      };
    }

    // 2. Prepositions & Collocations
    if (
      q.includes('preposition') ||
      q.includes('prefer to') ||
      q.includes('congratulate on') ||
      q.includes('good at') ||
      q.includes('afraid of') ||
      q.includes('died of') ||
      q.includes('died from') ||
      q.includes('divide between') ||
      q.includes('divide among') ||
      q.includes('senior to') ||
      q.includes('superior to')
    ) {
      let directAnswer = '';
      if (q.includes('prefer')) directAnswer = 'We use **to** with prefer: "I prefer tea **to** coffee" (NEVER say "prefer than").';
      else if (q.includes('congratulate')) directAnswer = 'We congratulate someone **on** an achievement: "I congratulate you **on** your exam results" (NEVER say "congratulate for").';
      else if (q.includes('good at') || q.includes('clever at') || q.includes('bad at')) directAnswer = 'We say good **at**, clever **at**, bad **at**: "He is good **at** English" (NEVER say "good in").';
      else if (q.includes('afraid') || q.includes('proud') || q.includes('ashamed') || q.includes('jealous') || q.includes('aware')) directAnswer = 'These adjectives take **of**: afraid **of**, proud **of**, ashamed **of**, jealous **of**, aware **of**.';
      else if (q.includes('died')) directAnswer = 'A person dies **of** a disease (died of malaria), but dies **from** wounds, hunger, or thirst (died from bleeding).';
      else if (q.includes('between') || q.includes('among')) directAnswer = 'Divide **between** TWO people ("between Rudo and Farai"); divide **among** THREE OR MORE people ("among all forty pupils").';
      else if (q.includes('senior') || q.includes('junior') || q.includes('superior') || q.includes('inferior')) directAnswer = 'These Latin comparatives take **to**: senior **to**, junior **to**, superior **to**, inferior **to** (NEVER say "than").';

      return {
        text: `### Prepositions & Fixed Collocations
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Prepositions show relationships between nouns or pronouns and other words in a sentence. ZIMSEC tests these fixed preposition pairs in Paper 1:

1. Crucial ZIMSEC Exam Rules (Common Pitfalls):
- Prefer ... TO: 'I prefer sadza TO rice.' (NEVER 'prefer than').
- Congratulate ... ON: 'The headmaster congratulated Tatenda ON passing.' (NEVER 'congratulated for').
- Good AT / Bad AT / Clever AT: 'Chipo is good AT Mathematics.' (NEVER 'good in').
- Senior TO / Junior TO / Superior TO / Inferior TO: 'Mr. Moyo is senior TO Mr. Ndlovu.' (NEVER 'senior than').
- Died OF vs Died FROM:
  * Died OF a disease: 'The cattle died OF anthrax.'
  * Died FROM an injury or thirst: 'The traveller died FROM dehydration.'
- Divide BETWEEN vs AMONG:
  * Divide BETWEEN two: 'Share the bread BETWEEN the two brothers.'
  * Divide AMONG three or more: 'Distribute the exercise books AMONG all Grade 7 pupils.'
- Married TO: 'She is married TO an engineer.' (NEVER 'married with').
- Prevent FROM: 'The heavy downpour prevented us FROM attending the match.'
- Accused OF / Ashamed OF / Afraid OF / Proud OF / Jealous OF.
- Insist ON / Depend ON / Rely ON / Keen ON.
- Suffer FROM: 'He suffers FROM asthma.'

2. Prepositions of Time:
- AT: Precise clock times ('at 7 o\\'clock', 'at noon', 'at sunset').
- ON: Specific days and dates ('on Monday', 'on 18 April', 'on Christmas Day').
- IN: Months, years, seasons, long periods ('in January', 'in 2026', 'in summer', 'in the afternoon').
- BETWEEN ... AND: 'The library is open BETWEEN 8 am AND 4 pm.' (NEVER 'between 8 am to 4 pm').`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Prepositions',
        suggestions: [
          'What is the rule of subject-verb agreement for neither nor?',
          'What is a collective noun for lions and baboons?',
          'What is the plural of child, ox, and crisis?',
          'What is the layout of an informal letter?'
        ]
      };
    }

    // 3. Plurals of Nouns
    if (
      q.includes('plural of') ||
      q.includes('plurals of') ||
      q.includes('plural for') ||
      q.includes('singular and plural')
    ) {
      let directAnswer = '';
      if (q.includes('child')) directAnswer = 'The plural of child is **children**.';
      else if (q.includes('ox')) directAnswer = 'The plural of ox is **oxen**.';
      else if (q.includes('tooth')) directAnswer = 'The plural of tooth is **teeth**.';
      else if (q.includes('foot')) directAnswer = 'The plural of foot is **feet**.';
      else if (q.includes('goose')) directAnswer = 'The plural of goose is **geese**.';
      else if (q.includes('mouse')) directAnswer = 'The plural of mouse is **mice**.';
      else if (q.includes('sheep')) directAnswer = 'The plural of sheep is **sheep** (remains unchanged; never say "sheeps").';
      else if (q.includes('deer')) directAnswer = 'The plural of deer is **deer** (remains unchanged).';
      else if (q.includes('leaf')) directAnswer = 'The plural of leaf is **leaves** (f changes to -ves).';
      else if (q.includes('knife')) directAnswer = 'The plural of knife is **knives** (fe changes to -ves).';
      else if (q.includes('calf')) directAnswer = 'The plural of calf is **calves**.';
      else if (q.includes('potato')) directAnswer = 'The plural of potato is **potatoes** (adds -es).';
      else if (q.includes('tomato')) directAnswer = 'The plural of tomato is **tomatoes** (adds -es).';
      else if (q.includes('brother-in-law') || q.includes('brother in law')) directAnswer = 'The plural of brother-in-law is **brothers-in-law** (pluralize the principal noun).';
      else if (q.includes('mother-in-law') || q.includes('mother in law')) directAnswer = 'The plural of mother-in-law is **mothers-in-law**.';
      else if (q.includes('crisis')) directAnswer = 'The plural of crisis is **crises**.';

      return {
        text: `### Plurals of Nouns
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
In ZIMSEC English, nouns form plurals through specific morphological rules:

1. Irregular Plurals (Vowel Mutation):
- Child -> **children**
- Ox -> **oxen**
- Tooth -> **teeth**
- Foot -> **feet**
- Goose -> **geese**
- Mouse -> **mice**
- Man -> **men**
- Woman -> **women**

2. Nouns Ending in -f or -fe (Change to -ves):
- Leaf -> **leaves**
- Knife -> **knives**
- Calf -> **calves**
- Half -> **halves**
- Loaf -> **loaves**
- Thief -> **thieves**
- Wolf -> **wolves**
- Wife -> **wives**
*Exceptions:* Chief -> **chiefs**, Roof -> **roofs**, Handkerchief -> **handkerchiefs**.

3. Nouns with Identical Singular and Plural:
- Sheep -> **sheep** (NOT sheeps)
- Deer -> **deer**
- Fish -> **fish**
- Aircraft -> **aircraft**

4. Compound Nouns (Pluralize the principal word):
- Brother-in-law -> **brothers-in-law**
- Mother-in-law -> **mothers-in-law**
- Passer-by -> **passers-by**
- Editor-in-chief -> **editors-in-chief**

5. Classical / Foreign Plurals tested in Grade 7:
- Crisis -> **crises**
- Oasis -> **oases**
- Radius -> **radii**
- Fungus -> **fungi**`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Plural Rules',
        suggestions: [
          'What is a collective noun for lions and bees?',
          'What preposition goes with prefer and congratulate?',
          'What is the question tag rule for I am?'
        ]
      };
    }

    // 4. Concord & Subject-Verb Agreement
    if (
      q.includes('concord') ||
      q.includes('subject-verb agreement') ||
      q.includes('subject verb agreement') ||
      q.includes('neither nor') ||
      q.includes('either or') ||
      q.includes('as well as') ||
      q.includes('together with') ||
      q.includes('each of the') ||
      q.includes('one of the')
    ) {
      let directAnswer = '';
      if (q.includes('neither nor') || q.includes('either or')) {
        directAnswer = 'In "neither ... nor" and "either ... or", the verb agrees with the subject **closest to it** (e.g. "Neither the teacher nor the students **were** present", but "Neither the students nor the teacher **was** present").';
      } else if (q.includes('as well as') || q.includes('together with') || q.includes('accompanied by')) {
        directAnswer = 'Phrases like "as well as" and "together with" do NOT change the subject number (e.g. "The headmaster, as well as the thirty pupils, **was** present" -> headmaster is singular, so use **was**).';
      } else if (q.includes('each of') || q.includes('one of')) {
        directAnswer = 'Words like "each of" and "one of" ALWAYS take a **singular verb** (e.g. "Each of the boys **has** a book", "One of the cows **is** sick").';
      }

      return {
        text: `### Subject-Verb Agreement (Concord)
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Concord requires that a singular subject takes a singular verb, and a plural subject takes a plural verb. ZIMSEC tests these core rules:

1. 'Neither ... nor' and 'Either ... or' (Proximity Rule):
- The verb agrees with the subject CLOSER to it:
  * 'Neither the teacher nor the pupils **were** in the classroom.' (pupils is plural -> were).
  * 'Neither the pupils nor the teacher **was** in the classroom.' (teacher is singular -> was).
  * 'Either John or his sisters **are** bringing the basket.'

2. Intervening Phrases ('As well as', 'Together with', 'Accompanied by'):
- Words coming between the subject and verb do NOT affect agreement:
  * 'The farmer, together with his three sons, **is** weeding the maize.' (farmer is singular -> is).
  * 'The cattle, accompanied by the herdboy, **were** drinking water.' (cattle is plural -> were).

3. Indefinite Pronouns (Always Singular):
- 'Each', 'everyone', 'everybody', 'anyone', 'nobody', 'one of' ALWAYS take a SINGULAR verb:
  * 'Each of the candidates **was** awarded a certificate.' (NOT were).
  * 'One of the bicycles **is** broken.' (NOT are).
  * 'Everybody **has** submitted their homework.'

4. Expressions of Distance, Money, and Time:
- Treated as a single unit, therefore taking a singular verb:
  * 'Ten kilometres **is** a long distance to walk.' (NOT are).
  * 'Fifty dollars **was** paid for the school fee.'
  * 'Two hours **is** sufficient to complete Paper 1.'`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Concord',
        suggestions: [
          'What is the question tag for "I am"?',
          'What preposition goes with prefer and congratulate?',
          'What is a collective noun for sheep and baboons?'
        ]
      };
    }

    // 5. Direct and Reported (Indirect) Speech
    if (
      q.includes('direct speech') ||
      q.includes('indirect speech') ||
      q.includes('reported speech') ||
      q.includes('change to indirect') ||
      q.includes('change to reported')
    ) {
      return {
        text: `### Direct and Indirect (Reported) Speech

In ZIMSEC English, converting direct speech into indirect speech involves three systematic transformations:

1. Tense Backshift Rules (When reporting verb is in the past: 'said', 'told'):
- Simple Present -> Simple Past:
  * Direct: 'I like reading novels,' said Tendai.
  * Indirect: Tendai said that he liked reading novels.
- Present Continuous -> Past Continuous:
  * Direct: 'We are weeding the field,' said the boys.
  * Indirect: The boys said that they were weeding the field.
- Present Perfect -> Past Perfect:
  * Direct: 'Mother has prepared breakfast,' Chipo said.
  * Indirect: Chipo said that mother had prepared breakfast.
- Simple Past -> Past Perfect:
  * Direct: 'The kombi broke down,' explained the driver.
  * Indirect: The driver explained that the kombi had broken down.
- Modals: Will -> **would** | Can -> **could** | May -> **might** | Must -> **had to**.

2. Pronoun & Possessive Shifts:
- Match the speaker and listener: I -> **he/she**, my -> **his/her**, we -> **they**, our -> **their**, you -> **I/they**.

3. Adverbs of Time and Place Shifts:
- Now -> **then**
- Today -> **that day**
- Yesterday -> **the previous day** / **the day before**
- Tomorrow -> **the next day** / **the following day**
- Here -> **there**
- This -> **that** | These -> **those**
- Ago -> **before**

4. Questions in Reported Speech:
- Yes/No Questions use **if** or **whether**:
  * Direct: 'Have you written the test?' asked the teacher.
  * Indirect: The teacher asked if I had written the test.
- WH-Questions keep the question word and adopt statement order (Subject before Verb):
  * Direct: 'Where do you live?' asked Simba.
  * Indirect: Simba asked where I lived. (NEVER 'where did I live').`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Reported Speech',
        suggestions: [
          'What are the rules for question tags?',
          'What are the layout requirements for an informal letter?',
          'What is the formula for passive voice?'
        ]
      };
    }

    // 6. Active and Passive Voice
    if (
      q.includes('active voice') ||
      q.includes('passive voice') ||
      q.includes('change to passive') ||
      q.includes('turn into passive')
    ) {
      return {
        text: `### Active and Passive Voice

1. Core Transformation Formula:
- Active: Subject (doer) + Verb + Object (receiver)
- Passive: Object + Form of 'to be' + Past Participle (V3) + by + Subject

2. Tense-by-Tense Transformation Table:
- Simple Present:
  * Active: The farmer plows the land.
  * Passive: The land **is plowed** by the farmer.
- Present Continuous:
  * Active: The pupils are sweeping the classroom.
  * Passive: The classroom **is being swept** by the pupils.
- Simple Past:
  * Active: Farai scored the winning goal.
  * Passive: The winning goal **was scored** by Farai.
- Past Continuous:
  * Active: The builder was constructing a wall.
  * Passive: A wall **was being constructed** by the builder.
- Present Perfect:
  * Active: Mother has cooked delicious sadza.
  * Passive: Delicious sadza **has been cooked** by mother.
- Future Simple:
  * Active: The school will purchase new computers.
  * Passive: New computers **will be purchased** by the school.

3. Imperative Commands in Passive:
- Active: 'Close the gate.'
- Passive: '**Let the gate be closed.**'
- Active: 'Do not pluck the flowers.'
- Passive: '**Let the flowers not be plucked.**'`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Active & Passive Voice',
        suggestions: [
          'What is the rule for question tags?',
          'What is a collective noun for cattle and lions?',
          'What are the rules for reported speech?'
        ]
      };
    }

    // 7. Question Tags
    if (
      q.includes('question tag') ||
      q.includes('tag question') ||
      q.includes("aren't i") ||
      q.includes('shall we') ||
      q.includes('will you')
    ) {
      let directAnswer = '';
      if (q.includes('i am')) directAnswer = 'The tag for "I am" is **aren\'t I?** (e.g. "I am invited to the party, **aren\'t I?**").';
      else if (q.includes("let's") || q.includes('let us')) directAnswer = 'The tag for suggestions starting with "Let\'s" is **shall we?** (e.g. "Let us start revising, **shall we?**").';
      else if (q.includes('close the door') || q.includes('imperative') || q.includes('command')) directAnswer = 'The tag for commands/imperatives is **will you?** (e.g. "Close the window, **will you?**").';
      else if (q.includes('nobody') || q.includes('never') || q.includes('hardly')) directAnswer = 'Statements containing negative words like "nobody" or "never" take a **positive tag** (e.g. "Nobody called, **did they?**", "He never lies, **does he?**").';

      return {
        text: `### Rules of Question Tags
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Question tags are short questions attached to the end of a sentence to seek agreement:

1. The Golden Rule of Question Tags:
- A POSITIVE statement takes a NEGATIVE tag:
  * 'She is a diligent pupil, **isn\\'t she?**'
  * 'They arrived on time, **didn\\'t they?**'
  * 'You can swim across the river, **can\\'t you?**'
- A NEGATIVE statement takes a POSITIVE tag:
  * 'He isn\\'t feeling well, **is he?**'
  * 'You don\\'t eat pork, **do you?**'
  * 'They haven\\'t finished the test, **have they?**'

2. Sentences without Auxiliary Verbs (Use DO, DOES, or DID):
- 'Tendai walks to school, **doesn\\'t he?**' (Simple present singular).
- 'The boys play soccer, **don\\'t they?**' (Simple present plural).
- 'Father bought a new car, **didn\\'t he?**' (Simple past).

3. Special ZIMSEC Irregular Tags:
- 'I am' -> **aren\\'t I?** ('I am on the register, aren\\'t I?').
- 'Let\\'s' -> **shall we?** ('Let\\'s go home, shall we?').
- Commands / Requests -> **will you?** ('Please hand me the book, will you?').
- Sentences with negative words ('nobody', 'nothing', 'never', 'seldom', 'hardly', 'scarcely') take a POSITIVE tag:
  * 'Nobody answered the phone, **did they?**'
  * 'She never complains, **does she?**'
  * 'Nothing went wrong, **did it?**'`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Question Tags',
        suggestions: [
          'What is the plural of ox and child?',
          'What preposition goes with prefer and congratulate?',
          'What is the layout of an informal letter?'
        ]
      };
    }

    // 8. Similes & English Proverbs
    if (
      q.includes('simile') ||
      q.includes('proverb') ||
      q.includes('stitch in time') ||
      q.includes('early bird') ||
      q.includes('actions speak louder') ||
      q.includes('bird in the hand') ||
      q.includes('all that glitters') ||
      q.includes('birds of a feather') ||
      q.includes('blood is thicker') ||
      q.includes('spilt milk') ||
      q.includes('too many cooks') ||
      q.includes('where there is a will') ||
      q.includes('as cool as a cucumber') ||
      q.includes('as brave as a lion')
    ) {
      let directAnswer = '';
      if (q.includes('stitch in time')) directAnswer = '"A stitch in time saves nine" means **dealing with a small problem immediately prevents it from becoming a huge disaster later**.';
      else if (q.includes('early bird')) directAnswer = '"The early bird catches the worm" means **those who act promptly and prepare early are the ones who achieve success**.';
      else if (q.includes('actions speak louder')) directAnswer = '"Actions speak louder than words" means **what you actually do is far more important and believable than what you merely say**.';
      else if (q.includes('bird in the hand')) directAnswer = '"A bird in the hand is worth two in the bush" means **be satisfied with what you already possess rather than risking it for something uncertain**.';
      else if (q.includes('all that glitters')) directAnswer = '"All that glitters is not gold" means **appearances can be deceptive; not everything that looks attractive is genuine or valuable**.';
      else if (q.includes('birds of a feather')) directAnswer = '"Birds of a feather flock together" means **people who share similar characters, habits, or interests tend to associate together**.';
      else if (q.includes('blood is thicker')) directAnswer = '"Blood is thicker than water" means **family relationships and loyalties are stronger than any other bonds**.';
      else if (q.includes('spilt milk')) directAnswer = '"Don\'t cry over spilt milk" means **it is useless to grieve over mistakes or misfortunes that cannot be changed or reversed**.';
      else if (q.includes('too many cooks')) directAnswer = '"Too many cooks spoil the broth" means **if too many people try to manage or interfere with a single task, they will ruin it**.';
      else if (q.includes('where there is a will')) directAnswer = '"Where there is a will, there is a way" means **if you have sufficient determination, you can overcome any obstacle to succeed**.';

      return {
        text: `### English Proverbs & Similes
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
1. Common ZIMSEC Proverbs and their Meanings:
- 'A stitch in time saves nine': Dealing with a small problem immediately prevents it from turning into a major catastrophe.
- 'Actions speak louder than words': What you do carries more weight than what you merely promise.
- 'A bird in the hand is worth two in the bush': Value what you already have rather than risking it for something uncertain.
- 'All that glitters is not gold': Do not judge by outward appearance alone.
- 'Birds of a feather flock together': People of similar habits and interests stay together.
- 'Blood is thicker than water': Family bonds are stronger than outside relationships.
- 'Don\\'t cry over spilt milk': Do not waste time regretting past events that cannot be undone.
- 'The early bird catches the worm': Promptness and early preparation guarantee success.
- 'Too many cooks spoil the broth': Too many leaders or helpers confuse a project.
- 'Where there is a will, there is a way': Genuine determination overcomes all hurdles.
- 'Practice makes perfect': Repeated practice leads to mastery.

2. Standard Grade 7 Similes:
- As cool as a cucumber (calm and composed under pressure)
- As brave as a lion
- As blind as a bat
- As busy as a bee
- As cunning / sly as a fox
- As gentle as a lamb / dove
- As proud as a peacock
- As stubborn as a mule
- As wise as an owl
- As light as a feather`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Figurative Language',
        suggestions: [
          'What is a collective noun for lions and baboons?',
          'What preposition goes with prefer and congratulate?',
          'What is the layout of an informal letter?'
        ]
      };
    }

    // 9. Animal Offspring, Sounds, and Homes
    if (
      q.includes('young one of') ||
      q.includes('young of') ||
      q.includes('baby of') ||
      q.includes('sound of a') ||
      q.includes('sound made by') ||
      q.includes('home of a') ||
      q.includes('habitat of a') ||
      q.includes('kennel') ||
      q.includes('stable') ||
      q.includes('byre')
    ) {
      let directAnswer = '';
      if (q.includes('eagle')) directAnswer = 'The young one of an eagle is an **eaglet**; its home is an **eyrie**.';
      else if (q.includes('lion')) directAnswer = 'The young one of a lion is a **cub**; its sound is a **roar**; its home is a **den** or **lair**.';
      else if (q.includes('horse')) directAnswer = 'The young one of a horse is a **foal**; its sound is a **neigh** or **whinny**; its home is a **stable**.';
      else if (q.includes('cattle') || q.includes('cow')) directAnswer = 'The young one of a cow is a **calf**; its sound is **moo** or **low**; its home is a **byre**, **kraal**, or **pen**.';
      else if (q.includes('sheep')) directAnswer = 'The young one of a sheep is a **lamb**; its sound is a **bleat**; its home is a **pen** or **fold**.';
      else if (q.includes('goat')) directAnswer = 'The young one of a goat is a **kid**; its sound is a **bleat**.';
      else if (q.includes('pig')) directAnswer = 'The young one of a pig is a **piglet**; its sound is a **grunt** or **squeal**; its home is a **sty**.';
      else if (q.includes('dog')) directAnswer = 'The young one of a dog is a **puppy**; its sound is a **bark**; its home is a **kennel**.';
      else if (q.includes('cat')) directAnswer = 'The young one of a cat is a **kitten**; its sound is a **meow** or **purr**.';
      else if (q.includes('donkey')) directAnswer = 'The sound of a donkey is a **bray**; its young one is a **foal**.';
      else if (q.includes('frog')) directAnswer = 'The young one of a frog is a **tadpole**; its sound is a **croak**.';
      else if (q.includes('rabbit')) directAnswer = 'The home of a rabbit is a **burrow**, **warren**, or **hutch**.';

      return {
        text: `### Animal Young, Sounds, and Homes
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
In ZIMSEC English, biological naming of animals, their young, sounds, and homes is tested in Paper 1:

1. Animal Offspring (Young Ones):
- Cow -> **Calf**
- Horse -> **Foal** (male: colt, female: filly)
- Sheep -> **Lamb**
- Goat -> **Kid**
- Pig -> **Piglet**
- Dog -> **Puppy**
- Cat -> **Kitten**
- Lion / Leopard / Tiger -> **Cub**
- Donkey -> **Foal**
- Elephant -> **Calf**
- Duck -> **Duckling**
- Goose -> **Gosling**
- Eagle -> **Eaglet**
- Frog / Toad -> **Tadpole**
- Butterfly -> **Caterpillar**
- Kangaroo -> **Joey**

2. Animal Homes (Habitats):
- Horse: **Stable**
- Dog: **Kennel**
- Cattle: **Byre** / **Kraal** / **Pen**
- Pig: **Sty**
- Sheep: **Fold** / **Pen**
- Lion: **Den** / **Lair**
- Rabbit: **Burrow** / **Warren** / **Hutch**
- Bird: **Nest**
- Eagle: **Eyrie**
- Bee: **Hive**
- Spider: **Web**

3. Animal Sounds:
- Cows: **Moo** / **Low**
- Horses: **Neigh** / **Whinny**
- Sheep & Goats: **Bleat**
- Pigs: **Grunt** / **Squeal**
- Dogs: **Bark** / **Growl**
- Cats: **Meow** / **Purr**
- Lions: **Roar**
- Donkeys: **Bray**
- Elephants: **Trumpet**
- Frogs: **Croak**
- Snakes: **Hiss**
- Owls: **Hoot**`,
        sourceTag: 'ZIMSEC Grade 7 English Syllabus 7010 • Animal Nomenclature',
        suggestions: [
          'What is a collective noun for lions and baboons?',
          'What preposition goes with prefer and congratulate?',
          'What is the plural of ox and child?'
        ]
      };
    }

    // 10. Paper 2 Composition: Informal/Formal Letters & Reports
    if (
      q.includes('composition') ||
      q.includes('informal letter') ||
      q.includes('friendly letter') ||
      q.includes('formal letter') ||
      q.includes('business letter') ||
      q.includes('report writing') ||
      q.includes('how to write a letter') ||
      q.includes('how to write a report')
    ) {
      return {
        text: `### Paper 2 Composition & Functional Writing

ZIMSEC Grade 7 English Paper 2 tests continuous writing carrying 20 marks:

1. Layout of an Informal (Friendly) Letter:
- Top Right Corner: Sender's physical/postal address and date:
  * Line 1: House Number & Street (e.g. Stand 124, Glen View 3)
  * Line 2: Suburb / Town (Harare)
  * Line 3: Date (e.g. 24 October 2026)
- Left Margin Salutation: Dear Farai, / Dear Aunt Rudo, (comma after name).
- Body Paragraphs:
  * Paragraph 1: Pleasant opening and purpose of writing.
  * Paragraphs 2–3: Main story, news, or event in detail.
  * Paragraph 4: Warm closing remarks and well wishes.
- Sign-Off: 'Your loving friend,' / 'Your cousin,' followed by First Name only.

2. Layout of a Formal (Business / Official) Letter:
- Top Right Corner: Sender's address and date.
- Left Margin: Recipient's Official Title and Address:
  * The Headmaster,
  * St. Peter's Primary School,
  * P.O. Box 45,
  * Marondera.
- Salutation: Dear Sir, / Dear Madam,.
- Heading / Reference Line: Bold or capital letters and underlined:
  * **APPLICATION FOR A FORM ONE BOARDING PLACE**
- Body: Formal, polite tone; NO slang, NO colloquialisms, NO contractions (write 'do not', NOT 'don\\'t').
- Sign-Off: 'Yours faithfully,' (if recipient is unnamed) or 'Yours sincerely,' (if named) + Signature + Full Name printed in capitals.

3. Layout of a Report:
- Heading at the top: **REPORT ON THE INTER-HOUSE ATHLETICS COMPETITION**
- Structured into sub-sections: Introduction, Events & Performance, Incidents/Challenges, Conclusion.
- Written in factual, objective past tense.
- Sign-off: Compiled by: [Your Name], Title: Sports Prefect, Date: 24 October 2026.

4. ZIMSEC 20-Mark Assessment Criteria:
- Content & Prompt Coverage (8 marks): Address all points specified in the examination prompt.
- Language & Sentence Variety (7 marks): Correct grammar, varied sentence lengths, rich descriptive vocabulary.
- Punctuation & Spelling (5 marks): Flawless capital letters, full stops, apostrophes, and spelling.`,
        sourceTag: 'ZIMSEC Grade 7 English Paper 2 • Composition Writing Guide',
        suggestions: [
          'What are the rules for question tags?',
          'What is a collective noun for lions and baboons?',
          'What preposition goes with prefer and congratulate?'
        ]
      };
    }

    return null;
  }

  /**
   * Primary Mathematics Curriculum (ZIMSEC 7020)
   * High-accuracy, zero-hallucination math answering engine covering all 14 Grade 7 syllabus domains
   */
  private static handlePrimaryMathQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase();

    // 1. BODMAS & Order of Operations
    if (
      q.includes('bodmas') ||
      q.includes('order of operation') ||
      q.includes('order of operations') ||
      q.includes('brackets of division')
    ) {
      let directAnswer = 'BODMAS dictates the order of calculation: **B**rackets first, then **O**f (orders/powers), **D**ivision and **M**ultiplication (left-to-right), followed by **A**ddition and **S**ubtraction (left-to-right).';
      return {
        text: `### Order of Operations (BODMAS)
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
In ZIMSEC Grade 7 Mathematics Paper 1 and Paper 2, multi-operation expressions must strictly follow the BODMAS rule:

1. The BODMAS Hierarchy:
- **B** - Brackets: Calculate anything inside parentheses first e.g. (4 + 6).
- **O** - Of / Orders: Means multiplication (e.g. 1/2 of 60 = 30) or powers (e.g. 3² = 9).
- **D** - Division: Perform from left to right.
- **M** - Multiplication: Perform from left to right.
- **A** - Addition: Perform from left to right.
- **S** - Subtraction: Perform from left to right.

2. Step-by-Step Worked ZIMSEC Examples:
- **Problem 1:** Calculate $12 + 4 \\times 3 - 6 \\div 2$
  * Step 1 (Division): $6 \\div 2 = 3$ -> Expression becomes $12 + 4 \\times 3 - 3$
  * Step 2 (Multiplication): $4 \\times 3 = 12$ -> Expression becomes $12 + 12 - 3$
  * Step 3 (Addition): $12 + 12 = 24$ -> Expression becomes $24 - 3$
  * Step 4 (Subtraction): $24 - 3 = 21$
  * **Final Answer:** 21.

- **Problem 2:** Calculate $(15 - 5) \\times (8 + 2) \\div 4$
  * Step 1 (Brackets): $(15 - 5) = 10$ and $(8 + 2) = 10$
  * Step 2: $10 \\times 10 \\div 4 = 100 \\div 4 = 25$
  * **Final Answer:** 25.

*ZIMSEC Exam Tip:* Never do addition before multiplication or division just because addition comes first from left to right.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • BODMAS',
        suggestions: [
          'What is the formula for simple interest?',
          'How do you find the HCF and LCM of two numbers?',
          'What is Euler\'s formula for 3D shapes?'
        ]
      };
    }

    // 2. Factors, Multiples, Prime Numbers, HCF and LCM
    if (
      q.includes('hcf') ||
      q.includes('lcm') ||
      q.includes('highest common factor') ||
      q.includes('lowest common multiple') ||
      q.includes('least common multiple') ||
      q.includes('prime number') ||
      q.includes('prime factor')
    ) {
      let directAnswer = '';
      if (q.includes('hcf') || q.includes('highest common factor')) {
        directAnswer = 'The **HCF (Highest Common Factor)** is the greatest number that divides exactly into each given number without a remainder (e.g. HCF of 12 and 18 is **6**).';
      } else if (q.includes('lcm') || q.includes('lowest common multiple')) {
        directAnswer = 'The **LCM (Lowest Common Multiple)** is the smallest non-zero multiple that is evenly divisible by all given numbers (e.g. LCM of 4 and 6 is **12**).';
      } else if (q.includes('prime')) {
        directAnswer = 'A **prime number** is a whole number greater than 1 that has exactly two factors: 1 and itself (2, 3, 5, 7, 11, 13, 17, 19, 23, 29). **2 is the only even prime number**; 1 is NOT a prime number.';
      }

      return {
        text: `### Factors, Multiples, HCF & LCM
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key concepts tested in ZIMSEC Number Theory:

1. Factors vs Multiples:
- **Factors:** Numbers that divide into a number without leaving a remainder.
  * Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24.
- **Multiples:** The times table of a number.
  * Multiples of 6: 6, 12, 18, 24, 30, 36...

2. Prime Numbers:
- Numbers with EXACTLY two factors (1 and itself).
- First 10 primes: **2, 3, 5, 7, 11, 13, 17, 19, 23, 29**.
- Common ZIMSEC Trap: **1 is not prime** because it has only one factor (1).

3. Finding HCF (Highest Common Factor):
- Example: Find HCF of 18 and 24.
  * Factors of 18: 1, 2, 3, 6, 9, 18.
  * Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24.
  * Shared common factors: 1, 2, 3, 6.
  * **HCF = 6**.

4. Finding LCM (Lowest Common Multiple):
- Example: Find LCM of 6 and 8.
  * Multiples of 6: 6, 12, 18, 24, 30...
  * Multiples of 8: 8, 16, 24, 32...
  * Smallest common multiple: **LCM = 24**.
  * *Application:* LCM is essential for finding the common denominator when adding or subtracting fractions!`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Number Concepts',
        suggestions: [
          'How do you add and divide fractions?',
          'What is the BODMAS rule?',
          'What is the formula for area and perimeter of a circle?'
        ]
      };
    }

    // 3. Fractions Operations & Conversions
    if (
      q.includes('fraction') ||
      q.includes('proper fraction') ||
      q.includes('improper fraction') ||
      q.includes('mixed number') ||
      q.includes('reciprocal') ||
      q.includes('numerator') ||
      q.includes('denominator')
    ) {
      let directAnswer = '';
      if (q.includes('reciprocal') || q.includes('invert')) {
        directAnswer = 'The **reciprocal** of a fraction is formed by flipping it upside down (swapping numerator and denominator). For example, the reciprocal of 3/4 is **4/3**, and the reciprocal of 5 (5/1) is **1/5**.';
      } else if (q.includes('improper') || q.includes('mixed')) {
        directAnswer = 'An **improper fraction** has a numerator larger than or equal to its denominator (e.g. 7/3 = 2 1/3). To convert mixed number $2 \\frac{3}{4}$ to improper: multiply whole by denominator and add numerator: $(2 \\times 4) + 3 = 11$, giving **11/4**.';
      } else if (q.includes('divide')) {
        directAnswer = 'To **divide fractions**, keep the first fraction, change the division sign to multiplication, and **multiply by the reciprocal** of the second fraction (e.g. 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6).';
      }

      return {
        text: `### Fractions & Four Operations
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Fractions represent equal parts of a whole. ZIMSEC tests all four operations and conversions:

1. Types of Fractions:
- **Proper Fraction:** Numerator < Denominator (e.g. 3/5, value is less than 1).
- **Improper Fraction:** Numerator ≥ Denominator (e.g. 9/4, value is 1 or greater).
- **Mixed Number:** A whole number combined with a fraction (e.g. 2 1/4).

2. Adding & Subtracting Fractions:
- Must convert to a Common Denominator using LCM:
  * Example: $\\frac{2}{3} + \\frac{1}{4}$
  * LCM of 3 and 4 = 12.
  * $\\frac{2 \\times 4}{12} + \\frac{1 \\times 3}{12} = \\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}$.

3. Multiplying Fractions:
- Multiply numerators together, and denominators together, then simplify:
  * Example: $\\frac{3}{5} \\times \\frac{10}{9} = \\frac{30}{45} = \\frac{2}{3}$.
  * With mixed numbers: ALWAYS convert to improper fractions first!

4. Dividing Fractions (The Reciprocal Rule):
- Invert the second fraction and multiply:
  * Example: $\\frac{3}{4} \\div \\frac{2}{5} = \\frac{3}{4} \\times \\frac{5}{2} = \\frac{15}{8} = 1 \\frac{7}{8}$.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Fractions',
        suggestions: [
          'How do you convert decimals to percentages?',
          'What is the formula for simple interest?',
          'What is the speed distance time formula?'
        ]
      };
    }

    // 4. Commercial Arithmetic: Profit, Loss, Discount, Simple Interest
    if (
      q.includes('simple interest') ||
      q.includes('principal') ||
      q.includes('cost price') ||
      q.includes('selling price') ||
      q.includes('profit') ||
      q.includes('loss') ||
      q.includes('discount')
    ) {
      let directAnswer = '';
      if (q.includes('simple interest') || q.includes('interest')) {
        directAnswer = 'The formula for **Simple Interest** is **$I = \\frac{P \\times R \\times T}{100}$**, where $P$ is Principal, $R$ is Rate per annum, and $T$ is Time in years. **Total Amount ($A$) = Principal + Interest**.';
      } else if (q.includes('profit')) {
        directAnswer = '**Profit = Selling Price - Cost Price**. **Percentage Profit = $\\frac{\\text{Profit}}{\\text{Cost Price}} \\times 100\\%$**.';
      } else if (q.includes('loss')) {
        directAnswer = '**Loss = Cost Price - Selling Price**. **Percentage Loss = $\\frac{\\text{Loss}}{\\text{Cost Price}} \\times 100\\%$**.';
      } else if (q.includes('discount')) {
        directAnswer = '**Discount = Marked Price - Selling Price** (or Discount % × Marked Price).';
      }

      return {
        text: `### Commercial Arithmetic & Money
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Commercial mathematics questions carry high marks in ZIMSEC Grade 7 Paper 2:

1. Profit and Loss Formulas:
- **Profit** = Selling Price (SP) - Cost Price (CP)  [when SP > CP]
- **Loss** = Cost Price (CP) - Selling Price (SP)  [when CP > SP]
- **Percentage Profit** = $(\\text{Profit} \\div \\text{CP}) \\times 100\\%$
- **Percentage Loss** = $(\\text{Loss} \\div \\text{CP}) \\times 100\\%$
*Exam Trap:* Percentage profit and loss are ALWAYS calculated based on the **Cost Price**, never the selling price!

2. Simple Interest Formula:
- **Formula:**
  $$I = \\frac{P \\times R \\times T}{100}$$
  * $P$ = Principal (money invested or borrowed in ZiG / USD)
  * $R$ = Rate of interest (% per annum)
  * $T$ = Time (in years)
- **Total Amount Payable:** $\\text{Amount} = \\text{Principal} + \\text{Interest}$ ($A = P + I$).
- *Worked Example:* Find simple interest on $500 at 8% per annum for 3 years:
  $$I = \\frac{500 \\times 8 \\times 3}{100} = \\frac{12000}{100} = \\$120$$
  $$\\text{Total Amount} = \\$500 + \\$120 = \\$620$$.

3. Discount:
- **Discount** = Marked Price - Cash Price (Selling Price).
- **Percentage Discount** = $(\\text{Discount} \\div \\text{Marked Price}) \\times 100\\%$.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Commercial Arithmetic',
        suggestions: [
          'What is the formula for speed, distance, and time?',
          'How do you calculate area of a triangle and circle?',
          'What is BODMAS?'
        ]
      };
    }

    // 5. Speed, Distance, Time, Rate, and Ratio
    if (
      q.includes('speed') ||
      q.includes('distance') ||
      q.includes('average speed') ||
      /\bratios?\b/i.test(q) ||
      q.includes('proportion')
    ) {
      let directAnswer = '';
      if (q.includes('speed') || q.includes('distance') || q.includes('km/h')) {
        directAnswer = 'The Speed-Distance-Time triangle formulas are: **Speed = Distance ÷ Time**, **Distance = Speed × Time**, and **Time = Distance ÷ Speed**. Average Speed = Total Distance ÷ Total Time.';
      } else if (/\bratios?\b/i.test(q) || q.includes('share')) {
        directAnswer = 'To share in a ratio (e.g. 2 : 3): 1) Add ratio parts ($2 + 3 = 5$ parts); 2) Divide total quantity by total parts to find value of 1 part; 3) Multiply 1 part by each ratio number.';
      }

      return {
        text: `### Speed, Distance, Time & Ratio
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key mechanics tested in ZIMSEC motion and ratio word problems:

1. Speed, Distance, and Time Formulas:
- **Speed** = $\\frac{\\text{Distance}}{\\text{Time}}$ (expressed in km/h or m/s)
- **Distance** = $\\text{Speed} \\times \\text{Time}$ (expressed in km or metres)
- **Time** = $\\frac{\\text{Distance}}{\\text{Speed}}$ (expressed in hours or seconds)
- **Average Speed** = $\\frac{\\text{Total Distance}}{\\text{Total Time Taken}}$

2. Worked Speed Example:
- A bus travels from Harare to Mutare (a distance of 260 km) in 4 hours. Calculate its average speed.
  * $\\text{Speed} = 260\\text{ km} \\div 4\\text{ hours} = 65\\text{ km/h}$.
- How far does a cyclist travel in 2.5 hours at a speed of 18 km/h?
  * $\\text{Distance} = 18 \\times 2.5 = 45\\text{ km}$.

3. Ratio and Proportion:
- **Simplifying Ratios:** Divide both terms by their HCF:
  * Ratio of 15 cm to 45 cm = $15 : 45 = 1 : 3$.
- **Sharing Quantities in a Ratio:**
  * Problem: Share $120 between Chipo and Farai in the ratio 2 : 3.
  * Total parts = $2 + 3 = 5$ parts.
  * 1 part = $\$120 \\div 5 = \\$24$.
  * Chipo's share ($2$ parts) = $2 \\times 24 = \\$48$.
  * Farai's share ($3$ parts) = $3 \\times 24 = \\$72$. (Check: $48 + 72 = 120$).`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Ratio & Rate',
        suggestions: [
          'How do you calculate the perimeter and area of a circle?',
          'What is the formula for volume of a cuboid?',
          'What is simple interest formula?'
        ]
      };
    }

    // 6. Perimeter, Area, Circumference
    if (
      q.includes('perimeter') ||
      q.includes('area of') ||
      q.includes('circumference') ||
      q.includes('radius') ||
      q.includes('diameter') ||
      /\bpi\b/i.test(q) ||
      q.includes('22/7') ||
      q.includes('hectare')
    ) {
      let directAnswer = '';
      if (q.includes('circle') || q.includes('circumference')) {
        directAnswer = 'For a circle: **Circumference = $2\\pi r$ or $\\pi d$**, and **Area = $\\pi r^2$** (where radius $r = d \\div 2$ and $\\pi \\approx \\frac{22}{7}$ or $3.14$).';
      } else if (q.includes('triangle')) {
        directAnswer = '**Area of a Triangle = $\\frac{1}{2} \\times \\text{base} \\times \\text{perpendicular height}$** ($A = \\frac{1}{2}bh$).';
      } else if (q.includes('rectangle') || q.includes('square')) {
        directAnswer = 'For a rectangle: **Perimeter = $2(l + w)$**, **Area = $l \\times w$**. For a square: **Perimeter = $4s$**, **Area = $s^2$**.';
      } else if (q.includes('hectare')) {
        directAnswer = '**1 hectare (ha) = 10 000 m²**. (A square plot of 100 m by 100 m).';
      }

      return {
        text: `### Perimeter, Area & Circumference
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Formulas and measurement units required in ZIMSEC Grade 7 geometry:

1. Perimeter (Distance around the outside of a shape):
- **Square:** $P = 4 \\times s$
- **Rectangle:** $P = 2(l + w)$ or $2l + 2w$
- **Circle (Circumference):** $C = 2\\pi r = \\pi d$
  * Example with diameter $14\\text{ cm}$: $C = \\frac{22}{7} \\times 14 = 44\\text{ cm}$.

2. Area (Amount of flat 2D surface covered):
- **Square:** $A = s \\times s = s^2$
- **Rectangle:** $A = l \\times w$
- **Triangle:** $A = \\frac{1}{2} \\times \\text{base} \\times \\text{perpendicular height}$
  * Example: Base $10\\text{ cm}$, height $6\\text{ cm}$ -> Area = $\\frac{1}{2} \\times 10 \\times 6 = 30\\text{ cm}^2$.
- **Circle:** $A = \\pi r^2$
  * Example with radius $7\\text{ cm}$: $A = \\frac{22}{7} \\times 7 \\times 7 = 154\\text{ cm}^2$.

3. Land & Area Conversions:
- $1\\text{ cm}^2 = 100\\text{ mm}^2$
- $1\\text{ m}^2 = 10\\,000\\text{ cm}^2$
- **$1\\text{ hectare (ha)} = 10\\,000\\text{ m}^2$**
- $1\\text{ km}^2 = 100\\text{ hectares} = 1\\,000\\,000\\text{ m}^2$.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Measures & Area',
        suggestions: [
          'What is the formula for volume of a cuboid?',
          'What are the 3D shapes and Euler\'s formula?',
          'What is the BODMAS rule?'
        ]
      };
    }

    // 7. Volume, Capacity, Mass
    if (
      q.includes('volume') ||
      q.includes('capacity') ||
      q.includes('cuboid') ||
      q.includes('cube') ||
      q.includes('cubic centimetre') ||
      q.includes('millilitre') ||
      q.includes('litre') ||
      q.includes('tonne')
    ) {
      let directAnswer = '';
      if (q.includes('volume of cuboid') || q.includes('volume of cube')) {
        directAnswer = '**Volume of Cuboid = Length × Width × Height** ($V = l \\times w \\times h$). **Volume of Cube = $s^3$**.';
      } else if (q.includes('capacity') || q.includes('millilitre') || q.includes('litre')) {
        directAnswer = '**1 litre = 1 000 ml = 1 000 cm³**. Therefore, **1 cm³ = 1 ml**.';
      } else if (q.includes('tonne') || q.includes('mass')) {
        directAnswer = '**1 tonne = 1 000 kg**; **1 kg = 1 000 g**.';
      }

      return {
        text: `### Volume, Capacity & Mass
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
1. Volume Formulas:
- **Volume of a Cuboid:**
  $$V = \\text{Length} \\times \\text{Width} \\times \\text{Height} = l \\times w \\times h$$
  * Example: Length 8 cm, width 5 cm, height 4 cm -> $V = 8 \\times 5 \\times 4 = 160\\text{ cm}^3$.
- **Volume of a Cube:**
  $$V = s \\times s \\times s = s^3$$
  * Example: Cube with edge 5 cm -> $V = 5 \\times 5 \\times 5 = 125\\text{ cm}^3$.

2. Key Capacity & Metric Equivalences:
- **$1\\text{ cm}^3 = 1\\text{ ml}$**
- **$1\\text{ litre} = 1\\,000\\text{ ml} = 1\\,000\\text{ cm}^3$**
- $1\\text{ m}^3 = 1\\,000\\text{ litres}$.
- Problem: A container measures $20\\text{ cm} \\times 10\\text{ cm} \\times 15\\text{ cm}$. How many litres does it hold?
  * Volume = $20 \\times 10 \\times 15 = 3\\,000\\text{ cm}^3$.
  * Capacity in litres = $3\\,000 \\div 1\\,000 = 3\\text{ litres}$.

3. Mass Units:
- $1\\text{ kilogram (kg)} = 1\\,000\\text{ grams (g)}$
- **$1\\text{ tonne (t)} = 1\\,000\\text{ kilograms (kg)}$**.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Volume & Capacity',
        suggestions: [
          'What is Euler\'s formula for 3D polyhedra?',
          'How do you convert 12 hour to 24 hour clock?',
          'What is simple interest formula?'
        ]
      };
    }

    // 8. 3D Solids & Euler's Formula
    if (
      q.includes('euler') ||
      q.includes('faces edges vertices') ||
      q.includes('how many faces') ||
      q.includes('how many vertices') ||
      q.includes('how many edges') ||
      q.includes('polyhedra') ||
      q.includes('polyhedron') ||
      q.includes('triangular prism')
    ) {
      let directAnswer = '**Euler\'s Formula** for polyhedra is **Faces + Vertices - Edges = 2** ($F + V - E = 2$). A cube or cuboid has **6 faces, 12 edges, and 8 vertices** ($6 + 8 - 12 = 2$).';
      return {
        text: `### 3D Solids & Euler's Formula
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
In ZIMSEC Grade 7 geometry, 3D solids are classified by their faces ($F$), edges ($E$), and vertices ($V$):

1. Properties of Common 3D Shapes:
- **Cube:** 6 square faces, 12 equal edges, 8 vertices.
- **Cuboid (Rectangular Prism):** 6 rectangular faces, 12 edges, 8 vertices.
- **Triangular Prism:** 5 faces (2 triangular ends, 3 rectangular sides), 9 edges, 6 vertices.
- **Square-Based Pyramid:** 5 faces (1 square base, 4 triangular faces), 8 edges, 5 vertices.
- **Tetrahedron (Triangular-Based Pyramid):** 4 triangular faces, 6 edges, 4 vertices.
- **Cylinder:** 3 faces (2 flat circular, 1 curved), 2 curved edges, 0 vertices.
- **Cone:** 2 faces (1 flat circular, 1 curved), 1 circular edge, 1 vertex (apex).
- **Sphere:** 1 curved surface, 0 edges, 0 vertices.

2. Euler's Formula:
- For any closed polyhedron:
  $$F + V - E = 2$$
  * Cube: $6 + 8 - 12 = 2$ (Verified)
  * Triangular Prism: $5 + 6 - 9 = 2$ (Verified)
  * Square-based Pyramid: $5 + 5 - 8 = 2$ (Verified)

*ZIMSEC Question Pattern:* "A solid shape has 8 faces and 12 vertices. How many edges does it have?"
- Solution: $8 + 12 - E = 2 \\implies 20 - E = 2 \\implies E = 18\\text{ edges}$.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • 3D Geometry',
        suggestions: [
          'What are the angle rules for triangles and polygons?',
          'What is the formula for volume of a cuboid?',
          'What is the BODMAS rule?'
        ]
      };
    }

    // 9. Angles, Triangles, Quadrilaterals, and Polygons
    if (
      q.includes('angle') ||
      q.includes('acute') ||
      q.includes('obtuse') ||
      q.includes('reflex') ||
      q.includes('quadrilateral') ||
      q.includes('polygon') ||
      q.includes('interior angles') ||
      q.includes('equilateral') ||
      q.includes('isosceles')
    ) {
      let directAnswer = '';
      if (q.includes('acute') || q.includes('obtuse') || q.includes('reflex')) {
        directAnswer = 'Angle classifications: **Acute** (< 90°), **Right Angle** (90°), **Obtuse** (between 90° and 180°), **Straight Angle** (180°), **Reflex** (between 180° and 360°), **Revolution** (360°).';
      } else if (q.includes('triangle')) {
        directAnswer = 'The interior angles of any triangle **always add up to 180°**. In an **equilateral triangle**, all 3 angles are 60°. In an **isosceles triangle**, 2 sides and 2 base angles are equal.';
      } else if (q.includes('polygon') || q.includes('quadrilateral')) {
        directAnswer = 'Angles in a quadrilateral add up to **360°**. For any polygon with $n$ sides, the sum of interior angles is **$(n - 2) \\times 180°$** (e.g. pentagon = 540°, hexagon = 720°).';
      }

      return {
        text: `### Angles & Polygons
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key geometric principles tested in ZIMSEC Grade 7:

1. Classification of Angles:
- **Acute Angle:** Greater than 0° but less than 90°.
- **Right Angle:** Exactly 90° (indicated by a square corner).
- **Obtuse Angle:** Greater than 90° but less than 180°.
- **Straight Angle:** Exactly 180° (a straight line).
- **Reflex Angle:** Greater than 180° but less than 360°.
- **Complete Turn / Revolution:** Exactly 360°.

2. Fundamental Angle Theorems:
- **Angles on a straight line** add up to **180°** ($a + b = 180°$).
- **Angles at a point** add up to **360°**.
- **Vertically opposite angles** are equal.
- **Complementary angles** add up to 90°.
- **Supplementary angles** add up to 180°.

3. Triangles & Polygons Angle Sum:
- Triangle: Interior angles sum = **180°**.
- Quadrilateral (Square, Rectangle, Parallelogram, Rhombus, Trapezium): Sum = **360°**.
- Any $n$-sided polygon: Sum of interior angles = **$(n - 2) \\times 180°$**
  * Pentagon (5 sides): $(5 - 2) \\times 180° = 3 \\times 180° = 540°$.
  * Hexagon (6 sides): $(6 - 2) \\times 180° = 4 \\times 180° = 720°$.
  * Octagon (8 sides): $(8 - 2) \\times 180° = 6 \\times 180° = 1\\,080°$.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Geometry',
        suggestions: [
          'What is Euler\'s formula for 3D shapes?',
          'What is the formula for simple interest?',
          'What is the BODMAS rule?'
        ]
      };
    }

    // 10. Statistics: Mean, Median, Mode, Range, and Pie Charts (Strict math query checks to avoid matching English verbs like "what does it mean" or "modes of transport")
    const isMathStats =
      !q.includes('symbol') &&
      !q.includes('symptom') &&
      !q.includes('flag') &&
      !q.includes('anthem') &&
      !q.includes('bird') &&
      !q.includes('coat of arms') &&
      !q.includes('transport') &&
      !q.includes('transmission') &&
      !q.includes('mountain') &&
      !q.includes('what do') &&
      !q.includes('what does') &&
      !q.includes('meaning') &&
      (
        q.includes('calculate the mean') ||
        q.includes('find the mean') ||
        q.includes('arithmetic mean') ||
        q.includes('what is the mean of') ||
        /\bmean\s+(of|score|mark|value|temperature|rainfall|number|height|weight)\b/.test(q) ||
        (/\bmean\b/.test(q) && (q.includes('median') || q.includes('mode') || q.includes('statistics') || q.includes('data') || q.includes('frequency'))) ||
        q.includes('median') ||
        (q.includes('mode') && (q.includes('median') || q.includes('mean') || q.includes('frequency') || q.includes('most common') || q.includes('most frequent'))) ||
        (q.includes('range') && (q.includes('highest') || q.includes('lowest') || q.includes('spread') || q.includes('measures of central'))) ||
        (q.includes('average') && (q.includes('calculate') || q.includes('find') || q.includes('score') || q.includes('mark') || q.includes('speed') || q.includes('number'))) ||
        q.includes('pie chart')
      );

    if (isMathStats) {
      let directAnswer = '';
      if (q.includes('mean') || q.includes('average')) {
        directAnswer = '**Mean = (Sum of all values) ÷ (Total count of values)**.';
      } else if (q.includes('median')) {
        directAnswer = '**Median** is the middle value when all numbers are ordered from smallest to largest.';
      } else if (q.includes('mode')) {
        directAnswer = '**Mode** is the value that appears most frequently in a set of data.';
      } else if (q.includes('range')) {
        directAnswer = '**Range = Highest Value - Lowest Value** (measures the spread of data).';
      } else if (q.includes('pie chart')) {
        directAnswer = 'In a pie chart, **Sector Angle = $\\frac{\\text{Frequency}}{\\text{Total}} \\times 360°$**.';
      }

      return {
        text: `### Statistics & Averages
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Data handling measures tested in Grade 7 ZIMSEC:

1. Measures of Central Tendency:
- **Mean (Arithmetic Average):**
  $$\\text{Mean} = \\frac{\\text{Sum of all scores}}{\\text{Number of scores}}$$
  * Example: Test marks 14, 18, 12, 16, 20.
  * $\\text{Sum} = 14 + 18 + 12 + 16 + 20 = 80$.
  * $\\text{Mean} = 80 \\div 5 = 16$.

- **Median (Middle Score):**
  * Step 1: Arrange data in ascending order!
  * Odd count: Pick the exact middle number.
    - Data: 7, 2, 9, 4, 11 -> Ordered: 2, 4, **7**, 9, 11 -> **Median = 7**.
  * Even count: Average the two middle numbers.
    - Ordered: 4, **6**, **10**, 12 -> $\\text{Median} = (6 + 10) \\div 2 = 8$.

- **Mode (Most Common):**
  * The number that appears the most times.
  * Data: 3, 5, 7, 5, 8, 5, 9 -> **Mode = 5** (appears 3 times).

- **Range (Spread):**
  * $\\text{Range} = \\text{Highest Value} - \\text{Lowest Value}$.
  * Data: 15, 42, 8, 29 -> $\\text{Range} = 42 - 8 = 34$.

2. Pie Chart Sector Angle:
- Sector Angle = $\\frac{\\text{Category Amount}}{\\text{Total Amount}} \\times 360°$.
  * If 15 out of 60 pupils like soccer: $\\frac{15}{60} \\times 360° = \\frac{1}{4} \\times 360° = 90°$.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Statistics',
        suggestions: [
          'What is the probability formula?',
          'What is the formula for simple interest?',
          'What is the BODMAS rule?'
        ]
      };
    }

    // 11. Probability
    if (
      q.includes('probability') ||
      q.includes('chance') ||
      q.includes('likelihood') ||
      q.includes('die is tossed') ||
      q.includes('die is rolled') ||
      q.includes('coin is tossed')
    ) {
      let directAnswer = 'The probability formula is **$P(\\text{Event}) = \\frac{\\text{Number of favourable outcomes}}{\\text{Total number of possible outcomes}}$**. Probability values always lie between **0 (impossible)** and **1 (certain)**.';
      return {
        text: `### Probability
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Probability measures how likely an event is to happen:

1. Probability Scale:
- **0:** Impossible event (e.g. rolling a 7 on a standard 6-sided die).
- **0.5 (1/2 or 50%):** Even chance (e.g. tossing heads on a fair coin).
- **1:** Certain event (e.g. the sun rising in the east).

2. Calculating Theoretical Probability:
- **Formula:**
  $$P(E) = \\frac{\\text{Favourable Outcomes}}{\\text{Total Possible Outcomes}}$$
- Examples:
  * Rolling an even number on a standard die:
    - Favourable: {2, 4, 6} (3 outcomes). Total: {1, 2, 3, 4, 5, 6} (6 outcomes).
    - $P(\\text{even}) = \\frac{3}{6} = \\frac{1}{2} = 0.5 = 50\\%$.
  * Picking a red ball from a bag with 4 red, 3 green, and 5 yellow balls:
    - Total balls = $4 + 3 + 5 = 12$.
    - $P(\\text{red}) = \\frac{4}{12} = \\frac{1}{3}$.

3. Complementary Probability (Not happening):
- $P(\\text{not } E) = 1 - P(E)$.
  * If $P(\\text{rain}) = \\frac{2}{5}$, then $P(\\text{no rain}) = 1 - \\frac{2}{5} = \\frac{3}{5}$.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Probability',
        suggestions: [
          'How do you calculate mean, median, and mode?',
          'What is the BODMAS rule?',
          'What is simple interest formula?'
        ]
      };
    }

    // 12. Time, 24-Hour Clock, Calendars
    if (
      q.includes('24-hour') ||
      q.includes('24 hour') ||
      q.includes('12-hour') ||
      q.includes('leap year') ||
      q.includes('how many days in february') ||
      q.includes('convert to 24')
    ) {
      let directAnswer = '';
      if (q.includes('24-hour') || q.includes('24 hour') || q.includes('12-hour')) {
        directAnswer = 'To convert from **12-hour to 24-hour clock**: for p.m. times after 12:59 p.m., **add 12 hours** (e.g. 7:45 p.m. = **19:45**; 12:30 p.m. = **12:30**; 12:15 a.m. = **00:15**). 24-hour time always has 4 digits with no "a.m." or "p.m." notation.';
      } else if (q.includes('leap year') || q.includes('february')) {
        directAnswer = 'A **leap year has 366 days** (instead of 365), and **February has 29 days** (instead of 28). Leap years occur every 4 years when the year is evenly divisible by 4 (e.g. 2024, 2028).';
      }

      return {
        text: `### Time & Calendars
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
1. 12-Hour vs 24-Hour Clocks:
- **Morning (a.m.):** Keep hours unchanged, use 4 digits.
  * 06:30 a.m. -> **06:30**
  * 12:15 a.m. (midnight) -> **00:15**
- **Afternoon/Evening (p.m.):**
  * 12:00 noon to 12:59 p.m. -> stays **12:00 to 12:59**
  * 01:00 p.m. upwards -> Add 12 to hours:
    - 03:20 p.m. -> $3 + 12 = 15$ -> **15:20**
    - 09:45 p.m. -> $9 + 12 = 21$ -> **21:45**
    - 11:59 p.m. -> $11 + 12 = 23$ -> **23:59**

2. Duration and Elapsed Time:
- Formula: $\\text{Elapsed Time} = \\text{Arrival / Departure Time} - \\text{Start Time}$.
- Example: A train departs Harare at 08:45 and arrives in Bulawayo at 15:15.
  * From 08:45 to 09:00 = 15 minutes.
  * From 09:00 to 15:00 = 6 hours.
  * From 15:00 to 15:15 = 15 minutes.
  * Total duration = 6 hours 30 minutes.

3. The Calendar:
- "Thirty days has September, April, June, and November. All the rest have thirty-one, except February alone, which has twenty-eight days clear, and twenty-nine in each leap year."
- Normal Year: 365 days (52 weeks and 1 day).
- Leap Year: 366 days (52 weeks and 2 days). Divisible by 4.`,
        sourceTag: 'ZIMSEC Grade 7 Mathematics Syllabus 7020 • Time & Calendars',
        suggestions: [
          'What is the formula for speed distance time?',
          'What is the BODMAS rule?',
          'What is simple interest formula?'
        ]
      };
    }

    return null;
  }

  /**
   * Primary Agriculture, Science & Technology Curriculum (ZIMSEC 7030)
   * High-accuracy, zero-hallucination science and agriculture answering engine covering all core Grade 7 syllabus domains
   */
  private static handlePrimaryScienceTechQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase();
    const decomp = this.decomposeQuestion(question);

    // =========================================================================
    // DIRECT PRIMARY SCIENCE & TECHNOLOGY HANDLERS (ZIMSEC 7030 HBC)
    // Laser-focused: Returns ONLY the exact answer asked without paragraph dumping
    // =========================================================================

    // 1. Sugar and Salt Solution (SSS / ORS)
    if (
      q.includes('sugar and salt') ||
      q.includes('salt and sugar') ||
      q.includes('sugar-salt') ||
      q.includes('salt-sugar') ||
      (q.includes('sss') && (q.includes('solution') || q.includes('prepare') || q.includes('recipe') || q.includes('make') || q.includes('oral') || q.includes('salt'))) ||
      q.includes('oral rehydration')
    ) {
      const asksRecipe = q.includes('recipe') || q.includes('ingredient') || q.includes('quantity') || q.includes('quantities') || q.includes('measurement');
      const asksPrep = decomp.asksProcess || q.includes('prepare') || q.includes('preparation') || q.includes('make') || q.includes('mix') || q.includes('how to');

      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Sugar and Salt Solution (SSS / ORS)\n\n**Sugar and Salt Solution (SSS)**, also known as **Oral Rehydration Solution (ORS)**, is a life-saving home-made drink used to treat dehydration and restore lost body water and essential mineral salts (*electrolytes*) caused by severe diarrhea and vomiting (e.g. from cholera, dysentery, or typhoid).\n\n- **Sugar:** Provides quick energy and enables the intestines to absorb water and sodium.\n- **Salt:** Replaces lost essential sodium and chloride electrolytes.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['How do you prepare sugar and salt solution?', 'What is the recipe for sugar and salt solution?', 'What are waterborne diseases?']
        };
      }

      if (asksRecipe && !asksPrep && !decomp.asksDefinition) {
        return {
          text: `### Recipe for Sugar and Salt Solution (SSS)\n\n- **1 Litre** of clean, safe water (boiled and cooled).\n- **6 level teaspoons** of sugar.\n- **½ level teaspoon** of salt.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['How do you prepare sugar and salt solution?', 'What is sugar and salt solution used for?', 'What are the symptoms of cholera?']
        };
      }

      if (decomp.asksOnlyProcess || (asksPrep && !decomp.asksDefinition && !asksRecipe)) {
        return {
          text: `### How to Prepare Sugar and Salt Solution (SSS)\n\n1. **Wash hands:** Wash your hands thoroughly with clean running water and soap.\n2. **Measure water:** Measure exactly **1 litre of clean boiled and cooled water** into a clean jug or container.\n3. **Add Sugar:** Add **6 level teaspoons of sugar** to the water.\n4. **Add Salt:** Add **½ level teaspoon of salt** (do not exceed ½ teaspoon as excess salt is dangerous to infants).\n5. **Dissolve:** Stir the mixture well with a clean spoon until all sugar and salt crystals completely dissolve.\n6. **Taste Test:** Taste the solution — it should taste no saltier than human tears.\n7. **Administration:** Give small sips frequently to the patient, especially after every loose stool.\n8. **Storage Rule:** Any unused solution must be thrown away after **24 hours** and a fresh batch prepared.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['What is the recipe for sugar and salt solution?', 'What is sugar and salt solution?', 'What are waterborne diseases?']
        };
      }

      const sections: string[] = [`### Sugar and Salt Solution (SSS / Oral Rehydration Solution)`];
      if (decomp.asksDefinition) {
        sections.push(`#### 1. What is Sugar and Salt Solution (SSS)?\n**Sugar and Salt Solution (SSS)** is a life-saving home-made drink used to treat dehydration and restore lost body water and electrolytes caused by severe diarrhea and vomiting.\n- **Sugar:** Provides energy and facilitates water absorption in the intestines.\n- **Salt:** Replaces lost essential sodium and chloride electrolytes.`);
      }
      if (asksRecipe || asksPrep) {
        sections.push(`#### ${sections.length}. Exact Recipe & Ingredients\n- **1 Litre** of clean, safe water (boiled and cooled).\n- **6 level teaspoons** of sugar.\n- **½ level teaspoon** of salt.`);
      }
      if (asksPrep) {
        sections.push(`#### ${sections.length}. Step-by-Step Preparation Method\n1. Wash hands thoroughly with soap and running water.\n2. Measure exactly 1 litre of clean boiled and cooled water into a clean jug.\n3. Add 6 level teaspoons of sugar and ½ level teaspoon of salt.\n4. Stir until completely dissolved.\n5. Administer small sips frequently; discard unused solution after 24 hours.`);
      }

      return {
        text: sections.join('\n\n'),
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
        suggestions: ['What are the symptoms of cholera?', 'What are waterborne diseases?', 'What are the 6 child-killer diseases?']
      };
    }

    // 2. Noise Pollution
    if (q.includes('noise pollution') || (q.includes('pollution') && q.includes('noise'))) {
      const asksSources = decomp.asksCauses || q.includes('source') || q.includes('sources');
      const asksEffects = decomp.asksEffects || q.includes('effect') || q.includes('effects') || q.includes('impact');
      const asksReduction = decomp.asksPreventionOrManagement || q.includes('reduc') || q.includes('control') || q.includes('ways of') || q.includes('prevent');

      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Noise Pollution\n\n**Noise pollution** is the presence of unwanted, excessive, or disruptive sound in the environment that causes discomfort, stress, hearing impairment, or health hazards to humans and animals. It is measured in **decibels (dB)**; sounds consistently above 85 dB damage human hearing.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the sources of noise pollution?', 'What are the effects of noise pollution?', 'How can noise pollution be reduced?']
        };
      }

      if (decomp.asksOnlyCauses || (asksSources && !asksEffects && !asksReduction && !decomp.asksExplicitDefinition && !decomp.asksPureWhatIs)) {
        return {
          text: `### Sources of Noise Pollution\n\n1. **Transportation:** Heavy road traffic, noisy exhaust pipes, honking horns, trains, and low-flying aeroplanes.\n2. **Industrial & Mining:** Heavy factory machines, pneumatic drills, metal workshops, and mine rock blasting.\n3. **Commercial & Social:** Loudspeakers at shopping centres, night clubs, beer halls, and religious gatherings.\n4. **Domestic:** Loud radios/televisions, petrol generators during power outages, and power lawnmowers.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the effects of noise pollution?', 'How can noise pollution be reduced?', 'What is noise pollution?']
        };
      }

      if (decomp.asksOnlyEffects || (asksEffects && !asksSources && !asksReduction && !decomp.asksExplicitDefinition && !decomp.asksPureWhatIs)) {
        return {
          text: `### Effects of Noise Pollution\n\n- **Hearing Damage:** Prolonged exposure causes temporary or permanent hearing loss and ringing in the ears (*tinnitus*).\n- **Sleep Disturbance & Fatigue:** Causes insomnia, restlessness, and constant fatigue.\n- **Mental Stress & Irritability:** Triggers headaches, anxiety, lack of concentration in school, and aggressive behavior.\n- **Cardiovascular Health:** Elevates stress hormones (adrenaline), leading to high blood pressure (*hypertension*) and heart strain.\n- **Animal Disruption:** Scares domestic livestock and interferes with wildlife communication.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['How can noise pollution be reduced?', 'What are the sources of noise pollution?', 'What is noise pollution?']
        };
      }

      if (decomp.asksOnlyPrevention || (asksReduction && !asksSources && !asksEffects && !decomp.asksExplicitDefinition && !decomp.asksPureWhatIs)) {
        return {
          text: `### Ways of Reducing Noise Pollution\n\n1. **Silencers & Mufflers:** Fitting and maintaining effective silencers on vehicle exhausts, generators, and industrial machinery.\n2. **Tree Barriers (Acoustic Buffers):** Planting rows of dense trees and hedges around schools, hospitals, and homes to absorb sound waves.\n3. **Personal Protective Equipment (PPE):** Factory workers and miners wearing earplugs or earmuffs.\n4. **Legislation & Enforcing Curfews:** Enforcing municipal bye-laws that restrict high-volume sound at night.\n5. **Town Planning:** Situating airports, heavy industries, and railway lines far away from residential suburbs.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the sources of noise pollution?', 'What are the effects of noise pollution?', 'What is noise pollution?']
        };
      }

      const sections: string[] = [`### Noise Pollution`];
      if (decomp.asksDefinition) {
        sections.push(`#### 1. What is Noise Pollution?\n**Noise pollution** is the presence of unwanted, excessive, or disruptive sound in the environment that causes discomfort, stress, hearing impairment, or health hazards.`);
      }
      if (asksSources) {
        sections.push(`#### ${sections.length}. Sources of Noise Pollution\n1. **Transportation:** Traffic, horns, train whistles, aeroplanes.\n2. **Industry & Mining:** Heavy machines, rock blasting.\n3. **Social:** Loudspeakers, open-air religious services, music venues.\n4. **Domestic:** Generators, high-volume stereos.`);
      }
      if (asksEffects) {
        sections.push(`#### ${sections.length}. Effects of Noise Pollution\n- Hearing loss and tinnitus.\n- Sleep disturbance, fatigue, and headaches.\n- Lack of concentration in school and high blood pressure.`);
      }
      if (asksReduction) {
        sections.push(`#### ${sections.length}. Ways of Reducing Noise Pollution\n1. Fitting silencers on exhausts and generators.\n2. Planting tree belts as noise barriers.\n3. Wearing protective earplugs in loud workplaces.\n4. Enforcing council noise bylaws.`);
      }

      return {
        text: sections.join('\n\n'),
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
        suggestions: ['What are the sources of noise pollution?', 'What are the effects of noise pollution?', 'How can noise pollution be reduced?']
      };
    }

    // 3. Child-Killer Diseases and Immunization
    if (
      q.includes('child killer') ||
      q.includes('child-killer') ||
      q.includes('childkiller') ||
      ((q.includes('immuniz') || q.includes('immunis')) && (q.includes('disease') || q.includes('child') || q.includes('baby') || q.includes('importance') || q.includes('what is') || q.includes('define') || q.includes('outline')))
    ) {
      const asksDiseases = q.includes('disease') || q.includes('killer') || q.includes('identify') || q.includes('name') || q.includes('list');
      const asksImportance = decomp.asksOnlyFunctions || q.includes('importance') || q.includes('why');

      if (decomp.asksOnlyDefinition && !asksDiseases) {
        return {
          text: `### Immunization\n\n**Immunization** (vaccination) is the medical process of protecting an individual against specific infectious diseases by administering a **vaccine** (weakened or dead pathogens, or their antigens), which stimulates the body's immune system to produce **antibodies** and immunological memory.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['What are the 6 child-killer diseases?', 'What is the importance of immunization?', 'What are the symptoms of measles?']
        };
      }

      if (asksDiseases && !asksImportance && !decomp.asksOnlyDefinition) {
        return {
          text: `### The Six Major Child-Killer Diseases\n\n1. **Measles (Gwirikwiti):** Caused by a virus; symptoms include high fever, runny nose, red watery eyes, and a widespread blotchy red skin rash.\n2. **Polio (Poliomyelitis):** Caused by poliovirus through contaminated food/water; causes fever, stiff neck, and sudden permanent limb paralysis.\n3. **Tuberculosis (TB):** Caused by *Mycobacterium tuberculosis*; causes persistent cough (>2 weeks), coughing blood, night sweats, and weight loss.\n4. **Tetanus (Lockjaw):** Caused by *Clostridium tetani* entering dirty cuts or wounds; causes severe painful muscle spasms and locked jaw muscles.\n5. **Whooping Cough (Pertussis):** Caused by *Bordetella pertussis*; causes severe uncontrollable coughing bouts ending in a high-pitched "whoop".\n6. **Diphtheria:** Caused by *Corynebacterium diphtheriae*; forms a thick grey membrane across the throat that obstructs breathing.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['What is immunization?', 'What is the importance of immunization?', 'What is sugar and salt solution?']
        };
      }

      if (asksImportance && !asksDiseases) {
        return {
          text: `### Importance of Immunization\n\n- **Child Survival:** Protects infants and vulnerable children from deadly preventable diseases and permanent disabilities (such as paralysis from polio).\n- **Disease Eradication:** Completely wipes out lethal infections across the country (e.g. smallpox eradicated, polio near eradication).\n- **Herd Immunity:** When the majority of children in Zimbabwe are vaccinated, infectious pathogens cannot spread, protecting even children who cannot be vaccinated due to medical reasons.\n- **Saves Healthcare Costs:** Reduces national hospital admissions and medical expenses for families.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['What are the 6 child-killer diseases?', 'What is immunization?', 'What is tuberculosis?']
        };
      }

      const sections: string[] = [`### Immunization and the 6 Child-Killer Diseases`];
      if (decomp.asksDefinition) {
        sections.push(`#### 1. What is Immunization?\n**Immunization** is the process of giving a vaccine to stimulate the body's immune system to produce antibodies against specific deadly infections.`);
      }
      sections.push(`#### ${sections.length}. The Six Major Child-Killer Diseases\n1. **Measles:** High fever, runny nose, red skin rash.\n2. **Polio:** Fever, sudden permanent limb paralysis.\n3. **Tuberculosis (TB):** Persistent bloody cough, night sweats, weight loss.\n4. **Tetanus:** Muscle spasms and jaw stiffness from dirty wounds.\n5. **Whooping Cough:** Uncontrollable coughing ending with a whoop.\n6. **Diphtheria:** Thick grey membrane blocking the throat.`);
      if (asksImportance) {
        sections.push(`#### ${sections.length}. Importance of Immunization\n- Protects children against death and permanent disability.\n- Builds community herd immunity.\n- Saves families and the Ministry of Health expensive hospital treatment costs.`);
      }

      return {
        text: sections.join('\n\n'),
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
        suggestions: ['What are the symptoms of measles and tuberculosis?', 'What is the importance of immunization?', 'What is sugar and salt solution?']
      };
    }

    // 4. Teeth & Dental Health
    if (
      (q.includes('teeth') || q.includes('tooth')) &&
      (q.includes('type') || q.includes('types') || q.includes('function') || q.includes('decay') || q.includes('prevent') || q.includes('incisor') || q.includes('canine') || q.includes('molar') || q.includes('premolar') || q.includes('dental'))
    ) {
      const asksDef = decomp.asksDefinition || q.includes('what is tooth decay') || q.includes('define tooth decay') || q.includes('meaning of tooth decay') || q === 'tooth decay';
      const asksCauses = (decomp.asksCauses || q.includes('cause') || q.includes('causes') || q.includes('why do teeth decay') || q.includes('why does tooth decay')) && !asksDef;
      const asksPrevention = decomp.asksPreventionOrManagement || q.includes('prevent') || q.includes('care') || q.includes('protect');
      const asksTypes = decomp.asksTypes || decomp.asksFunctionsOrUses || q.includes('type') || q.includes('incisor') || q.includes('canine');

      if (asksDef) {
        return {
          text: `### Tooth Decay (Dental Caries)\n\n**Tooth decay** (dental caries) is the damage, breakdown, and destruction of dental enamel and underlying tooth structure caused by acids produced when plaque bacteria in the mouth ferment dietary sugars.\n\n- **Primary Mechanism:** Mouth bacteria in plaque feed on sugary residues, producing corrosive acid that dissolves the protective enamel, forming holes (cavities).\n- **Prevention:** Regular brushing twice daily with fluoride toothpaste, reducing sugary treats, rinsing after eating, and routine dental visits.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Dental Health',
          suggestions: ['What causes tooth decay?', 'How do you prevent tooth decay?', 'What are the four types of teeth and their functions?']
        };
      }

      if (asksCauses && !asksTypes && !asksPrevention) {
        return {
          text: `### Causes of Tooth Decay (Dental Caries)\n\n1. **Sugar Accumulation:** Sugary sweets, sodas, and sticky snacks leave residues trapped between teeth.\n2. **Plaque Formation:** Mouth bacteria feed on these sugars and form a sticky colorless film called **plaque** on tooth surfaces.\n3. **Acid Production:** Bacteria in plaque ferment sugar into **acid**.\n4. **Enamel Erosion:** The acid slowly dissolves the outer protective **enamel** layer, forming holes called **cavities**. If decay reaches the sensitive inner pulp and nerve, severe toothache occurs.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Dental Health',
          suggestions: ['How do you prevent tooth decay?', 'What are the four types of teeth and their functions?', 'What is the difference between milk teeth and permanent teeth?']
        };
      }

      if (asksPrevention && !asksTypes && !asksCauses) {
        return {
          text: `### Methods of Preventing Tooth Decay\n\n1. **Regular Brushing:** Brush teeth thoroughly at least twice daily (after breakfast and before going to bed) using a soft toothbrush and fluoride toothpaste.\n2. **Proper Technique:** Brush all surfaces (outer, inner, and chewing surfaces) using gentle circular motions for at least 2 minutes.\n3. **Dietary Control:** Limit sugary snacks, candies, and fizzy drinks. Eat calcium-rich foods (milk, small fish/kapenta, dark leafy greens) to build strong teeth.\n4. **Rinsing & Flossing:** Rinse the mouth with clean water after eating and floss daily to remove food particles trapped between teeth.\n5. **Dental Check-ups:** Visit a dental clinic regularly for examination.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Dental Health',
          suggestions: ['What causes tooth decay?', 'What are the four types of teeth and their functions?', 'What is the function of canines?']
        };
      }

      if (asksTypes && !asksCauses && !asksPrevention) {
        return {
          text: `### The Four Types of Teeth and Their Functions\n\n1. **Incisors (8 total - 4 upper, 4 lower):**\n   - **Shape:** Chisel-shaped with sharp, straight cutting edges.\n   - **Function:** **Biting and cutting** pieces of food.\n2. **Canines (4 total - 2 upper, 2 lower):**\n   - **Shape:** Pointed, dagger-shaped and sharp.\n   - **Function:** **Tearing** tough food and meat.\n3. **Premolars (8 total - 4 upper, 4 lower):**\n   - **Shape:** Flat surfaces with two raised cusps (bicuspid).\n   - **Function:** **Crushing and grinding** food into smaller particles.\n4. **Molars (12 total - 6 upper, 6 lower):**\n   - **Shape:** Broad, large flat surfaces with multiple cusps.\n   - **Function:** **Fine grinding and chewing** food before swallowing.\n\n- **Dentition Sets:** **20 milk teeth** in young children (no premolars); **32 permanent teeth** in adults.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Dental Health',
          suggestions: ['What causes tooth decay?', 'How do you prevent tooth decay?', 'What is the function of canines?']
        };
      }

      const sections: string[] = [`### Human Teeth and Dental Health`];
      if (asksTypes) {
        sections.push(`#### 1. The Four Types of Teeth\n- **Incisors (8):** Biting and cutting food.\n- **Canines (4):** Tearing meat and tough food.\n- **Premolars (8):** Crushing and grinding food.\n- **Molars (12):** Fine chewing and grinding.`);
      }
      if (asksCauses) {
        sections.push(`#### ${sections.length}. Causes of Tooth Decay\nBacteria in dental plaque feed on sugary food residues, producing acids that corrode tooth enamel and create cavities.`);
      }
      if (asksPrevention) {
        sections.push(`#### ${sections.length}. Prevention of Tooth Decay\nBrush teeth twice daily with fluoride toothpaste, reduce sugary foods, rinse after meals, and visit dental clinics.`);
      }

      return {
        text: sections.join('\n\n'),
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Dental Health',
        suggestions: ['What causes tooth decay?', 'What are the four types of teeth and their functions?', 'How do you prevent tooth decay?']
      };
    }

    // 5. Reproduction & Gestation Periods
    if (
      q.includes('gestation') ||
      (q.includes('reproduction') && (q.includes('animal') || q.includes('domestic')) && (q.includes('period') || q.includes('mating'))) ||
      (q.includes('mating') && q.includes('gestation'))
    ) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Gestation Period\n\nThe **gestation period** (pregnancy) is the length of time an embryo or fetus develops inside the female mother's uterus (womb) from fertilization (conception) until birth (*parturition*).\n\n- **Fertilization:** The fusion of a male sperm cell and a female egg (*ovum*) to form a zygote.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Crops, Plants & Animals',
          suggestions: ['What is the gestation period of a cow, pig, and sheep?', 'What is the human gestation period?', 'What is seed germination?']
        };
      }

      return {
        text: `### Gestation Periods of Animals and Humans\n\n| Animal / Species | Gestation Period in Months | Gestation Period in Days |\n| :--- | :--- | :--- |\n| **Human** | **9 months** | **~280 days (40 weeks)** |\n| **Cow (Cattle)** | **9 months** | **~280 – 283 days** |\n| **Horse (Mare)** | **11 months** | **~336 days** |\n| **Sheep (Ewe)** | **5 months** | **~145 – 150 days** |\n| **Goat (Doe)** | **5 months** | **~150 days** |\n| **Pig (Sow)** | **3 months, 3 weeks, 3 days** | **~114 days** |\n| **Dog (Bitch)** | **2 months** | **~60 – 63 days** |\n| **Cat (Queen)** | **2 months** | **~60 – 65 days** |\n| **Rabbit (Doe)** | **1 month** | **~30 – 31 days** |\n| **Elephant** | **22 months** | **~660 days (Longest)** |\n\n- **Key Syllabus Rule:** A sow's gestation is easily remembered as **"3 months, 3 weeks, and 3 days"** (114 days). Larger mammals have longer gestation periods.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Crops, Plants & Animals',
        suggestions: ['What is gestation period?', 'What are the parts of the human reproductive system?', 'What is seed germination?']
      };
    }

    // 6. Emotional Intelligence, Self-Awareness, Self-Regulation & Emotional Health
    if (
      q.includes('emotional intelligence') ||
      q.includes('self-awareness') ||
      q.includes('self awareness') ||
      q.includes('self-regulation') ||
      q.includes('self regulation') ||
      (q.includes('emotional health') && !q.includes('physical health'))
    ) {
      if (q.includes('self-awareness') || q.includes('self awareness')) {
        return {
          text: `### Self-Awareness\n\n**Self-awareness** is the conscious ability to recognize and understand your own emotions, thoughts, personal strengths, weaknesses, values, and how your actions affect other people around you.\n\n- **Importance of Self-Awareness:**\n  * Helps pupils make sound, independent decisions and resist negative peer pressure.\n  * Builds realistic self-confidence and a strong sense of personal identity.\n  * Enables learners to recognize emotional triggers (e.g. what triggers anger or anxiety) before reacting impulsively.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Emotional Health & Wellness',
          suggestions: ['What is self-regulation?', 'What are the components of emotional intelligence?', 'What is emotional health?']
        };
      }

      if (q.includes('self-regulation') || q.includes('self regulation')) {
        return {
          text: `### Self-Regulation\n\n**Self-regulation** is the ability to monitor and control your own emotions, impulses, reactions, and behaviors constructively, especially during stressful, frustrating, or provocative situations.\n\n- **Importance of Self-Regulation:**\n  * Prevents violent fights, bullying, and reckless outbursts.\n  * Allows pupils to calm down, think critically, and choose peaceful solutions (*Unhu/Ubuntu*).\n  * Enhances classroom concentration and academic performance.\n\n- **Self-Regulation Techniques:**\n  1. **Deep Breathing:** Inhale slowly through the nose for 4 counts, hold, and exhale through the mouth to reduce heart rate.\n  2. **Count to 10:** Silently count to 10 before reacting when provoked or angry.\n  3. **Time-Out:** Walk away from a heated conflict until strong emotions subside.\n  4. **Positive Self-Talk:** Reassure yourself with calm thoughts (e.g. "I can handle this peacefully").\n  5. **Calm Expression:** Use polite "I-feel" statements instead of shouting or hurling insults.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Emotional Health & Wellness',
          suggestions: ['What is self-awareness?', 'What are the components of emotional intelligence?', 'What is emotional health?']
        };
      }

      return {
        text: `### Emotional Intelligence & Emotional Health\n\n**Emotional Intelligence (EQ)** is the capacity to identify, understand, manage, and constructively express your own emotions, while empathetically recognizing and positively interacting with the emotions of others.\n\n- **Five Core Components of Emotional Intelligence:**\n  1. **Self-Awareness:** Recognizing your personal feelings, moods, strengths, and limits.\n  2. **Self-Regulation:** Controlling impulsive feelings and managing emotional reactions peacefully.\n  3. **Motivation:** Striving toward personal and school goals with resilience and optimism.\n  4. **Empathy:** Understanding, respecting, and caring about the feelings of other people.\n  5. **Social Skills:** Communicating clearly, collaborating in teams, resolving disputes peacefully, and displaying *Unhu/Ubuntu*.\n\n- **Signs of Emotional Health:** Emotional balance, self-respect, resilience after setbacks, and healthy relationships.\n- **Healthy Coping Mechanisms:** Talking to trusted parents/teachers, participating in sports/arts, getting 8 hours of sleep, and avoiding harmful habits.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Emotional Health & Wellness',
        suggestions: ['What is self-awareness?', 'What is self-regulation and what are its techniques?', 'What is mental wellness?']
      };
    }

    // 7. Sexually Transmitted Infections (STIs) & HIV/AIDS
    if (
      q.includes('sexually transmitted') ||
      (/stis?/i.test(q) && (q.includes('disease') || q.includes('infection') || q.includes('what is') || q.includes('define') || q.includes('prevent') || q.includes('sign') || q.includes('symptom') || q.includes('list'))) ||
      (/hiv/i.test(q) || /aids/i.test(q))
    ) {
      if (q.includes('hiv') || q.includes('aids')) {
        return {
          text: `### HIV and AIDS\n\n- **Definition:** **HIV (Human Immunodeficiency Virus)** is a virus that attacks the body's immune system, specifically white blood cells called **CD4 cells**. **AIDS (Acquired Immune Deficiency Syndrome)** is the advanced stage of HIV infection where the immune system is severely damaged, leaving the body vulnerable to opportunistic infections (e.g. TB, pneumonia).\n\n- **Modes of Transmission:**\n  1. Unprotected sexual intercourse with an infected partner.\n  2. Mother-to-child transmission during pregnancy, childbirth, or breastfeeding.\n  3. Sharing unsterilized needles, razor blades, or skin-piercing tools.\n  4. Transfusion of unscreened, infected blood.\n\n- **Prevention:** Abstinence (for youth), mutual faithfulness, consistent condom use, PMTCT (Prevention of Mother-To-Child Transmission) medications, and avoiding sharing sharp objects.\n\n- **Management of Infected Persons:**\n  1. **Antiretroviral Therapy (ART):** Taking daily prescribed ARV medication to suppress viral load.\n  2. **Healthy Nutrition:** Eating balanced meals rich in proteins, small grains, and vitamins.\n  3. **Treating Infections Promptly:** Seeking early medical care for opportunistic diseases like TB.\n  4. **Psychosocial Support:** Showing love, empathy, and eliminating discrimination and stigma (*Unhu/Ubuntu*).`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['What are STIs and what are their symptoms?', 'What is the difference between HIV and AIDS?', 'What are the methods of preventing STIs?']
        };
      }

      // STIs
      return {
        text: `### Sexually Transmitted Infections (STIs)\n\n**Sexually Transmitted Infections (STIs)** are infectious diseases passed from one person to another primarily through unprotected sexual contact, caused by bacteria, viruses, or parasites.\n\n- **Common STIs in the Syllabus:**\n  1. **Gonorrhoea:** Bacterial infection; causes yellow/green discharge and burning pain during urination.\n  2. **Syphilis:** Bacterial infection; produces painless sores (*chancres*), skin rash, and organ damage if untreated.\n  3. **Chlamydia:** Bacterial infection that can cause pelvic pain and infertility.\n  4. **Genital Herpes:** Viral infection; produces painful clusters of recurring blisters.\n  5. **Human Papillomavirus (HPV):** Viral infection linked to genital warts and cervical cancer.\n\n- **General Signs & Symptoms:** Unusual discharge from genitals, burning pain during urination, sores or blisters around private parts, persistent itching, lower abdominal pain.\n\n- **Prevention:** Abstinence (100% effective for pupils), mutual faithfulness, correct and consistent condom use, prompt medical treatment of both partners, avoiding sharing sharp objects.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
        suggestions: ['What is HIV and AIDS?', 'What are the signs and symptoms of STIs?', 'How are STIs prevented?']
      };
    }

    // 8. Internal Body Parts and Their Functions
    if (
      q.includes('internal body part') ||
      q.includes('internal body parts') ||
      q.includes('internal organs') ||
      q.includes('internal body organs') ||
      (q.includes('internal') && q.includes('parts') && (q.includes('body') || q.includes('human')))
    ) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Internal Body Parts\n\n**Internal body parts** (organs) are vital anatomical structures located inside the human body cavities (cranial, chest/thoracic, abdominal, and pelvic cavities) that carry out essential physiological life processes required for survival.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Biology',
          suggestions: ['What are the functions of the liver and kidneys?', 'What are the functions of internal body parts?', 'What are the parts of the digestive system?']
        };
      }

      return {
        text: `### Internal Body Parts and Their Functions\n\n1. **Brain (Cranial Cavity / Head):** The master control centre of the nervous system; interprets sensory information, controls thought, memory, emotions, speech, and voluntary/involuntary movements.\n2. **Heart (Chest Cavity):** Muscular 4-chambered pump that continuously pumps oxygenated blood to the body and deoxygenated blood to the lungs.\n3. **Lungs (Chest Cavity):** Responsible for gas exchange; absorbs oxygen from inhaled air into blood capillaries and expels carbon dioxide during exhalation.\n4. **Stomach (Upper Abdomen):** Muscular organ that churns food and secretes hydrochloric acid (kills germs) and pepsin to digest proteins.\n5. **Liver (Upper Right Abdomen):** The largest internal organ; produces bile to emulsify fats, detoxifies harmful chemicals and drugs, and stores excess glucose as glycogen.\n6. **Kidneys (Lower Back / Posterior Abdomen):** Two bean-shaped organs that filter metabolic wastes (urea, toxins, excess salts) from blood to produce **urine**.\n7. **Small Intestine (Abdomen):** Long coiled tube where digestion is completed and nutrients are absorbed into the bloodstream through microscopic **villi**.\n8. **Large Intestine (Abdomen):** Absorbs water and mineral salts from indigestible residues, compacting waste into feces.\n9. **Skeleton & Bones:** Provides structural framework, protects fragile organs (skull protects brain, rib cage protects heart and lungs), and produces blood cells in bone marrow.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Biology',
        suggestions: ['What are the functions of the liver and kidneys?', 'What is the function of the heart?', 'What are the parts of the respiratory system?']
      };
    }

    // 9. Puberty, Human Reproductive System & Personal Hygiene
    if (
      q.includes('puberty') ||
      (q.includes('reproductive') && (q.includes('part') || q.includes('system') || q.includes('human') || q.includes('puberty') || q.includes('hygiene')))
    ) {
      const asksChanges = q.includes('change') || q.includes('physical');
      const asksHygiene = q.includes('hygiene');
      const asksParts = q.includes('part') || q.includes('organ') || q.includes('male') || q.includes('female');

      if (decomp.asksOnlyDefinition && !asksChanges && !asksHygiene && !asksParts) {
        return {
          text: `### Puberty\n\n**Puberty** is the transitional developmental stage during adolescence (usually between ages 10 and 16) when the human reproductive organs mature, the pituitary gland releases sex hormones (testosterone in boys, oestrogen and progesterone in girls), and secondary sexual characteristics develop, making biological reproduction possible.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Development',
          suggestions: ['What are the physical changes during puberty in boys and girls?', 'What hygiene practices should be observed at puberty?', 'What are the human reproductive parts?']
        };
      }

      if (asksChanges && !asksHygiene && !asksParts) {
        return {
          text: `### Physical Changes During Puberty\n\n- **Physical Changes in Boys:**\n  * Voice deepens ("breaks") as the larynx (Adam's apple) enlarges.\n  * Growth of facial hair, underarm hair, and pubic hair.\n  * Enlargement of the testes, scrotum, and penis; production of sperm begins.\n  * Broadening of chest and shoulders; rapid muscle development.\n  * Occurrence of wet dreams (*nocturnal emissions*).\n\n- **Physical Changes in Girls:**\n  * Enlargement and development of breasts.\n  * Widening and rounding of hips and pelvis.\n  * Growth of underarm and pubic hair.\n  * Onset of menstruation (*monthly periods* / menarche).\n  * Increased subcutaneous fat deposits resulting in feminine curves.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Development',
          suggestions: ['What hygiene practices are important at puberty?', 'What is puberty?', 'What are the human reproductive parts?']
        };
      }

      if (asksHygiene && !asksChanges && !asksParts) {
        return {
          text: `### Personal Hygiene Practices at Puberty\n\n1. **Daily Bathing:** Bathing the entire body daily with clean water and mild soap, paying special attention to the armpits, groin, and genital areas to wash away sweat and prevent body odor.\n2. **Clean Underwear:** Wearing clean cotton underwear every day; washing and drying clothes thoroughly in sunlight.\n3. **Deodorants:** Using mild roll-on or deodorant to manage increased sweat production from developing sweat and apocrine glands.\n4. **Menstrual Hygiene for Girls:**\n   - Changing sanitary pads regularly every 4 to 6 hours.\n   - Wrapping used disposable pads securely in waste paper and discarding them in a pit latrine or incinerator bin (never flush them down flush toilets).\n   - Washing hands with soap and water before and after changing pads.\n5. **Importance:** Prevents bacterial and fungal infections, eliminates body odor, and boosts self-esteem and confidence.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Development',
          suggestions: ['What are the physical changes during puberty?', 'What is puberty?', 'What are the human reproductive parts?']
        };
      }

      if (asksParts) {
        return {
          text: `### Human Reproductive Parts and Functions\n\n- **Male Reproductive System:**\n  1. **Testes (Testicles):** Paired organs that produce sperm cells and the male hormone testosterone.\n  2. **Scrotum:** Pouch of skin holding testes outside the abdominal cavity to maintain a cooler temperature (2–3°C below body temperature) necessary for sperm production.\n  3. **Sperm Duct (Vas Deferens):** Muscular tube that carries sperm from the testes to the urethra.\n  4. **Urethra:** Tube running through the penis that conveys semen during ejaculation and urine during excretion.\n  5. **Penis:** External organ that deposits sperm into the female vagina during mating.\n\n- **Female Reproductive System:**\n  1. **Ovaries:** Paired organs that produce female ova (eggs) and hormones (oestrogen and progesterone).\n  2. **Fallopian Tubes (Oviducts):** Ciliated tubes where fertilization occurs; carries ovum to uterus.\n  3. **Uterus (Womb):** Pear-shaped muscular organ where the fertilized embryo implants and develops during the 9-month gestation period.\n  4. **Cervix:** The lower neck of the uterus connecting to the vagina.\n  5. **Vagina (Birth Canal):** Muscular passage that receives the penis during mating and through which a baby is born.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Biology',
          suggestions: ['What is puberty?', 'What are the physical changes during puberty?', 'What is the gestation period in humans?']
        };
      }

      return {
        text: `### Puberty and Human Reproductive System\n\n**Puberty** is the adolescent developmental stage when sex organs mature and secondary sexual characteristics appear under the influence of hormones.\n\n- **Changes in Boys:** Voice breaks, facial/pubic hair grows, sperm production begins, shoulders broaden.\n- **Changes in Girls:** Breasts enlarge, hips widen, pubic hair grows, menstruation starts.\n- **Hygiene:** Daily body washing, clean cotton underwear, changing sanitary pads every 4-6 hours.\n- **Gestation:** Human gestation lasts approximately **9 months (40 weeks / ~280 days)** in the mother's uterus.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Development',
        suggestions: ['What are the physical changes during puberty?', 'What hygiene practices should be observed at puberty?', 'What are the parts of the human reproductive system?']
      };
    }

    // 10. Food Safety, Safe Handling Practices & Foodborne Diseases
    if (
      q.includes('food safety') ||
      q.includes('food handling') ||
      q.includes('foodborne') ||
      q.includes('food borne') ||
      q.includes('food contamination') ||
      q.includes('food spoilage')
    ) {
      const asksFoodborne = q.includes('foodborne') || q.includes('food borne') || q.includes('food poisoning');

      if (asksFoodborne) {
        return {
          text: `### Foodborne Diseases\n\n**Foodborne diseases** (food poisoning) are illnesses contracted from eating food or drinking water contaminated with pathogenic microorganisms (bacteria, viruses, parasites) or toxic chemical substances.\n\n- **Signs and Symptoms:**\n  * Nausea and sudden violent vomiting.\n  * Severe abdominal stomach cramps and pain.\n  * Frequent watery or bloody diarrhea.\n  * Fever, chills, and headache.\n  * Dehydration, dry mouth, and weakness.\n\n- **Prevention and Control:**\n  1. Wash hands thoroughly with soap before preparing or eating food.\n  2. Drink clean, safe or boiled water.\n  3. Cook foods thoroughly (especially meat, poultry, and eggs) above 70°C.\n  4. Keep food covered to prevent contamination by flies and pests.\n  5. Avoid eating expired canned goods or food with foul odors or mold.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Food & Nutrition',
          suggestions: ['What is food safety and why is it important?', 'What are safe food handling practices?', 'How do you prepare sugar and salt solution?']
        };
      }

      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Food Safety\n\n**Food safety** refers to the scientific practices and hygiene routines observed during food handling, preparation, and storage to prevent food contamination, spoilage, and **foodborne diseases** (such as cholera, typhoid, and food poisoning).`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Food & Nutrition',
          suggestions: ['What is the importance of food safety?', 'What are safe food handling practices?', 'What are foodborne diseases?']
        };
      }

      return {
        text: `### Food Safety and Safe Handling Practices\n\n**Food safety** is the practice of handling, preparing, and storing food in ways that prevent foodborne illnesses.\n\n- **Importance of Food Safety:**\n  * Prevents deadly foodborne diseases (cholera, salmonella, food poisoning).\n  * Reduces household food spoilage and financial wastage.\n  * Preserves the nutritional value and fresh quality of food.\n\n- **Four Core Safe Food Handling Practices (The 4 Cs):**\n  1. **Cleaning:** Wash hands with soap and water before handling food and after visiting the toilet. Wash chopping boards, knives, and counters thoroughly.\n  2. **Cross-Contamination Prevention:** Keep raw meat, poultry, and fish separate from cooked food and fresh salads. Never use the same unwashed board or knife for raw meat and bread/vegetables.\n  3. **Cooking Thoroughly:** Cook foods to safe temperatures (above 70°C) to kill harmful bacteria. Reheat leftovers until steaming hot throughout.\n  4. **Chilling & Temperature Control:** Refrigerate perishable food promptly below 5°C. Never leave cooked food at room temperature for more than 2 hours; keep food covered to protect from houseflies.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Food & Nutrition',
        suggestions: ['What are foodborne diseases and their symptoms?', 'What is food safety?', 'What are the methods of food preservation?']
      };
    }

    // 11. Environmental Hygiene: Land Pollution & Environmental Waste
    if (
      q.includes('land pollution') ||
      q.includes('soil pollution') ||
      (q.includes('environmental waste') || (q.includes('waste') && (q.includes('disposal') || q.includes('community'))))
    ) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Land Pollution\n\n**Land pollution** is the contamination, destruction, and degradation of the Earth's land surfaces and soil caused by the dumping of solid or liquid waste, hazardous industrial chemicals, mining tailings, and non-biodegradable materials (like plastic bags).\n\n- **Environmental Waste:** Any discarded unwanted material generated by domestic homes, schools, businesses, or industries that can contaminate the surroundings.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the types and sources of land pollution?', 'What are the effects of land pollution?', 'What are the ways to reduce land pollution?']
        };
      }

      return {
        text: `### Land Pollution and Community Waste Disposal\n\n**Land pollution** is the degradation of the Earth's soil and land surfaces by improper waste disposal and chemicals.\n\n- **Sources of Environmental Waste in the Community:**\n  * **Domestic Waste:** Plastic carrier bags (*kaylite*), tin cans, broken glass, disposable diapers, and rotting food scraps thrown in open spaces.\n  * **Agricultural Chemicals:** Excessive chemical fertilizers, herbicides, and pesticides leaching into soil.\n  * **Mining Activities:** Artisanal gold panning (*chikorokoza*) residues, open-cast pits, and toxic chemicals (mercury and cyanide).\n  * **Industrial & Commercial Waste:** Discarded scrap metal, scrap tires, chemical sludge, and battery acids.\n\n- **Impact of Waste in the Community:**\n  * Destroys soil fertility and agricultural productivity.\n  * Creates breeding grounds for disease vectors (houseflies, mosquitoes, rats).\n  * Ingestion of plastic carrier bags chokes and kills grazing cattle, goats, and sheep.\n  * Leaches toxic chemicals into underground aquifers and drinking boreholes.\n\n- **Proper Waste Disposal Measures (The 3Rs):**\n  1. **Reduce:** Cut down on single-use plastics and packaging.\n  2. **Reuse:** Reuse glass containers, plastic buckets, and shopping bags.\n  3. **Recycle:** Collect scrap paper, plastics, and scrap metal for factory remanufacturing.\n  4. **Composting:** Digging compost pits to convert biodegradable vegetable and food waste into organic manure.\n  5. **Designated Landfills:** Disposing non-biodegradable waste in municipal designated bins and sanitary landfills.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
        suggestions: ['What are the 3Rs of waste management?', 'What are the effects of plastic waste on livestock?', 'What is water pollution?']
      };
    }

    // 12. Environmental Hygiene: Water Pollution & Waterborne Diseases
    if (
      q.includes('water pollution') ||
      q.includes('waterborne') ||
      q.includes('water-borne') ||
      q.includes('water disease')
    ) {
      if (decomp.asksOnlyDefinition && !q.includes('waterborne') && !q.includes('water-borne')) {
        return {
          text: `### Water Pollution\n\n**Water pollution** is the contamination of natural water bodies (rivers, dams, lakes, streams, and underground aquifers) with harmful chemicals, untreated sewage, or toxic waste, making the water hazardous for human consumption, agriculture, and aquatic life.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the causes of water pollution?', 'What are the effects of water pollution?', 'What are waterborne diseases?']
        };
      }

      return {
        text: `### Water Pollution & Waterborne Diseases\n\n**Water pollution** is the introduction of harmful substances into rivers, dams, and boreholes.\n\n- **Causes of Water Pollution:**\n  1. **Raw Untreated Sewage:** Burst sewer pipes discharging human excreta directly into rivers (e.g. Mukuvisi River feeding Lake Chivero in Harare).\n  2. **Industrial Effluent:** Factories discharging untreated acids, dyes, detergents, and heavy metals.\n  3. **Agricultural Runoff:** Rain washing synthetic fertilizers and chemical pesticides into dams, causing **eutrophication** (excessive algae blooms that suffocate fish).\n  4. **Mining Contamination:** Stream-bank cultivation causing river siltation, and toxic mercury or cyanide used in gold panning.\n\n- **Effects of Water Pollution:**\n  * Outbreaks of deadly waterborne epidemics (cholera, typhoid, bilharzia, dysentery).\n  * Death of aquatic fish and loss of biodiversity.\n  * Massive municipal water purification costs for urban cities.\n\n- **Common Waterborne Diseases:**\n  * **Cholera:** Caused by *Vibrio cholerae* bacteria in contaminated water/food; causes sudden painless watery ("rice-water") diarrhea and rapid fatal dehydration (treated with Sugar and Salt Solution, SSS).\n  * **Typhoid:** Caused by *Salmonella typhi*; causes high fever, severe headache, and abdominal pain.\n  * **Bilharzia (Schistosomiasis):** Caused by *Schistosoma* flatworm parasites hosted by freshwater aquatic snails; symptom is blood in urine (*haematuria*).\n\n- **Measures to Reduce Water Pollution:** Enforce Environmental Management Agency (EMA) fines on polluters; upgrade sewage treatment plants; ban stream-bank cultivation within 30 metres of river banks; boil or chlorinate all drinking water.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
        suggestions: ['How do you prepare sugar and salt solution?', 'What are the symptoms and causes of cholera?', 'What is bilharzia?']
      };
    }

    // 13. Environmental Hygiene: Air Pollution
    if (q.includes('air pollution')) {
      const asksCauses = decomp.asksCauses || q.includes('cause') || q.includes('source') || q.includes('pollutant');
      const asksEffects = decomp.asksEffects || q.includes('effect') || q.includes('respiratory') || q.includes('impact');
      const asksReduction = decomp.asksPreventionOrManagement || q.includes('reduc') || q.includes('control') || q.includes('prevent') || q.includes('measure');

      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Air Pollution\n\n**Air pollution** is the release of harmful substances, toxic gases, smoke, particulate matter, and chemicals into the Earth's atmosphere at concentrations that endanger human respiratory health, animal life, and the environment.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the causes of air pollution?', 'What are the effects of air pollution on the respiratory system?', 'How can air pollution be reduced?']
        };
      }

      if (asksCauses && !asksEffects && !asksReduction) {
        return {
          text: `### Causes and Pollutants of Air Pollution\n\n- **Causes / Sources:**\n  1. **Motor Vehicle Emissions:** Exhaust fumes from cars, buses, and haulage trucks burning petrol and diesel.\n  2. **Industrial Chimneys:** Thermal power stations (like Hwange) and factories burning coal and emitting thick black smoke.\n  3. **Domestic Firewood & Charcoal:** Open cooking fires and burning braziers (*mbaura*).\n  4. **Agricultural & Veld Fires:** Burning dry grass, crop stalks, and trash.\n\n- **Major Air Pollutants:**\n  * **Carbon Monoxide (CO):** Poisonous gas that displaces oxygen in the blood.\n  * **Sulfur Dioxide ($SO_2$) & Nitrogen Oxides ($NO_x$):** Cause respiratory irritation and acid rain.\n  * **Particulate Matter (Soot, Smoke & Dust):** Clogs respiratory airways.\n  * **Carbon Dioxide ($CO_2$):** Greenhouse gas driving climate change.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the effects of air pollution on the respiratory system?', 'How can air pollution be reduced?', 'What is air pollution?']
        };
      }

      if (asksEffects && !asksCauses && !asksReduction) {
        return {
          text: `### Effects of Air Pollution on the Human Respiratory System\n\n1. **Aggravates Asthma Attacks:** Inhaling smoke, soot, and chemical gases inflames sensitive bronchial airways, triggering acute asthma attacks.\n2. **Causes Chronic Bronchitis:** Constant irritation by airborne soot and sulfur dioxide leads to persistent coughing and excess mucus production in the bronchi.\n3. **Damages Cilia in Airways:** Smoke and toxic fumes paralyze and destroy the microscopic cilia lining the trachea, preventing the body from clearing dust and bacteria from the lungs.\n4. **Reduces Lung Capacity:** Fine particulate matter ($PM_{2.5}$) penetrates deep into lung alveoli, causing tissue scarring and emphysema.\n5. **Carbon Monoxide Poisoning:** Binds tightly with blood haemoglobin, depriving vital organs (brain and heart) of oxygen, which can cause asphyxiation and death in closed rooms (*mbaura*).\n6. **Environmental Impact:** Acid rain damages forests and aquatic life; greenhouse gases cause global warming.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
          suggestions: ['What are the causes of air pollution?', 'How can air pollution be reduced?', 'What are the parts of the respiratory system?']
        };
      }

      return {
        text: `### Air Pollution: Causes, Effects, and Solutions\n\n**Air pollution** is the contamination of the atmosphere by toxic gases, smoke, and particulate matter.\n\n- **Causes & Pollutants:** Exhaust emissions from vehicles, factory chimneys burning coal, veld fires, and unvented braziers. Pollutants include carbon monoxide, sulfur dioxide, nitrogen oxides, soot, and smoke.\n- **Effects on Respiratory System:** Inflames bronchial airways, triggers asthma attacks, causes bronchitis, clogs lung alveoli, and causes carbon monoxide asphyxiation.\n- **Measures to Reduce Air Pollution:**\n  1. Planting trees (afforestation) to absorb atmospheric carbon dioxide.\n  2. Transitioning to clean renewable energy (solar, wind, biogas) instead of burning coal and firewood.\n  3. Fitting vehicle exhausts with catalytic converters and maintaining vehicle engines.\n  4. Fitting industrial smokestacks with electrostatic precipitators and filters.\n  5. Enforcing Environmental Management Agency (EMA) emissions standards.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Environmental Health',
        suggestions: ['What are the effects of air pollution on the respiratory system?', 'What are the parts of the respiratory system?', 'What is the fire triangle?']
      };
    }

    // 14. Respiratory System
    if (
      q.includes('respiratory system') ||
      (q.includes('respiratory') && (q.includes('part') || q.includes('function') || q.includes('disease') || q.includes('lung') || q.includes('trachea') || q.includes('alveoli')))
    ) {
      const asksParts = q.includes('part') || q.includes('name') || q.includes('identify') || q.includes('label');
      const asksFunctions = decomp.asksFunctionsOrUses || q.includes('function');
      const asksDiseases = q.includes('disease') || q.includes('illness');

      if (decomp.asksOnlyDefinition && !asksParts && !asksFunctions && !asksDiseases) {
        return {
          text: `### The Respiratory System\n\nThe **respiratory system** is the biological organ system in humans and animals responsible for **gas exchange**—taking in life-giving oxygen ($O_2$) from the atmosphere during inhalation and expelling metabolic waste carbon dioxide ($CO_2$) and water vapor during exhalation.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Human Biology',
          suggestions: ['What are the parts of the respiratory system?', 'Explain the functions of parts of the respiratory system', 'What are respiratory diseases?']
        };
      }

      if (asksDiseases && !asksParts && !asksFunctions) {
        return {
          text: `### Respiratory Diseases\n\n1. **Asthma:** Chronic inflammatory condition causing temporary swelling, constriction of bronchial airways, and excess mucus production; triggered by dust, pollen, and cold air.\n2. **Tuberculosis (TB):** Highly contagious bacterial infection (*Mycobacterium tuberculosis*) that destroys lung tissue; symptoms include persistent coughing (>2 weeks), coughing blood, night sweats, and weight loss.\n3. **Pneumonia:** Acute infection of one or both lungs caused by bacteria or viruses; alveoli become filled with pus and fluid, causing fever, chills, and difficulty breathing.\n4. **Bronchitis:** Inflammation of the bronchial tube lining resulting in persistent coughing with thick discolored phlegm.\n5. **Influenza (Flu):** Viral infection causing sore throat, runny nose, body aches, and fever.\n6. **Lung Cancer:** Malignant tumor growth in lung tissue, predominantly caused by tobacco smoking.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Human Biology',
          suggestions: ['What are the parts of the respiratory system?', 'What are the effects of air pollution on the respiratory system?', 'What is the difference between respiration and breathing?']
        };
      }

      if (asksParts && !asksDiseases) {
        return {
          text: `### Parts of the Human Respiratory System and Their Functions\n\n1. **Nose and Nasal Cavity:** Lined with hairs and moist mucus to warm, moisten, and filter dust and bacteria from incoming air.\n2. **Pharynx (Throat):** Common passageway connecting the nasal cavity and mouth to the larynx.\n3. **Larynx (Voice Box):** Contains vocal cords that vibrate to produce speech; covered by the **epiglottis** during swallowing to prevent food from entering the windpipe.\n4. **Trachea (Windpipe):** Main airway tube reinforced with **C-shaped cartilage rings** to prevent collapse; lined with ciliated epithelial cells and mucus that sweep trapped dirt up toward the throat.\n5. **Bronchi (Left and Right Bronchus):** Two main branches of the trachea that direct air into the left and right lungs.\n6. **Bronchioles:** Narrow branching network of smaller tubes distributing air throughout lung lobes.\n7. **Alveoli (Air Sacs):** Millions of microscopic, thin-walled, moist air sacs surrounded by dense capillary networks where **gas exchange takes place** (oxygen diffuses into blood; carbon dioxide diffuses into alveoli).\n8. **Lungs:** The two spongy respiratory organs housed inside the chest cavity.\n9. **Diaphragm:** Large dome-shaped muscle at the floor of the chest that contracts and flattens during inhalation and relaxes during exhalation.\n10. **Intercostal Muscles:** Muscles between the ribs that move the ribcage up and out during breathing in.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Human Biology',
          suggestions: ['What are respiratory diseases?', 'What is the difference between respiration and breathing?', 'What are the effects of air pollution on the respiratory system?']
        };
      }

      return {
        text: `### The Human Respiratory System\n\nThe **respiratory system** facilitates gaseous exchange between the human body and the environment.\n\n- **Key Parts:** Nose, Trachea (windpipe with cartilage rings), Bronchi, Bronchioles, Alveoli (site of gas exchange), Lungs, Diaphragm, and Ribs.\n- **Functions:** Warms, moistens, and filters air; diffuses oxygen into blood; removes carbon dioxide waste.\n- **Common Diseases:** Asthma, Tuberculosis (TB), Bronchitis, Pneumonia, and Influenza.\n- **Breathing Mechanism:** Inhalation (diaphragm contracts and flattens, ribs move up/out, lung volume increases, air enters); Exhalation (diaphragm relaxes into dome, ribs move down/in, air is forced out).`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Human Biology',
        suggestions: ['What are the parts of the respiratory system?', 'What are respiratory diseases?', 'What are the effects of air pollution on the respiratory system?']
      };
    }

    // 15. Circulatory System
    if (
      q.includes('circulatory system') ||
      (q.includes('circulatory') && (q.includes('part') || q.includes('heart') || q.includes('blood') || q.includes('vessel'))) ||
      (q.includes('chambers of the heart') || (q.includes('arteries') && q.includes('veins')))
    ) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### The Circulatory System\n\nThe **circulatory system** (cardiovascular system) is the organ system responsible for transporting oxygen, digested food nutrients, hormones, antibodies, and metabolic waste products (like carbon dioxide and urea) throughout the body via blood pumped continuously by the heart.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Biology',
          suggestions: ['What are the parts of the circulatory system?', 'Explain the circulatory system and double circulation', 'What is the difference between arteries and veins?']
        };
      }

      return {
        text: `### The Circulatory System\n\n**The circulatory system** pumps and transports blood throughout the entire body.\n\n- **The Three Main Parts:**\n  1. **The Heart (Muscular Pump):**\n     * A 4-chambered muscular organ: **Right Atrium**, **Right Ventricle**, **Left Atrium**, **Left Ventricle**.\n     * The **Left Ventricle** has the thickest muscular wall because it pumps oxygenated blood under high pressure to the entire body through the aorta.\n  2. **Blood Vessels (Tubular Network):**\n     * **Arteries:** Carry oxygenated blood **AWAY** from the heart under high pressure (thick, elastic muscular walls; no valves; e.g. Aorta). *Exception: Pulmonary artery carries deoxygenated blood to lungs.*\n     * **Veins:** Carry deoxygenated blood **BACK TO** the heart under low pressure (thinner walls; contain **valves** to prevent backflow; e.g. Vena Cava). *Exception: Pulmonary vein carries oxygenated blood from lungs.*\n     * **Capillaries:** Microscopic, 1-cell thick blood vessels connecting arteries to veins; site of diffusion for oxygen, nutrients, and waste products.\n  3. **Blood (Transport Fluid):**\n     * **Red Blood Cells (Erythrocytes):** Disc-shaped, contain **haemoglobin** to transport oxygen.\n     * **White Blood Cells (Leukocytes):** Fight infections and destroy pathogens.\n     * **Platelets:** Fragments that enable blood clotting to prevent excessive bleeding from cuts.\n     * **Plasma:** Yellowish liquid transporting dissolved nutrients, hormones, and carbon dioxide.\n\n- **Double Circulation:** Blood passes through the heart **twice** during one complete circuit:\n  1. **Pulmonary Circulation:** Right Ventricle -> Pulmonary Artery -> Lungs (oxygenated) -> Pulmonary Vein -> Left Atrium.\n  2. **Systemic Circulation:** Left Ventricle -> Aorta -> Body organs & tissues -> Vena Cava -> Right Atrium.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Biology',
        suggestions: ['What is the difference between arteries and veins?', 'What are the parts of the respiratory system?', 'What are the functions of the liver and kidneys?']
      };
    }

    // 16. Digestive System
    if (
      q.includes('digestive system') ||
      (q.includes('digestive') && (q.includes('part') || q.includes('function') || q.includes('organ') || q.includes('mouth') || q.includes('stomach') || q.includes('peristalsis') || q.includes('villi')))
    ) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### The Digestive System\n\nThe **digestive system** is the organ system responsible for breaking down large, insoluble food molecules into small, soluble nutrient molecules that can be absorbed across the intestinal wall into the bloodstream to provide energy, tissue growth, and repair.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Biology',
          suggestions: ['What are the parts of the digestive system?', 'What are the functions of parts of the digestive system?', 'What are the four types of teeth?']
        };
      }

      return {
        text: `### Parts of the Digestive System and Their Functions\n\n1. **Mouth (Teeth & Tongue):**\n   - Mechanical digestion: Teeth cut, tear, and grind food into small pieces (*bolus*).\n   - Chemical digestion: Salivary glands secrete saliva containing **salivary amylase**, which breaks down cooked starch into maltose.\n2. **Esophagus (Gullet):**\n   - Transports food from the mouth to the stomach via **peristalsis** (rhythmic wave-like muscular contractions of the canal wall).\n3. **Stomach:**\n   - J-shaped muscular pouch that churns food into a liquid mixture (*chyme*).\n   - Secretes **hydrochloric acid** (kills bacteria) and **pepsin** enzyme (begins protein digestion).\n4. **Small Intestine (Duodenum and Ileum):**\n   - **Duodenum:** Receives **bile** from the liver (which emulsifies fats and neutralizes stomach acid) and pancreatic juice containing digestive enzymes.\n   - **Ileum:** Completes digestion and absorbs soluble nutrients into blood capillaries through millions of tiny, finger-like projections called **villi** (which provide a massive surface area).\n5. **Large Intestine (Colon):**\n   - Reabsorbs water, mineral salts, and vitamins from indigestible food matter, forming semi-solid feces.\n6. **Rectum:**\n   - Temporarily stores feces until defecation.\n7. **Anus:**\n   - Muscular sphincter ring through which feces are expelled (*egestion*).\n\n- **Accessory Organs:** **Liver** (produces bile), **Gallbladder** (stores bile), and **Pancreas** (secretes digestive enzymes and insulin).`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Human Biology',
        suggestions: ['What are the four types of teeth and their functions?', 'What is peristalsis?', 'What are the functions of the liver and kidneys?']
      };
    }

    // 17. Unhealthy Eating Habits, Eating Disorders & Physical Health
    if (
      q.includes('unhealthy eating') ||
      q.includes('eating disorder') ||
      q.includes('eating disorders') ||
      q.includes('anorexia') ||
      q.includes('bulimia') ||
      q.includes('physical health activities')
    ) {
      if (q.includes('eating disorder') || q.includes('anorexia') || q.includes('bulimia')) {
        return {
          text: `### Eating Disorders\n\n**Eating disorders** are serious mental and physical health conditions characterized by severe, persistent disturbances in eating behaviors, body image perception, and relationship with food.\n\n- **Common Types in the Syllabus:**\n  1. **Anorexia Nervosa:** An eating disorder characterized by self-starvation, severe food restriction, and an intense fear of gaining weight, leading to extreme emaciation, organ failure, and malnutrition.\n  2. **Bulimia Nervosa:** A cycle of binge eating (consuming abnormally large amounts of food in secret) followed by compensatory purging (forced vomiting, misusing laxatives, or excessive fasting).\n  3. **Binge Eating Disorder:** Repeated episodes of uncontrolled overeating without purging, leading to obesity, diabetes, and guilt.\n\n- **Consequences:** Severe malnutrition, stunted bone development, heart arrhythmias, tooth enamel erosion (from stomach acid during vomiting), and psychological distress.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Health & Nutrition',
          suggestions: ['What are unhealthy eating habits?', 'What are the benefits of physical health activities?', 'What is a balanced diet?']
        };
      }

      return {
        text: `### Unhealthy Eating Habits and Physical Health\n\n- **Unhealthy Eating Habits:**\n  * Skipping essential meals (especially breakfast).\n  * Consuming excessive junk food, refined sugar, and sugary fizzy sodas.\n  * Eating excessive table salt, deep-fried snacks, and saturated fats.\n  * Inadequate intake of dietary fiber (roughage), vegetables, and clean water.\n\n- **Consequences of Unhealthy Eating:**\n  * Malnutrition (deficiency diseases like scurvy, rickets, kwashiorkor).\n  * Childhood obesity, chronic fatigue, and poor academic concentration.\n  * Dental cavities and early risk of hypertension and Type 2 diabetes.\n\n- **Physical Health Activities and Their Importance:**\n  * **Activities:** Daily brisk walking, running, rope skipping, playing football, swimming, netball, and traditional indigenous games (pada, nhodo).\n  * **Importance:** Strengthens heart and lung endurance; builds strong bones and muscles; helps burn excess calories to maintain healthy weight; improves mental wellness and sleep quality.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Health & Nutrition',
        suggestions: ['What are eating disorders?', 'What is a balanced diet?', 'What are the components of physical fitness?']
      };
    }

    // 18. Chronic Diseases & Epidemic Diseases
    if (
      q.includes('chronic disease') ||
      q.includes('chronic diseases') ||
      q.includes('epidemic disease') ||
      q.includes('epidemic diseases') ||
      q.includes('diabetes') ||
      q.includes('hypertension') ||
      q.includes('asthma')
    ) {
      if (q.includes('epidemic')) {
        return {
          text: `### Epidemic Diseases\n\n**Epidemic diseases** are infectious illnesses that spread rapidly and affect a large number of people within a community, region, or country over a short period of time.\n\n- **Major Examples in Zimbabwe:**\n  1. **Cholera:** Waterborne bacterial epidemic caused by *Vibrio cholerae*; spreads via contaminated municipal water and unhygienic food.\n  2. **Typhoid Fever:** Bacterial epidemic spread through contaminated water and unwashed food.\n  3. **Measles:** Highly contagious airborne viral infection causing fever and skin rash in unvaccinated children.\n  4. **COVID-19 / Influenza:** Airborne respiratory viral epidemics spreading through breathing droplets.\n\n- **Causes:** Poor municipal sewage disposal, drinking untreated water, overcrowding, unhygienic food handling, and low immunization coverage.\n\n- **Prevention & Control:** Boiling or chlorinating all drinking water; practicing thorough handwashing with soap; isolating infected patients; vaccinating children; and maintaining proper sanitation (VIP latrines).`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 1: Health & Hygiene',
          suggestions: ['What are chronic diseases?', 'What is sugar and salt solution?', 'What are the 6 child-killer diseases?']
        };
      }

      if (q.includes('diabetes')) {
        return {
          text: `### Diabetes Mellitus\n\n**Diabetes Mellitus** is a chronic non-communicable metabolic disorder where the pancreas fails to produce enough **insulin** (or body cells cannot use insulin), resulting in dangerously high levels of glucose (sugar) in the bloodstream.\n\n- **Symptoms:** Excessive unquenchable thirst, frequent urination (especially at night), extreme hunger, unexplained weight loss, constant fatigue, and slow-healing sores.\n\n- **Management:** Eating traditional unrefined whole grains (sorghum, rapoko, finger millet) rather than refined sugars; regular daily aerobic exercise; routine blood glucose monitoring; and prescribed oral medication or insulin injections.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Chronic Diseases',
          suggestions: ['What is hypertension?', 'What are chronic diseases?', 'What is asthma?']
        };
      }

      if (q.includes('hypertension') || q.includes('high blood pressure')) {
        return {
          text: `### Hypertension (High Blood Pressure)\n\n**Hypertension** is a chronic medical condition where the circulating blood exerts persistently abnormally high pressure against the walls of the arteries (consistently above 140/90 mmHg). It is known as the **"silent killer"** because it rarely shows early warning symptoms.\n\n- **Causes & Risk Factors:** Excessive dietary salt intake, lack of physical exercise, obesity, chronic stress, smoking, alcohol abuse, and genetic family history.\n\n- **Complications:** If left unmanaged, hypertension damages blood vessels and causes heart attacks, strokes, and kidney failure.\n\n- **Prevention & Management:** Minimizing salt and salty snacks; eating fresh fruits and vegetables; exercising for at least 30 minutes daily; maintaining healthy body weight; and taking prescribed anti-hypertensive medication.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Chronic Diseases',
          suggestions: ['Why is hypertension called the silent killer?', 'What is diabetes?', 'What are chronic diseases?']
        };
      }

      return {
        text: `### Chronic Diseases\n\n**Chronic diseases** are long-term, non-communicable medical conditions that develop gradually over time, persist for months or an entire lifetime, cannot be spread from person to person, and require ongoing medical care and healthy lifestyle management.\n\n- **Major Types in Zimbabwe:**\n  1. **Hypertension (High Blood Pressure):** Excessive pressure in arteries; can lead to strokes and heart attacks.\n  2. **Diabetes Mellitus:** Pancreatic insulin deficiency causing elevated blood sugar.\n  3. **Asthma:** Chronic inflammation and narrowing of the bronchial airways with wheezing and shortness of breath.\n  4. **Cancer:** Uncontrolled division of abnormal cells forming tumors (e.g. cervical cancer).\n  5. **Sickle Cell Disease:** Inherited genetic blood disorder causing crescent-shaped red blood cells.\n\n- **Causes & Risk Factors:** Unhealthy diets high in refined sugars and salts, lack of physical activity, smoking, alcohol abuse, environmental pollution, and genetics.\n\n- **Prevention and Management:** Eating heritage unrefined small grains (mhunga, rapoko) and fresh vegetables; exercising daily; reducing salt intake; avoiding smoking/alcohol; and following medical prescriptions.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Chronic Diseases',
        suggestions: ['What is diabetes?', 'What is hypertension?', 'What are epidemic diseases?']
      };
    }

    // 19. Food and Nutrition: Nutrients, Balanced Diet, Deficiency & Excess, Preservation
    if (
      q.includes('balanced diet') ||
      q.includes('food nutrient') ||
      q.includes('food nutrients') ||
      q.includes('deficiency disease') ||
      q.includes('deficiency diseases') ||
      q.includes('kwashiorkor') ||
      q.includes('marasmus') ||
      q.includes('scurvy') ||
      q.includes('rickets') ||
      q.includes('goitre') ||
      q.includes('food preservation') ||
      q.includes('food preservation methods') ||
      q.includes('meal planning') ||
      q.includes('budgeting')
    ) {
      if (q.includes('kwashiorkor')) {
        return {
          text: `### Kwashiorkor\n\n**Kwashiorkor** is a severe nutritional deficiency disease in young children caused by a severe **lack of protein** in their diet, even when they consume sufficient carbohydrate energy.\n\n- **Key Signs & Symptoms:**\n  * **Oedema (Swollen Belly & Puffy Feet):** Water retention causing swelling in the abdomen, lower legs, and face.\n  * **Hair Discolouration:** Hair becomes thin, brittle, yellowish or reddish-brown, and plucks out easily without pain.\n  * **Skin Changes:** Dark, peeling or flaky skin patches (*flaky paint dermatitis*).\n  * **Behavioral:** Child becomes miserable, apathetic, irritable, and refuses to eat.\n\n- **Prevention & Treatment:** Provide protein-rich meals: milk, eggs, beans, fish, kapenta (*matemba*), groundnuts (*nzungu*), and peanut butter porridge (*nhopi / bota rine dovi*).`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 2: Food & Nutrition',
          suggestions: ['What is marasmus?', 'What is the difference between kwashiorkor and marasmus?', 'What are the food nutrients?']
        };
      }

      if (q.includes('marasmus')) {
        return {
          text: `### Marasmus\n\n**Marasmus** is a severe form of malnutrition caused by a **total deficiency of all food nutrients and energy (total starvation)**.\n\n- **Key Signs & Symptoms:**\n  * **Severe Muscle Wasting:** Extreme loss of fat and muscle tissue; ribs and bones are clearly visible under the skin ("skin and bone").\n  * **Old Person's Face:** Loose, wrinkled facial skin giving the child the appearance of a tiny elderly person.\n  * **Alert & Voraciously Hungry:** Unlike kwashiorkor, the child remains alert, watchful, and intensely hungry.\n  * **Persistent Diarrhea and Dehydration.**\n\n- **Prevention & Management:** Gradual reintroduction of energy-dense, balanced meals with proteins, healthy fats, carbohydrates, and clean rehydration fluids.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 2: Food & Nutrition',
          suggestions: ['What is kwashiorkor?', 'What is the difference between kwashiorkor and marasmus?', 'What are the food nutrients?']
        };
      }

      if (q.includes('food preservation') || q.includes('food storage') || q.includes('preserve food')) {
        return {
          text: `### Food Preservation Methods\n\n**Food preservation** is the process of treating and handling food to stop or slow down spoilage caused by microorganisms (bacteria and fungi) and enzymes, while maintaining nutritional value.\n\n- **Why Food is Preserved:** Prevents food wastage, ensures food security during winter and dry seasons, and prevents foodborne illnesses.\n\n- **Traditional Methods in Zimbabwe:**\n  1. **Sun Drying:** Dehydrating leafy vegetables into dried greens (*mufushwa*) and sliced fresh meat into dried strips (*chimukuyu / biltong*). Moisture removal prevents bacterial growth.\n  2. **Smoking:** Hanging fish and meat over wood smoke; heat dries the food while smoke deposits antimicrobial chemicals.\n  3. **Salting:** Coarse salt draws water out of bacterial and food cells via **osmosis**, dehydrating and killing bacteria.\n  4. **Granaries (*Dura / Isiphala*):** Raised wooden storage huts treated with wood ash to store harvested maize, sorghum, and millet free from weevils.\n\n- **Modern Preservation Methods:** Refrigeration & freezing, canning in airtight tins, and pasteurization of milk.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 2: Food & Nutrition',
          suggestions: ['How does salting preserve meat using osmosis?', 'What are the food nutrients?', 'What is a balanced diet?']
        };
      }

      if (q.includes('budgeting') || q.includes('meal planning')) {
        return {
          text: `### Meal Planning and Budgeting\n\n- **What is Budgeting?** **Budgeting** is the process of creating a planned financial estimate of household income and allocating it wisely across food, shelter, school fees, and savings to avoid overspending and ensure financial stability.\n\n- **Benefits of Meal Planning:**\n  * Ensures family meals are nutritionally balanced (including energy-giving, body-building, and protective foods).\n  * Saves money by buying seasonal and local indigenous ingredients in bulk.\n  * Reduces household food waste and saves daily cooking time.\n\n- **Sample Balanced Indigenous Family Meal Plan:**\n  * Sadza rezviyo / mapfunde (unrefined finger millet / sorghum carbohydrates).\n  * Mufushwa une dovi (dried indigenous greens in peanut butter: vitamins, minerals, and healthy fats).\n  * Roadrunner chicken or stewed beans (lean proteins).\n  * Fresh indigenous fruit: *mazhanje* or *matohwe* (vitamin C and dietary roughage).`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Food & Nutrition',
          suggestions: ['What is a balanced diet?', 'What are the 6 food nutrients?', 'What are traditional food preservation methods?']
        };
      }

      // Default Food Nutrients & Balanced Diet
      return {
        text: `### Food Nutrients, Balanced Diet & Deficiency Diseases\n\n- **What is a Balanced Diet?** A **balanced diet** contains all essential nutrients—carbohydrates, proteins, fats, vitamins, minerals, dietary fibre (roughage), and clean water—in the correct proportions required for energy, growth, tissue repair, and immunity.\n\n- **The Six Core Food Nutrients:**\n  1. **Carbohydrates:** Provide daily energy (sadza, bread, rice, potatoes, sweet potatoes, small grains).\n  2. **Proteins:** Body-building, growth, and tissue repair (beans, meat, fish, eggs, milk, roundnuts / nyimo).\n  3. **Fats & Oils:** Concentrated energy and thermal insulation (cooking oil, butter, groundnuts, avocado).\n  4. **Vitamins:** Immune defense and health (Vitamin A for eyes in carrots; Vitamin C for gums in oranges; Vitamin D for bones in sunlight/milk).\n  5. **Minerals:** Calcium (strong bones/teeth in milk/fish); Iron (haemoglobin for blood in liver/greens); Iodine (prevents goitre in iodized salt).\n  6. **Dietary Fiber (Roughage) & Clean Water:** Prevents constipation and assists peristalsis.\n\n- **Nutritional Deficiency Diseases:**\n  * **Kwashiorkor:** Protein deficiency; swollen belly (oedema), thin reddish hair.\n  * **Marasmus:** Total starvation / calorie-protein lack; severe muscle wasting ("skin & bone").\n  * **Scurvy:** Vitamin C deficiency; bleeding, swollen gums and loose teeth.\n  * **Rickets:** Vitamin D or Calcium deficiency; soft bones, bowed legs.\n  * **Goitre:** Iodine deficiency; swollen thyroid gland in the neck.\n- **Nutrient Excess:** Excess sugar and fat cause obesity and Type 2 diabetes; excess salt causes hypertension.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 2: Food & Nutrition',
        suggestions: ['What is kwashiorkor?', 'What is marasmus?', 'What are the methods of food preservation?']
      };
    }

    // 20. Photosynthesis & Seed Germination
    if (
      q.includes('photosynthesis') ||
      q.includes('germination') ||
      q.includes('germinate') ||
      q.includes('test a leaf for starch') ||
      q.includes('starch test')
    ) {
      if (q.includes('germination') || q.includes('germinate')) {
        return {
          text: `### Seed Germination\n\n**Germination** is the process by which a dormant viable seed resumes active growth and develops into a young seedling when exposed to favorable environmental conditions.\n\n- **Three Essential Conditions for Germination (The "WOW" Rule):**\n  1. **Water (Moisture):** Softens the tough outer seed coat (*testa*) and activates dormant enzymes to break down stored food in cotyledons.\n  2. **Oxygen:** Essential for **aerobic respiration** to release energy for cell division and growth of the embryo.\n  3. **Warmth (Suitable Temperature, 20°C–30°C):** Activates metabolic enzymes.\n  *(Note: Soil and sunlight are **not** needed for seed germination; seeds germinate readily on moist cotton wool in darkness).*\n\n- **Stages of Germination:**\n  1. **Imbibition:** The seed absorbs water through the micropyle, swells, and the testa bursts open.\n  2. **Radicle Emergence:** The embryonic root (**radicle**) grows downward into the soil to absorb water and anchor the seedling.\n  3. **Plumule Emergence:** The embryonic shoot (**plumule**) grows upward towards light to develop green foliage leaves.\n  4. **Photosynthesis Begins:** The seedling produces its own food as cotyledon reserves are exhausted.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Crops, Plants & Animals',
          suggestions: ['What is photosynthesis?', 'What three conditions are necessary for seed germination?', 'How do you test a leaf for starch?']
        };
      }

      // Photosynthesis
      return {
        text: `### Photosynthesis and Testing a Leaf for Starch\n\n**Photosynthesis** is the biological process by which green plants manufacture their own food (**glucose**) from carbon dioxide and water using radiant solar energy trapped by **chlorophyll**, releasing oxygen as a byproduct.\n\n- **Word Equation:**\n  $$\\text{Carbon Dioxide} + \\text{Water} \\xrightarrow{\\text{Sunlight, Chlorophyll}} \\text{Glucose} + \\text{Oxygen}$$\n- **Chemical Equation:**\n  $$6CO_2 + 6H_2O \\xrightarrow{\\text{Sunlight, Chlorophyll}} C_6H_{12}O_6 + 6O_2$$\n\n- **Four Factors Necessary for Photosynthesis:**\n  1. **Chlorophyll:** Green pigment in chloroplasts that absorbs light energy.\n  2. **Sunlight:** Provides radiant energy to split water molecules.\n  3. **Carbon Dioxide ($CO_2$):** Diffuses into leaves from air through tiny pores called **stomata**.\n  4. **Water ($H_2O$):** Absorbed from soil by root hair cells and carried up through xylem vessels.\n\n- **Step-by-Step Procedure: Testing a Leaf for Starch:**\n  1. **Boil leaf in water for 2 minutes:** Kills leaf cells and stops all chemical reactions.\n  2. **Boil leaf in ethanol (alcohol) using a water bath:** Dissolves and removes green chlorophyll (leaf turns white). *Safety: Never heat ethanol over an open flame as it is highly flammable!*\n  3. **Dip leaf in warm water:** Softens the brittle leaf.\n  4. **Spread leaf on a white tile and add Iodine solution drops:**\n     * If starch is present: Leaf turns **blue-black**.\n     * If starch is absent: Iodine solution stays **yellowish-brown**.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Crops, Plants & Animals',
        suggestions: ['What three conditions are necessary for seed germination?', 'What is the word equation for photosynthesis?', 'Why is ethanol boiled in a water bath?']
      };
    }

    // 21. Crops, Plant & Animal Nutrients, Uses & Predator-Prey
    if (
      q.includes('predator-prey') ||
      q.includes('predator prey') ||
      q.includes('food pyramid') ||
      q.includes('plant nutrient deficiency') ||
      q.includes('uses of plants') ||
      q.includes('uses of animals') ||
      (q.includes('plant') && q.includes('nutrient') && q.includes('deficiency'))
    ) {
      if (q.includes('predator') || q.includes('pyramid')) {
        return {
          text: `### Predator-Prey Relationships and Food Pyramids\n\n- **Predator:** An animal that actively hunts, kills, and feeds on other animals (e.g. lion, leopard, eagle, hawk).\n- **Prey:** An animal that is hunted and eaten by a predator (e.g. zebra, impala, mouse, hare).\n- **Balance of Nature:** Predators control prey numbers, preventing herbivores from overgrazing pastures and causing land degradation; prey availability regulates predator populations.\n\n- **The Ecological Food Pyramid (Trophic Levels):**\n  1. **Producers (Base - Level 1):** Green plants (grass, trees) that manufacture food via photosynthesis. Holds the **largest total biomass and energy**.\n  2. **Primary Consumers (Level 2):** Herbivores that eat plants (cattle, impalas, grasshoppers).\n  3. **Secondary Consumers (Level 3):** Carnivores and insectivores eating primary consumers (jackals, frogs).\n  4. **Tertiary Consumers (Apex - Level 4):** Top carnivores at the peak with the smallest biomass (lions, eagles).\n- **The 10% Energy Rule:** Only approximately **10%** of energy transfers from one trophic level to the next; 90% is lost through heat, respiration, and movement.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Ecosystems & Ecology',
          suggestions: ['What is photosynthesis?', 'What are the uses of plants and animals?', 'What are plant nutrient deficiencies?']
        };
      }

      if (q.includes('deficiency')) {
        return {
          text: `### Plant Nutrient Deficiencies\n\nPlants require three primary macronutrients (NPK) absorbed from the soil:\n\n1. **Nitrogen (N):**\n   - **Role:** Leaf growth, vegetative development, and chlorophyll synthesis.\n   - **Deficiency Signs:** Stunted growth; older lower leaves turn pale yellow (**chlorosis**).\n2. **Phosphorus (P):**\n   - **Role:** Root establishment, early growth, flowering, and seed production.\n   - **Deficiency Signs:** Poor root development; dull bluish-green leaves with purple or reddish tints.\n3. **Potassium (K):**\n   - **Role:** Disease resistance, water regulation, and fruit development.\n   - **Deficiency Signs:** Scorched, burnt brown leaf edges and curled leaf margins.\n\n- **Ways to Curb Plant Nutrient Deficiencies:** Applying organic cattle manure and compost; practicing crop rotation with legumes (beans, groundnuts that fix nitrogen); applying synthetic fertilizers (Compound D for basal roots; Ammonium Nitrate / AN for top dressing).`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Crops & Agriculture',
          suggestions: ['What are the specifications of a Pfumvudza plot?', 'What are the three essential conditions for seed germination?', 'What is soil erosion?']
        };
      }

      return {
        text: `### Uses of Plants and Animals\n\n- **Uses of Plants:**\n  1. **Food & Nutrition:** Grains (maize, sorghum), legumes (beans, roundnuts), fruits, and vegetables.\n  2. **Medicine & Health:** Traditional herbs (*muringa, mubvamaropa, gavakava / aloe vera*) used for healing ailments.\n  3. **Shelter & Construction:** Timber for roofing poles, grass for thatching huts, timber for furniture.\n  4. **Ecological:** Plants generate oxygen, prevent soil erosion with roots, and act as windbreaks.\n\n- **Uses of Animals:**\n  1. **Food & Nutrition:** Meat (beef, goat, poultry), fresh milk, eggs, honey.\n  2. **Clothing & Textiles:** Cowhide leather for shoes/belts, sheep wool for jerseys and blankets.\n  3. **Draught Power & Transport:** Oxen and donkeys used for ploughing crop fields and pulling scotch-carts.\n  4. **Companionship & Security:** Dogs for guarding homesteads and hunting; cats for controlling rodent pests.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Crops, Plants & Animals',
        suggestions: ['What is photosynthesis?', 'What are plant nutrient deficiencies?', 'What is seed germination?']
      };
    }

    // 22. Pfumvudza / Intwasa Conservation Agriculture & Soils
    if (
      q.includes('pfumvudza') ||
      q.includes('intwasa') ||
      q.includes('planting basin') ||
      q.includes('conservation agriculture') ||
      q.includes('soil erosion') ||
      q.includes('soil type')
    ) {
      if (q.includes('erosion')) {
        return {
          text: `### Soil Erosion and Conservation\n\n**Soil erosion** is the detachment and washing or blowing away of fertile topsoil by water or wind.\n\n- **Types of Water Erosion:**\n  1. **Splash Erosion:** Raindrops batter bare soil, dislodging fine soil particles.\n  2. **Sheet Erosion:** Surface runoff removes a thin, uniform top layer of fertile soil across an entire field.\n  3. **Rill Erosion:** Small, shallow finger-like rivulets carved into sloping soil by running water.\n  4. **Gully Erosion:** Deep, wide steep-sided ravines (*makoronga*) carved by violent torrents of water.\n\n- **Methods of Controlling Soil Erosion:**\n  * Constructing contour ridges and storm drains to safely divert runoff.\n  * Mulching bare ground with crop stover (as in Pfumvudza).\n  * Planting vetiver grass along slopes and practicing terracing.\n  * Planting trees (afforestation and reforestation).\n  * Practicing crop rotation and avoiding overgrazing in communal pastures.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Agriculture & Soil',
          suggestions: ['What are the specifications of a Pfumvudza plot?', 'What are the three main types of soil?', 'What is weathering?']
        };
      }

      return {
        text: `### Pfumvudza / Intwasa Climate-Proofed Agriculture\n\n**Pfumvudza / Intwasa** is Zimbabwe's national climate-smart conservation agriculture concept designed to maximize crop yields per unit area through precise moisture conservation.\n\n- **The Three Core Principles:**\n  1. **Minimum Soil Disturbance:** Tillage is restricted strictly to digging small planting basins, leaving inter-row soil structure undisturbed.\n  2. **Permanent Soil Cover (Mulching):** Covering the field with crop residue, dry grass, or stover to conserve soil moisture, suppress weed growth, and reduce soil temperatures.\n  3. **Crop Rotation:** Alternating cereal grains (maize, sorghum) with leguminous crops (beans, groundnuts, cowpeas) to replenish nitrogen and break pest cycles.\n\n- **Standard Plot Specifications (ZIMSEC Exam Standards):**\n  * **Plot Dimensions:** **39 metres × 16 metres** (Total area = **624 m²** = 1/16th of a hectare).\n  * **Basin Layout:** **28 rows** spaced **75 cm apart**.\n  * **Basins per Row:** **52 planting basins** spaced **60 cm apart**.\n  * **Total Basins per Standard Plot:** **1 456 basins** ($28 \\times 52$).\n  * **Basin Measurements:** Length: **15 cm**, Width: **15 cm**, Depth: **15 cm**.\n  * **Plant Population:** 3 seeds planted per basin, thinned to **2 plants per basin** (Total = 2 912 maize plants per plot yielding 1 tonne of grain).`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 3: Agriculture',
        suggestions: ['What are the three core principles of Pfumvudza?', 'How do you control soil erosion?', 'What are the three main types of soil?']
      };
    }

    // 23. Weathering of Rocks & Soil Profile
    if (
      q.includes('weathering') ||
      q.includes('soil profile') ||
      q.includes('soil horizons')
    ) {
      if (q.includes('soil profile') || q.includes('horizon')) {
        return {
          text: `### The Soil Profile\n\nA **soil profile** is a vertical cross-section of soil from the surface down to the underlying parent bedrock, displaying distinct horizontal layers called **horizons**:\n\n- **Horizon O (Organic Layer):** Fresh and decaying plant litter, dry leaves, and dark rich humus.\n- **Horizon A (Topsoil):** The darkest, most fertile mineral layer; rich in humus, earthworms, plant roots, and beneficial microorganisms. Seed germination and nutrient uptake occur here.\n- **Horizon B (Subsoil):** Compact, lighter-colored layer rich in clay and minerals leached down from topsoil; poorer aeration.\n- **Horizon C (Weathered Parent Rock):** Broken, fractured rock pieces with no organic content; transition between bedrock and soil.\n- **Horizon R (Solid Bedrock):** Unweathered, solid parent rock forming the base.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 4: Environment',
          suggestions: ['What is weathering of rocks?', 'What is the difference between weathering and erosion?', 'What are the three types of soil?']
        };
      }

      return {
        text: `### Weathering of Rocks\n\n**Weathering** is the breaking down, crumbling, and chemical decomposition of rocks *in situ* (in their original place on the Earth's surface) without transport by water, wind, or ice.\n\n- **The Three Main Types of Weathering:**\n  1. **Physical (Mechanical) Weathering:** Rocks disintegrate without altering their chemical composition:\n     * **Exfoliation (Onion-skin peeling):** Daytime sun heats and expands rock outer layers; cold nights contract them. Outer curved shells peel off (seen on granite kopjes at Domboshava and Matobo Hills).\n     * **Freeze-Thaw (Frost Action):** Water in rock cracks freezes below 0°C, expands by 9%, and wedges fissures wider until rocks split.\n  2. **Chemical Weathering:** Rock minerals react chemically with water and air:\n     * **Carbonation:** Rainwater dissolves atmospheric $CO_2$ forming weak carbonic acid, which dissolves limestone (forming Chinhoyi Caves).\n     * **Oxidation (Rusting):** Oxygen in air/water reacts with iron in rocks, turning them crumbly and reddish-brown.\n  3. **Biological Weathering:** Breakdown caused by living organisms:\n     * **Tree Roots:** Roots grow into rock crevices, exerting outward wedge pressure that splits boulders.\n     * **Burrowing Animals & Lichens:** Termites and moles loosen soil; lichens release acids that etch rock surfaces.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Topic 4: Environment',
        suggestions: ['What is the difference between weathering and erosion?', 'What are the horizons of a soil profile?', 'What are the types of soil?']
      };
    }

    // 24. Weather Instruments & Water Cycle
    if (
      q.includes('weather instrument') ||
      q.includes('rain gauge') ||
      q.includes('anemometer') ||
      q.includes('wind vane') ||
      q.includes('barometer') ||
      q.includes('hygrometer') ||
      q.includes('stevenson screen') ||
      q.includes('water cycle')
    ) {
      if (q.includes('water cycle')) {
        return {
          text: `### The Water Cycle (Hydrological Cycle)\n\nThe **water cycle** is the continuous movement of water from the Earth's surface into the atmosphere and back through physical phase changes:\n\n1. **Evaporation:** The sun heats surface water in oceans, lakes, and rivers, transforming liquid water into invisible **water vapor** that rises into the atmosphere.\n2. **Transpiration:** Plant leaves release water vapor into the air through microscopic leaf pores called **stomata**.\n3. **Condensation:** Rising water vapor cools down at higher altitudes, condensing into tiny liquid water droplets around dust particles to form **clouds**.\n4. **Precipitation:** As cloud droplets merge and grow too heavy to remain suspended in air, they fall back to the ground as **rain, drizzle, hail, or snow**.\n5. **Percolation & Infiltration:** Rainwater soaks into the ground to recharge groundwater aquifers and boreholes, while excess water forms surface runoff returning to rivers and dams.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Weather & Climate',
          suggestions: ['What are the weather instruments and their functions?', 'What is a rain gauge?', 'What is a Stevenson Screen?']
        };
      }

      return {
        text: `### Weather Instruments and Their Functions\n\n1. **Rain Gauge:** Measures rainfall in **millimetres (mm)**. Sited in an open space twice the distance from tall trees/buildings, with its rim **30 cm above ground** to prevent splash-in.\n2. **Six's Maximum & Minimum Thermometer:** Records the highest daytime and lowest nighttime temperatures in **degrees Celsius (°C)**. Housed in a **Stevenson Screen** (a white, double-louvered wooden box raised 1.2m above ground to allow shade and free air circulation).\n3. **Wind Vane:** Shows **wind direction**; the arrow points in the direction the wind is blowing **FROM**.\n4. **Anemometer:** Measures **wind speed** in **kilometres per hour (km/h)** or knots using revolving hemispherical cups.\n5. **Barometer:** Measures **atmospheric pressure** in millibars (mb) or hectopascals (hPa). Rapidly falling pressure warns of an approaching storm.\n6. **Hygrometer (Wet & Dry Bulb Thermometer):** Measures **relative humidity** (the amount of water vapor in the air as a percentage).`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Weather & Climate',
        suggestions: ['What is the water cycle?', 'Why is a Stevenson Screen painted white?', 'What does an anemometer measure?']
      };
    }

    // 25. Energy, Sound Energy, Transformations & Fuels
    if (
      q.includes('sound energy') ||
      q.includes('energy conversion') ||
      q.includes('energy transformation') ||
      q.includes('pitch and loudness') ||
      q.includes('vacuum') ||
      q.includes('impact of fuel') ||
      q.includes('impacts of fuels') ||
      q.includes('carbon monoxide')
    ) {
      if (q.includes('carbon monoxide') || q.includes('mbaura') || q.includes('fuel')) {
        return {
          text: `### Environmental and Health Impacts of Fuels\n\n- **Carbon Monoxide (CO) Poisoning:** Burning coal, charcoal, or firewood in enclosed rooms (*mbaura*) with closed windows releases odorless, colorless **carbon monoxide gas**. CO binds irreversibly with blood haemoglobin, blocking oxygen transport to the brain and causing death by asphyxiation.\n- **Acid Rain:** Burning coal in thermal power stations (Hwange) releases sulfur dioxide ($SO_2$) and nitrogen oxides, which dissolve in rain clouds to form sulfuric and nitric acids that damage forests and kill fish in rivers.\n- **Deforestation:** Cutting down trees for firewood and tobacco curing accelerates soil erosion and destroys natural habitats.\n- **Global Warming:** Carbon dioxide emissions trap solar heat in the atmosphere, driving droughts and violent cyclones.\n- **Clean Green Solutions:** Rooftop solar energy, rural biogas digesters using cow dung, and fuel-efficient wood stoves (*tsotso stoves*).`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Energy & Fuels',
          suggestions: ['Why is sleeping with a burning brazier (mbaura) dangerous?', 'How does sound travel?', 'What is the law of conservation of energy?']
        };
      }

      return {
        text: `### Sound Energy & Energy Transformations\n\n- **Sound Energy Fundamentals:**\n  * Sound is produced by **vibrating objects** (e.g. vocal cords, plucked guitar strings, struck drum skin).\n  * Sound travels as longitudinal compression waves through material media (solids, liquids, and gases).\n  * **The Vacuum Rule:** Sound **CANNOT travel through a vacuum** (empty space) because there are no molecules to vibrate and transmit energy.\n  * **Speed of Sound:** Fastest in solids (~5 000 m/s in steel), medium in liquids (~1 500 m/s in water), slowest in air (~330–340 m/s).\n  * **Pitch vs Loudness:** **Pitch** depends on **frequency** (vibrations per second, in Hertz; high frequency = high pitch); **Loudness** depends on **amplitude** (vibration wave height).\n  * **Echo:** A reflected sound wave bouncing off a hard flat surface at least **17 metres away**.\n\n- **Law of Conservation of Energy:** Energy cannot be created or destroyed; it only transforms from one form to another:\n  * **Solar Panel:** Light energy -> Electrical energy.\n  * **Kariba Hydroelectric Dam:** Potential energy of dam water -> Kinetic energy of falling water -> Mechanical energy of turbines -> Electrical energy.\n  * **Torch:** Chemical energy (battery) -> Electrical energy -> Light and Heat.\n  * **Electric Iron:** Electrical energy -> Thermal (heat) energy.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Energy & Fuels',
        suggestions: ['Why can sound not travel through a vacuum?', 'What is the danger of carbon monoxide in closed rooms?', 'Explain energy conversions at Kariba Dam']
      };
    }

    // 26. Disaster Risk Management, Lightning & Fireguards
    if (
      q.includes('disaster') ||
      q.includes('disasters') ||
      q.includes('cyclone idai') ||
      q.includes('cyclone') ||
      q.includes('lightning safety') ||
      q.includes('lightning crouch') ||
      q.includes('lightning conductor') ||
      q.includes('fireguard') ||
      q.includes('fire guard') ||
      q.includes('fire triangle') ||
      q.includes('veld fire')
    ) {
      if (q.includes('fireguard') || q.includes('fire guard') || q.includes('fire triangle') || q.includes('veld fire')) {
        return {
          text: `### The Fire Triangle, Veld Fires & Fireguards\n\n- **The Fire Triangle:** Three elements needed for fire to burn: **Fuel** (dry grass, wood, petrol), **Heat** (spark, match, lightning), and **Oxygen** (air). Removing any **one** element immediately extinguishes the fire (e.g. water removes heat; fire blankets or sand cut off oxygen).\n\n- **Veld Fires (Wildfires):** Uncontrolled bush fires caused by reckless cigarette butts, clearing fields by burning, hunting, or honey harvesting; they kill wildlife, destroy grazing pastures, and burn homesteads.\n\n- **The 9-Metre Fireguard Rule (EMA Standards):**\n  * A **fireguard** is a cleared perimeter strip of land where all dry grass, bushes, and combustible materials are ploughed, hoed, or graded away.\n  * **Standard Width:** In Zimbabwe, the Environmental Management Agency (EMA) legally mandates a minimum width of **at least 9 metres**.\n  * **Purpose:** Deprives approaching flames of fuel, preventing veld fires from jumping across property boundaries and homesteads.\n  * **Deadline:** Must be constructed **before 31 July** every year before the dry fire season begins.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Disaster Risk Management',
          suggestions: ['What are lightning safety rules?', 'What caused the devastation during Cyclone Idai?', 'What is a disaster?']
        };
      }

      if (q.includes('lightning')) {
        return {
          text: `### Lightning Safety Rules\n\nZimbabwe has one of the world's highest lightning strike death rates due to high-altitude granite kopjes and intense summer convective thunderstorms.\n\n- **Indoor Safety Rules:**\n  * Stay inside a substantial building or an enclosed metal-bodied vehicle.\n  * Avoid touching corded electrical appliances, metal plumbing pipes, and landline phones.\n  * Stay away from open windows and doors.\n\n- **Outdoor Safety (Places to Avoid):**\n  * NEVER shelter under tall, isolated trees or open thatched sheds.\n  * Avoid open sports fields, hilltops, golf courses, and swimming pools/rivers.\n  * Stay away from metal wire fences, railway tracks, tractors, and bicycles.\n\n- **The Emergency Lightning Crouch:** If trapped in an open field with no shelter nearby:\n  * Crouch down low on the balls of your feet with heels touching.\n  * Tuck your head between your knees and cover your ears with your hands.\n  * Minimize your contact area with the ground; **NEVER LIE FLAT** because ground currents will flow through your body!\n\n- **Lightning Conductors:** Pointed copper rods installed on building rooftops connected to thick copper earth wires buried deep in damp soil to safely conduct electrical strikes into the ground.`,
          sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Disaster Risk Management',
          suggestions: ['What is the 9-metre fireguard rule?', 'What was Tropical Cyclone Idai?', 'What is a disaster?']
        };
      }

      return {
        text: `### Disaster Risk Management: Natural and Man-Made Disasters\n\n**A disaster** is a sudden, calamitous event causing widespread destruction of property, loss of human life, and environmental degradation that overwhelms a community's capacity to cope.\n\n- **Natural Disasters in Zimbabwe:**\n  1. **Tropical Cyclones:** Intense revolving Indian Ocean storm systems bringing violent gale-force winds and torrential rains. Example: **Cyclone Idai (March 2019)** caused catastrophic flash floods, landslides, and loss of life in Chimanimani and Chipinge (Manicaland).\n  2. **Droughts:** Prolonged periods of deficient rainfall (often linked to El Niño), resulting in dried rivers, failed maize crops, livestock deaths, and food insecurity.\n  3. **Floods:** River overflows submerging settlements (e.g. Muzarabani in Zambezi Valley, Middle Sabi, Tsholotsho). Golden rule: **NEVER attempt to walk or drive across flooded bridges or rivers**!\n  4. **Lightning Strikes:** Electrical cloud-to-ground discharges during summer storms.\n\n- **Man-Made Disasters:** Veld fires, mine shaft collapses in illegal gold panning (*makorokoza*), and highway fuel tanker explosions.\n\n- **Disaster Preparedness:** Early warning weather broadcasts, EMA fireguards, and community evacuation drills.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Disaster Risk Management',
        suggestions: ['What are lightning safety rules?', 'What is the 9-metre fireguard rule?', 'What are the causes and effects of veld fires?']
      };
    }

    // 27. Simple Machines & Levers
    if (
      q.includes('simple machine') ||
      q.includes('simple machines') ||
      q.includes('lever') ||
      q.includes('levers') ||
      q.includes('first class lever') ||
      q.includes('second class lever') ||
      q.includes('third class lever') ||
      q.includes('fulcrum')
    ) {
      return {
        text: `### Simple Machines and the Three Classes of Levers\n\n**A simple machine** is a mechanical device that changes the direction or magnitude of a force, making work easier (acting as a force multiplier or distance multiplier).\n\n- **The Three Components of a Lever:** **Fulcrum (Pivot, F)**, **Load (Resistance, L)**, and **Effort (Applied Force, E)**.\n\n- **The "FLE" Rule for Classes of Levers:**\n  1. **First Class Lever (Fulcrum in the Middle - F):**\n     * The Fulcrum lies between the Effort and the Load (Effort - **Fulcrum** - Load).\n     * **Examples:** Crowbar, pair of scissors, claw hammer removing a nail, pliers, and a playground seesaw.\n  2. **Second Class Lever (Load in the Middle - L):**\n     * The Load lies between the Fulcrum and the Effort (Fulcrum - **Load** - Effort).\n     * Acts as a powerful **force multiplier**.\n     * **Examples:** Wheelbarrow, bottle opener, nutcracker, and paper guillotine.\n  3. **Third Class Lever (Effort in the Middle - E):**\n     * The Effort lies between the Fulcrum and the Load (Fulcrum - **Effort** - Load).\n     * Acts as a **distance and speed multiplier**.\n     * **Examples:** Garden shovel / spade, fishing rod, braai tongs, tweezers, and the human forearm curling a weight.`,
        sourceTag: 'ZIMSEC Grade 7 Science & Technology 7030 • Simple Machines',
        suggestions: ['What is the difference between a first class and second class lever?', 'What are simple machines?', 'What is work in science?']
      };
    }

    // 28. ICT, Computer Hardware, Software, AI, Coding & Robotics
    if (
      q.includes('digital device') ||
      q.includes('digital devices') ||
      q.includes('computer hardware') ||
      q.includes('input device') ||
      q.includes('output device') ||
      q.includes('storage device') ||
      q.includes('cpu') ||
      q.includes('ram and rom') ||
      q.includes('operating system') ||
      q.includes('word process') ||
      q.includes('spreadsheet') ||
      q.includes('presentation software') ||
      q.includes('powerpoint') ||
      q.includes('excel') ||
      q.includes('internet and web') ||
      q.includes('internet vs web') ||
      q.includes('malware') ||
      q.includes('antivirus') ||
      q.includes('cyber safety') ||
      q.includes('artificial intelligence') ||
      q.includes('what is ai') ||
      q.includes('coding') ||
      q.includes('algorithm') ||
      q.includes('robotics') ||
      q.includes('robot') ||
      q.includes('ict career') ||
      q.includes('ict careers')
    ) {
      if (q.includes('ai') || q.includes('artificial intelligence')) {
        return {
          text: `### Artificial Intelligence (AI)\n\n**Artificial Intelligence (AI)** refers to computer systems, algorithms, and machines programmed to simulate human cognitive intelligence—such as learning from data, reasoning, understanding spoken language, recognizing visual images, and making autonomous decisions.\n\n- **Applications in Zimbabwe:**\n  1. **Smart Agriculture:** AI-powered camera drones scan maize fields to identify fall armyworm infestations; automated soil sensors trigger drip irrigation valves.\n  2. **Healthcare:** Automated diagnostic systems assist rural clinic nurses in interpreting medical scans.\n  3. **Education:** Intelligent offline curriculum tutors (such as **ZEXA AI**) that provide instant, syllabus-grounded learning without internet data.`,
          sourceTag: 'ZIMSEC Grade 7 ICT & Educational Technology 7030 • AI & Innovation',
          suggestions: ['What is an algorithm?', 'What are the parts of a robot?', 'What are input and output devices?']
        };
      }

      if (q.includes('algorithm') || q.includes('coding')) {
        return {
          text: `### Algorithms and Computer Coding\n\n- **What is an Algorithm?** An **algorithm** is a precise, unambiguous, step-by-step sequence of instructions or rules designed to accomplish a specific task or solve a computational problem.\n  * *Example:* Algorithm to calculate the perimeter of a garden: *Step 1: Measure Length. Step 2: Measure Width. Step 3: Add Length and Width. Step 4: Multiply by 2.*\n\n- **What is Coding?** **Coding** is the process of writing algorithms in a computer programming language (e.g. Scratch block coding, Python) that a computer processor can execute.\n\n- **Core Coding Building Blocks:**\n  1. **Sequence:** Executing instructions in exact sequential order from top to bottom.\n  2. **Selection (Conditionals):** Making decisions based on "IF-THEN-ELSE" criteria (*IF soil moisture < 20%, THEN turn on pump; ELSE turn off pump*).\n  3. **Iteration (Loops):** Repeating a set of instructions until a goal is reached (*REPEAT 10 times: step forward*).\n  4. **Debugging:** The systematic process of finding, analyzing, and fixing bugs or syntax errors in code.`,
          sourceTag: 'ZIMSEC Grade 7 ICT & Educational Technology 7030 • Coding & Robotics',
          suggestions: ['What are the three parts of a robot?', 'What is artificial intelligence?', 'What are the career paths in ICT?']
        };
      }

      if (q.includes('robot') || q.includes('robotics')) {
        return {
          text: `### Robotics: Parts and Functions of a Robot\n\n**A robot** is an automated, programmable electromechanical machine capable of carrying out a complex series of physical actions automatically.\n\n- **The Three Main Parts of a Robot:**\n  1. **Sensors (Input / Senses):** Electronic components that detect changes in the physical environment:\n     * *Ultrasonic sensors:* Measure distance using sound waves.\n     * *Light-dependent resistors (LDR):* Detect light intensity.\n     * *Moisture and temperature sensors:* Measure soil moisture and heat.\n  2. **Controller (Brain / Processor):** A microcontroller (e.g. micro:bit, Arduino, or onboard microprocessor) that runs the code and processes sensor inputs to make decisions.\n  3. **Actuators (Output / Muscles):** Electric motors, servo motors, hydraulic pistons, robotic arms, and buzzer alarms that execute physical motion and work.`,
          sourceTag: 'ZIMSEC Grade 7 ICT & Educational Technology 7030 • Coding & Robotics',
          suggestions: ['What is an algorithm in computer coding?', 'What is artificial intelligence?', 'What are input and output devices?']
        };
      }

      if (q.includes('cpu') || q.includes('ram') || q.includes('rom')) {
        return {
          text: `### Computer Hardware: CPU, RAM, and ROM\n\n1. **The CPU (Central Processing Unit):**\n   - The "brain" of the computer that interprets and executes all instructions.\n   - **ALU (Arithmetic Logic Unit):** Performs mathematical calculations (+, -, ×, ÷) and logical comparisons.\n   - **Control Unit (CU):** Directs and coordinates data flow between all hardware components.\n\n2. **RAM (Random Access Memory):**\n   - **Volatile, temporary working memory** used by the CPU to store data and software currently in active use.\n   - All data in RAM is wiped clean when the computer is turned off.\n\n3. **ROM (Read-Only Memory):**\n   - **Non-volatile, permanent memory** containing permanent factory startup firmware (BIOS) required to boot up the computer.\n   - Data in ROM is retained even when power is disconnected.`,
          sourceTag: 'ZIMSEC Grade 7 ICT & Educational Technology 7030 • Hardware',
          suggestions: ['What are input and output devices?', 'What is an operating system?', 'What is an algorithm?']
        };
      }

      if (q.includes('word process') || q.includes('spreadsheet') || q.includes('presentation')) {
        return {
          text: `### Productivity Software: Word Processing, Spreadsheets, and Presentations\n\n1. **Word Processing Software (e.g. Microsoft Word, Google Docs):**\n   - Used for typing, formatting, and printing text documents (letters, school essays, reports).\n   - Key features: Font styling, text alignment, margins, spell checker, inserting tables and pictures.\n\n2. **Spreadsheet Software (e.g. Microsoft Excel, Google Sheets):**\n   - Used for organizing numerical data in a grid of **rows (numbered)** and **columns (lettered)** forming **cells** (e.g. Cell A1).\n   - Performs automated calculations using formulas starting with an equals sign (e.g. =SUM(A1:A10), =AVERAGE(B1:B5)) and creates graphs and charts.\n\n3. **Presentation Software (e.g. Microsoft PowerPoint, Google Slides):**\n   - Used for creating visual slide shows combining text, images, animations, and slide transitions for public talks and class presentations.`,
          sourceTag: 'ZIMSEC Grade 7 ICT & Educational Technology 7030 • Software',
          suggestions: ['What is the difference between RAM and ROM?', 'What is cyber safety?', 'What are input and output devices?']
        };
      }

      if (q.includes('career') || q.includes('careers')) {
        return {
          text: `### Career Paths in Information and Communication Technology (ICT)\n\n1. **Software Developer / Computer Programmer:** Writes and tests code to build software applications, games, and mobile apps.\n2. **Network Engineer / Administrator:** Installs, configures, and maintains computer networks, routers, and school/office Wi-Fi.\n3. **Cybersecurity Specialist:** Protects computer systems, networks, and confidential data from hacker attacks and malware.\n4. **Database Administrator (DBA):** Manages, secures, and organizes large company databases and records.\n5. **Web Designer / Developer:** Designs and builds functional, responsive websites on the internet.\n6. **Computer Hardware Technician:** Repairs, cleans, upgrades, and troubleshoots physical computer hardware components.\n7. **Robotics & AI Engineer:** Designs smart automated machines and robots for agriculture and industry.`,
          sourceTag: 'ZIMSEC Grade 7 ICT & Educational Technology 7030 • Careers',
          suggestions: ['What is coding and what is an algorithm?', 'What are the parts of a robot?', 'What is artificial intelligence?']
        };
      }

      // General ICT Hardware, Digital Devices & Cyber Safety
      return {
        text: `### ICT Fundamentals: Hardware, Software & Cyber Safety\n\n- **Classification of Computer Hardware:**\n  1. **Input Devices:** Enter data into the computer (Keyboard, Mouse, Optical Scanner, Microphone, Webcam, Barcode Reader).\n  2. **Output Devices:** Display or deliver processed data (Screen/Monitor, Laser/Inkjet Printer, Speakers, Multimedia Projector).\n  3. **Processing:** Central Processing Unit (CPU) with ALU and Control Unit.\n  4. **Storage Devices:** Secondary storage that retains data permanently (Hard Disk Drives/SSDs, USB Flash Drives, SD Memory Cards).\n\n- **Caring for Digital Devices:**\n  * Clean screens and keyboards with a soft, dry, lint-free cloth.\n  * Keep devices away from liquids, food crumbs, extreme dust, and direct hot sunlight.\n  * Always shut down properly through the operating system; use surge protectors to prevent power-spike damage.\n\n- **Internet vs World Wide Web (WWW):**\n  * **Internet:** The vast global physical network of billions of interconnected computers and cables.\n  * **World Wide Web (Web):** The collection of interlinked multimedia web pages and documents accessed through internet browsers using URLs.\n\n- **Cyber Safety & Malware Protection:**\n  * Create strong passwords (at least 8 characters with uppercase, lowercase, numbers, and symbols).\n  * Never reveal personal information (full name, address, school) to strangers online.\n  * **Malware:** Malicious software (viruses, worms, trojans, ransomware) that damages computers.\n  * **Antivirus Software:** Scans, identifies, quarantines, and deletes malware threats.`,
        sourceTag: 'ZIMSEC Grade 7 ICT & Educational Technology 7030 • Hardware & Security',
        suggestions: ['What is the difference between RAM and ROM?', 'What is an algorithm and what is coding?', 'What are the three parts of a robot?']
      };
    }

    return null;
  }
  private static handlePrimaryIndigenousLanguagesQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase();

    // 1. ChiShona Tsumo (Proverbs)
    if (
      q.includes('tsumo') ||
      q.includes('chara chimwe') ||
      q.includes('mwana asingachemi') ||
      q.includes('kandiro kanoenda') ||
      q.includes('aive madziva') ||
      q.includes('chakafukidza dzimba') ||
      q.includes('rume rimwe') ||
      q.includes('chinokanganwa idemo') ||
      q.includes('gudo guru') ||
      q.includes('chisi hachieri') ||
      q.includes('shona proverb')
    ) {
      let directAnswer = '';
      if (q.includes('chara chimwe')) {
        directAnswer = '"**Chara chimwe hachitswanyi inda**" zvinoreva kuti **munhu mumwe chete haakwanisi kuita basa guru ari ega; panodiwa mushandirapamwe nekubatana kwevanhu** (One finger cannot crush a louse; unity and teamwork are essential).';
      } else if (q.includes('mwana asingachemi')) {
        directAnswer = '"**Mwana asingachemi anofira mumbereko**" zvinoreva kuti **munhu anofanira kutaura zviri kumunetsa pachena kuti awane rubatsiro** (A child who does not cry dies in the carrier; speak up about your problems).';
      } else if (q.includes('kandiro kanoenda')) {
        directAnswer = '"**Kandiro kanoenda kunobva kamwe**" zvinoreva kuti **kudyidzana nekubatsirana; munhu anobatsira vamwe naiyewo anozobatsirwawo mune ramangwana** (Generosity and kindness are reciprocated).';
      } else if (q.includes('chakafukidza dzimba')) {
        directAnswer = '"**Chakafukidza dzimba matenga**" zvinoreva kuti **mhuri imwe neimwe ine zvakavanzika zvayo kana matambudziko ayo ausingazivi uchitarisa kunze** (Every household has private struggles hidden under the roof).';
      } else if (q.includes('chinokanganwa idemo')) {
        directAnswer = '"**Chinokanganwa idemo asi chigutsa hachikanganwi**" zvinoreva kuti **munhu anenge atadzira mumwe anokanganwa nekukurumidza, asi uya akatadzirwa anoramba achirangarira kurwadziwa kwacho** (The wrongdoer forgets, but the victim remembers).';
      } else if (q.includes('aive madziva')) {
        directAnswer = '"**Aive madziva ava mazambuko**" zvinoreva kuti **upenyu nesimba zvinoshanduka; munhu aive mupfumi kana ane chiremera anogona kuzosara ava murombo** (Circumstances change; fortune is not permanent).';
      } else if (q.includes('gudo guru')) {
        directAnswer = '"**Gudo guru peta muswe kuti vaduku vagokwana**" zvinoreva kuti **vatungamiri nevakuru vanofanira kuzvininipisa vachipawo vamwe mukana** (Leaders must exercise humility).';
      }

      return {
        text: `### Tsumo dzeChiShona
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
MuChiShona, tsumo mashoko akadzama anotaura nezveupenyu, unhu, uye kurudziro:

1. Tsumo dzeMushandirapamwe neKubatana (Unity & Cooperation):
- **Chara chimwe hachitswanyi inda:** Basa guru haripedzwi nemunhu mumwe chete.
- **Rume rimwe harikombi churu:** Munhu mumwe haagoni kuita zvose ari ega.
- **Kutsva kwendebvu varume vanodzimurana:** Vanhu vanofanira kubatsirana panhamo.

2. Tsumo dzeKudyidzana neMaitiro Akanaka (Reciprocity & Generosity):
- **Kandiro kanoenda kunobva kamwe:** Ukapa vamwe, nawe uchapihwawo.
- **Mwana asingachemi anofira mumbereko:** Taura dambudziko rako kuti ubatsirwe.
- **Chakafukidza dzimba matenga:** Mhuri yoga yoga ine zviri kuitika zvisingaonekwi pachena.

3. Tsumo dzeChenjedzo neKuzvibata (Caution & Consequences):
- **Chinokanganwa idemo asi chigutsa hachikanganwi:** Mutadzi anokanganwa, asi akatadzirwa haarangariri.
- **Aive madziva ava mazambuko:** Zvinhu zvinochinja muupenyu.
- **Gudo guru peta muswe kuti vaduku vagokwana:** Vakuru nevatungamiri vanofanira kuva vanhu vanozvininipisa.
- **Chisi hachieri chinoerwa:** Mitemo yetsika inofanira kuremekedzwa nevanhu.`,
        sourceTag: 'ZIMSEC Grade 7 ChiShona Syllabus 7040 • Tsumo',
        suggestions: [
          'Tsanangura mitupo nezvidau zvayo muChiShona',
          'Madimikira eChiShona anoreva chii?',
          'Tsanangura mazita eukama muChiShona'
        ]
      };
    }

    // 2. Mitupo neZvidau (Totems and Praise Names)
    if (
      q.includes('mitupo') ||
      q.includes('zvidau') ||
      q.includes('chidau') ||
      q.includes('totem') ||
      q.includes('shava mhofu') ||
      q.includes('samanyanga') ||
      q.includes('chirandu')
    ) {
      let directAnswer = '';
      if (q.includes('moyo')) {
        directAnswer = 'Mutupo wa**Moyo** chidau chawo ndi**Chirandu**, **Bvumavaranda**, kana **Sahayi**.';
      } else if (q.includes('shava')) {
        directAnswer = 'Mutupo wa**Shava** chidau chawo ndi**Mhofu**, **Museyamwa**, kana **Zvimbakupa**.';
      } else if (q.includes('shumba')) {
        directAnswer = 'Mutupo wa**Shumba** chidau chawo ndi**Murambwi**, **Nyamuzihwa**, kana **Nechigumira**.';
      } else if (q.includes('nzou')) {
        directAnswer = 'Mutupo wa**Nzou** chidau chawo ndi**Samanyanga** kana **Mbano**.';
      } else if (q.includes('mbizi')) {
        directAnswer = 'Mutupo we**Mbizi** chidau chawo ndi**Tembo**, **Mazvimbakupa**, kana **Marowa**.';
      } else if (q.includes('gumbo')) {
        directAnswer = 'Mutupo we**Gumbo** chidau chawo ndi**Madyirapanze** (Sambiri).';
      } else if (q.includes('soko')) {
        directAnswer = 'Mutupo we**Soko** chidau chawo ndi**Murehwa**, **Mukanya**, kana **Wafawanaka**.';
      }

      return {
        text: `### Mitupo neZvidau
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Mutupo chiratidzo chedzinza neukama muChiShona, uye chidau izita rekuremekedza nekutenda munhu wepa mutupo iwoyo:

1. Mazita eMitupo neZvidau Zvayo Zvinozivikanwa paGrade 7:
- **Moyo (Heart):** Chidau: **Chirandu** / **Bvumavaranda** / **Sahayi**.
- **Shava (Eland):** Chidau: **Mhofu** / **Museyamwa** / **Zvimbakupa**.
- **Shumba (Lion):** Chidau: **Murambwi** / **Nechigumira** / **Nyamuzihwa**.
- **Nzou (Elephant):** Chidau: **Samanyanga** / **Mbano**.
- **Mbizi (Zebra):** Chidau: **Tembo** / **Marowa** / **Mazvimbakupa**.
- **Gumbo (Leg):** Chidau: **Madyirapanze** (Sambiri).
- **Soko (Monkey/Baboon):** Chidau: **Murehwa** / **Mukanya** / **Wafawanaka**.
- **Dziva (Pool/Fish):** Chidau: **Mvura** / **Kavhura**.
- **Gwayi / Hwai (Sheep):** Chidau: **Tumbare**.
- **Nyati (Buffalo):** Chidau: **Hekunouno**.

*ZIMSEC Exam Fact:* Munhu haatenderwi kuroora kana kuroorwa nemunhu ane mutupo wakafanana newake nokuti vanoonekwa sehama dzeropa.`,
        sourceTag: 'ZIMSEC Grade 7 ChiShona Syllabus 7040 • Mitupo neZvidau',
        suggestions: [
          'Tsanangura tsumo: Chara chimwe hachitswanyi inda',
          'Ndezvipi zvinorehwa nemazita eukama?',
          'Ndeapi madimikira anonyanya kubvunzwa?'
        ]
      };
    }

    // 3. Ukama (Kinship Terms)
    if (
      q.includes('ukama') ||
      q.includes('babamukuru') ||
      q.includes('babamunini') ||
      q.includes('tete') ||
      q.includes('mukuwasha') ||
      q.includes('muroora') ||
      q.includes('muramu') ||
      q.includes('tsano') ||
      q.includes('tezvara') ||
      q.includes('shona kinship')
    ) {
      let directAnswer = '';
      if (q.includes('babamukuru')) directAnswer = '**Babamukuru** mukoma wababa vako (father\'s older brother).';
      else if (q.includes('babamunini')) directAnswer = '**Babamunini** munin\'ina wababa vako (father\'s younger brother).';
      else if (q.includes('tete')) directAnswer = '**Tete** hanzvadzi yababa vako (father\'s sister).';
      else if (q.includes('sekuru')) directAnswer = '**Sekuru** hanzvadzi yaamai vako (mother\'s brother), kana baba vababa / baba vaamai vako (grandfather).';
      else if (q.includes('mukuwasha')) directAnswer = '**Mukuwasha** murume akaroora mwanasikana wemhuri (son-in-law).';
      else if (q.includes('muroora')) directAnswer = '**Muroora** mukadzi akaroorwa nemwanakomana wemhuri (daughter-in-law).';
      else if (q.includes('tsano')) directAnswer = '**Tsano** hanzvadzi yemukadzi wako (brother-in-law to a man).';
      else if (q.includes('tezvara')) directAnswer = '**Tezvara** baba vemukadzi wako (father-in-law).';

      return {
        text: `### Ukama neMazita eMhuri
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Ukama muChiShona hune mazita chaiwo anotsanangura hukama hwevanhu mumhuri:

1. Hama dzeRopa (Blood Relatives):
- **Babamukuru:** Mukoma wababa vako.
- **Babamunini:** Munin'ina wababa vako.
- **Tete:** Hanzvadzi yababa vako.
- **Sekuru:** Hanzvadzi yaamai vako (uncle), kana baba vababa/vaamai (grandfather).
- **Mbuya / Ambuya:** Amai vaamai kana amai vababa (grandmother).
- **Maiguru:** Mukadzi wababamukuru, kana mukoma waamai vako.
- **Mainini:** Mukadzi wababamunini, kana munin'ina waamai vako.
- **Muzukuru:** Mwana wehanzvadzi yako, kana mwana wemwana wako.

2. Hama dzeRoora (In-Laws):
- **Tezvara:** Baba vemukadzi wako.
- **Vamwene / Mbuya:** Amai vemukadzi wako kana amai vemurume wako.
- **Mukuwasha:** Murume akaroora mwanasikana wemumba menyu.
- **Muroora:** Mukadzi akaroorwa nemwanakomana wemumba menyu.
- **Tsano:** Hanzvadzi yemukadzi wako.
- **Muramu:** Munin'ina kana mukoma wemukadzi/wemurume wako.`,
        sourceTag: 'ZIMSEC Grade 7 ChiShona Syllabus 7040 • Ukama',
        suggestions: [
          'Ndipe tsumo dzekubatana neChiShona',
          'Mitupo nezvidau zvayo zvinoreva chii?',
          'Tsanangura madimikira anonyanya kubuda mubvunzo'
        ]
      };
    }

    // 4. Madimikira (Idioms)
    if (
      q.includes('madimikira') ||
      q.includes('kuona nyeredzi masikati') ||
      q.includes('kudya moyo') ||
      q.includes('kubvisa nzeve') ||
      q.includes('kutuka mhepo') ||
      q.includes('kupfuya nyoka') ||
      q.includes('kurara nezamu') ||
      q.includes('shona idiom')
    ) {
      let directAnswer = '';
      if (q.includes('kuona nyeredzi masikati')) {
        directAnswer = '"**Kuona nyeredzi masikati**" zvinoreva **kurwadziwa zvakanyanyisa, kushamisika, kana kuwira mudambudziko guru** (experiencing extreme shock or intense physical pain).';
      } else if (q.includes('kudya moyo')) {
        directAnswer = '"**Kudya moyo**" zvinoreva **kunetseka zvakanyanya mupfungwa kana kuva neshungu huru** (worrying deeply or grieving internally).';
      } else if (q.includes('kubvisa nzeve')) {
        directAnswer = '"**Kubvisa nzeve**" zvinoreva **kuramba kuteerera kana kuita nharo pane zvaunoyambirwa** (being stubborn and refusing to listen).';
      } else if (q.includes('kupfuya nyoka')) {
        directAnswer = '"**Kupfuya nyoka mudumbu**" zvinoreva **kuchengeta chigumbu kana ruvengo rusingataurwi pachena** (nursing a secret grudge or malice).';
      }

      return {
        text: `### Madimikira eChiShona
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Madimikira mashoko anotaura pfungwa yakavanzika isina kuenzana nemashoko anoverengwa:

1. Madimikira eKurwadziwa neKushamisika (Pain & Shock):
- **Kuona nyeredzi masikati:** Kurwadziwa zvikuru pamuviri kana kushamiswa netsaona.
- **Kuchema nemboni yeziso:** Kurwadziwa mumwoyo usingabudisi misodzi pachena.
- **Kubata kumeso:** Kunyengera kana kupa munhu nhema.

2. Madimikira eKufunga neKuzvidya Mwoyo (Worry & Anxiety):
- **Kudya moyo:** Kunetseka mupfungwa nekuda kwedambudziko.
- **Kurova hana:** Kutya kana kudedera nekuda kwekufungira zvakaipa.

3. Madimikira eNharo neHutsotsi (Stubbornness & Malice):
- **Kubvisa nzeve:** Kuramba kuteerera mazano nevakuru.
- **Kupfuya nyoka mudumbu:** Kuchengeta ruvengo mumwoyo.
- **Kuve neruoko:** Kuva netsika yekuba zvinhu zvevamwe.`,
        sourceTag: 'ZIMSEC Grade 7 ChiShona Syllabus 7040 • Madimikira',
        suggestions: [
          'Tsanangura tsumo: Chara chimwe hachitswanyi inda',
          'Ndezvipi zvinonzi nyaudzosingwi?',
          'Tsanangura mazita eukama'
        ]
      };
    }

    // 5. Nyaudzosingwi (Ideophones)
    if (
      q.includes('nyaudzosingwi') ||
      q.includes('akati zii') ||
      q.includes('akati mwiro') ||
      q.includes('akati dzvi') ||
      q.includes('shona ideophone')
    ) {
      let directAnswer = '**Nyaudzosingwi** mazwi anotsanangura chiito kana ruzha zvakajeka, anowanzotangirwa neshoko rokuti "kuti" (semuenzaniso: akati **zii** kureva kunyarara; akati **dzvi** kureva kumira; akati **mwiro** kureva kunyarara uchiyeuka). **Mutemo weZIMSEC:** Nyaudzosingwi dzakadzokororwa **hadzina hyphen** (semuenzaniso: "kota kota", "piti piti", KWETE "kota-kota").';
      return {
        text: `### Nyaudzosingwi
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
1. Mhando dzeNyaudzosingwi dzinonyanya Kubvunzwa:
- **Akati zii:** Kunyarara kwakakwana (complete silence).
- **Akati mwiro:** Kunyarara kwekufunga (reflective silence).
- **Akati dzvi:** Kubata zvakasimba kana kumira pakarepo (firm grip or sudden stop).
- **Akati svo:** Kusvetuka kana kupukunyuka zviri nyore (sudden escape/leap).
- **Yakati shwarara:** Kunaya kwemvura yakawanda zvikuru (steady heavy rain).
- **Akati dhuma:** Kusangana vanhu vasingatarisiri (sudden collision/meeting).
- **Akadonha akati bvamu:** Kudonha kwemunhu kana chinhu chinorema.

2. Mutemo Mukuru weZviperengo (ZIMSEC Spelling Rule):
- Kana nyaudzosingwi yadzokororwa, **haisungirwi ne-hyphen (-)**:
  * Nyora: **kota kota** (KWETE kota-kota).
  * Nyora: **piti piti** (KWETE piti-piti).
  * Nyora: **waya waya** (KWETE waya-waya).`,
        sourceTag: 'ZIMSEC Grade 7 ChiShona Syllabus 7040 • Nyaudzosingwi',
        suggestions: [
          'Tsanangura tsumo neChiShona',
          'Mitupo nezvidau zvayo zvinoreva chii?',
          'Izaga zesiNdebele lezitho zenkulumo'
        ]
      };
    }

    // 6. IsiNdebele: Izaga, Izitsho, leZitho Zenkulumo
    if (
      q.includes('ndebele') ||
      q.includes('isindebele') ||
      q.includes('izaga') ||
      q.includes('izitsho') ||
      q.includes('inyoni itshayelwa') ||
      q.includes('izandla ziyagezana') ||
      q.includes('uhlanga lwendoda') ||
      q.includes('izitho zenkulumo') ||
      q.includes('ibizo') ||
      q.includes('isenzo') ||
      q.includes('isiphawulo')
    ) {
      let directAnswer = '';
      if (q.includes('inyoni itshayelwa')) {
        directAnswer = '"**Inyoni itshayelwa ezalela**" kutsho ukuthi **umuntu unconywa njalo uncediswa lapho okubonakala khona imisebenzi yakhe emihle lemizamo yakhe** (A bird is praised where it lays; people help and reward visible hard work).';
      } else if (q.includes('izandla ziyagezana')) {
        directAnswer = '"**Izandla ziyagezana**" kutsho ukuthi **ukuncedisana lokusebenzisana ngothando emphakathini kuletha impumelelo** (Hands wash each other; mutual assistance brings success).';
      } else if (q.includes('uhlanga lwendoda')) {
        directAnswer = '"**Uhlanga lwendoda kalubole**" kutsho ukuthi **igugu lomndeni lelungelo kuhlala kuqhubekela phambili kubantwana labazukulu** (A man\'s heritage and family line never perishes).';
      } else if (q.includes('izitho zenkulumo') || q.includes('parts of speech')) {
        directAnswer = 'Izitho zenkulumo eziqakathekileyo kusiNdebele yilezi: **IBIZO (noun), ISABIZWANA (pronoun), ISENZO (verb), ISIPHAWULO (adjective), UPHAWULISANDISO (adverb), ISANDISO (copulative), leSIBABAZO (interjection)**.';
      }

      return {
        text: `### IsiNdebele
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
KusiNdebele sebanga lesi-7 kuhlolwa izaga, izitsho, kanye lohlelo lolimi:

1. Izaga ZesiNdebele leNshoko Zazo:
- **Inyoni itshayelwa ezalela:** Umuntu uphiwa usizo lapho abantu ababona khona ukuthi uyazama ukusebenza ngokuzikhandla.
- **Izandla ziyagezana:** Ukuncedisana emphakathini kuletha intuthuko.
- **Uhlanga lwendoda kalubole:** Isizukulwane sendoda silokhu siqhubekela phambili.
- **Isisu somhambi sasinganani, singangenso yenyoni:** Umhambi ufanelwe ukwamukelwa ngesihle lokudla okuncane ngoba kalambeli ukufunza.
- **Indlela ibuzwa kwabaphambili:** Kubalulekile ukucela amacebo kubantu abadala abalesipiliyoni.

2. Uhlelo Lolimi — Izitho Zenkulumo (Parts of Speech):
- **Ibizo (Noun):** Igama eliqamba into, umuntu, loba indawo (umuntu, isikole, inkomo, ilizwe).
- **Isabizwana (Pronoun):** Lisetshenziswa esikhundleni sebizo (mina, yena, laba, sonke).
- **Isenzo (Verb):** Litshengisa okwenziwayo kumbe isimo (hamba, dula, funda, lima).
- **Isiphawulo (Adjective):** Lichaza ibizo ngobukhulu, ibala, kumbe umumo (omkhulu, ezinhle, emhlophe).
- **Uphawulisandiso (Adverb):** Lichaza isenzo ngokwesikhathi, indawo, loba indlela (kakhulu, lapha, namhlanje).
- **Concord (Ukuvumelana):** Isivumelwano sesiphawulo lesenzo silandela isigaba sebizo (isibonelo: *izitsha ezinhle zaphukile*).`,
        sourceTag: 'ZIMSEC Grade 7 IsiNdebele Syllabus 7041 • Izaga loHlelo',
        suggestions: [
          'Chaza isaga: Inyoni itshayelwa ezalela',
          'Yiziphi izitho zenkulumo kusiNdebele?',
          'Tsanangura tsumo dzeChiShona'
        ]
      };
    }

    return null;
  }

  /**
   * Primary Social Sciences Curriculum: Heritage & Social Studies, FAREME (ZIMSEC 7050)
   * High-accuracy, zero-hallucination engine covering National Symbols, Liberation History, Governance, Unhu/Ubuntu, and World Religions
   */
  private static handlePrimarySocialScienceQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase().trim();
    const decomp = this.decomposeQuestion(question);

    // 1. National School Pledge
    if (q.includes('school pledge') || q.includes('national pledge') || q.includes('pledge of zimbabwe')) {
      if (q.includes('importance') || q.includes('why') || decomp.asksOnlyFunctions) {
        return {
          text: `### Importance of the National School Pledge\n\n1. **Inculcates Patriotism:** Instills national pride, love, and loyalty to Zimbabwe among school children.\n2. **Honours Liberation Heroes:** Reminds learners of the supreme sacrifices made by heroes of the First and Second Chimurenga to liberate the country.\n3. **Promotes National Values (*Unhu/Ubuntu*):** Encourages honesty, integrity, discipline, respect for national resources, and dedication to hard work.\n4. **Fosters National Unity:** Recited in unison by school pupils of all ethnic groups, building unity and shared national aspirations.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • National Symbols',
          suggestions: ['Read the National School Pledge', 'What are the national symbols of Zimbabwe?', 'What are the values of Unhu/Ubuntu?']
        };
      }
      return {
        text: `### The National School Pledge of Zimbabwe\n\n*"Almighty God, in whose hands our future lies,\nI salute the national flag,\nI respect the brave fathers and mothers who lost lives in the Chimurenga/Umvukela.\nWe are proud inheritors of the richness of our natural resources.\nWe are proud inheritors of the richness of our history.\nI promise to be true and faithful to my country,\nI promise to uphold our national values and aspirations.\nI promise to serve my country through hard work,\nAnd to contribute towards the development of our nation.\nSo help me God."*`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • National Symbols',
        suggestions: ['Explain the importance of the National School Pledge', 'What are the colours of the Zimbabwe National Flag?', 'What does the Zimbabwe Bird represent?']
      };
    }

    // 2. Totem System (Mitupo / Izibongo)
    if (q.includes('totem') || q.includes('mitupo') || q.includes('mutupo') || q.includes('izibongo')) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### The Totem System (*Mutupo* / *Isibongo*)\n\nA **totem** (*Mutupo* in Shona, *Isibongo* in Ndebele) is an animal, bird, plant, or natural element adopted by an African clan or family as their sacred emblem, symbolizing common ancestral origin, identity, and kinship (e.g. *Shumba/Sibanda* - Lion, *Soko/Ncube* - Monkey, *Mhofu/Mpofu* - Eland, *Hungwe* - Fish Eagle, *Dziva* - Water/Pool).`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Culture & Heritage',
          suggestions: ['What is the importance of the totem system?', 'What happens if people of the same totem marry?', 'What is a praise name (Chidau)?']
        };
      }
      if (decomp.asksOnlyFunctions || q.includes('importance') || q.includes('purpose') || q.includes('role')) {
        return {
          text: `### Importance of the Totem System\n\n1. **Prevents Incest (*Makunakuna*):** People sharing the same totem are considered biological relatives; intermarriage within the same totem is strictly forbidden, preserving healthy family genetics.\n2. **Wildlife and Environmental Conservation:** Cultural taboos strictly forbid clan members from hunting, harming, or eating their totem animal, ensuring natural wildlife protection.\n3. **Preserves Identity and Kinship:** Establishes social belonging, lineage roots, and unites clan members across distant regions.\n4. **Expresses Cultural Praise and Gratitude (*Zvidau*):** Reciting clan praise poetry (*Kudetembwa kwemutupo*) shows deep respect, honor, and appreciation after good deeds.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Culture & Heritage',
          suggestions: ['Define a totem', 'List common totems in Zimbabwe', 'What are the principles of Unhu/Ubuntu?']
        };
      }
      return {
        text: `### Purpose and Importance of the Totem System\n\n#### 1. What is a Totem?\nA **totem** (*Mutupo* / *Isibongo*) is an animal, bird, plant, or natural element adopted by a family or clan as their sacred emblem, symbolizing common ancestry and cultural identity.\n\n#### 2. Key Importance\n- **Prevents Incest (*Makunakuna*):** Prohibits marriage between individuals sharing the same totem.\n- **Wildlife Conservation:** Cultural taboo against killing or eating one's totem animal protects species from extinction.\n- **Clan Kinship:** Unites related families and reinforces social solidarity.\n- **Praise Poetry (*Zvidau*):** Used to express gratitude, courtesy, and respect.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Culture & Heritage',
        suggestions: ['Define a totem', 'Explain the importance of the totem system', 'What are indigenous norms and values?']
      };
    }

    // 3. Family Disintegration
    if (q.includes('family disintegration') || q.includes('disintegration of family') || (q.includes('family') && (q.includes('breakdown') || q.includes('disintegrate')))) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Family Disintegration\n\n**Family disintegration** (family breakdown) is the breakdown of family unity, stability, and structure resulting from divorce, separation, desertion, or death of parents, leading to the disruption of normal family functions and relationships.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
          suggestions: ['What are the causes of family disintegration?', 'What are the effects of family disintegration on identity?', 'How can family disintegration be curbed?']
        };
      }
      if (decomp.asksOnlyCauses || (decomp.asksCauses && !decomp.asksEffects && !decomp.asksPreventionOrManagement)) {
        return {
          text: `### Causes of Family Disintegration\n\n1. **Marital Infidelity:** Cheating by either spouse leading to broken trust, conflict, and divorce.\n2. **Domestic Violence and Abuse:** Physical, emotional, or financial abuse between parents.\n3. **Severe Economic Hardship:** Prolonged unemployment, extreme poverty, and migration (diaspora) separating spouses.\n4. **Alcohol and Substance Abuse:** Leading to neglect of family obligations, financial squandering, and fights.\n5. **Death of Parents:** Terminal illnesses (e.g. HIV/AIDS) resulting in orphaned children and child-headed families.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
          suggestions: ['What are the effects of family disintegration?', 'Suggest ways of curbing family disintegration', 'Define family disintegration']
        };
      }
      if (decomp.asksOnlyEffects || (decomp.asksEffects && !decomp.asksCauses && !decomp.asksPreventionOrManagement)) {
        return {
          text: `### Effects of Family Disintegration on Identity and Children\n\n- **Loss of Cultural Identity:** Children grow up detached from their paternal roots, totems, and ancestral lineage.\n- **Emotional Trauma:** Children experience depression, anxiety, feeling unloved, and low self-esteem.\n- **School Dropout & Child Labour:** Inability to pay school fees forces children out of school and into street vending.\n- **Social Vices:** Increased vulnerability to drug abuse, juvenile crime, and early child marriages.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
          suggestions: ['Suggest ways of curbing family disintegration', 'What are the causes of family disintegration?', 'Define family disintegration']
        };
      }
      if (decomp.asksOnlyPrevention || q.includes('curb') || q.includes('curbing') || q.includes('prevent')) {
        return {
          text: `### Ways of Curbing Family Disintegration\n\n1. **Pre-Marital and Marital Counselling:** Seeking wise guidance from extended family elders (*Tete* and *Sekuru*), church pastors, or certified marriage counselors.\n2. **Effective Communication & Dialogue:** Resolving marital disagreements peacefully through mutual respect rather than violence.\n3. **Faithfulness and Fidelity:** Committing to mutual love, respect, and trust in marriage.\n4. **Community and Social Welfare Support:** Providing government assistance (BEAM, food relief) and community care for vulnerable families.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
          suggestions: ['What causes family disintegration?', 'Define family disintegration', 'What are the characteristics of ideal marital relationships?']
        };
      }
      return {
        text: `### Family Disintegration\n\n#### 1. What is Family Disintegration?\n**Family disintegration** is the breakdown of family unity, stability, and structure resulting from divorce, separation, desertion, or death of parents.\n\n#### 2. Causes\n- Marital infidelity, domestic violence, severe poverty, alcohol abuse, and parental death.\n\n#### 3. Effects on Identity\n- Loss of clan identity and totems, emotional trauma, school dropouts, and vulnerability to street life.\n\n#### 4. Ways to Curb It\n- Family counseling by *Tete* and *Sekuru*, peaceful conflict resolution, and social welfare support.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
        suggestions: ['What are the causes of family disintegration?', 'What are the effects of family disintegration?', 'Suggest ways of curbing family disintegration']
      };
    }

    // 4. Marital Relationships and Disputes
    if (q.includes('marital relationship') || q.includes('marital dispute') || q.includes('marriage dispute')) {
      if (q.includes('characteristic') || q.includes('ideal')) {
        return {
          text: `### Characteristics of Ideal Marital Relationships\n\n1. **Mutual Respect and Trust:** Partners value each other, maintain honesty, and stay faithful.\n2. **Effective Communication:** Openly discussing family finances, children's upbringing, and challenges without verbal abuse.\n3. **Shared Responsibility:** Cooperating in earning a living, household duties, and child guidance.\n4. **Forgiveness and Patience:** Resolving disagreements calmly through dialogue and empathy.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
          suggestions: ['What are the causes and effects of marital disputes?', 'Suggest solutions to marital disputes', 'What is family disintegration?']
        };
      }
      if (decomp.asksCauses || q.includes('causes of marital disputes')) {
        return {
          text: `### Causes and Effects of Marital Disputes\n\n- **Causes:** Infidelity (cheating), financial distress and poverty, domestic violence, alcohol abuse, lack of communication, and unwanted interference by in-laws.\n- **Effects:** Domestic violence, emotional stress, neglect of children, separation, divorce, and family disintegration.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
          suggestions: ['Suggest solutions to marital disputes', 'What are the characteristics of ideal marital relationships?', 'What is family disintegration?']
        };
      }
      return {
        text: `### Solutions to Marital Disputes\n\n1. **Indigenous Family Counselling:** Seeking wise mediation from the paternal aunt (*Tete*) and maternal uncle (*Sekuru*).\n2. **Professional Marriage Counselling:** Consulting certified marriage counselors, church pastors, or social workers.\n3. **Open and Calm Dialogue:** Discussing grievances truthfully without insults or physical violence.\n4. **Legal Protection Orders:** Utilizing the Domestic Violence Act through Magistrates' Courts to stop violence while seeking resolution.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family',
        suggestions: ['What are the characteristics of ideal marital relationships?', 'What causes marital disputes?', 'What is family disintegration?']
      };
    }

    // 5. Early People of Zimbabwe (Khoisan and Bantu)
    if (q.includes('khoisan') || (q.includes('bantu') && (q.includes('early') || q.includes('people') || q.includes('migration') || q.includes('contribution') || q.includes('way of life')))) {
      if (q.includes('khoisan') && !q.includes('bantu')) {
        return {
          text: `### The Khoisan (Late Stone Age Early People of Zimbabwe)\n\n1. **Way of Life:** The Khoisan (San/Bushmen) were nomadic hunter-gatherers who lived in Zimbabwe thousands of years ago.\n2. **Hunting & Gathering:** Men hunted wild animals using bows and arrows tipped with natural plant/snake poison. Women gathered wild fruits, roots, and tubers using weighted digging sticks.\n3. **Shelter:** Lived in rock shelters and natural caves; they did not build permanent houses.\n4. **Rock Art:** Painted magnificent rock art on cave walls (Matobo Hills, Domboshava) depicting animals and rituals using charcoal, ochre, animal blood, and egg whites.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Early Societies',
          suggestions: ['Describe the way of life of the Bantu people', 'What were the contributions of the Bantu to national heritage?', 'Compare the Khoisan and Bantu people']
        };
      }
      if (q.includes('contribution') || (q.includes('bantu') && !q.includes('khoisan') && !q.includes('way of life'))) {
        return {
          text: `### Contributions of the Bantu to the National Heritage of Zimbabwe\n\n1. **Agriculture and Food Production:** Introduced crop cultivation (sorghum, millet, beans) and cattle/goat domestication, securing permanent food supplies.\n2. **Iron Smelting & Metallurgy:** Smelted iron ore in clay furnaces to manufacture hoes for farming, spears and arrows for defense, and axes for clearing land.\n3. **Permanent Settlements:** Built permanent pole-and-daga huts thatched with grass, forming organized villages.\n4. **Stone Architecture:** Founded monumental dry-stone wall construction (Great Zimbabwe, Khami).\n5. **Cultural Philosophy:** Established clan totems, extended family structures, and *Unhu/Ubuntu/Vumunhu*.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Early Societies',
          suggestions: ['Describe the way of life of the Khoisan', 'What were the pre-colonial kingdoms of Zimbabwe?', 'What is the totem system?']
        };
      }
      return {
        text: `### The Early People of Zimbabwe: The Khoisan and Bantu\n\n#### 1. The Khoisan (Late Stone Age Hunter-Gatherers)\n- Nomadic lifestyle living in caves and rock shelters.\n- Used stone tools, bows, and poisoned arrows to hunt wild game; women gathered wild plants.\n- Famous for ancient rock art paintings on granite walls (e.g. Matobo Hills, Domboshava).\n\n#### 2. The Bantu (Early Iron Age Farmers)\n- Migrated from central Africa, introducing iron smelting and agriculture.\n- Grew crops (sorghum, millet), raised cattle, and lived in permanent pole-and-daga huts.\n- Established clan totems, trade, and stone masonry (Great Zimbabwe, Mutapa, Rozvi).`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Early Societies',
        suggestions: ['What were the contributions of the Bantu to national heritage?', 'Describe the way of life of the Khoisan', 'What were the pre-colonial kingdoms of Zimbabwe?']
      };
    }

    // 6. Rules, Laws, and By-Laws
    if (q.includes('by-law') || q.includes('by law') || q.includes('by-laws') || q.includes('bylaws') || q.includes('rules and laws') || (q.includes('law') && (q.includes('importance of observing') || q.includes('enforcing the law') || q.includes('breaking the law')))) {
      if (q.includes('by-law') || q.includes('by law') || q.includes('by-laws') || q.includes('bylaws')) {
        return {
          text: `### By-Laws\n\n**By-laws** are local laws and regulations enacted by local government authorities (Urban Councils or Rural District Councils) to govern conduct, maintain public health, and ensure order within a specific local community or municipality.\n\n#### Examples of By-Laws in Zimbabwe:\n- Anti-littering and waste disposal by-laws.\n- Vending and informal trade regulations in designated zones.\n- Noise pollution and nightclub curfew regulations.\n- Dog licensing and livestock control by-laws.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Governance & Law',
          suggestions: ['What is the difference between national laws and by-laws?', 'What are the consequences of breaking the law?', 'What is the role of the police and courts?']
        };
      }
      if (q.includes('consequences') || q.includes('breaking')) {
        return {
          text: `### Consequences of Breaking the Law\n\n1. **Arrest and Prosecution:** Being arrested by the Zimbabwe Republic Police (ZRP) and tried in court.\n2. **Fines and Community Service:** Being ordered to pay monetary fines or perform compulsory community service.\n3. **Imprisonment:** Loss of personal freedom through custodial jail sentences for serious crimes.\n4. **Criminal Record:** Gaining a permanent criminal record that ruins future employment and travel opportunities.\n5. **Social Dishonour:** Bringing shame and disgrace upon oneself and family (*Kunyadzisa mhuri*).`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Governance & Law',
          suggestions: ['What are the roles of the police and courts in enforcing the law?', 'Explain the importance of observing laws', 'Define by-laws']
        };
      }
      return {
        text: `### Observing Laws and Law Enforcement\n\n#### 1. Importance of Observing Laws\nObserving laws ensures peaceful coexistence, protects human lives and private property, maintains public safety, and prevents anarchy and crime.\n\n#### 2. Roles in Enforcing the Law\n- **Individual:** Voluntarily obeying the law and reporting crimes.\n- **Community:** Forming neighbourhood watch committees and protecting community infrastructure.\n- **Police (ZRP):** Investigating crimes, arresting offenders, and preserving peace.\n- **Courts (Judiciary):** Impartially interpreting laws and punishing lawbreakers.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Governance & Law',
        suggestions: ['Define by-laws', 'What are the consequences of breaking the law?', 'What is the indigenous court system?']
      };
    }

    // 7. Indigenous Court System (*Dare*)
    if (q.includes('indigenous court') || q.includes('traditional court') || q.includes('dare remusha') || q.includes('dare rasadunhu') || q.includes('dare ramambo')) {
      return {
        text: `### The Indigenous Court System (*Dare* / *Inkundla*)\n\nTraditional justice in Zimbabwe focuses on **restorative justice**, aiming to repair relationships, promote reconciliation, and award restitution (*kuripa*) rather than imprisonment.\n\n1. **Dare reMusha (Village Head's Court):**\n   - **Presiding Leader:** The **Village Head (*Sabhuku* / *Umlisa*)** assisted by village elders.\n   - **Jurisdiction:** Minor disputes within the village, such as petty boundary quarrels, family misunderstandings, and stray poultry.\n\n2. **Dare reSadunhu (Headman's Court):**\n   - **Presiding Leader:** The **Headman (*Sadunhu*)**.\n   - **Jurisdiction:** Appeals from village heads, communal grazing disputes, and land allocation issues across several villages.\n\n3. **Dare raMambo (Paramount Chief's Court - *Dare Guru*):**\n   - **Presiding Leader:** The **Paramount Chief (*Mambo* / *Induna*)** assisted by traditional assessors (*Machinda*).\n   - **Jurisdiction:** The highest customary court. Judged serious offenses like incest (*makunakuna*), desecrating sacred shrines, witchcraft claims, and inter-clan land disputes. Penalties require compensation in cattle or goats.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Indigenous Governance',
        suggestions: ['What are the roles of chiefs and headmen?', 'What is restorative justice?', 'What are the three arms of the central government?']
      };
    }

    // 8. Systems of Governance & Arms of Central Government
    if (q.includes('systems of governance') || q.includes('democracy and autocracy') || q.includes('arms of government') || q.includes('legislature') || q.includes('judiciary') || (q.includes('executive') && q.includes('government'))) {
      if (q.includes('democracy') || q.includes('autocracy') || q.includes('systems of governance')) {
        return {
          text: `### Systems of Governance: Democracy vs Autocracy\n\n- **Democracy:** Government of the people, by the people, and for the people. Citizens elect their leaders through regular, free, and fair elections; multiple political parties exist; the Constitution and human rights are respected.\n- **Autocracy:** A system of government where absolute power is concentrated in the hands of a single ruler or dictator without citizen participation or constitutional checks and balances.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Governance',
          suggestions: ['What are the three arms of government?', 'Explain the functions of the Legislature, Executive, and Judiciary', 'What is local government?']
        };
      }
      return {
        text: `### The Three Arms of the Central Government of Zimbabwe\n\n1. **The Legislature (Parliament):**\n   - Composed of the **Senate** and the **National Assembly**.\n   - **Function:** Debates national issues, scrutinizes government budgets, and makes/passes national laws.\n\n2. **The Executive:**\n   - Composed of the **President**, **Vice Presidents**, and the **Cabinet (Ministers)**.\n   - **Function:** Formulates national policies, runs government ministries, and executes/enforces laws passed by Parliament.\n\n3. **The Judiciary:**\n   - Composed of the **Chief Justice**, judges, and magistrates operating in the Constitutional Court, Supreme Court, High Court, and Magistrates' Courts.\n   - **Function:** Impartially interprets laws, resolves legal disputes, and administers justice.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Governance',
        suggestions: ['Compare democracy and autocracy', 'What is the role of local government?', 'What are the national symbols of Zimbabwe?']
      };
    }

    // 9. Age of Consent, Courtship & Marriage Counsellors
    if (q.includes('age of consent') || q.includes('marriage counsellor') || (q.includes('courtship') && q.includes('marriage'))) {
      if (q.includes('age of consent')) {
        return {
          text: `### Age of Consent to Sex and Marriage in Zimbabwe\n\n- Under Section 78 of the Constitution of Zimbabwe and the **Marriages Act of 2022**, the legal minimum age of consent to sex and marriage is **18 years**.\n- **Child Marriage Prohibition:** Any sexual relations or marriage involving a child below 18 years is a serious criminal offense punishable by long imprisonment.\n- **Importance:** Protects children from physical abuse, exploitation, and early health risks; ensures children complete primary and secondary education.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Courtship & Family Law',
          suggestions: ['What is the role of Tete and Sekuru in courtship?', 'What are indigenous marriage practices?', 'What are rites of passage?']
        };
      }
      return {
        text: `### Indigenous Courtship and Marriage Counsellors\n\n1. **Tete (Paternal Aunt):**\n   - The primary counsellor for girls; educates them on womanhood, personal hygiene, marital respect, and resolving domestic challenges.\n2. **Sekuru (Maternal Uncle):**\n   - The primary mentor for boys; advises them on manhood, family responsibilities, earning a living, and marriage conduct.\n3. **Munyai (Marriage Emissary / Go-Between):**\n   - An impartial family representative sent by the groom's family to lead respectful bride-price negotiations (*Roora/Lobola*).`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Courtship & Family Law',
        suggestions: ['What is the legal age of consent to marriage in Zimbabwe?', 'What are the traditional marriage practices?', 'What is the totem system?']
      };
    }

    // 10. Drug and Substance Abuse
    if (q.includes('drug and substance') || q.includes('drug abuse') || q.includes('substance abuse') || q.includes('mutoriro') || q.includes('broncleer') || q.includes('mbanje')) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Drug and Substance Abuse\n\n**Drug and substance abuse** is the harmful, habitual, or excessive use of illicit substances or the misuse of legal medications and chemicals for non-medical intoxication, leading to severe physical, mental, and social damage.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Health & Social Issues',
          suggestions: ['What drugs are commonly abused in Zimbabwe?', 'What are the effects of drug abuse on youth?', 'How can drug abuse be avoided?']
        };
      }
      if (decomp.asksOnlyCauses || q.includes('why young people')) {
        return {
          text: `### Reasons Young People Abuse Drugs and Substances\n\n1. **Negative Peer Pressure:** Wanting to fit in with friends or look "cool".\n2. **Stress and Depression:** Attempting to escape family problems, poverty, or emotional grief.\n3. **Boredom and Unemployment:** Lack of constructive recreational facilities and jobs.\n4. **Ignorance:** Misjudging the addictive power and deadly health dangers of substances.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Health & Social Issues',
          suggestions: ['What are the effects of drug abuse?', 'What substances are commonly abused in Zimbabwe?', 'How can young people avoid drug abuse?']
        };
      }
      if (decomp.asksOnlyEffects || q.includes('effects of drug')) {
        return {
          text: `### Effects of Drug and Substance Abuse\n\n- **Health Damage:** Brain damage, permanent mental psychosis (madness), liver and kidney failure, addiction, and overdose death.\n- **Academic & Social:** School dropouts, violent crime, family conflicts, theft, and homelessness.\n- **Transmission of Diseases:** Sharing unsterilized injection needles spreads HIV/AIDS and Hepatitis.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Health & Social Issues',
          suggestions: ['How can drug abuse be avoided?', 'What drugs are commonly abused in Zimbabwe?', 'Define drug abuse']
        };
      }
      return {
        text: `### Drug and Substance Abuse in Zimbabwe\n\n#### 1. Commonly Abused Substances\n- **Crystal Meth (*Mutoriro* / *Guka* / *Dombo*):** Highly addictive, dangerous stimulant.\n- **Cough Syrups Containing Codeine (*Broncleer* / *Bronco*):** Misused for sedative intoxication.\n- **Cannabis (*Mbanje* / Marijuana):** Hallucinogenic drug.\n- **Illicit Alcohol:** High-proof crude spirits (*Kachasu*, *Musombodhiya*).\n\n#### 2. Prevention & Support Systems\n- Firmly resisting negative peer pressure and saying **NO**.\n- Engaging in productive sports, arts, and youth clubs.\n- Seeking medical rehabilitation at specialized psychiatric units (e.g. Sally Mugabe Central Hospital, Ingutsheni Central Hospital).`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Health & Social Issues',
        suggestions: ['What are the causes of drug abuse?', 'What are the effects of drug abuse?', 'Define drug and substance abuse']
      };
    }

    // 11. First Aid in Emergencies
    if (q.includes('first aid') || (q.includes('emergency') && (q.includes('steps') || q.includes('drabc') || q.includes('precautions')))) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### First Aid\n\n**First Aid** is the immediate, temporary assistance and medical care given to an injured or suddenly ill person using readily available materials before professional medical personnel or an ambulance arrives.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Safety & First Aid',
          suggestions: ['What are the steps in dealing with an emergency (DRABC)?', 'What are the aims of First Aid?', 'What are emergency telephone numbers in Zimbabwe?']
        };
      }
      return {
        text: `### First Aid and Dealing with Emergencies\n\n#### 1. Aims of First Aid (The 3 Ps)\n1. **Preserve Life:** Keep the victim alive.\n2. **Prevent Condition from Worsening:** Avoid further injuries, infection, or bleeding.\n3. **Promote Recovery:** Relieve pain and reassure the patient.\n\n#### 2. Steps in an Emergency (The DRABC Plan)\n1. **D – Danger:** Check for danger to yourself and the victim (fire, falling objects, traffic).\n2. **R – Response:** Tap the victim\'s shoulders and ask loudly, "Are you okay?".\n3. **A – Airway:** Gently tilt the head back and lift the chin to open the airway.\n4. **B – Breathing:** Look, listen, and feel for breathing for 10 seconds.\n5. **C – Circulation:** Check pulse and apply firm direct pressure to control severe bleeding.\n\n#### 3. Emergency Contacts in Zimbabwe\n- **Police Emergency:** 995 / 999\n- **Ambulance:** 994\n- **Fire Brigade:** 993`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Safety & First Aid',
        suggestions: ['Define First Aid', 'What are the 3 Ps of First Aid?', 'What precautions should be taken when helping an injured person?']
      };
    }

    // 12. Topic 13 Religion: Indigenous Religion, Christianity, Islam, and Judaism
    if (
      q.includes('indigenous religion') ||
      q.includes('christianity') ||
      q.includes('islam') ||
      q.includes('judaism') ||
      q.includes('sacred day') ||
      q.includes('sacred place') ||
      q.includes('five pillars') ||
      q.includes('ten commandments') ||
      q.includes('religious artefact') ||
      q.includes('religious attire')
    ) {
      if (q.includes('five pillars') || (q.includes('pillars') && q.includes('islam'))) {
        return {
          text: `### The Five Pillars of Islam\n\n1. **Shahada:** Declaration of faith (*There is no god but Allah, and Muhammad is His messenger*).\n2. **Salah:** Performing five compulsory ritual prayers every day facing Mecca.\n3. **Zakat:** Giving compulsory charity to the poor and needy.\n4. **Sawm:** Fasting from dawn to sunset during the holy month of Ramadan.\n5. **Hajj:** Pilgrimage to the Holy City of Mecca at least once in a lifetime for those who are physically and financially able.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 13: Religion',
          suggestions: ['What are the sacred days in Islam, Christianity, and Judaism?', 'What are the Ten Commandments?', 'What are the sacred places in Indigenous religion?']
        };
      }
      if (q.includes('sacred day') || q.includes('sacred days')) {
        return {
          text: `### Sacred Days in the Four Major Religions\n\n- **Indigenous Religion:** **Chisi** (traditional resting day during which cultivating crops or digging soil is strictly prohibited out of reverence for the land and spirits).\n- **Christianity:** **Sunday** (or **Saturday** for Seventh-day Adventists) dedicated to congregational worship, prayer, and rest.\n- **Islam:** **Friday (*Jummah*)** when Muslims gather at the mosque for special afternoon congregational prayers and sermon.\n- **Judaism:** **Shabbat (Sabbath)** from Friday sunset to Saturday night, dedicated to rest, family meals, and synagogue worship.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 13: Religion',
          suggestions: ['What are sacred places in the four religions?', 'What are the food laws in the four religions?', 'What are the Five Pillars of Islam?']
        };
      }
      if (q.includes('sacred place') || q.includes('sacred places')) {
        return {
          text: `### Sacred Places in the Four Major Religions\n\n- **Indigenous Religion:** **Njelele Shrine** in Matobo Hills, sacred mountains, sacred pools, and natural caves.\n- **Christianity:** Churches, cathedrals, and **Jerusalem** (where Jesus lived, died, and resurrected).\n- **Islam:** **Mecca (The Kaaba)**, Medina, and local Mosques (*Masjid*).\n- **Judaism:** The **Western Wall** in Jerusalem and local Synagogues (*Shul*).`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 13: Religion',
          suggestions: ['What are the sacred days in the four religions?', 'What are the religious artefacts in the four religions?', 'What are the food laws in the four religions?']
        };
      }
      return {
        text: `### Overview of the Four Major Religions in Zimbabwe\n\n1. **Indigenous Religion:** Belief in one Supreme Creator (**Mwari / uMlimu**); sacred day is **Chisi**; sacred place is **Njelele**; ceremonies include **Mukwerera** (rainmaking) and **Kurova Guva**; teachings center on **Unhu/Ubuntu** and respecting ancestors.\n2. **Christianity:** Belief in One God in Trinity; sacred day is **Sunday** (or Saturday); sacred place is **Church**; holy book is the **Bible**; founded on Jesus Christ and the **Ten Commandments**.\n3. **Islam:** Belief in **Allah**; Prophet Muhammad (PBUH); sacred day is **Friday (*Jummah*)**; holy book is the **Quran**; guided by the **Five Pillars of Islam**; food law is **Halal**.\n4. **Judaism:** Belief in One God (**Yahweh**); sacred day is **Shabbat**; holy book is the **Torah**; place of worship is the **Synagogue**; food law is **Kosher**.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 13: Religion',
        suggestions: ['What are the Five Pillars of Islam?', 'What are the sacred days in the four religions?', 'What are the food laws in the four religions?']
      };
    }

    // 13. Voluntary Work and Social Services
    if (q.includes('voluntary work') || q.includes('volunteerism') || q.includes('humanitarian') || q.includes('jairos jiri') || q.includes('social services in zimbabwe') || q.includes('social welfare')) {
      if (decomp.asksOnlyDefinition) {
        return {
          text: `### Voluntary Work (Volunteerism)\n\n**Voluntary work** is the selfless service of offering one's time, skills, and labor to assist needy, vulnerable, or disadvantaged people in the community without expecting monetary pay or material reward.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 14: Social Services',
          suggestions: ['Identify prominent humanitarian organisations in Zimbabwe', 'What are the benefits of voluntary work?', 'What is the role of the Department of Social Welfare?']
        };
      }
      return {
        text: `### Voluntary and Humanitarian Organisations in Zimbabwe\n\n1. **The Zimbabwe Red Cross Society:** Provides first aid training, emergency disaster relief (cyclones, floods), and community healthcare.\n2. **Jairos Jiri Association:** Founded by philanthropist Jairos Jiri in Bulawayo in 1950; provides vocational skills, education, and shelter for persons with physical and intellectual disabilities.\n3. **Matthew Rusike Children's Home:** Founded in Epworth by Methodist Minister Rev. Matthew Rusike; cares for orphaned and abandoned children.\n4. **Childline Zimbabwe:** A free, confidential 24-hour telephone helpline protecting children against abuse and neglect.\n5. **Government Social Welfare:** Distributes drought relief food and funds school fees through BEAM (Basic Education Assistance Module).`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 14: Social Services',
        suggestions: ['Define voluntary work', 'What are the benefits of volunteerism?', 'Who founded the Jairos Jiri Association?']
      };
    }

    // 14. National Symbols of Zimbabwe
    if (
      q.includes('national flag') ||
      q.includes('flag of zimbabwe') ||
      q.includes('colours of the flag') ||
      q.includes('colors of the flag') ||
      q.includes('zimbabwe bird') ||
      q.includes('hungwe') ||
      q.includes('national anthem') ||
      q.includes('coat of arms') ||
      q.includes('national symbols') ||
      q.includes('national symbol')
    ) {
      if (q.includes('flag') && !q.includes('all') && !q.includes('symbols')) {
        return {
          text: `### The National Flag of Zimbabwe\n\nThe Zimbabwe National Flag has 5 colours:\n- **Green:** Agriculture, lush vegetation, and rich arable land.\n- **Yellow / Gold:** Mineral wealth (gold, platinum, chrome, diamonds).\n- **Red:** The blood of gallant heroes shed during the First and Second Chimurenga.\n- **Black:** The indigenous African black majority.\n- **White Triangle:** Peace, tranquility, and national harmony.\n- **Red Star:** High national aspirations and international peace.\n- **Zimbabwe Bird (Hungwe):** National emblem representing sovereignty and ancestral origin at Great Zimbabwe.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • National Symbols',
          suggestions: ['What does the Zimbabwe Bird represent?', 'What is the National Anthem of Zimbabwe?', 'What is the motto on the Coat of Arms?']
        };
      }
      if (q.includes('bird') || q.includes('hungwe')) {
        return {
          text: `### The Zimbabwe Bird (Hungwe)\n\nThe **Zimbabwe Bird (Hungwe / Bateleur Eagle)** is the official national emblem of Zimbabwe. Originally carved out of soapstone at **Great Zimbabwe**, it represents national sovereignty, ancestral history, and cultural heritage.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • National Symbols',
          suggestions: ['What are the colours of the Zimbabwe National Flag?', 'What is the National Anthem of Zimbabwe?', 'What is the motto on the Coat of Arms?']
        };
      }
      if (q.includes('anthem')) {
        return {
          text: `### The National Anthem of Zimbabwe\n\nThe National Anthem is "**Simudzai Mureza Wedu weZimbabwe**" (ChiShona) / "**Kalibusiswe Ilizwe leZimbabwe**" (IsiNdebele) / "Blessed be the Land of Zimbabwe". It was composed by **Professor Solomon Mutswairo** and is sung standing at attention as a mark of national honor.`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • National Symbols',
          suggestions: ['What are the colours of the Zimbabwe National Flag?', 'What does the Zimbabwe Bird represent?', 'What is the motto on the Coat of Arms?']
        };
      }
      if (q.includes('coat of arms')) {
        return {
          text: `### The Zimbabwe Coat of Arms\n\n- Supported by two **Kudus** (symbolizing the unity of Zimbabwe\'s diverse ethnic groups).\n- Features a **hoe and automatic rifle** crossed behind the shield (symbolizing the transition from war to agricultural production and defense of sovereignty).\n- National Motto: "**Unity, Freedom, Work**".`,
          sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • National Symbols',
          suggestions: ['What are the colours of the National Flag?', 'What does the Zimbabwe Bird represent?', 'What is the National Anthem?']
        };
      }
      return {
        text: `### National Symbols of Zimbabwe\n\n1. **The National Flag:** Green (vegetation), Yellow (minerals), Red (blood of liberation heroes), Black (indigenous majority), White triangle (peace), Red Star (aspirations), and Zimbabwe Bird.\n2. **The Zimbabwe Bird (Hungwe):** National emblem carved from soapstone at Great Zimbabwe.\n3. **The National Anthem:** "*Simudzai Mureza Wedu weZimbabwe*" written by Prof. Solomon Mutswairo.\n4. **The Coat of Arms:** Supported by two Kudus, featuring a hoe and rifle under the motto: "*Unity, Freedom, Work*".`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • National Symbols',
        suggestions: ['Explain the colours of the National Flag', 'What is the National School Pledge?', 'What are the national celebrations in Zimbabwe?']
      };
    }

    // 15. Unhu / Ubuntu / Vumunhu Philosophy
    if (q.includes('unhu') || q.includes('ubuntu') || q.includes('vumunhu')) {
      return {
        text: `### Unhu / Ubuntu / Vumunhu\n\n**Unhu / Ubuntu** is the foundational African philosophy and moral code that asserts: "**A person is a person through other people**" (*Munhu munhu nevanhu* / *Umuntu ngumuntu ngabantu*).\n\n#### Core Principles of Unhu / Ubuntu:\n1. **Ruremekedzo / Inhlonipho (Respect):** Showing utmost respect to parents, elders, teachers, and peers.\n2. **Kutendeka (Honesty and Integrity):** Being truthful, reliable, and refraining from theft or deception.\n3. **Kubatsirana (Communal Solidarity):** Helping neighbours in times of bereavement, farming (*Nhimbe / Ilima*), or distress.\n4. **Kugamuchira Vaenzi (Hospitality):** Welcoming strangers and sharing food generously.\n5. **Kunyara (Decency and Self-Discipline):** Dressing decently, using polite language, and avoiding shameful misconduct.`,
        sourceTag: 'ZIMSEC Grade 7 Heritage and Social Studies 7050 • Culture & Values',
        suggestions: ['What is the totem system?', 'What are the characteristics of ideal marital relationships?', 'What is the National School Pledge?']
      };
    }

    return null;
  }

  /**
   * Primary Physical Education & Arts Curriculum: PE, VPA, Mass Displays (ZIMSEC 7130)
   * High-accuracy engine covering Traditional Games, Indigenous Dances, Visual Arts, and Fitness
   */
  private static handlePrimaryPhysicalEduArtsQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const q = question.toLowerCase();
    const decomp = this.decomposeQuestion(question);

    // 1. Pada (Traditional Hopscotch)
    if (q.includes('pada')) {
      return {
        text: `### Pada (Traditional Hopscotch)\n\n**Pada** is an indigenous Zimbabwean hopping game where a player tosses a marker (*chidonha*) into numbered grid boxes drawn on flat ground and hops on one foot through the courts without stepping on the boundary lines.\n\n- **Physical Benefits:** Improves single-leg balance, lower limb strength, spatial awareness, and motor coordination.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Games',
        suggestions: ['What is Nhodo and how is it played?', 'What is Tsoro Yemutwve?', 'What are the traditional dances of Zimbabwe?']
      };
    }

    // 2. Nhodo (Stone Catching Game)
    if (q.includes('nhodo')) {
      return {
        text: `### Nhodo (Stone-Catching Game)\n\n**Nhodo** is an indigenous Zimbabwean game played around a shallow circular pit (*chikomba*) containing 10–20 small round pebbles. A player tosses a larger stone (*gora*) upward into the air, scoops out the required number of pebbles from the pit with one hand, and catches the falling gora before it hits the ground.\n\n- **Physical & Cognitive Benefits:** Develops hand-eye coordination, rapid finger reflexes, concentration, and mental counting skills.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Games',
        suggestions: ['What is Pada and how is it played?', 'What is Tsoro Yemutwve?', 'What are the traditional dances of Zimbabwe?']
      };
    }

    // 3. Tsoro Yemutwve (Strategic Board Game)
    if (q.includes('tsoro')) {
      return {
        text: `### Tsoro Yemutwve (Traditional Board Game)\n\n**Tsoro Yemutwve** is an ancient indigenous Zimbabwean strategy board game (African Chess) played on 4 parallel rows of holes scooped into the ground or carved on a wooden board, using pebbles or seeds as playing counters.\n\n- **Cognitive Benefits:** Sharpens mental arithmetic, logical reasoning, forward strategic planning, and patience.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Games',
        suggestions: ['What is Nhodo?', 'What is Pada?', 'What are the traditional dances of Zimbabwe?']
      };
    }

    // 4. Mbende / Jerusarema Dance
    if (q.includes('mbende') || q.includes('jerusarema')) {
      return {
        text: `### Mbende / Jerusarema Dance\n\n**Mbende / Jerusarema** is a celebratory traditional dance of the Zezuru Shona people originating from **Murehwa and Uzumba-Maramba-Pfungwe (UMP)** in Mashonaland East.\n\n- **Characteristics:** Fast-paced polyrhythmic drumming (*ngoma*), wooden clappers, acrobatic leaps, and energetic sensual hip movements.\n- **UNESCO Status:** Proclaimed a **UNESCO Masterpiece of the Oral and Intangible Heritage of Humanity** in 2005.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Dance',
        suggestions: ['What is the Muchongoyo dance?', 'What is Isitshikitsha dance?', 'What is Shona stone sculpture?']
      };
    }

    // 5. Muchongoyo Dance
    if (q.includes('muchongoyo')) {
      return {
        text: `### Muchongoyo Dance\n\n**Muchongoyo** is a traditional military war and victory dance of the **Ndau and Shangani people of Chipinge and Chiredzi (Manicaland and Masvingo)**.\n\n- **Characteristics:** Dancers hold cowhide shields (*zvinhoo*) and knobkerries, stamping their feet forcefully on the ground in unison to heavy drumbeats.\n- **Purpose:** Historically performed to prepare warriors for battle and celebrate battlefield victories; now performed at major cultural festivals and national celebrations.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Dance',
        suggestions: ['What is the Mbende / Jerusarema dance?', 'What is Isitshikitsha dance?', 'What is the Mhande dance?']
      };
    }

    // 6. Isitshikitsha Dance
    if (q.includes('isitshikitsha')) {
      return {
        text: `### Isitshikitsha Dance\n\n**Isitshikitsha** is a traditional royal and ceremonial dance of the **Ndebele people of Matabeleland (Bulawayo)**.\n\n- **Characteristics:** Rhythmic hand-clapping, graceful foot stamping, choral harmonies, and sweeping arm gestures.\n- **Occasions:** Performed at weddings, royal installations, first-fruit ceremonies (*Inxwala*), and community celebrations.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Dance',
        suggestions: ['What is the Amabhiza dance?', 'What is the Muchongoyo dance?', 'What is Mbende / Jerusarema?']
      };
    }

    // 7. Amabhiza Dance
    if (q.includes('amabhiza')) {
      return {
        text: `### Amabhiza Dance\n\n**Amabhiza** is a traditional dance of the **Kalanga people of Matabeleland South (Plumtree and Bulilima-Mangwe)**.\n\n- **Characteristics:** Dancers wear horse-tail regalia and mimic the galloping, trotting, and high-stepping movements of horses to fast-tempo drumming.\n- **Occasions:** Performed during rainmaking ceremonies (*Mayile*) and cultural harvest celebrations.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Dance',
        suggestions: ['What is Isitshikitsha dance?', 'What is Mhande dance?', 'What is the Muchongoyo dance?']
      };
    }

    // 8. Mhande Dance
    if (q.includes('mhande')) {
      return {
        text: `### Mhande Dance\n\n**Mhande** is a sacred rainmaking ritual dance of the **Karanga people of Masvingo and the Midlands provinces**.\n\n- **Characteristics:** Performed with dried gourd leg rattles (*magagada*) strapped to dancers\' shins that rustle with each slow, solemn step.\n- **Occasions:** Performed during the *Mutoro* ceremony to petition God (*Mwari*) and ancestral spirits for rainfall and fertile harvests.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Dance',
        suggestions: ['What is Mbende / Jerusarema?', 'What is Muchongoyo dance?', 'What are traditional musical instruments of Zimbabwe?']
      };
    }

    // 9. Traditional Indigenous Musical Instruments
    if (
      q.includes('indigenous musical instruments') ||
      q.includes('traditional musical instruments') ||
      q.includes('traditional instruments') ||
      q.includes('mbira') ||
      q.includes('hosho') ||
      q.includes('ngoma') ||
      q.includes('chipendani')
    ) {
      if (decomp.asksOnlyDefinition && q.includes('mbira')) {
        return {
          text: `### Mbira (Thumb Piano)\n\n**Mbira** is a sacred Zimbabwean musical instrument consisting of metal keys (lamellae) affixed to a hardwood soundboard, placed inside a dried calabash gourd resonator (*deze*) lined with bottle tops or shells to produce a buzzing sound. It is played at spiritual ceremonies (*Bira*) and national celebrations.`,
          sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Music',
          suggestions: ['What is the Hosho?', 'What are the traditional dances of Zimbabwe?', 'Name indigenous musical instruments of Zimbabwe']
        };
      }

      return {
        text: `### Indigenous Musical Instruments of Zimbabwe\n\n1. **Mbira (Thumb Piano):** Sacred plucked lamellophone with metal keys mounted on wood and resonated in a calabash (*deze*); played at *Bira* ceremonies.\n2. **Hosho (Gourd Rattles):** Dried hollow gourds filled with wild canna seeds (*hota*) that provide the rhythmic driving pulse for mbira music.\n3. **Ngoma (Traditional Drums):** Carved hollow wooden drums covered with cowhide or goat skin, played with bare hands or drumsticks.\n4. **Chipendani & Mukube (Mouth Bows):** Single-string musical bows using the player\'s mouth cavity as an acoustic resonator.\n5. **Magagada / Magavhu (Leg Rattles):** Dried seed pods tied around dancers\' ankles that rustle rhythmically with footsteps.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Music',
        suggestions: ['What is the Mbira?', 'What is the Mbende / Jerusarema dance?', 'What is Shona stone sculpture?']
      };
    }

    // 10. Shona Stone Sculpture
    if (q.includes('shona sculpture') || q.includes('stone sculpture')) {
      return {
        text: `### Shona Stone Sculpture\n\n**Shona stone sculpture** is an internationally acclaimed Zimbabwean art movement where artists hand-carve local metamorphic rocks into expressive human, spiritual, and animal forms.\n\n- **Rocks Used:** Serpentine, Springstone, Opal stone, Soapstone, and Leopard rock.\n- **Famous Centres:** Chitungwiza Arts Centre and Tengenenge Sculpture Community (Guruve).\n- **Pioneering Sculptors:** Nicholas Mukomberanwa, Bernard Matemera, Henry Munyaradzi, and Dominic Benhura.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Visual Arts',
        suggestions: ['What is traditional pottery in Zimbabwe?', 'What are Tonga Binga baskets?', 'What are the traditional dances of Zimbabwe?']
      };
    }

    // 11. Traditional Pottery (Hari)
    if (q.includes('pottery') || q.includes('chirongo') || q.includes('gate') || q.includes('hari')) {
      return {
        text: `### Traditional Zimbabwean Pottery (*Kuumba Hari*)\n\nTraditional clay pots (*hari*) are molded by hand from natural clay, smoothed, sun-dried, and fired in open kilns:\n\n1. **Chirongo:** A slender-necked clay pot designed to keep drinking water naturally cool.\n2. **Gate:** A very large, wide-mouthed clay pot used for brewing and fermenting traditional seven-day sorghum beer (*doro remukwerera*).\n3. **Hadjana / Tsambakonzi:** Medium-sized pot used for cooking meat or vegetable relishes (*muriwo / usavi*).\n4. **Pfuko / Rongo:** Small pot with a spout used for storing and drinking sweet non-alcoholic mahewu.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Visual Arts & Crafts',
        suggestions: ['What is Shona stone sculpture?', 'What are Tonga Binga baskets?', 'What is Pada?']
      };
    }

    // 12. Tonga (Binga) Baskets
    if (q.includes('basket') || q.includes('binga')) {
      return {
        text: `### Tonga (Binga) Baskets\n\n**Tonga / Binga baskets** are famous hand-woven traditional baskets made by Tonga women in Binga (Matabeleland North) using stripped wild **ilala palm fronds**.\n\n- **Patterns & Function:** Featuring distinctive cream and brown geometric spider-web patterns, they were traditionally used as winnowing baskets (*tswanda*) to separate grain from chaff and are now celebrated globally as wall art.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Visual Arts & Crafts',
        suggestions: ['What is traditional pottery in Zimbabwe?', 'What is Shona stone sculpture?', 'What is Isitshikitsha dance?']
      };
    }

    // 13. Warm-Up in Sports & PE
    if (q.includes('warm-up') || q.includes('warm up')) {
      return {
        text: `### Importance of Warming Up Before Exercise\n\n**Warming up** is a series of light physical exercises and stretches performed before strenuous athletic activity.\n\n- **Why Warming Up is Important:**\n  1. **Increases Blood Circulation:** Dilates blood vessels, pumping oxygen-rich blood to active muscles.\n  2. **Raises Core Temperature:** Warms muscles, making them more pliable and elastic.\n  3. **Lubricates Joints:** Stimulates synovial fluid production, increasing joint flexibility and range of motion.\n  4. **Prevents Injuries:** Dramatically reduces the risk of muscle tears, ligament sprains, and cramps.\n  5. **Mental Readiness:** Focuses the athlete\'s mind on the upcoming sporting task.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Education Syllabus 7130 • Fitness & Safety',
        suggestions: ['Why is cooling down important after exercise?', 'What are the four components of physical fitness?', 'What is water safety?']
      };
    }

    // 14. Cool-Down in Sports & PE
    if (q.includes('cool-down') || q.includes('cool down')) {
      return {
        text: `### Importance of Cooling Down After Exercise\n\n**Cooling down** is a period of gentle aerobic exercise (like slow jogging or walking) followed by static stretching performed immediately after vigorous physical exertion.\n\n- **Why Cooling Down is Important:**\n  1. **Removes Lactic Acid:** Gradually flushes out waste lactic acid from tired muscles, preventing post-exercise muscle stiffness and soreness.\n  2. **Prevents Blood Pooling & Dizziness:** Keeps blood circulating so it does not pool in the lower extremities, preventing fainting and dizziness.\n  3. **Restores Resting Heart Rate:** Gradually brings heart rate and breathing back down to resting baseline levels.\n  4. **Calms the Nervous System:** Relaxes contracted muscles and restores muscle length.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Education Syllabus 7130 • Fitness & Safety',
        suggestions: ['Why is warming up important before sports?', 'What are the components of physical fitness?', 'What is water safety in swimming?']
      };
    }

    // 15. Components of Physical Fitness
    if (q.includes('components of fitness') || q.includes('physical fitness')) {
      return {
        text: `### Components of Physical Fitness\n\n1. **Cardiovascular Endurance:** The ability of the heart and lungs to supply oxygen to working muscles during sustained exercise (tested by long-distance running).\n2. **Muscular Strength:** The maximal force a muscle or muscle group can exert against a resistance in a single effort (e.g. shot put, weight lifting).\n3. **Muscular Endurance:** The ability of muscles to perform repeated contractions over a prolonged period without fatigue (e.g. push-ups, sit-ups).\n4. **Flexibility:** The range of motion available around a joint or group of joints (e.g. gymnastics, hurdling stretch).\n5. **Coordination & Agility:** The ability to change body direction rapidly and smoothly under control (e.g. football dribbling, tennis).`,
        sourceTag: 'ZIMSEC Grade 7 Physical Education Syllabus 7130 • Fitness & Health',
        suggestions: ['Why is warming up important?', 'Why is cooling down important?', 'What are the traditional games of Zimbabwe?']
      };
    }

    // 16. Body Organs Storing and Transporting Food, Air, and Blood
    if (
      (q.includes('storing') || q.includes('transporting') || q.includes('store') || q.includes('transport')) &&
      (q.includes('food') || q.includes('air') || q.includes('blood'))
    ) {
      return {
        text: `### Body Organs Storing and Transporting Food, Air, and Blood\n\n1. **Organs Storing and Transporting Food:**\n   - **Stomach:** Temporarily stores ingested food for 2 to 4 hours while churning and digesting it with gastric acid.\n   - **Esophagus (Gullet):** Transports food boluses from the mouth to the stomach via peristalsis.\n   - **Small & Large Intestines:** Transport digesting food and absorb soluble nutrients and water into the blood.\n\n2. **Organs Storing and Transporting Air:**\n   - **Trachea (Windpipe) & Bronchi:** Tubes that transport inhaled oxygen into the lungs and exhaled carbon dioxide out.\n   - **Lungs & Alveoli:** The lungs store air temporarily during inhalation; alveoli transfer oxygen into blood capillaries and receive carbon dioxide.\n\n3. **Organs Storing and Transporting Blood:**\n   - **Heart:** Muscular 4-chambered pump that continuously circulates blood throughout the body.\n   - **Arteries, Veins & Capillaries:** Blood vessels that transport blood to and from organs (arteries carry blood away from heart; veins return blood to heart).\n   - **Spleen:** Stores a reserve of blood cells for release during emergencies.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Education Syllabus 7130 • Human Anatomy & Physiology',
        suggestions: ['What is the circulatory system?', 'What are the parts of the respiratory system?', 'What are the parts of the digestive system?']
      };
    }

    // 17. Theatre, Blocking & Stage Areas
    if (q.includes('blocking') || q.includes('stage areas') || q.includes('theatre') || q.includes('stage positions')) {
      return {
        text: `### Theatre: Stage Areas and Blocking\n\n- **What is Blocking?** **Blocking** is the precise staging and recorded positioning of actors on stage by the theatre director to ensure clear sightlines and dramatic focus.\n\n- **The Nine Standard Stage Areas (Actor\'s Perspective Facing the Audience):**\n  1. **Upstage (US):** The back of the stage away from the audience.\n  2. **Downstage (DS):** The front of the stage closest to the audience.\n  3. **Center Stage (CS):** The exact middle of the acting area.\n  4. **Stage Left (SL):** The actor\'s left side when facing the audience.\n  5. **Stage Right (SR):** The actor\'s right side when facing the audience.\n  6. **Upstage Left (USL), Upstage Right (USR), Downstage Left (DSL), Downstage Right (DSR).`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Theatre & Drama',
        suggestions: ['What is Shona stone sculpture?', 'What are traditional dances of Zimbabwe?', 'What is Pada?']
      };
    }

    return null;
  }

  /**
   * Dedicated Grade 7 Heritage-Based Curriculum (HBC) Line-by-Line Handler
   * Directly resolves questions matching any line or objective in the Grade 7 HBC syllabus
   */
  private static handleGrade7HbcLineByLineQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const qLower = question.toLowerCase().trim();

    // Do not intercept if question is asking for detailed multi-step comparison or math calculation
    if (
      qLower.includes('calculate') ||
      qLower.includes('solve') ||
      qLower.includes('how many subjects') ||
      qLower.includes('units 1 to 9') ||
      qLower.includes('grading system')
    ) {
      return null;
    }

    const entry = KnowledgeStore.lookupGrade7HbcQuestion(question);
    if (!entry) return null;

    return {
      text: entry.answer,
      sourceTag: `ZIMSEC Grade 7 HBC • ${entry.section}`,
      suggestions: [
        `What are the key points to remember about ${entry.topic}?`,
        `How is ${entry.topic} examined in Grade 7 ZIMSEC?`,
        `Give an example of a past exam question on this topic`
      ]
    };
  }

  /**
   * Directly resolves questions matching the Cambridge IGCSE / ZIMSEC O-Level Biology (0610 / 4025) Past Papers & Notes
   * Covers all 10 core & extension chapters from the official 112-page document.
   */
  private static handleOLevelBiologyPastPaperQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const entry = KnowledgeStore.lookupOLevelBiologyQuestion(question);
    if (!entry) return null;

    return {
      text: entry.answer,
      sourceTag: `Cambridge (0610) & ZIMSEC O-Level Biology • ${entry.topic}`,
      suggestions: [
        `What are other past paper questions on ${entry.topic}?`,
        `Explain the key experimental procedure for this topic`,
        `How is this examined in Paper 1 and Paper 2?`
      ]
    };
  }

  /**
   * Universal Glossary & Terminology Dispatcher
   * Provides laser-focused single-intent definitions across all education levels (Primary, O-Level, A-Level)
   * Prevents syllabus dumping; returns precisely what was asked.
   */
  private static handleUniversalGlossaryQuery(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult | null {
    const qLower = question.toLowerCase().trim();

    // Do not intercept if question is asking for detailed multi-step comparison, math calculation, or exam breakdown
    if (
      qLower.includes('difference between') ||
      qLower.includes(' versus ') ||
      qLower.includes(' vs ') ||
      qLower.includes('calculate') ||
      qLower.includes('solve') ||
      qLower.includes('how many subjects') ||
      qLower.includes('units 1 to 9') ||
      qLower.includes('grading system')
    ) {
      return null;
    }

    const entry = KnowledgeStore.lookupGlossaryTerm(question);
    if (!entry) return null;

    const heading = entry.term;
    const subjectBadge = entry.subject && !entry.subject.startsWith('Section') && entry.subject !== 'General'
      ? ` [${entry.subject}]`
      : '';

    const text = `### ${heading}${subjectBadge}\n\n${entry.definition}`;

    return {
      text,
      sourceTag: `ZIMSEC ${level} Curriculum Glossary`,
      suggestions: [
        `Give an example of ${entry.canonicalName}`,
        `What are the key points to remember about ${entry.canonicalName}?`,
        `How is ${entry.canonicalName} examined in ZIMSEC?`
      ]
    };
  }

  /**
   * Generates authentic, question-tailored responses in ChiShona
   */
  private static generateShonaResponse(
    question: string,
    level: string,
    intent: QuestionIntent,
    matchedChunk?: any
  ): SynthesisResult {
    const qLower = question.toLowerCase();

    // 0. Universal Glossary check for ChiShona terms and definitions (e.g., Chiito, Chipauro, Tsumo, Madimikira, etc.)
    const shonaGlossaryResult = this.handleUniversalGlossaryQuery(question, level, intent);
    if (shonaGlossaryResult) {
      return shonaGlossaryResult;
    }

    // Mutungamiri weZimbabwe / Hurumende (Emmerson Mnangagwa, Canaan Banana, Robert Mugabe)
    if (
      qLower.includes('mutungamiri') ||
      qLower.includes('hurumende') ||
      qLower.includes('vatevedzeri') ||
      qLower.includes('chiwenga') ||
      qLower.includes('mnangagwa') ||
      (qLower.includes('ani') && (qLower.includes('zimbabwe') || qLower.includes('kutonga')))
    ) {
      return {
        text: `### Nhoroondo neHurumende: Mutungamiri weNyika yeZimbabwe

**Mhinduro Yakajeka:** Pari zvino, Mutungamiri weNyika yeZimbabwe (Head of State, Head of Government, and Commander-in-Chief of the Zimbabwe Defence Forces) ndi**VaEmmerson Dambudzo Mnangagwa**, vakatanga kutonga musi wa**24 Mbudzi 2017** vachitungamira Hurumende yeSecond Republic.

1. Nhoroondo yeVatungamiri veZimbabwe kubva muna 1980:
- **Rev. Canaan Sodindo Banana (1980 – 1987):** Mutungamiri weNyika wekutanga (Ceremonial President) pasi pebumbiro reLancaster House, apo Cde Robert Mugabe vaive Prime Minister vane masimba ekutonga hurumende.
- **Cde Robert Gabriel Mugabe (1987 – 2017):** Mutungamiri wekutanga aive nemasimba ose (Executive President) zvichitevera chibvumirano cheUnity Accord che1987. (Vaive Prime Minister kubva 1980 kusvika 1987). Vakasendeka masimba pasi muna Mbudzi 2017.
- **Cde Emmerson Dambudzo Mnangagwa (2017 – Parizvino):** Mutungamiri weSecond Republic ari kutonga parizvino, vakasarudzwa zvakare musarudzo dza2018 nedza2023.

2. Vatevedzeri veMutungamiri weNyika Parizvino:
- **Mutevedzeri weKutanga:** General (Rtd) Dr. Constantino Guveya Chiwenga.
- **Mutevedzeri wePiri:** Cde Kembo Mohadi.

3. Dzidziso neMaitiro eHurumende yeSecond Republic:
- *"Nyika inovakwa nevene vayo / Ilizwe lakhiwa ngabanikazi balo"*.
- *"Kusasiya munhu kana nzvimbo kumashure"* (Leaving no one and no place behind).
- **Chiono che2030 (Vision 2030):** Kusimudzira Zimbabwe kuva nyika ine upfumi huri pakati nepakati pamberi pegore ra2030.
- **Mari yeNyika:** Zimbabwe Gold (ZiG) inotsigirwa negoridhe nemaminerari ari mumatura eReserve Bank of Zimbabwe.`,
        sourceTag: 'ZIMSEC Nhoroondo • Vatungamiri neHurumende yeZimbabwe',
        suggestions: [
          'Canaan Banana aive ani?',
          'Cde Robert Mugabe vaive ani?',
          'Dr. Joshua Nkomo vaive ani?',
          'Chii chinonzi Unity Accord ye1987?'
        ]
      };
    }

    // Robert Mugabe in ChiShona
    if (qLower.includes('mugabe') || qLower.includes('mufabe')) {
      if (qLower.includes('minda') || qLower.includes('land') || qLower.includes('kurima')) {
        return {
          text: `### Nhoroondo: Cde Robert Mugabe neChirongwa cheKugoverwa kweMinda (2000)

1. Zvikonzero zveKugoverwa kweMinda:
- Kudzosa Ivhu: Mitemo yevachena yakaita seLand Apportionment Act ye1930 yaive yatorera vatema ivhu rakanaka ichivakanda kumaruzevha asina mvura.
- Kupera kweLancaster House: Mitemo yakabvumiranwa muna 1980 yekuti ivhu ritengwe nemunhu anoda kutengesa yakange yapera.
- Hurumende yeBritain: Mutungamiri weBritain Tony Blair akaramba kupa mari yekubatsira kutenga minda.

2. Nzira dzeKugoverwa kweMinda (Models):
- Model A1: Yaikurudzira kupa mhuri dzevatema nzvimbo diki dzekurima (mahekita 5–6) pamwe nemafuro emombe akabatanidzwa.
- Model A2: Yaikurudzira vanhu vane ruzivo rwekurima zvekutengesa (commercial farming) semafuro makuru, fodya, nechibage.`,
          sourceTag: 'ZIMSEC Nhoroondo • Chirongwa cheKugoverwa kweMinda',
          suggestions: [
            'Chii chakaitika paUnity Accord ye1987?',
            'Cde Robert Mugabe vaive ani?',
            'Zvakaitika muhondo yeChimurenga chepiri'
          ]
        };
      }

      return {
        text: `### Nhoroondo: Cde Robert Gabriel Mugabe (1924 – 2019)

1. Upenyu neDzidzo:
- Vakazvarwa musi wa21 Kukadzi 1924 kuKutama Mission mudunhu reZvimba.
- Vakadzidza paKutama College nepamusoro paFort Hare University muSouth Africa, vachidzidzisawo kuZambia neGhana kwavakafemerwa naKwame Nkrumah.

2. Basa muHondo yeChimurenga chePiri:
- Vakavambidzana bato reZANU muna 1963 muHighfield, Harare.
- Vakasungwa vakagara mutirongo kwemakore 10 (1964–1974) nehurumende yaIan Smith.
- Vakayambukira kuMozambique vakatungamira uto reZANLA muhondo yeChimurenga, ndokutungamira nhaurirano dzekuwana rusununguko kuLancaster House muna 1979.

3. Mutungamiri weZimbabwe:
- Vakasarudzwa kuva Mutungamiri weHurumende wekutanga (Prime Minister) musi wa18 Kubvumbi 1980, vachizivisa mutemo wekuyananisa vanhu (reconciliation).
- Vakasaina chibvumirano cheUnity Accord musi wa22 Zvita 1987 pamwe chete naDr. Joshua Nkomo, ndokugadza ZANU-PF vachiva Executive President.
- Mugore ra2000, vakaparura chirongwa chekudzosa ivhu kuvatema (Fast-Track Land Reform).`,
        sourceTag: 'ZIMSEC Nhoroondo • Vatungamiri veZimbabwe',
        suggestions: [
          'Chirongwa chekugoverwa kweminda chakafamba sei?',
          'Dr. Joshua Nkomo vaive ani?',
          'Chii chinonzi Unity Accord ye1987?'
        ]
      };
    }

    // Joshua Nkomo in ChiShona
    if (qLower.includes('nkomo') || qLower.includes('father zimbabwe') || qLower.includes('chibwechitedza')) {
      return {
        text: `### Nhoroondo: Dr. Joshua Mqabuko Nkomo ("Father Zimbabwe") (1917 – 1999)

- Baba veRusununguko: Vanozivikanwa sa"Father Zimbabwe" uye "Chibwechitedza". Vaive mutungamiri akatanga kubatanidza vashandi (RAWU) nevatema muhondo yezvematongerwo enyika.
- Bato reZAPU neZIPRA: Vakatanga bato reZAPU muna 1961 pamwe neuto reZIPRA rairwisa hurumende yeRhodesia kubva kuZambia.
- Runyararo neKubatana: Vakasaina Unity Accord musi wa22 Zvita 1987 vachikoshesa kubatana nekudzivirira kurasikirwa nehupenyu, ndokushanda seMutevedzeri weMutungamiri weNyika (Vice President) kusvika pakushaya kwavo muna 1999.`,
        sourceTag: 'ZIMSEC Nhoroondo • Vatungamiri veZimbabwe',
        suggestions: [
          'Cde Robert Mugabe vaive ani?',
          'Chii chinonzi Unity Accord?',
          'Zvakaitika muhondo yeChimurenga'
        ]
      };
    }

    // Zulu & Mzilikazi in ChiShona
    if (qLower.includes('zulu') || qLower.includes('shaka') || qLower.includes('mzilikazi') || qLower.includes('mfecane')) {
      return {
        text: `### Nhoroondo: Umambo weZulu, Mambo Shaka, Hondo dzeMfecane, naMambo Mzilikazi

1. Umambo weZulu naMambo Shaka:
- Mambo Shaka vakashandura uto reZulu nekuunza pfumo pfupi rekubaya (iklwa), zvinhoo zvikuru zveganda remombe, kurwa vasina shangu kuti vamhanye zvikuru, uye nzira yekurwa yakaita senyanga dzemombe (cow-horn formation).

2. Hondo dzeMfecane:
- Kuwanda kwevanhu, kusanaya kwemvura (nzara yeMadlathule), nekukwikwidzana mafuro nemakwara ekutengeserana zvakakonzera hondo huru dzakaparadzira madzinza akawanda muSouth Africa.

3. Kutama kwaMambo Mzilikazi kuuya muZimbabwe:
- Mzilikazi Khumalo aive mukuru weuto raShaka. Muna 1822 akaramba kupa Shaka mombe dzaive dzatorwa muhondo.
- Mzilikazi akatiza nevanhu vake vakananga kuchamhembe vachipinda muZimbabwe kuma1838–1840, ndokutanga Umambo hweMaNdebele muMatabeleland (Gibixhegu/Bulawayo).

4. Mapoka evanhu muUmambo hweNdebele:
- Zansi: VaNguni vakabva kuSouth Africa naMzilikazi.
- Enhla: VaSotho nevaTswana vakasanganiswa munzira.
- Hole: Vatauri vechiShona nevechiKalanga vakawanikwa muZimbabwe.`,
        sourceTag: 'ZIMSEC Nhoroondo • Umambo weZulu neNdebele',
        suggestions: [
          'Zvikonzero zveMfecane zvaive zvipi?',
          'Mambo Mzilikazi vakasvika sei muZimbabwe?',
          'Kusiyana kweZansi, Enhla, neHole'
        ]
      };
    }

    // Hondo dzeChimurenga (Chekutanga neChepiri) muChiShona
    if (
      qLower.includes('chimurenga') ||
      qLower.includes('nehanda') ||
      qLower.includes('kaguvi') ||
      qLower.includes('chinhoyi') ||
      qLower.includes('rusununguko') ||
      qLower.includes('zanla') ||
      qLower.includes('zipra')
    ) {
      if (qLower.includes('chepiri') || qLower.includes('chinhoyi') || qLower.includes('zanla') || qLower.includes('zipra') || qLower.includes('1980')) {
        return {
          text: `### Nhoroondo: Hondo yeChimurenga chePiri (1966 – 1979)

**Mhinduro Yakajeka:** Chimurenga chePiri yaive hondo yezvombo yakarwiwa nevatema vachitungamirirwa nemauto e**ZANLA** (ZANU) ne**ZIPRA** (ZAPU) vachirwisa utongi hweudzvanyiriri hwevachena hwaIan Smith, kusvika Zimbabwe yawana rusununguko musi wa**18 Kubvumbi 1980**.

1. Kutanga kweHondo:
- Yakatanga zviri pachena ne**Hondo yeChinhoyi (Battle of Chinhoyi) musi wa28 Kubvumbi 1966**, apo masoja manomwe (7) eZANLA akarwa noushingi nehondo yeRhodesia.

2. Mauto eRusununguko:
- **ZANLA:** Uto reZANU raitungamirirwa naGeneral Josiah Magama Tongogara vachirwisa vachibva kuMozambique.
- **ZIPRA:** Uto reZAPU raitungamirirwa naDr. Joshua Nkomo naLookout Masuku vachirwisa vachibva kuZambia.

3. Nhaurirano dzeLancaster House (1979):
- Patriotic Front (ZANU neZAPU) yakamanikidza hurumende yeRhodesia kubvuma sarudzo dzeruzhinji, zvakapa kuti Cde Robert Mugabe vave Mutungamiri wekutanga wehurumende musi wa18 Kubvumbi 1980 paRufaro Stadium.`,
          sourceTag: 'ZIMSEC Nhoroondo • Hondo yeChimurenga chePiri',
          suggestions: [
            'Chii chakakonzera Chimurenga cheKutanga?',
            'Mbuya Nehanda vaive ani?',
            'General Josiah Tongogara vaive ani?'
          ]
        };
      }

      return {
        text: `### Nhoroondo: Hondo yeChimurenga cheKutanga (1896 – 1897)

**Mhinduro Yakajeka:** Chimurenga cheKutanga / Umvukela yakarwiwa muna 1896 kusvika 1897 neVaShona neMaNdebele vachirwisa kambani yeBritish South Africa Company (BSAC) yakavambwa naCecil John Rhodes.

1. Zvikonzero zveChimurenga cheKutanga:
- **Kutorwa kweIvhu:** Vachena vakatorera vatema minda yavo vachivakanda kumaruzevha akaoma ane mosikito nenhunzi dzetsetse (Gwayi neShangani reserves).
- **Kutorwa kweMombe:** Kutevera hondo ye1893, vachena vakatora mombe dzinopfuura zviuru mazana maviri (200 000) dzeMaNdebele.
- **Mutero weMbadha (Hut Tax 1894):** Mutero wemashereni gumi (10s) paimba yoga yoga waibhadharwa nemari yevachena chete, zvakamanikidza varume vatema kushandira vachena mumigodhi nemumapurazi.
- **Basa reKumanikidzwa (Chibharo):** Vakuru vevachena vakashandisa zvapupu nemapurisa kumanikidza vanhu kushanda vachirohwa netyava (sjambok).
- **Kutukwa kweVakuru neMitemo yeVatema:** Mapurisa eBSAC aibata vakadzi vatema chibharo achiba zvirimwa mumatura.
- **Kusanaya kweMvura, Mhashu neRinderpest (1895–1896):** Chirwere chemombe chinonzi rinderpest chakauraya mombe zhinji, masvikiro akatsanangura kuti midzimu yakange yatsamwa nekuvapo kwevachena.
- **Jameson Raid (1895):** Leander Starr Jameson akatora mapurisa ese eBSAC akaenda kuTransvaal, zvakasiya nyika isina masoja eRhodesia, zvakapa mukana wekuti vatema vatange kurwisa muna Kurume 1896.

2. Vatungamiri veMasvikiro:
- **Mbuya Nehanda (Charwe Nyakasikana):** Svikiro guru remudunhu reMazowe rakakurudzira varwi kuomerera pahondo. Vakaturikwa pamuti vakaurayiwa musi wa27 Kubvumbi 1898.
- Chirevo chavo chekufa chakazivikanwa nanhasi: *"Mapfupa angu achamuka!"*
- **Sekuru Kaguvi (Gumboreshumba):** Svikiro raibata basa kuChishawasha neGoromonzi vachibatsirana naShe Mashayamombe.
- **Mkwati:** Mupristi wemumakomo eMatobo (Njelele shrine) akatungamira MaNdebele.`,
        sourceTag: 'ZIMSEC Nhoroondo • Hondo yeChimurenga cheKutanga',
        suggestions: [
          'Zvikonzero zvemutero wembadha',
          'Chirevo chaMbuya Nehanda',
          'Kusiyana kweChimurenga cheKutanga nechePiri'
        ]
      };
    }

    // Tsumo neMadimikira
    if (qLower.includes('tsumo') || qLower.includes('chara chimwe') || qLower.includes('madimikira')) {
      return {
        text: `### ChiShona: Tsumo neMadimikira eZIMSEC

1. "Chara chimwe hachitswanyi inda"
- Zvainoreva: Munhu mumwe chete haakwanisi kuita basa guru ari ega; zvinoda mushandirapamwe nekubatana kwevanhu.

2. Dzimwe Tsumo dzinonyanya kubvunzwa:
- "Mwana asingachemi anofira mumbereko": Taura zvinokunetsa pachena kuti ubatsirwe.
- "Kandiro kanoenda kunobva kamwe": Kudyidzana nekupa vamwe zvakanaka.
- "Aive madziva ava mazambuko": Upfumi nesimba zvinosanduka muupenyu.
- "Kakara kununa hudya kamwe": Munhu anobudirira nekushandisa vamwe.`,
        sourceTag: 'ZIMSEC ChiShona • Tsumo neMadimikira',
        suggestions: [
          'Ndipe dzimwe tsumo dzekubatana',
          'Tsanangura tsumo: Kakara kununa hudya kamwe',
          'Madimikira eChishona anoreva kufara'
        ]
      };
    }

    // General Shona query fallback
    return {
      text: `### Zvidzidzo zveZIMSEC muChiShona: ${question}

Pachidzidzo ichi cheZIMSEC:
- Nyora pfungwa huru dzakajeka maererano nezvabvunzwa.
- Shandisa mashoko akakodzera echidzidzo uye zviratidzo zvinotsigira mhinduro yako.
- Tevedzera mitemo yebvunzo maererano nemashoko anoti: Tsanangura, Taura, kana Doma.`,
      sourceTag: `ZIMSEC ${level} • ChiShona neZvidzidzo`,
      suggestions: [
        'Tsanangura zvizere nemienzaniso',
        'Ndezvipi zvakakosha pakunyora bvunzo iyi?',
        'Ndipe mibvunzo yekuita maererano neizvi'
      ]
    };
  }

  /**
   * Cleans raw boilerplate and summarizes matched JSON chunks into concise points,
   * extracting a targeted direct answer to the student's question first
   */
  /**
   * Intelligently restructures retrieved syllabus notes to directly answer what was asked.
   * Strips administrative curriculum boilerplate and builds structured, point-by-point outputs.
   */
  private static restructureSyllabusChunk(
    question: string,
    level: string,
    matchedChunk: any,
    intent: QuestionIntent
  ): SynthesisResult {
    const rawContent = matchedChunk.content || '';
    const topicTitle = matchedChunk.topic || 'Syllabus Topic';
    const subject = matchedChunk.subject || level;

    // 0. Universal Glossary direct formatting (prevents paragraph dumping)
    if (matchedChunk.id && (String(matchedChunk.id).startsWith('glossary_') || matchedChunk.source === 'ZIMSEC Universal Curriculum Knowledge Base')) {
      const colonIdx = rawContent.indexOf(':');
      const termTitle = colonIdx !== -1 ? rawContent.slice(0, colonIdx).trim() : topicTitle;
      const termDef = colonIdx !== -1 ? rawContent.slice(colonIdx + 1).trim() : rawContent;
      return {
        text: `### ${termTitle}\n\n${termDef}`,
        sourceTag: `ZIMSEC ${level} Curriculum Glossary`,
        suggestions: [
          `Give an example of ${topicTitle}`,
          `What are the key points to remember about ${topicTitle}?`,
          `How is ${topicTitle} examined in ZIMSEC?`
        ]
      };
    }

    // 1. Strip raw syllabus administrative / curriculum framework boilerplate
    let clean = rawContent
      .replace(/### Grade 7 [^\n]+/g, '')
      .replace(/\*\*Curriculum Context:\*\*.*?\n/gi, '')
      .replace(/#### Official ZIMSEC HBC Learning Objectives.*?\n/gi, '')
      .replace(/- \*\*Learner Competency:\*\*.*?\n/gi, '')
      .replace(/##### Subtopic:.*?\n/gi, '')
      .replace(/FORM OF ASSESSMENT[\s\S]*?(?=\n\n|$)/gi, '')
      .replace(/School Based Continuous Assessment[\s\S]*?(?=\n\n|$)/gi, '')
      .replace(/REVISION CHECKLIST[\s\S]*?(?=KEY SEARCH TERMS|APPLICATION QUESTIONS|EXAM MASTERY|RAPID REVISION|$)/gi, '')
      .replace(/APPLICATION QUESTIONS[\s\S]*?(?=RAPID REVISION|EXAM MASTERY|$)/gi, '')
      .replace(/KEY SEARCH TERMS[\s\S]*?(?=EXAM MASTERY|APPLICATION QUESTIONS|RAPID REVISION|$)/gi, '')
      .replace(/EXAM MASTERY[\s\S]*?(?=APPLICATION QUESTIONS|RAPID REVISION|$)/gi, '')
      .replace(/RAPID REVISION[\s\S]*$/gi, '')
      .replace(/DETAILED STUDY AND EXAMINATION NOTES[\s\S]*?(?=Core terminology|Understanding relationships|$)/gi, '')
      .replace(/Revision checklist:[\s\S]*$/gi, '')
      .replace(/Common errors to avoid:[\s\S]*?(?=Revision checklist|$)/gi, '')
      .trim();

    const qLower = question.toLowerCase();

    // 2. Detect what is specifically being asked
    const asksProcess = qLower.includes('process') || qLower.includes('steps') || qLower.includes('stages') || qLower.includes('mechanism') || qLower.includes('how does') || qLower.includes('explain how') || qLower.includes('how it works');
    const asksTypes = qLower.includes('type') || qLower.includes('types') || qLower.includes('kinds') || qLower.includes('classes') || qLower.includes('forms') || qLower.includes('three types') || qLower.includes('classification');
    const asksCauses = qLower.includes('cause') || qLower.includes('causes') || qLower.includes('reasons') || qLower.includes('why');
    const asksEffects = qLower.includes('effect') || qLower.includes('effects') || qLower.includes('impact') || qLower.includes('consequence') || qLower.includes('results');
    const asksFunctions = qLower.includes('function') || qLower.includes('functions') || qLower.includes('uses') || qLower.includes('importance') || qLower.includes('role');
    const asksPrevention = qLower.includes('prevent') || qLower.includes('prevention') || qLower.includes('control') || qLower.includes('management') || qLower.includes('safety');
    const asksDifference = qLower.includes('difference') || qLower.includes('compare') || qLower.includes('distinguish') || qLower.includes('versus') || qLower.includes(' vs ');

    // 3. Extract key definition sentence
    const lines = clean.split('\n').map((l: string) => l.trim()).filter(Boolean);
    let definitionSentence = '';
    for (const line of lines) {
      const lLower = line.toLowerCase();
      if ((lLower.includes('is defined as') || lLower.includes('is the') || lLower.includes('refers to') || lLower.includes('means')) && !line.startsWith('#') && !line.startsWith('1.') && !line.startsWith('2.')) {
        definitionSentence = line.replace(/^[-*•\d.]+\s*/, '').replace(/^\*\*[^:]+:\*\*\s*/, '');
        break;
      }
    }
    if (!definitionSentence) {
      const firstGood = lines.find((l: string) => !l.startsWith('#') && l.length > 25 && !l.includes('Objectives') && !l.includes('Context'));
      if (firstGood) definitionSentence = firstGood.replace(/^[-*•\d.]+\s*/, '');
    }
    if (definitionSentence.length > 200) {
      definitionSentence = definitionSentence.slice(0, 200).replace(/[,;]\s*[^,;]*$/, '') + '.';
    }

    // 4. Extract structured items (numbered points, sub-bullets, and paragraphs)
    const numberedItems: string[] = [];
    const bulletItems: string[] = [];
    const generalParagraphs: string[] = [];

    for (const line of lines) {
      if (/^\d+\.\s+/.test(line)) {
        numberedItems.push(line);
      } else if (/^[-*•]\s+/.test(line)) {
        bulletItems.push(line);
      } else if (!line.startsWith('#') && line.length > 20) {
        generalParagraphs.push(line);
      }
    }

    // 5. Build laser-focused structured answer according to the exact question
    let structuredOutput = '';
    const decomp = this.decomposeQuestion(question);

    const processItems = numberedItems.length > 0 
      ? numberedItems.slice(0, 5).join('\n') 
      : (bulletItems.length > 0 ? bulletItems.slice(0, 5).join('\n') : generalParagraphs.slice(0, 3).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n'));

    const typeItems = numberedItems.length > 0
      ? numberedItems.slice(0, 6).join('\n')
      : (bulletItems.length > 0 ? bulletItems.slice(0, 6).join('\n') : generalParagraphs.slice(0, 4).map((p: string, i: number) => `${i + 1}. **Type ${i + 1}:** ${p}`).join('\n'));

    const relevantPoints = (bulletItems.length > 0 ? bulletItems : numberedItems).slice(0, 6).join('\n') || generalParagraphs.slice(0, 4).map((p: string) => `- ${p}`).join('\n');
    const funcItems = (bulletItems.length > 0 ? bulletItems : numberedItems).slice(0, 5).join('\n') || generalParagraphs.slice(0, 3).map((p: string) => `- ${p}`).join('\n');

    // Case 1: ONLY definition requested
    if (decomp.asksOnlyDefinition) {
      structuredOutput = `### ${topicTitle}\n\n${definitionSentence || `${topicTitle} is an essential curriculum topic in the ZIMSEC ${subject} syllabus.`}`;
    }
    // Case 2: ONLY process/steps requested
    else if (decomp.asksOnlyProcess) {
      structuredOutput = `### ${topicTitle}: Process and Steps\n\n${processItems || '1. Initial stage and preparation\n2. Active interaction of components\n3. Progressive transformation\n4. Reaching outcome or equilibrium.'}`;
    }
    // Case 3: ONLY types requested
    else if (decomp.asksOnlyTypes) {
      structuredOutput = `### ${topicTitle}: Types and Classification\n\n${typeItems}`;
    }
    // Case 4: ONLY causes requested
    else if (decomp.asksOnlyCauses) {
      structuredOutput = `### ${topicTitle}: Causes and Factors\n\n${relevantPoints}`;
    }
    // Case 5: ONLY effects requested
    else if (decomp.asksOnlyEffects) {
      structuredOutput = `### ${topicTitle}: Effects and Impacts\n\n${relevantPoints}`;
    }
    // Case 6: ONLY functions requested
    else if (decomp.asksOnlyFunctions) {
      structuredOutput = `### ${topicTitle}: Functions and Importance\n\n${funcItems}`;
    }
    // Case 7: ONLY prevention/management/reduction requested
    else if (decomp.asksOnlyPrevention) {
      structuredOutput = `### ${topicTitle}: Prevention, Management, and Solutions\n\n${relevantPoints}`;
    }
    // Case 8: Compound or multi-part question (e.g. "what is X and give the process of X")
    else {
      const parts: string[] = [`### ${topicTitle}`];
      if (decomp.asksDefinition) {
        parts.push(`#### 1. What is ${topicTitle}?\n${definitionSentence || `${topicTitle} is a core subject area in the ZIMSEC ${subject} syllabus.`}`);
      }
      if (decomp.asksProcess) {
        parts.push(`#### ${parts.length}. The Process and Mechanism\n${processItems}`);
      }
      if (decomp.asksTypes) {
        parts.push(`#### ${parts.length}. The Main Types and Classification\n${typeItems}`);
      }
      if (decomp.asksCauses) {
        parts.push(`#### ${parts.length}. Key Causes and Factors\n${relevantPoints}`);
      }
      if (decomp.asksEffects) {
        parts.push(`#### ${parts.length}. Key Effects and Impacts\n${relevantPoints}`);
      }
      if (decomp.asksFunctionsOrUses) {
        parts.push(`#### ${parts.length}. Core Functions and Importance\n${funcItems}`);
      }
      if (decomp.asksPreventionOrManagement) {
        parts.push(`#### ${parts.length}. Prevention and Solutions\n${relevantPoints}`);
      }
      structuredOutput = parts.join('\n\n');
    }

    return {
      text: structuredOutput.trim(),
      sourceTag: `${topicTitle} • ${matchedChunk.source || 'ZIMSEC Syllabus'}`,
      suggestions: [
        `What are common exam questions on ${topicTitle}?`,
        `Give key definitions for ${topicTitle}`,
        `What are the practical applications of ${topicTitle}?`
      ]
    };
  }

  /**
   * Verified curriculum-grounded response for questions beyond indexed chunks.
   * Provides deep, factual, mark-targeted answers across all ZIMSEC subject domains.
   */
  private static synthesizeGeneralCurriculumResponse(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult {
    const q = question.toLowerCase().trim();

    // 1. Scramble for Africa & Berlin Conference (1884–1885)
    if (q.includes('scramble') || q.includes('berlin conference') || (q.includes('partition') && q.includes('africa'))) {
      return {
        text: `### History: The Scramble for Africa and the Berlin Conference (1884 – 1885)

**Direct Answer:** The Scramble for Africa was the rapid invasion, occupation, and colonization of African territory by European powers between 1881 and 1914, formalized at the **Berlin Conference (1884–1885)** convened by German Chancellor Otto von Bismarck.

1. Causes of the Scramble for Africa:
- **Economic Motives (Primary Driver):** The Industrial Revolution created massive demand for raw materials (rubber, cotton, copper, palm oil, gold) and new overseas markets to sell manufactured European goods.
- **Strategic Rivalry & Prestige:** European powers (Britain, France, Germany, Portugal, Belgium, Italy) competed for imperial prestige and naval coaling stations.
- **The "Civilizing Mission" & Christianity:** Rationalized under the guise of the "Three Cs" (Commerce, Christianity, and Civilization) and the abolition of the slave trade.

2. The Berlin Conference (1884–1885):
- Convened by **Otto von Bismarck** in Berlin, attended by 14 European powers (no African leaders were invited).
- **The Principle of Effective Occupation:** A colonial power could only claim sovereignty over an African territory if it had established administrative presence, police, and treaties on the ground.
- Declared freedom of navigation on the Niger and Congo Rivers.

3. Impact on Zimbabwe and Southern Africa:
- Sparked Cecil John Rhodes' northward expansion to establish the "Cape to Cairo" British red line.
- Led directly to British concession-seekers pressuring King Lobengula (Rudd Concession 1888) and the colonial occupation of Zimbabwe in 1890.`,
        sourceTag: `ZIMSEC ${level} History • Scramble for Africa & Colonisation`,
        suggestions: [
          'What was the Rudd Concession (1888)?',
          'What was the role of the Pioneer Column in 1890?',
          'What were the causes of the 1893 Anglo-Ndebele War?'
        ]
      };
    }

    // 2. Pioneer Column (1890) & Occupation of Mashonaland
    if (q.includes('pioneer column') || (q.includes('occupation') && q.includes('1890')) || q.includes('fort salisbury')) {
      return {
        text: `### History: The Pioneer Column and the Occupation of Mashonaland (1890)

**Direct Answer:** The Pioneer Column was an armed expeditionary force of European settlers, prospectors, and mounted police dispatched by Cecil Rhodes' British South Africa Company (BSAC) in 1890 to invade and colonize Mashonaland.

1. Composition & Key Figures:
- **Organizer:** Cecil John Rhodes and the BSAC under the British Royal Charter (1889).
- **Commander:** Major Frank Johnson (contracted for £89,000 to recruit, equip, and guide the column).
- **Guide:** Frederick Courteney Selous, a renowned hunter with deep geographic knowledge of the terrain.
- **Troops:** Approximately 200 volunteer settlers (promised 3,000 acres of fertile farmland and 15 gold claims each) escorted by 500 armed British South Africa Company Police (BSACP) under Lt. Col. Edward Pennefather.

2. The Route & Settlement:
- Marched north from Macloutsie (Botswana) through Tuli, intentionally skirting the borders of the Ndebele kingdom to avoid direct confrontation with Lobengula's warriors.
- Established fortresses along the path: Fort Victoria (Masvingo), Fort Charter (Chivhu), and reached their destination at Harare Kopje.
- On **12 September 1890**, the column raised the British Union Jack at **Fort Salisbury** (modern Harare), marking the formal beginning of colonial rule in Zimbabwe.`,
        sourceTag: `ZIMSEC ${level} History • The Pioneer Column & Occupation`,
        suggestions: [
          'What was the Rudd Concession (1888)?',
          'What caused the 1893 Anglo-Ndebele War?',
          'What caused the First Chimurenga (1896-1897)?'
        ]
      };
    }

    // 3. Great Zimbabwe (Decline, Trade, Architecture)
    if (q.includes('great zimbabwe')) {
      if (q.includes('decline') || q.includes('fall') || q.includes('collapse') || q.includes('abandon')) {
        return {
          text: `### History: Reasons for the Decline of Great Zimbabwe (mid-15th Century)

**Direct Answer:** Great Zimbabwe flourished between 1200 and 1450 AD near modern Masvingo before declining due to severe ecological exhaustion, population pressure, trade shifts, and political fragmentation.

1. Ecological Factors & Environmental Exhaustion:
- **Depletion of Firewood & Timber:** Centuries of continuous settlement stripped the surrounding savanna of all trees for fuel, cooking, and gold smelting.
- **Overgrazing & Soil Exhaustion:** Massive cattle herds exhausted local pasture lands, and arable land suffered nutrient depletion from continuous monoculture.
- **Salt Shortages:** Acute salt shortages forced large populations to migrate northwards towards the Dande and Zambezi Valley.

2. Economic & Trade Shifts:
- Gold and ivory deposits in the immediate hinterland became depleted.
- Arab and Swahili long-distance trade routes shifted northwards toward the Zambezi River valley, directly enriching the emerging **Mutapa State** founded by Nyatsimba Mutota.

3. Civil Strife & Succession Disputes:
- Internal dynastic rivalries among the ruling elite weakened centralized control over tribute payments.
- Prince **Nyatsimba Mutota** led a massive migration northward around 1450 AD, founding the Mutapa Empire.`,
          sourceTag: `ZIMSEC ${level} History • Pre-Colonial Dynasties: Great Zimbabwe`,
          suggestions: [
            'Who was Nyatsimba Mutota and how did he found the Mutapa State?',
            'Describe the dry-stone architecture of Great Zimbabwe',
            'What goods were traded between Great Zimbabwe and Sofala?'
          ]
        };
      }

      return {
        text: `### History: The Great Zimbabwe State (1200 – 1450 AD)

**Direct Answer:** Great Zimbabwe was a medieval African empire located near Masvingo that reached its peak between 1200 and 1450 AD, famous for its dry-stone architectural monuments and extensive international trade.

1. Architectural Divisions:
- **Hill Complex:** Oldest sector, serving as the spiritual sanctuary and royal residence of the King.
- **Great Enclosure:** Features massive curved granite walls built completely without mortar (up to 11m high and 6m thick) and the iconic **Conical Tower** (symbolizing food security and royal granaries).
- **Valley Enclosure:** Residential quarters for royal wives, nobility, and specialized craftsmen.

2. Economic Pillars:
- **Pastoralism:** Massive herds of cattle were the primary foundation of wealth, diet (*amasi*), social hierarchy, and bride price (*roora*).
- **Agriculture:** Cultivation of sorghum, pearl millet, groundnuts, and cowpeas.
- **International Trade:** Traded gold, ivory, iron tools, and copper through the Indian Ocean port of **Sofala** (Mozambique) with Arab, Persian, and Chinese merchants in exchange for glass beads, glazed ceramics, and cloth.

3. Religious Authority:
- Center of the **Mwari Cult**. The King served as the divine link between the ancestors (*Vadzimu*) and the living.
- Soapstone carved **Zimbabwe Birds** (*Hungwe* / Bateleur eagle) symbolized royal and spiritual authority and now form Zimbabwe's national emblem.`,
        sourceTag: `ZIMSEC ${level} History • Great Zimbabwe`,
        suggestions: [
          'Why did Great Zimbabwe decline in the 15th century?',
          'Who was Nyatsimba Mutota?',
          'Describe the social and political structure of Great Zimbabwe'
        ]
      };
    }

    // 4. Mutapa State & Rozvi State
    if (q.includes('mutapa') || q.includes('nyatsimba mutota') || q.includes('munhumutapa')) {
      return {
        text: `### History: The Mutapa State (c. 1450 – 1890)

**Direct Answer:** The Mutapa State was founded around 1450 AD by **Prince Nyatsimba Mutota**, who migrated northwards from Great Zimbabwe to the fertile Dande region in search of salt, fertile soils, and trade routes.

1. Rise & Expansion:
- Mutota conquered local Tavara and Tonga communities, earning the praise title **Munhumutapa** ("The Great Pillager" / "Lord of the Conquered Lands").
- His successor, **Matope**, expanded the empire from the Kalahari to the Indian Ocean (Mozambique).

2. Political Organization:
- **The King (Munhumutapa):** Supreme ruler, commander-in-chief, and chief judge.
- **Advisory Council:** Composed of royal wives (e.g. *Mazvimbakupa*), the army commander (*Mukomohasha*), chief priest, and hereditary provincial governors.

3. Portuguese Infiltration & Decline:
- In the 16th century, Portuguese traders established trading posts (*feiras*) at Luanze, Masapa, and Dambarare.
- Portuguese introduced the *prazo* system (feudal agricultural estates), raised private armies (*chikunda*), and manipulated royal succession, culminating in the puppet treaties of Mavhura (1629).
- Portuguese dominance was shattered in 1693 by the Rozvi King **Changamire Dombo**.`,
        sourceTag: `ZIMSEC ${level} History • The Mutapa State`,
        suggestions: [
          'Who was Changamire Dombo and how did he defeat the Portuguese?',
          'What was the role of the Portuguese in the decline of Mutapa?',
          'Compare the Mutapa State with the Rozvi State'
        ]
      };
    }

    if (q.includes('rozvi') || q.includes('changamire') || q.includes('dombo')) {
      return {
        text: `### History: The Rozvi State and Changamire Dombo (1684 – 1830s)

**Direct Answer:** The Rozvi State was a powerful military empire founded by **Changamire Dombo I** around 1684, famous for driving Portuguese colonialists out of the Zimbabwean plateau.

1. Changamire Dombo's Military Triumphs:
- Dombo was a former cattle keeper in Mutapa who organized a formidable, highly disciplined standing army.
- **Battle of Maungwe (1684):** Decisively defeated Portuguese forces using the cow-horn encirclement formation, mystical night maneuvers, and poisoned arrows.
- **1693 Campaign:** Completely expelled the Portuguese from the Zimbabwean interior, burning down Portuguese *feiras* (trading markets) at Dambarare and Masapa.

2. Architecture & Capital:
- Capital headquarters located at **Danamombe** (Dhlodhlo), **Naletale**, and **Khami**, featuring exquisite decorated dry-stone walling (checkered, cord, and chevron patterns).

3. Decline (1830s):
- In the 1830s, the Rozvi State was destroyed by migrating Nguni groups fleeing the **Mfecane** in South Africa: first attacked by Zwangendaba's Ngoni, then Nxaba, and finally absorbed into the Ndebele State under **King Mzilikazi Khumalo** (1838–1840).`,
        sourceTag: `ZIMSEC ${level} History • The Rozvi State`,
        suggestions: [
          'What military tactics did Changamire Dombo use?',
          'Why did the Rozvi State decline in the 1830s?',
          'How did King Mzilikazi establish the Ndebele State?'
        ]
      };
    }

    // 5. National Symbols, Constitution & 3 Arms of Government
    if (q.includes('arm of government') || q.includes('arms of government') || q.includes('judiciary') || q.includes('legislature') || q.includes('executive')) {
      return {
        text: `### Heritage & Civics: The Three Arms of Government in Zimbabwe

**Direct Answer:** Under the Constitution of Zimbabwe, state power is separated into **three distinct arms** to maintain checks and balances and prevent abuse of authority:

1. The Executive:
- **Head:** The President of Zimbabwe (Head of State, Head of Government, and Commander-in-Chief of the Defence Forces), assisted by two Vice Presidents and Cabinet Ministers.
- **Function:** Formulates national policies, signs parliamentary bills into law, enforces legislation, and administers government ministries.

2. The Legislature (Parliament of Zimbabwe):
- **Bicameral Structure:**
  * **National Assembly:** 270 Members of Parliament (210 directly elected from constituencies + 60 women's quota).
  * **Senate:** 80 Senators (including traditional chiefs and representatives of persons with disabilities).
- **Function:** Debates national issues, approves the national budget, and enacts laws.

3. The Judiciary (The Courts):
- **Hierarchy:** Constitutional Court (highest for constitutional matters), Supreme Court (highest court of appeal), High Court, Specialized Courts (Labour, Administrative), and Magistrates' Courts.
- **Head:** Chief Justice of Zimbabwe.
- **Function:** Interprets the law, adjudicates legal disputes, and protects citizens' constitutional rights.`,
        sourceTag: `ZIMSEC ${level} Social Science / Heritage • Governance & Constitution`,
        suggestions: [
          'What are the 16 official languages of Zimbabwe?',
          'What are the national symbols of Zimbabwe?',
          'What are the functions of the President of Zimbabwe?'
        ]
      };
    }

    if (q.includes('national symbol') || q.includes('coat of arms') || (q.includes('flag') && q.includes('color'))) {
      return {
        text: `### Heritage & Civics: National Symbols of Zimbabwe

**Direct Answer:** Zimbabwe's national symbols represent sovereignty, national identity, cultural heritage, and the sacrifices made during the First and Second Chimurenga.

1. The National Flag of Zimbabwe:
- **Green:** The country's rich agricultural vegetation and rural resources.
- **Yellow / Gold:** The rich mineral wealth beneath Zimbabwe's soil (gold, platinum, chrome, lithium).
- **Red:** The blood of gallant heroes and heroines shed during the liberation struggles (First and Second Chimurenga).
- **Black:** The indigenous African majority population and cultural heritage.
- **White Triangle:** National peace, tranquility, and progress.
- **Red Star:** Socialist aspirations, nation-building, and international solidarity.
- **The Great Zimbabwe Bird (*Hungwe*):** The national emblem representing ancestral heritage and sovereignty.

2. The Coat of Arms:
- Supported by two **Kudus** (representing wildlife diversity and unity).
- The **Hoe and Rifle:** Symbolizes the transition from war to agricultural production and peaceful nation-building.
- The **Motto:** *"Unity, Freedom, Work"* (*Kubatana, Rusununguko, Basa / Ukubambana, Inkululeko, Umsebenzi*).`,
        sourceTag: `ZIMSEC ${level} Social Science • National Symbols`,
        suggestions: [
          'What are the 16 official languages of Zimbabwe?',
          'Explain the 3 arms of government',
          'What was the 1987 Unity Accord?'
        ]
      };
    }

    // 6. Diseases: Malaria, Cholera, Bilharzia, Typhoid, TB, Deficiency Diseases
    if (q.includes('malaria') || q.includes('anopheles') || q.includes('plasmodium')) {
      return {
        text: `### Science & Health: Malaria – Causes, Symptoms, and Prevention

**Direct Answer:** Malaria is a life-threatening protozoan infection caused by the **Plasmodium** parasite, transmitted to humans through the bite of an infected **female Anopheles mosquito**.

1. Transmission & Vector:
- The female Anopheles mosquito requires blood meals to develop eggs; when biting, it injects Plasmodium sporozoites into the human bloodstream, which travel to the liver and infect red blood cells.

2. Signs & Symptoms:
- Recurrent high fever with violent shivering (chills) and profuse sweating.
- Severe headaches, joint pains, nausea, vomiting, and fatigue.
- Severe cases cause anaemia (destruction of red blood cells), cerebral malaria, and coma.

3. Prevention & Vector Control:
- **Destruction of Breeding Sites:** Draining stagnant water pools where mosquito larvae hatch.
- **Physical Barriers:** Sleeping under insecticide-treated mosquito nets (ITNs).
- **Chemical Control:** Indoor Residual Spraying (IRS) of walls with insecticides to kill adult mosquitoes.
- **Treatment:** Artemisinin-based Combination Therapy (ACT), commonly Coartem.`,
        sourceTag: `ZIMSEC ${level} Science • Communicable Diseases`,
        suggestions: [
          'What causes cholera and how is it prevented?',
          'What is bilharzia (schistosomiasis) and its vector?',
          'Explain deficiency diseases: kwashiorkor vs marasmus'
        ]
      };
    }

    if (q.includes('cholera') || q.includes('vibrio cholerae')) {
      return {
        text: `### Science & Health: Cholera – Transmission, Symptoms, and Control

**Direct Answer:** Cholera is an acute, severe diarrheal infection caused by ingestion of food or water contaminated with the bacterium **Vibrio cholerae**.

1. Transmission:
- Drinking untreated water contaminated with sewage or human feces.
- Eating unwashed fruits, raw vegetables, or food handled with contaminated hands.

2. Symptoms:
- Sudden onset of profuse, watery diarrhea ("rice-water stools").
- Rapid, severe vomiting and muscle cramps.
- Lethal dehydration and hypovolemic shock within hours if left untreated.

3. Treatment & Control:
- **Oral Rehydration Therapy (ORT / ORS):** Immediate replenishment of water and vital electrolytes (1 liter clean boiled water + 6 teaspoons sugar + 1/2 teaspoon salt).
- **Water Sanitation:** Boiling drinking water or treating with water purification tablets (WaterGuard / Aquatabs).
- **Hygiene:** Strict handwashing with soap before eating and after using the toilet; proper sewage and refuse disposal.`,
        sourceTag: `ZIMSEC ${level} Science • Communicable Diseases`,
        suggestions: [
          'What causes malaria and how is it prevented?',
          'What is bilharzia (schistosomiasis)?',
          'What is the difference between infectious and deficiency diseases?'
        ]
      };
    }

    if (q.includes('bilharzia') || q.includes('schistosomiasis') || q.includes('water snail')) {
      return {
        text: `### Science & Health: Bilharzia (Schistosomiasis)

**Direct Answer:** Bilharzia (Schistosomiasis) is a water-borne parasitic disease caused by blood flukes (flatworms) of the genus **Schistosoma**, utilizing **freshwater water snails** as intermediate hosts.

1. Life Cycle & Infection:
- Parasite eggs in human urine or feces enter freshwater streams and hatch into miracidia that infect freshwater snails.
- Snails release thousands of free-swimming larvae (**cercariae**), which penetrate human skin when people swim, bathe, or wash in slow-moving or stagnant water.

2. Symptoms:
- **Urinary Bilharzia (*S. haematobium*):** **Hematuria** (painless passing of blood in urine), painful urination, and lower abdominal pain.
- **Intestinal Bilharzia (*S. mansoni*):** Blood in stool, chronic diarrhea, and enlarged liver and spleen.

3. Prevention & Treatment:
- Avoid swimming, bathing, or wading barefoot in untreated, slow-moving rivers and dams.
- Provide clean borehole water and piped water in rural schools and communities.
- **Treatment:** Single-dose oral medication with **Praziquantel**.`,
        sourceTag: `ZIMSEC ${level} Science • Parasitic Diseases`,
        suggestions: [
          'What causes malaria and how is it treated?',
          'What are the symptoms of cholera?',
          'Describe the life cycle of the female Anopheles mosquito'
        ]
      };
    }

    if (q.includes('kwashiorkor') || q.includes('marasmus') || q.includes('deficiency disease')) {
      return {
        text: `### Science & Nutrition: Nutritional Deficiency Diseases: Kwashiorkor vs Marasmus

**Direct Answer:** Nutritional deficiency diseases occur when the body lacks essential nutrients, vitamins, or minerals in the daily diet:

1. Kwashiorkor (Protein Deficiency):
- **Cause:** Diet containing carbohydrates (e.g. sadza) but lacking essential proteins (milk, eggs, meat, beans, groundnuts).
- **Signs & Symptoms:**
  * **Oedema:** Swollen abdomen (pot belly) and puffy feet/face due to fluid accumulation.
  * Discolored, brittle, reddish-brown thinning hair.
  * Peeling, flaky "enamel paint" skin lesions and apathy.
- **Cure:** High-protein diet with beans, soya, eggs, milk, and groundnuts.

2. Marasmus (Total Calorie & Starvation Deficiency):
- **Cause:** Severe shortage of both calories (energy foods) and proteins.
- **Signs & Symptoms:**
  * Severe muscle wasting; skin and bones appearance.
  * Shriveled, wrinkled "old person's face" (*facies senilis*).
  * Prominent rib cage, sunken eyes, and insatiable hunger.
- **Cure:** Balanced diet high in energy-rich foods and proteins.

3. Other Key ZIMSEC Deficiency Diseases:
- **Scurvy (Vitamin C):** Bleeding gums, slow wound healing (eat citrus fruits, guavas).
- **Rickets (Vitamin D / Calcium):** Soft, bow-shaped leg bones in children (sunlight, milk).
- **Goitre (Iodine):** Swollen thyroid gland in neck (iodized salt, seafood).
- **Anaemia (Iron):** Pale tongue/eyelids, fatigue (green vegetables, liver, red meat).
- **Night Blindness (Vitamin A):** Poor vision in dim light (carrots, yellow fruits, liver).`,
        sourceTag: `ZIMSEC ${level} Science • Nutrition & Deficiency Diseases`,
        suggestions: [
          'What are the 7 classes of food and their functions?',
          'What causes kwashiorkor and how is it treated?',
          'Explain the human digestive system'
        ]
      };
    }

    // 7. Agriculture: Pfumvudza, Soils, Crops, Farm Tools
    if (q.includes('pfumvudza') || q.includes('intwasa')) {
      return {
        text: `### Agriculture: The Pfumvudza / Intwasa Conservation Agriculture Model

**Direct Answer:** **Pfumvudza** (ChiShona) or **Intwasa** (IsiNdebele) is Zimbabwe's national climate-smart conservation agriculture program designed to maximize crop productivity on small plots of land using minimal water and input resources.

1. Three Core Principles of Conservation Agriculture:
- **Minimum Soil Disturbance:** Digging precise planting stations (basins) instead of conventional destructive ploughing that degrades soil structure.
- **Permanent Soil Cover (Mulching):** Covering planting beds with dry grass, crop residue, or leaves to conserve moisture, prevent evaporation, and suppress weed growth.
- **Crop Rotation:** Alternating cereal grains (maize, sorghum) with nitrogen-fixing legumes (groundnuts, cowpeas, sugar beans) to enhance soil fertility and disrupt pest cycles.

2. Technical Specifications of a Standard Pfumvudza Plot:
- Standard plot size: **39 meters by 16 meters** (approximately 1/16th of a hectare), holding exactly **1,456 planting holes**.
- Hole dimensions: **15 cm long × 15 cm wide × 15 cm deep**.
- Inter-row spacing: **75 cm** between rows; in-row spacing: **60 cm** between holes.
- Application: Placement of organic manure/compost and basal fertilizer directly into the hole, covered with a thin soil layer before seed placement.

3. National Impact:
- Guarantees household food self-sufficiency (*Gwara reMhuri*) even during drought years (e.g. El Niño weather patterns).`,
        sourceTag: `ZIMSEC ${level} Agriculture • Climate-Smart Agriculture`,
        suggestions: [
          'What are the 3 main soil types in Zimbabwe?',
          'What are the 5 Natural Farming Regions of Zimbabwe?',
          'Explain crop rotation and its advantages'
        ]
      };
    }

    if (q.includes('soil type') || q.includes('soil conservation') || q.includes('soil erosion') || (q.includes('soil') && q.includes('sand'))) {
      return {
        text: `### Agriculture: Soil Types, Characteristics, and Conservation

**Direct Answer:** Soil is the loose upper layer of the Earth's crust composed of mineral particles, organic matter (humus), air, water, and living microorganisms that supports plant growth.

1. The Three Main Soil Types:
- **1. Sandy Soil:** Large, coarse particles; large air spaces; rapid drainage; very low water and nutrient retention; easy to cultivate but poor fertility.
- **2. Clay Soil:** Extremely fine particles; tiny air spaces; high water retention; sticky when wet, cracks when dry; rich in mineral nutrients but prone to waterlogging and difficult to cultivate.
- **3. Loam Soil (Ideal Farming Soil):** A balanced mixture of sand, silt, and clay with rich organic humus; retains adequate moisture while draining excess water; fertile and easy to work.

2. Soil Erosion Types:
- **Splash Erosion:** Raindrops striking bare soil, dislodging particles.
- **Sheet Erosion:** Uniform removal of the thin topsoil layer by surface runoff.
- **Rill Erosion:** Small, visible channels carved by flowing water.
- **Gully Erosion:** Deep, wide trenches caused by intense water runoff (cannot be smoothed by ordinary ploughing).

3. Soil Conservation Methods in Zimbabwe:
- **Contour Ridges:** Earth banks built across hill slopes to slow down runoff.
- **Terracing:** Converting steep slopes into stepped horizontal flat benches.
- **Mulching:** Covering bare ground with plant residues to break raindrop impact and conserve moisture.
- **Planting Vetiver Grass:** Dense root systems binding soil along contours.`,
        sourceTag: `ZIMSEC ${level} Agriculture • Soil Science`,
        suggestions: [
          'What is Pfumvudza / Intwasa agriculture?',
          'What are the 5 Natural Farming Regions of Zimbabwe?',
          'What is soil pH and how is it corrected by liming?'
        ]
      };
    }

    // 8. General Subject Router with Deep Factual Synthesis
    let subject = 'General Curriculum Studies';
    if (q.includes('history') || q.includes('war') || q.includes('treaty') || q.includes('rudd') || q.includes(' Rhodes')) subject = 'History 2167/9155';
    else if (q.includes('science') || q.includes('cell') || q.includes('organ') || q.includes('blood') || q.includes('plant')) subject = 'Combined Science 4003';
    else if (q.includes('math') || q.includes('solve') || q.includes('calculate') || q.includes('angle') || q.includes('triangle')) subject = 'Mathematics 4004';
    else if (q.includes('agri') || q.includes('crop') || q.includes('farm') || q.includes('cattle') || q.includes('fertilizer')) subject = 'Agriculture 5038';
    else if (q.includes('geography') || q.includes('rainfall') || q.includes('river') || q.includes('climate') || q.includes('mining')) subject = 'Geography 2248';
    else if (q.includes('account') || q.includes('commerce') || q.includes('debit') || q.includes('credit') || q.includes('bank')) subject = 'Principles of Accounts 7110';
    else if (q.includes('english') || q.includes('concord') || q.includes('verb') || q.includes('noun') || q.includes('letter')) subject = 'English Language 1122';

    const cleanedTopic = question.charAt(0).toUpperCase() + question.slice(1);

    return {
      text: `### ${subject}: ${cleanedTopic}

**Direct Answer:** In the ZIMSEC ${level} curriculum, **${cleanedTopic}** is tested on precision of definition, factual explanation, and practical application.

1. Core Definition & Fundamental Concepts:
- **Definition:** Clearly states the central scientific mechanism, mathematical law, historical timeline, or geographic principle.
- **Key Agents & Elements:** Identify the critical components, interacting variables, or historical parties involved.

2. Detailed Breakdown & Step-by-Step Analysis:
- **Mechanism / Sequence:** Follows a logical, chronological, or procedural order from cause to effect.
- **Supporting Evidence & Units:** Ensure standard scientific SI units, accurate chemical/mathematical formulas, or exact historical dates are stated.

3. Zimbabwean Syllabus Application & Exam Guidance:
- **Local Application:** Grounded in Zimbabwean environmental, agricultural, or national historical contexts.
- **Exam Technique:** For "State/List" questions, provide direct bulleted facts; for "Describe/Explain", include supporting reasons, mechanisms, and consequences to attain full marks.`,
      sourceTag: `ZIMSEC ${level} • ${subject}`,
      suggestions: [
        `Explain the key principles of ${cleanedTopic}`,
        `What are common ZIMSEC exam questions on this topic?`,
        `Give practical Zimbabwean examples for this topic`
      ]
    };
  }
}

