import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Install deterministic in-memory localStorage mock before importing app modules
const memStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => (memStore.has(key) ? memStore.get(key)! : null),
  setItem: (key: string, value: string) => {
    memStore.set(key, String(value));
  },
  removeItem: (key: string) => {
    memStore.delete(key);
  },
  clear: () => {
    memStore.clear();
  },
  key: (index: number) => Array.from(memStore.keys())[index] ?? null,
  get length() {
    return memStore.size;
  }
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true
});

// Provide lightweight fetch backed by public/ so offline JSON packs load cleanly in Node tests
Object.defineProperty(globalThis, 'fetch', {
  value: async (input: string | URL) => {
    const rawUrl = String(input);
    const cleaned = rawUrl
      .replace(/^https?:\/\/localhost:\d+/i, '')
      .replace(/^\/+/, '');
    const candidatePublic = path.join(process.cwd(), 'public', cleaned);
    const candidateDist = path.join(process.cwd(), cleaned);
    const targetPath = fs.existsSync(candidatePublic) ? candidatePublic : candidateDist;

    if (!fs.existsSync(targetPath)) {
      return {
        ok: false,
        status: 404,
        json: async () => ({})
      } as Response;
    }

    const body = fs.readFileSync(targetPath, 'utf-8');
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(body)
    } as Response;
  },
  configurable: true,
  writable: true
});

const { WORLD_COUNTRIES, findCountryConfig, hasCountryCurriculumPack } = await import('../src/data/worldCountries');
const { StorageManager } = await import('../src/lib/storage');
const { KnowledgeStore } = await import('../src/lib/knowledgeStore');
const { ExamStore } = await import('../src/lib/examStore');
const { ExamBankMatcher } = await import('../src/lib/examBankMatcher');
const { NotificationManager } = await import('../src/lib/notificationManager');
const { AIEngine } = await import('../src/lib/aiEngine');

test('WORLD_COUNTRIES contains the full world directory and marks only Zimbabwe as curriculum-loaded', () => {
  assert.ok(WORLD_COUNTRIES.length >= 190, `Expected full world list (>=190 countries), got ${WORLD_COUNTRIES.length}`);

  for (const name of ['Zimbabwe', 'South Africa', 'Botswana', 'Zambia', 'Nigeria', 'Kenya', 'United Kingdom', 'United States', 'Japan', 'Brazil']) {
    assert.ok(findCountryConfig(name), `Expected ${name} in WORLD_COUNTRIES`);
  }

  assert.equal(hasCountryCurriculumPack('Zimbabwe'), true);
  assert.equal(hasCountryCurriculumPack('South Africa'), false);
  assert.equal(hasCountryCurriculumPack('United Kingdom'), false);
  assert.equal(hasCountryCurriculumPack('Japan'), false);

  const loadedPacks = WORLD_COUNTRIES.filter((c) => c.hasCurriculumPack);
  assert.deepEqual(
    loadedPacks.map((c) => c.name),
    ['Zimbabwe'],
    'Only Zimbabwe should currently report an offline curriculum pack loaded'
  );
});

test('StorageManager persists per-account countries and resets residual session data cleanly', () => {
  localStorage.clear();

  assert.equal(StorageManager.hasSelectedCountry(), false, 'Fresh session must require explicit country selection');

  StorageManager.initNewSession('tendai@school.co.zw', 'Zimbabwe');
  assert.equal(StorageManager.hasSelectedCountry(), true);
  StorageManager.setPreferredLanguage('sn');
  localStorage.setItem('zexa_chat_messages', JSON.stringify([{ id: '1', text: 'Zimbabwe heritage' }]));
  localStorage.setItem('zexa_active_paper', 'zimsec_history');

  assert.equal(StorageManager.getUserCountry(), 'Zimbabwe');
  assert.equal(StorageManager.isZimbabweAccount(), true);
  assert.equal(StorageManager.hasCountryCurriculumPack(), true);
  assert.equal(StorageManager.getSavedCountryForEmail('tendai@school.co.zw'), 'Zimbabwe');

  StorageManager.initNewSession('thabo@school.za', 'South Africa');
  assert.equal(StorageManager.hasSelectedCountry(), true);
  assert.equal(StorageManager.getUserCountry(), 'South Africa');
  assert.equal(StorageManager.isZimbabweAccount(), false);
  assert.equal(StorageManager.hasCountryCurriculumPack(), false);
  assert.equal(StorageManager.getSavedCountryForEmail('thabo@school.za'), 'South Africa');
  assert.equal(StorageManager.getSavedCountryForEmail('tendai@school.co.zw'), 'Zimbabwe');
  assert.equal(StorageManager.getPreferredLanguage(), 'en');
  assert.equal(localStorage.getItem('zexa_chat_messages'), null);
  assert.equal(localStorage.getItem('zexa_active_paper'), null);

  StorageManager.logout();
  assert.equal(StorageManager.hasSelectedCountry(), false, 'Logout must clear selected country so next session selects again');

  StorageManager.initNewSession('Offline Student', 'South Africa');
  assert.equal(StorageManager.hasSelectedCountry(), true);
  assert.equal(StorageManager.getUserCountry(), 'South Africa');
  assert.equal(StorageManager.hasCountryCurriculumPack(), false);
});

