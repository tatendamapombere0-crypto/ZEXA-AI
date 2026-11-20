import type { ExamManifestItem, ExamPaper } from '../types';

export interface BotswanaHighYieldItem {
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

export const BOTSWANA_EXAM_PAPERS: ExamPaper[] = [
  {
    id: 'bw_psle_social_studies_p1',
    subject: 'Social Studies',
    level: 'Primary',
    paperCode: 'BEC-PSLE-SS1',
    paperName: 'BEC PSLE Social Studies Mock Paper 1',
    paperType: 'Paper 1 (Multiple Choice)',
    sourceFile: 'bw_psle_social_studies_p1.json',
    questions: [
      {
        id: 'bw_psle_ss_1',
        questionNumber: 1,
        questionText: 'Which three Batswana Dikgosi travelled to London in 1895 to protest against BSAC rule over Bechuanaland?',
        options: [
          { letter: 'A', text: 'Sechele I, Moshoeshoe I, and Lobengula' },
          { letter: 'B', text: 'Khama III, Sebele I, and Bathoen I' },
          { letter: 'C', text: 'Seretse Khama, Tshekedi Khama, and Ketumile Masire' },
          { letter: 'D', text: 'Moremi II, Linchwe I, and Montshiwa' }
        ],
        correctAnswer: 'B',
        explanation: 'Kgosi Khama III (Bangwato), Kgosi Sebele I (Bakwena), and Kgosi Bathoen I (Bangwaketse) travelled to England in 1895 and successfully persuaded the British government not to hand Bechuanaland to Cecil Rhodes’ British South Africa Company (BSAC).',
        answerConfidence: 'high'
      },
      {
        id: 'bw_psle_ss_2',
        questionNumber: 2,
        questionText: 'On Botswana’s national flag, what do the sky-blue bands represent?',
        options: [
          { letter: 'A', text: 'Diamond deposits in the Kalahari' },
          { letter: 'B', text: 'Racial harmony between black and white citizens' },
          { letter: 'C', text: 'Water and rain (Pula), which sustain life' },
          { letter: 'D', text: 'Wildlife conservation in Chobe National Park' }
        ],
        correctAnswer: 'C',
        explanation: 'The wide sky-blue stripes represent rain (Pula) and water—precious life-giving resources reflected in Botswana’s national motto "Pula!"',
        answerConfidence: 'high'
      },
      {
        id: 'bw_psle_ss_3',
        questionNumber: 3,
        questionText: 'Who composed Botswana’s national anthem "Fatshe leno la rona"?',
        options: [
          { letter: 'A', text: 'Sir Seretse Khama' },
          { letter: 'B', text: 'Dr Kgalemang Tumediso Motsete' },
          { letter: 'C', text: 'Philip Matante' },
          { letter: 'D', text: 'Dr Quett Masire' }
        ],
        correctAnswer: 'B',
        explanation: 'Educator, composer, and nationalist Dr Kgalemang Tumediso Motsete wrote both the lyrics and music of "Fatshe leno la rona".',
        answerConfidence: 'high'
      },
      {
        id: 'bw_psle_ss_4',
        questionNumber: 4,
        questionText: 'Which district in Botswana contains the Okavango Delta and Tsodilo Hills?',
        options: [
          { letter: 'A', text: 'Central District' },
          { letter: 'B', text: 'Kgalagadi District' },
          { letter: 'C', text: 'North-West (Ngamiland) District' },
          { letter: 'D', text: 'Kgatleng District' }
        ],
        correctAnswer: 'C',
        explanation: 'Both the Okavango Delta and Tsodilo Hills UNESCO World Heritage Site lie in North-West (Ngamiland) District, whose headquarters is Maun.',
        answerConfidence: 'high'
      },
      {
        id: 'bw_psle_ss_5',
        questionNumber: 5,
        questionText: 'On what exact date did Bechuanaland attain independence as the Republic of Botswana?',
        options: [
          { letter: 'A', text: '18 April 1980' },
          { letter: 'B', text: '1 July 1966' },
          { letter: 'C', text: '30 September 1966' },
          { letter: 'D', text: '24 October 1964' }
        ],
        correctAnswer: 'C',
        explanation: 'Botswana became an independent republic on 30 September 1966 under its first President, Sir Seretse Khama.',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_psle_setswana_p1',
    subject: 'Setswana',
    level: 'Primary',
    paperCode: 'BEC-PSLE-SET1',
    paperName: 'BEC PSLE Setswana Puo le Diane Paper 1',
    paperType: 'Paper 1 (Language & Proverbs)',
    sourceFile: 'bw_psle_setswana_p1.json',
    questions: [
      {
        id: 'bw_psle_set_1',
        questionNumber: 1,
        questionText: 'Seane se se reng "Motho ke motho ka batho" se raya eng?',
        options: [
          { letter: 'A', text: 'Motho o tshwanetse go tshela a le nosi' },
          { letter: 'B', text: 'Botho le tirisano-mmogo le batho ba bangwe ke tsone di agang motho' },
          { letter: 'C', text: 'Batho ba ba nang le dikgomo ke bone fela ba botlhokwa' },
          { letter: 'D', text: 'Ga go tlhokafale go reetsa bagolo mo motseng' }
        ],
        correctAnswer: 'B',
        explanation: '"Motho ke motho ka batho" ke thito ya Botho: motho ga a kake a atlega kwa ntle ga kemo-nokeng, tlotlo le tirisano-mmogo ya setšhaba.',
        answerConfidence: 'high'
      },
      {
        id: 'bw_psle_set_2',
        questionNumber: 2,
        questionText: 'Feleletsa seane: "Moroto wa o esi..."',
        options: [
          { letter: 'A', text: 'ga o ele' },
          { letter: 'B', text: 'o a fisa' },
          { letter: 'C', text: 'ga o tshabe pula' },
          { letter: 'D', text: 'o thuba nkgwana' }
        ],
        correctAnswer: 'A',
        explanation: 'Seane sa Setswana ke "Moroto wa o esi ga o ele" — se ruta gore tiro e e dirwang ka bongwe e na le bokgoni jo bo lekanyeditsweng, fa tirisano-mmogo e tlisa phenyo.',
        answerConfidence: 'high'
      },
      {
        id: 'bw_psle_set_3',
        questionNumber: 3,
        questionText: 'Bontsi jwa leina "lefatshe" ke eng?',
        options: [
          { letter: 'A', text: 'bafatshe' },
          { letter: 'B', text: 'difatshe' },
          { letter: 'C', text: 'mafatshe' },
          { letter: 'D', text: 'mefatshe' }
        ],
        correctAnswer: 'C',
        explanation: 'Mo setlhopheng sa maina sa le-/ma-, bongwe ke "lefatshe" mme bontsi ke "mafatshe" (fela jaaka lerotse -> marotse).',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_jce_moral_education_p1',
    subject: 'Moral Education',
    level: 'O-Level',
    paperCode: 'BEC-JCE-ME1',
    paperName: 'BEC JCE Moral Education Paper 1',
    paperType: 'Paper 1 (Values & Ethics)',
    sourceFile: 'bw_jce_moral_education_p1.json',
    questions: [
      {
        id: 'bw_jce_me_1',
        questionNumber: 1,
        questionText: 'Which traditional Batswana practice promotes economic mutual help by lending cattle to a poorer relative for milk and breeding?',
        options: [
          { letter: 'A', text: 'Bogadi' },
          { letter: 'B', text: 'Mafisa' },
          { letter: 'C', text: 'Mogoga' },
          { letter: 'D', text: 'Dikhwaere' }
        ],
        correctAnswer: 'B',
        explanation: 'Mafisa is the traditional cattle-loaning custom where wealthy cattle owners entrust livestock to less-privileged community members, providing them with milk, draught power, and calves to build self-reliance.',
        answerConfidence: 'high'
      },
      {
        id: 'bw_jce_me_2',
        questionNumber: 2,
        questionText: 'What is the FIRST logical step in systematic ethical decision-making?',
        options: [
          { letter: 'A', text: 'Ignore the consequences of your choice' },
          { letter: 'B', text: 'Clearly identify and define the moral problem' },
          { letter: 'C', text: 'Blame peer pressure for any outcome' },
          { letter: 'D', text: 'Act impulsively before gathering facts' }
        ],
        correctAnswer: 'B',
        explanation: 'Effective moral decision-making starts by identifying the ethical issue, then gathering facts, evaluating alternatives against Botho/moral principles, choosing responsibly, and reflecting on consequences.',
        answerConfidence: 'high'
      },
      {
        id: 'bw_jce_me_3',
        questionNumber: 3,
        questionText: 'Why is the Kgotla considered a vital pillar of Botho and democracy in Botswana?',
        options: [
          { letter: 'A', text: 'Only the Kgosi is permitted to speak during meetings' },
          { letter: 'B', text: 'Every citizen has the right to express views peacefully and hold leaders accountable' },
          { letter: 'C', text: 'It replaces Botswana’s High Court and Court of Appeal' },
          { letter: 'D', text: 'It excludes women and youth from attending public consultations' }
        ],
        correctAnswer: 'B',
        explanation: 'Captured in "Mafoko a kgotla a mantle otlhe", the Kgotla promotes inclusive dialogue, consensus building, and respect for human dignity.',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_jce_social_studies_p2',
    subject: 'Social Studies',
    level: 'O-Level',
    paperCode: 'BEC-JCE-SS2',
    paperName: 'BEC JCE Social Studies Structured Paper 2',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'bw_jce_social_studies_p2.json',
    questions: [
      {
        id: 'bw_jce_ss2_1',
        questionNumber: 1,
        questionText: '(a) Explain three reasons why the Three Dikgosi (Khama III, Sebele I, Bathoen I) travelled to England in 1895.\n(b) State two outcomes of their visit that shaped modern Botswana. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC JCE Social Studies Marking Guide [10 Marks]

#### (a) Reasons for the 1895 London Mission [6 Marks — 2 marks per explained point]:
- **Prevent BSAC Annexation:** Britain planned to transfer Bechuanaland Protectorate to Cecil Rhodes’ British South Africa Company (BSAC), which had seized land in Rhodesia.
- **Protect Batswana Land & Bogosi:** The Dikgosi feared loss of communal grazing/arable lands and erosion of traditional chieftainship rights.
- **Ban Liquor Trade:** They sought strict prohibition of European alcohol within tribal territories.

#### (b) Key Outcomes [4 Marks — 2 marks per point]:
- **Crown Protection Preserved:** Colonial Secretary Joseph Chamberlain agreed tribal lands of the three Dikgosi would remain directly under the British Crown rather than BSAC rule.
- **Railway Strip Ceded:** In return, the Dikgosi granted a narrow eastern strip of land (Lobatse/Gaborone blocks) for building the Mafikeng–Bulawayo railway.`,
        answerConfidence: 'high'
      },
      {
        id: 'bw_jce_ss2_2',
        questionNumber: 2,
        questionText: 'Describe three ways the Botswana Meat Commission (BMC) and veterinary cordon fences protect Botswana’s beef export economy. [6 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC JCE Social Studies Marking Guide [6 Marks]
1. **Disease Segregation (FMD Control):** Veterinary cordon fences separate livestock grazing zones from wild buffalo herds carrying Foot-and-Mouth Disease (FMD), keeping export zones certified disease-free.
2. **Traceability (BAITS System):** Mandatory ear-tagging records farm origin, movement history, and vaccination compliance required by strict European Union / UK buyers.
3. **Centralised Processing & Quality Grading:** BMC abattoirs in Lobatse, Francistown, and Maun inspect hygiene and grade carcasses for reliable foreign exchange revenue.`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_bgcse_development_studies_p2',
    subject: 'Development Studies',
    level: 'A-Level',
    paperCode: 'BEC-BGCSE-0595/2',
    paperName: 'BEC BGCSE Development Studies Paper 2 (0595/2)',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'bw_bgcse_development_studies_p2.json',
    questions: [
      {
        id: 'bw_bgcse_ds_1',
        questionNumber: 1,
        questionText: '(a) Distinguish between Gross National Product (GNP) per capita and the Human Development Index (HDI) as measures of development.\n(b) Explain three strategies Botswana is implementing under Vision 2036 to diversify its economy away from diamond mining. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC BGCSE Development Studies (0595) Marking Scheme [10 Marks]

#### (a) GNP per capita vs HDI [4 Marks]:
- **GNP per capita** measures average total income earned by citizens per person per year; it omits income inequality, informal sector activity, and social welfare.
- **Human Development Index (HDI)** is a composite index combining **health (life expectancy at birth)**, **education (mean/expected years of schooling)**, and **standard of living (GNI per capita PPP)**.

#### (b) Botswana Economic Diversification Strategies [6 Marks — 2 marks per developed strategy]:
- **Diamond Value Addition (Beneficiation):** Sorting, cutting, and polishing rough diamonds locally in Gaborone (DTCB & Okavango Diamond Company) rather than exporting raw stones alone.
- **Eco-Tourism Development:** Expanding Botswana's High-Value, Low-Volume tourism industry in the Okavango Delta, Chobe, and Kalahari to generate sustainable foreign exchange and rural employment.
- **Citizen Enterprise & Agro-Processing:** Financing citizen-owned SMEs, horticulture, renewable solar energy, and financial/ICT hubs through CEDA, LEA, and Special Economic Zones (SEZA).`,
        answerConfidence: 'high'
      },
      {
        id: 'bw_bgcse_ds_2',
        questionNumber: 2,
        questionText: 'Evaluate two advantages and two challenges of Botswana’s membership in the Southern African Customs Union (SACU) and SADC. [8 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC BGCSE Development Studies Marking Scheme [8 Marks]

#### Advantages [4 Marks]:
- **Customs Revenue Share:** SACU pooled tariff receipts provide a vital fiscal revenue stream funding schools, roads, and health clinics.
- **Expanded Duty-Free Market & Infrastructure:** Duty-free movement of goods across Southern Africa plus SADC regional corridors (Trans-Kalahari Highway & Kazungula Bridge) lower trade costs for landlocked Botswana.

#### Challenges [4 Marks]:
- **Competition from Larger Industrial Economies:** Duty-free imports from South African manufacturers make infant local factories in Botswana harder to protect.
- **Revenue Volatility:** Fluctuations in regional import volumes directly cause unstable annual SACU treasury transfers.`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_bgcse_geography_p2',
    subject: 'Geography',
    level: 'A-Level',
    paperCode: 'BEC-BGCSE-0584/2',
    paperName: 'BEC BGCSE Geography Paper 2 (0584/2)',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'bw_bgcse_geography_p2.json',
    questions: [
      {
        id: 'bw_bgcse_geo_1',
        questionNumber: 1,
        questionText: '(a) Explain why the Okavango Delta reaches peak flood levels in Botswana during the dry winter months (June–August).\n(b) Outline three economic and ecological benefits of the Okavango Delta to Botswana. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC BGCSE Geography (0584) Marking Scheme [10 Marks]

#### (a) Winter Peak Flooding Mechanism [4 Marks]:
- Rain falls heavily in the catchment highlands of central **Angola** during summer (January–February).
- Runoff flows over **1,000 km** down the Cuito and Cubango rivers across extremely gentle alluvial gradients inside a fault-bounded graben.
- Because the gradient is very flat and dense papyrus vegetation slows flow, the flood wave takes **4 to 6 months** to arrive at Maun and spread across the delta fan in **June–August**.

#### (b) Benefits [6 Marks]:
- **High-Value Eco-Tourism:** Supports lodges, mokoro polers, guides, and CBNRM community trusts, generating major foreign exchange.
- **Biodiversity Conservation:** UNESCO World Heritage wetland harbouring sitatunga, hippopotamus, elephants, fish eagles, and papyrus reeds.
- **Local Livelihoods & Water Supply:** Provides fish, molapo flood-recession farming moisture, reeds for building/thatching, and groundwater recharge.`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_bgcse_history_p1',
    subject: 'History',
    level: 'A-Level',
    paperCode: 'BEC-BGCSE-0583/1',
    paperName: 'BEC BGCSE History Paper 1 (0583/1)',
    paperType: 'Paper 1 (Structured Source & Essay)',
    sourceFile: 'bw_bgcse_history_p1.json',
    questions: [
      {
        id: 'bw_bgcse_hist_1',
        questionNumber: 1,
        questionText: 'Examine why the 1948–1956 exile of Seretse Khama strengthened nationalist politics in the Bechuanaland Protectorate. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC BGCSE History (0583) Marking Guide [10 Marks]
- **British Appeasement of Apartheid South Africa:** Britain’s decision to ban Seretse Khama from the Bangwato bogosi following his marriage to Ruth Williams exposed colonial subservience to Pretoria’s racial policies.
- **Politicisation at Kgotla Assemblies:** Heated kgotla debates in Serowe united Bangwato and broader Batswana opinion against arbitrary colonial decrees.
- **Rise of Modern Political Parties:** Returning in 1956 as a private citizen, Seretse Khama’s immense popular legitimacy later anchored the founding of the **BDP (1962)** alongside **BPP (1960)** and **BNF (1965)**, accelerating peaceful independence in **1966**.`,
        answerConfidence: 'high'
      }
    ]
  }
];

export const BOTSWANA_EXAM_MANIFEST: ExamManifestItem[] = BOTSWANA_EXAM_PAPERS.map((p) => ({
  id: p.id,
  subject: p.subject,
  level: p.level,
  paperCode: p.paperCode || '',
  paperName: p.paperName,
  paperType: p.paperType || 'Practice Paper',
  file: p.sourceFile,
  questionCount: p.questions.length,
  sourceFormat: 'BEC Botswana Exam Bank'
}));

export const BOTSWANA_HIGH_YIELD_ITEMS: BotswanaHighYieldItem[] = [
  {
    q: 'Why did the Three Dikgosi travel to London in 1895?',
    a: `#### 1. Background Threat (1895)
Colonial Secretary Joseph Chamberlain planned to transfer administrative control of the Bechuanaland Protectorate to Cecil John Rhodes’ British South Africa Company (BSAC).

#### 2. Key Dikgosi Involved
- **Kgosi Khama III** (Bangwato)
- **Kgosi Sebele I** (Bakwena)
- **Kgosi Bathoen I** (Bangwaketse)

#### 3. Outcome & Significance [BEC History / Social Studies]
- Britain agreed to keep the three Dikgosi's territories directly under the British Crown rather than handing them to Rhodes' BSAC.
- Only a narrow eastern railway strip was ceded for the Mafikeng–Bulawayo railway line, safeguarding Botswana’s core communal land and paving the way to 1966 independence.`,
    s: 'History',
    l: 'O-Level',
    p: 'BEC JCE / BGCSE History',
    c: 'BEC-0583',
    f: 'bw_exam_bank',
    topic: 'Three Dikgosi 1895'
  },
  {
    q: 'Distinguish between GNP per capita and HDI and explain how Botswana diversifies away from diamonds under Vision 2036',
    a: `#### 1. Measuring Development (GNP vs HDI)
- **GNP per capita** measures average national income per citizen; it hides income inequality and non-monetary social conditions.
- **Human Development Index (HDI)** combines **Life Expectancy**, **Education Years**, and **GNI per capita (PPP)**.

#### 2. Botswana Economic Diversification (Vision 2036)
- **Diamond Beneficiation:** Sorting, cutting, and polishing rough diamonds locally (Okavango Diamond Company & DTCB).
- **Eco-Tourism:** High-value, low-volume wilderness tourism in Okavango Delta and Chobe.
- **Beef, Coal, Copper & Solar:** Expanding BMC export quality, Morupule/solar power, Kalahari Copperbelt, and citizen SMEs (CEDA/LEA).`,
    s: 'Development Studies',
    l: 'A-Level',
    p: 'BEC BGCSE Development Studies 0595',
    c: 'BEC-0595/2',
    f: 'bw_exam_bank',
    topic: 'Development Studies Diversification'
  },
  {
    q: 'Why does the Okavango Delta reach peak flooding during Botswana’s dry winter months?',
    a: `#### Hydrological Mechanism [BEC BGCSE Geography 0584]
1. Heavy summer rain falls in the **Angolan Highlands** between January and February.
2. Water flows southwards over 1,000 km along the Cubango/Okavango River onto a very flat fault-bounded alluvial fan in northern Botswana.
3. Dense aquatic vegetation (*papyrus*) and gentle gradients delay the flood wave by 4–6 months so peak flooding arrives in **June–August** during Botswana’s dry winter.`,
    s: 'Geography',
    l: 'A-Level',
    p: 'BEC BGCSE Geography 0584',
    c: 'BEC-0584/2',
    f: 'bw_exam_bank',
    topic: 'Okavango Delta Hydrology'
  },
  {
    q: 'Explain the role of veterinary cordon fences and BMC in Botswana’s beef industry',
    a: `#### Livestock & Export Protection [BEC Agriculture / Social Studies]
- **Veterinary Cordon Fences:** Physically isolate wild Cape buffalo herds (carriers of Foot-and-Mouth Disease) from commercial beef zones.
- **BAITS Traceability:** Mandatory animal ear-tagging tracks cattle origin and vaccinations to satisfy strict European Union / UK standards.
- **Botswana Meat Commission (BMC):** Operates export abattoirs at Lobatse, Francistown, and Maun ensuring international food-safety compliance.`,
    s: 'Agriculture',
    l: 'O-Level',
    p: 'BEC JCE / BGCSE Agriculture',
    c: 'BEC-0599',
    f: 'bw_exam_bank',
    topic: 'BMC and FMD Control'
  }
];
