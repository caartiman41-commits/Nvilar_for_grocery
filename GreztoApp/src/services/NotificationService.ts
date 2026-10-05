import { Platform, Vibration, PermissionsAndroid, AppState, AppStateStatus, DeviceEventEmitter } from 'react-native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { getApps } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { MitrenoToast } from '../components/MitrenoToast';
import {
  initializeNotificationChannels,
  postNativeNotification,
  VIBRATION_PATTERNS,
  MITRENO_SELLER_CHANNEL,
  MITRENO_BUYER_CHANNEL,
  MITRENO_ORDERS_CHANNEL,
  NotificationChannelId,
} from './channelConfig';

// ---------------------------------------------------------------------------
// 1. Android Notification Channels Specification
// ---------------------------------------------------------------------------
export const NOTIFICATION_CHANNELS = {
  SELLER: {
    id: MITRENO_SELLER_CHANNEL.id,
    name: MITRENO_SELLER_CHANNEL.name,
    description: MITRENO_SELLER_CHANNEL.description,
    vibrationPattern: VIBRATION_PATTERNS.SELLER_URGENT_DOUBLE_PULSE, // [0, 250, 200, 250]
    importance: 'high',
  },
  BUYER: {
    id: MITRENO_BUYER_CHANNEL.id,
    name: MITRENO_BUYER_CHANNEL.name,
    description: MITRENO_BUYER_CHANNEL.description,
    vibrationPattern: VIBRATION_PATTERNS.BUYER_SMOOTH_WAVE, // [0, 400]
    importance: 'high',
  },
  ORDERS: {
    id: MITRENO_ORDERS_CHANNEL.id,
    name: MITRENO_ORDERS_CHANNEL.name,
    description: MITRENO_ORDERS_CHANNEL.description,
    vibrationPattern: VIBRATION_PATTERNS.ORDERS_STATUS_PULSE, // [0, 300, 150, 300]
    importance: 'high',
  },
} as const;

// ---------------------------------------------------------------------------
// 2. Types & Interfaces
// ---------------------------------------------------------------------------
export type TargetRole = 'seller' | 'buyer';

export interface MitrenoNotificationData {
  target_role?: TargetRole | string;
  role?: TargetRole | string;
  conversation_id?: string;
  conversationId?: string;
  order_id?: string;
  product_id?: string;
  screen?: string;
  [key: string]: any;
}

export interface MitrenoNotificationPayload {
  title: string;
  body: string;
  image?: string;
  data?: MitrenoNotificationData;
  channelId?: string;
  notification?: {
    title?: string;
    body?: string;
    android?: {
      imageUrl?: string;
    };
  };
}

// ---------------------------------------------------------------------------
// 3. Centralized Navigation Container Ref
// ---------------------------------------------------------------------------
export const navigationRef = createNavigationContainerRef<any>();

let pendingDeepLink: { targetRole: string; conversationId?: string } | null = null;

// Track currently active open chat conversation context across buyer and seller screens
export interface ActiveChatContext {
  conversationId: string;
  role: 'buyer' | 'seller';
}

let currentActiveChat: ActiveChatContext | null = null;

// Deduplication cache for incoming notifications (prevents double-buzz from WS + FCM delivery)
const recentNotificationIds = new Map<string, number>();

function isDuplicateNotification(id: string): boolean {
  if (!id) return false;
  const now = Date.now();
  const lastTime = recentNotificationIds.get(id);
  if (lastTime && now - lastTime < 15000) {
    return true;
  }
  return false;
}

function recordNotificationSeen(id: string): void {
  if (!id) return;
  const now = Date.now();
  recentNotificationIds.set(id, now);
  // Periodically clean up entries older than 30s
  if (recentNotificationIds.size > 200) {
    for (const [key, timestamp] of recentNotificationIds.entries()) {
      if (now - timestamp > 30000) {
        recentNotificationIds.delete(key);
      }
    }
  }
}

/**
 * Set the currently active open chat conversation ID and viewing role (or null when exited).
 * Used for WhatsApp-grade active conversation notification suppression.
 */
export function setActiveChatContext(
  conversationId: string | null,
  role?: 'buyer' | 'seller'
): void {
  if (conversationId) {
    currentActiveChat = {
      conversationId: conversationId.trim(),
      role: role || 'buyer',
    };
  } else {
    currentActiveChat = null;
  }
  console.log(`[NotificationService] Active chat context updated:`, currentActiveChat);
}

