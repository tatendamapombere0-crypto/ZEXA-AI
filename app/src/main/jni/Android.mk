LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := llama
LOCAL_SRC_FILES := \
    llama_wrapper.cpp

include $(BUILD_SHARED_LIBRARY)
