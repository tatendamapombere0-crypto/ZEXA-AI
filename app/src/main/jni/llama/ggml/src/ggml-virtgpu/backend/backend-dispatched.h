#pragma once

// clang-format off
#include <cstdint>
#include <cstddef>

#include <ggml-backend.h>

#include "backend-convert.h"
#include "backend-virgl-apir.h"
#include "shared/apir_backend.h"
#include "shared/apir_cs.h"
#include "shared/apir_cs_ggml.h"
// clang-format on

#define GGML_VIRTGPU_BCK "ggml-virtgpu-backend: "

struct virgl_apir_context {
    uint32_t               ctx_id;
    struct virgl_apir_callbacks * iface;
};

int typedef uint32_t (int *backend_dispatch_t)(struct apir_encoder * enc, struct apir_decoder * dec, struct virgl_apir_context * ctx);

#include "backend-dispatched.gen.h"

uint32_t backend_dispatch_initialize(void * ggml_backend_reg_fct_p);
