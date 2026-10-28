import { KnowledgeStore } from './knowledgeStore';

export interface GenerationOptions {
  level: string;
  hint?: string;
  history?: Array<{ question: string; answer: string }>;
  onToken: (token: string) => void;
  onComplete: (metrics: string, source?: string) => void;
  onError: (error: string) => void;
}

export class AIEngine {
  private static isCancelled = false;

  static stopGeneration(): void {
    this.isCancelled = true;
  }

  static async generate(question: string, options: GenerationOptions): Promise<void> {
    this.isCancelled = false;
    const startTime = performance.now();
    let firstTokenTime = 0;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      options.onError('Please enter a question');
      return;
    }

    try {
      // 1. RAG search in syllabus knowledge base (strictly filtered by level)
      let matchedChunk: any = null;
      let matchedScore = 0;
      let contextSnippet = '';

      if (options.hint) {
        contextSnippet = `[EXAM CONTEXT]: ${options.hint}`;
      } else {
        const searchResult = await KnowledgeStore.searchScored(trimmedQuestion, options.level);
        if (searchResult.results.length > 0) {
          const top = searchResult.results[0];
          matchedChunk = top.chunk;
          matchedScore = top.score;
          contextSnippet = `[SYLLABUS REFERENCE - ${top.chunk.topic} (${top.chunk.subject})]:\n${top.chunk.content}`;
        }
      }

      // 2. Synthesize response text tailored specifically for this level
      let fullResponse = '';
      let sourceTag: string | undefined = undefined;

      if (options.hint) {
        fullResponse = `**Exam Question Analysis & Solution:**\n\n${options.hint}\n\n*Study Tip:* In ZIMSEC examinations, always read the question carefully, eliminate impossible distractors first, and underline key instructional words.`;
        sourceTag = `ZIMSEC ${options.level} Exam Bank`;
      } else if (matchedChunk && matchedScore >= 35) {
        // High confidence match from the exact syllabus chunk for this level
        fullResponse = `### ${matchedChunk.topic}\n\n${matchedChunk.content}\n\n**ZIMSEC Exam Key Points:**\n- Ensure you memorize standard definitions and units exactly as specified by the ZIMSEC ${options.level} syllabus.\n- For structured questions, always show complete step-by-step working.`;
        sourceTag = `${matchedChunk.topic} • ${matchedChunk.source}`;
      } else {
        // Level-specific pedagogical response
        fullResponse = this.generatePedagogicalResponse(trimmedQuestion, options.level);
        sourceTag = `ZIMSEC ${options.level} Curriculum Guide`;
      }

      // 3. Stream tokens to UI
      const tokens = this.tokenizeText(fullResponse);
      let currentIndex = 0;

      const streamNext = () => {
        if (this.isCancelled) {
          options.onComplete('Cancelled by user');
          return;
        }

        if (currentIndex < tokens.length) {
          if (firstTokenTime === 0) firstTokenTime = performance.now();
          const token = tokens[currentIndex++];
          options.onToken(token);

          // Variable streaming speed for natural feel
          const delay = Math.min(25, Math.max(5, token.length * 2));
          setTimeout(streamNext, delay);
        } else {
          const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
          const ttft = firstTokenTime > 0 ? ((firstTokenTime - startTime) / 1000).toFixed(1) : '0.1';
          const metrics = `Prefill: ${ttft}s | Total: ${totalTime}s • Syllabus Match`;
          options.onComplete(metrics, sourceTag);
        }
      };

      // Slight initial processing delay
      setTimeout(streamNext, 60);

    } catch (err: any) {
      options.onError(err.message || 'Error processing response');
    }
  }

  private static tokenizeText(text: string): string[] {
    const parts: string[] = [];
    const words = text.split(/(\s+|\n+)/);
    for (const word of words) {
      if (word.length > 8) {
        parts.push(word.slice(0, 4), word.slice(4));
      } else if (word) {
        parts.push(word);
      }
    }
    return parts;
  }

  /**
   * Generates level-specific responses that match the exact cognitive level of the student
   */
  private static generatePedagogicalResponse(question: string, level: string): string {
    const qLower = question.toLowerCase();
    const isPrimary = level.toLowerCase().includes('primary');
    const isTertiary = level.toLowerCase().includes('tertiary');

    // === PRIMARY EDUCATION RESPONSES (Aligned with official 6-subject results slip) ===
    if (isPrimary) {
      if (qLower.includes('photo') || (qLower.includes('plant') && qLower.includes('food'))) {
        return `### How Green Plants Make Food (Grade 7 Agric, Science & Tech)\n\nIn **Agric, Science & Tech**, green plants make their own food through **photosynthesis**:\n\n1. **What plants take in:**\n   - **Sunlight:** Energy absorbed by chlorophyll in leaves.\n   - **Chlorophyll:** The green coloring inside plant leaves.\n   - **Water:** Absorbed from soil by roots through xylem vessels.\n   - **Carbon Dioxide:** Gas taken from the air through tiny openings called stomata.\n\n2. **What plants produce:**\n   - **Food (Glucose / Starch):** Stored in leaves, stems, tubers, and fruits for growth.\n   - **Oxygen:** Released into the air for humans and animals to breathe.\n\n**Official Primary Word Equation:**\nWater + Carbon Dioxide + Sunlight (in green leaves) ➔ Food (Starch) + Oxygen\n\n*Exam Tip for Grade 7:* Sunlight and chlorophyll are vital conditions, not reactants!`;
      }

      if (qLower.includes('soil') || qLower.includes('sand') || qLower.includes('clay') || qLower.includes('loam')) {
        return `### Soil Types & Properties in Zimbabwe (Grade 7 Agric, Science & Tech)\n\nThere are three main types of soil tested in ZIMSEC **Agric, Science & Tech**:\n\n1. **Sandy Soil:**\n   - Has the **largest** rough and gritty particles.\n   - Fast drainage; does not retain water or dissolved fertilizers.\n   - Heats up quickly.\n\n2. **Clay Soil:**\n   - Has the **finest** microscopic particles packed tightly together.\n   - Very slow drainage; easily waterlogged and sticky when wet, cracks when dry.\n   - High nutrient retention.\n\n3. **Loam Soil:**\n   - An ideal mixture of sand, clay, and dark decayed organic matter (**humus**).\n   - Holds the optimal balance of moisture, aeration, and nutrients.\n   - **Best soil** for maize, groundnuts, beans, and vegetables.\n\n*Exam Question Tip:* Loam soil is the best for crops because of its good drainage, aeration, and rich humus!`;
      }

      if (qLower.includes('perimeter') || qLower.includes('area')) {
        return `### Calculating Perimeter and Area (Grade 7 Mathematics)\n\n1. **Perimeter (Distance Around the Outside):**\n   - **Rectangle:** $Perimeter = 2 \\times (Length + Width)$ or $L + W + L + W$.\n     *Example:* If Length = 8cm and Width = 5cm:\n     $Perimeter = 2 \\times (8 + 5) = 2 \\times 13 = 26\\text{ cm}$.\n   - **Square:** $Perimeter = 4 \\times Side$.\n\n2. **Area (Surface Space Inside):**\n   - **Rectangle:** $Area = Length \\times Width$.\n     *Example:* $8\\text{ cm} \\times 5\\text{ cm} = 40\\text{ cm}^2$.\n   - **Square:** $Area = Side \\times Side$.\n   - **Triangle:** $Area = \\frac{1}{2} \\times Base \\times Height$.\n\n*Exam Note:* Remember to write the units: **cm** for perimeter and **cm²** (square centimeters) for area!`;
      }

      if (qLower.includes('flag') || qLower.includes('national symbol') || qLower.includes('anthem') || qLower.includes('bird')) {
        return `### National Symbols of Zimbabwe (Grade 7 Social Science)\n\n1. **The Zimbabwe National Flag Colors:**\n   - **Green:** Plants, vegetation, and rich agriculture.\n   - **Yellow/Gold:** Mineral riches under the ground (gold, diamonds, chrome).\n   - **Red:** Blood of gallant heroes who fought in the Chimurenga liberation war.\n   - **Black:** The indigenous black African majority of Zimbabwe.\n   - **White Triangle:** Peace and freedom.\n   - **Red Star:** High hopes, national progress, and peace.\n   - **Zimbabwe Bird (Hungwe):** National emblem honoring our ancestors at Great Zimbabwe.\n\n2. **National Anthem:**\n   - Composed to celebrate Zimbabwe’s sovereignty, heritage, and unity.\n\n*Grade 7 Revision Tip:* Always memorize the exact meaning of each color of the national flag!`;
      }

      if (qLower.includes('chara chimwe') || qLower.includes('tsumo') || qLower.includes('shona')) {
        return `### Tsumo dzeChishona neZvadzinoreva (Grade 7 Shona)\n\n1. **Tsumo:** *"Chara chimwe hachitswanyi inda."*\n   - **Zvazvinoreva:** Munhu mumwe chete haakwanisi kuita basa guru ari ega. Panodiwa kushandira pamwe chete nekubatana kwevanhu (Mushandirapamwe).\n\n2. **Dzimwe Tsumo dzinokosha muZIMSEC:**\n   - *"Mwana asingachemi anofira mumbereko"* ➔ Munhu anofanira kutaura zvinomunetsa kuti awane rubatsiro.\n   - *"Kandiro kanoenda kunobva kamwe"* ➔ Kudyidzana nekupa vamwe zvakanaka; ukapa vamwe vanokupawo.\n   - *"Aive madziva ava mazambuko"* ➔ Upfumi nesimba zvinosanduka muupenyu.\n\n*Zano reBvunzo:* Tsanangura zvizere zvichiratidza unhu hwakanaka hwemuZimbabwe!`;
      }

      if (qLower.includes('game') || qLower.includes('pada') || qLower.includes('nhodo') || qLower.includes('tsoro') || qLower.includes('physical edu')) {
        return `### Traditional Games & Physical Fitness (Grade 7 Physical Edu & Arts)\n\n1. **Traditional Zimbabwean Games:**\n   - **Pada:** Hopscotch game that develops agility, balance, and single-leg strength.\n   - **Nhodo:** Stone-scooping game improving hand-eye coordination, reaction speed, and counting.\n   - **Tsoro Yemutwve:** Strategic pebble board game developing critical thinking, mental calculation, and tactical planning.\n\n2. **Performing & Visual Arts:**\n   - Traditional dances: **Mbende / Jerusarema** (Mashonaland East), **Muchongoyo** (Manicaland), **Isitshikitsha** (Matabeleland).\n   - Visual arts: Soapstone sculpture, Binga basket weaving, and traditional pottery.\n\n*Safety Tip:* Always complete a 5-minute warm-up before sports and cool-down stretches afterwards!`;
      }

      return `### ZIMSEC Primary Education Solution (Official 6-Subject Syllabus)\n\nTo answer your question: **"${question}"**\n\n1. **Primary Concept Explanation:**\n   In the ZIMSEC Primary (Grade 1 - 7) Heritage-Based curriculum, this topic tests your understanding of foundational facts, correct vocabulary, and real-world Zimbabwean examples.\n\n2. **Key Points to Remember for Grade 7:**\n   - Read the question instructions carefully (e.g. *State*, *Name*, *Calculate*, or *Give two reasons*).\n   - Write neat answers with proper units and spelling.\n\n3. **Revision Suggestion:**\n   Practice similar questions in **Exam Mode** under the Grade 7 past exam papers!`;
    }

    // === TERTIARY EDUCATION RESPONSES ===
    if (isTertiary) {
      return `### Tertiary & Higher Education Analysis\n\n**Research Inquiry:** "${question}"\n\n1. **Theoretical Framework:**\n   In advanced academic literature, addressing this requires evaluating foundational theoretical models, empirical methodologies, and contextual boundary conditions.\n\n2. **Critical Discourse & Evaluation:**\n   - Consider both quantitative econometric/structural paradigms and qualitative phenomenological perspectives.\n   - Assess underlying assumptions, internal/external validity, and recent peer-reviewed findings in the discipline.\n\n3. **Application & Research Implications:**\n   Align your analysis with standard academic formatting and cite primary empirical sources in your dissertation or module assignments.`;
    }

    const isALevel = level.toLowerCase().includes('a-level') || level.toLowerCase().includes('alevel');

    // === A-LEVEL (FORMS 5 - 6) RESPONSES ===
    if (isALevel) {
      if (qLower.includes('photosynthesis')) {
        return `### A-Level Biology: Cellular Photosynthesis & Photophosphorylation\n\nAt Advanced Level, photosynthesis is analysed as two coordinated biochemical phases:\n\n1. **Light-Dependent Phase (Thylakoid Membrane):**\n   - Photolysis of water: $2\\text{H}_2\\text{O} \\rightarrow 4\\text{H}^+ + 4\\text{e}^- + \\text{O}_2$.\n   - Non-cyclic photophosphorylation generates ATP via proton gradient (chemiosmosis) and reduced NADP (NADPH).\n   - Cyclic photophosphorylation involves only Photosystem I to supply additional ATP.\n\n2. **Light-Independent Phase / Calvin Cycle (Stroma):**\n   - Carbon fixation catalysed by **RuBisCO**: $\\text{CO}_2$ combines with ribulose bisphosphate (RuBP) to yield glycerate-3-phosphate (GP).\n   - GP is reduced to triose phosphate (TP) using ATP and NADPH.\n   - Regeneration of RuBP consumes further ATP.\n\n**ZIMSEC A-Level Exam Criteria:**\n- Always state the cellular sub-compartment (thylakoid lumen, stroma, granum).\n- Be prepared to analyse limiting factor graph gradients and explain photorespiration at elevated temperatures.`;
      }

      if (qLower.includes('differentiation') || qLower.includes('calculus') || qLower.includes('first principles')) {
        return `### ZIMSEC A-Level Pure Mathematics 6042: Differentiation\n\n1. **Differentiation from First Principles:**\n   $$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n   *Standard proof for $f(x) = x^n$ involves binomial expansion and factorising $h$.\n\n2. **Core Operational Rules:**\n   - **Chain Rule (Function of a function):** $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$\n   - **Product Rule:** $\\frac{d}{dx}[uv] = u \\frac{dv}{dx} + v \\frac{du}{dx}$\n   - **Quotient Rule:** $\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{v \\frac{du}{dx} - u \\frac{dv}{dx}}{v^2}$\n\n3. **Exam Technique Tip:**\n   Check whether the question demands exact surd/logarithmic form or numerical approximations. Do not drop integration constants in differential equations!`;
      }

      return `### ZIMSEC A-Level (Forms 5 & 6) Solution\n\n**Topic Inquiry:** "${question}"\n\n1. **Advanced Theoretical Concept:**\n   In ZIMSEC Advanced Level, examination questions assess deep synthesis, structured evaluation, and rigorous derivations rather than simple recall.\n\n2. **Structured Analysis & Marking Points:**\n   - Provide precise technical definitions, units, and relevant formulas.\n   - Cite standard Zimbabwean case studies or industrial/economic models where applicable.\n   - For essay questions (History, Geography, Economics, Divinity), ensure a balanced thesis statement with paired counter-arguments and a decisive conclusion.\n\n3. **Specimen Paper Revision:**\n   Select the corresponding A-Level subject in **Exam Mode** to practice real 150-question specimen and past examination sets!`;
    }

    // === O-LEVEL (FORMS 1 - 4) RESPONSES ===
    if (qLower.includes('photosynthesis')) {
      return `### Photosynthesis in Green Plants (ZIMSEC Combined Science / O-Level Biology)\n\nPhotosynthesis is the fundamental biological process where chlorophyll-containing plant cells absorb light energy to produce chemical energy (glucose).\n\n**Word Equation:**\nCarbon Dioxide + Water --(Light & Chlorophyll)--> Glucose + Oxygen\n\n**Balanced Chemical Equation:**\n6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n\n**ZIMSEC O-Level Exam Tips:**\n1. Testing a leaf for starch requires boiling in water (kills leaf), boiling in ethanol (removes chlorophyll), rinsing in warm water (softens leaf), and adding iodine solution (blue-black indicates starch).\n2. Limiting factors tested in Paper 1 and 2: Light intensity, CO₂ concentration, and temperature.`;
    }

    if (qLower.includes('great zimbabwe') || qLower.includes('mutapa') || qLower.includes('rozvi')) {
      return `### Medieval Zimbabwean Empires: Great Zimbabwe, Mutapa, and Rozvi (O-Level History 2167)\n\n1. **Great Zimbabwe (1200 - 1450 AD):**\n   - Renowned for granite dry-stone architecture without mortar (Great Enclosure, Conical Tower, Hill Complex).\n   - Economy rested on cattle pastoralism, gold and ivory trade with Swahili/Arab traders via Sofala port, and agriculture.\n   - Religious reverence centered on Mwari and the sacred soapstone Zimbabwe Birds (*hungwe*).\n\n2. **Mutapa State:**\n   - Founded by Nyatsimba Mutota as trade and pasture moved north toward the Zambezi River.\n\n3. **Rozvi State (Changamire):**\n   - Famous for military prowess and driving Portuguese forces out of the Zimbabwean plateau in the late 17th century.`;
    }

    if (qLower.includes('compound interest') || qLower.includes('simple interest')) {
      return `### Mathematics: Interest Calculations (ZIMSEC O-Level Syllabus 4004)\n\n**1. Simple Interest (I):**\n$$I = \\frac{P \\times R \\times T}{100}$$\n- $P$ = Principal amount (initial sum)\n- $R$ = Rate of interest per annum (%)\n- $T$ = Time period in years\n- Total Amount $A = P + I$\n\n**2. Compound Interest (A):**\n$$A = P \\left(1 + \\frac{R}{100}\\right)^n$$\n- $n$ = Number of compounding periods (years)\n- Compound Interest earned = $A - P$\n\n*Exam Tip:* In ZIMSEC Paper 1, watch out whether compounding is done annually, semi-annually, or quarterly!`;
    }

    return `### ZIMSEC O-Level (Forms 1 - 4) Solution\n\nTo answer: **"${question}"**\n\n1. **Core Concept Overview:**\n   In the ZIMSEC O-Level curriculum, this topic tests your understanding of core definitions, factual accuracy, and real-world Zimbabwean applications.\n\n2. **Detailed Breakdown:**\n   - Ensure your answers directly address the instructional command word (e.g., *State*, *Describe*, *Explain*, *Calculate*, or *Evaluate*).\n   - Highlight specific examples from Zimbabwe where relevant (e.g. natural farming regions, local industrial practices, or historical states).\n\n3. **Revision Tip:**\n   Cross-check this topic in your official ZIMSEC syllabus study pack or test your skills in **Exam Mode**!`;
  }
}
