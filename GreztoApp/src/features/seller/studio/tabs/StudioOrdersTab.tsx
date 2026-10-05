import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Image,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudioOrderItem, OrderStatus, OrderFulfillmentType } from '../studioTypes';
import { useSellerStore } from '../../sellerStore';
import { showToast } from '../../../../components/MitrenoToast';

export type OrdersViewMode = 'standard' | 'nearby';
export type OrderFilterStatus =
  | 'all'
  | 'new'
  | 'packaging'
  | 'shipped'
  | 'delivered'
  | 'returned'
  | 'cancelled';

interface FilterOption {
  key: OrderFilterStatus;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'new', label: 'New Orders' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'returned', label: 'Returns' },
  { key: 'cancelled', label: 'Cancelled' },
];

export const StudioOrdersTab: React.FC = memo(() => {
  const insets = useSafeAreaInsets();
  const orders = useSellerStore((state) => state.orders);
  const updateOrderStatus = useSellerStore((state) => state.updateOrderStatus);
  const assignRider = useSellerStore((state) => state.assignRider);

  const [viewMode, setViewMode] = useState<OrdersViewMode>('standard');
  const [activeFilter, setActiveFilter] = useState<OrderFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<StudioOrderItem | null>(null);
  const [bulkPrintModalVisible, setBulkPrintModalVisible] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Filter orders according to view mode
  const currentOrders = useMemo(() => {
    if (viewMode === 'nearby') {
      return orders.filter(
        (o) =>
          o.fulfillmentType === 'hyperlocal' ||
          (o.distanceKm !== undefined && o.distanceKm <= 10)
      );
    }
    return orders;
  }, [orders, viewMode]);

  // Compute status counts for the filter tabs row
  const filterCounts = useMemo(() => {
    return {
      all: currentOrders.length,
      new: currentOrders.filter((o) => o.status === 'new').length,
      packaging: currentOrders.filter((o) => o.status === 'packaging').length,
      shipped: currentOrders.filter((o) => o.status === 'shipped').length,
      delivered: currentOrders.filter((o) => o.status === 'delivered').length,
      returned: currentOrders.filter((o) => o.status === 'returned').length,
      cancelled: currentOrders.filter((o) => o.status === 'cancelled').length,
    };
  }, [currentOrders]);

  // Compute Hyperlocal KPI Statistics
  const hyperlocalKPIs = useMemo(() => {
    const nearbyOrdersList = orders.filter(
      (o) =>
        o.fulfillmentType === 'hyperlocal' ||
        (o.distanceKm !== undefined && o.distanceKm <= 10)
    );
    const nearbyTotal = nearbyOrdersList.length;
    const awaitingRider = nearbyOrdersList.filter(
      (o) => !o.riderAssigned && o.status !== 'delivered' && o.status !== 'cancelled'
    ).length;
    const ridersOnRoute = nearbyOrdersList.filter(
      (o) => o.riderAssigned && o.status === 'shipped'
    ).length;
    const deliveredToday = nearbyOrdersList.filter(
      (o) => o.status === 'delivered'
    ).length;

    return { nearbyTotal, awaitingRider, ridersOnRoute, deliveredToday };
  }, [orders]);

  // Count ready to print orders
  const printableOrdersCount = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'new' || o.status === 'packaging' || o.status === 'shipped'
    ).length;
  }, [orders]);

  // Filtered orders after status and search query
  const displayedOrders = useMemo(() => {
    return currentOrders.filter((order) => {
      // 1. Status Filter
      if (activeFilter !== 'all' && order.status !== activeFilter) {
        return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = order.orderNumber.toLowerCase().includes(query);
        const matchCustomer = order.customerName.toLowerCase().includes(query);
        const matchCity = order.customerCity.toLowerCase().includes(query);
        const matchProduct = order.productTitle.toLowerCase().includes(query);
        const matchFabric = order.fabric.toLowerCase().includes(query);
        return matchNumber || matchCustomer || matchCity || matchProduct || matchFabric;
      }

      return true;
    });
  }, [currentOrders, activeFilter, searchQuery]);

  // Copy order ID handler
  const handleCopyOrderId = useCallback((orderNumber: string) => {
    setCopiedOrderId(orderNumber);
    showToast({
      type: 'info',
      title: 'Order ID Copied',
      message: `${orderNumber} copied to clipboard.`,
    });
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2000);
  }, []);

  // Download shipping slip handler
  const handleDownloadSlip = useCallback((order: StudioOrderItem) => {
    showToast({
      type: 'success',
      title: 'AWB Slip Downloaded',
      message: `AWB Shipping slip downloaded for ${order.orderNumber}.`,
    });
  }, []);

  // Compact Status Confirmation Modal State ("Halka Sa Popup")
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    order: StudioOrderItem | null;
    targetStatus: 'packaging' | 'shipped' | 'delivered';
    title: string;
    message: string;
    actionLabel: string;
    actionColor: string;
    icon: string;
  }>({
    visible: false,
    order: null,
    targetStatus: 'packaging',
    title: '',
    message: '',
    actionLabel: '',
    actionColor: '#047857',
    icon: 'check-circle-outline',
  });

  // Request move order status forward (Opens Confirmation Popup)
  const handleRequestAdvanceOrderStatus = useCallback((order: StudioOrderItem) => {
    if (order.status === 'new') {
      setConfirmDialog({
        visible: true,
        order,
        targetStatus: 'packaging',
        title: 'Accept Order?',
        message: `Accept order #${order.orderNumber} and begin packaging?`,
        actionLabel: 'Confirm Accept',
        actionColor: '#047857',
        icon: 'check-circle-outline',
      });
    } else if (order.status === 'packaging') {
      setConfirmDialog({
        visible: true,
        order,
        targetStatus: 'shipped',
        title: 'Dispatch to Courier?',
        message: `Hand over order #${order.orderNumber} to express courier partner?`,
        actionLabel: 'Confirm Dispatch',
        actionColor: '#4F46E5',
        icon: 'truck-fast',
      });
    } else if (order.status === 'shipped') {
      setConfirmDialog({
        visible: true,
        order,
        targetStatus: 'delivered',
        title: 'Mark as Delivered?',
        message: `Has order #${order.orderNumber} reached the customer?`,
        actionLabel: 'Confirm Delivered',
        actionColor: '#059669',
        icon: 'check-decagram',
      });
    }
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, visible: false, order: null }));
  }, []);

  const handleExecuteConfirm = useCallback(() => {
    const { order, targetStatus } = confirmDialog;
    if (!order) return;

    if (targetStatus === 'packaging') {
      updateOrderStatus(order.id, 'packaging');
      showToast({
        type: 'success',
        title: 'Moved to Packaging',
        message: `Order #${order.orderNumber} moved to packaging bay.`,
      });
    } else if (targetStatus === 'shipped') {
      updateOrderStatus(order.id, 'shipped');
      showToast({
        type: 'success',
        title: 'Shipped to Courier',
        message: `Dispatched #${order.orderNumber} with live AWB tracking.`,
      });
    } else if (targetStatus === 'delivered') {
      updateOrderStatus(order.id, 'delivered');
      showToast({
        type: 'success',
        title: 'Order Delivered',
        message: `Order #${order.orderNumber} marked as successfully delivered.`,
      });
    }

    setConfirmDialog((prev) => ({ ...prev, visible: false, order: null }));
  }, [confirmDialog, updateOrderStatus, showToast]);

  // Hyperlocal Assign Rider handler
  const handleAssignRider = useCallback(
    (order: StudioOrderItem) => {
      assignRider(order.id, 'Rahul (Express Fleet)');
      showToast({
        type: 'success',
        title: 'Express Rider Assigned',
        message: `Rider Rahul (Express Fleet) dispatched for ${order.orderNumber}. ETA: 8 mins.`,
      });
    },
    [assignRider]
  );

  // Hyperlocal Handover to Rider handler
  const handleHandoverToRider = useCallback(
    (order: StudioOrderItem) => {
      updateOrderStatus(order.id, 'shipped');
      showToast({
        type: 'success',
        title: 'Handover Verified',
        message: `Order ${order.orderNumber} handed over to ${order.riderName || 'Rider'}. Parcel in transit.`,
      });
    },
    [updateOrderStatus]
  );

  // Fetch live backend orders on mount
  useEffect(() => {
    useSellerStore.getState().fetchSellerStudioDataFromBackend().catch(() => {});
  }, []);

  // Refresh queue handler
  const handleRefresh = useCallback(async () => {
    try {
      await useSellerStore.getState().fetchSellerStudioDataFromBackend();
    } catch {}
    showToast({
      type: 'info',
      title: 'Order Queue Synced',
      message: 'Fulfillment queue refreshed with central logistics radar.',
    });
  }, []);

  // Bulk print handler
  const handleBulkPrint = useCallback(() => {
    setBulkPrintModalVisible(true);
  }, []);

  const handleConfirmBulkPrint = useCallback(() => {
    setBulkPrintModalVisible(false);
    showToast({
      type: 'success',
      title: 'Bulk Manifest Dispatched',
      message: `Thermal shipping labels generated for ${printableOrdersCount} active orders.`,
    });
  }, [printableOrdersCount]);

  // Helper for Status Pill rendering
  const renderStatusPill = useCallback((status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <View style={[styles.statusBadge, styles.statusNewBadge]}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusBadgeText, styles.statusNewText]}>New Order</Text>
          </View>
        );
      case 'packaging':
        return (
          <View style={[styles.statusBadge, styles.statusPackagingBadge]}>
            <View style={[styles.statusDot, { backgroundColor: '#2563EB' }]} />
            <Text style={[styles.statusBadgeText, styles.statusPackagingText]}>Packaging</Text>
          </View>
        );
      case 'shipped':
        return (
          <View style={[styles.statusBadge, styles.statusShippedBadge]}>
            <View style={[styles.statusDot, { backgroundColor: '#059669' }]} />
            <Text style={[styles.statusBadgeText, styles.statusShippedText]}>Shipped</Text>
          </View>
        );
      case 'delivered':
        return (
          <View style={[styles.statusBadge, styles.statusDeliveredBadge]}>
            <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
            <Text style={[styles.statusBadgeText, styles.statusDeliveredText]}>Delivered</Text>
          </View>
        );
      case 'returned':
        return (
          <View style={[styles.statusBadge, styles.statusReturnedBadge]}>
            <View style={[styles.statusDot, { backgroundColor: '#E11D48' }]} />
            <Text style={[styles.statusBadgeText, styles.statusReturnedText]}>Return Req.</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.statusBadge, styles.statusCancelledBadge]}>
            <View style={[styles.statusDot, { backgroundColor: '#64748B' }]} />
            <Text style={[styles.statusBadgeText, styles.statusCancelledText]}>Cancelled</Text>
          </View>
        );
      default:
        return null;
    }
  }, []);

  // Standard Order Card Item
  const renderStandardOrderCard = useCallback(
    ({ item }: { item: StudioOrderItem }) => {
      return (
        <View style={styles.orderCard}>
          {/* Card Top Row: Customer Name, Date/Time, Status Pill, 3-Dot Menu */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardCustomerTimeWrap}>
              <Icon name="account" size={15} color="#0F172A" style={{ marginRight: 5 }} />
              <Text style={styles.cardCustomerName}>{item.customerName}</Text>
              <Text style={styles.cardTimeText}>• {item.placedAt}</Text>
            </View>

            <View style={styles.cardTopRightWrap}>
              {renderStatusPill(item.status)}
              <TouchableOpacity
                style={styles.threeDotButton}
                activeOpacity={0.7}
                onPress={() => setSelectedOrderForModal(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="dots-vertical" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Row */}
          <View style={styles.productRow}>
            <Image
              source={{ uri: item.productImage }}
              style={styles.productThumbnail}
              resizeMode="cover"
            />
            <View style={styles.productDetailsCol}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {item.productTitle}
              </Text>

              {/* Attribute Tags */}
              <View style={styles.tagsRow}>
                <View style={styles.attributeTag}>
                  <Text style={styles.attributeTagText}>Size: {item.size}</Text>
                </View>
                <View style={styles.attributeTag}>
                  <Text style={styles.attributeTagText}>Qty: {item.qty}</Text>
                </View>
                <View style={styles.attributeTag}>
                  <Text style={styles.attributeTagText} numberOfLines={1}>
                    {item.fabric}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settlement Row (Clean Total Settlement, No Strikethroughs or Discount Pills) */}
          <View style={styles.settlementRow}>
            <Text style={styles.settlementLabel}>Total Settlement: </Text>
            <Text style={styles.settlementAmount}>
              ₹{item.totalSettlement.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Action Buttons Row (Left Slip Button + Right Status Action) */}
          <View style={styles.actionButtonsRow}>
            {/* Left Button: Download Slip */}
            <TouchableOpacity
              style={styles.cardSlipBtn}
              activeOpacity={0.8}
              onPress={() => handleDownloadSlip(item)}
            >
              <Icon name="download" size={15} color="#0F172A" style={{ marginRight: 4 }} />
              <Text style={styles.cardSlipBtnText}>Slip</Text>
            </TouchableOpacity>

            {/* Right Button: Main Action */}
            {item.status === 'new' && (
              <TouchableOpacity
                style={[styles.nextStatusBtn, styles.acceptOrderActionBtn]}
                activeOpacity={0.85}
                onPress={() => handleRequestAdvanceOrderStatus(item)}
              >
                <Icon name="check-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.nextStatusBtnText}>Accept Order</Text>
              </TouchableOpacity>
            )}

            {item.status === 'packaging' && (
              <TouchableOpacity
                style={[styles.nextStatusBtn, styles.shippedActionBtn]}
                activeOpacity={0.85}
                onPress={() => handleRequestAdvanceOrderStatus(item)}
              >
                <Icon name="truck-fast" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.nextStatusBtnText}>Dispatch to Courier</Text>
              </TouchableOpacity>
            )}

            {item.status === 'shipped' && (
              <TouchableOpacity
                style={[styles.nextStatusBtn, styles.deliveredActionBtn]}
                activeOpacity={0.85}
                onPress={() => handleRequestAdvanceOrderStatus(item)}
              >
                <Icon name="check-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.nextStatusBtnText}>Mark Delivered</Text>
              </TouchableOpacity>
            )}

            {item.status === 'delivered' && (
              <View style={[styles.nextStatusBtn, styles.completedStateBtn]}>
                <Icon name="check-bold" size={14} color="#059669" style={{ marginRight: 6 }} />
                <Text style={styles.completedStateBtnText}>Delivered ✓</Text>
              </View>
            )}

            {(item.status === 'returned' || item.status === 'cancelled') && (
              <View style={[styles.nextStatusBtn, styles.completedStateBtn]}>
                <Icon name="information-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.completedStateBtnText}>
                  {item.status === 'returned' ? 'Return Processing' : 'Cancelled'}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    },
    [renderStatusPill, handleRequestAdvanceOrderStatus, handleDownloadSlip]
  );

  // Hyperlocal Order Card Item
  const renderHyperlocalOrderCard = useCallback(
    ({ item }: { item: StudioOrderItem }) => {
      return (
        <View style={[styles.orderCard, styles.hyperlocalCardBorder]}>
          {/* Hyperlocal Header: Customer Name, Time, Distance Badge, 3-Dot Menu */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardCustomerTimeWrap}>
              <Icon name="account" size={15} color="#0F172A" style={{ marginRight: 5 }} />
              <Text style={styles.cardCustomerName}>{item.customerName}</Text>
              <Text style={styles.cardTimeText}>• {item.placedAt}</Text>
            </View>

            <View style={styles.cardTopRightWrap}>
              <View style={styles.distanceBadge}>
                <Icon name="lightning-bolt" size={12} color="#059669" style={{ marginRight: 2 }} />
                <Text style={styles.distanceBadgeText}>
                  {item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : '4.2 km'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.threeDotButton}
                activeOpacity={0.7}
                onPress={() => setSelectedOrderForModal(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="dots-vertical" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Row */}
          <View style={styles.productRow}>
            <Image
              source={{ uri: item.productImage }}
              style={styles.productThumbnail}
              resizeMode="cover"
            />
            <View style={styles.productDetailsCol}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {item.productTitle}
              </Text>

              <View style={styles.tagsRow}>
                <View style={styles.attributeTag}>
                  <Text style={styles.attributeTagText}>Size: {item.size}</Text>
                </View>
                <View style={styles.attributeTag}>
                  <Text style={styles.attributeTagText}>Qty: {item.qty}</Text>
                </View>
                <View style={styles.attributeTag}>
                  <Text style={styles.attributeTagText}>{item.fabric}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settlement Row */}
          <View style={styles.settlementRow}>
            <Text style={styles.settlementLabel}>Total Settlement: </Text>
            <Text style={styles.settlementAmount}>
              ₹{item.totalSettlement.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Rider Status & Dispatch Action Area */}
          <View style={styles.riderSectionContainer}>
            {!item.riderAssigned ? (
              <View style={styles.awaitingRiderBox}>
                <View style={styles.awaitingRiderAlertRow}>
                  <Icon name="motorbike-off" size={16} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={styles.awaitingRiderText}>
                    Awaiting Rider Assignment (In-House Fleet Ready)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.assignRiderButton}
                  activeOpacity={0.85}
                  onPress={() => handleAssignRider(item)}
                >
                  <Icon name="motorbike" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.assignRiderButtonText}>Assign Rider</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.assignedRiderBox}>
                <View style={styles.riderIdentityRow}>
                  <View style={styles.riderAvatarCircle}>
                    <Icon name="motorbike" size={17} color="#065F46" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.riderNameText}>
                        {item.riderName || 'Rahul (Express Fleet)'}
                      </Text>
                      <Icon
                        name="check-decagram"
                        size={14}
                        color="#059669"
                        style={{ marginLeft: 4 }}
                      />
                    </View>
                    <Text style={styles.riderStatusSubtext}>
                      {item.status === 'shipped'
                        ? 'En Route to Buyer GPS'
                        : item.status === 'delivered'
                        ? 'Delivered to Customer'
                        : 'Arrived at Store • Ready for Handover'}
                    </Text>
                  </View>
                </View>

                {item.status !== 'shipped' && item.status !== 'delivered' && (
                  <TouchableOpacity
                    style={styles.handoverButton}
                    activeOpacity={0.85}
                    onPress={() => handleHandoverToRider(item)}
                  >
                    <Icon
                      name="package-variant-closed-check"
                      size={17}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.handoverButtonText}>Handover to Rider</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'shipped' && (
                  <TouchableOpacity
                    style={styles.markDeliveredByRiderBtn}
                    activeOpacity={0.85}
                    onPress={() => handleRequestAdvanceOrderStatus(item)}
                  >
                    <Icon name="check-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.handoverButtonText}>Confirm Delivery</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'delivered' && (
                  <View style={styles.deliveredByRiderPill}>
                    <Icon name="check-all" size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={styles.deliveredByRiderText}>
                      Successfully Delivered Today
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      );
    },
    [
      copiedOrderId,
      handleCopyOrderId,
      handleAssignRider,
      handleHandoverToRider,
      handleRequestAdvanceOrderStatus,
    ]
  );

  return (
    <View style={styles.container}>
      {/* 1. Header Section */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        {/* Title and Active Orders Pill */}
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Orders Fulfillment</Text>
          <View style={styles.liveOrdersPill}>
            <View style={styles.headerLiveDot} />
            <Text style={styles.liveOrdersPillText}>{orders.length} Active Orders</Text>
          </View>
        </View>

        {/* Subtitle */}
        <Text style={styles.headerSubtitle}>
          Manage packing bay, dispatch courier packages & track live hyperlocal delivery.
        </Text>

        {/* Search Bar + Bulk Print (Refresh button removed per request) */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Icon name="magnify" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search order, customer, SKU..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {Boolean(searchQuery.trim()) && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Bulk Print Button */}
          <TouchableOpacity
            style={styles.bulkPrintButton}
            onPress={handleBulkPrint}
            activeOpacity={0.8}
          >
            <Icon name="printer-outline" size={17} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.bulkPrintButtonText}>Bulk Print ({printableOrdersCount})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Toggle Switcher: Standard Orders vs Nearby Orders (2 Separated Distinct Cards) */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleCard,
            viewMode === 'standard' ? styles.toggleCardActiveStandard : styles.toggleCardInactive,
          ]}
          onPress={() => setViewMode('standard')}
          activeOpacity={0.85}
        >
          <Icon
            name="package-variant-closed"
            size={17}
            color={viewMode === 'standard' ? '#FFFFFF' : '#475569'}
            style={{ marginRight: 7 }}
          />
          <Text
            style={[
              styles.toggleCardText,
              viewMode === 'standard' ? styles.toggleCardTextActive : styles.toggleCardTextInactive,
            ]}
          >
            Standard Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleCard,
            viewMode === 'nearby' ? styles.toggleCardActiveNearby : styles.toggleCardInactive,
          ]}
          onPress={() => setViewMode('nearby')}
          activeOpacity={0.85}
        >
          <Icon
            name="lightning-bolt"
            size={17}
            color={viewMode === 'nearby' ? '#FBBF24' : '#EA580C'}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.toggleCardText,
              viewMode === 'nearby' ? styles.toggleCardTextActive : styles.toggleCardTextInactive,
            ]}
          >
            Nearby Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Filter Tabs Row (Horizontal scrollable) */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {FILTER_OPTIONS.map((filter) => {
            const count = filterCounts[filter.key] ?? 0;
            const isActive = activeFilter === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4 & 5. Orders Content View */}
      {viewMode === 'nearby' ? (
        /* Hyperlocal (< 10 KM) Express Dispatch View */
        <FlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderHyperlocalOrderCard}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.hyperlocalHeaderWrap}>
              {/* Express Radar Banner */}
              <LinearGradient
                colors={['#064E3B', '#047857']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hyperlocalBanner}
              >
                <View style={styles.bannerTopTitleRow}>
                  <View style={styles.bannerTitleWithIcon}>
                    <Icon name="lightning-bolt" size={20} color="#FBBF24" style={{ marginRight: 6 }} />
                    <Text style={styles.bannerTitleText}>Nearby Orders Dispatch</Text>
                  </View>
                  <View style={styles.sameDayPill}>
                    <Text style={styles.sameDayPillText}>SAME-DAY (&lt; 10 KM)</Text>
                  </View>
                </View>

                <Text style={styles.bannerSubtitle}>
                  Direct intra-city fulfillment via In-House & Platform Express Delivery Fleet.
                </Text>

                <View style={styles.bannerFleetStatusRow}>
                  <View style={styles.liveGreenDot} />
                  <Text style={styles.bannerFleetStatusText}>
                    Active Fleet: 14 Intra-City Couriers on Standby
                  </Text>
                </View>
              </LinearGradient>

              {/* 4 KPI Count Boxes */}
              <View style={styles.kpiGrid}>
                {/* Box 1: Nearby Orders */}
                <View style={styles.kpiCard}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                    <Icon name="map-marker-radius" size={17} color="#2563EB" />
                  </View>
                  <Text style={styles.kpiNumber}>{hyperlocalKPIs.nearbyTotal}</Text>
                  <Text style={styles.kpiLabel}>NEARBY ORDERS</Text>
                </View>

                {/* Box 2: Awaiting Rider */}
                <View style={styles.kpiCard}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Icon name="motorbike-off" size={17} color="#D97706" />
                  </View>
                  <Text style={[styles.kpiNumber, { color: '#D97706' }]}>
                    {hyperlocalKPIs.awaitingRider}
                  </Text>
                  <Text style={styles.kpiLabel}>AWAITING RIDER</Text>
                </View>

                {/* Box 3: Riders on Route */}
                <View style={styles.kpiCard}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
                    <Icon name="motorbike" size={17} color="#059669" />
                  </View>
                  <Text style={[styles.kpiNumber, { color: '#059669' }]}>
                    {hyperlocalKPIs.ridersOnRoute}
                  </Text>
                  <Text style={styles.kpiLabel}>RIDERS ON ROUTE</Text>
                </View>

                {/* Box 4: Delivered Today */}
                <View style={styles.kpiCard}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: '#F5F3FF' }]}>
                    <Icon name="check-all" size={17} color="#7C3AED" />
                  </View>
                  <Text style={[styles.kpiNumber, { color: '#7C3AED' }]}>
                    {hyperlocalKPIs.deliveredToday}
                  </Text>
                  <Text style={styles.kpiLabel}>DELIVERED TODAY</Text>
                </View>
              </View>

              <View style={styles.sectionHeadingWrap}>
                <Text style={styles.sectionHeading}>Nearby Express Orders Queue</Text>
                <Text style={styles.sectionSubheading}>
                  Prioritize packaging for 30-min express transit
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyStateWrap}>
              <Icon name="navigation-variant-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Nearby Orders in Queue</Text>
              <Text style={styles.emptyStateSubtitle}>
                Hyperlocal orders within 10 km will appear here immediately for same-day fleet pickup.
              </Text>
            </View>
          }
        />
      ) : (
        /* Standard Orders View */
        <FlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderStandardOrderCard}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyStateWrap}>
              <Icon name="package-variant-closed" size={44} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Orders Matching Selection</Text>
              <Text style={styles.emptyStateSubtitle}>
                No orders match your filter criteria. Try choosing another tab or clearing search text.
              </Text>
            </View>
          }
        />
      )}

      {/* 6. Order Details Interactive Modal */}
      {selectedOrderForModal && (
        <Modal
          visible={Boolean(selectedOrderForModal)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedOrderForModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Bottom Sheet Top Handle Bar */}
              <View style={styles.sheetHandleBar} />

              {/* Modal Top Header */}
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalHeaderTitle}>Order Details & Actions</Text>
                  <View style={styles.modalOrderRefRow}>
                    <TouchableOpacity
                      style={styles.modalOrderIdPill}
                      onPress={() => handleCopyOrderId(selectedOrderForModal.orderNumber)}
                      activeOpacity={0.7}
                    >
                      <Icon name="pound" size={12} color="#2563EB" style={{ marginRight: 2 }} />
                      <Text style={styles.modalOrderIdText}>{selectedOrderForModal.orderNumber}</Text>
                      <Icon
                        name={copiedOrderId === selectedOrderForModal.orderNumber ? 'check' : 'content-copy'}
                        size={12}
                        color="#2563EB"
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>
                    <Text style={styles.modalPlacedTimeText}>• {selectedOrderForModal.placedAt}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedOrderForModal(null)}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScrollBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Status Indicator Banner */}
                <View style={styles.modalStatusBanner}>
                  <Text style={styles.modalStatusBannerLabel}>Current Dispatch Stage:</Text>
                  {renderStatusPill(selectedOrderForModal.status)}
                </View>

                {/* Product Summary */}
                <View style={styles.modalProductCard}>
                  <Image
                    source={{ uri: selectedOrderForModal.productImage }}
                    style={styles.modalProductImage}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalProductTitle} numberOfLines={2}>
                      {selectedOrderForModal.productTitle}
                    </Text>
                    <Text style={styles.modalProductSpecs}>
                      Fabric: {selectedOrderForModal.fabric}
                    </Text>
                    <Text style={styles.modalProductSpecs}>
                      Size: {selectedOrderForModal.size} • Qty: {selectedOrderForModal.qty}
                    </Text>
                    <Text style={styles.modalProductPrice}>
                      ₹{selectedOrderForModal.price.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Customer & Address Details */}
                <View style={styles.modalSectionBox}>
                  <Text style={styles.modalSectionTitle}>Delivery Destination</Text>
                  <View style={styles.modalInfoRow}>
                    <Icon name="account" size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.modalInfoText}>{selectedOrderForModal.customerName}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Icon name="map-marker" size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.modalInfoText}>{selectedOrderForModal.customerCity}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Icon name="shield-lock-outline" size={16} color="#059669" style={{ marginRight: 8 }} />
                    <Text style={[styles.modalInfoText, { color: '#059669', fontWeight: '700' }]}>
                      Buyer Contact Protected 🔒
                    </Text>
                  </View>
                </View>

                {/* Financial Settlement Breakdown */}
                <View style={styles.modalSectionBox}>
                  <Text style={styles.modalSectionTitle}>Financial & Settlement Breakdown</Text>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Product Listing Price</Text>
                    <Text style={styles.breakdownValue}>
                      ₹{selectedOrderForModal.price.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Promotional Discount</Text>
                    <Text style={[styles.breakdownValue, { color: '#059669' }]}>
                      -₹{selectedOrderForModal.discount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Courier Delivery Surcharge</Text>
                    <Text style={styles.breakdownValue}>+₹59</Text>
                  </View>
                  <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                    <Text style={styles.breakdownTotalLabel}>Net Seller Payout</Text>
                    <Text style={styles.breakdownTotalValue}>
                      ₹{selectedOrderForModal.totalSettlement.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Logistics AWB Tracking Simulation */}
                <View style={styles.modalSectionBox}>
                  <Text style={styles.modalSectionTitle}>Logistics & AWB Manifest</Text>
                  <View style={styles.awbBadgeWrap}>
                    <Icon name="barcode-scan" size={20} color="#0F172A" style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.awbCodeText}>
                        AWB-MIT-{selectedOrderForModal.id.replace('ord_', '884920')}
                      </Text>
                      <Text style={styles.awbCarrierText}>
                        {selectedOrderForModal.fulfillmentType === 'hyperlocal'
                          ? 'Mitreno Intra-City Hyperlocal Express'
                          : 'Delhivery Surface & Air Express'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Bottom Actions */}
              <View style={styles.modalFooterRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => {
                    handleDownloadSlip(selectedOrderForModal);
                    setSelectedOrderForModal(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="download" size={16} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSecondaryBtnText}>Download Slip</Text>
                </TouchableOpacity>

                {selectedOrderForModal.status !== 'delivered' && (
                  <TouchableOpacity
                    style={[
                      styles.modalPrimaryBtn,
                      selectedOrderForModal.status === 'shipped' && { backgroundColor: '#059669' },
                      selectedOrderForModal.status === 'packaging' && { backgroundColor: '#2563EB' },
                      selectedOrderForModal.status === 'new' && { backgroundColor: '#047857' },
                    ]}
                    onPress={() => {
                      const order = selectedOrderForModal;
                      setSelectedOrderForModal(null);
                      handleRequestAdvanceOrderStatus(order);
                    }}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name={
                        selectedOrderForModal.status === 'new'
                          ? 'check-circle'
                          : selectedOrderForModal.status === 'packaging'
                          ? 'truck-fast'
                          : 'check-circle-outline'
                      }
                      size={16}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.modalPrimaryBtnText}>
                      {selectedOrderForModal.status === 'new'
                        ? 'Accept Order'
                        : selectedOrderForModal.status === 'packaging'
                        ? 'Dispatch'
                        : 'Mark Delivered'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 7. Bulk Print Manifest Modal */}
      <Modal
        visible={bulkPrintModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setBulkPrintModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '60%' }]}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeaderTitle}>Bulk Manifest Printer</Text>
                <Text style={styles.modalHeaderSub}>
                  Generating shipping labels for {printableOrdersCount} printable orders
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setBulkPrintModalVisible(false)}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.bulkModalBody}>
              <View style={styles.printerIconCircle}>
                <Icon name="printer-check" size={32} color="#059669" />
              </View>
              <Text style={styles.bulkModalHeading}>Ready for Batch Printing</Text>
              <Text style={styles.bulkModalText}>
                All packing slips include customer addresses, verified item SKUs, and official
                Mitreno tamper-proof QR security seals.
              </Text>
            </View>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setBulkPrintModalVisible(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleConfirmBulkPrint}
              >
                <Icon name="printer" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalPrimaryBtnText}>Print All ({printableOrdersCount})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Compact Status Confirmation Modal ("Halka Sa Popup") */}
      <Modal
        visible={confirmDialog.visible}
        animationType="fade"
        transparent
        onRequestClose={handleCancelConfirm}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalCard}>
            <View style={styles.confirmHeaderRow}>
              <View
                style={[
                  styles.confirmIconWrap,
                  { backgroundColor: `${confirmDialog.actionColor}15` },
                ]}
              >
                <Icon
                  name={confirmDialog.icon}
                  size={20}
                  color={confirmDialog.actionColor}
                />
              </View>
              <View style={styles.confirmTitleWrap}>
                <Text style={styles.confirmTitleText}>{confirmDialog.title}</Text>
                <Text style={styles.confirmSubText}>
                  Order #{confirmDialog.order?.orderNumber}
                </Text>
              </View>
            </View>

            <Text style={styles.confirmMessageText}>{confirmDialog.message}</Text>

            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={handleCancelConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmActionBtn,
                  { backgroundColor: confirmDialog.actionColor },
                ]}
                onPress={handleExecuteConfirm}
                activeOpacity={0.85}
              >
                <Icon name="check" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.confirmActionBtnText}>{confirmDialog.actionLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* 1. Header Styles */
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  liveOrdersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 20,
  },
  headerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  liveOrdersPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  bulkPrintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    marginLeft: 8,
  },
  bulkPrintButtonText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  /* 2. Toggle Switcher (2 Distinct Separated Cards) */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  toggleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleCardActiveStandard: {
    backgroundColor: '#3B111A',
    borderColor: '#4A1521',
  },
  toggleCardActiveNearby: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  toggleCardInactive: {
    backgroundColor: '#FAF6F0',
    borderColor: '#E7DFD5',
  },
  toggleCardText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  toggleCardTextActive: {
    color: '#FFFFFF',
  },
  toggleCardTextInactive: {
    color: '#475569',
  },

  /* 3. Filter Tabs Row */
  filterScrollWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  filterTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FAF6F0',
    borderWidth: 1.2,
    borderColor: '#EFE8DE',
  },
  filterChipActive: {
    backgroundColor: '#3B111A',
    borderColor: '#3B111A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* List Container */
  listContentContainer: {
    paddingTop: 12,
    paddingBottom: 30,
  },

  /* Standard Order Card */
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  hyperlocalCardBorder: {
    borderColor: '#A7F3D0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  cardCustomerTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardCustomerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardTimeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 4,
  },
  cardTopRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threeDotButton: {
    padding: 3,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  orderIdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  orderIdText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  orderPlacedTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderPlacedTimeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Status Pills */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusNewBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusNewText: {
    color: '#059669',
  },
  statusPackagingBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statusPackagingText: {
    color: '#1D4ED8',
  },
  statusShippedBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusShippedText: {
    color: '#047857',
  },
  statusDeliveredBadge: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  statusDeliveredText: {
    color: '#15803D',
  },
  statusReturnedBadge: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  statusReturnedText: {
    color: '#BE123C',
  },
  statusCancelledBadge: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusCancelledText: {
    color: '#64748B',
  },

  /* Customer Subrow */
  customerSubrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  customerNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  customerDotSeparator: {
    marginHorizontal: 6,
    color: '#94A3B8',
    fontSize: 10,
  },
  customerCityText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Product Row */
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 10,
  },
  productThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  productDetailsCol: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },
  attributeTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  attributeTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  unitPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  courierTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  courierTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },

  /* Settlement Row */
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  settlementLeftCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  settlementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  settlementAmount: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  discountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  /* Action Buttons Row */
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 2,
  },
  cardSlipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  cardSlipBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  nextStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  acceptOrderActionBtn: {
    backgroundColor: '#047857',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  packagingActionBtn: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  shippedActionBtn: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveredActionBtn: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  completedStateBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  nextStatusBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  completedStateBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },

  /* Hyperlocal Card Specifics */
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#047857',
  },
  hyperlocalDestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  destPinWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  destCustomerName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#064E3B',
  },
  destAddressText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '500',
    marginTop: 1,
  },
  estimatedTransitPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  estimatedTransitText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  hyperlocalDiscountNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  riderSectionContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  awaitingRiderBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  awaitingRiderAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  awaitingRiderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  assignRiderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 9,
  },
  assignRiderButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assignedRiderBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  riderIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riderAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderNameText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  riderStatusSubtext: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 1,
  },
  handoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 9,
  },
  handoverButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  markDeliveredByRiderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 9,
  },
  deliveredByRiderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    borderRadius: 8,
  },
  deliveredByRiderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },

  /* Hyperlocal Header & KPIs */
  hyperlocalHeaderWrap: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  hyperlocalBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  bannerTopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bannerTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  sameDayPill: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sameDayPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: 0.4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 10,
  },
  bannerFleetStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  bannerFleetStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* KPI Grid */
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sectionHeadingWrap: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubheading: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* Empty State */
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  /* Order Details Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalOrderRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalOrderIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalOrderIdText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  modalPlacedTimeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 6,
  },
  modalHeaderSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  modalStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalStatusBannerLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  modalProductCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalProductImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  modalProductTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  modalProductSpecs: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalProductPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
  },
  modalSectionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalInfoText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  breakdownTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 6,
  },
  breakdownTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  breakdownTotalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  awbBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  awbCodeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  awbCarrierText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  modalSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#16A34A',
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Bulk Manifest Modal */
  bulkModalBody: {
    padding: 24,
    alignItems: 'center',
  },
  printerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  bulkModalHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  bulkModalText: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Compact Confirmation Modal Styles ("Halka Sa Popup") */
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmModalCard: {
    width: 320,
    maxWidth: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  confirmHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  confirmTitleWrap: {
    flex: 1,
  },
  confirmTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  confirmSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  confirmMessageText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 18,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmActionBtn: {
    flex: 1.3,
    height: 42,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  confirmActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
