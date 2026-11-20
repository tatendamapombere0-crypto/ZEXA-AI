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
const defaultFetchImpl = async (input: string | URL) => {
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
      headers: new Headers(),
      json: async () => ({})
    } as unknown as Response;
  }

  const body = fs.readFileSync(targetPath, 'utf-8');
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => JSON.parse(body)
  } as unknown as Response;
};

Object.defineProperty(globalThis, 'fetch', {
  value: defaultFetchImpl,
  configurable: true,
  writable: true
});

const { WORLD_COUNTRIES, findCountryConfig, hasCountryCurriculumPack } = await import('../src/data/worldCountries');
const { StorageManager } = await import('../src/lib/storage');
const { KnowledgeStore } = await import('../src/lib/knowledgeStore');
const { ExamStore } = await import('../src/lib/examStore');
const { ExamBankMatcher } = await import('../src/lib/examBankMatcher');
const { NotificationManager } = await import('../src/lib/notificationManager');
const { ZexaNeuralEngine } = await import('../src/lib/zexaNeuralEngine');
const { AIEngine } = await import('../src/lib/aiEngine');
const {
  getExamBoardProfile,
  getUniversalStarterPrompts,
  buildQuickFollowUps
} = await import('../src/data/africanExamBoards');
const {
  getCountryEducationSystem,
  getTierForContentLevel
} = await import('../src/data/countryEducationLevels');

