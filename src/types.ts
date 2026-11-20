export type EducationLevel =
  | 'Primary Education'
  | 'O-Level (Form 1 to 4)'
  | 'A-Level (Form 5 to 6)'
  | 'Secondary: O-Level (Forms 1 - 4)'
  | 'Secondary: A-Level (Forms 5 - 6)'
  | 'Secondary Education'
  | 'Tertiary Education';
export type ContentLevel = 'Primary' | 'O-Level' | 'A-Level' | 'Tertiary';

export type SubscriptionStatus = 'FREE' | 'PREMIUM' | 'HOLIDAY_FREE';

export type AIEngineType = 'zexa-instant' | 'zexa-neural';

export interface KnowledgeChunk {
  id: string;
  level: string;
  subject: string;
  topic: string;
  content: string;
  source: string;
  keywords: string[];
  summary?: string;
  hasVisual?: boolean;
  diagramId?: string | null;
  visualTitle?: string | null;
  visualCaption?: string | null;
  assetFile?: string;
  assetIdx?: number;
}

export interface ExamOption {
  letter: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: ExamOption[];
  correctAnswer: string | null;
  explanation: string;
  answerConfidence: string;
}

export interface ExamPaper {
  id: string;
  subject: string;
  level: string;
  paperCode: string;
  paperName: string;
  paperType: string;
  questions: ExamQuestion[];
  sourceFile: string;
}

export interface ExamManifestItem {
  id: string;
  file: string;
  subject: string;
  level: string;
  paperCode: string;
  paperName: string;
  paperType: string;
  questionCount: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  metrics?: string | null;
  source?: string | null;
  suggestions?: string[];
}

export interface AcademicTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  requiresPayment: boolean;
  price: number;
}

export interface UserSubscription {
  isPremium: boolean;
  hasPaidBefore: boolean;
  paidForLevel: EducationLevel;
  paidForTerm: string;
  termEndDate: number;
}

export interface CountryConfig {
  id: string;
  code: string;
  flag: string;
  name: string;
  region?: string;
  curriculum: string;
  curriculumLabel: string;
  hasCurriculumPack?: boolean;
  badge: string;
  description: string;
}

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    id: 'Zimbabwe',
    code: 'ZW',
    flag: '🇿🇼',
    name: 'Zimbabwe',
    region: 'Africa',
    curriculum: 'ZIMSEC & Heritage-Based Curriculum',
    curriculumLabel: 'ZIMSEC & Heritage-Based Curriculum',
    hasCurriculumPack: true,
    badge: 'ZIMSEC · HBC',
    description: 'Full Zimbabwe national data, ZIMSEC Grade 7, O-Level & A-Level syllabi, ChiShona/IsiNdebele, and Heritage Studies.'
  },
  {
    id: 'South Africa',
    code: 'ZA',
    flag: '🇿🇦',
    name: 'South Africa',
    curriculum: 'Global & CAPS-Aligned Academics',
    curriculumLabel: 'Global & CAPS-Aligned Academics',
    badge: 'Global STEM',
    description: 'International STEM, Mathematics, Sciences, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'Zambia',
    code: 'ZM',
    flag: '🇿🇲',
    name: 'Zambia',
    curriculum: 'Global & Regional Academics',
    curriculumLabel: 'Global & Regional Academics',
    badge: 'Global STEM',
    description: 'International STEM, Mathematics, Sciences, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'Botswana',
    code: 'BW',
    flag: '🇧🇼',
    name: 'Botswana',
    curriculum: 'Global & Cambridge Academics',
    curriculumLabel: 'Global & Cambridge Academics',
    badge: 'Cambridge / Global',
    description: 'International STEM, Mathematics, Sciences, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'Namibia',
    code: 'NA',
    flag: '🇳🇦',
    name: 'Namibia',
    curriculum: 'Global & NSSCO Academics',
    curriculumLabel: 'Global & NSSCO Academics',
    badge: 'Global STEM',
    description: 'International STEM, Mathematics, Sciences, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'Kenya',
    code: 'KE',
    flag: '🇰🇪',
    name: 'Kenya',
    curriculum: 'Global & International Academics',
    curriculumLabel: 'Global & International Academics',
    badge: 'Global STEM',
    description: 'International STEM, Mathematics, Sciences, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'Nigeria',
    code: 'NG',
    flag: '🇳🇬',
    name: 'Nigeria',
    curriculum: 'Global & International Academics',
    curriculumLabel: 'Global & International Academics',
    badge: 'Global STEM',
    description: 'International STEM, Mathematics, Sciences, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'United Kingdom',
    code: 'UK',
    flag: '🇬🇧',
    name: 'United Kingdom',
    curriculum: 'Cambridge / GCSE & A-Level',
    curriculumLabel: 'Cambridge / GCSE & A-Level',
    badge: 'Cambridge / UK',
    description: 'International Sciences, Mathematics, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'United States',
    code: 'US',
    flag: '🇺🇸',
    name: 'United States',
    curriculum: 'Global STEM & General Studies',
    curriculumLabel: 'Global STEM & General Studies',
    badge: 'Global STEM',
    description: 'International Sciences, Mathematics, English, and Global Reasoning without Zimbabwe-only local data.'
  },
  {
    id: 'International / Other',
    code: 'GLB',
    flag: '🌍',
    name: 'International / Other',
    curriculum: 'Global International Curriculum',
    curriculumLabel: 'Global International Curriculum',
    badge: 'Global',
    description: 'Global Sciences, Mathematics, English, and AI Reasoning without Zimbabwe-only local data.'
  }
];

export type StudyTutorMode =
  | 'standard'
  | 'step-by-step'
  | 'exam-points'
  | 'quiz-me'
  | 'simplify';

export interface SavedStudyNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  country: string;
  source?: string;
  createdAt: number;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  subject: string;
  country: string;
  mastered: boolean;
  reviewCount: number;
  createdAt: number;
  lastReviewedAt?: number;
}

export interface BookmarkedExamQuestion {
  id: string;
  paperId: string;
  paperCode: string;
  paperName: string;
  subject: string;
  level: string;
  country: string;
  questionNumber: number;
  questionText: string;
  correctAnswer: string | null;
  explanation: string;
  createdAt: number;
}

export interface SavedExamScore {
  id: string;
  paperId: string;
  paperCode: string;
  paperName: string;
  subject: string;
  level: string;
  country: string;
  correct: number;
  total: number;
  percent: number;
  grade: string;
  durationSeconds?: number;
  timed: boolean;
  completedAt: number;
}

export interface SavedSearchQA {
  id: string;
  question: string;
  answer: string;
  subject: string;
  source?: string;
  tutorMode?: StudyTutorMode;
  level: string;
  country: string;
  createdAt: number;
}

export interface SavedExamQA {
  id: string;
  paperId: string;
  paperCode: string;
  paperName: string;
  subject: string;
  level: string;
  country: string;
  questionNumber: number;
  questionText: string;
  options?: ExamOption[];
  userAnswer: string | null;
  correctAnswer: string | null;
  isCorrect?: boolean;
  explanation: string;
  paperType: string;
  updatedAt: number;
}

export interface StudyActivityStats {
  streakDays: number;
  todayMinutes: number;
  totalMinutes: number;
  completedTopicsCount: number;
  savedNotesCount: number;
  flashcardsTotal: number;
  flashcardsMastered: number;
  bookmarksCount: number;
  examsCompleted: number;
  searchHistoryCount: number;
  examQACount: number;
}


