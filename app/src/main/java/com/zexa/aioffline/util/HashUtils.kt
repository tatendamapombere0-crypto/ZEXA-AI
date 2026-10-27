package com.zexa.aioffline.util

import android.util.Base64
import java.security.MessageDigest
import java.util.*
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object HashUtils {
    fun sha512(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-512").digest(input.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }.uppercase(Locale.ROOT)
    }

    /**
     * Standard Paynow Hash (Concatenation + SHA512)
     * This version sorts fields alphabetically.
     */
    fun generatePaynowHash(fields: Map<String, String>, integrationKey: String): String {
        val sortedKeys = fields.keys.filter { it != "hash" }.sorted()
        val sb = StringBuilder()
        for (key in sortedKeys) {
            sb.append(fields[key])
        }
        sb.append(integrationKey.trim())
        val toHash = sb.toString()
        return sha512(toHash)
    }

    /**
     * Generate hash from fields in the order they are provided in the map.
     */
    fun generateOrderedPaynowHash(fields: Map<String, String>, integrationKey: String): String {
        val sb = StringBuilder()
        for ((key, value) in fields) {
            if (key.lowercase(Locale.ROOT) != "hash") {
                sb.append(value)
            }
        }
        sb.append(integrationKey.trim())
        return sha512(sb.toString())
    }

    /**
     * New Paynow Hash (HMAC-SHA512 of Query String)
     * Returns Hex string (uppercase)
     */
    fun generatePaynowHmacHexHash(queryString: String, integrationKey: String): String {
        val mac = Mac.getInstance("HmacSHA512")
        val secretKey = SecretKeySpec(integrationKey.toByteArray(), "HmacSHA512")
        mac.init(secretKey)
        val hash = mac.doFinal(queryString.toByteArray())
        return hash.joinToString("") { "%02x".format(it) }.uppercase(Locale.ROOT)
    }
}
