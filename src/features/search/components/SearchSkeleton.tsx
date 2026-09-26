import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

interface SearchSkeletonProps {
  count?: number;
}

/**
 * SearchSkeleton: Elegant list placeholder displayed while live catalog search queries DB.
 */
export const SearchSkeleton: React.FC<SearchSkeletonProps> = memo(({ count = 6 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.container}>
      {items.map((key) => (
        <View key={`search_skel_${key}`} style={styles.itemRow}>
          {/* Garment Thumbnail Skeleton */}
          <SkeletonLoader width={64} height={64} borderRadius={10} style={styles.thumbnail} />

          {/* Text Info Column */}
          <View style={styles.infoCol}>
            <SkeletonLoader width={160} height={14} borderRadius={6} style={styles.titleLine} />
            <SkeletonLoader width={100} height={11} borderRadius={5} style={styles.boutiqueLine} />
            <SkeletonLoader width={75} height={14} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
});

SearchSkeleton.displayName = 'SearchSkeleton';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  thumbnail: {
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
  },
  titleLine: {
    marginBottom: 6,
  },
  boutiqueLine: {
    marginBottom: 8,
  },
});
