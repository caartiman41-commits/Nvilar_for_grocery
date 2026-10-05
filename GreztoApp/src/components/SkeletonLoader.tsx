import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * SkeletonLoader: 60FPS Hardware-Accelerated Shimmer / Pulse Placeholder
 * High-luxury fashion aesthetic using subtle neutral tones (#E2E8F0 -> #F1F5F9).
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = memo(({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  children,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
});
