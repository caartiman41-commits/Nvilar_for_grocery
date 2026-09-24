package com.greztoapp

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.truecaller.android.sdk.oAuth.CodeVerifierUtil
import com.truecaller.android.sdk.oAuth.TcOAuthCallback
import com.truecaller.android.sdk.oAuth.TcOAuthData
import com.truecaller.android.sdk.oAuth.TcOAuthError
import com.truecaller.android.sdk.oAuth.TcSdk
import com.truecaller.android.sdk.oAuth.TcSdkOptions
import com.truecaller.android.sdk.oAuth.UtilsV2
import java.math.BigInteger
import java.security.SecureRandom

class TruecallerAuthModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener, TcOAuthCallback {

    private var pendingPromise: Promise? = null
    private var currentState: String? = null
    private var currentCodeVerifier: String? = null
    private var isInitialized = false

    init {
        reactContext.addActivityEventListener(this)
        initializeSdkIfPossible()
    }

    override fun getName(): String = "TruecallerAuth"

    private fun initializeSdkIfPossible() {
        try {
            val tcSdkOptions = TcSdkOptions.Builder(reactContext, this)
                .consentMode(TcSdkOptions.CONSENT_MODE_BOTTOMSHEET)
                .footerType(TcSdkOptions.FOOTER_TYPE_ANOTHER_METHOD)
                .sdkOptions(TcSdkOptions.OPTION_VERIFY_ONLY_TC_USERS)
                .buttonShapeOptions(TcSdkOptions.BUTTON_SHAPE_ROUNDED)
                .buttonColor(Color.parseColor("#000000"))
                .buttonTextColor(Color.parseColor("#FFFFFF"))
                .ctaText(TcSdkOptions.CTA_TEXT_CONTINUE)
                .consentHeadingOption(TcSdkOptions.SDK_CONSENT_HEADING_LOG_IN_TO)
                .build()
            TcSdk.initAsync(tcSdkOptions)
            Log.d("TruecallerAuth", "TcSdk initAsync called successfully with BottomSheet config")
        } catch (e: Exception) {
            Log.w("TruecallerAuth", "Failed to initialize Truecaller SDK: ${e.message}")
            isInitialized = false
        }
    }

    override fun onSdkReady() {
        isInitialized = true
        Log.d("TruecallerAuth", "TcSdk onSdkReady callback received - SDK initialized & ready")
    }

    private fun isTruecallerInstalled(): Boolean {
        return try {
            reactContext.packageManager.getPackageInfo("com.truecaller", 0)
            true
        } catch (_: Exception) {
            false
        }
    }

    @ReactMethod
    fun isUsable(promise: Promise) {
        try {
            if (!isInitialized) {
                initializeSdkIfPossible()
            }
            val installed = isTruecallerInstalled()
            val usable = try {
                TcSdk.getInstance().isOAuthFlowUsable
            } catch (e: Exception) {
                false
            }
            val map = Arguments.createMap()
            map.putBoolean("isUsable", usable)
            map.putBoolean("isInstalled", installed)
            promise.resolve(map)
        } catch (e: Exception) {
            val map = Arguments.createMap()
            map.putBoolean("isUsable", false)
            map.putBoolean("isInstalled", isTruecallerInstalled())
            promise.resolve(map)
        }
    }

    @ReactMethod
    fun getDiagnostics(promise: Promise) {
        try {
            val map = Arguments.createMap()
            map.putString("packageName", reactContext.packageName)
            val sha1 = try {
                UtilsV2.getApplicationSignature(reactContext) ?: "UNKNOWN"
            } catch (e: Exception) {
                e.message ?: "ERROR"
            }
            map.putString("appSha1", sha1)
            val appInfo = reactContext.packageManager.getApplicationInfo(reactContext.packageName, android.content.pm.PackageManager.GET_META_DATA)
            val clientId = appInfo.metaData?.getString("com.truecaller.android.sdk.ClientId") ?: "NOT_FOUND"
            map.putString("clientId", clientId)
            map.putBoolean("isInstalled", isTruecallerInstalled())
            val isUsable = try {
                TcSdk.getInstance().isOAuthFlowUsable
            } catch (_: Exception) {
                false
            }
            map.putBoolean("isOAuthUsable", isUsable)
            map.putBoolean("isInitialized", isInitialized)
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("DIAGNOSTICS_ERROR", e.message)
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

        mainActivity.runOnUiThread {
            try {
                if (!isInitialized) {
                    initializeSdkIfPossible()
                }

                val installed = isTruecallerInstalled()
                if (!installed) {
                    promise.reject("NOT_INSTALLED", "Truecaller app is not installed on this device")
                    return@runOnUiThread
                }

                val usable = try {
                    TcSdk.getInstance().isOAuthFlowUsable
                } catch (e: Exception) {
                    false
                }

                Log.d("TruecallerAuth", "requestOneTapLogin: usable=$usable, isTruecallerInstalled=$installed")

                if (!usable) {
                    promise.reject(
                        "NOT_LOGGED_IN",
                        "Truecaller is installed, but no active logged-in profile was detected in Truecaller app."
                    )
                    return@runOnUiThread
                }

                pendingPromise = promise
                val state = BigInteger(130, SecureRandom()).toString(32)
                currentState = state

                val codeVerifier = CodeVerifierUtil.generateRandomCodeVerifier()
                val codeChallenge = CodeVerifierUtil.getCodeChallenge(codeVerifier)
                if (codeChallenge.isNullOrEmpty()) {
                    pendingPromise = null
                    promise.reject("CODE_CHALLENGE_ERROR", "Failed to generate code challenge")
                    return@runOnUiThread
                }
                currentCodeVerifier = codeVerifier

                TcSdk.getInstance().setOAuthState(state)
                TcSdk.getInstance().setOAuthScopes(arrayOf("profile", "phone", "openid"))
                TcSdk.getInstance().setCodeChallenge(codeChallenge)

                Log.d("TruecallerAuth", "Triggering Truecaller SDK getAuthorizationCode on UI Thread...")
                TcSdk.getInstance().getAuthorizationCode(mainActivity, mainActivity.truecallerLauncher)
            } catch (e: Exception) {
                pendingPromise = null
                Log.e("TruecallerAuth", "Error launching Truecaller: ${e.message}", e)
                promise.reject("TRUECALLER_TRIGGER_ERROR", e.message ?: "Failed to trigger Truecaller dialog")
            }
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
            result.putString("codeVerifier", currentCodeVerifier)

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

        Log.w("TruecallerAuth", "Truecaller onFailure: code=${tcOAuthError.errorCode}, message=${tcOAuthError.errorMessage}")
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

        Log.w("TruecallerAuth", "Truecaller onVerificationRequired: ${tcOAuthError?.errorMessage}")
        promise.reject("VERIFICATION_REQUIRED", tcOAuthError?.errorMessage ?: "Fallback to OTP required", null, result)
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
