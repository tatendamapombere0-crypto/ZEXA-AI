/**
 * ZEXA AI Offline Neural Engine
 * Powered by @wllama/wllama (100% Local WebAssembly llama.cpp) & Android Native NDK Bridge.
 *
 * Designed for Zero-Tap Auto-Load & Under-5-Second Offline Execution:
 * 1. Automatically probes local `assets/` GGUF binaries on app launch & install (`zexa_ai.gguf`, `model.gguf`, etc.).
 * 2. Uses relative `./assets/wasm/wllama.wasm` so Web, Capacitor, and Android Studio `file://` WebViews all resolve cleanly.
 * 3. Supports Android Studio JNI/NDK Native Bridge (`window.AndroidNativeAI` / `window.ZexaNative` / `window.AndroidBridge`).
 * 4. Aligns KV prompt caching (`cache_prompt: true`), static short system prefix, `n_ctx: 512`, `n_batch: 512`, and `warmup: true`
 *    so mobile inference stays fast (< 5 seconds).
 */

import { Wllama, type ChatCompletionMessage } from '@wllama/wllama';

export type ZexaModelStatus =
  | 'unloaded'
  | 'checking'
  | 'awaiting_model'
  | 'loading'
  | 'ready'
  | 'error';

export interface ZexaProgressState {
  status: ZexaModelStatus;
  progress: number; // 0 to 100
  statusText: string;
  modelName: string;
  modelPresentInAssets: boolean;
  error?: string;
  isAndroidNative?: boolean;
}

const STATIC_SYSTEM_PROMPT =
  'You are ZEXA AI, a helpful offline study tutor. Answer clearly, accurately, and concisely.';

const ASSET_MODEL_CANDIDATES = [
  'assets/zexa_ai.gguf',
  'assets/zexa-ai.gguf',
  'assets/zexa.gguf',
  'assets/zexa_brain.gguf',
  'assets/model.gguf',
  'assets/ai_model.gguf'
];

export class ZexaNeuralEngine {
  private static wllama: Wllama | null = null;
  private static currentStatus: ZexaModelStatus = 'unloaded';
  private static currentProgress = 0;
  private static statusMessage = 'Initializing ZEXA AI Offline Engine...';
  private static errorMessage = '';
  private static modelFoundInAssets = false;
  private static resolvedAssetUrl: string | null = null;
  private static isCancelled = false;
  private static activeAbortController: AbortController | null = null;
  private static loadPromise: Promise<boolean> | null = null;
  private static subscribers = new Set<(state: ZexaProgressState) => void>();

  public static readonly MODEL_FILENAME = 'zexa_ai.gguf';
  public static readonly LOCAL_GGUF_URL = '/assets/zexa_ai.gguf';

  private static resolveRelativeAssetUrl(relPath: string): string {
    const cleanRel = relPath.replace(/^\/+/, '');
    if (typeof window !== 'undefined' && window.location?.href) {
      try {
        return new URL(cleanRel, window.location.href).toString();
      } catch {
        // ignore URL error
      }
    }
    return `/${cleanRel}`;
  }

  private static getLocalWasmPaths(): { default: string } {
    return {
      default: this.resolveRelativeAssetUrl('assets/wasm/wllama.wasm')
    };
  }

  private static getCandidateModelUrls(): string[] {
    const urls = new Set<string>();
    if (this.resolvedAssetUrl) {
      urls.add(this.resolvedAssetUrl);
    }
    for (const rel of ASSET_MODEL_CANDIDATES) {
      urls.add(this.resolveRelativeAssetUrl(rel));
      if (typeof window !== 'undefined' && window.location?.origin && window.location.protocol !== 'file:') {
        urls.add(`${window.location.origin}/${rel}`);
      } else {
        urls.add(`/${rel}`);
      }
    }
    return Array.from(urls);
  }

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

