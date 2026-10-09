import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { useCartStore } from '../features/cart/cartStore';
import { formatINR } from '../utils/formatters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface FloatingCartSummaryProps {
  onPress?: () => void;
  bottomOffset?: number;
}

export const FloatingCartSummary = memo(({ onPress, bottomOffset = 12 }: FloatingCartSummaryProps) => {
  const { width } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  if (totalItems === 0) return null;
  const displayItems = items.slice(0, 2);

  const containerWidth = Math.min(width - 28, 350);

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset, zIndex: 9999 }]}>
      {/* Expanded Quick-Peek Wholesale Drawer */}
      {isExpanded && (
        <View style={[styles.expandedDrawer, { width: containerWidth }]}>
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.drawerHeaderTitleRow}>
              <Icon name="shopping" size={17} color="#A7F3D0" style={{ marginRight: 6 }} />
              <Text style={styles.drawerHeaderTitle}>
                Your Wholesale Bag <Text style={styles.drawerHeaderBadge}>({totalItems} pcs)</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.collapseBtn}
              onPress={toggleExpand}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="chevron-down" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Items Breakdown */}
          <ScrollView
            style={styles.itemsScrollView}
            contentContainerStyle={styles.itemsScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {/* Thumbnail */}
                <View style={styles.itemThumbWrapper}>
                  <FastImage source={{ uri: item.image }} style={styles.itemThumb as any} />
                </View>

                {/* Info */}
                <View style={styles.itemInfoCol}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    {item.size ? (
                      <View style={styles.itemSizeBadge}>
                        <Text style={styles.itemSizeText}>Size {item.size}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.itemPricePerUnit}>
                      {formatINR(item.price)}/pc
                    </Text>
                  </View>
                </View>

                {/* Inline Mini Wholesale Stepper */}
                <View style={styles.inlineStepper}>
                  <TouchableOpacity
                    style={styles.stepperMinusBtn}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Icon
                      name="minus"
                      size={13}
                      color="#FFFFFF"
                    />
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
            ))}
          </ScrollView>

          {/* Drawer Footer with Total & Direct Checkout Button */}
          <View style={styles.drawerFooter}>
            <View style={styles.drawerTotalRow}>
              <Text style={styles.drawerTotalLabel}>Bag Subtotal:</Text>
              <Text style={styles.drawerTotalValue}>{formatINR(totalPrice)}</Text>
            </View>

            <TouchableOpacity
              style={styles.goToCartBtn}
              onPress={() => {
                toggleExpand();
                onPress?.();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.goToCartBtnText}>View Full Cart & Checkout</Text>
              <Icon name="arrow-right" size={15} color="#064E3B" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Persistent Floating Pill Container */}
      <View style={styles.pillContainer}>
        {/* Upward Chevron Pull-Tab Button (Exact Arrow Sign requested by user) */}
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
          onPress={onPress}
        >
          <View style={styles.leftContent}>
            <View style={styles.imageStack}>
              {displayItems.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.imageWrapper,
                    { zIndex: 2 - index, marginLeft: index > 0 ? -11 : 0 },
                  ]}
                >
                  <FastImage source={{ uri: item.image }} style={styles.image as any} />
                </View>
              ))}
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
    right: 14,
    alignItems: 'flex-end',
  },
  pillContainer: {
    alignItems: 'center',
  },
  expandChevronTab: {
    backgroundColor: '#055E44', // Darker emerald tab protruding from top
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chevronTabHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
  },
  pillBody: {
    backgroundColor: '#077655', // Vibrant sharp emerald green
    borderRadius: 28,
    paddingVertical: 7,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    elevation: 8,
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
  },
  image: {
    width: 32,
    height: 32,
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

  // Expanded Drawer Styles
  expandedDrawer: {
    backgroundColor: '#064E3B', // Luxury deep emerald container
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    elevation: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 8,
  },
  drawerHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  drawerHeaderBadge: {
    color: '#A7F3D0',
    fontWeight: '700',
  },
  collapseBtn: {
    padding: 2,
  },
  itemsScrollView: {
    maxHeight: 220,
  },
  itemsScrollContent: {
    paddingVertical: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemThumbWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 8,
  },
  itemThumb: {
    width: 36,
    height: 36,
  },
  itemInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemSizeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  itemSizeText: {
    color: '#E6F4EA',
    fontSize: 10,
    fontWeight: '700',
  },
  itemPricePerUnit: {
    color: '#93C5FD',
    fontSize: 10.5,
    fontWeight: '600',
  },
  inlineStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  stepperMinusBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 18,
    textAlign: 'center',
  },
  stepperPlusBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  drawerTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerTotalLabel: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '600',
  },
  drawerTotalValue: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
  goToCartBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goToCartBtnText: {
    color: '#064E3B',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