test('WORLD_COUNTRIES contains the full world directory and marks Botswana, South Africa, and Zimbabwe as curriculum-loaded', () => {
  assert.ok(WORLD_COUNTRIES.length >= 190, `Expected full world list (>=190 countries), got ${WORLD_COUNTRIES.length}`);

  for (const name of ['Zimbabwe', 'South Africa', 'Botswana', 'Zambia', 'Nigeria', 'Kenya', 'United Kingdom', 'United States', 'Japan', 'Brazil']) {
    assert.ok(findCountryConfig(name), `Expected ${name} in WORLD_COUNTRIES`);
  }

  assert.equal(hasCountryCurriculumPack('Zimbabwe'), true);
  assert.equal(hasCountryCurriculumPack('Botswana'), true);
  assert.equal(hasCountryCurriculumPack('South Africa'), true);
  assert.equal(hasCountryCurriculumPack('Nigeria'), false);
  assert.equal(hasCountryCurriculumPack('United Kingdom'), false);
  assert.equal(hasCountryCurriculumPack('Japan'), false);

  const loadedPacks = WORLD_COUNTRIES.filter((c) => c.hasCurriculumPack);
  assert.deepEqual(
    loadedPacks.map((c) => c.name).sort(),
    ['Botswana', 'South Africa', 'Zimbabwe'],
    'Only Botswana, South Africa, and Zimbabwe should currently report offline curriculum packs loaded'
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

  StorageManager.initNewSession('chidi@school.ng', 'Nigeria');
  assert.equal(StorageManager.hasSelectedCountry(), true);
  assert.equal(StorageManager.getUserCountry(), 'Nigeria');
  assert.equal(StorageManager.isZimbabweAccount(), false);
  assert.equal(StorageManager.hasCountryCurriculumPack(), false);
  assert.equal(StorageManager.getSavedCountryForEmail('chidi@school.ng'), 'Nigeria');
  assert.equal(StorageManager.getSavedCountryForEmail('tendai@school.co.zw'), 'Zimbabwe');
  assert.equal(StorageManager.getPreferredLanguage(), 'en');
  assert.equal(localStorage.getItem('zexa_chat_messages'), null);
  assert.equal(localStorage.getItem('zexa_active_paper'), null);

  StorageManager.logout();
  assert.equal(StorageManager.hasSelectedCountry(), false, 'Logout must clear selected country so next session selects again');

  StorageManager.initNewSession('Offline Student', 'Nigeria');
  assert.equal(StorageManager.hasSelectedCountry(), true);
  assert.equal(StorageManager.getUserCountry(), 'Nigeria');
  assert.equal(StorageManager.hasCountryCurriculumPack(), false);
});

test('KnowledgeStore remains completely blank for countries without loaded curriculum packs while keeping Zimbabwe intact', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  for (const country of ['Nigeria', 'United Kingdom', 'Japan']) {
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

test('ExamStore and ExamBankMatcher remain empty for countries without loaded packs while serving Zimbabwe, Botswana, and South Africa separately', async () => {
  localStorage.clear();

  for (const country of ['Nigeria', 'United Kingdom', 'Kenya']) {
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
  assert.equal(
    zimALevelPapers.some((p) => p.id.startsWith('bw_') || p.id.startsWith('za_')),
    false,
    'Zimbabwe A-Level account must never include Botswana BEC or South Africa CAPS/NSC exam papers'
  );

  const bwALevelPapers = await ExamStore.getPapers('A-Level', undefined, 'Botswana');
  assert.ok(
    bwALevelPapers.some((p) => p.id.startsWith('bw_') && p.subject === 'Development Studies'),
    'Botswana BGCSE account must include Botswana Development Studies exam papers'
  );
  assert.equal(
    bwALevelPapers.some((p) => p.paperCode.startsWith('9155/1') || p.subject === 'Shona' || p.id.startsWith('za_')),
    false,
    'Botswana BGCSE account must never include ZIMSEC Zimbabwe or South Africa CAPS/NSC papers'
  );

  const zaALevelPapers = await ExamStore.getPapers('A-Level', undefined, 'South Africa');
  assert.ok(
    zaALevelPapers.some((p) => p.id.startsWith('za_') && p.subject === 'Physical Sciences'),
    'South Africa NSC Matric account must include South Africa Physical Sciences exam papers'
  );
  assert.equal(
    zaALevelPapers.some((p) => p.paperCode.startsWith('9155/1') || p.subject === 'Shona' || p.id.startsWith('bw_')),
    false,
    'South Africa NSC Matric account must never include ZIMSEC Zimbabwe or Botswana BEC papers'
  );
});

test('NotificationManager omits Harare and ZIMSEC hints for non-Zimbabwe accounts', () => {
  localStorage.clear();
  const kePayload = NotificationManager.buildNotificationPayload('6:00 AM', 'Kenya');
  assert.equal(
    /zimsec|harare|zimbabwe|shona|pfumvudza|lobengula|nehanda/i.test(`${kePayload.title} ${kePayload.body}`),
    false,
    `Leaked Zimbabwe term in Kenya notification: ${kePayload.title} / ${kePayload.body}`
  );

  const zimPayload = NotificationManager.buildNotificationPayload('6:00 AM', 'Zimbabwe');
  assert.match(`${zimPayload.title} ${zimPayload.body}`, /ZIMSEC/i);
});

test('AIEngine routes Zimbabwe RAG truth only for Zimbabwe and answers universal STEM/math cleanly for non-Zimbabwe accounts without leaking ZIMSEC', async () => {
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
    'What is the difference between RAM and ROM?',
    'Explain photosynthesis',
    'What is 25 * 4?'
  ]) {
    const ngBundle = await AIEngine.retrieveGroundedBundle(prompt, {
      level: 'O-Level',
      country: 'Nigeria',
      ...noopCallbacks
    });
    assert.equal(ngBundle.lockToVerifiedTruth, false, `Nigeria must stay unlocked for "${prompt}"`);
    assert.equal(ngBundle.contextSnippet, '', `Nigeria must receive empty Zimbabwe RAG context for "${prompt}"`);
    assert.equal(/\bZIMSEC\b|Nyatsimba Mutota|Harare/i.test(ngBundle.rawResult.text), false);
    assert.equal(/\bZIMSEC\b/i.test(ngBundle.rawResult.sourceTag), false);
    assert.deepEqual(ngBundle.rawResult.suggestions, []);
  }

  const ngMath = await AIEngine.retrieveGroundedBundle('What is 25 * 4?', {
    level: 'O-Level',
    country: 'Nigeria',
    ...noopCallbacks
  });
  assert.equal(ngMath.hasDeterministicFallback, true);
  assert.match(ngMath.rawResult.text, /\b100\b/);

  const ngBio = await AIEngine.retrieveGroundedBundle('Explain photosynthesis', {
    level: 'O-Level',
    country: 'Nigeria',
    ...noopCallbacks
  });
  assert.equal(ngBio.hasDeterministicFallback, true);
  assert.match(ngBio.rawResult.text, /chlorophyll|carbon dioxide|glucose/i);
});

test('AIEngine streams ZEXA AI neural responses when connected and recovers cleanly on inference failure', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  const origWindow = (globalThis as any).window;
  const mockWin: any = {
    AndroidNativeAI: {
      generate: (rawPayload: string) => {
        const payload = JSON.parse(rawPayload);
        assert.equal(payload.country, 'Nigeria');
        assert.equal(payload.context, '');
        assert.equal(payload.enableThinking, false);
        assert.equal(payload.maxTokens, 130);
        setTimeout(() => {
          mockWin.__onNativeToken('Photosynthesis converts ');
          mockWin.__onNativeToken('light energy into glucose.');
          mockWin.__onNativeComplete('Total: 0.2s • ZEXA AI');
        }, 10);
      },
      stopGeneration: () => {}
    }
  };
  (globalThis as any).window = mockWin;

  try {
    assert.equal(ZexaNeuralEngine.isReady(), true);
    assert.equal(ZexaNeuralEngine.getStatus().modelName, 'ZEXA AI');

    let streamed = '';
    let completed = false;
    await AIEngine.generate('How does photosynthesis work?', {
      level: 'O-Level',
      country: 'Nigeria',
      onToken: (t) => {
        streamed += t;
      },
      onComplete: () => {
        completed = true;
      },
      onError: (err) => {
        assert.fail(`Unexpected error: ${err}`);
      }
    });

    assert.equal(completed, true);
    assert.match(streamed, /light energy into glucose/i);

    // Verify failover when connected neural engine fails before emitting tokens on an open-ended question
    mockWin.AndroidNativeAI.generate = () => {
      setTimeout(() => {
        mockWin.__onNativeError('EMPTY_NEURAL_OUTPUT');
      }, 10);
    };

    let failStreamed = '';
    let failCompleted = false;
    await AIEngine.generate('Analyze agrarian reform impacts in West Africa', {
      level: 'O-Level',
      country: 'Nigeria',
      onToken: (t) => {
        failStreamed += t;
      },
      onComplete: () => {
        failCompleted = true;
      },
      onError: (err) => {
        assert.fail(`Expected settled recovery stream, got onError: ${err}`);
      }
    });

    assert.equal(failCompleted, true);
    assert.match(failStreamed, /Unable to generate a live neural response right now/i);

    // Verify AndroidNativeAI with isReady() === false is NOT treated as ready
    mockWin.AndroidNativeAI.isReady = () => false;
    assert.equal(ZexaNeuralEngine.isReady(), false);
    assert.notEqual(ZexaNeuralEngine.getStatus().status, 'ready');

    // Verify whitespace-only tokens + control markers trigger clean failover rather than blank answer
    mockWin.AndroidNativeAI.isReady = () => true;
    mockWin.AndroidNativeAI.generate = () => {
      setTimeout(() => {
        mockWin.__onNativeToken('\n  \n');
        mockWin.__onNativeToken('<|im_end|>');
        mockWin.__onNativeComplete('Total: 0.1s • ZEXA AI');
      }, 10);
    };

    let blankFailStreamed = '';
    let blankFailCompleted = false;
    await AIEngine.generate('What is gravity?', {
      level: 'O-Level',
      country: 'Nigeria',
      onToken: (t) => {
        blankFailStreamed += t;
      },
      onComplete: () => {
        blankFailCompleted = true;
      },
      onError: (err) => {
        assert.fail(`Expected deterministic gravity failover on whitespace-only neural output, got error: ${err}`);
      }
    });

    assert.equal(blankFailCompleted, true);
    assert.match(blankFailStreamed, /Gravity & Gravitational Force|attractive force/i);
    assert.doesNotMatch(blankFailStreamed, /peristalsis/i);

    // Verify synchronous string return from native bridge streams & settles cleanly
    mockWin.AndroidNativeAI.generate = () => '\n\nGravity attracts objects with mass toward one another.';
    let syncStreamed = '';
    let syncCompleted = false;
    await AIEngine.generate('What is gravity?', {
      level: 'O-Level',
      country: 'Nigeria',
      onToken: (t) => {
        syncStreamed += t;
      },
      onComplete: () => {
        syncCompleted = true;
      },
      onError: (err) => {
        assert.fail(`Unexpected error on sync bridge return: ${err}`);
      }
    });

    assert.equal(syncCompleted, true);
    assert.equal(syncStreamed, 'Gravity attracts objects with mass toward one another.');

    // Verify chunked <think>...</think> blocks are stripped while keeping only the real answer
    mockWin.AndroidNativeAI.generate = () => {
      setTimeout(() => {
        mockWin.__onNativeToken('<th');
        mockWin.__onNativeToken('ink>Let me plan the physics explanation.</thi');
        mockWin.__onNativeToken('nk>\n\n');
        mockWin.__onNativeToken('Gravity pulls masses together.');
        mockWin.__onNativeComplete('Total: 0.2s • ZEXA AI');
      }, 10);
    };

    let thinkStripStreamed = '';
    let thinkStripCompleted = false;
    await AIEngine.generate('What is gravity?', {
      level: 'O-Level',
      country: 'Nigeria',
      onToken: (t) => {
        thinkStripStreamed += t;
      },
      onComplete: () => {
        thinkStripCompleted = true;
      },
      onError: (err) => {
        assert.fail(`Unexpected error with <think> filter: ${err}`);
      }
    });
    assert.equal(thinkStripCompleted, true);
    assert.equal(thinkStripStreamed, 'Gravity pulls masses together.');
    assert.doesNotMatch(thinkStripStreamed, /<think>|<\/think>|Let me plan/i);

    // Verify think-only output triggers clean failover rather than empty bubble
    mockWin.AndroidNativeAI.generate = () => {
      setTimeout(() => {
        mockWin.__onNativeToken('<think>Internal thought without final answer...</think>\n   ');
        mockWin.__onNativeComplete('Total: 0.2s • ZEXA AI');
      }, 10);
    };

    let thinkOnlyStreamed = '';
    let thinkOnlyCompleted = false;
    await AIEngine.generate('Analyze agrarian reform impacts in West Africa', {
      level: 'O-Level',
      country: 'Nigeria',
      onToken: (t) => {
        thinkOnlyStreamed += t;
      },
      onComplete: () => {
        thinkOnlyCompleted = true;
      },
      onError: (err) => {
        assert.fail(`Expected recovery stream on think-only output, got error: ${err}`);
      }
    });
    assert.equal(thinkOnlyCompleted, true);
    assert.match(thinkOnlyStreamed, /Unable to generate a live neural response right now/i);
    assert.doesNotMatch(thinkOnlyStreamed, /Internal thought without final answer/i);
  } finally {
    if (origWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = origWindow;
    }
  }
});

test('ZexaNeuralEngine probes bundled assets safely without buffering full body on range-less WebViews', async () => {
  const origWindow = (globalThis as any).window;
  const origFetch = globalThis.fetch;

  let streamCancelled = false;
  let fullArrayBufferCalled = false;

  (globalThis as any).window = {
    location: {
      href: 'file:///android_asset/dist/index.html',
      protocol: 'file:'
    }
  };

  Object.defineProperty(globalThis, 'fetch', {
    value: async (url: string) => {
      if (String(url) === 'file:///android_asset/dist/assets/zexa_ai.gguf') {
        return {
          ok: true,
          status: 200, // Simulates Android WebViewAssetLoader ignoring Range header
          headers: new Headers({ 'content-type': 'application/octet-stream', 'content-length': '410000000' }),
          body: {
            getReader: () => ({
              read: async () => ({
                value: new Uint8Array([0x47, 0x47, 0x55, 0x46, 0x03, 0x00]),
                done: false
              }),
              cancel: async () => {
                streamCancelled = true;
              }
            }),
            cancel: async () => {}
          },
          arrayBuffer: async () => {
            fullArrayBufferCalled = true;
            return new ArrayBuffer(0);
          }
        } as unknown as Response;
      }
      return {
        ok: false,
        status: 404,
        headers: new Headers()
      } as unknown as Response;
    },
    configurable: true,
    writable: true
  });

  try {
    const probe = await ZexaNeuralEngine.checkLocalGGUFExists();
    assert.equal(probe.exists, true);
    assert.equal(probe.url, 'file:///android_asset/dist/assets/zexa_ai.gguf');
    assert.equal(streamCancelled, true, 'Must cancel reader immediately after 4 magic bytes');
    assert.equal(fullArrayBufferCalled, false, 'Must never buffer 400MB arrayBuffer during asset probe');
  } finally {
    await ZexaNeuralEngine.unload();
    Object.defineProperty(globalThis, 'fetch', {
      value: defaultFetchImpl,
      configurable: true,
      writable: true
    });
    if (origWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = origWindow;
    }
    void origFetch;
  }
});

test('Codebase and UI contain zero Qwen brand references (ZEXA AI display name only)', () => {
  const dirsToScan = [
    path.join(process.cwd(), 'src'),
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'metadata.json'),
    path.join(process.cwd(), 'public', 'sw.js'),
    path.join(process.cwd(), 'ANDROID_STUDIO_INTEGRATION_GUIDE.md')
  ];

  const collectFiles = (target: string): string[] => {
    if (!fs.existsSync(target)) return [];
    const stat = fs.statSync(target);
    if (stat.isFile()) return [target];
    return fs.readdirSync(target).flatMap((entry) => collectFiles(path.join(target, entry)));
  };

  const files = dirsToScan.flatMap(collectFiles);
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    assert.equal(
      /qwen/i.test(content),
      false,
      `Found prohibited Qwen reference in ${path.relative(process.cwd(), filePath)}`
    );
  }
});

