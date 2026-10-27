import { KnowledgeChunk } from '../types';

interface ScoredChunk {
  chunk: KnowledgeChunk;
  score: number;
  matchedWords: Set<string>;
}

export interface SearchResult {
  results: ScoredChunk[];
  queryWords: string[];
}

export class KnowledgeStore {
  private static chunks: KnowledgeChunk[] = [];
  private static isLoaded = false;
  private static subjectsList: string[] = [];
  private static cache = new Map<string, SearchResult>();

  // Curated foundational knowledge chunks ensuring zero latency instant offline answers
  private static readonly SEED_CHUNKS: KnowledgeChunk[] = [
    {
      id: 'geo_agro_regions',
      level: 'O-Level',
      subject: 'Geography',
      topic: 'Natural Farming Regions of Zimbabwe (Regions I - V)',
      content: `Zimbabwe is divided into five Natural Farming (Agro-Ecological) Regions based on rainfall, temperature, and agricultural potential:
- Region I (Specialized & Diversified): High rainfall (>1000mm/yr), cool temperatures. Located in Eastern Highlands (Nyanga, Chimanimani). Crops: Tea, coffee, macadamia, timber, apples.
- Region II (Intensive Farming): High reliable rainfall (750-1000mm/yr). Highveld (Harare, Mazowe). Main crops: Maize, tobacco, soya beans, wheat, dairy farming.
- Region III (Semi-Intensive Farming): Moderate rainfall (500-750mm/yr), subject to mid-season dry spells. Midlands (Gweru, Kwekwe). Drought-tolerant crops: Sorghum, maize, sunflower, beef cattle.
- Region IV (Semi-Extensive Farming): Low rainfall (450-650mm/yr), frequent droughts, high temperatures. Matabeleland, Gokwe. Suited for drought-resistant crops (millet, sorghum) and livestock production.
- Region V (Extensive Farming): Very low erratic rainfall (<450mm/yr), very hot. Lowveld (Chiredzi, Beitbridge, Zambezi Valley). Cattle ranching, wildlife/safaris, and extensive sugarcane/citrus under irrigation (Triangle, Hippo Valley).`,
      source: 'ZIMSEC Geography Syllabus 4022',
      keywords: ['chiredzi', 'natural region', 'agro-ecological', 'region 5', 'region 1', 'region 2', 'region 3', 'region 4', 'rainfall', 'farming', 'zimbabwe']
    },
    {
      id: 'bio_photosynthesis',
      level: 'O-Level',
      subject: 'Biology',
      topic: 'Photosynthesis in Plants',
      content: `Photosynthesis is the process by which green plants manufacture glucose from carbon dioxide and water using sunlight energy trapped by chlorophyll.
Word Equation:
Carbon dioxide + Water --(sunlight & chlorophyll)--> Glucose + Oxygen
Chemical Equation:
6CO2 + 6H2O -> C6H12O6 + 6O2

Stages:
1. Light-dependent stage (Light reaction): Takes place in the thylakoid membranes of chloroplasts. Light energy splits water molecules into hydrogen ions and oxygen (photolysis: 2H2O -> 4H+ + 4e- + O2). ATP is produced.
2. Light-independent stage (Dark reaction / Calvin Cycle): Takes place in the stroma. Carbon dioxide is reduced by hydrogen (carried by NADPH) using energy from ATP to produce glucose.

Factors Affecting Rate of Photosynthesis:
- Light intensity (limiting factor in low light)
- Carbon dioxide concentration (atmospheric CO2 is ~0.04%)
- Temperature (enzymes like RuBisCO denature above ~45°C)
- Water availability.`,
      source: 'ZIMSEC Biology Syllabus 4025',
      keywords: ['photosynthesis', 'chlorophyll', 'calvin cycle', 'photolysis', 'light reaction', 'glucose', 'chloroplast', 'carbon dioxide']
    },
    {
      id: 'hist_great_zimbabwe',
      level: 'O-Level',
      subject: 'History',
      topic: 'Great Zimbabwe State: Rise, Economy, and Decline',
      content: `Great Zimbabwe was a medieval African empire located near Masvingo, flourishing between 1200 and 1450 AD.
Key features of Great Zimbabwe:
1. Architecture: Built using the dry-stone walling technique without mortar (granite blocks shaped through thermal fracturing). Structures include the Great Enclosure, Hill Complex, and Valley Ruins.
2. Economy:
   - Pastoralism (huge herds of cattle provided wealth and status)
   - Agriculture (sorghum, millet, beans)
   - Long-distance trade (exchanged gold, ivory, copper, skins at Sofala port for Chinese porcelain, glass beads, Persian ceramics, cloth)
   - Mining and iron smelting.
3. Religion: Mwari cult based on spirit mediums (Mhondoro) and the sacred soapstone Zimbabwe Birds (hungwe), representing royal ancestors and spiritual connection.
4. Reasons for Decline (mid-15th century):
   - Exhaustion of natural resources (pasture land, firewood, fertile soil)
   - Salt shortages
   - Population pressure (over 18,000 residents)
   - Civil wars and dynastic rivalries
   - Shift of trade routes northward toward the Zambezi River, leading to the rise of the Mutapa State founded by Nyatsimba Mutota.`,
      source: 'ZIMSEC History Syllabus 2167',
      keywords: ['great zimbabwe', 'mutapa', 'dry-stone', 'stone walling', 'hungwe', 'masvingo', 'decline', 'trade', 'ivory', 'gold']
    },
    {
      id: 'math_quadratic_formula',
      level: 'O-Level',
      subject: 'Mathematics',
      topic: 'Solving Quadratic Equations',
      content: `A quadratic equation is in the standard form: ax² + bx + c = 0 (where a ≠ 0).

Methods of Solution:
1. The Quadratic Formula:
   x = (-b ± √(b² - 4ac)) / (2a)
   - The discriminant Δ = b² - 4ac determines nature of roots:
     * If Δ > 0: two distinct real roots
     * If Δ = 0: one repeated real root
     * If Δ < 0: no real roots (complex roots)

2. Factorization:
   Find two numbers that multiply to give ac and add to give b. Split the middle term and factor by grouping.

3. Completing the Square:
   Rewrite ax² + bx + c = 0 into (x + p)² = q, then take square roots of both sides.`,
      source: 'ZIMSEC Mathematics Syllabus 4004',
      keywords: ['quadratic', 'formula', 'algebra', 'roots', 'discriminant', 'factorization', 'completing the square']
    },
    {
      id: 'chem_bonding',
      level: 'O-Level',
      subject: 'Chemistry',
      topic: 'Chemical Bonding: Ionic, Covalent, and Metallic',
      content: `Chemical bonding occurs when atoms gain, lose, or share valence electrons to achieve stable noble gas electron configurations (octet rule).

1. Ionic Bonding:
   - Formed between a metal and a non-metal by complete transfer of electrons.
   - Example: Sodium (2,8,1) donates 1 electron to Chlorine (2,8,7) forming Na⁺ and Cl⁻ held by electrostatic attraction.
   - Properties: High melting/boiling points, giant ionic lattice, conduct electricity when molten or aqueous (free ions), soluble in water.

2. Covalent Bonding:
   - Formed between non-metals by sharing pairs of electrons.
   - Examples: H2O, CO2, CH4, Cl2.
   - Properties: Low melting points (weak intermolecular forces), do not conduct electricity (no free ions or delocalized electrons).

3. Metallic Bonding:
   - Formed between metal atoms: lattice of positive metal ions surrounded by a sea of delocalized electrons.
   - Properties: Good electrical and thermal conductivity, malleable and ductile.`,
      source: 'ZIMSEC Chemistry Syllabus 4024',
      keywords: ['chemical bonding', 'ionic', 'covalent', 'metallic', 'electrons', 'lattice', 'valency']
    },
    {
      id: 'phys_newtons_laws',
      level: 'O-Level',
      subject: 'Physics',
      topic: "Newton's Laws of Motion",
      content: `Newton's Three Laws of Motion form the basis of classical mechanics:

1. Newton's First Law (Law of Inertia):
   A body continues in its state of rest or uniform motion in a straight line unless acted upon by an external resultant force.

2. Newton's Second Law:
   The rate of change of momentum of a body is directly proportional to the applied resultant force and takes place in the direction of the force.
   Formula: F = ma (Force = mass × acceleration)
   Unit: Newton (N), where 1 N = 1 kg·m/s².

3. Newton's Third Law:
   For every action (force), there is an equal and opposite reaction.
   Example: When a rocket engine expels hot gases downward, the gases exert an equal upward thrust force on the rocket.`,
      source: 'ZIMSEC Physics Syllabus 4023',
      keywords: ['newton', 'laws of motion', 'force', 'mass', 'acceleration', 'inertia', 'momentum', 'physics']
    },
    {
      id: 'shona_tsumo',
      level: 'O-Level',
      subject: 'Chishona',
      topic: 'Tsumo dzeChishona neZvadzinoreva (Shona Proverbs)',
      content: `Tsumo dzeChishona dzinodzidzisa tsika, unhu, nehungwaru muupenyu:

1. "Chara chimwe hachitswanyi inda"
   - Zvazvinoreva: Munhu mumwe chete haakwanisi kuita basa guru ega; panodiwa kubatana nekushandira pamwe.
2. "Aive madziva ava mazambuko"
   - Zvazvinoreva: Upfumi kana simba zvinopera; upenyu hunochinja kubva pane zvakanaka kuenda pane zvisina kunaka.
3. "Kandiro kanoenda kunobva kamwe"
   - Zvazvinoreva: Kubatsirana nekupa kune vamwe; ukapa mumwe munhu zvinhu zvakanaka naiyewo anokurangarira.
4. "Mbudzi kudya mupfudze kuedza mukanwa"
   - Zvazvinoreva: Kuedza kuita chimwe chinhu chitsva kana chisingawanzoitwi.
5. "Gidi harina mupedzeri"
   - Zvazvinoreva: Hondo kana kukakavadzana hazvina anobuda akunda zvakakwana.`,
      source: 'ZIMSEC Shona Syllabus 4007',
      keywords: ['tsumo', 'shona', 'madimikira', 'unhu', 'tsika', 'chara chimwe', 'chishona']
    },
    {
      id: 'comm_double_entry',
      level: 'O-Level',
      subject: 'Accounting',
      topic: 'The Principle of Double Entry System',
      content: `The Double Entry system is the foundation of modern bookkeeping and financial accounting:
Golden Rule: "Every debit transaction must have a corresponding credit transaction of equal value."
Accounting Equation:
Assets = Capital (Owner's Equity) + Liabilities

Debit and Credit Rules:
1. Assets: Increase is DEBIT (+), Decrease is CREDIT (-)
2. Liabilities: Increase is CREDIT (+), Decrease is DEBIT (-)
3. Capital: Increase is CREDIT (+), Decrease is DEBIT (-)
4. Expenses/Losses: Increase is DEBIT (+)
5. Revenues/Gains: Increase is CREDIT (+)

Trial Balance:
A list of all debit and credit balances extracted from ledger accounts on a specific date to verify mathematical accuracy.`,
      source: 'ZIMSEC Principles of Accounts Syllabus 4051',
      keywords: ['accounting', 'double entry', 'debit', 'credit', 'ledger', 'trial balance', 'assets', 'liabilities']
    },
    {
      id: 'agri_soil_fertility',
      level: 'O-Level',
      subject: 'Agriculture',
      topic: 'Soil Fertility, Plant Nutrients, and Fertilizers in Zimbabwe',
      content: `Plant Nutrients are categorized into Macro-nutrients (required in large amounts) and Micro-nutrients (trace amounts).

Major Macro-nutrients:
- Nitrogen (N): Essential for vegetative growth and green leaf formation (chlorophyll). Deficiency causes yellowing (chlorosis) of older leaves.
- Phosphorus (P): Promotes root development and flowering/seed formation. Deficiency causes stunted growth and purple coloration on leaves.
- Potassium (K): Improves disease resistance, water regulation, and fruit quality. Deficiency causes marginal leaf scorch (scorched edges).

Types of Fertilizers Used in Zimbabwe:
1. Compound Fertilizers (Basal dressing at planting):
   - Compound D (7:14:7) used for maize planting
   - Compound S for soya beans
2. Straight Fertilizers (Top dressing):
   - Ammonium Nitrate (AN - 34.5% N) applied 4-6 weeks after emergence for rapid vegetative boost
   - Urea (46% N)
3. Organic Manure: Cattle dung, compost, green manure (improves soil structure and water holding capacity).`,
      source: 'ZIMSEC Agriculture Syllabus 4001',
      keywords: ['agriculture', 'soil fertility', 'fertilizer', 'compound d', 'ammonium nitrate', 'nitrogen', 'phosphorus', 'potassium']
    },
    {
      id: 'cs_binary_system',
      level: 'O-Level',
      subject: 'Computer Science',
      topic: 'Binary Number Representation and Logic Gates',
      content: `Computers use the Binary System (Base 2) comprising digits 0 and 1 because digital electronic circuits operate using two states: OFF (0V) and ON (+5V).

Data Units:
- Bit: Single binary digit (0 or 1)
- Nibble: 4 bits
- Byte: 8 bits (can represent 256 unique values, e.g. ASCII characters)
- Kilobyte (KB): 1024 bytes (or 1000 bytes in standard decimal metric)

Fundamental Logic Gates:
1. AND Gate: Output is 1 ONLY IF all inputs are 1. (Y = A · B)
2. OR Gate: Output is 1 IF AT LEAST ONE input is 1. (Y = A + B)
3. NOT Gate (Inverter): Inverts input. (Y = A')
4. NAND Gate: Opposite of AND.
5. NOR Gate: Opposite of OR.`,
      source: 'ZIMSEC Computer Science Syllabus 4021',
      keywords: ['computer science', 'binary', 'logic gates', 'and gate', 'or gate', 'not gate', 'bytes', 'bits']
    }
  ];

