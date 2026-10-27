import { ExamManifestItem, ExamPaper, ExamQuestion } from '../types';

export class ExamStore {
  private static manifest: ExamManifestItem[] = [];
  private static isLoaded = false;
  private static papersCache = new Map<string, ExamPaper>();

  private static normalizeLevel(level: string): string {
    return level.replace(/-/g, '').replace(/\s+/g, '').toLowerCase();
  }

  static async loadManifest(): Promise<ExamManifestItem[]> {
    if (this.isLoaded) return this.manifest;
    try {
      const res = await fetch('/assets/exam_manifest.json');
      if (res.ok) {
        this.manifest = await res.json();
      }
    } catch {
      this.manifest = [];
    }
    this.isLoaded = true;
    return this.manifest;
  }

  static async getSubjects(level: string): Promise<string[]> {
    const manifest = await this.loadManifest();
    const normLevel = this.normalizeLevel(level);

    const highLevelSubjects = new Set([
      'Biology', 'Chemistry', 'Combined Science', 'Computer Science',
      'Economics', 'Geography', 'History', 'Physics', 'Pure Mathematics', 'Statistics'
    ]);

    return Array.from(
      new Set(
        manifest
          .filter((item) => {
            const paperLevel = this.normalizeLevel(item.level);
            if (normLevel === 'primary') {
              return paperLevel === 'primary' || paperLevel === 'grade7' || (paperLevel === 'general' && !highLevelSubjects.has(item.subject));
            }
            if (normLevel === 'olevel') {
              return paperLevel === 'olevel' || paperLevel === 'general';
            }
            if (normLevel === 'alevel') {
              return paperLevel === 'alevel';
            }
            return true;
          })
          .map((i) => i.subject)
      )
    ).sort();
  }

  static async getPapers(level: string, subject?: string): Promise<ExamManifestItem[]> {
    const manifest = await this.loadManifest();
    const normLevel = this.normalizeLevel(level);

    const highLevelSubjects = new Set([
      'Biology', 'Chemistry', 'Combined Science', 'Computer Science',
      'Economics', 'Geography', 'History', 'Physics', 'Pure Mathematics', 'Statistics'
    ]);

    return manifest.filter((item) => {
      const paperLevel = this.normalizeLevel(item.level);
      const matchesLevel =
        normLevel === 'primary'
          ? paperLevel === 'primary' || paperLevel === 'grade7' || (paperLevel === 'general' && !highLevelSubjects.has(item.subject))
          : normLevel === 'olevel'
          ? paperLevel === 'olevel' || paperLevel === 'general'
          : normLevel === 'alevel'
          ? paperLevel === 'alevel'
          : true;

      const matchesSubject = !subject || item.subject.toLowerCase() === subject.toLowerCase();
      return matchesLevel && matchesSubject;
    });
  }

  static async loadPaperDetails(item: ExamManifestItem): Promise<ExamPaper | null> {
    if (this.papersCache.has(item.file)) {
      return this.papersCache.get(item.file)!;
    }

    try {
      const res = await fetch(`/assets/${encodeURIComponent(item.file)}`);
      if (!res.ok) return null;
      const raw = await res.json();
      const info = raw.paperInfo || {};
      const questionsRaw = raw.questions || [];

      const questions: ExamQuestion[] = questionsRaw.map((q: any, idx: number) => {
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
        subject: info.subject || item.subject,
        level: info.level || item.level,
        paperCode: info.paperCode || item.paperCode,
        paperName: info.paperName || item.paperName,
        paperType: info.paperType || item.paperType,
        questions,
        sourceFile: item.file
      };

      this.papersCache.set(item.file, paper);
      return paper;
    } catch {
      return null;
    }
  }
}
