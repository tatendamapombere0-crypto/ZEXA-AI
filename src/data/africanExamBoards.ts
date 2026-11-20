import type { StudyTutorMode } from '../types';

export interface ExamBoardProfile {
  country: string;
  boardShort: string;
  boardFull: string;
  levelHint: string;
  description: string;
}

export interface StarterPromptItem {
  subject: string;
  text: string;
}

const BOARD_PROFILES: Record<string, Omit<ExamBoardProfile, 'country'>> = {
  zimbabwe: {
    boardShort: 'ZIMSEC · HBC',
    boardFull: 'ZIMSEC & Heritage-Based Curriculum',
    levelHint: 'Grade 7, O-Level (Forms 1–4), A-Level (Forms 5–6)',
    description: 'Full Zimbabwe national syllabus, past papers, ChiShona & Heritage Encyclopedia.'
  },
  'south africa': {
    boardShort: 'CAPS · NSC / IEB',
    boardFull: 'DBE CAPS · National Senior Certificate (Matric) & IEB',
    levelHint: 'GET (Grades 1–9) & FET / Matric (Grades 10–12)',
    description: 'Full South African DBE CAPS syllabus, Physical Sciences, Life Sciences, Accounting, Mathematics, History & 12 Official Languages.'
  },
  nigeria: {
    boardShort: 'WAEC · NECO · JAMB',
    boardFull: 'WAEC (SSCE), NECO & JAMB UTME',
    levelHint: 'Primary, JSS / BECE & SSS / UTME',
    description: 'Structured for WAEC, NECO, and UTME Mathematics, Sciences, English & Commerce.'
  },
  kenya: {
    boardShort: 'KCSE · CBC',
    boardFull: 'KNEC KCSE & Competency-Based Curriculum (CBC)',
    levelHint: 'Primary, Junior Secondary & Senior Secondary',
    description: 'Clear exam reasoning for KCSE & CBC Sciences, Mathematics, Humanities & Languages.'
  },
  ghana: {
    boardShort: 'WASSCE · BECE',
    boardFull: 'WAEC Ghana WASSCE & BECE',
    levelHint: 'Primary, JHS (BECE) & SHS (WASSCE)',
    description: 'Tailored for Core & Elective Mathematics, Integrated Science, Physics, Chemistry & Economics.'
  },
  zambia: {
    boardShort: 'ECZ',
    boardFull: 'Examinations Council of Zambia (ECZ)',
    levelHint: 'Grade 7, Grade 9 & Grade 12 SC',
    description: 'Focused support for ECZ Mathematics, Science, Biology, Chemistry, Physics & Commerce.'
  },
  botswana: {
    boardShort: 'BGCSE · JCE',
    boardFull: 'Botswana Examinations Council (PSLE, JCE & BGCSE)',
    levelHint: 'PSLE (Std 1–7), JCE (Forms 1–3) & BGCSE (Forms 4–5)',
    description: 'Full Botswana national syllabus, Setswana, Development Studies, Moral Education, Okavango & BEC practice papers.'
  },
  namibia: {
    boardShort: 'NSSCO · NSSCAS',
    boardFull: 'Namibia Senior Secondary Certificate (NSSCO / NSSCAS)',
    levelHint: 'Ordinary & Advanced Subsidiary Levels',
    description: 'Structured explanations for NSSCO & NSSCAS Sciences, Mathematics & Accounting.'
  },
  uganda: {
    boardShort: 'UNEB · UCE / UACE',
    boardFull: 'Uganda National Examinations Board (PLE, UCE & UACE)',
    levelHint: 'PLE, O-Level (UCE) & A-Level (UACE)',
    description: 'Step-by-step mastery for UNEB Mathematics, Physics, Chemistry, Biology & Economics.'
  },
  tanzania: {
    boardShort: 'NECTA · CSEE / ACSEE',
    boardFull: 'National Examinations Council of Tanzania (NECTA)',
    levelHint: 'PSLE, Form 4 (CSEE) & Form 6 (ACSEE)',
    description: 'Clear offline study guides for NECTA Sciences, Basic/Advanced Math, Geography & Commerce.'
  },
  malawi: {
    boardShort: 'MSCE · JCE',
    boardFull: 'Malawi National Examinations Board (MANEB MSCE)',
    levelHint: 'PSLCE, JCE & MSCE',
    description: 'Focused tutoring for MSCE Mathematics, Physical Science, Biology & Social Studies.'
  },
  rwanda: {
    boardShort: 'NESA · CBC',
    boardFull: 'Rwanda National Examination & School Inspection Authority (NESA)',
    levelHint: 'PLE, O-Level & A-Level Principal Subjects',
    description: 'Competence-based Sciences, Mathematics, Computer Science & Economics explanations.'
  },
  ethiopia: {
    boardShort: 'ESSLCE',
    boardFull: 'Ethiopian Secondary School Leaving Certificate (ESSLCE)',
    levelHint: 'Grades 1–12 & University Entrance',
    description: 'High-clarity Mathematics, Physics, Chemistry, Biology & Aptitude explanations.'
  },
  eswatini: {
    boardShort: 'EGCSE',
    boardFull: 'Eswatini General Certificate of Secondary Education',
    levelHint: 'EPC, JC & EGCSE',
    description: 'Exam-focused EGCSE Mathematics, Physical Science, Biology & Accounting.'
  },
  lesotho: {
    boardShort: 'LGCSE',
    boardFull: 'Lesotho General Certificate of Secondary Education',
    levelHint: 'PSLE & LGCSE',
    description: 'Exam-focused LGCSE Mathematics, Sciences, English & Development Studies.'
  },
  cameroon: {
    boardShort: 'GCE · BAC',
    boardFull: 'Cameroon GCE O/A-Level & Baccalaureat',
    levelHint: 'Secondary, GCE O-Level & A-Level',
    description: 'Rigorous Mathematics, Physics, Chemistry, Biology & Economics explanations.'
  },
  albania: {
    boardShort: 'AMU · MATURA',
    boardFull: 'Albanian National Curriculum (AMU & Matura Shtetërore)',
    levelHint: 'Grades 1–5 (Fillor), Grades 6–9 (AMU) & Grades 10–12 (Matura)',
    description: 'Structured for Albanian Basic Education (Klasa 1–9), Gymnasium, and State Matura exams.'
  },
  france: {
    boardShort: 'BREVET · BAC',
    boardFull: 'Éducation Nationale — Brevet (DNB) & Baccalauréat',
    levelHint: 'Primaire, Collège (6e–3e) & Lycée (Seconde–Terminale)',
    description: 'Aligned for Mathematics, Physics-Chemistry, SVT, SES, and Baccalauréat revision.'
  },
  germany: {
    boardShort: 'SEK I · ABITUR',
    boardFull: 'Sekundarstufe I & Gymnasiale Oberstufe (Abitur)',
    levelHint: 'Grundschule (1–4), Sek I (5–10) & Oberstufe / Abitur',
    description: 'Clear step-by-step tutoring for Mathematics, Physics, Chemistry, Biology & Economics.'
  },
  india: {
    boardShort: 'NCERT · CBSE / ICSE',
    boardFull: 'NCERT, CBSE, ICSE & State Boards',
    levelHint: 'Classes 1–5, Secondary (Class 10) & Senior Secondary (+2 / Class 12)',
    description: 'Exam-focused support for CBSE/ICSE Mathematics, Physics, Chemistry, Biology & Accountancy.'
  },
  canada: {
    boardShort: 'K-12 · PROVINCIAL',
    boardFull: 'Canadian Provincial K–12 & University Prep',
    levelHint: 'Elementary (K–6), Junior High (7–9) & High School (10–12)',
    description: 'Covers Functions, Calculus, Physics, Chemistry, Biology & Essay Structure.'
  },
  australia: {
    boardShort: 'ACARA · ATAR',
    boardFull: 'Australian Curriculum (ACARA) & Senior Secondary (ATAR)',
    levelHint: 'Primary (K–6), Junior High (7–10) & ATAR (Years 11–12)',
    description: 'Tailored for NAPLAN, Mathematical Methods, Sciences, Economics & Accounting.'
  },
  'united kingdom': {
    boardShort: 'GCSE · A-Level',
    boardFull: 'Cambridge / UK GCSE & A-Level',
    levelHint: 'KS1–2, GCSE (Years 7–11) & A-Level (Years 12–13)',
    description: 'International Mathematics, Sciences, Economics & Essay Structure.'
  },
  'united states': {
    boardShort: 'K-12 · AP',
    boardFull: 'US K-12, Honors & AP Curriculum',
    levelHint: 'Elementary (K–5), Middle (6–8) & High School / AP (9–12)',
    description: 'Algebra, Calculus, Physics, Chemistry, Biology & Essay Reasoning.'
  }
};