  public static subscribe(callback: (state: ZexaProgressState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getStatus());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private static getAnyNativeBridgeObject(): any | null {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    return w.AndroidNativeAI || w.ZexaNative || w.AndroidBridge || null;
  }

  private static getActiveNativeBridge(): { bridge: any; methodName: 'generate' | 'ask' | 'infer' } | null {
    const bridge = this.getAnyNativeBridgeObject();
    if (!bridge) return null;

    let methodName: 'generate' | 'ask' | 'infer' | null = null;
    if (typeof bridge.generate === 'function') methodName = 'generate';
    else if (typeof bridge.ask === 'function') methodName = 'ask';
    else if (typeof bridge.infer === 'function') methodName = 'infer';
    if (!methodName) return null;

    if (typeof bridge.isReady === 'function') {
      try {
        if (!bridge.isReady()) return null;
      } catch {
        return null;
      }
    }
    return { bridge, methodName };
  }

  public static isRunningInAndroidAPK(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      Boolean(this.getAnyNativeBridgeObject()) ||
      navigator.userAgent.includes('wv') ||
      window.location.protocol === 'file:'
    );
  }

  public static getStatus(): ZexaProgressState {
    const isNative = Boolean(this.getActiveNativeBridge());

    return {
      status: isNative ? 'ready' : this.currentStatus,
      progress: isNative ? 100 : this.currentProgress,
      statusText: isNative ? 'ZEXA AI Connected & Ready' : this.statusMessage,
      modelName: 'ZEXA AI',
      modelPresentInAssets: isNative || this.modelFoundInAssets,
      error: this.errorMessage || undefined,
      isAndroidNative: isNative
    };
  }

  public static isReady(): boolean {
    if (this.getActiveNativeBridge()) return true;
    return this.currentStatus === 'ready' && this.wllama !== null && this.wllama.isModelLoaded();
  }

  public static isLoading(): boolean {
    return (
      this.currentStatus === 'checking' ||
      this.currentStatus === 'loading' ||
      this.loadPromise !== null
    );
  }

