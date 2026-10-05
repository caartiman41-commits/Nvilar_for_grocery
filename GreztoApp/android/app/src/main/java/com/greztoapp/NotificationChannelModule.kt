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

        fun sendNotificationEvent(intent: android.content.Intent?) {
            if (intent == null) return
            val extras = intent.extras ?: return
            val context = activeReactContext ?: return
            try {
                val map = Arguments.createMap()
                for (key in extras.keySet()) {
                    val value = extras.get(key)
                    if (value != null) {
                        map.putString(key, value.toString())
                    }
                }
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit("onNativeNotificationTapped", map)
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