test('Core physics, astronomy, chemistry, and economics queries resolve universally without Zimbabwe leakage', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  const noop = {
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  };

  const ngGravity = await AIEngine.retrieveGroundedBundle('What is gravity?', {
    level: 'O-Level',
    country: 'Nigeria',
    ...noop
  });
  assert.match(ngGravity.rawResult.text, /Gravitational Force|Newton/i);
  assert.doesNotMatch(ngGravity.rawResult.text, /peristalsis|bolus|oesophagus/i);

  const ngOhms = await AIEngine.retrieveGroundedBundle("Explain Ohm's law", {
    level: 'O-Level',
    country: 'Nigeria',
    ...noop
  });
  assert.equal(ngOhms.hasDeterministicFallback, true);
  assert.match(ngOhms.rawResult.text, /V = I × R|Volts|Resistance/i);
  assert.doesNotMatch(ngOhms.rawResult.text, /\bZIMSEC\b|Harare|Zimbabwe/i);

  const ngSupply = await AIEngine.retrieveGroundedBundle('Explain supply and demand', {
    level: 'O-Level',
    country: 'Nigeria',
    ...noop
  });
  assert.equal(ngSupply.hasDeterministicFallback, true);
  assert.match(ngSupply.rawResult.text, /Market Equilibrium|Law of Demand/i);

  const zimBlackHole = await AIEngine.retrieveGroundedBundle('Explain black holes in astronomy', {
    level: 'O-Level',
    country: 'Zimbabwe',
    ...noop
  });
  assert.doesNotMatch(zimBlackHole.rawResult.text, /Black Stripe|National Flag/i);
});

test('African exam board profiles and non-curriculum-pack starter prompts isolate Zimbabwe terms and cover major African boards', () => {
  assert.equal(getExamBoardProfile('Zimbabwe').boardShort, 'ZIMSEC · HBC');
  assert.equal(getExamBoardProfile('South Africa').boardShort, 'CAPS · NSC / IEB');
  assert.equal(getExamBoardProfile('Nigeria').boardShort, 'WAEC · NECO · JAMB');
  assert.equal(getExamBoardProfile('Kenya').boardShort, 'KCSE · CBC');
  assert.equal(getExamBoardProfile('Ghana').boardShort, 'WASSCE · BECE');
  assert.equal(getExamBoardProfile('Zambia').boardShort, 'ECZ');
  assert.equal(getExamBoardProfile('Botswana').boardShort, 'BGCSE · JCE');

  // Zimbabwe, Botswana & South Africa use their local starter packs in ChatView
  assert.deepEqual(getUniversalStarterPrompts('Zimbabwe', 'O-Level'), []);
  assert.deepEqual(getUniversalStarterPrompts('Botswana', 'O-Level'), []);
  assert.deepEqual(getUniversalStarterPrompts('South Africa', 'O-Level'), []);

  // Non-pack countries receive board-aware starters with zero ZIMSEC/BEC/CAPS leakage
  for (const country of ['Nigeria', 'Kenya', 'Ghana', 'United Kingdom']) {
    const starters = getUniversalStarterPrompts(country, 'O-Level');
    assert.ok(starters.length >= 4, `Expected universal starters for ${country}`);
    for (const s of starters) {
      assert.equal(
        /zimsec|harare|zimbabwe|shona|chimurenga/i.test(`${s.label} ${s.prompt}`),
        false,
        `Leaked Zimbabwe term in starter for ${country}: ${s.label}`
      );
    }
  }

  const followUps = buildQuickFollowUps('Explain osmosis', 'Osmosis is water movement...');
  assert.equal(followUps.length, 3);
});

test('StorageManager isolates Notes, Flashcards, Bookmarks, Topic Mastery, and Exam Scores by country and computes streaks accurately', () => {
  localStorage.clear();

  // Save items under Zimbabwe
  const zwNote = StorageManager.saveNote({
    title: 'First Chimurenga Notes',
    content: 'Mbuya Nehanda and Sekuru Kaguvi led resistance in 1896.',
    subject: 'History',
    country: 'Zimbabwe'
  });
  const zwCard = StorageManager.saveFlashcard({
    front: 'Define osmosis',
    back: 'Movement of water from high to low water potential across a partially permeable membrane.',
    subject: 'Biology',
    country: 'Zimbabwe'
  });
  StorageManager.toggleBookmarkQuestion({
    id: 'zw_p1_q1',
    paperId: 'zw_bio_p1',
    paperCode: '4025/1',
    paperName: 'Biology Paper 1',
    subject: 'Biology',
    level: 'O-Level',
    questionNumber: 1,
    questionText: 'Which organelle performs photosynthesis?',
    correctAnswer: 'A',
    explanation: 'Chloroplast contains chlorophyll.',
    country: 'Zimbabwe'
  });
  StorageManager.toggleTopicCompleted('zw_topic_1', 'Zimbabwe');
  StorageManager.saveExamScore({
    paperId: 'zw_bio_p1',
    paperCode: '4025/1',
    paperName: 'Biology Paper 1',
    subject: 'Biology',
    level: 'O-Level',
    country: 'Zimbabwe',
    correct: 32,
    total: 40,
    percent: 80,
    grade: 'A (Distinction)',
    durationSeconds: 900,
    timed: true
  });

  // Save items under South Africa
  StorageManager.saveNote({
    title: 'SOHCAHTOA Trigonometry',
    content: 'sin theta = opposite / hypotenuse',
    subject: 'Mathematics',
    country: 'South Africa'
  });
  StorageManager.saveFlashcard({
    front: 'What is Ohm’s Law?',
    back: 'V = I × R at constant temperature.',
    subject: 'Physics',
    country: 'South Africa'
  });

  // Verify strict country isolation
  assert.equal(StorageManager.getSavedNotes('Zimbabwe').length, 1);
  assert.equal(StorageManager.getSavedNotes('South Africa').length, 1);
  assert.match(StorageManager.getSavedNotes('South Africa')[0].title, /SOHCAHTOA/);
  assert.equal(StorageManager.getFlashcards('South Africa').length, 1);
  assert.equal(StorageManager.getBookmarkedQuestions('South Africa').length, 0);
  assert.equal(StorageManager.getCompletedTopics('South Africa').length, 0);
  assert.equal(StorageManager.getExamScores('South Africa').length, 0);

  // Verify Flashcard mastery & Score lookup & Note deletion
  StorageManager.updateFlashcardMastery(zwCard.id, true);
  assert.equal(StorageManager.getFlashcards('Zimbabwe')[0].mastered, true);
  assert.equal(StorageManager.getBestScoreForPaper('zw_bio_p1', 'Zimbabwe')?.percent, 80);

  StorageManager.deleteSavedNote(zwNote.id);
  assert.equal(StorageManager.getSavedNotes('Zimbabwe').length, 0);

  // Verify streak computation (3 consecutive days including today, ignoring older broken gap)
  const streak = StorageManager.computeStreakDays(
    {
      '2026-05-01': 15,
      '2026-05-08': 20,
      '2026-05-09': 25,
      '2026-05-10': 10
    },
    '2026-05-10'
  );
  assert.equal(streak, 3);

  const zeroStreak = StorageManager.computeStreakDays(
    { '2026-05-01': 30 },
    '2026-05-10'
  );
  assert.equal(zeroStreak, 0);
});

