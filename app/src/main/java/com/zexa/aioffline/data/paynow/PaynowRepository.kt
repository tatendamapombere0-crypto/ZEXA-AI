package com.zexa.aioffline.data.paynow

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.zexa.aioffline.util.HashUtils
import com.zexa.aioffline.util.NativeKeys
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.logging.HttpLoggingInterceptor
import java.net.URLDecoder
import java.util.Locale
import java.util.concurrent.TimeUnit
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import java.security.cert.X509Certificate

sealed class PaymentResult {
    data class Success(val instructions: String, val pollUrl: String, val reference: String) : PaymentResult()
    data class Error(val message: String) : PaymentResult()
    object NetworkError : PaymentResult()
}

sealed class PaymentStatus {
    object Paid : PaymentStatus()
    object Failed : PaymentStatus()
    object Pending : PaymentStatus()
    data class Unknown(val message: String?) : PaymentStatus()
}

class PaynowRepository {

    private val TAG = "PaynowRepo"

    private val client: OkHttpClient by lazy {
        createClient(false)
    }

    private fun createClient(unsafe: Boolean = false): OkHttpClient {
        val logging = HttpLoggingInterceptor { message ->
            Log.d(TAG, "OkHttp: $message")
        }.apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        val builder = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)

        if (unsafe) {
            try {
                val trustAllCerts = arrayOf<TrustManager>(
                    object : X509TrustManager {
                        override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                        override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                        override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
                    }
                )
                val sslContext = SSLContext.getInstance("SSL")
                sslContext.init(null, trustAllCerts, java.security.SecureRandom())
                builder.sslSocketFactory(sslContext.socketFactory, trustAllCerts[0] as X509TrustManager)
                builder.hostnameVerifier { _, _ -> true }
            } catch (e: Exception) {
                Log.e(TAG, "SSL Setup failed", e)
            }
        }
        return builder.build()
    }

    // ✅ MUST BE SUSPEND TO USE withContext
    suspend fun initiateEcoCashPayment(
        userId: String,
        phoneNumber: String,
        amount: Double,
        description: String
    ): PaymentResult = withContext(Dispatchers.IO) {
        try {
            return@withContext performPaymentRequest(userId, phoneNumber, amount, description, false)
        } catch (e: javax.net.ssl.SSLHandshakeException) {
            Log.w(TAG, "SSL Failed, retrying with lenient client (likely date issue)...")
            try {
                return@withContext performPaymentRequest(userId, phoneNumber, amount, description, true)
            } catch (e2: Exception) {
                return@withContext PaymentResult.Error("DATE ERROR: Please set your phone to the correct Date/Time. (SSL Chain Failed)")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Payment Exception", e)
            val msg = if (e.message?.contains("Chain validation failed") == true)
                "DATE ERROR: Set your phone to the correct current time."
            else "Network Error: ${e.localizedMessage}"
            return@withContext PaymentResult.Error(msg)
        }
    }

    private suspend fun performPaymentRequest(
        userId: String,
        phoneNumber: String,
        amount: Double,
        description: String,
        unsafe: Boolean
    ): PaymentResult {
        val activeClient = if (unsafe) createClient(true) else client
        val integrationId = NativeKeys.getPaynowId()
        val integrationKey = NativeKeys.getPaynowKey()
        val reference = "ZEXA_${userId}_${System.currentTimeMillis()}"

        // ✅ GET STUDENT'S ACTUAL EMAIL FROM FIREBASE AUTH
        val authEmail = FirebaseAuth.getInstance().currentUser?.email ?: "info@zexacoreai.com"

        // ✅ FIELDS IN EXACT ORDER PAYNOW EXPECTS FOR HASH GENERATION
        val fields = linkedMapOf(
            "id" to integrationId,
            "reference" to reference,
            "amount" to "%.2f".format(Locale.US, amount),
            "additionalinfo" to "ZEXA AI Premium",
            "returnurl" to "https://zexa.ai/api/paynow/return",
            "resulturl" to "https://zexa.ai/api/paynow/result",
            "authemail" to authEmail, // ✅ CORRECTLY MAPPED
            "status" to "Message",
            "phone" to phoneNumber,
            "method" to "ecocash"
        )

        val hash = HashUtils.generateOrderedPaynowHash(fields, integrationKey)

        val formBuilder = FormBody.Builder()
        fields.forEach { (k, v) -> formBuilder.add(k, v) }
        formBuilder.add("hash", hash)

        val request = Request.Builder()
            .url("https://www.paynow.co.zw/interface/remotetransaction")
            .post(formBuilder.build())
            .build()

        val response = activeClient.newCall(request).execute()
        val body = response.body?.string() ?: ""

        if (response.isSuccessful) {
            val parsed = parsePaynowResponse(body)
            if (parsed["status"]?.equals("ok", ignoreCase = true) == true) {
                return PaymentResult.Success(
                    instructions = "Please check your phone for the EcoCash prompt.",
                    pollUrl = parsed["pollurl"] ?: "",
                    reference = reference
                )
            } else {
                return PaymentResult.Error(parsed["error"] ?: "Paynow Error: $body")
            }
        } else {
            return PaymentResult.Error("Server Error: ${response.code}")
        }
    }

    private fun parsePaynowResponse(response: String): Map<String, String> {
        val result = mutableMapOf<String, String>()
        try {
            response.split("&").forEach { pair ->
                val parts = pair.split("=")
                if (parts.size == 2) {
                    result[parts[0]] = URLDecoder.decode(parts[1], "UTF-8")
                }
            }
        } catch (e: Exception) {}
        return result
    }

    suspend fun pollPaymentStatus(pollUrl: String): PaymentStatus = withContext(Dispatchers.IO) {
        if (pollUrl.isBlank()) return@withContext PaymentStatus.Unknown("Empty poll URL")
        try {
            val request = Request.Builder().url(pollUrl).build()
            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            val parsed = parsePaynowResponse(body)
            when (parsed["status"]?.lowercase()) {
                "paid", "awaiting delivery", "delivered" -> PaymentStatus.Paid
                "failed", "cancelled" -> PaymentStatus.Failed
                else -> PaymentStatus.Pending
            }
        } catch (e: Exception) {
            PaymentStatus.Unknown(e.message)
        }
    }

    suspend fun pollUntilComplete(
        pollUrl: String,
        maxAttempts: Int = 40,
        intervalMs: Long = 3000
    ): PaymentStatus {
        repeat(maxAttempts) { attempt ->
            val status = pollPaymentStatus(pollUrl)
            when (status) {
                is PaymentStatus.Paid, is PaymentStatus.Failed -> return@pollUntilComplete status
                else -> {
                    if (attempt < maxAttempts - 1) {
                        delay(intervalMs)
                    }
                }
            }
        }
        return PaymentStatus.Unknown("Polling timeout")
    }
}