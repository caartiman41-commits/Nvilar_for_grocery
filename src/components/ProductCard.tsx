import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatINR } from '../utils/formatters';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  boutiqueName?: string;
  rating?: number;
  reviewCount?: number;
  freeDelivery?: boolean;
  onPress?: () => void;
  onBargain?: () => void;
  onBuy?: () => void;
  onAdd?: () => void;
  cartQuantity?: number;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({
  name,
  price,
  originalPrice,
  image,
  boutiqueName = 'Mitreno.com',
  rating = 4.8,
  reviewCount,
  freeDelivery = true,
  onPress,
  onBargain,
  onBuy,
  onAdd,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Derive original price if not explicitly provided
  const strikethroughPrice = originalPrice || Math.round(price * 1.4);

  // Deterministic review count fallback if not provided
  const displayReviewCount = reviewCount || Math.floor(((price % 400) + 72) * 1.5);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* 3:4 Vertical Portrait Image Container */}
      <View style={styles.imageContainer}>
        <FastImage 
          source={{
            uri: image,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }} 
          style={styles.image as any} 
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* Top-Right Floating Wishlist / Heart Button */}
        <TouchableOpacity 
          style={styles.heartBtn} 
          onPress={() => setIsFavorite(!isFavorite)}
          activeOpacity={0.8}
        >
          <Icon 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={18} 
            color={isFavorite ? '#DC2626' : '#2B1D1D'} 
          />
        </TouchableOpacity>

        {/* Bottom-Left Dark Rating & Reviews Pill Badge */}
        <View style={styles.ratingBadge}>
          <Icon name="star" size={10} color="#FBBF24" style={{ marginRight: 3 }} />
          <Text style={styles.ratingBadgeText}>
            {Number(rating).toFixed(1)} <Text style={styles.reviewCountText}>({displayReviewCount})</Text>
          </Text>
        </View>
      </View>

      {/* Info Container below image */}
      <View style={styles.infoContainer}>
        {/* Boutique Domain */}
        <View style={styles.boutiqueRow}>
          <Text style={styles.boutiqueName} numberOfLines={1}>
            {boutiqueName}
          </Text>
        </View>

        {/* Product Title in Luxury Serif */}
        <Text style={styles.productTitle} numberOfLines={1}>
          {name}
        </Text>

        {/* Price Row: Deal Price + Original Strike-through */}
        <View style={styles.priceRow}>
          <Text style={styles.dealPrice}>{formatINR(price)}</Text>
          <Text style={styles.strikethroughPrice}>{formatINR(strikethroughPrice)}</Text>
        </View>

        {/* Free Delivery Label (without redundant Deal Price pill) */}
        {freeDelivery && (
          <View style={styles.deliveryRow}>
            <Text style={styles.freeDeliveryText}>Free Delivery</Text>
          </View>
        )}

        {/* Dual Actions Row: BARGAIN (Left, Clean White) & BUY (Right, Rich Crimson-Wine Burgundy) */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.bargainBtn} 
            onPress={onBargain || onAdd}
            activeOpacity={0.85}
          >
            <Icon name="message-text-outline" size={13} color="#0F172A" style={{ marginRight: 4 }} />
            <Text style={styles.bargainBtnText}>BARGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buyBtn} 
            onPress={onBuy || onAdd}
            activeOpacity={0.85}
          >
            <Text style={styles.buyBtnText}>BUY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.84, // ~3:4 Portrait vertical ratio
    position: 'relative',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 14, 14, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  reviewCountText: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },
  boutiqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  boutiqueName: {
    fontSize: 11,
    color: '#735C52',
    fontWeight: '600',
    flex: 1,
  },
  productTitle: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 13,
    color: colors.burgundy,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  dealPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.burgundy,
  },
  strikethroughPrice: {
    fontSize: 11,
    color: '#9C8C85',
    textDecorationLine: 'line-through',
    marginLeft: 6,
    fontWeight: '500',
  },
  deliveryRow: {
    marginBottom: 6,
  },
  freeDeliveryText: {
    color: colors.verifiedGreen,
    fontSize: 10,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bargainBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8CDC0',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  bargainBtnText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  buyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7A1A2E', // Rich, vibrant royal wine burgundy (visible from afar, not overly dark)
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 16,
    shadowColor: '#7A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
