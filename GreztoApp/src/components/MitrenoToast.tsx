import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  PanResponder,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastPayload {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
  image?: string;
  onPress?: () => void;
}

let toastListener: ((payload: ToastPayload) => void) | null = null;

export const showToast = (payload: ToastPayload): void => {
  if (toastListener) {
    toastListener(payload);
  }
};

export const MitrenoToast = showToast;

interface ToastVisualConfig {
  iconName: string;
  iconColor: string;
  iconBg: string;
  accentBorder: string;
}

const getToastConfig = (type: ToastType, customIcon?: string): ToastVisualConfig => {
  switch (type) {
    case 'error':
      return {
        iconName: customIcon || 'alert-circle-outline',
        iconColor: '#F87171',
        iconBg: 'rgba(239, 68, 68, 0.16)',
        accentBorder: 'rgba(239, 68, 68, 0.22)',
      };
    case 'success':
      return {
        iconName: customIcon || 'check-circle-outline',
        iconColor: '#34D399',
        iconBg: 'rgba(16, 185, 129, 0.16)',
        accentBorder: 'rgba(16, 185, 129, 0.22)',
      };
    case 'warning':
      return {
        iconName: customIcon || 'alert-circle-outline',
        iconColor: '#FBBF24',
        iconBg: 'rgba(245, 158, 11, 0.16)',
        accentBorder: 'rgba(245, 158, 11, 0.22)',
      };
    case 'info':
    default:
      return {
        iconName: customIcon || 'bell-ring-outline',
        iconColor: '#38BDF8',
        iconBg: 'rgba(56, 189, 248, 0.16)',
        accentBorder: 'rgba(56, 189, 248, 0.22)',
      };
  }
};

export const MitrenoToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeToastRef = useRef<ToastPayload | null>(null);

  activeToastRef.current = toast;

  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.90,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [opacity, translateY, scale]);

  // Touch and Swipe-Up to Dismiss Gesture Recognizer
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 4;
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped upwards or flicked up, dismiss immediately
        if (gestureState.dy < -12 || gestureState.vy < -0.4) {
          handleDismiss();
        } else if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          // Clean tap without drag
          if (activeToastRef.current?.onPress) {
            activeToastRef.current.onPress();
          }
          handleDismiss();
        }
      },
    })
  ).current;

  useEffect(() => {
    toastListener = (payload: ToastPayload) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      translateY.stopAnimation();
      opacity.stopAnimation();
      scale.stopAnimation();

      setToast(payload);
      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.92);

      // Apple Dynamic Island luxury fluid spring entrance physics
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 14,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 5,
          speed: 15,
        }),
      ]).start();

      const duration = payload.duration ?? 3500;
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    };

    return () => {
      toastListener = null;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [handleDismiss, opacity, translateY, scale]);

  if (!toast) {
    return null;
  }

  const config = getToastConfig(toast.type, toast.icon);
  const topSafeOffset = Math.max(insets.top, Platform.OS === 'android' ? 20 : 24) + 6;

  return (
    <View pointerEvents="box-none" style={[styles.absoluteContainer, { top: topSafeOffset }]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.pillCapsule,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        {/* Generous 44x44 Circular Icon Backdrop or Image Thumbnail */}
        {toast.image ? (
          <Image
            source={{ uri: toast.image }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
            <Icon name={config.iconName} size={22} color={config.iconColor} />
          </View>
        )}

        {/* High-Clarity Typography Column */}
        <View style={styles.textColumn}>
          <Text style={styles.titleText} numberOfLines={1}>
            {toast.title}
          </Text>
          {Boolean(toast.message) && (
            <Text style={styles.messageText} numberOfLines={2}>
              {toast.message}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pillCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '94%',
    maxWidth: 500, // Luxury balanced proportion on tablets & wide screens
    backgroundColor: '#181A20', // Matte Obsidian Charcoal (Benchmark Reference)
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)', // Crisp razor-thin luxury edge
    paddingVertical: 14,
    paddingHorizontal: 16,
    // Deep diffused ambient drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 16,
  },
  thumbnailImage: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: '#262A34',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF', // High-contrast crisp pure white
    letterSpacing: -0.2,
  },
  messageText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#94A3B8', // Legible Slate-400
    lineHeight: 18.5,
    marginTop: 3,
  },
});
