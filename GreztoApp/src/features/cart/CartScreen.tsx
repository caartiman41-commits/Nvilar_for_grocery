import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Text, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EmptyState } from '../../components/EmptyState';
import { SecondaryHeader } from '../../components/SecondaryHeader';
import {
  resolveHighResCartImage,
  isNonFashionWholesaleItem,
  cleanCartItemDisplayName,
} from '../../components/FloatingCartSummary';
import { useCartStore } from './cartStore';
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
      <SecondaryHeader topTitle="MY CART" bottomTitle="SHOPPING BAG" bottomTitleColor="#0F172A" />

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
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => {
              const highResUri = resolveHighResCartImage(item);
              const showGarmentSize = Boolean(item.size) && !isNonFashionWholesaleItem(item);
              const cleanUnitBadge =
                !showGarmentSize &&
                item.unitLabel &&
                !item.unitLabel.toLowerCase().startsWith('size ')
                  ? item.unitLabel
                  : null;
              return (
                <View key={item.id} style={styles.cartItem}>
                  {/* High-Res Studio Product Image */}
                  <View style={styles.itemImageContainer}>
                    <FastImage
                      source={{
                        uri: highResUri,
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.web,
                      }}
                      style={styles.itemImage as any}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>

                  {/* Product Title & Lower Price + Plain Muted QNT = X Row */}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {cleanCartItemDisplayName(item)}
                    </Text>
                    <View style={styles.unitMetaRow}>
                      {showGarmentSize ? (
                        <Text style={styles.itemSizeBadge}>Size: {item.size}</Text>
                      ) : cleanUnitBadge ? (
                        <Text style={styles.itemSizeBadge}>{cleanUnitBadge}</Text>
                      ) : null}
                      <Text style={styles.itemUnitPrice}>{formatINR(item.price)} / pc</Text>
                    </View>
                    <View style={styles.priceAndQntBottomRow}>
                      <Text style={styles.itemTotal}>{formatINR(item.price * item.quantity)}</Text>
                      <Text style={styles.qntPlainLabel}>QNT = {item.quantity}</Text>
                    </View>
                  </View>

                  {/* Stepper & Delete Actions */}
                  <View style={styles.actionContainer}>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        style={styles.stepperBtn}
                        activeOpacity={0.75}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Icon name="minus" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.stepperBtn}
                        activeOpacity={0.75}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Icon name="plus" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.deleteBtn}
                      activeOpacity={0.75}
                    >
                      <Icon name="trash-can-outline" size={18} color="#E11D48" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ITEMS TOTAL ({totalItems} PCS)</Text>
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
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Icon name="flash" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.checkoutText}>CHECKOUT ({formatINR(toPay)})</Text>
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
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  itemName: {
    fontSize: 13.2,
    color: '#0F172A',
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 3,
  },
  unitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  itemSizeBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E40AF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemUnitPrice: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  priceAndQntBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  itemTotal: {
    fontSize: 14.5,
    color: '#077655',
    fontWeight: '900',
  },
  qntPlainLabel: {
    fontSize: 12,
    color: '#475569', // Soft muted black/charcoal (slightly lower intensity than pure black)
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  actionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#077655',
    borderRadius: 18,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  stepperBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stepperValue: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    minWidth: 18,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FFF1F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  summarySection: {
    marginTop: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  toPayLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toPayValue: {
    fontSize: 19,
    color: '#077655',
    fontWeight: '900',
  },
  footer: {
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  checkoutBtn: {
    backgroundColor: '#077655',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#077655',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
