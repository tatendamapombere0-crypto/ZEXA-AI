import { ContentLevel, EducationLevel } from '../types';
import { findCountryConfig } from './worldCountries';

export interface CountryEducationTier {
  /** Internal canonical engine complexity bucket */
  tierKey: ContentLevel;
  /** Canonical stored EducationLevel string for backward compatibility */
  canonicalLevel: EducationLevel;
  /** Header short label (<sm mobile pill, max ~13 chars) */
  shortLabel: string;
  /** Header desktop label (sm+ pill) */
  headerLabel: string;
  /** Card badge (e.g. "GRADES 6 – 9", "FORMS 1 – 4", "JSS 1 – 3") */
  badge: string;
  /** Full card title */
  label: string;
  /** Subtitle / grade-range + local exam context */
  sublabel: string;
  /** Representative subjects shown on card */
  subjects: string;
  /** Exam board / credential badge shown on card footer */
  boardTag: string;
  /** Default placeholder/context name in Chat */
  chatTitle: string;
  /** Pricing string (retained for term pass consistency) */
  priceLabel: string;
}

export interface CountryEducationSystem {
  country: string;
  flag: string;
  curriculumName: string;
  secondaryGroupTitle: string;
  secondaryGroupRange: string;
  secondaryGroupPrompt: string;
  tiers: Record<ContentLevel, CountryEducationTier>;
}

function buildSystem(
  country: string,
  flag: string,
  curriculumName: string,
  secondaryGroupTitle: string,
  secondaryGroupRange: string,
  secondaryGroupPrompt: string,
  tiers: Record<ContentLevel, Omit<CountryEducationTier, 'tierKey' | 'canonicalLevel'>>
): CountryEducationSystem {
  return {
    country,
    flag,
    curriculumName,
    secondaryGroupTitle,
    secondaryGroupRange,
    secondaryGroupPrompt,
    tiers: {
      Primary: {
        tierKey: 'Primary',
        canonicalLevel: 'Primary Education',
        ...tiers.Primary
      },
      'O-Level': {
        tierKey: 'O-Level',
        canonicalLevel: 'O-Level (Form 1 to 4)',
        ...tiers['O-Level']
      },
      'A-Level': {
        tierKey: 'A-Level',
        canonicalLevel: 'A-Level (Form 5 to 6)',
        ...tiers['A-Level']
      },
      Tertiary: {
        tierKey: 'Tertiary',
        canonicalLevel: 'Tertiary Education',
        ...tiers.Tertiary
      }
    }
  };
}

interface CountryLevelSpec {
  curriculumName: string;
  secondaryGroupTitle: string;
  secondaryGroupRange: string;
  secondaryGroupPrompt: string;
  tiers: Record<ContentLevel, Omit<CountryEducationTier, 'tierKey' | 'canonicalLevel'>>;
}

