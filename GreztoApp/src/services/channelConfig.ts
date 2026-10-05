/**
 * Mitreno Native Android Notification Channels Configuration (API 26+)
 * 
 * Configures distinct high-priority notification channels with customized
 * vibration cadences and luxury sound profiles for Mitreno boutiques & shoppers.
 */

import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { NotificationChannelModule } = NativeModules;

export enum AndroidImportance {
  NONE = 0,
  MIN = 1,
  LOW = 2,
  DEFAULT = 3,
  HIGH = 4,
  MAX = 5,
}

export enum NotificationVisibility {
  SECRET = -1,
  PRIVATE = 0,
  PUBLIC = 1,
}

export type NotificationChannelId = 'mitreno_seller_channel' | 'mitreno_buyer_channel' | 'mitreno_orders_channel';

export interface NotificationChannelConfig {
  /** Unique channel ID recognized by Android OS */
  id: NotificationChannelId;
  /** User-visible channel name in Android App Notification Settings */
  name: string;
  /** Detailed description of alerts delivered on this channel */
  description: string;
  /** Priority level for heads-up alert behavior */
  importance: AndroidImportance | number;
  /** Enable device haptic motor vibration */
  vibration: boolean;
  /**
   * Vibration rhythm sequence in milliseconds:
   * [wait_ms, vibrate_ms, wait_ms, vibrate_ms, ...]
   */
  vibrationPattern: number[] | readonly number[];
  /** Audio chime file in res/raw or default system tone */
  sound: string;
  /** Enable LED pulse on supported hardware */
  lights?: boolean;
  /** Hex color for notification LED & icon tinting */
  lightColor?: string;
  /** Show unread notification dot badge on launcher icon */
  showBadge?: boolean;
  /** Lockscreen visibility (NotificationCompat.VISIBILITY_PUBLIC = 1) */
  visibility?: NotificationVisibility | number;
}

/**
 * Signature Haptic Vibration Profiles
 */
export const VIBRATION_PATTERNS = {
  /** Double-pulse urgent rhythm [0ms pause, 250ms buzz, 200ms pause, 250ms buzz] */
  SELLER_URGENT_DOUBLE_PULSE: [0, 250, 200, 250],
  /** Single smooth luxury wave [0ms pause, 400ms buzz] */
  BUYER_SMOOTH_WAVE: [0, 400],
  /** Order status alert pulse [0ms pause, 300ms buzz, 150ms pause, 300ms buzz] */
  ORDERS_STATUS_PULSE: [0, 300, 150, 300],
} as const;

/**
 * Sound identities
 */
export const CHANNEL_SOUNDS = {
  SELLER: 'cash_chime',
  BUYER: 'luxury_chime',
  ORDERS: 'default',
  DEFAULT: 'default',
} as const;

/**
 * Channel 1: mitreno_seller_channel
 * High priority alerts for incoming customer inquiries and bargain offers
 */
export const MITRENO_SELLER_CHANNEL: NotificationChannelConfig = {
  id: 'mitreno_seller_channel',
  name: 'Boutique Inquiries & Customer Deals',
  description: 'High priority alerts for incoming customer inquiries and bargain offers',
  importance: AndroidImportance.HIGH, // 4
  vibration: true,
  vibrationPattern: VIBRATION_PATTERNS.SELLER_URGENT_DOUBLE_PULSE, // [0, 250, 200, 250]
  sound: CHANNEL_SOUNDS.SELLER, // 'cash_chime' (with native fallback to default)
  lights: true,
  lightColor: '#E6A524', // Mitreno Gold
  showBadge: true,
  visibility: NotificationVisibility.PUBLIC, // 1 (Full Lockscreen preview visible)
};

/**
 * Channel 2: mitreno_buyer_channel
 * Alerts when a boutique seller replies to your inquiry or accepts your deal
 */
export const MITRENO_BUYER_CHANNEL: NotificationChannelConfig = {
  id: 'mitreno_buyer_channel',
  name: 'Boutique Replies & Orders',
  description: 'Alerts when a boutique seller replies to your inquiry or accepts your deal',
  importance: AndroidImportance.HIGH, // 4
  vibration: true,
  vibrationPattern: VIBRATION_PATTERNS.BUYER_SMOOTH_WAVE, // [0, 400]
  sound: CHANNEL_SOUNDS.BUYER, // 'luxury_chime' (with native fallback to default)
  lights: true,
  lightColor: '#1B1B1B', // Mitreno Onyx
  showBadge: true,
  visibility: NotificationVisibility.PUBLIC, // 1 (Full Lockscreen preview visible)
};

/**
 * Channel 3: mitreno_orders_channel
 * Alerts for order fulfillment, dispatch updates, and delivery confirmations
 */
export const MITRENO_ORDERS_CHANNEL: NotificationChannelConfig = {
  id: 'mitreno_orders_channel',
  name: 'Order Status & Deliveries',
  description: 'Real-time updates regarding order status, tracking, and courier delivery',
  importance: AndroidImportance.HIGH, // 4
  vibration: true,
  vibrationPattern: VIBRATION_PATTERNS.ORDERS_STATUS_PULSE, // [0, 300, 150, 300]
  sound: CHANNEL_SOUNDS.ORDERS, // 'default'
  lights: true,
  lightColor: '#2E7D32',
  showBadge: true,
  visibility: NotificationVisibility.PUBLIC, // 1 (Full Lockscreen preview visible)
};

/**
 * Registry of all available Android Notification Channels
 */