  /**
   * Waits briefly for an in-flight auto-load (right after app launch/install) before giving up.
   */
  public static async waitUntilReady(maxWaitMs = 3500): Promise<boolean> {
    if (this.isReady()) return true;
    if (!this.loadPromise) return false;

    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const winner = await Promise.race([
        this.loadPromise,
        new Promise<boolean>((resolve) => {
          timer = setTimeout(() => resolve(this.isReady()), maxWaitMs);
        })
      ]);
      return Boolean(winner || this.isReady());
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private static activeSettleAbort: ((reason: string) => void) | null = null;

  public static stopGeneration(): void {
    this.isCancelled = true;
    if (this.activeSettleAbort) {
      const fn = this.activeSettleAbort;
      this.activeSettleAbort = null;
      try {
        fn('GENERATION_ABORTED');
      } catch {
        // ignore
      }
    }
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

  private static cleanModelControlTokens(text: string): string {
    return text
      .replace(/<\|im_start\|>(?:assistant|system|user)?\n?/gi, '')
      .replace(/<\|im_end\|>/gi, '')
      .replace(/<\|endoftext\|>/gi, '')
      .replace(/<\|eot_id\|>/gi, '');
  }

  /**
   * Stateful streaming filter that strips `<think>...</think>` internal reasoning blocks
   * even when tags are split across small token chunks, while preserving visible output.
   */
  private static createThinkTagStreamFilter(): {
    push: (chunk: string) => string;
    flush: () => string;
  } {
    const OPEN_TAG = '<think>';
    const CLOSE_TAG = '</think>';
    let buffer = '';
    let inThink = false;

    const matchPartialSuffix = (str: string, target: string): number => {
      const lower = str.toLowerCase();
      const maxLen = Math.min(lower.length, target.length - 1);
      for (let len = maxLen; len > 0; len--) {
        if (lower.endsWith(target.slice(0, len))) {
          return len;
        }
      }
      return 0;
    };

    const drain = (isFinal: boolean): string => {
      let out = '';
      while (buffer.length > 0) {
        const lower = buffer.toLowerCase();
        if (inThink) {
          const closeIdx = lower.indexOf(CLOSE_TAG);
          if (closeIdx !== -1) {
            buffer = buffer.slice(closeIdx + CLOSE_TAG.length);
            inThink = false;
            continue;
          }
          if (isFinal) {
            buffer = '';
          } else {
            const keepTail = matchPartialSuffix(buffer, CLOSE_TAG);
            buffer = keepTail > 0 ? buffer.slice(-keepTail) : '';
          }
          break;
        } else {
          const openIdx = lower.indexOf(OPEN_TAG);
          if (openIdx !== -1) {
            out += buffer.slice(0, openIdx);
            buffer = buffer.slice(openIdx + OPEN_TAG.length);
            inThink = true;
            continue;
          }
          if (isFinal) {
            out += buffer;
            buffer = '';
          } else {
            const keepTail = matchPartialSuffix(buffer, OPEN_TAG);
            if (keepTail > 0) {
              out += buffer.slice(0, buffer.length - keepTail);
              buffer = buffer.slice(-keepTail);
            } else {
              out += buffer;
              buffer = '';
            }
          }
          break;
        }
      }
      return out;
    };

    return {
      push: (chunk: string) => {
        if (!chunk) return '';
        buffer += chunk;
        return drain(false);
      },
      flush: () => drain(true)
    };
  }

  /**
   * Streams at most the first 4 bytes to confirm GGUF magic header (`0x47 0x47 0x55 0x46`)
   * and immediately cancels the stream so Android WebViews that ignore HTTP `Range`
   * never buffer hundreds of megabytes into JS memory during discovery.
   */
  private static async probeSingleGGUFUrl(url: string): Promise<{
    exists: boolean;
    url: string;
    sizeBytes?: number;
  }> {
    try {
      const res = await fetch(url, {
        headers: { Range: 'bytes=0-3' },
        cache: 'no-store'
      });

      if (!res || !res.ok) {
        return { exists: false, url };
      }

      const contentType = (res.headers?.get('content-type') || '').toLowerCase();
      if (
        contentType.includes('text/html') ||
        contentType.includes('application/javascript') ||
        contentType.includes('text/javascript')
      ) {
        try {
          await res.body?.cancel();
        } catch {
          // ignore
        }
        return { exists: false, url };
      }

      let bytes: Uint8Array | null = null;
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader();
        try {
          const collected: number[] = [];
          while (collected.length < 4) {
            const { value, done } = await reader.read();
            if (done || !value) break;
            for (let i = 0; i < value.length && collected.length < 4; i++) {
              collected.push(value[i]);
            }
          }
          bytes = new Uint8Array(collected);
        } finally {
          try {
            await reader.cancel();
          } catch {
            // ignore
          }
        }
      } else {
        const contentLenHeader = res.headers?.get('content-length');
        const declaredLen = contentLenHeader ? parseInt(contentLenHeader, 10) : 0;
        // Only buffer if partial 206 or tiny payload; never OOM on full un-ranged body
        if (res.status === 206 || (declaredLen > 0 && declaredLen <= 65536)) {
          const buf = await res.arrayBuffer();
          bytes = new Uint8Array(buf.slice(0, 4));
        }
      }

      const isGGUFMagic =
        bytes !== null &&
        bytes.length >= 4 &&
        bytes[0] === 0x47 && // G
        bytes[1] === 0x47 && // G
        bytes[2] === 0x55 && // U
        bytes[3] === 0x46;   // F

      if (!isGGUFMagic) {
        return { exists: false, url };
      }

      const contentRange = res.headers?.get('content-range') || '';
      const totalMatch = contentRange.match(/\/(\d+)$/);
      const contentLengthHeader = res.headers?.get('content-length');
      const sizeBytes = totalMatch
        ? parseInt(totalMatch[1], 10)
        : contentLengthHeader
        ? parseInt(contentLengthHeader, 10)
        : undefined;

      return { exists: true, url, sizeBytes };
    } catch {
      return { exists: false, url };
    }
  }

  /**
   * Optional helper: if the Android Studio bundle includes `assets/model_manifest.json`
   * specifying `{ "modelFile": "your_model.gguf" }`, check that path first.
   */
  private static async checkManifestModelUrl(): Promise<string | null> {
    try {
      const manifestUrl = this.resolveRelativeAssetUrl('assets/model_manifest.json');
      const res = await fetch(manifestUrl, { cache: 'no-store' });
      if (!res.ok) return null;
      const contentType = (res.headers?.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) return null;
      const json = await res.json();
      const rawFile = typeof json?.modelFile === 'string' ? json.modelFile.trim() : '';
      if (!rawFile || !rawFile.toLowerCase().endsWith('.gguf')) return null;
      return rawFile.startsWith('assets/')
        ? this.resolveRelativeAssetUrl(rawFile)
        : this.resolveRelativeAssetUrl(`assets/${rawFile.replace(/^\/+/, '')}`);
    } catch {
      return null;
    }
  }

  /**
   * Verifies whether a real GGUF binary exists inside the bundled `assets/` directory.
   */
  public static async checkLocalGGUFExists(): Promise<{
    exists: boolean;
    url?: string;
    sizeBytes?: number;
    reason?: string;
  }> {
    if (typeof fetch !== 'function') {
      return { exists: false, reason: 'Non-browser environment' };
    }

    const candidates: string[] = [];
    const manifestCandidate = await this.checkManifestModelUrl();
    if (manifestCandidate) candidates.push(manifestCandidate);

    for (const c of this.getCandidateModelUrls()) {
      if (!candidates.includes(c)) candidates.push(c);
    }

    for (const url of candidates) {
      const result = await this.probeSingleGGUFUrl(url);
      if (result.exists) {
        this.modelFoundInAssets = true;
        this.resolvedAssetUrl = result.url;
        return {
          exists: true,
          url: result.url,
          sizeBytes: result.sizeBytes
        };
      }
    }

    return { exists: false, reason: 'ZEXA AI offline model not mounted in assets' };
  }

  private static createWllamaInstance(): Wllama {
    const instance = new Wllama(this.getLocalWasmPaths(), {
      allowOffline: true,
      suppressNativeLog: true,
      parallelDownloads: 1
    });
    // Enforce 100% offline execution (disable external CDN compat scripts)
    instance.setCompat(null);
    return instance;
  }

  private static getSafeThreadCount(): number {
    if (typeof self !== 'undefined' && (self as any).crossOriginIsolated) {
      const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;
      return Math.max(1, Math.min(4, Math.floor(cores / 2)));
    }
    return 1;
  }

  private static getFastLoadOptions(
    progressCallback?: (opts: { loaded: number; total: number }) => void
  ): Record<string, any> {
    return {
      n_gpu_layers: 0,
      n_threads: this.getSafeThreadCount(),
      n_ctx: 512,
      n_batch: 512,
      n_ubatch: 256,
      n_parallel: 1,
      kv_unified: true,
      warmup: true,
      ctx_shift: true,
      default_template_kwargs: { enable_thinking: false },
      ...(progressCallback ? { progressCallback } : {})
    };
  }

  /**
   * Streams a local asset `.gguf` directly into a Blob (bypassing CacheManager/OPFS and HTTP HEAD)
   * when running inside Android Studio `file://` WebViews or restricted asset loaders.
   */
  private static async fetchAssetAsBlob(
    url: string,
    onProgress: (loaded: number, total: number) => void
  ): Promise<Blob> {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} loading ${url}`);
    }

    const totalHeader = response.headers.get('content-length');
    const total = totalHeader ? parseInt(totalHeader, 10) : 0;

    if (!response.body || typeof response.body.getReader !== 'function') {
      const blob = await response.blob();
      onProgress(blob.size, total || blob.size);
      return blob;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    let lastReport = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.byteLength;
        const now = Date.now();
        if (now - lastReport > 80) {
          lastReport = now;
          onProgress(loaded, total);
        }
      }
    }

    onProgress(loaded, total || loaded);
    return new Blob(chunks as BlobPart[], { type: 'application/octet-stream' });
  }

  /**
   * @wllama/wllama@3.13.0 may resolve `loadModel` without throwing even when `load_res.success === false`.
   * Always verify real loaded metadata (`n_vocab > 0` and `n_layer > 0`) before reporting Connected.
   */
  private static verifyLoadedModelContext(instance: Wllama): void {
    if (!instance.isModelLoaded()) {
      throw new Error('Offline model context did not initialize.');
    }
    const info = instance.getLoadedContextInfo() as unknown as Record<string, any>;
    if (info?.success === false || !info?.n_vocab || info.n_vocab <= 0 || !info?.n_layer || info.n_layer <= 0) {
      throw new Error('Invalid or incomplete ZEXA AI brain file (failed to initialize model layers).');
    }
  }

  /**
   * Automatically checks `assets/` and mounts ZEXA AI into offline memory if present.
   * Safe to invoke multiple times on launch / onboarding entry (deduplicates concurrent loads).
   */
  public static async autoConnectLocalGGUF(
    onProgress?: (state: ZexaProgressState) => void
  ): Promise<boolean> {
    if (this.isReady()) {
      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.statusMessage = 'ZEXA AI Connected & Ready';
      if (onProgress) onProgress(this.getStatus());
      return true;
    }

    if (this.loadPromise) {
      const ok = await this.loadPromise;
      if (onProgress) onProgress(this.getStatus());
      return ok;
    }

    this.loadPromise = this.loadModel(onProgress).finally(() => {
      this.loadPromise = null;
    });
    return this.loadPromise;
  }

  /**
   * Loads ZEXA AI from Android Native Bridge OR bundled `assets/` GGUF file.
   */
  public static async loadModel(
    onProgress?: (state: ZexaProgressState) => void
  ): Promise<boolean> {
    // Path A: Native Android Studio Bridge
    if (this.getActiveNativeBridge()) {
      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.modelFoundInAssets = true;
      this.statusMessage = 'ZEXA AI Connected & Ready';
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
    if (!probe.exists || !probe.url) {
      this.modelFoundInAssets = false;
      this.currentStatus = 'awaiting_model';
      this.currentProgress = 0;
      this.errorMessage = '';
      this.statusMessage = 'No local neural brain file loaded';
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
        this.wllama = null;
      }

      const instance = this.createWllamaInstance();
      const updateProgress = (loaded: number, total: number) => {
        const pct = total > 0 ? Math.min(98, Math.max(10, Math.round((loaded / total) * 100))) : 55;
        this.currentProgress = pct;
        const loadedMb = (loaded / (1024 * 1024)).toFixed(0);
        const totalMb = total > 0 ? (total / (1024 * 1024)).toFixed(0) : '?';
        this.statusMessage = `Loading ZEXA AI (${loadedMb}/${totalMb} MB • ${pct}%)`;
        if (onProgress) onProgress(this.getStatus());
        this.notifySubscribers();
      };

      const isFileOrigin =
        typeof window !== 'undefined' && window.location?.protocol === 'file:';

      let loadedViaCacheUrl = false;
      if (!isFileOrigin && typeof navigator !== 'undefined' && 'storage' in navigator) {
        try {
          await instance.loadModelFromUrl(probe.url, {
            ...this.getFastLoadOptions(({ loaded, total }) => updateProgress(loaded, total)),
            useCache: true
          });
          loadedViaCacheUrl = true;
        } catch {
          // Fall back seamlessly to direct asset stream -> Blob when WebView blocks HEAD or OPFS
          loadedViaCacheUrl = false;
        }
      }

      if (!loadedViaCacheUrl) {
        const modelBlob = await this.fetchAssetAsBlob(probe.url, updateProgress);
        await instance.loadModel([modelBlob], this.getFastLoadOptions());
      }

      this.verifyLoadedModelContext(instance);
      this.wllama = instance;

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
      this.statusMessage = 'Failed to connect offline neural brain';
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
   * Loads a `.gguf` brain file directly from a user-selected local File/Blob.
   */
  public static async loadModelFromFile(
    file: File,
    onProgress?: (state: ZexaProgressState) => void
  ): Promise<boolean> {
    if (!file) {
      this.currentStatus = 'error';
      this.errorMessage = 'No file selected.';
      this.statusMessage = 'Please select a ZEXA offline brain file';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }

    let hasValidHeader = false;
    if (file.size >= 32) {
      try {
        const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
        hasValidHeader =
          header[0] === 0x47 &&
          header[1] === 0x47 &&
          header[2] === 0x55 &&
          header[3] === 0x46;
      } catch {
        hasValidHeader = false;
      }
    }

    if (!hasValidHeader) {
      this.currentStatus = 'error';
      this.errorMessage = `Selected file "${file.name}" is not a valid GGUF brain binary.`;
      this.statusMessage = 'Invalid offline brain file format';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }

    try {
      this.currentStatus = 'loading';
      this.currentProgress = 15;
      this.errorMessage = '';
      this.statusMessage = `Loading ${file.name} into offline memory...`;
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();

      if (this.wllama) {
        try {
          await this.wllama.exit();
        } catch {
          // ignore
        }
        this.wllama = null;
      }

      const instance = this.createWllamaInstance();
      await instance.loadModel([file], this.getFastLoadOptions());

      this.verifyLoadedModelContext(instance);
      this.wllama = instance;

      this.currentStatus = 'ready';
      this.currentProgress = 100;
      this.statusMessage = 'ZEXA AI Connected & Ready';
      this.errorMessage = '';
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return true;
    } catch (err: any) {
      this.currentStatus = 'error';
      this.errorMessage = err?.message || 'Failed to mount offline ZEXA AI file';
      this.statusMessage = 'Failed to connect offline ZEXA AI file';
      this.wllama = null;
      if (onProgress) onProgress(this.getStatus());
      this.notifySubscribers();
      return false;
    }
  }

  /**
   * Executes fast (< 5s target) ZEXA AI inference with static KV-cached system prefix,
   * clean streaming `<think>` suppression, and native Android bridge acceleration.
   */
  public static async generate(
    question: string,
    options: {
      level: string;
      country?: string;
      tutorMode?: string;
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

    let settled = false;
    let hasEmittedTokens = false;
    let emittedText = '';
    let leadingBuffer = '';
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    const abortController = new AbortController();

    const clearWatchdog = () => {
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = null;
      }
    };

    const settleComplete = (metrics: string, source?: string) => {
      if (settled) return;
      settled = true;
      clearWatchdog();
      if (this.activeSettleAbort) this.activeSettleAbort = null;
      this.activeAbortController = null;
      options.onComplete(metrics, source);
    };

    const settleError = (errorMsg: string) => {
      if (settled) return;
      settled = true;
      clearWatchdog();
      if (this.activeSettleAbort) this.activeSettleAbort = null;
      this.activeAbortController = null;
      if (hasEmittedTokens && emittedText.trim().length > 0 && this.isCancelled) {
        options.onComplete('Stopped by user');
      } else {
        options.onError(errorMsg);
      }
    };

    const thinkFilter = this.createThinkTagStreamFilter();

    const emitVisibleToken = (rawDelta: string, onVisible: () => void, isFinalFlush = false) => {
      if (this.isCancelled || settled) return;
      const controlClean = rawDelta ? this.cleanModelControlTokens(rawDelta) : '';
      const cleaned = isFinalFlush
        ? thinkFilter.push(controlClean) + thinkFilter.flush()
        : thinkFilter.push(controlClean);
      if (!cleaned) return;

      if (!hasEmittedTokens) {
        leadingBuffer += cleaned;
        if (leadingBuffer.trim().length === 0) {
          return;
        }
        hasEmittedTokens = true;
        firstTokenTime = performance.now();
        const firstVisible = leadingBuffer.replace(/^\s+/, '');
        leadingBuffer = '';
        emittedText += firstVisible;
        onVisible();
        options.onToken(firstVisible);
        return;
      }

      emittedText += cleaned;
      onVisible();
      options.onToken(cleaned);
    };

    // --- PATH A: Native Android Studio Bridge (< 5s hardware-accelerated execution) ---
    const activeNative = this.getActiveNativeBridge();
    if (activeNative) {
      const { bridge: nativeBridge, methodName } = activeNative;
      const armNativeWatchdog = (ms = 14000) => {
        clearWatchdog();
        watchdog = setTimeout(() => {
          if (!settled) {
            try {
              nativeBridge.stopGeneration?.();
            } catch {
              // ignore
            }
            if (hasEmittedTokens && emittedText.trim().length > 0) {
              const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
              settleComplete(
                `Total: ${totalTime}s • ZEXA AI`,
                options.sourceTag || `ZEXA AI · ${isZim ? 'ZIMSEC' : country}`
              );
            } else {
              settleError('DEVICE_TIMEOUT');
            }
          }
        }, ms);
      };

      this.activeSettleAbort = (reason: string) => {
        settleError(reason);
      };
      armNativeWatchdog(14000);

      try {
        const compactContext = (options.contextSnippet || '').trim().slice(0, 600);
        const payload = JSON.stringify({
          question: question.trim(),
          prompt: question.trim(),
          systemPrompt: STATIC_SYSTEM_PROMPT,
          level: options.level,
          country,
          tutorMode: options.tutorMode || 'standard',
          context: compactContext,
          maxTokens: 130,
          enableThinking: false,
          history: options.history?.slice(-1) || []
        });

        const handleToken = (token: string) => {
          emitVisibleToken(token, () => armNativeWatchdog(10000));
        };

        const handleComplete = (metricsStr?: string) => {
          if (settled) return;
          emitVisibleToken('', () => {}, true);
          if (!hasEmittedTokens || emittedText.trim().length === 0) {
            settleError('EMPTY_NEURAL_OUTPUT');
            return;
          }
          const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
          settleComplete(
            metricsStr || `Total: ${totalTime}s • ZEXA AI`,
            options.sourceTag || `ZEXA AI · ${isZim ? 'ZIMSEC' : country}`
          );
        };

        const handleError = (errStr?: string) => {
          settleError(errStr || 'Native inference error');
        };

        // Bind both callback conventions used across Android WebView integrations
        w.__onNativeToken = handleToken;
        w.onZexaToken = handleToken;
        w.__onNativeComplete = handleComplete;
        w.onZexaComplete = handleComplete;
        w.__onNativeError = handleError;
        w.onZexaError = handleError;

        const bridgeResult = nativeBridge[methodName](payload);
        if (typeof bridgeResult === 'string') {
          emitVisibleToken(bridgeResult, () => armNativeWatchdog(10000), true);
          if (!settled) {
            if (hasEmittedTokens && emittedText.trim().length > 0) {
              const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
              settleComplete(
                `Total: ${totalTime}s • ZEXA AI`,
                options.sourceTag || `ZEXA AI · ${isZim ? 'ZIMSEC' : country}`
              );
            } else {
              settleError('EMPTY_NEURAL_OUTPUT');
            }
          }
        } else if (bridgeResult && typeof bridgeResult.then === 'function') {
          Promise.resolve(bridgeResult)
            .then((resolvedVal: unknown) => {
              if (settled || this.isCancelled) return;
              if (typeof resolvedVal === 'string') {
                emitVisibleToken(resolvedVal, () => armNativeWatchdog(10000), true);
                if (!settled) {
                  if (hasEmittedTokens && emittedText.trim().length > 0) {
                    const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
                    settleComplete(
                      `Total: ${totalTime}s • ZEXA AI`,
                      options.sourceTag || `ZEXA AI · ${isZim ? 'ZIMSEC' : country}`
                    );
                  } else {
                    settleError('EMPTY_NEURAL_OUTPUT');
                  }
                }
              }
            })
            .catch((err: any) => {
              if (!settled) {
                settleError(`Native bridge error: ${err?.message || err}`);
              }
            });
        }
        return;
      } catch (err: any) {
        settleError(`Native bridge error: ${err?.message || err}`);
        return;
      }
    }

    // --- PATH B: Local WebAssembly ZEXA Neural Engine (< 5s KV-cached pipeline) ---
    if (!this.wllama || !this.wllama.isModelLoaded() || this.currentStatus !== 'ready') {
      options.onError('ZEXA_CORE_NOT_LOADED');
      return;
    }

    this.activeAbortController = abortController;
    this.activeSettleAbort = (reason: string) => {
      try {
        abortController.abort();
      } catch {
        // ignore
      }
      settleError(reason);
    };

    const INITIAL_PREFILL_WAIT_MS = 12000;
    const HARD_FIRST_TOKEN_DEADLINE = startTime + 22000;
    const INTER_TOKEN_STALL_MS = 8000;
    let lastPrefillProcessed = -1;

    const armWatchdog = (ms: number, timeoutLabel = 'DEVICE_TIMEOUT') => {
      clearWatchdog();
      watchdog = setTimeout(() => {
        if (settled) return;
        try {
          abortController.abort();
        } catch {
          // ignore
        }
        if (hasEmittedTokens && emittedText.trim().length > 0) {
          const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
          const ttft = firstTokenTime > 0 ? ((firstTokenTime - startTime) / 1000).toFixed(1) : '0.4';
          settleComplete(`Prefill: ${ttft}s | Total: ${totalTime}s • ZEXA AI`, `ZEXA AI (${options.level})`);
        } else {
          settleError(timeoutLabel);
        }
      }, ms);
    };
    armWatchdog(INITIAL_PREFILL_WAIT_MS, 'DEVICE_TIMEOUT');

    try {
      const groundedContext = (options.contextSnippet || '').trim().slice(0, 360);
      const modeDirective =
        options.tutorMode === 'step-by-step'
          ? 'Show clear numbered step-by-step working. '
          : options.tutorMode === 'exam-points'
          ? 'Give concise high-yield exam marking points. '
          : options.tutorMode === 'quiz-me'
          ? 'Explain briefly, then give 2 practice questions with answers. '
          : options.tutorMode === 'simplify'
          ? 'Explain in simple everyday language with a clear analogy. '
          : '';

      // Keep the system prompt 100% static across turns so llama.cpp KV `cache_prompt: true`
      // skips re-computing system tokens on every question (~0ms system prefill!).
      const userPrompt = groundedContext
        ? `Context (${options.level}):\n${groundedContext}\n\n${modeDirective}Question: ${question.trim()}`
        : `[${options.level}] ${modeDirective}${question.trim()}`;

      const messages: ChatCompletionMessage[] = [
        { role: 'system', content: STATIC_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ];

      await this.wllama.createChatCompletion({
        messages,
        stream: true,
        return_progress: true,
        cache_prompt: true,
        chat_template_kwargs: { enable_thinking: false },
        temperature: groundedContext ? 0.2 : 0.3,
        top_p: 0.85,
        top_k: 20,
        penalty_repeat: 1.1,
        max_tokens: 130,
        abortSignal: abortController.signal,
        onData: (chunk) => {
          if (settled || this.isCancelled) return;
          const progress = (chunk as any)?.prompt_progress;
          if (!hasEmittedTokens && progress && typeof progress.processed === 'number') {
            if (progress.processed > lastPrefillProcessed) {
              lastPrefillProcessed = progress.processed;
              const remainingToHardCeiling = HARD_FIRST_TOKEN_DEADLINE - performance.now();
              if (remainingToHardCeiling > 400) {
                armWatchdog(Math.min(12000, remainingToHardCeiling), 'DEVICE_TIMEOUT');
              }
            }
          }

          const choice = chunk.choices?.[0] as any;
          const rawDelta =
            choice?.delta?.content ??
            choice?.message?.content ??
            (chunk as any)?.content ??
            '';
          if (rawDelta) {
            emitVisibleToken(String(rawDelta), () => armWatchdog(INTER_TOKEN_STALL_MS, 'DEVICE_TIMEOUT'));
          }
        }
      });

      if (settled) return;

      emitVisibleToken('', () => {}, true);

      if (this.isCancelled) {
        settleComplete('Cancelled by user');
        return;
      }

      if (!hasEmittedTokens || emittedText.trim().length === 0) {
        settleError('EMPTY_NEURAL_OUTPUT');
        return;
      }

      const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
      const ttft = firstTokenTime > 0 ? ((firstTokenTime - startTime) / 1000).toFixed(1) : '0.4';
      const metrics = `Prefill: ${ttft}s | Total: ${totalTime}s • ZEXA AI`;
      settleComplete(
        metrics,
        groundedContext && options.sourceTag
          ? `${options.sourceTag} · ZEXA AI`
          : `ZEXA AI (${options.level})`
      );
    } catch (err: any) {
      if (settled) return;
      if (this.isCancelled || err?.name === 'AbortError' || err?.name === 'WllamaAbortError') {
        if (hasEmittedTokens && emittedText.trim().length > 0) {
          settleComplete('Stopped by user');
        } else {
          settleError('GENERATION_ABORTED');
        }
      } else {
        settleError(err?.message || 'Inference error');
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
    this.resolvedAssetUrl = null;
    this.currentStatus = this.modelFoundInAssets ? 'unloaded' : 'awaiting_model';
    this.currentProgress = 0;
    this.statusMessage = this.modelFoundInAssets
      ? 'ZEXA AI Unloaded (Tap to reload)'
      : 'No local neural brain file loaded';
    this.errorMessage = '';
    this.notifySubscribers();
  }
}
