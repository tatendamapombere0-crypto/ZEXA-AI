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
      id: 'g7_eng_collective_nouns',
      level: 'Primary',
      subject: 'English',
      topic: 'Collective Nouns for People, Animals, and Objects',
      content: `In ZIMSEC Grade 7 English Language (Syllabus 7010), collective nouns name a group or collection of people, animals, or things considered as a single unit:
1. Animals: A pride of lions, a troop of baboons/monkeys, a swarm of bees/locusts, a herd of cattle/elephants, a flock of sheep/birds, a pack of wolves/dogs, a litter of puppies/kittens, a gaggle of geese, a school/pod of whales/fish.
2. People: A choir of singers, a congregation of worshippers, a crowd of spectators, a panel of judges/doctors, a crew of sailors, a band of musicians, a staff of teachers, a bench of magistrates, a team of players.
3. Objects: A fleet of ships/cars/buses, a suite of furniture/rooms, a bouquet of flowers, a bunch of keys/bananas, a bale of cotton/tobacco, a stack of books, a chest of drawers, a range of mountains.
*Exam Rule:* Collective nouns take a singular verb when acting as one unit: 'The choir is singing harmoniously.'`,
      source: 'ZIMSEC Grade 7 English Language Syllabus 7010',
      keywords: ['collective nouns', 'pride of lions', 'flock of birds', 'swarm of bees', 'herd of cattle', 'choir of singers', 'fleet of ships', 'bale of cotton', 'english grammar']
    },
    {
      id: 'g7_eng_prepositions_collocations',
      level: 'Primary',
      subject: 'English',
      topic: 'Prepositions, Collocations, and Fixed Phrases',
      content: `Prepositions show relationships between nouns/pronouns and other sentence parts:
1. Fixed Prepositions with Adjectives:
- Afraid OF, Accused OF, Ashamed OF, Aware OF, Proud OF, Jealous OF, Fond OF.
- Good AT, Bad AT, Clever AT (He is good at mathematics - NEVER good in).
- Angry WITH a person (angry with Tendai); Angry AT a situation/thing.
- Congratulate ON (congratulate on winning - NEVER for).
- Insist ON, Depend ON, Rely ON, Keen ON.
2. Core ZIMSEC Traps:
- Prefer ... TO: 'I prefer tea to coffee' (NEVER 'prefer than').
- Superior TO, Inferior TO, Senior TO, Junior TO (NEVER than).
- Died OF a disease ('died of malaria'); Died FROM wounds/bleeding.
- Divide BETWEEN two; Divide AMONG three or more.
- Prevent FROM, Married TO (married to a doctor - NEVER with), Belong TO.
3. Prepositions of Time:
- AT (at 6 o'clock, at noon), ON (on Monday, on 18 April), IN (in May, in 2026, in the morning), BETWEEN ... AND (between 2 pm and 4 pm - NOT to).`,
      source: 'ZIMSEC Grade 7 English Language Syllabus 7010',
      keywords: ['prepositions', 'prefer to', 'congratulate on', 'good at', 'afraid of', 'died of', 'between and', 'senior to', 'divide among']
    },
    {
      id: 'g7_eng_concord_rules',
      level: 'Primary',
      subject: 'English',
      topic: 'Subject-Verb Agreement (Concord) Rules',
      content: `Rules of Concord in Grade 7 ZIMSEC English:
1. Basic Rule: Singular subject takes singular verb (ends in -s); plural subject takes plural verb.
2. Intervening Phrases: Phrases like 'as well as', 'together with', 'accompanied by', 'along with' do not change the subject:
   - 'The teacher, as well as the pupils, was present.' (teacher is singular -> was).
   - 'The cattle, together with the shepherd, were caught in the storm.' (cattle is plural -> were).
3. 'Either ... or' and 'Neither ... nor': The verb agrees with the subject CLOSER to it:
   - 'Neither the teacher nor the students were present.'
   - 'Neither the students nor the teacher was present.'
4. Indefinite Pronouns: 'Each', 'everyone', 'everybody', 'anyone', 'nobody', 'one of' ALWAYS take a singular verb:
   - 'Each of the pupils was given a book.' (NOT were).
   - 'One of the cows has calved.'
5. Distance, Money, and Time take singular verbs: 'Ten kilometres is a long walk.' 'Fifty dollars was spent.'`,
      source: 'ZIMSEC Grade 7 English Language Syllabus 7010',
      keywords: ['concord', 'subject verb agreement', 'neither nor', 'either or', 'each of the', 'one of the', 'as well as', 'english grammar']
    },
    {
      id: 'g7_eng_direct_indirect_speech',
      level: 'Primary',
      subject: 'English',
      topic: 'Direct and Indirect (Reported) Speech Transformation',
      content: `Transforming Direct Speech into Indirect (Reported) Speech:
1. Tense Backshift Rules (when reporting in past: said, told):
- Simple Present -> Simple Past: 'I walk' -> he walked.
- Present Continuous -> Past Continuous: 'We are weeding' -> they were weeding.
- Present Perfect -> Past Perfect: 'She has eaten' -> she had eaten.
- Simple Past -> Past Perfect: 'The dog barked' -> the dog had barked.
- Will -> would, Can -> could, May -> might, Must -> had to.
2. Adverbs of Time and Place:
- now -> then, today -> that day, yesterday -> the previous day / the day before, tomorrow -> the next day / following day, here -> there, this -> that, ago -> before.
3. Questions:
- Yes/No questions use 'if' or 'whether': He asked if I had seen his pen.
- WH-questions keep question word with statement order (Subject before Verb): She asked where I lived (NOT 'where did I live').`,
      source: 'ZIMSEC Grade 7 English Language Syllabus 7010',
      keywords: ['direct speech', 'indirect speech', 'reported speech', 'said that', 'tense backshift', 'reporting questions', 'english grammar']
    },
    {
      id: 'g7_eng_question_tags',
      level: 'Primary',
      subject: 'English',
      topic: 'Question Tags: Rules and Exceptions',
      content: `Rules of Question Tags in Grade 7 ZIMSEC English:
1. Golden Rule:
- POSITIVE statement takes a NEGATIVE tag: 'She is a student, isn't she?' 'He works hard, doesn't he?' 'They arrived early, didn't they?'
- NEGATIVE statement takes a POSITIVE tag: 'You aren't tired, are you?' 'They don't know, do they?' 'He cannot swim, can he?'
2. Auxiliary Verbs: Repeat the auxiliary: 'The bus was late, wasn't it?' 'We should leave, shouldn't we?'
3. No Auxiliary: Use DO, DOES, or DID: 'They play soccer, don't they?' 'Simba loves reading, doesn't he?' 'She cooked sadza, didn't she?'
4. Special Irregular Tags:
- 'I am' takes 'aren't I?': 'I am correct, aren't I?'
- 'Let's' takes 'shall we?': 'Let us go to school, shall we?'
- Imperatives/Commands take 'will you?': 'Close the door, will you?'
- Negative words ('nobody', 'never', 'hardly', 'scarcely') take a POSITIVE tag: 'Nobody called, did they?' 'He never lies, does he?'`,
      source: 'ZIMSEC Grade 7 English Language Syllabus 7010',
      keywords: ['question tags', "aren't I", 'shall we', 'will you', 'grammar rules', 'primary english']
    },
    {
      id: 'g7_eng_paper2_letters_reports',
      level: 'Primary',
      subject: 'English',
      topic: 'Paper 2 Composition: Informal Letter, Formal Letter, and Report Layouts',
      content: `ZIMSEC Grade 7 English Paper 2 Composition Layouts:
1. Informal / Friendly Letter:
- Top right: Sender's address and date (e.g. Stand 45, Glen View 2, Harare / 24 October 2026).
- Left margin: Salutation (Dear Chipo,).
- Body: Paragraph 1 (greeting & reason), Paragraphs 2-3 (detailed news/event), Paragraph 4 (warm closing wishes).
- Sign-off: Your loving friend, / Your cousin, followed by First Name only (Tatenda).
2. Formal / Official Letter:
- Top right: Sender's address and date.
- Left margin: Recipient's Title and Full Address (e.g. The Headmaster, Goromonzi High School, P.O. Box 10, Goromonzi).
- Salutation: Dear Sir, / Dear Madam,.
- Subject Line: Capitalized and underlined (APPLICATION FOR A FORM ONE PLACE).
- Formal body: Polite, strictly factual, NO contractions (use 'do not', NOT 'don't').
- Sign-off: 'Yours faithfully,' (if recipient name unknown) or 'Yours sincerely,' (if named) + Signature + Full Name printed.
3. Report Writing:
- Title at the top: REPORT ON THE INTER-HOUSE ATHLETICS COMPETITIONS.
- Subheadings, factual tone, passive voice, conclusion, signed by Reporter with title and date.`,
      source: 'ZIMSEC Grade 7 English Language Syllabus 7010',
      keywords: ['composition', 'informal letter', 'formal letter', 'report writing', 'paper 2 english', 'friendly letter layout']
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
      id: 'g7_history_today_zig_republic',
      level: 'Primary',
      subject: 'Social Science',
      topic: 'Zimbabwe History to Today: Liberation, Unity Accord, Land Reform, and ZiG Currency',
      content: `Key historical milestones of Zimbabwe tested in Grade 7 Social Science:
1. The Liberation Struggle (First & Second Chimurenga):
   - First Chimurenga (1896-1897): Led by brave spirit mediums Mbuya Nehanda ("Mapfupa angu achamuka") and Sekuru Kaguvi against BSAC colonial rule.
   - Second Chimurenga (1966-1979): Began with the Battle of Chinhoyi on 28 April 1966. Heroic freedom fighters (ZANLA and ZIPRA) liberated the country.
   - Independence Day: Celebrated on 18 April 1980 at Rufaro Stadium.
2. Building the Nation:
   - Unity Accord: Signed on 22 December 1987 between Cde Robert Mugabe and Dr. Joshua Nkomo, celebrated every year as National Unity Day.
   - Third Chimurenga / Land Reform (2000): Returned land to the indigenous people through A1 (smallholder) and A2 (commercial) farming schemes.
3. Modern Zimbabwe & Second Republic:
   - Second Republic Vision 2030: Promoting infrastructure (roads, modern Beitbridge border post, dams like Lake Gwayi-Shangani), food security through Pfumvudza/Intwasa, and Heritage-Based Education 5.0.
   - Zimbabwe Gold (ZiG) Currency: Introduced in April 2024 by the Reserve Bank of Zimbabwe, fully backed by gold and foreign currency reserves to ensure economic stability.
   - 16 Official Languages: Recognized in the 2013 Constitution ensuring cultural equality for all.`,
      source: 'ZIMSEC Grade 7 Social Science Syllabus 7050',
      keywords: ['history of zimbabwe', 'chimurenga', 'nehanda', 'chinhoyi', 'unity accord', 'land reform', 'second republic', 'zig currency', 'social science']
    },
    {
      id: 'g7_history_bio_mugabe',
      level: 'Primary',
      subject: 'Social Science',
      topic: 'Cde Robert Gabriel Mugabe: Biography and Role in Zimbabwe History',
      content: `In Grade 7 Social Science, Cde Robert Gabriel Mugabe (1924–2019) is a major historical figure:
1. Who was Robert Mugabe?
   - The first Prime Minister of independent Zimbabwe (1980–1987) and first Executive President (1987–2017).
   - Born at Kutama Mission in Zvimba, Mashonaland West.
2. Liberation War Leader:
   - Co-founded ZANU in 1963.
   - Led the liberation movement and freedom fighters (ZANLA) from Mozambique during the Second Chimurenga.
   - Co-led the Patriotic Front delegation to the Lancaster House Conference in 1979, which brought national independence on 18 April 1980.
3. Major Achievements for Zimbabwe:
   - Universal Free Education: Built thousands of primary and secondary schools across rural Zimbabwe, creating the highest literacy rate in Africa (>90%).
   - Signed the historic Unity Accord on 22 December 1987 with Dr. Joshua Nkomo, uniting ZANU and PF-ZAPU into ZANU-PF and bringing national peace.
   - Land Reform (2000): Returned agricultural land to indigenous Zimbabwean families.
   - Declared a National Hero.`,
      source: 'ZIMSEC Grade 7 Social Science Syllabus 7050',
      keywords: ['mugabe', 'robert mugabe', 'cde mugabe', 'who is mugabe', 'who was mugabe', 'prime minister', 'president', 'social science']
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
      id: 'hist_zulu_shaka_mfecane',
      level: 'O-Level',
      subject: 'History',
      topic: 'The Zulu Kingdom under Shaka, Mfecane Wars, and King Mzilikazi Migration',
      content: `The Zulu Kingdom, Mfecane/Difaqane, and the Foundation of the Ndebele State (ZIMSEC History 2167/9155):
1. Rise of Shaka Zulu (1816–1828):
   - Transformed the small Zulu chiefdom into a mighty centralized empire in Nguniland.
   - Military Innovations: Short stabbing spear (iklwa), cow-horn encirclement formation (izimpondo), discarding sandals for speed, and permanent military regimental camps (amabutho).
2. The Mfecane / Difaqane (The Crushing / Scattering):
   - Widespread period of warfare, migration, and state reconstitution across Southern Africa in the 1820s.
   - Causes: Population pressure, competition for grazing and water, severe drought (Madlathule famine), and race to control Portuguese ivory trade at Delagoa Bay.
3. King Mzilikazi Khumalo and Ndebele Migration:
   - Mzilikazi, an outstanding general of Shaka, defied the Zulu King in 1822 over captured cattle.
   - Migrated northwards across the Highveld with his followers, assimilating Sotho and Tswana communities.
   - Established temporary bases at Ekupumuleni and Mosega before Boer conflicts pushed them across the Limpopo River (1838–1840).
   - Founded the Ndebele Kingdom in Matabeleland with headquarters at Gibixhegu (near Bulawayo).
4. Social Structure of the Ndebele State:
   - Zansi: Aristocratic class of original Nguni descent.
   - Enhla: Sotho and Tswana incorporated during migration.
   - Hole: Indigenous Kalanga and Shona communities assimilated in Zimbabwe.`,
      source: 'ZIMSEC History & Heritage Studies Syllabus 2167 / 9155',
      keywords: ['zulu', 'shaka', 'shaka zulu', 'mfecane', 'difaqane', 'mzilikazi', 'ndebele', 'zansi', 'enhla', 'hole', 'nguni', 'bulawayo', 'history']
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
    },
    {
      id: 'hist_bio_mugabe_seed',
      level: 'O-Level',
      subject: 'History',
      topic: 'Cde Robert Gabriel Mugabe: Biography, Liberation Struggle, Prime Minister, President, and Historical Legacy',
      content: `Cde Robert Gabriel Mugabe (21 February 1924 – 6 September 2019) was a founding father of Zimbabwe, co-founder of ZANU, first Prime Minister of Zimbabwe (1980–1987), and first Executive President (1987–2017).
1. Early Life & Political Rise:
   - Born at Kutama Mission in Zvimba; attended Kutama College and Fort Hare University (BA 1951). Taught in Ghana (1958–1960), heavily inspired by Kwame Nkrumah.
   - Publicity Secretary of NDP (1960), co-founder of ZAPU (1961), and co-founder/Secretary-General of ZANU in Highfield (August 1963).
2. Detention & Liberation Struggle (Second Chimurenga):
   - Detained for 10 years without trial by the Rhodesian regime (1964–1974); obtained multiple external law and economics degrees.
   - Crossed to Mozambique in 1975 with Edgar Tekere; endorsed by ZANLA commanders in the Mgagao Declaration (1975); confirmed ZANU President at Chimoio (1977).
   - Co-led the Patriotic Front alliance with Dr. Joshua Nkomo at Lancaster House (1979).
3. Post-Independence Leadership:
   - Won 1980 elections, sworn in as Prime Minister on 18 April 1980; announced the National Reconciliation policy ("turn swords into ploughshares").
   - Transformed education and healthcare, achieving Africa's highest literacy rate (>90%).
   - Signed the 22 December 1987 Unity Accord with Dr. Joshua Nkomo, becoming Executive President.
   - Launched the Third Chimurenga / Fast-Track Land Reform Programme in 2000 under A1 and A2 models.
   - Resigned November 2017 under Section 96 of the Constitution; declared a National Hero.`,
      source: 'ZIMSEC History Syllabus 2167 / 9155',
      keywords: ['mugabe', 'robert mugabe', 'cde mugabe', 'who is mugabe', 'who was mugabe', 'president mugabe', 'prime minister mugabe', 'zanu', 'zanla', 'history']
    },
    {
      id: 'hist_third_chimurenga_seed',
      level: 'O-Level',
      subject: 'History',
      topic: 'The Third Chimurenga: Fast-Track Land Reform Programme (FTLRP 2000)',
      content: `The Fast-Track Land Reform Programme (Third Chimurenga) was launched in 2000 to correct colonial land inequalities created by the Land Apportionment Act (1930):
1. Background and Catalysts:
   - Exhaustion of the Lancaster House 10-year willing-buyer willing-seller clause (1980-1990).
   - 1997 refusal of British Blair administration to fund land purchases.
   - Svosve and war-veteran farm occupations leading to constitutional amendment Section 16A.
2. Two Resettlement Models:
   - A1 Model (Smallholder/Villagized Scheme): Decongested rural communal areas, granting plots of 5-6 hectares for crop farming plus communal grazing. Over 160,000 households resettled.
   - A2 Model (Commercial Small-to-Medium Farming): Self-contained farming units designed for commercial agricultural production (tobacco, grain, livestock, horticulture).
3. International Geopolitical Impact:
   - Western sanctions: US Zimbabwe Democracy and Economic Recovery Act (ZDERA 2001) and EU restrictive measures.
4. Long-Term Agricultural Renaissance:
   - Historic records achieved in tobacco production (>290 million kg) and wheat self-sufficiency under indigenous farmers.`,
      source: 'ZIMSEC History Syllabus 2167 / 9155',
      keywords: ['third chimurenga', 'land reform', 'fast track land reform', 'a1 model', 'a2 model', 'zdera', 'land apportionment act', 'svosve', 'history']
    },
    {
      id: 'hist_unity_accord_seed',
      level: 'O-Level',
      subject: 'History',
      topic: 'The Unity Accord of 22 December 1987 and National Unity Day',
      content: `The historic Unity Accord was signed on 22 December 1987 between ZANU (led by Cde Robert Mugabe) and PF-ZAPU (led by Dr. Joshua Mqabuko Nkomo):
1. Historical Context:
   - Ended post-independence civil disturbances in Matabeleland and the Midlands provinces.
   - Preserved Zimbabwean sovereignty, territorial integrity, and national cohesion.
2. Key Provisions of the Accord:
   - Merger of ZANU and PF-ZAPU into one united political party: ZANU-PF.
   - Creation of the Executive Presidency with two Vice Presidents (Dr. Joshua Nkomo and Simon Muzenda).
   - Total integration of political and social structures.
3. Heritage Significance:
   - 22 December is commemorated annually as a national public holiday: National Unity Day, reinforcing the national motto "Unity, Peace, and Development".`,
      source: 'ZIMSEC History Syllabus 2167 / 9155',
      keywords: ['unity accord', '1987', 'joshua nkomo', 'robert mugabe', 'national unity day', 'zanu', 'zapu', 'history']
    },
    {
      id: 'hist_second_republic_zig_seed',
      level: 'O-Level',
      subject: 'History',
      topic: 'The Second Republic, Vision 2030, and the Zimbabwe Gold (ZiG) Currency (2024)',
      content: `The Second Republic, ushered in following Operation Restore Legacy in November 2017 under President Emmerson Dambudzo Mnangagwa:
1. Vision 2030 and NDS1:
   - National Development Strategy 1 (NDS1) aims for an Upper-Middle-Income Economy by 2030.
   - Core national philosophies: "Nyika inovakwa nevene vayo / Ilizwe lakhiwa ngabaninilo" (A nation is built by its own people) and "Leaving no one and no place behind".
2. Strategic Infrastructure & Agricultural Revolution:
   - Modernization of the Beitbridge Border Post and Harare-Beitbridge Highway.
   - Hwange Thermal Power Station Expansion (Units 7 & 8 adding 600 MW).
   - Lake Gwayi-Shangani Dam construction to solve Bulawayo water shortages.
   - Pfumvudza/Intwasa climate-proofed agriculture achieving national food security and record winter wheat harvest.
3. Zimbabwe Gold (ZiG) Currency (Introduced 5 April 2024):
   - Structured local currency backed by foreign exchange reserves and physical gold/precious minerals held by the Reserve Bank of Zimbabwe (RBZ).
   - Designed to eliminate currency volatility, anchor price stability, and restore faith in legal tender.
4. Education 5.0 and Heritage-Based Curriculum:
   - Shift from theoretical education to Teaching, Research, Community Service, Innovation, and Industrialization.`,
      source: 'ZIMSEC History & Heritage Studies 2167 / 9155',
      keywords: ['second republic', 'vision 2030', 'nds1', 'zig currency', 'zimbabwe gold', 'pfumvudza', 'education 5.0', 'nyika inovakwa nevene vayo', 'history']
    },
    {
      id: 'hist_constitution_2013_seed',
      level: 'O-Level',
      subject: 'History',
      topic: 'The 2013 Constitution and the 16 Officially Recognized Languages',
      content: `The Constitution of Zimbabwe was enacted on 22 May 2013 following a historic national referendum:
1. Constitutional Foundations:
   - Replaced the Lancaster House Constitution (1979) with a homegrown supreme legal charter.
   - Comprehensive Declaration of Rights (Chapter 4) enshrining civil, political, economic, social, and cultural rights.
2. The 16 Officially Recognized Languages (Section 6):
   - Chewa, Chibarwe, English, Kalanga, Koisan, Nambya, Ndau, Ndebele, Shangani, Shona, sign language, Sotho, Tonga, Tswana, Venda, and Xhosa.
   - State obligation to advance and promote the use of all indigenous languages in schools, courts, and government business.
3. National Institutions:
   - Independent Commissions Supporting Democracy: Zimbabwe Electoral Commission (ZEC), Zimbabwe Human Rights Commission (ZHRC), National Peace and Reconciliation Commission (NPRC), and Zimbabwe Gender Commission (ZGC).`,
      source: 'ZIMSEC History & Heritage Studies 2167 / 9155',
      keywords: ['constitution 2013', '16 languages', 'official languages', 'declaration of rights', 'referendum', 'history']
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
          'zimsec_history_heritage_comprehensive_archive.json',
          'zimsec_history_heritage_full_depth.json',
          'zimsec_primary_heritage_grade7.json',
          'zimsec_heritage_social_studies.json',
          'zimsec_heritage_studies_grade7_topics1-3.json',
          'zimsec_heritage_primary.json',
          'zimsec_grade7_frme.json',
          'zimsec_mathematics_grade7.json',
          'zimsec_primary_math_full_depth.json',
          'zimsec_science_technology_full_depth.json',
          'zimsec_grade_7_agriculture_full_expanded.json',
          'zimsec_agriculture_7grade.json',
          'zimsec_english_junior_grades_3to7.json',
          'zimsec_chishona_g7_full_notes.json',
          'zimsec_chishona_g7_studyguide.json',
          'zimsec_ndebele_grade7.json',
          'zimsec_primary_pe_grade7.json',
          'zimsec_ict_grade7.json'
        ];

        for (const fileName of primaryFiles) {
          try {
            const res = await fetch(`/assets/${encodeURIComponent(fileName)}`);
            if (res.ok) {
              const data = await res.json();
              this.extractChunksUniversal(
                data,
                'Agric, Science & Tech',
                'Primary',
                'ZIMSEC Grade 7 Primary Curriculum',
                fileName,
                seenIds
              );
            }
          } catch {
            // Skip if file missing
          }
        }

        // Fetch O-Level files
        const oLevelFiles = [
          { f: 'zimsec_history_heritage_comprehensive_archive.json', s: 'History' },
          { f: 'zimsec_history_heritage_full_depth.json', s: 'History' },
          { f: 'zimsec_history_olevel_paper1_topic1_precolonial_states.json', s: 'History' },
          { f: 'zimsec_history_olevel_paper1_topics2-7.json', s: 'History' },
          { f: 'zimsec_history_secondary.json', s: 'History' },
          { f: 'zimsec_mathematics_olevel.json', s: 'Mathematics' },
          { f: 'zimsec_combined_science_o_level_100k_detailed.json', s: 'Combined Science' },
          { f: 'zimsec_olevel_english_language.json', s: 'English Language' },
          { f: 'zimsec_shona_o_level_4007_study_pack.json', s: 'Shona' },
          { f: 'zimsec_geography_o_level_full_study_pack.json', s: 'Geography' },
          { f: 'zimsec_commerce_4049_o_level_FULL_DEPTH_FINAL.json', s: 'Commerce' },
          { f: 'zimsec_computer_science_4021_o_level_FULL_DEPTH_FINAL.json', s: 'Computer Science' },
          { f: 'zimsec_accounting_4051_o_level_final.json', s: 'Principles of Accounts' },
          { f: 'zimsec_agriculture_4001_o_level_full_study_pack.json', s: 'Agriculture' },
          { f: 'zimsec_biology_4025_o_level_full_study_pack.json', s: 'Biology' },
          { f: 'zimsec_chemistry_o_level_full_study_pack.json', s: 'Chemistry' },
          { f: 'zimsec_physics_4023_o_level_FULL_DEPTH_FINAL_310KB.json', s: 'Physics' },
          { f: 'zimsec_geography_secondary.json', s: 'Geography' },
          { f: 'zimsec_biology_v1.json', s: 'Biology' },
          { f: 'zimsec_physics_v1.json', s: 'Physics' },
          { f: 'zimsec_chemistry_v1.json', s: 'Chemistry' }
        ];

        for (const item of oLevelFiles) {
          try {
            const res = await fetch(`/assets/${encodeURIComponent(item.f)}`);
            if (res.ok) {
              const data = await res.json();
              this.extractChunksUniversal(
                data,
                item.s,
                'O-Level',
                'ZIMSEC O-Level Curriculum',
                item.f,
                seenIds
              );
            }
          } catch {
            // Skip if missing
          }
        }

        // Fetch A-Level files
        const aLevelFiles = [
          { f: 'zimsec_history_heritage_comprehensive_archive.json', s: 'History' },
          { f: 'zimsec_history_heritage_full_depth.json', s: 'History' },
          { f: 'zimsec_a_level_pure_mathematics_6042_full_final.json', s: 'Pure Mathematics' },
          { f: 'zimsec_a_level_biology_full_final.json', s: 'Biology' },
          { f: 'zimsec_a_level_history_9155_extensive_study_pack.json', s: 'History' },
          { f: 'zimsec_a_level_geography_full_syllabus.json', s: 'Geography' },
          { f: 'zimsec_a_level_english_literature_9153_full_expanded.json', s: 'Literature in English' },
          { f: 'zimsec_a_level_divinity_full_syllabus.json', s: 'Divinity' },
          { f: 'zimsec_a_level_shona_9145_full_expanded.json', s: 'Shona' },
          { f: 'zimsec_accounting_a_level_2024_2030_expanded.json', s: 'Accounting' },
          { f: 'zimsec_business_studies_a_level_2024_2030_expanded.json', s: 'Business Studies' },
          { f: 'zimsec_chemistry_a_level_full.json', s: 'Chemistry' },
          { f: 'zimsec_economics_a_level_2024_2030_expanded.json', s: 'Economics' },
          { f: 'zimsec_physics_a_level_2024_2030_expanded.json', s: 'Physics' },
          { f: 'zimsec_statistics_a_level_6046_study_pack.json', s: 'Statistics' }
        ];

        for (const item of aLevelFiles) {
          try {
            const res = await fetch(`/assets/${encodeURIComponent(item.f)}`);
            if (res.ok) {
              const data = await res.json();
              this.extractChunksUniversal(
                data,
                item.s,
                'A-Level',
                'ZIMSEC Advanced Level Curriculum',
                item.f,
                seenIds
              );
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
   * Universal chunk extractor that handles arrays, object chunks, and hierarchical form/term/topic/subtopic structures.
   */
  private static extractChunksUniversal(
    data: any,
    defaultSubject: string,
    defaultLevel: string,
    defaultSource: string,
    fileName: string,
    seenIds: Set<string>
  ): void {
    if (!data) return;

    // Case 1: Direct array of chunks
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item && item.topic && item.content) {
          const uniqueId = item.id ? `${fileName}_${item.id}` : `${fileName}_${i}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            const levelSubject = defaultLevel === 'Primary'
              ? this.standardizePrimarySubject(item.subject || defaultSubject)
              : (item.subject || defaultSubject);
            this.chunks.push({
              id: uniqueId,
              level: defaultLevel,
              subject: levelSubject,
              topic: item.topic,
              content: item.content,
              source: item.source || defaultSource,
              keywords: Array.isArray(item.keywords)
                ? item.keywords.map((k: string) => String(k).toLowerCase())
                : [item.topic.toLowerCase(), levelSubject.toLowerCase()]
            });
          }
        }
      }
      return;
    }

    // Case 2: Object with chunks array
    if (Array.isArray(data.chunks)) {
      this.extractChunksUniversal(data.chunks, defaultSubject, defaultLevel, defaultSource, fileName, seenIds);
      return;
    }

    // Case 3: Object with nested structure array (Form -> Terms -> Topics -> Subtopics)
    if (Array.isArray(data.structure)) {
      let counter = 0;
      const processTopics = (topics: any[], prefix = '') => {
        if (!Array.isArray(topics)) return;
        for (const t of topics) {
          const topicTitle = t.title || t.topic || prefix;
          if (t.content && typeof t.content === 'string' && t.content.trim()) {
            const uniqueId = `${fileName}_struct_${counter++}`;
            if (!seenIds.has(uniqueId)) {
              seenIds.add(uniqueId);
              this.chunks.push({
                id: uniqueId,
                level: defaultLevel,
                subject: defaultSubject,
                topic: topicTitle,
                content: t.content,
                source: defaultSource,
                keywords: [topicTitle.toLowerCase(), defaultSubject.toLowerCase()]
              });
            }
          }
          if (Array.isArray(t.subtopics)) {
            for (const sub of t.subtopics) {
              const subTitle = sub.title || sub.subtopic || topicTitle;
              const fullTitle = `${topicTitle}: ${subTitle}`;
              let subContent = sub.content || '';
              if (Array.isArray(sub.key_terms) && sub.key_terms.length > 0) {
                subContent += '\n\nKey Terms:\n' + sub.key_terms.map((kt: any) =>
                  typeof kt === 'object' && kt.term ? `- **${kt.term}:** ${kt.definition || ''}` : `- ${kt}`
                ).join('\n');
              }
              if (subContent.trim()) {
                const uniqueId = `${fileName}_struct_${counter++}`;
                if (!seenIds.has(uniqueId)) {
                  seenIds.add(uniqueId);
                  this.chunks.push({
                    id: uniqueId,
                    level: defaultLevel,
                    subject: defaultSubject,
                    topic: fullTitle,
                    content: subContent,
                    source: defaultSource,
                    keywords: [
                      fullTitle.toLowerCase(),
                      topicTitle.toLowerCase(),
                      subTitle.toLowerCase(),
                      defaultSubject.toLowerCase()
                    ]
                  });
                }
              }
            }
          }
        }
      };

      for (const item of data.structure) {
        if (Array.isArray(item.topics)) {
          processTopics(item.topics);
        }
        if (Array.isArray(item.terms)) {
          for (const term of item.terms) {
            if (Array.isArray(term.topics)) {
              processTopics(term.topics);
            }
          }
        }
      }
    }
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

    // Extract preferred subject prefix if present (e.g. "Combined Science: Explain...")
    let preferredSubject = '';
    let coreQuery = query.trim();
    const prefixMatch = coreQuery.match(/^([A-Za-z0-9,\s&–-]+):\s*(.+)$/);
    if (prefixMatch && prefixMatch[1].length < 35) {
      preferredSubject = prefixMatch[1].trim().toLowerCase();
      coreQuery = prefixMatch[2].trim();
    }

    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
      'the', 'and', 'for', 'with', 'from', 'that', 'this', 'these', 'those', 'is', 'are', 'in', 'of',
      'explain', 'describe', 'discuss', 'state', 'identify', 'name', 'outline', 'detail', 'solve',
      'calculate', 'using', 'between', 'give', 'list', 'show', 'acts', 'much', 'about', 'your'
    ]);

    const words = coreQuery
      .toLowerCase()
      .split(/[^a-zA-Z0-9]+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const effectiveWords = words.length > 0
      ? words
      : coreQuery.toLowerCase().split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 2);

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

    const qLower = coreQuery.toLowerCase();
    const isPersonQuery = qLower.includes('who') || qLower.includes('biography') || qLower.includes('profile') || qLower.includes('about');

    for (const chunk of candidates) {
      let score = 0;
      const matchedWords = new Set<string>();
      const topicLower = chunk.topic.toLowerCase();
      const subjectLower = chunk.subject.toLowerCase();
      const contentLower = chunk.content.toLowerCase();
      const kwLower = chunk.keywords.map((k) => k.toLowerCase());

      // Subject preference boost if prefix was provided
      if (preferredSubject && (subjectLower.includes(preferredSubject) || preferredSubject.includes(subjectLower))) {
        score += 60;
      }

      // Demote generic syllabus scope and meta overviews so specific factual topics win
      if (topicLower.includes('syllabus scope') || topicLower.includes('study guide') || topicLower.includes('scheme of work')) {
        score -= 150;
      }

      for (const word of effectiveWords) {
        const stemmed = this.stem(word);
        let wordMatched = false;

        // Direct topic match is the highest relevance signal
        if (topicLower.includes(word) || topicLower.includes(stemmed)) {
          score += 140;
          wordMatched = true;
          if (topicLower.startsWith(word) || topicLower.endsWith(word)) score += 30;
        }
        if (kwLower.some((k) => k === word || (word.length >= 4 && k.includes(word)))) {
          score += 60;
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

      // Exact biographical query boost for historical and national figures
      if (isPersonQuery && (topicLower.includes('biography') || topicLower.includes('profile') || topicLower.includes('cde ') || topicLower.includes('king '))) {
        for (const word of effectiveWords) {
          if (topicLower.includes(word)) {
            score += 150;
          }
        }
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
