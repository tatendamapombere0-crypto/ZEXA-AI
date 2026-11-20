import type { ExamManifestItem, ExamPaper } from '../types';

export interface SouthAfricaHighYieldItem {
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

export const SOUTH_AFRICA_EXAM_PAPERS: ExamPaper[] = [
  {
    id: 'za_get_social_sciences_p1',
    subject: 'Social Sciences',
    level: 'Primary',
    paperCode: 'CAPS-GET-SS1',
    paperName: 'CAPS Intermediate & Grade 7 Social Sciences Paper 1',
    paperType: 'Paper 1 (History & Geography MCQs)',
    sourceFile: 'za_get_social_sciences_p1.json',
    questions: [
      {
        id: 'za_get_ss_1',
        questionNumber: 1,
        questionText: 'In which South African province are the archaeological ruins of the Kingdom of Mapungubwe located?',
        options: [
          { letter: 'A', text: 'Western Cape' },
          { letter: 'B', text: 'Limpopo' },
          { letter: 'C', text: 'Northern Cape' },
          { letter: 'D', text: 'Free State' }
        ],
        correctAnswer: 'B',
        explanation: 'The Kingdom of Mapungubwe (c. 1075–1220) lies at the confluence of the Shashe and Limpopo Rivers in Limpopo Province, famous for the Golden Rhinoceros and Indian Ocean gold-and-ivory trade.',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_ss_2',
        questionNumber: 2,
        questionText: 'Which combination correctly matches South Africa’s three capital cities to their government functions?',
        options: [
          { letter: 'A', text: 'Johannesburg (Executive), Durban (Legislative), Pretoria (Judicial)' },
          { letter: 'B', text: 'Pretoria (Executive), Cape Town (Legislative), Bloemfontein (Judicial)' },
          { letter: 'C', text: 'Cape Town (Executive), Pretoria (Legislative), Johannesburg (Judicial)' },
          { letter: 'D', text: 'Pretoria (Executive), Pietermaritzburg (Legislative), Bloemfontein (Judicial)' }
        ],
        correctAnswer: 'B',
        explanation: 'Pretoria is South Africa’s Executive capital (Union Buildings), Cape Town is the Legislative capital (Parliament), and Bloemfontein is the Judicial capital (Supreme Court of Appeal; the Constitutional Court is in Johannesburg).',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_ss_3',
        questionNumber: 3,
        questionText: 'What does South Africa’s Coat of Arms motto "!ke e: /xarra //ke" in the |Xam language mean?',
        options: [
          { letter: 'A', text: 'Unity is strength' },
          { letter: 'B', text: 'Diverse people unite' },
          { letter: 'C', text: 'Forward together in peace' },
          { letter: 'D', text: 'Land of gold and rain' }
        ],
        correctAnswer: 'B',
        explanation: 'Adopted on Freedom Day (27 April 2000), the |Xam San motto "!ke e: /xarra //ke" translates to "Diverse people unite".',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_ss_4',
        questionNumber: 4,
        questionText: 'Which warm ocean current flows southward along South Africa’s east coast (KwaZulu-Natal), bringing higher rainfall?',
        options: [
          { letter: 'A', text: 'Benguela Current' },
          { letter: 'B', text: 'Canary Current' },
          { letter: 'C', text: 'Agulhas Current' },
          { letter: 'D', text: 'Humboldt Current' }
        ],
        correctAnswer: 'C',
        explanation: 'The warm Agulhas Current flows along South Africa’s Indian Ocean east coast supplying moist air for higher rainfall, while the cold Benguela Current flows up the Atlantic west coast creating arid conditions.',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_ss_5',
        questionNumber: 5,
        questionText: 'How many official languages does South Africa recognise following the 2023 addition of South African Sign Language (SASL)?',
        options: [
          { letter: 'A', text: '9' },
          { letter: 'B', text: '11' },
          { letter: 'C', text: '12' },
          { letter: 'D', text: '14' }
        ],
        correctAnswer: 'C',
        explanation: 'South Africa added South African Sign Language (SASL) in July 2023 alongside its existing 11 spoken official languages, making 12 official languages in total.',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_get_natsci_tech_p1',
    subject: 'Natural Sciences & Technology',
    level: 'Primary',
    paperCode: 'CAPS-GET-NST1',
    paperName: 'CAPS Primary Natural Sciences & Technology Paper 1',
    paperType: 'Paper 1 (Multiple Choice)',
    sourceFile: 'za_get_natsci_tech_p1.json',
    questions: [
      {
        id: 'za_get_nst_1',
        questionNumber: 1,
        questionText: 'During photosynthesis, green plants take in carbon dioxide and water using chlorophyll and sunlight to produce:',
        options: [
          { letter: 'A', text: 'Glucose and oxygen' },
          { letter: 'B', text: 'Nitrogen and carbon monoxide' },
          { letter: 'C', text: 'Lactic acid and ethanol' },
          { letter: 'D', text: 'Starch and hydrogen only' }
        ],
        correctAnswer: 'A',
        explanation: 'Plants convert carbon dioxide and water into glucose (stored as starch) and release oxygen gas into the atmosphere.',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_nst_2',
        questionNumber: 2,
        questionText: 'Which material is an electrical conductor suitable for wiring inside a South African home circuit?',
        options: [
          { letter: 'A', text: 'PVC plastic' },
          { letter: 'B', text: 'Copper wire' },
          { letter: 'C', text: 'Dry glass' },
          { letter: 'D', text: 'Rubber sleeve' }
        ],
        correctAnswer: 'B',
        explanation: 'Copper is a good metallic electrical conductor because free-moving electrons carry current easily, whereas PVC, glass, and rubber are insulators.',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_nst_3',
        questionNumber: 3,
        questionText: 'Which separation method is best for separating dissolved table salt from ocean water in coastal Eastern Cape salt pans?',
        options: [
          { letter: 'A', text: 'Magnetism' },
          { letter: 'B', text: 'Sieving' },
          { letter: 'C', text: 'Evaporation (crystallisation)' },
          { letter: 'D', text: 'Hand sorting' }
        ],
        correctAnswer: 'C',
        explanation: 'Water evaporates when heated by the sun, leaving solid salt crystals behind because salt has a much higher boiling point.',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_sp_ems_p1',
    subject: 'Economic & Management Sciences',
    level: 'O-Level',
    paperCode: 'CAPS-SP-EMS1',
    paperName: 'CAPS Senior Phase (Grades 8–9) EMS Accounting Paper 1',
    paperType: 'Paper 1 (Accounting Equation & Journals)',
    sourceFile: 'za_sp_ems_p1.json',
    questions: [
      {
        id: 'za_sp_ems_1',
        questionNumber: 1,
        questionText: 'Under the Accounting Equation (Assets = Owner’s Equity + Liabilities), a Gauteng trader buys equipment worth R18,000 and pays via EFT from the business bank account. What is the effect?',
        options: [
          { letter: 'A', text: 'Assets +R18,000 and Liabilities +R18,000' },
          { letter: 'B', text: 'Assets +R18,000 (Equipment) and Assets −R18,000 (Bank); net Assets unchanged' },
          { letter: 'C', text: 'Owner’s Equity −R18,000 and Assets −R18,000' },
          { letter: 'D', text: 'Liabilities −R18,000 and Owner’s Equity +R18,000' }
        ],
        correctAnswer: 'B',
        explanation: 'Equipment (an Asset) increases by R18,000 while Bank (also an Asset) decreases by R18,000. Owner’s Equity and Liabilities are unaffected.',
        answerConfidence: 'high'
      },
      {
        id: 'za_sp_ems_2',
        questionNumber: 2,
        questionText: 'Which subsidiary journal records cash received from a customer paying off their account in CAPS Grade 9 EMS?',
        options: [
          { letter: 'A', text: 'Cash Payments Journal (CPJ)' },
          { letter: 'B', text: 'Debtors Journal (DJ)' },
          { letter: 'C', text: 'Cash Receipts Journal (CRJ)' },
          { letter: 'D', text: 'Creditors Journal (CJ)' }
        ],
        correctAnswer: 'C',
        explanation: 'All cash/EFT inflows—including receipts from debtors—are recorded in the Cash Receipts Journal (CRJ), supported by a duplicate receipt or bank statement deposit.',
        answerConfidence: 'high'
      },
      {
        id: 'za_sp_ems_3',
        questionNumber: 3,
        questionText: 'Explain the role of the Labour Relations Act (LRA) in protecting workplace rights in South Africa. [6 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official CAPS Marking Guide (6 Marks):**\n1. Recognises workers’ constitutional right to form and join **trade unions** (**2 marks**).\n2. Promotes **collective bargaining** over wages and working conditions via bargaining councils (**2 marks**).\n3. Protects employees against unfair dismissal/discrimination and establishes the **CCMA (Commission for Conciliation, Mediation and Arbitration)** to resolve disputes peacefully (**2 marks**).',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_sp_math_p1',
    subject: 'Mathematics',
    level: 'O-Level',
    paperCode: 'CAPS-SP-MATH1',
    paperName: 'CAPS Senior Phase (Grades 8–9) Mathematics Paper 1',
    paperType: 'Paper 1 (Algebra, Exponents & Graphs)',
    sourceFile: 'za_sp_math_p1.json',
    questions: [
      {
        id: 'za_sp_math_1',
        questionNumber: 1,
        questionText: 'Simplify completely: (3x²y³) × (2xy⁻²) using laws of exponents.',
        options: [
          { letter: 'A', text: '5x³y' },
          { letter: 'B', text: '6x³y' },
          { letter: 'C', text: '6x²y⁻⁶' },
          { letter: 'D', text: '6x³y⁵' }
        ],
        correctAnswer: 'B',
        explanation: 'Multiply coefficients (3 × 2 = 6) and add exponents of like bases: x^(2+1) = x³ and y^(3 + (-2)) = y¹, giving 6x³y.',
        answerConfidence: 'high'
      },
      {
        id: 'za_sp_math_2',
        questionNumber: 2,
        questionText: 'Factorise completely and solve for x: x² − 9x + 14 = 0. [4 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official CAPS Working (4 Marks):**\n1. Identify factor pair of +14 summing to −9: −7 and −2 (**1 mark**).\n2. Factorise: **(x − 7)(x − 2) = 0** (**2 marks**).\n3. Solutions: **x = 7 or x = 2** (**1 mark**).',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_physical_sciences_p1',
    subject: 'Physical Sciences',
    level: 'A-Level',
    paperCode: 'NSC-PHY-P1',
    paperName: 'NSC Matric Grade 12 Physical Sciences Paper 1 (Physics)',
    paperType: 'Paper 1 (Mechanics, Doppler & Circuits)',
    sourceFile: 'za_nsc_physical_sciences_p1.json',
    questions: [
      {
        id: 'za_nsc_phy_1',
        questionNumber: 1,
        questionText: 'A car of mass 1,200 kg travels east at 20 m·s⁻¹ and collides head-on with a stationary truck of mass 2,800 kg. If they move together after impact on a frictionless road, calculate their combined velocity after the collision. [4 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official NSC Marking Guideline (4 Marks):**\n1. Principle: Total linear momentum is conserved in an isolated system: $\\Sigma p_i = \\Sigma p_f$ (**1 mark**).\n2. Substitution: $(1200)(20) + (2800)(0) = (1200 + 2800) v_f$ (**2 marks**).\n3. Calculation: $24\\,000 = 4000 v_f \\Rightarrow v_f = \\mathbf{6\\text{ m}\\cdot\\text{s}^{-1}\\text{ east}}$ (**1 mark — magnitude, unit & direction**).',
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_phy_2',
        questionNumber: 2,
        questionText: 'An ambulance siren emits sound of frequency 750 Hz while moving at 25 m·s⁻¹ toward a stationary listener in Pretoria (speed of sound in air = 340 m·s⁻¹). Calculate the frequency heard by the listener. [4 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official NSC Doppler Formula Working (4 Marks):**\n1. Formula: $f_L = \\left(\\frac{v + v_L}{v - v_s}\\right)f_s$ (**1 mark**).\n2. Substitute ($v_L = 0, v_s = 25$ approaching): $f_L = \\left(\\frac{340}{340 - 25}\\right)(750)$ (**2 marks**).\n3. Answer: $f_L = \\frac{340}{315} \\times 750 = \\mathbf{809.52\\text{ Hz}}$ (**1 mark**).',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_life_sciences_p2',
    subject: 'Life Sciences',
    level: 'A-Level',
    paperCode: 'NSC-LS-P2',
    paperName: 'NSC Matric Grade 12 Life Sciences Paper 2 (Genetics & Evolution)',
    paperType: 'Paper 2 (DNA, Genetics & Evolution)',
    sourceFile: 'za_nsc_life_sciences_p2.json',
    questions: [
      {
        id: 'za_nsc_ls_1',
        questionNumber: 1,
        questionText: 'Which famous hominid fossils discovered in South Africa support the "Out of Africa" hypothesis of human evolution?',
        options: [
          { letter: 'A', text: 'Neanderthal Man and Java Man only' },
          { letter: 'B', text: 'Taung Child, Mrs Ples, Little Foot, Australopithecus sediba and Homo naledi' },
          { letter: 'C', text: 'Peking Man and Denisovan fossils only' },
          { letter: 'D', text: 'Dinosaurs from the Jurassic coast' }
        ],
        correctAnswer: 'B',
        explanation: 'The Cradle of Humankind (Sterkfontein, Swartkrans, Malapa, Rising Star) and Taung yielded Australopithecus africanus (Taung Child, Mrs Ples, Little Foot), A. sediba, and Homo naledi, providing world-leading fossil evidence of early bipedal hominins in Africa.',
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_ls_2',
        questionNumber: 2,
        questionText: 'Describe the role of transcription and translation during protein synthesis in a eukaryotic cell. [6 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official NSC Marking Guide (6 Marks):**\n1. **Transcription (Nucleus — 3 marks):** Double-stranded DNA unwinds/unzips; free RNA nucleotides pair with exposed DNA bases on one template strand (A-U, G-C) forming **mRNA**, which leaves via nuclear pores.\n2. **Translation (Ribosome/Cytoplasm — 3 marks):** mRNA attaches to a ribosome; **tRNA** molecules with complementary **anticodons** bring specific **amino acids** matching each mRNA **codon**; amino acids join by **peptide bonds** to form the polypeptide/protein.',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_mathematics_p1',
    subject: 'Mathematics',
    level: 'A-Level',
    paperCode: 'NSC-MATH-P1',
    paperName: 'NSC Matric Grade 12 Mathematics Paper 1 (Calculus & Series)',
    paperType: 'Paper 1 (Algebra, Series & Calculus)',
    sourceFile: 'za_nsc_mathematics_p1.json',
    questions: [
      {
        id: 'za_nsc_m_1',
        questionNumber: 1,
        questionText: 'Determine the derivative of f(x) = 3x² − 2x from first principles. [5 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official NSC First Principles Guideline (5 Marks):**\n1. $f(x+h) = 3(x+h)^2 - 2(x+h) = 3x^2 + 6xh + 3h^2 - 2x - 2h$ (**1 mark**).\n2. $f(x+h) - f(x) = 6xh + 3h^2 - 2h$ (**1 mark**).\n3. Divide by $h$ ($h \\neq 0$): $\\frac{h(6x + 3h - 2)}{h} = 6x + 3h - 2$ (**2 marks**).\n4. Take $\\lim_{h\\to 0}$: $f\'(x) = \\mathbf{6x - 2}$ (**1 mark**).',
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_m_2',
        questionNumber: 2,
        questionText: 'For a quadratic sequence 3; 8; 17; 30; ..., determine the nth term T_n. [4 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official NSC Solution (4 Marks):**\nFirst differences: $5, 9, 13$. Constant second difference $= 4$.\n- $2a = 4 \\Rightarrow a = 2$\n- $3a + b = 5 \\Rightarrow 6 + b = 5 \\Rightarrow b = -1$\n- $a + b + c = 3 \\Rightarrow 2 - 1 + c = 3 \\Rightarrow c = 2$\nTherefore: **$T_n = 2n^2 - n + 2$**.',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_accounting_p1',
    subject: 'Accounting',
    level: 'A-Level',
    paperCode: 'NSC-ACC-P1',
    paperName: 'NSC Matric Grade 12 Accounting Paper 1 (Companies & Financial Reporting)',
    paperType: 'Paper 1 (Companies Financial Statements)',
    sourceFile: 'za_nsc_accounting_p1.json',
    questions: [
      {
        id: 'za_nsc_acc_1',
        questionNumber: 1,
        questionText: 'A listed South African company had 800,000 ordinary shares issued at an average price of R6.50 per share. During the year it repurchased 50,000 shares at R8.20 each. How is this share buy-back recorded in Ordinary Share Capital and Retained Income? [4 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official NSC Company Accounting Guideline (4 Marks):**\n1. Reduce **Ordinary Share Capital** at the average share price: $50\\,000 \\times \\text{R}6.50 = \\mathbf{-\\text{R}325\\,000}$ (**2 marks**).\n2. Reduce **Retained Income** by the premium above average price: $50\\,000 \\times (\\text{R}8.20 - \\text{R}6.50) = 50\\,000 \\times \\text{R}1.70 = \\mathbf{-\\text{R}85\\,000}$ (**2 marks**). (Total cash outflow from Bank = R410,000).',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_history_p2',
    subject: 'History',
    level: 'A-Level',
    paperCode: 'NSC-HIST-P2',
    paperName: 'NSC Matric Grade 12 History Paper 2 (Resistance, 1994 Democracy & TRC)',
    paperType: 'Paper 2 (Source-Based & Essay)',
    sourceFile: 'za_nsc_history_p2.json',
    questions: [
      {
        id: 'za_nsc_hist_1',
        questionNumber: 1,
        questionText: 'Explain why Black Consciousness led by Steve Biko and the 1976 Soweto Uprising represented a decisive turning point against Apartheid. [12 Marks]',
        options: [],
        correctAnswer: null,
        explanation: '**Official NSC Essay Synthesis Guide:**\n1. **Psychological Liberation:** Steve Biko’s Black Consciousness Movement (*SASO / BPC*) urged black South Africans to overcome inferiority complexes, cultivate self-reliance, and unite across ethnic divides (*"Black man, you are on your own"*).\n2. **Spark of 16 June 1976:** Forced imposition of **Afrikaans** as medium of instruction in Bantu Education schools triggered peaceful student marches led by SSRC/Tsietsi Mashinini; state violence killing **Hector Pieterson** sparked nationwide uprisings.\n3. **Impact:** Revived internal resistance after the post-1960 lull, pushed thousands of youth into exile/MK/APLA, deepened international condemnation/sanctions, and paved the way for 1980s **UDF/COSATU** mass mobilisation.',
        answerConfidence: 'high'
      }
    ]
  }
];

export const SOUTH_AFRICA_EXAM_MANIFEST: ExamManifestItem[] = SOUTH_AFRICA_EXAM_PAPERS.map((p) => ({
  id: p.id,
  subject: p.subject,
  level: p.level,
  paperCode: p.paperCode,
  paperName: p.paperName,
  paperType: p.paperType,
  questionCount: p.questions.length,
  file: p.sourceFile || `${p.id}.json`
}));

export const SOUTH_AFRICA_HIGH_YIELD_ITEMS: SouthAfricaHighYieldItem[] = [
  {
    q: 'Distinguish between a Bachelor’s Degree pass, Diploma pass, and Higher Certificate pass in the South African NSC Matric examination',
    a: '**NSC Matric Promotion Categories (DBE / Umalusi):**\n- **Bachelor’s Degree Pass:** Home Language ≥40%, at least **four** designated 20-credit subjects ≥50% (excluding Life Orientation), two other subjects ≥30%.\n- **Diploma Pass:** Home Language ≥40%, **three** other 20-credit subjects ≥40%, two others ≥30%.\n- **Higher Certificate Pass:** Home Language ≥40%, two other subjects ≥40%, three others ≥30% (max one failed subject).',
    s: 'Life Orientation',
    l: 'A-Level',
    p: 'NSC Matric Guidelines',
    c: 'NSC-LO-12',
    f: 'za_exam_bank',
    topic: 'NSC Matric Pass Requirements'
  },
  {
    q: 'Calculate the frequency heard by a listener using the Doppler Effect formula when an ambulance siren approaches at 25 m/s emitting 750 Hz (v = 340 m/s)',
    a: 'Using $f_L = \\left(\\frac{v + v_L}{v - v_s}\\right) f_s = \\left(\\frac{340}{340 - 25}\\right)(750) = \\mathbf{809.52\\text{ Hz}}$. Frequency increases because wavefronts are compressed ahead of the moving source.',
    s: 'Physical Sciences',
    l: 'A-Level',
    p: 'NSC Physical Sciences Paper 1',
    c: 'NSC-PHY-P1',
    f: 'za_exam_bank',
    topic: 'Doppler Effect'
  },
  {
    q: 'How is an ordinary share buy-back above average issue price accounted for in CAPS Grade 12 Accounting?',
    a: '**NSC Company Accounting Rule:**\n1. **Ordinary Share Capital** is reduced by `(Number of shares repurchased × Average issue price per share)`.\n2. **Retained Income** is reduced by `(Number of shares repurchased × Excess paid above average price)`.\n3. **Bank** decreases by the total repurchase payout.',
    s: 'Accounting',
    l: 'A-Level',
    p: 'NSC Accounting Paper 1',
    c: 'NSC-ACC-P1',
    f: 'za_exam_bank',
    topic: 'Company Share Buy-Backs'
  },
  {
    q: 'Which hominid fossils from South Africa’s Cradle of Humankind support the Out of Africa hypothesis?',
    a: 'Key fossils include **Taung Child** (*Australopithecus africanus*), **Mrs Ples** and **Little Foot** (Sterkfontein), *Australopithecus sediba* (Malapa), and *Homo naledi* (Rising Star Cave).',
    s: 'Life Sciences',
    l: 'A-Level',
    p: 'NSC Life Sciences Paper 2',
    c: 'NSC-LS-P2',
    f: 'za_exam_bank',
    topic: 'Human Evolution & Cradle of Humankind'
  },
  {
    q: 'Explain the role of the Truth and Reconciliation Commission (TRC) in South Africa after 1994',
    a: 'Chaired by **Archbishop Desmond Tutu** (1996–1998), the **TRC** investigated gross human rights violations (1960–1994) via three committees (**Human Rights Violations, Amnesty, Reparation & Rehabilitation**), choosing **restorative justice and national healing** over Nuremberg-style trials by granting amnesty only upon **full public disclosure** of politically motivated acts.',
    s: 'History',
    l: 'A-Level',
    p: 'NSC History Paper 2',
    c: 'NSC-HIST-P2',
    f: 'za_exam_bank',
    topic: 'Truth and Reconciliation Commission (TRC)'
  }
];
