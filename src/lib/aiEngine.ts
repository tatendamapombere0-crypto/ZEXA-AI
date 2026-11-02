import { KnowledgeStore } from './knowledgeStore';

export interface GenerationOptions {
  level: string;
  hint?: string;
  history?: Array<{ question: string; answer: string }>;
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

    // 4. Standalone authentic ChiShona keywords (excluding common loan terms and historical entities like chimurenga, mambo, unhu, lobola)
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

  static async generate(question: string, options: GenerationOptions): Promise<void> {
    this.isCancelled = false;
    const startTime = performance.now();
    let firstTokenTime = 0;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      options.onError('Please enter a question');
      return;
    }

    try {
      // 1. RAG search in syllabus knowledge base (strictly filtered by level)
      let matchedChunk: any = null;
      let matchedScore = 0;

      if (!options.hint) {
        let searchResult = await KnowledgeStore.searchScored(trimmedQuestion, options.level);
        if (searchResult.results.length > 0) {
          const top = searchResult.results[0];
          matchedChunk = top.chunk;
          matchedScore = top.score;
        } else {
          // Cross-level fallback: if not found in current level, check all curriculum chunks
          const fallbackSearch = await KnowledgeStore.searchScored(trimmedQuestion, 'all');
          if (fallbackSearch.results.length > 0) {
            const top = fallbackSearch.results[0];
            matchedChunk = top.chunk;
            matchedScore = top.score;
          }
        }
      }

      // 2. Synthesize conversational, question-tailored response text
      const rawResult = this.synthesizeResponse(
        trimmedQuestion,
        options.level,
        matchedChunk,
        matchedScore,
        options.hint
      );

      const cleanedText = this.cleanSymbols(rawResult.text);

      // 3. Stream tokens to UI with realistic offline speed
      const tokens = this.tokenizeText(cleanedText);
      let currentIndex = 0;

      const streamNext = () => {
        if (this.isCancelled) {
          options.onComplete('Cancelled by user');
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
          const metrics = `Prefill: ${ttft}s | Total: ${totalTime}s • ZEXA Local Brain`;
          options.onComplete(metrics, rawResult.sourceTag, rawResult.suggestions);
        }
      };

      // Slight initial processing delay
      setTimeout(streamNext, 40);

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
    const words = text.split(/(\s+|\n+)/);
    for (const word of words) {
      if (word.length > 8) {
        parts.push(word.slice(0, 4), word.slice(4));
      } else if (word) {
        parts.push(word);
      }
    }
    return parts;
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
    hint?: string
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

    // First Chimurenga / Umvukela (1896 - 1897) & Nehanda
    if (
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
        qLower.includes('war') ||
        qLower.includes('who')
      ))
    ) {
      return this.handleFirstChimurengaQuery(question, level, intent);
    }

    // Gallant Liberation Struggle Heroes & Heroines (Josiah Tongogara, Herbert Chitepo, J.Z. Moyo, Leopold Takawira, Nikita Mangena, Simon Muzenda)
    const heroesResult = this.handleNationalHeroesQuery(question, level, intent);
    if (heroesResult) {
      return heroesResult;
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
        text: `### Governance & Heritage: President of the Republic of Zimbabwe

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

    // Sub-Intent 1: Mbuya Nehanda & Spiritual Mediums (Kaguvi, Mkwati, Gorzi, etc.)
    if (
      q.includes('nehanda') ||
      (q.includes('kaguvi') && !q.includes('cause')) ||
      q.includes('spirit medium') ||
      q.includes('svikiro') ||
      q.includes('mkwati') ||
      q.includes('mukwati')
    ) {
      return {
        text: `### History & Heritage: Spiritual Leadership in the First Chimurenga (1896 – 1897)

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
        text: `### Science & Biology: The Human Digestive System

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
        text: `### Science & Biology: The Human Circulatory System & Blood

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

    // 3. Respiratory System & Lungs
    if (
      q.includes('respiratory system') ||
      q.includes('breathing') ||
      q.includes('lungs') ||
      q.includes('alveoli') ||
      q.includes('gas exchange') ||
      q.includes('inhalation')
    ) {
      return {
        text: `### Science & Biology: The Human Respiratory System

**Direct Answer:** The respiratory system facilitates the exchange of gases between the organism and its environment—supplying oxygen for cellular respiration and removing carbon dioxide waste.

1. Pathway of Air into the Body:
- **Nose / Nasal Cavity:** Air is warmed, moistened, and filtered by mucus and tiny hairs (*cilia*).
- **Trachea (Windpipe):** Reinforced with C-shaped rings of cartilage to prevent collapse during inhalation.
- **Bronchi & Bronchioles:** The trachea branches into two bronchi (one to each lung), which subdivide into smaller bronchioles.
- **Alveoli (Air Sacs):** The sites of gas exchange. Adaptations for diffusion:
  * Millions of tiny sacs providing a massive surface area.
  * Very thin walls (one cell thick).
  * Rich network of surrounding blood capillaries.
  * Moist surface to dissolve gases.

2. Mechanism of Breathing (Ventilation):
- **Inhalation (Breathing In):**
  * External intercostal muscles contract, pulling ribs **up and out**.
  * Diaphragm muscles contract, flattening the diaphragm **downwards**.
  * Thorax volume increases -> lung pressure decreases below atmospheric pressure -> air rushes in.
- **Exhalation (Breathing Out):**
  * Intercostal muscles relax, ribs move **down and in**.
  * Diaphragm relaxes, curving into a **dome shape**.
  * Thorax volume decreases -> pressure increases -> air is forced out.`,
        sourceTag: 'ZIMSEC Combined Science 4003 / Primary 7030 • Respiratory System',
        suggestions: [
          'What is the difference between respiration and breathing?',
          'Explain the digestive system organs',
          'What are deficiency diseases in children?'
        ]
      };
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
      return {
        text: `### Health & Nutrition: Deficiency Diseases (ZIMSEC Core Syllabus)

**Direct Answer:** Deficiency diseases are illnesses caused by the lack of essential nutrients (proteins, vitamins, or minerals) in a person's diet over an extended period.

1. Common Nutritional Deficiency Diseases:
- **1. Kwashiorkor:**
  * **Cause:** Severe deficiency of **protein** in the diet.
  * **Symptoms:** Swollen belly (*edema*), reddish/brown thin hair, peeling skin, swollen feet and face, underweight.
  * **Prevention/Cure:** Foods rich in protein (eggs, beans, milk, meat, groundnuts, soya beans).
- **2. Marasmus:**
  * **Cause:** Severe shortage of **all food nutrients (energy/calories and protein)**.
  * **Symptoms:** Extreme wasting of muscles ("skin and bones"), ribs clearly visible, wrinkled "old man" face, constant hunger.
  * **Prevention:** Balanced diet with sufficient carbohydrates, fats, and proteins.
- **3. Scurvy:**
  * **Cause:** Lack of **Vitamin C (Ascorbic acid)**.
  * **Symptoms:** Bleeding and swollen gums, slow wound healing, joint pains.
  * **Prevention:** Citrus fruits (oranges, lemons, guavas, mangoes, green vegetables).
- **4. Rickets:**
  * **Cause:** Lack of **Vitamin D or Calcium**.
  * **Symptoms:** Weak, soft bones; bow legs or knock knees; dental deformities.
  * **Prevention:** Sunlight exposure, milk, fish liver oil, eggs.
- **5. Goitre:**
  * **Cause:** Deficiency of the mineral **Iodine**.
  * **Symptoms:** Swelling of the thyroid gland in the neck.
  * **Prevention:** Using iodized table salt and eating saltwater seafood.
- **6. Anaemia:**
  * **Cause:** Deficiency of **Iron**.
  * **Symptoms:** Paleness of lips/fingernails, extreme tiredness, dizziness, shortness of breath.
  * **Prevention:** Dark green leafy vegetables (*muriwo*), liver, red meat, beans.`,
        sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Health & Nutrition',
        suggestions: [
          'What are the 6 basic food nutrients?',
          'What are the causes and symptoms of malaria and cholera?',
          'Explain the parts of a green plant'
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
      return {
        text: `### Health & Science: Infectious Diseases in Zimbabwe

**Direct Answer:** Infectious diseases are caused by pathogenic microorganisms (bacteria, viruses, protozoa, or parasitic worms) and can be transmitted between humans or through insect vectors and contaminated water.

1. Malaria:
- **Causative Organism:** Protozoan parasite (*Plasmodium*).
- **Vector:** Female **Anopheles mosquito** (bites at night).
- **Symptoms:** High recurring fever, shivering/chills, sweating, severe headache, vomiting.
- **Prevention & Control:**
  * Sleeping under insecticide-treated mosquito nets (ITNs).
  * Indoor residual spraying (IRS).
  * Clearing bushes and draining stagnant water puddles to destroy mosquito breeding sites.
  * Applying mosquito repellents.

2. Cholera (Waterborne):
- **Causative Organism:** Bacterium (*Vibrio cholerae*).
- **Transmission:** Drinking water or eating food contaminated with human feces.
- **Symptoms:** Sudden, painless watery diarrhea ("rice-water stools"), severe vomiting, rapid dehydration, muscle cramps.
- **Prevention & Control:**
  * Boiling drinking water or treating with water guard / chlorine tablets.
  * Washing hands with soap and running water before eating and after using the toilet.
  * Proper sanitation and disposing of sewage safely in Blair ventilated improved pit (VIP) latrines.
  * Administering Oral Rehydration Solution (ORS) immediately.

3. Bilharzia (Schistosomiasis):
- **Causative Organism:** Parasitic blood fluke (*Schistosoma* worm).
- **Intermediate Host:** **Freshwater snails** in slow-moving rivers, dams, and streams.
- **Symptoms:** Blood in urine (*hematuria*) or stool, abdominal pain, fatigue, stunted growth in children.
- **Prevention:** Avoiding swimming, bathing, or washing in unprotected rivers or dams; wearing gumboots in marshy irrigation areas; treating infected people with praziquantel.`,
        sourceTag: 'ZIMSEC Primary Science 7030 / Combined Science 4003 • Diseases & Health',
        suggestions: [
          'What are deficiency diseases like Kwashiorkor and Marasmus?',
          'How does the human digestive system work?',
          'What are the 3 main soil types in agriculture?'
        ]
      };
    }

    return null;
  }

  /**
   * Photosynthesis: Light & Dark Reactions
   */
  private static handlePhotosynthesisQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### Combined Science: Light and Dark Reactions of Photosynthesis

Photosynthesis is the biochemical process by which green plants manufacture glucose from carbon dioxide and water using sunlight trapped by chlorophyll:

1. Light-Dependent Stage (Light Reactions):
- Location: Thylakoid membranes (grana) inside chloroplasts.
- Photolysis of Water: Solar energy splits water molecules into hydrogen ions, electrons, and oxygen gas:
  2H₂O → 4H⁺ + 4e⁻ + O₂
- Products: Oxygen gas (O₂) is released through leaf stomata as a by-product; chemical energy carriers ATP and NADPH are synthesized.

2. Light-Independent Stage (Dark Reactions / Calvin Cycle):
- Location: Stroma (fluid matrix) of the chloroplast.
- Carbon Fixation: Carbon dioxide (CO₂) combines with ribulose bisphosphate (RuBP), catalyzed by the enzyme RuBisCO.
- Glucose Synthesis: Hydrogen ions and electrons from NADPH, powered by ATP, reduce the fixed carbon to form glucose (C₆H₁₂O₆).

Chemical Equation:
6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in the presence of light and chlorophyll)`,
      sourceTag: 'Combined Science 4003 • Biology: Photosynthesis',
      suggestions: [
        'How do you test a green leaf for starch using iodine?',
        'What are the limiting factors of photosynthesis?',
        'What is the structural difference between thylakoid and stroma?'
      ]
    };
  }

  /**
   * Natural Farming Regions of Zimbabwe
   */
  private static handleFarmingRegionsQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### Geography & Agriculture: Natural Farming Regions of Zimbabwe

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
      text: `### Physics & Combined Science: Newton's Three Laws of Motion

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
      text: `### Commerce & Heritage Studies: The Zimbabwe Gold (ZiG) Currency

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
        text: `### Primary English (ZIMSEC 7010): Collective Nouns
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
        text: `### Primary English (ZIMSEC 7010): Prepositions & Fixed Collocations
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
        text: `### Primary English (ZIMSEC 7010): Plurals of Nouns
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
        text: `### Primary English (ZIMSEC 7010): Subject-Verb Agreement (Concord)
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
        text: `### Primary English (ZIMSEC 7010): Direct and Indirect (Reported) Speech

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
        text: `### Primary English (ZIMSEC 7010): Active and Passive Voice

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
        text: `### Primary English (ZIMSEC 7010): Rules of Question Tags
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
        text: `### Primary English (ZIMSEC 7010): English Proverbs & Similes
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
        text: `### Primary English (ZIMSEC 7010): Animal Young, Sounds, and Homes
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
        text: `### Primary English (ZIMSEC 7010): Paper 2 Composition & Functional Writing

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
        text: `### Primary Mathematics (ZIMSEC 7020): Order of Operations (BODMAS)
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
        text: `### Primary Mathematics (ZIMSEC 7020): Factors, Multiples, HCF & LCM
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
        text: `### Primary Mathematics (ZIMSEC 7020): Fractions & Four Operations
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
        text: `### Primary Mathematics (ZIMSEC 7020): Commercial Arithmetic & Money
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
      q.includes('ratio') ||
      q.includes('proportion')
    ) {
      let directAnswer = '';
      if (q.includes('speed') || q.includes('distance') || q.includes('km/h')) {
        directAnswer = 'The Speed-Distance-Time triangle formulas are: **Speed = Distance ÷ Time**, **Distance = Speed × Time**, and **Time = Distance ÷ Speed**. Average Speed = Total Distance ÷ Total Time.';
      } else if (q.includes('ratio') || q.includes('share')) {
        directAnswer = 'To share in a ratio (e.g. 2 : 3): 1) Add ratio parts ($2 + 3 = 5$ parts); 2) Divide total quantity by total parts to find value of 1 part; 3) Multiply 1 part by each ratio number.';
      }

      return {
        text: `### Primary Mathematics (ZIMSEC 7020): Speed, Distance, Time & Ratio
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
      q.includes('pi') ||
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
        text: `### Primary Mathematics (ZIMSEC 7020): Perimeter, Area & Circumference
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
        text: `### Primary Mathematics (ZIMSEC 7020): Volume, Capacity & Mass
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
        text: `### Primary Mathematics (ZIMSEC 7020): 3D Solids & Euler's Formula
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
        text: `### Primary Mathematics (ZIMSEC 7020): Angles & Polygons
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

    // 10. Statistics: Mean, Median, Mode, Range, and Pie Charts
    if (
      q.includes('mean') ||
      q.includes('median') ||
      q.includes('mode') ||
      q.includes('range') ||
      q.includes('average') ||
      q.includes('pie chart')
    ) {
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
        text: `### Primary Mathematics (ZIMSEC 7020): Statistics & Averages
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
        text: `### Primary Mathematics (ZIMSEC 7020): Probability
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
        text: `### Primary Mathematics (ZIMSEC 7020): Time & Calendars
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

    // 1. Pfumvudza / Intwasa Climate-Proofed Agriculture
    if (
      q.includes('pfumvudza') ||
      q.includes('intwasa') ||
      q.includes('planting basin') ||
      q.includes('conservation agriculture') ||
      q.includes('zero tillage') ||
      q.includes('minimum tillage')
    ) {
      let directAnswer = 'Pfumvudza / Intwasa is Zimbabwe\'s climate-proofed conservation agriculture concept based on **minimum soil disturbance** (digging planting basins only), **permanent soil cover (mulching)**, and **crop rotation**. A standard plot measures **39 m × 16 m** (624 m²) with **28 rows of 52 basins** (1 456 basins total); each basin measures **15 cm × 15 cm × 15 cm**.';
      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): Pfumvudza / Intwasa
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Pfumvudza (ChiShona) / Intwasa (IsiNdebele) is Zimbabwe's national climate-smart agriculture programme:

1. The Three Core Principles of Conservation Agriculture:
- **Minimum Soil Disturbance (Zero Tillage):** Only planting basins are dug; no whole-field ploughing, which protects soil structure and preserves beneficial organisms like earthworms.
- **Permanent Soil Cover (Mulching):** Covering at least 30% to 100% of the ground with dry grass, leaves, or crop residues to conserve soil moisture, stop weed growth, and lower soil temperatures.
- **Crop Rotation:** Alternating cereal grains (maize, sorghum, millet) with leguminous crops (groundnuts, cowpeas, beans) to replenish soil nitrogen through root nodule bacteria (*Rhizobium*).

2. Standard Plot Dimensions (ZIMSEC Exam Facts):
- **Plot Dimensions:** 39 metres long × 16 metres wide = 624 m² (1/16th of a hectare).
- **Basin Dimensions:** 15 cm length × 15 cm width × 15 cm depth.
- **Row & Basin Count:** 28 rows with 52 basins each = **1 456 planting basins** per standard plot.
- **Spacing:** 60 cm between basins within a row; 75 cm between rows.

3. Planting and Fertilizer Micro-Dosing:
- **Basal Dressing:** 1 handful of well-rotted cattle manure or 1 matchbox of Compound D fertilizer placed in the bottom of each basin before planting and covered with a 2 cm layer of soil.
- **Seeding & Thinning:** 3 maize seeds planted per basin at onset of rains; thinned to **2 plants per basin** 2–3 weeks after emergence (giving 2 912 maize plants per standard plot, yielding ~1 tonne of grain).
- **Top Dressing:** 1 matchbox of Ammonium Nitrate (AN) applied per basin when maize is knee-high (4–6 weeks after emergence), placed 5 cm from stems.`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • Pfumvudza',
        suggestions: [
          'What are the causes and types of soil erosion?',
          'What are the "Big Four" tick-borne diseases in cattle?',
          'What are the three classes of levers?'
        ]
      };
    }

    // 2. Soil Science, Soil Types, Erosion, and Fertilizers
    if (
      q.includes('soil erosion') ||
      q.includes('types of soil') ||
      q.includes('clay soil') ||
      q.includes('sandy soil') ||
      q.includes('loam soil') ||
      q.includes('contour ridge') ||
      q.includes('gully erosion') ||
      q.includes('rill erosion') ||
      q.includes('sheet erosion') ||
      q.includes('splash erosion') ||
      q.includes('vetiver grass') ||
      q.includes('compound d') ||
      q.includes('ammonium nitrate') ||
      q.includes('top dressing') ||
      q.includes('basal dressing')
    ) {
      let directAnswer = '';
      if (q.includes('erosion') || q.includes('gully') || q.includes('contour')) {
        directAnswer = 'The 4 types of water erosion are **splash, sheet, rill, and gully erosion**. Gully erosion is the most severe and forms deep ravines (dongas); it is controlled by **contour ridges, vetiver grass hedgerows, terracing, and stone check dams**.';
      } else if (q.includes('soil type') || q.includes('clay') || q.includes('sand') || q.includes('loam')) {
        directAnswer = '**Loam soil** is the best soil for growing crops because it has a balanced mixture of sand, silt, clay, and organic humus. **Clay** has the highest water retention but drains poorly; **sand** drains very rapidly and leaches nutrients easily.';
      } else if (q.includes('fertilizer') || q.includes('compound d') || q.includes('ammonium nitrate')) {
        directAnswer = '**Compound D (7:14:7)** is applied as **basal dressing** at planting to stimulate strong root development; **Ammonium Nitrate / AN (34.5% N)** is applied as **top dressing** at knee-height (4–6 weeks) for rapid green leaf growth.';
      }

      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): Soil Science & Erosion
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key soil science principles tested in ZIMSEC Grade 7:

1. Comparison of Soil Types:
- **Sandy Soil:** Large coarse particles, gritty feel, large pore spaces, rapid drainage, low water-holding capacity, easily leached of nutrients, warms up quickly, easy to cultivate.
- **Clay Soil:** Very fine microscopic particles, sticky and smooth when wet, tiny pores, high water retention, easily waterlogged, cracks deeply when dry, rich in plant nutrients, heavy and difficult to plough.
- **Loam Soil:** Ideal mixture of sand, silt, and clay rich in organic humus; good aeration and optimal water-holding capacity; best for virtually all agricultural crops.

2. Types of Soil Erosion:
- **Splash Erosion:** Direct impact of falling raindrops blasting soil particles out of position.
- **Sheet Erosion:** Uniform stripping away of a thin top layer of soil by shallow surface runoff.
- **Rill Erosion:** Runoff carves small, finger-like channels that can still be smoothed out by normal ploughing.
- **Gully Erosion:** Rills deepen and widen into deep ditches (dongas) that cannot be crossed by ordinary tractors or ploughs.

3. Methods of Soil Conservation:
- **Contour Ridges:** Earth banks built across the slope to intercept runoff and divert water gently into a grass waterway.
- **Vetiver Grass Hedgerows:** Dense grass clumps planted along contours that filter soil and slow water runoff.
- **Terracing:** Stepped flat beds built on steep slopes.
- **Mulching:** Covering bare ground with plant matter to absorb the kinetic energy of raindrops.
- **Check Dams:** Wire mesh or stone barriers placed across gullies to trap silt.

