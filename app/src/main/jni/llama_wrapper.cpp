#include <jni.h>
#include <string>
#include <vector>
#include <cstring>
#include <android/log.h>
#include <thread>
#include <algorithm>
#include <sys/resource.h>
#include "llama.h"

#define LOG_TAG "ZEXA_Native"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static llama_model* g_model = nullptr;
static llama_context* g_ctx = nullptr;
static const llama_vocab* g_vocab = nullptr;
static volatile bool g_cancelled = false;

static void ensure_backend_init() {
    static bool backend_initialized = false;
    if (!backend_initialized) {
        llama_backend_init();
        backend_initialized = true;
        LOGI("llama_backend_init() ok");
    }
}

static jboolean internal_init(JNIEnv* env, jstring modelPathJ) {
    try {
        ensure_backend_init();
        if (g_ctx) { llama_free(g_ctx); g_ctx = nullptr; }
        if (g_model) { llama_model_free(g_model); g_model = nullptr; }

        const char* modelPath = env->GetStringUTFChars(modelPathJ, nullptr);
        llama_model_params model_params = llama_model_default_params();
        model_params.n_gpu_layers = 0;

        g_model = llama_model_load_from_file(modelPath, model_params);
        env->ReleaseStringUTFChars(modelPathJ, modelPath);

        if (!g_model) {
            LOGE("Failed to load model");
            return JNI_FALSE;
        }

        g_vocab = llama_model_get_vocab(g_model);
        llama_context_params ctx_params = llama_context_default_params();

        // 🚀 SPEED OPTIMIZATION: Maximize core usage for mobile
        int threads = std::max(2, (int)std::thread::hardware_concurrency());
        if (threads > 4) threads = 4; // Cap at 4 to prevent aggressive thermal throttling

        ctx_params.n_ctx = 2048;
        ctx_params.n_batch = 512;  // Increased from 128 for faster prefill
        ctx_params.n_ubatch = 128; // Increased from 64
        ctx_params.n_threads = threads;
        ctx_params.n_threads_batch = threads;

        // Enable performance flags
        ctx_params.flash_attn_type = LLAMA_FLASH_ATTN_TYPE_ENABLED;

        g_ctx = llama_init_from_model(g_model, ctx_params);
        if (!g_ctx) {
            LOGE("Failed to init context");
            return JNI_FALSE;
        }

        // llama_set_warmup(g_ctx, true); // Removed to avoid potential hang during first decode

        LOGI("Native Engine Ready (Threads: %d)", threads);
        return JNI_TRUE;
    } catch (...) {
        LOGE("Init exception");
        return JNI_FALSE;
    }
}

