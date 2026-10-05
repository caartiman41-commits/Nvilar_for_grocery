import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { BargainChatService } from '../../services/BargainChatService';

interface StoryBoutique {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  negotiationId?: string;
  shopId?: string;
  boutiqueName: string;
  avatar: string;
  verified: boolean;
  hasStoryRing?: boolean;
  isOnline: boolean;
  lastMessage: string;
  lastMessageSender?: 'buyer' | 'seller';
  lastMessageStatus?: 'sent' | 'delivered' | 'read';
  time: string;
  unreadCount?: number;
  status: 'deal_pending' | 'deal_done';
  statusLabel: string;
  isTyping?: boolean;
}

const STORIES: StoryBoutique[] = [
  {
    id: 'shop_KD56AHEq_42723',
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

export interface ChatsScreenProps {
  route?: {
    params?: {
      attachedProduct?: any;
      product?: any;
      conversation_id?: string;
      conversationId?: string;
      negotiationId?: string;
      shopId?: string;
      seller?: {
        shopId?: string;
        name?: string;
        avatar?: string;
        verified?: boolean;
        isOnline?: boolean;
      };
      boutiqueName?: string;
      avatar?: string;
    };
  };
}

export const ChatsScreen: React.FC<ChatsScreenProps> = memo(({ route: propRoute }) => {
  const navigation = useNavigation<any>();
  let navRoute: any;
  try {
    navRoute = useRoute<any>();
  } catch {
    navRoute = null;
  }

  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<'all' | 'deal_done' | 'deal_pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Deep-link / route parameter handler: Navigate to ChatConversation screen seamlessly
  const incomingParams = propRoute?.params || navRoute?.params;
  useEffect(() => {
    if (incomingParams && (incomingParams.seller || incomingParams.attachedProduct || incomingParams.product || incomingParams.conversation_id || incomingParams.negotiationId || incomingParams.shopId)) {
      const targetShopId = incomingParams.shopId || incomingParams.seller?.shopId || incomingParams.attachedProduct?.seller?.shopId || incomingParams.product?.seller?.shopId;
      const targetBoutiqueName = incomingParams.boutiqueName || incomingParams.seller?.name || incomingParams.attachedProduct?.seller?.name || incomingParams.product?.seller?.name || 'Mitreno Boutique';
      const targetAvatar = incomingParams.avatar || incomingParams.seller?.avatar || incomingParams.attachedProduct?.seller?.avatar || incomingParams.product?.seller?.avatar;
      const targetNegId = incomingParams.negotiationId || incomingParams.conversationId || incomingParams.conversation_id;
      const targetProduct = incomingParams.attachedProduct || incomingParams.product;

      navigation.navigate('ChatConversation', {
        negotiationId: targetNegId,
        shopId: targetShopId,
        boutiqueName: targetBoutiqueName,
        avatar: targetAvatar,
        product: targetProduct,
      });
    }
  }, [incomingParams, navigation]);

  // Fetch live customer chats from Go backend / PostgreSQL
  const loadCustomerChats = useCallback(async () => {
    try {
      const remoteChats = await BargainChatService.getCustomerChats();
      if (Array.isArray(remoteChats)) {
        if (remoteChats.length === 0) {
          setChats((prev) => (prev.length > 0 ? prev : []));
          return;
        }
        const mapped: ChatMessage[] = remoteChats.map((rc: any) => {
          const isDealDone = rc.status === 'agreed' || rc.deal_status === 'accepted' || rc.status === 'accepted';
          return {
            id: rc.id || rc.negotiation_id,
            negotiationId: rc.negotiation_id || rc.id,
            shopId: rc.shop_id || rc.shop?.id,
            boutiqueName: rc.shop_name || rc.boutique_name || rc.shop?.name || 'Mitreno Boutique',
            avatar: rc.shop_avatar || rc.avatar || rc.shop?.logo_url || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
            verified: rc.verified ?? rc.shop?.is_verified ?? true,
            isOnline: true,
            lastMessage: rc.last_message_text || rc.last_message?.message_text || rc.last_message || 'Active Bargain Discussion',
            lastMessageSender: rc.last_message_sender || 'seller',
            lastMessageStatus: (rc.last_message_status === 'read' || rc.last_message?.seen_at) ? 'read' : 'delivered',
            time: rc.time || (rc.last_message?.created_at ? new Date(rc.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
            unreadCount: rc.unread_count || 0,
            status: isDealDone ? 'deal_done' : 'deal_pending',
            statusLabel: isDealDone ? 'Deal Done' : 'Deal Pending',
          };
        });
        setChats(mapped);
      }
    } catch (err) {
      console.warn('[ChatsScreen] Live customer chats fetch error:', err);
    }
  }, []);

  useEffect(() => {
    loadCustomerChats();
  }, [loadCustomerChats]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadCustomerChats();
    setIsRefreshing(false);
  }, [loadCustomerChats]);

  // Navigate smoothly to dedicated ChatConversationScreen
  const handleOpenChat = useCallback((chat: ChatMessage) => {
    navigation.navigate('ChatConversation', {
      negotiationId: chat.negotiationId || chat.id,
      shopId: chat.shopId,
      boutiqueName: chat.boutiqueName,
      avatar: chat.avatar,
    });
  }, [navigation]);

  // Story tap handler
  const handleOpenStory = useCallback((story: StoryBoutique) => {
    navigation.navigate('ChatConversation', {
      shopId: story.id,
      boutiqueName: story.name,
      avatar: story.avatar,
    });
  }, [navigation]);

  // Filter conversations
  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      if (activeFilter === 'deal_done' && c.status !== 'deal_done') return false;
      if (activeFilter === 'deal_pending' && c.status !== 'deal_pending') return false;
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        return (
          c.boutiqueName.toLowerCase().includes(query) ||
          c.lastMessage.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [chats, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const all = chats.length;
    const done = chats.filter((c) => c.status === 'deal_done').length;
    const pending = chats.filter((c) => c.status === 'deal_pending').length;
    return { all, done, pending };
  }, [chats]);

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#1E3A8A', '#B45309']}
            tintColor="#1E3A8A"
          />
        }
      >
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills (All Messages, Deal Done, Deal Pending) */}
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
                {counts.all}
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
            {counts.done > 0 && (
              <View style={styles.dealDoneCount}>
                <Text style={styles.dealDoneCountText}>{counts.done}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Deal Pending */}
          <TouchableOpacity
            style={[styles.pill, activeFilter === 'deal_pending' ? styles.dealPendingActive : styles.dealPendingInactive]}
            onPress={() => setActiveFilter('deal_pending')}
            activeOpacity={0.8}
          >
            <View style={styles.orangeDot} />
            <Text style={styles.dealPendingText}>Deal Pending</Text>
            {counts.pending > 0 && (
              <View style={styles.dealPendingCount}>
                <Text style={styles.dealPendingCountText}>{counts.pending}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Top Active Stories / Notes Carousel */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
            {STORIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.storyItem}
                onPress={() => handleOpenStory(item)}
                activeOpacity={0.8}
              >
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

        {/* Messages Header Row */}
        <View style={styles.messagesSectionHeader}>
          <Text style={styles.messagesTitle}>Messages</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.requestsLink}>Requests</Text>
          </TouchableOpacity>
        </View>

        {/* Chat List Items */}
        <View style={styles.chatListContainer}>
          {filteredChats.length === 0 ? (
            <View style={styles.emptyInbox}>
              <Icon name="chat-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyInboxTitle}>No Conversations Yet</Text>
              <Text style={styles.emptyInboxSub}>
                Start a bargain discussion with any boutique on Mitreno!
              </Text>
            </View>
          ) : (
            filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatRow}
                onPress={() => handleOpenChat(chat)}
                activeOpacity={0.7}
              >
                {/* Avatar with optional story ring */}
                <View style={[styles.chatAvatarRing, chat.hasStoryRing && styles.storyRingBorder]}>
                  <FastImage source={{ uri: chat.avatar }} style={styles.chatAvatar as any} />
                  {chat.isOnline && <View style={styles.chatOnlineDot} />}
                </View>

                {/* Chat Info */}
                <View style={styles.chatInfoCol}>
                  <View style={styles.chatHeaderRow}>
                    <View style={styles.nameVerifiedRow}>
                      <Text style={styles.chatBoutiqueName} numberOfLines={1}>{chat.boutiqueName}</Text>
                      {chat.verified && (
                        <Icon name="check-decagram" size={14} color={colors.verifiedBlue} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text style={[styles.chatTimestamp, (chat.unreadCount || 0) > 0 && styles.chatTimestampUnread]}>
                      {chat.time}
                    </Text>
                  </View>

                  <View style={styles.chatSnippetRow}>
                    <View style={styles.snippetLeft}>
                      {chat.isTyping ? (
                        <Text style={styles.typingSnippetText}>typing...</Text>
                      ) : (
                        <>
                          {chat.lastMessageSender === 'buyer' && (
                            <Icon
                              name={chat.lastMessageStatus === 'sent' ? 'check' : 'check-all'}
                              size={15}
                              color={chat.lastMessageStatus === 'read' ? '#38BDF8' : '#94A3B8'}
                              style={{ marginRight: 4 }}
                            />
                          )}
                          <Text
                            style={[styles.chatLastMsg, (chat.unreadCount || 0) > 0 && styles.chatLastMsgUnread]}
                            numberOfLines={1}
                          >
                            {chat.lastMessage}
                          </Text>
                        </>
                      )}
                    </View>

                    {(chat.unreadCount || 0) > 0 ? (
                      <View style={styles.unreadCountBadge}>
                        <Text style={styles.unreadCountText}>{chat.unreadCount}</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusPill, chat.status === 'deal_done' ? styles.statusPillDone : styles.statusPillPending]}>
                        <View style={[styles.statusDot, chat.status === 'deal_done' ? styles.greenDot : styles.orangeDot]} />
                        <Text style={[styles.statusPillText, chat.status === 'deal_done' ? styles.statusDoneText : styles.statusPendingText]}>
                          {chat.statusLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  dealPendingCount: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 5,
  },
  dealPendingCountText: {
    fontSize: 10,
    fontWeight: '800',
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
  emptyInbox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyInboxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyInboxSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
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
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  chatBoutiqueName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chatTimestampUnread: {
    color: '#10B981',
    fontWeight: '700',
  },
  chatSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snippetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  typingSnippetText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#10B981',
    fontWeight: '600',
  },
  chatLastMsg: {
    fontSize: 12,
    color: '#64748B',
    flexShrink: 1,
  },
  chatLastMsgUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadCountBadge: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
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
});
