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
import { ProductDetailItem, ProductSpecificationItem } from './types';
import { ProductService, BackendProduct } from '../../services/ProductService';
import {
  WHOLESALE_CATALOG_PRODUCTS,
  detectWholesaleTaxonomy,
  WholesaleVerticalId,
} from '../home/data/wholesaleHubData';

import { ProductTopSearchBar } from './components/ProductTopSearchBar';
import { ProductImageGallery } from './components/ProductImageGallery';
import { ProductSizeSelector } from './components/ProductSizeSelector';
import { ProductSellerDelivery } from './components/ProductSellerDelivery';
import { ProductSpecifications } from './components/ProductSpecifications';
import { ProductRecommendations } from './components/ProductRecommendations';
import { ProductDetailsSkeleton } from './components/ProductDetailsSkeleton';
import { FloatingCartSummary } from '../../components/FloatingCartSummary';

function buildCategorySpecificationsAndStory(
  vertical: WholesaleVerticalId,
  productName: string,
  unitSpec: string,
  minOrder: number,
  sellerSpec?: string,
  sellerGrade?: string
): { specifications: ProductSpecificationItem[]; productStory: string } {
  const lower = productName.toLowerCase();

  if (vertical === 'electronics') {
    let techSpec = sellerSpec || 'Commercial Heavy-Duty Grade';
    if (lower.includes('kettle')) techSpec = '1500W Auto-Cut • 1.5L Stainless Steel';
    else if (lower.includes('induction')) techSpec = '1600W Push-Button • Crystal Glass Plate';
    else if (lower.includes('fan')) techSpec = 'High-Speed 100% Copper Winding Motor';
    else if (lower.includes('charger') || lower.includes('cable')) techSpec = 'Fast Charge Output • Surge Protected';
    else if (lower.includes('earbud') || lower.includes('neckband') || lower.includes('speaker'))
      techSpec = 'Bluetooth 5.3 • Deep Bass & Long Battery';
    else if (lower.includes('bulb') || lower.includes('batten') || lower.includes('light'))
      techSpec = 'Cool Daylight 6500K • 4kV Surge Protection';
    else if (lower.includes('iron')) techSpec = '1000W Non-Stick Soleplate • Thermal Fuse';
    else if (lower.includes('mixer')) techSpec = '750W Heavy-Duty Copper Motor • 3 SS Jars';

    return {
      specifications: [
        { key: 'pack', label: 'WHOLESALE PACK / LOT', value: unitSpec },
        { key: 'tech', label: 'TECHNICAL SPECIFICATION', value: techSpec },
        { key: 'warranty', label: 'WARRANTY & GUARANTEE', value: sellerGrade || '1 Year Manufacturer Warranty' },
        { key: 'cert', label: 'CERTIFICATION', value: 'BIS & ISI Certified Wholesale Lot' },
        { key: 'moq', label: 'MINIMUM ORDER (MOQ)', value: `${minOrder} Units` },
        { key: 'origin', label: 'COUNTRY OF ORIGIN', value: 'Made in India IN' },
      ],
      productStory: `Factory-sealed wholesale lot of ${productName} supplied in ${unitSpec}. Tested for commercial durability, BIS/ISI safety compliance, and high retailer resale margin with full counter warranty support.`,
    };
  }

  if (vertical === 'ration') {
    let gradeVal = sellerSpec || 'Sortex Cleaned Grade-A Mandi Lot';
    if (lower.includes('rice') || lower.includes('basmati')) gradeVal = 'Aged Extra-Long Grain Sortex Cleaned';
    else if (lower.includes('atta') || lower.includes('besan') || lower.includes('maida'))
      gradeVal = '100% Pure Chakki Fresh Mill Grade';
    else if (lower.includes('oil') || lower.includes('ghee'))
      gradeVal = '100% Pure Agmark & FSSAI Fortified';
    else if (lower.includes('masala') || lower.includes('haldi') || lower.includes('mirch') || lower.includes('jeera'))
      gradeVal = 'A-Grade Whole / Cryo-Ground Aroma Locked';
    else if (lower.includes('almond') || lower.includes('kaju') || lower.includes('raisin'))
      gradeVal = 'Handpicked Export Quality Jumbo Grade';

    return {
      specifications: [
        { key: 'pack', label: 'PACK / BORI WEIGHT', value: unitSpec },
        { key: 'grade', label: 'QUALITY & MANDI GRADE', value: gradeVal },
        { key: 'safety', label: 'FOOD SAFETY LICENSE', value: '100% FSSAI & Agmark Verified' },
        { key: 'shelf', label: 'SHELF LIFE', value: sellerGrade || '12 Months from Packaging' },
        { key: 'packaging', label: 'PACKAGING TYPE', value: 'Moisture-Proof Heavy Mandi Pack' },
        { key: 'moq', label: 'MINIMUM ORDER (MOQ)', value: `${minOrder} Packs / Boris` },
      ],
      productStory: `Direct Mandi & Mill wholesale supply of ${productName} packed in ${unitSpec}. Hygienically processed, moisture-sealed, and lab-verified under FSSAI standards for kirana stores, supermarkets, and Horeca buyers.`,
    };
  }

  if (vertical === 'pharmacy') {
    return {
      specifications: [
        { key: 'pack', label: 'PHARMA PACK SIZE', value: unitSpec },
        { key: 'comp', label: 'COMPOSITION & STANDARD', value: sellerSpec || 'WHO-GMP & IP Certified Formulation' },
        { key: 'expiry', label: 'EXPIRY / SHELF LIFE', value: sellerGrade || 'Long Expiry (18–24 Months)' },
        { key: 'supply', label: 'STOCKIST SOURCE', value: 'Authorized Pharma Distributor Lot' },
        { key: 'storage', label: 'STORAGE CONDITION', value: 'Cool & Dry Chemist Storage' },
        { key: 'moq', label: 'MINIMUM ORDER (MOQ)', value: `${minOrder} Boxes / Units` },
      ],
      productStory: `100% genuine batch-verified pharmaceutical & surgical wholesale stock of ${productName} (${unitSpec}). Sourced directly from authorized WHO-GMP compliant stockists with long expiry for medical stores and clinics.`,
    };
  }

  return {
    specifications: [
      { key: 'pack', label: 'WHOLESALE PACK UNIT', value: unitSpec },
      { key: 'grade', label: 'QUALITY & GRADE', value: sellerSpec || '100% Original Sealed Wholesale Lot' },
      { key: 'shelf', label: 'DURABILITY / SHELF LIFE', value: sellerGrade || '24 Months Retail Ready' },
      { key: 'moq', label: 'MINIMUM ORDER (MOQ)', value: `${minOrder} Units` },
      { key: 'margin', label: 'RETAIL MARGIN TIER', value: 'High-Margin B2B Wholesale' },
      { key: 'origin', label: 'COUNTRY OF ORIGIN', value: 'Verified Wholesale Supply' },
    ],
    productStory: `Curated B2B wholesale lot of ${productName} (${unitSpec}). Sealed retail-ready packaging designed for high counter turnover and maximum shopkeeper profit margin.`,
  };
}

