const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'public', 'assets');

console.log('Building full Primary Heritage-Based Curriculum database...');

// -----------------------------------------------------------------------------
// 1. HERITAGE & SOCIAL STUDIES (Grade 7 ZIMSEC 7050)
// -----------------------------------------------------------------------------
const heritageChunks = [
  {
    id: "hss_g7_marital_relationships",
    level: "Primary",
    subject: "Social Science",
    topic: "Marital Relationships and Conflict Management",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family",
    keywords: ["marital relationships", "marriage", "marital disputes", "conflict management", "family disputes"],
    content: `### Marital Relationships and Conflict Management

#### 1. What is an Ideal Marital Relationship?
An ideal marital relationship is a legally, culturally, or religiously recognized union between two partners characterized by mutual love, trust, fidelity, open communication, shared family responsibilities, and mutual respect (*Unhu/Ubuntu*).

#### 2. Characteristics of Ideal Marital Relationships
- **Mutual Respect and Trust:** Partners value each other's opinions, maintain honesty, and stay faithful.
- **Effective Communication:** Openly discussing family finances, children's upbringing, and grievances without verbal aggression.
- **Shared Responsibility:** Cooperating in earning livelihoods, household chores, and guiding children.
- **Forgiveness and Patience:** Resolving everyday disagreements calmly without involving external malice.

#### 3. Causes and Effects of Marital Disputes
- **Causes:** Infidelity (cheating), financial distress and poverty, domestic violence, alcohol and substance abuse, lack of communication, and unwanted interference by in-laws.
- **Effects:** Domestic violence, emotional stress, neglect of children, separation, divorce, and family disintegration.

#### 4. Solutions to Marital Disputes
1. **Indigenous Family Counselling:** Seeking wise mediation from the paternal aunt (*Tete*) and maternal uncle (*Sekuru*).
2. **Professional Marriage Counselling:** Consulting registered marriage counselors, pastors, or community social workers.
3. **Legal Protection Orders:** Utilizing the Domestic Violence Act through Magistrates' Courts to prevent violence while resolving disputes.`
  },
  {
    id: "hss_g7_family_disintegration",
    level: "Primary",
    subject: "Social Science",
    topic: "Family Disintegration",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family",
    keywords: ["family disintegration", "causes of family disintegration", "effects of family disintegration", "curbing family disintegration"],
    content: `### Family Disintegration

#### 1. What is Family Disintegration?
**Family disintegration** (family breakdown) is the collapse of family unity, stability, and structure resulting from divorce, separation, desertion, or the death of parents, leading to the disruption of normal family functions and relationships.

#### 2. Causes of Family Disintegration
- **Divorce and Separation:** Irreconcilable marital conflicts, unfaithfulness, and domestic violence.
- **Economic Hardship:** Severe poverty forcing parents into prolonged migration (diaspora) or abandonment.
- **Alcohol and Substance Abuse:** Leading to neglect of parental obligations and violence.
- **Death of Parents:** Chronic illnesses (e.g. HIV/AIDS) leaving behind orphaned children.

#### 3. Effects of Family Disintegration on Identity
- **Loss of Cultural Identity:** Children may grow up without knowing their totems, paternal lineage, and cultural traditions.
- **Emotional and Psychological Trauma:** Children suffer from depression, anxiety, feeling unloved, and low self-esteem.
- **Social Vulnerability:** Increased risks of school dropouts, child labour, juvenile delinquency, street life, and early child marriages.

#### 4. Ways of Curbing Family Disintegration
- Premarital and marital counseling through extended family elders (*VanaTete* and *VanaSekuru*) or church leaders.
- Engaging in conflict resolution through calm dialogue rather than violence.
- Community and social welfare support for vulnerable families and orphans.`
  },
  {
    id: "hss_g7_motherhood_fatherhood_precolonial",
    level: "Primary",
    subject: "Social Science",
    topic: "Cultural Values of Motherhood and Fatherhood in the Pre-Colonial Era",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 1: Family & Culture",
    keywords: ["motherhood", "fatherhood", "cultural values", "pre-colonial family", "gender roles"],
    content: `### Cultural Values of Motherhood and Fatherhood in the Pre-Colonial Era

#### 1. Overview
In pre-colonial Zimbabwean societies, motherhood and fatherhood were revered as sacred communal institutions guided by *Unhu/Ubuntu*, where parenting was both a biological duty and an extended community responsibility.

#### 2. Cultural Values of Motherhood
- **Nurturing and Child-Rearing:** Mothers were the primary caregivers, breastfeeding infants, preparing nutritious traditional meals, and nursing the sick.
- **Moral Socialisation (*Chitsidzo*):** Mothers and grandmothers (*VanaMbuya*) taught young girls moral etiquette, personal hygiene, traditional culinary arts, and folk wisdom (*Ngano*) around the evening fireplace.
- **Household Management:** Cultivating vegetable gardens, gathering wild fruits, brewing traditional beer, and maintaining the homestead.
- **High Cultural Respect:** A mother held high spiritual significance (*Mombe yeumai* paid during lobola honoured the mother's reproductive sacrifice).

#### 3. Cultural Values of Fatherhood
- **Protection and Defence:** Fathers defended the homestead and clan against wild animals and enemy invaders using spears, bows, and shields.
- **Provision and Livelihood:** Fathers were responsible for clearing heavy bush for cultivation, hunting wild game, herding cattle, and iron metallurgy.
- **Lineage Head and Decision Making:** The father represented the family at traditional court (*Dare*), made key decisions, and maintained ancestral communion.
- **Mentorship of Sons:** Fathers and uncles (*VanaSekuru*) mentored boys into brave, hardworking men, hunters, builders, and future family heads.`
  },
  {
    id: "hss_g7_totem_system",
    level: "Primary",
    subject: "Social Science",
    topic: "Purpose and Importance of the Totem System",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 2: Culture & Heritage",
    keywords: ["totem", "totem system", "mutupo", "isibongo", "purpose of totem", "importance of totem system"],
    content: `### Purpose and Importance of the Totem System (Mitupo / Izibongo)

#### 1. What is a Totem?
A **totem** (*Mutupo* in Shona, *Isibongo* in Ndebele) is an animal, bird, plant, or natural element adopted by an African clan or family as their sacred emblem, symbolizing a common ancestral origin and identity (e.g. *Shumba/Sibanda* - Lion, *Soko/Ncube* - Monkey, *Mhofu/Mpofu* - Eland, *Hungwe* - Fish Eagle, *Dziva* - Pool/Water).

#### 2. Purpose and Importance of the Totem System
1. **Preventing Incest (*Makunakuna*):** People sharing the same totem and praise name (*Chidau*) are considered biological brothers and sisters, strictly prohibiting intermarriage and preserving healthy genetics.
2. **Environmental and Wildlife Conservation:** Clan members are strictly forbidden by cultural taboo from killing, injuring, or eating their totem animal. This created a natural, highly effective conservation system that protected wild animal species.
3. **Social Identity and Kinship:** Totems identify who a person is, their ancestral roots, and connect people as kin even when meeting strangers in distant territories.
4. **Cultural Praise and Respect (*Zvidau*):** Reciting praise poetry (*Kudetembwa kwemutupo*) is used to show deep gratitude, affection, and respect after good deeds.`
  },
  {
    id: "hss_g7_early_people_khoisan_bantu",
    level: "Primary",
    subject: "Social Science",
    topic: "The Early People of Zimbabwe: The Khoisan and Bantu",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 3: Early Societies",
    keywords: ["khoisan", "bantu", "early people of zimbabwe", "stone age", "iron age", "rock paintings"],
    content: `### The Early People of Zimbabwe: The Khoisan and Bantu

#### 1. The Khoisan (Late Stone Age Inhabitants)
- **Way of Life:** The Khoisan (San/Bushmen) were nomadic hunter-gatherers who lived in Zimbabwe thousands of years ago.
- **Shelter:** Lived in rock shelters and natural caves; did not build permanent houses.
- **Hunting and Diet:** Men hunted wild animals using bows and arrows tipped with natural snake/plant poison. Women gathered wild fruits, roots, tubers, berries, and insect larvae using digging sticks weighted with bored stones.
- **Clothing and Tools:** Wore animal skin loincloths; made tools from wood, bone, and flaked stone.
- **Rock Paintings (Rock Art):** Painted magnificent rock art on granite walls (e.g. Matobo Hills, Domboshava, Epworth) depicting hunting scenes, trances, and wildlife using red ochre, charcoal, animal blood, and egg whites.

#### 2. The Bantu (Early Iron Age Immigrants)
- **Way of Life:** Migrated from the Niger-Congo/Great Lakes region, bringing advanced **Iron Age technology** and farming culture.
- **Farming and Domestication:** Cultivated crops (sorghum, pearl millet, cowpeas) and domesticated livestock (cattle, sheep, goats).
- **Permanent Settlements:** Built permanent pole-and-daga huts thatched with grass in organized villages.
- **Iron Smelting & Metallurgy:** Smelted iron ore in clay furnaces to forge hoes for farming, spears and arrowheads for hunting/defense, and knives.
- **Pottery:** Created decorated clay pots for cooking, storing grain, and carrying water.

#### 3. Contributions of the Bantu to Zimbabwean Heritage
- Introduction of agriculture, guaranteeing stable food supply.
- Iron technology that transformed toolmaking and defensive warfare.
- Foundation of centralized kingdoms and stone architecture (Great Zimbabwe, Mutapa, Torwa, Rozvi).
- Establishment of the clan system, totems, and the philosophy of *Unhu/Ubuntu/Vumunhu*.`
  },
  {
    id: "hss_g7_rules_laws_indigenous_courts",
    level: "Primary",
    subject: "Social Science",
    topic: "Rules, Laws, By-Laws, and the Indigenous Court System",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 4: Governance & Rights",
    keywords: ["rules and laws", "by-laws", "indigenous courts", "dare", "mambo", "sabhuku", "sadunhu", "law enforcement"],
    content: `### Rules, Laws, By-Laws, and the Indigenous Court System

#### 1. Rules, National Laws, and By-Laws
- **Rules:** Established guidelines to regulate conduct within a small institution (e.g. classroom rules, family home rules).
- **National Laws:** Formal statutes passed by Parliament and enforced by the state across the entire country (e.g. Criminal Law Code, Road Traffic Act).
- **By-Laws:** Local rules enacted by local government authorities (Urban Councils or Rural District Councils) to govern local areas (e.g. anti-littering by-laws, noise curfews, vending regulations, animal licensing).
- **Importance of Laws:** Maintain peace and public order, protect human rights and property, and prevent chaos and crime.

#### 2. Roles in Enforcing the Law
- **Individual:** Obeying laws voluntarily, respecting others' rights, and reporting crimes.
- **Community:** Forming neighbourhood watch committees and protecting community infrastructure.
- **Police (ZRP):** Investigating crimes, arresting offenders, and preserving peace.
- **Courts (Judiciary):** Impartially interpreting laws, judging guilt or innocence, and sentencing offenders.

#### 3. The Indigenous Court System (*Dare*)
Traditional justice in Zimbabwe is restorative, aiming at reconciliation and peace rather than mere punishment.
1. **Dare reMusha (Village Head's Court):**
   - Presided over by the **Village Head (*Sabhuku*)**.
   - Handles minor family disputes, petty theft, boundary quarrels, and domestic misunderstandings.
2. **Dare reSadunhu (Headman's Court):**
   - Presided over by the **Headman (*Sadunhu*)**.
   - Hears appeals from village heads and handles land allocation disputes and stray livestock cases.
3. **Dare raMambo (Chief's Court - *Dare Guru*):**
   - Presided over by the **Paramount Chief (*Mambo*)** assisted by a council of elders (*Machinda*).
   - The highest customary court; judges serious traditional crimes, desecration of sacred shrines, incest (*makunakuna*), witchcraft allegations, and appeals from headmen. Penalties involve restitution (*kuripa*) in cattle or goats to the injured party.`
  },
  {
    id: "hss_g7_national_school_pledge",
    level: "Primary",
    subject: "Social Science",
    topic: "The National School Pledge",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 4: National Symbols",
    keywords: ["national school pledge", "school pledge", "words of the pledge", "importance of school pledge"],
    content: `### The National School Pledge of Zimbabwe

#### 1. Full Text of the National School Pledge
*"Almighty God, in whose hands our future lies,*
*I salute the national flag,*
*I respect the brave fathers and mothers who lost lives in the Chimurenga/Umvukela.*
*We are proud inheritors of the richness of our natural resources.*
*We are proud inheritors of the richness of our history.*
*I promise to be true and faithful to my country,*
*I promise to uphold our national values and aspirations.*
*I promise to serve my country through hard work,*
*And to contribute towards the development of our nation.*
*So help me God."*

#### 2. Importance of the National School Pledge
- **Inculcating Patriotism:** Instills national pride, love, and loyalty to Zimbabwe among school children.
- **Honouring Liberation Heroes:** Reminds learners of the supreme sacrifices made by heroes of the First and Second Chimurenga to liberate the country.
- **Promoting National Values (*Unhu/Ubuntu*):** Encourages honesty, integrity, discipline, respect for national resources, and dedication to hard work.
- **Building National Unity:** Recited in unison by school pupils of all ethnic groups, fostering unity and shared national aspirations.`
  },
  {
    id: "hss_g7_precolonial_kingdoms",
    level: "Primary",
    subject: "Social Science",
    topic: "Pre-Colonial Kingdoms of Zimbabwe",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 5: History",
    keywords: ["pre-colonial kingdoms", "great zimbabwe", "mutapa", "torwa", "rozvi", "ndebele kingdom"],
    content: `### Pre-Colonial Kingdoms of Zimbabwe

#### 1. Great Zimbabwe State (c. 1200 – 1450 AD)
- **Capital:** Great Zimbabwe monuments near Masvingo. Built using dry-stone masonry (granite blocks laid without mortar) with the famous Great Enclosure, Conical Tower, and Soapstone Birds.
- **Economy:** Cattle pastoralism, agriculture (sorghum, millet), gold and iron mining, and international trade with Arab, Persian, and Swahili merchants via Sofala port (exchanged gold and ivory for glass beads, porcelain, and cloth).
- **Decline:** Overpopulation, shortage of salt and firewood, exhausted grazing pastures, and civil strife.

#### 2. Mutapa State (c. 1450 – 1900 AD)
- **Founder:** Nyatsimba Mutota, who migrated north from Great Zimbabwe searching for salt, conquering the Zambezi Valley (*Mwenemutapa*).
- **Expansion:** Extended by his son Matope from the Kalahari to the Indian Ocean.
- **Contact with Portuguese:** Portuguese traders and missionaries (e.g. Father Gonçalo da Silveira, baptized King Chipuunutu in 1561 and was martyred). Portuguese interference (*Prazos* system) weakened the empire.

#### 3. Torwa and Rozvi States
- **Torwa State (c. 1450 – 1680):** Capital at **Khami** (near Bulawayo), known for terraced stone platforms and check patterns.
- **Rozvi State (c. 1680 – 1830s):** Founded by **Changamire Dombo**, whose powerful army (*Mavhuthu*) drove the Portuguese out of the Zimbabwean plateau. Famous for pastoralism and trade; weakened by 19th-century droughts and destroyed by Mfecane invasions (Ngoni and Ndebele).

#### 4. Ndebele State (c. 1840 – 1893)
- **Founding:** King Mzilikazi Khumalo migrated north during the Mfecane, crossing the Limpopo and settling at Matabeleland with capital at Inyati and later Gibixhegu/Bulawayo.
- **Social Structure:** Zansi (aristocratic Ngoni original migrants), Enhla (Sotho/Tswana absorbed during migration), and Hole (indigenous Shona/Kalanga).
- **King Lobengula:** Succeeded Mzilikazi in 1870; faced intense British imperial pressure culminating in the 1893 Anglo-Ndebele war.`
  },
  {
    id: "hss_g7_colonisation_and_chimurenga",
    level: "Primary",
    subject: "Social Science",
    topic: "Colonisation of Zimbabwe and the Liberation Struggle",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 6: Colonisation & Chimurenga",
    keywords: ["colonisation", "pioneer column", "first chimurenga", "second chimurenga", "mbuya nehanda", "chinhoyi battle"],
    content: `### Colonisation of Zimbabwe and the Liberation Struggle

#### 1. How Zimbabwe was Colonised
- **Deceptive Treaties:** Cecil John Rhodes formed the British South Africa Company (BSAC) and sent Charles Rudd to trick King Lobengula into signing the **Rudd Concession (1888)**, surrendering mineral rights.
- **Pioneer Column (1890):** A military mercenary expedition led by Major Frank Johnson and Leander Starr Jameson marched into Mashonaland and hoisted the British Union Jack at Fort Salisbury on **12 September 1890**.
- **1893 Anglo-Ndebele War:** BSAC forces invaded Matabeleland using Maxim machine guns, leading to the burning of Bulawayo, death of Allan Wilson's patrol at Shangani, and the disappearance of King Lobengula.

#### 2. The First Chimurenga / Umvukela (1896 – 1897)
- **Causes:** Brutal hut tax, confiscation of indigenous cattle, loss of fertile land to white settlers, and forced labour (*chibharo*).
- **Spirit Mediums:** **Mbuya Nehanda Charwe**, **Sekuru Kaguvi (Gumboreshumba)**, and **Mukwati** organized and united the Shona and Ndebele to fight colonial settlers.
- **Outcome:** The rebellion was brutally crushed with superior British weaponry. Mbuya Nehanda and Sekuru Kaguvi were hanged on 27 April 1898. Nehanda famously prophesied: *"Mapfupa angu achamuka"* ("My bones shall surely rise to win freedom").

#### 3. The Second Chimurenga / Umvukela (1966 – 1979)
- **Beginning:** The **Battle of Chinhoyi (28 April 1966)** where seven brave ZANLA freedom fighters fought valiantly against Rhodesian security forces.
- **Liberation Movements:** ZANU (military wing ZANLA led by Josiah Magama Tongogara) and ZAPU (military wing ZIPRA led by Lookout Masuku).
- **Peasant Mass Support:** Youths (*Vamujibha* and *Vachimbwido*) provided intelligence, food, and medicine during nightly political rallies (*Pungwes*).
- **Independence:** Lancaster House Agreement signed in December 1979 led to democratic elections won by ZANU, bringing **Independence on 18 April 1980**.`
  },
  {
    id: "hss_g7_systems_of_governance",
    level: "Primary",
    subject: "Social Science",
    topic: "Systems of Governance and Central Government Arms",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 7: Governance",
    keywords: ["systems of governance", "democracy", "autocracy", "arms of government", "legislature", "executive", "judiciary"],
    content: `### Systems of Governance and Central Government Arms

#### 1. Democracy vs Autocracy
- **Democracy:** Government of the people, by the people, and for the people. Leaders are chosen through regular, free, and fair elections; multiple political parties exist; the constitution and human rights are respected.
- **Autocracy:** A system of government where absolute supreme power is held by a single ruler or dictator. Citizens cannot choose leaders or criticize government decisions.

#### 2. The Three Arms of the Central Government of Zimbabwe
1. **The Legislature (Parliament):**
   - Composed of the **Senate** and the **National Assembly**.
   - **Function:** Debates national issues, scrutinizes government spending, and makes/passes national laws.
2. **The Executive:**
   - Composed of the **President**, **Vice Presidents**, and the **Cabinet (Ministers)**.
   - **Function:** Formulates national policies, runs government ministries, and executes/enforces laws passed by Parliament.
3. **The Judiciary:**
   - Composed of the **Chief Justice**, judges, and magistrates operating in the Constitutional Court, Supreme Court, High Court, and Magistrates' Courts.
   - **Function:** Impartially interprets laws, settles disputes, and dispenses justice.`
  },
  {
    id: "hss_g7_courtship_marriage_age_of_consent",
    level: "Primary",
    subject: "Social Science",
    topic: "Indigenous Courtship, Marriage Practices, and Age of Consent",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 8: Courtship & Family Law",
    keywords: ["courtship", "marriage practices", "tete", "sekuru", "roora", "lobola", "age of consent"],
    content: `### Indigenous Courtship, Marriage Practices, and Age of Consent

#### 1. Indigenous Courtship and Marriage Counsellors
- **Tete (Paternal Aunt):** Guides, educates, and advises girls on womanhood, marital respect, personal hygiene, and resolving domestic challenges.
- **Sekuru (Maternal Uncle):** Guides, mentors, and advises young men on manhood, earning a living, caring for a family, and conducting formal marriage negotiations.
- **Munyai (Marriage Emissary/Go-between):** An impartial respected person chosen to lead bride-price negotiations (*Roora/Lobola*) between the two families.

#### 2. Traditional Marriage Practices
- **Kukumbira (Formal Marriage):** Courteous proposal where the groom sends a *Munyai* to the bride's parents to pay lobola.
- **Roora / Lobola:** Traditional bride-wealth given by the groom's family (including *Mombe yeumai* to the mother and cattle to the father) to show appreciation, legitimize marriage, and unite the two clans.
- **Kuzvarira / Musengabere:** Outdated traditional practices that have been outlawed in modern Zimbabwe.

#### 3. Age of Consent to Sex and Marriage
- **Legal Age of Consent:** Under Section 78 of the Constitution of Zimbabwe and the **Marriages Act of 2022**, the legal minimum age of consent to sex and marriage is **18 years**.
- **Child Marriage Prohibition:** Any sexual intercourse or marriage involving a child below 18 years is a serious criminal offense punishable by long imprisonment.
- **Importance:** Protects children from physical and emotional harm, enables completion of primary and secondary education, and stops early unintended pregnancies.`
  },
  {
    id: "hss_g7_drug_and_substance_abuse",
    level: "Primary",
    subject: "Social Science",
    topic: "Drug and Substance Abuse",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 9: Health & Social Issues",
    keywords: ["drug abuse", "substance abuse", "mutoriro", "bronco", "mbanje", "effects of drug abuse"],
    content: `### Drug and Substance Abuse

#### 1. What is Drug and Substance Abuse?
**Drug and substance abuse** is the harmful, habitual, or excessive use of illicit substances or misuse of prescription and non-prescription medicines for non-medical reasons, leading to physical, psychological, and social damage.

#### 2. Commonly Abused Drugs and Substances in Zimbabwe
- **Crystal Meth (*Mutoriro* / *Guka* / *Dombo*):** A highly addictive, destructive synthetic stimulant.
- **Cough Syrups Containing Codeine (*Broncleer* / *Bronco*):** Misused for sedative intoxication.
- **Cannabis (*Mbanje* / Marijuana):** Hallucinogenic herb.
- **Alcohol:** Illicit home-brewed high-proof spirits (*Kachasu*, *Musombodhiya*).
- **Inhalants:** Glue, petrol, and paint thinners.

#### 3. Reasons Young People Abuse Drugs
- Negative peer pressure and desire to feel "accepted".
- Stress, depression, boredom, and lack of constructive recreational activities.
- Ignorance of severe health risks and glorified portrayals on social media.

#### 4. Destructive Effects of Drug Abuse
- **Health:** Severe brain damage, psychosis (madness), kidney/liver failure, addiction, and overdose death.
- **Social & Educational:** Dropping out of school, family conflicts, violent crime, and homelessness.

#### 5. Prevention and Rehabilitation Support
- Exercising strong self-discipline and firmly saying "NO" to negative peers.
- Engaging in sports, arts, and church/youth organizations.
- Seeking professional counseling and medical rehabilitation at specialized psychiatric centres (e.g. Sally Mugabe Central Hospital, Ingutsheni Central Hospital).`
  },
  {
    id: "hss_g7_first_aid_emergencies",
    level: "Primary",
    subject: "Social Science",
    topic: "First Aid and Handling Emergencies",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 10: Safety & First Aid",
    keywords: ["first aid", "emergency", "drabc", "burns", "bleeding", "first aid kit"],
    content: `### First Aid and Handling Emergencies

#### 1. What is First Aid?
**First Aid** is the immediate, temporary assistance and medical care given to an injured or suddenly ill person before professional medical help arrives.

#### 2. Aims of First Aid (The 3 Ps)
1. **Preserve Life:** Keep the patient alive.
2. **Prevent Condition from Worsening:** Avoid further injury, infection, or blood loss.
3. **Promote Recovery:** Relieve severe pain, reassure the patient, and facilitate healing.

#### 3. Steps in Dealing with an Emergency (The DRABC Action Plan)
1. **D – Danger:** Check for danger to yourself, bystanders, and the victim (e.g. fire, live wires, traffic). Never endanger yourself.
2. **R – Response:** Check if the victim is conscious by gently tapping their shoulders and asking loudly, "Are you okay?".
3. **A – Airway:** Open the victim's airway by gently tilting the head back and lifting the chin.
4. **B – Breathing:** Look, listen, and feel for breathing for up to 10 seconds.
5. **C – Circulation:** Check for signs of circulation (pulse) and control any severe bleeding with firm direct pressure using a clean cloth.

#### 4. Vital Emergency Contacts in Zimbabwe
- **Police Emergency:** 995 / 999
- **Ambulance:** 994
- **Fire Brigade:** 993
- Always alert an adult, teacher, or community leader immediately in an emergency.`
  }
];

