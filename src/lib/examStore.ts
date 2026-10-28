import { ExamManifestItem, ExamPaper, ExamQuestion } from '../types';

export class ExamStore {
  private static manifest: ExamManifestItem[] = [];
  private static isLoaded = false;
  private static loadPromise: Promise<ExamManifestItem[]> | null = null;
  private static papersCache = new Map<string, ExamPaper>();

  private static normalizeLevel(level: string): string {
    const l = (level || '').replace(/-/g, '').replace(/\s+/g, '').toLowerCase();
    if (l.includes('primary') || l.includes('grade')) return 'primary';
    if (l.includes('alevel') || l.includes('form5') || l.includes('form6')) return 'alevel';
    if (l.includes('olevel') || l.includes('form1') || l.includes('form2') || l.includes('form3') || l.includes('form4')) return 'olevel';
    if (l.includes('tertiary') || l.includes('university') || l.includes('college')) return 'tertiary';
    return l;
  }

  static async loadManifest(): Promise<ExamManifestItem[]> {
    if (this.isLoaded) return this.manifest;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const res = await fetch('/assets/exam_manifest.json');
        if (res.ok) {
          const data = await res.json();
          this.manifest = Array.isArray(data) ? data : [];
        }
      } catch {
        this.manifest = [];
      }
      this.isLoaded = true;
      return this.manifest;
    })();

    return this.loadPromise;
  }

  private static isPaperForLevel(item: ExamManifestItem, normLevel: string): boolean {
    const pLvl = this.normalizeLevel(item.level);
    const fName = item.file.toLowerCase();
    const pName = item.paperName.toLowerCase();

    const isPrimary =
      pLvl === 'primary' || pLvl === 'grade7' || fName.includes('grade7') || fName.includes('primary');

    if (normLevel === 'primary') {
      return isPrimary;
    }

    if (isPrimary) {
      return false;
    }

    const isALevel =
      pLvl === 'alevel' ||
      fName.includes('a_level') ||
      fName.includes('alevel') ||
      pName.includes('a-level') ||
      pName.includes('a level');

    if (normLevel === 'alevel') {
      return isALevel;
    }

    if (normLevel === 'olevel') {
      return !isALevel;
    }

    if (normLevel === 'tertiary') {
      return false;
    }

    // Generic Secondary fallback
    return true;
  }

  /**
   * Standardizes Primary subjects according to the official ZIMSEC Grade 7 6-Subject format:
   * 1. English
   * 2. Mathematics
   * 3. Agric, Science & Tech
   * 4. Shona
   * 5. Social Science
   * 6. Physical Edu & Arts
   */
  public static standardizePrimarySubject(
    subject?: string,
    paperName?: string,
    fileName?: string
  ): string {
    const s = (subject || '').toLowerCase();
    const n = (paperName || '').toLowerCase();
    const f = (fileName || '').toLowerCase();
    const combined = `${s} ${n} ${f}`;

    // 1. English
    if (s.includes('english') || f.includes('english') || n.includes('english')) {
      return 'English';
    }

    // 2. Mathematics
    if (s.includes('math') || f.includes('math') || n.includes('math')) {
      return 'Mathematics';
    }

    // 3. Shona / Indigenous Language
    if (
      s.includes('shona') ||
      f.includes('shona') ||
      n.includes('shona') ||
      s.includes('ndebele') ||
      f.includes('ndebele') ||
      n.includes('ndebele')
    ) {
      return 'Shona';
    }

    // 4. Physical Edu & Arts (PE, Performing Arts, Visual Arts)
    if (
      s.includes('physical') ||
      s.includes('arts') ||
      f.includes('physical') ||
      f.includes('7130') ||
      n.includes('physical education') ||
      /\b(pe|pea|arts)\b/i.test(combined)
    ) {
      return 'Physical Edu & Arts';
    }

    // 5. Social Science (Social Studies, Heritage Studies, FRME, General Paper)
    if (
      s.includes('social') ||
      f.includes('social') ||
      n.includes('social') ||
      s.includes('heritage') ||
      f.includes('heritage') ||
      s.includes('general') ||
      f.includes('general') ||
      f.includes('705')
    ) {
      return 'Social Science';
    }

    // 6. Agric, Science & Tech (Agriculture, Science, Technology, ICT)
    if (
      s.includes('agri') ||
      f.includes('agri') ||
      n.includes('agri') ||
      s.includes('science') ||
      f.includes('science') ||
      n.includes('science') ||
      s.includes('tech') ||
      f.includes('tech') ||
      s.includes('ict')
    ) {
      return 'Agric, Science & Tech';
    }

    return 'Social Science';
  }

  /**
   * Returns subjects strictly aligned with the chosen level.
   * For Primary, returns the official ZIMSEC 6-Subject results slip structure.
   * For O-Level, returns only O-Level exam subjects.
   * For A-Level, returns only A-Level exam subjects.
   */
  static async getSubjects(level: string): Promise<string[]> {
    const manifest = await this.loadManifest();
    const normLevel = this.normalizeLevel(level);

    if (normLevel === 'primary') {
      return [
        'English',
        'Mathematics',
        'Agric, Science & Tech',
        'Shona',
        'Social Science',
        'Physical Edu & Arts'
      ];
    }

    if (normLevel === 'tertiary') {
      return ['Higher Education Assessments'];
    }

    const papersForLevel = manifest.filter((item) => this.isPaperForLevel(item, normLevel));
    return Array.from(new Set(papersForLevel.map((i) => i.subject))).sort();
  }

  /**
   * Strictly filters exam papers by education level!
   * Separate papers for Primary, O-Level (Forms 1-4), and A-Level (Forms 5-6).
   */
  static async getPapers(level: string, subject?: string): Promise<ExamManifestItem[]> {
    const manifest = await this.loadManifest();
    const normLevel = this.normalizeLevel(level);

    let papersForLevel = manifest.filter((item) => this.isPaperForLevel(item, normLevel));

    if (normLevel === 'primary') {
      papersForLevel = papersForLevel.map((item) => ({
        ...item,
        subject: this.standardizePrimarySubject(item.subject, item.paperName, item.file)
      }));
    }

    if (!subject || subject === 'All') {
      return papersForLevel;
    }

    const sLower = subject.toLowerCase();
    return papersForLevel.filter((item) => {
      const itemSubj = item.subject.toLowerCase();
      return itemSubj === sLower;
    });
  }

  static async loadPaperDetails(item: ExamManifestItem): Promise<ExamPaper | null> {
    const cacheKey = `${item.file}#${item.id || item.paperCode || ''}`;
    if (this.papersCache.has(cacheKey)) {
      return this.papersCache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`/assets/${encodeURIComponent(item.file)}`);
      if (!res.ok) return null;
      const raw = await res.json();

      const isPaper2 =
        item.paperCode?.includes('/2') ||
        item.paperCode?.includes('-2') ||
        item.paperName?.toLowerCase().includes('paper 2');

      const info =
        (isPaper2 ? raw.paper2Info : raw.paper1Info) ||
        raw.paperInfo ||
        {};

      let questionsRaw = raw.questions;
      if (!questionsRaw || questionsRaw.length === 0) {
        if (isPaper2) {
          questionsRaw = raw.paper2Questions || raw.paper1Questions || [];
        } else {
          questionsRaw = raw.paper1Questions || raw.paper2Questions || [];
        }
      }

      const questions: ExamQuestion[] = (questionsRaw || []).map((q: any, idx: number) => {
        const rawOptions = q.options || [];
        const options = rawOptions.map((opt: any, optIdx: number) => {
          if (typeof opt === 'string') {
            return { letter: String.fromCharCode(65 + optIdx), text: opt };
          }
          return { letter: opt.letter || String.fromCharCode(65 + optIdx), text: opt.text || '' };
        });

        return {
          id: q.id || `q_${idx + 1}`,
          questionNumber: q.questionNumber || idx + 1,
          questionText: q.questionText || '',
          options,
          correctAnswer: q.correctAnswer || null,
          explanation: q.explanation || '',
          answerConfidence: q.answerConfidence || 'medium'
        };
      });

      const paper: ExamPaper = {
        id: item.id,
        subject: item.subject || info.subject,
        level: item.level || info.level,
        paperCode: item.paperCode || info.paperCode,
        paperName: item.paperName || info.paperName,
        paperType: item.paperType || info.paperType,
        questions,
        sourceFile: item.file
      };

      this.papersCache.set(cacheKey, paper);
      return paper;
    } catch {
      return null;
    }
  }
}
