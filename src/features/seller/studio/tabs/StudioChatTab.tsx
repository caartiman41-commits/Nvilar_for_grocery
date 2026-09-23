import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSellerStore } from '../../sellerStore';
import { StudioConversation, StudioChatMessage } from '../studioTypes';

export type ChatFilterType = 'all' | 'bargains' | 'deals';

export interface StudioChatTabProps {
  onSelectConversation?: (conversationId: string) => void;
}

export const StudioChatTab: React.FC<StudioChatTabProps> = memo(({ onSelectConversation }) => {
  const insets = useSafeAreaInsets();
  const { conversations, sendChatMessage, acceptDealOffer } = useSellerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ChatFilterType>('all');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  // Compute live unread total
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  // Find currently selected conversation from store
  const activeConversation = useMemo(() => {
    if (!selectedConvId) return null;
    return conversations.find((c) => c.id === selectedConvId) || null;
  }, [conversations, selectedConvId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Filter by type
      if (activeFilter === 'bargains' && !c.hasBargainOffer) {
        return false;
      }
      if (activeFilter === 'deals') {
        const isDealRelated = c.hasBargainOffer || c.dealStatus === 'accepted' || c.dealStatus === 'pending';
        if (!isDealRelated) return false;
      }

      // Filter by search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = c.customerName.toLowerCase().includes(query);
        const matchesMsg = c.lastMessage.toLowerCase().includes(query);
        const matchesProduct = c.productInquiryTitle.toLowerCase().includes(query);
        if (!matchesName && !matchesMsg && !matchesProduct) {
          return false;
        }
      }

      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  // Handle refresh animation
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
      setIsRefreshing(false);
    });
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Open conversation modal
  const handleOpenConversation = useCallback(
    (conv: StudioConversation) => {
      setSelectedConvId(conv.id);
      onSelectConversation?.(conv.id);
    },
    [onSelectConversation]
  );

  const handleCloseConversation = useCallback(() => {
    setSelectedConvId(null);
    setReplyText('');
  }, []);

  // Send seller reply
  const handleSendReply = useCallback(() => {
    if (!selectedConvId || replyText.trim().length === 0) return;
    sendChatMessage(selectedConvId, replyText.trim());
    setReplyText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, [selectedConvId, replyText, sendChatMessage]);

  // Quick reply chip
  const handleQuickReply = useCallback(
    (template: string) => {
      if (!selectedConvId) return;
      sendChatMessage(selectedConvId, template);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 120);
    },
    [selectedConvId, sendChatMessage]
  );

  // Accept bargain offer
  const handleAcceptDeal = useCallback(
    (convId: string, msgId: string, offeredPrice: number) => {
      acceptDealOffer(convId, msgId);
      sendChatMessage(
        convId,
        `Deal accepted! Reserved for ₹${offeredPrice}. Instant express dispatch unlocked once order is confirmed.`
      );
      Alert.alert(
        'Deal Accepted!',
        `The deal of ₹${offeredPrice} has been confirmed. The buyer can now purchase at this exclusive price.`,
        [{ text: 'OK' }]
      );
    },
    [acceptDealOffer, sendChatMessage]
  );

  // Counter offer prompt
  const handleMakeCounterOffer = useCallback(
    (currentOffered: number, original: number) => {
      const suggested = Math.round((currentOffered + original) / 2);
      setReplyText(`Counter Offer: I can do ₹${suggested} with priority packaging. Deal?`);
    },
    []
  );

  // Initials generator
  const getInitials = (name: string): string => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      {/* 1. Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.headerTitle}>Messages</Text>
            {totalUnreadCount > 0 && (
              <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountText}>{totalUnreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>Bargains & Direct Deals</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="refresh" size={22} color="#0F172A" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* 2. Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customer or message..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Filter Chips */}
      <View style={styles.filterChipsRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            All ({conversations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'bargains' && styles.filterChipActive]}
          onPress={() => setActiveFilter('bargains')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, activeFilter === 'bargains' && styles.filterChipTextActive]}>
            🔥 Bargains
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'deals' && styles.filterChipActive]}
          onPress={() => setActiveFilter('deals')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, activeFilter === 'deals' && styles.filterChipTextActive]}>
            Deals
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="chat-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Conversations Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.length > 0
                ? 'Try adjusting your search query or clear the filter.'
                : 'Direct buyer inquiries and live bargain offers will appear here.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const initials = getInitials(item.customerName);
          const hasUnread = item.unreadCount > 0;
          const isPendingDeal = item.dealStatus === 'pending';
          const isAcceptedDeal = item.dealStatus === 'accepted';

          return (
            <TouchableOpacity
              style={[styles.conversationCard, hasUnread && styles.conversationCardUnread]}
              onPress={() => handleOpenConversation(item)}
              activeOpacity={0.75}
            >
              {/* Avatar + Online Indicator */}
              <View style={styles.avatarWrapper}>
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: item.customerAvatarBg || '#1E293B' },
                  ]}
                >
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                {item.isOnline && <View style={styles.onlineDot} />}
              </View>

              {/* Main Content Info */}
              <View style={styles.conversationInfo}>
                {/* Name & Status Row */}
                <View style={styles.nameRow}>
                  <Text style={styles.customerName} numberOfLines={1}>
                    {item.customerName}
                  </Text>

                  {/* Status Badge */}
                  {isPendingDeal && (
                    <View style={styles.pendingBadge}>
                      <Icon name="clock-outline" size={11} color="#D97706" style={{ marginRight: 2 }} />
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                  {isAcceptedDeal && (
                    <View style={styles.acceptedBadge}>
                      <Icon name="check-circle" size={11} color="#059669" style={{ marginRight: 2 }} />
                      <Text style={styles.acceptedBadgeText}>Accepted</Text>
                    </View>
                  )}
                </View>

                {/* Product Inquiry Pill */}
                {Boolean(item.productInquiryTitle) && (
                  <View style={styles.productInquiryPill}>
                    <Text style={styles.productInquiryPillText} numberOfLines={1}>
                      🏷️ Product Inquiry: {item.productInquiryTitle}
                    </Text>
                  </View>
                )}

                {/* Last Message Snippet */}
                <Text
                  style={[styles.lastMessageText, hasUnread && styles.lastMessageTextUnread]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>

              {/* Right Column: Time & Unread Badge */}
              <View style={styles.metaColumn}>
                <Text style={styles.timestampText}>{item.lastMessageTime}</Text>
                {hasUnread && (
                  <View style={styles.unreadPill}>
                    <Text style={styles.unreadPillText}>{item.unreadCount}</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={18} color="#CBD5E1" style={styles.chevronIcon} />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* 5. Interactive Chat Conversation Modal */}
      <Modal
        visible={Boolean(activeConversation)}
        animationType="slide"
        onRequestClose={handleCloseConversation}
      >
        {activeConversation && (
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 10) }]}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={handleCloseConversation}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Icon name="arrow-left" size={24} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.modalCustomerWrap}>
                <View
                  style={[
                    styles.modalAvatarCircle,
                    { backgroundColor: activeConversation.customerAvatarBg || '#1E293B' },
                  ]}
                >
                  <Text style={styles.modalAvatarInitials}>
                    {getInitials(activeConversation.customerName)}
                  </Text>
                  {activeConversation.isOnline && <View style={styles.modalOnlineDot} />}
                </View>

                <View style={styles.modalCustomerMeta}>
                  <Text style={styles.modalCustomerName} numberOfLines={1}>
                    {activeConversation.customerName}
                  </Text>
                  <Text style={styles.modalCustomerStatus}>
                    {activeConversation.isOnline ? 'Online • Express Hyperlocal Buyer' : 'Active today'}
                  </Text>
                </View>
              </View>

              {/* Call Action */}
              <TouchableOpacity
                style={styles.modalCallButton}
                onPress={() =>
                  Alert.alert(
                    'Direct Buyer Line',
                    `Priority dispatch line active for ${activeConversation.customerName}. Courier assigned within 3 mins for confirmed orders.`,
                    [{ text: 'Close' }]
                  )
                }
                activeOpacity={0.7}
              >
                <Icon name="phone-outline" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Pinned Product Card */}
            <View style={styles.pinnedProductCard}>
              {Boolean(activeConversation.productInquiryImage) && (
                <FastImage
                  source={{ uri: activeConversation.productInquiryImage }}
                  style={styles.pinnedProductThumb}
                  resizeMode={FastImage.resizeMode.cover}
                />
              )}
              <View style={styles.pinnedProductDetails}>
                <View style={styles.pinnedTagRow}>
                  <Text style={styles.pinnedProductTag}>🏷️ Inquired Garment</Text>
                  {activeConversation.hasBargainOffer && (
                    <View style={styles.liveBargainTag}>
                      <Text style={styles.liveBargainTagText}>🔥 Active Bargain</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pinnedProductTitle} numberOfLines={1}>
                  {activeConversation.productInquiryTitle}
                </Text>
                <Text style={styles.pinnedProductCourier}>
                  ⚡ Hyperlocal 30-Min Direct Courier Active in Guwahati
                </Text>
              </View>
            </View>

            {/* Messages Thread */}
            <FlatList
              ref={flatListRef}
              data={activeConversation.messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatMessagesContainer}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => {
                const isSeller = item.sender === 'seller';
                const hasOffer = Boolean(item.offer);

                return (
                  <View style={styles.messageItemWrapper}>
                    {/* Message Bubble */}
                    <View
                      style={[
                        styles.messageBubble,
                        isSeller ? styles.sellerBubble : styles.customerBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isSeller ? styles.sellerMessageText : styles.customerMessageText,
                        ]}
                      >
                        {item.text}
                      </Text>
                      <View style={styles.timestampRow}>
                        <Text
                          style={[
                            styles.messageTimestamp,
                            isSeller ? styles.sellerTimestamp : styles.customerTimestamp,
                          ]}
                        >
                          {item.timestamp}
                        </Text>
                        {isSeller && (
                          <Icon name="check-all" size={14} color="#CBD5E1" style={{ marginLeft: 3 }} />
                        )}
                      </View>
                    </View>

                    {/* Deal Offer Card (if message contains a bargain offer) */}
                    {hasOffer && item.offer && (
                      <View style={styles.dealOfferCard}>
                        {/* Header */}
                        <View style={styles.dealOfferHeader}>
                          <View style={styles.dealOfferTitleRow}>
                            <Icon name="fire" size={18} color="#EA580C" />
                            <Text style={styles.dealOfferTitle}>LIVE BARGAIN OFFER</Text>
                          </View>
                          <View
                            style={[
                              styles.dealStatusBadge,
                              item.offer.status === 'accepted'
                                ? styles.dealStatusAccepted
                                : styles.dealStatusPending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dealStatusText,
                                item.offer.status === 'accepted'
                                  ? styles.dealStatusTextAccepted
                                  : styles.dealStatusTextPending,
                              ]}
                            >
                              {item.offer.status === 'accepted' ? '✓ Accepted' : 'Pending Offer'}
                            </Text>
                          </View>
                        </View>

                        {/* Garment Title */}
                        <Text style={styles.dealGarmentTitle}>{item.offer.garmentTitle}</Text>

                        {/* Price Breakdown */}
                        <View style={styles.dealPriceBreakdown}>
                          <View>
                            <Text style={styles.dealPriceLabel}>Listed Price</Text>
                            <Text style={styles.dealOriginalPrice}>₹{item.offer.originalPrice}</Text>
                          </View>

                          <View style={styles.dealArrowWrap}>
                            <Icon name="arrow-right" size={18} color="#94A3B8" />
                          </View>

                          <View>
                            <Text style={styles.dealPriceLabel}>Buyer's Offer</Text>
                            <Text style={styles.dealOfferedPrice}>₹{item.offer.offeredPrice}</Text>
                          </View>

                          <View style={styles.dealDiscountPill}>
                            <Text style={styles.dealDiscountText}>
                              ₹{item.offer.discountAmount} OFF
                            </Text>
                          </View>
                        </View>

                        {/* Deal Actions */}
                        {item.offer.status === 'pending' ? (
                          <View style={styles.dealActionsRow}>
                            <TouchableOpacity
                              style={styles.acceptDealButton}
                              onPress={() =>
                                handleAcceptDeal(
                                  activeConversation.id,
                                  item.id,
                                  item.offer!.offeredPrice
                                )
                              }
                              activeOpacity={0.8}
                            >
                              <Icon name="check-bold" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                              <Text style={styles.acceptDealButtonText}>Accept Deal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.counterOfferButton}
                              onPress={() =>
                                handleMakeCounterOffer(
                                  item.offer!.offeredPrice,
                                  item.offer!.originalPrice
                                )
                              }
                              activeOpacity={0.8}
                            >
                              <Icon name="handshake-outline" size={16} color="#0F172A" style={{ marginRight: 4 }} />
                              <Text style={styles.counterOfferButtonText}>Make Counter</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.dealAcceptedBanner}>
                            <Icon name="check-decagram" size={16} color="#059669" style={{ marginRight: 6 }} />
                            <Text style={styles.dealAcceptedBannerText}>
                              Deal accepted! Buyer can now complete checkout at ₹{item.offer.offeredPrice}.
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              }}
            />

            {/* Quick Suggestion Chips */}
            <View style={styles.quickRepliesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickRepliesScroll}
              >
                <TouchableOpacity
                  style={styles.quickReplyChip}
                  onPress={() => handleQuickReply('Ready stock in Guwahati! Can dispatch in 30 mins 🚀')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickReplyText}>⚡ Ready stock (30-min dispatch)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickReplyChip}
                  onPress={() => handleQuickReply('100% Pure certified authentic luxury silk ✨')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickReplyText}>✨ 100% Certified authentic</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickReplyChip}
                  onPress={() => handleQuickReply('Tamper-proof luxury Mitreno packaging included 📦')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickReplyText}>📦 Luxury packaging included</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickReplyChip}
                  onPress={() => handleQuickReply('I can offer ₹200 off if you purchase today 🤝')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickReplyText}>🤝 ₹200 OFF today</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Chat Input Bar */}
            <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
              <View style={styles.inputInnerWrap}>
                <TextInput
                  style={styles.chatTextInput}
                  placeholder="Type reply or counter offer..."
                  placeholderTextColor="#94A3B8"
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                  maxLength={500}
                />

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    replyText.trim().length === 0 && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendReply}
                  disabled={replyText.trim().length === 0}
                  activeOpacity={0.75}
                >
                  <Icon name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
      </Modal>
    </View>
  );
});

