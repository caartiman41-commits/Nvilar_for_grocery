package com.greztoapp

import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationChannelModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private var activeReactContext: ReactApplicationContext? = null
        private var pendingNotificationExtras: Map<String, String>? = null

        private val NOTIFICATION_KEYS = listOf(
            "from_notification_tap",
            "conversation_id",
            "conversationId",
            "negotiation_id",
            "negotiationId",
            "order_id",
            "orderId",
            "target_role",
            "role",
            "type",
            "product_id",
            "productId",
            "action",
            "click_action",
            "target_screen",
            "shop_id",
            "seller_name",
            "buyer_name"
        )

        fun hasNotificationExtras(intent: android.content.Intent?): Boolean {
            if (intent == null) return false
            val extras = intent.extras ?: return false
            for (key in NOTIFICATION_KEYS) {
                if (extras.containsKey(key)) {
                    return true
                }
            }
            val action = intent.action ?: ""
            return action.startsWith("com.mitreno.app.NOTIFICATION_TAP") ||
                action.startsWith("OPEN_") ||
                action == "FLUTTER_NOTIFICATION_CLICK"
        }

        fun sendNotificationEvent(intent: android.content.Intent?) {
            if (!hasNotificationExtras(intent)) return
            val extras = intent?.extras ?: return
            try {
                val extracted = mutableMapOf<String, String>()
                for (key in extras.keySet()) {
                    val value = extras.get(key)
                    if (value != null) {
                        extracted[key] = value.toString()
                    }
                }
                if (extracted.isEmpty()) return

                // Clear notification keys from intent so resuming from recents doesn't re-trigger
                for (key in NOTIFICATION_KEYS) {
                    intent.removeExtra(key)
                }
                if (intent.action?.startsWith("com.mitreno.app.NOTIFICATION_TAP") == true ||
                    intent.action?.startsWith("OPEN_") == true) {
                    intent.action = android.content.Intent.ACTION_MAIN
                }

                val context = activeReactContext
                if (context != null && context.hasActiveReactInstance()) {
                    pendingNotificationExtras = null
                    val map = Arguments.createMap()
                    for ((k, v) in extracted) {
                        map.putString(k, v)
                    }
                    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onNativeNotificationTapped", map)
                } else {
                    // Store in pendingNotificationExtras only when JS listener isn't mounted yet (cold start)
                    pendingNotificationExtras = extracted
                }
            } catch (e: Exception) {
                android.util.Log.w("NotificationChannelModule", "Failed to emit notification event: ${e.message}")
            }
        }
    }

    init {
        activeReactContext = reactContext
    }

    override fun getName(): String = "NotificationChannelModule"

    @ReactMethod
    fun consumeInitialNotification(promise: Promise) {
        try {
            val pending = pendingNotificationExtras
            pendingNotificationExtras = null
            if (pending != null && pending.isNotEmpty()) {
                val map = Arguments.createMap()
                for ((k, v) in pending) {
                    map.putString(k, v)
                }
                promise.resolve(map)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun initializeChannels(promise: Promise) {
        try {
            NotificationChannelHelper.createNotificationChannels(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CHANNEL_INIT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun areNotificationsEnabled(promise: Promise) {
        try {
            val enabled = NotificationManagerCompat.from(reactContext).areNotificationsEnabled()
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getRegisteredChannels(promise: Promise) {
        try {
            val result: WritableArray = Arguments.createArray()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                val channels = notificationManager?.notificationChannels
                channels?.forEach { channel ->
                    val map: WritableMap = Arguments.createMap()
                    map.putString("id", channel.id)
                    map.putString("name", channel.name?.toString() ?: "")
                    map.putString("description", channel.description ?: "")
                    map.putInt("importance", channel.importance)
                    map.putBoolean("vibrationEnabled", channel.shouldVibrate())
                    map.putInt("lockscreenVisibility", channel.lockscreenVisibility)
                    val patternArray = Arguments.createArray()
                    channel.vibrationPattern?.forEach { patternArray.pushDouble(it.toDouble()) }
                    map.putArray("vibrationPattern", patternArray)
                    result.pushMap(map)
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("CHANNELS_FETCH_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun postNotification(
        channelId: String,
        title: String,
        body: String,
        extrasMap: com.facebook.react.bridge.ReadableMap?,
        promise: Promise
    ) {
        try {
            val extras = mutableMapOf<String, String>()
            extrasMap?.toHashMap()?.forEach { (key, value) ->
                if (value != null) {
                    extras[key] = value.toString()
                }
            }
            val id = NotificationChannelHelper.postNotification(
                context = reactContext,
                channelId = channelId,
                title = title,
                body = body,
                extras = extras
            )
            promise.resolve(id)
        } catch (e: Exception) {
            promise.reject("POST_NOTIFICATION_ERROR", e.message, e)
        }
    }
}