test('Expanded universal STEM & Humanities offline topics answer cleanly without Zimbabwe leakage and forward tutorMode', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  const noop = {
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  };

  for (const [prompt, regex] of [
    ['Explain SOHCAHTOA trigonometry and Pythagoras', /SOHCAHTOA|hypotenuse|Pythagoras/i],
    ['Explain the mole concept and stoichiometry', /6\.02|Avogadro|Molar/i],
    ['Compare ionic and covalent bonding', /Ionic Bonding|Covalent Bonding/i],
    ['Compare mitosis vs meiosis', /Mitosis|Meiosis|Diploid/i],
    ['Explain inflation, GDP, and fiscal policy', /GDP|Inflation|Monetary Policy/i]
  ] as Array<[string, RegExp]>) {
    const res = await AIEngine.retrieveGroundedBundle(prompt, {
      level: 'O-Level',
      country: 'Kenya',
      ...noop
    });
    assert.equal(res.hasDeterministicFallback, true, `Expected deterministic fallback for "${prompt}"`);
    assert.match(res.rawResult.text, regex);
    assert.equal(/\bZIMSEC\b|Harare|Zimbabwe/i.test(res.rawResult.text), false);
  }

  // Test offline tutorMode decoration ('exam-points')
  let examPointsOut = '';
  await AIEngine.generate('Explain Ohm law', {
    level: 'O-Level',
    country: 'Nigeria',
    tutorMode: 'exam-points',
    onToken: (t) => {
      examPointsOut += t;
    },
    onComplete: () => {},
    onError: (e) => assert.fail(`Unexpected error: ${e}`)
  });
  assert.match(examPointsOut, /High-Yield Exam Checklist \(WAEC · NECO · JAMB\)/i);

  // Test native bridge forwarding tutorMode
  const origWindow = (globalThis as any).window;
  let capturedMode = '';
  const mockWin: any = {
    AndroidNativeAI: {
      generate: (rawPayload: string) => {
        const payload = JSON.parse(rawPayload);
        capturedMode = payload.tutorMode;
        setTimeout(() => {
          mockWin.__onNativeToken('1. Define terms clearly.');
          mockWin.__onNativeComplete('Done');
        }, 5);
      },
      stopGeneration: () => {}
    }
  };
  (globalThis as any).window = mockWin;
  try {
    await AIEngine.generate('Explain photosynthesis', {
      level: 'O-Level',
      country: 'Ghana',
      tutorMode: 'quiz-me',
      onToken: () => {},
      onComplete: () => {},
      onError: () => {}
    });
    assert.equal(capturedMode, 'quiz-me');
  } finally {
    if (origWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = origWindow;
    }
  }
});

test('StorageManager persists Search Q&As and Exam Mode Q&As across clearChat/logout until manually cleared, with strict country isolation', () => {
  localStorage.clear();

  // Save Zimbabwe search Q&As (duplicate question refreshes instead of duplicating)
  StorageManager.recordSearchQA({
    question: 'Explain photosynthesis',
    answer: 'Initial explanation',
    subject: 'Biology',
    level: 'O-Level',
    country: 'Zimbabwe'
  });
  StorageManager.recordSearchQA({
    question: 'Explain photosynthesis',
    answer: 'Updated explanation with chlorophyll & glucose',
    subject: 'Biology',
    level: 'O-Level',
    country: 'Zimbabwe'
  });
  StorageManager.recordSearchQA({
    question: 'Discuss the First Chimurenga',
    answer: '1896–1897 resistance led by Mbuya Nehanda and Sekuru Kaguvi.',
    subject: 'History',
    level: 'O-Level',
    country: 'Zimbabwe'
  });

  // Save South Africa search Q&A
  StorageManager.recordSearchQA({
    question: 'What is SOHCAHTOA?',
    answer: 'Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj',
    subject: 'Mathematics',
    level: 'O-Level',
    country: 'South Africa'
  });

  // Save Exam Mode Q&As (Paper 1 MCQ upsert + Paper 2 Theory)
  StorageManager.recordExamQA({
    paperId: 'zw_bio_p1',
    paperCode: '4025/1',
    paperName: 'Biology Paper 1',
    subject: 'Biology',
    level: 'O-Level',
    country: 'Zimbabwe',
    questionNumber: 3,
    questionText: 'Which blood vessel carries oxygenated blood from lungs to heart?',
    options: [
      { letter: 'A', text: 'Pulmonary artery' },
      { letter: 'B', text: 'Pulmonary vein' }
    ],
    userAnswer: 'A',
    correctAnswer: 'B',
    isCorrect: false,
    explanation: 'The pulmonary vein returns oxygenated blood from the lungs to the left atrium.',
    paperType: 'Paper 1'
  });
  // Retaking Q3 updates the stored record cleanly instead of duplicating
  StorageManager.recordExamQA({
    paperId: 'zw_bio_p1',
    paperCode: '4025/1',
    paperName: 'Biology Paper 1',
    subject: 'Biology',
    level: 'O-Level',
    country: 'Zimbabwe',
    questionNumber: 3,
    questionText: 'Which blood vessel carries oxygenated blood from lungs to heart?',
    options: [
      { letter: 'A', text: 'Pulmonary artery' },
      { letter: 'B', text: 'Pulmonary vein' }
    ],
    userAnswer: 'B',
    correctAnswer: 'B',
    isCorrect: true,
    explanation: 'The pulmonary vein returns oxygenated blood from the lungs to the left atrium.',
    paperType: 'Paper 1'
  });
  StorageManager.recordExamQA({
    paperId: 'zw_hist_p2',
    paperCode: '2167/2',
    paperName: 'History Paper 2',
    subject: 'History',
    level: 'O-Level',
    country: 'Zimbabwe',
    questionNumber: 1,
    questionText: 'Outline causes of the 1896 Chimurenga.',
    userAnswer: 'Hut tax, forced labour, and loss of land.',
    correctAnswer: 'Paper 2 Model Scheme',
    explanation: 'Award marks for hut tax, land alienation, cattle confiscation, and drought.',
    paperType: 'Paper 2'
  });

  assert.equal(StorageManager.getSearchHistory('Zimbabwe').length, 2);
  assert.match(StorageManager.getSearchHistory('Zimbabwe')[1].answer, /Updated explanation/i);
  assert.equal(StorageManager.getSearchHistory('South Africa').length, 1);
  assert.equal(StorageManager.getExamQAArchive('Zimbabwe').length, 2);
  assert.equal(StorageManager.getExamQAArchive('Zimbabwe').find((q) => q.questionNumber === 3)?.isCorrect, true);
  assert.equal(StorageManager.getExamQAArchive('South Africa').length, 0);

  // Clearing chat, switching sessions, and logging out MUST NOT clear Revision archives
  StorageManager.clearChat();
  StorageManager.initNewSession('student@school.co.zw', 'Zimbabwe');
  StorageManager.logout();

  assert.equal(StorageManager.getSearchHistory('Zimbabwe').length, 2);
  assert.equal(StorageManager.getSearchHistory('South Africa').length, 1);
  assert.equal(StorageManager.getExamQAArchive('Zimbabwe').length, 2);

  // Manual clear only clears the requested country
  StorageManager.clearSearchHistory('Zimbabwe');
  assert.equal(StorageManager.getSearchHistory('Zimbabwe').length, 0);
  assert.equal(StorageManager.getSearchHistory('South Africa').length, 1);

  StorageManager.clearExamQAArchive('Zimbabwe');
  assert.equal(StorageManager.getExamQAArchive('Zimbabwe').length, 0);
});

