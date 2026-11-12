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
  private static statusMessage = 'Checking for qwen2.5-0.5b-instruct-q4_k_m.gguf...';
  private static errorMessage = '';
  private static modelFoundInAssets = false;
  private static activeModelName = 'qwen2.5-0.5b-instruct-q4_k_m.gguf';
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
      statusText: isNative ? 'Android Native NDK Qwen Engine Ready' : this.statusMessage,
      modelName: this.activeModelName,
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
        return { exists: false, reason: `HTTP ${rangeRes.status} for ${this.LOCAL_GGUF_URL}` };
      }

      const contentType = (rangeRes.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        return {
          exists: false,
          reason: `${this.MODEL_FILENAME} not uploaded to /public/assets/ yet`
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
          reason: `File at ${this.LOCAL_GGUF_URL} is not a valid GGUF header`
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
      return { exists: false, reason: err?.message || 'Unable to probe local GGUF model' };
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
      this.statusMessage = 'Native Android Studio Qwen GGUF Bridge Connected';
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
    this.statusMessage = `Scanning /assets/ for ${this.MODEL_FILENAME}...`;
    if (onProgress) onProgress(this.getStatus());
    this.notifySubscribers();

    const probe = await this.checkLocalGGUFExists();
    if (!probe.exists) {
      this.modelFoundInAssets = false;
      this.currentStatus = 'awaiting_model';
      this.currentProgress = 0;
      this.errorMessage = '';
      this.statusMessage = `Ready for ${this.MODEL_FILENAME} in /public/assets/ (ZEXA RAG Active)`;
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }

    try {
      this.modelFoundInAssets = true;
      this.currentStatus = 'loading';
      this.currentProgress = 8;
      this.errorMessage = '';
      this.statusMessage = `Mounting ${this.MODEL_FILENAME} into local WASM memory...`;
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
        n_ctx: 2048,
        n_batch: 256,
        useCache: true,
        progressCallback: ({ loaded, total }) => {
          const pct = total > 0 ? Math.min(98, Math.max(10, Math.round((loaded / total) * 100))) : 50;
          this.currentProgress = pct;
          const loadedMb = (loaded / (1024 * 1024)).toFixed(0);
          const totalMb = total > 0 ? (total / (1024 * 1024)).toFixed(0) : '?';
          this.statusMessage = `Loading ${this.MODEL_FILENAME} (${loadedMb}/${totalMb} MB • ${pct}%)`;
          if (onProgress) onProgress(this.getStatus());
          this.notifySubscribers();
        }
      });

      this.activeModelName = this.MODEL_FILENAME;
      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.statusMessage = 'Qwen 2.5 (0.5B GGUF) + JSON RAG Pipeline Connected';
      this.errorMessage = '';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return true;
    } catch (err: any) {
      this.currentStatus = 'error';
      this.errorMessage = err?.message || 'Failed to mount GGUF model in WebAssembly';
      this.statusMessage = 'GGUF load fallback active (ZEXA RAG answering)';
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
    if (!file || !file.name.toLowerCase().endsWith('.gguf')) {
      this.currentStatus = 'error';
      this.errorMessage = 'Please select a valid .gguf model file.';
      this.statusMessage = 'Invalid file format (must be .gguf)';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }

    try {
      this.currentStatus = 'loading';
      this.currentProgress = 15;
      this.activeModelName = file.name;
      this.errorMessage = '';
      this.statusMessage = `Mounting ${file.name} from local storage...`;
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
        n_ctx: 2048,
        n_batch: 256
      });

      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.statusMessage = `${file.name} (GGUF) Connected to JSON RAG Pipeline`;
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return true;
    } catch (err: any) {
      this.currentStatus = 'error';
      this.errorMessage = err?.message || 'Failed to mount local GGUF file';
      this.statusMessage = 'Failed to load local GGUF file';
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

    // --- PATH A: Native Android Studio Bridge ---
    const nativeBridge = w.AndroidNativeAI || w.ZexaNative || w.AndroidBridge;
    if (nativeBridge && typeof nativeBridge.generate === 'function') {
      try {
        const payload = JSON.stringify({
          question: question.trim(),
          level: options.level,
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
            metricsStr || `Total: ${totalTime}s • Qwen 2.5 0.5B GGUF (Android NDK)`,
            options.sourceTag || 'Qwen 2.5 GGUF + ZIMSEC JSON RAG'
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

    // --- PATH B: Local WebAssembly Wllama GGUF Engine ---
    if (!this.wllama || !this.wllama.isModelLoaded() || this.currentStatus !== 'ready') {
      options.onError('GGUF_NOT_LOADED');
      return;
    }

    const abortController = new AbortController();
    this.activeAbortController = abortController;

    // 14s first-token watchdog so slow CPUs gracefully fail over to instant RAG without freezing chat
    let hasEmittedTokens = false;
    const watchdog = setTimeout(() => {
      if (!hasEmittedTokens && !this.isCancelled) {
        this.isCancelled = true;
        abortController.abort();
        options.onError('DEVICE_TIMEOUT');
      }
    }, 14000);

    try {
      const groundedContext = (options.contextSnippet || '').trim().slice(0, 2400);

      const systemPrompt = [
        `You are ZEXA AI, Zimbabwe's offline ZIMSEC tutor for ${options.level} students.`,
        `STRICT ACCURACY RULES:`,
        `1. Base your answer strictly on the VERIFIED ZIMSEC SYLLABUS & EXAM DATA below.`,
        `2. Preserve all exact dates, names, scientific laws, equations, and mark-scheme points from the verified data.`,
        `3. Do NOT guess or invent facts, names, or years not supported by the verified data.`,
        `4. Format clearly with a short ### Heading, a Direct Answer, and crisp bullet points.`,
        groundedContext
          ? `\nVERIFIED ZIMSEC SYLLABUS & EXAM DATA (${options.sourceTag || 'Official JSON Assets'}):\n"""\n${groundedContext}\n"""`
          : `\nNote: No pre-written snippet matched directly. Explain clearly at ${options.level} ZIMSEC standard without inventing unverified Zimbabwe-specific statistics.`
      ].join('\n');

      const messages: ChatCompletionMessage[] = [{ role: 'system', content: systemPrompt }];

      if (options.history && options.history.length > 0) {
        for (const h of options.history.slice(-2)) {
          if (h.question && h.answer) {
            messages.push({ role: 'user', content: h.question.slice(0, 180) });
            messages.push({ role: 'assistant', content: h.answer.slice(0, 260) });
          }
        }
      }

      messages.push({ role: 'user', content: question.trim() });

      let emittedLength = 0;

      await this.wllama.createChatCompletion({
        messages,
        stream: true,
        temperature: 0.25,
        top_p: 0.85,
        penalty_repeat: 1.12,
        max_tokens: 340,
        abortSignal: abortController.signal,
        onData: (chunk) => {
          if (this.isCancelled) return;
          const delta = chunk.choices?.[0]?.delta?.content || '';
          if (delta) {
            if (!hasEmittedTokens) {
              hasEmittedTokens = true;
              clearTimeout(watchdog);
              firstTokenTime = performance.now();
            }
            emittedLength += delta.length;
            options.onToken(delta);
          }
        }
      });

      clearTimeout(watchdog);
      this.activeAbortController = null;

      if (this.isCancelled) {
        options.onComplete('Cancelled by user');
        return;
      }

      if (emittedLength === 0) {
        options.onError('EMPTY_GGUF_OUTPUT');
        return;
      }

      const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
      const ttft = firstTokenTime > 0 ? ((firstTokenTime - startTime) / 1000).toFixed(1) : '0.8';
      const metrics = `Prefill: ${ttft}s | Total: ${totalTime}s • Qwen 2.5 0.5B GGUF + JSON RAG`;
      options.onComplete(
        metrics,
        options.sourceTag ? `${options.sourceTag} · Qwen 2.5 GGUF` : 'Qwen 2.5 0.5B GGUF + JSON RAG'
      );
    } catch (err: any) {
      clearTimeout(watchdog);
      this.activeAbortController = null;
      if (this.isCancelled || err?.name === 'AbortError') {
        if (hasEmittedTokens) {
          options.onComplete('Stopped by user');
        } else {
          options.onError('GENERATION_ABORTED');
        }
      } else {
        options.onError(err?.message || 'GGUF inference error');
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
      ? 'GGUF Unloaded (Click to reload)'
      : `Ready for ${this.MODEL_FILENAME} in /public/assets/`;
    this.errorMessage = '';
    this.notifySubscribers();
  }
}
