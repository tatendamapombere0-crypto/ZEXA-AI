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
  if (f.includes('english_lit') || f.includes('literature')) return 'English Literature';
  if (f.includes('english')) return 'English Language';
  if (f.includes('divinity')) return 'Divinity';
  if (f.includes('religious') || f.includes('fareme')) return 'Family and Religious Studies';
  if (f.includes('social_stud') || f.includes('social_science') || f.includes('heritage')) return 'Social Science';
  if (f.includes('health') || f.includes('physical_edu') || f.includes('performing_arts')) return 'Physical Education & Arts';
  if (f.includes('textile')) return 'Textile Technology and Design';
  if (f.includes('tve')) return 'Technical & Vocational Education';
  if (f.includes('general_paper')) return 'General Paper';
  return 'ZIMSEC Curriculum';
}

function inferLevelFromFileName(fileName: string, meta?: any): string {
  const metaLvl = String(meta?.level || meta?.levels_covered || '').toLowerCase();
  const f = fileName.toLowerCase();
  if (f.includes('grade7') || f.includes('grade_7') || f.includes('primary') || f.includes('_g7_') || metaLvl.includes('grade 7') || metaLvl.includes('primary') || metaLvl.includes('junior')) {
    return 'Primary';
  }
  if (f.includes('a_level') || f.includes('alevel') || f.includes('6042') || f.includes('6073') || f.includes('6037') || f.includes('9154') || f.includes('9155') || metaLvl.includes('advanced level') || metaLvl.includes('forms 5-6') || metaLvl.includes('a-level')) {
    return 'A-Level';
  }
  if (f.includes('tertiary') || f.includes('university')) {
    return 'Tertiary';
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
  if (typeof item.answer === 'string' && item.answer.trim()) {
    parts.push(`**Answer:** ${item.answer.trim()}`);
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

  const meta = fileData.metadata || fileData.meta || fileData.paperInfo || {};
  const defaultSubject = String(meta.subject || meta.subject_name || inferSubjectFromFileName(fileName));
  const defaultLevel = inferLevelFromFileName(fileName, meta);

  const pushEntry = (title: string, rawContent: string, subject?: string, level?: string, keywords?: string[]) => {
    const cleanContent = (rawContent || '').trim();
    const cleanTitle = (title || '').trim();
    if (!cleanTitle || cleanContent.length < 15) return;
    results.push({
      title: cleanTitle,
      content: cleanContent,
      subject: subject || defaultSubject,
      level: level || defaultLevel,
      keywords: keywords && keywords.length > 0 ? keywords : undefined
    });
  };

  // Schema 1: Direct Array of chunks/topics/glossary items
  if (Array.isArray(fileData)) {
    for (const item of fileData) {
      if (!item || typeof item !== 'object') continue;
      const title = item.topic || item.title || item.term || item.question || item.name || defaultSubject;
      const content = extractTextField(item);
      pushEntry(title, content, item.subject || defaultSubject, item.level || defaultLevel, item.keywords);
    }
    return results;
  }

  // Schema 2: { chunks: [...] }
  if (Array.isArray(fileData.chunks)) {
    for (const item of fileData.chunks) {
      if (!item || typeof item !== 'object') continue;
      const title = item.topic || item.title || item.term || item.name || defaultSubject;
      const content = extractTextField(item);
      pushEntry(title, content, item.subject || defaultSubject, item.level || defaultLevel, item.keywords);
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
        const title = w.title || w.topic || w.question || 'Worked Example';
        const content = extractTextField(w);
        pushEntry(title, content, defaultSubject, defaultLevel);
      }
    }
    if (Array.isArray(fileData.sample_questions)) {
      for (const q of fileData.sample_questions) {
        if (!q || typeof q !== 'object') continue;
        const title = q.question || q.topic || 'Exam Practice Question';
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
      ['Mitupo (Totems)', fileData.mitupo_practice],
      ['Rondedzero Prompts', fileData.sample_composition_prompts]
    ] as const;

    for (const [secTitle, secObj] of sections) {
      if (!secObj) continue;
      const items = Array.isArray(secObj.items) ? secObj.items : Array.isArray(secObj) ? secObj : [];
      if (items.length > 0) {
        const body = items
          .map((it: any, i: number) => `${i + 1}. ${it.prompt || it.question || it.word || it.totem || ''}\n   - **Answer:** ${it.answer || it.meaning || ''}\n   - **Explanation:** ${it.meaning || it.explanation || it.example || ''}`.trim())
          .join('\n\n');
        pushEntry(secTitle, body, 'ChiShona', defaultLevel);
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
    if (Array.isArray(val)) {
      for (const el of val) {
        if (el && typeof el === 'object') {
          const title = el.name || el.title || el.topic || pk.replace(/_/g, ' ');
          pushEntry(title, extractTextField(el), defaultSubject, 'Primary');
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
