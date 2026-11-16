export interface ZimbabweEncyclopediaEntry {
  id: string;
  subject: string;
  topic: string;
  content: string;
  keywords: string[];
  levels?: string[];
  suggestions?: string[];
}

export const ZIMBABWE_ENCYCLOPEDIA_ENTRIES: ZimbabweEncyclopediaEntry[] = [
  {
    id: 'zw_overview_identity',
    subject: 'Social Science',
    topic: 'Zimbabwe Complete National Profile: Identity, Name Origin, Geography & Key Facts',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'zimbabwe', 'everything about zimbabwe', 'facts about zimbabwe', 'dzimba dza mabwe',
      'houses of stone', 'capital of zimbabwe', 'harare', 'bulawayo', 'area of zimbabwe',
      'borders of zimbabwe', 'independence 1980', 'motto', 'unity freedom work', 'vision 2030'
    ],
    content: `### Republic of Zimbabwe: Complete National Profile

**Origin of the Name:** The name **Zimbabwe** comes from the ChiShona phrase **Dzimba dza mabwe** (Karange dialect: *Dzimba dze mabwe*), meaning **"Houses of Stone"**, named after the dry-stone granite walls of the **Great Zimbabwe** medieval capital in Masvingo Province.

1. Core National Facts:
- **Official Name:** Republic of Zimbabwe.
- **Independence Day:** **18 April 1980** (following the Lancaster House Agreement and February 1980 general elections; formerly Southern Rhodesia / Rhodesia).
- **Capital City:** **Harare** (formerly Salisbury; largest city and seat of government).
- **Second Largest City:** **Bulawayo** (*City of Kings*, industrial and rail hub in Matabeleland).
- **National Motto:** *"Unity, Freedom, Work"*.
- **National Guiding Philosophy (Second Republic):** *"Nyika inovakwa nevene vayo / Ilizwe lakhiwa ngabanikazi balo"* (A nation is built by its own owners) and **"Leaving no one and no place behind"** toward **Vision 2030** (Upper-Middle-Income Society).
- **Total Land Area:** **390,757 km²**.
- **Time Zone:** Central Africa Time (**CAT**, UTC+2).
- **Dialling Code & Internet Domain:** **+263** | **.zw**.
- **Official Currency:** **Zimbabwe Gold (ZiG)** (introduced 5 April 2024, alongside a statutory multi-currency basket).

2. Geographic Position & Neighbouring Countries:
Zimbabwe is a landlocked country in **Southern Africa** lying between latitudes **15°S and 23°S** and longitudes **25°E and 34°E**. It is bordered by four countries (and nearly touches Namibia at the Kazungula quadripoint):
- **North:** **Zambia** (separated by the Zambezi River and Lake Kariba).
- **East:** **Mozambique** (bordered by the Eastern Highlands mountain chain).
- **South:** **South Africa** (separated by the Limpopo River; linked via Beitbridge).
- **West & South-West:** **Botswana** (linked via Plumtree and Kazungula).

3. National Administration & Demographics:
- Divided into **10 Provinces** (2 Metropolitan Provinces — Harare and Bulawayo — plus 8 Rural/Regional Provinces).
- Over **90% adult literacy rate**, one of the highest on the African continent.
- **16 Officially Recognised Languages** under Section 6 of the 2013 Constitution (English, ChiShona, and IsiNdebele are the most widely spoken).`,
    suggestions: [
      'List all 10 provinces of Zimbabwe and their capitals',
      'What are the national symbols of Zimbabwe?',
      'What are the 16 officially recognised languages of Zimbabwe?',
      'Who is the current President of Zimbabwe?'
    ]
  },
  {
    id: 'zw_national_symbols',
    subject: 'Social Science',
    topic: 'National Symbols of Zimbabwe: Flag Colours, Coat of Arms, Hungwe Bird & Flame Lily',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'national symbols', 'symbols of zimbabwe', 'zimbabwe flag', 'flag of zimbabwe', 'flag colours',
      'colours on the flag', 'red star', 'white triangle', 'coat of arms', 'zimbabwe bird', 'national bird',
      'hungwe', 'flame lily', 'gloriosa superba', 'national flower', 'eternal flame', 'heroes acre', 'emblem'
    ],
    content: `### National Symbols of the Republic of Zimbabwe

Under Zimbabwean Heritage & Social Studies, national symbols embody sovereignty, the liberation struggle, natural wealth, and unity:

1. The National Flag of Zimbabwe (Adopted 18 April 1980):
- **Green Stripes (Top & Bottom):** Represent agriculture, fertile soils, vegetation, and rural prosperity.
- **Yellow / Gold Stripes:** Represent Zimbabwe's vast mineral wealth (gold, platinum, lithium, chrome, diamonds).
- **Red Stripes (Centre Horizontal Band):** Represents the blood shed by gallant sons and daughters during the First and Second Chimurenga liberation wars.
- **Black Stripe (Centre Band):** Represents the black African majority heritage and indigenous ownership of Zimbabwe.
- **White Triangle (Hoist Side, bordered in black):** Symbolises peace and the forward-looking post-independence era.
- **Five-Pointed Red Star:** Symbolises internationalism, socialist aspirations, hope, and national reconstruction.
- **The Zimbabwe Bird (Hungwe) in Yellow:** Placed in the white triangle as the supreme emblem of national identity and pre-colonial heritage.

2. The National Coat of Arms:
- **Two Kudus:** Standing on an earthy mound of wheat, cotton bolls, and maize, symbolising peace and unity across ethnic groups.
- **Shield (Green):** Depicts **Great Zimbabwe** stone walls (ancestral civilisation) and **blue & white wavy bars** at the top representing the **Victoria Falls (*Mosi-oa-Tunya*)** and water resources.
- **Hoe and AK-47 Rifle (crossed behind shield):** Symbolise the transition from the armed liberation struggle to peaceful agricultural work and development.
- **Gold & Green Wreath + Red Star + Zimbabwe Bird:** Crown the shield, uniting ancient heritage with nationhood.
- **Scroll Banner:** Bears the national motto **"UNITY • FREEDOM • WORK"**.

3. The Zimbabwe Bird (*Hungwe*):
- Carved from **soapstone** by ancestors at **Great Zimbabwe** (12th–15th century); eight birds were recovered from the ruins.
- Represents either the **Bateleur Eagle (*Chapungu*)** or the **African Fish Eagle (*Hungwe*)**, regarded spiritually as a royal messenger between the living and ancestors (*Vadzimu*).

4. The National Flower — Flame Lily (*Gloriosa superba* / *Kajongwe*):
- A striking red-and-gold climbing lily native to Zimbabwe's woodlands. Its glowing red and yellow colours inspired part of the Zimbabwean palette of sacrifice and mineral wealth.

5. The National Heroes' Acre & Eternal Flame:
- Located west of Harare; designed with two AK-47-shaped terraces cradling the **Tomb of the Unknown Soldier** and the towering **40-metre Eternal Flame**, symbolising that the spirit of Zimbabwe's independence will never be extinguished.`,
    suggestions: [
      'What are the lyrics of the Zimbabwe National Anthem?',
      'Recite the National School Pledge of Zimbabwe',
      'What are the public holidays in Zimbabwe?',
      'Tell me about Great Zimbabwe ruins'
    ]
  },
  {
    id: 'zw_anthem_pledge',
    subject: 'Social Science',
    topic: 'Zimbabwe National Anthem (English, ChiShona, IsiNdebele) & National School Pledge',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'national anthem', 'simudzai mureza', 'kalibusiswe', 'solomon mutswairo', 'fred changundega',
      'o lift high the banner', 'national pledge', 'national school pledge', 'blessed be the land'
    ],
    content: `### National Anthem of Zimbabwe & National School Pledge

**History:** Adopted in **March 1994** (replacing *Ishe Komborera Africa*). Lyrics were written by **Prof. Solomon Mutswairo** and the music composed by **Fred Changundega**, selected via nationwide competition.

1. English Version — *"Blessed be the Land of Zimbabwe"*:
- **Verse 1:**
  *O lift high the banner, the flag of Zimbabwe,*
  *The symbol of freedom proclaiming victory;*
  *We praise our heroes' sacrifice,*
  *And vow to defend our land from foes;*
  *And may the Almighty protect and bless our land.*
- **Verse 2:**
  *O lovely Zimbabwe, so wondrously adorned,*
  *With mountains and rivers cascading, flowing free;*
  *May rain abound and fertile fields,*
  *May we be fed, our labour blessed;*
  *And may the Almighty protect and bless our land.*
- **Verse 3:**
  *O God, we beseech Thee to bless our native land,*
  *The land of our fathers bestowed upon us all;*
  *From Zambezi to Limpopo,*
  *May leaders be exemplary;*
  *And may the Almighty protect and bless our land.*

2. ChiShona Version — *"Simudzai Mureza Wedu weZimbabwe"*:
- **Verse 1:** *Simudzai mureza wedu weZimbabwe / Yakazvarwa nomoto weChimurenga; / Neropa zhinji ramagamba / Tiidzivirire kumhandu dzose; / Ngaikomborerwe nyika yeZimbabwe.*
- **Verse 2:** *Tarisai Zimbabwe nyika yakashongedzwa / Namakomo, nehova, zvinoyevedza / Mvura ngainaye, minda ipe mbesa / Vashandi vatuswe, ruzhinji rugute; / Ngaikomborerwe nyika yeZimbabwe.*
- **Verse 3:** *Mwari ropafadzai nyika yeZimbabwe / Nyika yamadzitateguru edu tose; / Kubva Zambezi kusvika Limpopo, / Navatungamiri vave nenduramo; / Ngaikomborerwe nyika yeZimbabwe.*

3. IsiNdebele Version — *"Kalibusiswe Ilizwe leZimbabwe"*:
- **Verse 1:** *Phakamisan' ifulegi yethu yeZimbabwe / Eyazalwa yimpi yenkululeko; / Legaz' elinengi lamaqhawe ethu / Silivikele ezitheni zonke; / Kalibusiswe ilizwe leZimbabwe.*
- **Verse 2:** *Khangelan' iZimbabwe yon' ihlotshisiwe / Ngezintaba langemiful' ephuphuma; / Izulu kaline, izilimo zande / Izisebenzi zithokoze, abantu basuthe; / Kalibusiswe ilizwe leZimbabwe.*
- **Verse 3:** *Nkosi busis' ilizwe lethu leZimbabwe / Ilizwe labokhokho bethu thina sonke; / Kusuk' eZambezi kusiy' eLimpopo / Abakhokheli babe lobuqotho; / Kalibusiswe ilizwe leZimbabwe.*

4. National School Pledge (Introduced by MoPSE in 2016):
- **Infant & Junior Level:** *"Almighty God, in whose hands our future lies: I salute the National Flag, I commit to honesty and dignity of hard work."*
- **Senior Level (Upper Primary & Secondary):** *"Almighty God, in whose hands our future lies: I salute the National Flag. Respecting the brave fathers and mothers who lost lives in the Chimurenga/Umvukela. We are creators of our destiny and guardians of the natural resources of our country. I commit to honesty and the dignity of hard work."*`,
    suggestions: [
      'What do the colours on the Zimbabwe flag mean?',
      'What are all the public holidays in Zimbabwe?',
      'Tell me about Solomon Mutswairo and Zimbabwean literature'
    ]
  },
  {
    id: 'zw_public_holidays',
    subject: 'Social Science',
    topic: 'Official Public Holidays & National Commemoration Days in Zimbabwe',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'public holidays', 'holidays in zimbabwe', 'zimbabwe holidays', 'national days', 'independence day',
      'heroes day', 'unity day', 'defence forces day', 'youth day', 'africa day', 'workers day',
      '18 april', '22 december', '21 february', '25 may'
    ],
    content: `### Official Public Holidays & National Days in Zimbabwe

Zimbabwe observes **11 statutory public holidays** each year under the Public Holidays and Prohibition of Business Act:

1. **New Year's Day — 1 January:** Marks the beginning of the Gregorian calendar year.
2. **Robert Gabriel Mugabe National Youth Day — 21 February:** Gazetted in 2017 (honouring the birthday of Zimbabwe's founding Prime Minister and first Executive President) to celebrate youth empowerment, innovation, and leadership.
3. **Good Friday & Easter Monday (March/April — movable):** Christian observances of the crucifixion and resurrection of Jesus Christ.
4. **Independence Day — 18 April:** Commemorates **18 April 1980**, when the Union Jack was lowered and the Zimbabwean flag was raised at Rufaro Stadium in Harare, ending colonial rule.
5. **Workers' Day — 1 May:** International Labour Day honouring the contribution of workers and trade unions to national development.
6. **Africa Day — 25 May:** Commemorates the founding of the **Organisation of African Unity (OAU)** on 25 May 1963 (now the African Union), celebrating Pan-African solidarity.
7. **Heroes' Day — Second Monday of August:** Dedicated to remembering all fallen and living heroes and heroines of the First and Second Chimurenga liberation struggles at the National Heroes' Acre and provincial/district shrines.
8. **Defence Forces Day — Tuesday after Heroes' Day (August):** Honours the **Zimbabwe Defence Forces (ZDF)** — the Zimbabwe National Army (ZNA) and Air Force of Zimbabwe (AFZ) — for safeguarding sovereignty, peacekeeping, and community engineering projects.
9. **National Unity Day — 22 December:** Commemorates the historic **Unity Accord of 22 December 1987** signed by Robert Mugabe (ZANU) and Dr. Joshua Nkomo (PF-ZAPU), uniting the nation as ZANU-PF and bringing peace to Matabeleland and Midlands.
10. **Christmas Day — 25 December** and **Boxing Day — 26 December:** Christian and family holidays celebrating generosity, community (*Ukama*), and goodwill.

*Civics Note:* Under Zimbabwean law, whenever a statutory holiday falls on a Sunday, the following **Monday** automatically becomes a public holiday.`,
    suggestions: [
      'What happened on 18 April 1980?',
      'What was the 1987 Unity Accord?',
      'Tell me about Heroes Acre and Zimbabwean national heroes'
    ]
  },
  {
    id: 'zw_provinces_districts_cities',
    subject: 'Geography',
    topic: 'All 10 Provinces of Zimbabwe: Capitals, Cities, Districts & Key Features',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'provinces of zimbabwe', '10 provinces', 'ten provinces', 'provincial capitals',
      'harare', 'bulawayo', 'manicaland', 'mutare', 'mashonaland central', 'bindura',
      'mashonaland east', 'marondera', 'mashonaland west', 'chinhoyi', 'masvingo',
      'matabeleland north', 'lupane', 'matabeleland south', 'gwanda', 'midlands', 'gweru',
      'kwekwe', 'kadoma', 'chiredzi', 'beitbridge', 'victoria falls', 'hwange', 'zvishavane'
    ],
    content: `### All 10 Provinces of Zimbabwe, Capitals, Major Towns & Economic Identities

Zimbabwe is divided into **10 administrative provinces** (2 Metropolitan and 8 Regional/Rural Provinces) overseen by Ministers of State for Provincial Affairs and Devolution:

1. **Harare Metropolitan Province**
   - **Capital:** **Harare** (National Capital).
   - **Urban/Local Centres:** Harare, Chitungwiza, Epworth, Ruwa.
   - **Key Identity:** Seat of Executive, Parliament, Constitutional Court, RBZ, University of Zimbabwe (UZ), RGM International Airport; hub of commerce, finance, manufacturing, and technology.

2. **Bulawayo Metropolitan Province**
   - **Capital:** **Bulawayo** (*City of Kings / Kontuthu Ziyathunqa*).
   - **Key Identity:** Second-largest city; historic industrial, manufacturing, and National Railways of Zimbabwe (NRZ) hub; home to **NUST**, Zimbabwe International Trade Fair (**ZITF**), and Khami Ruins nearby.

3. **Manicaland Province (Eastern Zimbabwe)**
   - **Provincial Capital:** **Mutare**.
   - **Major Districts & Towns:** Mutare, Rusape (Makoni), Chipinge, Nyanga, Chimanimani, Buhera, Mutasa.
   - **Key Identity:** Border gateway to Beira Port (Mozambique); Eastern Highlands mountains (Mount Nyangani, Bvumba, Honde Valley); tea, coffee, timber, deciduous fruits, macadamia nuts, and Marange/Chiadzwa diamonds.

4. **Mashonaland Central Province (Northern Zimbabwe)**
   - **Provincial Capital:** **Bindura**.
   - **Major Districts & Towns:** Bindura, Mazowe, Centenary/Muzarabani, Mt Darwin, Shamva, Guruve, Mbire, Rushinga.
   - **Key Identity:** Fertile Natural Region II commercial farming (maize, tobacco, citrus in Mazowe), gold & nickel mining (Freda Rebecca, Trojan), and Zambezi Valley oil/gas exploration (Muzarabani/Mbire).

5. **Mashonaland East Province (North-Eastern Zimbabwe)**
   - **Provincial Capital:** **Marondera**.
   - **Major Districts & Towns:** Marondera, Murehwa, Mutoko, Chivhu (Chikomba), Seke, Goromonzi, Hwedza, UMP (Uzumba-Maramba-Pfungwe), Mudzi.
   - **Key Identity:** Prime horticulture, dairy, tobacco, and maize farming; **Arcadia Lithium Mine** (Goromonzi); **Mutoko Black Granite** quarries; Nyamapanda border to Tete/Malawi.

6. **Mashonaland West Province (North-Western Zimbabwe)**
   - **Provincial Capital:** **Chinhoyi**.
   - **Major Districts & Towns:** Chinhoyi (Makonde), Kadoma, Chegutu, Kariba, Karoi (Hurungwe), Norton, Sanyati, Zvimba, Mhondoro-Ngezi.
   - **Key Identity:** High-output maize, tobacco, and cotton; **Kariba Dam & Hydro Station**; **Chinhoyi Caves**; Zimplats Platinum (Selous/Ngezi); gold mining in Kadoma & Chegutu; home of the 1966 Battle of Chinhoyi.

7. **Masvingo Province (South-Eastern Zimbabwe)**
   - **Provincial Capital:** **Masvingo** (oldest colonial town, formerly Fort Victoria).
   - **Major Districts & Towns:** Masvingo, Chiredzi, Gutu, Bikita, Mwenezi, Chivi, Zaka.
   - **Key Identity:** **Great Zimbabwe UNESCO Monument**; **Tugwi-Mukosi** (largest inland dam) & Lake Mutirikwi; Lowveld irrigated sugar estates (**Triangle & Hippo Valley**); **Bikita Lithium Mine**; **Gonarezhou National Park**.

8. **Matabeleland North Province (Western Zimbabwe)**
   - **Provincial Capital:** **Lupane**.
   - **Major Districts & Towns:** Lupane, Victoria Falls (City), Hwange, Binga, Nkayi, Tsholotsho, Bubi, Umguza.
   - **Key Identity:** **Victoria Falls (*Mosi-oa-Tunya*)**, **Hwange National Park**, **Hwange Coal & Thermal Power Station**, Kamativi Lithium, Binga Tonga cultural heritage & Lake Kariba fishing.

9. **Matabeleland South Province (South-Western Zimbabwe)**
   - **Provincial Capital:** **Gwanda**.
   - **Major Districts & Towns:** Gwanda, Beitbridge, Plumtree (Mangwe), Matobo, Insiza (Filabusi), Umzingwane (Esigodini), Bulilima.
   - **Key Identity:** **Beitbridge Border Post** (busiest inland port in Southern Africa into South Africa); **Matobo Hills UNESCO Site**; livestock/beef ranching; Blanket & gold mines; Plumtree border to Botswana.

10. **Midlands Province (Central Zimbabwe)**
    - **Provincial Capital:** **Gweru**.
    - **Major Districts & Towns:** Gweru, Kwekwe, Zvishavane, Shurugwi, Gokwe North, Gokwe South, Mvuma (Chirumhanzu), Mberengwa.
    - **Key Identity:** Heart of the **Great Dyke** mineral belt; chrome, platinum (Unki, Mimosa), gold, asbestos; **Redcliff & Dinson Steel (Manhize)**; **Gokwe cotton belt**; **Midlands State University (MSU)** and Air Force Thornhill base.`,
    suggestions: [
      'What are the major rivers, dams, and mountains of Zimbabwe?',
      'Explain Zimbabwe’s 5 Natural Farming Regions',
      'What minerals are mined along the Great Dyke?'
    ]
  },
  {
    id: 'zw_16_official_languages',
    subject: 'Social Science',
    topic: 'The 16 Officially Recognised Languages of Zimbabwe (2013 Constitution Section 6)',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      '16 official languages', 'official languages of zimbabwe', 'languages spoken in zimbabwe',
      'languages in zimbabwe', 'section 6 constitution', 'shona', 'ndebele', 'kalanga', 'venda',
      'tonga', 'shangani', 'ndau', 'nambya', 'chibarwe', 'chewa', 'khoisan', 'sign language',
      'sotho', 'tswana', 'xhosa'
    ],
    content: `### The 16 Officially Recognised Languages of Zimbabwe

Under **Section 6 of the 2013 Constitution of Zimbabwe**, the State must promote and advance the use of all indigenous languages and treat them equitably. Zimbabwe recognises **16 official languages** (alphabetical constitutional list):

1. **Chewa (Chichewa / Nyanja)** — Widely spoken in mining, commercial farming, and peri-urban communities (Mashonaland, Midlands, Harare).
2. **Chibarwe (Chisena / Barwe)** — Spoken mainly along the eastern border near Mozambique (Manicaland & Mashonaland East/Central).
3. **English** — Principal language of business, Parliament, higher courts, international diplomacy, and academic instruction.
4. **Kalanga (TjiKalanga)** — Spoken mainly in Plumtree, Bulilima, Mangwe, and Tsholotsho (Matabeleland South & North).
5. **Khoisan (Tshwao)** — Endangered click-language spoken by indigenous San communities in Tsholotsho (Matabeleland North).
6. **Nambya (ChiNambya)** — Spoken primarily in Hwange District and Victoria Falls area (Matabeleland North).
7. **Ndau (ChiNdau)** — Elevated to a distinct official language in 2013; spoken in Chipinge and Chimanimani (Manicaland) and parts of Bikita.
8. **Ndebele (IsiNdebele)** — Major national Nguni language spoken widely across Bulawayo, Matabeleland North, Matabeleland South, and parts of Midlands (Gweru, Kwekwe, Silobela, Mberengwa).
9. **Shangani (Xitsonga / ChiTsonga)** — Spoken in Chiredzi, Mwenezi, and parts of Chipinge (South-Eastern Lowveld).
10. **Shona (ChiShona)** — Most widely spoken indigenous language (~75%+ across dialects: *Zezuru, Karanga, Manyika, Korekore*), codified into Standard Literary Shona following Prof. Clement Doke's 1931 orthography work.
11. **Sign Language (Zimbabwe Sign Language — ZSL)** — Constitutional protection ensuring inclusion for the Deaf community in schools, courts, and public broadcasting.
12. **Sotho (Sesotho)** — Spoken mainly in Gwanda South and Beitbridge regions (Matabeleland South).
13. **Tonga (ChiTonga)** — Spoken extensively in Binga, Kariba, and Nyaminyami along the Zambezi Valley.
14. **Tswana (Setswana)** — Spoken along the western border with Botswana (Mangwe, Bulilima, Plumtree).
15. **Venda (Tshivenḓa)** — Spoken predominantly in Beitbridge District along the Limpopo River border with South Africa.
16. **Xhosa (IsiXhosa)** — Spoken by Fingo/Xhosa communities concentrated in Mbembesi (Umguza District, Matabeleland North) and parts of Midlands.

*Educational Milestone:* ZIMSEC examines **ChiShona, IsiNdebele, Tonga, Kalanga, Nambya, Tshivenḓa, and Xitsonga/Shangani** at Grade 7 and secondary levels under the Heritage-Based Curriculum.`,
    suggestions: [
      'Give me common ChiShona greetings, proverbs (Tsumo), and kinship words',
      'What does Section 6 of the 2013 Constitution say about languages?',
      'List all 10 provinces of Zimbabwe'
    ]
  },
  {
    id: 'zw_constitution_governance',
    subject: 'Social Science',
    topic: '2013 Constitution of Zimbabwe, Bill of Rights, Parliament, Judiciary, Chiefs & Commissions',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      '2013 constitution', 'constitution of zimbabwe', 'bill of rights', 'chapter 4',
      'parliament of zimbabwe', 'senate', 'national assembly', 'constitutional court',
      'judiciary', 'executive', 'devolution', 'traditional leaders', 'chiefs', 'zec', 'zacc', 'zhrc'
    ],
    content: `### The 2013 Constitution of Zimbabwe & State Governance

**Historical Milestone:** Drafted through the COPAC nationwide outreach, approved by **94.5% of voters in the 16 March 2013 Referendum**, and signed into law on **22 May 2013** (Constitutional Amendment No. 20), replacing the 1979 Lancaster House Constitution.

1. Founding Values & Principles (Chapter 1):
- **Supremacy of the Constitution:** Any law, custom, or conduct inconsistent with it is void.
- Core principles: Rule of law, fundamental human rights, gender equality, recognition of the liberation struggle heroes, good governance, transparency, and respect for traditional institutions.

2. Chapter 4 — Declaration of Rights (Bill of Rights):
- **Civil & Political Rights:** Right to life, personal liberty, human dignity, equality & non-discrimination, freedom of expression, assembly, religion, and fair administrative justice.
- **Socio-Economic & Cultural Rights (first introduced cleanly in 2013):** Right to basic state-funded education, healthcare, clean safe water, food, shelter (freedom from arbitrary eviction), environmental protection, and protection of children, elderly, women, war veterans, and persons with disabilities.

3. Three Arms of Government (Separation of Powers):
- **Executive:** The President (two 5-year term constitutional limit), two Vice Presidents, and Cabinet of Ministers (plus Provincial Ministers of State).
- **Legislature (Bicameral Parliament in Mt Hampden New Parliament Building):**
  * **National Assembly:** Directly elected constituency MPs, plus proportional representation seats for women (extended youth & women quotas).
  * **Senate (80 Senators):** Elected provincial senators, **18 Traditional Chiefs**, and 2 representatives of persons with disabilities.
- **Judiciary (Headed by the Chief Justice):**
  * **Constitutional Court** (apex court on constitutional validity) -> **Supreme Court** (final appellate court) -> **High Court** -> **Labour & Administrative Courts** -> **Magistrates Courts** -> **Customary Law / Chiefs' Courts**.

4. Traditional Leadership (Chapter 15) & Devolution (Chapter 14):
- **Traditional Leaders:** Chiefs (*Madzishe / Amakhosi*), Headmen (*Sadunhu / Induna*), and Village Heads (*Sabhuku / Sobhuku*) act as custodians of culture, land allocation in communal areas, environmental preservation, and customary dispute resolution; they sit in the National Council of Chiefs and Senate.
- **Devolution:** Devolves governmental powers and 5% of national revenue allocations to Provincial/Metropolitan Councils and Urban/Rural Local Authorities so communities steer local clinics, roads, and schools.

5. Chapter 12 Independent Constitutional Commissions:
- **ZEC** (Zimbabwe Electoral Commission) — manages elections & voter registration.
- **ZHRC** (Zimbabwe Human Rights Commission) — protects human rights & investigates abuses.
- **ZACC** (Zimbabwe Anti-Corruption Commission) — investigates and combats corruption.
- **NPRC** (National Peace and Reconciliation Commission) — post-conflict healing and national cohesion.
- **ZGC** (Zimbabwe Gender Commission) & **ZMC** (Zimbabwe Media Commission).`,
    suggestions: [
      'Who is the current President and Vice Presidents of Zimbabwe?',
      'What are the three arms of government in Zimbabwe?',
      'What role do traditional chiefs play in Zimbabwe?'
    ]
  },
  {
    id: 'zw_relief_mountains_geomorphology',
    subject: 'Geography',
    topic: 'Physical Geography of Zimbabwe: Highveld, Middleveld, Lowveld, Eastern Highlands & Great Dyke',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'relief of zimbabwe', 'landforms of zimbabwe', 'physical features of zimbabwe',
      'highest mountain', 'tallest mountain', 'mountains in zimbabwe', 'highveld', 'middleveld',
      'lowveld', 'eastern highlands', 'mount nyangani', 'inyangani', 'chimanimani', 'vumba', 'bvumba',
      'honde valley', 'great dyke', 'domboshava', 'epworth balancing rocks', 'balancing rocks',
      'matobo', 'kopje', 'dwala', 'bornhardt'
    ],
    content: `### Physical Geography & Landforms of Zimbabwe

Zimbabwe sits primarily on the southern African central plateau, dividing naturally into **four distinct relief regions**:

1. The Highveld (Altitude: 1,200 m – 1,500+ m):
- Runs from **SW to NE** across central Zimbabwe (Plumtree -> Bulawayo -> Gweru -> Harare -> Marondera -> Rusape), forming the **main watershed** dividing north-flowing Zambezi tributaries from south-flowing Limpopo/Save tributaries.
- Coolest plateau temperatures, richest red/loam soils, highest population density, and major commercial cities.

2. The Middleveld (Altitude: 900 m – 1,200 m):
- Flanks both sides of the Highveld (e.g., Bindura, Chinhoyi, Masvingo, Gwanda, Mutare foothills).
- Marked by rolling plains broken by granite **kopjes / inselbergs / dwalas** shaped by exfoliation and deep chemical weathering (e.g., **Matobo Hills**, **Domboshava**, **Ngomakurira**, **Epworth Balancing Rocks**).

3. The Lowveld (Altitude: Below 900 m, down to <300 m):
- Occurs in two scorching, dry river troughs: the **Zambezi Valley** in the north (Chirundu, Kariba, Muzarabani) and the **Save–Limpopo Basin** in the south-east (Beitbridge, Chiredzi, Mwenezi).
- Hot temperatures; fertile alluvial soils along rivers support large-scale irrigated sugar estates (Triangle, Hippo Valley) where rainfall alone is insufficient.

4. The Eastern Highlands (Altitude: 1,800 m – 2,592 m):
- A narrow 300 km rugged mountain belt along the **Mozambique border**, divided into three ranges from north to south:
  * **Nyanga Mountains:** Home to **Mount Nyangani (2,592 m)** — **the highest peak in Zimbabwe** — plus **Mtarazi Falls (762 m)**, Zimbabwe's tallest waterfall.
  * **Bvumba (Vumba) Mountains:** Lush mist forests, botanical gardens, and coffee/proteas near Mutare.
  * **Chimanimani Mountains:** Dramatic rugged white quartzite crags rising over 2,400 m (**Mt Binga, 2,437 m** on the border), Bridal Veil Falls, and scenic gorges.

5. The Great Dyke of Zimbabwe:
- A world-famous **550 km long, 3–11 km wide** linear geological intrusion (ultramafic & mafic igneous rocks) stretching north–south from **Mutorashanga/Guruve** through **Chegutu/Selous, Shurugwi, and Zvishavane** to **Mberengwa/West Nicholson**.
- Holds massive reserves of **Platinum Group Metals (PGMs), Chrome, Nickel, Gold, and Copper**.`,
    suggestions: [
      'What is the highest mountain in Zimbabwe?',
      'List all major rivers, dams, and waterfalls in Zimbabwe',
      'What minerals are found along the Great Dyke?'
    ]
  },
  {
    id: 'zw_rivers_dams_victoria_falls',
    subject: 'Geography',
    topic: 'Rivers, Major Dams, Lakes & Victoria Falls (Mosi-oa-Tunya) of Zimbabwe',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'rivers in zimbabwe', 'major rivers', 'zambezi', 'limpopo', 'save river', 'mazowe', 'manyame',
      'gwayi', 'runde', 'kariba dam', 'lake kariba', 'tugwi mukosi', 'tokwe mukosi', 'largest dam',
      'largest inland dam', 'lake mutirikwi', 'chivero', 'osborne dam', 'victoria falls',
      'mosi oa tunya', 'mtarazi falls', 'tallest waterfall', 'dams in zimbabwe', 'lakes in zimbabwe'
    ],
    content: `### Major Rivers, Dams, Lakes & Waterfalls of Zimbabwe

1. Major River Drainage Systems:
- **Zambezi River (North Basin):** Forms the northern border with Zambia; plunges over Victoria Falls and feeds Lake Kariba before entering Mozambique's Cahora Bassa and the Indian Ocean. Key Zimbabwean tributaries: **Gwayi, Shangani, Sengwa, Sanyati/Munyati, Manyame (Hunyani), and Mazowe** (via Mozambique).
- **Limpopo River (South Basin):** Forms the entire southern border with South Africa; seasonal sand-river bed in dry months. Key tributaries: **Shashe, Umzingwane, Bubi, and Mwenezi**.
- **Save (Sabi) River (South-East Basin):** Rises near Marondera/Chivhu, flows south past Birchenough Bridge through the Save Valley Conservancy into Mozambique. Key tributaries: **Odzi, Devure, and Runde (Lundi) — fed by Mutirikwi & Tugwi**.
- **Pungwe & Buzi Rivers:** Drain the wet Honde Valley / Eastern Highlands eastward through Mozambique into the Indian Ocean.

2. Major Dams & Artificial Lakes:
- **Lake Kariba & Kariba Dam (Zambezi, 1959):** One of the **world's largest man-made lakes by water volume** (~180 billion m³, 280 km long). Supplies **hydroelectric power** (Kariba South Power Station — 1,050 MW), commercial kapenta fishing, and tourism.
- **Tugwi-Mukosi (Tokwe-Mukosi) Dam (Masvingo, completed 2017):** **Zimbabwe's largest inland dam** (capacity **1.8 billion m³**), providing irrigation to Lowveld sugarcane estates, hydro-potential, and tourism.
- **Lake Mutirikwi (formerly Lake Kyle, Masvingo):** Second-largest inland lake; built in 1960 to irrigate Triangle/Hippo Valley sugarcane and supply Masvingo City.
- **Lake Chivero (formerly McIlwaine) & Lake Manyame (Darwendale):** Built on the Manyame River to supply water to Harare Metropolitan Province.
- **Osborne Dam (Odzi River, Manicaland):** Major water source for irrigation and Mutare expansion.
- **Other Key Dams:** Mazvikadei, Sebakwe (Kwekwe), Insiza/Mayfair, Muzhwi, Zhove, Gwayi-Shangani Dam (under major national pipeline development for Bulawayo).

3. Victoria Falls (*Mosi-oa-Tunya* — "The Smoke that Thunders"):
- Located on the **Zambezi River** at Victoria Falls City (bordering Livingstone, Zambia); named by Dr. David Livingstone in November 1855 after Queen Victoria, long known locally as **Mosi-oa-Tunya** (Kololo) / **Shungu namutitima** (Tonga).
- **Dimensions:** **1,708 metres wide** and up to **108 metres high**, making it the **largest curtain of falling water in the world** (peak flood >500 million litres per minute).
- **Cataracts (West to East):** Devil's Cataract, Main Falls, Horseshoe Falls, Rainbow Falls, and Eastern Cataract — plunging into narrow Zig-Zag Batoka Gorges.
- Designated a **UNESCO World Heritage Site (1989)** and one of the **Seven Natural Wonders of the World**.`,
    suggestions: [
      'List all 5 UNESCO World Heritage Sites in Zimbabwe',
      'What are the 5 Natural Farming Regions of Zimbabwe?',
      'Explain the physical landforms of Zimbabwe'
    ]
  },
  {
    id: 'zw_climate_natural_farming_regions',
    subject: 'Agriculture',
    topic: 'Climate, Seasons & All 5 Natural Farming Regions (Agro-Ecological Zones) of Zimbabwe',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'climate of zimbabwe', 'seasons', 'guti', 'itcz', 'natural farming regions',
      'region 1', 'region 2', 'region 3', 'region 4', 'region 5', 'agro ecological zones',
      'rainfall', 'chiredzi', 'nyanga', 'harare', 'gweru', 'hwange', 'beitbridge'
    ],
    content: `### Climate & Natural Farming Regions of Zimbabwe

**General Climate:** Sub-tropical savanna climate moderated by high altitude on the central plateau. Zimbabwe has **three main seasonal phases**:
- **Rainy Summer Season (November – March):** Driven by the **Inter-Tropical Convergence Zone (ITCZ)** and moist Congo air; heavy afternoon convectional thunderstorms.
- **Cool Dry Winter (May – August):** Clear skies, cold mornings with ground frost on the Highveld, and periodic drizzle/mist in the east/south-east known as **Guti** (from cool moist South-East Trade Winds).
- **Hot Dry Pre-Rains ("Suicide Month" / October):** Highest temperatures (30°C–42°C in Lowveld valleys) before November rains arrive.

### Zimbabwe's 5 Natural Farming Regions (Agro-Ecological Zones):

1. **Natural Region I (Specialised & Diversified Farming — Eastern Highlands):**
   - **Rainfall:** **> 1,000 mm/year** (high, reliable, year-round mist/Guti).
   - **Areas:** Nyanga, Vumba, Chimanimani, Chipinge, Honde Valley.
   - **Farming:** Forestry plantations (pine/wattle), **tea, coffee**, deciduous fruits (apples, peaches), proteas, macadamia nuts, intensive dairy, and seed potatoes.

2. **Natural Region II (Intensive Farming — Regions IIa & IIb):**
   - **Rainfall:** **750 – 1,000 mm/year** (reliable summer rains).
   - **Areas:** Harare, Mazowe, Bindura, Marondera, Macheke, Chinhoyi, Karoi, Chegutu, Norton, Rusape.
   - **Farming:** **Zimbabwe's prime breadbasket**: intensive **maize, flue-cured tobacco, winter wheat, soya beans, groundnuts, citrus, horticulture**, intensive beef, pork, and dairy.

3. **Natural Region III (Semi-Intensive Farming):**
   - **Rainfall:** **650 – 800 mm/year** (frequent mid-season dry spells & uneven distribution).
   - **Areas:** Gweru, Kwekwe, Kadoma, Gokwe, Masvingo North, Mutare low hills, Zvimba South.
   - **Farming:** Drought-tolerant crops (**cotton, maize, sorghum, millet, sunflower, soya**) integrated with **beef ranching** and supplementary irrigation.

4. **Natural Region IV (Semi-Extensive Farming):**
   - **Rainfall:** **450 – 650 mm/year** (low rainfall, periodic seasonal droughts).
   - **Areas:** Bulawayo, Gwanda North, Plumtree, Lupane, Nkayi, Gutu South, Chivi, Masvingo South, Muzarabani.
   - **Farming:** **Extensive beef cattle & goat ranching**, wildlife conservancies, and drought-resistant **small grains** (*mhunga*/pearl millet, *mapfunde*/sorghum, rapoko/*zviyo*) and *Pfumvudza* conservation plots.

5. **Natural Region V (Extensive Farming — Very Dry Lowveld & Zambezi Trough):**
   - **Rainfall:** **< 450 mm/year** (erratic, high evaporation, scorching heat).
   - **Areas:** **Chiredzi, Triangle, Hippo Valley, Mwenezi, Beitbridge**, Binga/Kariba shores, Hwange dry savanna.
   - **Farming:** Extensive **cattle ranching, game/wildlife ranching** (e.g., Save Valley Conservancy, Gonarezhou tourism), drought-hardy goats/small grains, and **large-scale irrigated sugarcane, citrus, and winter maize** fed by Tugwi-Mukosi and Lake Mutirikwi.`,
    suggestions: [
      'What is Pfumvudza / Intwasa agriculture?',
      'List all 10 provinces of Zimbabwe',
      'What are Zimbabwe’s major rivers and dams?'
    ]
  },
  {
    id: 'zw_parks_wildlife_unesco_tourism',
    subject: 'Geography',
    topic: 'Zimbabwe UNESCO World Heritage Sites, National Parks, Big Five & Top Tourist Wonders',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'unesco world heritage', 'national parks', 'hwange', 'gonarezhou', 'mana pools',
      'matobo', 'matopos', 'matusadona', 'chinhoyi caves', 'chirorodziva', 'wildlife',
      'big five', 'tourism in zimbabwe', 'mtarazi falls', 'khami ruins', 'chilojo cliffs'
    ],
    content: `### UNESCO World Heritage Sites, National Parks & Tourism Wonders

1. Zimbabwe's 5 UNESCO World Heritage Sites:
- **Great Zimbabwe National Monument (1986):** 11th–15th century dry-stone granite capital (Hill Complex, Great Enclosure, Conical Tower) in Masvingo.
- **Khami Ruins National Monument (1986):** 15th–17th century stone-terraced Torwa/Rozvi capital west of Bulawayo.
- **Mana Pools, Sapi & Chewore Safari Areas (1984):** Pristine Lower Zambezi floodplain wilderness famous for walking safaris, elephants, hippos, crocodiles, and wild dogs.
- **Victoria Falls / Mosi-oa-Tunya (1989):** World's largest falling curtain of water (shared transboundary site with Zambia).
- **Matobo (Matopos) Hills (2003):** Dramatic balancing granite kopjes containing **over 3,000 San rock art sites**, sacred Njelele shrines, World's View (grave of Cecil Rhodes), and Mzilikazi's grave at Entumbane.

2. Major National Parks & Wildlife Sanctuaries (Managed by ZimParks):
- **Hwange National Park (Matabeleland North):** Largest park (**14,650 km²**); home to one of Africa's largest elephant populations (>45,000), lions, leopards, buffalo, rhinos, giraffes, and endangered African painted (wild) dogs.
- **Gonarezhou National Park (Masvingo Lowveld):** Part of the **Great Limpopo Transfrontier Park**; famed for towering red sandstone **Chilojo Cliffs** along the Runde River and big tusker elephants.
- **Nyanga National Park (Manicaland):** Cool alpine highlands, Mount Nyangani, **Mtarazi Falls (762m)** with skywalk/zip-line, Nyangombe Falls, Ziwa stone terraces, and trout fishing.
- **Matusadona National Park:** Lake Kariba shoreline and Zambezi Escarpment wilderness with black rhino conservation.
- **Chimanimani, Chizarira & Lake Chivero Recreational Park.**

3. The African "Big Five" (All found in Zimbabwe):
- **African Elephant, African Lion, African Leopard, African Buffalo, and Rhinoceros (Black & White Rhino).**

4. Additional Iconic Natural & Cultural Landmarks:
- **Chinhoyi Caves (*Chirorodziva* — "Pool of the Fallen"):** Dolomite limestone caverns containing a crystal-clear cobalt-blue **Sleeping Pool** over 90 metres deep.
- **Domboshava & Epworth Balancing Rocks:** Famous granite balancing formations featured on Zimbabwean banknotes.
- **Birchenough Bridge:** 1935 single-span steel arch bridge over the Save River (once 3rd longest of its kind in the world).
- **Hot Springs (Nyanyadzi / Chimanimani) & Binga Sand Beach.**`,
    suggestions: [
      'Tell me about Great Zimbabwe and Khami Ruins',
      'Explain Victoria Falls (Mosi-oa-Tunya) and Lake Kariba',
      'What are the major minerals mined in Zimbabwe?'
    ]
  },
  {
    id: 'zw_mining_minerals_industry',
    subject: 'Geography',
    topic: 'Mining, Minerals & Heavy Industry in Zimbabwe: Platinum, Lithium, Gold, Diamonds, Coal & Manhize Steel',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'mining in zimbabwe', 'minerals', 'platinum', 'lithium', 'bikita', 'arcadia', 'gold mining',
      'marange', 'chiadzwa', 'diamonds', 'hwange coal', 'manhize', 'dinson steel', 'zimplats',
      'black granite', 'mutoko', 'chrome', 'beneficiation', 'makorokoza', 'fidelity'
    ],
    content: `### Mining, Minerals & Industrialisation in Zimbabwe

Mining contributes **over 60% of Zimbabwe's total export earnings**. Zimbabwe hosts more than **40 commercial mineral commodities**:

1. Platinum Group Metals (PGMs) — World's 2nd–3rd Largest Reserves:
- Extracted along the **Great Dyke** by **Zimplats** (Ngezi/Selous), **Unki Mine** (Shurugwi), and **Mimosa** (Zvishavane). Co-products include platinum, palladium, rhodium, nickel, and copper.

2. Lithium ("White Gold" of the Global Green Transition — Africa's Largest Reserves):
- Essential for electric-vehicle (EV) batteries and solar storage.
- Major operations: **Bikita Minerals** (Masvingo — oldest/largest petalite & spodumene deposit), **Arcadia Lithium** (Goromonzi), **Kamativi** (Matabeleland North), **Sabi Star** (Buhera), and **Zulu Lithium** (Fort Rixon). Government policy mandates **in-country beneficiation** into lithium concentrates and salts.

3. Gold (Top Single Foreign Currency Earner):
- Distributed across greenstone belts nationwide: **Mazowe, Shamva, Bindura (Freda Rebecca), Kadoma, Kwekwe, Shurugwi, Blanket (Gwanda), How Mine (Bulawayo)**.
- Artisanal & small-scale miners (*makorokoza* / registered small-scale) produce over half of deliveries bought by **Fidelity Gold Refinery**.

4. Diamonds:
- **Alluvial Diamonds:** **Marange / Chiadzwa** fields (Mutare District — consolidated under **Zimbabwe Consolidated Diamond Company, ZCDC**).
- **Kimberlite Pipe Diamonds:** **Murowa Diamonds** (Zvishavane).

5. Iron Ore, Steel & **Dinson Iron & Steel Company (Manhize)**:
- Vast iron ore reserves at **Mwanesi, Buchwa, and Redcliff** (historic ZISCOSTEEL site).
- New regional industrial flagship: **Dinson Iron and Steel Company (DISCO)** at **Manhize** (straddling Midlands/Mashonaland East/West near Mvuma/Chivhu), producing pig iron, steel billets, and deformed bars to turn Zimbabwe into a Southern African steel powerhouse.

6. Coal, Chrome, Black Granite & Nickel:
- **Coal & Coke:** **Hwange Colliery** & Makomo/Zambezi Gas (powering Hwange Thermal Power Station and ferrochrome smelters).
- **Chromite / Ferrochrome:** Shurugwi, Mutorashanga, Lalapanzi (**Zimasco, ZimAlloys**).
- **Black Granite:** Exported globally from **Mutoko & Murehwa** quarries.
- **Nickel:** Bindura (**Trojan Nickel Mine**).

7. Key Mining Challenges & Solutions in ZIMSEC Exams:
- *Challenges:* Environmental land degradation/siltation, mercury/cyanide pollution by illegal *makorokoza*, mine shaft collapses, electricity shortages, and exporting raw ore instead of refined goods.
- *Solutions:* Formalisation & EMA enforcement, zero-raw-export beneficiation policy (smelters & refineries), captive solar/thermal power, and community share ownership trusts.`,
    suggestions: [
      'Explain the geology of the Great Dyke',
      'What are Zimbabwe’s main agricultural crops and Pfumvudza?',
      'What is ZiG (Zimbabwe Gold) currency?'
    ]
  },
  {
    id: 'zw_agriculture_pfumvudza',
    subject: 'Agriculture',
    topic: 'Zimbabwe Agriculture: Cash Crops, Food Security, Livestock & Pfumvudza / Intwasa',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'agriculture in zimbabwe', 'pfumvudza', 'intwasa', 'tobacco', 'maize', 'winter wheat',
      'cotton', 'sugar cane', 'triangle', 'hippo valley', 'gmb', 'timb', 'horticulture',
      'climate smart agriculture', 'food security', 'a1 a2 farming'
    ],
    content: `### Zimbabwe Agriculture, Cash Crops & Pfumvudza / Intwasa

Zimbabwe is an agro-based economy supporting **over 65% of livelihoods**:

1. Staple Food & Grain Production:
- **Maize:** National staple (*sadza / isitshwala*); marketed through the **Grain Marketing Board (GMB)**.
- **Winter Wheat:** Massive irrigation expansion lifted annual production above **460,000–560,000+ tonnes**, making Zimbabwe **wheat self-sufficient** for national bread/flour needs.
- **Traditional Small Grains:** **Sorghum (*mapfunde*), Pearl Millet (*mhunga*), Finger Millet (*rapoko / zviyo*)** — strongly promoted in dry Regions IV & V for drought resilience.

2. Major Cash & Export Crops:
- **Flue-Cured Tobacco:** Zimbabwe's top agricultural export (**over 230–296 million kg/year**), regulated by **TIMB** with auction floors in Harare (TSF, Boka, Premier) and contract farming in Karoi, Rusape, Marondera, Mvurwi, and Bindura.
- **Sugar Cane:** Grown exclusively under irrigation in the **South-Eastern Lowveld (Triangle, Hippo Valley, Mkwasine — Chiredzi)** fed by Tugwi-Mukosi and Lake Mutirikwi; generates refined sugar and **green ethanol** for fuel blending.
- **Cotton ("White Gold"):** Major smallholder cash crop in Gokwe, Sanyati, Muzarabani, and Checheche (Cotton Company of Zimbabwe — Cottco).
- **Tea, Coffee & Macadamia:** **Tanganda & Eastern Highlands** (Chipinge, Honde Valley).
- **Horticulture & Citrus:** **Mazowe Citrus**, Beitbridge citrus, blueberries, avocados, peas, and cut flowers.

3. Livestock Production:
- **Beef Cattle:** Commercial & communal ranching concentrated in Matabeleland North/South, Midlands, and Masvingo (indigenous hardy **Mashona, Tuli, and Nkone** breeds).
- **Dairy, Poultry, Pigs & Goats:** Expanding small-stock resilience under rural presidential livestock schemes.

4. *Pfumvudza / Intwasa* (Climate-Smart Conservation Agriculture):
- **Core Concept:** Precision high-yield smallholder plots (typically **39m × 16m** or **0.0625 ha** producing enough grain to feed a family for a year) using three **Foundations for Farming** pillars:
  1. **Minimum Tillage:** Digging permanent planting basins (*makomba*) instead of deep ploughing, preserving soil structure and reducing erosion.
  2. **Heavy Organic Mulching:** Covering soil with crop stover/grass to trap moisture (surviving 2–3 week mid-season dry spells) and suppress weeds.
  3. **Precision Inputs, Timely Planting & Crop Rotation:** Applying exact cup measures of manure, Basal NPK, and Top-dressing directly into stations, rotating cereals with legumes (groundnuts/cowpeas) to fix nitrogen.`,
    suggestions: [
      'Explain Zimbabwe’s 5 Natural Farming Regions',
      'How did the 2000 Fast-Track Land Reform (A1 and A2) work?',
      'What is ZiG currency and how is it backed?'
    ]
  },
  {
    id: 'zw_economy_currency_zig_blocs',
    subject: 'Social Science',
    topic: 'Zimbabwe Economy, Currency Evolution (ZWD to ZiG), Institutions & SADC / AU / UN Membership',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'economy of zimbabwe', 'zig', 'zimbabwe gold', 'currency history', 'rbz', 'reserve bank',
      'zimra', 'zida', 'vfex', 'zse', 'sadc', 'comesa', 'african union', 'afcfta', 'united nations',
      'john mushayavanhu', 'vision 2030', 'nds1'
    ],
    content: `### Economy, Currency Evolution (ZiG) & Regional / Global Organisations

1. Evolution of Zimbabwe's Currency:
- **1980 – 2009 (Zimbabwe Dollar — ZWD):** Replaced the Rhodesian Dollar at independence; suffered severe hyperinflation in 2007–2008.
- **2009 – 2019 (Multi-Currency System):** Stabilised economy using USD, ZAR, and regional currencies; Bond Coins (2014) and Bond Notes (2016) introduced for change and export incentives, transitioning to **RTGS / ZWL** (2019).
- **5 April 2024 – Present: ZiG (Zimbabwe Gold):**
  * Launched by the **Reserve Bank of Zimbabwe (RBZ)** under Governor Dr. John Mushayavanhu as a structured currency **backed 100% by a composite basket of physical gold, precious minerals, and foreign currency reserves**.
  * Notes & coins (1 ZiG to 200 ZiG) display **Chiremba/Epworth Balancing Rocks**, mineral/wildlife heritage, and gold-mint motifs.
  * Coexists with the statutory multi-currency regime while promoting **de-dollarisation** and price stability.

2. Key Economic & Financial Institutions:
- **RBZ (Reserve Bank of Zimbabwe):** Central bank managing monetary policy, gold reserves, bank supervision, and inflation control.
- **ZIMRA (Zimbabwe Revenue Authority):** Collects customs duties, VAT, PAYE, and corporate taxes for public infrastructure.
- **ZIDA (Zimbabwe Investment and Development Agency):** One-stop investment promotion agency.
- **ZSE (Zimbabwe Stock Exchange)** & **VFEX (Victoria Falls Stock Exchange):** Capital markets (VFEX is a USD-denominated offshore-style exchange in Victoria Falls attracting mining and global capital).

3. National Development Strategy & International Blocs:
- **Vision 2030 & NDS1 (2021–2025) / NDS2:** Economic blueprint targeting value addition, devolution, infrastructure, and food security.
- **SADC (Southern African Development Community):** Founded in 1980 as SADCC (with Zimbabwe as a founding frontline member) and transformed in 1992. **Zimbabwe hosted the 44th SADC Summit in Harare (August 2024)** and assumed the **SADC Chairmanship (2024–2025)**.
- **COMESA** (Common Market for Eastern & Southern Africa), **AfCFTA** (African Continental Free Trade Area), **African Union (AU)**, and **United Nations (UN)**.`,
    suggestions: [
      'Compare Fiscal Policy vs Monetary Policy in Zimbabwe',
      'What are Zimbabwe’s main mineral exports?',
      'Who are the Presidents and Vice Presidents of Zimbabwe?'
    ]
  },
  {
    id: 'zw_precolonial_states_stone_age',
    subject: 'History',
    topic: 'Complete Pre-Colonial History of Zimbabwe: San, Iron Age, Great Zimbabwe, Mutapa, Torwa, Rozvi & Ndebele States',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'pre colonial zimbabwe', 'pre-colonial states', 'san rock art', 'iron age', 'gokomere',
      'mapungubwe', 'great zimbabwe', 'mutapa state', 'munhumutapa', 'nyatsimba mutota', 'matope',
      'torwa state', 'khami', 'rozvi empire', 'changamire dombo', 'danangombe', 'manyanga',
      'ndebele state', 'mzilikazi', 'lobengula', 'mfecane', 'amabutho', 'nxwala'
    ],
    content: `### Pre-Colonial Civilisations of Zimbabwe (San to the Ndebele Kingdom)

1. Late Stone Age & Bantu Iron Age Foundations:
- **San (Bushmen) Hunter-Gatherers:** Earliest inhabitants leaving **over 3,000 rock paintings** in **Matobo Hills, Domboshava, and Epworth** depicting hunting, trance dances, and wildlife.
- **Early & Late Iron Age (c. 200 – 1000 CE):** Bantu-speaking agro-pastoralists (**Gokomere, Ziwa, Mabveni, Leopard's Kopje** cultures) introduced iron smelting, pottery, cattle herding, and crop farming (*mhunga, mapfunde, zviyo*).
- **Mapungubwe State (1075 – 1220s CE):** Ancestor kingdom on the Shashe–Limpopo confluence (famous for the golden rhinoceros) whose gold/ivory Indian Ocean trade shifted north to Great Zimbabwe.

2. Great Zimbabwe State (c. 1100 – 1450 CE):
- Built without mortar from precision-fitted granite blocks (**3 major zones:** Hill Complex, Great Enclosure with its 10m **Conical Tower**, and Valley Ruins).
- Economy: Cattle herding, agriculture, iron/copper smithing, and Swahili-Arab coastal gold/ivory trade (glass beads, Chinese celadon porcelain discovered on site).
- Decline (~1450): Salt/timber depletion, overgrazing, ecological strain, and succession shifts northwards.

3. Mutapa (Munhumutapa) Empire (c. 1430s – 19th Century):
- Founded in northern Dande/Chidima by **Nyatsimba Mutota** seeking salt and pastures; expanded to the Indian Ocean by **Nyanhewe Matope**.
- Confronted Portuguese traders and *prazeiros* (*Antonio Fernandes*, missionary *Gonçalo da Silveira* 1561, failed *Barreto* expedition 1571); later resisted Portuguese interference (*Changamire* & *Mutapa* alliances).

4. Torwa State (c. 1450 – 1680s) & Khami:
- Rose in the south-west (Bulawayo area), shifting from free-standing walls to elaborate stone **retaining platforms** decorated with chevron and checker patterns at **Khami**.

5. Rozvi Empire (c. 1680s – 1830s):
- Founded by **Changamire Dombo** (renowned military strategist who expelled Portuguese inland fairs in 1693 at Dambarare).
- Capitals: **Danangombe (Dhlo-Dhlo)** and **Manyanga (Ntabazikamambo)**. Controlled tribute across Shona polities until weakened by droughts and **1830s Mfecane migrations** (*Zwangendaba*'s Ngoni, *Nyamazana*, *Nxaba*, and *Mzilikazi*'s Ndebele).

6. The Ndebele State (1840 – 1893):
- Founded by **King Mzilikazi Khumalo**, who broke from Shaka's Zulu Kingdom (~1821–22) during the **Mfecane**, crossing the Limpopo (1838–40) to settle in Matabeleland (capital *Inyati / Mahlokohloko*, then **Bulawayo** under **King Lobengula**, r. 1870–1894).
- Structured into three social strata (*Zansi, Enhla, Hole*) and disciplined military regimental towns (*Amabutho*) led by *Indunas*; celebrated the **Inxwala** first-fruits national ceremony.`,
    suggestions: [
      'Explain the treaties and colonisation of Zimbabwe (1887–1893)',
      'Compare Great Zimbabwe, Mutapa, and Rozvi states',
      'What caused the First Chimurenga / Umvukela of 1896–1897?'
    ]
  },
  {
    id: 'zw_colonial_treaties_laws_udi',
    subject: 'History',
    topic: 'Colonisation of Zimbabwe: Treaties (Grobler, Moffat, Rudd), BSAC, Pioneer Column, Land Acts & UDI',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'colonisation of zimbabwe', 'grobler treaty', 'moffat treaty', 'rudd concession',
      'pioneer column', 'bsac', 'cecil john rhodes', 'anglo ndebele war', '1893',
      'land apportionment act', '1930', 'land husbandry act', 'land tenure act',
      'federation of rhodesia', 'udi', 'ian smith', '1965'
    ],
    content: `### Treaties, Occupation, Colonial Land Dispossession & UDI (1887 – 1969)

1. Scramble & Deceptive Treaties with King Lobengula:
- **Grobler Treaty (July 1887):** Friendship and military-aid treaty between Boer Transvaal agent Piet Grobler and Lobengula (alarmed Britain's Cecil John Rhodes).
- **Moffat Treaty (11 February 1888):** Negotiated by missionary John Smith Moffat; Lobengula agreed **not to enter into any treaty or cede territory** to foreign powers without British High Commissioner consent — effectively cancelling the Grobler Treaty.
- **Rudd Concession (30 October 1888):** Signed by Lobengula with Charles Rudd, Rochfort Maguire, and Francis Thompson. **Deception:** Verbally promised limited gold digging by "at most 10 men" and **1,000 Martini-Henry rifles, £100/month, and a Zambezi gunboat**; the written text ceded *complete and exclusive charge over all metals and minerals* and power to exclude rivals. Lobengula later repudiated it (*"A chameleon catches a fly..."*).

2. BSAC Royal Charter & The Pioneer Column (1889 – 1893):
- **29 October 1889:** Queen Victoria granted Rhodes's **British South Africa Company (BSAC)** a Royal Charter.
- **Pioneer Column (1890):** Guided by Frederick Selous (~200 pioneers + 500 BSAC police), avoided Bulawayo and raised the Union Jack at **Fort Tuli -> Fort Victoria (Masvingo) -> Fort Charter -> Fort Salisbury (Harare) on 12 September 1890**.
- **1893 Anglo-Ndebele War:** Sparked by BSAC thirst for Mashonaland–Matabeleland gold belt and the **Victoria Incident**; Maxim machine guns overwhelmed Ndebele regiments (*Mbembesi, Shangani*). Lobengula disappeared northwards (1894); Matabeleland was annexed.

3. Settler Legislation & Racial Land Alienation:
- **1923:** Southern Rhodesia became a self-governing British colony (excluding majority African franchise).
- **1930 Land Apportionment Act:** Legally divided Zimbabwe on racial lines — reserving **~51% of fertile Highveld land** for tiny European minorities while crowding indigenous Africans into dry, tsetse-prone *Native Reserves / Tribal Trust Lands*.
- **1951 Native Land Husbandry Act:** Strictly limited African cattle herds and fragmented communal tenure, driving mass rural anger into nationalism.
- **1953 – 1963 Federation of Rhodesia & Nyasaland:** Forced union of Southern Rhodesia, Northern Rhodesia (Zambia), and Nyasaland (Malawi), bitterly opposed by African nationalists.
- **11 November 1965 (UDI):** **Ian Smith**'s Rhodesian Front issued the **Unilateral Declaration of Independence** to entrench white minority rule; followed by the **1969 Land Tenure Act** (splitting land 50/50 regardless of >95% African population).`,
    suggestions: [
      'Explain the First Chimurenga (1896–1897) and Second Chimurenga (1966–1979)',
      'Who were Mbuya Nehanda and Sekuru Kaguvi?',
      'What happened at the Lancaster House Conference in 1979?'
    ]
  },
  {
    id: 'zw_first_second_chimurenga_heroes',
    subject: 'History',
    topic: 'First Chimurenga / Umvukela (1896–97), Second Chimurenga (1966–79), Lancaster House & National Heroes',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'first chimurenga', 'second chimurenga', 'umvukela', 'nehanda', 'kaguvi', 'mukwati',
      'umlugulu', 'mapondera', 'chinhoyi battle', '28 april 1966', 'zanla', 'zipra',
      'tongogara', 'chitepo', 'takawira', 'mangena', 'muzenda', 'lancaster house',
      'national heroes', 'mgagao declaration', 'chimoio', 'nyadzonia'
    ],
    content: `### First & Second Chimurenga / Umvukela and Gallant Heroes of Zimbabwe

1. First Chimurenga / Umvukela (1896 – 1897):
- **Grievances:** Land seizures after 1893, cattle looting (after the Jameson Raid), **Hut Tax (1894)**, forced labour (**Chibharo**), brutal BSAC police abuses, and natural disasters blamed on colonial rule (**rinderpest, locusts, drought**).
- **Spirit Mediums & Commanders:** Coordinated across Matabeleland (March 1896) and Mashonaland (June 1896) by **Umlugulu Khumalo, Mukwati (Mlimo shrine)**, **Mbuya Nehanda Nyakasikana** (Mazowe/Chiweshe — executed 27 April 1898 declaring *"Mapfupa angu achamuka / My bones shall rise again"*), **Sekuru Kaguvi Gumboreshumba**, **Chief Chingaira Makoni**, **Chief Mashayamombe**, and **Kadzima Mapondera** (fighting until 1903).

2. Rise of Mass Nationalism & Liberation Parties:
- Early protests: **ICU** (Masotsha Ndlovu, Charles Mzingeli), **Benjamin Burombo** (British African Voice Association).
- **City Youth League (1955):** James Chikerema & George Nyandoro -> **SRANC (1957)** -> **NDP (1960)** -> **ZAPU (Dec 1961)** led by **Dr. Joshua Mqabuko Nkomo** -> **ZANU (8 Aug 1963)** led by **Ndabaningi Sithole, Leopold Takawira, Herbert Chitepo, Robert Mugabe**.

3. Second Chimurenga / Armed Struggle (1966 – 1979):
- **28 April 1966 — Battle of Chinhoyi:** Seven ZANLA freedom fighters (*Simon Chimbodza, Christopher Chatambudza, Nathan Charumuka, Godwin Manyerenyere, Ephraim Shenjere, David Guzuzu, Arthur Maramba*) engaged Rhodesian forces, igniting the sustained armed struggle.
- **Military Wings:**
  * **ZANLA** (ZANU — operated mainly from Tanzania/Mozambique across north-east & east; commanded by **Gen. Josiah Magama Tongogara** and **Solomon Mujuru / Rex Nhongo**).
  * **ZIPRA** (ZAPU — operated from Zambia across north/west; commanded by **Jason Ziyapapa Moyo, Alfred Nikita Mangena, Lookout Masuku**).
- **Sacrifices & Turning Points:** 1975 assassination of **Herbert Chitepo**; **1975 Mgagao Declaration**; brutal cross-border raids on refugee camps at **Nyadzonia (1976)** and **Chimoio (1977)**; crucial **Frontline States** backing (Samora Machel, Julius Nyerere, Kenneth Kaunda, Seretse Khama) and training support from China, USSR, Cuba, Tanzania.

4. Lancaster House Agreement & Independence (1979 – 1980):
- **Sept – Dec 1979:** **Patriotic Front** (co-led by Robert Mugabe & Joshua Nkomo) negotiated the ceasefire & majority-rule constitution in London.
- **February 1980 Elections:** ZANU-PF won **57 of 80** common-roll seats (PF-ZAPU won 20).
- **18 April 1980:** Sovereign **Republic of Zimbabwe** born at Rufaro Stadium with Robert Mugabe as Prime Minister and Canaan Banana as President.`,
    suggestions: [
      'Who were Dr. Joshua Nkomo, Josiah Tongogara, and Herbert Chitepo?',
      'What was the 1987 Unity Accord?',
      'Explain the 2000 Fast-Track Land Reform Programme'
    ]
  },
  {
    id: 'zw_unhu_culture_totems_rites',
    subject: 'Social Science',
    topic: 'Unhu / Ubuntu Philosophy, Totems (Mitupo), Kinship (Ukama), Roora, Nhimbe, Zunde raMambo & Ceremonies',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'unhu', 'ubuntu', 'vumunhu', 'totems', 'mitupo', 'izibongo', 'ukama', 'roora', 'lobola',
      'nhimbe', 'ilima', 'zunde ramambo', 'isiphala senkosi', 'kurova guva', 'umbuyiso',
      'bira', 'mukwerera', 'sahwira', 'vatete', 'dare', 'indigenous culture zimbabwe'
    ],
    content: `### Indigenous Cultural Heritage, Philosophy & Social Institutions of Zimbabwe

1. *Unhu / Ubuntu / Vumunhu* Philosophy:
- Summarised by **"Munhu munhu nekuda kwevanhu"** (Shona) / **"Umuntu ngumuntu ngabantu"** (Ndebele) — *"I am because we are."*
- Core values: Respect for elders (*kukudza vakuru*), hospitality (*kugamuchira vaeni*), honesty, empathy, communal solidarity, hard work, and moral accountability.

2. Totems (*Mitupo* in ChiShona / *Izibongo* in IsiNdebele):
- Sacred clan emblems inherited patrilineally, linking families across generations (e.g., **Shumba / Sibanda** [Lion], **Zhou / Ndlovu** [Elephant], **Mhofu / Mpofu** [Eland], **Moyo / Dube** [Heart / Zebra], **Soko / Ncube** [Monkey/Baboon], **Tembo / Dube** [Zebra], **Hungwe / Nyoni** [Fish Eagle], **Ngara** [Porcupine]).
- **Functions:**
  * Prevents marriage between close kin (incest taboo — same *mutupo* = siblings).
  * **Indigenous Wildlife Conservation:** Clan members never eat or kill their totem animal (*kudya mutupo* brings spiritual misfortune such as losing teeth), naturally protecting species.

3. Key Community & Economic Institutions:
- **Nhimbe / Ilima:** Traditional cooperative community work party where neighbours gather to clear fields, weed, harvest, or build roofs together, rewarded with communal food and traditional brew (*doro / utshwala* / *maheu*).
- **Zunde raMambo / Isiphala seNkosi ("The Chief's Granary"):** Communal fields planted by villagers at the Chief's homestead; harvested grain is stored as a **social safety net** to feed orphans (*nherera*), widows (*chirikadzi*), elderly, and drought-stricken families.
- **Roora / Lobola:** Dignified cultural marriage exchange uniting two *Ukama* families (including *rusambo*, cattle/*danga*, and the sacred *mombe yeumai / inkomo yohlanga* honouring the mother).
- **Dare / Inkundla:** Village or chief's council where elders mediate family and community disputes fairly through restorative justice.

4. Sacred Ceremonies & Family Roles:
- **Kurova Guva / Umbuyiso:** Traditional ceremony held ~1 year after burial to welcome back the spirit of a deceased parent/elder as a protective ancestral guardian (*mudzimu*).
- **Bira:** All-night ancestral consultation ceremony guided by *mbira* music, *hosho*, and spirit mediums (*masvikiro*).
- **Mukwerera / Mafuwe / Ukucela Izulu:** Seasonal rain-asking ceremonies conducted under sacred trees (*muchakata / muhacha*).
- **Vatete (Paternal Aunt) & Sahwira (Trusted Ritual Friend):** Essential family counsellors, conflict mediators, and funeral/ceremonial stewards.`,
    suggestions: [
      'Describe traditional Zimbabwean foods, instruments, and dances',
      'What are the 16 officially recognised languages of Zimbabwe?',
      'Give me ChiShona proverbs (Tsumo) and everyday phrases'
    ]
  },
  {
    id: 'zw_arts_music_dances_cuisine',
    subject: 'Physical Edu & Arts',
    topic: 'Traditional Instruments, Dances, Stone Sculpture, Basketry & Authentic Cuisine of Zimbabwe',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'zimbabwe food', 'traditional food', 'sadza', 'isitshwala', 'madora', 'amacimbi',
      'mbira', 'hosho', 'marimba', 'ngoma', 'chipendani', 'jerusarema', 'mbende',
      'muchongoyo', 'isitshikitsha', 'dinhe', 'mbakumba', 'stone sculpture', 'tonga basketry',
      'maheu', 'mutakura', 'dovi', 'derere'
    ],
    content: `### Traditional Arts, Music, Dances & Authentic Cuisine of Zimbabwe

1. Traditional Musical Instruments:
- **Mbira dzavadzimu & Nyunga Nyunga Mbira:** Iconic thumb-piano with forged iron keys mounted on a wooden soundboard (*gwariva*) nestled inside a calabash resonator (*deze*) with bottle-top/shell buzzers (*machacha*). Used in sacred *Bira* ceremonies and modern *Chimurenga* music.
- **Hosho:** Paired calabash gourd rattles filled with *hota* (*Canna*) seeds providing rhythmic accompaniment.
- **Ngoma (Traditional Drums):** Wooden goblet drums covered with animal hide (e.g., *mutumba* tall bass drum, *mhito*, *gandira*).
- **Marimba:** African xylophone popularised in Zimbabwean schools and ensembles (e.g., Kwanongoma College of Music).
- **Chipendani & Chigufe:** Traditional musical bow and bamboo/reed flute.

2. Traditional Dances & Heritage Regions:
- **Mbende / Jerusarema (Murehwa/Uzumba — Zezuru):** Celebratory fertility/community dance proclaimed a **UNESCO Masterpiece of Oral & Intangible Heritage (2005)**.
- **Muchongoyo (Chipinge/Chimanimani — Ndau):** Energetic stamped war-and-victory stick/shield dance rooted in Ngoni-Ndau heritage.
- **Isitshikitsha & Amabhiza (Matabeleland — Ndebele/Kalanga):** Graceful royal celebratory and rain-associated ceremonial dances accompanied by handclapping and ululation.
- **Dinhe (Korekore)**, **Mbakumba (Karanga — Masvingo harvest dance)**, and **Nyau / Gule Wamkulu** (Chewa masked dance).

3. Visual Arts & Indigenous Crafts:
- **Shona Stone Sculpture:** Internationally acclaimed serpentine & springstone carvings (Tengenenge, Chapungu — masters include **Nicholas Mukomberanwa, Bernard Matemera, Henry Munyaradzi, Sylvester Mubayi, Dominic Benhura**).
- **Tonga Basketry (Binga):** Geometric *ilala* palm-frond woven baskets (*nsengu / ilala*).
- **Pottery (*Hari*):** Fired clay pots (*pfuko, gate, chirongo, hadyana*) made for cooking and cooling water.

4. Authentic Traditional Zimbabwean Cuisine:
- **Sadza / Isitshwala:** Thick staple porridge cooked from **white maize (*chibage*), finger millet (*zviyo/rapoko*), pearl millet (*mhunga*), or sorghum (*mapfunde*)**.
- **Relishes (*Usavi / Isitshebo*):** **Muriwo une dovi** (leafy greens in peanut butter), **Nyama yehuku yemusha / Roadrunner** (free-range chicken), **Madora / Amacimbi** (protein-rich mopane worms), **Matemba / Kapenta** (Lake Kariba dried small fish), **Derere** (okra), **Nyevhe** (cleome spider flower), **Mazondo** (cow hooves).
- **Traditional Snacks & Drinks:** **Mutakura** (boiled groundnuts, roundnuts/*nyimo*, cowpeas & maize), **Rupiza** (roasted cowpea mash with peanut butter), **Nhopi** (pumpkin & peanut butter porridge), **Bota** (breakfast porridge), **Maheu / Amahewu** (fermented nutritious maize-malt drink), **Mazowe Orange Crush**, and indigenous wild fruits (**Mazhanje, Matohwe, Masawu, Mauyu/Baobab, Tsubvu**).`,
    suggestions: [
      'Tell me about Zimbabwean musicians like Oliver Mtukudzi and Thomas Mapfumo',
      'Explain Unhu / Ubuntu and totems (Mitupo)',
      'What are the 5 UNESCO World Heritage Sites in Zimbabwe?'
    ]
  },
  {
    id: 'zw_education_universities_infrastructure',
    subject: 'Social Science',
    topic: 'Education in Zimbabwe (HBC, Education 5.0, ZIMSEC, All Universities) & Major National Infrastructure',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'education in zimbabwe', 'education 5.0', 'heritage based curriculum', 'hbc', 'zimsec',
      'universities in zimbabwe', 'university of zimbabwe', 'nust', 'msu', 'cut', 'buse', 'hit',
      'gzu', 'lsu', 'africa university', 'infrastructure', 'hwange units 7 8', 'kariba hydro',
      'mbudzi interchange', 'trabablas', 'rgm airport', 'beitbridge'
    ],
    content: `### Education System, Universities & Major Infrastructure of Zimbabwe

1. School Curriculum & Examinations (MoPSE & ZIMSEC):
- **Primary (ECD A–B, Grades 1–7):** Concludes with national **Grade 7 ZIMSEC Examinations** across **6 official subjects** (English, Mathematics, Agric Science & Tech, Indigenous Language, Social Science, Physical Education & Arts) graded on **Units 1–9** (6 Units = perfect aggregate).
- **Secondary (Forms 1–4 O-Level; Forms 5–6 A-Level):** O-Level graded A–U (Grade C or better is a standard pass; 5 O-Levels including English & Mathematics is standard benchmark).
- **Heritage-Based Curriculum (HBC, 2024 – 2030):** Replaced the heavy Continuous Assessment Learning Activities (CALA) framework with streamlined, heritage-grounded **School-Based Projects (SBP)** fostering problem-solving using local Zimbabwean resources.
- **Education 5.0 (Higher & Tertiary Education):** Adds **Innovation and Industrialisation** to Teaching, Research, and Community Service — spawning university innovation hubs and industrial parks producing medicines, oxygen, steel parts, and software locally.

2. Major Universities in Zimbabwe (State & Private):
- **University of Zimbabwe (UZ — Harare, est. 1955):** Oldest and premier comprehensive university.
- **NUST** (National University of Science & Technology — Bulawayo).
- **MSU** (Midlands State University — Gweru & Zvishavane).
- **CUT** (Chinhoyi University of Technology), **HIT** (Harare Institute of Technology), **BUSE** (Bindura University of Science Education), **GZU** (Great Zimbabwe University — Masvingo), **LSU** (Lupane State University), **ZOU** (Zimbabwe Open University), **MUAST** (Marondera University of Agricultural Sciences & Technology), **MSUAS** (Manicaland State University of Applied Sciences), **GSU** (Gwanda State University), **PAULESI / Pan-African & specialised colleges**.
- **Private & Church Universities:** **Africa University** (Mutare), **Solusi University** (Bulawayo/Figtree), **ZEGU** (Bindura), **Women's University in Africa (WUA)**, **Catholic University in Zimbabwe (CUZ)**, **Reformed Church University**, **Arrupe Jesuit University**.

3. Energy, Water & Transport Infrastructure Milestones:
- **Power Generation:** **Kariba South Hydro Station** (expanded to 1,050 MW), **Hwange Thermal Power Station** (expanded by **Units 7 & 8 adding 600 MW** to the national grid), plus growing utility/rooftop **solar PV**.
- **Transport & Ports:** Upgraded **Robert Gabriel Mugabe International Airport** (Harare), **Victoria Falls** & **Joshua Mqabuko Nkomo** Airports; **Beitbridge Border Post** modernisation; dualisation/rehabilitation of the **Harare–Masvingo–Beitbridge Highway**; **Trabablas (Mbudzi) Traffic Interchange** in Harare; **National Railways of Zimbabwe (NRZ)** freight corridor.`,
    suggestions: [
      'How does the ZIMSEC Grade 7 grading system (Units 1 to 9) work?',
      'What is the Heritage-Based Curriculum and School-Based Projects?',
      'Tell me about Zimbabwe’s music, literature, and sporting legends'
    ]
  },
  {
    id: 'zw_literature_music_sports_icons',
    subject: 'Physical Edu & Arts',
    topic: 'Zimbabwean Literature, Music Legends, Sports Teams & Olympic / Sporting Icons',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'zimbabwe literature', 'zimbabwe authors', 'oliver mtukudzi', 'thomas mapfumo', 'stella chiweshe',
      'tsitsi dangarembga', 'charles mungoshi', 'dambudzo marechera', 'solomon mutswairo',
      'zimbabwe sports', 'warriors', 'mighty warriors', 'chevrons', 'gems', 'sables',
      'kirsty coventry', 'peter ndlovu', 'andy flower', 'sikandar raza', 'cara black', 'elliot mujaji'
    ],
    content: `### Zimbabwean Literature, Music, Sports & Prominent Icons

1. Celebrated Zimbabwean Writers & Literature:
- **Prof. Solomon Mutswairo:** Author of *Feso* (1956, first Shona novel) and lyricist of the **National Anthem**.
- **Charles Mungoshi:** Bilingual literary giant (*Waiting for the Rain*, *Ndiko Kupindana Kwamazuva*, *Kunyarara Hakusi Kutaura?*).
- **Tsitsi Dangarembga:** Globally acclaimed author of *Nervous Conditions* (African Writers landmark) and *This Mournable Body*.
- **Dambudzo Marechera:** Guardian Fiction Prize winner for *The House of Hunger* (1978).
- **Yvonne Vera:** *Nehanda*, *Without a Name*, *Butterfly Burning*.
- **Shimmer Chinodya** (*Harvest of Thorns*), **Chenjerai Hove** (*Bones*), **Aaron Chiundura Moyo**, **Pathisa Nyathi** (Ndebele history/heritage scholar), **Petina Gappah**.

2. Iconic Zimbabwean Musicians & Genres:
- **Dr. Oliver "Tuku" Mtukudzi (1952–2019, National Hero):** Creator of **Tuku Music** blending *mbira*, *mbaqanga*, and acoustic soul (*Todii, Neria, Bvuma, Wasakara*).
- **Thomas "Mukanya" Mapfumo:** Pioneer of **Chimurenga Music**, adapting traditional *mbira* lines onto electric guitars to inspire liberation and social commentary.
- **Mbuya Stella Chiweshe:** *"Queen of Mbira"* who carried sacred Shona *mbira dzavadzimu* onto world stages.
- **Other Legends:** **Bhundu Boys** (*Jit* music), **Simon Chimbetu** (*Sungura/Dendera*), **Leonard Dembo** (*Chitekete*), **Lovemore Majaivana**, **Solomon Skuza**, **Chiwoniso Maraire**, **Alick Macheso**, **Mokoomba**, **Jah Prayzah**, **Winky D**.

3. National Sports Teams & World-Class Sporting Icons:
- **Football (Soccer):** Men's **The Warriors** (multiple COSAFA Cups & AFCON finals — legends **Peter "Nsukuzonke" Ndlovu**, **Moses Chunga**, **George Shaya**, **Bruce Grobbelaar**, **Benjani Mwaruwari**, **Knowledge Musona**) and Women's **Mighty Warriors** (2016 Rio Olympics).
- **Cricket:** Men's **The Chevrons** (Test nation since 1992; **Andy Flower, Grant Flower, Heath Streak, Henry Olonga, Tatenda Taibu, Sikandar Raza**) & **Lady Chevrons**.
- **Netball:** **The Gems** (inspired the nation with an 8th-place finish on debut at the 2019 Netball World Cup).
- **Rugby:** **The Sables** (1987 & 1991 Rugby World Cup participants; Africa Cup champions).
- **Olympic & Global Champions:**
  * **Kirsty Coventry:** Swimmer & **most decorated African Olympian in history** (**7 Olympic medals** — 2 Gold, 4 Silver, 1 Bronze across 2004 Athens & 2008 Beijing); served as Minister of Youth, Sport, Arts & Recreation and elected **IOC President (2025)**.
  * **Elliot Mujaji:** 2-time Paralympic 100m Gold Medallist (2000 Sydney, 2004 Athens).
  * **Cara, Byron & Wayne Black:** Multiple Grand Slam Doubles tennis champions.
  * **Nick Price:** World No. 1 golfer and World Golf Hall of Fame inductee.
  * **Tendai "The Beast" Mtawarira:** Zimbabwe-born Rugby World Cup-winning legend.`,
    suggestions: [
      'What are the traditional dances and instruments of Zimbabwe?',
      'What are Zimbabwe’s public holidays?',
      'Give me common ChiShona proverbs (Tsumo) and phrases'
    ]
  },
  {
    id: 'zw_chishona_isindebele_heritage_glossary',
    subject: 'Shona',
    topic: 'ChiShona & IsiNdebele Heritage Glossary: Greetings, Kinship (Ukama), Homestead & Classic Tsumo (Proverbs)',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'shona greetings', 'ndebele greetings', 'tsumo', 'madimikira', 'izaga', 'ukama',
      'chishona phrases', 'isindebele phrases', 'zimbabwe homestead', 'mhoro', 'mangwanani',
      'salibonani', 'livuke njani', 'mutupo'
    ],
    content: `### ChiShona & IsiNdebele Heritage Glossary, Kinship & Proverbs

1. Respectful Everyday Greetings:
- **ChiShona:**
  * *Mangwanani, makadii?* (Good morning, how are you?) -> *Ndamuka, makadiiwo?* (I woke up well, how about you?)
  * *Masikati!* (Good afternoon!) / *Manheru!* (Good evening!)
  * *Makadini henyu?* / *Tiripo kana makadiniwo.*
  * *Maita basa / Tatenda zvikuru* (Thank you very much).
- **IsiNdebele:**
  * *Salibonani / Sawubona!* (Hello!) -> *Yebo, linjani?* (Yes, how are you?)
  * *Livuke njani?* (How did you wake up / Good morning?) -> *Sivukile, livuke njani lina?*
  * *Ngiyabonga kakhulu / Siyabonga* (Thank you very much).

2. Kinship Terms (*Ukama*):
- **Father / Mother:** *Baba / Amai* (Shona) | *Ubaba / Umama* (Ndebele).
- **Grandfather / Grandmother:** *Sekuru / Ambuya* (Shona) | *Umkhulu / Ugogo* (Ndebele).
- **Paternal Aunt / Maternal Uncle:** *Tete (Vatete) / Sekuru* (Shona) | *Ubabakazi / Umalume* (Ndebele).
- **Elder Uncle / Younger Uncle:** *Babamukuru / Babamunini* (Shona) | *Ubabamkhulu / Ubaba omncane*.
- **Nephew / Niece / Grandchild:** *Muzukuru* (Shona) | *Umzukulu* (Ndebele).

3. Traditional Homestead Architecture (*Musha / Umuzi*):
- **Imba yokubikira / Kitchen (*Choto*):** Round thatched hut with central fireplace (*choto*) and raised shelf (*chikuva*) for clay pots.
- **Dare / Inkundla:** Open meeting place where men and elders deliberate matters and teach youth.
- **Hozi / Dura:** Elevated granary plastered to store maize, *zviyo*, and *mapfunde* safely from moisture and pests.
- **Dara:** Drying rack for pots, maize cobs, and pumpkins.

4. High-Yield ZIMSEC *Tsumo* (Shona Proverbs) & Meanings:
- **Chara chimwe hachitswanyi inda:** Unity is strength (one thumb cannot crush a louse — cooperation wins).
- **Kandiro kanoenda kunobva kamwe:** Reciprocity / one good turn deserves another.
- **Rume rimwe harikombi churu:** No single person achieves a massive task alone.
- **Mwana asingachemi anofira mumbereko:** Speak up when you need help.
- **Kuziva mbuya huudzwa:** Respect and seek wisdom from elders.
- **Chitsva chiri murutsoka:** Exploring new opportunities brings rewards.`,
    suggestions: [
      'Explain Unhu / Ubuntu and totems (Mitupo)',
      'What are the 16 officially recognised languages of Zimbabwe?',
      'What are the traditional foods and dances of Zimbabwe?'
    ]
  },
  {
    id: 'zw_second_republic_present_day_2026',
    subject: 'Social Science',
    topic: 'Modern & Present-Day Zimbabwe (2017 – 2026): Second Republic, Vision 2030, NDS1 to NDS2, ZiG, SADC Summit & Mega Projects',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'zimbabwe today', 'present day zimbabwe', 'modern zimbabwe', 'recent developments in zimbabwe',
      'current affairs zimbabwe', 'zimbabwe 2024', 'zimbabwe 2025', 'zimbabwe 2026',
      'second republic', 'vision 2030', 'nds1', 'nds2', 'national development strategy',
      'sadc summit 2024', '44th sadc summit', 'mount hampden', 'new parliament building',
      'trabablas interchange', 'mbudzi interchange', 'gwayi shangani', 'muzarabani gas',
      'invictus energy', 'manhize', 'dinson steel', '2023 elections', 'leaving no one behind',
      'nyika inovakwa nevene vayo', 'starlink zimbabwe', 'kirsty coventry ioc'
    ],
    content: `### Present-Day Zimbabwe (2017 – 2026): National Development, Governance & Current Affairs

1. Current Political Leadership & Governance (Present Day):
- **President:** **His Excellency Cde Emmerson Dambudzo Mnangagwa** (serving his second and final constitutional term after winning the **23–24 August 2023 Harmonised Elections**).
- **Vice Presidents:** **General (Rtd) Dr. Constantino Chiwenga** (First VP) and **Col (Rtd) Kembo Mohadi** (Second VP).
- **Parliament Seat:** Moved to the majestic **New Parliament Building at Mount Hampden** (north-west of Harare), anchoring a planned smart administrative capital city.
- **Guiding National Philosophies:** *"Nyika inovakwa nevene vayo / Ilizwe lakhiwa ngabanikazi balo"* (A nation is built by its own owners) and *"Leaving no one and no place behind."*

2. Economic Blueprints — **Vision 2030**, **NDS1 (2021–2025)** & **NDS2 (2026–2030)**:
- **NDS1 (2021–2025):** First 5-year medium-term plan building food self-sufficiency, macro-stability, infrastructure, and devolution.
- **NDS2 (2026–2030):** The second and final 5-year national strategy driving Zimbabwe to **Vision 2030** (an Empowered and Prosperous Upper-Middle-Income Society), prioritising industrial value addition, digital/AI transformation, renewable energy, and export competitiveness.
- **Zimbabwe Gold (ZiG) Currency:** Launched **5 April 2024** backed by physical gold, precious minerals, and foreign currency reserves under the Reserve Bank of Zimbabwe (RBZ).

3. Regional Leadership & Global Milestones (2024 – 2026):
- **44th SADC Summit (August 2024):** Hosted at Mount Hampden, Harare, where President Mnangagwa assumed the **SADC Chairmanship (2024–2025)** under the theme of promoting innovation to unlock regional economic growth.
- **Olympic & Global Sport History (March 2025):** Zimbabwe's **Kirsty Coventry** (Minister of Youth, Sport, Arts & Recreation and 7-time Olympic medallist) was elected **10th President of the International Olympic Committee (IOC)** — the **first woman and first African** ever elected to lead the IOC.

4. Major Contemporary Infrastructure, Energy & Industrial Mega-Projects:
- **Trabablas (Mbudzi) Traffic Interchange (Harare):** Multi-level three-tier highway interchange on the Harare–Masvingo–Beitbridge corridor replacing the congested Mbudzi roundabout (completed and opened in **2025**).
- **Dinson Iron and Steel Company (DISCO — Manhize):** Commissioned blast furnace in 2024 near Mvuma/Chivhu, establishing Southern Africa's largest integrated steel plant.
- **Energy Security:** **Hwange Thermal Units 7 & 8** (+600 MW), **Kariba South** (1,050 MW), private solar IPPs, and ongoing **Invictus Energy oil/gas exploration in Muzarabani (Cabora Bassa Basin)**.
- **Water & Climate Resilience:** **Lake Tugwi-Mukosi**, **Gwayi-Shangani Dam & Bulawayo pipeline**, **Kunzvi Dam** (for Harare), and over **3,000+ Presidential Rural Solar Borehole Schemes** alongside *Pfumvudza/Intwasa* recovery after the 2023/2024 El Niño drought.
- **Digital Connectivity:** High-speed broadband expansion with **Starlink satellite internet licensed in 2024**, rural e-learning, and **Heritage-Based Curriculum (2024–2030)**.`,
    suggestions: [
      'Give me a complete timeline of Zimbabwe from 1980 to today',
      'What is the population of Zimbabwe according to the 2022 census?',
      'What is ZiG currency and how is it backed?'
    ]
  },
  {
    id: 'zw_post_independence_timeline_1980_present',
    subject: 'History',
    topic: 'Complete Post-Independence History of Zimbabwe (1980 – Present Day): Reconciliation, ESAP, Land Reform, GNU, 2013 Constitution & Second Republic',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'post independence zimbabwe', 'zimbabwe 1980 to present', 'timeline of zimbabwe',
      'history of zimbabwe after independence', 'esap', '1990s zimbabwe', 'gpa', 'gnu 2009',
      'government of national unity', 'morgan tsvangirai', 'operation restore legacy',
      'november 2017', 'cyclone idai 2019', 'gukurahundi', '2008 election', 'dollarisation',
      'zimstat 2022', 'post independence milestones'
    ],
    content: `### Complete Post-Independence Timeline of Zimbabwe (1980 – 2026)

1. The First Decade — Independence, Reconstruction & Unity (1980 – 1989):
- **18 April 1980:** Independence declared; **Rev. Canaan Banana** becomes Ceremonial President and **Cde Robert Mugabe** Prime Minister; Policy of National Reconciliation proclaimed. Universal free primary schooling and rural clinics launched, raising literacy above 90%.
- **1980 (SADCC):** Zimbabwe helps found the Southern African Development Coordination Conference (precursor to SADC) and sends troops along the Beira Corridor against RENAMO destabilisation.
- **1982 – 1987 (Matabeleland & Midlands Disturbances):** Civil conflict and counter-insurgency (*Gukurahundi*) amid apartheid South African destabilisation; resolved through the historic **22 December 1987 Unity Accord** merging ZANU and PF-ZAPU into **ZANU-PF**, establishing the Executive Presidency (Mugabe) with Vice Presidents Joshua Nkomo and Simon Muzenda.

2. Structural Adjustment, Drought & Constitutional Debate (1990 – 1999):
- **1991 – 1995 (ESAP):** Government adopted the IMF/World Bank-backed **Economic Structural Adjustment Programme**, privatising parastatals and cutting subsidies; combined with the severe **1992 Southern African Drought**, sparking urban cost-of-living hardships and trade union strikes (ZCTU).
- **1994:** New National Anthem (*Simudzai Mureza wedu weZimbabwe*) adopted.
- **1998 – 2002 (DRC Intervention):** Zimbabwe, Angola, and Namibia intervened under SADC mandate to defend the DRC government against rebel invasion.
- **September 1999:** Formation of the opposition **Movement for Democratic Change (MDC)** led by **Morgan Tsvangirai**.

3. Land Reform, Hyperinflation & The GNU (2000 – 2013):
- **2000 (Third Chimurenga / Fast-Track Land Reform Programme):** After the February 2000 constitutional referendum, spontaneous land occupations led to compulsory acquisition and redistribution to over **160,000+ A1 smallholder** and **A2 commercial** indigenous farmers. Western powers imposed sanctions (**ZDERA, 2001**; EU restrictions).
- **2007 – 2008:** Record hyperinflation crippled the Zimbabwe Dollar (ZWD). Following contested **2008 Elections**, SADC (mediated by Thabo Mbeki) brokered the **Global Political Agreement (GPA, 15 September 2008)**.
- **2009 – 2013 (Government of National Unity — GNU & Dollarisation):** Power-sharing government (Mugabe as President, Tsvangirai as Prime Minister, Arthur Mutambara as Deputy PM) introduced the **Multi-Currency System (USD/ZAR)** in 2009, restoring stability and drafting a new democratic supreme law.
- **22 May 2013:** **2013 Constitution of Zimbabwe** signed into law (94.5% referendum approval), introducing a comprehensive Bill of Rights, Devolution, and Presidential two-term limits.

4. The Second Republic & Transformation Toward Vision 2030 (2017 – 2026):
- **November 2017:** **Operation Restore Legacy** and peaceful constitutional transition; **Emmerson Mnangagwa** inaugurated on **24 November 2017**, introducing *"Zimbabwe is Open for Business"*, **Education 5.0**, and **Vision 2030**.
- **July 2018 & August 2023:** General elections won by President Mnangagwa and ZANU-PF under the 2013 Constitution.
- **March 2019:** **Cyclone Idai** devastated Chimanimani and Chipinge, prompting major national disaster resilience and dam/road upgrades.
- **2020 – 2023:** COVID-19 vaccination drive, launch of **Pfumvudza/Intwasa** climate-smart agriculture, **NDS1 (2021–2025)**, **2022 Population Census (15.18M)**, and **Marriages Act (2022)** ban on child marriage.
- **2024 – 2026:** Launch of **Heritage-Based Curriculum (HBC)**, **ZiG currency (April 2024)**, hosting the **44th SADC Summit (August 2024)**, **Manhize Steel**, **Trabablas Interchange (2025)**, and transition into **NDS2 (2026–2030)**.`,
    suggestions: [
      'What are the key developments in Zimbabwe today (2024–2026)?',
      'What does the 2013 Constitution of Zimbabwe guarantee?',
      'Explain the 2000 Fast-Track Land Reform Programme'
    ]
  },
  {
    id: 'zw_population_demographics_census',
    subject: 'Geography',
    topic: 'Zimbabwe Population, 2022 ZimStat National Census, Ethnic Diversity & Major Urban Centres',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'population of zimbabwe', 'zimbabwe population', '2022 census', 'zimstat', 'census zimbabwe',
      'demographics of zimbabwe', 'ethnic groups in zimbabwe', 'shona percentage', 'ndebele percentage',
      'largest cities in zimbabwe', 'cities in zimbabwe', 'urban centres', 'chitungwiza', 'epworth'
    ],
    content: `### Zimbabwe Population, 2022 National Census & Urban Demographics

1. 2022 Population & Housing Census (ZimStat Official Figures):
- **Total Population (2022 Census):** **15,178,979 people** (projected above **16.5+ million by 2025–2026**).
- **Gender Composition:** Approximately **52% Female** (~7.89 million) and **48% Male** (~7.29 million).
- **Youthful Structure:** Over **60% of Zimbabweans are under age 25** (median age ~19–20 years), giving Zimbabwe a strong demographic dividend requiring skills, STEM, and job creation.
- **Urban vs. Rural Distribution:** Roughly **38.6% urban** and **61.4% rural**, with rapid peri-urban growth around Harare, Bulawayo, Gweru, Mutare, and Victoria Falls.

2. Provincial Population Breakdown (Largest to Smallest in 2022):
- **Harare Metropolitan:** ~2.43 million (most populous province).
- **Midlands:** ~1.81 million.
- **Manicaland:** ~2.04 million.
- **Mashonaland West:** ~1.89 million.
- **Mashonaland East:** ~1.73 million.
- **Masvingo:** ~1.64 million.
- **Mashonaland Central:** ~1.38 million.
- **Matabeleland North:** ~0.83 million.
- **Matabeleland South:** ~0.76 million.
- **Bulawayo Metropolitan:** ~0.67 million.

3. Ethnic & Cultural Groups of Zimbabwe:
- **Shona (~82%):** Five primary dialect groups — **Karanga** (Masvingo/Midlands), **Zezuru** (Harare/Mashonaland East, Central, West), **Manyika** (Manicaland), **Korekore** (Northern Zambezi Valley/Mt Darwin/Hurungwe), and **Ndau** (Chipinge/Chimanimani).
- **Ndebele (~14%):** Concentrated in Bulawayo, Matabeleland North, Matabeleland South, and parts of Midlands.
- **Other Indigenous & Border Communities (~3%):** **Tonga** (Binga/Zambezi), **Kalanga** (Plumtree/Bulilima), **Venda** (Beitbridge), **Shangani/Tsonga** (Chiredzi/Mwenezi), **Sotho** (Gwanda), **Nambya** (Hwange), **Tswana**, **Chewa/Nyanja**, **Xhosa** (Mbembesi), **Lemba/Remba** (Mberengwa/Gutu), and **San/Khoisan** (Tsholotsho).
- **Minorities (~1%):** Zimbabweans of Asian, Mixed-heritage, and European descent.

4. Largest Cities & Fast-Growing Urban Towns:
- **Cities:** **Harare** (Capital), **Bulawayo** (2nd largest), **Chitungwiza** (largest high-density satellite municipality), **Mutare**, **Gweru**, **Masvingo**, **Kwekwe**, **Kadoma**, **Victoria Falls** (City status 2020).
- **Major Towns & Growth Points:** Epworth, Chinhoyi, Norton, Marondera, Ruwa, Chegutu, Zvishavane, Bindura, Beitbridge, Kariba, Hwange, Rusape, Chipinge, Gokwe, Mvurwi.`,
    suggestions: [
      'List all 10 provinces of Zimbabwe and their capitals',
      'What are the 16 officially recognised languages of Zimbabwe?',
      'What are the major religions in Zimbabwe?'
    ]
  },
  {
    id: 'zw_heritage_curriculum_hbc_sbp',
    subject: 'Social Science',
    topic: 'Heritage-Based Curriculum (HBC 2024–2030), School-Based Projects (SBP), 5 Core Pillars & Indigenous Knowledge Systems (IKS)',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'heritage based curriculum', 'heritage-based curriculum', 'hbc', 'hbc pillars', 'what is hbc',
      'school based project', 'school-based project', 'sbp', 'sbp stages', 'cala replacement',
      'indigenous knowledge systems', 'iks', 'heritage studies', 'zumbani', 'gavakava',
      'zviera', 'heritage education zimbabwe', 'unhu education'
    ],
    content: `### Heritage-Based Curriculum (HBC 2024–2030) & Indigenous Knowledge Systems (IKS)

Introduced by the Ministry of Primary and Secondary Education (**MoPSE**) in **2024**, the **Heritage-Based Curriculum (HBC)** anchors learning in Zimbabwe's tangible and intangible heritage, **Unhu/Ubuntu**, and hands-on national problem-solving toward **Vision 2030**.

1. Why HBC Replaced CALA:
- Under the 2015–2022 curriculum, **CALA (Continuous Assessment Learning Activities)** placed heavy financial, printing, and time pressure on families and teachers.
- In **2024**, Cabinet replaced CALA with streamlined, authentic **School-Based Projects (SBP)** rooted in real local community needs.

2. The Five Cross-Cutting Pillars of HBC:
- **Pillar 1 — Heritage, Culture & Unhu/Ubuntu Identity:** Patriotism, national symbols, *mitupo*, indigenous languages, history, and moral character.
- **Pillar 2 — Environmental Stewardship & Climate Action:** Soil conservation, reforestation, *Pfumvudza/Intwasa*, waste recycling, and climate resilience.
- **Pillar 3 — Science, Technology, Innovation & ICT:** Practical experiments, coding, digital tools, and value-addition skills linking to Tertiary **Education 5.0**.
- **Pillar 4 — Entrepreneurship & Life Skills:** Turning local resources (crops, clay, wood, ICT, crafts) into sustainable livelihoods.
- **Pillar 5 — Health, Safety & Inclusive Citizenship:** Chronic disease prevention, drug-abuse prevention (*Fashani/Crystal Meth / Mutoriro* awareness), road safety, and inclusion for learners with disabilities.

3. The 6 Standard Stages of a **School-Based Project (SBP)**:
- **Stage 1: Problem Identification** — Identifying a genuine challenge in the school, home, or local Zimbabwean community.
- **Stage 2: Investigation of Related Ideas** — Studying existing solutions, interviews with elders/experts, and indigenous practices.
- **Stage 3: Generation of Ideas** — Brainstorming 2–3 practical alternative ways to solve the problem using affordable local materials.
- **Stage 4: Development / Refinement of Chosen Idea** — Designing and improving the best chosen solution/model.
- **Stage 5: Presentation of Final Solution** — Producing and demonstrating the actual product, service, prototype, or community action.
- **Stage 6: Evaluation & Recommendations** — Assessing strengths, challenges faced, and future improvements.

4. Indigenous Knowledge Systems (IKS) in Zimbabwe:
- **Indigenous Weather Prediction:** Observing early fruiting of *muzhanje* or *muhacha* (predicting drought or good rains), flight of migratory birds (*dendera* / *mashuramurove*), halo rings around the moon (*dziva*), and frog/cicada (*nyenze*) calls.
- **Indigenous Medicine & Botany:** Using **Zumbani** (*Lippia javanica*) herbal tea for colds/respiratory health, **Gavakava** (Aloe) for wounds and poultry immunity, **Mutsine** (*Bidens pilosa*), and **Mubvamaropa** bark for blood circulation.
- **Indigenous Conservation (*Zviera*):** Spiritual taboos forbidding cutting sacred *muchakata* fruit trees, polluting natural springs (*zvitubu*), or hunting one's clan totem (*mutupo*) animal — acting as traditional environmental law.`,
    suggestions: [
      'What are the 6 official ZIMSEC Grade 7 subjects?',
      'Explain Unhu / Ubuntu philosophy and totems (Mitupo)',
      'What are the traditional foods, instruments, and dances of Zimbabwe?'
    ]
  },
  {
    id: 'zw_religion_heritage_atr_christianity',
    subject: 'Social Science',
    topic: 'Religions & Spiritual Heritage of Zimbabwe: African Traditional Religion (ATR), Christianity, Islam, Judaism & Interfaith Harmony',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'religions in zimbabwe', 'religion in zimbabwe', 'african traditional religion', 'atr',
      'indigenous religion', 'mwari', 'musikavanhu', 'nyadenga', 'vadzimu', 'midzimu',
      'mhondoro', 'svikiro', 'njelele', 'matonjeni', 'nanga', 'christianity in zimbabwe',
      'apostolic churches', 'zion', 'zaoga', 'islam in zimbabwe', 'lemba', 'remba', 'fareme'
    ],
    content: `### Religions & Spiritual Heritage in Zimbabwe (FAREME / HBC)

Section 60 of the **2013 Constitution of Zimbabwe** guarantees complete **Freedom of Conscience and Religion**. Zimbabwe is a religiously diverse nation anchored in mutual respect:

1. Indigenous Religion / African Traditional Religion (ATR):
- **The Supreme Being:** Monotheistic belief in one Almighty Creator — **Mwari / Musikavanhu / Nyadenga / Dzivaguru** (ChiShona) or **uMvelinqangi / uNkulunkulu** (IsiNdebele). Mwari is approached respectfully through ancestral intermediaries rather than directly.
- **Ancestral Spirits (*Vadzimu / Amadlozi*):** Spirits of deceased parents and grandparents who protect families, guide morals (*Unhu*), and enforce justice.
- **Territorial / National Spirits (*Mhondoro*):** Senior royal spirits (such as **Chaminuka, Nehanda, Kaguvi, Dzivaguru**) who guard entire regions, bring rains, and counsel chiefs and liberation movements.
- **Spirit Mediums (*Masvikiro / Svikiro*):** Chosen individuals through whom *Vadzimu* or *Mhondoro* speak during sacred *Bira* ceremonies.
- **Sacred National Shrines:** **Njelele & Matonjeni (Matobo Hills)** — supreme historic rain-making and spiritual consultation oracle caves — alongside Great Zimbabwe Hill Complex and Domboshava.
- **Traditional Healers (*N'anga / Inyanga*):** Diviners and herbalists regulated today by **ZINATHA** (Zimbabwe National Traditional Healers Association).

2. Christianity (~84% of Zimbabweans):
- **Historic Mission Churches:** Roman Catholic (first missions at Empandeni & Chishawasha, strong network of schools & hospitals like Gokomere, Kutama, St George's), Anglican, Methodist, Wesleyan, Lutheran, Reformed Church in Zimbabwe (Morgenster), Salvation Army, and Seventh-day Adventist (Solusi).
- **African Initiated / Apostolic & Zionist Churches:** Indigenous-led churches blending Christian scripture with African spiritual expression (e.g., **Johane Marange Apostolic**, **Johane Masowe**, **Zion Christian Church — ZCC** founded by Samuel Mutendi).
- **Pentecostal & Charismatic Churches:** **ZAOGA Forward in Faith** (founded by Archbishop Ezekiel Guti), **AFM** (Apostolic Faith Mission), **UFIC**, **Family of God**, and **Heartfelt**.

3. Islam, Judaism, Hinduism & Other Faiths:
- **Islam:** Practised across Harare, Bulawayo, Masvingo, and historic trading hubs; notably includes the **Remba / Lemba** communities (e.g. Mberengwa/Gutu) preserving ancient Semitic dietary and cultural traditions.
- **Hinduism & Judaism:** Practised by long-standing Indian-origin and Jewish Zimbabwean communities (Harare and Bulawayo synagogues & Hindu temples).
- **Rastafari:** Cultural-spiritual community committed to Pan-Africanism, peace, and natural living.`,
    suggestions: [
      'Explain Kurova Guva, Bira, and Mukwerera ceremonies',
      'What does the 2013 Constitution say about rights and freedoms?',
      'Who were Mbuya Nehanda and Sekuru Kaguvi?'
    ]
  },
  {
    id: 'zw_laws_rights_marriage_children',
    subject: 'Social Science',
    topic: 'Zimbabwean Law, Marriages Act (Chapter 5:17), Children’s Rights, Inheritance & Cyber Protection Act',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'marriage act zimbabwe', 'marriages act 2022', 'chapter 5 17', 'child marriage law',
      'civil partnership', 'customary marriage', 'children rights zimbabwe', 'section 81',
      'domestic violence act', 'inheritance laws zimbabwe', 'property grabbing', 'citizenship zimbabwe',
      'cyber and data protection act', 'legal age of majority', '18 years'
    ],
    content: `### Citizens' Rights, Marriages Act [Chapter 5:17], Inheritance & Cyber Law in Zimbabwe

1. **The Marriages Act [Chapter 5:17] (Effective 2022):**
- Landmark law aligning marriage with the 2013 Constitution by **banning child marriage across every type of union**:
  * **Minimum Age of Marriage:** Strictly **18 years** for both males and females (even under customary or religious rites). Pledging or marrying a minor is a serious **criminal offence**.
  * **Types of Marriage Recognised:**
    1. **Civil Marriage** (formerly Chapter 5:11): Strictly monogamous (one husband, one wife).
    2. **Registered Customary Law Marriage** (formerly Chapter 5:07): Celebrated under customary law; potentially polygamous unless converted to civil marriage.
    3. **Qualified Civil Partnership:** Protects property rights of unmarried adults living together long-term upon separation or death without displacing existing legal spouses.
  * **Lobola / Roora Clarification:** Cultural *roora* remains respected socially, but is **no longer a legal barrier** preventing adult consent to register a civil marriage.

2. **Children's Rights (Section 81 of 2013 Constitution & Children's Act):**
- Every child under **18 years** has the right to a **name and birth certificate**, family/parental care, basic **education and healthcare**, nutrition, and **protection from economic/sexual exploitation, child labour, and abuse**.
- **Victim-Friendly Courts** and **ZRP Victim Friendly Unit (VFU)** safeguard child survivors confidentially.
- **BEAM (Basic Education Assistance Module):** State programme paying school/exam fees for orphaned and vulnerable learners (*OVCs*).

3. **Inheritance & Protection Against Property Grabbing:**
- Under the **Administration of Estates Act** and **Deceased Estates Succession Act**, a deceased parent's **surviving spouse and minor children** hold primary legal entitlement to the family home and household estate.
- Traditional customs cannot disinherit a widow or children; unlawful **"property grabbing" (*kubvuta nhaka*)** is illegal.

4. **Zimbabwean Citizenship (Chapter 3 of Constitution):**
- Acquired in three ways: **By Birth** (born in Zimbabwe to a Zimbabwean citizen parent/grandparent), **By Descent** (born outside Zimbabwe to a Zimbabwean parent), or **By Registration** (long-term lawful residence or marriage under statutory criteria). Dual citizenship is constitutionally protected for citizens by birth.

5. **Cyber and Data Protection Act (2021):**
- Criminalises **cyberbullying, identity theft, online harassment, hacking, sharing non-consensual intimate images**, and misuse of minors' personal data on WhatsApp/social media.`,
    suggestions: [
      'What are the fundamental rights in Chapter 4 of the 2013 Constitution?',
      'Explain Roora / Lobola and family kinship (Ukama)',
      'What are the key national institutions and security services in Zimbabwe?'
    ]
  },
  {
    id: 'zw_institutions_security_parastatals',
    subject: 'Social Science',
    topic: 'National Institutions, Security Services & Key Public Agencies in Zimbabwe (ZDF, ZRP, ZPCS, ZESA, ZINWA, EMA, POTRAZ, NSSA, ZIMRA)',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'institutions in zimbabwe', 'security services zimbabwe', 'zdf', 'zimbabwe defence forces',
      'zrp', 'zimbabwe republic police', 'zpcs', 'prisons service', 'zesa', 'zetdc', 'zinwa',
      'ema', 'environmental management agency', 'potraz', 'nssa', 'zimstat', 'zinara', 'zupco',
      'natpharm', 'parastatals in zimbabwe', 'saz', 'standards association'
    ],
    content: `### Key National Institutions, Security Services & Public Agencies of Zimbabwe

1. Constitutional Security Services (Chapter 11):
- **Zimbabwe Defence Forces (ZDF):** Comprising the **Zimbabwe National Army (ZNA)** and **Air Force of Zimbabwe (AFZ)**. Mandated to defend sovereignty, territorial integrity, national borders, disaster rescue, and UN/AU/SADC peacekeeping.
- **Zimbabwe Republic Police (ZRP):** Maintains internal law and order, prevents/investigates crime, controls road traffic, and protects citizens and property (includes **Victim Friendly Unit** & **Neighbourhood Watch**).
- **Zimbabwe Prisons and Correctional Service (ZPCS):** Manages correctional facilities, rehabilitation, farming, and skills training for inmates.

2. Energy, Water, Environment & Infrastructure Parastatals:
- **ZESA Holdings (ZPC & ZETDC):** Generates (**ZPC** — Kariba, Hwange) and transmits/distributes (**ZETDC**) electricity nationwide.
- **ZINWA (Zimbabwe National Water Authority):** Manages raw bulk water dams, catchment councils, and boreholes across rural and growth-point centres.
- **EMA (Environmental Management Agency):** Enforces environmental laws, veld-fire prevention, wetland preservation, and mining/industrial Environmental Impact Assessments (**EIAs**).
- **ZINARA (Zimbabwe National Road Administration):** Collects road user fees/tolls to fund national and local road rehabilitation.
- **NRZ (National Railways of Zimbabwe) & ZUPCO:** Bulk rail freight and public mass transit passenger services.

3. Economic, Regulatory, Data & Social Protection Bodies:
- **ZIMRA:** Customs, borders, VAT, corporate and income tax collection.
- **RBZ (Reserve Bank of Zimbabwe):** Monetary policy, **ZiG** currency stability, bank licensing, and national gold reserves.
- **POTRAZ:** Postal & Telecommunications Regulatory Authority overseeing mobile networks, spectrum, fibre, and satellite (**Starlink**).
- **NSSA (National Social Security Authority):** Administers contributory workers' pensions and workplace injury compensation.
- **ZimStat:** Official national statistics agency conducting national censuses, inflation (CPI), and GDP surveys.
- **SAZ (Standards Association of Zimbabwe) & MCAZ (Medicines Control Authority):** Ensure safety and quality certification of consumer goods and medicines.
- **NatPharm:** Central public procurement and distribution agency for essential hospital/clinic medicines.`,
    suggestions: [
      'What are the independent Constitutional Commissions in Zimbabwe?',
      'Explain the three arms of government in Zimbabwe',
      'Tell me about Zimbabwe’s hospitals, telecoms, and media'
    ]
  },
  {
    id: 'zw_flora_fauna_sacred_trees_conservation',
    subject: 'Agric, Science & Tech',
    topic: 'Indigenous Trees, Protected Wildlife, National Tree Planting Day & Environmental Conservation in Zimbabwe',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'trees of zimbabwe', 'indigenous trees', 'msasa', 'musasa', 'munhondo', 'baobab', 'muuyu',
      'muchakata', 'muhacha', 'mopane', 'mukwa', 'mubvamaropa', 'muzhanje', 'pangolin', 'haka',
      'sable antelope', 'national tree planting day', 'campfire', 'conservation in zimbabwe',
      'endangered animals zimbabwe', 'veld fires'
    ],
    content: `### Indigenous Trees, Protected Wildlife & Heritage Conservation in Zimbabwe

1. Iconic Indigenous Trees of Zimbabwe (Miombo & Savanna Woodlands):
- **Msasa (*Brachystegia spiciformis*):** Signature tree of Zimbabwe's Highveld; bursts into copper-red and bronze spring foliage in August–September before turning lush green; provides shade, firewood, and bark fibre (*gavakava/gambo*).
- **Munhondo (*Julbernardia globiflora*):** Co-dominant companion of Msasa across Miombo woodlands; supports honeybee nectar and wildlife browsing.
- **Baobab (*Adansonia digitata / Muuyu / Umkhomo*):** Giant long-lived Lowveld tree storing water in its spongy trunk; its vitamin-C-rich fruits (*mauyu*) make refreshing juice and traditional porridge.
- **Muchakata / Muhacha (*Parinari curatellifolia*):** **Sacred heritage tree** across Zimbabwe — traditionally **forbidden to cut down (*Chiera*)**; elders conduct *Mukwerera* rain ceremonies underneath and harvest sweet *hacha* fruits for porridge and drought nutrition.
- **Mopane (*Colophospermum mopane / Mupani*):** Dominant hot Lowveld hardwood hosting the edible protein-rich **mopane caterpillar (*Madora / Amacimbi*)** — an essential rural food and cash source.
- **Muzhanje (*Uapaca kirkiana*):** Wild woodland fruit tree prized for sweet *mazhanje* fruits and drought-season income.
- **Mukwa / Mubvamaropa (*Pterocarpus angolensis*):** Valuable indigenous timber tree whose red sap (*"bleeds blood"*) treats skin ailments and provides fine carving/furniture hardwood.

2. Strictly Protected & Endangered Wildlife:
- **Pangolin (*Haka*):** Scales-covered nocturnal ant-eater; culturally regarded as a royal treasure presented to Chiefs/Presidents and **strictly protected** (heavy mandatory prison sentences for poaching/trafficking).
- **Black & White Rhinoceros:** Protected in Intensive Protection Zones (Matobo, Matusadona, Bubye Valley, Save Valley) via ranger patrols and strategic dehorning.
- **African Painted / Wild Dog (*Mhumi*):** One of Africa's most endangered carnivores, thriving in Hwange and Mana Pools.
- **Sable Antelope (*Mharapara*)** & **Zimbabwe Fish Eagle (*Hungwe*)**.

3. National Conservation Programmes & Laws:
- **National Tree Planting Day:** Celebrated annually on the **First Saturday of December** (established 1980) with a designated **"Tree of the Year"** to combat deforestation and gully erosion.
- **CAMPFIRE (Communal Areas Management Programme for Indigenous Resources):** Empowers Rural District Councils and local villages to manage wildlife sustainably and earn revenue for schools, boreholes, and clinics.
- **EMA Regulations & Forestry Act:** Mandates 9-metre perimeter **fireguards**, prohibits stream-bank cultivation within 30 metres of riverbanks, and protects wetlands (*vleis / dambos*).`,
    suggestions: [
      'List all 5 UNESCO World Heritage Sites and major National Parks in Zimbabwe',
      'What are Zimbabwe’s 5 Natural Farming Regions?',
      'What are the major causes and prevention of veld fires?'
    ]
  },
  {
    id: 'zw_health_hospitals_media_telecoms',
    subject: 'Social Science',
    topic: 'Zimbabwe Healthcare System, Telecommunications, EcoCash/Fintech, Starlink & National Media Landscape',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'hospitals in zimbabwe', 'healthcare in zimbabwe', 'parirenyatwa', 'sally mugabe hospital',
      'mpilo hospital', 'chitungwiza hospital', 'telecoms in zimbabwe', 'econet', 'ecocash',
      'netone', 'onemoney', 'telecel', 'telone', 'starlink', 'media in zimbabwe', 'zbc',
      'zimpapers', 'the herald', 'the chronicle', 'zimswitch'
    ],
    content: `### Healthcare, Telecommunications, Fintech & Media Landscape of Zimbabwe

1. Four-Tier Public & Mission Healthcare Referral System:
- **Primary Level:** Rural Health Centres (RHCs), municipal clinics, and Village Health Workers providing maternal care, childhood immunisations, malaria/HIV testing, and ORS.
- **Secondary Level:** District Hospitals & Faith-Based Mission Hospitals (renowned centres include **Karanda, Howard, Morgenster, Gutu, Mt St Mary's, Tshelanyemba, Mutambara**).
- **Tertiary Level:** Provincial Referral Hospitals in every provincial capital (Mutare, Bindura, Marondera, Chinhoyi, Masvingo, Gwanda, Gweru, Lupane).
- **Quaternary Central Referral Hospitals:**
  * **Harare:** **Parirenyatwa Group of Hospitals** (largest teaching hospital linked to UZ Faculty of Medicine), **Sally Mugabe Central Hospital** (formerly Harare Central), and **Chitungwiza Central Hospital**.
  * **Bulawayo:** **Mpilo Central Hospital**, **United Bulawayo Hospitals (UBH)**, and **Ingutsheni Psychiatric Hospital**.

2. Telecommunications, Broadband & Mobile Money (Fintech):
- **Mobile Network Operators (MNOs):** **Econet Wireless** (largest operator), **NetOne** (state-owned), and **Telecel Zimbabwe**; fixed broadband led by **TelOne** and **Liquid Intelligent Technologies**.
- **Mobile Money & National Payments:** **EcoCash**, **OneMoney**, **InnBucks**, and **ZimSwitch / ZIPIT** drive high financial inclusion, allowing instant ZiG and USD mobile/QR payments even in remote rural business centres.
- **Satellite Broadband Milestone (2024 – Present):** **Starlink** received official POTRAZ licensing in 2024, rapidly connecting remote mines, clinics, farms, and rural secondary schools to high-speed internet.

3. National Media & Public Broadcasting:
- **Public Broadcaster — ZBC (Zimbabwe Broadcasting Corporation):** Operates **ZBC TV (ZTV)** and national radio stations (**Radio Zimbabwe** [Shona/Ndebele], **Classic 263**, **National FM** [covering all 16 official languages], **Power FM**, **Khulumani FM**).
- **Commercial TV & Radio:** **ZTN Prime**, **3Ktv**, **ZiFM Stereo**, **Star FM**, **Diamond FM**, **Nyaminyami FM**, and licensed **Community Radio Stations** broadcasting in local Tonga, Kalanga, Venda, Ndau, and Shangani dialects.
- **Print & Digital Press:** **Zimpapers** (*The Herald, The Chronicle, The Sunday Mail, Sunday News, H-Metro, Kwayedza [ChiShona], uMthunywa [IsiNdebele]*), alongside independent press (*NewsDay, The Standard, Zimbabwe Independent, Business Times*).`,
    suggestions: [
      'Explain Zimbabwe’s major universities and Education 5.0',
      'What are the key developments in present-day Zimbabwe (2024–2026)?',
      'What are the 16 officially recognised languages of Zimbabwe?'
    ]
  },
  {
    id: 'zw_shona_ndebele_culture_riddles_festivals',
    subject: 'Shona',
    topic: 'Extended Zimbabwean Oral Heritage: Riddles (Zvirahwe), Praise Poetry (Nhetembo / Izibongo), Taboos (Zviera) & National Festivals',
    levels: ['Primary', 'O-Level', 'A-Level', 'Tertiary'],
    keywords: [
      'zvirahwe', 'riddles', 'nhetembo', 'praise poetry', 'izibongo', 'zviera', 'taboos',
      'madimikira', 'chishona idioms', 'oral literature', 'festivals in zimbabwe', 'zitf',
      'agricultural show', 'intwasa', 'shoko festival', 'hifa', 'chieftainship'
    ],
    content: `### Zimbabwean Oral Literature (*Zvirahwe*, *Nhetembo*, *Zviera*) & National Cultural Festivals

1. Traditional Riddles (*Zvirahwe* / *Amalibho*):
Used around evening fires (*padare*) to sharpen children's observation, logic, and poetic language:
- *"Imba yangu haina musuo"* -> **Zai** (My house has no door -> An Egg).
- *"Chembere mukadzi hazvienzani nekurara mugota"* -> Wise appreciation of elders and partnership.
- *"Vasikana vangu vanokwira mugomo vachiimba"* -> **Mvura inokwira mugomo / Mhepo / Nyuchi** or *"Mai vangu vanobika sadza pasina moto"* -> **Nyuchi dzinogadzira uchi** (Bees making honey without fire).
- *"Tsuro yangu inofamba husiku chete"* -> **Mwedzi** (The Moon).

2. Totemic Praise Poetry (*Nhetembo dzemadzinza / Izibongo*):
- Recited at marriages (*roora*), thanksgiving, birth celebrations, and funerals to honour ancestral lineage, courage, and moral responsibility:
  * **Shumba (Lion):** *Maita Shumba, Murambwi, chibwa chisingatyi...*
  * **Zhou / Ndlovu (Elephant):** *Maita Zhou, Samanyanga, mhuru yeguru...*
  * **Mhofu / Mpofu (Eland):** *Maita Mhofu, Chihera, Museyamwa...*
  * **Soko / Ncube (Vervet/Baboon):** *Maita Soko, Vhudzijena, Mukanya...*

3. Cultural Taboos (*Zviera*) and Ecological/Moral Wisdom:
- *Ukagara munzira unoita mamota* -> Do not sit blocking footpaths (keeps public paths clean and safe).
- *Usateme muti wemuchakata / muhacha* -> Never cut down wild fruit/sacred trees (preserves communal food & shade).
- *Usauraya haka (pangolin) kana dendera (ground hornbill)* -> Protects rare ecological indicator species.
- *Usadyira pamugoti* -> Encourages table manners and patience while food is served properly.

4. Major Annual Exhibitions & Cultural Festivals in Zimbabwe:
- **Zimbabwe International Trade Fair (ZITF — Bulawayo, April):** Premier regional industrial, innovation, and trade expo.
- **Zimbabwe Agricultural Show (Harare, August/September):** Showcases champion livestock, *Pfumvudza* harvests, agro-processing, and youth entrepreneurship.
- **Intwasa Arts Festival koBulawayo (September):** Celebrates Ndebele/multi-cultural theatre, music, spoken word, and fashion.
- **Jerusarema Mbende Festival (Murehwa)**, **Shoko Festival** (Harare urban youth culture/hip-hop/comedy), **Jacaranda Music Festival**, and **Culture Month (May)**. `,
    suggestions: [
      'Give me ChiShona greetings, kinship terms (Ukama), and Tsumo proverbs',
      'Explain Unhu / Ubuntu and totems (Mitupo)',
      'What are the traditional dances and musical instruments of Zimbabwe?'
    ]
  }
];