test('KnowledgeStore remains completely blank for countries without loaded curriculum packs while keeping Zimbabwe intact', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  for (const country of ['South Africa', 'United Kingdom', 'Japan']) {
    for (const level of ['Primary', 'O-Level', 'A-Level']) {
      const subjects = await KnowledgeStore.getSubjects(level, country);
      assert.deepEqual(subjects, [], `Expected 0 subjects for ${country} ${level} until data pack is loaded`);

      const topics = await KnowledgeStore.getTopics(level, 'Mathematics', country);
      assert.deepEqual(topics, [], `Expected 0 topics for ${country} ${level}`);

      const visuals = KnowledgeStore.getAllVisualTopics(level, country);
      assert.deepEqual(visuals, [], `Expected 0 visual diagrams for ${country} ${level}`);

      const search = await KnowledgeStore.searchScored('photosynthesis', level, country);
      assert.deepEqual(search.results, [], `Expected 0 RAG results for ${country} ${level}`);
      assert.equal(search.bestMatch, undefined);
    }
  }

  const zwPrimarySubjects = await KnowledgeStore.getSubjects('Primary', 'Zimbabwe');
  assert.ok(zwPrimarySubjects.includes('Shona'), 'Zimbabwe Primary must include Shona');
  assert.ok(zwPrimarySubjects.includes('Social Science'), 'Zimbabwe Primary must include Social Science');

  const zwOLevelSubjects = await KnowledgeStore.getSubjects('O-Level', 'Zimbabwe');
  assert.ok(zwOLevelSubjects.includes('Shona'), 'Zimbabwe O-Level must include Shona');

  const zimSearch = await KnowledgeStore.searchScored('President of Zimbabwe Mnangagwa', 'O-Level', 'Zimbabwe');
  assert.ok(
    zimSearch.results.some((r) => String(r.chunk.id).startsWith('zw_')),
    'Zimbabwe account search should surface verified Zimbabwe Encyclopedia chunks'
  );
});

test('ExamStore and ExamBankMatcher remain empty for South Africa and other countries without loaded packs', async () => {
  localStorage.clear();

  for (const country of ['South Africa', 'United Kingdom', 'Botswana']) {
    for (const level of ['Primary', 'O-Level', 'A-Level']) {
      const subjects = await ExamStore.getSubjects(level, country);
      assert.deepEqual(subjects, [], `Expected 0 exam subjects for ${country} ${level}`);

      const papers = await ExamStore.getPapers(level, undefined, country);
      assert.deepEqual(papers, [], `Expected 0 exam papers for ${country} ${level}`);
    }

    const match = await ExamBankMatcher.matchQuestion('Explain photosynthesis', 'O-Level', country);
    assert.equal(match, null, `Expected null exam match for ${country} in AI-only mode`);
  }

  const zimALevelPapers = await ExamStore.getPapers('A-Level', undefined, 'Zimbabwe');
  assert.ok(
    zimALevelPapers.some((p) => p.paperCode.startsWith('9155/1') || p.paperCode.startsWith('6039/02')),
    'Zimbabwe A-Level account should retain Zimbabwe History/Literature papers'
  );
});

test('NotificationManager omits Harare and ZIMSEC hints for non-Zimbabwe accounts', () => {
  localStorage.clear();
  const zaPayload = NotificationManager.buildNotificationPayload('6:00 AM', 'South Africa');
  assert.equal(
    /zimsec|harare|zimbabwe|shona|pfumvudza|lobengula|nehanda/i.test(`${zaPayload.title} ${zaPayload.body}`),
    false,
    `Leaked Zimbabwe term in South Africa notification: ${zaPayload.title} / ${zaPayload.body}`
  );

  const zimPayload = NotificationManager.buildNotificationPayload('6:00 AM', 'Zimbabwe');
  assert.match(`${zimPayload.title} ${zimPayload.body}`, /ZIMSEC/i);
});

test('AIEngine routes Zimbabwe RAG truth only for Zimbabwe and uses clean AI-only mode for South Africa', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  const noopCallbacks = {
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  };

  const zimChimurenga = await AIEngine.retrieveGroundedBundle('Explain the First Chimurenga', {
    level: 'O-Level',
    country: 'Zimbabwe',
    ...noopCallbacks
  });
  assert.equal(zimChimurenga.lockToVerifiedTruth, true);
  assert.match(zimChimurenga.rawResult.text, /1896|Nehanda|Kaguvi|Chimurenga/i);

  for (const prompt of [
    'Hello',
    'Explain the First Chimurenga',
    'Who is the president of Zimbabwe?',
    'What is the difference between RAM and ROM?'
  ]) {
    const zaBundle = await AIEngine.retrieveGroundedBundle(prompt, {
      level: 'O-Level',
      country: 'South Africa',
      ...noopCallbacks
    });
    assert.equal(zaBundle.lockToVerifiedTruth, false, `South Africa must stay unlocked AI-only for "${prompt}"`);
    assert.equal(zaBundle.contextSnippet, '', `South Africa must receive empty RAG context for "${prompt}"`);
    assert.equal(/\bZIMSEC\b|Nyatsimba Mutota|Harare/i.test(zaBundle.rawResult.text), false);
    assert.equal(/\bZIMSEC\b/i.test(zaBundle.rawResult.sourceTag), false);
    assert.deepEqual(zaBundle.rawResult.suggestions, []);
  }
});
