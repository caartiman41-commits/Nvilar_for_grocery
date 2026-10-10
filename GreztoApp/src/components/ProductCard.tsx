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
  minOrder?: number;
  image: string;
  boutiqueName?: string;
  rating?: number;
  reviewCount?: number;
  freeDelivery?: boolean;
  inStock?: boolean;
  onPress?: () => void;
  onBoutiquePress?: () => void;
  onBargain?: () => void;
  onBuy?: () => void;
  onAdd?: () => void;
  cartQuantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({
  id,
  name,
  price,
  originalPrice,
  minOrder = 6,
  image,
  boutiqueName = 'Mitreno.com',
  rating = 4.8,
  reviewCount,
  freeDelivery = true,
  inStock = true,
  cartQuantity = 0,
  onPress,
  onBoutiquePress,
  onBargain,
  onBuy,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  // Deterministic review count fallback if not provided
  const displayReviewCount = reviewCount || Math.floor(((price % 400) + 72) * 1.5);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Image Container */}
      <View
        style={[
          styles.imageContainer,
          image?.includes('bing.net') && { backgroundColor: '#FFFFFF', padding: 6 },
        ]}
      >
        <FastImage 
          source={{
            uri: image,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }} 
          style={styles.image as any} 
          resizeMode={
            image?.includes('bing.net')
              ? FastImage.resizeMode.contain
              : FastImage.resizeMode.cover
          }
        />

        {/* Bottom-Left Clean White Rating & Reviews Pill Badge */}
        <View style={styles.ratingBadge}>
          <Icon name="star" size={10} color="#F59E0B" style={{ marginRight: 3 }} />
          <Text style={styles.ratingBadgeText}>
            {Number(rating).toFixed(1)} <Text style={styles.reviewCountText}>({displayReviewCount})</Text>
          </Text>
        </View>

        {/* Semi-transparent Out of Stock Overlay on Image */}
        {!inStock && (
          <View style={styles.outOfStockImageOverlay}>
            <View style={styles.outOfStockBadgePill}>
              <Text style={styles.outOfStockBadgeText}>OUT OF STOCK</Text>
            </View>
          </View>
        )}
      </View>

      {/* Info Container below image */}
      <View style={styles.infoContainer}>
        {/* Boutique Domain */}
        {onBoutiquePress ? (
          <TouchableOpacity
            style={styles.boutiqueRow}
            onPress={onBoutiquePress}
            activeOpacity={0.7}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={styles.boutiqueName} numberOfLines={1}>
              {boutiqueName}
            </Text>
            <Icon name="chevron-right" size={11} color="#94A3B8" />
          </TouchableOpacity>
        ) : (
          <View style={styles.boutiqueRow}>
            <Text style={styles.boutiqueName} numberOfLines={1}>
              {boutiqueName}
            </Text>
          </View>
        )}

        {/* Product Title in Luxury Serif */}
        <Text style={styles.productTitle} numberOfLines={1}>
          {name}
        </Text>

        {/* Price Row: Deal Price + Inline Pieces Count (e.g. ₹1,899 /pc • 6 pcs) */}
        <View style={styles.priceRow}>
          <Text style={styles.dealPrice}>
            {formatINR(price)} <Text style={styles.unitText}>/pc</Text>
          </Text>
          <Text style={styles.piecesText}>• {minOrder} pcs</Text>
        </View>

        {/* Actions Row: If Out of Stock, display disabled pill; otherwise BARGAIN & ADD / STEPPER buttons */}
        {!inStock ? (
          <View style={styles.outOfStockActionRow}>
            <View style={styles.outOfStockActionBtn}>
              <Icon name="close-circle-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
              <Text style={styles.outOfStockActionText}>Out of Stock</Text>
            </View>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.bargainBtn} 
              onPress={onBargain}
              activeOpacity={0.8}
            >
              <Icon name="message-text-outline" size={11.5} color="#334155" style={{ marginRight: 4 }} />
              <Text style={styles.bargainBtnText}>BARGAIN</Text>
            </TouchableOpacity>

            {cartQuantity > 0 ? (
              <View style={styles.addedStepperPill}>
                <TouchableOpacity
                  style={styles.stepperActionBtn}
                  onPress={onDecrement}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="minus" size={13} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.stepperQtyText}>{cartQuantity}</Text>
                <TouchableOpacity
                  style={styles.stepperActionBtn}
                  onPress={onIncrement || onAdd}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="plus" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.buyBtn} 
                onPress={onAdd || onBuy}
                activeOpacity={0.85}
              >
                <Text style={styles.buyBtnText}>ADD</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6F5F1', // Warm Studio Cream (Exact Nvilar Wall Print tone)
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E2D8', // Soft Linen Hairline
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#1E1B18',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1.5,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.1, // Balanced ratio for expansive horizontal cards
    position: 'relative',
    backgroundColor: '#EDEAE4',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    paddingHorizontal: 6.5,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  reviewCountText: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: '#F6F5F1',
  },
  boutiqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  boutiqueName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.1,
    flex: 1,
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  dealPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: colors.burgundy,
  },
  unitText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  piecesText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B', // Same muted intensity as /pc
    marginLeft: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  bargainBtn: {
    flex: 1.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEECE6', // Soft Warm Studio Cream pill
    borderWidth: 1,
    borderColor: '#E2DDD4', // Harmonious warm linen border
    paddingVertical: 6.5,
    paddingHorizontal: 6,
    borderRadius: 14,
  },
  bargainBtnText: {
    color: '#334155', // Slate-700
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E50914', // Pure Vibrant Warm Red
    paddingVertical: 6.5,
    paddingHorizontal: 6,
    borderRadius: 14,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.48,
    shadowRadius: 6,
    elevation: 4,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  addedStepperPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D7B48', // Clean Light-Dark Forest Green when item added
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  stepperActionBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQtyText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  outOfStockImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadgePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  outOfStockBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  outOfStockActionRow: {
    marginTop: 2,
    width: '100%',
  },
  outOfStockActionBtn: {
    height: 30,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockActionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
});
