package com.zexa.aioffline.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.zexa.aioffline.R
import com.zexa.aioffline.ui.fragments.PremiumSettingsFragment

class PaymentActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment)

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, PremiumSettingsFragment())
                .commit()
        }
    }
}