export const NOTIFICATION_CHANNELS: Record<NotificationChannelId, NotificationChannelConfig> = {
  mitreno_seller_channel: MITRENO_SELLER_CHANNEL,
  mitreno_buyer_channel: MITRENO_BUYER_CHANNEL,
  mitreno_orders_channel: MITRENO_ORDERS_CHANNEL,
};

/**
 * Native Channel Initializer
 * Invokes native NotificationChannelModule to ensure channels are registered on Android API 26+.
 */
export const initializeNotificationChannels = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    if (NotificationChannelModule?.initializeChannels) {
      const result = await NotificationChannelModule.initializeChannels();
      return Boolean(result);
    }
    return false;
  } catch (error) {
    console.warn('[NotificationChannels] Initialization error:', error);
    return false;
  }
};

/**
 * Check if the app has notification permissions (Android 13+ / API 33+)
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }

    if (NotificationChannelModule?.areNotificationsEnabled) {
      return await NotificationChannelModule.areNotificationsEnabled();
    }

    return true;
  } catch (error) {
    console.warn('[NotificationChannels] Permission check error:', error);
    return false;
  }
};

/**
 * Request notification permissions for Android 13+ (POST_NOTIFICATIONS)
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Mitreno Notifications',
          message: 'Enable notifications to receive real-time bargain offers, boutique replies, and order updates.',
          buttonPositive: 'Allow',
          buttonNegative: 'Not Now',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  } catch (error) {
    console.warn('[NotificationChannels] Permission request error:', error);
    return false;
  }
};

/**
 * Lookup channel configuration by Channel ID
 */
export const getChannelConfig = (channelId: NotificationChannelId): NotificationChannelConfig | undefined => {
  return NOTIFICATION_CHANNELS[channelId];
};

/**
 * Retrieve list of registered channels from native Android OS
 */
export const getRegisteredChannels = async (): Promise<any[]> => {
  if (Platform.OS !== 'android' || !NotificationChannelModule?.getRegisteredChannels) {
    return [];
  }

  try {
    return await NotificationChannelModule.getRegisteredChannels();
  } catch (error) {
    console.warn('[NotificationChannels] Fetch registered channels error:', error);
    return [];
  }
};

/**
 * Posts a native Android notification using NotificationCompat with:
 * - NotificationCompat.VISIBILITY_PUBLIC (Lockscreen preview visible with screen off)
 * - NotificationCompat.PRIORITY_HIGH & IMPORTANCE_HIGH (Heads-up peeking)
 * - Channel-specific distinct vibration patterns:
 *   Seller: [0, 250, 200, 250] (Double-pulse urgent rhythm)
 *   Buyer: [0, 400] (Single smooth wave)
 * - Standard small icon (@drawable/ic_notification) & colored badge (#E6A524)
 */
export const postNativeNotification = async (
  channelId: NotificationChannelId,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<number | null> => {
  if (Platform.OS !== 'android' || !NotificationChannelModule?.postNotification) {
    return null;
  }

  try {
    const notificationId = await NotificationChannelModule.postNotification(
      channelId,
      title,
      body,
      data || {}
    );
    return typeof notificationId === 'number' ? notificationId : null;
  } catch (error) {
    console.warn('[NotificationChannels] Native postNotification error:', error);
    return null;
  }
};

export interface FCMDozeBypassOptions {
  token: string;
  title: string;
  body: string;
  channelId: NotificationChannelId;
  targetRole?: 'seller' | 'buyer';
  data?: Record<string, string>;
  clickAction?: string;
  icon?: string;
  color?: string;
}

/**
 * Builds an Android Doze-mode bypass FCM v1 payload.
 * 
 * Critical Screen-Off & Screen-Locked Guarantees:
 * 1. Root/Android priority: "HIGH" to instantly bypass Android deep Doze Mode.
 * 2. Top-level 'notification' object so Android OS System Notification Manager displays it,
 *    plays sound, and vibrates the device immediately without needing the React Native JS thread.
 * 3. Exact channel vibration pattern and audio chime attached to AndroidNotification.
 * 4. Lockscreen visibility set to PUBLIC (1).
 */
export const buildFCMDozeBypassPayload = (options: FCMDozeBypassOptions) => {
  const channel = NOTIFICATION_CHANNELS[options.channelId] || MITRENO_BUYER_CHANNEL;
  const vibrateTimings = channel.vibrationPattern.map((ms) => `${ms / 1000}s`);

  return {
    message: {
      token: options.token,
      // Mandatory: Android OS displays this directly when app is killed or screen is OFF
      notification: {
        title: options.title,
        body: options.body,
      },
      data: {
        target_role: options.targetRole || (options.channelId === 'mitreno_seller_channel' ? 'seller' : 'buyer'),
        channel_id: options.channelId,
        sound: channel.sound,
        ...options.data,
      },
      android: {
        // High priority bypasses Doze mode immediately
        priority: 'HIGH',
        notification: {
          title: options.title,
          body: options.body,
          icon: options.icon || 'ic_notification',
          color: options.color || '#E11D48',
          channel_id: options.channelId,
          sound: channel.sound,
          click_action: options.clickAction || (options.channelId === 'mitreno_seller_channel' ? 'OPEN_SELLER_CHAT' : 'OPEN_BUYER_CHAT'),
          vibrate_timings: vibrateTimings,
          priority: 'HIGH',
          visibility: 'PUBLIC',
          default_vibrate_timings: false,
          default_sound: false,
        },
      },
    },
  };
};

