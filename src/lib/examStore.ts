import { ExamManifestItem, ExamPaper, ExamQuestion } from '../types';
import { StorageManager } from './storage';
import bundledExamManifest from '../data/exam_manifest.json';
import bundledBiologyOLevel from '../data/exam_bank_biology_o_level_cambridge_past_papers.json';
import bundledAgric4001 from '../data/exam_bank_agriculture_4001_1.json';
import { BOTSWANA_EXAM_MANIFEST, BOTSWANA_EXAM_PAPERS } from '../data/botswanaExamBank';
import { SOUTH_AFRICA_EXAM_MANIFEST, SOUTH_AFRICA_EXAM_PAPERS } from '../data/southAfricaExamBank';

export class ExamStore {
  private static manifest: ExamManifestItem[] = Array.isArray(bundledExamManifest)
    ? (bundledExamManifest as unknown as ExamManifestItem[])
    : [];
  private static isLoaded = true;
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
    // 100% offline instant access from bundled manifest (0ms latency)
    if (this.manifest && this.manifest.length > 0) {
      return this.manifest;
    }
    try {
      const res = await fetch('/assets/exam_manifest.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.manifest = data;
        }
      }
    } catch {
      // Offline fallback
    }
    return this.manifest;
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
    fileName?: string,
    isBw: boolean = false,
    isZa: boolean = false
  ): string {
    const s = (subject || '').toLowerCase();
    const n = (paperName || '').toLowerCase();
    const f = (fileName || '').toLowerCase();
    const combined = `${s} ${n} ${f}`;

    if (s.includes('setswana') || f.includes('setswana') || n.includes('setswana')) {
      return 'Setswana';
    }

    if (isZa && (s.includes('natural') || f.includes('natsci'))) {
      return 'Natural Sciences & Technology';
    }

    if (isZa && (s.includes('economic') || s.includes('ems'))) {
      return 'Economic & Management Sciences';
    }

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

    // 5. Social Science / Social Studies / Social Sciences (CAPS)
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
      return isBw ? 'Social Studies' : isZa ? 'Social Sciences' : 'Social Science';
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
      return isZa ? 'Natural Sciences & Technology' : 'Agric, Science & Tech';
    }

    return isZa ? 'Social Sciences' : 'Social Science';
  }

  /**
   * Returns true if an exam paper belongs specifically to Zimbabwe local/indigenous/heritage
   * examinations so non-Zimbabwe accounts only see universal/international papers.
   */
  public static isZimbabweSpecificPaper(item: ExamManifestItem): boolean {
    const s = (item.subject || '').toLowerCase();
    const n = (item.paperName || '').toLowerCase();
    const f = (item.file || '').toLowerCase();
    const c = (item.paperCode || '').toLowerCase();
    const combined = `${s} ${n} ${f} ${c}`;

    if (
      combined.includes('zimbabwe') ||
      combined.includes('shona') ||
      combined.includes('chishona') ||
      combined.includes('ndebele') ||
      combined.includes('isindebele') ||
      combined.includes('social science') ||
      combined.includes('general paper') ||
      combined.includes('genpaper') ||
      combined.includes('heritage') ||
      combined.includes('family and religious') ||
      f.includes('705_') ||
      f.includes('7050') ||
      c.startsWith('705/') ||
      c.startsWith('7050/') ||
      c.startsWith('7040/') ||
      c.startsWith('4007/') ||
      c.startsWith('4047/') ||
      c.startsWith('6039/02') ||
      c.startsWith('9155/1') ||
      f.includes('history_olevel_2167') ||
      f.includes('history_alevel_9155_paper1')
    ) {
      return true;
    }

    return false;
  }

  public static isBotswanaSpecificPaper(item: ExamManifestItem): boolean {
    const s = (item.subject || '').toLowerCase();
    const n = (item.paperName || '').toLowerCase();
    const f = (item.file || '').toLowerCase();
    const c = (item.paperCode || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    const combined = `${id} ${s} ${n} ${f} ${c}`;

    return (
      id.startsWith('bw_') ||
      f.startsWith('bw_') ||
      combined.includes('botswana') ||
      combined.includes('setswana') ||
      combined.includes('moral education') ||
      combined.includes('development studies') ||
      c.startsWith('bec-')
    );
  }

  public static isSouthAfricaSpecificPaper(item: ExamManifestItem): boolean {
    const s = (item.subject || '').toLowerCase();
    const n = (item.paperName || '').toLowerCase();
    const f = (item.file || '').toLowerCase();
    const c = (item.paperCode || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    const combined = `${id} ${s} ${n} ${f} ${c}`;

    return (
      id.startsWith('za_') ||
      f.startsWith('za_') ||
      c.startsWith('caps-') ||
      c.startsWith('nsc-') ||
      combined.includes('south africa') ||
      combined.includes('nsc matric') ||
      combined.includes('caps ')
    );
  }

  public static formatPaperLabelForCountry(
    text: string,
    isZim: boolean,
    isBw: boolean = false,
    isZa: boolean = false
  ): string {
    if (!text || isZim) return text;
    if (isBw) {
      return text
        .replace(/Cambridge\s*&\s*ZIMSEC\s*/gi, 'Cambridge / BEC ')
        .replace(/Ministry\/ZIMSEC-style/gi, 'BEC-aligned')
        .replace(/ZIMSEC-style/gi, 'BEC-style')
        .replace(/ZIMSEC-syllabus-aligned/gi, 'BEC syllabus-aligned')
        .replace(/ZIMSEC-aligned/gi, 'BEC-aligned')
        .replace(/ZIMSEC-format/gi, 'BEC-format')
        .replace(/\bZIMSEC\b\s*/gi, 'BEC ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    if (isZa) {
      return text
        .replace(/Cambridge\s*&\s*ZIMSEC\s*/gi, 'CAPS / NSC ')
        .replace(/Ministry\/ZIMSEC-style/gi, 'CAPS-aligned')
        .replace(/ZIMSEC-style/gi, 'CAPS-style')
        .replace(/ZIMSEC-syllabus-aligned/gi, 'CAPS syllabus-aligned')
        .replace(/ZIMSEC-aligned/gi, 'CAPS-aligned')
        .replace(/ZIMSEC-format/gi, 'NSC-format')
        .replace(/\bZIMSEC\b\s*/gi, 'CAPS ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    return text
      .replace(/Cambridge\s*&\s*ZIMSEC\s*/gi, 'Cambridge / International ')
      .replace(/Ministry\/ZIMSEC-style/gi, 'International')
      .replace(/ZIMSEC-style/gi, 'Standard')
      .replace(/ZIMSEC-syllabus-aligned/gi, 'Syllabus-aligned')
      .replace(/ZIMSEC-aligned/gi, 'Standard')
      .replace(/ZIMSEC-format/gi, 'Standard format')
      .replace(/\bZIMSEC\b\s*/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Returns subjects strictly aligned with the chosen level and account country.
   * Zimbabwe Primary accounts see the official ZIMSEC 6-Subject results slip structure.
   * Botswana accounts see BEC PSLE, JCE & BGCSE subjects.
   * South Africa accounts see DBE CAPS GET (Gr 1–9) & FET / NSC Matric (Gr 10–12) subjects.
   * Countries without packs return empty arrays.
   */
  static async getSubjects(level: string, country?: string): Promise<string[]> {
    if (!StorageManager.hasCountryCurriculumPack(country)) {
      return [];
    }
    const baseManifest = await this.loadManifest();
    const normLevel = this.normalizeLevel(level);
    const isZim = StorageManager.isZimbabweAccount(country);
    const isBw = StorageManager.isBotswanaAccount(country);
    const isZa = StorageManager.isSouthAfricaAccount(country);
    const combinedManifest = isBw
      ? [...BOTSWANA_EXAM_MANIFEST, ...baseManifest]
      : isZa
      ? [...SOUTH_AFRICA_EXAM_MANIFEST, ...baseManifest]
      : baseManifest;

    if (normLevel === 'primary') {
      return isZim
        ? [
            'English',
            'Mathematics',
            'Agric, Science & Tech',
            'Shona',
            'Social Science',
            'Physical Edu & Arts'
          ]
        : isBw
        ? [
            'English',
            'Setswana',
            'Mathematics',
            'Agric, Science & Tech',
            'Social Studies',
            'Physical Edu & Arts'
          ]
        : isZa
        ? [
            'English',
            'Mathematics',
            'Natural Sciences & Technology',
            'Social Sciences',
            'Physical Edu & Arts'
          ]
        : [
            'English',
            'Mathematics',
            'Agric, Science & Tech',
            'Physical Edu & Arts'
          ];
    }

    if (normLevel === 'tertiary') {
      return ['Higher Education Assessments'];
    }

    const papersForLevel = combinedManifest.filter((item) => {
      if (!this.isPaperForLevel(item, normLevel)) return false;
      if (!isZim && this.isZimbabweSpecificPaper(item)) return false;
      if (!isBw && this.isBotswanaSpecificPaper(item)) return false;
      if (!isZa && this.isSouthAfricaSpecificPaper(item)) return false;
      return true;
    });
    return Array.from(new Set(papersForLevel.map((i) => i.subject))).sort();
  }

  /**
   * Strictly filters exam papers by education level and account country!
   * Separate papers for Primary, O-Level, A-Level, and Tertiary.
   */
  static async getPapers(level: string, subject?: string, country?: string): Promise<ExamManifestItem[]> {
    if (!StorageManager.hasCountryCurriculumPack(country)) {
      return [];
    }
    const baseManifest = await this.loadManifest();
    const normLevel = this.normalizeLevel(level);
    const isZim = StorageManager.isZimbabweAccount(country);
    const isBw = StorageManager.isBotswanaAccount(country);
    const isZa = StorageManager.isSouthAfricaAccount(country);
    const combinedManifest = isBw
      ? [...BOTSWANA_EXAM_MANIFEST, ...baseManifest]
      : isZa
      ? [...SOUTH_AFRICA_EXAM_MANIFEST, ...baseManifest]
      : baseManifest;

    let papersForLevel = combinedManifest.filter((item) => {
      if (!this.isPaperForLevel(item, normLevel)) return false;
      if (!isZim && this.isZimbabweSpecificPaper(item)) return false;
      if (!isBw && this.isBotswanaSpecificPaper(item)) return false;
      if (!isZa && this.isSouthAfricaSpecificPaper(item)) return false;
      return true;
    });

    if (normLevel === 'primary') {
      papersForLevel = papersForLevel.map((item) => ({
        ...item,
        subject: this.standardizePrimarySubject(item.subject, item.paperName, item.file, isBw, isZa)
      }));
    }

    if (!isZim) {
      papersForLevel = papersForLevel.map((item) => ({
        ...item,
        paperName: this.formatPaperLabelForCountry(item.paperName, false, isBw, isZa),
        paperType: this.formatPaperLabelForCountry(item.paperType, false, isBw, isZa)
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

  static async loadPaperDetails(itemOrId: ExamManifestItem | string): Promise<ExamPaper | null> {
    if (typeof itemOrId === 'string') {
      const bwDirect = BOTSWANA_EXAM_PAPERS.find(
        (p) => p.id === itemOrId || p.sourceFile === itemOrId
      );
      if (bwDirect) {
        this.papersCache.set(`${bwDirect.sourceFile || bwDirect.id}#${bwDirect.id}`, bwDirect);
        return bwDirect;
      }
      const zaDirect = SOUTH_AFRICA_EXAM_PAPERS.find(
        (p) => p.id === itemOrId || p.sourceFile === itemOrId
      );
      if (zaDirect) {
        this.papersCache.set(`${zaDirect.sourceFile || zaDirect.id}#${zaDirect.id}`, zaDirect);
        return zaDirect;
      }
      const manifestItem = [
        ...BOTSWANA_EXAM_MANIFEST,
        ...SOUTH_AFRICA_EXAM_MANIFEST,
        ...(await this.loadManifest())
      ].find((m) => m.id === itemOrId || m.file === itemOrId);
      if (!manifestItem) return null;
      return this.loadPaperDetails(manifestItem);
    }

    const item = itemOrId;
    const cacheKey = `${item.file}#${item.id || item.paperCode || ''}`;
    
    // 1. In-memory cache hit
    if (this.papersCache.has(cacheKey)) {
      return this.papersCache.get(cacheKey)!;
    }

    // 1b. Bundled Botswana BEC Exam Bank (0ms instant offline)
    const bwPaper = BOTSWANA_EXAM_PAPERS.find(
      (p) => p.id === item.id || p.sourceFile === item.file
    );
    if (bwPaper) {
      this.papersCache.set(cacheKey, bwPaper);
      return bwPaper;
    }

    // 1c. Bundled South Africa CAPS & NSC Exam Bank (0ms instant offline)
    const zaPaper = SOUTH_AFRICA_EXAM_PAPERS.find(
      (p) => p.id === item.id || p.sourceFile === item.file
    );
    if (zaPaper) {
      this.papersCache.set(cacheKey, zaPaper);
      return zaPaper;
    }

    // 2. Check localStorage offline persistent cache (v5 for official subject headlines & verified banks)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const localCached = window.localStorage.getItem(`zexa_exam_paper_v5_${cacheKey}`);
        if (localCached) {
          const parsed = JSON.parse(localCached);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            this.papersCache.set(cacheKey, parsed);
            return parsed;
          }
        }
      }
    } catch {
      // LocalStorage error fallback
    }

    // 3. Bundled offline paper fallback (100% offline instant)
    let raw: any = null;
    const fLower = (item.file || '').toLowerCase();
    if (fLower.includes('biology_o_level_cambridge') || item.id === 'exam_bank_biology_o_level_cambridge_past_papers') {
      raw = bundledBiologyOLevel;
    } else if (fLower.includes('agriculture_4001_1') || item.id === 'exam_bank_agriculture_4001_1') {
      raw = bundledAgric4001;
    }

    // 4. If not bundled, fetch from /assets with timeout
    if (!raw) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

        const assetUrl = typeof window === 'undefined'
          ? `http://localhost:3000/assets/${encodeURIComponent(item.file)}`
          : `/assets/${encodeURIComponent(item.file)}`;
        const res = await fetch(assetUrl, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          raw = await res.json();
        }
      } catch (err) {
        // Offline or network timeout
      }
    }

    // If asset could not be loaded (e.g. completely offline and not yet cached), return null cleanly
    if (!raw) {
      return null;
    }

    try {
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
        const rawOptions = Array.isArray(q?.options) ? q.options : [];
        const options = rawOptions.map((opt: any, optIdx: number) => {
          if (typeof opt === 'string') {
            return { letter: String.fromCharCode(65 + optIdx), text: opt };
          }
          return { letter: opt?.letter || String.fromCharCode(65 + optIdx), text: opt?.text || '' };
        });

        return {
          id: q?.id || `q_${idx + 1}`,
          questionNumber: q?.questionNumber || idx + 1,
          questionText: q?.questionText || `Question ${idx + 1}`,
          options: options || [],
          correctAnswer: q?.correctAnswer || null,
          explanation: q?.explanation || q?.expectedAnswer || q?.modelAnswer || '',
          answerConfidence: q?.answerConfidence || 'medium'
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

      // Cache in memory and localStorage for instant offline access
      this.papersCache.set(cacheKey, paper);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`zexa_exam_paper_v5_${cacheKey}`, JSON.stringify(paper));
        }
      } catch {
        // LocalStorage quota fallback
      }

      return paper;
    } catch {
      return null;
    }
  }
}
