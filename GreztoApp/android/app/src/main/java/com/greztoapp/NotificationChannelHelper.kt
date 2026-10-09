package com.greztoapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

object NotificationChannelHelper {
    private const val TAG = "NotificationChannels"
    private val executor = Executors.newCachedThreadPool()

    const val CHANNEL_ID_SELLER = "mitreno_seller_channel"
    const val CHANNEL_NAME_SELLER = "Boutique Inquiries & Customer Deals"
    const val CHANNEL_DESC_SELLER = "High priority alerts for incoming customer inquiries and bargain offers"

    const val CHANNEL_ID_BUYER = "mitreno_buyer_channel"
    const val CHANNEL_NAME_BUYER = "Boutique Replies & Orders"
    const val CHANNEL_DESC_BUYER = "Alerts when a boutique seller replies to your inquiry or accepts your deal"

    const val CHANNEL_ID_ORDERS = "mitreno_orders_channel"
    const val CHANNEL_NAME_ORDERS = "Order Status & Deliveries"
    const val CHANNEL_DESC_ORDERS = "Real-time updates regarding order status, tracking, and courier delivery"

    // Vibration patterns (milliseconds)
    // Double-pulse urgent rhythm: [0ms delay, 250ms vibrate, 200ms sleep, 250ms vibrate]
    val SELLER_VIBRATION_PATTERN = longArrayOf(0L, 250L, 200L, 250L)

    // Single smooth wave: [0ms delay, 400ms vibrate]
    val BUYER_VIBRATION_PATTERN = longArrayOf(0L, 400L)

    // Order status pulse: [0ms delay, 300ms vibrate, 150ms sleep, 300ms vibrate]
    val ORDERS_VIBRATION_PATTERN = longArrayOf(0L, 300L, 150L, 300L)

