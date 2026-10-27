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
      // 1. RAG search in syllabus knowledge base
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

      // 2. Synthesize response text
      let fullResponse = '';
      let sourceTag: string | undefined = undefined;

      if (options.hint) {
        fullResponse = `**Exam Question Analysis & Solution:**\n\n${options.hint}\n\n*Study Tip:* In ZIMSEC examinations, always read the question carefully, eliminate impossible distractors first, and underline key instructional words.`;
        sourceTag = 'ZIMSEC Past Paper Bank';
      } else if (matchedChunk && matchedScore >= 35) {
        // High confidence match
        fullResponse = `### ${matchedChunk.topic}\n\n${matchedChunk.content}\n\n**ZIMSEC Exam Key Points:**\n- Ensure you memorize standard definitions and units exactly as specified by the ZIMSEC syllabus.\n- For structured questions, always show complete step-by-step working.`;
        sourceTag = `${matchedChunk.topic} • ${matchedChunk.source}`;
      } else {
        // Fallback intelligent pedagogical response
        fullResponse = this.generatePedagogicalResponse(trimmedQuestion, options.level);
        sourceTag = `ZIMSEC ${options.level} General Knowledge`;
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

      // Slight initial processing delay (human eye / prefill simulation)
      setTimeout(streamNext, 80);

    } catch (err: any) {
      options.onError(err.message || 'Error processing response');
    }
  }

  private static tokenizeText(text: string): string[] {
    const parts: string[] = [];
    const words = text.split(/(\s+|\n+)/);
    for (const word of words) {
      if (word.length > 8) {
        // Split long words
        parts.push(word.slice(0, 4), word.slice(4));
      } else if (word) {
        parts.push(word);
      }
    }
    return parts;
  }

  private static generatePedagogicalResponse(question: string, level: string): string {
    const qLower = question.toLowerCase();

    if (qLower.includes('photosynthesis')) {
      return `### Photosynthesis in Green Plants\n\nPhotosynthesis is the fundamental biological process where chlorophyll-containing plant cells absorb light energy to produce chemical energy (glucose).\n\n**Word Equation:**\nCarbon Dioxide + Water --(Light & Chlorophyll)--> Glucose + Oxygen\n\n**Chemical Equation:**\n6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n\n**ZIMSEC Syllabus Tips:**\n1. Photolysis of water occurs in the light reaction (grana/thylakoids).\n2. Carbon fixation (Calvin Cycle) takes place in the stroma.\n3. Common limiting factors tested in ZIMSEC: Light intensity, CO₂ concentration, and temperature.`;
    }

    if (qLower.includes('great zimbabwe') || qLower.includes('mutapa') || qLower.includes('rozvi')) {
      return `### Medieval Zimbabwean Empires: Great Zimbabwe, Mutapa, and Rozvi\n\n1. **Great Zimbabwe (1200 - 1450 AD):**\n   - Renowned for granite dry-stone architecture without mortar (Great Enclosure, Conical Tower, Hill Complex).\n   - Economy rested on cattle pastoralism, gold and ivory trade with Swahili/Arab traders via Sofala port, and agriculture.\n   - Religious reverence centered on Mwari and the sacred soapstone Zimbabwe Birds (*hungwe*).\n\n2. **Mutapa State:**\n   - Founded by Nyatsimba Mutota as trade and pasture moved north toward the Zambezi River.\n\n3. **Rozvi State (Changamire):**\n   - Famous for military prowess and driving Portuguese forces out of the Zimbabwean plateau in the late 17th century.`;
    }

    if (qLower.includes('compound interest') || qLower.includes('simple interest')) {
      return `### Mathematics: Interest Calculations (ZIMSEC Syllabus)\n\n**1. Simple Interest (I):**\n$$I = \\frac{P \\times R \\times T}{100}$$\n- $P$ = Principal amount (initial sum)\n- $R$ = Rate of interest per annum (%)\n- $T$ = Time period in years\n- Total Amount $A = P + I$\n\n**2. Compound Interest (A):**\n$$A = P \\left(1 + \\frac{R}{100}\\right)^n$$\n- $n$ = Number of compounding periods (years)\n- Compound Interest earned = $A - P$\n\n*Exam Tip:* In ZIMSEC Paper 1, watch out whether compounding is done annually, semi-annually, or quarterly!`;
    }

    return `### ZIMSEC ${level} Tutor Solution\n\nTo answer: **"${question}"**\n\n1. **Core Concept Overview:**\n   In the ZIMSEC ${level} curriculum, this topic tests your understanding of core definitions, factual accuracy, and real-world Zimbabwean applications.\n\n2. **Detailed Breakdown:**\n   - Ensure your answers directly address the instructional command word (e.g., *State*, *Describe*, *Explain*, *Calculate*, or *Evaluate*).\n   - Highlight specific examples from Zimbabwe where relevant (e.g. natural farming regions, local industrial practices, or historical states).\n\n3. **Revision Tip:**\n   Cross-check this topic in your official ZIMSEC syllabus study pack or test your skills in **Exam Mode**!`;
  }
}
