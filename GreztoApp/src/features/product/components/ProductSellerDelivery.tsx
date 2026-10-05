import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { SellerInfo, DeliveryDetails, PolicyItem } from '../types';
import { DeliveryAddressModal } from './DeliveryAddressModal';
import { ProductSellerCards } from './ProductSellerCards';
import { useCheckoutStore } from '../../checkout/checkoutStore';

export interface ProductSellerDeliveryProps {
  seller: SellerInfo;
  delivery: DeliveryDetails;
  policies: PolicyItem[];
  onMakeOffer: () => void;
  onSellerPress?: () => void;
}

export const ProductSellerDelivery: React.FC<ProductSellerDeliveryProps> = memo(({
  seller,
  delivery,
  policies,
  onMakeOffer,
  onSellerPress,
}) => {
  const addresses = useCheckoutStore((s) => s.addresses);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [currentPincode, setCurrentPincode] = useState(selectedAddress?.pincode || delivery.pincode);
  const [currentCity, setCurrentCity] = useState(selectedAddress?.cityVillage || delivery.city);

  return (
    <View style={styles.container}>
      {/* 1. Top Dual Action Cards (Seller Store + Send Message with Crisp White Icons) */}
      <ProductSellerCards
        seller={seller}
        onMakeOffer={onMakeOffer}
        onSellerPress={onSellerPress}
      />

      {/* 2. DELIVERY DETAILS Header Row */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <Icon name="truck-delivery-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>DELIVERY DETAILS</Text>
        </View>
        <View style={styles.inStockBadge}>
          <Text style={styles.inStockText}>In Stock</Text>
        </View>
      </View>

      {/* 3. Flipkart-Inspired Two-Row Delivery Details Card (Screenshot 4) */}
      <View style={styles.deliveryDetailsCard}>
        {/* Row 1: Address Row */}
        <TouchableOpacity
          style={styles.deliveryDetailRow}
          onPress={() => setAddressModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.detailIconBox}>
            <Icon
              name={selectedAddress?.addressType === 'WORK' ? 'briefcase-outline' : 'home-outline'}
              size={18}
              color="#1E293B"
            />
          </View>
          <View style={styles.detailTextCol}>
            <Text style={styles.detailTitleText}>
              <Text style={styles.detailTypeHighlight}>
                {selectedAddress?.addressType || 'HOME'}{' '}
              </Text>
              <Text style={styles.detailAddressSnippet} numberOfLines={1} ellipsizeMode="tail">
                {selectedAddress
                  ? `${selectedAddress.houseNoName || ''} ${selectedAddress.nearbyArea || ''} ${selectedAddress.cityVillage || ''}`.trim()
                  : `${delivery.pincode} (${delivery.city})`}
              </Text>
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.detailRowDivider} />

        {/* Row 2: Delivery Date / Timeline Row */}
        <TouchableOpacity
          style={styles.deliveryDetailRow}
          onPress={() => setAddressModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.detailIconBox}>
            <Icon name="truck-fast-outline" size={18} color="#1E293B" />
          </View>
          <View style={styles.detailTextCol}>
            <Text style={styles.detailTitleText}>
              ⚡ Today Delivery{' '}
              <Text style={styles.detailTimeHighlight}>(30–60 Min Express)</Text>
            </Text>
          </View>
          <View style={styles.hyperlocalBadge}>
            <Text style={styles.hyperlocalBadgeText}>HYPERLOCAL</Text>
          </View>
          <Icon name="chevron-right" size={18} color="#94A3B8" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* 4. Fulfilled By Card */}
      <TouchableOpacity
        style={styles.fulfilledCard}
        onPress={onSellerPress}
        activeOpacity={0.75}
      >
        <View style={styles.fulfilledLeft}>
          <Icon name="package-variant-closed" size={20} color="#059669" style={{ marginRight: 10 }} />
          <View style={styles.fulfilledTextCol}>
            <View style={styles.fulfilledNameRow}>
              <Text style={styles.fulfilledLabel}>Fulfilled by </Text>
              <Text style={styles.fulfilledStoreName}>{seller.name}</Text>
              <Icon name="check-decagram" size={14} color="#2563EB" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.dispatchesText}>• {seller.dispatchesIn}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 5. Policy Triplet Row (3 Equal Cards - Exact Match with Screenshot 3) */}
      <View style={styles.policyTripletRow}>
        {/* Card 1: 24h Cancel */}
        <View style={styles.policyCard}>
          <View style={[styles.policyIconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Icon name="clock-time-four-outline" size={18} color="#2563EB" />
          </View>
          <View style={styles.policyHeaderInline}>
            <Text style={styles.policyCardTitle}>24h Cancel</Text>
            <Icon name="information-outline" size={12} color="#94A3B8" style={{ marginLeft: 2 }} />
          </View>
          <Text style={styles.policyCardSubtitle}>Terms Apply</Text>
        </View>

        {/* Card 2: 7-Day Return */}
        <View style={styles.policyCard}>
          <View style={[styles.policyIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Icon name="restore" size={18} color="#059669" />
          </View>
          <View style={styles.policyHeaderInline}>
            <Text style={styles.policyCardTitle}>7-Day Return</Text>
            <Icon name="information-outline" size={12} color="#94A3B8" style={{ marginLeft: 2 }} />
          </View>
          <Text style={styles.policyCardSubtitle}>Free Pick-up</Text>
        </View>

        {/* Card 3: Cash on Delivery */}
        <View style={styles.policyCard}>
          <View style={[styles.policyIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="cash" size={18} color="#D97706" />
          </View>
          <View style={styles.policyHeaderInline}>
            <Text style={styles.policyCardTitle}>Cash on Delivery</Text>
            <Icon name="information-outline" size={12} color="#94A3B8" style={{ marginLeft: 2 }} />
          </View>
          <Text style={styles.policyCardSubtitle}>Available</Text>
        </View>
      </View>

      {/* Mitreno Full Delivery Address Modal - Lazy Mount on Demand */}
      {addressModalVisible && (
        <DeliveryAddressModal
          visible={addressModalVisible}
          onClose={() => setAddressModalVisible(false)}
          onSelectAddress={(addr) => {
            setCurrentPincode(addr.pincode);
            setCurrentCity(addr.cityVillage);
          }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  inStockBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inStockText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  deliveryDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 10,
  },
  deliveryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailTextCol: {
    flex: 1,
    marginRight: 8,
  },
  detailTitleText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  detailTypeHighlight: {
    fontWeight: '800',
    color: '#0F172A',
  },
  detailAddressSnippet: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  detailTimeHighlight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  detailRowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 44,
  },
  hyperlocalBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hyperlocalBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.4,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  fulfilledCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  fulfilledLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fulfilledTextCol: {
    flex: 1,
  },
  fulfilledNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fulfilledLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  fulfilledStoreName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  dispatchesText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  policyTripletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  policyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 96,
  },
  policyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  policyHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  policyCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 13,
  },
  policyCardSubtitle: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pincodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
  },
  applyBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
