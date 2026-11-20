export interface ExtractedAssetTopic {
  title: string;
  content: string;
  subject?: string;
  level?: string;
  keywords?: string[];
}

function inferSubjectFromFileName(fileName: string): string {
  const f = fileName.toLowerCase();
  if (f.includes('combined_science') || f.includes('combined science')) return 'Combined Science';
  if (f.includes('biology')) return 'Biology';
  if (f.includes('chemistry')) return 'Chemistry';
  if (f.includes('physics')) return 'Physics';
  if (f.includes('pure_math') || f.includes('pure mathematics')) return 'Pure Mathematics';
  if (f.includes('statistics')) return 'Statistics';
  if (f.includes('math')) return 'Mathematics';
  if (f.includes('geography')) return 'Geography';
  if (f.includes('history')) return 'History';
  if (f.includes('accounting') || f.includes('accounts')) return 'Accounting';
  if (f.includes('economics')) return 'Economics';
  if (f.includes('commerce')) return 'Commerce';
  if (f.includes('business')) return 'Business Studies';
  if (f.includes('computer')) return 'Computer Science';
  if (f.includes('agriculture') || f.includes('agric')) return 'Agriculture';
  if (f.includes('shona') || f.includes('chishona')) return 'ChiShona';
  if (f.includes('ndebele')) return 'IsiNdebele';
  if (f.includes('english_lit') || f.includes('literature')) return 'Literature in English';
  if (f.includes('english')) return 'English Language';
  if (f.includes('divinity')) return 'Divinity';
  if (f.includes('religious') || f.includes('fareme')) return 'Family and Religious Studies';
  if (f.includes('social_stud') || f.includes('social_science') || f.includes('heritage')) return 'Social Science';
  if (f.includes('health') || f.includes('physical_edu') || f.includes('performing_arts')) return 'Physical Edu & Arts';
  if (f.includes('textile')) return 'Textile Technology and Design';
  if (f.includes('tve')) return 'Technical & Vocational Education';
  if (f.includes('general_paper')) return 'Social Science';
  return 'ZIMSEC Curriculum';
}

function normalizeExtractedLevel(rawLevel: string): string {
  const l = (rawLevel || '').toLowerCase().trim();
  if (!l) return 'O-Level';
  if (l.includes('primary') || l.includes('grade') || l.includes('ecd') || l.includes('infant') || l.includes('junior')) {
    return 'Primary';
  }
  if (l.includes('a-level') || l.includes('alevel') || l.includes('advanced level') || l.includes('forms 5') || l.includes('form 5') || l.includes('form 6')) {
    return 'A-Level';
  }
  if (l.includes('tertiary') || l.includes('university')) {
    return 'Tertiary';
  }
  if (l === 'general' || l.includes('secondary') || l.includes('o-level') || l.includes('olevel') || l.includes('ordinary level') || l.includes('forms 1')) {
    return 'O-Level';
  }
  return rawLevel;
}