// -----------------------------------------------------------------------------
// 2. FAREME / RELIGION (Topic 13 ZIMSEC 7050)
// -----------------------------------------------------------------------------
const religionChunks = [
  {
    id: "fareme_g7_four_religions_overview",
    level: "Primary",
    subject: "Social Science",
    topic: "The Four Major Religions in Zimbabwe: Indigenous Religion, Christianity, Islam, and Judaism",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 13: Religion",
    keywords: ["indigenous religion", "christianity", "islam", "judaism", "festivals", "sacred days", "holy places"],
    content: `### The Four Major Religions in Zimbabwe

#### 1. Indigenous Religion
- **God / Creator:** *Mwari* (Shona) / *uMlimu* (Ndebele) - the Supreme Creator of the universe.
- **Practitioners:** *N'anga* (traditional medical practitioner/herbalist) and *Svikiro* (spirit medium communicating ancestral guidance).
- **Sacred Days:** *Chisi* (traditional resting day on which cultivating fields is strictly prohibited).
- **Sacred Places:** *Njelele* shrine in Matobo Hills, sacred mountains, and sacred caves.
- **Ceremonies & Festivals:** *Mukwerera* (rain-asking ceremony), *Kurova Guva* / *Umbuyiso* (cleansing and bringing back the ancestral spirit), and harvest thanksgiving.
- **Religious Artefacts & Attire:** *Hakata* (divination bones), *Mbira*, *Hosho*, *Retso* (traditional cloth with black, white, and red stripes), and animal skins.
- **Key Teachings:** *Unhu/Ubuntu*, deep respect for elders and ancestors (*Vadzimu*), preserving nature, and living in communal harmony.

#### 2. Christianity
- **God:** One God manifested in the Holy Trinity (Father, Son, and Holy Spirit); founded on Jesus Christ.
- **Practitioners:** Pastors, Priests, Bishops, and Reverend Ministers.
- **Sacred Days:** Sunday (or Saturday for Seventh-day Adventists) dedicated to congregational worship.
- **Sacred Places:** Churches, cathedrals, and Jerusalem.
- **Ceremonies & Festivals:** Christmas (birth of Jesus Christ) and Easter (Crucifixion and Resurrection of Jesus Christ).
- **Religious Artefacts & Attire:** The Holy Bible, The Cross/Crucifix, communion bread and wine, and clergy vestments.
- **Key Teachings:** Love God and love your neighbour as yourself; the Ten Commandments; forgiveness and salvation.

#### 3. Islam
- **God:** Allah (the One, indivisible God); founded on the revelations received by Prophet Muhammad (Peace Be Upon Him).
- **Practitioners:** Imam (prayer leader) and Sheikh (Islamic scholar).
- **Sacred Day:** Friday (*Jummah* - congregational prayer afternoon).
- **Sacred Places:** Mosques (*Masjid*) and Mecca (Holy Kaaba in Saudi Arabia).
- **Ceremonies & Festivals:** Eid al-Fitr (celebration ending Ramadan fasting) and Eid al-Adha (festival of sacrifice during Hajj).
- **Religious Artefacts & Attire:** The Holy Quran, *Tasbih* (prayer beads), *Kanzu* / *Thobe*, and *Hijab* for modest dressing.
- **Food Laws:** Halal foods only; complete prohibition of pork (*Khinzir*) and alcohol.
- **Key Teachings (5 Pillars of Islam):** Shahada (faith), Salah (5 daily prayers), Zakat (charity), Sawm (Ramadan fasting), and Hajj (pilgrimage to Mecca).

#### 4. Judaism
- **God:** Yahweh (Adonai) - One supreme eternal God of Abraham, Isaac, and Jacob.
- **Practitioners:** Rabbi (spiritual teacher and leader) and Cantor (*Chazzan*).
- **Sacred Day:** Shabbat (Sabbath - from Friday sunset to Saturday night).
- **Sacred Places:** Synagogue (*Shul*) and the Western Wall in Jerusalem.
- **Ceremonies & Festivals:** Passover (*Pesach* - liberation from Egypt), Yom Kippur (Day of Atonement), Rosh Hashanah (Jewish New Year), and Hanukkah.
- **Religious Artefacts & Attire:** The Torah scroll, *Menorah* (seven-branched candelabrum), *Kippah/Yarmulke* (head covering), and *Tallit* (prayer shawl).
- **Food Laws:** Kosher food laws (strict separation of meat and dairy, no pork or shellfish).
- **Key Teachings:** The Ten Commandments, the Covenant with God, and *Tikkun Olam* (repairing the world through justice and charity).`
  },
  {
    id: "fareme_g7_voluntary_work_social_services",
    level: "Primary",
    subject: "Social Science",
    topic: "Voluntary and Humanitarian Organizations in Zimbabwe",
    source: "ZIMSEC Grade 7 Heritage and Social Studies 7050 • Topic 14: Social Services",
    keywords: ["voluntary work", "humanitarian organizations", "jairos jiri", "red cross", "matthew rusike", "social welfare"],
    content: `### Voluntary and Humanitarian Organizations in Zimbabwe

#### 1. What is Voluntary Work?
**Voluntary work** (volunteerism) is the selfless practice of offering your time, skills, and energy to assist vulnerable, needy, or disadvantaged people in the community without expecting monetary payment or material reward.

#### 2. Key Voluntary and Humanitarian Organizations in Zimbabwe
1. **The Zimbabwe Red Cross Society:** Provides first aid training, emergency disaster relief (during floods and cyclones), and community healthcare assistance.
2. **Jairos Jiri Association:** Founded by philanthropist Jairos Jiri in Bulawayo in 1950; provides vocational rehabilitation, special education, and accommodation for persons with physical and intellectual disabilities.
3. **Matthew Rusike Children's Home:** Founded in Epworth by Methodist Minister Rev. Matthew Rusike; provides residential care, shelter, education, and welfare for orphaned and vulnerable children.
4. **Island Hospice and Healthcare:** Provides palliative home care and emotional counseling for patients with terminal illnesses (e.g. advanced cancer).
5. **Childline Zimbabwe:** A free, confidential 24-hour helpline dedicated to protecting children from abuse, neglect, and exploitation.

#### 3. Government Institutions Supporting Vulnerable Groups
- **Department of Social Development (Social Welfare):** Administers public assistance, food aid distribution in drought-prone areas, BEAM (Basic Education Assistance Module) school fees for poor pupils, and orphan care.

#### 4. Benefits of Volunteerism
- Alleviates poverty, suffering, and loneliness among vulnerable community members.
- Fosters empathy, solidarity, and the genuine spirit of *Unhu/Ubuntu*.
- Equips volunteers with valuable leadership, communication, and practical life skills.`
  }
];