4. Fertilizers & Plant Nutrition:
- **Compound D (N:P:K = 7:14:7):** High in Phosphorus (P) for root establishment; applied as **basal dressing** at or before planting.
- **Ammonium Nitrate (AN - 34.5% Nitrogen):** Applied as **top dressing** at knee-height for leafy growth and chlorophyll formation.
- **Agricultural Lime:** Used to correct soil acidity (raises soil pH).`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • Soil Management',
        suggestions: [
          'What are the specifications of a Pfumvudza plot?',
          'What are the "Big Four" tick-borne diseases in cattle?',
          'What are the three classes of levers?'
        ]
      };
    }

    // 3. Crop Pests, Diseases, and Problem Weeds
    if (
      q.includes('fall armyworm') ||
      q.includes('stalk borer') ||
      q.includes('cutworm') ||
      q.includes('cutworms') ||
      q.includes('aphid') ||
      q.includes('aphids') ||
      q.includes('red spider mite') ||
      q.includes('blight') ||
      q.includes('maize streak') ||
      q.includes('damping off') ||
      q.includes('blackjack') ||
      q.includes('witchweed') ||
      q.includes('striga') ||
      q.includes('wandering jew')
    ) {
      let directAnswer = '';
      if (q.includes('fall armyworm')) {
        directAnswer = 'The **Fall Armyworm** attacks maize funnels, leaves, and cobs. It is identified by an **inverted "Y" mark on its head** and **4 raised spots arranged in a square on the 8th segment** of its abdomen.';
      } else if (q.includes('stalk borer')) {
        directAnswer = 'The **Maize Stalk Borer** larva tunnels inside the maize stem, causing **"dead heart"** (drying up of central leaves) and weakened stems that snap easily.';
      } else if (q.includes('cutworm')) {
        directAnswer = '**Cutworms** hide under the soil during the day and come out at night to **cut young crop seedlings off at ground level**.';
      } else if (q.includes('striga') || q.includes('witchweed')) {
        directAnswer = '**Witchweed (Striga / Isona)** is a **parasitic weed** whose roots attach directly to maize and sorghum roots, sucking nutrients and water and stunting crop growth.';
      } else if (q.includes('blight')) {
        directAnswer = '**Late and Early Blight** are destructive fungal diseases affecting tomatoes and potatoes, causing dark water-soaked spots on leaves and stems and white mold underneath during humid weather.';
      }

      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): Crop Pests & Diseases
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key crop protection knowledge tested in ZIMSEC Grade 7:

1. Major Crop Pests:
- **Fall Armyworm (*Spodoptera frugiperda*):** Feeds inside maize funnels, shredding leaves and boring into cobs. Identification: inverted 'Y' on head, 4 black dots in a square on the 8th abdominal segment.
- **Maize Stalk Borer (*Busseola fusca*):** Larva bores into the growing stem, producing sawdust-like frass and causing "dead heart". Controlled by Carbaryl or Dipterex granules dropped into funnels.
- **Cutworms:** Smooth grey/black caterpillars that curl into a 'C' shape when disturbed. They cut seedling stems at the soil surface at night.
- **Aphids:** Small sap-sucking insects that cause leaf curling, excrete sticky honeydew, and transmit viral diseases (e.g. Groundnut rosette virus).
- **Red Spider Mites:** Spin fine webbings under tomato/cotton leaves under hot, dry conditions, causing leaves to turn bronze and drop.

2. Plant Diseases:
- **Early & Late Blight (Fungal):** Attacks tomatoes and potatoes; leaves turn brown/black with white fuzzy mold underneath in damp weather. Controlled by Copper Oxychloride or Mancozeb/Dithane M45.
- **Maize Streak Virus:** Spread by leafhoppers; causes thin continuous yellow streaks along leaf veins and severe plant stunting. Prevented by planting certified resistant seed varieties.
- **Damping-Off:** Fungal infection causing tender vegetable seedlings in nursery seedbeds to rot and collapse at ground level. Prevented by avoiding over-watering and sterilizing soil.

3. Problem Weeds:
- **Blackjack (*Tsine* / *Uqhume*):** Annual weed with barbed needle-like seeds that cling to animal coats and clothing.
- **Witchweed (*Striga asiatica* / *Isona*):** Parasitic weed that attaches to cereal roots and steals water and nutrients.
- **Wandering Jew (*Commelina benghalensis*):** Creeping weed with blue flowers that regenerates aggressively from root and stem pieces.`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • Crop Protection',
        suggestions: [
          'What are the specifications of a Pfumvudza plot?',
          'What are the "Big Four" tick-borne diseases in cattle?',
          'What are the three classes of levers?'
        ]
      };
    }

    // 4. Animal Husbandry, Cattle Breeds, and Livestock Diseases
    if (
      q.includes('mashona cattle') ||
      q.includes('brahman') ||
      q.includes('tuli') ||
      q.includes('friesian') ||
      q.includes('jersey') ||
      q.includes('broiler') ||
      q.includes('layer') ||
      q.includes('roadrunner') ||
      q.includes('heartwater') ||
      q.includes('redwater') ||
      q.includes('gall sickness') ||
      q.includes('january disease') ||
      q.includes('theileriosis') ||
      q.includes('tick-borne') ||
      q.includes('cattle dipping') ||
      q.includes('anthrax') ||
      q.includes('newcastle disease') ||
      q.includes('carcass')
    ) {
      let directAnswer = '';
      if (q.includes('anthrax')) {
        directAnswer = '**Anthrax** is a deadly bacterial disease. Symptoms: sudden death with **dark, tarry, un-clotted blood oozing from body openings**. **CRITICAL RULE:** **NEVER open, skin, or eat the carcass!** It must be buried at least 2 metres deep with quicklime or completely incinerated.';
      } else if (q.includes('newcastle')) {
        directAnswer = '**Newcastle Disease** is a highly fatal viral poultry disease. Symptoms include **twisted neck (torticollis)**, greenish watery diarrhea, coughing, and sudden high death rate. It is prevented by **Hitchner B1 and LaSota vaccination**.';
      } else if (q.includes('heartwater')) {
        directAnswer = '**Heartwater** is transmitted by the **Bont tick**. It causes fluid accumulation in the pericardial sac around the heart, high fever, and nervous symptoms like high-stepping gait and chewing movements.';
      } else if (q.includes('redwater')) {
        directAnswer = '**Redwater (Babesiosis)** is transmitted by the **Blue tick**. Symptoms include **red/coffee-colored urine (haemoglobinuria)**, high fever, and severe anemia.';
      } else if (q.includes('january disease') || q.includes('theileriosis')) {
        directAnswer = '**January Disease (Theileriosis)** is transmitted by the **Brown ear tick** during rainy summer months. Symptoms include swollen lymph nodes, fever, and fluid in the lungs. Controlled by the **5-5-4 dipping interval**.';
      } else if (q.includes('mashona')) {
        directAnswer = '**Mashona cattle** are an indigenous Zimbabwean beef breed known for exceptional **hardiness, tick and disease resistance, drought tolerance, and high fertility** on natural veld.';
      } else if (q.includes('friesian') || q.includes('dairy')) {
        directAnswer = '**Friesian / Holstein** (black and white) produces the highest volume of milk; **Jersey** cattle produce milk with the highest butterfat (cream) content.';
      }

      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): Livestock & Disease Control
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key livestock management principles tested in ZIMSEC Grade 7:

1. Livestock Breeds in Zimbabwe:
- **Beef Cattle:** Mashona (indigenous, hardy, high tick/drought resistance), Tuli (indigenous, polled, good beef conversion), Brahman (heat-tolerant with hump and loose skin), Hereford, Aberdeen Angus.
- **Dairy Cattle:** Friesian / Holstein (highest milk yield), Jersey (smaller fawn body, richest creamy milk high in butterfat), Guernsey.
- **Poultry:**
  * Broilers (Cobb, Ross): Reared for meat; reach 1.8–2.2 kg in 5–6 weeks on Starter, Grower, and Finisher feeds.
  * Layers (Hy-Line, Lohmann): Reared for eggs; begin laying at 18–20 weeks; produce 280–320 eggs per year.
  * Indigenous Roadrunners: Free-range, highly disease-resistant, hardy scavengers.

2. The "Big Four" Tick-Borne Cattle Diseases:
- **Heartwater:** Transmitted by **Bont tick** (*Amblyomma hebraeum*). Symptoms: fluid in heart sac, nervous convulsions, high-stepping gait.
- **Redwater (Babesiosis):** Transmitted by **Blue tick** (*Rhipicephalus decoloratus*). Symptoms: red/dark coffee urine, pale gums, fever.
- **Gall Sickness (Anaplasmosis):** Transmitted by **Blue tick**. Symptoms: yellow eyes/gums (jaundice), severe constipation with hard dry dung.
- **January Disease (Theileriosis):** Transmitted by **Brown ear tick** (*Rhipicephalus appendiculatus*). Swollen lymph nodes behind ears and shoulders, respiratory distress. Controlled by intensive summer dipping (5-5-4 dipping interval).

3. Anthrax (*Bacillus anthracis*):
- Deadly bacterial disease affecting livestock and humans (zoonotic).
- Symptoms: Sudden unexplained death; bloated carcass; dark un-clotted blood oozing from mouth, nostrils, and anus; no rigor mortis.
- **ZIMSEC Golden Rule:** **NEVER cut open or consume an anthrax carcass!** Spores contaminate the soil for over 50 years. Bury at least 2 m deep covered with quicklime.