function inferLevelFromFileName(fileName: string, meta?: any, fileData?: any): string {
  const combinedMeta = [
    meta?.level,
    meta?.levels_covered,
    meta?.curriculum,
    fileData?.curriculum,
    Array.isArray(fileData?.syllabus_sources) ? fileData.syllabus_sources.join(' ') : fileData?.syllabus_source
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const f = fileName.toLowerCase();

  // Check explicit Grade / Primary / Infant / Junior / ECD signals first
  if (
    f.includes('grade7') ||
    f.includes('grade_7') ||
    f.includes('7grade') ||
    f.includes('grade2') ||
    f.includes('grade_2') ||
    f.includes('primary') ||
    f.includes('_g7_') ||
    combinedMeta.includes('grade 7') ||
    combinedMeta.includes('grade 3') ||
    combinedMeta.includes('primary') ||
    combinedMeta.includes('junior') ||
    combinedMeta.includes('infant') ||
    combinedMeta.includes('ecd')
  ) {
    return 'Primary';
  }

  // Explicitly distinguish Ordinary Level / Forms 1-4 BEFORE Advanced Level notes that may mention A-Level as a continuation
  if (
    f.includes('o_level') ||
    f.includes('olevel') ||
    f.includes('_secondary') ||
    combinedMeta.includes('ordinary level') ||
    combinedMeta.includes('forms 1-4')
  ) {
    return 'O-Level';
  }

  if (
    f.includes('a_level') ||
    f.includes('alevel') ||
    f.includes('6042') ||
    f.includes('6073') ||
    f.includes('6037') ||
    f.includes('9145') ||
    f.includes('9153') ||
    f.includes('9154') ||
    f.includes('9155') ||
    combinedMeta.includes('advanced level') ||
    combinedMeta.includes('forms 5-6') ||
    combinedMeta.includes('a-level')
  ) {
    return 'A-Level';
  }

  if (f.includes('tertiary') || f.includes('university') || combinedMeta.includes('tertiary')) {
    return 'Tertiary';
  }

  // Fallback inspection of first chunk grade if present (e.g. zimsec_english_language.json)
  if (Array.isArray(fileData?.chunks) && fileData.chunks.length > 0) {
    const firstGrade = String(fileData.chunks[0]?.grade || '').toLowerCase();
    if (firstGrade.includes('grade') || firstGrade.includes('ecd')) {
      return 'Primary';
    }
  }

  return 'O-Level';
}

function flattenObjectToReadableText(obj: any, depth = 0): string {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj.trim();
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);

  if (Array.isArray(obj)) {
    return obj
      .map((item) => {
        if (typeof item === 'string') return `- ${item.trim()}`;
        return flattenObjectToReadableText(item, depth + 1);
      })
      .filter(Boolean)
      .join('\n');
  }

  if (typeof obj === 'object') {
    const lines: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined || v === '') continue;
      if (typeof v === 'string' && v.trim().length > 0) {
        if (k === 'content' || k === 'notes' || k === 'explanation' || k === 'text') {
          lines.push(v.trim());
        } else {
          const cleanKey = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          lines.push(`**${cleanKey}:** ${v.trim()}`);
        }
      } else if (Array.isArray(v) && v.length > 0) {
        const cleanKey = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        lines.push(`#### ${cleanKey}\n${flattenObjectToReadableText(v, depth + 1)}`);
      } else if (typeof v === 'object') {
        const cleanKey = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const nested = flattenObjectToReadableText(v, depth + 1);
        if (nested) lines.push(`#### ${cleanKey}\n${nested}`);
      }
    }
    return lines.join('\n\n');
  }
  return '';
}

function extractTextField(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item.trim();

  const parts: string[] = [];
  if (typeof item.content === 'string' && item.content.trim()) parts.push(item.content.trim());
  if (typeof item.notes === 'string' && item.notes.trim()) parts.push(item.notes.trim());
  if (typeof item.explanation === 'string' && item.explanation.trim()) parts.push(item.explanation.trim());
  if (typeof item.definition === 'string' && item.definition.trim()) parts.push(item.definition.trim());
  if (typeof item.description === 'string' && item.description.trim()) parts.push(item.description.trim());
  if (typeof item.summary === 'string' && item.summary.trim() && parts.length === 0) parts.push(item.summary.trim());

  const questionPrompt = item.q || item.problem || item.question;
  if (typeof questionPrompt === 'string' && questionPrompt.trim() && !parts.includes(questionPrompt.trim())) {
    parts.push(`**Question / Problem:** ${questionPrompt.trim()}`);
  }
  const solutionText = item.a || item.solution || item.answer;
  if (typeof solutionText === 'string' && solutionText.trim()) {
    parts.push(`**Worked Answer & Explanation:**\n${solutionText.trim()}`);
  }
  if (typeof item.meaning === 'string' && item.meaning.trim()) {
    parts.push(`**Meaning:** ${item.meaning.trim()}`);
  }
  if (Array.isArray(item.key_facts) && item.key_facts.length > 0) {
    parts.push(`#### Key Syllabus Facts\n${item.key_facts.map((kf: any) => `- ${typeof kf === 'string' ? kf : flattenObjectToReadableText(kf)}`).join('\n')}`);
  }
  if (Array.isArray(item.key_concepts) && item.key_concepts.length > 0) {
    parts.push(`#### Key Concepts\n${item.key_concepts.map((kc: any) => `- ${typeof kc === 'string' ? kc : flattenObjectToReadableText(kc)}`).join('\n')}`);
  }
  if (Array.isArray(item.learning_activities) && item.learning_activities.length > 0) {
    parts.push(`#### Recommended Learning Activities\n${item.learning_activities.map((la: any) => `- ${typeof la === 'string' ? la : flattenObjectToReadableText(la)}`).join('\n')}`);
  }
  if (Array.isArray(item.examples) && item.examples.length > 0) {
    parts.push(`#### Examples\n${item.examples.map((ex: any) => `- ${typeof ex === 'string' ? ex : flattenObjectToReadableText(ex)}`).join('\n')}`);
  }

  if (parts.length === 0) {
    return flattenObjectToReadableText(item);
  }
  return parts.join('\n\n');
}

