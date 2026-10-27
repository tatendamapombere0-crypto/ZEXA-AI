cmake_minimum_required(VERSION 3.18)
project(llama_wrapper)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ✅ Multi-architecture support: UNIVERSAL compatibility (Android 7+)
if(${ANDROID_ABI} STREQUAL "arm64-v8a")
    set(GGML_CPU_ARM_ARCH "armv8-a")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -fno-finite-math-only -funroll-loops")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -fexceptions -fno-finite-math-only -funroll-loops")
    set(GGML_LLAMAFILE "ON" CACHE BOOL "")
elseif(${ANDROID_ABI} STREQUAL "armeabi-v7a")
    set(GGML_CPU_ARM_ARCH "armv7-a")
    # Disable FP16 and LLAMAFILE for 32-bit to ensure maximum compatibility and fix build errors
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -mfpu=neon -mfloat-abi=softfp -fno-finite-math-only -funroll-loops")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -fexceptions -mfpu=neon -mfloat-abi=softfp -fno-finite-math-only -funroll-loops")
    add_definitions(-DGGML_NO_FP16)
    set(GGML_LLAMAFILE "OFF" CACHE BOOL "" FORCE)
endif()

set(GGML_OPENMP "OFF" CACHE BOOL "")
set(GGML_NATIVE "OFF" CACHE BOOL "")

add_subdirectory(llama)

add_library(llama_wrapper SHARED
    llama_wrapper.cpp
)

target_link_libraries(llama_wrapper
    llama
    android
    log
)

target_compile_options(llama PRIVATE
    -DGGML_METAL=OFF
    -DGGML_CUDA=OFF
    -DGGML_VULKAN=OFF
    -DGGML_OPENMP=OFF
    -DGGML_NEON=ON
    -O3
    -fno-finite-math-only
)
