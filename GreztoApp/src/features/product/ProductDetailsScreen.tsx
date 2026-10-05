import React, { useState, useMemo, useCallback, useRef, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Animated,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { colors } from '../../theme/colors';
import { formatINR } from '../../utils/formatters';
import { InteractionManager } from '../../utils/InteractionManager';
import { useCartStore } from '../cart/cartStore';
import { getProductDetailById } from './productData';
import { ProductDetailItem } from './types';
import { ProductService, BackendProduct } from '../../services/ProductService';

import { ProductTopSearchBar } from './components/ProductTopSearchBar';
import { ProductImageGallery } from './components/ProductImageGallery';
import { ProductSizeSelector } from './components/ProductSizeSelector';
import { ProductSellerDelivery } from './components/ProductSellerDelivery';
import { ProductSpecifications } from './components/ProductSpecifications';
import { ProductRecommendations } from './components/ProductRecommendations';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { PriceHistoryButton } from './components/PriceHistoryButton';
import { ProductDetailsSkeleton } from './components/ProductDetailsSkeleton';

export const ProductDetailsScreen: React.FC = memo(() => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Extract route parameters with robust fallback
  const passedProduct = route.params?.product;
  const productId = route.params?.productId || passedProduct?.id || 'p1';

  const fallbackProduct: ProductDetailItem = useMemo(() => {
    if (
      passedProduct &&
      passedProduct.seller &&
      passedProduct.delivery &&
      passedProduct.sizes &&
      passedProduct.images
    ) {
      return passedProduct as ProductDetailItem;
    }

    return getProductDetailById(
      productId,
      passedProduct?.name,
      passedProduct?.price,
      passedProduct?.image || passedProduct?.images?.[0],
      passedProduct?.boutiqueName || passedProduct?.boutiqueTag
    );
  }, [productId, passedProduct]);

  const [liveBackendProduct, setLiveBackendProduct] = useState<BackendProduct | null>(null);

  useEffect(() => {
    let isMounted = true;
    ProductService.getProductById(productId)
      .then((bp) => {
        if (isMounted && bp) {
          setLiveBackendProduct(bp);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const productData: ProductDetailItem = useMemo(() => {
    if (!liveBackendProduct) return fallbackProduct;
    const bp = liveBackendProduct;
    const orig = bp.original_price || bp.base_price;
    const disc = bp.discount_percent || (orig > bp.base_price ? Math.round(((orig - bp.base_price) / orig) * 100) : 0);
    return {
      ...fallbackProduct,
      id: bp.id,
      name: bp.name,
      price: bp.base_price,
      originalPrice: orig,
      discountPercent: disc,
      shopId: bp.shop?.id || bp.shop_id || 'shop_KD56AHEq_42723',
      images: bp.gallery_images && bp.gallery_images.length > 0 ? bp.gallery_images : [bp.thumbnail, ...fallbackProduct.images.slice(1)],
      seller: bp.shop
        ? {
            shopId: bp.shop.id || bp.shop_id || 'shop_KD56AHEq_42723',
            name: bp.shop.name,
            handle: `@${bp.shop.name.toLowerCase().replace(/\s+/g, '')}`,
            rating: bp.shop.rating ? Number(bp.shop.rating) : 4.8,
            verified: bp.shop.is_verified ?? true,
            avatar: bp.shop.logo_url || bp.shop.cover_image || fallbackProduct.seller.avatar,
            dispatchesIn: fallbackProduct.seller.dispatchesIn,
          }
        : {
            ...fallbackProduct.seller,
            shopId: 'shop_KD56AHEq_42723',
          },
      specifications: [
        {
          key: 'fabric',
          label: 'FABRIC & MATERIAL',
          value: bp.fabric || (fallbackProduct.specifications?.find((s) => s.key === 'fabric')?.value || '100% Cotton'),
        },
        {
          key: 'density',
          label: 'FABRIC DENSITY',
          value: bp.gsm ? `${bp.gsm} GSM` : (fallbackProduct.specifications?.find((s) => s.key === 'density')?.value || '180 GSM Heavyweight'),
        },
        {
          key: 'fit',
          label: 'FIT SILHOUETTE',
          value: bp.fit || (fallbackProduct.specifications?.find((s) => s.key === 'fit')?.value || 'Oversized Fit'),
        },
        ...(fallbackProduct.specifications || []).filter((s) => !['fabric', 'density', 'fit'].includes(s.key)),
      ],
      sizes: bp.variants && bp.variants.length > 0 ? bp.variants.map((v) => ({ size: v.size, stock: v.stock })) : fallbackProduct.sizes,
      inStock: bp.is_active !== undefined ? bp.is_active : (fallbackProduct.inStock ?? true),
    };
  }, [fallbackProduct, liveBackendProduct]);

  // Screen State
  const [selectedSize, setSelectedSize] = useState<string>(
    productData.sizes?.[0]?.size || 'M'
  );
  const [priceHistoryModalVisible, setPriceHistoryModalVisible] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Preload product gallery images & defer heavy below-the-fold components
  // (Specifications, Recommendations, Delivery) until native transition completes
  useEffect(() => {
    if (productData.images && productData.images.length > 0) {
      FastImage.preload(
        productData.images.map((img) => ({
          uri: img,
          priority: FastImage.priority.high,
        }))
      );
    }

    const task = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });

    return () => task.cancel();
  }, [productData.images]);

  // Dynamic honest price trend badge computed from priceHistory
  const dynamicPriceBadge = useMemo(() => {
    if (productData.priceHistory && productData.priceHistory.length > 0) {
      const prices = productData.priceHistory.map((p) => p.price);
      const minPrice = Math.min(...prices);
      if (productData.price <= minPrice) {
        return 'LOWEST PRICE IN 7 DAYS';
      }
      if (productData.price < productData.originalPrice) {
        return 'BOUTIQUE DEAL';
      }
    }
    return productData.badgeText || 'SPECIAL PRICE';
  }, [productData.priceHistory, productData.price, productData.originalPrice, productData.badgeText]);

  // Cart actions
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = useCallback(() => {
    if (productData.inStock === false) {
      Alert.alert('Out of Stock', `"${productData.name}" is currently out of stock.`);
      return;
    }
    addItem({
      id: `${productData.id}-${selectedSize}`,
      name: `${productData.name} (${selectedSize})`,
      price: productData.price,
      quantity: 1,
      image: productData.images[0],
      discountBadge: `${productData.discountPercent}% OFF`,
      unitLabel: selectedSize,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  }, [addItem, productData, selectedSize]);

  const handleBuyNow = useCallback((customPrice?: number) => {
    if (productData.inStock === false) {
      Alert.alert('Out of Stock', `"${productData.name}" is currently out of stock and cannot be ordered.`);
      return;
    }
    const finalPrice = typeof customPrice === 'number' ? customPrice : productData.price;
    navigation.navigate('Checkout', {
      directItem: {
        id: `${productData.id}-${selectedSize}`,
        name: productData.name,
        price: finalPrice,
        originalPrice: productData.originalPrice,
        quantity: 1,
        image: productData.images[0],
        discountBadge: `${productData.discountPercent}% OFF`,
        size: selectedSize,
        boutiqueName: productData.seller?.name || 'Mitreno.com',
      }
    });
  }, [navigation, productData, selectedSize]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: productData.name,
        message: `Check out ${productData.name} from ${productData.seller.name} for ${formatINR(productData.price)} on Mitreno!`,
      });
    } catch {
      // Dismissed
    }
  }, [productData]);

  const handleMakeOffer = useCallback(() => {
    if (productData.inStock === false) {
      Alert.alert('Out of Stock', `"${productData.name}" is currently out of stock and unavailable for bargaining.`);
      return;
    }
    navigation.navigate('ChatConversation', {
      product: productData,
      attachedProduct: productData,
      shopId: (productData as any).shopId || (productData.seller as any)?.shopId || 'shop_KD56AHEq_42723',
      boutiqueName: productData.seller?.name || 'Mitreno Boutique',
      avatar: productData.seller?.avatar || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
    });
  }, [navigation, productData]);

  const handleProductPress = useCallback((item: ProductDetailItem) => {
    if (item.images && item.images.length > 0) {
      FastImage.preload([{ uri: item.images[0], priority: FastImage.priority.high }]);
    }
    navigation.push('ProductDetails', {
      product: item,
      productId: item.id,
    });
  }, [navigation]);

  const handleViewAllSimilar = useCallback(() => {
    navigation.navigate('ExploreTab');
  }, [navigation]);

  // Dynamic Scroll-Reactive Header Animation (Flipkart style)
  const HEADER_HEIGHT = 52 + Math.max(insets.top, 12);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY <= 0) {
      // At top -> show header
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else if (diff > 8 && currentY > 60) {
      // Scrolling down -> hide header smoothly
      Animated.timing(headerTranslateY, {
        toValue: -HEADER_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (diff < -8) {
      // Scrolling up slightly -> reveal header immediately
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentY;
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" />

      {/* 1. Flipkart-style Collapsible Top Search Header */}
      <ProductTopSearchBar
        onBack={() => navigation.goBack()}
        onSearch={() => navigation.navigate('Search' as any)}
        onCartPress={() => navigation.navigate('BagTab' as any)}
        translateY={headerTranslateY}
      />

      {/* Main PDP Smooth Scrollable View */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: HEADER_HEIGHT,
            paddingBottom: 100 + Math.max(insets.bottom, 12),
          },
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* 2. Top Image Gallery (Luxury 3:4 Portrait Ratio with Vertical Action Stack) */}
        <ProductImageGallery
          images={productData.images}
          productTitle={productData.name}
        />

        {/* 2. Top Size Selector Card (Matching Screenshot 2) */}
        <ProductSizeSelector
          sizes={productData.sizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
        />

        {/* 3. Middle Product Info Section (Seamless Plane aligned to 12px margin) */}
        <View style={styles.productInfoSection}>
          {/* Boutique Store Name */}
          <TouchableOpacity
            style={styles.boutiqueRow}
            onPress={() =>
              navigation.navigate('BoutiqueStore', {
                shopId: (productData as any).shopId || (productData.seller as any)?.shopId || 'shop_KD56AHEq_42723',
                seller: productData.seller,
              })
            }
            activeOpacity={0.75}
          >
            <Text style={styles.boutiqueNameText}>
              {productData.seller?.name || 'Mitreno Boutique'}
            </Text>
            <Icon name="chevron-right" size={14} color="#64748B" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          {/* Product Title with natural clean typography */}
          <Text style={styles.productTitle}>
            {productData.name}
          </Text>

          {/* Dynamic Badge: OUT OF STOCK / LOWEST PRICE IN 7 DAYS / SPECIAL PRICE */}
          {productData.inStock === false ? (
            <View style={styles.outOfStockPillDetail}>
              <Icon name="alert-circle-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.outOfStockPillDetailText}>CURRENTLY OUT OF STOCK</Text>
            </View>
          ) : dynamicPriceBadge ? (
            <View style={styles.lowestPricePill}>
              <Text style={styles.lowestPricePillText}>{dynamicPriceBadge}</Text>
            </View>
          ) : null}

          {/* Price Row: Bold Final Price + Strikethrough Original + Discount% */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatINR(productData.price)}</Text>
            <Text style={styles.originalPrice}>{formatINR(productData.originalPrice)}</Text>
            <Text style={styles.discountText}>{productData.discountPercent}% off</Text>
          </View>

          {/* Delivery Fee Notice */}
          <View style={styles.deliveryFeeRow}>
            <Text style={styles.deliveryFeeText}>
              {productData.deliveryFeeText || '+₹99 Delivery Fee'}
            </Text>
          </View>

          {/* Glowing Animated 7-Day Price History Button */}
          <PriceHistoryButton
            onPress={() => setPriceHistoryModalVisible(true)}
          />

          {/* Zero Artificial Markup Trust Badge */}
          <View style={styles.trustBadgeRow}>
            <Icon name="shield-check-outline" size={16} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.trustBadgeTitle}>Zero Artificial Markup</Text>
          </View>
        </View>

        {/* 4. Progressive Below-The-Fold Sections with Shimmering Skeleton */}
        {!isReady ? (
          <ProductDetailsSkeleton />
        ) : (
          <>
            {/* 4. Seller Info, Hyperlocal Delivery & 3 Policy Cards */}
            <ProductSellerDelivery
              seller={productData.seller}
              delivery={productData.delivery}
              policies={productData.policies}
              onMakeOffer={handleMakeOffer}
              onSellerPress={() =>
                navigation.navigate('BoutiqueStore', {
                  shopId: (productData as any).shopId || (productData.seller as any)?.shopId || 'shop_KD56AHEq_42723',
                  seller: productData.seller,
                })
              }
            />

            {/* 5. 2-Column Specifications & Product Story */}
            <ProductSpecifications
              specifications={productData.specifications}
              productStory={productData.productStory}
              sku={productData.sku}
            />

            {/* 6. Flipkart-style Similar Outfits & More Products Recommendations */}
            <ProductRecommendations
              currentProductId={productId}
              onProductPress={handleProductPress}
              onViewAll={handleViewAllSimilar}
            />
          </>
        )}
      </ScrollView>

      {/* 6. Sticky Bottom Action Bar (Safe Area Compliant) */}
      <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* Left: Rounded Square Share Button */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Icon name="share-variant-outline" size={20} color="#1E293B" />
        </TouchableOpacity>

        {productData.inStock === false ? (
          <View style={styles.outOfStockBottomBtn}>
            <Icon name="close-circle-outline" size={17} color="#94A3B8" style={{ marginRight: 6 }} />
            <Text style={styles.outOfStockBottomText}>Currently Out of Stock</Text>
          </View>
        ) : (
          <>
            {/* Middle: BARGAIN Button (Negotiate / Make Offer with Boutique Seller) */}
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleMakeOffer}
              activeOpacity={0.8}
            >
              <Icon
                name="chat-processing-outline"
                size={16}
                color={colors.burgundy}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.addToCartText}>
                BARGAIN
              </Text>
            </TouchableOpacity>

            {/* Right: BUY NOW with Dynamic Price */}
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() => handleBuyNow()}
              activeOpacity={0.85}
            >
              <Text style={styles.buyNowText}>BUY NOW {formatINR(productData.price)}</Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 7. Price History Modal - Lazy Mount on Demand */}
      {priceHistoryModalVisible && (
        <PriceHistoryModal
          visible={priceHistoryModalVisible}
          onClose={() => setPriceHistoryModalVisible(false)}
          productTitle={productData.name}
          originalPrice={productData.originalPrice}
          priceHistory={productData.priceHistory}
          onBuyAtLowestPrice={(price) => handleBuyNow(price)}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  productInfoSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  boutiqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  boutiqueNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    color: '#0F172A',
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  lowestPricePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 4,
    marginBottom: 10,
  },
  lowestPricePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 8,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 15,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
  },
  deliveryFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryFeeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 4,
  },

  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
    marginBottom: 8,
  },
  trustBadgeTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE8DE',
    paddingTop: 10,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },
  shareBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FAF5ED',
    borderWidth: 1,
    borderColor: '#EAE1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartBtn: {
    flex: 1.1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D8CDC0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  addToCartBtnSuccess: {
    borderColor: colors.verifiedGreen,
    backgroundColor: '#F0FDF4',
  },
  addToCartText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.burgundy,
    letterSpacing: 0.3,
  },
  addToCartTextSuccess: {
    color: colors.verifiedGreen,
  },
  buyNowBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.burgundy,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: colors.burgundy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buyNowText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  outOfStockPillDetail: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
  },
  outOfStockPillDetailText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  outOfStockBottomBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBottomText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.2,
  },
});
