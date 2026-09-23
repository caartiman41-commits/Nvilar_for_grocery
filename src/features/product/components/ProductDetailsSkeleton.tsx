import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const ProductDetailsSkeleton: React.FC = memo(() => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      {/* 1. Seller Store Dual Cards Skeleton */}
      <View style={styles.dualCardsRow}>
        <View style={styles.halfCard} />
        <View style={styles.halfCard} />
      </View>

      {/* 3. Delivery Details Card Skeleton */}
      <View style={styles.deliveryCard}>
        <View style={styles.textLineLong} />
        <View style={styles.dividerLine} />
        <View style={styles.textLineMedium} />
      </View>

      {/* 4. Policy Triplet Skeleton */}
      <View style={styles.policyRow}>
        <View style={styles.policyCard} />
        <View style={styles.policyCard} />
        <View style={styles.policyCard} />
      </View>

      {/* 5. Specifications Grid Skeleton */}
      <View style={styles.specsSection}>
        <View style={styles.specsHeaderLine} />
        <View style={styles.specsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={`spec_skel_${i}`} style={styles.specBoxWrapper}>
              <View style={styles.specBox} />
            </View>
          ))}
        </View>
      </View>

      {/* 6. Recommendations Carousel Skeleton */}
      <View style={styles.recomSection}>
        <View style={styles.recomHeaderLine} />
        <View style={styles.recomRow}>
          {[1, 2, 3].map((i) => (
            <View key={`rec_skel_${i}`} style={styles.recomCard} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
});

ProductDetailsSkeleton.displayName = 'ProductDetailsSkeleton';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginTop: 8,
    paddingBottom: 40,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    padding: 14,
    marginBottom: 10,
  },
  headerLine: {
    width: 140,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EAE4DC',
    marginBottom: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizePill: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAE4DC',
  },
  dualCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  halfCard: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    padding: 14,
    marginBottom: 10,
  },
  textLineLong: {
    width: '75%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EAE4DC',
    marginBottom: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F1ECE4',
    marginVertical: 6,
  },
  textLineMedium: {
    width: '55%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EAE4DC',
  },
  policyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  policyCard: {
    flex: 1,
    height: 96,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  specsSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  specsHeaderLine: {
    width: 180,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EAE4DC',
    marginBottom: 10,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  specBoxWrapper: {
    width: '50%',
    padding: 4,
  },
  specBox: {
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recomSection: {
    marginTop: 8,
  },
  recomHeaderLine: {
    width: 160,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EAE4DC',
    marginBottom: 10,
  },
  recomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  recomCard: {
    width: 140,
    height: 200,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
});