test('getCountryEducationSystem assigns authentic country-specific education levels to Albania and all world countries without Zimbabwe leakage', async () => {
  const al = getCountryEducationSystem('Albania');
  assert.match(al.tiers.Primary.label, /Grades 1\s*–\s*5/i);
  assert.match(al.tiers['O-Level'].label, /Lower Secondary.*Grades 6\s*–\s*9/i);
  assert.match(al.tiers['A-Level'].label, /Upper Secondary.*Grades 10\s*–\s*12/i);
  assert.match(al.tiers['A-Level'].boardTag, /Matura/i);
  const extractVisibleText = (sys: ReturnType<typeof getCountryEducationSystem>) =>
    JSON.stringify({
      curriculumName: sys.curriculumName,
      secondaryGroupTitle: sys.secondaryGroupTitle,
      secondaryGroupRange: sys.secondaryGroupRange,
      secondaryGroupPrompt: sys.secondaryGroupPrompt,
      tiers: Object.values(sys.tiers).map(({ canonicalLevel: _c, tierKey: _k, ...visible }) => visible)
    });

  assert.doesNotMatch(
    extractVisibleText(al),
    /O-Level \(Form 1 to 4\)|A-Level \(Form 5 to 6\)|Forms 1\s*[–-]\s*4|ZIMSEC/i
  );

  const za = getCountryEducationSystem('South Africa');
  assert.match(za.tiers['O-Level'].label, /Senior Phase.*Grades 8\s*–\s*9/i);
  assert.match(za.tiers['A-Level'].label, /FET & Matric.*Grades 10\s*–\s*12/i);

  const ng = getCountryEducationSystem('Nigeria');
  assert.match(ng.tiers['O-Level'].label, /JSS 1\s*–\s*3/i);
  assert.match(ng.tiers['A-Level'].label, /SSS 1\s*–\s*3/i);

  const us = getCountryEducationSystem('United States');
  assert.match(us.tiers.Primary.label, /Elementary.*Grades K\s*–\s*5/i);
  assert.match(us.tiers['O-Level'].label, /Middle School.*Grades 6\s*–\s*8/i);
  assert.match(us.tiers['A-Level'].label, /High School.*Grades 9\s*–\s*12/i);

  const zw = getCountryEducationSystem('Zimbabwe');
  assert.equal(zw.tiers['O-Level'].shortLabel, 'O-Level');
  assert.equal(zw.tiers['A-Level'].shortLabel, 'A-Level');

  // Verify AIEngine metadata & identity response use Albania's real levels when country=Albania
  const alIdentity = await AIEngine.retrieveGroundedBundle('What is ZEXA AI?', {
    level: 'O-Level',
    country: 'Albania',
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  });
  assert.match(alIdentity.rawResult.text, /Grades 6\s*–\s*9/i);
  assert.match(alIdentity.rawResult.text, /Grades 10\s*–\s*12/i);
  assert.doesNotMatch(alIdentity.rawResult.text, /ZIMSEC|Forms 1\s*[–-]\s*4/i);

  const alTier = getTierForContentLevel('Albania', 'O-Level');
  assert.equal(alTier.shortLabel, 'Grades 6–9');

  // Every non-Zimbabwe country in the world directory must have zero ZIMSEC / Zimbabwe canonical leakage
  for (const country of WORLD_COUNTRIES) {
    if (country.name === 'Zimbabwe') continue;
    const sys = getCountryEducationSystem(country.name);
    const serialized = extractVisibleText(sys);
    assert.doesNotMatch(
      serialized,
      /ZIMSEC|Heritage-Based Curriculum|O-Level \(Form 1 to 4\)|A-Level \(Form 5 to 6\)/i,
      `Country ${country.name} leaked Zimbabwean education level strings`
    );
  }

  for (const nonFormCountry of ['Albania', 'United States', 'South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Zambia', 'France', 'Germany', 'India', 'Australia']) {
    const serialized = extractVisibleText(getCountryEducationSystem(nonFormCountry));
    assert.doesNotMatch(
      serialized,
      /\b(O-Level|A-Level)\b|Forms 1\s*[–-]\s*4|Forms 5\s*[–-]\s*6/i,
      `Country ${nonFormCountry} should use its own local cycle names instead of Forms/O-Level/A-Level`
    );
  }
});

test('Every ZIMSEC curriculum level and subject has substantive explanations with zero stub or empty entries', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  // Key previously missing or under-indexed ZIMSEC subjects must now be present
  const primarySubs = await KnowledgeStore.getSubjects('Primary', 'Zimbabwe');
  assert.ok(primarySubs.includes('IsiNdebele'), 'Primary must expose IsiNdebele');
  assert.ok(primarySubs.includes('Shona'), 'Primary must expose Shona');

  const oLevelSubs = await KnowledgeStore.getSubjects('O-Level', 'Zimbabwe');
  for (const req of ['Heritage Studies', 'Family & Religious Studies', 'Textile Technology and Design', 'Technical & Vocational Education', 'Shona']) {
    assert.ok(oLevelSubs.includes(req), `O-Level must expose ${req}`);
  }

  const aLevelSubs = await KnowledgeStore.getSubjects('A-Level', 'Zimbabwe');
  for (const req of ['Literature in English', 'Shona', 'Sociology', 'Technical & Vocational Education']) {
    assert.ok(aLevelSubs.includes(req), `A-Level must expose ${req}`);
  }

  const litTopics = await KnowledgeStore.getTopics('A-Level', 'Literature in English', 'Zimbabwe');
  assert.ok(litTopics.length >= 35, `Expected full A-Level Literature in English syllabus (>=35 topics), got ${litTopics.length}`);

  const tertiarySubs = await KnowledgeStore.getSubjects('Tertiary', 'Zimbabwe');
  assert.equal(tertiarySubs.length, 7, 'Tertiary must expose all 7 faculties');

  // Verify every single topic across all 4 levels & all subjects hydrates cleanly with >= 120 chars of real explanation
  for (const lvl of ['Primary', 'O-Level', 'A-Level', 'Tertiary']) {
    const subs = await KnowledgeStore.getSubjects(lvl, 'Zimbabwe');
    assert.ok(subs.length > 0, `Expected subjects for ${lvl}`);

    for (const subj of subs) {
      const topics = await KnowledgeStore.getTopics(lvl, subj, 'Zimbabwe');
      assert.ok(topics.length > 0, `Expected non-empty syllabus topics for ${lvl} -> ${subj}`);

      for (const topic of topics) {
        const fullText =
          topic.assetFile && typeof topic.assetIdx === 'number'
            ? await KnowledgeStore.loadAssetFileContent(topic.assetFile, topic.assetIdx, topic.content)
            : topic.content;

        assert.ok(
          fullText.trim().length >= 120,
          `Too short explanation (${fullText.trim().length} chars) in ${lvl} -> ${subj} -> ${topic.topic} (${topic.assetFile || topic.id})`
        );
        assert.doesNotMatch(
          fullText,
          /^\*\*Name:\*\*[^\n]+$/m,
          `Found unexpanded Name-only stub in ${lvl} -> ${subj} -> ${topic.topic}`
        );
        assert.doesNotMatch(
          fullText,
          /^\d+\.\s*$/m,
          `Found empty numbered item in ${lvl} -> ${subj} -> ${topic.topic}`
        );
      }
    }
  }

  // Unpacked world accounts remain strictly isolated across all 4 levels including Tertiary
  for (const lvl of ['Primary', 'O-Level', 'A-Level', 'Tertiary']) {
    assert.deepEqual(await KnowledgeStore.getSubjects(lvl, 'Nigeria'), []);
    assert.deepEqual(await KnowledgeStore.getTopics(lvl, 'Business Administration', 'Nigeria'), []);
  }
});

