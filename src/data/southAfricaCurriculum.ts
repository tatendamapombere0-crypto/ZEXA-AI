import type { KnowledgeChunk } from '../types';

export const SOUTH_AFRICA_CURRICULUM_CHUNKS: KnowledgeChunk[] = [
  // ================= PRIMARY (CAPS FOUNDATION & INTERMEDIATE / GET: GRADES 1 - 7) =================
  {
    id: 'za_mod_primary_english_hl',
    level: 'Primary',
    subject: 'English',
    topic: 'CAPS English Language: Parts of Speech, Tenses, Direct/Indirect Speech & Comprehension',
    source: 'DBE CAPS Intermediate & Grade 7 English Syllabus',
    keywords: ['english caps', 'parts of speech', 'direct speech', 'indirect speech', 'comprehension', 'grade 7'],
    content: `### DBE CAPS English (Grades 4–7): Grammar, Tenses & Exam Writing

1. **Core Word Classes (Parts of Speech):**
   - **Nouns:** Common (*river*), Proper (*Pretoria, Limpopo*), Collective (*a pride of lions*), Abstract (*courage, ubuntu*).
   - **Verbs & Tenses:** Simple Present (*Learners study*), Present Continuous (*are studying*), Past Perfect (*had finished before the bell rang*).
   - **Adjectives & Adverbs:** Adjectives modify nouns (*sunny Durban coast*); adverbs modify verbs/adjectives (*worked diligently*).
   - **Conjunctions:** Coordinating (*FANBOYS: for, and, nor, but, or, yet, so*) vs Subordinating (*although, because, unless*).

2. **Direct to Indirect (Reported) Speech Rules:**
   - Remove inverted commas, shift tense back one step when reporting verb is in past tense, and update pronouns/time markers:
     * Direct: Thabo said, "I will finish my Science project tomorrow."
     * Indirect: Thabo said that **he would** finish **his** Science project **the following day**.

3. **Transactional & Essay Structure (CAPS):**
   - **Narrative / Descriptive Essay:** Orientation (setting & characters) → Rising Action → Climax → Resolution.
   - **Friendly & Formal Letters:** Sender's address, date, recipient details (formal), concise subject line, clear paragraphs, formal sign-off (*Yours faithfully / sincerely*).`
  },
  {
    id: 'za_mod_primary_isizulu_afrikaans',
    level: 'Primary',
    subject: 'Languages (isiZulu & Afrikaans)',
    topic: 'CAPS isiZulu & Afrikaans Essentials: Greetings, Ubuntu, Noun Classes & Woordorde',
    source: 'DBE CAPS Home & First Additional Languages',
    keywords: ['isizulu', 'afrikaans', 'sawubona', 'goeie more', 'stompi', 'woordorde', 'izigaba zamabizo', 'ubuntu'],
    content: `### DBE CAPS South African Languages: isiZulu & Afrikaans Foundations

1. **isiZulu Greetings, Ubuntu & Noun Classes (*Izigaba Zamabizo*):**
   - **Greetings:** *Sawubona* (Hello to one person) / *Sanibonani* (Hello to many) → *Yebo, sawubona!*
   - *Unjani?* (How are you?) → *Ngikhona, wena unjani?* (I am well, and how are you?)
   - *Ngiyabonga* (Thank you) / *Ngiyabonga kakhulu* (Thank you very much).
   - **Ubuntu Proverb:** ***Umuntu ngumuntu ngabantu*** — A person is a person through other people.
   - **Key Noun Prefixes:** Class 1/2 (*umu-/aba-*: *umuntu/abantu*, *umfundi/abafundi*), Class 7/8 (*isi-/izi-*: *isikole/izikole*, *isitsha/izitsha*).

2. **Afrikaans FAL Essentials (*Tye & STOMPI Woordorde*):**
   - **Greetings:** *Goeie môre* (Good morning), *Hoe gaan dit?* → *Dit gaan goed, dankie.*
   - **STOMPI Word Order Rule:** **S**ubject + **V1** (finite verb) + **T**ime + **O**bject + **M**anner + **P**lace + **V2** (infinitive/ge-verb) + **I**nfinitive (*om te*).
     * Example: *Sipho **lees** elke middag sy boek **vinnig** in die biblioteek.*
   - **Verlede Tyd (Past Tense):** Replace present finite verb with ***het*** at V1 and move **ge- + verb** to the end (*Hy het gister hard geleer*).`
  },
  {
    id: 'za_mod_primary_math',
    level: 'Primary',
    subject: 'Mathematics',
    topic: 'CAPS Mathematics (Gr 4–7): Whole Numbers, Fractions, Percentages, BODMAS & Geometry',
    source: 'DBE CAPS Intermediate & Grade 7 Mathematics Syllabus',
    keywords: ['caps mathematics', 'bodmas', 'fractions', 'percentages', 'area perimeter', 'grade 7 math', 'south africa'],
    content: `### DBE CAPS Primary Mathematics (Grades 4–7)

1. **Number Operations & Order of Operations (BODMAS):**
   - **B**rackets → **O**rders (powers/roots) → **D**ivision & **M**ultiplication (left to right) → **A**ddition & **S**ubtraction (left to right).
   - Worked example: $48 \\div (6 + 2) + 3^2 = 48 \\div 8 + 9 = 6 + 9 = 15$.

2. **Fractions, Decimals & Percentages (Rand/Cent Applications):**
   - Converting fraction to percentage: $\\frac{3}{8} \\times 100\\% = 37.5\\%$.
   - Financial example: A textbook priced at **R240** is discounted by **15%**. Discount $= \\frac{15}{100} \\times 240 = \\text{R}36$. Sale Price $= \\text{R}204$.

3. **2D Shapes, 3D Objects & Measurement:**
   - **Rectangle:** Perimeter $= 2(l + b)$; Area $= l \\times b$.
   - **Triangle:** Area $= \\frac{1}{2} \\times \\text{base} \\times \\perp \\text{height}$.
   - **Rectangular Prism Volume:** $V = l \\times b \\times h$ (in $\\text{cm}^3$ or $\\text{m}^3$; note $1\\,000\\text{ cm}^3 = 1\\text{ litre}$).`
  },
  {
    id: 'za_mod_primary_natsci_tech',
    level: 'Primary',
    subject: 'Natural Sciences & Technology',
    topic: 'Photosynthesis, Food Webs, Matter States, Simple Circuits & Solar System — CAPS GET',
    source: 'DBE CAPS Natural Sciences & Technology (Grades 4–7)',
    keywords: ['natural sciences', 'technology', 'photosynthesis', 'matter', 'electric circuit', 'food web', 'grade 6', 'grade 7'],
    content: `### DBE CAPS Natural Sciences & Technology: Energy, Matter & Life

1. **Life & Living — Photosynthesis & Ecosystems:**
   - Plants absorb **carbon dioxide** through stomata, **water** through roots, and trap **sunlight energy** using green **chlorophyll** to produce **glucose** and release **oxygen**.
   - **Food Chains & Trophic Levels:** Sun → **Producers** (e.g. Acacia / grass) → **Primary Consumers** (Impala) → **Secondary/Tertiary Consumers** (Lion) → **Decomposers** (Fungi & Bacteria recycling nutrients).

2. **Matter & Materials — Separating Mixtures:**
   - Hand sorting, sieving, filtration (sand from water), evaporation/crystallisation (salt from seawater), distillation (different boiling points), chromatography (ink pigments).

3. **Energy & Change — Simple Electric Circuits:**
   - Requires a **source of energy** (cell/battery), **conducting pathway** (copper wire), **switch**, and **load** (bulb/buzzer).
   - **Conductors** (copper, aluminium, salt water) allow charge flow; **Insulators** (plastic, rubber, dry wood) block flow for safety.`
  },
  {
    id: 'za_mod_primary_social_sciences',
    level: 'Primary',
    subject: 'Social Sciences',
    topic: 'Mapungubwe Kingdom, Trade, 9 Provinces & Climate Regions of South Africa — CAPS',
    source: 'DBE CAPS Social Sciences (History & Geography Grades 4–7)',
    keywords: ['social sciences caps', 'mapungubwe', '9 provinces', 'climate south africa', 'trade', 'golden rhino'],
    content: `### DBE CAPS Social Sciences: South African Heritage & Geography

1. **History — The Kingdom of Mapungubwe (c. 1075–1220):**
   - Located in Limpopo Province where the Shashe and Limpopo Rivers meet.
   - Kings lived on **Mapungubwe Hill** (sacred leadership symbolised by rainmaking & separation from commoners below).
   - Connected Africa's interior to East African **Swahili coastal towns** (Kilwa, Sofala), exchanging **gold and ivory** for **glass beads, cotton cloth, and Chinese porcelain**.
   - **Artefacts:** The famous **Golden Rhinoceros**, golden bowl, and sceptre—now symbols of national pride (Order of Mapungubwe).

2. **Geography — 9 Provinces & Map Skills:**
   - Every CAPS map uses **Title, Scale (Line/Ratio/Word), Compass Rose (N, NE, E, SE, S, SW, W, NW), and Key/Legend**.
   - Recognise South Africa's **9 Provinces & Capitals** (Pretoria/Johannesburg in Gauteng; Cape Town in Western Cape; Pietermaritzburg in KwaZulu-Natal; Bloemfontein in Free State, etc.) and two oceans (**Indian Ocean** East, **Atlantic Ocean** West meeting near Cape Agulhas).`
  },
  {
    id: 'za_mod_primary_ems_lifeskills',
    level: 'Primary',
    subject: 'Economic & Management Sciences',
    topic: 'Grade 7 EMS & Life Skills: History of Money, Needs vs Wants, Entrepreneurs & Budgets',
    source: 'DBE CAPS Grade 7 EMS & Intermediate Life Skills',
    keywords: ['ems grade 7', 'history of money', 'barter', 'needs and wants', 'entrepreneurship', 'budget', 'inequality'],
    content: `### DBE CAPS Grade 7 EMS: Foundations of Money, Savings & Entrepreneurship

1. **The Evolution of Money:**
   - **Traditional / Self-Sufficient Societies → Bartering:** Direct swap of goods/services (limitation: requires *double coincidence of wants*).
   - **Commodity Money** (salt, cattle, cowrie shells) → **Metal Coins & Paper Notes** → **Electronic Funds Transfer (EFT), SnapScan & Digital Banking**.

2. **Needs vs Wants & Personal Budgeting:**
   - **Needs:** Essential for survival (clean water, nutritious food, shelter, basic clothing, healthcare).
   - **Wants:** Non-essential desires (gaming consoles, designer trainers).
   - **Personal Budget Formula:** $\\text{Net Savings} = \\text{Total Income} - \\text{Total Expenses}$. Always prioritise needs and emergency savings (*stokvels* or bank savings accounts) before luxury wants.

3. **Entrepreneurship Day (CAPS Grade 7 Project):**
   - Key steps: Market research (SWOT analysis), calculating **Fixed Costs + Variable Costs**, setting a selling price above cost per unit to earn profit (**Profit = Income − Costs**), and ethical advertising.`
  },

  // ================= SENIOR PHASE (GET GRADES 8 - 9 / O-LEVEL TIER) =================
  {
    id: 'za_mod_sp_math',
    level: 'O-Level',
    subject: 'Mathematics',
    topic: 'CAPS Grades 8–9 Mathematics: Algebraic Equations, Exponents, Functions & Geometry',
    source: 'DBE CAPS Senior Phase Mathematics (Grades 8–9)',
    keywords: ['grade 8 math', 'grade 9 math', 'exponents', 'linear functions', 'pythagoras', 'geometry straight lines', 'caps'],
    content: `### DBE CAPS Senior Phase Mathematics (Grades 8–9)

1. **Laws of Exponents & Scientific Notation:**
   - $a^m \\times a^n = a^{m+n}$, $\\quad \\frac{a^m}{a^n} = a^{m-n}$, $\\quad (a^m)^n = a^{mn}$, $\\quad a^0 = 1 \\;(a \\neq 0)$, $\\quad a^{-n} = \\frac{1}{a^n}$.

2. **Algebraic Factorisation & Linear Equations:**
   - **HCF Factorisation:** $6x^2y - 9xy^2 = 3xy(2x - 3y)$.
   - **Difference of Two Squares:** $x^2 - 49 = (x - 7)(x + 7)$.
   - **Trinomials:** $x^2 + 5x + 6 = (x + 2)(x + 3)$.
   - **Linear Function:** $y = mx + c$, where $m = \\frac{y_2 - y_1}{x_2 - x_1}$ (gradient) and $c$ is the $y$-intercept. Parallel lines have $m_1 = m_2$; perpendicular lines have $m_1 \\times m_2 = -1$.

3. **Euclidean Geometry & Theorem of Pythagoras:**
   - Straight line angles sum to $180^\\circ$; vertically opposite angles are equal; parallel line rules (**FUN**: **F** = corresponding angles equal, **U** = co-interior angles sum to $180^\\circ$, **N** = alternate interior angles equal).
   - In any right-angled triangle: $c^2 = a^2 + b^2$ (Pythagoras).`
  },
  {
    id: 'za_mod_sp_natural_sciences',
    level: 'O-Level',
    subject: 'Natural Sciences',
    topic: 'CAPS Grades 8–9 Natural Sciences: Atoms, Chemical Reactions, Circuits, Forces & Lithosphere',
    source: 'DBE CAPS Senior Phase Natural Sciences',
    keywords: ['natural sciences grade 9', 'chemical equations', 'series parallel circuits', 'forces', 'lithosphere', 'acids bases'],
    content: `### DBE CAPS Senior Phase Natural Sciences (Grades 8–9)

1. **Matter & Materials — Chemical Reactions & Acids/Bases:**
   - **Balancing Equations (Law of Conservation of Mass):** Total atoms of each element on reactants side equals products side ($2\\text{Mg} + \\text{O}_2 \\rightarrow 2\\text{MgO}$).
   - **pH Scale (0–14):** Acids ($\\text{pH} < 7$, turn blue litmus red), Neutral ($\\text{pH} = 7$), Bases/Alkalis ($\\text{pH} > 7$, turn red litmus blue).
   - **General Neutralisation:** $\\text{Acid} + \\text{Metal Hydroxide} \\rightarrow \\text{Salt} + \\text{Water}$ (e.g. $\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$).

2. **Energy & Change — Series vs Parallel Circuits (South African Eskom Grid Context):**
   - **Series Circuit:** Single pathway; current ($I$) is identical everywhere; total resistance increases as bulbs are added ($R_{\\text{tot}} = R_1 + R_2$), making bulbs dimmer.
   - **Parallel Circuit:** Multiple branches; voltage ($V$) across each branch equals supply voltage; if one branch fails, others stay lit (used in South African household wiring with circuit breakers & earth leakage protection).

3. **Planet Earth & Beyond:** Lithosphere rock cycle (igneous, sedimentary, metamorphic), mining impacts, and South Africa's **SALT (Sutherland)** & **SKA (Northern Cape)** telescopes.`
  },
  {
    id: 'za_mod_sp_ems',
    level: 'O-Level',
    subject: 'Economic & Management Sciences',
    topic: 'CAPS Grades 8–9 EMS: Accounting Equation (A = OE + L), CRJ, CPJ & Circular Flow',
    source: 'DBE CAPS Senior Phase EMS (Grades 8–9)',
    keywords: ['ems grade 9', 'accounting equation', 'crj', 'cpj', 'general ledger', 'trial balance', 'circular flow'],
    content: `### DBE CAPS Senior Phase EMS (Grades 8–9): Accounting & Economy

1. **The Fundamental Accounting Equation:**
   $$\\text{Assets (A)} = \\text{Owner's Equity (OE)} + \\text{Liabilities (L)}$$
   - **Assets** (DR + / CR −): Land & Buildings, Vehicles, Equipment, Trading Stock, Debtors Control, Bank, Cash Float.
   - **Owner's Equity** (CR + / DR −): Capital + Income − Expenses − Drawings.
   - **Liabilities** (CR + / DR −): Loans, Creditors Control, Bank Overdraft.

2. **Subsidiary Journals (Cash & Credit):**
   - **CRJ (Cash Receipts Journal):** Records all money received (Sales, Services/Current Income, Capital contributions, Rent Income). Source documents: Cash Register Roll (CRR), Duplicate Receipt, Bank Deposit Slip.
   - **CPJ (Cash Payments Journal):** Records all payments via EFT/cheque (Trading Stock purchases, Wages, Electricity, Equipment). Source documents: EFT confirmation / Bank statement / Cheque counterfoil.
   - **DJ & CJ (Grade 9):** Debtors Journal (credit sales, duplicate invoice) & Creditors Journal (credit purchases, original invoice).

3. **Three Economic Sectors & Trade Unions (LRA):**
   - **Primary** (extraction: mining/farming) → **Secondary** (manufacturing) → **Tertiary** (services). Trade unions (COSATU/FEDUSA) bargain for fair wages & working conditions under the **Labour Relations Act (LRA)**.`
  },
  {
    id: 'za_mod_sp_social_sciences',
    level: 'O-Level',
    subject: 'Social Sciences',
    topic: 'Mineral Revolution, WW1/WW2, Apartheid Resistance & 1:50,000 Topographic Mapwork — CAPS',
    source: 'DBE CAPS Grades 8–9 History & Geography',
    keywords: ['mineral revolution', '1913 land act', 'apartheid grade 9', 'topographic map 1:50000', 'bearing', 'scale'],
    content: `### DBE CAPS Grades 8–9 Social Sciences: History & Mapwork

1. **History — Industrial & Mineral Revolution in South Africa:**
   - **1867 Kimberley & 1886 Witwatersrand:** Deep-level gold mining demanded massive capital (**Randlords / Chamber of Mines**) and cheap migrant labour controlled through **closed compounds**, **hut taxes**, and **pass laws**.
   - **1913 Natives Land Act:** Forced African families off arable land into overcrowded reserves (~7–13%), pushing men into mine wage labour.
   - **Grade 9 Focus:** Universal Declaration of Human Rights (1948), Apartheid Turning Points (Sharpeville 1960, Soweto 1976, 1990–1994 transition).

2. **Geography — 1:50,000 Topographic & 1:10,000 Orthophoto Map Calculations:**
   - **Distance Formula:** $\\text{Actual Distance (km)} = \\frac{\\text{Map Distance (cm)} \\times 50\\,000}{100\\,000} = \\text{Map Distance (cm)} \\times 0.5\\text{ km}$.
   - **Contour Lines:** Close contour spacing = steep slope; wide spacing = gentle slope; V-shaped contours pointing *uphill* mark river valleys.
   - **Weathering & Erosion:** Physical (exfoliation, freeze-thaw), chemical (carbonation, oxidation), and biological weathering shaping South African landforms.`
  },
  {
    id: 'za_mod_sp_technology',
    level: 'O-Level',
    subject: 'Technology',
    topic: 'CAPS Grades 8–9 Technology: IDMEC Design Process, Structures, Gears, Levers & Hydraulics',
    source: 'DBE CAPS Senior Phase Technology (Grades 8–9)',
    keywords: ['technology grade 8', 'technology grade 9', 'idmec', 'gears', 'levers', 'hydraulics', 'mechanical advantage'],
    content: `### DBE CAPS Senior Phase Technology (Grades 8–9)

1. **The IDMEC Design Process:**
   - **I**nvestigate (problem brief, existing products) → **D**esign (specifications, freehand & orthographic 2D/isometric 3D drawings) → **M**ake (safe workshop fabrication) → **E**valuate (test against criteria) → **C**ommunicate (final portfolio).

2. **Structures & Forces:**
   - Frame, shell, and solid structures reinforced with **triangulation, gusset plates, cross-bracing, and arches** to withstand **compression, tension, bending, torsion, and shear** forces.

3. **Mechanical & Hydraulic Systems:**
   - **Mechanical Advantage (MA):** $\\text{MA} = \\frac{\\text{Load}}{\\text{Effort}}$ (or $\\frac{\\text{Driven Gear Teeth}}{\\text{Driver Gear Teeth}}$ for gear ratio).
   - **Hydraulics (Pascal's Principle):** Incompressible liquid transmits pressure equally ($P = \\frac{F}{A}$); a small input piston moves through a large distance to exert a large force on a wider output piston (e.g. hydraulic car jacks & mine lifts).`
  },
  {
    id: 'za_mod_sp_life_orientation',
    level: 'O-Level',
    subject: 'Life Orientation',
    topic: 'CAPS Life Orientation: Bill of Rights, Career Streams (FET Subjects) & Study Methods',
    source: 'DBE CAPS Senior Phase Life Orientation',
    keywords: ['life orientation', 'bill of rights', 'subject choice grade 9', 'study methods', 'constitution'],
    content: `### DBE CAPS Senior Phase Life Orientation: Citizenship & Subject Choices

1. **Constitutional Values & Human Rights:**
   - **Chapter 2 Bill of Rights:** Equality (s9), Human Dignity (s10), Life (s11), Freedom of Expression (s16), Children's Rights (s28), Basic Education (s29), Healthy Environment (s24).

2. **Grade 9 → Grade 10 FET Subject Selection Strategy:**
   - Align electives to university/TVET requirements:
     * **Engineering / Medicine / BSc:** Choose **Core Mathematics** + **Physical Sciences** + **Life Sciences**.
     * **Commerce / CA(SA) / Economics:** Choose **Core Mathematics** + **Accounting** + **Economics / Business Studies**.
     * **Humanities / Law / Education / Hospitality:** Core Math or Math Literacy + **History / Geography / Languages**.`
  },

  // ================= FET & MATRIC (NSC / IEB GRADES 10 - 12 / A-LEVEL TIER) =================
  {
    id: 'za_mod_nsc_mathematics',
    level: 'A-Level',
    subject: 'Mathematics',
    topic: 'NSC Matric Mathematics (Papers 1 & 2): Calculus, Series, Trig, Circle & Analytical Geometry',
    source: 'DBE CAPS FET & NSC Grade 12 Mathematics Syllabus',
    keywords: ['nsc mathematics', 'matric math', 'calculus first principles', 'quadratic sequence', 'circle geometry', 'trigonometry caps', 'analytical geometry'],
    content: `### NSC Grade 12 Mathematics (CAPS Papers 1 & 2 Complete Core)

1. **Paper 1 — Sequences, Functions & Differential Calculus:**
   - **Arithmetic:** $T_n = a + (n-1)d$, $\\;S_n = \\frac{n}{2}[2a + (n-1)d]$.
   - **Geometric:** $T_n = ar^{n-1}$, $\\;S_\\infty = \\frac{a}{1-r}$ for $|r| < 1$.
   - **Quadratic Sequences:** Constant second difference $2a$, first difference $3a+b$, first term $a+b+c$.
   - **Financial Math:** Compound growth $A = P(1+i)^n$; Present & Future Value Annuities: $F = \\frac{x[(1+i)^n - 1]}{i}$, $\\;P = \\frac{x[1 - (1+i)^{-n}]}{i}$.
   - **Calculus:** First principles $f'(x) = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$; Turning points at $f'(x)=0$; Inflection point at $f''(x)=0$.

2. **Paper 2 — Analytical Geometry, Trigonometry & Euclidean Theorems:**
   - **Circle Equation:** $(x - a)^2 + (y - b)^2 = r^2$, tangent perpendicular to radius ($m_{\\text{rad}} \\times m_{\\text{tan}} = -1$).
   - **Trigonometric Identities & Compound Angles:** $\\sin^2\\theta + \\cos^2\\theta = 1$, $\\;\\sin(A\\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B$, $\\;\\cos 2A = \\cos^2 A - \\sin^2 A = 1 - 2\\sin^2 A$.
   - **Euclidean Circle Theorems:** Line from centre $\\perp$ chord bisects chord; Angle at centre $= 2 \\times$ angle at circumference; Opposite angles of cyclic quad $= 180^\\circ$; **Tan-Chord Theorem**; Proportionality Theorem & Similar Triangles.`
  },
  {
    id: 'za_mod_nsc_math_literacy',
    level: 'A-Level',
    subject: 'Mathematical Literacy',
    topic: 'NSC Mathematical Literacy: 15% VAT, PAYE Tax Tables, Tariffs, BMI & Maps/Plans',
    source: 'DBE CAPS FET Mathematical Literacy Syllabus',
    keywords: ['mathematical literacy', 'math lit', 'vat 15', 'uif', 'tax brackets', 'tariffs', 'bmi', 'matric math lit'],
    content: `### NSC Grade 12 Mathematical Literacy (CAPS Papers 1 & 2)

1. **South African Financial Calculations:**
   - **15% VAT:**
     * Add VAT: $\\text{Inclusive Price} = \\text{Exclusive Price} \\times 1.15$.
     * Extract VAT: $\\text{Exclusive Price} = \\frac{\\text{Inclusive Price}}{1.15}$; $\\;\\text{VAT Amount} = \\text{Inclusive} - \\text{Exclusive}$.
   - **UIF:** $1\\%$ employee contribution + $1\\%$ employer contribution (capped at ceiling).
   - **SARS Progressive Tax Brackets:** Calculate taxable income (Gross − Pension contribution), apply bracket base + marginal rate above bracket threshold, then **subtract Primary/Secondary Rebate** and **Medical Tax Credits**.

2. **Municipal Sliding Tariffs & Measurement:**
   - Electricity/Water stepped tariffs multiply kWh or $\\text{k}\\ell$ consumed *within each block* separately and sum before adding 15% VAT.
   - Conversions ($1\\text{ m}^3 = 1\\,000\\text{ L}$, $1\\text{ inch} = 2.54\\text{ cm}$), $\\text{BMI} = \\frac{\\text{mass (kg)}}{[\\text{height (m)}]^2}$, Box-and-Whisker percentiles ($Q_1, Q_2, Q_3$).`
  },
  {
    id: 'za_mod_nsc_physical_sciences',
    level: 'A-Level',
    subject: 'Physical Sciences',
    topic: 'NSC Physical Sciences: Mechanics, Doppler Effect, Electrodynamics, Organic Chemistry & Equilibrium',
    source: 'DBE CAPS FET & NSC Grade 12 Physical Sciences Syllabus',
    keywords: ['physical sciences caps', 'momentum impulse', 'work energy theorem', 'doppler effect', 'iupac organic', 'le chatelier', 'galvanic cell'],
    content: `### NSC Grade 12 Physical Sciences (Physics P1 & Chemistry P2)

1. **Paper 1 — Mechanics, Waves & Electrodynamics:**
   - **Newton's 2nd Law & Momentum:** $\\vec{F}_{\\text{net}}\\Delta t = \\Delta \\vec{p} = m(\\vec{v}_f - \\vec{v}_i)$. Isolated system: $\\sum \\vec{p}_i = \\sum \\vec{p}_f$.
   - **Work-Energy Theorem:** $W_{\\text{net}} = \\Delta E_k = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2$; Non-conservative work: $W_{nc} = \\Delta E_k + \\Delta E_p$.
   - **Doppler Effect:** $f_L = \\left(\\frac{v \\pm v_L}{v \\mp v_s}\\right) f_s$ (higher observed frequency on approach; red-shift proves expanding universe).
   - **Internal Resistance:** $\\varepsilon = I(R + r) = V_{\\text{load}} + Ir$. **AC Generators & RMS:** $V_{\\text{rms}} = \\frac{V_{\\text{max}}}{\\sqrt{2}}$, $P_{\\text{ave}} = V_{\\text{rms}}I_{\\text{rms}}$.

2. **Paper 2 — Organic Chemistry, Equilibrium & Electrochemistry:**
   - **Homologous Series & IUPAC Naming:** Alkanes, alkenes, alkynes, haloalkanes, alcohols, aldehydes, ketones, carboxylic acids, **esters** (alcohol + carboxylic acid with $\\text{H}_2\\text{SO}_4$ catalyst + heat).
   - **Chemical Equilibrium ($K_c$ & Le Chatelier's Principle):** Only temperature changes $K_c$. Compare $K_c$ shift when changing $T$, pressure (gas moles), or concentration.
   - **Electrochemical Cells:**
     * **Galvanic (Voltaic):** Spontaneous chemical → electrical energy ($E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} > 0$), Anode (−) oxidises (**AN OX / RED CAT**), salt bridge maintains electrical neutrality.
     * **Electrolytic:** Non-spontaneous electrical → chemical (electroplating, chlor-alkali membrane cell, aluminium extraction).`
  },
  {
    id: 'za_mod_nsc_life_sciences',
    level: 'A-Level',
    subject: 'Life Sciences',
    topic: 'NSC Life Sciences: DNA Replication, Meiosis, Genetics, Endocrine/Homeostasis & Human Evolution',
    source: 'DBE CAPS FET & NSC Grade 12 Life Sciences Syllabus',
    keywords: ['life sciences caps', 'dna replication', 'protein synthesis', 'meiosis', 'homeostasis', 'cradle of humankind', 'human evolution', 'australopithecus'],
    content: `### NSC Grade 12 Life Sciences (Papers 1 & 2)

1. **Paper 1 — Nervous System, Endocrine Control & Homeostasis:**
   - **Reflex Arc:** Receptor → Sensory neuron → Interneuron (spinal cord) → Motor neuron → Effector (rapid involuntary protection).
   - **Negative Feedback Homeostasis:**
     * Blood Glucose: High glucose → Pancreas Beta cells secrete **insulin** → liver converts glucose to **glycogen**. Low glucose → Alpha cells secrete **glucagon**.
     * **Thyroxin & TSH**, **ADH** (osmoregulation at kidney collecting ducts), **Vasoconstriction vs Vasodilation** for thermoregulation.

2. **Paper 2 — Nucleic Acids, Meiosis, Genetics & Human Evolution:**
   - **Protein Synthesis:** **Transcription** (DNA template → mRNA in nucleus) → **Translation** (mRNA codons matched by tRNA anticodons at ribosome to join amino acids via peptide bonds).
   - **Meiosis Sources of Variation:** **Crossing over** (Prophase I) & **Random assortment** of homologous chromosomes (Metaphase I). Non-disjunction causes **Trisomy 21 (Down syndrome)**.
   - **Human Evolution & *"Out of Africa"* Hypothesis:** Bipedalism indicators (foramen magnum shifted forward, short wide pelvis, S-shaped spine). Key South African fossils from **Cradle of Humankind**: *Australopithecus africanus* (**Taung Child** — Raymond Dart; **Mrs Ples** — Robert Broom; **Little Foot**), *Australopithecus sediba*, and *Homo naledi* (Rising Star Cave).`
  },
  {
    id: 'za_mod_nsc_accounting',
    level: 'A-Level',
    subject: 'Accounting',
    topic: 'NSC Accounting: Companies Financial Statements, Cash Flow, Cost Accounting & Inventory',
    source: 'DBE CAPS FET & NSC Grade 12 Accounting Syllabus',
    keywords: ['accounting caps', 'companies financial statements', 'cash flow statement', 'fifo', 'weighted average', 'audit report', 'nsc accounting'],
    content: `### NSC Grade 12 Accounting (Companies & Managerial Accounting)

1. **Companies Act Financial Statements (Papers 1):**
   - **Statement of Comprehensive Income:** Sales − Cost of Sales = Gross Profit + Operating Income − Operating Expenses = Operating Profit + Interest Income = Profit before Interest − Interest Expense = Net Profit Before Tax − Income Tax = Net Profit After Tax.
   - **Ordinary Share Capital & Retained Income Notes:** Calculate average issue price on share buy-backs; dividends = Interim Paid + Final Recommended.
   - **Statement of Financial Position:** Non-Current Assets (Fixed Assets Note) + Current Assets (Inventories, Trade & Other Receivables, Cash & Cash Equivalents) = Total Assets = Equity + Liabilities.
   - **Cash Flow Statement:** Operating Activities (Cash generated from operations − Interest paid − Dividends paid − Taxation paid), Investing Activities (Fixed asset purchases/proceeds), Financing Activities (Share issues/buy-backs + Loans).

2. **Cost Accounting, Inventory & Auditing (Paper 2):**
   - **Break-Even Point (BEP):** $\\text{BEP} = \\frac{\\text{Total Fixed Costs}}{\\text{Selling Price per unit} - \\text{Variable Cost per unit}}$.
   - **Inventory Valuation:** **FIFO** (First-In, First-Out) vs **Weighted Average**; **Perpetual** vs **Periodic** stock systems.
   - **Audit Reports:** **Unqualified** (fair presentation — desired), **Qualified** (specific reservation), **Disclaimer** / **Adverse** (serious misstatements).`
  },
  {
    id: 'za_mod_nsc_economics_business',
    level: 'A-Level',
    subject: 'Economics & Business Studies',
    topic: 'NSC Economics & Business Studies: Circular Flow, Multiplier, Market Structures & SA Labour Laws',
    source: 'DBE CAPS FET Economics & Business Studies Syllabus',
    keywords: ['economics caps', 'business studies caps', 'multiplier', 'king iv', 'bcea', 'lra', 'bbbee', 'market structures'],
    content: `### NSC Economics & Business Studies (Grade 12 CAPS)

1. **Economics — Macroeconomics & Markets:**
   - **Open-Economy Circular Flow:** Leakages ($S + T + M$) vs Injections ($I + G + X$).
   - **Keynesian Multiplier:** $k = \\frac{1}{1 - \\text{MPC}} = \\frac{1}{\\text{MPS}}$ (in closed no-tax model); total $\\Delta Y = k \\times \\Delta I$.
   - **Market Structures:** Perfect Competition (many firms, homogeneous product, price taker, normal profit in long run) vs Monopoly (single firm, price maker, barriers like Eskom/Transnet) vs Oligopoly (**kinked demand curve**, non-price competition, collusion risks).

2. **Business Studies — Essential South African Legislation & Governance:**
   - **LRA (Labour Relations Act 66 of 1995):** Protects collective bargaining, CCMA dispute resolution, strikes & fair dismissal.
   - **BCEA (Basic Conditions of Employment Act):** Regulates maximum working hours (45/week), overtime (1.5×), annual/sick/parental leave.
   - **EEA (Employment Equity Act) & Skills Development Act (1% SDL levy / SETAs) & BBBEE (Broad-Based Black Economic Empowerment).**
   - **King IV Code of Corporate Governance:** Ethical leadership, transparency, stakeholder inclusivity, and triple bottom line (People, Planet, Profit).`
  },
  {
    id: 'za_mod_nsc_history_geography',
    level: 'A-Level',
    subject: 'History & Geography',
    topic: 'NSC History (Apartheid/Cold War/TRC) & Geography (Cyclones, Microclimate & Geomorphology)',
    source: 'DBE CAPS FET History & Geography Syllabus',
    keywords: ['nsc history', 'nsc geography', 'mid latitude cyclone', 'tropical cyclone', 'valley climate', 'river capture', 'trc', 'soweto 1976'],
    content: `### NSC Grade 12 History & Geography Highlights

1. **NSC Geography (Climatology, Geomorphology & SA Economic Geography):**
   - **Mid-Latitude Cyclones (Western Cape Winter):** Move West → East in westerlies; cold front undercuts warm sector causing cumulonimbus & heavy winter rain.
   - **Tropical Cyclones (Mozambique Channel / KZN/Limpopo):** Form over oceans $>26.5^\\circ\\text{C}$ between $5^\\circ$–$25^\\circ$ latitudes (require Coriolis force); eye has calm descending air.
   - **Valley Climates & Urban Heat Islands:** Katabatic (cold downslope night air creating frost pockets/temperature inversion) vs Anabatic (warm upslope day air); **Berg winds** cause hot, dry conditions ahead of coastal lows (veld fire risk).
   - **Geomorphology:** River capture (pirate stream erodes headward through watershed creating elbow of capture & wind gap) and drainage density factors.

2. **NSC History (Cold War, Independent Africa, Apartheid Crisis & 1994 Settlement):**
   - Black Consciousness (**Steve Biko**), **1976 Soweto Uprising**, **UDF/COSATU** internal resistance, international sanctions/disinvestment, **CODESA I & II**, **27 April 1994** democracy, and **TRC** debates.`
  },

  // ================= TERTIARY (UNIVERSITIES, UoTs, TVET & SAQA NQF 5 - 10) =================
  {
    id: 'za_mod_tertiary_constitutional_law',
    level: 'Tertiary',
    subject: 'Law',
    topic: 'South African Constitutional Law: Transformative Constitutionalism, Ubuntu & Section 36',
    source: 'SAQA NQF Level 7–8 · South African LLB / Public Law',
    keywords: ['constitutional law south africa', 'section 36', 'makwanyane', 'grootboom', 'transformative constitutionalism', 'bill of rights'],
    content: `### South African Constitutional Law (LLB / NQF 7–8 Foundation)

1. **Constitutional Supremacy & Transformative Constitutionalism:**
   - **Section 2 of the 1996 Constitution:** *"This Constitution is the supreme law of the Republic; law or conduct inconsistent with it is invalid."*
   - **Transformative Constitutionalism (Karl Klare):** Uses constitutional adjudication, socio-economic rights, and ***Ubuntu*** to dismantle apartheid's structural legacy and build substantive equality (Section 9).

2. **Section 36 Limitations Clause & Landmark Judgments:**
   - Rights in the Bill of Rights may only be limited by a **law of general application** to the extent that the limitation is **reasonable and justifiable in an open and democratic society** (balancing nature of right, importance of purpose, nature/extent of limitation, relation between limitation & purpose, and **less restrictive means**).
   - ***S v Makwanyane (1995):*** Struck down the death penalty as cruel/inhuman under Sections 9, 10, 11 and *Ubuntu*.
   - ***Government of the RSA v Grootboom (2000):*** Established the *"reasonableness test"* for progressive realisation of socio-economic rights (Section 26 housing).`
  },
  {
    id: 'za_mod_tertiary_econ_engineering',
    level: 'Tertiary',
    subject: 'Economics & TVET Engineering',
    topic: 'SARB Monetary Transmission, National Budget Debt Dynamics & TVET / NQF Framework',
    source: 'SAQA NQF 5–8 · South African Macroeconomics & TVET NATED/NCV',
    keywords: ['sarb repo rate', 'monetary transmission', 'nqf levels', 'saqa', 'tvet nated', 'fiscal policy south africa'],
    content: `### South African Higher Education Economics & TVET / NQF Architecture

1. **SARB Inflation Targeting & Monetary Policy Transmission:**
   - **Policy Instrument:** The Monetary Policy Committee (MPC) sets the **Repo Rate** at which commercial banks borrow liquidity from the SARB, anchored to a **3%–6% CPI target band**.
   - **Transmission Channels:** Repo rate → Prime Lending Rate & JIBAR → Household consumption & corporate investment → Aggregate demand & exchange-rate expectations → CPI inflation after 4–8 quarters.

2. **NQF 10-Level Framework (SAQA / Umalusi / QCTO / CHE):**
   - **NQF 1–4:** General & Further Education (GET Grade 9 = NQF 1; Matric / NCV L4 / N3 = NQF 4) overseen by **Umalusi**.
   - **NQF 5–6:** Higher Certificates, National Diplomas (N4–N6 NATED + 18/24 months workplace practical).
   - **NQF 7–10:** Bachelor's Degrees (NQF 7), Honours/LLB/BEng (NQF 8), Master's (NQF 9), Doctoral Degrees (NQF 10) overseen by **CHE** (Council on Higher Education).`
  }
];
