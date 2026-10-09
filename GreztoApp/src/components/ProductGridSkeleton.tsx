import React, { memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

interface ProductGridSkeletonProps {
  count?: number;
}

/**
 * ProductGridSkeleton: Tier-1 Luxury 2-Column Product Grid Skeleton
 * Matches the exact proportions, padding, and layout of BoutiqueProductCards.
 */
export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = memo(({ count = 6 }) => {
  const { width } = useWindowDimensions();
  const SIDE_PADDING = 8;
  const GAP = 8;
  const cardWidth = Math.floor((width - (SIDE_PADDING * 2) - GAP) / 2);

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.gridContainer}>
      {items.map((key) => (
        <View key={`prod_skel_${key}`} style={[styles.cardWrapper, { width: cardWidth }]}>
          {/* 1. Main Garment Image Box */}
          <SkeletonLoader height={180} borderRadius={12} style={styles.imageBox} />

          {/* 2. Boutique Name Pill */}
          <View style={styles.infoCol}>
            <SkeletonLoader width={80} height={11} borderRadius={6} style={styles.boutiquePill} />

            {/* 3. Product Title Line */}
            <SkeletonLoader width="88%" height={13} borderRadius={6} style={styles.titleLine} />

            {/* 4. Price & Discount Tag Row */}
            <View style={styles.priceRow}>
              <SkeletonLoader width={65} height={16} borderRadius={6} />
              <SkeletonLoader width={48} height={16} borderRadius={6} />
            </View>

            {/* 5. Rating / Fast Delivery Pill */}
            <View style={styles.ratingRow}>
              <SkeletonLoader width={36} height={12} borderRadius={6} />
              <SkeletonLoader width={50} height={12} borderRadius={6} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEBE8',
    marginBottom: 8,
    overflow: 'hidden',
  },
  imageBox: {
    width: '100%',
  },
  infoCol: {
    padding: 10,
  },
  boutiquePill: {
    marginBottom: 6,
  },
  titleLine: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
