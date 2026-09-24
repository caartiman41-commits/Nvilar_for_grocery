import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BargainChatService } from '../../services/BargainChatService';
import { ChatHeader } from './components/ChatHeader';
import { ChatInfoModal, ChatThemeMode } from './components/ChatInfoModal';
import { QuickInquiryChips } from './components/QuickInquiryChips';
import { useSellerStore } from '../seller/sellerStore';
import { useAuthStore } from '../auth/authStore';

export interface ChatThreadMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  offerPrice?: number;
}

const THEME_BACKGROUNDS: Record<ChatThemeMode, string> = {
  white: '#FFFFFF',
  dusk: '#F1F5F9',
  ivory: '#FAF7F2',
};

interface StoryBoutique {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  boutiqueName: string;
  avatar: string;
  verified: boolean;
  hasStoryRing?: boolean;
  isOnline: boolean;
  lastMessage: string;
  time: string;
  status: 'deal_pending' | 'deal_done';
  statusLabel: string;
}

const STORIES: StoryBoutique[] = [
  {
    id: 's1',
    name: 'Mitren...',
    avatar: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    isActive: true,
  },
  {
    id: 's2',
    name: 'The Thrift...',
    avatar: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    isActive: true,
  },
  {
    id: 's3',
    name: 'Vintage...',
    avatar: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150&auto=format&fit=crop&q=80',
    rating: 4.5,
    isActive: false,
  },
  {
    id: 's4',
    name: 'StreetLab...',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    isActive: true,
  },
];

const CHATS_LIST: ChatMessage[] = [
  {
    id: 'c1',
    boutiqueName: 'Mitreno.com',
    avatar: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
    verified: true,
    isOnline: true,
    lastMessage: '✓ 🏷️ Produ... · 08:19 pm',
    time: '08:19 pm',
    status: 'deal_pending',
    statusLabel: 'Deal Pending',
  },
  {
    id: 'c2',
    boutiqueName: 'The Thrift Garage',
    avatar: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=150&auto=format&fit=crop&q=80',
    verified: true,
    hasStoryRing: true,
    isOnline: true,
    lastMessage: '✓ Active now · 10:24 AM',
    time: '10:24 AM',
    status: 'deal_done',
    statusLabel: 'Deal Done',
  },
  {
    id: 'c3',
    boutiqueName: 'Vintage Vault',
    avatar: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150&auto=format&fit=crop&q=80',
    verified: true,
    isOnline: true,
    lastMessage: '✓ Counter-offer of ₹1,850 ready · Yesterday',
    time: 'Yesterday',
    status: 'deal_pending',
    statusLabel: 'Deal Pending',
  },
  {
    id: 'c4',
    boutiqueName: 'StreetStyle Studio',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    verified: true,
    isOnline: false,
    lastMessage: '✓ Tracking ID sent for your order · 2d ago',
    time: '2d ago',
    status: 'deal_done',
    statusLabel: 'Deal Done',
  },
];

export interface ChatsScreenProps {
  route?: {
    params?: {
      attachedProduct?: any;
      product?: any;
      conversation_id?: string;
      conversationId?: string;
    };
  };
}

