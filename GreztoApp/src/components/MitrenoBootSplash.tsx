import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Easing,
} from 'react-native';

interface MitrenoBootSplashProps {
  onAnimationComplete?: () => void;
}

/**
 * MitrenoBootSplash: Locked Demo B NVILAR 4K Vector-Scale Boot Splash Screen
 * - Background: Gallery Off-White (#F5F5F0)
 * - Master Lockup: 3D Ribbon Icon (Obsidian #1A1A1A -> Sovereign Cobalt-Indigo #28488A) + Obsidian NVILΛR Wordmark
 */
export const MitrenoBootSplash: React.FC<MitrenoBootSplashProps> = memo(
  ({ onAnimationComplete }) => {
    const logoScale = useRef(new Animated.Value(0.86)).current;
    const logoTranslateY = useRef(new Animated.Value(16)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    const progressScaleX = useRef(new Animated.Value(0)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.sequence([
        // Step 1: Smooth spring entrance of the Locked Demo B Master Logo
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 64,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(logoTranslateY, {
            toValue: 0,
            tension: 64,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(progressScaleX, {
            toValue: 1,
            duration: 720,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        // Step 2: Brief hold on the crisp 4K Demo B Lockup, then smooth fade out
        Animated.delay(240),
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }, [
      containerOpacity,
      logoOpacity,
      logoScale,
      logoTranslateY,
      onAnimationComplete,
      progressScaleX,
    ]);

    return (
      <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.brandBox}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [
                  { translateY: logoTranslateY },
                  { scale: logoScale },
                ],
              },
            ]}
          >
            <Image
              source={require('../assets/nvilar_logo_stacked.png')}
              style={styles.demoBMasterLogo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Sleek Animated Sovereign Cobalt-Indigo Progress Bar */}
        <View style={styles.loaderSlot}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  transform: [{ scaleX: progressScaleX }],
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    );
  },
);

MitrenoBootSplash.displayName = 'MitrenoBootSplash';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#F5F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  brandBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBMasterLogo: {
    width: 288,
    height: 192,
  },
  loaderSlot: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
  },
  progressTrack: {
    width: 148,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E4E9',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#00863A',
  },
});


