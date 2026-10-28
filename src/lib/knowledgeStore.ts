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
  private static cache = new Map<string, SearchResult>();

  // Primary Education Seed Chunks (Aligned with ZIMSEC Primary / Grade 1 - 7 Heritage-Based Curriculum)
  // Primary Education Seed Chunks (Aligned with ZIMSEC Official Grade 7 6-Subject Curriculum Format)
  private static readonly PRIMARY_SEED_CHUNKS: KnowledgeChunk[] = [
    {
      id: 'g7_eng_reading_comprehension',
      level: 'Primary',
      subject: 'English',
      topic: 'Reading Comprehension & Answering Techniques (ZIMSEC 7010)',
      content: `Mastering Grade 7 English Comprehension (Paper 1 & Paper 2):
1. How to tackle comprehension passages:
   - Read through the passage first to get the main idea and setting.
   - Read each question carefully and look for key question words: Who, What, Where, When, Why, and How.
   - Locate the paragraph where the answer is found.
   - Quote directly only when asked to "Quote" or "Pick out a phrase". Otherwise, answer in your own clear words and full sentences.
2. Vocabulary & Word Meaning:
   - When asked for the meaning of a word in context, replace it with your proposed synonym to see if the sentence still makes sense.
3. Summary & Main Idea:
   - Identify topic sentences at the beginning of each paragraph.`,
      source: 'ZIMSEC Grade 7 English Syllabus 7010',
      keywords: ['english', 'comprehension', 'reading', 'vocabulary', 'questions', 'passages', 'primary english']
    },
    {
      id: 'g7_eng_parts_of_speech',
      level: 'Primary',
      subject: 'English',
      topic: 'Parts of Speech: Nouns, Verbs, Adjectives, Adverbs, and Punctuation',
      content: `Key English Grammar Rules for Grade 7 ZIMSEC:
1. Parts of Speech:
   - Noun: Naming word for people, places, animals, or things (e.g. Tendai, Harare, cattle, pencil).
   - Verb: Action or state-of-being word (e.g. running, wrote, is, became).
   - Adjective: Describing word giving details about a noun (e.g. green leaves, tall tower, fertile soil).
   - Adverb: Word modifying a verb or adjective, often ending in -ly (e.g. sang sweetly, ran quickly, walked carefully).
   - Pronoun: Replaces a noun (e.g. he, she, it, they, us).
2. Punctuation Rules:
   - Capital Letters: First letter of sentences and proper nouns (names of people, places, days, months).
   - Full Stop (.): Ends a statement.
   - Question Mark (?): Ends a question.
   - Exclamation Mark (!): Shows strong emotion or surprise.
   - Comma (,): Separates items in a list or clauses in complex sentences.`,
      source: 'ZIMSEC Grade 7 English Language Curriculum',
      keywords: ['english grammar', 'parts of speech', 'nouns', 'verbs', 'adjectives', 'adverbs', 'punctuation', 'primary']
    },
    {
      id: 'g7_sci_photosynthesis',
      level: 'Primary',
      subject: 'Agric, Science & Tech',
      topic: 'How Plants Make Food (Photosynthesis in Agric, Science & Tech)',
      content: `In Grade 7 Agric, Science & Tech, photosynthesis is how green plants manufacture their own food:
1. What plants require:
   - Sunlight: Trapped by chlorophyll (the green pigment in leaves).
   - Water: Absorbed from the soil through roots and transported through xylem vessels.
   - Carbon Dioxide: Gas taken in from the atmosphere through tiny leaf pores called stomata.
2. What plants produce:
   - Glucose (Starch): Food used for plant energy and growth, stored in roots, stems, and fruits.
   - Oxygen: Released into the atmosphere for humans and animals to breathe.
3. Word Equation:
   Water + Carbon Dioxide + Sunlight (in green leaves) -> Food (Glucose/Starch) + Oxygen.
*Exam Tip:* Sunlight and chlorophyll are energy agents, not raw chemical reactants.`,
      source: 'ZIMSEC Grade 7 Agric, Science & Tech Syllabus 703',
      keywords: ['photosynthesis', 'plants', 'leaves', 'chlorophyll', 'sunlight', 'food', 'oxygen', 'water', 'agric', 'science', 'tech']
    },
    {
      id: 'g7_sci_soils',
      level: 'Primary',
      subject: 'Agric, Science & Tech',
      topic: 'Soil Types and Agricultural Properties: Sand, Clay, and Loam',
      content: `Soil composition and characteristics in Zimbabwe's farming regions:
1. Sandy Soil:
   - Large, coarse, gritty particles.
   - High drainage rate; does not hold water or soluble plant nutrients.
   - Warmed up quickly by the sun.
2. Clay Soil:
   - Extremely fine, microscopic particles tightly packed together.
   - High water-holding capacity; easily waterlogged, sticky when wet, and hard with cracks when dry.
   - High nutrient retention.
3. Loam Soil:
   - Optimum balanced mixture of sand, clay, and organic matter (humus).
   - Ideal drainage and aeration; best agricultural soil for maize, vegetables, and fruit orchards.`,
      source: 'ZIMSEC Grade 7 Agric, Science & Tech Syllabus 703',
      keywords: ['soil', 'types of soil', 'sand', 'clay', 'loam', 'drainage', 'humus', 'farming', 'agric']
    },
    {
      id: 'g7_agri_farm_tools',
      level: 'Primary',
      subject: 'Agric, Science & Tech',
      topic: 'Farm Tools, Simple Machines, and Safety Precautions',
      content: `Care, uses, and safety of tools in Agric, Science & Tech:
1. Common Farm Tools & Implements:
   - Hoe (Badza): Digging soil, creating furrows, and removing weeds.
   - Shovel: Scooping and spreading manure, compost, or sand.
   - Spade: Cutting clean edges, turning compost heaps, and transplanting seedlings.
   - Garden Fork: Loosening hard or rocky soil without damaging roots.
   - Rake: Gathering dry weeds, breaking clods, and leveling seedbeds.
   - Watering Can: Gentle watering with a rose sprinkler to avoid washing away seeds.
2. Tool Maintenance:
   - Clean off dirt and soil after each use.
   - Oil metal blades to prevent rust and oxidation.
   - Store sharp blades pointing downwards on racks in the tool shed.`,
      source: 'ZIMSEC Grade 7 Agric, Science & Tech Syllabus 703',
      keywords: ['farm tools', 'badza', 'hoe', 'shovel', 'spade', 'maintenance', 'safety', 'simple machines']
    },
    {
      id: 'g7_math_fractions',
      level: 'Primary',
      subject: 'Mathematics',
      topic: 'Common Fractions, Decimals, and Percentages',
      content: `Fractions represent equal parts of a whole:
- Numerator (top number): Shows how many parts are taken.
- Denominator (bottom number): Shows the total equal parts the whole is divided into.

Key Primary Math Operations:
1. Adding & Subtracting Fractions:
   Find the Common Denominator (LCM). Example: 1/4 + 2/4 = 3/4.
   For 1/2 + 1/3: Common denominator is 6 -> 3/6 + 2/6 = 5/6.
2. Converting Fractions to Decimals & Percentages:
   - 1/2 = 0.5 = 50%
   - 1/4 = 0.25 = 25%
   - 3/4 = 0.75 = 75%
   - 1/5 = 0.20 = 20%
   - 1/10 = 0.10 = 10%
3. Word Problems:
   Always read whether you are sharing or finding a remaining portion.`,
      source: 'ZIMSEC Grade 7 Mathematics Syllabus 7020',
      keywords: ['math', 'fractions', 'decimals', 'percentage', 'numerator', 'denominator', 'primary mathematics']
    },
    {
      id: 'g7_math_perimeter_area',
      level: 'Primary',
      subject: 'Mathematics',
      topic: 'Perimeter and Area of 2D Shapes',
      content: `Measurement in Grade 7 ZIMSEC Mathematics:
1. Perimeter: The total distance around the outside edge of a shape.
   - Rectangle: Perimeter = 2 × (Length + Width) or (L + W + L + W).
     Example: Length = 8cm, Width = 5cm -> Perimeter = 2 × (8 + 5) = 26cm.
   - Square: Perimeter = 4 × Side (4s).
   - Triangle: Add all three sides (a + b + c).

2. Area: The amount of flat surface space covered inside the boundary:
   - Rectangle: Area = Length × Width (measured in cm² or m²).
     Example: 8cm × 5cm = 40cm².
   - Square: Area = Side × Side (s²).
   - Right-angled Triangle: Area = 1/2 × Base × Height.`,
      source: 'ZIMSEC Grade 7 Mathematics Syllabus 7020',
      keywords: ['perimeter', 'area', 'rectangle', 'square', 'distance', 'length', 'width', 'primary math']
    },
    {
      id: 'g7_heritage_national_symbols',
      level: 'Primary',
      subject: 'Social Science',
      topic: 'National Symbols of Zimbabwe and Cultural Heritage',
      content: `National symbols represent sovereignty, unity, and heritage in Social Science:
1. The Zimbabwe National Flag:
   - Green: Vegetation, agriculture, and rich natural resources.
   - Yellow/Gold: Mineral wealth (gold, chrome, platinum).
   - Red: Blood shed by gallant heroes during the Liberation Struggle (Chimurenga).
   - Black: The indigenous African black majority.
   - White Triangle: Peace, freedom, and national tranquility.
   - Red Star: High aspirations, national progress, and peace.
   - Zimbabwe Bird (Hungwe): National emblem representing history, identity, and origin at Great Zimbabwe.
2. The National Anthem ("Simudzai Mureza Wedu weZimbabwe" / "Kalibusiswe Ilizwe leZimbabwe"):
   Sung with reverence to honor the nation, heroes, and land.
3. National Monuments & Heritage Sites:
   - Great Zimbabwe Monuments (Masvingo)
   - National Heroes Acre (Harare)
   - Victoria Falls (Mosi-oa-Tunya)
   - Matobo Hills & Njelele shrine.`,
      source: 'ZIMSEC Grade 7 Social Science Syllabus 7050',
      keywords: ['national flag', 'zimbabwe bird', 'hungwe', 'national anthem', 'heroes acre', 'great zimbabwe', 'social science']
    },
    {
      id: 'g7_social_unhu_family',
      level: 'Primary',
      subject: 'Social Science',
      topic: 'Unhu/Ubuntu Values, Family Roles, and Community Governance',
      content: `In Grade 7 Social Science, Unhu/Ubuntu is the moral fabric of Zimbabwean society:
1. Core Values of Unhu/Ubuntu:
   - Tsika neKuremekedza (Respect for elders, leaders, and peers).
   - Kutendeka (Honesty, trustworthiness, and upright behavior).
   - Kubatsirana (Solidarity, mutual assistance, and community compassion).
   - Kugara zvakanaka nevamwe (Living in peace and avoiding conflict).
2. Family & Community Structures:
   - Nuclear family (Father, mother, children) and Extended family (grandparents, uncles, aunts, cousins).
   - Traditional leadership: Chiefs (Madzishe/Izinduna), Headmen (Masadunhu), and Village Heads (Mabhuku/Abalisa).
   - Resolving disputes amicably at the traditional village court (Dare).`,
      source: 'ZIMSEC Grade 7 Social Science Syllabus 7050',
      keywords: ['unhu', 'ubuntu', 'values', 'family', 'traditional leaders', 'dare', 'chief', 'social science']
    },
    {
      id: 'g7_shona_tsumo',
      level: 'Primary',
      subject: 'Shona',
      topic: 'Tsumo dzeChishona dzePrimary neZvadzinoreva',
      content: `Tsumo dzinodzidzisa vana tsika dzakanaka, unhu, nekushandira pamwe muupenyu:
1. "Chara chimwe hachitswanyi inda."
   - Zvazvinoreva: Munhu mumwe chete haakwanisi kuita basa guru ari ega; panodiwa kubatana kwekushanda nevamwe.
2. "Mwana asingachemi anofira mumbereko."
   - Zvazvinoreva: Munhu anofanira kutaura zviri kumunetsa kuti awane rubatsiro.
3. "Kandiro kanoenda kunobva kamwe."
   - Zvazvinoreva: Kudyidzana nekupa vamwe zvakanaka; ukapawo vamwe vachakupawo.
4. "Aive madziva ava mazambuko."
   - Zvazvinoreva: Zvinhu zvinochinja; munhu aiva nesimba kana upfumi anogona kusara asina.
5. "Nzombe huru inotangira pakutekaira."
   - Zvazvinoreva: Basa guru kana munhu mukuru anobva pakutanga ari mudiki achikura.`,
      source: 'ZIMSEC Grade 7 Shona Syllabus 7040',
      keywords: ['tsumo', 'chishona', 'shona', 'chara chimwe', 'madimikira', 'primary shona', 'unhu']
    },
    {
      id: 'g7_ndebele_izaga',
      level: 'Primary',
      subject: 'Shona',
      topic: 'Izaga ZesiNdebele leNshoko Zazo (Indigenous Language / Ndebele Proverbs)',
      content: `Izaga zifundisa abantwana inhlonipho, ubuntu, lokuziphatha ngendlela enhle:
1. "Inyoni itshayelwa ezalela."
   - Injongo: Umuntu uncediswa lapho abantu ababona khona ukuthi uyazama ukusebenza.
2. "Isisu somhambi sasinganani, singangenso yenyoni."
   - Injongo: Isihambi kasisutsi ngokudla okunengi; sidinga ukwamukelwa ngothando.
3. "Uhlanga lwendoda kalubole."
   - Injongo: Indodana iyalandela amagugu abokhokho bayo.
4. "Izandla ziyagezana."
   - Injongo: Ukuncedisana lokusebenzisana emphakathini kuletha impumelelo.`,
      source: 'ZIMSEC Grade 7 IsiNdebele Syllabus 7041',
      keywords: ['ndebele', 'isindebele', 'izaga', 'izitsho', 'ubuntu', 'primary ndebele', 'shona']
    },
    {
      id: 'g7_pe_health_games',
      level: 'Primary',
      subject: 'Physical Edu & Arts',
      topic: 'Health, Safety, Fitness, and Traditional Games in Zimbabwe',
      content: `In Physical Education and Arts (PEA):
1. Physical Fitness & Health:
   - Exercise strengthens the heart, lungs, and muscles, and prevents obesity.
   - Importance of warm-up before sports (prevents muscle cramps and sprains) and cool-down after exercises.
2. Traditional Zimbabwean Games:
   - Pada: Hopscotch game testing agility, balance, and coordination.
   - Nhodo: Stone-picking game developing hand-eye coordination, reaction speed, and counting.
   - Tsoro Yemutwve: Strategic African board game developing mental math and critical planning.
3. Traditional Dances and Performing Arts:
   - Mbende / Jerusarema (Mashonaland East - fertility and celebratory dance).
   - Muchongoyo (Manicaland/Chipinga - Ndau war and victory dance).
   - Isitshikitsha (Matabeleland - social and royal entertainment dance).
4. Visual Arts & Crafts:
   - Shona soapstone sculpture (Chitungwiza, Tengenenge).
   - Traditional pottery, wood carving, and basketry (Tonga / Binga baskets).`,
      source: 'ZIMSEC Grade 7 Physical Edu & Arts Syllabus 7130',
      keywords: ['physical education', 'pea', 'pada', 'nhodo', 'tsoro', 'muchongoyo', 'mbende', 'jerusarema', 'arts', 'primary']
    }
  ];

  // Secondary Education Seed Chunks (O-Level & A-Level)
  private static readonly SECONDARY_SEED_CHUNKS: KnowledgeChunk[] = [
    {
      id: 'geo_agro_regions',
      level: 'O-Level',
      subject: 'Geography',
      topic: 'Natural Farming Regions of Zimbabwe (Regions I - V)',
      content: `Zimbabwe is divided into five Natural Farming (Agro-Ecological) Regions based on rainfall, temperature, and agricultural potential:
- Region I (Specialized & Diversified): High rainfall (>1000mm/yr), cool temperatures. Eastern Highlands (Nyanga, Chimanimani). Crops: Tea, coffee, macadamia, timber, apples.
- Region II (Intensive Farming): High reliable rainfall (750-1000mm/yr). Highveld (Harare, Mazowe). Main crops: Maize, tobacco, soya beans, wheat, dairy farming.
- Region III (Semi-Intensive Farming): Moderate rainfall (500-750mm/yr), mid-season dry spells. Midlands (Gweru, Kwekwe). Drought-tolerant crops: Sorghum, sunflower, beef cattle.
- Region IV (Semi-Extensive Farming): Low rainfall (450-650mm/yr), frequent droughts, high temperatures. Matabeleland, Gokwe. Drought-resistant crops (millet, sorghum) and livestock production.
- Region V (Extensive Farming): Very low erratic rainfall (<450mm/yr), very hot. Lowveld (Chiredzi, Beitbridge, Zambezi Valley). Cattle ranching, wildlife/safaris, and extensive sugarcane/citrus under irrigation (Triangle, Hippo Valley).`,
      source: 'ZIMSEC Geography Syllabus 4022',
      keywords: ['chiredzi', 'natural region', 'agro-ecological', 'region 5', 'region 1', 'region 2', 'region 3', 'region 4', 'rainfall', 'farming', 'zimbabwe']
    },
    {
      id: 'bio_photosynthesis_olevel',
      level: 'O-Level',
      subject: 'Biology',
      topic: 'Photosynthesis in Plants (Cellular Biochemistry)',
      content: `Photosynthesis is the synthesis of glucose in chloroplasts:
Word Equation: Carbon dioxide + Water --(sunlight & chlorophyll)--> Glucose + Oxygen
Chemical Equation: 6CO2 + 6H2O -> C6H12O6 + 6O2

Biochemical Stages:
1. Light-dependent Stage: Occurs in the thylakoid membranes (grana). Sunlight energy is trapped by chlorophyll pigments, leading to photolysis of water (2H2O -> 4H+ + 4e- + O2). High-energy ATP and NADPH are synthesized.
2. Light-independent Stage (Calvin Cycle): Occurs in the stroma. Carbon dioxide fixation is catalyzed by the RuBisCO enzyme. ATP and NADPH reduce 3-phosphoglycerate into triose phosphate and glucose.

Limiting Factors: Light intensity, atmospheric carbon dioxide concentration (~0.04%), and temperature (enzyme denaturing above 45°C).`,
      source: 'ZIMSEC Biology Syllabus 4025',
      keywords: ['photosynthesis', 'chlorophyll', 'calvin cycle', 'photolysis', 'rubisco', 'glucose', 'chloroplast', 'olevel biology']
    },
    {
      id: 'hist_great_zimbabwe',
      level: 'O-Level',
      subject: 'History',
      topic: 'Great Zimbabwe State: Rise, Economy, and Decline',
      content: `Great Zimbabwe was a medieval African empire located near Masvingo, flourishing between 1200 and 1450 AD.
1. Dry-stone Architecture: Built without mortar using granite blocks shaped by thermal fracturing (Great Enclosure, Conical Tower, Hill Complex).
2. Economy: Pastoralism (large cattle herds), agriculture (sorghum, millet), long-distance trade via Sofala port (exchanged gold, ivory, iron for Chinese porcelain, glass beads, cloth).
3. Religion: Mwari cult centered on spirit mediums (Mhondoro) and soapstone Zimbabwe Birds (Hungwe).
4. Reasons for Decline (mid-15th century): Depletion of firewood and grazing land, salt shortages, population pressure, civil disputes, and trade route shift northward to Mutapa.`,
      source: 'ZIMSEC History Syllabus 2167',
      keywords: ['great zimbabwe', 'mutapa', 'dry-stone', 'stone walling', 'hungwe', 'masvingo', 'decline', 'trade', 'history']
    },
    {
      id: 'math_quadratic_formula',
      level: 'O-Level',
      subject: 'Mathematics',
      topic: 'Solving Quadratic Equations',
      content: `Standard Form: ax² + bx + c = 0 (where a ≠ 0).
The Quadratic Formula:
x = (-b ± √(b² - 4ac)) / (2a)
- The discriminant Δ = b² - 4ac reveals the nature of roots:
  * Δ > 0: two distinct real roots
  * Δ = 0: one repeated real root
  * Δ < 0: no real roots (complex roots)
Factoring Method: Find factors of ac that sum to b, then factor by grouping.`,
      source: 'ZIMSEC Mathematics Syllabus 4004',
      keywords: ['quadratic', 'formula', 'algebra', 'roots', 'discriminant', 'factorization']
    },
    {
      id: 'comm_double_entry',
      level: 'O-Level',
      subject: 'Accounting',
      topic: 'The Principle of Double Entry System',
      content: `Golden Rule: "For every debit transaction there must be an equal and corresponding credit transaction."
Accounting Equation: Assets = Capital + Liabilities
Rules of Debit and Credit:
- Assets: Increase = DEBIT, Decrease = CREDIT
- Liabilities: Increase = CREDIT, Decrease = DEBIT
- Capital: Increase = CREDIT, Decrease = DEBIT
- Expenses: Increase = DEBIT
- Revenue/Income: Increase = CREDIT.`,
      source: 'ZIMSEC Principles of Accounts Syllabus 4051',
      keywords: ['accounting', 'double entry', 'debit', 'credit', 'ledger', 'trial balance']
    }
  ];

  // Tertiary Education Seed Chunks (Higher Education & Research)
  private static readonly TERTIARY_SEED_CHUNKS: KnowledgeChunk[] = [
    {
      id: 'tert_macro_policy',
      level: 'Tertiary',
      subject: 'Economics & Commerce',
      topic: 'Macroeconomic Fiscal and Monetary Policy Paradigms',
      content: `Comparative macroeconomic models:
1. Keynesian Paradigm: Focuses on aggregate demand rigidities, sticky wages, and the liquidity trap. Prescribes counter-cyclical discretionary fiscal policy and expansionary public spending during demand-deficient recessions.
2. Classical / Neoclassical Paradigm: Assumes price flexibility, Say's Law ("supply creates its own demand"), and long-run money neutrality. Emphasizes supply-side incentives, deregulation, and inflation targeting via rule-based central bank monetary policy.`,
      source: 'University Tertiary Economics & Finance Framework',
      keywords: ['macroeconomics', 'keynesian', 'monetary policy', 'fiscal policy', 'inflation', 'aggregate demand', 'tertiary']
    },
    {
      id: 'tert_software_solid',
      level: 'Tertiary',
      subject: 'Computer Science & Engineering',
      topic: 'Object-Oriented Design and SOLID Principles',
      content: `SOLID Principles in Software Engineering:
- S: Single Responsibility Principle (A class should have one, and only one, reason to change).
- O: Open/Closed Principle (Software entities should be open for extension, but closed for modification).
- L: Liskov Substitution Principle (Subtypes must be substitutable for their base types without altering correctness).
- I: Interface Segregation Principle (Clients should not be forced to depend on interfaces they do not use).
- D: Dependency Inversion Principle (High-level modules should depend on abstractions, not on low-level concretions).`,
      source: 'University Computer Science & Software Engineering',
      keywords: ['solid', 'object-oriented', 'design patterns', 'software engineering', 'computer science', 'tertiary']
    }
  ];

  private static loadPromise: Promise<void> | null = null;

  static async load(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const seenIds = new Set<string>();
      const initialChunks = [
        ...this.PRIMARY_SEED_CHUNKS,
        ...this.SECONDARY_SEED_CHUNKS,
        ...this.TERTIARY_SEED_CHUNKS
      ];
      this.chunks = [];
      for (const chunk of initialChunks) {
        if (!seenIds.has(chunk.id)) {
          seenIds.add(chunk.id);
          this.chunks.push(chunk);
        }
      }

      try {
        // Fetch primary specific JSON curriculum notes
        const primaryFiles = [
          'zimsec_mathematics_grade7.json',
          'zimsec_primary_math_full_depth.json',
          'zimsec_science_technology_full_depth.json',
          'zimsec_grade_7_agriculture_full_expanded.json',
          'zimsec_agriculture_7grade.json',
          'zimsec_english_junior_grades_3to7.json',
          'zimsec_chishona_g7_full_notes.json',
          'zimsec_chishona_g7_studyguide.json',
          'zimsec_ndebele_grade7.json',
          'zimsec_heritage_studies_grade7_topics1-3.json',
          'zimsec_heritage_primary.json',
          'zimsec_grade7_frme.json',
          'zimsec_primary_pe_grade7.json',
          'zimsec_ict_grade7.json'
        ];

        for (const fileName of primaryFiles) {
          try {
            const res = await fetch(`/assets/${encodeURIComponent(fileName)}`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                  const item = data[i];
                  if (item.topic && item.content) {
                    const uniqueId = item.id ? `${fileName}_${item.id}` : `${fileName}_${i}`;
                    if (!seenIds.has(uniqueId)) {
                      seenIds.add(uniqueId);
                      this.chunks.push({
                        id: uniqueId,
                        level: 'Primary',
                        subject: this.standardizePrimarySubject(item.subject || 'General'),
                        topic: item.topic,
                        content: item.content,
                        source: item.source || 'ZIMSEC Grade 7 Primary Curriculum',
                        keywords: Array.isArray(item.keywords)
                          ? item.keywords.map((k: string) => k.toLowerCase())
                          : [item.topic.toLowerCase(), (item.subject || '').toLowerCase()]
                      });
                    }
                  }
                }
              }
            }
          } catch {
            // Skip if file missing
          }
        }

        // Fetch O-Level files
        const oLevelFiles = [
          'zimsec_mathematics_olevel.json',
          'zimsec_combined_science_o_level_100k_detailed.json',
          'zimsec_olevel_english_language.json',
          'zimsec_shona_o_level_4007_study_pack.json',
          'zimsec_geography_o_level_full_study_pack.json',
          'zimsec_history_olevel_paper1_topic1_precolonial_states.json',
          'zimsec_history_olevel_paper1_topics2-7.json',
          'zimsec_commerce_4049_o_level_FULL_DEPTH_FINAL.json',
          'zimsec_computer_science_4021_o_level_FULL_DEPTH_FINAL.json',
          'zimsec_accounting_4051_o_level_final.json',
          'zimsec_agriculture_4001_o_level_full_study_pack.json',
          'zimsec_biology_4025_o_level_full_study_pack.json',
          'zimsec_chemistry_o_level_full_study_pack.json',
          'zimsec_physics_4023_o_level_FULL_DEPTH_FINAL_310KB.json',
          'zimsec_geography_secondary.json',
          'zimsec_history_secondary.json',
          'zimsec_biology_v1.json',
          'zimsec_physics_v1.json',
          'zimsec_chemistry_v1.json'
        ];

        for (const fileName of oLevelFiles) {
          try {
            const res = await fetch(`/assets/${encodeURIComponent(fileName)}`);
            if (res.ok) {
              const data = await res.json();
              const items = Array.isArray(data)
                ? data
                : data && Array.isArray(data.chunks)
                ? data.chunks
                : [];

              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.topic && item.content) {
                  const uniqueId = item.id ? `${fileName}_${item.id}` : `${fileName}_${i}`;
                  if (!seenIds.has(uniqueId)) {
                    seenIds.add(uniqueId);
                    this.chunks.push({
                      id: uniqueId,
                      level: 'O-Level',
                      subject: item.subject || 'Combined Science',
                      topic: item.topic,
                      content: item.content,
                      source: item.source || 'ZIMSEC O-Level Curriculum',
                      keywords: Array.isArray(item.keywords)
                        ? item.keywords.map((k: string) => k.toLowerCase())
                        : [item.topic.toLowerCase(), (item.subject || '').toLowerCase()]
                    });
                  }
                }
              }
            }
          } catch {
            // Skip if missing
          }
        }

        // Fetch A-Level files
        const aLevelFiles = [
          'zimsec_a_level_pure_mathematics_6042_full_final.json',
          'zimsec_a_level_biology_full_final.json',
          'zimsec_a_level_history_9155_extensive_study_pack.json',
          'zimsec_a_level_geography_full_syllabus.json',
          'zimsec_a_level_english_literature_9153_full_expanded.json',
          'zimsec_a_level_divinity_full_syllabus.json',
          'zimsec_a_level_shona_9145_full_expanded.json',
          'zimsec_accounting_a_level_2024_2030_expanded.json',
          'zimsec_business_studies_a_level_2024_2030_expanded.json',
          'zimsec_chemistry_a_level_full.json',
          'zimsec_economics_a_level_2024_2030_expanded.json',
          'zimsec_physics_a_level_2024_2030_expanded.json',
          'zimsec_statistics_a_level_6046_study_pack.json'
        ];

        for (const fileName of aLevelFiles) {
          try {
            const res = await fetch(`/assets/${encodeURIComponent(fileName)}`);
            if (res.ok) {
              const data = await res.json();
              const items = Array.isArray(data)
                ? data
                : data && Array.isArray(data.chunks)
                ? data.chunks
                : [];

              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.topic && item.content) {
                  const uniqueId = item.id ? `${fileName}_${item.id}` : `${fileName}_${i}`;
                  if (!seenIds.has(uniqueId)) {
                    seenIds.add(uniqueId);
                    this.chunks.push({
                      id: uniqueId,
                      level: 'A-Level',
                      subject: item.subject || 'Advanced Level',
                      topic: item.topic,
                      content: item.content,
                      source: item.source || 'ZIMSEC Advanced Level Curriculum',
                      keywords: Array.isArray(item.keywords)
                        ? item.keywords.map((k: string) => k.toLowerCase())
                        : [item.topic.toLowerCase(), (item.subject || '').toLowerCase()]
                    });
                  }
                }
              }
            }
          } catch {
            // Skip if missing
          }
        }

      } catch {
        // Fallback on seed chunks
      }

      this.isLoaded = true;
    })();

    return this.loadPromise;
  }

  /**
   * Standardizes subjects according to the official ZIMSEC Grade 7 6-Subject format:
   * 1. English
   * 2. Mathematics
   * 3. Agric, Science & Tech
   * 4. Shona
   * 5. Social Science
   * 6. Physical Edu & Arts
   */
  public static standardizePrimarySubject(raw: string): string {
    const s = (raw || '').toLowerCase();
    if (s.includes('english')) return 'English';
    if (s.includes('math')) return 'Mathematics';
    if (s.includes('shona') || s.includes('chishona') || s.includes('ndebele')) return 'Shona';
    if (
      s.includes('physical') ||
      s.includes('7130') ||
      /\b(pe|pea|arts?)\b/i.test(s) ||
      s.includes('sport') ||
      s.includes('music')
    ) {
      return 'Physical Edu & Arts';
    }
    if (
      s.includes('social') ||
      s.includes('heritage') ||
      s.includes('705') ||
      s.includes('frme') ||
      s.includes('religion') ||
      s.includes('moral') ||
      s.includes('general') ||
      s.includes('civic')
    ) {
      return 'Social Science';
    }
    if (
      s.includes('agri') ||
      s.includes('technology') ||
      s.includes('tech') ||
      s.includes('ict') ||
      (s.includes('science') && !s.includes('social'))
    ) {
      return 'Agric, Science & Tech';
    }
    return 'Social Science';
  }

  private static normalizeLevel(level: string): string {
    const l = (level || '').replace(/-/g, '').replace(/\s+/g, '').toLowerCase();
    if (l.includes('primary') || l.includes('grade')) return 'primary';
    if (l.includes('alevel') || l.includes('form5') || l.includes('form6')) return 'alevel';
    if (l.includes('olevel') || l.includes('form1') || l.includes('form2') || l.includes('form3') || l.includes('form4')) return 'olevel';
    if (l.includes('tertiary') || l.includes('university') || l.includes('college')) return 'tertiary';
    return l;
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

  /**
   * Strictly filters knowledge chunks for the target education level!
   */
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

    // STRICT LEVEL FILTERING:
    // Primary ONLY matches Primary / Grade 7
    // O-Level ONLY matches O-Level (Forms 1 - 4)
    // A-Level ONLY matches A-Level (Forms 5 - 6)
    // Tertiary ONLY matches Tertiary
    const candidates = this.chunks.filter((c) => {
      const cLevel = this.normalizeLevel(c.level);
      if (normLevel === 'primary') {
        return cLevel === 'primary' || cLevel === 'grade7';
      }
      if (normLevel === 'alevel') {
        return cLevel === 'alevel';
      }
      if (normLevel === 'olevel') {
        return cLevel === 'olevel';
      }
      if (normLevel === 'tertiary') {
        return cLevel === 'tertiary';
      }
      return cLevel === normLevel;
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

  /**
   * Returns subjects specific to the given level.
   * Primary: ZIMSEC Primary Heritage-Based Curriculum.
   * O-Level: ZIMSEC O-Level (Forms 1 - 4).
   * A-Level: ZIMSEC Advanced Level (Forms 5 - 6).
   */
  static async getSubjects(level: string): Promise<string[]> {
    await this.load();
    const normLevel = this.normalizeLevel(level);

    if (normLevel === 'primary') {
      return [
        'English',
        'Mathematics',
        'Agric, Science & Tech',
        'Shona',
        'Social Science',
        'Physical Edu & Arts'
      ];
    }

    if (normLevel === 'alevel') {
      const aChunks = this.chunks.filter((c) => this.normalizeLevel(c.level) === 'alevel');
      const set = new Set(aChunks.map((c) => c.subject));
      if (set.size === 0) {
        return [
          'Pure Mathematics',
          'Biology',
          'Chemistry',
          'Physics',
          'Accounting',
          'Economics',
          'Business Studies',
          'Geography',
          'History',
          'Divinity',
          'Literature in English',
          'Statistics',
          'Shona'
        ];
      }
      return Array.from(set).sort();
    }

    if (normLevel === 'olevel') {
      const oChunks = this.chunks.filter((c) => this.normalizeLevel(c.level) === 'olevel');
      const set = new Set(oChunks.map((c) => c.subject));
      if (set.size === 0) {
        return [
          'Combined Science',
          'Mathematics',
          'English Language',
          'Commerce',
          'Principles of Accounts',
          'Geography',
          'History',
          'Computer Science',
          'Agriculture',
          'Biology',
          'Chemistry',
          'Physics',
          'Shona'
        ];
      }
      return Array.from(set).sort();
    }

    if (normLevel === 'tertiary') {
      return [
        'Business Administration',
        'Computer Science & Engineering',
        'Economics & Commerce',
        'Education & Pedagogy',
        'Law & Jurisprudence',
        'Medicine & Health Sciences',
        'Social Sciences'
      ];
    }

    // Generic Secondary fallback
    const secondaryChunks = this.chunks.filter((c) => {
      const cLvl = this.normalizeLevel(c.level);
      return cLvl === 'olevel' || cLvl === 'alevel';
    });

    const set = new Set(secondaryChunks.map((c) => c.subject));
    set.add('Combined Science');
    set.add('Commerce');
    set.add('Principles of Accounts');
    set.add('Geography');
    set.add('History');
    return Array.from(set).sort();
  }

  static async getTopics(level: string, subject: string): Promise<KnowledgeChunk[]> {
    await this.load();
    const normLevel = this.normalizeLevel(level);

    return this.chunks.filter((c) => {
      const cLevel = this.normalizeLevel(c.level);
      let isCorrectLevel = false;

      if (normLevel === 'primary') {
        isCorrectLevel = cLevel === 'primary' || cLevel === 'grade7';
      } else if (normLevel === 'alevel') {
        isCorrectLevel = cLevel === 'alevel';
      } else if (normLevel === 'olevel') {
        isCorrectLevel = cLevel === 'olevel';
      } else if (normLevel === 'tertiary') {
        isCorrectLevel = cLevel === 'tertiary';
      } else {
        isCorrectLevel = cLevel === 'olevel' || cLevel === 'alevel';
      }

      if (!isCorrectLevel) return false;

      // Handle subject matching (including standardized primary names)
      if (normLevel === 'primary') {
        const stdSubj = this.standardizePrimarySubject(c.subject);
        return stdSubj.toLowerCase() === subject.toLowerCase();
      }

      return c.subject.toLowerCase() === subject.toLowerCase();
    });
  }
}