  static async load(): Promise<void> {
    if (this.isLoaded) return;
    this.chunks = [...this.SEED_CHUNKS];

    try {
      // Fetch knowledge manifest
      const res = await fetch('/assets/knowledge_manifest.json');
      if (res.ok) {
        const manifest = await res.json();
        // Load prominent flat chunk files in background
        const flatFiles = manifest.filter((m: { type: string; file: string }) => m.type === 'flat').slice(0, 8);
        for (const item of flatFiles) {
          try {
            const fileRes = await fetch(`/assets/${encodeURIComponent(item.file)}`);
            if (fileRes.ok) {
              const fileData = await fileRes.json();
              if (Array.isArray(fileData)) {
                for (const chunk of fileData) {
                  if (chunk.topic && chunk.content) {
                    this.chunks.push({
                      id: chunk.id || `${item.file}_${Math.random()}`,
                      level: chunk.level || 'O-Level',
                      subject: chunk.subject || 'General',
                      topic: chunk.topic,
                      content: chunk.content,
                      source: chunk.source || 'ZIMSEC',
                      keywords: Array.isArray(chunk.keywords)
                        ? chunk.keywords.map((k: string) => k.toLowerCase())
                        : [chunk.topic.toLowerCase(), (chunk.subject || '').toLowerCase()]
                    });
                  }
                }
              }
            }
          } catch {
            // Non-critical file loading skip
          }
        }
      }
    } catch {
      // Fallback on seed chunks
    }

    this.subjectsList = Array.from(new Set(this.chunks.map((c) => c.subject))).sort();
    this.isLoaded = true;
  }

