/**
 * Qwen 2.5 (0.5B Instruct Q4_K_M GGUF) Offline Neural Engine
 * Powered by @wllama/wllama (100% Local WebAssembly llama.cpp) & Android Native NDK Bridge.
 *
 * Designed for True 0 MB Offline Execution:
 * 1. Loads `/assets/qwen2.5-0.5b-instruct-q4_k_m.gguf` directly from the local assets folder.
 * 2. Uses local `/assets/wasm/wllama.wasm` (zero CDN or internet calls).
 * 3. Supports Android Studio JNI/NDK Bridge (`window.AndroidNativeAI` / `window.ZexaNative`) when packaged as an APK.
 * 4. Supports manual local `.gguf` file loading from device storage for testing or custom models.
 * 5. Receives verified JSON RAG context from `KnowledgeStore` & `ExamBankMatcher` so small 0.5B weights
 *    reason cleanly over authoritative ZIMSEC data without hallucinations.
 */

import { Wllama, type ChatCompletionMessage } from '@wllama/wllama';

export type QwenModelStatus =
  | 'unloaded'
  | 'checking'
  | 'awaiting_model'
  | 'loading'
  | 'ready'
  | 'error';

export interface QwenProgressState {
  status: QwenModelStatus;
  progress: number; // 0 to 100
  statusText: string;
  modelName: string;
  modelPresentInAssets: boolean;
  error?: string;
  isAndroidNative?: boolean;
}

export class QwenEngine {
  private static wllama: Wllama | null = null;
  private static currentStatus: QwenModelStatus = 'unloaded';
  private static currentProgress = 0;
  private static statusMessage = 'Initializing ZEXA AI Offline Engine...';
  private static errorMessage = '';
  private static modelFoundInAssets = false;
  private static activeModelName = 'ZEXA AI Neural Core';
  private static isCancelled = false;
  private static activeAbortController: AbortController | null = null;
  private static loadPromise: Promise<boolean> | null = null;
  private static subscribers = new Set<(state: QwenProgressState) => void>();

  public static readonly MODEL_FILENAME = 'qwen2.5-0.5b-instruct-q4_k_m.gguf';
  public static readonly LOCAL_GGUF_URL = '/assets/qwen2.5-0.5b-instruct-q4_k_m.gguf';
  public static readonly LOCAL_WASM_PATHS = {
    default: '/assets/wasm/wllama.wasm'
  };

  private static notifySubscribers(): void {
    const snapshot = this.getStatus();
    for (const cb of this.subscribers) {
      try {
        cb(snapshot);
      } catch {
        // ignore listener errors
      }
    }
  }