export default StudioChatTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  unreadCountBadge: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  conversationCardUnread: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFDF9',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  onlineDot: {
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
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  customerName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textTransform: 'capitalize',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  acceptedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  productInquiryPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
    alignSelf: 'flex-start',
    maxWidth: '96%',
  },
  productInquiryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  lastMessageText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  lastMessageTextUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  metaColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 44,
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  unreadPill: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 2,
  },
  unreadPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chevronIcon: {
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalBackButton: {
    marginRight: 12,
  },
  modalCustomerWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 10,
  },
  modalAvatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalCustomerMeta: {
    flex: 1,
  },
  modalCustomerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  modalCustomerStatus: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  modalCallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  pinnedProductThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  pinnedProductDetails: {
    flex: 1,
  },
  pinnedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pinnedProductTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 6,
  },
  liveBargainTag: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  liveBargainTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  pinnedProductTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  pinnedProductCourier: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    marginTop: 1,
  },
  chatMessagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageItemWrapper: {
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  customerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  sellerBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  customerMessageText: {
    color: '#0F172A',
  },
  sellerMessageText: {
    color: '#FFFFFF',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageTimestamp: {
    fontSize: 10,
  },
  customerTimestamp: {
    color: '#94A3B8',
  },
  sellerTimestamp: {
    color: '#94A3B8',
  },
  dealOfferCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 14,
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  dealOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dealOfferTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealOfferTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  dealStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dealStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  dealStatusAccepted: {
    backgroundColor: '#D1FAE5',
  },
  dealStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  dealStatusTextPending: {
    color: '#D97706',
  },
  dealStatusTextAccepted: {
    color: '#059669',
  },
  dealGarmentTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  dealPriceBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  dealPriceLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  dealOriginalPrice: {
    fontSize: 13,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  dealArrowWrap: {
    paddingHorizontal: 12,
  },
  dealOfferedPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  dealDiscountPill: {
    marginLeft: 'auto',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dealDiscountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  dealActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptDealButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
  },
  acceptDealButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  counterOfferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 10,
  },
  counterOfferButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  dealAcceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dealAcceptedBannerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  quickRepliesContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
  },
  quickRepliesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReplyChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickReplyText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  inputBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputInnerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 100,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