export function getExamBoardProfile(countryName?: string, level?: string): ExamBoardProfile {
  const cleanCountry = (countryName || 'Zimbabwe').trim() || 'Zimbabwe';
  const found = BOARD_PROFILES[cleanCountry.toLowerCase()];
  if (found) {
    return {
      country: cleanCountry,
      ...found
    };
  }
  return {
    country: cleanCountry,
    boardShort: `${cleanCountry} Syllabus`,
    boardFull: `${cleanCountry} National Curriculum`,
    levelHint: level || 'Primary, Secondary & Tertiary',
    description: `Offline AI tutoring for Mathematics, Sciences, Economics & Languages in ${cleanCountry}.`
  };
}

/**
 * Country-neutral high-yield starter questions for countries that have not yet loaded a local pack.
 * Guarantees zero Zimbabwe/ZIMSEC terms while empowering students across Africa and globally.
 */
export function getUniversalStarterPrompts(
  countryName: string,
  contentLevel: string
): StarterPromptItem[] {
  const cleanCountry = (countryName || '').trim().toLowerCase();
  if (cleanCountry === 'zimbabwe' || cleanCountry === 'botswana' || cleanCountry === 'south africa') {
    return [];
  }

  const level = (contentLevel || 'O-Level').toLowerCase();

  if (level.includes('primary')) {
    return [
      {
        subject: 'Mathematics',
        text: 'Explain BODMAS order of operations with a worked example'
      },
      {
        subject: 'Science',
        text: 'How do green plants make food through photosynthesis?'
      },
      {
        subject: 'Science & Health',
        text: 'What causes malaria and how can communities prevent it?'
      },
      {
        subject: 'English Grammar',
        text: 'Explain the main parts of speech (noun, verb, adjective, adverb)'
      }
    ];
  }

  if (level.includes('a-level') || level.includes('tertiary')) {
    return [
      {
        subject: 'Pure & Applied Math',
        text: 'Solve 2x² - 5x - 3 = 0 step by step using quadratic formula'
      },
      {
        subject: 'Biology',
        text: 'Compare mitosis and meiosis in a structured exam table'
      },
      {
        subject: 'Chemistry',
        text: 'Explain the mole concept, Avogadro constant and molar mass formula'
      },
      {
        subject: 'Economics',
        text: 'Explain consumer surplus, producer surplus and market equilibrium'
      }
    ];
  }

  // Secondary / O-Level / Matric / WASSCE / KCSE default
  return [
    {
      subject: 'Physics',
      text: "State Ohm's Law and compare series vs parallel circuits"
    },
    {
      subject: 'Mathematics',
      text: 'Explain SOHCAHTOA trigonometry and Pythagoras theorem with example'
    },
    {
      subject: 'Biology',
      text: 'Compare aerobic and anaerobic respiration with equations'
    },
    {
      subject: 'Chemistry',
      text: 'Explain ionic vs covalent chemical bonding with examples'
    }
  ];
}

