package com.zexa.aioffline.data.paynow

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // ⚠️ SECURE BACKEND URL: Replace this with your actual deployed Node.js backend URL
    // Do NOT use Paynow direct URL here unless your backend is hosted there (unlikely)
    private const val BASE_URL = "https://your-deployed-backend.com/"

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val paynowApiService: PaynowApiService by lazy {
        retrofit.create(PaynowApiService::class.java)
    }
}