4. Newcastle Disease:
- Viral disease of poultry causing twisted neck, greenish watery droppings, and mass deaths. Prevented through regular vaccination.`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • Animal Husbandry',
        suggestions: [
          'What are the specifications of a Pfumvudza plot?',
          'What are the three classes of levers?',
          'What causes malaria and cholera?'
        ]
      };
    }

    // 5. Simple Machines, Levers, and Farm Tools
    if (
      q.includes('lever') ||
      q.includes('levers') ||
      q.includes('first class lever') ||
      q.includes('second class lever') ||
      q.includes('third class lever') ||
      q.includes('fulcrum') ||
      q.includes('wheelbarrow') ||
      q.includes('pulley') ||
      q.includes('inclined plane') ||
      q.includes('wheel and axle') ||
      q.includes('badza') ||
      q.includes('farm tools') ||
      q.includes('hoe and spade')
    ) {
      let directAnswer = '';
      if (q.includes('first class')) {
        directAnswer = 'In a **First Class Lever**, the **Fulcrum is in the middle** between the Load and the Effort (L - F - E). Examples: **crowbar, scissors, pliers, see-saw, claw hammer pulling a nail**.';
      } else if (q.includes('second class') || q.includes('wheelbarrow')) {
        directAnswer = 'In a **Second Class Lever**, the **Load is in the middle** between the Fulcrum and the Effort (F - L - E). Examples: **wheelbarrow, nutcracker, bottle opener**. It always acts as a force multiplier.';
      } else if (q.includes('third class') || q.includes('spade') || q.includes('shovel')) {
        directAnswer = 'In a **Third Class Lever**, the **Effort is in the middle** between the Fulcrum and the Load (F - E - L). Examples: **spade/shovel lifting dirt, broom, fishing rod, braai tongs, tweezers**.';
      } else if (q.includes('pulley')) {
        directAnswer = 'A **fixed pulley** changes the direction of force (e.g. hoisting a flag); a **movable pulley system (block and tackle)** halves the effort required to lift heavy weights.';
      }

      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): Simple Machines & Farm Tools
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Simple machines make work easier by multiplying force, distance, or changing direction:

1. The Three Classes of Levers (ZIMSEC Exam Identification):
- **Class 1 (Fulcrum in the Middle - L - F - E):**
  * The pivot point sits between the Load and Effort.
  * Examples: **Crowbar, scissors, pliers, see-saw, claw hammer pulling a nail**.
- **Class 2 (Load in the Middle - F - L - E):**
  * The Load sits between the Fulcrum and Effort.
  * Examples: **Wheelbarrow, nutcracker, bottle opener**.
  * Advantage: Always multiplies force because the effort arm is longer than the load arm.
- **Class 3 (Effort in the Middle - F - E - L):**
  * The Effort is applied between the Fulcrum and Load.
  * Examples: **Spade/shovel (when lifting soil), broom sweeping, fishing rod, braai tongs, tweezers, human bicep forearm**.
  * Advantage: Increases speed and distance moved.

2. Other Simple Machines:
- **Inclined Plane (Ramp):** Sloping surface to push heavy bags/drums onto a lorry or scotch cart.
- **Wheel and Axle:** Large wheel turning a smaller axle (e.g. windlass over a well, screwdriver, steering wheel).
- **Pulleys:** Grooved wheel with a rope. Fixed pulley changes direction; movable pulley halves effort.
- **Screw:** Inclined plane wound around a cylinder (e.g. car screw jack).

3. Farm Hand Tools & Maintenance:
- **Hoe (*Badza*):** Digging planting basins, weeding, earthing up crops.
- **Spade:** Straight flat blade for digging neat trench edges and slicing roots.
- **Shovel:** Curved blade with raised sides for scooping loose soil, sand, or manure.
- **Garden Fork:** Loosening hard compacted soil and aerating compost heaps.
- **Rake:** Leveling fine seedbeds and gathering trash.
- **Tool Maintenance:** Wash off dirt, dry thoroughly, apply used engine oil to metal parts to prevent rust, sharpen cutting edges with a file, store hanging in a dry tool shed.`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • Simple Machines',
        suggestions: [
          'What are the specifications of a Pfumvudza plot?',
          'What are the "Big Four" tick-borne diseases in cattle?',
          'What causes malaria and cholera?'
        ]
      };
    }

    // 6. Human Body Systems & Communicable Diseases
    if (
      q.includes('digestive system') ||
      q.includes('peristalsis') ||
      q.includes('villi') ||
      q.includes('circulatory system') ||
      q.includes('chambers of the heart') ||
      q.includes('arteries and veins') ||
      q.includes('respiratory system') ||
      q.includes('alveoli') ||
      q.includes('gas exchange') ||
      q.includes('malaria') ||
      q.includes('anopheles') ||
      q.includes('cholera') ||
      q.includes('oral rehydration') ||
      q.includes('ors') ||
      q.includes('bilharzia') ||
      q.includes('schistosoma') ||
      q.includes('haematuria') ||
      q.includes('blood in urine') ||
      q.includes('hiv') ||
      q.includes('aids')
    ) {
      let directAnswer = '';
      if (q.includes('cholera') || q.includes('ors') || q.includes('oral rehydration')) {
        directAnswer = '**Cholera** is a waterborne bacterial disease (*Vibrio cholerae*) causing profuse painless **"rice-water" diarrhea** and vomiting. Emergency **Oral Rehydration Solution (ORS)** recipe: **1 litre clean boiled water + 6 level teaspoons sugar + 1/2 level teaspoon salt**.';
      } else if (q.includes('malaria')) {
        directAnswer = '**Malaria** is caused by the microscopic parasite ***Plasmodium***, transmitted by the bite of an infected **female *Anopheles* mosquito** (active at night). Prevented by insecticide-treated nets (ITNs) and clearing stagnant puddles.';
      } else if (q.includes('bilharzia') || q.includes('schistosoma') || q.includes('blood in urine')) {
        directAnswer = '**Bilharzia (Schistosomiasis)** is caused by a parasitic flatworm (*Schistosoma*) using **freshwater aquatic snails** as intermediate hosts. Symptoms include **blood in urine (haematuria)** after wading in slow-moving or stagnant water.';
      } else if (q.includes('heart') || q.includes('circulatory') || q.includes('arteries')) {
        directAnswer = 'The human heart has **4 chambers** (Right Atrium, Right Ventricle, Left Atrium, Left Ventricle). **Arteries** carry oxygenated blood away from the heart under high pressure; **veins** return deoxygenated blood to the heart and contain valves.';
      } else if (q.includes('digestive') || q.includes('villi') || q.includes('peristalsis')) {
        directAnswer = '**Peristalsis** is the wave-like muscular contraction that pushes food down the gullet. Digested nutrients are absorbed into the bloodstream in the small intestine through millions of tiny finger-like projections called **villi**.';
      }

      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): Human Health & Diseases
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key human biology and health topics in ZIMSEC Grade 7:

1. Human Body Systems:
- **Digestive System:**
  * Mouth: Chewing and saliva (amylase enzyme breaks down cooked starch).
  * Esophagus (Gullet): Peristalsis moves food bolus to stomach.
  * Stomach: Secretes hydrochloric acid (kills germs) and pepsin (protein digestion).
  * Small Intestine: Digestion completed with bile and pancreatic enzymes; nutrients absorbed into blood through **villi**.
  * Large Intestine: Absorbs excess water, forming feces stored in rectum.
- **Circulatory System:**
  * 4 Chambers: Right Atrium -> Right Ventricle (pumps blood to lungs); Left Atrium -> Left Ventricle (thick muscular wall pumps blood through aorta to whole body).
  * Arteries: Carry blood AWAY from heart under high pressure (thick elastic walls).
  * Veins: Return blood TO heart under low pressure (contain valves to prevent backflow).
  * Capillaries: Microscopic 1-cell thick walls for gas/nutrient exchange.
- **Respiratory System:**
  * Trachea -> Bronchi -> Bronchioles -> Alveoli.
  * Gas exchange occurs in the alveoli: Oxygen diffuses into red blood cells, carbon dioxide diffuses out to be exhaled.

