// scripts/generate_hss_qa.cjs
// Comprehensive question-and-answer dataset for Grade 7 Heritage and Social Studies
// Strictly aligned with ZIMSEC Heritage-Based Curriculum (HBC 2024-2030)

const hssQA = [
  // 1. Marital relationships & conflict management
  {
    id: "hss_marital_ideal_characteristics",
    topic: "Marital relationships",
    section: "Heritage and Social Studies",
    question: "identify characteristics of ideal marital relationships",
    normalizedQuestions: [
      "identify characteristics of ideal marital relationships",
      "characteristics of ideal marital relationships",
      "what are the characteristics of an ideal marital relationship",
      "qualities of a good marriage",
      "features of an ideal marital relationship"
    ],
    answer: `### Characteristics of Ideal Marital Relationships

In Grade 7 Heritage and Social Studies, an **ideal marital relationship** is a harmonious union between spouses grounded in *Unhu/Ubuntu* and mutual commitment. Key characteristics include:

1. **Mutual Respect and Honour:** Both partners value each other's opinions, dignity, personal rights, and cultural roles without domestic violence or emotional abuse.
2. **Love, Affection, and Fidelity:** Unwavering emotional attachment, companionship, and faithfulness to the marital vow.
3. **Effective and Honest Communication:** Open, truthful discussions regarding family welfare, finances, children's schooling, and personal feelings without secrecy or hostility.
4. **Shared Family Responsibilities:** Equal dedication to providing household necessities, parenting children, performing chores, and caring for extended relatives.
5. **Trust and Transparency:** Honesty in financial earnings, decision-making, and day-to-day interactions.
6. **Patience, Empathy, and Forgiveness:** Willingness to accommodate human weaknesses, apologize sincerely, and resolve conflicts peacefully through dialogue.`,
    keywords: ["marital relationships", "ideal marriage", "characteristics of ideal marital", "marriage qualities"]
  },
  {
    id: "hss_marital_dispute_solutions",
    topic: "Marital relationships",
    section: "Heritage and Social Studies",
    question: "suggest possible solutions to marital disputes",
    normalizedQuestions: [
      "suggest possible solutions to marital disputes",
      "solutions to marital disputes",
      "how to resolve marital disputes",
      "ways of solving marriage problems",
      "resolving marital disputes in zimbabwe"
    ],
    answer: `### Solutions to Marital Disputes

Marital disputes in Zimbabwean communities can be resolved through both indigenous cultural structures and contemporary frameworks:

1. **Indigenous Family Mediation (*VanaTete naVanaSekuru*):** Consulting trusted aunts (*Tete*) and uncles (*Sekuru* / *uMalume*) who act as neutral, empathetic mediators without humiliating either spouse.
2. **Open Spousal Dialogue:** Sitting down privately to express grievances calmly, listen empathetically, and agree on compromises.
3. **Professional Marriage Counselling:** Seeking guidance from certified relationship counsellors, religious leaders (pastors, priests, imams), or community social workers.
4. **Financial Transparency and Joint Budgeting:** Drawing up clear family budgets together to eliminate disputes arising from secrecy or misuse of money.
5. **Traditional Court Arbitration (*Dare*):** In cases involving domestic conflict or abuse of cultural expectations, village heads (*Sabhuku*) or chiefs (*Mambo*) provide customary guidance.
6. **Legal Remedies and Protection Orders:** Where domestic violence occurs, applying for a Protection Order under the **Domestic Violence Act** through the Magistrates' Courts.`,
    keywords: ["marital disputes", "solutions to marital disputes", "resolving marriage disputes", "marriage counselling"]
  },
  {
    id: "hss_conflict_management_identify_conflicts",
    topic: "Conflict management",
    section: "Heritage and Social Studies",
    question: "identify conflicts at home, school and community",
    normalizedQuestions: [
      "identify conflicts at home school and community",
      "conflicts at home school and community",
      "types of conflicts at home school and community",
      "examples of conflicts at home school and community"
    ],
    answer: `### Conflicts at Home, School, and Community

Conflict occurs when individuals or groups have opposing interests, beliefs, or actions:

1. **Conflicts at Home:**
   - Sibling rivalry over food, chores, toys, or television control.
   - Marital disagreements between parents over finances, infidelity, or parenting styles.
   - Inheritance disputes among relatives following the death of a breadwinner.
   - Domestic violence and physical or emotional abuse.

2. **Conflicts at School:**
   - Bullying, name-calling, tease, and physical fights between learners.
   - Disputes over stationery, sports gear, desks, or textbooks.
   - Disagreements during group work, class elections, or sporting competitions.
   - Friction between learners and prefects or teachers regarding discipline.

3. **Conflicts in the Community:**
   - Land and boundary disputes between neighbouring farmers or plot owners.
   - Competition over scarce communal resources (boreholes, grazing lands, firewood).
   - Political and religious disagreements.
   - Petty crimes, cattle rustling, trespassing, and noise pollution.`,
    keywords: ["conflicts at home", "conflicts at school", "community conflicts", "conflict management"]
  },
  {
    id: "hss_conflict_management_causes",
    topic: "Conflict management",
    section: "Heritage and Social Studies",
    question: "examine causes of conflicts at home, school and community",
    normalizedQuestions: [
      "examine causes of conflicts at home school and community",
      "causes of conflicts at home school and community",
      "what causes conflicts at home school and community",
      "reasons for conflict at home school and community"
    ],
    answer: `### Causes of Conflicts at Home, School, and Community

The primary drivers of conflict across social settings include:

1. **Causes of Conflicts at Home:**
   - **Poverty and Resource Scarcity:** Inability to afford food, clothing, rent, or school fees causing frustration.
   - **Poor Communication:** Misunderstanding motives, keeping secrets, or hurling verbal insults.
   - **Substance Abuse:** Alcoholism and drug abuse triggering irrational anger and domestic violence.
   - **Infidelity and Jealousy:** Mistrust between marital partners.

2. **Causes of Conflicts at School:**
   - **Bullying and Peer Pressure:** Intimidating younger or weaker learners for lunch money or snacks.
   - **Academic Competition:** Jealousy over grades, sports awards, or leadership positions.
   - **Theft and Property Damage:** Taking fellow learners' pens, books, or bags without permission.
   - **Breach of School Rules:** Defiance of school prefects and class monitors.

3. **Causes of Conflicts in the Community:**
   - **Boundary Encroachments:** Ploughing into roads, shared pathways, or neighbours' fields.
   - **Overcrowding at Water Points:** Queuing disputes and vandalism of community boreholes.
   - **Stray Livestock:** Cattle and goats destroying neighbours' crops due to improper herding.
   - **Chieftainship and Succession Battles:** Rival families claiming traditional authority.`,
    keywords: ["causes of conflicts", "why conflicts happen", "causes of conflict at home school community"]
  },
  {
    id: "hss_conflict_management_ways_of_resolving",
    topic: "Conflict management",
    section: "Heritage and Social Studies",
    question: "suggest possible ways of resolving conflicts",
    normalizedQuestions: [
      "suggest possible ways of resolving conflicts",
      "ways of resolving conflicts",
      "how to resolve conflicts at home school and community",
      "conflict resolution methods",
      "resolving conflicts in society"
    ],
    answer: `### Ways of Resolving Conflicts

Peaceful conflict resolution restores harmony and solidarity in society:

1. **Active Listening and Dialogue:** Allowing each aggrieved party to state their grievance without interruption to reach mutual understanding.
2. **Negotiation and Compromise:** Willingness by both sides to give up minor demands to achieve a mutually acceptable win-win solution.
3. **Peer Mediation and Teacher Guidance at School:** Involving class teachers, school counsellors, or prefects to mediate fairly between conflicting students.
4. **Indigenous Mediation (*Dare* System):** Bringing community disputes before the village head (*Sabhuku*) or traditional chief (*Mambo*) for restorative justice and reconciliation.
5. **Apology and Restitution (*Kureurura nekudzora*):** Sincerely admitting wrongdoing, apologizing, and replacing or repairing damaged property.
6. **Legal Arbitration and Police Intervention:** Reporting violent crimes, assault, and severe threats to the Zimbabwe Republic Police (ZRP) and civil courts.`,
    keywords: ["resolving conflicts", "ways of resolving conflicts", "conflict resolution", "solving disputes"]
  },

  // 2. Family Disintegration
  {
    id: "hss_family_disintegration_define",
    topic: "Family disintegration",
    section: "Heritage and Social Studies",
    question: "define family disintegration",
    normalizedQuestions: [
      "define family disintegration",
      "what is family disintegration",
      "meaning of family disintegration",
      "family disintegration definition"
    ],
    answer: `### Definition of Family Disintegration

**Family disintegration** (also known as *family breakdown*) is the complete collapse of family structure, unity, and stability resulting from divorce, desertion, separation, or the death of one or both parents. It leads to the failure of the family unit to carry out its primary social, emotional, and economic responsibilities.`,
    keywords: ["family disintegration", "define family disintegration", "family breakdown"]
  },
  {
    id: "hss_family_disintegration_causes",
    topic: "Family disintegration",
    section: "Heritage and Social Studies",
    question: "state causes of family disintegration",
    normalizedQuestions: [
      "state causes of family disintegration",
      "causes of family disintegration",
      "what causes family disintegration",
      "reasons for family disintegration"
    ],
    answer: `### Causes of Family Disintegration

Key factors contributing to family disintegration in Zimbabwe include:

1. **Divorce and Legal Separation:** Irreconcilable differences, loss of love, and marital breakdown.
2. **Domestic Violence and Abuse:** Physical, sexual, or emotional brutality forcing one spouse and children to flee.
3. **Severe Economic Hardship and Poverty:** Inability to provide food and shelter, causing high stress and abandonment.
4. **Spousal Migration (Diaspora Separation):** Long separations when one or both spouses work abroad, causing estrangement and broken communication.
5. **Drug and Alcohol Abuse:** Addictions that drain household finances and incite violent behaviour.
6. **Death of Parents:** Fatal illnesses such as HIV/AIDS, cancer, or road accidents leaving child-headed households.
7. **Infidelity and Extramarital Affairs:** Breaking marital trust and inciting bitter disputes.`,
    keywords: ["causes of family disintegration", "why families break down", "factors leading to family disintegration"]
  },
  {
    id: "hss_family_disintegration_effects_on_identity",
    topic: "Family disintegration",
    section: "Heritage and Social Studies",
    question: "outline the effects of family disintegration on identity",
    normalizedQuestions: [
      "outline the effects of family disintegration on identity",
      "effects of family disintegration on identity",
      "how family disintegration affects identity",
      "impact of family disintegration on child identity"
    ],
    answer: `### Effects of Family Disintegration on Identity

Family breakdown has profound negative impacts on an individual's personal and cultural identity:

1. **Loss of Cultural Lineage and Totem Identity:** Children raised away from their paternal or maternal clans may never learn their mutupo/isibongo, praises (*zvidau*), or ancestral history.
2. **Emotional and Psychological Identity Crisis:** Feeling abandoned, unloved, and unworthy, leading to low self-esteem, depression, and confusion.
3. **Loss of Social Role Models:** Without positive father or mother figures, children struggle to learn gender roles and moral virtues of *Unhu/Ubuntu*.
4. **Vulnerability to Deviant Subcultures:** Displaced youths often turn to street gangs, substance abuse, and criminal peer groups to seek a false sense of belonging.
5. **Loss of Sense of Security and Family Pride:** Embarrassment and social stigma associated with being an orphan or child of separated parents.`,
    keywords: ["effects of family disintegration on identity", "family disintegration identity", "impact on identity"]
  },
  {
    id: "hss_family_disintegration_curbing",
    topic: "Family disintegration",
    section: "Heritage and Social Studies",
    question: "suggest ways of curbing family disintegration",
    normalizedQuestions: [
      "suggest ways of curbing family disintegration",
      "ways of curbing family disintegration",
      "how to prevent family disintegration",
      "curbing family disintegration",
      "reducing family breakdown"
    ],
    answer: `### Ways of Curbing Family Disintegration

Measures to prevent and reduce family breakdown include:

1. **Premarital and Marriage Counselling:** Educating courting couples on commitment, financial planning, and realistic marital expectations before marrying.
2. **Strengthening Extended Family Support Systems:** Engaging aunts (*VanaTete*) and uncles (*VanaSekuru*) early to mediate small misunderstandings before they escalate.
3. **Economic Empowerment and Poverty Alleviation:** Supporting families through community cooperatives, agricultural inputs (*Pfumvudza*), and small enterprise loans.
4. **Combating Domestic Violence:** Rigorous enforcement of the Domestic Violence Act and harsh sentencing for perpetrators of domestic abuse.
5. **Substance Abuse Rehabilitation:** Setting up accessible community addiction recovery centers to treat alcoholism and illicit drug dependencies.
6. **Social Welfare Safety Nets:** Government and NGO provisions (BEAM, cash transfers, food hampers) to support vulnerable child-headed and single-parent homes.`,
    keywords: ["curbing family disintegration", "preventing family breakdown", "curbing family breakdown"]
  },

  // 3. Preservation of Heritage Sites (The User's Specific Failing Question!)
  {
    id: "hss_heritage_sites_identify_major",
    topic: "Preservation of heritage sites",
    section: "Heritage and Social Studies",
    question: "identify major heritage sites of Zimbabwe",
    normalizedQuestions: [
      "identify major heritage sites of Zimbabwe",
      "major heritage sites of Zimbabwe",
      "list major heritage sites of Zimbabwe",
      "name the heritage sites of Zimbabwe",
      "what are the major heritage sites of Zimbabwe"
    ],
    answer: `### Major Heritage Sites of Zimbabwe

Zimbabwe possesses rich cultural and natural heritage sites recognized nationally and internationally:

1. **Great Zimbabwe National Monument (Masvingo):**
   - The ancient capital of the Kingdom of Zimbabwe (11th–15th century).
   - Renowned worldwide for its massive dry-stone walls built without mortar (Hill Complex, Great Enclosure, and Valley Ruins).
   - Origin of the sacred carved soapstone **Zimbabwe Bird** (*Hungwe*).
   - UNESCO World Heritage Site.

2. **Khami Ruins National Monument (Near Bulawayo):**
   - The capital of the Torwa State (15th–17th century) built with elaborate decorative stone terracing and chequer patterns.
   - UNESCO World Heritage Site.

3. **Matobo Hills / Matopos (Matabeleland South):**
   - Spectacular granite rock formations, sacred indigenous shrines (*Njelele*), rich San rock art caves, and burial site of King Mzilikazi and Cecil John Rhodes.
   - UNESCO Cultural Landscape World Heritage Site.

4. **Victoria Falls (*Mosi-oa-Tunya* - The Smoke That Thunders):**
   - One of the Seven Natural Wonders of the World on the Zambezi River.
   - Renowned for its immense curtain of falling water and vibrant rainforest ecosystem.

5. **Mana Pools National Park (Zambezi Valley):**
   - World-famous natural wildlife heritage site with expansive floodplains and four large inland oxbow lakes.

6. **Ziwa National Monument (Nyanga):**
   - Extensive agricultural stone terraces, dry-stone livestock pit structures, and iron smelting furnaces.

7. **Domboshava and Chiremba (Epworth) Balancing Rocks:**
   - Prehistoric San rock art sites and iconic geological granite balancing formations featured on Zimbabwe currency.

8. **Chinhoyi Caves (*Chirorodziva*):**
   - Sacred subterranean limestone caves featuring the deep cobalt-blue Sleeping Pool.

9. **Old Bulawayo (*KoBulawayo*):**
   - The historic 19th-century royal capital of King Lobengula Khumalo, preserving royal kraal architecture and early colonial interactions.

10. **National Heroes Acre (Harare):**
    - Revered national liberation monument and shrine honouring gallant freedom fighters who sacrificed for Zimbabwe's independence.`,
    keywords: ["major heritage sites of zimbabwe", "heritage sites of zimbabwe", "identify major heritage sites", "great zimbabwe", "khami ruins", "matobo hills"]
  },
  {
    id: "hss_heritage_sites_describe_ways_of_preserving",
    topic: "Preservation of heritage sites",
    section: "Heritage and Social Studies",
    question: "describe ways of preserving heritage sites of Zimbabwe",
    normalizedQuestions: [
      "describe ways of preserving heritage sites of Zimbabwe",
      "ways of preserving heritage sites of Zimbabwe",
      "describe ways of preserving heritage sites",
      "ways of preserving heritage sites",
      "how to preserve heritage sites in Zimbabwe",
      "how are heritage sites preserved in Zimbabwe",
      "methods of preserving heritage sites of Zimbabwe",
      "preservation of heritage sites in Zimbabwe"
    ],
    answer: `### Ways of Preserving Heritage Sites of Zimbabwe

Preserving Zimbabwe's heritage sites protects the nation's historical identity, sacred spirituality, and tourism economy for future generations. The primary ways to preserve heritage sites include:

1. **Enforcing Heritage Protection Laws and Regulations:**
   - Administering the **National Museums and Monuments of Zimbabwe (NMMZ) Act** [Chapter 25:11].
   - Enforcing strict legal penalties, heavy fines, and imprisonment for trespassing, vandalism, illegal excavations, and theft of historical artefacts.

2. **Community Custodianship and Cultural Taboos (*Zviera*):**
   - Partnering with local traditional chiefs (*Madzimambo*), village heads (*Masabhuku*), and spirit mediums who enforce indigenous taboos protecting sacred hills, caves, and groves.
   - Instilling cultural reverence (*Unhu/Ubuntu*) that forbids defacing rocks or cutting sacred trees.

3. **Physical Protection, Fencing, and Access Control:**
   - Erecting robust perimeter fences around fragile archaeological monuments (e.g. Great Zimbabwe, Khami, Ziwa).
   - Establishing designated visitor walking trails and viewing platforms to avoid footsteps destabilizing ancient dry-stone terraces.
   - Operating controlled entrance gates with security rangers to monitor tourist numbers and prevent overcrowding.

4. **Continuous Structural Restoration and Scientific Maintenance:**
   - Employing trained traditional stonemasons to monitor dry-stone walls and meticulously restore shifted granite lintels using authentic traditional methods (without modern cement or mortar).
   - Systematically removing invasive tree roots, lichen, and destructive vegetation that crack historical stonework and rock art faces.

5. **Fireguards and Disaster Mitigation:**
   - Constructing wide firebreaks around heritage reserves before the dry season to prevent catastrophic runaway veld fires from blistering prehistoric rock paintings or burning thatched structures.

6. **Combatting Vandalism, Graffiti, and Littering:**
   - Banning spray-painting, stone scratching, and carving names on ancient granite surfaces (e.g. at Domboshava or Matobo).
   - Enforcing zero-littering policies and providing clearly marked waste disposal bins.

7. **Public Heritage Education and School Awareness Campaigns:**
   - Integrating heritage site preservation directly into the school curriculum (Heritage-Based Curriculum 5.0).
   - Organizing guided educational school tours so learners appreciate the architectural and spiritual genius of pre-colonial ancestors.

8. **Sustainable Eco-Tourism Practices:**
   - Reinvesting a portion of tourism revenue directly into local community infrastructure (schools, clinics, boreholes) so residents have an active incentive to protect their local heritage assets.`,
    keywords: ["preserving heritage sites", "ways of preserving heritage sites", "describe ways of preserving heritage sites of zimbabwe", "preserve heritage sites zimbabwe", "heritage preservation methods"]
  },

  // 4. Cultural Values of Motherhood & Fatherhood in Pre-Colonial Era
  {
    id: "hss_motherhood_fatherhood_precolonial",
    topic: "Cultural values of motherhood and fatherhood in the pre-colonial era",
    section: "Heritage and Social Studies",
    question: "explain the cultural values of motherhood and fatherhood in pre- colonial era",
    normalizedQuestions: [
      "explain the cultural values of motherhood and fatherhood in pre colonial era",
      "cultural values of motherhood and fatherhood in pre colonial era",
      "cultural values of motherhood and fatherhood",
      "roles of mothers and fathers in pre colonial era"
    ],
    answer: `### Cultural Values of Motherhood and Fatherhood in the Pre-Colonial Era

In pre-colonial Zimbabwe, motherhood (*Umai / Ubomama*) and fatherhood (*Ubaba / Ubaba*) were revered as sacred social pillars anchored in *Unhu/Ubuntu*:

#### 1. Cultural Values of Motherhood (*Umai*):
- **Giver of Life and Primary Nurturer:** Mothers held spiritual reverence as life-bearers. The sacred *Mombe yeumai / Inkomo yohlanga* paid during marriage honoured the mother's reproductive pain and dedication.
- **Moral Socialiser of Daughters:** Mothers and grandmothers (*VanaMbuya*) taught young girls personal hygiene, culinary arts, pottery, social etiquette, and respect through evening fireside folk tales (*Ngano*).
- **Homestead Keeper and Food Sustainer:** Mothers managed household stores, cultivated staple groundnuts, beans, and millet, and maintained hygienic living conditions.
- **Symbol of Empathy and Compassion:** Mothers provided solace, warmth, and care during family grief and illness.

#### 2. Cultural Values of Fatherhood (*Ubaba*):
- **Defender and Protector:** Fathers defended the family, homestead, and cattle kraal against predatory wildlife and hostile clan invasions with spears, shields, and bows.
- **Primary Provider and Heavy Laborer:** Fathers cleared virgin forests for agricultural fields (*Gombo*), herded cattle, built durable thatched huts, and engaged in blacksmithing.
- **Lineage Head and Spiritual Custodian:** The father served as the family representative at the village court (*Dare*) and communicated with family ancestors (*Vadzimu* / *Amadlozi*).
- **Mentor and Disciplinarian for Sons:** Fathers and uncles (*VanaSekuru*) trained young boys in herding, tracking, hunting, traditional court debate, and courageous responsibility.`,
    keywords: ["motherhood and fatherhood", "pre-colonial era", "cultural values of motherhood and fatherhood", "cultural values of motherhood", "cultural values of fatherhood"]
  },

  // 5. Ethnic Groups of Zimbabwe & Their Cultures
  {
    id: "hss_ethnic_groups_list_and_significance",
    topic: "Different ethnic groups of Zimbabwe and their cultures",
    section: "Heritage and Social Studies",
    question: "list ethnic groups and cultures found in Zimbabwe explain the significance of cultural practices of different ethnic groups",
    normalizedQuestions: [
      "list ethnic groups and cultures found in Zimbabwe explain the significance of cultural practices",
      "ethnic groups in Zimbabwe",
      "list ethnic groups in Zimbabwe",
      "cultural practices of different ethnic groups",
      "significance of cultural practices of different ethnic groups"
    ],
    answer: `### Ethnic Groups of Zimbabwe and Their Cultural Practices

Zimbabwe is a multi-cultural, multi-ethnic society with 16 officially recognized languages:

#### 1. Major Ethnic Groups:
- **Shona (Largest group, comprising sub-groups like Zezuru, Karanga, Manyika, Korekore, Ndau):** Celebrated for *Mhande*, *Mbira* music, dry-stone masonry, and reverence for ancestral guidance (*Mwari / Vadzimu*).
- **Ndebele (Founded by King Mzilikazi):** Renowned for pastoral cattle culture, warrior regiments (*Amabutho*), colourful beadwork, and ceremonial dances (*Isitshikitsha*, *Ingquzu*).
- **Tonga (Zambezi Valley, Binga/Kariba):** Known for traditional smoking water pipes (*Inchelwa*), basket weaving, fishing, and the Nyaminyami Zambezi river spirit.
- **Venda (Beitbridge / Limpopo border):** Celebrated for pottery, stone architecture, and the *Tshikona* royal reed-flute dance.
- **Shangani / Tsonga (Chiredzi / Lowveld):** Famous for traditional circumcision and male initiation rites (*Hoko / Ngoma*), wood carving, and bead craft.
- **Kalanga (Plumtree / Bulilima-Mangwe):** Renowned for historic rainmaking priesthood at Njelele shrine, cattle rearing, and *Ihosanna* rain dances.
- **Sotho, Nambya, Chewa, Doma, Xhosa, and Sena:** Contributing rich textile, agricultural, and culinary diversity.

#### 2. Significance of Cultural Practices:
1. **Preserving Identity and Heritage:** Connects living generations to ancestral origins and distinct clan roots.
2. **Promoting Social Cohesion:** Communal festivals, rainmaking rituals (*Mukwerera*), and work parties (*Nhimbe / Ilima*) foster solidarity.
3. **Moral Guidance (*Unhu/Ubuntu*):** Customs teach honesty, hospitality to strangers, and respect for elders.
4. **Environmental Stewardship:** Sacred cultural taboos preserve indigenous woodlands, wildlife, and natural water springs.`,
    keywords: ["ethnic groups in zimbabwe", "cultures of zimbabwe", "significance of cultural practices", "shona", "ndebele", "tonga", "venda", "kalanga"]
  },

  // 6. Preservation of Cultural Identity
  {
    id: "hss_cultural_identity_define_and_preserve",
    topic: "Preservation of cultural identity",
    section: "Heritage and Social Studies",
    question: "define cultural identity list key elements of cultural identity explain ways of preserving cultural identity",
    normalizedQuestions: [
      "define cultural identity",
      "list key elements of cultural identity",
      "explain ways of preserving cultural identity",
      "cultural identity definition elements ways of preserving",
      "how to preserve cultural identity"
    ],
    answer: `### Cultural Identity: Definition, Elements, and Preservation

#### 1. Definition of Cultural Identity:
**Cultural identity** is the feeling of belonging to a distinct cultural or ethnic group, characterized by shared language, customs, values, traditions, and historical experiences that define who a person is.

#### 2. Key Elements of Cultural Identity:
- **Language and Dialects:** Mother tongues (ChiShona, IsiNdebele, ChiTonga, etc.) expressing worldviews and proverbs.
- **Totems (*Mitupo / Izibongo*):** Clan animal emblems and praise poetry (*Zvidau*) establishing lineage.
- **Norms, Values, and Philosophy:** The code of *Unhu/Ubuntu* (integrity, respect, and communal care).
- **Indigenous Beliefs and Religion:** Reverence for the Creator (*Mwari / uMlimu*) and ancestral communion.
- **Traditional Attire, Food, and Arts:** Sadza, dried vegetables (*Mufushwa*), beadwork, and folk dances.

#### 3. Ways of Preserving Cultural Identity:
1. **Speaking and Teaching Mother Tongues:** Encouraging families and schools to speak indigenous languages with pride.
2. **Documenting and Practicing Oral Traditions:** Transmitting proverbs (*Tsumo*), idioms (*Madimikira*), and folk stories (*Ngano*) to children.
3. **Celebrating Cultural Holidays and Festivals:** Participating in National Culture Month and traditional music and dance showcases (*Jikinya*).
4. **Upholding Totemic Pride and Marriage Customs:** Honouring lobola ceremonies and forbidding totemic incest (*Kucheka ukama*).
5. **Promoting Heritage-Based Education (HBC 5.0):** Integrating indigenous knowledge systems (IKS) into school curricula.`,
    keywords: ["cultural identity", "define cultural identity", "key elements of cultural identity", "preserving cultural identity"]
  },

  // 7. Purpose of the Totem System
  {
    id: "hss_totem_system_purpose_and_importance",
    topic: "Purpose of the totem system",
    section: "Heritage and Social Studies",
    question: "define a totem explain the importance of the totem system",
    normalizedQuestions: [
      "define a totem",
      "explain the importance of the totem system",
      "purpose of the totem system",
      "importance of totem system",
      "what is a totem in zimbabwe",
      "mutupo and isibongo"
    ],
    answer: `### Purpose and Importance of the Totem System (Mitupo / Izibongo)

#### 1. What is a Totem?
A **totem** (*Mutupo* in ChiShona / *Isibongo* in IsiNdebele) is a sacred animal, bird, fish, reptile, or natural element adopted by a family, clan, or lineage as its symbolic emblem and permanent identity badge. Examples include:
- *Shumba* (Lion / *Sibanda*)
- *Nzou* (Elephant / *Ndlovu*)
- *Mhofu* (Eland / *Mpofu*)
- *Dziva / Hove* (Fish / Pool / *Siziba*)
- *Soko* (Monkey / *Ncube*)
- *Gumbo* (Leg / *Moyo*)

#### 2. Importance and Purpose of the Totem System:
1. **Preventing Incest and Inbreeding:** Marriage between individuals sharing the same totem and praise name (*Chidau*) is strictly forbidden (*Chiera*), ensuring genetic health.
2. **Establishing Family Lineage and Clan Roots:** Allows people to trace their genealogy back hundreds of years to common ancestors.
3. **Wildlife and Environmental Conservation:** Clan members are culturally forbidden to kill, harm, or eat their own totem animal. This indigenous conservation mechanism (*Zviera*) protected wild animal populations from extinction.
4. **Fostering Instant Brotherhood and Social Welcoming:** Strangers meeting in distant regions who share a totem treat one another as brothers and sisters, offering hospitality.
5. **Honour and Courteous Appreciation (*Kudetembana*):** Reciting clan praise poetry (*Zvidau*) honours a partner or individual for good deeds, boosting self-worth and morale.`,
    keywords: ["totem system", "define a totem", "importance of totem system", "purpose of totem", "mutupo", "isibongo"]
  },

  // 8. The Early People: Khoisan and Bantu
  {
    id: "hss_early_people_khoisan_bantu",
    topic: "The early people of Zimbabwe. The Khoisan and Bantu",
    section: "Heritage and Social Studies",
    question: "narrate the history of the early people of Zimbabwe describe the way of life of the Khoisan and the Bantu people list the contribution of the Bantu to the national heritage",
    normalizedQuestions: [
      "narrate the history of the early people of Zimbabwe",
      "describe the way of life of the Khoisan and the Bantu people",
      "list the contribution of the Bantu to the national heritage",
      "early people of Zimbabwe Khoisan and Bantu",
      "khoisan and bantu in zimbabwe"
    ],
    answer: `### The Early People of Zimbabwe: The Khoisan and Bantu

#### 1. History of the Early People:
The earliest inhabitants of Zimbabwe were the **Khoisan** (Late Stone Age hunter-gatherers) who lived across Zimbabwe for thousands of years. From roughly the 2nd century AD onwards, migrating **Bantu-speaking people** (Early Iron Age farmers) moved into the region from Central Africa, bringing iron metallurgy, settled agriculture, and cattle rearing.

#### 2. Way of Life of the Khoisan:
- **Economy:** Nomadic hunters and gatherers; hunted game with bows and poisoned arrows; gathered wild roots, berries, and honey.
- **Shelter:** Lived in natural rock shelters and caves (e.g. Matobo, Domboshava).
- **Art:** Outstanding prehistoric rock painters using natural minerals and animal fat.
- **Social Structure:** Small family bands without centralized chiefs; egalitarian sharing of food.

#### 3. Way of Life of the Bantu People:
- **Economy:** Settled agro-pastoralists; farmed sorghum, millet, and beans; raised herds of cattle, sheep, and goats.
- **Technology:** Mastered iron smelting and blacksmithing to manufacture durable hoes, axes, spears, and knives.
- **Shelter:** Built permanent circular mud-and-pole thatched huts (*Dzimba dzedhaka neuswa*) and stone settlements.
- **Political Structure:** Hierarchical kingdoms governed by chiefs (*Madzimambo*) and council elders.

#### 4. Contributions of the Bantu to National Heritage:
1. **Iron Technology:** Revolutionized food production, weapon-making, and tree-clearing.
2. **Monumental Dry-Stone Architecture:** Constructed world-famous stone settlements (Great Zimbabwe, Khami, Ziwa).
3. **Cattle Pastoral Culture:** Introduced cattle as wealth, currency, lobola, and ritual offerings.
4. **Linguistic and Cultural Roots:** Ancestors of contemporary Shona, Ndebele, Venda, Tonga, and Kalanga languages.`,
    keywords: ["khoisan and bantu", "early people of zimbabwe", "way of life of the khoisan and bantu", "bantu contribution to heritage"]
  },

  // 9. Need for Rules and Laws, By-Laws, Law Enforcement
  {
    id: "hss_rules_laws_by_laws_observing",
    topic: "The need for rules and laws",
    section: "Heritage and Social Studies",
    question: "list the rules and laws at home, school and the community explain the importance of rules and laws at home, school and the community define by laws list the by-laws and national laws explain the importance of observing laws identify the consequences of breaking the law state the roles of the individual, community, police and the courts in enforcing the law",
    normalizedQuestions: [
      "list the rules and laws at home school and the community",
      "explain the importance of rules and laws",
      "define by laws",
      "list the by laws and national laws",
      "consequences of breaking the law",
      "roles of individual community police and courts in enforcing the law"
    ],
    answer: `### Rules, Laws, By-Laws, and Law Enforcement

#### 1. Rules and Laws at Home, School, and Community:
- **At Home:** Respecting parents and elders; completing chores before play; observing bedtime; not stealing from siblings.
- **At School:** Wearing correct school uniform; arriving punctually; no fighting, bullying, or vandalism; doing homework diligently.
- **In Community:** No dumping rubbish on streets; respecting neighbours' quiet hours; obeying traffic regulations.

#### 2. Importance of Rules and Laws:
- Maintain peace, order, and social predictability.
- Protect human rights, lives, and private/public property.
- Prevent chaos, crime, and exploitation of vulnerable groups.

#### 3. What are By-Laws?
**By-laws** are local government rules enacted by City Councils, Municipalities, or Rural District Councils (RDCs) to control local matters (e.g., building permits, vendor licensing, noise levels, stray dogs).

#### 4. Examples of By-Laws vs National Laws:
- **By-Laws:** Anti-littering by-laws; operating hours for local bottle stores; keeping cattle off municipal roads; public market trading permits.
- **National Laws:** The Constitution of Zimbabwe; Road Traffic Act; Criminal Law (Codification) Act; Domestic Violence Act; Child Care and Protection Act.

#### 5. Consequences of Breaking the Law:
- Payment of heavy monetary fines.
- Community service sentences (e.g. sweeping clinics).
- Imprisonment in correctional facilities.
- Damaged personal reputation and loss of employment.

#### 6. Roles in Enforcing the Law:
- **Individual:** Obeying laws willingly, reporting criminal acts, and refusing bribes.
- **Community:** Forming Neighbourhood Watch Committees and protecting public facilities.
- **Police (ZRP):** Maintaining public order, investigating crimes, and arresting suspects.
- **Courts (Judiciary):** Impartially interpreting the law, conducting fair trials, and sentencing guilty offenders.`,
    keywords: ["rules and laws", "define by laws", "by-laws and national laws", "importance of rules and laws", "enforcing the law"]
  },

  // 10. The Indigenous Court System
  {
    id: "hss_indigenous_court_system",
    topic: "The indigenous court system",
    section: "Heritage and Social Studies",
    question: "state indigenous courts name the people who preside over different indigenous courts",
    normalizedQuestions: [
      "state indigenous courts",
      "name the people who preside over different indigenous courts",
      "indigenous court system",
      "customary courts in zimbabwe",
      "dare system in zimbabwe"
    ],
    answer: `### The Indigenous Court System of Zimbabwe

Zimbabwe's customary legal system relies on hierarchical traditional courts designed to restore communal harmony, promote reconciliation, and award restorative compensation:

1. **The Family / Homestead Court (*Dare reMusha*):**
   - **Presiding Officer:** Head of the homestead or family elder (Father / *Tete* / *Sekuru*).
   - **Jurisdiction:** Resolves minor domestic disputes, sibling arguments, and petty household squabbles.

2. **The Village Court (*Dare raSabhuku* / *Inkundla kaSobhuku*):**
   - **Presiding Officer:** The Village Head (*Sabhuku* / *Usobukhulu*), assisted by village elders (*Makurukota*).
   - **Jurisdiction:** Hears local village disputes such as boundary encroachment, stray livestock eating crops, petty theft, and unneighbourly quarrels.

3. **The Headman's Court (*Dare raSadunhu* / *Inkundla kaMlisa*):**
   - **Presiding Officer:** The Headman (*Sadunhu* / *Umlisa*).
   - **Jurisdiction:** Intermediate appeals from village courts; handles ward-level disputes over grazing land, water rights, and cultural violations.

4. **The Chief's Court (*Dare raMambo* / *Inkundla yeNkosi*):**
   - **Presiding Officer:** The Traditional Paramount Chief (*Mambo* / *Inkosi*), advised by senior tribal assessors.
   - **Jurisdiction:** Highest customary court; tries serious customary offences including witchcraft allegations (*Uroyi*), desecration of sacred sites (*Zviera*), incest, and appeals from headmen. Decisions can further be appealed to Magistrates' Courts.`,
    keywords: ["indigenous court system", "state indigenous courts", "who presides over indigenous courts", "dare remusha", "dare rasabhuku", "dare ramambo"]
  },

  // 11. National School Pledge
  {
    id: "hss_national_school_pledge",
    topic: "The importance of the National School Pledge",
    section: "Heritage and Social Studies",
    question: "read the national school pledge explain the importance of the national school pledge",
    normalizedQuestions: [
      "read the national school pledge",
      "explain the importance of the national school pledge",
      "national school pledge",
      "importance of national school pledge",
      "what is the national school pledge"
    ],
    answer: `### The National School Pledge

#### 1. Text of the National School Pledge:
*"Almighty God, in whose hands our future lies, I salute the National Flag.*
*United in our diversity by our common desire for freedom, justice and equality.*
*Respecting the brave fathers and mothers who lost lives in the Chimurenga / Umvukela and national liberation struggles.*
*We are proud inheritors of the richness of our natural resources.*
*We are proud inheritors of the richness of our history.*
*I promise, in my life, to respect the rules and the laws of my country.*
*I promise to work hard in my study, to acquire knowledge and skills for the development of our country.*
*I promise to use our resources wisely, to build a prosperous Zimbabwe.*
*I promise to cherish the values of Unhu/Ubuntu in all that I do.*
*So help me God."*

#### 2. Importance of the National School Pledge:
1. **Instilling Patriotism:** Inspires deep love, national pride, and loyalty to Zimbabwe.
2. **Honouring Liberation Heroes:** Keeps alive the sacred memory and sacrifices of freedom fighters who won Zimbabwe's independence.
3. **Upholding *Unhu/Ubuntu*:** Reminds school learners daily of moral integrity, honesty, respect, and communal responsibility.
4. **Promoting Unity in Diversity:** Unites learners of all ethnicities, languages, and religious backgrounds.
5. **Encouraging Hard Work:** Motivates pupils to apply themselves academically and technically to develop the nation.`,
    keywords: ["national school pledge", "read the national school pledge", "importance of the national school pledge", "school pledge zimbabwe"]
  },

  // 12. Pre-Colonial Kingdoms
  {
    id: "hss_precolonial_kingdoms",
    topic: "The pre-colonial kingdoms",
    section: "Heritage and Social Studies",
    question: "identify the pre- colonial states describe the social, political, and economic life in the pre-colonial era",
    normalizedQuestions: [
      "identify the pre colonial states",
      "describe the social political and economic life in the pre colonial era",
      "pre-colonial kingdoms of zimbabwe",
      "great zimbabwe mutapa rozvi torwa ndebele"
    ],
    answer: `### The Pre-Colonial Kingdoms of Zimbabwe

#### 1. Major Pre-Colonial States:
- **Great Zimbabwe State (11th–15th Century):** Founded by Karanga/Shona ancestors; capital at Great Zimbabwe; world-famous dry-stone architecture.
- **Mutapa Kingdom (15th–19th Century):** Founded by Nyatsimba Mutota; controlled northern Zimbabwe and Zambezi trade routes.
- **Torwa State (15th–17th Century):** Centred at Khami Ruins; celebrated for ornate stone terracing.
- **Rozvi State (17th–19th Century):** Founded by Changamire Dombo; renowned for military prowess against the Portuguese.
- **Ndebele Kingdom (19th Century):** Established by King Mzilikazi in 1840 at KoBulawayo after the Mfecane.

#### 2. Social, Political, and Economic Life:
- **Political Life:** Governed by a divine king (*Mambo / Inkosi*), advised by council of elders (*Dare / Inkundla*); hereditary leadership; provincial administrators and chiefs.
- **Economic Life:** Mixed farming (sorghum, millet); extensive cattle pastoralism; gold, copper, and iron mining; ivory hunting; international barter trade with Arabs, Swahili, and Portuguese for beads, cloth, and ceramics.
- **Social Life:** Anchored in *Unhu/Ubuntu* and the totem system; belief in Supreme God (*Mwari / uMlimu*) through ancestral spirit mediums (*Mondoro / Amadlozi*); polygamous families; work bees (*Nhimbe / Ilima*).`,
    keywords: ["pre-colonial states", "pre-colonial kingdoms", "social political economic life pre-colonial", "great zimbabwe", "mutapa", "rozvi"]
  },

  // 13. Colonisation of Zimbabwe & The Liberation Struggles
  {
    id: "hss_colonisation_and_chimurenga",
    topic: "Colonisation of Zimbabwe, The liberation history of Zimbabwe",
    section: "Heritage and Social Studies",
    question: "explain the reasons for the colonisation of Zimbabwe describe how Zimbabwe was colonised outline the causes of the First Chimurenga/Umvukela describe the course of the First Chimurenga/Umvukela describe the role played by spirit mediums in the First Chimurenga/Umvukela identify heroes and heroines of the First Chimurenga/Umvukela outline the causes of the Second Chimurenga/Umvukela describe the course of the Second Chimurenga/Umvukela describe the role played by spirit mediums in the Second Chimurenga/Umvukela identify heroes and heroines of the second chimurenga",
    normalizedQuestions: [
      "explain the reasons for the colonisation of Zimbabwe",
      "describe how Zimbabwe was colonised",
      "causes of the First Chimurenga",
      "course of the First Chimurenga",
      "spirit mediums in the First Chimurenga",
      "heroes and heroines of the First Chimurenga",
      "causes of the Second Chimurenga",
      "course of the Second Chimurenga",
      "heroes and heroines of the second chimurenga"
    ],
    answer: `### Colonisation and the Liberation History of Zimbabwe

#### 1. Reasons for Colonisation:
- Imperialist search for raw materials (gold, coal, copper) and the illusion of a "Second Rand".
- Fertile agricultural land and abundance of indigenous cattle.
- Cheap labour and British imperial expansion led by Cecil John Rhodes (BSAC).

#### 2. How Zimbabwe Was Colonised:
- **1888:** The fraudulent **Rudd Concession** deceitfully extracted from King Lobengula.
- **1889:** Royal Charter granted to Rhodes' British South Africa Company (BSAC).
- **1890:** The armed **Pioneer Column** invaded Mashonaland and hoisted the Union Jack at Fort Salisbury on 12 September 1890.
- **1893:** The Anglo-Ndebele War resulted in the burning of Bulawayo and the death/disappearance of King Lobengula.

#### 3. The First Chimurenga / Umvukela (1896–1897):
- **Causes:** Loss of land; cattle confiscations; imposition of the Hut Tax (1894); forced labour (*Chibaro*); abuse by native police; natural calamities (rinderpest, drought).
- **Course:** Ndebele rose in March 1896; Shona joined in June 1896; fierce guerrilla warfare ambushing settlers.
- **Role of Spirit Mediums:** Mediums **Mbuya Nehanda (Charwe)**, **Sekuru Kaguvi (Gumboreshumba)**, and **Mkwati** inspired, unified, and coordinated warriors.
- **Heroes & Heroines:** Mbuya Nehanda, Sekuru Kaguvi, Chief Chingaira Makoni, Chief Mapondera, General Mtungwena. Nehanda was hanged in 1898, declaring: *"My bones shall rise again!"*

#### 4. The Second Chimurenga / National Liberation Struggle (1966–1979):
- **Causes:** Land Apportionment Act (1930); racial segregation; denial of voting rights; Ian Smith's Unilateral Declaration of Independence (UDI) in 1965.
- **Course:** Began with the **Battle of Chinhoyi (28 April 1966)**; intensified in 1972 in north-east; prosecuted by military wings **ZANLA** (ZANU) and **ZIPRA** (ZAPU).
- **Role of Spirit Mediums:** Provided spiritual sanction, moral guidance, and wartime intelligence (e.g., Sekuru Chipfeni).
- **Heroes & Heroines:** Robert Gabriel Mugabe, Dr. Joshua Mqabuko Nkomo, General Josiah Magama Tongogara, Jason Ziyaphapha Moyo, Herbert Chitepo, Leopold Takawira, Nikita Mangena, Sally Mugabe, Simon Muzenda. Concluded with the **Lancaster House Agreement (1979)** and Independence on **18 April 1980**.`,
    keywords: ["colonisation of zimbabwe", "first chimurenga", "second chimurenga", "mbuya nehanda", "kaguvi", "chinhoyi battle", "zanla", "zipra"]
  },

  // 14. Food Preservation: Indigenous & Contemporary
  {
    id: "hss_food_preservation_indigenous_contemporary",
    topic: "Indigenous and contemporary ways of preserving food",
    section: "Heritage and Social Studies",
    question: "state the indigenous and contemporary ways of preserving food explain the importance of preserving food",
    normalizedQuestions: [
      "state the indigenous and contemporary ways of preserving food",
      "indigenous and contemporary ways of preserving food",
      "ways of preserving food",
      "importance of preserving food",
      "how food was preserved in indigenous zimbabwe"
    ],
    answer: `### Indigenous and Contemporary Ways of Preserving Food

#### 1. Indigenous Methods of Preserving Food:
- **Sun Drying (*Kuomesa / Mufushwa*):** Spreading leafy vegetables (*Covo*, pumpkin leaves *muboora*, cowpea leaves *munyemba*) and sliced meat (*Biltong / Chimukuyu*) in direct sunlight.
- **Smoking (*Kusvuta / Kuutsa*):** Hanging meat and river fish over continuous hearth smoke to dehydrate and coat them with antimicrobial smoke compounds.
- **Salting (*Kukanya Munyu*):** Rubbing large amounts of rock salt on meat or fish to draw out moisture and inhibit bacteria.
- **Ash and Herb Treatment in Granaries (*Dura / Tsapi*):** Mixing harvested maize, sorghum, and millet with wood ash (*Dota*) and pungent herbs to repel grain weevils.
- **Underground Pit Storage (*Pfimbi*):** Storing sweet potatoes (*Mbatata*) and cassava in cool underground pits layered with dry soil.
- **Fermentation (*Kuvirisa*):** Naturally fermenting milk (*Mukaka wakakora*) or sorghum brew (*Maheu*).

#### 2. Contemporary Methods of Preserving Food:
- **Refrigeration and Freezing:** Slowing or arresting microbial growth using domestic fridges and deep freezers.
- **Canning and Bottling:** Sealing cooked foods (baked beans, tinned fish, jams) in airtight cans at high heat.
- **Pasteurisation:** Heating milk and juices to specific temperatures to kill pathogens without altering nutritional quality.
- **Chemical Preservatives:** Adding sodium benzoate, vinegar (pickling), or sulfur dioxide.

#### 3. Importance of Food Preservation:
1. Prevents food spoilage and minimizes post-harvest food waste.
2. Ensures food security during dry winter seasons, droughts, and famines.
3. Preserves seasonal abundance for year-round balanced nutrition.
4. Extends shelf-life for marketing and domestic distribution.`,
    keywords: ["preserving food", "indigenous food preservation", "contemporary food preservation", "mufushwa", "chimukuyu", "importance of food preservation"]
  },

  // 15. Courtship and Marriage Practices
  {
    id: "hss_courtship_and_marriage_practices",
    topic: "Courtship practices of different cultural groups, Indigenous marriage practices",
    section: "Heritage and Social Studies",
    question: "list indigenous courtship practices explain the role of some family members in courtship describe indigenous marriage practices",
    normalizedQuestions: [
      "list indigenous courtship practices",
      "explain the role of some family members in courtship",
      "describe indigenous marriage practices",
      "indigenous marriage practices in zimbabwe",
      "lobola kuroora courtship"
    ],
    answer: `### Indigenous Courtship and Marriage Practices in Zimbabwe

#### 1. Indigenous Courtship Practices:
- **Kupfimbana / Kunyenga:** Young men proposing love to young women at communal places (well/borehole, river, fire wood gathering).
- **Exchange of Love Tokens (*Nduma*):** Giving beads, handkerchiefs, or personal ornaments to symbolize acceptance and fidelity.
- **Secret Meetings (*Pachivande*):** Courtship was discreet and guarded by traditional modesty.

#### 2. Roles of Family Members in Courtship:
- **Paternal Aunt (*Tete / Ubabakazi*):** Primary confidante and counsellor for young women; inspected tokens of love and verified family background.
- **Maternal Uncle (*Sekuru / Umalume*):** Guided young men on marriage readiness, integrity, and building a homestead.
- **Groomsman / Go-Between (*Munyai / Umkhongi*):** Official family ambassador carrying marriage proposals and negotiating lobola.

#### 3. Indigenous Marriage Practices:
- **Kuroora / Lobola (Formal Marriage):** Payment of bride price (cattle, groceries, cash) to appreciate the bride's parents and seal legal inter-family kinship.
- **Kukumbira (Marriage by Request):** Groom's family sending a *Munyai* with formal proposals and bride price gifts.
- **Musengabere (Elopement/Capture):** Ancient practice where an agreed bride was carried off, followed by immediate token payments (*Mutsvautsau*).
- **Kutizisa / Kutizira (Elopement):** Bride voluntarily moving to the groom's homestead, followed immediately by notification to parents (*Tsvakirai kuno*).
- **Kugarira (Service Marriage):** A poor groom offering farm labour to in-laws in exchange for a wife.
- **Kuganha:** A woman taking initiative to propose marriage to a reputable family.`,
    keywords: ["courtship practices", "indigenous marriage practices", "lobola", "munyai", "tete", "sekuru", "kuroora"]
  },

  // 16. Age of Consent and Heirship
  {
    id: "hss_age_of_consent_and_heirship",
    topic: "Age of consent to sex and marriage, Heirship in the family",
    section: "Heritage and Social Studies",
    question: "explain the concept of consent state the importance of adhering to the age of consent to sex and marriage define heirship explain heirship in the family describe heirship processes in the family justify equality between males and females in heirship",
    normalizedQuestions: [
      "explain the concept of consent",
      "state the importance of adhering to the age of consent to sex and marriage",
      "define heirship",
      "explain heirship in the family",
      "describe heirship processes in the family",
      "justify equality between males and females in heirship",
      "age of consent to sex and marriage",
      "gender equality in heirship"
    ],
    answer: `### Age of Consent to Sex & Marriage and Gender Equality in Heirship

#### 1. Concept of Consent and Legal Age of Consent:
- **Consent** means voluntary, conscious, and unforced agreement by an individual possessing legal maturity to engage in an act.
- Under the **Zimbabwe Constitution and Marriage Act of 2022**, the legal age of marriage and consent to sexual activity is strictly **18 years**. Child marriages (under 18) are criminalized.

#### 2. Importance of Adhering to the Age of Consent:
1. **Child Protection:** Shields young girls and boys from statutory rape, sexual exploitation, and early teenage pregnancies.
2. **Promoting Education:** Ensures children complete primary and secondary education without premature domestic burdens.
3. **Health Safeguards:** Prevents obstetric fistula, high maternal mortality, and vulnerability to sexually transmitted infections (STIs).

#### 3. Definition and Processes of Heirship:
- **Heirship** is the legal and cultural transmission of rights, titles, property, and obligations from a deceased person to a designated successor (*Mudyi wenhaka / Indlalifa*).
- **Process:** Overseen by extended family elders at the memorial service (*Kurova Guva / Umbuyiso*), or formally through the Master of the High Court / Magistrates' Courts under a written Will or the Administration of Estates Act.

#### 4. Justifying Equality Between Males and Females in Heirship:
1. **Constitutional Human Rights:** Section 56 of Zimbabwe's Constitution guarantees total equality before the law regardless of gender.
2. **Economic Justice:** Daughters and surviving widows contribute equally to family wealth and deserve full legal ownership of family homes and farmland.
3. **Child Welfare:** Eliminates archaic dispossession and eviction of widows and female orphans by greedy relatives.`,
    keywords: ["age of consent", "heirship", "gender equality in heirship", "consent definition", "marriage act 2022"]
  },

  // 17. National Strategic Reserves & Indigenous Knowledge Systems
  {
    id: "hss_strategic_reserves_and_iks",
    topic: "National strategic reserves, Indigenous knowledge systems",
    section: "Heritage and Social Studies",
    question: "identify national strategic reserves explain the role of national strategic reserve institutions in Zimbabwe explain the Indigenous Knowledge Systems (IKS) list indigenous knowledge systems",
    normalizedQuestions: [
      "identify national strategic reserves",
      "role of national strategic reserve institutions in Zimbabwe",
      "explain indigenous knowledge systems",
      "list indigenous knowledge systems",
      "national strategic reserves zimbabwe",
      "IKS in zimbabwe"
    ],
    answer: `### National Strategic Reserves and Indigenous Knowledge Systems (IKS)

#### 1. National Strategic Reserves in Zimbabwe:
- **Strategic Grain Reserve (SGR):** Massive stocks of maize, traditional grains (sorghum, millet), and wheat stored at the **Grain Marketing Board (GMB)** silos.
- **National Strategic Fuel Reserves:** Bulk diesel and petrol reserves maintained by NOIC (National Oil Infrastructure Company of Zimbabwe).
- **National Strategic Monetary and Gold Reserves:** Foreign currency reserves and physical gold bullions stored at the **Reserve Bank of Zimbabwe (RBZ)** backing the Zimbabwe Gold (ZiG) currency.
- **National Water Reserves:** Bulk water banked in major national dams (e.g., Tugwi-Mukosi, Lake Kariba, Mutirikwi, Manyame) managed by ZINWA.

#### 2. Role of Strategic Reserve Institutions:
- Guarantee national food security during droughts and climate emergencies.
- Stabilize market commodity prices and protect the public from speculative shortages.
- Provide emergency social assistance during national disasters.

#### 3. Indigenous Knowledge Systems (IKS):
**Indigenous Knowledge Systems (IKS)** are local, traditional understandings, skills, and philosophies developed by indigenous communities over generations through direct experience and cultural transmission.

#### 4. Examples of Indigenous Knowledge Systems in Zimbabwe:
- **Indigenous Weather Forecasting:** Predicting rainfall seasons by observing the abundance of wild fruits (*Muchakata / Muhacha*), behavior of birds (*Kukorora kwematendera*), and wind patterns.
- **Ethnomedicine and Herbal Healing:** Using plant roots (*Murumanyama*), leaves, and barks to treat common ailments.
- **Sustainable Conservation (*Zviera*):** Cultural taboos forbidding cutting fruit trees or defecating near water springs.
- **Soil and Crop Management:** Intercropping and indigenous organic manure application (*Pfumvudza* concept).`,
    keywords: ["national strategic reserves", "indigenous knowledge systems", "IKS", "GMB", "strategic grain reserve", "traditional weather forecasting"]
  },

  // 18. Conservation of Natural Resources
  {
    id: "hss_conservation_natural_resources",
    topic: "Conservation of natural resources",
    section: "Heritage and Social Studies",
    question: "state natural resources explain sustainable methods of conserving the natural resources",
    normalizedQuestions: [
      "state natural resources",
      "explain sustainable methods of conserving the natural resources",
      "conserving natural resources",
      "sustainable methods of conserving natural resources",
      "natural resources in zimbabwe"
    ],
    answer: `### Conservation of Natural Resources in Zimbabwe

#### 1. Natural Resources in Zimbabwe:
- **Land and Soil:** Agricultural soils for farming and forestry.
- **Water Bodies:** Rivers, lakes, underground aquifers, and wetlands.
- **Flora and Forests:** Indigenous hardwood trees (Teak, Mahogany, Mopane, Baobab).
- **Wildlife:** The "Big Five" (Elephant, Rhino, Lion, Leopard, Buffalo) and diverse birdlife.
- **Minerals:** Gold, platinum, lithium, chrome, nickel, diamonds, and coal.

#### 2. Sustainable Methods of Conserving Natural Resources:
1. **Reforestation and Afforestation:** Planting trees during National Tree Planting Day to prevent soil erosion and desertification.
2. **Conservation Agriculture (*Pfumvudza / Intwasa*):** Minimum soil disturbance, mulching with crop residues to conserve soil moisture, and crop rotation.
3. **Protecting Wetlands and Water Basins:** Banning construction and agricultural cultivation on delicate wetlands (*Matoro*).
4. **Anti-Poaching and Wildlife Sanctuaries:** Patrolling national parks (ZimParks) to combat illegal poaching and establishing community conservancies (CAMPFIRE).
5. **Combating Veld Fires:** Constructing standard 9-metre fireguards around farms, forests, and grazing lands.
6. **Contour Ridging and Terracing:** Digging contour ridges across sloping fields to stop rainwater running off with topsoil.`,
    keywords: ["conservation of natural resources", "natural resources", "sustainable conservation methods", "pfumvudza", "wetlands", "anti-poaching"]
  },

  // 19. Tourism in Zimbabwe & SADC
  {
    id: "hss_tourism_destinations_and_preservation",
    topic: "Tourism in Zimbabwe, Tourism in SADC countries",
    section: "Heritage and Social Studies",
    question: "identify major tourist destinations in Zimbabwe explain the importance of tourism in Zimbabwe describe indigenous ways of preserving tourist destinations identify tourist destinations in the SADC countries explain the importance of tourism in SADC countries",
    normalizedQuestions: [
      "identify major tourist destinations in Zimbabwe",
      "explain the importance of tourism in Zimbabwe",
      "describe indigenous ways of preserving tourist destinations",
      "tourist destinations in the SADC countries",
      "importance of tourism in SADC countries"
    ],
    answer: `### Tourism in Zimbabwe and SADC Countries

#### 1. Major Tourist Destinations in Zimbabwe:
- **Victoria Falls (*Mosi-oa-Tunya*):** World Wonder, adventure sports, and rainforest.
- **Hwange National Park:** Largest wildlife sanctuary famous for massive elephant herds.
- **Great Zimbabwe National Monument:** Ancient stone architectural ruins.
- **Eastern Highlands (Nyanga, Bvumba, Chimanimani):** Mountain peaks, Mount Nyangani, Mutarazi Falls skywalk.
- **Lake Kariba:** Houseboat tourism, tiger fishing, and hydro-electric tours.
- **Matobo National Park:** Unique granite rock formations and rhino sanctuary.

#### 2. Importance of Tourism to Zimbabwe:
- Generates vital foreign currency.
- Creates direct and indirect employment (tour guides, hotel staff, artisans, drivers).
- Stimulates infrastructure development (airports, highways, telecommunications).
- Promotes international cultural exchange and national reputation.

#### 3. Indigenous Ways of Preserving Tourist Destinations:
- Upholding sacred taboos (*Zviera*) that prohibit cutting trees, littering, or swimming in sacred pools.
- Community elders and traditional leaders acting as custodians of natural sites.
- Community benefit sharing (CAMPFIRE) ensuring villagers view wildlife as community assets rather than pests.

#### 4. Major Tourist Destinations in SADC Countries:
- **South Africa:** Kruger National Park, Table Mountain, Robben Island.
- **Botswana:** Okavango Delta, Chobe National Park.
- **Zambia:** South Luangwa National Park, Victoria Falls (Livingstone).
- **Mozambique:** Bazaruto Archipelago, pristine coastal beaches.
- **Namibia:** Sossusvlei sand dunes, Etosha National Park.
- **Tanzania:** Mount Kilimanjaro, Serengeti National Park.

#### 5. Importance of Tourism in SADC:
- Strengthens regional economic integration and cross-border eco-tourism (Transfrontier Conservation Areas - TFCAs).
- Enhances environmental biodiversity preservation across borders.`,
    keywords: ["tourism in zimbabwe", "importance of tourism", "preserving tourist destinations", "tourist destinations in SADC", "victoria falls", "hwange"]
  },

  // 20. Transport and Communication
  {
    id: "hss_transport_and_communication_modes_road_etiquette",
    topic: "Modes of transport and communication, Road etiquette, Road signs",
    section: "Heritage and Social Studies",
    question: "state different modes of transport identify different modes of communication define road etiquette outline the responsibility of road users identify various road signs, signals and markings explain the importance of observing road signs, signals and markings",
    normalizedQuestions: [
      "state different modes of transport",
      "identify different modes of communication",
      "define road etiquette",
      "outline the responsibility of road users",
      "identify various road signs signals and markings",
      "importance of observing road signs signals and markings"
    ],
    answer: `### Transport, Communication, and Road Etiquette

#### 1. Modes of Transport:
- **Road Transport:** Buses, commuter omnibuses (*Kombis*), haulage trucks, cars, bicycles, animal-drawn carts.
- **Rail Transport:** Passenger trains and freight cargo trains operated by the National Railways of Zimbabwe (NRZ).
- **Air Transport:** Aeroplanes and cargo carriers connecting national and international airports (R.G. Mugabe International, J.M. Nkomo, Victoria Falls).
- **Water Transport:** Boats, ferries, and ships across Lake Kariba and the Zambezi River.
- **Pipeline Transport:** Feruka pipeline conveying refined petroleum from Beira (Mozambique) to Harare.

#### 2. Modes of Communication:
- **Modern:** Cellular smartphones, internet/email, radio broadcasts, television, newspapers, satellite communications.
- **Indigenous:** Drumming (*Ngoma*), horn blowing (*Mhondoro* / *Hwamanda*), smoke signals, messengers on foot.

#### 3. What is Road Etiquette?
**Road etiquette** is the set of polite, legal, and considerate behaviours practiced by road users (drivers, pedestrians, cyclists) to ensure safety and prevent accidents.

#### 4. Responsibilities of Road Users:
- **Drivers:** Respecting speed limits; not drinking and driving; stopping at pedestrian crossings; giving right of way; wearing seatbelts.
- **Pedestrians:** Using designated zebra crossings; walking facing oncoming traffic where there are no pavements; wearing reflective clothing at night.
- **Cyclists:** Wearing protective helmets; maintaining functional brakes and reflectors; riding in single file.

#### 5. Types of Road Signs, Signals, and Markings:
- **Regulatory Signs (Circular, Red/Blue):** Mandatory instructions (Stop sign, Yield sign, No Entry, Speed limits).
- **Warning Signs (Triangular, Red border):** Alerting to dangers ahead (Pedestrian crossing, Sharp curve, Slippery road).
- **Informative Signs (Rectangular, Green/Blue):** Guiding destinations, fuel stations, and distances.
- **Road Markings:** White centerlines, yellow no-overtaking lines, zebra crossings.
- **Traffic Signals (Robots):** Red (Stop), Amber (Prepare to stop), Green (Proceed when clear).

#### 6. Importance of Observing Road Signs:
- Prevents fatal traffic collisions and preserves human lives.
- Ensures smooth flow of traffic and prevents road congestion.`,
    keywords: ["modes of transport", "modes of communication", "road etiquette", "road signs", "traffic rules"]
  },

  // 21. Shelter: Siting, Solutions, Disaster Prone Areas
  {
    id: "hss_shelter_siting_solutions_disasters",
    topic: "Solutions to shortage of shelter, Factors that influence shelter siting and design, Indigenous types of shelter",
    section: "Heritage and Social Studies",
    question: "suggest possible solutions to shortage of shelter list factors that influence the site and design of shelter explain factors that influence the site and design of shelter identify different ways of acquiring accommodation identify indigenous types of shelter describe indigenous types of shelter identify building materials suitable for constructing buildings in disaster prone areas",
    normalizedQuestions: [
      "suggest possible solutions to shortage of shelter",
      "factors that influence the site and design of shelter",
      "ways of acquiring accommodation",
      "indigenous types of shelter",
      "building materials suitable for constructing buildings in disaster prone areas"
    ],
    answer: `### Shelter: Siting, Solutions, and Disaster Resilience

#### 1. Solutions to Shortage of Shelter:
1. **Low-Cost Government Housing Schemes:** National housing development funds constructing serviced high-density residential flats.
2. **Housing Cooperatives:** Citizens pooling monthly savings together to purchase land and construct homes collectively.
3. **Public-Private Partnerships (PPPs):** Partnering with private banks and building societies to offer accessible, long-term mortgages.
4. **Upgrading Informal Settlements:** Providing basic amenities (piped water, sewer reticulation, electricity) to regularized residential areas.

#### 2. Factors Influencing Siting and Design of Shelter:
- **Topography and Drainage:** Building on elevated, well-drained terrain to avoid floodplains.
- **Proximity to Clean Water and Roads:** Ensuring easy access to boreholes and transport networks.
- **Soil Stability:** Avoiding unstable wetlands (*Matoro*) or loose sandy soils prone to subsidence.
- **Climatic Factors:** Orienting windows away from harsh prevailing winds and hot afternoon sun.

#### 3. Ways of Acquiring Accommodation:
- Renting a flat or cottage.
- Buying a ready-built house outright or through a mortgage.
- Applying for residential stands from City Councils or RDCs and building progressively.
- Customary land allocation from traditional village heads (*Sabhuku*).
- Inheriting a deceased parent's or family home.

#### 4. Indigenous Types of Shelter:
- **Dzimba dzedhaka neuswa (Pole-and-Daga Huts):** Circular huts built with mopane or gum poles, plastered with smooth clay, and thatched with indigenous grass (*Uswa hwemadanha*).
- **Dry-Stone Shelters:** Unmortared granite wall enclosures and palace structures (e.g. Great Zimbabwe, Khami).
- **Grain Stores (*Dura / Tsapi*):** Elevated huts raised on flat rock foundations (*Matombo*) to guard grain against moisture and termites.

#### 5. Building Materials for Disaster-Prone Areas:
- **In Flood-Prone Areas:** Reinforced concrete stilts, water-resistant burnt bricks, and raised foundations.
- **In Cyclone/Wind-Prone Areas:** Heavy metal roof trusses anchored with cyclone straps, deep concrete ring beams, and shatterproof glass.`,
    keywords: ["shortage of shelter", "siting and design of shelter", "indigenous types of shelter", "shelter in disaster prone areas", "ways of acquiring accommodation"]
  },

  // 22. Environmental Conservation, Poverty, Pollution, Desertification
  {
    id: "hss_environment_poverty_pollution_desertification",
    topic: "Environmental conservation, Poverty, Pollution, Desertification",
    section: "Heritage and Social Studies",
    question: "explain what environmental conservation is state ways of conserving the environment list causes of poverty in the community identify effects of poverty in the community explain ways of reducing poverty in the community identify types of pollution state causes of pollution explain the effects of pollution on the environment define desertification examine causes and effects of desertification suggest mitigatory factors to the problem of desertification",
    normalizedQuestions: [
      "explain what environmental conservation is",
      "ways of conserving the environment",
      "causes effects and reducing poverty",
      "types causes and effects of pollution",
      "define desertification",
      "causes and effects of desertification",
      "mitigating desertification"
    ],
    answer: `### Environmental Conservation, Poverty, Pollution, and Desertification

#### 1. Environmental Conservation:
- **Definition:** The wise, sustainable protection and management of natural resources (land, water, forests, wildlife) to prevent degradation and ensure their availability for future generations.
- **Ways to Conserve:** Planting indigenous trees; practising *Pfumvudza* conservation farming; digging contour ridges; recycling waste; constructing fireguards.

#### 2. Poverty in the Community:
- **Causes:** Unemployment; severe droughts; low educational attainment; illness (HIV/AIDS); lack of capital and land.
- **Effects:** Malnutrition; high school dropout rates; homelessness; crime and substance abuse; child marriages.
- **Ways of Reducing Poverty:** Promoting vocational skills; providing soft loans for small businesses; agricultural input schemes; government social safety nets (BEAM, food relief).

#### 3. Pollution (Types, Causes, Effects):
- **Air Pollution:** Caused by factory emissions, vehicle exhaust fumes, burning veld fires; causes asthma, respiratory diseases, and acid rain.
- **Water Pollution:** Caused by industrial effluent, raw sewage discharge, cyanide from illegal gold panning; causes cholera, dysentery, and death of aquatic life.
- **Land/Soil Pollution:** Caused by dumping non-biodegradable plastics, chemical pesticides, and mining debris; causes infertile soils and poisoned ground water.
- **Noise Pollution:** Caused by loud music, industrial machinery, and traffic; causes hearing impairment, sleep disturbance, and high stress.

#### 4. Desertification:
- **Definition:** The progressive degradation of fertile dryland into barren, desert-like conditions due to climatic variations and unsustainable human activities.
- **Causes:** Massive deforestation (cutting trees for firewood/tobacco curing); overgrazing by livestock; poor farming methods; prolonged global warming droughts.
- **Effects:** Complete loss of fertile topsoil; dried-up rivers and water tables; severe famine; loss of livestock.
- **Mitigation:** Comprehensive afforestation; practicing rotational grazing; using renewable solar and biogas energy instead of firewood.`,
    keywords: ["environmental conservation", "poverty in the community", "types of pollution", "desertification", "causes and effects of desertification"]
  },

  // 23. Puberty, Peer Influence, Unhu/Ubuntu, Norms and Values
  {
    id: "hss_puberty_peer_influence_unhu_norms",
    topic: "Puberty, Peer influence, Ubuntu/Unhu/Vumunhu, Norms and values",
    section: "Heritage and Social Studies",
    question: "describe different types of changes that occur in boys and girls at puberty describe changes associated with menstruation state ways of managing changes associated with menstruation explain peer influence state the advantages and disadvantages of peer influence outline principles of Ubuntu/Unhu/Vumunhu define norms and values explain acceptable behaviour at the workplace",
    normalizedQuestions: [
      "changes that occur in boys and girls at puberty",
      "changes associated with menstruation",
      "managing changes associated with menstruation",
      "explain peer influence",
      "principles of Ubuntu Unhu Vumunhu",
      "define norms and values",
      "acceptable behaviour at the workplace"
    ],
    answer: `### Puberty, Peer Influence, Unhu/Ubuntu, and Norms & Values

#### 1. Physical and Emotional Changes at Puberty:
- **In Boys:** Voice breaks and deepens; growth of pubic, facial, and underarm hair; enlargement of testes and penis; shoulders broaden; nocturnal emissions (wet dreams).
- **In Girls:** Development of breasts; widening of hips; growth of pubic and underarm hair; onset of menstruation (*Kuenda kumwedzi*).
- **Emotional Changes in Both:** Mood swings, heightened self-consciousness, and romantic attractions.

#### 2. Managing Menstruation:
- Using clean, absorbent sanitary pads or reusable pads.
- Changing pads every 4 to 6 hours and bathing daily.
- Disposing of used pads hygienically (wrapping and incinerating or binning; never flushing down toilets).

#### 3. Peer Influence:
- **Definition:** The direct or indirect pressure exerted by friends or peer groups to adopt specific attitudes or behaviours.
- **Positive Influence:** Encouragement to study hard, participate in sports, join church youths, and obey elders.
- **Negative Influence:** Pressure to experiment with alcohol, smoking, vaping, illicit drugs, truancy, and sexual promiscuity.
- **How to Resist:** Being assertive; saying an unambiguous "NO"; choosing positive friends; seeking adult guidance.

#### 4. Principles of *Unhu / Ubuntu / Vumunhu*:
*"A person is a person through other persons"* (*Munhu munhu nevanhu*):
1. **Respect and Courtesy:** Greeting elders reverently and speaking politely.
2. **Hospitality and Generosity:** Welcoming visitors and sharing food.
3. **Compassion and Empathy:** Comforting the bereaved and helping orphans and the disabled.
4. **Honesty and Integrity:** Refusing to steal, lie, or cheat.
5. **Communal Solidarity:** Working together for common welfare (*Nhimbe / Ilima*).

#### 5. Norms, Values, and Workplace Behaviour:
- **Norms:** Unwritten societal rules and standards governing acceptable behavior.
- **Values:** Deeply held beliefs about what is good, right, and desirable (e.g. honesty, hard work).
- **Acceptable Workplace Behaviour:** Punctuality, integrity, teamwork, respecting confidentiality, dressing professionally, and zero tolerance for bribery.`,
    keywords: ["puberty changes", "menstruation management", "peer influence", "unhu ubuntu vumunhu", "norms and values", "workplace behaviour"]
  },

  // 24. Health: Drug Abuse, STIs, HIV/AIDS, First Aid
  {
    id: "hss_health_drugs_stis_hiv_first_aid",
    topic: "Drug and substance abuse, Sexually Transmitted Infections (STIs), HIV and AIDS, First Aid",
    section: "Heritage and Social Studies",
    question: "state risks associated with drug and substance abuse identify ways of avoiding drug and substance abuse explain common symptoms of sexually transmitted infections (STIs) identify ways of preventing STIs define HIV and AIDS explain the ways in which HIV can be transmitted describe some of the ways to prevent and reduce the risk of HIV transmission apply First Aid skills to different situations",
    normalizedQuestions: [
      "risks associated with drug and substance abuse",
      "ways of avoiding drug and substance abuse",
      "symptoms of sexually transmitted infections STIs",
      "preventing STIs",
      "define HIV and AIDS",
      "transmission and prevention of HIV",
      "first aid skills"
    ],
    answer: `### Health: Substance Abuse, STIs, HIV/AIDS, and First Aid

#### 1. Drug and Substance Abuse:
- **Commonly Abused Substances:** Cannabis (*Mbanje*), Crystal Meth (*Mutoriro/Guka*), BronCleer cough syrup, illegal cane spirits (*Musombodhiya*), tobacco, alcohol.
- **Risks:** Brain and organ damage; psychosis and mental illness; school dropout; criminal behavior; fatal overdose.
- **Prevention:** Saying NO assertively; engaging in constructive sports and arts; avoiding drug-using peer groups; reporting dealers.

#### 2. Sexually Transmitted Infections (STIs):
- **Examples:** Syphilis, Gonorrhoea, Chancroid, Chlamydia, Genital Herpes.
- **Common Symptoms:** Painful urination; abnormal genital discharge (pus); sores, blisters, or warts on genitals; lower abdominal pain.
- **Prevention:** Complete sexual abstinence before marriage; mutual faithfulness in marriage; correct and consistent condom use; avoiding sharing sharp blades.

#### 3. HIV and AIDS:
- **Definition:** **HIV** (Human Immunodeficiency Virus) attacks the body's white blood cells (CD4 cells). **AIDS** (Acquired Immune Deficiency Syndrome) is the advanced clinical stage of severe immune deficiency.
- **Transmission:** Unprotected sexual intercourse with an infected partner; mother-to-child transmission during pregnancy, delivery, or breastfeeding; contaminated blood transfusions; sharing unsterilized needles and razor blades.
- **Prevention:** Total abstinence for youth; faithfulness to one uninfected partner; Prevention of Mother-to-Child Transmission (PMTCT) services; screening all donated blood; using sterilized medical equipment.
- **Positive Living:** Adhering strictly to Antiretroviral Therapy (ART); eating a nutrient-rich balanced diet; exercising; seeking prompt medical care for opportunistic infections.

#### 4. First Aid Essentials:
- **Definition:** The immediate, emergency assistance given to an injured or suddenly ill person before professional medical help arrives.
- **Bleeding:** Apply firm direct pressure over the wound using a clean sterile bandage and elevate the injured limb.
- **Burns:** Immediately immerse or flush the burn with clean, cool running water for at least 10–20 minutes. Never apply butter, flour, or oil.
- **Choking:** Administer 5 back blows between the shoulder blades followed by abdominal thrusts (Heimlich manoeuvre).
- **Nosebleeds:** Sit upright, lean slightly forward, and pinch the soft part of the nose for 10 minutes; breathe through the mouth.`,
    keywords: ["drug and substance abuse", "STIs symptoms and prevention", "HIV and AIDS definition", "HIV transmission and prevention", "first aid"]
  },

  // 25. Study Skills and Financial Literacy
  {
    id: "hss_study_skills_and_financial_literacy",
    topic: "Study skills, Financial literacy, Career pathways",
    section: "Heritage and Social Studies",
    question: "state ways of managing homework identify ways of preparing for examinations define financial literacy explain the importance of financial literacy state ways of earning money list ways of saving money define career pathways",
    normalizedQuestions: [
      "ways of managing homework",
      "ways of preparing for examinations",
      "define financial literacy",
      "importance of financial literacy",
      "ways of earning money",
      "ways of saving money",
      "career pathways"
    ],
    answer: `### Study Skills, Financial Literacy, and Career Pathways

#### 1. Effective Study Skills and Exam Preparation:
- **Managing Homework:** Setting aside a quiet, well-lit study corner; tackling difficult subjects first; adhering to a daily study timetable; completing assignments on time.
- **Preparing for Examinations:** Reviewing past ZIMSEC exam papers; making summarized revision notes; joining study groups; getting adequate sleep and eating nutritious meals before exams.

#### 2. Financial Literacy:
- **Definition:** The possession of knowledge, skills, and confidence to make responsible, informed decisions with money, including earning, budgeting, saving, and investing.
- **Importance:** Helps individuals avoid debt; ensures funds are available for emergencies; supports family wealth building; prevents financial fraud.

#### 3. Earning and Saving Money:
- **Ways of Earning Money:** Working formal jobs; farming and selling produce (*Pfumvudza*); making and selling arts and crafts; providing community services (baking, tailoring, digital repairs).
- **Ways of Saving Money:** Opening a savings bank account; participating in community savings clubs (*Mukando / Round*); cutting unnecessary impulse expenses; keeping a strict monthly budget.

#### 4. Career Pathways:
- **Definition:** A structured sequence of educational courses, vocational training, and work experiences that lead an individual toward their desired professional career.
- **Pathways in Zimbabwe:** STEM (Engineering, Medicine, ICT); Commercials (Accounting, Banking, Marketing); Arts & Humanities (Law, Teaching, Media); Vocational & Technical (Agriculture, Carpentry, Welding).`,
    keywords: ["study skills", "financial literacy", "exam preparation", "earning and saving money", "career pathways"]
  }
];

module.exports = { hssQA };
