plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    alias(libs.plugins.google.services)
}

android {
    namespace = "com.zexa.aioffline"
    compileSdk = 34
    ndkVersion = "26.1.10909125"

    defaultConfig {
        applicationId = "com.zexa.ai.zimsec"
        minSdk = 21
        targetSdk = 34

        ndk {
            abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a"))
        }

        versionCode = 6
        versionName = "2.7"
        vectorDrawables.useSupportLibrary = true

        externalNativeBuild {
            cmake {
                cppFlags += "-std=c++17 -fexceptions -frtti -O3 -fno-finite-math-only"
                arguments += "-DGGML_METAL=OFF"
                arguments += "-DGGML_CUDA=OFF"
                arguments += "-DGGML_VULKAN=OFF"
                arguments += "-DGGML_OPENMP=OFF"
                arguments += "-DBUILD_SHARED_LIBS=OFF"
            }
        }
    }

    // ✅ SECURITY CONFIGURATION (PROGUARD/R8) - RE-ENABLED
    buildTypes {
        release {
            isMinifyEnabled = true       // ✅ Scrambles the code to hide keys
            isShrinkResources = false    // 🛑 Disabled to prevent 400MB asset corruption
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false      // Keep debug builds fast
            isShrinkResources = false
        }
    }

    buildFeatures {
        viewBinding = true
    }

    @Suppress("UnstableApiUsage")
    androidResources {
        noCompress += "gguf"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
        isCoreLibraryDesugaringEnabled = true
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/jni/CMakeLists.txt")
            version = "4.1.2"
        }
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
    
    // ✅ ENSURE APK CAN BE MAPPED DIRECTLY IN MEMORY
    bundle {
        language { enableSplit = false }
        density { enableSplit = false }
        abi { enableSplit = false }
    }
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.4")

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.core:core:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.navigation:navigation-fragment-ktx:2.7.7")
    implementation("androidx.navigation:navigation-ui-ktx:2.7.7")
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    implementation("io.noties.markwon:core:4.6.2")
    implementation("io.noties.markwon:ext-strikethrough:4.6.2")
    implementation("io.noties.markwon:ext-tables:4.6.2")

    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")
    implementation("com.google.mediapipe:tasks-genai:0.10.14")
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    implementation(libs.play.services.base)

    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.analytics)
    implementation(libs.firebase.auth)
    implementation(libs.firebase.firestore)
    implementation(libs.firebase.ui.auth)
}

configurations.all {
    resolutionStrategy {
        force("androidx.core:core:1.13.1")
        force("androidx.core:core-ktx:1.13.1")
        force("androidx.activity:activity:1.9.3")
        force("androidx.activity:activity-ktx:1.9.3")
    }
    exclude(group = "junit")
    exclude(group = "androidx.test")
    exclude(group = "org.mockito")
}