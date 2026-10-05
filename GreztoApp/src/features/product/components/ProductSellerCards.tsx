import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface ProductSellerCardsProps {
  seller: {
    name: string;
    rating: number;
    handle?: string;
    verified?: boolean;
  };
  onMakeOffer: () => void;
  onSellerPress?: () => void;
}

export const ProductSellerCards: React.FC<ProductSellerCardsProps> = memo(({
  seller,
  onMakeOffer,
  onSellerPress,
}) => {
  const ratingValue = (typeof seller?.rating === 'number' ? seller.rating : 4.8).toFixed(1);
  const sellerName = seller?.name || 'Luxury Boutique';

  return (
    <View style={styles.container}>
      {/* Left Card: Seller Store */}
      <TouchableOpacity
        style={styles.card}
        onPress={onSellerPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Seller Store: ${sellerName}, rated ${ratingValue} stars`}
      >
        <View style={styles.storeIconBox}>
          <Icon name="storefront-outline" size={19} color="#047857" />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.topRow}>
            <Text style={styles.sellerTitle}>Seller Store</Text>
            <Icon name="shield-check" size={14} color="#059669" style={styles.verifiedIcon} />
          </View>
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{ratingValue} ★</Text>
            </View>
            <Text style={styles.storeName} numberOfLines={1} ellipsizeMode="tail">
              {sellerName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Right Card: Send Message */}
      <TouchableOpacity
        style={styles.card}
        onPress={onMakeOffer}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Send Message for make offer"
      >
        <View style={styles.chatIconBox}>
          <Icon name="chat-processing-outline" size={19} color="#1D4ED8" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.messageTitle}>Send Message</Text>
          <Text style={styles.offerSubtitle}>for make offer 🎉</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 0,
    marginTop: 4,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 50,
  },
  storeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sellerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedIcon: {
    marginLeft: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  storeName: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  messageTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 1,
  },
  offerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});

export default ProductSellerCards;
