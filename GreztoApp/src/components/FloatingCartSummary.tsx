import React, { memo, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { useCartStore, CartItem } from '../features/cart/cartStore';
import { WHOLESALE_CATALOG_PRODUCTS } from '../features/home/data/wholesaleHubData';
import { formatINR } from '../utils/formatters';

// Fast lookup map so even previously persisted cart items always render the latest high-res studio product photo & category metadata
const CATALOG_IMAGE_MAP: Record<string, string> = {};
const NON_FASHION_PRODUCT_IDS = new Set<string>();
for (const prod of WHOLESALE_CATALOG_PRODUCTS) {
  if (prod.id && prod.image) {
    CATALOG_IMAGE_MAP[prod.id] = prod.image;
  }
  if (prod.id && prod.vertical !== 'fashion') {
    NON_FASHION_PRODUCT_IDS.add(prod.id);
  }
}

export function isNonFashionWholesaleItem(item: CartItem): boolean {
  const baseId = (item.productId || item.id || '').replace(/_(S|M|L|XL|XXL)$/i, '');
  if (NON_FASHION_PRODUCT_IDS.has(baseId)) return true;
  const lowerName = (item.name || '').toLowerCase();
  if (
    lowerName.includes('kettle') ||
    lowerName.includes('induction') ||
    lowerName.includes('fan') ||
    lowerName.includes('charger') ||
    lowerName.includes('cable') ||
    lowerName.includes('earbud') ||
    lowerName.includes('neckband') ||
    lowerName.includes('bulb') ||
    lowerName.includes('batten') ||
    lowerName.includes('iron') ||
    lowerName.includes('mixer') ||
    lowerName.includes('geyser') ||
    lowerName.includes('camera') ||
    lowerName.includes('extension') ||
    lowerName.includes('atta') ||
    lowerName.includes('rice') ||
    lowerName.includes('dal') ||
    lowerName.includes('besan') ||
    lowerName.includes('oil') ||
    lowerName.includes('ghee') ||
    lowerName.includes('masala') ||
    lowerName.includes('haldi') ||
    lowerName.includes('mirch') ||
    lowerName.includes('jeera') ||
    lowerName.includes('almond') ||
    lowerName.includes('kaju') ||
    lowerName.includes('sugar') ||
    lowerName.includes('poha') ||
    lowerName.includes('dolo') ||
    lowerName.includes('paracetamol') ||
    lowerName.includes('ors') ||
    lowerName.includes('syrup') ||
    lowerName.includes('tablet') ||
    lowerName.includes('capsule') ||
    lowerName.includes('thermometer') ||
    lowerName.includes('oximeter') ||
    lowerName.includes('diaper') ||
    lowerName.includes('antiseptic') ||
    lowerName.includes('bandage') ||
    lowerName.includes('shampoo') ||
    lowerName.includes('face wash') ||
    lowerName.includes('serum')
  ) {
    return true;
  }
  return false;
}

export function cleanCartItemDisplayName(item: CartItem): string {
  if (isNonFashionWholesaleItem(item)) {
    return (item.name || '').replace(/\s*\((S|M|L|XL|XXL)\)\s*$/i, '').trim();
  }
  return item.name;
}

export function resolveHighResCartImage(item: CartItem): string {
  const baseId = (item.productId || item.id || '').replace(/_(S|M|L|XL|XXL)$/i, '');
  if (item.id && CATALOG_IMAGE_MAP[item.id]) {
    return CATALOG_IMAGE_MAP[item.id];
  }
  if (baseId && CATALOG_IMAGE_MAP[baseId]) {
    return CATALOG_IMAGE_MAP[baseId];
  }
  return item.image;
}

export interface FloatingCartSummaryProps {
  onPress?: () => void;
  bottomOffset?: number;
}

export const FloatingCartSummary = memo(({ onPress, bottomOffset = 12 }: FloatingCartSummaryProps) => {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const navigateToShoppingBag = useCallback(() => {
    try {
      navigation.navigate('MainTabs', { screen: 'BagTab' });
    } catch {
      if (onPress) {
        onPress();
      }
    }
  }, [navigation, onPress]);

  const openDrawer = useCallback(() => {
    setIsExpanded(true);
    Animated.spring(animValue, {
      toValue: 1,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [animValue]);

  const closeDrawer = useCallback((afterClose?: () => void) => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsExpanded(false);
        if (afterClose) afterClose();
      }
    });
  }, [animValue]);

  const toggleExpand = useCallback(() => {
    if (isExpanded) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }, [isExpanded, openDrawer, closeDrawer]);

  if (totalItems === 0) return null;
  const displayItems = items.slice(0, 2);

  const containerWidth = Math.min(width - 24, 366);

  const drawerTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [38, 0],
  });

  const drawerScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: bottomOffset }]}
    >
      {/* Full-Screen Dark Dim Backdrop Layer when Expanded — Tapping anywhere outside smoothly closes drawer */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.backdropOverlay,
            {
              width: width * 2,
              height: height * 2,
              opacity: animValue,
            },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={() => closeDrawer()} />
        </Animated.View>
      )}

      {/* Expanded Quick-Peek Wholesale Drawer (Crisp Pure White Card) */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.expandedDrawer,
            {
              width: containerWidth,
              opacity: animValue,
              transform: [{ translateY: drawerTranslateY }, { scale: drawerScale }],
            },
          ]}
        >
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.drawerHeaderTitleRow}>
              <View style={styles.headerBagIconWrap}>
                <Icon name="shopping" size={16} color="#077655" />
              </View>
              <Text style={styles.drawerHeaderTitle}>
                Your Wholesale Bag <Text style={styles.drawerHeaderBadge}>({totalItems} pcs)</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.collapseBtn}
              onPress={() => closeDrawer()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="chevron-down" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Items Breakdown */}
          <ScrollView
            style={styles.itemsScrollView}
            contentContainerStyle={styles.itemsScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {items.map((item) => {
              const imgUri = resolveHighResCartImage(item);
              const showGarmentSize = Boolean(item.size) && !isNonFashionWholesaleItem(item);
              return (
                <View key={item.id} style={styles.itemRow}>
                  {/* High-Res Studio Product Thumbnail */}
                  <View style={styles.itemThumbWrapper}>
                    <FastImage
                      source={{ uri: imgUri, priority: FastImage.priority.high }}
                      style={styles.itemThumb as any}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>

                  {/* Product Title & Second-Line Price + Plain Muted QNT = X */}
                  <View style={styles.itemInfoCol}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {cleanCartItemDisplayName(item)}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      {showGarmentSize ? (
                        <View style={styles.itemSizeBadge}>
                          <Text style={styles.itemSizeText}>Size {item.size}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.itemPricePerUnit}>
                        {formatINR(item.price)}/pc
                      </Text>
                      <Text style={styles.qntPlainText}>
                        QNT = {item.quantity}
                      </Text>
                    </View>
                  </View>

                  {/* High-Contrast Emerald Stepper */}
                  <View style={styles.inlineStepper}>
                    <TouchableOpacity
                      style={styles.stepperMinusBtn}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Icon name="minus" size={13} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.stepperCountText}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.stepperPlusBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Icon name="plus" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Drawer Footer with Total & Direct Checkout Button */}
          <View style={styles.drawerFooter}>
            <View style={styles.drawerTotalRow}>
              <Text style={styles.drawerTotalLabel}>Bag Subtotal:</Text>
              <Text style={styles.drawerTotalValue}>{formatINR(totalPrice)}</Text>
            </View>

            <TouchableOpacity
              style={styles.goToCartBtn}
              onPress={() => closeDrawer(navigateToShoppingBag)}
              activeOpacity={0.85}
            >
              <Text style={styles.goToCartBtnText}>View Full Cart & Checkout</Text>
              <Icon name="arrow-right" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Persistent Floating Pill Container */}
      <View style={styles.pillContainer}>
        {/* Upward Chevron Pull-Tab Button */}
        <TouchableOpacity
          style={styles.expandChevronTab}
          onPress={toggleExpand}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 6, left: 16, right: 16 }}
        >
          <View style={styles.chevronTabHandle}>
            <Icon
              name={isExpanded ? 'chevron-down' : 'chevron-up'}
              size={17}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>

        {/* Main Floating Pill Body */}
        <TouchableOpacity
          style={styles.pillBody}
          activeOpacity={0.9}
          onPress={navigateToShoppingBag}
        >
          <View style={styles.leftContent}>
            <View style={styles.imageStack}>
              {displayItems.map((item, index) => {
                const imgUri = resolveHighResCartImage(item);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.imageWrapper,
                      { zIndex: 2 - index, marginLeft: index > 0 ? -11 : 0 },
                    ]}
                  >
                    <FastImage
                      source={{ uri: imgUri, priority: FastImage.priority.high }}
                      style={styles.image as any}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>View cart</Text>
              <Text style={styles.subtitle}>
                {totalItems} items • {formatINR(totalPrice)}
              </Text>
            </View>
          </View>

          <View style={styles.arrowCircle}>
            <Icon name="chevron-right" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 12,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  backdropOverlay: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    backgroundColor: 'rgba(9, 14, 26, 0.58)',
    zIndex: 1,
  },
  backdropPressable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pillContainer: {
    alignItems: 'center',
    zIndex: 3,
  },
  expandChevronTab: {
    backgroundColor: '#055E44',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 3,
    paddingBottom: 2,
    alignSelf: 'center',
    marginBottom: -2,
    zIndex: 1,
    elevation: 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  chevronTabHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
  },
  pillBody: {
    backgroundColor: '#077655',
    borderRadius: 28,
    paddingVertical: 7,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    elevation: 10,
    shadowColor: '#077655',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageStack: {
    flexDirection: 'row',
    marginRight: 9,
  },
  imageWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#E6F4EA',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginLeft: 4,
  },

  // Expanded Crisp Pure White Drawer Styles
  expandedDrawer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
    zIndex: 3,
    elevation: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  drawerHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBagIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  drawerHeaderTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  drawerHeaderBadge: {
    color: '#077655',
    fontWeight: '800',
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsScrollView: {
    maxHeight: 240,
  },
  itemsScrollContent: {
    paddingVertical: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemThumbWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
    marginRight: 10,
  },
  itemThumb: {
    width: '100%',
    height: '100%',
  },
  itemInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSizeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginRight: 6,
  },
  itemSizeText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '700',
  },
  itemPricePerUnit: {
    color: '#077655',
    fontSize: 11.5,
    fontWeight: '700',
    marginRight: 14,
  },
  qntPlainText: {
    color: '#475569', // Soft muted black/charcoal (slightly lower intensity than pure black)
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  inlineStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#077655',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 3,
  },
  stepperMinusBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    minWidth: 18,
    textAlign: 'center',
  },
  stepperPlusBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerFooter: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  drawerTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerTotalLabel: {
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '700',
  },
  drawerTotalValue: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  goToCartBtn: {
    backgroundColor: '#077655',
    borderRadius: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#077655',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  goToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
