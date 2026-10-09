import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { useCartStore } from '../features/cart/cartStore';

export const FloatingCartSummary = memo(({ onPress }: any) => {
  const items = useCartStore((s) => s.items);
  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  if (totalItems === 0) return null;
  const displayItems = items.slice(0, 2);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.leftContent}>
        <View style={styles.imageStack}>
          {displayItems.map((item, index) => (
            <View key={item.id} style={[styles.imageWrapper, { zIndex: 2 - index, marginLeft: index > 0 ? -11 : 0 }]}>
              <FastImage source={{ uri: item.image }} style={styles.image as any} />
            </View>
          ))}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>View cart</Text>
          <Text style={styles.subtitle}>{totalItems} items • ₹{totalPrice}</Text>
        </View>
      </View>
      <View style={styles.arrowCircle}>
        <Icon name="chevron-right" size={18} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: '#077655', // Sharp vibrant emerald green per user screenshot
    borderRadius: 28,
    paddingVertical: 7,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    elevation: 8,
    shadowColor: '#077655', // Soft green glow shadow per user directive
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
    borderColor: '#FFFFFF', // Clean white border around thumbnail circles
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
});
