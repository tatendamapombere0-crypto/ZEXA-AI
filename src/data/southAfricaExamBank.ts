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
    paperName: 'CAPS Intermediate & Grade 6–7 Natural Sciences & Technology Paper 1',
    paperType: 'Paper 1 (Matter, Energy & Life Processes)',
    sourceFile: 'za_get_natsci_tech_p1.json',
    questions: [
      {
        id: 'za_get_nst_1',
        questionNumber: 1,
        questionText: 'During photosynthesis in green plants, which gas is absorbed from the atmosphere and stored as chemical energy in glucose?',
        options: [
          { letter: 'A', text: 'Nitrogen' },
          { letter: 'B', text: 'Carbon dioxide' },
          { letter: 'C', text: 'Oxygen' },
          { letter: 'D', text: 'Argon' }
        ],
        correctAnswer: 'B',
        explanation: 'Plants absorb carbon dioxide (CO2) and water using sunlight trapped by chlorophyll to produce glucose and release oxygen.',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_nst_2',
        questionNumber: 2,
        questionText: 'Which material is the best conductor of electric current for wiring household circuits in South Africa?',
        options: [
          { letter: 'A', text: 'Plastic' },
          { letter: 'B', text: 'Dry wood' },
          { letter: 'C', text: 'Copper' },
          { letter: 'D', text: 'Rubber' }
        ],
        correctAnswer: 'C',
        explanation: 'Copper is a metal with free-moving electrons and low electrical resistance, making it an excellent conductor. Plastic, wood, and rubber are insulators.',
        answerConfidence: 'high'
      },
      {
        id: 'za_get_nst_3',
        questionNumber: 3,
        questionText: 'Which separation method is best used to recover dissolved table salt from sea water?',
        options: [
          { letter: 'A', text: 'Sieving' },
          { letter: 'B', text: 'Magnetic separation' },
          { letter: 'C', text: 'Evaporation' },
          { letter: 'D', text: 'Hand sorting' }
        ],
        correctAnswer: 'C',
        explanation: 'Evaporation drives off the liquid water as vapour and leaves solid salt crystals behind because salt is dissolved in solution.',
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_get_social_sciences_p2',
    subject: 'Social Sciences',
    level: 'Primary',
    paperCode: 'CAPS-GET-SS2',
    paperName: 'CAPS Intermediate & Grade 6–7 Social Sciences Paper 2 (Structured Theory)',
    paperType: 'Paper 2 (Structured History & Geography)',
    sourceFile: 'za_get_social_sciences_p2.json',
    questions: [
      {
        id: 'za_get_ss2_1',
        questionNumber: 1,
        questionText: '(a) Explain why the Kingdom of Mapungubwe grew into a wealthy trading state around AD 1075–1220.\n(b) Describe how the warm Agulhas Current and cold Benguela Current create different rainfall regions across South Africa. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE CAPS GET Marking Guide [10 Marks]

**(a) Rise of the Kingdom of Mapungubwe [5 Marks]:** Situated at the strategic confluence of the Shashe and Limpopo Rivers in modern-day Limpopo Province, **Mapungubwe** (*"Hill of the Jackal"*) became southern Africa’s earliest complex state between AD 1075 and 1220 because seasonal river flooding created fertile alluvial soils for sorghum, millet, and cattle farming, sustaining a rapidly growing settled population [2 marks]. Archaeological finds on Mapungubwe Hill—most famously the solid beaten **Golden Rhinoceros**, gold beads, and sceptre buried with sacred royal rulers—prove that skilled metalworkers mined local gold, copper, and iron and hunted elephants for ivory, which African caravans traded across the Limpopo River valley to Indian Ocean coastal ports like Kilwa and Sofala in exchange for imported glass beads and Chinese celadon porcelain [3 marks].

**(b) Influence of the Agulhas and Benguela Ocean Currents [5 Marks]:** South Africa’s contrasting coastal rainfall climates are shaped directly by two opposing ocean currents flanking the subcontinent [1 mark]. Along the eastern **Indian Ocean coast** (KwaZulu-Natal and Eastern Cape), the southward-flowing **warm Agulhas Current** originates near the equatorial tropics, warming the overlying maritime air and accelerating evaporation; when moist onshore trade winds blow inland and rise over the Drakensberg escarpment, they cool, condense, and release abundant summer rainfall exceeding 800–1,200 mm per year, nourishing lush subtropical forests and sugarcane farms [2 marks].

Conversely, along the western **Atlantic Ocean coast** (Northern Cape and Western Cape coast), the northward-flowing **cold Benguela Current** carries icy polar water from the Southern Ocean [1 mark]. Cold water chills the air directly above it, reducing evaporation and suppressing rising convection currents; consequently, western coastal air holds scant moisture, producing foggy, desert-to-semi-arid conditions along Namaqualand and the West Coast [1 mark]. For full CAPS Paper 2 marks, always pair historical trade goods with physical atmospheric moisture mechanisms [Total: 10 marks].`,
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
        explanation: `### Official DBE CAPS Senior Phase EMS Marking Guide [6 Marks]

Enacted after the transition to democracy in 1995 to give practical effect to Section 23 of South Africa’s Constitution, the **Labour Relations Act (LRA, Act 66 of 1995)** safeguards fundamental worker and employer rights across every formal workplace [2 marks]. First, the Act guarantees every employee the freedom to form, join, and participate in independent **trade unions** without intimidation or victimisation by management, while similarly recognising registered employers’ organisations; this ensures workers are no longer powerless individuals negotiating against large corporations [2 marks].

Second, the LRA institutionalises structured **collective bargaining** through Bargaining Councils, Statutory Councils, and workplace forums, empowering unions and employers to negotiate fair minimum wages, safe working hours, overtime compensation, and training conditions peacefully through binding collective agreements [2 marks]. In addition, the Act strictly prohibits **unfair dismissals and unfair labour practices** (such as dismissing workers on grounds of pregnancy, union membership, race, or disability), requiring employers to follow both *substantive fairness* (a valid reason) and *procedural fairness* (a proper disciplinary hearing).

Third, to prevent costly strikes and industrial lockouts whenever disputes arise, the LRA established the independent **Commission for Conciliation, Mediation and Arbitration (CCMA)** and the **Labour Court** [2 marks]. Aggrieved employees or employers refer dismissals or wage deadlocks to the CCMA within 30 days for impartial conciliation and rapid arbitration awards, promoting industrial peace, workplace democracy, and economic productivity across South Africa [Total: 6 marks].`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_sp_ems_p2',
    subject: 'Economic & Management Sciences',
    level: 'O-Level',
    paperCode: 'CAPS-SP-EMS2',
    paperName: 'CAPS Senior Phase (Grades 8–9) EMS Paper 2 (The Economy & Entrepreneurship)',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'za_sp_ems_p2.json',
    questions: [
      {
        id: 'za_sp_ems2_1',
        questionNumber: 1,
        questionText: '(a) Explain how the Circular Flow Model connects Households, Businesses, and the South African Government.\n(b) Discuss two ways an entrepreneur contributes to reducing unemployment and inequality in a local community. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE CAPS EMS Paper 2 Marking Guide [10 Marks]

**(a) The Circular Flow Model [6 Marks]:** In the closed three-sector macroeconomic Circular Flow Model, **Households** own the four factors of production (natural resources, labour, capital, and entrepreneurship) and supply them through the **factor market** to **Businesses** in return for factor income in the form of rent, wages/salaries, interest, and profit [2 marks]. Households then spend the majority of that income in the **goods and services market** as consumption expenditure to purchase food, clothing, transport, and digital services manufactured and sold by businesses, creating a continuous reciprocal loop of real flows (resources and products) moving in the opposite direction to money flows (income and spending) [2 marks]. Meanwhile, the **South African Government** collects direct income taxes (PAYE) and indirect Value-Added Tax (VAT at 15%) from both households and firms and injects public spending back into the economy by funding public schools, hospitals, Eskom grid upgrades, municipal water infrastructure, and social grants [2 marks].

**(b) Role of Entrepreneurship in Community Upliftment [4 Marks]:** Innovative entrepreneurs identify unmet local needs—such as solar repair workshops, township e-commerce couriers, hydroponic vegetable tunnels, or tutoring hubs—and organise scarce resources to launch sustainable small, medium, and micro enterprises (SMMEs) [2 marks]. First, growing SMMEs create direct and indirect **employment opportunities** for unemployed youth and women, transferring practical technical and financial literacy skills on the job while circulation of local wages boosts neighbouring retail shops [1 mark]. Second, entrepreneurs stimulate healthy market competition, widen consumer choice at affordable prices, and expand the local tax base through SARS compliance, enabling municipalities to reinvest in clinics, roads, and safer public spaces [1 mark].

To earn maximum distinction credit in CAPS EMS Paper 2, always label both *real flows* and *money flows* accurately between the Factor Market and Goods Market and illustrate entrepreneurship with concrete South African SMME examples [Total: 10 marks].`,
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
        explanation: `### Official DBE CAPS Mathematics Working [4 Marks]

To solve the quadratic equation **x² − 9x + 14 = 0** algebraically without the quadratic formula, first confirm that it is written in standard form ax² + bx + c = 0 with a = 1, b = −9, and c = +14 [1 mark]. Because the constant term c = +14 is positive while the middle coefficient b = −9 is negative, both factor integers must carry a negative sign so that their product remains positive (+14) and their sum equals −9 [1 mark]. Listing the negative factor pairs of 14 gives (−1, −14) which sums to −15, and **(−7, −2)** whose product is (−7) × (−2) = +14 and whose sum is (−7) + (−2) = −9.

Next, rewrite the trinomial as a product of two linear binomials: **(x − 7)(x − 2) = 0**, which can be verified immediately by expanding via FOIL: x² − 2x − 7x + 14 = x² − 9x + 14 [2 marks]. Applying the Zero Product Property—if a product of two real factors equals zero, at least one factor must equal zero—we set each bracket individually to zero: either x − 7 = 0 or x − 2 = 0, yielding the two distinct real roots **x = 7 or x = 2** [1 mark].

As an essential CAPS Paper 2 / algebra examination check, substitute both answers back into the original left-hand side expression: at x = 7, 7² − 9(7) + 14 = 49 − 63 + 14 = 0; at x = 2, 2² − 9(2) + 14 = 4 − 18 + 14 = 0 [Total: 4 marks]. Remember that omitting the "or" / losing a root—or accidentally picking signs (+7, +2)—is the single most common Grade 9 learner mistake.`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_sp_natsci_p2',
    subject: 'Natural Sciences',
    level: 'O-Level',
    paperCode: 'CAPS-SP-NS2',
    paperName: 'CAPS Senior Phase (Grades 8–9) Natural Sciences Paper 2 (Matter, Energy & Circuits)',
    paperType: 'Paper 2 (Structured Theory)',
    sourceFile: 'za_sp_natsci_p2.json',
    questions: [
      {
        id: 'za_sp_ns2_1',
        questionNumber: 1,
        questionText: '(a) Compare how adding extra light bulbs affects total current and bulb brightness in a series circuit versus a parallel circuit.\n(b) Write a balanced chemical equation for the neutralisation reaction between hydrochloric acid and sodium hydroxide, and state one practical agricultural use of neutralisation in South Africa. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE CAPS Natural Sciences Marking Guide [10 Marks]

**(a) Series vs Parallel Circuits [6 Marks]:** In a **series circuit**, electric charges have only **one continuous pathway** to flow around from the cell terminals through every component [1 mark]. Consequently, current is identical at every point in the loop, and adding a second identical light bulb increases total circuit resistance (R_total = R₁ + R₂), which reduces the total current drawn from the battery and splits the fixed battery voltage equally across both bulbs—making each bulb shine noticeably **dimmer**, and causing every bulb to extinguish immediately if one filament breaks [2 marks]. By contrast, in a **parallel circuit**, components sit on separate independent branches connected directly across the battery; every branch receives the **full cell potential difference**, adding extra parallel branches lowers total effective resistance (1 / R_total = 1 / R₁ + 1 / R₂), increases total current drawn from the battery (at the cost of faster cell depletion), keeps every bulb shining at **full normal brightness**, and leaves working branches illuminated if one branch opens [3 marks].

**(b) Acid–Base Neutralisation & Agricultural Application [4 Marks]:** Neutralisation occurs when an acidic solution reacts quantitatively with a basic/alkaline compound to form a neutral ionic **salt** and liquid **water** [1 mark]. For hydrochloric acid reacting with sodium hydroxide, equal molar proportions produce sodium chloride and water: **HCl + NaOH → NaCl + H₂O**, where one hydrogen atom, one chlorine atom, one sodium atom, and one oxygen atom balance identically on both sides of the reaction arrow [2 marks].

In South African grain and deciduous fruit farming (such as acid sandy soils in the Western Cape or Mpumalanga Highveld after heavy rainfall or ammonium fertiliser use), agronomists apply powdered **agricultural lime (calcium carbonate, CaCO₃)** or slaked lime to **neutralise overly acidic soils** (raising pH toward the optimal 6.0–6.8 band), unlocking essential phosphorus and calcium uptake and preventing toxic aluminium solubility around crop roots [1 mark]. Always show complete state balance and link electric-circuit resistance directly to household wiring safety in CAPS Paper 2 answers [Total: 10 marks].`,
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
        explanation: `### Official NSC Physical Sciences Paper 1 Marking Guideline [4 Marks]

To determine the post-collision velocity of the coupled vehicles, apply the **Principle of Conservation of Linear Momentum**, which states that in an **isolated system** (where no net external horizontal forces such as road friction act on the colliding vehicles during the brief impact), the total linear momentum before collision equals the total linear momentum immediately after collision: Σp_i = Σp_f [1 mark]. Choose **east as the positive sign direction** so that every vector quantity carries an explicit directional sign throughout the calculation.

Substituting the given data—car mass m₁ = 1,200 kg moving at initial velocity v₁i = +20 m·s⁻¹, truck mass m₂ = 2,800 kg initially stationary at v₂i = 0 m·s⁻¹, and combined final mass (m₁ + m₂) = 4,000 kg moving at common velocity v_f—we set up the equation: (1,200)(+20) + (2,800)(0) = (1,200 + 2,800) × v_f [2 marks]. Simplifying the left-hand side yields an initial system momentum of +24,000 kg·m·s⁻¹; setting 24,000 = 4,000 v_f and dividing both sides by 4,000 gives **v_f = +6.0 m·s⁻¹** [1 mark].

Because velocity is a vector quantity, NSC examiners require **magnitude, correct SI unit, and explicit direction**: therefore the combined wreckage moves at **6 m·s⁻¹ east**. Note also that although momentum is conserved, this completely inelastic collision converts part of the initial kinetic energy (240 kJ before vs 72 kJ after) into heat, sound, and permanent metal deformation, meaning kinetic energy is *not* conserved [Total: 4 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_phy_2',
        questionNumber: 2,
        questionText: 'An ambulance siren emits sound of frequency 750 Hz while moving at 25 m·s⁻¹ toward a stationary listener in Pretoria (speed of sound in air = 340 m·s⁻¹). Calculate the frequency heard by the listener. [4 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official NSC Doppler Effect Working Guideline [4 Marks]

The **Doppler Effect** is the apparent change in observed frequency (or pitch) of a wave detected by a listener when there is relative motion between the wave source and the observer [1 mark]. As the ambulance approaches the stationary listener at 25 m·s⁻¹, each successive wavefront is emitted slightly closer to the listener than the previous crest, physically **compressing the wavelength** ahead of the siren while the speed of sound in air stays constant at v = 340 m·s⁻¹; hence the stationary listener intercepts more wavefronts per second and hears a **higher pitch** than 750 Hz.

Begin explicitly with the DBE NSC Information Sheet formula: $f_L = \\left(\\frac{v \\pm v_L}{v \\mp v_s}\\right) f_s$ [1 mark]. Since the listener is stationary (v_L = 0) and the source moves *toward* the listener, subtract v_s in the denominator so the ratio exceeds 1: $f_L = \\left(\\frac{340}{340 - 25}\\right) \\times 750$ [2 marks]. Evaluating the denominator gives 340 − 25 = 315 m·s⁻¹, so f_L = (340 / 315) × 750 = 1.079365 × 750 = **809.52 Hz** [1 mark].

Examiners deduct formula marks immediately if you alter the sign inside the standard formula without first writing the base template or if you accidentally add v_s in the denominator (which would correspond to a siren moving *away*, yielding 698.63 Hz < 750 Hz). Always perform a quick sanity check at the end: *approaching source → heard frequency MUST exceed emitted source frequency* (809.52 Hz > 750 Hz) [Total: 4 marks].`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_physical_sciences_p2',
    subject: 'Physical Sciences',
    level: 'A-Level',
    paperCode: 'NSC-PHY-P2',
    paperName: 'NSC Matric Grade 12 Physical Sciences Paper 2 (Chemistry)',
    paperType: 'Paper 2 (Organic Chemistry, Equilibrium & Electrochemistry)',
    sourceFile: 'za_nsc_physical_sciences_p2.json',
    questions: [
      {
        id: 'za_nsc_phy2_1',
        questionNumber: 1,
        questionText: '(a) Write the IUPAC name and balanced equation (using condensed structural formulae) for preparing ethyl ethanoate from an alcohol and a carboxylic acid, naming the catalyst required.\n(b) Using Le Chatelier’s Principle, explain how increasing pressure and removing water affects yield in the Haber Process: N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH < 0. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC Physical Sciences Paper 2 (Chemistry) Marking Guide [10 Marks]

**(a) Esterification & IUPAC Nomenclature [5 Marks]:** An ester is synthesised by **esterification** (a condensation reaction) between a primary alcohol and a carboxylic acid in the presence of a few drops of **concentrated sulfuric acid (H₂SO₄)**, which acts as both a **catalyst** (lowering activation energy) and a **dehydrating agent** (absorbing water to shift equilibrium forward) under gentle water-bath heating [2 marks]. To make **ethyl ethanoate** (an ester with a fruity pear aroma), react **ethanol** (CH₃CH₂OH) with **ethanoic acid** (CH₃COOH): $CH_3COOH + CH_3CH_2OH \\xrightarrow{\\text{conc. } H_2SO_4, \\Delta} CH_3COOCH_2CH_3 + H_2O$ [3 marks]. Notice the IUPAC naming convention required by NSC markers: the *first word* ("ethyl") always derives from the alcohol donating the single-bonded alkyl chain, whereas the *second word* ("ethanoate") stems from the carboxylic acid carrying the C=O carbonyl group.

**(b) Le Chatelier’s Principle in the Haber Process [5 Marks]:** **Le Chatelier’s Principle** states that when the equilibrium in a closed system is disturbed, the system will re-instate a new equilibrium by favouring the reaction that opposes the disturbance [1 mark]. Looking at gaseous stoichiometry in N₂(g) + 3H₂(g) ⇌ 2NH₃(g), the reactants side contains **4 moles of gas** (1 + 3) whereas the product side contains only **2 moles of gas**; therefore, **increasing pressure** favours the **forward reaction** because it produces fewer gas moles and reduces total system pressure, significantly increasing ammonia (NH₃) yield [2 marks].

Likewise, if ammonia gas is continuously liquefied and removed from the reactor (or in equilibrium systems where a product is removed), the concentration of the product drops; according to Le Chatelier’s Principle, the system opposes this reduction by accelerating the **forward reaction**, shifting the equilibrium to the right to replenish NH₃ [2 marks]. Remember in NSC Chemistry Paper 2: stating *"equilibrium shifts right"* alone earns zero reasoning marks unless you explicitly identify *fewer gas moles* or *opposing the stress* [Total: 10 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_phy2_2',
        questionNumber: 2,
        questionText: 'A standard galvanic cell is constructed using a Zn/Zn²⁺ half-cell (E° = −0.76 V) and a Cu/Cu²⁺ half-cell (E° = +0.34 V). Calculate the standard cell EMF, write the net ionic equation, and explain two essential functions of the salt bridge. [8 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC Electrochemistry Paper 2 Marking Guide [8 Marks]

Because the copper half-cell has the more positive standard reduction potential (E° = +0.34 V > −0.76 V), **Cu²⁺ ions are the stronger oxidising agent** and undergo **reduction at the cathode (+)**, while **zinc metal (Zn) is the stronger reducing agent** and undergoes **oxidation at the anode (−)** ("AN OX / RED CAT") [2 marks]. Using the official NSC formula **E°_cell = E°_cathode − E°_anode**, substitute E°_cathode = +0.34 V and E°_anode = −0.76 V carefully with brackets: E°_cell = (+0.34) − (−0.76) = **+1.10 V**; because E°_cell > 0, the redox reaction is spontaneous under standard conditions (1 mol·dm⁻³ electrolytes, 25 °C / 298 K) [2 marks].

Writing and balancing the two half-reactions gives oxidation at the zinc anode: Zn(s) → Zn²⁺(aq) + 2e⁻, and reduction at the copper cathode: Cu²⁺(aq) + 2e⁻ → Cu(s); since both half-reactions already transfer 2 electrons, summing them directly yields the overall net ionic equation (excluding spectator NO₃⁻ or SO₄²⁻ ions): **Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)** [2 marks]. Visually over time, the zinc electrode loses mass as Zn oxidises while the copper cathode gains pinkish-brown solid copper deposits and the blue Cu²⁺ solution fades.

Finally, a **salt bridge** (soaked in unreactive aqueous KNO₃ or KCl) performs two indispensable roles to keep current flowing [2 marks]: first, it **completes the internal electrical circuit** between the two separate beakers; second, it **maintains electrical neutrality** in both electrolytes by allowing spectator anions (NO₃⁻) to migrate toward the anode compartment to balance newly formed Zn²⁺ ions and cations (K⁺) to migrate toward the cathode compartment to replace consumed Cu²⁺ ions [Total: 8 marks].`,
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
        explanation: `### Official DBE NSC Life Sciences Paper 2 Answer & Explanation

The correct answer is **B (Taung Child, Mrs Ples, Little Foot, *Australopithecus sediba* and *Homo naledi*)**. South Africa hosts the **Cradle of Humankind** UNESCO World Heritage Site (Sterkfontein, Swartkrans, Kromdraai, Malapa, and Rising Star Caves in Gauteng) alongside the **Taung** limestone quarry in North West Province, forming one of the richest archives of early hominin evolution anywhere on Earth. Discovered by Raymond Dart in 1924, the **Taung Child** (*Australopithecus africanus*) proved Darwin’s prediction that Africa—not Europe or Asia—was the evolutionary cradle of the human lineage.

Subsequent landmark South African finds refined the entire transitional fossil tree connecting ape-like ancestors to modern *Homo sapiens*: Robert Broom discovered **Mrs Ples** (*A. africanus*) at Sterkfontein in 1947, Ron Clarke excavated the nearly complete **Little Foot** skeleton, Lee Berger’s teams uncovered the mosaic transitional species ***Australopithecus sediba*** at Malapa (2008) and ***Homo naledi*** inside Rising Star Cave’s Dinaledi Chamber. Together with East African discoveries such as *Ardipithecus* and Lucy (*A. afarensis*), these fossils demonstrate progressively larger brain volumes, reduced prognathism (flatter faces), smaller canines, and a forward-positioned foramen magnum suited to habitual upright bipedalism.

By contrast, options A and C list archaic Eurasian hominins (*Homo neanderthalensis*, *Homo erectus* specimens like Java Man and Peking Man, and Siberian Denisovans) which evolved later *outside* Africa after earlier *Homo* populations migrated northward, while option D refers to Mesozoic reptiles unrelated to primate evolution. In DBE NSC Life Sciences Paper 2 Section A, remember that full support for the Out of Africa hypothesis combines **fossil chronology** with **mitochondrial DNA (mtDNA)** and **Y-chromosome** diversity showing the deepest genetic roots in Africa.`,
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_ls_2',
        questionNumber: 2,
        questionText: 'Describe the role of transcription and translation during protein synthesis in a eukaryotic cell. [6 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC Life Sciences Paper 2 Marking Guide [6 Marks]

Protein synthesis converts coded genetic instructions stored on chromosomal DNA inside the cell nucleus into folded functional proteins in two tightly coordinated stages: **transcription** and **translation** [1 mark]. During **transcription** inside the **nucleus**, a specific gene segment of the double-stranded DNA helix **unwinds and unzips** as the enzyme RNA polymerase breaks weak hydrogen bonds between complementary nitrogenous base pairs [1 mark]. Only one exposed strand acts as a **DNA template**, attracting free **RNA nucleotides** from the nucleoplasm that bind strictly by complementary base pairing—**Adenine (DNA) pairs with Uracil (RNA)**, Thymine pairs with Adenine, and Cytosine pairs with Guanine—forming a single-stranded **messenger RNA (mRNA)** molecule containing sequential base triplets known as **codons** before peeling off and exiting through a **nuclear pore** into the cytoplasm [2 marks].

During **translation** in the **cytoplasm**, the mRNA strand attaches to a **ribosome**, which reads the genetic code sequentially one three-base **codon** at a time [1 mark]. Free **transfer RNA (tRNA)** molecules in the cytoplasm each carry one specific **amino acid** at their attachment site and expose a complementary three-base **anticodon** at the opposite loop; only the tRNA whose anticodon matches the exposed mRNA codon binds momentarily at the ribosome [1 mark]. As adjacent tRNA molecules align, neighbouring amino acids link via **peptide bonds** (in a condensation step), and the growing polypeptide chain folds into a unique three-dimensional enzyme or structural protein determined strictly by the original DNA nucleotide sequence [1 mark].

To earn all 6 marks in NSC Life Sciences Paper 2, examiners check closely for precise biological terms: *nucleus, unwinds/unzips, free RNA nucleotides, mRNA codon, nuclear pore, ribosome, tRNA anticodon,* and *peptide bonds* [Total: 6 marks]. Do not confuse DNA replication (which uses thymine and duplicates the entire chromosome) with transcription (which substitutes uracil and copies only one gene onto mRNA).`,
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_ls_3',
        questionNumber: 3,
        questionText: 'Explain three lines of scientific evidence collected in South Africa that support the "Out of Africa" hypothesis of modern human evolution, and describe three skeletal adaptations for habitual bipedalism. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC Life Sciences Paper 2 Marking Guide [10 Marks]

**Scientific Evidence for the "Out of Africa" Hypothesis [5 Marks]:** The "Out of Africa" hypothesis states that modern *Homo sapiens* originated in Africa roughly 200,000–300,000 years ago and subsequently migrated outward to populate Eurasia, Oceania, and the Americas [1 mark]. Three powerful lines of scientific proof support this conclusion: first, **fossil evidence** demonstrates that the oldest and most complete sequence of transitional hominin species occurs exclusively in Africa, spanning South Africa’s **Cradle of Humankind** and **Taung** (*Australopithecus africanus* — Taung Child, Mrs Ples, Little Foot; *A. sediba*; *Homo naledi*) alongside older *Homo habilis*, *Homo erectus*, and early *Homo sapiens* fossils in East and Southern Africa (such as Klasies River and Blombos Cave) [2 marks]. Second, **mitochondrial DNA (mtDNA)** inherited exclusively through the maternal line reveals the highest genetic diversity and oldest shared ancestral mutations among living African populations ("Mitochondrial Eve"), while **Y-chromosome DNA** likewise traces deepest paternal ancestry to Africa [2 marks].

**Skeletal Adaptations for Habitual Bipedalism [5 Marks]:** As early hominins shifted from quadrupedal knuckle-walking to upright two-legged **bipedalism** in open African savannahs, natural selection produced distinct anatomical shifts easily seen in South African fossils [1 mark]. First, the **foramen magnum** (the opening at the base of the skull where the spinal cord exits) migrated **forward into a central position** directly beneath the cranium rather than at the back, balancing the head effortlessly atop a vertical spine [1.5 marks]. Second, the human **vertebral column developed an S-shaped curvature** (rather than a chimpanzee’s C-shape) to absorb vertical shock and maintain the body’s centre of gravity directly above the feet [1.5 marks].

Third, the **pelvis became shorter, wider, and basin-shaped** to support abdominal organs and anchor strong gluteal muscles during single-leg stride support, accompanied by an **inward-angled femur (valgus knee)** and a **non-opposable big toe with a longitudinal foot arch** for efficient forward propulsion [1 mark]. On NSC Life Sciences Paper 2, always distinguish *fossil evidence* (*Ardipithecus / Australopithecus / Homo*) from *genetic evidence* (*mtDNA & Y-chromosome*) to lock in full marks [Total: 10 marks].`,
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
        explanation: `### Official DBE NSC First Principles Marking Guideline [5 Marks]

Determining a derivative from **first principles** requires applying the fundamental limit definition $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$, which computes the exact instantaneous gradient of the tangent line as the secant horizontal separation h shrinks toward zero [1 mark]. Never skip straight to the power rule (6x − 2) on this question, because NSC examiners award marks strictly for algebraic simplification before taking the limit; begin by substituting (x + h) cleanly into f(x): $f(x+h) = 3(x+h)^2 - 2(x+h) = 3(x^2 + 2xh + h^2) - 2x - 2h = 3x^2 + 6xh + 3h^2 - 2x - 2h$ [1 mark].

Next, subtract the original expression f(x) = 3x² − 2x in brackets to prevent sign errors on −(−2x): $f(x+h) - f(x) = (3x^2 + 6xh + 3h^2 - 2x - 2h) - (3x^2 - 2x) = 6xh + 3h^2 - 2h$ [1 mark]. Every surviving term must now contain at least one factor of h; factor out h in the numerator and cancel with h in the denominator (valid for h ≠ 0 inside the limit process): $\\frac{h(6x + 3h - 2)}{h} = 6x + 3h - 2$ [1 mark].

Finally, keep writing the notation lim(h → 0)(6x + 3h − 2) until the actual substitution step where h becomes 0: setting h = 0 eliminates the 3h term, leaving the exact derivative **$f'(x) = 6x - 2$** [1 mark]. Remember that dropping lim(h → 0) prematurely or writing = 6x + 3(0) − 2 without removing lim costs a notation penalty in NSC Matric Paper 1 [Total: 5 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_m_2',
        questionNumber: 2,
        questionText: 'For a quadratic sequence 3; 8; 17; 30; ..., determine the nth term T_n. [4 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC Quadratic Sequences Marking Guideline [4 Marks]

A **quadratic number pattern** follows the general second-degree formula **T_n = an² + bn + c** and is characterised by having a **constant second difference** [1 mark]. Begin by listing the original sequence (3; 8; 17; 30) and subtracting consecutive pairs to obtain the **first differences**: 8 − 3 = **5**, 17 − 8 = **9**, and 30 − 17 = **13** [1 mark]. Subtracting consecutive first differences gives the **second differences**: 9 − 5 = **4** and 13 − 9 = **4**, confirming a constant second difference of 4.

Using the three standard NSC coefficient identities derived by substituting n = 1, 2, 3 into T_n = an² + bn + c, solve top-to-bottom systematically [2 marks]: first, **2a = second difference**, so 2a = 4 gives **a = 2**. Second, **3a + b = first term of the first differences**, so 3(2) + b = 5 gives 6 + b = 5, hence **b = −1**. Third, **a + b + c = T₁ (first term of sequence)**, so 2 + (−1) + c = 3 gives 1 + c = 3, yielding **c = 2**.

Substituting a = 2, b = −1, and c = 2 back into the general formula produces the final nth term equation: **$T_n = 2n^2 - n + 2$** [1 mark]. Always verify your rule immediately against T₄: T₄ = 2(4)² − 4 + 2 = 32 − 4 + 2 = 30, which matches the given fourth term exactly [Total: 4 marks].`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_mathematics_p2',
    subject: 'Mathematics',
    level: 'A-Level',
    paperCode: 'NSC-MATH-P2',
    paperName: 'NSC Matric Grade 12 Mathematics Paper 2 (Euclidean Geometry & Trigonometry)',
    paperType: 'Paper 2 (Geometry, Analytical & Trig)',
    sourceFile: 'za_nsc_mathematics_p2.json',
    questions: [
      {
        id: 'za_nsc_m2_1',
        questionNumber: 1,
        questionText: '(a) Determine the centre and radius of the circle x² − 6x + y² + 4y − 12 = 0, and prove why the tangent at point P(6, 2) has gradient −3/4.\n(b) State the Tan-Chord Theorem and Proportionality Theorem as accepted in the DBE NSC Euclidean Geometry Examination Guidelines. [10 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC Mathematics Paper 2 Marking Guide [10 Marks]

**(a) Analytical Circle Geometry & Tangent Gradient [6 Marks]:** To rewrite the expanded circle equation **x² − 6x + y² + 4y = 12** into standard centre-radius form $(x - a)^2 + (y - b)^2 = r^2$, complete the square independently on both x and y by adding half the linear coefficient squared to each side: add (−6/2)² = 9 and (4/2)² = 4 to both left and right sides [2 marks]. This gives (x² − 6x + 9) + (y² + 4y + 4) = 12 + 9 + 4, which factors cleanly into **$(x - 3)^2 + (y + 2)^2 = 25$**; hence the circle centre is **M(3; −2)** and the radius is **r = √25 = 5 units** [2 marks].

Verify first that P(6; 2) lies on the circle: (6 − 3)² + (2 + 2)² = 3² + 4² = 9 + 16 = 25. Next, calculate the gradient of the radius MP joining M(3; −2) to the point of contact P(6; 2): $m_{\\text{rad}} = \\frac{2 - (-2)}{6 - 3} = \\frac{4}{3}$ [1 mark]. Because a **tangent to a circle is perpendicular to the radius** at the point of contact ($m_{\\text{rad}} \\times m_{\\text{tan}} = -1$), the tangent’s gradient is the negative reciprocal: **$m_{\\text{tan}} = -\\frac{3}{4}$** [1 mark].

**(b) Euclidean Geometry Accepted Reason Statements [4 Marks]:** Under DBE NSC Paper 2 rules, every geometric deduction must pair a statement with a valid approved reason [2 marks]. The **Tan-Chord Theorem** (*reason: "tan-chord theorem"*) proves that the **angle between a tangent to a circle and a chord drawn from the point of contact is equal to the angle in the alternate segment** [2 marks]. The **Proportionality Theorem** (*reason: "line ∥ one side of △"*) states that a **line drawn parallel to one side of a triangle divides the other two sides proportionally** (meaning $\\frac{AD}{DB} = \\frac{AE}{EC}$), which immediately implies equiangular similar triangles in Matric riders [Total: 10 marks].`,
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
        explanation: `### Official DBE NSC Company Accounting Marking Guideline [4 Marks]

Under the South African Companies Act and CAPS Grade 12 Accounting disclosure rules, when a public company repurchases its own ordinary shares above their weighted-average issue price, the total cash payout cannot simply be deducted from Ordinary Share Capital alone because that would distort the permanent contributed capital balance [1 mark]. Instead, the total repurchase price of 50,000 × R8.20 = R410,000 paid out of **Bank** (decreasing Assets by R410,000) is split strictly into two equity components: the **weighted-average value** and the **premium above average issue price**.

First, reduce the **Ordinary Share Capital** note at the exact average issue price per share: $50\\,000 \\times \\text{R}6.50 = \\mathbf{-\\text{R}325\\,000}$, leaving 750,000 shares in issue at an unchanged weighted-average price of R6.50 (closing Ordinary Share Capital balance = R4,875,000) [2 marks]. Second, calculate the excess premium paid per share above average price: R8.20 − R6.50 = R1.70 per share; multiply by the 50,000 shares bought back to charge **$50\\,000 \\times \\text{R}1.70 = \\mathbf{-\\text{R}85\\,000}$** directly against **Retained Income** [2 marks].

Notice that R325,000 + R85,000 equals the full R410,000 cash outflow from the Cash Flow Statement under *Financing Activities* ((410,000)). Remember in NSC Paper 1: forgetting to recalculate the average share price after previous new share issues, or charging the entire R410,000 to Ordinary Share Capital, is a classic error penalised by method marks [Total: 4 marks].`,
        answerConfidence: 'high'
      }
    ]
  },
  {
    id: 'za_nsc_accounting_p2',
    subject: 'Accounting',
    level: 'A-Level',
    paperCode: 'NSC-ACC-P2',
    paperName: 'NSC Matric Grade 12 Accounting Paper 2 (Cost Accounting, Budgets & VAT)',
    paperType: 'Paper 2 (Managerial Accounting)',
    sourceFile: 'za_nsc_accounting_p2.json',
    questions: [
      {
        id: 'za_nsc_acc2_1',
        questionNumber: 1,
        questionText: 'A Cape Town manufacturer sells handmade leather satchels at R650 each. Variable manufacturing and selling cost per satchel is R400, while total fixed factory overhead and administration costs equal R150,000. Calculate the Break-Even Point (BEP) in units and explain two strategies management can use to lower the BEP without sacrificing quality. [8 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC Accounting Paper 2 Marking Guide [8 Marks]

To calculate the **Break-Even Point (BEP)**—the minimum sales volume where Total Revenue equals Total Costs and net profit is exactly zero—apply the official CAPS formula: $\\text{BEP (units)} = \\frac{\\text{Total Fixed Costs}}{\\text{Selling Price per unit} - \\text{Variable Cost per unit}}$ [1 mark]. Begin by finding the **Contribution Margin per unit**, which is the net surplus each satchel contributes toward covering fixed overheads: R650 − R400 = **R250 per satchel** [1 mark]. Now divide Total Fixed Costs by the unit contribution margin: BEP = R150,000 ÷ R250 = **600 satchels** [2 marks]; every satchel sold *beyond* 600 units generates R250 in pure operating profit.

To strengthen profitability and **lower the Break-Even Point** below 600 units without compromising leather quality, management can pursue two practical operational strategies [2 marks]. First, **reduce Fixed Costs** (the numerator) without hurting workshop output by renegotiating factory warehouse leases, installing energy-efficient solar lighting to cut Eskom electricity charges, or automating repetitive administrative billing rather than employing idle temporary staff—lowering fixed expenses from R150,000 directly reduces required unit volume [1 mark].

Second, **expand the Contribution Margin per unit** (the denominator) by negotiating bulk volume discounts with South African tannery suppliers on raw hides (cutting direct material unit cost from R400 downward while preserving grade-A leather quality) or minimising material wastage/off-cuts during pattern cutting [1 mark]. On NSC Accounting Paper 2, always compare calculated BEP directly against *actual units produced and sold* in your comment to judge whether the enterprise achieved a healthy margin of safety [Total: 8 marks].`,
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
        explanation: `### Official DBE NSC History Paper 2 Essay Marking Guide [12 Marks]

Following the Sharpeville Massacre (1960), the banning of the ANC and PAC, and the imprisonment of Rivonia leaders on Robben Island in 1964, internal anti-Apartheid resistance entered a decade of severe repression known as the "silent sixties" [1 mark]. Into this vacuum stepped **Steve Bantu Biko** and fellow university activists who founded the **South African Students’ Organisation (SASO, 1968)** and the **Black People’s Convention (BPC, 1972)**, articulating the philosophy of **Black Consciousness (BC)** [2 marks]. Biko argued persuasively that the most potent weapon in the hands of the oppressor was the *mind of the oppressed*; therefore, Black South Africans (defined politically to include African, Coloured, and Indian people) needed psychological liberation, pride in indigenous African heritage, and independent self-help community clinics (*Zanempilo*)—summed up in the slogan **"Black man, you are on your own"** [3 marks].

Empowered by Black Consciousness pride, high school learners formed the **South African Students’ Movement (SASM)** and rejected the inferior **Bantu Education** system—culminating in a flashpoint when the Apartheid Department of Bantu Education decreed that **Afrikaans and English** must be used equally (50/50) as languages of instruction in secondary school Mathematics and Social Studies [2 marks]. On **16 June 1976**, approximately 20,000 Soweto learners led by **Tsietsi Mashinini** and the Soweto Students’ Representative Council (SSRC) marched peacefully from Naledi High toward Orlando Stadium; when apartheid police opened live ammunition fire—famously killing 12-year-old **Hector Pieterson**—peaceful protests exploded into months of nationwide student boycotts, worker stay-aways, and township uprisings [2 marks].

Strategically, **1976 transformed South African liberation politics irreversibly** [2 marks]. Although police killed hundreds of protesters and murdered Steve Biko in detention in September 1977, thousands of radicalised youth slipped into exile to swell the armed ranks of **uMkhonto we Sizwe (MK)** and **APLA**, global television broadcasts triggered UN arms embargoes and economic sanctions, and the remaining domestic activists reorganised into the massive 1980s grassroots coalition of the **United Democratic Front (UDF, 1983)** and **COSATU (1985)**—forcing the National Party government toward the 1990 unbannings and democratic freedom in 1994 [Total: 12 marks].`,
        answerConfidence: 'high'
      },
      {
        id: 'za_nsc_hist_2',
        questionNumber: 2,
        questionText: 'Critically evaluate why South Africa established the Truth and Reconciliation Commission (TRC) in 1995 rather than conducting Nuremberg-style criminal trials, and examine one major success and one criticism of its work. [12 Marks]',
        options: [],
        correctAnswer: null,
        explanation: `### Official DBE NSC History Paper 2 Essay Marking Guide [12 Marks]

When Nelson Mandela took office after the historic **27 April 1994** democratic elections following delicate CODESA and Multi-Party Negotiating Forum compromises, South Africa faced a profound dilemma over how to confront gross human rights abuses committed between 1960 and 1994 [2 marks]. Pursuing sweeping **Nuremberg-style criminal prosecutions** against Apartheid security forces and politicians carried the acute danger of provoking a right-wing military coup or violent civil war at a moment when the new GNU controlled a fragile state security apparatus, while blanket secret amnesty would betray victims’ families still searching for the graves of missing loved ones [2 marks]. Consequently, Parliament passed the **Promotion of National Unity and Reconciliation Act (1995)** establishing the **Truth and Reconciliation Commission (TRC)**, chaired by **Archbishop Desmond Tutu** and Deputy Chair Dr Alex Boraine, grounded in African ***Ubuntu*** restorative justice rather than retributive vengeance [2 marks].

Operating through three specialised bodies—the **Human Rights Violations Committee**, the **Amnesty Committee**, and the **Reparation and Rehabilitation Committee**—the TRC achieved a landmark success by **uncovering previously buried historical truths in open public hearings** [3 marks]. Unlike blanket impunity, conditional amnesty required applicants (from both state hit-squads like Vlakplaas under Eugene de Kock and liberation movements) to prove that an act was **politically motivated**, proportionate, and accompanied by **full, truthful public disclosure**, allowing families to locate unmarked graves, bury relatives with dignity, and build an undeniable historical archive preventing future denialism.

At the same time, historians and victims have voiced sharp **criticisms of the TRC’s mandate and aftermath** [3 marks]. Because its legal lens focused primarily on dramatic physical violations (abductions, torture, assassinations) rather than the **structural socio-economic crimes of Apartheid** (forced Group Areas removals, Migrant Labour exploitation, Bantu Education inequality), thousands of corporate and everyday beneficiaries escaped moral accountability, while promised **state financial reparations** arrived late and were modest—leaving many survivors convinced that reconciliation occurred without meaningful economic justice [Total: 12 marks].`,
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