/**
 * Deterministically extracts all indexed knowledge topics from ANY JSON asset structure.
 * Used identically by both the offline index builder and KnowledgeStore.loadAssetFileContent().
 */
export function extractTopicsFromJsonAsset(fileData: any, fileName: string): ExtractedAssetTopic[] {
  const results: ExtractedAssetTopic[] = [];
  if (!fileData) return results;

  const rawMeta = fileData.metadata || fileData.meta || fileData.paperInfo || {};
  const meta = {
    ...rawMeta,
    subject: rawMeta.subject || rawMeta.subject_name || fileData.subject,
    curriculum: rawMeta.curriculum || fileData.curriculum,
    level: rawMeta.level || fileData.level
  };
  const defaultSubject = String(meta.subject || inferSubjectFromFileName(fileName));
  const defaultLevel = inferLevelFromFileName(fileName, meta, fileData);

  const pushEntry = (title: string, rawContent: string, subject?: string, level?: string, keywords?: string[]) => {
    const cleanContent = (rawContent || '').trim();
    const cleanTitle = (title || '').trim();
    if (!cleanTitle || cleanContent.length < 15) return;
    results.push({
      title: cleanTitle,
      content: cleanContent,
      subject: subject || defaultSubject,
      level: normalizeExtractedLevel(level || defaultLevel),
      keywords: keywords && keywords.length > 0 ? keywords : undefined
    });
  };

  // Schema 1: Direct Array of chunks/topics/glossary items
  if (Array.isArray(fileData)) {
    for (const item of fileData) {
      if (!item || typeof item !== 'object') continue;
      const title = item.topic || item.title || item.term || item.question || item.name || defaultSubject;
      const content = extractTextField(item);
      const itemLevel = item.level || (Array.isArray(item.levels) && item.levels.length > 0 ? item.levels[0] : defaultLevel);
      const itemSubject = item.subject || item.section || defaultSubject;
      pushEntry(title, content, itemSubject, itemLevel, item.keywords);
    }
    return results;
  }

  // Schema 2: { chunks: [...] }
  if (Array.isArray(fileData.chunks)) {
    for (const item of fileData.chunks) {
      if (!item || typeof item !== 'object') continue;
      const title = item.topic || item.title || item.term || item.name || defaultSubject;
      const content = extractTextField(item);
      const itemLevel = item.level || (item.grade ? normalizeExtractedLevel(String(item.grade)) : defaultLevel);
      pushEntry(title, content, item.subject || item.section || defaultSubject, itemLevel, item.keywords);
    }
    return results;
  }

  // Schema 3: { chapters: [...] } (e.g. Cambridge O-Level Biology Comprehensive Notes)
  if (Array.isArray(fileData.chapters)) {
    for (const ch of fileData.chapters) {
      if (!ch || typeof ch !== 'object') continue;
      const title = ch.title || ch.topic || 'Chapter';
      const content = extractTextField(ch);
      pushEntry(title, content, defaultSubject, defaultLevel, ch.keywords);
    }
    return results;
  }

  // Schema 4: { structure: [...] } (Study packs & FULL_DEPTH_FINAL files)
  if (Array.isArray(fileData.structure)) {
    const collectTopics = (tList: any[]) => {
      if (!Array.isArray(tList)) return;
      for (const t of tList) {
        if (!t || typeof t !== 'object') continue;
        const parentTitle = t.title || t.topic || t.name || '';
        const parentText = extractTextField(t);
        if (parentText && parentText.length >= 25) {
          pushEntry(parentTitle, parentText, defaultSubject, defaultLevel, t.keywords);
        }
        if (Array.isArray(t.subtopics)) {
          for (const sub of t.subtopics) {
            if (!sub || typeof sub !== 'object') continue;
            const subTitleRaw = sub.title || sub.topic || sub.name || '';
            const fullTitle =
              parentTitle && subTitleRaw && !subTitleRaw.toLowerCase().includes(parentTitle.toLowerCase())
                ? `${parentTitle}: ${subTitleRaw}`
                : subTitleRaw || parentTitle;
            const subText = extractTextField(sub);
            if (subText && subText.length >= 20) {
              pushEntry(fullTitle, subText, defaultSubject, defaultLevel, sub.keywords);
            }
          }
        }
      }
    };

    for (const s of fileData.structure) {
      if (!s || typeof s !== 'object') continue;
      if (Array.isArray(s.topics)) collectTopics(s.topics);
      if (Array.isArray(s.terms)) {
        for (const term of s.terms) {
          if (term && Array.isArray(term.topics)) {
            collectTopics(term.topics);
          }
        }
      }
    }
    if (results.length > 0) return results;
  }

  // Schema 5: Deep Tutor Knowledge Bases ({ topics: [...], glossary: [...], worked_examples: [...], sample_questions: [...] })
  if (Array.isArray(fileData.topics)) {
    for (const t of fileData.topics) {
      if (!t || typeof t !== 'object') continue;
      const title = t.topic || t.title || t.name || 'Syllabus Topic';
      const content = extractTextField(t);
      pushEntry(title, content, t.subject || defaultSubject, t.level || defaultLevel, t.keywords);
    }
    if (Array.isArray(fileData.glossary)) {
      for (const g of fileData.glossary) {
        if (!g || typeof g !== 'object') continue;
        const title = g.term || g.title || g.name || 'Glossary Term';
        const content = extractTextField(g);
        pushEntry(title, content, defaultSubject, defaultLevel);
      }
    }
    if (Array.isArray(fileData.worked_examples)) {
      for (const w of fileData.worked_examples) {
        if (!w || typeof w !== 'object') continue;
        const title = w.title || w.topic || w.problem || w.question || 'Worked Example';
        const content = extractTextField(w);
        pushEntry(title, content, defaultSubject, defaultLevel);
      }
    }
    if (Array.isArray(fileData.sample_questions)) {
      for (const q of fileData.sample_questions) {
        if (!q || typeof q !== 'object') continue;
        const title = q.question || q.q || q.topic || 'Exam Practice Question';
        const content = extractTextField(q);
        pushEntry(title, content, defaultSubject, defaultLevel);
      }
    }
    if (results.length > 0) return results;
  }

  // Schema 6: TVE Subject Map ({ subjects: { ... } })
  if (fileData.subjects && typeof fileData.subjects === 'object') {
    const subEntries = Array.isArray(fileData.subjects)
      ? fileData.subjects.map((s: any, i: number) => [s.name || s.subject || `Subject ${i + 1}`, s])
      : Object.entries(fileData.subjects);

    for (const [subKey, subVal] of subEntries) {
      if (!subVal || typeof subVal !== 'object') continue;
      const subName = String((subVal as any).subject_name || (subVal as any).title || subKey)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      if (Array.isArray((subVal as any).topics)) {
        for (const t of (subVal as any).topics) {
          const title = typeof t === 'string' ? t : t.topic || t.title || t.name || subName;
          const content = typeof t === 'string' ? `${subName}: ${t}` : extractTextField(t);
          pushEntry(`${subName} — ${title}`, content, subName, defaultLevel);
        }
      } else {
        const readable = flattenObjectToReadableText(subVal);
        pushEntry(subName, readable, subName, defaultLevel);
      }
    }
    if (results.length > 0) return results;
  }

  // Schema 7: ChiShona Practice Set ({ tsumo_practice, madimikira_practice, ... })
  if (fileData.tsumo_practice || fileData.madimikira_practice || fileData.ukama_quiz) {
    const sections = [
      ['Tsumo (ChiShona Proverbs)', fileData.tsumo_practice],
      ['Madimikira (ChiShona Idioms)', fileData.madimikira_practice],
      ['Nyaudzosingwi (Ideophones)', fileData.nyaudzosingwi_practice],
      ['Ukama (Family & Kinship)', fileData.ukama_quiz],
      ['Mitupo (Totems & Zvidawo)', fileData.mitupo_practice],
      ['Rondedzero Prompts (Composition Guide)', fileData.sample_composition_prompts]
    ] as const;

    for (const [secTitle, secObj] of sections) {
      if (!secObj) continue;
      const intro = typeof secObj.instructions === 'string' ? `${secObj.instructions}\n\n` : '';
      const items = Array.isArray(secObj.items) ? secObj.items : Array.isArray(secObj) ? secObj : [];
      if (items.length > 0) {
        const itemLines = items
          .map((it: any, i: number) => {
            const head =
              it.prompt ||
              it.sentence ||
              it.question ||
              it.idiom ||
              it.word ||
              (it.mutupo ? `Mutupo: **${it.mutupo}** — Chidau: **${it.chidau || ''}**` : '') ||
              it.totem ||
              '';
            const prefix = it.type ? `[${it.type}] ` : '';
            const opts = Array.isArray(it.options) ? `\n   - **Options:** ${it.options.join(', ')}` : '';
            const ansVal = it.answer || (it.mutupo ? it.chidau : '');
            const ans = ansVal ? `\n   - **Answer:** ${ansVal}` : '';
            const explVal = it.meaning || it.explanation || it.note || it.example || '';
            const expl = explVal ? `\n   - **Explanation:** ${explVal}` : '';
            return `${i + 1}. ${prefix}${head}${opts}${ans}${expl}`.trim();
          })
          .join('\n\n');
        pushEntry(secTitle, `${intro}${itemLines}`.trim(), 'ChiShona', defaultLevel);
      }
    }
    if (results.length > 0) return results;
  }

  // Schema 8: Primary Syllabus Objects (arts_syllabus_topics, scope_and_sequence, etc.)
  const primarySectionKeys = [
    'arts_syllabus_topics',
    'physical_education_health_topics',
    'topics_overview',
    'infant_level_scope_and_sequence_arts',
    'scope_and_sequence',
    'zimbabwe_specific_content_for_primary_learners',
    'sample_junior_pe_content_grade6',
    'grade_3_sample_scheme'
  ];
  for (const pk of primarySectionKeys) {
    const val = fileData[pk];
    if (!val) continue;
    if (pk === 'grade_3_sample_scheme' && typeof val === 'object' && !Array.isArray(val)) {
      const schemeTitle = `Grade 3 Teaching Scheme: ${val.topic || 'Cultural Heritage'}`;
      const text = flattenObjectToReadableText(val);
      pushEntry(schemeTitle, text, defaultSubject, 'Primary');
      continue;
    }
    if (Array.isArray(val)) {
      for (const el of val) {
        if (el && typeof el === 'object') {
          const title = el.name || el.title || el.topic || pk.replace(/_/g, ' ');
          const extracted = extractTextField(el);
          // Skip bare stub entries that have no substantive description/explanation beyond Name/Id
          if (!el.description && !el.explanation && !el.content && extracted.length < 100) continue;
          pushEntry(title, extracted, defaultSubject, 'Primary');
        }
      }
    } else if (typeof val === 'object') {
      for (const [k, v] of Object.entries(val)) {
        if (k === 'note') continue;
        const cleanTitle = k.replace(/^topic_\d+_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const text = flattenObjectToReadableText(v);
        pushEntry(cleanTitle, text, defaultSubject, 'Primary');
      }
    }
  }

  // Schema 9: Combined Exam Bank JSONs (paper1Questions, paper2Questions, papers[])
  const qLists: any[] = [];
  if (Array.isArray(fileData.paper1Questions)) qLists.push(...fileData.paper1Questions);
  if (Array.isArray(fileData.paper2Questions)) qLists.push(...fileData.paper2Questions);
  if (Array.isArray(fileData.questions)) qLists.push(...fileData.questions);
  if (Array.isArray(fileData.papers)) {
    for (const p of fileData.papers) {
      if (p && Array.isArray(p.questions)) qLists.push(...p.questions);
    }
  }
  for (const q of qLists) {
    if (!q || typeof q !== 'object') continue;
    const qText = q.questionText || q.question || q.prompt || '';
    const ans = q.explanation || q.answer || q.markingScheme || '';
    if (qText && ans) {
      const title = (q.topic ? `${q.topic}: ` : '') + qText.slice(0, 120);
      const body = `**Question:** ${qText}\n\n${q.correctAnswer ? `**Correct Option:** ${q.correctAnswer}\n\n` : ''}**Verified Answer & Mark Scheme:**\n${ans}`;
      pushEntry(title, body, defaultSubject, defaultLevel);
    }
  }

  return results;
}