export const ProductDetailsScreen: React.FC = memo(() => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Extract route parameters with robust fallback
  const passedProduct = route.params?.product;
  const productId = route.params?.productId || passedProduct?.id || 'p1';

  // Lookup matching wholesale catalog item if available
  const catalogMatch = useMemo(
    () => WHOLESALE_CATALOG_PRODUCTS.find((p) => p.id === productId),
    [productId]
  );

  // Determine exact wholesale vertical (Electronics, Ration, Pharmacy, Beauty, Home, Kids, Imported, or Fashion)
  const resolvedVertical: WholesaleVerticalId = useMemo(() => {
    if (passedProduct?.vertical) return passedProduct.vertical;
    if (catalogMatch?.vertical) return catalogMatch.vertical;
    const detected = detectWholesaleTaxonomy(
      `${passedProduct?.name || ''} ${passedProduct?.category || ''}`
    );
    if (detected?.vertical) return detected.vertical;
    const lowerId = String(productId).toLowerCase();
    if (lowerId.startsWith('elec_')) return 'electronics';
    if (lowerId.startsWith('rat_')) return 'ration';
    if (lowerId.startsWith('pharma_')) return 'pharmacy';
    if (lowerId.startsWith('bty_')) return 'beauty';
    if (lowerId.startsWith('home_')) return 'home';
    if (lowerId.startsWith('kids_')) return 'kids';
    if (lowerId.startsWith('imp_')) return 'imported';
    return 'fashion';
  }, [passedProduct, catalogMatch, productId]);

  const isFashion = resolvedVertical === 'fashion';

  const resolvedUnitSpec = useMemo(() => {
    if (passedProduct?.unitSpec) return passedProduct.unitSpec;
    if (catalogMatch?.unitSpec) return catalogMatch.unitSpec;
    if (passedProduct?.setRatio && !passedProduct.setRatio.includes('S:1')) {
      return passedProduct.setRatio;
    }
    const detected = detectWholesaleTaxonomy(passedProduct?.name || '');
    if (detected?.suggestedUnit) return detected.suggestedUnit;
    return isFashion ? 'S:1, M:2, L:2, XL:1' : 'Master Wholesale Pack';
  }, [passedProduct, catalogMatch, isFashion]);

  const fallbackProduct: ProductDetailItem = useMemo(() => {
    if (
      passedProduct &&
      passedProduct.seller &&
      passedProduct.delivery &&
      passedProduct.sizes &&
      passedProduct.images
    ) {
      return {
        ...passedProduct,
        minOrder: passedProduct.minOrder || (isFashion ? 6 : 4),
        setRatio: resolvedUnitSpec,
      } as ProductDetailItem;
    }

    const primaryImg =
      catalogMatch?.image ||
      passedProduct?.image ||
      passedProduct?.images?.[0];

    const base = getProductDetailById(
      productId,
      passedProduct?.name || catalogMatch?.name,
      passedProduct?.price || catalogMatch?.price,
      primaryImg,
      passedProduct?.boutiqueName || passedProduct?.boutiqueTag || catalogMatch?.boutiqueName
    );

    const resolvedMinOrder =
      passedProduct?.minOrder || catalogMatch?.minOrder || (isFashion ? base.minOrder || 6 : 4);

    if (!isFashion) {
      const catDetails = buildCategorySpecificationsAndStory(
        resolvedVertical,
        passedProduct?.name || catalogMatch?.name || base.name,
        resolvedUnitSpec,
        resolvedMinOrder,
        passedProduct?.fabric,
        passedProduct?.gsm
      );
      return {
        ...base,
        name: passedProduct?.name || catalogMatch?.name || base.name,
        price: passedProduct?.price || catalogMatch?.price || base.price,
        originalPrice:
          passedProduct?.originalPrice ||
          catalogMatch?.originalPrice ||
          base.originalPrice,
        images: primaryImg ? [primaryImg] : [base.images[0]],
        minOrder: resolvedMinOrder,
        setRatio: resolvedUnitSpec,
        specifications: catDetails.specifications,
        productStory: catDetails.productStory,
        sizes: [],
      };
    }

    return {
      ...base,
      minOrder: resolvedMinOrder,
      setRatio: passedProduct?.setRatio || base.setRatio || 'S:1, M:2, L:2, XL:1',
    };
  }, [productId, passedProduct, catalogMatch, isFashion, resolvedVertical, resolvedUnitSpec]);

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
    const passedShopId = passedProduct?.shopId || passedProduct?.shop_id || (passedProduct?.seller as any)?.shopId || '';
    if (!liveBackendProduct) {
      return {
        ...fallbackProduct,
        minOrder: passedProduct?.minOrder || fallbackProduct.minOrder || (isFashion ? 6 : 4),
        setRatio: resolvedUnitSpec,
        shopId: passedShopId,
        seller: {
          ...fallbackProduct.seller,
          shopId: passedShopId,
        },
      } as ProductDetailItem;
    }
    const bp = liveBackendProduct;
    const orig = bp.original_price || bp.base_price;
    const disc = bp.discount_percent || (orig > bp.base_price ? Math.round(((orig - bp.base_price) / orig) * 100) : 0);
    const resolvedShopId = bp.shop?.id || bp.shop_id || passedShopId;
    const resolvedMinOrder = bp.min_order_quantity || passedProduct?.minOrder || fallbackProduct.minOrder || (isFashion ? 6 : 4);
    const resolvedSetRatio = bp.set_ratio || resolvedUnitSpec;
    return {
      ...fallbackProduct,
      id: bp.id,
      name: bp.name,
      price: bp.base_price,
      originalPrice: orig,
      discountPercent: disc,
      minOrder: resolvedMinOrder,
      setRatio: resolvedSetRatio,
      shopId: resolvedShopId,
      images:
        bp.gallery_images && bp.gallery_images.length > 0
          ? bp.gallery_images
          : isFashion
          ? [bp.thumbnail, ...fallbackProduct.images.slice(1)]
          : [bp.thumbnail || fallbackProduct.images[0]],
      seller: bp.shop
        ? {
            shopId: resolvedShopId,
            name: bp.shop.name,
            handle: `@${bp.shop.name.toLowerCase().replace(/\s+/g, '')}`,
            rating: bp.shop.rating ? Number(bp.shop.rating) : 4.8,
            verified: bp.shop.is_verified ?? true,
            avatar: bp.shop.logo_url || bp.shop.cover_image || fallbackProduct.seller.avatar,
            dispatchesIn: fallbackProduct.seller.dispatchesIn,
          }
        : {
            ...fallbackProduct.seller,
            shopId: resolvedShopId,
          },
      specifications: isFashion
        ? [
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
          ]
        : buildCategorySpecificationsAndStory(
            resolvedVertical,
            bp.name,
            resolvedSetRatio,
            resolvedMinOrder,
            bp.fabric,
            bp.gsm ? `${bp.gsm}` : undefined
          ).specifications,
      sizes: isFashion
        ? bp.variants && bp.variants.length > 0
          ? bp.variants.map((v) => ({ size: v.size, stock: v.stock }))
          : fallbackProduct.sizes
        : [],
      inStock: bp.is_active !== undefined ? bp.is_active : (fallbackProduct.inStock ?? true),
    };
  }, [fallbackProduct, liveBackendProduct, passedProduct, isFashion, resolvedUnitSpec, resolvedVertical]);

  // Screen State
  const [selectedSize, setSelectedSize] = useState<string>(
    productData.sizes?.[0]?.size || 'M'
  );
  const [isReady, setIsReady] = useState(false);

  // Navigate to Shopping Bag helper that works from any Stack or Tab screen
  const navigateToBag = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'BagTab' });
  }, [navigation]);

  // Preload product gallery images & defer heavy below-the-fold components
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

  // Cart items & Multi-Size / Wholesale Lot Quantities
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Map quantities by size for fashion products
  const sizeQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    cartItems.forEach((item) => {
      if (item.productId === productData.id && item.size) {
        map[item.size] = (map[item.size] || 0) + item.quantity;
      } else if (item.id.startsWith(productData.id + '_')) {
        const sz = item.id.replace(productData.id + '_', '');
        map[sz] = (map[sz] || 0) + item.quantity;
      } else if (item.id === productData.id && item.size) {
        map[item.size] = (map[item.size] || 0) + item.quantity;
      }
    });
    return map;
  }, [cartItems, productData.id]);

  // Total quantity in cart for non-fashion product
  const nonFashionCartEntry = useMemo(() => {
    return cartItems.find(
      (i) => i.id === productData.id || i.productId === productData.id
    );
  }, [cartItems, productData.id]);

  const totalCartItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const selectedSizeCartItemId = isFashion
    ? `${productData.id}_${selectedSize}`
    : nonFashionCartEntry?.id || productData.id;

  const cartQuantityForSelectedSize = isFashion
    ? sizeQuantities[selectedSize] || 0
    : nonFashionCartEntry?.quantity || 0;

  // Tooltip Popover state & animated opacity
  const [showMoqTooltip, setShowMoqTooltip] = useState(false);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  const triggerTooltip = useCallback(() => {
    setShowMoqTooltip(true);
    tooltipOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(tooltipOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMoqTooltip(false);
    });
  }, [tooltipOpacity]);

  const handleAddToCart = useCallback(() => {
    if (productData.inStock === false) {
      Alert.alert('Out of Stock', `"${productData.name}" is currently out of stock.`);
      return;
    }
    const minOrder = productData.minOrder || (isFashion ? 6 : 4);
    if (isFashion) {
      addItem({
        id: selectedSizeCartItemId,
        productId: productData.id,
        size: selectedSize,
        name: `${productData.name} (${selectedSize})`,
        price: productData.price,
        quantity: minOrder,
        image: productData.images[0],
        discountBadge: `${productData.discountPercent}% OFF`,
        unitLabel: `Size ${selectedSize} • ${minOrder} pcs`,
      });
    } else {
      addItem({
        id: productData.id,
        productId: productData.id,
        name: productData.name,
        price: productData.price,
        quantity: minOrder,
        image: productData.images[0],
        discountBadge: `${productData.discountPercent}% OFF`,
        unitLabel: resolvedUnitSpec,
      });
    }
    triggerTooltip();
  }, [addItem, productData, isFashion, selectedSize, selectedSizeCartItemId, resolvedUnitSpec, triggerTooltip]);

  const handleSelectLotQuantity = useCallback(
    (lotQty: number) => {
      if (productData.inStock === false) {
        Alert.alert('Out of Stock', `"${productData.name}" is currently out of stock.`);
        return;
      }
      if (nonFashionCartEntry) {
        updateQuantity(nonFashionCartEntry.id, lotQty);
      } else {
        addItem({
          id: productData.id,
          productId: productData.id,
          name: productData.name,
          price: productData.price,
          quantity: lotQty,
          image: productData.images[0],
          discountBadge: `${productData.discountPercent}% OFF`,
          unitLabel: resolvedUnitSpec,
        });
      }
    },
    [productData, nonFashionCartEntry, updateQuantity, addItem, resolvedUnitSpec]
  );

  const handleIncrement = useCallback((delta: number = 1) => {
    const existing = cartItems.find((i) => i.id === selectedSizeCartItemId);
    if (existing) {
      updateQuantity(selectedSizeCartItemId, existing.quantity + delta);
    } else {
      const minOrder = productData.minOrder || (isFashion ? 6 : 4);
      if (isFashion) {
        addItem({
          id: selectedSizeCartItemId,
          productId: productData.id,
          size: selectedSize,
          name: `${productData.name} (${selectedSize})`,
          price: productData.price,
          quantity: Math.max(minOrder, delta),
          image: productData.images[0],
          discountBadge: `${productData.discountPercent}% OFF`,
          unitLabel: `Size ${selectedSize} • ${Math.max(minOrder, delta)} pcs`,
        });
      } else {
        addItem({
          id: productData.id,
          productId: productData.id,
          name: productData.name,
          price: productData.price,
          quantity: Math.max(minOrder, delta),
          image: productData.images[0],
          discountBadge: `${productData.discountPercent}% OFF`,
          unitLabel: resolvedUnitSpec,
        });
      }
      triggerTooltip();
    }
  }, [cartItems, selectedSizeCartItemId, updateQuantity, addItem, productData, isFashion, selectedSize, resolvedUnitSpec, triggerTooltip]);

  const handleDecrement = useCallback(() => {
    if (cartQuantityForSelectedSize <= 1) {
      removeItem(selectedSizeCartItemId);
    } else {
      updateQuantity(selectedSizeCartItemId, cartQuantityForSelectedSize - 1);
    }
  }, [cartQuantityForSelectedSize, removeItem, selectedSizeCartItemId, updateQuantity]);

  const handleBuyNow = useCallback((customPrice?: number) => {
    if (productData.inStock === false) {
      Alert.alert('Out of Stock', `"${productData.name}" is currently out of stock and cannot be ordered.`);
      return;
    }
    const finalPrice = typeof customPrice === 'number' ? customPrice : productData.price;
    const exactShopId = (productData as any).shopId || (productData.seller as any)?.shopId || '';
    navigation.navigate('Checkout', {
      directItem: {
        id: productData.id,
        productId: productData.id,
        shopId: exactShopId,
        name: productData.name,
        price: finalPrice,
        originalPrice: productData.originalPrice,
        quantity: productData.minOrder || (isFashion ? 6 : 4),
        image: productData.images[0],
        discountBadge: `${productData.discountPercent}% OFF`,
        size: isFashion ? selectedSize : undefined,
        unitLabel: isFashion ? `Size ${selectedSize}` : resolvedUnitSpec,
        boutiqueName: productData.seller?.name || 'Verified Boutique',
      }
    });
  }, [navigation, productData, isFashion, selectedSize, resolvedUnitSpec]);

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
    const exactShopId = (productData as any).shopId || (productData.seller as any)?.shopId || '';
    navigation.navigate('ChatConversation', {
      product: productData,
      attachedProduct: productData,
      shopId: exactShopId,
      boutiqueName: productData.seller?.name || 'Nvilar Boutique',
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
    navigation.navigate('MainTabs', { screen: 'ExploreTab' });
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
        onCartPress={navigateToBag}
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

        {/* 2. Category-Adaptive Wholesale Pack / Size Selector Card */}
        <ProductSizeSelector
          sizes={productData.sizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          minOrder={productData.minOrder || (isFashion ? 6 : 4)}
          sizeQuantities={sizeQuantities}
          unitPrice={productData.price}
          onViewCart={navigateToBag}
          vertical={resolvedVertical}
          unitSpec={resolvedUnitSpec}
          cartQuantityForProduct={cartQuantityForSelectedSize}
          onSelectLotQuantity={handleSelectLotQuantity}
        />

        {/* 3. Middle Product Info Section (Seamless Plane aligned to 12px margin) */}
        <View style={styles.productInfoSection}>
          {/* Boutique Store Name */}
          <TouchableOpacity
            style={styles.boutiqueRow}
            onPress={() =>
              navigation.navigate('BoutiqueStore', {
                shopId: (productData as any).shopId || (productData.seller as any)?.shopId || '',
                seller: productData.seller,
              })
            }
            activeOpacity={0.75}
          >
            <Text style={styles.boutiqueNameText}>
              {productData.seller?.name || 'Nvilar Boutique'}
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

          {/* Wholesale Pricing Breakdown */}
          <View style={styles.wholesalePriceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{formatINR(productData.price)}</Text>
              <Text style={styles.unitText}>/ pc</Text>
              <Text style={styles.originalPrice}>{formatINR(productData.originalPrice)}</Text>
              <View style={styles.marginPill}>
                <Text style={styles.marginPillText}>{productData.discountPercent}% MARGIN</Text>
              </View>
            </View>
            <View style={styles.setTotalRow}>
              <Icon name="package-variant-closed" size={15} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.setTotalText}>
                Wholesale Minimum:{' '}
                <Text style={styles.setTotalBold}>
                  {isFashion
                    ? `${productData.minOrder || 6} pieces per size`
                    : `${productData.minOrder || 4} units (${resolvedUnitSpec})`}
                </Text>
              </Text>
            </View>
            <View style={styles.profitEstimateRow}>
              <Icon name="trending-up" size={14} color="#059669" style={{ marginRight: 5 }} />
              <Text style={styles.profitEstimateText}>
                Resale MRP {formatINR(productData.originalPrice)}/pc • Profit {formatINR(productData.originalPrice - productData.price)}/pc
              </Text>
            </View>
          </View>

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
              minOrder={productData.minOrder || (isFashion ? 6 : 4)}
              setRatio={productData.setRatio}
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

            {/* Right: Clean Wholesale ADD Button & Stepper with Downward Arrow Tooltip */}
            <View style={styles.addBtnWrapper}>
              {/* Downward Arrow Pop-up Tooltip */}
              {showMoqTooltip && (
                <Animated.View style={[styles.tooltipContainer, { opacity: tooltipOpacity }]}>
                  <View style={styles.tooltipBubble}>
                    <Icon name="information" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.tooltipText}>
                      Minimum order should be {productData.minOrder || (isFashion ? 6 : 4)}
                    </Text>
                  </View>
                  <View style={styles.tooltipArrowDown} />
                </Animated.View>
              )}

              {cartQuantityForSelectedSize === 0 ? (
                <TouchableOpacity
                  style={styles.buyNowBtn}
                  onPress={handleAddToCart}
                  activeOpacity={0.85}
                >
                  <Icon name="cart-plus" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.buyNowText}>ADD</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.wholesaleStepperPill}>
                  <TouchableOpacity
                    style={styles.stepperActionBtn}
                    onPress={handleDecrement}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="minus"
                      size={18}
                      color="#0D7B48"
                    />
                  </TouchableOpacity>

                  <View style={styles.stepperCenterInfo}>
                    <Text style={styles.stepperQtyText}>
                      {cartQuantityForSelectedSize} {cartQuantityForSelectedSize === 1 ? 'Unit' : 'Units'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepperActionBtn}
                    onPress={() => handleIncrement(1)}
                    activeOpacity={0.7}
                  >
                    <Icon name="plus" size={18} color="#0D7B48" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Floating Wholesale Cart Summary Pill with Upward Quick-Peek Drawer */}
      {totalCartItems > 0 && (
        <FloatingCartSummary
          onPress={navigateToBag}
          bottomOffset={Math.max(insets.bottom, 12) + 68}
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
  wholesalePriceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: -2,
    marginRight: 4,
  },
  marginPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  marginPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  setTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  setTotalText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  setTotalBold: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  profitEstimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  profitEstimateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
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
  addBtnWrapper: {
    flex: 1.5,
    position: 'relative',
    justifyContent: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 54,
    right: 0,
    left: -40,
    alignItems: 'center',
    zIndex: 999,
  },
  tooltipBubble: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  tooltipArrowDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
    alignSelf: 'center',
    marginTop: -1,
  },
  buyNowBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E50914',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.48,
    shadowRadius: 6,
    elevation: 4,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  wholesaleStepperPill: {
    flex: 1.5,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#0D7B48', // Clean Forest Green when added
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    shadowColor: '#0D7B48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  stepperActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepperCenterInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  stepperQtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
