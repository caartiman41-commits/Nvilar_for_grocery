package com.greztoapp

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.truecaller.android.sdk.oAuth.TcOAuthCallback
import com.truecaller.android.sdk.oAuth.TcOAuthData
import com.truecaller.android.sdk.oAuth.TcOAuthError
import com.truecaller.android.sdk.oAuth.TcSdk
import com.truecaller.android.sdk.oAuth.TcSdkOptions
import java.math.BigInteger
import java.security.SecureRandom

class TruecallerAuthModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener, TcOAuthCallback {

    private var pendingPromise: Promise? = null
    private var currentState: String? = null
    private var isInitialized = false

    init {
        reactContext.addActivityEventListener(this)
        initializeSdkIfPossible()
    }

    override fun getName(): String = "TruecallerAuth"

    private fun initializeSdkIfPossible() {
        try {
            val tcSdkOptions = TcSdkOptions.Builder(reactContext, this)
                .build()
            TcSdk.initAsync(tcSdkOptions)
            isInitialized = true
            Log.d("TruecallerAuth", "TcSdk initAsync called successfully")
        } catch (e: Exception) {
            Log.w("TruecallerAuth", "Failed to initialize Truecaller SDK: ${e.message}")
            isInitialized = false
        }
    }

    override fun onSdkReady() {
        isInitialized = true
        Log.d("TruecallerAuth", "TcSdk onSdkReady callback received")
    }

    @ReactMethod
    fun isUsable(promise: Promise) {
        try {
            if (!isInitialized) {
                initializeSdkIfPossible()
            }
            val isUsable = try {
                TcSdk.getInstance().isOAuthFlowUsable
            } catch (e: Exception) {
                false
            }
            promise.resolve(isUsable)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun requestOneTapLogin(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Current activity is null")
            return
        }

        val mainActivity = activity as? MainActivity
        if (mainActivity == null) {
            promise.reject("ACTIVITY_INVALID", "Current activity is not MainActivity")
            return
        }

        try {
            if (!isInitialized) {
                initializeSdkIfPossible()
            }

            if (!TcSdk.getInstance().isOAuthFlowUsable) {
                promise.reject("NOT_USABLE", "Truecaller 1-Tap is not usable on this device")
                return
            }

            pendingPromise = promise
            val state = BigInteger(130, SecureRandom()).toString(32)
            currentState = state

            TcSdk.getInstance().setOAuthState(state)
            TcSdk.getInstance().setOAuthScopes(arrayOf("profile", "phone", "openid"))
            TcSdk.getInstance().getAuthorizationCode(mainActivity, mainActivity.truecallerLauncher)
        } catch (e: Exception) {
            pendingPromise = null
            promise.reject("TRUECALLER_TRIGGER_ERROR", e.message ?: "Failed to trigger Truecaller dialog")
        }
    }

    override fun onSuccess(tcOAuthData: TcOAuthData) {
        val promise = pendingPromise ?: return
        pendingPromise = null

        try {
            val result: WritableMap = Arguments.createMap()
            result.putBoolean("success", true)
            result.putString("authCode", tcOAuthData.authorizationCode)
            result.putString("state", tcOAuthData.state)

            try {
                val scopes = tcOAuthData.scopesGranted
                if (scopes != null) {
                    val scopesArray = Arguments.createArray()
                    for (scope in scopes) {
                        scopesArray.pushString(scope)
                    }
                    result.putArray("scopes", scopesArray)
                }
            } catch (_: Exception) {}

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PARSE_ERROR", e.message)
        }
    }

    override fun onFailure(tcOAuthError: TcOAuthError) {
        val promise = pendingPromise ?: return
        pendingPromise = null

        val result: WritableMap = Arguments.createMap()
        result.putBoolean("success", false)
        result.putInt("errorCode", tcOAuthError.errorCode)
        result.putString("errorMessage", tcOAuthError.errorMessage)

        promise.reject("TRUECALLER_ERROR_${tcOAuthError.errorCode}", tcOAuthError.errorMessage, null, result)
    }

    override fun onVerificationRequired(tcOAuthError: TcOAuthError?) {
        val promise = pendingPromise ?: return
        pendingPromise = null

        val result: WritableMap = Arguments.createMap()
        result.putBoolean("success", false)
        result.putBoolean("verificationRequired", true)
        if (tcOAuthError != null) {
            result.putInt("errorCode", tcOAuthError.errorCode)
            result.putString("errorMessage", tcOAuthError.errorMessage)
        }

        promise.reject("VERIFICATION_REQUIRED", "Fallback to OTP required", null, result)
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        try {
            TcSdk.getInstance().onActivityResultObtained(activity, resultCode, data ?: Intent())
        } catch (e: Exception) {
            Log.w("TruecallerAuth", "onActivityResultObtained exception: ${e.message}")
        }
    }

    override fun onNewIntent(intent: Intent) {
        // No-op
    }
}

