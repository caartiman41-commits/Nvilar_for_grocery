import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudioProduct } from '../studioTypes';
import { useSellerStore } from '../../sellerStore';
import { showToast } from '../../../../components/MitrenoToast';
import { AddProductModal } from '../components/AddProductModal';

export type CatalogStatusFilter = 'all' | 'in_stock' | 'out_of_stock';

export const StudioCatalogTab: React.FC = memo(() => {
  const insets = useSafeAreaInsets();
  const products = useSellerStore((state) => state.products);
  const toggleStockStatus = useSellerStore((state) => state.toggleStockStatus);
  const toggleBoostProduct = useSellerStore((state) => state.toggleBoostProduct);
  const toggleFlashDropProduct = useSellerStore((state) => state.toggleFlashDropProduct);
  const deleteProduct = useSellerStore((state) => state.deleteProduct);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CatalogStatusFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState<StudioProduct | null>(null);
  const [selectedProductForActions, setSelectedProductForActions] = useState<StudioProduct | null>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<StudioProduct | null>(null);

  // Compute counts
  const inStockCount = useMemo(
    () => products.filter((p) => p.inStock).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => !p.inStock).length,
    [products]
  );

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Status Filter
      if (statusFilter === 'in_stock' && !p.inStock) return false;
      if (statusFilter === 'out_of_stock' && p.inStock) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchFabric = p.fabric.toLowerCase().includes(query);
        const matchFit = p.fit.toLowerCase().includes(query);
        const matchGsm = p.gsm.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        return matchTitle || matchFabric || matchFit || matchGsm || matchCategory;
      }

      return true;
    });
  }, [products, statusFilter, searchQuery]);

  // Action handlers
  const handleOpenAddModal = useCallback(() => {
    setProductToEdit(null);
    setModalVisible(true);
  }, []);

  const handleOpenEditModal = useCallback((item: StudioProduct) => {
    setProductToEdit(item);
    setModalVisible(true);
  }, []);

  const handleToggleStock = useCallback(
    (productId: string, title: string, currentlyInStock: boolean) => {
      toggleStockStatus(productId);
      showToast({
        type: currentlyInStock ? 'warning' : 'success',
        title: currentlyInStock ? 'Marked Out of Stock' : 'Marked In Stock',
        message: currentlyInStock
          ? `"${title}" is now marked Out of Stock. Buyers cannot purchase.`
          : `"${title}" is now marked In Stock and live for buyer orders!`,
      });
    },
    [toggleStockStatus]
  );

  const handleToggleBoost = useCallback(
    (productId: string, title: string, isBoosted?: boolean) => {
      if (toggleBoostProduct) {
        toggleBoostProduct(productId);
      }
      showToast({
        type: isBoosted ? 'info' : 'success',
        title: isBoosted ? 'Boost Deactivated' : '⚡ 5x Algorithmic Boost Active',
        message: isBoosted
          ? `Standard feed visibility restored for "${title}".`
          : `"${title}" prioritized in top city fashion radar & explore page.`,
      });
    },
    [toggleBoostProduct]
  );

  const handleToggleFlashDrop = useCallback(
    (productId: string, title: string, isFlashDrop?: boolean) => {
      if (toggleFlashDropProduct) {
        toggleFlashDropProduct(productId);
      }
      showToast({
        type: isFlashDrop ? 'info' : 'warning',
        title: isFlashDrop ? 'Flash Drop Deactivated' : '🔥 Flash Drop Activated',
        message: isFlashDrop
          ? `Flash drop badge removed for "${title}".`
          : `"${title}" featured with 24-Hour urgent tag on buyer app!`,
      });
    },
    [toggleFlashDropProduct]
  );

  const handleDelete = useCallback(
    (productId: string, title: string) => {
      Alert.alert(
        'Delete Garment',
        `Are you sure you want to remove "${title}" from your catalog? This action cannot be reversed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Garment',
            style: 'destructive',
            onPress: () => {
              deleteProduct(productId);
              showToast({
                type: 'info',
                title: 'Garment Removed',
                message: `"${title}" removed from catalog.`,
              });
            },
          },
        ]
      );
    },
    [deleteProduct]
  );

  // Render Garment Card (Minimalist Luxury Layout - tap opens Full Details)
  const renderGarmentCard = useCallback(
    ({ item }: { item: StudioProduct }) => {
      return (
        <TouchableOpacity
          style={styles.horizontalCard}
          onPress={() => setSelectedProductForDetails(item)}
          activeOpacity={0.88}
        >
          {/* Left: Fixed Square Garment Photo (84x84) */}
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: item.imageUri }}
              style={styles.garmentPhoto}
              resizeMode="cover"
            />

            {/* Discount Badge on Image */}
            {item.discountPercent > 0 && (
              <View style={styles.photoDiscountBadge}>
                <Text style={styles.photoDiscountBadgeText}>
                  {item.discountPercent}% OFF
                </Text>
              </View>
            )}

            {/* Micro indicators for Boost / Flash */}
            {(item.isBoosted || item.isFlashDrop) && (
              <View style={styles.photoMicroBadges}>
                {item.isBoosted && (
                  <View style={[styles.microBadge, { backgroundColor: '#D97706' }]}>
                    <Icon name="lightning-bolt" size={10} color="#FFFFFF" />
                  </View>
                )}
                {item.isFlashDrop && (
                  <View style={[styles.microBadge, { backgroundColor: '#DC2626' }]}>
                    <Icon name="fire" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Right: Clean Details & Actions */}
          <View style={styles.detailsContainer}>
            {/* Row 1: Title (Truncated with ellipsis) */}
            <Text style={styles.garmentTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>

            {/* Row 2: Price */}
            <View style={styles.priceWrap}>
              <Text style={styles.currentPrice}>
                ₹{item.price.toLocaleString('en-IN')}
              </Text>
              {item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>
                  ₹{item.originalPrice.toLocaleString('en-IN')}
                </Text>
              )}
            </View>

            {/* Row 3: Action Buttons (In-Stock Pill + Edit Icon + 3-Dot) */}
            <View style={styles.actionsWrap}>
              {/* In-Stock Status Toggle Pill */}
              <TouchableOpacity
                style={[
                  styles.stockTogglePill,
                  item.inStock ? styles.stockPillIn : styles.stockPillOut,
                ]}
                onPress={() => handleToggleStock(item.id, item.title, item.inStock)}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <View
                  style={[
                    styles.stockDot,
                    { backgroundColor: item.inStock ? '#059669' : '#DC2626' },
                  ]}
                />
                <Text
                  style={[
                    styles.stockPillText,
                    { color: item.inStock ? '#047857' : '#B91C1C' },
                  ]}
                >
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </Text>
              </TouchableOpacity>

              {/* Edit Icon Button (Square compact) */}
              <TouchableOpacity
                style={styles.cardEditIconBtn}
                onPress={() => handleOpenEditModal(item)}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Icon name="pencil" size={14} color="#2563EB" />
              </TouchableOpacity>

              {/* 3-Dot Button */}
              <TouchableOpacity
                style={styles.cardThreeDotBtn}
                onPress={() => setSelectedProductForActions(item)}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Icon name="dots-vertical" size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleToggleStock, handleOpenEditModal]
  );

  return (
    <View style={styles.container}>
      {/* Top Header with Safe Area Inset Protection (Clean without button) */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Store Catalog</Text>
          <View style={styles.garmentCountPill}>
            <View style={styles.activeGreenDot} />
            <Text style={styles.garmentCountPillText}>
              {products.length} Items Listed
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search piece, fabric, tag..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter Pills Row */}
      <View style={styles.statusPillsRow}>
        <TouchableOpacity
          style={[
            styles.statusPill,
            statusFilter === 'all' && styles.statusPillActive,
          ]}
          onPress={() => setStatusFilter('all')}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.statusPillText,
              statusFilter === 'all' && styles.statusPillTextActive,
            ]}
          >
            All ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusPill,
            statusFilter === 'in_stock' && styles.statusPillActiveInStock,
          ]}
          onPress={() => setStatusFilter('in_stock')}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.statusDot,
              statusFilter === 'in_stock'
                ? styles.statusDotActiveWhite
                : styles.statusDotInStockGreen,
            ]}
          />
          <Text
            style={[
              styles.statusPillText,
              statusFilter === 'in_stock' && styles.statusPillTextActiveInStock,
            ]}
          >
            In Stock ({inStockCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusPill,
            statusFilter === 'out_of_stock' && styles.statusPillActiveOutOfStock,
          ]}
          onPress={() => setStatusFilter('out_of_stock')}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.statusDot,
              statusFilter === 'out_of_stock'
                ? styles.statusDotActiveWhite
                : styles.statusDotOutOfStockRed,
            ]}
          />
          <Text
            style={[
              styles.statusPillText,
              statusFilter === 'out_of_stock' && styles.statusPillTextActiveOutOfStock,
            ]}
          >
            Out of Stock ({outOfStockCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Primary Action Button: Upload Product (Right-aligned compact green button) */}
      <View style={styles.listCtaContainer}>
        <TouchableOpacity
          style={styles.listNewCtaBtn}
          onPress={handleOpenAddModal}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.listNewCtaText}>Upload Product</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        style={{ flex: 1 }}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderGarmentCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Icon name="tshirt-crew-outline" size={36} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery || statusFilter !== 'all'
                ? 'No matching garments'
                : 'No garments in your catalog'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Publish your first luxury piece to start receiving buyer inquiries and instant orders.'}
            </Text>
            {searchQuery || statusFilter !== 'all' ? (
              <TouchableOpacity
                style={styles.resetFiltersBtn}
                onPress={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                <Text style={styles.resetFiltersBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={handleOpenAddModal}
              >
                <Icon name="plus" size={16} color="#FFFFFF" style={styles.emptyAddBtnIcon} />
                <Text style={styles.emptyAddBtnText}>List First Garment</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* 3-Dot Product Actions Bottom Sheet (Sleek Luxury Design) */}
      {selectedProductForActions && (
        <Modal
          visible={Boolean(selectedProductForActions)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedProductForActions(null)}
        >
          <View style={styles.sheetOverlay}>
            <View style={styles.sheetCard}>
              <View style={styles.sheetHandleBar} />

              {/* Modal Header */}
              <View style={styles.sheetHeader}>
                <Image
                  source={{ uri: selectedProductForActions.imageUri }}
                  style={styles.sheetThumb}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.sheetTitleText} numberOfLines={1}>
                    {selectedProductForActions.title}
                  </Text>
                  <Text style={styles.sheetPriceText}>
                    ₹{selectedProductForActions.price.toLocaleString('en-IN')}{' '}
                    <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>
                      ({selectedProductForActions.inStock ? '● In Stock' : '○ Out of Stock'})
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={() => setSelectedProductForActions(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Sleek Action Rows in Single Grouped Menu */}
              <View style={styles.sheetGroupedMenu}>
                {/* 1. Boost Action */}
                <TouchableOpacity
                  style={styles.sheetRowItem}
                  onPress={() => {
                    handleToggleBoost(
                      selectedProductForActions.id,
                      selectedProductForActions.title,
                      selectedProductForActions.isBoosted
                    );
                    setSelectedProductForActions(null);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sheetRowIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Icon name="lightning-bolt" size={16} color="#D97706" />
                  </View>
                  <Text style={styles.sheetRowTitle}>
                    {selectedProductForActions.isBoosted ? 'Deactivate Boost' : 'Boost Garment (5x Radar)'}
                  </Text>
                  <View
                    style={[
                      styles.sheetStatusPill,
                      selectedProductForActions.isBoosted
                        ? styles.sheetStatusPillActive
                        : styles.sheetStatusPillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetStatusPillText,
                        selectedProductForActions.isBoosted
                          ? styles.sheetStatusPillTextActive
                          : styles.sheetStatusPillTextInactive,
                      ]}
                    >
                      {selectedProductForActions.isBoosted ? 'ACTIVE' : 'BOOST'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.sheetDivider} />

                {/* 2. Flash Drop Action */}
                <TouchableOpacity
                  style={styles.sheetRowItem}
                  onPress={() => {
                    handleToggleFlashDrop(
                      selectedProductForActions.id,
                      selectedProductForActions.title,
                      selectedProductForActions.isFlashDrop
                    );
                    setSelectedProductForActions(null);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sheetRowIcon, { backgroundColor: '#FEE2E2' }]}>
                    <Icon name="fire" size={16} color="#DC2626" />
                  </View>
                  <Text style={styles.sheetRowTitle}>
                    {selectedProductForActions.isFlashDrop
                      ? 'Remove Flash Deal'
                      : '24-Hour Flash Drop'}
                  </Text>
                  <View
                    style={[
                      styles.sheetStatusPill,
                      selectedProductForActions.isFlashDrop
                        ? styles.sheetStatusPillFlashActive
                        : styles.sheetStatusPillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetStatusPillText,
                        selectedProductForActions.isFlashDrop
                          ? styles.sheetStatusPillTextFlash
                          : styles.sheetStatusPillTextInactive,
                      ]}
                    >
                      {selectedProductForActions.isFlashDrop ? 'LIVE' : 'ACTIVATE'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.sheetDivider} />

                {/* 3. Edit Action */}
                <TouchableOpacity
                  style={styles.sheetRowItem}
                  onPress={() => {
                    const prod = selectedProductForActions;
                    setSelectedProductForActions(null);
                    handleOpenEditModal(prod);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sheetRowIcon, { backgroundColor: '#EFF6FF' }]}>
                    <Icon name="pencil" size={16} color="#2563EB" />
                  </View>
                  <Text style={styles.sheetRowTitle}>Edit Garment Details</Text>
                  <Icon name="chevron-right" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* 4. Delete Action (Clean, compact, separated) */}
              <TouchableOpacity
                style={styles.sheetDeleteItem}
                onPress={() => {
                  const prod = selectedProductForActions;
                  setSelectedProductForActions(null);
                  handleDelete(prod.id, prod.title);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetRowIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="trash-can-outline" size={16} color="#DC2626" />
                </View>
                <Text style={styles.sheetDeleteTitle}>Delete from Catalog</Text>
                <Icon name="chevron-right" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Product Details Sheet Modal (Opens when tapping on product card) */}
      {selectedProductForDetails && (
        <Modal
          visible={Boolean(selectedProductForDetails)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedProductForDetails(null)}
        >
          <View style={styles.sheetOverlay}>
            <View style={styles.detailsSheetCard}>
              <View style={styles.sheetHandleBar} />

              {/* Header */}
              <View style={styles.detailsSheetHeader}>
                <Text style={styles.detailsSheetTitle}>Wholesale Product Details</Text>
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={() => setSelectedProductForDetails(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.detailsSheetScrollContent}
              >
                {/* Product Image Banner */}
                <View style={styles.detailsImageWrap}>
                  <Image
                    source={{ uri: selectedProductForDetails.imageUri }}
                    style={styles.detailsImage}
                    resizeMode="cover"
                  />
                  {selectedProductForDetails.discountPercent > 0 && (
                    <View style={styles.detailsDiscountBadge}>
                      <Text style={styles.detailsDiscountText}>
                        {selectedProductForDetails.discountPercent}% OFF
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.detailsStockBadge,
                      selectedProductForDetails.inStock
                        ? styles.stockPillIn
                        : styles.stockPillOut,
                    ]}
                  >
                    <View
                      style={[
                        styles.stockDot,
                        {
                          backgroundColor: selectedProductForDetails.inStock
                            ? '#059669'
                            : '#DC2626',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.stockPillText,
                        {
                          color: selectedProductForDetails.inStock
                            ? '#047857'
                            : '#B91C1C',
                        },
                      ]}
                    >
                      {selectedProductForDetails.inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                  </View>
                </View>

                {/* Title & Category */}
                <View style={styles.detailsInfoSection}>
                  <Text style={styles.detailsCategoryText}>
                    {selectedProductForDetails.category.toUpperCase()}
                  </Text>
                  <Text style={styles.detailsTitleText}>
                    {selectedProductForDetails.title}
                  </Text>

                  {/* Price Row */}
                  <View style={styles.detailsPriceRow}>
                    <Text style={styles.detailsPriceText}>
                      ₹{selectedProductForDetails.price.toLocaleString('en-IN')}
                    </Text>
                    {selectedProductForDetails.originalPrice > selectedProductForDetails.price && (
                      <>
                        <Text style={styles.detailsOriginalPriceText}>
                          ₹{selectedProductForDetails.originalPrice.toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.detailsSavingsText}>
                          (Save ₹{(selectedProductForDetails.originalPrice - selectedProductForDetails.price).toLocaleString('en-IN')})
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Specifications Grid */}
                <View style={styles.detailsSectionBox}>
                  <Text style={styles.detailsSectionHeading}>
                    {selectedProductForDetails.vertical === 'fashion'
                      ? 'FABRIC & FIT SPECIFICATIONS'
                      : 'WHOLESALE B2B SPECIFICATIONS'}
                  </Text>
                  <View style={styles.specsChipsGrid}>
                    <View style={styles.specChipItem}>
                      <Text style={styles.specChipLabel}>
                        {selectedProductForDetails.vertical === 'fashion' ? 'FABRIC' : 'GRADE / SPEC'}
                      </Text>
                      <Text style={styles.specChipValue}>{selectedProductForDetails.fabric}</Text>
                    </View>
                    <View style={styles.specChipItem}>
                      <Text style={styles.specChipLabel}>
                        {selectedProductForDetails.vertical === 'fashion'
                          ? 'WEIGHT / GSM'
                          : 'WARRANTY / SHELF LIFE'}
                      </Text>
                      <Text style={styles.specChipValue}>{selectedProductForDetails.gsm}</Text>
                    </View>
                    <View style={styles.specChipItem}>
                      <Text style={styles.specChipLabel}>
                        {selectedProductForDetails.vertical === 'fashion'
                          ? 'SILHOUETTE'
                          : 'PACK UNIT'}
                      </Text>
                      <Text style={styles.specChipValue}>
                        {selectedProductForDetails.unitSpec ||
                          selectedProductForDetails.setRatio ||
                          selectedProductForDetails.fit}
                      </Text>
                    </View>
                    <View style={styles.specChipItem}>
                      <Text style={styles.specChipLabel}>TOTAL SOLD</Text>
                      <Text style={styles.specChipValue}>{selectedProductForDetails.totalSold} Units</Text>
                    </View>
                  </View>
                </View>

                {/* Size / Wholesale Stock Breakdown */}
                <View style={styles.detailsSectionBox}>
                  <Text style={styles.detailsSectionHeading}>
                    {selectedProductForDetails.vertical === 'fashion'
                      ? 'SIZE & INVENTORY STOCK'
                      : 'AVAILABLE WHOLESALE STOCK'}
                  </Text>
                  {selectedProductForDetails.vertical === 'fashion' ? (
                    <View style={styles.sizeStockGrid}>
                      {selectedProductForDetails.sizes.map((s) => (
                        <View
                          key={s.size}
                          style={[
                            styles.detailSizePill,
                            s.stock === 0 && styles.detailSizePillZero,
                          ]}
                        >
                          <Text
                            style={[
                              styles.detailSizePillText,
                              s.stock === 0 && styles.detailSizePillTextZero,
                            ]}
                          >
                            {s.size}: <Text style={{ fontWeight: '800' }}>{s.stock} pcs</Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.sizeStockGrid}>
                      <View style={styles.detailSizePill}>
                        <Text style={styles.detailSizePillText}>
                          {selectedProductForDetails.unitSpec ||
                            selectedProductForDetails.setRatio ||
                            'Wholesale Lot'}
                          :{' '}
                          <Text style={{ fontWeight: '800' }}>
                            {selectedProductForDetails.sizes.reduce((acc, s) => acc + s.stock, 0)} units in stock
                          </Text>
                        </Text>
                      </View>
                      <View style={styles.detailSizePill}>
                        <Text style={styles.detailSizePillText}>
                          MOQ:{' '}
                          <Text style={{ fontWeight: '800' }}>
                            Min {selectedProductForDetails.minOrder || 4} units
                          </Text>
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.detailsActionButtonsRow}>
                  <TouchableOpacity
                    style={styles.detailsEditBtn}
                    onPress={() => {
                      const prod = selectedProductForDetails;
                      setSelectedProductForDetails(null);
                      handleOpenEditModal(prod);
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon name="pencil" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.detailsEditBtnText}>Edit Product</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.detailsToggleStockBtn,
                      selectedProductForDetails.inStock
                        ? styles.detailsToggleStockOut
                        : styles.detailsToggleStockIn,
                    ]}
                    onPress={() => {
                      handleToggleStock(
                        selectedProductForDetails.id,
                        selectedProductForDetails.title,
                        selectedProductForDetails.inStock
                      );
                      setSelectedProductForDetails((prev) =>
                        prev ? { ...prev, inStock: !prev.inStock } : null
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={selectedProductForDetails.inStock ? 'close-circle-outline' : 'check-circle-outline'}
                      size={16}
                      color={selectedProductForDetails.inStock ? '#DC2626' : '#059669'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.detailsToggleStockText,
                        {
                          color: selectedProductForDetails.inStock ? '#DC2626' : '#059669',
                        },
                      ]}
                    >
                      {selectedProductForDetails.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit Product Modal */}
      <AddProductModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  garmentCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  garmentCountPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
  },
  listNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnIconMargin: {
    marginRight: 4,
  },
  listNewBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  clearSearchBtn: {
    padding: 4,
  },
  statusPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FAF6F0',
    borderWidth: 1.2,
    borderColor: '#EFE8DE',
  },
  statusPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  statusPillActiveInStock: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  statusPillActiveOutOfStock: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusDotActiveWhite: {
    backgroundColor: '#FFFFFF',
  },
  statusDotInStockGreen: {
    backgroundColor: '#059669',
  },
  statusDotOutOfStockRed: {
    backgroundColor: '#DC2626',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  statusPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statusPillTextActiveInStock: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statusPillTextActiveOutOfStock: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* Shifted List Garment CTA Button */
  listCtaContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  listNewCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#047857',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2.5,
  },
  listNewCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* List Content */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 110,
  },

  /* Minimalist Luxury Product Card (~94px) */
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1.5,
  },
  photoContainer: {
    width: 82,
    height: 82,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  garmentPhoto: {
    width: 82,
    height: 82,
  },
  photoDiscountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoDiscountBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  photoMicroBadges: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    gap: 3,
  },
  microBadge: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Details Container */
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    height: 82,
    justifyContent: 'space-between',
  },
  garmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  actionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  stockPillIn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  stockPillOut: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  stockPillText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  cardEditIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardThreeDotBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 3-Dot Bottom Sheet Modal (Apple/Luxury Style) */
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 18,
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  sheetTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sheetPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sheetGroupedMenu: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
    overflow: 'hidden',
  },
  sheetRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  sheetRowIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  sheetDeleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginTop: 10,
  },
  sheetDeleteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  sheetStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  sheetStatusPillActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sheetStatusPillFlashActive: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  sheetStatusPillInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sheetStatusPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  sheetStatusPillTextActive: {
    color: '#B45309',
  },
  sheetStatusPillTextFlash: {
    color: '#DC2626',
  },
  sheetStatusPillTextInactive: {
    color: '#64748B',
  },

  /* Product Details Sheet Modal */
  detailsSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  detailsSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailsSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailsSheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  detailsImageWrap: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    marginBottom: 14,
  },
  detailsImage: {
    width: '100%',
    height: '100%',
  },
  detailsDiscountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailsDiscountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  detailsStockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  detailsInfoSection: {
    marginBottom: 14,
  },
  detailsCategoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailsTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 8,
  },
  detailsPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  detailsPriceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  detailsOriginalPriceText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  detailsSavingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  detailsSectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  detailsSectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  specsChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specChipItem: {
    flexBasis: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  specChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  specChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  sizeStockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailSizePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  detailSizePillZero: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  detailSizePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  detailSizePillTextZero: {
    color: '#94A3B8',
  },
  detailsActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  detailsEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    height: 44,
    borderRadius: 10,
  },
  detailsEditBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsToggleStockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
  },
  detailsToggleStockIn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  detailsToggleStockOut: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
  detailsToggleStockText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
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
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  resetFiltersBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetFiltersBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyAddBtnIcon: {
    marginRight: 6,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