    /**
     * Initializes Android O+ (API 26+) notification channels with custom vibration and priority settings.
     * Ensures reliable vibration, heads-up peeking, and lockscreen previews during screen-off states.
     */
    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        try {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            if (notificationManager == null) {
                Log.w(TAG, "NotificationManager not available")
                return
            }

            // AudioAttributes configured with USAGE_NOTIFICATION_COMMUNICATION_REQUEST to ensure
            // highest audibility and immediate sound playback even in locked/screen-off conditions
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build()

            // Resolve sound for Seller Channel: cash_chime or default system notification sound
            val cashChimeResId = context.resources.getIdentifier("cash_chime", "raw", context.packageName)
            val sellerSoundUri: Uri = if (cashChimeResId != 0) {
                Uri.parse("android.resource://${context.packageName}/raw/cash_chime")
            } else {
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            }

            // Resolve sound for Buyer Channel: luxury_chime or default system notification sound
            val luxuryChimeResId = context.resources.getIdentifier("luxury_chime", "raw", context.packageName)
            val buyerSoundUri: Uri = if (luxuryChimeResId != 0) {
                Uri.parse("android.resource://${context.packageName}/raw/luxury_chime")
            } else {
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            }

            val defaultSoundUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

            // Channel 1: mitreno_seller_channel (Boutique Inquiries & Customer Deals)
            // IMPORTANCE_HIGH + NotificationCompat.VISIBILITY_PUBLIC + Double-pulse vibration
            val sellerChannel = NotificationChannel(
                CHANNEL_ID_SELLER,
                CHANNEL_NAME_SELLER,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESC_SELLER
                enableVibration(true)
                vibrationPattern = SELLER_VIBRATION_PATTERN
                enableLights(true)
                lightColor = Color.parseColor("#28488A") // Mitreno Crimson Brand Accent
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setSound(sellerSoundUri, audioAttributes)
            }

            // Channel 2: mitreno_buyer_channel (Boutique Replies & Orders)
            // IMPORTANCE_HIGH + NotificationCompat.VISIBILITY_PUBLIC + Single smooth wave vibration
            val buyerChannel = NotificationChannel(
                CHANNEL_ID_BUYER,
                CHANNEL_NAME_BUYER,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESC_BUYER
                enableVibration(true)
                vibrationPattern = BUYER_VIBRATION_PATTERN
                enableLights(true)
                lightColor = Color.parseColor("#1B1B1B") // Sleek Charcoal Accent
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setSound(buyerSoundUri, audioAttributes)
            }

            // Channel 3: mitreno_orders_channel (Order Status & Deliveries)
            val ordersChannel = NotificationChannel(
                CHANNEL_ID_ORDERS,
                CHANNEL_NAME_ORDERS,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESC_ORDERS
                enableVibration(true)
                vibrationPattern = ORDERS_VIBRATION_PATTERN
                enableLights(true)
                lightColor = Color.parseColor("#2E7D32")
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setSound(defaultSoundUri, audioAttributes)
            }

            notificationManager.createNotificationChannels(listOf(sellerChannel, buyerChannel, ordersChannel))
            Log.d(TAG, "Grezto notification channels successfully registered with NotificationCompat.VISIBILITY_PUBLIC: $CHANNEL_ID_SELLER, $CHANNEL_ID_BUYER, $CHANNEL_ID_ORDERS")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create notification channels: ${e.message}", e)
        }
    }

    /**
     * Builds a NotificationCompat.Builder pre-configured with:
     * - NotificationCompat.VISIBILITY_PUBLIC (Lockscreen preview visible with screen off)
     * - NotificationCompat.PRIORITY_HIGH & IMPORTANCE_HIGH (Heads-up peeking behavior)
     * - Distinct vibration patterns: Seller [0, 250, 200, 250], Buyer [0, 400]
     * - Standard monochrome small icon (ic_notification) and Grezto Gold colored badge
     */
    fun buildNotification(
        context: Context,
        channelId: String,
        title: String,
        body: String,
        extras: Map<String, String>? = null,
        bigPictureBitmap: Bitmap? = null
    ): NotificationCompat.Builder {
        val resolvedChannelId = when (channelId) {
            CHANNEL_ID_BUYER -> CHANNEL_ID_BUYER
            CHANNEL_ID_ORDERS -> CHANNEL_ID_ORDERS
            else -> CHANNEL_ID_SELLER
        }

        val vibrationPattern = when (resolvedChannelId) {
            CHANNEL_ID_BUYER -> BUYER_VIBRATION_PATTERN
            CHANNEL_ID_ORDERS -> ORDERS_VIBRATION_PATTERN
            else -> SELLER_VIBRATION_PATTERN
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            this.action = "com.mitreno.app.NOTIFICATION_TAP_${System.currentTimeMillis()}"
            this.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("from_notification_tap", "true")
            extras?.forEach { (key, value) ->
                putExtra(key, value)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            (System.currentTimeMillis() % 100000).toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val smallIconResId = context.resources.getIdentifier("ic_notification", "drawable", context.packageName)
            .let { if (it != 0) it else android.R.drawable.ic_dialog_info }

        val colorResId = context.resources.getIdentifier("notification_color", "color", context.packageName)
        val accentColor = if (colorResId != 0) ContextCompat.getColor(context, colorResId) else Color.parseColor("#28488A")

        val largeIconResId = context.resources.getIdentifier("ic_notification_large", "drawable", context.packageName)
            .let { if (it != 0) it else context.resources.getIdentifier("ic_launcher", "mipmap", context.packageName) }
        val largeIcon = if (largeIconResId != 0) BitmapFactory.decodeResource(context.resources, largeIconResId) else null

        val builder = NotificationCompat.Builder(context, resolvedChannelId)
            .setSmallIcon(smallIconResId)
            .setColor(accentColor)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setVibrate(vibrationPattern)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_LIGHTS)

        if (largeIcon != null) {
            builder.setLargeIcon(largeIcon)
        }

        // Apply BigPictureStyle if product hero image is decoded
        if (bigPictureBitmap != null) {
            val bigPicStyle = NotificationCompat.BigPictureStyle()
                .bigPicture(bigPictureBitmap)
                .setBigContentTitle(title)
                .setSummaryText(body)
            if (largeIcon != null) {
                bigPicStyle.bigLargeIcon(largeIcon)
            }
            builder.setStyle(bigPicStyle)
        } else {
            builder.setStyle(NotificationCompat.BigTextStyle().bigText(body))
        }

        // Action Buttons: E-Commerce "Shop Now" and "Visit Now"
        val isPromoOrProduct = extras?.containsKey("image_url") == true ||
                extras?.containsKey("imageUrl") == true ||
                extras?.containsKey("product_id") == true ||
                extras?.containsKey("action_label") == true ||
                bigPictureBitmap != null

        if (isPromoOrProduct) {
            val primaryActionLabel = extras?.get("action_label") ?: "🛍️ Shop Now"
            val secondaryActionLabel = extras?.get("action_secondary") ?: "✨ Visit Now"
            val productId = extras?.get("product_id") ?: ""

            // Primary Action: Shop Now
            val shopIntent = Intent(context, MainActivity::class.java).apply {
                this.flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("action", "SHOP_NOW")
                putExtra("product_id", productId)
                putExtra("target_screen", "ProductDetails")
                extras?.forEach { (key, value) -> putExtra(key, value) }
            }
            val shopPendingIntent = PendingIntent.getActivity(
                context,
                (System.currentTimeMillis() % 10000).toInt() + 10,
                shopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            builder.addAction(smallIconResId, primaryActionLabel, shopPendingIntent)

            // Secondary Action: Visit Now / Explore
            val visitIntent = Intent(context, MainActivity::class.java).apply {
                this.flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("action", "VISIT_NOW")
                putExtra("target_screen", "Explore")
                extras?.forEach { (key, value) -> putExtra(key, value) }
            }
            val visitPendingIntent = PendingIntent.getActivity(
                context,
                (System.currentTimeMillis() % 10000).toInt() + 20,
                visitIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            builder.addAction(0, secondaryActionLabel, visitPendingIntent)
        }

        return builder
    }

    /**
     * Posts a notification to the system tray with screen-off visibility, heads-up peeking,
     * signature haptic vibration, BigPictureStyle product images, and action buttons.
     */
    fun postNotification(
        context: Context,
        channelId: String,
        title: String,
        body: String,
        notificationId: Int = -1,
        extras: Map<String, String>? = null
    ): Int {
        createNotificationChannels(context)

        val resolvedId = if (notificationId != -1) {
            notificationId
        } else {
            val key = extras?.get("order_id") ?: extras?.get("tag") ?: extras?.get("conversation_id")
            if (!key.isNullOrEmpty()) {
                Math.abs(key.hashCode())
            } else {
                (System.currentTimeMillis() % 100000).toInt()
            }
        }
        val tag = extras?.get("tag") ?: extras?.get("order_id")?.let { "order_$it" }

        val imageUrl = extras?.get("image_url") ?: extras?.get("imageUrl") ?: extras?.get("image")
        if (!imageUrl.isNullOrEmpty()) {
            executor.execute {
                var bitmap: Bitmap? = null
                try {
                    val url = URL(imageUrl)
                    val conn = url.openConnection() as HttpURLConnection
                    conn.doInput = true
                    conn.connectTimeout = 8000
                    conn.readTimeout = 8000
                    conn.instanceFollowRedirects = true
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 MitrenoApp")
                    conn.connect()
                    val stream = conn.inputStream
                    bitmap = BitmapFactory.decodeStream(stream)
                    stream.close()
                    conn.disconnect()
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to download notification image: ${e.message}")
                }

                val builder = buildNotification(context, channelId, title, body, extras, bitmap)
                if (tag != null) {
                    NotificationManagerCompat.from(context).notify(tag, resolvedId, builder.build())
                } else {
                    NotificationManagerCompat.from(context).notify(resolvedId, builder.build())
                }
            }
        } else {
            val builder = buildNotification(context, channelId, title, body, extras, null)
            if (tag != null) {
                NotificationManagerCompat.from(context).notify(tag, resolvedId, builder.build())
            } else {
                NotificationManagerCompat.from(context).notify(resolvedId, builder.build())
            }
        }

        return resolvedId
    }
}