// -----------------------------------------------------------------------------
// 3. GRADE 7 ICT (Computer Systems & Digital Devices)
// -----------------------------------------------------------------------------
const ictChunks = [
  {
    id: "ict_g7_digital_devices_hardware_software",
    level: "Primary",
    subject: "Agric, Science & Tech",
    topic: "Digital Devices, Hardware, and Software",
    source: "ZIMSEC Grade 7 ICT Syllabus 7030 • Computer Systems",
    keywords: ["digital devices", "hardware", "software", "input devices", "output devices", "cpu", "ram", "storage"],
    content: `### Digital Devices, Hardware, and Software

#### 1. Digital Devices
A digital device is an electronic tool that processes data using microprocessors and digital binary signals (0s and 1s). Examples include smartphones, laptops, desktop computers, tablets, smartwatches, and automated teller machines (ATMs).

#### 2. Input Devices vs Output Devices
- **Input Devices:** Hardware used to enter raw data and instructions into a computer.
  * Examples: **Keyboard** (typing text), **Mouse** (pointing and clicking), **Microphone** (sound input), **Webcam** (video capture), **Scanner** (converting paper into digital images), and **Barcode Reader** (scanning supermarket products).
- **Output Devices:** Hardware that presents processed information to the user.
  * Examples: **Monitor/Screen** (visual display), **Printer** (hard-copy paper printouts), **Speakers/Headphones** (audio output), and **Projector** (large wall display).

#### 3. Main Internal Parts of a Computer
1. **Central Processing Unit (CPU):** The "brain" of the computer that carries out arithmetic calculations, controls operations, and executes instructions.
2. **Random Access Memory (RAM):** Temporary, fast volatile working memory that holds currently running programs and data. Its contents are lost when power is switched off.
3. **Storage (HDD / SSD / Flash Drive):** Permanent, non-volatile storage that retains files, programs, and operating systems even when the computer is turned off.

#### 4. Hardware vs Software
- **Hardware:** The physical, touchable parts of a computer system (e.g. monitor, keyboard, motherboard, wires).
- **Software:** The intangible set of computer instructions, programs, and data that tell the hardware how to work (e.g. Windows OS, Microsoft Word, web browsers).`
  },
  {
    id: "ict_g7_word_processing_spreadsheets_presentations",
    level: "Primary",
    subject: "Agric, Science & Tech",
    topic: "Productivity Tools: Word Processing, Spreadsheets, and Presentations",
    source: "ZIMSEC Grade 7 ICT Syllabus 7030 • Productivity Software",
    keywords: ["word processing", "spreadsheets", "presentations", "powerpoint", "excel", "word", "formulas", "formatting"],
    content: `### Productivity Tools: Word Processing, Spreadsheets, and Presentations

#### 1. Word Processing (e.g. Microsoft Word, Google Docs)
- **Purpose:** Creating, editing, formatting, saving, and printing text documents (letters, school reports, essays).
- **Key Features:**
  * **Text Formatting:** Changing font type, font size, bold (**B**), italic (*I*), underline (<u>U</u>), font color, and text alignment (left, center, right, justified).
  * **Editing Tools:** Cut, copy, paste, undo, redo, spell-check, and find-and-replace.
  * **Saving and Printing:** Saving work into appropriate folders and printing hard copies.

#### 2. Spreadsheets (e.g. Microsoft Excel, Google Sheets)
- **Purpose:** Organizing, calculating, analyzing, and graphing numerical data in tables.
- **Key Concepts:**
  * **Rows:** Horizontal lines identified by numbers (1, 2, 3...).
  * **Columns:** Vertical lines identified by letters (A, B, C...).
  * **Cells:** The intersection of a row and a column (e.g. cell **B4** is column B, row 4).
  * **Formulas:** Calculations that always begin with an equals sign ($=$):
    - Addition: \`=A1+B1\`
    - Sum of a range: \`=SUM(C1:C10)\`
    - Average of a range: \`=AVERAGE(D1:D10)\`
  * **Charts:** Creating visual bar graphs, line graphs, and pie charts to present data clearly.

#### 3. Presentation Software (e.g. Microsoft PowerPoint, Google Slides)
- **Purpose:** Designing visual slide shows to present information clearly to an audience.
- **Key Features:** Adding slides, typing bulleted text, inserting pictures, applying slide transitions, and rehearsing slide shows.`
  },
  {
    id: "ict_g7_internet_malware_cyber_safety",
    level: "Primary",
    subject: "Agric, Science & Tech",
    topic: "The Internet, Malware, and Online Safety",
    source: "ZIMSEC Grade 7 ICT Syllabus 7030 • Internet & Cyber Hygiene",
    keywords: ["internet", "world wide web", "malware", "virus", "antivirus", "passwords", "cyberbullying", "privacy"],
    content: `### The Internet, Malware, and Online Safety

#### 1. The Internet vs The World Wide Web
- **The Internet:** A massive global network of interconnected computer networks enabling computers worldwide to communicate with each other.
- **The World Wide Web (WWW):** A collection of digital web pages, documents, videos, and images stored on internet servers and accessed using a web browser via hyperlinks.

#### 2. Computer Malware and Antivirus
- **What is Malware?** Malicious software designed to damage, disrupt, or gain unauthorized access to computer systems (e.g. viruses, worms, Trojan horses, spyware).
- **Computer Virus:** A program that attaches itself to files and multiplies, deleting data or slowing down the device.
- **How Viruses Spread:** Through infected USB flash drives, downloading suspicious files, and opening infected email attachments.
- **Protection:** Installing and regularly updating reputable **antivirus software** and enabling a **firewall**.

#### 3. Safe Online Behaviour and Cyberbullying
- **Strong Passwords:** Create passwords with at least 8 characters combining uppercase, lowercase, numbers, and symbols. Keep passwords private and log out of shared computers.
- **Privacy and Personal Data:** Never share your full name, home address, phone number, school location, or photos with strangers on the internet.
- **Cyberbullying:** Bullying, insulting, or threatening someone online. Always report cyberbullying immediately to parents or teachers, block the bully, and never retaliate.`
  },
  {
    id: "ict_g7_ai_algorithms_robotics",
    level: "Primary",
    subject: "Agric, Science & Tech",
    topic: "Artificial Intelligence, Algorithms, Block Coding, and Robotics",
    source: "ZIMSEC Grade 7 ICT Syllabus 7030 • Emerging Technologies",
    keywords: ["artificial intelligence", "ai", "algorithms", "block coding", "scratch", "robotics", "ict careers"],
    content: `### Artificial Intelligence, Algorithms, Block Coding, and Robotics

#### 1. Artificial Intelligence (AI)
- **What is AI?** Artificial Intelligence is the capability of a computer system or machine to mimic human intelligence, learning from data patterns to perform tasks such as problem-solving, image recognition, and decision-making.
- **Ordinary Programs vs AI:** Ordinary programs follow fixed rigid instructions; AI programs learn, adapt, and improve their accuracy based on training data.
- **Everyday Applications in Zimbabwe:**
  * **Agriculture:** Drones scanning crops to diagnose diseases and identify nutrient deficiencies.
  * **Healthcare:** Smart diagnostics analyzing patient symptoms in rural clinics.
  * **Education:** Offline personalized tutoring assistants (like ZEXA AI).
- **Responsible Use:** Checking AI responses for accuracy and never sharing private confidential data.

#### 2. Algorithms and Block Coding
- **Algorithm:** A finite, step-by-step sequence of clear instructions designed to solve a specific problem or complete a task (like a cooking recipe).
- **Block Coding (e.g. Scratch):** Visual programming where learners snap together graphical puzzle blocks to code animations and games without writing complex syntax.
  * **Events:** Triggering actions (e.g. "when green flag clicked").
  * **Loops:** Repeating actions (e.g. "repeat 10 times" or "forever").
  * **Conditionals:** Making decisions (e.g. "if touching edge, bounce").
  * **Variables:** Storing changeable values (e.g. "Score").

#### 3. Robotics
- **What is a Robot?** A programmable mechanical machine capable of carrying out complex actions automatically or by remote control.
- **Three Core Parts of a Robot:**
  1. **Sensors (Input):** Detect light, obstacles, sound, or temperature.
  2. **Controller/Brain (Processing):** Microcontroller that processes sensor data according to programmed algorithms.
  3. **Actuators/Motors (Output):** Motors and mechanical arms that produce movement and physical work.

#### 4. ICT Careers in Zimbabwe
- **Software Developer / Programmer:** Creates computer applications and games.
- **Cybersecurity Specialist:** Protects computer systems and networks against hackers.
- **Network Engineer:** Designs and maintains internet and communication connections.
- **Data Analyst:** Analyzes trends to help businesses make informed decisions.`
  }
];