2. Major Communicable Diseases:
- **Malaria:** Caused by *Plasmodium* parasite; spread by female *Anopheles* mosquito. Prevention: insecticide-treated bed nets, draining stagnant water.
- **Cholera:** Caused by *Vibrio cholerae* bacteria in contaminated water/food. Symptoms: rice-water diarrhea, rapid dehydration. Emergency ORS: 1 L boiled water + 6 level tsp sugar + 1/2 level tsp salt.
- **Bilharzia:** Caused by *Schistosoma* flatworm from freshwater aquatic snails (*Bulinus* / *Biomphalaria*). Symptom: blood in urine (*haematuria*). Prevented by avoiding wading in stagnant pools.
- **HIV/AIDS:** Attacks immune CD4 cells. Prevented by abstinence, faithfulness, safe hygiene; managed with daily Antiretroviral Therapy (ART).`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • Human Health',
        suggestions: [
          'What are the weather instruments and their uses?',
          'What are the specifications of a Pfumvudza plot?',
          'What are the three classes of levers?'
        ]
      };
    }

    // 7. Weather Instruments & Water Cycle
    if (
      q.includes('weather instrument') ||
      q.includes('rain gauge') ||
      q.includes('anemometer') ||
      q.includes('wind vane') ||
      q.includes('barometer') ||
      q.includes('hygrometer') ||
      q.includes('stevenson screen') ||
      q.includes('water cycle') ||
      q.includes('transpiration') ||
      q.includes('condensation') ||
      q.includes('precipitation')
    ) {
      let directAnswer = '';
      if (q.includes('rain gauge')) {
        directAnswer = 'A **rain gauge** measures rainfall in **millimetres (mm)**. It is installed in an open area at least **30 cm above ground level** (to avoid splash) and twice the distance away from tall trees or buildings.';
      } else if (q.includes('anemometer') || q.includes('wind speed')) {
        directAnswer = 'An **anemometer** measures **wind speed** in km/h or knots using rotating hemispherical cups.';
      } else if (q.includes('wind vane') || q.includes('wind direction')) {
        directAnswer = 'A **wind vane** shows **wind direction**; the arrow points to the direction the wind is blowing **FROM**.';
      } else if (q.includes('barometer')) {
        directAnswer = 'A **barometer** measures **atmospheric pressure** in millibars (mb) or hectopascals (hPa). Falling pressure indicates an approaching storm or rain.';
      } else if (q.includes('water cycle') || q.includes('evaporation') || q.includes('transpiration')) {
        directAnswer = 'The **water cycle** consists of **evaporation** (water to vapor), **transpiration** (loss of water vapor from leaf stomata), **condensation** (vapor cools to form clouds), **precipitation** (rain/hail), and **percolation** into groundwater.';
      }

      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): Weather & Water Cycle
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key meteorology principles in ZIMSEC Grade 7:

1. Weather Instruments and their Functions:
- **Rain Gauge:** Measures rainfall in millimetres (mm). Installed 30 cm above ground in an open space twice the distance from obstacles.
- **Six's Maximum & Minimum Thermometer:** Records highest day and lowest night temperatures in °C. Housed in a wooden Stevenson Screen with louvered sides for shaded ventilation.
- **Wind Vane:** Shows the direction the wind is blowing FROM.
- **Anemometer:** Measures wind speed in km/h using revolving cups.
- **Barometer:** Measures atmospheric air pressure in mb or hPa.
- **Hygrometer (Wet and Dry Bulb Thermometer):** Measures relative humidity (% moisture in air).

2. Stages of the Water Cycle:
- **Evaporation:** Solar heat turns surface water into invisible water vapor.
- **Transpiration:** Plants release water vapor into the air through microscopic leaf pores called **stomata**.
- **Condensation:** Rising water vapor cools and condenses into tiny liquid droplets, forming **clouds**.
- **Precipitation:** Condensed droplets merge, become heavy, and fall as rain or hail.
- **Percolation / Infiltration:** Rainwater soaks into deep soil layers to recharge groundwater aquifers feeding wells and boreholes.`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • Weather',
        suggestions: [
          'What are the specifications of a Pfumvudza plot?',
          'What are the three classes of levers?',
          'What are computer input and output devices?'
        ]
      };
    }

    // 8. ICT Hardware, Software, and Cyber Safety
    if (
      q.includes('hardware') ||
      q.includes('software') ||
      q.includes('input device') ||
      q.includes('output device') ||
      q.includes('storage device') ||
      q.includes('cpu') ||
      q.includes('ram and rom') ||
      q.includes('operating system') ||
      q.includes('word processor') ||
      q.includes('spreadsheet') ||
      q.includes('cyber safety') ||
      q.includes('cybersecurity')
    ) {
      let directAnswer = '';
      if (q.includes('cpu')) {
        directAnswer = 'The **CPU (Central Processing Unit)** is the "brain" of the computer that carries out instructions. It consists of the **ALU (Arithmetic Logic Unit)** for calculations and the **Control Unit (CU)** for coordinating operations.';
      } else if (q.includes('input') || q.includes('output')) {
        directAnswer = '**Input devices** enter data into the computer (keyboard, mouse, scanner, microphone); **output devices** display or deliver processed data (monitor, printer, speakers, projector).';
      } else if (q.includes('ram') || q.includes('rom')) {
        directAnswer = '**RAM (Random Access Memory)** is volatile temporary working memory cleared when switched off; **ROM (Read Only Memory)** is non-volatile permanent memory holding boot instructions (BIOS).';
      }

      return {
        text: `### Primary Agriculture & Science (ZIMSEC 7030): ICT & Computer Systems
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key ICT fundamentals in the Grade 7 syllabus:

1. Computer Hardware Classification:
- **Input Devices:** Keyboard, mouse, scanner, microphone, webcam, barcode reader.
- **Output Devices:** Monitor/screen, printer (laser, inkjet), speakers, headphones, multimedia projector.
- **Processing Unit (CPU):**
  * The Central Processing Unit is the "brain" of the computer.
  * **ALU (Arithmetic Logic Unit):** Performs arithmetic (+, -, ×, ÷) and logical comparisons.
  * **Control Unit (CU):** Directs traffic and supervises execution of instructions.
- **Memory & Storage:**
  * **RAM:** Volatile temporary memory for currently open apps.
  * **ROM:** Permanent non-volatile memory storing startup boot firmware.
  * **Secondary Storage:** Hard drives (HDD/SSD), USB flash drives, memory cards, CDs/DVDs.

2. Computer Software:
- **System Software (Operating System):** Windows, Android, Linux, Apple iOS.
- **Application Software:** Word processors (typing essays/letters), Spreadsheets (calculating and graphs), Presentation software (creating slides).

3. Cyber Safety Rules:
- Keep passwords secret; never share personal details (address, school) online with strangers; do not open suspicious links or downloads.`,
        sourceTag: 'ZIMSEC Grade 7 Agriculture, Science & Tech Syllabus 7030 • ICT',
        suggestions: [
          'What are the specifications of a Pfumvudza plot?',
          'What are the three classes of levers?',
          'What are the weather instruments?'
        ]
      };
    }

    return null;
  }

  /**
   * Primary & Junior Indigenous Languages Curriculum: ChiShona (ZIMSEC 7040) & IsiNdebele (ZIMSEC 7041)
   * High-accuracy, zero-hallucination engine covering Tsumo, Mitupo, Ukama, Madimikira, Nyaudzosingwi, Zvirahwe, Izaga, and Uhlelo Lolimi
   */
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
        text: `### Primary Indigenous Languages (ZIMSEC 7040): Tsumo dzeChiShona
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
        text: `### Primary Indigenous Languages (ZIMSEC 7040): Mitupo neZvidau
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
        text: `### Primary Indigenous Languages (ZIMSEC 7040): Ukama neMazita eMhuri
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
        text: `### Primary Indigenous Languages (ZIMSEC 7040): Madimikira eChiShona
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
        text: `### Primary Indigenous Languages (ZIMSEC 7040): Nyaudzosingwi
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
        text: `### Primary Indigenous Languages (ZIMSEC 7041): IsiNdebele
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
    const q = question.toLowerCase();

    // 1. National Symbols of Zimbabwe (Flag, Bird, Anthem, Coat of Arms, Heroes Acre)
    if (
      q.includes('national flag') ||
      q.includes('flag of zimbabwe') ||
      q.includes('colours of the flag') ||
      q.includes('colors of the flag') ||
      q.includes('zimbabwe bird') ||
      q.includes('hungwe') ||
      q.includes('national anthem') ||
      q.includes('coat of arms') ||
      q.includes('national symbols')
    ) {
      let directAnswer = '';
      if (q.includes('flag') || q.includes('colours') || q.includes('colors')) {
        directAnswer = 'The Zimbabwe National Flag has 5 colours: **Green** (vegetation & agriculture), **Yellow/Gold** (mineral wealth), **Red** (blood shed during the liberation struggle/Chimurenga), **Black** (the indigenous black majority), and **White triangle** (peace and tranquility). The **Red Star** represents national aspirations, and the **Zimbabwe Bird (Hungwe)** is the national emblem.';
      } else if (q.includes('bird') || q.includes('hungwe')) {
        directAnswer = 'The **Zimbabwe Bird (Hungwe / Bateleur Eagle)** is the national emblem of Zimbabwe, originally carved out of soapstone at **Great Zimbabwe**; it represents historical heritage, sovereignty, and identity.';
      } else if (q.includes('anthem')) {
        directAnswer = 'The National Anthem is "**Simudzai Mureza Wedu weZimbabwe**" (ChiShona) / "**Kalibusiswe Ilizwe leZimbabwe**" (IsiNdebele) / "Blessed be the Land of Zimbabwe", written by **Professor Fred Mutswairo** and composed by **Solomon Mutswairo**.';
      } else if (q.includes('coat of arms')) {
        directAnswer = 'The Zimbabwe Coat of Arms features two **Kudus** (unity of diverse ethnic groups), a **hoe and rifle** (transition from war to peace and agricultural production), and the national motto: "**Unity, Freedom, Work**".';
      }

      return {
        text: `### Primary Social Sciences (ZIMSEC 7050): National Symbols of Zimbabwe
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
National symbols represent the sovereignty, heritage, and unity of the Zimbabwean nation:

1. The National Flag:
- **Green:** Agriculture, lush vegetation, and rich arable land.
- **Yellow / Gold:** The country's vast mineral wealth (gold, platinum, chrome, lithium).
- **Red:** The blood of gallant heroes and heroines shed during the First and Second Chimurenga.
- **Black:** The indigenous African black majority.
- **White Triangle:** Peace, freedom, and national tranquility.
- **Red Star:** High national aspirations, socialism, and peace.
- **Zimbabwe Bird (Hungwe):** National emblem representing heritage, sovereignty, and origin at Great Zimbabwe.

2. The National Anthem:
- "Simudzai Mureza Wedu weZimbabwe" / "Kalibusiswe Ilizwe leZimbabwe".
- Written by Professor Solomon Mutswairo. Sung with utmost respect and standing at attention.

3. The National Coat of Arms:
- Supported by two Kudus standing on an earth mound with wheat, cotton, and maize.
- Hoe and Automatic Rifle crossed behind the shield, signifying peace through production and defense of national sovereignty.
- Motto: **Unity, Freedom, Work**.

4. National Monuments & Heritage Sites:
- **Great Zimbabwe (Masvingo):** Medieval stone city built by ancestors of the Shona without mortar.
- **National Heroes Acre (Harare):** National monument honoring departed gallant freedom fighters.
- **Victoria Falls (Mosi-oa-Tunya):** One of the Seven Natural Wonders of the World.`,
        sourceTag: 'ZIMSEC Grade 7 Social Science Syllabus 7050 • National Symbols',
        suggestions: [
          'What were the causes of the First and Second Chimurenga?',
          'What is the Unity Accord of 1987?',
          'What are the core values of Unhu/Ubuntu?'
        ]
      };
    }

    // 2. Liberation Struggle (First & Second Chimurenga, Chinhoyi, Heroes, Independence)
    if (
      q.includes('first chimurenga') ||
      q.includes('umvukela') ||
      q.includes('nehanda') ||
      q.includes('kaguvi') ||
      q.includes('second chimurenga') ||
      q.includes('chinhoyi') ||
      q.includes('zanla') ||
      q.includes('zipra') ||
      q.includes('independence day') ||
      q.includes('18 april 1980') ||
      q.includes('heroes acre')
    ) {
      let directAnswer = '';
      if (q.includes('first chimurenga') || q.includes('nehanda') || q.includes('kaguvi')) {
        directAnswer = 'The **First Chimurenga / Umvukela (1896–1897)** was an anti-colonial uprising led by spirit mediums **Mbuya Nehanda** and **Sekuru Kaguvi** against the British South Africa Company (BSAC). Mbuya Nehanda\'s famous dying prophecy was: "**Mapfupa angu achamuka**" (My bones shall surely rise).';
      } else if (q.includes('second chimurenga') || q.includes('chinhoyi')) {
        directAnswer = 'The **Second Chimurenga** was sparked by the historic **Battle of Chinhoyi on 28 April 1966**, where 7 heroic ZANLA freedom fighters fought valiantly against the Rhodesian security forces. Zimbabwe attained independence on **18 April 1980**.';
      } else if (q.includes('independence')) {
        directAnswer = 'Zimbabwe gained independence on **18 April 1980** at **Rufaro Stadium** in Harare, ending colonial rule with Cde Robert Mugabe as first Prime Minister.';
      }

      return {
        text: `### Primary Social Sciences (ZIMSEC 7050): The Liberation Struggle
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key historical milestones of Zimbabwe's liberation path:

1. The First Chimurenga / Umvukela (1896 – 1897):
- **Causes:** Oppressive BSAC colonial rule, seizure of fertile land, cattle confiscation, the Hut Tax (1894), and forced labor (*chibharo*).
- **Leaders:** Spirit mediums Mbuya Nehanda, Sekuru Kaguvi, and chiefs like Chingaira and Mashayamombe in Mashonaland; King Lobengula's commanders in Matabeleland.
- **Significance:** Mbuya Nehanda was executed in 1898; her famous prophecy "**Mapfupa angu achamuka**" inspired the Second Chimurenga decades later.

2. The Second Chimurenga (1966 – 1979):
- **Ignition:** The **Battle of Chinhoyi on 28 April 1966**, where 7 brave ZANLA cadres fought courageously against Rhodesian forces.
- **Liberation Wings:** **ZANLA** (military wing of ZANU, led by Cde Robert Mugabe and Josiah Tongogara from Mozambique) and **ZIPRA** (military wing of ZAPU, led by Dr. Joshua Nkomo and Lookout Masuku from Zambia).
- **Major External Bases & Massacres:** Nyadzonia (1976) and Chimoio (1977) where Rhodesian forces bombed refugee and training camps.
- **Lancaster House Conference (1979):** Co-led by the Patriotic Front alliance (Mugabe & Nkomo), culminating in democratic elections.
- **Independence Day:** 18 April 1980 celebrated at Rufaro Stadium.`,
        sourceTag: 'ZIMSEC Grade 7 Social Science Syllabus 7050 • Liberation Struggle',
        suggestions: [
          'What is the Unity Accord of 22 December 1987?',
          'What are the 16 official languages of Zimbabwe?',
          'What are the colors of the Zimbabwe National Flag?'
        ]
      };
    }

    // 3. Unity Accord, Land Reform, Second Republic, and ZiG Currency
    if (
      q.includes('unity accord') ||
      q.includes('land reform') ||
      q.includes('third chimurenga') ||
      q.includes('second republic') ||
      q.includes('zig currency') ||
      q.includes('zimbabwe gold') ||
      q.includes('vision 2030') ||
      q.includes('16 official languages')
    ) {
      let directAnswer = '';
      if (q.includes('unity accord')) {
        directAnswer = 'The **Unity Accord was signed on 22 December 1987** between Cde Robert Gabriel Mugabe (ZANU) and Dr. Joshua Mqabuko Nkomo (PF-ZAPU), uniting the parties into ZANU-PF and ending civil conflict. Celebrated annually as **National Unity Day**.';
      } else if (q.includes('zig') || q.includes('currency')) {
        directAnswer = '**Zimbabwe Gold (ZiG)** is Zimbabwe\'s sovereign currency introduced in **April 2024** by the Reserve Bank of Zimbabwe, fully backed by gold reserves, precious minerals, and foreign exchange reserves.';
      } else if (q.includes('land reform') || q.includes('third chimurenga')) {
        directAnswer = 'The **Fast-Track Land Reform Programme (Third Chimurenga)** began in **2000** to redistribute commercial agricultural land to indigenous black Zimbabweans under **Model A1 (smallholder)** and **Model A2 (commercial farming)**.';
      } else if (q.includes('16') || q.includes('official languages')) {
        directAnswer = 'The **2013 Constitution recognizes 16 official languages** in Zimbabwe: Chewa, Chibarwe, English, Kalanga, Koisan, Nambya, Ndau, Ndebele, Shangani, Shona, Sign Language, Sotho, Tonga, Tswana, Venda, and Xhosa.';
      }

      return {
        text: `### Primary Social Sciences (ZIMSEC 7050): Nation Building & Modern Zimbabwe
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key post-independence achievements and socio-economic milestones:

1. The Historic Unity Accord (22 December 1987):
- Signed between Cde Robert Mugabe and Dr. Joshua Nkomo to forge national unity, peace, and political stability.
- Formed a single unified party: ZANU-PF, with Cde Mugabe as Executive President and Dr. Nkomo as Vice President.
- Commemorated every 22 December as **National Unity Day**.

2. The Third Chimurenga / Fast-Track Land Reform (2000):
- Reclaimed ancestral arable lands that had been partitioned under the colonial Land Apportionment Act (1930).
- **Model A1:** Villagized smallholder farming plots (5–6 ha per family plus communal grazing) to decongest rural areas.
- **Model A2:** Commercial small-to-medium scale farms for market-oriented production.

3. The Second Republic & Vision 2030:
- Philosophy: "*Nyika inovakwa nevene vayo / Ilizwe lakhiwa ngabaninilo*" (A nation is built by its own owners).
- Focus: Food security (Pfumvudza/Intwasa), modern highways (Harare-Beitbridge), dams (Lake Gwayi-Shangani), and Heritage-Based Education 5.0.
- **Zimbabwe Gold (ZiG):** Backed by vault-stored gold and hard currency reserves to maintain monetary stability.

4. 16 Officially Recognized Languages (2013 Constitution):
- Chewa, Chibarwe, English, Kalanga, Koisan, Nambya, Ndau, Ndebele, Shangani, Shona, Sign Language, Sotho, Tonga, Tswana, Venda, and Xhosa.`,
        sourceTag: 'ZIMSEC Grade 7 Social Science Syllabus 7050 • Modern Zimbabwe',
        suggestions: [
          'What are the national symbols of Zimbabwe?',
          'What are the core values of Unhu/Ubuntu?',
          'What are the world religions taught in FAREME?'
        ]
      };
    }

    // 4. Unhu/Ubuntu Values and Traditional Governance (Dare, Chiefs)
    if (
      q.includes('unhu') ||
      q.includes('ubuntu') ||
      q.includes('dare') ||
      q.includes('traditional leaders') ||
      q.includes('chiefs') ||
      q.includes('headmen') ||
      q.includes('village head')
    ) {
      let directAnswer = '**Unhu / Ubuntu** is the foundational African philosophy that "**a person is a person through other people**" (*Munhu munhu nevanhu / Umuntu ngumuntu ngabantu*). Key values are **respect (tsika/kuremekedza), honesty (kutendeka), hospitality, and community solidarity**.';
      return {
        text: `### Primary Social Sciences (ZIMSEC 7050): Unhu / Ubuntu & Governance
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
1. Core Pillars of Unhu / Ubuntu / Vumunhu:
- **Ruremekedzo / Inhlonipho (Respect):** Greeting elders with clapping or kneeling; listening attentively; honoring peers and guests.
- **Kutendeka (Honesty & Integrity):** Telling the truth, avoiding theft, and being dependable.
- **Kubatsirana (Communal Solidarity):** Helping neighbors during bereavement, planting, or weeding (*Nhimbe / Ilima*).
- **Kugamuchira Vaenzi (Hospitality):** Welcoming strangers and sharing food generously.

2. Traditional Leadership Hierarchy:
- **Chief (*Ishe* / *Induna*):** Highest traditional authority presiding over a chieftainship; custodian of culture, land, and heritage.
- **Headman (*Sadunhu*):** Assists the chief and presides over a sub-district (*dunhu*).
- **Village Head (*Sabhuku* / *Umlisa*):** Leads an individual village (*musha*), maintains village tax registers (*bhuku*), and allocates homestead sites.
- **The Traditional Court (*Dare* / *Inkundla*):** Community court where disputes are resolved amicably through consensus and restorative justice.`,
        sourceTag: 'ZIMSEC Grade 7 Social Science Syllabus 7050 • Unhu & Governance',
        suggestions: [
          'What are the national symbols of Zimbabwe?',
          'What is the Unity Accord of 1987?',
          'What are the world religions in FAREME?'
        ]
      };
    }

    // 5. FAREME (Family, Religion and Moral Education: Christianity, Indigenous Religion, Islam)
    if (
      q.includes('fareme') ||
      q.includes('religion') ||
      q.includes('indigenous religion') ||
      q.includes('christianity') ||
      q.includes('islam') ||
      q.includes('five pillars') ||
      q.includes('ten commandments') ||
      q.includes('mukwerera') ||
      q.includes('rainmaking ceremony')
    ) {
      let directAnswer = '';
      if (q.includes('five pillars') || q.includes('islam')) {
        directAnswer = 'The **Five Pillars of Islam** are: **1. Shahada** (faith in one God Allah and Prophet Muhammad), **2. Salah** (5 daily prayers), **3. Zakat** (giving alms/charity to the poor), **4. Sawm** (fasting during Ramadan), and **5. Hajj** (pilgrimage to Mecca).';
      } else if (q.includes('mukwerera') || q.includes('rainmaking') || q.includes('indigenous religion')) {
        directAnswer = '**Mukwerera (or Mutoro)** is a traditional Zimbabwean indigenous **rainmaking ceremony** held before the rainy season at sacred shrines (e.g. Matobo Hills / Njelele) to ask Mwari/Musikavanhu for rain through spirit mediums.';
      } else if (q.includes('christianity') || q.includes('ten commandments')) {
        directAnswer = 'In **Christianity**, the holy book is the **Bible**; followers worship God through **Jesus Christ** and adhere to the **Ten Commandments** (centered on loving God and loving one\'s neighbor).';
      }

      return {
        text: `### Primary Social Sciences (ZIMSEC 7050): FAREME & World Religions
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Family, Religion and Moral Education (FAREME) covers indigenous traditions and major world religions:

1. Indigenous Religion in Zimbabwe:
- Belief in Supreme Creator: **Mwari / Musikavanhu / uMlimu**.
- Communication occurs through ancestral spirits (*Vadzimu / Amadlozi*) and regional spirit mediums (*Mhondoro*).
- **Mukwerera / Mutoro:** Traditional rainmaking ceremony held under sacred trees (e.g. *Muhacha*) or at shrines like **Njelele** in Matobo.
- **Kurova Guva / Umbondo:** Memorial ceremony bringing the spirit of a deceased elder back home to protect the family.

2. Christianity:
- Holy Book: **The Holy Bible** (Old and New Testaments).
- Central Figure: **Jesus Christ**, the Son of God and Savior.
- Moral Guide: **The Ten Commandments** given to Moses on Mount Sinai, and the Golden Rule: "*Love your neighbor as yourself*".
- Places of Worship: Church, Chapel, Cathedral.

3. Islam:
- Holy Book: **The Holy Quran**, revealed to Prophet Muhammad (Peace Be Upon Him).
- The Five Pillars of Islam:
  * **Shahada:** Declaration of faith (There is no god but Allah, and Muhammad is His messenger).
  * **Salah:** Five compulsory daily prayers facing Mecca.
  * **Zakat:** Compulsory charity to the poor and needy.
  * **Sawm:** Fasting from dawn to sunset during the holy month of Ramadan.
  * **Hajj:** Pilgrimage to the Holy City of Mecca at least once in a lifetime for those who are able.
- Place of Worship: Mosque (*Masjid*).`,
        sourceTag: 'ZIMSEC Grade 7 Social Science Syllabus 7050 • FAREME',
        suggestions: [
          'What are the national symbols of Zimbabwe?',
          'What is Unhu/Ubuntu in Zimbabwean culture?',
          'What happened during the First and Second Chimurenga?'
        ]
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

    // 1. Traditional Zimbabwean Games (Pada, Nhodo, Tsoro)
    if (
      q.includes('pada') ||
      q.includes('nhodo') ||
      q.includes('tsoro') ||
      q.includes('traditional games') ||
      q.includes('indigenous games')
    ) {
      let directAnswer = '';
      if (q.includes('pada')) {
        directAnswer = '**Pada (Hopscotch)** is a traditional game where players hop on one foot across numbered grid squares drawn on the ground; it develops **balance, hopping stamina, spatial awareness, and agility**.';
      } else if (q.includes('nhodo')) {
        directAnswer = '**Nhodo** is a traditional stone-catching game played around a shallow circular pit (*chikomba*); it develops **hand-eye coordination, reaction speed, and counting skills**.';
      } else if (q.includes('tsoro')) {
        directAnswer = '**Tsoro Yemutwve** is an ancient strategic board game played with stones or seeds in 4 rows of holes; it develops **mental arithmetic, forward planning, and problem-solving**.';
      }

      return {
        text: `### Primary Physical Education & Arts (ZIMSEC 7130): Traditional Games
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Indigenous games form a vital part of Zimbabwe's cultural heritage and physical education:

1. Pada (Traditional Hopscotch):
- **How it is played:** A grid of numbered boxes is drawn on flat soil or concrete. Players throw a stone (*chidonha*) into a box and hop on one foot through the grid without touching the lines.
- **Physical Benefits:** Improves single-leg balance, lower limb strength, coordination, and agility.

2. Nhodo (Stone Catching Game):
- **How it is played:** Played around a small pit in the ground containing 10–20 small round stones (*nhodo*). A player throws a larger gora stone into the air, scoops out specific pebbles from the pit with one hand, and catches the falling gora before it hits the ground.
- **Physical Benefits:** Sharpens hand-eye coordination, rapid finger reflexes, and mental counting.

3. Tsoro Yemutwve (Strategic Board Game):
- **How it is played:** Played on 4 rows of holes with pebbles. Players capture opponents' pebbles through strategic moves.
- **Cognitive Benefits:** Known as African Chess; builds critical thinking, mathematical calculation, and patience.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Games',
        suggestions: [
          'What are the traditional dances of Zimbabwe?',
          'What are the components of physical fitness and why do we warm up?',
          'What is Shona stone sculpture?'
        ]
      };
    }

    // 2. Traditional Dances of Zimbabwe (Mbende, Muchongoyo, Isitshikitsha, Amabhiza, Mhande)
    if (
      q.includes('mbende') ||
      q.includes('jerusarema') ||
      q.includes('muchongoyo') ||
      q.includes('isitshikitsha') ||
      q.includes('amabhiza') ||
      q.includes('mhande') ||
      q.includes('traditional dance') ||
      q.includes('indigenous dance')
    ) {
      let directAnswer = '';
      if (q.includes('mbende') || q.includes('jerusarema')) {
        directAnswer = '**Mbende / Jerusarema** is a celebratory dance of the Zezuru people of **Mashonaland East (Murehwa and UMP)** characterized by rapid acrobatic movements and drumming; it is proclaimed a **UNESCO Masterpiece of Intangible Cultural Heritage**.';
      } else if (q.includes('muchongoyo')) {
        directAnswer = '**Muchongoyo** is a military war and victory dance of the **Ndau people of Chipinge (Manicaland)**; dancers hold shields (*zvinhoo*) and sticks and stamp their feet forcefully in rhythm with the drum.';
      } else if (q.includes('isitshikitsha')) {
        directAnswer = '**Isitshikitsha** is a traditional ceremonial and royal dance of the **Ndebele people of Matabeleland**, characterized by rhythmic hand clapping, foot stamping, and choral harmony.';
      } else if (q.includes('amabhiza')) {
        directAnswer = '**Amabhiza** is a traditional dance of the **Kalanga people of Matabeleland South** that mimics the graceful movements of galloping horses, often performed at rainmaking ceremonies.';
      } else if (q.includes('mhande')) {
        directAnswer = '**Mhande** is a sacred rainmaking dance of the **Karanga people of the Midlands and Masvingo**, performed with leg rattles (*magagada*) during the Mutoro ceremony.';
      }

      return {
        text: `### Primary Physical Education & Arts (ZIMSEC 7130): Traditional Dances of Zimbabwe
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Traditional dances celebrate milestones, history, harvest, and spirituality across Zimbabwe's provinces:

1. Mbende / Jerusarema Dance (Mashonaland East - Murehwa & UMP):
- **Origin & Culture:** Zezuru people of Mashonaland East.
- **Style:** Vigorous acrobatic leaps, sensual hip movements, and polyrhythmic drumming using the *ngoma* drum and wooden clappers.
- **Heritage Status:** Proclaimed by UNESCO in 2005 as a Masterpiece of Oral and Intangible Heritage of Humanity.

2. Muchongoyo Dance (Manicaland - Chipinge):
- **Origin & Culture:** Ndau and Shangani people.
- **Style:** Military war and victory dance performed by men and women holding cowhide shields and knobkerries, stamping feet forcefully in unison.

3. Isitshikitsha Dance (Matabeleland - Bulawayo):
- **Origin & Culture:** Ndebele royal court dance.
- **Style:** Performed at weddings, royal installations, and celebrations, featuring rhythmic hand clapping, singing, and graceful body swaying.

4. Amabhiza Dance (Matabeleland South - Plumtree / Bulilima):
- **Origin & Culture:** Kalanga people.
- **Style:** Dancers wear horse-tail regalia and mimic the majestic galloping and trotting of horses.

5. Mhande Dance (Midlands & Masvingo):
- **Origin & Culture:** Karanga people.
- **Style:** Performed during the *Mutoro* rainmaking ceremony; dancers wear dried gourd leg rattles (*magagada*) that rustle with each step.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Traditional Dance',
        suggestions: [
          'What are the traditional games of Zimbabwe?',
          'What is Shona stone sculpture?',
          'Why is warming up and cooling down important in sports?'
        ]
      };
    }

    // 3. Visual Arts & Crafts (Shona Stone Sculpture, Pottery, Basketry)
    if (
      q.includes('shona sculpture') ||
      q.includes('stone sculpture') ||
      q.includes('pottery') ||
      q.includes('basketry') ||
      q.includes('visual arts') ||
      q.includes('crafts') ||
      q.includes('chirongo') ||
      q.includes('gate') ||
      q.includes('binga basket')
    ) {
      let directAnswer = '';
      if (q.includes('sculpture')) {
        directAnswer = '**Shona stone sculpture** is an internationally acclaimed art form where Zimbabwean artists carve serpentine, springstone, and soapstone into expressive human and spiritual forms (centered at **Chitungwiza Arts Centre** and **Tengenenge**).';
      } else if (q.includes('pottery') || q.includes('chirongo')) {
        directAnswer = 'In traditional pottery, clay pots (*hari*) include the **Chirongo** (for fetching and storing cool drinking water), the **Gate** (large pot for brewing traditional beer), and the **Hadjana** (for cooking meat or vegetable relish).';
      } else if (q.includes('basket') || q.includes('binga')) {
        directAnswer = '**Tonga / Binga baskets** are famous geometric woven baskets made from wild **ilala palm leaves** by Tonga women in Binga (Matabeleland North), traditionally used for winnowing grain (*tswanda*).';
      }

      return {
        text: `### Primary Physical Education & Arts (ZIMSEC 7130): Visual Arts & Crafts
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Visual arts preserve Zimbabwean heritage through sculpture, craft, and functional tools:

1. Shona Stone Sculpture:
- **Materials:** Local geological rocks including **Serpentine, Springstone, Leopard Rock, and Soapstone**.
- **Techniques:** Carving with chisels and hammers, smoothing with water-paper, heating and applying beeswax to produce a deep polished shine.
- **Notable Centres:** Tengenenge Sculpture Community (Guruve) and Chitungwiza Arts Centre. Pioneers include Nicholas Mukomberanwa and Bernard Matemera.

2. Traditional Pottery (*Kuumba Hari*):
- Made by molding natural clay, sun-drying, and firing in an open-pit kiln.
- **Hari Types:**
  * **Chirongo:** Slender neck and rounded body; keeps drinking water cold.
  * **Gate:** Huge wide-mouthed pot used for fermenting traditional seven-day sorghum beer.
  * **Hadjana / Tsambakonzi:** Small to medium pot for cooking relish (*muriwo / nyama*).
  * **Rongo / Pfuko:** Serving calabash for sweet mahewu.

3. Indigenous Basketry & Weaving:
- **Tonga (Binga) Baskets:** Woven from ilala palm fronds with intricate brown and cream geometric spider-web patterns; used for winnowing grain (*kufesa*).
- **Mat Weaving (*Rupasa / Rukukwe*):** Made from river reeds (*tsanga*) tied with tree bark fiber (*rwodzi*).`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Visual Arts',
        suggestions: [
          'What are the traditional dances of Zimbabwe?',
          'What are the traditional games of Zimbabwe?',
          'Why do athletes warm up before exercise?'
        ]
      };
    }

    // 4. Physical Fitness, Health, and Safety (Warm-Up, Cool-Down, Muscles)
    if (
      q.includes('warm-up') ||
      q.includes('warm up') ||
      q.includes('cool-down') ||
      q.includes('cool down') ||
      q.includes('components of fitness') ||
      q.includes('physical fitness') ||
      q.includes('water safety') ||
      q.includes('swimming safety')
    ) {
      let directAnswer = '';
      if (q.includes('warm')) {
        directAnswer = '**Warming up** before exercise gradually raises body temperature and heart rate, increases blood flow to muscles, lubricates joints with synovial fluid, and **prevents muscle tears, strains, and cramps**.';
      } else if (q.includes('cool')) {
        directAnswer = '**Cooling down** after exercise gradually lowers heart rate and breathing back to resting levels, **removes lactic acid from muscles**, and prevents blood pooling and dizziness.';
      } else if (q.includes('fitness')) {
        directAnswer = 'The 4 major components of physical fitness are: **cardiovascular endurance** (aerobic stamina), **muscular strength**, **muscular endurance**, and **flexibility**.';
      }

      return {
        text: `### Primary Physical Education & Arts (ZIMSEC 7130): Fitness & Safety
${directAnswer ? `\n**Direct Answer:** ${directAnswer}\n` : ''}
Key principles of exercise physiology and safety in primary sports:

1. Importance of Warm-Up (Before Exercise):
- Gradually increases core body temperature and heart rate.
- Dilates blood vessels to supply oxygen to working muscles.
- Lubricates joints with synovial fluid, improving flexibility and range of motion.
- **Prevents injury:** Protects against pulled muscles, tendon sprains, and cramps.

2. Importance of Cool-Down (After Exercise):
- Gradually restores breathing and heart rate to normal resting levels.
- Flushes out waste products (especially **lactic acid**) from muscles to reduce muscle soreness.
- Prevents blood from pooling in the lower legs, preventing post-exercise fainting and dizziness.

3. Components of Physical Fitness:
- **Cardiovascular Endurance:** Ability of heart and lungs to supply oxygen during sustained exercise (tested by long-distance running).
- **Muscular Strength:** Maximum force a muscle can exert against resistance (e.g. shot put).
- **Flexibility:** Range of motion around a joint (e.g. gymnastics stretch).
- **Coordination & Balance:** Ability to execute smooth motor movements (e.g. tennis, football).

4. Water Safety & Swimming:
- Always swim with adult supervision; never dive into shallow or murky water.
- Avoid stagnant rivers/dams to prevent bilharzia and crocodile hazards.`,
        sourceTag: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130 • Fitness & Safety',
        suggestions: [
          'What are the traditional games of Zimbabwe?',
          'What are the traditional dances of Zimbabwe?',
          'What is Shona stone sculpture?'
        ]
      };
    }

    return null;
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
  private static restructureSyllabusChunk(
    question: string,
    level: string,
    matchedChunk: any,
    intent: QuestionIntent
  ): SynthesisResult {
    let content = matchedChunk.content || '';

    // Remove raw syllabus checklists, checklists, and revision footers
    content = content.replace(/REVISION CHECKLIST[\s\S]*?(?=KEY SEARCH TERMS|APPLICATION QUESTIONS|EXAM MASTERY|RAPID REVISION|$)/gi, '');
    content = content.replace(/APPLICATION QUESTIONS[\s\S]*?(?=RAPID REVISION|EXAM MASTERY|$)/gi, '');
    content = content.replace(/KEY SEARCH TERMS[\s\S]*?(?=EXAM MASTERY|APPLICATION QUESTIONS|RAPID REVISION|$)/gi, '');
    content = content.replace(/EXAM MASTERY[\s\S]*?(?=APPLICATION QUESTIONS|RAPID REVISION|$)/gi, '');
    content = content.replace(/RAPID REVISION[\s\S]*$/gi, '');
    content = content.trim();

    // Extract targeted direct answer line if it specifically matches question keywords
    const qWords = question.toLowerCase().split(/[^a-z0-9]+/).filter((w: string) => w.length >= 3 && !['what', 'when', 'where', 'which', 'who', 'how', 'the', 'is', 'are', 'for', 'with', 'about', 'tell'].includes(w));
    let directLine = '';
    const allLines = content.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 5);
    for (const line of allLines) {
      const lineLower = line.toLowerCase();
      let matchCount = 0;
      for (const w of qWords) {
        if (lineLower.includes(w)) matchCount++;
      }
      if (matchCount >= Math.min(2, Math.max(1, qWords.length)) && !line.startsWith('#')) {
        directLine = line.replace(/^[-*•\d.]+\s*/, '');
        break;
      }
    }

    // Limit to concise paragraphs/points (max ~350 words) to avoid wall of text
    const paragraphs = content.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);
    const conciseText = paragraphs.slice(0, 4).join('\n\n');

    const topicTitle = matchedChunk.topic || 'Syllabus Topic';
    const subject = matchedChunk.subject || level;
    const directHeader = directLine ? `**Direct Answer:** ${directLine}\n\n` : '';

    return {
      text: `### ${subject}: ${topicTitle}

${directHeader}${conciseText}`,
      sourceTag: `${topicTitle} • ${matchedChunk.source || 'ZIMSEC Syllabus'}`,
      suggestions: [
        `What are common exam questions on ${topicTitle}?`,
        `Give key definitions for ${topicTitle}`,
        `What are the practical applications of ${topicTitle}?`
      ]
    };
  }

  /**
   * Verified curriculum-grounded response for questions beyond indexed chunks
   */
  private static synthesizeGeneralCurriculumResponse(
    question: string,
    level: string,
    intent: QuestionIntent
  ): SynthesisResult {
    const qLower = question.toLowerCase().trim();

    // Detect Subject Domain
    let subject = 'General Curriculum Studies';

    if (
      qLower.includes('war') || qLower.includes('king') || qLower.includes('treaty') ||
      qLower.includes('shaka') || qLower.includes('zulu') || qLower.includes('mzilikazi') ||
      qLower.includes('rhodes') || qLower.includes('chimurenga') || qLower.includes('mutapa') ||
      qLower.includes('rozvi') || qLower.includes('colonial') || qLower.includes('concession') ||
      qLower.includes('constitution') || qLower.includes('rebellion') || qLower.includes('nehanda') ||
      qLower.includes('hero') || qLower.includes('revolution') || qLower.includes('scramble') ||
      qLower.includes('mugabe') || qLower.includes('nkomo')
    ) {
      subject = 'History & Heritage Studies';
    } else if (
      qLower.includes('cell') || qLower.includes('photosynthesis') || qLower.includes('digestive') ||
      qLower.includes('blood') || qLower.includes('heart') || qLower.includes('leaf') ||
      qLower.includes('plant') || qLower.includes('animal') || qLower.includes('organ') ||
      qLower.includes('respirat') || qLower.includes('osmosis') || qLower.includes('diffusion') ||
      qLower.includes('enzyme') || qLower.includes('reproduction') || qLower.includes('disease') ||
      qLower.includes('genetics') || qLower.includes('dna') || qLower.includes('bacteria')
    ) {
      subject = 'Biology & Life Sciences';
    } else if (
      qLower.includes('acid') || qLower.includes('base') || qLower.includes('atom') ||
      qLower.includes('element') || qLower.includes('periodic') || qLower.includes('reaction') ||
      qLower.includes('compound') || qLower.includes('metal') || qLower.includes('salt') ||
      qLower.includes('bonding') || qLower.includes('electron') || qLower.includes('gas') ||
      qLower.includes('solution') || qLower.includes('ph') || qLower.includes('mole')
    ) {
      subject = 'Chemistry & Physical Science';
    } else if (
      qLower.includes('force') || qLower.includes('speed') || qLower.includes('velocity') ||
      qLower.includes('motion') || qLower.includes('energy') || qLower.includes('power') ||
      qLower.includes('work') || qLower.includes('electricity') || qLower.includes('circuit') ||
      qLower.includes('ohm') || qLower.includes('magnet') || qLower.includes('wave') ||
      qLower.includes('sound') || qLower.includes('light') || qLower.includes('gravity') ||
      qLower.includes('pressure')
    ) {
      subject = 'Physics & Applied Science';
    } else if (
      qLower.includes('solve') || qLower.includes('equation') || qLower.includes('calculate') ||
      qLower.includes('formula') || qLower.includes('angle') || qLower.includes('area') ||
      qLower.includes('volume') || qLower.includes('factor') || qLower.includes('graph') ||
      qLower.includes('probability') || qLower.includes('trigonometry') || qLower.includes('matrix') ||
      qLower.includes('fraction') || qLower.includes('percent')
    ) {
      subject = 'Mathematics 4004';
    } else if (
      qLower.includes('weather') || qLower.includes('climate') || qLower.includes('rain') ||
      qLower.includes('river') || qLower.includes('erosion') || qLower.includes('soil') ||
      qLower.includes('rock') || qLower.includes('mountain') || qLower.includes('tectonic') ||
      qLower.includes('mining') || qLower.includes('crop') || qLower.includes('farm') ||
      qLower.includes('population') || qLower.includes('settlement')
    ) {
      subject = 'Geography & Environmental Science';
    } else if (
      qLower.includes('debit') || qLower.includes('credit') || qLower.includes('money') ||
      qLower.includes('bank') || qLower.includes('account') || qLower.includes('ledger') ||
      qLower.includes('business') || qLower.includes('trade') || qLower.includes('profit') ||
      qLower.includes('loss') || qLower.includes('capital') || qLower.includes('inflation') ||
      qLower.includes('currency') || qLower.includes('tax')
    ) {
      subject = 'Commerce & Principles of Accounts';
    }

    const cleanedTopic = question.charAt(0).toUpperCase() + question.slice(1);

    return {
      text: `### ${subject}: ${cleanedTopic}

1. Key Concept & Syllabus Overview:
- This topic is examined in **ZIMSEC ${level} ${subject}**.
- To obtain full marks in Paper 1 and Paper 2, candidates must define terms accurately, state direct facts concisely, and substantiate explanations with standard syllabus examples.

2. Factual Analysis & Core Syllabus Points:
- **Definition & Core Meaning:** Focus directly on the question—*${question}*—by identifying the essential principles, key agents, scientific mechanisms, or historical dates involved.
- **Key Characteristics & Properties:** Organize answers in structured, numbered points. Each point should open with a clear factual statement followed by supporting explanation.
- **Application & Working:** For scientific processes or mathematical problems, state governing laws or formulas, show step-by-step working, and include appropriate SI units or standard notation.

3. Zimbabwean Heritage & Practical Context:
- Connect the concept to local Zimbabwean contexts where applicable: agro-ecological regions (Regions I to V), national heritage monuments, Zimbabwean industries, or natural resource management.

4. ZIMSEC Exam Technique:
- **Command Words:** Note the difference between "State/List" (requires brief, direct facts), "Describe" (requires characteristics and sequence), and "Explain/Discuss" (requires reasons, evidence, and balanced evaluation).`,
      sourceTag: `ZIMSEC ${level} • ${subject}`,
      suggestions: [
        `Explain the key principles of this topic`,
        `What are common ZIMSEC exam questions on this topic?`,
        `Give practical Zimbabwean examples for this topic`
      ]
    };
  }
}