export const ChatsScreen: React.FC<ChatsScreenProps> = memo(({ route: propRoute }) => {
  let navRoute: any;
  try {
    navRoute = useRoute<any>();
  } catch {
    navRoute = null;
  }

  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<'all' | 'deal_done' | 'deal_pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatMessage[]>(CHATS_LIST);
  const flatListRef = useRef<FlatList>(null);
  const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);
  const [chatInfoVisible, setChatInfoVisible] = useState(false);
  const [isSellerBlocked, setIsSellerBlocked] = useState(false);
  const [chatTheme, setChatTheme] = useState<ChatThemeMode>('ivory');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [threadMessages, setThreadMessages] = useState<ChatThreadMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'seller',
      text: 'Namaste! Welcome to our boutique live bargain window. Feel free to make a custom offer or ask about real photos & sizing.',
      timestamp: '10:30 AM',
      status: 'read',
    },
  ]);
  const user = useAuthStore((s) => s.user);
  const [newMsgText, setNewMsgText] = useState('');
  const [isSellerTyping, setIsSellerTyping] = useState<boolean>(false);
  const buyerTypingTimeoutRef = useRef<any>(null);

  // Send real-time typing indicator with 2-second debounce
  const handleTextChange = useCallback(
    (text: string) => {
      setNewMsgText(text);

      if (selectedChat?.id && !isSellerBlocked) {
        // Emit typing = true immediately
        BargainChatService.sendTyping(selectedChat.id, true, 'customer', user?.uid);

        if (buyerTypingTimeoutRef.current) {
          clearTimeout(buyerTypingTimeoutRef.current);
        }
        buyerTypingTimeoutRef.current = setTimeout(() => {
          if (selectedChat?.id) {
            BargainChatService.sendTyping(selectedChat.id, false, 'customer', user?.uid);
          }
        }, 2000);
      }
    },
    [selectedChat?.id, isSellerBlocked, user?.uid]
  );

  // Manage Real-time WebSocket, Typing events, and IST Presence synchronization
  useEffect(() => {
    if (!selectedChat?.id) {
      setIsSellerTyping(false);
      return;
    }

    const currentUserId = user?.uid || 'buyer';
    BargainChatService.connectWebSocket({
      negotiationId: selectedChat.id,
      userId: currentUserId,
      role: 'customer',
      shopId: selectedChat.boutiqueName,
    });

    // 1. Fetch authentic IST clock time and online status from PostgreSQL
    BargainChatService.getUserPresence(selectedChat.id).then((presence) => {
      if (presence) {
        setSelectedChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isOnline: presence.isOnline,
            time: presence.clockTime || prev.time,
          };
        });
      }
    });

    // 2. Real-time typing listener (instant WhatsApp-style switch)
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

    // 3. Real-time presence listener (Online/Offline status)
    const unsubPresence = BargainChatService.addPresenceListener((data) => {
      if (data.role === 'seller' || (data.userId && data.userId !== currentUserId)) {
        setSelectedChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isOnline: data.isOnline,
            time: data.clockTime || data.lastSeenFormatted || prev.time,
          };
        });
      }
    });

    // 4. Real-time message listener
    const unsubMessage = BargainChatService.addMessageListener((msg) => {
      if (msg.role === 'seller' && (msg.message_text || msg.text)) {
        const incomingText = msg.message_text || msg.text;
        const timeStr =
          msg.last_seen_clock ||
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setThreadMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [
            ...prev,
            {
              id: msg.id || `msg_incoming_${Date.now()}`,
              sender: 'seller',
              text: incomingText,
              timestamp: timeStr,
              status: 'read',
              offerPrice: msg.offered_price,
            },
          ];
        });
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    });

    return () => {
      unsubTyping();
      unsubPresence();
      unsubMessage();
      if (safetyTypingTimer) clearTimeout(safetyTypingTimer);
      BargainChatService.disconnectWebSocket();
    };
  }, [selectedChat?.id, user?.uid]);

  // Keyboard visibility tracking for floating input bar
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

  const handleOpenChat = useCallback((chat: ChatMessage) => {
    setSelectedChat(chat);
    // If real backend negotiation ID, load thread messages from Go backend PostgreSQL!
    if (chat.id && !chat.id.startsWith('chat_')) {
      BargainChatService.getChatThread(chat.id)
        .then((res) => {
          if (res.messages && res.messages.length > 0) {
            const mappedBackendMessages: ChatThreadMessage[] = res.messages.map((m: any) => ({
              id: m.id,
              sender: m.sender_id === 'seller' ? 'seller' : 'buyer',
              text: m.message_text || m.text,
              timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: m.seen_at ? 'read' : 'sent',
              offerPrice: m.offered_price,
            }));
            setThreadMessages(mappedBackendMessages);
            return;
          }
        })
        .catch(() => {});
    }

    setThreadMessages([
      {
        id: `msg_init_1`,
        sender: 'seller',
        text: `Namaste! Welcome to ${chat.boutiqueName}. How can we assist you with our designer pieces today?`,
        timestamp: '10:15 AM',
        status: 'read',
      },
      {
        id: `msg_init_2`,
        sender: 'buyer',
        text: chat.lastMessage.startsWith('✓') ? chat.lastMessage.substring(2).trim() : chat.lastMessage,
        timestamp: chat.time || '10:24 AM',
        status: 'read',
      },
    ]);
  }, []);

  // Load live customer negotiations & chats from Go backend
  useEffect(() => {
    let isMounted = true;
    BargainChatService.getCustomerChats()
      .then((liveChats) => {
        if (isMounted && liveChats && liveChats.length > 0) {
          const mapped: ChatMessage[] = liveChats.map((lc) => ({
            id: lc.id,
            boutiqueName: lc.shop?.name || 'Boutique',
            avatar:
              lc.shop?.logo_url ||
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
            verified: lc.shop?.is_verified ?? true,
            isOnline: true,
            lastMessage: lc.messages?.[lc.messages.length - 1]?.message_text || 'Active Bargain Negotiation',
            time: 'Recently',
            status: lc.status === 'accepted' ? 'deal_done' : 'deal_pending',
            statusLabel: lc.status === 'accepted' ? 'Deal Accepted' : 'Deal Pending',
          }));
          setChats(mapped);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle product passed from PDP (e.g. when user taps 'Send Message for make offer 🎉')
  const attachedProduct =
    propRoute?.params?.attachedProduct ||
    propRoute?.params?.product ||
    navRoute?.params?.attachedProduct ||
    navRoute?.params?.product;

  useEffect(() => {
    if (attachedProduct) {
      const sellerName =
        attachedProduct.seller?.name ||
        attachedProduct.boutiqueName ||
        'Sarojini Exclusive';
      const sellerAvatar =
        attachedProduct.seller?.avatar ||
        (Array.isArray(attachedProduct.images) && attachedProduct.images[0]) ||
        attachedProduct.image ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80';
      const bargainMsg = `Bargain inquiry for ${attachedProduct.name} (Offer: ₹${attachedProduct.price})`;

      const activeChat: ChatMessage = {
        id: `chat_${attachedProduct.id || 'p1'}`,
        boutiqueName: sellerName,
        avatar: sellerAvatar,
        verified: attachedProduct.seller?.verified ?? true,
        isOnline: true,
        lastMessage: bargainMsg,
        time: 'Just now',
        status: 'deal_pending',
        statusLabel: 'Deal Pending',
      };

      setSelectedChat(activeChat);
      setThreadMessages([
        {
          id: 'msg_seller_welcome',
          sender: 'seller',
          text: `Namaste! Welcome to ${sellerName}. We are online and happy to negotiate on ${attachedProduct.name}.`,
          timestamp: 'Just now',
          status: 'read',
        },
        {
          id: `msg_buyer_inquiry_${Date.now()}`,
          sender: 'buyer',
          text: bargainMsg,
          timestamp: 'Just now',
          status: 'sent',
          offerPrice: attachedProduct.price,
        },
      ]);

      // Connect to Go backend to initialize or fetch live negotiation row from PostgreSQL!
      BargainChatService.getChatThread({
        productId: attachedProduct.id,
        shopId: attachedProduct.seller?.shopId || attachedProduct.shop_id || attachedProduct.shopId,
      })
        .then((res) => {
          if (res.negotiation?.id) {
            setSelectedChat((prev) => (prev ? { ...prev, id: res.negotiation.id } : null));
            if (res.messages && res.messages.length > 0) {
              const mapped: ChatThreadMessage[] = res.messages.map((m: any) => ({
                id: m.id,
                sender: m.sender_id === 'seller' ? 'seller' : 'buyer',
                text: m.message_text || m.text,
                timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                status: m.seen_at ? 'read' : 'sent',
                offerPrice: m.offered_price,
              }));
              setThreadMessages(mapped);
            }
          }
        })
        .catch(() => {});

      setChats((prev) => {
        const exists = prev.some((c) => c.boutiqueName.toLowerCase() === sellerName.toLowerCase());
        if (exists) {
          return prev.map((c) =>
            c.boutiqueName.toLowerCase() === sellerName.toLowerCase()
              ? { ...c, lastMessage: bargainMsg, time: 'Just now' }
              : c
          );
        }
        return [activeChat, ...prev];
      });
    }
  }, [attachedProduct]);

  // Handle deep-link routing with conversation_id
  const deepLinkConvId =
    propRoute?.params?.conversation_id ||
    propRoute?.params?.conversationId ||
    navRoute?.params?.conversation_id ||
    navRoute?.params?.conversationId;

  useEffect(() => {
    if (deepLinkConvId) {
      const existing = chats.find((c) => c.id === deepLinkConvId);
      if (existing) {
        handleOpenChat(existing);
      } else {
        const directChat: ChatMessage = {
          id: deepLinkConvId,
          boutiqueName: 'Mitreno Boutique',
          avatar:
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
          verified: true,
          isOnline: true,
          lastMessage: 'Active Live Bargain',
          time: 'Just now',
          status: 'deal_pending',
          statusLabel: 'Deal Pending',
        };
        handleOpenChat(directChat);
      }
    }
  }, [deepLinkConvId, chats, handleOpenChat]);

  const filteredChats = chats.filter((chat) => {
    if (activeFilter !== 'all' && chat.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      return chat.boutiqueName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleSendMessage = useCallback(
    (overrideText?: string, customOfferPrice?: number) => {
      const textToSend = (overrideText || newMsgText).trim();
      if (!textToSend || isSellerBlocked) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const buyerMessage: ChatThreadMessage = {
        id: `msg_buyer_${Date.now()}`,
        sender: 'buyer',
        text: textToSend,
        timestamp: timeStr,
        status: 'sent',
        offerPrice: customOfferPrice,
      };

      setThreadMessages((prev) => [...prev, buyerMessage]);
      setNewMsgText('');

      // Clear typing indicator on message send
      if (buyerTypingTimeoutRef.current) {
        clearTimeout(buyerTypingTimeoutRef.current);
        buyerTypingTimeoutRef.current = null;
      }
      if (selectedChat?.id) {
        BargainChatService.sendTyping(selectedChat.id, false, 'customer', user?.uid);
      }

      // Update parent chat list last message preview
      if (selectedChat) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedChat.id
              ? { ...c, lastMessage: textToSend, time: 'Just now' }
              : c
          )
        );
      }

      // Auto-scroll immediately
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 60);

      // 1. Direct REST & WebSocket Call to Go Backend -> Writes to PostgreSQL database & alerts participants!
      if (selectedChat?.id && !selectedChat.id.startsWith('chat_')) {
        BargainChatService.sendWebSocketMessage(
          selectedChat.id,
          textToSend,
          user?.uid || 'buyer',
          'customer',
          customOfferPrice
        );
        BargainChatService.postChatMessage(
          selectedChat.id,
          textToSend,
          !!customOfferPrice,
          customOfferPrice
        ).catch((err) => {
          console.warn('[ChatsScreen] Go backend postChatMessage error:', err);
        });
      } else if (attachedProduct) {
        // Fallback: Start live negotiation in Go backend
        BargainChatService.startNegotiation(
          attachedProduct.id,
          attachedProduct.seller?.shopId || attachedProduct.shop_id || 'shop_mitreno',
          customOfferPrice || attachedProduct.price || 1999
        )
          .then((res) => {
            if (res.negotiation?.id) {
              setSelectedChat((prev) => (prev ? { ...prev, id: res.negotiation!.id } : null));
              BargainChatService.sendWebSocketMessage(
                res.negotiation.id,
                textToSend,
                user?.uid || 'buyer',
                'customer',
                customOfferPrice
              );
              BargainChatService.postChatMessage(
                res.negotiation.id,
                textToSend,
                !!customOfferPrice,
                customOfferPrice
              );
            }
          })
          .catch(() => {});
      }

      // 2. Direct Sync with Seller Studio Store (for seamless instant local preview)
      try {
        useSellerStore.getState().receiveCustomerMessage(
          'Customer (You)',
          attachedProduct?.name || selectedChat?.boutiqueName || 'Designer Garment',
          textToSend,
          attachedProduct?.images?.[0] || selectedChat?.avatar,
          customOfferPrice
        );
      } catch {}

      // 3. Realistic Boutique Seller Response after 1.2s (with WhatsApp-style typing indicator)
      if (!selectedChat?.id || selectedChat.id.startsWith('chat_')) {
        // Show seller typing indicator after 350ms
        setTimeout(() => {
          setIsSellerTyping(true);
        }, 350);

        setTimeout(() => {
          setIsSellerTyping(false);
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let replyText = 'Thanks for reaching out! We have reserved this item for you. Dispatches in 24 hours via express courier.';

          const lower = textToSend.toLowerCase();
          if (
            customOfferPrice ||
            lower.includes('discount') ||
            lower.includes('combo') ||
            lower.includes('₹') ||
            lower.includes('offer')
          ) {
            replyText = `Great offer! We can accept ₹${
              customOfferPrice || Math.max(100, (attachedProduct?.price || 2000) - 200)
            } for quick checkout. Unlocked instant dispatch! 🎉`;
          } else if (lower.includes('available')) {
            replyText = 'Yes, this piece is 100% in stock and ready for immediate packing and dispatch!';
          } else if (lower.includes('photo') || lower.includes('fit') || lower.includes('check')) {
            replyText =
              'Real daylight photos and video fit check sent! It has a relaxed premium silhouette with high GSM weave.';
          } else if (lower.includes('dispatch') || lower.includes('today')) {
            replyText =
              'Yes! Intra-city express riders are available. If you order now, dispatch happens within 30-45 minutes.';
          }

          const sellerReplyMsg: ChatThreadMessage = {
            id: `msg_seller_${Date.now()}`,
            sender: 'seller',
            text: replyText,
            timestamp: replyTime,
            status: 'read',
          };

          setThreadMessages((prev) => [...prev, sellerReplyMsg]);

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, 1300);
      }
    },
    [newMsgText, selectedChat, isSellerBlocked, attachedProduct, user?.uid]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header: mitreno.chats v + Compose Icon */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerTitleRow} activeOpacity={0.7}>
          <Text style={styles.headerTitle}>mitreno.chats</Text>
          <Icon name="chevron-down" size={20} color="#1E293B" style={{ marginLeft: 2 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.composeBtn} activeOpacity={0.7}>
          <Icon name="square-edit-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search or ask AI Bar */}
        <View style={styles.searchBarContainer}>
          <Icon name="magnify" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or ask AI"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills (All Messages 4, Deal Done 1, Deal Pending) */}
        <View style={styles.filterPillsRow}>
          {/* All Messages */}
          <TouchableOpacity
            style={[styles.pill, activeFilter === 'all' ? styles.activePill : styles.inactivePill]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, activeFilter === 'all' && styles.activePillText]}>
              All Messages
            </Text>
            <View style={[styles.countBadge, activeFilter === 'all' ? styles.countBadgeActive : styles.countBadgeInactive]}>
              <Text style={[styles.countBadgeText, activeFilter === 'all' && styles.countBadgeTextActive]}>
                4
              </Text>
            </View>
          </TouchableOpacity>

          {/* Deal Done */}
          <TouchableOpacity
            style={[styles.pill, activeFilter === 'deal_done' ? styles.dealDoneActive : styles.dealDoneInactive]}
            onPress={() => setActiveFilter('deal_done')}
            activeOpacity={0.8}
          >
            <View style={styles.greenDot} />
            <Text style={styles.dealDoneText}>Deal Done</Text>
            <View style={styles.dealDoneCount}>
              <Text style={styles.dealDoneCountText}>1</Text>
            </View>
          </TouchableOpacity>

          {/* Deal Pending */}
          <TouchableOpacity
            style={[styles.pill, activeFilter === 'deal_pending' ? styles.dealPendingActive : styles.dealPendingInactive]}
            onPress={() => setActiveFilter('deal_pending')}
            activeOpacity={0.8}
          >
            <View style={styles.orangeDot} />
            <Text style={styles.dealPendingText}>Deal Pending</Text>
          </TouchableOpacity>
        </View>

        {/* Top Active Stories / Notes Carousel */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
            {STORIES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.storyItem} activeOpacity={0.8}>
                <View style={styles.storyBadgeSlot}>
                  {item.isActive ? (
                    <View style={styles.activeBadgePill}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                      <View style={styles.activePillDot} />
                    </View>
                  ) : (
                    <View style={styles.inactiveBadgePlaceholder} />
                  )}
                </View>
                <View style={styles.avatarWrapper}>
                  <FastImage source={{ uri: item.avatar }} style={styles.storyAvatar as any} />
                  {item.isActive && <View style={styles.onlineDotOverlay} />}
                </View>
                <View style={styles.storyNameRow}>
                  <Text style={styles.storyName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Icon name="check-decagram" size={13} color={colors.verifiedBlue} />
                </View>
                <Text style={styles.storyRating}>★ {item.rating}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages Header Row (Messages / Requests) */}
        <View style={styles.messagesSectionHeader}>
          <Text style={styles.messagesTitle}>Messages</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.requestsLink}>Requests</Text>
          </TouchableOpacity>
        </View>

        {/* Chat List Items */}
        <View style={styles.chatListContainer}>
          {filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatRow}
              onPress={() => handleOpenChat(chat)}
              activeOpacity={0.7}
            >
              {/* Avatar with optional story gradient ring */}
              <View style={[styles.chatAvatarRing, chat.hasStoryRing && styles.storyRingBorder]}>
                <FastImage source={{ uri: chat.avatar }} style={styles.chatAvatar as any} />
                {chat.isOnline && <View style={styles.chatOnlineDot} />}
              </View>

              {/* Chat Info */}
              <View style={styles.chatInfoCol}>
                <View style={styles.nameVerifiedRow}>
                  <Text style={styles.chatBoutiqueName}>{chat.boutiqueName}</Text>
                  {chat.verified && (
                    <Icon name="check-decagram" size={14} color={colors.verifiedBlue} style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.chatLastMsg} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>

              {/* Status Pill Badge (Deal Pending / Deal Done) */}
              <View style={[styles.statusPill, chat.status === 'deal_done' ? styles.statusPillDone : styles.statusPillPending]}>
                <View style={[styles.statusDot, chat.status === 'deal_done' ? styles.greenDot : styles.orangeDot]} />
                <Text style={[styles.statusPillText, chat.status === 'deal_done' ? styles.statusDoneText : styles.statusPendingText]}>
                  {chat.statusLabel}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Live Negotiation Chat Modal */}
      <Modal
        visible={!!selectedChat}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setSelectedChat(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.dmContainer, { backgroundColor: THEME_BACKGROUNDS[chatTheme] }]}
          keyboardVerticalOffset={0}
        >
          {/* 1. REVAMPED TOP CHAT HEADER (Screenshot 2) */}
          <View style={{ paddingTop: insets.top }}>
            <ChatHeader
              sellerName={selectedChat?.boutiqueName || 'Street Drops'}
              sellerAvatar={selectedChat?.avatar}
              isVerified={selectedChat?.verified ?? true}
              isOnline={selectedChat?.isOnline ?? true}
              isTyping={isSellerTyping}
              lastSeenTime={
                selectedChat?.time?.includes(':')
                  ? `Today at ${selectedChat.time}`
                  : '10:45 AM'
              }
              onBack={() => setSelectedChat(null)}
              onInfoPress={() => setChatInfoVisible(true)}
              headerBgColor={THEME_BACKGROUNDS[chatTheme]}
            />
          </View>

          {/* Blocked Seller Banner (if blocked) */}
          {isSellerBlocked && (
            <View style={styles.blockedBanner}>
              <Icon name="block-helper" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.blockedBannerText}>
                You have blocked this boutique. You will not receive new messages.
              </Text>
            </View>
          )}

          {/* Attached Pinned Garment Card (When routed from PDP) */}
          {attachedProduct && (
            <View style={styles.pinnedProductCard}>
              <FastImage
                source={{
                  uri:
                    (Array.isArray(attachedProduct.images) && attachedProduct.images[0]) ||
                    attachedProduct.image ||
                    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=150&auto=format&fit=crop&q=80',
                }}
                style={styles.pinnedProductImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.pinnedProductDetails}>
                <View style={styles.pinnedTagRow}>
                  <Text style={styles.pinnedBadge}>🏷️ INQUIRED GARMENT</Text>
                  <Text style={styles.pinnedActiveTag}>🔥 Live Bargain Active</Text>
                </View>
                <Text style={styles.pinnedTitle} numberOfLines={1}>
                  {attachedProduct.name || 'Boutique Designer Garment'}
                </Text>
                <View style={styles.pinnedPriceRow}>
                  <Text style={styles.pinnedPrice}>₹{attachedProduct.price}</Text>
                  {attachedProduct.originalPrice ? (
                    <Text style={styles.pinnedOriginalPrice}>₹{attachedProduct.originalPrice}</Text>
                  ) : null}
                  {attachedProduct.discountPercent ? (
                    <Text style={styles.pinnedDiscount}>({attachedProduct.discountPercent}% OFF)</Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {/* 2. CHAT MESSAGES THREAD (FlatList with Auto-Scroll & Status Ticks) */}
          <FlatList
            ref={flatListRef}
            data={threadMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.dmList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isBuyer = item.sender === 'buyer';
              return (
                <View style={[styles.dmBubble, isBuyer ? styles.dmBubbleOut : styles.dmBubbleIn]}>
                  <Text style={[styles.dmBubbleText, isBuyer && styles.dmBubbleTextOut]}>
                    {item.text}
                  </Text>
                  {item.offerPrice ? (
                    <View style={styles.bubbleOfferTag}>
                      <Icon name="check-decagram" size={12} color="#10B981" style={{ marginRight: 3 }} />
                      <Text style={styles.bubbleOfferText}>Proposed Offer: ₹{item.offerPrice}</Text>
                    </View>
                  ) : null}
                  <View style={styles.bubbleMetaRow}>
                    <Text style={[styles.bubbleTimeText, isBuyer && styles.bubbleTimeTextOut]}>
                      {item.timestamp}
                    </Text>
                    {isBuyer ? (
                      <Icon
                        name="check-all"
                        size={14}
                        color={item.status === 'read' ? '#38BDF8' : '#94A3B8'}
                        style={{ marginLeft: 4 }}
                      />
                    ) : null}
                  </View>
                </View>
              );
            }}
          />

          {/* 3. QUICK INQUIRY PILL CHIPS ROW (Screenshot 2) */}
          {!isSellerBlocked && (
            <QuickInquiryChips onSelectInquiry={(text) => handleSendMessage(text)} />
          )}

          {/* 4. FLOATING INPUT BAR (Docked right above keyboard) */}
          <View
            style={[
              styles.dmInputBar,
              {
                paddingBottom: isKeyboardVisible
                  ? Platform.OS === 'android' ? 8 : 10
                  : Math.max(insets.bottom, 12),
              },
            ]}
          >
            <TextInput
              style={styles.dmInput}
              placeholder={`Message ${selectedChat?.boutiqueName || 'Street Drops'}...`}
              placeholderTextColor="#94A3B8"
              value={newMsgText}
              onChangeText={handleTextChange}
              editable={!isSellerBlocked}
              returnKeyType="send"
              onSubmitEditing={() => handleSendMessage()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.dmSendBtn,
                (newMsgText.trim().length === 0 || isSellerBlocked) && styles.dmSendBtnDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={newMsgText.trim().length === 0 || isSellerBlocked}
              activeOpacity={0.8}
            >
              <Icon name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* 5. CHAT INFO BOTTOM SHEET MODAL */}
        <ChatInfoModal
          visible={chatInfoVisible}
          onClose={() => setChatInfoVisible(false)}
          sellerName={selectedChat?.boutiqueName || 'Street Drops'}
          sellerAvatar={selectedChat?.avatar}
          isVerified={selectedChat?.verified ?? true}
          isBlocked={isSellerBlocked}
          activeTheme={chatTheme}
          onToggleBlock={() => setIsSellerBlocked((prev) => !prev)}
          onDeleteChat={() => setThreadMessages([])}
          onSelectTheme={(theme) => setChatTheme(theme)}
          onReportSeller={(reason) => {
            console.log('Reported seller for:', reason);
          }}
        />
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  composeBtn: {
    padding: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  activePill: {
    backgroundColor: '#1E293B',
  },
  inactivePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: '#334155',
  },
  countBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  countBadgeTextActive: {
    color: '#FFFFFF',
  },
  dealDoneActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  dealDoneInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dealDoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  dealDoneCount: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 5,
  },
  dealDoneCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  dealPendingActive: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  dealPendingInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  dealPendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  orangeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  storiesContainer: {
    marginBottom: 16,
  },
  storiesScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyBadgeSlot: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  inactiveBadgePlaceholder: {
    height: 18,
    backgroundColor: 'transparent',
  },
  activeBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 3,
  },
  activePillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  avatarWrapper: {
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 2,
    marginBottom: 4,
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  onlineDotOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 2,
  },
  storyRating: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E68A00',
    marginTop: 1,
  },
  messagesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  messagesTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  requestsLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  chatListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  chatAvatarRing: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  storyRingBorder: {
    borderColor: '#F43F5E',
  },
  chatAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  chatOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfoCol: {
    flex: 1,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  chatBoutiqueName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatLastMsg: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusPillDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusDot: {
    marginRight: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPendingText: {
    color: '#D97706',
  },
  statusDoneText: {
    color: '#059669',
  },
  dmContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dmHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dmBoutiqueName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  dmStatusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  dmList: {
    padding: 16,
    gap: 10,
  },
  dmBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  dmBubbleIn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  dmBubbleOut: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E293B',
    borderBottomRightRadius: 4,
  },
  dmBubbleText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  dmBubbleTextOut: {
    color: '#FFFFFF',
  },
  dmInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  dmInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dmSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dmSendBtnDisabled: {
    opacity: 0.45,
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
  },
  blockedBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
  },
  pinnedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pinnedProductImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  pinnedProductDetails: {
    flex: 1,
    marginLeft: 10,
  },
  pinnedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pinnedBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  pinnedActiveTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
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
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  pinnedOriginalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  pinnedDiscount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  bubbleOfferTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bubbleOfferText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  bubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  bubbleTimeText: {
    fontSize: 10,
    color: '#64748B',
  },
  bubbleTimeTextOut: {
    color: '#94A3B8',
  },
});
