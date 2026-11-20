export interface SouthAfricaEncyclopediaEntry {
  id: string;
  subject: string;
  topic: string;
  content: string;
  keywords: string[];
  levels?: string[];
  suggestions?: string[];
}

export const SOUTH_AFRICA_ENCYCLOPEDIA_ENTRIES: SouthAfricaEncyclopediaEntry[] = [
  {
    id: 'za_overview_identity',
    subject: 'Social Sciences',
    topic: 'Republic of South Africa: Capitals, Flag, Coat of Arms, Anthem & National Symbols',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'south africa', 'republic of south africa', 'mzansi', 'pretoria', 'cape town', 'bloemfontein',
      'johannesburg', 'durban', 'three capitals', 'flag of south africa', 'coat of arms',
      'nkosi sikelel', 'national anthem', 'king protea', 'springbok', 'blue crane', 'rand', 'zar',
      'provinces of south africa', 'ke e xarra ke'
    ],
    content: `### Republic of South Africa: National Profile, Three Capitals & Symbols

**Direct Answer:** The **Republic of South Africa** is a constitutional multiparty democracy at the southern tip of Africa with **three capital cities**—**Pretoria** (Executive), **Cape Town** (Legislative), and **Bloemfontein** (Judicial)—and **nine provinces** under the **1996 Constitution**.

1. Core National Facts & Three Capitals:
- **Executive Capital:** **Pretoria** (Union Buildings, seat of the President and Cabinet, Gauteng).
- **Legislative Capital:** **Cape Town** (Parliament of South Africa — National Assembly & NCOP, Western Cape).
- **Judicial Capital:** **Bloemfontein** (Supreme Court of Appeal, Free State; **Constitutional Court** sits in **Johannesburg** on Constitution Hill).
- **Largest Economic Hub:** **Johannesburg** (*eGoli*, City of Gold); major ports include **Durban**, **Cape Town**, **Gqeberha (Port Elizabeth)**, and **Richards Bay**.
- **Official Currency:** **South African Rand (ZAR)**, subdivided into **100 Cents**.
- **Total Area & Time Zone:** **1,221,037 km²** | **SAST** (South African Standard Time, **UTC+2**) | Dialling Code: **+27** | Domain: **.za**.

2. National Flag (Adopted 27 April 1994, designed by Frederick Brownell):
- **Green Y-Shape (Pall):** Symbolises the convergence of diverse paths and unity moving forward together into the future.
- **Black, Yellow (Gold) & Green:** Reflect mineral/natural wealth and the historic liberation movement traditions.
- **Red, White & Blue:** Honour earlier South African constitutional history and European/Afrikaner heritage alongside peace (White) and ocean/sky.
- Officially, the Constitution stresses there is no single rigid colour dogma beyond unity across South Africa's diverse society.

3. Coat of Arms, Anthem & National Symbols:
- **National Motto (in |Xam San language):** ***"!ke e: /xarra //ke"*** — *"Diverse people unite"* (adopted Freedom Day, 27 April 2000).
- **Coat of Arms Features:** Secretary bird with rising sun, King Protea, spears & knobkierrie laid to rest, wheat ears, and Khoisan rock-art human figures greeting in unity.
- **National Anthem:** ***"Nkosi Sikelel' iAfrika"*** combined with ***"Die Stem van Suid-Afrika"***, sung across **five official languages** (isiXhosa, isiZulu, Sesotho, Afrikaans, English).
- **National Symbols:** Flower = **King Protea** (*Protea cynaroides*) | Animal = **Springbok** | Bird = **Blue Crane** | Fish = **Galjoen** | Tree = **Real Yellowwood**.`,
    suggestions: [
      'Who is the current President of South Africa and list all democratic Presidents since 1994?',
      'List all 9 provinces of South Africa and their capitals',
      'Explain the 1996 Constitution, Bill of Rights and Chapter 9 Institutions',
      'Explain the NSC Matric (Grade 12) pass requirements: Bachelor, Diploma & Higher Certificate'
    ]
  },
  {
    id: 'za_governance_presidents',
    subject: 'History',
    topic: 'Constitution (1996), Three Arms of State, Chapter 9 Institutions & Presidents Since 1994',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'president of south africa', 'cyril ramaphosa', 'paul mashatile', 'nelson mandela', 'thabo mbeki',
      'kgalema motlanthe', 'jacob zuma', 'gnu', 'government of national unity', '1996 constitution',
      'bill of rights', 'chapter 9', 'public protector', 'constitutional court', 'ncop', 'national assembly'
    ],
    content: `### Governance, Constitution (1996) & Democratic Presidents of South Africa

**Direct Answer:** South Africa is governed by the **1996 Constitution (Act 108 of 1996)**—the supreme law of the Republic—with power separated across Executive, Legislative, and Judicial branches plus independent **Chapter 9 Institutions**. Since May/June 2024, the **7th Administration** is led by President **Cyril Ramaphosa** under a multi-party **Government of National Unity (GNU)**.

1. Democratic Presidents of South Africa (1994 – Present):
1. **Nelson Rolihlahla Mandela (1994–1999):** First democratically elected President; championed national reconciliation, the Reconstruction and Development Programme (RDP), and adoption of the 1996 Constitution.
2. **Thabo Mvuyelwa Mbeki (1999–2008):** Second President; promoted the **African Renaissance**, NEPAD, African Union founding, and GEAR macroeconomic stabilisation.
3. **Kgalema Petrus Motlanthe (2008–2009):** Third President; ensured stable constitutional transition ahead of the 2009 general election.
4. **Jacob Gedleyihlekisa Zuma (2009–2018):** Fourth President; saw South Africa join **BRICS (2010)** and roll out large-scale antiretroviral treatment, alongside debates over state capture investigated by the Zondo Commission.
5. **Matamela Cyril Ramaphosa (2018–Present):** Fifth and current President; led constitutional coalition reforms, the Economic Reconstruction and Recovery Plan, Just Energy Transition, and heads the **Government of National Unity (GNU)** formed after the **May 2024 general election**, with **Paul Mashatile** as Deputy President.

2. Three Arms of Government & Separation of Powers:
- **Executive:** The **President** (Head of State and Head of Government, elected by the National Assembly), Deputy President, and Cabinet Ministers. Implements laws and manages state departments.
- **Legislature (Bicameral Parliament in Cape Town):**
  * **National Assembly (400 seats):** Directly elected via proportional representation (including national and regional lists) for 5-year terms; passes legislation and holds the Executive accountable.
  * **National Council of Provinces — NCOP (90 delegates, 10 per province):** Represents provincial and local interests in national law-making.
- **Judiciary:** Independent courts subject only to the Constitution: **Constitutional Court** (apex court on all constitutional & general matters), **Supreme Court of Appeal** (Bloemfontein), **High Courts**, and **Magistrates' Courts**.

3. Chapter 9 Institutions Supporting Constitutional Democracy:
- **Public Protector:** Investigates improper conduct in public administration.
- **South African Human Rights Commission (SAHRC):** Promotes respect for human rights in the Bill of Rights (Chapter 2).
- **Auditor-General of South Africa (AGSA):** Audits public-sector spending (local, provincial, national).
- **Electoral Commission (IEC):** Manages free and fair national, provincial, and municipal elections.
- **Commission for Gender Equality (CGE)** & **CRL Rights Commission**.`,
    suggestions: [
      'List all 9 provinces of South Africa, their capitals and major economic activities',
      'What happened at the 1960 Sharpeville Massacre and 1976 Soweto Uprising?',
      'Explain Mapungubwe Kingdom and the South African Mineral Revolution (1867–1886)',
      'Explain South African Ubuntu philosophy and the 12 official languages'
    ]
  },
  {
    id: 'za_history_precolonial_colonial',
    subject: 'History',
    topic: 'Pre-Colonial Kingdoms (Mapungubwe), Colonial Cape, Mfecane, Mineral Revolution & 1913 Land Act',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'mapungubwe', 'golden rhinoceros', 'shaka zulu', 'mfecane', 'difaqane', 'moshoeshoe',
      'jan van riebeeck', '1652', 'great trek', 'mineral revolution', 'kimberley', 'witwatersrand',
      'anglo-boer war', 'south african war', '1910 union', '1913 natives land act', 'sol plaatje', 'anc 1912'
    ],
    content: `### Pre-Colonial, Colonial & Mineral Revolution History of South Africa

**Direct Answer:** Long before European arrival in 1652, South Africa hosted sophisticated societies including **San hunter-gatherers**, **Khoekhoe herders**, and Iron-Age states like the **Kingdom of Mapungubwe (c. 1075–1220)**. Subsequent Dutch and British colonisation, the **Mfecane**, the **1867–1886 Mineral Revolution**, and the **1913 Natives Land Act** shaped modern South Africa.

1. Pre-Colonial Civilisations & Trade:
- **San & Khoekhoe:** Earliest inhabitants; San left thousands of rock-art panels (e.g. **uKhahlamba-Drakensberg**), while Khoekhoe practised seasonal pastoralism across the Cape.
- **Kingdom of Mapungubwe (Limpopo/Shashe confluence, c. 1075–1220):** Southern Africa's first stratified state; traded gold and ivory via the Limpopo River to Indian Ocean Swahili ports (Kilwa/Sofala) for glass beads and Chinese porcelain. Iconic artefact: the **Golden Rhinoceros** (*UNESCO World Heritage Site*).
- **Thulamela & Tswana/Nguni Polities:** Stone-walled settlements, iron smelting, and cattle-based kingdoms across KwaZulu-Natal, Highveld, and Limpopo.

2. Colonial Cape, Mfecane & The Great Trek:
- **1652 (VOC Cape):** Jan van Riebeeck established a Dutch East India Company (VOC) refreshment station at Table Bay, leading to colonial expansion, frontier wars (Xhosa Wars along the Fish River), and **enslaved labour** brought from Madagascar, East Africa, India, and the Indonesian archipelago (forming roots of Cape Malay / Coloured heritage).
- **1806:** Britain permanently annexed the Cape Colony; abolished slave trade (1807) and slavery (1834).
- **1810s–1830s (Mfecane / Difaqane):** Rapid state consolidation and upheaval across southern Africa: **King Shaka kaSenzangakhona** built the disciplined Zulu Kingdom, while **King Moshoeshoe I** fortified Thaba Bosiu (Basotho) and Mzilikazi founded the Ndebele state.
- **1835–1840s (The Great Trek):** Dutch-speaking *Voortrekkers* migrated inland, establishing the Boer republics of the **Transvaal (ZAR)** and **Orange Free State** after conflicts including Blood River (1838).

3. The Mineral Revolution, South African War & Union (1867–1913):
- **1867 (Kimberley Diamonds)** & **1886 (Witwatersrand Gold):** Transformed South Africa from an agrarian society into an industrial mining economy reliant on **migrant labour**, **pass laws**, closed mining compounds, and foreign capital (Randlords).
- **1899–1902 (South African / Anglo-Boer War):** Britain fought the ZAR and Orange Free State for supremacy over goldfields; ended by the **Treaty of Vereeniging (1902)**, causing immense suffering in British concentration camps and African camps alike.
- **1910 (Union of South Africa):** Created a white-dominated self-governing dominion excluding black citizens from political power.
- **8 January 1912:** **South African Native National Congress (SANNC, later ANC)** founded in Bloemfontein by John Dube, Pixley ka Isaka Seme, and **Sol Plaatje** to defend African rights.
- **1913 Natives Land Act:** Restricted African land ownership/occupation to initially ~7% (later ~13%) of South Africa's land, devastating independent black farmers.`,
    suggestions: [
      'Explain Apartheid laws, Sharpeville 1960, Soweto 1976, CODESA and the TRC',
      'Explain the impact of the 1913 Natives Land Act on South African society',
      'What is the significance of Mapungubwe in South African History?',
      'Who is the current President of South Africa?'
    ]
  },
  {
    id: 'za_apartheid_freedom_struggle',
    subject: 'History',
    topic: 'Apartheid (1948–1994), Mass Resistance, Soweto 1976, CODESA & TRC',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'apartheid', '1948', 'group areas act', 'bantu education', 'sharpeville', '1960',
      'rivonia trial', 'soweto uprising', '16 june 1976', 'hector pieterson', 'steve biko',
      'black consciousness', 'udf', 'codesa', '27 april 1994', 'trc', 'desmond tutu', 'freedom charter'
    ],
    content: `### Apartheid, Liberation Struggle, 1994 Democracy & Truth and Reconciliation Commission

**Direct Answer:** **Apartheid** (1948–1994) institutionalised racial segregation and minority rule under the National Party. Decades of internal mass resistance (ANC, PAC, BCM/SASO, UDF, COSATU), international sanctions, and negotiations led to the **27 April 1994** non-racial democratic election and the **Truth and Reconciliation Commission (TRC)**.

1. Pillars of Apartheid Legislation (from 1948):
- **Population Registration Act (1950):** Classified all South Africans by race.
- **Group Areas Act (1950):** Forced racial removals (e.g. **Sophiatown**, **District Six** in Cape Town, **Cato Manor**).
- **Bantu Education Act (1953):** Designed an inferior curriculum to limit African youth to manual/semi-skilled labour.
- **Pass Laws & Bantustans (Homelands):** Controlled urban movement and stripped black South Africans of South African citizenship.

2. Turning Points in the Liberation Struggle:
- **1952 Defiance Campaign & 1955 Freedom Charter (Kliptown):** *"South Africa belongs to all who live in it, black and white."*
- **21 March 1960 (Sharpeville Massacre):** Police opened fire on peaceful PAC anti-pass protesters led by Robert Sobukwe (69 killed); ANC & PAC banned (commemorated today as **Human Rights Day**).
- **1963–1964 Rivonia Trial:** Nelson Mandela, Walter Sisulu, Govan Mbeki, Ahmed Kathrada, Denis Goldberg and comrades sentenced to life imprisonment on **Robben Island**; Mandela's *"I am Prepared to Die"* speech became a global beacon.
- **16 June 1976 (Soweto Uprising):** High-school students protested against forced **Afrikaans** medium of instruction under Bantu Education; **Hector Pieterson** and **Hastings Ndlovu** were among the first slain (**Youth Day**).
- **Steve Biko & Black Consciousness Movement (BCM):** Emphasised psychological liberation (*"Black man, you are on your own"*, *SASO*); Biko died in police detention in September 1977.
- **1980s Mass Mobilisation:** **United Democratic Front (UDF, 1983)**, **COSATU (1985)**, township rent/school boycotts, and global financial/sports sanctions made apartheid ungovernable.

3. Transition to Democracy & Nation-Building (1990–1996):
- **2–11 February 1990:** President F.W. de Klerk unbanned ANC, PAC, and SACP; **Nelson Mandela released** from Victor Verster Prison.
- **1991–1993 (CODESA & Multiparty Negotiations):** Overcame political violence (Boipatong, Bisho, Chris Hani assassination) to agree on the Interim Constitution and sunset clauses.
- **27 April 1994:** First universal non-racial democratic election (**Freedom Day**); Nelson Mandela inaugurated as President on **10 May 1994**.
- **Truth and Reconciliation Commission (TRC, 1996–1998):** Chaired by **Archbishop Desmond Tutu** under restorative justice—victims testified publicly and perpetrators could apply for amnesty upon *full disclosure* of politically motivated crimes.`,
    suggestions: [
      'Compare the roles of Steve Biko and the UDF in resisting Apartheid',
      'Evaluate how the TRC promoted restorative rather than retributive justice',
      'What happened on 21 March 1960 and 16 June 1976?',
      'Explain South African Constitutional Court and Bill of Rights'
    ]
  },
  {
    id: 'za_geography_provinces',
    subject: 'Geography',
    topic: '9 Provinces of South Africa, Capitals, Physical Relief, Biomes & Climate Regions',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      '9 provinces', 'nine provinces', 'gauteng', 'western cape', 'kwazulu-natal', 'eastern cape',
      'free state', 'limpopo', 'mpumalanga', 'north west', 'northern cape', 'drakensberg',
      'highveld', 'orange river', 'benguela current', 'agulhas current', 'fynbos', 'mediterranean climate'
    ],
    content: `### Physical & Human Geography of South Africa: 9 Provinces, Relief & Climate

**Direct Answer:** South Africa spans **9 provinces** across a dramatic **Great Escarpment** rising from narrow coastal plains to the interior **Highveld plateau**, flanked by two contrasting ocean currents: the **warm Agulhas Current** (east coast) and **cold Benguela Current** (west coast).

1. All 9 Provinces & Capitals:
1. **Gauteng** — Capital: **Johannesburg** (*Smallest in area, largest population & GDP; mining/finance/industry hub; Pretoria is also in Gauteng*).
2. **Western Cape** — Capital: **Cape Town** (*Mediterranean winter rainfall, Fynbos biome, tourism, wine/fruit, Parliament*).
3. **KwaZulu-Natal (KZN)** — Capital: **Pietermaritzburg** (*Largest port at Durban, subtropical sugar cane, uKhahlamba-Drakensberg*).
4. **Eastern Cape** — Capital: **Bhisho** (*Gqeberha automotive manufacturing, East London, Wild Coast*).
5. **Free State** — Capital: **Bloemfontein** (*Breadbasket / Maize Triangle, judicial capital, goldfields around Welkom*).
6. **Limpopo** — Capital: **Polokwane** (*Mapungubwe, platinum/chrome, Kruger northern gate, tropical fruit*).
7. **Mpumalanga** — Capital: **Mbombela** (*Lowveld, Kruger National Park, coal-fired power & forestry*).
8. **North West** — Capital: **Mahikeng** (*Platinum Group Metals around Rustenburg, Sun City, maize & cattle*).
9. **Northern Cape** — Capital: **Kimberley** (*Largest land area, smallest population; iron ore at Sishen, Kimberley Big Hole, Nama-Karoo, SKA astronomy at Carnarvon*).

2. Physical Relief, Rivers & Biomes:
- **Topography:** Coastal Plain → **Great Escarpment** (peaking at **uKhahlamba-Drakensberg**, >3,400 m) → **Interior Plateau (Highveld ~1,200–1,800 m)**.
- **Major Rivers:** **Orange (Gariep) River** & **Vaal** tributary (flows west to Atlantic), **Limpopo River** (flows east into Indian Ocean), and **Tugela (Thukela)** River.
- **Ocean Currents & Climate Contrast:**
  * **East Coast (Warm Agulhas Current):** Warm moist air → higher rainfall (**>800–1,000 mm/yr**) in KwaZulu-Natal.
  * **West Coast (Cold Benguela Current):** Cold stable air & upwelling → arid coast (**Namaqualand / Namib edge**, rich pelagic fishing).
  * **South-Western Cape:** **Winter rainfall (Mediterranean)** from mid-latitude cyclones shifting north in winter; **Highveld & East:** **Summer convectional/thunderstorm rainfall** when Kalahari high-pressure trough draws in moist Indian Ocean air.`,
    suggestions: [
      'Why does the Western Cape get winter rain while Gauteng gets summer rain?',
      'Explain South Africa’s Bushveld Igneous Complex, Witwatersrand gold and JSE economy',
      'What are the core sectors of each of South Africa’s 9 provinces?',
      'Explain Berg winds and Mid-Latitude Cyclones for CAPS Grade 12 Geography'
    ]
  },
  {
    id: 'za_economy_resources',
    subject: 'Economics',
    topic: 'South African Economy: Mining (Gold, PGMs), Agriculture, SARB, NDP 2030 & SADC',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'economy of south africa', 'platinum', 'bushveld igneous complex', 'witwatersrand',
      'jse', 'sarb', 'reserve bank', 'ndp 2030', 'eskom', 'brics', 'sacu', 'sadc', 'vat 15',
      'gdp south africa', 'maize triangle', 'agro-processing', 'mineral beneficiation'
    ],
    content: `### South African Economy: Sectors, Mineral Wealth, Monetary Policy & NDP 2030

**Direct Answer:** South Africa holds Africa's most industrialised financial and logistics economy, driven by **services & finance (JSE)**, **mining (world's largest Platinum Group Metals reserves)**, **manufacturing (automotive & agro-processing)**, and commercial **agriculture**. Macroeconomic stability is guarded by the independent **South African Reserve Bank (SARB)** using inflation targeting (3%–6%).

1. Key Productive Sectors:
- **Primary Sector (Mining & Agriculture):**
  * **Mining:** World leader in **Platinum Group Metals (PGMs — Bushveld Igneous Complex)**, chrome, vanadium, manganese, iron ore (Sishen), coal (Mpumalanga Highveld), diamonds, and historic **Witwatersrand Gold**.
  * **Agriculture:** Maize Triangle (Free State / North West / Mpumalanga), Western Cape wine & deciduous fruit exports, KZN sugar cane, citrus (Limpopo/Eastern Cape), beef & wool.
- **Secondary Sector (Manufacturing & Energy):** Automotive assembly (Gqeberha, East London, Rosslyn/Pretoria, Durban), steel/chemicals (**Sasol** coal-to-liquids), food/beverage processing, and electricity generation transitioning from coal to renewables under the **Just Energy Transition (JET)**.
- **Tertiary Sector (Largest GDP Contributor >65%):** Finance & banking (**Johannesburg Stock Exchange — JSE**, big commercial banks), ICT, tourism (Kruger, Table Mountain, Garden Route), retail, and logistics (**Transnet** ports & rail corridors).

2. Institutions, Tax & Development Strategy:
- **SARB (South African Reserve Bank):** Sets the **repo rate** to maintain CPI inflation within **3%–6%** and safeguards the **Rand (ZAR)**.
- **SARS (South African Revenue Service) & Fiscal Policy:** Collects Progressive Personal Income Tax (PAYE), Corporate Tax, and **15% VAT** (with zero-rated essential foodstuffs like brown bread, maize meal, milk, eggs, lentils) to fund infrastructure, education, healthcare, and social grants (**SASSA**).
- **National Development Plan (NDP 2030):** Aims to eliminate poverty and reduce inequality through job creation, infrastructure, green energy, and education.
- **Regional & Global Trade:** Anchors **SACU** (Southern African Customs Union), **SADC**, **AfCFTA**, and **BRICS+**.`,
    suggestions: [
      'How does the SARB use the repo rate to control inflation in South Africa?',
      'Explain South Africa’s 15% VAT, PAYE and Accounting statements for CAPS Grade 12',
      'Explain the PWV (Gauteng) Core Industrial Region for CAPS Geography',
      'Compare BRICS, SADC and SACU in South African trade'
    ]
  },
  {
    id: 'za_languages_ubuntu',
    subject: 'Life Orientation',
    topic: '12 Official Languages (Including SASL), Ubuntu Philosophy & UNESCO Heritage Sites',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      '12 official languages', 'official languages of south africa', 'sasl', 'sign language',
      'ubuntu', 'umuntu ngumuntu ngabantu', 'isizulu', 'isixhosa', 'afrikaans', 'sepedi',
      'unesco heritage south africa', 'robben island', 'cradle of humankind', 'sterkfontein'
    ],
    content: `### Cultural Heritage, Ubuntu & South Africa's 12 Official Languages

**Direct Answer:** South Africa is known as the *"Rainbow Nation"* for its rich diversity. Since July 2023 (18th Constitutional Amendment), South Africa recognises **12 official languages**—including **South African Sign Language (SASL)**—guided socially by the ethic of ***Ubuntu***.

1. The 12 Official Languages of South Africa:
- **Nguni Group:** **isiZulu** (most widely spoken home language), **isiXhosa**, **siSwati**, **isiNdebele**.
- **Sotho-Tswana Group:** **Sepedi (Sesotho sa Leboa)**, **Sesotho**, **Setswana**.
- **Germanic Languages:** **Afrikaans**, **English**.
- **Other African Languages:** **Xitsonga**, **Tshivenda**.
- **Visual-Spatial Language:** **South African Sign Language (SASL)** — officially added as the 12th official language in **2023** to ensure full accessibility for Deaf citizens.

2. The Philosophy of *Ubuntu*:
- Summarised by the Nguni proverb: ***"Umuntu ngumuntu ngabantu"*** (isiZulu/isiXhosa) / ***"Motho ke motho ka batho"*** (Sesotho/Setswana) — *"A person is a person through other people."*
- Pillars: **Compassion, reciprocity, human dignity (*isithunzi*), communal harmony, and restorative justice** (explicitly cited by South Africa's Constitutional Court in landmark cases such as *S v Makwanyane* abolishing the death penalty).

3. Major UNESCO World Heritage Sites in South Africa:
- **Cradle of Humankind** (Gauteng / North West — *Sterkfontein, Swartkrans, Rising Star* hominid fossils including *Mrs Ples*, *Little Foot*, *Homo naledi*).
- **Robben Island** (Western Cape — former prison of Nelson Mandela and struggle leaders).
- **Mapungubwe Cultural Landscape** (Limpopo).
- **Cape Floral Region Protected Areas** (Fynbos biodiversity hotspot).
- **uKhahlamba-Drakensberg Park** (KZN — peaks & San rock art).
- **iSimangaliso Wetland Park** (KZN), **Vredefort Dome** (Free State/North West — largest verified asteroid impact crater on Earth), **Richtersveld** (Northern Cape), and **Barberton Makhonjwa Mountains** (Mpumalanga — oldest preserved greenstone belt crust).`,
    suggestions: [
      'Teach me common isiZulu and Afrikaans greetings and exam grammar',
      'Explain the human evolution fossils found in the Cradle of Humankind',
      'What are the 12 official languages of South Africa?',
      'Explain Ubuntu in the 1996 Constitution and TRC'
    ]
  },
  {
    id: 'za_education_caps_nsc',
    subject: 'Life Orientation',
    topic: 'DBE CAPS Curriculum Phases, NSC Matric Pass Levels, IEB, Umalusi & NQF System',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'caps', 'dbe', 'nsc', 'matric', 'ieb', 'umalusi', 'nqf', 'saqa', 'tvet', 'nsfas',
      'bachelor pass', 'diploma pass', 'higher certificate pass', 'get phase', 'fet phase',
      'foundation phase', 'intermediate phase', 'senior phase', 'life orientation'
    ],
    content: `### South African Education System: DBE CAPS, NSC Matric & Umalusi Standards

**Direct Answer:** South Africa's school curriculum is governed by the **Curriculum and Assessment Policy Statement (CAPS)** under the **Department of Basic Education (DBE)** and quality-assured by **Umalusi** (alongside the independent **IEB** exam board), culminating in the **Grade 12 National Senior Certificate (NSC / Matric)**.

1. Official School Bands & CAPS Phases:
- **General Education & Training (GET — NQF Level 1, Compulsory Grades R–9):**
  * **Foundation Phase (Grades R–3):** Home Language, First Additional Language, Mathematics, Life Skills.
  * **Intermediate Phase (Grades 4–6):** HL, FAL, Mathematics, Natural Sciences & Technology, Social Sciences (History + Geography), Life Skills.
  * **Senior Phase (Grades 7–9):** 9 compulsory subjects — HL, FAL, Mathematics, Natural Sciences, Social Sciences, Economic & Management Sciences (EMS), Technology, Creative Arts, Life Orientation.
- **Further Education & Training (FET — NQF Levels 2–4, Grades 10–12):**
  * **7 Subjects Taken:** 4 compulsory (**Home Language**, **First Additional Language**, **Mathematics OR Mathematical Literacy**, **Life Orientation**) + **3 electives** (e.g., Physical Sciences, Life Sciences, Accounting, Economics, Business Studies, Geography, History, IT/CAT).

2. NSC Matric Achievement Rating Levels (Codes 1–7):
- **Level 7:** 80%–100% (Outstanding) | **Level 6:** 70%–79% (Meritorious) | **Level 5:** 60%–69% (Substantial)
- **Level 4:** 50%–59% (Adequate) | **Level 3:** 40%–49% (Moderate) | **Level 2:** 30%–39% (Elementary) | **Level 1:** 0%–29% (Not Achieved).

3. Official NSC Matric Pass Categories:
- **Bachelor's Degree Pass (University Exemption):** Home Language **≥40%**, at least **four** designated 20-credit subjects **≥50%** (excluding LO), two others **≥30%** (subject to min 6 of 7 passed).
- **Diploma Pass:** Home Language **≥40%**, three other 20-credit subjects **≥40%**, two others **≥30%**.
- **Higher Certificate Pass:** Home Language **≥40%**, two others **≥40%**, three others **≥30%** (max one fail).
- **Assessment Weighting:** Usually **25% School-Based Assessment (SBA)** + **75% External November NSC Examination** (Life Orientation is 100% internally assessed & externally moderated).`,
    suggestions: [
      'What percentage do I need in Grade 12 NSC Matric to get a Bachelor pass?',
      'Explain the difference between Mathematics and Mathematical Literacy in FET',
      'What subjects are required in CAPS Senior Phase (Grades 8–9)?',
      'Explain South African Constitutional Law and NQF Levels 5–10'
    ]
  }
];
