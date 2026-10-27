package com.zexa.aioffline.data.paynow

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

data class InitiatePaymentRequest(
    val userId: String,
    val phoneNumber: String,
    val amount: Double,
    val description: String,
    val reference: String
)

data class InitiatePaymentResponse(
    val success: Boolean,
    val data: PaymentInitData?,
    val error: String?
)

data class PaymentInitData(
    val reference: String,
    val instructions: String,
    val pollUrl: String,
    val phoneNumber: String,
    val amount: Double,
    val description: String
)

data class PollStatusRequest(
    val reference: String,
    val pollUrl: String
)

data class PollStatusResponse(
    val success: Boolean,
    val data: PaymentStatusData?,
    val error: String?
)

data class PaymentStatusData(
    val reference: String,
    val status: String, // "paid", "failed", "pending"
    val paid: Boolean,
    val failed: Boolean,
    val message: String?
)

data class SubscriptionStatusResponse(
    val success: Boolean,
    val data: SubscriptionData?
)

data class SubscriptionData(
    val userId: String,
    val isPremium: Boolean,
    val subscriptionExpiry: String?,
    val lastPayment: String?
)

interface PaynowApiService {
    
    @POST("api/paynow/initiate-ecocash")
    suspend fun initiateEcoCashPayment(
        @Body request: InitiatePaymentRequest
    ): Response<InitiatePaymentResponse>
    
    @POST("api/paynow/poll-status")
    suspend fun pollPaymentStatus(
        @Body request: PollStatusRequest
    ): Response<PollStatusResponse>
    
    @GET("api/paynow/subscription-status/{userId}")
    suspend fun getSubscriptionStatus(
        @Path("userId") userId: String
    ): Response<SubscriptionStatusResponse>
}
