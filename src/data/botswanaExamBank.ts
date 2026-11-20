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
    id: 'bw_psle_social_studies_p2',
    subject: 'Social Studies',
    level: 'Primary',
    paperCode: 'BEC-PSLE-SS2',
    paperName: 'BEC PSLE Social Studies Structured Paper 2',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'bw_psle_social_studies_p2.json',
    questions: [
      {
        id: 'bw_psle_ss2_1',
        questionNumber: 1,
        questionText: '(a) Explain why the Bangwato, Bakwena, and Bangwaketse Dikgosi travelled to England in 1895.\n(b) Describe how the Kgotla helps Batswana communities solve problems democratically today. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC PSLE Social Studies Marking Guide [10 Marks]

In August 1895, **Kgosi Khama III** of the Bangwato, **Kgosi Sebele I** of the Bakwena, and **Kgosi Bathoen I** of the Bangwaketse travelled across the Atlantic Ocean to London to petition Queen Victoria’s Colonial Secretary, Joseph Chamberlain, against handing the Bechuanaland Protectorate over to Cecil John Rhodes’ **British South Africa Company (BSAC)** [2 marks]. Having witnessed how the BSAC violently seized Ndebele and Shona lands in neighbouring Southern Rhodesia, the Three Dikgosi feared that company rule would strip Batswana farmers of their ancestral grazing veld, abolish bogosi (traditional chieftaincy), and expose local villages to unregulated European liquor traders [2 marks]. Aided by missionary allies such as W.C. Willoughby and British public sympathy, they won an historic agreement keeping their territories directly under British Crown protection in exchange for a narrow eastern railway strip used for the Mafikeng–Bulawayo railway line [2 marks].

Their courageous diplomacy in 1895 laid the constitutional bedrock for Botswana’s peaceful emergence as a self-governing republic on 30 September 1966 under Sir Seretse Khama, because the protectorate retained indigenous land tenure rather than becoming a settler colony dominated by mining monopolies [2 marks]. In the modern Republic of Botswana, that heritage of participatory governance lives on inside the **Kgotla**, the traditional public assembly arena found at the centre of every ward and village, where the Kgosi presides alongside elders and ordinary residents regardless of social standing [1 mark]. Guided by the Setswana proverb *"Mafoko a kgotla a mantle otlhe"* (every voice spoken at the Kgotla is respected), adult citizens debate community projects, raise grievances with cabinet ministers or councillors, settle minor customary disputes amicably, and uphold transparency before policies are implemented [1 mark].

When answering PSLE Paper 2 questions on Botswana’s constitutional heritage, always link historic dates and named Dikgosi to concrete outcomes rather than writing vague summaries [Total: 10 marks]. Examiners reward pupils who connect the 1895 London Mission directly to the preservation of tribal land and who clearly contrast *Botho*-based consensus dialogue at the Kgotla with top-down authoritarian rule. Remember to name at least two specific outcomes (Crown protection plus restriction of the BSAC to the railway strip) and explain how modern district councils and members of parliament continue to consult villages at Kgotla meetings before rolling out Vision 2036 development programmes.`,
        answerConfidence: 'high'
      },
      {
        id: 'bw_psle_ss2_2',
        questionNumber: 2,
        questionText: 'Explain three ways the Kalahari Desert environment influences human settlement patterns and economic activities in Botswana. [6 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC PSLE Social Studies Marking Guide [6 Marks]

Roughly eighty percent of Botswana’s surface area lies within the sandy Kalahari Basin, whose semi-arid to arid climate features low, unreliable summer convectional rainfall (often below 250–400 mm per year in western Kgalagadi and Ghanzi) and high daytime evaporation rates [2 marks]. Because permanent surface rivers are absent across the central plateau, Botswana’s human population is heavily concentrated along the more humid **eastern hardveld** corridor stretching from Lobatse and Gaborone northwards through Mahalapye, Palapye, Serowe, and Francistown, where deeper loamy soils, the Limpopo basin tributaries, the North-South Carrier water pipeline, and railway connections sustain arable crop farming and urban industry [2 marks]. In contrast, western Kalahari settlements such as Tsabong, Hukuntsi, and Kang remain relatively small, dispersed, and clustered strictly around deep subterranean boreholes drilled into underground aquifers [2 marks].

Despite aridity, communities across the Kalahari Basin have adapted their economic livelihoods creatively to match water availability and open savannah grassveld [1 mark]. Extensive commercial and communal **cattle ranching** thrives in Ghanzi, Letlhakeng, and parts of Central District because drought-hardy grass species nourish Botswana’s beef herds destined for Botswana Meat Commission (BMC) abattoirs [1 mark]. Meanwhile, beneath the Kalahari sands at **Orapa, Jwaneng, Letlhakane, and Karowe**, rich kimberlite pipes form the backbone of Botswana’s world-leading diamond mining sector, while **wilderness eco-tourism** in the Central Kalahari Game Reserve and Makgadikgadi Pans earns vital foreign exchange and creates guiding, craft, and hospitality jobs for local trusts [1 mark].

To secure full marks on geography-linked PSLE questions, weave physical rainfall and borehole facts together with clear named examples of towns, districts, and economic sectors rather than merely stating that "the desert is dry." Mentioning the contrast between the densely populated eastern hardveld and sparsely populated western sandveld demonstrates top-band analytical understanding to BEC markers [Total: 6 marks].`,
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

**(a) Causes of the 1895 London Mission [6 Marks]:** In 1895, British Colonial Secretary Joseph Chamberlain intended to transfer administrative control of the Bechuanaland Protectorate from London directly into the hands of Cecil John Rhodes’ private **British South Africa Company (BSAC)** [2 marks]. Recognising the brutal dispossession that had already occurred in neighbouring Matebeleland and Mashonaland, Kgosi Khama III (Bangwato), Kgosi Sebele I (Bakwena), and Kgosi Bathoen I (Bangwaketse) undertook the hazardous sea voyage to Britain primarily to prevent BSAC annexation and safeguard their peoples’ sovereign communal grazing lands, plough fields, and traditional system of *bogosi* (chieftainship) from settler confiscation [2 marks]. Alongside defending land and chieftaincy, the Dikgosi petitioned Whitehall to enforce a strict prohibition on the importation and sale of destructive European spirits within their tribal reserves, arguing that the liquor trade undermined family stability and community discipline [2 marks].

**(b) Historic Outcomes & Long-Term Impact [4 Marks]:** Assisted by London Missionary Society supporters and persuasive public speeches across British cities, the Dikgosi secured an historic compromise from Chamberlain: the core tribal territories of Bangwato, Bakwena, and Bangwaketse would remain **directly under British Crown protection** rather than being handed to Rhodes’ BSAC [2 marks]. In exchange, the Dikgosi ceded only a narrow eastern border strip (the Lobatse, Gaborone, and Tuli/Tati corridor blocks) to permit construction of the strategic Cape-to-Bulawayo railway line [2 marks]. Although limited white settler farming blocks emerged along that eastern edge, keeping over ninety percent of Bechuanaland free from BSAC rule prevented full-scale land alienation, preserved indigenous institutions such as the *Kgotla*, and spared Botswana from entrenched settler racial wars, smoothing the path toward peaceful multi-party independence on **30 September 1966**.

Examiners marking BEC JCE Paper 2 reward answers that distinguish clearly between part (a) motivations and part (b) concrete settlements. Ensure you correctly attribute each Kgosi to their *morafe* (Khama III — Bangwato; Sebele I — Bakwena; Bathoen I — Bangwaketse), explicitly mention Colonial Secretary Joseph Chamberlain and the Mafikeng–Bulawayo railway concession, and link the Crown-protectorate safeguard to Botswana’s later constitutional stability [Total: 10 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'bw_jce_ss2_2',
        questionNumber: 2,
        questionText: 'Describe three ways the Botswana Meat Commission (BMC) and veterinary cordon fences protect Botswana’s beef export economy. [6 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC JCE Social Studies Marking Guide [6 Marks]

First, Botswana protects its lucrative international beef exports through a network of **veterinary cordon fences** (such as the Kuke and Makgadikgadi fences) that divide the country into strict livestock disease-control zones [2 marks]. Because free-roaming wild Cape buffalo herds in northern wetlands are natural asymptomatic carriers of the **Foot-and-Mouth Disease (FMD)** virus, physical separation prevents contact between wildlife reservoirs and commercial or communal cattle herds in central and southern Botswana, keeping key export zones certified FMD-free by the World Organisation for Animal Health [2 marks].

Second, the government operates the mandatory **Botswana Animal Identification and Traceability System (BAITS)** alongside routine Department of Veterinary Services vaccination campaigns [2 marks]. Every calf is fitted with a digital ear-tag linking it to its owner, kraal, movement permit, and vaccination history; this ironclad "farm-to-fork" audit trail is a strict legal prerequisite for maintaining quota-free, high-price beef access to the European Union, United Kingdom, and Norwegian markets.

Third, the **Botswana Meat Commission (BMC)** — operating modern export abattoirs in **Lobatse, Francistown, and Maun** — enforces rigorous cold-chain hygiene, ante-mortem and post-mortem veterinary meat inspection, and standardised carcass quality grading before vacuum-packed prime cuts leave the country [2 marks]. Together, disease zoning, digital traceability, and centralised abattoir standards convert traditional pastoralism into a reliable, foreign-exchange-earning pillar supporting rural livelihoods across Botswana [Total: 6 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'bw_jce_ss2_3',
        questionNumber: 3,
        questionText: 'Analyse three roles played by Botswana’s Independent Electoral Commission (IEC) and the Constitution in sustaining multiparty democracy since 1966. [6 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC JCE Social Studies Marking Guide [6 Marks]

Since achieving independence in 1966, Botswana has stood as one of Africa’s longest-standing continuous multiparty democracies, anchored by a supreme **written Constitution** that guarantees universal adult suffrage (for citizens aged 18 and above) and mandates general elections every five years [2 marks]. The Constitution establishes clear separation of powers among the **Legislature** (Parliament and the consultative *Ntlo ya Dikgosi*), the **Executive** (President and Cabinet), and an **Independent Judiciary** (Magistrates’ Courts, High Court, and Court of Appeal), preventing any single branch from rigging electoral rules or abolishing political opposition [2 marks].

A decisive institutional safeguard is the **Independent Electoral Commission (IEC)**, created by constitutional amendment in 1997 to replace direct civil-service administration of elections [2 marks]. The IEC conducts impartial nationwide voter registration, updates electronic voter rolls, delimits constituency boundaries fairly alongside the Delimitation Commission, trains neutral polling officers, regulates the secret ballot, and oversees transparent vote counting in full view of party polling agents and SADC/international observers.

Furthermore, constitutional guarantees of **freedom of assembly, freedom of association, and freedom of expression** enable competing parties (such as the BDP, UDC, BCP, BPF, and independent candidates) to campaign freely at public rallies, broadcast manifestos, and contest disputed results in independent courts of law [Total: 6 marks]. For top marks in JCE Paper 2, always name specific democratic organs (Parliament, *Ntlo ya Dikgosi*, IEC, High Court) and explain *why* neutral election management builds citizen trust in peaceful transfers of power.`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_jce_moral_education_p2',
    subject: 'Moral Education',
    level: 'O-Level',
    paperCode: 'BEC-JCE-ME2',
    paperName: 'BEC JCE Moral Education Paper 2 (Ethics & Botho)',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'bw_jce_moral_education_p2.json',
    questions: [
      {
        id: 'bw_jce_me2_1',
        questionNumber: 1,
        questionText: '(a) Explain the philosophy of Botho ("Motho ke motho ka batho") and illustrate two ways it promotes social harmony in a school community.\n(b) Discuss two modern challenges that threaten traditional Batswana family support systems such as Mafisa and Molaletsa. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC JCE Moral Education Marking Guide [10 Marks]

**(a) The Philosophy of Botho in School Life [6 Marks]:** Rooted in the timeless Setswana proverb *"Motho ke motho ka batho"* ("a person is a person through other people"), **Botho** is Botswana’s foundational ethical philosophy, enshrined in national Vision 2036 as compassion, mutual respect, honesty, empathy, humility, and shared civic responsibility [2 marks]. Within a junior secondary school community, Botho manifests when learners actively reject bullying, tribalism, and cyber-harassment, choosing instead to welcome new students, protect school property as a shared resource, and speak respectfully to teachers, support staff, and peers alike [2 marks]. Practically, it is also seen in peer-mentoring study groups where academically stronger pupils patiently assist classmates struggling in Mathematics or Science, recognising that collective upliftment honours everyone’s dignity rather than selfishly hoarding knowledge [2 marks].

**(b) Modern Challenges to Mafisa & Molaletsa [4 Marks]:** Traditional Batswana mutual-aid customs such as **Mafisa** (entrusting cattle to poorer relatives for milk, draught power, and calves) and **Molaletsa** (communal work parties assisting neighbours during ploughing, weeding, or harvesting) evolved in tightly knit agrarian villages bound by kinship reciprocity [1 mark]. Today, rapid **rural-to-urban migration** to Gaborone, Francistown, and mining towns separates extended family generations, turning household budgets toward purely cash-based nuclear family survival and reducing volunteer labour available for rural *molaletsa* [1.5 marks]. Simultaneously, growing **individualism and materialism** encourage people to hire paid wage contractors or fence off private commercial farms rather than loan breeding livestock under *mafisa*, weakening informal safety nets for elderly and orphaned citizens [1.5 marks].

High-scoring JCE Moral Education responses blend authentic Setswana cultural terms (*Botho, Mafisa, Molaletsa, Kagisano*) with concrete ethical reasoning and realistic school-level examples [Total: 10 marks]. Avoid defining Botho vaguely as simply "being nice"; explicitly connect moral character to civic empathy, conflict resolution, and intergenerational solidarity.`,
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

**(a) Distinguishing GNP per capita from HDI [4 Marks]:** **Gross National Product (GNP) per capita** calculates the total monetary value of all final goods and services produced by a country’s citizens (at home and abroad) divided by its total population [1 mark]. While useful for tracking raw economic output, GNP per capita is a narrow economic average that conceals extreme income inequality between wealthy elites and rural poor, omits subsistence and informal-sector livelihoods, and ignores whether revenue actually improves hospitals, clean water, or human freedoms [1 mark]. By contrast, the United Nations **Human Development Index (HDI)** is a holistic composite measure scored from 0 to 1 across three vital dimensions: **health** (life expectancy at birth), **knowledge/education** (mean and expected years of schooling), and **decent standard of living** (Gross National Income per capita adjusted for Purchasing Power Parity) [2 marks].

**(b) Botswana’s Economic Diversification Strategies under Vision 2036 [6 Marks]:** Because diamonds are a finite, non-renewable resource vulnerable to global luxury recessions and lab-grown synthetics, Botswana’s Vision 2036 prioritises structural economic transformation toward a knowledge-based economy [1 mark]. First, through **diamond beneficiation (downstream value addition)** led by Diamond Trading Company Botswana (DTCB) and the state-owned Okavango Diamond Company in Gaborone, Botswana no longer exports only raw rough stones—it mandates local sorting, valuing, cutting, polishing, and jewellery manufacturing that retain skilled high-wage jobs domestically [2 marks]. Second, Botswana expands **High-Value, Low-Volume Eco-Tourism** across the Okavango Delta UNESCO site, Chobe, Moremi, and the Central Kalahari, partnering with Community-Based Natural Resource Management (CBNRM) trusts so rural villages earn direct conservation income without ecological overcrowding [1.5 marks].

Third, the government actively stimulates **citizen entrepreneurship, renewable solar power, agro-processing, and financial/ICT service hubs** via institutions such as CEDA (Citizen Entrepreneurial Development Agency), LEA (Local Enterprise Authority), the Botswana Innovation Hub, and Special Economic Zones (SEZA) in Gaborone, Lobatse, Selebi-Phikwe, and Francistown [1.5 marks]. On BGCSE 0595 Paper 2, candidates earn top marks by naming specific institutions (DTCB, CEDA, LEA, SEZA) and explicitly contrasting *economic growth* (quantity of output) with *sustainable human development* (quality of life) [Total: 10 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'bw_bgcse_ds_2',
        questionNumber: 2,
        questionText: 'Evaluate two advantages and two challenges of Botswana’s membership in the Southern African Customs Union (SACU) and SADC. [8 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC BGCSE Development Studies Marking Scheme [8 Marks]

As a small, landlocked upper-middle-income economy, Botswana derives major structural benefits from its participation in the **Southern African Customs Union (SACU)** (comprising Botswana, Eswatini, Lesotho, Namibia, and South Africa) and the wider **Southern African Development Community (SADC)**, headquartered in Gaborone [1 mark]. A primary fiscal advantage of SACU is its **Common Revenue Pool**: customs and excise duties collected across all five member states are shared according to an agreed revenue formula, routinely providing Botswana’s national treasury with one of its largest non-mineral revenue streams to finance free public schooling, universal ARV healthcare, and clean water infrastructure [2 marks]. Second, duty-free movement of goods across SACU coupled with SADC regional transport corridors—most notably the **Trans-Kalahari Highway** to Walvis Bay and the **Kazungula Rail-and-Road Bridge** linking Botswana with Zambia—dramatically lowers import/export freight costs and expands access for Botswana’s beef, soda ash, and copper into a regional market exceeding 350 million consumers [2 marks].

On the other hand, regional economic integration exposes Botswana to **severe competition from larger, longer-established South African industrial conglomerates** [1.5 marks]. Because SACU eliminates internal tariffs between members, high-volume South African supermarket chains and factories enjoy economies of scale that easily undercut emerging local Batswana manufacturers in clothing, dairy, and consumer goods, making infant-industry protection exceptionally difficult outside temporary safeguard clauses [1.5 marks].

Furthermore, heavy reliance on **SACU revenue transfers introduces fiscal volatility**: whenever South African and regional import volumes slow down during global downturns, Botswana’s SACU payout drops sharply, disrupting multi-year National Development Plan budgets [1 mark]. For full evaluation marks in BGCSE Paper 2, always balance concrete gains (Common Revenue Pool, Kazungula Bridge, duty-free market scale) against structural trade asymmetries and external budget shocks [Total: 8 marks].`,
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

**(a) Mechanism of Botswana’s Dry-Winter Peak Flooding [4 Marks]:** Remarkably, the Okavango Delta attains its maximum flood extent between **June and August**—right in the middle of Botswana’s rainless Kalahari winter—because over 95% of its water originates far outside Botswana in the humid **Bie Plateau highlands of central Angola**, where intense tropical convectional rains fall during **January and February** [1 mark]. That seasonal rainwater drains southwards for more than **1,000 kilometres** down the Cuito and Cubango rivers, crossing into Botswana at Mohembo inside a seismically active, fault-bounded graben (an extension of the East African Rift system) [1.5 marks]. Because the alluvial fan drops only about **60 metres over 250 km** of sandy terrain and is choked with dense *papyrus* reedbeds and termite-mound islands, floodwaters spread horizontally at a snail’s pace—taking **4 to 6 months** to travel from the Panhandle down to Maun and Lake Ngami [1.5 marks].

**(b) Economic and Ecological Significance [6 Marks]:** Economically, this winter flood pulse turns northern Ngamiland into one of Africa’s premier **High-Value, Low-Volume eco-tourism** destinations during the exact cool, cloudless dry season when international tourists seek wildlife safaris [2 marks]. Lodges, scenic flights, *mokoro* (dugout canoe) polers, professional guides, and **Community-Based Natural Resource Management (CBNRM)** trusts generate substantial foreign exchange and sustained rural employment for surrounding communities [1 mark]. Ecologically, as a Ramsar Wetland of International Importance and Botswana’s 1,000th **UNESCO World Heritage Site**, the delta sustains unmatched biodiversity—supporting threatened sitatunga antelope, hippopotamus, African elephants, wild dogs, over 400 bird species, and dense papyrus filtration beds [1.5 marks].

Additionally, the seasonal inundation supports **indigenous local livelihoods**: floodwaters replenish shallow groundwater aquifers around Maun, yield freshwater tilapia and bream fisheries, supply reeds and thatching grass for traditional housing, and moisten fertile silt soils for traditional **molapo flood-recession farming** of maize, sorghum, and vegetables once waters recede in spring [1.5 marks]. Remember on BGCSE Geography 0584 Paper 2 to cite exact place names (*Angolan Highlands, Mohembo Panhandle, Maun, Thamalakane Fault*) and explain the physical *gradient + vegetation friction* cause of the 4–6 month hydrological lag [Total: 10 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'bw_bgcse_geo_2',
        questionNumber: 2,
        questionText: 'Explain three physical causes and three human management strategies for drought and desertification in Botswana’s Kgalagadi and western grazing regions. [12 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC BGCSE Geography (0584) Marking Scheme [12 Marks]

**Physical Drivers of Drought & Aridity [6 Marks]:** Physically, Botswana’s interior plateau lies along the **Tropic of Capricorn (20°S–26°S)** under the persistent descending limb of the Southern Hemisphere **Hadley Cell (Subtropical High-Pressure Belt)**, which compresses and warms sinking air, inhibiting cloud formation for seven months every year [2 marks]. Second, Botswana sits far inland in a **continental interior position**, separated from warm Indian Ocean moisture by the Drakensberg escarpment, while the cold **Benguela Ocean Current** along the Namibian Atlantic coast chills western onshore winds so little moisture reaches Kgalagadi [2 marks]. Third, periodic **El Niño (ENSO)** warm Pacific events suppress the Inter-Tropical Convergence Zone (ITCZ) rain-belt over Southern Africa, triggering severe multi-year meteorological and agricultural droughts [2 marks].

**Human Management & Anti-Desertification Strategies [6 Marks]:** Where overgrazing around crowded boreholes, bush encroachment, and uncontrolled veldfires strip protective grass cover—exposing loose Kalahari sand to wind erosion—Botswana implements targeted **rotational paddock grazing and carrying-capacity limits** (under agricultural extension policy) to allow perennial savannah grasses time to re-seed between rainy seasons [2 marks]. Communities and the Ministry of Environment also clear and maintain **firebreak networks (cutlines)** across rangelands while enforcing strict penalties against reckless bush-burning so organic topsoil and young acacia saplings survive dry winter winds [2 marks].

Finally, expanding **borehole spacing regulations, solar-powered water pumping, rainwater harvesting, and drought-tolerant crop varieties** (such as early-maturing *Segaolane* sorghum, cowpeas, and pearl millet promoted by the Department of Agricultural Research) equips Batswana pastoralists and arable farmers to maintain food security without exhausting fragile aquifers [2 marks]. Strong BGCSE Geography essays tie atmospheric circulation (Hadley Cell, Benguela Current, ENSO) cleanly to ground-level sustainable range conservation [Total: 12 marks].`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'bw_bgcse_agriculture_p2',
    subject: 'Agriculture',
    level: 'A-Level',
    paperCode: 'BEC-BGCSE-0599/2',
    paperName: 'BEC BGCSE Agriculture Paper 2 (0599/2)',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'bw_bgcse_agriculture_p2.json',
    questions: [
      {
        id: 'bw_bgcse_agri_1',
        questionNumber: 1,
        questionText: '(a) Explain how soil structure, humus content, and moisture conservation practices improve sorghum and cowpea yields under Botswana’s semi-arid climate.\n(b) Describe two biological advantages of intercropping sorghum with cowpeas (dinawa) on small-scale arable farms. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### BEC BGCSE Agriculture (0599) Marking Scheme [10 Marks]

**(a) Soil Structure, Organic Humus & Moisture Conservation [6 Marks]:** Sandy loams across much of Botswana lose moisture rapidly after brief summer thunderstorms unless farmers actively build **crumb soil structure** through incorporating decomposed kraal manure, compost, or crop residues (**humus**) [2 marks]. Dark, colloidal humus binds loose mineral particles into stable porous aggregates, dramatically increasing the soil’s **water-holding capacity** and **cation exchange capacity (CEC)** so essential plant nutrients ($NO_3^-$, $K^+$, $Ca^{2+}$) remain available to roots instead of leaching away during heavy downpours [2 marks]. Coupled with conservation tillage techniques such as **tied ridges, contour ploughing, deep winter ploughing before first rains, and organic surface mulching**, surface runoff and soil surface temperatures fall markedly, preserving precious root-zone moisture through mid-season dry spells for crops like *Segaolane* sorghum [2 marks].

**(b) Agronomic Benefits of Sorghum–Cowpea Intercropping [4 Marks]:** Pairing cereals such as sorghum (*mabele*) with drought-hardy legumes like cowpeas (*dinawa*) yields two powerful biological synergies on Batswana smallholder *masimo* (fields) [1 mark]. First, cowpea root nodules harbour symbiotic ***Rhizobium* bacteria**, which carry out **biological nitrogen fixation**—converting inert atmospheric nitrogen ($N_2$) into soluble ammonium compounds that enrich soil fertility for neighbouring and subsequent sorghum crops, cutting expensive inorganic fertiliser bills [2 marks]. Second, broad-leaved spreading cowpea vines act as a **living ground mulch**, shading bare inter-row soil to suppress competitive weeds, minimise evaporative moisture loss, and cushion raindrops against splash erosion, while diversified canopies reduce total crop failure risk if stem-borers or Striga witchweed strike [1 mark].

In BEC Agriculture 0599 Paper 2, linking physiological soil processes (humus colloids, *Rhizobium* nitrogen fixation, transpiration cooling) with authentic local farming practices guarantees full distinction marks [Total: 10 marks].`,
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

The 1948–1956 crisis began when **Seretse Khama**, heir-designate to the Bangwato *bogosi* (chieftaincy), married an English woman, **Ruth Williams**, while studying law in London—triggering furious opposition from the newly elected National Party Apartheid government in Pretoria and conservative elders led by his uncle, Regent Tshekedi Khama [2 marks]. Seeking to appease South Africa’s white-minority regime and preserve regional strategic cooperation, Britain’s Labour government summoned Seretse to London in 1950 and treacherously **exiled him for six years**, banning him from assuming the throne he had already been overwhelmingly endorsed to inherit by Bangwato *kgotla* assemblies in June 1949 [2 marks].

Rather than silencing nationalist sentiment, Britain’s heavy-handed intervention deeply **politicised ordinary Batswana across ethnic boundaries** [3 marks]. Mass *kgotla* protests in Serowe—including civil disobedience, boycotts of colonial administrative councils, and brave women’s demonstrations—exposed colonial hypocrisy: Britain claimed to uphold rule of law while bowing to Pretoria’s racial laws. Public debates inside *kgotla* courtyards transformed traditional loyalties into modern political consciousness demanding constitutional self-government, non-racial dignity, and direct elected representation [2 marks].

When Seretse Khama finally returned home in 1956 as a private citizen after renouncing claims to the *bogosi* alongside Tshekedi, he commanded unrivalled moral legitimacy across Bechuanaland [3 marks]. That moral authority soon anchored the founding of modern political parties—including the **Bechuanaland People’s Party (BPP, 1960)**, **Seretse Khama’s Bechuanaland Democratic Party (BDP, 1962)**, and the **Botswana National Front (BNF, 1965)**—creating an unstoppable unified momentum toward peaceful multi-party independence on **30 September 1966** [Total: 10 marks].`,
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