/**
 * Get the currently active open chat conversation context.
 */
export function getActiveChatContext(): ActiveChatContext | null {
  return currentActiveChat;
}

/**
 * Executes or queues the deep-link route based on target_role and conversation_id
 */
export function routeDeepLink(
  targetRole: string,
  conversationId?: string,
  extras?: Record<string, any>
): boolean {
  const normalizedRole = (targetRole || '').toLowerCase().trim();
  const action = ((extras?.action || '') as string).toUpperCase();
  const productId = extras?.product_id || extras?.productId;
  const targetScreen = extras?.target_screen || extras?.targetScreen || extras?.screen;

  if (!navigationRef.isReady()) {
    console.log('[NotificationService] NavigationRef not ready, caching pending deep-link:', {
      targetRole: normalizedRole,
      conversationId,
      action,
      productId,
    });
    pendingDeepLink = { targetRole: normalizedRole, conversationId, extras } as any;
    return false;
  }

  console.log(`[NotificationService] Navigating deep-link -> role: '${normalizedRole}', action: '${action}', productId: '${productId}'`);

  // 1. E-Commerce "Shop Now" or Product PDP Deep Link
  if (action === 'SHOP_NOW' || targetScreen === 'ProductDetails' || normalizedRole === 'product' || productId) {
    try {
      navigationRef.navigate('ProductDetails', {
        productId: productId || 'prod_1',
      });
      return true;
    } catch (err) {
      console.warn('[NotificationService] Failed to navigate to ProductDetails:', err);
    }
  }

  // 2. E-Commerce "Visit Now" or Explore Tab Deep Link
  if (action === 'VISIT_NOW' || targetScreen === 'Explore' || normalizedRole === 'explore') {
    try {
      navigationRef.navigate('MainTabs', { screen: 'Explore' });
      return true;
    } catch (err) {
      console.warn('[NotificationService] Failed to navigate to Explore:', err);
    }
  }

  if (normalizedRole === 'seller') {
    // Navigate user directly to StudioChatTab (or Seller Studio) with conversation_id
    try {
      navigationRef.navigate('SellerStudio', {
        initialTab: 'chat',
        conversation_id: conversationId,
        conversationId,
      });
      return true;
    } catch (err) {
      console.warn('[NotificationService] Failed to navigate to SellerStudio, trying StudioChatTab fallback:', err);
      try {
        navigationRef.navigate('StudioChatTab', {
          conversation_id: conversationId,
          conversationId,
        });
        return true;
      } catch (innerErr) {
        console.error('[NotificationService] Failed to navigate to seller chat:', innerErr);
        return false;
      }
    }
  } else if (normalizedRole === 'buyer') {
    // Navigate user directly to ChatsScreen (Buyer App) with conversation_id
    try {
      navigationRef.navigate('ChatsScreen', {
        conversation_id: conversationId,
        conversationId,
      });
      return true;
    } catch (err) {
      console.warn('[NotificationService] Failed to navigate to ChatsScreen, trying MainTabs fallback:', err);
      try {
        navigationRef.navigate('MainTabs', {
          screen: 'ChatsTab',
          params: {
            conversation_id: conversationId,
            conversationId,
          },
        });
        return true;
      } catch (innerErr) {
        console.error('[NotificationService] Failed to navigate to buyer chats:', innerErr);
        return false;
      }
    }
  }

  return false;
}

/**
 * Called when the NavigationContainer finishes mounting (onReady)
 */
export function onNavigationReady(): void {
  console.log('[NotificationService] Navigation is ready');
  if (pendingDeepLink) {
    const { targetRole, conversationId } = pendingDeepLink;
    pendingDeepLink = null;
    routeDeepLink(targetRole, conversationId);
  }
}

// ---------------------------------------------------------------------------
// 4. Foreground Alert & Custom Vibration Engine
// ---------------------------------------------------------------------------
/**
 * Handles incoming foreground notification:
 * 1. Active Chat Suppression: If user is actively inside this conversation, suppresses notification.
 * 2. Native System Notification: If user is outside this conversation, posts directly to Android system notification tray (heads-up).
 */
