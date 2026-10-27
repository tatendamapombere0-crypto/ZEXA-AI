# ==========================================
# ZEXA AI - CRITICAL PROGUARD RULES
# ==========================================

# ✅ 1. KEEP ALL NATIVE METHODS (Prevents Native Crash)
-keepclasseswithmembernames class * {
    native <methods>;
}
-keep class com.zexa.aioffline.data.OfflineAIEngine { *; }
-keep class com.zexa.ai.zimsec.AIManager { *; }
-keep interface com.zexa.aioffline.data.OfflineAIEngine$TokenCallback { *; }
-keep interface com.zexa.ai.zimsec.AIManager$TokenCallback { *; }

# ✅ 2. KEEP ALL AI MODEL CLASSES (Prevents Data Corruption)
-keep class com.zexa.ai.** { *; }
-keep class com.zexa.aioffline.data.** { *; }
-keep class com.zexa.aioffline.viewmodel.** { *; }
-keep class * extends androidx.lifecycle.ViewModel { *; }

# ✅ 3. KEEP KOTLIN COROUTINES (Prevents Async Crashes)
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** { volatile <fields>; }
-keep class kotlinx.coroutines.** { *; }

# ✅ 4. KEEP FIREBASE & GOOGLE SERVICES
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**

# ✅ 5. KEEP RETROFIT, OKHTTP & GSON (Prevents PayNow Crash)
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory

# ✅ 6. KEEP ALL DATA CLASSES FOR FIRESTORE SERIALIZATION
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# ✅ 7. KEEP ZEXA SECURITY CORE
-keep class com.zexa.ai.zimsec.core.** { *; }
-keep class com.zexa.aioffline.util.** { *; }
-keep class com.zexa.aioffline.data.paynow.** { *; }

# ✅ 8. KEEP ANDROIDX & MATERIAL DESIGN
-keep class androidx.** { *; }
-keep class com.google.android.material.** { *; }

# ✅ 9. KEEP ALL CLASSES WITH SERIALIZED FIELDS
-keepattributes *Annotation*
-keepclasseswithmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ✅ 10. KEEP PARCELABLE CLASSES
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}
# Ignore missing javax.lang.model classes (not needed at runtime)
-dontwarn javax.lang.model.**
-dontwarn autovalue.shaded.com.squareup.**

# Keep necessary classes
-keep class javax.lang.model.** { *; }
-keep class com.squareup.javapoet.** { *; }