import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastPayload {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onPress?: () => void;
}

let toastListener: ((payload: ToastPayload) => void) | null = null;

export const showToast = (payload: ToastPayload): void => {
  if (toastListener) {
    toastListener(payload);
  }
};

export const MitrenoToast = showToast;

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'error':
      return {
        glowBorder: 'rgba(239, 68, 68, 0.40)',
        iconName: 'alert-circle',
        iconColor: '#F87171',
        iconBg: 'rgba(239, 68, 68, 0.18)',
        indicatorColor: '#EF4444',
      };
    case 'success':
      return {
        glowBorder: 'rgba(16, 185, 129, 0.40)',
        iconName: 'check-circle',
        iconColor: '#34D399',
        iconBg: 'rgba(16, 185, 129, 0.18)',
        indicatorColor: '#10B981',
      };
    case 'warning':
      return {
        glowBorder: 'rgba(245, 158, 11, 0.40)',
        iconName: 'alert-decagram',
        iconColor: '#FBBF24',
        iconBg: 'rgba(245, 158, 11, 0.18)',
        indicatorColor: '#F59E0B',
      };
    case 'info':
    default:
      return {
        glowBorder: 'rgba(59, 130, 246, 0.40)',
        iconName: 'information',
        iconColor: '#60A5FA',
        iconBg: 'rgba(59, 130, 246, 0.18)',
        indicatorColor: '#3B82F6',
      };
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MitrenoToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.90,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [opacity, translateY, scale]);

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
      translateY.setValue(-100);
      opacity.setValue(0);
      scale.setValue(0.88);

      // Apple Dynamic Island fluid spring physics
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 7,
          speed: 15,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 6,
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

  const config = getToastConfig(toast.type);
  const topSafeOffset = Math.max(insets.top, Platform.OS === 'android' ? 14 : 20) + 6;

  return (
    <View pointerEvents="box-none" style={[styles.absoluteContainer, { top: topSafeOffset }]}>
      <AnimatedPressable
        pointerEvents="auto"
        onPress={() => {
          if (toast?.onPress) {
            toast.onPress();
          }
          handleDismiss();
        }}
        style={[
          styles.pillCapsule,
          {
            borderColor: config.glowBorder,
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        {/* Subtle Indicator Glow Dot */}
        <View style={[styles.indicatorDot, { backgroundColor: config.indicatorColor }]} />

        {/* Minimalist Rounded Icon */}
        <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
          <Icon name={config.iconName} size={16} color={config.iconColor} />
        </View>

        {/* Content Column */}
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

        {/* Minimal Close Target */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.closeBtn}
        >
          <Icon name="close" size={14} color="#71717A" />
        </TouchableOpacity>
      </AnimatedPressable>
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
    maxWidth: 390,
    width: '100%',
    backgroundColor: '#09090B', // Deep Obsidian Velvet Glass
    borderRadius: 26,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    // Modern Floating Ambient Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 14,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
    marginRight: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  titleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FAFAFA', // Crisp Snow White
    letterSpacing: 0.2,
  },
  messageText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A1A1AA', // Subtle Luxury Silver-Grey
    marginTop: 1.5,
    lineHeight: 15,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