export function handleForegroundNotification(payload: MitrenoNotificationPayload): void {
  const data = payload.data || {};
  const incomingConvId =
    data.conversation_id ||
    data.conversationId ||
    data.negotiation_id ||
    data.negotiationId;
  const targetRole = (data.target_role || data.role || '').toLowerCase().trim();

  // Deduplication check: ignore if this exact message ID was handled in the last 15 seconds
  const messageId = data.order_id
    ? `order_${data.order_id}`
    : (data.id || data.message_id || data.client_message_id);
  if (messageId && isDuplicateNotification(messageId)) {
    console.log(`[NotificationService] Duplicate notification ignored for message ID '${messageId}'`);
    return;
  }

  // 1. WhatsApp-grade Active Chat Suppression:
  // ONLY suppress if the user is CURRENTLY looking at this chat AS THE TARGET RECIPIENT!
  // If targetRole is 'seller', it should ONLY be suppressed if user is currently inside the chat as 'seller'.
  // If targetRole is 'buyer', it should ONLY be suppressed if user is currently inside the chat as 'buyer'.
  if (
    currentActiveChat &&
    incomingConvId &&
    (currentActiveChat.conversationId === incomingConvId ||
      incomingConvId.includes(currentActiveChat.conversationId) ||
      currentActiveChat.conversationId.includes(incomingConvId))
  ) {
    const isTargetRoleViewing = !targetRole || currentActiveChat.role === targetRole;
    if (isTargetRoleViewing) {
      console.log(
        `[NotificationService] Notification SUPPRESSED - user is actively viewing chat '${incomingConvId}' as role '${currentActiveChat.role}'`
      );
      return;
    }
  }

  if (messageId) {
    recordNotificationSeen(messageId);
  }

  const title = payload.title || payload.notification?.title || 'Mitreno';
  const body = payload.body || payload.notification?.body || '';
  const channelId = (payload.channelId ||
    (targetRole === 'seller' ? MITRENO_SELLER_CHANNEL.id : MITRENO_BUYER_CHANNEL.id)) as NotificationChannelId;

  console.log(
    `[NotificationService] Foreground notification dispatching to native Android system tray -> role: '${targetRole}', channel: '${channelId}', title: '${title}'`
  );

  // 2. Post real native Android system notification (heads-up sliding down from status bar)
  // Completely eliminates in-app floating toasts in favor of real OS system notifications
  if (Platform.OS === 'android') {
    postNativeNotification(channelId, title, body, data);
  }
}

/**
 * Handles user tapping on a notification banner or system notification tray
 */
export function handleNotificationTap(payload: MitrenoNotificationPayload | any): void {
  const data = payload.data || payload || {};
  const targetRole = (data.target_role || data.role || '').toLowerCase().trim();
  const conversationId = data.conversation_id || data.conversationId;

  console.log(`[NotificationService] Notification tapped -> role: '${targetRole}', conversationId: '${conversationId}', action: '${data.action}'`);

  routeDeepLink(targetRole, conversationId, data);
}

// ---------------------------------------------------------------------------
// 5. Local Notification Bridge & Event Bus
// ---------------------------------------------------------------------------
type NotificationListenerCallback = (payload: MitrenoNotificationPayload) => void;
const listeners: Set<NotificationListenerCallback> = new Set();

export function addNotificationListener(listener: NotificationListenerCallback): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Dispatches a notification across the app through the unified notification pipeline.
 * If app is in foreground, triggers custom vibrations + MitrenoToast.
 * If app is in background or screen is off, posts directly to Android native system tray with:
 * - NotificationCompat.VISIBILITY_PUBLIC (Full preview on lockscreen)
 * - NotificationCompat.PRIORITY_HIGH & IMPORTANCE_HIGH (Heads-up peeking)
 * - Distinct urgent double-pulse (Seller) or smooth wave (Buyer) vibration.
 */
