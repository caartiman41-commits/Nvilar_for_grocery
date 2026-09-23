import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SAMPLE_PRODUCTS } from '../productData';
import { ProductDetailItem } from '../types';
import { formatINR } from '../../../utils/formatters';

export interface ProductRecommendationsProps {
  currentProductId: string;
  onProductPress: (product: ProductDetailItem) => void;
  onViewAll?: () => void;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = memo(({
  currentProductId,
  onProductPress,
  onViewAll,
}) => {
  const allProducts = Object.values(SAMPLE_PRODUCTS).filter(
    (item) => item.id !== currentProductId
  );

  // Divide into Section 1 (Similar Outfits) and Section 2 (More Products)
  const similarProducts = allProducts.slice(0, 8);
  const moreProducts = allProducts.length > 8 ? allProducts.slice(8) : allProducts;

  return (
    <View style={styles.container}>
      {/* SECTION 1: SIMILAR OUTFITS */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.sectionMainTitle}>SIMILAR OUTFITS</Text>
          <Text style={styles.sectionSubtitle}>Curated recommendations for you</Text>
        </View>
        <TouchableOpacity
          onPress={onViewAll}
          activeOpacity={0.7}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollList}
        overScrollMode="never"
      >
        {similarProducts.map((product) => {
          const discount = product.discountPercent || Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
          );
          const sellerName = product.seller?.name || product.boutiqueTag || 'BOUTIQUE';

          return (
            <TouchableOpacity
              key={`similar_${product.id}`}
              style={styles.cardContainer}
              onPress={() => onProductPress(product)}
              activeOpacity={0.75}
            >
              {/* Product Image with Discount Badge */}
              <View style={styles.imageWrapper}>
                <FastImage
                  source={{
                    uri: product.images[0],
                    priority: FastImage.priority.normal,
                  }}
                  style={styles.productImage as any}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>↓{discount}%</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.cardDetails}>
                <Text style={styles.boutiqueName} numberOfLines={1}>
                  {sellerName.toUpperCase()}
                </Text>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {product.name.toUpperCase()}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>{formatINR(product.price)}</Text>
                  {product.originalPrice > product.price && (
                    <Text style={styles.originalPrice}>
                      {formatINR(product.originalPrice)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Subtle Warm Divider */}
      <View style={styles.sectionDivider} />

      {/* SECTION 2: MORE PRODUCTS YOU MAY LIKE */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerTitleCol}>
          <View style={styles.sparkleTitleRow}>
            <Icon name="creation" size={17} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.sectionMainTitle}>MORE PRODUCTS YOU MAY LIKE</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Explore all trending outfits in collection</Text>
        </View>
        <View style={styles.itemCountPill}>
          <Text style={styles.itemCountText}>{moreProducts.length} Items</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollList}
        overScrollMode="never"
      >
        {moreProducts.map((product) => {
          const sellerName = product.seller?.name || product.boutiqueTag || 'BOUTIQUE';

          return (
            <TouchableOpacity
              key={`more_${product.id}`}
              style={styles.cardContainer}
              onPress={() => onProductPress(product)}
              activeOpacity={0.75}
            >
              {/* Product Image with Dual Badges (Today + VERIFIED) */}
              <View style={styles.imageWrapper}>
                <FastImage
                  source={{
                    uri: product.images[0],
                    priority: FastImage.priority.normal,
                  }}
                  style={styles.productImage as any}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {/* Floating Dual Badges matching Screenshot */}
                <View style={styles.dualBadgeContainer}>
                  <View style={styles.todayBadge}>
                    <Icon name="lightning-bolt" size={11} color="#059669" />
                    <Text style={styles.todayBadgeText}>Today</Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                  </View>
                </View>
              </View>

              {/* Product Info */}
              <View style={styles.cardDetails}>
                <Text style={styles.boutiqueName} numberOfLines={1}>
                  {sellerName.toUpperCase()}
                </Text>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {product.name.toUpperCase()}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>{formatINR(product.price)}</Text>
                  {product.originalPrice > product.price && (
                    <Text style={styles.originalPrice}>
                      {formatINR(product.originalPrice)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    paddingBottom: 24,
    backgroundColor: '#FDFBF7', // Subtle warm luxury canvas
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  sparkleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  viewAllText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  itemCountPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  horizontalScrollList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 6,
  },
  cardContainer: {
    width: 152,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE8DE', // Subtle warm border
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  imageWrapper: {
    width: 152,
    height: 188,
    backgroundColor: '#F1EBE1',
    position: 'relative',
  },
  productImage: {
    width: 152,
    height: 188,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#15803D', // Vibrant Green matching Screenshot
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  dualBadgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  todayBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
    marginRight: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  cardDetails: {
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  boutiqueName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
  },
  currentPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
    fontWeight: '500',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F7F3EB', // Soft warm band divider
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EFE8DE',
    marginVertical: 18,
  },
});