// -----------------------------------------------------------------------------
// 4. GRADE 7 PHYSICAL EDUCATION AND ARTS (ZIMSEC 7130)
// -----------------------------------------------------------------------------
const peArtsChunks = [
  {
    id: "pe_g7_safety_habits_body_organs",
    level: "Primary",
    subject: "Physical Edu & Arts",
    topic: "Safety, Warm-Up, Cool-Down, and Body Organs in Physical Education",
    source: "ZIMSEC Grade 7 Physical Education and Arts 7130 • Safety & Health",
    keywords: ["safety rules", "warm up", "cool down", "healthy living habits", "body organs", "storage and transport of food air blood"],
    content: `### Safety, Warm-Up, Cool-Down, and Body Organs in Physical Education

#### 1. Safety Rules in Physical Activities
- Wear appropriate sports attire (shorts, t-shirt, and running shoes).
- Inspect the sports field and apparatus before use to remove glass, stones, or broken equipment.
- Always perform a warm-up before vigorous physical activities and a cool-down afterwards.
- Follow teacher instructions and observe fair play to prevent collisions and injuries.

#### 2. Warm-Up vs Cool-Down
- **Warm-Up:**
  * **Definition:** Light, preparatory aerobic exercises and gentle stretches performed before sports.
  * **Importance:** Gradually elevates heart rate, increases blood flow and oxygen to muscles, loosens joints, and **prevents muscle strains and ligament tears**.
- **Cool-Down:**
  * **Definition:** Gentle low-intensity activities (slow jogging, static stretching) performed immediately after sports.
  * **Importance:** Gradually returns heart rate and breathing to normal, helps disperse **lactic acid** to prevent muscle stiffness and dizziness.

#### 3. Organs That Store and Transport Food, Air, and Blood
- **Transporting and Storing Food:**
  * **Storage:** The **Stomach** stores chewed food for 2 to 4 hours while churning it with gastric juice.
  * **Transport:** The **Esophagus (Gullet)** transports food from the mouth to the stomach via peristalsis; the **Small and Large Intestines** transport food residues during digestion and absorption.
- **Transporting Air (Oxygen):**
  * **Organs:** **Nose/Mouth** $\rightarrow$ **Trachea (Windpipe)** $\rightarrow$ **Bronchi** $\rightarrow$ **Lungs (Alveoli)**.
  * **Process:** The lungs expand to intake oxygen and contract to expel carbon dioxide.
- **Transporting Blood:**
  * **Organ:** The **Heart** pumps blood through **Arteries** (away from heart), **Veins** (back to heart), and microscopic **Capillaries** to deliver oxygen and nutrients to working muscles.`
  },
  {
    id: "pe_g7_music_dance_traditional_instruments",
    level: "Primary",
    subject: "Physical Edu & Arts",
    topic: "Music, Dance, and Indigenous Musical Instruments of Zimbabwe",
    source: "ZIMSEC Grade 7 Physical Education and Arts 7130 • Music & Dance",
    keywords: ["music", "dance", "traditional instruments", "mbira", "hosho", "ngoma", "muchongoyo", "mbende", "jerusarema"],
    content: `### Music, Dance, and Indigenous Musical Instruments of Zimbabwe

#### 1. Indigenous Musical Instruments of Zimbabwe
1. **Mbira (Thumb Piano):** Metal keys mounted on a wooden soundboard, played inside a calabash resonator (*Deze*). Used in spiritual and cultural ceremonies.
2. **Ngoma (Traditional Drums):** Hollow wooden cylinders covered with stretched cow/goat hide, played with hands or wooden sticks.
3. **Hosho (Gourd Rattles):** Dried gourd gourds containing *hota* seeds, shaken to provide a driving, precise rhythmic background.
4. **Marimba (Wooden Xylophones):** Wooden keys tuned to different pitches mounted over acoustic resonators, played with rubber-tipped mallets.
5. **Chipendani (Mouth Bow):** A plucked musical bow using the player's mouth cavity as an acoustic resonance chamber.

#### 2. Traditional Zimbabwean Dances and Cultural Functions
- **Mbende / Jerusarema (Zezuru - Murehwa/Uzumba):** Energetic, acrobatic dance featuring rapid drumming and leg movements. Originally a war/fertility dance; recognized by UNESCO as Masterpiece of Oral and Intangible Heritage.
- **Muchongoyo (Ndau / Shangani - Chipinge/Chiredzi):** Majestic martial war dance performed by men holding shields and knobkerries, stamping feet vigorously to celebrate military victories.
- **Isitshikitsha (Ndebele):** Graceful, joyful celebratory dance traditionally performed for the king, accompanied by singing, clapping, and whistle-blowing.
- **Amabhiza (Kalanga):** Vibrant dance imitating galloping horses, performed at celebrations and rainmaking.
- **Mhande (Karanga - Masvingo/Midlands):** Solemn, graceful dance performed during rain-asking ceremonies (*Mukwerera*) with slow, deliberate foot movements.

#### 3. Functions of Music and Dance in Society
- Preserves oral history, cultural values, and indigenous heritage.
- Unites communities during celebrations, weddings, and work parties (*Nhimbe*).
- Provides entertainment, artistic expression, and emotional healing.`
  },
  {
    id: "pe_g7_visual_arts_theatre",
    level: "Primary",
    subject: "Physical Edu & Arts",
    topic: "Visual Arts and Theatre in Zimbabwe",
    source: "ZIMSEC Grade 7 Physical Education and Arts 7130 • Arts & Theatre",
    keywords: ["visual arts", "theatre", "shona stone sculpture", "rock art", "pottery", "stage blocking", "props"],
    content: `### Visual Arts and Theatre in Zimbabwe

#### 1. Visual Arts Traditions in Zimbabwe
- **Rock Paintings (San Rock Art):** Ancient paintings on cave walls depicting animals (kudu, eland), hunting rituals, and spiritual ceremonies using natural mineral pigments.
- **Shona Stone Sculpture:** World-renowned contemporary art tradition sculpting serpentine and springstone rock into expressive human and spiritual figures (e.g. artists Dominic Benhura, Bernard Matemera).
- **Basketry and Weaving:** Binga baskets (Tonga people) woven from palm leaves (*ilala*) with intricate geometric patterns.
- **Pottery (*Kuumba Hari*):** Hand-moulded clay pots fired in pits (*Hari dzekubikisa*, *Pfuko yemvura*) used for cooking, water cooling, and traditional ceremonies.
- **Preservation:** Conserved at the **National Gallery of Zimbabwe** in Harare, Bulawayo, and Mutare.

#### 2. Theatre and Drama in Zimbabwe
- **Indigenous Pre-Colonial Storytelling (*Ngano / Inganekwane*):** Oral dramatic performances around the fire where the storyteller (*Murwizi*) used song, mime, facial expressions, and audience call-and-response (*Dzepfunde*) to teach moral virtues.
- **Stage Areas:**
  * **Upstage:** The back of the stage (away from the audience).
  * **Downstage:** The front of the stage (closest to the audience).
  * **Stage Left & Stage Right:** The actor's left and right when facing the audience.
  * **Centre Stage:** The exact middle of the stage.
- **Blocking:** The precise planned movement and positioning of actors on stage during a theatrical play.
- **Props (Properties):** Portable objects handled and used by actors on stage (e.g. a walking stick, a book, a telephone).`
  },
  {
    id: "pe_g7_athletics_games_gymnastics",
    level: "Primary",
    subject: "Physical Edu & Arts",
    topic: "Athletics, Balances, Locomotion, and Team Games",
    source: "ZIMSEC Grade 7 Physical Education and Arts 7130 • Sports & Athletics",
    keywords: ["athletics", "sprints", "baton exchange", "balances", "invasion games", "swimming", "aquatic skills"],
    content: `### Athletics, Balances, Locomotion, and Team Games

#### 1. Track and Field Athletics
- **Sprint Mechanics:** Pumping arms rhythmically from hip to lip, driving knees high, running on the balls of the feet, and leaning forward slightly.
- **Baton Handover in Relays (4x100m):**
  * **Non-Visual Handover:** The outgoing runner looks straight ahead and reaches back with an open palm to receive the baton at top speed within the changeover box.
- **Jumping Events:** Long jump (run-up, take-off from board, flight, landing in sandpit) and High jump (scissors technique or Fosbury flop).
- **Throwing Events:** Shot put, javelin, and discus (focusing on grip, power stance, body rotation, and release angle).

#### 2. Balances and Locomotion (Gymnastics)
- **Static Balances:** Holding stationary body postures still for at least 3 to 5 seconds without falling (e.g. headstand, shoulder stand, arabesque, one-leg balance).
- **Dynamic Balances:** Maintaining steady body equilibrium while in continuous motion (e.g. walking along a raised balance beam, performing cartwheels).
- **Locomotor Movements:** Quick body travel through space (sprinting, dodging, leaping, sliding, bounding).

#### 3. Categories of Games
- **Invasion Games (Football, Netball, Basketball, Rugby):** Teams invade opponent territory to score while defending their goal; requires spatial awareness and tactical positioning.
- **Target Games (Archery, Target Throwing):** Propelling an object accurately to hit a designated target.
- **Net Games (Volleyball, Tennis):** Striking a ball across a net into the opponent's court so they cannot return it.
- **Striking and Fielding Games (Cricket, Rounders):** Batters hit a thrown ball and run between wickets/bases while fielders retrieve and return the ball.
- **Aquatics & Survival Swimming:** Treading water, mushroom float, and mastering survival swimming strokes (freestyle, backstroke, breaststroke) to prevent drowning.`
  }
];

