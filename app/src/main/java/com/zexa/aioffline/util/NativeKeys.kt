package com.zexa.aioffline.util

object NativeKeys {
    init {
        // Assuming we add this to the existing llama_wrapper or a new lib
        System.loadLibrary("llama_wrapper") 
    }
    
    external fun getPaynowKey(): String
    external fun getPaynowId(): String
}
