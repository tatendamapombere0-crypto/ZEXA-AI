package com.zexa.aioffline

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.google.firebase.auth.FirebaseAuth
import com.zexa.ai.zimsec.core.DateGuardCore
import com.zexa.aioffline.data.PreferenceManager
import com.zexa.aioffline.databinding.ActivityMainBinding
import com.zexa.aioffline.ui.AuthActivity

import androidx.lifecycle.lifecycleScope
import com.zexa.aioffline.util.TimeTamperGuard
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var preferenceManager: PreferenceManager
    private var myWebView: WebView? = null
    
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check for time tampering
        if (TimeTamperGuard.checkTimeTampering(this)) {
            setContentView(R.layout.activity_time_locked)
            return
        }

        auth = FirebaseAuth.getInstance()
        
        // Edge-to-Edge
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize hidden webview to intercept Paynow browser redirects
        myWebView = binding.webview
        myWebView?.setWebViewClient(object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (url.contains("paynow.co.zw")) {
                    Log.d("PaynowFix", "Intercepted and blocked external window redirect to: $url")
                    return true
                }
                return super.shouldOverrideUrlLoading(view, request)
            }
        })

        preferenceManager = PreferenceManager(this)

        // 📅 Date Guard Sync moved to onStart

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.navHostFragment) as NavHostFragment
        val navController = navHostFragment.navController
        
        binding.bottomNav.setupWithNavController(navController)

        // Setup Toolbar
        setSupportActionBar(binding.toolbar)
        
        navController.addOnDestinationChangedListener { _, destination, _ ->
            binding.toolbar.title = destination.label
            binding.bottomNav.visibility = View.VISIBLE
            binding.toolbar.visibility = View.VISIBLE
        }
    }

    override fun onStart() {
        super.onStart()

        // ✅ SYNC LOCAL SUBSCRIPTION FLAGS
        lifecycleScope.launch {
            try {
                if (preferenceManager.isPremium.first()) {
                    getSharedPreferences("zexa_sub", android.content.Context.MODE_PRIVATE)
                        .edit().putBoolean("has_paid", true).apply()
                }
            } catch (e: Exception) {}
        }

        // 📅 Date Guard Sync
        val status = DateGuardCore.validateAndSync(this)
        if (status.isTampered) {
            android.widget.Toast.makeText(this, status.message, android.widget.Toast.LENGTH_LONG).show()
            finishAffinity()
            return
        } else if (status.isHoliday) {
            android.widget.Toast.makeText(this, status.message, android.widget.Toast.LENGTH_SHORT).show()
        }

        val currentUser = auth.currentUser
        if (currentUser == null) {
            kickToLogin()
        } else {
            Log.d("MainActivity", "Zexa AI dashboard active for user: ${currentUser.uid}")
        }
    }

    private fun kickToLogin() {
        val intent = Intent(this, AuthActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
    }
}