// Helper to update or write an asset JSON file
function writeOrUpdateAsset(filename, newChunks) {
  const filePath = path.join(assetsDir, filename);
  let existing = [];
  if (fs.existsSync(filePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(parsed)) {
        existing = parsed;
      } else if (Array.isArray(parsed.chunks)) {
        existing = parsed.chunks;
      }
    } catch (e) {
      existing = [];
    }
  }

  const existingIds = new Set(existing.map(c => c.id));
  let addedCount = 0;
  for (const chunk of newChunks) {
    if (!existingIds.has(chunk.id)) {
      existing.push(chunk);
      existingIds.add(chunk.id);
      addedCount++;
    } else {
      // Update existing chunk with fresh content
      const index = existing.findIndex(c => c.id === chunk.id);
      if (index !== -1) {
        existing[index] = chunk;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf8');
  console.log(`Updated ${filename}: now has ${existing.length} chunks (${addedCount} newly appended).`);
}

writeOrUpdateAsset('zimsec_primary_heritage_grade7.json', heritageChunks);
writeOrUpdateAsset('zimsec_fareme primary.json', religionChunks);
writeOrUpdateAsset('zimsec_ict_grade7.json', ictChunks);
writeOrUpdateAsset('zimsec_primary_pe_grade7.json', peArtsChunks);

console.log('Successfully generated and updated all Primary HBC syllabus JSON databases!');
