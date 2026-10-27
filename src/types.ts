export type EducationLevel = 'Primary Education' | 'Secondary Education' | 'Tertiary Education';
export type ContentLevel = 'Primary' | 'O-Level' | 'A-Level' | 'Tertiary';

export type SubscriptionStatus = 'FREE' | 'PREMIUM' | 'HOLIDAY_FREE';

export interface KnowledgeChunk {
  id: string;
  level: string;
  subject: string;
  topic: string;
  content: string;
  source: string;
  keywords: string[];
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
