package com.greztoapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class MitrenoPushReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "MitrenoPushReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val extras = intent.extras ?: return

        try {
            val map = HashMap<String, String>()
            for (key in extras.keySet()) {
                val value = extras.get(key)
                if (value != null) {
                    map[key] = value.toString()
                }
            }

            val title = map["title"] ?: "Mitreno"
            val body = map["body"] ?: ""
            val imageUrl = map["image_url"] ?: map["imageUrl"]
            val productId = map["product_id"] ?: ""
            val actionLabel = map["action_label"] ?: ""
            val channelId = map["channel_id"] ?: NotificationChannelHelper.CHANNEL_ID_BUYER

            val isPromoOrAction = !imageUrl.isNullOrEmpty() || productId.isNotEmpty() || actionLabel.isNotEmpty()

            if (isPromoOrAction) {
                Log.d(TAG, "Intercepted rich promo notification: '$title', image: '$imageUrl', product: '$productId'")

                NotificationChannelHelper.postNotification(
                    context = context.applicationContext ?: context,
                    channelId = channelId,
                    title = title,
                    body = body,
                    extras = map
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing incoming push broadcast: ${e.message}", e)
        }
    }
}