static void internal_stream(JNIEnv* env, jstring promptJ, jint maxTokens, jobject callback) {
    if (!g_ctx || !g_model) return;
    g_cancelled = false;

    // Priority is handled by the caller thread in Java
    LOGI("Generation started...");

    try {
        // 🎯 RELIABILITY: Ensure KV cache is cleared before every run
        llama_memory_t mem = llama_get_memory(g_ctx);
        if (mem) llama_memory_clear(mem, false);

        const char* prompt = env->GetStringUTFChars(promptJ, nullptr);
        if (!prompt) return;

        std::vector<llama_token> tokens;
        tokens.resize(strlen(prompt) + 16);
        int n_tokens = llama_tokenize(g_vocab, prompt, strlen(prompt), tokens.data(), tokens.size(), false, true);
        if (n_tokens < 0) {
            tokens.resize(-n_tokens);
            n_tokens = llama_tokenize(g_vocab, prompt, strlen(prompt), tokens.data(), tokens.size(), false, true);
        }
        tokens.resize(n_tokens);

        if (tokens.empty()) {
            env->ReleaseStringUTFChars(promptJ, prompt);
            return;
        }

        // PROTOCOL: Speed over Creativity (Deterministic Decoding)
        llama_sampler_chain_params sampler_params = llama_sampler_chain_default_params();
        llama_sampler* smpl = llama_sampler_chain_init(sampler_params);

        // 🎯 STABILITY FIX: Added top_k before penalties to speed up sampling.
        // Capped penalty_last_n to 128 to prevent slow KV cache lookups.
        llama_sampler_chain_add(smpl, llama_sampler_init_top_k(40));
        llama_sampler_chain_add(smpl, llama_sampler_init_temp(0.0f));
        llama_sampler_chain_add(smpl, llama_sampler_init_penalties(128, 1.15f, 0.1f, 0.1f));
        llama_sampler_chain_add(smpl, llama_sampler_init_dist(LLAMA_DEFAULT_SEED));

        // Evaluate prompt
        int n_past = 0;
        const int n_batch = llama_n_batch(g_ctx);
        for (int i = 0; i < (int)tokens.size(); i += n_batch) {
            if (g_cancelled) break;
            int n_eval = std::min(n_batch, (int)tokens.size() - i);

            llama_batch batch = llama_batch_get_one(tokens.data() + i, n_eval);

            // Override pos and seq_id since llama_batch_get_one sets them to NULL
            std::vector<llama_pos> pos(n_eval);
            std::vector<int32_t> n_seq_id(n_eval, 1);
            std::vector<llama_seq_id*> seq_id_ptrs(n_eval);
            std::vector<llama_seq_id> seq_ids(n_eval, 0);
            std::vector<int8_t> logits(n_eval, 0);

            for (int j = 0; j < n_eval; ++j) {
                pos[j] = n_past + j;
                seq_id_ptrs[j] = &seq_ids[j];
            }

            // We NEED logits for the last token of the prompt to sample the first response token
            if (i + n_eval == (int)tokens.size()) {
                logits[n_eval - 1] = 1;
            }

            batch.pos = pos.data();
            batch.n_seq_id = n_seq_id.data();
            batch.seq_id = seq_id_ptrs.data();
            batch.logits = logits.data();

            if (llama_decode(g_ctx, batch) != 0) {
                LOGE("llama_decode failed during prefill");
                break;
            }
            n_past += n_eval;
            LOGI("Prefilled %d/%d tokens", n_past, (int)tokens.size());
        }

        jclass cbClass = env->GetObjectClass(callback);
        jmethodID onTokenMid = env->GetMethodID(cbClass, "onToken", "(Ljava/lang/String;)V");

        int n_gen = 0;
        std::string response = "";
        std::string token_accumulator = "";

        llama_token token = llama_sampler_sample(smpl, g_ctx, -1);
        LOGI("First token sampled: %d", (int)token);

        while (n_gen < maxTokens && !g_cancelled) {
            if (llama_vocab_is_eog(g_vocab, token)) {
                LOGI("EOS reached");
                break;
            }

            char buf[256];
            int n = llama_token_to_piece(g_vocab, token, buf, sizeof(buf), 0, true);
            if (n > 0) {
                std::string piece(buf, n);
                response += piece;
                token_accumulator += piece;

                // 🎯 UTF-8 STABILITY: NewStringUTF crashes on invalid/truncated UTF-8.
                // Multi-byte characters might be split across tokens. We only emit
                // if we have a "safe" boundary (space, newline) or we've accumulated
                // enough that it's likely a full sequence.
                bool is_safe_to_emit = false;
                if (piece.find(' ') != std::string::npos || piece.find('\n') != std::string::npos) {
                    is_safe_to_emit = true;
                } else if (token_accumulator.length() >= 8) {
                    is_safe_to_emit = true;
                }

                if (is_safe_to_emit) {
                    jstring s = env->NewStringUTF(token_accumulator.c_str());
                    if (s) {
                        env->CallVoidMethod(callback, onTokenMid, s);
                        env->DeleteLocalRef(s);
                        token_accumulator = "";
                    }
                }

                if (response.length() > 30) {
                    std::string tail = response.substr(response.length() - 30);
                    if (tail.find("<|im_end|>") != std::string::npos ||
                        tail.find("</s>") != std::string::npos ||
                        tail.find("ZEXA AI:") != std::string::npos ||
                        tail.find("Student:") != std::string::npos) break;
                }
            }

            llama_batch batch = llama_batch_get_one(&token, 1);
            llama_pos p = n_past;
            int32_t ns = 1;
            llama_seq_id sid = 0;
            llama_seq_id* sidp = &sid;
            int8_t logit = 1;

            batch.pos = &p;
            batch.n_seq_id = &ns;
            batch.seq_id = &sidp;
            batch.logits = &logit;

            if (llama_decode(g_ctx, batch) != 0) {
                LOGE("llama_decode failed during generation");
                break;
            }
            n_past++;

            token = llama_sampler_sample(smpl, g_ctx, -1);
            n_gen++;
        }

        // Flush any remaining tokens
        if (!token_accumulator.empty()) {
            jstring s = env->NewStringUTF(token_accumulator.c_str());
            if (s) {
                env->CallVoidMethod(callback, onTokenMid, s);
                env->DeleteLocalRef(s);
            }
        }

        llama_sampler_free(smpl);
        env->ReleaseStringUTFChars(promptJ, prompt);
    } catch (...) {
        LOGE("Stream exception");
    }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_zexa_ai_zimsec_AIManager_initLlamaModel(JNIEnv* env, jobject, jstring modelPathJ) {
    return internal_init(env, modelPathJ);
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_ai_zimsec_AIManager_llamaStream(JNIEnv* env, jobject, jstring promptJ, jint maxTokens, jobject callback) {
    internal_stream(env, promptJ, maxTokens, callback);
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_ai_zimsec_AIManager_setCancelled(JNIEnv*, jobject, jboolean cancelled) {
    g_cancelled = cancelled;
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_ai_zimsec_AIManager_clearKVCache(JNIEnv*, jobject) {
    if (g_ctx) {
        llama_memory_t mem = llama_get_memory(g_ctx);
        if (mem) llama_memory_clear(mem, false);
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_ai_zimsec_AIManager_freeLlamaModel(JNIEnv*, jobject) {
    if (g_ctx) { llama_free(g_ctx); g_ctx = nullptr; }
    if (g_model) { llama_model_free(g_model); g_model = nullptr; }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_zexa_aioffline_data_OfflineAIEngine_initLlamaModel(JNIEnv* env, jobject, jstring modelPathJ) {
    return internal_init(env, modelPathJ);
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_aioffline_data_OfflineAIEngine_llamaStream(JNIEnv* env, jobject, jstring promptJ, jint maxTokens, jobject callback) {
    internal_stream(env, promptJ, maxTokens, callback);
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_aioffline_data_OfflineAIEngine_setCancelled(JNIEnv*, jobject, jboolean cancelled) {
    g_cancelled = cancelled;
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_aioffline_data_OfflineAIEngine_clearKVCache(JNIEnv*, jobject) {
    if (g_ctx) {
        llama_memory_t mem = llama_get_memory(g_ctx);
        if (mem) llama_memory_clear(mem, false);
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_zexa_aioffline_data_OfflineAIEngine_freeLlamaModel(JNIEnv*, jobject) {
    if (g_ctx) { llama_free(g_ctx); g_ctx = nullptr; }
    if (g_model) { llama_model_free(g_model); g_model = nullptr; }
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_zexa_aioffline_util_NativeKeys_getPaynowKey(JNIEnv* env, jobject) {
    std::string k = "5732152d-65b7-45b0-9af4-8e626530c631";
    return env->NewStringUTF(k.c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_zexa_aioffline_util_NativeKeys_getPaynowId(JNIEnv* env, jobject) {
    return env->NewStringUTF("22965");
}