export const TUTOR_MODE_OPTIONS: Array<{
  id: StudyTutorMode;
  label: string;
  shortDesc: string;
}> = [
  { id: 'standard', label: 'Balanced', shortDesc: 'Clear textbook answer' },
  { id: 'step-by-step', label: 'Step-by-Step', shortDesc: 'Numbered working steps' },
  { id: 'exam-points', label: 'Exam Points', shortDesc: 'High-yield mark points' },
  { id: 'quiz-me', label: 'Quiz Me', shortDesc: 'Includes practice test' },
  { id: 'simplify', label: 'Simplify', shortDesc: 'Easy everyday explanation' }
];

export const MATH_SCIENCE_SYMBOLS: string[] = [
  '×',
  '÷',
  '²',
  '³',
  '√',
  'π',
  'θ',
  'Δ',
  '±',
  '→',
  '≤',
  '≥',
  '°',
  'CO₂',
  'H₂O'
];

export function buildQuickFollowUps(
  question: string,
  countryName?: string
): string[] {
  const cleanQ = question.trim().replace(/\s+/g, ' ');
  const topicSnippet = cleanQ.length > 52 ? `${cleanQ.slice(0, 49)}...` : cleanQ;
  const cleanCountry = (countryName || '').trim().toLowerCase();
  const isZim = cleanCountry === 'zimbabwe';
  const isBw = cleanCountry === 'botswana';
  const isZa = cleanCountry === 'south africa';
  return [
    `Quiz me with 3 practice questions on: ${topicSnippet}`,
    `Explain this in simpler everyday language: ${topicSnippet}`,
    isZim
      ? `List the key ZIMSEC exam marking points for: ${topicSnippet}`
      : isBw
      ? `List the key BEC (PSLE/JCE/BGCSE) exam marking points for: ${topicSnippet}`
      : isZa
      ? `List the key DBE CAPS / NSC Matric marking guideline points for: ${topicSnippet}`
      : `List the key exam marking points for: ${topicSnippet}`
  ];
}
