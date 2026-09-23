import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastPayload {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let toastListener: ((payload: ToastPayload) => void) | null = null;

export const showToast = (payload: ToastPayload): void => {
  if (toastListener) {
    toastListener(payload);
  }
};

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'error':
      return {
        borderColor: '#EF4444',
        iconName: 'alert-circle',
        iconColor: '#EF4444',
        iconBg: 'rgba(239, 68, 68, 0.15)',
      };
    case 'success':
      return {
        borderColor: '#10B981',
        iconName: 'check-circle',
        iconColor: '#10B981',
        iconBg: 'rgba(16, 185, 129, 0.15)',
      };
    case 'warning':
    case 'info':
    default:
      return {
        borderColor: '#F59E0B',
        iconName: 'information',
        iconColor: '#F59E0B',
        iconBg: 'rgba(245, 158, 11, 0.15)',
      };
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MitrenoToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [opacity, translateY]);

  useEffect(() => {
    toastListener = (payload: ToastPayload) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      translateY.stopAnimation();
      opacity.stopAnimation();

      setToast(payload);
      translateY.setValue(-80);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 16,
          stiffness: 160,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = payload.duration ?? 3000;
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
  }, [handleDismiss, opacity, translateY]);

  if (!toast) {
    return null;
  }

  const config = getToastConfig(toast.type);

  return (
    <View pointerEvents="box-none" style={styles.absoluteContainer}>
      <AnimatedPressable
        pointerEvents="auto"
        onPress={handleDismiss}
        style={[
          styles.cardContainer,
          {
            top: insets.top + 8,
            borderColor: config.borderColor,
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
          <Icon name={config.iconName} size={20} color={config.iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {toast.title}
          </Text>
          {Boolean(toast.message) && (
            <Text style={styles.message} numberOfLines={3}>
              {toast.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeButton}
        >
          <Icon name="close" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
  },
  cardContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999999,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  message: {
    fontSize: 12,
    fontWeight: '500',
    color: '#CBD5E1',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
