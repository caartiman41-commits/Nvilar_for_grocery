import React, { useState, useEffect, memo } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

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
  const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);
  const [dmMessages, setDmMessages] = useState<string[]>([
    'Boutique owner opened Live Bargain Window.',
    'Your offer of ₹1,999 submitted for Oversized Streetwear Hoodie.',
  ]);
  const [newMsgText, setNewMsgText] = useState('');

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
      setDmMessages((prev) => {
        if (prev.includes(bargainMsg)) return prev;
        return [...prev, bargainMsg];
      });
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

  const filteredChats = chats.filter((chat) => {
    if (activeFilter !== 'all' && chat.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      return chat.boutiqueName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const sendDM = () => {
    if (newMsgText.trim().length === 0) return;
    setDmMessages([...dmMessages, newMsgText.trim()]);
    setNewMsgText('');
  };

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
                {item.isActive && (
                  <View style={styles.activeBadgePill}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                    <View style={styles.activePillDot} />
                  </View>
                )}
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
              onPress={() => setSelectedChat(chat)}
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
      <Modal visible={!!selectedChat} animationType="slide" onRequestClose={() => setSelectedChat(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.dmContainer}
        >
          {/* DM Header */}
          <View style={[styles.dmHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => setSelectedChat(null)}>
              <Icon name="arrow-left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.dmHeaderInfo}>
              <Text style={styles.dmBoutiqueName}>{selectedChat?.boutiqueName}</Text>
              <Text style={styles.dmStatusText}>Verified Boutique • Deals Protected</Text>
            </View>
            <TouchableOpacity>
              <Icon name="information-outline" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* DM Messages List */}
          <FlatList
            data={dmMessages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.dmList}
            renderItem={({ item, index }) => (
              <View style={[styles.dmBubble, index % 2 === 0 ? styles.dmBubbleIn : styles.dmBubbleOut]}>
                <Text style={[styles.dmBubbleText, index % 2 === 1 && styles.dmBubbleTextOut]}>
                  {item}
                </Text>
              </View>
            )}
          />

          {/* Bargain Offer Input Bar */}
          <View style={[styles.dmInputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              style={styles.dmInput}
              placeholder="Send counter-offer or chat..."
              placeholderTextColor="#94A3B8"
              value={newMsgText}
              onChangeText={setNewMsgText}
            />
            <TouchableOpacity style={styles.dmSendBtn} onPress={sendDM}>
              <Icon name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  activeBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
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
});
