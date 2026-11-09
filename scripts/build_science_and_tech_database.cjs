const fs = require('fs');
const path = require('path');

const chunks = [
  // =========================================================================
  // 1. ENVIRONMENTAL HYGIENE, HUMAN BODY & HEALTH
  // =========================================================================
  {
    id: 'sci-respiratory-system-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Respiratory System: Parts, Functions, Diseases & Air Pollution',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Human Body:
1. Parts of the Respiratory System:
   - Nose / Nasal Cavity: Warms, moistens, and filters incoming air using mucus and microscopic hairs (cilia).
   - Pharynx & Larynx: Throat passage and voice box containing vocal cords that vibrate to produce sound.
   - Trachea (Windpipe): Strong tube reinforced with C-shaped rings of cartilage that prevent it from collapsing during inhalation.
   - Bronchi (singular: Bronchus): Two main branches leading from the trachea into the right and left lungs.
   - Bronchioles: Smaller branching tubes within the lungs distributing air to all areas.
   - Alveoli (Air Sacs): Millions of microscopic, thin-walled, moist air sacs surrounded by blood capillaries where gas exchange takes place by diffusion.
   - Diaphragm: Large, dome-shaped sheet of muscle separating the chest cavity from the abdomen.
   - Ribs and Intercostal Muscles: Bone cage and muscles that move upward and outward during inhalation to expand chest volume.

2. Functions of Respiratory Parts:
   - Gas Exchange in Alveoli: Oxygen diffuses from alveoli into red blood cells (binding with hemoglobin); carbon dioxide and water vapor diffuse from blood into alveoli to be exhaled.
   - Adaptations of Alveoli for Gas Exchange:
     * Enormous total surface area (over 100 square meters in adults).
     * Extremely thin walls (only one cell thick) providing a short diffusion distance.
     * Dense network of surrounding blood capillaries.
     * Moist inner lining allowing gases to dissolve before diffusing.

3. Respiratory Diseases:
   - Asthma: Chronic allergic inflammation causing airways (bronchioles) to swell, narrow, and produce excess sticky mucus; triggered by dust, cold air, smoke, and pollen.
   - Bronchitis: Inflammation of the mucous membrane in the bronchial tubes, causing persistent coughing and phlegm.
   - Pneumonia: Severe bacterial or viral infection causing fluid and pus to fill the alveoli in one or both lungs.
   - Tuberculosis (TB): Bacterial infection caused by Mycobacterium tuberculosis, causing chronic cough, blood-stained sputum, fever, night sweats, and weight loss.
   - Influenza (Flu) & Common Cold: Viral infections causing sore throat, runny nose, sneezing, and fever.

4. Effects of Air Pollution on the Respiratory System:
   - Smoke, dust, and particulate soot paralyze and destroy cilia in the trachea, preventing the clearance of mucus and trapped germs.
   - Sulfur dioxide (SO2) and nitrogen oxides (NOx) irritate respiratory linings and trigger severe asthma attacks.
   - Carbon monoxide (CO) binds irreversibly to blood hemoglobin, blocking oxygen transport to the brain and body cells, causing dizziness, suffocation, and death in enclosed rooms (such as sleeping with a burning charcoal brazier / mbaura).
   - Long-term exposure to polluted air causes chronic obstructive pulmonary disease (COPD) and lung cancer.`,
    keywords: [
      'respiratory system', 'parts of the respiratory system', 'functions of parts of the respiratory system',
      'respiratory diseases', 'effects of air pollution to the respiratory system', 'lungs', 'alveoli',
      'trachea', 'bronchi', 'bronchioles', 'diaphragm', 'gas exchange', 'asthma', 'pneumonia', 'bronchitis', 'tuberculosis'
    ]
  },
  {
    id: 'sci-circulatory-system-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Circulatory System: Heart, Blood Vessels & Double Circulation',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Human Body:
1. Parts of the Circulatory System:
   - The Heart: A muscular, four-chambered pumping organ located in the chest cavity, tilted slightly to the left.
     * Right Atrium: Receives deoxygenated blood from the body through the vena cava.
     * Right Ventricle: Pumps deoxygenated blood to the lungs through the pulmonary artery.
     * Left Atrium: Receives freshly oxygenated blood from the lungs through the pulmonary vein.
     * Left Ventricle: Pumps oxygen-rich blood under high pressure to the entire body through the aorta (has the thickest muscular wall).
     * Valves: Tricuspid, bicuspid, and semi-lunar valves prevent backflow of blood.
     * Septum: Central muscular wall separating the left and right sides of the heart to prevent mixing of oxygenated and deoxygenated blood.
   - Blood Vessels:
     * Arteries: Carry blood AWAY from the heart; have thick, elastic, muscular walls; transport blood under high pressure; do not have valves.
     * Veins: Carry blood TOWARDS the heart; have thinner walls and wide lumen; carry blood under low pressure; contain semi-lunar valves to prevent backflow.
     * Capillaries: Microscopic vessels connecting arteries to veins; walls are only one cell thick to allow rapid exchange of oxygen, glucose, and waste products with body tissues.
   - Blood Components:
     * Red Blood Cells: Biconcave discs with no nucleus containing hemoglobin to carry oxygen.
     * White Blood Cells: Defend the body by engulfing pathogens (phagocytes) or producing antibodies (lymphocytes).
     * Platelets: Cell fragments that initiate blood clotting to stop bleeding at wounds.
     * Plasma: Liquid portion (90% water) carrying dissolved nutrients, urea, carbon dioxide, hormones, and heat.

2. Explanation of the Circulatory System (Double Circulation):
   - Humans have a double circulatory system: blood passes through the heart TWICE during each complete circuit of the body.
   - Pulmonary Circulation: The right ventricle pumps deoxygenated blood to the lungs; gas exchange occurs (absorbs O2, releases CO2); oxygenated blood returns to the left atrium.
   - Systemic Circulation: The left ventricle pumps oxygenated blood under high pressure through the aorta to the rest of the body cells for respiration; deoxygenated blood returns via the vena cava to the right atrium.`,
    keywords: [
      'circulatory system', 'naming the parts of the circulatory system', 'explain the circulatory system',
      'heart', 'blood vessels', 'arteries', 'veins', 'capillaries', 'double circulation', 'red blood cells',
      'white blood cells', 'platelets', 'plasma', 'aorta', 'pulmonary artery', 'pulmonary vein', 'vena cava'
    ]
  },
  {
    id: 'sci-food-safety-handling',
    strand: 'Environmental Hygiene & Health',
    topic: 'Food Safety: Safe Food Handling Practices and Importance',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Food Safety:
1. Definition of Food Safety:
   - Food safety refers to the scientific handling, preparation, and storage of food in ways that prevent foodborne illness, contamination, and food poisoning.

2. Importance of Food Safety:
   - Protects human health by preventing infection by disease-causing pathogens (bacteria, viruses, fungi, parasites).
   - Prevents outbreaks of foodborne illnesses such as cholera, salmonellosis, dysentery, and typhoid.
   - Prevents nutrient degradation and food spoilage, reducing family and national food waste.
   - Ensures food maintains its nutritional value, taste, and freshness.

3. Safe Food Handling Practices:
   - Cleanliness: Wash hands with clean running water and soap before touching food, after using the toilet, and after handling raw meat. Wash all kitchen utensils, chopping boards, and work surfaces with detergent.
   - Prevent Cross-Contamination: Keep raw meat, poultry, and fish completely separate from cooked food and fresh vegetables. Use separate cutting boards and knives for raw meat and ready-to-eat foods.
   - Thorough Cooking: Cook food thoroughly, especially meat, poultry, and seafood, ensuring the core temperature reaches at least 70°C to kill harmful bacteria. Reheat previously cooked food until steaming hot throughout.
   - Safe Temperature Storage: Keep food cold below 5°C (in a refrigerator) or very hot above 60°C. Never leave cooked food at room temperature for more than 2 hours (the temperature danger zone is 5°C to 60°C, where bacteria multiply rapidly).
   - Safe Water and Raw Materials: Use clean, treated or boiled water for cooking and washing fruits. Check expiry dates and never use swollen, dented, or rusted food cans.`,
    keywords: [
      'food safety', 'define food safety', 'outline the importance of food safety',
      'explain safe food handling practices', 'food hygiene', 'cross-contamination', 'safe temperature', 'food handling'
    ]
  },
  {
    id: 'sci-noise-pollution-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Environmental Health: Noise Pollution Sources, Effects & Reduction',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Health:
1. Definition of Noise Pollution:
   - Noise pollution is the presence of excessive, disturbing, or unwanted sound in the environment that causes discomfort, stress, or harm to human health and wildlife.

2. Sources of Noise Pollution:
   - Transportation: Honking horns, screeching brakes, revving vehicle engines, aeroplanes taking off and landing, trains.
   - Industrial and Commercial: Grinding mills (chigayo), diesel generators, metal fabrication workshops, factory machinery.
   - Construction and Mining: Rock blasting, jackhammers, earthmoving bulldozers, concrete mixers.
   - Social and Domestic: High-volume open-air loudspeakers at religious gatherings, music systems in beerhalls, barking dogs, lawnmowers.

3. Effects of Noise Pollution:
   - Human Health Effects:
     * Hearing impairment, partial deafness, and temporary or permanent tinnitus (ringing in the ears).
     * High blood pressure (hypertension) and elevated heart rates caused by constant noise stress.
     * Sleep disturbance (insomnia), fatigue, mental agitation, and irritability.
     * Decreased concentration and poor academic performance in schoolchildren whose schools are near busy roads.
   - Environmental and Animal Effects: Disorients animals, interferes with bird mating calls, and drives wildlife away from their natural habitats.

4. Ways of Reducing Noise Pollution:
   - Legislation: Enforcing local council municipal by-laws against excessive noise and playing loud music at night.
   - Engineering Solutions: Installing noise silencers on vehicle exhaust pipes and diesel generator units; soundproofing factory walls.
   - Urban Planning: Planting belts of green trees and dense hedges along highways and around schools to act as natural acoustic buffers that absorb sound waves.
   - Personal Protection: Wearing earplugs or earmuffs when operating noisy machines (e.g. lawnmowers, grinding mills).
   - Social Discipline: Keeping volume on household radios, televisions, and party speakers at moderate levels.`,
    keywords: [
      'noise pollution', 'define noise pollution', 'list sources of noise pollution',
      'explain effects of noise pollution', 'list ways of reducing noise pollution', 'hearing loss', 'sound buffers'
    ]
  },
  {
    id: 'sci-emotional-intelligence-health',
    strand: 'Environmental Hygiene & Health',
    topic: 'Emotional Intelligence and Emotional Health',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Health & Unhu/Ubuntu:
1. Definition of Emotional Intelligence (EQ):
   - Emotional Intelligence is the ability to recognize, understand, express, and constructively manage one's own emotions, while also recognizing and responding empathetically to the emotions of others.

2. Components of Emotional Intelligence:
   - Self-Awareness: Recognizing one's own emotions, strengths, limitations, values, and how one's moods affect others.
   - Self-Regulation: The ability to manage impulsive feelings and behaviors, stay calm under provocation, adapt to change, and think before acting.
   - Motivation: An internal drive to learn, improve, set goals, and persevere through difficulties without giving up easily.
   - Empathy: Understanding and sharing the feelings, perspectives, and experiences of other people (feeling compassion).
   - Social Skills: The ability to communicate clearly, resolve conflicts amicably, build positive friendships, and cooperate in teams.

3. Demonstrating Social Skills:
   - Practicing polite respectful communication (greeting elders and peers according to cultural values of Unhu/Ubuntu).
   - Active listening without interrupting when someone else is speaking.
   - Apologizing sincerely when wrong and accepting constructive feedback gracefully.
   - Resolving peer disagreements through discussion and compromise rather than physical violence or insults.

4. Self-Awareness and Self-Regulation in Everyday Situations:
   - Definition of Self-Awareness: Conscious knowledge of one's own character, feelings, motives, and desires.
   - Importance of Self-Awareness: Helps a learner understand their emotional triggers (e.g. what makes them angry or anxious), enabling them to make responsible choices.
   - Reacting to Challenging Situations: Stop, take a deep breath, assess the situation calmly, and choose a peaceful constructive response.
   - Definition of Self-Regulation: The practice of controlling one's thoughts, emotional outbursts, and actions in stressful moments.
   - Techniques for Self-Regulation: Deep diaphragmatic breathing (counting to 10), walking away from heated arguments to cool down, positive self-talk, and speaking to a trusted counsellor, parent, or teacher.

5. Emotional Health and Coping Mechanisms:
   - Definition: A state of emotional well-being where an individual can navigate stress, express feelings appropriately, and maintain positive relationships.
   - Signs of Emotional Health: High self-esteem, optimistic outlook, capacity to handle setbacks, strong social connections.
   - Factors Influencing Emotional Health: Family environment, peer relationships, school pressure, physical health, sleep quality.
   - Coping Mechanisms: Engaging in sports and games, creative arts (drawing, singing), writing feelings in a journal, prayer or meditation, and seeking guidance when overwhelmed.`,
    keywords: [
      'emotional intelligence', 'discuss components of emotional intelligence', 'demonstrate social skills',
      'define emotional intelligence', 'explain various emotions', 'define self- awareness', 'importance of self- awareness',
      'how to react to various situations', 'define self-regulation', 'importance of self- regulation',
      'self- regulation techniques', 'emotional health', 'define emotional health', 'signs of emotional health',
      'factors influencing emotional health', 'emotional health copying mechanisms', 'unhu', 'ubuntu'
    ]
  },
  {
    id: 'sci-chronic-diseases-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Chronic Diseases: Types, Causes, Prevention and Management',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Health and Diseases:
1. Definition of Chronic Diseases:
   - Chronic diseases are long-lasting medical conditions that develop gradually over time, persist for months, years, or a lifetime, are non-communicable (cannot spread from one person to another), and require ongoing medical care and healthy lifestyle management.

2. Types of Chronic Diseases in Zimbabwe:
   - Hypertension (High Blood Pressure): Chronic pressure of blood against artery walls consistently above 140/90 mmHg; known as the "silent killer" because it has no early symptoms.
   - Diabetes Mellitus: Chronic metabolic disorder where the pancreas produces insufficient insulin (or cells become resistant to insulin), causing abnormally high blood glucose levels.
   - Asthma: Chronic inflammatory condition of the airways (bronchi/bronchioles) characterized by wheezing, chest tightness, and breathing difficulty.
   - Cancer: Uncontrolled division and multiplication of abnormal body cells that form tumors and destroy surrounding healthy tissues (e.g. cervical cancer, breast cancer, prostate cancer, lung cancer).
   - Sickle Cell Anaemia: Inherited genetic chronic blood disorder where red blood cells become crescent/sickle-shaped, fragile, and block capillaries, causing severe pain and anemia.
   - Cardiovascular / Heart Diseases: Narrowing of coronary blood vessels due to fatty deposits (cholesterol), increasing the risk of heart attacks and strokes.

3. Causes and Risk Factors of Chronic Diseases:
   - Unhealthy Diet: High intake of processed foods rich in refined sugars, excessive table salt, and saturated/trans fats.
   - Physical Inactivity: Sedentary lifestyle with little or no daily exercise.
   - Obesity: Excess body fat placing strain on the heart, joints, and pancreas.
   - Tobacco and Alcohol Abuse: Cigarette smoking damages blood vessels and lung tissue; alcohol harms the liver and raises blood pressure.
   - Genetics and Family History: Inherited predispositions to diabetes, cancer, or hypertension.
   - Environmental Toxins: Prolonged exposure to toxic industrial fumes, asbestos, and pesticide chemicals.

4. Prevention and Management of Chronic Diseases:
   - Prevention:
     * Eat a balanced, heritage-rich diet featuring traditional whole grains (sorghum, rapoko, mhunga), fresh green leafy vegetables (muriwo wetsunga, mufushwa), and legumes.
     * Engage in at least 30 to 60 minutes of moderate physical activity daily (walking, running, sports, gardening).
     * Avoid smoking tobacco, shisha, and abusing alcohol.
     * Drastically reduce table salt intake to prevent hypertension and cut sugary foods/drinks to prevent diabetes.
   - Management:
     * Take prescribed medications regularly without skipping (e.g. daily antihypertensive tablets, insulin injections for diabetes, bronchodilator inhalers for asthma).
     * Routine medical check-ups to monitor blood pressure, blood glucose levels, and body mass index (BMI).
     * Stress management through relaxation, counselling, and restful sleep.`,
    keywords: [
      'chronic diseases', 'define chronic diseases', 'identify types of chronic diseases',
      'explain causes of chronic diseases', 'discuss prevention and management', 'hypertension', 'diabetes',
      'asthma', 'cancer', 'sickle cell', 'non-communicable diseases'
    ]
  },
  {
    id: 'sci-epidemic-diseases-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Epidemic Diseases: Types, Causes, Prevention and Control',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Disease Control:
1. Definition of Epidemic Diseases:
   - An epidemic disease is an infectious disease that rapidly spreads among a large number of people within a specific community, region, or population in an unusually short period of time. (When it spreads worldwide across multiple continents, it is termed a Pandemic).

2. Types of Epidemic Diseases in Zimbabwe and Africa:
   - Cholera: Acute, severe bacterial infection of the gut caused by Vibrio cholerae, causing profuse painless watery diarrhea ("rice-water stools") and rapid fatal dehydration.
   - Typhoid Fever: Severe bacterial infection caused by Salmonella typhi, causing prolonged high fever, abdominal pain, headache, and rose-colored spots.
   - Measles (Gwirikwiti): Highly contagious viral respiratory illness causing high fever, cough, red watery eyes, and a generalized red blotchy skin rash.
   - COVID-19: Severe respiratory illness caused by the SARS-CoV-2 coronavirus, causing fever, dry cough, loss of smell/taste, and shortness of breath.
   - Malaria: Mosquito-borne infectious disease caused by Plasmodium parasites transmitted by female Anopheles mosquitoes, causing recurrent chills, fever, and sweating.
   - Dysentery: Bacterial or amoebic intestinal infection causing severe diarrhea accompanied by blood and mucus in the stool.

3. Causes and Modes of Transmission:
   - Contaminated Water and Food: Ingesting water or food contaminated with human feces containing bacteria (cholera, typhoid, dysentery).
   - Airborne Droplets: Inhaling respiratory droplets released when an infected person coughs, sneezes, or talks (measles, COVID-19, influenza).
   - Vector Transmission: Being bitten by infected insect vectors (female Anopheles mosquitoes for malaria).
   - Poor Sanitation & Overcrowding: Lack of safe Blair toilets, open defecation, burst sewer pipes, and crowded living conditions.

4. Prevention and Control Measures:
   - Safe Water Supply: Treat drinking water by boiling for at least 1 minute or using water treatment chemicals (e.g. WaterGuard, chlorine tablets).
   - Sanitation and Waste Disposal: Construct and use ventilated improved pit (Blair) latrines; repair burst sewer lines immediately; stop open defecation.
   - Mass Immunization: Vaccinating all infants and children against measles, polio, and COVID-19 to build herd immunity.
   - Vector Control: Sleeping under insecticide-treated mosquito nets (ITNs), indoor residual spraying (IRS), and clearing stagnant water around homes to destroy mosquito breeding sites.
   - Isolation and Contact Tracing: Rapidly isolate infected individuals in specialized treatment clinics to prevent transmission to family and community members.
   - Public Health Education: Teach handwashing with clean running water and soap before meals and after visiting the toilet.`,
    keywords: [
      'epidemic diseases', 'define epidemic diseases', 'identify types of epidemic diseases',
      'explain causes of epidemic diseases', 'suggest ways of preventing and controlling epidemic diseases',
      'cholera', 'typhoid', 'measles', 'covid-19', 'malaria', 'isolation', 'sanitation'
    ]
  },
  {
    id: 'sci-human-reproductive-system-puberty',
    strand: 'Environmental Hygiene & Health',
    topic: 'Human Reproductive System, Gestation, Puberty & Personal Hygiene',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Human Growth and Reproduction:
1. Parts of the Human Reproductive System:
   - Male Reproductive System:
     * Testes (singular: Testis): Paired organs located inside the scrotum that produce male gametes (sperm cells) and the male hormone testosterone.
     * Scrotum: External sac of skin holding the testes at a temperature slightly cooler than body temperature (around 35°C), which is optimal for sperm production.
     * Sperm Duct (Vas Deferens): Tube carrying mature sperm from the testes to the urethra.
     * Prostate Gland and Seminal Vesicles: Produce nutrient-rich seminal fluid that nourishes and activates sperm (forming semen).
     * Urethra: Tube running through the penis that carries both semen and urine out of the body (at different times).
     * Penis: Organ that delivers semen into the female vagina during sexual intercourse.
   - Female Reproductive System:
     * Ovaries: Paired organs that store and release female gametes (ova / egg cells) and produce estrogen and progesterone hormones.
     * Fallopian Tubes (Oviducts): Tubes connecting ovaries to the uterus; the normal site of fertilization where sperm meets the ovum.
     * Uterus (Womb): Pear-shaped muscular organ where a fertilized egg implants and develops into a baby during pregnancy.
     * Cervix: Lower muscular neck of the uterus connecting to the vagina; dilates during childbirth.
     * Vagina (Birth Canal): Muscular canal receiving the penis during intercourse and serving as the passage for the baby during birth and menstrual flow.

2. Gestation Period in Humans:
   - Definition: The gestation period is the time between fertilization of the ovum by a sperm cell and the birth of the baby.
   - Duration in Humans: Approximately 9 calendar months, 40 weeks, or 280 days.
   - Stages: Fertilization -> Zygote -> Embryo (first 8 weeks, organs form) -> Foetus (from 9 weeks until birth, growth and maturation). The developing baby receives oxygen and nutrients from the mother's blood through the placenta and umbilical cord.

3. Puberty and Physical Changes:
   - Definition of Puberty: The developmental stage during adolescence (usually ages 10 to 16) when the reproductive organs mature and the body becomes capable of sexual reproduction.
   - Physical Changes in Boys:
     * Voice deepens ("breaks") as the larynx enlarges.
     * Growth of facial hair (beard, mustache), underarm hair, and pubic hair.
     * Broadening of the shoulders and chest; muscle development.
     * Enlargement of the testes, scrotum, and penis.
     * Occurrence of nocturnal emissions ("wet dreams").
   - Physical Changes in Girls:
     * Enlargement and development of breasts.
     * Widening and rounding of the hips.
     * Growth of underarm and pubic hair.
     * Onset of Menstruation (monthly shedding of the uterine lining, known as periods).
     * Growth spurt and accumulation of subcutaneous body fat.

4. Hygiene Practices at Puberty and Importance of Personal Hygiene:
   - Daily Bathing: Bathe at least once daily using clean water and mild soap, washing the armpits, groin, and external genitalia thoroughly to remove accumulated sweat, bacteria, and dead skin cells.
   - Menstrual Hygiene for Girls:
     * Use clean, absorbent sanitary pads or cotton cloths.
     * Change sanitary pads frequently (every 4 to 6 hours) to prevent unpleasant odors, bacterial breeding, and toxic shock syndrome.
     * Dispose of used pads hygienically by wrapping them in newspaper and placing them in a bin or pit latrine (NEVER flush down a water toilet).
     * Wash hands with soap before and after changing sanitary wear.
   - Undergarment Hygiene: Wear clean cotton underwear and wash undergarments daily, drying them in direct sunlight to kill bacteria.
   - Deodorant and Skin Care: Wash face regularly with water to manage increased oil production and prevent acne (pimples).`,
    keywords: [
      'human reproductive system', 'identify human reproductive parts', 'draw reproductive parts',
      'gestation period in humans', 'describe the process of puberty and physical changes',
      'hygiene practices at puberty stage', 'importance of personal hygiene', 'testes', 'ovaries',
      'uterus', 'fallopian tubes', 'menstruation', 'puberty', 'gestation'
    ]
  },
  {
    id: 'sci-foodborne-diseases-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Foodborne Diseases: Signs, Symptoms, Prevention & Control',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Food Safety:
1. Definition of Foodborne Diseases:
   - Foodborne diseases (commonly called food poisoning) are illnesses caused by consuming food or drinks that are contaminated with pathogenic microorganisms (such as bacteria, viruses, parasites, or fungi) or toxic chemicals.

2. Common Causes:
   - Bacterial toxins produced by Staphylococcus aureus in unrefrigerated food.
   - Salmonella bacteria from undercooked poultry, raw eggs, or unpasteurized milk.
   - Escherichia coli (E. coli) from contaminated beef or irrigation water.
   - Clostridium botulinum in improperly canned foods.

3. Signs and Symptoms of Foodborne Diseases:
   - Severe abdominal pain and stomach cramps.
   - Nausea and frequent vomiting.
   - Watery diarrhea (sometimes containing blood or mucus).
   - High body temperature (fever) and chills.
   - Headache, general muscle aches, and extreme fatigue.
   - Dehydration (dry mouth, sunken eyes, dark urine, extreme thirst).

4. Prevention and Control of Foodborne Diseases:
   - Practice Good Personal Hygiene: Food handlers must wash hands thoroughly with soap before preparing meals and after using the toilet.
   - Cook Thoroughly: Ensure meat, chicken, pork, and eggs are cooked all the way through to kill live bacteria.
   - Avoid Cross-Contamination: Use separate knives and chopping boards for raw meats and ready-to-eat foods like salads.
   - Safe Food Storage: Store perishable foods in a refrigerator below 5°C; do not leave cooked food standing at room temperature for over 2 hours.
   - Boil Drinking Water: Use only clean, safe, or boiled water for food preparation and washing vegetables.
   - Exclude Sick Handlers: Anyone suffering from diarrhea, vomiting, or skin boils must not handle or prepare food for others.`,
    keywords: [
      'foodborne diseases', 'define foodborne diseases', 'state the signs and symptoms of foodborne diseases',
      'discuss prevention and control of foodborne diseases', 'food poisoning', 'salmonella', 'e. coli', 'stomach cramps'
    ]
  },
  {
    id: 'sci-land-pollution-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Environmental Hygiene: Land Pollution Types, Effects & Reduction',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Health:
1. Definition of Land Pollution:
   - Land pollution is the degradation and destruction of the Earth's land surfaces and soil quality directly or indirectly as a result of human activities, improper disposal of waste, and chemical contamination.

2. Types of Land Pollution:
   - Solid Domestic Waste: Plastic bags (kaylite, carrier bags), plastic bottles, scrap metal, old car tires, broken glass, and household garbage dumped indiscriminately.
   - Agricultural Chemical Pollution: Excessive use of synthetic chemical fertilizers, pesticides, herbicides, and fungicides that destroy beneficial soil microorganisms.
   - Industrial and Hazardous Waste: Factory toxic chemicals, heavy metals (mercury, lead, cadmium), used motor oil, and batteries dumped on the ground.
   - Mining and Quarrying Degradation: Open-cast mining pits, spoil dumps, cyanide and mercury residues from gold panning (chikorokoza), causing severe land scarring.

3. Effects of Land Pollution:
   - Destroys soil fertility, stunting crop growth and reducing national food harvests.
   - Discarded plastic bags kill domestic livestock (cattle, goats) when ingested, causing fatal rumen compaction.
   - Hazardous chemicals seep into the ground, polluting underground water tables and nearby wells.
   - Open garbage dumps breed disease vectors such as rats, flies, and mosquitoes.
   - Spoils the aesthetic beauty of communities and tourist destinations.

4. Ways to Reduce Land Pollution:
   - The 3Rs Principle:
     * Reduce: Minimize packaging waste and single-use plastic carrier bags.
     * Reuse: Repurpose glass jars, plastic tubs, and containers for household storage.
     * Recycle: Collect plastic bottles, scrap metal, paper, and glass to be melted down into new products.
   - Organic Composting: Convert vegetable peelings, garden weeds, and livestock dung into rich compost manure for farming instead of throwing them away.
   - Sanitary Landfills: Construct planned, lined municipal landfills to contain solid waste safely without leaching.
   - Afforestation and Reclamation: Plant trees and refill abandoned mining pits (land reclamation).
   - Strict Environmental Laws: Enforce Environmental Management Agency (EMA) regulations against littering and illegal dumping.`,
    keywords: [
      'land pollution', 'define land pollution', 'identify types of land pollution',
      'explain effects of land pollution', 'discuss ways to reduce land pollution', '3Rs', 'recycling', 'composting', 'EMA'
    ]
  },
  {
    id: 'sci-hiv-aids-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'HIV and AIDS: Definition, Transmission, Prevention & Management',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Health & Hygiene:
1. Definition of HIV and AIDS:
   - HIV (Human Immunodeficiency Virus): A virus that attacks and gradually destroys the body's immune system, specifically targeting CD4 white blood cells that fight diseases.
   - AIDS (Acquired Immune Deficiency Syndrome): The advanced medical condition that occurs when the immune system has been severely weakened by HIV, leaving the body unable to defend itself against opportunistic infections (such as TB, pneumonia, and fungal infections).

2. Transmission of HIV:
   - How HIV IS Transmitted:
     * Unprotected sexual intercourse with an infected person.
     * Mother-to-Child Transmission (MTCT) during pregnancy, childbirth, or breastfeeding.
     * Sharing unsterilized sharps, razor blades, needles, or syringes contaminated with infected blood.
     * Receiving blood transfusions of unscreened blood (rare due to mandatory blood screening by NBSZ).
   - How HIV is NOT Transmitted (Debunking Myths):
     * HIV CANNOT be transmitted through shaking hands, hugging, coughing, sneezing, or sharing toilets.
     * HIV CANNOT be transmitted through mosquito bites or insect stings.
     * HIV CANNOT be transmitted through sharing cups, plates, spoons, or swimming in the same pool.

3. Prevention of HIV:
   - Abstinence: Choosing to abstain from sexual intercourse (the safest and most reliable choice for youth and school pupils).
   - Being Faithful: Mutual fidelity between two uninfected partners in a marriage.
   - Condom Use: Correct and consistent use of male or female condoms during every sexual encounter.
   - Prevention of Mother-to-Child Transmission (PMTCT): Pregnant mothers take antiretroviral medication to ensure their babies are born HIV-free.
   - Blood Safety & Sterile Sharps: Use only new, sterile, disposable needles and avoid sharing razor blades.
   - Voluntary Medical Male Circumcision (VMMC): Reduces the risk of female-to-male sexual transmission of HIV by approximately 60%.

4. Management and Care of People Living with HIV:
   - Antiretroviral Therapy (ART / ARVs): Lifelong daily medications that suppress the multiplication of HIV in the blood, allowing the immune system to rebuild and preventing progression to AIDS.
   - Healthy Nutrition: Consuming a balanced diet rich in proteins, small grains, vegetables, and vitamins to boost energy and immune function.
   - Treating Opportunistic Infections: Prompt medical treatment of TB, diarrhea, and skin infections.
   - Psychosocial Support: Fostering a supportive, caring family and school environment free from stigma, fear, and discrimination (*Unhu/Ubuntu*).`,
    keywords: [
      'hiv and aids', 'define hiv/aids', 'discuss how hiv/aids can be transmitted',
      'describe how hiv/aids can be prevented', 'discuss how hiv/aids infected persons can be managed',
      'arvs', 'art', 'pmtct', 'cd4', 'unhu', 'ubuntu'
    ]
  },
  {
    id: 'sci-digestive-system-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Digestive System: Parts and Functions of the Alimentary Canal',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Human Body:
1. Parts of the Human Digestive System (Alimentary Canal):
   - Mouth (Oral Cavity): Includes teeth, tongue, and salivary glands.
   - Oesophagus (Gullet): Muscular tube connecting the mouth to the stomach.
   - Stomach: J-shaped muscular sac located in the upper left abdomen.
   - Small Intestine: Long, narrow coiled tube consisting of the duodenum (first part) and ileum (main absorptive part).
   - Associated Glands:
     * Liver: Produces bile (stored in the gall bladder) to emulsify fats.
     * Pancreas: Produces pancreatic juice containing digestive enzymes.
   - Large Intestine: Consists of the colon and rectum.
   - Anus: Muscular sphincter at the end of the digestive tract.

2. Functions of Each Part of the Digestive System:
   - Mouth:
     * Teeth chew and grind food mechanically into smaller pieces (mastication).
     * Saliva moistens food into a slippery ball (bolus); salivary amylase enzyme begins breaking down cooked starch into maltose sugar.
     * Tongue rolls the bolus and pushes it to the back of the throat for swallowing.
   - Oesophagus:
     * Moves food down into the stomach through rhythmic wave-like muscular contractions called **peristalsis**.
   - Stomach:
     * Churns food mechanically with strong muscular contractions into a liquid mixture called chyme.
     * Secretes gastric juice containing Hydrochloric Acid (kills bacteria and creates an acidic medium) and Pepsin enzyme (digests proteins into peptides).
   - Small Intestine (Duodenum & Ileum):
     * Duodenum: Bile from the liver neutralizes stomach acid and breaks fats into tiny droplets (emulsification); pancreatic enzymes digest carbohydrates, proteins, and fats.
     * Ileum: Completes chemical digestion. Lined with millions of microscopic finger-like projections called **villi** that provide a massive surface area to absorb soluble nutrients (glucose, amino acids, fatty acids, vitamins) directly into blood capillaries.
   - Large Intestine (Colon & Rectum):
     * Colon: Absorbs water and dissolved mineral salts from indigestible food residues.
     * Rectum: Temporarily stores semi-solid waste matter (faeces).
   - Anus:
     * Expels faeces from the body through the process of **egestion** (defaecation).`,
    keywords: [
      'digestive system', 'identify parts of the digestive system', 'state the functions of parts of the digestive system',
      'mouth', 'oesophagus', 'stomach', 'small intestine', 'large intestine', 'colon', 'rectum', 'villi', 'peristalsis'
    ]
  },
  {
    id: 'sci-eating-habits-disorders',
    strand: 'Environmental Hygiene & Health',
    topic: 'Unhealthy Eating Habits, Eating Disorders & Healthy Lifestyle',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Nutrition and Health:
1. Definition of Unhealthy Eating Habits:
   - Unhealthy eating habits refer to poor dietary behaviors such as skipping breakfast, irregular meal timing, overeating junk foods high in refined sugars, salt, and trans fats, and failing to consume a balanced diet.

2. Common Eating Disorders:
   - Anorexia Nervosa: A severe psychological eating disorder characterized by self-starvation, an intense and irrational fear of gaining weight, and a distorted body image where the individual views themselves as overweight despite being dangerously thin.
   - Bulimia Nervosa: An eating disorder characterized by recurrent episodes of binge-eating large quantities of food followed by guilt and compensatory purging (forced vomiting, excessive use of laxatives, or extreme exercise).
   - Binge-Eating Disorder: Frequently consuming abnormally large amounts of food in secret, accompanied by feelings of losing control and deep distress, without regular purging.

3. Consequences of Unhealthy Eating Habits and Disorders:
   - Physical Health Consequences: Severe weight loss, muscle wasting, chronic malnutrition, vitamin deficiencies, stunted physical growth in children, tooth decay and enamel erosion (from stomach acid during purging), chronic fatigue, heart failure, and death.
   - Emotional Consequences: Low self-esteem, intense anxiety, social isolation, and clinical depression.
   - Overnutrition Consequences: Obesity, high cholesterol, type 2 diabetes, high blood pressure, and joint problems from carrying excess weight.

4. Activities That Promote a Healthy Lifestyle:
   - Eat regular balanced meals comprising all three essential food groups (body-building proteins, energy-giving carbohydrates, and protective fruits/vegetables).
   - Drink 6 to 8 glasses of clean safe water daily instead of sugary sodas and artificial juices.
   - Engage in daily physical exercise (sports, running, walking, dancing, gardening).
   - Build a healthy body image based on self-acceptance, character, and wellness rather than unrealistic media portrayals.`,
    keywords: [
      'unhealthy eating habits', 'eating disorders', 'define unhealthy eating habits',
      'identify eating disorders', 'explain consequences of unhealthy eating habits',
      'engage in activities that promote healthy lifestyle', 'anorexia', 'bulimia', 'binge eating', 'healthy lifestyle'
    ]
  },
  {
    id: 'sci-water-pollution-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Environmental Hygiene: Water Pollution Causes, Effects & Reduction',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Health:
1. Definition of Water Pollution:
   - Water pollution is the contamination of natural water bodies (rivers, streams, lakes, dams, wetlands, and underground aquifers) by harmful substances, chemicals, or sewage, making the water unsafe for drinking, domestic use, and aquatic life.

2. Causes of Water Pollution:
   - Discharge of untreated domestic municipal sewage and burst sewer pipes directly into rivers (e.g. Manyame and Mukuvisi rivers in Harare).
   - Industrial chemical effluent released by factories, textile mills, and chemical manufacturing plants.
   - Agricultural runoff carrying toxic synthetic pesticides, herbicides, and excess chemical fertilizers into water streams.
   - Artisanal gold panning and mining using lethal chemicals like mercury and cyanide along riverbanks.
   - Dumping domestic solid litter, plastics, and animal carcasses into drainage channels and streams.

3. Effects of Water Pollution:
   - Outbreaks of deadly waterborne epidemics such as cholera, typhoid, and amoebic dysentery.
   - Eutrophication: Excess agricultural fertilizer runoff causes rapid explosive growth of algae; when algae die and rot, bacteria consume dissolved oxygen, causing suffocation and death of fish (fish kills).
   - Bioaccumulation: Toxic heavy metals (mercury, lead) enter the aquatic food chain and poison humans who eat fish from polluted rivers.
   - Shortage of safe potable drinking water, increasing local municipal water purification costs.

4. Measures to Reduce Water Pollution and Water Treatment:
   - Enforce industrial effluent standards: Factories must treat all wastewater in settling and neutralization ponds before discharge.
   - Upgrade and regularly maintain municipal sewage treatment works to prevent raw sewer overflows.
   - Stop gold panning along riverbeds and ban mercury usage in artisanal mining.
   - Maintain 30-metre buffer zones of natural grass and trees along riverbanks to filter agricultural runoff.
   - Methods of Water Treatment at Home:
     * Boiling: Bring water to a rolling boil for at least 1 minute to kill all bacteria, viruses, and parasites.
     * Chlorination / WaterGuard: Add chlorine tablets or WaterGuard solution according to instructions to disinfect drinking water.
     * Filtration: Pass turbid water through a sand and charcoal filter or clean cloth before boiling.`,
    keywords: [
      'water pollution', 'define water pollution', 'identify the causes of water pollution',
      'state the effects of water pollution', 'discuss the measures of reducing water pollution',
      'water treatment', 'eutrophication', 'cholera', 'waterguard', 'boiling water'
    ]
  },
  {
    id: 'sci-stis-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Sexually Transmitted Infections (STIs): Types, Symptoms & Prevention',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Health & Hygiene:
1. Definition of Sexually Transmitted Infections (STIs):
   - STIs are infectious communicable diseases that are spread predominantly through sexual contact (vaginal, oral, or anal) with an infected person, caused by bacteria, viruses, or parasites.

2. Common Sexually Transmitted Infections:
   - Syphilis (caused by Treponema pallidum bacterium).
   - Gonorrhea (caused by Neisseria gonorrhoeae bacterium).
   - Chlamydia (caused by Chlamydia trachomatis bacterium).
   - Chancroid (causes painful genital ulcers).
   - Genital Herpes (caused by Herpes Simplex Virus - HSV).
   - Human Papillomavirus (HPV - causes genital warts and cervical cancer).
   - Trichomoniasis (caused by a protozoan parasite).
   - HIV (Human Immunodeficiency Virus).

3. Signs and Symptoms of STIs:
   - Abnormal, foul-smelling, thick, yellow or green discharge from the penis or vagina.
   - Painful sores, blisters, ulcers, or warts on or around the genitals, anus, or mouth.
   - Burning pain or severe stinging sensation during urination.
   - Swelling, pain, or lumps in the groin area (swollen lymph nodes / mabandi).
   - Severe lower abdominal pain in females.
   - Itching, redness, or rash around the reproductive organs.

4. Prevention and Control of STIs:
   - Sexual Abstinence: Remaining abstinent before marriage is the 100% effective guarantee against sexually transmitted infections for school pupils and adolescents.
   - Mutual Fidelity: Being mutually faithful to one uninfected long-term partner.
   - Condom Use: Correct and consistent use of latex condoms during every sexual encounter.
   - Prompt Medical Treatment: Both sexual partners must seek immediate medical attention and complete the full prescribed course of antibiotics/antivirals to prevent reinfection.
   - Avoid Self-Medication: Never purchase unverified street medications for genital sores.`,
    keywords: [
      'sexually transmitted infections', 'define sexually transmitted infections', 'stis', 'list stis',
      'identify signs and symptoms of stis', 'state stis prevention measures', 'syphilis', 'gonorrhea', 'chlamydia', 'abstinence'
    ]
  },
  {
    id: 'sci-dental-health-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Dental Health: Types of Teeth, Functions, Tooth Decay & Prevention',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Human Body:
1. Types of Teeth in Humans:
   - Incisors: Chisel-shaped front teeth with sharp, flat horizontal edges (8 total: 4 upper, 4 lower).
   - Canines: Sharp, pointed, dagger-like teeth located next to incisors (4 total: 2 upper, 2 lower).
   - Premolars: Broad teeth with two raised cusps on the biting surface (8 total: 4 upper, 4 lower).
   - Molars: Large, broad, flat-topped teeth located at the back of the mouth with multiple roots (12 total in adults, including 4 wisdom teeth).
   - Note on Dentition: Humans have two sets of teeth in their lifetime:
     * Milk / Deciduous Teeth: 20 teeth (appear in infancy, shed during childhood).
     * Permanent Teeth: 32 teeth in a complete adult set.

2. Functions of the Different Types of Teeth:
   - Incisors: Used for biting, cutting, and slicing off pieces of food.
   - Canines: Used for gripping, tearing, and ripping tough fibrous food (especially meat).
   - Premolars: Used for crushing, chewing, and breaking food into smaller particles.
   - Molars: Used for heavy grinding and chewing food into a fine paste ready for swallowing.

3. Causes of Tooth Decay (Dental Caries) and Gum Disease:
   - Sticky sugary foods (sweets, cakes, chocolates, sodas) leave sugary residues on teeth.
   - Bacteria naturally living in the mouth feed on the sugar and form a sticky colorless film called **dental plaque**.
   - Plaque bacteria ferment the sugar, producing strong acids.
   - The acid dissolves the hard outer mineral protective layer of the tooth (**enamel**) and then attacks the underlying softer layer (**dentine**).
   - A hole (cavity) forms; if untreated, bacteria reach the sensitive inner **pulp cavity** containing blood vessels and nerves, causing severe toothache, infection, and abscesses.

4. Methods of Preventing Tooth Decay:
   - Brush teeth thoroughly at least twice daily (in the morning after breakfast and before going to sleep at night) using a soft toothbrush and fluoride toothpaste.
   - Use clean dental floss daily to remove trapped food debris between teeth where toothbrushes cannot reach.
   - Rinse the mouth with clean water after eating snacks or meals.
   - Limit the consumption of sugary foods, candies, and carbonated soft drinks.
   - Eat calcium-rich foods (milk, small fish / kapenta with bones) and crunchy fruits/vegetables (carrots, apples) that stimulate gums and clean teeth naturally.
   - Visit a dental clinic for regular dental check-ups at least once a year.`,
    keywords: [
      'dental', 'name the different types of teeth', 'identify different types of teeth',
      'state the functions of the different teeth', 'describe causes of tooth decay', 'outline methods of preventing teeth decay',
      'incisors', 'canines', 'premolars', 'molars', 'enamel', 'dentine', 'cavities', 'plaque'
    ]
  },
  {
    id: 'sci-air-pollution-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Environmental Hygiene: Air Pollution Causes, Pollutants & Control',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Health:
1. Definition of Air Pollution:
   - Air pollution is the contamination of the atmosphere by harmful gases, dust, smoke, and chemical vapors that pose a threat to the health of humans, animals, plants, and the global environment.

2. Causes of Air Pollution:
   - Burning of fossil fuels (coal, petrol, diesel) in power stations and vehicle engines.
   - Emissions from industrial manufacturing factories, brick kilns, and smelters.
   - Uncontrolled veld fires, bush burning, and clearing farm fields with fire on windy days.
   - Burning domestic waste and plastics in backyard rubbish pits.
   - Indoor burning of firewood, charcoal, and coal braziers (*mbaura*) in poorly ventilated homes.

3. Major Air Pollutants:
   - Carbon Monoxide (CO): Colorless, odorless, deadly toxic gas released from incomplete combustion of fuels.
   - Sulfur Dioxide (SO2): Choking gas released from burning coal at power stations.
   - Nitrogen Oxides (NOx): Released from motor vehicle exhaust pipes and high-temperature furnaces.
   - Particulate Matter (PM10 and PM2.5): Tiny suspended soot, dust, and smoke particles.
   - Carbon Dioxide (CO2): Greenhouse gas driving global warming.
   - Lead Compounds: Released from industrial paints and leaded fuels.

4. Effects of Air Pollution:
   - Health Effects: Irritates eyes, nose, and throat; triggers asthma attacks; causes bronchitis, pneumonia, reduced lung capacity, and lung cancer.
   - Acid Rain: Sulfur dioxide and nitrogen oxides dissolve in rainwater forming sulfuric and nitric acids, which kill fish in lakes, damage crops, and corrode metal roofs and stone statues.
   - Smog and Reduced Visibility: Smoke and fog combine to form smog, causing traffic accidents and flight delays.
   - Climate Change: Buildup of greenhouse gases traps heat in the atmosphere, driving global warming, severe droughts, and violent storms.

5. Measures to Reduce Air Pollution:
   - Use clean, renewable energy sources such as solar power, wind energy, and hydroelectricity instead of burning coal and firewood.
   - Fit catalytic converters on car exhausts and smoke scrubbers/filters on factory chimneys.
   - Regularly service vehicle engines so they burn fuel completely and cleanly.
   - Stop open burning of household plastics and garden refuse; practice composting instead.
   - Plant more trees (afforestation) because green leaves absorb carbon dioxide and release clean oxygen.
   - Construct standard 9-meter fireguards around homesteads and farms to prevent veld fires.`,
    keywords: [
      'air pollution', 'define air pollution', 'identify the causes of air pollution',
      'list air pollutants', 'explain the effects of air pollution', 'outline measures to reduce air pollution',
      'carbon monoxide', 'sulfur dioxide', 'acid rain', 'smog', 'greenhouse gases'
    ]
  },
  {
    id: 'sci-mental-wellness-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Mental Health and Mental Wellness in School and Community',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Mental Wellness:
1. Definition of Mental Wellness:
   - Mental wellness is a state of psychological, emotional, and social well-being in which an individual realizes their own abilities, can cope with the normal stresses of life, works and learns productively, and contributes meaningfully to their family and community.

2. Activities That Promote Mental Wellness:
   - Engaging in physical sports, outdoor games (pada, football, athletics), and aerobic exercise to release mood-boosting endorphins.
   - Getting 8 to 10 hours of restful, uninterrupted sleep every night.
   - Expressing creativity through art, music, storytelling, and traditional dance.
   - Spending quality time socializing with supportive friends, peers, and family members.
   - Practicing mindfulness, quiet reflection, and deep breathing exercises during stressful moments.
   - Confiding in trusted adults, teachers, school counsellors, or church leaders when facing emotional distress or bullying.

3. Importance of Mental Wellness:
   - Enhances concentration, memory retention, problem-solving skills, and academic performance in school.
   - Builds emotional resilience, enabling pupils to bounce back from failure, disappointment, or grief.
   - Fosters self-confidence, empathy, and positive interpersonal relationships (*Unhu/Ubuntu*).
   - Reduces the risk of developing clinical depression, panic attacks, anxiety disorders, and self-harm.
   - Promotes overall physical health by strengthening the body's immune system.`,
    keywords: [
      'mental health', 'define mental wellness', 'identify activities that promote mental wellness',
      'explain the importance of mental wellness', 'demonstrate activities that promote mental wellness',
      'emotional wellness', 'resilience', 'unhu', 'ubuntu'
    ]
  },
  {
    id: 'sci-immunization-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Immunization and Child-Killer Diseases',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Child Health:
1. Definition of Immunization (Vaccination):
   - Immunization is the process whereby a person is protected against an infectious disease through the administration of a vaccine. Vaccines contain dead, weakened, or harmless parts of disease-causing organisms that stimulate the body's immune system to produce protective **antibodies** without causing the actual disease. If the person is exposed to the real pathogen in the future, their immune memory immediately destroys it.

2. The Major Child-Killer Diseases:
   - Measles (Gwirikwiti): Viral illness causing high fever, cough, red eyes, and a full-body rash; can cause fatal pneumonia or permanent blindness.
   - Polio (Poliomyelitis): Viral disease attacking the nervous system, causing sudden irreversible muscle paralysis (usually in the legs) and death from respiratory failure.
   - Tuberculosis (TB): Bacterial lung infection causing chronic cough, blood-stained sputum, and wasting.
   - Diphtheria: Bacterial throat infection forming a thick grey membrane across the windpipe that causes severe breathing obstruction and heart failure.
   - Pertussis (Whooping Cough): Highly contagious bacterial infection causing severe uncontrollable coughing fits followed by a high-pitched "whooping" gasp for breath.
   - Tetanus (Lockjaw): Bacterial infection caused by Clostridium tetani entering wounds from soil, causing painful, violent muscle spasms and locking of the jaw.
   - Other Key Childhood Vaccines in Zimbabwe: Hepatitis B, Haemophilus influenzae type b (Hib), Pneumococcal Conjugate Vaccine (PCV for pneumonia), Rotavirus (prevents severe infant diarrhea), and HPV vaccine (for Grade 5 girls against cervical cancer).

3. Importance of Immunization:
   - Saves millions of children's lives every year by preventing fatal infant diseases.
   - Prevents permanent lifelong physical disabilities (such as paralysis caused by polio).
   - Creates **herd immunity** in the community, protecting vulnerable newborns and sick children who cannot be vaccinated.
   - Monitored and recorded on the child's **Child Health Card** (Road to Health Card) at local clinics.`,
    keywords: [
      'immunization', 'identify child-killer diseases', 'explain immunization',
      'outline the importance of immunisation', 'measles', 'polio', 'tuberculosis',
      'diphtheria', 'tetanus', 'whooping cough', 'vaccines', 'antibodies'
    ]
  },
  {
    id: 'sci-internal-body-parts-detail',
    strand: 'Environmental Hygiene & Health',
    topic: 'Internal Body Parts: Location, Identification & Functions',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Human Body:
1. Major Internal Body Parts and Their Locations:
   - Brain: Located inside the cranium (skull) in the head.
   - Heart: Located in the center of the chest cavity (thorax) between the lungs, tilted slightly to the left.
   - Lungs: Paired spongy organs located inside the chest cavity, protected by the rib cage.
   - Stomach: Located in the upper left section of the abdominal cavity below the diaphragm.
   - Liver: The largest internal organ, located in the upper right section of the abdominal cavity, directly below the diaphragm.
   - Kidneys: Pair of bean-shaped organs located in the back of the abdomen on either side of the spine, below the ribcage.
   - Skeleton: Framework of 206 bones located throughout the entire body beneath muscles and skin.

2. Functions of Internal Body Parts:
   - Brain: The central control center of the nervous system; controls voluntary thoughts, speech, and movement; regulates involuntary bodily functions (heart rate, breathing, digestion); processes sensory information (sight, hearing, touch, taste, smell).
   - Heart: Continuously pumps blood throughout the body to supply tissues with oxygen and nutrients and remove metabolic wastes.
   - Lungs: Takes in oxygen from the air during inhalation and expels carbon dioxide and water vapor during exhalation (gas exchange across alveoli).
   - Stomach: Acts as a food storage reservoir; churns food with gastric acid and digestive enzymes to begin protein digestion.
   - Liver: Produces bile to break down (emulsify) dietary fats; detoxifies harmful chemicals and drugs; stores excess glucose as glycogen; synthesizes blood proteins.
   - Kidneys: Filter waste products (especially toxic urea and excess mineral salts) from the blood; regulate water balance (osmoregulation) and produce urine.
   - Skeleton:
     * Provides structural shape and support for the body.
     * Protects vital delicate organs (skull protects brain, ribcage protects heart and lungs, vertebrae protect the spinal cord).
     * Works with attached skeletal muscles to produce movement.
     * Produces red blood cells and white blood cells inside bone marrow.
     * Stores essential minerals such as calcium and phosphorus.`,
    keywords: [
      'internal body parts', 'state the internal body parts', 'identify internal body parts',
      'label internal body parts', 'describe the location of internal body parts',
      'explain the functions of internal body parts', 'brain', 'heart', 'lungs', 'stomach', 'liver', 'kidneys', 'skeleton'
    ]
  },
  {
    id: 'sci-environmental-waste-management',
    strand: 'Environmental Hygiene & Health',
    topic: 'Environmental Hygiene: Community Waste Sources, Impacts & Disposal',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Health:
1. Sources of Environmental Waste in the Community:
   - Domestic / Household Waste: Vegetable and food peelings, plastic carrier bags, food packaging, tin cans, glass bottles, old clothing, wood ash.
   - Commercial Waste: Cardboard boxes, paper, packaging materials from shops, markets, and supermarkets.
   - Agricultural Waste: Crop stalks, weeds, animal manure, empty pesticide containers, fertilizer sacks.
   - Industrial and Mining Waste: Scrap metal, factory chemical by-products, gold mine tailings, discarded engine oil.
   - Clinical / Medical Waste: Used syringes, bandages, expired medicines from local clinics and hospitals.

2. Impacts of Improper Waste Disposal in the Community:
   - Discarded plastics and litter block storm drains, causing localized flash flooding during the rainy season.
   - Piles of uncollected garbage attract and breed disease vectors such as houseflies, rats, and mosquitoes, spreading cholera, typhoid, and dysentery.
   - Grazing domestic animals (cattle, goats, sheep) ingest plastic bags, leading to fatal digestive blockages.
   - Rotting waste produces foul, nauseating odors and releases greenhouse gases like methane.
   - Sharp glass, open tin cans, and rusty nails cause serious physical injuries and tetanus infections.

3. Demonstrating Proper Waste Disposal in the Community:
   - The 3Rs Waste Hierarchy:
     * Reduce: Minimize the amount of waste generated (e.g. carry reusable woven shopping bags instead of collecting plastic carrier bags).
     * Reuse: Use sturdy containers, jars, and bottles multiple times before discarding.
     * Recycle: Separate paper, plastics, glass, and metal so they can be processed into new manufactured goods.
   - Composting: Dig compost pits to turn organic waste (food scraps, dry leaves, cattle dung) into rich organic fertilizer for garden crops.
   - Sanitary Pit Disposal: Dispose of non-recyclable household waste in designated sanitary refuse pits and cover regularly with soil to prevent fly breeding.
   - Community Cleanup Campaigns: Participate actively in national cleanup days (held on the first Friday of every month in Zimbabwe) to keep streets, schoolgrounds, and public places spotless.`,
    keywords: [
      'environmental waste', 'sources of environmental waste in the community',
      'recognise the impact of waste in the community', 'demonstrate proper waste disposal in the community',
      '3Rs', 'reduce', 'reuse', 'recycle', 'composting', 'refuse pit'
    ]
  },
  {
    id: 'sci-waterborne-diseases-sss',
    strand: 'Environmental Hygiene & Health',
    topic: 'Waterborne Diseases and Preparation of Sugar-Salt Solution (SSS)',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Health & Diseases:
1. Definition of Waterborne Diseases:
   - Waterborne diseases are illnesses caused by microscopic pathogenic microorganisms (bacteria, viruses, or parasites) that are transmitted to humans through drinking or coming into contact with contaminated water.

2. Major Waterborne Diseases in Zimbabwe:
   - Cholera: Caused by Vibrio cholerae bacteria. Causes massive painless watery diarrhea ("rice-water stools") and vomiting, leading to fatal dehydration in hours if untreated.
   - Typhoid Fever: Caused by Salmonella typhi bacteria. Causes prolonged high fever, severe headache, dry cough, stomach pain, constipation or diarrhea.
   - Bilharzia (Schistosomiasis): Caused by parasitic blood flukes (Schistosoma). Transmitted when larvae swimming in freshwater rivers bore through the skin of people swimming or wading; causes blood in urine (hematuria) or stool, abdominal pain, and liver damage.
   - Dysentery (Bacterial & Amoebic): Severe inflammation of the intestines causing frequent stools mixed with blood and mucus, accompanied by painful abdominal cramps.

3. Ways of Preventing Waterborne Diseases:
   - Boil all drinking water for at least 1 minute or treat with water purification tablets (WaterGuard).
   - Construct and use ventilated improved pit (Blair) latrines situated at least 30 meters away from water sources.
   - Wash hands thoroughly with clean running water and soap before handling food and after visiting the toilet.
   - Avoid swimming, washing, or wading barefoot in slow-moving rivers and dams infested with freshwater snails (to prevent bilharzia).
   - Wash raw fruits and vegetables with clean safe water before eating.

4. Preparation of Sugar-Salt Solution (SSS / Home-made ORS):
   - Purpose: Oral Rehydration Solution (SSS) is an emergency first-aid home treatment that replaces lost water and essential mineral electrolytes in patients suffering from diarrhea and vomiting, preventing deadly dehydration before reaching a clinic.
   - Step-by-Step Recipe:
     * Step 1: Wash hands thoroughly with clean running water and soap.
     * Step 2: Measure **1 litre** (approx. 4 cups) of clean, safe water (boiled and cooled) into a clean container.
     * Step 3: Add **6 level teaspoons of sugar** (provides instant glucose energy and aids sodium absorption in the gut).
     * Step 4: Add **half (½) level teaspoon of salt** (restores essential sodium and chloride electrolytes lost in stool).
     * Step 5: Stir the mixture thoroughly until both sugar and salt dissolve completely.
     * Administration: Give the solution in small frequent sips to the sick child or adult after every loose stool. Prepare a fresh solution every 24 hours.`,
    keywords: [
      'waterborne diseases', 'state various water diseases', 'discuss ways of preventing water borne diseases',
      'prepare salt and sugar solution', 'sss', 'sugar salt solution', 'ors', 'cholera', 'typhoid', 'bilharzia', 'dehydration'
    ]
  },

  // =========================================================================
  // 2. FOOD AND NUTRITION
  // =========================================================================
  {
    id: 'sci-food-sources-nutrients',
    strand: 'Food and Nutrition',
    topic: 'Food Sources, Nutrient Classification and Importance of Nutrients',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Food and Nutrition:
1. Sources of Food and Classification:
   - Plant Origin Sources:
     * Cereal Grains: Maize, sorghum (mapfunde), finger millet (rapoko/zviyo), pearl millet (mhunga), wheat, rice.
     * Legumes (Pulses): Groundnuts (nzungu), roundnuts (nyimo), cowpeas (nyemba), beans, soya beans.
     * Vegetables: Cabbage, spinach, rape, covo, tsunga, pumpkin leaves (muboora), wild spinach (derere), okra.
     * Fruits: Oranges, mangoes, bananas, guavas, wild fruits (mazhanje, matamba, masawu, mauyu).
     * Tubers & Roots: Sweet potatoes (mbambaira), cassava, yams, potatoes.
   - Animal Origin Sources:
     * Meat: Beef, goat meat, mutton, pork.
     * Poultry: Chicken, guinea fowl, turkey, ducks.
     * Dairy & Eggs: Fresh milk, sour milk (mukaka wakakora), cheese, chicken eggs.
     * Aquatic: Fish (bream, kapenta/matemba).
     * Edible Insects: Mopane worms (madora/macimbi), winged termites (ishwa), crickets (makurwe), stinkbugs (harurwa).

2. The Six Essential Food Nutrients and Their Functions:
   - Carbohydrates:
     * Function: The body's primary and quickest source of energy for daily muscular work, sports, and body warmth.
     * Sources: Sadza, bread, potatoes, rice, small grains (sorghum, rapoko).
   - Proteins:
     * Function: Body-building nutrient required for growth, repair of worn-out cells/tissues, and production of enzymes, hormones, and antibodies.
     * Sources: Meat, beans, eggs, milk, fish, groundnuts, mopane worms (madora).
   - Fats and Oils:
     * Function: Provides concentrated energy (twice as much energy as carbohydrates), insulates the body against cold, and protects delicate internal organs.
     * Sources: Cooking oil, butter, groundnut butter (dovi), avocados, animal fat.
   - Vitamins:
     * Function: Protective foods required in small amounts to maintain health and fight off diseases.
     * Vitamin A: Healthy vision and skin (carrots, pumpkins, mangoes, liver).
     * Vitamin B: Energy release and nerve health (whole grains, beans, yeast).
     * Vitamin C: Healthy gums, skin, and immune resistance (oranges, guavas, lemons).
     * Vitamin D: Strong bones and teeth (sunlight, egg yolk, fish liver oil).
   - Mineral Salts:
     * Calcium & Phosphorus: Strong bones and teeth (milk, small fish eaten with bones / matemba).
     * Iron: Formation of hemoglobin in red blood cells to transport oxygen (liver, red meat, green leafy vegetables).
     * Iodine: Proper thyroid function to prevent goitre (iodized table salt).
   - Dietary Fibre (Roughage):
     * Function: Adds bulk to food, aids peristalsis in the intestines, and prevents constipation.
     * Sources: Whole-grain maize meal (mugayiwa), fruits with peels, vegetables.
   - Water:
     * Function: Transports nutrients and waste products, regulates body temperature through sweating, and acts as a solvent for bodily biochemical reactions.`,
    keywords: [
      'sources of food', 'classify food according to plant and animal origin', 'list food nutrients',
      'group food according to their nutrients', 'discuss the importance of food nutrients',
      'carbohydrates', 'proteins', 'fats', 'vitamins', 'minerals', 'fibre', 'water'
    ]
  },
  {
    id: 'sci-food-preparation-indigenous-balanced-diet',
    strand: 'Food and Nutrition',
    topic: 'Food Preparation, Indigenous Meals and Balanced Diet',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Food Preparation:
1. Definition of a Balanced Diet:
   - A balanced diet is a diet that contains all the essential nutrients (carbohydrates, proteins, fats, vitamins, minerals, dietary fibre, and water) in the correct and adequate proportions needed for healthy growth, daily energy, and disease prevention.

2. Components of a Balanced Diet in an Indigenous Zimbabwean Meal:
   - Energy-Giving Component: Sadza rezviyo (finger millet) or sadza remhunga (pearl millet) rich in complex carbohydrates and dietary fibre.
   - Body-Building Component: Stewed free-range indigenous chicken (huku yechibhoyi), roasted groundnuts (nzungu), dried beef with peanut butter (chimukuyu chine dovi), or stewed cowpeas (nyemba).
   - Protective Component: Cooked pumpkin leaves (muboora), wild cleome (nyevhe/tsunga), or dried leafy greens (mufushwa) rich in vitamins A and C and iron.
   - Health Benefits of Indigenous Foods:
     * Small grains (sorghum, rapoko) have a low glycemic index, preventing and managing diabetes and hypertension.
     * High dietary fibre content prevents constipation, colon cancer, and obesity.
     * Rich in natural minerals (iron and calcium) that prevent anemia and bone weakness.
     * Organic, free from harmful chemical preservatives and artificial flavorings.

3. Indigenous vs Modern Cooking Methods and Utensils:
   - Cooking Methods:
     * Boiling: Cooking food in boiling water (e.g. preparing sadza, boiling cowpeas / nyemba).
     * Stewing: Slow cooking in a small amount of liquid with lid closed (e.g. beef or chicken stew).
     * Roasting: Cooking food over hot charcoal or dry pan without oil (e.g. roasting maize cobs or groundnuts).
     * Steaming: Cooking food using rising steam (e.g. steaming pumpkin or sweet potatoes).
   - Traditional Utensils:
     * Clay pots (Hari): Hari yehuswa (for beer), Tsambakonzi (for cooking sadza), Rongo (for carrying water).
     * Wooden Cooking Sticks: Mugoti (flat wooden stick for stirring sadza), Musika (for whisking milk or soup).
     * Grinding Stones: Guwo and Huyo (flat stone and rounded hand stone for grinding grain and groundnuts into peanut butter).
     * Woven Baskets: Rusero (winnowing basket for separating chaff from grain), Dengu (large storage basket).`,
    keywords: [
      'food preparation', 'list different indigenous and modern meals', 'name various food ingredients',
      'describe how to prepare a meal', 'balanced diet', 'components of a balanced diet in an indigenous meal',
      'health benefits of indigenous foods', 'sadza', 'mufushwa', 'dovi', 'hari', 'mugoti'
    ]
  },
  {
    id: 'sci-nutrient-deficiency-excess',
    strand: 'Food and Nutrition',
    topic: 'Nutrient Deficiency and Nutrient Excess: Diseases & Prevention',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Nutrition:
1. Definition of Nutrient Deficiency:
   - Nutrient deficiency is a state of health that occurs when the body does not receive or absorb an adequate amount of an essential nutrient over an extended period.

2. Major Nutrient Deficiency Diseases:
   - Kwashiorkor: Caused by severe lack of **protein** in the diet.
     * Signs: Oedema (swollen belly, puffy feet and face), thin reddish-brown brittle hair that pulls out easily, peeling flaky skin ("flaky paint dermatitis"), irritability, misery.
     * Cure: Feed with protein-rich foods (eggs, milk, beans, kapenta, beef, peanut butter porridge / nhopi).
   - Marasmus: Caused by severe total starvation (lack of **both energy/carbohydrates and proteins**).
     * Signs: Extreme muscle wasting, "skin and bones" appearance, wrinkled "old person's face", ribs prominently visible, ravenously hungry and alert.
     * Cure: Gradually reintroduce balanced, energy-dense foods and fluids.
   - Scurvy: Caused by deficiency of **Vitamin C**.
     * Signs: Bleeding swollen gums, loose teeth, slow-healing wounds, joint pain.
     * Cure: Eat fresh citrus fruits (oranges, lemons, guavas) and raw tomatoes.
   - Rickets: Caused by deficiency of **Vitamin D or Calcium**.
     * Signs: Soft weak bones, bow-legs (bandy legs), knock-knees, pigeon chest in growing children.
     * Cure: Exposure to early morning sunlight, drinking milk, eating eggs and fish.
   - Goitre: Caused by deficiency of **Iodine**.
     * Signs: Swelling of the thyroid gland at the front of the neck, fatigue, mental sluggishness.
     * Cure: Use iodized table salt and consume seafood.
   - Anaemia: Caused by lack of **Iron**.
     * Signs: Pale inner eyelids, pale tongue and fingernails, constant fatigue, shortness of breath, dizziness.
     * Cure: Eat liver, red meat, and dark green leafy vegetables.
   - Night Blindness: Caused by lack of **Vitamin A**.
     * Signs: Difficulty seeing in dim light or at dusk.
     * Cure: Eat carrots, pumpkins, yellow sweet potatoes, liver, and mangoes.

3. Nutrient Excess (Overnutrition) and Its Effects:
   - Definition: A condition resulting from consuming excessive amounts of certain nutrients (especially refined carbohydrates, saturated fats, and sodium) beyond what the body requires.
   - Effects of Nutrient Excess:
     * Excess Fats and Carbohydrates: Leads to **Obesity**, high blood cholesterol, fatty liver, and increased risk of **Type 2 Diabetes** and heart attacks.
     * Excess Sodium (Table Salt): Causes fluid retention and chronic **Hypertension (High Blood Pressure)**, leading to strokes and kidney failure.
     * Excess Protein: Places excessive metabolic strain on the kidneys and liver to excrete urea.
   - Importance of Nutrient Moderation: Eating diverse, moderate portions of natural foods ensures healthy energy balance, prevents chronic metabolic diseases, and promotes longevity.`,
    keywords: [
      'nutrient deficiency', 'nutrient excess', 'kwashiorkor', 'marasmus', 'scurvy',
      'rickets', 'goitre', 'anaemia', 'night blindness', 'obesity', 'nutrient moderation', 'deficiency diseases'
    ]
  },
  {
    id: 'sci-food-preservation-storage',
    strand: 'Food and Nutrition',
    topic: 'Food Preservation and Storage: Traditional and Modern Methods',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Food Preservation:
1. Definition of Food Preservation:
   - Food preservation is the process of treating and handling food to stop, slow down, or prevent spoilage, decay, and loss of nutritional value caused by microorganisms and enzymes.

2. Importance of Food Preservation:
   - Prevents the growth of food-spoiling and disease-causing bacteria, molds, and yeasts.
   - Ensures food availability and security during dry seasons, droughts, and winter months.
   - Reduces food waste during harvest gluts.
   - Allows long-distance transport and trade of perishable foods.

3. Causes of Food Spoilage:
   - Microorganisms: Bacteria, molds, and yeasts multiplying on food.
   - Natural Food Enzymes: Chemical substances in food that cause it to over-ripen and rot.
   - Moisture and Heat: Warm, moist conditions accelerate microbial growth.
   - Pests: Weevils, rodents, and insects infesting stored grains.

4. Methods of Food Preservation:
   - Traditional Indigenous Methods:
     * Sun-Drying: Removing moisture so microorganisms cannot grow. Used for vegetables (mufushwa) and meat strips (chimukuyu / biltong).
     * Smoking: Meat and fish are hung over wood smoke; heat dries the food while smoke chemicals act as natural antimicrobials.
     * Salting: High salt concentration draws water out of food and bacterial cells by **osmosis**, killing bacteria.
     * Traditional Granaries (Dura / Isiphala): Raised wooden storage huts treated with wood ash to store maize, sorghum, and millet free from weevils and moisture.
   - Modern Methods:
     * Refrigeration & Freezing: Low temperatures (below 5°C in fridge, -18°C in freezer) slow down or completely halt bacterial activity.
     * Canning: Food is sealed in airtight tin cans and heated to kill all microorganisms and spores.
     * Pasteurization: Heating liquids (such as milk) to 72°C for 15 seconds followed by rapid cooling to kill pathogens without destroying flavor.
     * Chemical Preservatives: Adding safe preservatives such as vinegar, sodium benzoate, or citric acid to inhibit microbial growth.
     * Vacuum Packaging: Removing all air from plastic pouches before sealing, starving aerobic bacteria and fungi of oxygen.`,
    keywords: [
      'food preservation', 'define food preservation', 'state the importance of food preservation',
      'methods of preserving food in the home', 'food storage', 'sun drying', 'mufushwa', 'chimukuyu',
      'salting', 'canning', 'freezing', 'pasteurization', 'dura'
    ]
  },

  // =========================================================================
  // 3. CROPS, PLANTS AND ANIMALS
  // =========================================================================
  {
    id: 'sci-photosynthesis-starch-test',
    strand: 'Crops, Plants and Animals',
    topic: 'Photosynthesis and Testing a Green Leaf for Starch',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Plant Science:
1. Definition and Process of Photosynthesis:
   - Photosynthesis is the biochemical process by which green plants manufacture their own food (glucose) using carbon dioxide and water in the presence of sunlight trapped by chlorophyll.
   - Word Equation:
     Carbon Dioxide + Water --(Sunlight & Chlorophyll)--> Glucose + Oxygen
   - Inputs (Raw Materials):
     * Water: Absorbed from soil by root hair cells through osmosis and transported through xylem vessels.
     * Carbon Dioxide: Taken in from the atmosphere through microscopic leaf pores called **stomata**.
   - Conditions Necessary:
     * Sunlight: The light energy source.
     * Chlorophyll: The green pigment in chloroplasts that absorbs solar energy.
   - Outputs (Products):
     * Glucose: Sugar used immediately for plant respiration or converted into insoluble **starch** for storage.
     * Oxygen: By-product released into the atmosphere through stomata for living organisms to breathe.

2. Step-by-Step Experiment: Testing a Green Leaf for Starch:
   - Step 1: Pluck a green leaf from a plant that has been exposed to sunlight for several hours.
   - Step 2: **Boil the leaf in water for 1 to 2 minutes** to kill the leaf cells and break down cell membranes.
   - Step 3: Turn off the Bunsen burner flame! Place the leaf into a boiling tube containing **methylated spirit (alcohol)** and stand the tube in a beaker of hot water (a water bath).
     * Reason: Alcohol dissolves and removes the green **chlorophyll** pigment, making the leaf pale white so color changes can be seen clearly. (A water bath is used because alcohol is highly flammable).
   - Step 4: Dip the pale brittle leaf back into hot water for a few seconds to soften it.
   - Step 5: Spread the leaf flat on a white tile and add a few drops of yellow-brown **iodine solution**.
   - Observation and Conclusion:
     * If starch is present, the leaf turns **blue-black**.
     * If starch is absent, the iodine remains **yellow-brown**.
     * Conclusion: Blue-black coloration proves that the leaf carried out photosynthesis and stored glucose as starch.`,
    keywords: [
      'photosynthesis', 'describe the process of photosynthesis', 'test a leaf for starch',
      'factors necessary for photosynthesis to take place', 'chlorophyll', 'stomata', 'iodine solution',
      'blue-black', 'starch test', 'water bath'
    ]
  },
  {
    id: 'sci-germination-conditions-stages',
    strand: 'Crops, Plants and Animals',
    topic: 'Seed Germination: Conditions, Stages and Experiments',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Plant Growth:
1. Definition of Germination:
   - Germination is the process by which a dormant seed begins to sprout and develop into a young seedling when provided with suitable environmental conditions.

2. Essential Conditions Necessary for Germination (Remember WOW):
   - **Water (Moisture):** Softens the hard outer seed coat (testa) and activates enzymes that break down stored food in the cotyledons.
   - **Oxygen (Air):** Essential for cellular respiration to release energy for cell division and growth.
   - **Warmth (Suitable Temperature):** Activates plant enzymes; optimal temperature for most seeds is 20°C to 30°C (seeds do not germinate in freezing cold).
   - *Note:* Soil and sunlight are **NOT** required for germination to begin (seeds can germinate on moist cotton wool in the dark because they live off stored food in their cotyledons).

3. Stages of Seed Germination:
   - Stage 1: Imbibition - The seed absorbs water through a tiny pore called the micropyle, swelling and splitting the seed coat (testa).
   - Stage 2: The **Radicle** (embryonic root) emerges first and grows downward into the soil to absorb water and anchor the seedling.
   - Stage 3: The **Plumule** (embryonic shoot) emerges next and grows upward toward light to develop the first true green leaves.
   - Types of Germination:
     * Epigeal Germination: Cotyledons are pushed above the ground (e.g. bean seeds).
     * Hypogeal Germination: Cotyledons remain below the ground (e.g. maize seeds).

4. Experiment to Prove Conditions for Germination:
   - Tube A (Complete conditions): Moist cotton wool, air, warm room -> Seeds germinate successfully.
   - Tube B (No water): Dry cotton wool, air, warm room -> No germination (proves water is needed).
   - Tube C (No oxygen): Seeds in boiled cooled water covered with a layer of cooking oil -> No germination (proves oxygen is needed).
   - Tube D (No warmth): Moist cotton wool, air, placed inside a refrigerator at 2°C -> No germination (proves warmth is needed).`,
    keywords: [
      'germination', 'define germination', 'conditions necessary for germination',
      'describe germination stages', 'carry out an experiment on seed germination',
      'radicle', 'plumule', 'cotyledon', 'water oxygen warmth', 'epigeal', 'hypogeal'
    ]
  },
  {
    id: 'sci-plant-nutrients-deficiency',
    strand: 'Crops, Plants and Animals',
    topic: 'Plant Nutrients, Deficiency Signs and Remedies (NPK)',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Agriculture:
1. Essential Plant Nutrients:
   - Plants absorb dissolved mineral nutrients from the soil through root hairs.
   - Major Nutrients (Macronutrients - NPK):
     * Nitrogen (N): Promotes vegetative growth, leaf and stem development, and gives leaves their dark green color (component of chlorophyll and proteins).
     * Phosphorus (P): Promotes early root development, flowering, seed formation, and energy transfer.
     * Potassium (K): Strengthens plant stems, improves disease and drought resistance, and regulates stomata.
   - Secondary and Micronutrients: Calcium (cell wall strength), Magnesium (core element of chlorophyll), Sulfur, Iron, Zinc, Boron.

2. Plant Nutrient Deficiency Signs:
   - Nitrogen Deficiency: Stunted plant growth; leaves turn pale yellow starting from older lower leaves (**chlorosis**); thin, weak stems.
   - Phosphorus Deficiency: Poor root system; purplish or reddish discoloration along leaf veins and edges; delayed maturity.
   - Potassium Deficiency: Premature yellowing and browning/scorching of leaf margins and tips ("leaf burn"); weak stems prone to falling over (**lodging**).

3. Ways to Curb Plant Nutrient Deficiency:
   - Apply well-rotted livestock manure (cattle, poultry, goat dung) or organic compost to restore natural humus and nutrients.
   - Practice **Crop Rotation** with leguminous crops (beans, cowpeas, groundnuts) whose root nodules harbor Rhizobium bacteria that fix atmospheric nitrogen into the soil.
   - Apply balanced synthetic chemical fertilizers (such as Compound D at planting for basal nutrition, and Ammonium Nitrate - AN for nitrogen top-dressing).
   - Practice agroforestry by planting nitrogen-fixing trees (e.g. Acacia / Faidherbia albida) in crop fields.`,
    keywords: [
      'plant nutrients', 'plant nutrient deficiency', 'npk', 'nitrogen', 'phosphorus',
      'potassium', 'chlorosis', 'stunted growth', 'compost', 'rhizobium', 'crop rotation'
    ]
  },
  {
    id: 'sci-predator-prey-food-web',
    strand: 'Crops, Plants and Animals',
    topic: 'Predator-Prey Relationships, Food Chains and Food Webs',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Ecosystems:
1. Predator-Prey Relationships:
   - Definition: A biological interaction where one organism, the **predator**, hunts, kills, and eats another organism, the **prey**.
   - Examples: Lion (predator) and Zebra (prey); Eagle (predator) and Mouse (prey); Frog (predator) and Locust (prey).
   - Adaptations of Predators: Sharp eyesight, acute hearing, powerful claws/talons, sharp teeth (canines), stealth camouflage, and fast running speeds.
   - Adaptations of Prey: Eyes on the sides of the head for wide panoramic vision, keen sense of smell, protective camouflage (spots/stripes), speed and agility, living in herds for group safety, defensive thorns or horns.
   - Importance of Balance in an Ecosystem:
     * Predators prevent prey populations from exploding and overgrazing pasture.
     * Keeps prey herds healthy by hunting the old, weak, and sick individuals.
     * If predators are eliminated, prey overpopulate, exhaust vegetation, and experience mass starvation.

2. Food Chains and Food Webs:
   - Food Chain: A linear sequence showing how energy passes from one organism to another:
     * Producer (Grass) -> Primary Consumer (Grasshopper) -> Secondary Consumer (Frog) -> Tertiary Consumer (Snake) -> Apex Predator (Eagle).
   - Food Web: A complex network of interconnected food chains representing the true feeding relationships within an ecosystem.
   - Trophic Levels:
     * Producers (Autotrophs): Green plants that manufacture food by photosynthesis using sunlight.
     * Primary Consumers: Herbivores that eat plants (e.g. impala, cattle, caterpillars).
     * Secondary Consumers: Carnivores or omnivores that eat herbivores.
     * Decomposers (Fungi and Bacteria): Break down dead plant and animal matter, recycling nutrients back into the soil.`,
    keywords: [
      'predator-prey relationship', 'food web', 'food chain', 'ecological pyramid',
      'producers', 'consumers', 'herbivores', 'carnivores', 'ecosystem balance', 'decomposers'
    ]
  },
  {
    id: 'sci-animal-reproduction-gestation',
    strand: 'Crops, Plants and Animals',
    topic: 'Animal Reproduction and Comparative Gestation Periods',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Animal Science:
1. Animal Reproduction:
   - Mating: The physical union of male and female animals of the same species during which the male introduces sperm into the female's reproductive tract to fertilize her ova.
   - Fertilization: The fusion of the nucleus of a male gamete (sperm) with the nucleus of a female gamete (egg/ovum) to form a single-celled **zygote**.
   - Definition of Gestation Period: The time period from successful fertilization and conception to the birth of the offspring (parturition).

2. Comparative Gestation Periods for Domestic Animals and Humans:
   - **Cow (Cattle):** Approximately **9 months / 280 to 283 days** (similar to humans).
   - **Sheep (Ewe):** Approximately **5 months / 147 to 150 days**.
   - **Goat (Doe):** Approximately **5 months / 150 days**.
   - **Pig (Sow):** Remember the easy rule: **3 months, 3 weeks, and 3 days (approx. 114 to 115 days)**.
   - **Horse (Mare):** Approximately **11 months / 336 to 340 days**.
   - **Donkey:** Approximately **12 months / 365 days**.
   - **Dog (Bitch):** Approximately **2 months / 63 days**.
   - **Cat (Queen):** Approximately **2 months / 63 to 65 days**.
   - **Rabbit (Doe):** Approximately **1 month / 30 to 32 days**.
   - **Human:** Approximately **9 calendar months / 40 weeks / 280 days**.`,
    keywords: [
      'animal reproduction', 'gestation period', 'compare the gestation periods for domestic animals',
      'mating', 'cow gestation', 'pig gestation', 'sheep gestation', 'goat gestation', 'dog gestation'
    ]
  },
  {
    id: 'sci-crops-rotation-pests',
    strand: 'Crops, Plants and Animals',
    topic: 'Crops, Crop Rotation Principles and Pest Management',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Crop Science:
1. Definition and Principles of Crop Rotation:
   - Crop rotation is the practice of growing a planned sequence of different crop families on the same piece of land across consecutive seasons.
   - Core Principles of 4-Cycle Crop Rotation:
     * Year 1: Legumes (Beans, cowpeas, groundnuts) -> Fix atmospheric nitrogen into the soil using root nodule bacteria.
     * Year 2: Leaf Crops (Cabbage, rape, spinach, maize) -> Heavy nitrogen feeders that utilize the nitrogen fixed by legumes.
     * Year 3: Fruit Crops (Tomatoes, peppers, pumpkins) -> Require moderate nutrients and high potassium/phosphorus.
     * Year 4: Root Crops (Carrots, beetroot, sweet potatoes) -> Deep roots draw nutrients from deep in the soil and break up hard soil pans; do not require heavy nitrogen.
   - Benefits: Controls crop-specific pests and soil diseases, improves soil structure, balances soil nutrient extraction, prevents soil exhaustion.

2. Common Crop Pests in Zimbabwe:
   - Maize Stalk Borer: Caterpillars bore into maize stems and cobs, causing "dead heart" and snapped stems.
   - Fall Armyworm: Aggressive caterpillars that destroy leaves, tassels, and ears of maize crops.
   - Aphids: Tiny sap-sucking insects that transmit plant viruses and secrete sticky honeydew that fosters black sooty mold.
   - Red Spider Mite: Attacks tomatoes and beans, causing yellow mottling on leaves.
   - Cutworms: Caterpillars that cut down young crop seedlings at ground level at night.

3. Methods of Controlling Pests (Integrated Pest Management):
   - Cultural Control: Crop rotation, early planting, handpicking large pests, removing and burning crop residues after harvest.
   - Biological Control: Introducing natural predators (e.g. ladybird beetles eating aphids, birds eating caterpillars).
   - Chemical Control: Careful, targeted application of approved pesticides (e.g. carbaryl, dipterex) using protective knapsack sprayers.`,
    keywords: [
      'crop rotation', 'define crop rotation', 'name pests that affect crops',
      'explain ways of controlling pests', 'stalk borer', 'armyworm', 'aphids', 'ipm', 'legumes'
    ]
  },
  {
    id: 'sci-vertebrates-invertebrates',
    strand: 'Crops, Plants and Animals',
    topic: 'Vertebrates and Invertebrates: Classification, Characteristics & Habitats',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Animal Diversity:
1. Distinction Between Vertebrates and Invertebrates:
   - Vertebrates: Animals that possess a backbone / vertebral column and an internal bony skeleton.
   - Invertebrates: Animals that DO NOT have a backbone (many have a hard outer protective shell called an exoskeleton).

2. Five Classes of Vertebrates:
   - Mammals: Have hair/fur on skin; warm-blooded (endothermic); give birth to live young (viviparous); mothers nurse young with milk from mammary glands (e.g. humans, cows, lions, whales, bats).
   - Birds: Bodies covered with feathers; have beaks/bills and wings; lay hard-shelled eggs; warm-blooded (e.g. eagles, chickens, ostriches).
   - Reptiles: Cold-blooded (ectothermic); dry skin covered with horny scales; breathe through lungs; lay leathery-shelled eggs on land (e.g. snakes, crocodiles, lizards, tortoises).
   - Amphibians: Cold-blooded; smooth moist skin with no scales; live dual lives (part in water with gills as tadpoles, part on land with lungs/skin as adults); lay jelly-coated eggs in water (e.g. frogs, toads, salamanders).
   - Fish: Cold-blooded; live entirely in water; breathe using **gills**; have fins for swimming and balance; bodies usually covered in wet slimy scales; lay eggs in water (e.g. bream, trout, kapenta).

3. Major Groups of Invertebrates:
   - Insects: Body divided into 3 parts (head, thorax, abdomen); 3 pairs of jointed legs (6 legs); 1 pair of antennae; usually 1 or 2 pairs of wings (e.g. housefly, mosquito, grasshopper, bee).
   - Arachnids: Body divided into 2 parts (cephalothorax and abdomen); 4 pairs of legs (8 legs); no wings; no antennae (e.g. spiders, scorpions, ticks).
   - Molluscs: Soft-bodied animals, often protected by a hard calcium shell; have a muscular foot (e.g. snails, slugs, clams).
   - Annelids (Segmented Worms): Bodies divided into ring-like segments; no legs; moist skin (e.g. earthworms).`,
    keywords: [
      'vertebrates and invertebrates', 'classify vertebrates into five groups',
      'describe the characteristics of vertebrates and invertebrates', 'mammals', 'birds',
      'reptiles', 'amphibians', 'fish', 'insects', 'arachnids', 'exoskeleton', 'backbone'
    ]
  },

  // =========================================================================
  // 4. ENVIRONMENT
  // =========================================================================
  {
    id: 'sci-weather-climate-instruments',
    strand: 'Environment',
    topic: 'Weather and Climate: Elements, Instruments and Forecasting',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Weather and Climate:
1. Difference Between Weather and Climate:
   - Weather: The day-to-day atmospheric conditions of a specific place over a short period of time (hours or days).
   - Climate: The average weather pattern of a region recorded over a long period of time (at least 30 to 35 years).

2. Weather Elements and Their Measuring Instruments:
   - Temperature: Measured using a **Thermometer** (Six's Maximum and Minimum Thermometer) kept inside a **Stevenson Screen**; units are degrees Celsius (°C).
   - Rainfall: Measured using a **Rain Gauge** (placed in an open space away from trees/buildings); units are millimeters (mm).
   - Wind Direction: Indicated by a **Wind Vane**; points toward the direction the wind is blowing FROM (e.g. Easterly wind).
   - Wind Speed: Measured using a rotating cup **Anemometer**; units are km/h or knots.
   - Atmospheric Pressure: Measured using a **Barometer** (Mercury or Aneroid barometer); units are millibars (mb) or hectopascals (hPa).
   - Humidity (Moisture in Air): Measured using a **Hygrometer** (Wet and Dry Bulb Thermometer); units are percentage (%).
   - Sunshine: Measured using a **Campbell-Stokes Sunshine Recorder**; units are hours per day.

3. The Stevenson Screen:
   - A white-painted wooden louvered box mounted on legs 1.2 meters above the ground.
   - White paint reflects direct solar heat; louvered sides allow free air circulation; 1.2m height prevents ground heat from affecting readings.

4. Weather Forecasting and Importance:
   - Definition: Predicting future atmospheric conditions using scientific data collected from weather stations, radar, and satellites.
   - Importance: Helps farmers decide when to plant, weed, and harvest; alerts communities to impending natural hazards (cyclones, floods, frost); helps aviation pilots and ship captains navigate safely.`,
    keywords: [
      'weather elements', 'identify weather instruments', 'define weather forecasting',
      'state the importance of weather forecast', 'thermometer', 'rain gauge', 'wind vane',
      'anemometer', 'barometer', 'hygrometer', 'stevenson screen', 'climate'
    ]
  },
  {
    id: 'sci-soil-components-ecosystem',
    strand: 'Environment',
    topic: 'Soil: Components, Soil as an Ecosystem and Uses of Soil',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Soil Science:
1. Four Main Components of Soil:
   - Mineral Particles (approx. 45%): Sand, silt, and clay particles derived from the weathering of parent rocks. Provides anchorage for roots and minerals.
   - Organic Matter / Humus (approx. 5%): Dark, decomposed remains of dead plants and animals. Binds soil particles, retains moisture, and supplies plant nutrients.
   - Soil Water (approx. 25%): Moisture held in capillary spaces between soil particles; dissolves nutrients so plant roots can absorb them.
   - Soil Air (approx. 25%): Air rich in oxygen held in non-capillary pore spaces; vital for root respiration and soil organism survival.

2. Soil as a Living Ecosystem:
   - Living Organisms in the Soil: Earthworms, termites, ants, beetles, nematodes, burrowing rodents, fungi, and nitrogen-fixing bacteria.
   - How Soil is Enriched by Living Organisms:
     * Earthworms burrow through soil, creating channels that improve aeration and water infiltration; their castings are rich in plant nutrients.
     * Fungi and bacteria decompose dead plant leaves and animal carcasses into rich dark **humus**.
     * Rhizobium bacteria in legume root nodules fix atmospheric nitrogen directly into soil nitrates.

3. Three Main Types of Soil:
   - Sandy Soil: Large gritty particles, large pore spaces; drains water very quickly; low nutrient holding capacity; easy to cultivate.
   - Clay Soil: Extremely fine particles, tightly packed; holds water tightly (poor drainage, easily waterlogged); sticky when wet, hard when dry; rich in mineral nutrients.
   - Loam Soil: Balanced mixture of sand, clay, and plenty of humus; optimal water retention and drainage; fertile and easiest to cultivate (ideal agricultural soil).

4. Uses of Soil in Zimbabwe:
   - Agricultural Foundation: Anchors plant roots and provides water and nutrients to grow crops.
   - Construction: Molding bricks (adobe and fired bricks), plastering traditional round huts (*dzimba dzeuswa*), building road foundations.
   - Pottery and Crafting: Modeling clay pots (*hari*), plates, and ceramic art.
   - Water Filtration: Naturally filters rainwater as it percolates down into underground aquifers.`,
    keywords: [
      'soil components', 'four components of soil', 'soil as an ecosystem',
      'organisms living in the soil', 'uses of soil', 'humus', 'loam', 'sandy', 'clay', 'earthworms'
    ]
  },
  {
    id: 'sci-soil-erosion-control',
    strand: 'Environment',
    topic: 'Soil Erosion: Agents, Types, Causes and Control Measures',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Soil Conservation:
1. Definition of Soil Erosion:
   - Soil erosion is the washing away, blowing away, or physical removal of fertile topsoil from the land surface by natural agents such as running water, wind, and animals.

2. Agents of Soil Erosion:
   - Running Water: Heavy rainfall and surface runoff carry away loose soil.
   - Wind: Strong gale winds sweep away dry, bare, unprotected topsoil.
   - Animals and Humans: Overgrazing livestock and human deforestation expose bare ground.

3. Four Main Types of Soil Erosion:
   - Splash Erosion: Raindrops strike bare soil directly, dislodging soil particles and scattering them.
   - Sheet Erosion: Rainwater flows as a wide, uniform sheet over bare sloping ground, stripping off the top layer of fertile soil evenly (difficult to notice initially).
   - Rill Erosion: Surface runoff concentrates into small, visible, finger-like shallow channels or grooves on the soil surface.
   - Gully Erosion: Severe, advanced erosion where rills widen and deepen into massive steep-sided trenches (dongas) that cannot be crossed by farm machinery.

4. Causes of Soil Erosion:
   - Deforestation: Cutting down trees for firewood, tobacco curing, or land clearing removes root anchors and canopy protection.
   - Overgrazing: Keeping too many cattle/goats in one paddock strips all vegetative grass cover.
   - Ploughing up and down steep slopes instead of across the contour.
   - Veld fires destroying grass ground cover before the rainy season.

5. Ways of Controlling and Preventing Soil Erosion:
   - **Contour Ridges:** Digging earth ridges and storm drains along the contour lines of sloping lands to slow down runoff.
   - **Terracing:** Constructing step-like flat terraces on steep hillsides.
   - **Mulching:** Covering bare soil around crops with dry grass, straw, or leaves to cushion raindrop impact and conserve moisture.
   - **Afforestation and Reforestation:** Planting new trees and replacing cut ones so tree roots bind soil particles firmly.
   - **Planting Vetiver Grass:** Planting dense rows of deep-rooted vetiver grass along waterways and gullies to trap silt.
   - **Rotational Grazing (Paddocking):** Moving cattle periodically between paddocks to allow grass to regenerate.`,
    keywords: [
      'soil erosion', 'define soil erosion', 'list agents of soil erosion',
      'explain causes of soil erosion', 'state ways of controlling soil erosion',
      'splash erosion', 'sheet erosion', 'rill erosion', 'gully erosion', 'contour ridges', 'mulching', 'afforestation'
    ]
  },
  {
    id: 'sci-water-cycle-detail',
    strand: 'Environment',
    topic: 'Water Cycle, Changes of State and Groundwater Extraction',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Science:
1. Three States of Water and Changes of State:
   - Solid (Ice): Rigid, fixed shape; water molecules closely packed.
   - Liquid (Water): Flows freely, takes the shape of its container.
   - Gas (Water Vapor / Steam): Invisible vapor dispersed freely in the air.
   - Processes of State Changes:
     * Melting: Solid ice heated -> Liquid water.
     * Evaporation: Liquid water heated -> Gas (water vapor).
     * Condensation: Water vapor cools -> Liquid water droplets (forms clouds).
     * Freezing: Liquid water cooled below 0°C -> Solid ice.

2. Explanation of the Water (Hydrological) Cycle:
   - Solar Evaporation: Sun heats water in oceans, lakes, and rivers, turning it into invisible water vapor that rises into the atmosphere.
   - Transpiration: Green plants release water vapor into the air through microscopic leaf pores (stomata).
   - Condensation: Rising water vapor cools at high altitude and condenses around microscopic dust particles into billions of water droplets, forming **clouds**.
   - Precipitation: When cloud water droplets become too heavy to remain suspended, they fall to earth as **rain**, hail, or snow.
   - Surface Runoff and Infiltration: Rainwater flows over land as runoff into rivers, dams, and lakes, while some water soaks (**infiltrates**) deep into the soil to replenish groundwater aquifers.

3. Groundwater Extraction and Conservation:
   - Importance of Groundwater: Natural reservoir of pure filtered water that supplies rural communities, schools, and irrigation boreholes.
   - Extraction Methods:
     * Hand-dug Wells: Shallow wells dug into the water table, fitted with buckets or windlasses.
     * Machine-drilled Boreholes: Deep pipes drilled deep into rock aquifers, fitted with manual **Bush Pumps** or electric/solar submersible pumps.
   - Conservation: Protecting wetlands (mapani/dambos), preventing chemical pollution near boreholes, and rainwater harvesting to recharge underground aquifers.`,
    keywords: [
      'water cycle', 'identify states of water', 'demonstrate changes in water states',
      'explain the water cycle', 'evaporation', 'condensation', 'precipitation', 'transpiration',
      'ground water extraction', 'boreholes', 'wetlands'
    ]
  },
  {
    id: 'sci-weathering-rocks-detail',
    strand: 'Environment',
    topic: 'Weathering of Rocks: Physical, Chemical and Biological Types',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Earth Science:
1. Definition of Weathering:
   - Weathering is the breaking down, disintegration, and chemical decay of rocks into smaller particles *in situ* (in their original place) at or near the Earth's surface through the action of weather elements and living organisms.
   - *Key Distinction:* Weathering happens **in situ** (without transport); **erosion** is the carrying away of loosened rock fragments by water, wind, or ice.

2. The Three Main Types of Weathering:
   - **Physical (Mechanical) Weathering:**
     * Disintegration of rocks into smaller rock fragments without any change in their chemical composition.
     * **Exfoliation (Onion-Skin Peeling):** Common in arid and semi-arid areas of Zimbabwe (e.g. granite kopjes in Domboshava and Matobo Hills). High daytime solar heat causes outer rock layers to expand; cold nighttime temperatures cause rapid contraction. Repeated expansion and contraction creates stress fractures, causing outer curved layers to peel off like onion skins.
     * **Freeze-Thaw (Frost Action):** Water seeps into cracks in rocks. When temperature drops below 0°C, the water freezes and expands by ~9%, exerting tremendous pressure that wedges the crack wider until the rock shatters.
   - **Chemical Weathering:**
     * Decomposition of rock minerals caused by chemical reactions with water, oxygen, and acidic gases.
     * **Carbonation:** Rainwater absorbs carbon dioxide from the air to form weak carbonic acid, which dissolves calcium carbonate rocks (limestone/marble) to form caves (e.g. Chinhoyi Caves).
     * **Oxidation (Rusting):** Iron minerals in rocks react with dissolved oxygen in water, turning rocks reddish-brown and crumbly.
     * **Hydration:** Minerals absorb water and swell, weakening the rock structure.
   - **Biological Weathering:**
     * Disintegration of rocks caused by living organisms.
     * Plant roots grow into small rock fissures and widen them as roots thicken.
     * Burrowing animals (termites, rodents, earthworms) expose rocks to air and moisture.
     * Lichens and mosses growing on rock surfaces secrete organic acids that corrode minerals.`,
    keywords: [
      'weathering', 'state the three types of weathering', 'describe different types of weathering',
      'physical weathering', 'chemical weathering', 'biological weathering', 'exfoliation',
      'freeze-thaw', 'carbonation', 'domboshava', 'chinhoyi caves'
    ]
  },
  {
    id: 'sci-soil-profile-detail',
    strand: 'Environment',
    topic: 'Soil Profile: Horizons O, A, B, C, R and Importance',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Soil Science:
1. Definition of Soil Profile:
   - A soil profile is a vertical cross-section of the soil from the ground surface down through all its successive layers to the underlying parent bedrock, showing distinct horizontal layers known as **soil horizons**.

2. The Soil Horizons (From Top to Bottom):
   - **Horizon O (Organic Layer):**
     * The uppermost surface layer composed of fresh and partially decomposed organic matter (fallen leaves, plant twigs, animal waste, and dark rich humus).
   - **Horizon A (Topsoil):**
     * The most fertile mineral layer directly beneath Horizon O.
     * Characterized by a dark brown or black color due to abundant humus.
     * Contains the highest concentration of plant roots, earthworms, and soil microorganisms.
     * Crucial for crop farming because it holds available plant nutrients and moisture.
   - **Horizon B (Subsoil):**
     * Layer lying beneath the topsoil, lighter in color (often reddish, yellowish, or brown clay).
     * Zone of accumulation (illuviation) where clay particles and leached minerals washed down from the topsoil accumulate.
     * More compact and dense, with fewer roots and less organic matter.
   - **Horizon C (Weathered Parent Material):**
     * Layer composed of partially weathered, broken, and fractured rock fragments derived from the underlying bedrock.
     * Contains no organic matter and cannot support plant roots.
   - **Horizon R (Solid Bedrock):**
     * The unweathered solid continuous parent rock layer (granite, basalt, or limestone) forming the geological base of the soil.

3. Importance of the Soil Profile:
   - Helps farmers determine soil fertility, effective root depth, and suitability for specific crops.
   - Indicates water drainage capacity and helps prevent soil erosion.
   - Guides civil engineers in assessing soil stability for building foundations, bridges, and dams.`,
    keywords: [
      'soil profile', 'define soil profile', 'identify the layers of the soil profile',
      'discuss the importance of the soil profile', 'horizon o', 'horizon a', 'horizon b',
      'horizon c', 'horizon r', 'topsoil', 'subsoil', 'bedrock'
    ]
  },
  {
    id: 'sci-climate-change-mitigation',
    strand: 'Environment',
    topic: 'Climate Change: Causes, Effects, Mitigation and Adaptation',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Health:
1. Definition of Climate Change:
   - Climate change refers to long-term shifts in global or regional temperatures and precipitation patterns, primarily driven by human activities that increase concentrations of greenhouse gases in the atmosphere.

2. Causes of Climate Change:
   - Burning of fossil fuels (coal, oil, petrol, diesel) for industrial electricity and transportation, releasing large amounts of carbon dioxide (CO2).
   - Deforestation: Widespread cutting down of forests reduces the planet's capacity to absorb CO2 through photosynthesis.
   - Agriculture and Livestock: Cattle enteric fermentation releases methane (CH4); nitrogen fertilizers emit nitrous oxide (N2O).
   - Industrial Manufacturing: Releasing industrial greenhouse gases and chemical pollutants.

3. Effects of Climate Change in Zimbabwe and Southern Africa:
   - More frequent and prolonged severe agricultural droughts (frequently triggered by El Niño weather phenomena).
   - Increased frequency and intensity of destructive tropical cyclones (e.g. Cyclone Idai in 2019 causing deadly floods and landslides in Chimanimani and Chipinge).
   - Shift in rainfall seasons: Delayed start of rainy seasons and erratic rainfall distribution causing crop failures.
   - Water scarcity: Drying up of seasonal rivers, dams, and receding groundwater tables.
   - Threat to biodiversity and wildlife in national parks due to extreme heat and drying waterholes.

4. Mitigation and Adaptation Strategies:
   - Mitigation (Reducing Greenhouse Gas Emissions):
     * Transition to clean renewable energy (rooftop solar power, wind, hydro, and biogas).
     * Afforestation and reforestation: Planting millions of trees annually to serve as carbon sinks.
     * Stopping uncontrolled veld fires and banning open burning of plastic waste.
   - Adaptation (Learning to Cope with Changing Climate):
     * Planting drought-tolerant indigenous small grains (sorghum, rapoko, mhunga) instead of thirsty hybrid maize.
     * Practicing **Pfumvudza / Intwasa** conservation agriculture (minimum tillage, permanent planting basins, heavy mulching to conserve soil moisture).
     * Rainwater harvesting from roofs and constructing community weir dams.
     * Installing efficient drip irrigation systems instead of flood irrigation.`,
    keywords: [
      'climate change', 'define climate change', 'identify cause of climate change',
      'explain effects of climate change', 'discuss mitigation measures', 'greenhouse effect',
      'cyclone idai', 'drought', 'pfumvudza', 'intwasa', 'renewable energy'
    ]
  },

  // =========================================================================
  // 5. TOOLS AND EQUIPMENT
  // =========================================================================
  {
    id: 'sci-farm-implements-machinery',
    strand: 'Tools and Equipment',
    topic: 'Farm Implements and Machinery: Types, Safety and Maintenance',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Tools and Machinery:
1. Types of Farm Implements and Machinery:
   - Hand Tools:
     * Badza (Hoe): Used for digging planting basins, weeding, and earthing up crops.
     * Spade & Shovel: Used for scooping and moving soil, sand, and compost manure.
     * Sickle: Curved serrated blade used for harvesting small grains and cutting thatch grass.
     * Pickaxe: Heavy T-shaped tool for breaking hard compacted rocky ground.
     * Rake: Leveling garden seedbeds and collecting dry trash.
   - Animal-Drawn Implements:
     * Mouldboard Plough: Ox-drawn implement used for primary tillage; cuts, lifts, and turns over the soil slice to bury weeds.
     * Spike-Tooth / Disc Harrow: Secondary tillage implement used to break large soil clods and create a fine seedbed.
     * Cultivator: Used for inter-row weeding and loosening soil between crop rows without damaging crop roots.
     * Planter: Automatically meters seeds and fertilizers into furrows at uniform depth and spacing.
     * Scotch Cart: Ox-drawn two-wheeled transport cart for carrying harvested produce, manure, and firewood.
   - Motorized Machinery:
     * Tractor: Powerful multi-purpose motorized farm vehicle used to pull heavy implements (ploughs, harrows, trailers).
     * Combine Harvester: Complex self-propelled machine that cuts, threshes, and winnows grain crops (wheat, maize) in a single continuous operation.
     * Knapsack Sprayer: Portable pressure sprayer used to apply herbicides, pesticides, and liquid foliar fertilizers to crops.

2. Safety Procedures When Operating Farm Implements:
   - Wear appropriate Personal Protective Equipment (PPE) such as sturdy gumboots, leather gloves, and eye goggles.
   - When using chemical sprayers, wear a protective face mask and waterproof suit, and NEVER spray against the direction of the wind.
   - Keep animals and small children away from working machinery and moving ox-spans.
   - Never stand directly behind a running tractor or beneath raised hydraulic implements.

3. Maintenance of Farm Equipment:
   - Cleaning: Wash off all soil, mud, and plant residues immediately after use to prevent corrosion.
   - Sharpening: Sharpen cutting edges of hoes, ploughshares, sickles, and blades regularly using a bastard mill file or grindstone.
   - Oiling and Greasing: Apply grease to moving bearings, wheels, and chains; wipe metal parts with used oil to prevent rusting.
   - Storage: Store farm tools and implements neatly in a dry, covered toolshed out of rain and direct sunlight.`,
    keywords: [
      'farm implements', 'identify farm implements', 'explain safety procedures for operating farm implements',
      'describe maintenance procedures', 'farm machinery', 'mouldboard plough', 'harrow', 'cultivator',
      'tractor', 'knapsack sprayer', 'badza', 'maintenance'
    ]
  },
  {
    id: 'sci-digital-devices-tools-ict',
    strand: 'Tools and Equipment',
    topic: 'Digital Devices, Servers, Spreadsheets and ICT Careers',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • ICT:
1. Digital Devices and Servers:
   - Digital Devices: Electronic tools that generate, process, store, and communicate digital data (smartphones, tablets, laptops, desktop computers, digital cameras).
   - Definition of a Server: A specialized, high-capacity central computer system that provides resources, services, and data to other computers (called clients) over a network or the Internet.
   - Types of Servers:
     * File Server: Stores and manages central files and documents for network users.
     * Web Server: Delivers web pages and websites over the Internet using HTTP/HTTPS protocols.
     * Mail Server: Manages, receives, and routes electronic mail (email).
     * Database Server: Stores, manages, and retrieves structured records in databases.
   - Global Positioning System (GPS): A space-based satellite navigation system that provides accurate geographic location (latitude and longitude) and time information anywhere on Earth. Used in mapping, road navigation, search and rescue, and precision farming.

2. Digital Tools: Spreadsheets and Databases:
   - Spreadsheet (e.g. Microsoft Excel, Google Sheets):
     * A grid of columns (letters A, B, C...) and rows (numbers 1, 2, 3...) forming cells where numerical data and labels are entered.
     * Using Formulas: All spreadsheet formulas begin with an equal sign (=).
       - Addition: \`=SUM(A1:A10)\`
       - Average: \`=AVERAGE(B1:B10)\`
       - Highest value: \`=MAX(C1:C10)\`
     * Data Visualization: Generating bar charts, pie charts, and line graphs to interpret data patterns visually.
     * Sorting and Filtering: Ordering records alphabetically or numerically; filtering data to view records meeting specific criteria.
   - Database Tables:
     * Storing structured data in tables consisting of fields (columns) and records (rows).
     * Sorting and running queries to retrieve specific answers.

3. Career Opportunities in ICT:
   - Software Engineer / Programmer: Designs, writes, tests, and maintains computer code, mobile apps, and video games.
   - Cybersecurity Specialist: Protects computer networks, servers, and sensitive data from hackers, malware, and digital theft.
   - Database Administrator: Manages, organizes, and secures institutional data records.
   - Network Engineer: Installs, configures, and maintains internet connections, Wi-Fi routers, switches, and communication lines.
   - Web Designer / Developer: Builds, designs, and updates websites and online educational platforms.`,
    keywords: [
      'digital devices', 'define servers', 'list different types of servers', 'explain uses of servers',
      'gps', 'digital tools', 'spreadsheet', 'database', 'career opportunities in ict',
      'excel formulas', 'software engineer', 'cybersecurity'
    ]
  },
  {
    id: 'sci-measuring-tools-length-mass-vol',
    strand: 'Tools and Equipment',
    topic: 'Measuring Tools: Temperature, Mass, Volume and Length',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Measurement:
1. Scientific Measurement and Standard Units (SI Units):
   - Measurement is the process of finding a quantitative number for a physical property using standard scientific instruments.

2. Physical Properties, Measuring Instruments and Units:
   - **Temperature:**
     * Instrument: **Thermometer** (Liquid-in-glass thermometer containing mercury or colored alcohol; digital thermometer).
     * Unit: Degrees Celsius (**°C**). Normal human body temperature is approximately **37°C**. Boiling point of pure water is **100°C**; freezing point is **0°C**.
   - **Mass:**
     * Instrument: **Beam Balance**, **Triple Beam Balance**, or **Electronic Digital Scale**.
     * Unit: Grams (**g**) and Kilograms (**kg**). (1 kg = 1 000 g; 1 tonne = 1 000 kg).
   - **Volume (Liquids & Irregular Solids):**
     * Instrument: **Measuring Cylinder**, **Graduated Beaker**, **Pipette**, or **Burette**.
     * Unit: Millilitres (**ml**) and Litres (**l**). (1 litre = 1 000 ml = 1 000 cm³).
     * Meniscus Rule: When reading liquid volume in a glass cylinder, read the scale at the **bottom of the curved meniscus** at eye level to prevent parallax error.
     * Displacement Method: To measure volume of an irregular stone: Record initial water volume in cylinder ($V_1$), gently submerge stone, record new water volume ($V_2$). Stone Volume = $V_2 - V_1$.
   - **Length:**
     * Instrument: **Ruler** (for short lengths), **Measuring Tape** (for field and fabric measurements), **Vernier Caliper** (for precise thickness and internal/external diameters).
     * Unit: Millimetres (**mm**), Centimetres (**cm**), Metres (**m**), Kilometres (**km**). (1 m = 100 cm = 1 000 mm; 1 km = 1 000 m).`,
    keywords: [
      'measuring tools', 'identify the tools used for measuring temperature, mass and volume',
      'measure mass and volume', 'thermometer', 'beam balance', 'measuring cylinder',
      'ruler', 'measuring tape', 'meniscus', 'displacement method'
    ]
  },

  // =========================================================================
  // 6. ENERGY AND FUELS
  // =========================================================================
  {
    id: 'sci-forms-energy-conversion',
    strand: 'Energy and Fuels',
    topic: 'Forms of Energy, Energy Conversion and the Conservation Law',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Energy:
1. Forms of Energy:
   - Kinetic Energy: Energy possessed by an object due to its motion (e.g. running person, rolling ball, flowing river water, wind).
   - Potential Energy: Stored energy waiting to be released.
     * Gravitational Potential Energy: Stored in an object raised above the ground (e.g. water held behind Kariba Dam wall).
     * Chemical Potential Energy: Stored in chemical bonds of food, dry battery cells, wood, and fossil fuels.
     * Elastic Potential Energy: Stored in stretched rubber bands, catapults, and compressed springs.
   - Electrical Energy: Energy produced by the flow of electric charges (electrons) through a conductor.
   - Thermal (Heat) Energy: Energy resulting from the internal microscopic kinetic motion of particles.
   - Light (Radiant) Energy: Visible electromagnetic energy emitted by luminous sources (Sun, candle, electric bulb).
   - Sound Energy: Energy produced by mechanical vibrations transmitted through material mediums in compression waves.

2. The Law of Conservation of Energy:
   - The Law of Conservation of Energy states that **energy cannot be created nor destroyed, but can only be converted (transformed) from one form into another**. The total amount of energy in the universe remains constant.

3. Examples of Energy Conversion:
   - Torch / Flashlight: Chemical energy (battery) -> Electrical energy -> Light & Thermal (heat) energy.
   - Kariba Hydroelectric Power Station: Gravitational potential energy (dam water) -> Kinetic energy (falling water) -> Mechanical energy (spinning turbines) -> Electrical energy (generators).
   - Human Body Running: Chemical energy (digested food) -> Mechanical/Kinetic energy (contracting muscles) + Thermal energy (body heat).
   - Electric Iron: Electrical energy -> Thermal energy.
   - Solar Photovoltaic Panel: Solar light energy -> Electrical energy.
   - Photosynthesis in Plants: Solar light energy -> Stored chemical potential energy in glucose.`,
    keywords: [
      'forms of energy', 'identify forms of energy', 'describe forms of energy',
      'demonstrate kinetic energy', 'energy conversion', 'law of conservation of energy',
      'potential energy', 'kinetic energy', 'kariba dam', 'chemical energy'
    ]
  },
  {
    id: 'sci-fuels-fire-safety',
    strand: 'Energy and Fuels',
    topic: 'Fuels, Conditions for Burning (Fire Triangle) and Safety Hazards',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Energy and Fuels:
1. Definition of Fuel:
   - A fuel is any combustible material that can be burned to release useful heat and light energy.

2. Conditions Necessary for Fuel to Burn (The Fire Triangle):
   - For any fire or combustion to take place and sustain itself, three essential components must be present simultaneously:
     * **Fuel:** The combustible substance that burns (wood, coal, gas, petrol, paraffin).
     * **Oxygen (Air):** The chemical oxidizer supporting combustion (air contains ~21% oxygen).
     * **Heat (Ignition Temperature):** Sufficient thermal energy to ignite the fuel.
   - Extinguishing Fires: Removing ANY ONE of the three components immediately puts out the fire:
     * Pouring water removes **Heat** (cools the fire below ignition temperature).
     * Throwing sand, using a fire blanket, or discharging a carbon dioxide/foam extinguisher cuts off **Oxygen**.
     * Creating a fireguard or shutting off a gas valve removes the **Fuel**.

3. Fuel Hazards and Safety Precautions:
   - Carbon Monoxide (CO) Poisoning: Burning charcoal, wood, or coal in enclosed rooms (*mbaura*) with closed windows releases lethal, odorless, colorless carbon monoxide gas. Never sleep in a closed room with a burning brazier!
   - Explosions and Flash Fires: Petrol and LP gas are volatile and vaporize rapidly; keep naked flames away from fuel containers and gas cylinders.
   - Burns and Scalds: Always light matches away from your face; keep small children away from open stoves and boiling pots.
   - Storage Safety: Store flammable liquid fuels (paraffin, petrol) in clearly labeled, airtight metal containers locked away from children; never store petrol in soft drink bottles!`,
    keywords: [
      'fuels', 'conditions necessary for fuel to burn', 'identify fuel hazards',
      'suggest safety precautions when using fuel', 'fire triangle', 'fuel oxygen heat',
      'carbon monoxide', 'mbaura', 'extinguishing fires'
    ]
  },
  {
    id: 'sci-renewable-nonrenewable-fuels',
    strand: 'Energy and Fuels',
    topic: 'Renewable and Non-Renewable Fuels: Types, Pros, Cons & Conservation',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Energy:
1. Renewable vs Non-Renewable Fuels:
   - Renewable Energy / Fuels:
     * Energy resources derived from natural sources that replenish themselves naturally over a short period and will never run out.
     * Examples: Solar energy, Wind energy, Hydroelectric power (flowing water), Biogas (from cow dung), Biomass / Firewood (when sustainably replanted).
   - Non-Renewable Fuels:
     * Finite fossil fuels that took millions of years to form under the Earth and will eventually be depleted.
     * Examples: Coal (mined at Hwange), Crude oil / Petroleum (petrol, diesel, paraffin), LP gas.

2. Advantages and Disadvantages:
   - Renewable Energy:
     * Advantages: Clean, produces zero greenhouse gas emissions (eco-friendly), free natural source, sustainable indefinitely.
     * Disadvantages: High initial cost of solar panels and batteries, dependent on weather (solar doesn't generate at night; wind is intermittent).
   - Non-Renewable Energy:
     * Advantages: Reliable continuous base-load power, high energy density, well-established infrastructure.
     * Disadvantages: Causes heavy air pollution, produces greenhouse gases driving global warming, releases sulfur dioxide causing acid rain, will run out.

3. Importance of Fuel Conservation:
   - Extends the lifespan of finite fossil fuel reserves.
   - Reduces household electricity and fuel costs.
   - Mitigates air pollution and combats global climate change.
   - Protects indigenous forests from rapid deforestation.
   - Fuel-Saving Practices: Using fuel-efficient wood stoves (chingwa / tsotso stoves), turning off lights and electrical appliances when not in use, switching to solar water heaters, carpooling.`,
    keywords: [
      'renewable and non- renewable fuels', 'discuss renewable and non-renewable fuels',
      'explain the importance of fuel conservation', 'state the advantages and disadvantages of renewable and non- renewable fuels',
      'solar energy', 'biogas', 'coal', 'fossil fuels', 'fuel conservation'
    ]
  },
  {
    id: 'sci-electrical-circuits-detail',
    strand: 'Energy and Fuels',
    topic: 'Electrical Circuits: Components, Series vs Parallel & Circuit Design',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Electricity:
1. Components of an Electrical Circuit:
   - Cell / Battery: The source of electrical energy (chemical potential energy converted to electrical voltage).
   - Conducting Wires: Copper wires covered in insulating plastic that provide a continuous low-resistance path for electric current.
   - Switch: A control device used to complete (close) or break (open) the electrical circuit.
   - Load (Bulb / Buzzer / Motor): The device that converts electrical energy into light, sound, or mechanical motion.

2. Series vs Parallel Electrical Circuits:
   - **Series Circuit:**
     * All components are connected one after another in a single closed loop.
     * Electric current flows through only one single path.
     * If one bulb burns out or is removed, the entire circuit is broken and all other bulbs turn off immediately.
     * Adding more bulbs makes all bulbs noticeably dimmer because total electrical resistance increases and voltage is shared.
   - **Parallel Circuit:**
     * Components are connected on separate individual branches.
     * Electric current splits across multiple pathways.
     * If one bulb burns out, the other bulbs remain shining brightly on their independent branches.
     * Bulbs stay equally bright regardless of how many are added because each branch receives full battery voltage.
     * Household Wiring: Homes and schools are always wired in parallel so that turning off a bedroom light does not shut off the refrigerator or television.`,
    keywords: [
      'electrical circuits', 'identify components of an electrical circuit',
      'discuss types of electrical circuits', 'create an electrical circuit',
      'series circuit', 'parallel circuit', 'cell', 'switch', 'bulb', 'copper wire'
    ]
  },
  {
    id: 'sci-sound-energy-detail',
    strand: 'Energy and Fuels',
    topic: 'Sound Energy: Production, Mediums, Vacuum Rule, Pitch & Echoes',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Sound:
1. How Sound is Produced:
   - Sound is generated whenever an object **vibrates** back and forth rapidly (e.g. plucking a guitar string, beating a drum skin / ngoma, vocal cords vibrating in the throat).

2. Transmission of Sound Through Different Mediums:
   - Sound travels in longitudinal compression waves and **MUST have a material medium (solid, liquid, or gas)** containing particles to vibrate.
   - Speed of Sound in Different Media:
     * **Solids (Fastest - approx. 5 000 m/s in steel):** Molecules are packed closely together in rigid contact, allowing vibrations to pass from particle to particle almost instantly.
     * **Liquids (Intermediate - approx. 1 500 m/s in water):** Particles are close but free to move.
     * **Gases / Air (Slowest - approx. 330 to 340 m/s):** Gas molecules are spaced far apart.
   - **The Vacuum Rule:** Sound **CANNOT travel through a vacuum (empty space)** because a vacuum contains no molecules or matter to collide and pass vibrations along. (In outer space, there is absolute silence).

3. Pitch vs Loudness:
   - **Pitch (Frequency):** How high, shrill, or deep a sound is. Determined by **frequency** (number of vibrations per second, measured in Hertz, Hz). High frequency = high pitch (whistle, child's voice); Low frequency = deep bass pitch (drum, adult male voice).
   - **Loudness (Volume / Amplitude):** The strength of sound. Determined by **amplitude** (amount of energy in the vibration). Striking a drum harder creates larger amplitude and louder sound.

4. Echoes:
   - An echo is a reflected sound wave that bounces back from a hard, flat barrier (such as a rock cliff, cave wall, or building).
   - Minimum Distance Rule: The reflecting surface must be at least **17 meters away** for the human ear to distinguish the reflected sound as a separate echo (because the human brain requires at least 0.1s to separate two sound pulses).`,
    keywords: [
      'sound energy', 'demonstrate that sound travels through air, solids and water',
      'illustrate different ways of producing sound', 'pitch', 'loudness', 'vibrations',
      'vacuum rule', 'echoes', 'speed of sound', 'hertz'
    ]
  },
  {
    id: 'sci-wildfires-fireguards-detail',
    strand: 'Energy and Fuels',
    topic: 'Veld Fires: Causes, Effects and Standard 9-Metre Fireguard',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Environmental Hazards:
1. Causes of Veld Fires (Wildfires) in Zimbabwe:
   - Careless disposal of burning cigarette butts along highways.
   - Uncontrolled fires lit by honey hunters to smoke bees out of hollow trees.
   - Farmers burning dry crop stalks and clearing land with fire on hot, windy days.
   - Poachers using fires to encircle and drive wild game animals into traps.
   - Children playing with matches and fireworks unattended.
   - Natural causes: Summer convective lightning strikes hitting dry grass.

2. Damaging Effects of Veld Fires:
   - Destroys thousands of hectares of livestock grazing pastures, leading to cattle starvation.
   - Burns down homesteads, farm granaries (*dura*), and commercial timber plantations.
   - Destroys natural wildlife habitats, killing slow-moving animals (tortoises, small mammals, nesting birds).
   - Strips soil of organic ground cover, accelerating severe soil erosion and desertification.
   - Releases heavy clouds of smoke and carbon dioxide, causing severe air pollution and climate change.

3. Ways of Controlling Veld Fires & The 9-Metre Fireguard Standard:
   - **The Standard 9-Metre Fireguard:**
     * A fireguard is a clean, ploughed or cleared perimeter strip of land at least **9 meters wide** surrounding all farms, homesteads, and plantations.
     * All combustible dry grass, bushes, and litter are completely removed.
     * Approaching fire flames cannot cross the 9-meter bare strip because there is no fuel to burn.
   - Establishing trained community fire-fighting brigades equipped with fire beaters and water bowsers.
   - Observing the National Fire Restriction Season (July 31 to October 31 in Zimbabwe) during which lighting open-air fires is illegal.
   - Reporting outbreaks immediately to the Environmental Management Agency (EMA) and local police.`,
    keywords: [
      'wild fires', 'causes of wild fires and their effects', 'suggest ways of controlling wild fires',
      'veld fires', 'fireguards', '9-metre fireguard', 'ema', 'fire restrictions'
    ]
  },

  // =========================================================================
  // 7. DISASTER RISK MANAGEMENT
  // =========================================================================
  {
    id: 'sci-disaster-risk-mgmt-detail',
    strand: 'Disaster Risk Management',
    topic: 'Disasters, Natural Hazards, Preparedness, Evacuations and Responders',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Disaster Management:
1. Definition of Disasters and Hazards:
   - Hazard: A dangerous natural phenomenon or human activity that has the potential to cause harm, injury, or destruction.
   - Disaster: A sudden catastrophic event that causes widespread human casualties, damage to property, and destruction to the environment, exceeding the community's capacity to cope using its own resources.

2. Classification of Disasters:
   - **Natural Disasters:**
     * Tropical Cyclones: Intense revolving oceanic storm systems bringing destructive hurricane winds, torrential rains, and landslides (e.g. **Cyclone Idai** in 2019 in Manicaland, Cyclone Eline in 2000).
     * Droughts: Extended periods of severe rainfall deficiency leading to dried rivers, failed harvests, and widespread famine.
     * Floods: Rivers overflowing and submerging low-lying settlements (e.g. Muzarabani in Zambezi Valley, Middle Sabi, Tsholotsho).
     * Lightning Strikes: Zimbabwe experiences one of the world's highest lightning fatality rates due to high-altitude granite formations and convective summer storms.
     * Earthquakes / Tremors: Sudden shaking of the Earth's crust along fault lines (felt around Kariba and Chipinge).
   - **Man-Made Disasters:**
     * Veld fires caused by human negligence destroying villages and forests.
     * Mining collapses: Abandoned or unregulated artisanal mining shafts (*makorokoza*) collapsing in rainy seasons.
     * Traffic collisions involving fuel tankers, buses, or chemical cargo trucks.
     * Industrial chemical leaks and toxic spills into public rivers.

3. Emergency Preparedness and Essential Emergency Supplies:
   - Emergency Response Plan: Planned escape routes, designated community evacuation assembly points, and emergency communication channels.
   - Essential Emergency Survival Kit (Go-Bag):
     * Clean bottled drinking water (at least 3 liters per person per day).
     * Non-perishable canned foods and dry energy biscuits.
     * First Aid Kit (bandages, antiseptic, painkillers, burn cream).
     * Battery-powered or crank radio to receive official weather warnings.
     * Flashlights/torches and spare batteries.
     * Whistle to signal for help to search-and-rescue teams.
     * Waterproof matches, multi-purpose knife, warm blankets, and copies of important family identity documents in a sealed plastic pouch.

4. Lightning Safety Procedures (ZIMSEC Standard):
   - Indoor Safety: Stay indoors inside a substantial permanent building or a fully enclosed metal-bodied motor vehicle (car/bus); avoid plumbing, landline phones, and electrical appliances.
   - Dangerous Outdoor Places to Avoid: NEVER shelter under tall isolated trees, open thatched gazebos, or near metal wire fences, railway lines, or bodies of water.
   - **The Emergency Lightning Crouch:** If caught in an open field with no shelter:
     * Crouch down immediately on the balls of your feet with heels touching.
     * Tuck your head between your knees and cover your ears with your hands.
     * Minimize contact with the ground; **NEVER LIE FLAT ON THE GROUND** because deadly ground electrical currents will pass through your body!
   - Lightning Conductors: Install pointed copper rods on roof peaks connected to thick copper earth wires buried deep in moist ground.

5. Emergency Responders and Psycho-Emotional Support:
   - Emergency Responders:
     * Civil Protection Unit (CPU / Department of Civil Protection): Coordinates all national disaster relief and evacuation efforts.
     * Zimbabwe Republic Police (ZRP) and Defence Forces: Maintain public security, conduct helicopter air rescues, and transport relief.
     * Fire Brigade and Ambulance Services: Extinguish blazes and provide emergency medical trauma care.
     * Zimbabwe Red Cross Society: Provides tents, emergency food, clean water, blankets, and tracing missing family members.
   - Psycho-Emotional Support:
     * Providing psychological first aid, trauma counselling, safe child-friendly spaces, and restoring dignity to disaster victims who have lost homes and loved ones.`,
    keywords: [
      'disasters', 'identify different types of disasters', 'discuss the impacts of disasters',
      'hazards preparedness', 'natural hazards', 'safety and evacuations', 'lightning safety',
      'lightning crouch', 'emergency professionals', 'psycho-emotional support', 'cyclone idai', 'cpu'
    ]
  },

  // =========================================================================
  // 8. EDUCATIONAL TECHNOLOGY AND INNOVATION
  // =========================================================================
  {
    id: 'sci-emerging-tech-ai-robotics',
    strand: 'Educational Technology & Innovation',
    topic: 'Artificial Intelligence, Coding and Robotics in Everyday Life',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • EdTech:
1. Definition and Concepts of Artificial Intelligence (AI):
   - Artificial Intelligence (AI) refers to computer software, algorithms, or machines programmed to simulate human cognitive intelligence—such as learning from data, reasoning, recognizing speech and images, and solving complex problems.
   - Applications of AI in Everyday Life:
     * Voice Recognition Assistants: Siri, Google Assistant, Alexa recognizing natural spoken language.
     * Smart Agriculture in Zimbabwe: Automated agricultural drones carrying out camera crop scouting to detect pests and plant diseases; AI sensors automating drip irrigation.
     * Healthcare: AI diagnostic scanners analyzing X-rays and medical records to help rural clinic nurses detect diseases early.
     * Education: Offline intelligent curriculum tutoring engines (such as **ZEXA AI**) that provide instant, personalized textbook-grade answers to schoolchildren without requiring internet data.
     * Autonomous Vehicles: Self-driving cars using computer vision sensors to navigate roads safely.

2. Coding and Computational Thinking:
   - Definition of Coding: The process of writing precise step-by-step instructions in a programming language that a computer can read and execute.
   - Definition of an Algorithm: A clear, ordered sequence of instructions or rules designed to accomplish a specific task or solve a problem.
   - Block-Based Coding (e.g. Scratch, Blockly):
     * Beginner-friendly visual coding platforms where children snap graphical puzzle-like instruction blocks together to create animations, interactive stories, and games.
   - Text-Based Coding (e.g. Python, HTML, JavaScript):
     * Writing typed commands and syntax to build real-world software applications and websites.

3. Robotics and Engineering Principles:
   - Definition of a Robot: An automated, programmable machine designed to perform physical tasks autonomously or under remote control.
   - Three Core Components of Any Robot:
     * **Sensors (The Senses):** Devices that collect data from the environment (e.g. ultrasonic distance sensors, infrared light sensors, temperature sensors).
     * **Controller / Processor (The Brain):** The computer chip / microprocessor running code that processes sensor inputs and decides what action to take.
     * **Actuators / Motors (The Muscles):** Electric motors, pistons, and wheels that convert electrical signals into physical movement.
   - Robotics Design Process:
     * 1. Identify the Problem -> 2. Brainstorm and Design -> 3. Build Prototype -> 4. Program / Code -> 5. Test and Debug -> 6. Refine.
   - Ethics in Robotics: Ensuring robots are safe, respect human dignity, and do not cause physical harm or unnecessary job loss.`,
    keywords: [
      'artificial intelligence', 'define artificial intelligence', 'coding and robotics',
      'robotics', 'algorithm', 'sensors and actuators', 'block- based coding', 'scratch',
      'zexa ai', 'drones', 'smart farming'
    ]
  },
  {
    id: 'sci-cybersecurity-malware-online-safety',
    strand: 'Educational Technology & Innovation',
    topic: 'Cybersecurity, Malware Types, Hacking and Online Safety Rules',
    grade_estimate: 'Grade 7',
    content: `ZIMSEC Grade 7 Science and Technology Syllabus 7030 • Cyber Wellness:
1. Definition of Cybersecurity:
   - Cybersecurity is the practice of protecting computer systems, mobile networks, digital devices, and sensitive private data from digital attacks, damage, and unauthorized access.

2. Hacking and Types of Hackers:
   - Definition of Hacking: Gaining unauthorized access to computer systems, digital accounts, or networks to view, alter, or steal data.
   - Types of Hackers:
     * Black Hat Hackers (Malicious): Criminals who illegally break into computer systems to steal money, personal identity information, or damage networks.
     * White Hat Hackers (Ethical Hackers): Cybersecurity security professionals who test computer systems with permission to find vulnerabilities and fix them.
     * Grey Hat Hackers: Individuals who find security flaws without malicious intent but without official authorization.

3. Malware (Malicious Software) Types:
   - Definition: Harmful software intentionally designed to damage, disrupt, or gain unauthorized access to computer systems.
   - Types of Malware:
     * Virus: Program attached to clean files that replicates itself and corrupts or deletes computer data.
     * Worm: Self-replicating malware that spreads across computer networks without human action, clogging internet bandwidth.
     * Trojan Horse: Harmful program disguised as legitimate, harmless software (e.g. a free game) that secretly creates backdoors for hackers.
     * Ransomware: Malicious software that locks and encrypts a user's files and demands payment of money (ransom) to restore access.
     * Spyware: Secretly monitors and records user keystrokes, passwords, and browsing habits.

4. Defense and Cyber Wellness Rules for Schoolchildren:
   - Antivirus Software: Programs (such as Windows Defender, Avast, Kaspersky) that scan, detect, quarantine, and eliminate malware. Keep antivirus definitions updated daily.
   - Firewalls: Digital security barriers that monitor incoming and outgoing network traffic, blocking unauthorized access.
   - Strong Passwords: Create complex passwords with at least 8 to 12 characters combining uppercase letters, lowercase letters, numbers, and symbols (e.g. \`Zim#Sec2026!\`). Never share passwords with friends!
   - Online Safety Rules:
     * NEVER share personal private information (full home address, school name, phone numbers, parents' banking details) with strangers online.
     * NEVER agree to meet an online stranger in the physical world without parents' knowledge and presence.
     * Avoid clicking suspicious links or downloading attachments from unknown email senders.
     * Practice cyber-wellness and kindness; immediately report online cyberbullying to parents or teachers.`,
    keywords: [
      'cyber security', 'define hacking', 'find out on types of hackers', 'identify the effects of hacking',
      'malware', 'types of malwares', 'antivirus software', 'firewalls', 'online safety rules',
      'passwords', 'cyber wellness', 'viruses', 'ransomware'
    ]
  }
];

// Write to public/assets/zimsec_science_and_technology.json
const targetFile = path.join(__dirname, '../public/assets/zimsec_science_and_technology.json');
const fileData = {
  subject: "Agriculture, Science and Technology",
  curriculum: "ZIMSEC Grade 7 Primary Heritage-Based Curriculum (Syllabus 7030)",
  confidence_flag: "HIGH_VERIFIED",
  generated: "2026-11-05",
  total_topics: chunks.length,
  chunks: chunks
};

fs.writeFileSync(targetFile, JSON.stringify(fileData, null, 2), 'utf8');
console.log(`Successfully generated ${chunks.length} comprehensive chunks in ${targetFile}`);