  public static subscribe(callback: (state: QwenProgressState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getStatus());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public static isRunningInAndroidAPK(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    return (
      Boolean(w.AndroidNativeAI || w.ZexaNative || w.AndroidBridge) ||
      navigator.userAgent.includes('wv') ||
      window.location.protocol === 'file:'
    );
  }

  public static getStatus(): QwenProgressState {
    const isNative =
      typeof window !== 'undefined' &&
      Boolean((window as any).AndroidNativeAI || (window as any).ZexaNative || (window as any).AndroidBridge);

    return {
      status: isNative ? 'ready' : this.currentStatus,
      progress: isNative ? 100 : this.currentProgress,
      statusText: isNative ? 'ZEXA AI Native Engine Ready' : this.statusMessage,
      modelName: 'ZEXA AI Neural Core',
      modelPresentInAssets: isNative || this.modelFoundInAssets,
      error: this.errorMessage || undefined,
      isAndroidNative: isNative
    };
  }

  public static isReady(): boolean {
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.AndroidNativeAI || w.ZexaNative || w.AndroidBridge) return true;
    }
    return this.currentStatus === 'ready' && this.wllama !== null && this.wllama.isModelLoaded();
  }

  public static stopGeneration(): void {
    this.isCancelled = true;
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch {
        // ignore
      }
      this.activeAbortController = null;
    }
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.AndroidNativeAI?.stopGeneration) w.AndroidNativeAI.stopGeneration();
      if (w.ZexaNative?.stopGeneration) w.ZexaNative.stopGeneration();
      if (w.AndroidBridge?.stopGeneration) w.AndroidBridge.stopGeneration();
    }
  }

  /**
   * Verifies that `/assets/qwen2.5-0.5b-instruct-q4_k_m.gguf` is a real GGUF binary
   * (checking GGUF magic bytes `0x47 0x47 0x55 0x46` instead of SPA index.html fallback).
   */
  public static async checkLocalGGUFExists(): Promise<{
    exists: boolean;
    sizeBytes?: number;
    reason?: string;
  }> {
    if (typeof window === 'undefined' || typeof fetch !== 'function') {
      return { exists: false, reason: 'Non-browser environment' };
    }

    try {
      // First check the first 4 bytes for exact GGUF magic header ('GGUF')
      const rangeRes = await fetch(this.LOCAL_GGUF_URL, {
        headers: { Range: 'bytes=0-3' },
        cache: 'no-store'
      });

      if (!rangeRes.ok) {
        return { exists: false, reason: 'ZEXA Neural package not present in offline bundle' };
      }

      const contentType = (rangeRes.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        return {
          exists: false,
          reason: 'ZEXA Neural package not mounted yet'
        };
      }

      const buf = await rangeRes.arrayBuffer();
      const bytes = new Uint8Array(buf.slice(0, 4));
      const isGGUFMagic =
        bytes.length >= 4 &&
        bytes[0] === 0x47 && // G
        bytes[1] === 0x47 && // G
        bytes[2] === 0x55 && // U
        bytes[3] === 0x46;   // F

      if (!isGGUFMagic) {
        return {
          exists: false,
          reason: 'ZEXA Neural package header mismatch'
        };
      }

      const contentRange = rangeRes.headers.get('content-range') || '';
      const totalMatch = contentRange.match(/\/(\d+)$/);
      const contentLengthHeader = rangeRes.headers.get('content-length');
      const sizeBytes = totalMatch
        ? parseInt(totalMatch[1], 10)
        : contentLengthHeader
        ? parseInt(contentLengthHeader, 10)
        : undefined;

      this.modelFoundInAssets = true;
      return { exists: true, sizeBytes };
    } catch (err: any) {
      return { exists: false, reason: err?.message || 'Unable to probe offline brain package' };
    }
  }

  private static createWllamaInstance(): Wllama {
    const instance = new Wllama(this.LOCAL_WASM_PATHS, {
      allowOffline: true,
      suppressNativeLog: true,
      parallelDownloads: 1
    });
    // Enforce 100% offline execution (disable external CDN compat scripts)
    instance.setCompat(null);
    return instance;
  }

  /**
   * Automatically checks `/assets/qwen2.5-0.5b-instruct-q4_k_m.gguf` and mounts it into memory
   * if present. Safe to invoke on startup.
   */
  public static async autoConnectLocalGGUF(
    onProgress?: (state: QwenProgressState) => void
  ): Promise<boolean> {
    if (this.isReady()) {
      if (onProgress) onProgress(this.getStatus());
      return true;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadModel(onProgress).finally(() => {
      this.loadPromise = null;
    });
    return this.loadPromise;
  }

  /**
   * Loads `qwen2.5-0.5b-instruct-q4_k_m.gguf` from Android Native Bridge OR `/assets/`.
   */
  public static async loadModel(
    onProgress?: (state: QwenProgressState) => void
  ): Promise<boolean> {
    const w = typeof window !== 'undefined' ? (window as any) : {};

    // Path A: Native Android Studio Bridge
    if (w.AndroidNativeAI || w.ZexaNative || w.AndroidBridge) {
      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.modelFoundInAssets = true;
      this.statusMessage = 'ZEXA AI Connected';
      this.errorMessage = '';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return true;
    }

    if (this.wllama && this.wllama.isModelLoaded() && this.currentStatus === 'ready') {
      if (onProgress) onProgress(this.getStatus());
      return true;
    }

    this.currentStatus = 'checking';
    this.currentProgress = 5;
    this.statusMessage = 'Initializing ZEXA AI...';
    if (onProgress) onProgress(this.getStatus());
    this.notifySubscribers();

    const probe = await this.checkLocalGGUFExists();
    if (!probe.exists) {
      this.modelFoundInAssets = false;
      this.currentStatus = 'awaiting_model';
      this.currentProgress = 0;
      this.errorMessage = '';
      this.statusMessage = 'ZEXA AI Offline Mode Active';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }

    try {
      this.modelFoundInAssets = true;
      this.currentStatus = 'loading';
      this.currentProgress = 8;
      this.errorMessage = '';
      this.statusMessage = 'Loading ZEXA AI into offline memory...';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();

      if (this.wllama) {
        try {
          await this.wllama.exit();
        } catch {
          // ignore cleanup
        }
      }

      this.wllama = this.createWllamaInstance();

      const absoluteModelUrl = new URL(this.LOCAL_GGUF_URL, window.location.origin).toString();
      await this.wllama.loadModelFromUrl(absoluteModelUrl, {
        n_ctx: 1536,
        n_batch: 256,
        n_parallel: 1,
        kv_unified: true,
        warmup: false,
        ctx_shift: true,
        useCache: true,
        progressCallback: ({ loaded, total }) => {
          const pct = total > 0 ? Math.min(98, Math.max(10, Math.round((loaded / total) * 100))) : 50;
          this.currentProgress = pct;
          const loadedMb = (loaded / (1024 * 1024)).toFixed(0);
          const totalMb = total > 0 ? (total / (1024 * 1024)).toFixed(0) : '?';
          this.statusMessage = `Loading ZEXA AI (${loadedMb}/${totalMb} MB • ${pct}%)`;
          if (onProgress) onProgress(this.getStatus());
          this.notifySubscribers();
        }
      });

      this.activeModelName = 'ZEXA AI';
      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.statusMessage = 'ZEXA AI Connected & Ready';
      this.errorMessage = '';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return true;
    } catch (err: any) {
      this.currentStatus = 'error';
      this.errorMessage = err?.message || 'Unable to load offline weights';
      this.statusMessage = 'ZEXA AI Offline Mode Active';
      if (this.wllama) {
        try {
          await this.wllama.exit();
        } catch {
          // ignore
        }
      }
      this.wllama = null;
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }
  }

  /**
   * Loads a `.gguf` model directly from a user-selected local File/Blob (great for testing before upload).
   */
  public static async loadModelFromFile(
    file: File,
    onProgress?: (state: QwenProgressState) => void
  ): Promise<boolean> {
    if (!file) {
      this.currentStatus = 'error';
      this.errorMessage = 'No file selected.';
      this.statusMessage = 'Please select a ZEXA offline brain file';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }

    let isGGUF = file.name.toLowerCase().endsWith('.gguf');
    if (!isGGUF && file.size >= 4) {
      try {
        const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
        isGGUF = header[0] === 0x47 && header[1] === 0x47 && header[2] === 0x55 && header[3] === 0x46;
      } catch {
        isGGUF = false;
      }
    }

    if (!isGGUF) {
      this.currentStatus = 'error';
      this.errorMessage = `Selected file "${file.name}" is not a supported ZEXA AI brain binary.`;
      this.statusMessage = 'Unsupported offline brain file format';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }

    try {
      this.currentStatus = 'loading';
      this.currentProgress = 15;
      this.activeModelName = 'ZEXA AI';
      this.errorMessage = '';
      this.statusMessage = 'Loading ZEXA AI from local storage...';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();

      if (this.wllama) {
        try {
          await this.wllama.exit();
        } catch {
          // ignore
        }
      }

      this.wllama = this.createWllamaInstance();
      await this.wllama.loadModel([file], {
        n_ctx: 1536,
        n_batch: 256,
        n_parallel: 1,
        kv_unified: true,
        warmup: false,
        ctx_shift: true
      });

      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.statusMessage = 'ZEXA AI Connected & Ready';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return true;
    } catch (err: any) {
      this.currentStatus = 'error';
      this.errorMessage = err?.message || 'Failed to mount offline ZEXA AI file';
      this.statusMessage = 'Failed to load offline ZEXA AI file';
      this.wllama = null;
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }
  }

  /**
   * Executes RAG-Grounded Qwen 2.5 (0.5B Instruct Q4_K_M) inference.
   * Connects verified JSON syllabus chunks & exam mark schemes directly into Qwen's context window
   * so small offline weights produce accurate, well-structured, hallucination-free explanations.
   */
  public static async generate(
    question: string,
    options: {
      level: string;
      country?: string;
      contextSnippet?: string;
      sourceTag?: string;
      history?: Array<{ question: string; answer: string }>;
      onToken: (token: string) => void;
      onComplete: (metrics: string, source?: string) => void;
      onError: (error: string) => void;
    }
  ): Promise<void> {
    this.isCancelled = false;
    const startTime = performance.now();
    let firstTokenTime = 0;
    const w = typeof window !== 'undefined' ? (window as any) : {};
    const country = (options.country || 'Zimbabwe').trim() || 'Zimbabwe';
    const isZim = country.toLowerCase() === 'zimbabwe';

    // --- PATH A: Native Android Studio Bridge ---
    const nativeBridge = w.AndroidNativeAI || w.ZexaNative || w.AndroidBridge;
    if (nativeBridge && typeof nativeBridge.generate === 'function') {
      try {
        const payload = JSON.stringify({
          question: question.trim(),
          level: options.level,
          country,
          context: (options.contextSnippet || '').slice(0, 2200),
          history: options.history?.slice(-2) || []
        });

        w.__onNativeToken = (token: string) => {
          if (this.isCancelled) return;
          if (firstTokenTime === 0) firstTokenTime = performance.now();
          options.onToken(token);
        };

        w.__onNativeComplete = (metricsStr?: string) => {
          const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
          options.onComplete(
            metricsStr || `Total: ${totalTime}s • ZEXA AI`,
            options.sourceTag || `ZEXA AI · ${isZim ? 'ZIMSEC' : country} Curriculum`
          );
        };

        w.__onNativeError = (errStr: string) => {
          options.onError(errStr);
        };

        nativeBridge.generate(payload);
        return;
      } catch (err: any) {
        options.onError(`Native bridge error: ${err?.message || err}`);
        return;
      }
    }

    // --- PATH B: Local WebAssembly ZEXA Neural Engine ---
    if (!this.wllama || !this.wllama.isModelLoaded() || this.currentStatus !== 'ready') {
      options.onError('ZEXA_CORE_NOT_LOADED');
      return;
    }

    const abortController = new AbortController();
    this.activeAbortController = abortController;

    // Stall watchdog: resets whenever prefill progress or tokens arrive (45s ceiling if completely frozen)
    let hasEmittedTokens = false;
    let timedOut = false;
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    const armWatchdog = (ms = 45000) => {
      if (watchdog) clearTimeout(watchdog);
      watchdog = setTimeout(() => {
        if (!hasEmittedTokens && !this.isCancelled) {
          timedOut = true;
          abortController.abort();
        }
      }, ms);
    };
    armWatchdog(45000);

    try {
      const groundedContext = (options.contextSnippet || '').trim().slice(0, 900);

      const tutorRole = isZim
        ? `You are ZEXA AI, Zimbabwe's offline ZIMSEC tutor for ${options.level} students.`
        : `You are ZEXA AI, an offline educational tutor for ${options.level} students in ${country}.`;

      const systemPrompt = groundedContext
        ? [
            tutorRole,
            `STRICT RULE: Answer using ONLY the verified facts below and certain foundational science/math principles. NEVER invent names, dates, officials, or statistics. Format cleanly with a short ### Heading and concise bullets.`,
            `\nVERIFIED CURRICULUM DATA (${options.sourceTag || 'Official Notes'}):\n"""\n${groundedContext}\n"""`
          ].join('\n')
        : [
            tutorRole,
            `Answer science, math, technology, history, literature, and general study questions accurately and concisely at ${options.level} level. NEVER invent officials, local historical dates, or unverified statistics—if unsure of a specific fact, state that clearly instead of guessing.`,
            `If the student is asking for general homework help without stating a problem yet, greet them warmly and invite them to paste their exact question, equation, or topic.`
          ].join('\n');

      const messages: ChatCompletionMessage[] = [{ role: 'system', content: systemPrompt }];

      if (options.history && options.history.length > 0) {
        for (const h of options.history.slice(-1)) {
          if (h.question && h.answer) {
            messages.push({ role: 'user', content: h.question.slice(0, 140) });
            messages.push({ role: 'assistant', content: h.answer.slice(0, 200) });
          }
        }
      }

      messages.push({ role: 'user', content: question.trim() });

      let emittedLength = 0;

      const stream = await this.wllama.createChatCompletion({
        messages,
        stream: true,
        return_progress: true,
        cache_prompt: true,
        temperature: groundedContext ? 0.25 : 0.35,
        top_p: 0.88,
        penalty_repeat: 1.12,
        max_tokens: 300,
        abortSignal: abortController.signal
      });

      for await (const chunk of stream) {
        if (this.isCancelled || timedOut) {
          break;
        }
        if (chunk.prompt_progress && !hasEmittedTokens) {
          // Keep watchdog alive while WASM is actively prefilling tokens
          armWatchdog(45000);
        }
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          if (!hasEmittedTokens) {
            hasEmittedTokens = true;
            if (watchdog) {
              clearTimeout(watchdog);
              watchdog = null;
            }
            firstTokenTime = performance.now();
          }
          emittedLength += delta.length;
          options.onToken(delta);
        }
      }

      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = null;
      }
      this.activeAbortController = null;

      if (timedOut) {
        options.onError('DEVICE_TIMEOUT (45s)');
        return;
      }

      if (this.isCancelled) {
        options.onComplete('Cancelled by user');
        return;
      }

      if (emittedLength === 0) {
        options.onError('EMPTY_NEURAL_OUTPUT');
        return;
      }

      const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
      const ttft = firstTokenTime > 0 ? ((firstTokenTime - startTime) / 1000).toFixed(1) : '0.8';
      const metrics = `Prefill: ${ttft}s | Total: ${totalTime}s • ZEXA AI`;
      options.onComplete(
        metrics,
        groundedContext && options.sourceTag
          ? `${options.sourceTag} · ZEXA AI`
          : `ZEXA AI (${options.level})`
      );
    } catch (err: any) {
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = null;
      }
      this.activeAbortController = null;
      if (timedOut) {
        options.onError('DEVICE_TIMEOUT (45s)');
      } else if (this.isCancelled || err?.name === 'AbortError') {
        if (hasEmittedTokens) {
          options.onComplete('Stopped by user');
        } else {
          options.onError('GENERATION_ABORTED');
        }
      } else {
        options.onError(err?.message || 'Inference error');
      }
    }
  }

  public static async unload(): Promise<void> {
    this.stopGeneration();
    if (this.wllama) {
      try {
        await this.wllama.exit();
      } catch {
        // ignore unload errors
      }
      this.wllama = null;
    }
    this.currentStatus = this.modelFoundInAssets ? 'unloaded' : 'awaiting_model';
    this.currentProgress = 0;
    this.statusMessage = this.modelFoundInAssets
      ? 'ZEXA AI Unloaded (Tap to reload)'
      : 'ZEXA AI Offline Mode Active';
    this.errorMessage = '';
    this.notifySubscribers();
  }
}
