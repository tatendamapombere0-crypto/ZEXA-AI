package com.zexa.ai.zimsec

import android.app.Application
import com.google.android.gms.security.ProviderInstaller
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.zexa.ai.zimsec.core.DateGuardCore
import com.zexa.aioffline.data.ModelDownloader
import com.zexa.aioffline.data.PreferenceManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class ZEXAApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Fix for SSL/TLS Trust Anchor issues on older Android versions
        try {
            ProviderInstaller.installIfNeeded(this)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        DateGuardCore.init(this)

        // Enable Firestore offline persistence
        val db = FirebaseFirestore.getInstance()
        val settings = FirebaseFirestoreSettings.Builder()
            .setPersistenceEnabled(true)
            .build()
        db.firestoreSettings = settings

        // ✅ AI READY: INSTANT INITIALIZATION ON APP START
        // 🛑 WE MOVED THIS TO BE LAZY OR BACKGROUNDED TO PREVENT SYSTEM UI FREEZE
        /*
        CoroutineScope(Dispatchers.Default).launch {
            try {
                val prefs = PreferenceManager(this@ZEXAApplication)
                val selectedModelName = prefs.selectedModel.first() ?: ModelDownloader.MODEL_0_5B.fileName
                val modelToLoad = if (selectedModelName == ModelDownloader.MODEL_1_5B.fileName) {
                    ModelDownloader.MODEL_1_5B
                } else {
                    ModelDownloader.MODEL_0_5B
                }
                val modelFile = ModelDownloader.getModelFile(this@ZEXAApplication, modelToLoad)
                if (modelFile.exists() && modelFile.length() > 50_000_000L) {
                    // RUN INITIALIZATION IN BACKGROUND THREAD TO AVOID SYSTEM UI FREEZE
                    AIManager.initializeBrain(this@ZEXAApplication, modelFile.absolutePath)
                }
            } catch (e: Exception) {
                // Silent error handling
            }
        }
        */
    }
}
