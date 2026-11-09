// scripts/generate_religion_qa.cjs
// Comprehensive question-and-answer dataset for Grade 7 Heritage and Social Studies: Religion
// Aligned strictly with ZIMSEC HBC Syllabus

const religionQA = [
  // 1. Festivals and Ceremonies
  {
    id: "rel_festivals_ceremonies_four_religions",
    topic: "Religious festivals and ceremonies",
    section: "Heritage and Social Studies: Religion",
    question: "name festivals/ceremonies done at community level identify ceremonies/festivals in Christianity, Islam, Judaism and Indigenous Religion",
    normalizedQuestions: [
      "name festivals ceremonies done at community level",
      "religious festivals and ceremonies in zimbabwe",
      "festivals in christianity islam judaism indigenous religion",
      "religious ceremonies in indigenous religion"
    ],
    answer: `### Religious Festivals and Ceremonies Across the Four Religions

#### 1. Indigenous Religion:
- **Mukwerera / Mutoro:** Annual communal rainmaking ceremony held before the rainy season at sacred mountains or under sacred *Muhacha* trees, presided over by chiefs and spirit mediums.
- **Kurova Guva / Umbuyiso:** Memorial ceremony conducted approximately one year after death to bring the deceased's wandering spirit back home as a protecting family ancestor (*Mudzimu / Idlozi*).
- **Zunde raMambo / Isiphala seNkosi:** Communal harvest celebration offering the first fruits of harvest to the paramount chief and ancestors to replenish granaries for the poor.

#### 2. Christianity:
- **Christmas (25 December):** Celebrates the miraculous birth and incarnation of Jesus Christ in Bethlehem.
- **Good Friday & Easter Sunday:** Commemorates the crucifixion, sacrificial death, and bodily resurrection of Jesus Christ from the dead.
- **Pentecost:** Celebrates the descent of the Holy Spirit upon the early apostles.
- **Sacraments/Ceremonies:** Baptism (spiritual rebirth and initiation) and Holy Communion (Lord's Supper / Eucharist).

#### 3. Islam:
- **Eid al-Fitr (Festival of Breaking the Fast):** Joyous celebration marking the conclusion of the holy month of Ramadan and fasting.
- **Eid al-Adha (Feast of the Sacrifice):** Major Islamic festival honouring Prophet Ibrahim's willingness to sacrifice his son in obedience to Allah; marks the end of the annual Hajj pilgrimage.
- **Mawlid al-Nabi:** Observance of the birthday of Prophet Muhammad (Peace Be Upon Him).

#### 4. Judaism:
- **Pesach (Passover):** Commemorates the liberation of the Israelites from slavery in Egypt under Moses and the Exodus.
- **Rosh Hashanah:** The Jewish New Year, marked by repentance and the blowing of the Shofar (ram's horn).
- **Yom Kippur (Day of Atonement):** The holiest day in Judaism, observed with strict 25-hour fasting and intensive prayer for forgiveness.
- **Hanukkah (Festival of Lights):** Celebrates the rededication of the Second Temple in Jerusalem.`,
    keywords: ["festivals in religion", "mukwerera", "kurova guva", "easter", "christmas", "eid al fitr", "eid al adha", "passover", "yom kippur"]
  },

  // 2. Sacred Days
  {
    id: "rel_sacred_days_four_religions",
    topic: "Sacred days in four religions",
    section: "Heritage and Social Studies: Religion",
    question: "state sacred days in Indigenous religion, Christianity, Islam and Judaism discuss the importance of sacred days",
    normalizedQuestions: [
      "state sacred days in indigenous religion",
      "sacred days in christianity islam judaism",
      "importance of sacred days",
      "sacred days across religions"
    ],
    answer: `### Sacred Days Across the Four Religions

#### 1. Indigenous Religion (*Chisi / Izila*):
- **Sacred Day:** **Chisi** (usually set on Thursdays in most Shona communities, or designated by local chiefs).
- **Significance:** A sacred day of communal rest when tilling the soil, farming, and manual bush clearing are strictly forbidden (*Chiera*) out of reverence for the earth and ancestral spirits (*Vadzimu*). Violators are summoned to the chief's court and fined cattle or goats.

#### 2. Christianity (Sunday / Saturday Sabbath):
- **Sacred Day:** **Sunday** (for mainstream Christian denominations including Roman Catholic, Anglican, Methodist, and Apostolic churches celebrating Christ's Sunday resurrection) and **Saturday** (for Seventh-day Adventists and Sabbath-keeping churches adhering to the fourth commandment).
- **Significance:** Dedicated to corporate church worship, Bible reading, singing praises, communion, and fellowship.

#### 3. Islam (Friday - *Jummah*):
- **Sacred Day:** **Yawm al-Jummah** (Friday).
- **Significance:** Muslims gather at the central mosque (*Masjid*) around noon for the special congregational Friday prayer (*Salat al-Jummah*) preceded by a spiritual sermon (*Khutbah*).

#### 4. Judaism (Saturday - *Shabbat*):
- **Sacred Day:** **Shabbat** (from sunset Friday evening to nightfall Saturday).
- **Significance:** Commemorates God resting on the seventh day of creation and the liberation from Egypt. Jews refrain from all secular work (driving, cooking, handling money) and focus on family meals, candle lighting, Torah study, and synagogue prayer.`,
    keywords: ["sacred days", "chisi", "sunday sabbath", "jummah", "shabbat", "importance of sacred days"]
  },

  // 3. Sacred Places
  {
    id: "rel_sacred_places_four_religions",
    topic: "Sacred places in four religions",
    section: "Heritage and Social Studies: Religion",
    question: "identify sacred places in Indigenous religion, Christianity, Islam and Judaism state the significance of sacred places",
    normalizedQuestions: [
      "sacred places in indigenous religion",
      "sacred places in christianity islam judaism",
      "significance of sacred places",
      "holy places in religion"
    ],
    answer: `### Sacred Places Across the Four Religions

#### 1. Indigenous Religion:
- **Sacred Places:** **Matobo Hills (Njelele Rain Shrine)** in Matabeleland South; sacred mountains (e.g. Mount Nyangani, Domboshava); sacred caves (Chinhoyi Caves); sacred water pools; and ancestral grave sites.
- **Significance:** Sites of divine communication where the Supreme Creator (*Mwari / uMlimu*) and tribal spirit mediums (*Mhondoro*) are approached during national crises and rainmaking.

#### 2. Christianity:
- **Sacred Places:** Local **Churches and Cathedrals**; biblical holy sites including **Jerusalem** (site of Christ's crucifixion and empty tomb), **Bethlehem** (birthplace of Jesus), and **Nazareth**.
- **Significance:** Sanctuaries where believers gather for prayer, sacramental worship, and personal encounter with God.

#### 3. Islam:
- **Sacred Places:**
  - **Mecca (Makkah), Saudi Arabia:** Holiest city, home of the **Kaaba** inside the Grand Mosque (*Masjid al-Haram*), direction of prayer (*Qibla*).
  - **Medina (Al-Madinah):** The city of Prophet Muhammad and site of his burial at the Prophet's Mosque.
  - **Al-Aqsa Mosque (Jerusalem):** The third holiest site in Islam.
- **Significance:** Spiritual destinations for compulsory pilgrimage (*Hajj*) and unified global devotion.

#### 4. Judaism:
- **Sacred Places:**
  - **The Western Wall (*Kotel*) in Jerusalem:** The remaining retaining wall of the ancient Second Temple.
  - **Synagogues:** Local congregational sanctuaries containing the Holy Ark (*Aron Kodesh*) housing Torah scrolls.
- **Significance:** Direct connection to the covenant of Abraham and the presence of the Shechinah (divine presence).`,
    keywords: ["sacred places", "njelele", "mecca", "kaaba", "jerusalem", "western wall", "holy places"]
  },

  // 4. Food Laws
  {
    id: "rel_food_laws_four_religions",
    topic: "Food laws in four religions",
    section: "Heritage and Social Studies: Religion",
    question: "identify food laws in Indigenous religion, Christianity, Islam and Judaism explain the importance of food laws",
    normalizedQuestions: [
      "food laws in indigenous religion",
      "food laws in christianity islam judaism",
      "halal and haram",
      "kosher food laws",
      "importance of food laws"
    ],
    answer: `### Food Laws Across the Four Religions

#### 1. Indigenous Religion:
- **Food Laws:** Strict observance of **Totemic Taboos (*Zviera*)**: Clan members are strictly forbidden from eating the meat of their totem animal (e.g., someone with *Mhofu* totem must never eat eland meat; *Hove* must not eat fish). Animals that die of unverified diseases or carcasses without clean customary slaughter are forbidden.
- **Importance:** Conserves wildlife, protects health, and reinforces moral clan identity.

#### 2. Christianity:
- **Food Laws:** Most mainstream Christians enjoy freedom of diet based on New Testament teachings, but practice voluntary fasting (abstaining from rich foods/meat during Lent). Certain Christian denominations (e.g. Seventh-day Adventists and Apostolic sects like Johane Marange) strictly forbid eating pork, scale-less fish, and blood based on Leviticus 11.
- **Importance:** Promotes physical temperance, bodily health, and spiritual self-discipline.

#### 3. Islam (*Halal* vs *Haram*):
- **Food Laws:**
  - **Halal (Permissible):** Animals cleanly slaughtered in the name of Allah (*Dhabihah*), fish with scales, grains, fruits, vegetables.
  - **Haram (Strictly Forbidden):** Pork and swine products; blood; carrion (dead animals); animals slaughtered to idols; intoxicating alcohol and narcotics.
- **Importance:** Demonstrates absolute obedience to Allah's divine commandments and guards spiritual and bodily purity.

#### 4. Judaism (*Kashrut / Kosher*):
- **Food Laws:**
  - **Kosher:** Animals with split hooves that chew the cud (cattle, sheep, goats); poultry; fish with both fins and scales.
  - **Treif (Forbidden):** Pork, shellfish, camel, predatory birds.
  - **Separation:** Strict prohibition against cooking or eating meat and dairy products together (*"Do not boil a young goat in its mother's milk"*).
- **Importance:** Fulfills holy covenantal sanctity and preserves distinct Jewish religious identity.`,
    keywords: ["food laws", "halal", "haram", "kosher", "kashrut", "totemic taboos", "importance of food laws"]
  },

  // 5. Symbols in Religion
  {
    id: "rel_symbols_four_religions",
    topic: "Symbols in four religions",
    section: "Heritage and Social Studies: Religion",
    question: "identify symbols in Indigenous religion, Christianity, Islam and Judaism state the significance of symbols",
    normalizedQuestions: [
      "symbols in indigenous religion",
      "symbols in christianity islam judaism",
      "significance of religious symbols",
      "cross crescent star of david"
    ],
    answer: `### Symbols in the Four Religions

#### 1. Indigenous Religion:
- **Clay Pot (*Hari*):** Symbolizes the womb, hospitality, and containment of sacred ancestral brew during rituals.
- **Wooden Staff (*Tsvimbo / Induku*):** Symbol of authority, patriarchal lineage, and protection.
- **Snuff Container (*Nhekwe*):** Holds traditional ground tobacco used by spirit mediums to evoke ancestral communication.
- **Three Sacred Cloths (*Machira Matatu*):** Black (spirituality/elders), White (purity/peace), and Red (protection/courage).

#### 2. Christianity:
- **The Cross / Crucifix:** The preeminent symbol representing Jesus Christ's sacrifice, redemption, and victory over sin and death.
- **The Dove:** Symbolizes the Holy Spirit and peace.
- **The Fish (*Ichthys*):** Early secret Christian symbol standing for *"Jesus Christ, Son of God, Saviour"*.

#### 3. Islam:
- **Crescent Moon and Star:** Internationally recognized Islamic symbol featured on minarets and national flags; marks the Islamic lunar calendar.
- **Arabic Calligraphy of "Allah" and "Muhammad":** Highlights monotheism without idolatrous images.

#### 4. Judaism:
- **Star of David (*Magen David* - Shield of David):** Six-pointed star symbolizing divine protection over King David and the Jewish nation.
- **The Menorah:** Seven-branched candelabrum symbolizing divine wisdom, the seven days of creation, and light to the world.
- **Mezuzah:** Parchment scroll affixed to doorposts containing the Shema (*"Hear, O Israel: The Lord our God, the Lord is one"*).`,
    keywords: ["religious symbols", "symbols in religion", "cross", "crescent moon and star", "star of david", "menorah", "hari"]
  },

  // 6. Key Teachings in Religion
  {
    id: "rel_key_teachings_four_religions",
    topic: "Key teachings in four religions",
    section: "Heritage and Social Studies: Religion",
    question: "identify key teachings in Indigenous religion, Christianity, Islam and Judaism explain the importance of key teachings",
    normalizedQuestions: [
      "key teachings in indigenous religion",
      "key teachings in christianity islam judaism",
      "importance of key teachings in religion",
      "ten commandments five pillars"
    ],
    answer: `### Key Teachings Across the Four Religions

#### 1. Indigenous Religion:
- **Reverence for the Supreme Creator (*Mwari / uMlimu*):** God is the sovereign architect of life and rain.
- **The Philosophy of *Unhu/Ubuntu*:** Moral excellence, empathy, communal honesty, hospitality, and respect for parents and elders.
- **Reverence for Ancestors (*Vadzimu*):** Upholding family values and moral accountability, knowing ancestors oversee family conduct.
- **Sacred Environmental Stewardship:** Caring for forests, water sources, and wildlife as sacred gifts.

#### 2. Christianity:
- **The Great Commandments:** Love the Lord your God with all your heart, and love your neighbour as yourself.
- **The Ten Commandments (Decalogue):** Ethical laws given to Moses forbidding idolatry, murder, adultery, theft, lying, and covetousness.
- **The Sermon on the Mount:** Forgiveness, meekness, peace-making, humility, and turning the other cheek.
- **Salvation by Grace:** Eternal life through faith in Jesus Christ.

#### 3. Islam:
- **The Five Pillars of Islam:**
  1. *Shahada:* Declaration of faith ("There is no God but Allah, and Muhammad is His messenger").
  2. *Salah:* Performing 5 daily obligatory prayers.
  3. *Zakat:* Giving compulsory charity (2.5% of excess wealth) to the poor.
  4. *Sawm:* Fasting during the holy month of Ramadan.
  5. *Hajj:* Pilgrimage to Mecca once in a lifetime for those physically and financially able.
- **Tawhid (Absolute Monotheism):** God has no partners, parents, or offspring.

#### 4. Judaism:
- **The Shema:** Affirming the oneness of God (*Adonai Eloheinu, Adonai Echad*).
- **The Torah and 613 Mitzvot (Commandments):** Detailed guidance for ethical, religious, and civil living.
- **Tzedakah (Righteous Charity) and Tikkun Olam (Repairing the World):** Pursuing social justice, fair wages, and helping the vulnerable.`,
    keywords: ["key teachings in religion", "ten commandments", "five pillars of islam", "torah", "unhu ubuntu", "shema"]
  },

  // 7. Religious Artefacts and Attire
  {
    id: "rel_artefacts_and_attire_four_religions",
    topic: "Religious artefacts and attire in four religions",
    section: "Heritage and Social Studies: Religion",
    question: "identify religious artefacts in Indigenous religion, Christianity, Islam and Judaism describe religious attire in four religions",
    normalizedQuestions: [
      "religious artefacts in indigenous religion christianity islam judaism",
      "religious attire in four religions",
      "artefacts and attire in religion",
      "clothing in religion"
    ],
    answer: `### Religious Artefacts and Attire Across the Four Religions

#### 1. Indigenous Religion:
- **Artefacts:** **Mbira** (thumb piano) and **Hosho** (gourd rattles) used to invoke ancestral spirits during *Bira*; **Hakata** (wooden/bone divination bones used by *N'anga*); **Hari** (clay pots).
- **Attire:** Ceremonial cloths (*Machira* - black, white, red); animal skins (*Mabhande / Nhembe*); ostrich feather headdresses; bead necklaces (*Chuma*).

#### 2. Christianity:
- **Artefacts:** **The Holy Bible**; Rosary beads; Communion chalice and paten; Baptismal fonts; crucifixes.
- **Attire:** Pastors and priests wear clerical collars, liturgical vestments (cassocks, albs, stoles); apostolic members wear white gowns (*Magemzi*) with green, blue, or red sashes; head coverings for women.

#### 3. Islam:
- **Artefacts:** **The Holy Qur'an**; **Tasbih** (prayer beads used for Dhikr); **Sajjada** (prayer rug used to ensure a clean prayer surface); **Compass** (to locate the Qibla).
- **Attire:**
  - **Women:** **Hijab** (headscarf covering hair and neck), **Abaya** (loose-fitting black cloak).
  - **Men:** **Thobe** (long ankle-length white robe), **Kufi** (brimless prayer skullcap).

#### 4. Judaism:
- **Artefacts:** **Torah Scroll** (handwritten parchment rolled on wooden rollers); **Shofar** (ram's horn blown on Rosh Hashanah); **Kiddush Cup** for wine blessings; **Menorah**.
- **Attire:** **Kippah / Yarmulke** (skullcap worn as a sign of reverence to God); **Tallit** (prayer shawl with knotted fringes called **Tzitzit**); **Tefillin** (small black leather boxes containing Torah verses strapped to the forehead and arm during weekday morning prayer).`,
    keywords: ["religious artefacts", "religious attire", "mbira", "tasbih", "kippah", "hijab", "tallit", "torah scroll"]
  },

  // 8. Religious Practitioners
  {
    id: "rel_practitioners_four_religions",
    topic: "Religious practitioners in four religions",
    section: "Heritage and Social Studies: Religion",
    question: "identify religious practitioners in Indigenous religion, Christianity, Islam and Judaism list the roles of religious practitioners",
    normalizedQuestions: [
      "religious practitioners in indigenous religion",
      "religious practitioners in christianity islam judaism",
      "roles of religious practitioners",
      "priest pastor imam rabbi nanga svikiro"
    ],
    answer: `### Religious Practitioners and Their Roles Across the Four Religions

#### 1. Indigenous Religion:
- **Practitioners:** Spirit Mediums (*Svikiro / Mhondoro*), Traditional Healers (*N'anga / Sangoma*), Traditional Chiefs (*Madzimambo*), Family Elders (*Vakuru veMusha*).
- **Roles:** Channel messages from ancestral spirits; divine causes of misfortune and prescribe herbal medicines; conduct rainmaking ceremonies (*Mukwerera*); maintain communal peace and moral order.

#### 2. Christianity:
- **Practitioners:** Pastors, Priests, Bishops, Evangelists, Deacons, Apostles.
- **Roles:** Lead Sunday church services and preach sermons; administer holy sacraments (Baptism, Holy Communion); officiate weddings and funeral services; provide spiritual and marriage counselling.

#### 3. Islam:
- **Practitioners:** **Imam** (prayer leader at the mosque), **Mufti** (legal scholar qualified to issue Islamic legal rulings or Fatwas), **Muezzin** (the official who recites the Adhan call to prayer), **Sheikh** (respected Islamic scholar).
- **Roles:** Lead the 5 daily prayers and the Friday Jummah prayer; teach the Qur'an and Hadith; officiate Islamic marriages (*Nikah*) and burials; guide community charities.

#### 4. Judaism:
- **Practitioners:** **Rabbi** (ordained spiritual leader and teacher of Jewish law), **Cantor (*Hazzan*)** (leads the congregation in liturgical vocal prayer and chanting), **Mohel** (performs circumcision of 8-day-old boys).
- **Roles:** Interpret the Torah and Talmud; lead synagogue services; counsel congregants; teach Bar/Bat Mitzvah candidates; preserve ritual traditions.`,
    keywords: ["religious practitioners", "svikiro", "nanga", "pastor", "priest", "imam", "rabbi", "roles of religious practitioners"]
  },

  // 9. Voluntary Work and Social Services in Zimbabwe
  {
    id: "rel_voluntary_work_and_social_services",
    topic: "Voluntary and humanitarian work, Provision of social services in Zimbabwe",
    section: "Heritage and Social Studies: Religion",
    question: "identify prominent people involved in voluntary work in the past and present identify voluntary and humanitarian organisations identify institutions that provide social services in Zimbabwe state the benefits of volunteerism",
    normalizedQuestions: [
      "prominent people involved in voluntary work",
      "voluntary and humanitarian organisations in zimbabwe",
      "institutions that provide social services in zimbabwe",
      "benefits of volunteerism"
    ],
    answer: `### Voluntary Work, Humanitarian Organisations, and Social Services in Zimbabwe

#### 1. Prominent People in Voluntary Work:
- **Jairos Jiri:** Pioneered rehabilitation, education, and vocational skills training for physically disabled and blind individuals in Zimbabwe.
- **Matthew Rusike:** Methodist minister who founded the Matthew Rusike Children's Home to shelter abandoned orphans.
- **Sister Stella Mendlong:** Catholic nun dedicated to nursing leprosy patients at Mutemwa Leprosy Centre in Mutoko alongside John Bradburne.
- **Mother Patrick (Mary Ann Cosgrave):** Established the first modern hospitals and nursing services in early Zimbabwe.

#### 2. Voluntary and Humanitarian Organisations in Zimbabwe:
- **Zimbabwe Red Cross Society:** Provides emergency disaster relief, First Aid training, and food assistance during cyclones and famines.
- **Jairos Jiri Association:** Empowers people with disabilities through vocational craft training and inclusive schools.
- **Matthew Rusike Children's Home:** Cares for vulnerable, orphaned, and abandoned children.
- **Island Hospice:** Offers compassionate palliative care for terminally ill patients and cancer sufferers.
- **Childline Zimbabwe:** Provides a 24-hour toll-free helpline protecting children from abuse and domestic violence.

#### 3. Government Institutions Providing Social Services:
- **Department of Social Welfare (Ministry of Public Service):** Manages BEAM (Basic Education Assistance Module), public food distribution, and social cash transfers.
- **Ministry of Health and Child Care:** Provides public clinics, immunisation programs, and hospital care.
- **Ministry of Primary and Secondary Education:** Ensures free/subsidized basic education for disadvantaged children.

#### 4. Benefits of Volunteerism:
1. Alleviates poverty, suffering, and disease in vulnerable communities.
2. Develops empathy, practical teamwork, and leadership skills in volunteers.
3. Cultivates the patriotic spirit of *Unhu/Ubuntu* and selfless national building.`,
    keywords: ["voluntary work", "jairos jiri", "matthew rusike", "red cross", "social services in zimbabwe", "volunteerism benefits"]
  }
];

module.exports = { religionQA };
