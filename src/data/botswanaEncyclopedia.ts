export interface BotswanaEncyclopediaEntry {
  id: string;
  subject: string;
  topic: string;
  content: string;
  keywords: string[];
  levels?: string[];
  suggestions?: string[];
}

export const BOTSWANA_ENCYCLOPEDIA_ENTRIES: BotswanaEncyclopediaEntry[] = [
  {
    id: 'bw_overview_identity',
    subject: 'Social Studies',
    topic: 'Republic of Botswana: National Identity, Coat of Arms, Flag & Key Facts',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'botswana', 'republic of botswana', 'bechuanaland', 'gaborone', 'francistown',
      'pula', 'thebe', 'bwp', 'flag of botswana', 'coat of arms', 'fatshe leno la rona',
      'national anthem', 'motsete', 'motto', 'vision 2036', 'area of botswana', 'sadc headquarters'
    ],
    content: `### Republic of Botswana: National Profile, Symbols & Identity

**Direct Answer:** The **Republic of Botswana** (*Lefatshe la Botswana*) is a stable, landlocked democratic nation in Southern Africa that attained independence from British Protectorate rule (*Bechuanaland Protectorate*) on **30 September 1966**, with **Gaborone** as its capital city.

1. Core National Facts:
- **Official Name:** Republic of Botswana.
- **Capital City:** **Gaborone** (also hosts the **SADC Headquarters**).
- **Second Largest City & Northern Hub:** **Francistown** (historically Nyangabgwe). Other major centres: **Maun** (tourism gateway to the Okavango), **Lobatse** (meat-processing & judicial hub), **Selebi-Phikwe**, **Palapye**, **Serowe**, **Molepolole**, **Kanye**, **Mochudi**, **Kasane**, **Jwaneng**, and **Orapa**.
- **Official Currency:** **Botswana Pula (BWP)**, subdivided into **100 Thebe** (*Pula* means "rain" / "blessing"; *Thebe* means "shield").
- **National Motto:** **"Pula!"** (Rain / Let there be rain — symbolising life, prosperity, and peace in a semi-arid climate).
- **Total Land Area:** **581,730 km²** (8th largest in Southern/Central/East Africa region; roughly 70% covered by the Kalahari Basin).
- **Time Zone & Codes:** Central Africa Time (**CAT**, UTC+2) | Dialling Code: **+267** | Domain: **.bw**.
- **National Development Guiding Vision:** **Vision 2036 — *"Achieving Prosperity for All"*** and **National Development Plan 12 (NDP 12)**.

2. The National Flag of Botswana (Adopted 30 September 1966):
- **Sky Blue (Top & Bottom):** Represents water (*Pula* / rain) and the endless sky upon which Botswana's agriculture, wildlife, and people depend.
- **Black Stripe (Centre):** Represents the indigenous African majority population and heritage.
- **White Fimbriations (Thin Stripes Bordering Black):** Symbolise racial harmony, peace, unity, and cooperation between all citizens (*Black and White stripes like the zebra*).

3. Coat of Arms & National Anthem:
- **Two Supporting Zebras:** Represent Botswana's wildlife heritage and racial harmony (matching the flag).
- **Three Wavy Blue Stripes:** Represent Botswana's reliance on scarce water resources (*Okavango, Chobe, Limpopo, Boteti*).
- **Three Cogwheels (Gears):** Symbolise industry, mining, and modern economic development.
- **Bull's Head & Sorghum Stalk:** Represent traditional pastoralism (beef cattle) and arable agriculture (*mabele* / sorghum).
- **Ivory Elephant Tusk & Scroll reading "PULA":** Wildlife conservation and national blessing.
- **National Anthem:** ***"Fatshe leno la rona"*** (*"Blessed Be This Noble Land"*), written and composed by **Dr Kgalemang Tumediso Motsete**.

4. Neighbouring Countries & Geographic Position:
Botswana is bordered by **South Africa** (south & south-east), **Namibia** (west & north along the Caprivi/Zambezi strip), **Zimbabwe** (north-east), and **Zambia** (north, meeting at the famous **Kazungula Bridge** across the Zambezi River).`,
    suggestions: [
      'Who is the current President of Botswana and list all former Presidents?',
      'Who were the Three Dikgosi and why did they travel to London in 1895?',
      'List all 10 districts of Botswana and their major towns',
      'How does Botswana’s economy depend on Debswana diamonds and diversification?'
    ]
  },
  {
    id: 'bw_presidents_governance',
    subject: 'Social Studies',
    topic: 'Governance, Constitution, All Presidents & Kgotla Democracy of Botswana',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'president of botswana', 'duma boko', 'seretse khama', 'ketumile masire', 'festus mogae',
      'ian khama', 'mokgweetsi masisi', 'ndaba gaolathe', 'udc', 'bdp', 'kgotla', 'ntlo ya dikgosi',
      'parliament of botswana', 'constitution of botswana', 'three arms of government', 'bogosi', 'dikgosi'
    ],
    content: `### Governance, Constitution & Political Leadership of Botswana

**Direct Answer:** Botswana is Africa's longest-standing multiparty constitutional democracy since independence in 1966. Power is divided among three independent branches of government under the **1966 Constitution of Botswana**, complemented by the traditional **Kgotla** consultative assembly and **Ntlo ya Dikgosi**.

1. Presidents of Botswana (1966 – Present Chronology):
1. **Sir Seretse Khama (1966–1980):** Founding President (BDP); led Botswana from Bechuanaland Protectorate to independence on 30 September 1966; negotiated 50–50 Debswana diamond partnership; enshrined non-racial democracy and rule of law. Sir Seretse Khama Day is celebrated every **1 July**.
2. **Sir Ketumile (Quett) Masire (1980–1998):** Second President; steered prudent macroeconomic reserve management (Pula Fund), infrastructure expansion, and universal primary/junior schooling.
3. **Festus Gontebanye Mogae (1998–2008):** Third President; led Botswana's decisive national HIV/AIDS response (*Masa* free ARV programme) and won the **2008 Mo Ibrahim Prize** for Achievement in African Leadership.
4. **Lt. Gen. Seretse Khama Ian Khama (2008–2018):** Fourth President; championed conservation, anti-poaching, poverty eradication hubs, and the *4Ds* (Democracy, Development, Dignity, Discipline).
5. **Dr Mokgweetsi Eric Keabetswe Masisi (2018–2024):** Fifth President; renegotiated higher diamond beneficiation/rough-sales allocations with De Beers and promoted the *Reset Agenda* & digital innovation.
6. **Advocate Duma Gideon Boko (Inaugurated 1 November 2024 – Present):** Sixth and current President of Botswana, leader of the **Umbrella for Democratic Change (UDC)** coalition, who won the October 2024 general election ending 58 years of uninterrupted BDP governance in a peaceful, celebrated democratic transfer of power, with **Ndaba Gaolathe** as Vice President and Minister of Finance.

2. Separation of Powers (Three Arms of Government):
- **The Executive:** Headed by the **President** (Head of State & Government), Vice President, and Cabinet Ministers drawn from Parliament. Formulates national policy and directs ministries.
- **The Legislature (Parliament of Botswana):**
  * **National Assembly:** Elected MPs (61 constituencies as updated for 2024, plus specially elected members, Attorney General ex-officio, and Speaker) that debate budgets and pass Acts of Parliament.
  * **Ntlo ya Dikgosi (House of Chiefs):** 35-member traditional advisory chamber representing Paramount Chiefs (*Dikgosi*) and regional elders on customary law, land, chieftainship (*Bogosi*), and cultural heritage.
- **The Judiciary:** Independent courts consisting of the **Court of Appeal** (highest court), **High Court** (Lobatse, Gaborone, Francistown, Maun), **Magistrates' Courts**, **Industrial Court**, and **Customary Courts** (*Makgotla*) administering statutory and Roman-Dutch / customary law.

3. Traditional *Kgotla* Participatory Democracy:
- The **Kgotla** is the traditional community meeting place presided over by the *Kgosi* (chief/headman), encapsulated by the Setswana proverb: ***"Mafoko a kgotla a mantle otlhe"*** (*Every view spoken at the kgotla is valuable*) and ***"Kgosi ke kgosi ka batho"*** (*A chief is a chief through the people*).
- Ministers, MPs, and civil servants consult citizens directly at the kgotla before rolling out national development plans.`,
    suggestions: [
      'Who were the Three Dikgosi and why did they go to London in 1895?',
      'Explain how the Kgotla system works alongside modern Parliament',
      'What are the key goals of Botswana Vision 2036?',
      'Explain Botswana’s Botho philosophy'
    ]
  },
  {
    id: 'bw_three_dikgosi_protectorate',
    subject: 'History',
    topic: 'Bechuanaland Protectorate (1885) & The Three Dikgosi Mission to London (1895)',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'three dikgosi', 'khama iii', 'sebele i', 'bathoen i', '1895', 'london',
      'bechuanaland protectorate', '1885', 'cecil rhodes', 'bsac', 'british south africa company',
      'joseph chamberlain', 'queen victoria', 'willoughby', 'three dikgosi monument', 'tati concession'
    ],
    content: `### History of Botswana: Bechuanaland Protectorate & The Three Dikgosi (1885–1895)

**Direct Answer:** In **1885**, Britain proclaimed **Bechuanaland Protectorate** over Tswana territories to block German expansion from South West Africa (Namibia) and Boer expansion from the Transvaal. When **Cecil John Rhodes' British South Africa Company (BSAC)** sought to annex the protectorate in **1895**, **three senior Dikgosi** travelled to London to successfully defend Botswana's land and autonomy.

1. Why Britain Declared the Bechuanaland Protectorate (1885):
- **Strategic "Road to the North" (Missionaries' Road):** Britain needed to keep open the trade and missionary corridor from the Cape to Central Africa.
- **Blocking Rival Powers:** Germany colonised South West Africa in 1884, while Boer republics (Stellaland and Goshen) threatened Tswana kingdoms (*Barolong*, *Batlhaping*).
- **Warren Expedition (1885):** Sir Charles Warren announced British protection north of the Molopo River with support from Batswana Dikgosi seeking arms and diplomatic protection against Boer raids.

2. The 1895 Three Dikgosi Mission to England:
- **The Threat:** Colonial Secretary **Joseph Chamberlain** planned to hand administrative control of Bechuanaland over to Cecil Rhodes' **BSAC** so Rhodes could build his Cape-to-Cairo railway and seize mineral/cattle lands (just as he had seized Mashonaland and Matabeleland).
- **The Three Dikgosi:**
  1. **Kgosi Khama III** of the **Bangwato**
  2. **Kgosi Sebele I** of the **Bakwena**
  3. **Kgosi Bathoen I** of the **Bangwaketse**
- **The Journey & Strategy (August–November 1895):** Accompanied by missionary interpreter **Rev. W.C. Willoughby**, the three chiefs toured Britain addressing packed public meetings, churches, temperance societies, and industrialists to mobilise British public sympathy before meeting Colonial Secretary **Joseph Chamberlain** and **Queen Victoria** at Windsor Castle.
- **The Outcome (November 1895 Agreement):**
  * The Dikgosi **successfully blocked BSAC takeover** of their core tribal territories (preserving land ownership under communal *morafe* control and banning liquor sales).
  * In exchange, the Dikgosi ceded only a narrow eastern strip of land along the border (the **Railway Strip**, including **Lobatse** and **Gaborone** blocks) for Rhodes to construct the Mafikeng–Bulawayo railway (completed 1897), while the British Crown retained direct Protectorate supervision rather than handing the nation to Rhodes' company or later South Africa.

3. Historical Significance (BEC Exam Key Points):
- Prevented Botswana from being incorporated into the **1910 Union of South Africa** and spared Batswana from apartheid Bantustan land dispossession.
- Honoured today by the **Three Dikgosi Monument** in Gaborone's Central Business District.`,
    suggestions: [
      'Outline the pre-colonial Tswana Merafe and the Battle of Dimawe (1852)',
      'How did Botswana achieve independence on 30 September 1966?',
      'Explain the impact of migrant labour and hut tax under the Protectorate',
      'What happened at the Seretse Khama marriage crisis (1948)?'
    ]
  },
  {
    id: 'bw_precolonial_history',
    subject: 'History',
    topic: 'Pre-Colonial Botswana: San/Basarwa, Toutswemogala, Tswana Merafe & Difaqane',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'precolonial botswana', 'tsodilo hills', 'san', 'basarwa', 'toutswemogala', 'toutswe',
      'mapungubwe', 'merafe', 'bangwato', 'bakwena', 'bangwaketse', 'bakgatla', 'balete',
      'batlokwa', 'barolong', 'batawana', 'bakalanga', 'sechele i', 'battle of dimawe', 'difaqane', 'mfecane'
    ],
    content: `### Pre-Colonial History & Peopling of Botswana

**Direct Answer:** Human habitation in Botswana stretches back over 100,000 years (evidenced at **Tsodilo Hills**). Pre-colonial history progressed from San (*Basarwa*) hunter-gatherers and Early Iron Age **Toutswemogala** cattle-gold chiefdoms to powerful Sotho-Tswana states (*Merafe*) who unified against the 1820s *Difaqane* disruptions and Boer expansion.

1. Early Inhabitants & Iron Age States:
- **San / Basarwa Communities:** Earliest inhabitants of the Kalahari and Ngamiland, renowned for tracking, botanical knowledge, and over 4,500 rock paintings at **Tsodilo Hills** (*"Mountain of the Gods"*, UNESCO World Heritage Site).
- **Bantu-Speaking Iron Age Chiefdoms (c. 700–1300 CE):**
  * **Toutswemogala (near Palapye):** Stratified cattle-herding civilisation (*Toutswe tradition*) trading ivory, ostrich eggshell beads, and gold into the Limpopo–Indian Ocean network (**Mapungubwe** & **Great Zimbabwe**).
  * **Bakalanga (Butua / Torwa / Rozvi northern belt):** Dry-stone monument builders (*Domboshaba* ruins in North-East District) culturally linked to the Zimbabwe plateau.

2. Emergence of the Tswana *Merafe* (States):
- Oral tradition traces the central Tswana royal houses to founding ancestor **Kgosi Masilo** and his sons **Malope** (giving rise to the senior **Bahurutshe**, and brothers **Kwena**, **Ngwato**, and **Ngwaketse** who split in the 17th–18th centuries).
- **The Eight Principal Tswana Merafe:** **Bakwena**, **Bangwato**, **Bangwaketse**, **Bakgatla**, **Balete**, **Batlokwa**, **Barolong**, and **Batawana** (who broke from Bangwato to settle Ngamiland/Maun). Other distinct communities include **Bakalanga**, **Bakgalagadi**, **Bayei**, **Hambukushu**, **Basubiya**, **Basarwa**, and **Ovaherero**.

3. *Difaqane* (1820s–1830s) & Battle of Dimawe (1852):
- **The Difaqane Wars:** Migrating groups displaced by Zulu expansion (**Makololo** under Sebetwane; **Ndebele** under Mzilikazi) raided Tswana towns (*Lentswe la Baratani* / Kolobeng). In response, surviving Tswana merafe adopted concentrated fortified hill-town settlements (*metse* like Shoshong & Kanye) and acquired firearms through Griqua/missionary trade.
- **Battle of Dimawe (August 1852):** **Kgosi Sechele I** of the Bakwena led a united Tswana coalition (Bakwena, Bangwaketse, Bakgatla ba ga Mmanaana) to repel a Boer commando led by Pretorius and Scholtz, safeguarding Tswana sovereignty along the western Transvaal border.`,
    suggestions: [
      'Why did the Three Dikgosi travel to London in 1895?',
      'Explain Botswana’s transition to Independence in 1966',
      'What were the causes and effects of the Difaqane on Batswana?'
    ]
  },
  {
    id: 'bw_independence_vision2036',
    subject: 'Development Studies',
    topic: 'Botswana Independence (1966), Diamond-Led Growth, Vision 2036 & NDP 12',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'independence 1966', '30 september 1966', 'seretse khama', 'orapa 1967', 'vision 2036',
      'vision 2016', 'ndp 12', 'national development plan', 'diversification', 'development studies',
      'middle income', 'pula fund', 'sovereign wealth', 'citizen economic empowerment'
    ],
    content: `### Botswana Since Independence (1966 – Present): Development Model & Vision 2036

**Direct Answer:** At independence on **30 September 1966**, Botswana was one of the 25 poorest countries on Earth with fewer than 12 km of paved road. Disciplined governance, anti-corruption institutions, the **1967 discovery of Orapa diamonds**, and strategic **National Development Plans (NDPs)** transformed Botswana into an upper-middle-income country.

1. Milestones on the Road to Independence (1960–1966):
- **1960:** Formation of **Bechuanaland People's Party (BPP)** by **Kgalemang Motsete**, **Motsamai Mpho**, and **Philip Matante**.
- **1962:** **Sir Seretse Khama** and **Sir Ketumile Masire** founded the **Bechuanaland Democratic Party (BDP)**; **Botswana National Front (BNF)** followed in 1965 under **Dr Kenneth Koma**.
- **Capital Shift (1965):** Administrative headquarters moved inside the territory from **Mafeking** (South Africa) to newly built **Gaborone**.
- **30 September 1966:** Independence declared; **Sir Seretse Khama** became first President.

2. Avoiding the "Resource Curse" (The Botswana Success Model):
- **1967 Orapa Discovery & Debswana (1969):** Government negotiated an equitable **50–50 joint venture (Debswana)** with De Beers plus tax/royalty revenues exceeding 75% of diamond profits.
- **Sustainable Budgeting & Pula Fund:** Diamond revenues were invested via National Development Plans strictly into health clinics, tarred highways (Trans-Kalahari), water boreholes, and universal education—never wasted on prestige white elephants—while excess reserves formed the **Pula Fund** (sovereign wealth fund) for future generations.

3. Economic Challenges & **Vision 2036 ("Achieving Prosperity for All")**:
- **Core Vulnerabilities:** High dependence on diamond exports (~75–80% of export earnings), youth unemployment, recurring droughts, and vulnerability to synthetic diamond competition.
- **Four Pillars of Vision 2036:**
  1. **Sustainable Economic Development:** Economic diversification into tourism, beef/agribusiness, solar/clean energy, financial services, diamond cutting/polishing (Okavango Diamond Company & HB Antwerp), and knowledge/ICT hubs.
  2. **Human & Social Development:** High-skilled workforce (*ETSSP*), equitable healthcare, and eradicating extreme poverty.
  3. **Sustainable Environment:** Protecting the Okavango, Chobe, Kalahari ecosystems, and renewable energy transition.
  4. **Governance, Peace & Security:** Accountable public service (*DCEC* anti-corruption), human rights, and rule of law.`,
    suggestions: [
      'Compare Vision 2036 goals with Botswana’s Development Studies syllabus',
      'What are the 4 Debswana diamond mines in Botswana?',
      'Who won the 2024 Botswana General Election?'
    ]
  },
  {
    id: 'bw_geography_districts',
    subject: 'Geography',
    topic: 'Geography of Botswana: 10 Districts, Okavango Delta, Kalahari, Pans & Rivers',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'districts of botswana', '10 districts', 'okavango delta', 'kalahari', 'kgalagadi',
      'makgadikgadi', 'sua pan', 'chobe', 'tsodilo hills', 'limpopo', 'boteti', 'climate of botswana',
      'maun', 'kasane', 'gaborone', 'francistown', 'geography of botswana'
    ],
    content: `### Physical & Human Geography of Botswana

**Direct Answer:** Botswana sits on a flat-to-gently-undulating Southern African plateau (average altitude ~1,000 m), shaped by the semi-arid **Kalahari Basin**, the endorheic **Okavango Inland Delta**, and vast **Makgadikgadi Salt Pans**.

1. The 10 Administrative Districts & Key Centres:
1. **Central District** (*Serowe*, *Palapye*, *Mahalapye*, *Orapa*, *Letlhakane*, *Selebi-Phikwe*) — Largest district by area and population.
2. **North-West / Ngamiland District** (*Maun*, *Gumare*, *Shakawe*) — Home to **Okavango Delta** and **Tsodilo Hills**.
3. **Chobe District** (*Kasane*) — Bordering Zambia/Zimbabwe/Namibia; **Chobe National Park**.
4. **Kweneng District** (*Molepolole*, *Mogoditshane*).
5. **Southern District** (*Kanye*, *Jwaneng*, *Goodhope*).
6. **South-East District** (*Ramotswa*, *Gaborone*, *Lobatse*, *Tlokweng*).
7. **Kgatleng District** (*Mochudi*).
8. **North-East District** (*Masunga*, *Francistown*).
9. **Ghanzi District** (*Ghanzi*) — Beef cattle ranching & Kalahari gateway.
10. **Kgalagadi District** (*Tsabong*, *Hukuntsi*) — **Kgalagadi Transfrontier Park** & red sand dunes.

2. Iconic Physical Landforms & Drainage Systems:
- **The Okavango Delta (UNESCO World Heritage Site):** Largest **inland delta** on Earth. Rain falling in the **Angolan Highlands** (Jan–Feb) flows south via the **Cubango/Okavango River** and fans out across northern Botswana's tectonic **fault-bounded alluvial fan** (peaking Jun–Aug in the dry winter season), terminating through evaporation rather than reaching an ocean.
- **Makgadikgadi & Nxai Pans:** Remnants of ancient Lake Makgadikgadi; seasonal flamingo breeding grounds and **Sua Pan** soda ash basin.
- **Kalahari (*Kgalagadi*) Semi-Desert & Central Kalahari Game Reserve (CKGR):** Deep wind-blown Kalahari sands (*arenosols*), fossil river valleys (*mekgacha*), scrub savannah, and acacia woodland supporting wildlife & pastoralism.
- **Eastern Hardveld:** Most densely populated fertile eastern belt along the **Limpopo**, **Shashe**, **Motloutse**, and **Notwane** rivers where Gaborone, Francistown, Serowe, and Lobatse sit.

3. Climate & Environmental Management:
- **Semi-Arid Continental Climate:** Summer rainfall (Nov–March, 250 mm in south-west Kgalagadi to ~650 mm in Chobe) with high evaporation rates and frequent droughts (*Leuba*).
- **Urbanisation:** Rapid growth in **Gaborone** and satellite settlements (*Mogoditshane*, *Tlokweng*, *Phakalane*), driving water transfers via the **North–South Carrier (NSC) Pipeline** from Letsibogo & Dikgatlhong dams.`,
    suggestions: [
      'Why does the Okavango Delta flood during Botswana’s dry winter months?',
      'Explain Botswana’s Eastern Hardveld vs Kalahari Sandveld soils',
      'What are Botswana’s main mining and agricultural exports?'
    ]
  },
  {
    id: 'bw_economy_mining_agriculture',
    subject: 'Development Studies',
    topic: 'Botswana Economy: Debswana Diamonds, Beef (BMC), Morupule Coal, Tourism & SACU',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'debswana', 'diamonds', 'jwaneng', 'orapa', 'letlhakane', 'damtshaa', 'karowe',
      'botswana meat commission', 'bmc', 'beef', 'morupule', 'sua pan', 'soda ash', 'botash',
      'tourism', 'sacu', 'sadc', 'okavango diamond company', 'economy of botswana'
    ],
    content: `### Key Pillars of the Economy of Botswana

**Direct Answer:** Botswana's economy is anchored by **diamond mining** (Debswana & Lucara), complemented by **beef ranching (BMC)**, **eco-tourism**, **coal/copper/soda ash**, **financial services**, and regional trade within **SACU** and **SADC**.

1. Diamond Mining & Mineral Beneficiation:
- **Debswana Diamond Company** (50% Government of Botswana, 50% De Beers) operates four kimberlite diamond mines:
  * **Jwaneng Mine** (Southern District — richest diamond mine in the world by value).
  * **Orapa Mine** (Central District — Botswana's oldest major mine, discovered 1967, opened 1971).
  * **Letlhakane Mine** & **Damtshaa Mine** (Central District).
- **Karowe Mine (Letlhakane — Lucara Diamond):** Famous for recovering ultra-large Type IIa diamonds including the 1,109-carat *Lesedi La Rona*, 1,758-carat *Sewelô*, and the 2,492-carat diamond recovered in 2024.
- **Value Addition & Beneficiation:** **Okavango Diamond Company (ODC)** markets state rough diamond allocations in Gaborone alongside cutting/polishing factories (*Diamond Trading Company Botswana*).
- **Other Minerals:** **Morupule Coal Mine & Power Station** (Palapye), **Botash** soda ash and salt extraction (**Sua Pan**), **Khoemacau** & **Motukwe/T3** copper-silver mining in the **Kalahari Copperbelt** (Ngamiland/Ghanzi).

2. Livestock, Beef & Dryland Agriculture:
- **Botswana Meat Commission (BMC)** abattoirs in **Lobatse**, **Francistown**, and **Maun** export hormone-free, grass-fed beef to the European Union, UK, and regional markets.
- **Veterinary Disease Control:** Strict **Foot-and-Mouth Disease (FMD)** veterinary cordon fences and *BAITS* ear-tag livestock traceability protect EU export zones.
- **Arable Farming & Programmes:** Rain-fed cultivation of **sorghum (*mabele*)**, **pearl millet (*lebelebele*)**, **maize**, and **cowpeas (*dinawa*)**, supported by **Temo Letlotlo** (modernised from ISPAAD) and Pandamatenga commercial farms.

3. Eco-Tourism & Regional Trade:
- **"High-Value, Low-Volume" Eco-Tourism Model:** Protects fragile wilderness in **Okavango Delta**, **Moremi Game Reserve**, **Chobe National Park**, and **Kgalagadi Transfrontier Park** while generating vital foreign exchange and community trust jobs (*CBNRM*).
- **SACU & SADC:** Botswana is a founding member of the **Southern African Customs Union (SACU)** and hosts the **SADC Secretariat** in Gaborone.`,
    suggestions: [
      'Compare Jwaneng and Orapa diamond mines in Geography/Development Studies',
      'How does Botswana protect its beef export industry from Foot-and-Mouth Disease?',
      'Explain Botswana’s High-Value Low-Volume tourism strategy'
    ]
  },
  {
    id: 'bw_botho_culture_setswana',
    subject: 'Setswana',
    topic: 'Setswana Language, Botho Philosophy, Proverbs (Diane), Culture & Traditional Foods',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'setswana', 'botho', 'mafisa', 'letsema', 'bogadi', 'diane', 'maele', 'proverbs',
      'dumela', 'seswaa', 'bogobe', 'morogo', 'phane', 'setapa', 'hosana', 'borankana',
      'tsutsube', 'kgaolo', 'ngwao', 'culture of botswana', 'morafe', 'kgosi'
    ],
    content: `### Setswana Language, Culture & The Philosophy of *Botho*

**Direct Answer:** **Botho** is Botswana's foundational national ethical principle—the Setswana expression of humane character, mutual respect, compassion, and community solidarity captured by ***"Motho ke motho ka batho"*** (A person is a person because of other people).

1. Essential Setswana Greetings & Everyday Phrases:
- **Dumela Rra / Dumela Mma** — Hello Sir / Hello Madam (*Dumelang* for plural).
- **O tsogile jang?** — How did you wake / How are you?
- **Ke tsogile sentle, wena o tsogile jang?** — I am well, and how are you?
- **Ke a leboga** — Thank you very much.
- **Pula!** — Rain / Blessing / Peace (*national greeting of unity*).
- **Tsamaya sentle / Sala sentle** — Go well / Stay well.

2. Important Setswana Proverbs (*Diane*) & Meanings:
- ***"Motho ke motho ka batho"*** — Humanness and individual success depend on community harmony (**Botho**).
- ***"Moroto wa o esi ga o ele"*** — One finger cannot kill a louse / unity brings strength (cooperation in *letsema*).
- ***"Sedikwa ke ntša pedi ga se thata"*** — Difficult tasks become easy when people collaborate.
- ***"Kgosi ke kgosi ka batho"*** — A leader's authority derives from serving and listening to the people (*Kgotla* accountability).
- ***"Moseka phofu ya gaabo ga a tshabe go swa lentswe"*** — Never give up when defending your rightful heritage or truth.
- ***"Lentswe la moswi ga le tlolwe"*** — The wise counsel of elders is respected.

3. Traditional Customs, Social Support & Heritage Foods:
- **Letsema:** Communal cooperative work during ploughing, weeding, or harvesting without cash wages.
- **Mafisa:** Traditional cattle-loaning system in which wealthier families entrust cattle to poorer relatives—the caretaker receives milk and calves while building independence, reducing inequality.
- **Bogadi:** Cultural bridewealth cementing kinship ties between families.
- **Music & Traditional Dance:** **Setapa** (Southern/Ngwaketse stomp dance), **Borankana**, **Hosana** (Kalanga rainmaking/spiritual dance), **Tsutsube** (Basarwa healing dance), **Dikhwaere** (community choral competitions), and **Segaba / Setinkane** thumb piano & bowed instruments.
- **Iconic Botswana Cuisine:** **Seswaa** (slow-boiled, pounded salted beef served at weddings and funerals), **Bogobe jwa lerotse** (sorghum porridge cooked with melon and sour milk *madila*), **Dikgobe** (boiled samp and beans), **Morogo wa dinawa** (cowpea leaves), and **Phane** (mopane worms rich in protein).`,
    suggestions: [
      'Translate common Setswana greetings and give 5 Setswana Diane (proverbs)',
      'Explain how Mafisa and Letsema promoted social welfare in traditional Botswana',
      'What does Botho mean in Botswana Moral Education?'
    ]
  },
  {
    id: 'bw_education_bec_system',
    subject: 'Social Studies',
    topic: 'Botswana Education System & BEC Examinations: PSLE, JCE, BGCSE & Tertiary (BQA)',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'bec', 'botswana examinations council', 'psle', 'jce', 'bgcse', 'grading',
      'standard 7', 'forms 1 to 3', 'forms 4 to 5', 'university of botswana', 'biust',
      'buan', 'botho university', 'bqa', 'bnqf', 'etssp', 'botswana education system'
    ],
    content: `### Botswana Education & BEC Examination Framework

**Direct Answer:** Public education and national examinations in Botswana are administered by the **Ministry of Education and Skills Development (MESD)** and the **Botswana Examinations Council (BEC)** across four structured tiers aligned to the **Education & Training Sector Strategic Plan (ETSSP)** and **Botswana Qualifications Authority (BQA)**.

1. Primary Education — Standards 1 to 7 (**PSLE**):
- **Duration:** 7 years (ages 6–13).
- **Culminating Exam:** **Primary School Leaving Examination (PSLE)** taken at **Standard 7**.
- **Core Examinable Subjects:** **English**, **Setswana**, **Mathematics**, **Science**, **Agriculture**, **Social Studies**, plus **Religious & Moral Education (RME)** and **Creative & Performing Arts (CAPA)**.
- **PSLE Grading Scale:** **A (Excellent)**, **B (Very Good)**, **C (Good / Credit)**, **D (Satisfactory)**, **E (Weak)** — automatically progressing all learners into 3-year Junior Secondary under Botswana's 10-year basic education policy.

2. Junior Secondary — Forms 1 to 3 (**JCE**):
- **Duration:** 3 years.
- **Culminating Exam:** **Junior Certificate Examination (JCE)**.
- **Core Subjects:** **English Language**, **Setswana**, **Mathematics**, **Integrated Science**, **Social Studies**, **Agriculture**, **Moral Education**, plus electives (**Commerce & Accounting**, **Design & Technology**, **Home Economics**, **Art**, **Music**, **Business Studies**, **Computer Awareness**).
- **JCE Grading Scale:** Overall award levels **Merit**, **A**, **B**, **C**, **D**, **E**; Grades **A–C** qualify students cleanly for Senior Secondary admission.

3. Senior Secondary — Forms 4 to 5 (**BGCSE**):
- **Duration:** 2 years across Senior Secondary Schools (*Moeng College, Gaborone Secondary, St Joseph's, Mater Spei, Naledi, Maun, Kgari Sechele, Swaneng Hill*, etc.).
- **Culminating Exam:** **Botswana General Certificate of Secondary Education (BGCSE)**, developed locally by **BEC** in partnership with **Cambridge Assessment** (*replacing Cambridge Overseas School Certificate*).
- **Core & Elective Subjects:** **English Language**, **Setswana**, **Mathematics**, **Double Award Science** (or **Single Science** / **Pure Physics, Chemistry, Biology**), **Development Studies**, **Geography**, **History**, **Agriculture**, **Accounting**, **Commerce**, **Business Studies**, **Economics**, **Design & Technology**, **Computer Studies**, **Literature in English**, **Religious Education**.
- **BGCSE Grading & University Cut-Off:** Grades run from **A*, A, B, C, D, E, F, G** (highest **A* = 8 points**, **A = 8**, **B = 7**, **C = 6**, **D = 5**, **E = 4** in standard point calculations). Obtaining **36+ points across best 6 subjects (with Credits C or better in English & Mathematics for STEM)** unlocks direct sponsorship/admission to top universities.

4. Tertiary & Higher Education (**BQA / BNQF**):
- **Major Institutions:** **University of Botswana (UB)** (Gaborone), **Botswana International University of Science and Technology (BIUST)** (Palapye), **Botswana University of Agriculture and Natural Resources (BUAN)** (Sebele), **Botswana Accountancy College (BAC)**, **Botho University**, **Botswana Open University (BOU)**, **IDM**, and technical **Brigades & Technical Colleges**.`,
    suggestions: [
      'Compare PSLE, JCE, and BGCSE grading scales in Botswana',
      'What subjects are compulsory in Botswana JCE and BGCSE?',
      'What points are needed at BGCSE for University of Botswana or BIUST?'
    ]
  }
];