export function dispatchNotification(payload: MitrenoNotificationPayload): void {
  const data = payload.data || {};
  const messageId = data.order_id
    ? `order_${data.order_id}`
    : (data.id || data.message_id || data.client_message_id);
  if (messageId && isDuplicateNotification(messageId)) {
    console.log(`[NotificationService] Duplicate dispatch ignored for message ID '${messageId}'`);
    return;
  }

  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (err) {
      console.warn('[NotificationService] Error executing listener callback:', err);
    }
  });

  const state = AppState.currentState;
  if (state === 'active') {
    handleForegroundNotification(payload);
  } else {
    console.log('[NotificationService] App is in background/inactive, posting native notification to system tray.');
    const targetRole = (data.target_role || data.role || '').toLowerCase().trim();
    const channelId = (payload.channelId ||
      (targetRole === 'seller' ? MITRENO_SELLER_CHANNEL.id : MITRENO_BUYER_CHANNEL.id)) as NotificationChannelId;
    const title = payload.title || payload.notification?.title || 'Mitreno';
    const body = payload.body || payload.notification?.body || '';

    if (messageId) {
      recordNotificationSeen(messageId);
    }
    postNativeNotification(channelId, title, body, data);
  }
}

/**
 * Convenience testing helper to simulate incoming foreground or background alerts
 */
export function simulateNotification(
  role: 'seller' | 'buyer',
  title?: string,
  body?: string,
  conversationId: string = 'conv_demo_101',
  postNative: boolean = false
): void {
  const defaultTitle =
    role === 'seller' ? '🔥 New ₹1,850 Bargain Offer!' : '✨ Boutique Accepted Your Deal!';
  const defaultBody =
    role === 'seller'
      ? 'A customer has placed a counter-offer on your Pure Silk Saree. Tap to accept.'
      : 'Sarojini Exclusive agreed to ₹1,499. Instant express delivery unlocked!';

  const channelId = role === 'seller' ? MITRENO_SELLER_CHANNEL.id : MITRENO_BUYER_CHANNEL.id;
  const resolvedTitle = title || defaultTitle;
  const resolvedBody = body || defaultBody;
  const data = {
    target_role: role,
    conversation_id: conversationId,
  };

  if (postNative && Platform.OS === 'android') {
    postNativeNotification(channelId, resolvedTitle, resolvedBody, data);
  } else {
    dispatchNotification({
      title: resolvedTitle,
      body: resolvedBody,
      data,
      channelId,
    });
  }
}

/**
 * Posts a rich e-commerce product promotion notification with:
 * - BigPictureStyle hero product image in the middle
 * - "🛍️ Shop Now" primary action button
 * - "✨ Visit Now" secondary action button
 * - Mitreno authentic white squircle icon + red origami bag badge
 */
export function postProductPromoNotification(options: {
  title: string;
  body: string;
  imageUrl: string;
  productId?: string;
  actionLabel?: string;
  actionSecondary?: string;
}): Promise<number | null> {
  const data = {
    target_role: 'buyer',
    product_id: options.productId || 'prod_1',
    image_url: options.imageUrl,
    action_label: options.actionLabel || '🛍️ Shop Now',
    action_secondary: options.actionSecondary || '✨ Visit Now',
  };

  return postNativeNotification(
    MITRENO_BUYER_CHANNEL.id,
    options.title,
    options.body,
    data
  );
}

// ---------------------------------------------------------------------------
// 6. Permission & Channel Initializer
// ---------------------------------------------------------------------------
async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[NotificationService] Notification permission request error:', err);
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// 7. Core Initialization Engine
// ---------------------------------------------------------------------------
let isInitialized = false;

