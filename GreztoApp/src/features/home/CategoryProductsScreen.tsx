import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProductCard } from '../../components/ProductCard';
import { FloatingCartSummary } from '../../components/FloatingCartSummary';
import { useCartStore } from '../cart/cartStore';
import { useSellerStore } from '../seller/sellerStore';
import {
  WHOLESALE_CATALOG_PRODUCTS,
  WHOLESALE_VERTICAL_DEFINITIONS,
  findCategoryTileById,
  detectWholesaleTaxonomy,
  recordCategoryDwellInterest,
  recordUserSearchInterest,
  recordProductViewInterest,
  WholesaleCatalogItem,
  WholesaleVerticalId,
} from './data/wholesaleHubData';
import { BoutiqueProductItem } from './HomeScreen';

export const CategoryProductsScreen = memo(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const initialSubcategoryId: string = route.params?.subcategoryId || 'sub_fans_coolers';
  const initialVertical: WholesaleVerticalId | undefined = route.params?.vertical;

  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string>(initialSubcategoryId);
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'margin'>('recommended');

  // Cart Store Atomic Selectors
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);

  // Seller Studio Live Products (for real-time Seller -> Buyer sync)
  const sellerProducts = useSellerStore((s) => s.products);
  const sellerProfile = useSellerStore((s) => s.profile);

  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const it of cartItems) {
      map[it.id] = (map[it.id] || 0) + it.quantity;
    }
    return map;
  }, [cartItems]);

  const totalCartItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  // Resolve current category tile & vertical metadata
  const categoryMeta = useMemo(() => {
    const found = findCategoryTileById(activeSubcategoryId);
    if (found) return found;
    const fallbackVert = WHOLESALE_VERTICAL_DEFINITIONS.find(
      (v) => v.id === (initialVertical || 'electronics')
    ) || WHOLESALE_VERTICAL_DEFINITIONS[0];
    return {
      vertical: fallbackVert.id,
      sectionTitle: fallbackVert.label,
      tile: fallbackVert.categories[0],
    };
  }, [activeSubcategoryId, initialVertical]);

  const verticalDef = useMemo(
    () =>
      WHOLESALE_VERTICAL_DEFINITIONS.find((v) => v.id === categoryMeta.vertical) ||
      WHOLESALE_VERTICAL_DEFINITIONS[0],
    [categoryMeta.vertical]
  );

  const cleanCategoryTitle = useMemo(
    () => categoryMeta.tile.title.replace(/\n/g, ' '),
    [categoryMeta.tile.title]
  );

  const subTypes = useMemo(
    () => categoryMeta.tile.subTypes || [],
    [categoryMeta.tile.subTypes]
  );

  // Convert Seller Studio products into WholesaleCatalogItem with automatic taxonomy matching
  const syncedSellerCatalogItems = useMemo<WholesaleCatalogItem[]>(() => {
    return sellerProducts.map((sp) => {
      const detected = detectWholesaleTaxonomy(`${sp.title} ${sp.category || ''}`);
      const vertical: WholesaleVerticalId =
        sp.vertical || detected?.vertical || 'fashion';
      const subcategoryId =
        sp.subcategoryId || detected?.subcategoryId || 'sub_fashion_streetwear';
      const subTypeId = sp.subTypeId || detected?.subTypeId || 'all';
      const orig = sp.originalPrice > sp.price ? sp.originalPrice : Math.round(sp.price * 1.35);
      const disc = Math.round(((orig - sp.price) / orig) * 100);

      return {
        id: sp.id,
        shopId: sellerProfile?.storeId || '',
        vertical,
        subcategoryId,
        subTypeId,
        name: sp.title,
        price: sp.price,
        originalPrice: orig,
        image: sp.imageUri,
        boutiqueName: sellerProfile?.name || 'Verified Wholesale Hub',
        rating: sellerProfile?.rating || 4.9,
        discountBadge: `${disc > 0 ? disc : 25}% OFF`,
        minOrder: sp.minOrder || 4,
        inStock: sp.inStock,
        unitSpec: sp.unitSpec || sp.setRatio || detected?.suggestedUnit || 'Wholesale Pack',
      };
    });
  }, [sellerProducts, sellerProfile]);

  // Combined Catalog for this Category
  const categoryProducts = useMemo(() => {
    const allCombined: WholesaleCatalogItem[] = [
      ...syncedSellerCatalogItems,
      ...WHOLESALE_CATALOG_PRODUCTS,
    ];

    // Exact category matches
    const exactCategoryMatches = allCombined.filter(
      (p) => p.subcategoryId === activeSubcategoryId
    );

    // Other products in same vertical to keep the wholesale feed rich below
    const sameVerticalRest = allCombined.filter(
      (p) =>
        p.vertical === categoryMeta.vertical &&
        p.subcategoryId !== activeSubcategoryId
    );

    let list: WholesaleCatalogItem[] = [];
    if (selectedSubTypeId === 'all') {
      list = [...exactCategoryMatches, ...sameVerticalRest];
    } else {
      const activeSubTypeObj = subTypes.find((st) => st.id === selectedSubTypeId);
      const keywords = activeSubTypeObj?.keywords || [];

      const subTypeMatches = exactCategoryMatches.filter((p) => {
        if (p.subTypeId === selectedSubTypeId) return true;
        const lowerName = p.name.toLowerCase();
        return keywords.some((kw) => lowerName.includes(kw.toLowerCase()));
      });

      const otherInCategory = exactCategoryMatches.filter(
        (p) => !subTypeMatches.some((m) => m.id === p.id)
      );

      list = [...subTypeMatches, ...otherInCategory, ...sameVerticalRest];
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.boutiqueName.toLowerCase().includes(q) ||
          (p.unitSpec && p.unitSpec.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'margin') {
      return [...list].sort((a, b) => {
        const discA = (a.originalPrice - a.price) / (a.originalPrice || 1);
        const discB = (b.originalPrice - b.price) / (b.originalPrice || 1);
        return discB - discA;
      });
    }

    return list;
  }, [
    syncedSellerCatalogItems,
    activeSubcategoryId,
    categoryMeta.vertical,
    selectedSubTypeId,
    subTypes,
    searchQuery,
    sortBy,
  ]);

  const exactMatchCount = useMemo(() => {
    const allCombined = [...syncedSellerCatalogItems, ...WHOLESALE_CATALOG_PRODUCTS];
    return allCombined.filter((p) => p.subcategoryId === activeSubcategoryId).length;
  }, [syncedSellerCatalogItems, activeSubcategoryId]);

  const SIDE_PADDING = 8;
  const GAP = 8;
  const cardWidth = useMemo(
    () => Math.floor((width - SIDE_PADDING * 2 - GAP) / 2),
    [width]
  );

  // Auto-record user interest when opening or dwelling on this subcategory screen
  useEffect(() => {
    recordCategoryDwellInterest(categoryMeta.vertical, 4);
    const interval = setInterval(() => {
      recordCategoryDwellInterest(categoryMeta.vertical, 3);
    }, 3500);
    return () => clearInterval(interval);
  }, [categoryMeta.vertical, activeSubcategoryId]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      recordUserSearchInterest(searchQuery.trim());
    }
  }, [searchQuery]);

  // Handlers matching HomeScreen ProductCard contract
  const handleProductPress = useCallback(
    (item: BoutiqueProductItem) => {
      recordProductViewInterest({
        name: item.name,
        vertical: (item as any).vertical || categoryMeta.vertical,
        subcategoryId: (item as any).subcategoryId || activeSubcategoryId,
      });
      FastImage.preload([{ uri: item.image, priority: FastImage.priority.high }]);
      navigation.navigate('ProductDetails', { product: item, productId: item.id });
    },
    [navigation, categoryMeta.vertical, activeSubcategoryId]
  );

  const handleBoutiquePress = useCallback(
    (item: BoutiqueProductItem) => {
      navigation.navigate('BoutiqueStore', {
        shopId: item.shopId || '',
        shopName: item.boutiqueName,
      });
    },
    [navigation]
  );

  const handleBargain = useCallback(
    (product: BoutiqueProductItem) => {
      if (product.inStock === false) {
        Alert.alert(
          'Out of Stock',
          `"${product.name}" is currently out of stock and unavailable for bargaining.`
        );
        return;
      }
      navigation.navigate('ChatConversation', {
        product,
        attachedProduct: product,
        shopId: product.shopId || '',
        boutiqueName: product.boutiqueName,
        avatar: product.image,
      });
    },
    [navigation]
  );

  const handleAddToCart = useCallback(
    (product: WholesaleCatalogItem) => {
      if (product.inStock === false) {
        Alert.alert('Out of Stock', `"${product.name}" is currently out of stock.`);
        return;
      }
      const discount = product.originalPrice
        ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
        : 'WHOLESALE';
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        discountBadge: discount,
        unitLabel: product.unitSpec || `Pack of ${product.minOrder || 4} Pcs`,
      });
    },
    [addItem]
  );

  const handleIncrement = useCallback(
    (product: WholesaleCatalogItem) => {
      const currentQty = cartQuantities[product.id] || 0;
      if (currentQty === 0) {
        handleAddToCart(product);
      } else {
        updateQuantity(product.id, currentQty + 1);
      }
    },
    [cartQuantities, handleAddToCart, updateQuantity]
  );

  const handleDecrement = useCallback(
    (product: WholesaleCatalogItem) => {
      const currentQty = cartQuantities[product.id] || 0;
      if (currentQty <= 1) {
        removeItem(product.id);
      } else {
        updateQuantity(product.id, currentQty - 1);
      }
    },
    [cartQuantities, removeItem, updateQuantity]
  );

  const renderProductItem = useCallback(
    ({ item }: { item: WholesaleCatalogItem }) => {
      const isDirectCategoryMatch = item.subcategoryId === activeSubcategoryId;
      return (
        <View style={[styles.cardWrapper, { width: cardWidth }]}>
          {isDirectCategoryMatch && item.unitSpec ? (
            <View style={[styles.unitRibbon, { backgroundColor: verticalDef.accentColor }]}>
              <Icon name="package-variant-closed" size={11} color="#FFFFFF" />
              <Text style={styles.unitRibbonText} numberOfLines={1}>
                {item.unitSpec}
              </Text>
            </View>
          ) : null}
          <ProductCard
            id={item.id}
            name={item.name}
            price={item.price}
            originalPrice={item.originalPrice}
            image={item.image}
            boutiqueName={item.boutiqueName}
            rating={item.rating}
            minOrder={item.minOrder || 4}
            inStock={item.inStock ?? true}
            cartQuantity={cartQuantities[item.id] || 0}
            onBoutiquePress={() => handleBoutiquePress(item)}
            onPress={() => handleProductPress(item)}
            onBargain={() => handleBargain(item)}
            onBuy={() => handleAddToCart(item)}
            onAdd={() => handleAddToCart(item)}
            onIncrement={() => handleIncrement(item)}
            onDecrement={() => handleDecrement(item)}
          />
        </View>
      );
    },
    [
      activeSubcategoryId,
      cardWidth,
      verticalDef.accentColor,
      cartQuantities,
      handleBoutiquePress,
      handleProductPress,
      handleBargain,
      handleAddToCart,
      handleIncrement,
      handleDecrement,
    ]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        {/* Horizontal Sibling Category Quick Switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.siblingStripScroll}
        >
          {verticalDef.categories.map((cat) => {
            const isActive = cat.id === activeSubcategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.siblingChip,
                  isActive && {
                    backgroundColor: '#FFFFFF',
                    borderColor: verticalDef.accentColor,
                    borderWidth: 1.6,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveSubcategoryId(cat.id);
                  setSelectedSubTypeId('all');
                }}
              >
                <View style={styles.siblingIconBox}>
                  <Image
                    source={cat.icon}
                    style={styles.siblingIconImg}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  style={[
                    styles.siblingChipText,
                    isActive && { color: verticalDef.accentColor, fontWeight: '800' },
                  ]}
                  numberOfLines={1}
                >
                  {cat.title.replace(/\n/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Level-3 Sub-Category Pill Strip + Sort Controls */}
        <View style={styles.subTypeStripContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTypePillsScroll}
          >
            <TouchableOpacity
              style={[
                styles.subTypePill,
                selectedSubTypeId === 'all' && {
                  backgroundColor: '#0F172A',
                  borderColor: '#0F172A',
                },
              ]}
              activeOpacity={0.82}
              onPress={() => setSelectedSubTypeId('all')}
            >
              <Text
                style={[
                  styles.subTypePillText,
                  selectedSubTypeId === 'all' && styles.subTypePillTextActive,
                ]}
              >
                All {cleanCategoryTitle} ({exactMatchCount})
              </Text>
            </TouchableOpacity>

            {subTypes.map((st) => {
              const isSelected = selectedSubTypeId === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  style={[
                    styles.subTypePill,
                    isSelected && {
                      backgroundColor: verticalDef.accentColor,
                      borderColor: verticalDef.accentColor,
                    },
                  ]}
                  activeOpacity={0.82}
                  onPress={() =>
                    setSelectedSubTypeId(isSelected ? 'all' : st.id)
                  }
                >
                  <Text
                    style={[
                      styles.subTypePillText,
                      isSelected && styles.subTypePillTextActive,
                    ]}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Quick Sort Row */}
          <View style={styles.sortRow}>
            <View style={styles.sectionLabelGroup}>
              <Icon name="check-decagram" size={15} color={verticalDef.accentColor} />
              <Text style={styles.sectionLabelText}>
                WHOLESALE B2B LOTS • BARGAIN OR DIRECT ADD
              </Text>
            </View>

            <TouchableOpacity
              style={styles.sortToggleBtn}
              onPress={() =>
                setSortBy((prev) =>
                  prev === 'recommended'
                    ? 'price_asc'
                    : prev === 'price_asc'
                    ? 'margin'
                    : 'recommended'
                )
              }
            >
              <Icon name="sort-variant" size={14} color="#0F172A" />
              <Text style={styles.sortToggleText}>
                {sortBy === 'recommended'
                  ? 'Sort: Best'
                  : sortBy === 'price_asc'
                  ? 'Lowest Price'
                  : 'Highest Margin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [
      verticalDef,
      activeSubcategoryId,
      selectedSubTypeId,
      cleanCategoryTitle,
      exactMatchCount,
      subTypes,
      sortBy,
    ]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Navigation Bar */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Icon name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {cleanCategoryTitle}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {verticalDef.label} Mandi • {categoryProducts.length} Wholesale Items
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsSearchOpen((v) => !v)}
          activeOpacity={0.75}
        >
          <Icon
            name={isSearchOpen ? 'close' : 'magnify'}
            size={21}
            color="#0F172A"
          />
        </TouchableOpacity>
      </View>

      {/* Inline Search Filter Box */}
      {isSearchOpen && (
        <View style={styles.searchBarRow}>
          <Icon name="magnify" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${cleanCategoryTitle}...`}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={17} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Full-Width 2-Column Mitreno Product Grid */}
      <FlatList
        data={categoryProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={5}
        maxToRenderPerBatch={8}
        initialNumToRender={6}
        contentContainerStyle={styles.listContent}
      />

      {/* Bottom Floating Cart Summary Bar with Expandable Drawer */}
      {totalCartItems > 0 && (
        <FloatingCartSummary
          onPress={() => navigation.navigate('MainTabs', { screen: 'BagTab' })}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F6',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    marginLeft: 8,
    paddingVertical: 0,
  },
  headerBlock: {
    backgroundColor: '#FAF8F6',
    paddingTop: 8,
    paddingBottom: 6,
  },
  siblingStripScroll: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  siblingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  siblingIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 6,
  },
  siblingIconImg: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.15 }],
  },
  siblingChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    maxWidth: 120,
  },
  subTypeStripContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 6,
  },
  subTypePillsScroll: {
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  subTypePill: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  subTypePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  subTypePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  sectionLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionLabelText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginLeft: 5,
  },
  sortToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  cardWrapper: {
    marginBottom: 10,
    position: 'relative',
  },
  unitRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginLeft: 6,
    marginBottom: -2,
    zIndex: 2,
  },
  unitRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
});