  private static normalizeLevel(level: string): string {
    return level.replace(/-/g, '').replace(/\s+/g, '').toLowerCase();
  }

  private static stem(word: string): string {
    return word
      .toLowerCase()
      .replace(/ies$/, 'y')
      .replace(/es$/, '')
      .replace(/s$/, '')
      .replace(/ing$/, '')
      .replace(/ed$/, '');
  }

  static async searchScored(query: string, level: string): Promise<SearchResult> {
    await this.load();
    const cacheKey = `${query}|${level}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
      'the', 'and', 'for', 'with', 'from', 'that', 'this', 'these', 'those', 'is', 'are', 'in', 'of'
    ]);

    const words = query
      .toLowerCase()
      .split(/[^a-zA-Z0-9]+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const effectiveWords = words.length > 0
      ? words
      : query.toLowerCase().split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 2);

    if (effectiveWords.length === 0) {
      return { results: [], queryWords: [] };
    }

    const normLevel = this.normalizeLevel(level);

    const candidates = this.chunks.filter((c) => {
      const cLevel = this.normalizeLevel(c.level);
      return cLevel === normLevel || cLevel === 'general' || normLevel === 'tertiary';
    });

    const scored: ScoredChunk[] = [];

    for (const chunk of candidates) {
      let score = 0;
      const matchedWords = new Set<string>();
      const topicLower = chunk.topic.toLowerCase();
      const subjectLower = chunk.subject.toLowerCase();
      const contentLower = chunk.content.toLowerCase();
      const kwLower = chunk.keywords.map((k) => k.toLowerCase());

      for (const word of effectiveWords) {
        const stemmed = this.stem(word);
        let wordMatched = false;

        if (topicLower.includes(word) || topicLower.includes(stemmed)) {
          score += 50;
          wordMatched = true;
        }
        if (kwLower.some((k) => k === word || (word.length >= 4 && k.includes(word)))) {
          score += 45;
          wordMatched = true;
        }
        if (contentLower.includes(word)) {
          score += 25;
          wordMatched = true;
        }
        if (subjectLower.includes(word)) {
          score += 15;
          wordMatched = true;
        }

        if (wordMatched) matchedWords.add(word);
      }

      const threshold = effectiveWords.length <= 2 ? 1 : Math.max(1, Math.floor(effectiveWords.length * 0.4));
      if (score >= 20 && matchedWords.size >= threshold) {
        scored.push({ chunk, score, matchedWords });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, 5);
    const finalResult = { results: topResults, queryWords: effectiveWords };
    this.cache.set(cacheKey, finalResult);
    return finalResult;
  }

  static async getSubjects(level: string): Promise<string[]> {
    await this.load();
    const normLevel = this.normalizeLevel(level);
    return Array.from(
      new Set(
        this.chunks
          .filter((c) => this.normalizeLevel(c.level) === normLevel || this.normalizeLevel(c.level) === 'general')
          .map((c) => c.subject)
      )
    ).sort();
  }

  static async getTopics(level: string, subject: string): Promise<KnowledgeChunk[]> {
    await this.load();
    const normLevel = this.normalizeLevel(level);
    return this.chunks.filter(
      (c) =>
        c.subject.toLowerCase() === subject.toLowerCase() &&
        (this.normalizeLevel(c.level) === normLevel || this.normalizeLevel(c.level) === 'general')
    );
  }

  static async getAllChunks(): Promise<KnowledgeChunk[]> {
    await this.load();
    return this.chunks;
  }
}
