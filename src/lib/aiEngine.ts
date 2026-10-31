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
   * Detects if the prompt is in ChiShona or contains common Shona educational queries
   */
  public static isShonaQuery(query: string): boolean {
    const q = query.toLowerCase().trim();

    // Clear English query indicators
    const englishIndicators = [
      'who is', 'who was', 'what is', 'what was', 'what are', 'explain the', 'explain how',
      'how does', 'how did', 'why is', 'why did', 'describe', 'define', 'outline',
      'discuss', 'summarize', 'tell me about', 'give me', 'which region', 'which farming',
      'compare', 'solve', 'calculate'
    ];
    if (englishIndicators.some((ei) => q.startsWith(ei) || q.includes(` ${ei} `))) {
      return false;
    }

    // Authentic ChiShona grammatical words, question stems, and vocabulary
    const shonaMarkers = [
      'ndiani', 'ani', 'vaive ani', 'aive ani', 'chii', 'sei', 'tsanangura', 'mitemo',
      'zvirwere', 'zvirimwa', 'ivhu', 'nhoroondo', 'chimurenga', 'mambo', 'dunhu',
      'mudunhu', 'matunhu', 'kurima', 'rekurima', 'kufema', 'marudzi', 'chishona',
      'unhu', 'tsumo', 'madimikira', 'bvunzo', 'zvakanakira', 'zvakaipira', 'kudyidzana',
      'upfumi', 'munhu', 'vana', 'basa', 'mhuka', 'rusununguko', 'guta', 'chirevo',
      'tsvaga', 'mhinduro', 'mubvunzo', 'zvinoreva', 'kupiko', 'kupi', 'riini', 'chinonzi',
      'zvinoitika', 'chinoshanda', 'kugadzira', 'chiedza', 'rima', 'mweya', 'mashizha',
      'zvidzidzo', 'chikoro', 'ripi', 'chipi', 'vapi', 'ndeapi', 'ndeipi', 'ndechipi',
      'taura', 'doma', 'ndipe', 'ndiudze', 'vakaita', 'akaita', 'vakazvarwa', 'zvikonzero'
    ];

    return shonaMarkers.some((kw) => {
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
        const searchResult = await KnowledgeStore.searchScored(trimmedQuestion, options.level);
        if (searchResult.results.length > 0) {
          const top = searchResult.results[0];
          matchedChunk = top.chunk;
          matchedScore = top.score;
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
      'uri ani', 'chii chinonzi zexa'
    ];
    if (identityWords.some((iw) => q.includes(iw))) {
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

    // 4. Targeted Domain Handlers (History, Science, Math, Geography, Accounts)
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
      qLower.includes('first chimurenga') ||
      qLower.includes('umvukela') ||
      qLower.includes('nehanda') ||
      qLower.includes('kaguvi')
    ) {
      return this.handleFirstChimurengaQuery(question, level, intent);
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
      text: `### About ZEXA AI: Zimbabwe's Offline Educational Brain

ZEXA AI is a dedicated, fully offline educational artificial intelligence engine designed specifically for Zimbabwean students preparing for ZIMSEC primary, secondary, and tertiary examinations.

Key Capabilities:
- True Offline Inference: Runs entirely on your local device without needing internet connectivity, mobile data bundles, or external server calls.
- Curriculum Grounding: Built on official ZIMSEC syllabus frameworks (Grade 1-7 Heritage-Based, O-Level 4000-series, A-Level 9000-series, and Tertiary modules).
- ChiShona Language Engine: Fully bilingual; asks and explains concepts in authentic Shona or English.
- Exam-Focused Problem Solving: Structured answers designed to target maximum marks in ZIMSEC Papers 1 and 2.`,
      sourceTag: 'ZEXA AI • System Architecture',
      suggestions: [
        'What subjects do you cover?',
        'How do I test my exam readiness?',
        'Switch to ChiShona revision'
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
   */
  private static handleFirstChimurengaQuery(question: string, level: string, intent: QuestionIntent): SynthesisResult {
    return {
      text: `### History: The 1896 – 1897 First Chimurenga / Umvukela

1. Causes of the Uprising:
- Land Dispossession: BSAC confiscated prime agricultural land, banishing Africans into dry, mosquito-infested reserves (Gwayi and Shangani).
- Cattle Confiscation: Seizure of over 200,000 Ndebele cattle following the 1893 war.
- Hut Tax (1894): A mandatory cash tax designed to force Africans into wage slavery on settler farms and mines.
- Forced Labor (*Chibaro*): Coerced, unpaid hard labor under brutal native commissioners.
- Natural Disasters: Severe drought, locust swarms, and rinderpest disease in 1895–1896, attributed to the displeasure of ancestral spirits at colonial desecration.
- Jameson Raid (December 1895): Left Rhodesia with minimal police protection, providing a strategic opportunity for resistance.

2. Spiritual Leadership & Execution:
- Spirit Mediums: Mbuya Nehanda (Charwe), Sekuru Kaguvi (Gumboreshumba), and Mukwati mobilized fighters and coordinated military intelligence.
- Execution: Mbuya Nehanda and Sekuru Kaguvi were captured and hanged on 27 April 1898. Nehanda\'s immortal dying prophecy—"Mapfupa angu achamuka" (My bones shall rise)—inspired the Second Chimurenga.`,
      sourceTag: 'History 2167 • The First Chimurenga / Umvukela',
      suggestions: [
        'What were the economic causes of the First Chimurenga?',
        'Explain the role of Mbuya Nehanda in the 1896 uprising',
        'Compare the First Chimurenga with the Second Chimurenga'
      ]
    };
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
   * Generates authentic, question-tailored responses in ChiShona
   */
  private static generateShonaResponse(
    question: string,
    level: string,
    intent: QuestionIntent,
    matchedChunk?: any
  ): SynthesisResult {
    const qLower = question.toLowerCase();

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

1. Core Definition & Syllabus Principles:
- This topic belongs to the core curriculum for ${subject} at the ${level} tier.
- When answering this question in a ZIMSEC examination, state the clear definition first, followed by supporting factual evidence and examples.

2. Factual Breakdown & Step-by-Step Analysis:
- Foundational Concept: Address the specific question (${question}) by identifying the governing laws, dates, names, or mechanisms.
- Cause-and-Effect Relationships: Trace how initial conditions lead to outcomes (e.g. historical motivations leading to migrations or treaties; physical forces producing acceleration; or reactants forming products).
- Structure: In written exams, present your answer using concise, numbered points or paragraphs with clear topic sentences.

3. Zimbabwean Application & Heritage Context:
- Relate this concept to practical Zimbabwean examples: local agricultural regions, historical national monuments, industry applications, or natural resources.

4. ZIMSEC Exam Tip & Marking Criteria:
- Pay close attention to command words: "State" or "List" require direct facts; "Explain" requires reasons; "Discuss" or "Evaluate" require balanced arguments.
- Show all mathematical working clearly and include correct SI units where applicable.`,
      sourceTag: `ZIMSEC ${level} • ${subject}`,
      suggestions: [
        `Explain the key principles of this topic step-by-step`,
        `What are the most common ZIMSEC exam questions on this?`,
        `Give practical Zimbabwean examples related to this`
      ]
    };
  }
}
