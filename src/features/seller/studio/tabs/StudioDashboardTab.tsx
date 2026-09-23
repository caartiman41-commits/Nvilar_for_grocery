import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSellerStore } from '../../sellerStore';
import {
  StudioBanner,
  StudioKPIStats,
  StudioOrderItem,
} from '../studioTypes';
import {
  INITIAL_STUDIO_BANNERS,
  INITIAL_KPI_STATS,
} from '../mockStudioData';
import { showToast } from '../../../../components/MitrenoToast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

export interface StudioDashboardTabProps {
  onSwitchToBuyerApp: () => void;
  onOpenOrders?: () => void;
  onOpenCatalog?: () => void;
  onOpenChat?: () => void;
  onOpenProfile?: () => void;
}

export const StudioDashboardTab: React.FC<StudioDashboardTabProps> = memo(({
  onSwitchToBuyerApp,
  onOpenOrders,
  onOpenCatalog,
  onOpenChat,
  onOpenProfile,
}) => {
  const insets = useSafeAreaInsets();
  const { orders, products, profile, updateOrderStatus } = useSellerStore();

  // Filter ONLY new pending incoming orders for the dashboard feed
  const newOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'new');
  }, [orders]);

  const handleAcceptOrder = useCallback(
    (order: StudioOrderItem) => {
      updateOrderStatus(order.id, 'packaging');
      showToast({
        type: 'success',
        title: `Order ${order.orderNumber} Accepted! 🎉`,
        message: 'Order moved to Packaging queue in Orders tab.',
      });
    },
    [updateOrderStatus]
  );

  // ----------------------------------------------------
  // Refresh Spin Animation
  // ----------------------------------------------------
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start(() => {
      spinAnim.setValue(0);
      setIsRefreshing(false);
      showToast({
        type: 'success',
        title: 'Studio Feed Synced',
        message: 'All metrics, radar feeds and recent orders are up to date.',
      });
    });
  }, [isRefreshing, spinAnim]);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleNotifications = useCallback(() => {
    const pendingOrders = orders.filter((o) => o.status === 'new').length;
    showToast({
      type: 'info',
      title: 'Studio Notifications',
      message: pendingOrders > 0
        ? `You have ${pendingOrders} new orders ready for packing and dispatch.`
        : 'All clear! Store live radar is monitoring incoming buyer inquiries.',
    });
  }, [orders]);

  // ----------------------------------------------------
  // Broadcast Announcements Carousel State & Auto-Scroll
  // ----------------------------------------------------
  const bannerScrollRef = useRef<any>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    if (INITIAL_STUDIO_BANNERS.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % INITIAL_STUDIO_BANNERS.length;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * (BANNER_WIDTH + 12),
          animated: true,
        });
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleBannerScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (BANNER_WIDTH + 12));
      if (index >= 0 && index < INITIAL_STUDIO_BANNERS.length) {
        setActiveBannerIndex(index);
      }
    },
    []
  );

  const handleBannerAction = useCallback(
    (banner: StudioBanner) => {
      if (banner.id === 'banner_diwali' || banner.actionText.includes('Garment')) {
        onOpenCatalog?.();
      } else if (banner.id === 'banner_hyperlocal' || banner.actionText.includes('Radar')) {
        onOpenOrders?.();
      } else if (banner.id === 'banner_reels' || banner.actionText.includes('Reel')) {
        onOpenProfile?.();
      } else {
        showToast({
          type: 'info',
          title: banner.title,
          message: banner.subtitle,
        });
      }
    },
    [onOpenCatalog, onOpenOrders, onOpenProfile]
  );

  // ----------------------------------------------------
  // Dynamic KPI Stats Computation
  // ----------------------------------------------------
  const stats: StudioKPIStats = useMemo(() => {
    const totalRev = orders.length > 0
      ? orders.reduce((sum, ord) => sum + (ord.totalSettlement || ord.price), 0)
      : INITIAL_KPI_STATS.totalRevenue;

    const activeCount = orders.filter(
      (ord) => ord.status === 'new' || ord.status === 'packaging' || ord.status === 'shipped'
    ).length;

    return {
      totalRevenue: totalRev,
      activeOrdersCount: activeCount > 0 ? activeCount : INITIAL_KPI_STATS.activeOrdersCount,
      catalogCount: products.length > 0 ? products.length : INITIAL_KPI_STATS.catalogCount,
      storeRating: profile.rating || INITIAL_KPI_STATS.storeRating,
      reviewCount: profile.reviewsCount || INITIAL_KPI_STATS.reviewCount,
    };
  }, [orders, products, profile]);

  // Status badge styling helper
  const getStatusBadge = (status: StudioOrderItem['status']) => {
    switch (status) {
      case 'new':
        return { label: 'NEW ORDER', bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' };
      case 'packaging':
        return { label: 'PACKING', bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' };
      case 'shipped':
        return { label: 'SHIPPED', bg: '#FAF5FF', text: '#7C3AED', dot: '#8B5CF6' };
      case 'delivered':
        return { label: 'DELIVERED', bg: '#ECFDF5', text: '#059669', dot: '#10B981' };
      case 'returned':
        return { label: 'RETURNED', bg: '#FFF1F2', text: '#E11D48', dot: '#F43F5E' };
      case 'cancelled':
        return { label: 'CANCELLED', bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' };
      default:
        return { label: 'ORDER', bg: '#F1F5F9', text: '#475569', dot: '#64748B' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 12) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ==================================================== */}
      {/* 1. TOP BOUTIQUE HEADER                                */}
      {/* ==================================================== */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {/* Boutique Avatar & Identity */}
          <View style={styles.boutiqueBrandGroup}>
            <View style={styles.avatarContainer}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {(profile.name || 'M').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.avatarLiveDot} />
            </View>

            <View style={styles.boutiqueInfo}>
              <View style={styles.boutiqueNameRow}>
                <Text style={styles.boutiqueName} numberOfLines={1}>
                  {profile.name || 'Mitreno.com'}
                </Text>
                {profile.verifiedBadge && (
                  <Icon name="check-decagram" size={15} color="#2563EB" style={styles.verifiedIcon} />
                )}
              </View>

              <Text style={styles.boutiqueCategory} numberOfLines={1}>
                {profile.category || 'Designer Streetwear & Ethnic Fusion'}
              </Text>

              <View style={styles.activeStorePill}>
                <View style={styles.activeStoreDot} />
                <Text style={styles.activeStoreText}>Active Store</Text>
              </View>
            </View>
          </View>

          {/* Right Header Action Controls */}
          <View style={styles.headerActions}>
            <View style={styles.actionIconRow}>
              {/* Refresh button with animated spin */}
              <TouchableOpacity
                style={styles.circleActionBtn}
                onPress={handleRefresh}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
                  <Icon name="refresh" size={19} color="#334155" />
                </Animated.View>
              </TouchableOpacity>

              {/* Notification Bell with live unread badge */}
              <TouchableOpacity
                style={styles.circleActionBtn}
                onPress={handleNotifications}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Icon name="bell-outline" size={19} color="#334155" />
                <View style={styles.unreadBadgeDot} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ==================================================== */}
      {/* 2. BROADCAST ANNOUNCEMENTS BANNER CAROUSEL           */}
      {/* ==================================================== */}
      <View style={styles.carouselSection}>
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH + 12}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={handleBannerScroll}
          contentContainerStyle={styles.bannerScrollContent}
        >
          {INITIAL_STUDIO_BANNERS.map((banner) => (
            <View key={banner.id} style={[styles.bannerSlideWrap, { width: BANNER_WIDTH }]}>
              <LinearGradient
                colors={banner.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerGradient}
              >
                {/* Background decorative watermark icon */}
                <View style={styles.bannerWatermarkWrap}>
                  <Icon name={banner.iconName} size={76} color="rgba(255, 255, 255, 0.10)" />
                </View>

                {/* Top Tags Row */}
                <View style={styles.bannerTopRow}>
                  <View style={styles.bannerTagPill}>
                    <Icon name="sparkles" size={10} color="#FBBF24" style={{ marginRight: 3 }} />
                    <Text style={styles.bannerTagText}>{banner.tag}</Text>
                  </View>

                  {banner.badgeText && (
                    <View style={styles.bannerBadgePill}>
                      <Text style={styles.bannerBadgeText}>{banner.badgeText}</Text>
                    </View>
                  )}
                </View>

                {/* Banner Titles */}
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {banner.title}
                </Text>
                <Text style={styles.bannerSubtitle} numberOfLines={2}>
                  {banner.subtitle}
                </Text>

                {/* Bottom CTA Button */}
                <View style={styles.bannerBottomRow}>
                  <TouchableOpacity
                    style={styles.bannerCtaBtn}
                    onPress={() => handleBannerAction(banner)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.bannerCtaBtnText}>{banner.actionText}</Text>
                    <Icon name="arrow-right" size={13} color="#0F172A" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        {/* Carousel Pagination Dots */}
        <View style={styles.dotsRow}>
          {INITIAL_STUDIO_BANNERS.map((banner, index) => {
            const isActive = index === activeBannerIndex;
            return (
              <View
                key={`dot_${banner.id}`}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* ==================================================== */}
      {/* 3. ROW-WISE COMPACT KPI METRIC CARDS                 */}
      {/* ==================================================== */}
      <View style={styles.kpiSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiScrollContent}
        >
          {/* Card 1: Total Revenue */}
          <TouchableOpacity
            style={styles.kpiCard}
            activeOpacity={0.8}
            onPress={() => {
              showToast({
                type: 'info',
                title: 'Revenue Summary',
                message: `Total Gross Revenue: ₹${stats.totalRevenue.toLocaleString('en-IN')} with direct bank UPI payouts.`,
              });
            }}
          >
            <View style={styles.kpiCardHeader}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Icon name="trending-up" size={16} color="#059669" />
              </View>
              <View style={[styles.kpiTrendChip, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.kpiTrendChipText, { color: '#16A34A' }]}>+18%</Text>
              </View>
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiLabel}>Total Revenue</Text>
            <View style={styles.kpiSubRow}>
              <Icon name="check-circle" size={10} color="#059669" style={{ marginRight: 3 }} />
              <Text style={[styles.kpiSubText, { color: '#059669' }]}>Direct UPI Payouts</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Active Orders */}
          <TouchableOpacity
            style={styles.kpiCard}
            activeOpacity={0.8}
            onPress={onOpenOrders}
          >
            <View style={styles.kpiCardHeader}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="package-variant-closed" size={16} color="#2563EB" />
              </View>
              <View style={[styles.kpiTrendChip, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.kpiTrendChipText, { color: '#2563EB' }]}>Radar</Text>
              </View>
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              {stats.activeOrdersCount}
            </Text>
            <Text style={styles.kpiLabel}>Active Orders</Text>
            <View style={styles.kpiSubRow}>
              <Text style={[styles.kpiSubText, { color: '#3B82F6' }]}>All clear ↗</Text>
            </View>
          </TouchableOpacity>

          {/* Card 3: Catalog Items */}
          <TouchableOpacity
            style={styles.kpiCard}
            activeOpacity={0.8}
            onPress={onOpenCatalog}
          >
            <View style={styles.kpiCardHeader}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Icon name="hanger" size={16} color="#7C3AED" />
              </View>
              <View style={[styles.kpiTrendChip, { backgroundColor: '#F5F3FF' }]}>
                <Text style={[styles.kpiTrendChipText, { color: '#7C3AED' }]}>Live</Text>
              </View>
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              {stats.catalogCount}
            </Text>
            <Text style={styles.kpiLabel}>Catalog Items</Text>
            <View style={styles.kpiSubRow}>
              <Text style={[styles.kpiSubText, { color: '#6366F1' }]}>Active in store</Text>
            </View>
          </TouchableOpacity>

          {/* Card 4: Store Rating */}
          <TouchableOpacity
            style={styles.kpiCard}
            activeOpacity={0.8}
            onPress={onOpenProfile}
          >
            <View style={styles.kpiCardHeader}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="star" size={16} color="#D97706" />
              </View>
              <View style={[styles.kpiTrendChip, { backgroundColor: '#FEF9C3' }]}>
                <Text style={[styles.kpiTrendChipText, { color: '#B45309' }]}>★ Top</Text>
              </View>
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              {stats.storeRating.toFixed(1)}★
            </Text>
            <Text style={styles.kpiLabel}>Store Rating</Text>
            <View style={styles.kpiSubRow}>
              <Text style={[styles.kpiSubText, { color: '#D97706' }]}>
                {stats.reviewCount} customer review
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ==================================================== */}
      {/* 4. RECENT ORDERS (NEW PENDING INCOMING ORDERS)       */}
      {/* ==================================================== */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithDot}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {newOrders.length > 0 ? (
            <View style={styles.newOrdersCountBadge}>
              <Text style={styles.newOrdersCountText}>
                {newOrders.length} NEW
              </Text>
            </View>
          ) : (
            <View style={styles.allClearBadge}>
              <Icon name="check-circle" size={10} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.allClearBadgeText}>ALL ACCEPTED</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={onOpenOrders}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.sectionViewAllText}>View All &gt;</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ordersListContainer}>
        {newOrders.length > 0 ? (
          newOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <View
                key={order.id}
                style={styles.orderCard}
              >
                {/* Order Card Top Line */}
                <View style={styles.orderCardTop}>
                  <View style={styles.orderNumberGroup}>
                    <Text style={styles.orderNumberText}>{order.orderNumber}</Text>
                    <Text style={styles.orderDateText}>• {order.placedAt}</Text>
                  </View>

                  <View style={[styles.statusBadgePill, { backgroundColor: badge.bg }]}>
                    <View style={[styles.statusBadgeDot, { backgroundColor: badge.dot }]} />
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Order Item Main Details */}
                <View style={styles.orderCardBody}>
                  {order.productImage ? (
                    <Image source={{ uri: order.productImage }} style={styles.orderProductThumb} />
                  ) : (
                    <View style={styles.orderProductThumbPlaceholder}>
                      <Icon name="tshirt-crew" size={20} color="#94A3B8" />
                    </View>
                  )}

                  <View style={styles.orderProductDetails}>
                    <Text style={styles.orderProductTitle} numberOfLines={1}>
                      {order.productTitle}
                    </Text>

                    <Text style={styles.orderCustomerMeta} numberOfLines={1}>
                      Size: {order.size} • Qty: {order.qty} • To: {order.customerName}
                    </Text>

                    <View style={styles.orderDeliveryTagRow}>
                      {order.fulfillmentType === 'hyperlocal' ? (
                        <View style={styles.hyperlocalTag}>
                          <Icon name="lightning-bolt" size={10} color="#059669" style={{ marginRight: 2 }} />
                          <Text style={styles.hyperlocalTagText}>
                            Express Hyperlocal {order.distanceKm ? `(${order.distanceKm} km)` : ''}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.standardTag}>
                          <Icon name="truck-delivery-outline" size={10} color="#64748B" style={{ marginRight: 2 }} />
                          <Text style={styles.standardTagText}>Standard Surface Delivery</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.orderPriceWrap}>
                    <Text style={styles.orderPriceText}>
                      ₹{(order.totalSettlement || order.price).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Order Acceptance Bottom Action Row */}
                <View style={styles.orderCardBottomActions}>
                  <TouchableOpacity
                    style={styles.acceptOrderBtn}
                    onPress={() => handleAcceptOrder(order)}
                    activeOpacity={0.85}
                  >
                    <Icon name="check-circle-outline" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.acceptOrderBtnText}>Accept Order</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewOrderDetailsBtn}
                    onPress={onOpenOrders}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewOrderDetailsBtnText}>View in Orders</Text>
                    <Icon name="chevron-right" size={14} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          /* All Orders Processed / Caught Up State */
          <View style={styles.allCaughtUpCard}>
            <View style={styles.allCaughtUpIconCircle}>
              <Icon name="check-decagram" size={28} color="#059669" />
            </View>
            <Text style={styles.allCaughtUpTitle}>All New Orders Accepted! 🎉</Text>
            <Text style={styles.allCaughtUpSub}>
              Every incoming order has been processed. Head to the Orders tab to pack garments, download shipping slips, or assign riders.
            </Text>
            <TouchableOpacity
              style={styles.openOrdersTabBtn}
              onPress={onOpenOrders}
              activeOpacity={0.85}
            >
              <Icon name="package-variant" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openOrdersTabBtnText}>Go to Orders Tab</Text>
              <Icon name="arrow-right" size={13} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ==================================================== */}
      {/* 6. SELLER GROWTH ENGINE                              */}
      {/* ==================================================== */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithDot}>
          <Text style={styles.sectionTitle}>Seller Growth Engine</Text>
        </View>
        <Text style={styles.growthSubtitle}>Boost Studio GMV</Text>
      </View>

      <View style={styles.growthContainer}>
        {/* Action 1: Customer Deals */}
        <TouchableOpacity
          style={styles.growthCard}
          onPress={onOpenChat}
          activeOpacity={0.75}
        >
          <View style={[styles.growthIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="tag-percent-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.growthTextGroup}>
            <Text style={styles.growthCardTitle}>Customer Deals</Text>
            <Text style={styles.growthCardDesc}>
              Send custom discount deals directly in customer chat
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Action 2: Upload Fashion Reel */}
        <TouchableOpacity
          style={styles.growthCard}
          onPress={onOpenProfile}
          activeOpacity={0.75}
        >
          <View style={[styles.growthIconCircle, { backgroundColor: '#FCE7F3' }]}>
            <Icon name="video-vintage" size={20} color="#DB2777" />
          </View>
          <View style={styles.growthTextGroup}>
            <Text style={styles.growthCardTitle}>Upload Fashion Reel</Text>
            <Text style={styles.growthCardDesc}>
              Showcase runway fits and tag your catalog products
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Action 3: Promote in City */}
        <TouchableOpacity
          style={styles.growthCard}
          onPress={() => {
            showToast({
              type: 'success',
              title: 'City Promotion Spotlight',
              message: 'Your boutique is enrolled in top city home carousel placement during festive rush!',
            });
          }}
          activeOpacity={0.75}
        >
          <View style={[styles.growthIconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Icon name="bullhorn-outline" size={20} color="#4F46E5" />
          </View>
          <View style={styles.growthTextGroup}>
            <Text style={styles.growthCardTitle}>Promote in City</Text>
            <Text style={styles.growthCardDesc}>
              Get 5x more clicks with home carousel sponsored banners
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingBottom: 36,
  },

  // ----------------------------------------------------
  // Top Boutique Header Styles
  // ----------------------------------------------------
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boutiqueBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarLiveDot: {
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
  boutiqueInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  boutiqueNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutiqueName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  boutiqueCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  activeStorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeStoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#047857',
    marginRight: 5,
  },
  activeStoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.2,
  },
  headerActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },

  // ----------------------------------------------------
  // Broadcast Announcements Banner Carousel
  // ----------------------------------------------------
  carouselSection: {
    marginTop: 14,
  },
  bannerScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bannerSlideWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerGradient: {
    padding: 16,
    borderRadius: 16,
    minHeight: 140,
    justifyContent: 'space-between',
    position: 'relative',
  },
  bannerWatermarkWrap: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bannerTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  bannerTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  bannerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bannerSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 3,
    lineHeight: 16,
    maxWidth: '85%',
  },
  bannerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bannerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerCtaBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  dot: {
    height: 4.5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#0F172A',
  },
  dotInactive: {
    width: 5,
    backgroundColor: '#CBD5E1',
  },

  // ----------------------------------------------------
  // KPI Metric Cards Styles
  // ----------------------------------------------------
  kpiSection: {
    marginTop: 16,
  },
  kpiScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  kpiCard: {
    width: 144,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiTrendChip: {
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 6,
  },
  kpiTrendChipText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  kpiSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  kpiSubText: {
    fontSize: 10,
    fontWeight: '700',
  },

  allClearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
  },
  allClearBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
  },

  // ----------------------------------------------------
  // Section Headers
  // ----------------------------------------------------
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  newOrdersCountBadge: {
    backgroundColor: '#EF4444',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginLeft: 6,
  },
  newOrdersCountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionViewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  growthSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },

  // ----------------------------------------------------
  // Recent Orders Feed Styles
  // ----------------------------------------------------
  ordersListContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  orderCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  orderNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumberText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDateText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  statusBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  orderCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderProductThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  orderProductThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderProductDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  orderProductTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  orderCustomerMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  orderDeliveryTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  hyperlocalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  hyperlocalTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  standardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  standardTagText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  orderPriceWrap: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  orderPriceText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Order Card Action Bar & All Caught Up Styles
  orderCardBottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.8,
    borderTopColor: '#F1F5F9',
  },
  acceptOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 6.5,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  acceptOrderBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  viewOrderDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  viewOrderDetailsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  allCaughtUpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  allCaughtUpIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  allCaughtUpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  allCaughtUpSub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 260,
  },
  openOrdersTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 7.5,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  openOrdersTabBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ----------------------------------------------------
  // Seller Growth Engine Styles
  // ----------------------------------------------------
  growthContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  growthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  growthIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  growthTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  growthCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  growthCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});