export function initialize(): () => void {
  if (isInitialized) {
    console.log('[NotificationService] Already initialized');
    return () => {};
  }
  isInitialized = true;

  console.log('🔔 [NotificationService] Initializing Mitreno Notification Service...');

  // 1. Request OS permissions & ensure Android Notification Channels
  initializeNotificationChannels().catch((err) => {
    console.warn('[NotificationService] Android channels init error:', err);
  });
  requestAndroidNotificationPermission().catch((err) => {
    console.warn('[NotificationService] Permission check error:', err);
  });

  // 2. Verify Firebase App & Auth integration
  try {
    const apps = getApps();
    console.log(`[NotificationService] Firebase App connected. Initialized apps: ${apps.length}`);

    const auth = getAuth();
    const currentUser = auth.currentUser;
    console.log(`[NotificationService] Firebase Auth linked. User UID: ${currentUser?.uid || 'guest'}`);
  } catch (err: any) {
    console.warn('[NotificationService] Firebase check warning:', err?.message || err);
  }

  // 3. Connect @react-native-firebase/messaging if available in bundle
  let cleanups: (() => void)[] = [];

  try {
    // Support both modular v26+ and legacy API signatures
    const messagingModule = require('@react-native-firebase/messaging');
    const getMessaging = messagingModule.getMessaging || messagingModule.default || messagingModule;
    const messagingInstance = typeof getMessaging === 'function' ? getMessaging() : (typeof messagingModule === 'function' ? messagingModule() : null);

    if (messagingInstance) {
      // 1. Request permission
      if (typeof messagingModule.requestPermission === 'function') {
        messagingModule.requestPermission(messagingInstance).catch(() => {});
      } else if (typeof messagingInstance.requestPermission === 'function') {
        messagingInstance.requestPermission().catch(() => {});
      }

      // 2. Register device for remote messages & subscribe to all_users topic
      const registerFn = typeof messagingModule.registerDeviceForRemoteMessages === 'function'
        ? messagingModule.registerDeviceForRemoteMessages(messagingInstance)
        : (typeof messagingInstance.registerDeviceForRemoteMessages === 'function'
          ? messagingInstance.registerDeviceForRemoteMessages()
          : Promise.resolve());

      Promise.resolve(registerFn)
        .then(() => {
          console.log('[NotificationService] Registered for remote messages');
          if (typeof messagingModule.subscribeToTopic === 'function') {
            messagingModule.subscribeToTopic(messagingInstance, 'all_users').catch(() => {});
          } else if (typeof messagingInstance.subscribeToTopic === 'function') {
            messagingInstance.subscribeToTopic('all_users').catch(() => {});
          }
        })
        .catch(() => {});

      // 3. Get FCM Token and sync to backend
      const getTokenPromise = typeof messagingModule.getToken === 'function'
        ? messagingModule.getToken(messagingInstance)
        : (typeof messagingInstance.getToken === 'function'
          ? messagingInstance.getToken()
          : Promise.reject(new Error('getToken not found')));

      let cachedToken = '';
      let lastSyncedKey = '';
      const syncTokenToUser = async (fcmTok: string, u: any) => {
        if (!fcmTok) return;
        const uid = u?.uid || '';
        const phone = u?.phoneNumber || '';
        const syncKey = `${fcmTok}_${uid}_${phone}`;
        if (lastSyncedKey === syncKey) return;
        lastSyncedKey = syncKey;
        try {
          const { apiClient } = require('../api/client');
          await apiClient.post('/auth/device-token', {
            fcm_token: fcmTok,
            user_id: uid,
            phone: phone,
          });
          console.log(`✅ [NotificationService] FCM Token bound to user (uid: '${uid}', phone: '${phone}')`);
        } catch (err: any) {
          console.warn('[NotificationService] Token binding error:', err?.message);
        }
      };

      getTokenPromise
        .then(async (token: string) => {
          console.log('🔥 [NotificationService] FCM Device Token acquired:', token);
          if (token) {
            cachedToken = token;
            try {
              const { useAuthStore } = require('../features/auth/authStore');
              const currentUser = useAuthStore.getState()?.user;
              await syncTokenToUser(token, currentUser);

              // Subscribe to auth state changes so when user logs in, token binds instantly
              const unsubAuth = useAuthStore.subscribe((state: any) => {
                if (cachedToken && state?.user) {
                  syncTokenToUser(cachedToken, state.user);
                }
              });
              if (typeof unsubAuth === 'function') cleanups.push(unsubAuth);
            } catch (syncErr: any) {
              console.warn('[NotificationService] Token backend sync failed:', syncErr?.message);
            }
          }
        })
        .catch((e: any) => {
          console.log('[NotificationService] FCM Token fetch skipped:', e?.message);
        });

      // 4. Listen for token refresh
      const onTokenRefreshFn = messagingModule.onTokenRefresh || messagingInstance.onTokenRefresh;
      if (typeof onTokenRefreshFn === 'function') {
        const unsubTokenRefresh = messagingModule.onTokenRefresh
          ? messagingModule.onTokenRefresh(messagingInstance, (newToken: string) => {
              if (newToken) {
                try {
                  const { apiClient } = require('../api/client');
                  const { useAuthStore } = require('../features/auth/authStore');
                  const currentUser = useAuthStore.getState()?.user;
                  apiClient.post('/auth/device-token', {
                    fcm_token: newToken,
                    user_id: currentUser?.uid || '',
                    phone: currentUser?.phoneNumber || '',
                  }).catch(() => {});
                } catch {}
              }
            })
          : messagingInstance.onTokenRefresh((newToken: string) => {
              if (newToken) {
                try {
                  const { apiClient } = require('../api/client');
                  const { useAuthStore } = require('../features/auth/authStore');
                  const currentUser = useAuthStore.getState()?.user;
                  apiClient.post('/auth/device-token', {
                    fcm_token: newToken,
                    user_id: currentUser?.uid || '',
                    phone: currentUser?.phoneNumber || '',
                  }).catch(() => {});
                } catch {}
              }
            });
        if (typeof unsubTokenRefresh === 'function') cleanups.push(unsubTokenRefresh);
      }

      // 5. Foreground message listener
      const onMessageFn = messagingModule.onMessage || messagingInstance.onMessage;
      if (typeof onMessageFn === 'function') {
        const handleMsg = async (remoteMessage: any) => {
          if (!remoteMessage) return;
          const normalizedPayload: MitrenoNotificationPayload = {
            title: remoteMessage.notification?.title || remoteMessage.data?.title || 'Mitreno Alert',
            body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
            image: remoteMessage.notification?.android?.imageUrl || remoteMessage.data?.image_url || remoteMessage.data?.image,
            data: remoteMessage.data || {},
            channelId: remoteMessage.notification?.android?.channelId || remoteMessage.data?.channel_id,
          };
          handleForegroundNotification(normalizedPayload);
        };
        const unsubMessage = messagingModule.onMessage
          ? messagingModule.onMessage(messagingInstance, handleMsg)
          : messagingInstance.onMessage(handleMsg);
        if (typeof unsubMessage === 'function') cleanups.push(unsubMessage);
      }

      // 6. Notification tapped when app in background
      const onOpenedFn = messagingModule.onNotificationOpenedApp || messagingInstance.onNotificationOpenedApp;
      if (typeof onOpenedFn === 'function') {
        const unsubOpened = messagingModule.onNotificationOpenedApp
          ? messagingModule.onNotificationOpenedApp(messagingInstance, (remoteMessage: any) => {
              if (remoteMessage) {
                handleNotificationTap(remoteMessage);
              }
            })
          : messagingInstance.onNotificationOpenedApp((remoteMessage: any) => {
              if (remoteMessage) {
                handleNotificationTap(remoteMessage);
              }
            });
        if (typeof unsubOpened === 'function') cleanups.push(unsubOpened);
      }

      // 7. Notification tapped causing cold app launch
      const getInitialFn = messagingModule.getInitialNotification
        ? messagingModule.getInitialNotification(messagingInstance)
        : (typeof messagingInstance.getInitialNotification === 'function'
          ? messagingInstance.getInitialNotification()
          : null);
      if (getInitialFn && typeof getInitialFn.then === 'function') {
        getInitialFn
          .then((remoteMessage: any) => {
            if (remoteMessage) {
              console.log('[NotificationService] App launched from cold notification:', remoteMessage);
              handleNotificationTap(remoteMessage);
            }
          })
          .catch(() => {});
      }
    }
  } catch {
    // @react-native-firebase/messaging not installed in current dependencies;
    // running seamlessly on high-performance local notification & in-app bridge
    console.log('[NotificationService] Operating on optimized Native Android & in-app event bridge.');
  }

  // 4. Listen for Native Android Notification Tray clicks (sent from MainActivity / NotificationChannelModule)
  const nativeTapSub = DeviceEventEmitter.addListener('onNativeNotificationTapped', (extras: any) => {
    console.log('[NotificationService] Native Android notification tapped from system tray:', extras);
    if (extras) {
      handleNotificationTap({ data: extras });
    }
  });
  cleanups.push(() => nativeTapSub.remove());

  return () => {
    isInitialized = false;
    cleanups.forEach((fn) => fn());
    listeners.clear();
  };
}

// ---------------------------------------------------------------------------
// 8. Service Export
// ---------------------------------------------------------------------------
export const NotificationService = {
  initialize,
  setActiveChatContext,
  getActiveChatContext,
  handleForegroundNotification,
  handleNotificationTap,
  routeDeepLink,
  onNavigationReady,
  addNotificationListener,
  dispatchNotification,
  simulateNotification,
  postNativeNotification,
  postProductPromoNotification,
  channels: NOTIFICATION_CHANNELS,
};

export default NotificationService;