const COUNTRY_SPECS: Record<string, CountryLevelSpec> = {
  zimbabwe: {
    curriculumName: 'ZIMSEC & Heritage-Based Curriculum',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Forms 1 to 6',
    secondaryGroupPrompt: 'Select your exact academic tier for tailored syllabus notes and past exam papers:',
    tiers: {
      Primary: {
        shortLabel: 'Primary',
        headerLabel: 'Primary (Grade 1–7)',
        badge: 'GRADE 1 – 7',
        label: 'Primary Education (Grade 1 – 7)',
        sublabel: 'Grade 1 to Grade 7 (Heritage-Based Curriculum)',
        subjects: 'Official 6-Subject Format: English, Mathematics, Agric, Science & Tech, Shona, Social Science, Physical Edu & Arts.',
        boardTag: 'ZIMSEC Grade 7 HBC',
        chatTitle: 'Primary Curriculum Revision',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'O-Level',
        headerLabel: 'O-Level (Forms 1–4)',
        badge: 'FORMS 1 – 4',
        label: 'O-Level (Form 1 to 4)',
        sublabel: 'Ordinary Level Secondary (ZIMSEC)',
        subjects: 'Combined Science, Mathematics, Commerce, Accounts, Geography, History, English, Shona.',
        boardTag: 'ZIMSEC O-Level',
        chatTitle: 'O-Level Syllabus & Exam Prep',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'A-Level',
        headerLabel: 'A-Level (Forms 5–6)',
        badge: 'FORMS 5 – 6',
        label: 'A-Level (Form 5 to 6)',
        sublabel: 'Advanced Level Secondary (ZIMSEC)',
        subjects: 'Pure Mathematics, Biology, History 9155, Geography, Economics, Physics, Accounting.',
        boardTag: 'ZIMSEC Advanced Level',
        chatTitle: 'A-Level Advanced Mastery',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Tertiary & Higher Ed',
        badge: 'HIGHER ED',
        label: 'Tertiary & Higher Education',
        sublabel: 'Colleges, Polytechnics & Universities',
        subjects: 'Higher education research dissertations, polytechnic subjects, engineering, economics, and advanced coursework.',
        boardTag: 'HEXCO / Universities',
        chatTitle: 'Tertiary & Research Studio',
        priceLabel: '$5/term'
      }
    }
  },

  albania: {
    curriculumName: 'Albanian National Curriculum (MASR)',
    secondaryGroupTitle: 'Basic Lower & Upper Secondary',
    secondaryGroupRange: 'Grades 6 to 12',
    secondaryGroupPrompt: 'Select your Albanian school cycle (9-year Basic Education or Gymnasium / Matura Shtetërore):',
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–5',
        headerLabel: 'Primary (Grades 1–5)',
        badge: 'KLASA 1 – 5',
        label: 'Primary Education (Grades 1 – 5)',
        sublabel: 'Arsimi Fillor (Klasa 1 – 5)',
        subjects: 'Gjuhë Shqipe, Matematikë, Dituri Natyre, Edukatë Qytetare, Anglisht, Art.',
        boardTag: 'Arsimi Fillor',
        chatTitle: 'Albania Primary Tutor (Grades 1–5)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 6–9',
        headerLabel: 'Lower Sec (Grades 6–9)',
        badge: 'KLASA 6 – 9',
        label: 'Lower Secondary (Grades 6 – 9)',
        sublabel: 'Arsimi i Mesëm i Ulët (AMU · Provimet e Lirimit)',
        subjects: 'Matematikë, Fizikë, Kimi, Biologji, Gjuhë Shqipe, Histori, Gjeografi, Informatikë.',
        boardTag: 'Provimet e Lirimit (AMU)',
        chatTitle: 'Albania Lower Secondary (Grades 6–9)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Matura 10–12',
        headerLabel: 'Gymnasium (Grades 10–12)',
        badge: 'KLASA 10 – 12',
        label: 'Upper Secondary / Gymnasium (Grades 10 – 12)',
        sublabel: 'Gjimnazi & Arsimi Profesional (Matura Shtetërore)',
        subjects: 'Matura Matematikë, Fizikë, Kimi, Biologji, Ekonomi, Letërsi, Anglisht, Informatikë.',
        boardTag: 'Matura Shtetërore',
        chatTitle: 'Albania Matura & Gymnasium (Grades 10–12)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'University',
        headerLabel: 'University & Higher Ed',
        badge: 'ARSIMI I LARTË',
        label: 'Higher Education & Universities',
        sublabel: 'Bachelor, Master & Polytechnic Institutes',
        subjects: 'Engineering, Computer Science, Medicine, Economics, Law, and University coursework.',
        boardTag: 'Bologna Higher Ed',
        chatTitle: 'Albania University & Research',
        priceLabel: '$5/term'
      }
    }
  },

  'south africa': {
    curriculumName: 'CAPS · NSC Matric & IEB',
    secondaryGroupTitle: 'High School (CAPS Phases)',
    secondaryGroupRange: 'Grades 8 to 12',
    secondaryGroupPrompt: 'Select your South African CAPS school phase for tailored ZEXA AI tutoring:',
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–7',
        headerLabel: 'Primary (Grades 1–7)',
        badge: 'GRADES 1 – 7',
        label: 'Primary School (Foundation & Intermediate)',
        sublabel: 'GET Foundation & Intermediate Phases (Grades 1 – 7)',
        subjects: 'English, Mathematics, Natural Sciences & Technology, Social Sciences, Economic & Management Sciences.',
        boardTag: 'CAPS GET Phase',
        chatTitle: 'South Africa Primary (Grades 1–7)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 8–9',
        headerLabel: 'Senior Phase (Grades 8–9)',
        badge: 'GRADES 8 – 9',
        label: 'Senior Phase (Grades 8 – 9)',
        sublabel: 'CAPS General Education & Training (GET)',
        subjects: 'Mathematics, Natural Sciences, EMS, Technology, Social Sciences, English.',
        boardTag: 'CAPS Senior Phase',
        chatTitle: 'South Africa Grades 8–9 (CAPS)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Matric 10–12',
        headerLabel: 'FET & Matric (Grades 10–12)',
        badge: 'GRADES 10 – 12',
        label: 'FET & Matric (Grades 10 – 12)',
        sublabel: 'National Senior Certificate (NSC) & IEB Matric',
        subjects: 'Mathematics, Mathematical Literacy, Physical Sciences, Life Sciences, Accounting, Economics.',
        boardTag: 'NSC Matric / IEB',
        chatTitle: 'South Africa FET & Matric (Grades 10–12)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & TVET',
        badge: 'HIGHER ED',
        label: 'Universities & TVET Colleges',
        sublabel: 'Degrees, NATED Diplomas & TVET NCV',
        subjects: 'University engineering, commerce, sciences, law, and TVET coursework.',
        boardTag: 'SA Higher Ed / TVET',
        chatTitle: 'South Africa University & TVET',
        priceLabel: '$5/term'
      }
    }
  },

  nigeria: {
    curriculumName: 'NERDC · WAEC / NECO / JAMB',
    secondaryGroupTitle: 'Secondary School (JSS & SSS)',
    secondaryGroupRange: 'JSS 1 to SSS 3',
    secondaryGroupPrompt: 'Select your Nigerian school tier (Junior Secondary BECE or Senior Secondary WAEC/NECO/UTME):',
    tiers: {
      Primary: {
        shortLabel: 'Primary 1–6',
        headerLabel: 'Primary (Basic 1–6)',
        badge: 'PRIMARY 1 – 6',
        label: 'Primary School (Basic 1 – 6)',
        sublabel: 'Lower & Middle Basic Education',
        subjects: 'English Studies, Mathematics, Basic Science & Technology, Civic Education, Quantitative Reasoning.',
        boardTag: 'NERDC Basic',
        chatTitle: 'Nigeria Primary Tutor (Basic 1–6)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'JSS 1–3',
        headerLabel: 'Junior Sec (JSS 1–3)',
        badge: 'JSS 1 – 3',
        label: 'Junior Secondary (JSS 1 – 3)',
        sublabel: 'Upper Basic · BECE Preparation',
        subjects: 'Mathematics, Basic Science, Basic Technology, Business Studies, Civic Education, English.',
        boardTag: 'BECE / NECO JSS',
        chatTitle: 'Nigeria JSS 1–3 (BECE)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'SSS 1–3',
        headerLabel: 'Senior Sec (SSS 1–3)',
        badge: 'SSS 1 – 3',
        label: 'Senior Secondary (SSS 1 – 3)',
        sublabel: 'WAEC SSCE, NECO & JAMB UTME Preparation',
        subjects: 'Further Mathematics, Physics, Chemistry, Biology, Economics, Financial Accounting, Government.',
        boardTag: 'WAEC · NECO · JAMB',
        chatTitle: 'Nigeria SSS 1–3 (WAEC & JAMB)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & Polytechnics',
        badge: 'HIGHER ED',
        label: 'Universities, Polytechnics & Colleges',
        sublabel: 'Undergraduate, OND/HND & NCE Studies',
        subjects: 'Engineering, Medical Sciences, Accounting, Computer Science & Research.',
        boardTag: 'NUC / NBTE',
        chatTitle: 'Nigeria Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  kenya: {
    curriculumName: 'KICD · CBC & KNEC KCSE',
    secondaryGroupTitle: 'Junior & Senior School',
    secondaryGroupRange: 'Grades 7 to 12 / KCSE',
    secondaryGroupPrompt: 'Select your Kenyan CBC or Senior Secondary / KCSE level:',
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–6',
        headerLabel: 'Primary (Grades 1–6)',
        badge: 'GRADES 1 – 6',
        label: 'Primary School (Grades 1 – 6)',
        sublabel: 'CBC Lower & Upper Primary (KPSEA)',
        subjects: 'Mathematics, English, Kiswahili, Science & Technology, Agriculture, Social Studies.',
        boardTag: 'CBC · KPSEA',
        chatTitle: 'Kenya Primary (CBC Grades 1–6)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'JSS 7–9',
        headerLabel: 'Junior School (Grades 7–9)',
        badge: 'JSS 7 – 9',
        label: 'Junior School (Grades 7 – 9)',
        sublabel: 'CBC Junior Secondary (KJSEA)',
        subjects: 'Integrated Science, Mathematics, Pre-Technical Studies, Agriculture, Business Studies, English.',
        boardTag: 'CBC · KJSEA',
        chatTitle: 'Kenya Junior School (Grades 7–9)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Senior / KCSE',
        headerLabel: 'Senior School / KCSE',
        badge: 'SENIOR / KCSE',
        label: 'Senior School & KCSE',
        sublabel: 'KNEC KCSE & Senior Secondary STEM / Humanities',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Business Studies, History, Geography, CRE.',
        boardTag: 'KNEC KCSE · CBC Senior',
        chatTitle: 'Kenya Senior School & KCSE',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & TVET',
        badge: 'HIGHER ED',
        label: 'Universities, KMTC & TVET',
        sublabel: 'Undergraduate Degrees, Diplomas & Certificates',
        subjects: 'Engineering, Computer Science, Commerce, Medicine & Research.',
        boardTag: 'Kenya Higher Ed / TVET',
        chatTitle: 'Kenya University & TVET',
        priceLabel: '$5/term'
      }
    }
  },

  ghana: {
    curriculumName: 'NaCCA · BECE & WASSCE',
    secondaryGroupTitle: 'Junior & Senior High School',
    secondaryGroupRange: 'JHS 1 to SHS 3',
    secondaryGroupPrompt: 'Select your Ghanaian JHS (BECE) or SHS (WASSCE) level:',
    tiers: {
      Primary: {
        shortLabel: 'Primary 1–6',
        headerLabel: 'Primary (Basic 1–6)',
        badge: 'PRIMARY 1 – 6',
        label: 'Primary School (Basic 1 – 6)',
        sublabel: 'Standard-Based Primary Curriculum',
        subjects: 'English Language, Mathematics, Science, Our World Our People, Computing.',
        boardTag: 'NaCCA Primary',
        chatTitle: 'Ghana Primary (Basic 1–6)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'JHS 1–3',
        headerLabel: 'Junior High (JHS 1–3)',
        badge: 'JHS 1 – 3',
        label: 'Junior High School (JHS 1 – 3)',
        sublabel: 'BECE Common Core Programme',
        subjects: 'Core Mathematics, Integrated Science, Social Studies, Computing, Career Technology, English.',
        boardTag: 'WAEC Ghana BECE',
        chatTitle: 'Ghana JHS 1–3 (BECE)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'SHS 1–3',
        headerLabel: 'Senior High (SHS 1–3)',
        badge: 'SHS 1 – 3',
        label: 'Senior High School (SHS 1 – 3)',
        sublabel: 'WASSCE Core & Elective Programmes',
        subjects: 'Core & Elective Maths, Physics, Chemistry, Biology, Economics, Financial Accounting.',
        boardTag: 'WAEC WASSCE',
        chatTitle: 'Ghana SHS 1–3 (WASSCE)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & Technical',
        badge: 'HIGHER ED',
        label: 'Universities & Technical Institutions',
        sublabel: 'Degrees, HND & Colleges of Education',
        subjects: 'Engineering, Sciences, Business Administration, Computing & Research.',
        boardTag: 'GTEC Higher Ed',
        chatTitle: 'Ghana Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  zambia: {
    curriculumName: 'ECZ National Curriculum',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Grades 8 to 12',
    secondaryGroupPrompt: 'Select your Zambian Junior or Senior Secondary ECZ level:',
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–7',
        headerLabel: 'Primary (Grades 1–7)',
        badge: 'GRADES 1 – 7',
        label: 'Primary School (Grades 1 – 7)',
        sublabel: 'ECZ Grade 7 Composite Exam',
        subjects: 'English, Mathematics, Integrated Science, Social Studies, Technology Studies.',
        boardTag: 'ECZ Grade 7',
        chatTitle: 'Zambia Primary (Grades 1–7)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 8–9',
        headerLabel: 'Junior Sec (Grades 8–9)',
        badge: 'GRADES 8 – 9',
        label: 'Junior Secondary (Grades 8 – 9)',
        sublabel: 'ECZ Junior Secondary Leaving Exam',
        subjects: 'Mathematics, Integrated Science, Business Studies, Computer Studies, Social Studies, English.',
        boardTag: 'ECZ Grade 9',
        chatTitle: 'Zambia Grades 8–9 (ECZ)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Grades 10–12',
        headerLabel: 'Senior Sec (Grades 10–12)',
        badge: 'GRADES 10 – 12',
        label: 'Senior Secondary (Grades 10 – 12)',
        sublabel: 'ECZ School Certificate (Grade 12 SC)',
        subjects: 'Mathematics, Additional Maths, Physics, Chemistry, Biology, Commerce, Accounts, Civic Education.',
        boardTag: 'ECZ Grade 12 SC',
        chatTitle: 'Zambia Grades 10–12 (ECZ SC)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Colleges & Universities',
        badge: 'HIGHER ED',
        label: 'Universities & TEVET Colleges',
        sublabel: 'Undergraduate, TEVET Diplomas & Trade Certificates',
        subjects: 'Engineering, Medicine, Economics, Accountancy & Education.',
        boardTag: 'Zambia Higher Ed',
        chatTitle: 'Zambia Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  botswana: {
    curriculumName: 'BEC · JCE & BGCSE',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Forms 1 to 5',
    secondaryGroupPrompt: 'Select your Botswana Junior (JCE) or Senior (BGCSE) secondary tier:',
    tiers: {
      Primary: {
        shortLabel: 'Std 1–7',
        headerLabel: 'Primary (Std 1–7)',
        badge: 'STD 1 – 7',
        label: 'Primary School (Standard 1 – 7)',
        sublabel: 'Primary School Leaving Examination (PSLE)',
        subjects: 'English, Setswana, Mathematics, Science, Agriculture, Social Studies.',
        boardTag: 'BEC PSLE',
        chatTitle: 'Botswana Primary (Std 1–7)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'JCE (F1–3)',
        headerLabel: 'Junior Sec (Forms 1–3)',
        badge: 'FORMS 1 – 3',
        label: 'Junior Secondary (Forms 1 – 3)',
        sublabel: 'Junior Certificate Examination (JCE)',
        subjects: 'Mathematics, Integrated Science, Agriculture, Commerce & Accounting, Moral Education, English.',
        boardTag: 'BEC JCE',
        chatTitle: 'Botswana Junior Secondary (JCE)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'BGCSE (F4–5)',
        headerLabel: 'Senior Sec (Forms 4–5)',
        badge: 'FORMS 4 – 5',
        label: 'Senior Secondary (Forms 4 – 5)',
        sublabel: 'Botswana General Certificate of Secondary Education',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Double Science, Economics, Accounting, Geography.',
        boardTag: 'BEC BGCSE',
        chatTitle: 'Botswana Senior Secondary (BGCSE)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & Brigades',
        badge: 'HIGHER ED',
        label: 'Universities & Technical Colleges',
        sublabel: 'Degrees, Diplomas & Vocational Programmes',
        subjects: 'Engineering, Sciences, Business, Computing & Research.',
        boardTag: 'BQA Higher Ed',
        chatTitle: 'Botswana Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  namibia: {
    curriculumName: 'NSSCO & NSSCAS',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Grades 8 to 12',
    secondaryGroupPrompt: 'Select your Namibian Junior or Senior Secondary (NSSCO / NSSCAS) grade tier:',
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–7',
        headerLabel: 'Primary (Grades 1–7)',
        badge: 'GRADES 1 – 7',
        label: 'Primary Education (Grades 1 – 7)',
        sublabel: 'Junior & Senior Primary Phases',
        subjects: 'English, Mathematics, Natural Science & Health, Social Studies, Elementary Agriculture.',
        boardTag: 'Namibia Primary',
        chatTitle: 'Namibia Primary (Grades 1–7)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 8–9',
        headerLabel: 'Junior Sec (Grades 8–9)',
        badge: 'GRADES 8 – 9',
        label: 'Junior Secondary (Grades 8 – 9)',
        sublabel: 'Lower Secondary Phase',
        subjects: 'Mathematics, Physical Science, Life Science, Entrepreneurship, Accounting, Geography.',
        boardTag: 'Namibia Junior Sec',
        chatTitle: 'Namibia Junior Secondary (Grades 8–9)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'NSSCO 10–12',
        headerLabel: 'Senior Sec (Grades 10–12)',
        badge: 'GRADES 10 – 12',
        label: 'Senior Secondary (Grades 10 – 12)',
        sublabel: 'NSSCO Ordinary & NSSCAS Advanced Subsidiary',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Economics, Accounting, Business Studies.',
        boardTag: 'NSSCO / NSSCAS',
        chatTitle: 'Namibia NSSCO & NSSCAS (Grades 10–12)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & VTCs',
        badge: 'HIGHER ED',
        label: 'Universities & Vocational Training',
        sublabel: 'NQF Higher Education & Vocational Studies',
        subjects: 'Engineering, Sciences, Commerce, Computing & Research.',
        boardTag: 'NCHE Higher Ed',
        chatTitle: 'Namibia Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  malawi: {
    curriculumName: 'MANEB · JCE & MSCE',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Forms 1 to 4',
    secondaryGroupPrompt: 'Select your Malawian JCE (Form 1–2) or MSCE (Form 3–4) tier:',
    tiers: {
      Primary: {
        shortLabel: 'Std 1–8',
        headerLabel: 'Primary (Standard 1–8)',
        badge: 'STD 1 – 8',
        label: 'Primary School (Standard 1 – 8)',
        sublabel: 'Primary School Leaving Certificate (PSLCE)',
        subjects: 'English, Chichewa, Mathematics, Primary Science, Social & Environmental Sciences.',
        boardTag: 'MANEB PSLCE',
        chatTitle: 'Malawi Primary (Std 1–8)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'JCE (F1–2)',
        headerLabel: 'Junior Sec (Forms 1–2)',
        badge: 'FORMS 1 – 2',
        label: 'Junior Secondary (Forms 1 – 2)',
        sublabel: 'Junior Certificate of Education (JCE)',
        subjects: 'Mathematics, Physical Science, Biology, Agriculture, Geography, History, English.',
        boardTag: 'MANEB JCE',
        chatTitle: 'Malawi Forms 1–2 (JCE)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'MSCE (F3–4)',
        headerLabel: 'Senior Sec (Forms 3–4)',
        badge: 'FORMS 3 – 4',
        label: 'Senior Secondary (Forms 3 – 4)',
        sublabel: 'Malawi School Certificate of Education (MSCE)',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Agriculture, Business Studies, History.',
        boardTag: 'MANEB MSCE',
        chatTitle: 'Malawi Forms 3–4 (MSCE)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & Colleges',
        badge: 'HIGHER ED',
        label: 'Universities & Technical Colleges',
        sublabel: 'Undergraduate, Teaching & Polytechnic Programmes',
        subjects: 'Engineering, Health Sciences, Agriculture, Commerce & Education.',
        boardTag: 'NCHE Higher Ed',
        chatTitle: 'Malawi Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  tanzania: {
    curriculumName: 'NECTA · CSEE & ACSEE',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Forms 1 to 6',
    secondaryGroupPrompt: 'Select your Tanzanian NECTA O-Level (CSEE) or A-Level (ACSEE) tier:',
    tiers: {
      Primary: {
        shortLabel: 'Std I–VII',
        headerLabel: 'Primary (Std I–VII)',
        badge: 'STD I – VII',
        label: 'Primary School (Standard I – VII)',
        sublabel: 'Primary School Leaving Examination (PSLE)',
        subjects: 'Kiswahili, English, Hisabati (Mathematics), Sayansi na Teknolojia, Maarifa ya Jamii.',
        boardTag: 'NECTA PSLE',
        chatTitle: 'Tanzania Primary (Std I–VII)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'CSEE (F1–4)',
        headerLabel: 'O-Level (Forms 1–4)',
        badge: 'FORMS 1 – 4',
        label: 'O-Level Secondary (Forms 1 – 4)',
        sublabel: 'Certificate of Secondary Education (NECTA CSEE)',
        subjects: 'Basic Mathematics, Physics, Chemistry, Biology, Civics, Geography, History, Commerce.',
        boardTag: 'NECTA CSEE',
        chatTitle: 'Tanzania O-Level (CSEE Forms 1–4)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'ACSEE (F5–6)',
        headerLabel: 'A-Level (Forms 5–6)',
        badge: 'FORMS 5 – 6',
        label: 'A-Level Secondary (Forms 5 – 6)',
        sublabel: 'Advanced Certificate of Secondary Education (ACSEE)',
        subjects: 'Advanced Mathematics, Physics, Chemistry, Biology, Economics, Commerce, History, Geography.',
        boardTag: 'NECTA ACSEE',
        chatTitle: 'Tanzania A-Level (ACSEE Forms 5–6)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & VETA',
        badge: 'HIGHER ED',
        label: 'Universities & Technical Colleges',
        sublabel: 'Degrees, Diplomas & VETA Technical Programmes',
        subjects: 'Engineering, Sciences, Accountancy, Computing & Research.',
        boardTag: 'TCU / NACTVET',
        chatTitle: 'Tanzania Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  uganda: {
    curriculumName: 'UNEB · PLE, UCE & UACE',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Senior 1 to 6',
    secondaryGroupPrompt: 'Select your Ugandan UNEB O-Level (UCE) or A-Level (UACE) tier:',
    tiers: {
      Primary: {
        shortLabel: 'P.1 – P.7',
        headerLabel: 'Primary (P.1 – P.7)',
        badge: 'P.1 – P.7',
        label: 'Primary School (P.1 – P.7)',
        sublabel: 'Primary Leaving Examination (UNEB PLE)',
        subjects: 'English, Mathematics, Integrated Science, Social Studies & Religious Education.',
        boardTag: 'UNEB PLE',
        chatTitle: 'Uganda Primary (P.1–P.7)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'UCE (S1–S4)',
        headerLabel: 'O-Level (S.1 – S.4)',
        badge: 'S.1 – S.4',
        label: 'O-Level Secondary (S.1 – S.4)',
        sublabel: 'Uganda Certificate of Education (UNEB UCE)',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Entrepreneurship, History, Geography, English.',
        boardTag: 'UNEB UCE',
        chatTitle: 'Uganda O-Level (UCE S.1–S.4)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'UACE (S5–S6)',
        headerLabel: 'A-Level (S.5 – S.6)',
        badge: 'S.5 – S.6',
        label: 'A-Level Secondary (S.5 – S.6)',
        sublabel: 'Uganda Advanced Certificate of Education (UACE)',
        subjects: 'Principal Maths, Physics, Chemistry, Biology, Economics, Entrepreneurship, History, Sub-ICT.',
        boardTag: 'UNEB UACE',
        chatTitle: 'Uganda A-Level (UACE S.5–S.6)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & Institutes',
        badge: 'HIGHER ED',
        label: 'Universities & Technical Institutes',
        sublabel: 'Degrees, Diplomas & Higher Technical Studies',
        subjects: 'Engineering, Medicine, Business, Law & Research.',
        boardTag: 'NCHE Higher Ed',
        chatTitle: 'Uganda Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  rwanda: {
    curriculumName: 'NESA Competence-Based Curriculum',
    secondaryGroupTitle: 'Secondary Education',
    secondaryGroupRange: 'Senior 1 to 6',
    secondaryGroupPrompt: 'Select your Rwandan NESA Ordinary or Advanced secondary tier:',
    tiers: {
      Primary: {
        shortLabel: 'P1 – P6',
        headerLabel: 'Primary (P1 – P6)',
        badge: 'P1 – P6',
        label: 'Primary School (P1 – P6)',
        sublabel: 'Primary Leaving Examination (NESA PLE)',
        subjects: 'English, Mathematics, Science & Elementary Technology, Social & Religious Studies, Kinyarwanda.',
        boardTag: 'NESA Primary',
        chatTitle: 'Rwanda Primary (P1–P6)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'S1 – S3',
        headerLabel: 'Ordinary Level (S1–S3)',
        badge: 'S1 – S3',
        label: 'Ordinary Level (S1 – S3)',
        sublabel: 'Lower Secondary Competence-Based Curriculum',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Entrepreneurship, History, Geography, ICT.',
        boardTag: 'NESA O-Level',
        chatTitle: 'Rwanda O-Level (S1–S3)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'S4 – S6',
        headerLabel: 'Advanced Level (S4–S6)',
        badge: 'S4 – S6',
        label: 'Advanced Level (S4 – S6)',
        sublabel: 'Senior Secondary Principal Combinations (MCB, PCM, MEG)',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Computer Science, Economics, Entrepreneurship.',
        boardTag: 'NESA A-Level',
        chatTitle: 'Rwanda A-Level (S4–S6)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Tertiary',
        headerLabel: 'Universities & IPRCs',
        badge: 'HIGHER ED',
        label: 'Universities & Polytechnics (IPRC)',
        sublabel: 'Degrees, TVET Diplomas & Higher Research',
        subjects: 'Engineering, Computer Science, Sciences, Finance & Research.',
        boardTag: 'HEC / RTB',
        chatTitle: 'Rwanda Tertiary & Research',
        priceLabel: '$5/term'
      }
    }
  },

  ethiopia: {
    curriculumName: 'Ethiopian National Curriculum (ESSLCE)',
    secondaryGroupTitle: 'Secondary & Preparatory',
    secondaryGroupRange: 'Grades 9 to 12',
    secondaryGroupPrompt: 'Select your Ethiopian Secondary or ESSLCE Entrance tier:',
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–8',
        headerLabel: 'Primary & Middle (1–8)',
        badge: 'GRADES 1 – 8',
        label: 'Primary & Middle School (Grades 1 – 8)',
        sublabel: 'Ministry Regional Grade 8 Assessment',
        subjects: 'Mathematics, General Science, English, Social Studies, Citizenship.',
        boardTag: 'Grade 8 Regional',
        chatTitle: 'Ethiopia Grades 1–8',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 9–10',
        headerLabel: 'Secondary (Grades 9–10)',
        badge: 'GRADES 9 – 10',
        label: 'Secondary General (Grades 9 – 10)',
        sublabel: 'Lower Secondary Foundation',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Geography, History, Economics, English.',
        boardTag: 'Grades 9–10',
        chatTitle: 'Ethiopia Secondary (Grades 9–10)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'ESSLCE 11–12',
        headerLabel: 'Preparatory (Grades 11–12)',
        badge: 'GRADES 11 – 12',
        label: 'Upper Secondary / ESSLCE (Grades 11 – 12)',
        sublabel: 'Natural Science & Social Science Streams (ESSLCE)',
        subjects: 'Mathematics, Physics, Chemistry, Biology, Economics, Aptitude & English.',
        boardTag: 'ESSLCE Entrance',
        chatTitle: 'Ethiopia ESSLCE (Grades 11–12)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'University',
        headerLabel: 'Universities & TVET',
        badge: 'HIGHER ED',
        label: 'Universities & Polytechnic Institutes',
        sublabel: 'Freshman, Undergraduate & Engineering Studies',
        subjects: 'Engineering, Natural Sciences, Medicine, Economics & Computing.',
        boardTag: 'Ethiopian Higher Ed',
        chatTitle: 'Ethiopia University & Research',
        priceLabel: '$5/term'
      }
    }
  },

  'united kingdom': {
    curriculumName: 'UK National Curriculum (GCSE & A-Level)',
    secondaryGroupTitle: 'Secondary & Sixth Form',
    secondaryGroupRange: 'Years 7 to 13',
    secondaryGroupPrompt: 'Select your UK Key Stage, GCSE, or Sixth Form A-Level tier:',
    tiers: {
      Primary: {
        shortLabel: 'KS1–KS2 (Y1–6)',
        headerLabel: 'Primary (Years 1–6)',
        badge: 'YEARS 1 – 6',
        label: 'Primary School (KS1 & KS2 · Years 1 – 6)',
        sublabel: 'Key Stage 1 & 2 SATs Preparation',
        subjects: 'English, Mathematics, Science, Computing, History, Geography.',
        boardTag: 'UK KS1 / KS2 SATs',
        chatTitle: 'UK Primary (Years 1–6)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'GCSE (Y7–11)',
        headerLabel: 'Secondary & GCSE (Y7–11)',
        badge: 'YEARS 7 – 11',
        label: 'Secondary & GCSE (Years 7 – 11)',
        sublabel: 'Key Stage 3 & GCSE (AQA, Edexcel, OCR)',
        subjects: 'GCSE Maths, Combined/Triple Science, English Literature & Language, Economics, History, CS.',
        boardTag: 'UK GCSE',
        chatTitle: 'UK Secondary & GCSE (Years 7–11)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'A-Level Y12–13',
        headerLabel: 'Sixth Form / A-Level',
        badge: 'YEARS 12 – 13',
        label: 'Sixth Form & A-Level (Years 12 – 13)',
        sublabel: 'AS / A-Level & BTEC Level 3',
        subjects: 'A-Level Maths & Further Maths, Physics, Chemistry, Biology, Economics, Computer Science.',
        boardTag: 'UK A-Level',
        chatTitle: 'UK Sixth Form & A-Level',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'University',
        headerLabel: 'University & Higher Ed',
        badge: 'HIGHER ED',
        label: 'Higher Education & Universities',
        sublabel: 'Undergraduate BSc / BA / BEng & Postgraduate',
        subjects: 'Engineering, Computer Science, Natural Sciences, Economics & Research.',
        boardTag: 'UK Higher Ed',
        chatTitle: 'UK University & Research',
        priceLabel: '$5/term'
      }
    }
  },

  'united states': {
    curriculumName: 'US K–12, Honors & AP Curriculum',
    secondaryGroupTitle: 'Middle & High School',
    secondaryGroupRange: 'Grades 6 to 12',
    secondaryGroupPrompt: 'Select your US Middle School or High School / AP level:',
    tiers: {
      Primary: {
        shortLabel: 'Grades K–5',
        headerLabel: 'Elementary (Grades K–5)',
        badge: 'GRADES K – 5',
        label: 'Elementary School (Grades K – 5)',
        sublabel: 'Foundational Reading, Math & Science',
        subjects: 'Arithmetic, Reading & Writing, Elementary Science, Social Studies.',
        boardTag: 'US Elementary',
        chatTitle: 'US Elementary School (K–5)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 6–8',
        headerLabel: 'Middle School (Grades 6–8)',
        badge: 'GRADES 6 – 8',
        label: 'Middle School (Grades 6 – 8)',
        sublabel: 'Pre-Algebra, Earth/Life/Physical Science & ELA',
        subjects: 'Algebra Readiness, Physical & Life Science, US/World History, English Language Arts.',
        boardTag: 'US Middle School',
        chatTitle: 'US Middle School (Grades 6–8)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'High Sch 9–12',
        headerLabel: 'High School & AP (9–12)',
        badge: 'GRADES 9 – 12',
        label: 'High School, Honors & AP (Grades 9 – 12)',
        sublabel: 'SAT / ACT & College Board AP Courses',
        subjects: 'Algebra II, Calculus AB/BC, AP Physics, AP Chemistry, AP Biology, AP Economics, ELA.',
        boardTag: 'High School · SAT · AP',
        chatTitle: 'US High School & AP (Grades 9–12)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'College',
        headerLabel: 'College & University',
        badge: 'HIGHER ED',
        label: 'College & University',
        sublabel: 'Associate, Bachelor & Graduate Studies',
        subjects: 'STEM, Computer Science, Finance, Humanities & Research.',
        boardTag: 'US Higher Ed',
        chatTitle: 'US College & Research',
        priceLabel: '$5/term'
      }
    }
  },

  canada: {
    curriculumName: 'Canadian K–12 Curriculum',
    secondaryGroupTitle: 'Middle & High School',
    secondaryGroupRange: 'Grades 6 to 12',
    secondaryGroupPrompt: 'Select your Canadian Junior High or Senior High level:',
    tiers: {
      Primary: {
        shortLabel: 'Grades K–6',
        headerLabel: 'Elementary (Grades K–6)',
        badge: 'GRADES K – 6',
        label: 'Elementary School (Grades K – 6)',
        sublabel: 'Primary & Intermediate Elementary',
        subjects: 'Mathematics, Science & Technology, Language Arts, Social Studies.',
        boardTag: 'Canada Elementary',
        chatTitle: 'Canada Elementary (K–6)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 7–9',
        headerLabel: 'Junior High (Grades 7–9)',
        badge: 'GRADES 7 – 9',
        label: 'Intermediate / Junior High (Grades 7 – 9)',
        sublabel: 'Middle Years Foundation',
        subjects: 'Mathematics, Science, English/French, Geography, History.',
        boardTag: 'Canada Junior High',
        chatTitle: 'Canada Junior High (Grades 7–9)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Grades 10–12',
        headerLabel: 'High School (Grades 10–12)',
        badge: 'GRADES 10 – 12',
        label: 'Senior High School (Grades 10 – 12)',
        sublabel: 'Provincial Diploma & University Prep',
        subjects: 'Functions, Calculus, Physics, Chemistry, Biology, Accounting, Economics.',
        boardTag: 'High School Diploma',
        chatTitle: 'Canada High School (Grades 10–12)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'University',
        headerLabel: 'College & University',
        badge: 'HIGHER ED',
        label: 'College & University',
        sublabel: 'Undergraduate, Diploma & Research',
        subjects: 'Engineering, Computer Science, Sciences, Business & Research.',
        boardTag: 'Canada Higher Ed',
        chatTitle: 'Canada College & University',
        priceLabel: '$5/term'
      }
    }
  },

  france: {
    curriculumName: 'Éducation Nationale (Brevet & Bac)',
    secondaryGroupTitle: 'Collège & Lycée',
    secondaryGroupRange: '6e à Terminale',
    secondaryGroupPrompt: 'Sélectionnez votre niveau (Collège ou Lycée / Baccalauréat) :',
    tiers: {
      Primary: {
        shortLabel: 'CP – CM2',
        headerLabel: 'École Primaire (CP–CM2)',
        badge: 'CP – CM2',
        label: 'École Primaire (CP – CM2)',
        sublabel: 'Cycles 2 & 3 — Fondamentaux',
        subjects: 'Français, Mathématiques, Sciences, Histoire-Géographie.',
        boardTag: 'École Primaire',
        chatTitle: 'France École Primaire',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Collège 6e–3e',
        headerLabel: 'Collège (6e – 3e · Brevet)',
        badge: '6e – 3e',
        label: 'Collège (6e – 3e)',
        sublabel: 'Diplôme National du Brevet (DNB)',
        subjects: 'Mathématiques, Physique-Chimie, SVT, Technologie, Français, Histoire-Géo.',
        boardTag: 'Brevet (DNB)',
        chatTitle: 'France Collège (6e–3e)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Lycée (Bac)',
        headerLabel: 'Lycée (Seconde – Terminale)',
        badge: '2nde – Term',
        label: 'Lycée & Baccalauréat (Seconde – Terminale)',
        sublabel: 'Spécialités & Baccalauréat Général / Techno',
        subjects: 'Maths Spé, Physique-Chimie, SVT, SES, NSI, Philosophie, Anglais.',
        boardTag: 'Baccalauréat',
        chatTitle: 'France Lycée & Baccalauréat',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Université',
        headerLabel: 'Enseignement Supérieur',
        badge: 'SUPÉRIEUR',
        label: 'Université, BTS & Grandes Écoles',
        sublabel: 'Licence, Master, CPGE & BUT',
        subjects: 'Ingénierie, Sciences, Économie, Informatique & Recherche.',
        boardTag: 'Supérieur / LMD',
        chatTitle: 'France Université & Supérieur',
        priceLabel: '$5/term'
      }
    }
  },

  germany: {
    curriculumName: 'German Bundesländer & Abitur',
    secondaryGroupTitle: 'Sekundarstufe I & II',
    secondaryGroupRange: 'Grades 5 to 12/13',
    secondaryGroupPrompt: 'Select your German Sekundarstufe I or Oberstufe / Abitur tier:',
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–4',
        headerLabel: 'Grundschule (Grades 1–4)',
        badge: 'KLASSE 1 – 4',
        label: 'Grundschule / Primary (Grades 1 – 4)',
        sublabel: 'Elementary Foundation',
        subjects: 'Mathematik, Deutsch, Sachunterricht, Englisch.',
        boardTag: 'Grundschule',
        chatTitle: 'Germany Grundschule (1–4)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Sek I (5–10)',
        headerLabel: 'Sekundarstufe I (5–10)',
        badge: 'KLASSE 5 – 10',
        label: 'Sekundarstufe I (Grades 5 – 10)',
        sublabel: 'Mittlerer Schulabschluss / Realschule / Gymnasium Sek I',
        subjects: 'Mathematik, Physik, Chemie, Biologie, Informatik, Geschichte, Wirtschaft.',
        boardTag: 'Sekundarstufe I',
        chatTitle: 'Germany Sekundarstufe I (5–10)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Abitur (11–13)',
        headerLabel: 'Oberstufe & Abitur (11–13)',
        badge: 'ABITUR',
        label: 'Gymnasiale Oberstufe / Abitur',
        sublabel: 'Sekundarstufe II & Hochschulreife',
        subjects: 'Analysis & Stochastik, Physik, Chemie, Biologie, Wirtschaft, Informatik.',
        boardTag: 'Abitur',
        chatTitle: 'Germany Oberstufe & Abitur',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'Universität',
        headerLabel: 'Universität & Hochschule',
        badge: 'HIGHER ED',
        label: 'Universität & Fachhochschule',
        sublabel: 'Bachelor, Master & Staatsexamen',
        subjects: 'Engineering, Computer Science, Natural Sciences, Economics.',
        boardTag: 'Hochschule',
        chatTitle: 'Germany University & Research',
        priceLabel: '$5/term'
      }
    }
  },

  india: {
    curriculumName: 'NCERT · CBSE / ICSE / State Boards',
    secondaryGroupTitle: 'Secondary & Senior Secondary',
    secondaryGroupRange: 'Classes 6 to 12',
    secondaryGroupPrompt: 'Select your Indian Secondary (Class 10) or Senior Secondary (Class 12) tier:',
    tiers: {
      Primary: {
        shortLabel: 'Class 1–5',
        headerLabel: 'Primary (Classes 1–5)',
        badge: 'CLASS 1 – 5',
        label: 'Primary School (Classes 1 – 5)',
        sublabel: 'Preparatory & Foundational Stage (NEP)',
        subjects: 'Mathematics, Environmental Studies (EVS), English, Computer Basics.',
        boardTag: 'NCERT Primary',
        chatTitle: 'India Primary (Classes 1–5)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Class 6–10',
        headerLabel: 'Secondary (Classes 6–10)',
        badge: 'CLASS 6 – 10',
        label: 'Middle & Secondary (Classes 6 – 10)',
        sublabel: 'CBSE / ICSE Class 10 Board Exam Preparation',
        subjects: 'Mathematics, Science (Physics, Chemistry, Biology), Social Science, Computer Applications.',
        boardTag: 'Class 10 Boards',
        chatTitle: 'India Class 6–10 (CBSE/ICSE)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'Class 11–12',
        headerLabel: 'Senior Sec (Classes 11–12)',
        badge: 'CLASS 11 – 12',
        label: 'Senior Secondary (+2 / Classes 11 – 12)',
        sublabel: 'PCM, PCB & Commerce Streams · Class 12 Boards / JEE / NEET Foundation',
        subjects: 'Physics, Chemistry, Mathematics, Biology, Accountancy, Economics, Computer Science.',
        boardTag: 'Class 12 Boards',
        chatTitle: 'India Class 11–12 (+2 Boards)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'University',
        headerLabel: 'University & Engineering',
        badge: 'HIGHER ED',
        label: 'Universities & Institutes',
        sublabel: 'B.Tech, B.Sc, B.Com, MBBS & Postgraduate Studies',
        subjects: 'Engineering, Computer Science, Economics, Pure Sciences.',
        boardTag: 'India Higher Ed',
        chatTitle: 'India University & Research',
        priceLabel: '$5/term'
      }
    }
  },

  australia: {
    curriculumName: 'Australian Curriculum (ACARA · ATAR)',
    secondaryGroupTitle: 'High School & Senior Certificate',
    secondaryGroupRange: 'Years 7 to 12',
    secondaryGroupPrompt: 'Select your Australian High School or Senior Secondary (ATAR) tier:',
    tiers: {
      Primary: {
        shortLabel: 'Years K–6',
        headerLabel: 'Primary (Years K–6)',
        badge: 'YEARS K – 6',
        label: 'Primary School (Foundation – Year 6)',
        sublabel: 'NAPLAN Primary Literacy & Numeracy',
        subjects: 'English, Mathematics, Science, HASS, Technologies.',
        boardTag: 'ACARA Primary',
        chatTitle: 'Australia Primary (K–6)',
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Years 7–10',
        headerLabel: 'Junior High (Years 7–10)',
        badge: 'YEARS 7 – 10',
        label: 'Lower Secondary (Years 7 – 10)',
        sublabel: 'Junior High Foundation & NAPLAN Years 7/9',
        subjects: 'Mathematics, Science, English, History, Geography, Economics & Business.',
        boardTag: 'ACARA Years 7–10',
        chatTitle: 'Australia High School (Years 7–10)',
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'ATAR Y11–12',
        headerLabel: 'Senior Sec / ATAR (Y11–12)',
        badge: 'YEARS 11 – 12',
        label: 'Senior Secondary (Years 11 – 12)',
        sublabel: 'HSC / VCE / QCE / WACE · ATAR Preparation',
        subjects: 'Mathematical Methods, Physics, Chemistry, Biology, Economics, Accounting.',
        boardTag: 'HSC / VCE / ATAR',
        chatTitle: 'Australia Senior Secondary (Y11–12)',
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'University',
        headerLabel: 'University & TAFE',
        badge: 'HIGHER ED',
        label: 'Universities & TAFE Institutes',
        sublabel: 'Bachelor, TAFE Diplomas & Postgraduate',
        subjects: 'Engineering, Sciences, Finance, Computing & Research.',
        boardTag: 'Australia Higher Ed',
        chatTitle: 'Australia University & TAFE',
        priceLabel: '$5/term'
      }
    }
  }
};

function buildRegionalFallbackSpec(countryName: string, region: string): CountryLevelSpec {
  const r = region.toLowerCase();

  if (r === 'europe') {
    return {
      curriculumName: `${countryName} National Curriculum`,
      secondaryGroupTitle: 'Lower & Upper Secondary',
      secondaryGroupRange: 'Grades 6 to 12',
      secondaryGroupPrompt: `Select your ${countryName} Lower Secondary or Upper Secondary / Gymnasium tier:`,
      tiers: {
        Primary: {
          shortLabel: 'Grades 1–5',
          headerLabel: 'Primary (Grades 1–5)',
          badge: 'GRADES 1 – 5',
          label: 'Primary Education (Grades 1 – 5)',
          sublabel: `${countryName} Elementary School`,
          subjects: 'Mathematics, Language Arts, Natural Science, Social Studies, Computing.',
          boardTag: `${countryName} Primary`,
          chatTitle: `${countryName} Primary (Grades 1–5)`,
          priceLabel: '$4/term'
        },
        'O-Level': {
          shortLabel: 'Grades 6–9',
          headerLabel: 'Lower Sec (Grades 6–9)',
          badge: 'GRADES 6 – 9',
          label: 'Lower Secondary (Grades 6 – 9)',
          sublabel: `${countryName} Middle / Lower Secondary Cycle`,
          subjects: 'Mathematics, Physics, Chemistry, Biology, History, Geography, Economics, Informatics.',
          boardTag: `${countryName} Lower Sec`,
          chatTitle: `${countryName} Lower Secondary (6–9)`,
          priceLabel: '$5/term'
        },
        'A-Level': {
          shortLabel: 'Upper Sec 10–12',
          headerLabel: 'Upper Sec / Matura (10–12)',
          badge: 'GRADES 10 – 12',
          label: 'Upper Secondary / Gymnasium (Grades 10 – 12)',
          sublabel: `${countryName} Matura / Baccalaureate Leaving Exam`,
          subjects: 'Advanced Mathematics, Physics, Chemistry, Biology, Economics, Computer Science, Essay Writing.',
          boardTag: `${countryName} Upper Sec`,
          chatTitle: `${countryName} Upper Secondary (10–12)`,
          priceLabel: '$5/term'
        },
        Tertiary: {
          shortLabel: 'University',
          headerLabel: 'University & Higher Ed',
          badge: 'HIGHER ED',
          label: 'Higher Education & Universities',
          sublabel: 'Bachelor, Master & Polytechnic Institutes',
          subjects: 'Engineering, Computer Science, Medicine, Economics & Research.',
          boardTag: `${countryName} Higher Ed`,
          chatTitle: `${countryName} University & Research`,
          priceLabel: '$5/term'
        }
      }
    };
  }

  if (r === 'africa') {
    return {
      curriculumName: `${countryName} National Curriculum`,
      secondaryGroupTitle: 'Junior & Senior Secondary',
      secondaryGroupRange: 'Junior to Senior High',
      secondaryGroupPrompt: `Select your ${countryName} Junior or Senior Secondary school tier:`,
      tiers: {
        Primary: {
          shortLabel: 'Primary 1–6',
          headerLabel: 'Primary (Grades 1–6)',
          badge: 'PRIMARY 1 – 6',
          label: 'Primary Education (Grades 1 – 6)',
          sublabel: `${countryName} Primary Leaving Foundation`,
          subjects: 'Mathematics, English/Language, Science & Health, Social Studies, Agriculture.',
          boardTag: `${countryName} Primary`,
          chatTitle: `${countryName} Primary Tutor`,
          priceLabel: '$4/term'
        },
        'O-Level': {
          shortLabel: 'Junior Sec',
          headerLabel: 'Junior Secondary',
          badge: 'JUNIOR SEC',
          label: 'Junior Secondary Education',
          sublabel: `${countryName} Lower Secondary Certificate`,
          subjects: 'Mathematics, General Science, Commerce, Geography, History, Civic Studies.',
          boardTag: `${countryName} Junior Sec`,
          chatTitle: `${countryName} Junior Secondary`,
          priceLabel: '$5/term'
        },
        'A-Level': {
          shortLabel: 'Senior Sec',
          headerLabel: 'Senior Secondary',
          badge: 'SENIOR SEC',
          label: 'Senior Secondary & Exam Prep',
          sublabel: `${countryName} National Leaving / Baccalaureate Certificate`,
          subjects: 'Mathematics, Physics, Chemistry, Biology, Economics, Accounting, Geography, History.',
          boardTag: `${countryName} Senior Sec`,
          chatTitle: `${countryName} Senior Secondary`,
          priceLabel: '$5/term'
        },
        Tertiary: {
          shortLabel: 'Tertiary',
          headerLabel: 'Universities & Colleges',
          badge: 'HIGHER ED',
          label: 'Universities & Technical Colleges',
          sublabel: 'Undergraduate Degrees, Diplomas & Polytechnics',
          subjects: 'Engineering, Sciences, Business, Health & Research.',
          boardTag: `${countryName} Higher Ed`,
          chatTitle: `${countryName} Tertiary & Research`,
          priceLabel: '$5/term'
        }
      }
    };
  }

  // Americas, Asia, Oceania, Global fallback
  return {
    curriculumName: `${countryName} National Curriculum`,
    secondaryGroupTitle: 'Middle & High School',
    secondaryGroupRange: 'Grades 7 to 12',
    secondaryGroupPrompt: `Select your ${countryName} Middle School or High School tier:`,
    tiers: {
      Primary: {
        shortLabel: 'Grades 1–6',
        headerLabel: 'Elementary (Grades 1–6)',
        badge: 'GRADES 1 – 6',
        label: 'Primary / Elementary School (Grades 1 – 6)',
        sublabel: `${countryName} Elementary Foundation`,
        subjects: 'Mathematics, Language Arts, Elementary Science, Social Studies.',
        boardTag: `${countryName} Elementary`,
        chatTitle: `${countryName} Elementary (Grades 1–6)`,
        priceLabel: '$4/term'
      },
      'O-Level': {
        shortLabel: 'Grades 7–9',
        headerLabel: 'Middle School (Grades 7–9)',
        badge: 'GRADES 7 – 9',
        label: 'Middle / Lower Secondary (Grades 7 – 9)',
        sublabel: `${countryName} Junior High Foundation`,
        subjects: 'Mathematics, General Science, Geography, History, Computer Studies, Economics.',
        boardTag: `${countryName} Middle School`,
        chatTitle: `${countryName} Middle School (Grades 7–9)`,
        priceLabel: '$5/term'
      },
      'A-Level': {
        shortLabel: 'High Sch 10–12',
        headerLabel: 'High School (Grades 10–12)',
        badge: 'GRADES 10 – 12',
        label: 'Upper Secondary / High School (Grades 10 – 12)',
        sublabel: `${countryName} High School Diploma / University Entrance`,
        subjects: 'Advanced Mathematics, Physics, Chemistry, Biology, Economics, Accounting, History.',
        boardTag: `${countryName} High School`,
        chatTitle: `${countryName} High School (Grades 10–12)`,
        priceLabel: '$5/term'
      },
      Tertiary: {
        shortLabel: 'University',
        headerLabel: 'College & University',
        badge: 'HIGHER ED',
        label: 'College & University',
        sublabel: 'Bachelor, Master & Technical Institutes',
        subjects: 'Engineering, Computer Science, Natural Sciences, Economics & Research.',
        boardTag: `${countryName} Higher Ed`,
        chatTitle: `${countryName} University & Research`,
        priceLabel: '$5/term'
      }
    }
  };
}

export function getCountryEducationSystem(countryName?: string): CountryEducationSystem {
  const cfg = findCountryConfig(countryName);
  const key = cfg.name.toLowerCase();
  const spec = COUNTRY_SPECS[key] || buildRegionalFallbackSpec(cfg.name, cfg.region || 'Global');

  return buildSystem(
    cfg.name,
    cfg.flag,
    spec.curriculumName,
    spec.secondaryGroupTitle,
    spec.secondaryGroupRange,
    spec.secondaryGroupPrompt,
    spec.tiers
  );
}

export function normalizeContentLevel(level?: string): ContentLevel {
  const l = (level || '').toLowerCase();
  if (l.includes('primary') || l.includes('grade 1') || l.includes('elementary')) return 'Primary';
  if (l.includes('tertiary') || l.includes('higher') || l.includes('university') || l.includes('college')) {
    return 'Tertiary';
  }
  if (
    l.includes('a-level') ||
    l.includes('form 5') ||
    l.includes('form 6') ||
    l.includes('upper') ||
    l.includes('senior') ||
    l.includes('matric') ||
    l.includes('matura') ||
    l.includes('high school')
  ) {
    return 'A-Level';
  }
  return 'O-Level';
}

export function getTierForContentLevel(
  countryName?: string,
  level?: string
): CountryEducationTier {
  const sys = getCountryEducationSystem(countryName);
  const bucket = normalizeContentLevel(level);
  return sys.tiers[bucket];
}
