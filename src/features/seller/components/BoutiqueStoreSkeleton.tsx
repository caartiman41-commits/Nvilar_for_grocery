import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { ProductGridSkeleton } from '../../../components/ProductGridSkeleton';

/**
 * BoutiqueStoreSkeleton: High-Fashion Boutique Profile & Showroom Skeleton
 * Renders when fetching boutique store details, seller profile, and products from DB.
 */
export const BoutiqueStoreSkeleton: React.FC<{ paddingTop?: number }> = memo(({ paddingTop = 0 }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Top Cover Banner Skeleton */}
      <View style={[styles.coverContainer, { paddingTop }]}>
        <SkeletonLoader height={190} borderRadius={0} style={styles.coverSkeleton} />
      </View>

      {/* 2. Overlapping Circular Avatar & Top Info */}
      <View style={styles.profileHeaderBox}>
        <View style={styles.avatarRow}>
          <SkeletonLoader width={76} height={76} borderRadius={38} style={styles.avatarCircle} />
          <View style={styles.headerActionRow}>
            <SkeletonLoader width={100} height={36} borderRadius={18} />
            <SkeletonLoader width={40} height={36} borderRadius={18} />
          </View>
        </View>

        {/* Boutique Name & Verification Pill */}
        <View style={styles.nameRow}>
          <SkeletonLoader width={170} height={22} borderRadius={8} />
          <SkeletonLoader width={65} height={20} borderRadius={10} />
        </View>

        {/* Category & City */}
        <SkeletonLoader width={210} height={13} borderRadius={6} style={styles.categoryLine} />

        {/* Bio lines */}
        <SkeletonLoader width="92%" height={12} borderRadius={6} style={styles.bioLine} />
        <SkeletonLoader width="70%" height={12} borderRadius={6} style={styles.bioLine} />

        {/* 3. Three Metric Stats Cards (Products, Followers, Rating) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <SkeletonLoader width={35} height={18} borderRadius={6} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={55} height={10} borderRadius={5} />
          </View>
          <View style={styles.statBox}>
            <SkeletonLoader width={45} height={18} borderRadius={6} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={60} height={10} borderRadius={5} />
          </View>
          <View style={styles.statBox}>
            <SkeletonLoader width={38} height={18} borderRadius={6} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={50} height={10} borderRadius={5} />
          </View>
        </View>

        {/* 4. Tab Selector Bar */}
        <View style={styles.tabSelectorBar}>
          <SkeletonLoader width="48%" height={38} borderRadius={10} />
          <SkeletonLoader width="48%" height={38} borderRadius={10} />
        </View>
      </View>

      {/* 5. 2-Column Garment Showroom Grid Skeleton */}
      <ProductGridSkeleton count={4} />
    </ScrollView>
  );
});

BoutiqueStoreSkeleton.displayName = 'BoutiqueStoreSkeleton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  coverContainer: {
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  coverSkeleton: {
    width: '100%',
  },
  profileHeaderBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -38,
    marginBottom: 12,
  },
  avatarCircle: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryLine: {
    marginBottom: 10,
  },
  bioLine: {
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  tabSelectorBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
