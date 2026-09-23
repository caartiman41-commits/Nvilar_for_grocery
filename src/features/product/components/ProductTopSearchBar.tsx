import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCartStore } from '../../cart/cartStore';

export interface ProductTopSearchBarProps {
  onBack: () => void;
  onSearch: () => void;
  onCartPress: () => void;
  translateY?: Animated.AnimatedInterpolation<number> | Animated.Value;
}

export const ProductTopSearchBar: React.FC<ProductTopSearchBarProps> = memo(({
  onBack,
  onSearch,
  onCartPress,
  translateY,
}) => {
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const containerStyle = [
    styles.container,
    { paddingTop: Math.max(insets.top, 12) },
    translateY ? { transform: [{ translateY }] } : null,
  ];

  return (
    <Animated.View style={containerStyle}>
      {/* 1. Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="arrow-left" size={24} color="#0F172A" />
      </TouchableOpacity>

      {/* 2. Search Pill Input matching Flipkart screenshot */}
      <TouchableOpacity
        style={styles.searchPill}
        onPress={onSearch}
        activeOpacity={0.85}
      >
        <Icon name="magnify" size={19} color="#64748B" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Search for products...</Text>
      </TouchableOpacity>

      {/* 3. Shopping Bag / Cart Button with Live Badge */}
      <TouchableOpacity
        style={styles.cartBtn}
        onPress={onCartPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="shopping-outline" size={23} color="#0F172A" />
        {totalCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {totalCount > 99 ? '99+' : totalCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF6F0', // Subtle warm background matching app palette
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 9,
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  backBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPill: {
    flex: 1,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cartBtn: {
    padding: 6,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: '#E11D48',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FAF6F0',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
