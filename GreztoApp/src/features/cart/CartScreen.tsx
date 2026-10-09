import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Text, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EmptyState } from '../../components/EmptyState';
import { SecondaryHeader } from '../../components/SecondaryHeader';
import { useCartStore } from './cartStore';
import { colors } from '../../theme/colors';
import { formatINR } from '../../utils/formatters';

export const CartScreen = memo(() => {
  const navigation = useNavigation<any>();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );
  
  const deliveryCharge = 35;
  const toPay = totalPrice + deliveryCharge;

  return (
    <View style={styles.container}>
      <SecondaryHeader topTitle="MY CART" bottomTitle="SHOPPING BAG" bottomTitleColor="#1a2b4c" />
      
      {totalItems === 0 ? (
        <EmptyState
          iconName="cart-outline"
          title="Your Bag is Empty"
          subtitle="Explore curated deals from verified boutiques and add your favorite pieces!"
          buttonTitle="EXPLORE BOUTIQUES"
          onButtonPress={() => navigation.navigate('ExploreTab')}
        />
      ) : (
        <>
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemImageContainer}>
                  <FastImage source={{ uri: item.image }} style={styles.itemImage as any} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  {Boolean(item.size) && (
                    <Text style={styles.itemSizeBadge}>Size: {item.size}</Text>
                  )}
                  <Text style={styles.itemUnitPrice}>{formatINR(item.price)} / pc</Text>
                  <Text style={styles.itemTotal}>{formatINR(item.price * item.quantity)}</Text>
                </View>
                <View style={styles.actionContainer}>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.stepperBtn}>
                      <Text style={styles.stepperText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.stepperBtn}>
                      <Text style={styles.stepperText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                    <Icon name="trash-can-outline" size={20} color={colors.accentRed} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ITEMS TOTAL</Text>
                <Text style={styles.summaryValue}>{formatINR(totalPrice)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>DELIVERY CHARGES</Text>
                <Text style={styles.summaryValue}>{formatINR(deliveryCharge)}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.toPayLabel}>TO PAY</Text>
                <Text style={styles.toPayValue}>{formatINR(toPay)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.checkoutBtn} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Icon name="flash" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.checkoutText}>CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSizeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  itemUnitPrice: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 14,
    color: '#006d4e',
    fontWeight: 'bold',
  },
  actionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 65,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006d4e',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepperValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    minWidth: 16,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  summarySection: {
    marginTop: 16,
    paddingVertical: 24,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  toPayLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  toPayValue: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '900',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  checkoutBtn: {
    backgroundColor: '#00b37e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