test('Zimbabwe comprehensive history (pre-colonial to 2026), current affairs, senior leadership, ChiShona and IsiNdebele route accurately', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  // 1. Full chronology query covers ALL 5 eras (not hijacked by 'today')
  const fullHist = await AIEngine.retrieveGroundedBundle(
    'Tell me the full history of Zimbabwe from pre-colonial times to today',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(fullHist.rawResult.text, /Great Zimbabwe/);
  assert.match(fullHist.rawResult.text, /Rudd Concession/);
  assert.match(fullHist.rawResult.text, /Second Chimurenga|1966/);
  assert.match(fullHist.rawResult.text, /Unity Accord/);
  assert.match(fullHist.rawResult.text, /NDS2|Vision 2030|ZiG/);

  // 2. Post-independence 1980 to today covers 1980–2026 rather than stopping at 2000
  const postIndep = await AIEngine.retrieveGroundedBundle(
    'What happened in post-independence Zimbabwe from 1980 to today?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(postIndep.rawResult.text, /Gukurahundi|Unity Accord/);
  assert.match(postIndep.rawResult.text, /ESAP/);
  assert.match(postIndep.rawResult.text, /2013 Constitution/);
  assert.match(postIndep.rawResult.text, /Operation Restore Legacy/);
  assert.match(postIndep.rawResult.text, /NDS2|Trabablas|ZiG/);

  // 3. Senior constitutional office-holders & RBZ Governor + Finance Minister + Chief Justice
  const seniorLeaders = await AIEngine.retrieveGroundedBundle(
    'Who is the Chief Justice of Zimbabwe and Finance Minister?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(seniorLeaders.rawResult.text, /Luke Malaba/);
  assert.match(seniorLeaders.rawResult.text, /Mthuli Ncube/);
  assert.match(seniorLeaders.rawResult.text, /John Mushayavanhu/);

  const zigRes = await AIEngine.retrieveGroundedBundle(
    'Who is the current Governor of the Reserve Bank of Zimbabwe and what is ZiG?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(zigRes.rawResult.text, /John Mushayavanhu/);
  assert.match(zigRes.rawResult.text, /5 April 2024/);

  // 4. Present-day 2024–2026 milestones & liberation commanders
  const modernRes = await AIEngine.retrieveGroundedBundle(
    'What is happening in Zimbabwe today (2024 to 2026 current affairs)?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(modernRes.rawResult.text, /Kirsty Coventry/);
  assert.match(modernRes.rawResult.text, /44th SADC Summit/);
  assert.match(modernRes.rawResult.text, /Trabablas/);
  assert.match(modernRes.rawResult.text, /NDS2/);

  const zipraCmd = await AIEngine.retrieveGroundedBundle(
    'Who were Alfred Nikita Mangena and Lookout Masuku?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(zipraCmd.rawResult.text, /ZIPRA/);
  assert.match(zipraCmd.rawResult.text, /Lookout/);

  const morganRes = await AIEngine.retrieveGroundedBundle(
    'Who was Morgan Tsvangirai?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(morganRes.rawResult.text, /Prime Minister/);
  assert.match(morganRes.rawResult.text, /2008 GPA|GNU/);

  // 5. 2022 ZimStat Census provincial ordering check (Manicaland > Mashonaland West > Midlands)
  const censusRes = await AIEngine.retrieveGroundedBundle(
    'What is the current population of Zimbabwe from the 2022 census?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  const idxManica = censusRes.rawResult.text.indexOf('Manicaland:');
  const idxMidlands = censusRes.rawResult.text.indexOf('Midlands:');
  assert.ok(idxManica > 0 && idxMidlands > idxManica, 'Manicaland (2.04M) must precede Midlands (1.81M) in descending ranking');

  // 6. ChiShona ("Ndiyani") & IsiNdebele ("Ngubani") current leadership queries
  const shonaLeader = await AIEngine.retrieveGroundedBundle(
    'Ndiyani mutungamiri weZimbabwe parizvino?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(shonaLeader.rawResult.text, /Emmerson Dambudzo Mnangagwa/);
  assert.match(shonaLeader.rawResult.text, /Constantino/);

  const ndebeleLeader = await AIEngine.retrieveGroundedBundle(
    'Ngubani umongameli weZimbabwe khathesi?',
    { level: 'O-Level', country: 'Zimbabwe' }
  );
  assert.match(ndebeleLeader.rawResult.text, /Emmerson Dambudzo Mnangagwa/);
  assert.match(ndebeleLeader.rawResult.text, /Vision 2030|ZiG/);

  // 7. Strict country isolation: IsiNdebele / ChiShona Zimbabwe handlers do NOT fire for South Africa
  const nonZimNdebele = await AIEngine.retrieveGroundedBundle(
    'Ngubani umongameli weZimbabwe khathesi?',
    { level: 'Secondary', country: 'South Africa' }
  );
  assert.doesNotMatch(nonZimNdebele.rawResult.sourceTag, /ZIMSEC|Zimbabwe Encyclopedia/i);
});

test('On-device neural engine NEVER overrides answers present in JSON files or Zimbabwe RAG, while handling open-ended non-JSON prompts', async () => {
  localStorage.clear();
  await KnowledgeStore.load();
  StorageManager.initNewSession('learner@zimsec.co.zw', 'Zimbabwe');

  const origWindow = (globalThis as any).window;
  let nativeInvokeCount = 0;
  const mockWin: any = {
    AndroidNativeAI: {
      isReady: () => true,
      generate: () => {
        nativeInvokeCount++;
        setTimeout(() => {
          mockWin.__onNativeToken('Astronauts floated over the red Martian canyon.');
          mockWin.__onNativeComplete('Total: 0.2s • ZEXA AI');
        }, 5);
      },
      stopGeneration: () => {}
    }
  };
  (globalThis as any).window = mockWin;

  try {
    assert.equal(ZexaNeuralEngine.isReady(), true);

    const ragCoveredQuestions = [
      'Tell me the full history of Zimbabwe from pre-colonial times to today',
      'What is happening in Zimbabwe today (2024 to 2026 current affairs)?',
      'Explain the Contact Process in O-Level Chemistry',
      'State the double entry rule in Accounting',
      'Explain the causes of the First World War in History 9155',
      'Explain osmosis in plant cells'
    ];

    for (const q of ragCoveredQuestions) {
      let out = '';
      await AIEngine.generate(q, {
        level: 'O-Level',
        country: 'Zimbabwe',
        onToken: (t) => {
          out += t;
        },
        onComplete: () => {},
        onError: (e) => assert.fail(`Unexpected error for "${q}": ${e}`)
      });
      assert.equal(nativeInvokeCount, 0, `Neural engine must NOT override JSON/RAG answer for: "${q}"`);
      assert.ok(out.trim().length > 80, `Expected rich RAG answer for: "${q}"`);
    }

    // Open-ended prompt NOT in JSON files should still use the connected neural engine
    let openOut = '';
    await AIEngine.generate('Write a short creative story about an astronaut exploring Mars', {
      level: 'O-Level',
      country: 'Zimbabwe',
      onToken: (t) => {
        openOut += t;
      },
      onComplete: () => {},
      onError: (e) => assert.fail(`Unexpected error on open prompt: ${e}`)
    });
    assert.equal(nativeInvokeCount, 1, 'Open-ended non-JSON prompt should invoke on-device neural engine');
    assert.match(openOut, /Martian canyon/i);
  } finally {
    if (origWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = origWindow;
    }
  }
});

test('Botswana local curriculum (PSLE, JCE, BGCSE, Tertiary), Encyclopedia, Setswana, and BEC Exams work offline with strict isolation', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  // 1. Botswana Subjects & Substantive Content across all 4 Education Tiers
  const psleSubjects = await KnowledgeStore.getSubjects('Primary', 'Botswana');
  assert.deepEqual(psleSubjects, ['English', 'Setswana', 'Mathematics', 'Science', 'Agriculture', 'Social Studies', 'CAPA']);

  const jceSubjects = await KnowledgeStore.getSubjects('O-Level', 'Botswana');
  for (const req of ['Setswana', 'Social Studies', 'Moral Education', 'Integrated Science', 'Design & Technology', 'Commerce & Accounting']) {
    assert.ok(jceSubjects.includes(req), `Botswana JCE must include ${req}`);
  }
  assert.equal(jceSubjects.includes('Shona'), false, 'Botswana JCE must never expose ChiShona');
  assert.equal(jceSubjects.includes('Heritage Studies'), false, 'Botswana JCE must never expose Zimbabwe Heritage Studies');

  const bgcseSubjects = await KnowledgeStore.getSubjects('A-Level', 'Botswana');
  for (const req of ['Development Studies', 'Setswana', 'Double Science', 'Geography', 'History']) {
    assert.ok(bgcseSubjects.includes(req), `Botswana BGCSE must include ${req}`);
  }

  for (const lvl of ['Primary', 'O-Level', 'A-Level', 'Tertiary']) {
    const subs = await KnowledgeStore.getSubjects(lvl, 'Botswana');
    for (const subj of subs) {
      const topics = await KnowledgeStore.getTopics(lvl, subj, 'Botswana');
      assert.ok(topics.length > 0, `Botswana ${lvl} -> ${subj} must have >= 1 substantive topic`);
      for (const t of topics) {
        const text = `${t.topic} ${t.source} ${t.content}`;
        assert.equal(/\bZIMSEC\b/i.test(text), false, `ZIMSEC leaked into Botswana ${lvl} -> ${subj} (${t.id})`);
        assert.equal(String(t.id).startsWith('zw_'), false, `Zimbabwe encyclopedia entry leaked into Botswana (${t.id})`);
      }
    }
  }

  // Mutual isolation checks: Zimbabwe, Botswana, South Africa, and unpacked world countries stay strictly separated
  const zimSearchForBw = await KnowledgeStore.searchScored('Three Dikgosi Duma Boko', 'O-Level', 'Zimbabwe');
  assert.equal(zimSearchForBw.results.some((r) => String(r.chunk.id).startsWith('bw_')), false);
  const bwSearchForZim = await KnowledgeStore.searchScored('First Chimurenga Nehanda Mnangagwa', 'O-Level', 'Botswana');
  assert.equal(bwSearchForZim.results.some((r) => String(r.chunk.id).startsWith('zw_')), false);
  const alSearchForBw = await KnowledgeStore.searchScored('Okavango Delta Debswana', 'O-Level', 'Albania');
  assert.deepEqual(alSearchForBw.results, []);

  // 2. Botswana National Encyclopedia, Current Leadership (Duma Boko), History, Geography, Economy & Setswana in AIEngine
  const bwPresidents = await AIEngine.retrieveGroundedBundle('Who is the current President of Botswana and list all former Presidents?', {
    level: 'O-Level',
    country: 'Botswana',
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  });
  assert.equal(bwPresidents.lockToVerifiedTruth, true);
  assert.match(bwPresidents.rawResult.text, /Duma Gideon Boko/);
  assert.match(bwPresidents.rawResult.text, /Ndaba Gaolathe/);
  assert.match(bwPresidents.rawResult.text, /Sir Seretse Khama/);
  assert.match(bwPresidents.rawResult.text, /Ketumile.*Masire/);
  assert.match(bwPresidents.rawResult.text, /Festus.*Mogae/);
  assert.match(bwPresidents.rawResult.text, /Ian Khama/);
  assert.match(bwPresidents.rawResult.text, /Mokgweetsi.*Masisi/);

  const bwDikgosi = await AIEngine.retrieveGroundedBundle('Why did the Three Dikgosi travel to London in 1895?', {
    level: 'O-Level',
    country: 'Botswana',
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  });
  assert.equal(bwDikgosi.lockToVerifiedTruth, true);
  assert.match(bwDikgosi.rawResult.text, /Khama III/);
  assert.match(bwDikgosi.rawResult.text, /Sebele I/);
  assert.match(bwDikgosi.rawResult.text, /Bathoen I/);
  assert.match(bwDikgosi.rawResult.text, /British South Africa Company|BSAC/);

  const bwDevStudies = await AIEngine.retrieveGroundedBundle('Explain Botswana Vision 2036 diamond diversification and HDI vs GNP', {
    level: 'A-Level',
    country: 'Botswana',
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  });
  assert.equal(bwDevStudies.lockToVerifiedTruth, true);
  assert.match(bwDevStudies.rawResult.text, /Vision 2036|Human Development Index|HDI/i);

  const bwOkavango = await AIEngine.retrieveGroundedBundle('Why does the Okavango Delta flood in winter?', {
    level: 'A-Level',
    country: 'Botswana',
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  });
  assert.equal(bwOkavango.lockToVerifiedTruth, true);
  assert.match(bwOkavango.rawResult.text, /Angolan Highlands|Okavango/i);

  const bwSetswana = await AIEngine.retrieveGroundedBundle('Tlhalosa seane: Motho ke motho ka batho', {
    level: 'Primary',
    country: 'Botswana',
    onToken: () => {},
    onComplete: () => {},
    onError: () => {}
  });
  assert.equal(bwSetswana.lockToVerifiedTruth, true);
  assert.match(bwSetswana.rawResult.text, /Botho/i);

  // 3. ExamStore Botswana Papers load cleanly offline
  const bwPslePaper = await ExamStore.loadPaperDetails('bw_psle_social_studies_p1');
  assert.ok(bwPslePaper && bwPslePaper.questions.length >= 4);
  assert.equal(bwPslePaper.questions[0].correctAnswer, 'B');

  // 4. NotificationManager Botswana uses Gaborone / BEC (zero ZIMSEC/Harare)
  const bwNotif = NotificationManager.buildNotificationPayload('6:00 AM', 'Botswana');
  assert.match(`${bwNotif.title} ${bwNotif.body}`, /BEC|PSLE|JCE|BGCSE|Gaborone/i);
  assert.equal(/zimsec|harare/i.test(`${bwNotif.title} ${bwNotif.body}`), false);

  // 5. Verify Rag Truth Lock prevents neural engine override on Botswana local answers
  const origWindow = (globalThis as any).window;
  let bwNativeCalls = 0;
  const mockWin: any = {
    AndroidNativeAI: {
      isReady: () => true,
      generate: () => {
        bwNativeCalls++;
        setTimeout(() => {
          mockWin.__onNativeToken('Random neural guess');
          mockWin.__onNativeComplete('Done');
        }, 5);
      },
      stopGeneration: () => {}
    }
  };
  (globalThis as any).window = mockWin;
  try {
    let presidentOut = '';
    await AIEngine.generate('Who is the current President of Botswana?', {
      level: 'O-Level',
      country: 'Botswana',
      onToken: (t) => {
        presidentOut += t;
      },
      onComplete: () => {},
      onError: (e) => assert.fail(e)
    });
    assert.equal(bwNativeCalls, 0, 'Neural engine must NOT override verified Botswana Encyclopedia facts');
    assert.match(presidentOut, /Duma Gideon Boko/);
  } finally {
    if (origWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = origWindow;
    }
  }
});

test('South Africa local curriculum (GET, Senior Phase, FET NSC Matric, Tertiary), Encyclopedia, isiZulu/Afrikaans, and CAPS/NSC Exams work offline with strict 3-way isolation', async () => {
  localStorage.clear();
  await KnowledgeStore.load();

  // 1. South Africa Subjects & Substantive Content across all 4 Education Tiers
  const getPrimarySubjects = await KnowledgeStore.getSubjects('Primary', 'South Africa');
  for (const req of ['English', 'Mathematics', 'Natural Sciences & Technology', 'Social Sciences', 'Economic & Management Sciences', 'Languages (isiZulu & Afrikaans)', 'Physical Edu & Arts']) {
    assert.ok(getPrimarySubjects.includes(req), `South Africa GET Primary must include ${req}`);
  }

  const seniorSubjects = await KnowledgeStore.getSubjects('O-Level', 'South Africa');
  for (const req of ['Mathematics', 'Natural Sciences', 'Social Sciences', 'Economic & Management Sciences', 'Technology', 'Life Orientation']) {
    assert.ok(seniorSubjects.includes(req), `South Africa Senior Phase must include ${req}`);
  }
  assert.equal(seniorSubjects.includes('Shona'), false, 'South Africa must never expose ChiShona');
  assert.equal(seniorSubjects.includes('Heritage Studies'), false, 'South Africa must never expose Zimbabwe Heritage Studies');
  assert.equal(seniorSubjects.includes('Development Studies'), false, 'South Africa must never expose Botswana Development Studies');

  const nscSubjects = await KnowledgeStore.getSubjects('A-Level', 'South Africa');
  for (const req of ['Physical Sciences', 'Life Sciences', 'Mathematics', 'Mathematical Literacy', 'Accounting', 'History', 'Geography', 'Life Orientation']) {
    assert.ok(nscSubjects.includes(req), `South Africa FET & NSC Matric must include ${req}`);
  }

  for (const lvl of ['Primary', 'O-Level', 'A-Level', 'Tertiary']) {
    const subs = await KnowledgeStore.getSubjects(lvl, 'South Africa');
    assert.ok(subs.length > 0, `South Africa ${lvl} must have subjects`);
    for (const subj of subs) {
      const topics = await KnowledgeStore.getTopics(lvl, subj, 'South Africa');
      assert.ok(topics.length > 0, `South Africa ${lvl} -> ${subj} must have >= 1 substantive topic`);
      for (const t of topics) {
        const text = `${t.topic} ${t.source} ${t.content}`;
        assert.equal(/\bZIMSEC\b/i.test(text), false, `ZIMSEC leaked into South Africa ${lvl} -> ${subj} (${t.id})`);
        assert.equal(String(t.id).startsWith('zw_'), false, `Zimbabwe entry leaked into South Africa (${t.id})`);
        assert.equal(String(t.id).startsWith('bw_'), false, `Botswana entry leaked into South Africa (${t.id})`);
      }
    }
  }

  // Mutual 3-way isolation checks
  const zimSearchForZa = await KnowledgeStore.searchScored('Cyril Ramaphosa Mapungubwe Soweto Uprising', 'A-Level', 'Zimbabwe');
  assert.equal(zimSearchForZa.results.some((r) => String(r.chunk.id).startsWith('za_')), false);
  const bwSearchForZa = await KnowledgeStore.searchScored('Cyril Ramaphosa CODESA Mathematical Literacy', 'A-Level', 'Botswana');
  assert.equal(bwSearchForZa.results.some((r) => String(r.chunk.id).startsWith('za_')), false);
  const zaSearchForZim = await KnowledgeStore.searchScored('First Chimurenga Mbuya Nehanda Pfumvudza', 'O-Level', 'South Africa');
  assert.equal(zaSearchForZim.results.some((r) => String(r.chunk.id).startsWith('zw_')), false);
  const zaSearchForBw = await KnowledgeStore.searchScored('Three Dikgosi Duma Boko Okavango', 'O-Level', 'South Africa');
  assert.equal(zaSearchForBw.results.some((r) => String(r.chunk.id).startsWith('bw_')), false);
  const alSearchForZa = await KnowledgeStore.searchScored('Cyril Ramaphosa Mapungubwe NSC Matric', 'A-Level', 'Albania');
  assert.deepEqual(alSearchForZa.results, []);

  // 2. South Africa Encyclopedia, Leadership, History, Geography, Languages, CAPS/NSC Pass Rules & Sciences
  const noop = { onToken: () => {}, onComplete: () => {}, onError: () => {} };

  const zaPresidents = await AIEngine.retrieveGroundedBundle('Who is the current President of South Africa and list all post-1994 Presidents?', {
    level: 'A-Level',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaPresidents.lockToVerifiedTruth, true);
  assert.match(zaPresidents.rawResult.text, /Cyril Ramaphosa/);
  assert.match(zaPresidents.rawResult.text, /Paul Mashatile/);
  assert.match(zaPresidents.rawResult.text, /Government of National Unity|GNU/);
  assert.match(zaPresidents.rawResult.text, /Nelson.*Mandela/);
  assert.match(zaPresidents.rawResult.text, /Thabo.*Mbeki/);
  assert.match(zaPresidents.rawResult.text, /Kgalema.*Motlanthe/);
  assert.match(zaPresidents.rawResult.text, /Jacob.*Zuma/);

  const zaPreCol = await AIEngine.retrieveGroundedBundle('Explain the Kingdom of Mapungubwe, the Mineral Revolution (1867–1886), and the 1913 Natives Land Act', {
    level: 'O-Level',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaPreCol.lockToVerifiedTruth, true);
  assert.match(zaPreCol.rawResult.text, /Mapungubwe/);
  assert.match(zaPreCol.rawResult.text, /1867|1886/);
  assert.match(zaPreCol.rawResult.text, /1913/);

  const zaSoweto = await AIEngine.retrieveGroundedBundle('Summarize the 1976 Soweto Uprising, CODESA, and the TRC', {
    level: 'A-Level',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaSoweto.lockToVerifiedTruth, true);
  assert.match(zaSoweto.rawResult.text, /16 June 1976|Hector Pieterson/);
  assert.match(zaSoweto.rawResult.text, /CODESA/);
  assert.match(zaSoweto.rawResult.text, /Truth and Reconciliation|TRC/);

  const zaProvinces = await AIEngine.retrieveGroundedBundle('List all 9 provinces of South Africa and South Africa’s 3 national capitals', {
    level: 'Primary',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaProvinces.lockToVerifiedTruth, true);
  assert.match(zaProvinces.rawResult.text, /Gauteng/);
  assert.match(zaProvinces.rawResult.text, /Western Cape/);
  assert.match(zaProvinces.rawResult.text, /KwaZulu-Natal/);

  const zaNscRules = await AIEngine.retrieveGroundedBundle('Explain the DBE NSC Matric Bachelor’s, Diploma, and Higher Certificate pass rules', {
    level: 'A-Level',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaNscRules.lockToVerifiedTruth, true);
  assert.match(zaNscRules.rawResult.text, /Bachelor/);
  assert.match(zaNscRules.rawResult.text, /Higher Certificate/);

  const zaZulu = await AIEngine.retrieveGroundedBundle('Umuntu ngumuntu ngabantu', {
    level: 'Primary',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaZulu.lockToVerifiedTruth, true);
  assert.match(zaZulu.rawResult.text, /Ubuntu|isiZulu/i);

  const zaAfrikaans = await AIEngine.retrieveGroundedBundle('Verlede tyd en STOMPI', {
    level: 'O-Level',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaAfrikaans.lockToVerifiedTruth, true);
  assert.match(zaAfrikaans.rawResult.text, /STOMPI/);

  const zaDoppler = await AIEngine.retrieveGroundedBundle('Explain the Doppler Effect formula and applications in Grade 12 Physical Sciences', {
    level: 'A-Level',
    country: 'South Africa',
    ...noop
  });
  assert.equal(zaDoppler.lockToVerifiedTruth, true);
  assert.match(zaDoppler.rawResult.text, /Doppler/i);

  // 3. ExamStore South Africa Papers load cleanly offline
  const zaNscPhys = await ExamStore.loadPaperDetails('za_nsc_physical_sciences_p1');
  assert.ok(zaNscPhys && zaNscPhys.questions.length >= 2);
  const zaGetSoc = await ExamStore.loadPaperDetails('za_get_social_sciences_p1');
  assert.ok(zaGetSoc && zaGetSoc.questions.length >= 2);

  // 4. NotificationManager South Africa uses Johannesburg SAST / CAPS / NSC (zero ZIMSEC/BEC)
  const zaNotif = NotificationManager.buildNotificationPayload('6:00 AM', 'South Africa');
  assert.match(`${zaNotif.title} ${zaNotif.body}`, /CAPS|NSC|Matric|GET|Johannesburg|SAST/i);
  assert.equal(/zimsec|harare|\bbec\b|gaborone/i.test(`${zaNotif.title} ${zaNotif.body}`), false);
  const saClock = NotificationManager.getHarareClockInfo('South Africa');
  assert.match(saClock.harareTimeString, /SAST \(Johannesburg\)/);

  // 5. Verify RAG Truth Lock prevents neural engine override on South Africa verified facts
  const origWindow = (globalThis as any).window;
  let zaNativeCalls = 0;
  const mockWin: any = {
    AndroidNativeAI: {
      isReady: () => true,
      generate: () => {
        zaNativeCalls++;
        setTimeout(() => {
          mockWin.__onNativeToken('Random neural guess');
          mockWin.__onNativeComplete('Done');
        }, 5);
      },
      stopGeneration: () => {}
    }
  };
  (globalThis as any).window = mockWin;
  try {
    let presidentOut = '';
    await AIEngine.generate('Who is the current President of South Africa?', {
      level: 'A-Level',
      country: 'South Africa',
      onToken: (t) => {
        presidentOut += t;
      },
      onComplete: () => {},
      onError: (e) => assert.fail(e)
    });
    assert.equal(zaNativeCalls, 0, 'Neural engine must NOT override verified South Africa Encyclopedia facts');
    assert.match(presidentOut, /Cyril Ramaphosa/);
  } finally {
    if (origWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = origWindow;
    }
  }
});





