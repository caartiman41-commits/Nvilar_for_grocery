import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOrderStore, Order, OrderStatus, OrderItem } from './orderStore';
import { SAMPLE_PRODUCTS } from '../product/productData';
import { showToast } from '../../components/MitrenoToast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type OrderSupportTab = 'paisa' | 'address' | 'cancel';

export const CANCELLATION_REASONS = [
  'Ordered by mistake / duplicate order',
  'Delivery time is too long / delayed estimation',
  'Incorrect size or measurement profile chosen',
  'Found a better deal / price mismatch',
  'Change of mind / plans changed',
];

export const OrdersScreen: React.FC = memo(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const orders = useOrderStore((s) => s.orders);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const updateAddress = useOrderStore((s) => s.updateAddress);
  const fetchOrdersFromBackend = useOrderStore((s) => s.fetchOrdersFromBackend);

  useEffect(() => {
    fetchOrdersFromBackend();
  }, [fetchOrdersFromBackend]);

  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [expandedTrackingOrderIds, setExpandedTrackingOrderIds] = useState<Record<string, boolean>>({
    // Default expand the first order tracking for immediate luxury UX
    'ORD-20260923-01': true,
  });

  const lastConsumedOrderTapRef = React.useRef<string | null>(null);

  useEffect(() => {
    const deepLinkOrderId = route.params?.order_id || route.params?.orderId;
    if (deepLinkOrderId) {
      const tapKey = `${deepLinkOrderId}_${route.params?._tapTs || 'init'}`;
      if (lastConsumedOrderTapRef.current === tapKey) return;
      lastConsumedOrderTapRef.current = tapKey;

      fetchOrdersFromBackend();
      setExpandedTrackingOrderIds((prev) => ({
        ...prev,
        [deepLinkOrderId]: true,
      }));

      try {
        navigation.setParams({
          order_id: undefined,
          orderId: undefined,
          _tapTs: undefined,
        });
      } catch {}
    }
  }, [route.params?.order_id, route.params?.orderId, route.params?._tapTs, fetchOrdersFromBackend, navigation]);

  // Support Modal State
  const [supportOrder, setSupportOrder] = useState<Order | null>(null);
  const [supportTab, setSupportTab] = useState<OrderSupportTab>('paisa');
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>(CANCELLATION_REASONS[3]);

  // Filter Active vs Delivered / History
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled'),
    [orders]
  );

  const historyOrders = useMemo(
    () => orders.filter((o) => o.status === 'Delivered' || o.status === 'Cancelled'),
    [orders]
  );

  const displayedOrders = viewMode === 'active' ? activeOrders : historyOrders;

  // Toggle Tracking Accordion
  const toggleTracking = useCallback((orderId: string) => {
    setExpandedTrackingOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }, []);

  // Open Help & Support Modal
  const handleOpenSupport = useCallback((order: Order, initialTab: OrderSupportTab = 'paisa') => {
    setSupportOrder(order);
    setSupportTab(initialTab);
    setSelectedCancelReason(CANCELLATION_REASONS[3]);
  }, []);

  // Download Invoice Action
  const handleDownloadInvoice = useCallback((order: Order) => {
    showToast({
      type: 'success',
      title: 'Invoice Downloaded',
      message: `Tax Invoice for Order #${order.orderReference || order.id} saved to your device.`,
    });
  }, []);

  // Confirm Cancellation Action
  const handleConfirmCancel = useCallback(() => {
    if (!supportOrder) return;
    const orderId = supportOrder.id;
    const orderRef = supportOrder.orderReference || orderId;
    const amount = supportOrder.totalAmount;

    cancelOrder(orderId, selectedCancelReason);
    setSupportOrder(null);

    showToast({
      type: 'warning',
      title: 'Order Cancelled',
      message: `Order #${orderRef} cancelled. ₹${amount.toLocaleString('en-IN')} refund initiated to source payment method within 2-4 hours.`,
    });
  }, [supportOrder, selectedCancelReason, cancelOrder]);

  // Format Date Helper
  const formatOrderDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');
      return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
    } catch {
      return '23 Sep 2026, 01:47 AM';
    }
  };

  // Status Badge Config
  const getStatusBadgeConfig = (status: OrderStatus) => {
    switch (status) {
      case 'Receipt':
      case 'Preparing':
        return {
          label: 'CONFIRMED',
          textColor: '#059669',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
        };
      case 'Package':
        return {
          label: 'PACKED',
          textColor: '#4F46E5',
          bgColor: '#EEF2FF',
          borderColor: '#C7D2FE',
        };
      case 'Out for delivery':
        return {
          label: 'OUT FOR DELIVERY',
          textColor: '#D97706',
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
        };
      case 'Delivered':
        return {
          label: 'DELIVERED',
          textColor: '#047857',
          bgColor: '#ECFDF5',
          borderColor: '#6EE7B7',
        };
      case 'Cancelled':
        return {
          label: 'CANCELLED',
          textColor: '#DC2626',
          bgColor: '#FEF2F2',
          borderColor: '#FECDD3',
        };
      default:
        return {
          label: 'CONFIRMED',
          textColor: '#059669',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
        };
    }
  };

  // Handle tapping a product to view its full Product Details Page (PDP)
  const handlePressProduct = useCallback(
    (orderItem: OrderItem | null, order: Order) => {
      if (!orderItem) return;

      // Smart Product ID Resolution
      let targetProductId = orderItem.id || 'p1';
      const lowerName = (orderItem.name || '').toLowerCase();
      const lowerId = (orderItem.id || '').toLowerCase();

      if (
        lowerName.includes('poplin') ||
        lowerName.includes('overshirt') ||
        lowerId.includes('poplin') ||
        lowerId === 'p1'
      ) {
        targetProductId = 'p1';
      } else if (
        lowerName.includes('chikankari') ||
        lowerName.includes('kurta') ||
        lowerId.includes('chikankari') ||
        lowerId === 'p2'
      ) {
        targetProductId = 'p2';
      } else if (
        lowerName.includes('silver') ||
        lowerName.includes('ring') ||
        lowerId.includes('ring') ||
        lowerId === 'p3'
      ) {
        targetProductId = 'p3';
      } else if (
        lowerName.includes('hoodie') ||
        lowerName.includes('streetwear') ||
        lowerId.includes('hoodie') ||
        lowerId === 'p4'
      ) {
        targetProductId = 'p4';
      } else if (
        lowerName.includes('chambray') ||
        lowerName.includes('denim') ||
        lowerId.includes('chambray') ||
        lowerId === 'p5'
      ) {
        targetProductId = 'p5';
      } else if (
        lowerName.includes('linen') ||
        lowerId.includes('linen') ||
        lowerId === 'p6'
      ) {
        targetProductId = 'p6';
      }

      // Preload image for instantaneous zero-latency render
      if (orderItem.image) {
        FastImage.preload([{ uri: orderItem.image, priority: FastImage.priority.high }]);
      }

      const sampleProd = SAMPLE_PRODUCTS[targetProductId];

      navigation.navigate('ProductDetails', {
        productId: targetProductId,
        product: sampleProd || {
          id: targetProductId,
          name: orderItem.name,
          price: orderItem.price,
          originalPrice: orderItem.originalPrice || Math.round(orderItem.price * 1.35),
          image: orderItem.image,
          boutiqueName: orderItem.boutiqueName || 'Sarojini Exclusive',
          boutiqueTag: (orderItem.boutiqueName || 'Sarojini Exclusive').toUpperCase(),
          size: orderItem.size,
          rating: 4.8,
        },
      });
    },
    [navigation]
  );

  // Render Fashion Order Card (Screenshot 2 & 5)
  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => {
      const isExpanded = !!expandedTrackingOrderIds[item.id];
      const primaryItem = item.items && item.items.length > 0 ? item.items[0] : null;
      const statusBadge = getStatusBadgeConfig(item.status);
      const isCancelled = item.status === 'Cancelled';

      return (
        <View style={styles.orderCard}>
          {/* 1. Top Card Header: Order ID & Date */}
          <View style={styles.cardHeaderRow}>
            <Text style={styles.orderIdText}>
              ID: {item.orderReference || item.id}
            </Text>
            <Text style={styles.orderDateText}>
              {formatOrderDate(item.createdAt)}
            </Text>
          </View>

          {/* 2. Interactive Product Row (Navigates to Product Details Screen) */}
          <TouchableOpacity
            style={styles.productRow}
            onPress={() => handlePressProduct(primaryItem, item)}
            activeOpacity={0.7}
          >
            {/* Product Image Thumbnail with Qty Badge */}
            <View style={styles.productImageContainer}>
              <FastImage
                source={{
                  uri:
                    primaryItem?.image ||
                    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80',
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.productThumbnail as any}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyBadgeText}>
                  Qty {primaryItem?.quantity || 1}
                </Text>
              </View>
            </View>

            {/* Right Details Column */}
            <View style={styles.productDetailsCol}>
              {/* Title & Price Row */}
              <View style={styles.titlePriceRow}>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {primaryItem?.name || 'HANDCRAFTED CHIKANKARI KURTA'}
                </Text>
                <Text style={styles.productPrice}>
                  ₹{(primaryItem?.price || item.totalAmount).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Seller Name & Status Tag Row */}
              <View style={styles.sellerStatusRow}>
                <Text style={styles.sellerNameText}>
                  Sold by: {primaryItem?.boutiqueName || 'Nvilar.com'}
                </Text>
                <View
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor: statusBadge.bgColor,
                      borderColor: statusBadge.borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.statusTagText, { color: statusBadge.textColor }]}>
                    {statusBadge.label}
                  </Text>
                </View>
              </View>

              {/* Spec Pills Row (Size & Discount & View Item CTA) */}
              <View style={styles.specPillsRow}>
                <View style={styles.sizePill}>
                  <Text style={styles.sizePillText}>
                    Size: {primaryItem?.size || 'L'}
                  </Text>
                </View>
                {Boolean(primaryItem?.discountBadge || item.savings) && (
                  <View style={styles.discountPill}>
                    <Text style={styles.discountPillText}>
                      {primaryItem?.discountBadge || '29% OFF'}
                    </Text>
                  </View>
                )}
                <View style={styles.viewItemPill}>
                  <Text style={styles.viewItemPillText}>View Item</Text>
                  <Icon name="chevron-right" size={13} color="#2563EB" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* 3. Card-Face Action Buttons */}
          <View style={styles.cardActionsRow}>
            {/* Help & Support Button */}
            <TouchableOpacity
              style={styles.helpSupportBtn}
              onPress={() => handleOpenSupport(item, 'paisa')}
              activeOpacity={0.75}
            >
              <Icon name="help-circle-outline" size={16} color="#2563EB" style={{ marginRight: 5 }} />
              <Text style={styles.helpSupportBtnText}>Help & Support</Text>
            </TouchableOpacity>

            {/* Tracking / Hide Button */}
            {!isCancelled && (
              <TouchableOpacity
                style={styles.trackingToggleBtn}
                onPress={() => toggleTracking(item.id)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.trackingToggleText,
                    isExpanded && styles.trackingToggleTextActive,
                  ]}
                >
                  {isExpanded ? 'Hide' : 'Tracking'}
                </Text>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-right'}
                  size={18}
                  color={isExpanded ? '#0F172A' : '#2563EB'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* 4. Inline Logistics Journey Accordion (Screenshot 5) */}
          {isExpanded && !isCancelled && (
            <View style={styles.logisticsAccordion}>
              <View style={styles.logisticsHeader}>
                <View style={styles.logisticsHeaderTitleWrap}>
                  <Icon name="truck-delivery-outline" size={17} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.logisticsHeaderTitle}>LOGISTICS JOURNEY</Text>
                </View>
                <View style={styles.onScheduleBadge}>
                  <Text style={styles.onScheduleText}>On Schedule</Text>
                </View>
              </View>

              {/* Vertical Stepper Timeline */}
              <View style={styles.stepperContainer}>
                {/* Step 1: Confirmed */}
                <View style={styles.stepperStep}>
                  <View style={styles.stepperNodeCol}>
                    <View style={styles.nodeCompleted}>
                      <Icon name="check" size={11} color="#FFFFFF" />
                    </View>
                    <View style={styles.verticalLineCompleted} />
                  </View>
                  <View style={styles.stepperContentCol}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>Order Received & Confirmed</Text>
                      <Text style={styles.stepTimeText}>[01:47 am]</Text>
                    </View>
                    <Text style={styles.stepSubtitle}>
                      Order verified and forwarded to atelier partner.
                    </Text>
                  </View>
                </View>

                {/* Step 2: Packed */}
                <View style={styles.stepperStep}>
                  <View style={styles.stepperNodeCol}>
                    <View
                      style={[
                        styles.nodeInProgress,
                        (item.status === 'Package' ||
                          item.status === 'Out for delivery' ||
                          item.status === 'Delivered') &&
                          styles.nodeCompleted,
                      ]}
                    >
                      {item.status === 'Package' ||
                      item.status === 'Out for delivery' ||
                      item.status === 'Delivered' ? (
                        <Icon name="check" size={11} color="#FFFFFF" />
                      ) : (
                        <View style={styles.nodeInnerDot} />
                      )}
                    </View>
                    <View
                      style={[
                        styles.verticalLinePending,
                        (item.status === 'Out for delivery' || item.status === 'Delivered') &&
                          styles.verticalLineCompleted,
                      ]}
                    />
                  </View>
                  <View style={styles.stepperContentCol}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>Order Packed & Quality Checked</Text>
                      <Text style={styles.stepTimeText}>
                        {item.status === 'Preparing' ? '[In Progress • Est. Today 4:00 PM]' : '[Completed]'}
                      </Text>
                    </View>
                    <Text style={styles.stepSubtitle}>
                      12-point fabric inspection and tamper-proof packaging in progress.
                    </Text>
                  </View>
                </View>

                {/* Step 3: Shipped Priority Air */}
                <View style={styles.stepperStep}>
                  <View style={styles.stepperNodeCol}>
                    <View
                      style={[
                        styles.nodePending,
                        (item.status === 'Out for delivery' || item.status === 'Delivered') &&
                          styles.nodeCompleted,
                      ]}
                    >
                      {item.status === 'Out for delivery' || item.status === 'Delivered' ? (
                        <Icon name="check" size={11} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.verticalLinePending,
                        item.status === 'Delivered' && styles.verticalLineCompleted,
                      ]}
                    />
                  </View>
                  <View style={styles.stepperContentCol}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>Shipped via Blue Dart Express Priority Air</Text>
                      <Text style={styles.stepTimeText}>[Tomorrow Morning]</Text>
                    </View>
                    <Text style={styles.stepSubtitle}>
                      Blue Dart Express Priority Air • AWB: BD-84445446IN
                    </Text>
                  </View>
                </View>

                {/* Step 4: Out for Delivery */}
                <View style={styles.stepperStep}>
                  <View style={styles.stepperNodeCol}>
                    <View
                      style={[
                        styles.nodePending,
                        item.status === 'Out for delivery' && styles.nodeInProgress,
                        item.status === 'Delivered' && styles.nodeCompleted,
                      ]}
                    >
                      {item.status === 'Delivered' && <Icon name="check" size={11} color="#FFFFFF" />}
                    </View>
                    <View style={styles.verticalLinePending} />
                  </View>
                  <View style={styles.stepperContentCol}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>Out for Delivery</Text>
                      <Text style={styles.stepTimeText}>[Within 2-3 Days]</Text>
                    </View>
                    <Text style={styles.stepSubtitle}>
                      Courier agent will arrive with OTP verification.
                    </Text>
                    {item.otp && item.status === 'Out for delivery' && (
                      <View style={styles.otpInlineChip}>
                        <Icon name="shield-key-outline" size={13} color="#059669" />
                        <Text style={styles.otpInlineText}>Delivery OTP: {item.otp}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Step 5: Delivered */}
                <View style={styles.stepperStep}>
                  <View style={styles.stepperNodeCol}>
                    <View
                      style={[
                        styles.nodePending,
                        item.status === 'Delivered' && styles.nodeCompleted,
                      ]}
                    >
                      {item.status === 'Delivered' && <Icon name="check" size={11} color="#FFFFFF" />}
                    </View>
                  </View>
                  <View style={styles.stepperContentCol}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>Delivered</Text>
                      <Text style={styles.stepTimeText}>[Within 2-3 Days]</Text>
                    </View>
                    <Text style={styles.stepSubtitle}>
                      Delivery to registered address.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    },
    [expandedTrackingOrderIds, toggleTracking, handleOpenSupport]
  );

  return (
    <View style={styles.container}>
      {/* 1. Header (Safe Area Protected) */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="chevron-left" size={26} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.avatarCircle}>
              <Icon name="account-outline" size={16} color="#059669" />
            </View>
            <View>
              <Text style={styles.headerSubtitle}>MY PURCHASE</Text>
              <Text style={styles.headerTitle}>ORDER HISTORY</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButtonSmall}
              onPress={() => {
                showToast({
                  type: 'info',
                  title: 'Order PDF Report',
                  message: 'Consolidated purchase ledger downloaded.',
                });
              }}
              activeOpacity={0.75}
            >
              <Icon name="download" size={14} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.pdfText}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButtonSmall}
              onPress={() => setViewMode((prev) => (prev === 'active' ? 'history' : 'active'))}
              activeOpacity={0.75}
            >
              <Icon
                name="information-outline"
                size={16}
                color={viewMode === 'history' ? '#059669' : '#64748B'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active vs Delivered Filter Switcher Tabs */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[styles.filterTab, viewMode === 'active' && styles.filterTabActive]}
            onPress={() => setViewMode('active')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                viewMode === 'active' && styles.filterTabTextActive,
              ]}
            >
              Active Orders ({activeOrders.length})
            </Text>
            {viewMode === 'active' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, viewMode === 'history' && styles.filterTabActive]}
            onPress={() => setViewMode('history')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                viewMode === 'history' && styles.filterTabTextActive,
              ]}
            >
              Delivered & History ({historyOrders.length})
            </Text>
            {viewMode === 'history' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Orders List */}
      {displayedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-outline" size={56} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No {viewMode} orders found</Text>
          <Text style={styles.emptySubtitle}>
            {viewMode === 'active'
              ? 'Your active fashion deliveries will appear here with live tracking.'
              : 'Past completed purchases and cancelled orders appear here.'}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.85}
          >
            <Text style={styles.browseButtonText}>Explore Runway Collections</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedOrders}
          keyExtractor={(item: Order) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 3. Order Support Modal (Screenshot 3 & 4) */}
      <Modal
        visible={Boolean(supportOrder)}
        animationType="slide"
        transparent
        onRequestClose={() => setSupportOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSupportOrder(null)}
          />

          {supportOrder && (
            <View style={[styles.supportSheetCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              {/* Handle Bar */}
              <View style={styles.drawerHandle} />

              {/* Modal Header */}
              <View style={styles.supportHeaderRow}>
                <View>
                  <Text style={styles.supportHeaderTitle}>ORDER SUPPORT</Text>
                  <Text style={styles.supportHeaderSubtitle}>
                    ORDER {supportOrder.orderReference || supportOrder.id}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSupportOrder(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={22} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {/* 3 Segmented Support Tabs */}
              <View style={styles.supportTabsSegment}>
                <TouchableOpacity
                  style={[styles.segmentTab, supportTab === 'paisa' && styles.segmentTabActive]}
                  onPress={() => setSupportTab('paisa')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentTabText,
                      supportTab === 'paisa' && styles.segmentTabTextActive,
                    ]}
                  >
                    💰 PAISA
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentTab, supportTab === 'address' && styles.segmentTabActive]}
                  onPress={() => setSupportTab('address')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentTabText,
                      supportTab === 'address' && styles.segmentTabTextActive,
                    ]}
                  >
                    📍 ADDRESS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentTab, supportTab === 'cancel' && styles.segmentTabActive]}
                  onPress={() => setSupportTab('cancel')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentTabText,
                      supportTab === 'cancel' && styles.segmentTabTextActive,
                    ]}
                  >
                    ❌ CANCEL
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab 1 Content: PAISA (Settlement Summary) */}
              {supportTab === 'paisa' && (
                <View style={styles.paisaTabContent}>
                  <View style={styles.settlementCard}>
                    <View style={styles.settlementHeaderRow}>
                      <View style={styles.settlementTitleWrap}>
                        <Icon name="credit-card-outline" size={17} color="#059669" style={{ marginRight: 6 }} />
                        <Text style={styles.settlementTitle}>SETTLEMENT SUMMARY</Text>
                      </View>
                      <View style={styles.upiBadge}>
                        <Text style={styles.upiBadgeText}>
                          {supportOrder.paymentMethod || 'Paid via UPI'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.settlementRowsList}>
                      <View style={styles.summaryLineRow}>
                        <Text style={styles.summaryLabel}>Total Items MRP</Text>
                        <Text style={styles.summaryValue}>
                          ₹{(supportOrder.mrp || Math.round(supportOrder.totalAmount * 1.3)).toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <View style={styles.summaryLineRow}>
                        <View style={styles.savingsLabelRow}>
                          <Icon name="sparkles" size={13} color="#059669" style={{ marginRight: 4 }} />
                          <Text style={styles.savingsLabelText}>Special Savings & Discount</Text>
                        </View>
                        <Text style={styles.savingsValueText}>
                          -₹{(supportOrder.savings || Math.round(supportOrder.totalAmount * 0.3)).toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <View style={styles.summaryLineRow}>
                        <Text style={styles.summaryLabel}>Delivery & Handling Fees</Text>
                        <Text style={styles.summaryValue}>
                          ₹{supportOrder.deliveryFee ?? 59}
                        </Text>
                      </View>

                      <View style={styles.summaryDivider} />

                      <View style={styles.summaryTotalRow}>
                        <Text style={styles.summaryTotalLabel}>Total Amount Paid</Text>
                        <Text style={styles.summaryTotalValue}>
                          ₹{supportOrder.totalAmount.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Download Official Invoice PDF Button */}
                  <TouchableOpacity
                    style={styles.downloadInvoiceBtn}
                    onPress={() => handleDownloadInvoice(supportOrder)}
                    activeOpacity={0.8}
                  >
                    <Icon name="download-outline" size={18} color="#0F172A" style={{ marginRight: 6 }} />
                    <Text style={styles.downloadInvoiceBtnText}>Download Official Invoice PDF</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tab 2 Content: ADDRESS */}
              {supportTab === 'address' && (
                <View style={styles.addressTabContent}>
                  <View style={styles.addressDisplayCard}>
                    <View style={styles.addressHeaderRow}>
                      <Icon name="map-marker-radius-outline" size={18} color="#059669" style={{ marginRight: 6 }} />
                      <Text style={styles.addressCardTitle}>REGISTERED DELIVERY DESTINATION</Text>
                    </View>

                    <Text style={styles.recipientName}>
                      {supportOrder.address?.yourName || 'Rahul Verma'}
                    </Text>

                    <Text style={styles.recipientAddress}>
                      {supportOrder.address?.houseNoName || 'House #42, Dispur Last Gate'},{' '}
                      {supportOrder.address?.nearbyArea || 'Near Secretariat'},{' '}
                      {supportOrder.address?.cityVillage || 'Guwahati'},{' '}
                      {supportOrder.address?.state || 'Assam'} -{' '}
                      {supportOrder.address?.pincode || '781006'}
                    </Text>

                    <View style={styles.phoneRow}>
                      <Icon name="phone-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.phoneText}>
                        {supportOrder.address?.phone || '+91 98765 43210'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.changeAddressBtn}
                    onPress={() => {
                      showToast({
                        type: 'info',
                        title: 'Address Modification',
                        message: 'Delivery hub notified. Address updated for upcoming courier dispatch.',
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon name="pencil-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
                    <Text style={styles.changeAddressBtnText}>Change Delivery Address</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tab 3 Content: CANCEL (Screenshot 4) */}
              {supportTab === 'cancel' && (
                <View style={styles.cancelTabContent}>
                  {/* Warm Countdown Banner */}
                  <View style={styles.cancelCountdownBanner}>
                    <Icon name="clock-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
                    <Text style={styles.cancelCountdownTitle}>24-Hour Free Cancellation:</Text>
                    <View style={styles.countdownTimePill}>
                      <Text style={styles.countdownTimeText}>23h 52m 20s left</Text>
                    </View>
                  </View>

                  <Text style={styles.cancelReasonHeader}>SELECT REASON FOR CANCELLATION</Text>

                  {/* 5 Radio Option Cards */}
                  <View style={styles.cancelOptionsList}>
                    {CANCELLATION_REASONS.map((reason) => {
                      const isSelected = selectedCancelReason === reason;
                      return (
                        <TouchableOpacity
                          key={reason}
                          style={[
                            styles.cancelOptionCard,
                            isSelected && styles.cancelOptionCardActive,
                          ]}
                          onPress={() => setSelectedCancelReason(reason)}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleActive,
                            ]}
                          >
                            {isSelected && <View style={styles.radioDot} />}
                          </View>
                          <Text
                            style={[
                              styles.cancelOptionText,
                              isSelected && styles.cancelOptionTextActive,
                            ]}
                          >
                            {reason}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Proceed to Cancel Button */}
                  <TouchableOpacity
                    style={styles.proceedCancelBtn}
                    onPress={handleConfirmCancel}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.proceedCancelBtnText}>PROCEED TO CANCEL ›</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
});

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header Styles
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    fontStyle: 'italic',
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pdfText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  // Filter Tabs
  filterTabsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },

  // List Content
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Order Card (Screenshot 2)
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.3,
  },
  orderDateText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Product Row
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImageContainer: {
    width: 76,
    height: 76,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  productThumbnail: {
    width: '100%',
    height: '100%',
  },
  qtyBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  qtyBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  productDetailsCol: {
    flex: 1,
    marginLeft: 12,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  sellerStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sellerNameText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  specPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  sizePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  sizePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  discountPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  discountPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  viewItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#BFDBFE',
    marginLeft: 'auto',
  },
  viewItemPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    marginRight: 1,
  },

  // Card Actions Row
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  helpSupportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  helpSupportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  trackingToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trackingToggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
    marginRight: 2,
  },
  trackingToggleTextActive: {
    color: '#0F172A',
  },

  // Logistics Journey Accordion (Screenshot 5)
  logisticsAccordion: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  logisticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logisticsHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logisticsHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  onScheduleBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  onScheduleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },

  // Stepper
  stepperContainer: {
    paddingLeft: 4,
  },
  stepperStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepperNodeCol: {
    alignItems: 'center',
    width: 22,
    marginRight: 10,
  },
  nodeCompleted: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeInProgress: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  nodePending: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLineCompleted: {
    width: 2,
    height: 28,
    backgroundColor: '#059669',
    marginTop: 2,
  },
  verticalLinePending: {
    width: 2,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
  },
  stepperContentCol: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepTimeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  otpInlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  otpInlineText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  browseButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  browseButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Support Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  supportSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  supportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  supportHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  supportHeaderSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },

  // 3 Segmented Support Tabs
  supportTabsSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginTop: 12,
    marginBottom: 14,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  // PAISA Tab
  paisaTabContent: {
    paddingVertical: 4,
  },
  settlementCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settlementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settlementTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settlementTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  upiBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  upiBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  settlementRowsList: {
    gap: 8,
  },
  summaryLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  savingsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsLabelText: {
    fontSize: 12.5,
    color: '#059669',
    fontWeight: '700',
  },
  savingsValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  downloadInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  downloadInvoiceBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ADDRESS Tab
  addressTabContent: {
    paddingVertical: 4,
  },
  addressDisplayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  recipientAddress: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  phoneText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  changeAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  changeAddressBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // CANCEL Tab (Screenshot 4)
  cancelTabContent: {
    paddingVertical: 4,
  },
  cancelCountdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  cancelCountdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  countdownTimePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  countdownTimeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  cancelReasonHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  cancelOptionsList: {
    gap: 8,
    marginBottom: 14,
  },
  cancelOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cancelOptionCardActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: '#DC2626',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  cancelOptionText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  cancelOptionTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },
  proceedCancelBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 6,
  },
  proceedCancelBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
