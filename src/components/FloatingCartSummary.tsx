import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { useCartStore } from '../features/cart/cartStore';

export const FloatingCartSummary = ({ onPress }: any) => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0) return null;
  const displayItems = items.slice(0, 3);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.leftContent}>
        <View style={styles.imageStack}>
          {displayItems.map((item, index) => (
            <View key={item.id} style={[styles.imageWrapper, { zIndex: 3 - index, marginLeft: index > 0 ? -12 : 0 }]}>
              <FastImage source={{ uri: item.image }} style={styles.image as any} />
            </View>
          ))}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>View Bag</Text>
          <Text style={styles.subtitle}>{totalItems} items • ₹{totalPrice}</Text>
        </View>
      </View>
      <View style={styles.arrowCircle}>
        <Icon name="chevron-right" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#3B111A',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageStack: {
    flexDirection: 'row',
    marginRight: 12,
  },
  imageWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#3B111A',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: 38,
    height: 38,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  subtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 4,
  }
});
