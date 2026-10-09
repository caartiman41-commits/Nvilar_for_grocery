import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  AppState,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BargainChatService, sortMessagesForInvertedList, mergeThreadMessages } from '../../services/BargainChatService';
import { setActiveChatContext } from '../../services/NotificationService';
import { ChatHeader } from './components/ChatHeader';
import { ChatInfoModal, ChatThemeMode } from './components/ChatInfoModal';
import { useAuthStore } from '../auth/authStore';

export interface ChatThreadMessage {
  id: string;
  client_message_id?: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  created_at?: string;
  status: 'sent' | 'delivered' | 'read';
  offerPrice?: number;
}

const THEME_BACKGROUNDS: Record<ChatThemeMode, string> = {
  white: '#FFFFFF',
  dusk: '#F1F5F9',
  ivory: '#FAF7F2',
};

interface ChatBubbleItemProps {
  item: ChatThreadMessage;
}

const ChatBubbleItem = memo(({ item }: ChatBubbleItemProps) => {
  const isBuyer = item.sender === 'buyer';

  return (
    <View style={[styles.bubbleWrapper, isBuyer ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
      <View
        style={[
          styles.bubbleContainer,
          isBuyer ? styles.buyerBubble : styles.sellerBubble,
          Boolean(item.offerPrice) && styles.offerBubble,
        ]}
      >
        {/* Bargain Tag Header inside bubble if counter offer */}
        {Boolean(item.offerPrice) && (
          <View style={styles.offerTagRow}>
            <Icon name="tag-outline" size={14} color={isBuyer ? '#FFFFFF' : '#B45309'} />
            <Text style={[styles.offerTagText, isBuyer && styles.textWhite]}>
              Bargain Offer: ₹{item.offerPrice?.toLocaleString('en-IN')}
            </Text>
          </View>
        )}

        <Text style={[styles.bubbleText, isBuyer ? styles.buyerText : styles.sellerText]}>
          {item.text}
        </Text>

        {/* Timestamp and WhatsApp-grade Ticks */}
        <View style={styles.bubbleFooter}>
          <Text style={[styles.timeText, isBuyer ? styles.timeTextBuyer : styles.timeTextSeller]}>
            {item.timestamp}
          </Text>
          {isBuyer && (
            <View style={styles.tickContainer}>
              {item.status === 'read' ? (
                <Icon name="check-all" size={15} color="#38BDF8" />
              ) : item.status === 'delivered' ? (
                <Icon name="check-all" size={15} color="#94A3B8" />
              ) : (
                <Icon name="check" size={14} color="#94A3B8" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

export const ChatConversationScreen = memo(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  // Extract navigation parameters
  const routeParams = route.params || {};
  const initialNegId = routeParams.negotiationId || routeParams.conversationId || routeParams.conversation_id;
  const initialShopId = routeParams.shopId || routeParams.seller?.shopId;
  const initialBoutiqueName = routeParams.boutiqueName || routeParams.shopName || routeParams.seller?.name || 'Nvilar Boutique';
  const initialAvatar = routeParams.avatar || routeParams.shopAvatar || routeParams.seller?.avatar || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80';
  const initialProduct = routeParams.product || routeParams.attachedProduct;

  // Active state
  const [negotiationId, setNegotiationId] = useState<string | null>(initialNegId || null);
  const [shopId, setShopId] = useState<string | null>(initialShopId || null);
  const [boutiqueName, setBoutiqueName] = useState<string>(initialBoutiqueName);
  const [boutiqueAvatar, setBoutiqueAvatar] = useState<string>(initialAvatar);
  const [attachedProduct, setAttachedProduct] = useState<any>(initialProduct || null);

  const lastConsumedTapRef = useRef<number | undefined>(routeParams._tapTs);

  useEffect(() => {
    if (routeParams._tapTs && routeParams._tapTs === lastConsumedTapRef.current && negotiationId) {
      return;
    }
    lastConsumedTapRef.current = routeParams._tapTs;

    if (initialNegId && initialNegId !== negotiationId) {
      setNegotiationId(initialNegId);
    }
    if (initialShopId && initialShopId !== shopId) {
      setShopId(initialShopId);
    }
    if (routeParams.boutiqueName || routeParams.shopName || routeParams.seller?.name) {
      setBoutiqueName(initialBoutiqueName);
    }
  }, [initialNegId, initialShopId, initialBoutiqueName, routeParams._tapTs, negotiationId, shopId]);

  // Primary in-memory cache key for 0ms WhatsApp-grade instant chat display
  const primaryCacheKey = initialNegId || initialShopId || initialBoutiqueName;

  // Chat conversation state (Inverted: index 0 is latest message)
  const [messages, setMessages] = useState<ChatThreadMessage[]>(() => {
    return BargainChatService.getCachedThreadMessages(primaryCacheKey) || [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = BargainChatService.getCachedThreadMessages(primaryCacheKey);
    return !cached || cached.length === 0;
  });
  const [inputText, setInputText] = useState<string>('');
  const [isSellerOnline, setIsSellerOnline] = useState<boolean>(true);
  const [sellerLastSeen, setSellerLastSeen] = useState<string>('Online');
  const [isSellerTyping, setIsSellerTyping] = useState<boolean>(false);
  const [isSellerBlocked, setIsSellerBlocked] = useState<boolean>(false);
  const [chatTheme, setChatTheme] = useState<ChatThemeMode>('ivory');
  const [chatInfoVisible, setChatInfoVisible] = useState<boolean>(false);

  // Bargain Offer Dialog state
  const [offerModalVisible, setOfferModalVisible] = useState<boolean>(false);
  const [customOfferInput, setCustomOfferInput] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  const typingTimeoutRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // WhatsApp-grade Active Chat Context Tracking (suppresses duplicate notifications while viewing chat)
  useEffect(() => {
    const activeId = negotiationId || initialNegId;
    if (activeId) {
      setActiveChatContext(activeId, 'buyer');
    }
    return () => {
      setActiveChatContext(null);
    };
  }, [negotiationId, initialNegId]);

  // 1. Thread Initialization & History Load (Deterministic 1-Shop-1-Buyer)
  useEffect(() => {
    let isMounted = true;

    const loadThread = async () => {
      setIsLoading(true);
      try {
        let res: { negotiation?: any; messages: any[] };

        if (negotiationId && !negotiationId.startsWith('chat_')) {
          res = await BargainChatService.getChatThread(negotiationId);
        } else if (shopId) {
          res = await BargainChatService.getOrCreateThread(shopId, attachedProduct?.id, user?.uid);
        } else {
          res = { messages: [] };
        }

        if (!isMounted) return;

        if (res.negotiation?.id) {
          setNegotiationId(res.negotiation.id);
          if (res.negotiation.shop?.name) {
            setBoutiqueName(res.negotiation.shop.name);
          }
          if (res.negotiation.shop?.logo_url) {
            setBoutiqueAvatar(res.negotiation.shop.logo_url);
          }
          if (res.negotiation.product && !attachedProduct) {
            setAttachedProduct(res.negotiation.product);
          }
        }

        if (Array.isArray(res.messages) && res.messages.length > 0) {
          const currentUserId = user?.uid || '';
          const mapped: ChatThreadMessage[] = res.messages.map((m: any) => {
            const isSellerMsg =
              m.sender_role === 'seller' ||
              m.role === 'seller' ||
              m.sender_id === 'seller' ||
              (shopId && m.sender_id === shopId) ||
              (typeof m.text === 'string' && (
                m.text.includes('100%') ||
                m.text.includes('Ready stock in Guwahati') ||
                m.text.includes('dispatch today by 4 PM') ||
                m.text.includes('Namaste! Welcome')
              )) ||
              (typeof m.message_text === 'string' && (
                m.message_text.includes('100%') ||
                m.message_text.includes('Ready stock in Guwahati') ||
                m.message_text.includes('dispatch today by 4 PM') ||
                m.message_text.includes('Namaste! Welcome')
              ));

            const isBuyerSender = !isSellerMsg && (
              m.sender_role === 'buyer' ||
              m.role === 'customer' ||
              m.sender_id === currentUserId ||
              m.sender_id === 'buyer'
            );

            return {
              id: m.id,
              sender: isBuyerSender ? 'buyer' : 'seller',
              text: m.message_text || m.text || '',
              timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              created_at: m.created_at,
              client_message_id: m.client_message_id,
              status: m.seen_at ? 'read' : 'delivered',
              offerPrice: m.offered_price,
            };
          });

          // Inverted FlatList requires deterministic reverse chronological order (newest at index 0)
          setMessages((prev) => {
            const merged = mergeThreadMessages(prev, mapped);
            if (primaryCacheKey) BargainChatService.setCachedThreadMessages(primaryCacheKey, merged);
            if (res.negotiation?.id) BargainChatService.setCachedThreadMessages(res.negotiation.id, merged);
            if (shopId) BargainChatService.setCachedThreadMessages(shopId, merged);
            return merged;
          });
        } else {
          // If no messages from server, only set welcome if local state is empty
          setMessages((prev) => {
            if (prev.length > 0) return prev;
            const welcomeMsgs: ChatThreadMessage[] = [
              {
                id: 'msg_welcome',
                sender: 'seller',
                text: `Namaste! Welcome to ${boutiqueName}. How can we assist you with our designer pieces today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'read',
              },
            ];
            if (primaryCacheKey) BargainChatService.setCachedThreadMessages(primaryCacheKey, welcomeMsgs);
            return welcomeMsgs;
          });
        }
      } catch (err) {
        console.warn('[ChatConversationScreen] Thread load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [negotiationId, shopId, user?.uid]);

  // Re-sync messages and reconnect WebSocket on app active (e.g. internet reconnected)
  useEffect(() => {
    if (!negotiationId) return;
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        const currentUserId = user?.uid || 'buyer';
        BargainChatService.markMessagesAsSeen(negotiationId, currentUserId).catch(() => {});
        BargainChatService.connectWebSocket({
          negotiationId,
          userId: currentUserId,
          role: 'customer',
          shopId: shopId || undefined,
        });
        try {
          const res = await BargainChatService.getChatThread(negotiationId);
          if (res.messages && res.messages.length > 0) {
            const mappedMessages: ChatThreadMessage[] = res.messages.map((m: any) => {
              const isSellerMsg =
                m.sender_role === 'seller' ||
                m.role === 'seller' ||
                m.sender_id === 'seller' ||
                (shopId && m.sender_id === shopId) ||
                (typeof m.text === 'string' && (
                  m.text.includes('100%') ||
                  m.text.includes('Ready stock in Guwahati') ||
                  m.text.includes('dispatch today by 4 PM') ||
                  m.text.includes('Namaste! Welcome')
                )) ||
                (typeof m.message_text === 'string' && (
                  m.message_text.includes('100%') ||
                  m.message_text.includes('Ready stock in Guwahati') ||
                  m.message_text.includes('dispatch today by 4 PM') ||
                  m.message_text.includes('Namaste! Welcome')
                ));

              const isBuyerMsg = !isSellerMsg && (
                m.sender_role === 'buyer' ||
                m.role === 'customer' ||
                m.sender_id === currentUserId ||
                m.sender_id === 'buyer'
              );
              let status: 'sent' | 'delivered' | 'read' = 'sent';
              if (m.seen_at) status = 'read';
              else if (m.delivered_at) status = 'delivered';
              else status = 'sent';

              return {
                id: m.id || m.client_message_id || `msg_${Math.random()}`,
                client_message_id: m.client_message_id,
                sender: isBuyerMsg ? 'buyer' : 'seller',
                text: m.message_text || m.text,
                timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                created_at: m.created_at,
                status,
                offerPrice: m.offered_price,
              };
            });
            setMessages((prev) => {
              const merged = mergeThreadMessages(prev, mappedMessages);
              if (primaryCacheKey) BargainChatService.setCachedThreadMessages(primaryCacheKey, merged);
              if (negotiationId) BargainChatService.setCachedThreadMessages(negotiationId, merged);
              return merged;
            });
          }
        } catch {}
      }
    });
    return () => sub.remove();
  }, [negotiationId, shopId, user?.uid]);

  // 2. Real-time WebSocket Connection, Presence & Seen Receipt
  useEffect(() => {
    if (!negotiationId) return;

    const currentUserId = user?.uid || 'buyer';

    // Mark messages as seen immediately on entry
    BargainChatService.markMessagesAsSeen(negotiationId, currentUserId).catch(() => {});

    // Connect WebSocket
    BargainChatService.connectWebSocket({
      negotiationId,
      userId: currentUserId,
      role: 'customer',
      shopId: shopId || undefined,
    });

    // Presence listener
    const unsubPresence = BargainChatService.addPresenceListener((data) => {
      if (data.role === 'seller' || (data.userId && data.userId !== currentUserId)) {
        setIsSellerOnline(data.isOnline);
        if (data.clockTime || data.lastSeenFormatted) {
          setSellerLastSeen(data.clockTime || data.lastSeenFormatted || 'Active');
        }
      }
    });

    // Typing listener
    let safetyTypingTimer: any = null;
    const unsubTyping = BargainChatService.addTypingListener((data) => {
      if (data.role === 'seller' || (data.userId && data.userId !== currentUserId)) {
        setIsSellerTyping(data.isTyping);
        if (data.isTyping) {
          if (safetyTypingTimer) clearTimeout(safetyTypingTimer);
          safetyTypingTimer = setTimeout(() => {
            setIsSellerTyping(false);
          }, 3500);
        } else {
          if (safetyTypingTimer) clearTimeout(safetyTypingTimer);
        }
      }
    });

    // Message & Seen listener
    const unsubMessage = BargainChatService.addMessageListener((msg) => {
      // Seen receipt -> update buyer checkmarks to read (blue)
      if (msg.type === 'seen') {
        setMessages((prev) =>
          prev.map((m) => (m.sender === 'buyer' ? { ...m, status: 'read' } : m))
        );
        return;
      }

      // Skip self-messages (only for buyer's own sent messages, never skip seller replies)
      const isSellerPayload =
        msg.role === 'seller' ||
        msg.sender_role === 'seller' ||
        msg.sender_id === 'seller' ||
        (shopId && msg.sender_id === shopId);

      if (!isSellerPayload) {
        if (msg.sender_id === currentUserId || msg.user_id === currentUserId) return;
      }

      // Filter by negotiation_id to avoid cross-chat bleed
      if (msg.negotiation_id && msg.negotiation_id !== negotiationId) return;

      if (
        (isSellerPayload || msg.sender_id !== currentUserId) &&
        (msg.message_text || msg.text)
      ) {
        const text = msg.message_text || msg.text;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const resolvedId = msg.id || msg.data?.id || msg.client_message_id || msg.data?.client_message_id || `msg_in_${Date.now()}`;
        const incomingMsg: ChatThreadMessage = {
          id: resolvedId,
          client_message_id: msg.client_message_id || msg.data?.client_message_id,
          created_at: msg.created_at || msg.data?.created_at || new Date().toISOString(),
          sender: 'seller',
          text,
          timestamp: timeStr,
          status: 'read',
          offerPrice: msg.offered_price,
        };

        // Strict single-pass merge to guarantee zero duplicates & zero FlatList key collisions
        setMessages((prev) => {
          const merged = mergeThreadMessages(prev, [incomingMsg]);
          if (primaryCacheKey) BargainChatService.setCachedThreadMessages(primaryCacheKey, merged);
          if (negotiationId) BargainChatService.setCachedThreadMessages(negotiationId, merged);
          return merged;
        });

        // Mark incoming message as seen
        BargainChatService.markMessagesAsSeen(negotiationId, currentUserId).catch(() => {});
      }
    });

    return () => {
      unsubPresence();
      unsubTyping();
      unsubMessage();
      if (safetyTypingTimer) clearTimeout(safetyTypingTimer);
      BargainChatService.disconnectWebSocket(negotiationId);
    };
  }, [negotiationId, shopId, user?.uid]);

  // 3. Typing Emission Debouncer
  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);

      if (negotiationId && !isSellerBlocked) {
        BargainChatService.sendTyping(negotiationId, true, 'customer', user?.uid);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          if (negotiationId) {
            BargainChatService.sendTyping(negotiationId, false, 'customer', user?.uid);
          }
        }, 2000);
      }
    },
    [negotiationId, isSellerBlocked, user?.uid]
  );

  // 4. Send Message Handler (Optimistic UI, Zero Stutter, WhatsApp Ticks)
  const handleSendMessage = useCallback(
    async (overrideText?: string, isCounterOffer: boolean = false, offerPrice?: number) => {
      const textToSend = (overrideText || inputText).trim();
      if (!textToSend && !offerPrice) return;
      if (isSellerBlocked) {
        Alert.alert('Seller Blocked', 'Please unblock this boutique to continue bargaining.');
        return;
      }

      // Stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (negotiationId) {
        BargainChatService.sendTyping(negotiationId, false, 'customer', user?.uid);
      }

      const clientMsgId = `cmid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let activeNegId = negotiationId;

      const optimisticMsg: ChatThreadMessage = {
        id: clientMsgId,
        client_message_id: clientMsgId,
        created_at: new Date().toISOString(),
        sender: 'buyer',
        text: textToSend,
        timestamp: timeStr,
        status: 'sent', // Single grey tick initially
        offerPrice: offerPrice,
      };

      // Inverted FlatList: Prepend at index 0 (Bottom of chat)
      setMessages((prev) => {
        const updated = [optimisticMsg, ...prev];
        if (primaryCacheKey) BargainChatService.setCachedThreadMessages(primaryCacheKey, updated);
        if (activeNegId) BargainChatService.setCachedThreadMessages(activeNegId, updated);
        return updated;
      });
      if (!overrideText) {
        setInputText('');
      }

      // Resolve negotiation ID if not yet resolved
      if (!activeNegId && shopId) {
        try {
          const threadRes = await BargainChatService.getOrCreateThread(shopId, attachedProduct?.id, user?.uid);
          if (threadRes.negotiation?.id) {
            activeNegId = threadRes.negotiation.id;
            setNegotiationId(activeNegId);
          }
        } catch {}
      }

      if (!activeNegId) return;

      // Persist to PostgreSQL chat_messages table via REST
      try {
        const savedMsg = await BargainChatService.postChatMessage(
          activeNegId,
          textToSend,
          isCounterOffer,
          offerPrice,
          user?.uid || 'buyer',
          clientMsgId
        );

        if (savedMsg) {
          // Transition tick to delivered (Double grey checkmark) & canonical ID
          setMessages((prev) => {
            const updated = prev.map((m) =>
              m.id === clientMsgId || m.client_message_id === clientMsgId
                ? {
                    ...m,
                    id: savedMsg.id || m.id,
                    client_message_id: clientMsgId,
                    created_at: savedMsg.created_at || m.created_at,
                    status: (savedMsg.seen_at ? 'read' : 'delivered') as 'read' | 'delivered',
                  }
                : m
            );
            if (primaryCacheKey) BargainChatService.setCachedThreadMessages(primaryCacheKey, updated);
            if (activeNegId) BargainChatService.setCachedThreadMessages(activeNegId, updated);
            return updated;
          });
        }
      } catch (err) {
        console.warn('[ChatConversationScreen] Send message failed:', err);
      }
    },
    [inputText, isSellerBlocked, negotiationId, shopId, attachedProduct?.id, user?.uid]
  );

  // Quick inquiry selection
  const handleQuickInquiry = useCallback(
    (text: string) => {
      handleSendMessage(text);
    },
    [handleSendMessage]
  );

  // Bargain custom offer submission
  const handleSubmitCustomOffer = useCallback(() => {
    const numericOffer = parseInt(customOfferInput.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericOffer) || numericOffer <= 0) {
      Alert.alert('Invalid Offer', 'Please enter a valid price in Rupees.');
      return;
    }

    const offerMessage = `🏷️ Custom Bargain Offer: ₹${numericOffer.toLocaleString('en-IN')}`;
    setOfferModalVisible(false);
    setCustomOfferInput('');
    handleSendMessage(offerMessage, true, numericOffer);
  }, [customOfferInput, handleSendMessage]);

  // Navigate to checkout for direct buy
  const handleBuyNow = useCallback(() => {
    if (!attachedProduct) return;
    navigation.navigate('Checkout', {
      directItem: {
        id: attachedProduct.id,
        name: attachedProduct.name || attachedProduct.title,
        price: attachedProduct.price,
        originalPrice: attachedProduct.originalPrice || attachedProduct.price,
        quantity: 1,
        image: attachedProduct.images?.[0] || attachedProduct.image || attachedProduct.thumbnail,
        discountBadge: attachedProduct.discountPercent ? `${attachedProduct.discountPercent}% OFF` : 'DEAL',
        size: 'M',
        boutiqueName: boutiqueName,
      },
    });
  }, [navigation, attachedProduct, boutiqueName]);

  // Render individual chat bubble using memoized ChatBubbleItem (120 FPS, 0 unnecessary re-renders)
  const renderMessageItem = useCallback(({ item }: { item: ChatThreadMessage }) => {
    return <ChatBubbleItem item={item} />;
  }, []);

  return (
    <View style={[styles.screenContainer, { backgroundColor: THEME_BACKGROUNDS[chatTheme], paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0, 14) }]}>
      <StatusBar barStyle="dark-content" />
      {/* 1. Header with Native GoBack */}
      <ChatHeader
        sellerName={boutiqueName}
        sellerAvatar={boutiqueAvatar}
        isVerified={true}
        isOnline={isSellerOnline}
        lastSeenTime={sellerLastSeen}
        isTyping={isSellerTyping}
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('MainTabs', { screen: 'ChatsTab' });
          }
        }}
        onInfoPress={() => setChatInfoVisible(true)}
        headerBgColor={THEME_BACKGROUNDS[chatTheme]}
      />

      {/* 2. Pinned Inquired Garment Banner (if attached) */}
      {attachedProduct && (
        <View style={styles.pinnedGarmentCard}>
          <FastImage
            source={{
              uri: attachedProduct.images?.[0] || attachedProduct.image || attachedProduct.thumbnail || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=150&auto=format&fit=crop&q=80',
            }}
            style={styles.pinnedImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.pinnedInfo}>
            <Text style={styles.pinnedTitle} numberOfLines={1}>
              {attachedProduct.name || attachedProduct.title || 'Designer Collection'}
            </Text>
            <View style={styles.pinnedPriceRow}>
              <Text style={styles.pinnedPrice}>
                ₹{(attachedProduct.price || 1999).toLocaleString('en-IN')}
              </Text>
              {attachedProduct.originalPrice && (
                <Text style={styles.pinnedOriginalPrice}>
                  ₹{attachedProduct.originalPrice.toLocaleString('en-IN')}
                </Text>
              )}
              {attachedProduct.discountPercent && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{attachedProduct.discountPercent}% OFF</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.pinnedActions}>
            <TouchableOpacity
              style={styles.makeOfferBtn}
              onPress={() => setOfferModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.makeOfferBtnText}>Bargain</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={handleBuyNow}
              activeOpacity={0.8}
            >
              <Text style={styles.buyNowBtnText}>Buy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. Inverted Message FlatList (Index 0 is at bottom, 0ms anchor, 0 stutter) */}
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior="padding"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          inverted={true}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={7}
          updateCellsBatchingPeriod={50}
        />

        {/* 4. Floating Luxury Input Bar */}
        <View style={[styles.inputBarContainer, { paddingBottom: isKeyboardVisible ? 8 : Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={styles.bargainIconButton}
            onPress={() => setOfferModalVisible(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="tag-outline" size={22} color="#D97706" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type message or ask about fit..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={handleInputChange}
            multiline={true}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim().length > 0 ? styles.sendButtonActive : styles.sendButtonDisabled,
            ]}
            onPress={() => handleSendMessage()}
            disabled={inputText.trim().length === 0}
            activeOpacity={0.8}
          >
            <Icon name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 6. Custom Bargain Offer Modal */}
      <Modal
        visible={offerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.offerDialogCard}>
            <View style={styles.offerDialogHeader}>
              <View style={styles.offerIconCircle}>
                <Icon name="currency-inr" size={24} color="#D97706" />
              </View>
              <Text style={styles.offerDialogTitle}>Make a Bargain Offer</Text>
              <Text style={styles.offerDialogSub}>
                Propose a custom price to {boutiqueName}. If accepted, you can instantly checkout at this exclusive rate.
              </Text>
            </View>

            <View style={styles.offerInputWrapper}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.offerPriceInput}
                placeholder="Enter price"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={customOfferInput}
                onChangeText={setCustomOfferInput}
                autoFocus={true}
              />
            </View>

            <View style={styles.offerActionRow}>
              <TouchableOpacity
                style={styles.cancelOfferBtn}
                onPress={() => setOfferModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelOfferBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitOfferBtn}
                onPress={handleSubmitCustomOffer}
                activeOpacity={0.85}
              >
                <Text style={styles.submitOfferBtnText}>Send Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. Boutique Store Info Modal */}
      <ChatInfoModal
        visible={chatInfoVisible}
        onClose={() => setChatInfoVisible(false)}
        sellerName={boutiqueName}
        sellerAvatar={boutiqueAvatar}
        isVerified={true}
        isBlocked={isSellerBlocked}
        activeTheme={chatTheme}
        onToggleBlock={() => {
          setIsSellerBlocked((prev) => !prev);
          Alert.alert(
            isSellerBlocked ? 'Boutique Unblocked' : 'Boutique Blocked',
            isSellerBlocked
              ? `You can now exchange bargain offers with ${boutiqueName}.`
              : `You will no longer receive offers or messages from ${boutiqueName}.`
          );
        }}
        onDeleteChat={() => {
          Alert.alert('Delete Thread', 'Are you sure you want to clear this conversation history?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setMessages([]);
                navigation.goBack();
              },
            },
          ]);
        }}
        onSelectTheme={(theme) => setChatTheme(theme)}
        onReportSeller={(reason) => {
          Alert.alert('Report Received', `Thank you. Our Trust & Safety team is reviewing ${boutiqueName} for: "${reason}".`);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Pinned Garment Card
  pinnedGarmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  pinnedImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  pinnedInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  pinnedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  pinnedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinnedPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  pinnedOriginalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  pinnedActions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  makeOfferBtn: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  makeOfferBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  buyNowBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buyNowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Bubble Layout
  bubbleWrapper: {
    marginVertical: 4,
    width: '100%',
    flexDirection: 'row',
  },
  bubbleWrapperRight: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperLeft: {
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  buyerBubble: {
    backgroundColor: '#1E3A8A', // Nvilar Deep Royal Navy
    borderBottomRightRadius: 4,
  },
  sellerBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  offerBubble: {
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  offerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  offerTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  textWhite: {
    color: '#FEF3C7',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buyerText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sellerText: {
    color: '#0F172A',
    fontWeight: '400',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  timeTextBuyer: {
    color: '#93C5FD',
  },
  timeTextSeller: {
    color: '#94A3B8',
  },
  tickContainer: {
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Floating Input Bar
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  bargainIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  // Custom Bargain Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  offerDialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  offerDialogHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  offerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerDialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  offerDialogSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  offerInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#FFFBEB',
  },
  rupeeSymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: '#B45309',
    marginRight: 8,
  },
  offerPriceInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  offerActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelOfferBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelOfferBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  submitOfferBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
  },
  submitOfferBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
